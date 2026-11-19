// In the Closets: the designer's fifth story, after Gus's PlayPlace. Timmy's house, at night,
// with Gramma out — and every animatronic hiding in the closets.
//
// It runs on When Jonathan Was Five's engine (js/escape/mode.js): the level list, story cards,
// quests on the Gus Watch, hiding, getting caught, the clock to 6 AM, winning. On top of that,
// what the designer asked for:
//
//   The closets  Five on every floor, and more floors as the levels go (house.js). Something's
//                in some of them. When one's about to come out you hear it BREATHING, and the
//                door starts to creak open. Get there and SPAM E (or Space, the E button, A on
//                a controller) to hold it shut until the breathing stops. Too slow — or not
//                there at all — and it bursts out and gets you.
//   Gus          is in a closet too, but you can't see him: only a MIRROR shows which one (his
//                eyes, peering out of the crack). Hold his shut like any other. If he gets out,
//                he's right behind you — you'll only see him in a mirror — and the only thing
//                to do is HIDE in an empty closet until he's gone.
//   The teeth    big ones, like FNAF 4 (addBigTeeth in models.js), on all of them.
//   Level 10     Gramma comes home.
import * as THREE from 'three';
import { EscapeMode } from '../escape/mode.js';
import { makePerson } from '../cutscene.js';
import { buildAnimatronic, buildTimmy, buildGramma, addBigTeeth, setEyes, setMouth, poseRig } from '../models.js';
import { buildRocco, buildSparky, buildHands } from '../plex/cast.js';
import { buildSushi } from '../sushi/cast.js';
import { sfx } from '../audio.js';
import { KID } from '../config.js';
import { LEVELS } from './levels.js';
import { CLOSETS_STORY } from './story.js';
import { FLOORS, floorX } from './house.js';

const $ = (id) => document.getElementById(id);

// Timmy's a bit older now than the six-year-old in the ball pit: eight.
const TIMMY = { ...KID, eyeHeight: 1.08, walkSpeed: 3.8, sprintSpeed: 6.3, crouchHeight: 0.62, crouchSpeed: 1.9, radius: 0.28 };
const timmyHands = () => buildHands({ sleeve: 0xf4f1ea, skin: 0xf1c7a5, scale: 0.6 });

// Everyone in the closets, in the order the levels bring them in ("all of them").
export const CREW = [
  { id: 'chomper', name: 'Chomper', eye: 0x7cff3a, build: () => buildAnimatronic('chomper') },
  { id: 'cranker', name: 'Cranker', eye: 0x6fe3ff, build: () => buildAnimatronic('cranker') },
  { id: 'gerald', name: 'Gerald', eye: 0xff2a2a, build: () => buildAnimatronic('gerald') },
  { id: 'flipper', name: 'Flipper', eye: 0xff5ad1, build: () => buildAnimatronic('flipper') },
  { id: 'sunny', name: 'Sunny', eye: 0xfff2a0, build: () => buildAnimatronic('sunny') },
  { id: 'moony', name: 'Moony', eye: 0xbfe4ff, build: () => buildAnimatronic('moony') },
  { id: 'rocco', name: 'DJ Rocco', eye: 0xc040ff, build: buildRocco },
  { id: 'sparky', name: 'Sparky', eye: 0x2de2ff, build: buildSparky },
  { id: 'sushi', name: 'Sushi', eye: 0xff9a1f, build: buildSushi },
  { id: 'oldgerald', name: 'Old Gerald', eye: 0xff6a3a, build: () => buildAnimatronic('gerald', { old: true }) },
  { id: 'oldchomper', name: 'Old Chomper', eye: 0xb0ff6a, build: () => buildAnimatronic('chomper', { old: true }) },
];

const STORY_DEF = {
  key: 'closets', levels: LEVELS, area: 'closets', offsetZ: 1200, unit: 'Level', buddy: null, box: false,
  eyebrow: 'IN THE CLOSETS',
  menu: {
    eyebrow: "AFTER GUS'S PLAYPLACE",
    title: 'IN THE<span>CLOSETS</span>',
    brief: 'Gramma\'s working nights, and Timmy\'s home alone. Every animatronic is hiding in the <b>closets</b>. Listen for <b>breathing</b>, then <b>SPAM E</b> to hold the door shut. Gus only shows up in a <b>mirror</b> — and if he gets out, <b>hide in an empty closet</b>!',
  },
  resumeLine: 'Okay... I can do this.',
  againText: '▶ Play it again',
  finale: 'closetsFinale', secret: null,
};

