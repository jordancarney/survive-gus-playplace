// The two places Jack's chapters happen:
//
//   The Tunnels     right under the main floor (the same rooms as Chapter 4): the Hatch
//                   Landing, the Vent, the Workshop, the Parts Room, the Control Room with its
//                   window into DJ Rocco's Charging Bay, and the Ladder Room.
//
//   The Deep Tunnels, way down the service elevator, where P.A.L. lives:
//
//      ┌ Server Room ┐ ┌ Generator Room ┐  ┌ THE CORE ┐
//      ├─────────────┴─┴────────────────┴──┤ (P.A.L.)  │
//   Elevator ════════ the Long Hall ═══════╡  door     │
//      ├─────────────┬─┬────────────────┬──┤           │
//      └ Robot Store ┘ └ Monitor Room   ┘  ├─ window ──┤
//                                          └ the Pen ──┘
//
// Each chapter builds its own copy and adds what it needs (things to find, targets, levers).
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth } from '../../models.js';
import * as THREE from 'three';
import { makeGate } from './kit.js';

// ── The Tunnels ─────────────────────────────────────────────────────────

const TUNNEL_ROOMS = {
  H: { name: 'Hatch Landing', short: 'Hatch', x0: 1, z0: 1, x1: 9, z1: 9,
       floor: () => T.concrete(), wall: ['#3a3d44', '#f2c230', '#22242a', 'bricks'] },
  V: { name: 'The Vent', short: 'Vent', x0: 11, z0: 4, x1: 25, z1: 5,
       floor: () => T.concrete(), wall: ['#6a7078', '#8a9098', '#4a5058', 'panels'] },
  K: { name: 'Workshop', x0: 27, z0: 1, x1: 42, z1: 12,
       floor: () => T.concrete(), wall: ['#4a4d55', '#ff9a1f', '#2b2d33', 'bricks'] },
  R: { name: 'Parts Room', short: 'Parts', x0: 27, z0: 14, x1: 42, z1: 28,
       floor: () => T.tiles('#5a5d65', '#44474e'), wall: ['#3a3d44', '#ff3b30', '#22242a', 'panels'] },
  C: { name: 'Control Room', short: 'Control', x0: 15, z0: 14, x1: 24, z1: 20,
       floor: () => T.tiles('#8e9aa0', '#6c777c'), wall: ['#2a3a4a', '#2de2e6', '#1a2430', 'panels'] },
  Y: { name: 'Charging Bay', short: 'Bay', x0: 15, z0: 22, x1: 24, z1: 28,
       floor: () => T.hazard(), wall: ['#2a0e33', '#c040ff', '#1a0820', 'panels'] },
  L: { name: 'Ladder Room', short: 'Ladder', x0: 1, z0: 14, x1: 12, z1: 26,
       floor: () => T.concrete(), wall: ['#3a3d44', '#7cff6b', '#22242a', 'bricks'] },
};

// `bayDoor`: a door from the Parts Room into the Charging Bay (Chapter 24).
export function tunnelsLayout({ bayDoor = false } = {}) {
  const doors = [
    { a: 'H', b: 'V', x0: 10, z0: 4, x1: 10, z1: 5 },
    { a: 'V', b: 'K', x0: 26, z0: 4, x1: 26, z1: 5 },
    { a: 'K', b: 'R', x0: 32, z0: 13, x1: 34, z1: 13 },
    { a: 'R', b: 'C', x0: 25, z0: 16, x1: 26, z1: 17 },
    { a: 'C', b: 'L', x0: 13, z0: 16, x1: 14, z1: 17 },
    { a: 'C', b: 'Y', x0: 17, z0: 21, x1: 22, z1: 21 },     // the window
  ];
  if (bayDoor) doors.push({ a: 'R', b: 'Y', x0: 25, z0: 25, x1: 26, z1: 26 });
  return {
    w: 44, h: 30, wallH: 3.0, panels: false,
    wallColor: 0x1a1a1e, headerColor: 0xf2c230,
    ceiling: () => T.concrete(),
    rooms: TUNNEL_ROOMS,
    doors,
  };
}

export const TUNNEL_VENTS = [{ x0: 9.6, z0: 3.9, x1: 26.4, z1: 6.1 }];

