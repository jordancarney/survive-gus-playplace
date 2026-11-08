// Level 1 — Pjork's Daycare, from the designer's map.
//
// Along the top: the Bathrooms, the Lobby (the Check-in Desk, Pickup and the front door), the
// Bedrooms (your bed) and the Generator Room with the Night Bot chargers. Down the right side:
// Storage — DO NOT ENTER — with a bunch o' junk. Everything else is the big Play Area: Pjork
// the pig's stage, the play structure with its hiding spot, the slides, the swings, the ball
// pit and the pool.
//
// The power's off and the front door is locked. Find three fuses, put them in the generator
// — and the moment it starts, every Night Bot comes for you. Pjork only moves when you aren't
// looking at him.
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth } from '../../models.js';
import { sfx } from '../../audio.js';
import { buildNightBot, buildPjork } from '../cast.js';

const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;

const layout = {
  w: 48, h: 36, wallH: 3.2, panels: false,
  wallColor: 0x2a2240, headerColor: 0xe8e0d0,
  ceiling: () => T.tiles('#d8d0e8', '#b8b0c8'),
  rooms: {
    B: { name: 'Bathrooms', x0: 1, z0: 1, x1: 12, z1: 9,
         floor: () => T.tiles('#e8f4f8', '#b8d0d8'), wall: ['#bfe9ff', '#ffffff', '#7fb8d8', 'panels'] },
    L: { name: 'Check-in & Pickup', short: 'Check-in', x0: 14, z0: 1, x1: 21, z1: 9,
         floor: () => T.checker('#f2f0ea', '#3a6ab8'), wall: ['#ffe9a0', '#ff7eb6', '#3a6ab8', 'stars'] },
    S: { name: 'Bedrooms', x0: 23, z0: 1, x1: 36, z1: 9,
         floor: () => T.carpet('#2a3a6a'), wall: ['#2a3a6a', '#ffd23f', '#1a2448', 'stars'] },
    G: { name: 'Generator Room', short: 'Generator', x0: 38, z0: 1, x1: 46, z1: 9,
         floor: () => T.concrete(), wall: ['#4a4d55', '#f2c230', '#2b2d33', 'bricks'] },
    P: { name: 'Play Area', x0: 1, z0: 11, x1: 36, z1: 34,
         floor: () => T.playmat(), wall: ['#ff9ab8', '#ffd23f', '#5aa86a', 'bubbles'] },
    J: { name: 'Storage', x0: 38, z0: 11, x1: 46, z1: 34,
         floor: () => T.concrete(), wall: ['#3a3d44', '#ff3b30', '#22242a', 'bricks'] },
  },
  doors: [
    { a: 'B', b: 'L', x0: 13, z0: 5, x1: 13, z1: 6 },
    { a: 'L', b: 'S', x0: 22, z0: 5, x1: 22, z1: 6 },
    { a: 'S', b: 'G', x0: 37, z0: 5, x1: 37, z1: 6 },
    { a: 'B', b: 'P', x0: 6, z0: 10, x1: 7, z1: 10 },
    { a: 'L', b: 'P', x0: 16, z0: 10, x1: 19, z1: 10 },
    { a: 'S', b: 'P', x0: 28, z0: 10, x1: 30, z1: 10 },
    { a: 'G', b: 'J', x0: 45, z0: 10, x1: 46, z1: 10 },
    { a: 'P', b: 'J', x0: 37, z0: 27, x1: 37, z1: 28 },
  ],
};

