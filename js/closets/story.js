// In the Closets' cutscenes, in the same shot-list form as story.js (cutscene.js plays them).
// Positions are plan metres in the level they happen in: the downstairs Front Hall (x 45–52,
// z 1–6), the front door on its east wall, and the downstairs hall (x 28–52, z 7–10) with its
// mirror at the east end. Made up for this build — the designer's to change.
//
//   closetsIntro   before Level 1: Gramma goes off to the night shift, and a closet creaks
//   closetsFinale  after Level 10: Gramma comes home — and the mirror
import { sfx } from '../audio.js';

const E = Math.PI / 2, W = -Math.PI / 2;

const ppl = (g) => g.closets.people;
const later = (ms, fn) => setTimeout(fn, ms);

export const CLOSETS_STORY = {
  closetsIntro: {
    area: 'closets1',
    setup(g, c) {
      const p = ppl(g);
      c.put(p.timmy, 48.4, 3.4, E);
      c.put(p.gramma, 50.5, 3.4, W);
      c.pose(p.timmy, 'idle', 0.4);
      c.pose(p.gramma, 'idle', 0.4);
    },
    cleanup(g) { for (const k of ['timmy', 'gramma']) ppl(g)[k].root.visible = false; },
    shots: [
      { card: "AFTER GUS'S PLAYPLACE...", dur: 3 },
      { card: "TIMMY'S HOUSE", dur: 2.6 },
      {
        who: 'Gramma', line: 'I\'m working the night shift at the bakery this week, sweetie. Lock the door behind me.',
        cam: { from: [47.0, 5.0, 1.35], to: [47.3, 4.7, 1.35], look: [49.6, 3.4, 1.2] },
      },
      {
        who: 'Timmy', line: 'By myself? All night?',
        cam: { from: [50.2, 4.6, 1.3], look: [48.4, 3.4, 0.95] },
      },
      {
        who: 'Gramma', line: 'You\'re a big boy now. Straight to bed — and I\'ll be home at six, with cinnamon rolls.',
        cam: { from: [48.0, 4.8, 1.2], to: [48.3, 4.6, 1.25], look: [50.5, 3.4, 1.45] },
      },
      {
        who: 'Timmy', line: '...Okay, Gramma.',
        cam: { from: [50.0, 4.4, 1.2], look: [48.4, 3.4, 0.95] },
      },
      {
        line: 'The front door clicked shut. The house was very, very quiet.', dur: 4,
        cam: { from: [46.0, 4.6, 1.6], to: [46.4, 4.2, 1.6], look: [51.4, 3.4, 1.2] },
        start(g, c) { c.hide(ppl(g).gramma); sfx.plexDoor(); },
      },
      {
        line: 'Then, somewhere in the house... a closet door creaked.', dur: 4.4,
        cam: { from: [48.5, 5.2, 1.3], to: [48.5, 4.4, 1.35], look: [48.5, 1.5, 1.4] },
        start(g, c) { c.hide(ppl(g).timmy); sfx.plexCreak(); later(1400, () => sfx.plexBreath(1)); },
      },
      { card: 'IN THE CLOSETS', dur: 3 },
    ],
  },

  closetsFinale: {
    area: 'closets10',
    setup(g, c) {
      const p = ppl(g);
      c.put(p.timmy, 48.6, 3.4, E);
      c.put(p.gramma, 50.6, 3.4, W);
      c.pose(p.timmy, 'idle', 0.6);
      c.pose(p.gramma, 'idle', 0.4);
    },
    cleanup(g) { for (const k of ['timmy', 'gramma']) ppl(g)[k].root.visible = false; },
    shots: [
      {
        who: 'Gramma', line: 'TIMMY? I\'m home! I came straight home, just like I promised—',
        cam: { from: [47.2, 4.8, 1.35], to: [47.5, 4.5, 1.35], look: [50.6, 3.4, 1.4] },
        start() { sfx.plexDoor(); },
      },
      {
        who: 'Timmy', line: 'GRAMMA! They were in the closets! ALL of them! Every night!',
        cam: { from: [50.3, 4.5, 1.25], look: [48.6, 3.4, 0.95] },
      },
      {
        who: 'Gramma', line: 'Shh, shh. I\'ve got you, sweetie. I\'ve got you.',
        cam: { from: [49.6, 5.2, 1.3], to: [49.6, 4.8, 1.3], look: [49.6, 3.4, 1.1] },
        start(g, c) { c.face(ppl(g).timmy, ppl(g).gramma); },
      },
      {
        line: 'Gramma switched on every light in the house. One by one, every closet door swung open... and every single one was empty.', dur: 6,
        cam: { from: [30.5, 8.5, 1.5], to: [33.0, 8.5, 1.5], look: [51.9, 8.5, 1.4] },
        start(g) {
          const m = g.closets, d = m.decor;
          g.lighting.setEscape(d, { ...m.def.mood, amb: 0.55, hemi: 0.45, fog: 0.008 });
          for (const cl of d.closets) { cl.hinge.rotation.y = -0.9; cl.eyes.visible = false; }
          sfx.sixAM();
        },
      },
      {
        who: 'Timmy', line: 'Gramma... can we get closets with LOCKS?',
        cam: { from: [50.3, 4.5, 1.25], look: [48.6, 3.4, 0.95] },
      },
      {
        who: 'Gramma', line: 'We\'ll get closets with SEVEN locks. And pancakes. Every single morning.',
        cam: { from: [48.0, 4.8, 1.2], look: [50.6, 3.4, 1.45] },
      },
      {
        line: 'And in the hall mirror, just for a second... two orange eyes. Then nothing at all.', dur: 5,
        cam: { from: [47.5, 8.5, 1.45], to: [49.8, 8.5, 1.45], look: [51.95, 8.5, 1.45] },
        start() { later(1200, () => sfx.musicBoxSting()); },
      },
      { card: 'THE END...?', dur: 3.4 },
    ],
  },
};
