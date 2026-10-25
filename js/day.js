// Daytime: the PlayPlace open, full of kids, techno on, the five of them performing on
// the stage like nothing happened. The happier the kids, the more of them there are.
//
// It's a breather between nights and a reminder of what you're protecting. Walk around as
// long as you like; clock in at the time clock in the office when you're ready.
import * as THREE from 'three';
import { buildKid, poseRig } from './models.js';
import { playMusic, sfx } from './audio.js';

const KID_ROOMS = ['D', 'D', 'D', 'A', 'A', 'B', 'B', 'T', 'T', 'P', 'R', 'H', 'E'];
const MAX_KIDS = 34;

export class Daytime {
  constructor(game) {
    this.game = game;
    this.kids = [];
    this.cheer = 6;
  }

  build() {
    let seed = 11;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < MAX_KIDS; i++) {
      const rig = buildKid(rand);
      rig.root.visible = false;
      this.game.scene.add(rig.root);
      this.kids.push({ rig, pos: new THREE.Vector3(), path: [], wait: 0, speed: 1.6, t: rand() * 10, yaw: 0, hop: 0 });
    }
  }

  start(happiness) {
    if (!this.kids.length) this.build();
    const g = this.game;
    const count = Math.round(12 + (happiness / 100) * (MAX_KIDS - 12));
    this.kids.forEach((k, i) => {
      k.rig.root.visible = i < count;
      const room = KID_ROOMS[i % KID_ROOMS.length];
      k.pos.copy(g.place.randomPointIn(room));
      k.path = [];
      k.wait = Math.random() * 3;
      k.speed = 1.3 + Math.random() * 1.1;
    });
    g.lighting.set('day');
    playMusic('day');
  }

  stop() {
    for (const k of this.kids) k.rig.root.visible = false;
  }

  update(dt) {
    const place = this.game.place;
    for (const k of this.kids) {
      if (!k.rig.root.visible) continue;
      k.t += dt;
      let moving = false;
      if (k.wait > 0) {
        k.wait -= dt;
      } else if (!k.path.length) {
        const room = KID_ROOMS[Math.floor(Math.random() * KID_ROOMS.length)];
        k.path = place.findPath(k.pos, place.randomPointIn(room));
        if (!k.path.length) k.wait = 2;
      } else {
        const wp = k.path[0];
        const dx = wp.x - k.pos.x, dz = wp.z - k.pos.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.3) {
          k.path.shift();
          if (!k.path.length) k.wait = 1 + Math.random() * 5;
        } else {
          const s = Math.min(d, k.speed * dt);
          k.pos.x += (dx / d) * s;
          k.pos.z += (dz / d) * s;
          k.yaw = Math.atan2(dx, dz);
          moving = true;
        }
      }
      // Kids in the ball pit bounce. Kids near the stage dance.
      const inPit = place.inSlowZone(k.pos.x, k.pos.z);
      const nearStage = place.roomAt(k.pos.x, k.pos.z) === 'D' && k.pos.z < -12;
      k.hop = inPit ? Math.abs(Math.sin(k.t * 5)) * 0.35 : 0;
      k.rig.root.position.set(k.pos.x, place.floorAt(k.pos.x, k.pos.z) + k.hop - (inPit ? 0.3 : 0), k.pos.z);
      k.rig.root.rotation.y = moving ? k.yaw : k.yaw + Math.sin(k.t * 0.7) * 0.3;
      const pose = moving ? 'walk' : (nearStage || inPit ? 'dance' : 'idle');
      poseRig(k.rig, pose, moving ? k.t * 9 : k.t, 1, dt);
    }
    this.cheer -= dt;
    if (this.cheer <= 0) {
      this.cheer = 9 + Math.random() * 10;
      if (this.game.place.roomAt(this.game.player.pos.x, this.game.player.pos.z) === 'D') sfx.cheer();
    }
  }
}