const rand = (a, b) => a + Math.random() * (b - a);
const MIRROR_W = 256, MIRROR_H = 352;

export class ClosetsMode extends EscapeMode {
  constructor(game) {
    super(game, STORY_DEF);
    this.rigs = {};          // id → the animatronic (built the first time it's needed)
    this.occ = [];           // who's in which closet this level
    this.gus = null;         // Gus: { who, closet, state: 'wait' | 'breath' | 'out', ... }
    this.mirrorCam = new THREE.PerspectiveCamera(52, MIRROR_W / MIRROR_H, 0.05, 60);
    this.mirrorCam.layers.enable(1);
    this.mirrorRT = null;
    this.mirrorT = 0;
    this.lookedInMirror = false;
  }

  // ── Who's who ─────────────────────────────────────────────────────────

  makeCast() {
    const sc = this.game.scene;
    const person = (name, build) => Object.assign(makePerson(sc, build), { name });
    this.people = { timmy: person('Timmy', buildTimmy), gramma: person('Gramma', buildGramma) };
    return Object.values(this.people);
  }

  actor(who) {
    if (!this.inStory) return null;
    return { Timmy: this.people.timmy, Gramma: this.people.gramma }[who] || null;
  }

  setupHero(p) {
    p.kid = true;
    p.sizes = TIMMY;
    p.vmBuild = timmyHands;
  }

  heroBody() { return ['closets-timmy', buildTimmy]; }
  heroName() { return ['Timmy', '⚪']; }
  speaker() { return 'Timmy'; }

  // One animatronic, with its big FNAF 4 teeth (the designer's call).
  rigFor(c) {
    if (!this.rigs[c.id]) {
      const rig = addBigTeeth(c.build());
      rig.root.visible = false;
      this.rigs[c.id] = rig;
    }
    return this.rigs[c.id];
  }

  gusRig() {
    if (!this.rigs.gus) {
      const rig = addBigTeeth(buildAnimatronic('gus'));
      rig.root.visible = false;
      this.game.scene.add(rig.root);
      this.rigs.gus = rig;
    }
    return this.rigs.gus;
  }

  // Gus is only ever seen in a mirror (layer 1) — except when he's got you.
  gusLayer(n) { this.gusRig().root.traverse((o) => o.layers.set(n)); }

  // ── Starting a level ──────────────────────────────────────────────────

  start(n, opts) {
    super.start(n, opts);
    this.setUpClosets();
  }

  setUpClosets() {
    const def = this.def, d = this.decor;
    const g = this.game;
    this.pace = g.diff.speed || 1;
    // everything back where it was (a retry)
    for (const c of d.closets) { c.k = 0; c.occ = null; c.hinge.rotation.y = 0; c.eyes.visible = false; c.gusEyes.visible = false; }
    for (const o of this.occ) { o.rig.root.visible = false; }
    // who's in which closet: shuffled, so it's different every time
    const free = d.closets.slice().sort(() => Math.random() - 0.5);
    this.occ = CREW.slice(0, def.crew).map((c, i) => {
      const closet = free.pop();
      const rig = this.rigFor(c);
      const o = {
        id: c.id, name: c.name, eye: c.eye, rig, closet, state: 'wait', taps: 0, breathT: 0,
        // the first one to stir does it a little sooner than the rest
        timer: (i === 0 ? 6 : rand(...def.quiet) * 0.6) + rand(0, def.quiet[1]),
      };
      o.who = this.who(o);
      this.putIn(o, closet);
      return o;
    });
    this.gus = null;
    if (def.gus) {
      const closet = free.pop();
      const rig = this.gusRig();
      this.gusLayer(1);
      rig.root.visible = false;
      const o = { id: 'gus', name: 'Gus', eye: 0xffa21f, rig, closet, state: 'wait', taps: 0, breathT: 0, timer: rand(...def.quiet) + 10, gus: true };
      o.who = this.who(o);
      closet.occ = o;
      closet.gus = true;
      this.gus = o;
    }
    this.lookedInMirror = false;
    this.heldOnce = false;
    this.breathCue = 0;
    this.hintT = 0;
    this.sixAM = false;
    if (!this.mirrorRT) {
      this.mirrorRT = new THREE.WebGLRenderTarget(MIRROR_W, MIRROR_H);
    }
    this.mirrorLamp();
    for (const m of d.mirrors) { m.glass.map = this.mirrorRT.texture; m.glass.color.set(0xd8e0e8); m.glass.needsUpdate = true; }
    // what to do, the first time
    const tips = def.tips2 || [];
    tips.forEach((t, i) => setTimeout(() => { if (g.mode === 'escape' && this.level && this.level.def === def) g.hud.toast(t, 5); }, 3400 + i * 5400));
  }

