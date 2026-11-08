// Level 4 — City Hospital.
//
// A long hallway through the middle: patient rooms and the X-Ray room on one side; the Nurse
// Station, the Waiting Room and the elevators on the other. The power's out and the elevator
// is dead. Two nurse robots squeak up and down the halls looking for kids out of bed.
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth } from '../../models.js';
import { sfx } from '../../audio.js';
import { buildNurseBot } from '../cast.js';

const layout = {
  w: 44, h: 30, wallH: 3.2, panels: false,
  wallColor: 0x2a3036, headerColor: 0xd8e0e8,
  ceiling: () => T.tiles('#e0e8ec', '#c0c8cc'),
  rooms: {
    H: { name: 'Hallway', x0: 1, z0: 12, x1: 42, z1: 16,
         floor: () => T.tiles('#d8e4e8', '#a8b8c0'), wall: ['#e8f2f4', '#3ec1d3', '#7a9aa8', 'panels'] },
    A: { name: 'Room 101', x0: 1, z0: 1, x1: 9, z1: 10,
         floor: () => T.tiles('#e0e8e0', '#b0c0b0'), wall: ['#e8f4e8', '#7ad151', '#8aa88a', 'panels'] },
    B: { name: 'Room 102', x0: 11, z0: 1, x1: 19, z1: 10,
         floor: () => T.tiles('#e0e0e8', '#b0b0c0'), wall: ['#e8e8f4', '#a970ff', '#8a8aa8', 'panels'] },
    C: { name: 'Room 103', x0: 21, z0: 1, x1: 29, z1: 10,
         floor: () => T.tiles('#e8e0e0', '#c0b0b0'), wall: ['#f4e8e8', '#ff7eb6', '#a88a8a', 'panels'] },
    D: { name: 'X-Ray', x0: 31, z0: 1, x1: 42, z1: 10,
         floor: () => T.tiles('#c8d0d8', '#98a0a8'), wall: ['#4a5a6a', '#3ec1d3', '#2a3a4a', 'panels'] },
    N: { name: 'Nurse Station', short: 'Nurses', x0: 1, z0: 18, x1: 13, z1: 28,
         floor: () => T.tiles('#d8e8f0', '#a8b8c8'), wall: ['#e8f2f8', '#d11f2a', '#7a9aa8', 'panels'] },
    W: { name: 'Waiting Room', short: 'Waiting', x0: 15, z0: 18, x1: 27, z1: 28,
         floor: () => T.carpet('#2a4a6a'), wall: ['#d8e8e0', '#2f8f7a', '#5a7a70', 'stripes'] },
    E: { name: 'Elevators', x0: 29, z0: 18, x1: 42, z1: 28,
         floor: () => T.checker('#e8e8e0', '#6a7a8a'), wall: ['#c8d0d8', '#f2c230', '#4a5a6a', 'panels'] },
  },
  doors: [
    { a: 'A', b: 'H', x0: 5, z0: 11, x1: 6, z1: 11 },
    { a: 'B', b: 'H', x0: 15, z0: 11, x1: 16, z1: 11 },
    { a: 'C', b: 'H', x0: 25, z0: 11, x1: 26, z1: 11 },
    { a: 'D', b: 'H', x0: 36, z0: 11, x1: 37, z1: 11 },
    { a: 'N', b: 'H', x0: 6, z0: 17, x1: 8, z1: 17 },
    { a: 'W', b: 'H', x0: 20, z0: 17, x1: 22, z1: 17 },
    { a: 'E', b: 'H', x0: 35, z0: 17, x1: 37, z1: 17 },
    { a: 'N', b: 'W', x0: 14, z0: 22, x1: 14, z1: 24 },
  ],
};

