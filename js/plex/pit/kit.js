// Thomas's chapters (they play like Into the Pit): the pieces they're all built from.
//
// Every one of them is one Building with the present on its left — the Pizzaplex's Giant Ball
// Pit (B) and the room you get out through (H) — and one or more other times on its right,
// none of them joined up. Diving into a ball pit moves you from one to another (`travel`),
// and each place (a "zone") has its own light: day long ago, night now. What you do in the
// past changes the present.
//
// A chapter lists its zones as `zones: { now: { at, yaw, mood, flashlight }, past: {...} }`
// (plan metres; where you come up, which way you face) and keeps which one you're in as
// `m.flags.zone`, so a save box remembers it.
import * as THREE from 'three';
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, poseRig } from '../../models.js';
import { resolveCircle } from '../../physics.js';
import { sfx } from '../../audio.js';
import { ITEMS } from '../../escape/decor.js';
import { ITEM_ICON } from '../../escape/watch.js';

export const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;

// Lighting for each kind of place.
export const MOODS = {
  now: { amb: 0.07, hemi: 0.07, fog: 0.035, bg: 0x05030a },
  day: { amb: 0.6, hemi: 0.65, fog: 0.006, bg: 0xbfd8f0, env: 'day', envI: 0.5 },
  dusk: { amb: 0.42, hemi: 0.45, fog: 0.01, bg: 0x4a3248 },
  night: { amb: 0.09, hemi: 0.09, fog: 0.03, bg: 0x05040c },
  storm: { amb: 0.05, hemi: 0.06, fog: 0.03, bg: 0x02030a },
  lamp: { amb: 0.34, hemi: 0.34, fog: 0.012, bg: 0x2a1a0c },
};

// Things to find in Thomas's chapters that nobody else has.
const card = (d, g, glow) => d.mesh(G.box, glow, g, { s: [0.22, 0.3, 0.02], still: false });
Object.assign(ITEMS, {
  ticket: { color: 0xff5a5f, name: 'PlayPlace ticket', build: (d, g, glow) => {
    d.mesh(G.box, glow, g, { s: [0.32, 0.14, 0.01], still: false });
    d.mesh(G.box, lam(0xffffff), g, { p: [0, 0, 0.008], s: [0.2, 0.05, 0.004], still: false });
  } },
  sheet: { color: 0xfff4c8, name: 'song sheet', build: (d, g, glow) => card(d, g, glow) },
  mkey: { color: 0xffd23f, name: 'music box key', build: (d, g) => {
    const gold = mat(0xf2c230, { metal: 0.8, rough: 0.25, emissive: 0x4a3400 });
    d.mesh(G.torus, gold, g, { p: [0, 0.1, 0], s: [0.09, 0.09, 0.09], still: false });
    d.mesh(G.cyl, gold, g, { p: [0, -0.06, 0], s: [0.025, 0.24, 0.025], still: false });
    d.mesh(G.box, gold, g, { p: [0.04, -0.16, 0], s: [0.08, 0.05, 0.02], still: false });
  } },
  memory: { color: 0x9fd8ff, name: 'keepsake', build: (d, g, glow) => {
    d.mesh(new THREE.OctahedronGeometry(0.15), glow, g, { s: [1, 1.3, 1], still: false });
  } },
});
Object.assign(ITEM_ICON, { ticket: '🎟️', sheet: '🎼', mkey: '🗝️', memory: '💠' });

// ── The present: the Pizzaplex's Giant Ball Pit and the way out ──────────

export function nowRooms(exit) {
  return {
    B: { name: 'Giant Ball Pit', short: 'Ball Pit', x0: 1, z0: 1, x1: 22, z1: 16,
         floor: () => T.playmat(), wall: ['#3a2a7a', '#ffd23f', '#1f9fbf', 'bubbles'] },
    H: { x0: 1, z0: 18, x1: 22, z1: 32, ...exit },
  };
}
export const NOW_DOOR = { a: 'B', b: 'H', x0: 9, z0: 17, x1: 12, z1: 17 };
export const NOW_AT = { at: [11, 11.6], yaw: 0, mood: MOODS.now, flashlight: true };
export const SPAWN = [11, 14.6];

