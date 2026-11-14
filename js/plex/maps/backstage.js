// Backstage at the Pizzaplex: behind the STAFF ONLY door and the giant stage. Jonathan's
// Chapters 6 (Backstage), 26 (Gus's Room) and 40 (The Music Box) happen here.
//
//   ┌ Loading Hall ┐
//   ├──────────────┴──────────── Backstage Hall ─────────────────────────┐
//   │ Dressing Rooms │ Costume Storage │ Stage Wings (the STAGE LIFT →)    │
//   │ Prop Room      │ Sound Booth     │ Gus's Room (his old music box)    │
//
// Rooms: L Loading Hall, H Backstage Hall, D Dressing Rooms, C Costume Storage, W Stage
// Wings, P Prop Room, S Sound Booth, G Gus's Room. Gus's Room's only door is from the
// Stage Wings, and it's locked (`d.gusDoor`) until a chapter opens it.
//
// `buildBackstage(d, { exit })`: exit 'lift' puts the way out in the Stage Wings (the stage
// lift down to the Fun Zone); 'loading' puts it back at the Loading Hall's STAFF door.
// Sets d.gusDoor (lockedDoor), d.musicBox { group, fig, pos } (Gus's music box, to make a
// target of), and d.liftPanel (where the lift's fuse panel goes).
import * as T from '../../textures.js';
import { E, W, N, S, neon, lockedDoor, G, lam, glowMat, mat, cloth, THREE } from './kit.js';

export const backstageLayout = {
  w: 56, h: 40, wallH: 3.4, panels: false,
  wallColor: 0x1a1a1e, headerColor: 0xffd23f,
  ceiling: () => T.concrete(),
  rooms: {
    L: { name: 'Loading Hall', short: 'Loading', x0: 1, z0: 1, x1: 14, z1: 8,
         floor: () => T.concrete(), wall: ['#3a3d44', '#f2c230', '#22242a', 'bricks'] },
    H: { name: 'Backstage Hall', short: 'Hall', x0: 1, z0: 10, x1: 54, z1: 13,
         floor: () => T.tiles('#4a4550', '#35313a'), wall: ['#2a2238', '#ff3fa4', '#1a1424', 'panels'] },
    D: { name: 'Dressing Rooms', short: 'Dressing', x0: 1, z0: 15, x1: 17, z1: 26,
         floor: () => T.wood('#6a4a2a'), wall: ['#5a2a3a', '#ffd23f', '#2a1018', 'stripes'] },
    C: { name: 'Costume Storage', short: 'Costumes', x0: 19, z0: 15, x1: 36, z1: 26,
         floor: () => T.concrete(), wall: ['#3a2a4a', '#c040ff', '#1a1024', 'panels'] },
    W: { name: 'Stage Wings', short: 'Wings', x0: 38, z0: 15, x1: 54, z1: 26,
         floor: () => T.wood('#3a2a1a'), wall: ['#1a1018', '#b0102a', '#0a0610', 'panels'] },
    P: { name: 'Prop Room', short: 'Props', x0: 1, z0: 28, x1: 17, z1: 38,
         floor: () => T.concrete(), wall: ['#3a3d44', '#7cff6b', '#22242a', 'bricks'] },
    S: { name: 'Sound Booth', short: 'Sound', x0: 19, z0: 28, x1: 37, z1: 38,
         floor: () => T.carpet('#1a1a2a'), wall: ['#1a1a2a', '#2de2e6', '#0e0e18', 'panels'] },
    G: { name: "Gus's Room", short: "Gus's Room", x0: 40, z0: 28, x1: 54, z1: 38,
         floor: () => T.carpet('#3a1450'), wall: ['#3b1a5a', '#ffd23f', '#1d1024', 'stars'] },
  },
  doors: [
    { a: 'L', b: 'H', x0: 5, z0: 9, x1: 7, z1: 9 },
    { a: 'H', b: 'D', x0: 8, z0: 14, x1: 10, z1: 14 },
    { a: 'H', b: 'C', x0: 27, z0: 14, x1: 29, z1: 14 },
    { a: 'H', b: 'W', x0: 45, z0: 14, x1: 47, z1: 14 },
    { a: 'D', b: 'C', x0: 18, z0: 20, x1: 18, z1: 22 },
    { a: 'C', b: 'W', x0: 37, z0: 20, x1: 37, z1: 22 },
    { a: 'D', b: 'P', x0: 8, z0: 27, x1: 10, z1: 27 },
    { a: 'C', b: 'S', x0: 27, z0: 27, x1: 29, z1: 27 },
    { a: 'P', b: 'S', x0: 18, z0: 32, x1: 18, z1: 34 },
    { a: 'W', b: 'G', x0: 46, z0: 27, x1: 48, z1: 27 },
  ],
};

