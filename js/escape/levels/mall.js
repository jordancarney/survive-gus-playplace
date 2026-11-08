// Level 5 — Sunnyvale Mall.
//
// A long Center Court with a fountain down the middle; the Toy Store, the Pet Store, the Candy
// Shop and the Shoe Store along one side; the Food Court, the Security Office and the Arcade
// along the other. The big gate at the end is locked, and every store has one of its keys.
// Two mall cop robots are on patrol.
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth } from '../../models.js';
import { sfx } from '../../audio.js';
import { buildCopBot } from '../cast.js';

const layout = {
  w: 52, h: 38, wallH: 4.5, panels: false,
  wallColor: 0x24242c, headerColor: 0xd8d0c0,
  ceiling: () => T.tiles('#3a3a44', '#2a2a32'),
  rooms: {
    C: { name: 'Center Court', x0: 1, z0: 13, x1: 50, z1: 23,
         floor: () => T.tiles('#d8d0c0', '#b0a898'), wall: ['#d8d0c0', '#3ec1d3', '#6a6a72', 'panels'] },
    T: { name: 'Toy Store', short: 'Toys', x0: 1, z0: 1, x1: 11, z1: 11,
         floor: () => T.checker('#ffe9a0', '#ff7eb6'), wall: ['#ffe9a0', '#ff3fa4', '#3a6ab8', 'stars'] },
    P: { name: 'Pet Store', short: 'Pets', x0: 13, z0: 1, x1: 23, z1: 11,
         floor: () => T.tiles('#d8e8c8', '#a8b898'), wall: ['#d8f0c8', '#2f8f3a', '#6a8a5a', 'bubbles'] },
    Y: { name: 'Candy Shop', short: 'Candy', x0: 25, z0: 1, x1: 36, z1: 11,
         floor: () => T.checker('#fff0f8', '#ff9ab8'), wall: ['#ffd8e8', '#ff3fa4', '#a970ff', 'stripes'] },
    S: { name: 'Shoe Store', short: 'Shoes', x0: 38, z0: 1, x1: 50, z1: 11,
         floor: () => T.wood('#8a6a42'), wall: ['#e8e0d0', '#2a4fa0', '#5a5a6a', 'panels'] },
    F: { name: 'Food Court', short: 'Food', x0: 1, z0: 25, x1: 23, z1: 36,
         floor: () => T.checker('#f2f0ea', '#c0262d'), wall: ['#fff0d0', '#ff9a1f', '#c0262d', 'stripes'] },
    Q: { name: 'Security Office', short: 'Security', x0: 25, z0: 25, x1: 33, z1: 36,
         floor: () => T.tiles('#8e9aa0', '#6c777c'), wall: ['#5a6670', '#3e4a52', '#2c3238', 'panels'] },
    A: { name: 'Arcade', x0: 35, z0: 25, x1: 50, z1: 36,
         floor: () => T.carpet('#120e33'), wall: ['#120e33', '#2de2e6', '#ff3fa4', 'stars'] },
  },
  doors: [
    { a: 'T', b: 'C', x0: 5, z0: 12, x1: 7, z1: 12 },
    { a: 'P', b: 'C', x0: 17, z0: 12, x1: 19, z1: 12 },
    { a: 'Y', b: 'C', x0: 29, z0: 12, x1: 31, z1: 12 },
    { a: 'S', b: 'C', x0: 43, z0: 12, x1: 45, z1: 12 },
    { a: 'F', b: 'C', x0: 10, z0: 24, x1: 14, z1: 24 },
    { a: 'Q', b: 'C', x0: 28, z0: 24, x1: 30, z1: 24 },
    { a: 'A', b: 'C', x0: 41, z0: 24, x1: 44, z1: 24 },
  ],
};

