// Chapter 5 — Thomas, 7: Into the Ball Pit. (Plays like Into the Pit: the ball pit takes you
// back in time.)
//
// Thomas hid in the Giant Ball Pit when the lights went out, and Flipper is swimming round
// the room looking for him. Dive in (E) — all the way down — and he comes up out of a little
// old ball pit in GUS'S PIZZA SHACK, Gus's very first restaurant, long ago: daytime, a
// birthday party, and everybody frozen still like a photo. Except Old Gus.
//
// A sign by the old ball pit says it costs 3 tokens. Find them, unlock the Pizza Shack's
// back door (what you do in the past changes the present: it's the same door the Pizzaplex
// was built round), jump back in the old ball pit, and get out of the present through it.
//
// One building, two halves that don't join: the present on the left, long ago on the right.
// Diving moves you from one to the other.
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth, buildKid, buildPerson, poseRig } from '../../models.js';
import { buildOld, buildOldGus } from '../cast.js';
import { sfx } from '../../audio.js';
import * as THREE from 'three';

const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;

const layout = {
  w: 70, h: 34, wallH: 4.0, panels: false,
  wallColor: 0x1d1424, headerColor: 0xffd23f,
  ceiling: () => T.tiles('#2a2036', '#1d1626'),
  rooms: {
    // now
    B: { name: 'Giant Ball Pit', short: 'Ball Pit', x0: 1, z0: 1, x1: 22, z1: 16,
         floor: () => T.playmat(), wall: ['#3a2a7a', '#ffd23f', '#1f9fbf', 'bubbles'] },
    H: { name: 'Party Hall', x0: 1, z0: 18, x1: 22, z1: 32,
         floor: () => T.carpet('#2a0e33'), wall: ['#2a0e33', '#ff3fa4', '#1a0820', 'stars'] },
    // long ago
    D: { name: 'Dining Room (long ago)', short: 'Dining (past)', x0: 36, z0: 1, x1: 55, z1: 16,
         floor: () => T.checker('#f2f0ea', '#c0262d'), wall: ['#ffe9a0', '#c0262d', '#7a2a2a', 'stripes'] },
    K: { name: 'Kitchen (long ago)', short: 'Kitchen (past)', x0: 57, z0: 1, x1: 68, z1: 12,
         floor: () => T.tiles('#f4f1ea', '#c8c0b0'), wall: ['#f4f1ea', '#3a90c8', '#6a8aa0', 'panels'] },
    S: { name: "Gus's Stage (long ago)", short: 'Stage (past)', x0: 57, z0: 14, x1: 68, z1: 25,
         floor: () => T.wood('#9a6a3c'), wall: ['#5b2a86', '#ffd23f', '#2a1440', 'stars'] },
    P: { name: 'Party Room (long ago)', short: 'Party (past)', x0: 36, z0: 18, x1: 55, z1: 32,
         floor: () => T.carpet('#7a2a3a'), wall: ['#ff9ab8', '#ffd23f', '#7a2a8a', 'stars'] },
  },
  doors: [
    { a: 'B', b: 'H', x0: 9, z0: 17, x1: 12, z1: 17 },
    { a: 'D', b: 'K', x0: 56, z0: 5, x1: 56, z1: 7 },
    { a: 'D', b: 'S', x0: 56, z0: 14, x1: 56, z1: 15 },
    { a: 'D', b: 'P', x0: 44, z0: 17, x1: 46, z1: 17 },
  ],
};

// Where you come up, each way. (Plan metres; yaw is which way you face.)
const PITS = { now: { at: [11, 11.6], yaw: 0 }, past: { at: [40.5, 6.0], yaw: -Math.PI / 2 } };

const MOODS = {
  now: { amb: 0.07, hemi: 0.07, fog: 0.035, bg: 0x05030a },
  past: { amb: 0.6, hemi: 0.65, fog: 0.006, bg: 0xbfd8f0, env: 'day', envI: 0.5 },
};

