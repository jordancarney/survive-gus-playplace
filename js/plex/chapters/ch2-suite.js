// Chapter 2 — Max, 11: The Sleepover Suite. (Plays like FNAF 4 — see bedroom.js.)
//
// When the lights went out Max ran the only way she knew: back to the Sleepover Suite, the
// Pizzaplex's giant bedroom of bunk beds where the sleepover kids were supposed to go at
// 1 AM. Nobody else came. Something is coming down the left hall, something down the
// right, there's a baby Gus in the closet, and tiny Gus plushies keep climbing onto the bed.
// Hold out until 1 AM.
//
// Every one of Max's chapters happens in this room (max.js): `suiteRoom(opts)` builds it,
// with a few changes for each — the night light broken, the music box on its little table,
// a party of plushies all over the floor, dust sheets over the bunks.
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth } from '../../models.js';
import { Bedroom } from '../bedroom.js';
import * as THREE from 'three';

const E = Math.PI / 2, W = -Math.PI / 2;

const layout = {
  w: 30, h: 22, wallH: 3.2, panels: false,
  wallColor: 0x1a1430, headerColor: 0xe8e0d0,
  ceiling: () => T.tiles('#2a2448', '#1d1834'),
  rooms: {
    S: { name: 'Sleepover Suite', x0: 9, z0: 8, x1: 20, z1: 19,
         floor: () => T.carpet('#1a2448'), wall: ['#1a2448', '#ffd23f', '#101830', 'stars'] },
    L: { name: 'Left Hall', x0: 1, z0: 12, x1: 7, z1: 15,
         floor: () => T.tiles('#3a3550', '#2a2640'), wall: ['#2a2040', '#5a3a7a', '#1a1428', 'stripes'] },
    R: { name: 'Right Hall', x0: 22, z0: 12, x1: 28, z1: 15,
         floor: () => T.tiles('#3a3550', '#2a2640'), wall: ['#2a2040', '#5a3a7a', '#1a1428', 'stripes'] },
    C: { name: 'Closet', x0: 13, z0: 4, x1: 16, z1: 6,
         floor: () => T.wood('#5a3a24'), wall: ['#3a2a20', '#5a3a24', '#2a1a10', 'panels'] },
  },
  doors: [
    { a: 'L', b: 'S', x0: 8, z0: 13, x1: 8, z1: 14 },
    { a: 'S', b: 'R', x0: 21, z0: 13, x1: 21, z1: 14 },
    { a: 'C', b: 'S', x0: 14, z0: 7, x1: 15, z1: 7 },
  ],
};

