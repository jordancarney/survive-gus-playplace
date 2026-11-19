// The way out: Sushi's vents, above and below (the designer: "you crawl through vents to escape
// the very old pizzeria. Vents can go above and below the pizza[ria]").
//
//   ┌ Back ┐┌ the upper ducts (a maze over the rooms) ┐┌ Peter's room ┐
//   │ Room ├┤                                         ├┤  (over the   │
//   └──────┘│                                         ││   stage)     │
//           └────────────────────┬────────────────────┘└──────────────┘
//   ┌ the under-floor vents ┐ ┌ Fan Room ┐
//   │  (a long crawl,       │ │  the big │   ← you drop down the fan's shaft into the
//   │   back and forth)     │ │   fan    │     vents under the floor, where the suit can't fit
//   │                       │ └──────────┘
//   └──── drain grate ──────┘
//   ┌ outside, in the moonlight: the front of Sushi's Pizzaplex ┐   (for the ending)
import * as T from '../../textures.js';
import { MODEL_G as MG } from '../../models.js';
import { E, W, N, S, neon, G, lam, glowMat, mat, cloth, vent, THREE } from '../kit.js';

const UPPER = [
  { x0: 24, z0: 1, x1: 25, z1: 3 }, { x0: 12, z0: 3, x1: 20, z1: 4 }, { x0: 28, z0: 3, x1: 34, z1: 4 },
  { x0: 12, z0: 5, x1: 13, z1: 9 }, { x0: 16, z0: 6, x1: 25, z1: 7 }, { x0: 28, z0: 6, x1: 33, z1: 7 },
  { x0: 14, z0: 9, x1: 19, z1: 9 }, { x0: 22, z0: 9, x1: 29, z1: 9 }, { x0: 32, z0: 9, x1: 36, z1: 10 },
  { x0: 22, z0: 10, x1: 23, z1: 12 }, { x0: 10, z0: 12, x1: 15, z1: 12 }, { x0: 18, z0: 12, x1: 21, z1: 12 },
  { x0: 26, z0: 12, x1: 33, z1: 12 },
];
const LOWER = [{ x0: 1, z0: 22, x1: 19, z1: 22 }, { x0: 6, z0: 28, x1: 24, z1: 28 }, { x0: 1, z0: 34, x1: 19, z1: 34 }];

export const ventsLayout = {
  w: 52, h: 50, wallH: 3.4, panels: false,
  wallColor: 0x2a2c31, headerColor: 0x5a626a,
  ceiling: () => T.tiles('#3a3e44', '#2a2e34'),
  rooms: {
    B: { name: 'Back Room', x0: 1, z0: 1, x1: 8, z1: 6,
         floor: () => T.concrete(), wall: ['#4a4a50', '#8a6a2a', '#2a2a30', 'bricks'] },
    U: { name: 'Upper Vents', short: 'Vents ↑', x0: 10, z0: 1, x1: 36, z1: 14,
         floor: () => T.tiles('#7a828a', '#5a626a'), wall: ['#5a626a', '#9aa2aa', '#3a4048', 'panels'] },
    R: { name: '???', x0: 38, z0: 1, x1: 50, z1: 13,
         floor: () => T.wood('#4a3424'), wall: ['#2a1e18', '#8a6a2a', '#1a1410', 'panels'] },
    F: { name: 'Fan Room', short: 'Fan', x0: 26, z0: 16, x1: 36, z1: 24,
         floor: () => T.tiles('#6a6e74', '#4a4e54'), wall: ['#4a4e54', '#ff3b30', '#2a2e34', 'panels'] },
    D: { name: 'Under-floor Vents', short: 'Vents ↓', x0: 1, z0: 16, x1: 24, z1: 40,
         floor: () => T.concrete(), wall: ['#3a3630', '#5a4a3a', '#22201c', 'bricks'] },
    O: { name: 'Outside', x0: 1, z0: 43, x1: 30, z1: 48,
         floor: () => T.concrete(), wall: ['#2a2a3a', '#c0102a', '#16161e', 'bricks'] },
  },
  walls: [...UPPER, ...LOWER],
  doors: [
    { a: 'B', b: 'U', x0: 9, z0: 3, x1: 9, z1: 4 },
    { a: 'U', b: 'R', x0: 37, z0: 6, x1: 37, z1: 7 },
    { a: 'U', b: 'F', x0: 30, z0: 15, x1: 31, z1: 15 },
  ],
};

export const VENT_SPOTS = {
  spawn: [4.5, 3.5],
  friends: [[2.4, 2.4], [2.4, 4.8], [6.6, 5.2]],
  peterChair: [47.6, 7.0],
  shaftTop: [31, 20],
  shaftBottom: [22.2, 18.2],
  out: [3.2, 44.6],
  doors: [15.5, 43.4],
};

