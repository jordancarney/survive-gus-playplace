// Gus's Pizzaplex: brand new, and way bigger than anything Gus has had before (the designer's
// call). One floor plan, used by every chapter that happens out on the main floor — Jonathan
// walks it, and Jackson watches it on his cameras.
//
//   ┌ Gus Shop ┐   West ┌ Security ┐ East   ┌ Parts & Service ┐
//   │          │   Hall │  Office  │ Hall   │                 │
//   ├──────────┼────────┴──────────┴────────┼─────────────────┤
//   │  Food    │          ATRIUM            │     Arcade      │
//   │  Court   │  (Gus's giant stage, and   │                 │
//   │          │   the sleepover's bags)    │                 │
//   ├──────────┼────────────────────────────┼─────────────────┤
//   │  Prize   │      the giant BALL PIT    │  DJ Rocco's     │
//   │  Counter │                            │  Party Room     │
//   └──────────┴────────────────────────────┴─────────────────┘
//
// The halls up to the Security Office are only open in Jackson's chapters; in Jonathan's, the
// way up there is the STAFF ONLY door.
import * as THREE from 'three';
import * as T from '../textures.js';
import { G, lam, glowMat } from '../decor.js';
import { mat, cloth } from '../models.js';
import { ITEMS } from '../escape/decor.js';
import { ITEM_ICON } from '../escape/watch.js';

export const ROOMS = {
  N: { name: 'Gus Shop', x0: 1, z0: 1, x1: 18, z1: 12,
       floor: () => T.checker('#f2f0ea', '#5b2a86'), wall: ['#5b2a86', '#ffd23f', '#2a1440', 'stars'] },
  W: { name: 'West Hall', x0: 22, z0: 1, x1: 26, z1: 12,
       floor: () => T.tiles('#5a6670', '#3e4a52'), wall: ['#3a3d44', '#ff3fa4', '#22242a', 'panels'] },
  O: { name: 'Security Office', short: 'Security', x0: 29, z0: 2, x1: 36, z1: 9,
       floor: () => T.tiles('#8e9aa0', '#6c777c'), wall: ['#4a3a6a', '#ffd23f', '#2a2040', 'panels'] },
  E: { name: 'East Hall', x0: 39, z0: 1, x1: 43, z1: 12,
       floor: () => T.tiles('#5a6670', '#3e4a52'), wall: ['#3a3d44', '#2de2e6', '#22242a', 'panels'] },
  T: { name: 'Parts & Service', short: 'Parts', x0: 47, z0: 1, x1: 64, z1: 12,
       floor: () => T.concrete(), wall: ['#3a3d44', '#ff3b30', '#22242a', 'bricks'] },
  F: { name: 'Food Court', x0: 1, z0: 14, x1: 18, z1: 35,
       floor: () => T.checker('#f2f0ea', '#c0262d'), wall: ['#ffe9a0', '#ff5a5f', '#7a2a2a', 'stripes'] },
  A: { name: 'Atrium', x0: 20, z0: 14, x1: 45, z1: 35,
       floor: () => T.checker('#1d1c24', '#3a2a5a'), wall: ['#1b1440', '#ff3fa4', '#0e0a24', 'stars'] },
  R: { name: 'Arcade', x0: 47, z0: 14, x1: 64, z1: 35,
       floor: () => T.carpet('#120e33'), wall: ['#120e33', '#2de2e6', '#ff3fa4', 'stars'] },
  P: { name: 'Prize Counter', short: 'Prizes', x0: 1, z0: 37, x1: 18, z1: 48,
       floor: () => T.carpet('#14304a'), wall: ['#ffd23f', '#ff3fa4', '#2a4fa0', 'stripes'] },
  B: { name: 'Giant Ball Pit', short: 'Ball Pit', x0: 20, z0: 37, x1: 45, z1: 48,
       floor: () => T.playmat(), wall: ['#3a2a7a', '#ffd23f', '#1f9fbf', 'bubbles'] },
  K: { name: "DJ Rocco's Party Room", short: 'Party Room', x0: 47, z0: 37, x1: 64, z1: 48,
       floor: () => T.carpet('#2a0e33'), wall: ['#2a0e33', '#ff3fa4', '#c040ff', 'stars'] },
};

