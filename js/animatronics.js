// The animatronics' brains.
//
// Each one is a physical thing walking around the building on the navigation grid — it
// never teleports — so what you see on the cameras is exactly where it is. A night is a
// loop of: wait on the stage → roll to wake → wander to a room it likes (or toward you) →
// linger and maybe break something → spot you and chase. Zap it and it powers down where
// it stands; drag it to Parts & Service and it's out until morning.
//
// Gus is different. He stays on the stage until the lights go out, then always knows where
// you are, and only the Magnum stops him.
import * as THREE from 'three';
import { ANIMATRONICS, AI, BOSS, moodOf } from './config.js';
import { buildAnimatronic, poseRig, setEyes } from './models.js';
import { resolveCircle } from './physics.js';
import { sfx, startMusicBox, stopMusicBox } from './audio.js';

const tmp = new THREE.Vector3();

export class Animatronic {
  constructor(game, id) {
    this.game = game;
    this.id = id;
    this.def = ANIMATRONICS[id] || { name: 'The Junk Monster', walk: 3.2, chase: 3.6, sight: 99 };
    this.rig = buildAnimatronic(id);
    this.root = this.rig.root;
    this.root.rotation.order = 'YXZ';
    game.scene.add(this.root);

    this.pos = new THREE.Vector3();
    this.yaw = 0;
    this.state = 'stage';
    this.timer = 0;
    this.path = [];
    this.dest = null;
    this.repath = 0;
    this.stuck = 0;
    this.checkTimer = AI.checkEvery;
    this.hitsTaken = 0;
    this.lastSeen = new THREE.Vector3();
    this.lostTimer = 0;
    this.animT = Math.random() * 10;
    this.stepAcc = 0;
    this.sink = 0;
    this.mischief = null;
    this.mischiefDone = false;
    this.noticeTimer = 0;
    this.speed = 0;
    this.health = 0;
    this.maxHealth = 0;
    this.freezeTimer = 0;
    this.attackCool = 0;
    this.role = null;
  }

  get name() { return this.def.name; }
  // Where a night (or the house level) starts it: the stage, or somewhere in Jonathan's house.
  get home() { return this.game.area.spawn[this.id]; }
  get chestY() { return this.rig.height * 0.6; }

  // True while it can still catch you.
  get dangerous() {
    return ['roam', 'linger', 'chase', 'search', 'notice', 'hunt', 'return'].includes(this.state);
  }
  // True while a zap or a Magnum shot can land on it.
  get hittable() {
    return !['down', 'carried', 'junked', 'friend', 'jumpscare', 'hidden', 'defeated', 'rise'].includes(this.state);
  }

  // ── Night setup ───────────────────────────────────────────────────────

  resetToStage() {
    this.pos.copy(this.home);
    this.yaw = 0;
    this.state = 'stage';
    this.path = [];
    this.timer = 0;
    this.checkTimer = AI.checkEvery * (0.5 + Math.random());
    this.hitsTaken = 0;
    this.sink = 0;
    this.freezeTimer = 0;
    this.root.visible = true;
    this.root.rotation.set(0, this.yaw, 0);
    // Put the model there now, not on the next update — cutscenes don't run updates.
    this.root.position.set(this.pos.x, this.game.place.floorAt(this.pos.x, this.pos.z), this.pos.z);
    setEyes(this.rig, 'on');
  }

  level() { return this.game.night.levelOf(this.id); }

  speedMult() {
    const l = this.level();
    return (0.85 + l * 0.015) * (this.game.night.bossed && this.id !== 'gus' ? AI.bossedSpeed : 1);
  }

  // ── Movement ──────────────────────────────────────────────────────────

  goTo(point) {
    this.dest = point.clone();
    this.path = this.game.place.findPath(this.pos, point);
    this.repath = 0;
    this.stuck = 0;
  }

