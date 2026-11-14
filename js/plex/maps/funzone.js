// The Fun Zone: the Pizzaplex's go-kart track and laser tag arena — Sparky's home. Jonathan's
// Chapter 11.
//
//   ┌ Entrance ┐┌──────── Sparky Speedway (the kart track) ────────┐┌ Snack Bar ┐
//   │ (the way ││   a loop round a grassy infield                   ││           │
//   │  out)    ││                                                   │├ Prize     ┤
//   └──────────┘└───────────────────────────────────────────────────┘│  Booth    │
//               ┌ Pit Garage ┐┌──────────── Laser Tag (a maze) ──────────────────┐
//
// Rooms: E Entrance, K Kart Track, B Snack Bar, P Prize Booth, G Pit Garage (Sparky's
// charger), L Laser Tag. The way out is the Entrance's north door, with P.A.L.'s kiosk by it
// (d.spots.kiosk).
import * as T from '../../textures.js';
import { E, W, N, S, neon, G, lam, glowMat, mat, cloth, THREE } from './kit.js';

export const funzoneLayout = {
  w: 70, h: 48, wallH: 6, panels: false,
  wallColor: 0x0e0a24, headerColor: 0xffd23f,
  ceiling: () => T.tiles('#1a1630', '#120e24'),
  walls: [
    { x0: 38, z0: 32, x1: 38, z1: 40 },
    { x0: 44, z0: 37, x1: 44, z1: 46 },
    { x0: 50, z0: 32, x1: 50, z1: 41 },
    { x0: 56, z0: 37, x1: 56, z1: 46 },
    { x0: 62, z0: 32, x1: 62, z1: 40 },
  ],
  rooms: {
    E: { name: 'Fun Zone Entrance', short: 'Entrance', x0: 1, z0: 1, x1: 12, z1: 14,
         floor: () => T.checker('#f2f0ea', '#1d1c24'), wall: ['#1b1440', '#ffd23f', '#0e0a24', 'stars'] },
    K: { name: 'Sparky Speedway', short: 'Kart Track', x0: 14, z0: 1, x1: 56, z1: 30,
         floor: () => T.concrete(), wall: ['#0e1a3a', '#2de2e6', '#0a1024', 'stripes'] },
    B: { name: 'Snack Bar', x0: 58, z0: 1, x1: 68, z1: 14,
         floor: () => T.checker('#f2f0ea', '#c0262d'), wall: ['#ffe9a0', '#ff5a5f', '#7a2a2a', 'stripes'] },
    P: { name: 'Prize Booth', short: 'Prizes', x0: 58, z0: 16, x1: 68, z1: 30,
         floor: () => T.carpet('#14304a'), wall: ['#ffd23f', '#ff3fa4', '#2a4fa0', 'stripes'] },
    G: { name: 'Pit Garage', short: 'Garage', x0: 14, z0: 32, x1: 30, z1: 46,
         floor: () => T.hazard(), wall: ['#3a3d44', '#ffd23f', '#22242a', 'bricks'] },
    L: { name: 'Laser Tag', x0: 32, z0: 32, x1: 68, z1: 46,
         floor: () => T.carpet('#0a0618'), wall: ['#0a0618', '#c040ff', '#05030c', 'stars'] },
  },
  doors: [
    { a: 'E', b: 'K', x0: 13, z0: 5, x1: 13, z1: 8 },
    { a: 'K', b: 'B', x0: 57, z0: 5, x1: 57, z1: 8 },
    { a: 'K', b: 'P', x0: 57, z0: 22, x1: 57, z1: 25 },
    { a: 'K', b: 'G', x0: 20, z0: 31, x1: 23, z1: 31 },
    { a: 'K', b: 'L', x0: 40, z0: 31, x1: 43, z1: 31 },
    { a: 'G', b: 'L', x0: 31, z0: 38, x1: 31, z1: 40 },
  ],
};

