// Lost in the Pizzaplex's cutscenes, in the same shot-list form as story.js (cutscene.js plays
// them). Positions are plan metres in the chapter they happen in.
//
//   plexIntro  before Chapter 1: the Pizzaplex's first Sleepover Night. Jonathan meets Max
//              and Thomas — and Jack, his best friend from daycare. Jackson the night guard
//              says goodnight. At midnight the lights go out, a music box plays, every
//              animatronic opens its eyes, and everybody runs.
import { sfx } from '../audio.js';
import { setEyes } from '../models.js';

const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;

const mode = (g) => g.plex;
const gus = (g) => mode(g).level.enemies.find((e) => e.id === 'gus');

const BRIGHT = { amb: 0.32, hemi: 0.32, fog: 0.012, bg: 0x0c0a18 };

const SUNRISE = { amb: 0.5, hemi: 0.6, fog: 0.008, bg: 0xffd8a8, env: 'day', envI: 0.5 };
const lobby = (g) => mode(g).level;

export const PLEX_STORY = {
  // The ending (after Chapter 50): 6 AM at the Main Entrance.
  plexFinale: {
    area: 'plex50',
    setup(g, c) {
      const m = mode(g), p = m.people, lv = lobby(g), d = lv.decor;
      d.setShutters(true);
      d.exit.setOpen(true);
      d.lobbyClock.set(360);
      g.lighting.setEscape(d, SUNRISE);
      // the night outside the front doors and windows turns to sunrise (put back afterwards)
      this.sky = [];
      d.group.traverse((o) => {
        const mt = o.material;
        if (!o.isMesh || !mt || !mt.isMeshBasicMaterial || mt.map) return;
        const c = mt.color;
        if (c.b > c.r * 1.4 && c.b > c.g && c.r + c.g + c.b < 1.6) { this.sky.push([mt, c.clone()]); c.set(0xffe2b0).multiplyScalar(1.3); }
      });
      c.put(p.jonathan, 31.0, 4.4, N);
      c.put(p.max, 32.4, 4.6, N);
      c.put(p.jack, 29.8, 5.2, N);
      c.put(p.thomas, 33.6, 5.2, N);
      c.put(p.timmy, 34.4, 4.8, N);
      c.put(p.jackson, 32, 6.4, N);
      for (const k of [p.jonathan, p.max, p.jack, p.thomas, p.timmy, p.jackson]) c.pose(k, 'idle', 0.4);
      // and behind them, everything that chased them all night, stopped dead
      const spots = { cranker: [26, 19], chomper: [29, 20.5], gerald: [35.5, 20.5], flipper: [38.5, 19], rocco: [32, 22], sparky: [23.5, 21.5], gus: [32, 14] };
      for (const e of lv.enemies) {
        const at = spots[e.id];
        if (!at) { e.root.visible = false; continue; }
        c.put(e, at[0], at[1], N);
        c.pose(e, 'idle', 0.2);
        setEyes(e.rig, 'on');
      }
      g.player.flashlight.intensity = 0;
    },
    cleanup(g) {
      const m = mode(g);
      for (const k of m.people.list) k.root.visible = false;
      for (const [mt, c] of this.sky || []) mt.color.copy(c);
    },
    shots: [
      { card: '6:00 AM', dur: 2.6 },
      {
        line: 'At six o\'clock, P.A.L.\'s steel shutters rolled up, the front doors clicked open, and the sun came up over the parking lot.', dur: 6.5,
        cam: { from: [32, 10.5, 1.7], to: [32, 9, 1.6], look: [32, 1.2, 1.9] },
        start() { sfx.sixAM(); },
      },
      {
        line: 'Behind them, every animatronic in the Pizzaplex stopped right where it stood.', dur: 5,
        cam: { from: [32, 6.8, 1.5], to: [32, 8.2, 1.6], look: [32, 19, 1.5] },
        update(g, c, k) {
          if (k > 0.5) for (const e of lobby(g).enemies) setEyes(e.rig, 'off');
        },
      },
      {
        who: 'Jackson', line: 'Is everybody here? Jonathan. Max. Jack. Thomas. Timmy.', dur: 5,
        cam: { from: [32, 4.2, 1.75], to: [32, 4.0, 1.75], look: [32, 6.4, 1.7] },
        start(g, c) { const p = mode(g).people; c.face(p.jackson, p.jonathan); for (const k of [p.jonathan, p.max, p.jack, p.thomas, p.timmy]) c.face(k, p.jackson); },
      },
      {
        who: 'Max', line: 'We did it. We actually DID it!',
        cam: { from: [31.4, 6.0, 1.4], to: [31.5, 5.9, 1.38], look: [32.4, 4.6, 1.3] },
      },
      {
        who: 'Timmy', line: 'I have to go home now. Gramma will be looking for me.',
        cam: { from: [33.4, 6.2, 1.05], to: [33.5, 6.1, 1.05], look: [34.4, 4.8, 0.95] },
      },
      {
        who: 'Thomas', line: 'The ball pit! It takes you where you need to go. Come on — I\'ll show you.',
        cam: { from: [32.6, 6.6, 1.2], to: [32.7, 6.5, 1.18], look: [33.6, 5.2, 1.05] },
        start(g, c) { const p = mode(g).people; c.face(p.thomas, p.timmy); c.face(p.timmy, p.thomas); },
      },
      { card: '...and Timmy jumped into the giant ball pit,\nand went home.', dur: 4.2 },
      {
        line: 'Years from now, on a new night guard\'s second night at a little fun centre called Gus\'s PlayPlace, a kid would wake up crying in the ball pit. And the night guard who found him would be Jonathan.', dur: 9,
        cam: { from: [32, 9, 1.6], to: [32, 7.5, 1.5], look: [32, 1.2, 1.9] },
        start(g, c) { const p = mode(g).people; c.hide(p.timmy); c.hide(p.thomas); },
        update(g, c, k) {
          const p = mode(g).people;
          c.walk(p.jonathan, [31.0, 4.4], [31.2, 1.0], k * 1.4);
          c.walk(p.max, [32.4, 4.6], [32.4, 1.0], k * 1.3);
          c.walk(p.jack, [29.8, 5.2], [30.4, 1.0], k * 1.2);
          c.walk(p.jackson, [32, 6.4], [33.4, 1.0], k * 1.1);
        },
      },
      {
        line: 'Nobody believed them, of course. That summer the Pizzaplex closed down for good, and its animatronics were sent to a little fun centre across town: Gus\'s PlayPlace.', dur: 8, fade: 'out',
        cam: { from: [32, 7.5, 1.6], to: [32, 9.5, 2.2], look: [32, 19, 1.6] },
      },
      { card: 'SIX YEARS LATER...', dur: 3 },
      { card: 'NOW HIRING\nNIGHT SECURITY', dur: 3.4 },
      { card: 'THE END\n\n⭐ Lost in the Pizzaplex ⭐', dur: 5 },
    ],
  },

  plexIntro: {
    area: 'plex1',
    setup(g, c) {
      const m = mode(g), p = m.people;
      g.lighting.setEscape(m.level.decor, BRIGHT);
      for (const e of m.level.enemies) e.root.visible = false;
      const gu = gus(g);
      c.put(gu, 33, 16.2, S);
      c.pose(gu, 'idle', 0.2);
      setEyes(gu.rig, 'off');
      c.put(p.jonathan, 31.4, 25.2, E + 0.3);
      c.put(p.jack, 34.4, 25.0, W - 0.3);
      c.put(p.max, 30.0, 27.2, E);
      c.put(p.thomas, 35.9, 26.9, W);
      c.put(p.jackson, 33, 30.0, N);
      for (const k of [p.jonathan, p.jack, p.max, p.thomas, p.jackson]) c.pose(k, 'idle', 0.4);
      // the other sleepover kids, already in their sleeping bags
      [[24.5, 21.8], [27, 23.9], [39, 21.8], [41.5, 23.9]].forEach(([x, z], i) => {
        c.put(p.kids[i], x, z, N);
        c.pose(p.kids[i], 'idle', 0.2);
      });
      g.player.flashlight.intensity = 0;
    },
    cleanup(g) {
      const m = mode(g);
      for (const k of m.people.list) k.root.visible = false;
      const gu = gus(g);
      if (gu) { setEyes(gu.rig, 'on'); gu.reset(); }
    },
    shots: [
      { card: "SIX YEARS BEFORE\nGUS'S PLAYPLACE...", dur: 3.2 },
      { card: "GUS'S PIZZAPLEX\nSLEEPOVER NIGHT · 11:52 PM", dur: 2.8 },
      {
        line: 'Gus\'s Pizzaplex was brand new — the biggest place Gus had ever had. And tonight was its very first Sleepover Night.', dur: 6,
        cam: { from: [33, 34.5, 3.4], to: [33, 32.2, 2.8], look: [33, 18, 2.0] },
      },
      {
        who: 'Jack', line: 'Jonathan? JONATHAN! From Pjork\'s Daycare!',
        cam: { from: [32.2, 26.2, 1.3], to: [32.4, 26.0, 1.28], look: [34.4, 25.0, 1.2] },
        start(g, c) { const p = mode(g).people; c.face(p.jack, p.jonathan); c.face(p.jonathan, p.jack); },
      },
      {
        who: 'Jonathan', line: 'JACK?! No way! I haven\'t seen you since we were five!',
        cam: { from: [33.6, 26.0, 1.3], to: [33.4, 25.9, 1.28], look: [31.4, 25.2, 1.15] },
      },
      {
        who: 'Max', line: 'You two know each other? Cool. I\'m Max. I\'m eleven, so I\'m kind of in charge.',
        cam: { from: [31.6, 26.0, 1.4], to: [31.5, 26.1, 1.38], look: [30.0, 27.2, 1.3] },
        start(g, c) { const p = mode(g).people; c.face(p.max, p.jonathan); c.face(p.jonathan, p.max); },
      },
      {
        who: 'Thomas', line: 'I\'m Thomas! I\'m seven! Is the giant ball pit open?',
        cam: { from: [34.6, 25.6, 1.1], to: [34.7, 25.7, 1.08], look: [35.9, 26.9, 1.0] },
        start(g, c) { const p = mode(g).people; c.face(p.thomas, p.jack); c.face(p.jack, p.thomas); },
      },
      {
        who: 'Jackson', line: 'Not tonight, little man. Okay, sleepover kids — lights out at midnight. I\'m Jackson, the night guard. I\'ll be up in the security office if you need me.', dur: 7,
        cam: { from: [33, 27.2, 1.45], to: [33, 27.5, 1.5], look: [33, 30.0, 1.7] },
        start(g, c) {
          const p = mode(g).people;
          for (const k of [p.jonathan, p.jack, p.max, p.thomas]) c.face(k, p.jackson);
        },
      },
      {
        line: 'Somebody had told Jackson the animatronics stand on their stages all night long. Nothing ever happens.', dur: 5.5,
        cam: { from: [33, 23.5, 1.7], to: [33, 21.6, 2.0], look: [33, 16.2, 2.1] },
        start(g, c) { const p = mode(g).people; c.walk(p.jackson, [33, 30], [33, 31], 1); c.hide(p.jackson); },
      },
      { card: '12:00 AM', dur: 2.2 },
      {
        line: 'At midnight, every light in the Pizzaplex went out.', dur: 3.6,
        cam: { from: [33, 33.5, 3.0], to: [33, 33.0, 3.0], look: [33, 20, 1.2] },
        start(g) {
          sfx.blackout();
          g.lighting.setEscape(mode(g).level.decor, mode(g).level.def.mood);
          g.lighting.glitch(0.6);
        },
      },
      {
        line: 'Then, somewhere in the dark, a music box started to play. And every animatronic in the Pizzaplex opened its eyes.', dur: 6,
        cam: { from: [33, 21.0, 2.0], to: [33, 19.6, 2.15], look: [33, 16.2, 2.2] },
        start(g) { sfx.musicBoxSting(); },
        update(g, c, k) { if (k > 0.45) setEyes(gus(g).rig, 'on'); },
      },
      {
        who: 'Max', line: 'RUN!!!', dur: 2.6,
        cam: { from: [33, 32.5, 2.4], to: [33, 33.5, 2.6], look: [33, 25, 1.1] },
        start(g) { sfx.spotted(); },
        update(g, c, k) {
          const p = mode(g).people;
          c.walk(p.max, [30.0, 27.2], [21.5, 33.5], k * 1.3);
          c.walk(p.jack, [34.4, 25.0], [45, 23], k * 1.2);
          c.walk(p.thomas, [35.9, 26.9], [34, 35.8], k * 1.4);
          for (const a of [p.max, p.jack, p.thomas]) c.pose(a, 'chase');
        },
      },
      {
        line: 'Everybody ran. In the dark, they lost each other.', dur: 4.2, fade: 'out',
        cam: { from: [31.0, 26.6, 1.3], to: [31.2, 26.2, 1.25], look: [31.4, 25.2, 1.15] },
        start(g, c) {
          const p = mode(g).people;
          for (const a of [p.max, p.jack, p.thomas]) c.hide(a);
          c.face(p.jonathan, { x: p.jonathan.root.position.x, z: p.jonathan.root.position.z - 5 });
        },
      },
    ],
  },
};