export function buildVents(d) {
  const P = d.place.P;

  // ── The Back Room: where all four of them climb in
  for (const [x, z, s] of [[7.4, 1.6, 0.8], [7.5, 2.5, 0.6], [1.6, 5.8, 0.7]]) d.crate(x, z, s, 0x8a6a42);
  d.lamp(4.5, 3.5, 3.0, 0xffb070, 1.0, { distance: 7, room: 'B', flicker: true });
  d.label('BIG VENT →', 8.96, 3.9, 1.4, 1.3, 0.28, 'west', { bg: '#22242a', fg: '#f2c230', glow: '#f2c230' });
  d.savePoint(4.5, 1.6, 'south');

  // ── The upper ducts: low, metal, over the rooms. Light comes up through the floor grates.
  vent(d, 10, 1, 36, 14, { kind: 'up', h: 1.15, walk: true });
  for (const [x, z, c] of [[14, 13.5, 0xffd8a0], [27, 5.2, 0xff3fa4], [11, 7, 0x2de2e6], [34, 13.5, 0xffd8a0], [20, 10.5, 0xc040ff], [26, 1.6, 0x2de2e6]]) {
    const g = d.anchor(x, z, 'south', 0.03);
    d.mesh(G.plane, glowMat(c, 0.18), g, { p: [0, 0, 0], s: [1.2, 0.8, 1], r: [-Math.PI / 2, 0, 0], shadow: false });
    for (let k = 0; k < 5; k++) d.mesh(G.box, lam(0x2a2c31), g, { p: [-0.48 + k * 0.24, 0.01, 0], s: [0.04, 0.02, 0.8], shadow: false });
  }
  d.savePoint(34.6, 13.4, 'west');

  // ── Peter's room, up over the stage. Nobody was meant to find it.
  // a wall of monitors showing every camera in the place
  d.screens = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const g = d.anchor(49.6, 3.5 + c * 1.6, 'west', 0.9 + r * 0.7);
    d.mesh(G.box, lam(0x111111), g, { p: [0, 0, -0.05], s: [1.4, 0.6, 0.1] });
    const m = d.mesh(G.plane, glowMat([0x2a5a3a, 0x2a3a5a, 0x3a2a4a][(r + c) % 3], 0.25), g, { p: [0, 0, 0.005], s: [1.3, 0.52, 1], shadow: false, still: false });
    m.userData.base = m.material.color.clone();
    d.screens.push(m);
  }
  d.place.addBlock(49.2, 2.6, 50.9, 9.6, 3);
  // his workbench: Moony's plans, a half-built hand, tools
  d.table(44, 12.2, 3.2, 1.2, 0.9, 0x5a4a3a, { legs: 0x2a2a30 });
  d.mesh(G.sphere, mat(0x1c1530), d.group, { p: [P(43, 12.2).x, 1.12, P(43, 12.2).z], s: [0.22, 0.2, 0.2] });
  // the chair where the old otter suit slumps
  d.block(47.6, 7.0, 1.1, 1.0, 0.5, cloth(0x4a2a1a), { solid: true });
  d.block(48.3, 7.0, 0.2, 1.0, 1.3, cloth(0x4a2a1a), { solid: false, nav: false });
  // the music box on its pedestal: it never stops
  d.block(41, 6.5, 0.6, 0.6, 1.0, mat(0x3a2a1a, { rough: 0.6 }));
  d.musicBox = d.mesh(G.cyl, mat(0xb8902a, { metal: 0.7, rough: 0.3 }), d.group, { p: [P(41, 6.5).x, 1.12, P(41, 6.5).z], s: [0.18, 0.22, 0.18], still: false });
  // old otter-suit spare parts in a crate, and a calendar
  d.crate(39, 12.2, 0.9, 0x5a4a3a);
  d.label('GUS FOREVER', 38.04, 9, 2.2, 1.6, 0.36, 'east', { bg: '#2a1e18', fg: '#b8902a', glow: '#b8902a' });
  // the fan switch, by the door
  d.target('fanSwitch', 38.6, 4.2, 'east', 'Pull the big red FAN switch', (g) => {
    d.mesh(G.box, mat(0x3a3a40, { metal: 0.5 }), g, { p: [0, 1.3, -0.25], s: [0.5, 0.7, 0.12] });
    d.fanLever = d.mesh(G.box, mat(0xc0102a, { rough: 0.4 }), g, { p: [0, 1.45, -0.12], s: [0.08, 0.36, 0.08], r: [0.5, 0, 0], still: false });
  }, { reach: 1.5 });
  d.label('FAN', 38.04, 4.2, 2.1, 0.7, 0.26, 'east', { bg: '#2a0606', fg: '#ff3b30', glow: '#ff3b30' });
  d.lamp(44, 7, 3.0, 0xffb070, 0.8, { distance: 9, room: 'R', flicker: true });
  d.lamp(48.6, 6.5, 1.5, 0x5aff8a, 0.6, { distance: 4, room: 'R' });
  d.lamp(46.6, 7.0, 2.9, 0xffc890, 1.0, { distance: 5.5, room: 'R' });   // over the chair

  // ── The Fan Room: the big fan over the shaft down
  const fan = d.anchor(31, 20, 'south', 0.25);
  d.mesh(G.cyl, mat(0x2a2c31, { metal: 0.6 }), fan, { p: [0, -0.2, 0], s: [2.4, 0.1, 2.4] });
  d.mesh(MG.torus, mat(0x8a9098, { metal: 0.7 }), fan, { p: [0, 0.05, 0], s: [2.3, 2.3, 1.2], r: [Math.PI / 2, 0, 0] });
  d.fanBlades = new THREE.Group();
  fan.add(d.fanBlades);
  for (let k = 0; k < 4; k++) {
    const b = d.mesh(G.box, mat(0x9aa2aa, { metal: 0.7 }), d.fanBlades, { p: [0, 0, 0], s: [0.5, 0.04, 4.2], r: [0.25, (k * Math.PI) / 4, 0], still: false });
    void b;
  }
  d.mesh(G.cyl, mat(0x5a5a60, { metal: 0.7 }), d.fanBlades, { p: [0, 0.05, 0], s: [0.35, 0.2, 0.35], still: false });
  d.fanBlock = d.place.addBlock(28.8, 17.8, 33.2, 22.2, 0.6);
  d.target('shaft', 31, 22.9, 'north', 'Climb down the fan shaft ⬇️', null, { reach: 1.8 });
  neon(d, '⚠ BIG FAN ⚠', 31, 16.04, 2.6, 2.4, 0.4, 'south', 0xff3b30, 0xff3b30);
  d.lamp(31, 20, 3.0, 0xff6a5a, 0.9, { distance: 9, room: 'F', flicker: true });
  d.savePoint(35.2, 23.0, 'west');

  // ── The under-floor vents: concrete and pipes, back and forth
  vent(d, 1, 16, 24, 40, { kind: 'down', h: 1.05, walk: true });
  for (const [x, z] of [[22, 20], [3, 25], [20, 31], [4, 38]]) d.patch(x, z, 1.4, 0.9, 0x2a3a4a, { y: 0.03, glow: 0 });
  d.savePoint(2.4, 30.4, 'east');
  // the drain grate out, at the very end
  d.exitDoor(3, 40.45, 'north', { w: 1.2, label: 'OUT!' });
  d.label('OUTSIDE ↓', 3, 40.96, 0.75, 1.0, 0.22, 'north', { bg: '#0a2a0a', fg: '#3cff6b', glow: '#3cff6b' });
  d.lamp(3, 39.4, 0.8, 0x9fb8ff, 0.8, { distance: 4, room: 'D' });

  // ── Outside: the front of Sushi's Pizzaplex in the moonlight (the ending happens here)
  neon(d, "SUSHI'S PIZZAPLEX", 15.5, 43.04, 2.6, 7, 0.9, 'south', 0xffd23f, 0xc0102a);
  neon(d, 'SEE YOU SOON!', 15.5, 43.04, 1.95, 3.4, 0.42, 'south', 0xff3fa4, 0xffd23f);
  const fd = d.anchor(15.5, 43.05, 'south', 0);
  for (const sx of [-1, 1]) d.mesh(G.box, mat(0x6a6a72, { metal: 0.6 }), fd, { p: [sx * 0.8, 0.0 + 0.85, 0.02], s: [1.5, 1.7, 0.08] });
  for (let k = 0; k < 7; k++) d.mesh(MG.torus, mat(0xa0a0a8, { metal: 0.8 }), fd, { p: [-0.6 + k * 0.2, 0.9, 0.1], s: [0.05, 0.05, 0.05], r: [0, k % 2 ? Math.PI / 2 : 0, 0] });
  for (const x of [4, 9, 22, 27]) d.window(x, 43.03, 1.6, 2.2, 1.0, 'south');
  d.block(3.2, 43.4, 1.0, 0.6, 0.05, mat(0x3a3a40, { metal: 0.6 }), { solid: false, nav: false });   // the drain grate
  d.lamp(15, 46, 4.0, 0x9fb8ff, 1.6, { distance: 18, room: 'O' });
  d.lamp(15.5, 43.6, 2.6, 0xff3fa4, 0.8, { distance: 6, room: 'O', flicker: true });
}

export { E, W, N, S };
