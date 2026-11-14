// Chapter 44 — Thomas: Home Time (4:50 AM).
//
// Jonathan has stopped the music box, and without it the Giant Ball Pit has gone haywire: dive
// in and it won't take you anywhere for long. Thomas's last trip is three in a row — the Pizza
// Shack long ago, the Pizza Palace four years ago, Gus's PlayPlace years from now — and each
// ball pit only lets go of you once you've taken something from that time: the Toymaker's song
// sheet, a Pizza Palace token, a PlayPlace ticket. Everything he learned, brought back. Then
// home, and run for the Main Entrance.
//
// The building: the present on the left, then the three times side by side, none joined.
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth, buildKid } from '../../models.js';
import { buildBabyGus } from '../../escape/cast.js';
import { buildOld, buildRocco, buildSparky, buildOldGus } from '../cast.js';
import { sfx, startMusicBox } from '../../audio.js';
import { E, W, N, S, MOODS, nowRooms, NOW_DOOR, NOW_AT, SPAWN, giantPit, smallPit, windows, frozen, travel, setZone, enemy, seeded, THOMAS, nowBot } from './kit.js';

const layout = {
  w: 96, h: 34, wallH: 4.2, panels: false,
  wallColor: 0x1d1424, headerColor: 0xffd23f,
  ceiling: () => T.tiles('#2a2036', '#1d1626'),
  rooms: {
    ...nowRooms({ name: 'Main Hall', floor: () => T.checker('#1d1c24', '#3a2a5a'), wall: ['#1b1440', '#ffd23f', '#0e0a24', 'stars'] }),
    A: { name: 'Pizza Shack (long ago)', short: 'Shack (past)', x0: 28, z0: 1, x1: 46, z1: 24,
         floor: () => T.checker('#f2f0ea', '#c0262d'), wall: ['#ffe9a0', '#c0262d', '#7a2a2a', 'stripes'] },
    C: { name: 'Pizza Palace (4 years ago)', short: 'Palace (past)', x0: 52, z0: 1, x1: 70, z1: 24,
         floor: () => T.checker(), wall: ['#3b1a5a', '#ff3fa4', '#1d1c24', 'stars'] },
    F: { name: 'PlayPlace (years from now)', short: 'PlayPlace (future)', x0: 76, z0: 1, x1: 94, z1: 24,
         floor: () => T.checker('#f2f0ea', '#1d1c24'), wall: ['#2a4fa0', '#ffd23f', '#1f9fbf', 'bubbles'] },
  },
  doors: [NOW_DOOR],
};

