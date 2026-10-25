// Every sound in the game, synthesized at runtime. No audio files, nothing to download.
//
// Browsers refuse to start an AudioContext until the player has interacted with the page,
// so `resume()` is called from the first click/keypress and everything before that is a
// no-op rather than an error.
//
// The night is mostly silence on purpose. What you do hear is positional: footsteps, the
// clank of a machine, Gus's music box — panned left or right and muffled through walls, so
// your ears can tell you where things are before the cameras do.

let ctx = null;
let master = null;
let musicGain = null;
let sfxGain = null;
let ambGain = null;
let echoIn = null;

export const audio = {
  enabled: true,
  ready: false,
  // Set by the game: returns true when there's a wall between the listener and `pos`.
  occluded: null,

  init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { this.enabled = false; return; }
    ctx = new AC();

    // A compressor on the bus keeps the jumpscare loud without clipping into mush.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 6;
    comp.connect(ctx.destination);

    master = ctx.createGain();
    master.gain.value = 0.6;
    master.connect(comp);

    sfxGain = ctx.createGain();
    sfxGain.connect(master);

    musicGain = ctx.createGain();
    musicGain.gain.value = 0.34;
    musicGain.connect(master);

    ambGain = ctx.createGain();
    ambGain.gain.value = 1;
    ambGain.connect(master);

    // A feedback echo for the music box — it's what makes three notes sound like a hallway.
    echoIn = ctx.createGain();
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.33;
    const fb = ctx.createGain();
    fb.gain.value = 0.42;
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 2400;
    echoIn.connect(delay);
    delay.connect(tone).connect(fb).connect(delay);
    tone.connect(master);

    this.ready = true;
  },

  resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); },

  setVolume(v) { if (master) master.gain.value = Math.max(0, Math.min(1, v)); },
};

const now = () => (ctx ? ctx.currentTime : 0);
const ok = () => audio.enabled && audio.ready && ctx.state === 'running';

// ── Listener and positional sound ───────────────────────────────────────

const L = { x: 0, z: 0, yaw: 0 };
export function setListener(x, z, yaw) { L.x = x; L.z = z; L.yaw = yaw; }

// A gain+pan pair routed to the sfx bus, or null if `pos` is out of earshot.
function spatial(pos, range = 30) {
  const dx = pos.x - L.x;
  const dz = pos.z - L.z;
  const d = Math.hypot(dx, dz);
  if (d > range) return null;
  let g = 1 - d / range;
  g *= g;
  if (d > 2 && audio.occluded && audio.occluded(pos)) g *= 0.4;
  if (g < 0.003) return null;
  // The camera looks down -Z at yaw 0; its right hand is (cos yaw, -sin yaw).
  const right = dx * Math.cos(L.yaw) - dz * Math.sin(L.yaw);
  const pan = Math.max(-1, Math.min(1, right / Math.max(d, 0.001))) * 0.85;
  const gain = ctx.createGain();
  gain.gain.value = g;
  if (ctx.createStereoPanner) {
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    gain.connect(p).connect(sfxGain);
  } else {
    gain.connect(sfxGain);
  }
  return gain;
}

// ── Primitives ──────────────────────────────────────────────────────────

function tone({ freq = 440, to = null, type = 'sine', dur = 0.15, gain = 0.3, delay = 0,
                at = null, dest = null, attack = 0.005, curve = null }) {
  const t = at !== null ? at : now() + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let out = g;
  if (curve) {
    const ws = ctx.createWaveShaper();
    ws.curve = curve;
    g.connect(ws);
    out = ws;
  }
  osc.connect(g);
  out.connect(dest || sfxGain);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

// One reusable noise buffer — generating a fresh one per sound shows up in profiles.
let noiseBuf = null;
function noiseBuffer() {
  if (noiseBuf) return noiseBuf;
  const len = ctx.sampleRate * 1.0;
  noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

function noise({ dur = 0.15, gain = 0.25, delay = 0, at = null, filter = 'lowpass',
                 freq = 1200, to = null, q = 1, dest = null, attack = 0 }) {
  const t = at !== null ? at : now() + delay;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer();
  src.loop = true;
  src.loopStart = Math.random() * 0.5;
  const f = ctx.createBiquadFilter();
  f.type = filter;
  f.frequency.setValueAtTime(freq, t);
  if (to !== null) f.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
  f.Q.value = q;
  const g = ctx.createGain();
  if (attack > 0) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
  } else {
    g.gain.setValueAtTime(gain, t);
  }
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(dest || sfxGain);
  src.start(t, src.loopStart);
  src.stop(t + dur + 0.02);
}

let distCurve = null;
function distortion() {
  if (distCurve) return distCurve;
  const n = 1024;
  distCurve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    distCurve[i] = Math.tanh(x * 6);
  }
  return distCurve;
}

