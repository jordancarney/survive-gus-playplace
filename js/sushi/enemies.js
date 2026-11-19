// What's after you in Sushi's Pizzaplex, on top of When Jonathan Was Five's Stalker (which
// walks its rounds, sees and hears you, chases, searches, and pulls you out of a hiding spot
// it saw you get into):
//
//   Puppet   Gerald, hanging from the ceiling on his strings: he rides straight over the ball
//            pit and the pool, feet dangling, and swoops down when he's close.
//   Rider    Chomper's runaway coaster cart and Flipper's go-kart: they stay on their track,
//            speed up when they see you near it, and run you over if you're on it.
//   Blinker  Moony: never leaves Laser Tag, and when you aren't looking he can vanish and
//            turn up somewhere else in it.
//   Springer Peter, in the old otter suit: slow, springlocks clicking, never gives up. He
//            stoops through the ducts.
import * as THREE from 'three';
import { Stalker } from '../escape/enemies.js';
import { poseRig, setEyes } from '../models.js';
import { setStrings, cutStrings, seat } from './cast.js';
import { sfx } from '../audio.js';

const tmp = new THREE.Vector3();

// Is this point on whoever's playing's screen, with nothing in the way?
function onScreen(m, pos, h = 1.6) {
  const p = m.player, cam = p.camera;
  const head = tmp.set(pos.x, h, pos.z);
  const dx = head.x - cam.position.x, dy = head.y - cam.position.y, dz = head.z - cam.position.z;
  const d = Math.hypot(dx, dy, dz);
  if (d > 30) return false;
  const f = p.aimDir();
  if ((f.x * dx + f.y * dy + f.z * dz) / d < 0.6) return false;
  return m.place.sightClear(cam.position, head);
}

// ── Gerald on his strings ───────────────────────────────────────────────

export class Puppet extends Stalker {
  reset() {
    super.reset();
    this.hang = this.def.hang ?? 1.0;
    this.good = false;
    cutStrings(this.rig, false);
    this.sway = 0;
  }

  // He rides the ceiling, so furniture doesn't stop him: straight there if no wall's in the
  // way, round by the floor plan if there is.
  goTo(point) {
    this.dest = point.clone();
    this.path = this.place.sightClear(this.pos, point) ? [point.clone()] : this.place.findPath(this.pos, point);
    this.stuck = 0;
  }

  follow(dt, speed) {
    if (!this.path.length) return true;
    const wp = this.path[0];
    const dx = wp.x - this.pos.x, dz = wp.z - this.pos.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.3) { this.path.shift(); return this.path.length === 0; }
    const step = Math.min(d, speed * dt);
    this.pos.x += (dx / d) * step;
    this.pos.z += (dz / d) * step;
    this.turnToward(dx, dz, dt, 6);
    this.speed = step / dt;
    return false;
  }

  // Everyone can see a giant gorilla hanging from the ceiling, so the chase cuts straight
  // across when nothing but furniture is in the way.
  update(dt) {
    if (this.good) { this.renderGood(dt); return; }
    if (this.state === 'chase' && this.senses() && this.place.sightClear(this.eye(), this.mode.player.pos)) {
      this.path = [this.mode.player.pos.clone()];
    }
    super.update(dt);
  }

  // A noisy toy (or anything else): come and look, from wherever he is.
  alert(point, loud = true) {
    if (this.good || !['wait', 'roam', 'linger', 'search'].includes(this.state)) return;
    this.state = 'search';
    this.searchRun = loud;
    this.goTo(point);
  }

  render(dt) {
    super.render(dt);
    const close = this.chasing && this.distToPlayer() < 5;
    const want = close || this.state === 'getHidden' ? 0.1 : this.hang;
    this.y = (this.y ?? want) + (want - (this.y ?? want)) * Math.min(1, dt * 3);
    this.sway += dt * (1.2 + this.speed * 0.4);
    const r = this.root;
    r.position.y = this.y;
    r.rotation.z = Math.sin(this.sway) * 0.07;
    r.rotation.x = Math.sin(this.sway * 0.7) * 0.05 + (this.speed > 1 ? 0.12 : 0);
    setStrings(this.rig, this.place.wallH + 0.2);
  }

  // Good now: the strings fell away, and he stands on his own two feet.
  makeGood() {
    this.good = true;
    this.state = 'off';
    this.path = [];
    cutStrings(this.rig, true);
    setEyes(this.rig, 'friend');
  }

  renderGood(dt) {
    this.animT += dt;
    this.y = (this.y ?? 0) * (1 - Math.min(1, dt * 4));
    const r = this.root;
    r.position.set(this.pos.x, this.y, this.pos.z);
    r.rotation.set(0, this.yaw, 0);
    poseRig(this.rig, this.waving ? 'wave' : 'idle', this.animT, 0.5, dt);
  }

  get dangerous() { return !this.good && super.dangerous; }
}