function build(d) {
  const P = d.place.P;
  const night = 0x9fb8ff, warm = 0xffd8a0;

  // ── Bedrooms: little beds along the wall, yours and Jack's in the middle
  const blankets = [0x7fb8a8, 0xff9ab8, 0x3a6ab8, 0xc0262d, 0xffd23f, 0xa970ff];
  [24.6, 26.9, 29.2, 31.5, 33.8, 36.1].forEach((x, i) => {
    if (x > 35.5) return;
    d.bed(x, 2.3, 'south', blankets[i]);
  });
  d.label('JONATHAN', 29.2, 1.06, 1.3, 0.9, 0.22, 'south', { bg: '#3a6ab8', fg: '#fff', glow: '#ffd23f' });
  d.label('JACK', 31.5, 1.06, 1.3, 0.9, 0.22, 'south', { bg: '#c0262d', fg: '#fff', glow: '#ffd23f' });
  d.hideSpot('bed', 25.5, 7.6, 'north', { color: 0x5aa86a });
  d.hideSpot('toybox', 35.2, 7.7, 'west', { color: 0x2a4fa0 });
  d.window(27, 1.03, 2.0, 1.2, 0.7, 'south');
  d.window(33, 1.03, 2.0, 1.2, 0.7, 'south');
  d.rug(30, 6, 5, 2.4, '#2a4fa0', '#ffd23f');
  d.lamp(24, 6, 0.5, night, 1.6, { distance: 6, room: 'S' });        // night lights by the floor
  d.lamp(35.6, 5, 0.5, night, 1.6, { distance: 6, room: 'S' });
  d.savePoint(30.2, 8.4, 'north');
  d.spots.spawn = P(29.2, 4.4);

  // ── Bathrooms: stalls along the wall, a row of little sinks, a shower
  for (let k = 0; k < 4; k++) {
    const x = 2.0 + k * 1.7;
    d.block(x + 0.85, 2.1, 0.06, 2.2, 1.7, 0xff9ab8);                 // stall walls
    d.block(x + 0.4, 1.7, 0.36, 0.5, 0.36, mat(0xf4f6f8, { rough: 0.2 }), { solid: false });   // toilets
  }
  for (let k = 0; k < 5; k++) d.block(2.2 + k * 1.3, 9.7, 0.6, 0.5, 0.65, mat(0xf4f6f8, { rough: 0.2 }));
  d.hideSpot('curtain', 10.8, 3.2, 'south', { color: 0x7fd0f0 });
  d.item('fuse', 'fuse1', 9.0, 2.0, 0.5);
  d.lamp(6, 5, 2.9, 0xcfe8ff, 1.8, { distance: 8, room: 'B', flicker: true });

  // ── Check-in & Pickup: the desk, cubbies of backpacks, and the locked front door
  d.counter(16.2, 4.2, 2.6, 0.8, 1.0, 0xff7eb6);
  d.label('CHECK-IN', 16.2, 3.78, 1.25, 1.2, 0.28, 'north', { bg: '#ff7eb6', fg: '#fff', glow: '#ffd23f' });
  d.label('PICKUP', 21.96, 4.8, 1.9, 1.0, 0.3, 'west', { bg: '#3a6ab8', fg: '#ffd23f', glow: '#ffd23f' });
  d.shelf(21.65, 7.6, 0.6, 2.4, 1.2, 'west', { wood: 0xffd23f, books: false });
  for (let k = 0; k < 4; k++) {
    const c = P(21.35, 6.7 + k * 0.6, 0.85);
    d.mesh(G.box, cloth([0xc0262d, 0x2a4fa0, 0x2f8f3a, 0xa970ff][k]), d.group, { p: [c.x, c.y, c.z], s: [0.28, 0.3, 0.22] });
  }
  d.exitDoor(18, 1.6, 'south', { w: 1.8 });
  d.label("PJORK'S DAYCARE", 18, 1.04, 2.85, 2.6, 0.42, 'south', { bg: '#ff7eb6', fg: '#fff', glow: '#ffd23f' });
  d.savePoint(14.8, 8.4, 'north');
  d.lamp(18, 5, 2.9, warm, 2.0, { distance: 9, room: 'L' });

  // ── Generator Room: the generator, and three Night Bot chargers
  d.target('generator', 42, 2.0, 'south', 'Put the fuses in the generator', (g) => {
    const steel = mat(0x5a6070, { metal: 0.6, rough: 0.4 });
    d.mesh(G.box, steel, g, { p: [0, 0.7, 0], s: [2.4, 1.4, 1.2] });
    d.mesh(G.box, lam(0xf2c230), g, { p: [0, 1.15, 0.61], s: [1.6, 0.3, 0.02] });
    for (let k = 0; k < 3; k++) d.mesh(G.box, lam(0x111111), g, { p: [-0.5 + k * 0.5, 0.7, 0.61], s: [0.3, 0.2, 0.02] });
    d.genFuses = [0, 1, 2].map((k) => {
      const m = d.mesh(G.cyl, glowMat(0xfff4c8, 0.4), g, { p: [-0.5 + k * 0.5, 0.7, 0.63], s: [0.06, 0.24, 0.06], r: [0, 0, Math.PI / 2], still: false });
      m.visible = false;
      return m;
    });
    d.mesh(G.cyl, steel, g, { p: [0.9, 1.7, -0.3], s: [0.12, 0.8, 0.12] });
  });
  d.place.addBlock(40.8, 1.4, 43.2, 2.6, 1.4);
  d.label('GENERATOR', 42, 2.62, 1.55, 1.4, 0.3, 'south', { bg: '#2b2d33', fg: '#f2c230', glow: '#f2c230' });
  d.chargers = [39.6, 42, 44.4].map((x) => {
    d.patch(x, 8.4, 1.3, 1.3, 0x4a6ab8, { glow: 0.25 });
    d.block(x, 9.7, 1.0, 0.5, 2.1, mat(0x9aa4b0, { metal: 0.5, rough: 0.4 }));
    const m = glowMat(0x5ad1ff, 0.4);
    const c = P(x, 9.43, 1.6);
    d.mesh(G.box, m, d.group, { p: [c.x, c.y, c.z], s: [0.5, 0.12, 0.02], shadow: false });
    return m;
  });
  d.label('NIGHT BOT CHARGERS', 42, 9.96, 2.5, 2.6, 0.32, 'north', { bg: '#1a2448', fg: '#5ad1ff', glow: '#5ad1ff' });
  d.lamp(42, 5, 2.9, 0xffe2b0, 1.4, { distance: 8, room: 'G', flicker: true });

  // ── Storage: DO NOT ENTER. Shelves of boxes and a bunch o' junk
  for (const [x, z] of [[40.5, 15], [44.5, 19], [40.3, 24], [44.2, 27.5]]) d.junk(x, z, 1.5);
  d.shelf(39, 31, 0.8, 4, 2.4, 'east', { wood: 0x6a6a72, books: false });
  for (let k = 0; k < 4; k++) d.crate(38.9, 29.6 + k * 0.9, 0.6, 0x8a6a42);
  d.hideSpot('box', 39.4, 13.4, 'east');
  d.item('fuse', 'fuse3', 44.7, 32.4, 0.5);
  d.label('DO NOT ENTER', 46, 11.04, 2.5, 1.6, 0.36, 'south', { bg: '#2a0606', fg: '#ff3b30', glow: '#ff3b30' });
  d.label('DO NOT\nENTER', 37.04, 27.5, 2.1, 0.9, 0.6, 'west', { bg: '#2a0606', fg: '#ff3b30', glow: '#ff3b30' });
  d.lamp(42.5, 22, 2.9, 0xffb070, 1.0, { distance: 8, room: 'J', flicker: true });

  // ── The Play Area
  // Pjork's stage, against the west wall
  d.block(2.6, 20, 3.2, 8, 0.5, 0x5b2a86, { solid: false, nav: false });
  const a = P(1, 16), b = P(4.2, 24);
  d.place.raised.push({ x0: a.x, z0: a.z, x1: b.x, z1: b.z, h: 0.5 });
  const curtain = cloth(0xc0262d);
  for (const z of [15.9, 24.1]) d.block(2.4, z, 2.6, 0.2, 3.0, curtain, { solid: false, nav: false });
  d.label("PJORK THE PIG'S\nSTAGE", 1.04, 20, 2.6, 2.4, 0.7, 'east', { bg: '#ff9ab8', fg: '#5b2a86', glow: '#ffd23f' });
  d.lamp(5, 20, 2.9, 0xff9ab8, 1.6, { distance: 9, room: 'P' });

  // the play structure: towers, a bridge, and the hiding spot in its tube
  const tower = mat(0x2a4fa0, { rough: 0.4 });
  for (const [x, z] of [[9, 14], [14, 14], [9, 18], [14, 18]]) d.block(x, z, 0.25, 0.25, 2.4, tower);
  d.block(11.5, 14, 5.2, 1.4, 0.12, mat(0xffd23f, { rough: 0.4 }), { y: 1.4, solid: false, nav: false });
  d.block(11.5, 18, 5.2, 1.4, 0.12, mat(0xffd23f, { rough: 0.4 }), { y: 1.4, solid: false, nav: false });
  d.block(11.5, 14, 5.4, 1.6, 0.15, mat(0xd11f2a, { rough: 0.4 }), { y: 2.4, solid: false, nav: false });
  d.block(11.5, 18, 5.4, 1.6, 0.15, mat(0xd11f2a, { rough: 0.4 }), { y: 2.4, solid: false, nav: false });
  d.hideSpot('tube', 11.5, 16, 'east', { color: 0x2f8f3a });
  d.label('HIDING SPOT', 11.5, 17.0, 1.75, 1.2, 0.25, 'south', { bg: '#2f8f3a', fg: '#fff', glow: '#ffd23f' });
  d.hideSpot('toybox', 7.2, 21.5, 'east', { color: 0xffd23f });

  // the slides: two towers with ladders and long chutes down to the floor
  for (const [x, z, len] of [[23.5, 13, 7], [28.5, 13, 9]]) {
    d.block(x, z, 1.6, 1.6, 2.2, mat(0xff9a1f, { rough: 0.4 }));
    const g = d.anchor(x, z + 0.8 + len / 2, 'south', 0);
    const chute = mat(0x3ec1d3, { rough: 0.3 });
    d.mesh(G.box, chute, g, { p: [0, 1.1, 0], s: [0.9, 0.08, len + 0.6], r: [Math.atan2(2.0, len), 0, 0] });
    for (const sx of [-1, 1]) d.mesh(G.box, chute, g, { p: [sx * 0.45, 1.25, 0], s: [0.06, 0.25, len + 0.6], r: [Math.atan2(2.0, len), 0, 0] });
    d.place.addBlock(x - 0.45, z + 0.8, x + 0.45, z + 0.8 + len * 0.55, 1.0);
  }
  d.label('SLIDES', 26, 11.05, 2.6, 1.4, 0.36, 'south', { bg: '#3ec1d3', fg: '#fff', glow: '#ffd23f' });

  // the swings
  const frame = mat(0xd11f2a, { rough: 0.4, metal: 0.4 });
  for (const x of [14.5, 20.5]) for (const z of [25, 28]) d.block(x, z, 0.12, 0.12, 2.6, frame);
  d.block(17.5, 25, 6.2, 0.12, 0.12, frame, { y: 2.55, solid: false, nav: false });
  d.block(17.5, 28, 6.2, 0.12, 0.12, frame, { y: 2.55, solid: false, nav: false });
  for (const x of [16, 17.5, 19]) {
    d.block(x, 26.5, 0.5, 0.25, 0.04, 0x222222, { y: 0.55, solid: false, nav: false });
    const c = P(x, 26.5, 1.6);
    d.mesh(G.cyl, lam(0x888888), d.group, { p: [c.x - 0.22, c.y, c.z], s: [0.01, 2.0, 0.01] });
    d.mesh(G.cyl, lam(0x888888), d.group, { p: [c.x + 0.22, c.y, c.z], s: [0.01, 2.0, 0.01] });
  }
  d.label('SWINGS', 17.5, 24.9, 2.85, 1.4, 0.3, 'south', { bg: '#d11f2a', fg: '#fff', glow: '#ffd23f' });
  d.savePoint(18, 31.6, 'north');

  // the ball pit: knee-deep in balls (slow going), and a fuse somewhere in it
  for (const [x, z, w, dd] of [[30.5, 26.6, 9, 0.2], [30.5, 34.4, 9, 0.2], [26.1, 30.5, 0.2, 8], [34.9, 30.5, 0.2, 8]]) {
    if (x === 26.1) {   // the way in
      d.block(x, 27.6, w, 2.0, 0.6, mat(0x2a4fa0), { solid: true });
      d.block(x, 32.6, w, 3.6, 0.6, mat(0x2a4fa0), { solid: true });
    } else d.block(x, z, w, dd, 0.6, mat(0x2a4fa0));
  }
  const pa = P(26.3, 26.8), pb = P(34.7, 34.2);
  d.place.slowZones.push({ x0: pa.x, z0: pa.z, x1: pb.x, z1: pb.z });
  d.balls(26.4, 26.9, 34.6, 34.1, 320);
  d.label('BALL PIT', 30.5, 26.45, 1.6, 1.6, 0.34, 'north', { bg: '#2a4fa0', fg: '#ffd23f', glow: '#ff3fa4' });
  d.item('fuse', 'fuse2', 32.4, 31.8, 0.55);

  // the pool: a shallow kiddie pool you splash through
  d.patch(7, 30.5, 9, 6, 0x3a90c8, { y: 0.03 });
  d.patch(7, 30.5, 8.4, 5.4, 0x5ab8e8, { y: 0.05 });
  for (const [x, z, w, dd] of [[7, 27.4, 9.2, 0.2], [7, 33.6, 9.2, 0.2], [2.4, 30.5, 0.2, 6.2]]) d.block(x, z, w, dd, 0.4, mat(0xf4f1ea));
  const qa = P(2.6, 27.6), qb = P(11.4, 33.4);
  d.place.slowZones.push({ x0: qa.x, z0: qa.z, x1: qb.x, z1: qb.z });
  d.label('POOL', 7, 27.25, 1.3, 1.2, 0.3, 'north', { bg: '#3a90c8', fg: '#fff', glow: '#ffd23f' });

  // the secret: a golden Gus plushie behind the stage curtain
  d.item('plushie', 'plushie', 1.7, 15.3, 0.4);

  for (const [x, z] of [[10, 22], [22, 20], [30, 21], [18, 15]]) d.lamp(x, z, 2.9, 0xffc8e0, 1.1, { distance: 8, room: 'P' });
  d.rug(19, 20, 4, 3, '#ffd23f', '#ff7eb6');
  d.hideSpot('toybox', 33.5, 18, 'west', { color: 0xa970ff });
}

