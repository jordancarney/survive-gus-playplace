// Level 3 — Maple Street School, from the designer's map.
//
// A long hallway along the top with the lockers and the front doors; four classrooms under it
// (one says NOTHING HERE, one has the big hiding spot); a fifth classroom and the cafeteria
// along the bottom. The custodian walks around — don't get caught — and he's lost his keys.
// And one of the Night Bots followed them from the daycare...
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth } from '../../models.js';
import { sfx } from '../../audio.js';
import { buildCustodian, buildNightBot } from '../cast.js';

const layout = {
  w: 46, h: 32, wallH: 3.4, panels: false,
  wallColor: 0x2a2a30, headerColor: 0xd8d0c0,
  ceiling: () => T.tiles('#e8e8e0', '#c8c8c0'),
  rooms: {
    H: { name: 'Hallway', x0: 1, z0: 1, x1: 44, z1: 4,
         floor: () => T.tiles('#d8d8cc', '#a8a89c'), wall: ['#e8e0c8', '#2a4fa0', '#7a8a9a', 'panels'] },
    A: { name: 'Classroom 1', short: 'Class 1', x0: 1, z0: 6, x1: 9, z1: 30,
         floor: () => T.tiles('#c8d8c0', '#98a890'), wall: ['#f2e6c8', '#2f8f3a', '#8a6a4a', 'panels'] },
    B: { name: 'Classroom 2', short: 'Class 2', x0: 11, z0: 6, x1: 19, z1: 15,
         floor: () => T.tiles('#d8c8b8', '#a89888'), wall: ['#e8d8c0', '#c0262d', '#8a6a4a', 'panels'] },
    C: { name: 'Classroom 3', short: 'Class 3', x0: 21, z0: 6, x1: 29, z1: 15,
         floor: () => T.tiles('#c8c8d8', '#9898a8'), wall: ['#e0e8f2', '#2a4fa0', '#6a7a8a', 'panels'] },
    D: { name: 'Classroom 4', short: 'Class 4', x0: 31, z0: 6, x1: 44, z1: 15,
         floor: () => T.tiles('#d8d0b8', '#a8a088'), wall: ['#f2e8c8', '#a970ff', '#7a6a8a', 'panels'] },
    F: { name: 'Classroom 5', short: 'Class 5', x0: 11, z0: 17, x1: 29, z1: 30,
         floor: () => T.wood('#8a6a42'), wall: ['#f2e6c8', '#ff9a1f', '#8a6a4a', 'panels'] },
    G: { name: 'Cafeteria', x0: 31, z0: 17, x1: 44, z1: 30,
         floor: () => T.checker('#e8e0d0', '#c0262d'), wall: ['#fff0d0', '#ffd23f', '#c0262d', 'stripes'] },
  },
  doors: [
    { a: 'H', b: 'A', x0: 4, z0: 5, x1: 5, z1: 5 },
    { a: 'H', b: 'B', x0: 14, z0: 5, x1: 15, z1: 5 },
    { a: 'H', b: 'C', x0: 24, z0: 5, x1: 25, z1: 5 },
    { a: 'H', b: 'D', x0: 37, z0: 5, x1: 38, z1: 5 },
    { a: 'A', b: 'F', x0: 10, z0: 22, x1: 10, z1: 24 },
    { a: 'B', b: 'F', x0: 15, z0: 16, x1: 16, z1: 16 },
    { a: 'C', b: 'F', x0: 25, z0: 16, x1: 26, z1: 16 },
    { a: 'D', b: 'G', x0: 37, z0: 16, x1: 38, z1: 16 },
    { a: 'F', b: 'G', x0: 30, z0: 24, x1: 30, z1: 26 },
  ],
};

