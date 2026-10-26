// What happens when you click: the taser, the baseball, the knife and the Magnum.
//
// Close-range weapons hit the nearest animatronic inside a cone in front of you; the Magnum
// is a ray, stopped by walls; baseballs are real balls that bounce, and you have to go and
// pick them back up (just walk over them).
import * as THREE from 'three';
import { weaponById } from './config.js';
import { sfx } from './audio.js';

const RESULT_TEXT = {
  fizzle: 'Bounced right off Gus! Only the Magnum works on him.',
  freeze: 'Gus is frozen! RUN!',
};

export class Weapons {
  constructor(game) {
    this.game = game;
    this.balls = [];
    this.ballGeo = new THREE.SphereGeometry(0.075, 12, 8);
    this.ballMat = new THREE.MeshStandardMaterial({ color: 0xf6f3ea, roughness: 0.6, emissive: 0x222222 });
  }

  targets() { return this.game.allBots().filter((a) => a.hittable && a.root.visible); }

  // The nearest hittable thing inside a cone, with a clear line to it.
  cone(range, cosMin) {
    const p = this.game.player;
    const eye = p.eye();
    const aim = p.aimDir();
    const ah = Math.hypot(aim.x, aim.z) || 1;
    let best = null, bestD = Infinity;
    for (const a of this.targets()) {
      const c = new THREE.Vector3(a.pos.x, a.pos.y + a.chestY, a.pos.z);
      const dx = c.x - eye.x, dz = c.z - eye.z;
      const dh = Math.hypot(dx, dz);
      if (dh - a.rig.radius > range) continue;
      const cos = (dx * aim.x + dz * aim.z) / (dh * ah || 1);
      const close = dh < a.rig.radius + 0.9;
      if (cos < (close ? 0.3 : cosMin)) continue;
      if (!this.game.place.sightClear(eye, c)) continue;
      if (dh < bestD) { bestD = dh; best = a; }
    }
    return best;
  }

  // Where a ray from your eye first hits a wall.
  wallDistance(eye, aim, max) {
    for (let t = 0.3; t < max; t += 0.2) {
      if (this.game.place.cell(eye.x + aim.x * t, eye.z + aim.z * t) === '#') return t;
      const y = eye.y + aim.y * t;
      if (y < 0 || y > this.game.place.wallH) return t;
    }
    return max;
  }

  use() {
    const p = this.game.player;
    if (p.carrying) return;
    const w = p.weapon;
    if (!w) return;
    if (w.id === 'taser') this.taser();
    else if (w.id === 'knife') this.knife();
    else if (w.id === 'baseball') this.throwBall();
    else if (w.id === 'magnum') this.magnum();
  }

  report(a, result) {
    const hud = this.game.hud;
    if (RESULT_TEXT[result]) hud.toast(RESULT_TEXT[result]);
    else if (result === 'asleep') hud.toast(`${a.name} is still asleep — the zap doesn't work yet!`);
    else if (result === 'down' && a.id !== 'gus' && a.id !== 'junk') hud.toast(`${a.name} powered down! Press E to drag them to Parts & Service`);
    else if (result === 'stagger' && (a.def.hits || 1) > 1 && a.hitsTaken > 0) hud.toast(`${a.name} is still up — zap again!`);
    if (result !== 'fizzle' && result !== 'asleep') hud.hitmark();
  }

  tipPos() {
    const vm = this.game.player.vm;
    const out = new THREE.Vector3();
    if (vm && vm.spark) vm.spark.getWorldPosition(out);
    else out.copy(this.game.player.eye()).addScaledVector(this.game.player.aimDir(), 0.5);
    return out;
  }

  taser() {
    const p = this.game.player;
    if (p.cool.taser > 0) return;
    if (p.taserCharges <= 0) { sfx.zapEmpty(); return; }
    p.cool.taser = weaponById('taser').gap;
    p.useTaserCharge();
    p.useAnim = 1;
    sfx.zap();
    const from = this.tipPos();
    const a = this.cone(p.taserRange, 0.82);
    if (a) {
      const to = new THREE.Vector3(a.pos.x, a.pos.y + a.chestY, a.pos.z);
      this.game.effects.bolt(from, to);
      this.report(a, a.hit('taser'));
    } else {
      const to = from.clone().addScaledVector(p.aimDir(), 1.2);
      this.game.effects.bolt(from, to);
    }
    if (p.vm && p.vm.spark) { p.vm.spark.visible = true; setTimeout(() => { if (p.vm && p.vm.spark) p.vm.spark.visible = false; }, 140); }
  }

  knife() {
    const p = this.game.player;
    if (p.cool.knife > 0) return;
    p.cool.knife = weaponById('knife').cooldown;
    p.useAnim = 1.3;
    const a = this.cone(weaponById('knife').range, 0.75);
    if (a) {
      sfx.knifeHit();
      this.report(a, a.hit('knife'));
    } else sfx.knife();
  }

