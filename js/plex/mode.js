// Lost in the Pizzaplex: the night five people got lost in Gus's brand-new Pizzaplex, six
// years before Gus's PlayPlace. Fifty chapters (the designer's number), and every chapter
// you're somebody else — Jonathan, Max, Jackson, Jack, Thomas, and from Chapter 27 Timmy —
// each playing like a different game (see DESIGN.md).
//
// It runs on When Jonathan Was Five's engine (js/escape/mode.js): the chapter list, story
// cards, quests on the Gus Watch, save boxes, hiding, getting caught, winning. On top of
// that it adds who you are in each chapter (heroes.js), and the chapters where you don't
// walk about at all: Max's bedroom (bedroom.js) and Jackson's office (office.js).
import { EscapeMode } from '../escape/mode.js';
import { ENTITY } from '../escape/watch.js';
import { makePerson } from '../cutscene.js';
import { CHAPTERS, TOTAL, whoPlays } from './chapters/index.js';
import { HEROES } from './heroes.js';
import { buildJonathan9, buildMax, buildJack10, buildThomas, buildJackson, buildKid } from './cast.js';
import { buildTimmy } from '../models.js';
import { PLEX_STORY } from './story.js';
import { clearTubes } from './timmy/tubes.js';

const $ = (id) => document.getElementById(id);

Object.assign(ENTITY, {
  cranker: ['🐧', 'Cranker'], chomper: ['🦫', 'Chomper'], gerald: ['🦍', 'Gerald'], flipper: ['🐬', 'Flipper'],
  gus: ['🎩', 'Gus'], oldgus: ['🎩', 'Old Gus'], rocco: ['🦝', 'DJ Rocco'], sparky: ['🐕', 'Sparky'],
  timmy: ['⚪', 'Timmy'], babygus: ['🍼', 'Baby Gus'],
  oldcranker: ['🐧', 'Old Cranker'], oldchomper: ['🦫', 'Old Chomper'], oldgerald: ['🦍', 'Old Gerald'], oldflipper: ['🐬', 'Old Flipper'],
});

const PLEX = {
  key: 'plex', levels: CHAPTERS, total: TOTAL, area: 'plex', offsetZ: 400, unit: 'Chapter',
  buddy: null, box: false, plex: true, heroes: HEROES,
  eyebrow: 'LOST IN THE PIZZAPLEX',
  menu: {
    eyebrow: 'SIX YEARS BEFORE GUS\'S PLAYPLACE',
    title: 'LOST IN THE<span>PIZZAPLEX</span>',
    brief: 'The night Jonathan, Max, Jack, Thomas and Jackson the night guard got lost in Gus\'s brand-new <b>Pizzaplex</b>. Every chapter you\'re somebody else — and every one of them plays a different way.',
  },
  resumeLine: 'Back at the save box. Okay... keep going.',
  againText: '▶ Play it again',
  finale: 'plexFinale', secret: null,
  soon: (n) => {
    const who = whoPlays(n);
    if (n === 50) return '⭐ The great escape';
    if (n === 27) return '⚪ Timmy appears...';
    return who ? `${HEROES[who]?.icon || '⚪'} coming soon` : 'Coming soon';
  },
};

export class PlexMode extends EscapeMode {
  constructor(game) {
    super(game, PLEX);
    this.useClock = 0;
  }

  // Fifty chapters is a lot of buildings to keep around. Only the last few you played stay
  // built; older ones are taken down and built again if you go back to them.
  build(n) {
    const had = this.built.has(n);
    const lv = super.build(n);
    lv.lastUsed = ++this.useClock;
    if (!had) this.evict(lv);
    return lv;
  }

