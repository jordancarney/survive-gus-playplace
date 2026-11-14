// Chapter 38 — Thomas: Gus's Workshop (4:20 AM).
//
// Long, LONG ago: before the Pizza Shack, before anything. Thomas comes up out of a wooden
// crate full of wooden balls — the Toymaker's first ever ball pit — in the Toymaker's
// workshop, lit by oil lamps, sawdust on the floor. By the big workbench stands Gus, only half
// finished. The Toymaker is frozen with a paintbrush.
//
// The music box needs its key to be stopped, and the key is locked in the Toymaker's desk
// drawer behind a gear lock: three golden gears. Take the key — and that's why, ever since,
// the music box has never stopped. Thomas took the key.
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth, buildPerson, buildAnimatronic } from '../../models.js';
import { buildOld, buildRocco, buildSparky, buildOldGus } from '../cast.js';
import { sfx } from '../../audio.js';
import { E, W, N, S, MOODS, nowRooms, NOW_DOOR, NOW_AT, SPAWN, giantPit, smallPit, frozen, travel, setZone, enemy, THOMAS, nowBot } from './kit.js';
import { toymaker } from './shack.js';

const layout = {
  w: 70, h: 34, wallH: 4.0, panels: false,
  wallColor: 0x2a1a10, headerColor: 0xd8b880,
  ceiling: () => T.wood('#5a3a24'),
  rooms: {
    ...nowRooms({ name: 'Back Hall', floor: () => T.tiles('#5a6670', '#3e4a52'), wall: ['#3a3d44', '#2de2e6', '#22242a', 'panels'] }),
    W: { name: "The Toymaker's Workshop (long, long ago)", short: 'Workshop (past)', x0: 36, z0: 1, x1: 55, z1: 16,
         floor: () => T.wood('#8a6a42'), wall: ['#d8c8a8', '#7a5232', '#5a3a24', 'panels'] },
    P: { name: 'Paint Room (long, long ago)', short: 'Paint Room (past)', x0: 57, z0: 1, x1: 68, z1: 12,
         floor: () => T.wood('#9a7a52'), wall: ['#e8d8b8', '#c0262d', '#7a5232', 'stripes'] },
    R: { name: 'Storeroom (long, long ago)', short: 'Storeroom (past)', x0: 57, z0: 14, x1: 68, z1: 25,
         floor: () => T.wood('#6a4a2a'), wall: ['#8a6a42', '#5a3a24', '#3a2a1a', 'panels'] },
    S: { name: "The Toymaker's Study (long, long ago)", short: 'Study (past)', x0: 36, z0: 18, x1: 55, z1: 32,
         floor: () => T.rug('#7a2a3a', '#d9b45a'), wall: ['#5a2a2a', '#d9b45a', '#3a1a1a', 'stripes'] },
  },
  doors: [
    NOW_DOOR,
    { a: 'W', b: 'P', x0: 56, z0: 5, x1: 56, z1: 7 },
    { a: 'W', b: 'R', x0: 56, z0: 14, x1: 56, z1: 15 },
    { a: 'W', b: 'S', x0: 44, z0: 17, x1: 46, z1: 17 },
  ],
};

