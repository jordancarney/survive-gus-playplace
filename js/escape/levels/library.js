// Level 2 — the Library, from the designer's map.
//
// You come in through the entrance (bottom right). The Stacks are rows of tall bookcases you
// can't see over; the Reading Room has the emergency exit; the Librarian's Office has the
// power switch that turns off the cameras, and the monitor. The librarian walks around — don't
// get caught — and she can hear you run from a long way off. Security cameras sweep the rooms:
// if one sees you, she comes running.
//
// Four glowing books each have one number of the emergency exit's code written inside.
import * as THREE from 'three';
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth } from '../../models.js';
import { sfx } from '../../audio.js';
import { GLOW } from '../../config.js';
import { requestPointerLock } from '../../input.js';
import { buildLibrarian } from '../cast.js';

const SHELF_X = [4, 8, 12, 16, 20];
const walls = [];
for (const x of SHELF_X) walls.push({ x0: x, z0: 3, x1: x, z1: 12 }, { x0: x, z0: 16, x1: x, z1: 27 });

const layout = {
  w: 44, h: 32, wallH: 3.6, panels: false, walls,
  wallColor: 0x2a1a10, headerColor: 0x5a3a24,
  ceiling: () => T.tiles('#3a2e28', '#2a201a'),
  rooms: {
    M: { name: 'The Stacks', short: 'Stacks', x0: 1, z0: 1, x1: 24, z1: 30,
         floor: () => T.carpet('#4a1a1a'), wall: ['#3a2a1a', '#c9a227', '#2a1a10', 'panels'] },
    R: { name: 'Reading Room', short: 'Reading', x0: 26, z0: 1, x1: 34, z1: 22,
         floor: () => T.wood('#6a4a2a'), wall: ['#2f4a3a', '#c9a227', '#1f2a20', 'panels'] },
    C: { name: "Librarian's Office", short: 'Office', x0: 36, z0: 1, x1: 42, z1: 10,
         floor: () => T.wood('#5a3a20'), wall: ['#4a3a2a', '#8a6a4a', '#2a1a10', 'stripes'] },
    K: { name: "Kids' Corner", short: 'Kids', x0: 36, z0: 12, x1: 42, z1: 22,
         floor: () => T.carpet('#2a4fa0'), wall: ['#ffe9a0', '#ff7eb6', '#7fb8d8', 'stars'] },
    E: { name: 'Entrance', x0: 26, z0: 24, x1: 42, z1: 30,
         floor: () => T.checker('#d8d0c0', '#5a3a24'), wall: ['#d8c8a8', '#5a3a24', '#3a2a1a', 'panels'] },
  },
  doors: [
    { a: 'M', b: 'R', x0: 25, z0: 8, x1: 25, z1: 9 },
    { a: 'M', b: 'R', x0: 25, z0: 17, x1: 25, z1: 18 },
    { a: 'M', b: 'E', x0: 25, z0: 26, x1: 25, z1: 28 },
    { a: 'R', b: 'C', x0: 35, z0: 4, x1: 35, z1: 5 },
    { a: 'R', b: 'K', x0: 35, z0: 16, x1: 35, z1: 17 },
    { a: 'C', b: 'K', x0: 38, z0: 11, x1: 39, z1: 11 },
    { a: 'R', b: 'E', x0: 29, z0: 23, x1: 31, z1: 23 },
    { a: 'K', b: 'E', x0: 39, z0: 23, x1: 40, z1: 23 },
  ],
};