function build(d, opts = {}) {
  const P = d.place.P;
  const wood = lam(0x6a4a2a);

  // the bedroom doors, swinging on their hinges (bedroom.js closes them while you hold)
  const leaf = (hx, hz, open) => {
    const pivot = d.anchor(hx, hz, 0, 0);
    d.mesh(G.box, mat(0xd8c8a8, { rough: 0.5 }), pivot, { p: [0, 1.15, 1.0], s: [0.07, 2.3, 2.0], still: false });
    d.mesh(G.sphere, mat(0xd8b040, { metal: 0.7, rough: 0.3 }), pivot, { p: [0.06, 1.05, 1.75], s: [0.04, 0.04, 0.04], still: false });
    pivot.rotation.y = open;
    return { pivot, open };
  };
  d.roomDoors = { left: leaf(8.96, 13.0, E), right: leaf(21.04, 13.0, -E) };
  for (const x of [8.96, 21.04]) d.block(x, 15.1, 0.12, 0.12, 2.4, wood, { solid: false, nav: false });

  // the closet, with two doors that open out a little more whenever it pushes
  const cl = (hx, sign) => {
    const pivot = d.anchor(hx, 7.98, 0, 0);
    d.mesh(G.box, mat(0x8a6a4a, { rough: 0.6 }), pivot, { p: [sign * 0.5, 1.15, 0], s: [1.0, 2.3, 0.06], still: false });
    for (let k = 0; k < 5; k++) d.mesh(G.box, lam(0x5a3a24), pivot, { p: [sign * 0.5, 0.5 + k * 0.38, 0.035], s: [0.8, 0.03, 0.01], still: false });
    return pivot;
  };
  d.closetDoors = [cl(14.0, 1), cl(16.0, -1)];
  d.label('CLOSET', 15, 8.04, 2.65, 1.2, 0.3, 'south', { bg: '#3a2a20', fg: '#ffd23f', glow: '#ffd23f' });
  for (let k = 0; k < 6; k++) {
    const c = P(13.4 + k * 0.6, 4.3, 1.6);
    d.mesh(G.box, cloth([0x7a3ab8, 0x2a4fa0, 0xc0262d, 0xffd23f, 0x2f8f5a, 0xff7eb6][k]), d.group, { p: [c.x, c.y, c.z], s: [0.4, 0.8, 0.06] });
  }
  d.lamp(15, 5, 2.6, 0x6a5aa0, 0.25, { distance: 4, room: 'C', bulb: false });

  // bunk beds down both sides: everybody's but Max's is empty
  const blankets = [0x3a6ab8, 0xc0262d, 0x2f8f5a, 0xffd23f, 0xff7eb6, 0x3ec1d3];
  let i = 0;
  for (const z of [9.6, 11.8, 16.4]) {
    for (const [x, facing] of [[10.0, 'east'], [20.0, 'west']]) {
      d.bed(x, z, facing, blankets[i++ % blankets.length], { len: 1.8, wid: 0.9 });
      // the top bunk and its posts
      const g = d.anchor(x, z, facing, 0);
      d.mesh(G.box, wood, g, { p: [0, 1.5, 0], s: [0.9, 0.12, 1.8] });
      d.mesh(G.box, cloth(blankets[(i + 2) % blankets.length]), g, { p: [0, 1.6, 0.2], s: [0.86, 0.08, 1.2] });
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) d.mesh(G.box, wood, g, { p: [sx * 0.42, 0.9, sz * 0.86], s: [0.07, 1.8, 0.07] });
      // (the old ones' chapter: dust sheets thrown over the bunks, like Parts & Service)
      if (opts.sheets) d.mesh(G.box, cloth(0xd8d4c8), g, { p: [0, 1.0, 0], s: [1.0, 1.9, 1.9] });
    }
  }
  // Max's bed, against the back wall, and a sleeping bag kicked off on the floor
  d.bed(15, 19.0, 'north', 0x7a3ab8, { len: 1.9, wid: 1.1 });
  d.label('MAX', 15, 19.96, 1.2, 1.0, 0.25, 'north', { bg: '#7a3ab8', fg: '#fff', glow: '#ffd23f' });
  const bag = P(12.6, 17.6, 0.06);
  d.mesh(G.box, cloth(0x2a4fa0), d.group, { p: [bag.x, bag.y, bag.z], s: [0.8, 0.12, 1.7], r: [0, 0.4, 0] });
  d.rug(15, 14.2, 4.4, 3.2, '#2a4fa0', '#ffd23f');
  d.block(17.8, 18.9, 1.2, 0.7, 0.7, lam(0xd11f2a));      // the toy chest
  d.window(12, 19.96, 1.8, 1.6, 0.9, 'north');
  d.label('SLEEPOVER SUITE', 11, 8.04, 2.5, 2.6, 0.35, 'south', { bg: '#1a2448', fg: '#ffd23f', glow: '#ff3fa4' });
  for (const [x, z, f] of [[9.04, 17.6, 'east'], [20.96, 17.6, 'west'], [20.96, 10.6, 'west']]) {
    d.poster(['GUS!', 'ROCCO!', 'SLEEP TIGHT'][i++ % 3], ['#ff3fa4', '#c040ff', '#2de2e6'][i % 3], 'gus', x, z, 1.7, f);
  }
  // the night light: just enough to see by — unless it's broken (Lights Out), and then there's
  // only the moon through the window
  if (opts.dark) {
    d.lamp(12, 19.2, 1.8, 0x6a7ab8, 0.35, { distance: 5, room: 'S', bulb: false });
    const shards = P(17.9, 19.0, 0.72);
    d.mesh(G.sphere, lam(0x3a3a44), d.group, { p: [shards.x, shards.y, shards.z], s: [0.08, 0.03, 0.08] });
  } else {
    d.lamp(15, 14.2, 3.0, 0x5a6ab8, 1.1, { distance: 10, room: 'S', bulb: false });
    d.lamp(17.9, 19.3, 0.9, 0x9fb8ff, 0.9, { distance: 5, room: 'S' });
    d.lamp(15, 9.2, 2.8, 0x6a5aa0, 0.6, { distance: 5, room: 'S', bulb: false });
  }

  // the music box, on a little table in front of the middle of the room
  if (opts.musicBox) {
    d.table(15, 12.5, 0.8, 0.6, 0.6, 0x5a3a24, { legs: 0x3a2414 });
    const g = d.anchor(15, 12.5, 'south', 0.6);
    d.mesh(G.box, mat(0x7a3ab8, { rough: 0.4 }), g, { p: [0, 0.1, 0], s: [0.34, 0.2, 0.26] });
    d.mesh(G.box, mat(0xffd23f, { metal: 0.6, rough: 0.3 }), g, { p: [0, 0.205, 0], s: [0.36, 0.02, 0.28] });
    const top = d.mesh(G.sphere, mat(0xffd23f, { metal: 0.6, rough: 0.3 }), g, { p: [0, 0.26, 0], s: [0.06, 0.06, 0.06] });
    top.matrixAutoUpdate = true;
    // the crank on the side, which turns while you wind
    const crank = new THREE.Group();
    crank.position.set(0.19, 0.1, 0);
    g.add(crank);
    d.mesh(G.box, mat(0xc0c0c8, { metal: 0.8, rough: 0.3 }), crank, { p: [0.03, 0, 0], s: [0.06, 0.02, 0.02], still: false });
    d.mesh(G.box, mat(0xc0c0c8, { metal: 0.8, rough: 0.3 }), crank, { p: [0.06, 0.05, 0], s: [0.02, 0.1, 0.02], still: false });
    d.musicCrank = crank;
    d.lamp(15, 12.5, 1.3, 0xffd8a0, 0.35, { distance: 2.5, room: 'S', bulb: false });
  }

  // a party's worth of Gus plushies tipped out all over the floor (Plushie Party)
  if (opts.plushPile) {
    const cols = [0x9a6038, 0xb07040, 0x8a5030];
    for (let k = 0; k < 14; k++) {
      const a = k * 2.4, r = 2.2 + (k % 4) * 0.7;
      const c = P(15 + Math.cos(a) * r, 14.6 + Math.sin(a) * r * 0.7, 0.1);
      d.mesh(G.sphere, lam(cols[k % 3]), d.group, { p: [c.x, c.y, c.z], s: [0.14, 0.11, 0.12], r: [0, a, 0] });
    }
  }

  // the halls: long, dark, and a light way down at the far end
  for (const [x, z, f] of [[4, 12.04, 'south'], [25, 12.04, 'south']]) d.poster('PARTY!', '#ffd23f', 'gus', x, z, 1.6, f);
  d.lamp(1.6, 14, 2.8, 0xff6a5a, 0.4, { distance: 6, room: 'L', flicker: true });
  d.lamp(28.4, 14, 2.8, 0xff6a5a, 0.4, { distance: 6, room: 'R', flicker: true });
  d.patch(4, 14, 6.8, 0.6, 0x3a1a2a, { y: 0.013 });
  d.patch(25, 14, 6.8, 0.6, 0x3a1a2a, { y: 0.013 });
  d.spots.spawn = P(15, 14.2);
}