function build(d) {
  const P = d.place.P;
  const fluoro = 0xdfefff, moon = 0x8fa8e0;

  // ── The hallway: lockers all along the north wall, a trophy case, the clock, the front doors
  const lockerCols = [0x2a4fa0, 0x2f8f3a, 0xc0262d, 0x2a4fa0];
  for (let x = 6.2; x < 44; x += 0.72) {
    if (Math.abs(x - 30) < 2) continue;                         // the trophy case
    const hide = [9.08, 19.88, 35.72, 41.48].some((h) => Math.abs(h - x) < 0.01);
    if (hide) { d.hideSpot('locker', x, 1.32, 'south', { color: lockerCols[Math.floor(x) % 4] }); continue; }
    const g = d.anchor(x, 1.32, 'south', 0);
    d.mesh(G.box, mat(lockerCols[Math.floor(x) % 4], { rough: 0.4, metal: 0.5 }), g, { p: [0, 1.0, 0], s: [0.68, 2.0, 0.6] });
    for (let k = 0; k < 3; k++) d.mesh(G.box, lam(0x111111), g, { p: [0, 1.6 - k * 0.07, 0.305], s: [0.4, 0.02, 0.01], shadow: false });
  }
  d.place.addBlock(5.8, 1, 44, 1.62, 2.0);
  d.block(30, 1.4, 3.2, 0.7, 2.2, mat(0x6b4a2a));
  for (let k = 0; k < 5; k++) {
    const c = P(28.8 + k * 0.6, 1.8, 1.3 + (k % 2) * 0.5);
    d.mesh(G.cyl, mat(0xf2c230, { metal: 0.9, rough: 0.2 }), d.group, { p: [c.x, c.y, c.z], s: [0.08, 0.3, 0.08] });
  }
  d.label('GO MAPLE BEARS!', 30, 1.04, 2.85, 2.6, 0.38, 'south', { bg: '#2a4fa0', fg: '#ffd23f', glow: '#ffd23f' });
  // the clock: a round face over the hallway (the "sun" on the map)
  const clock = d.anchor(18, 4.96, 'north', 2.6);
  d.mesh(G.cyl, lam(0xf4f1ea), clock, { s: [0.35, 0.04, 0.35], r: [Math.PI / 2, 0, 0] });
  d.mesh(G.box, lam(0x111111), clock, { p: [0, 0.1, 0.03], s: [0.03, 0.22, 0.01] });
  d.mesh(G.box, lam(0x111111), clock, { p: [0.08, 0, 0.03], s: [0.17, 0.03, 0.01] });
  d.exitDoor(1.6, 2.5, 'east', { w: 1.8, label: 'EXIT' });
  d.label('FRONT DOORS', 1.04, 2.5, 2.85, 1.6, 0.3, 'east', { bg: '#2a4fa0', fg: '#fff', glow: '#ffd23f' });
  d.savePoint(22, 3.9, 'north');
  for (const x of [8, 18, 28, 38]) d.lamp(x, 3, 3.2, fluoro, 1.6, { distance: 9, room: 'H', flicker: x === 28 });

  // ── Classroom 1 (the tall one): desks, a chalkboard, cubbies — and a key
  d.chalkboard(5, 6.04, 'south', 4, 'ABC  123');
  d.desks(3, 10, 3, 4, { dx: 2.2, dz: 2.4 });
  d.table(5, 20.5, 2.4, 1.0, 0.78, 0x6b4a2a);
  d.shelf(1.4, 26, 0.6, 5, 1.0, 'east', { wood: 0xffd23f, books: false });
  d.hideSpot('toybox', 8.2, 29.2, 'north', { color: 0x2a4fa0 });
  d.item('key', 'key1', 4.2, 28.4, 0.5);
  d.savePoint(2.2, 7.2, 'east');
  d.window(1.03, 16, 2.0, 1.6, 1.0, 'east');
  d.lamp(2.6, 16, 2.0, moon, 1.0, { distance: 6, room: 'A', bulb: false });
  d.lamp(5, 24, 3.0, fluoro, 0.9, { distance: 8, room: 'A', flicker: true });

  // ── Classroom 2: NOTHING HERE (or is there?)
  d.chalkboard(15, 6.04, 'south', 4, 'NOTHING HERE');
  d.table(15, 9, 2.0, 0.9, 0.78, 0x6b4a2a);
  d.item('plushie', 'plushie', 18.4, 14.4, 0.35);
  d.lamp(15, 11, 3.0, fluoro, 0.6, { distance: 7, room: 'B', flicker: true });

  // ── Classroom 3: the teacher's desk to hide under, and a key
  d.chalkboard(25, 6.04, 'south', 4, '2 + 2 = 4');
  d.desks(22.6, 9.5, 3, 2, { dx: 2.2, dz: 2.4 });
  d.hideSpot('counter', 27.6, 7.6, 'north', { color: 0x6b4a2a }).name = "Hide under the teacher's desk";
  d.item('key', 'key2', 22.4, 14.6, 0.5);
  d.window(29.97, 11, 2.0, 1.6, 1.0, 'west');
  d.lamp(28.4, 11, 2.0, moon, 0.9, { distance: 6, room: 'C', bulb: false });

  // ── Classroom 4: the big HIDING SPOT closet, and the art supplies
  d.chalkboard(37.5, 6.04, 'south', 5, 'ART ROOM');
  for (const [x, z] of [[34, 10], [38, 10], [42, 10], [34, 13], [42, 13]]) d.table(x, z, 1.6, 1.2, 0.62, [0xffd23f, 0x3ec1d3, 0xff7eb6][Math.floor(x) % 3]);
  d.hideSpot('locker', 44.65, 7.2, 'west', { color: 0x8a6a4a }).name = 'Hide in the big closet';
  d.hideSpot('locker', 44.65, 8.4, 'west', { color: 0x8a6a4a }).name = 'Hide in the big closet';
  d.label('HIDING SPOT', 44.96, 7.8, 2.45, 1.4, 0.26, 'west', { bg: '#2f8f3a', fg: '#fff', glow: '#ffd23f' });
  d.savePoint(32.2, 14.6, 'east');
  d.lamp(38, 10, 3.0, 0xffe0c0, 1.0, { distance: 9, room: 'D' });

  // ── Classroom 5 (the big one at the bottom): rows of desks, the save box from the map
  d.chalkboard(20, 17.04, 'south', 5, 'SPELLING TEST\nFRIDAY');
  d.desks(13, 20.5, 6, 3, { dx: 2.6, dz: 2.6 });
  d.table(20, 28.8, 3, 1.0, 0.78, 0x6b4a2a);
  d.savePoint(14, 29.3, 'north');
  d.hideSpot('box', 28.2, 29.2, 'north', { color: 0x8a6a42 }).name = 'Hide in the big box of balls';
  d.lamp(16, 24, 3.0, fluoro, 0.9, { distance: 9, room: 'F' });
  d.lamp(25, 24, 3.0, fluoro, 0.9, { distance: 9, room: 'F', flicker: true });

  // ── The cafeteria: long tables, the lunch counter, and the last key
  for (const z of [20, 23.5, 27]) d.table(36, z, 7, 1.2, 0.72, 0x9aa4b0);
  d.counter(42.6, 23.5, 1.0, 8, 1.0, 0xc8c8c8);
  d.hideSpot('counter', 43.5, 18.4, 'west', { color: 0xc8c8c8 }).name = 'Hide under the lunch counter';
  d.item('key', 'key3', 43.2, 29.6, 0.5);
  d.label('CAFETERIA', 37.5, 17.04, 2.7, 2.0, 0.36, 'south', { bg: '#c0262d', fg: '#ffd23f', glow: '#ffd23f' });
  d.lamp(36, 23.5, 3.0, 0xffe0b0, 1.0, { distance: 10, room: 'G' });
}

