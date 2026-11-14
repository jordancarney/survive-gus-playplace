// The Main Entrance of Gus's Pizzaplex: the front doors, where everyone has to be at 6 AM.
// Jonathan's Chapter 46 (The Main Entrance), and Chapter 50 (The Great Escape).
//
//   ┌ Gift Shop ┐┌──────── Entry Hall ─────────┐┌ Ticket Booths ┐
//   │           ││  FRONT DOORS (north wall)    ││               │
//   │           ││  turnstiles · the big Gus    ││               │
//   │           ││  statue on its plinth        ││               │
//   ├ Security  ┤├──────── Main Hall ──────────┤├ Coat Check    ┤
//   │ Desk      ││  (back toward the Atrium)    ││               │
//
// ROOMS (plan cells, inclusive):
//   E Entry Hall     x16–47 z1–24   the front doors are in the middle of its north wall
//   G Gift Shop      x1–14  z1–24   door to E at x15 z10–14, to S at z25 x6–8
//   T Ticket Booths  x49–62 z1–24   door to E at x48 z10–14, to C at z25 x54–56
//   H Main Hall      x16–47 z26–44  door to E at z25 x28–35 (wide)
//   S Security Desk  x1–14  z26–44  door to H at x15 z34–36 (the radio's here)
//   C Coat Check     x49–62 z26–44  door to H at x48 z34–36
//
// API:
//   lobbyLayout              the floor plan, for `layout:` in a chapter
//   buildLobby(d)            everything in it. Doesn't place the exit: a chapter does that
//                            with d.exitDoor(...LOBBY_SPOTS.frontDoors, 'south', { w: 4.4, label })
//                            (the front doors) — or nothing, if it ends another way.
//   LOBBY_SPOTS              plan [x, z] spots: spawn (Main Hall, facing north toward the
//                            doors: yaw 0), frontDoors (the floor just inside the doors),
//                            radio (the Security Desk radio — make it a target facing 'east'),
//                            statue (the big Gus's plinth — stand a Watcher on it: [x, z]),
//                            statueArea (the plinth's [x0, z0, x1, z1], a Watcher's `area`),
//                            beacons (three big lamps: Gift Shop, Ticket Booths, Entry Hall),
//                            beaconSwitches (where each beacon's switch is, target facing 'south').
//   After buildLobby(d):
//     d.beacons[i]           the three lamps (entries from d.lamp), dark until switched on:
//                            set .off = false then call lighting.apply()
//     d.setShutters(open)    P.A.L.'s steel shutters over the front doors (down to start)
//     d.lobbyClock           a big wall clock: d.lobbyClock.set(minutesAfterMidnight)
import * as T from '../../textures.js';
import { E, W, N, S, neon, G, lam, glowMat, mat, cloth, THREE } from './kit.js';

export const lobbyLayout = {
  w: 64, h: 46, wallH: 6, panels: false,
  wallColor: 0x14102a, headerColor: 0xffd23f,
  ceiling: () => T.tiles('#2a2036', '#1d1626'),
  rooms: {
    E: { name: 'Entry Hall', x0: 16, z0: 1, x1: 47, z1: 24,
         floor: () => T.checker('#f2f0ea', '#3a2a5a'), wall: ['#1b1440', '#ffd23f', '#0e0a24', 'stars'] },
    G: { name: 'Gift Shop', x0: 1, z0: 1, x1: 14, z1: 24,
         floor: () => T.carpet('#3a1450'), wall: ['#5b2a86', '#ffd23f', '#2a1440', 'stars'] },
    T: { name: 'Ticket Booths', short: 'Tickets', x0: 49, z0: 1, x1: 62, z1: 24,
         floor: () => T.checker('#f2f0ea', '#c0262d'), wall: ['#ffe9a0', '#ff5a5f', '#7a2a2a', 'stripes'] },
    H: { name: 'Main Hall', x0: 16, z0: 26, x1: 47, z1: 44,
         floor: () => T.checker('#1d1c24', '#3a2a5a'), wall: ['#1b1440', '#ff3fa4', '#0e0a24', 'stars'] },
    S: { name: 'Security Desk', short: 'Security', x0: 1, z0: 26, x1: 14, z1: 44,
         floor: () => T.tiles('#8e9aa0', '#6c777c'), wall: ['#4a3a6a', '#ffd23f', '#2a2040', 'panels'] },
    C: { name: 'Coat Check', short: 'Coats', x0: 49, z0: 26, x1: 62, z1: 44,
         floor: () => T.carpet('#14304a'), wall: ['#2a4fa0', '#ffd23f', '#14304a', 'stripes'] },
  },
  doors: [
    { a: 'E', b: 'G', x0: 15, z0: 10, x1: 15, z1: 14 },
    { a: 'E', b: 'T', x0: 48, z0: 10, x1: 48, z1: 14 },
    { a: 'E', b: 'H', x0: 28, z0: 25, x1: 35, z1: 25 },
    { a: 'G', b: 'S', x0: 6, z0: 25, x1: 8, z1: 25 },
    { a: 'T', b: 'C', x0: 54, z0: 25, x1: 56, z1: 25 },
    { a: 'H', b: 'S', x0: 15, z0: 34, x1: 15, z1: 36 },
    { a: 'H', b: 'C', x0: 48, z0: 34, x1: 48, z1: 36 },
  ],
};

