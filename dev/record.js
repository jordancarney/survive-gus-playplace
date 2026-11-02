// Voice recorder for Jonathan's and Timmy's cutscene lines. Not part of the game — open
// dev/record.html on the local server, in Chrome or Safari (they ask for the microphone).
//
// Every shot in story.js with a `voice` id is listed here. A take is recorded straight from
// the microphone, trimmed of the quiet at both ends, evened out in volume and downloaded as
// gus-voice-<id>.wav. dev/add_voices.py then turns those into the game's audio/voices/<id>.m4a.
import { SCRIPTS } from '../js/story.js';
import { RECORDED } from '../js/recorded.js';
import { audio, sfx, WHISPERS } from '../js/audio.js';

// Sounds that aren't cutscene lines. Timmy's crying plays in the ball pit on Night 2; until
// it's recorded the game makes its own, which you can hear here to compare.
const SOUNDS = [
  { voice: 'cry-1', who: 'Timmy', line: '(Crying all alone in the ball pit: sobbing, sniffling, a big wail. ' +
    'About 4 seconds — it plays over and over until Jonathan finds him.)', hear: 'cry' },
  // Nightmare's whispers: whisper each one slowly, right up close to the microphone.
  ...WHISPERS.map((line, i) => ({ voice: `whisper-${i + 1}`, who: 'Whisper', line: `${line}  (whisper it, slow and creepy)`, hear: 'whisper' })),
];

const $ = (id) => document.getElementById(id);
const SAVED_KEY = 'survive_gus_voice_saves';

// Story order, not file order.
const ORDER = ['intro', 'timmyMeet', 'timmyNumber', 'gramma', 'blackout', 'home', 'homeDone', 'newWing', 'haywire', 'oldJohn'];
const SCENES = {
  intro: 'The intro: getting the job', timmyMeet: 'Night 2: finding Timmy',
  timmyNumber: 'The next morning', gramma: 'Calling Timmy\'s gramma',
  blackout: 'Before Night 2: the lights flicker', home: 'After Night 10: going home',
  homeDone: 'The van takes them back', newWing: 'Day 11: the new wing',
  haywire: 'Before Night 20: Gus goes haywire', oldJohn: 'After Night 21: meeting Old John',
};

const saved = (() => { try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || {}; } catch { return {}; } })();
const remember = () => { try { localStorage.setItem(SAVED_KEY, JSON.stringify(saved)); } catch {} };

// ── The microphone ──────────────────────────────────────────────────────

let ctx = null;
let stream = null;
let rec = null;   // the take being recorded: { id, chunks, src, proc, analyser, raf }

async function mic() {
  if (!ctx) ctx = new AudioContext();
  await ctx.resume();
  if (!stream) {
    // Noise suppression on (a quiet room isn't guaranteed); echo cancellation off, it dulls voices.
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: true },
    });
  }
}

async function startTake(id, ui) {
  if (rec) stopTake();
  try { await mic(); } catch (e) {
    $('error').textContent = 'The microphone didn\'t turn on. Allow microphone access for this page and try again.';
    $('error').hidden = false;
    return;
  }
  $('error').hidden = true;
  const src = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  // A ScriptProcessor is old but works everywhere, and this is a dev tool.
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  const chunks = [];
  proc.onaudioprocess = (e) => chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  src.connect(analyser);
  src.connect(proc);
  proc.connect(ctx.destination);   // it only runs while connected; it outputs silence
  const buf = new Float32Array(analyser.fftSize);
  const meter = () => {
    analyser.getFloatTimeDomainData(buf);
    let peak = 0;
    for (const v of buf) peak = Math.max(peak, Math.abs(v));
    ui.meter.style.width = Math.min(100, peak * 140) + '%';
    rec.raf = requestAnimationFrame(meter);
  };
  rec = { id, ui, chunks, src, proc, analyser, raf: 0 };
  meter();
  setState(ui, 'recording');
}

function stopTake() {
  if (!rec) return;
  const { id, ui, chunks, src, proc, analyser, raf } = rec;
  rec = null;
  cancelAnimationFrame(raf);
  src.disconnect();
  proc.disconnect();
  analyser.disconnect();
  ui.meter.style.width = '0';
  const take = polish(join(chunks), ctx.sampleRate);
  if (!take) { setState(ui, 'idle', 'Didn\'t hear anything — try again a bit louder.'); return; }
  if (ui.url) URL.revokeObjectURL(ui.url);
  ui.wav = wav(take, ctx.sampleRate);
  ui.url = URL.createObjectURL(ui.wav);
  ui.audio.src = ui.url;
  setState(ui, 'taken', `${(take.length / ctx.sampleRate).toFixed(1)} seconds`);
  ui.audio.play();
}

function join(chunks) {
  const out = new Float32Array(chunks.reduce((n, c) => n + c.length, 0));
  let i = 0;
  for (const c of chunks) { out.set(c, i); i += c.length; }
  return out;
}