function build(d) {
  const P = d.place.P;
  // ── now
  giantPit(d, { glow: 0xffd23f, glow2: 0xff3fa4, label: 'GIANT BALL PIT  ⚠ HAYWIRE' });
  d.exitDoor(18, 32.4, 'north', { w: 2.0, label: 'MAIN ENTRANCE →' });
  d.label('→ MAIN ENTRANCE', 18, 32.96, 2.8, 2.6, 0.5, 'north', { bg: '#1b1440', fg: '#ffd23f', glow: '#ffd23f' });
  for (const [x, z] of [[5, 22], [5, 28], [14, 25]]) d.block(x, z, 1.4, 1.4, 0.45, mat(0x3a2a5a, { rough: 0.5 }));
  d.hideSpot('box', 21.4, 20, 'west');
  d.hideSpot('locker', 1.6, 30, 'east', { color: 0x7a2a8a });
  d.hideSpot('curtain', 21.4, 29, 'west', { color: 0x5a1f4f });
  d.lamp(10, 25, 3.8, 0xffd23f, 0.6, { distance: 11, room: 'H', flicker: true });

  // ── the Pizza Shack, long ago, in the daytime
  smallPit(d, 31.5, 6.0, { id: 'pitA', name: 'Dive again — next stop? 🫧' });
  windows(d, [[38, 1.04, 'south'], [43, 1.04, 'south']]);
  for (const [x, z] of [[36, 12], [42, 12], [36, 18], [42, 18]]) d.table(x, z, 2.0, 1.2, 0.74, 0xd8b880, { legs: 0x5a3a22 });
  d.item('sheet', 'sheet', 44.6, 22.6, 0.9);
  d.label("GUS'S PIZZA SHACK", 37, 24.96, 2.8, 4, 0.7, 'north', { bg: '#c0262d', fg: '#ffd23f', glow: '#ffd23f' });
  d.hideSpot('counter', 28.6, 16, 'east', { color: 0xc0262d });
  d.hideSpot('toybox', 45.4, 9, 'west', { color: 0xffd23f });
  d.lamp(37, 10, 3.9, 0xfff0d0, 2.4, { distance: 16, room: 'A', bulb: false });
  d.lamp(37, 19, 3.9, 0xfff0d0, 2.0, { distance: 14, room: 'A', bulb: false });

  // ── the Pizza Palace, four years ago, at night
  smallPit(d, 55.5, 6.0, { id: 'pitB', name: 'Dive again — next stop? 🫧', color: 0x2a4fa0, signBg: '#2a4fa0', signFg: '#ffd23f' });
  for (const [x, z] of [[61, 12], [66, 12], [61, 18], [66, 18]]) {
    d.table(x, z, 2.0, 1.2, 0.74, 0xff3fa4, { legs: 0x2a2a30 });
  }
  d.cabinet(68.6, 3, 'west', 0x7a2a8a, 'BABY BLAST');
  d.cabinet(68.6, 6, 'west', 0x2a4fa0, 'GUS RACER');
  d.item('token', 'token', 68.6, 22.6, 0.9);
  d.label("GUS'S GIANT PIZZA PALACE", 61, 24.96, 2.9, 5, 0.7, 'north', { bg: '#3b1a5a', fg: '#ffd23f', glow: '#ff3fa4' });
  d.hideSpot('box', 52.6, 16, 'east', { color: 0x2a4fa0 });
  d.hideSpot('locker', 69.4, 14, 'west', { color: 0x7a2a8a });
  d.lamp(61, 10, 4.0, 0xff3fa4, 0.9, { distance: 12, room: 'C', flicker: true });
  d.lamp(64, 19, 4.0, 0x2de2e6, 0.9, { distance: 12, room: 'C' });

  // ── Gus's PlayPlace, years from now, at night
  smallPit(d, 79.5, 6.0, { id: 'pitC', name: 'Dive one LAST time — go HOME! 🫧', color: 0x3ec1d3, signBg: '#ffd23f', signFg: '#2a4fa0' });
  for (const [x, z] of [[85, 12], [90, 12], [85, 18], [90, 18]]) d.table(x, z, 2.0, 1.2, 0.74, 0xd8d0c0, { legs: 0x2a2a30 });
  d.item('ticket', 'ticket', 92.6, 22.6, 0.9);
  d.label("GUS'S PLAYPLACE", 85, 24.96, 2.9, 4, 0.7, 'north', { bg: '#1b0f3a', fg: '#ffd23f', glow: '#ff3fa4' });
  d.hideSpot('tube', 76.8, 16, 'east', { color: 0xff9a1f });
  d.hideSpot('counter', 93.4, 9, 'west', { color: 0xc0262d });
  d.lamp(85, 10, 4.0, 0x9fb8ff, 0.7, { distance: 12, room: 'F', flicker: true });
  d.lamp(88, 19, 4.0, 0x9fb8ff, 0.6, { distance: 12, room: 'F' });
  d.item('plushie', 'plushie', 93.4, 1.8, 0.5);
  d.spots.spawn = P(...SPAWN);
}

