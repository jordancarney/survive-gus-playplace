// Two players, one computer (the designer's idea): split screen, Jonathan on the left (or
// top) on WASD and the trackpad, his little brother Jimmy on the right (or bottom) on the
// arrow keys — or a game controller, if one's plugged in. Same team: when one gets caught
// they're out until morning, and the other has to make it on their own.
//
// This file holds what each player presses (`Controls`, the same questions the rest of the
// game asks of `input`: down, pressed, keyPressed, drainLook, fire...), and the little HUD
// in each half of the screen (`PaneHud`). The game (game.js) runs each player's turn in
// turn, pointing `game.player` at whoever's turn it is, so everything that asks "where's
// the player?" asks about the right one.
import { P1_KEYMAP, P2_KEYMAP, COOP_TURN, PAD_LOOK, PLAYER, weaponById } from './config.js';
import { input } from './input.js';

// The repair puzzles and the camera monitor ask about the arrow keys and SPACE by name.
// Player 1 has WASD for arrows; player 2 has ENTER for SPACE.
const P1_VIRTUAL = {
  ArrowUp: ['KeyW'], ArrowDown: ['KeyS'], ArrowLeft: ['KeyA'], ArrowRight: ['KeyD'], Space: ['Space'],
};
const P2_VIRTUAL = {
  ArrowUp: ['ArrowUp'], ArrowDown: ['ArrowDown'], ArrowLeft: ['ArrowLeft'], ArrowRight: ['ArrowRight'],
  Space: ['Enter', 'NumpadEnter'], KeyE: ['Slash'], KeyS: ['ArrowDown'], KeyA: ['ArrowLeft'], KeyD: ['ArrowRight'],
  KeyW: ['ArrowUp'], KeyQ: ['KeyL'], KeyZ: ['Period'], KeyC: ['Comma'],
};

// Standard gamepad buttons → actions, and the puzzle keys they stand in for.
const PAD_ACTIONS = {
  0: ['interact'], 1: ['crouch'], 2: ['flashlight'], 3: ['swap'], 4: ['sprint'], 5: ['watch'],
  6: ['box'], 7: ['fire'], 8: ['watch'], 9: ['pause'], 10: ['sprint'], 11: ['crouch'], 12: ['emote'],
  // the rest of the d-pad, at night: the Shop's Gus mask and your pocket (js/shop.js)
  13: ['item'], 14: ['mask'], 15: ['nextItem'],
};
const PAD_VIRTUAL = { 12: 'ArrowUp', 13: 'ArrowDown', 14: 'ArrowLeft', 15: 'ArrowRight', 0: 'Space', 1: 'Escape' };
const DEAD = 0.18;

const dead = (v) => (Math.abs(v) < DEAD ? 0 : (v - Math.sign(v) * DEAD) / (1 - DEAD));

// What one player presses. Keyboard keys come from the shared `input` (it already tracks
// every key); a controller is read straight from the Gamepad API once a step.
export class Controls {
  constructor(which) {
    this.which = which;                     // 0: player 1, 1: player 2
    this.map = which === 0 ? P1_KEYMAP : P2_KEYMAP;
    this.virtual = which === 0 ? P1_VIRTUAL : P2_VIRTUAL;
    this.own = new Set(Object.values(this.map).flatMap((d) => d.keys));
    this.other = new Set(Object.values(which === 0 ? P2_KEYMAP : P1_KEYMAP).flatMap((d) => d.keys));
    // Player 2's left and right arrows turn instead of stepping sideways (the designer's
    // call), and their view slowly levels out, since they have nothing to look up with.
    this.turns = which === 1;
    this.pad = null;                         // index of the controller this player has, if any
    this.padHeld = new Set();
    this.padPressed = new Set();
    this.padKeys = new Set();
    this.padKeysPressed = new Set();
    this.axis = { x: 0, z: 0 };
    this.dx = 0; this.dy = 0;
    this.turnHeld = 0;
    this.enabled = true;
    this.usedPad = false;                   // pressed something on a controller (for the help text)
  }

  get locked() { return this.which === 1 || this.pad !== null || input.locked; }

