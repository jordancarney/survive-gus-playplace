// Chapter 20 — Thomas: Opening Day (2:45 AM).
//
// P.A.L. has locked the Giant Ball Pit room ("P.A.L. LOCKDOWN"). So Thomas dives in — and
// comes up a few months ago, on the Pizzaplex's opening day: sunshine, balloons, a ribbon
// across the Grand Opening hall, and a crowd frozen mid-cheer. In P.A.L. Control an engineer
// is frozen pressing the big green button. Open P.A.L.'s panel (the manager's keycard is in
// his office) and P.A.L. switches on for the very first time — "THE PARTY WILL NEVER END!" —
// and so does DJ Rocco, brand new and shiny.
//
// P.A.L. lets you change one setting. Thomas changes the right one: BALL PIT DOOR — ALWAYS OPEN.
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth, buildKid, buildPerson } from '../../models.js';
import { buildOld, buildRocco, buildSparky } from '../cast.js';
import { sfx } from '../../audio.js';
import { ITEMS } from '../../escape/decor.js';
import { ITEM_ICON } from '../../escape/watch.js';
import { E, W, N, S, MOODS, nowRooms, NOW_DOOR, NOW_AT, SPAWN, giantPit, smallPit, windows, frozen, travel, setZone, enemy, seeded, THOMAS, nowBot } from './kit.js';

Object.assign(ITEMS, {
  keycard: { color: 0x2de2e6, name: 'manager\'s keycard', build: (d, g, glow) => {
    d.mesh(G.box, glow, g, { s: [0.3, 0.19, 0.02], still: false });
    d.mesh(G.box, lam(0x111111), g, { p: [0, -0.04, 0.012], s: [0.26, 0.03, 0.005], still: false });
  } },
});
Object.assign(ITEM_ICON, { keycard: '💳' });

const layout = {
  w: 70, h: 34, wallH: 5.0, panels: false,
  wallColor: 0x1d1424, headerColor: 0xffd23f,
  ceiling: () => T.tiles('#2a2036', '#1d1626'),
  rooms: {
    ...nowRooms({ name: 'Ball Pit Lobby', floor: () => T.checker('#1d1c24', '#3a2a5a'), wall: ['#1b1440', '#ff3fa4', '#0e0a24', 'stars'] }),
    A: { name: 'Grand Opening (opening day)', short: 'Grand Opening', x0: 36, z0: 1, x1: 55, z1: 16,
         floor: () => T.checker('#f2f0ea', '#3a2a5a'), wall: ['#fff4e0', '#ff3fa4', '#c040ff', 'stars'] },
    C: { name: 'P.A.L. Control (opening day)', short: 'P.A.L. Control', x0: 57, z0: 1, x1: 68, z1: 12,
         floor: () => T.tiles('#8e9aa0', '#6c777c'), wall: ['#2a3a4a', '#2de2e6', '#1a2430', 'panels'] },
    M: { name: "Manager's Office (opening day)", short: 'Office (opening day)', x0: 57, z0: 14, x1: 68, z1: 25,
         floor: () => T.carpet('#2a3a5a'), wall: ['#e8e0d0', '#2a4fa0', '#5a6670', 'panels'] },
    R: { name: "DJ Rocco's Party Room (opening day)", short: 'Party Room (opening day)', x0: 36, z0: 18, x1: 55, z1: 32,
         floor: () => T.carpet('#2a0e33'), wall: ['#2a0e33', '#ff3fa4', '#c040ff', 'stars'] },
  },
  doors: [
    NOW_DOOR,
    { a: 'A', b: 'C', x0: 56, z0: 5, x1: 56, z1: 7 },
    { a: 'A', b: 'M', x0: 56, z0: 14, x1: 56, z1: 15 },
    { a: 'A', b: 'R', x0: 44, z0: 17, x1: 46, z1: 17 },
  ],
};

