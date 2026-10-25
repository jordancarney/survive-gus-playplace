// The game's state machine and the glue between every system.
//
//   title → story (first time) → day → card → night → morning → day → card → night …
//                                                    ↘ caught → card (same night again)
//
// Night 20 ends in a boss fight with Gus; winning it makes the animatronics your friends
// and opens Secret Night 21, where they help you fight the Junk Monster.
import * as THREE from 'three';
import {
  DEBUG, ANIMATRONIC_ORDER, PLAYER, weaponsFor, unlocksAt, LAST_STORY_NIGHT, nightDef,
} from './config.js';
import { input, requestPointerLock, exitPointerLock, onPointerLockChange } from './input.js';
import { audio, sfx, playMusic, stopMusic, setListener, stopAmbience, stopMusicBox } from './audio.js';
import { PlayPlace, P, ROOMS } from './map.js';
import { Decor } from './decor.js';
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
import { loadProfile, saveProfile, freshProfile } from './save.js';
import { setEyes } from './models.js';
import { signTex } from './textures.js';
import { VERSION } from './version.js';

const $ = (id) => document.getElementById(id);

const STORIES = {
  intro: [
    { art: '🧢', text: 'Jonathan is fifteen, and he really needs a job.' },
    { art: '🦆', text: 'Then he sees the sign taped to the door of Gus\'s PlayPlace — slides, arcade games, a ball pit, and five singing animatronics. NOW HIRING: NIGHT SECURITY.' },
    { art: '🔦', text: '"Easy job!" says the manager, handing him a flashlight and a taser. "Watch the cameras. Fix whatever the kids broke. And if the animatronics wander off the stage... zap \'em and drag \'em to Parts & Service. They\'re always back on stage by morning."' },
    { art: '⚡', text: '"Oh — and if the power ever goes out..." The manager stops smiling. "Don\'t let Gus find you."' },
    { art: '🌙', text: 'Twenty nights. Survive them all.' },
  ],
  gus: [
    { art: '💥', text: 'Gus crashes to the floor in a shower of sparks, and goes still.' },
    { art: '💙', text: 'When his eyes flicker back on, they\'re blue. The glitch is gone. Gerald, Chomper, Cranker and Flipper look at you... and wave.' },
    { art: '🤝', text: 'The animatronics aren\'t chasing you anymore. They\'re your friends now.' },
    { art: '🗑️', text: 'But down in Parts & Service, something in the junk pile is moving. Every broken part you ever threw in there... is putting itself back together.' },
    { art: '★', text: 'SECRET NIGHT 21 UNLOCKED.' },
  ],
  junk: [
    { art: '💥', text: 'The Junk Monster falls apart into a mountain of bolts, springs and one very squashed top hat.' },
    { art: '🎉', text: 'Gus, Gerald, Chomper, Cranker and Flipper cheer. Then they do what they do best: they put on a show.' },
    { art: '🏆', text: 'EMPLOYEE OF THE MONTH: JONATHAN. Gus\'s PlayPlace is safe — and it\'s the happiest place in town.' },
    { art: '🦆', text: 'Thanks for playing Survive Gus\'s PlayPlace!' },
  ],
};

const TIPS = {
  cranker: 'Cranker belly-slides in a straight line. Step to the side and he crashes into the wall!',
  chomper: 'Chomper breaks games and chews camera wires. A fuzzy camera means he\'s close.',
  gerald: 'Gerald takes two zaps. A baseball freezes him from far away.',
  flipper: 'Flipper can hear you running. Walk when you\'re near the ball pit.',
  gus: 'When the power goes out, run to the fuse box — Gus always knows where you are.',
  gusBoss: 'Keep moving and grab the glowing ammo boxes. Every Magnum hit freezes him.',
  junk: 'Dodge the junk it throws and fight next to your friends.',
};

