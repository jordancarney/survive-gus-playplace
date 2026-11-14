// Chapter 32 — Thomas: The Storm (3:50 AM).
//
// The Giant Ball Pit room's power is out, and the exit with it. Thomas dives — and comes up in
// Gus's Pizza Shack on a stormy night long ago, in a blackout, rain on the windows and
// lightning every few seconds. Three fuses for the Shack's fuse box... and the moment the power
// comes back on, the music box on the stage starts to play — and lightning hits the sign.
// Every animatronic in the Shack opens its eyes for the very first time. This is the night it
// all started (the story Old John tells at the end of the main game). Run for the ball pit.
//
// The Pizzaplex still uses the Shack's old fuse box for the Giant Ball Pit room: back home,
// flip it, and the lights — and the exit — come on.
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, buildAnimatronic } from '../../models.js';
import { buildOld, buildRocco, buildSparky, buildOldGus } from '../cast.js';
import { sfx, startMusicBox } from '../../audio.js';
import { E, W, N, S, MOODS, nowRooms, NOW_DOOR, NOW_AT, SPAWN, giantPit, smallPit, windows, travel, setZone, zone, enemy, musicBoxAt, THOMAS, nowBot } from './kit.js';
import { shackRooms, SHACK_DOORS, buildShack } from './shack.js';

const layout = {
  w: 70, h: 34, wallH: 4.0, panels: false,
  wallColor: 0x1d1424, headerColor: 0xffd23f,
  ceiling: () => T.tiles('#2a2036', '#1d1626'),
  rooms: {
    ...nowRooms({ name: 'Power Room', floor: () => T.concrete(), wall: ['#3a3d44', '#f2c230', '#22242a', 'bricks'] }),
    ...shackRooms('Storeroom'),
  },
  doors: [NOW_DOOR, ...SHACK_DOORS],
};

const BOX = [61.2, 19.5];
const SHACK = new Set(['D', 'K', 'S', 'O']);

function build(d) {
  const P = d.place.P;
  // ── now: no power in the Power Room
  giantPit(d, { glow: 0x9fb8ff, glow2: 0x9f7fff });
  d.exitDoor(18, 32.4, 'north', { w: 1.6, label: 'EXIT' });
  d.noPower = d.label('NO POWER', 18, 32.96, 2.7, 1.8, 0.4, 'north', { bg: '#2a0606', fg: '#ff3b30', glow: '#ff3b30' });
  d.target('power', 3, 31.4, 'north', 'Flip the OLD fuse box on 🔌', (g) => {
    d.mesh(G.box, mat(0x6a7078, { metal: 0.5, rough: 0.5 }), g, { p: [0, 1.3, -0.4], s: [0.8, 1.0, 0.2] });
    d.mesh(G.box, lam(0x2a2c31), g, { p: [0, 1.3, -0.29], s: [0.6, 0.8, 0.02] });
  });
  d.label('PIZZA SHACK FUSE BOX\n(still works!)', 3, 32.96, 2.3, 2.4, 0.5, 'north', { bg: '#2a1a10', fg: '#ffd23f', glow: '#ff9a1f' });
  for (const [x, z] of [[8, 22], [14, 26]]) d.junk(x, z, 1.3);
  d.hideSpot('locker', 21.4, 24, 'west', { color: 0x4a6ab8 });
  d.powerLamp = d.lamp(10, 25, 3.6, 0xfff0c0, 1.0, { distance: 12, room: 'H' });
  d.powerLamp.off = true;

  // ── long ago, a stormy night: the Shack in a blackout
  buildShack(d, { closed: true, lights: 0xfff0d0, k: 1.6 });
  d.shackLights = d.lights.filter((l) => SHACK.has(l.room));
  d.panes = windows(d, [[41, 1.04, 'south'], [46, 1.04, 'south'], [52, 1.04, 'south']], 0x1a2440, 0.3);
  smallPit(d, 40.5, 6.0);
  d.label('BALL PIT', 40.5, 3.05, 1.5, 1.5, 0.6, 'south', { bg: '#ffd23f', fg: '#c0262d', glow: '#ffffff' });
  // the fuse box, in the kitchen
  d.target('fusebox', 57.6, 9, 'east', 'Put the fuses in the fuse box 🔌', (g) => {
    d.mesh(G.box, mat(0x6a7078, { metal: 0.5, rough: 0.5 }), g, { p: [0, 1.3, -0.4], s: [0.8, 1.0, 0.2] });
    d.mesh(G.box, lam(0x2a2c31), g, { p: [0, 1.3, -0.29], s: [0.6, 0.8, 0.02] });
  });
  // the music box on the stage
  const b = P(BOX[0], BOX[1]);
  d.mesh(G.cyl, lam(0x5a3a22), d.group, { p: [b.x, 0.4, b.z], s: [0.35, 0.8, 0.35] });
  d.mesh(G.box, mat(0x7a2a8a, { rough: 0.4 }), d.group, { p: [b.x, 0.95, b.z], s: [0.4, 0.28, 0.32] });
  d.mesh(G.box, mat(0xf2c230, { metal: 0.7, rough: 0.3 }), d.group, { p: [b.x, 1.12, b.z], s: [0.42, 0.04, 0.34] });
  d.item('fuse', 'f1', 67.6, 2.0, 1.1);
  d.item('fuse', 'f2', 52.5, 31.4);
  d.item('fuse', 'f3', 54.4, 9.2);
  // the storeroom: crates and shelves
  for (const [x, z] of [[40, 22], [40, 26], [48, 30]]) d.crate(x, z, 1.0, 0x6a5a4a);
  d.shelf(55.4, 26, 0.6, 6, 2.2, 'west', { wood: 0x5a3a24, books: false });
  d.item('plushie', 'plushie', 37, 31.4, 0.5);
  d.spots.spawn = P(...SPAWN);
}

