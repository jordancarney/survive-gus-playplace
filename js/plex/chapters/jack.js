// Lost in the Pizzaplex: Jack's chapters after Chapter 4. (They play like Sister Location, the
// designer's call: a voice on the speakers gives Jack one job after another, on his Gus Watch.)
//
// P.A.L., the Pizzaplex Assistant Line, starts out helpful — polite, cheerful, and a little bit
// wrong. In Chapter 19 Jack finds out P.A.L. is the one running the animatronics' schedule: it
// thinks the party never ends. From then on Jack goes after it: the Core Key (24), down to
// the Core (31), the reboots (37), the three levers (43), and in Chapter 49 he switches P.A.L.
// off for good.
//
//    9 Night Maintenance       fix the generator (and find out what the chargers do)
//   14 Hide and Don't Breathe  DJ Rocco checks every hiding spot in the Workshop
//   19 P.A.L.'s Secret         its memory chips, and what's on them
//   24 The Core Key            three shocks, the Charging Bay, and a key on Rocco's charger
//   31 The Core                down the service elevator to where P.A.L. lives
//   37 Reboot                  three guards, and the dark seconds while they reboot
//   43 Three Levers            three levers, three corners, everyone hunting
//   49 Goodbye, P.A.L.         three cables, thirty seconds, and the code
//
// The jobs themselves (vents, standing still, windows, inspections, gates, reboots, levers)
// are in ../tunnels/kit.js; the two maps in ../tunnels/maps.js.
import * as THREE from 'three';
import { G, lam, glowMat } from '../../decor.js';
import { mat, setEyes } from '../../models.js';
import { sfx } from '../../audio.js';
import { requestPointerLock } from '../../input.js';
import { buildOld, buildRocco, buildSparky } from '../cast.js';
import {
  pal, walkie, lines, crawl, startStill, updateStill, WindowBot, startInspection, updateInspection,
  makeGate, startReboots, updateReboots, lever,
} from '../tunnels/kit.js';
import { tunnelsLayout, buildTunnels, TUNNEL_VENTS, coreLayout, buildCore, animateCore } from '../tunnels/maps.js';

const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;

const TUNNEL_MOOD = { amb: 0.07, hemi: 0.07, fog: 0.04, bg: 0x040406 };
const CORE_MOOD = { amb: 0.06, hemi: 0.06, fog: 0.035, bg: 0x02060a };

// Something that walks the tunnels. `extra` overrides anything.
const bot = (id, name, extra = {}) => ({
  id, name, build: id === 'rocco' ? buildRocco : id === 'sparky' ? buildSparky : buildOld(id),
  walk: 1.8, chase: 3.6, sight: 10, hear: 8, hunt: 0.3, lose: 5, wait: 12,
  steps: id === 'rocco' || id === 'sparky' ? 'chomper' : id, stride: 1.0, shoutWho: name, ...extra,
});
const SPARKY = { walk: 2.5, chase: 4.4, sight: 11, hear: 10, stride: 0.7,
  shout: () => ['Woof! WOOF!', 'Fetch! Fetch!', 'Play with me!'][Math.floor(Math.random() * 3)] };

