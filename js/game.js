// The game's state machine and the glue between every system.
//
//   title → intro cutscene (first time) → day → card → night → morning → day → card → …
//                                                         ↘ caught → card (same night again)
//
// After Night 10 the morning leads home instead: the animatronics followed Jonathan back to
// his house, and he has to zap them and load them into the PlayPlace van. Night 20 ends in a
// boss fight with Gus; winning it makes the animatronics your friends and opens Secret
// Night 21, where they help you fight the Junk Monster. The story between all of that is
// told in cutscenes (story.js).
import * as THREE from 'three';
import {
  DEBUG, ANIMATRONIC_ORDER, ROAMERS, PLAYER, TIMMY, weaponsFor, unlocksAt, LAST_STORY_NIGHT, nightDef, REALISTIC,
} from './config.js';
import { input, requestPointerLock, exitPointerLock, onPointerLockChange } from './input.js';
import { audio, sfx, playMusic, stopMusic, setListener, startAmbience, stopAmbience, stopMusicBox } from './audio.js';
import { PlayPlace, P, ROOMS } from './map.js';
import { Decor } from './decor.js';
import { House, HouseDecor } from './house.js';
import { Cutscene, makePerson } from './cutscene.js';
import { SCRIPTS, BEFORE_NIGHT } from './story.js';
import { Lighting } from './lighting.js';
import { Effects } from './effects.js';
import { Machines } from './machines.js';
import { Player } from './player.js';
import { Animatronic, JunkMonster } from './animatronics.js';
import { NightDirector } from './night.js';
import { Daytime } from './day.js';
import { CameraSystem } from './cameras.js';
import { Repair } from './repair.js';
import { Weapons } from './weapons.js';
import { Hud } from './hud.js';
import { Touch } from './touch.js';
import { Timmy } from './timmy.js';
import { Phone } from './phone.js';
import { loadProfile, saveProfile, freshProfile, saveGraphics } from './save.js';
import { setEyes, buildJonathan, buildManager, buildGramma } from './models.js';
import { signTex } from './textures.js';
import { VERSION } from './version.js';

const $ = (id) => document.getElementById(id);

const TIPS = {
  cranker: 'Listen for Cranker\'s squeaky feet. He\'s slower than you walk, but he keeps coming — zap him!',
  chomper: 'Chomper breaks games and chews camera wires. A fuzzy camera means he\'s close.',
  gerald: 'Gerald takes two zaps. A baseball freezes him from far away.',
  flipper: 'Flipper can hear you running. Walk when you\'re near the ball pit.',
  gus: 'When the power goes out, run to the fuse box — Gus always knows where you are.',
  home: 'Zap one, then drag it to the van right away — before the next one finds you.',
  gusBoss: 'Keep moving and grab the glowing ammo boxes. Every Magnum hit freezes him.',
  junk: 'Dodge the junk it throws and fight next to your friends.',
};

