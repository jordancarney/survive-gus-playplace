// Chapter 4 — Jack, 10: Under the Pizzaplex. (Plays like Sister Location: a voice on the
// speakers gives you one job after another.)
//
// Jack hid in Parts & Service, and the floor gave way: a maintenance hatch, a ladder, and the
// tunnels under the Pizzaplex. The hatch slammed shut above him. Then the speakers came on —
// P.A.L., the Pizzaplex Assistant Line, very polite and a little bit wrong — and it has jobs
// for him: crawl through the vent, stand perfectly still in the dark while Gerald walks round
// the Parts Room, give DJ Rocco three controlled shocks when he comes up to the Control Room
// window, and climb out.
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth } from '../../models.js';
import { poseRig, setEyes } from '../../models.js';
import { buildOld, buildRocco } from '../cast.js';
import { sfx } from '../../audio.js';
import * as THREE from 'three';

const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;

const layout = {
  w: 44, h: 30, wallH: 3.0, panels: false,
  wallColor: 0x1a1a1e, headerColor: 0xf2c230,
  ceiling: () => T.concrete(),
  rooms: {
    H: { name: 'Hatch Landing', short: 'Hatch', x0: 1, z0: 1, x1: 9, z1: 9,
         floor: () => T.concrete(), wall: ['#3a3d44', '#f2c230', '#22242a', 'bricks'] },
    V: { name: 'The Vent', short: 'Vent', x0: 11, z0: 4, x1: 25, z1: 5,
         floor: () => T.concrete(), wall: ['#6a7078', '#8a9098', '#4a5058', 'panels'] },
    K: { name: 'Workshop', x0: 27, z0: 1, x1: 42, z1: 12,
         floor: () => T.concrete(), wall: ['#4a4d55', '#ff9a1f', '#2b2d33', 'bricks'] },
    R: { name: 'Parts Room', short: 'Parts', x0: 27, z0: 14, x1: 42, z1: 28,
         floor: () => T.tiles('#5a5d65', '#44474e'), wall: ['#3a3d44', '#ff3b30', '#22242a', 'panels'] },
    C: { name: 'Control Room', short: 'Control', x0: 15, z0: 14, x1: 24, z1: 20,
         floor: () => T.tiles('#8e9aa0', '#6c777c'), wall: ['#2a3a4a', '#2de2e6', '#1a2430', 'panels'] },
    Y: { name: 'Charging Bay', short: 'Bay', x0: 15, z0: 22, x1: 24, z1: 28,
         floor: () => T.hazard(), wall: ['#2a0e33', '#c040ff', '#1a0820', 'panels'] },
    L: { name: 'Ladder Room', short: 'Ladder', x0: 1, z0: 14, x1: 12, z1: 26,
         floor: () => T.concrete(), wall: ['#3a3d44', '#7cff6b', '#22242a', 'bricks'] },
  },
  doors: [
    { a: 'H', b: 'V', x0: 10, z0: 4, x1: 10, z1: 5 },
    { a: 'V', b: 'K', x0: 26, z0: 4, x1: 26, z1: 5 },
    { a: 'K', b: 'R', x0: 32, z0: 13, x1: 34, z1: 13 },
    { a: 'R', b: 'C', x0: 25, z0: 16, x1: 26, z1: 17 },
    { a: 'C', b: 'L', x0: 13, z0: 16, x1: 14, z1: 17 },
    // the Control Room's window into the Charging Bay: you can see through, not walk through
    { a: 'C', b: 'Y', x0: 17, z0: 21, x1: 22, z1: 21 },
  ],
};

// The vent: a low metal tunnel you have to crawl through.
const VENT = { x0: 9.6, z0: 3.9, x1: 26.4, z1: 6.1 };