function build(d) {
  const cold = 0xd8f0ff, red = 0xff3030;

  // ── The hallway: flickering lights, red emergency lamps, a wheelchair or two
  for (const x of [6, 14, 22, 30, 38]) d.lamp(x, 14, 3.0, cold, 1.3, { distance: 8, room: 'H', flicker: x % 16 === 6 });
  for (const x of [2, 42]) d.lamp(x, 12.3, 2.7, red, 0.9, { distance: 7, room: 'H' });
  for (const [x, z] of [[11, 15.6], [32.5, 12.5]]) {
    d.block(x, z, 0.6, 0.6, 0.5, mat(0x3a3d44, { metal: 0.5 }));
    d.block(x, z - 0.25, 0.6, 0.08, 0.95, mat(0x3a3d44, { metal: 0.5 }), { solid: false, nav: false });
  }
  d.label('← ROOMS 101-103    X-RAY →', 21, 11.97 + 0.06, 2.6, 4.0, 0.3, 'south', { bg: '#e8f2f4', fg: '#2a5a7a', glow: '#3ec1d3' });
  d.savePoint(18, 15.6, 'north');

  // ── Patient rooms: beds with curtains round them, IV poles, a window
  for (const [rx, room] of [[1, 'A'], [11, 'B'], [21, 'C']]) {
    d.hospitalBed(rx + 2.2, 3.5, 'south');
    d.hospitalBed(rx + 6.6, 3.5, 'south');
    d.pole(rx + 3.4, 2.6, 1.8);
    d.mesh(G.box, glowMat(0x9fffb0, 0.2), d.group, { p: [d.place.P(rx + 3.4, 2.6).x, 1.7, d.place.P(rx + 3.4, 2.6).z], s: [0.12, 0.18, 0.05], shadow: false });
    d.window(rx + 4.4, 1.03, 2.0, 1.4, 0.9, 'south');
    d.lamp(rx + 4.4, 2.0, 2.0, 0x8fa8e0, 0.8, { distance: 6, room, bulb: false });
    d.table(rx + 7.6, 8.8, 0.8, 0.6, 0.8, 0xc0c8d0);
  }
  d.hideSpot('curtain', 4.4, 8.4, 'north', { color: 0x9fd0c0 }).name = 'Hide behind the curtain';
  d.hideSpot('bed', 15.4, 8.2, 'north', { color: 0x9fc8d8 });
  d.hideSpot('curtain', 28.0, 8.0, 'west', { color: 0xd8b0c8 }).name = 'Hide behind the curtain';
  d.item('battery', 'bat1', 2.2, 9.4, 0.4);
  d.savePoint(12.4, 9.4, 'east');
  d.item('plushie', 'plushie', 28.6, 1.6, 0.35);

  // ── X-Ray: the glowing light-boxes, the big machine, a battery behind it
  for (const x of [33, 35.5, 38]) {
    const g = d.anchor(x, 1.04, 'south', 1.7);
    d.mesh(G.plane, glowMat(0xbfe8ff, 0.35), g, { s: [1.8, 1.2, 1], shadow: false });
    d.mesh(G.box, lam(0x2a2a30), g, { p: [0, 0, -0.03], s: [1.9, 1.3, 0.04] });
  }
  d.block(37, 6, 2.6, 1.0, 0.8, mat(0xe8ecf0));
  d.block(37, 4.4, 0.6, 0.6, 2.4, mat(0xc0c8d0, { metal: 0.5 }));
  d.block(37, 5.2, 1.0, 1.2, 0.25, mat(0xc0c8d0, { metal: 0.5 }), { y: 2.0, solid: false, nav: false });
  d.item('battery', 'bat2', 41.4, 9.4, 0.4);
  d.hideSpot('locker', 32.2, 9.4, 'north', { color: 0x9aa4b0 }).name = 'Hide in the lead apron cupboard';
  d.lamp(35.5, 3, 2.6, 0x9fd8ff, 1.2, { distance: 8, room: 'D' });
  d.savePoint(41.4, 6.5, 'west');

  // ── Nurse Station: the big desk, medicine cabinets, the supply closet
  d.counter(7, 21.5, 6, 1.0, 1.05, 0xe8ecf0, 0x3ec1d3);
  d.label('NURSE STATION', 7, 20.96, 1.5, 2.0, 0.3, 'north', { bg: '#3ec1d3', fg: '#fff', glow: '#fff' });
  d.shelf(1.4, 24, 0.6, 5, 2.0, 'east', { wood: 0xd8dde3, books: false });
  for (let k = 0; k < 6; k++) {
    const c = d.place.P(1.45, 22 + k * 0.8, 0.6 + (k % 3) * 0.55);
    d.mesh(G.cyl, lam([0xffffff, 0xff9a1f, 0x3ec1d3][k % 3]), d.group, { p: [c.x, c.y, c.z], s: [0.08, 0.16, 0.08] });
  }
  d.hideSpot('locker', 13.65, 27.4, 'west', { color: 0xd8dde3 }).name = 'Hide in the supply closet';
  d.item('battery', 'bat3', 2.4, 27.6, 0.4);
  d.lamp(7, 24, 3.0, cold, 1.1, { distance: 9, room: 'N', flicker: true });

  // ── Waiting Room: rows of chairs, a fish tank, a vending machine, toys in the corner
  d.seats(17, 22, 6, 3, 'north', 0x2f8f7a, { dx: 0.9, dz: 1.6 });
  d.block(26.9, 18.5, 1.0, 0.8, 1.9, mat(0x2a4fa0, { rough: 0.4 }));
  d.mesh(G.plane, glowMat(0xffe08a, 0.3), d.group, { p: [d.place.P(26.9, 18.92).x, 1.2, d.place.P(26.9, 18.92).z], s: [0.7, 1.1, 1], shadow: false });
  d.block(16.5, 27.5, 2.2, 0.6, 0.9, mat(0x5a3a24));
  d.block(16.5, 27.5, 2.0, 0.5, 0.6, glowMat(0x3a90c8, 0.2), { y: 0.9, solid: false, nav: false });
  d.hideSpot('counter', 24, 27.4, 'north', { color: 0x5a3a24 }).name = 'Hide under the front desk';
  d.savePoint(16.2, 19.2, 'south');
  d.lamp(21, 23, 3.0, 0xffe8c8, 1.0, { distance: 9, room: 'W' });

  // ── Elevators: two dead ones, and the one that'll work once it has batteries
  d.exitDoor(42.4, 23, 'west', { w: 1.8, label: 'GOING DOWN' });
  for (const z of [19.8, 26.2]) {
    const g = d.anchor(42.94, z, 'west', 0);
    d.mesh(G.box, mat(0x9aa4b0, { metal: 0.7, rough: 0.3 }), g, { p: [0, 1.05, 0], s: [1.6, 2.1, 0.05] });
  }
  d.target('panel', 42.9, 21.4, 'west', 'Put the batteries in the elevator', (g) => {
    d.mesh(G.box, lam(0x2a2c31), g, { p: [0, 1.3, -0.04], s: [0.3, 0.5, 0.06] });
    d.elevatorLight = glowMat(0xff3b30, 0.4);
    d.mesh(G.sphere, d.elevatorLight, g, { p: [0, 1.45, 0], s: [0.05, 0.05, 0.03], shadow: false });
  }, { reach: 1.4 });
  d.label('ELEVATORS', 35, 28.96, 2.6, 2.0, 0.34, 'north', { bg: '#4a5a6a', fg: '#f2c230', glow: '#f2c230' });
  d.hideSpot('box', 30.2, 27.3, 'north', { color: 0xa8805a }).name = 'Hide in the laundry cart';
  d.savePoint(30.4, 19.2, 'south');
  d.lamp(36, 23, 3.0, 0xffe2b0, 1.0, { distance: 10, room: 'E', flicker: true });
}

