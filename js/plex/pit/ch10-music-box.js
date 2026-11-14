// Chapter 10 — Thomas: The Music Box (1:30 AM).
//
// Back down the Giant Ball Pit to Gus's Pizza Shack — this time an evening long ago, after
// closing, with the chairs up on the tables. A white-bearded old man is frozen in front of the
// stage holding out a present: a music box, with a tag. "To Gus — so you'll never stop
// singing. Love, the Toymaker." Read it, and the music box starts playing... and Old Gus
// opens his eyes. (So THAT'S what wakes them.) It won't shut.
//
// Then: the Shack's spare gate key is in the kitchen. Hide it in the loose brick by the old
// ball pit — that wall is still there, inside the Pizzaplex's Giant Ball Pit room — swim
// home, take it out of the brick, and unlock the gate.
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, buildPerson } from '../../models.js';
import { buildOld, buildOldGus } from '../cast.js';
import { sfx, startMusicBox } from '../../audio.js';
import {
  E, W, N, S, MOODS, nowRooms, NOW_DOOR, NOW_AT, SPAWN, giantPit, smallPit, windows, frozen, travel, setZone, zone,
  enemy, musicBoxAt, THOMAS, nowBot,
} from './kit.js';
import { shackRooms, SHACK_DOORS, buildShack, toymaker } from './shack.js';

const layout = {
  w: 70, h: 34, wallH: 4.0, panels: false,
  wallColor: 0x1d1424, headerColor: 0xffd23f,
  ceiling: () => T.tiles('#2a2036', '#1d1626'),
  rooms: {
    ...nowRooms({ name: 'Service Hall', floor: () => T.concrete(), wall: ['#3a3d44', '#ffd23f', '#22242a', 'bricks'] }),
    ...shackRooms('Office'),
  },
  doors: [NOW_DOOR, ...SHACK_DOORS],
};

const BOX = [61.2, 19.5];     // the music box, on a little table in front of the stage

function build(d) {
  const P = d.place.P;
  // ── now
  giantPit(d);
  // the loose brick in the old wall (it only matters once you've hidden something in it)
  d.target('brick2', 1.5, 14.2, 'east', 'Pull out the loose brick 🧱', (g) => {
    d.mesh(G.box, lam(0x8a4a3a), g, { p: [0, 0.9, -0.42], s: [0.5, 0.24, 0.12] });
  });
  d.label('OLD WALL\n(from the Pizza Shack)', 1.04, 12.6, 2.2, 2.0, 0.6, 'east', { bg: '#2a1a10', fg: '#ffd23f', glow: '#ff9a1f' });
  d.exitDoor(18, 32.4, 'north', { w: 1.6, label: 'GATE' });
  d.chains = [0.7, 1.4].map((y) => {
    const c = P(18, 32.88, y);
    return d.mesh(G.box, mat(0x9aa4b0, { metal: 0.8, rough: 0.3 }), d.group, { p: [c.x, c.y, c.z], s: [1.8, 0.08, 0.06], r: [0, 0, y > 1 ? 0.25 : -0.25], still: false });
  });
  d.label('LOCKED GATE', 18, 32.96, 2.6, 1.8, 0.4, 'north', { bg: '#2a0606', fg: '#ff3b30', glow: '#ff3b30' });
  for (let i = 0; i < 4; i++) d.crate(3 + i * 1.1, 31.4, 0.9, 0x6a5a4a);
  d.hideSpot('locker', 21.4, 27, 'west', { color: 0x4a6ab8 });
  d.lamp(10, 25, 3.6, 0xffb070, 0.6, { distance: 11, room: 'H', flicker: true });

  // ── long ago, after closing
  buildShack(d, { closed: true, lights: 0xffc890, k: 2.3 });
  d.lamp(60.2, 19.5, 2.8, 0xffe0b0, 1.6, { distance: 7, room: 'S', bulb: false });     // a light on the present
  windows(d, [[41, 1.04, 'south'], [46, 1.04, 'south'], [52, 1.04, 'south']], 0xff9a60, 0.3);    // sunset
  smallPit(d, 40.5, 6.0);
  d.label('BALL PIT\nCLOSED', 40.5, 3.05, 1.5, 1.5, 0.6, 'south', { bg: '#ffd23f', fg: '#c0262d', glow: '#ffffff' });
  d.target('brick', 36.5, 9.6, 'east', 'Hide the key in the loose brick 🧱', (g) => {
    d.mesh(G.box, lam(0xa85a42), g, { p: [0, 0.9, -0.42], s: [0.5, 0.24, 0.12] });
  });
  // the music box on its little table, in front of the stage
  d.target('tag', BOX[0], BOX[1], 'west', 'Read the tag on the present 🎁', (g) => {
    d.mesh(G.cyl, lam(0x5a3a22), g, { p: [0, 0.4, 0], s: [0.35, 0.8, 0.35] });
    d.mesh(G.box, mat(0x7a2a8a, { rough: 0.4 }), g, { p: [0, 0.95, 0], s: [0.4, 0.28, 0.32] });
    d.mesh(G.box, mat(0xf2c230, { metal: 0.7, rough: 0.3 }), g, { p: [0, 1.12, 0], s: [0.42, 0.04, 0.34] });
    d.mesh(G.box, lam(0xffffff), g, { p: [0.12, 0.98, 0.17], s: [0.12, 0.08, 0.01] });
  }, { reach: 1.8 });
  d.target('lid', BOX[0], BOX[1], 'west', 'Try to shut the music box 🎵', null, { reach: 1.8 });
  d.item('key', 'gatekey', 67.6, 6.5);
  // the office: a desk, photos, and Gus as employee of the month
  d.table(40, 28, 2.4, 1.2, 0.76, 0x6a4a2a, { legs: 0x3a2a1a });
  d.poster('EMPLOYEE OF THE MONTH', '#ffd23f', 'gus', 40, 32.96, 1.8, 'north');
  d.shelf(55.4, 28, 0.6, 5, 2.0, 'west', { wood: 0x5a3a24 });
  d.item('plushie', 'plushie', 37, 31.4, 0.5);
  d.spots.spawn = P(...SPAWN);
}