const MAIN_DOORS = [
  { a: 'F', b: 'A', x0: 19, z0: 22, x1: 19, z1: 27 },
  { a: 'A', b: 'R', x0: 46, z0: 22, x1: 46, z1: 27 },
  { a: 'F', b: 'N', x0: 8, z0: 13, x1: 10, z1: 13 },
  { a: 'R', b: 'T', x0: 54, z0: 13, x1: 56, z1: 13 },
  { a: 'F', b: 'P', x0: 8, z0: 36, x1: 10, z1: 36 },
  { a: 'A', b: 'B', x0: 30, z0: 36, x1: 35, z1: 36 },
  { a: 'R', b: 'K', x0: 54, z0: 36, x1: 56, z1: 36 },
];
// Jackson's chapters: the halls from the Atrium up to his office, and his two doors.
const HALL_DOORS = [
  { a: 'A', b: 'W', x0: 23, z0: 13, x1: 25, z1: 13 },
  { a: 'A', b: 'E', x0: 40, z0: 13, x1: 42, z1: 13 },
  { a: 'W', b: 'O', x0: 27, z0: 5, x1: 28, z1: 6 },
  { a: 'O', b: 'E', x0: 37, z0: 5, x1: 38, z1: 6 },
];

export function pizzaplexLayout({ halls = false } = {}) {
  return {
    w: 66, h: 50, wallH: 5.5, panels: false,
    wallColor: 0x1d1424, headerColor: 0xffd23f,
    ceiling: () => T.tiles('#2a2036', '#1d1626'),
    rooms: ROOMS,
    doors: halls ? [...MAIN_DOORS, ...HALL_DOORS] : MAIN_DOORS,
  };
}

// ── The things you find in the Pizzaplex ────────────────────────────────

const card = (d, g, glow) => {
  d.mesh(G.box, glow, g, { s: [0.3, 0.2, 0.02], still: false });
  d.mesh(G.box, lam(0xffffff), g, { p: [0, 0.03, 0.012], s: [0.2, 0.04, 0.005], still: false });
  d.mesh(G.box, lam(0x111111), g, { p: [0, -0.05, 0.012], s: [0.24, 0.03, 0.005], still: false });
};
Object.assign(ITEMS, {
  pass:   { color: 0xff3fa4, name: 'Party Pass', build: (d, g, glow, id) => {
    const col = { pass1: 0xff3b30, pass2: 0x3ec1ff, pass3: 0xffd23f }[id] ?? 0xff3fa4;
    card(d, g, glowMat(col, 0.5));
  } },
  walkie: { color: 0x7cff6b, name: 'walkie-talkie', build: (d, g) => {
    d.mesh(G.box, mat(0xffd23f, { rough: 0.4 }), g, { s: [0.12, 0.26, 0.06], still: false });
    d.mesh(G.cyl, lam(0x111111), g, { p: [0.03, 0.22, 0], s: [0.012, 0.2, 0.012], still: false });
    d.mesh(G.box, glowMat(0x7cff6b, 0.5), g, { p: [0, 0.05, 0.032], s: [0.08, 0.05, 0.005], still: false });
  } },
  ptoken: { color: 0x5ad1ff, name: 'pit token', build: (d, g, glow) => {
    d.mesh(G.cyl, glow, g, { s: [0.14, 0.025, 0.14], r: [Math.PI / 2, 0, 0], still: false });
    d.mesh(G.sphere, glowMat(0xffffff, 0.5), g, { p: [0, 0, 0.02], s: [0.05, 0.05, 0.02], still: false });
  } },
  gear:   { color: 0xffb02a, name: 'gear', build: (d, g, glow) => {
    d.mesh(G.cyl, glow, g, { s: [0.15, 0.04, 0.15], r: [Math.PI / 2, 0, 0], still: false });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      d.mesh(G.box, glow, g, { p: [Math.cos(a) * 0.17, Math.sin(a) * 0.17, 0], s: [0.05, 0.05, 0.04], r: [0, 0, a], still: false });
    }
  } },
});
Object.assign(ITEM_ICON, { pass: '🎫', walkie: '📻', ptoken: '🔵', gear: '⚙️' });

// ── The furniture ───────────────────────────────────────────────────────

// A glowing sign. (Colours as numbers, like everything else here; the sign painter wants CSS.)
const css = (c) => (typeof c === 'number' ? '#' + c.toString(16).padStart(6, '0') : c);
const neon = (d, text, px, pz, y, w, h, facing, fg, glow = fg) =>
  d.label(text, px, pz, y, w, h, facing, { bg: '#0a0614', fg: css(fg), glow: css(glow) });