export const LOBBY_SPOTS = {
  spawn: [32, 41],
  frontDoors: [32, 1.7],
  radio: [3.2, 31],
  statue: [32, 14],
  statueArea: [30.4, 12.4, 33.6, 15.6],
  beacons: [[7.5, 12], [55.5, 12], [32, 20]],
  beaconSwitches: [[4, 2.2], [59, 2.2], [24, 23.4]],
};

// A big round wall clock: the hour and minute hands are real, so a chapter can set the time.
function wallClock(d, px, pz, facing, y) {
  const g = d.anchor(px, pz, facing, y);
  d.mesh(G.cyl, glowMat(0xf4f1ea, 0.25), g, { p: [0, 0, 0.02], s: [0.8, 0.04, 0.8], r: [Math.PI / 2, 0, 0], shadow: false });
  d.mesh(G.torus, mat(0xffd23f, { metal: 0.6, rough: 0.3 }), g, { p: [0, 0, 0.04], s: [0.82, 0.82, 0.4], shadow: false });
  const hand = (len, w) => {
    const pivot = new THREE.Group();
    pivot.position.set(0, 0, 0.08);
    g.add(pivot);
    d.mesh(G.box, lam(0x111111), pivot, { p: [0, len / 2, 0], s: [w, len, 0.02], still: false, shadow: false });
    return pivot;
  };
  const hour = hand(0.42, 0.06), minute = hand(0.66, 0.04);
  return {
    set(mins) {
      minute.rotation.z = -(mins % 60) / 60 * Math.PI * 2;
      hour.rotation.z = -((mins / 60) % 12) / 12 * Math.PI * 2;
    },
  };
}

