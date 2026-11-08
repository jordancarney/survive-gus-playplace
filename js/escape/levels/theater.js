// Level 7 — the Starlight Movie Theater.
//
// Three theaters along a hallway; the Lobby (popcorn, the ticket booth, the front doors), the
// Projector Room and the Snack Storage on the other side. The front doors only open at
// showtime — and there's no movie without the film. Find the three reels and put them in the
// projector: the movie starts in Theater 1, and the two Ticket Bots go in to watch it. That's
// your chance to sneak out.
import * as THREE from 'three';
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth } from '../../models.js';
import { sfx } from '../../audio.js';
import { GLOW } from '../../config.js';
import { buildTicketBot } from '../cast.js';
import { surface } from '../../materials.js';

const layout = {
  w: 44, h: 32, wallH: 4.2, panels: false,
  wallColor: 0x1a0a10, headerColor: 0xc9a227,
  ceiling: () => T.tiles('#1a1418', '#120e10'),
  rooms: {
    X: { name: 'Theater 1', x0: 1, z0: 1, x1: 13, z1: 12,
         floor: () => T.carpet('#3a0a14'), wall: ['#3a0a14', '#c9a227', '#1a0408', 'stars'] },
    Y: { name: 'Theater 2', x0: 15, z0: 1, x1: 27, z1: 12,
         floor: () => T.carpet('#0a1a3a'), wall: ['#0a1a3a', '#c9a227', '#04081a', 'stars'] },
    Z: { name: 'Theater 3', x0: 29, z0: 1, x1: 42, z1: 12,
         floor: () => T.carpet('#1a0a3a'), wall: ['#1a0a3a', '#c9a227', '#08041a', 'stars'] },
    H: { name: 'Hallway', x0: 1, z0: 14, x1: 42, z1: 16,
         floor: () => T.carpet('#5a1a24'), wall: ['#5a1a24', '#c9a227', '#2a0a10', 'stripes'] },
    L: { name: 'Lobby', x0: 1, z0: 18, x1: 22, z1: 30,
         floor: () => T.carpet('#2a0a3a'), wall: ['#5a1a4a', '#ffd23f', '#2a0a2a', 'stars'] },
    J: { name: 'Projector Room', short: 'Projector', x0: 24, z0: 18, x1: 32, z1: 30,
         floor: () => T.concrete(), wall: ['#3a3d44', '#c9a227', '#22242a', 'bricks'] },
    Q: { name: 'Snack Storage', short: 'Storage', x0: 34, z0: 18, x1: 42, z1: 30,
         floor: () => T.concrete(), wall: ['#4a4d55', '#ff9a1f', '#2b2d33', 'bricks'] },
  },
  doors: [
    { a: 'X', b: 'H', x0: 6, z0: 13, x1: 7, z1: 13 },
    { a: 'Y', b: 'H', x0: 20, z0: 13, x1: 21, z1: 13 },
    { a: 'Z', b: 'H', x0: 35, z0: 13, x1: 36, z1: 13 },
    { a: 'L', b: 'H', x0: 8, z0: 17, x1: 11, z1: 17 },
    { a: 'J', b: 'H', x0: 27, z0: 17, x1: 28, z1: 17 },
    { a: 'Q', b: 'H', x0: 38, z0: 17, x1: 39, z1: 17 },
    { a: 'L', b: 'J', x0: 23, z0: 24, x1: 23, z1: 25 },
  ],
};