// ── Riders ──────────────────────────────────────────────────────────────
//
// `def.track`: plan points it rides between, in order; `loop` (back to the first) or back and
// forth. `speed` cruising, `boost` how much faster once it's seen you, `sight` how far.

export class Rider {
  constructor(mode, def) {
    this.mode = mode;
    this.def = def;
    this.id = def.id;
    this.rig = def.build();
    this.root = this.rig.root;
    this.root.visible = false;
    mode.game.scene.add(this.root);
    this.pos = new THREE.Vector3();
    this.lastSeen = new THREE.Vector3();
    this.path = [];
    this.animT = 0;
    this.reset();
  }

  get name() { return this.def.name; }
  get place() { return this.mode.place; }
  get dangerous() { return this.state === 'ride'; }
  get chasing() { return this.state === 'ride' && this.boostT > 0; }

  reset() {
    this.pts = this.def.track.map(([x, z]) => this.mode.place.P(x, z));
    this.i = this.def.from ?? 0;
    this.dir = 1;
    this.pos.copy(this.pts[this.i]);
    this.yaw = 0;
    this.state = this.def.asleep ? 'off' : 'ride';
    this.boostT = 0;
    this.frozen = 0;
    this.honk = 0;
    this.clack = 0;
    this.speed = 0;
    this.root.visible = true;
    this.next();
    setEyes(this.rig, this.def.asleep ? 'off' : 'on');
    this.render(1 / 60);
  }

  wake() { if (this.state === 'off') { this.state = 'ride'; setEyes(this.rig, 'on'); sfx.reboot(this.pos); } }
  sleep() { this.state = 'off'; setEyes(this.rig, 'off'); }

  // (when you wriggle free, everything else goes off to search; a rider just keeps riding)
  goTo() {}
  alert() {}

  distToPlayer() {
    const p = this.mode.player.pos;
    return Math.hypot(p.x - this.pos.x, p.z - this.pos.z);
  }

  next() {
    const n = this.pts.length;
    let j = this.i + this.dir;
    if (this.def.loop) j = (j + n) % n;
    else if (j < 0 || j >= n) { this.dir = -this.dir; j = this.i + this.dir; }
    this.j = j;
  }

  update(dt) {
    const m = this.mode;
    this.animT += dt;
    if (this.frozen > 0) this.frozen -= dt;
    if (this.state !== 'ride') { this.render(dt); return; }
    // Spot you near the track: faster!
    const d = this.distToPlayer();
    const sees = !m.hiding && m.grace <= 0 && d < (this.def.sight || 12) &&
      this.place.sightClear(tmp.set(this.pos.x, 1.2, this.pos.z), m.player.pos);
    if (sees) {
      if (this.boostT <= 0 && d < 10) {
        sfx.spotted();
        if (this.def.shout) m.say(this.def.shout(), 2.2, this.def.name);
      }
      this.boostT = 2.5;
      this.lastSeen.copy(m.player.pos);
    } else this.boostT = Math.max(0, this.boostT - dt);
    const sp = (this.def.speed || 5) * (this.boostT > 0 ? (this.def.boost || 1.6) : 1) * m.game.diff.speed * (this.frozen > 0 ? 0 : 1);
    // along the track
    let left = sp * dt;
    let guard = 0;
    while (left > 0 && guard++ < 8) {
      const wp = this.pts[this.j];
      const dx = wp.x - this.pos.x, dz = wp.z - this.pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist <= left) {
        this.pos.copy(wp);
        left -= dist;
        this.i = this.j;
        this.next();
      } else {
        this.pos.x += (dx / dist) * left;
        this.pos.z += (dz / dist) * left;
        left = 0;
        let diff = Math.atan2(dx, dz) - this.yaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.yaw += diff * Math.min(1, dt * 7);
      }
    }
    this.speed = sp;
    // the rattle of the wheels, faster the faster it goes
    this.clack -= dt * sp;
    if (this.clack <= 0) { this.clack = 2.2; sfx.step(this.def.steps || 'chomper', this.pos); }
    // Run over!
    if (!m.hiding && !m.unseen && m.grace <= 0 && this.frozen <= 0 && d < (this.def.reach || 1.2)) {
      m.caught(this, this.def.why || `${this.name} ran you over!`);
    }
    this.render(dt);
  }

  render(dt) {
    const r = this.root;
    r.position.set(this.pos.x, this.place.floorAt(this.pos.x, this.pos.z), this.pos.z);
    r.rotation.set(0, this.yaw, Math.sin(this.animT * 18) * 0.01 * Math.min(1, this.speed / 4));
    poseRig(this.rig, this.chasing ? 'stare' : 'idle', this.animT, 0.3, dt);
    seat(this.rig);
  }
}

