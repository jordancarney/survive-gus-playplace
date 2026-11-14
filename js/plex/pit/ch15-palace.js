// Chapter 15 — Thomas: The Pizza Palace (2:10 AM).
//
// This time the Giant Ball Pit drops Thomas four years back, at night, into Gus's Giant
// Pizza Palace — the night Jonathan was five. Baby Gus's toddle about the dark. Behind a table
// in the Party Room, two little kids are hiding: Jonathan and Jack, aged five.
//
// The way out of the present is the old Pizza Palace door the Pizzaplex kept in its Palace
// Wing, padlocked. Long ago, win its key from the Palace's claw machine (three Gus tokens)
// and drop it in the Palace's time capsule. The Pizzaplex kept the time capsule too...
import * as THREE from 'three';
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth } from '../../models.js';
import { buildBabyGus, buildLittleJonathan, buildJack } from '../../escape/cast.js';
import { buildSparky, buildOld } from '../cast.js';
import { sfx } from '../../audio.js';
import { E, W, N, S, MOODS, nowRooms, NOW_DOOR, NOW_AT, SPAWN, giantPit, smallPit, frozen, travel, setZone, enemy, THOMAS, nowBot } from './kit.js';

const layout = {
  w: 70, h: 34, wallH: 4.6, panels: false,
  wallColor: 0x1d1424, headerColor: 0xffd23f,
  ceiling: () => T.tiles('#2a2036', '#1d1626'),
  rooms: {
    ...nowRooms({ name: 'Palace Wing', floor: () => T.checker('#f2f0ea', '#5a1f4f'), wall: ['#5a1f4f', '#ffd23f', '#1d1c24', 'stars'] }),
    D: { name: 'Dining Hall (4 years ago)', short: 'Dining (past)', x0: 36, z0: 1, x1: 55, z1: 16,
         floor: () => T.checker(), wall: ['#3b1a5a', '#ff3fa4', '#1d1c24', 'stars'] },
    A: { name: 'Arcade (4 years ago)', short: 'Arcade (past)', x0: 57, z0: 1, x1: 68, z1: 12,
         floor: () => T.carpet('#120e33'), wall: ['#120e33', '#2de2e6', '#ff3fa4', 'stars'] },
    T: { name: 'Party Room (4 years ago)', short: 'Party (past)', x0: 57, z0: 14, x1: 68, z1: 25,
         floor: () => T.carpet('#3a1450'), wall: ['#ff7eb6', '#ffd23f', '#7a2a8a', 'stars'] },
    P: { name: 'Prize Corner (4 years ago)', short: 'Prizes (past)', x0: 36, z0: 18, x1: 55, z1: 32,
         floor: () => T.carpet('#14304a'), wall: ['#ffd23f', '#ff3fa4', '#2a4fa0', 'stripes'] },
  },
  doors: [
    NOW_DOOR,
    { a: 'D', b: 'A', x0: 56, z0: 5, x1: 56, z1: 7 },
    { a: 'D', b: 'T', x0: 56, z0: 14, x1: 56, z1: 15 },
    { a: 'D', b: 'P', x0: 44, z0: 17, x1: 46, z1: 17 },
  ],
};

const KIDS = [62.2, 21.6];