  // What to call this player's keys in a prompt (player 1's are the usual ones).
  get keyNames() {
    if (this.pad !== null && this.usedPad) return { E: 'A', C: 'B', G: 'RB', B: 'LT', F: 'X', Q: 'Y' };
    return this.which === 1 ? { E: '/', C: ',', G: ';', B: "'", F: '.', Q: 'L' } : null;
  }

  // ── The questions the game asks ───────────────────────────────────────

  // (On a phone or iPad, player 1 is the touch screen: its buttons count as theirs.)
  down(action) {
    if (!this.enabled || !input.enabled) return false;
    if (this.padHeld.has(action)) return true;
    if (this.which === 0 && input.touchHeld.has(action)) return true;
    const d = this.map[action];
    return !!d && d.keys.some((k) => input.keysHeld.has(k));
  }

  pressed(action) {
    if (!this.enabled || !input.enabled) return false;
    if (this.padPressed.has(action)) return true;
    if (this.which === 0 && input.touchPressed.has(action)) return true;
    const d = this.map[action];
    return !!d && d.keys.some((k) => input.keysPressed.has(k));
  }

  // A raw key, by the name the puzzles and monitors use (ArrowLeft, Space, Digit3, ...).
  keyPressed(code) {
    if (!this.enabled || !input.enabled) return false;
    if (this.padKeysPressed.has(code)) return true;
    if (this.which === 0 && input.touchKeys.has(code)) return true;
    const v = this.virtual[code];
    if (v) return v.some((k) => input.keysPressed.has(k));
    // anything else is player 1's, unless it's one of player 2's keys
    if (this.which === 1 || this.other.has(code)) return false;
    return input.keysPressed.has(code);
  }

  keyHeld(code) {
    if (!this.enabled || !input.enabled) return false;
    if (this.padKeys.has(code)) return true;
    const v = this.virtual[code];
    if (v) return v.some((k) => input.keysHeld.has(k));
    if (this.which === 1 || this.other.has(code)) return false;
    return input.keysHeld.has(code);
  }

  get fire() { return this.padHeld.has('fire') || (this.which === 0 ? input.fire : this.down('fire')); }
  get firePressed() { return this.padPressed.has('fire') || (this.which === 0 ? input.firePressed : this.pressed('fire')); }
  get wheel() { return this.which === 0 ? input.wheel : 0; }

  // Analog walking from a stick (x: right, z: back), or null to use the keys.
  moveAxis() { return this.axis.x || this.axis.z ? this.axis : null; }

  // The look, in mouse units (the player multiplies by mouse sensitivity).
  drainLook() {
    let dx = this.dx, dy = this.dy;
    this.dx = this.dy = 0;
    if (this.which === 0) { const m = input.drainLook(); dx += m.dx; dy += m.dy; }
    return { dx, dy, level: this.turns && this.pad === null };
  }

  clear() {
    this.padHeld.clear(); this.padPressed.clear(); this.padKeys.clear(); this.padKeysPressed.clear();
    this.axis.x = this.axis.z = 0;
    this.dx = this.dy = 0;
  }

  // ── Once a step ───────────────────────────────────────────────────────

