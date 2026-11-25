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
  DEBUG, ANIMATRONIC_ORDER, WING_BOTS, ROAMERS, PLAYER, TIMMY, weaponsFor, unlocksAt, LAST_STORY_NIGHT, nightDef, REALISTIC,
  DIFFICULTIES, SECOND_CHANCE_GRACE, JIMMY, COOP_KEY, P1_KEYMAP, P2_KEYMAP, PAD_HELP, EMOTES,
} from './config.js';
import { Controls, PaneHud, readPads } from './coop.js';
import { input, requestPointerLock, exitPointerLock, onPointerLockChange } from './input.js';
import { audio, sfx, playMusic, stopMusic, setListener, startAmbience, stopAmbience, stopMusicBox } from './audio.js';
import { PlayPlace, P, ROOMS, WING_ROOMS } from './map.js';
import { Decor } from './decor.js';
import { House, HouseDecor } from './house.js';
import { Cutscene, makePerson } from './cutscene.js';
import { SCRIPTS, BEFORE_NIGHT } from './story.js';
import { Lighting } from './lighting.js';
import { Effects } from './effects.js';
import { Machines } from './machines.js';
import { Player } from './player.js';
import { Animatronic, JunkMonster, WingBot } from './animatronics.js';
import { NightDirector } from './night.js';
import { Daytime } from './day.js';
import { CameraSystem } from './cameras.js';
import { Repair } from './repair.js';
import { Weapons } from './weapons.js';
import { Hud } from './hud.js';
import { Touch } from './touch.js';
import { Timmy } from './timmy.js';
import { Phone } from './phone.js';
import { Shop } from './shop.js';
import {
  loadProfile, saveProfile, freshProfile, saveGraphics, takeReopenSettings, loadDifficulty, saveDifficulty,
  loadDebug, saveDebug, loadLook, saveLook, loadCoop, saveCoop,
} from './save.js';
import { setEyes, buildJonathan, buildManager, buildGramma, buildOldJohn, buildJimmy, JIMMY_LOOK, poseRig, addKnees } from './models.js';
import { signTex } from './textures.js';
import { EscapeMode, STORY } from './escape/mode.js';
import { PlexMode, PLEX_STORY } from './plex/mode.js';
import { SushiMode, SUSHI_STORY } from './sushi/mode.js';
import { CulacMode, CULAC_STORY } from './culac/mode.js';
import { ClosetsMode, CLOSETS_STORY } from './closets/mode.js';
import { Campaign } from './campaign.js';
import { VERSION } from './version.js';
import { LUNGE, STATIC, holdFor, placeScare, finishScare, showStatic, drawStatic, hideStatic } from './jumpscare.js';

const $ = (id) => document.getElementById(id);

const NIGHTMARE_EYES = new THREE.Color(0xff1a1a);

// Where the animatronics wander at the PlayPlace, before the new wing opens.
const ROAM = ['K', 'B', 'D', 'H', 'T', 'E', 'P', 'A', 'R'];
// The new wing opens on Day 11 (after the house) and stays open.
const WING_NIGHT = 11;

