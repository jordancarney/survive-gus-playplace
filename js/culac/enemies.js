// What's after Jimmy at Culac's Daycare, on top of When Jonathan Was Five's Stalker (walks its
// rounds, sees and hears you, chases, searches, pulls you out of a hiding spot it saw you get
// into) and Sushi's Pizzaplex's Blinker (Moony, who blinks from place to place):
//
//   Raider    every animatronic that can go for the kids asleep in the Beds (the designer: if
//             one gets there "it takes a kid", and you have to go and rescue them). The mode
//             sends one off now and then; it carries the kid home to its own room. And in a
//             place this big it now and then heads for wherever you are, roughly.
//   Crier     Mean Baby: when it sees you it CRIES, and everything nearby comes running.
//   Wirer     Roglego: once it's after you, its wires go straight through the walls.
//   Flyer     Ouchie: flies over everything, up by the roof, and swoops down to grab you.
//             He can't open a hiding spot.
//   Jumper    Gokupug: a super jump, really high, landing right next to you.
//   Drifter   Sunny, made of fog: only your flashlight shows her, and she drifts through
//             the walls of her maze.
//   Guard     Officer Grumble: watches the cameras and radios where you are, and walks his
//             rounds with a huge flashlight — if it lands on you, he chases you.
import * as THREE from 'three';
import { Stalker } from '../escape/enemies.js';
import { poseRig, setEyes } from '../models.js';
import { sfx } from '../audio.js';
import { resolveCircle } from '../physics.js';

const tmp = new THREE.Vector3();
const rand = (a, b) => a + Math.random() * (b - a);

// ── Raiders ─────────────────────────────────────────────────────────────

export class Raider extends Stalker {
  reset() {
    super.reset();
    this.raidKid = null;
    this.carried = null;
  }

  get dangerous() { return super.dangerous || this.state === 'raid' || this.state === 'carry'; }
  get raiding() { return this.state === 'raid' || this.state === 'carry'; }

  goTo(point) {
    this.dest = point.clone();
    this.path = this.place.findPath(this.pos, point, this.def.budget || 45000);
    this.stuck = 0;
  }

  // Where to next: its own rooms — and in a place this big, now and then roughly wherever
  // you are (`near`: how often).
  pickDestination() {
    const m = this.mode, p = m.player.pos, d = this.def;
    const dist = this.distToPlayer();
    if (dist < (d.range || 260) && Math.random() < (d.near ?? 0.3) * (m.huntK || 1)) {
      for (let k = 0; k < 10; k++) {
        const a = Math.random() * Math.PI * 2, r = rand(8, 40);
        const x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r;
        if (this.place.isWalkable(x, z)) { this.goTo(tmp.set(x, 0, z)); return; }
      }
    }
    // somewhere in a room it likes, not too far from where it is
    const room = d.roam[Math.floor(Math.random() * d.roam.length)];
    let best = null;
    for (let k = 0; k < 6; k++) {
      const c = this.place.randomPointIn(room);
      const dd = Math.hypot(c.x - this.pos.x, c.z - this.pos.z);
      if (!best || dd < best.d) best = { c, d: dd };
      if (dd < 140) break;
    }
    this.goTo(best.c);
  }

  // Off to the Beds for a kid.
  startRaid(kid, at) {
    this.state = 'raid';
    this.raidKid = kid;
    this.raidAt = at.clone();
    this.goTo(at);
  }

  // It saw you on the way: it forgets the kid and comes for you instead (that's how you keep
  // them away from the beds).
  dropRaid() {
    if (this.state !== 'raid') return;
    this.mode.raidOff?.(this, 'distracted');
    this.raidKid = null;
  }