// The Giant Ball Pit: knee-deep balls, and the spot at its edge where you dive in.
export function giantPit(d, { glow = 0xff9ab8, glow2 = 0x9f7fff, label = 'GIANT BALL PIT' } = {}) {
  const P = d.place.P;
  const wall = mat(0x2a4fa0, { rough: 0.4 });
  d.block(11.5, 2.6, 18, 0.25, 0.8, wall);
  d.block(2.6, 7.5, 0.25, 10, 0.8, wall);
  d.block(20.4, 7.5, 0.25, 10, 0.8, wall);
  d.block(5.5, 12.6, 6, 0.25, 0.8, wall);
  d.block(17.5, 12.6, 6, 0.25, 0.8, wall);
  const a = P(2.8, 2.8), b = P(20.2, 12.4);
  d.place.slowZones.push({ x0: a.x, z0: a.z, x1: b.x, z1: b.z });
  d.balls(2.8, 2.8, 20.2, 12.4, 520);
  d.label(label, 11.5, 1.04, 3.0, 6, 1.0, 'south', { bg: '#0a0614', fg: '#ff3fa4', glow: '#ffd23f' });
  d.target('dive', 11.5, 11.2, 'south', 'DIVE into the ball pit! 🫧', null, { reach: 2.2 });
  d.lamp(6, 8, 3.6, glow, 0.8, { distance: 10, room: 'B', flicker: true });
  d.lamp(17, 8, 3.6, glow2, 0.8, { distance: 10, room: 'B' });
  d.hideSpot('tube', 21.0, 15.0, 'west', { color: 0x3ec1d3 });
  d.savePoint(2, 15.2, 'east');
}

// A small ball pit in another time, its sign, and the spot to jump back in. (cx, cz) is its
// middle; you come up at (cx, cz) facing east, and climb out on the east side.
export function smallPit(d, cx, cz, { id = 'home', name = 'Jump back in the ball pit — go HOME! 🫧', color = 0xd11f2a, sign = 'BALL PIT', signFg = '#c0262d', signBg = '#ffd23f', n = 160 } = {}) {
  const P = d.place.P;
  const m = mat(color, { rough: 0.4 });
  d.block(cx, cz - 2.8, 4.6, 0.2, 0.6, m);
  d.block(cx - 2.2, cz - 0.4, 0.2, 5, 0.6, m);
  d.block(cx + 2.2, cz - 1.6, 0.2, 2.4, 0.6, m);
  const a = P(cx - 2, cz - 2.6), b = P(cx + 2, cz + 2);
  d.place.slowZones.push({ x0: a.x, z0: a.z, x1: b.x, z1: b.z });
  d.balls(cx - 2, cz - 2.6, cx + 2, cz + 2, n);
  d.label(sign, cx, cz - 2.95, 1.5, 1.5, 0.6, 'south', { bg: signBg, fg: signFg, glow: '#ffffff' });
  return d.target(id, cx, cz, 'east', name, null, { reach: 2.0 });
}

// Sunny (or stormy) windows on a wall.
export function windows(d, list, color = 0xcfeeff, k = 0.35) {
  const out = [];
  for (const [x, z, facing, y = 2.0, w = 3.0, h = 1.4] of list) {
    const g = d.anchor(x, z, facing, y);
    const pane = d.mesh(G.plane, glowMat(color, k), g, { s: [w, h, 1], shadow: false, still: false });
    const frame = lam(0xf4f1ea);
    for (const yy of [-h / 2, h / 2]) d.mesh(G.box, frame, g, { p: [0, yy, 0.02], s: [w + 0.1, 0.07, 0.05] });
    for (const xx of [-w / 2, 0, w / 2]) d.mesh(G.box, frame, g, { p: [xx, 0, 0.02], s: [0.06, h, 0.05] });
    out.push(pane);
  }
  return out;
}

// Boards nailed across a door, so it reads as stuck shut until they come off.
export function boards(d, x, z) {
  const P = d.place.P;
  return [[0.6, 0.2], [1.3, -0.15], [1.9, 0.1]].map(([y, r]) => {
    const c = P(x, z, y);
    return d.mesh(G.box, lam(0x8a6a42), d.group, { p: [c.x, c.y, c.z], s: [1.9, 0.16, 0.06], r: [0, 0, r], still: false });
  });
}

// ── People frozen in time ──────────────────────────────────────────────

// `specs`: [{ x, z, yaw, build, pose, amt, phase }]. Built once per level.
export function frozen(m, key, specs) {
  const d = m.decor;
  if (d[key]) return d[key];
  d[key] = specs.map((s) => {
    const rig = s.build();
    rig.root.position.copy(m.place.P(s.x, s.z, s.y || 0));
    rig.root.rotation.y = s.yaw || 0;
    poseRig(rig, s.pose || 'idle', s.phase ?? 1.3, s.amt ?? 0.35, 1);
    d.group.add(rig.root);
    return rig;
  });
  return d[key];
}

export const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ── Diving through time ─────────────────────────────────────────────────

// Into a ball pit, and up somewhere (somewhen) else.
export function travel(m, zone, line) {
  const p = m.player;
  const lv = m.level;
  sfx.plexSplash();
  setTimeout(() => sfx.plexTime(), 250);
  const fade = document.getElementById('fade');
  fade.classList.add('on');
  m.grace = 2;
  setTimeout(() => {
    fade.classList.remove('on');
    if (m.game.mode !== 'escape' || m.level !== lv) return;
    const z = m.def.zones[zone];
    p.pos.copy(m.place.P(...z.at));
    p.vel.set(0, 0, 0);
    p.yaw = z.yaw;
    p.crouching = false;
    m.flags.zone = zone;
    setZone(m);
    m.room = null;
    if (m.def.arrive) m.def.arrive(m, zone);
    if (line) m.say(line, 3.6);
  }, 650);
}