const quests = [
  { id: 'dive', type: 'use', target: 'dive', text: 'DIVE into the haywire ball pit (E at its edge)', done: 'Here we go...' },
  { id: 'sheet', type: 'collect', item: 'sheet', count: 1, text: 'Grab the Toymaker\'s song sheet (Pizza Shack)', done: 'Got the song sheet!' },
  { id: 'pitA', type: 'use', target: 'pitA', text: 'Dive into the Shack\'s ball pit — next stop!', done: 'Down again...' },
  { id: 'token', type: 'collect', item: 'token', count: 1, text: 'Grab a Pizza Palace token', done: 'Got a Palace token!' },
  { id: 'pitB', type: 'use', target: 'pitB', text: 'Dive into the Palace\'s ball pit — next stop!', done: 'Down AGAIN...' },
  { id: 'ticket', type: 'collect', item: 'ticket', count: 1, text: 'Grab a PlayPlace ticket', done: 'Got a PlayPlace ticket!' },
  { id: 'pitC', type: 'use', target: 'pitC', text: 'Dive into the PlayPlace\'s ball pit — one LAST time, home!', done: 'HOME. For real this time.' },
  { id: 'exit', type: 'exit', text: 'RUN for the Main Entrance!' },
  { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
];

const roomBot = (id, name, build, room, start, extra = {}) => ({
  id, name, build, walk: 1.9, chase: 3.7, sight: 10, hear: 9, hunt: 0.5, lose: 5,
  roam: [room], start, wait: 2, steps: id === 'babygus' ? 'cranker' : id === 'oldgus' ? 'gus' : id, stride: 0.95, shoutWho: name, ...extra,
});

export default {
  ...THOMAS,
  id: 'hometime',
  name: 'Home Time',
  layout,
  build,
  mood: MOODS.now,
  zones: {
    now: NOW_AT,
    shack: { at: [31.5, 6.0], yaw: W, mood: MOODS.day, flashlight: false },
    palace: { at: [55.5, 6.0], yaw: W, mood: { amb: 0.1, hemi: 0.1, fog: 0.028, bg: 0x08040e }, flashlight: true },
    future: { at: [79.5, 6.0], yaw: W, mood: MOODS.night, flashlight: true },
  },
  spawn: { at: SPAWN, yaw: 0 },
  firstLine: 'The music box stopped... and the ball pit went CRAZY. One more dive. Home time.',
  winTitle: 'THOMAS CAME HOME!',
  exitText: 'RUN for the Main Entrance! 🏃',
  card: {
    story: '<b>4:50 AM.</b> Jonathan did it: Gus\'s music box has stopped. But without it, the <b>Giant Ball Pit</b> has gone haywire, and the only way out of the room goes through it. <b>Thomas</b> takes one last huge breath. <i>"Okay,"</i> he says. <i>"Home time."</i>',
    goal: '🫧 The ball pit will drop you in three times, one after another — and each ball pit only lets you go once you\'ve grabbed something from that time: a <b>song sheet</b>, a <b>Palace token</b>, a <b>PlayPlace ticket</b>. Then home, and <b>run for the Main Entrance</b>.',
    watchOut: '👀 Everyone\'s awake everywhere now: <b>Old Gus</b> at the Shack, <b>baby Gus\'s</b> at the Palace, <b>Cranker</b> and <b>Chomper</b> at the PlayPlace — and <b>Flipper</b>, <b>Sparky</b>, <b>DJ Rocco</b> and <b>Gerald</b> back home.',
    after: 'Thomas burst out of the Main Hall with a song sheet, a token and a ticket clutched in his fists — everything the ball pit had shown him, brought back. <i>"I\'m coming!"</i> he yelled into the walkie. <i>"Main Entrance! I\'m COMING!"</i><br><br>Behind the walls, in the very last stretch of play tubes, <b>Timmy</b> was crawling the long way round.',
  },
  friends: [
    '🔵 Jonathan: <b>Backstage</b> · the music box is STOPPED',
    '🟣 Max: <b>Sleepover Suite</b> · the old ones are at her doors',
    '🔦 Jackson: <b>Security Office</b> · power running low',
    '🔴 Jack: <b>Under the Pizzaplex</b> · three levers',
    '⚪ Timmy: <b>the play tubes</b> · heading for the Main Entrance',
  ],
  quests,
  enemies: [
    nowBot('flipper', 'Flipper', buildOld('flipper'), { walk: 2.0, chase: 3.9, hear: 11 }),
    nowBot('sparky', 'Sparky', buildSparky, { walk: 2.3, chase: 4.6, sight: 10, hear: 10, start: [19, 30], roam: ['H', 'B', 'H'], wait: 9,
      shout: () => ['WOOF! Wanna play fetch?!', 'Ruff ruff! Found you!'][Math.floor(Math.random() * 2)] }),
    nowBot('rocco', 'DJ Rocco', buildRocco, { walk: 2.4, chase: 4.4, sight: 11, start: [4, 30], roam: ['H', 'B'], wait: 14,
      shout: () => ['Nobody leaves the dance floor!', 'Last dance!'][Math.floor(Math.random() * 2)] }),
    nowBot('gerald', 'Gerald', buildOld('gerald'), { walk: 1.7, chase: 3.5, sight: 10, start: [19, 4], roam: ['B', 'H'], wait: 20, steps: 'gerald' }),
    roomBot('oldgus', 'Old Gus', buildOldGus, 'A', [41, 20], { shout: () => ['Never stop singing...', 'Stay for the show!'][Math.floor(Math.random() * 2)] }),
    roomBot('babygus', 'a baby Gus', () => buildBabyGus(1), 'C', [64, 15], { walk: 1.8, chase: 3.6, shoutWho: 'Baby Gus', shout: () => 'Hee hee hee!' }),
    roomBot('babygus', 'a baby Gus', () => buildBabyGus(3), 'C', [58, 21], { walk: 1.8, chase: 3.6, shoutWho: 'Baby Gus', shout: () => 'Play with ME!', wait: 6 }),
    roomBot('cranker', 'Cranker', buildOld('cranker'), 'F', [88, 20], { walk: 1.6, chase: 3.4, sight: 11 }),
    roomBot('chomper', 'Chomper', buildOld('chomper'), 'F', [91, 8], { wait: 7 }),
  ],
  tips: {
    flipper: 'Flipper can hear you run. WALK when he\'s near.',
    sparky: 'Sparky is super fast. Hide before he sees you, or dive into the ball pit!',
    rocco: 'DJ Rocco is fast too. Keep an eye on your Gus Watch tracker.',
    gerald: 'Gerald is slow. Go round him.',
    oldgus: 'Grab the song sheet and get straight back in the ball pit. The counter and the toy box are good hiding spots.',
    babygus: 'The baby Gus\'s giggle when they see you. Grab the token and dive!',
    cranker: 'Cranker is slow. Grab the ticket from the far corner and dive!',
    chomper: 'Chomper hears you run. Hide in the tube or behind the counter, then go for the ticket.',
  },
  start(m) {
    const rnd = seeded(44);
    frozen(m, 'shackKids', [[39, 9, 2.2], [34, 15, 0.8], [43, 16, -1.2]].map(([x, z, yaw]) => ({ build: () => buildKid(rnd), x, z, yaw, pose: 'walk', amt: 0.8 })));
    m.decor.exit.setOpen(m.done.has('pitC'));
    setZone(m);
  },
  use(m, t) {
    if (t.id === 'dive') { travel(m, 'shack', 'The PIZZA SHACK! Daytime! Quick — something from here!'); return true; }
    if (t.id === 'pitA') { travel(m, 'palace', 'Now it\'s the Pizza PALACE. At night. Baby Gus\'s... grab something, quick!'); return true; }
    if (t.id === 'pitB') { travel(m, 'future', 'The PlayPlace — years from now! One more thing to grab...'); return true; }
    if (t.id === 'pitC') { travel(m, 'now', 'HOME! The real, actual Pizzaplex! Main Entrance — GO!'); return true; }
    return true;
  },
  questDone(m, q) {
    if (q.id === 'pitC') { m.decor.exit.setOpen(true); sfx.escUnlock(); }
  },
};
