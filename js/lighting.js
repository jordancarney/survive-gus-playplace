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
import { GLOW } from './config.js';

// `env` is the environment map shiny things reflect in the realistic look, at `envI`, and
// `exposure` its camera exposure.
const MODES = {
  day:      { amb: 0.55, hemi: 0.7, panels: 0xfff6e0, fog: 0.0,   bg: 0x201830, decor: 'day',   exit: 1.0, monitors: 0x2a7a4a, env: 'day', envI: 0.4, exposure: 0.8 },
  night:    { amb: 0.03, hemi: 0.035, panels: 0x1b1b22, fog: 0.055, bg: 0x020104, decor: 'night', exit: 1.0, monitors: 0x2a7a4a, env: 'night', envI: 0.5 },
  blackout: { amb: 0.012, hemi: 0.01, panels: 0x0c0c10, fog: 0.075, bg: 0x010102, decor: 'off',  exit: 0.25, monitors: 0x050505, env: 'night', envI: 0.12 },
  home:     { amb: 0.42, hemi: 0.45, panels: 0x1b1b22, fog: 0.012, bg: 0x2a2a35, decor: 'off', exit: 0.25, monitors: 0x050505, env: 'day', envI: 0.25 },
  title:    { amb: 0.08, hemi: 0.08, panels: 0x1b1b22, fog: 0.035, bg: 0x030206, decor: 'night', exit: 1.0, monitors: 0x2a7a4a, stage: 26, env: 'night', envI: 0.6 },
};

// The designer asked for darker nights (so the flashlight matters more) and a less
// glaring daytime; these scale the room lights' own day and night values. The office desk
// lamp is left alone: it's the one safe, lit place.
const NIGHT_DIM = 0.55;

// How much scarier each `scare` level makes the nights. `stutter` is how rarely the lights
// stutter (the higher, the rarer; over 2 never) and `dip` how far they drop when they do.
const SCARE = [
  { amb: 1, hemi: 1, fog: 1, lights: 1, office: 1, red: false, stutter: 9, dip: 1 },
  { amb: 0.8, hemi: 0.8, fog: 1.15, lights: 0.8, office: 0.95, red: false, stutter: 1.93, dip: 0.35 },
  { amb: 0.55, hemi: 0.5, fog: 1.5, lights: 0.5, office: 0.8, red: true, stutter: 1.75, dip: 0.2 },
];

const FOG_COLOR = { day: new THREE.Color(0xb8b6c6), night: new THREE.Color(0x2a2a36) };
const DAY_DIM = 0.7;