// The rooms' furniture, hiding spots, save boxes and lights; the window and DJ Rocco's charger;
// the ladder out (`ladder: false` leaves the ladder locked for good). Chapters add the rest.
export function buildTunnels(d, { ladder = true, hatchExit = false, shockPanel = true } = {}) {
  const P = d.place.P;
  const steel = mat(0x8a9098, { metal: 0.6, rough: 0.35 });

  // Hatch Landing
  d.block(2, 2, 0.6, 0.15, 3.0, steel, { solid: false, nav: false });
  for (let k = 0; k < 8; k++) d.block(2, 2.1, 0.6, 0.05, 0.04, steel, { y: 0.3 + k * 0.35, solid: false, nav: false });
  if (hatchExit) d.exitDoor(4.5, 1.6, 'south', { w: 1.6, label: 'HATCH ↑' });
  else d.label('HATCH — STUCK', 2, 1.04, 2.6, 1.6, 0.3, 'south', { bg: '#2a0606', fg: '#ff3b30', glow: '#ff3b30' });
  d.crate(7.5, 2, 0.9);
  d.crate(8, 3.1, 0.7, 0x6a5a4a);
  d.label('VENT →', 9.96, 3.4, 1.4, 1.2, 0.3, 'west', { bg: '#22242a', fg: '#f2c230', glow: '#f2c230' });
  d.savePoint(5, 8.4, 'north');
  d.hideSpot('box', 8.2, 8.2, 'west');
  d.lamp(5, 5, 2.7, 0xffb070, 1.0, { distance: 8, room: 'H', flicker: true });

  // the vent: a low ceiling all along it; and nothing big fits in there
  const v = TUNNEL_VENTS[0];
  const a = P(v.x0, v.z0), b = P(v.x1, v.z1);
  d.mesh(G.box, steel, d.group, { p: [(a.x + b.x) / 2, 1.0, (a.z + b.z) / 2], s: [b.x - a.x, 0.05, b.z - a.z] });
  for (const z of [v.z0 + 0.05, v.z1 - 0.05]) {
    const c = P((v.x0 + v.x1) / 2, z, 0.5);
    d.mesh(G.box, steel, d.group, { p: [c.x, c.y, c.z], s: [v.x1 - v.x0, 1.0, 0.04] });
  }
  d.place.blockNav(10.2, 4, 25.8, 6, 0);
  for (let x = 12; x < 26; x += 2.5) d.lamp(x, 5, 0.9, 0x9fd8ff, 0.35, { distance: 2.6, room: 'V', bulb: true, size: 0.04 });

  // the Workshop
  for (const [x, z] of [[31, 4], [37, 4], [31, 9], [37, 9]]) d.table(x, z, 2.4, 1.1, 0.9, 0x5a4a3a, { legs: 0x2a2a30 });
  for (const [x, z] of [[31, 4], [37, 9]]) {
    const c = P(x, z, 1.1);
    d.mesh(G.sphere, mat(0x7a7a82, { metal: 0.5, rough: 0.4 }), d.group, { p: [c.x, c.y, c.z], s: [0.3, 0.3, 0.3] });
  }
  d.shelf(42.4, 6.5, 0.8, 9, 2.4, 'west', { wood: 0x4a4d55, books: false });
  d.hideSpot('locker', 28, 11.4, 'north', { color: 0x4a6ab8 });
  d.hideSpot('locker', 41.6, 11.4, 'north', { color: 0x4a6ab8 });
  d.hideSpot('box', 34, 1.8, 'south');
  d.savePoint(27.8, 7, 'east');
  d.label('WORKSHOP', 34.5, 1.04, 2.4, 2.4, 0.4, 'south', { bg: '#2b2d33', fg: '#ff9a1f', glow: '#ff9a1f' });
  d.workLights = [
    d.lamp(31, 6.5, 2.7, 0xffe2b0, 1.2, { distance: 9, room: 'K' }),
    d.lamp(38, 6.5, 2.7, 0xffe2b0, 1.0, { distance: 9, room: 'K', flicker: true }),
  ];

  // the Parts Room
  for (const z of [17, 21, 25]) d.shelf(34.5, z, 9, 0.7, 2.0, 'south', { wood: 0x4a4d55, books: false });
  for (let i = 0; i < 10; i++) {
    const c = P(30.6 + i * 0.85, 17 + (i % 3) * 4, 2.15);
    d.mesh(G.sphere, mat([0xa8642e, 0x2a3040, 0x5b8fc4, 0x8a8a92][i % 4], { rough: 0.6 }), d.group, { p: [c.x, c.y, c.z], s: [0.22, 0.24, 0.22] });
  }
  d.hideSpot('box', 41.4, 27.4, 'west');
  d.hideSpot('locker', 27.6, 19.0, 'east', { color: 0x7a2a2a });
  d.label('PARTS ROOM', 33, 13.96, 2.5, 2.4, 0.4, 'north', { bg: '#22242a', fg: '#ff3b30', glow: '#ff3b30' });
  d.partsLights = [
    d.lamp(30, 21, 2.7, 0xd8e0ff, 1.0, { distance: 9, room: 'R' }),
    d.lamp(39, 21, 2.7, 0xd8e0ff, 1.0, { distance: 9, room: 'R' }),
  ];

  // the Control Room: the shock panel at the window into the Charging Bay
  if (shockPanel) {
    d.target('shock', 19.5, 19.9, 'north', 'Give a CONTROLLED SHOCK ⚡', (g) => {
      d.mesh(G.box, lam(0x2a2a30), g, { p: [0, 0.4, 0], s: [1.4, 0.8, 0.45] });
      d.mesh(G.box, lam(0x3a3a44), g, { p: [0, 0.82, -0.04], s: [1.4, 0.05, 0.52], r: [0.25, 0, 0] });
      d.mesh(G.cyl, glowMat(0xff3b30, 0.6), g, { p: [0, 0.87, 0.04], s: [0.09, 0.05, 0.09], r: [0.25, 0, 0], still: false });
      for (let k = 0; k < 6; k++) d.mesh(G.box, glowMat([0x7cff6b, 0xffd23f, 0x2de2e6][k % 3], 0.3), g, { p: [-0.55 + k * 0.22, 0.86, -0.14], s: [0.06, 0.025, 0.06], r: [0.25, 0, 0] });
    });
    d.place.addBlock(18.8, 19.68, 20.2, 20.15, 0.8);
    d.label('CONTROLLED SHOCK', 19.5, 14.04, 2.4, 3.0, 0.4, 'south', { bg: '#1a2430', fg: '#2de2e6', glow: '#2de2e6' });
  }
  const ga = P(17, 21), gb = P(23, 22);
  d.place.addBlock(17, 21, 23, 22, 3);
  d.mesh(G.box, new THREE.MeshStandardMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.2, depthWrite: false }), d.group,
    { p: [(ga.x + gb.x) / 2, 1.5, (ga.z + gb.z) / 2], s: [gb.x - ga.x, 3.0, 0.08], shadow: false });
  d.windowCracks = d.mesh(G.plane, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }), d.group,
    { p: [(ga.x + gb.x) / 2, 1.5, (ga.z + gb.z) / 2 - 0.06], s: [gb.x - ga.x, 3.0, 1], r: [0, Math.PI, 0], shadow: false, still: false });
  d.savePoint(23.5, 14.8, 'south');
  d.hideSpot('counter', 15.8, 15.0, 'east', { color: 0x2a3a4a });
  d.controlLights = [d.lamp(19.5, 17, 2.7, 0x9fd8ff, 0.9, { distance: 8, room: 'C' })];
  // the Charging Bay behind the glass
  d.patch(19.5, 27.4, 2.2, 1.6, 0xc040ff, { glow: 0.2 });
  d.block(19.5, 28.6, 1.6, 0.6, 2.4, mat(0x9aa4b0, { metal: 0.5, rough: 0.4 }));
  d.label("DJ ROCCO'S CHARGER", 19.5, 28.96, 2.6, 2.6, 0.4, 'north', { bg: '#1a0820', fg: '#c040ff', glow: '#ff3fa4' });
  d.lamp(19.5, 25, 2.7, 0xc040ff, 1.2, { distance: 8, room: 'Y' });

  // the Ladder Room
  if (!hatchExit) d.exitDoor(1.6, 20, 'east', { w: 1.6, label: 'LADDER UP' });
  d.label(ladder ? 'EXIT ↑ TO THE GUS SHOP' : 'LADDER — LOCKED BY P.A.L.', 1.04, 20, 2.6, 2.6, 0.4, 'east',
    ladder ? { bg: '#0a2a0a', fg: '#7cff6b', glow: '#7cff6b' } : { bg: '#2a0606', fg: '#ff3b30', glow: '#ff3b30' });
  for (const [x, z] of [[6, 16], [9, 24]]) d.junk(x, z, 1.3);
  d.hideSpot('locker', 11.4, 25.4, 'west', { color: 0x2f8f3a });
  d.lamp(6, 20, 2.7, 0x9fffb0, 0.8, { distance: 9, room: 'L', flicker: true });

  d.spots.spawn = P(4.5, 5.5);
}