// ── Animatronic footsteps — each one sounds like what it is ─────────────

const STEPS = {
  gerald(d) {
    tone({ freq: 72, to: 38, type: 'sine', dur: 0.22, gain: 0.55, dest: d });
    noise({ dur: 0.12, gain: 0.25, freq: 320, to: 120, dest: d });
  },
  cranker(d) {
    tone({ freq: 980, to: 640, type: 'square', dur: 0.05, gain: 0.08, dest: d });
    noise({ dur: 0.05, gain: 0.14, freq: 1800, dest: d });
  },
  chomper(d) {
    noise({ dur: 0.05, gain: 0.2, freq: 1500, to: 600, dest: d });
    tone({ freq: 240, to: 170, type: 'triangle', dur: 0.06, gain: 0.12, dest: d });
  },
  flipper(d) {
    noise({ dur: 0.12, gain: 0.22, filter: 'bandpass', freq: 700, to: 260, q: 3, dest: d });
  },
  gus(d) {
    tone({ freq: 310, type: 'triangle', dur: 0.12, gain: 0.16, dest: d });
    tone({ freq: 467, type: 'triangle', dur: 0.09, gain: 0.1, dest: d });
    noise({ dur: 0.1, gain: 0.2, freq: 600, to: 200, dest: d });
  },
  junk(d) {
    tone({ freq: 60, to: 32, type: 'sine', dur: 0.3, gain: 0.6, dest: d });
    noise({ dur: 0.25, gain: 0.3, filter: 'bandpass', freq: 900, to: 300, q: 2, dest: d });
    tone({ freq: 520, type: 'square', dur: 0.05, gain: 0.05, delay: 0.06, dest: d });
  },
  kid(d) { noise({ dur: 0.04, gain: 0.05, freq: 1400, dest: d }); },
};

// ── Sound effects ───────────────────────────────────────────────────────

