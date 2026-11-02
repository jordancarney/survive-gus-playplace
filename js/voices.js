// Jonathan and Timmy say their cutscene lines out loud — in real people's voices, recorded
// with dev/record.html and added by dev/add_voices.py as audio/voices/<id>.m4a. Each voiced
// shot in story.js has a `voice` id; RECORDED has the ones with a recording, and any other
// line is subtitles only. They're plain files next to the page: no server needed.
//
// RECORDED also holds how loud each recording is, 30 times a second (a digit 0–9 each), so
// the speaker's mouth can open and shut with the words.
import { RECORDED } from './recorded.js';

let current = null;
let currentId = null;

export const hasVoice = (id) => !!id && id in RECORDED;

export function speak(id) {
  stopSpeaking();
  if (!hasVoice(id)) return;
  const a = new Audio(`audio/voices/${id}.m4a`);
  a.addEventListener('error', () => { if (current === a) current = null; });
  a.play().catch(() => { if (current === a) current = null; });
  current = a;
  currentId = id;
}

export function stopSpeaking() {
  if (current) current.pause();
  current = null;
}

export const speaking = () => !!current && !current.paused && !current.ended;

// How loud the line is right now, 0–1.
export function talkLevel() {
  if (!speaking()) return 0;
  const env = RECORDED[currentId];
  const c = env[Math.floor(current.currentTime * 30)];
  return c === undefined ? 0 : Number(c) / 9;
}
