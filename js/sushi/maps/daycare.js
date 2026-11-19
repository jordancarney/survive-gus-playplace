// Gerald's Daycare, from the designer's map: the Bathroom (a fuse), Gerald's Stage, the barred
// Daycare Exit, the Security Desk and the Generator along the top; a big winding Ball Pit (a
// fuse) through the middle; the climbing frame (a fuse, up top: climb the rope) at the bottom
// left; the Pool (a fuse) at the bottom right, with the Distraction by it; and a cubby tower
// with a rope up to the fifth fuse. You come in from Sushi's Pizzaplex on the right.
//
//   ┌ Bathroom ┐                         ┌ Security ┐ ┌ Gen ┐
//   └────┬─────┘   [Gerald's Stage]  EXIT └────┬─────┘ └──┬──┘
//   │                                                        │
//   │  ○      ≈≈≈≈ BALL ≈≈≈≈                                 │
//   │          ≈≈≈≈≈≈≈≈≈≈≈≈≈                                 ← from Sushi's
//   │ ▦▦▦▦         ≈≈≈≈≈≈≈≈≈ PIT ≈≈≈≈≈≈≈≈   ♪ distraction      │
//   │ ▦▦▦▦  (frame)            ▥ cubby   ~~~~ POOL ~~~~      │
//   └──────────────────────────────────────────────────────────┘
import * as T from '../../textures.js';
import { E, W, N, S, neon, G, lam, glowMat, mat, cloth, noiseToy, rope, platform, hideIn, THREE } from '../kit.js';

export const daycareLayout = {
  w: 44, h: 32, wallH: 4.8, panels: false,
  wallColor: 0x2a2240, headerColor: 0xe8d8a0,
  ceiling: () => T.tiles('#2a2440', '#1d1830'),
  rooms: {
    T: { name: 'Bathroom', x0: 1, z0: 1, x1: 10, z1: 7,
         floor: () => T.tiles('#d8e8ec', '#a8c0c8'), wall: ['#bfe9ff', '#ffffff', '#6a9ab8', 'panels'] },
    C: { name: 'Security Desk', short: 'Security', x0: 30, z0: 1, x1: 37, z1: 7,
         floor: () => T.tiles('#8e9aa0', '#6c777c'), wall: ['#4a3a6a', '#ffd23f', '#2a2040', 'panels'] },
    G: { name: 'Generator', x0: 39, z0: 1, x1: 42, z1: 7,
         floor: () => T.concrete(), wall: ['#4a4d55', '#f2c230', '#2b2d33', 'bricks'] },
    R: { name: "Gerald's Daycare", short: 'Daycare', x0: 1, z0: 9, x1: 42, z1: 30,
         floor: () => T.playmat(), wall: ['#ffb8d0', '#ffd23f', '#5aa86a', 'bubbles'] },
  },
  doors: [
    { a: 'T', b: 'R', x0: 5, z0: 8, x1: 6, z1: 8 },
    { a: 'C', b: 'R', x0: 33, z0: 8, x1: 34, z1: 8 },
    { a: 'G', b: 'R', x0: 40, z0: 8, x1: 41, z1: 8 },
  ],
};

export const DAYCARE_SPOTS = {
  spawn: [41.2, 18.5],
  stage: [20, 10.6],
  talk: [20, 12.9],
  desk: [33.5, 3.4],
};

// The winding ball pit, as three overlapping rectangles.
const PIT = [[12, 13, 22, 17], [18, 17, 22, 24], [22, 20, 33, 24]];