export const sfx = {
  ui()     { if (ok()) tone({ freq: 620, to: 780, type: 'square', dur: 0.05, gain: 0.09 }); },
  uiBack() { if (ok()) tone({ freq: 520, to: 380, type: 'square', dur: 0.05, gain: 0.08 }); },

  step(id, pos) {
    if (!ok()) return;
    const d = spatial(pos, id === 'gerald' || id === 'junk' ? 34 : 26);
    if (d) (STEPS[id] || STEPS.chomper)(d);
  },

  // The whirr of a motor turning a head — what you hear when one is right next to you.
  servo(pos) {
    if (!ok()) return;
    const d = spatial(pos, 10);
    if (d) tone({ freq: 140, to: 210, type: 'sawtooth', dur: 0.35, gain: 0.05, dest: d });
  },

  // ── Weapons
  zap() {
    if (!ok()) return;
    noise({ dur: 0.28, gain: 0.3, filter: 'bandpass', freq: 3200, to: 1400, q: 5 });
    tone({ freq: 1800, to: 600, type: 'sawtooth', dur: 0.25, gain: 0.14 });
    tone({ freq: 60, type: 'square', dur: 0.25, gain: 0.08 });
  },
  zapFizzle() {
    if (!ok()) return;
    noise({ dur: 0.18, gain: 0.16, filter: 'bandpass', freq: 2200, to: 500, q: 4 });
    tone({ freq: 400, to: 90, type: 'square', dur: 0.2, gain: 0.08 });
  },
  zapEmpty() { if (ok()) tone({ freq: 240, to: 160, type: 'square', dur: 0.06, gain: 0.07 }); },
  throwBall() { if (ok()) noise({ dur: 0.16, gain: 0.14, filter: 'bandpass', freq: 900, to: 2400, q: 2 }); },
  bonk(pos) {
    if (!ok()) return;
    const d = spatial(pos, 30);
    if (!d) return;
    tone({ freq: 880, to: 420, type: 'triangle', dur: 0.14, gain: 0.3, dest: d });
    tone({ freq: 1320, to: 700, type: 'sine', dur: 0.1, gain: 0.14, dest: d });
  },
  ballBounce(pos) {
    if (!ok()) return;
    const d = spatial(pos, 18);
    if (d) tone({ freq: 300, to: 180, type: 'sine', dur: 0.06, gain: 0.16, dest: d });
  },
  knife() {
    if (!ok()) return;
    noise({ dur: 0.12, gain: 0.16, filter: 'highpass', freq: 3000, to: 7000 });
  },
  knifeHit() {
    if (!ok()) return;
    tone({ freq: 2200, to: 1500, type: 'square', dur: 0.06, gain: 0.08 });
    noise({ dur: 0.2, gain: 0.2, filter: 'bandpass', freq: 3600, to: 1200, q: 4 });
  },
  clink() { if (ok()) tone({ freq: 2600, to: 2100, type: 'triangle', dur: 0.12, gain: 0.12 }); },
  magnum() {
    if (!ok()) return;
    tone({ freq: 180, to: 34, type: 'square', dur: 0.4, gain: 0.5, curve: distortion() });
    noise({ dur: 0.55, gain: 0.5, freq: 3600, to: 120 });
    noise({ dur: 1.2, gain: 0.08, freq: 600, to: 90, delay: 0.1 });   // the room ringing
  },
  dryFire() { if (ok()) tone({ freq: 1400, to: 1200, type: 'square', dur: 0.03, gain: 0.08 }); },
  pickup() {
    if (!ok()) return;
    tone({ freq: 700, type: 'sine', dur: 0.08, gain: 0.14 });
    tone({ freq: 1050, type: 'sine', dur: 0.1, gain: 0.12, delay: 0.07 });
  },
  flashlight() { if (ok()) tone({ freq: 2400, to: 1800, type: 'square', dur: 0.02, gain: 0.05 }); },

  // ── Animatronics
  powerDown(pos) {
    if (!ok()) return;
    const d = spatial(pos, 30) || sfxGain;
    tone({ freq: 620, to: 60, type: 'sawtooth', dur: 1.1, gain: 0.2, dest: d });
    noise({ dur: 0.5, gain: 0.2, filter: 'bandpass', freq: 3000, to: 400, q: 3, dest: d });
  },
  reboot(pos) {
    if (!ok()) return;
    const d = spatial(pos, 30);
    if (!d) return;
    tone({ freq: 80, to: 520, type: 'sawtooth', dur: 0.9, gain: 0.16, dest: d });
    tone({ freq: 1040, type: 'square', dur: 0.06, gain: 0.06, delay: 0.95, dest: d });
  },
  stagger(pos) {
    if (!ok()) return;
    const d = spatial(pos, 30) || sfxGain;
    tone({ freq: 400, to: 160, type: 'square', dur: 0.3, gain: 0.12, dest: d });
  },
  clang() {
    if (!ok()) return;
    tone({ freq: 210, type: 'triangle', dur: 0.8, gain: 0.3 });
    tone({ freq: 317, type: 'triangle', dur: 0.6, gain: 0.2 });
    tone({ freq: 523, type: 'triangle', dur: 0.4, gain: 0.12 });
    noise({ dur: 0.35, gain: 0.3, freq: 1600, to: 200 });
  },
  // Spotted. A sharp sting so a chase never starts in silence.
  spotted() {
    if (!ok()) return;
    tone({ freq: 220, to: 233, type: 'sawtooth', dur: 0.7, gain: 0.12 });
    tone({ freq: 311, to: 330, type: 'sawtooth', dur: 0.7, gain: 0.1 });
    noise({ dur: 0.5, gain: 0.12, filter: 'highpass', freq: 4000, attack: 0.05 });
  },
  slideWindup(pos) {
    if (!ok()) return;
    const d = spatial(pos, 30);
    if (d) tone({ freq: 300, to: 1200, type: 'square', dur: 0.55, gain: 0.08, dest: d });
  },
  slide(pos) {
    if (!ok()) return;
    const d = spatial(pos, 34);
    if (d) noise({ dur: 1.0, gain: 0.3, filter: 'bandpass', freq: 600, to: 1800, q: 1.5, dest: d });
  },
  crash(pos) {
    if (!ok()) return;
    const d = spatial(pos, 34) || sfxGain;
    noise({ dur: 0.4, gain: 0.45, freq: 2200, to: 150, dest: d });
    tone({ freq: 110, to: 40, type: 'sine', dur: 0.35, gain: 0.4, dest: d });
  },
  chew(pos) {
    if (!ok()) return;
    const d = spatial(pos, 22);
    if (!d) return;
    for (let i = 0; i < 4; i++) {
      noise({ dur: 0.05, gain: 0.18, filter: 'bandpass', freq: 2400, q: 2, delay: i * 0.11, dest: d });
    }
  },
  pound(pos) {
    if (!ok()) return;
    const d = spatial(pos, 34);
    if (!d) return;
    tone({ freq: 90, to: 40, type: 'sine', dur: 0.25, gain: 0.5, dest: d });
    noise({ dur: 0.2, gain: 0.3, freq: 900, to: 200, dest: d });
    tone({ freq: 90, to: 40, type: 'sine', dur: 0.25, gain: 0.5, delay: 0.3, dest: d });
  },
  clicks(pos) {
    if (!ok()) return;
    const d = spatial(pos, 20);
    if (!d) return;
    for (let i = 0; i < 6; i++) {
      tone({ freq: 3200, type: 'square', dur: 0.012, gain: 0.08, delay: i * 0.05, dest: d });
    }
  },

  // ── Machines
  spark(pos) {
    if (!ok()) return;
    const d = spatial(pos, 16);
    if (d) noise({ dur: 0.08, gain: 0.2, filter: 'highpass', freq: 3000, dest: d });
  },
  breakdown(pos) {
    if (!ok()) return;
    const d = spatial(pos, 40) || sfxGain;
    tone({ freq: 700, to: 90, type: 'square', dur: 0.6, gain: 0.12, dest: d });
    noise({ dur: 0.3, gain: 0.2, filter: 'highpass', freq: 2500, dest: d });
  },
  repairGood(i = 0) { if (ok()) tone({ freq: 523 * Math.pow(2, (i % 8) / 12 * 2), type: 'square', dur: 0.07, gain: 0.08 }); },
  repairBad() {
    if (!ok()) return;
    tone({ freq: 160, type: 'sawtooth', dur: 0.22, gain: 0.14 });
    noise({ dur: 0.15, gain: 0.12, filter: 'highpass', freq: 2500 });
  },
  simon(i) {
    if (ok()) tone({ freq: [330, 415, 494, 659][i], type: 'triangle', dur: 0.3, gain: 0.16 });
  },
  fixed() {
    if (!ok()) return;
    [523, 659, 784, 1046].forEach((f, i) =>
      tone({ freq: f, type: 'square', dur: 0.14, gain: 0.09, delay: i * 0.07 }));
  },
  happy() {
    if (!ok()) return;
    tone({ freq: 1046, type: 'sine', dur: 0.2, gain: 0.1 });
    tone({ freq: 1568, type: 'sine', dur: 0.3, gain: 0.08, delay: 0.08 });
  },

  // ── Night
  camSwitch() {
    if (!ok()) return;
    noise({ dur: 0.14, gain: 0.12, filter: 'bandpass', freq: 3000, q: 0.8 });
    tone({ freq: 60, type: 'square', dur: 0.08, gain: 0.04 });
  },
  camOpen() {
    if (!ok()) return;
    tone({ freq: 400, to: 1200, type: 'sine', dur: 0.12, gain: 0.06 });
    noise({ dur: 0.2, gain: 0.08, filter: 'bandpass', freq: 3000, q: 0.8 });
  },
  camClose() { if (ok()) tone({ freq: 1200, to: 300, type: 'sine', dur: 0.12, gain: 0.06 }); },
  hour() {
    if (!ok()) return;
    tone({ freq: 880, type: 'sine', dur: 0.4, gain: 0.08 });
    tone({ freq: 660, type: 'sine', dur: 0.5, gain: 0.06, delay: 0.2 });
  },
  blackout() {
    if (!ok()) return;
    tone({ freq: 120, to: 25, type: 'sawtooth', dur: 1.6, gain: 0.3 });
    noise({ dur: 0.3, gain: 0.4, freq: 3000, to: 200 });
    tone({ freq: 60, to: 30, type: 'sine', dur: 2.0, gain: 0.3 });
  },
  powerOn() {
    if (!ok()) return;
    tone({ freq: 40, to: 120, type: 'sawtooth', dur: 1.0, gain: 0.18 });
    [0, 0.15, 0.3].forEach((d) => noise({ dur: 0.05, gain: 0.25, freq: 2000, delay: 0.6 + d }));
  },
  sixAM() {
    if (!ok()) return;
    // Bells — the best sound in the game.
    [784, 659, 523, 784, 1046].forEach((f, i) => {
      tone({ freq: f, type: 'triangle', dur: 1.2, gain: 0.18, delay: i * 0.38 });
      tone({ freq: f * 2.01, type: 'sine', dur: 0.8, gain: 0.05, delay: i * 0.38 });
    });
  },
  cheer() {
    if (!ok()) return;
    for (let i = 0; i < 14; i++) {
      const f = 500 + Math.random() * 700;
      tone({ freq: f, to: f * 1.4, type: 'triangle', dur: 0.25, gain: 0.03, delay: Math.random() * 0.6 });
    }
    noise({ dur: 1.2, gain: 0.08, filter: 'bandpass', freq: 1600, q: 0.6, attack: 0.1 });
  },

  // Super scary, as requested by the game's designer.
  scream() {
    if (!ok()) return;
    const c = distortion();
    tone({ freq: 210, to: 900, type: 'sawtooth', dur: 1.4, gain: 0.7, curve: c, attack: 0.01 });
    tone({ freq: 318, to: 1290, type: 'square', dur: 1.3, gain: 0.4, curve: c, attack: 0.01 });
    tone({ freq: 157, to: 600, type: 'sawtooth', dur: 1.5, gain: 0.5, attack: 0.01 });
    noise({ dur: 1.4, gain: 0.6, filter: 'bandpass', freq: 1800, to: 3800, q: 0.7 });
    tone({ freq: 90, to: 28, type: 'sine', dur: 0.8, gain: 0.8 });
  },

  // ── Bosses and friends
  bossHit(pos) {
    if (!ok()) return;
    const d = spatial(pos, 40) || sfxGain;
    tone({ freq: 300, to: 80, type: 'sawtooth', dur: 0.5, gain: 0.25, dest: d, curve: distortion() });
    noise({ dur: 0.4, gain: 0.25, filter: 'bandpass', freq: 2600, to: 500, q: 2, dest: d });
  },
  roar(pos) {
    if (!ok()) return;
    const d = spatial(pos, 60) || sfxGain;
    tone({ freq: 70, to: 140, type: 'sawtooth', dur: 1.4, gain: 0.4, dest: d, curve: distortion() });
    tone({ freq: 105, to: 60, type: 'square', dur: 1.4, gain: 0.25, dest: d });
    noise({ dur: 1.4, gain: 0.3, freq: 800, to: 300, dest: d, attack: 0.1 });
  },
  junkThrow(pos) {
    if (!ok()) return;
    const d = spatial(pos, 40);
    if (d) noise({ dur: 0.4, gain: 0.25, filter: 'bandpass', freq: 500, to: 1500, q: 2, dest: d });
  },
  junkLand(pos) {
    if (!ok()) return;
    const d = spatial(pos, 40);
    if (!d) return;
    noise({ dur: 0.35, gain: 0.4, freq: 1800, to: 200, dest: d });
    tone({ freq: 380, type: 'triangle', dur: 0.3, gain: 0.15, dest: d });
  },
  ouch() {
    if (!ok()) return;
    tone({ freq: 210, to: 110, type: 'sawtooth', dur: 0.2, gain: 0.2 });
    noise({ dur: 0.15, gain: 0.2, freq: 700, to: 200 });
  },
  friendly(pos) {
    if (!ok()) return;
    const d = spatial(pos, 30) || sfxGain;
    tone({ freq: 660, to: 990, type: 'sine', dur: 0.18, gain: 0.12, dest: d });
    tone({ freq: 990, to: 1320, type: 'sine', dur: 0.18, gain: 0.1, delay: 0.12, dest: d });
  },
  victory() {
    if (!ok()) return;
    [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) =>
      tone({ freq: f, type: 'triangle', dur: 0.45, gain: 0.16, delay: i * 0.14 }));
  },
};

