// Lost in the Pizzaplex — Timmy's chapters (27, 33, 39, 45). Play tubes hide & seek, the
// designer's call: see js/plex/timmy/tubes.js.
//
// Timmy is six, and he isn't from here: he fell asleep in the ball pit at Gus's PlayPlace,
// years from now, and when Thomas came diving through time (Chapter 25) Timmy followed him
// back. He's the smallest of them all, so he fits where nothing else does.
//
//   27  The Kid in the Ball Pit   the Jungle Gym: a walkie-talkie, 4 glow stars, the gate
//   33  Hide and Seek             DJ Rocco and Sparky count to twenty. Hide until the clock
//                                 runs out — but Sparky can sniff you out if you stay put
//   39  The Tube Maze             the three pieces of the music box key, down the chute
//   45  The Long Way Round        through the tubes in the walls, all the way to the front
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth } from '../../models.js';
import { buildOld, buildRocco, buildSparky } from '../cast.js';
import { buildTubes, updateTubes } from '../timmy/tubes.js';
import { sfx } from '../../audio.js';

const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;

const bot = (id, name, extra) => ({
  id, name, build: buildOld(id), sight: 10, hear: 8, hunt: 0.3, lose: 4, steps: id, stride: 0.9, shoutWho: name, ...extra,
});
const rocco = (extra) => ({ ...bot('rocco', 'DJ Rocco', { walk: 2.2, chase: 4.1, sight: 11, steps: 'gerald', stride: 1.0, ...extra }), build: buildRocco,
  shout: () => ['Found you!', 'Come out, come out!', 'Party time!'][Math.floor(Math.random() * 3)] });
const sparky = (extra) => ({ ...bot('sparky', 'Sparky', { walk: 2.6, chase: 4.6, sight: 9, hear: 10, steps: 'chomper', stride: 0.7, ...extra }), build: buildSparky,
  shout: () => ['Woof! WOOF!', '*sniff sniff*', 'Grrrr...'][Math.floor(Math.random() * 3)] });

// ── The Jungle Gym (27, 33) ─────────────────────────────────────────────
//
// One huge play floor with six play houses in two rows, joined by tubes; the giant ball pit
// in one corner (where Timmy came up), and the gate out in the other.

const jungleLayout = {
  w: 46, h: 36, wallH: 5, panels: false,
  wallColor: 0x1a1430, headerColor: 0xffd23f,
  ceiling: () => T.tiles('#241c3a', '#1a1430'),
  rooms: {
    P: { name: 'Jungle Gym', x0: 1, z0: 1, x1: 44, z1: 24,
         floor: () => T.playmat(), wall: ['#2a1a5a', '#7cff6b', '#ff9a1f', 'bubbles'] },
    B: { name: 'Ball Pit', x0: 1, z0: 26, x1: 16, z1: 34,
         floor: () => T.playmat(), wall: ['#3a2a7a', '#ffd23f', '#1f9fbf', 'bubbles'] },
    G: { name: 'Jungle Gym Gate', short: 'Gate', x0: 30, z0: 26, x1: 44, z1: 34,
         floor: () => T.checker('#f2f0ea', '#2a6ad8'), wall: ['#1b1440', '#2de2e6', '#0e0a24', 'stars'] },
  },
  doors: [
    { a: 'P', b: 'B', x0: 6, z0: 25, x1: 10, z1: 25 },
    { a: 'P', b: 'G', x0: 35, z0: 25, x1: 39, z1: 25 },
  ],
};

const JUNGLE = {
  houses: [
    { x: 6, z: 6, open: 'nesw' }, { x: 22, z: 6, open: 'nesw' }, { x: 38, z: 6, open: 'nesw' },
    { x: 6, z: 18, open: 'nesw' }, { x: 22, z: 18, open: 'nesw' }, { x: 38, z: 18, open: 'nesw' },
  ],
  tubes: [
    [7.5, 6, 20.5, 6], [23.5, 6, 36.5, 6], [7.5, 18, 20.5, 18], [23.5, 18, 36.5, 18],
    [6, 7.5, 6, 16.5], [22, 7.5, 22, 16.5], [38, 7.5, 38, 16.5],
  ],
};

