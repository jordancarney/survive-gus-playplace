// Chapter 25 — Thomas: Years From Now (3:20 AM).
//
// Every dive so far has gone back in time. This one goes FORWARD: Thomas comes up in a ball
// pit he's never seen, in a small, older fun centre — Gus's PlayPlace, years from now, on its
// night guard's second night. Somebody is crying in the ball pit: a little kid in a white
// shirt who fell asleep in there and woke up all alone. Timmy.
//
// Timmy follows Thomas. The PlayPlace's ball pit wants three tickets (they all want
// something), and Cranker and Chomper walk the PlayPlace at night. And in the Security Office,
// frozen at the cameras... a fifteen-year-old Jonathan.
//
// They jump into the ball pit together — and Thomas comes up in the Pizzaplex alone. Timmy is
// somewhere in the balls. (Chapter 27 is his.)
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth, buildTimmy, buildJonathan, buildAnimatronic, poseRig } from '../../models.js';
import { buildOld, buildRocco, buildSparky } from '../cast.js';
import { sfx } from '../../audio.js';
import { E, W, N, S, MOODS, nowRooms, NOW_DOOR, NOW_AT, SPAWN, giantPit, smallPit, frozen, travel, setZone, zone, enemy, Follower, THOMAS, nowBot } from './kit.js';

const layout = {
  w: 70, h: 34, wallH: 4.2, panels: false,
  wallColor: 0x1d1424, headerColor: 0xffd23f,
  ceiling: () => T.tiles('#2a2036', '#1d1626'),
  rooms: {
    ...nowRooms({ name: 'Party Hall', floor: () => T.carpet('#2a0e33'), wall: ['#2a0e33', '#ff3fa4', '#1a0820', 'stars'] }),
    Y: { name: 'PlayPlace Ball Pit (years from now)', short: 'Ball Pit (future)', x0: 36, z0: 1, x1: 55, z1: 16,
         floor: () => T.playmat(), wall: ['#2a4fa0', '#ffd23f', '#1f9fbf', 'bubbles'] },
    D: { name: 'PlayPlace Dining (years from now)', short: 'Dining (future)', x0: 36, z0: 18, x1: 55, z1: 32,
         floor: () => T.checker('#f2f0ea', '#1d1c24'), wall: ['#3b1a5a', '#ff3fa4', '#1d1c24', 'stars'] },
    O: { name: 'Security Office (years from now)', short: 'Security (future)', x0: 57, z0: 1, x1: 68, z1: 12,
         floor: () => T.tiles('#8e9aa0', '#6c777c'), wall: ['#5a6670', '#3e4a52', '#2c3238', 'panels'] },
    S: { name: 'Show Stage (years from now)', short: 'Stage (future)', x0: 57, z0: 14, x1: 68, z1: 25,
         floor: () => T.wood('#7a5232'), wall: ['#5b2a86', '#ffd23f', '#2a1440', 'stars'] },
  },
  doors: [
    NOW_DOOR,
    { a: 'Y', b: 'O', x0: 56, z0: 5, x1: 56, z1: 7 },
    { a: 'Y', b: 'S', x0: 56, z0: 14, x1: 56, z1: 15 },
    { a: 'Y', b: 'D', x0: 44, z0: 17, x1: 46, z1: 17 },
  ],
};

const TIMMY_AT = [42.2, 3.8];