  // What the engine needs of something that can catch you (and be the jumpscare).
  who(o) {
    return {
      id: o.id, name: o.name, rig: o.rig, root: o.rig.root, pos: new THREE.Vector3(), yaw: 0,
      state: 'closet', def: { kind: 'closet' }, lastSeen: new THREE.Vector3(), goTo() {},
    };
  }

  // Into a closet: standing in the dark at the back, a little smaller so it fits.
  putIn(o, closet) {
    if (o.closet && o.closet.occ === o) o.closet.occ = null;
    o.closet = closet;
    closet.occ = o;
    const root = o.rig.root;
    root.parent?.remove(root);
    closet.slot.add(root);
    root.position.set(0, 0, 0);
    root.rotation.set(0, 0, 0);
    // (a little smaller so it fits: under the top, and between the sides)
    root.scale.setScalar(Math.min(1, 2.05 / (o.rig.height || 2), 1.0 / (2 * (o.rig.radius || 0.45))));
    root.visible = false;
    closet.eyes.children.forEach((e) => { e.material = closet.eyeMat; });
    closet.eyeMat.color.set(o.eye).multiplyScalar(2.2);
    setEyes(o.rig, 'on');
  }

  // ── Which floor am I on? ──────────────────────────────────────────────

  floorAt(v) {
    const px = v.x + this.place.ox;
    return Math.max(0, Math.min(3, Math.floor((px - 1) / 27)));
  }

  // ── Pressing E ────────────────────────────────────────────────────────

  interaction() {
    if (this.hiding) {
      if (this.gus && this.gus.state === 'out' && this.gus.prey === this.player) return { text: '🤫 Stay hidden until Gus is gone... (<b>E</b> come out)', act: () => this.unhideCloset() };
      return { text: '<b>E</b> Come out', act: () => this.unhideCloset() };
    }
    const p = this.player, d = this.decor;
    // a closet that's breathing: hold it shut!
    let best = null, bd = 1.5;
    for (const c of d.closets) {
      const dist = Math.hypot(c.face.x - p.pos.x, c.face.z - p.pos.z);
      if (dist < bd) { bd = dist; best = c; }
    }
    if (best && best.occ && best.occ.state === 'breath') {
      return { text: `🚪 <b>SPAM E</b> (or Space) — hold ${best.name} shut!`, act: () => this.tap(best) };
    }
    for (const s of d.stairs) {
      if (Math.hypot(s.point.x - p.pos.x, s.point.z - p.pos.z) > s.reach) continue;
      return { text: `<b>E</b> ${s.dir === 'up' ? '⬆ Up' : '⬇ Down'} to the ${FLOORS[s.to].name}`, act: () => this.takeStairs(s) };
    }
    // when Gus is out, any empty closet is a place to hide
    if (best && this.gus && this.gus.state === 'out') {
      return { text: `<b>E</b> Hide in ${best.name}!`, act: () => this.hideIn(best) };
    }
    return null;
  }

  // One push on the door. Spam it: every push shoves it back a little, and enough of them in
  // a row and whatever's in there gives up.
  tap(c) {
    const o = c.occ;
    if (!o || o.state !== 'breath') return;
    o.taps++;
    o.lastTap = this.game.t;
    c.k = Math.max(0, c.k - this.def.push);
    sfx.pound(c.pos);
    this.player.shake = Math.max(this.player.shake, 0.12);
    if (o.taps >= this.def.taps) this.quiet(o, true);
  }

