// Sushi's Pizzaplex, from the designer's map: the very old pizzeria, closed for years, dusty and
// falling apart. One floor plan, built again for parts 1 and 3. About 200 ft (64 m) across.
//
//   ═══════════════ the upper vent, along the top ═══════════════════════════════
//   ┌ Laser Tag ┐ ┌ Entrance ┐ ┌ Gift ┐ ┌ Play Area ────────────┐
//   │  (a maze) │ │ "See you │ │ Shop │ │  start ┐  the roller   │
//   │           │ │  soon"   │ ├──────┤ │        │  coaster runs │
//   │           │ │          │ │ Back │ │   END  │  round the    │
//   └───────────┘ └────┬─────┘ └──────┘ │        │  right and    │
//   ┌ Go-Karts ┐ ┌ Main Area ─────────┐ │        │  bottom edges │
//   │ (an oval │ │ VIP   round tables │ │  ball pit     │      │
//   │  track)  │ │ Seating            │ │               │      │
//   │          │ │ DAYCARE Show Stage │ │ ──────────────┘      │
//   └──────────┘ └──── pizza counter ─┘ └───────────────────────┘
//   ═══════════════ the under-floor vent, along the bottom ═════════════════════
//
// Locks (the designer's cards): blue for the Gift Shop and Laser Tag, the Security Badge for
// the Go-Karts, the Play Area and the vent grates into them, the VIP card for VIP Seating.
import * as T from '../../textures.js';
import { MODEL_G as MG } from '../../models.js';
import {
  E, W, N, S, neon, G, lam, glowMat, mat, cloth, cardDoor, vent, ventHole, hideIn, plushShelf, THREE,
} from '../kit.js';

export const ROOMS = {
  U: { name: 'Upper Vent', short: 'Vent', x0: 1, z0: 1, x1: 62, z1: 1,
       floor: () => T.tiles('#7a828a', '#5a626a'), wall: ['#5a626a', '#9aa2aa', '#3a4048', 'panels'] },
  L: { name: 'Laser Tag', x0: 1, z0: 3, x1: 22, z1: 18,
       floor: () => T.carpet('#0c0a1e'), wall: ['#0a0a1a', '#2de2e6', '#ff3fa4', 'stars'] },
  N: { name: 'Entrance', x0: 24, z0: 3, x1: 36, z1: 18,
       floor: () => T.checker('#b8b0a0', '#3a2a2a'), wall: ['#6a5a48', '#c0102a', '#3a2a22', 'stripes'] },
  S: { name: 'Gift Shop', x0: 38, z0: 3, x1: 43, z1: 12,
       floor: () => T.carpet('#3a1a2a'), wall: ['#7a5a6a', '#ffd23f', '#3a2a3a', 'stars'] },
  B: { name: 'Back Room', x0: 38, z0: 14, x1: 43, z1: 18,
       floor: () => T.concrete(), wall: ['#4a4a50', '#8a6a2a', '#2a2a30', 'bricks'] },
  P: { name: 'Play Area', x0: 45, z0: 3, x1: 62, z1: 46,
       floor: () => T.playmat(), wall: ['#4a3a6a', '#c8a030', '#2a4a5a', 'bubbles'] },
  K: { name: 'Go-Karts', x0: 1, z0: 20, x1: 16, z1: 46,
       floor: () => T.concrete(), wall: ['#2a2a30', '#2de2e6', '#16161a', 'stripes'] },
  M: { name: 'Main Area', x0: 18, z0: 20, x1: 43, z1: 46,
       floor: () => T.checker('#a8a090', '#2a3a5a'), wall: ['#5a4a6a', '#c0102a', '#2a2238', 'stripes'] },
  Q: { name: 'VIP Seating', short: 'VIP', x0: 18, z0: 29, x1: 23, z1: 36,
       floor: () => T.carpet('#4a0e1a'), wall: ['#4a0e1a', '#ffd23f', '#2a0610', 'stars'] },
  D: { name: 'Under-floor Vent', short: 'Vent', x0: 1, z0: 48, x1: 62, z1: 48,
       floor: () => T.concrete(), wall: ['#3a3630', '#5a4a3a', '#22201c', 'bricks'] },
};

