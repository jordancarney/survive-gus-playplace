// localStorage persistence for the one save.
//
// The save only ever changes at 6 AM. That is what makes "lose and you start the night over"
// work for free: a caught Jonathan reloads the profile as it was when the night began.
import { HAPPINESS, NIGHTS, GFX_KEY, DIFFICULTY_KEY, DIFFICULTIES } from './config.js';

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
  stars: {},                // nights beaten on Hard (night number, or 'home')
  badge: false,             // Old John's badge, for finishing the whole game
  stats: { survived: 0, caught: 0, fixed: 0, junked: 0 },
  // When Jonathan Was Five, the story of when he was little (js/escape/).
  escape: freshEscape(),
});

export const freshEscape = () => ({
  level: 1,                 // the furthest level reached (1-8)
  done: false,              // made it to 6 AM at the pizza place
  seen: {},                 // its cutscenes
  plushies: {},             // the secret golden Gus plushie found in each level
  stars: {},                // levels beaten on Nightmare
  quests: {},               // every quest ever done, per level: { 1: ['fuses', 'power', ...] }
  secret: false,            // every quest in every level done: the secret ending
  save: null,               // the last save point touched: { level, point, found, quests, time, ... }
});

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshProfile();
    // Merge over a fresh profile so a save written by an older build never arrives
    // missing a field that newer code reads.
    const saved = JSON.parse(raw);
    const base = freshProfile();
    const p = {
      ...base, ...saved,
      stats: { ...base.stats, ...(saved.stats || {}) },
      seen: { ...(saved.seen || {}) },
      stars: { ...(saved.stars || {}) },
      escape: { ...freshEscape(), ...(saved.escape || {}) },
    };
    p.escape.seen = { ...(p.escape.seen || {}) };
    p.escape.plushies = { ...(p.escape.plushies || {}) };
    p.escape.stars = { ...(p.escape.stars || {}) };
    p.escape.quests = { ...(p.escape.quests || {}) };
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

// The settings live beside the save, not in it, so a new game keeps them.

// Switching graphics rebuilds every material, so it reloads the page — and reopens Settings
// afterwards, so you see what you picked.
const REOPEN_KEY = 'survive_gus_reopen_settings';

export function saveGraphics(mode) {
  try { localStorage.setItem(GFX_KEY, mode); } catch {}
  try { sessionStorage.setItem(REOPEN_KEY, '1'); } catch {}
  location.reload();
}

export function takeReopenSettings() {
  try {
    const yes = sessionStorage.getItem(REOPEN_KEY) === '1';
    sessionStorage.removeItem(REOPEN_KEY);
    return yes;
  } catch { return false; }
}

export function loadDifficulty() {
  try {
    const d = localStorage.getItem(DIFFICULTY_KEY);
    return DIFFICULTIES[d] ? d : 'medium';
  } catch { return 'medium'; }
}

export function saveDifficulty(d) {
  try { localStorage.setItem(DIFFICULTY_KEY, d); } catch {}
}

const DEBUG_KEY = 'survive_gus_debug';

export function loadDebug() {
  try { return localStorage.getItem(DEBUG_KEY) === '1'; } catch { return false; }
}

export function saveDebug(on) {
  try { if (on) localStorage.setItem(DEBUG_KEY, '1'); else localStorage.removeItem(DEBUG_KEY); } catch {}
}