function build(d) {
  const P = d.place.P;
  const steel = mat(0x8a9098, { metal: 0.6, rough: 0.35 });

  // ── Hatch Landing: the ladder you came down, its hatch shut tight
  d.block(2, 2, 0.6, 0.15, 3.0, steel, { solid: false, nav: false });
  for (let k = 0; k < 8; k++) d.block(2, 2.1, 0.6, 0.05, 0.04, steel, { y: 0.3 + k * 0.35, solid: false, nav: false });
  d.label('HATCH — STUCK', 2, 1.04, 2.6, 1.6, 0.3, 'south', { bg: '#2a0606', fg: '#ff3b30', glow: '#ff3b30' });
  d.crate(7.5, 2, 0.9);
  d.crate(8, 3.1, 0.7, 0x6a5a4a);
  d.label('VENT →', 9.96, 3.4, 1.4, 1.2, 0.3, 'west', { bg: '#22242a', fg: '#f2c230', glow: '#f2c230' });
  d.savePoint(5, 8.4, 'north');
  d.lamp(5, 5, 2.7, 0xffb070, 1.0, { distance: 8, room: 'H', flicker: true });
  d.item('gear', 'gear1', 1.8, 8.4);

  // ── The vent: a low ceiling all the way along (you can't stand up in here)
  const a = P(VENT.x0, VENT.z0), b = P(VENT.x1, VENT.z1);
  const midX = (a.x + b.x) / 2, midZ = (a.z + b.z) / 2;
  d.mesh(G.box, steel, d.group, { p: [midX, 1.0, midZ], s: [b.x - a.x, 0.05, b.z - a.z] });
  for (const z of [VENT.z0 + 0.05, VENT.z1 - 0.05]) {
    const c = P((VENT.x0 + VENT.x1) / 2, z, 0.5);
    d.mesh(G.box, steel, d.group, { p: [c.x, c.y, c.z], s: [VENT.x1 - VENT.x0, 1.0, 0.04] });
  }
  for (let x = 12; x < 26; x += 2.5) d.lamp(x, 5, 0.9, 0x9fd8ff, 0.35, { distance: 2.6, room: 'V', bulb: true, size: 0.04 });

  // ── The Workshop: benches, half-built animatronics, tools
  for (const [x, z] of [[31, 4], [37, 4], [31, 9], [37, 9]]) d.table(x, z, 2.4, 1.1, 0.9, 0x5a4a3a, { legs: 0x2a2a30 });
  for (const [x, z] of [[31, 4], [37, 9]]) {
    const c = P(x, z, 1.1);
    d.mesh(G.sphere, mat(0x7a7a82, { metal: 0.5, rough: 0.4 }), d.group, { p: [c.x, c.y, c.z], s: [0.3, 0.3, 0.3] });
  }
  d.shelf(42.4, 6.5, 0.8, 9, 2.4, 'west', { wood: 0x4a4d55, books: false });
  d.hideSpot('locker', 28, 11.4, 'north', { color: 0x4a6ab8 });
  d.hideSpot('locker', 41.6, 11.4, 'north', { color: 0x4a6ab8 });
  d.hideSpot('box', 34, 1.8, 'south');
  d.savePoint(27.8, 7, 'east');
  d.item('gear', 'gear2', 41.4, 1.8);
  d.label('WORKSHOP', 34.5, 1.04, 2.4, 2.4, 0.4, 'south', { bg: '#2b2d33', fg: '#ff9a1f', glow: '#ff9a1f' });
  d.lamp(31, 6.5, 2.7, 0xffe2b0, 1.2, { distance: 9, room: 'K' });
  d.lamp(38, 6.5, 2.7, 0xffe2b0, 1.0, { distance: 9, room: 'K', flicker: true });

  // ── The Parts Room: racks of spare heads and arms. Its lights go out.
  for (const z of [17, 21, 25]) d.shelf(34.5, z, 9, 0.7, 2.0, 'south', { wood: 0x4a4d55, books: false });
  for (let i = 0; i < 10; i++) {
    const c = P(30.6 + i * 0.85, 17 + (i % 3) * 4, 2.15);
    d.mesh(G.sphere, mat([0xa8642e, 0x2a3040, 0x5b8fc4, 0x8a8a92][i % 4], { rough: 0.6 }), d.group, { p: [c.x, c.y, c.z], s: [0.22, 0.24, 0.22] });
  }
  d.hideSpot('box', 41.4, 27.4, 'west');
  d.item('gear', 'gear3', 28, 27.6);
  d.label('PARTS ROOM', 33, 13.96, 2.5, 2.4, 0.4, 'north', { bg: '#22242a', fg: '#ff3b30', glow: '#ff3b30' });
  d.partsLights = [
    d.lamp(30, 21, 2.7, 0xd8e0ff, 1.0, { distance: 9, room: 'R' }),
    d.lamp(39, 21, 2.7, 0xd8e0ff, 1.0, { distance: 9, room: 'R' }),
  ];

  // ── The Control Room: the shock panel, at the window into the Charging Bay
  d.target('shock', 19.5, 19.9, 'north', 'Give a CONTROLLED SHOCK ⚡', (g) => {
    // kid height: Jack can see over it, through the window
    d.mesh(G.box, lam(0x2a2a30), g, { p: [0, 0.4, 0], s: [1.4, 0.8, 0.45] });
    d.mesh(G.box, lam(0x3a3a44), g, { p: [0, 0.82, -0.04], s: [1.4, 0.05, 0.52], r: [0.25, 0, 0] });
    d.shockBtn = d.mesh(G.cyl, glowMat(0xff3b30, 0.6), g, { p: [0, 0.87, 0.04], s: [0.09, 0.05, 0.09], r: [0.25, 0, 0], still: false });
    for (let k = 0; k < 6; k++) d.mesh(G.box, glowMat([0x7cff6b, 0xffd23f, 0x2de2e6][k % 3], 0.3), g, { p: [-0.55 + k * 0.22, 0.86, -0.14], s: [0.06, 0.025, 0.06], r: [0.25, 0, 0] });
  });
  d.place.addBlock(18.8, 19.68, 20.2, 20.15, 0.8);
  d.label('CONTROLLED SHOCK', 19.5, 14.04, 2.4, 3.0, 0.4, 'south', { bg: '#1a2430', fg: '#2de2e6', glow: '#2de2e6' });
  // the window: thick glass you can see through
  const ga = P(17, 21), gb = P(23, 22);
  d.place.addBlock(17, 21, 23, 22, 3);
  d.mesh(G.box, new THREE.MeshStandardMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.2, depthWrite: false }), d.group,
    { p: [(ga.x + gb.x) / 2, 1.5, (ga.z + gb.z) / 2], s: [gb.x - ga.x, 3.0, 0.08], shadow: false });
  d.windowCracks = d.mesh(G.plane, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }), d.group,
    { p: [(ga.x + gb.x) / 2, 1.5, (ga.z + gb.z) / 2 - 0.06], s: [gb.x - ga.x, 3.0, 1], r: [0, Math.PI, 0], shadow: false, still: false });
  d.savePoint(23.5, 14.8, 'south');
  d.lamp(19.5, 17, 2.7, 0x9fd8ff, 0.9, { distance: 8, room: 'C' });
  // the Charging Bay behind the glass: DJ Rocco's charger
  d.patch(19.5, 27.4, 2.2, 1.6, 0xc040ff, { glow: 0.2 });
  d.block(19.5, 28.6, 1.6, 0.6, 2.4, mat(0x9aa4b0, { metal: 0.5, rough: 0.4 }));
  d.label("DJ ROCCO'S CHARGER", 19.5, 28.96, 2.6, 2.6, 0.4, 'north', { bg: '#1a0820', fg: '#c040ff', glow: '#ff3fa4' });
  d.lamp(19.5, 25, 2.7, 0xc040ff, 1.2, { distance: 8, room: 'Y' });

  // ── The Ladder Room: the way up and out
  d.exitDoor(1.6, 20, 'east', { w: 1.6, label: 'LADDER UP' });
  d.label('EXIT ↑ TO THE GUS SHOP', 1.04, 20, 2.6, 2.6, 0.4, 'east', { bg: '#0a2a0a', fg: '#7cff6b', glow: '#7cff6b' });
  for (const [x, z] of [[6, 16], [9, 24]]) d.junk(x, z, 1.3);
  d.hideSpot('locker', 11.4, 25.4, 'west', { color: 0x2f8f3a });
  d.item('plushie', 'plushie', 11.5, 14.6, 0.5);
  d.lamp(6, 20, 2.7, 0x9fffb0, 0.8, { distance: 9, room: 'L', flicker: true });

  d.spots.spawn = P(4.5, 5.5);
}

