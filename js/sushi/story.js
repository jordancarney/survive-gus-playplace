// Sushi's Pizzaplex's cutscenes, in the same shot-list form as story.js (cutscene.js plays
// them). Positions are plan metres in the part they happen in.
//
//   sushiIntro    before Part 1: the dare, the doors locking, Sushi waking on his stage
//   peterReveal   Part 4, the third clue: the old otter costume in the chair isn't empty
//   sushiFinale   out of the drain grate: Peter watching from the doors — and he gets away
//   sushiSecret   every plushie on the shelf: Peter's old locker, and a photo
import { sfx } from '../audio.js';
import { setEyes } from '../models.js';

const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;

const mode = (g) => g.sushi;
const ppl = (g) => g.sushi.people;
const foe = (g, id) => g.sushi.level.enemies.find((e) => e.id === id);
const later = (ms, fn) => setTimeout(fn, ms);

export const SUSHI_STORY = {
  sushiIntro: {
    area: 'sushi1',
    setup(g, c) {
      const p = ppl(g);
      c.put(p.billy, 29.4, 5.4, S);
      c.put(p.tom, 30.8, 5.0, S);
      c.put(p.bob, 32.2, 5.4, S);
      c.put(p.tim, 31.4, 6.4, S);
      for (const k of ['billy', 'tom', 'bob', 'tim']) c.pose(p[k], 'idle', 0.4);
      // (nothing's been put in place yet: the part starts after this)
      const s = foe(g, 'sushi');
      s.reset();
      s.render(1 / 60);
      c.put(s, 31, 44.4, N);
      c.pose(s, 'idle', 0.2);
      setEyes(s.rig, 'off');
      g.player.flashlight.intensity = 0;
    },
    cleanup(g) { for (const k of ['billy', 'tom', 'bob', 'tim']) ppl(g)[k].root.visible = false; },
    shots: [
      { card: "FOUR YEARS BEFORE\nGUS'S PLAYPLACE...", dur: 3.2 },
      { card: "SUSHI'S PIZZAPLEX\nCLOSED FOR YEARS", dur: 2.8 },
      {
        line: "Nobody had been inside Sushi's Pizzaplex for years. Billy said it was haunted. So of course, he dared everybody to spend the night.", dur: 6,
        cam: { from: [30.8, 12.5, 1.7], to: [30.8, 10.8, 1.6], look: [30.8, 5.2, 1.2] },
      },
      {
        who: 'Billy', line: 'Okay. The dare is: we stay in here ALL NIGHT. Nobody leaves till the sun comes up.',
        cam: { from: [29.6, 7.4, 1.5], to: [29.5, 7.2, 1.5], look: [29.4, 5.4, 1.45] },
      },
      {
        who: 'Tim', line: "I don't like it in here. It smells like old pizza.",
        cam: { from: [31.2, 8.0, 1.2], to: [31.3, 7.8, 1.2], look: [31.4, 6.4, 1.15] },
      },
      {
        who: 'Bob', line: "It's just an old pizza place, Tim. Nothing's going to happen.",
        cam: { from: [32.0, 7.4, 1.4], look: [32.2, 5.4, 1.35] },
      },
      {
        who: 'Tom', line: '...Then why did the doors just lock?',
        cam: { from: [30.6, 8.2, 1.5], to: [30.6, 7.4, 1.5], look: [30.5, 3.0, 1.3] },
        start(g, c) {
          sfx.rattle(c.P(30.5, 3.2, 1.2));
          later(500, () => sfx.plexClunk());
          for (const k of ['billy', 'tom', 'bob', 'tim']) c.face(ppl(g)[k], { root: { position: c.P(30.5, 2.8) } });
        },
      },
      {
        line: 'Somewhere in the dark, an old music box started to play.', dur: 4.2,
        cam: { from: [31, 37.6, 1.5], to: [31, 39.4, 1.6], look: [31, 44.4, 2.0] },
        start() { sfx.musicBoxSting(); },
      },
      {
        who: 'Sushi', line: "Welcome to Sushi's Pizzaplex! Stay a while... Stay FOREVER!",
        cam: { from: [31, 41.0, 1.9], to: [31, 41.5, 1.95], look: [31, 44.4, 2.1] },
        start(g, c) { setEyes(foe(g, 'sushi').rig, 'on'); c.pose(foe(g, 'sushi'), 'stare'); sfx.reboot(c.P(31, 44.4, 1.8)); },
      },
      {
        who: 'Billy', line: 'RUN!!!', dur: 2.6,
        cam: { from: [30.8, 11.5, 1.8], look: [30.8, 6, 1.0] },
        start(g, c) { sfx.spotted(); for (const k of ['billy', 'tom', 'bob', 'tim']) c.pose(ppl(g)[k], 'walk', 1); },
        update(g, c, k) {
          const p = ppl(g);
          c.walk(p.billy, [29.4, 5.4], [25.5, 12], k);
          c.walk(p.bob, [32.2, 5.4], [26, 9.5], k);
          c.walk(p.tim, [31.4, 6.4], [30.5, 18], k);
          c.walk(p.tom, [30.8, 5.0], [33.5, 9], k * 0.6);
        },
      },
    ],
  },

  peterReveal: {
    area: 'sushi4',
    setup(g, c) {
      const p = ppl(g), peter = foe(g, 'peter');
      c.put(p.tom, 43.4, 7.0, E);
      c.put(p.bob, 41.6, 6.0, E);
      c.put(p.billy, 41.2, 7.8, E);
      c.put(p.tim, 42.2, 8.6, E);
      for (const k of ['tom', 'bob', 'billy', 'tim']) c.pose(p[k], 'idle', 0.3);
      c.put(peter, 47.6, 7.0, W);
      c.pose(peter, 'idle', 0);
      setEyes(peter.rig, 'dim');
      g.player.flashlight.intensity = 0;
    },
    cleanup(g, c) {
      ppl(g).tom.root.visible = false;
      const peter = foe(g, 'peter');
      c.put(peter, 46.8, 7.0, W);
      setEyes(peter.rig, 'on');
    },
    shots: [
      {
        line: 'The last clue was a photo: a teenager in an otter costume, next to an old toymaker. On the back it said PETER — THE FIRST GUS.', dur: 6.2,
        cam: { from: [42.2, 7.8, 1.45], to: [42.6, 7.6, 1.45], look: [47.6, 7.0, 1.1] },
      },
      {
        line: 'Then the costume in the chair went click. Click. Click.', dur: 4.4,
        cam: { from: [44.0, 8.4, 1.3], to: [44.4, 8.2, 1.35], look: [47.4, 7.0, 1.3] },
        start(g, c) {
          const peter = foe(g, 'peter');
          for (const t of [0, 700, 1400]) later(t, () => sfx.clicks(peter.pos));
          later(1500, () => { setEyes(peter.rig, 'on'); c.pose(peter, 'stare'); });
        },
        update(g, c, k) { if (k > 0.45) c.put(foe(g, 'peter'), 47.6 - (k - 0.45) * 1.4, 7.0, W); },
      },
      {
        who: '???', line: "You found my room. Nobody's found my room in years.",
        cam: { from: [44.8, 7.4, 1.75], to: [45.0, 7.3, 1.8], look: [46.8, 7.0, 1.85] },
      },
      {
        who: 'Tom', line: 'Wh-who ARE you?',
        cam: { from: [44.6, 7.2, 1.45], look: [43.4, 7.0, 1.4] },
        start(g, c) { c.face(ppl(g).tom, foe(g, 'peter')); },
      },
      {
        who: 'Peter', line: "I'm Peter. I was the first Gus. Before Gus was a platypus, he was an otter — and I was the one inside.",
        cam: { from: [45.0, 6.4, 1.7], to: [45.2, 6.5, 1.75], look: [46.8, 7.0, 1.85] },
        start(g, c) { c.pose(foe(g, 'peter'), 'idle', 0.5); },
      },
      {
        who: 'Peter', line: "The Toymaker said the springlocks were too dangerous. He built a robot Gus that didn't need anybody inside. So I made sure Gus would always need me.",
        cam: { from: [45.4, 8.0, 1.6], look: [46.8, 7.0, 1.8] },
      },
      {
        who: 'Peter', line: "I wound his music box, so it would never stop. I pulled the fuses the night of the storm, so the lightning would wake them up. I built Moony out of Gus's old parts.",
        cam: { from: [44.2, 7.0, 1.7], to: [44.6, 7.0, 1.75], look: [46.8, 7.0, 1.85] },
        start(g) { sfx.musicBoxSting(); },
      },
      {
        who: 'Peter', line: "And that tune? They ALL listen to it. I don't need strings. Gerald's strings were just for show.",
        cam: { from: [45.6, 7.0, 1.8], to: [45.9, 7.0, 1.85], look: [46.8, 7.0, 1.9] },
        start(g) { sfx.musicBoxSting(); },
      },
      {
        who: 'Bob', line: 'Tom... TOM. RUN!',
        cam: { from: [43.0, 6.2, 1.4], look: [41.6, 6.0, 1.35] },
        start(g, c) { c.pose(ppl(g).bob, 'point'); },
      },
      {
        who: 'Peter', line: "Run, then. Click, click. I'll be right behind you.", dur: 3.4,
        cam: { from: [45.8, 7.0, 1.85], to: [46.1, 7.0, 1.9], look: [46.8, 7.0, 1.95] },
        start(g) { setEyes(foe(g, 'peter').rig, 'scare'); sfx.clicks(foe(g, 'peter').pos); },
      },
    ],
  },

  sushiFinale: {
    area: 'sushi4',
    setup(g, c) {
      const p = ppl(g), peter = foe(g, 'peter');
      c.put(p.tom, 3.6, 44.6, S);
      c.put(p.bob, 4.8, 45.4, W);
      c.put(p.billy, 2.6, 45.6, E);
      c.put(p.tim, 5.0, 44.0, W);
      for (const k of ['tom', 'bob', 'billy', 'tim']) c.pose(p[k], 'idle', 0.6);
      c.hide(peter);
      setEyes(peter.rig, 'on');
      g.player.flashlight.intensity = 0;
    },
    cleanup(g) {
      for (const k of ['tom', 'bob', 'billy', 'tim']) ppl(g)[k].root.visible = false;
      foe(g, 'peter').root.visible = false;
    },
    shots: [
      {
        line: 'The drain grate popped open, and four kids tumbled out into the cold night air.', dur: 4.6,
        cam: { from: [7.5, 47.6, 1.5], to: [7.0, 47.2, 1.4], look: [3.6, 44.6, 0.7] },
        start() { sfx.plexClunk(); },
      },
      {
        who: 'Billy', line: 'We did it... we actually got OUT!',
        cam: { from: [3.6, 47.0, 1.3], look: [2.6, 45.6, 1.4] },
        start(g, c) { c.pose(ppl(g).billy, 'wave'); },
      },
      {
        who: 'Tim', line: 'I want to go HOME.',
        cam: { from: [5.6, 46.2, 1.1], look: [5.0, 44.0, 1.1] },
        start(g, c) { c.pose(ppl(g).billy, 'idle', 0.5); },
      },
      {
        who: 'Bob', line: 'Guys. Look... at the doors.',
        cam: { from: [5.4, 47.0, 1.35], look: [4.8, 45.4, 1.35] },
        start(g, c) {
          const p = ppl(g);
          for (const k of ['tom', 'bob', 'billy', 'tim']) c.face(p[k], { root: { position: c.P(15.5, 43.4) } });
          c.pose(p.bob, 'point');
        },
      },
      {
        line: 'Under the SEE YOU SOON sign, at the chained doors, the old otter stood watching them.', dur: 5,
        cam: { from: [11.4, 47.8, 1.5], to: [12.6, 47.0, 1.6], look: [15.5, 43.5, 1.8] },
        start(g, c) {
          const peter = foe(g, 'peter');
          c.put(peter, 15.5, 43.7, S);
          c.pose(peter, 'stare');
          sfx.clicks(peter.pos);
        },
      },
      {
        who: 'Peter', line: 'See you soon, Tom.', dur: 3.4,
        cam: { from: [14.2, 46.2, 1.75], to: [14.5, 45.9, 1.8], look: [15.5, 43.7, 1.85] },
        start(g, c) { c.pose(foe(g, 'peter'), 'wave'); },
      },
      {
        line: 'Then he stepped back into the dark, and he was gone.', dur: 4,
        cam: { from: [11.4, 47.8, 1.5], look: [15.5, 43.5, 1.8] },
        update(g, c, k) {
          const peter = foe(g, 'peter');
          if (k > 0.35 && peter.root.visible) { c.hide(peter); sfx.clicks(peter.pos); }
        },
      },
      {
        line: "When the grown-ups came, Sushi's Pizzaplex was empty. No otter. No Peter. Sushi's was sold off, piece by piece...", dur: 6,
        cam: { from: [15.5, 47.8, 1.4], to: [15.5, 47.2, 1.9], look: [15.5, 43, 2.6] },
      },
      {
        line: '...and four years later, a little fun centre across town opened a brand-new wing. Its laser tag got a purple Gus, from an old pizza place: Moony.', dur: 7,
        cam: { from: [15.5, 47.2, 1.9], to: [15.5, 46.4, 2.4], look: [15.5, 43, 2.7] },
      },
      { card: 'PETER GOT AWAY...', dur: 3.4, start() { sfx.musicBoxSting(); } },
      { card: "THE END...?\nSUSHI'S PIZZAPLEX", dur: 4 },
    ],
  },

  sushiSecret: {
    area: 'sushi3',
    setup(g, c) {
      const p = ppl(g), d = mode(g).level.decor;
      c.put(p.tom, 40.6, 7.4, E);
      c.put(p.bob, 39.6, 8.8, E);
      c.put(p.billy, 39.4, 6.0, E);
      c.put(p.tim, 41.0, 9.6, E);
      for (const k of ['tom', 'bob', 'billy', 'tim']) c.pose(p[k], 'idle', 0.4);
      d.shelfZ = d.shelfGroup.position.z;
      for (const e of mode(g).level.enemies) e.root.visible = false;
      g.player.flashlight.intensity = 0;
    },
    cleanup(g) {
      const d = mode(g).level.decor;
      d.shelfGroup.position.z = d.shelfZ;
      for (const k of ['tom', 'bob', 'billy', 'tim']) ppl(g)[k].root.visible = false;
    },
    shots: [
      { card: '⭐ SECRET ENDING ⭐', dur: 2.8, start() { sfx.musicBoxSting(); } },
      {
        line: 'Every plushie, home on the shelf. And when the last one went up... the whole shelf slid sideways.', dur: 5.6,
        cam: { from: [39.4, 7.6, 1.5], to: [39.8, 7.6, 1.5], look: [43.6, 7.6, 1.3] },
        start() { sfx.garageDoor(); },
        update(g, c, k) { const d = mode(g).level.decor; d.shelfGroup.position.z = d.shelfZ + Math.min(1, k * 1.4) * 2.6; },
      },
      {
        line: 'Behind it was an old locker in the wall. A name was scratched on the door: PETER.', dur: 5,
        cam: { from: [41.4, 7.6, 1.45], to: [41.9, 7.6, 1.45], look: [43.9, 7.6, 1.35] },
        update(g) { const d = mode(g).level.decor; d.shelfGroup.position.z = d.shelfZ + 2.6; },
      },
      {
        who: 'Tom', line: "There's stuff in here. His old GUS sash... and a photo.",
        cam: { from: [42.4, 6.6, 1.45], look: [40.6, 7.4, 1.4] },
        update(g) { const d = mode(g).level.decor; d.shelfGroup.position.z = d.shelfZ + 2.6; },
        start(g, c) { c.pose(ppl(g).tom, 'give'); },
      },
      {
        line: "A teenager in an otter suit and an old man in a toymaker's apron, smiling, on the Pizza Shack's opening day. On the back, in pencil: Gus forever.", dur: 7,
        cam: { from: [41.0, 8.2, 1.55], to: [41.1, 8.0, 1.5], look: [40.9, 7.0, 1.0] },
        update(g) { const d = mode(g).level.decor; d.shelfGroup.position.z = d.shelfZ + 2.6; },
      },
      {
        who: 'Bob', line: "He wasn't always bad... was he?",
        cam: { from: [41.0, 9.6, 1.35], look: [39.6, 8.8, 1.3] },
      },
      {
        who: 'Tom', line: 'No. I think somebody took Gus away from him.',
        cam: { from: [42.0, 7.0, 1.45], look: [40.6, 7.4, 1.4] },
        start(g, c) { c.pose(ppl(g).tom, 'idle', 0.4); },
      },
      { card: '⭐ SECRET ENDING ⭐\nGus Forever', dur: 4 },
    ],
  },
};
