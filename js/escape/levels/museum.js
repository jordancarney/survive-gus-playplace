// Level 6 — the City Museum.
//
// The Great Hall down the middle with a giant T. rex skeleton; the Dinosaur Hall and the
// Knights Hall on one side, the Egypt Room and the Space Room on the other. The way out is the
// golden door, and its lock wants three gems — one from the dinosaurs, one from Egypt, one
// from space. Every gem you take wakes up one of the statues, and the statues only move when
// you aren't looking. A guard robot walks the halls too.
import * as THREE from 'three';
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth } from '../../models.js';
import { sfx } from '../../audio.js';
import { buildStatue, buildCopBot } from '../cast.js';

const layout = {
  w: 46, h: 34, wallH: 5, panels: false,
  wallColor: 0x2a2620, headerColor: 0xc9a227,
  ceiling: () => T.tiles('#3a3630', '#2a2620'),
  rooms: {
    G: { name: 'Great Hall', x0: 14, z0: 1, x1: 31, z1: 32,
         floor: () => T.checker('#d8d0c0', '#8a8070'), wall: ['#d8d0c0', '#c9a227', '#6a6050', 'panels'] },
    D: { name: 'Dinosaur Hall', short: 'Dinos', x0: 1, z0: 1, x1: 12, z1: 20,
         floor: () => T.wood('#7a5a3a'), wall: ['#c8b890', '#7a5a3a', '#5a4a2a', 'stripes'] },
    K: { name: 'Knights Hall', short: 'Knights', x0: 1, z0: 22, x1: 12, z1: 32,
         floor: () => T.tiles('#8a8478', '#6a6458'), wall: ['#6a5a4a', '#c0262d', '#3a2a20', 'bricks'] },
    X: { name: 'Egypt Room', short: 'Egypt', x0: 33, z0: 1, x1: 44, z1: 15,
         floor: () => T.tiles('#d8c08a', '#b09a6a'), wall: ['#d8c08a', '#2a4fa0', '#8a6a3a', 'bricks'] },
    S: { name: 'Space Room', short: 'Space', x0: 33, z0: 17, x1: 44, z1: 32,
         floor: () => T.carpet('#0a0a24'), wall: ['#0a0a24', '#a970ff', '#05051a', 'stars'] },
  },
  doors: [
    { a: 'D', b: 'G', x0: 13, z0: 8, x1: 13, z1: 10 },
    { a: 'K', b: 'G', x0: 13, z0: 26, x1: 13, z1: 28 },
    { a: 'X', b: 'G', x0: 32, z0: 6, x1: 32, z1: 8 },
    { a: 'S', b: 'G', x0: 32, z0: 24, x1: 32, z1: 26 },
    { a: 'D', b: 'K', x0: 5, z0: 21, x1: 7, z1: 21 },
    { a: 'X', b: 'S', x0: 38, z0: 16, x1: 39, z1: 16 },
  ],
};

function bones(d, parent, list, m) {
  for (const [geo, p, s, r] of list) d.mesh(geo, m, parent, { p, s, r: r || [0, 0, 0] });
}

