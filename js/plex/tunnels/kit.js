// Jack's toolkit: the jobs P.A.L. hands out in the tunnels under the Pizzaplex, shared by
// every Jack chapter after Chapter 4 (chapters/jack.js). Chapter 4 keeps its own copies.
//
//   pal / walkie    P.A.L. on the speakers, Jackson on the walkie-talkie
//   crawl           the vents: too low to stand up in, and too small for an animatronic
//   Still           "stand perfectly still": the lights go out and something walks round you
//   WindowBot       something walks up to a thick window; shock it while it's AT the glass
//   Inspector       it checks every hiding spot in a room: hide, and hold your breath
//   Gate            a locked door (a solid shutter) the chapter opens later
//   Reboot          every so often P.A.L. reboots them: lights out, and they stand still
//   lever           a big lever to pull
//
// Everything a chapter is in the middle of lives on `rt` (the chapter's run state), made fresh
// in its start().
import * as THREE from 'three';
import { G, lam, glowMat } from '../../decor.js';
import { mat, poseRig, setEyes } from '../../models.js';
import { sfx } from '../../audio.js';
import { input } from '../../input.js';
import { ITEMS } from '../../escape/decor.js';
import { ITEM_ICON } from '../../escape/watch.js';

// ── The things Jack finds ───────────────────────────────────────────────

Object.assign(ITEMS, {
  chip:    { color: 0x2de2e6, name: 'memory chip', build: (d, g, glow) => {
    d.mesh(G.box, lam(0x1a3a2a), g, { s: [0.26, 0.04, 0.18], still: false });
    d.mesh(G.box, glow, g, { p: [0, 0.03, 0], s: [0.12, 0.03, 0.1], still: false });
    for (let k = 0; k < 5; k++) d.mesh(G.box, mat(0xd8b040, { metal: 0.8 }), g, { p: [-0.1 + k * 0.05, 0, 0.1], s: [0.02, 0.01, 0.04], still: false });
  } },
  record:  { color: 0xff3fa4, name: "DJ Rocco's record", build: (d, g, glow) => {
    d.mesh(G.cyl, lam(0x111111), g, { s: [0.2, 0.012, 0.2], r: [Math.PI / 2, 0, 0], still: false });
    d.mesh(G.cyl, glow, g, { s: [0.07, 0.016, 0.07], r: [Math.PI / 2, 0, 0], still: false });
  } },
  corekey: { color: 0x7cff6b, name: 'Core Key', build: (d, g, glow) => {
    d.mesh(G.box, glow, g, { s: [0.32, 0.2, 0.03], still: false });
    d.mesh(G.box, lam(0x111111), g, { p: [0, 0.04, 0.02], s: [0.22, 0.04, 0.005], still: false });
    d.mesh(G.sphere, glowMat(0xffffff, 0.5), g, { p: [0.1, -0.05, 0.02], s: [0.03, 0.03, 0.01], still: false });
  } },
});
Object.assign(ITEM_ICON, { chip: '💾', record: '💿', corekey: '🗝️' });

// ── Voices ──────────────────────────────────────────────────────────────

// P.A.L., the Pizzaplex Assistant Line: polite, cheerful, and a little bit wrong.
export function pal(m, text, secs = 4) {
  sfx.plexPal();
  m.say(text, secs, '🔊 P.A.L.');
}

export function walkie(m, text, secs = 4, who = 'Jackson') {
  sfx.plexWalkie();
  m.say(text, secs, `📻 ${who}`);
}

// Say a few lines one after another (only while this chapter's still being played).
export function lines(m, id, list) {
  let t = 0;
  for (const [text, secs, who] of list) {
    setTimeout(() => {
      if (m.game.mode !== 'escape' || m.def.id !== id) return;
      if (who === 'pal') pal(m, text, secs);
      else if (who === 'jackson') walkie(m, text, secs);
      else m.say(text, secs);
    }, t * 1000);
    t += secs + 0.3;
  }
}

// ── Vents ───────────────────────────────────────────────────────────────

// Inside any of these plan rectangles you can't stand up. (Animatronics don't fit: the maps
// take vents off their walking grid.)
export function crawl(m, rt, zones) {
  const p = m.player;
  for (const z of zones) {
    const a = m.place.P(z.x0, z.z0), b = m.place.P(z.x1, z.z1);
    if (p.pos.x > a.x && p.pos.x < b.x && p.pos.z > a.z && p.pos.z < b.z) {
      if (!p.crouching) {
        p.crouching = true;
        if (!rt.ventToast) { rt.ventToast = true; m.game.hud.toast('⤓ It\'s too low to stand up in here — crawl!', 2.6); }
      }
      return true;
    }
  }
  return false;
}