// P.A.L., the Pizzaplex Assistant Line: polite, cheerful, and a little bit wrong.
function pal(m, text, secs = 4) {
  sfx.plexPal();
  m.say(text, secs, '🔊 P.A.L.');
}

export default {
  id: 'tunnels',
  hero: 'jack',
  name: 'Under the Pizzaplex',
  layout,
  build,
  mood: { amb: 0.07, hemi: 0.07, fog: 0.04, bg: 0x040406 },
  spawn: { at: [4.5, 5.5], yaw: W },
  firstLine: 'The hatch is stuck! ...Hello? Is anybody down here?',
  winTitle: 'JACK GOT OUT OF THE TUNNELS!',
  exitText: 'Climb the ladder up! 🪜',
  card: {
    story: '<b>Jack</b> hid in Parts & Service — and the floor gave way. A hatch, a ladder, and the dark tunnels under the Pizzaplex. The hatch slammed shut above him. Then the speakers crackled on, and a very polite voice said: <i>"Hello! I am P.A.L., the Pizzaplex Assistant Line. You are not supposed to be down here."</i>',
    goal: '🔊 Do what <b>P.A.L.</b> says, one job at a time — it\'s on your Gus Watch (<b>G</b>). You can\'t stand up in the vent. And when P.A.L. says <b>stand still</b>... don\'t move. At all.',
    watchOut: '👀 <b>Gerald</b> walks the tunnels. And <b>DJ Rocco</b> is in the Charging Bay behind the Control Room window. Shock him <b>only when he\'s right up at the glass</b>.',
    after: 'Jack climbed the ladder and pushed up through a hatch — into the dark <b>Gus Shop</b>, back on the main floor. <i>"Thank you for following instructions!"</i> P.A.L. called after him. <i>"Please come again!"</i><br><br>In the Giant Ball Pit, something small was swimming down through the balls. It was <b>Thomas</b>.',
  },
  friends: [
    '🔵 Jonathan: <b>Atrium</b> · waiting by the STAFF ONLY door',
    '🟣 Max: <b>Sleepover Suite</b> · hiding',
    '🔦 Jackson: <b>Security Office</b> · on the cameras',
    '🟢 Thomas: <b>???</b>',
  ],
  quests: [
    { id: 'vent', type: 'visit', room: 'K', text: 'Crawl through the vent to the Workshop', done: 'Made it through the vent!' },
    { id: 'parts', type: 'visit', room: 'R', text: 'Go into the Parts Room', done: 'In the Parts Room.' },
    { id: 'still', type: 'still', text: 'STAND STILL until the lights come back on!', done: 'You didn\'t move a muscle!' },
    { id: 'control', type: 'visit', room: 'C', text: 'Go to the Control Room', done: 'In the Control Room.' },
    { id: 'shock', type: 'use', target: 'shock', text: 'Shock DJ Rocco 3 times — only when he\'s AT THE WINDOW (E)', done: 'DJ Rocco is back on his charger!' },
    { id: 'exit', type: 'exit', text: 'Climb the ladder out (Ladder Room)' },
    { id: 'gears', type: 'collect', item: 'gear', count: 3, optional: true, text: 'Find 3 golden gears for P.A.L.', done: 'P.A.L. loves gears!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    { id: 'gerald', name: 'Gerald', build: buildOld('gerald'), walk: 1.8, chase: 3.6, sight: 10, hear: 8, hunt: 0.3, lose: 5,
      roam: ['K', 'R', 'K', 'L'], start: [39, 26], wait: 20, steps: 'gerald', stride: 1.1, shoutWho: 'Gerald' },
  ],
  tips: {
    gerald: 'When P.A.L. says stand still, DON\'T touch the keys until the lights come back on. Any other time, hide if Gerald sees you!',
    rocco: 'Only press E when DJ Rocco is RIGHT UP at the glass. Too early and he just gets faster!',
  },
  progress(m, q) { if (q.id === 'shock') return `(${m.flags.shocks || 0}/3)`; return ''; },
  start(m, resumed) {
    const d = m.decor;
    d.exit.setOpen(m.done.has('shock'));
    m.flags.shocks = m.flags.shocks || 0;
    this.still = null;
    rocco.place(m, d);
    for (const l of d.partsLights) l.off = false;
    d.windowCracks.material.opacity = 0;
    if (!resumed) setTimeout(() => m.game.mode === 'escape' && m.def.id === 'tunnels' && !m.done.has('vent') &&
      pal(m, 'Hello, Jack! I am P.A.L. You are not supposed to be down here. Please crawl through the vent. Thank you!', 5), 3600);
  },
  questDone(m, q) {
    if (q.id === 'vent') pal(m, 'Well done! Please go into the Parts Room. It is perfectly safe.', 4);
    if (q.id === 'parts') startStill(m, this);
    if (q.id === 'still') pal(m, 'Thank you for standing still! You may now move. Please go to the Control Room.', 4.5);
    if (q.id === 'control') {
      pal(m, 'Oh no. DJ Rocco is awake. Please give him a CONTROLLED SHOCK when he comes to the window. Only when he is at the window, please!', 6);
      rocco.go(m);
    }
    if (q.id === 'shock') {
      m.decor.exit.setOpen(true);
      sfx.escUnlock();
      setTimeout(() => pal(m, 'Excellent shocking! The ladder in the Ladder Room is unlocked. Goodbye, Jack!', 5), 1500);
    }
    if (q.id === 'gears') setTimeout(() => pal(m, 'You found my gears! I collect gears. It is my hobby. Thank you!', 4), 600);
  },
  use(m, t) {
    if (t.id !== 'shock') return true;
    return rocco.shock(m);
  },
  update(m, dt) {
    const p = m.player;
    // you can't stand up in the vent
    const a = m.place.P(VENT.x0, VENT.z0), b = m.place.P(VENT.x1, VENT.z1);
    const inVent = p.pos.x > a.x && p.pos.x < b.x && p.pos.z > a.z && p.pos.z < b.z;
    if (inVent && !p.crouching) {
      p.crouching = true;
      if (!this.ventToast) { this.ventToast = true; m.game.hud.toast('⤓ It\'s too low to stand up in here — crawl!', 2.6); }
    }
    if (this.still) updateStill(m, this, dt);
    rocco.update(m, dt);
  },
};