// Everything on the main floor. `halls`: Jackson's chapters, where the halls are open and
// dark (his office, its doors and hall lights are drawn by his chapter).
export function buildPizzaplex(d, { halls = false } = {}) {
  const P = d.place.P;
  const pink = 0xff3fa4, cyan = 0x2de2e6, gold = 0xffd23f, purple = 0xc040ff;

  // ── The Atrium: Gus's giant stage, the sleepover, the fountain
  const stage = mat(0x3a1a5a, { rough: 0.5 });
  d.block(33, 16.3, 14, 4.6, 0.6, stage, { solid: false, nav: false });
  const a = P(26, 14), b = P(40, 18.6);
  d.place.raised.push({ x0: a.x, z0: a.z, x1: b.x, z1: b.z, h: 0.6 });
  d.block(33, 18.62, 14, 0.06, 0.6, mat(gold, { rough: 0.3, metal: 0.4 }), { solid: false, nav: false });
  for (const x of [25.6, 40.4]) d.block(x, 16, 1.2, 3.6, 5.2, cloth(0xb0102a), { solid: true });
  d.block(33, 14.4, 15.2, 0.4, 1.0, cloth(0xb0102a), { y: 4.5, solid: false, nav: false });
  neon(d, "GUS'S PIZZAPLEX", 33, 14.04, 3.9, 9, 1.3, 'south', gold, pink);
  // the speaker stacks and the light rig over the stage
  for (const x of [27.2, 38.8]) {
    d.block(x, 15.0, 1.0, 0.8, 2.4, mat(0x111114, { rough: 0.5 }), { y: 0.6, solid: false, nav: false });
    const c = P(x, 15.42, 1.9);
    d.mesh(G.cyl, lam(0x2a2a30), d.group, { p: [c.x, c.y, c.z], s: [0.3, 0.04, 0.3], r: [Math.PI / 2, 0, 0] });
  }
  d.lamp(29, 17, 4.8, pink, 2.2, { distance: 12, room: 'A' });
  d.lamp(37, 17, 4.8, cyan, 2.2, { distance: 12, room: 'A' });

  // the fountain in the middle, with a little Gus statue
  d.block(33, 27, 3.4, 3.4, 0.55, mat(0xd8d0c0, { rough: 0.4 }));
  d.patch(33, 27, 3.0, 3.0, 0x3a90c8, { y: 0.56 });
  d.block(33, 27, 0.5, 0.5, 1.6, mat(0xd8d0c0, { rough: 0.4 }), { y: 0.55, solid: false, nav: false });
  const fs = P(33, 27, 2.4);
  d.mesh(G.sphere, mat(gold, { metal: 0.7, rough: 0.3 }), d.group, { p: [fs.x, fs.y, fs.z], s: [0.35, 0.42, 0.3] });

  // the sleepover: sleeping bags and pillows in rows in front of the stage
  const bags = [0x3a6ab8, 0xc0262d, 0x7a3ab8, 0x2f8f5a, 0xffd23f, 0xff7eb6, 0x3ec1d3, 0xff9a1f];
  let k = 0;
  for (const z of [21.5, 23.6]) {
    for (const x of [24.5, 27, 29.5, 36.5, 39, 41.5]) {
      const c = P(x, z, 0.07);
      d.mesh(G.box, cloth(bags[k % bags.length]), d.group, { p: [c.x, c.y, c.z], s: [0.85, 0.14, 1.8] });
      const pl = P(x, z - 0.7, 0.16);
      d.mesh(G.box, cloth(0xf4f1ea), d.group, { p: [pl.x, pl.y, pl.z], s: [0.55, 0.1, 0.35] });
      k++;
    }
  }
  neon(d, 'SLEEPOVER\nNIGHT!', 20.04, 21, 2.9, 2.6, 1.5, 'east', gold, pink);
  // pillars round the edge, and banners
  for (const [x, z] of [[22, 30], [44, 30], [22, 19], [44, 19]]) d.block(x, z, 0.9, 0.9, 5.5, mat(0x2a2040, { rough: 0.4 }));
  for (const x of [26, 33, 40]) d.lamp(x, 31, 4.6, 0x9f7fff, 1.1, { distance: 10, room: 'A', flicker: x === 40 });
  d.label('← FOOD COURT', 20.04, 29, 2.6, 2.6, 0.5, 'east', { bg: '#1b1440', fg: '#fff', glow: gold });
  d.label('ARCADE →', 45.96, 29, 2.6, 2.4, 0.5, 'west', { bg: '#1b1440', fg: '#fff', glow: cyan });
  d.label('↓ BALL PIT', 37, 35.96, 2.6, 2.4, 0.5, 'north', { bg: '#1b1440', fg: '#fff', glow: pink });

  // ── The Food Court: tables, the pizza counter, trash cans
  d.counter(2.2, 24.5, 1.4, 9, 1.05, 0xc0262d, 0xf4f1ea);
  neon(d, 'PIZZA', 1.04, 24.5, 3.3, 4, 1.1, 'east', gold, 0xff5a5f);
  for (let i = 0; i < 4; i++) {
    const c = P(1.6, 21 + i * 2.3, 1.25);
    d.mesh(G.cyl, mat(0xff9a1f, { rough: 0.6 }), d.group, { p: [c.x, c.y, c.z], s: [0.32, 0.03, 0.32] });
  }
  for (const x of [7, 11.5, 16]) {
    for (const z of [17.5, 22, 26.5, 31]) {
      d.table(x, z, 1.6, 1.0, 0.74, 0xf4f1ea, { legs: 0xc0c0c0 });
      d.chair(x - 1.1, z, 0xff5a5f, 0.95);
      d.chair(x + 1.1, z, 0xffd23f, 0.95);
    }
  }
  for (const z of [15, 34]) d.block(17.4, z, 0.6, 0.6, 1.0, mat(0x3a3d44, { metal: 0.5, rough: 0.4 }));
  d.lamp(9, 20, 4.6, 0xffe2b0, 1.4, { distance: 11, room: 'F' });
  d.lamp(9, 30, 4.6, 0xffe2b0, 1.2, { distance: 11, room: 'F', flicker: true });

  // ── The Arcade: rows of cabinets, a claw machine, a prize ticket booth
  const titles = ['GUS RACER', 'PLATY BLAST', 'CRANKER ON ICE', 'CHOMP!', 'DOLPHIN DASH', 'GERALD SMASH', 'SPACE GUS', 'ROCCO BEATS'];
  let ti = 0;
  for (const z of [18, 24, 30]) {
    for (const x of [50, 53, 58, 61]) {
      d.cabinet(x, z, ti % 2 ? 'north' : 'south', [0x2a4fa0, 0x7a2a8a, 0x1f6f5a, 0xc0262d][ti % 4], titles[ti % titles.length]);
      ti++;
    }
  }
  neon(d, 'ARCADE', 64.96, 24.5, 3.4, 5, 1.2, 'west', cyan, pink);
  d.lamp(55, 20, 4.6, cyan, 1.2, { distance: 11, room: 'R' });
  d.lamp(55, 30, 4.6, pink, 1.2, { distance: 11, room: 'R' });

  // ── The Prize Counter: shelves of prizes behind a long glass counter
  d.counter(9.5, 41.5, 12, 1.0, 1.05, 0x2a4fa0, 0xbfe9ff);
  d.shelf(9.5, 47.4, 14, 0.8, 2.4, 'north', { wood: 0xffd23f, books: false });
  const prize = [0xff3b30, 0x3ec1d3, 0x7ad151, 0xa970ff, 0xff9a1f, 0xff7eb6];
  for (let i = 0; i < 18; i++) {
    const c = P(3.2 + i * 0.72, 46.9, 1.2 + (i % 3) * 0.55);
    d.mesh(G.sphere, cloth(prize[i % prize.length]), d.group, { p: [c.x, c.y, c.z], s: [0.2, 0.24, 0.18] });
  }
  neon(d, 'PRIZES', 9.5, 48.96, 3.5, 4.4, 1.0, 'north', gold, pink);
  d.lamp(9.5, 43, 4.6, 0xfff0c0, 1.3, { distance: 11, room: 'P' });

  // ── The giant ball pit: the biggest one there's ever been. CLOSED tonight.
  const wall = mat(0x2a4fa0, { rough: 0.4 });
  d.block(32.5, 38.6, 22, 0.25, 0.8, wall);
  d.block(32.5, 47.6, 22, 0.25, 0.8, wall);
  d.block(21.6, 43.1, 0.25, 9.2, 0.8, wall);
  d.block(43.4, 43.1, 0.25, 9.2, 0.8, wall);
  const pa = P(21.8, 38.8), pb = P(43.2, 47.4);
  d.place.slowZones.push({ x0: pa.x, z0: pa.z, x1: pb.x, z1: pb.z });
  d.ballPitBalls = d.balls(21.8, 38.8, 43.2, 47.4, 700);
  neon(d, 'GIANT BALL PIT', 32.5, 48.96, 3.6, 7, 1.2, 'north', pink, gold);
  for (const x of [26, 32.5, 39]) d.lamp(x, 43, 4.6, 0xff9ab8, 1.0, { distance: 10, room: 'B', flicker: x === 39 });

  // ── DJ Rocco's Party Room: his DJ booth, a light-up dance floor, the speakers
  d.counter(56, 46.5, 5, 1.2, 1.1, 0x111114, 0x2a2a30);
  for (const x of [54.6, 57.4]) {
    const c = P(x, 46.2, 1.13);
    d.mesh(G.cyl, lam(0x111111), d.group, { p: [c.x, c.y, c.z], s: [0.35, 0.02, 0.35] });
  }
  const floorCols = [pink, cyan, purple, gold];
  d.danceTiles = [];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) {
    d.danceTiles.push(d.patch(51.5 + i * 2, 39.5 + j * 1.6, 1.9, 1.5, floorCols[(i + j) % 4], { glow: 0.15 }));
  }
  for (const x of [48.5, 63.5]) d.block(x, 46.5, 1.2, 1.2, 2.6, mat(0x111114, { rough: 0.5 }));
  neon(d, "DJ ROCCO'S\nPARTY ROOM", 64.96, 42, 3.2, 3.6, 1.8, 'west', purple, pink);
  d.lamp(56, 42, 4.4, purple, 1.4, { distance: 11, room: 'K' });

  // ── The Gus Shop: plushies, Gus Watches, t-shirts
  for (const z of [4, 8]) d.shelf(9.5, z, 10, 0.8, 1.6, 'south', { wood: 0x5b2a86, books: false });
  for (let i = 0; i < 12; i++) {
    for (const z of [4.45, 8.45]) {
      const c = P(5 + i * 0.8, z, 1.75);
      d.mesh(G.sphere, mat(0x5aa86a, { rough: 0.6 }), d.group, { p: [c.x, c.y, c.z], s: [0.16, 0.2, 0.14] });
    }
  }
  neon(d, 'GUS SHOP', 9.5, 1.04, 3.4, 4.4, 1.0, 'south', gold, purple);
  d.lamp(9.5, 6.5, 4.6, 0xffe2b0, 1.1, { distance: 10, room: 'N' });

  // ── Parts & Service: spare parts, the charging stations
  for (const [x, z] of [[51, 4], [57, 7], [61.5, 3.5]]) d.junk(x, z, 1.6);
  d.shelf(64.4, 7, 0.8, 8, 2.6, 'west', { wood: 0x6a6a72, books: false });
  neon(d, 'PARTS & SERVICE\nSTAFF ONLY', 55, 14.04, 3.4, 4.0, 1.2, 'south', 0xff3b30);
  d.lamp(55, 7, 4.6, 0xffb070, 0.9, { distance: 11, room: 'T', flicker: true });

  // the halls up to security (dark in Jackson's chapters, but for his hall lights)
  if (!halls) {
    d.lamp(24, 6, 4.6, 0xd8e0ff, 0.6, { distance: 9, room: 'W', flicker: true });
    d.lamp(41, 6, 4.6, 0xd8e0ff, 0.6, { distance: 9, room: 'E', flicker: true });
    neon(d, 'STAFF ONLY', 41, 14.04, 3.0, 2.4, 0.5, 'south', 0xff3b30);
    d.block(41, 14.06, 1.6, 0.08, 2.2, mat(0x6a7078, { metal: 0.5, rough: 0.4 }), { solid: false, nav: false });
  }
}

// The dance floor pulses even with nobody dancing.
export function pulseDanceFloor(d, t) {
  if (!d.danceTiles) return;
  d.danceTiles.forEach((m, i) => {
    const on = Math.sin(t * 3 + i * 1.7) > 0.2;
    m.visible = on;
  });
}

export const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;
export { THREE };
