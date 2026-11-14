// Upstairs at the Pizzaplex: the party rooms along the top, and the Sleepover Wing — with
// the Sleepover Suite, where Max has been holding out all night. Jonathan's Chapters 16 (The
// Sleepover Suite) and 28 (Up the Stairs).
//
//   ┌ Party Room 1 ┐┌ Party Room 2 ┐┌ Party Room 3 ┐
//   Stairs ──────── Upstairs Hall ──────────────────
//   Landing ┌ Sleepover Wing ┐┌ Bathrooms ┐┌ Pajama Shop ┐
//           │ Sleepover Suite││ Laundry (the roof hatch)  │
//
// Rooms: S Stairs Landing (the way down), H Upstairs Hall, A/B/C Party Rooms 1–3, W Sleepover
// Wing, Q Sleepover Suite (behind a locked door, d.suiteDoor), T Bathrooms, K Pajama Shop,
// L Laundry. d.spots: max (where Max is in the Suite), hatch (the roof hatch's ladder).
import * as T from '../../textures.js';
import { E, W, N, S, neon, lockedDoor, G, lam, glowMat, mat, cloth } from './kit.js';

export const upstairsLayout = {
  w: 60, h: 44, wallH: 3.4, panels: false,
  wallColor: 0x1a1430, headerColor: 0xffd23f,
  ceiling: () => T.tiles('#2a2448', '#1d1834'),
  rooms: {
    S: { name: 'Stairs Landing', short: 'Stairs', x0: 1, z0: 8, x1: 10, z1: 20,
         floor: () => T.carpet('#2a1450'), wall: ['#2a1450', '#ffd23f', '#1a0a30', 'stars'] },
    H: { name: 'Upstairs Hall', short: 'Hall', x0: 12, z0: 12, x1: 58, z1: 16,
         floor: () => T.carpet('#3a1450'), wall: ['#3a1a5a', '#ff3fa4', '#1d1024', 'stars'] },
    A: { name: 'Party Room 1', short: 'Party 1', x0: 12, z0: 1, x1: 25, z1: 10,
         floor: () => T.carpet('#7a2a3a'), wall: ['#ff9ab8', '#ffd23f', '#7a2a8a', 'bubbles'] },
    B: { name: 'Party Room 2', short: 'Party 2', x0: 27, z0: 1, x1: 40, z1: 10,
         floor: () => T.carpet('#14304a'), wall: ['#bfe9ff', '#ffd23f', '#2a4fa0', 'bubbles'] },
    C: { name: 'Party Room 3', short: 'Party 3', x0: 42, z0: 1, x1: 58, z1: 10,
         floor: () => T.carpet('#1f4a2a'), wall: ['#b8f2a0', '#ff3fa4', '#2f7a3a', 'bubbles'] },
    W: { name: 'Sleepover Wing', short: 'Wing', x0: 12, z0: 18, x1: 30, z1: 29,
         floor: () => T.carpet('#1a2448'), wall: ['#1a2448', '#ffd23f', '#101830', 'stars'] },
    Q: { name: 'Sleepover Suite', short: 'Suite', x0: 12, z0: 31, x1: 30, z1: 42,
         floor: () => T.carpet('#1a2448'), wall: ['#1a2448', '#ffd23f', '#101830', 'stars'] },
    T: { name: 'Bathrooms', x0: 32, z0: 18, x1: 42, z1: 29,
         floor: () => T.tiles('#e8f4f8', '#b8d0d8'), wall: ['#bfe9ff', '#ffffff', '#7fb8d8', 'panels'] },
    K: { name: 'Pajama Shop', short: 'PJ Shop', x0: 44, z0: 18, x1: 58, z1: 29,
         floor: () => T.checker('#f2f0ea', '#7a3ab8'), wall: ['#c98aff', '#ffd23f', '#5b2a86', 'stripes'] },
    L: { name: 'Laundry', x0: 32, z0: 31, x1: 58, z1: 42,
         floor: () => T.tiles('#8e9aa0', '#6c777c'), wall: ['#5a6670', '#7cff6b', '#2c3238', 'panels'] },
  },
  doors: [
    { a: 'S', b: 'H', x0: 11, z0: 13, x1: 11, z1: 15 },
    { a: 'H', b: 'A', x0: 18, z0: 11, x1: 19, z1: 11 },
    { a: 'H', b: 'B', x0: 33, z0: 11, x1: 34, z1: 11 },
    { a: 'H', b: 'C', x0: 49, z0: 11, x1: 50, z1: 11 },
    { a: 'H', b: 'W', x0: 20, z0: 17, x1: 22, z1: 17 },
    { a: 'H', b: 'T', x0: 37, z0: 17, x1: 38, z1: 17 },
    { a: 'H', b: 'K', x0: 50, z0: 17, x1: 51, z1: 17 },
    { a: 'W', b: 'T', x0: 31, z0: 22, x1: 31, z1: 24 },
    { a: 'W', b: 'Q', x0: 20, z0: 30, x1: 22, z1: 30 },
    { a: 'T', b: 'L', x0: 36, z0: 30, x1: 37, z1: 30 },
    { a: 'K', b: 'L', x0: 52, z0: 30, x1: 53, z1: 30 },
  ],
};

