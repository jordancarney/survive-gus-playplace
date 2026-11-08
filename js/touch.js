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
import { input } from './input.js';

const BTN = 62;

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
    if (v && !this.built) this.build();
    for (const b of this.buttons) b.el.style.display = v ? 'flex' : 'none';
    if (this.stickBase) { this.stickBase.style.display = 'none'; this.stickNub.style.display = 'none'; }
    if (!v) {
      this.moveId = this.lookId = null;
      this.moveVec = { x: 0, y: 0 };
      this.setRunning(false);
      for (const a of ['forward', 'back', 'left', 'right', 'sprint']) input.held.delete(a);
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
    ];
    for (const d of defs) {
      const el = document.createElement('div');
      el.className = 'tbtn';
      el.textContent = (this.labels && this.labels[d.id]) || d.label;
      const size = d.size || BTN;
      el.style.width = el.style.height = size + 'px';
      if (d.right !== undefined) el.style.right = `calc(${d.right}px + env(safe-area-inset-right))`;
      if (d.left !== undefined) el.style.left = `calc(${d.left}px + env(safe-area-inset-left))`;
      if (d.bottom !== undefined) el.style.bottom = `calc(${d.bottom}px + env(safe-area-inset-bottom))`;
      if (d.top !== undefined) el.style.top = `calc(${d.top}px + env(safe-area-inset-top))`;
      el.style.display = 'none';
      this.layer.appendChild(el);
      this.buttons.push({ ...d, el, touchId: null });
    }
  }

  buttonAt(x, y) {
    for (const b of this.buttons) {
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
    }
  }

  onStart(e) {
    this.setActive(true);
    if (!this.game.isPlaying()) return;
    // Let taps through to the camera map and puzzle buttons.
    if (e.target.closest && e.target.closest('#camUI, #repairUI, #dayPanel')) return;
    e.preventDefault();
    for (const t of e.changedTouches) {
      const btn = this.buttonAt(t.clientX, t.clientY);
      if (btn && btn.touchId === null) { btn.touchId = t.identifier; this.press(btn, true); continue; }
      if (t.clientX < innerWidth * 0.45 && this.moveId === null) {
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
        this.game.player.addLook(dx, dy);
      }
    }
  }

  onEnd(e) {
    for (const t of e.changedTouches) {
      for (const b of this.buttons) if (b.touchId === t.identifier) { b.touchId = null; this.press(b, false); }
      if (t.identifier === this.moveId) { this.moveId = null; this.moveVec = { x: 0, y: 0 }; this.hideStick(); }
      if (t.identifier === this.lookId) this.lookId = null;
    }
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
    const set = (action, on) => (on ? input.held.add(action) : input.held.delete(action));
    set('forward', this.moveVec.y < -dead);
    set('back', this.moveVec.y > dead);
    set('left', this.moveVec.x < -dead);
    set('right', this.moveVec.x > dead);
    const moving = Math.hypot(this.moveVec.x, this.moveVec.y) > dead;
    this.stillFor = moving ? 0 : this.stillFor + 1 / 60;
    if (this.running && this.stillFor > 2) this.setRunning(false);
    set('sprint', this.running && moving);
  }
}