// A go-kart: a low body, four fat wheels, a seat, a number.
function kart(d, px, pz, yaw, color) {
  const g = d.anchor(px, pz, yaw, 0);
  d.mesh(G.box, mat(color, { rough: 0.3 }), g, { p: [0, 0.22, 0], s: [0.9, 0.18, 1.6] });
  d.mesh(G.box, lam(0x1a1a1a), g, { p: [0, 0.42, -0.2], s: [0.55, 0.3, 0.5] });
  for (const [x, z] of [[-0.5, 0.55], [0.5, 0.55], [-0.5, -0.55], [0.5, -0.55]]) {
    d.mesh(G.cyl, lam(0x111111), g, { p: [x, 0.16, z], s: [0.16, 0.14, 0.16], r: [0, 0, Math.PI / 2] });
  }
  d.mesh(G.cyl, lam(0x2a2a30), g, { p: [0, 0.6, 0.35], s: [0.15, 0.03, 0.15], r: [0.6, 0, 0] });
  d.place.addBlock(px - 0.6, pz - 0.6, px + 0.6, pz + 0.6, 0.5, { margin: 0.1 });
}

// A stack of three old tyres.
function tyres(d, px, pz) {
  for (let i = 0; i < 3; i++) {
    const c = d.place.P(px, pz, 0.12 + i * 0.22);
    d.mesh(G.cyl, lam(0x161616), d.group, { p: [c.x, c.y, c.z], s: [0.42, 0.2, 0.42] });
  }
  d.place.addBlock(px - 0.45, pz - 0.45, px + 0.45, pz + 0.45, 0.7, { margin: 0.1 });
}