// ── The Deep Tunnels ────────────────────────────────────────────────────

export const coreLayout = {
  w: 48, h: 34, wallH: 3.4, panels: false,
  wallColor: 0x101418, headerColor: 0x2de2e6,
  ceiling: () => T.concrete(),
  rooms: {
    E: { name: 'Service Elevator', short: 'Elevator', x0: 1, z0: 12, x1: 8, z1: 21,
         floor: () => T.hazard(), wall: ['#3a3d44', '#f2c230', '#22242a', 'panels'] },
    A: { name: 'The Long Hall', short: 'Long Hall', x0: 10, z0: 15, x1: 36, z1: 18,
         floor: () => T.concrete(), wall: ['#2a3038', '#2de2e6', '#161a20', 'panels'] },
    S: { name: 'Server Room', short: 'Servers', x0: 10, z0: 1, x1: 22, z1: 13,
         floor: () => T.tiles('#3a4048', '#2a3038'), wall: ['#1a2430', '#2de2e6', '#0e141a', 'panels'] },
    G: { name: 'Generator Room', short: 'Generator', x0: 24, z0: 1, x1: 36, z1: 13,
         floor: () => T.concrete(), wall: ['#4a4d55', '#f2c230', '#2b2d33', 'bricks'] },
    R: { name: 'Robot Storage', short: 'Storage', x0: 10, z0: 20, x1: 22, z1: 32,
         floor: () => T.concrete(), wall: ['#3a3d44', '#ff3b30', '#22242a', 'bricks'] },
    M: { name: 'Monitor Room', short: 'Monitors', x0: 24, z0: 20, x1: 36, z1: 32,
         floor: () => T.tiles('#8e9aa0', '#6c777c'), wall: ['#2a3a4a', '#7cff6b', '#1a2430', 'panels'] },
    C: { name: "P.A.L.'s Core", short: 'The Core', x0: 38, z0: 1, x1: 46, z1: 20,
         floor: () => T.tiles('#1a2a30', '#0e1a20'), wall: ['#0a1a22', '#2de2e6', '#05101a', 'panels'] },
    P: { name: 'The Pen', short: 'Pen', x0: 38, z0: 22, x1: 46, z1: 32,
         floor: () => T.hazard(), wall: ['#2a0e33', '#c040ff', '#1a0820', 'panels'] },
  },
  doors: [
    { a: 'E', b: 'A', x0: 9, z0: 16, x1: 9, z1: 17 },
    { a: 'A', b: 'S', x0: 15, z0: 14, x1: 17, z1: 14 },
    { a: 'A', b: 'G', x0: 29, z0: 14, x1: 31, z1: 14 },
    { a: 'A', b: 'R', x0: 15, z0: 19, x1: 17, z1: 19 },
    { a: 'A', b: 'M', x0: 29, z0: 19, x1: 31, z1: 19 },
    { a: 'A', b: 'C', x0: 37, z0: 16, x1: 37, z1: 17 },     // the Core door (a gate)
    { a: 'C', b: 'P', x0: 40, z0: 21, x1: 44, z1: 21 },     // the Pen's window
  ],
};

