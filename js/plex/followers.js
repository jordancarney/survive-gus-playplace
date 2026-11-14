// Friends who come along with you (Chapter 50, The Great Escape): each one walks a step behind
// you in a little group — like Jack did at five (js/escape/jack.js), but any of the kids,
// each with their own place in the group.
import * as THREE from 'three';
import { poseRig } from '../models.js';
import { resolveCircle } from '../physics.js';

export class Follower {
  // `person`: one of PlexMode.people ({ root, rig, name }); `slot`: [back, side] metres from
  // you, in your own frame (back is behind you, side is to your right).
  constructor(mode, person, slot) {
    this.mode = mode;
    this.person = person;
    this.rig = person.rig;
    this.root = person.root;
    this.name = person.name;
    this.slot = slot;
    this.pos = new THREE.Vector3();
    this.yaw = 0;
    this.path = [];
    this.repath = 0;
    this.t = Math.random() * 5;
    this.speed = 0;
    this.with = false;
  }

  place(at, yaw = 0) {
    this.pos.copy(at);
    this.yaw = yaw;
    this.path = [];
    this.root.visible = true;
    this.draw('idle', 0);
  }

  hide() { this.root.visible = false; }

  // Standing somewhere, waiting for you to come and get them.
  wait(dt) {
    const p = this.mode.player.pos;
    this.t += dt;
    this.yaw = Math.atan2(p.x - this.pos.x, p.z - this.pos.z) * 0.3 + this.yaw * 0.7;
    this.draw('idle', dt);
  }

  update(dt) {
    if (!this.root.visible) return;
    if (!this.with) { this.wait(dt); return; }
    const m = this.mode, place = m.place, p = m.player;
    this.t += dt;
    this.speed = 0;
    const f = p.forward2();
    const [back, side] = this.slot;
    const goal = new THREE.Vector3(p.pos.x - f.x * back - f.z * side, 0, p.pos.z - f.z * back + f.x * side);
    if (!place.isWalkable(goal.x, goal.z)) goal.set(p.pos.x - f.x * 0.9, 0, p.pos.z - f.z * 0.9);
    if (!place.isWalkable(goal.x, goal.z)) goal.set(p.pos.x, 0, p.pos.z);
    const d = Math.hypot(goal.x - this.pos.x, goal.z - this.pos.z);
    let pose = 'idle';
    if (Math.hypot(p.pos.x - this.pos.x, p.pos.z - this.pos.z) > 14) {
      this.pos.set(p.pos.x - f.x * back, 0, p.pos.z - f.z * back);
      this.path = [];
    } else if (d > 0.45) {
      const speed = d > 3.5 ? 6.6 : 4.2;
      let target = goal;
      if (!place.walkClear(this.pos, goal, 0.22)) {
        this.repath -= dt;
        if (this.repath <= 0 || !this.path.length) { this.repath = 0.5; this.path = place.findPath(this.pos, goal); }
        while (this.path.length && Math.hypot(this.path[0].x - this.pos.x, this.path[0].z - this.pos.z) < 0.3) this.path.shift();
        if (this.path.length) target = this.path[0];
      } else this.path = [];
      const dx = target.x - this.pos.x, dz = target.z - this.pos.z;
      const dl = Math.hypot(dx, dz) || 1;
      const step = Math.min(dl, speed * dt);
      const s = resolveCircle(place.colliders, this.pos.x + (dx / dl) * step, this.pos.z + (dz / dl) * step, 0.24, 0.3, 1.2);
      this.speed = Math.hypot(s.x - this.pos.x, s.z - this.pos.z) / dt;
      this.pos.x = s.x;
      this.pos.z = s.z;
      this.yaw = Math.atan2(dx, dz);
      pose = this.speed > 0.3 ? 'walk' : 'idle';
    } else {
      this.yaw = Math.atan2(p.pos.x - this.pos.x, p.pos.z - this.pos.z);
    }
    this.draw(pose, dt);
  }

  draw(pose, dt) {
    const place = this.mode.place;
    this.root.position.set(this.pos.x, place.floorAt(this.pos.x, this.pos.z), this.pos.z);
    this.root.rotation.set(0, this.yaw, 0);
    poseRig(this.rig, pose, pose === 'walk' ? this.t * 11 : this.t, 1, dt || 1 / 60);
  }
}