// ── Stand perfectly still ───────────────────────────────────────────────
//
// The lights in a room go out and something walks a loop round it. Move while it's close and
// it hears you. `onDone` runs when the lights come back on.

export function startStill(m, rt, { lights, enemy, loop, len = 16, near = 7, from, line, after, onDone }) {
  for (const l of lights) l.off = true;
  m.game.lighting.apply();
  sfx.blackout();
  if (line) pal(m, line, 6);
  const g = m.enemies.find((e) => e.id === enemy);
  g.pos.copy(m.place.P(...(from || loop[loop.length - 1])));
  g.state = 'goto';
  g.root.visible = true;
  setEyes(g.rig, 'on');
  const pts = loop.map(([x, z]) => m.place.P(x, z));
  rt.still = { t: 0, len, g, loop: pts, i: 0, near, lights, after, onDone };
  g.goTo(pts[0]);
}

export function updateStill(m, rt, dt) {
  const s = rt.still;
  if (!s) return;
  const g = s.g, p = m.player;
  s.t += dt;
  if (!g.path.length) { s.i = (s.i + 1) % s.loop.length; g.goTo(s.loop[s.i]); }
  g.state = 'goto';
  if (g.distToPlayer() < s.near && p.moving > 0.12) {
    rt.still = null;
    m.caught(g, `${g.name} heard you move!`);
    return;
  }
  m.game.hud.toast(`🤫 DON'T MOVE... ${Math.ceil(s.len - s.t)}`, 0.3);
  if (s.t >= s.len) {
    rt.still = null;
    for (const l of s.lights) l.off = false;
    m.game.lighting.apply();
    sfx.powerOn();
    g.state = 'wait';
    g.timer = 8;
    if (s.after) g.pos.copy(m.place.P(...s.after));
    if (s.onDone) s.onDone();
  }
}

// ── Something at a window ───────────────────────────────────────────────
//
// It walks up from `home` to the glass. While it's at the glass, a controlled shock sends it
// back. Shock it when it isn't there and the shock's wasted — and it comes faster. Leave it at
// the glass too long and it breaks through. Three good shocks (or `need`) and it powers down.

export class WindowBot {
  constructor({ build, id, name, home, glass, yaw = Math.PI, need = 3, speed = 0.75, hold = 4.5, back = 3.5, cracks = null }) {
    Object.assign(this, { build, id, name, homeAt: home, glassAt: glass, yaw, need, speed0: speed, hold, backSpeed: back, cracksName: cracks });
    this.rig = null;
    this.state = 'asleep';
  }

  place(m, { awake = false, done = false } = {}) {
    if (!this.rig) {
      this.rig = this.build();
      this.rig.root.rotation.order = 'YXZ';
      m.game.scene.add(this.rig.root);
      this.obj = { id: this.id, name: this.name, def: { kind: 'watcher' }, rig: this.rig, root: this.rig.root, pos: new THREE.Vector3(), yaw: this.yaw };
    }
    this.home = m.place.P(...this.homeAt);
    this.glass = m.place.P(...this.glassAt);
    this.obj.pos.copy(this.home);
    this.state = done ? 'done' : awake ? 'coming' : 'asleep';
    this.finished = done;
    this.speed = this.speed0;
    this.at = 0;
    this.shocks = 0;
    this.rig.root.visible = true;
    setEyes(this.rig, awake ? 'on' : 'dim');
    this.draw(m, 0);
  }

  hide() { if (this.rig) this.rig.root.visible = false; }

  go() {
    if (this.state === 'done') return;
    this.state = 'coming';
    this.at = 0;
    setEyes(this.rig, 'on');
    sfx.reboot(this.obj.pos);
  }

  // Returns true on the shock that finishes it, 'pending' otherwise.
  shock(m, { early, good, last } = {}) {
    sfx.plexShock();
    m.game.effects.burst(this.glass.clone().setY(1.6), 14, 3);
    if (this.state !== 'window') {
      this.speed *= 1.25;
      pal(m, early || `Too early! That shock was wasted, and now ${this.name} is angry. Please wait until he is AT the window.`, 4.5);
      return 'pending';
    }
    this.shocks++;
    this.state = 'back';
    sfx.powerDown(this.obj.pos);
    this.setCracks(m, 0);
    if (this.shocks >= this.need) { this.finished = true; if (last) pal(m, last, 4); return true; }
    pal(m, (good || ['Good shocking! He will be back. Be ready.', 'Excellent! Again, please.', 'One more, please!'])[Math.min(this.shocks - 1, 2)], 3.5);
    if (m.watch.open) m.watch.render();
    return 'pending';
  }

  setCracks(m, k) {
    const c = this.cracksName && m.decor[this.cracksName];
    if (c) c.material.opacity = k;
  }