function build(d) {
  const P = d.place.P;
  const sign = (text, x, bg, fg, glow) => d.label(text, x, 13.04, 3.5, 3.2, 0.7, 'south', { bg, fg, glow });

  // ── Center Court: the fountain, benches, plants, a stopped escalator, moonlight from above
  const fc = P(25.5, 18);
  d.mesh(G.cyl, mat(0xc8c0b0, { rough: 0.6 }), d.group, { p: [fc.x, 0.3, fc.z], s: [2.6, 0.6, 2.6] });
  d.mesh(G.cyl, glowMat(0x3a90c8, 0.15), d.group, { p: [fc.x, 0.61, fc.z], s: [2.4, 0.02, 2.4], shadow: false });
  d.mesh(G.cyl, mat(0xc8c0b0), d.group, { p: [fc.x, 1.2, fc.z], s: [0.3, 1.8, 0.3] });
  d.mesh(G.sphere, glowMat(0x9fd8ff, 0.3), d.group, { p: [fc.x, 2.2, fc.z], s: [0.35, 0.25, 0.35], shadow: false });
  d.place.addBlock(23.1, 15.6, 27.9, 20.4, 0.6);
  for (const [x, z] of [[12, 14.2], [36, 14.2], [12, 21.8], [36, 21.8]]) d.block(x, z, 2.2, 0.6, 0.45, 0x5a3a24);
  for (const [x, z] of [[2.5, 21], [48.5, 14.5], [20, 21.8], [32, 14.2]]) d.plant(x, z);
  const esc = d.anchor(42, 18, 'east', 0);
  d.mesh(G.box, mat(0x6a7078, { metal: 0.6 }), esc, { p: [0, 1.4, 0], s: [1.4, 0.3, 6], r: [-0.45, 0, 0] });
  for (const sx of [-1, 1]) d.mesh(G.box, lam(0x1a1a1a), esc, { p: [sx * 0.7, 1.8, 0], s: [0.08, 0.8, 6], r: [-0.45, 0, 0] });
  d.place.addBlock(39.5, 17.2, 44.5, 18.8, 2.5);
  d.label('FOOD COURT ↓', 12, 23.96, 3.6, 2.4, 0.5, 'north', { bg: '#c0262d', fg: '#fff', glow: '#ffd23f' });
  d.exitDoor(50.4, 18, 'west', { w: 3.2, label: 'EXIT' });
  d.label('MAIN GATE', 50.96, 18, 3.6, 2.4, 0.5, 'west', { bg: '#2a2c31', fg: '#ffd23f', glow: '#ffd23f' });
  for (const x of [6, 16, 25.5, 35, 45]) d.lamp(x, 18, 4.2, 0x9fb8ff, 1.4, { distance: 11, room: 'C', bulb: false });
  d.mesh(G.plane, glowMat(0x2a3a6a, 0.25), d.group, { p: [fc.x, 4.48, fc.z], s: [8, 5, 1], r: [Math.PI / 2, 0, 0], shadow: false });
  d.savePoint(2.4, 14.2, 'east');
  d.savePoint(48.6, 22.2, 'west');

  // ── The Toy Store
  sign('TOY TOWN', 6, '#ff3fa4', '#fff', '#ffd23f');
  for (const z of [4, 7.5]) {
    d.shelf(6, z, 7, 0.8, 1.4, 'south', { wood: 0xffd23f, books: false });
    for (let k = 0; k < 12; k++) {
      const c = P(2.8 + k * 0.55, z, 1.55 + (k % 2) * 0.1);
      d.mesh(k % 3 ? G.box : G.sphere, lam([0xc0262d, 0x2a4fa0, 0x2f8f3a, 0xa970ff][k % 4]), d.group, { p: [c.x, c.y, c.z], s: [0.18, 0.2, 0.18] });
    }
  }
  const bear = P(10, 2.4);
  d.mesh(G.sphere, cloth(0x8a5a32), d.group, { p: [bear.x, 0.9, bear.z], s: [0.7, 0.8, 0.6] });
  d.mesh(G.sphere, cloth(0x8a5a32), d.group, { p: [bear.x, 1.9, bear.z], s: [0.45, 0.42, 0.42] });
  for (const sx of [-1, 1]) d.mesh(G.sphere, cloth(0x8a5a32), d.group, { p: [bear.x + sx * 0.32, 2.3, bear.z], s: [0.15, 0.15, 0.1] });
  d.place.addBlock(9.3, 1.7, 10.7, 3.1, 2.4);
  d.hideSpot('toybox', 2.4, 10.2, 'north', { color: 0x2a4fa0 });
  d.item('bag', 'key1', 2.4, 2.2, 0.6);
  d.lamp(6, 6, 3.6, 0xffb3d9, 1.3, { distance: 9, room: 'T' });

  // ── The Pet Store: cages, fish tanks, a big dog house
  sign('PET PALACE', 18, '#2f8f3a', '#fff', '#ffd23f');
  for (let k = 0; k < 4; k++) {
    const x = 14.5 + k * 2.2;
    d.block(x, 1.6, 1.8, 0.9, 1.2, mat(0x8a8f99, { metal: 0.6 }));
    for (let b = 0; b < 6; b++) d.block(x - 0.75 + b * 0.3, 2.06, 0.03, 0.03, 0.9, mat(0x333333, { metal: 0.8 }), { y: 1.2, solid: false, nav: false });
  }
  for (const z of [5, 7.5]) {
    d.block(23.55, z, 0.8, 2.0, 0.9, 0x3a3a3a);
    d.block(23.55, z, 0.7, 1.9, 0.7, glowMat(0x3a90c8, 0.25), { y: 0.9, solid: false, nav: false });
  }
  d.hideSpot('box', 14.6, 9.6, 'north', { color: 0xc0262d }).name = 'Hide in the big dog house';
  d.item('bag', 'key2', 21.6, 10.2, 0.6);
  d.lamp(18, 6, 3.6, 0xb8ffb0, 1.0, { distance: 9, room: 'P', flicker: true });

  // ── The Candy Shop: jars of sweets, gumball machines, the counter
  sign('SWEET TREATS', 30.5, '#ff9ab8', '#5b2a86', '#ff3fa4');
  for (const z of [4, 7]) {
    d.counter(30.5, z, 8, 0.8, 1.0, 0xff9ab8, 0xffffff);
    for (let k = 0; k < 10; k++) {
      const c = P(27 + k * 0.78, z, 1.2);
      d.mesh(G.sphere, glowMat([0xff3fa4, 0xffd23f, 0x3ec1d3, 0x7ad151, 0xa970ff][k % 5], 0.12), d.group, { p: [c.x, c.y, c.z], s: [0.18, 0.2, 0.18], shadow: false });
    }
  }
  for (const x of [26, 35.6]) {
    d.block(x, 10.4, 0.4, 0.4, 0.8, mat(0xd11f2a));
    const c = P(x, 10.4, 1.1);
    d.mesh(G.sphere, mat(0xdff2ff, { rough: 0.05 }), d.group, { p: [c.x, c.y, c.z], s: [0.3, 0.3, 0.3] });
  }
  d.hideSpot('counter', 33.5, 1.7, 'south', { color: 0xff9ab8 }).name = 'Hide behind the candy counter';
  d.item('bag', 'key3', 35.6, 2.2, 0.6);
  d.savePoint(26, 2.2, 'south');
  d.lamp(30.5, 5.5, 3.6, 0xffc8e0, 1.2, { distance: 9, room: 'Y' });

  // ── The Shoe Store: racks of shoes, benches, a tower of shoe boxes
  sign('FAST FEET', 44, '#2a4fa0', '#fff', '#ffd23f');
  for (const z of [3, 6]) {
    d.shelf(44, z, 9, 0.6, 1.6, 'south', { wood: 0xd8d0c0, books: false });
    for (let k = 0; k < 14; k++) {
      const c = P(40 + k * 0.6, z + 0.32, 0.4 + (k % 3) * 0.5);
      d.mesh(G.box, lam([0xffffff, 0xc0262d, 0x111111, 0x3ec1d3][k % 4]), d.group, { p: [c.x, c.y, c.z], s: [0.14, 0.1, 0.3] });
    }
  }
  d.block(44, 9, 3, 0.5, 0.45, 0x5a3a24);
  d.hideSpot('box', 49.4, 10.2, 'north', { color: 0xd8b880 }).name = 'Hide in the giant shoe box';
  d.item('bag', 'key4', 39, 10.2, 0.6);
  d.lamp(44, 6, 3.6, 0xe8f0ff, 1.1, { distance: 9, room: 'S' });

  // ── The Food Court: tables, and the counters of the shops that sell food
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    const x = 4 + c * 5, z = 28 + r * 4;
    d.table(x, z, 1.4, 1.4, 0.72, 0xe8e0d0);
    for (const [sx, sz] of [[-1, 0], [1, 0]]) d.chair(x + sx * 1.0, z + sz, 0xff9a1f);
  }
  d.counter(12, 36.4, 14, 0.8, 1.05, 0xc0262d, 0xe8e0d0);
  d.label('PIZZA · BURGERS · TACOS', 12, 36.96, 2.6, 6, 0.5, 'north', { bg: '#c0262d', fg: '#ffd23f', glow: '#ffd23f' });
  d.hideSpot('counter', 2.4, 33.2, 'east', { color: 0xc0262d }).name = 'Hide under the hot dog stand';
  d.savePoint(22.4, 35.4, 'west');
  d.lamp(12, 30, 4.0, 0xffe0b0, 1.3, { distance: 11, room: 'F' });

  // ── The Security Office: the camera monitors, the coat cupboard
  d.table(29, 27, 4, 1.0, 0.76, 0x3a3d44);
  d.target('monitors', 29, 26.4, 'south', "Watch the mall's security cameras", (g) => {
    for (const x of [-1.2, 0, 1.2]) {
      d.mesh(G.box, lam(0x111111), g, { p: [x, 1.05, 0], s: [1.0, 0.6, 0.08] });
      const m = d.mesh(G.plane, glowMat(0x3cff6b, 0.15), g, { p: [x, 1.05, 0.045], s: [0.9, 0.5, 1], shadow: false });
      m.material = glowMat(0x2a6a3a, 0.2);
    }
  });
  d.hideSpot('locker', 32.6, 35.4, 'north', { color: 0x5a6670 }).name = 'Hide in the coat cupboard';
  d.lamp(29, 30, 3.4, 0xffe8c8, 1.0, { distance: 8, room: 'Q' });

  // ── The Arcade: cabinets, a photo booth, the claw machine
  const titles = ['GUS KART', 'ROBO RUN', 'SPACE PIG', 'PIZZA PAL', 'BALLOON POP', 'MAZE MANIA'];
  titles.forEach((t, i) => d.cabinet(37 + i * 2.2, 26.2, 'south', [0x2a4fa0, 0xc0262d, 0x2f8f3a, 0xa970ff][i % 4], t));
  for (let i = 0; i < 4; i++) d.cabinet(38 + i * 2.6, 31, 'north', [0xff9a1f, 0x3ec1d3][i % 2], titles[i]);
  d.hideSpot('curtain', 49.4, 30, 'west', { color: 0x5b2a86 }).name = 'Hide in the photo booth';
  d.block(36.2, 35.3, 1.0, 1.0, 1.9, mat(0xffd23f, { rough: 0.3 }));
  d.item('plushie', 'plushie', 37.6, 35.4, 0.45);
  d.savePoint(49.2, 35.2, 'west');
  d.lamp(43, 30, 3.6, 0xff3fa4, 1.2, { distance: 10, room: 'A' });
  d.lamp(43, 34, 3.6, 0x2de2e6, 1.0, { distance: 9, room: 'A' });
}