// The Laser Tag maze (the designer drew it all zig-zags): walls inside the room, in cells.
const MAZE = [
  { x0: 3, z0: 6, x1: 12, z1: 6 }, { x0: 15, z0: 6, x1: 20, z1: 6 },
  { x0: 9, z0: 9, x1: 19, z1: 9 }, { x0: 6, z0: 9, x1: 6, z1: 15 },
  { x0: 12, z0: 12, x1: 20, z1: 12 }, { x0: 3, z0: 12, x1: 4, z1: 12 },
  { x0: 9, z0: 12, x1: 9, z1: 16 }, { x0: 15, z0: 15, x1: 20, z1: 15 },
  { x0: 12, z0: 15, x1: 12, z1: 17 },
];
// VIP Seating's walls, inside the Main Area.
const VIP_WALLS = [{ x0: 24, z0: 28, x1: 24, z1: 37 }, { x0: 18, z0: 28, x1: 24, z1: 28 }, { x0: 18, z0: 37, x1: 24, z1: 37 }];

const DOORS = [
  { a: 'U', b: 'L', x0: 10, z0: 2, x1: 10, z1: 2 },
  { a: 'U', b: 'S', x0: 40, z0: 2, x1: 40, z1: 2 },
  { a: 'U', b: 'P', x0: 52, z0: 2, x1: 52, z1: 2 },
  { a: 'N', b: 'L', x0: 23, z0: 9, x1: 23, z1: 10 },
  { a: 'N', b: 'S', x0: 37, z0: 6, x1: 37, z1: 7 },
  { a: 'S', b: 'B', x0: 39, z0: 13, x1: 40, z1: 13 },
  { a: 'N', b: 'M', x0: 28, z0: 19, x1: 32, z1: 19 },
  { a: 'M', b: 'K', x0: 17, z0: 22, x1: 17, z1: 24 },
  { a: 'M', b: 'P', x0: 44, z0: 26, x1: 44, z1: 28 },
  { a: 'M', b: 'Q', x0: 24, z0: 32, x1: 24, z1: 33 },
  { a: 'D', b: 'K', x0: 8, z0: 47, x1: 8, z1: 47 },
  { a: 'D', b: 'M', x0: 31, z0: 47, x1: 31, z1: 47 },
  { a: 'D', b: 'P', x0: 54, z0: 47, x1: 54, z1: 47 },
];

export function pizzaplexLayout() {
  return {
    w: 64, h: 50, wallH: 4.6, panels: false,
    wallColor: 0x2a2228, headerColor: 0x6a5a48,
    ceiling: () => T.tiles('#3a343a', '#2a2428'),
    rooms: ROOMS, walls: [...MAZE, ...VIP_WALLS], doors: DOORS,
  };
}

// Where things are, for the parts and the cutscenes.
export const SPOTS = {
  spawn: [30, 5.2],
  frontDoors: [30, 3.2],
  bobHide: [2.4, 16.8],
  backRoom: [[39.4, 15.6], [41.0, 17.4], [42.6, 15.4]],
  billyHide: [8.5, 33.2],
  timTop: [47.5, 38.6],
  timOut: [46.6, 31.8],
  cardMachine: [35.5, 20.7],
  daycareDoor: [21, 46.4],
  boothAt: [51, 46.2],
  stage: [31, 44.6],
};

// The roller coaster: from START at the top right, down the right side, along the bottom, and
// up the left to the END station. Chomper's runaway cart rides it back and forth (all but the
// broken hill at the end).
export const COASTER = [[60.5, 5.5], [60.5, 44.5], [47.5, 44.5], [47.5, 31]];
export const CHOMPER_RUN = [[60.5, 6], [60.5, 44.5], [50.5, 44.5]];
// The go-kart oval Flipper drives round and round.
export const KART_LOOP = [
  [3.5, 26], [3.5, 40], [4.6, 42.8], [8.5, 43.8], [12.4, 42.8], [13.5, 40], [13.5, 26], [12.4, 23.2], [8.5, 22.2], [4.6, 23.2],
];