function buildJungle(d) {
  const P = d.place.P;
  buildTubes(d, JUNGLE);
  // the ball pit Timmy came up in
  const wall = mat(0x2a4fa0, { rough: 0.4 });
  d.block(8.5, 27.0, 14, 0.2, 0.7, wall);
  d.block(1.6, 30.5, 0.2, 7, 0.7, wall);
  const a = P(1.8, 27.2), b = P(15.8, 33.8);
  d.place.slowZones.push({ x0: a.x, z0: a.z, x1: b.x, z1: b.z });
  d.balls(1.8, 27.2, 15.8, 33.8, 420);
  d.label('BALL PIT', 8.5, 34.96, 2.8, 3, 0.7, 'north', { bg: '#0a0614', fg: '#ff3fa4', glow: '#ffd23f' });
  // the climbing nets and slides between the houses, for show
  for (const [x, z] of [[14, 12], [30, 12]]) {
    d.block(x, z, 0.2, 0.2, 3.2, mat(0xff3b30, { rough: 0.4 }));
    const c = P(x, z, 1.6);
    d.mesh(G.box, lam(0x2a2030), d.group, { p: [c.x, c.y, c.z], s: [0.04, 3.0, 2.4], shadow: false });
  }
  d.label("GUS'S GIANT JUNGLE GYM", 22.5, 1.04, 3.6, 8, 1.1, 'south', { bg: '#0a0614', fg: '#7cff6b', glow: '#ff9a1f' });
  d.label('🫥 ONLY LITTLE KIDS FIT IN THE TUBES!', 1.04, 12, 2.4, 3.6, 0.5, 'east', { bg: '#2a1a5a', fg: '#ffd23f', glow: '#ffd23f' });
  // the gate out
  d.exitDoor(37, 34.4, 'north', { w: 2.2, label: 'GATE OPEN' });
  d.label('JUNGLE GYM GATE', 37, 34.96, 3.0, 3.2, 0.5, 'north', { bg: '#1b1440', fg: '#2de2e6', glow: '#2de2e6' });
  d.savePoint(2.2, 23.4, 'east');
  d.savePoint(43.4, 12, 'west');
  d.savePoint(31, 33.4, 'north');
  for (const [x, z, c] of [[14, 6, 0xff7eb6], [30, 6, 0x7cff6b], [14, 18, 0x2de2e6], [30, 18, 0xffd23f], [22, 12, 0xc040ff]]) {
    d.lamp(x, z, 4.6, c, 0.9, { distance: 11, room: 'P', flicker: x === 30 && z === 18 });
  }
  d.lamp(8.5, 30.5, 4.4, 0xff9ab8, 0.8, { distance: 10, room: 'B' });
  d.lamp(37, 30, 4.4, 0x9fd8ff, 0.9, { distance: 10, room: 'G' });
  d.spots.spawn = P(9, 30.5);
}

// ── The Tube Maze (39) ──────────────────────────────────────────────────
//
// The Pizzaplex's Tube Tower: nine play houses in a grid with tubes between some of them —
// the bottom row, and the top and sides — so getting from one to the other means crossing
// the open floor. The key's three pieces are in the far
// corners; the laundry chute down to backstage (where Jonathan's waiting) is on the far wall.

const mazeLayout = {
  w: 46, h: 38, wallH: 5, panels: false,
  wallColor: 0x1a1430, headerColor: 0xffd23f,
  ceiling: () => T.tiles('#241c3a', '#1a1430'),
  rooms: {
    M: { name: 'Tube Tower', x0: 1, z0: 1, x1: 44, z1: 36,
         floor: () => T.playmat(), wall: ['#1a2a5a', '#ff3fa4', '#2de2e6', 'bubbles'] },
  },
  doors: [],
};

const MAZE = {
  houses: [6, 22, 38].flatMap((x) => [6, 18, 30].map((z) => ({ x, z, open: 'nesw' }))),
  tubes: [
    [7.5, 6, 20.5, 6], [23.5, 6, 36.5, 6],
    [23.5, 30, 36.5, 30], [7.5, 30, 20.5, 30],
    [6, 7.5, 6, 16.5], [38, 7.5, 38, 16.5],
  ],
};