export class Game {
  constructor(renderer, canvas, graphics) {
    this.renderer = renderer;
    this.graphics = graphics;
    this.canvas = canvas;
    this.input = input;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(72, 16 / 9, 0.1, 120);
    this.scene.add(this.camera);

    this.place = new PlayPlace();
    this.scene.add(this.place.build());
    this.decor = new Decor(this.place);
    this.scene.add(this.decor.build());
    this.house = new House();
    this.scene.add(this.house.build());
    this.houseDecor = new HouseDecor(this.house);
    this.scene.add(this.houseDecor.build());
    // Two places the game can be. Systems reach the current one through `this.place`.
    this.areas = {
      playplace: {
        building: this.place, isPlayPlace: true, groups: [this.place.group, this.decor.group],
        spawn: this.decor.stageSpots, roam: ['K', 'B', 'D', 'H', 'T', 'E', 'P', 'A', 'R'], hideRoom: 'B',
      },
      home: {
        building: this.house, isPlayPlace: false, groups: [this.house.group, this.houseDecor.group],
        spawn: this.houseDecor.spawn, roam: ['B', 'W', 'K', 'H', 'L', 'G'], hideRoom: 'W',
        hideSpot: this.houseDecor.spawn.flipper,
      },
    };
    this.playplace = this.place;
    this.lighting = new Lighting(this.scene, this.decor, this.place, this.houseDecor);
    this.people = {
      jonathan: makePerson(this.scene, buildJonathan),
      manager: makePerson(this.scene, buildManager),
      gramma: makePerson(this.scene, buildGramma),
    };
    this.effects = new Effects(this.scene);
    this.machines = new Machines(this, this.decor);
    this.player = new Player(this, this.camera);
    this.bots = ANIMATRONIC_ORDER.map((id) => new Animatronic(this, id));
    this.junk = new JunkMonster(this);
    // The old originals, under dust sheets in Parts & Service until Night 21.
    this.oldBots = ANIMATRONIC_ORDER.map((id) => {
      const a = new Animatronic(this, id, { old: true });
      a.spawnAt = this.decor.oldSpots[id];
      a.root.visible = false;
      a.state = 'stored';
      return a;
    });
    this.timmy = new Timmy(this);
    this.timmyQuest = false;
    this.night = new NightDirector(this);
    this.day = new Daytime(this);
    this.cams = new CameraSystem(this);
    this.repair = new Repair(this);
    this.weapons = new Weapons(this);
    this.hud = new Hud(this);
    this.touch = new Touch(this);
    this.touch.init();
    this.cut = new Cutscene(this);
    this.phone = new Phone(this);
    this.setArea('playplace');
    graphics.prepare(this.scene);
    this.lighting.apply();

    this.profile = loadProfile();
    this.mode = 'loading';
    this.t = 0;
    this.playing = 1;
    this.scareTimer = 0;
    this.scarer = null;

    audio.occluded = (pos) => !this.place.sightClear(this.player.pos, pos);
    for (const a of this.bots) a.resetToStage();
    this.player.setWeapons(['taser']);
    this.updatePhoto();

    this.wireUI();
    onPointerLockChange((locked) => this.onLockChange(locked));
    $('buildTag').textContent = `v${VERSION}`;
    if (DEBUG) window.__game = this;
  }

  bot(id) { return this.bots.find((a) => a.id === id); }
  allBots() { return this.junk.root.visible ? [...this.bots, this.junk] : this.bots; }
  roomName(id) { return ROOMS[id] ? ROOMS[id].name : ''; }
  isPlaying() { return this.mode === 'night' || this.mode === 'day' || this.mode === 'home'; }
  // True while the animatronics are out to get you.
  get hunting() { return this.mode === 'night' || this.mode === 'home'; }

  setArea(name) {
    this.area = this.areas[name];
    this.place = this.area.building;
    for (const a of Object.values(this.areas)) for (const g of a.groups) g.visible = a === this.area;
  }

  hidePeople() { for (const p of Object.values(this.people)) p.root.visible = false; }

  // Everyone the animatronics' side of things can be fighting alongside you.
  friends() { return [...this.bots, ...this.oldBots].filter((a) => a.state === 'friend' && a.root.visible); }

  resetBots() {
    this.timmy.hide();
    for (const a of this.bots) a.resetToStage();
    for (const a of this.oldBots) { a.state = 'stored'; a.root.visible = false; }
    for (const s of this.decor.sheets) s.visible = true;
    this.junk.clear();
    if (!this.area.isPlayPlace) this.bot('gus').root.visible = false;   // Gus never leaves the stage
  }

  resetHouse() {
    const d = this.houseDecor;
    d.van.group.position.copy(d.van.home);
    d.setVanDoors(true);
    d.garageDoor.position.y = 0;
  }

  cutscene(id, done) {
    exitPointerLock();
    this.night.stop();
    this.day.stop();
    this.weapons.clear();
    this.cut.play(SCRIPTS[id], done);
  }

  // ── UI wiring ─────────────────────────────────────────────────────────

  wireUI() {
    const click = (id, fn) => $(id).addEventListener('click', () => { sfx.ui(); fn(); });
    click('btnPlay', () => this.continueGame());
    click('btnNew', () => {
      if (!confirm('Start over from Night 1? Your progress will be erased.')) return;
      this.profile = freshProfile();
      saveProfile(this.profile);
      this.updatePhoto();
      this.continueGame();
    });
    click('btnSelect', () => {
      this.hud.select(this.profile, (n) => { sfx.ui(); if (n === 'home') this.startHome(); else this.showCard(n); });
      this.showScreen('select');
    });
    click('btnSelectBack', () => this.toTitle());
    click('btnHowTo', () => this.showScreen('howto'));
    click('btnHowToBack', () => this.toTitle());
    // Realistic is the full look; Fast is the original, for phones and tablets.
    $('btnGfx').textContent = `Graphics: ${REALISTIC ? 'Realistic ✨' : 'Fast ⚡'}`;
    click('btnGfx', () => saveGraphics(REALISTIC ? 'fast' : 'real'));
    click('btnCardGo', () => this.beginNight(this.cardNight));
    click('btnResume', () => this.togglePause());
    click('btnQuit', () => this.toTitle());
    click('btnRetry', () => this.retry());
    click('btnCaughtMenu', () => this.toTitle());
    click('btnMorningGo', () => this.afterMorning());
    click('btnClockIn', () => this.clockIn());

    // Clicking the 3D view during play takes the mouse.
    this.canvas.addEventListener('click', () => {
      if (this.isPlaying() && !this.cams.active && !this.touch.active) requestPointerLock();
    });
    $('clickToPlay').addEventListener('click', () => requestPointerLock());
  }