const cop = (start, wait, roam) => ({
  id: 'cop', name: 'a Mall Cop Bot', build: () => buildCopBot(), walk: 2.1, chase: 4.3, sight: 13, hear: 9,
  roam, start, wait, hunt: 0.3, steps: 'gerald', stride: 1.0, lose: 5,
  shout: () => ['HALT! The mall is CLOSED!', 'Stop right there, kid!', 'FREEZE!'][Math.floor(Math.random() * 3)],
});

export default {
  id: 'mall',
  name: 'Sunnyvale Mall',
  layout,
  build,
  mood: { amb: 0.1, hemi: 0.09, fog: 0.03, bg: 0x05050c },
  spawn: { at: [5, 18], yaw: -Math.PI / 2 },
  firstLine: 'Whoa, the mall is HUGE at night. And the big gate is locked...',
  card: {
    story: 'They squeezed in under the loading dock door at <b>Sunnyvale Mall</b>. The fountain is still splashing, the store signs are still glowing... and something is marching up and down.',
    goal: '⌚ Every store has one of the <b>gate keys</b>: the Toy Store, the Pet Store, the Candy Shop and the Shoe Store. Find all <b>4</b> and open the <b>Main Gate</b>.',
    watchOut: '👀 Two <b>Mall Cop Bots</b> are on patrol. They can see a long way across Center Court — stay close to the stores.',
    after: 'The Main Gate rolled up with a rattle, and across the road, lit up by the streetlights, was a huge stone building with columns: <b>the City Museum</b>.',
  },
  quests: [
    { id: 'keys', type: 'collect', item: 'bag', count: 4, text: 'Find the 4 gate keys (one in every store)', done: 'You have all 4 gate keys!' },
    { id: 'exit', type: 'exit', text: 'Open the Main Gate at the end of Center Court!' },
    { id: 'cams', type: 'use', target: 'monitors', optional: true, text: 'Watch the cameras in the Security Office', reward: 'beeper', done: 'The cameras are linked to your Gus Watch!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    cop([20, 18], 6, ['C', 'C', 'T', 'P', 'Y', 'F', 'Q']),
    cop([45, 30], 12, ['C', 'C', 'S', 'Y', 'A', 'Q', 'F']),
  ],
  tips: {
    cop: 'The Mall Cop Bots can see far across Center Court. Sneak along the store fronts, and hide in the stores when one comes by.',
  },
  start(m) {
    if (m.count('bag') >= 4) m.decor.exit.setOpen(true);
  },
  collect(m, item) {
    if (item.kind === 'bag' && m.count('bag') >= 4) { m.decor.exit.setOpen(true); sfx.escUnlock(); }
  },
  use(m, t) {
    if (t.id === 'monitors') { sfx.camOpen(); m.say('Your Gus Watch is hooked up to the cameras — it\'ll beep when a Mall Cop gets close!', 3.5); }
    return true;
  },
};