function build(d) {
  const P = d.place.P;
  // ── now: the Back Hall, the way back to the others
  giantPit(d, { glow: 0xff9ab8, glow2: 0x2de2e6 });
  d.exitDoor(18, 32.4, 'north', { w: 1.6, label: 'TO THE OTHERS' });
  for (const [x, z] of [[5, 22], [15, 28]]) d.crate(x, z, 1.1, 0x6a5a4a);
  d.hideSpot('locker', 21.4, 24, 'west', { color: 0x4a6ab8 });
  d.hideSpot('box', 1.6, 27, 'east');
  d.lamp(10, 25, 3.6, 0x9fd8ff, 0.7, { distance: 12, room: 'H', flicker: true });

  // ── long, long ago: the Toymaker's workshop
  const wood = mat(0x8a5a32, { rough: 0.7 });
  // the very first ball pit: a crate of wooden balls
  smallPit(d, 40.5, 6.0, { color: 0x8a5a32, sign: 'BALL PIT\n(MY NEW IDEA)', signBg: '#d8c8a8', signFg: '#5a3a24', n: 140 });
  // the big workbench, and Gus on it, half built
  d.table(47.5, 8.5, 5, 2, 0.95, 0x8a5a32, { legs: 0x5a3a24 });
  d.table(52.5, 3, 4, 1.4, 0.95, 0x8a5a32, { legs: 0x5a3a24 });
  for (let i = 0; i < 6; i++) {
    const c = P(51 + i * 0.6, 3, 1.02);
    d.mesh(G.box, mat([0x6a6a72, 0x8a5a32, 0xc0c0c0][i % 3], { metal: i % 3 === 2 ? 0.7 : 0.1 }), d.group, { p: [c.x, c.y, c.z], s: [0.12, 0.08, 0.4] });
  }
  d.hideSpot('box', 37, 14.6, 'east', { color: 0x8a6a42 });
  d.hideSpot('counter', 54.4, 13, 'west', { color: 0x8a5a32 });
  d.savePoint(54.6, 15.4, 'west');
  d.item('gear', 'g1', 53.6, 2.2, 1.1);
  d.hanging(43, 6, 0xffb060, 2.6, { room: 'W' });
  d.hanging(48, 9, 0xffc070, 2.8, { room: 'W' });
  d.hanging(52, 4, 0xffb060, 2.2, { room: 'W', flicker: true });
  // the paint room: pots of paint and Gus's spare faces
  for (const [x, z, c] of [[60, 3, 0x9a6038], [62, 3, 0x5b2a86], [64, 3, 0xffd23f], [66, 3, 0xc0262d]]) {
    d.block(x, z, 0.6, 0.6, 0.6, mat(c, { rough: 0.3 }));
  }
  d.shelf(62.5, 11.6, 9, 0.6, 1.8, 'north', { wood: 0x5a3a24, books: false });
  for (let i = 0; i < 5; i++) {
    const c = P(59 + i * 1.8, 11.6, 1.95);
    d.mesh(G.sphere, mat(0x9a6038, { rough: 0.6 }), d.group, { p: [c.x, c.y, c.z], s: [0.3, 0.32, 0.3] });
  }
  d.item('gear', 'g2', 67.6, 6.5);
  d.hideSpot('locker', 57.8, 9, 'east', { color: 0x5a3a24 });
  d.hanging(62.5, 6.5, 0xffc070, 2.2, { room: 'P' });
  // the storeroom
  for (const [x, z] of [[59, 16], [61, 16], [66.5, 18], [66.5, 21]]) d.crate(x, z, 1.1, 0x7a5a3a);
  d.shelf(62.5, 24.6, 9, 0.6, 2.2, 'north', { wood: 0x5a3a24, books: false });
  d.item('gear', 'g3', 67.4, 24.2);
  d.hanging(62.5, 19.5, 0xffa050, 1.8, { room: 'R', flicker: true });
  // the study: the desk with its gear lock, books, a fire
  d.target('drawer', 46, 29.6, 'north', 'Open the Toymaker\'s gear lock ⚙️', (g) => {
    d.mesh(G.box, wood, g, { p: [0, 0.4, -0.1], s: [2.2, 0.8, 1.0] });
    d.mesh(G.box, mat(0x6a4a2a, { rough: 0.6 }), g, { p: [0, 0.82, -0.1], s: [2.3, 0.05, 1.1] });
    d.gearLock = [0, 1, 2].map((k) => d.mesh(G.cyl, mat(0x5a5a62, { metal: 0.6, rough: 0.4 }), g, { p: [-0.4 + k * 0.4, 0.5, 0.42], s: [0.14, 0.03, 0.14], r: [Math.PI / 2, 0, 0], still: false }));
  });
  d.place.addBlock(44.8, 29.0, 47.2, 30.3, 0.85);
  d.item('mkey', 'mkey', 46, 29.6, 1.05);
  d.bookcase(37.4, 25, 0.8, 8, 2.6);
  d.block(53, 31.6, 2.4, 0.6, 1.2, mat(0x3a2a2a, { rough: 0.8 }));     // the fireplace
  d.patch(53, 30.9, 1.6, 0.8, 0xff7a20, { glow: 0.6 });
  d.item('plushie', 'plushie', 54.6, 18.6, 0.5);
  d.hideSpot('curtain', 54.4, 24, 'west', { color: 0x7a2a3a });
  d.lamp(53, 30.4, 1.0, 0xff8a30, 1.6, { distance: 10, room: 'S', flicker: true });
  d.hanging(42, 24, 0xffb060, 2.2, { room: 'S' });
  d.spots.spawn = P(...SPAWN);
}

