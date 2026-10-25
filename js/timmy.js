// Timmy: the kid who fell asleep in the ball pit on Night 2 and woke up alone.
//
// He cries until Jonathan finds him, then sticks right behind Jonathan for the rest of the
// night — and the animatronics will go after him too. The next day he remembers his
// gramma's phone number.
import * as THREE from 'three';
import { buildTimmy, poseRig } from './models.js';
import { resolveCircle } from './physics.js';
import { sfx } from './audio.js';
import { TIMMY } from './config.js';

export class Timmy {
  constructor(game) {
    this.game = game;
    this.rig = buildTimmy();
    this.root = this.rig.root;
    this.root.rotation.order = 'YXZ';
    this.root.visible = false;
    game.scene.add(this.root);
    this.pos = new THREE.Vector3();
    this.yaw = 0;
    this.state = 'away';      // away | hiding | crying | follow
    this.path = [];
    this.repath = 0;
    this.cryTimer = 0;
    this.t = 0;
    this.speed = 0;
  }

  // Only on the move with Jonathan at night is he in danger.
  get vulnerable() { return this.state === 'follow' && this.game.mode === 'night'; }
  get found() { return this.state === 'follow'; }

  hide() {
    this.state = 'away';
    this.root.visible = false;
  }

  // Night 2: he's somewhere in the ball pit, asleep, until the crying starts.
  setupNight() {
    this.state = 'hiding';
    this.root.visible = false;
    this.pos.copy(this.game.playplace.P(TIMMY.pit[0], TIMMY.pit[1]));
  }

  startCrying() {
    this.state = 'crying';
    this.root.visible = true;
    this.yaw = Math.PI / 2;
    this.cryTimer = 0;
  }

  // Found: out of the pit and right behind Jonathan from now on.
  follow(at) {
    this.state = 'follow';
    this.root.visible = true;
    if (at) this.pos.copy(at);
    this.path = [];
  }

  update(dt) {
    if (this.state === 'away' || this.state === 'hiding') return;
    this.t += dt;
    const place = this.game.place;
    let pose = 'idle', sink = 0;
    this.speed = 0;
    if (this.state === 'crying') {
      pose = 'cry';
      sink = 0.1;
      this.cryTimer -= dt;
      if (this.cryTimer <= 0) { this.cryTimer = 2.6; sfx.cry(this.pos); }
    } else {
      const p = this.game.player;
      const f = p.forward2();
      const goal = new THREE.Vector3(p.pos.x - f.x * 1.3, 0, p.pos.z - f.z * 1.3);
      if (!place.isWalkable(goal.x, goal.z)) goal.set(p.pos.x, 0, p.pos.z);
      const d = Math.hypot(goal.x - this.pos.x, goal.z - this.pos.z);
      // If he somehow got left far behind, he catches up (kids are fast).
      if (Math.hypot(p.pos.x - this.pos.x, p.pos.z - this.pos.z) > 14) {
        this.pos.set(p.pos.x - f.x * 1.2, 0, p.pos.z - f.z * 1.2);
        this.path = [];
      } else if (d > 0.5) {
        let speed = d > 4 ? 6.2 : 4.3;
        if (place.inSlowZone(this.pos.x, this.pos.z)) speed *= 0.6;
        let target = goal;
        if (!place.walkClear(this.pos, goal, 0.25)) {
          this.repath -= dt;
          if (this.repath <= 0 || !this.path.length) { this.repath = 0.5; this.path = place.findPath(this.pos, goal); }
          while (this.path.length && Math.hypot(this.path[0].x - this.pos.x, this.path[0].z - this.pos.z) < 0.3) this.path.shift();
          if (this.path.length) target = this.path[0];
        } else this.path = [];
        const dx = target.x - this.pos.x, dz = target.z - this.pos.z;
        const dl = Math.hypot(dx, dz) || 1;
        const step = Math.min(dl, speed * dt);
        const s = resolveCircle(place.colliders, this.pos.x + (dx / dl) * step, this.pos.z + (dz / dl) * step, 0.25, 0.3, 1.2);
        this.speed = Math.hypot(s.x - this.pos.x, s.z - this.pos.z) / dt;
        this.pos.x = s.x;
        this.pos.z = s.z;
        this.yaw = Math.atan2(dx, dz);
        pose = this.speed > 0.3 ? 'walk' : 'idle';
      } else {
        this.yaw = Math.atan2(p.pos.x - this.pos.x, p.pos.z - this.pos.z);
      }
      if (place.inSlowZone(this.pos.x, this.pos.z)) sink = 0.25;
    }
    this.root.position.set(this.pos.x, place.floorAt(this.pos.x, this.pos.z) - sink, this.pos.z);
    this.root.rotation.set(0, this.yaw, 0);
    poseRig(this.rig, pose, pose === 'walk' ? this.t * 10 : this.t, 1, dt);
  }
}