function build(d) {
  const P = d.place.P;
  // ── now
  giantPit(d, { glow: 0xff9ab8, glow2: 0x2de2e6 });
  d.exitDoor(18, 32.4, 'north', { w: 1.6, label: 'EXIT' });
  for (const [x, z] of [[6, 22], [12, 22], [6, 28], [12, 28]]) {
    d.table(x, z, 2.2, 1.2, 0.74, 0xf4f1ea, { legs: 0xc0c0c0 });
    for (const sx of [-1.4, 1.4]) d.chair(x + sx, z, 0xff3fa4, 0.95);
  }
  d.hideSpot('curtain', 1.6, 30.5, 'east', { color: 0xc040ff });
  d.hideSpot('box', 21.4, 22, 'west');
  d.lamp(10, 25, 3.8, 0xc040ff, 0.7, { distance: 11, room: 'H', flicker: true });

  // ── years from now: Gus's PlayPlace, Night 2
  smallPit(d, 40.5, 6.0, { color: 0x3ec1d3, sign: 'BALL PIT\n3 TICKETS', signBg: '#ffd23f', signFg: '#2a4fa0', n: 200 });
  d.label("GUS'S PLAYPLACE", 46, 1.04, 3.0, 5, 0.9, 'south', { bg: '#1b0f3a', fg: '#ffd23f', glow: '#ff3fa4' });
  d.target('timmy', TIMMY_AT[0], TIMMY_AT[1] + 1.2, 'south', 'Talk to the crying kid 👋', null, { reach: 2.2 });
  for (const [x, z] of [[48, 9], [52.5, 5], [52.5, 13]]) d.block(x, z, 0.4, 0.4, 2.4, mat(0x2a4fa0, { rough: 0.4 }));    // play frame posts
  d.hideSpot('tube', 50, 14.6, 'north', { color: 0xff9a1f });
  d.lamp(46, 8, 3.9, 0x9fb8ff, 0.7, { distance: 12, room: 'Y', flicker: true });
  d.item('ticket', 'tk1', 54.6, 2.0);
  // the dining room
  for (const [x, z] of [[40, 22], [46, 22], [52, 22], [40, 28], [46, 28], [52, 28]]) d.table(x, z, 2.0, 1.2, 0.74, 0xd8d0c0, { legs: 0x2a2a30 });
  d.item('ticket', 'tk2', 54.6, 31.4);
  d.hideSpot('counter', 36.8, 30, 'east', { color: 0xc0262d });
  d.savePoint(54.6, 18.6, 'west');
  d.lamp(46, 25, 3.9, 0x9fb8ff, 0.6, { distance: 13, room: 'D' });
  // the Security Office: a desk, the monitors — and its guard, frozen at the cameras
  d.counter(62.5, 2.2, 5, 1.0, 0.8, 0x4a3a2a, 0x6a5a48);
  for (const x of [61, 62.5, 64]) {
    const c = P(x, 2.0, 1.15);
    d.mesh(G.box, lam(0x1a1a1e), d.group, { p: [c.x, c.y, c.z], s: [0.5, 0.36, 0.25] });
    d.mesh(G.plane, glowMat(0x2a8a4a, 0.2), d.group, { p: [c.x, c.y, c.z + 0.13], s: [0.42, 0.28, 1], shadow: false });
  }
  d.item('ticket', 'tk3', 67.6, 11.2);
  d.hideSpot('locker', 57.8, 11.2, 'east', { color: 0x4a6ab8 });
  d.lamp(62.5, 6.5, 3.6, 0xd8e0ff, 0.9, { distance: 9, room: 'O' });
  // the stage, with the five of them standing on it
  d.block(65, 19.5, 6, 9, 0.5, mat(0x5b2a86, { rough: 0.5 }), { solid: false, nav: false });
  const sa = P(62, 15), sb = P(68, 24);
  d.place.raised.push({ x0: sa.x, z0: sa.z, x1: sb.x, z1: sb.z, h: 0.5 });
  d.label("GUS'S PLAYPLACE", 68.96, 19.5, 3.0, 3.0, 0.7, 'west', { bg: '#1b0f3a', fg: '#ffd23f', glow: '#ff3fa4' });
  d.item('plushie', 'plushie', 67.6, 14.6, 0.9);
  d.lamp(63, 19.5, 3.9, 0xff9ab8, 0.8, { distance: 12, room: 'S' });
  d.spots.spawn = P(...SPAWN);
}