// The Sleepover Suite for any of Max's chapters, with that chapter's changes.
export function suiteRoom(opts = {}) {
  return { layout, build: (d) => build(d, opts) };
}

// Where Max stands, where the closet and bed are: the same in every chapter.
export const SUITE = {
  spots: { middle: [15, 14.2], left: [9.75, 14.0], right: [20.25, 14.0], closet: [15, 9.5] },
  far: { left: [2.5, 14.0], right: [27.5, 14.0] },
  closet: { back: [15, 5.0], front: [15, 7.6] },
  bed3: [[14.6, 18.5, 0.47, 0.3], [15.35, 19.0, 0.47, -0.4], [14.8, 19.5, 0.47, 0.1]],
  bed4: [[14.6, 18.5, 0.47, 0.3], [15.35, 19.0, 0.47, -0.4], [14.8, 19.5, 0.47, 0.1], [15.4, 18.3, 0.47, 0.9]],
  E, W,
};

export default {
  id: 'suite',
  hero: 'max',
  name: 'The Sleepover Suite',
  layout,
  build: (d) => build(d),
  controller: Bedroom,
  mood: { amb: 0.085, hemi: 0.085, fog: 0.04, bg: 0x03020a },
  spawn: { at: [15, 14.2], yaw: 0 },
  clock: { seconds: 270, minutes: 60 },
  firstLine: 'Okay. Okay. Nobody else is coming. I just have to make it to 1 AM...',
  goText: '▶ Hold out until 1 AM',
  winTitle: 'MAX MADE IT TO 1 AM!',
  card: {
    story: 'When the lights went out, <b>Max</b> ran the only way she knew: back to the <b>Sleepover Suite</b>, the giant bedroom full of bunk beds. Nobody else came. And now something is coming down the halls...',
    goal: '🌙 Hold out until <b>1 AM</b>. <b>A</b> / <b>D</b> go to the left and right doors, <b>W</b> the closet, <b>S</b> turns round to the bed. Hold <b>SPACE</b> to hold a door shut, hold <b>F</b> for the flashlight.',
    watchOut: '👂 At a door, <b>listen</b>. Far down the hall? Shine the light and it backs off. <b>Breathing</b> means it\'s right outside — <b>don\'t</b> shine the light, hold the door shut until it runs away! Keep the <b>closet</b> shut, and shine the light on the <b>bed</b> when the plushies climb on.',
    after: 'At 1 AM every light in the Sleepover Suite flickered back on for a second, and the footsteps in the halls went away. Max\'s walkie-talkie crackled: <i>"...anyone? This is Jackson, the night guard. If you can hear me, stay where you are."</i><br><br>Up in the security office, <b>Jackson</b> was watching the cameras.',
  },
  quests: [
    { id: 'survive', type: 'survive', text: 'Hold out until 1 AM' },
    { id: 'door', type: 'door', optional: true, text: 'Hold a door shut until it goes away', done: 'It went away!' },
    { id: 'bed', type: 'bed', optional: true, text: 'Shine the light on the plushies on the bed', done: 'Shoo! Off the bed!' },
  ],
  enemies: [],
  room: {
    spots: { middle: [15, 14.2], left: [9.75, 14.0], right: [20.25, 14.0], closet: [15, 9.5] },
    left: { bot: 'chomper', name: 'Chomper', far: [2.5, 14.0], yaw: E },
    right: { bot: 'cranker', name: 'Cranker', far: [27.5, 14.0], yaw: W },
    calm: 16, step: 7, come: 0.45, closer: 0.5, flashToScare: 0.55, holdToSend: 2.4, nearMax: 12,
    closet: { back: [15, 5.0], front: [15, 7.6], start: 35, rate: 1.25, push: 32 },
    bed: { spots: [[14.6, 18.5, 0.47, 0.3], [15.35, 19.0, 0.47, -0.4], [14.8, 19.5, 0.47, 0.1]], first: 28, every: 15, grace: 6 },
  },
  tips: {
    chomper: 'When you hear BREATHING at a door, don\'t shine the light — hold the door shut until the footsteps run away.',
    cranker: 'Check both doors a lot! Far down the hall? Shine the light. Breathing? Hold the door shut.',
    babygus: 'Keep holding the closet shut, and turn round (S) to shine the light on the bed when the plushies climb on.',
  },
  questDone(m, q) { if (q.id === 'survive') m.win(); },
};
