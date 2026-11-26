// The shadow animatronics (the designer's idea): once in a thousand nights — any night at Gus's
// PlayPlace, any level of any story — one of the animatronics that's there that night comes
// back as its shadow: pitch black, with white glowing eyes. It drifts straight at you, through
// the walls, and nothing can stop it: not a hiding spot, not Spooky's second chance, not the
// Shop's extra life, not the lucky coin. "It kills you automatically... but it's super rare."
// (Getting caught is still just GOTCHA! and a retry.)
//
// `roll()` is called whenever a night or a level starts; `update()` every step while you're
// playing. From the console (?debug=1): `__game.shadows.summon()` brings one now, and
// `__game.shadows.force = true` makes the next night have one.
import * as THREE from 'three';
import { buildAnimatronic, poseRig } from './models.js';
import { CREW } from './closets/mode.js';
import { sfx } from './audio.js';
import { GLOW } from './config.js';

export const SHADOW_CHANCE = 1 / 1000;

const BODY = new THREE.MeshLambertMaterial({ color: 0x0e0818, emissive: 0x07030d });
const EYES = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(Math.max(1, GLOW * 0.6)) });
const BUILDABLE = new Set(['gus', 'cranker', 'chomper', 'gerald', 'flipper', 'moony', 'sunny']);

// Who's there tonight, to be the shadow: { name, build }.
function candidates(g) {
  if (g.mode === 'escape' && g.story) {
    const list = g.story.enemies
      .filter((e) => e.def && e.def.build && e.rig && (e.rig.eyeMat || e.rig.eyeMats) && !['grumble', 'peter'].includes(e.id))
      .map((e) => ({ name: e.name, build: e.def.build }));
    if (list.length) return list;
    if (g.story === g.closets) return CREW.map((c) => ({ name: c.name, build: c.build }));
  }
  const bots = [...g.bots, ...(g.wingBots || [])].filter((a) => a.root.visible && BUILDABLE.has(a.id));
  if (bots.length) return bots.map((a) => ({ name: a.name, build: () => buildAnimatronic(a.id) }));
  return [{ name: 'Gus', build: () => buildAnimatronic('gus') }];
}

// Paint an animatronic black, all but its eyes.
function shadowOf(rig) {
  const eyes = new Set(rig.pupils || []);
  rig.root.traverse((o) => {
    if (!o.isMesh) return;
    o.material = eyes.has(o) || o.material === rig.eyeMat ? EYES : BODY;
    o.castShadow = false;
  });
  rig.eyeMat = EYES;
  rig.eyeMats = null;
  rig.eyeColor = new THREE.Color(0xffffff);
  rig.eyeballs = [];
  return rig;
}

export class Shadows {
  constructor(game) {
    this.game = game;
    this.armed = null;     // tonight's the night: { t } seconds until it comes
    this.actor = null;     // the shadow itself, once it's here
    this.force = false;
  }

  // A night or a level is starting.
  roll() {
    this.clear();
    if (!this.force && Math.random() >= SHADOW_CHANCE) return;
    this.force = false;
    this.armed = { t: 20 + Math.random() * 70 };
  }

  // (debug) One comes right now.
  summon() { this.clear(); this.armed = { t: 0.5 }; }

  clear() {
    if (this.actor) {
      this.actor.root.visible = false;
      this.game.scene.remove(this.actor.root);
    }
    this.actor = null;
    this.armed = null;
  }

  update(dt) {
    const g = this.game;
    if (this.armed) {
      this.armed.t -= dt;
      if (this.armed.t <= 0) { this.armed = null; this.appear(); }
      return;
    }
    const a = this.actor;
    if (!a) return;
    if (a.done) { if (g.mode !== 'jumpscare' && g.mode !== 'escScare') this.clear(); return; }
    a.t += dt;
    a.animT += dt;
    // after whoever it came for: right through the walls
    const p = a.prey && !a.prey.out ? a.prey : g.lead;
    a.prey = p;
    const dx = p.pos.x - a.pos.x, dz = p.pos.z - a.pos.z, d = Math.hypot(dx, dz);
    // (you can't outrun it: get too far away and it's right behind you again)
    if (d > 15) {
      const f = p.forward2();
      a.pos.set(p.pos.x - f.x * 6, 0, p.pos.z - f.z * 6);
      sfx.staticHiss(0.3);
    } else if (d > 0.1) {
      const step = Math.min(d, (a.t < 1.6 ? 0.4 : 3.6) * dt);
      a.pos.x += (dx / d) * step;
      a.pos.z += (dz / d) * step;
    }
    a.yaw = Math.atan2(dx, dz);
    a.root.position.set(a.pos.x, g.place.floorAt(a.pos.x, a.pos.z), a.pos.z);
    a.root.rotation.set(0, a.yaw, 0);
    // a flicker now and then, like a bad signal
    a.root.visible = Math.random() > 0.04;
    poseRig(a.rig, a.t < 1.6 ? 'stare' : 'walk', a.animT * 3, 0.5, dt);
    a.hum -= dt;
    if (a.hum <= 0) { a.hum = 1.4; sfx.heartbeat(Math.min(1, 1.2 - d / 15)); }
    if (d < 1.3 || a.t > 9) this.strike(a, p);
  }

  // It shows up a little way behind whoever it's after, staring.
  appear() {
    const g = this.game;
    if (!g.hunting) return;
    const pick = candidates(g);
    const c = pick[Math.floor(Math.random() * pick.length)];
    const rig = shadowOf(c.build());
    rig.root.rotation.order = 'YXZ';
    g.scene.add(rig.root);
    const alive = g.alive();
    const prey = alive[Math.floor(Math.random() * alive.length)] || g.lead;
    const f = prey.forward2();
    const pos = new THREE.Vector3(prey.pos.x - f.x * 9, 0, prey.pos.z - f.z * 9);
    const name = `Shadow ${c.name}`;
    this.actor = {
      shadow: true, id: 'shadow', name, rig, root: rig.root, pos, yaw: 0, prey, t: 0, animT: 0, hum: 0,
      state: 'shadow', frozen: 0, lastSeen: pos.clone(), def: { id: 'shadow', kind: 'shadow' },
      title: 'A SHADOW!',
      why: `${name} got you. Nothing can stop a shadow — but they almost never come. (1 night in 1,000!)`,
      tip: 'You saw a shadow! Most people never do. Try again — it probably won\'t come back.',
      render: () => {}, goTo() {}, stagger() {}, reveal() {}, distToPlayer: () => Math.hypot(prey.pos.x - pos.x, prey.pos.z - pos.z),
    };
    sfx.staticHiss(0.5);
    sfx.whisper(true);
  }

  // Got you. (Story modes and the nights each have their own way of catching you.)
  strike(a, p) {
    const g = this.game;
    g.withPlayer(p, () => {
      if (g.mode === 'escape') {
        const m = g.story;
        m.grace = 0;
        m.caught(a, a.why);
      } else {
        g.grace = 0;
        g.caught(a);
      }
    });
    if (g.mode === 'jumpscare' || g.mode === 'escScare' || g.mode !== 'escape' && g.mode !== 'night' && g.mode !== 'home') {
      a.done = true;
      a.root.visible = true;
      g.profile.stats.shadows = (g.profile.stats.shadows || 0) + 1;
      g.save();
    }
  }
}