// ── Ambience ────────────────────────────────────────────────────────────
//
// Night: the hum of a building with nobody in it, and every so often something you'd
// rather not have heard. Blackout: the hum stops.

let ambNodes = [];
let creepyTimer = null;

const CREEPY = [
  () => {   // a metal clank somewhere far away
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const g = ctx.createGain(); g.gain.value = 0.35;
    if (pan) { pan.pan.value = Math.random() * 2 - 1; g.connect(pan).connect(ambGain); } else g.connect(ambGain);
    tone({ freq: 180 + Math.random() * 120, type: 'triangle', dur: 0.9, gain: 0.12, dest: g });
    tone({ freq: 410 + Math.random() * 80, type: 'triangle', dur: 0.6, gain: 0.06, dest: g });
  },
  () => {   // a long creak
    noise({ dur: 1.6, gain: 0.06, filter: 'bandpass', freq: 300, to: 900, q: 18, dest: ambGain, attack: 0.3 });
  },
  () => {   // three notes of a music box, from nowhere
    const base = [659, 587, 523, 494][Math.floor(Math.random() * 4)];
    [0, 0.42, 0.84].forEach((d, i) => {
      tone({ freq: base * [1, 1.189, 0.891][i], type: 'sine', dur: 0.6, gain: 0.04, delay: d, dest: echoIn });
    });
  },
  () => {   // a squeaky toy
    tone({ freq: 1400, to: 1900, type: 'square', dur: 0.12, gain: 0.025, dest: ambGain });
    tone({ freq: 1900, to: 1300, type: 'square', dur: 0.14, gain: 0.02, delay: 0.16, dest: ambGain });
  },
  () => {   // air moving through the vents
    noise({ dur: 3.0, gain: 0.05, filter: 'bandpass', freq: 500, to: 250, q: 2, dest: ambGain, attack: 1.0 });
  },
  () => {   // something rolling across the floor
    for (let i = 0; i < 7; i++) {
      tone({ freq: 220 + i * 6, type: 'triangle', dur: 0.05, gain: 0.03, delay: i * 0.13, dest: ambGain });
    }
  },
];