  // Walk the path. Returns true on arrival.
  follow(dt, speed) {
    if (!this.path.length) return true;
    const wp = this.path[0];
    const dx = wp.x - this.pos.x, dz = wp.z - this.pos.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.3) {
      this.path.shift();
      return this.path.length === 0;
    }
    const step = Math.min(d, speed * dt);
    const nx = this.pos.x + (dx / d) * step;
    const nz = this.pos.z + (dz / d) * step;
    const s = resolveCircle(this.game.place.colliders, nx, nz, this.rig.radius * 0.8, 0.4, this.rig.height);
    const moved = Math.hypot(s.x - this.pos.x, s.z - this.pos.z);
    this.pos.x = s.x;
    this.pos.z = s.z;
    this.turnToward(dx, dz, dt, 8);
    this.speed = moved / dt;
    // pushed up against something it can't get round: try a fresh path
    if (moved < step * 0.3) {
      this.stuck += dt;
      if (this.stuck > 1.0 && this.dest) this.goTo(this.dest);
    } else this.stuck = 0;
    return false;
  }

  turnToward(dx, dz, dt, rate = 6) {
    const want = Math.atan2(dx, dz);
    let diff = want - this.yaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.yaw += diff * Math.min(1, dt * rate);
  }

  pickDestination() {
    const night = this.game.night;
    const lvl = this.level();
    const huntBias = 0.05 + lvl * 0.02 + night.hour * 0.025;
    const place = this.game.place;
    const player = this.game.player;

    // Head for wherever Jonathan is — usually his office.
    if (Math.random() < huntBias) {
      const room = place.roomAt(player.pos.x, player.pos.z) || 'O';
      this.mischief = null;
      return this.goTo(room === 'O' ? player.pos : place.randomPointIn(room));
    }
    const area = this.game.area;
    // Chewers and pounders go looking for a game to wreck.
    if (area.isPlayPlace && (this.def.chews || this.def.pounds) && Math.random() < 0.55) {
      const working = this.game.machines.list.filter((m) => !m.broken);
      if (working.length) {
        const m = working[Math.floor(Math.random() * working.length)];
        this.mischief = m;
        this.mischiefDone = false;
        return this.goTo(m.point);
      }
    }
    // Flipper likes to lurk under the balls (or in the bathtub).
    if (this.id === 'flipper' && Math.random() < 0.4) {
      this.mischief = 'pit';
      return this.goTo(area.hideSpot || place.randomPointIn(area.hideRoom));
    }
    this.mischief = null;
    const rooms = area.roam;
    const weights = rooms.map((r) => (area.isPlayPlace && this.def.likes.includes(r) ? 3 : 1));
    let roll = Math.random() * weights.reduce((a, b) => a + b, 0);
    let room = rooms[0];
    for (let i = 0; i < rooms.length; i++) {
      roll -= weights[i];
      if (roll <= 0) { room = rooms[i]; break; }
    }
    this.goTo(place.randomPointIn(room));
  }

  // ── Senses ────────────────────────────────────────────────────────────

  eye() { return tmp.set(this.pos.x, this.pos.y + this.rig.height * 0.85, this.pos.z); }

  senses() {
    const player = this.game.player;
    if (!this.game.hunting) return false;
    const dx = player.pos.x - this.pos.x, dz = player.pos.z - this.pos.z;
    const d = Math.hypot(dx, dz);
    const sight = this.def.sight * (0.8 + this.level() * 0.02);
    if (d > Math.max(sight * 1.4, 16)) return false;
    // You can be heard running, even through walls.
    if (player.sprinting && d < (this.def.hearing || AI.hearSprint)) return true;
    const clear = this.game.place.sightClear(this.eye(), player.pos);
    if (!clear) return false;
    if (d < 2.6) return true;
    // Shining your flashlight on one gets its attention from much farther away.
    if (player.lightOn && player.lightVisible) {
      const aim = player.aimDir();
      const ex = this.pos.x - player.pos.x, ez = this.pos.z - player.pos.z;
      const el = Math.hypot(ex, ez) || 1;
      if ((aim.x * ex + aim.z * ez) / (el * Math.hypot(aim.x, aim.z) || 1) > 0.9 && d < sight * 1.4) return true;
    }
    if (d > sight) return false;
    const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
    return (fx * dx + fz * dz) / d > 0.35;
  }

  distToPlayer() {
    const p = this.game.player.pos;
    return Math.hypot(p.x - this.pos.x, p.z - this.pos.z);
  }

  // ── Being hit ─────────────────────────────────────────────────────────
  //
  // Returns a word for the HUD: 'down', 'stagger', 'fizzle', 'freeze' or 'damage'.

  hit(kind) {
    const fx = this.game.effects;
    const at = new THREE.Vector3(this.pos.x, this.pos.y + this.chestY, this.pos.z);
    if (this.id === 'gus') {
      if (kind !== 'magnum') { sfx.zapFizzle(); fx.burst(at, 6, 2, 2); return 'fizzle'; }
      fx.burst(at, 24, 5);
      if (this.game.night.boss === 'gus') {
        this.health = Math.max(0, this.health - 1);
        sfx.bossHit(this.pos);
        if (this.health === 0) { this.defeat(); return 'down'; }
        if (this.freezeTimer <= 0) this.freezeTimer = BOSS.gus.freeze;
        return 'damage';
      }
      this.freezeTimer = AI.gusFreeze;
      sfx.stagger(this.pos);
      return 'freeze';
    }
    if (kind === 'baseball') {
      sfx.bonk(at);
      this.stagger(3.5);
      return 'stagger';
    }
    if (kind === 'magnum') {
      fx.burst(at, 22, 5);
      this.powerDown();
      return 'down';
    }
    this.hitsTaken++;
    fx.burst(at, 14, 3.5, kind === 'taser' ? 2 : 0);
    if (this.hitsTaken >= (this.def.hits || 1)) {
      this.powerDown();
      return 'down';
    }
    this.stagger(AI.staggerTime);
    return 'stagger';
  }

  stagger(t) {
    if (this.state === 'down') return;
    this.prevState = this.state === 'stagger' ? this.prevState : this.state;
    this.state = 'stagger';
    this.timer = t;
    sfx.stagger(this.pos);
  }

  powerDown() {
    const mood = moodOf(this.game.night.happiness);
    this.state = 'down';
    this.timer = AI.downTime * mood.downTime * (this.game.night.n >= 12 ? 0.85 : 1);
    this.downMax = this.timer;
    this.hitsTaken = 0;
    this.path = [];
    setEyes(this.rig, 'off');
    sfx.powerDown(this.pos);
    this.game.onPowerDown(this);
  }

  reboot() {
    setEyes(this.rig, 'on');
    sfx.reboot(this.pos);
    this.root.rotation.x = 0;
    this.hitsTaken = 0;
    if (this.senses()) this.startChase();
    else { this.state = 'roam'; this.pickDestination(); }
  }

  startChase() {
    if (this.state !== 'chase') sfx.spotted();
    this.state = 'chase';
    this.lostTimer = 0;
    this.repath = 0;
    this.lastSeen.copy(this.game.player.pos);
  }

  // Gus calls the junk room awake.
  wakeFromJunk() {
    if (this.state !== 'junked') return;
    this.root.rotation.x = 0;
    setEyes(this.rig, 'on');
    sfx.reboot(this.pos);
    this.state = 'roam';
    this.pickDestination();
  }

  // ── Gus ───────────────────────────────────────────────────────────────

  emerge() {
    if (this.id !== 'gus') return;
    this.state = 'hunt';
    this.repath = 0;
    sfx.roar(this.pos);
    startMusicBox(() => (this.state === 'hunt' || this.state === 'return' ? this.pos : null));
  }

  goHome() {
    if (this.id !== 'gus' || this.state === 'stage') return;
    this.state = 'return';
    this.freezeTimer = 0;
    this.goTo(this.home);
  }

  defeat() {
    this.state = 'defeated';
    this.timer = 3;
    setEyes(this.rig, 'off');
    stopMusicBox();
    sfx.bossHit(this.pos);
    sfx.powerDown(this.pos);
    this.game.effects.burst(new THREE.Vector3(this.pos.x, this.pos.y + 1.5, this.pos.z), 50, 6);
    this.game.night.bossDefeated(this);
  }

  // ── Update ────────────────────────────────────────────────────────────

  update(dt) {
    this.animT += dt;
    this.speed = 0;
    const night = this.game.night;
    switch (this.state) {
      case 'stage': this.updateStage(dt); break;
      case 'roam':
        if (this.senses()) { this.notice(); break; }
        if (this.follow(dt, this.def.walk * this.speedMult())) this.arrive();
        break;
      case 'linger': this.updateLinger(dt); break;
      case 'notice':
        this.timer -= dt;
        this.facePlayer(dt);
        if (this.timer <= 0) this.startChase();
        break;
      case 'chase': this.updateChase(dt); break;
      case 'search':
        if (this.senses()) { this.startChase(); break; }
        if (this.follow(dt, this.def.walk * this.speedMult() * 1.15)) {
          this.state = 'linger';
          this.timer = 3;
          this.mischief = null;
        }
        break;
      case 'stagger':
        this.timer -= dt;
        if (this.timer <= 0) this.startChase();
        break;
      case 'down':
        this.timer -= dt;
        if (this.timer < 3 && Math.random() < dt * 4) setEyes(this.rig, Math.random() < 0.5 ? 'dim' : 'off');
        if (this.timer <= 0) this.reboot();
        break;
      case 'carried': this.updateCarried(dt); break;
      case 'hunt': this.updateHunt(dt); break;
      case 'return':
        if (this.follow(dt, this.def.walk)) {
          this.state = 'stage';
          this.yaw = 0;
          stopMusicBox();
        }
        break;
      case 'defeated':
        this.timer -= dt;
        break;
      case 'friend': this.updateFriend(dt); break;
    }

    // Flipper sinks into the balls while lingering in the pit — just the head and fin
    // showing — and everyone else stands tall.
    const wantSink = this.id === 'flipper' && this.state === 'linger' && this.game.place.inSlowZone(this.pos.x, this.pos.z) ? 0.8 : 0;
    this.sink += (wantSink - this.sink) * Math.min(1, dt * 2);

    // Footsteps
    if (this.speed > 0.2) {
      this.stepAcc += this.speed * dt;
      if (this.stepAcc > 0.85) { this.stepAcc = 0; sfx.step(this.id, this.pos); }
    }

    if (night && this.game.hunting && this.dangerous && this.state !== 'return' && this.state !== 'stage') {
      const reach = AI.catchRadius + this.rig.radius * 0.5;
      if (this.distToPlayer() < reach && Math.abs(this.game.player.pos.y - this.pos.y) < 1.2) this.game.caught(this);
    }
    this.render(dt);
  }

  updateStage(dt) {
    const night = this.game.night;
    if (!night || this.game.mode !== 'night' || this.id === 'gus') return;
    if (!night.isAwake(this.id)) return;
    this.checkTimer -= dt;
    if (this.checkTimer > 0) return;
    this.checkTimer = AI.checkEvery;
    if (Math.random() * 20 < this.level()) {
      this.state = 'roam';
      this.pickDestination();
    }
  }

  arrive() {
    this.state = 'linger';
    const lvl = this.level();
    this.timer = 16 - lvl * 0.6 + Math.random() * 4;
    this.mischiefDone = false;
    // Chomper sometimes chews through the camera cable in whatever room he's in.
    if (this.def.chews && this.game.area.isPlayPlace && Math.random() < 0.35) {
      const room = this.game.place.roomAt(this.pos.x, this.pos.z);
      for (const c of this.game.decor.cams) if (c.room === room) c.chewed = 25;
      sfx.chew(this.pos);
    }
  }

  updateLinger(dt) {
    if (this.senses()) { this.notice(); return; }
    this.timer -= dt;
    const m = this.mischief;
    if (m && m !== 'pit' && !this.mischiefDone && this.timer < 12) {
      this.mischiefDone = true;
      if (!m.broken) {
        if (this.def.chews) sfx.chew(this.pos); else sfx.pound(this.pos);
        this.game.machines.breakMachine(m, this.name);
      }
      this.turnToward(m.point.x - m.group.position.x, m.point.z - m.group.position.z, 1, 1);
    }
    if (this.timer <= 0) {
      this.state = 'roam';
      this.pickDestination();
    }
  }

  notice() {
    this.state = 'notice';
    this.timer = 0.45;
    sfx.servo(this.pos);
  }

  facePlayer(dt, rate = 8) {
    const p = this.game.player.pos;
    this.turnToward(p.x - this.pos.x, p.z - this.pos.z, dt, rate);
  }

  updateChase(dt) {
    const player = this.game.player;
    const sees = this.senses() || this.distToPlayer() < 3;
    if (sees) {
      this.lastSeen.copy(player.pos);
      this.lostTimer = 0;
    } else {
      this.lostTimer += dt;
      if (this.lostTimer > AI.loseSight * (this.def.stubborn ? 2 : 1)) {
        this.state = 'search';
        this.goTo(this.lastSeen);
        return;
      }
    }
    const speed = this.def.chase * this.speedMult();
    // Straight at you when there's a clear line; otherwise path round.
    if (sees && this.game.place.walkClear(this.pos, player.pos, this.rig.radius * 0.7)) {
      this.path = [player.pos.clone()];
    } else {
      this.repath -= dt;
      if (this.repath <= 0 || !this.path.length) {
        this.repath = 0.45;
        this.path = this.game.place.findPath(this.pos, this.lastSeen);
      }
    }
    this.follow(dt, speed);
  }

  updateCarried() {
    const player = this.game.player;
    this.timer -= 1 / 60;
    const f = player.forward2();
    this.pos.set(player.pos.x - f.x * 0.9, 0, player.pos.z - f.z * 0.9);
    this.yaw = player.yaw + Math.PI;
    if (this.timer <= 0) {
      // It woke up in your arms.
      this.game.dropCarried();
      player.dazed = 1.2;
      player.shake = 0.6;
      setEyes(this.rig, 'on');
      sfx.reboot(this.pos);
      this.state = 'stagger';
      this.timer = 0.8;
    }
  }

  updateHunt(dt) {
    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
      if (Math.random() < dt * 6) setEyes(this.rig, Math.random() < 0.5 ? 'dim' : 'on');
      if (this.freezeTimer <= 0) setEyes(this.rig, 'on');
      return;
    }
    // He knows where you are. Always.
    const player = this.game.player;
    this.repath -= dt;
    if (this.game.place.walkClear(this.pos, player.pos, this.rig.radius * 0.7)) this.path = [player.pos.clone()];
    else if (this.repath <= 0 || !this.path.length) {
      this.repath = 0.5;
      this.path = this.game.place.findPath(this.pos, player.pos);
    }
    let speed = this.def.chase * (0.9 + this.game.night.levelOf('gus') * 0.012);
    if (this.game.night.boss === 'gus') speed = BOSS.gus.speed[this.game.night.bossPhase()];
    this.follow(dt, speed);
  }

  // ── Night 21: friends ─────────────────────────────────────────────────

  befriend(role) {
    this.state = 'friend';
    this.role = role;
    this.timer = 0;
    this.path = [];
    this.root.rotation.x = 0;
    setEyes(this.rig, 'friend');
  }

  updateFriend(dt) {
    const boss = this.game.night.boss === 'junk' ? this.game.junk : null;
    this.attackCool -= dt;
    if (this.timer > 0) { this.timer -= dt; return; }   // knocked back by the monster
    if (this.role === 'fixer') {
      const broken = this.game.machines.list.filter((m) => m.broken);
      if (!broken.length) { this.wanderNear(dt, this.game.player.pos, 4); return; }
      broken.sort((a, b) => a.point.distanceTo(this.pos) - b.point.distanceTo(this.pos));
      const m = broken[0];
      if (!this.dest || this.dest.distanceTo(m.point) > 0.5) this.goTo(m.point);
      if (this.follow(dt, this.def.walk * 1.2)) {
        this.fixT = (this.fixT || 0) + dt;
        if (this.fixT > 4) { this.fixT = 0; this.game.machines.fix(m, this.name); sfx.friendly(this.pos); }
      }
      return;
    }
    if (!boss || boss.state === 'defeated' || boss.state === 'rise') {
      this.wanderNear(dt, this.game.player.pos, 3);
      return;
    }
    const d = Math.hypot(boss.pos.x - this.pos.x, boss.pos.z - this.pos.z);
    if (d < 2.7) {
      this.turnToward(boss.pos.x - this.pos.x, boss.pos.z - this.pos.z, dt);
      if (this.attackCool <= 0) {
        this.attackCool = 1.1;
        this.swipe = 0.3;
        boss.damage(BOSS.junk.damage.friend, 'friend');
      }
    } else {
      this.repath -= dt;
      if (this.repath <= 0 || !this.path.length) { this.repath = 0.6; this.path = this.game.place.findPath(this.pos, boss.pos); }
      this.follow(dt, this.def.chase * 1.35);
    }
  }

  // Swatted by the Junk Monster: knocked back and dazed for a moment.
  knockBack(from) {
    const dx = this.pos.x - from.x, dz = this.pos.z - from.z;
    const d = Math.hypot(dx, dz) || 1;
    const s = resolveCircle(this.game.place.colliders, this.pos.x + (dx / d) * 1.8, this.pos.z + (dz / d) * 1.8, this.rig.radius * 0.8, 0.4, this.rig.height);
    this.pos.x = s.x;
    this.pos.z = s.z;
    this.timer = 2.2;
    this.swipe = 0;
    sfx.stagger(this.pos);
  }

  wanderNear(dt, p, r) {
    const d = Math.hypot(p.x - this.pos.x, p.z - this.pos.z);
    if (d > r + 2) {
      this.repath -= dt;
      if (this.repath <= 0 || !this.path.length) { this.repath = 1; this.path = this.game.place.findPath(this.pos, p); }
      this.follow(dt, this.def.walk * 1.3);
    } else {
      this.turnToward(p.x - this.pos.x, p.z - this.pos.z, dt, 3);
    }
  }

  // ── Drawing ───────────────────────────────────────────────────────────

  render(dt) {
    const r = this.root;
    const floor = this.game.place.floorAt(this.pos.x, this.pos.z);
    r.position.set(this.pos.x, floor - this.sink, this.pos.z);
    r.rotation.y = this.yaw;
    let pose = 'idle';
    let amt = 1;
    let tipX = 0;
    switch (this.state) {
      case 'stage':
        pose = this.game.mode === 'day' ? 'dance' : 'idle';
        amt = this.game.mode === 'day' ? 1 : 0.4;
        break;
      case 'roam': case 'search': case 'return':
        pose = this.speed > 0.2 ? 'walk' : 'idle';
        break;
      case 'linger':
        pose = this.mischief && this.mischief !== 'pit' && !this.mischiefDone ? 'idle' : 'idle';
        amt = 0.6;
        break;
      case 'notice': pose = 'stare'; break;
      case 'chase': case 'hunt':
        pose = this.freezeTimer > 0 ? 'stagger' : (this.speed > 0.2 ? 'chase' : 'stare');
        break;
      case 'stagger': pose = 'stagger'; break;
      case 'down': pose = 'down'; break;
      case 'carried': case 'junked': pose = 'limp'; tipX = -Math.PI / 2; r.position.y = floor + 0.25; break;
      case 'defeated': pose = 'down'; break;
      case 'friend':
        if (this.swipe > 0) { this.swipe -= dt; pose = 'swipe'; amt = 1 - this.swipe / 0.3; }
        else pose = this.speed > 0.2 ? 'walk' : 'wave';
        break;
      case 'jumpscare': pose = 'scare'; break;
    }
    r.rotation.x += (tipX - r.rotation.x) * Math.min(1, dt * 10);
    const phase = pose === 'walk' || pose === 'chase' ? this.animT * (4 + this.speed * 1.6) : this.animT;
    poseRig(this.rig, pose, phase, amt, dt);
  }
}