// A party table: a cloth, plates, party hats, and balloons tied to the chairs.
function partyTable(d, px, pz, color) {
  d.table(px, pz, 2.4, 1.2, 0.72, color, { legs: 0xc0c0c0 });
  const hats = [0xff3fa4, 0x2de2e6, 0xffd23f, 0x7ad151];
  for (let i = 0; i < 4; i++) {
    const c = d.place.P(px - 0.9 + i * 0.6, pz + (i % 2 ? 0.3 : -0.3), 0.86);
    d.mesh(G.cone, lam(hats[i]), d.group, { p: [c.x, c.y, c.z], s: [0.07, 0.2, 0.07] });
  }
  for (const sx of [-1, 1]) {
    const c = d.place.P(px + sx * 1.4, pz, 2.2);
    d.mesh(G.sphere, mat(hats[(sx + 1) % 4], { rough: 0.25 }), d.group, { p: [c.x, c.y, c.z], s: [0.25, 0.3, 0.25] });
    const s = d.place.P(px + sx * 1.4, pz, 1.4);
    d.mesh(G.cyl, lam(0xf4f1ea), d.group, { p: [s.x, s.y, s.z], s: [0.004, 1.5, 0.004] });
  }
}

export function buildUpstairs(d, { suiteLocked = false } = {}) {
  const P = d.place.P;
  const pink = 0xff3fa4, gold = 0xffd23f, cyan = 0x2de2e6;

  // ── The Stairs Landing: the way back down
  for (let i = 0; i < 6; i++) d.block(3.2, 9.4 + i * 0.4, 3.6, 0.4, 0.1 + i * 0.06, lam(0x3a2050), { solid: false, nav: false });
  d.exitDoor(1.6, 15.5, 'east', { w: 2.2, label: 'STAIRS DOWN' });
  neon(d, 'STAIRS ↓', 1.04, 15.5, 2.85, 1.8, 0.35, 'east', gold, pink);
  d.window(6, 20.96, 1.8, 3, 1.2, 'north');
  d.hideSpot('curtain', 9.4, 19.4, 'north', { color: 0x5b2a86 });
  d.lamp(6, 14, 3.1, 0xffd8a0, 1.0, { distance: 9, room: 'S', flicker: true });
  d.savePoint(9.6, 9, 'west');

  // ── The Upstairs Hall
  for (const x of [16, 28, 40, 52]) d.lamp(x, 14, 3.1, 0xffc8e0, 0.8, { distance: 9, room: 'H', flicker: x === 40 });
  d.label('PARTY ROOMS ↑', 26, 16.96, 2.5, 2.4, 0.32, 'north', { bg: '#3a1a5a', fg: '#ffd23f', glow: '#ff3fa4' });
  d.label('SLEEPOVER WING ↓', 21, 12.04, 2.5, 2.8, 0.32, 'south', { bg: '#1a2448', fg: '#ffd23f', glow: '#ffd23f' });
  for (const x of [14, 30, 45, 56]) {
    const c = P(x, 12.4, 2.6);
    d.mesh(G.sphere, mat([pink, cyan, gold, 0x7ad151][x % 4], { rough: 0.25 }), d.group, { p: [c.x, c.y, c.z], s: [0.28, 0.34, 0.28] });
  }
  d.savePoint(44, 16.4, 'north');

  // ── The party rooms: tables set for parties that never happened
  partyTable(d, 18, 5, 0xff9ab8);
  partyTable(d, 33, 5, 0xbfe9ff);
  partyTable(d, 47, 5, 0xb8f2a0);
  partyTable(d, 54, 5, 0xffd23f);
  neon(d, 'PARTY ROOM 1', 18.5, 1.04, 2.5, 2.6, 0.4, 'south', gold, pink);
  neon(d, 'PARTY ROOM 2', 33.5, 1.04, 2.5, 2.6, 0.4, 'south', gold, cyan);
  neon(d, 'PARTY ROOM 3', 50, 1.04, 2.5, 2.6, 0.4, 'south', gold, 0x7ad151);
  const cake = P(23.6, 2.2, 0);
  d.mesh(G.cyl, mat(0xff9ab8, { rough: 0.5 }), d.group, { p: [cake.x, 0.45, cake.z], s: [0.5, 0.9, 0.5] });
  d.place.addBlock(23.1, 1.7, 24.1, 2.7, 1.0, { margin: 0.1 });
  d.hideSpot('toybox', 12.8, 9.2, 'east', { color: 0xff3fa4 });
  d.hideSpot('curtain', 39.4, 2.2, 'west', { color: 0x2a4fa0 });
  d.hideSpot('toybox', 57.4, 9.2, 'west', { color: 0x2f8f3a });
  d.lamp(18, 5, 3.1, 0xffb0c8, 0.9, { distance: 9, room: 'A' });
  d.lamp(33, 5, 3.1, 0xb0d8ff, 0.9, { distance: 9, room: 'B', flicker: true });
  d.lamp(50, 5, 3.1, 0xc0ffb0, 0.9, { distance: 10, room: 'C' });

  // ── The Sleepover Wing: cubbies, sleeping bags, and the Suite's door
  for (let x = 13.5; x < 30; x += 2.4) {
    if (x > 18.5 && x < 24.5) continue;       // (the doorway from the hall)
    d.block(x, 18.4, 1.8, 0.6, 1.2, lam(0x2a4fa0));
    const c = P(x, 18.75, 0.9);
    d.mesh(G.box, cloth([0xc0262d, 0x7a3ab8, 0x2f8f5a, 0xffd23f][Math.floor(x) % 4]), d.group, { p: [c.x, c.y, c.z], s: [0.5, 0.35, 0.1] });
  }
  for (const [x, z, r] of [[15, 25, 0.4], [26, 26, -0.6]]) {
    const c = P(x, z, 0.07);
    d.mesh(G.box, cloth(0x3a6ab8), d.group, { p: [c.x, c.y, c.z], s: [0.85, 0.14, 1.8], r: [0, r, 0] });
  }
  d.suiteDoor = lockedDoor(d, 20, 30, 22, 30, { color: 0x7a3ab8, label: 'SLEEPOVER SUITE' });
  if (!suiteLocked) d.suiteDoor.set(false);
  d.hideSpot('tube', 29.4, 27, 'west', { color: 0x3ec1d3 });
  d.lamp(21, 24, 3.1, 0x5a6ab8, 0.8, { distance: 10, room: 'W' });

  // ── The Sleepover Suite: bunk beds, and Max
  for (const z of [33, 36, 39.5]) {
    for (const [x, f] of [[13, 'east'], [29.2, 'west']]) d.bed(x, z, f, [0x3a6ab8, 0xc0262d, 0x2f8f5a, 0xffd23f][Math.floor(z) % 4], { len: 1.8, wid: 0.9 });
  }
  d.rug(21, 37, 5, 3.4, '#2a4fa0', '#ffd23f');
  d.spots.max = [21, 38.4];
  d.lamp(21, 36, 3.0, 0x5a6ab8, 0.9, { distance: 10, room: 'Q' });

  // ── The Bathrooms
  for (let k = 0; k < 4; k++) d.block(33.8 + k * 1.8, 20.2, 0.06, 2.2, 1.9, lam(0xff9ab8));
  for (const x of [33.4, 39.8, 41.4]) d.block(x, 28.6, 0.6, 0.5, 0.85, mat(0xf4f6f8, { rough: 0.2 }));
  d.hideSpot('curtain', 41.4, 24, 'west', { color: 0x7fd0f0 });
  d.lamp(37, 24, 3.1, 0xcfe8ff, 1.0, { distance: 9, room: 'T', flicker: true });

  // ── The Pajama Shop
  d.counter(51, 27.8, 6, 0.9, 1.0, 0x7a3ab8, 0xe8e0d0);
  for (const z of [21, 24]) d.shelf(47, z, 4, 0.7, 1.6, 'south', { wood: 0x5b2a86, books: false });
  for (let i = 0; i < 8; i++) {
    const c = P(45.6 + (i % 4) * 0.9, 21.4 + Math.floor(i / 4) * 3, 1.0);
    d.mesh(G.box, cloth([0x3a6ab8, 0xff7eb6, 0x7ad151, 0xffd23f][i % 4]), d.group, { p: [c.x, c.y, c.z], s: [0.5, 0.6, 0.08] });
  }
  neon(d, 'PJ SHOP', 58.96, 23.5, 2.5, 2.4, 0.5, 'west', gold, 0xc040ff);
  d.hideSpot('box', 57.4, 19.2, 'west', { color: 0xa8805a });
  d.lamp(51, 23.5, 3.1, 0xffe2f0, 0.9, { distance: 9, room: 'K' });
  d.savePoint(44.6, 28.6, 'east');

  // ── The Laundry: washers, dryers, carts — and the ladder up to the roof hatch
  for (let x = 34; x < 50; x += 1.6) {
    d.block(x, 41.6, 1.2, 0.9, 1.0, mat(0xe8ecf2, { rough: 0.3 }));
    const c = P(x, 41.13, 0.55);
    d.mesh(G.cyl, mat(0x2a3a5a, { metal: 0.5, rough: 0.2 }), d.group, { p: [c.x, c.y, c.z], s: [0.32, 0.02, 0.32], r: [Math.PI / 2, 0, 0], shadow: false });
  }
  for (const [x, z] of [[40, 35], [46, 37]]) d.block(x, z, 1.0, 0.7, 0.8, mat(0x9aa0a8, { metal: 0.5, rough: 0.4 }));
  const steel = mat(0x9aa0a8, { metal: 0.6, rough: 0.35 });
  d.block(57.6, 36, 0.12, 0.6, 3.4, steel, { solid: false, nav: false });
  for (let k = 0; k < 8; k++) d.block(57.6, 36, 0.14, 0.6, 0.04, steel, { y: 0.3 + k * 0.38, solid: false, nav: false });
  neon(d, 'ROOF HATCH ↑', 58.96, 36, 2.6, 2.2, 0.35, 'west', 0x7cff6b);
  d.spots.hatch = [57.2, 36];
  d.hideSpot('box', 33, 32, 'east', { color: 0xa8805a });
  d.hideSpot('locker', 57.6, 41.4, 'west', { color: 0x5a6670 });
  d.lamp(45, 36, 3.1, 0xd8f0ff, 1.0, { distance: 11, room: 'L', flicker: true });
  d.savePoint(32.6, 39, 'east');
}

export { E, W, N, S };
