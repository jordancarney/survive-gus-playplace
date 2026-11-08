// Level 8 — Gus's Giant Pizza Palace.
//
// Gus's first restaurant, ten years before the PlayPlace. The doors are locked until 6 AM
// and the designer wanted the wait to be ONE REAL HOUR, so the clock runs 12 AM to 6 AM in
// sixty minutes. The baby Gus's toddle about all night, giggling — four of them to start with,
// and another wakes up every hour. There are save boxes everywhere (they remember the time),
// and lots of quests on your Gus Watch, some of which upgrade it.
//
// The Dining Hall with the big stage; the Arcade; the Kitchen; the Prize Corner; the Ball Pit;
// the Party Room; the Security Office; the Lobby with the front doors and the golden Gus; and
// a twisty Play Maze.
import * as THREE from 'three';
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth, buildGus, GUS_LOOK, setEyes } from '../../models.js';
import { sfx, playMusic, stopMusic } from '../../audio.js';
import { GLOW } from '../../config.js';
import { buildBabyGus } from '../cast.js';

const layout = {
  w: 64, h: 48, wallH: 5, panels: false,
  wallColor: 0x1d1424, headerColor: 0xffd23f,
  ceiling: () => T.tiles('#2a2036', '#1d1626'),
  walls: [
    { x0: 54, z0: 32, x1: 54, z1: 42 },
    { x0: 57, z0: 36, x1: 57, z1: 46 },
    { x0: 60, z0: 32, x1: 60, z1: 42 },
  ],
  rooms: {
    D: { name: 'Dining Hall', x0: 1, z0: 1, x1: 30, z1: 22,
         floor: () => T.checker(), wall: ['#3b1a5a', '#ff3fa4', '#1d1c24', 'stars'] },
    A: { name: 'Arcade', x0: 32, z0: 1, x1: 62, z1: 14,
         floor: () => T.carpet('#120e33'), wall: ['#120e33', '#2de2e6', '#ff3fa4', 'stars'] },
    K: { name: 'Kitchen', x0: 32, z0: 16, x1: 44, z1: 30,
         floor: () => T.tiles('#dfe6e9', '#b5c0c4'), wall: ['#e8f1f2', '#ff5a5f', '#2d6a73', 'panels'] },
    P: { name: 'Prize Corner', short: 'Prizes', x0: 46, z0: 16, x1: 62, z1: 30,
         floor: () => T.carpet('#14304a'), wall: ['#ffd23f', '#ff3fa4', '#2a4fa0', 'stripes'] },
    B: { name: 'Ball Pit', x0: 1, z0: 24, x1: 18, z1: 46,
         floor: () => T.playmat(), wall: ['#3a2a7a', '#ffd23f', '#1f9fbf', 'bubbles'] },
    T: { name: 'Party Room', short: 'Party', x0: 20, z0: 24, x1: 30, z1: 34,
         floor: () => T.carpet('#3a1450'), wall: ['#ff7eb6', '#ffd23f', '#7a2a8a', 'stars'] },
    S: { name: 'Security Office', short: 'Security', x0: 20, z0: 36, x1: 30, z1: 46,
         floor: () => T.tiles('#8e9aa0', '#6c777c'), wall: ['#5a6670', '#3e4a52', '#2c3238', 'panels'] },
    L: { name: 'Lobby', x0: 32, z0: 32, x1: 50, z1: 46,
         floor: () => T.checker('#f2f0ea', '#5a1f4f'), wall: ['#5a1f4f', '#ffd23f', '#1d1c24', 'stars'] },
    M: { name: 'Play Maze', short: 'Maze', x0: 52, z0: 32, x1: 62, z1: 46,
         floor: () => T.playmat(), wall: ['#2a4fa0', '#7cff6b', '#ff9a1f', 'bubbles'] },
  },
  doors: [
    { a: 'D', b: 'A', x0: 31, z0: 6, x1: 31, z1: 8 },
    { a: 'D', b: 'K', x0: 31, z0: 18, x1: 31, z1: 20 },
    { a: 'A', b: 'P', x0: 54, z0: 15, x1: 56, z1: 15 },
    { a: 'K', b: 'P', x0: 45, z0: 22, x1: 45, z1: 24 },
    { a: 'D', b: 'B', x0: 8, z0: 23, x1: 10, z1: 23 },
    { a: 'D', b: 'T', x0: 24, z0: 23, x1: 26, z1: 23 },
    { a: 'B', b: 'T', x0: 19, z0: 28, x1: 19, z1: 30 },
    { a: 'T', b: 'S', x0: 24, z0: 35, x1: 26, z1: 35 },
    { a: 'B', b: 'S', x0: 19, z0: 40, x1: 19, z1: 42 },
    { a: 'S', b: 'L', x0: 31, z0: 40, x1: 31, z1: 42 },
    { a: 'K', b: 'L', x0: 37, z0: 31, x1: 39, z1: 31 },
    { a: 'P', b: 'L', x0: 48, z0: 31, x1: 49, z1: 31 },
    { a: 'L', b: 'M', x0: 51, z0: 38, x1: 51, z1: 40 },
    { a: 'P', b: 'M', x0: 58, z0: 31, x1: 59, z1: 31 },
  ],
};

