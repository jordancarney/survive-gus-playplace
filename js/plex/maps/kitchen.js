// The Pizzaplex's kitchen, behind the Food Court. Jonathan's Chapter 34.
//
//   ┌──── Pizza Kitchen (the ovens) ────┐┌ Dish Pit ┐┌ Freezer ┐
//   │                                   │├───────── Pantry ─────┤
//   ┌ Staff Room ┐┌────────────── Loading Dock (the way out) ───┐
//
// Rooms: K Pizza Kitchen (you come in through its swinging doors), D Dish Pit, F Walk-in
// Freezer, P Pantry, S Staff Room, L Loading Dock (the roll-up door is the way out).
import * as T from '../../textures.js';
import { E, W, N, S, neon, G, lam, glowMat, mat, cloth } from './kit.js';

export const kitchenLayout = {
  w: 50, h: 36, wallH: 3.6, panels: false,
  wallColor: 0x1d1d22, headerColor: 0xff5a5f,
  ceiling: () => T.tiles('#4a4d55', '#3a3d44'),
  rooms: {
    K: { name: 'Pizza Kitchen', short: 'Kitchen', x0: 1, z0: 1, x1: 28, z1: 18,
         floor: () => T.tiles('#dfe6e9', '#b5c0c4'), wall: ['#e8f1f2', '#ff5a5f', '#2d6a73', 'panels'] },
    D: { name: 'Dish Pit', x0: 30, z0: 1, x1: 40, z1: 10,
         floor: () => T.tiles('#c8d0d4', '#9aa6ab'), wall: ['#d8e8ec', '#3a90c8', '#4a6a7a', 'panels'] },
    F: { name: 'Walk-in Freezer', short: 'Freezer', x0: 42, z0: 1, x1: 48, z1: 10,
         floor: () => T.tiles('#d8f0ff', '#a8c8e0'), wall: ['#d8f0ff', '#5ad1ff', '#8ab0c8', 'panels'] },
    P: { name: 'Pantry', x0: 30, z0: 12, x1: 48, z1: 18,
         floor: () => T.concrete(), wall: ['#8a6a42', '#ffd23f', '#5a4228', 'bricks'] },
    S: { name: 'Staff Room', short: 'Staff', x0: 1, z0: 20, x1: 14, z1: 34,
         floor: () => T.carpet('#2a3a4a'), wall: ['#4a5a6a', '#ffd23f', '#2a3440', 'stripes'] },
    L: { name: 'Loading Dock', short: 'Dock', x0: 16, z0: 20, x1: 48, z1: 34,
         floor: () => T.concrete(), wall: ['#3a3d44', '#f2c230', '#22242a', 'bricks'] },
  },
  doors: [
    { a: 'K', b: 'D', x0: 29, z0: 4, x1: 29, z1: 6 },
    { a: 'D', b: 'F', x0: 41, z0: 4, x1: 41, z1: 5 },
    { a: 'K', b: 'P', x0: 29, z0: 14, x1: 29, z1: 16 },
    { a: 'D', b: 'P', x0: 34, z0: 11, x1: 35, z1: 11 },
    { a: 'K', b: 'S', x0: 6, z0: 19, x1: 8, z1: 19 },
    { a: 'K', b: 'L', x0: 22, z0: 19, x1: 24, z1: 19 },
    { a: 'P', b: 'L', x0: 40, z0: 19, x1: 42, z1: 19 },
    { a: 'S', b: 'L', x0: 15, z0: 27, x1: 15, z1: 29 },
  ],
};