const quests = [
  { id: 'dive', type: 'use', target: 'dive', text: 'DIVE into the giant ball pit (E at its edge)', done: 'Down, down, DOWN...' },
  { id: 'gears', type: 'collect', item: 'gear', count: 3, text: 'Find 3 golden gears in the workshop', done: 'Three gears!' },
  { id: 'drawer', type: 'use', target: 'drawer', text: 'Open the gear lock on the Toymaker\'s desk (Study)', done: 'Click... clunk... the drawer opens!' },
  { id: 'mkey', type: 'collect', item: 'mkey', count: 1, text: 'Take the music box key', done: 'The MUSIC BOX KEY!' },
  { id: 'home', type: 'use', target: 'home', text: 'Jump back in the wooden ball pit to go home', done: 'Home again — with the key!' },
  { id: 'exit', type: 'exit', text: 'Take the key to the others — out the Back Hall!' },
  { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
];

export default {
  ...THOMAS,
  id: 'workshop',
  name: "Gus's Workshop",
  layout,
  build,
  mood: MOODS.now,
  zones: { now: NOW_AT, past: { at: [40.5, 6.0], yaw: W, mood: { ...MOODS.lamp, amb: 0.5, hemi: 0.5 }, flashlight: false } },
  spawn: { at: SPAWN, yaw: 0 },
  firstLine: 'The music box needs a key to stop it. Jonathan says it hasn\'t GOT one. ...Yet.',
  winTitle: 'THOMAS GOT THE MUSIC BOX KEY!',
  exitText: 'Take the key to the others! 🗝️',
  card: {
    story: '<b>4:20 AM.</b> Jonathan found Gus\'s music box backstage, but it can\'t be stopped: there\'s a keyhole and no key. <i>"It\'s never had a key,"</i> Jackson said. <b>Thomas</b> thinks about the Toymaker\'s tag. Then he dives deeper than he\'s ever dived — and comes up out of a wooden crate full of wooden balls. Long, LONG ago, in the <b>Toymaker\'s workshop</b>.',
    goal: '🫧 Find <b>3 golden gears</b>, open the gear lock on the <b>Toymaker\'s desk</b>, take the <b>music box key</b>, and bring it home.',
    watchOut: '👀 By the workbench, Gus isn\'t finished yet — but he\'s <b>Gus</b>, and he wakes when you take a gear. An old test robot, <b>Gerald</b>, stomps round the storeroom. Back home it\'s <b>Flipper</b>, <b>Sparky</b> and <b>DJ Rocco</b>.',
    after: 'The key was small and gold and still warm from the Toymaker\'s fire. <i>"So THAT\'s why the music box never stopped,"</i> Thomas whispered. <i>"Because I took the key."</i> But the Back Hall came out a long way from Jonathan, and the quickest way there was through the play tubes.<br><br><b>Timmy</b> held out his hand. <i>"Give it to me. I fit EVERYWHERE."</i>',
  },
  friends: [
    '🔵 Jonathan: <b>Backstage</b> · with the music box',
    '🟣 Max: <b>Sleepover Suite</b>',
    '🔦 Jackson: <b>Security Office</b>',
    '🔴 Jack: <b>Under the Pizzaplex</b> · P.A.L. is rebooting them',
    '⚪ Timmy: <b>the play tubes</b> · waiting for the key',
  ],
  quests,
  enemies: [
    nowBot('flipper', 'Flipper', buildOld('flipper'), { walk: 2.0, chase: 3.9, hear: 11 }),
    nowBot('sparky', 'Sparky', buildSparky, { walk: 2.3, chase: 4.6, sight: 10, hear: 10, start: [19, 30], roam: ['H', 'B', 'H'], wait: 10,
      shout: () => ['WOOF! Wanna play fetch?!', 'Ruff ruff! Found you!'][Math.floor(Math.random() * 2)] }),
    nowBot('rocco', 'DJ Rocco', buildRocco, { walk: 2.4, chase: 4.4, sight: 11, start: [4, 30], roam: ['H', 'B'], wait: 16,
      shout: () => ['Nobody leaves the dance floor!', 'Party time!'][Math.floor(Math.random() * 2)] }),
    { id: 'oldgus', name: 'Gus (unfinished)', build: buildOldGus, walk: 1.9, chase: 3.8, sight: 11, hear: 9, hunt: 0.45, lose: 5,
      roam: ['W', 'P', 'S', 'R', 'W'], start: [47.5, 6.6], yaw: S, wait: 1, asleep: true, steps: 'gus', stride: 1.0, shoutWho: 'Gus',
      shout: () => ['Who... am I?', 'Sing... SING...', 'Don\'t take my KEY!'][Math.floor(Math.random() * 3)] },
    { id: 'oldgerald', name: 'Gerald (a test robot)', build: () => buildAnimatronic('gerald', { old: true }), walk: 1.5, chase: 3.3, sight: 10, hear: 8, hunt: 0.3, lose: 5,
      roam: ['R', 'W', 'R', 'P'], start: [63, 21], wait: 5, steps: 'gerald', stride: 1.1, shoutWho: 'Gerald' },
  ],
  tips: {
    flipper: 'Flipper can hear you run. WALK when he\'s near.',
    sparky: 'Sparky is super fast. Hide before he sees you, or dive into the ball pit!',
    rocco: 'Keep an eye on your Gus Watch tracker: DJ Rocco is fast too.',
    oldgus: 'Gus wakes when you take a gear. Hide in the box, the locker, the counter or behind the curtain when he sees you.',
    oldgerald: 'Gerald is slow. Watch your tracker and go round him.',
  },
  start(m) {
    const d = m.decor;
    frozen(m, 'maker', [{ build: () => buildPerson(toymaker), x: 49.6, z: 10.6, yaw: N + 0.4, pose: 'give', amt: 0.6 }]);
    // the key stays locked away (out of sight, out of reach) until the drawer's open
    const key = d.items.find((i) => i.kind === 'mkey');
    if (!key.home) key.home = key.pos.clone();
    if (!m.done.has('drawer') && !key.found) { key.group.visible = false; key.halo.visible = false; key.pos.set(9999, 0, 9999); }
    else key.pos.copy(key.home);
    for (const g of d.gearLock) g.material.color.set(m.done.has('drawer') ? 0xf2c230 : 0x5a5a62);
    d.exit.setOpen(m.done.has('home'));
    if (m.count('gear') > 0) enemy(m, 'oldgus').wake();
    setZone(m);
  },
  collect(m, item) {
    if (item.kind === 'gear' && m.count('gear') === 1) {
      enemy(m, 'oldgus').wake(1.1);
      sfx.musicBoxSting();
      setTimeout(() => m.say('The half-finished Gus on the bench... just SAT UP.', 3), 1000);
    }
  },
  use(m, t) {
    if (t.id === 'dive') { travel(m, 'past', 'Wooden balls?! Sawdust... lamps... It\'s a WORKSHOP. And that\'s Gus — only half of him!'); return true; }
    if (t.id === 'home') { travel(m, 'now', 'I\'m back! And I\'ve got the KEY!'); return true; }
    if (t.id === 'drawer') {
      sfx.escUnlock();
      const d = m.decor;
      for (const g of d.gearLock) g.material.color.set(0xf2c230);
      const key = d.items.find((i) => i.kind === 'mkey');
      key.pos.copy(key.home);
      m.setFound(key, false);
      return true;
    }
    return true;
  },
  questDone(m, q) {
    if (q.id === 'home') m.decor.exit.setOpen(true);
  },
};