// ── The Junk Monster ────────────────────────────────────────────────────
//
// Rises out of the junk pile on Night 21. Hunts you like Gus does, throws junk, and can be
// worn down by everything you've got — and by your friends.

export class JunkMonster extends Animatronic {
  constructor(game) {
    super(game, 'junk');
    this.projectiles = [];
    this.throwTimer = 4;
    this.root.visible = false;
    this.state = 'hidden';
  }

  get dangerous() { return this.state === 'hunt' || this.state === 'throw' || this.state === 'swat'; }
  get hittable() { return ['hunt', 'throw', 'swat', 'stagger'].includes(this.state); }

  start() {
    const spot = this.game.decor.junkSpots[0];
    this.pos.set(spot.x, 0, spot.z);
    this.yaw = Math.PI / 2;
    this.maxHealth = this.health = BOSS.junk.health;
    this.state = 'rise';
    this.timer = 4;
    this.root.visible = true;
    setEyes(this.rig, 'on');
    sfx.roar(this.pos);
  }

  phase() {
    const f = this.health / this.maxHealth;
    return f > 0.66 ? 0 : f > 0.33 ? 1 : 2;
  }

  hit(kind) {
    if (!this.hittable) return 'fizzle';
    const dmg = BOSS.junk.damage[kind] || 1;
    this.game.effects.burst(new THREE.Vector3(this.pos.x, 2.2, this.pos.z), 16, 4, kind === 'taser' ? 2 : 0);
    if (kind === 'baseball') sfx.bonk(this.pos);
    this.damage(dmg, kind);
    if (kind === 'magnum' || kind === 'taser') this.staggerT = 0.6;
    return this.health <= 0 ? 'down' : 'damage';
  }