  update(dt) {
    const m = this.mode;
    if (this.state === 'raid' || this.state === 'carry') {
      this.animT += dt;
      this.speed = 0;
      const sensed = this.senses();
      if (sensed) this.lastSeen.copy(m.player.pos);
      if (this.state === 'raid') {
        if (sensed) { this.dropRaid(); this.notice(); }
        else {
          const there = this.follow(dt, (this.def.walk || 2) * 1.45 * this.speedMult());
          if (Math.hypot(this.pos.x - this.raidAt.x, this.pos.z - this.raidAt.z) < 2.6) {
            this.state = 'carry';
            this.carried = this.raidKid;
            this.raidKid = null;
            m.raidGrab?.(this, this.carried);
            this.goTo(this.place.P(...this.def.start));
          } else if (there) this.goTo(this.raidAt);
        }
      } else {
        // carrying a kid home: only if you're right there does it drop everything for you
        if (sensed && this.distToPlayer() < 5) {
          m.raidDrop?.(this, this.carried, true);
          this.carried = null;
          this.notice();
        } else {
          const home = this.place.P(...this.def.start);
          const there = this.follow(dt, (this.def.walk || 2) * 1.2 * this.speedMult());
          if (Math.hypot(this.pos.x - home.x, this.pos.z - home.z) < 3) {
            m.raidDrop?.(this, this.carried, false);
            this.carried = null;
            this.state = 'wait';
            this.timer = 6;
          } else if (there) this.goTo(home);
        }
      }
      if (this.dangerous && !m.hiding && !m.unseen && m.grace <= 0 && this.frozen <= 0 &&
          this.distToPlayer() < (this.def.reach || 1.05) + this.rig.radius * 0.4 && this.place.sightClear(this.eye(), m.player.pos)) {
        m.caught(this);
      }
      this.footsteps(dt);
      this.render(dt);
      return;
    }
    super.update(dt);
  }

  render(dt) {
    super.render(dt);
    if (this.carried) {
      // holding the kid out in front, like a sack of laundry
      poseRig(this.rig, 'give', this.animT, 1, dt);
      const k = (this.carried.person || this.carried).root;
      const f = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
      k.position.set(this.pos.x + f.x * 0.55, (this.rig.height || 1.8) * 0.45, this.pos.z + f.z * 0.55);
      k.rotation.set(0, this.yaw + Math.PI / 2, Math.PI / 2, 'YXZ');
    }
  }
}

// ── Mean Baby ───────────────────────────────────────────────────────────

export class Crier extends Stalker {
  reset() {
    super.reset();
    this.cryT = 0;
  }

  goTo(point) { Raider.prototype.goTo.call(this, point); }
  pickDestination() { Raider.prototype.pickDestination.call(this); }

  notice() {
    super.notice();
    if (this.cryT > 0) return;
    this.cryT = this.def.cryEvery || 22;
    sfx.babyWail(this.pos);
    const m = this.mode;
    if (this.distToPlayer() < 40) m.say('WAAAAAAAH!! WAAAAAAAAAAH!!', 2.4, 'Mean Baby');
    // everything that can hear it comes to look
    for (const e of m.enemies) {
      if (e === this || !e.alert || e.state === 'off') continue;
      if (e.raiding) continue;
      if (Math.hypot(e.pos.x - this.pos.x, e.pos.z - this.pos.z) < (this.def.callRange || 220)) e.alert(m.player.pos.clone());
    }
    m.game.hud.toast('😭 Mean Baby is CRYING — everyone heard that. Get out of there!', 3.4);
  }

  update(dt) {
    this.cryT = Math.max(0, this.cryT - dt);
    super.update(dt);
  }
}

// ── Roglego ─────────────────────────────────────────────────────────────

export class Wirer extends Raider {
  // When it's after you, it goes in a straight line, walls or no walls.
  get ghosting() { return this.state === 'chase' || (this.state === 'search' && this.searchRun) || this.state === 'notice'; }

  // It feels you through the walls when you're close, even walking.
  senses() {
    const m = this.mode, p = m.player;
    if (m.hiding || m.grace > 0 || m.unseen) return false;
    if (this.state !== 'off' && !p.crouching && this.distToPlayer() < (this.def.feel || 9)) return true;
    return super.senses();
  }