function buildMaze(d) {
  const P = d.place.P;
  buildTubes(d, MAZE);
  d.label('TUBE TOWER', 22.5, 1.04, 3.6, 6, 1.0, 'south', { bg: '#0a0614', fg: '#ff3fa4', glow: '#2de2e6' });
  // the laundry chute to backstage
  d.target('chute', 22.5, 36.4, 'north', 'Send the key down the chute to the Prop Room ⬇️', (g) => {
    d.mesh(G.box, mat(0x9aa4b0, { metal: 0.6, rough: 0.35 }), g, { p: [0, 1.1, -0.3], s: [1.2, 1.2, 0.3] });
    d.mesh(G.box, lam(0x111111), g, { p: [0, 1.1, -0.14], s: [0.9, 0.6, 0.02] });
  });
  d.label('TUBE CHUTE ↓ PROP ROOM (BACKSTAGE)', 22.5, 36.96, 2.3, 3.8, 0.4, 'north', { bg: '#22242a', fg: '#ffd23f', glow: '#ffd23f' });
  d.exitDoor(44.4, 33, 'west', { w: 1.4, label: 'EXIT TUBE' });
  d.savePoint(2, 12, 'east');
  d.savePoint(43.4, 24, 'west');
  d.savePoint(14, 35.4, 'north');
  for (const [x, z, c] of [[14, 12, 0xff3fa4], [30, 12, 0x2de2e6], [14, 24, 0x7cff6b], [30, 24, 0xffd23f], [22, 34, 0xc040ff]]) {
    d.lamp(x, z, 4.6, c, 0.85, { distance: 11, room: 'M', flicker: c === 0xffd23f });
  }
  d.spots.spawn = P(3, 34);
}

// ── The Long Way Round (45) ─────────────────────────────────────────────
//
// Behind the walls of the Pizzaplex, west to east: the Jungle Gym's back end, behind the
// Arcade, the Kitchen's crawlspace, Storage, and out to the Main Entrance hall. Tubes run
// along every room, with gaps where you have to cross the open floor.

const longLayout = {
  w: 74, h: 22, wallH: 4.2, panels: false,
  wallColor: 0x1a1430, headerColor: 0xffd23f,
  ceiling: () => T.concrete(),
  rooms: {
    J: { name: 'Jungle Gym (back)', short: 'Jungle Gym', x0: 1, z0: 1, x1: 13, z1: 20,
         floor: () => T.playmat(), wall: ['#2a1a5a', '#7cff6b', '#ff9a1f', 'bubbles'] },
    A: { name: 'Behind the Arcade', short: 'Arcade', x0: 15, z0: 1, x1: 29, z1: 20,
         floor: () => T.carpet('#120e33'), wall: ['#120e33', '#2de2e6', '#ff3fa4', 'stars'] },
    K: { name: 'Kitchen Crawlspace', short: 'Kitchen', x0: 31, z0: 1, x1: 45, z1: 20,
         floor: () => T.tiles('#8e9aa0', '#6c777c'), wall: ['#e8f1f2', '#ff5a5f', '#2d6a73', 'panels'] },
    S: { name: 'Storage', x0: 47, z0: 1, x1: 59, z1: 20,
         floor: () => T.concrete(), wall: ['#3a3d44', '#f2c230', '#22242a', 'bricks'] },
    L: { name: 'Main Entrance Hall', short: 'Entrance', x0: 61, z0: 1, x1: 72, z1: 20,
         floor: () => T.checker('#f2f0ea', '#5a1f4f'), wall: ['#5a1f4f', '#ffd23f', '#1d1c24', 'stars'] },
  },
  doors: [
    { a: 'J', b: 'A', x0: 14, z0: 9, x1: 14, z1: 12 },
    { a: 'A', b: 'K', x0: 30, z0: 2, x1: 30, z1: 4 },
    { a: 'K', b: 'S', x0: 46, z0: 16, x1: 46, z1: 19 },
    { a: 'S', b: 'L', x0: 60, z0: 9, x1: 60, z1: 12 },
  ],
};