  update(m, dt) {
    if (!this.rig || !this.home) return;
    const o = this.obj;
    if (this.state === 'coming') {
      const to = this.glass;
      const dx = to.x - o.pos.x, dz = to.z - o.pos.z, dd = Math.hypot(dx, dz);
      const v = this.speed * m.game.diff.speed;
      if (dd < 0.1) { this.state = 'window'; this.at = 0; sfx.pound(o.pos); }
      else o.pos.set(o.pos.x + (dx / dd) * Math.min(dd, v * dt), 0, o.pos.z + (dz / dd) * Math.min(dd, v * dt));
    } else if (this.state === 'window') {
      this.at += dt;
      this.setCracks(m, Math.min(0.5, this.at / 8));
      if (Math.random() < dt * 1.5) sfx.pound(o.pos);
      if (this.at > this.hold) {
        this.state = 'asleep';
        sfx.crash(o.pos);
        m.caught(o, `${this.name} broke through the glass!`);
        if (m.game.mode === 'escape') { this.state = 'back'; this.setCracks(m, 0); }   // (a second chance)
        return;
      }
    } else if (this.state === 'back') {
      const to = this.home;
      const dx = to.x - o.pos.x, dz = to.z - o.pos.z, dd = Math.hypot(dx, dz);
      if (dd < 0.1 && this.finished) { this.state = 'done'; setEyes(this.rig, 'dim'); sfx.powerDown(o.pos); }
      else if (dd < 0.1) { this.state = 'coming'; this.speed *= 1.1; }
      else o.pos.set(o.pos.x + (dx / dd) * Math.min(dd, this.backSpeed * dt), 0, o.pos.z + (dz / dd) * Math.min(dd, this.backSpeed * dt));
    }
    this.draw(m, dt);
  }

  draw(m, dt) {
    const o = this.obj, r = this.rig.root;
    r.position.set(o.pos.x, 0, o.pos.z);
    r.rotation.set(0, this.yaw, 0);
    const moving = this.state === 'coming' || this.state === 'back';
    this.t = (this.t || 0) + dt;
    poseRig(this.rig, this.state === 'window' ? 'stare' : moving ? 'walk' : 'idle', this.t * (moving ? 6 : 1), moving ? 1 : 0.3, dt || 1 / 60);
  }
}

// ── The inspection: hide, and hold your breath ──────────────────────────
//
// It comes into a room and checks each hiding spot in turn (`route`: plan points it stops at,
// with how long it lingers). Anywhere but a hiding spot and it sees you. In a hiding spot it
// can still HEAR you breathe when it's close — hold SPACE (or SHIFT, or F) to hold your
// breath. You can only hold it for so long.

const BREATH = 7;

export function holdingBreath() {
  return input.keysHeld.has('Space') || input.down('sprint') || input.down('flashlight');
}

export function startInspection(m, rt, { enemy, route, near = 3.2, sight = 8, onDone }) {
  const e = m.enemies.find((x) => x.id === enemy);
  e.wake(1);
  e.state = 'goto';
  e.root.visible = true;
  setEyes(e.rig, 'on');
  rt.insp = { e, route: route.map(([x, z, wait]) => ({ at: m.place.P(x, z), wait })), i: 0, linger: 0, near, sight, breath: BREATH, close: 0, onDone };
  e.goTo(rt.insp.route[0].at);
}

export function updateInspection(m, rt, dt) {
  const s = rt.insp;
  if (!s) return;
  const e = s.e, p = m.player;
  // walk its route, lingering at each stop
  if (e.state === 'watch' || !e.path.length) {
    s.linger += dt;
    e.yaw += Math.sin(m.game.t * 2) * dt;
    if (s.linger >= s.route[s.i].wait) {
      s.linger = 0;
      s.i++;
      if (s.i >= s.route.length) {
        rt.insp = null;
        e.state = 'wait';
        e.timer = 3;
        if (s.onDone) s.onDone();
        return;
      }
      e.state = 'goto';
      e.goTo(s.route[s.i].at);
    }
  } else e.state = 'goto';
  const d = e.distToPlayer();
  // out in the open: it sees you
  if (!m.hiding && d < s.sight && m.place.sightClear(e.eye(), p.pos)) {
    rt.insp = null;
    m.caught(e, `${e.name} found you!`);
    return;
  }
  // hiding: hold your breath while it's close
  const holding = holdingBreath() && s.breath > 0;
  if (holding) s.breath = Math.max(0, s.breath - dt);
  else s.breath = Math.min(BREATH, s.breath + dt / 3);
  if (m.hiding && d < s.near + 2) {
    const bar = '█'.repeat(Math.ceil((s.breath / BREATH) * 6)) + '░'.repeat(6 - Math.ceil((s.breath / BREATH) * 6));
    m.game.hud.toast(`🫁 ${holding ? 'Holding your breath...' : 'HOLD SPACE — hold your breath!'} ${bar}`, 0.3);
  }
  if (m.hiding && d < s.near && !holding) {
    s.close += dt;
    if (s.close > 0.7) {
      rt.insp = null;
      m.caught(e, `${e.name} heard you breathing!`);
    }
  } else s.close = Math.max(0, s.close - dt);
}