  follow(dt, speed) {
    if (!this.ghosting) return super.follow(dt, speed);
    const t = this.lastSeen;
    const dx = t.x - this.pos.x, dz = t.z - this.pos.z, d = Math.hypot(dx, dz);
    if (d < 0.3) return true;
    const step = Math.min(d, speed * 0.85 * dt);
    this.pos.x += (dx / d) * step;
    this.pos.z += (dz / d) * step;
    this.turnToward(dx, dz, dt, 8);
    this.speed = step / dt;
    this.wireT = (this.wireT || 0) - dt;
    if (this.id === 'roglego' && !this.place.isWalkable(this.pos.x, this.pos.z) && this.wireT <= 0) { this.wireT = 0.35; sfx.wires(this.pos); }
    return false;
  }

  update(dt) {
    // (through a wall, nothing's in the way of grabbing you either)
    if (this.ghosting) this.path = [this.lastSeen.clone()];
    super.update(dt);
    // once it's lost you, it climbs back out of whatever wall it's in
    if (!this.ghosting && !this.place.isWalkable(this.pos.x, this.pos.z)) {
      const s = resolveCircle(this.place.colliders, this.pos.x, this.pos.z, this.rig.radius * 0.8, 0.4, 1.8);
      this.pos.x = s.x; this.pos.z = s.z;
    }
  }
}

// ── Gokupug ─────────────────────────────────────────────────────────────

export class Jumper extends Raider {
  reset() {
    super.reset();
    this.jumpCd = 1.2;
    this.jump = null;
  }

  get dangerous() { return super.dangerous || !!this.jump; }
  get chasing() { return super.chasing || !!this.jump; }

  update(dt) {
    const m = this.mode;
    this.jumpCd = Math.max(0, this.jumpCd - dt);
    if (this.jump) { this.updateJump(dt); return; }
    super.update(dt);
    // chasing you, and you're a little way off: SUPER JUMP
    const d = this.distToPlayer();
    if (this.state === 'chase' && this.jumpCd <= 0 && d > 4 && d < (this.def.jumpRange || 26) && this.sinceSeen < 1.0 && !m.hiding) {
      this.jump = { phase: 'charge', t: 0 };
      m.say('HRRRRAAAAAAAH!!!', 1.6, 'Gokupug');
      sfx.pugJump(this.pos);
    }
  }

  updateJump(dt) {
    const m = this.mode, J = this.jump, p = m.player.pos;
    J.t += dt;
    this.animT += dt;
    if (J.phase === 'charge') {
      // crouch down, glowing, and pick where to land: right next to you
      this.turnToward(p.x - this.pos.x, p.z - this.pos.z, dt, 10);
      poseRig(this.rig, 'crouch', this.animT, 1, dt);
      this.root.position.set(this.pos.x, this.place.floorAt(this.pos.x, this.pos.z), this.pos.z);
      this.root.rotation.y = this.yaw;
      if (J.t > 0.75) {
        const dx = this.pos.x - p.x, dz = this.pos.z - p.z, dd = Math.hypot(dx, dz) || 1;
        let to = new THREE.Vector3(p.x + (dx / dd) * 1.3, 0, p.z + (dz / dd) * 1.3);
        if (!this.place.isWalkable(to.x, to.z)) to = p.clone().setY(0);
        Object.assign(J, { phase: 'air', t: 0, from: this.pos.clone(), to, len: 0.9 + Math.min(0.6, dd / 40) });
      }
      return;
    }
    if (J.phase === 'air') {
      const k = Math.min(1, J.t / J.len);
      this.pos.lerpVectors(J.from, J.to, k);
      const y = Math.sin(k * Math.PI) * (5 + J.from.distanceTo(J.to) * 0.12);
      this.root.position.set(this.pos.x, y, this.pos.z);
      this.root.rotation.y = this.yaw;
      poseRig(this.rig, 'chase', this.animT * 4, 1, dt);
      if (k >= 1) {
        J.phase = 'land';
        J.t = 0;
        sfx.junkLand(this.pos);
        m.game.effects.burst(this.pos.clone().setY(0.3), 18, 4);
        for (const pl of m.game.alive()) if (Math.hypot(pl.pos.x - this.pos.x, pl.pos.z - this.pos.z) < 12) pl.shake = Math.max(pl.shake || 0, 0.6);
        if (this.distToPlayer() < 1.7 && !m.hiding && m.grace <= 0) { this.jump = null; this.jumpCd = 7; m.caught(this, 'Gokupug landed right on top of you!'); }
      }
      return;
    }
    // landed: a moment to get your breath back — and that's your chance
    poseRig(this.rig, 'stare', this.animT, 1, dt);
    this.root.position.set(this.pos.x, this.place.floorAt(this.pos.x, this.pos.z), this.pos.z);
    if (J.t > 0.9) {
      this.jump = null;
      this.jumpCd = this.def.jumpEvery || 7;
      this.state = 'chase';
      this.lostTimer = 0;
      this.path = this.place.findPath(this.pos, m.player.pos, 8000);
    }
  }
}