const TIPS = {
  cranker: 'Listen for Cranker\'s squeaky feet. He\'s slower than you walk, but he keeps coming — zap him!',
  chomper: 'Chomper breaks games and chews camera wires. A fuzzy camera means he\'s close.',
  gerald: 'Gerald takes two zaps. A baseball freezes him from far away.',
  flipper: 'Flipper can hear you running. Walk when you\'re near the ball pit.',
  gus: 'When the power goes out, run to the fuse box — Gus always knows where you are.',
  moony: 'Moony never leaves Laser Tag — get out of there! Only the Magnum stops him, and crouching won\'t hide you.',
  sunny: 'Sunny is made of fog. Sweep your flashlight around the Play Maze to spot her — she drifts right through walls.',
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
    this.difficulty = loadDifficulty();
    this.debugMode = loadDebug();
    this.look = loadLook();
    this.grace = 0;           // seconds left where nothing can catch you, after a second chance
    this.dread = 12;          // Nightmare: seconds to the next scare that isn't really there
    this.beat = 0;            // Nightmare: seconds to your next heartbeat
    this.scareLen = 1.7;      // how long the jumpscare holds
    this.secret = null;       // 'quiet' until Jonathan hears one move, 'heard' until he reads the note
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
        spawn: this.decor.stageSpots, roam: ROAM, hideRoom: 'B',
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
      oldJohn: makePerson(this.scene, buildOldJohn),
    };
    this.effects = new Effects(this.scene);
    this.machines = new Machines(this, this.decor);
    this.player = new Player(this, this.camera);
    // Two players (coop.js): `players` is everyone playing, and `player` is whoever's turn it
    // is right now — player 1 except while the game runs player 2's part of a step.
    this.p1 = this.player;
    this.players = [this.p1];
    this.p2 = null;
    this.coop = loadCoop();
    this.split = false;
    this.bodyCache = {};     // what people look like from outside (the other player, or you emoting)
    this.wheels = [];
    this.viewW = innerWidth; this.viewH = innerHeight;
    this.bots = ANIMATRONIC_ORDER.map((id) => new Animatronic(this, id));
    // Moony and Sunny live in the new wing, and only exist while it's open.
    this.wingBots = WING_BOTS.map((id) => new WingBot(this, id));
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
    this.p1.repair = new Repair(this);
    this.weapons = new Weapons(this);
    this.hud = new Hud(this);
    this.touch = new Touch(this);
    this.touch.init();
    this.cut = new Cutscene(this);
    this.phone = new Phone(this);
    // When Jonathan Was Five: the story mode, with its own levels (js/escape/).
    Object.assign(SCRIPTS, STORY);
    this.escape = new EscapeMode(this);
    // Lost in the Pizzaplex: the third story, in the same engine (js/plex/).
    Object.assign(SCRIPTS, PLEX_STORY);
    this.plex = new PlexMode(this);
    // Sushi's Pizzaplex: the fourth story, the same engine again (js/sushi/).
    Object.assign(SCRIPTS, SUSHI_STORY);
    this.sushi = new SushiMode(this);
    // In the Closets: the fifth story, after the PlayPlace, the same engine (js/closets/).
    Object.assign(SCRIPTS, CLOSETS_STORY);
    this.closets = new ClosetsMode(this);
    // 10 Nights at Culac's Daycare: the sixth story, Jimmy's, the same engine (js/culac/).
    Object.assign(SCRIPTS, CULAC_STORY);
    this.culac = new CulacMode(this);
    this.story = this.escape;     // whichever story mode is open
    this.setArea('playplace');
    graphics.prepare(this.scene);
    this.lighting.apply();
    this.setWing(false);

    this.profile = loadProfile();
    this.shop = new Shop(this);     // Gus tokens, and what they buy (its own save)
    this.campaign = new Campaign(this);   // Story mode: every story in one go (its own save)
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
    if (this.coop.on) this.setCoop(true);
    if (DEBUG) window.__game = this;
  }

  bot(id) { return this.bots.find((a) => a.id === id) || this.wingBots.find((a) => a.id === id); }
  // (each player has their own repair puzzle on screen)
  get repair() { return this.player.repair; }
  get ctl() { return this.player.ctl; }
  get diff() { return DIFFICULTIES[this.difficulty]; }
  get nightmare() { return !!this.diff.nightmare; }

  // ── Nightmare ─────────────────────────────────────────────────────────
  //
  // The scariest difficulty makes everything scarier, the title screen included: a red,
  // shaking, static-covered title (CSS, body.nightmare) over a broken, whispering music box;
  // darker, redder, flickering lights (Lighting.scare); red eyes on every
  // animatronic; your heart racing when one's close; flashes of something that isn't there;
  // and longer jumpscares with a second scream.

  // Also gives Horror its lighter dose: darker nights with the odd light stutter, reddish
  // eyes, a whisper now and then, and a soft heartbeat when one is right on top of you.
  applyNightmare() {
    const nm = this.nightmare, scare = this.diff.scare || 0;
    document.body.classList.toggle('nightmare', nm);
    this.lighting.scare = scare;
    this.lighting.apply();
    for (const a of [...this.bots, ...this.wingBots]) {
      const rig = a.rig;
      if (!rig.baseEye) rig.baseEye = rig.eyeColor.clone();
      rig.eyeColor.copy(rig.baseEye).lerp(NIGHTMARE_EYES, [0, 0.55, 1][scare]);
      if (a.state === 'stage') setEyes(rig, 'on');
    }
  }

  // Lights out, a red flash and a music box, and one of them glares at you — then nothing.
  phantom() {
    this.lighting.glitch(0.3 + Math.random() * 0.4);
    const f = $('jumpFlash');
    f.classList.remove('hidden');
    setTimeout(() => { if (this.mode !== 'jumpscare') f.classList.add('hidden'); }, 140);
    sfx.musicBoxSting();
    const a = this.bots[Math.floor(Math.random() * this.bots.length)];
    if (a.state === 'stage' || a.dangerous) {
      setEyes(a.rig, 'scare');
      setTimeout(() => { if (a.state !== 'down' && a.state !== 'junked' && a.state !== 'friend') setEyes(a.rig, 'on'); }, 1400);
    }
  }

  scareTick(dt, phantomGap) {
    const scare = this.diff.scare || 0;
    if (!scare) return;
    if (scare === 2) {
      this.dread -= dt;
      if (this.dread <= 0) { this.dread = phantomGap * (0.7 + Math.random() * 0.6); this.phantom(); }
    }
    if (!this.hunting) return;
    if (scare === 1) {
      // Horror: no phantoms, just someone whispering every couple of minutes
      this.dread -= dt;
      if (this.dread <= 0) { this.dread = 100 + Math.random() * 80; sfx.whisper(); }
    }
    let near = Infinity;
    for (const a of this.allBots()) if (a.dangerous && a.root.visible) near = Math.min(near, a.distToPlayer());
    const range = scare === 2 ? 14 : 7;
    this.beat -= dt;
    if (near < range && this.beat <= 0) {
      const k = 1 - near / range;
      sfx.heartbeat(scare === 2 ? k : k * 0.5);
      this.beat = 0.38 + (1 - k) * 0.9;
    }
  }

  // Debug mode (Settings → Debug) opens every night for testing. Nothing done in it is saved,
  // and turning it off brings the real progress back.
  save() { if (!this.debugMode) saveProfile(this.profile); }

  setDebug(on) {
    this.debugMode = on;
    saveDebug(on);
    if (!on) { this.profile = loadProfile(); this.updatePhoto(); }
    this.shop.setDebug(on);
    this.hud.title(this.profile);
  }
  allBots() {
    const all = [...this.bots, ...this.wingBots];
    if (this.junk.root.visible) all.push(this.junk);
    return all;
  }
  roomName(id) { return ROOMS[id] ? ROOMS[id].name : ''; }
  isPlaying() { return this.mode === 'night' || this.mode === 'day' || this.mode === 'home' || this.mode === 'escape'; }
  // True while the animatronics (or, in When Jonathan Was Five, the Night Bots) are out to get you.
  get hunting() { return this.mode === 'night' || this.mode === 'home' || this.mode === 'escape'; }

  setArea(name) {
    this.area = this.areas[name];
    this.place = this.area.building;
    for (const a of Object.values(this.areas)) for (const g of a.groups) g.visible = a === this.area;
  }

  hidePeople() { for (const p of Object.values(this.people)) p.root.visible = false; }

  // ── Two players ───────────────────────────────────────────────────────
  //
  // Split screen (the designer's idea): Jonathan on WASD and the trackpad, his little
  // brother Jimmy on the arrow keys or a controller. Every step the game runs each player's
  // own part (their keys, walking, what they press E on, their weapon) with `this.player`
  // pointing at them, and each animatronic's turn with `this.player` pointing at whoever it's
  // after — so all the code that asks about "the player" asks about the right one.

  get twoUp() { return this.coop.on && this.players.length > 1; }
  // Everyone still in (when one's caught, they're out until morning).
  alive() { return this.players.filter((p) => !p.out); }
  get lead() { return this.players.find((p) => !p.out) || this.p1; }

  // Jimmy, built the first time two play: his camera and flashlight, his half of the HUD,
  // his own repair puzzle, and the body each of you sees of the other.
  buildP2() {
    if (this.p2) return;
    const cam = new THREE.PerspectiveCamera(72, 16 / 9, 0.1, 120);
    const p2 = new Player(this, cam, { ctl: new Controls(1), index: 1 });
    p2.fixedSizes = JIMMY;
    p2.look = JIMMY_LOOK;
    p2.name = 'Jimmy';
    p2.repair = new Repair(this, '2');
    p2.setWeapons(['taser']);
    this.p2 = p2;
    this.p2cam = cam;
    this.p1ctl = new Controls(0);
    this.p1.name = 'Jonathan';
    this.panes = [new PaneHud($('panes'), 0, 'JONATHAN', '🔦'), new PaneHud($('panes'), 1, 'JIMMY', '🚀')];
    p2.body = this.makeBody('jimmy', buildJimmy);
    if (!this.p1.body) this.p1.body = this.makeBody('jonathan', buildJonathan);
  }

  // What someone looks like from the outside, built once and kept.
  makeBody(key, build) {
    if (!this.bodyCache[key]) {
      const b = makePerson(this.scene, () => addKnees(build()));
      this.bodyCache[key] = b;
    }
    return this.bodyCache[key];
  }

  // Who player 1 is, as player 2 sees them: Jonathan at fifteen, at five, or (in the
  // Pizzaplex) whoever the chapter is about.
  setP1Body(key, build) {
    // (back at the PlayPlace, player 1 is Jonathan again)
    if (key === 'jonathan') { this.p1.name = 'Jonathan'; this.panes?.[0].setName('JONATHAN', '🔦'); }
    if (this.p1.body && this.p1.body !== this.bodyCache[key]) this.p1.body.root.visible = false;
    this.p1.body = this.makeBody(key, build);
  }

  // "It's hard to get out of 2 player" (the designer): one tap, on the title or in the pause
  // menu, and it's just Jonathan again, carrying on right where he is. Whatever Jimmy was in
  // the middle of (the cameras, a repair, dragging one, an emote) is put down first.
  goSolo() {
    const p2 = this.p2;
    if (p2 && this.twoUp) {
      if (this.cams.active && this.cams.user === p2) this.cams.close();
      if (p2.repair && p2.repair.active) this.withPlayer(p2, () => p2.repair.cancel());
      if (p2.carrying) this.withPlayer(p2, () => this.dropCarried());
      if (p2.wheel) this.closeWheel(p2);
      if (p2.emote) this.stopEmote(p2);
      this.nightVision(p2, false);
    }
    this.setCoop(false);
    sfx.uiBack();
  }

  setCoop(on) {
    this.coop.on = on;
    saveCoop(this.coop);
    if (on) {
      this.buildP2();
      this.p1.ctl = this.p1ctl;
      this.players = [this.p1, this.p2];
      if (!this.p2cam.parent) { this.scene.add(this.p2cam); this.graphics.track(this.p2cam); }
    } else {
      this.p1.ctl = input;
      this.p1.out = false;
      this.players = [this.p1];
      if (this.p2cam && this.p2cam.parent) this.scene.remove(this.p2cam);
      for (const b of Object.values(this.bodyCache || {})) b.root.visible = false;
    }
    input.clear();
    document.body.classList.toggle('coop', on);
    this.hud.title(this.profile);
    this.layout();
  }

  // A fresh start for Jimmy, right beside Jonathan: the same gear, the same light.
  spawnPartner(night = 1) {
    if (!this.twoUp) return;
    const p1 = this.p1, p2 = this.p2;
    p1.out = p2.out = false;
    const rx = Math.cos(p1.yaw), rz = -Math.sin(p1.yaw);
    const place = this.place;
    let at = p1.pos.clone();
    for (const d of [0.9, -0.9, 1.3, -1.3, 0.6, -0.6]) {
      const x = p1.pos.x + rx * d, z = p1.pos.z + rz * d;
      if (place.isWalkable(x, z)) { at = new THREE.Vector3(x, p1.pos.y, z); break; }
    }
    p2.reset(at, p1.yaw, night);
    p2.setWeapons(p1.weapons);
    p2.lightOn = p1.lightOn;
    p2.lightVisible = p1.lightVisible;
    p2.vmGroup.visible = p1.vmGroup.visible;
    p2.bigLight = p1.bigLight;
    p2.flashlight.angle = p1.flashlight.angle;
    p2.flashlight.distance = p1.flashlight.distance;
    p2.updateCamera();
    p2.ctl.clear();
    for (const pane of this.panes) pane.prompt(null);
  }

  // Run `fn` for each player still in, with `this.player` pointing at them. Stops early (and
  // returns true) if `fn` returns true.
  eachPlayer(fn) {
    let stop = false;
    for (const p of this.alive()) {
      this.player = p;
      if (fn(p)) { stop = true; break; }
    }
    this.player = this.lead;
    return stop;
  }

  withPlayer(p, fn) {
    const was = this.player;
    this.player = p;
    try { return fn(); } finally { this.player = was; }
  }

  // Who this one goes after: whoever it can sense (the closer, if it senses both), or else
  // whoever it was already after, or else whoever's closer.
  preyFor(a) {
    const alive = this.alive();
    if (alive.length < 2) return alive[0] || this.p1;
    const was = this.player;
    const sense = a.sensesPlayer || a.senses;
    let best = alive[0], score = Infinity;
    for (const p of alive) {
      this.player = p;
      let d = Math.hypot(p.pos.x - a.pos.x, p.pos.z - a.pos.z);
      let sensed = false;
      if (sense && !a.preyIsTimmy) { try { sensed = !!sense.call(a); } catch { sensed = false; } }
      if (!sensed) d += 1000;
      if (a.prey === p) d -= 4;
      if (d < score) { score = d; best = p; }
    }
    this.player = was;
    a.prey = best;
    return best;
  }

  asPrey(a, fn) { return this.withPlayer(this.preyFor(a), fn); }

  closeRepairs() { for (const p of this.players) if (p.repair && p.repair.active) p.repair.close(); }

  // The one who just got caught is out until morning; the other one keeps going. True if
  // somebody's still in.
  knockOut(p, msg = null) {
    p.out = true;
    p.crouching = false;
    p.lightOn = false;
    p.lightVisible = false;
    p.flashlight.intensity = 0;
    p.vmGroup.visible = false;
    if (p.body) p.body.root.visible = false;
    if (p.repair && p.repair.active) p.repair.close();
    if (this.cams.active && this.cams.user === p) this.cams.close();
    const left = this.alive();
    if (!left.length) return false;
    const who = left[0];
    this.hud.toast(msg || `${p.name} is out until morning! ${who.name}, you're on your own now — make it to 6 AM!`, 5);
    return true;
  }

  // Back to the night after one of you was caught: whatever did it goes back to what it was
  // doing, a little stunned, and nothing can catch the other one for a moment.
  afterKnockOut(a, from) {
    this.mode = from || 'night';
    this.scarer = null;
    this.scareP = null;
    for (const pane of this.panes) pane.el.classList.remove('scared');
    setEyes(a.rig, 'on');
    const prev = this.prevScareState;
    a.state = !prev || prev === 'jumpscare' || prev === 'chase' || prev === 'notice' ? 'search' : prev;
    if (a.goTo && a.state === 'search') a.goTo(a.pos.clone());
    if (a.id === 'junk') a.staggerT = 3;
    else if (a.id === 'gus' || a.def?.unstoppable) a.freezeTimer = 3;
    else if (a.stagger) a.stagger(3);
    a.prey = null;
    this.grace = 2;
    this.player = this.lead;
    this.layout();
    if (!this.touch.active && this.lead.index === 0) requestPointerLock();
  }

  // ── Emotes ────────────────────────────────────────────────────────────
  //
  // The designer's idea: hold T (player 2: K; a controller: up on the d-pad) and a wheel of
  // emotes pops up — point at one (the mouse, a stick, or the walking keys) and let go. The
  // camera swings round in front of you so you can watch yourself do it (like Fortnite), and
  // walking stops it. Two playing, the other one sees it too. The animatronics don't wait
  // for you to finish.

  // True if this player's step was the wheel or an emote (and nothing else should happen).
  emoteTurn(dt, p) {
    const ctl = p.ctl;
    if (p.wheel) {
      const w = p.wheel;
      const { dx, dy } = ctl.drainLook();
      w.x += dx; w.y += dy;
      // the walking keys and the left stick point too
      const ax = ctl.moveAxis ? ctl.moveAxis() : null;
      let kx = (ctl.down('right') ? 1 : 0) - (ctl.down('left') ? 1 : 0), ky = (ctl.down('back') ? 1 : 0) - (ctl.down('forward') ? 1 : 0);
      if (ax) { kx = ax.x; ky = ax.z; }
      if (kx || ky) { w.x = kx * 200; w.y = ky * 200; }
      const len = Math.hypot(w.x, w.y);
      if (len > 220) { w.x *= 220 / len; w.y *= 220 / len; }
      // straight up is the first one, then round clockwise
      if (len > 40) {
        const a = (Math.atan2(w.x, -w.y) + Math.PI * 2) % (Math.PI * 2);
        w.sel = Math.round(a / (Math.PI * 2 / EMOTES.length)) % EMOTES.length;
      }
      this.drawWheel(p);
      p.update(dt, { canMove: false, canLook: false });
      this.hud.prompt(null);
      if (!ctl.down('emote')) {
        this.closeWheel(p);
        if (w.sel !== null) this.startEmote(p, EMOTES[w.sel]);
      }
      return true;
    }
    if (p.emote) {
      const e = p.emote;
      e.t += dt;
      const ax = ctl.moveAxis ? ctl.moveAxis() : null;
      const walking = ['forward', 'back', 'left', 'right'].some((a) => ctl.down(a)) || (ax && Math.hypot(ax.x, ax.z) > 0.3);
      if (e.t > e.len || (walking && e.t > 0.35) || ctl.pressed('emote')) { this.stopEmote(p); return false; }
      // you can turn the camera round yourself while you watch
      const { dx } = ctl.drainLook();
      e.orbit -= dx * 0.004;
      p.update(dt, { canMove: false, canLook: false });
      this.emoteCamera(p);
      this.hud.prompt(null);
      return true;
    }
    if (ctl.pressed('emote') && !p.carrying) { this.openWheel(p); return true; }
    return false;
  }

  openWheel(p) {
    p.wheel = { x: 0, y: 0, sel: null };
    sfx.ui();
    this.drawWheel(p);
  }

  closeWheel(p) {
    p.wheel = null;
    const el = this.wheels[p.index];
    if (el) el.classList.add('hidden');
  }

  drawWheel(p) {
    let el = this.wheels[p.index];
    if (!el) {
      el = document.createElement('div');
      el.className = 'emote-wheel hidden';
      // (a bigger wheel once the Shop's emotes are on it)
      const n = EMOTES.length, R = n > 8 ? 150 : 112;
      if (n > 8) el.classList.add('big');
      el.innerHTML = `<div class="ew-ring">${EMOTES.map((e, i) => {
        const a = (i / n) * Math.PI * 2;
        return `<div class="ew-slot" style="left:calc(50% + ${Math.sin(a) * R}px);top:calc(50% - ${Math.cos(a) * R}px)"><span>${e.icon}</span><small>${e.name}</small></div>`;
      }).join('')}<div class="ew-mid">EMOTES</div></div>`;
      $('hud').appendChild(el);
      this.wheels[p.index] = el;
    }
    el.classList.remove('hidden');
    el.classList.toggle('pane-0', this.split && p.index === 0);
    el.classList.toggle('pane-1', this.split && p.index === 1);
    const sel = p.wheel ? p.wheel.sel : null;
    el.querySelectorAll('.ew-slot').forEach((s, i) => s.classList.toggle('on', i === sel));
    const mid = el.querySelector('.ew-mid');
    const t = sel === null ? 'EMOTES' : EMOTES[sel].name.toUpperCase();
    if (mid.textContent !== t) mid.textContent = t;
  }

  // Point & scream (the designer's call): the mouth pops open so wide it covers the whole
  // face, eyes and all, and wobbles while you scream. `t`: seconds into it, or null to shut.
  screamMouth(rig, t) {
    const m = rig.mouth;
    if (!m) return;
    if (!rig.mouthHome) rig.mouthHome = { pos: m.position.clone(), scale: m.scale.clone() };
    const home = rig.mouthHome;
    const hr = home.pos.z / 0.9;            // the head's radius (the mouth sits 0.9 of it out)
    if (t === null) {
      if (rig.screaming) {
        m.position.copy(home.pos); m.scale.copy(home.scale); rig.screaming = false;
        for (const bit of rig.screamBits) bit.visible = false;
      }
      return;
    }
    // teeth along the top and a tongue at the bottom, so it reads as a mouth
    if (!rig.screamBits) {
      const teeth = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.4 }));
      teeth.scale.set(hr * 0.86, hr * 0.13, hr * 0.06);
      teeth.position.set(0, hr * 1.4, hr * 1.1);
      const tongue = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), new THREE.MeshStandardMaterial({ color: 0xd94a6a, roughness: 0.5 }));
      tongue.scale.set(hr * 0.42, hr * 0.17, hr * 0.16);
      tongue.position.set(0, hr * 0.38, hr * 1.06);
      rig.screamBits = [teeth, tongue];
      for (const bit of rig.screamBits) { bit.visible = false; rig.head.add(bit); }
    }
    rig.screaming = true;
    for (const bit of rig.screamBits) bit.visible = t > 0.08;
    const k = Math.min(1, t / 0.12);        // a split second to open all the way
    const w = 1 + Math.sin(t * 38) * 0.06;  // and it shakes while you scream
    m.position.set(0, home.pos.y + (hr * 0.86 - home.pos.y) * k, home.pos.z + (hr * 0.84 - home.pos.z) * k);
    m.scale.set(
      home.scale.x + (hr * 0.72 * w - home.scale.x) * k,
      home.scale.y + (hr * 0.82 * w - home.scale.y) * k,
      home.scale.z + (hr * 0.34 - home.scale.z) * k,
    );
  }

  startEmote(p, def) {
    if (!p.body) p.body = p === this.p1 ? this.makeBody('jonathan', buildJonathan) : this.makeBody('jimmy', buildJimmy);
    p.crouching = false;
    p.vel.set(0, 0, 0);
    // (the worm looks best from the side)
    p.emote = { id: def.id, len: def.len, t: 0, yaw: p.yaw, orbit: def.id === 'worm' || def.id === 'sleep' ? 1.35 : 0, vm: p.vmGroup.visible };
    sfx.emote(def.id);
  }

  stopEmote(p) {
    if (!p.emote) return;
    p.vmGroup.visible = p.emote.vm;
    p.emote = null;
    if (p.body) p.body.root.rotation.set(0, p.yaw + Math.PI, 0);
    p.updateCamera();
  }

  // In front of you and a little above, looking back at you — pulled in short of any wall.
  emoteCamera(p) {
    const e = p.emote;
    const h = p.S.eyeHeight;
    const a = e.yaw + e.orbit;
    const fx = -Math.sin(a), fz = -Math.cos(a);
    const centre = new THREE.Vector3(p.pos.x, p.pos.y + (e.id === 'worm' || e.id === 'sleep' ? 0.35 : h * 0.62), p.pos.z);
    const want = 1.6 + h * 0.9;
    let d = 0.6;
    while (d < want && this.place.isWalkable(centre.x + fx * (d + 0.35), centre.z + fz * (d + 0.35))) d += 0.1;
    const cam = p.camera;
    cam.position.set(centre.x + fx * d, centre.y + 0.35 + d * 0.12, centre.z + fz * d);
    cam.lookAt(centre);
  }

  // ── The split screen ──────────────────────────────────────────────────

  // Which parts of the game are played in two halves: walking about, and the scare.
  splitView() {
    if (!this.twoUp || this.p1.out || this.p2.out) return false;
    const m = this.mode === 'paused' ? this.pausedFrom : this.mode;
    if (m === 'escape' || m === 'escScare') return !this.story.ctrl || this.story.ctrl.coopView === 'split';
    return m === 'night' || m === 'home' || m === 'day' || m === 'jumpscare' || m === 'guardNote';
  }

  layout() {
    const two = this.splitView();
    const dir = this.coop.split;
    if (two === this.split && dir === this.splitDir) return;
    this.split = two;
    this.splitDir = dir;
    document.body.classList.toggle('split', two);
    document.body.classList.toggle('split-v', two && dir === 'v');
    document.body.classList.toggle('split-h', two && dir === 'h');
    if (!two && this.panes) for (const pane of this.panes) pane.prompt(null);
    this.resize(this.viewW, this.viewH);
  }

  // Each half, in CSS pixels from the bottom left (WebGL's way up): player 1 on the left or
  // the top.
  paneRects() {
    const W = this.viewW, H = this.viewH;
    if (this.splitDir === 'h') {
      const h = Math.floor(H / 2);
      return [{ x: 0, y: H - h, w: W, h }, { x: 0, y: 0, w: W, h }];
    }
    const w = Math.floor(W / 2);
    return [{ x: 0, y: 0, w, h: H }, { x: W - w, y: 0, w, h: H }];
  }

  // The night-vision tint, in the half of whoever's on the cameras.
  nightVision(p, on) {
    const el = $('nv' + p.index);
    if (el) el.classList.toggle('on', on);
  }

  // Draw the world as `viewer` sees it: their hands, not their body; everyone else's
  // body, not their hands.
  renderView(viewer, cam, opts) {
    const view = this.playingView();
    const others = this.twoUp && view;
    const keep = this.players.map((p) => p.vmGroup.visible);
    for (const p of this.players) {
      // (emoting, you see yourself and not your hands — the camera's swung round in front)
      if (p !== viewer || p.emote) p.vmGroup.visible = false;
      // (not while they're hiding, or inside their box)
      if (p.body) {
        p.body.root.visible = view && !p.out && !p.bodyHidden && !p.hiding && !p.inBox &&
          (p.emote ? true : others && p !== viewer);
      }
    }
    this.graphics.render(this.scene, cam, opts);
    this.players.forEach((p, i) => { p.vmGroup.visible = keep[i]; });
  }

  playingView() {
    const m = this.mode === 'paused' ? this.pausedFrom : this.mode;
    return ['night', 'home', 'day', 'escape', 'jumpscare', 'escScare', 'guardNote'].includes(m);
  }

  // Jimmy and Jonathan as each other sees them: walking, standing, crouching.
  updateBodies(dt) {
    for (const p of this.players) {
      // (a fresh start — a new night, a level — puts any wheel away)
      if (!p.wheel && this.wheels[p.index] && !this.wheels[p.index].classList.contains('hidden')) this.closeWheel(p);
      if (p.emote && !this.isPlaying()) this.stopEmote(p);
      const b = p.body;
      if (!b) continue;
      const e = p.emote;
      // (emoting: the worm lies flat, the head spin stands on its head and spins)
      const yaw = e ? e.yaw : p.yaw;
      if (e && e.id === 'worm') {
        b.root.position.set(p.pos.x, p.pos.y + 0.14 + Math.abs(Math.sin(e.t * 5)) * 0.08, p.pos.z);
        b.root.rotation.set(Math.PI / 2, yaw + Math.PI, 0);
      } else if (e && e.id === 'headspin') {
        b.root.position.set(p.pos.x, p.pos.y + (b.rig.height || 1.2) * 0.98, p.pos.z);
        b.root.rotation.set(Math.PI, yaw + Math.PI + e.t * 9, 0);
      } else {
        b.root.position.set(p.pos.x, p.pos.y, p.pos.z);
        b.root.rotation.set(0, yaw + Math.PI, 0);
      }
      p.walkT = (p.walkT || 0) + dt * (4 + p.moving * 5);
      this.screamMouth(b.rig, e && e.id === 'point' ? e.t : null);
      this.shop.dress(p, b, e);     // a hat from the Shop, and the bought emotes that tip you over
      if (e) poseRig(b.rig, e.id, e.t, 1, dt);
      else if (p.crouching) poseRig(b.rig, 'crouch', p.walkT, p.moving * 1.6, dt);
      else if (p.moving > 0.15) poseRig(b.rig, 'walk', p.walkT, Math.min(1.3, p.moving), dt);
      else poseRig(b.rig, 'idle', this.t + p.index * 3, 0.3, dt);
    }
  }

  // Each player's half of the HUD: their bars, their weapon, what they can do, what's after
  // them.
  updatePanes() {
    if (!this.split || !this.panes) return;
    const source = this.mode === 'escape' ? this.story : this;
    for (const p of this.players) {
      const info = this.withPlayer(p, () => source.paneInfo(p));
      this.panes[p.index].update(p, info);
    }
  }

  paneInfo(p) {
    const night = this.mode !== 'day';
    let danger = 0, chaser = null;
    if (this.hunting) {
      for (const a of this.allBots()) {
        if (!a.dangerous || !a.root.visible) continue;
        const d = a.distToPlayer();
        if (d < 9) danger = Math.max(danger, 1 - d / 9);
        if (a.prey === p && ['chase', 'hunt', 'notice'].includes(a.state)) chaser = a;
      }
    }
    let status = '';
    if (p.carrying) status = `Dragging ${p.carrying.name} — to Parts & Service! (wakes in ${Math.ceil(p.carrying.timer)}s)`;
    else if (p.crouching) status = 'Crouching — only Gus can see you';
    else if (this.cams.active && this.cams.user === p) status = '';
    return { weapons: night, box: null, status, alert: chaser ? `${chaser.name.toUpperCase()} IS AFTER YOU!` : '', danger };
  }

  // Open the new wing (Day 11 on) or board it up: walls and paths, its rooms and games, its
  // cameras, its lights, and where everyone wanders.
  setWing(open) {
    if (this.wingOpen === open) return;
    this.wingOpen = open;
    this.playplace.setWingOpen(open);
    this.decor.setWingOpen(open);
    this.machines.setWing(open);
    this.cams.setWing(open);
    this.areas.playplace.roam = open ? [...ROAM, ...WING_ROOMS] : ROAM;
    for (const a of this.wingBots) a.resetToStage();
    this.lighting.apply();
  }

  // Everyone the animatronics' side of things can be fighting alongside you.
  friends() { return [...this.bots, ...this.oldBots].filter((a) => a.state === 'friend' && a.root.visible); }

  resetBots() {
    this.timmy.hide();
    for (const a of this.bots) a.resetToStage();
    for (const a of this.wingBots) a.resetToStage();
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
      // (When Jonathan Was Five is a story of its own: a new game keeps how far you got in it)
      const five = this.profile.escape;   // (its secret ending too)
      const plex = this.profile.plex;     // (and so is Lost in the Pizzaplex)
      const sushi = this.profile.sushi;   // (and Sushi's Pizzaplex)
      const closets = this.profile.closets;   // (and In the Closets)
      const culac = this.profile.culac;   // (and Culac's Daycare)
      this.profile = freshProfile();
      this.profile.escape = five;
      this.profile.plex = plex;
      this.profile.sushi = sushi;
      this.profile.closets = closets;
      this.profile.culac = culac;
      this.save();
      this.updatePhoto();
      this.continueGame();
    });
    click('btnSelect', () => {
      this.hud.select(this.profile, (n) => { sfx.ui(); if (n === 'home') this.startHome(); else this.showCard(n); }, this.debugMode);
      this.showScreen('select');
    });
    click('btnSelectBack', () => this.toTitle('survival'));
    click('btnHowTo', () => this.showScreen('howto'));
    // How to Play lives in Settings, so Back goes back there.
    click('btnHowToBack', () => this.openSettings());
    click('btnSettings', () => this.openSettings());
    click('btnGallery', () => { this.hud.gallery(); $('galleryView').classList.add('hidden'); this.showScreen('gallery'); });
    click('btnGalleryBack', () => this.toTitle());
    click('btnShop', () => { this.shop.open(); this.showScreen('shop'); });
    click('btnShopBack', () => this.toTitle());
    click('btnSettingsBack', () => this.toTitle());
    click('btnCardGo', () => this.beginNight(this.cardNight));
    click('btnResume', () => this.togglePause());
    click('btnQuit', () => this.toTitle());
    click('btnRetry', () => this.retry());
    click('btnCaughtMenu', () => this.toTitle());
    click('btnMorningGo', () => this.afterMorning());
    click('btnClockIn', () => this.clockIn());
    click('btnGuardNoteGo', () => this.closeGuardNote());
    // Two players: the setup screen, and the three games to play together.
    click('btnCoop', () => this.openCoop());
    click('btnSolo', () => this.goSolo());
    click('btnPauseSolo', () => { this.goSolo(); this.togglePause(); });
    click('btnCoopBack', () => this.toTitle());
    click('btnCoopNights', () => { this.setCoop(true); this.continueGame(); });
    click('btnCoopFive', () => { this.setCoop(true); this.escape.showMenu(); });
    click('btnCoopPlex', () => { this.setCoop(true); this.plex.showMenu(); });
    click('btnCoopSushi', () => { this.setCoop(true); this.sushi.showMenu(); });
    click('btnCoopStory', () => { this.setCoop(true); this.toTitle('story'); });
    click('btnSushi', () => this.sushi.showMenu());
    click('btnClosets', () => this.closets.showMenu());
    click('btnCoopClosets', () => { this.setCoop(true); this.closets.showMenu(); });
    click('btnCulac', () => this.culac.showMenu());
    click('btnCoopCulac', () => { this.setCoop(true); this.culac.showMenu(); });
    // The title's pages: Play, then Story or Survival (titlePage).
    click('btnMainPlay', () => this.titlePage('play'));
    click('btnStory', () => this.titlePage('story'));
    click('btnSurvival', () => this.titlePage('survival'));
    for (const b of document.querySelectorAll('#title [data-back]')) {
      b.addEventListener('click', () => { sfx.uiBack(); this.titlePage(b.dataset.back); });
    }
    click('btnStoryContinue', () => this.campaign.enter(false));
    click('btnStoryNew', () => {
      const w = this.campaign.where();
      if (w && !w.done && !confirm('Start the story over from the very beginning? (Survival keeps all its progress.)')) return;
      this.campaign.enter(true);
    });

    // Clicking the 3D view during play takes the mouse.
    // (not in the story chapters where you stay put and click buttons: Max's bedroom,
    // Jackson's office)
    this.canvas.addEventListener('click', () => {
      if (this.isPlaying() && !this.cams.active && !this.touch.active && !this.fixedView()) requestPointerLock();
    });
    $('clickToPlay').addEventListener('click', () => requestPointerLock());
  }

  // ── 2 Players ─────────────────────────────────────────────────────────

  openCoop() {
    this.renderCoop();
    this.showScreen('coop');
  }

  renderCoop() {
    const choices = (el, options, current, pick) => {
      el.innerHTML = '';
      for (const [id, label] of options) {
        const b = document.createElement('button');
        b.className = 'btn' + (id === current ? ' on' : ' btn-ghost');
        b.textContent = label;
        b.addEventListener('click', () => { sfx.ui(); pick(id); this.renderCoop(); });
        el.appendChild(b);
      }
    };
    choices($('coopChoice'), [['1', '1 Player'], ['2', '2 Players 👥']], this.coop.on ? '2' : '1', (id) => this.setCoop(id === '2'));
    choices($('splitChoice'), [['v', 'Side by side ◧'], ['h', 'Top and bottom ⬒']], this.coop.split, (id) => {
      this.coop.split = id;
      saveCoop(this.coop);
      this.layout();
    });
    $('splitDesc').textContent = this.coop.split === 'h'
      ? 'Jonathan on the top half, Jimmy on the bottom half.'
      : 'Jonathan on the left half, Jimmy on the right half.';
    const list = (map) => Object.values(map).map((d) => `<span class="key">${d.show}</span><span>${d.label}</span>`).join('');
    const pairs = (rows) => rows.map(([k, l]) => `<span class="key">${k}</span><span>${l}</span>`).join('');
    // On a phone or iPad (the designer's call): Jonathan has the screen, Jimmy a controller.
    const touch = this.touchScreen();
    const [how1, how2] = document.querySelectorAll('#coop .coop-how');
    how1.textContent = touch ? 'The touch screen' : 'WASD + the trackpad';
    how2.textContent = touch ? 'A controller (like a PS5 controller)' : 'The arrow keys — or a controller';
    $('coopKeys1').innerHTML = touch
      ? pairs([['LEFT THUMB', 'Walk'], ['RIGHT THUMB', 'Look around'], ['⚡', 'Zap'], ['E', 'Use'], ['🔦', 'Flashlight'],
        ['⇄', 'Next weapon'], ['🏃', 'Run'], ['⤓', 'Crouch'], ['😀', 'Emotes'], ['❚❚', 'Pause']])
      : list(P1_KEYMAP) + '<span class="key">TRACKPAD</span><span>Look around</span>';
    $('coopKeys2').innerHTML = touch ? pairs(PAD_HELP) : list(P2_KEYMAP);
    document.querySelector('#coop .coop-padkeys').hidden = touch;
    $('coopPadKeys').innerHTML = pairs(PAD_HELP);
    this.coopPads();
  }

  // A phone or tablet: touched, or a touch screen with no mouse.
  touchScreen() {
    return this.touch.active || (typeof matchMedia === 'function' && matchMedia('(hover: none) and (pointer: coarse)').matches);
  }

  // Is there a controller? (Most only show up after you press a button on them.)
  coopPads() {
    const n = readPads().length;
    const t = n > 1 ? '🎮🎮 Two controllers: Jimmy has the first, Jonathan the second.'
      : n ? '🎮 Controller connected — it\'s Jimmy\'s!'
      : this.touchScreen() ? '🎮 Jimmy needs a controller! Connect one (like a PS5 controller) in Bluetooth settings, then press a button on it.'
      : '🎮 Got a controller? Plug it in and press a button on it — Jimmy can use it instead of the arrows.';
    if ($('coopPad').textContent !== t) $('coopPad').textContent = t;
    $('coopPad').classList.toggle('on', n > 0);
  }

  // ── Settings ──────────────────────────────────────────────────────────

  openSettings() {
    this.renderSettings();
    this.showScreen('settings');
  }

  renderSettings() {
    const choices = (el, options, current, pick) => {
      el.innerHTML = '';
      for (const [id, label] of options) {
        const b = document.createElement('button');
        b.className = 'btn' + (id === current ? ' on' : ' btn-ghost');
        b.textContent = label;
        b.addEventListener('click', () => { sfx.ui(); pick(id); });
        el.appendChild(b);
      }
    };
    // Realistic is the full look; Fast is the original, for phones and tablets.
    const gfx = REALISTIC ? 'real' : 'fast';
    choices($('gfxChoice'), [['real', 'Realistic ✨'], ['fast', 'Fast ⚡']], gfx, (id) => {
      if (id !== gfx) saveGraphics(id);
    });
    $('gfxDesc').textContent = REALISTIC
      ? 'Real-looking fur, shiny floors and a dusty flashlight beam. Best on a computer.'
      : 'The original toy-box look. Runs smoothly on phones, tablets and slower computers.';
    const opts = Object.entries(DIFFICULTIES).map(([id, d]) => [id, `${d.name} ${d.face}`]);
    choices($('diffChoice'), opts, this.difficulty, (id) => {
      this.difficulty = id;
      saveDifficulty(id);
      this.applyNightmare();
      playMusic(this.nightmare ? 'nightmare' : 'title');
      this.renderSettings();
    });
    $('diffDesc').textContent = this.diff.desc;
    choices($('debugChoice'), [['off', 'Off'], ['on', 'On 🛠']], this.debugMode ? 'on' : 'off', (id) => {
      this.setDebug(id === 'on');
      this.renderSettings();
      this.showDebugBadge();
    });
    choices($('lookChoice'), [['plex', 'Pizzaplex 🍕'], ['all', 'Everywhere'], ['off', 'Off']], this.look, (id) => {
      this.look = id;
      saveLook(id);
      this.renderSettings();
    });
    $('lookDesc').textContent = {
      plex: 'Lost in the Pizzaplex looks like the old FNAF games: dark, grainy and washed out.',
      all: 'The whole game looks like the old FNAF games: dark, grainy and washed out.',
      off: 'No grain and no washed-out colours anywhere.',
    }[this.look];
    $('debugDesc').textContent = this.debugMode
      ? 'DEBUG MODE IS ON. Every night is open in Pick a Night. Nothing you do is saved, and your real progress comes back when you turn it off.'
      : 'Every night open in Pick a Night, for testing. Nothing you do in debug mode is saved.';
  }

  // The old-school FNAF look: in Lost in the Pizzaplex (its menus, chapters and cutscenes), or
  // everywhere, or nowhere — Settings → FNAF look.
  applyLook() {
    const plexScreens = ['escMenu', 'escCard', 'escape', 'escScare', 'escWin', 'cutscene', 'paused', 'caught'];
    const inPlex = this.story === this.plex && plexScreens.includes(this.mode);
    document.body.classList.toggle('fnaf', this.look === 'all' || (this.look === 'plex' && inPlex));
  }

  showDebugBadge() {
    const playing = this.isPlaying();
    $('debugBadge').classList.toggle('hidden', !this.debugMode || playing);
  }

  showScreen(name) {
    for (const el of document.querySelectorAll('.screen')) el.classList.remove('show');
    const el = $(name);
    if (el && el.classList.contains('screen')) el.classList.add('show');
    this.mode = name;
    const playing = this.isPlaying();
    this.hud.show(playing);
    this.hud.el.classList.toggle('day', name === 'day');
    this.hud.el.classList.toggle('esc', name === 'escape');
    this.applyLook();
    $('dayPanel').classList.toggle('hidden', name !== 'day');
    if (!playing) { this.cams.close(); this.closeRepairs(); }
    this.showDebugBadge();
  }

  // `page`: which of the title's menus to show (titlePage).
  toTitle(page = 'main') {
    exitPointerLock();
    this.escape.leave();
    this.plex.leave();
    this.sushi.leave();
    this.closets.leave();
    this.culac.leave();
    this.campaign.leave();    // (out of Story mode: Survival's save again)
    this.story = this.escape;
    this.viewCam = null;
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
    this.applyNightmare();
    this.hud.title(this.profile);
    this.escape.titleBadge();
    this.plex.titleBadge();
    this.sushi.titleBadge();
    this.closets.titleBadge();
    this.culac.titleBadge();
    this.titlePage(page);
    this.showScreen('title');
    playMusic(this.nightmare ? 'nightmare' : 'title');
    if (takeReopenSettings()) this.openSettings();
  }

  // The title's menu pages (the designer: "a main menu that says play, and it leads you to a
  // screen that says story or survival"): 'main' (Play, 2 Players), 'play' (Story or
  // Survival), 'story' (Continue or New game) and 'survival' (every story and night to pick
  // from, the way the title always was).
  titlePage(page = 'main') {
    for (const el of document.querySelectorAll('#title .menu-page')) el.classList.toggle('on', el.dataset.page === page);
    if (page !== 'story') return;
    const w = this.campaign.where();
    const going = !!w && !w.done;
    $('btnStoryContinue').classList.toggle('hidden', !going);
    $('storyWhere').textContent = w ? w.text : 'Start at Sushi\'s Pizzaplex and play every story, one after another.';
    $('btnStoryNew').className = going ? 'btn btn-ghost' : 'btn btn-big btn-story';
    $('btnStoryNew').innerHTML = going ? 'New game' : '▶&nbsp; New game';
  }

  continueGame() {
    const p = this.profile;
    if (!p.seenIntro) {
      this.cutscene('intro', () => {
        p.seenIntro = true;
        this.save();
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
    this.setWing(this.profile.night >= WING_NIGHT);
    // The first Day 11, the manager shows off the new wing.
    if (this.wingOpen && !this.profile.seen.newWing) {
      this.profile.seen.newWing = true;
      this.save();
      this.cutscene('newWing', () => this.startDay({ first, timmy }));
      return;
    }
    this.setArea('playplace');
    this.hidePeople();
    this.night.stop();
    this.junk.clear();
    this.weapons.clear();
    this.effects.clear();
    this.machines.resetAll();
    this.machines.setPower(true);
    for (const a of [...this.bots, ...this.wingBots]) a.resetToStage();
    if (this.profile.beatGus) for (const a of [...this.bots, ...this.wingBots]) setEyes(a.rig, 'friend');
    this.player.reset(P(30, 11.2), 0, this.profile.night);
    this.player.setWeapons(weaponsFor(Math.min(this.profile.night, 20)));
    this.player.lightOn = false;
    this.player.lightVisible = false;
    this.player.vmGroup.visible = true;
    this.setP1Body('jonathan', buildJonathan);
    this.spawnPartner(this.profile.night);
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
      this.save();
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
    this.grace = 0;
    $('jumpFlash').classList.add('hidden');
    this.replaying = n !== p.night;
    this.setWing(n >= WING_NIGHT);
    // Nobody knows they move at night. Jonathan finds out when he first hears one.
    this.secret = !p.seen.guardNote && !nightDef(n).boss ? 'quiet' : null;
    this.weapons.clear();
    this.effects.clear();
    const def = nightDef(n);
    this.player.reset(P(33.7, 37.2), Math.PI / 2, n);
    this.player.setWeapons(weaponsFor(n));
    this.player.lightOn = true;
    this.player.lightVisible = true;
    this.player.vmGroup.visible = true;
    this.setP1Body('jonathan', buildJonathan);
    this.spawnPartner(n);
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
    this.grace = 0;
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
    this.setP1Body('jonathan', buildJonathan);
    this.spawnPartner(10);
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
    p.homeDone = true;
    this.earnStar('home');
    this.save();
    sfx.victory();
    this.cutscene('homeDone', () => this.startDay());
  }

  // Something caught Jonathan.
  caught(who) {
    if (!this.hunting || this.grace > 0 || this.player.out) return;
    if (this.night.secondChance) { this.getAway(who); return; }
    if (this.shop.saveLife(who)) return;
    // (two playing: only the one it caught sees it, in their half — `scareP`)
    this.scareP = this.player;
    this.stopEmote(this.player);
    this.closeWheel(this.player);
    this.scareFrom = this.mode;
    if (!this.twoUp || this.cams.user === this.player) this.cams.close();
    if (this.repair.active) this.repair.close();
    if (this.player.carrying) this.dropCarried();
    this.mode = 'jumpscare';
    this.scarer = who;
    // the FNAF way (jumpscare.js): lunge, scream in your face, then static
    this.scareLen = holdFor(this.nightmare) + STATIC;
    this.scareTimer = this.scareLen;
    this.scareStatic = false;
    if (who.reveal) who.reveal(1);   // Sunny, out of the fog
    this.prevScareState = who.state;
    who.state = 'jumpscare';
    setEyes(who.rig, 'scare');
    // Flashlight off: the face is lit from below in red, which is far scarier.
    this.player.vmGroup.visible = false;
    this.player.lightVisible = false;
    // (when the other one's still in, the game only freezes for the scare: the music and
    // the HUD carry on)
    const partner = this.twoUp && this.alive().length > 1;
    if (!partner) {
      this.hud.show(false);
      $('clickToPlay').classList.add('hidden');
      stopMusicBox();
      stopMusic();
      stopAmbience();
    } else this.panes[this.player.index].el.classList.add('scared');
    sfx.fnafScream();
    if (this.nightmare) setTimeout(() => sfx.fnafScream(), 700);
    this.profile.stats.caught++;
    this.save();
  }

  // Easy mode: the first time something catches you each night, you wriggle free. It's stunned
  // and nothing can catch you for a few seconds, so run!
  // (the Shop's extra life does the same, with its own `msg`)
  getAway(who, msg = null) {
    this.night.secondChance = false;
    this.grace = SECOND_CHANCE_GRACE;
    const stun = SECOND_CHANCE_GRACE + 1;
    if (who.id === 'junk') who.staggerT = stun;
    else if (who.id === 'gus' || who.def.unstoppable) { who.freezeTimer = stun; sfx.stagger(who.pos); }
    else who.stagger(stun);
    if (this.player.carrying) this.dropCarried();
    this.player.shake = 0.8;
    this.hud.flashHit();
    this.hud.toast(msg || `You got away from ${who.name}! That was your second chance — RUN!`, 4);
  }

  updateJumpscare(dt) {
    const a = this.scarer;
    if (!a) { $('jumpFlash').classList.add('hidden'); this.toTitle(); return; }
    this.scareTimer -= dt;
    const t = this.scareLen - this.scareTimer;
    // It lunges into your face, screams with its head jerking about, then: static.
    const sp = this.scareP || this.player;
    const cam = sp.camera;
    sp.pitch += (0 - sp.pitch) * Math.min(1, dt * 20);
    sp.shake = t < LUNGE ? 0.4 : 0.9;
    sp.updateCamera();
    if (this.scareTimer > STATIC) {
      const { f, near } = placeScare(a, cam, sp, t);
      const keep = a.root.position.clone(), rot = a.root.rotation.clone();
      a.render(dt);
      a.root.position.copy(keep);
      a.root.rotation.copy(rot);
      finishScare(a, cam, f, near, t, this.effects);
      return;
    }
    if (!this.scareStatic) { this.scareStatic = true; showStatic(this.split ? sp.index : null); }
    drawStatic();
    if (this.scareTimer <= 0) {
      hideStatic();
      $('jumpFlash').classList.add('hidden');
      // Two playing, and the other one's still in: this one's out until morning, and the
      // night goes on.
      if (this.twoUp && this.knockOut(sp)) { this.afterKnockOut(a, this.scareFrom); return; }
      exitPointerLock();
      const home = !this.area.isPlayPlace;
      const tip = home ? TIPS.home : a.id === 'gus' && this.night.boss === 'gus' ? TIPS.gusBoss : TIPS[a.id];
      this.hud.caught(a.name, home ? 'Try again' : `Try Night ${this.night.n} again`, tip);
      this.night.stop();
      // Everyone back where they started, so nothing you'd zapped gets up behind the menu.
      this.resetBots();
      this.showScreen('caught');
    }
  }

  winNight() {
    const n = this.night.n;
    exitPointerLock();
    this.cams.close();
    this.closeRepairs();
    const report = this.night.morningReport();
    this.night.stop();
    this.resetBots();
    sfx.sixAM();
    setTimeout(() => sfx.cheer(), 1800);
    const p = this.profile;
    p.stats.survived++;
    if (!this.replaying) {
      p.happiness = report.after;
      p.night = n + 1;
      p.best = Math.max(p.best, p.night);
    }
    const star = this.earnStar(n);
    this.save();
    this.hud.morning(n, report, this.replaying ? [] : unlocksAt(n + 1), star);
    this.showScreen('morning');
  }

  // The boss is down. Everyone else stops hunting you straight away; the ending plays
  // after a few seconds of watching it fall apart.
  winBoss(who) {
    this.winTimer = 3;
    this.winWho = who;
    for (const a of this.bots) if (a !== who && a.state !== 'friend' && a.root.visible) a.befriend(null);
    for (const p of this.players) if (p.carrying) this.withPlayer(p, () => this.dropCarried());
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
      this.earnStar(n);
      this.save();
      this.updatePhoto();
      sfx.victory();
      this.cutscene(who.id === 'gus' ? 'gusDown' : 'finale', () => {
        // The first time it's all over, the old night guard comes to meet who finally did it.
        // (Story mode: on to Night 21 after Gus, and after it all, on to whatever comes next)
        const after = () => (this.campaign.on ? this.campaign.partDone('nights') : this.toTitle());
        if (who.id === 'gus') { if (this.campaign.on) this.continueGame(); else this.toTitle(); return; }
        if (p.seen.oldJohn) { after(); return; }
        p.seen.oldJohn = true;
        p.badge = true;
        this.save();
        this.cutscene('oldJohn', after);
      });
    }
  }

  // Every night beaten on Hard gets a star on the night select. True if this one is new.
  earnStar(n) {
    if (this.difficulty !== 'hard' || this.debugMode || this.profile.stars[n]) return false;
    this.profile.stars[n] = true;
    return true;
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

  // A story chapter where you don't walk about, and use the mouse on its buttons.
  fixedView() { return this.mode === 'escape' && !!this.story?.ctrl; }

  togglePause() {
    if (this.mode === 'paused') {
      this.showScreen(this.pausedFrom);
      if (!this.touch.active && !this.fixedView()) requestPointerLock();
      return;
    }
    if (!this.isPlaying()) return;
    this.pausedFrom = this.mode;
    exitPointerLock();
    $('btnPauseSolo').classList.toggle('hidden', !this.twoUp);
    this.showScreen('pause');
    this.mode = 'paused';
  }

  onLockChange(locked) {
    $('clickToPlay').classList.toggle('hidden', locked || !this.isPlaying() || this.cams.active || this.touch.active || this.fixedView());
    if (locked || !this.isPlaying() || this.cams.active || this.repair.active || this.phone.active) return;
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
    const used = [...this.bots, ...this.wingBots].filter((b) => b.state === 'junked').map((b) => b.junkSpot);
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
    for (const a of [...this.bots, ...this.wingBots]) {
      if (a.state !== 'down' || !near(a.pos, 2.3)) continue;
      if (p.crouching) return { text: `<b>C</b> Stand up to drag ${a.name}`, act: () => {}, quiet: true };
      return { text: `<b>E</b> Drag ${a.name}`, act: () => this.grab(a) };
    }
    const f = this.night.trippedFuse;
    if (f && near(f.point, 1.5)) return { text: '<b>E</b> Fix the fuse box', act: () => this.repair.start(f, this.night.repairLevel) };
    for (const m of this.machines.list) {
      if (m.broken && near(m.point, 1.6)) return { text: `<b>E</b> Fix the ${m.name}`, act: () => this.repair.start(m, this.night.repairLevel) };
    }
    if (this.area.isPlayPlace && room === 'O' && near(this.decor.desk.point, 1.8)) {
      if (this.secret === 'heard') return { text: '<b>E</b> Read the note on the desk', act: () => this.readGuardNote() };
      if (this.cams.active) return { text: `📹 ${this.cams.user?.name || 'Someone'} is on the cameras`, act: () => {}, quiet: true };
      return { text: '<b>E</b> Use the cameras', act: () => this.cams.open() };
    }
    return null;
  }

  // ── Update ────────────────────────────────────────────────────────────

  update(dt) {
    this.t += dt;
    this.touch.apply();
    if (this.twoUp) {
      const pads = readPads();
      // the first controller plugged in is Jimmy's; a second one is Jonathan's
      this.p2.ctl.pad = pads.length ? pads[0].index : null;
      this.p1.ctl.pad = pads.length > 1 ? pads[1].index : null;
      const all = navigator.getGamepads ? navigator.getGamepads() : [];
      for (const p of this.players) p.ctl.poll(dt, all);
    }
    // (only player 1 has ESC, so player 2's START pauses too)
    const p2Pause = this.twoUp && this.p2.ctl.pressed('pause');
    if (this.mode === 'paused' && (input.pressed('pause') || p2Pause)) this.togglePause();
    else if (p2Pause && this.isPlaying()) this.togglePause();
    switch (this.mode) {
      case 'night': this.updateNight(dt); break;
      case 'home': this.updateHome(dt); break;
      case 'day': this.updateDay(dt); break;
      case 'cutscene':
        this.cut.update(dt);
        if (this.cut.active && this.cut.script.kids) this.day.update(dt);
        break;
      case 'jumpscare': this.updateJumpscare(dt); break;
      case 'escape': this.story.update(dt); break;
      case 'escScare': this.story.updateScare(dt); break;
      case 'coop':
        this.updateBackdrop(dt);
        if (Math.floor(this.t * 2) !== Math.floor((this.t - dt) * 2)) this.coopPads();
        break;
      case 'title': case 'card': case 'howto': case 'select': case 'settings': case 'gallery': case 'shop':
      case 'escMenu': case 'escCard': case 'escWin':
        this.updateBackdrop(dt);
        break;
      default:
        if (this.mode === 'morning' || this.mode === 'caught') this.updateBackdrop(dt);
    }
    this.effects.update(dt);
    // Fog rolls in wherever the camera is in the Play Maze — you, or a cutscene.
    const cp = this.camera.position;
    // (a story's map can have foggy rooms of its own: Culac's Daycare's giant maze)
    const fogRoom = this.place.roomAt(cp.x, cp.z);
    this.lighting.foggy = this.place === this.playplace ? fogRoom === 'M' : !!(fogRoom && this.place.rooms[fogRoom]?.foggy);
    this.lighting.update(dt);
    this.decor.update(dt, this.t, (id) => this.machines.isBroken(id));
    const ear = this.lead;
    setListener(ear.pos.x, ear.pos.z, ear.yaw, this.twoUp ? this.alive().map((p) => ({ x: p.pos.x, z: p.pos.z, yaw: p.yaw })) : null);
    this.updateBodies(dt);
    if (this.twoUp) {
      this.layout();
      this.updatePanes();
    }
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
    if (this.mode === 'title' || this.mode === 'settings' || this.mode === 'gallery' || this.mode === 'shop') this.scareTick(dt, 18);
  }

  handleCommonInput() {
    const p = this.player, ctl = p.ctl;
    if (ctl.pressed('pause') && !this.cams.active && !this.repair.active) { this.togglePause(); return true; }
    if (ctl.pressed('flashlight') && this.hunting) p.toggleLight();
    if (ctl.pressed('crouch')) p.toggleCrouch();
    if (ctl.pressed('swap') || ctl.wheel) {
      const dir = ctl.wheel < 0 ? -1 : 1;
      p.selectSlot((p.slot + dir + p.weapons.length) % p.weapons.length);
    }
    for (let k = 1; k <= 4; k++) if (ctl.keyPressed('Digit' + k)) p.selectSlot(k - 1);
    return false;
  }

  // One player's part of a night step: their keys, walking, pressing E, their weapon.
  // True if that ended the step (paused, caught, a cutscene...).
  nightTurn(dt, p) {
    const ctl = p.ctl;
    const mode = this.mode;
    if (this.cams.active && this.cams.user === p) {
      if (ctl.keyPressed('KeyE') || ctl.keyPressed('Space') || ctl.keyPressed('Escape') || ctl.keyPressed('KeyS')) this.cams.close();
      p.update(dt, { canMove: false, canLook: false });
      this.hud.prompt(null);
    } else if (this.repair.active) {
      this.repair.update(dt);
      p.update(dt, { canMove: false, canLook: true });
      this.hud.prompt(null);
    } else if (this.emoteTurn(dt, p)) {
      if (ctl.pressed('pause')) { this.togglePause(); return true; }
    } else {
      if (this.handleCommonInput()) return true;
      p.update(dt);
      this.shop.turn(dt, p);
      let it = this.findInteraction();
      if (it && p.masked) it = this.shop.maskedPrompt(p);
      this.hud.prompt(it ? it.text : null);
      if (it && ctl.pressed('interact')) it.act();
      if (this.mode !== mode) return true;
      if (ctl.firePressed && (ctl.locked || this.touch.active)) this.weapons.use();
    }
    return this.mode !== mode;
  }

  // Each animatronic's turn, aimed at whichever of you it's after.
  botTurns(list, dt) {
    const mode = this.mode;
    for (const a of list) {
      if (this.twoUp) this.asPrey(a, () => a.update(dt));
      else a.update(dt);
      if (this.mode !== mode) return true;
    }
    return false;
  }

  updateNight(dt) {
    this.grace = Math.max(0, this.grace - dt);
    this.scareTick(dt, 75);
    if (this.eachPlayer((p) => this.nightTurn(dt, p))) return;
    this.withPlayer(this.cams.user || this.lead, () => this.cams.update(dt));
    if (this.mode !== 'night') return;
    if (this.winTimer > 0) {
      this.winTimer -= dt;
      if (this.winTimer <= 0) { this.finishBoss(this.winWho); return; }
    }
    this.night.update(dt);
    if (this.mode !== 'night') return;
    if (this.botTurns(this.bots, dt) || this.botTurns(this.wingBots, dt)) return;
    for (const a of this.oldBots) if (a.state === 'friend') a.update(dt);
    if (this.mode !== 'night') return;
    if (this.secret === 'quiet') {
      const moved = this.bots.find((a) => ROAMERS.includes(a.id) && a.state !== 'stage');
      if (moved) this.heardThem(moved);
    }
    this.timmy.update(dt);
    if (this.twoUp) this.asPrey(this.junk, () => this.junk.update(dt));
    else this.junk.update(dt);
    this.weapons.update(dt);
    this.machines.update(dt);
    this.shop.tick(dt);
    this.hud.update(dt);
  }

  updateHome(dt) {
    this.grace = Math.max(0, this.grace - dt);
    this.scareTick(dt, 75);
    if (this.eachPlayer((p) => this.nightTurn(dt, p))) return;
    if (this.mode !== 'home') return;
    this.night.time += dt;
    if (this.botTurns(this.bots.filter((a) => a.id !== 'gus'), dt)) return;
    this.weapons.update(dt);
    this.shop.tick(dt);
    this.hud.update(dt);
    if (this.vanCount() === ROAMERS.length && !this.players.some((p) => p.carrying)) this.winHome();
  }

  dayTurn(dt, p) {
    if (this.emoteTurn(dt, p)) return false;
    if (this.handleCommonInput()) return true;
    p.update(dt);
    const it = this.findInteraction();
    this.hud.prompt(it ? it.text : null);
    if (it && p.ctl.pressed('interact')) it.act();
    return this.mode !== 'day';
  }

  updateDay(dt) {
    if (this.phone.active) {
      this.eachPlayer((p) => {
        if (p === this.phone.user) this.phone.update(dt);
        if (p === this.phone.user || !this.twoUp) { p.update(dt, { canMove: false, canLook: false }); this.hud.prompt(null); }
        else this.dayTurn(dt, p);
      });
      this.timmy.update(dt);
      if (this.twoUp) { this.day.update(dt); this.hud.update(dt); }
      return;
    }
    if (this.eachPlayer((p) => this.dayTurn(dt, p))) return;
    if (this.mode !== 'day') return;
    for (const a of this.bots) a.update(dt);
    for (const a of this.wingBots) a.update(dt);
    this.timmy.update(dt);
    this.day.update(dt);
    this.hud.update(dt);
  }

  // ── Finding out ───────────────────────────────────────────────────────

  // The first one steps off the stage. Its footsteps are played closer than it really is,
  // so you can't miss them.
  heardThem(a) {
    this.secret = 'heard';
    const p = this.player.pos;
    const dx = a.pos.x - p.x, dz = a.pos.z - p.z;
    const d = Math.max(1, Math.hypot(dx, dz));
    const at = { x: p.x + (dx / d) * 9, z: p.z + (dz / d) * 9 };
    for (let i = 0; i < 4; i++) setTimeout(() => sfx.step(a.id, at), i * 420);
    const sound = a.id === 'cranker' ? 'Squeak... squeak...' : 'Thump... thump...';
    this.hud.toast(`${sound} What was THAT?!`, 4);
  }

  // The old night guard knew. He left a note.
  readGuardNote() {
    exitPointerLock();
    this.showScreen('guardNote');
  }

  closeGuardNote() {
    this.secret = null;
    this.profile.seen.guardNote = true;
    this.save();
    this.showScreen('night');
    if (!this.touch.active) requestPointerLock();
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
    this.closeRepairs();
    for (const p of this.players) if (p.carrying) this.withPlayer(p, () => this.dropCarried());
    exitPointerLock();
    sfx.scream();
    this.night.stop();
    this.resetBots();
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
        this.save();
      }
      this.startDay();
      this.hud.toast(`Timmy is home safe! Kids' happiness +${TIMMY.rescue} 😄`, 4);
    });
  }

  render(dt) {
    this.cams.renderMonitors(this.renderer, this.scene, dt);
    // (a story's own render-to-texture: In the Closets' mirrors)
    if (this.mode === 'escape' && this.story.renderExtras) this.story.renderExtras(this.renderer, this.scene, dt);
    if (this.twoUp) {
      // (anyone not being played right now — out, or in a cutscene — has their light off)
      const view = this.playingView();
      for (const p of this.players) if (p.out || !view) p.flashlight.intensity = 0;
    }
    if (this.split) {
      // Two halves: each of you through your own eyes (or the monitor, if you're on it).
      const rects = this.paneRects();
      this.players.forEach((p, i) => {
        const onCams = this.cams.active && this.cams.user === p;
        if (this.cams.active) this.lighting.setCams(onCams);
        this.renderView(p, onCams ? this.cams.cam : p.camera, { spot: p.flashlight, dt: i ? 0 : dt, rect: rects[i], shadows: i === 0 });
      });
      if (this.cams.active) this.lighting.setCams(false);
      return;
    }
    // (`viewCam`: a story chapter looking through a camera of its own — Jackson's monitor)
    const solo = this.lead;
    const cam = this.viewCam || (this.cams.active ? this.cams.cam : solo.camera);
    if (this.twoUp || solo.body) {
      // (one view: only its owner's flashlight is on)
      for (const p of this.players) if (p !== solo) p.flashlight.intensity = 0;
      this.renderView(solo, cam, { spot: solo.flashlight, dt });
    }
    else this.graphics.render(this.scene, cam, { spot: this.player.flashlight, dt });
  }

  resize(w, h) {
    this.viewW = w; this.viewH = h;
    // Two playing: each half is its own little screen.
    let vw = w, vh = h;
    if (this.split) { const r = this.paneRects()[0]; vw = r.w; vh = r.h; }
    this.graphics.setSize(vw, vh);
    const aspect = vw / vh;
    const fit = (cam) => {
      cam.aspect = aspect;
      if (this.split) {
        // tall halves keep ~76° across, wide ones stop at ~100°
        const across = (aspect > 1.5 ? 100 : 76) * Math.PI / 180;
        cam.fov = Math.min(92, Math.max(40, 2 * Math.atan(Math.tan(across / 2) / aspect) * 180 / Math.PI));
      } else {
        // Keep at least ~80° across on narrow (portrait) screens, so cutscenes and the night
        // don't turn into a letterbox slot.
        const minVertical = 2 * Math.atan(Math.tan((80 * Math.PI / 180) / 2) / aspect) * 180 / Math.PI;
        cam.fov = Math.min(100, Math.max(72, minVertical));
      }
      cam.updateProjectionMatrix();
    };
    fit(this.camera);
    if (this.p2cam) fit(this.p2cam);
    this.cams.cam.aspect = aspect;
    this.cams.cam.updateProjectionMatrix();
    this.plex?.resize(w, h);
  }
}