  // The breathing stops. Back to waiting — and on the harder levels, maybe somewhere else.
  quiet(o, held) {
    const c = o.closet;
    o.state = 'wait';
    o.taps = 0;
    o.timer = rand(...this.def.quiet);
    c.k = 0;
    c.hinge.rotation.y = 0;
    c.eyes.visible = false;
    c.gusEyes.visible = false;
    o.rig.root.visible = false;
    if (held) {
      sfx.plexDoor();
      this.heldOnce = true;
      this.game.hud.toast(`😮‍💨 The breathing stopped... ${o.gus ? 'Gus' : o.name} let go of ${c.name}.`, 2.6);
      this.check('use', 'hold');
      if (o.gus) this.check('use', 'holdgus');
    }
    // sometimes it creeps off to a different closet (Gus always does, and the others do on
    // the levels that say so)
    if (o.gus || Math.random() < this.def.move) {
      const empty = this.decor.closets.filter((x) => !x.occ && x !== this.hidingCloset());
      const to = empty[Math.floor(Math.random() * empty.length)];
      if (to) {
        if (o.gus) { c.occ = null; c.gus = false; o.closet = to; to.occ = o; to.gus = true; }
        else this.putIn(o, to);
      }
    }
  }

  hidingCloset() {
    for (const p of this.game.players) if (p.hiding && p.hiding.closet) return p.hiding.closet;
    return null;
  }

  takeStairs(s) {
    const d = this.decor;
    const there = d.stairs.find((x) => x.floor === s.to && x.to === s.floor);
    const p = this.player;
    const at = there ? there.point.clone().addScaledVector(there.front, 0.55) : this.place.P(floorX(s.to) + 12, 8.0);
    p.pos.set(at.x, 0, at.z);
    p.yaw = 0;     // (facing up the hall, away from the stairs)
    p.vel?.set(0, 0, 0);
    p.updateCamera();
    sfx.escHide();
    setTimeout(() => sfx.escHide(), 180);
    this.game.hud.toast(`${s.dir === 'up' ? '⬆' : '⬇'} The ${FLOORS[s.to].name}`, 1.6);
    this.check('use', 'stairs');
  }

  // Hiding from Gus: into an empty closet, the door pulled to — and if something's in there
  // already, it won't open.
  hideIn(c) {
    if (c.occ) {
      sfx.repairBad();
      sfx.rattle(c.pos);
      this.game.hud.toast(`🚪 ${cap(c.name)} won't open — something's holding it shut from the INSIDE! Find another one!`, 3);
      return;
    }
    this.hide({ ...c.hide, closet: c });
    c.k = 0.1;
    c.hinge.rotation.y = -0.12;
    $('escHideText').textContent = `Hiding in ${c.name} — shhh! Stay in until Gus is gone.`;
  }

  unhideCloset() {
    const c = this.hiding && this.hiding.closet;
    this.unhide();
    if (c) { c.k = 0; c.hinge.rotation.y = 0; }
  }

  // ── Each step ─────────────────────────────────────────────────────────

  update(dt) {
    super.update(dt);
    const g = this.game;
    if (g.mode !== 'escape' || !this.level || this.sixAM) return;
    // spamming Space counts as well as E (E is the engine's prompt; touch E and pad A are E)
    for (const p of g.alive()) {
      if (p.hiding || !p.ctl.keyPressed('Space')) continue;
      g.withPlayer(p, () => {
        const it = this.interaction();
        if (it && it.text.includes('SPAM')) it.act();
      });
    }
    this.tickClosets(dt);
    if (g.mode !== 'escape') return;
    this.tickGus(dt);
  }