// Cut the quiet off both ends (keeping a breath of it), and turn it up to a steady level.
function polish(s, rate) {
  let peak = 0;
  for (const v of s) peak = Math.max(peak, Math.abs(v));
  if (peak < 0.02) return null;
  const gate = Math.max(0.015, peak * 0.06);
  let a = 0, b = s.length - 1;
  while (a < b && Math.abs(s[a]) < gate) a++;
  while (b > a && Math.abs(s[b]) < gate) b--;
  a = Math.max(0, a - Math.round(rate * 0.12));
  b = Math.min(s.length - 1, b + Math.round(rate * 0.25));
  const out = s.slice(a, b + 1);
  const gain = 0.89 / peak;
  const fade = Math.round(rate * 0.01);
  for (let i = 0; i < out.length; i++) {
    const edge = Math.min(1, i / fade, (out.length - 1 - i) / fade);
    out[i] *= gain * edge;
  }
  return out;
}

// 16-bit mono WAV.
function wav(samples, rate) {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const str = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); str(8, 'WAVE');
  str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const x = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true);
  }
  return new Blob([buf], { type: 'audio/wav' });
}

// ── The list ────────────────────────────────────────────────────────────

const all = [];

function setState(ui, state, note = '') {
  ui.box.classList.toggle('recording', state === 'recording');
  ui.box.classList.toggle('saved', !!saved[ui.id]);
  ui.rec.textContent = state === 'recording' ? '■ Stop' : '● Record';
  ui.rec.className = state === 'recording' ? 'stop' : 'rec';
  ui.listen.disabled = !ui.url || state === 'recording';
  ui.save.disabled = !ui.wav || state === 'recording';
  const inGame = (ui.id in RECORDED);
  ui.status.className = 'status' + (saved[ui.id] || inGame ? ' ok' : '');
  ui.status.textContent = state === 'recording' ? 'Recording… say the line!' :
    [note, saved[ui.id] ? '✓ Saved to Downloads' : '', inGame ? '✓ In the game' : ''].filter(Boolean).join(' · ');
}

function progress() {
  const done = all.filter((ui) => saved[ui.id] || (ui.id in RECORDED)).length;
  $('progress').textContent = `${done} of ${all.length} lines recorded`;
}

function heading(text) {
  const h = document.createElement('h2');
  h.textContent = text.toUpperCase();
  $('lines').appendChild(h);
}

// The game's own version of a sound, played through the game's audio.
function hearGame(kind) {
  if (!audio.ready) audio.init();
  audio.resume();
  setTimeout(() => {
    if (kind === 'cry') sfx.cry({ x: 0, z: 0.5 });
    if (kind === 'whisper') sfx.whisper(true);
  }, 120);
}

function build() {
  for (const key of ORDER) {
    const shots = SCRIPTS[key].shots;
    if (!shots.some((s) => s.voice)) continue;
    heading(SCENES[key]);
    shots.forEach((s, i) => {
      if (s.voice) addLine(s, shots.slice(0, i).reverse().find((p) => p.line));
    });
  }
  heading('Sounds');
  for (const s of SOUNDS) addLine(s, null);
  progress();
}

function addLine(s, prev) {
  const box = document.createElement('div');
  box.className = 'line';
  box.innerHTML = `
    ${prev ? `<div class="before">${prev.who ? prev.who + ': ' : ''}${prev.line}</div>` : ''}
    <div class="who ${s.who}">${s.who.toUpperCase()}</div>
    <div class="text"></div>
    <div class="row">
      <button class="rec">● Record</button>
      <button class="listen">▶ Listen</button>
      <button class="save">💾 Save</button>
      ${s.hear ? '<button class="hear">🔊 Hear the game\'s</button>' : ''}
      <div class="meter"><div></div></div>
    </div>
    <div class="status"></div>`;
  if (s.hear) box.querySelector('.hear').addEventListener('click', () => hearGame(s.hear));
  box.querySelector('.text').textContent = s.line;
  const ui = {
    id: s.voice, box, audio: new Audio(), url: null, wav: null,
    rec: box.querySelector('.rec'), listen: box.querySelector('.listen'), save: box.querySelector('.save'),
    meter: box.querySelector('.meter div'), status: box.querySelector('.status'),
  };
  ui.rec.addEventListener('click', () => {
    if (rec && rec.ui === ui) stopTake(); else startTake(ui.id, ui);
  });
  ui.listen.addEventListener('click', () => { ui.audio.currentTime = 0; ui.audio.play(); });
  ui.save.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = ui.url;
    a.download = `gus-voice-${ui.id}.wav`;
    a.click();
    saved[ui.id] = true;
    remember();
    setState(ui, 'taken');
    progress();
  });
  all.push(ui);
  setState(ui, 'idle');
  $('lines').appendChild(box);
}

build();