export function buildKitchen(d) {
  const P = d.place.P;
  const steel = mat(0xb8c0c8, { metal: 0.75, rough: 0.3 });

  // ── The Pizza Kitchen: a row of pizza ovens glowing orange, long steel prep tables
  for (const x of [5, 10, 15, 20, 25]) {
    d.block(x, 2.2, 3.6, 2.2, 2.4, mat(0x4a3a30, { rough: 0.7 }));
    const g = d.anchor(x, 3.31, 'south', 0);
    d.mesh(G.box, glowMat(0xff7a2a, 0.35), g, { p: [0, 1.0, 0], s: [1.6, 0.5, 0.02], shadow: false });
    d.mesh(G.box, steel, g, { p: [0, 1.6, 0.02], s: [2.2, 0.08, 0.06] });
  }
  neon(d, 'PIZZA KITCHEN', 15, 3.36 - 0.02, 3.0, 4.4, 0.6, 'south', 0xffd23f, 0xff5a5f);
  for (const z of [8, 13]) {
    for (const x of [7, 15, 23]) {
      d.block(x, z, 5, 1.2, 0.92, steel);
      const c = P(x - 1.2, z, 0.98);
      d.mesh(G.cyl, mat(0xffd27a, { rough: 0.7 }), d.group, { p: [c.x, c.y, c.z], s: [0.35, 0.03, 0.35] });   // a pizza waiting to go in
    }
  }
  // the swinging doors you came in through, from the Food Court
  for (const z of [8.5, 9.5]) {
    const g = d.anchor(1.06, z, 'east', 0);
    d.mesh(G.box, mat(0xc0262d, { rough: 0.5 }), g, { p: [0, 1.1, 0], s: [0.95, 2.0, 0.06] });
    d.mesh(G.cyl, glowMat(0xcfeeff, 0.2), g, { p: [0, 1.5, 0.04], s: [0.16, 0.01, 0.16], r: [Math.PI / 2, 0, 0], shadow: false });
  }
  neon(d, '← FOOD COURT', 1.04, 11.4, 2.6, 2.0, 0.32, 'east', 0xffd23f);
  d.hideSpot('counter', 27.4, 9.5, 'west', { color: 0xb8c0c8 });
  d.hideSpot('counter', 1.8, 16.4, 'east', { color: 0xb8c0c8 });
  for (const [x, z] of [[8, 5.5], [20, 5.5], [8, 16.5], [20, 16.5]]) d.lamp(x, z, 3.3, 0xfff8e8, 1.0, { distance: 9, room: 'K', flicker: x === 20 && z > 10 });
  d.savePoint(27.4, 2, 'west');

  // ── The Dish Pit: sinks, racks of plates, a strip curtain
  d.counter(35, 1.8, 9, 1.0, 1.0, 0xb8c0c8, 0xd8e0e8);
  for (const x of [32, 35, 38]) d.block(x, 8.6, 1.6, 0.6, 1.6, mat(0x9aa0a8, { metal: 0.5, rough: 0.4 }));
  d.hideSpot('curtain', 39.6, 7.6, 'west', { color: 0xbfe9ff });
  d.lamp(35, 5, 3.3, 0xd8f0ff, 0.9, { distance: 8, room: 'D' });

  // ── The Walk-in Freezer: cold blue light, frosty boxes on shelves
  d.shelf(48.5, 5.5, 0.8, 8, 2.4, 'west', { wood: 0xc8d8e8, books: false });
  for (let i = 0; i < 6; i++) {
    const c = P(48.0, 2.4 + i * 1.2, 1.2 + (i % 2) * 0.6);
    d.mesh(G.box, mat(0xe8f4ff, { rough: 0.8 }), d.group, { p: [c.x, c.y, c.z], s: [0.5, 0.4, 0.6] });
  }
  d.hideSpot('box', 43, 9.2, 'east', { color: 0xd8f0ff });
  d.lamp(45, 5, 3.3, 0x7ad8ff, 1.0, { distance: 8, room: 'F' });
  neon(d, 'FREEZER', 40.96, 5, 2.6, 1.6, 0.35, 'west', 0x5ad1ff);

  // ── The Pantry: shelves of cans and flour sacks
  for (const x of [33, 38, 43]) d.shelf(x, 15, 3.4, 0.8, 2.2, 'south', { wood: 0x6a4a2a, books: false });
  for (let i = 0; i < 9; i++) {
    const c = P(31.8 + i * 1.3, 14.6, 1.0 + (i % 3) * 0.5);
    d.mesh(G.cyl, mat([0xc0262d, 0xffd23f, 0x2f8f3a][i % 3], { rough: 0.5 }), d.group, { p: [c.x, c.y, c.z], s: [0.12, 0.2, 0.12] });
  }
  d.hideSpot('locker', 47.6, 17.6, 'west', { color: 0x8a6a42 });
  d.lamp(39, 15, 3.3, 0xffe2b0, 0.8, { distance: 9, room: 'P', flicker: true });
  d.savePoint(30.6, 12.6, 'east');

  // ── The Staff Room: lockers, a table, a vending machine, a couch
  for (let z = 21.5; z < 33; z += 1.0) {
    if (z > 26 && z < 30) continue;
    d.block(1.4, z, 0.6, 0.9, 2.0, mat(0x4a6ab8, { metal: 0.5, rough: 0.4 }));
  }
  d.hideSpot('locker', 1.5, 28, 'east', { color: 0x4a6ab8 });
  d.table(8, 26, 2.4, 1.2, 0.74, 0x8a5a32);
  d.block(12.8, 33.2, 1.2, 0.9, 1.9, mat(0xc0262d, { rough: 0.4 }));
  d.block(8, 33.4, 3, 0.9, 0.5, cloth(0x2a4a7a));
  d.lamp(8, 27, 3.3, 0xffe2b0, 0.9, { distance: 9, room: 'S' });
  d.savePoint(13.4, 21, 'west');

  // ── The Loading Dock: pallets, crates, a delivery truck backed up to the door
  for (const [x, z, s] of [[18, 22, 1.0], [19.2, 22, 0.8], [18.4, 23.2, 0.9], [44, 22, 1.0], [45.2, 22.8, 0.8], [27, 31, 0.9]]) d.crate(x, z, s, 0x8a6a42);
  d.block(42, 30.5, 5, 6, 2.8, mat(0xf4f1ea, { rough: 0.4 }));
  d.label("GUS'S PIZZA", 39.46, 30.5, 1.8, 4, 0.8, 'west', { bg: '#c0262d', fg: '#ffd23f', glow: '#ffd23f' });
  d.exitDoor(30, 34.4, 'north', { w: 3.0, label: 'OUT TO THE FOOD COURT' });
  d.hideSpot('box', 16.8, 33.2, 'east');
  d.hideSpot('box', 36, 21, 'south', { color: 0xa8805a });
  for (const x of [22, 34]) d.lamp(x, 27, 3.3, 0xffd8a0, 1.0, { distance: 11, room: 'L', flicker: x === 34 });
  d.savePoint(23, 33.6, 'north');
  d.spots.spawn = P(3, 9);
}

export { E, W, N, S };