function build(d) {
  const P = d.place.P;
  // ── now: P.A.L.'s lockdown on the Ball Pit Lobby's door
  giantPit(d, { glow: 0x2de2e6, glow2: 0xff3fa4 });
  d.exitDoor(18, 32.4, 'north', { w: 1.8, label: 'OPEN' });
  d.palSign = d.label('P.A.L. LOCKDOWN\n🔒 NO EXIT', 18, 32.96, 2.9, 2.8, 0.7, 'north', { bg: '#2a0606', fg: '#ff3b30', glow: '#ff3b30' });
  for (const [x, z] of [[5, 22], [5, 28], [14, 25]]) d.block(x, z, 1.4, 1.4, 0.45, mat(0x3a2a5a, { rough: 0.5 }));     // benches
  d.hideSpot('box', 21.4, 20, 'west');
  d.hideSpot('locker', 1.6, 30, 'east', { color: 0x7a2a8a });
  d.lamp(10, 25, 4.4, 0xff3fa4, 0.6, { distance: 11, room: 'H', flicker: true });

  // ── opening day
  smallPit(d, 40.5, 6.0, { color: 0x2a4fa0, sign: 'NEW!\nGIANT BALL PIT', signBg: '#ff3fa4', signFg: '#ffffff' });
  windows(d, [[46, 1.04, 'south', 2.4], [52, 1.04, 'south', 2.4]], 0xcfeeff, 0.4);
  d.label('GRAND OPENING!\nGUS\'S PIZZAPLEX', 48, 16.96, 3.6, 5, 1.2, 'north', { bg: '#ff3fa4', fg: '#ffffff', glow: '#ffd23f' });
  // the ribbon across the hall, and balloons everywhere
  d.target('ribbon', 48, 9.5, 'south', 'Cut the ribbon! ✂️', (g) => {
    d.ribbon = d.mesh(G.box, cloth(0xd11f2a), g, { p: [0, 1.1, -0.4], s: [8, 0.18, 0.04], still: false });
    d.mesh(G.sphere, cloth(0xd11f2a), g, { p: [0, 1.1, -0.4], s: [0.35, 0.3, 0.12] });
  });
  for (const x of [43.8, 52.2]) d.block(x, 9.1, 0.12, 0.12, 1.2, mat(0xf2c230, { metal: 0.7 }));
  const cols = [0xff3b30, 0xffd23f, 0x3ec1d3, 0x7ad151, 0xa970ff, 0xff7eb6];
  for (let i = 0; i < 18; i++) {
    const c = P(37.5 + (i * 7.3) % 17, 1.8 + (i * 5.1) % 13, 2.6 + (i % 4) * 0.4);
    d.mesh(G.sphere, mat(cols[i % cols.length], { rough: 0.25 }), d.group, { p: [c.x, c.y, c.z], s: [0.28, 0.34, 0.28] });
  }
  d.lamp(42, 8, 4.6, 0xfff4e0, 2.6, { distance: 16, room: 'A', bulb: false });
  d.lamp(52, 8, 4.6, 0xfff4e0, 2.6, { distance: 16, room: 'A', bulb: false });
  d.savePoint(54.6, 15.2, 'west');
  d.hideSpot('counter', 54.4, 2.6, 'west', { color: 0xff3fa4 });
  // P.A.L. Control: the big screen and the console
  d.palScreen = d.label('P.A.L. v1.0\nREADY', 62.5, 1.04, 2.6, 4.4, 1.6, 'south', { bg: '#04121a', fg: '#2de2e6', glow: '#2de2e6' });
  d.target('panel', 61, 4.0, 'south', 'Open P.A.L.\'s control panel 💳', (g) => {
    d.mesh(G.box, lam(0x2a2a30), g, { p: [0, 0.45, -0.1], s: [2.4, 0.9, 0.7] });
    for (let k = 0; k < 8; k++) d.mesh(G.box, glowMat([0x7cff6b, 0xffd23f, 0x2de2e6, 0xff3b30][k % 4], 0.3), g, { p: [-0.9 + k * 0.26, 0.92, -0.1], s: [0.12, 0.03, 0.12] });
  });
  d.target('setting', 64.6, 4.0, 'south', 'Change ONE setting: BALL PIT DOOR → ALWAYS OPEN 🔧', (g) => {
    d.mesh(G.box, lam(0x2a2a30), g, { p: [0, 0.45, -0.1], s: [1.2, 0.9, 0.7] });
    d.settingLight = d.mesh(G.box, glowMat(0xff3b30, 0.5), g, { p: [0, 0.95, -0.1], s: [0.3, 0.06, 0.2], still: false });
  });
  d.hideSpot('locker', 67.6, 11.4, 'west', { color: 0x2a3a4a });
  d.lamp(62.5, 6.5, 4.6, 0xd8f4ff, 1.6, { distance: 12, room: 'C', bulb: false });
  // the manager's office: his keycard on the desk
  d.table(63, 20, 2.4, 1.2, 0.76, 0x6a4a2a, { legs: 0x3a2a1a });
  d.item('keycard', 'keycard', 63, 20, 0.95);
  d.shelf(68.4, 19.5, 0.6, 6, 2.0, 'west', { wood: 0x5a3a24 });
  d.hideSpot('box', 57.8, 24, 'east');
  d.lamp(62.5, 19.5, 4.6, 0xfff4e0, 1.6, { distance: 12, room: 'M', bulb: false });
  // DJ Rocco's Party Room, brand new
  d.counter(46, 30.8, 5, 1.2, 1.1, 0x111114, 0x2a2a30);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) d.patch(40.5 + i * 2, 21 + j * 1.8, 1.9, 1.7, [0xff3fa4, 0x2de2e6, 0xc040ff, 0xffd23f][(i + j) % 4], { glow: 0.15 });
  d.label("NEW! DJ ROCCO", 55.96, 25, 3.0, 2.8, 0.8, 'west', { bg: '#0a0614', fg: '#c040ff', glow: '#ff3fa4' });
  d.item('plushie', 'plushie', 36.8, 31.4, 0.5);
  d.hideSpot('curtain', 37, 19.5, 'east', { color: 0xc040ff });
  d.savePoint(54.6, 31.6, 'west');
  d.lamp(45, 25, 4.6, 0xfff4e0, 1.8, { distance: 14, room: 'R', bulb: false });
  d.spots.spawn = P(...SPAWN);
}