// A make-up mirror ringed with bulbs, on a counter.
function vanity(d, px, pz, facing) {
  const g = d.anchor(px, pz, facing, 0);
  d.mesh(G.box, lam(0x5a3a24), g, { p: [0, 0.4, 0], s: [1.4, 0.8, 0.5] });
  d.mesh(G.plane, mat(0xb8c8d8, { metal: 0.9, rough: 0.05, worn: false }), g, { p: [0, 1.45, -0.22], s: [1.1, 0.9, 1], shadow: false });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    d.mesh(G.sphere, glowMat(0xfff0c8, 0.35), g, { p: [Math.cos(a) * 0.62, 1.45 + Math.sin(a) * 0.5, -0.2], s: [0.04, 0.04, 0.04], shadow: false });
  }
  d.place.addBlock(px - 0.7, pz - 0.7, px + 0.7, pz + 0.7, 0.8, { margin: 0.1 });
}

// A rail of costumes: a rod on two stands, bulky suits hanging off it.
function rack(d, px, pz, len, along = 'x') {
  const cols = [0x8a8a92, 0xa8642e, 0x5b8fc4, 0x1d2230, 0x7a3ab8, 0x3a6ad8, 0xffd23f];
  const ax = along === 'x';
  const steel = mat(0x9aa0a8, { metal: 0.7, rough: 0.3 });
  for (const s of [-1, 1]) {
    const c = d.place.P(px + (ax ? s * len / 2 : 0), pz + (ax ? 0 : s * len / 2), 0.9);
    d.mesh(G.cyl, steel, d.group, { p: [c.x, c.y, c.z], s: [0.03, 1.8, 0.03] });
  }
  const top = d.place.P(px, pz, 1.8);
  d.mesh(G.cyl, steel, d.group, { p: [top.x, top.y, top.z], s: [0.025, len, 0.025], r: ax ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0] });
  const n = Math.floor(len / 0.5);
  for (let i = 0; i < n; i++) {
    const o = -len / 2 + 0.25 + i * 0.5;
    const c = d.place.P(px + (ax ? o : 0), pz + (ax ? 0 : o), 1.15);
    d.mesh(G.box, cloth(cols[(i * 3 + Math.floor(px)) % cols.length]), d.group, { p: [c.x, c.y, c.z], s: ax ? [0.36, 1.2, 0.5] : [0.5, 1.2, 0.36] });
  }
  if (ax) d.place.addBlock(px - len / 2, pz - 0.3, px + len / 2, pz + 0.3, 1.8);
  else d.place.addBlock(px - 0.3, pz - len / 2, px + 0.3, pz + len / 2, 1.8);
}