export function buildPizzaplex(d, { part = 1 } = {}) {
  const P = d.place.P;
  const pink = 0xff3fa4, cyan = 0x2de2e6, gold = 0xffd23f, red = 0xc0102a, dusty = 0xffd8a0;
  d.cardDoors = [];

  // ── Vents, above and below (the designer's call), and their openings
  vent(d, 1, 1, 62, 1, { kind: 'up' });
  vent(d, 1, 48, 62, 48, { kind: 'down' });
  ventHole(d, 10, 2);
  ventHole(d, 40, 2);
  ventHole(d, 31, 47);
  d.grates = {
    upP: cardDoor(d, 52, 2, 52, 2, 'badge', { vent: true }),
    downK: cardDoor(d, 8, 47, 8, 47, 'badge', { vent: true }),
    downP: cardDoor(d, 54, 47, 54, 47, 'badge', { vent: true }),
  };
  for (const [x, z, f, t] of [[10, 3.04, 'south', 'VENT ↑'], [40, 3.04, 'south', 'VENT ↑'], [31, 46.96, 'north', 'VENT ↓'],
    [52, 3.04, 'south', 'VENT ↑'], [8, 46.96, 'north', 'VENT ↓'], [54, 46.96, 'north', 'VENT ↓']]) {
    d.label(t, x + 0.5, z, 1.35, 0.9, 0.22, f, { bg: '#22242a', fg: '#f2c230', glow: '#f2c230' });
  }

  // ── The card doors
  d.locks = {
    laser: cardDoor(d, 23, 9, 23, 10, 'blue', { label: 'LASER TAG' }),
    gift: cardDoor(d, 37, 6, 37, 7, 'blue', { label: 'GIFT SHOP' }),
    karts: cardDoor(d, 17, 22, 17, 24, 'badge', { label: 'GO-KARTS' }),
    play: cardDoor(d, 44, 26, 44, 28, 'badge', { label: 'PLAY AREA' }),
    vip: cardDoor(d, 24, 32, 24, 33, 'vip', { label: 'VIP SEATING' }),
  };

  // ── The Entrance: the front doors (chained), the "See you soon" sign, the ticket booth
  const doorsG = d.anchor(30.5, 3.0, 'south', 0);
  const glass = new THREE.MeshStandardMaterial({ color: 0x1a2a3a, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.7 });
  for (const sx of [-1, 1]) {
    d.mesh(G.box, mat(0x6a6a72, { metal: 0.6 }), doorsG, { p: [sx * 1.0, 1.25, 0], s: [1.9, 2.5, 0.1] });
    d.mesh(G.plane, glass, doorsG, { p: [sx * 1.0, 1.4, 0.06], s: [1.5, 1.9, 1], shadow: false });
  }
  // the chain, looped through both handles
  for (let k = 0; k < 9; k++) d.mesh(MG.torus, mat(0xa0a0a8, { metal: 0.8, rough: 0.3 }), doorsG, { p: [-0.8 + k * 0.2, 1.15 + Math.sin(k * 0.8) * 0.05, 0.12], s: [0.06, 0.06, 0.06], r: [0, k % 2 ? Math.PI / 2 : 0, 0] });
  d.mesh(G.box, mat(0x8a7a2a, { metal: 0.7 }), doorsG, { p: [0, 1.0, 0.14], s: [0.16, 0.2, 0.08] });   // padlock
  d.place.addBlock(28.5, 2.9, 32.5, 3.3, 2.6);
  neon(d, 'SEE YOU SOON!', 30.5, 3.04, 3.3, 4.2, 0.6, 'south', pink, gold);
  neon(d, "SUSHI'S PIZZAPLEX", 30.5, 18.96, 3.6, 5.5, 0.8, 'north', gold, red);
  d.counter(26, 15, 2.6, 1.0, 1.1, 0x7a2a2a, 0xc8b89a);
  d.label('TICKETS', 26, 14.48, 1.45, 1.4, 0.3, 'north', { bg: '#7a2a2a', fg: '#ffd23f', glow: '#ffd23f' });
  d.counter(35, 4.4, 2.2, 0.9, 1.0, 0x4a3a2a, 0xa89a7a);
  d.label('COAT CHECK', 35, 4.92, 1.35, 1.4, 0.26, 'south', { bg: '#3a2a22', fg: '#ffd8a0', glow: '#ffd8a0' });
  for (const x of [25.2, 35.8]) for (const z of [8, 12]) d.block(x, z, 0.5, 0.5, 2.4, mat(0x5a4a3a, { rough: 0.8 }));
  d.rug(30.5, 10, 6, 8, '#5a1a1a', '#b8902a');
  hideIn(d, 'cart', 34.6, 15.6, 'west', { color: 0x5a6a7a });
  d.savePoint(27.4, 6.2, 'east');
  d.lamp(30.5, 8, 3.8, dusty, 1.4, { distance: 11, room: 'N', flicker: true });
  d.lamp(30.5, 15, 3.8, dusty, 1.0, { distance: 9, room: 'N' });
  // old posters of the gang, peeling
  for (const [x, z, f, t, c] of [[24.04, 6, 'east', 'SUSHI', '#3a9aff'], [24.04, 14, 'east', 'CHOMPER', '#7cff3a'],
    [36.96, 11, 'west', 'FLIPPER', '#ff5ad1'], [36.96, 15, 'west', 'MOONY', '#bfe4ff']]) {
    d.label(`★ ${t} ★`, x, z, 2.1, 1.1, 1.4, f, { bg: '#2a2228', fg: c, glow: c });
  }

  // ── Laser Tag: a black-light maze
  neon(d, 'LASER TAG', 24.04, 9.8, 3.5, 3.0, 0.6, 'east', cyan, pink);
  for (const [x, z, c] of [[4, 4.5, pink], [18, 4.5, cyan], [10, 7.6, 0x7cff6b], [4, 10.5, cyan], [16, 10.5, pink], [15, 13.5, 0x7cff6b],
    [3, 16.5, pink], [18, 17, cyan], [10.5, 14, 0x9b6bff]]) {
    d.lamp(x, z, 2.6, c, 0.9, { distance: 5.5, room: 'L', size: 0.06 });
  }
  // the vest rack by the door, and barriers to crouch behind
  d.block(21.6, 12.8, 0.6, 2.4, 1.8, mat(0x1a1a22, { rough: 0.6 }));
  for (const [x, z, w, dd] of [[14, 7.5, 2, 0.5], [3, 8.5, 0.5, 1.5], [19, 13.5, 0.5, 1.6], [14.5, 17, 1.6, 0.5], [7.5, 17.4, 2, 0.4]]) {
    d.block(x, z, w, dd, 1.1, mat(0x2a1a3a, { rough: 0.5 }));
  }
  hideIn(d, 'shelf', 20.5, 4.2, 'south', { color: 0x1a1a2a });
  d.hideSpot('box', 7.5, 4.6, 'south', { color: 0x2a1a3a });
  d.hideSpot('locker', 21.3, 16.8, 'west', { color: 0x3a2a6a });

  // ── The Gift Shop: racks of old stock, the plushie shelf, the trade counter
  neon(d, 'GIFT SHOP', 36.96, 7.0, 3.1, 2.6, 0.5, 'west', gold, pink);
  // (behind the shelf, set into the wall: Peter's old locker, for the secret ending)
  d.block(43.9, 7.6, 0.12, 0.8, 1.9, mat(0x5a5a62, { metal: 0.5, rough: 0.5 }), { solid: false, nav: false });
  d.label('PETER', 43.82, 7.6, 1.6, 0.6, 0.2, 'west', { bg: '#3a3a40', fg: '#d8d0c0', glow: '#3a3a40' });
  plushShelf(d, 43.4, 7.6, 'west');
  for (const [x, z] of [[39.6, 5.2], [39.6, 9.2]]) d.block(x, z, 1.4, 0.6, 1.3, mat(0x5a3a4a, { rough: 0.7 }));
  hideIn(d, 'shelf', 38.65, 11.4, 'east', { color: 0x5a3a2a });
  d.counter(41.6, 11.6, 2.2, 0.8, 1.0, 0x5a3a4a, 0xd8c8b0);
  d.target('trade', 41.6, 11.6, 'north', 'Trade your plushies for the shelf 🧸', (g) => {
    d.mesh(G.box, lam(0x2a2a30), g, { p: [0.6, 1.15, 0], s: [0.4, 0.3, 0.35] });
    d.mesh(G.box, glowMat(0x3cdc6b, 0.3), g, { p: [0.6, 1.2, -0.18], s: [0.3, 0.14, 0.01] });
  }, { reach: 1.4 });
  d.label('TRADE 🧸', 41.6, 12.02, 1.6, 1.2, 0.26, 'north', { bg: '#2a0e33', fg: '#ffd23f', glow: '#ff3fa4' });
  d.savePoint(42.6, 4.0, 'west');
  d.lamp(40.5, 7.5, 3.6, 0xffc8e0, 1.2, { distance: 8, room: 'S', flicker: true });

  // ── The Back Room: where the found friends wait. Boxes, an old couch, the big vent
  d.block(39.0, 17.8, 2.2, 0.8, 0.5, cloth(0x5a3a2a));
  d.block(39.0, 18.3, 2.2, 0.2, 0.9, cloth(0x5a3a2a));
  for (const [x, z, s] of [[42.8, 14.6, 0.8], [42.9, 15.5, 0.6], [38.5, 14.5, 0.7]]) d.crate(x, z, s, 0x8a6a42);
  d.lamp(41, 16, 3.4, 0xffb070, 1.0, { distance: 7, room: 'B', flicker: true });

  // ── The Main Area: round tables, VIP Seating, the Show Stage, the pizza counter
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (const [x, z] of [[27, 23], [33, 23], [39, 23], [27.5, 29], [33, 29.5], [39, 29], [28, 35], [34, 35.5], [39.5, 35]]) {
    const tipped = rnd() < 0.25;
    const top = d.mesh(G.cyl, mat(0x8a2a2a, { rough: 0.6 }), d.group, { p: [P(x, z).x, tipped ? 0.5 : 0.74, P(x, z).z], s: [0.85, 0.05, 0.85], r: tipped ? [1.3, rnd() * 3, 0] : [0, 0, 0] });
    void top;
    if (!tipped) d.mesh(G.cyl, mat(0x2a2a30, { metal: 0.6 }), d.group, { p: [P(x, z).x, 0.37, P(x, z).z], s: [0.08, 0.74, 0.08] });
    d.place.addBlock(x - 0.7, z - 0.7, x + 0.7, z + 0.7, 0.78);
    for (let k = 0; k < 4; k++) {
      if (rnd() < 0.3) continue;
      const a = k * Math.PI / 2 + rnd() * 0.5;
      d.chair(x + Math.cos(a) * 1.2, z + Math.sin(a) * 1.2, [0xc0262d, 0x2a4fa0, 0xffd23f, 0x2f8f3a][k], 0.95);
    }
  }
  // the card machine (Part 1's job): put a card in, get a better one out. Supposedly.
  d.target('cardMachine', ...SPOTS.cardMachine, 'south', 'Upgrade your card at the card machine', (g) => {
    d.mesh(G.box, mat(0x3a3a48, { metal: 0.5, rough: 0.4 }), g, { p: [0, 0.8, 0], s: [0.9, 1.6, 0.6] });
    d.mesh(G.box, glowMat(0x3cdc6b, 0.4), g, { p: [0, 1.25, 0.31], s: [0.6, 0.3, 0.01] });
    d.mesh(G.box, lam(0x111111), g, { p: [0, 0.95, 0.31], s: [0.3, 0.04, 0.02] });
    d.cardScreen = d.mesh(G.box, glowMat(0xffd23f, 0.3), g, { p: [0, 1.48, 0.31], s: [0.6, 0.1, 0.01], still: false });
  });
  d.label('CARD UPGRADE', SPOTS.cardMachine[0], SPOTS.cardMachine[1] + 0.32, 1.95, 1.2, 0.26, 'south', { bg: '#1a2a1a', fg: '#3cdc6b', glow: '#3cdc6b' });
  d.place.addBlock(35.0, 20.4, 36.0, 21.0, 1.6);

  // the Show Stage, Sushi's own, across the bottom wall
  const stage = mat(0x2a1a3a, { rough: 0.5 });
  d.block(31, 44.6, 10, 4, 0.7, stage, { solid: false, nav: false });
  const sa = P(26, 42.6), sb = P(36, 46.6);
  d.place.raised.push({ x0: sa.x, z0: sa.z, x1: sb.x, z1: sb.z, h: 0.7 });
  for (const x of [25.7, 36.3]) d.block(x, 44.6, 0.8, 4, 4.2, cloth(red), { solid: true });
  d.block(31, 46.7, 11, 0.3, 3.2, cloth(0x6a0a1a), { y: 0.7, solid: false, nav: false });
  neon(d, "SUSHI'S SHOW STAGE", 31, 46.4, 3.7, 5, 0.6, 'north', gold, pink);
  d.lamp(28, 43, 4.0, pink, 1.1, { distance: 9, room: 'M', flicker: true });
  d.lamp(34, 43, 4.0, cyan, 1.1, { distance: 9, room: 'M' });
  // the pizza counter ("make pizza", on the map)
  d.counter(40.5, 41.4, 5, 0.9, 1.05, 0x8a5a32, 0xd8d0b8);
  d.block(42.6, 45.6, 1.6, 1.2, 1.6, mat(0x5a5a60, { metal: 0.5 }));
  d.label('MAKE-A-PIZZA', 40.5, 40.92, 1.55, 2.0, 0.3, 'north', { bg: '#8a2a1a', fg: '#ffd23f', glow: '#ffd23f' });
  d.target('oven', 42.6, 44.9, 'north', 'Bake an old pizza 🍕', (g) => {
    d.mesh(G.box, lam(0x111111), g, { p: [0, 0.9, 0.61], s: [1.1, 0.5, 0.02] });
    d.ovenGlow = d.mesh(G.box, glowMat(0xff6a1a, 0.1), g, { p: [0, 0.9, 0.62], s: [0.9, 0.35, 0.01], still: false });
  });
  hideIn(d, 'cart', 37.6, 43.6, 'north', { color: 0x7a6a5a });
  d.hideSpot('counter', 19.4, 42.6, 'east', { color: 0x5a3a2a });
  d.hideSpot('curtain', 25.2, 39.6, 'east', { color: 0x6a0a1a });
  // the daycare door, bottom left: part 1's way out
  neon(d, "GERALD'S DAYCARE ↓", 21, 46.96, 3.3, 3.4, 0.5, 'north', 0xc040ff, gold);
  d.savePoint(42.4, 21.5, 'west');
  d.savePoint(19.2, 26.4, 'east');
  for (const [x, z, f] of [[23, 22, false], [37, 26, true], [30, 31, false], [22, 41, true], [41, 33, false]]) d.lamp(x, z, 4.1, dusty, 0.8, { distance: 8, room: 'M', flicker: f });
  // dust and cobwebs: it's been closed for years
  for (const [x, z, w, dd] of [[24, 24, 3, 2], [36, 32, 4, 2.5], [29, 38, 3, 2], [41, 27, 2, 3]]) d.patch(x, z, w, dd, 0x2a2420, { y: 0.014 });
  for (const [x, z, f] of [[18.1, 21, 'east'], [42.9, 45, 'west'], [36.9, 3.4, 'west']]) {
    const g = d.anchor(x, z, f, 3.6);
    d.mesh(G.plane, new THREE.MeshBasicMaterial({ color: 0xd8d8d8, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }), g,
      { p: [0, 0, 0.3], s: [1.2, 1.0, 1], r: [0, 0.6, 0.3], shadow: false });
  }

  // ── VIP Seating: velvet booths, a golden table, and an old photo on the wall
  for (const z of [30.2, 35.8]) d.block(20.5, z, 4, 0.9, 0.9, cloth(0x7a0a1a));
  d.table(20.5, 33, 2.2, 1.2, 0.74, 0xd8a020, { legs: 0x8a6a1a });
  neon(d, 'VIP', 25.04, 30, 2.9, 1.2, 0.5, 'east', gold, pink);
  d.target('photo', 18.3, 33, 'east', 'Look at the old photo 🖼️', (g) => {
    d.mesh(G.box, mat(0xb8902a, { metal: 0.7 }), g, { p: [0, 1.7, -0.22], s: [0.9, 0.7, 0.04] });
    d.mesh(G.plane, glowMat(0xd8c8a0, 0.15), g, { p: [0, 1.7, -0.195], s: [0.76, 0.56, 1], shadow: false });
  });
  d.savePoint(22.6, 29.8, 'west');
  d.lamp(20.5, 33, 3.6, 0xffc880, 1.2, { distance: 7, room: 'Q' });

  // ── The Go-Karts: the oval, its pit garage, tyre walls
  const asphalt = 0x1c1c20;
  for (let i = 0; i < KART_LOOP.length; i++) {
    const [ax, az] = KART_LOOP[i], [bx, bz] = KART_LOOP[(i + 1) % KART_LOOP.length];
    const len = Math.hypot(bx - ax, bz - az);
    const c = P((ax + bx) / 2, (az + bz) / 2, 0.016);
    d.mesh(G.plane, mat(asphalt, { rough: 0.95 }), d.group, { p: [c.x, c.y, c.z], s: [2.4, len + 0.8, 1], r: [-Math.PI / 2, 0, Math.atan2(bx - ax, bz - az)], shadow: false });
  }
  for (let k = 0; k < 6; k++) d.patch(3.5 - 1.1 + 0.37 * k + 0.18, 33, 0.37, 0.5, k % 2 ? 0xffffff : 0x111111, { y: 0.02 });
  neon(d, 'GO-KARTS', 18.04, 23.5, 3.5, 2.6, 0.5, 'east', cyan, gold);
  d.block(8.5, 27.6, 4.6, 0.3, 2.4, mat(0x3a3a40, { rough: 0.6 }));       // the garage's back wall
  d.block(8.5, 32.5, 5.2, 10, 0.12, mat(0x5a5a62, { metal: 0.4 }), { y: 2.5, solid: false, nav: false });   // its roof
  for (const [x, z] of [[6.2, 30], [10.8, 30], [6.2, 36.5], [10.8, 36.5]]) d.block(x, z, 0.2, 0.2, 2.5, mat(0x5a5a62, { metal: 0.5 }));
  hideIn(d, 'tires', 6.9, 34.4, 'east');
  hideIn(d, 'tires', 15.2, 44.5, 'west');
  hideIn(d, 'tires', 1.9, 21.5, 'east');
  d.lamp(8.5, 33, 2.3, 0xffe2b0, 1.0, { distance: 7, room: 'K', flicker: true });
  d.lamp(8.5, 24, 4.0, cyan, 0.8, { distance: 10, room: 'K' });
  d.lamp(8.5, 42, 4.0, pink, 0.8, { distance: 10, room: 'K' });

  // ── The Play Area: the roller coaster round the edge, the ball pit, play towers
  const rail = mat(0x9a9aa2, { metal: 0.75, rough: 0.3 }), tie = mat(0x5a3a22, { rough: 0.8 });
  for (let i = 0; i < COASTER.length - 1; i++) {
    const [ax, az] = COASTER[i], [bx, bz] = COASTER[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    const ang = Math.atan2(bx - ax, bz - az);
    const g = d.anchor((ax + bx) / 2, (az + bz) / 2, ang, 0);
    for (const sx of [-0.45, 0.45]) d.mesh(G.box, rail, g, { p: [sx, 0.12, 0], s: [0.08, 0.08, len + 0.5] });
    for (let t = -len / 2; t < len / 2; t += 0.9) d.mesh(G.box, tie, g, { p: [0, 0.04, t], s: [1.2, 0.06, 0.2] });
  }
  // the broken hill at the end: the track climbs up, and the stuck train sits at the top
  const hill = d.anchor(47.5, 38.5, 0, 0);
  for (const sx of [-0.45, 0.45]) d.mesh(G.box, rail, hill, { p: [sx, 1.6, 0], s: [0.08, 0.08, 8.4], r: [0, 0, 0] });
  for (const z of [-3.6, -1.2, 1.2, 3.6]) for (const sx of [-0.55, 0.55]) d.mesh(G.cyl, mat(0x6a6a72, { metal: 0.6 }), hill, { p: [sx, 0.8, z], s: [0.08, 1.6, 0.08] });
  d.place.addBlock(46.8, 34.4, 48.2, 42.6, 1.7);
  d.train = new THREE.Group();
  hill.add(d.train);
  for (let k = 0; k < 3; k++) {
    const car = new THREE.Group();
    car.position.set(0, 1.7, -1.6 + k * 1.6);
    d.train.add(car);
    d.mesh(G.box, mat([0xc0262d, 0xffd23f, 0x2a6ad8][k], { rough: 0.35, metal: 0.25 }), car, { p: [0, 0.35, 0], s: [1.0, 0.5, 1.4], still: false });
    d.mesh(G.box, mat(0x1a1a1e), car, { p: [0, 0.62, 0], s: [0.85, 0.06, 1.0], still: false });
  }
  d.trainStart = d.train.position.clone();
  // the stations
  d.block(60.5, 5.5, 2.6, 2.4, 0.3, mat(0x5a3a6a, { rough: 0.5 }), { solid: false, nav: false });
  neon(d, 'START', 62.96, 5.5, 2.6, 1.6, 0.4, 'west', gold, pink);
  d.block(46, 31, 1.6, 3, 0.3, mat(0x5a3a6a, { rough: 0.5 }), { solid: false, nav: false });
  neon(d, 'END', 45.04, 31, 2.6, 1.2, 0.4, 'east', gold, pink);
  neon(d, 'SUSHI SLIDER', 55, 3.04, 3.5, 4, 0.6, 'south', cyan, gold);
  // the control booth, outside the track at the bottom
  d.target('booth', ...SPOTS.boothAt, 'north', 'Fix the roller coaster 🔧', (g) => {
    d.mesh(G.box, mat(0x3a4a5a, { metal: 0.4 }), g, { p: [0, 1.1, -0.2], s: [1.6, 2.2, 0.9] });
    d.mesh(G.box, lam(0x111111), g, { p: [0, 1.2, 0.26], s: [1.2, 0.6, 0.02] });
    d.boothLights = [0, 1, 2].map((k) => {
      const m = d.mesh(G.sphere, new THREE.MeshBasicMaterial({ color: 0x441010 }), g, { p: [-0.35 + k * 0.35, 1.65, 0.27], s: [0.08, 0.08, 0.04], still: false });
      return m;
    });
    d.mesh(G.box, mat(0xc0102a), g, { p: [0.45, 0.95, 0.3], s: [0.12, 0.25, 0.12] });
  });
  d.place.addBlock(50.2, 45.6, 51.8, 46.9, 2.2);
  // the ball pit and the play towers, inside the track
  for (const [x, z, w, dd] of [[53, 12, 8.2, 0.2], [53, 20.1, 8.2, 0.2], [48.9, 16, 0.2, 8], [57.1, 16, 0.2, 8]]) {
    if (x === 48.9) { d.block(x, 13.5, w, 3, 0.6, mat(0x2a4fa0)); d.block(x, 19, w, 2, 0.6, mat(0x2a4fa0)); }
    else d.block(x, z, w, dd, 0.6, mat(0x2a4fa0));
  }
  const pa = P(49.1, 12.2), pb = P(56.9, 19.9);
  d.place.slowZones.push({ x0: pa.x, z0: pa.z, x1: pb.x, z1: pb.z });
  d.balls(49.2, 12.3, 56.8, 19.8, 260);
  d.label('BALL PIT', 53, 11.85, 1.5, 1.6, 0.34, 'north', { bg: '#2a4fa0', fg: '#ffd23f', glow: '#ff3fa4' });
  const tower = mat(0x2a6a8a, { rough: 0.4 });
  for (const [x, z] of [[51, 26], [56, 26], [51, 31], [56, 31]]) d.block(x, z, 0.3, 0.3, 2.6, tower);
  d.block(53.5, 28.5, 5.6, 5.6, 0.15, mat(0xc0262d, { rough: 0.4 }), { y: 2.6, solid: false, nav: false });
  d.hideSpot('tube', 53.5, 28.5, 'east', { color: 0xff9a1f });
  d.hideSpot('toybox', 56.2, 38.6, 'west', { color: 0xa970ff });
  d.hideSpot('toybox', 46.2, 8.0, 'east', { color: 0xffd23f });
  d.savePoint(46.2, 22.5, 'east');
  for (const [x, z, c] of [[53, 8, 0xffc8e0], [53, 16, cyan], [53, 28, 0xffc8e0], [53, 38, pink], [61.8, 25, dusty], [56, 45.6, dusty]]) {
    d.lamp(x, z, 4.2, c, 0.9, { distance: 9, room: 'P', flicker: c === dusty });
  }
}