  poll(dt, pads) {
    // Arrow-key turning: gentle at first, so a tap nudges you, then up to full speed.
    if (this.turns && input.enabled && this.enabled) {
      const l = input.keysHeld.has('ArrowLeft'), r = input.keysHeld.has('ArrowRight');
      const dir = (l ? 1 : 0) - (r ? 1 : 0);
      this.turnHeld = dir ? Math.min(1, this.turnHeld + dt * 2.5) : 0;
      if (dir) this.dx -= (dir * COOP_TURN * (0.45 + 0.55 * this.turnHeld) * dt) / PLAYER.mouseSensitivity;
    }
    const pad = this.pad !== null ? pads[this.pad] : null;
    const wasHeld = this.padHeld, wasKeys = this.padKeys;
    this.padHeld = new Set();
    this.padKeys = new Set();
    this.axis.x = this.axis.z = 0;
    if (pad && pad.connected) {
      pad.buttons.forEach((b, i) => {
        const on = b.pressed || b.value > 0.5;
        if (!on) return;
        this.usedPad = true;
        for (const a of PAD_ACTIONS[i] || []) this.padHeld.add(a);
        if (PAD_VIRTUAL[i]) this.padKeys.add(PAD_VIRTUAL[i]);
      });
      const ax = pad.axes;
      const mx = dead(ax[0] || 0), mz = dead(ax[1] || 0);
      const len = Math.hypot(mx, mz);
      if (len > 0) { this.axis.x = mx / Math.max(1, len); this.axis.z = mz / Math.max(1, len); this.usedPad = true; }
      // the stick as walking keys too, for the things that only ask about keys
      if (mz < -0.5) this.padHeld.add('forward');
      if (mz > 0.5) this.padHeld.add('back');
      if (mx < -0.5) this.padHeld.add('left');
      if (mx > 0.5) this.padHeld.add('right');
      const lx = dead(ax[2] || 0), ly = dead(ax[3] || 0);
      // a curve, so small pushes aim finely and a full push turns quickly
      const cx = Math.sign(lx) * lx * lx, cy = Math.sign(ly) * ly * ly;
      this.dx += (cx * PAD_LOOK * dt) / PLAYER.mouseSensitivity;
      this.dy += (cy * PAD_LOOK * 0.7 * dt) / PLAYER.mouseSensitivity;
    }
    this.padPressed = new Set([...this.padHeld].filter((a) => !wasHeld.has(a)));
    this.padKeysPressed = new Set([...this.padKeys].filter((k) => !wasKeys.has(k)));
  }
}

// Which controller goes to which player: the first one plugged in is player 2's (player 1
// has the trackpad); a second one is player 1's.
export function readPads() {
  try {
    const list = navigator.getGamepads ? [...navigator.getGamepads()] : [];
    return list.filter((p) => p && p.connected && p.mapping !== undefined);
  } catch { return []; }
}

// ── The HUD in each half of the screen ──────────────────────────────────
//
// The shared things (the clock, the kids' happiness, the objective, toasts) stay on the main
// HUD across the whole screen; each player's own things — their crosshair, flashlight and
// running bars, their weapon, what they can press, what's chasing them — are drawn in their
// half by one of these.

const ICONS = { taser: '⚡', baseball: '⚾', knife: '🔪', magnum: '🔫' };

export class PaneHud {
  constructor(parent, i, name, icon) {
    this.i = i;
    const el = document.createElement('div');
    el.className = `pane pane-${i}`;
    el.innerHTML = `
      <div class="pane-danger"></div>
      <div class="pane-hit"></div>
      <div class="pane-cross"></div>
      <div class="pane-name">${icon} ${name}</div>
      <div class="pane-bars">
        <div class="pane-row"><span>🔦</span><div class="bar battery"><div class="fill pane-battery"></div></div></div>
        <div class="pane-row"><span>👟</span><div class="bar stamina"><div class="fill pane-stamina"></div></div></div>
        <div class="pane-row pane-boxrow"><span>📦</span><div class="bar"><div class="fill pane-box"></div></div></div>
      </div>
      <div class="pane-weapon">
        <div class="pane-slots"></div>
        <div class="pane-wname"></div>
        <div class="bar charge"><div class="fill pane-charge"></div></div>
        <div class="pane-winfo"></div>
      </div>
      <div class="pane-alert hidden"></div>
      <div class="pane-status hidden"></div>
      <div class="pane-prompt hidden"></div>
      <div class="pane-out hidden"></div>`;
    parent.appendChild(el);
    this.el = el;
    const q = (c) => el.querySelector(c);
    this.danger = q('.pane-danger'); this.hit = q('.pane-hit'); this.cross = q('.pane-cross');
    this.nameEl = q('.pane-name');
    this.battery = q('.pane-battery'); this.stamina = q('.pane-stamina'); this.box = q('.pane-box'); this.boxRow = q('.pane-boxrow');
    this.weaponEl = q('.pane-weapon'); this.slots = q('.pane-slots'); this.wname = q('.pane-wname');
    this.charge = q('.pane-charge'); this.winfo = q('.pane-winfo');
    this.alert = q('.pane-alert'); this.status = q('.pane-status'); this.promptEl = q('.pane-prompt'); this.outEl = q('.pane-out');
    this.lastSlots = '';
    this.lastPrompt = null;
  }

