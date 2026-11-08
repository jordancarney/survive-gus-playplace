// Jack, Jonathan's best friend at the daycare. He sticks right behind Jonathan through every
// level, hides with him, and points out the things they're looking for. Nothing goes after
// him: he's five, and this is Jonathan's job.
import * as THREE from 'three';
import { poseRig } from '../models.js';
import { resolveCircle } from '../physics.js';
import { buildJack } from './cast.js';

export class Jack {
  constructor(mode) {
    this.mode = mode;
    this.rig = buildJack();
    this.root = this.rig.root;
    this.root.rotation.order = 'YXZ';
    this.root.visible = false;
    mode.game.scene.add(this.root);
    this.pos = new THREE.Vector3();
    this.yaw = 0;
    this.path = [];
    this.repath = 0;
    this.t = 0;
    this.speed = 0;
    this.pointed = new Set();
    this.chatter = 30;
  }

  place(at, yaw = 0) {
    this.pos.copy(at);
    this.yaw = yaw;
    this.path = [];
    this.root.visible = true;
    this.pointed.clear();
    this.chatter = 25 + Math.random() * 20;
  }

  hide() { this.root.visible = false; }

  // He climbs in right behind you, and out again after you.
  come(at) {
    this.pos.copy(at);
    this.root.visible = true;
    this.path = [];
  }

  update(dt) {
    if (!this.root.visible) return;
    const m = this.mode;
    const place = m.place;
    const p = m.player;
    this.t += dt;
    this.speed = 0;
    let pose = 'idle';
    const f = p.forward2();
    const goal = new THREE.Vector3(p.pos.x - f.x * 1.2 + f.z * 0.5, 0, p.pos.z - f.z * 1.2 - f.x * 0.5);
    if (!place.isWalkable(goal.x, goal.z)) goal.set(p.pos.x - f.x * 0.9, 0, p.pos.z - f.z * 0.9);
    if (!place.isWalkable(goal.x, goal.z)) goal.set(p.pos.x, 0, p.pos.z);
    const d = Math.hypot(goal.x - this.pos.x, goal.z - this.pos.z);
    if (Math.hypot(p.pos.x - this.pos.x, p.pos.z - this.pos.z) > 13) {
      // left way behind: he runs to catch up
      this.pos.set(p.pos.x - f.x * 1.1, 0, p.pos.z - f.z * 1.1);
      this.path = [];
    } else if (d > 0.45) {
      const speed = d > 3.5 ? 6.4 : 4.0;
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
      const s = resolveCircle(place.colliders, this.pos.x + (dx / dl) * step, this.pos.z + (dz / dl) * step, 0.22, 0.3, 1.1);
      this.speed = Math.hypot(s.x - this.pos.x, s.z - this.pos.z) / dt;
      this.pos.x = s.x;
      this.pos.z = s.z;
      this.yaw = Math.atan2(dx, dz);
      pose = this.speed > 0.3 ? 'walk' : 'idle';
    } else {
      this.yaw = Math.atan2(p.pos.x - this.pos.x, p.pos.z - this.pos.z);
    }
    this.root.position.set(this.pos.x, place.floorAt(this.pos.x, this.pos.z), this.pos.z);
    this.root.rotation.set(0, this.yaw, 0);
    poseRig(this.rig, pose, pose === 'walk' ? this.t * 11 : this.t, 1, dt);
    this.talk(dt);
  }

  // Jack spots things, and gets scared.
  talk(dt) {
    const m = this.mode;
    if (m.sayT > 0) return;
    for (const it of m.decor.items) {
      if (it.found || this.pointed.has(it.id) || !m.itemWanted(it)) continue;
      const d = Math.hypot(it.pos.x - this.pos.x, it.pos.z - this.pos.z);
      if (d < 6.5 && m.place.sightClear(this.pos, it.pos)) {
        this.pointed.add(it.id);
        m.say(it.kind === 'plushie' ? 'Ooh! Something golden over there!' : `Look, Jonathan! A ${it.name}!`, 2.6);
        return;
      }
    }
    this.chatter -= dt;
    if (this.chatter > 0) return;
    this.chatter = 40 + Math.random() * 30;
    const near = m.enemies.some((e) => e.dangerous && e.distToPlayer() < 14);
    const lines = near
      ? ['Shhh... something\'s close.', 'I don\'t like this, Jonathan...', 'Did you hear that?']
      : ['Stay close, okay?', 'I want my mom...', 'We can do this. Right?', 'It\'s so dark in here...', 'Check your Gus Watch!'];
    m.say(lines[Math.floor(Math.random() * lines.length)], 2.6);
  }
}
