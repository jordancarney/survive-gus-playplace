// Lost in the Pizzaplex's chapters, in order. Chapters 1–5 are a file each; after that each
// character's chapters live in one file per character (jonathan.js, max.js, ...), keyed by
// chapter number. Fifty chapters in all (the designer's number); any not built show on the
// list as coming soon.
import sleepover from './ch1-sleepover.js';
import suite from './ch2-suite.js';
import office from './ch3-office.js';
import tunnels from './ch4-tunnels.js';
import pit from './ch5-pit.js';
import jonathan from './jonathan.js';
import max from './max.js';
import jackson from './jackson.js';
import jack from './jack.js';
import thomas from './thomas.js';
import timmy from './timmy.js';
import finale from './finale.js';

export const TOTAL = 50;
export const CHAPTERS = [sleepover, suite, office, tunnels, pit];
for (const family of [jonathan, max, jackson, jack, thomas, timmy, finale]) {
  for (const [n, def] of Object.entries(family)) CHAPTERS[Number(n) - 1] = def;
}

// Who plays each chapter: the five of them take turns, and from Chapter 27 Timmy's in the
// rotation too. Chapter 50 is everybody (you play Jonathan, with everyone along).
const FIVE = ['jonathan', 'max', 'jackson', 'jack', 'thomas'];
const SIX = ['timmy', ...FIVE];
export function whoPlays(n) {
  if (n === 50) return null;
  if (n < 27) return FIVE[(n - 1) % 5];
  return SIX[(n - 27) % 6];
}