export default {
  id: 'school',
  name: 'Maple Street School',
  layout,
  build,
  mood: { amb: 0.08, hemi: 0.07, fog: 0.035, bg: 0x05060c },
  spawn: { at: [3.4, 14], yaw: Math.PI },
  firstLine: 'The front doors are locked! The custodian has the keys...',
  card: {
    story: 'Out of the library and over the playground, Jonathan and Jack climbed in through a classroom window at <b>Maple Street School</b>. Somebody is still here, mopping the floors...',
    goal: '⌚ The custodian dropped his <b>3 keys</b> somewhere in the classrooms. Find them, then get out through the <b>front doors</b> at the end of the hallway.',
    watchOut: '👀 <b>The custodian</b> walks around — don\'t get caught. Hide in the lockers or the big closet. And something else followed you here...',
    after: 'The last key turned, the front doors swung open — and Jack pointed down the street at a sign glowing red: <b>CITY HOSPITAL — EMERGENCY</b>.',
  },
  quests: [
    { id: 'keys', type: 'collect', item: 'key', count: 3, text: "Find the custodian's 3 keys", done: 'You have all 3 keys!' },
    { id: 'exit', type: 'exit', text: 'Unlock the front doors at the end of the Hallway!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    {
      id: 'custodian', name: 'the Custodian', build: buildCustodian, walk: 1.9, chase: 4.1, sight: 11, hear: 9,
      roam: ['H', 'H', 'A', 'B', 'C', 'D', 'F', 'G'], start: [40, 3], wait: 8, hunt: 0.3, steps: 'chomper', stride: 0.8,
      shout: () => ['HEY! No kids in the school at night!', 'Get back here!', 'Who left these footprints on my clean floor?!'][Math.floor(Math.random() * 3)],
    },
    {
      id: 'nightbot', name: 'a Night Bot', build: buildNightBot, walk: 1.9, chase: 3.8, sight: 10, hear: 8,
      roam: ['H', 'A', 'B', 'C', 'D', 'F', 'G'], start: [3.2, 2.6], yaw: Math.PI / 2, asleep: true, steps: 'gerald', stride: 1.0,
      shout: () => 'Bedtime, little one...',
    },
  ],
  tips: {
    custodian: 'Listen for his footsteps and stay out of the Hallway when he\'s in it. If he sees you, run round a corner and jump in a locker!',
    nightbot: 'The Night Bot followed you from the daycare! Hide where it can\'t see you get in.',
  },
  start(m, resumed) {
    const d = m.decor;
    if (m.count('key') > 0) m.enemies[1].wake();
    if (m.count('key') >= 3) d.exit.setOpen(true);
  },
  collect(m, item) {
    if (item.kind !== 'key') return;
    if (m.count('key') === 1) {
      m.enemies[1].wake();
      sfx.reboot(m.enemies[1].pos);
      setTimeout(() => m.say('Jonathan... the Night Bot from the daycare. It FOLLOWED us!', 3.5), 1400);
    }
    if (m.count('key') >= 3) { m.decor.exit.setOpen(true); sfx.escUnlock(); }
  },
};