export function buildDaycare(d) {
  const P = d.place.P;
  const night = 0x9fb8ff, warm = 0xffd8a0, pink = 0xff9ab8;

  // ── The Bathroom: stalls, little sinks, a fuse
  for (let k = 0; k < 4; k++) {
    const x = 1.6 + k * 1.8;
    d.block(x + 0.9, 2.2, 0.06, 2.4, 1.7, 0x7fd0f0);
    d.block(x + 0.45, 1.7, 0.36, 0.5, 0.36, mat(0xf4f6f8, { rough: 0.2 }), { solid: false });
  }
  for (let k = 0; k < 4; k++) d.block(2.2 + k * 1.4, 7.6, 0.6, 0.5, 0.65, mat(0xf4f6f8, { rough: 0.2 }));
  d.hideSpot('curtain', 9.3, 4.6, 'west', { color: 0x7fd0f0 });
  d.item('fuse', 'fuse1', 8.6, 2.0, 0.5);
  d.lamp(5.5, 4.5, 3.6, 0xcfe8ff, 1.2, { distance: 8, room: 'T', flicker: true });

  // ── Gerald's Stage
  const stage = mat(0x5b2a86, { rough: 0.5 });
  d.block(20, 10.6, 10, 3.2, 0.5, stage, { solid: false, nav: false });
  const sa = P(15, 9), sb = P(25, 12.2);
  d.place.raised.push({ x0: sa.x, z0: sa.z, x1: sb.x, z1: sb.z, h: 0.5 });
  for (const x of [14.6, 25.4]) d.block(x, 10.6, 0.8, 3.2, 3.6, cloth(0xc0262d), { solid: true });
  neon(d, "GERALD'S STAGE", 20, 9.04, 3.4, 4.6, 0.6, 'south', 0xffd23f, pink);
  // the drum kit he plays (it's Gerald), at the back
  for (const [x, r] of [[18.4, 0.35], [21.6, 0.35], [20, 0.5]]) d.mesh(G.cyl, mat(0xc0262d, { rough: 0.3 }), d.group, { p: [P(x, 9.8).x, 0.85, P(x, 9.8).z], s: [r, 0.5, r] });
  d.lamp(20, 11.5, 4.2, pink, 1.0, { distance: 9, room: 'R' });

  // ── The Daycare Exit: bars over it. The Security Badge opens it.
  d.exitDoor(27, 9.45, 'south', { w: 2.0, label: 'EXIT' });
  const bars = d.anchor(27, 9.05, 'south', 0);
  d.exitBars = [];
  for (let k = 0; k < 9; k++) d.exitBars.push(d.mesh(G.cyl, mat(0x8a9098, { metal: 0.8, rough: 0.3 }), bars, { p: [-0.96 + k * 0.24, 1.25, 0.1], s: [0.03, 2.5, 0.03], still: false }));
  for (const y of [0.3, 2.3]) d.exitBars.push(d.mesh(G.box, mat(0x8a9098, { metal: 0.8 }), bars, { p: [0, y, 0.1], s: [2.1, 0.06, 0.05], still: false }));
  neon(d, 'DAYCARE EXIT\n🟨 SECURITY BADGE', 27, 9.04, 3.55, 2.6, 0.62, 'south', 0xffd23f, 0xffd23f);

  // ── The Security Desk: the badge is in the drawer
  d.counter(33.5, 3.4, 3.2, 0.9, 1.0, 0x3a3a48, 0x8a8a98);
  for (const x of [32.4, 34.6]) {
    const g = d.anchor(x, 2.9, 'south', 1.0);
    d.mesh(G.box, lam(0x111111), g, { p: [0, 0.25, 0], s: [0.7, 0.5, 0.08] });
    d.mesh(G.plane, glowMat(0x1a3a2a, 0.2), g, { p: [0, 0.25, 0.045], s: [0.6, 0.42, 1], shadow: false });
  }
  d.label('SECURITY', 33.5, 3.88, 1.25, 1.4, 0.26, 'south', { bg: '#2a2040', fg: '#ffd23f', glow: '#ffd23f' });
  d.hideSpot('locker', 36.8, 5.6, 'west', { color: 0x3a6ab8 });
  d.savePoint(30.8, 6.0, 'east');
  d.lamp(33.5, 4.5, 3.6, 0xffe2b0, 1.0, { distance: 8, room: 'C', flicker: true });

  // ── The Generator: five fuse slots
  d.target('generator', 40.5, 2.0, 'south', 'Put the fuses in the generator', (g) => {
    const steel = mat(0x5a6070, { metal: 0.6, rough: 0.4 });
    d.mesh(G.box, steel, g, { p: [0, 0.75, 0], s: [2.6, 1.5, 1.2] });
    d.mesh(G.box, lam(0xf2c230), g, { p: [0, 1.25, 0.61], s: [1.9, 0.3, 0.02] });
    d.genFuses = [0, 1, 2, 3, 4].map((k) => {
      d.mesh(G.box, lam(0x111111), g, { p: [-0.84 + k * 0.42, 0.72, 0.61], s: [0.3, 0.2, 0.02] });
      const m = d.mesh(G.cyl, glowMat(0xfff4c8, 0.4), g, { p: [-0.84 + k * 0.42, 0.72, 0.63], s: [0.06, 0.24, 0.06], r: [0, 0, Math.PI / 2], still: false });
      m.visible = false;
      return m;
    });
  });
  d.place.addBlock(39.2, 1.4, 41.8, 2.6, 1.5);
  d.label('GENERATOR', 40.5, 2.62, 1.75, 1.4, 0.3, 'south', { bg: '#2b2d33', fg: '#f2c230', glow: '#f2c230' });
  d.lamp(40.5, 5, 3.6, 0xffe2b0, 0.9, { distance: 7, room: 'G', flicker: true });

  // ── The Ball Pit, winding through the middle
  for (const [x0, z0, x1, z1] of PIT) {
    const a = P(x0, z0), b = P(x1, z1);
    d.place.slowZones.push({ x0: a.x, z0: a.z, x1: b.x, z1: b.z });
    d.balls(x0 + 0.15, z0 + 0.15, x1 - 0.15, z1 - 0.15, Math.round((x1 - x0) * (z1 - z0) * 4.2));
    // a padded rim (just a rim: you wade in over it)
    const rim = mat(0x2a4fa0, { rough: 0.5 });
    d.block((x0 + x1) / 2, z0, x1 - x0, 0.2, 0.35, rim, { solid: false, nav: false });
    d.block((x0 + x1) / 2, z1, x1 - x0, 0.2, 0.35, rim, { solid: false, nav: false });
  }
  d.label('BALL PIT', 17, 12.9, 1.4, 1.6, 0.34, 'north', { bg: '#2a4fa0', fg: '#ffd23f', glow: '#ff3fa4' });
  d.item('fuse', 'fuse2', 20.2, 21.2, 0.55);

  // ── The climbing frame: a grid of bars, with a platform on top (climb the rope)
  const bar = mat(0xd11f2a, { rough: 0.4, metal: 0.4 });
  for (let x = 3; x <= 9; x += 2) for (let z = 20; z <= 27; z += 2.33) d.block(x, z, 0.1, 0.1, 2.3, bar, { solid: false, nav: false });
  for (let x = 3; x <= 9; x += 2) d.block(x, 23.5, 0.08, 7, 0.08, bar, { y: 1.2, solid: false, nav: false });
  for (let z = 20; z <= 27; z += 2.33) d.block(6, z, 6, 0.08, 0.08, bar, { y: 1.2, solid: false, nav: false });
  platform(d, 6, 23.5, 5.4, 6.4, 2.3, 0xffd23f);
  rope(d, 'rope1', 9.7, 21.6, 8.2, 22.0, 2.3, 'east');
  d.item('fuse', 'fuse3', 5.0, 25.0, 2.3 + 0.5);
  d.label('CLIMBING FRAME', 6, 19.95, 2.8, 2.2, 0.32, 'north', { bg: '#d11f2a', fg: '#fff', glow: '#ffd23f' });
  d.hideSpot('tube', 6, 28.6, 'east', { color: 0x2f8f3a });

  // ── The cubby tower by the pool, with a rope up to its top
  platform(d, 24, 27.6, 2.6, 2.6, 2.8, 0x3ec1d3);
  for (let k = 0; k < 3; k++) d.block(24, 28.6, 2.4, 0.5, 0.6, lam([0xc0262d, 0x2a4fa0, 0xffd23f][k]), { y: 0.3 + k * 0.8, solid: false, nav: false });
  rope(d, 'rope2', 25.9, 26.0, 24.6, 27.0, 2.8, 'east');
  d.item('fuse', 'fuse5', 23.6, 28.0, 2.8 + 0.5);

  // ── The Pool: a shallow kiddie pool (you splash through slowly), a fuse in it
  d.patch(32.5, 27.5, 11, 4.4, 0x3a90c8, { y: 0.03 });
  d.patch(32.5, 27.5, 10.4, 3.9, 0x5ab8e8, { y: 0.05 });
  for (const [x, z, w, dd] of [[32.5, 25.2, 11.2, 0.2], [32.5, 29.8, 11.2, 0.2], [26.9, 27.5, 0.2, 4.6], [38.1, 27.5, 0.2, 4.6]]) {
    d.block(x, z, w, dd, 0.35, mat(0xf4f1ea), { solid: false, nav: false });
  }
  const qa = P(27, 25.3), qb = P(38, 29.7);
  d.place.slowZones.push({ x0: qa.x, z0: qa.z, x1: qb.x, z1: qb.z });
  d.label('POOL', 32.5, 25.05, 1.25, 1.2, 0.3, 'north', { bg: '#3a90c8', fg: '#fff', glow: '#ffd23f' });
  d.item('fuse', 'fuse4', 36.6, 28.4, 0.5);

  // ── The Distraction (and two more toys like it)
  noiseToy(d, 'toy1', 36.2, 22.6, 'west');
  noiseToy(d, 'toy2', 12.6, 26.8, 'east');
  noiseToy(d, 'toy3', 10.5, 13.0, 'south');
  d.label('🎵 DISTRACTION', 36.2, 21.6, 1.6, 1.8, 0.3, 'south', { bg: '#2a0e33', fg: '#ff3fa4', glow: '#5ad1ff' });

  // ── Round play tables (the circles on the map), hiding spots, save boxes
  for (const [x, z] of [[6.5, 15], [14.5, 27.2]]) {
    d.mesh(G.cyl, mat(0x7ad151, { rough: 0.5 }), d.group, { p: [P(x, z).x, 0.5, P(x, z).z], s: [1.1, 0.06, 1.1] });
    d.mesh(G.cyl, mat(0xffd23f, { rough: 0.5 }), d.group, { p: [P(x, z).x, 0.25, P(x, z).z], s: [0.12, 0.5, 0.12] });
    d.place.addBlock(x - 0.9, z - 0.9, x + 0.9, z + 0.9, 0.55);
  }
  d.hideSpot('toybox', 2.2, 11.2, 'east', { color: 0xa970ff });
  d.hideSpot('toybox', 28.6, 13.2, 'south', { color: 0xff9a1f });
  hideIn(d, 'shelf', 41.4, 26.8, 'west', { color: 0xffd23f });
  d.hideSpot('curtain', 14.0, 13.2, 'south', { color: 0xc0262d });
  d.savePoint(41.2, 22.2, 'west');
  d.savePoint(11.2, 29.0, 'north');
  d.savePoint(2.2, 18.6, 'east');

  // ── The way you came in (from Sushi's Pizzaplex): it locked behind you
  const back = d.anchor(42.45, 18.5, 'west', 0);
  d.mesh(G.box, mat(0x6a7078, { metal: 0.5, rough: 0.4 }), back, { p: [0, 1.05, 0.47], s: [1.6, 2.1, 0.06] });
  neon(d, "← SUSHI'S PIZZAPLEX\n(LOCKED)", 42.96, 18.5, 2.75, 2.2, 0.5, 'west', 0xff3b30, 0xff3b30);

  // ── The lights: night-lights now; the generator brings up the rest
  d.night = [];
  for (const [x, z] of [[8, 12], [17, 20], [27, 16], [36, 13], [8, 27], [32, 27], [19, 27]]) {
    d.night.push(d.lamp(x, z, 0.4, night, 0.9, { distance: 5.5, room: 'R' }));
  }
  d.power = [];
  for (const [x, z] of [[8, 14], [20, 17], [30, 15], [38, 20], [10, 26], [24, 23], [33, 27]]) {
    const l = d.hanging(x, z, warm, 1.6);
    l.off = true;
    d.power.push(l);
  }
}

export { E, W, N, S };