function build(d) {
  const P = d.place.P;

  // ── NOW: the Giant Ball Pit, dark, Flipper swimming round it
  const wall = mat(0x2a4fa0, { rough: 0.4 });
  d.block(11.5, 2.6, 18, 0.25, 0.8, wall);
  d.block(2.6, 7.5, 0.25, 10, 0.8, wall);
  d.block(20.4, 7.5, 0.25, 10, 0.8, wall);
  d.block(5.5, 12.6, 6, 0.25, 0.8, wall);
  d.block(17.5, 12.6, 6, 0.25, 0.8, wall);
  const a = P(2.8, 2.8), b = P(20.2, 12.4);
  d.place.slowZones.push({ x0: a.x, z0: a.z, x1: b.x, z1: b.z });
  d.balls(2.8, 2.8, 20.2, 12.4, 520);
  d.label('GIANT BALL PIT', 11.5, 1.04, 3.0, 6, 1.0, 'south', { bg: '#0a0614', fg: '#ff3fa4', glow: '#ffd23f' });
  d.target('dive', 11.5, 11.2, 'south', 'DIVE into the ball pit! 🫧', null, { reach: 2.2 });
  d.lamp(6, 8, 3.6, 0xff9ab8, 0.8, { distance: 10, room: 'B', flicker: true });
  d.lamp(17, 8, 3.6, 0x9f7fff, 0.8, { distance: 10, room: 'B' });
  d.hideSpot('tube', 21.0, 15.0, 'west', { color: 0x3ec1d3 });
  d.savePoint(2, 15.2, 'east');

  // the Party Hall: tables, balloons, and the old back door, boarded shut
  for (const [x, z] of [[6, 22], [12, 22], [6, 28], [12, 28]]) {
    d.table(x, z, 2.2, 1.2, 0.74, 0xf4f1ea, { legs: 0xc0c0c0 });
    for (const sx of [-1.4, 1.4]) d.chair(x + sx, z, 0xff3fa4, 0.95);
  }
  d.exitDoor(18, 32.4, 'north', { w: 1.6, label: 'BACK DOOR' });
  d.boards = [];
  for (const [y, r] of [[0.6, 0.2], [1.3, -0.15], [1.9, 0.1]]) {
    const c = P(18, 32.9, y);
    d.boards.push(d.mesh(G.box, lam(0x8a6a42), d.group, { p: [c.x, c.y, c.z], s: [1.9, 0.16, 0.06], r: [0, 0, r], still: false }));
  }
  d.label('OLD BACK DOOR\n(it was here before the Pizzaplex)', 18, 32.96, 2.6, 2.8, 0.6, 'north', { bg: '#2a1a10', fg: '#ffd23f', glow: '#ff9a1f' });
  d.hideSpot('curtain', 1.6, 30.5, 'east', { color: 0xc040ff });
  d.lamp(10, 25, 3.6, 0xc040ff, 0.7, { distance: 11, room: 'H', flicker: true });

  // ── LONG AGO: Gus's Pizza Shack, in the daytime, at a birthday party, frozen
  // sunny windows: it's daytime long ago
  for (const x of [41, 46, 52]) {
    const g = d.anchor(x, 1.04, 'south', 2.0);
    d.mesh(G.plane, glowMat(0xcfeeff, 0.35), g, { s: [3.0, 1.4, 1], shadow: false });
    const frame = lam(0xf4f1ea);
    for (const yy of [-0.7, 0.7]) d.mesh(G.box, frame, g, { p: [0, yy, 0.02], s: [3.1, 0.07, 0.05] });
    for (const xx of [-1.5, 0, 1.5]) d.mesh(G.box, frame, g, { p: [xx, 0, 0.02], s: [0.06, 1.4, 0.05] });
  }
  d.label("GUS'S PIZZA SHACK", 46, 16.96, 3.1, 5, 0.8, 'north', { bg: '#c0262d', fg: '#ffd23f', glow: '#ffd23f' });
  // the little old ball pit you came up in, and the sign
  const old = mat(0xd11f2a, { rough: 0.4 });
  d.block(40.5, 3.2, 4.6, 0.2, 0.6, old);
  d.block(38.3, 5.6, 0.2, 5, 0.6, old);
  d.block(42.7, 4.4, 0.2, 2.4, 0.6, old);
  const oa = P(38.5, 3.4), ob = P(42.5, 8.0);
  d.place.slowZones.push({ x0: oa.x, z0: oa.z, x1: ob.x, z1: ob.z });
  d.balls(38.5, 3.4, 42.5, 8.0, 160);
  d.label('BALL PIT\n3 TOKENS', 40.5, 3.05, 1.5, 1.5, 0.6, 'south', { bg: '#ffd23f', fg: '#c0262d', glow: '#ffffff' });
  d.target('home', 40.5, 6.0, 'east', 'Jump back in the ball pit — go HOME! 🫧', null, { reach: 2.0 });
  // tables, and the party, frozen in the middle of it
  for (const [x, z] of [[46, 6], [51, 6], [46, 11.5], [51, 11.5]]) {
    d.table(x, z, 2.0, 1.2, 0.74, 0xd8b880, { legs: 0x5a3a22 });
  }
  d.block(51, 11.5, 0.5, 0.5, 0.25, cloth(0xffffff), { y: 0.74, solid: false, nav: false });     // the birthday cake
  const cake = P(51, 11.5, 1.05);
  d.mesh(G.cyl, glowMat(0xffd23f, 0.6), d.group, { p: [cake.x, cake.y, cake.z], s: [0.015, 0.1, 0.015] });
  d.lamp(46, 8, 3.7, 0xfff0d0, 2.4, { distance: 14, room: 'D', bulb: false });
  d.lamp(52, 8, 3.7, 0xfff0d0, 2.2, { distance: 14, room: 'D', bulb: false });
  d.savePoint(54.6, 15.2, 'west');
  d.hideSpot('counter', 54.4, 2.6, 'west', { color: 0xc0262d });

  // the kitchen: ovens, a counter, a token on the shelf
  d.counter(62.5, 2.2, 10, 1.0, 1.0, 0xc8c8d0, 0xe8e8f0);
  for (const x of [59, 62, 65]) d.block(x, 11.4, 1.6, 1.0, 1.4, mat(0x5a6070, { metal: 0.6, rough: 0.4 }));
  d.item('ptoken', 'tok1', 67.6, 6.5);
  d.hideSpot('locker', 67.6, 11.4, 'west', { color: 0x3a90c8 });
  d.lamp(62.5, 6.5, 3.7, 0xfff8e8, 2.0, { distance: 12, room: 'K', bulb: false });

  // the stage, where Old Gus stands when the party's frozen
  d.block(65, 19.5, 6, 9, 0.5, mat(0x5b2a86, { rough: 0.5 }), { solid: false, nav: false });
  const sa = P(62, 15), sb = P(68, 24);
  d.place.raised.push({ x0: sa.x, z0: sa.z, x1: sb.x, z1: sb.z, h: 0.5 });
  d.label('GUS!', 68.96, 19.5, 2.8, 2.4, 0.8, 'west', { bg: '#5b2a86', fg: '#ffd23f', glow: '#ff3fa4' });
  d.item('ptoken', 'tok2', 67.4, 23.8, 1.0);
  d.lamp(63, 19.5, 3.7, 0xffd8a0, 2.0, { distance: 12, room: 'S', bulb: false });

  // the party room: the back door — locked, with the key-switch on the wall
  for (const [x, z] of [[40, 22], [47, 22], [40, 28]]) d.table(x, z, 2.2, 1.2, 0.74, 0xff9ab8, { legs: 0x7a2a8a });
  d.item('ptoken', 'tok3', 36.8, 31.4);
  d.target('unlock', 50, 31.4, 'north', 'Unlock the back door 🔑', (g) => {
    d.mesh(G.box, mat(0x8a6a42, { rough: 0.6 }), g, { p: [0, 1.05, -0.38], s: [1.6, 2.1, 0.08] });
    d.backLock = d.mesh(G.box, glowMat(0xff3b30, 0.5), g, { p: [0.55, 1.05, -0.32], s: [0.12, 0.2, 0.04], still: false });
  });
  d.label('BACK DOOR', 50, 32.96, 2.5, 1.6, 0.3, 'north', { bg: '#2a1a10', fg: '#ffd23f', glow: '#ff9a1f' });
  d.hideSpot('toybox', 54.4, 20, 'west', { color: 0xffd23f });
  d.item('plushie', 'plushie', 36.8, 18.6, 0.5);
  d.lamp(45, 25, 3.7, 0xfff0d0, 2.2, { distance: 14, room: 'P', bulb: false });
  d.savePoint(36.6, 25, 'east');

  d.spots.spawn = P(11, 14.6);
}

