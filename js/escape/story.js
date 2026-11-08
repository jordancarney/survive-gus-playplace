// When Jonathan Was Five's cutscenes, in the same shot-list form as story.js (cutscene.js
// plays them). Positions are plan metres in the level they happen in.
//
//   daycareIntro  before Level 1: Jack wakes Jonathan up — a Night Bot is chasing Miss
//                 Penny, the night teacher, into Storage. The power's off. They have to run.
//   finale        6 AM at Gus's Giant Pizza Palace: the doors unlock, the sun comes up, their
//                 moms are waiting — and ten years later, a sign in a window says NOW HIRING.
import { sfx } from '../audio.js';
import { setEyes } from '../models.js';

const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;

const mode = (g) => g.escape;
const bot = (g, i = 0) => mode(g).level.enemies[i];

export const STORY = {
  daycareIntro: {
    area: 'esc1',
    setup(g, c) {
      const m = mode(g);
      for (const e of m.level.enemies) e.reset();
      c.put(m.kid, 29.2, 4.3, E);
      c.put(m.jack, 31.5, 4.3, W);
      c.pose(m.kid, 'idle', 0.3);
      c.pose(m.jack, 'idle', 0.6);
      c.hide(m.teacher);
      for (const e of m.level.enemies) if (e.id === 'nightbot') e.root.visible = false;
      g.player.flashlight.intensity = 0;
    },
    cleanup(g) {
      const m = mode(g);
      m.kid.root.visible = false;
      m.teacher.root.visible = false;
    },
    shots: [
      { card: "TEN YEARS BEFORE\nGUS'S PLAYPLACE...", dur: 3.2 },
      { card: "PJORK'S DAYCARE\n11:58 PM", dur: 2.6 },
      {
        line: 'Jonathan was five. On Fridays, his mom dropped him off at the overnight daycare.', dur: 5,
        cam: { from: [27.2, 8.4, 1.7], to: [27.8, 7.6, 1.5], look: [30.2, 3.0, 0.9] },
      },
      {
        who: 'Jack', line: 'Jonathan! Jonathan, wake up! Did you hear that?',
        cam: { from: [30.1, 4.95, 1.02], to: [30.25, 4.85, 1.0], look: [31.5, 4.3, 0.92] },
        start(g, c) { c.face(mode(g).jack, mode(g).kid); },
      },
      {
        who: 'Jonathan', line: "Huh? Jack, it's the middle of the night...",
        cam: { from: [30.6, 4.95, 1.02], to: [30.45, 4.85, 1.0], look: [29.2, 4.3, 0.9] },
        start(g, c) { c.face(mode(g).kid, mode(g).jack); },
      },
      {
        line: 'Something was walking around in the Play Area.', dur: 4,
        cam: { from: [29.0, 8.6, 1.05], to: [29.0, 9.6, 1.0], look: [22, 17, 1.2] },
        start(g, c) { c.put(bot(g), 18, 18, E); },
        update(g, c, k) {
          c.walk(bot(g), [16, 19], [23, 16], k);
          g.effects.flashAt(c.P(22, 16, 2.4), 0x5ad1ff, 3, 0.05);
        },
      },
      {
        who: 'Miss Penny', line: 'Help! Somebody HELP!', dur: 3.6,
        cam: { from: [29.0, 10.4, 1.1], to: [30.0, 11.0, 1.1], look: [26, 19, 1.3], lookTo: [33, 25, 1.3] },
        start(g, c) { sfx.spotted(); },
        update(g, c, k) {
          c.walk(mode(g).teacher, [21, 20], [35.6, 27.4], k * 1.1);
          c.pose(mode(g).teacher, 'chase');
          c.walk(bot(g), [18, 19], [33.6, 26.6], k * 1.05);
          c.pose(bot(g), 'chase');
          g.effects.flashAt(c.P(30, 24, 2.6), 0x9fb8ff, 3, 0.05);
        },
      },
      {
        line: 'The Night Bot chased her right through the door marked DO NOT ENTER.', dur: 4,
        cam: { from: [32.0, 22.5, 1.4], to: [32.4, 23.2, 1.35], look: [37.0, 27.5, 1.3] },
        start(g, c) { c.hide(mode(g).teacher); c.put(bot(g), 35.8, 27.4, E); },
        update(g, c, k) {
          c.walk(bot(g), [35.6, 27.4], [39.5, 27.6], k * 1.4);
          if (k > 0.55 && bot(g).root.visible) { c.hide(bot(g)); sfx.clang(); c.shake = 0.6; }
          g.effects.flashAt(c.P(35, 26, 2.6), 0xff6060, 3, 0.05);
        },
      },
      {
        who: 'Jack', line: 'It took Miss Penny into Storage! What do we DO?',
        cam: { from: [30.1, 4.95, 1.02], to: [30.25, 4.85, 1.0], look: [31.5, 4.3, 0.92] },
        start(g, c) { c.face(mode(g).jack, mode(g).kid); },
      },
      {
        who: 'Jonathan', line: 'We get out of here. Stay right behind me, okay?',
        cam: { from: [30.6, 4.95, 1.02], to: [30.45, 4.85, 1.0], look: [29.2, 4.3, 0.9] },
      },
      {
        who: 'Jack', line: "But the front door's locked... and the power's off!",
        cam: { from: [30.1, 4.95, 1.02], to: [30.25, 4.85, 1.0], look: [31.5, 4.3, 0.92] },
      },
      {
        who: 'Jonathan', line: 'Then we turn it back on. The generator needs fuses — let\'s find them.',
        cam: { from: [30.6, 4.95, 1.02], to: [30.45, 4.85, 1.0], look: [29.2, 4.3, 0.9] },
      },
      { card: "Find 3 fuses.\nDon't let them catch you.", dur: 3 },
    ],
  },

  // 6 AM at Gus's Giant Pizza Palace, then ten years later.
  finale: {
    area: 'esc8',
    setup(g, c) {
      const m = mode(g);
      m.decor.exit.setOpen(true);
      for (const e of m.level.enemies) { e.reset(); e.state = 'off'; }
      g.lighting.setEscape(m.decor, { ...m.level.def.mood, amb: 0.35, hemi: 0.35, fog: 0.01 });
      c.put(m.kid, 40.4, 42.5, S);
      c.put(m.jack, 41.6, 42.5, S);
      c.pose(m.kid, 'idle', 0.3);
      c.pose(m.jack, 'idle', 0.6);
      c.hide(m.moms[0]);
      c.hide(m.moms[1]);
    },
    cleanup(g) {
      const m = mode(g);
      m.kid.root.visible = false;
      m.jack.hide();
      for (const p of m.moms) p.root.visible = false;
      g.lighting.set('title');
    },
    shots: [
      { card: '6:00 AM', dur: 2.4, start() { sfx.sixAM(); } },
      {
        line: "At six o'clock, the front doors clicked open, and the sun came up over Gus's Giant Pizza Palace.", dur: 5,
        cam: { from: [41, 37.5, 1.6], to: [41, 39, 1.5], look: [41, 46.6, 1.3] },
        update(g, c) { g.effects.flashAt(c.P(41, 45.8, 1.6), 0xfff0c8, 8, 0.05); },
      },
      {
        who: 'Jack', line: 'We did it, Jonathan! We made it to MORNING!',
        cam: { from: [40.9, 44.0, 1.0], to: [40.95, 43.9, 1.0], look: [41.6, 42.5, 0.95] },
        start(g, c) { c.face(mode(g).jack, mode(g).kid); c.pose(mode(g).jack, 'wave'); },
      },
      {
        who: 'Jonathan', line: 'I told you. Just stay right behind me.',
        cam: { from: [41.1, 44.0, 1.0], to: [41.05, 43.9, 1.0], look: [40.4, 42.5, 0.92] },
        start(g, c) { c.face(mode(g).kid, mode(g).jack); c.pose(mode(g).jack, 'idle', 0.6); },
      },
      {
        who: 'Mom', line: 'Jonathan! Jack! THERE you are! We looked everywhere!',
        cam: { from: [41, 40, 1.4], to: [41, 40.4, 1.35], look: [41, 45, 1.3] },
        update(g, c, k) {
          const m = mode(g);
          c.walk(m.moms[0], [40.3, 46.2], [40.4, 44.0], k * 1.6);
          c.walk(m.moms[1], [41.7, 46.2], [41.6, 44.0], k * 1.5);
          if (k > 0.65) { c.face(m.kid, m.moms[0]); c.face(m.jack, m.moms[1]); }
        },
      },
      {
        line: "They tried to tell their moms everything. The Night Bots. Pjork. The baby Gus's. Nobody believed a single word.", dur: 5.5,
        cam: { from: [39.2, 40.4, 1.0], to: [39.5, 40.1, 1.1], look: [41, 38, 2.6] },
        start(g, c) { setEyes(mode(g).decor.goldenGus, 'on'); },
        update(g, c, k) { if (k > 0.8) setEyes(mode(g).decor.goldenGus, 'scare'); },
      },
      { card: 'TEN YEARS LATER...', dur: 3 },
      {
        line: 'Jonathan never forgot that night. So when he saw a sign in a window — NOW HIRING: NIGHT SECURITY — he just had to know.', dur: 6,
        start(g) {
          g.setArea('playplace');
          g.lighting.set('day');
          setEyes(mode(g).decor.goldenGus, 'dim');
        },
        cam: { from: [42.0, 38.9, 1.8], to: [42.4, 38.6, 1.85], look: [44.9, 38.2, 2.05] },
      },
      {
        line: "Gus's PlayPlace. How hard can it be?", dur: 3.6,
        cam: { from: [30, 8.0, 2.0], to: [30, 6.7, 2.05], look: [30, 3.4, 2.2] },
        start(g) { g.lighting.set('title'); sfx.musicBoxSting(); },
      },
      { card: 'THE END\n...or is it?', dur: 3.5 },
    ],
  },

  // The secret ending, for doing every quest in every level: at 6:01 AM a young man in a night
  // guard's uniform walks into the pizza place — John, on the day of his first shift. Ten years
  // later he's the old night guard at Gus's PlayPlace, and the note under the desk is his.
  secretEnding: {
    area: 'esc8',
    setup(g, c) {
      const m = mode(g);
      m.decor.exit.setOpen(true);
      for (const e of m.level.enemies) { e.reset(); e.state = 'off'; }
      g.lighting.setEscape(m.decor, { ...m.level.def.mood, amb: 0.35, hemi: 0.35, fog: 0.01 });
      c.put(m.kid, 40.4, 42, S);
      c.put(m.jack, 41.6, 42, S);
      c.pose(m.kid, 'idle', 0.3);
      c.pose(m.jack, 'idle', 0.6);
      c.hide(m.john);
      setEyes(m.decor.goldenGus, 'dim');
    },
    cleanup(g) {
      const m = mode(g);
      m.kid.root.visible = false;
      m.jack.hide();
      m.john.root.visible = false;
      setEyes(m.decor.goldenGus, 'dim');
      g.lighting.set('title');
    },
    shots: [
      { card: '⭐ SECRET ENDING ⭐', dur: 2.8, start() { sfx.musicBoxSting(); } },
      {
        line: 'Every quest. Every golden plushie. And at 6:01 AM, somebody else came in through the front doors...', dur: 5.5,
        cam: { from: [41, 38.6, 1.5], to: [41, 39.4, 1.45], look: [41, 46.6, 1.4] },
        update(g, c, k) {
          c.walk(mode(g).john, [41, 46.3], [41, 43.6], k * 1.3);
          g.effects.flashAt(c.P(41, 45.8, 1.6), 0xfff0c8, 8, 0.05);
        },
      },
      {
        who: 'John', line: 'Whoa! Kids?! What are you two doing in here?',
        cam: { from: [41.3, 41.3, 1.2], to: [41.25, 41.5, 1.25], look: [41, 43.6, 1.6] },
        start(g, c) { c.put(mode(g).john, 41, 43.6, N); c.pose(mode(g).john, 'idle', 0.3); },
      },
      {
        who: 'Jack', line: 'We were in here ALL NIGHT! The baby Gus\'s were chasing us!',
        cam: { from: [41.0, 43.0, 1.05], look: [41.6, 42, 0.95] },
        start(g, c) { c.pose(mode(g).jack, 'wave'); },
      },
      {
        who: 'John', line: 'All night? In HERE? ...Huh. I start as the night guard tonight. My very first shift.',
        cam: { from: [41.3, 41.3, 1.2], look: [41, 43.6, 1.6] },
        start(g, c) { c.pose(mode(g).jack, 'idle', 0.6); },
      },
      {
        who: 'Jonathan', line: "Listen for the giggling. Find all the save boxes. And don't let them catch you.",
        cam: { from: [40.9, 43.0, 1.05], look: [40.4, 42, 0.92] },
      },
      {
        who: 'John', line: "You two are braver than any grown-up I know. Here — take my spare flashlight. You might need it someday.",
        cam: { from: [39.6, 42.8, 1.3], to: [39.8, 42.6, 1.3], look: [40.8, 42.8, 1.0] },
        start(g, c) { c.pose(mode(g).john, 'give'); },
      },
      {
        line: 'And behind them, the golden Gus in the lobby blinked... its eyes glowing a friendly blue.', dur: 4.6,
        cam: { from: [40.0, 41.2, 1.6], to: [40.3, 40.4, 2.2], look: [41, 38.2, 2.9] },
        start(g, c) { c.pose(mode(g).john, 'idle', 0.3); setEyes(mode(g).decor.goldenGus, 'friend'); sfx.friendly?.(mode(g).decor.goldenGus.root.position); },
        // a warm light on the gold, and the blue glow of its eyes on its face
        update(g, c, k) {
          g.effects.flashAt(c.P(40.6, 40.2, 2.4), 0xffe2b0, 5, 0.05);
          if (k > 0.3) g.effects.flashAt(c.P(41, 39.2, 3.1), 0xa8d8ff, 1.6 * Math.min(1, (k - 0.3) * 3), 0.05);
        },
      },
      { card: 'TEN YEARS LATER...', dur: 3 },
      {
        line: "When Jonathan took the night shift at Gus's PlayPlace, there was a note stuck under the desk, from the old night guard.", dur: 6,
        start(g) { g.setArea('playplace'); g.lighting.set('night'); g.resetBots(); },
        cam: { from: [36.4, 39.6, 1.7], to: [36.0, 38.8, 1.6], look: [34.5, 34, 1.0] },
      },
      {
        line: 'The old night guard\'s name... was John. And he had been waiting a long time for those two kids to come back.', dur: 6,
        cam: { from: [30, 8.0, 2.0], to: [30, 6.7, 2.05], look: [30, 3.4, 2.2] },
        start(g) { g.lighting.set('title'); for (const a of g.bots) setEyes(a.rig, 'friend'); },
        update(g) { for (const a of g.bots) setEyes(a.rig, 'friend'); },
      },
      { card: "⭐ SECRET ENDING ⭐\nJohn's First Night", dur: 4, start(g) { for (const a of g.bots) setEyes(a.rig, 'on'); } },
    ],
  },
};