  damage(n, from) {
    if (this.state === 'defeated') return;
    const before = this.phase();
    this.health = Math.max(0, this.health - n);
    sfx.bossHit(this.pos);
    if (from === 'friend' && Math.random() < 0.25) this.staggerT = BOSS.junk.friendStagger;
    if (this.health <= 0) { this.defeat(); return; }
    if (this.phase() !== before) {
      sfx.roar(this.pos);
      this.game.night.junkPhase(this.phase());
    }
  }

  defeat() {
    this.state = 'defeated';
    this.timer = 4;
    setEyes(this.rig, 'off');
    sfx.bossHit(this.pos);
    sfx.crash(this.pos);
    for (let i = 0; i < 4; i++) {
      this.game.effects.burst(new THREE.Vector3(this.pos.x, 0.5 + i * 0.8, this.pos.z), 30, 6);
    }
    this.game.night.bossDefeated(this);
  }

  update(dt) {
    this.animT += dt;
    this.speed = 0;
    this.updateProjectiles(dt);
    if (this.state === 'hidden') return;
    if (this.state === 'rise') {
      this.timer -= dt;
      this.sink = Math.max(0, this.timer / 4) * 3.8;
      if (this.timer <= 0) { this.state = 'hunt'; this.sink = 0; }
      this.render(dt);
      return;
    }
    if (this.state === 'defeated') {
      this.timer -= dt;
      this.sink = Math.min(3.8, this.sink + dt * 0.8);
      this.render(dt);
      return;
    }
    if (this.staggerT > 0) {
      this.staggerT -= dt;
      this.renderPose(dt, 'stagger');
      return;
    }
    const player = this.game.player;
    const d = this.distToPlayer();
    if (this.state === 'throw') {
      this.timer -= dt;
      this.facePlayer(dt, 10);
      if (this.timer <= 0) { this.launch(); this.state = 'hunt'; }
      this.renderPose(dt, 'throw', 1 - Math.max(0, this.timer / 0.7));
      return;
    }
    if (this.state === 'swat') {
      this.timer -= dt;
      this.renderPose(dt, 'swipe', 1 - Math.max(0, this.timer / 0.6));
      if (this.timer <= 0) this.state = 'hunt';
      return;
    }
    // Friends in its face get swatted away — which is time it isn't spending on you.
    this.swatCool = (this.swatCool || 0) - dt;
    if (this.swatCool <= 0) {
      const pest = this.game.bots.find((a) => a.state === 'friend' && a.timer <= 0 &&
        Math.hypot(a.pos.x - this.pos.x, a.pos.z - this.pos.z) < 2.6);
      if (pest) {
        this.state = 'swat';
        this.timer = 0.6;
        this.swatCool = 2.2;
        this.turnToward(pest.pos.x - this.pos.x, pest.pos.z - this.pos.z, 1, 1);
        pest.knockBack(this.pos);
        sfx.pound(this.pos);
        return;
      }
    }
    this.throwTimer -= dt;
    const sees = this.game.place.sightClear(this.eye(), player.pos);
    if (this.throwTimer <= 0 && sees && d > 5 && d < 24) {
      this.state = 'throw';
      this.timer = 0.7;
      this.throwTimer = BOSS.junk.throwEvery[this.phase()];
      sfx.junkThrow(this.pos);
      this.renderPose(dt, 'throw', 0);
      return;
    }
    this.repath -= dt;
    if (this.game.place.walkClear(this.pos, player.pos, 0.6)) this.path = [player.pos.clone()];
    else if (this.repath <= 0 || !this.path.length) { this.repath = 0.5; this.path = this.game.place.findPath(this.pos, player.pos); }
    this.follow(dt, BOSS.junk.speed[this.phase()]);
    if (this.speed > 0.2) {
      this.stepAcc += this.speed * dt;
      if (this.stepAcc > 1.2) { this.stepAcc = 0; sfx.step('junk', this.pos); }
    }
    if (this.game.mode === 'night' && d < AI.catchRadius + 0.7) this.game.caught(this);
    this.renderPose(dt, this.speed > 0.2 ? 'walk' : 'stare');
  }