export class Game {
  constructor(renderer, canvas) {
    this.renderer = renderer;
    this.canvas = canvas;
    this.input = input;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(72, 16 / 9, 0.1, 120);
    this.scene.add(this.camera);

    this.place = new PlayPlace();
    this.scene.add(this.place.build());
    this.decor = new Decor(this.place);
    this.scene.add(this.decor.build());
    this.lighting = new Lighting(this.scene, this.decor, this.place);
    this.effects = new Effects(this.scene);
    this.machines = new Machines(this, this.decor);
    this.player = new Player(this, this.camera);
    this.bots = ANIMATRONIC_ORDER.map((id) => new Animatronic(this, id));
    this.junk = new JunkMonster(this);
    this.night = new NightDirector(this);
    this.day = new Daytime(this);
    this.cams = new CameraSystem(this);
    this.repair = new Repair(this);
    this.weapons = new Weapons(this);
    this.hud = new Hud(this);
    this.touch = new Touch(this);
    this.touch.init();

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
  isPlaying() { return this.mode === 'night' || this.mode === 'day'; }

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
      this.hud.select(this.profile, (n) => { sfx.ui(); this.showCard(n); });
      this.showScreen('select');
    });
    click('btnSelectBack', () => this.toTitle());
    click('btnHowTo', () => this.showScreen('howto'));
    click('btnHowToBack', () => this.toTitle());
    click('btnStoryNext', () => this.nextStory());
    click('btnStorySkip', () => this.endStory());
    click('btnCardGo', () => this.startNight(this.cardNight));
    click('btnResume', () => this.togglePause());
    click('btnQuit', () => this.toTitle());
    click('btnRetry', () => this.showCard(this.night.n));
    click('btnCaughtMenu', () => this.toTitle());
    click('btnMorningGo', () => this.startDay());
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
    const playing = name === 'night' || name === 'day';
    this.hud.show(playing);
    this.hud.el.classList.toggle('day', name === 'day');
    $('dayPanel').classList.toggle('hidden', name !== 'day');
    if (!playing) { this.cams.close(); if (this.repair.active) this.repair.close(); }
  }

  toTitle() {
    exitPointerLock();
    this.night.stop();
    this.day.stop();
    this.junk.clear();
    this.weapons.clear();
    this.effects.clear();
    for (const a of this.bots) a.resetToStage();
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
      this.story('intro', () => {
        p.seenIntro = true;
        saveProfile(p);
        this.startDay(true);
      });
      return;
    }
    this.showCard(p.night);
  }

  // ── Story cards ───────────────────────────────────────────────────────

  story(key, done) {
    this.storyPages = STORIES[key];
    this.storyPage = 0;
    this.storyDone = done;
    this.showScreen('story');
    this.drawStory();
  }

  drawStory() {
    const s = this.storyPages[this.storyPage];
    $('storyArt').textContent = s.art;
    $('storyText').textContent = s.text;
    $('btnStoryNext').textContent = this.storyPage === this.storyPages.length - 1 ? 'Continue' : 'Next';
  }

  nextStory() {
    this.storyPage++;
    if (this.storyPage >= this.storyPages.length) this.endStory();
    else this.drawStory();
  }

  endStory() {
    const done = this.storyDone;
    this.storyDone = null;
    if (done) done();
  }

  // ── Daytime ───────────────────────────────────────────────────────────

  startDay(first = false) {
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
    $('dayText').innerHTML = first
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
    this.hideHands();
    this.hud.card(n);
    this.lighting.set('title');
    for (const a of this.bots) a.resetToStage();
    this.showScreen('card');
  }

  startNight(n) {
    const p = this.profile;
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

  // Something caught Jonathan.
  caught(who) {
    if (this.mode !== 'night') return;
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
      const tip = a.id === 'gus' && this.night.boss === 'gus' ? TIPS.gusBoss : TIPS[a.id];
      this.hud.caught(a.name, this.night.n, tip);
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
    for (const a of this.bots) if (a !== who && a.state !== 'friend') a.befriend(null);
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
      playMusic('friends');
      for (const a of this.bots) setEyes(a.rig, 'friend');
      this.story(who.id === 'gus' ? 'gus' : 'junk', () => this.toTitle());
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
    if (this.mode === 'night') this.togglePause();
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
    const used = this.bots.filter((b) => b.state === 'junked').map((b) => b.junkSpot);
    const spot = this.decor.junkSpots.find((s, i) => !used.includes(i));
    a.junkSpot = this.decor.junkSpots.indexOf(spot);
    a.pos.set(spot.x, 0, spot.z);
    a.yaw = Math.random() * Math.PI * 2;
    a.state = 'junked';
    setEyes(a.rig, 'off');
    sfx.clang();
    this.effects.burst(new THREE.Vector3(spot.x, 0.6, spot.z), 12, 3);
    this.profile.stats.junked++;
    this.hud.toast(`${a.name} is out for the night! 🗑️`);
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
      if (near(this.decor.timeClock.point, 1.6)) {
        return { text: `<b>E</b> Clock in for ${this.profile.night > 20 ? 'Secret Night 21' : 'Night ' + this.profile.night}`, act: () => this.clockIn() };
      }
      return null;
    }
    if (p.carrying) {
      if (room === 'J') return { text: `<b>E</b> Chuck ${p.carrying.name} into the junk pile`, act: () => this.chuck() };
      return { text: `<b>E</b> Let go of ${p.carrying.name}`, act: () => this.dropCarried(), quiet: true };
    }
    for (const a of this.bots) {
      if (a.state === 'down' && near(a.pos, 2.3)) return { text: `<b>E</b> Drag ${a.name}`, act: () => this.grab(a) };
    }
    const f = this.night.trippedFuse;
    if (f && near(f.point, 1.5)) return { text: '<b>E</b> Fix the fuse box', act: () => this.repair.start(f, this.night.repairLevel) };
    for (const m of this.machines.list) {
      if (m.broken && near(m.point, 1.6)) return { text: `<b>E</b> Fix the ${m.name}`, act: () => this.repair.start(m, this.night.repairLevel) };
    }
    if (room === 'O' && near(this.decor.desk.point, 1.8)) return { text: '<b>E</b> Use the cameras', act: () => this.cams.open() };
    return null;
  }

  // ── Update ────────────────────────────────────────────────────────────

  update(dt) {
    this.t += dt;
    this.touch.apply();
    if (this.mode === 'paused' && input.pressed('pause')) this.togglePause();
    switch (this.mode) {
      case 'night': this.updateNight(dt); break;
      case 'day': this.updateDay(dt); break;
      case 'jumpscare': this.updateJumpscare(dt); break;
      case 'title': case 'card': case 'howto': case 'select': case 'story':
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
    if (input.pressed('flashlight') && this.mode === 'night') p.toggleLight();
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
    this.junk.update(dt);
    this.weapons.update(dt);
    this.machines.update(dt);
    this.hud.update(dt);
  }

  updateDay(dt) {
    const p = this.player;
    if (this.handleCommonInput()) return;
    p.update(dt);
    const it = this.findInteraction();
    this.hud.prompt(it ? it.text : null);
    if (it && input.pressed('interact')) it.act();
    if (this.mode !== 'day') return;
    for (const a of this.bots) a.update(dt);
    this.day.update(dt);
    this.hud.update(dt);
  }

  render(dt) {
    this.cams.renderMonitors(this.renderer, this.scene, dt);
    this.renderer.render(this.scene, this.cams.active ? this.cams.cam : this.camera);
  }

  resize(w, h) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.cams.cam.aspect = w / h;
    this.cams.cam.updateProjectionMatrix();
  }
}