export function startAmbience(kind) {
  stopAmbience();
  if (!audio.ready) return;
  if (kind === 'night') {
    for (const f of [55, 55.6, 110.3]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      g.gain.value = f > 100 ? 0.006 : 0.018;
      o.connect(g).connect(ambGain);
      o.start();
      ambNodes.push(o);
    }
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 180;
    const g = ctx.createGain(); g.gain.value = 0.035;
    src.connect(f).connect(g).connect(ambGain);
    src.start();
    ambNodes.push(src);
  }
  if (kind === 'night' || kind === 'blackout') {
    const loop = () => {
      creepyTimer = setTimeout(() => {
        if (ok()) CREEPY[Math.floor(Math.random() * CREEPY.length)]();
        loop();
      }, (kind === 'blackout' ? 5000 : 9000) + Math.random() * 12000);
    };
    loop();
  }
}

export function stopAmbience() {
  for (const n of ambNodes) { try { n.stop(); } catch {} }
  ambNodes = [];
  if (creepyTimer) clearTimeout(creepyTimer);
  creepyTimer = null;
}

// ── Gus's music box ─────────────────────────────────────────────────────
//
// When Gus leaves the stage he brings a tune with him, played from wherever he is. It's the
// most useful sound in the game: louder means closer, and the pan says which way.