const quests = [
  { id: 'dive', type: 'use', target: 'dive', text: 'DIVE into the giant ball pit (E at its edge)', done: 'Down, down, down...' },
  { id: 'keycard', type: 'collect', item: 'keycard', count: 1, text: 'Find the manager\'s keycard (his office, opening day)', done: 'Got the keycard!' },
  { id: 'panel', type: 'use', target: 'panel', text: 'Open P.A.L.\'s control panel (P.A.L. Control)', done: 'P.A.L. is ON...' },
  { id: 'setting', type: 'use', target: 'setting', text: 'Change ONE setting: BALL PIT DOOR → ALWAYS OPEN', done: 'BALL PIT DOOR: ALWAYS OPEN. ✔' },
  { id: 'home', type: 'use', target: 'home', text: 'Jump back in the brand-new ball pit to go home', done: 'Home again!' },
  { id: 'exit', type: 'exit', text: 'Out the Ball Pit Lobby door — P.A.L. has to let you through now!' },
  { id: 'ribbon', type: 'use', target: 'ribbon', optional: true, after: 'dive', text: 'Cut the ribbon at the Grand Opening', done: 'The Pizzaplex is OPEN! (Again!)' },
  { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
];

export default {
  ...THOMAS,
  id: 'opening',
  name: 'Opening Day',
  layout,
  build,
  mood: MOODS.now,
  zones: { now: NOW_AT, past: { at: [40.5, 6.0], yaw: W, mood: MOODS.day, flashlight: false } },
  spawn: { at: SPAWN, yaw: 0 },
  firstLine: '"P.A.L. LOCKDOWN"? P.A.L. locked me IN. ...Okay, ball pit. Your turn.',
  winTitle: 'THOMAS OUTSMARTED P.A.L.!',
  exitText: 'Out the door! P.A.L. has to let you! 🏃',
  card: {
    story: '<b>2:45 AM.</b> The door out of the Giant Ball Pit room has a new sign on it: <b>P.A.L. LOCKDOWN</b>. P.A.L., the Pizzaplex computer, has shut <b>Thomas</b> in. So Thomas does what Thomas does: he dives into the ball pit. And comes up... in the sunshine. It\'s the Pizzaplex\'s <b>opening day</b>, a few months ago, and everybody is frozen mid-cheer.',
    goal: '🫧 On opening day: find the <b>manager\'s keycard</b> in his office, open <b>P.A.L.\'s control panel</b>, and change <b>one setting</b>. Then swim home and walk out the door.',
    watchOut: '👀 <b>Flipper</b> and <b>Sparky</b> are both in the Giant Ball Pit room now. On opening day, <b>Cranker</b> is already wandering about... and when P.A.L. switches on, so does someone brand new.',
    after: 'The Ball Pit Lobby door slid open with a cheerful <i>ding</i>. Thomas grabbed his walkie. <i>"Jackson! P.A.L. said THE PARTY WILL NEVER END. On opening day! It\'s been planning this the whole time!"</i><br><br>Up at the <b>Prize Counter</b>, <b>Jonathan</b> was looking at a shelf full of brand-new batteries.',
  },
  friends: [
    '🔵 Jonathan: <b>Prize Counter</b>',
    '🟣 Max: <b>Sleepover Suite</b> · Sparky is at her door',
    '🔦 Jackson: <b>Security Office</b>',
    '🔴 Jack: <b>Under the Pizzaplex</b> · he knows P.A.L.\'s secret now',
  ],
  quests,
  enemies: [
    nowBot('flipper', 'Flipper', buildOld('flipper'), { walk: 1.9, chase: 3.8, hear: 11, start: [4, 4] }),
    nowBot('sparky', 'Sparky', buildSparky, { walk: 2.2, chase: 4.4, sight: 10, hear: 10, start: [19, 30], roam: ['H', 'B', 'H'], wait: 15,
      shout: () => ['WOOF! Wanna play fetch?!', 'Ruff ruff! Found you!'][Math.floor(Math.random() * 2)] }),
    { id: 'cranker', name: 'Cranker', build: buildOld('cranker'), walk: 1.5, chase: 3.3, sight: 11, hear: 9, hunt: 0.3, lose: 6,
      roam: ['A', 'M', 'R', 'A'], start: [52, 3], wait: 10, steps: 'cranker', stride: 0.8, shoutWho: 'Cranker' },
    { id: 'rocco', name: 'DJ Rocco', build: buildRocco, walk: 2.3, chase: 4.2, sight: 12, hear: 10, hunt: 0.35, lose: 5,
      roam: ['R', 'A', 'C', 'R'], start: [46, 29.6], yaw: S, asleep: true, steps: 'gerald', stride: 1.0, shoutWho: 'DJ Rocco',
      shout: () => ['FIRST DAY! FIRST DANCE!', 'Nobody leaves the dance floor!', 'Party time — FOREVER!'][Math.floor(Math.random() * 3)] },
  ],
  tips: {
    flipper: 'Flipper can hear you run. WALK when he\'s near, and dive into the ball pit to get away.',
    sparky: 'Sparky is super fast. Hide in the box or the locker before he spots you, or dive into the ball pit!',
    cranker: 'Cranker is slow — just walk away and hide. Listen for his squeaky feet.',
    rocco: 'DJ Rocco wakes up when P.A.L. switches on. Change the setting fast and get back to the ball pit!',
  },
  start(m) {
    const d = m.decor;
    const rnd = seeded(20);
    const crowd = [[41, 12], [43, 13.5], [45.5, 12.4], [47, 14], [49.5, 12.6], [51.5, 13.8], [53.5, 12.2], [44, 4], [50, 4.5], [52.6, 5.6]];
    frozen(m, 'crowd', [
      ...crowd.map(([x, z], i) => ({ build: () => (i % 4 === 3 ? buildPerson({ height: 1.65 + rnd() * 0.2, shirt: [0x3a6ab8, 0x7a2a3a, 0x2f8f5a][i % 3], pants: 0x2a3a5a, skin: [0xf1c7a5, 0xa86b45, 0x6e4529][i % 3], hair: 0x2b1a10, shadows: true }) : buildKid(rnd)),
        x, z, yaw: N + (rnd() - 0.5) * 0.6, pose: i % 3 === 0 ? 'wave' : i % 3 === 1 ? 'dance' : 'idle', amt: 0.6 })),
      // the engineer pressing the button, and the manager with his big scissors
      { build: () => buildPerson({ height: 1.75, shirt: 0xf4f1ea, pants: 0x2a3a5a, skin: 0xd9a07a, hair: 0x6b3e1f, glasses: true, shadows: true }), x: 59, z: 5.2, yaw: N, amt: 0.3 },
      { build: () => buildPerson({ height: 1.8, shirt: 0x2a2a30, pants: 0x1f2533, skin: 0xf1c7a5, hair: 0x5a5a5a, tie: 0xd11f2a, shadows: true }), x: 48, z: 11, yaw: N, amt: 0.3 },
    ]);
    d.exit.setOpen(m.done.has('home'));
    d.palSign.visible = !m.done.has('home');
    if (d.settingLight) d.settingLight.material.color.set(m.done.has('setting') ? 0x3cff6b : 0xff3b30);
    if (d.ribbon) d.ribbon.visible = !m.done.has('ribbon');
    if (m.done.has('panel')) enemy(m, 'rocco').wake();
    setZone(m);
  },
  use(m, t) {
    if (t.id === 'dive') { travel(m, 'past', 'SUNSHINE?! Balloons... a ribbon... It\'s the Pizzaplex\'s OPENING DAY!'); return true; }
    if (t.id === 'home') { travel(m, 'now', 'Back! Now let\'s see if P.A.L. remembers...'); return true; }
    if (t.id === 'panel') {
      sfx.powerOn();
      setTimeout(() => sfx.plexPal(), 700);
      const lines = ['P.A.L. VERSION 1.0 IS ONLINE. HELLO, PIZZAPLEX!', 'I WILL LOOK AFTER EVERYTHING. THE PARTY WILL NEVER END!', 'WAKING UP: DJ ROCCO.'];
      lines.forEach((l, i) => setTimeout(() => { if (m.game.mode === 'escape' && m.def.id === 'opening') m.say(l, 3.2, '🔊 P.A.L.'); }, 900 + i * 3300));
      setTimeout(() => {
        if (m.game.mode !== 'escape' || m.def.id !== 'opening') return;
        enemy(m, 'rocco').wake(1.1);
        sfx.musicBoxSting();
        m.say('"The party will never end"?! Uh oh. DJ Rocco just woke up. QUICK — the setting!', 3.6);
      }, 900 + 3 * 3300);
      return true;
    }
    if (t.id === 'setting') {
      sfx.escUnlock();
      m.decor.settingLight.material.color.set(0x3cff6b);
      return true;
    }
    if (t.id === 'ribbon') {
      sfx.cheer();
      m.decor.ribbon.visible = false;
      m.game.effects.burst(m.place.P(48, 9.5, 1.2), 24, 4);
      return true;
    }
    return true;
  },
  questDone(m, q) {
    if (q.id === 'home') {
      m.decor.exit.setOpen(true);
      m.decor.palSign.visible = false;
      setTimeout(() => m.say('The lockdown sign is GONE. "BALL PIT DOOR: ALWAYS OPEN" — ha!', 3.5), 1500);
    }
  },
};
