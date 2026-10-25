// The night itself: the clock, who's awake, games breaking on their own, the blackouts
// that let Gus out, the boss nights, and the 6 AM report.
import * as THREE from 'three';
import {
  CLOCK, AI, HAPPINESS, BOSS, nightDef, wakeHour, breakEvery, moodOf, ROAMERS, repairLevel,
} from './config.js';
import { sfx, startAmbience, stopAmbience, stopMusicBox, playMusic, stopMusic } from './audio.js';

const FUSE_ROOM = { fuseK: 'KITCHEN', fuseB: 'BALL PIT', fuseR: 'PRIZE COUNTER' };

export class NightDirector {
  constructor(game) {
    this.game = game;
    this.n = 1;
    this.time = 0;
    this.hour = 0;
    this.power = true;
    this.bossed = false;
    this.happiness = HAPPINESS.start;
    this.crates = [];
  }

  get def() { return nightDef(this.n); }
  get boss() { return this.def.boss || null; }
  get repairLevel() { return repairLevel(this.n); }

  start(n, happiness) {
    const g = this.game;
    this.n = n;
    this.time = 0;
    this.hour = 0;
    this.happiness = happiness;
    this.startHappiness = happiness;
    this.power = true;
    this.bossed = false;
    this.fixed = 0;
    this.trippedFuse = null;
    this.gusTimer = -1;
    this.freeTimer = -1;
    this.won = false;
    this.breakTimer = breakEvery(n) * (0.5 + Math.random() * 0.6);

    // Spread the blackouts across 1 AM – 5 AM, never two close together.
    this.blackouts = [];
    const k = this.def.blackouts;
    for (let i = 0; i < k; i++) {
      const span = 4.4 / k;
      const at = 1 + i * span + span * (0.25 + Math.random() * 0.5);
      this.blackouts.push(at * CLOCK.hourSeconds);
    }

    g.machines.resetAll();
    g.machines.setPower(true);
    g.machines.breakForNight(n);
    for (const a of g.bots) a.resetToStage();
    g.junk.clear();
    this.clearCrates();
    g.lighting.set('night');
    stopMusic();
    startAmbience('night');

    if (this.boss === 'gus') {
      // Night 20: the fuse boxes are fried. Lights out from the start, Gus is out, and
      // everyone else is bossed into moving faster.
      this.power = false;
      g.lighting.set('blackout');
      g.machines.setPower(false);
      startAmbience('blackout');
      const gus = g.bot('gus');
      gus.maxHealth = gus.health = BOSS.gus.health;
      this.gusTimer = 3;
      this.spawnCrates(BOSS.gus.ammoCrates);
      playMusic('boss');
    }
    if (this.boss === 'junk') {
      // Night 21: everyone is on your side.
      const roles = { gus: 'fighter', gerald: 'fighter', cranker: 'fighter', chomper: 'fixer', flipper: 'fixer' };
      for (const a of g.bots) a.befriend(roles[a.id]);
      g.junk.start();
      this.spawnCrates(BOSS.junk.ammoCrates);
      playMusic('boss');
    }
  }

  levelOf(id) {
    const base = this.def.ai[id] || 0;
    if (!base) return 0;
    return Math.max(1, Math.min(20, base + moodOf(this.happiness).level));
  }

  isAwake(id) {
    // Nobody moves in the first half minute: time to check the cameras and get your bearings.
    return this.levelOf(id) > 0 && this.hour >= wakeHour(this.def, id) && this.time > 30;
  }

  addHappiness(d) {
    this.happiness = Math.max(0, Math.min(100, this.happiness + d));
    if (d > 0) sfx.happy();
  }

  clockText() {
    if (this.boss) return '??:??';
    const h = Math.min(6, this.hour);
    return `${h === 0 ? 12 : h} AM`;
  }

  // ── Blackouts ─────────────────────────────────────────────────────────

  blackout() {
    const g = this.game;
    this.power = false;
    const fuses = g.machines.fuses;
    this.trippedFuse = fuses[Math.floor(Math.random() * fuses.length)];
    g.machines.tripFuse(this.trippedFuse);
    g.machines.setPower(false);
    g.lighting.set('blackout');
    sfx.blackout();
    startAmbience('blackout');
    g.hud.toast(`The power went out! Fix the fuse box in the ${FUSE_ROOM[this.trippedFuse.id]}!`, 5);
    this.gusTimer = AI.gusDelay;
    this.freeTimer = AI.freeJunked;
  }

  restorePower() {
    const g = this.game;
    if (this.boss === 'gus') return;
    this.power = true;
    if (this.trippedFuse) { this.trippedFuse.broken = false; g.machines.paint(this.trippedFuse); }
    this.trippedFuse = null;
    g.machines.setPower(true);
    g.lighting.set('night');
    sfx.powerOn();
    startAmbience('night');
    this.bossed = false;
    this.gusTimer = -1;
    this.freeTimer = -1;
    g.bot('gus').goHome();
    stopMusicBox();
    g.hud.toast('Power is back on! Gus is going back to the stage.', 4);
  }