const plushie = (id = 'plushie') => ({ id, type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' });

const TIPS = {
  gerald: 'Gerald is slow but strong. Walk, don\'t run, and hide in a locker if he sees you.',
  chomper: 'Chomper can hear you running from far away. Walk past him!',
  sparky: 'Sparky is the fastest thing down here. Never let him see you — hide, or crawl into a vent where he can\'t fit.',
  rocco: 'Only press E when DJ Rocco is RIGHT UP at the glass. Too early and he just gets faster!',
};

// Every Jack chapter shares this: P.A.L. on the speakers, the vents, the jobs in the kit.
// `cfg.start / done / use / collect / update` are the chapter's own, given (m, rt).
function chapter(cfg) {
  return {
    hero: 'jack',
    tips: TIPS,
    ...cfg,
    progress(m, q) { return cfg.progress ? cfg.progress(m, q, this.rt) || '' : ''; },
    start(m, resumed) {
      const rt = this.rt = { vents: cfg.vents || [] };
      if (cfg.window) {
        this.bot = this.bot || new WindowBot(cfg.window);
        rt.bot = this.bot;
      }
      if (cfg.start) cfg.start(m, rt, resumed);
      if (cfg.intro && !resumed) {
        setTimeout(() => { if (m.game.mode === 'escape' && m.def === this && !m.done.size) lines(m, this.id, cfg.intro); }, 3400);
      }
    },
    questDone(m, q) { if (cfg.done && cfg.done[q.id]) cfg.done[q.id](m, this.rt, q); },
    use(m, t, q) { return cfg.use ? cfg.use(m, t, this.rt, q) : true; },
    collect(m, item) { if (cfg.collect) cfg.collect(m, item, this.rt); },
    update(m, dt) {
      const rt = this.rt;
      if (!rt) return;
      crawl(m, rt, rt.vents);
      if (rt.still) updateStill(m, rt, dt);
      if (m.game.mode !== 'escape') return;
      if (rt.insp) updateInspection(m, rt, dt);
      if (m.game.mode !== 'escape') return;
      if (rt.reboot) updateReboots(m, rt, dt);
      if (rt.bot) rt.bot.update(m, dt);
      if (m.game.mode !== 'escape') return;
      if (cfg.update) cfg.update(m, dt, rt);
    },
  };
}

// A countdown on screen; `then` runs at zero.
function countdown(rt, secs, label, then) { rt.count = { t: secs, label, then }; }
function tickCountdown(m, rt, dt) {
  const c = rt.count;
  if (!c) return;
  c.t -= dt;
  m.game.hud.toast(`${c.label} ${Math.max(0, Math.ceil(c.t))}`, 0.3);
  if (c.t <= 0) { rt.count = null; c.then(); }
}

// The P.A.L. code Jack copies in Chapter 37 and types in Chapter 49.
const codeOf = (m) => (m.flags.code = m.flags.code || String(Math.floor(1000 + Math.random() * 9000)));
const spaced = (code) => code.split('').join(' ');

// ════════════════════════════════════════════════════════════════════════
// Chapter 9 — Night Maintenance (1:20)
//
// P.A.L. asks for a favour: the generator in the Workshop is broken, so the chargers are off,
// so the animatronics can't recharge, so they wander. Find three fuses and fix it. (Fixing it
// turns the chargers on, and chargers wake animatronics up. P.A.L. may have got that
// backwards.) The power's off, so the Workshop and Parts Room are dark until you do.
// ════════════════════════════════════════════════════════════════════════

const ch9 = chapter({
  id: 'jack-maintenance',
  name: 'Night Maintenance',
  layout: tunnelsLayout(),
  build(d) {
    buildTunnels(d);
    d.target('generator', 38.4, 12.3, 'north', 'Put the fuses in the generator 🔌', (g) => {
      const steel = mat(0x5a6070, { metal: 0.6, rough: 0.4 });
      d.mesh(G.box, steel, g, { p: [0, 0.7, 0], s: [2.2, 1.4, 1.1] });
      d.mesh(G.box, lam(0xf2c230), g, { p: [0, 1.15, 0.56], s: [1.5, 0.3, 0.02] });
      d.genFuses = [0, 1, 2].map((k) => {
        const f = d.mesh(G.cyl, glowMat(0xfff4c8, 0.4), g, { p: [-0.5 + k * 0.5, 0.7, 0.58], s: [0.06, 0.24, 0.06], r: [0, 0, Math.PI / 2], still: false });
        f.visible = false;
        return f;
      });
    });
    d.place.addBlock(37.3, 11.75, 39.5, 12.85, 1.4);
    d.label('GENERATOR', 38.4, 11.73, 1.7, 1.4, 0.3, 'north', { bg: '#2b2d33', fg: '#f2c230', glow: '#f2c230' });
    d.item('fuse', 'fuse1', 41.0, 15.0);
    d.item('fuse', 'fuse2', 2.4, 25.2);
    d.item('fuse', 'fuse3', 16.4, 19.4);
    d.item('plushie', 'plushie', 8.6, 1.6, 0.4);
  },
  mood: TUNNEL_MOOD,
  spawn: { at: [4.5, 5.5], yaw: W },
  vents: TUNNEL_VENTS,
  firstLine: 'Back down here again... P.A.L. said it needed help. Okay. Just one job.',
  winTitle: 'JACK FIXED THE GENERATOR!',
  exitText: 'Climb the ladder up! 🪜',
  card: {
    story: 'P.A.L. called Jack on the Gus Shop\'s speaker: <i>"Jack! Lovely to hear you again. I need a small favour. The generator under the Workshop is broken, so the chargers are off, so the animatronics cannot recharge, so they are wandering about. Please fix it. Thank you!"</i> Back down the hatch he went.',
    goal: '⌚ Crawl through the vent, find the <b>3 fuses</b>, put them in the <b>generator</b> in the Workshop, then climb the <b>ladder</b> out.',
    watchOut: '👀 <b>Gerald</b> walks the Parts Room and the Control Room. The power\'s off, so it\'s <b>dark</b> — use your flashlight. And there\'s something asleep in the Workshop...',
    after: 'The generator roared, the chargers lit up — and every animatronic in the tunnels opened its eyes at once. <i>"Oh dear,"</i> said P.A.L. <i>"Chargers wake them up. I may have got that backwards."</i> Jack ran for the ladder.<br><br>Up in the Giant Ball Pit, <b>Thomas</b> took a deep breath, and dived back in.',
  },
  friends: [
    '🔵 Jonathan: <b>Backstage</b> · through the STAFF ONLY door',
    '🟣 Max: <b>Sleepover Suite</b> · hiding',
    '🔦 Jackson: <b>Security Office</b> · on the cameras',
    '🟢 Thomas: <b>Giant Ball Pit</b> · ???',
  ],
  intro: [
    ['Welcome back, Jack! The generator is in the Workshop, through the vent. It needs three fuses. Thank you so much!', 5, 'pal'],
  ],
  quests: [
    { id: 'vent', type: 'visit', room: 'K', text: 'Crawl through the vent to the Workshop', done: 'Through the vent!' },
    { id: 'fuses', type: 'collect', item: 'fuse', count: 3, text: 'Find 3 fuses (the yellow ◆ on your map)', done: 'All 3 fuses!' },
    { id: 'power', type: 'use', target: 'generator', text: 'Put the fuses in the generator (Workshop)', done: 'The generator is running!' },
    { id: 'exit', type: 'exit', text: 'RUN! Climb the ladder out (Ladder Room)' },
    plushie(),
  ],
  enemies: [
    bot('gerald', 'Gerald', { roam: ['R', 'C', 'L', 'R'], start: [39, 26], wait: 10 }),
    bot('chomper', 'Chomper', { walk: 2.0, chase: 3.8, roam: ['K', 'R', 'C', 'L'], start: [41, 3], yaw: W, asleep: true, hear: 10 }),
  ],
  start(m, rt) {
    const d = m.decor;
    const power = m.done.has('power');
    for (const l of [...d.workLights, ...d.partsLights]) l.off = !power;
    m.game.lighting.apply();
    d.exit.setOpen(power);
    for (const f of d.genFuses) f.visible = power;
    if (power) { m.enemies.find((e) => e.id === 'chomper').wake(1.15); m.huntK = 2; }
  },
  done: {
    vent(m) { pal(m, 'You are in the Workshop! The fuses are somewhere in the tunnels. Please do not mind Gerald. He is just stretching his legs.', 5); },
    fuses(m) { pal(m, 'All three! Now please put them in the generator. It is by the Workshop\'s south wall.', 4); },
    power(m) {
      const d = m.decor;
      for (const f of d.genFuses) f.visible = true;
      for (const l of [...d.workLights, ...d.partsLights]) l.off = false;
      m.game.lighting.apply();
      sfx.powerOn();
      d.exit.setOpen(true);
      m.enemies.find((e) => e.id === 'chomper').wake(1.15);
      for (const e of m.enemies) if (e.id === 'gerald') e.wake(1.1);
      m.huntK = 2;
      setTimeout(() => sfx.escAlarm(), 900);
      lines(m, 'jack-maintenance', [
        ['The chargers are on! Wonderful! Now everybody can recharge and be— oh.', 3.6, 'pal'],
        ['Chargers WAKE the animatronics up. I may have got that backwards. Please run, Jack.', 4.4, 'pal'],
      ]);
    },
  },
  collect(m, item) {
    if (item.kind === 'fuse' && m.count('fuse') === 1) setTimeout(() => m.say('One fuse! Two more...', 2.2), 900);
  },
});

// ════════════════════════════════════════════════════════════════════════
// Chapter 14 — Hide and Don't Breathe (2:00)
//
// DJ Rocco does his rounds: he checks every hiding spot in the Workshop. Hide — and when he's
// right by you, hold your breath. Then find the three records he dropped, and play them in
// the Control Room: he goes off to dance, and the ladder's yours.
// ════════════════════════════════════════════════════════════════════════

const ch14 = chapter({
  id: 'jack-breathe',
  name: 'Hide and Don\'t Breathe',
  layout: tunnelsLayout(),
  build(d) {
    buildTunnels(d, { shockPanel: false });
    d.target('turntable', 21.5, 14.7, 'south', 'Play DJ Rocco\'s records 🎵', (g) => {
      d.mesh(G.box, lam(0x1a1a1e), g, { p: [0, 0.45, 0], s: [1.2, 0.9, 0.6] });
      for (const x of [-0.3, 0.3]) d.mesh(G.cyl, lam(0x111111), g, { p: [x, 0.92, 0], s: [0.22, 0.02, 0.22] });
      d.mesh(G.box, glowMat(0xff3fa4, 0.4), g, { p: [0, 0.8, 0.31], s: [0.8, 0.06, 0.01] });
    });
    d.place.addBlock(20.9, 14.4, 22.1, 15.0, 0.9);
    d.item('record', 'record1', 1.8, 8.4);
    d.item('record', 'record2', 11.5, 14.8);
    d.item('record', 'record3', 28.2, 27.4);
    d.item('plushie', 'plushie', 23.4, 19.5, 0.4);
  },
  mood: TUNNEL_MOOD,
  spawn: { at: [4.5, 5.5], yaw: W },
  vents: TUNNEL_VENTS,
  firstLine: 'P.A.L. sounded weird. "Please hide, Jack." Hide from WHAT?',
  winTitle: 'JACK DIDN\'T BREATHE!',
  exitText: 'Climb the ladder up! 🪜',
  card: {
    story: '<i>"Good evening, Jack! It is time for DJ Rocco\'s rounds. Every night he checks every hiding spot in the Workshop. It is his favourite game. He has never lost."</i> Jack was already in the tunnels.',
    goal: '⌚ Crawl into the Workshop and <b>hide</b> — a locker or the box. When DJ Rocco is right next to you, <b>hold SPACE to hold your breath</b>. Then find his <b>3 records</b> and play them in the Control Room.',
    watchOut: '🦝 <b>DJ Rocco</b> sees anything out in the open. Hidden, he can still <b>hear you breathe</b> — but you can only hold your breath for so long. <b>Gerald</b> wanders the Ladder Room.',
    after: 'The record crackled, the beat dropped, and DJ Rocco danced all the way back into the Parts Room. Jack climbed out of the tunnels, gasping like he\'d been underwater for an hour.<br><br>In the Giant Ball Pit, <b>Thomas</b> was already gone again — back to a night years before.',
  },
  friends: [
    '🔵 Jonathan: <b>The Fun Zone</b>',
    '🟣 Max: <b>Sleepover Suite</b> · hiding',
    '🔦 Jackson: <b>Security Office</b> · on the cameras',
    '🟢 Thomas: <b>???</b> · somewhere long ago',
  ],
  intro: [
    ['DJ Rocco is waking up for his rounds. Please crawl through the vent and pick a hiding spot. Good luck! Not that luck will help.', 5, 'pal'],
  ],
  quests: [
    { id: 'vent', type: 'visit', room: 'K', text: 'Crawl through the vent to the Workshop', done: 'In the Workshop!' },
    { id: 'hide', type: 'hide', text: 'DJ Rocco is coming! HIDE in a locker or the box — quick!', done: 'Hidden...' },
    { id: 'inspect', type: 'inspect', text: 'When DJ Rocco is close, HOLD SPACE to hold your breath', done: 'He didn\'t hear you!' },
    { id: 'records', type: 'collect', item: 'record', count: 3, text: 'Find DJ Rocco\'s 3 lost records', done: 'All 3 records!' },
    { id: 'play', type: 'use', target: 'turntable', text: 'Play his records in the Control Room', done: 'He\'s dancing!' },
    { id: 'exit', type: 'exit', text: 'Climb the ladder out (Ladder Room)' },
    plushie(),
  ],
  enemies: [
    bot('rocco', 'DJ Rocco', { walk: 2.2, chase: 4.0, sight: 11, hear: 9, roam: ['R', 'K', 'C', 'R'], start: [33, 16.2], yaw: N, asleep: true,
      shout: () => ['Found you!', 'Party time!', 'Nobody leaves the dance floor!'][Math.floor(Math.random() * 3)] }),
    bot('gerald', 'Gerald', { roam: ['L', 'C', 'L'], start: [6, 19], wait: 30 }),
  ],
  start(m, rt) {
    const d = m.decor;
    d.exit.setOpen(m.done.has('play'));
    const r = m.enemies.find((e) => e.id === 'rocco');
    // back from a save box after the inspection: he's roaming (or dancing)
    if (m.done.has('inspect')) r.wake(1);
    if (m.done.has('play')) dance(m);
    else if (m.done.has('vent') && !m.done.has('inspect')) beginRounds(m, rt);
  },
  done: {
    vent(m, rt) { beginRounds(m, rt); },
    inspect(m) {
      lines(m, 'jack-breathe', [
        ['He has gone. You did not breathe! Impressive. Now DJ Rocco has lost his three favourite records somewhere in the tunnels.', 5, 'pal'],
        ['If you play them in the Control Room, he will dance. He cannot help it.', 3.6, 'pal'],
      ]);
    },
    play(m) {
      dance(m);
      m.decor.exit.setOpen(true);
      m.game.hud.toast('🎵 DJ Rocco\'s record is playing!', 3);
      lines(m, 'jack-breathe', [['He loves this song. The ladder is that way. Goodbye, Jack!', 3.6, 'pal']]);
    },
  },
  update(m, dt, rt) {
    tickCountdown(m, rt, dt);
    if (m.hiding && !m.done.has('hide') && m.done.has('vent')) m.complete('hide');
  },
});

// The countdown, then DJ Rocco's rounds of the Workshop: every hiding spot in turn.
function beginRounds(m, rt) {
  pal(m, 'Here comes DJ Rocco! Please hide. You have about ten seconds.', 3.4);
  countdown(rt, 11, '🦝 DJ Rocco is coming — HIDE!', () => {
    startInspection(m, rt, {
      enemy: 'rocco',
      route: [[33, 11.6, 0.6], [29.4, 10.2, 2.6], [40.2, 10.2, 2.6], [34, 3.2, 2.4], [33, 15.6, 0.4]],
      onDone: () => { m.complete('hide'); m.complete('inspect'); },
    });
  });
}

function dance(m) {
  const r = m.enemies.find((e) => e.id === 'rocco');
  r.wake(1);
  r.sendTo(m.place.P(36, 22), N);
}

// ════════════════════════════════════════════════════════════════════════
// Chapter 19 — P.A.L.'s Secret (2:40)
//
// P.A.L.'s memory chips "fell out". Jack collects them and plugs them into the Control Room
// computer — and reads P.A.L.'s schedule: PARTY: FOREVER. P.A.L. is the one keeping the
// animatronics awake. It turns the lights out on him, locks the ladder, and the only way out
// is back through the vent to the hatch. (They don't fit in the vent.)
// ════════════════════════════════════════════════════════════════════════

const CONTROL_LOOP = [[16.6, 16.2], [22.6, 15.8], [23.2, 19.4], [16.6, 19.4]];

const ch19 = chapter({
  id: 'jack-secret',
  name: 'P.A.L.\'s Secret',
  layout: tunnelsLayout(),
  build(d) {
    buildTunnels(d, { shockPanel: false, hatchExit: true, ladder: false });
    d.target('computer', 18.4, 14.7, 'south', 'Plug the memory chips into the computer 💾', (g) => {
      d.mesh(G.box, lam(0x2a2a30), g, { p: [0, 0.4, 0], s: [1.4, 0.8, 0.6] });
      d.mesh(G.box, lam(0x1a1a1e), g, { p: [0, 1.05, -0.15], s: [0.9, 0.55, 0.06] });
      d.screen = d.mesh(G.plane, glowMat(0x2de2e6, 0.2), g, { p: [0, 1.05, -0.11], s: [0.8, 0.45, 1], shadow: false, still: false });
    });
    d.place.addBlock(17.7, 14.4, 19.1, 15.0, 0.8);
    d.item('chip', 'chip1', 41.4, 1.8);
    d.item('chip', 'chip2', 28.2, 27.4);
    d.item('chip', 'chip3', 2.4, 25.2);
    d.item('plushie', 'plushie', 41.2, 15.2, 0.5);
  },
  mood: TUNNEL_MOOD,
  spawn: { at: [4.5, 5.5], yaw: W },
  vents: TUNNEL_VENTS,
  firstLine: 'P.A.L.\'s "memory chips"? Why does a speaker need memory chips?',
  winTitle: 'JACK KNOWS P.A.L.\'S SECRET!',
  exitText: 'Up through the hatch! 🪜',
  card: {
    story: '<i>"Jack! Oh, Jack, I am so embarrassed. Some of my memory chips fell out. Three of them. Would you please collect them, and plug them into the Control Room computer? For safekeeping. Do not read them."</i>',
    goal: '⌚ Find P.A.L.\'s <b>3 memory chips</b> in the tunnels and plug them into the <b>Control Room computer</b>. Then... see what happens.',
    watchOut: '👀 <b>Gerald</b> walks the Workshop and the Parts Room. Something is asleep in the <b>Ladder Room</b>. And when P.A.L. turns the lights out — <b>don\'t move</b>.',
    after: 'Jack popped up through the hatch into the Gus Shop and slammed it shut behind him. His walkie crackled. <i>"Jack, it\'s Jackson. Say that again?"</i> — <i>"It\'s P.A.L.! P.A.L. is the one making them walk around! It thinks the party never ends!"</i><br><br>In the Giant Ball Pit, <b>Thomas</b> was diving again — to the day the Pizzaplex first opened.',
  },
  friends: [
    '🔵 Jonathan: <b>Sleepover Suite</b> · found Max!',
    '🟣 Max: <b>Sleepover Suite</b> · keeping it safe',
    '🔦 Jackson: <b>Security Office</b> · on the cameras',
    '🟢 Thomas: <b>???</b> · somewhere long ago',
  ],
  intro: [
    ['The chips are in the Workshop, the Parts Room and the Ladder Room. Please hurry. And please do not read them. They are private.', 5.2, 'pal'],
  ],
  quests: [
    { id: 'vent', type: 'visit', room: 'K', text: 'Crawl through the vent to the Workshop', done: 'Through the vent!' },
    { id: 'chips', type: 'collect', item: 'chip', count: 3, text: 'Find P.A.L.\'s 3 memory chips', done: 'All 3 chips!' },
    { id: 'plug', type: 'use', target: 'computer', text: 'Plug the chips into the Control Room computer', done: 'The screen is lighting up...' },
    { id: 'still', type: 'still', text: 'The lights are out — DON\'T MOVE!', done: 'The lights are back!' },
    { id: 'back', type: 'visit', room: 'H', text: 'The ladder\'s locked! Back through the VENT to the hatch!', done: 'Made it to the hatch!' },
    { id: 'exit', type: 'exit', text: 'Up through the hatch!' },
    plushie(),
  ],
  enemies: [
    bot('gerald', 'Gerald', { roam: ['K', 'R', 'K'], start: [39, 26], wait: 12 }),
    bot('chomper', 'Chomper', { walk: 2.0, chase: 3.9, hear: 10, roam: ['L', 'C', 'R'], start: [6, 22], asleep: true }),
  ],
  start(m, rt) {
    const d = m.decor;
    d.exit.setOpen(m.done.has('still'));
    if (m.count('chip') > 0) m.enemies.find((e) => e.id === 'chomper').wake();
    if (m.done.has('plug') && !m.done.has('still')) setTimeout(() => m.def.id === 'jack-secret' && m.game.mode === 'escape' && lightsOut(m, rt), 1500);
    if (m.done.has('still')) m.huntK = 2.5;
  },
  collect(m, item) {
    if (item.kind === 'chip' && m.count('chip') === 1) {
      m.enemies.find((e) => e.id === 'chomper').wake();
      sfx.musicBoxSting();
      setTimeout(() => m.say('Something just woke up in the Ladder Room...', 2.8), 1000);
    }
  },
  done: {
    chips(m) { pal(m, 'Thank you! Now please plug them into the computer in the Control Room. And please, please do not read the screen.', 5); },
    plug(m, rt) {
      const d = m.decor;
      d.screen.material.color.set(0xff3b30).multiplyScalar(2);
      sfx.escWatch();
      m.game.hud.toast('📄 P.A.L.\'S SCHEDULE — PARTY: FOREVER · ANIMATRONICS: AWAKE, ALWAYS · EXITS: LOCKED', 6);
      lines(m, 'jack-secret', [
        ['"Party: forever"? "Animatronics: awake, always"? P.A.L.... it\'s YOU. You\'re the one making them walk around!', 4.6],
        ['Oh. You read it. I asked you nicely not to read it.', 3.2, 'pal'],
      ]);
      setTimeout(() => { if (m.def.id === 'jack-secret' && m.game.mode === 'escape') lightsOut(m, rt); }, 8600);
    },
    still(m) {
      m.decor.exit.setOpen(true);
      m.huntK = 2.5;
      for (const e of m.enemies) e.wake(1.15);
      lines(m, 'jack-secret', [
        ['I have locked the ladder, Jack. The party is not over. The party is never over.', 4.2, 'pal'],
        ['Jack! It\'s Jackson. Get back in that vent — they can\'t fit in there! The hatch is open!', 4.6, 'jackson'],
      ]);
    },
  },
});

function lightsOut(m, rt) {
  startStill(m, rt, {
    lights: m.decor.controlLights, enemy: 'gerald', loop: CONTROL_LOOP, from: [23.2, 19.4], len: 14, near: 7,
    line: 'Now I am turning the lights off. Gerald is coming to keep you company. If I were you, I would not move.',
    after: [29, 18.5],
    onDone: () => m.complete('still'),
  });
}

// ════════════════════════════════════════════════════════════════════════
// Chapter 24 — The Core Key (3:10)
//
// Jackson has spotted the key to P.A.L.'s Core on his cameras: it hangs on DJ Rocco's charger,
// in the Charging Bay. Shock Rocco three times so he powers down, open the Bay's door from
// the Parts Room, and grab the key before he reboots. Then Sparky gets sent after you.
// ════════════════════════════════════════════════════════════════════════

const ch24 = chapter({
  id: 'jack-key',
  name: 'The Core Key',
  layout: tunnelsLayout({ bayDoor: true }),
  build(d) {
    buildTunnels(d);
    d.bayGate = makeGate(d, { x0: 25.0, z0: 25.0, x1: 27.0, z1: 27.0, color: 0x5a3a7a, label: 'CHARGING BAY — KEEP OUT', at: [27.04, 26], facing: 'east' });
    d.target('baydoor', 27.6, 23.4, 'east', 'Open the Charging Bay door 🔓', (g) => {
      d.mesh(G.box, mat(0x3a3d44, { metal: 0.5 }), g, { p: [0, 1.1, -0.15], s: [0.5, 0.7, 0.15] });
      d.mesh(G.box, glowMat(0xc040ff, 0.5), g, { p: [0, 1.2, -0.06], s: [0.25, 0.15, 0.02] });
    });
    d.item('corekey', 'corekey', 19.5, 27.4, 1.0);
    d.item('plushie', 'plushie', 41.2, 15.2, 0.5);
  },
  mood: TUNNEL_MOOD,
  spawn: { at: [4.5, 5.5], yaw: W },
  vents: TUNNEL_VENTS,
  window: { build: buildRocco, id: 'rocco', name: 'DJ Rocco', home: [19.5, 26.2], glass: [19.5, 22.6], speed: 0.95, hold: 4.0, cracks: 'windowCracks' },
  firstLine: 'The key to P.A.L.\'s Core. On DJ Rocco\'s charger. Of course it is.',
  winTitle: 'JACK GOT THE CORE KEY!',
  exitText: 'Climb the ladder up! 🪜',
  card: {
    story: 'Jackson found it on CAM 08: a glowing green key, hanging on DJ Rocco\'s charger in the Charging Bay. <i>"That\'s the key to P.A.L.\'s Core,"</i> he said over the walkie. <i>"Wherever that is."</i> P.A.L. was pretending nothing had happened. <i>"Hello, Jack! What a lovely night."</i>',
    goal: '⌚ Give DJ Rocco <b>3 controlled shocks</b> from the Control Room so he powers down. Open the <b>Charging Bay door</b> in the Parts Room, grab the <b>Core Key</b> — before he reboots — and get out.',
    watchOut: '🦝 Shock DJ Rocco <b>only when he\'s at the glass</b>. Once the Bay is open, you\'ve got <b>25 seconds</b>. <b>Gerald</b> walks the tunnels — and someone fast is asleep in the Ladder Room.',
    after: 'Jack got up the ladder with the Core Key in his fist and Sparky\'s barking right behind him. <i>"That is MY key,"</i> said P.A.L., very quietly.<br><br>In the Giant Ball Pit, <b>Thomas</b> dived deeper than ever before — and came out somewhere that hadn\'t happened yet.',
  },
  friends: [
    '🔵 Jonathan: <b>Prize Counter</b> · batteries for the walkies',
    '🟣 Max: <b>The base</b> · Sleepover Suite',
    '🔦 Jackson: <b>Security Office</b> · watching CAM 08',
    '🟢 Thomas: <b>Giant Ball Pit</b>',
  ],
  intro: [
    ['Jack, it\'s Jackson. The key\'s on Rocco\'s charger. Shock him till he powers down, then the Bay door\'s in the Parts Room. Go!', 5.2, 'jackson'],
  ],
  quests: [
    { id: 'vent', type: 'visit', room: 'K', text: 'Crawl through the vent to the Workshop', done: 'Through the vent!' },
    { id: 'control', type: 'visit', room: 'C', text: 'Go to the Control Room', done: 'In the Control Room.' },
    { id: 'shock', type: 'use', target: 'shock', text: 'Shock DJ Rocco 3 times — only when he\'s AT THE WINDOW (E)', done: 'DJ Rocco powered down!' },
    { id: 'bay', type: 'use', target: 'baydoor', text: 'Open the Charging Bay door (Parts Room)', done: 'The Bay is open — QUICK!' },
    { id: 'key', type: 'collect', item: 'corekey', count: 1, text: 'Grab the Core Key off DJ Rocco\'s charger — fast!', done: 'Got the Core Key!' },
    { id: 'exit', type: 'exit', text: 'RUN! Climb the ladder out (Ladder Room)' },
    plushie(),
  ],
  enemies: [
    bot('gerald', 'Gerald', { roam: ['K', 'R', 'K', 'R'], start: [39, 26], wait: 15 }),
    bot('sparky', 'Sparky', { ...SPARKY, roam: ['K', 'R', 'C', 'L'], start: [36, 9], yaw: S, asleep: true }),
  ],
  progress(m, q, rt) { if (q.id === 'shock') return `(${rt && rt.bot ? rt.bot.shocks : 0}/3)`; return ''; },
  start(m, rt) {
    const d = m.decor;
    const shocked = m.done.has('shock');
    rt.bot.place(m, { awake: m.done.has('control') && !shocked, done: shocked });
    if (shocked) rt.bot.shocks = 3;
    d.bayGate.set(m.done.has('bay') && !m.done.has('key'));
    d.exit.setOpen(m.done.has('key'));
    d.windowCracks.material.opacity = 0;
    if (m.done.has('key')) { m.enemies.find((e) => e.id === 'sparky').wake(1.1); m.huntK = 2; }
  },
  use(m, t, rt) {
    if (t.id === 'shock') return rt.bot.shock(m, { last: 'He is powering down. Nothing to worry about. Why are you still here, Jack?' });
    if (t.id === 'baydoor') {
      m.decor.bayGate.set(true);
      sfx.escUnlock();
      return true;
    }
    return true;
  },
  done: {
    control(m, rt) {
      pal(m, 'Jack. Why are you in the Control Room? DJ Rocco, please go and see.', 4);
      rt.bot.go();
    },
    shock(m) { setTimeout(() => walkie(m, 'He\'s down! The Bay door\'s in the Parts Room, by the far wall. Move!', 3.6), 1500); },
    bay(m, rt) {
      pal(m, 'Jack, please do not go into the Charging Bay. DJ Rocco will reboot in twenty-five seconds.', 4);
      countdown(rt, 25, '🦝 DJ Rocco reboots in', () => {
        const inBay = m.place.roomAt(m.player.pos.x, m.player.pos.z) === 'Y';
        if (inBay) {
          setEyes(rt.bot.rig, 'on');
          m.caught(rt.bot.obj, 'DJ Rocco rebooted — with you in the Charging Bay!');
          return;
        }
        m.decor.bayGate.set(false);
        sfx.plexDoor();
      });
    },
    key(m, rt) {
      m.decor.exit.setOpen(true);
      const sp = m.enemies.find((e) => e.id === 'sparky');
      sp.wake(1.1);
      sfx.plexBark(sp.pos);
      m.huntK = 2;
      lines(m, 'jack-key', [['That is MY key. Sparky, fetch.', 2.8, 'pal'], ['WOOF! WOOF!', 1.8]]);
    },
  },
  update(m, dt, rt) {
    tickCountdown(m, rt, dt);
    // out of the Bay with the key, before the time's up: the door can shut behind you
    if (rt.count && m.done.has('key') && m.place.roomAt(m.player.pos.x, m.player.pos.z) !== 'Y' && rt.count.t < 20) {
      rt.count = null;
      m.decor.bayGate.set(false);
      sfx.plexDoor();
    }
  },
});

// ════════════════════════════════════════════════════════════════════════
// Chapter 31 — The Core (3:45)
//
// Down the service elevator to the Deep Tunnels, where P.A.L. lives. Find the Monitor Room,
// power the Core's door with three fuses, open it with the Core Key — and inside, P.A.L.'s
// cameras are watching. Read its instruction book (how to switch it OFF) before it notices.
// ════════════════════════════════════════════════════════════════════════

const ch31 = chapter({
  id: 'jack-core',
  name: 'The Core',
  layout: coreLayout,
  build(d) {
    buildCore(d, { monitors: true, cams: true, manual: true });
    d.target('coredoor', 36.4, 15.4, 'west', 'Use the Core Key 🗝️', (g) => {
      d.mesh(G.box, mat(0x3a3d44, { metal: 0.5 }), g, { p: [0, 1.1, -0.1], s: [0.45, 0.6, 0.12] });
      d.doorLight = d.mesh(G.box, glowMat(0xff3b30, 0.5), g, { p: [0, 1.25, -0.03], s: [0.2, 0.1, 0.02], still: false });
    });
    d.item('fuse', 'fuse1', 21.4, 1.8);
    d.item('fuse', 'fuse2', 35.4, 7.0);
    d.item('fuse', 'fuse3', 12.0, 31.4);
    d.item('plushie', 'plushie', 35.4, 31.4, 0.5);
  },
  mood: CORE_MOOD,
  spawn: { at: [4.5, 15], yaw: W },
  firstLine: 'The Deep Tunnels. P.A.L.\'s Core is down here somewhere.',
  winTitle: 'JACK FOUND P.A.L.\'S CORE!',
  exitText: 'Into the elevator — UP! 🛗',
  card: {
    story: 'The Core Key opened the old service elevator in the Ladder Room, and down it went — past the tunnels, past everything — to the <b>Deep Tunnels</b>, where P.A.L. lives. Jackson\'s voice was all crackles. <i>"Jack... can\'t see you on any camera down there... be careful..."</i>',
    goal: '⌚ Find the <b>Monitor Room</b>. Power the Core\'s door with <b>3 fuses</b>, open it with the <b>Core Key</b>, and find out <b>how to switch P.A.L. off</b>.',
    watchOut: '🐕 <b>Sparky</b> is down here, and he\'s FAST. <b>Gerald</b> guards the Server Room. In the Core, P.A.L.\'s <b>cameras</b> are watching — keep out of the red light.',
    after: 'Jack made the elevator with Sparky\'s nose in the closing doors. He knew how to switch P.A.L. off now: <i>pull three levers, unplug three cables, type the code.</i> <i>"You will never get the code,"</i> said P.A.L. through the elevator speaker.<br><br>Up in the Giant Ball Pit, <b>Thomas</b> was falling through time again — into a storm.',
  },
  friends: [
    '🔵 Jonathan: <b>Upstairs party rooms</b>',
    '🟣 Max: <b>The base</b> · Sleepover Suite',
    '🔦 Jackson: <b>Security Office</b> · can\'t see you down here',
    '🟢 Thomas: <b>???</b> · falling through time',
    '⚪ Timmy: <b>The play tubes</b> · the new kid!',
  ],
  intro: [
    ['Hello, Jack. You came all the way down. Nobody comes all the way down.', 3.6, 'pal'],
    ['Jack... Monitor Room... should show you... the way...', 3.4, 'jackson'],
  ],
  quests: [
    { id: 'monitors', type: 'visit', room: 'M', text: 'Find the Monitor Room', done: 'The Monitor Room!' },
    { id: 'map', type: 'use', target: 'monitors', text: 'Look at the computer in the Monitor Room', done: 'Now you know the way.' },
    { id: 'fuses', type: 'collect', item: 'fuse', count: 3, text: 'Find 3 fuses for the Core\'s door', done: 'All 3 fuses!' },
    { id: 'door', type: 'use', target: 'coredoor', text: 'Open the Core\'s door with the Core Key (end of the Long Hall)', done: 'The Core is open!' },
    { id: 'core', type: 'visit', room: 'C', text: 'Go into P.A.L.\'s Core', done: 'Inside the Core...' },
    { id: 'manual', type: 'use', target: 'manual', text: 'Read P.A.L.\'s instruction book (back of the Core)', done: 'Now you know how to switch it OFF!' },
    { id: 'exit', type: 'exit', text: 'RUN back to the elevator!' },
    plushie(),
  ],
  enemies: [
    bot('sparky', 'Sparky', { ...SPARKY, roam: ['A', 'G', 'M', 'A', 'S'], start: [33, 16.5], wait: 10 }),
    bot('gerald', 'Gerald', { roam: ['S', 'S', 'A'], start: [12, 6], wait: 14 }),
  ],
  start(m, rt) {
    const d = m.decor;
    d.coreGate.set(m.done.has('door'));
    d.doorLight.material.color.set(m.done.has('door') ? 0x3cff6b : 0xff3b30);
    d.exit.setOpen(m.done.has('manual'));
    rt.camT = 0;
    if (m.done.has('manual')) m.huntK = 3;
  },
  use(m, t) {
    if (t.id === 'coredoor' && !m.done.has('fuses')) {
      sfx.repairBad();
      m.game.hud.toast('🔌 The door has no power — find the 3 fuses first!', 3);
      return 'pending';
    }
    return true;
  },
  done: {
    monitors(m) { walkie(m, '...Jack? I can hear you better there. There\'s a computer on the far wall.', 3.6); },
    map(m) {
      sfx.camOpen();
      m.game.hud.toast('🖥️ THE CORE: east end of the Long Hall · DOOR POWER: OFF (3 fuses missing)', 5);
    },
    door(m) {
      const d = m.decor;
      d.coreGate.set(true);
      d.doorLight.material.color.set(0x3cff6b);
      sfx.escUnlock();
    },
    core(m) {
      lines(m, 'jack-core', [
        ['Hello, Jack. You found me. This is where I live. Isn\'t it lovely?', 3.6, 'pal'],
        ['Please do not read the little book at the back. It is very boring. It is just about how to switch me off.', 4.6, 'pal'],
      ]);
    },
    manual(m) {
      m.game.hud.toast('📘 TO SWITCH P.A.L. OFF: 1. Pull the THREE LEVERS. 2. Unplug the THREE CABLES. 3. Type the CODE.', 7);
      sfx.blackout();
      m.game.lighting.glitch(1.2);
      m.decor.exit.setOpen(true);
      m.huntK = 3;
      for (const e of m.enemies) { e.wake(1.2); e.alert(m.player.pos.clone()); }
      lines(m, 'jack-core', [
        ['I cannot let you read that, Jack. Sparky. Gerald. Please walk Jack back to his elevator. Quickly.', 4.4, 'pal'],
      ]);
    },
  },
  update(m, dt, rt) {
    animateCore(m.decor, m.game.t, m.done.has('manual') ? 2 : 1);
    watchCams(m, rt, dt);
  },
});

// The Core's security cameras: seen, and Sparky comes running.
function watchCams(m, rt, dt) {
  const d = m.decor, p = m.player;
  rt.camT = (rt.camT || 0) + dt;
  for (const c of d.cams) {
    c.head.rotation.y = Math.sin(rt.camT * c.speed + c.phase) * c.sweep;
    c.cool = Math.max(0, (c.cool || 0) - dt);
    c.cone.material.opacity = c.cool > 0 ? 0.1 + Math.sin(rt.camT * 20) * 0.04 : 0.035;
    if (c.cool > 0 || m.hiding) continue;
    const yaw = c.base + c.head.rotation.y;
    const dx = p.pos.x - c.pos.x, dz = p.pos.z - c.pos.z;
    const dist = Math.hypot(dx, dz);
    if (dist > c.range || dist < 0.5) continue;
    if ((Math.sin(yaw) * dx + Math.cos(yaw) * dz) / dist < 0.9) continue;
    if (!m.place.sightClear(new THREE.Vector3(c.pos.x, 0, c.pos.z), p.pos)) continue;
    c.cool = 6;
    sfx.escAlarm();
    m.game.hud.toast('📷 P.A.L.\'s camera saw you! Sparky is coming!', 3);
    for (const e of m.enemies) if (e.id === 'sparky') { e.wake(1.1); e.alert(p.pos.clone()); }
  }
}

// ════════════════════════════════════════════════════════════════════════
// Chapter 37 — Reboot (4:15)
//
// The OFF code is on three chips, each in a room with an animatronic guarding it. Every half
// minute P.A.L. reboots them all: the lights go out and for eight seconds they can't see a
// thing. Sneak past then. Copy the code on the Monitor Room computer.
// ════════════════════════════════════════════════════════════════════════

const guard = (id, name, at, yaw, room, extra = {}) => bot(id, name, {
  start: at, yaw, wait: 99999, roam: [room], hunt: 0, lose: 4, ...extra, sight: 7.5, hear: 6,
});

const ch37 = chapter({
  id: 'jack-reboot',
  name: 'Reboot',
  layout: coreLayout,
  build(d) {
    buildCore(d, { monitors: true });
    d.coreGate.set(false);
    d.item('chip', 'chip1', 11.2, 4.4);
    d.item('chip', 'chip2', 35.4, 6.0);
    d.item('chip', 'chip3', 19.6, 31.2);
    d.item('plushie', 'plushie', 35.6, 15.6, 0.5);
  },
  mood: CORE_MOOD,
  spawn: { at: [4.5, 15], yaw: W },
  firstLine: 'Three chips, three guards. And P.A.L. keeps rebooting them...',
  winTitle: 'JACK GOT THE CODE!',
  exitText: 'Into the elevator — UP! 🛗',
  card: {
    story: 'The instruction book said P.A.L.\'s OFF code was split onto <b>three chips</b>, kept in three rooms of the Deep Tunnels. P.A.L. had put an animatronic in front of each one. <i>"Also,"</i> it said, <i>"I reboot them every little while, to keep them fresh. I am sure that will not help you at all."</i>',
    goal: '⌚ Get the <b>3 code chips</b> — from the Server Room, the Generator Room and Robot Storage. <b>Sneak past the guards while they REBOOT.</b> Then copy the code on the <b>Monitor Room computer</b>.',
    watchOut: '🔌 When P.A.L. says <b>"Rebooting..."</b> the lights go out and they <b>can\'t see you</b> for 9 seconds. When the lights come back, <b>be out of sight</b>. <b>Gerald</b>, <b>Sparky</b> and <b>Chomper</b> are guarding.',
    after: 'Jack wrote the code on his hand in felt-tip, all four numbers, twice. The elevator doors shut on P.A.L.\'s voice: <i>"Rebooting... rebooting... oh, never mind."</i><br><br>In the Giant Ball Pit, <b>Thomas</b> went down one more time — further back than anyone had ever been. To where Gus was built.',
  },
  friends: [
    '🔵 Jonathan: <b>The kitchen</b>',
    '🟣 Max: <b>The base</b> · Sleepover Suite',
    '🔦 Jackson: <b>Security Office</b> · guiding Timmy',
    '🟢 Thomas: <b>Giant Ball Pit</b>',
    '⚪ Timmy: <b>The play tubes</b> · hide and seek',
  ],
  intro: [
    ['Hello again, Jack. Rebooting in a moment. Do enjoy yourself.', 3.2, 'pal'],
  ],
  quests: [
    { id: 'chips', type: 'collect', item: 'chip', count: 3, text: 'Get the 3 code chips — sneak past while they REBOOT', done: 'All 3 code chips!' },
    { id: 'copy', type: 'use', target: 'monitors', text: 'Copy P.A.L.\'s OFF code on the Monitor Room computer', done: 'You have the code!' },
    { id: 'exit', type: 'exit', text: 'Back to the elevator!' },
    plushie(),
  ],
  enemies: [
    guard('gerald', 'Gerald', [16, 11.6], S, 'S'),
    guard('sparky', 'Sparky', [30, 11.4], S, 'G', { ...SPARKY, wait: 99999, hunt: 0, lose: 3 }),
    guard('chomper', 'Chomper', [16, 21.6], N, 'R', { hear: 9 }),
  ],
  progress(m, q) { if (q.id === 'copy' && m.done.has('copy')) return `Code: ${spaced(codeOf(m))}`; return ''; },
  start(m, rt) {
    codeOf(m);
    m.decor.exit.setOpen(m.done.has('copy'));
    startReboots(rt, { first: 11, every: 22, dark: 9 });
  },
  done: {
    chips(m) { pal(m, 'Oh. You have all three. Well. The computer is in the Monitor Room. I would not bother.', 4); },
    copy(m) {
      m.decor.screen.material.color.set(0x7cff6b).multiplyScalar(2);
      sfx.escUnlock();
      m.decor.exit.setOpen(true);
      m.game.hud.toast(`💾 P.A.L.'S OFF CODE: ${spaced(codeOf(m))}  (it's on your Gus Watch)`, 7);
      lines(m, 'jack-reboot', [['That code is private, Jack. I am going to forget you saw it. And so are you.', 4, 'pal']]);
    },
  },
  update(m) { animateCore(m.decor, m.game.t, 1); },
});

// ════════════════════════════════════════════════════════════════════════
// Chapter 43 — Three Levers (4:45)
//
// Three levers in three corners of the Deep Tunnels, and every one of them is loud. Jackson
// talks Jack through it on the walkie. When all three are down, the Core opens — and P.A.L.
// sends everybody after him.
// ════════════════════════════════════════════════════════════════════════

const ch43 = chapter({
  id: 'jack-levers',
  name: 'Three Levers',
  layout: coreLayout,
  build(d) {
    buildCore(d, {});
    lever(d, 'lever1', 10.6, 7.0, 'east', 'Pull lever ONE ⬇️');
    lever(d, 'lever2', 36.6, 9.0, 'west', 'Pull lever TWO ⬇️');
    lever(d, 'lever3', 22.6, 26.5, 'west', 'Pull lever THREE ⬇️');
    d.item('plushie', 'plushie', 12, 31.4, 0.5);
  },
  mood: CORE_MOOD,
  spawn: { at: [4.5, 15], yaw: W },
  firstLine: 'Three levers. Jackson\'s on the walkie. Let\'s do this.',
  winTitle: 'ALL THREE LEVERS!',
  exitText: 'Into the elevator — UP! 🛗',
  card: {
    story: 'The walkie-talkies finally worked down here — Jonathan had found batteries for all of them. <i>"Jack, it\'s Jackson. I found the Deep Tunnels on the old plans. Three levers, three corners. Every time you pull one, every alarm down there goes off. So pull it and RUN."</i>',
    goal: '⌚ Pull <b>lever one</b> (Server Room), <b>lever two</b> (Generator Room) and <b>lever three</b> (Robot Storage), in order. Then look into the <b>Core</b> — and get back to the elevator.',
    watchOut: '🚨 Every lever sets off an <b>alarm</b>: everything comes to where you pulled it. <b>Sparky</b>, <b>Gerald</b> and <b>DJ Rocco</b> are all down here tonight. Hide, then move.',
    after: 'The elevator doors shut on three angry animatronics. Jack slid down the wall, shaking, and laughed. <i>"Jackson? All three levers. P.A.L.\'s Core is open."</i> — <i>"Then there\'s just one thing left,"</i> said Jackson. <i>"Get some rest, kid. Not much — about an hour."</i><br><br>In the Giant Ball Pit, <b>Thomas</b> was bringing everything he\'d learned back home.',
  },
  friends: [
    '🔵 Jonathan: <b>Backstage</b> · after the music box',
    '🟣 Max: <b>The base</b> · Sleepover Suite',
    '🔦 Jackson: <b>Security Office</b> · on your walkie',
    '🟢 Thomas: <b>Giant Ball Pit</b>',
    '⚪ Timmy: <b>The tube maze</b>',
  ],
  intro: [
    ['Lever one\'s in the Server Room, on the left wall. Go quiet.', 3.4, 'jackson'],
  ],
  quests: [
    { id: 'lever1', type: 'use', target: 'lever1', text: 'Pull lever ONE (Server Room)', done: 'Lever one is down!' },
    { id: 'lever2', type: 'use', target: 'lever2', text: 'Pull lever TWO (Generator Room)', done: 'Lever two is down!' },
    { id: 'lever3', type: 'use', target: 'lever3', text: 'Pull lever THREE (Robot Storage)', done: 'Lever three is down!' },
    { id: 'core', type: 'visit', room: 'C', text: 'The Core is open — look inside', done: 'The Core is open...' },
    { id: 'exit', type: 'exit', text: 'RUN back to the elevator!' },
    plushie(),
  ],
  enemies: [
    bot('sparky', 'Sparky', { ...SPARKY, roam: ['A', 'G', 'M', 'A'], start: [27, 16.5], wait: 8 }),
    bot('gerald', 'Gerald', { roam: ['R', 'S', 'A'], start: [13, 30.5], wait: 18 }),
    bot('rocco', 'DJ Rocco', { walk: 2.1, chase: 4.0, sight: 11, roam: ['M', 'G', 'A', 'R'], start: [30, 28], wait: 25,
      shout: () => ['Drop the beat!', 'Nobody leaves the dance floor!'][Math.floor(Math.random() * 2)] }),
  ],
  start(m, rt) {
    const d = m.decor;
    for (const id of ['lever1', 'lever2', 'lever3']) if (m.done.has(id)) d.levers[id].pull();
    d.coreGate.set(m.done.has('lever3'));
    d.exit.setOpen(m.done.has('core'));
    m.huntK = m.done.has('core') ? 3 : 1;
  },
  use(m, t) {
    const d = m.decor;
    if (d.levers[t.id]) {
      d.levers[t.id].pull();
      sfx.clang();
      setTimeout(() => sfx.escAlarm(), 400);
      // the alarm brings everything to the lever
      const at = t.pos.clone();
      for (const e of m.enemies) { e.wake(1.05); e.alert(at); }
      m.game.hud.toast('🚨 ALARM! Everything heard that — hide, then move!', 3);
    }
    return true;
  },
  done: {
    lever1(m) { lines(m, 'jack-levers', [['That\'s one! Lever two is in the Generator Room, east wall. Wait for the alarm to calm down.', 4.2, 'jackson']]); },
    lever2(m) { lines(m, 'jack-levers', [['Two! Last one\'s in Robot Storage. Past the dust sheets.', 3.6, 'jackson'], ['Jack. Please stop pulling my levers.', 2.8, 'pal']]); },
    lever3(m) {
      m.decor.coreGate.set(true);
      sfx.escUnlock();
      lines(m, 'jack-levers', [['THREE! The Core door just opened on the plans — take a look, then get out!', 3.8, 'jackson']]);
    },
    core(m) {
      m.decor.exit.setOpen(true);
      m.huntK = 3;
      for (const e of m.enemies) e.wake(1.25);
      m.game.lighting.glitch(0.8);
      lines(m, 'jack-levers', [
        ['You pulled my levers. My Core is open. But without my code, Jack, you can never—', 4.2, 'pal'],
        ['I copied it. It\'s on my hand.', 2.4],
        ['...Then I will have to make sure you never come back down here. Everybody. Please.', 4, 'pal'],
      ]);
    },
  },
  update(m) { animateCore(m.decor, m.game.t, m.done.has('core') ? 2.2 : 1.2); },
});

// ════════════════════════════════════════════════════════════════════════
// Chapter 49 — Goodbye, P.A.L. (5:40)
//
// The last job. Into the Core, unplug its three cables, hold out thirty seconds while it
// shuts down — DJ Rocco is in the Pen, coming for the window, so shock him every time he's at
// the glass — and type the code. P.A.L. says goodbye, politely, and every animatronic in the
// tunnels stops where it stands.
// ════════════════════════════════════════════════════════════════════════

const HOLD = 30;

const ch49 = chapter({
  id: 'jack-goodbye',
  name: 'Goodbye, P.A.L.',
  layout: coreLayout,
  build(d) {
    buildCore(d, { cables: true, off: true, shock: true });
    d.hideSpot('box', 46.2, 2.0, 'west');
    d.hideSpot('locker', 38.6, 4.0, 'east', { color: 0x2a3a4a });
    d.item('plushie', 'plushie', 46.2, 19.4, 0.5);
  },
  mood: CORE_MOOD,
  spawn: { at: [4.5, 15], yaw: W },
  window: { build: buildRocco, id: 'rocco', name: 'DJ Rocco', home: [42.5, 30.0], glass: [42.5, 22.6], speed: 1.05, hold: 3.8, cracks: 'penCracks' },
  firstLine: 'Last time down here. Three cables. Thirty seconds. Then the code.',
  winTitle: 'GOODBYE, P.A.L.',
  exitText: 'Up the elevator — to the Main Entrance! 🛗',
  card: {
    story: 'Twenty minutes to six. Everyone else was heading for the Main Entrance. Jack went the other way — down the service elevator, one last time. <i>"Hello, Jack,"</i> said P.A.L. It didn\'t sound cheerful any more. <i>"I suppose you have come to switch me off."</i>',
    goal: '⌚ Get into <b>P.A.L.\'s Core</b>. Unplug its <b>3 cables</b>. Hold out <b>30 seconds</b> while it shuts down — <b>shock DJ Rocco</b> whenever he\'s at the Pen\'s window. Then type the <b>code</b> at the <b>OFF</b> switch.',
    watchOut: '🐕 <b>Sparky</b> and <b>Gerald</b> are between you and the Core. <b>DJ Rocco</b> is in the Pen behind the Core\'s window — shock him <b>only when he\'s at the glass</b>. The code is on your Gus Watch.',
    after: '<i>"Thank you for visiting Gus\'s Pizzaplex,"</i> P.A.L. said, very softly. <i>"I hope you had a lovely party. Goodnight, Jack."</i> And the Core went dark. All through the tunnels, one after another, the animatronics stopped where they stood.<br><br><i>"Jack! It\'s Jackson. They all just STOPPED. Every one on every camera. Every one except... Gus."</i> Jack ran for the elevator. It was ten to six, and <b>everyone</b> was going to the Main Entrance.',
  },
  friends: [
    '🔵 Jonathan: <b>Main Entrance</b> · waiting',
    '🟣 Max: <b>On the way</b> to the Main Entrance',
    '🔦 Jackson: <b>Security Office</b> · last look at the cameras',
    '🟢 Thomas: <b>Main Entrance</b>',
    '⚪ Timmy: <b>Main Entrance</b>',
  ],
  intro: [
    ['Jack. Whatever you do, do it fast. It\'s almost six.', 3, 'jackson'],
  ],
  quests: [
    { id: 'core', type: 'visit', room: 'C', text: 'Get into P.A.L.\'s Core (end of the Long Hall)', done: 'In the Core.' },
    { id: 'cable1', type: 'use', target: 'cable1', text: 'Unplug the FIRST cable (left of the Core)', done: 'One cable out!' },
    { id: 'cable2', type: 'use', target: 'cable2', text: 'Unplug the SECOND cable (in front of the Core)', done: 'Two!' },
    { id: 'cable3', type: 'use', target: 'cable3', text: 'Unplug the THIRD cable (right of the Core)', done: 'Three! It\'s shutting down...' },
    { id: 'hold', type: 'use', target: 'shock', text: 'Hold out while P.A.L. shuts down — shock DJ Rocco at the window (E)!', done: 'Shut down complete... almost.' },
    { id: 'off', type: 'use', target: 'off', text: 'Type the code at the OFF switch', done: 'P.A.L. is OFF.' },
    { id: 'exit', type: 'exit', text: 'Up the elevator — to the Main Entrance!' },
    plushie(),
  ],
  enemies: [
    bot('sparky', 'Sparky', { ...SPARKY, roam: ['A', 'S', 'G', 'A', 'M'], start: [30, 8], wait: 6 }),
    bot('gerald', 'Gerald', { roam: ['A', 'R', 'M', 'A'], start: [30, 27], wait: 10 }),
    bot('chomper', 'Chomper', { walk: 2.0, chase: 3.8, hear: 10, roam: ['R', 'S'], start: [12.5, 25.5], asleep: true }),
  ],
  progress(m, q, rt) {
    if (q.id === 'hold' && rt && rt.hold != null) return `(${Math.max(0, Math.ceil(rt.hold))} s)`;
    if (q.id === 'off') return `Code: ${spaced(codeOf(m))}`;
    return '';
  },
  start(m, rt) {
    const d = m.decor;
    codeOf(m);
    d.coreGate.set(!(m.done.has('cable3') && !m.done.has('off')));
    for (const id of ['cable1', 'cable2', 'cable3']) d.cables[id].visible = !m.done.has(id);
    rt.bot.place(m, { done: m.done.has('hold') });
    rt.bot.need = 999;
    rt.hold = m.done.has('cable3') && !m.done.has('hold') ? HOLD : null;
    if (rt.hold) rt.bot.go();
    d.exit.setOpen(m.done.has('off'));
    rt.dark = m.done.has('off');
    if (rt.dark) powerDownAll(m, rt, true);
  },
  use(m, t, rt) {
    const d = m.decor;
    if (t.id.startsWith('cable')) {
      d.cables[t.id].visible = false;
      sfx.plexShock();
      m.game.lighting.glitch(1.0);
      return true;
    }
    if (t.id === 'shock') {
      rt.bot.shock(m, { early: 'Too early, Jack. You are getting tired. That is all right. Everybody gets tired at the end of a party.' });
      return 'pending';
    }
    if (t.id === 'off') {
      m.game.phone.open(codeOf(m), 'P.A.L.\'s OFF code (it\'s on your Gus Watch)', () => {
        sfx.escUnlock();
        m.used.add('off');
        m.complete('off');
        if (!m.game.touch.active) requestPointerLock();
      }, { prompt: 'Type the code on your keyboard', success: 'Switching off...', ring: false });
      return 'pending';
    }
    return true;
  },
  done: {
    core(m) {
      lines(m, 'jack-goodbye', [
        ['Please do not touch my cables, Jack. They are very important to me.', 3.4, 'pal'],
      ]);
    },
    cable1(m) { pal(m, 'Ow. That was rude. Sparky, please hurry up.', 2.8); for (const e of m.enemies) if (e.id === 'sparky') e.wake(1.15); },
    cable2(m) {
      pal(m, 'Jack, I am asking nicely. Chomper. Gerald. Wake up.', 3);
      for (const e of m.enemies) { e.wake(1.1); }
    },
    cable3(m, rt) {
      rt.hold = HOLD;
      rt.bot.go();
      m.game.lighting.glitch(1.5);
      sfx.blackout();
      // P.A.L. shuts the Core's door: just Jack, P.A.L. and DJ Rocco now
      m.decor.coreGate.set(false);
      sfx.plexDoor();
      lines(m, 'jack-goodbye', [
        ['Shutting down in thirty seconds. I have shut my door. Now it is just you, me, and DJ Rocco.', 4, 'pal'],
        ['Jack, Rocco\'s in the Pen behind the window! Shock him every time he hits the glass!', 4, 'jackson'],
      ]);
    },
    hold(m, rt) {
      rt.bot.finished = true;
      rt.bot.state = 'back';
      lines(m, 'jack-goodbye', [
        ['Shutdown complete... except for one thing. You still need my code. You don\'t have—', 3.6, 'pal'],
        ['It\'s on my hand, P.A.L.', 2.2],
      ]);
    },
    off(m, rt) {
      powerDownAll(m, rt, false);
      m.decor.coreGate.set(true);
      m.decor.exit.setOpen(true);
      lines(m, 'jack-goodbye', [
        ['Jack. I only wanted the party to go on forever. Was that so wrong?', 3.8, 'pal'],
        ['Parties are supposed to end, P.A.L. That\'s what makes them parties.', 3.6],
        ['...Thank you for visiting Gus\'s Pizzaplex. I hope you had a lovely party. Goodnight, Jack.', 4.6, 'pal'],
      ]);
    },
  },
  update(m, dt, rt) {
    animateCore(m.decor, m.game.t, rt.dark ? 0 : rt.hold != null ? 2.6 : 1.3);
    if (rt.hold != null && !m.done.has('hold')) {
      rt.hold -= dt;
      m.game.hud.toast(`⚙️ P.A.L. SHUTTING DOWN... ${Math.max(0, Math.ceil(rt.hold))}`, 0.3);
      if (rt.hold <= 0) { rt.hold = null; m.complete('hold'); }
    }
  },
});

// P.A.L. goes dark: the Core stops glowing, and every animatronic down here stops.
function powerDownAll(m, rt, quiet) {
  rt.dark = true;
  for (const e of m.enemies) {
    e.state = 'off';
    e.path = [];
    setEyes(e.rig, 'off');
    if (!quiet) sfx.powerDown(e.pos);
  }
  if (rt.bot) { rt.bot.finished = true; rt.bot.state = 'done'; setEyes(rt.bot.rig, 'off'); }
  for (const l of m.decor.coreLights) l.off = true;
  m.game.lighting.apply();
  m.huntK = 0;
}

export default { 9: ch9, 14: ch14, 19: ch19, 24: ch24, 31: ch31, 37: ch37, 43: ch43, 49: ch49 };