function build(d) {
  const P = d.place.P;
  const warm = 0xffd8a0, green = 0xb8ffb0;

  // ── The Stacks: long bookcases to the ceiling (they're walls in the plan, so nobody sees
  // over them), and short ones along the outside walls
  for (const x of SHELF_X) {
    d.bookcase(x + 0.5, 8, 1, 10, 3.6, { wall: true });
    d.bookcase(x + 0.5, 22, 1, 12, 3.6, { wall: true });
  }
  d.bookcase(12.5, 1.35, 16, 0.6, 2.2);
  d.bookcase(24.65, 14.5, 0.6, 5, 2.2);
  for (const [x, z] of [[6, 14.5], [14, 14.5], [10, 29], [18, 29]]) d.hanging(x, z, warm, 2.2, { room: 'M', flicker: x === 14 });
  d.savePoint(2.4, 14.5, 'east');
  d.hideSpot('box', 22.6, 29.2, 'north', { color: 0x3a5a8a }).name = 'Hide in the book return bin';
  d.hideSpot('box', 2.2, 2.2, 'south', { color: 0x8a6a42 }).name = 'Hide behind the boxes';
  d.label('FICTION', 6.5, 3.06, 2.4, 1.2, 0.28, 'south', { bg: '#2a1a10', fg: '#c9a227', glow: '#c9a227' });
  d.label('HISTORY', 14.5, 3.06, 2.4, 1.2, 0.28, 'south', { bg: '#2a1a10', fg: '#c9a227', glow: '#c9a227' });
  d.label('SCIENCE', 18.5, 16.06, 2.4, 1.2, 0.28, 'south', { bg: '#2a1a10', fg: '#c9a227', glow: '#c9a227' });

  // ── The Reading Room: long tables with green lamps, and the emergency exit
  for (const z of [7, 13, 19]) {
    d.table(30, z, 4.2, 1.4, 0.76, 0x6a4a2a);
    for (const x of [28.6, 30, 31.4]) for (const sz of [-1, 1]) d.chair(x, z + sz * 1.0, 0x3a2a1a);
    for (const x of [28.8, 31.2]) {
      const c = P(x, z, 0.76);
      d.mesh(G.cyl, mat(0xc9a227, { metal: 0.7 }), d.group, { p: [c.x, c.y + 0.15, c.z], s: [0.02, 0.3, 0.02] });
      d.mesh(G.box, glowMat(0x2f8f3a, 0.3), d.group, { p: [c.x, c.y + 0.33, c.z], s: [0.32, 0.1, 0.14], shadow: false });
    }
    d.lamp(30, z, 1.3, green, 1.2, { distance: 5, room: 'R', bulb: false });
  }
  d.bookcase(26.4, 12, 0.6, 7, 2.6);
  d.bookcase(34.65, 10, 0.6, 5, 2.6);
  d.exitDoor(30, 1.6, 'south', { w: 1.6, label: 'EXIT' });
  d.label('EMERGENCY EXIT', 30, 1.04, 2.95, 2.0, 0.3, 'south', { bg: '#2a0606', fg: '#ff6b6b', glow: '#ff3b30' });
  d.target('keypad', 31.6, 1.12, 'south', 'Type the secret code', (g) => {
    d.mesh(G.box, lam(0x2a2c31), g, { p: [0, 1.3, -0.08], s: [0.3, 0.4, 0.06] });
    d.mesh(G.plane, glowMat(0x3cff6b, 0.4), g, { p: [0, 1.42, -0.045], s: [0.22, 0.08, 1], shadow: false });
    for (let k = 0; k < 9; k++) d.mesh(G.box, lam(0xc0c0c0), g, { p: [-0.07 + (k % 3) * 0.07, 1.31 - Math.floor(k / 3) * 0.06, -0.045], s: [0.05, 0.04, 0.01] });
  }, { reach: 1.4 });
  d.savePoint(33.6, 12.6, 'west');
  d.hideSpot('counter', 27.2, 21.3, 'north', { color: 0x5a3a24 }).name = 'Hide under the desk';
  d.hanging(30, 4, warm, 1.8, { room: 'R' });

  // ── The Librarian's Office: her desk and monitor, and the power switch for the cameras
  d.table(38.5, 2.2, 2.4, 1.0, 0.76, 0x5a3a20);
  d.target('monitor', 38.5, 1.7, 'south', 'Look at the camera monitor', (g) => {
    d.mesh(G.box, lam(0x1a1a1a), g, { p: [0, 1.06, 0], s: [0.7, 0.48, 0.08] });
    d.monitorScreen = d.mesh(G.plane, new THREE.MeshBasicMaterial({ map: T.screenTex('CAM 1-4', '#3cff6b') }), g,
      { p: [0, 1.06, 0.045], s: [0.62, 0.4, 1], shadow: false });
    d.monitorScreen.material.color.setScalar(Math.max(1, GLOW * 0.4));
  }, { reach: 1.5 });
  d.target('switch', 42.9, 6.5, 'west', 'Pull the switch to turn off the cameras', (g) => {
    d.mesh(G.box, lam(0x5a6070), g, { p: [0, 1.3, -0.05], s: [0.5, 0.7, 0.1] });
    d.mesh(G.box, lam(0xf2c230), g, { p: [0, 1.62, -0.0], s: [0.5, 0.06, 0.02] });
    d.lever = d.mesh(G.box, lam(0xd11f2a), g, { p: [0, 1.45, 0.06], s: [0.06, 0.3, 0.06], r: [-0.5, 0, 0], still: false });
  }, { reach: 1.4 });
  d.label('CAMERAS', 42.94, 6.5, 2.2, 0.8, 0.22, 'west', { bg: '#2b2d33', fg: '#f2c230', glow: '#f2c230' });
  d.bookcase(36.4, 7.5, 0.6, 4, 2.0);
  d.hideSpot('locker', 41.6, 10.6, 'north', { color: 0x6a5a4a }).name = 'Hide in the supply closet';
  d.lamp(38.5, 2.4, 1.2, warm, 1.4, { distance: 6, room: 'C' });
  d.item('plushie', 'plushie', 36.8, 9.4, 0.5);

  // ── The Kids' Corner: beanbags, a puppet theatre and a toy box
  for (const [x, z, c] of [[37.5, 15, 0xff7eb6], [39.5, 14.6, 0x3ec1d3], [41.2, 16, 0xffd23f]]) {
    const p = P(x, z, 0.3);
    d.mesh(G.sphere, cloth(c), d.group, { p: [p.x, p.y, p.z], s: [0.5, 0.32, 0.5] });
  }
  d.rug(39, 18, 4, 3, '#ff7eb6', '#ffd23f');
  d.hideSpot('curtain', 41.6, 21.2, 'west', { color: 0xd11f2a }).name = 'Hide in the puppet theatre';
  d.hideSpot('toybox', 36.8, 21.3, 'north', { color: 0x2f8f3a });
  d.bookcase(39, 12.4, 4, 0.6, 1.2);
  d.savePoint(41.4, 13.6, 'west');
  d.lamp(39, 18, 2.6, 0xffb3d9, 1.3, { distance: 7, room: 'K' });

  // ── The Entrance: the checkout desk and the doors you came in through (locked behind you)
  d.counter(34, 25.4, 4, 0.8, 1.05, 0x5a3a24);
  d.label('CHECK OUT', 34, 25.82, 1.4, 1.4, 0.26, 'south', { bg: '#5a3a24', fg: '#ffe9a0', glow: '#c9a227' });
  const doors = d.anchor(42.95, 27, 'west', 0);
  for (const sz of [-0.62, 0.62]) d.mesh(G.box, mat(0x9fd8ff, { rough: 0.05, metal: 0.3 }), doors, { p: [sz, 1.1, 0], s: [1.2, 2.2, 0.05] });
  d.label('TOWN LIBRARY', 42.94, 27, 2.75, 2.0, 0.36, 'west', { bg: '#2a1a10', fg: '#c9a227', glow: '#c9a227' });
  d.savePoint(36.5, 29.3, 'north');
  d.hanging(30, 27, warm, 1.6, { room: 'E' });
  d.hanging(38, 27, warm, 1.4, { room: 'E', flicker: true });

  // ── The four glowing books, each with a number of the code
  d.item('book', 'book0', 6.5, 9, 0.7);
  d.item('book', 'book1', 14.4, 23, 0.7);
  d.item('book', 'book2', 27.4, 16.5, 0.9);
  d.item('book', 'book3', 40.4, 18.6, 0.6);

  // ── Security cameras, sweeping
  d.securityCam(2.0, 30.6, 3.0, 'north', { sweep: 0.5, range: 13, speed: 0.4 });
  d.securityCam(24.6, 1.6, 3.0, 'west', { sweep: 0.35, range: 14, speed: 0.5, phase: 1 });
  d.securityCam(34.6, 22.6, 3.0, 'north', { sweep: 0.55, range: 13, speed: 0.45, phase: 2 });
  d.securityCam(42.6, 24.4, 3.0, 'west', { sweep: 0.6, range: 13, speed: 0.4, phase: 3 });
}

