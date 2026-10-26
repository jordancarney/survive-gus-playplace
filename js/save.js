// localStorage persistence for the one save.
//
// The save only ever changes at 6 AM. That is what makes "lose and you start the night over"
// work for free: a caught Jonathan reloads the profile as it was when the night began.
import { HAPPINESS, NIGHTS, GFX_KEY } from './config.js';

const KEY = 'survive_gus_save_v1';

export const freshProfile = () => ({
  night: 1,                 // the night you are on (1-21)
  happiness: HAPPINESS.start,
  seenIntro: false,
  beatGus: false,           // night 20 won: the animatronics are friends, night 21 is open
  beatJunk: false,          // night 21 won: the whole game is done
  homeDone: false,          // the house level after night 10 is cleared
  timmyHome: false,         // Timmy's gramma has picked him up
  seen: {},                 // cutscenes that only play once
  best: 1,                  // furthest night reached, for the night select
  stats: { survived: 0, caught: 0, fixed: 0, junked: 0 },
});

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshProfile();
    // Merge over a fresh profile so a save written by an older build never arrives
    // missing a field that newer code reads.
    const saved = JSON.parse(raw);
    const base = freshProfile();
    const p = { ...base, ...saved, stats: { ...base.stats, ...(saved.stats || {}) }, seen: { ...(saved.seen || {}) } };
    p.night = Math.max(1, Math.min(NIGHTS.length, p.night | 0));
    p.best = Math.max(p.best | 0, p.night);
    p.happiness = Math.max(0, Math.min(100, Number(p.happiness) || HAPPINESS.start));
    return p;
  } catch { return freshProfile(); }
}

export function saveProfile(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode etc. */ }
}

export function clearProfile() {
  try { localStorage.removeItem(KEY); } catch {}
}

// The graphics setting lives beside the save, not in it. Switching rebuilds every material,
// so it reloads the page.
export function saveGraphics(mode) {
  try { localStorage.setItem(GFX_KEY, mode); } catch {}
  location.reload();
}
