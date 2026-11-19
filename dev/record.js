// Voice recorder for Jonathan's and Timmy's cutscene lines. Not part of the game — open
// dev/record.html on the local server, in Chrome or Safari (they ask for the microphone).
//
// Every shot in story.js with a `voice` id is listed here. A take is recorded straight from
// the microphone, trimmed of the quiet at both ends, evened out in volume and downloaded as
// gus-voice-<id>.wav. dev/add_voices.py then turns those into the game's audio/voices/<id>.m4a.
//
// The daytime song's lines are recorded differently: with headphones on, four clicks count
// you in and the band plays the line's two bars (the robots singing along, unless you turn
// them off) while you sing. The take is lined up with the beat by itself and kept the exact
// length of the line, so it lands on the beat in the game.
import { SCRIPTS } from '../js/story.js';
import { RECORDED } from '../js/recorded.js';
import { SONG } from '../js/song.js';
import { audio, sfx, WHISPERS, playSongLine, loadSong, clock, audioContext } from '../js/audio.js';

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
  if (rec.song) { stopSongTake(); return; }
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

// ── The song ────────────────────────────────────────────────────────────
//
// Recorded on the game's own audio clock (the same one that plays the count-in and the band),
// so where the line starts in the recording is known. The singer hears the band a little late
// (the output's latency) and the microphone hears them a little late too (its own), which is
// allowed for; then the take's loudness is matched against the line's notes to put it exactly
// on the beat.

const STEP = 60 / SONG.bpm / 4;
const LINE_SECONDS = SONG.lineSteps * STEP + 0.35;   // the line's two bars, and its ring
let songGuide = null;                                  // the "robots sing along" checkbox

async function startSongTake(i, ui) {
  if (rec) stopTake();
  if (!audio.ready) audio.init();
  audio.resume();
  const actx = audioContext();
  try {
    await mic();
    await actx.resume();
    await loadSong();
  } catch (e) {
    $('error').textContent = 'The microphone didn\'t turn on. Allow microphone access for this page and try again.';
    $('error').hidden = false;
    return;
  }
  $('error').hidden = true;
  const src = actx.createMediaStreamSource(stream);
  const analyser = actx.createAnalyser();
  analyser.fftSize = 1024;
  const proc = actx.createScriptProcessor(4096, 1, 1);
  const chunks = [];
  const song = { i, actx, firstAt: null, start: 0, end: 0, timer: 0 };
  proc.onaudioprocess = (e) => {
    if (song.firstAt === null) song.firstAt = actx.currentTime - e.inputBuffer.duration;
    chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  };
  src.connect(analyser);
  src.connect(proc);
  proc.connect(actx.destination);
  const { start, end } = playSongLine(i, clock() + 0.3, { guide: songGuide.checked });
  song.start = start;
  song.end = end;
  song.timer = setTimeout(() => { if (rec && rec.song === song) stopTake(); }, (end - clock() + 1.1) * 1000);
  const buf = new Float32Array(analyser.fftSize);
  const meter = () => {
    analyser.getFloatTimeDomainData(buf);
    let peak = 0;
    for (const v of buf) peak = Math.max(peak, Math.abs(v));
    ui.meter.style.width = Math.min(100, peak * 140) + '%';
    rec.raf = requestAnimationFrame(meter);
  };
  rec = { id: ui.id, ui, chunks, src, proc, analyser, raf: 0, song };
  meter();
  setState(ui, 'recording');
  ui.status.textContent = 'Listen for the four clicks, then sing!';
}

function stopSongTake() {
  const { ui, chunks, src, proc, analyser, raf, song } = rec;
  rec = null;
  clearTimeout(song.timer);
  cancelAnimationFrame(raf);
  src.disconnect();
  proc.disconnect();
  analyser.disconnect();
  ui.meter.style.width = '0';
  const all = join(chunks);
  const sr = song.actx.sampleRate;
  if (clock() < song.end || song.firstAt === null) { setState(ui, 'idle', 'Stopped. Press Record to try again.'); return; }
  const outLat = song.actx.outputLatency || song.actx.baseLatency || 0;
  const inLat = stream.getAudioTracks()[0]?.getSettings().latency || 0.01;
  const guess = Math.round((song.start + outLat - (song.firstAt - inLat)) * sr);
  const at = lineUp(all, guess, sr, song.i);
  const len = Math.round(LINE_SECONDS * sr);
  const take = new Float32Array(len);
  take.set(all.subarray(Math.max(0, at), Math.min(all.length, at + len)), Math.max(0, -at));
  let peak = 0;
  for (const v of take) peak = Math.max(peak, Math.abs(v));
  if (peak < 0.02) { setState(ui, 'idle', 'Didn\'t hear anything. Try again a bit louder.'); return; }
  const fade = Math.round(sr * 0.01);
  for (let k = 0; k < len; k++) take[k] *= (0.89 / peak) * Math.min(1, k / fade, (len - 1 - k) / fade);
  if (ui.url) URL.revokeObjectURL(ui.url);
  ui.wav = wav(take, sr);
  ui.url = URL.createObjectURL(ui.wav);
  ui.audio.src = ui.url;
  ui.take = song.actx.createBuffer(1, len, sr);
  ui.take.copyToChannel(take, 0);
  ui.band.disabled = false;
  setState(ui, 'taken', 'Press ▶ With the band to hear it in the song.');
  playSongLine(song.i, clock() + 0.1, { take: ui.take });
}