// ── Moony ───────────────────────────────────────────────────────────────

export class Blinker extends Stalker {
  reset() {
    super.reset();
    this.blinkT = 6 + Math.random() * 6;
  }

  // He never leaves home: if you get out of it, he lets you go.
  homeHas(v) { return this.def.roam.includes(this.place.roomAt(v.x, v.z)); }

  update(dt) {
    const m = this.mode;
    if (this.state !== 'off') {
      if (this.chasing && !this.homeHas(m.player.pos)) {
        this.state = 'search';
        this.searchRun = false;
        this.goTo(this.place.randomPointIn(this.def.roam[0]));
      }
      // when nobody's looking: blink, and he's somewhere else
      this.blinkT -= dt;
      if (this.blinkT <= 0 && !onScreen(m, this.pos, 1.5)) {
        this.blinkT = 7 + Math.random() * 7;
        const near = this.chasing || Math.random() < 0.35;
        let to = null;
        for (let k = 0; k < 12 && !to; k++) {
          const c = this.place.randomPointIn(this.def.roam[Math.floor(Math.random() * this.def.roam.length)]);
          const d = Math.hypot(c.x - m.player.pos.x, c.z - m.player.pos.z);
          if (d > 4.5 && (!near || d < 10) && !onScreen(m, c, 1.5)) to = c;
        }
        if (to) {
          this.pos.copy(to);
          this.path = [];
          if (this.state === 'chase') this.path = this.place.findPath(this.pos, this.lastSeen);
          else { this.state = 'linger'; this.timer = 1.5; }
          if (this.distToPlayer() < 14) sfx.staticHiss(0.35);
        }
      }
    }
    super.update(dt);
  }
}

// ── Peter ───────────────────────────────────────────────────────────────

export class Springer extends Stalker {
  update(dt) {
    super.update(dt);
    if (this.state === 'off') return;
    this.click = (this.click ?? 0) - dt;
    if (this.speed > 0.3 && this.click <= 0) { this.click = 0.55 + Math.random() * 0.3; sfx.clicks(this.pos); }
  }

  // (slower in the ducts: bent double, with his springlocks catching)
  speedMult() { return super.speedMult() * (this.low ? 0.55 : 1); }

  render(dt) {
    super.render(dt);
    // slumped in his chair, until he isn't
    if (this.state === 'off' && this.def.sit) {
      this.rig.legL.rotation.x = this.rig.legR.rotation.x = -1.5;
      this.rig.torso.rotation.x = -0.25;
      this.rig.head.rotation.x = 0.45;
      this.root.position.y = -0.12;
      return;
    }
    // in the ducts he has to stoop right over
    const low = this.low = (this.mode.decor.vents || []).some((z) => {
      const a = this.place.P(z.x0, z.z0), b = this.place.P(z.x1, z.z1);
      return this.pos.x > a.x && this.pos.x < b.x && this.pos.z > a.z && this.pos.z < b.z;
    }) || !!this.def.stoop;
    if (low) {
      this.rig.torso.rotation.x = 1.0;
      this.rig.head.rotation.x = -0.9;
      this.root.position.y -= 0.45;
    }
  }
}

// Peter's springlocks click as he moves (also in the cutscene).
export { sfx };