const quests = [
  { id: 'dive', type: 'use', target: 'dive', text: 'DIVE into the giant ball pit (E at its edge)', done: 'Down, down, down...' },
  { id: 'fuses', type: 'collect', item: 'fuse', count: 3, text: 'Find 3 fuses in the dark Pizza Shack', done: 'Three fuses!' },
  { id: 'fusebox', type: 'use', target: 'fusebox', text: 'Put the fuses in the Shack\'s fuse box (kitchen)', done: 'The power\'s back...' },
  { id: 'home', type: 'use', target: 'home', text: 'RUN back to the ball pit and jump in!', done: 'Home again!' },
  { id: 'power', type: 'use', target: 'power', text: 'Flip the OLD fuse box in the Power Room', done: 'The lights are on!' },
  { id: 'exit', type: 'exit', text: 'Get out through the Power Room!' },
  { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
];

const old = (id, name, start, extra = {}) => ({
  id: `old${id}`, name, build: () => buildAnimatronic(id, { old: true }), walk: 1.8, chase: 3.6, sight: 11, hear: 9, hunt: 0.45, lose: 5,
  roam: ['D', 'K', 'S', 'O', 'D'], start, yaw: W, wait: 1, asleep: true, steps: id, stride: 0.95, shoutWho: name, ...extra,
});

function lightsOn(m, on) {
  for (const l of m.decor.shackLights) l.off = !on;
  m.game.lighting.apply();
}

export default {
  ...THOMAS,
  id: 'storm',
  name: 'The Storm',
  layout,
  build,
  mood: MOODS.now,
  zones: { now: NOW_AT, past: { at: [40.5, 6.0], yaw: W, mood: MOODS.storm, flashlight: true } },
  spawn: { at: SPAWN, yaw: 0 },
  firstLine: 'No power down here... and the exit\'s in the dark. Ball pit, here I come.',
  winTitle: 'THOMAS SAW WHERE IT ALL STARTED!',
  exitText: 'Out you go! 🏃',
  card: {
    story: '<b>3:50 AM.</b> The power in the Giant Ball Pit room went out, and the exit door with it. There\'s an old fuse box by the door with a sign: <b>PIZZA SHACK FUSE BOX</b>. It doesn\'t work. <b>Thomas</b> knows exactly where it came from — so down he goes, into the balls. He comes up in the Pizza Shack, long ago... on a dark and stormy night.',
    goal: '🫧 In the blackout, find <b>3 fuses</b> and put them in the Shack\'s <b>fuse box</b> in the kitchen. Then <b>run</b> for the ball pit, swim home, and flip the old fuse box in the Power Room.',
    watchOut: '⚡ Something is going to happen when the power comes back on. Be ready to RUN. Back home, <b>Flipper</b>, <b>Sparky</b> and <b>DJ Rocco</b> are all round the Giant Ball Pit.',
    after: 'The Power Room lights buzzed on. Thomas sat down hard on the floor. <i>"Jackson,"</i> he said into the walkie. <i>"I saw it. The music box was playing, and the lightning hit the sign, and they all opened their eyes. That\'s how it started."</i><br><br>Somewhere close by, two voices started counting: <i>"ONE... TWO... THREE..."</i> In the play tubes, <b>Timmy</b> held his breath.',
  },
  friends: [
    '🔵 Jonathan: <b>Upstairs party rooms</b>',
    '🟣 Max: <b>Sleepover Suite</b> · plushies everywhere',
    '🔦 Jackson: <b>Security Office</b> · Gus is off his stage',
    '🔴 Jack: <b>P.A.L.\'s Core</b>',
    '⚪ Timmy: <b>the play tubes</b> · he\'s with us now!',
  ],
  quests,
  enemies: [
    nowBot('flipper', 'Flipper', buildOld('flipper'), { walk: 2.0, chase: 3.9, hear: 11 }),
    nowBot('sparky', 'Sparky', buildSparky, { walk: 2.3, chase: 4.6, sight: 10, hear: 10, start: [19, 30], roam: ['H', 'B', 'H'], wait: 10,
      shout: () => ['WOOF! Wanna play fetch?!', 'Ruff ruff! Found you!'][Math.floor(Math.random() * 2)] }),
    nowBot('rocco', 'DJ Rocco', buildRocco, { walk: 2.3, chase: 4.3, sight: 11, start: [4, 30], roam: ['H', 'B'], wait: 18,
      shout: () => ['Nobody leaves the dance floor!', 'Party time!'][Math.floor(Math.random() * 2)] }),
    { ...old('gus', 'Old Gus', [65, 19.5]), build: buildOldGus, id: 'oldgus', steps: 'gus',
      shout: () => ['Never stop singing...', 'The party\'s just STARTED!'][Math.floor(Math.random() * 2)] },
    old('chomper', 'Old Chomper', [64.5, 16.6]),
    old('cranker', 'Old Cranker', [64.5, 22.4], { walk: 1.5, chase: 3.3 }),
  ],
  tips: {
    flipper: 'Flipper can hear you run. WALK when he\'s near.',
    sparky: 'Sparky is super fast. Hide before he sees you, or dive into the ball pit!',
    rocco: 'Keep an eye on your Gus Watch tracker: DJ Rocco is fast too.',
    oldgus: 'When the lightning hits, they ALL wake up. Get to the ball pit fast — the counter by the window is a good place to hide on the way.',
    oldchomper: 'Run for the ball pit the moment the lightning hits — before they get off the stage.',
    oldcranker: 'Old Cranker is slow. Walk away from him and keep going to the ball pit.',
  },
  start(m) {
    const d = m.decor;
    this.flash = 0;
    this.nextBolt = 4;
    this.thunder = 0;
    const powered = m.done.has('fusebox');
    lightsOn(m, powered);
    d.powerLamp.off = !m.done.has('power');
    d.noPower.visible = !m.done.has('power');
    d.exit.setOpen(m.done.has('power'));
    if (powered) {
      startMusicBox(musicBoxAt(m, () => m.place.P(...BOX)));
      for (const e of m.enemies) if (e.id.startsWith('old')) e.wake();
    }
    setZone(m);
    if (powered) lightsOn(m, true);
  },
  arrive(m) { lightsOn(m, m.done.has('fusebox')); m.decor.powerLamp.off = !m.done.has('power'); m.game.lighting.apply(); },
  update(m, dt) {
    const d = m.decor;
    // the storm: lightning through the Shack's windows every few seconds, then thunder
    if (zone(m) === 'past') {
      this.nextBolt -= dt;
      if (this.nextBolt <= 0) this.bolt(m, 1);
      if (this.thunder > 0) { this.thunder -= dt; if (this.thunder <= 0) sfx.thunder(); }
      // and the rain, all the time
      this.rainT = (this.rainT || 0) - dt;
      if (this.rainT <= 0) { this.rainT = 2.0; sfx.rain(); }
    }
    this.flash = Math.max(0, this.flash - dt * 5);
    for (const p of d.panes) p.material.color.setRGB(0.1 + this.flash * 2.2, 0.14 + this.flash * 2.2, 0.25 + this.flash * 2.4);
  },
  bolt(m, k) {
    this.nextBolt = 5 + Math.random() * 6;
    this.flash = k;
    m.game.effects.flashAt(m.place.P(46, 2.5, 2.4), 0xdfe8ff, 16 * k, 0.14);
    this.thunder = 0.5 + Math.random() * 1.2;
  },
  use(m, t) {
    if (t.id === 'dive') { travel(m, 'past', 'It\'s the Pizza Shack again... in a STORM. And all the lights are out.'); return true; }
    if (t.id === 'home') { travel(m, 'now', 'Made it! Now — the old fuse box!'); return true; }
    if (t.id === 'fusebox') {
      sfx.powerOn();
      lightsOn(m, true);
      setTimeout(() => {
        if (m.game.mode !== 'escape' || m.def.id !== 'storm') return;
        startMusicBox(musicBoxAt(m, () => m.place.P(...BOX)));
        m.say('Lights! ...and that music. The music box on the stage is PLAYING.', 3.2);
      }, 1200);
      // and then the lightning hits the sign
      setTimeout(() => {
        if (m.game.mode !== 'escape' || m.def.id !== 'storm') return;
        this.bolt(m, 3);
        this.thunder = 0.05;
        m.game.lighting.glitch(0.8);
        sfx.clang();
        m.player.shake = 1;
        for (const e of m.enemies) if (e.id.startsWith('old')) e.wake(1.15);
        setTimeout(() => m.say('The lightning hit the sign... and they OPENED THEIR EYES. ALL of them. RUN!', 3.5), 700);
      }, 4500);
      return true;
    }
    if (t.id === 'power') {
      sfx.powerOn();
      m.decor.powerLamp.off = false;
      m.decor.noPower.visible = false;
      m.decor.exit.setOpen(true);
      m.game.lighting.apply();
      return true;
    }
    return true;
  },
};