// An original little waltz in E minor, three notes to the bar.
const BOX_TUNE = [
  659, 784, 988, 880, 784, 740, 659, 740, 784, 494, 0, 0,
  659, 784, 988, 1175, 988, 880, 784, 740, 659, 622, 0, 0,
];
let boxTimer = null;
let boxStep = 0;

export function startMusicBox(getPos) {
  stopMusicBox();
  if (!audio.ready) return;
  boxStep = 0;
  boxTimer = setInterval(() => {
    if (!ok()) return;
    const f = BOX_TUNE[boxStep % BOX_TUNE.length];
    boxStep++;
    const pos = getPos();
    if (!f || !pos) return;
    const d = spatial(pos, 42);
    if (!d) return;
    tone({ freq: f, type: 'sine', dur: 0.5, gain: 0.22, dest: d });
    tone({ freq: f * 2, type: 'sine', dur: 0.25, gain: 0.05, dest: d });
  }, 330);
}

export function stopMusicBox() {
  if (boxTimer) clearInterval(boxTimer);
  boxTimer = null;
}

// ── Music ───────────────────────────────────────────────────────────────
//
// Scheduled ahead on the audio clock rather than fired from timers, so the techno keeps
// time even when the frame rate doesn't.

const C2 = 65.41, A1 = 55, F1 = 43.65, G1 = 49.0, D2 = 73.42, E1 = 41.2;
const MAJ = [0, 4, 7, 12], MIN = [0, 3, 7, 12];
const semi = (f, s) => f * Math.pow(2, s / 12);