  setName(name, icon) { this.nameEl.textContent = `${icon} ${name}`; }

  // The game's prompts name player 1's keys (<b>E</b>, <b>C</b>...): player 2 sees theirs.
  prompt(html, keys = null) {
    if (html && keys) html = html.replace(/<b>([A-Z])<\/b>/g, (m, k) => (keys[k] ? `<b>${keys[k]}</b>` : m));
    if (html === this.lastPrompt) return;
    this.lastPrompt = html;
    this.promptEl.classList.toggle('hidden', !html);
    if (html) this.promptEl.innerHTML = html;
    this.cross.classList.toggle('can-use', !!html);
  }

  hitmark() {
    this.cross.style.background = '#ffd23f';
    setTimeout(() => { this.cross.style.background = ''; }, 120);
  }

  flashHit() {
    const f = this.hit;
    f.style.transition = 'none';
    f.style.opacity = '0.5';
    requestAnimationFrame(() => { f.style.transition = 'opacity 0.5s'; f.style.opacity = '0'; });
  }

  // `o`: { weapons, box, status, alert, danger, out }
  update(p, o) {
    this.el.classList.toggle('is-out', !!o.out);
    this.outEl.classList.toggle('hidden', !o.out);
    if (o.out) this.outEl.innerHTML = o.out;
    this.battery.style.width = p.battery + '%';
    this.battery.style.background = p.battery < 20 ? '#ff3b30' : '';
    this.stamina.style.width = (p.stamina / p.maxStamina) * 100 + '%';
    this.stamina.style.background = p.winded ? '#ff3b30' : '';
    this.boxRow.classList.toggle('hidden', o.box == null);
    if (o.box != null) {
      this.box.style.width = o.box * 100 + '%';
      this.box.style.background = o.box < 0.1 ? '#ff3b30' : '';
    }
    this.weaponEl.classList.toggle('hidden', !o.weapons);
    if (o.weapons) {
      const slots = p.weapons.map((id, i) => `${id}${i === p.slot ? '*' : ''}`).join(',');
      if (slots !== this.lastSlots) {
        this.lastSlots = slots;
        this.slots.innerHTML = p.weapons.map((id, i) => `<div class="slot ${i === p.slot ? 'on' : ''}">${ICONS[id]}</div>`).join('');
      }
      const w = p.weapon;
      this.wname.textContent = p.carrying ? `DRAGGING ${p.carrying.name.toUpperCase()}` : w.name.toUpperCase();
      let charge = 1, info = '';
      if (w.id === 'taser') {
        const max = weaponById('taser').charges;
        if (p.taserEmpty > 0) { charge = 1 - p.taserEmpty / p.taserRecharge; info = 'Recharging...'; }
        else if (p.game.diff.unlimited) info = '∞ zaps';
        else { charge = p.taserCharges / max; info = `${'⚡'.repeat(p.taserCharges)}${'·'.repeat(max - p.taserCharges)}`; }
      } else if (w.id === 'knife') { charge = 1 - p.cool.knife / weaponById('knife').cooldown; info = 'Get close'; }
      else if (w.id === 'baseball') { charge = p.balls / weaponById('baseball').count; info = `${p.balls} left`; }
      else if (w.id === 'magnum') { charge = Math.min(1, p.ammo / weaponById('magnum').ammo); info = `${p.ammo} shots`; }
      this.charge.style.width = Math.max(0, Math.min(1, charge)) * 100 + '%';
      if (this.winfo.textContent !== info) this.winfo.textContent = info;
    }
    this.alert.classList.toggle('hidden', !o.alert);
    if (o.alert && this.alert.textContent !== o.alert) this.alert.textContent = o.alert;
    this.status.classList.toggle('hidden', !o.status);
    if (o.status && this.status.textContent !== o.status) this.status.textContent = o.status;
    this.danger.style.opacity = String((o.danger || 0) * 0.9);
  }
}
