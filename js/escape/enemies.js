// What walks around at night in When Jonathan Was Five.
//
// Two kinds, each a physical thing walking the level's navigation grid (A*, like the
// animatronics):
//
//   Stalker  walks its rounds (a patrol, or wandering the rooms it likes), and when it sees
//            or hears you it comes running. Lose it — round a corner, into a hiding spot —
//            and it searches where it last saw you, then goes back to its rounds. The Night
//            Bots, the librarian, the custodian, the robots, the baby Gus's.
//   Watcher  only moves when you aren't looking at it — and then it's FAST. Pjork the pig,
//            and the museum's statues.
//
// Hiding: if it saw you climb in, it comes and pulls you out. If it didn't, it walks right
// past. Crouching makes you harder to see and you can't be heard. Running can be heard
// through walls.
import * as THREE from 'three';
import { poseRig, setEyes } from '../models.js';
import { resolveCircle } from '../physics.js';
import { sfx } from '../audio.js';

const tmp = new THREE.Vector3();

export class Stalker {
  // `def`: { id, name, build, walk, chase, sight, hear, roam, patrol, start, wait, hunt, steps, tip }
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
    this.yaw = 0;
    this.path = [];
    this.lastSeen = new THREE.Vector3();
    this.animT = Math.random() * 10;
    this.reset();
  }

  get name() { return this.def.name; }
  get place() { return this.mode.place; }
  get dangerous() { return ['roam', 'linger', 'notice', 'chase', 'search', 'getHidden'].includes(this.state); }

  // Off you go, and stay there (facing `yaw`) until the level says otherwise.
  sendTo(point, yaw) {
    this.state = 'goto';
    this.watchYaw = yaw;
    this.goTo(point);
  }
  get chasing() { return ['notice', 'chase', 'getHidden'].includes(this.state); }

  reset() {
    const d = this.def;
    const start = d.start || (d.patrol && d.patrol[0]);
    this.pos.copy(start ? this.mode.place.P(start[0], start[1]) : this.mode.place.roomCenter(d.roam[0]));
    this.yaw = d.yaw || 0;
    this.state = d.asleep ? 'off' : 'wait';
    this.timer = d.wait ?? 4 + Math.random() * 4;
    this.path = [];
    this.patrolI = 1;
    this.lostTimer = 0;
    this.sinceSeen = 99;
    this.speed = 0;
    this.stepAcc = 0;
    this.stuck = 0;
    this.frozen = 0;
    this.boost = 1;
    this.root.visible = true;
    this.root.position.set(this.pos.x, 0, this.pos.z);
    this.root.rotation.set(0, this.yaw, 0);
    setEyes(this.rig, d.asleep ? 'off' : 'on');
  }

  // Asleep until the level wakes it (the third Night Bot, on its charger, until the
  // generator comes on).
  wake(boost = 1) {
    this.boost = boost;
    if (this.state === 'off') { this.state = 'wait'; this.timer = 1; setEyes(this.rig, 'on'); sfx.reboot(this.pos); }
  }

  speedMult() { return this.mode.game.diff.speed * this.boost * (this.mode.speedK || 1); }

  // ── Moving ────────────────────────────────────────────────────────────

  goTo(point) {
    this.dest = point.clone();
    this.path = this.place.findPath(this.pos, point);
    this.stuck = 0;
  }

  follow(dt, speed) {
    if (!this.path.length) return true;
    const wp = this.path[0];
    const dx = wp.x - this.pos.x, dz = wp.z - this.pos.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.3) { this.path.shift(); return this.path.length === 0; }
    const step = Math.min(d, speed * dt);
    const s = resolveCircle(this.place.colliders, this.pos.x + (dx / d) * step, this.pos.z + (dz / d) * step,
      this.rig.radius * 0.8, 0.4, this.rig.height || 1.8);
    const moved = Math.hypot(s.x - this.pos.x, s.z - this.pos.z);
    this.pos.x = s.x;
    this.pos.z = s.z;
    this.turnToward(dx, dz, dt, 8);
    this.speed = moved / dt;
    if (moved < step * 0.3) {
      this.stuck += dt;
      if (this.stuck > 1.0 && this.dest) this.goTo(this.dest);
    } else this.stuck = 0;
    return false;
  }

  turnToward(dx, dz, dt, rate = 6) {
    let diff = Math.atan2(dx, dz) - this.yaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.yaw += diff * Math.min(1, dt * rate);
  }

  // Where to walk next: the next patrol point, or somewhere in a room it likes — and now and
  // then, whatever room you're in.
  pickDestination() {
    const d = this.def, m = this.mode;
    if (d.patrol) {
      const [px, pz] = d.patrol[this.patrolI % d.patrol.length];
      this.patrolI++;
      this.goTo(this.place.P(px, pz));
      return;
    }
    const yours = this.place.roomAt(m.player.pos.x, m.player.pos.z);
    const hunt = (d.hunt ?? 0.2) * (m.huntK || 1);
    const room = yours && d.roam.includes(yours) && Math.random() < hunt
      ? yours : d.roam[Math.floor(Math.random() * d.roam.length)];
    this.goTo(this.place.randomPointIn(room));
  }

  // ── Senses ────────────────────────────────────────────────────────────

  eye() { return tmp.set(this.pos.x, (this.rig.height || 1.8) * 0.85, this.pos.z); }

  senses() {
    const m = this.mode, p = m.player;
    if (m.hiding || m.grace > 0) return false;
    const dx = p.pos.x - this.pos.x, dz = p.pos.z - this.pos.z;
    const d = Math.hypot(dx, dz);
    const crouch = p.crouching;
    const sight = (this.def.sight || 11) * (crouch ? 0.5 : 1) * (m.sightK || 1);
    if (d > Math.max(sight * 1.4, 14)) return false;
    // You can be heard running, even through walls.
    if (p.sprinting && !m.upgrades.has('sneak') && d < (this.def.hear || 8)) return true;
    if (!this.place.sightClear(this.eye(), p.pos)) return false;
    if (d < (crouch ? 1.4 : 2.4)) return true;
    // Shining your flashlight on one gets its attention.
    if (p.lightOn && p.lightVisible) {
      const aim = p.aimDir();
      const ex = -dx, ez = -dz;
      if ((aim.x * ex + aim.z * ez) / (d * Math.hypot(aim.x, aim.z) || 1) > 0.93 && d < sight * 1.3) return true;
    }
    if (d > sight) return false;
    const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
    return (fx * dx + fz * dz) / d > 0.4;
  }

  distToPlayer() {
    const p = this.mode.player.pos;
    return Math.hypot(p.x - this.pos.x, p.z - this.pos.z);
  }

  // A camera saw you, or something made a noise: come and look.
  alert(point) {
    if (!['wait', 'roam', 'linger', 'search'].includes(this.state)) return;
    this.state = 'search';
    this.searchRun = true;
    this.goTo(point);
  }

  // You just climbed into a hiding spot. Did it see you do it?
  onHide(spot) {
    if (!this.chasing && this.sinceSeen > 0.4) return;
    if (this.sinceSeen < 1.2 && this.place.sightClear(this.eye(), spot.out)) {
      this.state = 'getHidden';
      this.spot = spot;
      this.goTo(spot.out);
    } else if (this.chasing) {
      this.state = 'search';
      this.searchRun = false;
      this.goTo(this.lastSeen);
    }
  }

  // ── Update ────────────────────────────────────────────────────────────

  update(dt) {
    const m = this.mode;
    this.animT += dt;
    this.speed = 0;
    if (this.frozen > 0) this.frozen -= dt;
    const sensed = this.state !== 'off' && this.state !== 'watch' && this.state !== 'goto' && this.senses();
    this.sinceSeen = sensed ? 0 : this.sinceSeen + dt;
    if (sensed) this.lastSeen.copy(m.player.pos);
    const walk = (this.def.walk || 2) * this.speedMult();
    const run = (this.def.chase || 3.8) * this.speedMult();

    switch (this.state) {
      case 'off': case 'watch': break;
      // walking somewhere the level sent it (the theater's ticket robots, off to watch the
      // movie), paying no attention to anything on the way
      case 'goto':
        if (this.follow(dt, walk * 1.3)) { this.state = 'watch'; if (this.watchYaw !== undefined) this.yaw = this.watchYaw; }
        break;
      case 'wait':
        this.timer -= dt;
        if (sensed) this.notice();
        else if (this.timer <= 0) { this.state = 'roam'; this.pickDestination(); }
        break;
      case 'roam':
        if (sensed) { this.notice(); break; }
        if (this.follow(dt, walk)) { this.state = 'linger'; this.timer = (this.def.linger ?? 2.5) + Math.random() * 3; }
        break;
      case 'linger':
        if (sensed) { this.notice(); break; }
        this.timer -= dt;
        this.yaw += Math.sin(this.animT * 0.9) * dt * 0.8;    // looking around
        if (this.timer <= 0) { this.state = 'roam'; this.pickDestination(); }
        break;
      case 'notice':
        this.timer -= dt;
        this.turnToward(m.player.pos.x - this.pos.x, m.player.pos.z - this.pos.z, dt, 10);
        if (this.timer <= 0) { this.state = 'chase'; this.lostTimer = 0; }
        break;
      case 'chase': {
        if (m.hiding) { this.onHide(m.hiding); break; }
        if (sensed) this.lostTimer = 0;
        else {
          this.lostTimer += dt;
          if (this.lostTimer > (this.def.lose || 4)) {
            this.state = 'search';
            this.searchRun = false;
            this.goTo(this.lastSeen);
            sfx.uiBack();
            break;
          }
        }
        const prey = m.player.pos;
        if (sensed && this.place.walkClear(this.pos, prey, this.rig.radius * 0.7)) this.path = [prey.clone()];
        else {
          this.repath = (this.repath || 0) - dt;
          if (this.repath <= 0 || !this.path.length) { this.repath = 0.45; this.path = this.place.findPath(this.pos, this.lastSeen); }
        }
        this.follow(dt, run);
        break;
      }
      case 'search':
        if (sensed) { this.notice(); break; }
        if (this.follow(dt, this.searchRun ? run : walk * 1.25)) { this.state = 'linger'; this.timer = 3 + Math.random() * 2; }
        break;
      case 'getHidden':
        // it saw you climb in: it walks over and opens it (following your box, if you're
        // walking about in it)
        if (this.spot.portable) {
          this.repath = (this.repath || 0) - dt;
          if (this.repath <= 0) { this.repath = 0.4; this.goTo(this.spot.out); }
        }
        if (this.follow(dt, run) || this.pos.distanceTo(this.spot.out) < 1.0) {
          if (m.hiding === this.spot) m.caught(this, `${this.name} saw you hide!`);
          else { this.state = 'search'; this.goTo(this.lastSeen); }
        }
        break;
    }

    // Close enough to grab you.
    if (this.dangerous && this.state !== 'getHidden' && !m.hiding && m.grace <= 0 && this.frozen <= 0 &&
        this.distToPlayer() < (this.def.reach || 1.05) + this.rig.radius * 0.4 &&
        this.place.sightClear(this.eye(), m.player.pos)) {
      m.caught(this);
    }
    this.footsteps(dt);
    this.render(dt);
  }

  notice() {
    this.state = 'notice';
    this.timer = this.def.noticeT ?? 0.5;
    sfx.servo(this.pos);
    if (this.distToPlayer() < 16) {
      sfx.spotted();
      if (this.def.shout) this.mode.say(this.def.shout(), 2.2);
    }
  }

  footsteps(dt) {
    if (this.speed < 0.3 || !this.def.steps) return;
    this.stepAcc += dt * this.speed;
    if (this.stepAcc > (this.def.stride || 0.9)) { this.stepAcc = 0; sfx.step(this.def.steps, this.pos); }
  }

  render(dt) {
    const r = this.root;
    r.position.set(this.pos.x, this.place.floorAt(this.pos.x, this.pos.z), this.pos.z);
    r.rotation.y = this.yaw;
    let pose = 'idle', amt = 0.5;
    if (this.state === 'chase' || this.state === 'getHidden' || (this.state === 'search' && this.searchRun)) pose = this.speed > 0.2 ? 'chase' : 'stare';
    else if (this.state === 'notice') pose = 'stare';
    else if (this.speed > 0.2) { pose = 'walk'; amt = 1; }
    else if (this.state === 'off') { pose = 'idle'; amt = 0; }
    else if (this.state === 'watch') { pose = 'idle'; amt = 0.2; }
    const phase = pose === 'walk' || pose === 'chase' ? this.animT * (4 + this.speed * 1.6) : this.animT;
    poseRig(this.rig, pose, phase, amt, dt);
  }
}

