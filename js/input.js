// Keyboard + mouse input, including pointer lock.
//
// The rest of the game asks two kinds of question: "is this held right now?" (`down`) and
// "was it pressed since the last frame?" (`pressed`). Raw key codes are tracked too, for the
// arrow-key repair puzzles, the camera monitor and the 1-4 weapon slots. Look deltas
// accumulate between frames and are drained by the player each update.
import { KEYMAP, DEBUG, PLAYER } from './config.js';

// action name -> Set of key codes, built once from KEYMAP
const ACTION_OF = new Map();
for (const [action, def] of Object.entries(KEYMAP)) {
  for (const code of def.keys) {
    if (!ACTION_OF.has(code)) ACTION_OF.set(code, []);
    ACTION_OF.get(code).push(action);
  }
}

// Keys the page would otherwise scroll or tab with.
const SWALLOW = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab']);

export const input = {
  held: new Set(),        // action names currently held
  justPressed: new Set(), // action names pressed this frame
  keysHeld: new Set(),    // raw codes
  keysPressed: new Set(),
  dx: 0, dy: 0,           // accumulated look delta, in raw device units
  fire: false,            // mouse button held
  firePressed: false,     // mouse button pressed this frame
  locked: false,
  wheel: 0,
  enabled: true,
  // The touch screen's own actions and keys, kept apart from the keyboard's so that with two
  // playing they only ever reach player 1 (player 2 is on a controller).
  touchHeld: new Set(),
  touchPressed: new Set(),
  touchKeys: new Set(),

  down(action) { return this.enabled && (this.held.has(action) || this.touchHeld.has(action)); },
  pressed(action) { return this.enabled && (this.justPressed.has(action) || this.touchPressed.has(action)); },
  keyPressed(code) { return this.enabled && (this.keysPressed.has(code) || this.touchKeys.has(code)); },

  // Called once per fixed step, after everything has read this frame's input.
  endFrame() {
    this.justPressed.clear();
    this.keysPressed.clear();
    this.touchPressed.clear();
    this.touchKeys.clear();
    this.firePressed = false;
    this.wheel = 0;
  },

  drainLook() {
    const d = { dx: this.dx, dy: this.dy };
    this.dx = 0; this.dy = 0;
    return d;
  },

  clear() {
    this.held.clear(); this.justPressed.clear();
    this.keysHeld.clear(); this.keysPressed.clear();
    this.touchHeld.clear(); this.touchPressed.clear(); this.touchKeys.clear();
    this.fire = false; this.firePressed = false;
    this.dx = 0; this.dy = 0;
  },

  // Touch buttons feed in through here.
  tap(code) { this.touchKeys.add(code); },
  tapAction(action) { this.touchPressed.add(action); },
  // A finger dragging to look, in screen pixels: stored as mouse units, so whoever reads the
  // look (player 1, an emote's camera, the emote wheel) gets it the same way as the mouse.
  touchLook(dx, dy) {
    const k = PLAYER.touchLookSensitivity / PLAYER.mouseSensitivity;
    this.dx += dx * k;
    this.dy += dy * k;
  },
};

let canvasEl = null;
const lockChangeHandlers = [];

export function onPointerLockChange(fn) { lockChangeHandlers.push(fn); }

// Chrome returns a promise here and rejects it when the lock can't be taken — including
// inside an embedded frame, where it rejects every single time. Both the request and its
// fallback have to swallow that, or the console fills with unhandled rejections and the
// game looks broken when it is merely un-lockable.
function tryLock(options) {
  try {
    const p = options ? canvasEl.requestPointerLock(options) : canvasEl.requestPointerLock();
    return p && typeof p.catch === 'function' ? p : null;
  } catch {
    return null;
  }
}

export function requestPointerLock() {
  if (!canvasEl || document.pointerLockElement === canvasEl) return;
  // unadjustedMovement gives raw mouse deltas; not every browser supports it.
  const p = tryLock({ unadjustedMovement: true });
  if (p) p.catch(() => { const q = tryLock(null); if (q) q.catch(() => {}); });
}

export function exitPointerLock() {
  if (document.pointerLockElement) document.exitPointerLock();
}

export function initInput(canvas) {
  canvasEl = canvas;

  addEventListener('keydown', (e) => {
    // Let the browser keep its own shortcuts (reload, devtools, tab switching).
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.repeat) { e.preventDefault(); return; }
    if (!input.keysHeld.has(e.code)) input.keysPressed.add(e.code);
    input.keysHeld.add(e.code);
    for (const action of ACTION_OF.get(e.code) || []) {
      if (!input.held.has(action)) input.justPressed.add(action);
      input.held.add(action);
    }
    if (ACTION_OF.has(e.code) || SWALLOW.has(e.code)) e.preventDefault();
  });

  addEventListener('keyup', (e) => {
    input.keysHeld.delete(e.code);
    for (const action of ACTION_OF.get(e.code) || []) input.held.delete(action);
  });

  // Releasing focus while keys are held would otherwise leave Jonathan walking forever.
  addEventListener('blur', () => input.clear());

  document.addEventListener('mousemove', (e) => {
    if (!input.locked) return;
    input.dx += e.movementX || 0;
    input.dy += e.movementY || 0;
  });

  document.addEventListener('mousedown', (e) => {
    if (!input.locked || e.button !== 0) return;
    input.fire = true;
    input.firePressed = true;
  });
  document.addEventListener('mouseup', (e) => { if (e.button === 0) input.fire = false; });

  document.addEventListener('wheel', (e) => {
    if (!input.locked) return;
    input.wheel = Math.sign(e.deltaY);
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('contextmenu', (e) => { if (input.locked) e.preventDefault(); });

  document.addEventListener('pointerlockchange', () => {
    input.locked = document.pointerLockElement === canvasEl;
    if (!input.locked) { input.fire = false; input.dx = input.dy = 0; }
    for (const fn of lockChangeHandlers) fn(input.locked);
  });

  document.addEventListener('pointerlockerror', () => {
    if (DEBUG) console.warn('pointer lock failed');
  });
}