// ── Stand still ─────────────────────────────────────────────────────────
//
// The Parts Room's lights go out and Gerald walks round it in the dark. Move while he's close
// and he hears you.

function startStill(m, def) {
  const d = m.decor;
  for (const l of d.partsLights) l.off = true;
  m.game.lighting.apply();
  sfx.blackout();
  pal(m, 'Uh oh. The lights are off. Something is walking around. Please STAND PERFECTLY STILL until the lights come back on.', 6);
  const g = m.enemies.find((e) => e.id === 'gerald');
  g.pos.copy(m.place.P(41, 27));
  g.state = 'goto';
  g.root.visible = true;
  const loop = [[41, 15], [28.5, 15.5], [28.5, 27], [36, 19], [41, 27]].map(([x, z]) => m.place.P(x, z));
  def.still = { t: 0, len: 16, g, loop, i: 0, warned: 0 };
  g.goTo(loop[0]);
}

function updateStill(m, def, dt) {
  const s = def.still, g = s.g, p = m.player;
  s.t += dt;
  // keep him walking his loop round the room
  if (!g.path.length) { s.i = (s.i + 1) % s.loop.length; g.goTo(s.loop[s.i]); }
  g.state = 'goto';
  const close = g.distToPlayer() < 7;
  const moved = p.moving > 0.12;
  if (close && moved) {
    def.still = null;
    m.caught(g, 'Gerald heard you move!');
    return;
  }
  const left = Math.ceil(s.len - s.t);
  m.game.hud.toast(`🤫 DON'T MOVE... ${left}`, 0.3);
  if (s.t >= s.len) {
    def.still = null;
    for (const l of m.decor.partsLights) l.off = false;
    m.game.lighting.apply();
    sfx.powerOn();
    g.state = 'wait';
    g.timer = 8;
    g.pos.copy(m.place.P(39, 26));
    m.check('still');
  }
}

