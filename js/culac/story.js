// 10 Nights at Culac's Daycare's cutscenes, in the same shot-list form as story.js (cutscene.js
// plays them). Positions are plan metres in the daycare.
//
//   culacIntro    before Night 1: Mom drops Jimmy off, lights out next to Leo, and footsteps
//   culacFinale   after Night 10: everybody out the front doors in the morning — and who
//                 Officer Grumble's been talking to on his radio
import { sfx } from '../audio.js';
import { setEyes } from '../models.js';

const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;

const mode = (g) => g.culac;
const ppl = (g) => g.culac.people;
const kid = (g, i) => g.culac.kids[i].person;
const foe = (g, id) => g.culac.level.enemies.find((e) => e.id === id);
const later = (ms, fn) => setTimeout(fn, ms);
// (the daycare's lights are moved to wherever the shot is: CulacMode.lampsAt)
const lights = (g, x, z) => mode(g).lampsAt(x, z);

// Lying down in a bed: feet towards the foot of it, face up.
function inBed(c, a, [x, z]) {
  c.put(a, x, z + 0.62, S, 0.45);
  a.root.rotation.set(-Math.PI / 2, 0, 0, 'YXZ');
  c.pose(a, 'sleep', 1);
}

export const CULAC_STORY = {
  culacIntro: {
    area: 'culac',
    setup(g, c) {
      const p = ppl(g);
      c.put(p.mom, 900, 2174, N);
      c.put(p.jimmy, 899.2, 2172.6, S);
      c.pose(p.mom, 'idle', 0.4);
      c.pose(p.jimmy, 'idle', 0.4);
      lights(g, 900, 2172);
      mode(g).hideKids();
      const s = foe(g, 'sparky');
      if (s) { s.root.visible = false; setEyes(s.rig, 'on'); }
    },
    cleanup(g) {
      for (const k of ['mom', 'jimmy']) ppl(g)[k].root.visible = false;
      const s = foe(g, 'sparky');
      if (s) s.reset();
    },
    shots: [
      { card: "10 NIGHTS AT\nCULAC'S DAYCARE", dur: 3.2 },
      {
        line: 'Jimmy was five. His mom worked nights, and so did his big brother Jonathan — the new night guard at Gus\'s PlayPlace.', dur: 6,
        cam: { from: [900, 2150, 2.2], to: [900, 2158, 1.9], look: [900, 2174, 1.2] },
      },
      {
        who: 'Mom', line: 'Culac\'s is the biggest daycare in the whole world, Jimmy. You\'re going to love it.',
        cam: { from: [901.6, 2171.2, 1.5], to: [901.5, 2171.4, 1.5], look: [900, 2174, 1.5] },
      },
      {
        who: 'Jimmy', line: 'It\'s SO big. It takes about ten minutes just to walk across! Is Mr. Culac here?',
        cam: { from: [898.6, 2174.6, 1.0], to: [898.7, 2174.4, 1.0], look: [899.2, 2172.6, 0.95] },
      },
      {
        who: 'Mom', line: 'Nobody\'s ever met Mr. Culac, sweetie. Be good for Officer Grumble. I\'ll pick you up at six!',
        cam: { from: [901.6, 2171.2, 1.5], look: [900, 2174, 1.5] },
      },
      {
        line: 'Lights out was at eight. Jimmy\'s bed was right next to his new friend Leo\'s — Leo had dinosaur pajamas.', dur: 5.4,
        cam: { from: [1128.2, 267.5, 1.6], to: [1128.2, 266.5, 1.4], look: [1128.2, 262, 0.5] },
        start(g, c) {
          const p = ppl(g);
          c.hide(p.mom);
          inBed(c, p.jimmy, [1130, 262]);
          inBed(c, kid(g, 0), [1126.4, 262]);
          for (let i = 1; i < g.culac.kids.length; i++) inBed(c, kid(g, i), g.culac.kids[i].bed.at);
          lights(g, 1130, 262);
        },
      },
      {
        who: 'Leo', line: 'Psst. Jimmy. My cousin says the animatronics from Gus\'s PlayPlace sneak over here at night.',
        cam: { from: [1127.4, 264.4, 1.0], look: [1126.4, 262.2, 0.55] },
      },
      {
        who: 'Jimmy', line: 'No they don\'t. My brother WORKS there. They just stand on the stage. ...Right?',
        cam: { from: [1131, 264.4, 1.0], look: [1130, 262.2, 0.55] },
      },
      {
        line: 'Then, late in the night...', dur: 3.2,
        cam: { from: [1150, 322, 1.3], to: [1150, 324, 1.2], look: [1150, 345, 1.0] },
        start(g, c) {
          lights(g, 1150, 335);
          const s = foe(g, 'sparky');
          if (s) { s.root.visible = true; c.put(s, 1132, 346, E); }
        },
        update(g, c, k) {
          const s = foe(g, 'sparky');
          if (!s) return;
          c.walk(s, [1132, 346], [1170, 346], k);
          if (Math.floor(k * 12) !== Math.floor((k - 0.02) * 12)) sfx.step('chomper', s.root.position);
        },
      },
      {
        who: 'Jimmy', line: '...Leo? Leo, wake up! There\'s something out there!', dur: 3.2,
        cam: { from: [1131, 264.4, 1.0], look: [1130, 262.2, 0.55] },
        start(g) { sfx.musicBoxSting(); },
      },
    ],
  },

  culacFinale: {
    area: 'culac',
    setup(g, c) {
      const p = ppl(g);
      lights(g, 900, 2172);
      c.put(p.jimmy, 900, 2176.5, N);
      c.put(p.mom, 900.6, 2179.6, N);
      c.pose(p.jimmy, 'idle', 0.4);
      c.pose(p.mom, 'idle', 0.4);
      const ks = g.culac.kids;
      ks.forEach((k, i) => {
        c.put(k.person, 896.5 + (i % 5) * 1.6, 2173.5 - Math.floor(i / 5) * 1.6, S);
        c.pose(k.person, 'idle', 0.4);
      });
      const gr = foe(g, 'grumble');
      if (gr) { gr.state = 'watch'; c.put(gr, 900, 2010, N); c.pose(gr, 'idle', 0.2); gr.aimBeam(false); }
      c.put(p.peter, 905.6, 2004.4, W - 0.3);
      c.pose(p.peter, 'idle', 0.2);
      if (g.culac.decor.exit) g.culac.decor.exit.setOpen(true);
    },
    cleanup(g) {
      const p = ppl(g);
      for (const k of ['jimmy', 'mom', 'peter']) p[k].root.visible = false;
      g.culac.hideKids();
    },
    shots: [
      {
        line: 'At six o\'clock in the morning, the front doors of Culac\'s Daycare swung open — and out came Jimmy, and every single kid.', dur: 6,
        cam: { from: [900, 2160, 2.0], to: [900, 2164, 1.7], look: [900, 2178, 1.2] },
        start() { sfx.victory(); },
      },
      {
        who: 'Mom', line: 'JIMMY! Oh, sweetie, you\'re okay! Everybody\'s okay!',
        cam: { from: [899.2, 2176.8, 1.4], look: [900.6, 2179.6, 1.5] },
      },
      {
        who: 'Jimmy', line: 'Mom! The animatronics from Gus\'s PlayPlace come here at NIGHT! And an owl! And a pug with blue hair! And Officer Grumble HELPS them!',
        cam: { from: [900.8, 2178.4, 1.1], look: [900, 2176.5, 0.95] },
      },
      {
        who: 'Leo', line: 'It\'s true! Jimmy saved all of us. He\'s like a real astronaut!',
        cam: { from: [897, 2176, 1.0], look: [896.5, 2173.5, 0.9] },
      },
      {
        who: 'Mom', line: '...Okay. No more Culac\'s. From now on you can stay home with your brother.',
        cam: { from: [899.2, 2176.8, 1.4], look: [900.6, 2179.6, 1.5] },
      },
      {
        line: 'Back in the Security Office, Officer Grumble\'s radio crackled.', dur: 4,
        cam: { from: [900, 2016, 1.8], to: [900, 2014.5, 1.7], look: [900, 2008, 1.5] },
        start(g) { lights(g, 900, 2010); sfx.plexWalkie(); },
      },
      {
        who: 'Officer Grumble', line: 'Boss? ...They got out. All of them. The little astronaut too.',
        cam: { from: [900.8, 2012.2, 1.9], look: [900, 2010, 1.85] },
      },
      {
        who: 'Peter', line: 'That\'s alright, Officer. Let them go.', dur: 3.4,
        cam: { from: [903.8, 2008.6, 1.8], to: [904.1, 2007.9, 1.85], look: [905.6, 2004.4, 1.75] },
        start(g) { sfx.musicBoxSting(); setEyes(ppl(g).peter.rig, 'on'); },
      },
      {
        who: 'Peter', line: 'There\'s always another night.', dur: 3.4,
        cam: { from: [904.6, 2006.6, 1.8], look: [905.6, 2004.4, 1.8] },
      },
      { card: 'THE END\n...FOR NOW', dur: 3.6 },
    ],
  },
};