const LONG = {
  houses: [{ x: 7, z: 10.5, open: 'nesw' }, { x: 22, z: 17, open: 'nesw' }, { x: 38, z: 9, open: 'nesw' }, { x: 53, z: 6, open: 'nesw' }],
  tubes: [
    [8.5, 10.5, 13.4, 10.5], [15.6, 10.5, 20.5, 10.5], [22, 11.5, 22, 15.5],
    [23.5, 17, 28.6, 17], [31.4, 3, 37, 3], [38, 4, 38, 7.5], [39.5, 9, 44.6, 9],
    [47.4, 17.5, 53, 17.5], [53, 7.5, 53, 16.6], [54.5, 6, 58.6, 6],
  ],
};

function buildLong(d) {
  const P = d.place.P;
  buildTubes(d, LONG);
  // a little of each room, so you know where you are
  for (const x of [17, 20, 25, 27]) d.cabinet(x, 1.6, 'south', [0x2a4fa0, 0x7a2a8a, 0x1f6f5a, 0xc0262d][x % 4], 'BACK');
  d.counter(42, 18.5, 6, 1, 1, 0xc8c8d0, 0xe8e8f0);
  for (const x of [33, 36]) d.block(x, 18.6, 1.4, 0.9, 1.3, mat(0x5a6070, { metal: 0.6, rough: 0.4 }));
  for (const [x, z] of [[50, 12], [56, 15], [57, 3]]) d.junk(x, z, 1.3);
  for (const [x, z] of [[64, 4], [69, 4], [64, 17], [69, 17]]) d.block(x, z, 1.4, 1.4, 1.1, mat(0xc0262d, { rough: 0.4 }));
  d.exitDoor(72.4, 10.5, 'west', { w: 2.4, label: 'MAIN ENTRANCE' });
  d.label('MAIN ENTRANCE →', 72.96, 7.5, 2.8, 3.2, 0.6, 'west', { bg: '#5a1f4f', fg: '#ffd23f', glow: '#ffd23f' });
  d.savePoint(2, 3, 'east');
  d.savePoint(29.4, 19.4, 'north');
  d.savePoint(45.4, 1.8, 'west');
  d.savePoint(59.4, 19.4, 'north');
  for (const [x, room, c] of [[7, 'J', 0x7cff6b], [22, 'A', 0x2de2e6], [38, 'K', 0xfff0d0], [53, 'S', 0xffb070], [66, 'L', 0xffd23f]]) {
    d.lamp(x, 10.5, 3.9, c, 0.9, { distance: 12, room, flicker: room === 'S' });
  }
  d.spots.spawn = P(3, 17);
}

// ── Common ──────────────────────────────────────────────────────────────

const friendsLate = [
  '🔵 Jonathan: <b>Backstage</b> · after the music box',
  '🟣 Max: <b>Sleepover Suite</b> · holding the base',
  '🔦 Jackson: <b>Security Office</b> · watching the cameras',
  '🔴 Jack: <b>Tunnels</b> · after P.A.L.\'s Core',
  '🟢 Thomas: <b>Ball Pit</b> · back from the past',
];

const timmyChapter = (o) => {
  const own = o.update;
  return {
    ...o,
    hero: 'timmy',
    update(m, dt) {
      updateTubes(m);
      if (own) own.call(this, m, dt);
    },
  };
};

// ── 27 · The Kid in the Ball Pit ────────────────────────────────────────