// Where the line starts in the recording: near `guess`, wherever its loudness best matches
// the line's notes (searched up to a third of a second either way).
function lineUp(s, guess, sr, i) {
  const fps = 100;
  const hop = Math.round(sr / fps);
  const n = Math.floor(s.length / hop);
  const env = new Float32Array(n);
  for (let f = 0; f < n; f++) {
    let a = 0;
    for (let k = f * hop; k < (f + 1) * hop; k++) a += s[k] * s[k];
    env[f] = Math.sqrt(a / hop);
  }
  const len = Math.round(SONG.lineSteps * STEP * fps);
  const pat = new Float32Array(len);
  for (const [st, ln] of SONG.lines[i].notes) {
    for (let k = Math.round(st * STEP * fps); k < Math.round((st + ln * 0.85) * STEP * fps) && k < len; k++) pat[k] = 1;
  }
  const pm = pat.reduce((a, b) => a + b, 0) / len;
  const base = Math.round(guess / hop);
  let best = base, bestScore = 0;
  for (let lag = base - 33; lag <= base + 33; lag++) {
    let em = 0;
    for (let k = 0; k < len; k++) em += env[lag + k] ?? 0;
    em /= len;
    let sc = 0;
    for (let k = 0; k < len; k++) sc += ((env[lag + k] ?? 0) - em) * (pat[k] - pm);
    if (sc > bestScore) { bestScore = sc; best = lag; }
  }
  return best * hop;
}

function addSongLine(i) {
  const line = SONG.lines[i];
  const id = `song-${i + 1}`;
  const box = document.createElement('div');
  box.className = 'line';
  box.innerHTML = `
    ${i ? `<div class="before">${SONG.lines[i - 1].text}</div>` : ''}
    <div class="who Gus">GUS AND THE BAND · LINE ${i + 1}</div>
    <div class="text"></div>
    <div class="row">
      <button class="rec">● Record</button>
      <button class="listen">▶ Listen</button>
      <button class="band">▶ With the band</button>
      <button class="save">💾 Save</button>
      <button class="hear">🔊 Hear the robots</button>
      <div class="meter"><div></div></div>
    </div>
    <div class="status"></div>`;
  box.querySelector('.text').textContent = line.text;
  const ui = {
    id, box, audio: new Audio(), url: null, wav: null, take: null,
    rec: box.querySelector('.rec'), listen: box.querySelector('.listen'), save: box.querySelector('.save'),
    band: box.querySelector('.band'), meter: box.querySelector('.meter div'), status: box.querySelector('.status'),
  };
  ui.band.disabled = true;
  ui.rec.addEventListener('click', () => {
    if (rec && rec.ui === ui) stopTake(); else startSongTake(i, ui);
  });
  ui.listen.addEventListener('click', () => { ui.audio.currentTime = 0; ui.audio.play(); });
  ui.band.addEventListener('click', () => { if (ui.take) playSongLine(i, clock() + 0.1, { take: ui.take }); });
  box.querySelector('.hear').addEventListener('click', () => {
    if (!audio.ready) audio.init();
    audio.resume();
    loadSong().then(() => playSongLine(i, clock() + 0.1, { guide: true }));
  });
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
  heading('The daytime song');
  const how = document.createElement('p');
  how.className = 'how';
  how.innerHTML = 'Gus and the band\'s song. <b>Put headphones on</b> first. Press <b>● Record</b>: ' +
    'four clicks count you in, then the band plays and you sing the line. It stops by itself. Press ' +
    '<b>🔊 Hear the robots</b> to learn the tune. Lines you record are sung by you in the game, with the ' +
    'robots singing along quietly; the rest stay robots.';
  $('lines').appendChild(how);
  const label = document.createElement('label');
  label.className = 'how';
  label.innerHTML = '<input type="checkbox" checked> The robots sing along in my headphones while I record';
  songGuide = label.querySelector('input');
  $('lines').appendChild(label);
  SONG.lines.forEach((_, i) => addSongLine(i));
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
