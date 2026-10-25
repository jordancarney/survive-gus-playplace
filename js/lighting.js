// The PlayPlace's lights: one rig, four moods.
//
//   day       — every panel on, stage spots blazing, colour everywhere
//   night     — panels dead, a few neon embers, exit signs; your flashlight does the rest
//   blackout  — nothing at all except the exit signs and whatever you're carrying
//   title     — night, but with the stage softly lit so the five of them are watching you
//
// The number of lights never changes, only their intensity. Three.js recompiles every
// material when the light count changes, which would hitch the frame each time the power
// went out.
import * as THREE from 'three';

const MODES = {
  day:      { amb: 0.85, hemi: 1.1, panels: 0xfff6e0, fog: 0.0,   bg: 0x201830, decor: 'day',   exit: 1.0, monitors: 0x2a7a4a },
  night:    { amb: 0.06, hemi: 0.07, panels: 0x1b1b22, fog: 0.05, bg: 0x030206, decor: 'night', exit: 1.0, monitors: 0x2a7a4a },
  blackout: { amb: 0.025, hemi: 0.02, panels: 0x0c0c10, fog: 0.07, bg: 0x010102, decor: 'off',  exit: 0.25, monitors: 0x050505 },
  title:    { amb: 0.08, hemi: 0.08, panels: 0x1b1b22, fog: 0.035, bg: 0x030206, decor: 'night', exit: 1.0, monitors: 0x2a7a4a, stage: 26 },
};

export class Lighting {
  constructor(scene, decor, place) {
    this.scene = scene;
    this.decor = decor;
    this.place = place;
    this.ambient = new THREE.AmbientLight(0x8a90c0, 1);
    this.hemi = new THREE.HemisphereLight(0xfff0f8, 0x302040, 1);
    scene.add(this.ambient, this.hemi);
    this.fog = new THREE.FogExp2(0x030206, 0.05);
    scene.fog = this.fog;
    scene.background = new THREE.Color(0x030206);
    this.mode = 'night';
    this.cams = false;
    this.flickerT = 0;
    this.set('night');
  }

  set(mode) {
    this.mode = mode;
    this.apply();
  }

  // Security cameras see in the dark: while you're on the monitor the scene is brightened
  // (and the canvas tinted green in CSS) so you can actually spot things.
  setCams(on) {
    this.cams = on;
    this.apply();
  }

  apply() {
    const m = MODES[this.mode];
    const camBoost = this.cams && this.mode !== 'day';
    this.ambient.intensity = camBoost ? 0.75 : m.amb;
    this.ambient.color.set(this.mode === 'day' ? 0xffffff : 0x8a90c0);
    this.hemi.intensity = camBoost ? 0.4 : m.hemi;
    this.fog.density = camBoost ? 0.012 : m.fog;
    this.fog.color.set(m.bg);
    this.scene.background.set(m.bg);
    for (const p of this.place.ceilingLights) p.mat.color.set(m.panels);
    for (const l of this.decor.lights) {
      let v = m.decor === 'day' ? l.day : m.decor === 'night' ? l.night : 0;
      if (m.stage && l.room === 'D') v = l.day > 40 ? m.stage : l.night * 3;
      l.light.intensity = v;
      l.base = v;
    }
    for (const s of this.decor.exitSigns) s.color.setScalar(m.exit);
    for (const g of this.decor.glows) g.mat.color.copy(g.base).multiplyScalar(this.mode === 'blackout' ? 0.08 : 1);
    // Monitors showing a camera feed keep it bright; blank ones take the room's mood.
    for (const s of this.decor.monitors) s.color.set(s.map && this.mode !== 'blackout' ? 0x9fffb0 : m.monitors);
    if (this.decor.outsideGlass) this.decor.outsideGlass.color.set(this.mode === 'day' ? 0x9fd8ff : 0x0c1830);
  }

  update(dt) {
    // the Parts & Service bulb never quite works
    this.flickerT += dt;
    for (const l of this.decor.lights) {
      if (!l.flicker || !l.base) continue;
      const f = Math.sin(this.flickerT * 13) + Math.sin(this.flickerT * 31.7) * 0.6;
      l.light.intensity = l.base * (f > 1.1 ? 0.15 : 1);
    }
  }
}