  evict(keep) {
    const MAX = 6;
    const g = this.game;
    const old = [...this.built.values()].filter((l) => l !== keep && l !== this.level).sort((a, b) => a.lastUsed - b.lastUsed);
    while (this.built.size > MAX && old.length) {
      const l = old.shift();
      const gone = new Set();
      for (const grp of [l.place.group, l.decor.group]) { g.scene.remove(grp); grp.traverse((o) => gone.add(o)); }
      for (const e of l.enemies) g.scene.remove(e.root);
      // whatever a chapter's controller (Max's room, Jackson's office) added to the scene
      if (l.ctrl) {
        for (const v of Object.values(l.ctrl)) {
          for (const x of Array.isArray(v) ? v : [v]) if (x && x.root && x.root.isObject3D && x.root.parent === g.scene) g.scene.remove(x.root);
        }
      }
      if (g.graphics.hidden) g.graphics.hidden = g.graphics.hidden.filter((o) => !gone.has(o));
      delete g.areas[this.areaName(l.n)];
      this.built.delete(l.n);
    }
  }

  // The people in the cutscenes, and on Jackson's cameras.
  makeCast() {
    const sc = this.game.scene;
    const person = (name, build) => Object.assign(makePerson(sc, build), { name });
    const p = this.people = {
      jonathan: person('Jonathan', buildJonathan9),
      max: person('Max', buildMax),
      jack: person('Jack', buildJack10),
      thomas: person('Thomas', buildThomas),
      jackson: person('Jackson', buildJackson),
      timmy: person('Timmy', buildTimmy),
    };
    let seed = 5;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    p.kids = [0, 1, 2, 3].map(() => person('', () => buildKid(rnd)));
    p.list = [p.jonathan, p.max, p.jack, p.thomas, p.jackson, p.timmy, ...p.kids];
    return p.list;
  }

  actor(who) {
    if (!this.inStory) return null;
    const p = this.people;
    return { Jonathan: p.jonathan, Max: p.max, Jack: p.jack, Thomas: p.thomas, Jackson: p.jackson, Timmy: p.timmy }[who] || null;
  }

  // Who you are in this chapter: their height, speed and hands.
  setupHero(p, def) {
    const h = HEROES[def.hero] || HEROES.jonathan;
    p.kid = def.hero !== 'jackson' && def.hero !== 'john';
    p.sizes = h.sizes;
    p.vmBuild = h.hands;
  }

  // Two playing: player 1 is whoever the chapter's about (the designer's call), and that's
  // who Jimmy sees.
  heroBody(def) {
    const id = HEROES[def.hero] ? def.hero : 'jonathan';
    const build = { jonathan: buildJonathan9, max: buildMax, jack: buildJack10, thomas: buildThomas, jackson: buildJackson, timmy: buildTimmy }[id] || buildJonathan9;
    return ['plex-' + id, build];
  }

  heroName(def) {
    const h = HEROES[def.hero] || HEROES.jonathan;
    return [h.name, h.icon];
  }

  // In the Pizzaplex you're on your own, so whatever's said is said by you.
  speaker() { return this.level ? (HEROES[this.def.hero] || HEROES.jonathan).name : ''; }

  // The Gus Watch's tracker: where everybody else got lost (as far as you know).
  friendLines() { return (this.def.friends || []).map((t) => `<div class="gw-bot">${t}</div>`); }

  // The chapters' clocks run from midnight to 1 AM, not all night.
  timeText() {
    if (!this.clock) return `CHAPTER ${this.level ? this.level.n : 1}`;
    const c = this.def.clock;
    const mins = Math.floor((c.from || 0) + (this.clock.t / this.clock.len) * (c.minutes || 360));
    const h = Math.floor(mins / 60), m = mins % 60;
    return `${h === 0 ? 12 : h}:${String(m).padStart(2, '0')} AM`;
  }

  tickClock(dt) {
    const c = this.clock;
    c.t = Math.min(c.len, c.t + dt);
    $('escClock').textContent = this.timeText();
    if (c.t >= c.len) this.check('survive');
  }

  resize(w, h) { for (const lv of this.built.values()) lv.ctrl?.resize?.(w, h); }

  // On the title screen: a badge for getting everybody out.
  titleBadge() { $('plexTag').classList.toggle('hidden', !this.save.done); }

  leave() {
    super.leave();
    clearTubes();
    this.unseen = false;
  }
}

export { PLEX_STORY };