function build(d) {
  const P = d.place.P;
  const bone = mat(0xe8dcc0, { rough: 0.7 });
  const spot = 0xfff0c8;

  // ── The Great Hall: the T. rex, the ticket desk, velvet ropes, the golden door
  // side-on to the doors, so you see the whole of him as you come in
  d.block(22.5, 15.5, 12, 4.4, 0.45, mat(0x5a5048), { solid: true });
  const rex = d.anchor(22.5, 15.5, 'east', 0.45);
  const spine = [];
  for (let k = 0; k < 16; k++) {
    const t = k / 15;
    // the tail sweeps up to the hips, the back runs level, and the neck rises to the skull
    const z = -5.5 + t * 9.5;
    const y = 1.0 + 1.8 * Math.min(1, t / 0.45) ** 0.7 + 0.9 * Math.max(0, (t - 0.65) / 0.35);
    spine.push([G.sphere, [0, y, z], [0.18 - t * 0.04 + (t > 0.3 && t < 0.7 ? 0.06 : 0), 0.16, 0.2]]);
  }
  bones(d, rex, spine, bone);
  for (let k = 0; k < 6; k++) {
    const z = -0.5 + k * 0.55;
    d.mesh(new THREE.TorusGeometry(0.62 - Math.abs(k - 2.5) * 0.06, 0.04, 6, 16, Math.PI), bone, rex, { p: [0, 2.6, z], r: [0, 0, Math.PI] });
  }
  // the skull, open-jawed, with teeth
  const skull = new THREE.Group();
  skull.position.set(0, 3.75, 4.35);
  rex.add(skull);
  bones(d, skull, [[G.box, [0, 0.15, 0.4], [0.55, 0.45, 1.1]], [G.box, [0, -0.25, 0.45], [0.48, 0.12, 1.0], [0.25, 0, 0]]], bone);
  for (let k = 0; k < 7; k++) for (const sx of [-1, 1]) d.mesh(G.cone, lam(0xf4f0e0), skull, { p: [sx * 0.2, -0.12, 0.05 + k * 0.13], s: [0.03, 0.12, 0.03], r: [Math.PI, 0, 0] });
  for (const sx of [-1, 1]) d.mesh(G.sphere, glowMat(0xff3b30, 0.15), skull, { p: [sx * 0.2, 0.25, 0.3], s: [0.06, 0.06, 0.06], shadow: false });
  // legs and little arms
  for (const sx of [-1, 1]) {
    bones(d, rex, [
      [G.cyl, [sx * 0.55, 2.0, 0.4], [0.16, 1.4, 0.16], [0.3, 0, 0]],
      [G.cyl, [sx * 0.55, 0.8, 0.1], [0.12, 1.4, 0.12], [-0.35, 0, 0]],
      [G.box, [sx * 0.55, 0.06, 0.4], [0.3, 0.1, 0.7]],
      [G.cyl, [sx * 0.35, 2.8, 2.7], [0.04, 0.5, 0.04], [0.8, 0, 0]],
    ], bone);
  }
  d.label('TYRANNOSAURUS REX', 22.5, 17.74, 0.8, 2.6, 0.36, 'south', { bg: '#2a2620', fg: '#c9a227', glow: '#c9a227' });
  d.lamp(22.5, 15, 4.6, spot, 2.4, { distance: 12, room: 'G' });
  for (const z of [9, 22]) for (const x of [19.6, 25.4]) {
    d.block(x, z, 0.12, 0.12, 1.0, mat(0xc9a227, { metal: 0.8 }), { solid: true });
  }
  d.counter(22.5, 30, 3.6, 0.9, 1.05, 0x5a3a24, 0xe8dcc0);
  d.hideSpot('counter', 26.0, 30.0, 'east', { color: 0x5a3a24 }).name = 'Hide behind the ticket desk';
  d.label('CITY MUSEUM', 22.5, 32.96, 3.6, 3.6, 0.6, 'north', { bg: '#2a2620', fg: '#c9a227', glow: '#c9a227' });
  d.exitDoor(22.5, 1.6, 'south', { w: 2.4, label: 'EXIT' });
  d.target('lock', 25.4, 1.12, 'south', 'Put the 3 gems in the golden lock', (g) => {
    d.mesh(G.box, mat(0xc9a227, { metal: 0.9, rough: 0.25 }), g, { p: [0, 1.35, -0.06], s: [0.8, 0.7, 0.1] });
    d.lockGems = [-0.22, 0, 0.22].map((x) => {
      d.mesh(G.cyl, lam(0x1a1a1a), g, { p: [x, 1.35, 0], s: [0.08, 0.02, 0.08], r: [Math.PI / 2, 0, 0], shadow: false });
      const gem = d.mesh(new THREE.OctahedronGeometry(0.07), glowMat(0xa970ff, 0.5), g, { p: [x, 1.35, 0.03], still: false, shadow: false });
      gem.visible = false;
      return gem;
    });
  }, { reach: 1.4 });
  d.label('THE GOLDEN DOOR', 22.5, 1.04, 3.3, 3.0, 0.45, 'south', { bg: '#c9a227', fg: '#2a2620', glow: '#fff2a0' });
  d.savePoint(30.4, 31.2, 'west');
  d.lamp(22.5, 4, 4.4, spot, 1.6, { distance: 9, room: 'G' });
  d.lamp(22.5, 28, 4.4, spot, 1.4, { distance: 10, room: 'G', flicker: true });

  // ── The Dinosaur Hall: a triceratops, fossils in glass, a volcano
  d.block(6.5, 9, 4, 6, 0.45, mat(0x5a5048));
  const tri = d.anchor(6.5, 9, 'south', 0.45);
  bones(d, tri, [
    [G.sphere, [0, 1.3, 0], [0.9, 0.7, 1.6]],
    [G.sphere, [0, 1.3, 2.0], [0.7, 0.7, 0.5]],
    [G.cone, [-0.3, 1.9, 2.4], [0.08, 0.7, 0.08], [1.2, 0, 0]],
    [G.cone, [0.3, 1.9, 2.4], [0.08, 0.7, 0.08], [1.2, 0, 0]],
    [G.cone, [0, 1.3, 2.6], [0.06, 0.4, 0.06], [1.4, 0, 0]],
  ], mat(0xd8ccb0, { rough: 0.8 }));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) d.mesh(G.cyl, bone, tri, { p: [sx * 0.6, 0.45, sz * 0.9], s: [0.12, 0.9, 0.12] });
  for (const z of [3, 16]) {
    d.block(1.6, z, 0.9, 2.4, 0.9, mat(0x5a3a24));
    d.block(1.6, z, 0.8, 2.3, 0.6, mat(0xdff2ff, { rough: 0.05, metal: 0.2 }), { y: 0.9, solid: false, nav: false });
    const c = P(1.6, z, 1.15);
    d.mesh(G.sphere, glowMat(0xffb02a, 0.15), d.group, { p: [c.x, c.y, c.z], s: [0.2, 0.12, 0.3], shadow: false });
  }
  const vol = P(10, 16);
  d.mesh(G.cone, mat(0x4a3a2a, { rough: 0.9 }), d.group, { p: [vol.x, 1.0, vol.z], s: [1.4, 2.0, 1.4] });
  d.mesh(G.sphere, glowMat(0xff5a1f, 0.4), d.group, { p: [vol.x, 2.0, vol.z], s: [0.3, 0.12, 0.3], shadow: false });
  d.place.addBlock(8.8, 14.8, 11.2, 17.2, 2.0);
  d.lamp(10, 16, 2.4, 0xff7a3a, 1.4, { distance: 6, room: 'D', bulb: false });
  d.hideSpot('box', 2.2, 19.4, 'north', { color: 0x8a6a42 }).name = 'Hide in the fossil crate';
  d.item('gem', 'gem1', 2.4, 2.4, 0.6);
  d.savePoint(11.4, 19.2, 'west');
  d.lamp(6.5, 9, 4.4, spot, 1.8, { distance: 10, room: 'D' });

  // ── The Egypt Room: a pyramid, a golden sarcophagus, a tapestry to hide behind
  const pyr = P(36, 4);
  d.mesh(new THREE.ConeGeometry(1.6, 2.2, 4), mat(0xd8b870, { rough: 0.8 }), d.group, { p: [pyr.x, 1.1, pyr.z], r: [0, Math.PI / 4, 0] });
  d.place.addBlock(34.9, 2.9, 37.1, 5.1, 2.2);
  d.block(39.5, 8, 1.0, 2.4, 0.9, mat(0xc9a227, { metal: 0.8, rough: 0.3 }));
  const face = P(39.5, 6.95, 0.95);
  d.mesh(G.sphere, mat(0xd8a040, { metal: 0.8, rough: 0.3 }), d.group, { p: [face.x, face.y, face.z], s: [0.3, 0.12, 0.3] });
  d.hideSpot('curtain', 44.4, 11.5, 'west', { color: 0x2a4fa0 }).name = 'Hide behind the tapestry';
  d.label('ANCIENT EGYPT', 38.5, 1.04, 3.3, 3.0, 0.45, 'south', { bg: '#2a4fa0', fg: '#ffd23f', glow: '#ffd23f' });
  d.item('gem', 'gem2', 43.4, 2.4, 0.6);
  d.savePoint(34, 14.4, 'east');
  d.lamp(39, 8, 4.4, 0xffd890, 1.8, { distance: 10, room: 'X' });

  // ── The Space Room: planets, a rocket, a moon rock
  const planets = [[36, 21, 0.5, 0xff7a3a], [41, 22, 0.8, 0xd8b870], [37, 30, 0.4, 0x3a90c8], [42, 28, 0.6, 0xa970ff]];
  for (const [x, z, r, c] of planets) {
    const p = P(x, z, 3.6);
    d.mesh(G.sphere, glowMat(c, 0.12), d.group, { p: [p.x, p.y, p.z], s: [r, r, r], shadow: false });
    d.mesh(G.cyl, lam(0x222222), d.group, { p: [p.x, 4.3 + r * 0.2, p.z], s: [0.01, 1.4 - r, 0.01] });
  }
  const sat = P(41, 22, 3.6);
  d.mesh(G.torus, glowMat(0xe8d8a0, 0.1), d.group, { p: [sat.x, sat.y, sat.z], s: [1.2, 1.2, 0.3], r: [1.3, 0, 0], shadow: false });
  const rk = d.anchor(38.5, 25.5, 'south', 0);
  d.mesh(G.cyl, mat(0xe8ecf0, { metal: 0.4, rough: 0.3 }), rk, { p: [0, 2.0, 0], s: [0.6, 3.4, 0.6] });
  d.mesh(G.cone, mat(0xd11f2a), rk, { p: [0, 4.2, 0], s: [0.6, 1.0, 0.6] });
  for (let k = 0; k < 4; k++) d.mesh(G.box, mat(0xd11f2a), rk, { p: [Math.cos(k * Math.PI / 2) * 0.7, 0.6, Math.sin(k * Math.PI / 2) * 0.7], s: [0.1, 1.0, 0.5], r: [0, k * Math.PI / 2, 0] });
  d.mesh(G.cyl, glowMat(0x9fd8ff, 0.3), rk, { p: [0, 2.8, 0.6], s: [0.2, 0.02, 0.2], r: [Math.PI / 2, 0, 0], shadow: false });
  d.place.addBlock(37.5, 24.5, 39.5, 26.5, 4.5);
  d.hideSpot('box', 34.2, 31.4, 'north', { color: 0x6a7078 }).name = 'Hide in the rocket parts crate';
  d.item('gem', 'gem3', 43.4, 31.4, 0.6);
  d.savePoint(43.4, 18.2, 'west');
  d.lamp(38.5, 25, 4.4, 0xa970ff, 1.4, { distance: 11, room: 'S' });

  // ── The Knights Hall: suits of armour down both walls (one of them empty — get in)
  const steel = mat(0x8a8f99, { metal: 0.8, rough: 0.35 });
  for (const [x, z, f] of [[1.6, 24, 'east'], [1.6, 27, 'east'], [1.6, 30, 'east'], [11.4, 26, 'west'], [11.4, 29.5, 'west']]) {
    const g = d.anchor(x, z, f, 0);
    d.mesh(G.cyl, steel, g, { p: [0, 0.45, 0], s: [0.22, 0.9, 0.22] });
    d.mesh(G.cyl, steel, g, { p: [0, 1.25, 0], s: [0.3, 0.7, 0.24] });
    d.mesh(G.sphere, steel, g, { p: [0, 1.8, 0], s: [0.2, 0.24, 0.2] });
    d.mesh(G.box, lam(0x111111), g, { p: [0, 1.82, 0.18], s: [0.18, 0.03, 0.02], shadow: false });
    d.mesh(G.cyl, steel, g, { p: [0.35, 1.0, 0.1], s: [0.02, 1.8, 0.02] });
    d.place.addBlock(x - 0.35, z - 0.35, x + 0.35, z + 0.35, 1.9);
  }
  d.hideSpot('locker', 12.65, 23.4, 'west', { color: 0x8a8f99 }).name = 'Hide in the empty suit of armour';
  for (const x of [4, 8]) d.label('⚔', x, 32.96, 3.2, 1.0, 1.4, 'north', { bg: '#c0262d', fg: '#ffd23f', glow: '#ffd23f' });
  d.item('plushie', 'plushie', 6.5, 31.6, 0.35);
  d.savePoint(2.2, 31.4, 'east');
  d.lamp(6.5, 27, 4.0, 0xffc890, 1.4, { distance: 9, room: 'K', flicker: true });
}

