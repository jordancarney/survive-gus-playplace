// Touch controls for phones and tablets.
//
// Nothing appears until the first touch, and it retires again the moment a key is pressed —
// on a laptop you should never see it. Left side of the screen is a floating movement stick
// (origin = wherever the thumb lands), the right side looks around. The camera monitor and
// the repair puzzles have their own on-screen buttons.
//
// The stick only ever walks. Running is the 🏃 button: tap it to run, tap again to walk, and
// it switches itself off once you've stood still for a couple of seconds. (It used to run
// whenever the stick was pushed all the way, which on an iPad was nearly always.)
//
// Emotes are the 😀 button: hold it and slide toward one, then let go — or tap it, and tap
// the one you want on the wheel (tap 😀 again to close it).
//
// Two playing on a phone or iPad (the designer's call): player 1 is the touch screen and
// player 2 has a controller. The controls then cover only player 1's half of the screen
// (the CSS shrinks #touchLayer to it), and everything they press goes through input's own
// touch channel, which only player 1's Controls read.
import { input } from './input.js';

const BTN = 62;
const STICKY_TAP = 0.35;   // seconds: a tap on 😀 quicker than this leaves the wheel open

export class Touch {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.layer = document.getElementById('touchLayer');
    this.built = false;
    this.moveId = null;
    this.moveOrigin = { x: 0, y: 0 };
    this.moveVec = { x: 0, y: 0 };
    this.lookId = null;
    this.lookLast = { x: 0, y: 0 };
    this.buttons = [];
    this.running = false;
    this.stillFor = 0;
    this.emote = null;       // the finger on 😀: { id, x, y, t0, moved, wasEmoting }
    this.stickyWheel = 0;    // when the wheel was left open for a tap (0: it wasn't)
  }

  init() {
    const target = document.getElementById('stage');
    target.addEventListener('touchstart', (e) => this.onStart(e), { passive: false });
    target.addEventListener('touchmove', (e) => this.onMove(e), { passive: false });
    target.addEventListener('touchend', (e) => this.onEnd(e), { passive: false });
    target.addEventListener('touchcancel', (e) => this.onEnd(e), { passive: false });
    addEventListener('keydown', () => this.setActive(false));
  }

  setActive(v) {
    if (this.active === v) return;
    this.active = v;
    document.getElementById('hud').classList.toggle('touch', v);
    document.body.classList.toggle('touching', v);
    if (v && !this.built) this.build();
    for (const b of this.buttons) b.el.style.display = v ? 'flex' : 'none';
    if (this.stickBase) { this.stickBase.style.display = 'none'; this.stickNub.style.display = 'none'; }
    if (!v) {
      this.moveId = this.lookId = null;
      this.moveVec = { x: 0, y: 0 };
      this.emote = null;
      this.stickyWheel = 0;
      this.setRunning(false);
      input.touchHeld.clear();
    }
  }

  build() {
    this.built = true;
    this.stickBase = document.createElement('div');
    this.stickBase.className = 'tstick tstick-base';
    this.stickNub = document.createElement('div');
    this.stickNub.className = 'tstick tstick-nub';
    this.layer.append(this.stickBase, this.stickNub);
    const defs = [
      { id: 'use',      label: '⚡', right: 22,  bottom: 100, size: 86 },
      { id: 'interact', label: 'E',  right: 124, bottom: 28 },
      { id: 'light',    label: '🔦', right: 22,  bottom: 24 },
      { id: 'swap',     label: '⇄',  right: 124, bottom: 108 },
      { id: 'sprint',   label: '🏃', left: 24,   bottom: 150, size: 54 },
      { id: 'crouch',   label: '⤓',  left: 24,   bottom: 214, size: 54 },
      { id: 'pause',    label: '❚❚', right: 22,  top: 92, size: 46 },
      { id: 'emote',    label: '😀', right: 78,  top: 92, size: 46 },
      // the Shop's things (js/shop.js), at night, once you have them: the thing in your pocket
      // (it shows which), the next one, and the Gus mask
      { id: 'item',     label: '🎒', right: 134, top: 92, size: 46, shop: true },
      { id: 'nextItem', label: '↻',  right: 190, top: 92, size: 46, shop: true },
      { id: 'mask',     label: '🎭', right: 246, top: 92, size: 46, shop: true },
    ];
    // Sizes and spacing scale with --tk (smaller in a short half of a phone's screen), and the
    // notch's safe area only counts on a side that's the edge of the screen (--tsr, --tsb).
    const px = (n) => `calc(${n}px * var(--tk, 1))`;
    for (const d of defs) {
      const el = document.createElement('div');
      el.className = 'tbtn';
      el.textContent = (this.labels && this.labels[d.id]) || d.label;
      el.style.width = el.style.height = px(d.size || BTN);
      if (d.right !== undefined) el.style.right = `calc(${px(d.right)} + var(--tsr, env(safe-area-inset-right)))`;
      if (d.left !== undefined) el.style.left = `calc(${px(d.left)} + env(safe-area-inset-left))`;
      if (d.bottom !== undefined) el.style.bottom = `calc(${px(d.bottom)} + var(--tsb, env(safe-area-inset-bottom)))`;
      if (d.top !== undefined) el.style.top = `calc(${px(d.top)} + env(safe-area-inset-top))`;
      el.style.display = 'none';
      this.layer.appendChild(el);
      this.buttons.push({ ...d, el, touchId: null });
    }
  }

  buttonAt(x, y) {
    for (const b of this.buttons) {
      if (b.el.style.display === 'none') continue;   // (a Shop button you don't have yet)
      const r = b.el.getBoundingClientRect();
      if (x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 8 && y <= r.bottom + 8) return b;
    }
    return null;
  }

  press(b, down) {
    b.el.classList.toggle('pressed', down);
    switch (b.id) {
      // in When Jonathan Was Five there's nothing to fire: the big button holds up the Gus Watch
      case 'use':
        if (this.game.mode === 'escape') { if (down) input.tapAction('watch'); break; }
        if (down) { input.firePressed = true; } input.fire = down; break;
      case 'interact': if (down) input.tapAction('interact'); break;
      case 'light': if (down) input.tapAction('flashlight'); break;
      case 'swap': if (down) input.tapAction(this.game.mode === 'escape' ? 'box' : 'swap'); break;
      case 'crouch': if (down) input.tapAction('crouch'); break;
      case 'sprint': if (down) this.setRunning(!this.running); break;
      case 'pause': if (down) this.game.togglePause(); break;
      case 'item': case 'nextItem': case 'mask': if (down) input.tapAction(b.id); break;
    }
  }

  // With two playing, player 1 sits out once they're caught: only ❚❚ still works.
  get sittingOut() { return this.game.twoUp && this.game.p1.out; }

  onStart(e) {
    this.setActive(true);
    if (!this.game.isPlaying()) return;
    // Let taps through to the camera map and puzzle buttons.
    if (e.target.closest && e.target.closest('#camUI, #repairUI, #dayPanel')) return;
    e.preventDefault();
    const r = this.layer.getBoundingClientRect();
    for (const t of e.changedTouches) {
      const btn = this.buttonAt(t.clientX, t.clientY);
      if (this.sittingOut && !(btn && btn.id === 'pause')) continue;
      // the wheel's open for a tap: this tap picks one (or, on 😀 or anywhere else, nothing)
      if (this.stickyWheel) {
        this.closeWheel(btn && btn.id === 'emote' ? null : this.slotAt(t.clientX, t.clientY));
        continue;
      }
      if (btn && btn.touchId === null) {
        btn.touchId = t.identifier;
        this.press(btn, true);
        if (btn.id === 'emote') this.emoteDown(t);
        continue;
      }
      // (two playing, the other half of the screen is player 2's)
      if (t.clientX < r.left || t.clientX > r.right || t.clientY < r.top || t.clientY > r.bottom) continue;
      if (t.clientX < r.left + r.width * 0.45 && this.moveId === null) {
        this.moveId = t.identifier;
        this.moveOrigin = { x: t.clientX, y: t.clientY };
        this.showStick(t.clientX, t.clientY, t.clientX, t.clientY);
      } else if (this.lookId === null) {
        this.lookId = t.identifier;
        this.lookLast = { x: t.clientX, y: t.clientY };
      }
    }
  }

  onMove(e) {
    if (!this.active || !this.game.isPlaying()) return;
    if (e.target.closest && e.target.closest('#camUI, #repairUI, #dayPanel')) return;
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === this.moveId) {
        const dx = t.clientX - this.moveOrigin.x, dy = t.clientY - this.moveOrigin.y;
        const max = 52;
        const len = Math.hypot(dx, dy);
        const k = len > max ? max / len : 1;
        this.moveVec = { x: (dx * k) / max, y: (dy * k) / max };
        this.showStick(this.moveOrigin.x, this.moveOrigin.y, this.moveOrigin.x + dx * k, this.moveOrigin.y + dy * k);
      } else if (t.identifier === this.lookId) {
        const dx = t.clientX - this.lookLast.x, dy = t.clientY - this.lookLast.y;
        this.lookLast = { x: t.clientX, y: t.clientY };
        input.touchLook(dx, dy);
      } else if (this.emote && t.identifier === this.emote.id) {
        // sliding off 😀 points the wheel (the wheel reads it like the mouse)
        const dx = t.clientX - this.emote.x, dy = t.clientY - this.emote.y;
        this.emote.x = t.clientX; this.emote.y = t.clientY;
        this.emote.moved += Math.hypot(dx, dy);
        input.dx += dx * 1.6;
        input.dy += dy * 1.6;
      }
    }
  }

  onEnd(e) {
    for (const t of e.changedTouches) {
      for (const b of this.buttons) if (b.touchId === t.identifier) { b.touchId = null; this.press(b, false); }
      if (t.identifier === this.moveId) { this.moveId = null; this.moveVec = { x: 0, y: 0 }; this.hideStick(); }
      if (t.identifier === this.lookId) this.lookId = null;
      if (this.emote && t.identifier === this.emote.id) this.emoteUp();
    }
  }

  // ── Emotes ────────────────────────────────────────────────────────────
  //
  // Holding 😀 is holding T: the game opens the wheel, and letting go does whichever one
  // you're pointing at (game.js, emoteTurn). A quick tap instead keeps "holding" it until the
  // next tap, which picks the emote under your finger.

  emoteDown(t) {
    this.emote = { id: t.identifier, x: t.clientX, y: t.clientY, t0: performance.now(), moved: 0, wasEmoting: !!this.game.p1.emote };
    input.touchHeld.add('emote');
    input.tapAction('emote');
  }

  emoteUp() {
    const e = this.emote;
    this.emote = null;
    const quick = (performance.now() - e.t0) / 1000 < STICKY_TAP && e.moved < 30;
    if (quick && !e.wasEmoting && !this.game.p1.carrying) { this.stickyWheel = performance.now(); return; }
    input.touchHeld.delete('emote');
  }

  // Let go of the wheel, with this one picked (an index into EMOTES), or none.
  closeWheel(sel) {
    const w = this.game.p1.wheel;
    if (w) { w.sel = sel; w.x = w.y = 0; }
    this.stickyWheel = 0;
    input.touchHeld.delete('emote');
  }

  // Which of the wheel's emotes is under this point, if any.
  slotAt(x, y) {
    const el = this.game.wheels && this.game.wheels[0];
    if (!el || el.classList.contains('hidden')) return null;
    let best = null, bestD = 72;
    el.querySelectorAll('.ew-slot').forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  }

  showStick(bx, by, nx, ny) {
    if (!this.stickBase) return;
    this.stickBase.style.display = this.stickNub.style.display = 'block';
    this.stickBase.style.left = (bx - 58) + 'px';
    this.stickBase.style.top = (by - 58) + 'px';
    this.stickNub.style.left = (nx - 25) + 'px';
    this.stickNub.style.top = (ny - 25) + 'px';
  }

  // Change what a button shows (the ⚡ button is ⌚ in When Jonathan Was Five).
  relabel(id, label) {
    const b = this.buttons.find((x) => x.id === id);
    if (b) b.el.textContent = label;
    this.labels = { ...(this.labels || {}), [id]: label };
  }

  hideStick() {
    if (!this.stickBase) return;
    this.stickBase.style.display = this.stickNub.style.display = 'none';
  }

  setRunning(on) {
    this.running = on;
    this.stillFor = 0;
    const b = this.buttons.find((x) => x.id === 'sprint');
    if (b) b.el.classList.toggle('on', on);
  }

  // Fold the stick into the keyboard's actions so movement code stays input-agnostic.
  // Called once per fixed 1/60 s step.
  apply() {
    if (!this.active) return;
    const dead = 0.22;
    const set = (action, on) => (on ? input.touchHeld.add(action) : input.touchHeld.delete(action));
    set('forward', this.moveVec.y < -dead);
    set('back', this.moveVec.y > dead);
    set('left', this.moveVec.x < -dead);
    set('right', this.moveVec.x > dead);
    const moving = Math.hypot(this.moveVec.x, this.moveVec.y) > dead;
    this.stillFor = moving ? 0 : this.stillFor + 1 / 60;
    if (this.running && this.stillFor > 2) this.setRunning(false);
    set('sprint', this.running && moving);
    // the wheel shut some other way (caught, a cutscene...): stop holding 😀
    if (this.stickyWheel && !this.game.p1.wheel && performance.now() - this.stickyWheel > 300) {
      this.stickyWheel = 0;
      input.touchHeld.delete('emote');
    }
    this.shopButtons();
  }

  // The Shop's buttons show only at night, and only for what you've got: 🎭 once you own the
  // mask, the pocket button (showing the thing it'll use) once there's something in it, and ↻
  // once there's more than one thing to pick from.
  shopButtons() {
    const g = this.game, shop = g.shop;
    const night = (g.mode === 'night' || g.mode === 'home') && !this.sittingOut;
    const list = night ? shop.pocket() : [];
    for (const b of this.buttons) {
      if (!b.shop) continue;
      const on = night && (b.id === 'mask' ? shop.owns('mask') : b.id === 'item' ? list.length > 0 : list.length > 1);
      const show = on ? 'flex' : 'none';
      if (b.el.style.display !== show) b.el.style.display = show;
      if (!on) continue;
      if (b.id === 'item') { const icon = shop.pocketIcon(g.p1); if (b.el.textContent !== icon) b.el.textContent = icon; }
      if (b.id === 'mask') b.el.classList.toggle('on', !!g.p1.masked);
      if (b.id === 'item') b.el.classList.toggle('on', !!g.p1.skating && shop.pocketItem(g.p1) === 'skate');
    }
  }
}
