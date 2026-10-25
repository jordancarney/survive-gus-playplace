// Detects new deploys and refreshes stale sessions.
//
// GitHub Pages caches each file for ~10 minutes, and a tab (or home-screen app) that is
// never closed keeps its modules indefinitely — which is how a device ends up playing a
// weeks-old build. This fetches js/version.js with caching disabled, compares it to the
// baked-in VERSION, and reloads when a new build has shipped: immediately on the menus
// (nothing to lose there), deferred until then during a night.
import { VERSION } from './version.js';

const CHECK_EVERY = 10 * 60 * 1000;
const GUARD_KEY = 'sgp_update_reload';   // stops reload loops while the CDN is still mixed

let game = null;
let pendingVersion = null;
let toasted = false;
let reloadFn = () => location.reload();

async function fetchRemoteVersion() {
  try {
    const res = await fetch('./js/version.js', { cache: 'no-store' });
    if (!res.ok) return null;
    const m = (await res.text()).match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
    return m ? m[1] : null;
  } catch { return null; }
}

const SAFE_MODES = new Set(['title', 'howto', 'story', 'card', 'morning', 'caught', 'select', 'day']);
const safeToReload = () => !game || SAFE_MODES.has(game.mode);

function apply() {
  try { sessionStorage.setItem(GUARD_KEY, pendingVersion); } catch {}
  reloadFn();
}

export async function checkForUpdate() {
  const remote = await fetchRemoteVersion();
  if (!remote || remote === VERSION) return 'up-to-date';
  let guarded = null;
  try { guarded = sessionStorage.getItem(GUARD_KEY); } catch {}
  if (guarded === remote) return 'guarded';
  pendingVersion = remote;
  if (safeToReload()) { apply(); return 'reloading'; }
  if (!toasted && game && game.toast) {
    toasted = true;
    game.toast('Update ready - applies after this night');
  }
  return 'deferred';
}

export function initUpdateCheck(g, opts = {}) {
  game = g;
  if (opts.reloadFn) reloadFn = opts.reloadFn;   // injectable so tests don't reload themselves
  setTimeout(checkForUpdate, 4000);
  setInterval(checkForUpdate, CHECK_EVERY);
  // stuck-tab rescue: the moment the tab is foregrounded again, look for a newer build
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkForUpdate(); });
  addEventListener('pageshow', () => checkForUpdate());
  // a deferred update lands as soon as the player is back on a safe screen
  setInterval(() => { if (pendingVersion && safeToReload()) apply(); }, 3000);
}