  showScreen(name) {
    for (const el of document.querySelectorAll('.screen')) el.classList.remove('show');
    const el = $(name);
    if (el && el.classList.contains('screen')) el.classList.add('show');
    this.mode = name;
    const playing = name === 'night' || name === 'day' || name === 'home';
    this.hud.show(playing);
    this.hud.el.classList.toggle('day', name === 'day');
    $('dayPanel').classList.toggle('hidden', name !== 'day');
    if (!playing) { this.cams.close(); if (this.repair.active) this.repair.close(); }
  }

  toTitle() {
    exitPointerLock();
    this.setArea('playplace');
    this.hidePeople();
    this.night.stop();
    this.day.stop();
    this.junk.clear();
    this.weapons.clear();
    this.effects.clear();
    this.resetBots();
    this.machines.resetAll();
    this.machines.setPower(true);
    this.player.carrying = null;
    this.hideHands();
    this.lighting.set('title');
    this.hud.title(this.profile);
    this.showScreen('title');
    playMusic('title');
  }

  continueGame() {
    const p = this.profile;
    if (!p.seenIntro) {
      this.cutscene('intro', () => {
        p.seenIntro = true;
        saveProfile(p);
        this.startDay({ first: true });
      });
      return;
    }
    if (this.timmyNext()) { this.cutscene('timmyNumber', () => this.startDay({ timmy: true })); return; }
    if (this.homeNext()) { this.cutscene('home', () => this.startHome()); return; }
    this.showCard(p.night);
  }

  // Night 2 is done and Timmy still hasn't gone home with his gramma.
  timmyNext() { return this.profile.night === 3 && !this.profile.timmyHome; }

  // Night 10 is done and the trip home hasn't happened yet.
  homeNext() { return this.profile.night === 11 && !this.profile.homeDone; }

  afterMorning() {
    if (!this.replaying && this.timmyNext()) this.cutscene('timmyNumber', () => this.startDay({ timmy: true }));
    else if (!this.replaying && this.homeNext()) this.cutscene('home', () => this.startHome());
    else this.startDay();
  }

  // ── Daytime ───────────────────────────────────────────────────────────

  startDay({ first = false, timmy = false } = {}) {
    this.setArea('playplace');
    this.hidePeople();
    this.night.stop();
    this.junk.clear();
    this.weapons.clear();
    this.effects.clear();
    this.machines.resetAll();
    this.machines.setPower(true);
    for (const a of this.bots) a.resetToStage();
    if (this.profile.beatGus) for (const a of this.bots) setEyes(a.rig, 'friend');
    this.player.reset(P(30, 11.2), 0, this.profile.night);
    this.player.setWeapons(weaponsFor(Math.min(this.profile.night, 20)));
    this.player.lightOn = false;
    this.player.lightVisible = false;
    this.player.vmGroup.visible = true;
    this.day.start(this.profile.happiness);
    const n = this.profile.night;
    this.timmyQuest = timmy;
    if (timmy) this.timmy.follow(P(31.2, 11.6)); else this.timmy.hide();
    $('btnClockIn').classList.toggle('hidden', timmy);
    $('dayText').innerHTML = timmy
      ? 'Timmy remembered his gramma\'s number! Take him to the <b>Security Office</b> and call her on the <b>desk phone</b> (E).'
      : first
      ? 'Your first day at Gus\'s PlayPlace! Walk around (WASD + mouse). When you\'re ready, clock in at the <b>time clock</b> in the <b>Security Office</b> — or just press the button.'
      : `The kids are back! Look around, then clock in at the <b>time clock</b> in the <b>Security Office</b>.`;
    $('btnClockIn').textContent = n > LAST_STORY_NIGHT ? 'Clock in for Secret Night 21' : `Clock in for Night ${n}`;
    this.showScreen('day');
    if (!this.touch.active) $('clickToPlay').classList.remove('hidden');
  }