// The light for wherever you are now.
export function setZone(m) {
  const z = m.def.zones[m.flags.zone || 'now'];
  m.game.lighting.setEscape(m.decor, z.mood);
  m.player.lightOn = !!z.flashlight;
  for (const e of m.enemies) e.root.visible = true;
}

export function zone(m) { return m.flags.zone || 'now'; }

export const enemy = (m, id) => m.enemies.find((e) => e.id === id);

// Keep a music box playing while you're in this level (and only then).
export function musicBoxAt(m, getPos) {
  const lv = m.level;
  return () => (m.game.mode === 'escape' && m.level === lv ? getPos() : null);
}

// ── Somebody following you (Timmy, in Chapter 25) ───────────────────────

export class Follower {
  constructor(m, build) {
    this.mode = m;
    this.rig = build();
    this.root = this.rig.root;
    this.root.rotation.order = 'YXZ';
    this.root.visible = false;
    m.game.scene.add(this.root);
    this.pos = new THREE.Vector3();
    this.yaw = 0;
    this.path = [];
    this.repath = 0;
    this.t = 0;
  }

  place(at) { this.pos.copy(at); this.path = []; this.root.visible = true; }
  hide() { this.root.visible = false; }

  update(dt) {
    if (!this.root.visible) return;
    const m = this.mode, place = m.place, p = m.player;
    this.t += dt;
    let pose = 'idle';
    const f = p.forward2();
    const goal = new THREE.Vector3(p.pos.x - f.x * 1.1 - f.z * 0.5, 0, p.pos.z - f.z * 1.1 + f.x * 0.5);
    if (!place.isWalkable(goal.x, goal.z)) goal.set(p.pos.x - f.x * 0.9, 0, p.pos.z - f.z * 0.9);
    if (!place.isWalkable(goal.x, goal.z)) goal.set(p.pos.x, 0, p.pos.z);
    const d = Math.hypot(goal.x - this.pos.x, goal.z - this.pos.z);
    if (Math.hypot(p.pos.x - this.pos.x, p.pos.z - this.pos.z) > 13) {
      this.pos.set(p.pos.x - f.x * 1.0, 0, p.pos.z - f.z * 1.0);
      this.path = [];
    } else if (d > 0.45) {
      const speed = d > 3.5 ? 6.2 : 3.9;
      let target = goal;
      if (!place.walkClear(this.pos, goal, 0.2)) {
        this.repath -= dt;
        if (this.repath <= 0 || !this.path.length) { this.repath = 0.5; this.path = place.findPath(this.pos, goal); }
        while (this.path.length && Math.hypot(this.path[0].x - this.pos.x, this.path[0].z - this.pos.z) < 0.3) this.path.shift();
        if (this.path.length) target = this.path[0];
      } else this.path = [];
      const dx = target.x - this.pos.x, dz = target.z - this.pos.z;
      const dl = Math.hypot(dx, dz) || 1;
      const step = Math.min(dl, speed * dt);
      const s = resolveCircle(place.colliders, this.pos.x + (dx / dl) * step, this.pos.z + (dz / dl) * step, 0.2, 0.3, 1.0);
      const moved = Math.hypot(s.x - this.pos.x, s.z - this.pos.z) / dt;
      this.pos.x = s.x;
      this.pos.z = s.z;
      this.yaw = Math.atan2(dx, dz);
      pose = moved > 0.3 ? 'walk' : 'idle';
    } else {
      this.yaw = Math.atan2(p.pos.x - this.pos.x, p.pos.z - this.pos.z);
    }
    this.root.position.set(this.pos.x, place.floorAt(this.pos.x, this.pos.z), this.pos.z);
    this.root.rotation.set(0, this.yaw, 0);
    poseRig(this.rig, pose, pose === 'walk' ? this.t * 11 : this.t, 1, dt);
  }
}

// ── Common bits of a Thomas chapter ─────────────────────────────────────

export const THOMAS = {
  hero: 'thomas',
  exitText: 'Out you go! 🏃',
};

// A present-day animatronic that hangs round the Giant Ball Pit.
export const nowBot = (id, name, build, extra = {}) => ({
  id, name, build, walk: 1.8, chase: 3.7, sight: 9, hear: 10, hunt: 0.35, lose: 5,
  roam: ['B', 'H', 'B'], start: [4, 4], wait: 8, steps: id === 'rocco' || id === 'sparky' ? 'gerald' : id, stride: 1.0, shoutWho: name, ...extra,
});