// ── Locked doors ────────────────────────────────────────────────────────

// A shutter across a doorway (plan rectangle). Shut, it's solid; open, it's gone.
export function makeGate(d, { x0, z0, x1, z1, color = 0x6a7078, label = null, facing = 'south', at = null }) {
  const place = d.place;
  const c = place.addBlock(x0, z0, x1, z1, 3, { nav: false });
  const a = place.P(x0, z0), b = place.P(x1, z1);
  const mesh = d.mesh(G.box, mat(color, { metal: 0.6, rough: 0.35 }), d.group,
    { p: [(a.x + b.x) / 2, 1.3, (a.z + b.z) / 2], s: [Math.abs(b.x - a.x), 2.6, Math.abs(b.z - a.z)], still: false });
  const stripes = [];
  if (label && at) stripes.push(d.label(label, at[0], at[1], 2.85, 2.2, 0.35, facing, { bg: '#2a0606', fg: '#ff3b30', glow: '#ff3b30' }));
  const gate = {
    open: true,
    set(open) {
      if (open === gate.open) return;
      gate.open = open;
      mesh.visible = !open;
      const i = place.colliders.indexOf(c);
      if (open && i >= 0) place.colliders.splice(i, 1);
      if (!open && i < 0) place.colliders.push(c);
      for (const s of stripes) s.visible = !open;
    },
  };
  gate.open = false;
  return gate;
}

// ── Reboots ─────────────────────────────────────────────────────────────
//
// Every `every` seconds P.A.L. reboots the animatronics: a warning, then the lights go out
// for `dark` seconds and every one of them stands still with its eyes off. After, they start
// up again where they stood.

export function startReboots(rt, { first = 12, every = 26, dark = 7, warn = 2.5 } = {}) {
  rt.reboot = { next: first, every, dark, warn, on: 0, warned: false };
}

export function rebooting(rt) { return !!(rt.reboot && rt.reboot.on > 0); }

export function updateReboots(m, rt, dt) {
  const r = rt.reboot;
  if (!r) return;
  if (r.on > 0) {
    r.on -= dt;
    for (const e of m.enemies) e.state = 'off';
    m.game.hud.toast(`🔌 REBOOTING... ${Math.ceil(r.on)}  — they can't see you!`, 0.3);
    if (r.on <= 0) {
      for (const e of m.enemies) {
        if (!e.root.visible) continue;
        e.state = 'wait';
        e.timer = e.def.wait > 100 ? e.def.wait : 1.5;
        setEyes(e.rig, 'on');
        sfx.reboot(e.pos);
      }
      pal(m, 'Reboot complete! Everybody is awake again.', 2.6);
    }
    return;
  }
  r.next -= dt;
  if (r.next <= r.warn && !r.warned) {
    r.warned = true;
    pal(m, 'Rebooting all animatronics in three... two...', 2.4);
  }
  if (r.next <= 0) {
    r.next = r.every;
    r.warned = false;
    r.on = r.dark;
    m.game.lighting.glitch(r.dark);
    sfx.blackout();
    for (const e of m.enemies) { e.state = 'off'; e.path = []; setEyes(e.rig, 'off'); }
  }
}

// ── Levers ──────────────────────────────────────────────────────────────

// A big red lever on a panel. `d.levers[id].pull()` throws it down.
export function lever(d, id, px, pz, facing, name) {
  let handle = null;
  d.target(id, px, pz, facing, name, (g) => {
    d.mesh(G.box, mat(0x3a3d44, { metal: 0.5, rough: 0.4 }), g, { p: [0, 1.1, -0.15], s: [0.7, 1.2, 0.2] });
    d.mesh(G.box, lam(0xffd23f), g, { p: [0, 1.75, -0.04], s: [0.72, 0.08, 0.02] });
    handle = new THREE.Group();
    handle.position.set(0, 1.1, -0.02);
    g.add(handle);
    d.mesh(G.cyl, mat(0xc0c0c0, { metal: 0.8 }), handle, { p: [0, 0.25, 0.08], s: [0.04, 0.5, 0.04], still: false });
    d.mesh(G.sphere, mat(0xd11f2a, { rough: 0.3 }), handle, { p: [0, 0.5, 0.08], s: [0.09, 0.09, 0.09], still: false });
    handle.rotation.x = 0.5;
  });
  d.levers = d.levers || {};
  d.levers[id] = {
    pull() { if (handle) handle.rotation.x = 2.4; },
    reset() { if (handle) handle.rotation.x = 0.5; },
  };
}