function build(d) {
  const P = d.place.P;
  // ── now: the Giant Ball Pit, and the Palace Wing with the old door and the time capsule
  giantPit(d, { glow: 0xc040ff, glow2: 0xff3fa4 });
  d.exitDoor(18, 32.4, 'north', { w: 1.8, label: 'PALACE DOOR' });
  d.label("GUS'S GIANT PIZZA PALACE\n(the real front door!)", 18, 32.96, 2.9, 3.4, 0.7, 'north', { bg: '#5a1f4f', fg: '#ffd23f', glow: '#ff3fa4' });
  const lock = P(18, 32.85, 1.0);
  d.padlock = d.mesh(G.box, mat(0xf2c230, { metal: 0.8, rough: 0.3 }), d.group, { p: [lock.x, lock.y, lock.z], s: [0.25, 0.3, 0.08], still: false });
  d.target('capsule2', 6, 30.4, 'north', 'Open the old time capsule ⏳', (g) => {
    d.mesh(G.box, mat(0x9aa4b0, { metal: 0.6, rough: 0.35 }), g, { p: [0, 0.5, -0.3], s: [1.2, 1.0, 0.7] });
    d.mesh(G.cyl, mat(0x7a7a82, { metal: 0.7, rough: 0.3 }), g, { p: [0, 1.15, -0.3], s: [0.5, 0.3, 0.5] });
  });
  d.label('PIZZA PALACE TIME CAPSULE\nDO NOT OPEN UNTIL THE PIZZAPLEX OPENS', 6, 32.96, 2.3, 3.6, 0.6, 'north', { bg: '#1d1c24', fg: '#ffd23f', glow: '#ffd23f' });
  for (const [x, z] of [[3, 22], [3, 26]]) d.poster('PIZZA PALACE', '#ff3fa4', 'gus', 1.04, z, 1.8, 'east');
  d.hideSpot('curtain', 21.4, 23, 'west', { color: 0x5a1f4f });
  d.lamp(10, 25, 3.8, 0xc040ff, 0.7, { distance: 11, room: 'H', flicker: true });

  // ── four years ago: the Pizza Palace at night
  smallPit(d, 40.5, 6.0, { color: 0x2a4fa0, sign: 'BALL PIT', signBg: '#2a4fa0', signFg: '#ffd23f' });
  d.label("GUS'S GIANT PIZZA PALACE", 46, 16.96, 3.4, 6, 0.9, 'north', { bg: '#3b1a5a', fg: '#ffd23f', glow: '#ff3fa4' });
  for (const [x, z] of [[46, 6], [51, 6], [46, 11.5], [51, 11.5]]) {
    d.table(x, z, 2.0, 1.2, 0.74, 0xff3fa4, { legs: 0x2a2a30 });
    for (const sx of [-1.3, 1.3]) d.chair(x + sx, z, 0x2de2e6, 0.95);
  }
  d.lamp(46, 8, 4.2, 0xff3fa4, 0.9, { distance: 12, room: 'D', flicker: true });
  d.lamp(52, 8, 4.2, 0x2de2e6, 0.9, { distance: 12, room: 'D' });
  d.hideSpot('counter', 54.4, 2.6, 'west', { color: 0x3b1a5a });
  d.savePoint(54.6, 15.2, 'west');
  d.item('token', 'tok1', 49, 14.6);
  // the arcade
  const titles = ['GUS RACER', 'BABY BLAST', 'PALACE PINBALL', 'TOKEN TOSS'];
  titles.forEach((t, i) => d.cabinet(59 + (i % 2) * 6, 3 + Math.floor(i / 2) * 5, i % 2 ? 'west' : 'east', [0x2a4fa0, 0x7a2a8a, 0x1f6f5a, 0xc0262d][i], t));
  d.item('token', 'tok2', 67.6, 11.4);
  d.hideSpot('box', 67.4, 1.8, 'west', { color: 0x2a4fa0 });
  d.lamp(62.5, 6.5, 4.2, 0x2de2e6, 0.9, { distance: 11, room: 'A' });
  // the party room: little Jonathan and Jack, hiding behind a table
  d.table(KIDS[0] + 0.6, KIDS[1], 2.4, 1.4, 0.74, 0xffd23f, { legs: 0x7a2a8a });
  d.target('kids', KIDS[0], KIDS[1] + 1.4, 'south', 'Talk to the two little kids hiding behind the table 👋', null, { reach: 2.0 });
  d.item('token', 'tok3', 67.6, 24.4);
  d.hideSpot('toybox', 57.8, 18, 'east', { color: 0xff7eb6 });
  d.lamp(62.5, 19.5, 4.2, 0xff7eb6, 0.8, { distance: 11, room: 'T' });
  // the prize corner: the claw machine, and the time capsule (brand new)
  d.target('claw', 52, 30.6, 'north', 'Play the claw machine — 3 tokens 🕹️', (g) => {
    d.mesh(G.box, mat(0xc0262d, { rough: 0.4 }), g, { p: [0, 0.6, -0.2], s: [1.2, 1.2, 1.0] });
    d.mesh(G.box, new THREE.MeshStandardMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.25, depthWrite: false }), g, { p: [0, 1.6, -0.2], s: [1.1, 0.8, 0.9], shadow: false });
    for (let i = 0; i < 6; i++) d.mesh(G.sphere, cloth([0xff3b30, 0x3ec1d3, 0x7ad151, 0xa970ff, 0xff9a1f, 0xff7eb6][i]), g, { p: [-0.35 + (i % 3) * 0.35, 1.3, -0.4 + Math.floor(i / 3) * 0.35], s: [0.14, 0.16, 0.12] });
    d.mesh(G.box, mat(0xf2c230, { metal: 0.6 }), g, { p: [0, 2.05, -0.2], s: [1.2, 0.1, 1.0] });
  });
  d.target('capsule', 40, 30.6, 'north', 'Put the key in the time capsule ⏳', (g) => {
    d.mesh(G.box, mat(0xc8d0d8, { metal: 0.6, rough: 0.3 }), g, { p: [0, 0.5, -0.3], s: [1.2, 1.0, 0.7] });
    d.mesh(G.cyl, mat(0xd8d8e0, { metal: 0.7, rough: 0.25 }), g, { p: [0, 1.15, -0.3], s: [0.5, 0.3, 0.5] });
  });
  d.label('TIME CAPSULE\nopen it when the Pizzaplex opens!', 40, 32.96, 2.3, 3.0, 0.6, 'north', { bg: '#14304a', fg: '#ffd23f', glow: '#ffd23f' });
  d.counter(46, 24, 6, 0.9, 1.0, 0x2a4fa0, 0xbfe9ff);
  d.item('plushie', 'plushie', 36.8, 18.6, 0.5);
  d.savePoint(36.6, 25, 'east');
  d.hideSpot('locker', 54.4, 27, 'west', { color: 0x2a4fa0 });
  d.lamp(45, 25, 4.2, 0xfff0c0, 0.8, { distance: 13, room: 'P' });
  d.spots.spawn = P(...SPAWN);
}