function kick(t) {
  tone({ freq: 150, to: 42, type: 'sine', dur: 0.2, gain: 0.5, at: t, dest: musicGain });
  tone({ freq: 2200, to: 900, type: 'square', dur: 0.01, gain: 0.05, at: t, dest: musicGain });
}
function clap(t) { noise({ dur: 0.12, gain: 0.18, filter: 'bandpass', freq: 1700, q: 1.2, at: t, dest: musicGain }); }
function hat(t, g = 0.06, d = 0.04) { noise({ dur: d, gain: g, filter: 'highpass', freq: 7500, at: t, dest: musicGain }); }

const TRACKS = {
  // Upbeat daytime techno. Four chords, four-on-the-floor, an arpeggio that never sits still.
  day: {
    stepDur: 60 / 128 / 4,
    length: 64,
    play(s, t) {
      const bar = Math.floor(s / 16) % 4;
      const chord = [[C2, MAJ], [A1, MIN], [F1, MAJ], [G1, MAJ]][bar];
      const i = s % 16;
      if (i % 4 === 0) kick(t);
      if (i === 4 || i === 12) clap(t);
      if (i % 4 === 2) hat(t, 0.07, 0.06); else hat(t, 0.025);
      // offbeat bass, octave-jumping on the last sixteenth
      if (i % 4 === 2 || i === 15) {
        tone({ freq: semi(chord[0], i === 15 ? 12 : 0), type: 'sawtooth', dur: 0.1, gain: 0.13,
               at: t, dest: musicGain });
      }
      const arp = [0, 1, 2, 3, 2, 1, 2, 3][i % 8];
      tone({ freq: semi(chord[0] * 4, chord[1][arp]), type: 'square', dur: 0.08,
             gain: 0.028, at: t, dest: musicGain });
      if (i === 0) {
        for (const n of chord[1].slice(0, 3)) {
          tone({ freq: semi(chord[0] * 8, n), type: 'triangle', dur: 0.3, gain: 0.03, at: t, dest: musicGain });
        }
      }
    },
  },

  // Title: a slow, lonely music box with a lot of echo.
  title: {
    stepDur: 0.42,
    length: 32,
    play(s, t) {
      const f = [659, 0, 784, 0, 740, 659, 0, 494, 523, 0, 587, 0, 494, 0, 0, 0,
                 659, 0, 784, 0, 988, 880, 0, 784, 740, 0, 659, 0, 622, 0, 0, 0][s % 32];
      if (f) {
        tone({ freq: f, type: 'sine', dur: 0.9, gain: 0.07, at: t, dest: echoIn });
        tone({ freq: f, type: 'sine', dur: 0.6, gain: 0.05, at: t, dest: musicGain });
      }
      if (s % 16 === 0) tone({ freq: E1 * 2, type: 'triangle', dur: 5, gain: 0.07, at: t, dest: musicGain });
    },
  },

  // Boss nights get a pulse. Minor, driving, a little too fast.
  boss: {
    stepDur: 60 / 142 / 4,
    length: 64,
    play(s, t) {
      const bar = Math.floor(s / 16) % 4;
      const chord = [[A1, MIN], [F1, MAJ], [D2 / 2, MIN], [E1, MAJ]][bar];
      const i = s % 16;
      if (i % 4 === 0) kick(t);
      if (i === 4 || i === 12) clap(t);
      if (i % 2 === 1) hat(t, 0.03);
      tone({ freq: semi(chord[0], i % 2 ? 12 : 0), type: 'sawtooth', dur: 0.08, gain: 0.1, at: t, dest: musicGain });
      if (i % 8 === 6) {
        tone({ freq: semi(chord[0] * 8, chord[1][1]), type: 'sawtooth', dur: 0.2, gain: 0.03, at: t, dest: musicGain });
      }
    },
  },

  // Friends: the day track's chords, slowed down and warm.
  friends: {
    stepDur: 60 / 100 / 4,
    length: 64,
    play(s, t) {
      const bar = Math.floor(s / 16) % 4;
      const chord = [[C2, MAJ], [G1, MAJ], [A1, MIN], [F1, MAJ]][bar];
      const i = s % 16;
      if (i % 8 === 0) kick(t);
      if (i % 4 === 2) hat(t, 0.03);
      if (i % 2 === 0) {
        const arp = [0, 1, 2, 3, 2, 1, 0, 2][(i / 2) % 8];
        tone({ freq: semi(chord[0] * 4, chord[1][arp]), type: 'triangle', dur: 0.25, gain: 0.06, at: t, dest: musicGain });
      }
      if (i === 0) tone({ freq: chord[0] * 2, type: 'triangle', dur: 2.2, gain: 0.1, at: t, dest: musicGain });
    },
  },
};

let seqTimer = null;
let currentTrack = null;
let nextTime = 0;
let musicStep = 0;

export function playMusic(name) {
  if (!audio.ready || currentTrack === name) return;
  stopMusic();
  const track = TRACKS[name];
  if (!track) return;
  currentTrack = name;
  musicStep = 0;
  nextTime = now() + 0.06;
  seqTimer = setInterval(() => {
    if (!ok()) { nextTime = now() + 0.06; return; }
    while (nextTime < now() + 0.12) {
      track.play(musicStep, nextTime);
      nextTime += track.stepDur;
      musicStep = (musicStep + 1) % track.length;
    }
  }, 25);
}

export function stopMusic() {
  if (seqTimer) clearInterval(seqTimer);
  seqTimer = null;
  currentTrack = null;
}