// ── Sunny ───────────────────────────────────────────────────────────────

export class Drifter extends Stalker {
  get ghosting() { return this.state === 'chase' || this.state === 'search' || this.state === 'notice'; }
  goTo(point) { Raider.prototype.goTo.call(this, point); }

  follow(dt, speed) {
    if (!this.ghosting) return super.follow(dt, speed);
    return Wirer.prototype.follow.call(this, dt, speed * 0.85);
  }

  update(dt) {
    if (this.ghosting) this.path = [this.lastSeen.clone()];
    super.update(dt);
    // made of fog: you can only see her in a flashlight's beam, or right up close
    const g = this.mode.game;
    const seen = this.mode.inStory || this.mode.scarer === this ||
      g.alive().some((p) => this.inBeam(p) || Math.hypot(p.pos.x - this.pos.x, p.pos.z - this.pos.z) < 2.5);
    for (const c of this.root.children) c.visible = seen;
  }

  inBeam(p) {
    if (!p.lightOn || !p.lightVisible) return false;
    const dx = this.pos.x - p.pos.x, dz = this.pos.z - p.pos.z, d = Math.hypot(dx, dz);
    if (d > 26) return false;
    const a = p.aimDir();
    return (a.x * dx + a.z * dz) / (d * Math.hypot(a.x, a.z) || 1) > 0.9;
  }
}

// ── Ouchie ──────────────────────────────────────────────────────────────

const FLY_H = 9.5;

export class Flyer {
  constructor(mode, def) {
    this.mode = mode;
    this.def = def;
    this.id = def.id;
    this.rig = def.build();
    this.root = this.rig.root;
    this.root.rotation.order = 'YXZ';
    this.root.visible = false;
    mode.game.scene.add(this.root);
    this.pos = new THREE.Vector3();
    this.lastSeen = new THREE.Vector3();
    this.path = [];
    this.animT = Math.random() * 10;
    this.reset();
  }

  get name() { return this.def.name; }
  get place() { return this.mode.place; }
  get dangerous() { return this.state === 'swoop' || this.state === 'low'; }
  get chasing() { return this.state === 'swoop' || this.state === 'low' || this.state === 'screech'; }

  reset() {
    const d = this.def;
    this.pos.copy(this.mode.place.P(...d.start));
    this.alt = 7.2;
    this.yaw = d.yaw || 0;
    this.state = d.asleep ? 'off' : 'perch';
    this.timer = d.wait ?? rand(4, 8);
    this.dest = null;
    this.sinceSeen = 99;
    this.frozen = 0;
    this.speed = 0;
    this.root.visible = true;
    setEyes(this.rig, d.asleep ? 'off' : 'on');
    this.render(1 / 60);
  }

  wake() {
    if (this.state === 'off') { this.state = 'perch'; this.timer = 1; setEyes(this.rig, 'on'); sfx.hoot(this.pos); }
  }

  goTo(point) { this.dest = point.clone(); }
  alert(point) {
    if (this.state === 'off' || this.chasing) return;
    this.state = 'fly';
    this.dest = point.clone();
    this.circleT = 0;
  }
  onHide() { if (this.chasing) { this.state = 'climb'; this.mode.say('*SCREEEECH*... (Ouchie can\'t get into hiding spots!)', 2.4); } }

