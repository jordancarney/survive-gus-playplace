// The kid games and the fuse boxes: what's broken, what it looks like broken, and what
// happens when it's fixed.
//
// A broken game sparks and its lights flash red — visible on the cameras, which is the
// point. You only get a ⚠ for it on the camera map once you've actually looked at that
// room while it was broken.
import * as THREE from 'three';
import { HAPPINESS, startBroken } from './config.js';
import { sfx } from './audio.js';

const RED = new THREE.Color(0xff1a1a);
const OFF = new THREE.Color(0x111111);

export class Machines {
  constructor(game, decor) {
    this.game = game;
    this.list = decor.machines;
    this.fuses = decor.fuses;
    this.t = 0;
    this.sparkTimer = 0;
    this.power = true;
  }

  byId(id) { return this.list.find((m) => m.id === id) || this.fuses.find((m) => m.id === id); }
  isBroken(id) { const m = this.byId(id); return !!(m && m.broken); }
  brokenCount() { return this.list.filter((m) => m.broken).length; }

  resetAll() {
    for (const m of [...this.list, ...this.fuses]) {
      m.broken = false;
      m.spotted = false;
      this.paint(m);
    }
  }

  // The kids had a busy day: a few games start the night already broken.
  breakForNight(night) {
    const n = startBroken(night);
    const pool = this.list.slice().sort(() => Math.random() - 0.5);
    for (let i = 0; i < n && i < pool.length; i++) {
      pool[i].broken = true;
      this.paint(pool[i]);
    }
  }

  breakRandom() {
    const working = this.list.filter((m) => !m.broken);
    if (!working.length) return null;
    const m = working[Math.floor(Math.random() * working.length)];
    this.breakMachine(m);
    return m;
  }

  breakMachine(m, by = null) {
    if (m.broken) return;
    m.broken = true;
    m.spotted = false;
    this.paint(m);
    sfx.breakdown(m.sparkAt);
    this.game.effects.burst(m.sparkAt, 16, 3);
    this.game.onMachineBroke(m, by);
  }

  fix(m, by = null) {
    if (!m.broken) return;
    m.broken = false;
    m.spotted = false;
    this.paint(m);
    if (m.fuse) { this.game.night.restorePower(); return; }
    this.game.night.addHappiness(HAPPINESS.fix);
    this.game.profile.stats.fixed++;
    this.game.night.fixed++;
    sfx.fixed();
    this.game.hud.toast(by ? `${by} fixed the ${m.name}! Kids +${HAPPINESS.fix}` : `Fixed the ${m.name}! Kids +${HAPPINESS.fix} 😀`);
  }

  tripFuse(f) {
    f.broken = true;
    this.paint(f);
  }

  setPower(on) {
    this.power = on;
    for (const m of [...this.list, ...this.fuses]) this.paint(m);
  }

  paint(m) {
    for (const l of m.lights) {
      if (m.broken) l.mat.color.copy(RED);
      else if (!this.power && !m.fuse) l.mat.color.copy(OFF);
      else l.mat.color.copy(l.on);
    }
    for (const s of m.screens) {
      s.mat.map = m.broken ? s.bad : s.ok;
      s.mat.color.setScalar(!this.power && !m.broken ? 0.05 : 1);
      s.mat.needsUpdate = true;
    }
  }

  update(dt) {
    this.t += dt;
    const blink = Math.sin(this.t * 14) > 0;
    for (const m of [...this.list, ...this.fuses]) {
      if (!m.broken) continue;
      for (const l of m.lights) l.mat.color.copy(blink ? RED : OFF);
    }
    // Broken games spit sparks every so often.
    this.sparkTimer -= dt;
    if (this.sparkTimer <= 0) {
      this.sparkTimer = 0.5 + Math.random() * 0.7;
      for (const m of [...this.list, ...this.fuses]) {
        if (!m.broken || Math.random() < 0.5) continue;
        this.game.effects.burst(m.sparkAt, 5, 2.4);
        sfx.spark(m.sparkAt);
      }
    }
  }
}
