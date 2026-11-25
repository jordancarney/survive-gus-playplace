// 10 Nights at Culac's Daycare: the designer's sixth story. Jimmy, five, sleeps at Culac's
// Daycare while his mom and his big brother Jonathan work nights — and the animatronics from
// Gus's PlayPlace sneak over at night. Escape, as Jimmy, ten nights running.
//
// It runs on When Jonathan Was Five's engine (js/escape/mode.js): the night list, story cards,
// quests on the Gus Watch, save boxes, hiding, the clock to 6 AM, getting caught, winning. On top
// of that, what the designer asked for:
//
//   The size     9.57 minutes to walk across (place.js and world.js make that possible). All
//                ten nights are in the same daycare, built once.
//   The kids     asleep in the Beds round Jimmy's. Now and then one of them goes for the Beds:
//                get there first and lead it away. If it gets there, it takes a kid back to its
//                own room, and you have to go and rescue them — you can't leave without them.
//   The cameras  Officer Grumble watches them from his desk and radios in where you are.
//   Leo          a kid from the beds: player 2, when two are playing.
//   Night 10     wake the kids, and lead them all out the front doors.
import * as THREE from 'three';
import { EscapeMode } from '../escape/mode.js';
import { makePerson } from '../cutscene.js';
import { buildJimmy, poseRig, setEyes } from '../models.js';
import { jimmyHands } from '../plex/cast.js';
import { buildMom } from '../escape/cast.js';
import { buildPeter } from '../sushi/cast.js';
import { Follower } from '../plex/followers.js';
import { requestPointerLock } from '../input.js';
import { sfx, startAmbience } from '../audio.js';
import { JIMMY } from '../config.js';
import { ENTITY } from '../escape/watch.js';
import { lam } from '../decor.js';
import { BigPlace } from './place.js';
import { CULAC_LAYOUT, BEDS } from './layout.js';
import { DaycareDecor, buildDaycare } from './world.js';
import { buildLeo, leoHands, buildSleepyKid, KID_NAMES } from './cast.js';
import { NIGHTS } from './nights.js';
import { CULAC_STORY } from './story.js';
import { Raider, Flyer, Guard, Drifter, Jumper, Wirer } from './enemies.js';

const $ = (id) => document.getElementById(id);

Object.assign(ENTITY, {
  sparky: ['🐶', 'Sparky'], meanbaby: ['😭', 'Mean Baby'], roglego: ['🧶', 'Roglego'], ouchie: ['🦉', 'Ouchie'],
  gokupug: ['⚡', 'Gokupug'], grumble: ['👮', 'Officer Grumble'], sunny: ['☀️', 'Sunny'], flipper: ['🐬', 'Flipper'],
  chomper: ['🦫', 'Chomper'], gerald: ['🦍', 'Gerald'], moony: ['🌙', 'Moony'],
});

// Leo is six: a touch taller than Jimmy.
const LEO = { ...JIMMY, eyeHeight: 1.02 };

const POOL = 10;              // real lights, moved to the lamps nearest you
const FAR = 90;               // how far the cameras draw: the fog's long since gone black by then
const BALLS = 4200;