export function buildBackstage(d, { exit = 'lift' } = {}) {
  const P = d.place.P;
  const gold = 0xffd23f, pink = 0xff3fa4;

  // ── Loading Hall: where the STAFF ONLY door comes out
  for (const [x, z, s] of [[2, 2, 0.9], [3.1, 2, 0.8], [2.4, 3.1, 0.7], [12.8, 2.2, 0.9], [12.8, 3.3, 0.8]]) d.crate(x, z, s, 0x8a6a42);
  d.block(11, 7.4, 2.4, 1.0, 0.15, lam(0x6a4a2a));       // a pallet
  if (exit !== 'loading') {
    d.block(7.5, 1.06, 1.8, 0.08, 2.2, mat(0x6a7078, { metal: 0.5, rough: 0.4 }), { solid: false, nav: false });
    neon(d, 'STAFF ONLY', 7.5, 1.04, 2.5, 2.0, 0.4, 'south', 0xff3b30);
  }
  d.lamp(7.5, 4.5, 3.1, 0xffe2b0, 1.2, { distance: 9, room: 'L', flicker: true });
  d.savePoint(13.6, 6.6, 'west');

  // ── The Backstage Hall: long, flickering, lockers down one side
  for (let x = 16; x < 44; x += 2.2) d.block(x, 10.35, 0.7, 0.55, 2.0, mat(0x4a6ab8, { metal: 0.5, rough: 0.4 }));
  d.hideSpot('locker', 44.6, 10.4, 'south', { color: 0x4a6ab8 });
  d.hideSpot('locker', 13.2, 10.4, 'south', { color: 0x4a6ab8 });
  for (const x of [6, 18, 30, 42, 52]) d.lamp(x, 11.8, 3.1, 0xd8e0ff, 0.7, { distance: 8, room: 'H', flicker: x === 30 || x === 52 });
  d.label('DRESSING ROOMS ↓', 9, 13.96, 2.6, 2.6, 0.32, 'north', { bg: '#2a1018', fg: '#ffd23f', glow: '#ffd23f' });
  d.label('COSTUMES ↓', 28, 13.96, 2.6, 2.0, 0.32, 'north', { bg: '#1a1024', fg: '#c98aff', glow: '#c040ff' });
  d.label('STAGE ↓', 46, 13.96, 2.6, 1.6, 0.32, 'north', { bg: '#0a0610', fg: '#ff3b30', glow: '#ff3b30' });
  d.poster('GUS LIVE!', '#ff3fa4', 'gus', 47.5, 10.04, 1.7, 'south');
  d.poster('ON TOUR', '#2de2e6', 'gus', 51, 10.04, 1.7, 'south');
  d.savePoint(31, 12.6, 'north');

  // ── The Dressing Rooms: mirrors with bulbs round them, chairs, a curtain
  for (const z of [17, 20.5, 24]) {
    vanity(d, 1.3, z, 'east');
    d.chair(3.3, z, 0xb0102a, 0.95);
  }
  for (const [x, c] of [[12, 0xa8642e], [14.2, 0x5b8fc4]]) {
    const h = P(x, 25.6, 1.1);
    d.mesh(G.sphere, mat(c, { rough: 0.6 }), d.group, { p: [h.x, h.y, h.z], s: [0.3, 0.32, 0.3] });   // a spare head on a stand
    d.block(x, 25.6, 0.5, 0.5, 0.8, lam(0x2a2a30));
  }
  d.hideSpot('curtain', 16.4, 16.2, 'west', { color: 0xb0102a });
  d.lamp(8, 20.5, 3.1, 0xfff0c8, 1.0, { distance: 9, room: 'D' });

  // ── Costume Storage: racks of spare suits — and something that isn't a suit
  rack(d, 23.5, 18, 6, 'x');
  rack(d, 23.5, 23, 6, 'x');
  rack(d, 33.5, 18, 4, 'z');
  d.shelf(35.6, 24.5, 0.8, 3.5, 2.2, 'west', { wood: 0x4a4d55, books: false });
  for (let i = 0; i < 4; i++) {
    const c = P(35.6, 23.2 + i * 0.8, 2.35);
    d.mesh(G.sphere, mat([0x8a8a92, 0x1d2230, 0xa8642e, 0x5b8fc4][i], { rough: 0.6 }), d.group, { p: [c.x, c.y, c.z], s: [0.24, 0.26, 0.24] });
  }
  d.hideSpot('box', 19.8, 25.4, 'north', { color: 0xa8805a });
  d.lamp(28, 20.5, 3.1, 0xc98aff, 0.8, { distance: 10, room: 'C', flicker: true });
  d.savePoint(30.6, 25.6, 'north');

  // ── The Stage Wings: the back of the giant stage's curtain, ropes and sandbags
  d.block(41.4, 15.4, 6.8, 0.4, 3.4, cloth(0xb0102a), { solid: true });
  d.block(51.6, 15.4, 6.8, 0.4, 3.4, cloth(0xb0102a), { solid: true });
  for (let x = 40; x < 54; x += 2) {
    const c = P(x, 17, 1.6);
    d.mesh(G.cyl, lam(0xc8b080), d.group, { p: [c.x, c.y, c.z], s: [0.015, 3.2, 0.015] });
    const b = P(x, 17, 0.25);
    d.mesh(G.sphere, cloth(0x6a5a3a), d.group, { p: [b.x, b.y, b.z], s: [0.22, 0.2, 0.22] });
  }
  d.hideSpot('curtain', 39, 25.4, 'north', { color: 0x7a0a1a });
  for (const [x, z] of [[42, 24.5], [50.5, 20]]) d.crate(x, z, 0.9, 0x2a2a30);
  d.lamp(46, 21, 3.1, 0xff6a5a, 0.8, { distance: 10, room: 'W' });
  d.liftPanel = [53.6, 23.6];
  if (exit === 'lift') {
    d.exitDoor(54.4, 19.5, 'west', { w: 2.2, label: 'STAGE LIFT' });
    neon(d, 'STAGE LIFT ↓\nFUN ZONE', 54.96, 19.5, 2.75, 2.2, 0.55, 'west', gold, pink);
  }

  // ── The Prop Room: giant props from old shows
  const pizza = P(5, 33, 0.15);
  d.mesh(G.cyl, mat(0xffd27a, { rough: 0.7 }), d.group, { p: [pizza.x, pizza.y, pizza.z], s: [1.6, 0.3, 1.6] });
  d.place.addBlock(3.4, 31.4, 6.6, 34.6, 0.3);
  const cake = P(12, 31, 0);
  d.mesh(G.cyl, mat(0xff9ab8, { rough: 0.5 }), d.group, { p: [cake.x, 0.5, cake.z], s: [0.9, 1.0, 0.9] });
  d.mesh(G.cyl, mat(0xffffff, { rough: 0.5 }), d.group, { p: [cake.x, 1.2, cake.z], s: [0.6, 0.4, 0.6] });
  d.place.addBlock(11.1, 30.1, 12.9, 31.9, 1.4);
  const star = d.anchor(9, 37.6, 'north', 1.6);
  d.mesh(new THREE.ConeGeometry(1, 0.3, 5), glowMat(gold, 0.3), star, { s: [0.8, 0.8, 0.8], r: [Math.PI / 2, 0, 0] });
  d.shelf(16.6, 30.4, 0.8, 2.6, 2.2, 'west', { wood: 0x6a6a72, books: false });
  d.hideSpot('toybox', 2.2, 37.4, 'east', { color: 0x2a4fa0 });
  d.lamp(9, 33, 3.1, 0xffd8a0, 0.9, { distance: 10, room: 'P', flicker: true });
  d.savePoint(14.6, 28.6, 'south');

  // ── The Sound Booth: the mixing desk, speaker stacks, cables
  d.counter(28, 37.4, 8, 1.0, 1.0, 0x1a1a22, 0x2a2a30);
  for (let i = 0; i < 14; i++) {
    const c = P(24.4 + i * 0.52, 37.1, 1.04);
    d.mesh(G.box, glowMat([0x7cff6b, 0xffd23f, 0x2de2e6, 0xff3b30][i % 4], 0.3), d.group, { p: [c.x, c.y, c.z], s: [0.08, 0.02, 0.08], shadow: false });
  }
  for (const x of [20, 36.5]) d.block(x, 29, 1.0, 1.0, 2.6, mat(0x111114, { rough: 0.5 }));
  d.hideSpot('counter', 22, 33, 'east', { color: 0x1a1a22 });
  d.lamp(28, 33, 3.1, 0x2de2e6, 0.7, { distance: 10, room: 'S' });

  // ── Gus's Room: his star on the door, his mirror, his hats — and his music box
  d.gusDoor = lockedDoor(d, 46, 27, 48, 27, { color: 0x5b2a86, label: "GUS'S ROOM — PRIVATE" });
  vanity(d, 54.6, 33, 'west');
  const chair = P(51.6, 33, 0);
  d.mesh(G.box, cloth(0x7a1a3a), d.group, { p: [chair.x, 0.45, chair.z], s: [0.9, 0.2, 0.9] });
  d.mesh(G.box, cloth(0x7a1a3a), d.group, { p: [chair.x + 0.4, 1.0, chair.z], s: [0.15, 1.1, 0.9] });
  for (let i = 0; i < 4; i++) {
    const c = P(41 + i * 0.9, 28.2, 1.9);
    d.mesh(G.cyl, mat(0x1a1a22, { rough: 0.5 }), d.group, { p: [c.x, c.y, c.z], s: [0.14, 0.28, 0.14] });
    d.mesh(G.cyl, mat(0x1a1a22, { rough: 0.5 }), d.group, { p: [c.x, c.y - 0.14, c.z], s: [0.24, 0.02, 0.24] });
  }
  d.poster('GUS 1984', '#ffd23f', 'gus', 40.04, 31, 1.7, 'east');
  d.poster('THE SHOW', '#ff3fa4', 'gus', 40.04, 35.5, 1.7, 'east');
  d.rug(47, 33.5, 5, 4, '#5b2a86', '#ffd23f');
  // the music box: an old wooden box on a pedestal, a little Gus on top with his top hat
  const mb = P(47, 34);
  const g = d.anchor(47, 34, 'north', 0);
  d.mesh(G.cyl, mat(0x2a1a10, { rough: 0.6 }), g, { p: [0, 0.45, 0], s: [0.35, 0.9, 0.35] });
  d.mesh(G.box, mat(0x6a3a1a, { rough: 0.45 }), g, { p: [0, 1.02, 0], s: [0.5, 0.24, 0.36] });
  d.mesh(G.box, mat(gold, { metal: 0.7, rough: 0.3 }), g, { p: [0, 1.02, 0.185], s: [0.42, 0.04, 0.01] });
  const fig = new THREE.Group();
  fig.position.set(0, 1.14, 0);
  g.add(fig);
  d.mesh(G.sphere, mat(0x7a4a26, { rough: 0.6 }), fig, { p: [0, 0.1, 0], s: [0.07, 0.09, 0.06], still: false });
  d.mesh(G.sphere, mat(0x7a4a26, { rough: 0.6 }), fig, { p: [0, 0.22, 0], s: [0.055, 0.055, 0.055], still: false });
  d.mesh(G.cyl, mat(0x1a1a22), fig, { p: [0, 0.3, 0], s: [0.035, 0.06, 0.035], still: false });
  const crank = d.mesh(G.box, mat(0xc0c0c8, { metal: 0.8, rough: 0.3 }), g, { p: [0.28, 1.02, 0], s: [0.06, 0.03, 0.14], still: false });
  d.place.addBlock(46.6, 33.6, 47.4, 34.4, 1.2);
  d.musicBox = { pos: mb, group: g, fig, crank };
  d.lamp(47, 32, 3.0, 0xffc890, 0.9, { distance: 9, room: 'G', flicker: true });
  if (exit === 'loading') d.exitDoor(10.5, 1.6, 'south', { w: 1.8, label: 'STAFF EXIT' });
}

// The music box turning, and its little Gus going round.
export function spinMusicBox(d, dt, speed = 1) {
  const mb = d.musicBox;
  if (!mb) return;
  mb.fig.rotation.y += dt * 2.2 * speed;
  mb.crank.rotation.x += dt * 4 * speed;
}

export { E, W, N, S };
