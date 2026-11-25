// Everything inside Culac's Daycare: thousands of beds, tables, arcade machines, cribs and
// trees, because the rooms are as big as the designer drew them. Almost all of it is drawn
// instanced (Furnish: one batch per colour per shape per chunk of floor), so a room with
// thirteen thousand beds is still only a handful of draws near you.
//
// What you can use — save boxes, hiding spots, the security cameras, signs — goes through
// EscapeDecor like every other story's level. The lamps are spots: the mode moves a small,
// fixed set of real lights to whichever spots are nearest you (CulacMode.updateLamps), and
// every spot has a glowing bulb so you can see the lights far off in the dark.
import * as THREE from 'three';
import { EscapeDecor } from '../escape/decor.js';
import { lam, glowMat } from '../decor.js';
import { cloth } from '../models.js';
import { surface } from '../materials.js';
import { neon } from '../sushi/kit.js';
import { CHUNK, instanced } from './place.js';
import { ROOMS, DOORS, BEDS, HOMES, EXITS, MAZE_HOME, mazeCell, MAZE_PITCH } from './layout.js';

const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 10),
  cylLo: new THREE.CylinderGeometry(1, 1, 1, 6),
  cone: new THREE.ConeGeometry(1, 1, 8),
  sphere: new THREE.SphereGeometry(1, 10, 7),
  plane: new THREE.PlaneGeometry(1, 1),
};

function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Furnish: instanced furniture ────────────────────────────────────────

export class Furnish {
  constructor(place) {
    this.place = place;
    this.buckets = new Map();
    this.mats = new Map();
    this.e = new THREE.Euler(0, 0, 0, 'YXZ');
    this.q = new THREE.Quaternion();
  }

  material(color, glow, kind) {
    const key = `${color}|${glow}|${kind}`;
    if (!this.mats.has(key)) this.mats.set(key, glow ? glowMat(color, glow) : kind === 'cloth' ? cloth(color) : lam(color));
    return this.mats.get(key);
  }

  put(geo, color, px, pz, y, sx, sy, sz, { rx = 0, ry = 0, rz = 0, glow = 0, shadow = true, kind = '' } = {}) {
    const p = this.place.P(px, pz, y);
    this.e.set(rx, ry, rz);
    this.q.setFromEuler(this.e);
    const m = new THREE.Matrix4().compose(p, this.q, new THREE.Vector3(sx, sy, sz));
    const key = `${geo}|${color}|${glow}|${shadow ? 1 : 0}|${kind}|${Math.floor(px / CHUNK)},${Math.floor(pz / CHUNK)}`;
    let b = this.buckets.get(key);
    if (!b) this.buckets.set(key, (b = { geo, color, glow, shadow, kind, list: [] }));
    b.list.push(m);
  }

  // A box standing on the floor (or at `y`). `solid` bumps into you and blocks the way.
  box(px, pz, w, d, h, color, { y = 0, ry = 0, rx = 0, rz = 0, solid = false, nav = solid, glow = 0, shadow = true, kind = '', blockH = null } = {}) {
    this.put('box', color, px, pz, y + h / 2, w, h, d, { rx, ry, rz, glow, shadow, kind });
    if (solid || nav) {
      const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry));
      const hw = (w * c + d * s) / 2, hd = (w * s + d * c) / 2;
      if (solid) this.place.addBlock(px - hw, pz - hd, px + hw, pz + hd, blockH ?? y + h, { nav });
      else this.place.blockNav(px - hw, pz - hd, px + hw, pz + hd);
    }
  }

  // (`lying`: on its side, a tube or a bar, centred at `y` rather than standing on it)
  cyl(px, pz, r, h, color, { y = 0, solid = false, glow = 0, lo = false, rx = 0, ry = 0, rz = 0, shadow = true, sx = null, lying = false } = {}) {
    this.put(lo ? 'cylLo' : 'cyl', color, px, pz, lying ? y : y + h / 2, sx ?? r, h, r, { rx, ry, rz, glow, shadow });
    if (solid) this.place.addBlock(px - r, pz - r, px + r, pz + r, y + h);
  }

  cone(px, pz, r, h, color, { y = 0, glow = 0, shadow = true } = {}) {
    this.put('cone', color, px, pz, y + h / 2, r, h, r, { glow, shadow });
  }

  ball(px, pz, y, r, color, { glow = 0, shadow = true, sx = null, sy = null, sz = null, ry = 0 } = {}) {
    this.put('sphere', color, px, pz, y, sx ?? r, sy ?? r, sz ?? r, { glow, shadow, ry });
  }

  // Something flat on the floor: a rug, a mat, a puddle of water.
  flat(px, pz, w, d, color, { y = 0.015, ry = 0, glow = 0 } = {}) {
    this.put('plane', color, px, pz, y, w, d, 1, { rx: -Math.PI / 2, ry, glow, shadow: false });
  }

  build(group) {
    for (const b of this.buckets.values()) {
      group.add(instanced(GEO[b.geo], this.material(b.color, b.glow, b.kind), b.list, b.shadow));
    }
    this.buckets.clear();
  }
}

// ── Keeping the way clear ───────────────────────────────────────────────
//
// Doorways, save boxes, hiding spots, exits and everyone's starting place are reserved
// first, and the furniture goes round them.

class Reserve {
  constructor(size) {
    this.n = Math.ceil(size / 4);
    this.cells = new Uint8Array(this.n * this.n);
  }
  add(px, pz, r) {
    const n = this.n;
    for (let x = Math.floor((px - r) / 4); x <= Math.floor((px + r) / 4); x++) {
      for (let z = Math.floor((pz - r) / 4); z <= Math.floor((pz + r) / 4); z++) {
        if (x >= 0 && z >= 0 && x < n && z < n) this.cells[z * n + x] = 1;
      }
    }
  }
  free(px, pz, r = 1) {
    const n = this.n;
    for (let x = Math.floor((px - r) / 4); x <= Math.floor((px + r) / 4); x++) {
      for (let z = Math.floor((pz - r) / 4); z <= Math.floor((pz + r) / 4); z++) {
        if (x >= 0 && z >= 0 && x < n && z < n && this.cells[z * n + x]) return false;
      }
    }
    return true;
  }
}

// ── The shared decor ────────────────────────────────────────────────────

export class DaycareDecor extends EscapeDecor {
  constructor(place) {
    super(place);
    this.lampSpots = [];     // { pos, color, k, distance, flicker, room }
    this.pits = [];          // the ball pit's quarters: plan rectangles full of balls
    this.kidBeds = [];       // the beds the kids are sleeping in: { at: [x, z], pos }
    this.cams = [];
  }

  // A lamp: a bulb you can see from far off, and a spot a real light can be moved to.
  lampSpot(F, px, pz, y, color, k = 2, { distance = 14, flicker = false, size = 0.14, fixture = true } = {}) {
    F.ball(px, pz, y, size, color, { glow: 0.5, shadow: false });
    if (fixture) F.cyl(px, pz, size * 1.6, 0.06, 0x2a2a30, { y: y + size, shadow: false });
    this.lampSpots.push({ pos: this.place.P(px, pz, y - 0.15), color: new THREE.Color(color), k, distance, flicker, room: this.place.roomAt(...xz(this.place, px, pz)) });
  }
}

const xz = (place, px, pz) => { const p = place.P(px, pz); return [p.x, p.z]; };