  tickClosets(dt) {
    const def = this.def, g = this.game;
    // (Gus out and after you counts as one of them breathing: fewer start while you hide)
    const breathing = this.occ.concat(this.gus ? [this.gus] : []).filter((o) => o.state === 'breath' || o.state === 'out');
    for (const o of this.occ.concat(this.gus && this.gus.state !== 'out' ? [this.gus] : [])) {
      const c = o.closet;
      if (o.state === 'wait') {
        o.timer -= dt * this.pace;
        if (o.timer > 0) continue;
        // (never two starting at the very same moment: `gap` seconds apart at least)
        if (breathing.length >= def.atOnce || this.grace > 0 || g.t - (this.lastBreath ?? -99) < def.gap) { o.timer = rand(1.5, 4); continue; }
        this.lastBreath = g.t;
        // it's coming: the breathing starts, and the door begins to creak open
        o.state = 'breath';
        o.taps = 0;
        o.breathT = 0;
        c.k = 0;
        breathing.push(o);
        sfx.plexCreak();
        continue;
      }
      // breathing: the door creeps open until you hold it shut — or it's all the way open
      const held = o.lastTap && g.t - o.lastTap < 0.5;
      c.k = Math.min(1, c.k + (dt * this.pace) / def.open * (held ? 0.35 : 1));
      c.hinge.rotation.y = -Math.pow(c.k, 1.3) * 1.15;
      if (!o.gus) {
        // a pair of eyes in the crack at first; then, wider open, the whole thing
        c.eyes.visible = c.k > 0.08 && c.k <= 0.3;
        o.rig.root.visible = c.k > 0.3;
        if (o.rig.root.visible) {
          poseRig(o.rig, 'stare', g.t, 0.6, dt);
          // its mouth opening wider the further the door goes: all those teeth
          setMouth(o.rig, Math.min(1, Math.max(0, (c.k - 0.35) * 1.6)));
        }
      } else c.gusEyes.visible = true;
      // the breathing, louder the closer you are
      o.breathT -= dt;
      if (o.breathT <= 0) {
        o.breathT = 2.4;
        const near = Math.min(...g.alive().map((p) => p.pos.distanceTo(c.pos)));
        const same = g.alive().some((p) => this.floorAt(p.pos) === c.floor);
        sfx.plexBreath(Math.max(0.12, Math.min(1, (same ? 1.25 : 0.5) - near / 20)));
        if (c.k > 0.55) sfx.rattle(c.pos);
      }
      if (c.k >= 1) {
        if (o.gus) this.gusOut();
        else this.burst(o);
        if (g.mode !== 'escape') return;
      }
    }
  }

  // It's out. It comes for you wherever you are.
  burst(o) {
    const g = this.game;
    const c = o.closet;
    const root = o.rig.root;
    root.parent?.remove(root);
    g.scene.add(root);
    root.scale.setScalar(1);
    o.who.pos.copy(c.face);
    const prey = g.alive().slice().sort((a, b) => a.pos.distanceTo(c.pos) - b.pos.distanceTo(c.pos))[0] || g.lead;
    g.withPlayer(prey, () => this.caught(o.who, `${o.name} burst out of ${c.name}!`));
    if (g.mode === 'escape') {
      // (Spooky's second chance, or the other player's still in): back into its closet
      this.putIn(o, c);
      this.quiet(o, false);
    }
  }

  // ── Gus ───────────────────────────────────────────────────────────────

  gusOut() {
    const o = this.gus, g = this.game, c = o.closet;
    o.state = 'out';
    c.k = 0;
    c.hinge.rotation.y = 0;
    c.gusEyes.visible = false;
    c.occ = null;
    c.gus = false;
    o.prey = g.alive().slice().sort((a, b) => a.pos.distanceTo(c.pos) - b.pos.distanceTo(c.pos))[0] || g.lead;
    o.outT = this.def.gusOut;
    o.hidT = 0;
    o.rig.root.visible = true;
    sfx.musicBoxSting();
    sfx.heartbeat(1);
    g.hud.toast('🪞 Gus got out... and he\'s RIGHT BEHIND YOU. You\'ll only see him in a mirror. HIDE IN AN EMPTY CLOSET!', 5);
  }

  tickGus(dt) {
    const o = this.gus, g = this.game;
    if (!o || o.state !== 'out') return;
    const p = o.prey && !o.prey.out ? o.prey : g.lead;
    o.prey = p;
    // right behind you, wherever you go (only a mirror shows him)
    const f = p.forward2();
    const behind = p.hiding ? p.hiding.out : new THREE.Vector3(p.pos.x - f.x * 1.3, 0, p.pos.z - f.z * 1.3);
    const root = o.rig.root;
    root.position.lerp(new THREE.Vector3(behind.x, 0, behind.z), Math.min(1, dt * 5));
    root.rotation.set(0, Math.atan2(p.pos.x - root.position.x, p.pos.z - root.position.z), 0);
    poseRig(o.rig, p.moving > 0.2 ? 'walk' : 'stare', g.t * (p.moving > 0.2 ? 6 : 1), 0.8, dt);
    if (p.hiding && p.hiding.closet) {
      o.hidT += dt;
      if (o.hidT >= this.def.gusHide) {
        // he gives up, and creeps off into a different closet
        const empty = this.decor.closets.filter((x) => !x.occ && x !== p.hiding.closet);
        const to = empty[Math.floor(Math.random() * empty.length)];
        o.state = 'wait';
        o.closet = to;
        to.occ = o;
        to.gus = true;
        o.timer = rand(...this.def.quiet) + 4;
        root.visible = false;
        sfx.plexScurry();
        g.hud.toast('😮‍💨 ...the music stopped. Gus is gone — back into one of the closets. You can come out.', 4);
        this.check('hide');
        this.check('use', 'hidegus');
      }
      return;
    }
    o.outT -= dt * this.pace;
    if (Math.random() < dt * 0.6) sfx.heartbeat(Math.min(1, 1 - o.outT / this.def.gusOut + 0.3));
    if (o.outT <= 0) {
      this.gusLayer(0);
      o.who.pos.copy(root.position);
      g.withPlayer(p, () => this.caught(o.who, 'Gus was right behind you!'));
      if (g.mode === 'escape') {
        // (a second chance): he lets go and slinks back into a closet
        this.gusLayer(1);
        o.outT = this.def.gusOut;
      }
    }
  }