// A movie of moving colours, for the screen once the projector's running.
let movieTex = null;
function movie() {
  if (movieTex) return movieTex;
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  movieTex = new THREE.CanvasTexture(c);
  movieTex.colorSpace = THREE.SRGBColorSpace;
  movieTex.userData.paint = (t) => {
    const g = c.getContext('2d');
    g.fillStyle = `hsl(${(t * 20) % 360}, 60%, 30%)`; g.fillRect(0, 0, 256, 128);
    // a cartoon Gus bouncing across the screen
    const x = 40 + ((t * 40) % 200), y = 80 - Math.abs(Math.sin(t * 3)) * 40;
    g.fillStyle = '#7a4a2b'; g.beginPath(); g.arc(x, y, 18, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#4a5262'; g.beginPath(); g.ellipse(x + 14, y + 4, 12, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#5b2a86'; g.fillRect(x - 8, y - 32, 16, 16);
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x + 5, y - 5, 4, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffd23f'; g.font = 'bold 14px sans-serif'; g.fillText('THE GUS SHOW', 80, 20);
    movieTex.needsUpdate = true;
  };
  movieTex.userData.paint(0);
  return movieTex;
}

function build(d) {
  const P = d.place.P;
  d.screens = [];

  // ── The three theaters: a big screen, rows of seats, curtains to hide in, step lights
  for (const [x0, x1, room] of [[1, 13, 'X'], [15, 27, 'Y'], [29, 42, 'Z']]) {
    const cx = (x0 + x1 + 1) / 2, w = x1 - x0 + 1;
    const g = d.anchor(cx, 1.04, 'south', 2.5);
    const m = new THREE.MeshBasicMaterial({ color: 0x2a2a30 });
    d.mesh(G.plane, m, g, { s: [w - 3, 2.8, 1], shadow: false });
    d.screens.push({ room, mat: m });
    d.seats(cx - 4.2, 5, 12, 4, 'north', [0x8a1a20, 0x1a3a8a, 0x5a1a8a][d.screens.length - 1], { dx: 0.7, dz: 1.5 });
    for (let k = 0; k < 4; k++) d.patch(x0 + 1.2, 5 + k * 1.5, 0.5, 0.12, 0xffd23f, { glow: 0.2, y: 0.02 });
    d.hideSpot('curtain', x0 + 0.8, 2.2, 'east', { color: 0x8a1a20 }).name = 'Hide behind the big curtain';
    d.lamp(cx, 11, 0.4, 0xffb070, 0.7, { distance: 6, room, bulb: false });
  }
  d.label('NOW SHOWING: THE GUS SHOW', 7.5, 13.04 + 1, 3.4, 3.4, 0.4, 'south', { bg: '#1a0408', fg: '#ffd23f', glow: '#ff3fa4' });
  d.movieLight = d.lamp(7.5, 2.4, 2.5, 0x9fb8ff, 3.0, { distance: 14, room: 'X', bulb: false, flicker: true });
  d.movieLight.off = true;
  d.savePoint(12.4, 11.4, 'west');
  d.savePoint(30.2, 11.4, 'east');
  d.item('reel', 'reel1', 26.4, 2.2, 0.6);
  d.item('reel', 'reel2', 41.4, 11.2, 0.6);
  d.item('plushie', 'plushie', 41.6, 2.0, 0.35);

  // ── The hallway: posters, little lights along the floor
  for (const [x, face, t] of [[4, 'gus', 'THE GUS\nSHOW'], [17, 'cranker', 'PENGUIN\nPANIC'], [25, 'chomper', 'BEAVER\nBUILDERS'], [32, 'flipper', 'DOLPHIN\nDASH'], [40, 'gerald', 'JUNGLE\nDRUMS']]) {
    d.poster(t, '#5a1a4a', face, x, 14.04, 1.7, 'south');
  }
  for (let x = 3; x < 42; x += 4) d.lamp(x, 15.9, 0.15, 0xffd23f, 0.5, { distance: 4, room: 'H', size: 0.06 });
  d.savePoint(41.4, 15.2, 'west');

  // ── The Lobby: the popcorn stand, the ticket booth, the front doors
  d.counter(12, 20.5, 8, 1.0, 1.05, 0x8a1a20, 0xe8e0d0);
  const pop = P(9, 20.5, 1.05);
  d.mesh(G.box, mat(0xd11f2a), d.group, { p: [pop.x, pop.y + 0.4, pop.z], s: [0.8, 0.8, 0.6] });
  d.popcorn = d.mesh(G.box, glowMat(0xfff0a0, 0.2), d.group, { p: [pop.x, pop.y + 0.4, pop.z + 0.31], s: [0.65, 0.6, 0.02], shadow: false, still: false });
  d.popcornMat = d.popcorn.material;
  d.popcornMat.color.set(0x3a3020);
  d.label('POPCORN · SODA · CANDY', 12, 20.5, 2.6, 4.0, 0.5, 'south', { bg: '#8a1a20', fg: '#ffd23f', glow: '#ffd23f' });
  d.target('popcorn', 9, 21.6, 'north', 'Make some popcorn for Jack', null, { reach: 1.6 });
  d.hideSpot('counter', 17.4, 20.5, 'east', { color: 0x8a1a20 }).name = 'Hide behind the popcorn counter';
  d.block(3.5, 28, 3, 2.4, 2.4, mat(0x9fd8ff, { rough: 0.05, metal: 0.3 }));
  d.label('TICKETS', 3.5, 26.76, 2.6, 1.6, 0.36, 'north', { bg: '#c9a227', fg: '#1a0408', glow: '#fff2a0' });
  d.cabinet(22.6, 27, 'west', 0xa970ff, 'PIZZA PAL');
  d.cabinet(22.6, 28.6, 'west', 0x2a4fa0, 'GUS KART');
  d.exitDoor(11, 30.4, 'north', { w: 2.6, label: 'EXIT' });
  d.label('DOORS OPEN AT SHOWTIME', 11, 30.96, 3.0, 3.6, 0.36, 'north', { bg: '#2a0606', fg: '#ff6b6b', glow: '#ff3b30' });
  d.savePoint(2.2, 19.2, 'east');
  d.lamp(12, 24, 3.8, 0xff7eb6, 1.3, { distance: 11, room: 'L' });
  d.lamp(4, 25, 3.0, 0xffd23f, 0.9, { distance: 7, room: 'L', flicker: true });
  d.label('STARLIGHT CINEMA', 11, 18.04 + 0.0, 3.5, 4, 0.6, 'south', { bg: '#1a0408', fg: '#ffd23f', glow: '#ff3fa4' });

  // ── The Projector Room: the big projector, shelves of film cans
  d.target('projector', 28, 19.4, 'south', 'Put the 3 film reels in the projector', (g) => {
    d.mesh(G.box, mat(0x3a3d44, { metal: 0.6, rough: 0.4 }), g, { p: [0, 0.6, 0], s: [1.2, 1.2, 0.9] });
    d.mesh(G.box, mat(0x2a2c31, { metal: 0.6 }), g, { p: [0, 1.5, 0], s: [0.8, 0.6, 0.7] });
    d.projReels = [-0.3, 0.3].map((x) => d.mesh(G.cyl, mat(0x6a6a72, { metal: 0.8 }), g, { p: [x, 2.05, 0], s: [0.3, 0.05, 0.3], r: [0, 0, Math.PI / 2], still: false }));
    for (const r of d.projReels) r.visible = false;
    d.projLens = glowMat(0x222222, 1);
    d.mesh(G.cyl, d.projLens, g, { p: [0, 1.5, -0.4], s: [0.15, 0.1, 0.15], r: [Math.PI / 2, 0, 0], shadow: false });
  }, { reach: 1.8 });
  d.place.addBlock(27.4, 18.95, 28.6, 19.85, 1.8);
  d.shelf(32.65, 24, 0.6, 5, 1.8, 'west', { wood: 0x5a5a62, books: false });
  for (let k = 0; k < 8; k++) {
    const c = P(32.3, 22 + k * 0.55, 0.5 + (k % 3) * 0.55);
    d.mesh(G.cyl, mat(0x8a8f99, { metal: 0.7 }), d.group, { p: [c.x, c.y, c.z], s: [0.22, 0.06, 0.22], r: [0, 0, Math.PI / 2] });
  }
  d.hideSpot('box', 24.8, 29.2, 'north', { color: 0x6a5a4a }).name = 'Hide in the film box';
  d.savePoint(31.4, 29.4, 'west');
  d.lamp(28, 24, 3.6, 0xffe2b0, 1.1, { distance: 9, room: 'J', flicker: true });

  // ── Snack Storage: boxes and boxes of popcorn, the janitor's closet, the last reel
  for (let i = 0; i < 6; i++) d.crate(36 + (i % 3) * 1.1, 22 + Math.floor(i / 3) * 3.5, 0.9, [0xd8b880, 0xc0262d, 0xffd23f][i % 3]);
  d.hideSpot('locker', 42.65, 21, 'west', { color: 0x5a6070 }).name = "Hide in the janitor's closet";
  d.item('reel', 'reel3', 41.4, 29.2, 0.6);
  d.savePoint(35, 29.4, 'north');
  d.lamp(38, 25, 3.6, 0xffc890, 0.9, { distance: 8, room: 'Q' });
}

const usher = (start, wait) => ({
  id: 'ticket', name: 'a Ticket Bot', build: buildTicketBot, walk: 2.0, chase: 4.2, sight: 12, hear: 9,
  roam: ['L', 'L', 'H', 'X', 'Y', 'Z', 'Q', 'J'], start, wait, hunt: 0.3, steps: 'chomper', stride: 0.8, lose: 5,
  shout: () => ['TICKET, PLEASE!', 'No sneaking into movies!', 'Where is your ticket?!'][Math.floor(Math.random() * 3)],
});

export default {
  id: 'theater',
  name: 'Starlight Cinema',
  layout,
  build,
  mood: { amb: 0.075, hemi: 0.07, fog: 0.03, bg: 0x08030a },
  spawn: { at: [11, 27.5], yaw: 0 },
  firstLine: 'The doors say "open at showtime"... so we need to start a movie!',
  card: {
    story: 'The only way across to the pizza place is through the <b>Starlight Cinema</b>. Inside it smells like old popcorn, and the screens are dark.',
    goal: '⌚ The front doors only open at <b>showtime</b>. Find the <b>3 film reels</b> and put them in the <b>projector</b> — then sneak out while the movie plays.',
    watchOut: '👀 Two <b>Ticket Bots</b> walk around looking for kids without tickets. But they LOVE movies...',
    after: 'While the Ticket Bots laughed at the movie, Jonathan and Jack tiptoed out into the night — and ran straight into the brightest, biggest pizza place they had ever seen: <b>Gus\'s Giant Pizza Palace</b>.',
  },
  quests: [
    { id: 'reels', type: 'collect', item: 'reel', count: 3, text: 'Find the 3 film reels', done: 'You have all 3 film reels!' },
    { id: 'show', type: 'use', target: 'projector', text: 'Put the reels in the projector (Projector Room)', done: "It's SHOWTIME!" },
    { id: 'exit', type: 'exit', text: 'Sneak out the front doors while the Ticket Bots watch the movie!' },
    { id: 'popcorn', type: 'use', target: 'popcorn', optional: true, text: 'Make some popcorn for Jack (Lobby)', done: 'Jack loves popcorn!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [usher([16, 26], 6), usher([35, 15], 12)],
  tips: {
    ticket: 'The Ticket Bots walk the Lobby and the Hallway the most. Sneak through the theaters, and hide behind the big curtains by the screens.',
  },
  start(m) {
    m.movieT = 0;
    if (m.done.has('show')) showtime(m, true);
    else {
      for (const s of m.decor.screens) { s.mat.map = null; s.mat.color.set(0x2a2a30); s.mat.needsUpdate = true; }
      m.decor.movieLight.off = true;
      m.game.lighting.apply();
    }
  },
  use(m, t) {
    const d = m.decor;
    if (t.id === 'projector') { showtime(m, false); return true; }
    if (t.id === 'popcorn') {
      d.popcornMat.color.set(0xfff0a0).multiplyScalar(Math.max(1, GLOW * 0.2));
      sfx.escCollect();
      for (let k = 0; k < 8; k++) setTimeout(() => sfx.clicks?.(d.popcorn.getWorldPosition(new THREE.Vector3())), k * 120);
      m.say('POPCORN! You\'re the best, Jonathan.', 2.6);
      return true;
    }
    return true;
  },
  update(m, dt) {
    if (!m.flags.show) return;
    m.movieT += dt;
    const tex = movie();
    tex.userData.paint(m.movieT);
  },
};

// The movie starts: the screen in Theater 1 lights up, the Ticket Bots go in and sit down to
// watch, and the front doors open.
function showtime(m, quiet) {
  const d = m.decor;
  m.flags.show = true;
  for (const r of d.projReels) r.visible = true;
  d.projLens.color.set(0xfff4d0).multiplyScalar(Math.max(1, GLOW * 0.6));
  const screen = d.screens[0].mat;
  screen.map = movie();
  screen.color.setScalar(Math.max(1, GLOW * 0.3));
  screen.needsUpdate = true;
  d.movieLight.off = false;
  m.game.lighting.apply();
  d.exit.setOpen(true);
  const seats = [[4.4, 3.6], [10.6, 3.6]];
  m.enemies.forEach((e, i) => {
    const [x, z] = seats[i % 2];
    if (quiet) { e.pos.copy(m.place.P(x, z)); e.state = 'watch'; e.yaw = Math.PI; return; }
    e.sendTo(m.place.P(x, z), Math.PI);
  });
  if (quiet) return;
  sfx.powerOn();
  setTimeout(() => sfx.cheer(), 1500);
  setTimeout(() => m.say('Listen... they\'re going to watch the movie! The doors are open — let\'s GO!', 3.5), 2000);
}