  clockIn() {
    exitPointerLock();
    this.day.stop();
    stopMusic();
    this.showCard(this.profile.night);
  }

  // ── Nights ────────────────────────────────────────────────────────────

  showCard(n) {
    exitPointerLock();
    this.night.stop();
    this.day.stop();
    stopMusic();
    this.cardNight = n;
    this.setArea('playplace');
    this.hidePeople();
    this.hideHands();
    this.hud.card(n);
    this.lighting.set('title');
    this.resetBots();
    this.showScreen('card');
  }

  // Some nights open with a cutscene, the first time you reach them.
  beginNight(n) {
    const id = BEFORE_NIGHT[n];
    const seen = this.profile.seen;
    if (id && !seen[id]) {
      seen[id] = true;
      saveProfile(this.profile);
      this.cutscene(id, () => this.startNight(n));
    } else this.startNight(n);
  }

  startNight(n) {
    const p = this.profile;
    this.timmyQuest = false;
    this.setArea('playplace');
    this.hidePeople();
    this.retry = () => this.showCard(n);
    this.winTimer = 0;
    $('jumpFlash').classList.add('hidden');
    this.replaying = n !== p.night;
    this.weapons.clear();
    this.effects.clear();
    const def = nightDef(n);
    this.player.reset(P(33.7, 37.2), Math.PI / 2, n);
    this.player.setWeapons(weaponsFor(n));
    this.player.lightOn = true;
    this.player.lightVisible = true;
    this.player.vmGroup.visible = true;
    this.night.start(n, p.happiness);
    this.updatePhoto();
    this.showScreen('night');
    this.hud.toast(def.boss ? `NIGHT ${n}: ${def.title.toUpperCase()}` : `NIGHT ${n} · 12 AM`, 3);
    if (!this.touch.active) {
      requestPointerLock();
      $('clickToPlay').classList.remove('hidden');
    }
  }

  // ── They followed me home ─────────────────────────────────────────────

  startHome() {
    this.retry = () => this.startHome();
    this.replaying = this.profile.homeDone;
    this.setArea('home');
    this.hidePeople();
    this.winTimer = 0;
    $('jumpFlash').classList.add('hidden');
    this.weapons.clear();
    this.effects.clear();
    this.resetHouse();
    this.night.startHome(this.profile.happiness);
    this.resetBots();
    // They're already in the house, poking around.
    for (const id of ROAMERS) {
      const a = this.bot(id);
      a.state = 'linger';
      a.timer = 5 + Math.random() * 8;
      a.mischief = id === 'flipper' ? 'pit' : null;
    }
    this.player.reset(this.houseDecor.spawn.jonathan, Math.PI, 10);
    this.player.setWeapons(weaponsFor(10));
    this.player.lightOn = false;
    this.player.lightVisible = true;
    this.player.vmGroup.visible = true;
    this.lighting.set('home');
    stopMusic();
    startAmbience('night');
    this.showScreen('home');
    this.hud.toast('They followed you home! Zap them and load them into the van in the garage.', 5);
    if (!this.touch.active) {
      requestPointerLock();
      $('clickToPlay').classList.remove('hidden');
    }
  }

  vanCount() { return ROAMERS.filter((id) => this.bot(id).state === 'junked').length; }

  winHome() {
    exitPointerLock();
    const p = this.profile;
    if (!p.homeDone) { p.homeDone = true; saveProfile(p); }
    sfx.victory();
    this.cutscene('homeDone', () => this.startDay());
  }

  // Something caught Jonathan.
  caught(who) {
    if (!this.hunting) return;
    this.cams.close();
    if (this.repair.active) this.repair.close();
    if (this.player.carrying) this.dropCarried();
    this.mode = 'jumpscare';
    this.scarer = who;
    this.scareTimer = 1.7;
    this.prevScareState = who.state;
    who.state = 'jumpscare';
    setEyes(who.rig, 'scare');
    // Flashlight off: the face is lit from below in red, which is far scarier.
    this.player.vmGroup.visible = false;
    this.player.lightVisible = false;
    this.hud.show(false);
    $('clickToPlay').classList.add('hidden');
    stopMusicBox();
    stopMusic();
    stopAmbience();
    sfx.scream();
    $('jumpFlash').classList.remove('hidden');
    this.profile.stats.caught++;
    saveProfile(this.profile);
  }