  // ── 6 AM ──────────────────────────────────────────────────────────────

  // (every level's questDone hands its quests here)
  onQuest(q) {
    if (q.id !== 'survive') return;
    const g = this.game;
    this.sixAM = true;
    for (const o of this.occ) { o.state = 'wait'; o.closet.k = 0; o.closet.hinge.rotation.y = 0; o.closet.eyes.visible = false; o.rig.root.visible = false; }
    if (this.gus) { this.gus.state = 'wait'; this.gus.rig.root.visible = false; for (const c of this.decor.closets) c.gusEyes.visible = false; }
    if (this.hiding) this.unhideCloset();
    sfx.sixAM();
    this.say(this.def.n === 10 ? 'Is that... a car in the driveway? GRAMMA!' : 'It\'s 6 AM... that\'s Gramma\'s key in the front door!', 3.5);
    setTimeout(() => { if (g.mode === 'escape' && this.sixAM) this.win(); }, 3200);
  }

  // ── The HUD ───────────────────────────────────────────────────────────

  // What's breathing, and where — or Gus, right behind you.
  alertText(p = this.player) {
    const o = this.gus;
    if (o && o.state === 'out' && o.prey === p) {
      if (p.hiding) return `🤫 HIDING... GUS IS RIGHT OUTSIDE (${Math.max(0, Math.ceil(this.def.gusHide - o.hidT))})`;
      return `🪞 GUS IS RIGHT BEHIND YOU — HIDE IN AN EMPTY CLOSET! (${Math.max(0, Math.ceil(o.outT))})`;
    }
    const br = this.occ.concat(o ? [o] : []).filter((x) => x.state === 'breath').sort((a, b) => b.closet.k - a.closet.k);
    if (!br.length) return '';
    const bar = (k) => '▮'.repeat(1 + Math.floor(k * 4)) + '▯'.repeat(4 - Math.floor(k * 4));
    return br.map((x) => {
      const c = x.closet;
      if (x.gus) return `👂 BREATHING ${bar(c.k)} ... but WHERE? Look in a mirror 🪞`;
      return `👂 BREATHING ${bar(c.k)} ${c.name.toUpperCase()} · ${c.room} (${FLOORS[c.floor].name})`;
    }).join('   ');
  }

  updateHud(dt) {
    super.updateHud(dt);
    const alert = $('escAlert');
    const t = this.alertText();
    if (t) { alert.textContent = t; alert.classList.remove('hidden'); }
    $('wmTracker').textContent = '';
    $('wmTracker').classList.add('hidden');
  }

  paneInfo(p) {
    const info = super.paneInfo(p);
    return { ...info, alert: this.game.withPlayer(p, () => this.alertText(p)) || info.alert };
  }

  tracked() { return []; }

  // On the title screen: a badge for getting through to the morning Gramma came home.
  titleBadge() { $('closetsTag')?.classList.toggle('hidden', !this.save.done); }