  distToPlayer() {
    const p = this.mode.player.pos;
    return Math.hypot(p.x - this.pos.x, p.z - this.pos.z);
  }

  speedMult() { return this.mode.game.diff.speed * (this.mode.speedK || 1); }

  // Up by the roof, he spots you on the floor below — unless there's a wall in the way, or
  // you're hiding, or crouched down and keeping still.
  senses() {
    const m = this.mode, p = m.player;
    if (m.hiding || m.grace > 0 || m.unseen) return false;
    const d = this.distToPlayer();
    const range = (this.def.sight || 20) * (p.crouching ? 0.45 : 1);
    if (d > range) return false;
    return this.place.sightClear(this.pos, p.pos);
  }

  pickDest() {
    const m = this.mode, p = m.player.pos;
    if (this.distToPlayer() < 300 && Math.random() < (this.def.near ?? 0.4)) {
      const a = Math.random() * Math.PI * 2, r = rand(5, 35);
      this.dest = new THREE.Vector3(p.x + Math.cos(a) * r, 0, p.z + Math.sin(a) * r);
      return;
    }
    const room = this.def.roam[Math.floor(Math.random() * this.def.roam.length)];
    this.dest = this.place.randomPointIn(room);
  }

  moveTo(t, speed, dt) {
    const dx = t.x - this.pos.x, dz = t.z - this.pos.z, d = Math.hypot(dx, dz);
    if (d < 0.4) return true;
    const step = Math.min(d, speed * dt);
    this.pos.x += (dx / d) * step;
    this.pos.z += (dz / d) * step;
    let diff = Math.atan2(dx, dz) - this.yaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.yaw += diff * Math.min(1, dt * 4);
    this.speed = step / dt;
    return false;
  }

  update(dt) {
    const m = this.mode;
    this.animT += dt;
    this.speed = 0;
    if (this.frozen > 0) this.frozen -= dt;
    const sensed = this.state !== 'off' && this.senses();
    this.sinceSeen = sensed ? 0 : this.sinceSeen + dt;
    if (sensed) this.lastSeen.copy(m.player.pos);
    const k = this.speedMult();
    const toAlt = (h, rate) => { this.alt += Math.max(-rate * dt, Math.min(rate * dt, h - this.alt)); };
    switch (this.state) {
      case 'off': break;
      case 'perch':
        this.timer -= dt;
        if (sensed) this.spot();
        else if (this.timer <= 0) { this.state = 'fly'; this.pickDest(); sfx.hoot(this.pos); }
        break;
      case 'fly':
        toAlt(FLY_H, 3);
        if (sensed) { this.spot(); break; }
        if (!this.dest) this.pickDest();
        if (this.moveTo(this.dest, (this.def.fly || 4.2) * k, dt)) { this.state = 'circle'; this.timer = rand(4, 9); this.circleC = this.pos.clone(); }
        break;
      case 'circle':
        toAlt(FLY_H, 3);
        if (sensed) { this.spot(); break; }
        this.timer -= dt;
        {
          const a = this.animT * 0.6;
          this.moveTo(tmp.set(this.circleC.x + Math.cos(a) * 6, 0, this.circleC.z + Math.sin(a) * 6), 3.2 * k, dt);
        }
        if (this.timer <= 0) { this.state = 'fly'; this.pickDest(); if (Math.random() < 0.4) sfx.hoot(this.pos); }
        break;
      case 'screech':
        // he's seen you: a screech, and a moment to run
        this.timer -= dt;
        toAlt(FLY_H, 3);
        if (this.timer <= 0) { this.state = 'swoop'; this.lostT = 0; }
        break;
      case 'swoop':
      case 'low': {
        const p = m.player.pos;
        if (!sensed) {
          this.lostT += dt;
          if (this.lostT > (this.def.lose || 2.5)) { this.state = 'climb'; break; }
        } else this.lostT = 0;
        const t = sensed ? p : this.lastSeen;
        const d = this.distToPlayer();
        // straight at you, coming down as he comes
        toAlt(Math.min(FLY_H, 1.1 + d * 0.45), this.state === 'swoop' ? 6 : 4);
        this.moveTo(t, (this.def.swoop || 6.0) * k, dt);
        if (this.alt < 2.2) this.state = 'low';
        if (d < 1.25 && this.alt < 2.3 && !m.hiding && m.grace <= 0 && this.frozen <= 0) m.caught(this, 'Ouchie swooped down and grabbed you!');
        break;
      }
      case 'climb':
        toAlt(FLY_H, 4);
        if (this.alt > FLY_H - 0.5) { this.state = 'fly'; this.pickDest(); }
        else this.moveTo(this.lastSeen, 2.5 * k, dt);
        break;
      default:
        // (back off after a second chance, or after he got the other one of you)
        this.state = 'climb';
        break;
    }
    this.flap = (this.flap || 0) - dt;
    if (this.state !== 'off' && this.state !== 'perch' && this.flap <= 0 && this.distToPlayer() < 30) { this.flap = 0.55; sfx.step('gerald', this.pos); }
    this.render(dt);
  }