  renderPose(dt, pose, amt = 1) {
    const r = this.root;
    r.position.set(this.pos.x, -this.sink, this.pos.z);
    r.rotation.y = this.yaw;
    r.rotation.x = 0;
    const phase = pose === 'walk' ? this.animT * (3 + this.speed) : this.animT;
    poseRig(this.rig, pose, phase, amt, dt);
    this.rig.core.material.color.setHSL(0, 1, 0.45 + Math.sin(this.animT * 6) * 0.15);
  }

  render(dt) {
    this.renderPose(dt, this.state === 'defeated' ? 'down' : 'stare');
  }

  // A lump of scrap lobbed at where you're about to be.
  launch() {
    const p = this.game.player;
    const from = new THREE.Vector3(this.pos.x, 3.0, this.pos.z);
    const lead = 0.5;
    const to = new THREE.Vector3(p.pos.x + p.vel.x * lead, 0.8, p.pos.z + p.vel.z * lead);
    const flight = Math.max(0.6, from.distanceTo(to) / 14);
    const vel = new THREE.Vector3((to.x - from.x) / flight, (to.y - from.y) / flight + 9 * flight / 2, (to.z - from.z) / flight);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.4), new THREE.MeshStandardMaterial({ color: 0x6a6e78, metalness: 0.5, roughness: 0.6 }));
    mesh.position.copy(from);
    this.game.scene.add(mesh);
    this.projectiles.push({ mesh, vel, life: 4 });
  }

  updateProjectiles(dt) {
    const p = this.game.player;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const j = this.projectiles[i];
      j.vel.y -= 9 * dt;
      j.mesh.position.addScaledVector(j.vel, dt);
      j.mesh.rotation.x += dt * 5;
      j.mesh.rotation.z += dt * 3;
      j.life -= dt;
      const m = j.mesh.position;
      const hitPlayer = Math.hypot(m.x - p.pos.x, m.z - p.pos.z) < 0.8 && m.y < p.pos.y + 2 && m.y > p.pos.y;
      const hitWorld = m.y < 0.2 || this.game.place.cell(m.x, m.z) === '#';
      if (hitPlayer || hitWorld || j.life <= 0) {
        if (hitPlayer && this.game.mode === 'night') {
          p.dazed = 1.3;
          p.shake = 0.8;
          sfx.ouch();
          this.game.hud.flashHit();
        }
        sfx.junkLand(m);
        this.game.effects.burst(m.clone(), 10, 3);
        this.game.scene.remove(j.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  clear() {
    for (const j of this.projectiles) this.game.scene.remove(j.mesh);
    this.projectiles = [];
    this.root.visible = false;
    this.state = 'hidden';
  }
}