// What's in a room at a plan point.
const roomOf = (place, px, pz) => place.roomAt(...xz(place, px, pz));

export function buildDaycare(d) {
  const place = d.place;
  const F = new Furnish(place);
  const R = new Reserve(place.w);
  const rand = seeded(77);
  const inRoom = (id, px, pz) => roomOf(place, px, pz) === id;

  // ── Reserved first ──────────────────────────────────────────────────
  for (const dr of DOORS) {
    const cx = (dr.x0 + dr.x1 + 1) / 2, cz = (dr.z0 + dr.z1 + 1) / 2;
    R.add(cx, cz, 9);
  }
  for (const e of Object.values(EXITS)) R.add(e.at[0], e.at[1], 7);
  for (const h of Object.values(HOMES)) R.add(h[0], h[1], 6);
  R.add(BEDS.jimmy[0], BEDS.jimmy[1] - 2.5, 9);

  // ── Save boxes and hiding spots ─────────────────────────────────────
  const saveAt = (px, pz, facing) => { R.add(px, pz, 3); d.savePoint(px, pz, facing); };
  const hideAt = (kind, px, pz, facing, color) => { R.add(px, pz, 3); d.hideSpot(kind, px, pz, facing, { color }); };

  // near Jimmy's bed, and then all over
  saveAt(1142, 268, 'west');
  for (let x = 80; x < 1525; x += 170) {
    for (let z = 80; z < 2182; z += 170) {
      // a save box in the hallway wherever this lattice point is out in the open
      const ok = [[0, 0], [3, 0], [-3, 0], [0, 3], [0, -3]].every(([dx, dz]) => roomOf(place, x + dx, z + dz) === 'H');
      if (ok) saveAt(x, z, ['north', 'south', 'east', 'west'][(x + z) % 4]);
    }
  }
  const roomSaves = {
    P: [[620, 300, 'west'], [320, 940, 'north']], A: [[520, 1010, 'south'], [660, 1070, 'west']],
    B: [[900, 320, 'north'], [1400, 320, 'north'], [760, 200, 'east']], O: [[1370, 450, 'east']],
    S: [[1000, 520, 'south'], [720, 800, 'east'], [1290, 1000, 'west'], [900, 1110, 'north']],
    Z: [[1370, 840, 'east']], M: [[920, 1220, 'south'], [720, 1500, 'east'], [1120, 1650, 'west']],
    Y: [[1240, 1300, 'east'], [1350, 1200, 'south']], R: [[1340, 1510, 'south'], [1210, 2000, 'east']],
    C: [[900, 1890, 'south'], [680, 2000, 'east']], Q: [mazeCell(30, 2), mazeCell(30, 30), mazeCell(58, 70), mazeCell(10, 80)],
    F: [[1560, 160, 'east'], [1600, 1100, 'north'], [1760, 600, 'west']], L: [[1990, 1110, 'north'], [2160, 600, 'west'], [2000, 300, 'south']],
    D: [[1560, 1300, 'east'], [1800, 1160, 'south'], [2160, 1400, 'west'], [1745, 1660, 'north']],
    K: [[1560, 1800, 'east'], [1900, 1700, 'south'], [2160, 1950, 'west'], [1560, 2080, 'east']],
  };
  for (const [id, list] of Object.entries(roomSaves)) {
    for (const s of list) {
      const [x, z, f] = s.length === 2 ? [s[0], s[1], 'south'] : s;
      if (roomOf(place, x, z) === id) saveAt(x, z, f);
    }
  }

  // hiding spots: a good few in every room, and toy boxes along the hallway
  const hides = {
    B: [['bed', 1118, 252, 'south', 0x7fb8a8], ['bed', 1142, 252, 'south', 0xe8a0c8], ['toybox', 1150, 280, 'west', 0xa970ff], ['toybox', 900, 300, 'north'], ['toybox', 1400, 300, 'north', 0x2a4fa0], ['curtain', 760, 120, 'east', 0x2a3a7a]],
    O: [['counter', 1420, 390, 'south', 0x6a3a1a], ['curtain', 1490, 500, 'west', 0xd8b890]],
    P: [['locker', 630, 250, 'west', 0x3a8ab8], ['locker', 630, 680, 'west', 0x3a8ab8], ['box', 300, 930, 'north'], ['curtain', 60, 500, 'east', 0x7fd0f0]],
    A: [['curtain', 500, 1140, 'north', 0x2a1050], ['box', 660, 1100, 'west'], ['locker', 20, 1100, 'east', 0xff3fa4]],
    S: [['tube', 1000, 540, 'south', 0xff9a1f], ['tube', 740, 820, 'east', 0x3ec1d3], ['tube', 1280, 660, 'west', 0x7ad151], ['tube', 900, 1100, 'north', 0xd11f2a], ['tube', 1000, 840, 'south', 0xffd23f]],
    Z: [['box', 1380, 790, 'east'], ['toybox', 1480, 900, 'west', 0x7ad151]],
    M: [['counter', 920, 1210, 'south', 0xc05a1a], ['counter', 720, 1520, 'east', 0xc05a1a], ['box', 1120, 1700, 'west']],
    Y: [['toybox', 1240, 1320, 'east', 0xffd0e8], ['toybox', 1380, 1200, 'south', 0xa8d8ff], ['curtain', 1480, 1400, 'west', 0xffd0e8]],
    R: [['curtain', 1340, 1520, 'south', 0x7fd0f0], ['curtain', 1220, 1720, 'east', 0x7fd0f0], ['locker', 1470, 2160, 'north', 0x6a9ab8]],
    C: [['locker', 700, 1890, 'south', 0x2a3a6a], ['locker', 1120, 1960, 'west', 0x2a3a6a], ['locker', 690, 2160, 'north', 0x2a3a6a]],
    F: [['box', 1600, 200, 'east', 0x5a3a22], ['curtain', 1700, 700, 'south', 0x2a4a30], ['box', 1650, 1050, 'north', 0x5a3a22]],
    L: [['tube', 2000, 200, 'south', 0xff9a1f], ['tube', 2100, 800, 'west', 0x3ec1d3]],
    D: [['tube', 1600, 1200, 'east', 0x3ec1d3], ['tube', 2000, 1500, 'south', 0xffd23f], ['box', 1800, 1650, 'north']],
    K: [['box', 1540, 1700, 'east', 0x2a4fa0], ['tube', 2170, 1800, 'west', 0xff3fa4], ['box', 1800, 2170, 'north', 0xffd23f]],
  };
  for (const [id, list] of Object.entries(hides)) {
    for (const [kind, x, z, f, c] of list) if (roomOf(place, x, z) === id) hideAt(kind, x, z, f, c);
  }
  // in the maze, a toy box every so often in a corridor
  for (const [i, j] of [[5, 5], [20, 12], [40, 8], [55, 20], [12, 40], [45, 40], [25, 60], [50, 62], [8, 75], [35, 88], [55, 90]]) {
    const [x, z] = mazeCell(i, j);
    hideAt('toybox', x, z, 'south', 0x6a5a8a);
  }
  for (let x = 120; x < 1525; x += 210) {
    for (let z = 140; z < 2182; z += 210) {
      const px = x + 40, pz = z + 25;
      const ok = [[0, 0], [3, 0], [-3, 0], [0, 3], [0, -3]].every(([dx, dz]) => roomOf(place, px + dx, pz + dz) === 'H');
      if (ok && R.free(px, pz, 2)) hideAt('toybox', px, pz, ['east', 'west', 'north', 'south'][(x + z) % 4], [0xd11f2a, 0x2a4fa0, 0x7ad151, 0xa970ff][(x * 7 + z) % 4]);
    }
  }

  // ── Signs over the doors ────────────────────────────────────────────
  const signs = [
    ['POOL', 'P', 'e', 300, 0x3ec1d3], ['ARCADE', 'A', 'e', 1070, 0xff3fa4], ['BEDS', 'B', 's', 1150, 0x9fb8ff],
    ["OWL'S CAFÉ", 'O', 'w', 450, 0xffb84a], ['PLAY STRUCTURE', 'S', 'n', 1000, 0xff9a1f], ['PET ZONE', 'Z', 'w', 840, 0x7ad151],
    ['MEAL ZONE', 'M', 'n', 920, 0xffd23f], ['BABY ZONE', 'Y', 'w', 1300, 0xffb8d8], ['BATHROOM', 'R', 'n', 1340, 0x7fd0f0],
    ['SECURITY', 'C', 'n', 900, 0xff3b30], ['MAZE', 'Q', 'n', 305, 0xa08ac0],
  ];
  for (const [text, id, side, at, color] of signs) {
    const r = ROOMS[id];
    // over the door, on the hallway side
    if (side === 'n') neon(d, text, at, r.z0 - 1.55, 5.0, 6, 1.1, 'north', color);
    if (side === 's') neon(d, text, at, r.z1 + 1.55, 5.0, 6, 1.1, 'south', color);
    if (side === 'w') neon(d, text, r.x0 - 1.55, at, 5.0, 6, 1.1, 'west', color);
    if (side === 'e') neon(d, text, r.x1 + 1.55, at, 5.0, 6, 1.1, 'east', color);
  }
  for (const [text, z, color] of [['FOREST →', 160, 0x7ad151], ['FOREST →', 1000, 0x7ad151], ['SLIDES →', 1300, 0x3ec1d3], ['BALL PIT →', 1800, 0xff3fa4]]) {
    neon(d, text, 1524.45, z, 5.0, 6, 1.1, 'west', color);
  }
  neon(d, "CULAC'S DAYCARE", 900, 2180.9, 6.0, 14, 2.2, 'north', 0xffd23f, 0xff3fa4);

  // ── The security cameras (Officer Grumble watches them) ─────────────
  for (const [x, z, f] of [
    [1130, 320, 'north'], [760, 30, 'east'], [1490, 300, 'west'], [620, 50, 'west'], [20, 1000, 'east'],
    [1000, 510, 'south'], [1300, 1120, 'west'], [1370, 900, 'east'], [710, 1730, 'east'], [1130, 1210, 'west'],
    [1480, 1190, 'west'], [1200, 2100, 'east'], [10, 1210, 'east'], [1535, 20, 'east'], [2170, 1140, 'west'],
    [1535, 2170, 'east'], [1200, 700, 'south'], [400, 1180, 'north'], [1000, 1180, 'north'], [1400, 1470, 'north'],
  ]) {
    const id = roomOf(place, x, z);
    if (id) d.securityCam(x, z, 5.2, f, { range: 16, sweep: 0.8, speed: 0.35, phase: (x + z) % 7 });
  }

  // ── The hallway ─────────────────────────────────────────────────────
  for (let x = 32; x < 1525; x += 64) {
    for (let z = 32; z < 2182; z += 64) {
      if (!['H'].includes(roomOf(place, x, z)) || !R.free(x, z, 2)) continue;
      if (![[2, 0], [-2, 0], [0, 2], [0, -2]].every(([dx, dz]) => roomOf(place, x + dx, z + dz) === 'H')) continue;
      F.cyl(x, z, 0.55, place.ceilH, 0xd8c8a8, { solid: true });
      F.cyl(x, z, 0.75, 0.5, 0x8a5a9a);
    }
  }
  for (let x = 24; x < 1525; x += 44) {
    for (let z = 24; z < 2182; z += 44) {
      if (roomOf(place, x, z) !== 'H') continue;
      d.lampSpot(F, x, z, 6.0, 0xffc890, 2.4, { distance: 18, flicker: rand() < 0.12 });
    }
  }
  // little islands of kid stuff out on the carpet: a rug, a bench, a bookcase, some blocks
  for (let x = 50; x < 1525; x += 37) {
    for (let z = 50; z < 2182; z += 41) {
      if (rand() > 0.45) continue;
      const px = x + rand() * 12, pz = z + rand() * 12;
      if (roomOf(place, px, pz) !== 'H' || !R.free(px, pz, 4)) continue;
      if (![[4, 0], [-4, 0], [0, 4], [0, -4]].every(([dx, dz]) => roomOf(place, px + dx, pz + dz) === 'H')) continue;
      const k = Math.floor(rand() * 5);
      const c = [0xd11f2a, 0x2a4fa0, 0x7ad151, 0xffd23f, 0xa970ff, 0xff9a1f][Math.floor(rand() * 6)];
      F.flat(px, pz, 4, 3, [0x3a2a6a, 0x5a2a3a, 0x2a4a5a][k % 3], { y: 0.012, ry: rand() * 0.6 });
      if (k === 0) F.box(px, pz, 2.4, 0.6, 0.45, c, { solid: true });                       // a bench
      else if (k === 1) {                                                                    // a cubby shelf
        F.box(px, pz, 2.2, 0.5, 1.3, 0xe8d8b8, { solid: true });
        for (let i = 0; i < 3; i++) F.box(px - 0.7 + i * 0.7, pz + 0.26, 0.5, 0.02, 0.4, [0xd11f2a, 0x2a4fa0, 0x7ad151][i], { y: 0.6, shadow: false });
      } else if (k === 2) {                                                                  // soft blocks
        for (let i = 0; i < 4; i++) F.box(px + (i % 2) * 0.7 - 0.35, pz + Math.floor(i / 2) * 0.7 - 0.35, 0.6, 0.6, 0.6, [0xd11f2a, 0xffd23f, 0x2a4fa0, 0x7ad151][i], { ry: i * 0.3, y: i === 3 ? 0.6 : 0, solid: i < 3 });
      } else if (k === 3) {                                                                  // a little table
        F.cyl(px, pz, 0.7, 0.05, c, { y: 0.5 });
        F.cyl(px, pz, 0.08, 0.5, 0xc0c0c0, { solid: true });
        for (const a of [0, 2.1, 4.2]) F.box(px + Math.cos(a) * 1.05, pz + Math.sin(a) * 1.05, 0.35, 0.35, 0.3, c);
      } else {                                                                               // a rocking horse
        F.box(px, pz, 0.35, 1.1, 0.5, 0x8a5a32, { y: 0.3, solid: true, blockH: 0.8 });
        F.box(px, pz - 0.6, 0.28, 0.4, 0.5, 0x8a5a32, { y: 0.6 });
        F.box(px, pz, 0.6, 1.4, 0.06, 0x5a3a22, { rx: 0.15 });
      }
    }
  }

  // ── The Beds: rows and rows of them ─────────────────────────────────
  const blankets = [0x3a6ab8, 0x7fb8a8, 0xe8a0c8, 0xffd23f, 0x7ad151, 0xa970ff, 0xff9a1f];
  const bed = (px, pz, blanket, { kid = false } = {}) => {
    F.box(px, pz, 1.0, 1.9, 0.26, 0x8a5a32, { y: 0.06, solid: true, blockH: 0.45 });
    F.box(px, pz + 0.02, 0.94, 1.84, 0.1, 0xf4f1ea, { y: 0.32, shadow: false });
    F.box(px, pz + 0.25, 0.98, 1.3, 0.07, blanket, { y: 0.4, kind: 'cloth' });
    F.box(px, pz - 0.7, 0.6, 0.28, 0.1, 0xffffff, { y: 0.42, shadow: false });
    F.box(px, pz - 0.93, 1.0, 0.06, 0.62, 0x8a5a32, { y: 0.06 });
    if (kid) {
      // somebody asleep under the blanket
      F.ball(px, pz + 0.2, 0.5, 0.3, blanket, { sx: 0.32, sy: 0.14, sz: 0.62 });
      F.ball(px, pz - 0.68, 0.55, 0.13, [0xf1c7a5, 0xd9a07a, 0x8a5a3a, 0xf6d7bf][Math.floor(rand() * 4)]);
    }
  };
  const nearJimmy = (px, pz) => Math.abs(px - BEDS.jimmy[0]) < 10 && pz > BEDS.jimmy[1] - 9 && pz < BEDS.jimmy[1] + 5;
  for (let bx = 750; bx < 1495; bx += 30) {
    for (let i = 0; i < 8; i++) {
      const px = bx + i * 3.0;
      if (px > 1494) continue;
      for (let bz = 6; bz < 326; bz += 31) {
        for (let j = 0; j < 6; j++) {
          const pz = bz + j * 4.4 + 1.2;
          if (pz > 326 || nearJimmy(px, pz) || !R.free(px, pz, 1.2)) continue;
          bed(px, pz, blankets[(i + j * 3 + bx) % blankets.length], { kid: rand() < 0.3 });
        }
      }
    }
  }
  // Jimmy's bed, and the kids' all round it (they're real people: CulacMode puts them in)
  bed(BEDS.jimmy[0], BEDS.jimmy[1], 0x3a6ab8);
  F.box(BEDS.jimmy[0], BEDS.jimmy[1] + 0.25, 0.5, 0.5, 0.02, 0xffffff, { y: 0.475, shadow: false });     // a rocket on his blanket
  BEDS.kids.forEach(([x, z], i) => {
    bed(x, z, blankets[i % blankets.length]);
    d.kidBeds.push({ at: [x, z], pos: place.P(x, z) });
  });
  for (let x = 770; x < 1500; x += 40) {
    for (let z = 20; z < 330; z += 40) {
      if (roomOf(place, x, z) === 'B') d.lampSpot(F, x, z, 0.5, 0x8fa8ff, 1.0, { distance: 8, size: 0.1, fixture: false });
    }
  }
  for (let x = 800; x < 1500; x += 100) for (let z = 60; z < 330; z += 100) d.lampSpot(F, x, z, 6.2, 0xd8e0ff, 1.6, { distance: 16 });

  // ── Owl's Café ──────────────────────────────────────────────────────
  {
    const [hx, hz] = HOMES.ouchie;
    // the tree Ouchie sleeps in, in the middle of the café
    F.cyl(hx, hz, 1.1, 9, 0x5a3a22, { solid: true });
    for (let i = 0; i < 6; i++) {
      const a = i * 1.05;
      F.box(hx + Math.cos(a) * 2, hz + Math.sin(a) * 2, 0.3, 4, 0.3, 0x5a3a22, { y: 6 + (i % 3), ry: -a, rx: 1.1 });
      F.ball(hx + Math.cos(a) * 3.6, hz + Math.sin(a) * 3.6, 8.2 + (i % 2), 2.2, 0x2f5a2a);
    }
    for (let x = 1362; x < 1496; x += 9) {
      for (let z = 396; z < 516; z += 9) {
        if (Math.hypot(x - hx, z - hz) < 7 || !R.free(x, z, 2)) continue;
        F.cyl(x, z, 0.9, 0.06, 0x8a5a32, { y: 0.72 });
        F.cyl(x, z, 0.1, 0.72, 0x3a2a1a, { solid: true });
        for (const a of [0, 1.6, 3.2, 4.8]) F.cyl(x + Math.cos(a) * 1.3, z + Math.sin(a) * 1.3, 0.25, 0.45, 0xb8401a);
      }
    }
    F.box(1426, 388, 60, 1.2, 1.0, 0x6a3a1a, { solid: true });
    for (let x = 1400; x < 1454; x += 4) F.ball(x, 388, 1.2, 0.3, 0xffe0f0, { glow: 0.2, sy: 0.22 });
    neon(d, "OWL'S CAFÉ 🦉", 1426, 382.6, 4.2, 8, 1.3, 'south', 0xffb84a);
    for (let x = 1370; x < 1500; x += 22) for (let z = 400; z < 520; z += 30) d.lampSpot(F, x, z, 3.2, 0xffb070, 2.0, { distance: 12 });
  }

  // ── The Play Structure: a forest of towers, tubes and platforms ─────
  {
    const cols = [0xff9a1f, 0xd11f2a, 0x2a4fa0, 0x7ad151, 0xffd23f, 0x3ec1d3];
    for (let x = 712; x < 1305; x += 16) {
      for (let z = 512; z < 1125; z += 16) {
        if (!R.free(x, z, 3)) continue;
        const c = cols[Math.floor(rand() * cols.length)];
        const tall = rand() < 0.3;
        const ph = tall ? 4.2 : 2.4;
        for (const [sx, sz] of [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]]) F.cyl(x + sx, z + sz, 0.12, ph + 1.2, 0xe8e8e8, { solid: true, lo: true });
        F.box(x, z, 3.1, 3.1, 0.15, c, { y: ph });
        F.cone(x, z, 2.4, 1.4, cols[(cols.indexOf(c) + 2) % cols.length], { y: ph + 1.2 });
        // a tube across to the next tower, and now and then a little slide
        if (x + 16 < 1305 && rand() < 0.6) F.cyl(x + 8, z, 0.55, 12.6, cols[(cols.indexOf(c) + 1) % cols.length], { y: ph + 0.6, rz: Math.PI / 2, shadow: false, lying: true });
        if (z + 16 < 1125 && rand() < 0.35) F.cyl(x, z + 8, 0.55, 12.6, cols[(cols.indexOf(c) + 3) % cols.length], { y: ph + 0.6, rx: Math.PI / 2, shadow: false, lying: true });
        if (rand() < 0.25) F.box(x + 2.9, z, 0.9, 4.2, 0.08, 0xffd23f, { y: ph / 2, rx: 0, rz: 0, ry: 0, solid: false });
        // a cargo net up the side
        if (rand() < 0.3) F.box(x, z + 1.6, 2.6, 0.04, ph, 0x2a2a2a, { shadow: false });
      }
    }
    for (let x = 720; x < 1310; x += 48) for (let z = 520; z < 1130; z += 48) d.lampSpot(F, x + 8, z + 8, 5.5, [0xff9a5a, 0x5ad1ff, 0xffe05a][Math.floor(rand() * 3)], 2.0, { distance: 15 });
  }

  // ── The Pet Zone ────────────────────────────────────────────────────
  {
    const [hx, hz] = HOMES.sparky;
    // Sparky's big doghouse
    F.box(hx, hz - 5, 5, 4, 3, 0x2a4fa0, { solid: true });
    F.box(hx - 1.4, hz - 5, 3.2, 4.4, 0.2, 0xd11f2a, { y: 3.0, rz: 0.6 });
    F.box(hx + 1.4, hz - 5, 3.2, 4.4, 0.2, 0xd11f2a, { y: 3.0, rz: -0.6 });
    F.box(hx, hz - 2.95, 1.6, 0.05, 1.8, 0x111111, { shadow: false });
    neon(d, 'SPARKY', hx, hz - 2.9, 3.0, 2.2, 0.5, 'south', 0x2de2ff);
    for (let x = 1360; x < 1496; x += 8) {
      for (let z = 772; z < 916; z += 9) {
        if (!R.free(x, z, 2)) continue;
        const k = rand();
        if (k < 0.35) {       // a kennel
          F.box(x, z, 1.6, 1.8, 1.2, [0xc0262d, 0x2a4fa0, 0xffd23f, 0x7ad151][Math.floor(rand() * 4)], { solid: true });
          F.box(x, z, 1.8, 2.0, 0.15, 0x5a3a22, { y: 1.2 });
          F.box(x, z + 0.91, 0.7, 0.02, 0.8, 0x111111, { shadow: false });
        } else if (k < 0.6) { // a pet bed and a bone
          F.cyl(x, z, 0.8, 0.25, 0xa970ff, { kind: 'cloth' });
          F.box(x + 1.2, z, 0.5, 0.12, 0.1, 0xf4f1ea);
        } else if (k < 0.75) F.cyl(x, z, 0.18, 0.6, 0xd11f2a, { solid: true });   // a fire hydrant
        else F.ball(x, z, 0.2, 0.2, 0xffd23f);                                      // a tennis ball
      }
    }
    for (let x = 1370; x < 1500; x += 30) for (let z = 780; z < 920; z += 40) d.lampSpot(F, x, z, 4.0, 0xcfffcf, 1.6, { distance: 12 });
  }

  // ── The Arcade: rows of machines glowing in the dark ────────────────
  {
    const screens = [0xff3fa4, 0x3ec1d3, 0xffd23f, 0x7ad151, 0xa970ff, 0xff6a3a];
    const bodies = [0x2a1050, 0x1a2a6a, 0x5a1030, 0x103a3a];
    for (let z = 1000; z < 1146; z += 8) {
      for (let x = 10; x < 676; x += 1.15) {
        if (Math.floor((x - 10) / 1.15) % 11 === 10) continue;    // an aisle every ten machines
        for (const [dz, face] of [[0, 0], [0.9, Math.PI]]) {
          const pz = z + dz;
          if (!R.free(x, pz, 0.8)) continue;
          const s = screens[Math.floor(rand() * screens.length)];
          F.box(x, pz, 0.9, 0.75, 1.8, bodies[Math.floor(rand() * bodies.length)], { solid: true, ry: face });
          const fz = face ? -0.39 : 0.39;
          F.box(x, pz + fz, 0.7, 0.02, 0.55, s, { y: 1.05, glow: 0.35, shadow: false });
          F.box(x, pz, 0.92, 0.77, 0.22, s, { y: 1.82, glow: 0.25, shadow: false });
        }
      }
    }
    // the prize counter, by the side door
    F.box(640, 1050, 1.2, 30, 1.1, 0x5a1030, { solid: true });
    for (let z = 1037; z < 1064; z += 2) F.ball(640, z, 1.3, 0.25, screens[Math.floor(rand() * 6)]);
    for (let x = 30; x < 680; x += 60) for (let z = 1010; z < 1150; z += 60) d.lampSpot(F, x, z, 5.5, 0xb080ff, 1.4, { distance: 14, flicker: rand() < 0.2 });
  }

  // ── The Meal Zone: long tables and little benches ───────────────────
  {
    const tops = [0xffd23f, 0xd11f2a, 0x2a4fa0, 0x7ad151];
    for (let x = 714; x < 1135; x += 6) {
      for (let z = 1226; z < 1736; z += 4.6) {
        if (!R.free(x, z, 2.2)) continue;
        F.box(x, z, 4, 1.0, 0.06, tops[Math.floor((x + z) / 7) % 4], { y: 0.62 });
        F.box(x, z, 3.6, 0.5, 0.62, 0xc0c0c0, { solid: true, blockH: 0.68 });
        F.box(x, z - 0.85, 4, 0.35, 0.36, 0x8a5a32, { solid: true });
        F.box(x, z + 0.85, 4, 0.35, 0.36, 0x8a5a32, { solid: true });
        if (rand() < 0.3) F.box(x - 1 + rand() * 2, z, 0.4, 0.3, 0.04, 0xf4f1ea, { y: 0.66, shadow: false });   // a lunch tray
      }
    }
    // the kitchen counter along the top
    F.box(920, 1206, 420, 2, 1.0, 0xb8b8c0, { solid: true });
    for (let x = 720; x < 1130; x += 12) F.box(x, 1205, 1.4, 1.2, 0.9, 0x3a3d44, { y: 1.0 });
    for (let x = 730; x < 1140; x += 50) for (let z = 1230; z < 1740; z += 50) d.lampSpot(F, x, z, 5.5, 0xfff0c0, 1.8, { distance: 16 });
  }

  // ── The Baby Zone ───────────────────────────────────────────────────
  {
    const [mx, mz] = HOMES.meanbaby;
    // Mean Baby's crib: much bigger than the rest, and cracked
    F.box(mx, mz - 4, 4, 3, 0.4, 0xf4e8f0, { y: 0.6, solid: true, blockH: 1.6 });
    for (let i = 0; i < 9; i++) F.cyl(mx - 2 + i * 0.5, mz - 2.5, 0.04, 1.6, 0xd8c8d8, { y: 0, lo: true });
    for (let i = 0; i < 9; i++) F.cyl(mx - 2 + i * 0.5, mz - 5.5, 0.04, 1.6, 0xd8c8d8, { y: 0, lo: true });
    neon(d, 'MEAN BABY', mx, mz - 5.4, 2.6, 2.4, 0.5, 'south', 0xff3b30);
    const [gx, gz] = HOMES.gokupug;
    // Gokupug's training mat, with a lightning bolt on it
    F.flat(gx, gz, 8, 8, 0x111111, { y: 0.02 });
    F.flat(gx, gz, 1.2, 5, 0xffd23f, { y: 0.03, ry: 0.5, glow: 0.2 });
    for (const sx of [-1, 1]) F.box(gx + sx * 5, gz, 0.6, 0.6, 1.8, 0xd11f2a, { solid: true });    // punching bags
    const pastel = [0xffd0e8, 0xa8d8ff, 0xfff2a0, 0xc8f0c0, 0xe0c8ff];
    for (let x = 1232; x < 1486; x += 4) {
      for (let z = 1192; z < 1436; z += 4.2) {
        if (!R.free(x, z, 1.6) || rand() < 0.15) continue;
        const c = pastel[Math.floor(rand() * pastel.length)];
        F.box(x, z, 1.3, 0.85, 0.25, 0xf4f1ea, { y: 0.45, solid: true, blockH: 1.1 });
        for (const sz of [-0.43, 0.43]) F.box(x, z + sz, 1.3, 0.04, 0.5, c, { y: 0.6, shadow: false });
        for (const sx of [-0.65, 0.65]) F.box(x + sx, z, 0.06, 0.9, 1.1, c);
        if (rand() < 0.25) F.ball(x, z, 1.7, 0.12, c, { glow: 0.2 });   // a mobile
      }
    }
    for (let x = 1240; x < 1490; x += 40) for (let z = 1200; z < 1440; z += 40) d.lampSpot(F, x, z, 4.5, 0xffc0e0, 1.5, { distance: 12 });
  }

  // ── The Bathroom ────────────────────────────────────────────────────
  for (let z = 1530, row = 0; z < 2170; z += 14, row++) {
    for (let x = 1200; x < 1486; x += 1.7) {
      if (Math.floor((x - 1200) / 1.7) % 15 === 14) continue;
      if (!R.free(x, z, 1.2)) continue;
      F.box(x - 0.83, z, 0.06, 1.6, 2.0, 0x7fd0f0, { solid: true });
      F.cyl(x, z - 0.4, 0.22, 0.42, 0xf4f6f8);
      F.box(x, z - 0.72, 0.4, 0.2, 0.5, 0xf4f6f8, { y: 0.3 });
      // and a row of little sinks across the aisle
      F.box(x, z + 4, 0.7, 0.5, 0.65, 0xf4f6f8, { solid: true });
      F.box(x, z + 4.26, 0.6, 0.02, 0.7, 0xa8c8d8, { y: 1.1, glow: 0.08, shadow: false });
    }
    if (row % 3 === 1) for (let x = 1220; x < 1490; x += 40) d.lampSpot(F, x, z + 7, 5.8, 0xe0f4ff, 1.8, { distance: 15, flicker: rand() < 0.25 });
  }

  // ── The Security Office ─────────────────────────────────────────────
  {
    const [hx, hz] = HOMES.grumble;
    // Officer Grumble's desk, and the wall of camera screens he watches
    F.box(hx, hz - 3, 6, 1.4, 0.9, 0x3a3a48, { solid: true });
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) F.box(hx - 3.75 + i * 1.5, hz - 6.2, 1.35, 0.1, 0.85, 0x1a3a2a, { y: 1.2 + j * 1.0, glow: 0.3, shadow: false });
    F.box(hx, hz - 6.3, 9.4, 0.2, 3.4, 0x2a2a30, { y: 1.0, solid: true });
    neon(d, 'OFFICER GRUMBLE', hx, hz - 6.15, 4.6, 4, 0.6, 'south', 0xff3b30);
    for (let x = 676; x < 1136; x += 5) {
      for (let z = 1886; z < 2176; z += 6) {
        if (!R.free(x, z, 2)) continue;
        F.box(x, z, 2.4, 1.0, 0.75, 0x5a5a68, { solid: true });
        F.box(x - 0.6, z - 0.2, 0.6, 0.08, 0.45, 0x111111, { y: 0.75 });
        F.box(x - 0.6, z - 0.15, 0.52, 0.02, 0.38, 0x2a6a4a, { y: 0.8, glow: 0.2, shadow: false });
        F.box(x + 0.7, z + 1.0, 0.5, 0.5, 0.9, 0x2a2a30);
      }
    }
    for (let x = 690; x < 1140; x += 40) for (let z = 1890; z < 2180; z += 40) d.lampSpot(F, x, z, 5.8, 0xe8f0ff, 2.0, { distance: 15, flicker: rand() < 0.3 });
  }

  // ── The Maze: dim, purple, and full of fog ──────────────────────────
  {
    for (let i = 2; i < 60; i += 6) for (let j = 2; j < 97; j += 6) {
      const [x, z] = mazeCell(i, j);
      d.lampSpot(F, x, z, 5.6, 0xa08ac0, 1.3, { distance: 13, flicker: rand() < 0.3 });
    }
    const [x0, z0] = mazeCell(MAZE_HOME[0], MAZE_HOME[1]);
    const [x1, z1] = mazeCell(MAZE_HOME[2], MAZE_HOME[3]);
    F.flat((x0 + x1) / 2, (z0 + z1) / 2, x1 - x0 + 8, z1 - z0 + 8, 0x4a3a6a, { y: 0.02 });
    d.lampSpot(F, (x0 + x1) / 2, (z0 + z1) / 2, 6, 0xfff2a0, 2.5, { distance: 20 });
    neon(d, '☀ SUNNY', (x0 + x1) / 2, z0 - 4 + MAZE_PITCH * 0, 3.6, 3, 0.7, 'south', 0xfff2a0);
  }

  // ── The Pool ────────────────────────────────────────────────────────
  {
    // the Deep Zone: deep water, and a railing all the way round it
    const dz = [120, 110, 560, 470];
    F.flat((dz[0] + dz[2]) / 2, (dz[1] + dz[3]) / 2, dz[2] - dz[0], dz[3] - dz[1], 0x0a3a6a, { y: 0.05, glow: 0.08 });
    place.addBlock(dz[0] - 0.3, dz[1] - 0.3, dz[2] + 0.3, dz[1] + 0.3, 1.1);
    place.addBlock(dz[0] - 0.3, dz[3] - 0.3, dz[2] + 0.3, dz[3] + 0.3, 1.1);
    place.addBlock(dz[0] - 0.3, dz[1], dz[0] + 0.3, dz[3], 1.1);
    place.addBlock(dz[2] - 0.3, dz[1], dz[2] + 0.3, dz[3], 1.1);
    place.blockNav(dz[0], dz[1], dz[2], dz[3], 0.5);
    for (let x = dz[0]; x <= dz[2]; x += 3) for (const z of [dz[1], dz[3]]) F.cyl(x, z, 0.05, 1.1, 0xf4f1ea, { lo: true, shadow: false });
    for (let z = dz[1]; z <= dz[3]; z += 3) for (const x of [dz[0], dz[2]]) F.cyl(x, z, 0.05, 1.1, 0xf4f1ea, { lo: true, shadow: false });
    for (const z of [dz[1], dz[3]]) F.box((dz[0] + dz[2]) / 2, z, dz[2] - dz[0], 0.08, 0.08, 0xd11f2a, { y: 1.05, shadow: false });
    for (const x of [dz[0], dz[2]]) F.box(x, (dz[1] + dz[3]) / 2, 0.08, dz[3] - dz[1], 0.08, 0xd11f2a, { y: 1.05, shadow: false });
    for (const [x, z, f] of [[340, 472, 'south'], [340, 108, 'north'], [562, 290, 'east'], [118, 290, 'west']]) {
      neon(d, 'DEEP ZONE\nNO SWIMMING', x, z, 1.9, 3, 1.1, f, 0xff3b30);
    }
    // the swim area: shallow, so you splash through it slowly
    const sw = [100, 540, 620, 900];
    F.flat((sw[0] + sw[2]) / 2, (sw[1] + sw[3]) / 2, sw[2] - sw[0], sw[3] - sw[1], 0x2a7ab8, { y: 0.06, glow: 0.06 });
    const a = place.P(sw[0], sw[1]), b = place.P(sw[2], sw[3]);
    place.slowZones.push({ x0: a.x, z0: a.z, x1: b.x, z1: b.z });
    neon(d, 'SWIM AREA', 360, 538.5, 2.6, 4, 0.8, 'north', 0x5ad1ff);
    // and the pool itself: ten feet long, about as long as a couch (the designer's call)
    const [px, pz] = [330, 505];
    F.box(px, pz, 3.05, 1.8, 0.4, 0xf4f1ea, { solid: true });
    F.flat(px, pz, 2.85, 1.6, 0x5ab8e8, { y: 0.42, glow: 0.15 });
    neon(d, 'POOL · 10 FT', px, pz - 1.0, 1.4, 1.6, 0.4, 'north', 0x5ad1ff);
    F.cyl(px + 0.8, pz, 0.35, 0.12, 0xff3fa4, { y: 0.42, sx: 0.35 });
    // lounge chairs, lifeguard chairs, towels
    for (let x = 30; x < 630; x += 7) {
      for (const z of [30, 500, 520, 930]) {
        if (!R.free(x, z, 2) || roomOf(place, x, z) !== 'P') continue;
        F.box(x, z, 0.8, 1.9, 0.35, [0xffffff, 0x3ec1d3, 0xffd23f][Math.floor(rand() * 3)], { solid: true });
        F.box(x, z - 0.7, 0.8, 0.6, 0.06, 0xffffff, { y: 0.5, rx: -0.8 });
      }
    }
    for (const [x, z] of [[100, 300], [580, 300], [340, 700], [600, 800]]) {
      F.box(x, z, 1.2, 1.2, 0.1, 0xf4f1ea, { y: 2.4 });
      for (const [sx, sz] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) F.cyl(x + sx, z + sz, 0.05, 2.4, 0xf4f1ea, { solid: true, lo: true });
      F.box(x, z, 0.9, 0.9, 0.6, 0xd11f2a, { y: 2.5 });
    }
    for (let x = 40; x < 640; x += 50) for (let z = 40; z < 960; z += 50) d.lampSpot(F, x, z, 5.5, 0x9fe8ff, 1.6, { distance: 15 });
  }

  // ── The Forest Area: trees, a winding trail, and animatronics ───────
  {
    // the trail, from the gate at the top down to the slides
    const trail = [];
    for (let z = 1; z <= 1130; z += 4) trail.push([1690 + Math.sin(z / 140) * 90 + Math.sin(z / 37) * 12, z]);
    d.trail = trail;
    const onTrail = (x, z) => {
      const i = Math.max(0, Math.min(trail.length - 1, Math.round((z - 1) / 4)));
      return Math.abs(trail[i][0] - x) < 7;
    };
    for (let i = 0; i < trail.length - 1; i++) {
      const [x0, z0] = trail[i], [x1, z1] = trail[i + 1];
      F.flat((x0 + x1) / 2, (z0 + z1) / 2, 5.2, Math.hypot(x1 - x0, z1 - z0) + 0.4, 0x6a4a2a, { y: 0.02, ry: Math.atan2(x1 - x0, z1 - z0) });
    }
    for (let i = 4; i < trail.length; i += 11) {
      const [x, z] = trail[i];
      F.cyl(x + 3.6, z, 0.06, 1.6, 0x2a2a2a, { lo: true, solid: true });
      d.lampSpot(F, x + 3.6, z, 1.7, 0xffb050, 1.6, { distance: 11, flicker: rand() < 0.35, size: 0.12, fixture: false });
    }
    // the animatronics along the trail (the designer's map: "with trail and animatronics"):
    // old forest animals that move their heads when you walk past — or just look like they do
    for (let i = 8; i < trail.length; i += 16) {
      const [tx, tz] = trail[i];
      const x = tx + (i % 2 ? 9 : -9), z = tz;
      const kind = i % 3;
      if (kind === 0) {         // a deer
        F.box(x, z, 0.6, 1.6, 0.7, 0x8a5a32, { y: 0.9, solid: true, blockH: 1.6 });
        for (const [sx, sz] of [[-0.2, -0.6], [0.2, -0.6], [-0.2, 0.6], [0.2, 0.6]]) F.cyl(x + sx, z + sz, 0.06, 0.9, 0x6a4a2a, { lo: true });
        F.box(x, z - 1.0, 0.35, 0.6, 0.4, 0x8a5a32, { y: 1.6, rx: -0.4 });
        for (const sx of [-0.25, 0.25]) F.box(x + sx, z - 1.0, 0.04, 0.04, 0.7, 0xd8c8a8, { y: 2.0, rz: sx * 1.6 });
        for (const sx of [-0.1, 0.1]) F.ball(x + sx, z - 1.3, 1.72, 0.04, 0xff3a1a, { glow: 0.6, shadow: false });
      } else if (kind === 1) {  // a bear
        F.ball(x, z, 1.0, 0.9, 0x3a2414, { sy: 1.0 });
        F.ball(x, z - 0.3, 2.1, 0.5, 0x3a2414);
        for (const sx of [-0.35, 0.35]) F.ball(x + sx, z - 0.3, 2.55, 0.15, 0x3a2414);
        for (const sx of [-0.15, 0.15]) F.ball(x + sx, z - 0.76, 2.2, 0.05, 0xffe23a, { glow: 0.6, shadow: false });
        place.addBlock(x - 0.8, z - 0.8, x + 0.8, z + 0.8, 2.0);
      } else {                  // a rabbit as tall as a grown-up
        F.ball(x, z, 0.9, 0.5, 0xd8d0c8, { sy: 0.8 });
        F.ball(x, z, 1.8, 0.35, 0xd8d0c8);
        for (const sx of [-0.12, 0.12]) F.box(x + sx, z, 0.1, 0.06, 0.7, 0xd8d0c8, { y: 2.1 });
        for (const sx of [-0.12, 0.12]) F.ball(x + sx, z - 0.32, 1.85, 0.04, 0xff2a5a, { glow: 0.6, shadow: false });
        place.addBlock(x - 0.5, z - 0.5, x + 0.5, z + 0.5, 2.0);
      }
    }
    // the trees
    for (let x = 1532; x < 1878; x += 9) {
      for (let z = 6; z < 1126; z += 9) {
        const px = x + rand() * 6, pz = z + rand() * 6;
        if (onTrail(px, pz) || !R.free(px, pz, 2) || roomOf(place, px, pz) !== 'F') continue;
        const h = 4 + rand() * 3;
        F.cyl(px, pz, 0.32, h, 0x4a3020, { solid: true, lo: true });
        F.cone(px, pz, 2.4 + rand(), 4.5, rand() < 0.5 ? 0x1f4a24 : 0x2a5a2a, { y: h - 1.2 });
        F.cone(px, pz, 1.7, 3.4, 0x2f6a30, { y: h + 1.6 });
        if (rand() < 0.3) F.ball(px + 2, pz + 1, 0.4, 0.7, 0x2a5a2a, { sy: 0.5 });
      }
    }
    for (let x = 1560; x < 1880; x += 60) for (let z = 40; z < 1130; z += 60) {
      if (!onTrail(x, z)) d.lampSpot(F, x, z, 6.5, 0x9fb8ff, 1.2, { distance: 16 });
    }
  }

  // ── The Play Area: swings, slides, see-saws and sandboxes ───────────
  for (let x = 1900; x < 2175; x += 30) {
    for (let z = 20; z < 1120; z += 30) {
      const px = x + rand() * 6, pz = z + rand() * 6;
      if (!R.free(px, pz, 4) || roomOf(place, px, pz) !== 'L') continue;
      const k = Math.floor(rand() * 4);
      if (k === 0) {            // swings
        for (const sx of [-2, 2]) for (const sz of [-0.8, 0.8]) F.cyl(px + sx, pz + sz * 0.6, 0.07, 2.6, 0xd11f2a, { rx: sz * 0.3, solid: true, lo: true });
        F.cyl(px, pz, 0.07, 4.2, 0xd11f2a, { y: 2.55, rz: Math.PI / 2, lying: true });
        for (const sx of [-1, 1]) { F.box(px + sx, pz, 0.6, 0.3, 0.05, 0x111111, { y: 0.55 }); F.box(px + sx, pz, 0.02, 0.02, 2.0, 0x888888, { y: 0.55, shadow: false }); }
      } else if (k === 1) {     // a slide
        F.box(px, pz - 1.5, 1.4, 1.4, 0.1, 0x2a4fa0, { y: 2.0 });
        for (const [sx, sz] of [[-0.6, -2.1], [0.6, -2.1], [-0.6, -0.9], [0.6, -0.9]]) F.cyl(px + sx, pz + sz, 0.06, 2.0, 0xe8e8e8, { solid: true, lo: true });
        F.box(px, pz + 0.9, 0.8, 3.6, 0.06, 0xffd23f, { y: 1.0, rx: 0.55 });
      } else if (k === 2) {     // a sandbox
        F.box(px, pz, 4, 4, 0.3, 0x8a5a32, { solid: false });
        F.flat(px, pz, 3.7, 3.7, 0xe8d090, { y: 0.31 });
        F.cone(px + 0.6, pz, 0.4, 0.4, 0xd11f2a, { y: 0.31 });
      } else {                  // a see-saw
        F.box(px, pz, 0.4, 0.4, 0.5, 0x3a3a3a, { solid: true });
        F.box(px, pz, 0.3, 4, 0.08, 0x7ad151, { y: 0.5, rx: 0.12 });
      }
    }
  }
  for (let x = 1900; x < 2180; x += 50) for (let z = 30; z < 1130; z += 50) {
    if (!R.free(x, z, 1)) continue;
    F.cyl(x, z, 0.08, 4.5, 0x2a2a2a, { lo: true, solid: true });
    d.lampSpot(F, x, z, 4.6, 0xffe0a0, 1.8, { distance: 15, flicker: rand() < 0.2, fixture: false });
  }

  // ── The Slides (into the pit) ───────────────────────────────────────
  {
    const cols = [0x3ec1d3, 0xff3fa4, 0xffd23f, 0x7ad151, 0xff9a1f];
    for (let x = 1545; x < 2175; x += 26) {
      for (let z = 1150; z < 1660; z += 26) {
        const px = x + rand() * 4, pz = z + rand() * 4;
        if (!R.free(px, pz, 5)) continue;
        const c = cols[Math.floor(rand() * cols.length)];
        const h = 3 + rand() * 3;
        for (const [sx, sz] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) F.cyl(px + sx, pz + sz, 0.12, h + 1, 0xe8e8e8, { solid: true, lo: true });
        F.box(px, pz, 2.6, 2.6, 0.15, c, { y: h });
        F.cone(px, pz, 2.0, 1.4, 0xffffff, { y: h + 1 });
        const len = h * 1.9;
        F.box(px, pz + 1.3 + len * 0.42, 1.0, len, 0.08, cols[(cols.indexOf(c) + 2) % cols.length], { y: h / 2, rx: Math.atan2(h, len * 0.85) });
        for (let s = 0; s < 5; s++) F.box(px - 1.6, pz - 1.0 + s * 0.5, 0.8, 0.3, 0.12, 0xd8d8d8, { y: (s + 1) * h / 6 });
      }
    }
    // the giant slide, all the way down into the Ball Pit
    const top = [1745, 1590];
    for (const [sx, sz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) F.cyl(top[0] + sx, top[1] + sz, 0.2, 9, 0xe8e8e8, { solid: true });
    F.box(top[0], top[1], 4.6, 4.6, 0.2, 0xff3fa4, { y: 8 });
    F.cone(top[0], top[1], 3.4, 2.2, 0xffd23f, { y: 9.2 });
    d.bigSlide = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const z = top[1] + 2.4 + t * 150, y = 8 - t * 7.6, x = top[0] + Math.sin(t * Math.PI * 1.2) * 4;
      d.bigSlide.push(place.P(x, z, y + 0.6));
      if (i < 24) F.cyl(x, z + 3.1, 1.0, 6.4, 0xff3fa4, { y: y - 0.15, rx: Math.PI / 2 + Math.atan2(7.6 / 24, 6.25), shadow: false, lying: true });
    }
    d.slideStart = place.P(top[0], top[1] + 3.2);
    neon(d, 'GIANT SLIDE', top[0], top[1] - 2.35, 8.9, 4, 0.8, 'north', 0xff3fa4);
    for (let x = 1560; x < 2180; x += 50) for (let z = 1150; z < 1680; z += 50) d.lampSpot(F, x, z, 6.5, cols[Math.floor(rand() * 5)], 1.8, { distance: 16 });
  }

  // ── The Ball Pit ────────────────────────────────────────────────────
  {
    // a padded path round the edge and across the middle; balls everywhere else
    const X0 = 1535, X1 = 2176, Z0 = 1690, Z1 = 2176, MX = 1852, MZ = 1930;
    const quarters = [[X0, Z0, MX - 3, MZ - 3], [MX + 3, Z0, X1, MZ - 3], [X0, MZ + 3, MX - 3, Z1], [MX + 3, MZ + 3, X1, Z1]];
    for (const [x0, z0, x1, z1] of quarters) {
      d.pits.push([x0, z0, x1, z1]);
      const a = place.P(x0, z0), b = place.P(x1, z1);
      place.slowZones.push({ x0: a.x, z0: a.z, x1: b.x, z1: b.z });
      const tex = ballTexture();
      tex.repeat.set((x1 - x0) / 6, (z1 - z0) / 6);
      const c = place.P((x0 + x1) / 2, (z0 + z1) / 2, 0.3);
      d.mesh(new THREE.PlaneGeometry(1, 1), surface({ map: tex }), d.group, { p: [c.x, c.y, c.z], s: [x1 - x0, z1 - z0, 1], r: [-Math.PI / 2, 0, 0], shadow: false });
      for (const [x, z, w, dd] of [[(x0 + x1) / 2, z0, x1 - x0, 0.4], [(x0 + x1) / 2, z1, x1 - x0, 0.4], [x0, (z0 + z1) / 2, 0.4, z1 - z0], [x1, (z0 + z1) / 2, 0.4, z1 - z0]]) {
        F.box(x, z, w, dd, 0.45, 0x2a4fa0, { shadow: false });
      }
    }
    for (let x = 1560; x < 2180; x += 45) for (let z = 1700; z < 2180; z += 45) d.lampSpot(F, x, z, 6.0, [0xff3fa4, 0x3ec1d3, 0xffd23f][Math.floor(rand() * 3)], 1.8, { distance: 16 });
  }

  F.build(d.group);
  return d;
}

// The ball texture laid over the ball pit, so it looks full of balls a long way off (the
// real balls are only round you: CulacMode.updateBalls).
export function ballTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#1a1a2a';
  g.fillRect(0, 0, 256, 256);
  const cols = ['#ff3b30', '#ffd23f', '#3ec1d3', '#7ad151', '#a970ff', '#ff9a1f'];
  const rand = seeded(5);
  for (let i = 0; i < 900; i++) {
    const x = rand() * 256, y = rand() * 256, r = 7 + rand() * 3;
    for (const [dx, dy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) {
      g.fillStyle = cols[i % cols.length];
      g.beginPath(); g.arc(x + dx, y + dy, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.beginPath(); g.arc(x + dx - r * 0.3, y + dy - r * 0.3, r * 0.3, 0, Math.PI * 2); g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