const STORY_DEF = {
  key: 'culac', levels: NIGHTS, area: 'culac', offsetZ: 0, unit: 'Night', buddy: null, box: false,
  eyebrow: "CULAC'S DAYCARE",
  menu: {
    eyebrow: "WHILE JONATHAN WORKS NIGHTS AT GUS'S PLAYPLACE",
    title: "10 NIGHTS AT<span>CULAC'S DAYCARE</span>",
    brief: 'Jimmy is five, and Culac\'s is the biggest daycare in the world: it takes <b>ten minutes</b> to walk across. Every night, <b>escape</b> — the way out is somewhere different each time. Keep the animatronics away from the <b>sleeping kids</b>, and if one gets taken, <b>go and get them back</b>.',
  },
  resumeLine: 'Back at the save box. Okay, Jimmy. Astronauts are brave.',
  againText: '▶ Play it again',
  finale: 'culacFinale', secret: null,
};

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export class CulacMode extends EscapeMode {
  constructor(game) {
    super(game, STORY_DEF);
    this.world = null;
    this.kids = [];
    this.foes = new Map();
    this.raider = null;
    this.followers = [];
    this.mapSaveRange = 260;       // (the Gus Watch map only shows the save boxes near you)
  }

  // ── Who's who ─────────────────────────────────────────────────────────

  makeCast() {
    const sc = this.game.scene;
    const person = (name, build) => Object.assign(makePerson(sc, build), { name });
    this.people = { jimmy: person('Jimmy', buildJimmy), mom: person('Mom', () => buildMom(false)), peter: person('Peter', buildPeter) };
    return Object.values(this.people);
  }

  actor(who) {
    if (!this.inStory) return null;
    if (who === 'Leo') return this.kids[0]?.person || null;
    if (who === 'Officer Grumble') return this.level?.enemies.find((e) => e.id === 'grumble') || null;
    const p = this.people;
    return { Jimmy: p.jimmy, Mom: p.mom, Peter: p.peter }[who] || null;
  }

  setupHero(p) {
    p.kid = true;
    p.sizes = JIMMY;
    p.vmBuild = jimmyHands;
  }

  heroBody() { return ['culac-jimmy', buildJimmy]; }
  heroName() { return ['Jimmy', '🚀']; }
  speaker() { return 'Jimmy'; }
  areaName() { return 'culac'; }

  timeText() {
    if (this.clock) return super.timeText();
    return `NIGHT ${this.level ? this.level.n : 1}`;
  }

  // ── The daycare: built once, the first time it's needed ───────────────

  ensureWorld() {
    if (this.world) return this.world;
    const g = this.game;
    const place = new BigPlace({ ...CULAC_LAYOUT, offsetX: 0, offsetZ: -4000 });
    g.scene.add(place.build());
    const d = new DaycareDecor(place);
    buildDaycare(d);
    g.scene.add(d.group);
    g.graphics.track(place.group);
    g.graphics.track(d.group);
    g.areas.culac = { building: place, isPlayPlace: false, groups: [place.group, d.group], spawn: {}, roam: [], escape: 1 };
    place.group.visible = d.group.visible = false;
    // the lights: a few real ones, moved to whichever lamps are nearest
    d.lights = [];
    for (let i = 0; i < POOL; i++) {
      const light = new THREE.PointLight(0xffffff, 0, 14, 1.6);
      d.group.add(light);
      d.lights.push({ light, day: 0, night: 0, room: '*', flicker: false, spot: -1, base: 0 });
    }
    // the balls in the Ball Pit, laid out round wherever you are
    this.balls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 7, 5), lam(0xffffff), BALLS);
    this.balls.count = 0;
    this.balls.frustumCulled = false;
    this.balls.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.balls.setColorAt(0, new THREE.Color());
    d.group.add(this.balls);
    this.ballKey = '';
    // the kids asleep in the beds round Jimmy's
    const sc = g.scene;
    this.kids = KID_NAMES.map((name, i) => ({
      i, name, state: 'bed', bed: d.kidBeds[i],
      person: Object.assign(makePerson(sc, () => buildSleepyKid(i)), { name }),
    }));
    this.world = { place, decor: d };
    return this.world;
  }

  // Each night's own things (what to find, what to press E on, its exit) go in a group of
  // their own over the shared daycare: a decor that's the daycare's, with its own lists.
  nightDecor() {
    const shared = this.world.decor;
    const d = Object.create(shared);
    d.group = new THREE.Group();
    d.group.visible = false;
    shared.group.add(d.group);
    d.items = [];
    d.targets = [];
    d.exit = null;
    d.spots = {};
    d.spinners = [];
    d.bobbers = [];
    return d;
  }

  build(n) {
    const w = this.ensureWorld();
    let lv = this.built.get(n);
    if (!lv) {
      const def = this.levels[n - 1];
      const decor = this.nightDecor();
      def.build(decor);
      lv = { n, def, place: w.place, decor, area: this.game.areas.culac, enemies: [] };
      this.built.set(n, lv);
    }
    // the same animatronics every night, each with tonight's settings
    const was = this.level;
    this.level = lv;
    lv.enemies = lv.def.enemies.map((def) => this.foeFor(def));
    this.level = was;
    return lv;
  }

  foeFor(def) {
    let e = this.foes.get(def.id);
    if (!e) {
      e = new def.cls(this, def);
      this.foes.set(def.id, e);
      if (e.attach) e.attach(this.world.decor.group);
    }
    e.def = def;
    return e;
  }

  // ── Starting a night ──────────────────────────────────────────────────

  start(n, opts) {
    const g = this.game;
    super.start(n, opts);
    for (const l of this.built.values()) l.decor.group.visible = l === this.level;
    // the cameras only need to see as far as the fog lets you
    this.setFar(true);
    // Two playing: player 2 is Leo, a kid from the beds, in his dinosaur pajamas.
    if (g.twoUp) {
      const p2 = g.p2;
      if (p2.body && p2.body !== g.bodyCache['culac-leo']) p2.body.root.visible = false;
      p2.body = g.makeBody('culac-leo', buildLeo);
      p2.fixedSizes = LEO;
      p2.vmBuild = leoHands;
      p2.rebuildViewmodel();
      p2.name = 'Leo';
      g.panes[1].setName('LEO', '🦖');
      this.leoPlaying = true;
    } else this.leoPlaying = false;
    this.setUpNight(!!(opts && opts.resume && this.save.save && this.save.save.level === n));
  }

  setUpNight(resumed) {
    const def = this.def;
    this.speedK = def.speedK || 1;
    this.raider = null;
    this.raidT = def.raids ? (resumed ? def.raids.every * 0.6 : def.raids.first) : Infinity;
    this.stopFollowers();
    for (const p of this.game.players) p.riding = null;
    // the kids: in their beds — or wherever they were left, if you're back at a save box
    const lost = (this.flags.lost || {});
    for (const k of this.kids) {
      if (k.i === 0 && this.leoPlaying) { k.state = 'player'; k.person.root.visible = false; continue; }
      if (lost[k.i]) this.loseKid(k, this.place.P(...lost[k.i]), true);
      else this.toBed(k);
    }
    this.lampT = 0;
    this.ballKey = '';
    this.updateLamps(0, true);
    this.refreshExit();
    if (def.raids && !resumed) {
      setTimeout(() => {
        if (this.game.mode === 'escape' && this.def === def) this.game.hud.toast('🛏️ Keep them away from the BEDS! If one goes for the kids, get there first and lead it away.', 5);
      }, 6500);
    }
  }

  leave() {
    super.leave();
    const g = this.game;
    this.setFar(false);
    this.stopFollowers();
    this.hideKids();
    if (this.world) for (const l of this.built.values()) l.decor.group.visible = false;
    for (const p of g.players) p.riding = null;
    // player 2 is Jimmy again everywhere else
    if (this.leoPlaying && g.p2) {
      const p2 = g.p2;
      if (p2.body) p2.body.root.visible = false;
      p2.body = g.makeBody('jimmy', g.jimmyBuild || buildJimmy);
      p2.fixedSizes = JIMMY;
      p2.name = 'Jimmy';
      g.panes?.[1].setName('JIMMY', '🚀');
      this.leoPlaying = false;
    }
  }

  setFar(on) {
    const g = this.game;
    for (const cam of [g.p1.camera, g.p2cam].filter(Boolean)) {
      if (on) { if (cam.userData.far === undefined) cam.userData.far = cam.far; cam.far = FAR; }
      else if (cam.userData.far !== undefined) { cam.far = cam.userData.far; delete cam.userData.far; }
      cam.updateProjectionMatrix();
    }
  }

  playCutscene(id, n, done) {
    this.ensureWorld();
    super.playCutscene(id, n, done);
  }

  // ── The lights ────────────────────────────────────────────────────────

  // The handful of real lights go to the lamps nearest whoever's playing (or the cutscene).
  updateLamps(dt, force = false, around = null) {
    this.lampT -= dt;
    if (!force && this.lampT > 0) return;
    this.lampT = 0.25;
    const d = this.world.decor, spots = d.lampSpots;
    const eyes = around ? [around] : this.game.alive().map((p) => p.pos);
    const best = [];
    for (let i = 0; i < spots.length; i++) {
      const s = spots[i].pos;
      let dd = Infinity;
      for (const e of eyes) dd = Math.min(dd, (s.x - e.x) ** 2 + (s.z - e.z) ** 2);
      if (best.length < POOL || dd < best[best.length - 1][0]) {
        best.push([dd, i]);
        best.sort((a, b) => a[0] - b[0]);
        if (best.length > POOL) best.pop();
      }
    }
    const want = new Set(best.map((b) => b[1]));
    const keep = new Set();
    for (const l of d.lights) if (want.has(l.spot)) keep.add(l.spot);
    const free = d.lights.filter((l) => !want.has(l.spot));
    for (const [, i] of best) {
      if (keep.has(i)) continue;
      const l = free.pop();
      if (!l) break;
      const s = spots[i];
      l.spot = i;
      l.light.position.copy(s.pos);
      l.light.color.copy(s.color);
      l.light.distance = s.distance;
      l.night = s.k;
      l.flicker = s.flicker;
      l.base = s.k;
      l.light.intensity = s.k;
    }
    for (const l of free) { l.spot = -1; l.base = 0; l.light.intensity = 0; }
  }

  // For the cutscenes: light the lamps round a plan point, brighter, and hang one more (the
  // farthest of them) right over it, so you can see who's talking.
  lampsAt(px, pz) {
    this.ensureWorld();
    const at = this.world.place.P(px, pz);
    this.updateLamps(0, true, at);
    const lights = this.world.decor.lights;
    for (const l of lights) { l.base *= 2.2; l.light.intensity = l.base; }
    const far = [...lights].sort((a, b) => dist(b.light.position, at) - dist(a.light.position, at))[0];
    far.spot = -1;
    far.light.position.set(at.x, 3.4, at.z);
    far.light.color.set(0xffe8d0);
    far.light.distance = 16;
    far.base = far.light.intensity = 5;
  }

  // ── The Ball Pit ──────────────────────────────────────────────────────

  // Real balls only round you (a ball texture everywhere else): 3 m tiles, each with its own
  // balls in the same places every time, so they don't swim about as you wade through.
  updateBalls() {
    const place = this.place, pits = this.world.decor.pits;
    const tiles = [];
    for (const p of this.game.alive()) {
      const px = p.pos.x + place.ox, pz = p.pos.z + place.oz;
      if (!pits.some(([x0, z0, x1, z1]) => px > x0 - 25 && px < x1 + 25 && pz > z0 - 25 && pz < z1 + 25)) continue;
      tiles.push([Math.floor(px / 3), Math.floor(pz / 3)]);
    }
    const key = tiles.map((t) => t.join(',')).join(';');
    if (key === this.ballKey) return;
    this.ballKey = key;
    const m4 = new THREE.Matrix4(), col = new THREE.Color();
    const cols = [0xff3b30, 0xffd23f, 0x3ec1d3, 0x7ad151, 0xa970ff, 0xff9a1f];
    const seen = new Set();
    let n = 0;
    for (const [cx, cz] of tiles) {
      for (let tx = cx - 5; tx <= cx + 5; tx++) for (let tz = cz - 5; tz <= cz + 5; tz++) {
        if ((tx - cx) ** 2 + (tz - cz) ** 2 > 26) continue;
        const k = tx * 10007 + tz;
        if (seen.has(k)) continue;
        seen.add(k);
        const x0 = tx * 3, z0 = tz * 3;
        if (!pits.some(([a, b, c, d]) => x0 >= a && x0 + 3 <= c && z0 >= b && z0 + 3 <= d)) continue;
        let s = (k * 2654435761) >>> 0;
        const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
        for (let i = 0; i < 26 && n < BALLS; i++, n++) {
          const p = place.P(x0 + rnd() * 3, z0 + rnd() * 3, 0.14 + rnd() * 0.26);
          this.balls.setMatrixAt(n, m4.makeTranslation(p.x, p.y, p.z));
          this.balls.setColorAt(n, col.set(cols[Math.floor(rnd() * 6)]));
        }
      }
    }
    this.balls.count = n;
    this.balls.instanceMatrix.needsUpdate = true;
    if (this.balls.instanceColor) this.balls.instanceColor.needsUpdate = true;
  }

  // ── The cameras ───────────────────────────────────────────────────────

  updateCams() {
    const t = this.game.t;
    const grumbleUp = this.enemies.some((e) => e.id === 'grumble' && e.state !== 'off');
    for (const c of this.decor.cams) {
      c.yaw = c.base + Math.sin(t * c.speed + c.phase) * c.sweep;
      c.head.rotation.y = c.yaw - c.base;
      c.sees = false;
      if (!grumbleUp) continue;
      for (const p of this.game.alive()) {
        if (p.hiding) continue;
        const dx = p.pos.x - c.pos.x, dz = p.pos.z - c.pos.z, d = Math.hypot(dx, dz);
        if (d > c.range || d < 0.5) continue;
        if ((Math.sin(c.yaw) * dx + Math.cos(c.yaw) * dz) / d < Math.cos(0.42)) continue;
        if (!this.place.sightClear(c.pos, p.pos)) continue;
        c.sees = true;
      }
      c.led.color.setRGB(c.sees ? 6 : 2, 0.2, 0.2);
    }
  }

  // ── The kids ──────────────────────────────────────────────────────────

  toBed(k) {
    k.state = 'bed';
    k.by = null;
    const [x, z] = k.bed.at;
    const p = this.place.P(x, z + 0.62);
    const r = k.person.root;
    r.position.set(p.x, 0.45, p.z);
    r.rotation.set(-Math.PI / 2, 0, 0, 'YXZ');
    r.visible = true;
    poseRig(k.person.rig, 'sleep', 0, 1, 1);
  }

  loseKid(k, at, quiet = false) {
    k.state = 'lost';
    k.by = null;
    k.at = at.clone();
    const r = k.person.root;
    r.position.set(at.x, 0, at.z);
    r.rotation.set(0, Math.random() * 6, 0, 'YXZ');
    r.visible = true;
    const pl = this.place;
    const lost = this.flags.lost || (this.flags.lost = {});
    lost[k.i] = [at.x + pl.ox, at.z + pl.oz];
    if (!quiet) {
      this.game.hud.toast(`😢 ${k.name} is stuck in the ${this.roomOf(at)}! Go and get them — you can't leave without them.`, 4.5);
    }
    this.refreshExit();
  }

  hideKids() { for (const k of this.kids) k.person.root.visible = false; }

  kidsMissing() { return this.kids.filter((k) => k.state === 'lost' || k.state === 'carried'); }

  rescue(k) {
    sfx.happy();
    this.say(`It's okay, ${k.name}! Run back to bed — quick!`, 2.6);
    setTimeout(() => this.game.mode === 'escape' && this.game.hud.toast(`🛏️ ${k.name} ran all the way back to bed!`, 2.8), 900);
    if (this.flags.lost) delete this.flags.lost[k.i];
    this.toBed(k);
    this.refreshExit();
    this.check('rescue');
  }

  // The raids (the designer: if one gets to the kids, "it takes a kid").
  tickRaids(dt) {
    const R = this.def.raids;
    if (!R || this.raider) return;
    this.raidT -= dt;
    if (this.raidT > 0) return;
    this.raidT = R.every * (0.8 + Math.random() * 0.4);
    const kids = this.kids.filter((k) => k.state === 'bed');
    if (!kids.length) return;
    const beds = this.place.P(...BEDS.raid);
    const cands = this.enemies.filter((e) => e instanceof Raider && ['wait', 'roam', 'linger'].includes(e.state))
      .sort((a, b) => dist(a.pos, beds) - dist(b.pos, beds));
    if (!cands.length) { this.raidT = 30; return; }
    const e = cands[Math.floor(Math.random() * Math.min(3, cands.length))];
    const kid = kids[Math.floor(Math.random() * kids.length)];
    e.startRaid(kid, kid.bed.pos);
    this.raider = e;
    sfx.escAlarm?.();
    this.game.hud.toast(`🛏️ ${e.name} is going for the Beds — for ${kid.name}! Get there first and lead it away!`, 5);
    setTimeout(() => this.game.mode === 'escape' && this.say(`Oh no... ${e.name}'s going for the kids!`, 3), 1500);
  }

  raidOff(e) {
    if (this.raider !== e) return;
    this.raider = null;
    this.game.hud.toast(`👍 ${e.name} saw you and forgot all about the kids! Now RUN!`, 3.4);
  }

  raidGrab(e, k) {
    k.state = 'carried';
    k.by = e;
    sfx.escAlarm?.();
    this.game.hud.toast(`😱 ${e.name} took ${k.name}! It's carrying them off to the ${this.roomOf(this.place.P(...e.def.start))}!`, 4.5);
    this.refreshExit();
  }

  raidDrop(e, k, early) {
    if (this.raider === e) this.raider = null;
    if (!k) return;
    const at = e.pos.clone();
    const f = new THREE.Vector3(Math.sin(e.yaw), 0, Math.cos(e.yaw));
    at.addScaledVector(f, 0.8);
    if (!this.place.isWalkable(at.x, at.z)) at.copy(e.pos);
    this.loseKid(k, at);
    if (early) this.game.hud.toast(`${e.name} dropped ${k.name} to come after you! Grab them!`, 3.2);
  }

  updateKids(dt) {
    const t = this.game.t;
    for (const k of this.kids) {
      if (k.state === 'bed') poseRig(k.person.rig, 'sleep', t * 0.4 + k.i, 1, dt);
      else if (k.state === 'lost') {
        // crying where it left them (and looking round for you)
        poseRig(k.person.rig, 'cry', t * 3 + k.i, 1, dt);
        k.cryT = (k.cryT || 0) - dt;
        if (k.cryT <= 0 && dist(k.person.root.position, this.player.pos) < 40) { k.cryT = 6 + Math.random() * 4; sfx.cry(k.person.root.position); }
      }
    }
    for (const f of this.followers) if (f.root.visible) f.update(dt);
  }

  // Night 10: wake them up, and they follow you out.
  wakeKid(k) {
    k.state = 'follow';
    sfx.happy();
    const slot = [[1.3, -0.7], [1.3, 0.7], [2.3, -0.9], [2.3, 0.9], [3.3, -0.6], [3.3, 0.6], [4.3, -0.8], [4.3, 0.8], [5.2, 0]][this.followers.length % 9];
    const f = new Follower(this, k.person, slot);
    k.person.root.rotation.set(0, 0, 0, 'YXZ');
    f.place(this.place.P(k.bed.at[0] + 0.8, k.bed.at[1]), 0);
    f.with = true;
    this.followers.push(f);
    this.say([`${k.name}! Wake up! We're getting out of here — follow me!`, `Shhh, ${k.name}! Get up, we're going home!`][this.followers.length % 2], 2.6);
    const left = this.kids.filter((x) => x.state === 'bed').length;
    if (!left) this.complete('wake');
    else this.game.hud.toast(`🧒 ${this.followers.length} awake · ${left} still asleep`, 2.4);
    if (this.watch.open) this.watch.render();
  }

  stopFollowers() {
    for (const f of this.followers) { f.with = false; f.hide(); }
    this.followers = [];
  }

  // ── The exit ──────────────────────────────────────────────────────────

  // Open when tonight's quests are done and nobody's been left behind.
  refreshExit() {
    const d = this.decor;
    if (!d || !d.exit) return;
    const ready = this.def.quests.filter((q) => !q.optional && q.type !== 'exit').every((q) => this.done.has(q.id));
    d.exit.setOpen(ready && !this.kidsMissing().length);
  }

  complete(id) {
    super.complete(id);
    this.refreshExit();
  }

  progressText(q) {
    if (q.type === 'wake') {
      const all = this.kids.filter((k) => k.state !== 'player');
      return `(${all.filter((k) => k.state === 'follow').length}/${all.length})`;
    }
    return super.progressText(q);
  }

  // ── Pressing E ────────────────────────────────────────────────────────

  interaction() {
    if (this.hiding || this.player.riding) return super.interaction();
    const p = this.player, d = this.decor;
    for (const k of this.kids) {
      if (k.state === 'lost' && dist(k.person.root.position, p.pos) < 1.9) return { text: `<b>E</b> It's okay, ${k.name}! Run back to bed!`, act: () => this.rescue(k) };
    }
    if (this.def.id === 'out' && this.done.has('card')) {
      for (const k of this.kids) if (k.state === 'bed' && dist(k.bed.pos, p.pos) < 2.0) return { text: `<b>E</b> Wake up ${k.name}`, act: () => this.wakeKid(k) };
    }
    if (d.slideStart && dist(d.slideStart, p.pos) < 2.4) return { text: '<b>E</b> Go down the GIANT SLIDE! 🛝', act: () => this.rideSlide(p) };
    const base = super.interaction();
    if (d.exit && !d.exit.open && dist(d.exit.pos, p.pos) < 1.7) {
      const miss = this.kidsMissing();
      if (miss.length) return { text: `🔒 You can't leave without ${miss.map((k) => k.name).join(' and ')}!`, act: () => { sfx.repairBad(); this.watch.toggle(true); }, quiet: true };
    }
    return base;
  }

  // ── The giant slide ───────────────────────────────────────────────────

  rideSlide(p) {
    p.riding = { t: 0 };
    p.crouching = false;
    sfx.escHide();
    this.check('slide');
  }

  turn(dt, p) {
    if (!p.riding) return super.turn(dt, p);
    const r = p.riding, path = this.world.decor.bigSlide, T = 3.4;
    r.t += dt;
    p.update(dt, { canMove: false });
    const k = Math.min(1, r.t / T) ** 1.3 * (path.length - 1);
    const i = Math.min(path.length - 2, Math.floor(k)), f = k - i;
    const a = path[i], b = path[i + 1];
    p.pos.set(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f - 0.6, a.z + (b.z - a.z) * f);
    p.yaw = 0;
    p.updateCamera(dt);
    if (r.t >= T) {
      p.riding = null;
      p.pos.y = 0;
      sfx.junkLand(p.pos);
      this.say('WHEEEEEEEEE! ...I\'m in the BALL PIT!', 2.6);
    }
    return false;
  }

  // ── Each step ─────────────────────────────────────────────────────────

  update(dt) {
    const g = this.game;
    super.update(dt);
    if (g.mode !== 'escape' || !this.level || this.ctrl) return;
    this.updateLamps(dt);
    this.updateBalls();
    this.updateCams();
    this.tickRaids(dt);
    this.updateKids(dt);
  }

  // ── The Gus Watch ─────────────────────────────────────────────────────

  statusOf(e) {
    if (e instanceof Flyer) {
      if (e.state === 'off') return { text: '😴 asleep in his tree', still: true };
      if (e.state === 'perch') return { text: '🌳 up in his tree' };
      if (e.chasing) return { text: '🚨 SWOOPING AT YOU!', hot: true };
      return { text: '🦉 flying around up high' };
    }
    if (e instanceof Guard) {
      if (e.state === 'off') return { text: '😴 asleep at his desk', still: true };
      if (e.state === 'office') return { text: '📹 watching the cameras', still: true };
      if (e.state === 'back') return { text: '🔦 going back to his desk' };
    }
    if (e instanceof Raider && e.raiding) return { text: e.state === 'raid' ? '🛏️ GOING FOR THE BEDS!' : '😱 CARRYING A KID!', hot: true };
    if (e instanceof Jumper && e.jump) return { text: '⚡ SUPER JUMP!', hot: true };
    return super.statusOf(e);
  }

  friendLines() {
    const line = (k) => {
      const where = k.state === 'bed' ? 'asleep in bed' : k.state === 'follow' ? 'right behind you'
        : k.state === 'carried' ? `CARRIED OFF by ${k.by ? k.by.name : '???'}!` : k.state === 'lost' ? `<b>stuck in the ${this.roomOf(k.person.root.position)}</b> · ${Math.round(dist(k.person.root.position, this.player.pos))} m` : '';
      return `<div class="gw-bot ${k.state === 'lost' || k.state === 'carried' ? 'hot' : ''}">🧒 ${k.name}: ${where}</div>`;
    };
    return this.kids.filter((k) => k.state !== 'player').map(line);
  }

  // Where to go: tonight's quests, and any kid who needs rescuing.
  questTargets() {
    const out = super.questTargets();
    for (const k of this.kids) if (k.state === 'lost') out.push(k.person.root.position);
    if (this.def.id === 'out' && this.done.has('card') && !this.done.has('wake')) out.push(this.place.P(...BEDS.jimmy));
    return out;
  }

  // ── Caught ────────────────────────────────────────────────────────────

  caught(who, why) {
    // (Sunny's made of fog: she shows up for her jumpscare)
    if (who instanceof Drifter) for (const c of who.root.children) c.visible = true;
    super.caught(who, why);
  }

  // The last night's done: everyone out the front doors, and the finale.
  win() {
    super.win();
    const e = this.save;
    if (this.level && this.level.n === this.levels.length) e.done = true;
    this.game.save();
  }

  titleBadge() { $('culacTag')?.classList.toggle('hidden', !this.save.done); }

  // ── For the nights ────────────────────────────────────────────────────

  found(id) { return this.decor.items.some((it) => it.id === id && it.found); }

  wake(id, boost) {
    const e = this.enemies.find((x) => x.id === id);
    if (e && e.wake) e.wake(boost);
  }

  // A few lines over the walkie-talkie of Jimmy's own head: [ms, who, text, secs].
  talk(lines) {
    const lv = this.level;
    for (const [ms, who, text, secs] of lines) {
      setTimeout(() => {
        if (this.game.mode !== 'escape' || this.level !== lv) return;
        if (who === 'Leo' && this.leoPlaying) return;      // (he's player 2: he's right there)
        this.say(text, secs || 3.2, who);
      }, ms);
    }
  }

  // ── From the console (?debug=1): __game.culac ─────────────────────────
  //   .start(n) after .showMenu(), .skip() finishes the night's quests, .raid() sends one
  //   for the beds now, .tp(x, z) jumps you to a plan point.

  raid() { this.raidT = 0; this.raider = null; }

  tp(x, z) {
    const p = this.place.P(x, z);
    this.player.pos.set(p.x, 0, p.z);
  }
}

export { CULAC_STORY };