// Everything in the Deep Tunnels. Options:
//   coreOpen   the Core's door starts open      monitors  the Monitor Room's computer target
//   cables     the three cables round the Core  off       the big OFF switch
//   cams       the Core's security cameras      shock     a shock panel at the Pen's window
//   manual     P.A.L.'s instruction book
export function buildCore(d, { monitors = false, cables = false, off = false, cams = false, shock = false, manual = false } = {}) {
  const P = d.place.P;
  const steel = mat(0x8a9098, { metal: 0.6, rough: 0.35 });
  const cyan = 0x2de2e6;

  // the Service Elevator: its doors are the way out
  d.exitDoor(1.6, 16.5, 'east', { w: 2.0, label: 'ELEVATOR ↑' });
  d.label('SERVICE ELEVATOR', 1.04, 16.5, 2.75, 2.6, 0.35, 'east', { bg: '#22242a', fg: '#f2c230', glow: '#f2c230' });
  d.savePoint(4.5, 20.4, 'north');
  d.hideSpot('box', 7.6, 12.8, 'south');
  d.lamp(4.5, 16.5, 3.1, 0xffe2b0, 1.0, { distance: 8, room: 'E', flicker: true });

  // the Long Hall: pipes along the ceiling, cyan strip lights
  for (const z of [15.2, 18.8]) d.block(23, z, 26, 0.12, 0.12, steel, { y: 3.0, solid: false, nav: false });
  for (const x of [13, 19, 25, 31]) d.lamp(x, 16.5, 3.2, cyan, 0.55, { distance: 7, room: 'A' });
  d.label('→ THE CORE · AUTHORIZED P.A.L. STAFF ONLY', 36.96, 16.5, 2.85, 3.0, 0.35, 'west', { bg: '#05101a', fg: '#2de2e6', glow: '#2de2e6' });

  // the Server Room: rows of tall blinking server racks (good for ducking behind)
  for (const x of [13, 17, 21]) {
    for (const z of [3.5, 9.5]) {
      d.block(x, z, 1.2, 3.6, 2.6, mat(0x1a1e24, { metal: 0.4, rough: 0.4 }));
      for (let k = 0; k < 6; k++) {
        const c = P(x + 0.61, z - 1.4 + k * 0.55, 0.6 + (k % 3) * 0.6);
        d.mesh(G.box, glowMat([cyan, 0x7cff6b, 0xffd23f][(k + x) % 3], 0.3), d.group, { p: [c.x, c.y, c.z], s: [0.01, 0.04, 0.12], shadow: false });
      }
    }
  }
  d.hideSpot('locker', 10.6, 12.4, 'east', { color: 0x2a3a4a });
  d.label('SERVER ROOM', 16, 13.96, 2.6, 2.4, 0.4, 'north', { bg: '#0e141a', fg: '#2de2e6', glow: '#2de2e6' });
  d.serverLights = [d.lamp(16, 6.5, 3.2, 0x9fd8ff, 0.8, { distance: 10, room: 'S' })];

  // the Generator Room
  d.block(30, 5, 4, 2.4, 2.0, steel);
  d.block(30, 5, 0.6, 0.6, 3.4, mat(0x5a6070, { metal: 0.6 }), { solid: false, nav: false });
  d.label('GENERATOR', 30, 3.79, 1.6, 1.8, 0.35, 'north', { bg: '#2b2d33', fg: '#f2c230', glow: '#f2c230' });
  d.hideSpot('box', 35.4, 12.4, 'west');
  d.hideSpot('locker', 24.6, 2.0, 'east', { color: 0x6a5a2a });
  d.label('GENERATOR ROOM', 30, 13.96, 2.6, 2.6, 0.4, 'north', { bg: '#2b2d33', fg: '#f2c230', glow: '#f2c230' });
  d.genLights = [d.lamp(30, 9, 3.2, 0xffd8a0, 1.0, { distance: 10, room: 'G', flicker: true })];

  // Robot Storage: old animatronics under dust sheets
  const sheet = cloth(0xd8d0c0);
  for (const [x, z] of [[12.5, 23], [16, 23], [19.5, 23], [12.5, 28], [16, 28.5]]) {
    const c = P(x, z, 0.95);
    d.mesh(G.cone, sheet, d.group, { p: [c.x, c.y, c.z], s: [0.55, 1.9, 0.55] });
    const h = P(x, z, 1.95);
    d.mesh(G.sphere, sheet, d.group, { p: [h.x, h.y, h.z], s: [0.32, 0.3, 0.32] });
    d.place.addBlock(x - 0.5, z - 0.5, x + 0.5, z + 0.5, 2.2);
  }
  d.hideSpot('box', 21.4, 31.4, 'west');
  d.hideSpot('curtain', 10.8, 31.0, 'east', { color: 0xd8d0c0 });
  d.label('ROBOT STORAGE', 16, 19.04, 2.6, 2.6, 0.4, 'south', { bg: '#22242a', fg: '#ff3b30', glow: '#ff3b30' });
  d.storeLights = [d.lamp(16, 26, 3.2, 0xffd0b0, 0.8, { distance: 10, room: 'R', flicker: true })];

  // the Monitor Room: a wall of screens, and the computer
  for (let i = 0; i < 6; i++) {
    const c = P(26 + i * 1.8, 32.92, 1.6 + (i % 2) * 0.7);
    d.mesh(G.plane, glowMat([0x7cff6b, cyan][i % 2], 0.12), d.group, { p: [c.x, c.y, c.z], s: [1.4, 0.8, 1], r: [0, Math.PI, 0], shadow: false });
  }
  if (monitors) {
    d.target('monitors', 30, 30.6, 'north', 'Use the computer 💻', (g) => {
      d.mesh(G.box, lam(0x2a2a30), g, { p: [0, 0.4, 0], s: [1.6, 0.8, 0.6] });
      d.mesh(G.box, lam(0x1a1a1e), g, { p: [0, 1.05, -0.15], s: [0.9, 0.55, 0.06] });
      d.screen = d.mesh(G.plane, glowMat(0x2de2e6, 0.2), g, { p: [0, 1.05, -0.11], s: [0.8, 0.45, 1], shadow: false, still: false });
    });
    d.place.addBlock(29.2, 30.3, 30.8, 30.9, 0.8);
  }
  d.hideSpot('counter', 35.4, 21.2, 'west', { color: 0x2a3a4a });
  d.savePoint(24.6, 26, 'east');
  d.label('MONITOR ROOM', 30, 19.04, 2.6, 2.6, 0.4, 'south', { bg: '#1a2430', fg: '#7cff6b', glow: '#7cff6b' });
  d.monLights = [d.lamp(30, 25, 3.2, 0xb0ffc0, 0.8, { distance: 10, room: 'M' })];

  // P.A.L.'s Core: a tall glowing column with rings that turn, and P.A.L.'s face on it
  const core = new THREE.Group();
  core.position.copy(P(42.5, 8.5));
  d.group.add(core);
  d.mesh(G.cyl, mat(0x1a2a30, { metal: 0.7, rough: 0.3 }), core, { p: [0, 1.7, 0], s: [1.1, 3.4, 1.1] });
  d.coreGlow = glowMat(cyan, 0.5);
  d.coreGlowBase = d.coreGlow.color.clone();
  d.mesh(G.cyl, d.coreGlow, core, { p: [0, 1.7, 0], s: [0.7, 3.42, 0.7], still: false });
  d.coreRings = [0.7, 1.7, 2.7].map((y) => {
    const r = d.mesh(G.torus || G.cyl, glowMat(0xffffff, 0.3), core, { p: [0, y, 0], s: [1.25, 0.05, 1.25], still: false });
    return r;
  });
  d.label('P.A.L.', 42.5, 9.62, 2.2, 1.0, 0.4, 'south', { bg: '#05101a', fg: '#2de2e6', glow: '#2de2e6' });
  d.place.addBlock(41.4, 7.4, 43.6, 9.6, 3.4);
  d.coreLights = [
    d.lamp(40, 4, 3.2, cyan, 1.0, { distance: 10, room: 'C' }),
    d.lamp(45, 15, 3.2, cyan, 0.9, { distance: 10, room: 'C' }),
  ];
  d.coreGate = makeGate(d, { x0: 37.0, z0: 16.0, x1: 38.0, z1: 18.0, color: 0x3a4a5a });
  if (cables) {
    d.cables = {};
    for (const [id, x, z, facing] of [['cable1', 40.0, 8.5, 'west'], ['cable2', 42.5, 11.4, 'south'], ['cable3', 45.0, 8.5, 'east']]) {
      d.target(id, x, z, facing, 'UNPLUG the cable 🔌', (g) => {
        d.mesh(G.box, mat(0x2a2c31, { metal: 0.5 }), g, { p: [0, 0.6, -0.1], s: [0.5, 1.2, 0.2] });
        const plug = d.mesh(G.cyl, glowMat(0xffd23f, 0.5), g, { p: [0, 0.9, 0.05], s: [0.12, 0.25, 0.12], r: [Math.PI / 2, 0, 0], still: false });
        d.cables[id] = plug;
      }, { reach: 1.5 });
    }
  }
  if (off) {
    // on the Core's west wall, by the door
    d.target('off', 38.4, 12.5, 'east', 'The OFF switch: type P.A.L.\'s code ⌨️', (g) => {
      d.mesh(G.box, mat(0x3a3d44, { metal: 0.5 }), g, { p: [0, 0.7, 0], s: [1.0, 1.4, 0.4] });
      d.offBtn = d.mesh(G.box, glowMat(0xff3b30, 0.6), g, { p: [0, 1.15, 0.21], s: [0.4, 0.25, 0.02], still: false });
      d.mesh(G.box, lam(0x111111), g, { p: [0, 0.75, 0.21], s: [0.5, 0.35, 0.02] });
    });
    d.place.addBlock(38.2, 12.0, 38.6, 13.0, 1.4);
    d.label('OFF', 38.04, 12.5, 1.95, 0.8, 0.3, 'east', { bg: '#2a0606', fg: '#ff3b30', glow: '#ff3b30' });
  }
  if (shock) {
    d.target('shock', 42.5, 19.6, 'north', 'Give a CONTROLLED SHOCK ⚡', (g) => {
      d.mesh(G.box, lam(0x2a2a30), g, { p: [0, 0.4, 0], s: [1.4, 0.8, 0.45] });
      d.mesh(G.box, lam(0x3a3a44), g, { p: [0, 0.82, -0.04], s: [1.4, 0.05, 0.52], r: [0.25, 0, 0] });
      d.mesh(G.cyl, glowMat(0xff3b30, 0.6), g, { p: [0, 0.87, 0.04], s: [0.09, 0.05, 0.09], r: [0.25, 0, 0], still: false });
    });
    d.place.addBlock(41.8, 19.38, 43.2, 19.83, 0.8);
  }
  if (manual) {
    d.target('manual', 45.6, 3.0, 'west', "Read P.A.L.'s instruction book 📘", (g) => {
      d.mesh(G.box, mat(0x4a3a2a, { rough: 0.6 }), g, { p: [0, 0.45, 0], s: [0.8, 0.9, 0.6] });
      d.mesh(G.box, glowMat(0x2de2e6, 0.4), g, { p: [0, 0.93, 0], s: [0.4, 0.05, 0.3], still: false });
    });
    d.place.addBlock(45.3, 2.6, 45.9, 3.4, 0.9);
  }
  if (cams) {
    d.securityCam(38.3, 2.0, 2.9, 'east', { sweep: 0.8, range: 10, speed: 0.6 });
    d.securityCam(45.7, 19.0, 2.9, 'west', { sweep: 0.8, range: 10, speed: 0.5, phase: 2 });
  }
  // the Pen behind the Core's thick window
  const wa = P(40, 21), wb = P(45, 22);
  d.place.addBlock(40, 21, 45, 22, 3.4);
  d.mesh(G.box, new THREE.MeshStandardMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.2, depthWrite: false }), d.group,
    { p: [(wa.x + wb.x) / 2, 1.6, (wa.z + wb.z) / 2], s: [wb.x - wa.x, 3.2, 0.08], shadow: false });
  d.penCracks = d.mesh(G.plane, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }), d.group,
    { p: [(wa.x + wb.x) / 2, 1.6, (wa.z + wb.z) / 2 - 0.06], s: [wb.x - wa.x, 3.2, 1], r: [0, Math.PI, 0], shadow: false, still: false });
  d.patch(42.5, 30.6, 2.2, 1.6, 0xc040ff, { glow: 0.2 });
  d.block(42.5, 31.7, 1.6, 0.5, 2.4, mat(0x9aa4b0, { metal: 0.5, rough: 0.4 }));
  d.lamp(42.5, 27, 3.2, 0xc040ff, 1.0, { distance: 9, room: 'P' });

  d.spots.spawn = P(4.5, 15);
}

// The Core's column and rings, turning and pulsing; brighter as P.A.L. gets cross.
export function animateCore(d, t, k = 1) {
  if (!d.coreRings) return;
  d.coreRings.forEach((r, i) => { r.position.y = [0.7, 1.7, 2.7][i] + Math.sin(t * (1 + i * 0.4) * k) * 0.15; });
  if (d.coreGlow) d.coreGlow.color.copy(d.coreGlowBase).multiplyScalar(Math.max(0.05, (0.75 + Math.sin(t * 3 * k) * 0.25) * Math.min(1, k)));
}