  updateJumpscare(dt) {
    const a = this.scarer;
    if (!a) { $('jumpFlash').classList.add('hidden'); this.toTitle(); return; }
    this.scareTimer -= dt;
    const t = 1.7 - this.scareTimer;
    // It rushes the last two metres into your face, then holds there, shaking.
    const near = a.rig.snout + 0.5;
    const d = t < 0.22 ? near + 1.6 * (1 - t / 0.22) : near;
    const cam = this.camera;
    const f = this.player.forward2();
    const eyeH = a.rig.faceY - 0.05;
    a.pos.set(cam.position.x + f.x * d, 0, cam.position.z + f.z * d);
    a.yaw = Math.atan2(-f.x, -f.z);
    a.root.position.set(a.pos.x, cam.position.y - eyeH + Math.sin(t * 50) * 0.03, a.pos.z);
    a.root.rotation.set(0, a.yaw, 0);
    a.render(dt);
    a.root.position.y = cam.position.y - eyeH + Math.sin(t * 50) * 0.03;
    this.player.pitch += (0 - this.player.pitch) * Math.min(1, dt * 10);
    this.player.shake = 1.0;
    this.player.updateCamera();
    const under = cam.position.clone().addScaledVector(new THREE.Vector3(f.x, 0, f.z), near * 0.6);
    under.y -= 1.0;
    this.effects.flashAt(under, Math.sin(t * 40) > -0.3 ? 0xff3020 : 0xffffff, 5, 0.05);
    if (this.scareTimer <= 0) {
      $('jumpFlash').classList.add('hidden');
      exitPointerLock();
      const home = !this.area.isPlayPlace;
      const tip = home ? TIPS.home : a.id === 'gus' && this.night.boss === 'gus' ? TIPS.gusBoss : TIPS[a.id];
      this.hud.caught(a.name, home ? 'Try again' : `Try Night ${this.night.n} again`, tip);
      a.root.visible = a.id !== 'junk';
      this.night.stop();
      this.showScreen('caught');
    }
  }

  winNight() {
    const n = this.night.n;
    exitPointerLock();
    this.cams.close();
    if (this.repair.active) this.repair.close();
    const report = this.night.morningReport();
    this.night.stop();
    sfx.sixAM();
    setTimeout(() => sfx.cheer(), 1800);
    const p = this.profile;
    p.stats.survived++;
    if (!this.replaying) {
      p.happiness = report.after;
      p.night = n + 1;
      p.best = Math.max(p.best, p.night);
    }
    saveProfile(p);
    this.hud.morning(n, report, this.replaying ? [] : unlocksAt(n + 1));
    this.showScreen('morning');
  }

  // The boss is down. Everyone else stops hunting you straight away; the ending plays
  // after a few seconds of watching it fall apart.
  winBoss(who) {
    this.winTimer = 3;
    this.winWho = who;
    for (const a of this.bots) if (a !== who && a.state !== 'friend' && a.root.visible) a.befriend(null);
    if (this.player.carrying) this.dropCarried();
  }

  finishBoss(who) {
    const n = this.night.n;
    {
      exitPointerLock();
      this.night.stop();
      const p = this.profile;
      if (who.id === 'gus') {
        p.beatGus = true;
        if (p.night <= 20) p.night = 21;
      } else {
        p.beatJunk = true;
      }
      p.best = Math.max(p.best, n + (who.id === 'gus' ? 1 : 0));
      p.stats.survived++;
      saveProfile(p);
      this.updatePhoto();
      sfx.victory();
      this.cutscene(who.id === 'gus' ? 'gusDown' : 'finale', () => this.toTitle());
    }
  }

  updatePhoto() {
    const done = this.profile.beatJunk;
    const tex = signTex(done ? 'EMPLOYEE\nOF THE\nMONTH\nJONATHAN' : 'EMPLOYEE\nOF THE\nMONTH\n?',
      { bg: '#f4f1ea', fg: done ? '#5b2a86' : '#333', glow: '#c9a227', w: 256, h: 320, font: 'bold 40px sans-serif' });
    this.decor.employeePhoto.map = tex;
    this.decor.employeePhoto.needsUpdate = true;
  }