// Everybody at the party, frozen still like a photo: kids mid-run, a mom with a camera, a
// dad with a balloon.
function frozenParty(m) {
  if (m.decor.party) return;
  const P = m.place.P;
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const spots = [[45, 7.4, 0.4], [47.5, 4.6, 2.6], [50, 7.6, -0.5], [52.5, 10.2, 2.0], [49, 13.2, 3.0], [44.5, 12.6, 1.2], [38.5, 22.5, 0.9], [43, 26, -1.2]];
  m.decor.party = spots.map(([x, z, yaw], i) => {
    const rig = i === 5 ? buildPerson({ height: 1.7, shirt: 0x3a6ab8, pants: 0x2a3a5a, skin: 0xd9a07a, hair: 0x6b3e1f, shadows: true }) : buildKid(rnd);
    rig.root.position.copy(P(x, z));
    rig.root.rotation.y = yaw;
    poseRig(rig, i % 3 === 0 ? 'walk' : 'idle', i * 1.7, i % 3 === 0 ? 1 : 0.3, 1);
    m.decor.group.add(rig.root);
    return rig;
  });
}

// Through the ball pit, one way or the other.
function dive(m, to) {
  const p = m.player, d = m.decor;
  sfx.plexSplash();
  setTimeout(() => sfx.plexTime(), 250);
  const fade = document.getElementById('fade');
  fade.classList.add('on');
  m.grace = 2;
  setTimeout(() => {
    const at = PITS[to];
    p.pos.copy(m.place.P(...at.at));
    p.vel.set(0, 0, 0);
    p.yaw = at.yaw;
    m.flags.past = to === 'past';
    setTime(m);
    m.room = null;
    fade.classList.remove('on');
    m.say(to === 'past'
      ? 'Whoa... where am I? It\'s DAYTIME. And why is nobody MOVING?'
      : 'I\'m back! The ball pit worked!', 3.4);
  }, 650);
}