  // ── Boss nights ───────────────────────────────────────────────────────

  bossPhase() {
    const gus = this.game.bot('gus');
    const f = gus.health / gus.maxHealth;
    return f > 0.66 ? 0 : f > 0.33 ? 1 : 2;
  }

  bossDefeated(who) {
    this.won = true;
    this.game.winBoss(who);
  }

  junkPhase(phase) {
    const g = this.game;
    if (phase === 1) g.hud.toast('The Junk Monster is getting angry!', 3);
    if (phase === 2) {
      // It rips the power out.
      this.power = false;
      g.lighting.set('blackout');
      g.machines.setPower(false);
      sfx.blackout();
      g.hud.toast('It ripped out the power! Your friends\' eyes will light the way.', 4);
    }
  }

  spawnCrates(n) {
    const spots = this.game.decor.crateSpots.slice().sort(() => Math.random() - 0.5).slice(0, n);
    for (const p of spots) {
      const g = new THREE.Group();
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x3a5a2a, roughness: 0.7 }));
      box.position.y = 0.2;
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.42), new THREE.MeshBasicMaterial({ color: 0xffd23f }));
      band.position.y = 0.3;
      g.add(box, band);
      g.position.copy(p);
      this.game.scene.add(g);
      this.crates.push({ group: g, pos: p.clone(), timer: 0, band });
    }
  }

  clearCrates() {
    for (const c of this.crates) this.game.scene.remove(c.group);
    this.crates = [];
  }

  updateCrates(dt) {
    const p = this.game.player;
    const def = this.boss === 'gus' ? BOSS.gus : BOSS.junk;
    for (const c of this.crates) {
      if (c.timer > 0) {
        c.timer -= dt;
        c.group.visible = c.timer <= 0;
        continue;
      }
      c.group.rotation.y += dt;
      c.band.material.color.setHSL(0.14, 1, 0.5 + Math.sin(this.time * 6) * 0.2);
      if (Math.hypot(c.pos.x - p.pos.x, c.pos.z - p.pos.z) < 1.1 && p.ammo < 18) {
        p.ammo = Math.min(18, p.ammo + def.crateAmmo);
        c.timer = def.crateRespawn;
        c.group.visible = false;
        sfx.pickup();
        this.game.hud.toast(`+${def.crateAmmo} Magnum ammo`);
      }
    }
  }

  // ── Update ────────────────────────────────────────────────────────────

  update(dt) {
    const g = this.game;
    this.time += dt;

    if (!this.boss) {
      const h = Math.floor(this.time / CLOCK.hourSeconds);
      if (h !== this.hour) {
        this.hour = h;
        if (h >= CLOCK.hours) { g.winNight(); return; }
        sfx.hour();
      }
    } else {
      this.hour = 3;
      this.updateCrates(dt);
    }

    // Games break on their own (the animatronics break plenty more).
    if (this.boss !== 'gus') {
      this.breakTimer -= dt;
      if (this.breakTimer <= 0) {
        this.breakTimer = breakEvery(this.n) * (0.7 + Math.random() * 0.6);
        if (g.machines.breakRandom()) g.hud.toast('*CLUNK* Something broke... check the cameras.', 3);
      }
    }

    if (this.power && this.blackouts.length && this.time >= this.blackouts[0] && !this.boss) {
      this.blackouts.shift();
      this.blackout();
    }

    // Gus steps off the stage a few seconds after the lights die, and everyone speeds up.
    if (this.gusTimer > 0) {
      this.gusTimer -= dt;
      if (this.gusTimer <= 0 && !this.power) {
        g.bot('gus').emerge();
        this.bossed = true;
        g.hud.toast(this.boss === 'gus' ? 'Gus is coming. Find the ammo. Fight back!' : 'You hear a music box... Gus is out!', 4);
      }
    }
    // ...and then he wakes up the junk room.
    if (this.freeTimer > 0) {
      this.freeTimer -= dt;
      if (this.freeTimer <= 0 && !this.power) {
        let n = 0;
        for (const a of g.bots) if (a.state === 'junked') { a.wakeFromJunk(); n++; }
        if (n) g.hud.toast(`Gus woke up the junk room! ${n === 1 ? 'Someone is' : n + ' animatronics are'} loose again.`, 4);
      }
    }
  }

  // ── 6 AM ──────────────────────────────────────────────────────────────

  morningReport() {
    const broken = this.game.machines.brokenCount();
    const rows = [];
    const before = this.startHappiness;
    rows.push({ label: `Games fixed (${this.fixed})`, value: this.fixed * HAPPINESS.fix });
    if (broken) rows.push({ label: `Still broken at 6 AM (${broken})`, value: broken * HAPPINESS.brokenAtDawn });
    rows.push({ label: 'A busy day of kids playing', value: HAPPINESS.wear });
    const after = Math.max(0, Math.min(100, this.happiness + broken * HAPPINESS.brokenAtDawn + HAPPINESS.wear));
    return { rows, before, after };
  }

  stop() {
    stopAmbience();
    stopMusicBox();
    this.clearCrates();
  }
}

export { ROAMERS };