  // Menus are drawn over the stage camera: no hands, no flashlight.
  hideHands() {
    this.player.vmGroup.visible = false;
    this.player.lightVisible = false;
  }

  togglePause() {
    if (this.mode === 'paused') {
      this.showScreen(this.pausedFrom);
      if (!this.touch.active) requestPointerLock();
      return;
    }
    if (!this.isPlaying()) return;
    this.pausedFrom = this.mode;
    exitPointerLock();
    this.showScreen('pause');
    this.mode = 'paused';
  }

  onLockChange(locked) {
    $('clickToPlay').classList.toggle('hidden', locked || !this.isPlaying() || this.cams.active || this.touch.active);
    if (locked || !this.isPlaying() || this.cams.active || this.repair.active) return;
    // Escape released the mouse mid-night: pause rather than leave Jonathan standing there.
    if (this.hunting) this.togglePause();
  }

  // ── Carrying ──────────────────────────────────────────────────────────

  onPowerDown() { /* the weapon that did it reports to the HUD */ }

  grab(a) {
    a.state = 'carried';
    this.player.carrying = a;
    this.player.rebuildViewmodel();
    sfx.pickup();
  }

  dropCarried() {
    const a = this.player.carrying;
    if (!a) return;
    this.player.carrying = null;
    this.player.rebuildViewmodel();
    if (a.state === 'carried') { a.state = 'down'; a.root.rotation.x = 0; }
  }

  chuck() {
    const a = this.player.carrying;
    if (!a) return;
    this.player.carrying = null;
    this.player.rebuildViewmodel();
    // The junk pile at the PlayPlace; the back of the van at home.
    const spots = this.area.isPlayPlace ? this.decor.junkSpots : this.houseDecor.van.spots;
    const used = this.bots.filter((b) => b.state === 'junked').map((b) => b.junkSpot);
    const spot = spots.find((s, i) => !used.includes(i));
    a.junkSpot = spots.indexOf(spot);
    a.pos.set(spot.x, 0, spot.z);
    a.yaw = Math.random() * Math.PI * 2;
    a.state = 'junked';
    setEyes(a.rig, 'off');
    sfx.clang();
    this.effects.burst(new THREE.Vector3(spot.x, 0.6, spot.z), 12, 3);
    this.profile.stats.junked++;
    if (this.area.isPlayPlace) this.hud.toast(`${a.name} is out for the night! 🗑️`);
    else {
      a.root.visible = false;   // in the back of the van, out of sight
      this.hud.toast(`${a.name} is in the van! (${this.vanCount()} of ${ROAMERS.length})`);
    }
  }

  alertAll(pos) {
    for (const a of this.bots) {
      if (['roam', 'linger', 'search'].includes(a.state)) {
        a.state = 'search';
        a.goTo(pos);
      }
    }
  }

  onMachineBroke(m, by) {
    if (this.mode !== 'night') return;
    const d = m.point.distanceTo(this.player.pos);
    if (by && d < 14) this.hud.toast(`${by} broke the ${m.name}!`);
  }

  onRepaired(m) { this.machines.fix(m); }
  onRepairCancelled() {}

  // ── What can I press E on? ────────────────────────────────────────────

  findInteraction() {
    const p = this.player;
    const reach = PLAYER.reach;
    const room = this.place.roomAt(p.pos.x, p.pos.z);
    const near = (pt, r = reach) => Math.hypot(pt.x - p.pos.x, pt.z - p.pos.z) < r;

    if (this.mode === 'day') {
      if (this.timmyQuest && near(this.decor.phone.point, 1.5)) {
        return { text: '<b>E</b> Call Timmy\'s gramma', act: () => this.phone.open(TIMMY.number, 'Timmy\'s Gramma', () => this.grammaComes()) };
      }
      if (!this.timmyQuest && near(this.decor.timeClock.point, 1.6)) {
        return { text: `<b>E</b> Clock in for ${this.profile.night > 20 ? 'Secret Night 21' : 'Night ' + this.profile.night}`, act: () => this.clockIn() };
      }
      return null;
    }
    if (p.carrying) {
      if (this.area.isPlayPlace && room === 'J') return { text: `<b>E</b> Chuck ${p.carrying.name} into the junk pile`, act: () => this.chuck() };
      if (!this.area.isPlayPlace && near(this.houseDecor.van.drop, 2.6)) return { text: `<b>E</b> Load ${p.carrying.name} into the van`, act: () => this.chuck() };
      return { text: `<b>E</b> Let go of ${p.carrying.name}`, act: () => this.dropCarried(), quiet: true };
    }
    if (this.timmy.state === 'crying' && near(this.timmy.pos, 2.4)) return { text: '<b>E</b> Talk to the crying kid', act: () => this.meetTimmy() };
    for (const a of this.bots) {
      if (a.state === 'down' && near(a.pos, 2.3)) return { text: `<b>E</b> Drag ${a.name}`, act: () => this.grab(a) };
    }
    const f = this.night.trippedFuse;
    if (f && near(f.point, 1.5)) return { text: '<b>E</b> Fix the fuse box', act: () => this.repair.start(f, this.night.repairLevel) };
    for (const m of this.machines.list) {
      if (m.broken && near(m.point, 1.6)) return { text: `<b>E</b> Fix the ${m.name}`, act: () => this.repair.start(m, this.night.repairLevel) };
    }
    if (this.area.isPlayPlace && room === 'O' && near(this.decor.desk.point, 1.8)) return { text: '<b>E</b> Use the cameras', act: () => this.cams.open() };
    return null;
  }

