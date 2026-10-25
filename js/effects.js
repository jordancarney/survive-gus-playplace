// Pooled visual effects: sparks, taser bolts, flashes. Nothing here allocates per frame.
import * as THREE from 'three';

const SPARKS = 120;
const BOLTS = 4;

export class Effects {
  constructor(scene) {
    this.scene = scene;
    this.sparks = [];
    const geo = new THREE.BoxGeometry(0.04, 0.04, 0.04);
    const colors = [0xfff4a0, 0xffb02a, 0x9fe8ff];
    this.sparkMats = colors.map((c) => new THREE.MeshBasicMaterial({ color: c }));
    for (let i = 0; i < SPARKS; i++) {
      const m = new THREE.Mesh(geo, this.sparkMats[i % 3]);
      m.visible = false;
      scene.add(m);
      this.sparks.push({ mesh: m, vel: new THREE.Vector3(), life: 0 });
    }
    this.next = 0;

    this.bolts = [];
    for (let i = 0; i < BOLTS; i++) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12 * 3), 3));
      const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x9fe8ff }));
      line.visible = false;
      line.frustumCulled = false;
      scene.add(line);
      this.bolts.push({ line, life: 0, from: new THREE.Vector3(), to: new THREE.Vector3() });
    }

    // One light for muzzle flashes and zaps, always in the scene (see lighting.js on why).
    this.flash = new THREE.PointLight(0x9fe8ff, 0, 9, 1.5);
    scene.add(this.flash);
    this.flashLife = 0;
  }

  burst(pos, n = 10, speed = 3, kind = 0) {
    for (let i = 0; i < n; i++) {
      const s = this.sparks[this.next];
      this.next = (this.next + 1) % SPARKS;
      s.mesh.material = this.sparkMats[kind === 2 ? 2 : (i % 2)];
      s.mesh.position.copy(pos);
      s.vel.set((Math.random() - 0.5) * speed, Math.random() * speed * 0.9, (Math.random() - 0.5) * speed);
      s.life = 0.35 + Math.random() * 0.45;
      s.mesh.visible = true;
    }
  }

  bolt(from, to) {
    const b = this.bolts.find((x) => x.life <= 0) || this.bolts[0];
    b.from.copy(from);
    b.to.copy(to);
    b.life = 0.16;
    b.line.visible = true;
    this.jag(b);
    this.flashAt(to, 0x9fe8ff, 12);
  }

  jag(b) {
    const arr = b.line.geometry.attributes.position.array;
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      const j = i === 0 || i === 11 ? 0 : 0.12;
      arr[i * 3] = b.from.x + (b.to.x - b.from.x) * t + (Math.random() - 0.5) * j;
      arr[i * 3 + 1] = b.from.y + (b.to.y - b.from.y) * t + (Math.random() - 0.5) * j;
      arr[i * 3 + 2] = b.from.z + (b.to.z - b.from.z) * t + (Math.random() - 0.5) * j;
    }
    b.line.geometry.attributes.position.needsUpdate = true;
  }

  flashAt(pos, color, intensity = 14, life = 0.09) {
    this.flash.position.copy(pos);
    this.flash.color.set(color);
    this.flash.intensity = intensity;
    this.flashLife = life;
  }

  update(dt) {
    for (const s of this.sparks) {
      if (s.life <= 0) continue;
      s.life -= dt;
      s.vel.y -= 9 * dt;
      s.mesh.position.addScaledVector(s.vel, dt);
      if (s.mesh.position.y < 0.02) { s.mesh.position.y = 0.02; s.vel.y *= -0.3; s.vel.x *= 0.6; s.vel.z *= 0.6; }
      if (s.life <= 0) s.mesh.visible = false;
    }
    for (const b of this.bolts) {
      if (b.life <= 0) continue;
      b.life -= dt;
      this.jag(b);
      if (b.life <= 0) b.line.visible = false;
    }
    if (this.flashLife > 0) {
      this.flashLife -= dt;
      if (this.flashLife <= 0) this.flash.intensity = 0;
    }
  }

  clear() {
    for (const s of this.sparks) { s.life = 0; s.mesh.visible = false; }
    for (const b of this.bolts) { b.life = 0; b.line.visible = false; }
    this.flash.intensity = 0;
  }
}