const ch27 = timmyChapter({
  id: 'timmy-ballpit',
  name: 'The Kid in the Ball Pit',
  layout: jungleLayout,
  build(d) {
    buildJungle(d);
    d.item('walkie', 'walkie', 14, 12.6, 0.7);
    for (const [id, x, z] of [['s1', 30, 12.6], ['s2', 22, 18], ['s3', 14, 18], ['s4', 42.6, 2.6]]) d.item('star', id, x, z, 0.55);
    d.item('plushie', 'plushie', 2.6, 33.2, 0.5);
  },
  mood: { amb: 0.08, hemi: 0.08, fog: 0.03, bg: 0x05030a },
  spawn: { at: [9, 30.5], yaw: 0 },
  firstLine: 'This isn\'t the PlayPlace... Gramma? GRAMMA?',
  exitText: 'Through the gate! 🏃',
  winTitle: 'TIMMY GOT OUT OF THE JUNGLE GYM!',
  card: {
    story: 'Something small in a white shirt climbed out of the giant ball pit, rubbing its eyes. <b>Timmy</b> is six. He was crying in the ball pit at <b>Gus\'s PlayPlace</b> — years from now — when a big kid called Thomas came up through the balls, and Timmy followed him down. Now Thomas is gone, Flipper is splashing about in the ball pit, and the only way out is through <b>Gus\'s Giant Jungle Gym</b>.',
    goal: '🫥 Find the <b>walkie-talkie</b> Thomas dropped, then <b>4 glow stars</b> to open the Jungle Gym <b>gate</b>. Crawl through the <b>tubes</b> — you\'re the only one small enough to fit!',
    watchOut: '👀 Deep in a <b>tube</b> or in the middle of a <b>play house</b>, nothing can see you or grab you. But if one saw you go in, it waits by the opening — so come out a different way! <b>Flipper</b> can hear you run.',
    after: 'The gate swung open. Timmy\'s walkie crackled: <i>"Timmy? This is Jackson, the night guard. Stay where I can see you on the cameras, okay? We\'re going to get you home."</i><br><br>Backstage, <b>Jonathan</b> was climbing the stairs to the party rooms.',
  },
  friends: [
    '🟢 Thomas: <b>???</b> · looking for you!',
    '🔦 Jackson: <b>Security Office</b>',
    '🔵 Jonathan, 🟣 Max, 🔴 Jack: <b>???</b> · "they\'re nice," says Thomas',
  ],
  quests: [
    { id: 'walkie', type: 'collect', item: 'walkie', count: 1, text: 'Find the walkie-talkie Thomas dropped', done: 'Got the walkie-talkie!' },
    { id: 'stars', type: 'collect', item: 'star', count: 4, text: 'Find 4 glow stars (the yellow ◆ on your map)', done: 'All 4 glow stars — the gate\'s open!' },
    { id: 'exit', type: 'exit', text: 'Go through the Jungle Gym gate!' },
    { id: 'hide', type: 'hide', optional: true, text: 'Hide in a tube or a play house', done: 'Nobody can fit in here but you!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    bot('flipper', 'Flipper', { walk: 1.7, chase: 3.5, hear: 11, roam: ['P', 'B', 'P'], start: [40, 12], wait: 8 }),
    bot('chomper', 'Chomper', { walk: 1.9, chase: 3.6, roam: ['P', 'G', 'P'], start: [30, 22], wait: 14 }),
    sparky({ roam: ['P', 'G', 'B', 'P'], start: [40, 30], asleep: true }),
  ],
  tips: {
    flipper: 'Flipper can hear you run. Crawl into a tube and wait — then come out the OTHER end.',
    chomper: 'Get deep into a tube or the middle of a play house. Nothing can reach you in there!',
    sparky: 'Sparky is super fast. Don\'t race him: dive into the nearest tube.',
  },
  start(m) {
    m.decor.exit.setOpen(m.done.has('stars'));
    if (m.count('star') >= 2) m.enemies.find((e) => e.id === 'sparky').wake(1.1);
  },
  collect(m, item) {
    if (item.kind === 'walkie') {
      setTimeout(() => { if (m.game.mode === 'escape') { sfx.plexWalkie(); m.say('*kshh* Who\'s this? This is Jackson, the night guard.', 3.6, '📻 Jackson'); } }, 700);
      setTimeout(() => { if (m.game.mode === 'escape') m.say('I\'m Timmy. I\'m six. Where\'s my gramma?', 3.2); }, 4600);
      setTimeout(() => { if (m.game.mode === 'escape') { sfx.plexWalkie(); m.say('Find the glow stars, Timmy — they open the gate. And stay in those tubes.', 4, '📻 Jackson'); } }, 8200);
    }
    if (item.kind === 'star' && m.count('star') === 2) {
      m.enemies.find((e) => e.id === 'sparky').wake(1.1);
      sfx.plexBark();
      setTimeout(() => m.say('Was that a... DOG? A robot dog?!', 3), 900);
    }
  },
  questDone(m, q) {
    if (q.id === 'stars') { m.decor.exit.setOpen(true); sfx.escUnlock(); }
  },
});

// ── 33 · Hide and Seek ──────────────────────────────────────────────────

const SNIFF_AFTER = 18;     // seconds in the same hiding place before Sparky smells you there
const SNIFF_WAIT = 6;       // and how long you have to move once he does

const ch33 = timmyChapter({
  id: 'timmy-hideseek',
  name: 'Hide and Seek',
  layout: jungleLayout,
  build(d) {
    buildJungle(d);
    for (const [id, x, z] of [['h1', 14, 2.6], ['h2', 30, 2.6], ['h3', 2.6, 12], ['h4', 42.6, 22.6], ['h5', 22, 6]]) d.item('star', id, x, z, 0.55);
    d.item('plushie', 'plushie', 43, 33, 0.5);
  },
  mood: { amb: 0.07, hemi: 0.07, fog: 0.03, bg: 0x05030a },
  spawn: { at: [22, 22.6], yaw: 0 },
  clock: { seconds: 200, from: 240, minutes: 20 },
  goText: '▶ Ready or not...',
  firstLine: 'They\'re counting! I have to HIDE!',
  winTitle: 'NOBODY FOUND TIMMY!',
  card: {
    story: 'DJ Rocco and Sparky found Timmy in the Jungle Gym — and they want to play a game. <i>"HIDE AND SEEK! We\'ll count to twenty!"</i> If they find him before the timer runs out, they win. Timmy does not want them to win.',
    goal: '⏱ Stay hidden until the <b>timer runs out</b>. Bonus: grab the <b>5 glow stars</b> while they\'re looking somewhere else.',
    watchOut: '🐕 <b>Sparky</b> is a dog — stay in the <b>same hiding place</b> too long and he <b>sniffs you out</b>. When he smells you, MOVE to another tube or play house! <b>DJ Rocco</b> checks every opening.',
    after: 'The buzzer went off. <i>"Aww,"</i> said DJ Rocco. <i>"You\'re good at this, kid."</i> They wandered off to look for someone else to play with.<br><br>In the Pizzaplex kitchen, <b>Jonathan</b> was looking for a way through.',
  },
  friends: friendsLate,
  quests: [
    { id: 'survive', type: 'survive', text: 'Stay hidden until the timer runs out' },
    { id: 'stars', type: 'collect', item: 'star', count: 5, optional: true, text: 'Grab the 5 glow stars', done: 'All 5 stars — and they never saw you!' },
    { id: 'hide', type: 'hide', optional: true, text: 'Hide in a tube or a play house', done: 'Shhh...' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    rocco({ roam: ['P', 'P', 'G', 'B'], start: [20, 12], asleep: true, hunt: 0.6, lose: 5 }),
    sparky({ roam: ['P', 'P', 'B', 'G'], start: [24, 12], asleep: true, hunt: 0.6, lose: 4 }),
  ],
  tips: {
    rocco: 'Hide deep in a tube or the middle of a play house — but keep moving between them!',
    sparky: 'When Sparky smells you ("*sniff sniff*"), leave that hiding place right away for another one.',
  },
  start(m) {
    this.count = 20;
    this.sniff = { zone: null, t: 0, warned: false };
    m.huntK = 1;
    // they count, out loud
    const counting = (n) => {
      if (m.game.mode !== 'escape' || m.def !== this) return;
      if (n > 0) { m.say(`${21 - n}...`, 0.9, '🦝 DJ Rocco'); setTimeout(() => counting(n - 4), 1000); return; }
      m.say('...TWENTY! Ready or not, HERE WE COME!', 3, '🦝 DJ Rocco');
      sfx.plexBark();
      for (const e of m.enemies) e.wake(1.05);
      m.huntK = 2.2;
    };
    setTimeout(() => counting(20), 1200);
  },
  update(m, dt) {
    // Sparky sniffs out a hiding place you stay in too long
    if (!this.sniff) return;
    const s = this.sniff;
    const zone = m.unseen ? this.zoneOf(m) : null;
    if (zone !== s.zone) { s.zone = zone; s.t = 0; s.warned = false; return; }
    if (!zone) return;
    s.t += dt;
    const sp = m.enemies.find((e) => e.id === 'sparky');
    if (sp.state === 'off') return;
    if (s.t > SNIFF_AFTER && !s.warned) {
      s.warned = true;
      sfx.plexBark(sp.pos);
      m.say('*sniff sniff* ...I SMELL YOU! 🐕', 3, '🐕 Sparky');
      m.game.hud.toast('🐕 Sparky smelled you! Move to another hiding place — quick!', 3.5);
      sp.state = 'search';
      sp.searchRun = true;
      sp.goTo(m.player.pos.clone());
    }
    if (s.warned && s.t > SNIFF_AFTER + SNIFF_WAIT) {
      m.unseen = false;
      m.caught(sp, 'Sparky sniffed you out!');
    }
  },
  zoneOf(m) {
    const p = m.player.pos;
    return (m.decor.hiddenZones || []).find((z) => {
      const a = m.place.P(z.x0, z.z0), b = m.place.P(z.x1, z.z1);
      return p.x > a.x && p.x < b.x && p.z > a.z && p.z < b.z;
    }) || null;
  },
  questDone(m, q) { if (q.id === 'survive') m.win(); },
});

// ── 39 · The Tube Maze ──────────────────────────────────────────────────

const ch39 = timmyChapter({
  id: 'timmy-maze',
  name: 'The Tube Maze',
  layout: mazeLayout,
  build(d) {
    buildMaze(d);
    d.item('keypiece', 'k1', 6, 6);
    d.item('keypiece', 'k2', 38, 6);
    d.item('keypiece', 'k3', 38, 30);
    for (const [id, x, z] of [['m1', 14, 24], ['m2', 30, 12], ['m3', 22, 30]]) d.item('star', id, x, z, 0.55);
    d.item('plushie', 'plushie', 2.4, 2.4, 0.5);
  },
  mood: { amb: 0.07, hemi: 0.07, fog: 0.03, bg: 0x05030a },
  spawn: { at: [3, 34], yaw: Math.PI / 4 },
  firstLine: 'Jonathan needs the key pieces... I can get into places he can\'t.',
  exitText: 'Crawl out the exit tube! 🐛',
  winTitle: 'TIMMY SENT THE KEY!',
  card: {
    story: 'Thomas brought the <b>music box key</b> back from long, long ago — but the ball pit spat it out in <b>three pieces</b>, and they bounced off into the <b>Tube Tower</b>, where only somebody very small can reach. Jonathan needs it backstage to stop the music box. <i>"Give it to me,"</i> said Timmy. <i>"I fit EVERYWHERE."</i>',
    goal: '🗝️ Find the <b>3 pieces of the music box key</b>, send them down the <b>tube chute</b> to the backstage Prop Room for Jonathan, and crawl out the <b>exit tube</b>.',
    watchOut: '⚠️ The tubes don\'t join up everywhere — sometimes you have to run across the open floor. <b>Gerald</b>, <b>Cranker</b> and <b>DJ Rocco</b> are on it.',
    after: 'The key pieces rattled all the way down the tube chute and landed at the end of the tube in the backstage <b>Prop Room</b>, right where Jonathan would find them. <i>"I heard them land! Timmy, you\'re a hero!"</i><br><br>Now <b>Jonathan</b> just had to get the key — and stop the music box.',
  },
  friends: friendsLate,
  quests: [
    { id: 'keys', type: 'collect', item: 'keypiece', count: 3, text: 'Find the 3 pieces of the music box key', done: 'All three pieces!' },
    { id: 'chute', type: 'use', target: 'chute', text: 'Send them down the tube chute to the Prop Room', done: 'Down they go!' },
    { id: 'exit', type: 'exit', text: 'Crawl out the exit tube!' },
    { id: 'stars', type: 'collect', item: 'star', count: 3, optional: true, text: 'Find 3 glow stars', done: 'Three stars!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    bot('gerald', 'Gerald', { walk: 1.9, chase: 3.7, roam: ['M'], start: [30, 24], wait: 6 }),
    bot('cranker', 'Cranker', { walk: 1.6, chase: 3.4, hear: 10, roam: ['M'], start: [14, 12], wait: 10 }),
    rocco({ roam: ['M'], start: [30, 34], wait: 20 }),
  ],
  tips: {
    gerald: 'Look before you leave a tube. If something\'s near the end, crawl back and go the other way.',
    cranker: 'Cranker is slow but he can hear you running. Walk across the open floor when he\'s near.',
    rocco: 'DJ Rocco is fast. Only cross the open floor when he\'s far away — check your Gus Watch (G)!',
  },
  start(m) { m.decor.exit.setOpen(m.done.has('chute')); },
  questDone(m, q) {
    if (q.id === 'chute') {
      m.decor.exit.setOpen(true);
      sfx.escUnlock();
      setTimeout(() => { if (m.game.mode === 'escape') { sfx.plexWalkie(); m.say('I heard them land in the Prop Room! You\'re a hero, Timmy! Now get out of there!', 3.8, '📻 Jonathan'); } }, 900);
    }
  },
});

// ── 45 · The Long Way Round ─────────────────────────────────────────────

const ch45 = timmyChapter({
  id: 'timmy-longway',
  name: 'The Long Way Round',
  layout: longLayout,
  build(d) {
    buildLong(d);
    for (const [id, x, z] of [['l1', 22, 3], ['l2', 38, 15], ['l3', 56, 18.4]]) d.item('star', id, x, z, 0.55);
    d.item('plushie', 'plushie', 44.4, 15.4, 0.5);
  },
  mood: { amb: 0.07, hemi: 0.07, fog: 0.032, bg: 0x05030a },
  spawn: { at: [3, 17], yaw: -Math.PI / 2 },
  firstLine: 'Jackson says the front doors open at 6. I have to get there the long way...',
  exitText: 'Out to the Main Entrance! 🏃',
  winTitle: 'TIMMY MADE IT TO THE FRONT!',
  card: {
    story: 'It\'s 5 AM. At 6 the Pizzaplex\'s front doors unlock, and everyone is meeting at the <b>Main Entrance</b>. The halls are full of animatronics — but there\'s another way: the tubes that run behind the walls, from the Jungle Gym all the way to the front.',
    goal: '🐛 Go the long way round: <b>behind the Arcade</b>, through the <b>Kitchen crawlspace</b> and <b>Storage</b>, and out to the <b>Main Entrance</b>.',
    watchOut: '⚠️ The tubes have gaps: <b>Chomper</b> is behind the Arcade, <b>Sparky</b> in the Kitchen, <b>Gerald</b> in Storage — and <b>DJ Rocco</b> goes everywhere.',
    after: 'Timmy tumbled out of the last tube into the Main Entrance hall — and somebody grabbed his hand. It was Thomas. <i>"Told you I\'d find you."</i><br><br>Somewhere backstage, <b>Jonathan</b> was running for the front too.',
  },
  friends: friendsLate,
  quests: [
    { id: 'arcade', type: 'visit', room: 'A', text: 'Get behind the Arcade', done: 'Behind the Arcade.' },
    { id: 'kitchen', type: 'visit', room: 'K', text: 'Through the Kitchen crawlspace', done: 'Made it through the kitchen.' },
    { id: 'storage', type: 'visit', room: 'S', text: 'Into Storage', done: 'In Storage. Nearly there!' },
    { id: 'exit', type: 'exit', text: 'Out to the Main Entrance!' },
    { id: 'stars', type: 'collect', item: 'star', count: 3, optional: true, text: 'Find 3 glow stars on the way', done: 'Three stars!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    bot('chomper', 'Chomper', { walk: 2.0, chase: 3.8, roam: ['A'], start: [26, 10], wait: 4 }),
    sparky({ roam: ['K'], start: [42, 12], wait: 6 }),
    bot('gerald', 'Gerald', { walk: 1.9, chase: 3.7, roam: ['S'], start: [56, 10], wait: 8 }),
    rocco({ roam: ['A', 'K', 'S', 'L'], start: [66, 10], wait: 25 }),
  ],
  tips: {
    chomper: 'Wait in the tube until Chomper walks away, then run for the next one.',
    sparky: 'Sparky is fast — never cross the kitchen floor while he\'s looking your way.',
    gerald: 'Gerald guards Storage. Use the play house in the middle of it to hide.',
    rocco: 'DJ Rocco wanders everywhere. Check your Gus Watch (G) to see where he is.',
  },
  start(m) { m.decor.exit.setOpen(m.done.has('storage')); },
  questDone(m, q) {
    if (q.id === 'storage') { m.decor.exit.setOpen(true); sfx.escUnlock(); }
  },
});

export default { 27: ch27, 33: ch33, 39: ch39, 45: ch45 };