  throwBall() {
    const p = this.game.player;
    if (p.cool.baseball > 0) return;
    if (p.balls <= 0) { sfx.zapEmpty(); this.game.hud.toast('No baseballs left — go pick yours up!'); return; }
    p.balls--;
    p.cool.baseball = 0.45;
    p.useAnim = 1.2;
    sfx.throwBall();
    const aim = p.aimDir();
    const mesh = new THREE.Mesh(this.ballGeo, this.ballMat);
    const pos = p.eye().addScaledVector(aim, 0.5);
    mesh.position.copy(pos);
    this.game.scene.add(mesh);
    const speed = weaponById('baseball').speed;
    this.balls.push({ mesh, vel: aim.clone().multiplyScalar(speed).add(new THREE.Vector3(0, 1.5, 0)), live: true, rest: 0, age: 0 });
  }

  magnum() {
    const p = this.game.player;
    if (p.cool.magnum > 0) return;
    if (p.ammo <= 0) { sfx.dryFire(); this.game.hud.toast('Out of Magnum ammo!'); return; }
    p.ammo--;
    p.cool.magnum = weaponById('magnum').cooldown;
    p.useAnim = 2.2;
    p.shake = Math.max(p.shake, 0.35);
    sfx.magnum();
    const eye = p.eye();
    const aim = p.aimDir();
    if (p.vm && p.vm.muzzle) {
      p.vm.muzzle.visible = true;
      setTimeout(() => { if (p.vm && p.vm.muzzle) p.vm.muzzle.visible = false; }, 60);
    }
    this.game.effects.flashAt(eye.clone().addScaledVector(aim, 1), 0xffd27a, 30, 0.07);
    const wall = this.wallDistance(eye, aim, weaponById('magnum').range);
    let best = null, bestT = wall;
    for (const a of this.targets()) {
      const r = a.rig.radius + 0.18;
      for (const fy of [0.3, 0.6, 0.85]) {
        const c = new THREE.Vector3(a.pos.x, a.pos.y + a.rig.height * fy, a.pos.z);
        const t = c.clone().sub(eye).dot(aim);
        if (t < 0 || t > bestT) continue;
        const closest = eye.clone().addScaledVector(aim, t);
        if (closest.distanceTo(c) < r) { best = a; bestT = t; break; }
      }
    }
    const hitPoint = eye.clone().addScaledVector(aim, bestT);
    this.game.effects.burst(hitPoint, best ? 4 : 8, 3);
    if (best) this.report(best, best.hit('magnum'));
    // It's LOUD. Everyone awake comes to see what that was.
    this.game.alertAll(p.pos);
  }

  update(dt) {
    const p = this.game.player;
    const place = this.game.place;
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const b = this.balls[i];
      b.age += dt;
      const m = b.mesh.position;
      if (b.live) {
        b.vel.y -= 9.8 * dt;
        const nx = m.x + b.vel.x * dt, nz = m.z + b.vel.z * dt;
        if (place.cell(nx, m.z) === '#') { b.vel.x *= -0.5; sfx.ballBounce(m); }
        if (place.cell(m.x, nz) === '#') { b.vel.z *= -0.5; sfx.ballBounce(m); }
        m.addScaledVector(b.vel, dt);
        if (m.y < 0.08) {
          m.y = 0.08;
          if (Math.abs(b.vel.y) > 1.2) sfx.ballBounce(m);
          b.vel.y *= -0.45;
          b.vel.x *= 0.7; b.vel.z *= 0.7;
        }
        if (m.y > 4.5) { m.y = 4.5; b.vel.y = -Math.abs(b.vel.y) * 0.5; }
        // bonk
        if (b.age < 3 && Math.hypot(b.vel.x, b.vel.z) > 3) {
          for (const a of this.targets()) {
            if (Math.hypot(a.pos.x - m.x, a.pos.z - m.z) < a.rig.radius + 0.2 && m.y < a.pos.y + a.rig.height && m.y > a.pos.y) {
              this.report(a, a.hit('baseball'));
              b.vel.x *= -0.3; b.vel.z *= -0.3; b.vel.y = 2;
              break;
            }
          }
        }
        if (Math.hypot(b.vel.x, b.vel.y, b.vel.z) < 0.4 && m.y < 0.1) b.live = false;
        b.mesh.rotation.x += dt * 10;
      }
      // walk over a ball to pick it up
      if (b.age > 0.6 && Math.hypot(m.x - p.pos.x, m.z - p.pos.z) < 1.1 && m.y < 1.5) {
        p.balls = Math.min(weaponById('baseball').count, p.balls + 1);
        sfx.pickup();
        this.game.scene.remove(b.mesh);
        this.balls.splice(i, 1);
      }
    }
  }

  clear() {
    for (const b of this.balls) this.game.scene.remove(b.mesh);
    this.balls = [];
  }
}