function setTime(m) {
  const past = !!m.flags.past;
  m.game.lighting.setEscape(m.decor, MOODS[past ? 'past' : 'now']);
  m.player.lightOn = !past;
  for (const e of m.enemies) e.root.visible = true;
}

export default {
  id: 'pit',
  hero: 'thomas',
  name: 'Into the Ball Pit',
  layout,
  build,
  mood: MOODS.now,
  spawn: { at: [11, 14.6], yaw: 0 },
  firstLine: 'Flipper\'s in here... I have to hide. In the BALL PIT!',
  winTitle: 'THOMAS GOT OUT OF THE BALL PIT!',
  exitText: 'Out the old back door! 🏃',
  card: {
    story: 'When the lights went out, <b>Thomas</b> dived into the <b>Giant Ball Pit</b> to hide. Now <b>Flipper</b> is swimming round the room looking for him. Thomas takes a big breath, dives all the way down... and comes up somewhere else. Somewhere a long, long time ago.',
    goal: '🫧 Dive into the ball pit (<b>E</b>). Long ago, find the <b>3 tokens</b> for the old ball pit, <b>unlock the back door</b>, then jump back in the ball pit to go home — and get out through the <b>back door</b>.',
    watchOut: '👀 <b>Flipper</b> can hear you run, so walk near him. And in the past, everyone is frozen still... except <b>Old Gus</b>, who wakes up when you take the first token.',
    after: 'Thomas pulled the boards off the old back door, and it opened — into a long hallway he\'d never seen. At the end of it, on a hook, hung a walkie-talkie, crackling: <i>"...anybody? This is Jackson..."</i><br><br>Up past the STAFF ONLY door, in the dark backstage halls, <b>Jonathan</b> was creeping along on tiptoe.',
  },
  friends: [
    '🔵 Jonathan: <b>Atrium</b>',
    '🟣 Max: <b>Sleepover Suite</b>',
    '🔦 Jackson: <b>Security Office</b>',
    '🔴 Jack: <b>Gus Shop</b> · just climbed out of the tunnels',
  ],
  quests: [
    { id: 'dive', type: 'use', target: 'dive', text: 'DIVE into the giant ball pit (E at its edge)', done: 'Down, down, down...' },
    { id: 'tokens', type: 'collect', item: 'ptoken', count: 3, text: 'Find 3 tokens for the old ball pit', done: 'Three tokens!' },
    { id: 'unlock', type: 'use', target: 'unlock', text: 'Unlock the back door in the Party Room', done: 'Click! The back door is unlocked.' },
    { id: 'home', type: 'use', target: 'home', text: 'Jump back in the old ball pit to go home', done: 'Home again!' },
    { id: 'exit', type: 'exit', text: 'Get out through the old BACK DOOR in the Party Hall!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    { id: 'flipper', name: 'Flipper', build: buildOld('flipper'), walk: 1.8, chase: 3.7, sight: 9, hear: 11, hunt: 0.35, lose: 5,
      roam: ['B', 'H', 'B'], start: [4, 4], wait: 6, steps: 'flipper', stride: 1.0, shoutWho: 'Flipper' },
    { id: 'oldgus', name: 'Old Gus', build: buildOldGus, walk: 1.7, chase: 3.5, sight: 11, hear: 8, hunt: 0.35, lose: 5,
      roam: ['D', 'K', 'S', 'P', 'D'], start: [65, 19.5], yaw: W, wait: 2, asleep: true, steps: 'gus', stride: 1.0, shoutWho: 'Old Gus',
      shout: () => ['The party\'s not over...', 'Happy birthday...', 'Come and see the show!'][Math.floor(Math.random() * 3)] },
  ],
  tips: {
    flipper: 'Flipper can hear you run. WALK when he\'s near, and dive into the ball pit to get away from him.',
    oldgus: 'Old Gus wakes up when you take a token. Hide behind the counter, in the locker or the toy box when he sees you!',
  },
  start(m, resumed) {
    frozenParty(m);
    const d = m.decor;
    d.exit.setOpen(m.done.has('unlock') && !m.flags.past);
    for (const b of d.boards) b.visible = !m.done.has('unlock');
    d.backLock?.material.color.set(m.done.has('unlock') ? 0x3cff6b : 0xff3b30);
    if (m.count('ptoken') > 0) m.enemies.find((e) => e.id === 'oldgus').wake();
    if (m.flags.past) setTime(m);
  },
  collect(m, item) {
    if (item.kind === 'ptoken' && m.count('ptoken') === 1) {
      m.enemies.find((e) => e.id === 'oldgus').wake();
      sfx.musicBoxSting();
      setTimeout(() => m.say('Did the Gus on the stage just... turn his head?', 3), 1100);
    }
  },
  use(m, t) {
    if (t.id === 'dive') { dive(m, 'past'); return true; }
    if (t.id === 'home') { dive(m, 'now'); return true; }
    if (t.id === 'unlock') {
      sfx.escUnlock();
      m.decor.backLock.material.color.set(0x3cff6b);
      return true;
    }
    return true;
  },
  questDone(m, q) {
    if (q.id === 'home') {
      // what you did long ago changed now: the old back door's boards are gone
      for (const b of m.decor.boards) b.visible = false;
      m.decor.exit.setOpen(true);
      setTimeout(() => m.say('The boards on the old back door are GONE! Because I unlocked it... long ago!', 4), 1400);
    }
  },
};