  // ── Update ────────────────────────────────────────────────────────────

  update(dt) {
    this.t += dt;
    this.touch.apply();
    if (this.mode === 'paused' && input.pressed('pause')) this.togglePause();
    switch (this.mode) {
      case 'night': this.updateNight(dt); break;
      case 'home': this.updateHome(dt); break;
      case 'day': this.updateDay(dt); break;
      case 'cutscene':
        this.cut.update(dt);
        if (this.cut.active && this.cut.script.kids) this.day.update(dt);
        break;
      case 'jumpscare': this.updateJumpscare(dt); break;
      case 'title': case 'card': case 'howto': case 'select':
        this.updateBackdrop(dt);
        break;
      default:
        if (this.mode === 'morning' || this.mode === 'caught') this.updateBackdrop(dt);
    }
    this.effects.update(dt);
    this.lighting.update(dt);
    this.decor.update(dt, this.t, (id) => this.machines.isBroken(id));
    setListener(this.player.pos.x, this.player.pos.z, this.player.yaw);
  }

  // The menus sit over a slow drift past the stage.
  updateBackdrop(dt) {
    const s = Math.sin(this.t * 0.12);
    this.camera.position.copy(P(30 + s * 3.5, 14.5 + Math.cos(this.t * 0.09) * 1.2, 1.65));
    this.camera.lookAt(P(30 + s * 1.5, 3.2, 1.6));
    for (const a of this.bots) a.update(dt);
    // On the title they slowly turn to look at you.
    for (const a of this.bots) {
      const dx = this.camera.position.x - a.pos.x, dz = this.camera.position.z - a.pos.z;
      a.rig.head.rotation.y = Math.atan2(dx, dz) * 0.6 + Math.sin(this.t * 0.5 + a.animT) * 0.05;
    }
  }

  handleCommonInput() {
    const p = this.player;
    if (input.pressed('pause') && !this.cams.active && !this.repair.active) { this.togglePause(); return true; }
    if (input.pressed('flashlight') && this.hunting) p.toggleLight();
    if (input.pressed('swap') || input.wheel) {
      const dir = input.wheel < 0 ? -1 : 1;
      p.selectSlot((p.slot + dir + p.weapons.length) % p.weapons.length);
    }
    for (let k = 1; k <= 4; k++) if (input.keyPressed('Digit' + k)) p.selectSlot(k - 1);
    return false;
  }

  updateNight(dt) {
    const p = this.player;
    if (this.cams.active) {
      if (input.keyPressed('KeyE') || input.keyPressed('Space') || input.keyPressed('Escape') || input.keyPressed('KeyS')) this.cams.close();
      p.update(dt, { canMove: false, canLook: false });
      this.hud.prompt(null);
    } else if (this.repair.active) {
      this.repair.update(dt);
      p.update(dt, { canMove: false, canLook: true });
      this.hud.prompt(null);
    } else {
      if (this.handleCommonInput()) return;
      p.update(dt);
      const it = this.findInteraction();
      this.hud.prompt(it ? it.text : null);
      if (it && input.pressed('interact')) it.act();
      if (input.firePressed && (input.locked || this.touch.active)) this.weapons.use();
    }
    this.cams.update(dt);
    if (this.mode !== 'night') return;
    if (this.winTimer > 0) {
      this.winTimer -= dt;
      if (this.winTimer <= 0) { this.finishBoss(this.winWho); return; }
    }
    this.night.update(dt);
    if (this.mode !== 'night') return;
    for (const a of this.bots) a.update(dt);
    for (const a of this.oldBots) if (a.state === 'friend') a.update(dt);
    if (this.mode !== 'night') return;
    this.timmy.update(dt);
    this.junk.update(dt);
    this.weapons.update(dt);
    this.machines.update(dt);
    this.hud.update(dt);
  }