export class Lighting {
  constructor(scene, decor, place, house = null) {
    this.scene = scene;
    this.decor = decor;
    this.place = place;
    this.house = house;
    this.ambient = new THREE.AmbientLight(0x8a90c0, 1);
    this.hemi = new THREE.HemisphereLight(0xfff0f8, 0x302040, 1);
    scene.add(this.ambient, this.hemi);
    this.fog = new THREE.FogExp2(0x030206, 0.05);
    scene.fog = this.fog;
    scene.background = new THREE.Color(0x030206);
    this.mode = 'night';
    this.cams = false;
    this.flickerT = 0;
    // The Play Maze is full of fog: `foggy` is set while you're in it, and the fog rolls in.
    this.foggy = false;
    this.fogK = 0;
    // The difficulty's `scare`: Horror's nights are a little darker with the odd stutter of the
    // lights; Nightmare's are much darker and redder, stutter often and sometimes cut out
    // altogether (`glitch`). The daytime and Jonathan's house are left alone.
    this.scare = 0;
    this.cut = 0;
    this.baseFog = 0.05;
    this.baseFogColor = new THREE.Color();
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
    const sc = this.scared();
    this.ambient.intensity = camBoost ? 0.75 : m.amb * sc.amb;
    this.ambient.color.set(this.mode === 'day' ? 0xffffff : this.mode === 'home' ? 0xfff0e0 : sc.red ? 0xa04040 : 0x8a90c0);
    this.hemi.intensity = camBoost ? 0.4 : m.hemi * sc.hemi;
    this.baseFog = camBoost ? 0.012 : m.fog * sc.fog;
    this.baseFogColor.set(sc.red ? 0x1a0306 : m.bg);
    this.fog.density = this.baseFog;
    this.fog.color.set(m.bg);
    this.scene.background.set(m.bg);
    const env = this.scene.userData.env;
    this.scene.userData.exposure = m.exposure ?? 1;
    if (env) {
      this.scene.environment = env[m.env];
      this.scene.environmentIntensity = camBoost ? 0.6 : m.envI;
    }
    // The new wing is dark until it opens.
    const shut = (room) => !this.place.wingOpen && !!this.place.rooms[room]?.wing;
    for (const p of this.place.ceilingLights) {
      p.mat.color.set(shut(p.room) ? MODES.blackout.panels : m.panels).multiplyScalar(this.mode === 'day' && !shut(p.room) ? GLOW : 1);
    }
    for (const l of this.decor.lights) {
      let v = m.decor === 'day' ? l.day * DAY_DIM : m.decor === 'night' ? l.night * (l.room === 'O' ? 1 : NIGHT_DIM) : 0;
      if (m.stage && l.room === 'D') v = l.day > 40 ? m.stage : l.night * 3;
      if (shut(l.room)) v = 0;
      v *= l.room === 'O' ? sc.office : sc.lights;
      l.light.intensity = v;
      l.base = v;
    }
    // Jonathan's house has its own lights, on only while you're there.
    if (this.house) for (const l of this.house.lights) l.light.intensity = this.mode === 'home' ? l.day : 0;
    for (const s of this.decor.exitSigns) s.color.setScalar(m.exit * GLOW);
    for (const g of this.decor.glows) g.mat.color.copy(g.base).multiplyScalar(this.mode === 'blackout' ? 0.08 : 1);
    // Monitors showing a camera feed keep it bright; blank ones take the room's mood.
    for (const s of this.decor.monitors) s.color.set(s.map && this.mode !== 'blackout' ? 0x9fffb0 : m.monitors);
    if (this.decor.outsideGlass) this.decor.outsideGlass.color.set(this.mode === 'day' ? 0x9fd8ff : 0x0c1830);
  }

  // Nightmare: every light goes out for `t` seconds.
  glitch(t) { this.cut = Math.max(this.cut, t); }

  // How scared to look right now: never by day or at the house, and Horror leaves the title
  // screen alone.
  scared() {
    if (this.mode === 'day' || this.mode === 'home') return SCARE[0];
    if (this.mode === 'title' && this.scare < 2) return SCARE[0];
    return SCARE[this.scare];
  }

  update(dt) {
    const want = this.foggy && !this.cams ? 1 : 0;
    this.fogK += (want - this.fogK) * Math.min(1, dt * 1.5);
    this.fog.density = this.baseFog + this.fogK * (this.mode === 'day' ? 0.09 : 0.14);
    this.fog.color.copy(this.baseFogColor).lerp(FOG_COLOR[this.mode === 'day' ? 'day' : 'night'], this.fogK * 0.8);
    // the Parts & Service bulb never quite works
    this.flickerT += dt;
    // On Horror and Nightmare (not by day) every light stutters now and then — far more often
    // in Nightmare — and Nightmare's glitches go dark.
    this.cut = Math.max(0, this.cut - dt);
    const sc = this.scared();
    const stutter = Math.sin(this.flickerT * 7.3) + Math.sin(this.flickerT * 19.1) > sc.stutter;
    for (const l of this.decor.lights) {
      if (!l.base) continue;
      let k = 1;
      if (l.flicker) {
        const f = Math.sin(this.flickerT * 13) + Math.sin(this.flickerT * 31.7) * 0.6;
        if (f > 1.1) k = 0.15;
      }
      if (stutter) k *= sc.dip;
      if (this.cut > 0) k = 0;
      l.light.intensity = l.base * k;
    }
  }
}