  spot() {
    if (this.frozen > 0) return;
    this.state = 'screech';
    this.timer = this.def.noticeT ?? 1.0;
    sfx.hoot(this.pos);
    sfx.spotted();
    if (this.distToPlayer() < 30) this.mode.say(this.def.shout ? this.def.shout() : 'HOO-HOO! I SEE YOU!', 2.2, 'Ouchie');
  }

  render(dt) {
    const r = this.root;
    const perched = this.state === 'off' || this.state === 'perch';
    r.position.set(this.pos.x, perched ? 7.2 : this.alt - 0.9, this.pos.z);
    r.rotation.y = this.yaw;
    r.rotation.x = perched ? 0 : this.state === 'swoop' ? 0.5 : 0.25;
    poseRig(this.rig, perched ? 'idle' : 'stare', this.animT, perched ? 0.3 : 0.6, dt);
    if (!perched) {
      // flapping
      const f = Math.sin(this.animT * (this.state === 'swoop' ? 16 : 9));
      this.rig.armL.rotation.z = -1.2 - f * 0.6;
      this.rig.armR.rotation.z = 1.2 + f * 0.6;
      this.rig.legL.rotation.x = this.rig.legR.rotation.x = this.state === 'low' ? -0.9 : 0.4;
    }
  }
}

// ── Officer Grumble ─────────────────────────────────────────────────────