const quests = [
  { id: 'dive', type: 'use', target: 'dive', text: 'DIVE into the giant ball pit (E at its edge)', done: 'Down, down, down...' },
  { id: 'timmy', type: 'use', target: 'timmy', text: 'Find who\'s crying in the ball pit', done: 'His name is Timmy. He\'s coming with you.' },
  { id: 'tickets', type: 'collect', item: 'ticket', count: 3, text: 'Find 3 PlayPlace tickets for the ball pit (Timmy stays with you)', done: 'Three tickets!' },
  { id: 'home', type: 'use', target: 'home', text: 'Jump in the ball pit WITH Timmy to go home', done: 'Home again... but where\'s Timmy?' },
  { id: 'exit', type: 'exit', text: 'Get out through the Party Hall and tell Jackson!' },
  { id: 'peek', type: 'visit', room: 'O', optional: true, after: 'dive', text: 'Peek into the Security Office', done: 'Is that... JONATHAN? All grown up?!' },
  { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
];

const TIMMY_LINES = [
  ['Timmy', 'I f-fell asleep in the ball pit... and when I woke up everybody was GONE.'],
  ['Thomas', 'Hey. It\'s okay. I\'m Thomas. I\'m lost too — kind of.'],
  ['Timmy', 'I want my gramma...'],
  ['Thomas', 'Come with me. This ball pit can take us somewhere. We just need three tickets.'],
];

let timmy = null;

export default {
  ...THOMAS,
  id: 'future',
  name: 'Years From Now',
  layout,
  build,
  mood: MOODS.now,
  zones: { now: NOW_AT, past: { at: [40.5, 6.0], yaw: W, mood: MOODS.night, flashlight: true } },
  spawn: { at: SPAWN, yaw: 0 },
  firstLine: 'Every time, the ball pit goes BACK. What if it can go... the other way?',
  winTitle: 'THOMAS CAME BACK FROM THE FUTURE!',
  exitText: 'Out the door — tell Jackson! 🏃',
  card: {
    story: '<b>3:20 AM.</b> Long ago, long ago, long ago — every dive so far has gone backwards. This time <b>Thomas</b> swims down further than ever, and comes up in a ball pit he\'s never seen, in a small fun centre called <b>Gus\'s PlayPlace</b>. It\'s night. Someone is crying in the ball pit. Thomas has gone <b>forward</b>: years from now.',
    goal: '🫧 Find out who\'s crying. Find <b>3 PlayPlace tickets</b> for the ball pit — whoever it is will follow you — and jump in together to go home.',
    watchOut: '👀 At the PlayPlace, <b>Cranker</b> squeaks about and <b>Chomper</b> chews the place up. Back home, <b>Flipper</b>, <b>Sparky</b> and <b>DJ Rocco</b> are all round the Giant Ball Pit now.',
    after: 'Thomas came up through the balls gasping — and alone. <i>"TIMMY?"</i> Nothing. Somewhere under all those balls was a little kid from years from now. On the walkie, Jackson said, <i>"Keep looking. Everyone — keep your eyes open for a kid in a white shirt."</i><br><br>Backstage, <b>Jonathan</b> was standing outside a door with a gold star on it: <b>GUS</b>.',
  },
  friends: [
    '🔵 Jonathan: <b>Backstage</b> · near Gus\'s room',
    '🟣 Max: <b>Sleepover Suite</b>',
    '🔦 Jackson: <b>Security Office</b>',
    '🔴 Jack: <b>Under the Pizzaplex</b> · looking for the Core key',
  ],
  quests,
  enemies: [
    nowBot('flipper', 'Flipper', buildOld('flipper'), { walk: 1.9, chase: 3.9, hear: 11 }),
    nowBot('sparky', 'Sparky', buildSparky, { walk: 2.2, chase: 4.5, sight: 10, hear: 10, start: [19, 30], roam: ['H', 'B', 'H'], wait: 12,
      shout: () => ['WOOF! Wanna play fetch?!', 'Ruff ruff! Found you!'][Math.floor(Math.random() * 2)] }),
    nowBot('rocco', 'DJ Rocco', buildRocco, { walk: 2.3, chase: 4.2, sight: 11, start: [4, 30], roam: ['H', 'B'], wait: 22,
      shout: () => ['Nobody leaves the dance floor!', 'Party time!'][Math.floor(Math.random() * 2)] }),
    { id: 'cranker', name: 'Cranker', build: buildOld('cranker'), walk: 1.6, chase: 3.4, sight: 11, hear: 10, hunt: 0.35, lose: 6,
      roam: ['Y', 'D', 'S', 'D'], start: [52, 28], wait: 4, steps: 'cranker', stride: 0.8, shoutWho: 'Cranker' },
    { id: 'chomper', name: 'Chomper', build: buildOld('chomper'), walk: 2.0, chase: 3.8, sight: 10, hear: 8, hunt: 0.3, lose: 5,
      roam: ['O', 'Y', 'S', 'D'], start: [65, 21], wait: 14, asleep: true, steps: 'chomper', stride: 0.9, shoutWho: 'Chomper' },
  ],
  tips: {
    flipper: 'Flipper can hear you run. WALK when he\'s near.',
    sparky: 'Sparky is super fast. Hide before he sees you!',
    rocco: 'DJ Rocco is fast too. Watch your Gus Watch tracker and keep away from him.',
    cranker: 'Cranker is slow but he never gives up. Walk away and hide — Timmy will hide with you.',
    chomper: 'Chomper wakes up once you have Timmy. Listen for his chewing, and use the tube, the locker or the counter.',
  },
  start(m) {
    const d = m.decor;
    if (!timmy || timmy.mode !== m) timmy = new Follower(m, buildTimmy);
    m.timmy = timmy;
    timmy.hide();
    frozen(m, 'future', [
      { build: buildJonathan, x: 62.5, z: 3.6, yaw: N, pose: 'idle', amt: 0.2 },
      { build: () => buildAnimatronic('gus'), x: 65, z: 19.5, y: 0.5, yaw: W, pose: 'idle', amt: 0.1 },
      { build: () => buildAnimatronic('gerald'), x: 66, z: 16.4, y: 0.5, yaw: W, pose: 'idle', amt: 0.1 },
      { build: () => buildAnimatronic('flipper'), x: 66, z: 22.6, y: 0.5, yaw: W, pose: 'idle', amt: 0.1 },
    ]);
    // Timmy crying in the ball pit, until you find him; following you once you have
    this.crying = !m.done.has('timmy');
    this.cryT = 2;
    if (this.crying) {
      timmy.place(m.place.P(...TIMMY_AT));
      timmy.root.rotation.y = S;
    } else if (!m.done.has('home') && m.flags.zone === 'past') {
      timmy.place(m.player.pos.clone());
    }
    d.exit.setOpen(m.done.has('home'));
    if (m.done.has('timmy')) enemy(m, 'chomper').wake();
    setZone(m);
  },
  update(m, dt) {
    if (!timmy) return;
    if (this.crying) {
      // sobbing in the ball pit
      this.cryT -= dt;
      if (this.cryT <= 0) { this.cryT = sfx.cry(m.place.P(...TIMMY_AT)) + 1.5; }
      timmy.root.position.copy(m.place.P(...TIMMY_AT));
      timmy.t = (timmy.t || 0) + dt;
      poseRig(timmy.rig, 'cry', timmy.t, 1, dt);
      return;
    }
    timmy.update(dt);
  },
  arrive(m, where) {
    // Timmy jumps with you — but he doesn't come up with you at home
    if (where === 'past' && m.done.has('timmy') && !m.done.has('home')) timmy.place(m.player.pos.clone());
    if (where === 'now') timmy.hide();
  },
  use(m, t) {
    if (t.id === 'dive') { travel(m, 'past', 'Where... is this? "Gus\'s PLAYPLACE"? And somebody\'s CRYING...'); return true; }
    if (t.id === 'timmy') {
      this.crying = false;
      TIMMY_LINES.forEach(([who, line], i) => setTimeout(() => {
        if (m.game.mode === 'escape' && m.def.id === 'future') m.say(line, 3.4, who);
      }, i * 3600));
      timmy.place(timmy.pos.clone());
      setTimeout(() => { if (m.game.mode === 'escape' && m.def.id === 'future') { enemy(m, 'chomper').wake(1.1); sfx.chew(m.place.P(65, 21)); } }, 6000);
      return true;
    }
    if (t.id === 'home') {
      if (timmy.root.visible && Math.hypot(timmy.pos.x - m.player.pos.x, timmy.pos.z - m.player.pos.z) > 4) {
        sfx.repairBad();
        m.say('Wait — where\'s Timmy? I can\'t go without him!', 2.6);
        return 'pending';
      }
      travel(m, 'now', 'We made it! ...Timmy? TIMMY?! He was RIGHT behind me!');
      return true;
    }
    return true;
  },
  questDone(m, q) {
    if (q.id === 'home') m.decor.exit.setOpen(true);
  },
};