const statue = (kind, start, yaw) => ({
  id: 'statue', kind: 'watcher', name: 'a Statue', build: () => buildStatue(kind), start, yaw, speed: 3.6, reach: 1.1,
});

export default {
  id: 'museum',
  name: 'The City Museum',
  layout,
  build,
  mood: { amb: 0.08, hemi: 0.07, fog: 0.03, bg: 0x06050a },
  spawn: { at: [22.5, 27.5], yaw: 0 },
  firstLine: 'Look at that dinosaur! And... were those statues always facing this way?',
  card: {
    story: 'The museum\'s side door was open a crack. Inside, a giant <b>T. rex</b> skeleton grins in the dark, and stone statues stand in every room...',
    goal: '⌚ The way out is <b>the golden door</b>, and its lock needs <b>3 gems</b>: one in the Dinosaur Hall, one in the Egypt Room and one in the Space Room.',
    watchOut: '👀 Every gem you take wakes up a <b>statue</b> — and statues only move when you <b>aren\'t looking</b>. A <b>Guard Bot</b> walks the halls too.',
    after: 'The golden door swung open — and there it was across the square, lit up like a carnival: <b>a giant pizza place with a giant platypus on the sign</b>. But first they had to get through the movie theater next door...',
  },
  quests: [
    { id: 'gems', type: 'collect', item: 'gem', count: 3, text: 'Find the 3 gems (Dinosaurs, Egypt, Space)', done: 'You have all 3 gems!' },
    { id: 'lock', type: 'use', target: 'lock', text: 'Put the gems in the golden lock (Great Hall)', done: 'The golden door is open!' },
    { id: 'exit', type: 'exit', text: 'Escape through the golden door!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    statue(0, [18, 25], Math.PI / 2),
    statue(1, [41, 12.5], Math.PI),
    statue(2, [35.5, 29.5], Math.PI / 2),
    {
      id: 'guard', name: 'the Guard Bot', build: () => buildCopBot({ guard: true }), walk: 2.0, chase: 4.0, sight: 12, hear: 9,
      roam: ['G', 'G', 'D', 'K', 'X', 'S'], start: [28, 20], wait: 8, hunt: 0.25, steps: 'gerald', stride: 1.0,
      shout: () => ['Museum is CLOSED!', 'Don\'t touch the exhibits!', 'Intruder alert!'][Math.floor(Math.random() * 3)],
    },
  ],
  tips: {
    statue: 'Statues can\'t move while you look at them. Walk backwards (S) with your eyes on it, and never turn your back!',
    guard: 'The Guard Bot walks the Great Hall a lot. Go around the edges, and hide behind the ticket desk.',
  },
  start(m) {
    const n = m.count('gem');
    for (let k = 0; k < n; k++) m.enemies[k].wake();
    if (m.done.has('lock')) openDoor(m, true);
  },
  collect(m, item) {
    if (item.kind !== 'gem') return;
    const s = m.enemies[m.count('gem') - 1];
    s.wake();
    sfx.escCreak(s.pos);
    sfx.musicBoxSting();
    setTimeout(() => m.say(m.count('gem') === 1 ? 'Jonathan... that statue just turned its head!' : 'Another one woke up! Don\'t look away from them!', 3), 1300);
  },
  use(m, t) {
    if (t.id === 'lock') openDoor(m, false);
    return true;
  },
};

function openDoor(m, quiet) {
  for (const g of m.decor.lockGems) g.visible = true;
  m.decor.exit.setOpen(true);
  if (!quiet) { sfx.escUnlock(); sfx.powerOn(); }
}