const ORD = ['1st', '2nd', '3rd', '4th'];

export default {
  id: 'library',
  name: 'The Library',
  layout,
  build,
  mood: { amb: 0.08, hemi: 0.07, fog: 0.04, bg: 0x06040a },
  spawn: { at: [40.5, 27], yaw: Math.PI / 2 },
  firstLine: 'The doors locked behind us! There\'s an emergency exit... it needs a code.',
  card: {
    story: 'Jonathan and Jack ran across the street into the <b>town library</b> — and the doors locked behind them. It\'s dark, and very, very quiet...',
    goal: '⌚ Find the <b>4 glowing books</b>. Each one has a number of the secret code written inside. Type the code at the <b>emergency exit</b>.',
    watchOut: '👀 <b>The librarian</b> walks around, and she can hear you run from far away. <b>Cameras</b> tell her where you are — the switch in her office turns them off.',
    after: 'BEEP-BEEP-BEEP — CLICK! The emergency exit swung open onto a dark playground... and a big building: <b>Maple Street School</b>.',
  },
  quests: [
    { id: 'books', type: 'collect', item: 'book', count: 4, text: 'Find the 4 glowing books', done: 'You have the whole code!' },
    { id: 'code', type: 'use', target: 'keypad', text: 'Type the secret code at the emergency exit (Reading Room)', done: 'The emergency exit is open!' },
    { id: 'exit', type: 'exit', text: 'Escape through the emergency exit!' },
    { id: 'monitor', type: 'use', target: 'monitor', optional: true, text: 'Look at the camera monitor in the Librarian\'s Office', reward: 'sneak', done: 'You found her fuzzy slippers under the desk!' },
    { id: 'cams', type: 'use', target: 'switch', optional: true, text: 'Turn off the security cameras (Librarian\'s Office)', done: 'The cameras are off!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    {
      id: 'librarian', name: 'the Librarian', build: buildLibrarian, walk: 1.7, chase: 4.0, sight: 12, hear: 12,
      roam: ['M', 'M', 'R', 'E', 'K', 'C'], start: [39, 5], wait: 6, hunt: 0.3, steps: 'kid', stride: 0.7, lose: 5,
      shout: () => ['SHHHHHH! No running in MY library!', 'Quiet! QUIET!', 'Who is in my library?!'][Math.floor(Math.random() * 3)],
    },
  ],
  tips: {
    librarian: 'Walk, don\'t run — she can hear running from far away. Turn off the cameras in her office, and duck behind the tall bookcases.',
  },
  // the code so far, on your Gus Watch
  progress(m, q) {
    if (q.id !== 'books' && q.id !== 'code') return '';
    const got = m.flags.code.split('').map((n, i) => (m.decor.items.find((it) => it.id === `book${i}`).found ? n : '_'));
    return q.id === 'books' ? `(${m.count('book')}/4) · Code: ${got.join(' ')}` : `Code: ${got.join(' ')}`;
  },
  start(m, resumed) {
    const d = m.decor;
    if (!m.flags.code) m.flags.code = String(Math.floor(1000 + Math.random() * 9000));
    setCams(m, !m.flags.camsOff);
    if (m.done.has('code')) d.exit.setOpen(true);
    m.camT = 0;
    m.shhT = 6;
  },
  collect(m, item) {
    if (item.kind !== 'book') return;
    const i = Number(item.id.slice(4));
    const n = m.flags.code[i];
    setTimeout(() => m.game.hud.toast(`📖 Inside the book: "The ${ORD[i]} number is ${n}"`, 4), 2700);
  },
  use(m, t) {
    const d = m.decor;
    if (t.id === 'switch') {
      setCams(m, false);
      m.flags.camsOff = true;
      sfx.blackout();
      d.lever.rotation.x = 0.5;
      m.say('The cameras are off! She can\'t see us on them anymore.', 3);
      return true;
    }
    if (t.id === 'monitor') {
      sfx.camOpen();
      m.say('Her fuzzy slippers are under the desk! Put them on — now she can\'t hear us run!', 3.5);
      return true;
    }
    if (t.id === 'keypad') {
      m.game.phone.open(m.flags.code, 'The secret code from the glowing books', () => {
        sfx.escUnlock();
        d.exit.setOpen(true);
        m.used.add('keypad');
        m.complete('code');
        if (!m.game.touch.active) requestPointerLock();
      }, { prompt: 'Type the code on your keyboard', success: 'CLICK! Unlocking...', ring: false });
      return 'pending';
    }
    return true;
  },
  update(m, dt) {
    const d = m.decor, p = m.player;
    const lib = m.enemies[0];
    m.camT += dt;
    // she shushes now and then, so you can tell where she is
    m.shhT -= dt;
    if (m.shhT <= 0) { m.shhT = 7 + Math.random() * 6; if (lib.distToPlayer() < 24) sfx.escShh(lib.pos); }
    if (m.flags.camsOff) return;
    for (const c of d.cams) {
      c.head.rotation.y = Math.sin(m.camT * c.speed + c.phase) * c.sweep;
      c.cool = Math.max(0, (c.cool || 0) - dt);
      c.cone.material.opacity = c.cool > 0 ? 0.1 + Math.sin(m.camT * 20) * 0.04 : 0.035;
      if (c.cool > 0 || m.hiding) continue;
      const yaw = c.base + c.head.rotation.y;
      const dx = p.pos.x - c.pos.x, dz = p.pos.z - c.pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist > c.range || dist < 0.5) continue;
      if ((Math.sin(yaw) * dx + Math.cos(yaw) * dz) / dist < 0.9) continue;
      if (!m.place.sightClear(new THREE.Vector3(c.pos.x, 0, c.pos.z), p.pos)) continue;
      // seen!
      c.cool = 6;
      sfx.escAlarm();
      m.game.hud.toast('📷 A camera saw you! The librarian is coming!', 3);
      lib.alert(p.pos.clone());
    }
  },
};

function setCams(m, on) {
  for (const c of m.decor.cams) {
    c.on = on;
    c.cone.visible = on;
    c.led.color.set(on ? 0xff2020 : 0x111111).multiplyScalar(on ? GLOW * 0.6 : 1);
  }
}