// ── DJ Rocco, behind the glass ──────────────────────────────────────────
//
// He walks up from his charger to the window. While he's at the glass, a controlled shock
// sends him back. Shock him when he isn't there and it's wasted — and he comes faster. Leave
// him at the glass too long and he breaks through.

const rocco = {
  rig: null,
  place(m, d) {
    if (!this.rig) {
      this.rig = buildRocco();
      this.rig.root.rotation.order = 'YXZ';
      m.game.scene.add(this.rig.root);
      this.obj = { id: 'rocco', name: 'DJ Rocco', def: { kind: 'watcher' }, rig: this.rig, root: this.rig.root, pos: new THREE.Vector3(), yaw: N };
    }
    this.mode = m;
    this.home = m.place.P(19.5, 27.2);
    this.glass = m.place.P(19.5, 22.6);
    this.obj.pos.copy(this.home);
    this.state = m.done.has('shock') ? 'done' : m.done.has('control') ? 'coming' : 'asleep';
    this.speed = 0.75;
    this.at = 0;
    this.finished = this.state === 'done';
    this.rig.root.visible = true;
    setEyes(this.rig, this.state === 'coming' ? 'on' : 'dim');
    this.draw(0);
  },
  go(m) { this.state = 'coming'; this.at = 0; setEyes(this.rig, 'on'); sfx.reboot(this.obj.pos); },
  shock(m) {
    const d = m.decor;
    sfx.plexShock();
    m.game.effects.burst(this.glass.clone().setY(1.6), 14, 3);
    if (this.state !== 'window') {
      this.speed *= 1.25;
      pal(m, 'Too early! That shock was wasted. And now he is angry. Please wait until he is AT the window.', 4.5);
      return 'pending';
    }
    m.flags.shocks = (m.flags.shocks || 0) + 1;
    this.state = 'back';
    sfx.powerDown(this.obj.pos);
    d.windowCracks.material.opacity = 0;
    // the third one: back to his charger for good, and he powers down there
    if (m.flags.shocks >= 3) { this.finished = true; return true; }
    pal(m, ['Good shocking! He will be back. Be ready.', 'Excellent! One more, please.'][m.flags.shocks - 1], 3.5);
    if (m.watch.open) m.watch.render();
    return 'pending';
  },
  update(m, dt) {
    if (!this.rig || !this.home) return;
    const o = this.obj;
    if (this.state === 'coming') {
      const to = this.glass;
      const dx = to.x - o.pos.x, dz = to.z - o.pos.z, dd = Math.hypot(dx, dz);
      const v = this.speed * m.game.diff.speed;
      if (dd < 0.1) { this.state = 'window'; this.at = 0; sfx.pound(o.pos); }
      else o.pos.set(o.pos.x + (dx / dd) * Math.min(dd, v * dt), 0, o.pos.z + (dz / dd) * Math.min(dd, v * dt));
    } else if (this.state === 'window') {
      this.at += dt;
      m.decor.windowCracks.material.opacity = Math.min(0.5, this.at / 8);
      if (Math.random() < dt * 1.5) sfx.pound(o.pos);
      if (this.at > 4.5) {
        this.state = 'asleep';
        sfx.crash(o.pos);
        m.caught(o, 'DJ Rocco broke through the glass!');
        return;
      }
    } else if (this.state === 'back') {
      const to = this.home;
      const dx = to.x - o.pos.x, dz = to.z - o.pos.z, dd = Math.hypot(dx, dz);
      if (dd < 0.1 && this.finished) { this.state = 'done'; setEyes(this.rig, 'dim'); sfx.powerDown(o.pos); }
      else if (dd < 0.1) { this.state = 'coming'; this.speed *= 1.1; }
      else o.pos.set(o.pos.x + (dx / dd) * Math.min(dd, 3.5 * dt), 0, o.pos.z + (dz / dd) * Math.min(dd, 3.5 * dt));
    }
    this.draw(dt);
  },
  draw(dt) {
    const o = this.obj, r = this.rig.root;
    r.position.set(o.pos.x, 0, o.pos.z);
    r.rotation.set(0, N, 0);
    const moving = this.state === 'coming' || this.state === 'back';
    poseRig(this.rig, this.state === 'window' ? 'stare' : moving ? 'walk' : 'idle', (this.t = (this.t || 0) + dt) * (moving ? 6 : 1), moving ? 1 : 0.3, dt || 1 / 60);
  },
};