const nurse = (start, wait, roam) => ({
  id: 'nurse', name: 'a Nurse Bot', build: buildNurseBot, walk: 2.1, chase: 4.1, sight: 12, hear: 9,
  roam, start, wait, hunt: 0.3, steps: 'cranker', stride: 0.8, lose: 5,
  shout: () => ['You should be in BED!', 'Back to your room, little patient!', 'Patient found!'][Math.floor(Math.random() * 3)],
});

export default {
  id: 'hospital',
  name: 'City Hospital',
  layout,
  build,
  mood: { amb: 0.085, hemi: 0.08, fog: 0.035, bg: 0x04060a },
  spawn: { at: [21, 26], yaw: 0 },
  firstLine: 'The elevator\'s the only way down to the street... and it has no power.',
  card: {
    story: 'They thought the hospital would have grown-ups to help them. But the halls are empty, the lights keep flickering... and something squeaks.',
    goal: '⌚ Find <b>3 big batteries</b>, put them in the <b>elevator</b>, and ride it all the way down.',
    watchOut: '👀 Two <b>Nurse Bots</b> squeak up and down the halls looking for kids out of bed. Listen for the squeaking!',
    after: 'DING! The doors slid open on the ground floor, and they ran out past the ambulances — straight into the giant empty parking lot of <b>Sunnyvale Mall</b>.',
  },
  quests: [
    { id: 'bats', type: 'collect', item: 'battery', count: 3, text: 'Find 3 batteries for the elevator', done: 'You have 3 batteries!' },
    { id: 'power', type: 'use', target: 'panel', text: 'Put the batteries in the elevator (Elevators)', done: 'The elevator has power!' },
    { id: 'exit', type: 'exit', text: 'Ride the elevator down!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    nurse([8, 24], 6, ['H', 'H', 'N', 'W', 'A', 'B', 'E']),
    nurse([34, 4], 14, ['H', 'H', 'D', 'C', 'B', 'E', 'W']),
  ],
  tips: {
    nurse: 'Nurse Bots squeak when they walk — when the squeaking gets loud, hide behind a curtain or under a bed!',
  },
  start(m) {
    if (m.done.has('power')) powerOn(m, true);
  },
  use(m, t) {
    if (t.id === 'panel') powerOn(m, false);
    return true;
  },
};

function powerOn(m, quiet) {
  m.decor.exit.setOpen(true);
  m.decor.elevatorLight.color.set(0x3cff6b).multiplyScalar(3);
  if (quiet) return;
  sfx.powerOn();
  setTimeout(() => m.say('DING! The elevator is working! Come on!', 3), 1000);
}