  // ── The mirrors ───────────────────────────────────────────────────────
  //
  // Called by the game just before it draws (game.render). When you're on a floor with a
  // mirror and looking its way, it shows: the closet Gus is hiding in (his eyes in the crack,
  // which only show in a mirror), or — when he's out — the hall behind you, with him in it.
  renderExtras(renderer, scene, dt) {
    if (this.game.mode !== 'escape' || !this.level || !this.mirrorRT) return;
    this.mirrorT -= dt;
    if (this.mirrorT > 0) return;
    this.mirrorT = 1 / 20;
    const p = this.game.lead, cam = p.camera;
    const floor = this.floorAt(p.pos);
    const m = this.decor.mirrors.find((x) => x.floor === floor);
    if (!m) return;
    const to = m.pos.clone().sub(cam.position);
    const dist = to.length();
    const fwd = new THREE.Vector3();
    cam.getWorldDirection(fwd);
    if (dist > 16 || fwd.dot(to.normalize()) < 0.35) return;
    const mc = this.mirrorCam;
    const o = this.gus;
    const lamp = this.mirrorLamp();
    if (o && o.state !== 'out') {
      // the closet he's in: as if the mirror were looking right at it
      const c = o.closet;
      c.gusEyes.visible = true;
      mc.position.copy(c.face).addScaledVector(c.front, 1.9).setY(1.45);
      mc.lookAt(c.pos.x, 1.25, c.pos.z);
      mc.near = 0.05;
      lamp.position.copy(mc.position);
    } else {
      // a mirror: you, reflected — and anything behind you. The camera's your eye mirrored
      // through the glass, so it's behind the wall: everything nearer than the glass is
      // clipped off (the near plane).
      const px = m.pos.x;
      mc.position.set(2 * px - cam.position.x, cam.position.y, cam.position.z);
      const d = new THREE.Vector3(-fwd.x, fwd.y, fwd.z);
      mc.lookAt(mc.position.clone().add(d));
      mc.near = Math.max(0.05, Math.abs(mc.position.x - px) * 0.97);
      lamp.position.set(cam.position.x, 1.8, cam.position.z);
    }
    mc.updateProjectionMatrix();
    // (your own flashlight would only glare; and a magic mirror sees in the dark, like the
    // cameras do — Lighting.setCams)
    const was = p.flashlight.intensity;
    p.flashlight.intensity = 0;
    this.game.lighting.setCams(true);
    lamp.intensity = 7;
    // (the mirror can't be in its own reflection: WebGL won't draw a texture into itself, and
    // the back of its frame would fill the view)
    for (const x of this.decor.mirrors) x.group.visible = false;
    renderer.setRenderTarget(this.mirrorRT);
    renderer.render(scene, mc);
    renderer.setRenderTarget(null);
    for (const x of this.decor.mirrors) x.group.visible = true;
    lamp.intensity = 0;
    this.game.lighting.setCams(false);
    p.flashlight.intensity = was;
    if (!this.lookedInMirror && dist < 9) {
      this.lookedInMirror = true;
      this.check('use', 'mirror');
      if (o && o.state !== 'out') this.game.hud.toast(`🪞 In the mirror: two orange eyes, peeking out of ${o.closet.name} (${o.closet.room}, ${FLOORS[o.closet.floor].name})...`, 4);
    }
    // what the mirror shows, in words (once you're close)
    if (o && o.state !== 'out' && dist < 9) {
      const key = o.closet.id;
      if (this.mirrorSaid !== key) {
        this.mirrorSaid = key;
        this.game.hud.toast(`🪞 Gus is in ${o.closet.name} (${o.closet.room}, ${FLOORS[o.closet.floor].name}).`, 3);
      }
    }
  }

  // A light that's only on while a mirror's being drawn (so what's in it shows up). It's in
  // the scene all the time at 0, so turning it on and off never changes the light count.
  mirrorLamp() {
    if (!this.lamp) {
      this.lamp = new THREE.PointLight(0xd8e4ff, 0, 11, 1.2);
      this.game.scene.add(this.lamp);
    }
    return this.lamp;
  }

  leave() {
    super.leave();
    if (this.rigs.gus) this.rigs.gus.root.visible = false;
    for (const o of this.occ) if (o.rig.root.parent === this.game.scene) o.rig.root.visible = false;
    this.sixAM = false;
  }

  // ── From the console (?debug=1) ───────────────────────────────────────

  // __game.closets.breathe(0) makes the first one start breathing now; breathe('gus') does Gus.
  breathe(i = 0) {
    const o = i === 'gus' ? this.gus : this.occ[i];
    if (o && o.state === 'wait') o.timer = 0;
    return o && o.closet.name;
  }
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export { CLOSETS_STORY };
