// The story, told in cutscenes. Each script is a list of shots for cutscene.js to play.
//
// Camera positions and lookAt targets are [x, z, height] in plan metres of the scene's area
// (see map.js and house.js). The beats, in order:
//
//   intro      Jonathan takes the job; the manager's warning about Gus
//   blackout   before Night 5: the lights flicker, and Gus turns his head
//   home       after Night 10: Jonathan goes home... and they follow him
//   homeDone   the van takes them back; Gus never left the stage
//   haywire    before Night 20: Gus breaks, the fuse boxes fry
//   gusDown    after beating Gus: his glitch is gone, everyone's friends
//   junkRises  before Night 21: the Junk Monster climbs out of the pile
//   finale     after beating it: Employee of the Month
import * as THREE from 'three';
import { setEyes } from './models.js';
import { sfx } from './audio.js';
import { smooth } from './cutscene.js';
import { ROAMERS } from './config.js';
import { planOf } from './map.js';

const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;

// Gus close-up on the stage, the camera creeping in. Used three times.
const GUS_CLOSE = { from: [30, 8.0, 2.0], to: [30, 6.7, 2.05], look: [30, 3.4, 2.2] };

export const SCRIPTS = {
  intro: {
    area: 'playplace', light: 'day', music: 'title',
    setup(g, c) {
      g.resetBots();
      c.put(g.people.manager, 33.4, 36.1, E);
      c.pose(g.people.manager, 'idle', 0.3);
    },
    shots: [
      { card: "GUS'S PLAYPLACE\n8:00 AM", dur: 2.6 },
      {
        line: 'Jonathan is fifteen, and he really needs a job.',
        cam: { from: [41.0, 37.2, 1.7], to: [41.3, 37.7, 1.65], look: [42.6, 42, 1.3] },
        update(g, c, k) { c.walk(g.people.jonathan, [42.5, 42.4], [42.7, 39.4], k * 1.3); },
      },
      {
        who: 'Jonathan', line: '"Now hiring: night security." How hard can that be?',
        cam: { from: [42.0, 38.9, 1.8], to: [42.4, 38.6, 1.85], look: [44.9, 38.2, 2.05] },
        start(g, c) { c.hide(g.people.jonathan); },
      },
      {
        who: 'Manager', line: "You must be Jonathan! You're hired. It's an easy job — just watch the cameras.",
        cam: { from: [34.8, 41.6, 1.75], to: [34.7, 41.0, 1.7], look: [34.5, 36.8, 1.45] },
        update(g, c, k) {
          c.walk(g.people.jonathan, [40.4, 39.0], [35.7, 37.5], k * 1.5);
          c.face(g.people.manager, g.people.jonathan);
        },
      },
      {
        who: 'Manager', line: 'If a game breaks, fix it. Happy kids make happy animatronics.',
        cam: { from: [35.4, 38.9, 1.65], look: [33.4, 36.1, 1.6] },
        start(g, c) { c.face(g.people.jonathan, g.people.manager); },
      },
      {
        who: 'Manager',
        line: "And if the animatronics wander off the stage at night... zap 'em, and drag 'em to Parts & Service. They're always back on stage by morning.",
        cam: { from: [35.6, 38.6, 1.65], to: [35.2, 38.2, 1.65], look: [33.4, 36.1, 1.6] },
        start(g, c) { c.pose(g.people.manager, 'wave'); },
      },
      {
        who: 'Jonathan', line: 'Wait. They WANDER?',
        cam: { from: [33.9, 36.5, 1.65], look: [35.7, 37.5, 1.55] },
        start(g, c) { c.pose(g.people.manager, 'idle', 0.3); },
      },
      {
        line: 'Gus, Gerald, Chomper, Cranker and Flipper. The kids LOVE them.', dur: 5,
        cam: { from: [21, 11, 1.6], to: [39, 11, 1.6], look: [22, 3, 1.7], lookTo: [38, 3, 1.7] },
        start(g, c) { for (const a of g.bots) c.pose(a, 'dance', 0.7); },
      },
      {
        who: 'Manager', line: 'Oh — and Jonathan? If the power ever goes out...',
        cam: GUS_CLOSE,
        start(g, c) {
          g.lighting.set('title');
          for (const a of g.bots) c.pose(a, 'idle', 0);
          c.pose(g.bot('gus'), 'stare');
          sfx.musicBoxSting();
        },
        update(g, c, k) { c.headTo(g.bot('gus'), g.camera.position, smooth(Math.min(1, k * 1.4))); },
      },
      {
        who: 'Manager', line: "...don't let Gus find you.",
        cam: { from: [35.2, 38.4, 1.7], to: [34.8, 37.8, 1.7], look: [33.4, 36.1, 1.65] },
        start(g) { g.lighting.set('day'); },
      },
      { card: 'Survive twenty nights.', dur: 3 },
    ],
  },

  blackout: {
    area: 'playplace', light: 'night',
    setup(g, c) {
      g.resetBots();
      c.put(g.people.jonathan, 33.1, 37.2, W);
      c.pose(g.people.jonathan, 'idle', 0.3);
    },
    shots: [
      { card: 'NIGHT 5', dur: 2 },
      {
        line: 'The lights have been flickering all evening.',
        cam: { from: [36.6, 40.2, 2.2], to: [36.0, 39.6, 2.0], look: [32.4, 37.2, 1.2] },
        update(g) {
          if (Math.random() < 0.04) g.lighting.set(g.lighting.mode === 'night' ? 'blackout' : 'night');
        },
      },
      {
        line: 'And up on the stage, someone has started paying attention.',
        cam: GUS_CLOSE,
        start(g, c) { g.lighting.set('title'); c.pose(g.bot('gus'), 'stare'); sfx.musicBoxSting(); },
        update(g, c, k) { c.headTo(g.bot('gus'), g.camera.position, smooth(k)); },
      },
      {
        who: 'Jonathan', line: 'Did Gus just... look at me?',
        cam: { from: [34.7, 36.1, 1.7], look: [33.1, 37.2, 1.6] },
        start(g, c) { g.lighting.set('night'); c.put(g.people.jonathan, 33.1, 37.2, E - 0.5); },
      },
    ],
    cleanup(g) { g.lighting.set('night'); },
  },

  home: {
    area: 'playplace', light: 'day',
    setup(g) { g.resetBots(); },
    shots: [
      {
        who: 'Jonathan', line: 'Ten nights down. Time to go home and SLEEP.',
        cam: { from: [42.5, 33.2, 1.8], look: [42.5, 42, 1.4] },
        update(g, c, k) { c.walk(g.people.jonathan, [42.5, 36.0], [42.5, 42.2], k); },
      },
      {
        card: "JONATHAN'S HOUSE\n9:00 AM", dur: 2.4,
        start(g, c) {
          c.hide(g.people.jonathan);
          g.setArea('home');
          g.lighting.set('home');
          g.resetBots();
          for (const a of g.bots) a.root.visible = false;
        },
      },
      {
        line: "He's asleep before his head hits the pillow.",
        cam: { from: [6.4, 6.2, 2.1], to: [5.6, 5.4, 1.8], look: [3.1, 2.2, 0.6] },
        start(g, c) {
          const j = g.people.jonathan;
          c.put(j, 3.1, 3.05, S, 0.62);
          j.root.rotation.x = -Math.PI / 2;      // lying on his back, head on the pillow
          c.pose(j, 'idle', 0);
        },
      },
      {
        who: 'Jonathan', line: '...What was THAT?',
        cam: { from: [6.2, 5.8, 1.7], look: [4.6, 2.9, 1.4] },
        start(g, c) {
          sfx.crash(g.place.roomCenter('K'));
          c.shake = 0.5;
          c.put(g.people.jonathan, 4.6, 2.9, S + 0.6);
          c.pose(g.people.jonathan, 'stagger');
        },
        update(g, c, k) { if (k > 0.3) c.pose(g.people.jonathan, 'idle', 0.5); },
      },
      {
        line: 'Squeak. Squeak. Squeak.', dur: 3.8,
        cam: { from: [10.5, 10.6, 1.0], to: [11.5, 10.6, 1.0], look: [20, 10, 1.1] },
        start(g) { g.people.jonathan.root.visible = false; },
        update(g, c, k) {
          const cr = g.bot('cranker');
          const before = cr.root.position.x;
          c.walk(cr, [16.5, 10.2], [22.5, 10.2], k);
          if (Math.floor(before * 2.2) !== Math.floor(cr.root.position.x * 2.2)) sfx.step('cranker', cr.root.position);
        },
      },
      {
        who: 'Jonathan', line: 'They FOLLOWED me home?!',
        cam: { from: [3.5, 10.4, 1.6], look: [3.5, 7.6, 1.6] },
        start(g, c) { c.put(g.people.jonathan, 3.5, 7.5, S); c.pose(g.people.jonathan, 'stagger', 0.5); g.bot('cranker').root.visible = false; },
      },
      {
        line: 'The PlayPlace van is in the garage. Zap all four of them and load them in — they are going back where they belong.',
        cam: { from: [16.4, 13.4, 2.0], to: [16.8, 13.8, 1.9], look: [19.8, 17.4, 1.3] },
        start(g) { g.people.jonathan.root.visible = false; },
      },
    ],
  },

  homeDone: {
    area: 'home', light: 'home',
    setup(g, c) {
      for (const id of ROAMERS) g.bot(id).root.visible = false;   // all four are in the van
      c.put(g.people.jonathan, 18.0, 13.6, S + 0.3);
      c.pose(g.people.jonathan, 'idle', 0.4);
    },
    shots: [
      {
        who: 'Jonathan', line: 'And STAY in there!',
        cam: { from: [21.6, 12.8, 1.8], to: [21.3, 13.1, 1.75], look: [19.2, 15.4, 1.3] },
        update(g, c, k) { g.houseDecor.setVanDoors(false, smooth(Math.min(1, k * 1.6))); },
      },
      {
        dur: 4.2, fade: 'out',
        cam: { from: [16.0, 14.0, 1.8], look: [19.5, 19.5, 1.2] },
        start() { sfx.garageDoor(); },
        update(g, c, k) {
          const d = g.houseDecor;
          d.garageDoor.position.y = Math.min(1, k * 2) * 2.3;
          const drive = Math.max(0, (k - 0.35) / 0.65);
          d.van.group.position.z = d.van.home.z + drive * drive * 9;
        },
      },
      {
        card: 'Later that day, back at the PlayPlace...', dur: 2.6,
        start(g, c) {
          g.resetHouse();
          g.setArea('playplace');
          g.lighting.set('day');
          g.resetBots();
          c.put(g.people.manager, 33.4, 36.1, E);
          c.put(g.people.jonathan, 35.7, 37.5, W - 0.4);
          c.pose(g.people.manager, 'idle', 0.3);
          c.pose(g.people.jonathan, 'idle', 0.3);
        },
      },
      {
        who: 'Manager', line: 'Jonathan, why did the van just bring four animatronics back from YOUR house?',
        cam: { from: [35.4, 38.9, 1.65], look: [33.4, 36.1, 1.6] },
      },
      {
        who: 'Jonathan', line: 'Long story.',
        cam: { from: [33.9, 36.5, 1.65], look: [35.7, 37.5, 1.55] },
      },
      {
        who: 'Manager', line: '...Okay. You are getting a raise.',
        cam: { from: [35.4, 38.9, 1.65], to: [35.0, 38.4, 1.65], look: [33.4, 36.1, 1.6] },
        start(g, c) { c.pose(g.people.manager, 'wave'); },
      },
      {
        line: 'But Gus never left the stage. He was waiting.',
        cam: GUS_CLOSE,
        start(g, c) {
          g.hidePeople();
          g.lighting.set('title');
          c.pose(g.bot('gus'), 'stare');
          sfx.musicBoxSting();
        },
        update(g, c, k) { c.headTo(g.bot('gus'), g.camera.position, smooth(k)); },
      },
    ],
    cleanup(g) { g.resetHouse(); },
  },

  haywire: {
    area: 'playplace', light: 'title',
    setup(g) { g.resetBots(); },
    shots: [
      { card: 'NIGHT 20', dur: 2 },
      {
        line: 'Something is wrong with Gus.',
        cam: GUS_CLOSE,
        update(g) {
          if (Math.random() < 0.06) {
            const gus = g.bot('gus');
            const at = gus.root.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, 2.0, 0.2));
            g.effects.burst(at, 8, 2.5);
            sfx.spark(at);
          }
        },
      },
      {
        who: 'Gus', line: 'RRRRAAAAHHH!', dur: 2.4,
        cam: { from: [30, 6.2, 2.0], to: [30, 5.6, 2.1], look: [30, 3.4, 2.2] },
        start(g, c) {
          const gus = g.bot('gus');
          setEyes(gus.rig, 'scare');
          c.pose(gus, 'scare');
          sfx.roar(gus.root.position);
          c.shake = 0.7;
        },
      },
      {
        who: 'Manager', line: "Jonathan! The fuse boxes just fried — ALL of them! Gus isn't right. The Magnum's the only thing that'll stop him.",
        cam: { from: [4.8, 9.2, 1.6], look: [1.0, 9.5, 1.4] },
        start(g) {
          g.lighting.set('blackout');
          sfx.blackout();
          for (const f of g.machines.fuses) g.effects.burst(f.sparkAt, 20, 4);
        },
        update(g) {
          if (Math.random() < 0.08) {
            const f = g.machines.fuses[0];
            g.effects.burst(f.sparkAt, 6, 2.5);
            sfx.spark(f.sparkAt);
          }
        },
      },
      {
        who: 'Jonathan', line: "Okay, Gus. Let's end this.",
        cam: { from: [35.3, 36.3, 1.7], look: [33.2, 37.3, 1.6] },
        start(g, c) { c.put(g.people.jonathan, 33.2, 37.3, E - 0.4); c.pose(g.people.jonathan, 'idle', 0.3); },
      },
    ],
  },

  gusDown: {
    area: 'playplace', light: 'title', music: 'friends',
    setup(g, c) {
      g.resetBots();
      const gus = g.bot('gus');
      c.put(gus, 30, 15.5, S);
      c.pose(gus, 'down');
      setEyes(gus.rig, 'off');
      const spots = { gerald: [26.5, 13.2], chomper: [28, 12.4], cranker: [32, 12.4], flipper: [33.5, 13.2] };
      for (const id of ROAMERS) {
        const a = g.bot(id);
        c.put(a, spots[id][0], spots[id][1], S);
        a.root.visible = false;
        setEyes(a.rig, 'friend');
        c.pose(a, 'wave');
      }
      c.put(g.people.jonathan, 30, 19.2, N);
      c.pose(g.people.jonathan, 'idle', 0.3);
    },
    shots: [
      {
        line: 'Gus crashes to the floor in a shower of sparks... and goes still.',
        cam: { from: [33.5, 19.8, 1.5], to: [33, 19.2, 1.4], look: [30, 15.5, 0.9] },
        update(g) {
          if (Math.random() < 0.05) g.effects.burst(g.bot('gus').root.position.clone().add(new THREE.Vector3(0, 1.2, 0.3)), 6, 2);
        },
      },
      {
        dur: 2.4,
        cam: { from: [30, 17.8, 1.3], look: [30, 15.5, 1.2] },
        update(g, c, k) {
          const gus = g.bot('gus');
          if (k < 0.75) { if (Math.random() < 0.2) setEyes(gus.rig, Math.random() < 0.5 ? 'off' : 'friend'); }
          else setEyes(gus.rig, 'friend');
        },
      },
      {
        who: 'Gus', line: 'Huh? Where am I? Why is everybody staring at me?',
        cam: { from: [30, 18.4, 1.9], look: [30, 15.5, 1.9] },
        start(g, c) { c.pose(g.bot('gus'), 'idle'); setEyes(g.bot('gus').rig, 'friend'); },
      },
      {
        who: 'Gerald', line: 'Welcome back, boss!',
        cam: { from: [30, 22.4, 2.3], look: [30, 13, 1.3] },
        start(g) { for (const id of ROAMERS) g.bot(id).root.visible = true; },
      },
      {
        line: "Whatever was wrong with Gus is gone. The animatronics aren't chasing Jonathan anymore — they're his friends.",
        cam: { from: [30, 22.4, 2.3], to: [30, 20.8, 2.0], look: [30, 13, 1.3] },
        start(g, c) { c.pose(g.bot('gus'), 'wave'); },
      },
      {
        line: 'But down in Parts & Service, something in the junk pile just moved...',
        cam: { from: [9.5, 20, 1.2], to: [8.6, 20.2, 1.1], look: [4.2, 21.5, 0.4] },
        start(g) { g.lighting.set('night'); sfx.rattle(g.decor.junkSpots[0]); },
        update(g, c, k) {
          if (Math.random() < 0.05) {
            const p = g.decor.junkSpots[Math.floor(Math.random() * 3)];
            g.effects.burst(new THREE.Vector3(p.x, 0.4, p.z), 5, 1.5);
            g.effects.flashAt(new THREE.Vector3(p.x, 0.5, p.z), 0xff2020, 4, 0.12);
            sfx.rattle(p);
          }
        },
      },
      { card: '★  SECRET NIGHT 21 UNLOCKED  ★', dur: 3 },
    ],
  },

  junkRises: {
    area: 'playplace', light: 'night',
    setup(g, c) {
      g.resetBots();
      const j = g.junk;
      const spot = g.decor.junkSpots[0];
      j.pos.set(spot.x, 0, spot.z);
      j.yaw = E;
      j.sink = 3.8;
      j.root.visible = true;
      setEyes(j.rig, 'on');
      const spots = { gus: [16.2, 18.0], gerald: [17.4, 16.8], chomper: [17.6, 19.2], cranker: [18.6, 18.2], flipper: [18.8, 17.0] };
      for (const a of g.bots) {
        c.put(a, spots[a.id][0], spots[a.id][1], W);
        setEyes(a.rig, 'friend');
        c.pose(a, 'idle', 0.4);
      }
    },
    shots: [
      { card: 'SECRET NIGHT 21', dur: 2 },
      {
        line: 'Every broken part Jonathan ever threw in the junk pile... has put itself back together.', dur: 5.5,
        cam: { from: [11.6, 16.6, 1.6], to: [11.0, 17.2, 1.5], look: [4.4, 20.4, 1.7] },
        start(g, c) { sfx.rattle(g.junk.pos); c.shake = 0.5; },
        update(g, c, k, dt) {
          const j = g.junk;
          j.sink = 3.8 * (1 - smooth(Math.min(1, k * 1.2)));
          j.renderPose(dt, 'stare');
          if (k > 0.8 && !this.roared) { this.roared = true; sfx.roar(j.pos); c.shake = 0.8; }
        },
      },
      {
        who: 'Gus', line: "That's the Junk Monster! It's what made us so grumpy at night!",
        cam: { from: [18.8, 15.4, 1.9], look: [16.2, 18.0, 1.9] },
        update(g, c, k, dt) { g.junk.renderPose(dt, 'stare'); },
      },
      {
        who: 'Gerald', line: "We've got your back, Jonathan. Let's take it down!",
        cam: { from: [19.2, 15.0, 2.0], look: [17.4, 16.8, 2.0] },
        start(g, c) { c.pose(g.bot('gerald'), 'wave'); },
      },
    ],
    cleanup(g) { g.junk.clear(); SCRIPTS.junkRises.shots[1].roared = false; },
  },

  finale: {
    area: 'playplace', light: 'day', music: 'friends', kids: true,
    setup(g, c) {
      const j = g.junk;
      this.junkAt = planOf(j.pos.x, j.pos.z);
      g.resetBots();
      j.root.visible = true;
      for (const a of g.bots) { setEyes(a.rig, 'friend'); c.pose(a, 'dance', 1); }
      c.put(g.people.jonathan, 30, 9.6, S);
      c.put(g.people.manager, 31.7, 9.9, S - 0.3);
      c.pose(g.people.jonathan, 'idle', 0.4);
      c.pose(g.people.manager, 'idle', 0.4);
    },
    shots: [
      {
        line: 'The Junk Monster falls apart into a mountain of bolts, springs and one very squashed top hat.', dur: 5,
        start(g, c) {
          const at = SCRIPTS.finale.junkAt;
          g.lighting.set('night');
          c.shot.cam = { from: [at.px + 3.5, at.pz + 3.5, 2.4], look: [at.px, at.pz, 1.0] };
        },
        update(g, c, k, dt) {
          const j = g.junk;
          j.sink = Math.min(3.8, k * 3.8);
          j.renderPose(dt, 'down');
          if (Math.random() < 0.15) g.effects.burst(new THREE.Vector3(j.pos.x, 0.6 + Math.random(), j.pos.z), 6, 3);
        },
      },
      {
        who: 'Manager', line: 'Everybody! Your new Employee of the Month... JONATHAN!',
        cam: { from: [30, 14.6, 1.8], to: [30, 13.6, 1.75], look: [30, 7.5, 1.6] },
        start(g, c) {
          g.junk.clear();
          g.lighting.set('day');
          g.day.start(100);
          sfx.cheer();
          c.pose(g.people.manager, 'wave');
        },
        update(g) {
          if (Math.random() < 0.2) g.effects.burst(g.place.P(22 + Math.random() * 16, 4 + Math.random() * 3, 3.4), 10, 3);
        },
      },
      {
        who: 'Gus', line: 'Thanks for saving the PlayPlace, Jonathan!',
        cam: GUS_CLOSE,
        start(g, c) { c.pose(g.bot('gus'), 'wave'); },
      },
      { card: "Thanks for playing\nSURVIVE GUS'S PLAYPLACE!", dur: 4 },
    ],
    cleanup(g) { g.day.stop(); },
  },
};

// Cutscenes that play before a night starts (the first time only).
export const BEFORE_NIGHT = { 5: 'blackout', 20: 'haywire', 21: 'junkRises' };