const quests = [
  { id: 'dive', type: 'use', target: 'dive', text: 'DIVE into the giant ball pit (E at its edge)', done: 'Down, down, down...' },
  { id: 'kids', type: 'use', target: 'kids', text: 'Find out who\'s hiding in the Party Room (long ago)', done: 'Little Jonathan and Jack!' },
  { id: 'tokens', type: 'collect', item: 'token', count: 3, text: 'Find 3 Gus tokens', done: 'Three tokens!' },
  { id: 'claw', type: 'use', target: 'claw', text: 'Win the Palace door key from the claw machine (Prize Corner)', done: 'Got it! The PALACE DOOR key!' },
  { id: 'capsule', type: 'use', target: 'capsule', text: 'Put the key in the Pizza Palace time capsule', done: 'In it goes. See you in four years, key!' },
  { id: 'home', type: 'use', target: 'home', text: 'Jump back in the ball pit to go home', done: 'Home again!' },
  { id: 'capsule2', type: 'use', target: 'capsule2', text: 'Open the old time capsule in the Palace Wing', done: 'The key! Right where I left it — four years ago!' },
  { id: 'exit', type: 'exit', text: 'Unlock the old PALACE DOOR and get out!' },
  { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
];

const baby = (i, start, extra = {}) => ({
  id: 'babygus', name: 'a baby Gus', build: () => buildBabyGus(i), walk: 1.7, chase: 3.5, sight: 8, hear: 7, hunt: 0.3, lose: 4,
  roam: ['D', 'A', 'T', 'P', 'D'], start, wait: 3 + i * 4, steps: 'cranker', stride: 0.5, shoutWho: 'Baby Gus',
  shout: () => ['Hee hee hee!', 'Play with ME!', 'Found you!'][Math.floor(Math.random() * 3)], ...extra,
});

const KID_LINES = [
  ['Jonathan', 'Shhh! Get DOWN! The baby Gus\'s will hear you!'],
  ['Jack', 'Are you lost too? We ran away from the daycare. And the library. And the school...'],
  ['Thomas', '...Jonathan? JACK?! You\'re so LITTLE!'],
  ['Jonathan', 'Huh? I\'m five. Hey — if you want the claw machine, you need three Gus tokens.'],
  ['Jack', 'And there\'s a time capsule in the Prize Corner. You put stuff in, and it stays there FOREVER.'],
];

export default {
  ...THOMAS,
  id: 'palace',
  name: 'The Pizza Palace',
  layout,
  build,
  mood: MOODS.now,
  zones: { now: NOW_AT, past: { at: [40.5, 6.0], yaw: W, mood: { amb: 0.1, hemi: 0.1, fog: 0.028, bg: 0x08040e }, flashlight: true } },
  spawn: { at: SPAWN, yaw: 0 },
  firstLine: 'The only way out of here is that old Palace door... and it\'s padlocked.',
  winTitle: 'THOMAS GOT THROUGH THE PALACE DOOR!',
  exitText: 'Through the old Palace door! 🏃',
  card: {
    story: '<b>2:10 AM.</b> The only way out of the Giant Ball Pit room tonight is the <b>Palace Wing</b>, and its door is the real front door of the old <b>Gus\'s Giant Pizza Palace</b> — padlocked shut. So <b>Thomas</b> dives in again. This time he comes up four years ago, in the middle of the night... at the Pizza Palace itself.',
    goal: '🫧 Long ago: find out who\'s hiding in the <b>Party Room</b>, find <b>3 Gus tokens</b>, win the door key from the <b>claw machine</b> and put it in the <b>time capsule</b>. Then swim home and open the time capsule in the Palace Wing.',
    watchOut: '👀 <b>Sparky</b> the robot dog is FAST, and he\'s in the Giant Ball Pit room now. Long ago, the <b>baby Gus\'s</b> toddle round the Pizza Palace — they giggle when they see you.',
    after: 'The old Palace door creaked open. On the walkie, Thomas told Jackson about the two little kids behind the table. Jackson was quiet. <i>"Jonathan," he said. "Did you hear that?"</i><br><br><i>"...That was ME,"</i> said <b>Jonathan</b>, who was standing outside the <b>Sleepover Suite</b>, about to knock.',
  },
  friends: [
    '🔵 Jonathan: <b>near the Sleepover Suite</b>',
    '🟣 Max: <b>Sleepover Suite</b> · the night light just broke',
    '🔦 Jackson: <b>Security Office</b> · watching Flipper on CAM 06',
    '🔴 Jack: <b>Workshop</b> · hiding from DJ Rocco',
  ],
  quests,
  enemies: [
    nowBot('sparky', 'Sparky', buildSparky, { walk: 2.2, chase: 4.4, sight: 10, hear: 10, start: [19, 4], wait: 12,
      shout: () => ['WOOF! Wanna play fetch?!', 'Ruff ruff! Found you!', 'Here, kid! Here!'][Math.floor(Math.random() * 3)] }),
    baby(0, [62, 6]),
    baby(1, [47, 9]),
    baby(2, [62, 19], { asleep: true }),
  ],
  tips: {
    sparky: 'Sparky is the fastest thing in the Pizzaplex. Hide in the tube or the curtain BEFORE he sees you — or dive into the ball pit!',
    babygus: 'Baby Gus\'s giggle when they spot you. Run round a corner and hide in the toy box, the box or the locker.',
  },
  start(m) {
    const d = m.decor;
    frozen(m, 'kids', [
      { build: buildLittleJonathan, x: KIDS[0] - 0.3, z: KIDS[1], yaw: S, pose: 'idle', amt: 0.2 },
      { build: buildJack, x: KIDS[0] + 0.5, z: KIDS[1] - 0.2, yaw: S - 0.4, pose: 'idle', amt: 0.2 },
    ]);
    d.exit.setOpen(m.done.has('capsule2'));
    d.padlock.visible = !m.done.has('capsule2');
    if (m.count('token') > 0) for (const e of m.enemies) if (e.id === 'babygus') e.wake();
    setZone(m);
  },
  collect(m, item) {
    if (item.kind === 'token' && m.count('token') === 1) {
      for (const e of m.enemies) if (e.id === 'babygus') e.wake();
      sfx.escGiggle(m.player.pos);
    }
  },
  use(m, t) {
    if (t.id === 'dive') { travel(m, 'past', 'Whoa... it\'s night. And it\'s HUGE. "Gus\'s Giant Pizza Palace"...'); return true; }
    if (t.id === 'home') { travel(m, 'now', 'Back in the Pizzaplex! Now — the time capsule!'); return true; }
    if (t.id === 'kids') {
      KID_LINES.forEach(([who, line], i) => setTimeout(() => {
        if (m.game.mode === 'escape' && m.def.id === 'palace') m.say(line, 3.4, who);
      }, i * 3600));
      return true;
    }
    if (t.id === 'claw') {
      if (m.count('token') < 3) { sfx.repairBad(); m.say(`The claw machine needs 3 tokens. I've got ${m.count('token')}.`, 2.6); return 'pending'; }
      sfx.happy();
      return true;
    }
    if (t.id === 'capsule') { sfx.clang(); return true; }
    if (t.id === 'capsule2') {
      sfx.escUnlock();
      m.decor.exit.setOpen(true);
      m.decor.padlock.visible = false;
      return true;
    }
    return true;
  },
  questDone(m, q) {
    if (q.id === 'home') setTimeout(() => m.say('The time capsule should be in the Palace Wing!', 3), 1600);
  },
};