const nightBot = (n, start, wait, roam, extra = {}) => ({
  id: 'nightbot', name: 'a Night Bot', build: buildNightBot, walk: 1.9, chase: 3.9, sight: 11, hear: 8,
  roam, start, wait, hunt: 0.25, steps: 'gerald', stride: 1.0, ...extra,
  shout: () => ['Bedtime, little one...', 'Back to bed!', 'I see you!'][Math.floor(Math.random() * 3)],
});

export default {
  id: 'daycare',
  name: "Pjork's Daycare",
  layout,
  build,
  intro: 'daycareIntro',
  mood: { amb: 0.085, hemi: 0.08, fog: 0.035, bg: 0x05040c },
  spawn: { at: [29.2, 4.4], yaw: N },
  firstLine: 'The front door is locked... We need to turn the power on!',
  card: {
    story: 'It\'s the middle of the night at <b>Pjork\'s Daycare</b>. Jonathan and his best friend <b>Jack</b> just saw a <b>Night Bot</b> go after Miss Penny. The power is off and the front door is locked.',
    goal: '⌚ Find the <b>3 fuses</b>, put them in the <b>generator</b>, then run out the <b>front door</b> by the Check-in Desk.',
    watchOut: '👀 <b>Night Bots</b> walk the halls — hide if one sees you. And <b>Pjork the pig</b> never leaves his stage... but he moves when you aren\'t looking. Don\'t get too close!',
    after: 'The generator roared, the front door clicked open, and Jonathan and Jack ran out into the night — across the street, to the only building with a light on: <b>the town library</b>.',
  },
  quests: [
    { id: 'fuses', type: 'collect', item: 'fuse', count: 3, text: 'Find 3 fuses (the yellow ◆ on your map)', done: 'Found all 3 fuses!' },
    { id: 'power', type: 'use', target: 'generator', text: 'Put the fuses in the generator (Generator Room)', done: 'The power is back on!' },
    { id: 'exit', type: 'exit', text: 'RUN out the front door by the Check-in Desk!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    nightBot(1, [39.6, 8.4], 6, ['P', 'S', 'B', 'L', 'G']),
    nightBot(2, [42, 8.4], 18, ['P', 'J', 'G', 'S', 'L']),
    nightBot(3, [44.4, 8.4], 0, ['P', 'L', 'S', 'G', 'J', 'B'], { asleep: true }),
    // He never leaves his stage (the designer's call) — but he moves about on it when you
    // aren't looking, so don't walk too close.
    { id: 'pjork', kind: 'watcher', name: 'Pjork', build: buildPjork, start: [2.8, 20], yaw: E, speed: 5.0, reach: 1.3,
      area: [1.5, 16.5, 4.0, 23.5] },
  ],
  tips: {
    nightbot: 'When a Night Bot sees you, run round a corner and hide in a toy box or the tube — if it didn\'t see you get in, it walks right past!',
    pjork: 'Pjork never leaves his stage, but he moves when you look away. Keep your eyes on him when you walk past — or stay away from the stage!',
  },
  start(m, resumed) {
    const d = m.decor;
    if (m.flags.power) powerOn(m, true);
    else for (const f of d.genFuses) f.visible = false;
    // Pjork wakes up as soon as you've found one fuse.
    if (m.count('fuse') > 0) m.enemies.find((e) => e.id === 'pjork').wake();
  },
  collect(m, item) {
    if (item.kind === 'fuse' && m.count('fuse') === 1) {
      m.enemies.find((e) => e.id === 'pjork').wake();
      sfx.musicBoxSting();
      setTimeout(() => m.say('Jonathan... did Pjork just MOVE?! Stay away from the stage!', 3), 1200);
    }
  },
  use(m, t) {
    if (t.id === 'generator') { powerOn(m, false); return true; }
    return true;
  },
};

// The generator starts: the lights come on, the front door unlocks — and every Night Bot hears it.
function powerOn(m, quiet) {
  const d = m.decor;
  m.flags.power = true;
  for (const f of d.genFuses) f.visible = true;
  d.exit.setOpen(true);
  for (const c of d.chargers) c.color.set(0xff3b30).multiplyScalar(2);
  for (const e of m.enemies) if (e.id === 'nightbot') e.wake(1.2);
  m.huntK = 3;
  m.game.lighting.setEscape(d, { ...m.def.mood, amb: 0.1, hemi: 0.1 });
  if (quiet) return;
  sfx.powerOn();
  setTimeout(() => sfx.escAlarm(), 900);
  setTimeout(() => m.say('The door is open! RUN!!', 3), 1600);
}