// Only moves when you aren't looking at it. Look away, and it comes for you — fast.
export class Watcher {
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
    this.path = [];
    this.animT = Math.random() * 10;
    this.reset();
  }

  get name() { return this.def.name; }
  get place() { return this.mode.place; }
  get dangerous() { return this.state === 'stalk'; }
  get chasing() { return this.state === 'stalk' && this.moving; }

  reset() {
    const [px, pz] = this.def.start;
    this.pos.copy(this.mode.place.P(px, pz));
    this.yaw = this.def.yaw || 0;
    this.state = this.def.asleep === false ? 'stalk' : 'still';
    this.path = [];
    this.repath = 0;
    this.moving = false;
    this.creak = 0;
    this.seenFor = 0;
    this.pose = this.def.pose || 'idle';
    this.root.visible = true;
    this.root.position.set(this.pos.x, this.place.floorAt(this.pos.x, this.pos.z), this.pos.z);
    this.root.rotation.set(0, this.yaw, 0);
    poseRig(this.rig, this.pose, 0, 0.3, 1);
    setEyes(this.rig, this.state === 'still' ? 'dim' : 'on');
  }

  wake() {
    if (this.state !== 'still') return;
    this.state = 'stalk';
    setEyes(this.rig, 'on');
  }

  distToPlayer() {
    const p = this.mode.player.pos;
    return Math.hypot(p.x - this.pos.x, p.z - this.pos.z);
  }

  // Are you looking at it? In front of you, nothing in the way, and close enough to make out.
  seen() {
    const m = this.mode;
    if (m.hiding) return false;
    const cam = m.game.camera;
    const head = tmp.set(this.pos.x, (this.rig.height || 2) * 0.6, this.pos.z);
    const dx = head.x - cam.position.x, dy = head.y - cam.position.y, dz = head.z - cam.position.z;
    const d = Math.hypot(dx, dy, dz);
    if (d > (this.def.see || 24)) return false;
    const f = m.player.aimDir();
    // a little inside the edge of the screen counts as looking
    const cos = (f.x * dx + f.y * dy + f.z * dz) / d;
    if (cos < (m.game.camera.aspect > 1.2 ? 0.66 : 0.78)) return false;
    return this.place.sightClear(cam.position, head);
  }

  update(dt) {
    const m = this.mode;
    this.animT += dt;
    this.moving = false;
    if (this.state !== 'stalk') return;
    const looking = this.seen();
    if (looking) {
      // Frozen. The pose it was caught in stays exactly as it was.
      this.seenFor += dt;
      return;
    }
    this.seenFor = 0;
    if (m.hiding || m.grace > 0) return;
    let prey = m.player.pos;
    // Some never leave home (Pjork stays on his stage, at the designer's request): they come
    // as close to you as they can without stepping off it.
    const a = this.def.area;
    if (a) {
      const lo = this.place.P(a[0], a[1]), hi = this.place.P(a[2], a[3]);
      prey = new THREE.Vector3(Math.max(lo.x, Math.min(hi.x, prey.x)), 0, Math.max(lo.z, Math.min(hi.z, prey.z)));
      if (Math.hypot(prey.x - this.pos.x, prey.z - this.pos.z) < 0.25) {
        // as close as it can get: it just turns to watch you
        this.yaw = Math.atan2(m.player.pos.x - this.pos.x, m.player.pos.z - this.pos.z);
        this.root.rotation.y = this.yaw;
        if (this.distToPlayer() < (this.def.reach || 1.1) && m.grace <= 0) m.caught(this);
        return;
      }
    }
    const speed = (this.def.speed || 5) * m.game.diff.speed * (m.speedK || 1);
    if (this.place.walkClear(this.pos, prey, 0.35)) this.path = [prey.clone()];
    else {
      this.repath -= dt;
      if (this.repath <= 0 || !this.path.length) { this.repath = 0.4; this.path = this.place.findPath(this.pos, prey); }
    }
    if (this.path.length) {
      const wp = this.path[0];
      const dx = wp.x - this.pos.x, dz = wp.z - this.pos.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.3) this.path.shift();
      else {
        const step = Math.min(d, speed * dt);
        const s = resolveCircle(this.place.colliders, this.pos.x + (dx / d) * step, this.pos.z + (dz / d) * step, 0.35, 0.4, 2);
        this.pos.x = s.x;
        this.pos.z = s.z;
        this.yaw = Math.atan2(dx, dz);
        this.moving = true;
      }
    }
    // The scrape of something heavy moving behind you.
    this.creak -= dt;
    if (this.moving && this.creak <= 0) { this.creak = 0.7 + Math.random() * 0.5; sfx.escCreak(this.pos); }
    // Strike a new pose each time it moves, so every time you look back it's different.
    const r = this.root;
    r.position.set(this.pos.x, this.place.floorAt(this.pos.x, this.pos.z), this.pos.z);
    r.rotation.y = this.yaw;
    poseRig(this.rig, 'chase', this.animT * 9, 1, dt);
    if (this.distToPlayer() < (this.def.reach || 1.1) && m.grace <= 0) m.caught(this);
  }
}