function build(d) {
  const P = d.place.P;
  const neon = (c) => glowMat(c, 0.25);
  d.stageLamps = [];
  d.arcadeLamps = [];
  d.arcadeScreens = [];

  // ── The Dining Hall: the big stage, rows of tables, the jukebox
  d.block(15.5, 3, 16, 4, 0.7, cloth(0x5b2a86), { solid: false, nav: false });
  const sa = P(7.5, 1), sb = P(23.5, 5);
  d.place.raised.push({ x0: sa.x, z0: sa.z, x1: sb.x, z1: sb.z, h: 0.7 });
  for (const x of [7.2, 23.8]) d.block(x, 3, 0.4, 4, 4.6, cloth(0xc0262d), { solid: false, nav: false });
  d.label("GUS'S GIANT PIZZA PALACE", 15.5, 1.04, 4.0, 9, 1.0, 'south', { bg: '#5b2a86', fg: '#ffd23f', glow: '#ff3fa4' });
  for (const x of [10, 15.5, 21]) {
    const l = d.lamp(x, 6.5, 4.6, [0xff3fa4, 0xffd23f, 0x2de2e6][Math.round(x) % 3], 2.6, { distance: 10, room: 'D' });
    l.off = true;
    d.stageLamps.push(l);
  }
  d.target('stage', 25.5, 1.12, 'south', 'Turn on the stage lights', (g) => {
    d.mesh(G.box, lam(0x5a6070), g, { p: [0, 1.3, -0.04], s: [0.4, 0.5, 0.06] });
    d.stageSwitch = d.mesh(G.box, lam(0xd11f2a), g, { p: [0, 1.3, 0.0], s: [0.08, 0.2, 0.06], r: [0.5, 0, 0], still: false });
  }, { reach: 1.4 });
  for (const z of [9, 13.5, 18]) for (const x of [5, 11, 17, 23]) {
    d.table(x, z, 1.6, 1.6, 0.74, 0xd11f2a);
    for (const [sx, sz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) d.chair(x + sx * 1.05, z + sz * 1.05, 0x2a4fa0);
  }
  d.target('jukebox', 30.6, 11, 'west', 'Play a song on the jukebox', (g) => {
    d.mesh(G.box, mat(0x8a1a20, { rough: 0.3 }), g, { p: [0, 0.8, 0], s: [1.0, 1.6, 0.6] });
    d.mesh(G.cyl, neon(0xffd23f), g, { p: [0, 1.55, 0.05], s: [0.5, 0.6, 0.3], r: [Math.PI / 2, 0, 0] });
    d.jukeGlow = glowMat(0x331a00, 1);
    d.mesh(G.plane, d.jukeGlow, g, { p: [0, 0.9, 0.31], s: [0.7, 0.5, 1], shadow: false });
  });
  d.place.addBlock(30.3, 10.5, 31, 11.5, 1.6);
  for (let k = 0; k < 6; k++) {
    const c = P(4 + k * 4.5, 21.4 - (k % 2) * 3, 2.6 + (k % 3) * 0.4);
    const b = d.mesh(G.sphere, mat([0xff3fa4, 0xffd23f, 0x2de2e6][k % 3], { rough: 0.2 }), d.group, { p: [c.x, c.y, c.z], s: [0.28, 0.34, 0.28], still: false });
    d.bobbers.push({ obj: b, base: c.y, speed: 0.9, phase: k, amp: 0.1 });
  }
  d.savePoint(2.2, 21.4, 'east');
  d.savePoint(29.4, 21.4, 'west');
  for (const [x, z] of [[8, 11], [20, 11], [14, 18]]) d.lamp(x, z, 4.6, 0xffc0e0, 1.2, { distance: 11, room: 'D' });
  d.hideSpot('counter', 2.2, 12, 'east', { color: 0xd11f2a }).name = 'Hide under the tablecloth';

  // ── The Arcade: rows of games — dark until you find the switch
  const titles = ['GUS KART', 'ROBO RUN', 'SPACE PIG', 'PIZZA PAL', 'BALLOON POP', 'MAZE MANIA', 'NIGHT SHIFT', 'BABY GUS', 'PJORK JUMP', 'DINO DASH', 'STAR CATCH'];
  titles.forEach((t, i) => d.arcadeScreens.push(d.cabinet(34 + i * 2.6, 1.7, 'south', [0x2a4fa0, 0xc0262d, 0x2f8f3a, 0xa970ff][i % 4], t)));
  for (let i = 0; i < 6; i++) {
    d.arcadeScreens.push(d.cabinet(37 + i * 3.6, 7.0, 'south', [0xff9a1f, 0x3ec1d3][i % 2], titles[(i + 3) % titles.length]));
    d.arcadeScreens.push(d.cabinet(37 + i * 3.6, 8.6, 'north', [0xff3fa4, 0x7ad151][i % 2], titles[(i + 6) % titles.length]));
  }
  for (const s of d.arcadeScreens) { s.userData.base = s.color.clone(); s.color.setScalar(0.04); }
  d.target('arcade', 62.95, 11, 'west', 'Turn on the Arcade games', (g) => {
    d.mesh(G.box, lam(0x5a6070), g, { p: [0, 1.3, -0.04], s: [0.5, 0.7, 0.06] });
    d.mesh(G.box, lam(0xf2c230), g, { p: [0, 1.62, -0.0], s: [0.5, 0.06, 0.02] });
    d.arcadeLever = d.mesh(G.box, lam(0xd11f2a), g, { p: [0, 1.4, 0.06], s: [0.06, 0.3, 0.06], r: [-0.5, 0, 0], still: false });
  }, { reach: 1.4 });
  d.label('POWER', 62.96, 11, 2.2, 0.8, 0.22, 'west', { bg: '#2b2d33', fg: '#f2c230', glow: '#f2c230' });
  for (const [x, c] of [[38, 0xff3fa4], [47, 0x2de2e6], [56, 0xa970ff]]) {
    const l = d.lamp(x, 11, 4.4, c, 1.8, { distance: 11, room: 'A' });
    l.off = true;
    d.arcadeLamps.push(l);
  }
  d.lamp(47, 4, 4.6, 0x6a5aff, 0.7, { distance: 12, room: 'A', bulb: false });
  d.hideSpot('curtain', 33.4, 12.6, 'east', { color: 0x5b2a86 }).name = 'Hide in the photo booth';
  d.savePoint(61.4, 5.0, 'west');
  d.savePoint(33, 5.2, 'east');

  // ── The Kitchen: counters, the big pizza oven, the walk-in fridge
  d.counter(34.5, 16.6, 4, 1.0, 1.0, 0xc8c8c8, 0xe8e8e8);
  d.counter(42.5, 16.6, 4, 1.0, 1.0, 0xc8c8c8, 0xe8e8e8);
  d.target('oven', 38.5, 16.7, 'south', 'Bake a pizza in the oven', (g) => {
    d.mesh(G.box, mat(0x6a3a2a, { rough: 0.8 }), g, { p: [0, 1.0, 0], s: [1.8, 2.0, 1.2] });
    d.mesh(G.cyl, lam(0x1a0a05), g, { p: [0, 0.9, 0.55], s: [0.5, 0.1, 0.35], r: [Math.PI / 2, 0, 0] });
    d.ovenFire = glowMat(0x220800, 1);
    d.mesh(G.cyl, d.ovenFire, g, { p: [0, 0.85, 0.56], s: [0.42, 0.02, 0.26], r: [Math.PI / 2, 0, 0], shadow: false });
  });
  d.place.addBlock(37.6, 16.1, 39.4, 17.3, 2.0);
  d.counter(38, 23, 5, 1.6, 0.95, 0xd8d0c0, 0xe8e0d0);
  for (let k = 0; k < 3; k++) {
    const c = P(36.4 + k * 1.6, 23, 0.98);
    d.mesh(G.cyl, lam(0xf2c27a), d.group, { p: [c.x, c.y, c.z], s: [0.35, 0.02, 0.35] });
  }
  d.hideSpot('locker', 44.65, 27, 'west', { color: 0xd8dde3 }).name = 'Hide in the walk-in fridge';
  d.lamp(38, 23, 4.4, 0xfff0d8, 1.3, { distance: 11, room: 'K', flicker: true });
  d.savePoint(32.6, 26, 'east');

  // ── The Prize Corner: the counter, shelves of prizes, the claw machine
  d.counter(54, 19, 12, 0.9, 1.05, 0x2a4fa0, 0xffd23f);
  d.shelf(54, 16.4, 14, 0.6, 2.6, 'south', { wood: 0x5b2a86, books: false });
  for (let k = 0; k < 20; k++) {
    const c = P(47.6 + k * 0.67, 16.5, 0.6 + (k % 3) * 0.8);
    d.mesh(G.sphere, cloth([0x7a4a2b, 0x3a3a44, 0xa8642e, 0x1d2230, 0x5b8fc4, 0xe58f9e][k % 6]), d.group, { p: [c.x, c.y, c.z], s: [0.22, 0.24, 0.2] });
  }
  d.label('PRIZES', 54, 19.48, 1.4, 2.0, 0.3, 'south', { bg: '#ffd23f', fg: '#2a4fa0', glow: '#ff3fa4' });
  d.target('claw', 50, 29.9, 'north', 'Spend your tokens on the claw machine', (g) => {
    d.mesh(G.box, mat(0xff3fa4, { rough: 0.3 }), g, { p: [0, 0.5, 0], s: [1.2, 1.0, 0.9] });
    d.mesh(G.box, mat(0xdff2ff, { rough: 0.05, metal: 0.2 }), g, { p: [0, 1.5, 0], s: [1.1, 1.0, 0.8] });
    for (let k = 0; k < 6; k++) d.mesh(G.sphere, cloth([0xffd23f, 0x3ec1d3, 0xa970ff][k % 3]), g, { p: [-0.35 + (k % 3) * 0.35, 1.1, -0.15 + Math.floor(k / 3) * 0.3], s: [0.13, 0.13, 0.13] });
    d.mesh(G.box, mat(0xf2c230, { metal: 0.8 }), g, { p: [0, 1.85, 0], s: [0.1, 0.25, 0.1] });
  });
  d.place.addBlock(49.4, 29.45, 50.6, 30.35, 2.0);
  d.hideSpot('toybox', 61.4, 28.6, 'west', { color: 0xff3fa4 });
  d.item('plushie', 'plushie', 61.6, 17.4, 0.35);
  d.savePoint(46.8, 29.4, 'east');
  d.lamp(54, 24, 4.4, 0xffe08a, 1.4, { distance: 11, room: 'P' });

  // ── The Ball Pit
  for (const [x, z, w, dd] of [[8.5, 27, 12.2, 0.2], [8.5, 43, 12.2, 0.2], [2.5, 35, 0.2, 16]]) d.block(x, z, w, dd, 0.6, mat(0x2a4fa0));
  d.block(14.5, 29.5, 0.2, 5, 0.6, mat(0x2a4fa0));
  d.block(14.5, 40.5, 0.2, 5, 0.6, mat(0x2a4fa0));
  const ba = P(2.7, 27.2), bb = P(14.3, 42.8);
  d.place.slowZones.push({ x0: ba.x, z0: ba.z, x1: bb.x, z1: bb.z });
  d.balls(2.7, 27.2, 14.3, 42.8, 520);
  d.label('BALL PIT', 8.5, 26.85, 1.6, 2.0, 0.4, 'north', { bg: '#2a4fa0', fg: '#ffd23f', glow: '#ff3fa4' });
  d.hideSpot('tube', 17.2, 26.6, 'south', { color: 0xff9a1f }).name = 'Crawl into the play tube';
  d.savePoint(16.8, 45.2, 'north');
  d.lamp(8.5, 35, 4.4, 0x9fd8ff, 1.4, { distance: 12, room: 'B' });

  // ── The Party Room: a long table, the birthday cake, presents and party stars
  d.table(25, 29, 6, 1.4, 0.76, 0xff7eb6);
  for (let k = 0; k < 5; k++) d.chair(22.6 + k * 1.2, 30.1, 0xffd23f);
  d.target('cake', 25, 28.7, 'south', 'Light the candles on the birthday cake', (g) => {
    d.mesh(G.cyl, cloth(0xfff0f4), g, { p: [0, 0.92, 0], s: [0.35, 0.3, 0.35] });
    d.mesh(G.cyl, cloth(0xff7eb6), g, { p: [0, 1.12, 0], s: [0.25, 0.12, 0.25] });
    d.candles = [0, 1, 2, 3, 4].map((k) => {
      const a = (k / 5) * Math.PI * 2;
      d.mesh(G.cyl, lam(0x3ec1d3), g, { p: [Math.cos(a) * 0.15, 1.25, Math.sin(a) * 0.15], s: [0.015, 0.12, 0.015] });
      const f = d.mesh(G.sphere, glowMat(0xffb02a, 0.6), g, { p: [Math.cos(a) * 0.15, 1.34, Math.sin(a) * 0.15], s: [0.025, 0.04, 0.025], still: false, shadow: false });
      f.visible = false;
      return f;
    });
  }, { reach: 2.2 });
  d.cakeLight = d.lamp(25, 28.7, 1.6, 0xffb02a, 1.6, { distance: 5, room: 'T', bulb: false, flicker: true });
  d.cakeLight.off = true;
  for (const [x, z, c] of [[21, 33.4, 0xc0262d], [21.9, 33.5, 0x2a4fa0], [28.8, 24.6, 0x2f8f3a]]) d.crate(x, z, 0.6, c);
  d.hideSpot('counter', 29.4, 31.5, 'west', { color: 0xff7eb6 }).name = 'Hide under the party table';
  d.lamp(25, 29, 4.4, 0xff9ad5, 1.1, { distance: 9, room: 'T' });

  // ── The Security Office: the camera monitors, a locker
  d.table(25, 37.3, 4, 1.0, 0.76, 0x3a3d44);
  d.target('cams', 25, 36.85, 'south', 'Check the cameras on the monitors', (g) => {
    for (const x of [-1.2, 0, 1.2]) {
      d.mesh(G.box, lam(0x111111), g, { p: [x, 1.05, 0], s: [1.0, 0.6, 0.08] });
      d.mesh(G.plane, glowMat(0x2a6a3a, 0.2), g, { p: [x, 1.05, 0.045], s: [0.9, 0.5, 1], shadow: false });
    }
  });
  d.hideSpot('locker', 29.65, 45, 'west', { color: 0x5a6670 }).name = 'Hide in the guard\'s locker';
  d.savePoint(20.8, 45.3, 'east');
  d.lamp(25, 41, 4.0, 0xffe8c8, 1.1, { distance: 9, room: 'S' });

  // ── The Lobby: the front doors, the golden Gus, the wishing well
  d.exitDoor(41, 46.4, 'north', { w: 3.2, label: 'EXIT' });
  d.label('OPENS AT 6 AM', 41, 46.96, 3.4, 3.4, 0.4, 'north', { bg: '#2a0606', fg: '#ffd23f', glow: '#ff3fa4' });
  d.block(41, 38, 2.6, 2.6, 0.6, mat(0x3a2a4a));
  const gus = buildGus(GUS_LOOK);
  const gold = mat(0xd9a520, { metal: 0.9, rough: 0.28 });
  gus.root.traverse((o) => { if (o.isMesh && o.material !== gus.eyeMat) o.material = gold; });
  gus.root.scale.setScalar(1.3);
  gus.root.position.copy(P(41, 38, 0.6));
  d.group.add(gus.root);
  d.goldenGus = gus;
  setEyes(gus, 'dim');
  d.label('GUS', 41, 39.32, 0.35, 1.4, 0.3, 'south', { bg: '#5b2a86', fg: '#ffd23f', glow: '#ffd23f' });
  d.target('well', 35, 36, 'east', 'Toss a token in the wishing well', (g) => {
    d.mesh(G.cyl, mat(0x8a8478, { rough: 0.9 }), g, { p: [0, 0.4, 0], s: [0.8, 0.8, 0.8] });
    d.mesh(G.cyl, glowMat(0x3a90c8, 0.2), g, { p: [0, 0.81, 0], s: [0.65, 0.02, 0.65], shadow: false });
    for (const sx of [-1, 1]) d.mesh(G.cyl, lam(0x5a3a24), g, { p: [sx * 0.7, 1.2, 0], s: [0.05, 1.6, 0.05] });
    d.mesh(G.cone, lam(0x8a1a20), g, { p: [0, 2.15, 0], s: [1.0, 0.5, 1.0] });
  }, { reach: 2.0 });
  d.place.addBlock(34.2, 35.2, 35.8, 36.8, 1.0);
  for (const z of [34, 44]) d.block(46, z, 2.4, 0.6, 0.45, 0x5a3a24);
  d.hideSpot('box', 49.4, 45.2, 'west', { color: 0xa8805a }).name = 'Hide in the coat check';
  d.savePoint(33, 45.3, 'east');
  d.savePoint(49.4, 33.2, 'west');
  d.lamp(41, 41, 4.6, 0xffe08a, 1.6, { distance: 12, room: 'L' });

  // ── The Play Maze: a twisty snake of a maze (its walls are in the plan)
  for (const [x, z0, z1] of [[54, 32, 42], [57, 36, 46], [60, 32, 42]]) {
    const c = P(x + 0.5, (z0 + z1 + 1) / 2, 2.5);
    d.mesh(G.box, mat([0x7cff6b, 0xff9a1f, 0x3ec1d3][x % 3], { rough: 0.5 }), d.group, { p: [c.x, c.y, c.z], s: [1.06, 5, z1 - z0 + 1.06] });
  }
  d.savePoint(52.9, 33, 'south');
  d.lamp(55.5, 39, 4.4, 0x7cff6b, 1.0, { distance: 9, room: 'M' });
  d.lamp(61.5, 39, 4.4, 0xff9a1f, 1.0, { distance: 9, room: 'M' });

  // ── Things to find
  [[5, 6.5], [28.5, 20.5], [40, 11.6], [61, 4.5], [4, 45.2], [33, 29.4], [61, 25], [33.5, 33.2]]
    .forEach(([x, z], i) => d.item('token', `token${i}`, x, z, 0.5));
  [[43.4, 29.6], [16, 31], [29, 44.6], [58.5, 45], [2, 2]].forEach(([x, z], i) => d.item('slice', `slice${i}`, x, z, 0.5));
  [[21, 25], [29.4, 25], [29.4, 33.6], [24.5, 33.6]].forEach(([x, z], i) => d.item('star', `star${i}`, x, z, 1.1));
  [[15, 20.6], [50, 11.6], [52, 26], [47, 36], [17, 38], [22, 38.6]].forEach(([x, z], i) => d.item('balloon', `balloon${i}`, x, z, 1.4));
  d.item('sock', 'sock', 61.5, 33, 0.4);
}

// Four baby Gus's are up when you get here; another wakes every hour.
const BABY_SPOTS = [[10, 3.5], [13, 3.5], [18, 3.5], [21, 3.5], [11.5, 2.2], [15.5, 2.2], [19.5, 2.2], [15.5, 4.3]];
const babies = BABY_SPOTS.map(([x, z], i) => ({
  id: 'babygus', name: 'a baby Gus', build: () => buildBabyGus(i), walk: 2.1, chase: 3.8, sight: 9, hear: 7,
  roam: ['D', 'D', 'A', 'K', 'P', 'B', 'T', 'S', 'L', 'M'], start: [x, z], yaw: 0,
  wait: [12, 35, 60, 90][i] ?? 4, asleep: i >= 4, hunt: 0.15, steps: 'cranker', stride: 0.5, lose: 4,
  shout: () => ['Hee hee hee!', 'PLAY with us!', 'Found you! Hee hee!'][Math.floor(Math.random() * 3)],
}));

export default {
  id: 'pizza',
  name: "Gus's Giant Pizza Palace",
  layout,
  build,
  clock: { seconds: 3600 },     // one real hour from midnight to 6 AM, as the designer asked
  mood: { amb: 0.1, hemi: 0.09, fog: 0.025, bg: 0x07040c },
  spawn: { at: [41, 43], yaw: 0 },
  firstLine: 'The doors locked behind us! The sign says they open at 6 AM...',
  card: {
    story: 'Jonathan and Jack ran in through the doors of <b>Gus\'s Giant Pizza Palace</b> — and CLICK, the doors locked. The sign says <b>OPENS AT 6 AM</b>. On the big stage, something small is giggling...',
    goal: '⌚ <b>Survive until 6 AM</b> — that\'s one real hour, so touch every <b>save box</b> you pass (they remember the time). Your <b>Gus Watch</b> is full of quests, and some of them upgrade it!',
    watchOut: '👀 The <b>baby Gus\'s</b> toddle about all night. Four are awake now — and <b>another one wakes up every hour</b>.',
    after: 'BRRRING! Six o\'clock. The front doors clicked open, and the morning sun came pouring in.',
  },
  quests: [
    { id: 'survive', type: 'survive', text: 'Survive until 6 AM! (one real hour)', done: 'IT\'S 6 AM!' },
    { id: 'exit', type: 'exit', text: 'It\'s morning! Walk out the front doors (Lobby)' },
    { id: 'save', type: 'save', optional: true, text: 'Touch a save box (they remember the time!)' },
    { id: 'tokens', type: 'collect', item: 'token', count: 8, optional: true, text: 'Collect 8 Gus tokens', reward: 'sneak' },
    { id: 'hide', type: 'hide', optional: true, text: 'Hide from the baby Gus\'s' },
    { id: 'pizza', type: 'use', target: 'oven', optional: true, text: 'Bake a pizza in the Kitchen oven', done: 'Mmm, pizza!' },
    { id: 'arcade', type: 'use', target: 'arcade', optional: true, text: 'Turn on the Arcade games (the POWER switch on the far wall)', done: 'The Arcade is ON!' },
    { id: 'claw', type: 'use', target: 'claw', optional: true, after: 'tokens', text: 'Spend your tokens on the claw machine (Prize Corner)', reward: 'shoes', done: 'You won a prize!' },
    { id: 'slices', type: 'collect', item: 'slice', count: 5, optional: true, after: 'pizza', text: 'Find 5 golden pizza slices', reward: 'light' },
    { id: 'jukebox', type: 'use', target: 'jukebox', optional: true, after: 'arcade', text: 'Play a song on the jukebox (Dining Hall)' },
    { id: 'stage', type: 'use', target: 'stage', optional: true, after: 'jukebox', text: 'Turn on the stage lights (Dining Hall)' },
    { id: 'cams', type: 'use', target: 'cams', optional: true, after: 'save', text: 'Check the cameras in the Security Office', reward: 'beeper' },
    { id: 'stars', type: 'collect', item: 'star', count: 4, optional: true, after: 'hide', text: 'Find 4 party stars in the Party Room' },
    { id: 'cake', type: 'use', target: 'cake', optional: true, after: 'stars', text: 'Light the candles on the birthday cake (Party Room)', done: 'Happy birthday, Gus!' },
    { id: 'balloons', type: 'collect', item: 'balloon', count: 6, optional: true, after: 'stage', text: 'Catch 6 runaway balloons' },
    { id: 'maze', type: 'visit', room: 'M', at: [52.5, 39], optional: true, after: 'claw', text: 'Find your way into the Play Maze' },
    { id: 'sock', type: 'collect', item: 'sock', count: 1, optional: true, after: 'maze', text: "Find Jack's lost sock at the end of the maze" },
    { id: 'wish', type: 'use', target: 'well', optional: true, after: ['cake', 'sock'], text: 'Make a wish at the wishing well (Lobby)', reward: 'chance', done: 'Jack wished for pancakes.' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: babies,
  tips: {
    babygus: 'Baby Gus\'s giggle when they\'re close — listen! Touch every save box, finish quests to upgrade your Gus Watch, and hide when one is coming.',
  },
  start(m) {
    const d = m.decor;
    m.giggleT = 4;
    const hour = Math.floor(m.clock.t / 600);
    for (let k = 4; k < 4 + Math.min(4, hour); k++) m.enemies[k].wake();
    m.speedK = 1 + 0.05 * hour;
    // what you'd already done when you saved
    if (m.done.has('arcade')) arcadeOn(m, true);
    else { for (const s of d.arcadeScreens) s.color.setScalar(0.04); for (const l of d.arcadeLamps) l.off = true; }
    for (const l of d.stageLamps) l.off = !m.done.has('stage');
    for (const c of d.candles) c.visible = m.done.has('cake');
    d.cakeLight.off = !m.done.has('cake');
    d.ovenFire.color.set(m.done.has('pizza') ? 0xff6a1f : 0x220800).multiplyScalar(m.done.has('pizza') ? GLOW * 0.6 : 1);
    setEyes(d.goldenGus, 'dim');
    m.game.lighting.apply();
  },
  onHour(m, hour) {
    const baby = m.enemies[3 + hour];
    if (baby) {
      baby.wake();
      setTimeout(() => m.game.hud.toast(`🕐 ${hour} AM — another baby Gus woke up!`, 3), 2600);
    }
    m.speedK = 1 + 0.05 * hour;
    if (hour === 5) setTimeout(() => m.say('Just one more hour, Jonathan... we can do this!', 3), 4000);
  },
  use(m, t) {
    const d = m.decor;
    switch (t.id) {
      case 'oven':
        d.ovenFire.color.set(0xff6a1f).multiplyScalar(GLOW * 0.6);
        sfx.powerOn();
        m.say('It smells SO good...', 2.4);
        break;
      case 'arcade': arcadeOn(m, false); break;
      case 'jukebox':
        d.jukeGlow.color.set(0xffb02a).multiplyScalar(GLOW * 0.5);
        playMusic('day');
        setTimeout(() => { if (m.game.mode === 'escape' || m.game.mode === 'paused') stopMusic(); }, 30000);
        m.say('Ooh, I love this song! ...but they can hear it too.', 3);
        for (const e of m.enemies) e.alert?.(t.pos.clone());
        break;
      case 'stage':
        d.stageSwitch.rotation.x = -0.5;
        for (const l of d.stageLamps) l.off = false;
        m.game.lighting.apply();
        sfx.powerOn();
        break;
      case 'claw':
        if (m.count('token') < 8) return false;
        sfx.happy();
        m.say('You won! A little Gus with running shoes!', 3);
        break;
      case 'cams':
        sfx.camOpen();
        m.say('Your watch beeps now when a baby Gus gets close!', 3);
        break;
      case 'cake':
        for (const c of d.candles) c.visible = true;
        d.cakeLight.off = false;
        m.game.lighting.apply();
        sfx.cheer();
        break;
      case 'well':
        sfx.clink();
        setEyes(d.goldenGus, 'on');
        setTimeout(() => setEyes(d.goldenGus, 'dim'), 1500);
        break;
    }
    return true;
  },
  questDone(m, q) {
    if (q.id !== 'survive') return;
    // 6 AM: the babies fall asleep where they stand, and the doors open
    for (const e of m.enemies) { e.state = 'off'; setEyes(e.rig, 'off'); }
    m.decor.exit.setOpen(true);
    sfx.sixAM();
    setTimeout(() => sfx.cheer(), 1800);
    m.game.lighting.setEscape(m.decor, { ...m.def.mood, amb: 0.3, hemi: 0.3, fog: 0.01 });
    setTimeout(() => m.say('It\'s 6 AM!! The doors are OPEN! Let\'s go home!', 3.5), 2000);
  },
  update(m, dt) {
    m.giggleT -= dt;
    if (m.giggleT > 0) return;
    m.giggleT = 3 + Math.random() * 4;
    let best = null, bd = 18;
    for (const e of m.enemies) {
      if (!e.dangerous) continue;
      const d = e.distToPlayer();
      if (d < bd) { bd = d; best = e; }
    }
    if (best) sfx.escGiggle(best.pos);
  },
};

function arcadeOn(m, quiet) {
  const d = m.decor;
  for (const s of d.arcadeScreens) s.color.copy(s.userData.base);
  for (const l of d.arcadeLamps) l.off = false;
  if (d.arcadeLever) d.arcadeLever.rotation.x = 0.5;
  m.game.lighting.apply();
  if (!quiet) { sfx.powerOn(); setTimeout(() => sfx.musicBoxSting(), 800); }
}