export function buildLobby(d) {
  const P = d.place.P;
  const pink = 0xff3fa4, cyan = 0x2de2e6, gold = 0xffd23f, purple = 0xc040ff;

  // ── The Entry Hall: the front doors, glass from floor to ceiling, and P.A.L.'s shutters
  const glass = glowMat(0x1a2a4a, 0.3);
  for (let x = 18; x <= 46; x += 4) {
    if (x > 28 && x < 36) continue;
    const g = d.anchor(x, 1.04, 'south', 3.0);
    d.mesh(G.plane, glass, g, { s: [3.6, 5.2, 1], shadow: false });
  }
  // the front doors themselves: two pairs of glass doors in a gold frame
  const door = d.anchor(32, 1.04, 'south', 0);
  d.mesh(G.box, mat(gold, { metal: 0.6, rough: 0.3 }), door, { p: [0, 3.0, 0.03], s: [6.4, 0.25, 0.1] });
  for (const x of [-3.1, 3.1]) d.mesh(G.box, mat(gold, { metal: 0.6, rough: 0.3 }), door, { p: [x, 1.5, 0.03], s: [0.2, 3.0, 0.1] });
  neon(d, "GUS'S PIZZAPLEX", 32, 1.06, 4.3, 9, 1.1, 'south', gold, pink);
  neon(d, 'FRONT DOORS', 32, 1.06, 3.4, 3.4, 0.4, 'south', 0xffffff, cyan);
  // P.A.L.'s steel shutters: down all night
  const shutter = d.mesh(G.box, mat(0x6a7078, { metal: 0.6, rough: 0.4 }), door, { p: [0, 1.5, 0.25], s: [6.2, 3.0, 0.08], still: false });
  const slats = [];
  for (let k = 0; k < 8; k++) slats.push(d.mesh(G.box, lam(0x4a4e58), door, { p: [0, 0.2 + k * 0.37, 0.3], s: [6.2, 0.04, 0.02], still: false }));
  d.setShutters = (open) => {
    shutter.position.y = open ? 4.5 : 1.5;
    slats.forEach((s, k) => { s.position.y = (open ? 3.2 : 0.2) + k * 0.37; });
  };
  d.setShutters(false);
  // the turnstiles, the big Gus statue, the welcome banner, the info desk
  for (const x of [22, 25, 28, 36, 39, 42]) d.block(x, 6, 0.3, 1.1, 1.0, mat(0xc0c0c8, { metal: 0.7, rough: 0.3 }));
  d.block(32, 14, 3.2, 3.2, 0.5, mat(0xd8d0c0, { rough: 0.4 }), { solid: false, nav: false });
  const pa = P(30.4, 12.4), pb = P(33.6, 15.6);
  d.place.raised.push({ x0: pa.x, z0: pa.z, x1: pb.x, z1: pb.z, h: 0.5 });
  d.label('WELCOME TO\nGUS\'S PIZZAPLEX!', 32, 24.96, 4.4, 8, 1.5, 'north', { bg: '#1b1440', fg: '#ffd23f', glow: '#ff3fa4' });
  d.counter(43, 19, 4, 1.2, 1.05, 0x5b2a86, 0xe8e0d0);
  neon(d, 'INFO', 43, 18.36, 1.6, 1.0, 0.3, 'south', gold);
  for (const [x, z] of [[20, 10], [44, 10], [20, 20]]) d.block(x, z, 0.9, 0.9, 6, mat(0x2a2040, { rough: 0.4 }));
  d.lobbyClock = wallClock(d, 47.96, 8, 'west', 3.6);
  d.lobbyClock.set(5 * 60 + 10);
  d.hideSpot('curtain', 16.8, 23.2, 'east', { color: 0xb0102a });
  d.hideSpot('tube', 46.4, 22.4, 'west', { color: 0x3ec1d3 });
  d.hideSpot('counter', 39.6, 19.6, 'west', { color: 0x5b2a86 });
  for (const [x, z, c] of [[24, 8, 0x9f7fff], [40, 8, 0x9f7fff], [24, 18, pink], [40, 18, cyan]]) d.lamp(x, z, 5.6, c, 1.0, { distance: 12, room: 'E', flicker: x === 40 && z === 18 });
  d.savePoint(17, 3, 'east');
  d.savePoint(46.6, 3, 'west');

  // ── The Gift Shop: plushies everywhere, and a giant one
  for (const z of [5, 9, 17, 21]) d.shelf(6, z, 7, 0.8, 1.6, 'south', { wood: 0x5b2a86, books: false });
  for (let i = 0; i < 16; i++) {
    const c = P(3 + (i % 8) * 0.85, [5.45, 9.45, 17.45, 21.45][Math.floor(i / 4)], 1.75);
    d.mesh(G.sphere, mat([0x7a4a26, 0x8a8a92, 0x3a6ad8, 0xa8642e][i % 4], { rough: 0.6 }), d.group, { p: [c.x, c.y, c.z], s: [0.18, 0.22, 0.16] });
  }
  const big = P(12.6, 13, 0);
  d.mesh(G.sphere, mat(0x7a4a26, { rough: 0.7 }), d.group, { p: [big.x, 0.8, big.z], s: [0.8, 0.9, 0.7] });
  d.mesh(G.sphere, mat(0x7a4a26, { rough: 0.7 }), d.group, { p: [big.x, 1.9, big.z], s: [0.55, 0.55, 0.55] });
  d.place.addBlock(11.8, 12.2, 13.4, 13.8, 2.4);
  neon(d, 'GIFT SHOP', 7.5, 1.04, 3.6, 4, 0.8, 'south', gold, purple);
  d.hideSpot('box', 1.8, 13, 'east', { color: 0x5b2a86 });
  d.lamp(7.5, 13, 5.6, 0xffd8f0, 0.7, { distance: 10, room: 'G', flicker: true });

  // ── The Ticket Booths: booths behind glass, queue ropes
  for (const z of [5, 12, 19]) {
    d.counter(59.5, z, 3.6, 2.2, 1.1, 0xc0262d, 0xf4f1ea);
    const g = d.anchor(57.7, z, 'west', 1.9);
    d.mesh(G.plane, new THREE.MeshStandardMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.18, roughness: 0.05, depthWrite: false }), g, { s: [2.2, 1.4, 1], shadow: false });
    neon(d, 'TICKETS', 57.66, z, 2.85, 1.6, 0.3, 'west', gold, 0xff5a5f);
  }
  for (let z = 4; z < 22; z += 2.5) {
    const c = P(53, z, 0.5);
    d.mesh(G.cyl, mat(gold, { metal: 0.7, rough: 0.3 }), d.group, { p: [c.x, c.y, c.z], s: [0.05, 1.0, 0.05] });
  }
  d.hideSpot('counter', 49.8, 22.4, 'east', { color: 0xc0262d });
  d.lamp(55, 12, 5.6, 0xffe2b0, 0.7, { distance: 10, room: 'T' });

  // the three beacons: big lights, dark until somebody switches them on
  d.beacons = LOBBY_SPOTS.beacons.map(([x, z], i) => {
    const l = d.lamp(x, z, 5.4, [0xffd23f, 0x2de2e6, 0xff3fa4][i], 3.2, { distance: 22, room: '*', size: 0.22 });
    l.off = true;
    if (l.bulb) l.bulb.visible = false;
    return l;
  });

  // ── The Main Hall: back toward the Atrium
  neon(d, '↓ TO THE ATRIUM', 32, 44.96, 3.2, 4, 0.6, 'north', 0xffffff, pink);
  for (const [x, z] of [[21, 30], [43, 30], [21, 39], [43, 39]]) d.block(x, z, 2.4, 0.7, 0.5, mat(0x3a2a5a, { rough: 0.5 }));
  for (const x of [26, 38]) d.block(x, 35, 1.2, 1.2, 1.8, mat(0x2a4fa0, { rough: 0.3 }));
  d.hideSpot('toybox', 16.8, 43.2, 'east', { color: 0xffd23f });
  d.hideSpot('box', 47.2, 43.2, 'west', { color: 0xa8805a });
  for (const x of [24, 40]) d.lamp(x, 35, 5.6, 0xc8b0ff, 0.9, { distance: 12, room: 'H', flicker: x === 40 });
  d.savePoint(32, 44.4, 'north');

  // ── The Security Desk: the front desk, its monitors, the radio
  d.counter(4.4, 31, 1.2, 6, 1.0, 0x4a3a2a, 0x6a5a48);
  for (const z of [29.5, 32.5]) {
    const c = P(4.0, z, 1.25);
    d.mesh(G.box, glowMat(0x1f7a4a, 0.15), d.group, { p: [c.x, c.y, c.z], s: [0.08, 0.36, 0.55], shadow: false });
  }
  for (let z = 37; z < 44; z += 0.9) d.block(1.4, z, 0.6, 0.8, 2.0, mat(0x4a6ab8, { metal: 0.5, rough: 0.4 }));
  d.hideSpot('locker', 13.4, 43.4, 'west', { color: 0x4a6ab8 });
  neon(d, 'SECURITY', 1.04, 31, 2.8, 2.4, 0.4, 'east', gold);
  d.lamp(7, 33, 5.6, 0xffe2b0, 0.8, { distance: 11, room: 'S' });
  d.savePoint(13.4, 27, 'west');

  // ── Coat Check: a long rail of coats nobody came back for
  d.counter(52, 35, 1.2, 8, 1.05, 0x2a4fa0, 0xe8e0d0);
  for (let z = 30; z < 41; z += 0.6) {
    const c = P(58, z, 1.2);
    d.mesh(G.box, cloth([0x3a3a44, 0x7a2a2a, 0x2a4a7a, 0x5a4a2a][Math.floor(z * 3) % 4]), d.group, { p: [c.x, c.y, c.z], s: [0.5, 1.1, 0.12] });
  }
  d.place.addBlock(57.6, 29.6, 58.4, 41, 1.8);
  d.hideSpot('curtain', 61.6, 43, 'west', { color: 0x2a4fa0 });
  d.lamp(56, 35, 5.6, 0xd8e0ff, 0.7, { distance: 10, room: 'C', flicker: true });
}

export { E, W, N, S };