const quests = [
  { id: 'dive', type: 'use', target: 'dive', text: 'DIVE into the giant ball pit (E at its edge)', done: 'Down, down, down...' },
  { id: 'tag', type: 'use', target: 'tag', text: 'Look at the present in front of the stage (long ago)', done: 'A music box — from "the Toymaker".' },
  { id: 'key', type: 'collect', item: 'key', count: 1, text: 'Find the spare gate key in the kitchen', done: 'Got the spare key!' },
  { id: 'brick', type: 'use', target: 'brick', text: 'Hide the key in the loose brick by the old ball pit', done: 'Hidden! Now... will it still be there?' },
  { id: 'home', type: 'use', target: 'home', text: 'Jump back in the old ball pit to go home', done: 'Home again!' },
  { id: 'brick2', type: 'use', target: 'brick2', text: 'Pull out the loose brick in the OLD WALL (Giant Ball Pit)', done: 'The key was still there! After all these years!' },
  { id: 'exit', type: 'exit', text: 'Unlock the gate in the Service Hall and get out!' },
  { id: 'shut', type: 'use', target: 'lid', optional: true, after: 'tag', text: 'Try to shut the music box', done: 'It won\'t shut! It just keeps playing...' },
  { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
];

function playBox(m) {
  startMusicBox(musicBoxAt(m, () => m.place.P(...BOX)));
}

export default {
  ...THOMAS,
  id: 'musicbox',
  name: 'The Music Box',
  layout,
  build,
  mood: MOODS.now,
  zones: { now: NOW_AT, past: { at: [40.5, 6.0], yaw: W, mood: MOODS.dusk, flashlight: false } },
  spawn: { at: SPAWN, yaw: 0 },
  firstLine: 'Okay, ball pit. Take me back. I want to know what\'s going ON.',
  winTitle: 'THOMAS FOUND THE MUSIC BOX!',
  exitText: 'Unlock the gate! 🔑',
  card: {
    story: '<b>1:30 AM.</b> Jackson says it on the walkie again and again: <i>"Something wakes them up. Find out what."</i> So <b>Thomas</b> is back at the <b>Giant Ball Pit</b>. Last time it took him back to Gus\'s Pizza Shack, long ago. Maybe the answer is there.',
    goal: '🫧 Dive in, and look at the <b>present</b> in front of the Pizza Shack\'s stage. Find the <b>spare gate key</b> in the kitchen and hide it in the <b>loose brick</b> by the old ball pit — then swim home and see if it\'s still there.',
    watchOut: '👀 <b>Flipper</b> is back in the Giant Ball Pit — he can hear you run. And long ago, <b>Old Gus</b> is asleep on his stage... for now.',
    after: 'Thomas told Jackson everything on the walkie: the present, the tag, the music that wouldn\'t stop. <i>"A music box,"</i> Jackson said slowly. <i>"Gus\'s music box. It wakes them up."</i><br><br>Across the Pizzaplex, past the kart track, <b>Jonathan</b> was creeping into the <b>Fun Zone</b> — and something there was barking.',
  },
  friends: [
    '🔵 Jonathan: <b>Backstage</b>',
    '🟣 Max: <b>Sleepover Suite</b> · hiding',
    '🔦 Jackson: <b>Security Office</b> · on the walkie',
    '🔴 Jack: <b>Under the Pizzaplex</b> · fixing P.A.L.\'s generator',
  ],
  quests,
  enemies: [
    nowBot('flipper', 'Flipper', buildOld('flipper'), { walk: 1.9, chase: 3.8, hear: 11 }),
    { id: 'oldgus', name: 'Old Gus', build: buildOldGus, walk: 1.8, chase: 3.7, sight: 11, hear: 8, hunt: 0.4, lose: 5,
      roam: ['D', 'K', 'S', 'O', 'D'], start: [65, 19.5], yaw: W, wait: 2, asleep: true, steps: 'gus', stride: 1.0, shoutWho: 'Old Gus',
      shout: () => ['Never stop singing...', 'Come and hear my song!', 'The party\'s not over...'][Math.floor(Math.random() * 3)] },
  ],
  tips: {
    flipper: 'Flipper can hear you run. WALK when he\'s near, and dive into the ball pit to get away from him.',
    oldgus: 'Once the music box plays, Old Gus is awake. Hide behind the counter, in the locker or the toy box when he sees you!',
  },
  start(m, resumed) {
    const d = m.decor;
    frozen(m, 'people', [
      { ...{ build: () => buildPerson(toymaker) }, x: 59.6, z: 19.5, yaw: E, pose: 'idle', amt: 0.2 },
      { build: () => buildPerson({ height: 1.66, shirt: 0xc0262d, pants: 0x2a3a5a, skin: 0xa86b45, hair: 0x111111, shadows: true }), x: 48.5, z: 9, yaw: 2.2, pose: 'walk', amt: 0.6 },
    ]);
    d.exit.setOpen(m.done.has('brick2'));
    for (const c of d.chains) c.visible = !m.done.has('brick2');
    if (m.done.has('tag')) { enemy(m, 'oldgus').wake(); playBox(m); }
    setZone(m);
  },
  use(m, t, q) {
    if (t.id === 'dive') { travel(m, 'past', 'Whoa... it\'s the Pizza Shack again. But it\'s EVENING. And there\'s an old man by the stage...'); return true; }
    if (t.id === 'home') { travel(m, 'now', 'I\'m back! Now — the loose brick!'); return true; }
    if (t.id === 'tag') {
      m.say('The tag says: "To Gus — so you\'ll never stop singing. Love, the Toymaker."', 4.5);
      setTimeout(() => {
        if (m.game.mode !== 'escape' || m.def.id !== 'musicbox') return;
        playBox(m);
        sfx.musicBoxSting();
        enemy(m, 'oldgus').wake(1.1);
        m.say('It\'s... PLAYING. By itself. And Old Gus just OPENED HIS EYES!', 3.5);
      }, 4200);
      return true;
    }
    if (t.id === 'lid') { sfx.repairBad(); return true; }
    if (t.id === 'brick') { sfx.clang(); return true; }
    if (t.id === 'brick2') {
      sfx.escUnlock();
      m.decor.exit.setOpen(true);
      for (const c of m.decor.chains) c.visible = false;
      return true;
    }
    return true;
  },
  questDone(m, q) {
    if (q.id === 'home') setTimeout(() => m.say('The OLD WALL... the brick should be in there. Over by the big pit!', 3.5), 1600);
  },
};