  updateHome(dt) {
    const p = this.player;
    if (this.handleCommonInput()) return;
    p.update(dt);
    const it = this.findInteraction();
    this.hud.prompt(it ? it.text : null);
    if (it && input.pressed('interact')) it.act();
    if (input.firePressed && (input.locked || this.touch.active)) this.weapons.use();
    if (this.mode !== 'home') return;
    this.night.time += dt;
    for (const a of this.bots) if (a.id !== 'gus') a.update(dt);
    if (this.mode !== 'home') return;
    this.weapons.update(dt);
    this.hud.update(dt);
    if (this.vanCount() === ROAMERS.length && !p.carrying) this.winHome();
  }

  updateDay(dt) {
    const p = this.player;
    if (this.phone.active) {
      this.phone.update(dt);
      p.update(dt, { canMove: false, canLook: false });
      this.hud.prompt(null);
      this.timmy.update(dt);
      return;
    }
    if (this.handleCommonInput()) return;
    p.update(dt);
    const it = this.findInteraction();
    this.hud.prompt(it ? it.text : null);
    if (it && input.pressed('interact')) it.act();
    if (this.mode !== 'day') return;
    for (const a of this.bots) a.update(dt);
    this.timmy.update(dt);
    this.day.update(dt);
    this.hud.update(dt);
  }

  // ── Timmy ─────────────────────────────────────────────────────────────

  // Found him crying in the ball pit. A quick talk, then he follows you.
  meetTimmy() {
    this.cut.play(SCRIPTS.timmyMeet, () => {
      this.showScreen('night');
      this.player.vmGroup.visible = true;
      this.player.lightVisible = true;
      this.player.pos.copy(P(12.4, 31.6));
      this.player.yaw = Math.PI / 2;
      this.timmy.follow(P(12.9, 32.9));
      this.hud.toast('Timmy is following you. Keep him safe until 6 AM!', 4);
      if (!this.touch.active) requestPointerLock();
    });
  }

  // An animatronic got to Timmy before you could stop it.
  timmyCaught(a) {
    if (this.mode !== 'night') return;
    this.cams.close();
    if (this.repair.active) this.repair.close();
    if (this.player.carrying) this.dropCarried();
    exitPointerLock();
    sfx.scream();
    this.night.stop();
    this.timmy.hide();
    this.hud.caught(a.name, `Try Night ${this.night.n} again`,
      'Keep Timmy close behind you, and zap anything that gets near him.', 'OH NO!', `${a.name} caught Timmy!`);
    this.showScreen('caught');
  }

  // The phone call worked: gramma is on her way.
  grammaComes() {
    this.cutscene('gramma', () => {
      const p = this.profile;
      if (!p.timmyHome) {
        p.timmyHome = true;
        p.happiness = Math.min(100, p.happiness + TIMMY.rescue);
        saveProfile(p);
      }
      this.startDay();
      this.hud.toast(`Timmy is home safe! Kids' happiness +${TIMMY.rescue} 😄`, 4);
    });
  }

  render(dt) {
    this.cams.renderMonitors(this.renderer, this.scene, dt);
    this.graphics.render(this.scene, this.cams.active ? this.cams.cam : this.camera, { spot: this.player.flashlight, dt });
  }

  resize(w, h) {
    this.camera.aspect = w / h;
    // Keep at least ~80° across on narrow (portrait) screens, so cutscenes and the night
    // don't turn into a letterbox slot.
    const minVertical = 2 * Math.atan(Math.tan((80 * Math.PI / 180) / 2) / this.camera.aspect) * 180 / Math.PI;
    this.camera.fov = Math.min(100, Math.max(72, minVertical));
    this.camera.updateProjectionMatrix();
    this.cams.cam.aspect = w / h;
    this.cams.cam.updateProjectionMatrix();
  }
}