export class Guard extends Stalker {
  constructor(mode, def) {
    super(mode, def);
    // his flashlight: a real spotlight, and a pale beam you can see coming
    this.beam = new THREE.SpotLight(0xfff0d0, 0, 30, 0.42, 0.5, 1.4);
    this.beam.castShadow = false;
    this.beamTarget = new THREE.Object3D();
    this.beam.target = this.beamTarget;
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xfff4c8, transparent: true, opacity: 0.022, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false });
    this.cone = new THREE.Mesh(new THREE.ConeGeometry(Math.tan(0.42) * 18, 18, 18, 1, true), coneMat);
    this.cone.rotation.x = -Math.PI / 2;
    this.cone.position.z = 9;
    this.rig.torch.add(this.cone);
  }

  // (the mode hangs the spotlight in the daycare, so it only counts there)
  attach(group) { group.add(this.beam, this.beamTarget); }

  reset() {
    super.reset();
    this.state = this.def.asleep ? 'off' : 'office';
    this.timer = this.def.office ?? rand(40, 70);
    this.legs = 0;
    this.radioT = 0;
    if (this.beam) this.beam.intensity = 0;
  }

  get dangerous() { return super.dangerous || this.state === 'back'; }

  goTo(point) { Raider.prototype.goTo.call(this, point); }

  // The cone of his flashlight: if you're in it, he's got you.
  senses() {
    const m = this.mode, p = m.player;
    if (m.hiding || m.grace > 0 || m.unseen || this.state === 'office' || this.state === 'off') return false;
    const dx = p.pos.x - this.pos.x, dz = p.pos.z - this.pos.z, d = Math.hypot(dx, dz);
    if (d < (p.crouching ? 1.4 : 2.4)) return this.place.sightClear(this.eye(), p.pos);
    if (d > (this.def.beam || 24) * (p.crouching ? 0.6 : 1)) return false;
    const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
    if ((fx * dx + fz * dz) / d < Math.cos(0.4)) return false;
    return this.place.sightClear(this.eye(), p.pos);
  }

  pickDestination() {
    // a few legs of his rounds, then back to his desk and the cameras
    if (this.legs <= 0) {
      this.state = 'back';
      this.goTo(this.place.P(...this.def.start));
      return;
    }
    this.legs--;
    Raider.prototype.pickDestination.call(this);
  }

  update(dt) {
    const m = this.mode;
    if (this.state === 'office') {
      this.animT += dt;
      this.timer -= dt;
      this.yaw = Math.PI;
      if (this.timer <= 0) {
        this.state = 'roam';
        this.legs = this.def.legs || 4;
        this.pickDestination();
        if (this.distToPlayer() < 120) m.say('*creak* ...Time for my rounds.', 2.2, 'Officer Grumble');
      }
      this.watchCams(dt);
      this.render(dt);
      this.aimBeam(false);
      return;
    }
    if (this.state === 'back') {
      this.animT += dt;
      const sensed = this.senses();
      if (sensed) { this.lastSeen.copy(m.player.pos); this.notice(); }
      else if (this.follow(dt, (this.def.walk || 1.8) * this.speedMult())) {
        const home = this.place.P(...this.def.start);
        if (Math.hypot(this.pos.x - home.x, this.pos.z - home.z) < 3) { this.state = 'office'; this.timer = this.def.office ?? rand(50, 80); this.pos.copy(home); }
        else this.goTo(home);
      }
      this.footsteps(dt);
      this.render(dt);
      this.aimBeam(true);
      return;
    }
    super.update(dt);
    this.aimBeam(this.state !== 'off');
  }

  // The cameras: while he's at his desk, any camera that sees you, he radios it in, and the
  // closest of them come.
  watchCams(dt) {
    const m = this.mode;
    this.radioT = Math.max(0, this.radioT - dt);
    if (this.radioT > 0 || m.hiding || m.grace > 0) return;
    for (const cam of m.decor.cams) {
      if (!cam.sees) continue;
      this.radioT = this.def.radioEvery || 18;
      const where = m.roomOf(m.player.pos);
      sfx.plexWalkie();
      m.say(`*kshh* Kid out of bed — ${where}! Somebody go get 'em!`, 3.2, 'Officer Grumble');
      m.game.hud.toast(`📹 A camera saw you! Officer Grumble is calling them to the ${where}!`, 3.4);
      const list = m.enemies.filter((e) => e !== this && e.alert && e.state !== 'off' && !e.raiding)
        .sort((a, b) => a.distToPlayer() - b.distToPlayer()).slice(0, this.def.calls || 2);
      for (const e of list) e.alert(m.player.pos.clone());
      cam.sees = false;
      break;
    }
  }

  aimBeam(on) {
    const r = this.rig;
    this.beam.intensity = on ? (this.def.beamK || 30) : 0;
    this.cone.visible = on;
    if (r.torchLens) r.torchLens.visible = on;
    if (!on) return;
    // the beam points where he's walking (and his arm holds it out in front)
    r.armR.rotation.x = -1.2;
    r.torch.updateWorldMatrix(true, false);
    r.torch.getWorldPosition(this.beam.position);
    this.beamTarget.position.set(this.pos.x + Math.sin(this.yaw) * 10, 0.2, this.pos.z + Math.cos(this.yaw) * 10);
    this.beamTarget.updateMatrixWorld();
    this.cone.rotation.set(-Math.PI / 2 + 0.35, 0, 0);
  }
}