export function buildFunZone(d) {
  const P = d.place.P;
  const pink = 0xff3fa4, cyan = 0x2de2e6, gold = 0xffd23f, purple = 0xc040ff, blue = 0x3a6ad8;

  // ── The Entrance: the turnstiles, the arch, the way back out
  neon(d, 'FUN ZONE', 6.5, 14.96, 3.6, 5, 1.2, 'north', gold, pink);
  for (const x of [4, 6.5, 9]) d.block(x, 11, 0.25, 0.9, 1.0, mat(0xc0c0c8, { metal: 0.7, rough: 0.3 }));
  d.exitDoor(6.5, 1.6, 'south', { w: 2.2, label: 'TO THE MAIN FLOOR' });
  d.spots.kiosk = [9.6, 2.2];
  d.hideSpot('box', 1.8, 8, 'east', { color: 0x3a6ad8 });
  d.lamp(6.5, 7, 5.6, 0xfff0c8, 1.3, { distance: 11, room: 'E' });
  d.savePoint(11.6, 13.4, 'west');

  // ── Sparky Speedway: the track loops round a grassy infield with a low wall round it
  d.block(35, 15.5, 20, 9, 0.9, mat(0xd8d0c0, { rough: 0.5 }));
  d.patch(35, 15.5, 19.6, 8.6, 0x2f7a3a, { y: 0.92 });
  neon(d, 'SPARKY\nSPEEDWAY', 35, 10.96, 1.7, 5, 1.4, 'north', cyan, blue);
  // the start line: a checkered strip across the south straight
  for (let i = 0; i < 10; i++) for (let k = 0; k < 2; k++) {
    d.patch(30 + k * 0.5, 21.2 + i * 1.0, 0.5, 1.0, (i + k) % 2 ? 0xffffff : 0x111111, { y: 0.014 });
  }
  for (const [x, z] of [[15.2, 1.8], [15.2, 29.6], [55.6, 1.8], [55.6, 29.6], [25, 10], [45, 10], [25, 21], [45, 21]]) tyres(d, x, z);
  kart(d, 18, 15, 0, 0xff3b30, 3);
  kart(d, 50, 6, Math.PI / 2, 0xffd23f, 7);
  // red and white kerbs along the infield
  for (let x = 26; x < 45; x += 1) d.patch(x, 10.8, 1, 0.3, x % 2 ? 0xff3b30 : 0xffffff, { y: 0.013 });
  for (let x = 26; x < 45; x += 1) d.patch(x, 20.2, 1, 0.3, x % 2 ? 0xff3b30 : 0xffffff, { y: 0.013 });
  d.hideSpot('tube', 35, 29.4, 'north', { color: 0x3ec1d3 });
  d.hideSpot('box', 55.4, 15.5, 'west', { color: 0x2a4fa0 });
  for (const [x, z] of [[20, 6], [35, 4], [50, 6], [20, 25], [50, 25], [35, 27]]) d.lamp(x, z, 5.6, x === 35 ? cyan : 0xd8e0ff, 1.7, { distance: 16, room: 'K', flicker: x === 50 && z === 25 });

  // ── The Snack Bar
  d.counter(66.5, 7.5, 1.2, 10, 1.05, 0xc0262d, 0xf4f1ea);
  for (let z = 4; z < 12; z += 2) d.chair(64.6, z, 0xffd23f, 0.95);
  neon(d, 'SNACKS', 68.96, 7.5, 3.4, 3.6, 0.9, 'west', gold, 0xff5a5f);
  d.hideSpot('counter', 59.4, 13.2, 'east', { color: 0xc0262d });
  d.lamp(63, 7.5, 5.6, 0xffe2b0, 1.0, { distance: 10, room: 'B' });

  // ── The Prize Booth
  d.counter(63, 28.6, 9, 1.0, 1.05, 0x2a4fa0, 0xbfe9ff);
  for (let i = 0; i < 12; i++) {
    const c = P(59.2 + i * 0.75, 29.8, 1.3 + (i % 2) * 0.4);
    d.mesh(G.sphere, cloth([0xff3b30, 0x3ec1d3, 0x7ad151, 0xa970ff][i % 4]), d.group, { p: [c.x, c.y, c.z], s: [0.18, 0.22, 0.16] });
  }
  neon(d, 'PRIZES', 68.96, 22, 3.4, 3.4, 0.9, 'west', gold, pink);
  d.hideSpot('box', 67.4, 17.2, 'west', { color: 0xa8805a });
  d.lamp(63, 22, 5.6, 0xfff0c0, 1.0, { distance: 10, room: 'P' });
  d.savePoint(58.6, 17, 'east');

  // ── The Pit Garage: karts lined up, tools, Sparky's charger
  kart(d, 17, 36, 0, 0x3a6ad8, 1);
  kart(d, 17, 40, 0, 0x7ad151, 2);
  d.patch(26, 44.6, 2.4, 1.6, 0x2de2e6, { glow: 0.2 });
  d.block(26, 45.8, 1.6, 0.5, 2.4, mat(0x9aa4b0, { metal: 0.5, rough: 0.4 }));
  neon(d, "SPARKY'S CHARGER", 26, 46.96, 2.8, 2.8, 0.45, 'north', cyan, blue);
  d.shelf(29.6, 35, 0.8, 4, 2.2, 'west', { wood: 0x4a4d55, books: false });
  d.hideSpot('locker', 14.6, 45.4, 'east', { color: 0x3a6ad8 });
  d.lamp(22, 39, 5.6, 0xffd8a0, 0.9, { distance: 11, room: 'G', flicker: true });
  d.savePoint(28.6, 32.8, 'south');

  // ── Laser Tag: black-light dark, glowing stripes, a maze of walls
  for (let i = 0; i < 12; i++) {
    const x = 33 + i * 3;
    d.patch(x, 46.6, 1.4, 0.5, [pink, cyan, purple, 0x7cff6b][i % 4], { glow: 0.25, y: 0.015 });
  }
  neon(d, 'LASER TAG', 50, 46.96, 3.4, 5, 1.0, 'north', 0x7cff6b, purple);
  d.hideSpot('curtain', 33, 45.4, 'north', { color: 0x2a0a3a });
  d.hideSpot('curtain', 67.2, 33.2, 'west', { color: 0x2a0a3a });
  d.hideSpot('tube', 53, 44.6, 'north', { color: 0xc040ff });
  for (const [x, z, c] of [[41, 35, purple], [47, 43, cyan], [59, 35, pink], [65, 43, purple]]) d.lamp(x, z, 3.0, c, 0.6, { distance: 8, room: 'L' });
  d.savePoint(67.6, 45.2, 'west');
}

export { E, W, N, S };
