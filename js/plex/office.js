// Jackson's chapters (they play like FNAF 1, the designer's call): Jackson sits at the desk in
// the Pizzaplex's security office and doesn't get up.
//
//   A / D, or the mouse at the edge    look left and right
//   Q / E                              shut or open the left / right door
//   hold Z / C                         the left / right hall light
//   SPACE                              the cameras up or down; ← → or the map switch camera
//
// (Every one of those is a button on screen too, for touch.) The animatronics come up from
// the main floor one room at a time — every few seconds each one gets a chance to move, the
// way FNAF does it. The last stop is right outside a door, where only the hall light shows
// it: shut that door, and after a while it gives up and goes back. Leave it open and it comes
// in. Doors, lights and the cameras all use power, and if the power runs out the doors open,
// the lights go out — and Gus's music box starts to play.
//
// The kids who got lost are out there too: spot them on the cameras for bonus quests.
//
// Later chapters add one twist each, all switched on from the chapter's `office` numbers:
//
//   calls    John, who had this kind of job at Gus's Giant Pizza Palace, phones with tips
//   runner   Flipper waits in the ball pit. Watch him on his camera and he stays put; stop
//            watching and he climbs out, a bit more every second — and then RUNS up the West
//            Hall. Shut: he bangs on the door and goes back. Open: gotcha.
//   chew     Chomper chews camera wires: a camera goes NO SIGNAL for a while (and so does any
//            camera he's standing under)
//   skip     (on a bot) it moves more than one room at a time: Sparky the robot dog
//   whenDown (on a bot) it only moves while the cameras are DOWN: Gus, when he walks
import * as THREE from 'three';
import { input } from '../input.js';
import { sfx, startMusicBox, stopMusicBox } from '../audio.js';
import { buildAnimatronic, poseRig, setEyes } from '../models.js';

const $ = (id) => document.getElementById(id);

export class Office {
  constructor(mode, lv) {
    this.mode = mode;
    this.lv = lv;
    this.def = lv.def.office;
    const P = lv.place.P;
    this.P = P;
    this.cam = new THREE.PerspectiveCamera(66, 16 / 9, 0.1, 80);
    this.cams = this.def.cams.map((c, i) => ({ ...c, n: i + 1, pos: P(...c.pos), look: P(...c.look) }));
    // the animatronics: each walks its own route, one stop at a time
    this.bots = this.def.bots.map((b) => {
      const rig = b.build ? b.build() : buildAnimatronic(b.id);
      rig.root.rotation.order = 'YXZ';
      rig.root.visible = false;
      mode.game.scene.add(rig.root);
      return { ...b, def: { kind: 'watcher' }, rig, root: rig.root, pos: new THREE.Vector3(), yaw: 0, stop: 0, state: 'route' };
    });
    // Gus, on his stage, all night — until the power goes out
    const gus = buildAnimatronic('gus');
    gus.root.rotation.order = 'YXZ';
    gus.root.visible = false;
    mode.game.scene.add(gus.root);
    this.gus = { id: 'gus', name: 'Gus', def: { kind: 'watcher' }, rig: gus, root: gus.root, pos: P(...this.def.gus.stage), yaw: 0 };
    // the runner (Flipper, in the ball pit), when the chapter has one
    const R = this.def.runner;
    if (R) {
      const rig = R.build ? R.build() : buildAnimatronic(R.id);
      rig.root.rotation.order = 'YXZ';
      rig.root.visible = false;
      mode.game.scene.add(rig.root);
      this.runner = { id: R.id, name: R.name, def: { kind: 'watcher' }, rig, root: rig.root, pos: new THREE.Vector3(), yaw: 0 };
    }
    this.makeUI();
    this.onMove = (e) => { this.mouseX = e.clientX / innerWidth; };
  }

  get game() { return this.mode.game; }
  get decor() { return this.lv.decor; }

  // ── The screen ────────────────────────────────────────────────────────

  makeUI() {
    // (the screen's already there when another of Jackson's chapters built it first)
    if ($('officeUI')) {
      this.ui = $('officeUI');
      this.camUI = $('officeCams');
      this.nctx = $('offNoise').getContext('2d');
      this.noiseImg = this.nctx.createImageData(160, 90);
      this.buildMap();
      return;
    }
    const ui = document.createElement('div');
    ui.id = 'officeUI';
    ui.className = 'office-ui hidden';
    ui.innerHTML = `
      <div class="office-power"><div>POWER LEFT: <b id="offPower">100%</b></div><div>USAGE: <span id="offUsage"></span></div></div>
      <div class="office-side left">
        <button id="offDoorL" class="office-btn door">🚪<span>DOOR</span><small>Q</small></button>
        <button id="offLightL" class="office-btn light">💡<span>LIGHT</span><small>hold Z</small></button>
      </div>
      <div class="office-side right">
        <button id="offDoorR" class="office-btn door">🚪<span>DOOR</span><small>E</small></button>
        <button id="offLightR" class="office-btn light">💡<span>LIGHT</span><small>hold C</small></button>
      </div>
      <div class="office-look">
        <button id="offLookL" class="office-look-btn">◀</button>
        <button id="offCamsBtn" class="office-cams-btn">📹 CAMERAS <small>SPACE</small></button>
        <button id="offLookR" class="office-look-btn">▶</button>
      </div>
      <div id="offHint" class="office-hint"></div>`;
    $('escHud').appendChild(ui);
    const cams = document.createElement('div');
    cams.id = 'officeCams';
    cams.className = 'office-cams hidden';
    cams.innerHTML = `
      <canvas id="offNoise" class="off-noise"></canvas>
      <div class="cam-scan"></div>
      <div class="cam-vignette"></div>
      <div class="cam-top"><span class="rec">● REC</span><span id="offCamName" class="cam-name"></span><span id="offCamClock" class="cam-clock"></span></div>
      <div id="offCamOffline" class="cam-offline hidden">NO SIGNAL</div>
      <div id="offCamSpot" class="off-spot hidden"></div>
      <div id="offCamMap" class="off-map"></div>
      <div class="off-cam-power">POWER <b id="offCamPower">100%</b></div>
      <button id="offCamsDown" class="btn btn-ghost off-cams-down">📹 Put down <small>SPACE</small></button>`;
    $('escHud').appendChild(cams);
    this.ui = ui;
    this.camUI = cams;
    const g = this.game;
    const act = (id, fn) => $(id).addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); const c = g.story.ctrl; if (c && c.act) fn(c); });
    act('offDoorL', (c) => c.toggleDoor('left'));
    act('offDoorR', (c) => c.toggleDoor('right'));
    act('offCamsBtn', (c) => c.setCams(!c.camsUp));
    act('offCamsDown', (c) => c.setCams(false));
    const hold = (id, key) => {
      const on = (v) => (e) => { e.preventDefault(); e.stopPropagation(); const c = g.story.ctrl; if (c && c.held) c.held[key] = v; };
      $(id).addEventListener('pointerdown', on(true));
      for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) $(id).addEventListener(ev, on(false));
    };
    hold('offLightL', 'lightL');
    hold('offLightR', 'lightR');
    hold('offLookL', 'lookL');
    hold('offLookR', 'lookR');
    const noise = $('offNoise');
    noise.width = 160; noise.height = 90;
    this.nctx = noise.getContext('2d');
    this.noiseImg = this.nctx.createImageData(160, 90);
    this.buildMap();
  }

  // The camera map: the Pizzaplex's rooms from above, a button for each camera, and you.
  buildMap() {
    const map = $('offCamMap');
    map.innerHTML = '';
    const place = this.lv.place;
    const W = place.w, H = place.h;
    map.style.aspectRatio = `${W} / ${H}`;
    for (const [id, r] of Object.entries(place.rooms)) {
      const el = document.createElement('div');
      el.className = 'room' + (id === 'O' ? ' you' : '');
      el.style.left = (r.x0 / W) * 100 + '%';
      el.style.top = (r.z0 / H) * 100 + '%';
      el.style.width = ((r.x1 - r.x0 + 1) / W) * 100 + '%';
      el.style.height = ((r.z1 - r.z0 + 1) / H) * 100 + '%';
      if (id === 'O') el.textContent = 'YOU';
      map.appendChild(el);
    }
    this.camBtns = this.cams.map((c, i) => {
      const b = document.createElement('div');
      b.className = 'cam-btn';
      b.textContent = String(c.n).padStart(2, '0');
      const [px, pz] = c.pos2 || c.map;
      b.style.left = (px / W) * 100 + '%';
      b.style.top = (pz / H) * 100 + '%';
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); this.game.story.ctrl?.switchCam?.(i); });
      map.appendChild(b);
      return b;
    });
  }

  // ── Starting and stopping ─────────────────────────────────────────────

  // The key hints on the buttons: two playing, each side is somebody's.
  labelKeys() {
    const two = this.game.players.length > 1;
    const set = (id, t) => { const el = $(id)?.querySelector('small'); if (el) el.textContent = t; };
    set('offDoorL', two ? 'JONATHAN: E' : 'Q');
    set('offLightL', two ? 'hold F' : 'hold Z');
    set('offDoorR', two ? 'JIMMY: /' : 'E');
    set('offLightR', two ? 'hold .' : 'hold C');
    set('offCamsBtn', two ? 'SPACE · ENTER' : 'SPACE');
  }

  start() {
    this.labelKeys();
    if (this.game.players.length > 1) this.game.hud.toast('👥 Jonathan has the LEFT door and light. Jimmy has the RIGHT door and light!', 5);
    const m = this.mode, O = this.def;
    this.act = true;
    this.held = { lightL: false, lightR: false, lookL: false, lookR: false };
    this.t = 0;
    this.yaw = 0;
    this.power = 100;
    this.doors = { left: false, right: false };
    this.doorK = { left: 0, right: 0 };
    this.lights = { left: false, right: false };
    this.camsUp = false;
    this.camI = 0;
    this.static = 0;
    this.out = null;          // the power's out: Gus's music box
    this.tick = O.tick;
    this.mouseX = 0.5;
    this.level = (b) => Math.max(0, Math.min(20, b.ai + m.game.diff.level));
    this.buildMap();          // (every chapter has its own cameras)
    this.chewed = {};         // camera number → seconds until it's fixed
    this.chewT = O.chew ? O.chew.first ?? O.chew.every : 0;
    this.callI = 0;
    this.gusWalks = this.bots.some((b) => b.id === 'gus');
    if (this.runner) {
      this.run = { k: 0, state: 'pit', t: 0 };
      this.runner.root.visible = true;
      setEyes(this.runner.rig, 'on');
      this.placeRunner();
    }
    for (const b of this.bots) {
      b.stop = 0;
      b.state = this.t >= (b.from || 0) ? 'route' : 'wait';
      b.doorT = 0;
      b.root.visible = true;
      setEyes(b.rig, 'on');
      this.placeBot(b);
    }
    const gus = this.gus;
    gus.pos.copy(this.P(...O.gus.stage));
    gus.root.visible = !this.gusWalks;     // (when Gus walks, he's one of the bots instead)
    gus.root.position.copy(gus.pos);
    gus.root.rotation.set(0, 0, 0);
    poseRig(gus.rig, 'idle', 0, 0.3, 1);
    setEyes(gus.rig, 'dim');
    for (const k of this.mode.people.list) k.root.visible = false;
    this.spotted = new Set();
    this.ui.classList.remove('hidden');
    this.camUI.classList.add('hidden');
    this.setLight('left', false, true);
    this.setLight('right', false, true);
    this.setOfficeLight(true);
    this.updateDoorsNow();
    addEventListener('pointermove', this.onMove);
    this.game.hud.toast(O.toast || `🔦 Hold out until ${this.endTime()}. Watch the cameras — and don't run out of power!`, 4.5);
    this.view(0);
  }

  // When this chapter's shift ends: "1 AM", "2:20", "6 AM".
  endTime() {
    const c = this.lv.def.clock || {};
    const end = (c.from || 0) + (c.minutes || 60);
    const h = Math.floor(end / 60), mm = end % 60;
    return mm ? `${h}:${String(mm).padStart(2, '0')}` : `${h} AM`;
  }

  stop() {
    this.act = false;
    removeEventListener('pointermove', this.onMove);
    this.ui.classList.add('hidden');
    this.camUI.classList.add('hidden');
    this.setCams(false, true);
    for (const b of this.bots) b.root.visible = false;
    this.gus.root.visible = false;
    if (this.runner) this.runner.root.visible = false;
    for (const k of this.mode.people.list) k.root.visible = false;
    stopMusicBox();
    this.game.viewCam = null;
  }

  resize(w, h) {
    this.cam.aspect = w / h;
    this.cam.updateProjectionMatrix();
  }

  // ── Looking round the office ──────────────────────────────────────────

  view(dt) {
    const p = this.mode.player, O = this.def;
    let turn = 0;
    // (two playing, either of you can look round: there's one office and one screen)
    const ctls = this.game.players.length > 1 ? this.game.players.map((q) => q.ctl) : [input];
    if (ctls.some((c) => c.down('left')) || this.held.lookL || (!this.game.touch.active && this.mouseX < 0.14)) turn += 1;
    if (ctls.some((c) => c.down('right')) || this.held.lookR || (!this.game.touch.active && this.mouseX > 0.86)) turn -= 1;
    if (!this.camsUp) this.yaw = Math.max(-O.yawMax, Math.min(O.yawMax, this.yaw + turn * dt * 2.2));
    for (const c of ctls) c.drainLook();
    p.pos.copy(this.P(...O.seat));
    p.height = O.eye;
    p.yaw = this.yaw;
    p.pitch = -0.08;
    p.lightOn = false;
    p.flashlight.intensity = 0;     // (Jackson's at his desk: no flashlight)
    p.vmGroup.visible = false;
    p.updateCamera();
  }

  // ── Doors, lights, cameras ────────────────────────────────────────────

  toggleDoor(side) {
    if (this.out) { sfx.zapEmpty(); return; }
    this.doors[side] = !this.doors[side];
    sfx.plexDoor();
  }

  setLight(side, on, quiet = false) {
    if (this.out) on = false;
    if (this.lights[side] === on) return;
    this.lights[side] = on;
    const l = this.decor.hallLights[side];
    l.off = !on;
    if (l.bulb) l.bulb.visible = on;
    this.game.lighting.apply();     // (works out the light's brightness from `off`)
    if (!quiet) sfx.plexLight();
  }

  setOfficeLight(on) {
    const l = this.decor.officeLight;
    l.off = !on;
    this.game.lighting.apply();
    for (const s of this.decor.screens) s.visible = on;
  }

  setCams(up, quiet = false) {
    if (up && this.out) { sfx.zapEmpty(); return; }
    if (this.camsUp === up) return;
    this.camsUp = up;
    this.camUI.classList.toggle('hidden', !up);
    this.ui.classList.toggle('cams', up);
    this.game.hud.el.classList.toggle('cams-up', up);
    this.game.canvas.classList.toggle('night-vision', up);
    this.game.lighting.setCams(up);
    this.game.viewCam = up ? this.cam : null;
    if (!quiet) up ? sfx.camOpen() : sfx.camClose();
    this.static = 0.9;
    if (up) this.refreshCam();
    // the thing that got in while you were on the cameras
    if (!up && !quiet) {
      const inside = this.bots.find((b) => b.state === 'in');
      if (inside) setTimeout(() => this.act && this.game.mode === 'escape' && this.get(inside), 350);
    }
  }

  switchCam(i) {
    this.camI = (i + this.cams.length) % this.cams.length;
    this.static = 0.85;
    sfx.camSwitch();
    this.refreshCam();
  }

  refreshCam() {
    const c = this.cams[this.camI];
    $('offCamName').textContent = `CAM ${String(c.n).padStart(2, '0')} · ${c.name.toUpperCase()}`;
    this.camBtns.forEach((b, i) => {
      b.classList.toggle('on', i === this.camI);
      b.style.color = this.offline(this.cams[i]) ? '#ff6060' : '';
    });
  }

  // A camera with its wires chewed through shows nothing but static.
  offline(c = this.cams[this.camI]) { return (this.chewed[c.n] || 0) > 0; }

  // Is the camera up and looking at camera `n`, with a picture on it?
  watching(n) { return this.camsUp && this.cams[this.camI].n === n && !this.offline(); }

  // ── Update ────────────────────────────────────────────────────────────

  update(dt) {
    const m = this.mode, O = this.def;
    this.t += dt;
    // input
    const two = this.game.players.length > 1;
    if (!this.out && two) {
      // Two playing (the designer's call: "split the doors"): Jonathan has the LEFT door and
      // light (E or Q, hold F or Z), Jimmy the RIGHT (/, hold .). Either can work the cameras.
      const a = this.game.p1.ctl, b = this.game.p2.ctl;
      if (a.keyPressed('Space') || a.pressed('watch') || b.pressed('fire') || b.pressed('watch')) this.setCams(!this.camsUp);
      if (!this.camsUp) {
        if (a.pressed('interact') || a.keyPressed('KeyQ')) this.toggleDoor('left');
        if (b.pressed('interact')) this.toggleDoor('right');
      } else {
        if (a.keyPressed('KeyD') || b.keyPressed('ArrowRight')) this.switchCam(this.camI + 1);
        if (a.keyPressed('KeyA') || b.keyPressed('ArrowLeft')) this.switchCam(this.camI - 1);
        for (let k = 1; k <= 9; k++) if (a.keyPressed('Digit' + k)) this.switchCam(k - 1);
      }
      this.setLight('left', !this.camsUp && (a.down('flashlight') || a.keyHeld('KeyZ') || this.held.lightL));
      this.setLight('right', !this.camsUp && (b.down('flashlight') || this.held.lightR));
    } else if (!this.out) {
      if (input.keyPressed('Space') || input.pressed('watch')) this.setCams(!this.camsUp);
      if (!this.camsUp) {
        if (input.keyPressed('KeyQ')) this.toggleDoor('left');
        if (input.keyPressed('KeyE')) this.toggleDoor('right');
      } else {
        if (input.keyPressed('ArrowRight') || input.keyPressed('KeyD')) this.switchCam(this.camI + 1);
        if (input.keyPressed('ArrowLeft') || input.keyPressed('KeyA')) this.switchCam(this.camI - 1);
        for (let k = 1; k <= 9; k++) if (input.keyPressed('Digit' + k)) this.switchCam(k - 1);
      }
      this.setLight('left', !this.camsUp && (input.keysHeld.has('KeyZ') || this.held.lightL));
      this.setLight('right', !this.camsUp && (input.keysHeld.has('KeyC') || this.held.lightR));
    }
    this.view(dt);
    this.updateDoorsNow(dt);

    // power: a little all the time, more for every door shut, light on, and the cameras
    if (!this.out) {
      const use = 1 + (this.doors.left ? 1 : 0) + (this.doors.right ? 1 : 0) + (this.lights.left || this.lights.right ? 1 : 0) + (this.camsUp ? 1 : 0);
      this.usage = use;
      this.power = Math.max(0, this.power - use * O.drain * (m.game.diff.gear || 1) * dt);
      if (this.power <= 0) this.powerOut();
    }

    this.updateCalls();
    // the animatronics: every few seconds each one gets a chance to move
    this.tick -= dt;
    if (this.tick <= 0) {
      this.tick = O.tick;
      for (const b of this.bots) this.chance(b);
    }
    for (const b of this.bots) {
      if (b.state === 'wait' && this.t >= (b.from || 0)) b.state = 'route';
      if (b.state === 'door') this.atDoor(b, dt);
      if (m.game.mode !== 'escape') return;
      if (b.state === 'in' && !this.camsUp) { b.inT = (b.inT || 0) + dt; if (b.inT > 1.2) { this.get(b); return; } }
      poseRig(b.rig, b.state === 'door' ? 'stare' : 'idle', this.t + b.ai, 0.4, dt);
    }
    if (this.out) { this.updateOut(dt); if (m.game.mode !== 'escape') return; }
    if (this.runner && !this.out) { this.updateRunner(dt); if (m.game.mode !== 'escape') return; }
    if (O.chew && !this.out) this.updateChew(dt);
    this.updateKids();
    if (this.camsUp) this.updateCams(dt);
    this.updateUI();
  }

  // One roll of the dice: does it move one step closer? (FNAF's way: the higher its level,
  // the likelier.)
  chance(b) {
    if (b.state !== 'route' || this.out) return;
    if (b.whenDown && this.camsUp) return;      // Gus: only while you aren't watching
    if (Math.random() * 20 >= this.level(b)) return;
    const was = b.stop;
    // now and then it wanders back a step instead (Sparky skips ahead)
    b.stop = Math.random() < 0.12 && b.stop > 0 ? b.stop - 1 : b.stop + (b.skip || 1);
    if (b.bark) sfx.plexBark(this.P(...b.route[Math.min(b.stop, b.route.length - 1)].at));
    if (b.id === 'gus' && b.stop > was) sfx.musicBoxSting();
    if (b.stop >= b.route.length) {
      b.stop = b.route.length - 1;
      b.state = 'door';
      b.doorT = 0;
      sfx.step(b.steps || b.id, this.P(...b.route[b.stop].at));
    }
    this.placeBot(b);
    // a camera it just walked off (or onto) goes fuzzy
    const c = this.cams[this.camI];
    if (this.camsUp && (b.route[was].cam === c.n || b.route[b.stop].cam === c.n)) { this.static = 1; sfx.camSwitch(); }
    // Chomper, when he's the one chewing: the camera over wherever he's got to goes out
    if (this.def.chew && b.id === 'chomper' && b.route[b.stop].cam && Math.random() < this.def.chew.under) {
      this.chew(b.route[b.stop].cam);
    }
  }

  placeBot(b) {
    const s = b.route[b.stop];
    const at = this.P(s.at[0], s.at[1]);
    b.pos.copy(at);
    b.root.position.set(at.x, this.lv.place.floorAt(at.x, at.z), at.z);
    b.yaw = s.yaw || 0;
    b.root.rotation.set(0, b.yaw, 0);
  }

  // Right outside a door. Shut: it waits, gives up and goes back. Open: it comes in.
  atDoor(b, dt) {
    b.doorT += dt;
    if (b.doorT < this.def.doorWait) return;
    if (this.doors[b.side]) {
      b.stop = Math.max(0, Math.floor(Math.random() * 2));
      b.state = 'route';
      this.placeBot(b);
      sfx.pound(this.P(...this.def.seat));
      setTimeout(() => sfx.plexScurry(), 400);
      this.mode.check('door');
    } else {
      b.state = 'in';
      b.inT = 0;
      b.root.visible = false;
      if (!this.camsUp) this.get(b);
    }
  }

  // The doors' steel shutters, sliding down and up.
  updateDoorsNow(dt = 1) {
    const sh = this.decor.shutters;
    if (!sh) return;
    for (const side of ['left', 'right']) {
      const want = this.doors[side] ? 1 : 0;
      this.doorK[side] += (want - this.doorK[side]) * Math.min(1, dt * 10);
      const s = sh[side];
      s.mesh.position.y = s.up + (s.down - s.up) * this.doorK[side];
      s.btn.color.set(this.doors[side] ? 0xff2a2a : 0x3a0808);
      sh[side].lightBtn.color.set(this.lights[side] ? 0xfff4c0 : 0x2a2a20);
    }
  }

  // ── The power runs out ────────────────────────────────────────────────

  powerOut() {
    if (this.out) return;
    this.setCams(false, true);
    this.doors.left = this.doors.right = false;
    this.setLight('left', false, true);
    this.setLight('right', false, true);
    this.setOfficeLight(false);
    sfx.blackout();
    this.out = { t: 0, song: 5 + Math.random() * 8, dark: 0 };
    const gus = this.gus;
    for (const b of this.bots) if (b.id === 'gus') b.root.visible = false;
    if (this.runner) this.runner.root.visible = false;
    gus.root.visible = true;
    gus.pos.copy(this.P(...this.def.gus.door));
    gus.root.position.copy(gus.pos);
    gus.root.rotation.set(0, Math.PI / 2, 0);
    setEyes(gus.rig, 'on');
    this.game.hud.toast('⚡ THE POWER\'S OUT...', 3);
  }

  updateOut(dt) {
    const o = this.out, gus = this.gus;
    o.t += dt;
    if (o.t > 2.5 && !o.playing && !o.over) {
      o.playing = true;
      startMusicBox(() => gus.pos);
    }
    // his face lights up in the doorway, on and off, while it plays
    const flick = o.playing && !o.over && Math.sin(o.t * 6) > -0.2;
    setEyes(gus.rig, flick ? 'on' : 'off');
    poseRig(gus.rig, 'stare', o.t, 0.3, dt);
    if (o.playing && !o.over && o.t > 2.5 + o.song) {
      o.over = true;
      stopMusicBox();
      setEyes(gus.rig, 'off');
      o.dark = 0;
    }
    if (o.over) {
      o.dark += dt;
      if (o.dark > 2.2) this.get(gus, 'The power ran out, and Gus came in.');
    }
  }

  // ── The kids, out there on the cameras ────────────────────────────────

  updateKids() {
    const people = this.mode.people;
    // (the same kid can be on the cameras more than once — Timmy, all over the Pizzaplex)
    for (const k of this.def.kids) people[k.who].root.visible = false;
    for (const k of this.def.kids) {
      const who = people[k.who];
      const key = k.key || k.who;
      const on = this.t >= k.from && this.t <= k.to && !this.out;
      if (!on) continue;
      who.root.visible = true;
      const f = Math.min(1, (this.t - k.from) / (k.to - k.from));
      const a = this.P(...k.a), b = this.P(...k.b);
      who.root.position.copy(a).lerp(b, f);
      who.root.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
      poseRig(who.rig, 'walk', this.t * 6, 0.7, 1 / 60);
      if (this.watching(k.cam) && this.static < 0.6 && !this.spotted.has(key)) {
        this.spotted.add(key);
        this.mode.check('spot', key);
        sfx.plexWalkie();
        this.mode.say(k.line, 3.6, '📻 Jackson');
      }
    }
  }

  // ── On the cameras ────────────────────────────────────────────────────

  updateCams(dt) {
    const c = this.cams[this.camI];
    this.cam.position.copy(c.pos);
    this.cam.lookAt(c.look);
    this.cam.rotateY(Math.sin(this.t * 0.3 + c.n) * 0.22);
    this.static = Math.max(0, this.static - dt * 2.5);
    const off = this.offline(c);
    $('offCamOffline').classList.toggle('hidden', !off);
    const level = off ? 1 : Math.min(1, 0.1 + this.static + (Math.random() < 0.02 ? 0.3 : 0));
    const n = $('offNoise');
    n.style.opacity = String(0.08 + level * 0.9);
    const d = this.noiseImg.data;
    for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    this.nctx.putImageData(this.noiseImg, 0, 0);
    $('offCamClock').textContent = this.mode.timeText();
    $('offCamPower').textContent = `${Math.ceil(this.power)}%`;
    const kid = off ? null : this.def.kids.find((k) => k.cam === c.n && this.t >= k.from && this.t <= k.to && !this.spotted.has(k.key || k.who));
    const tag = $('offCamSpot');
    tag.classList.toggle('hidden', !kid);
    if (kid) tag.textContent = `👀 Is that ${this.mode.people[kid.who].name}?!`;
  }

  updateUI() {
    $('offPower').textContent = `${Math.ceil(this.power)}%`;
    $('offPower').classList.toggle('low', this.power < 20);
    $('offUsage').innerHTML = '▮'.repeat(this.usage || 1) + '<i>' + '▮'.repeat(5 - (this.usage || 1)) + '</i>';
    $('offDoorL').classList.toggle('on', this.doors.left);
    $('offDoorR').classList.toggle('on', this.doors.right);
    $('offLightL').classList.toggle('on', this.lights.left);
    $('offLightR').classList.toggle('on', this.lights.right);
    $('offCamsBtn').classList.toggle('on', this.camsUp);
    const at = this.bots.find((b) => b.state === 'door' && this.lights[b.side]);
    const running = this.run && this.run.state === 'running';
    let t = '';
    if (this.out) t = '';
    else if (running) t = `🏃 ${this.runner.name.toUpperCase()} IS RUNNING UP THE ${this.def.runner.side === 'left' ? 'WEST' : 'EAST'} HALL — SHUT THE ${this.def.runner.side.toUpperCase()} DOOR!`;
    else if (at) t = `😱 ${at.name.toUpperCase()} IS AT THE ${at.side.toUpperCase()} DOOR — SHUT IT!`;
    else if (this.power < 15) t = '⚡ Power is running low! Shut the doors only when you have to.';
    const el = $('offHint');
    if (el.textContent !== t) el.textContent = t;
    el.classList.toggle('hot', !!at || running);
  }

  // ── John on the phone ─────────────────────────────────────────────────
  //
  // Each of his calls is a few lines at set times into the chapter: the phone rings first.

  updateCalls() {
    const calls = this.lv.def.calls || this.def.calls;     // (the chapter's own, at its top level)
    if (!calls || this.callI >= calls.length || this.out) return;
    const [at, text] = calls[this.callI];
    if (this.t < at) return;
    if (this.callI === 0) sfx.ring();
    else sfx.plexWalkie();
    this.mode.say(text, Math.max(3.4, 1.6 + text.length * 0.055), '📞 John');
    this.callI++;
  }

  // ── Flipper, in the ball pit ──────────────────────────────────────────

  placeRunner() {
    const R = this.def.runner, r = this.runner, k = Math.min(1, this.run.k / 100);
    const a = this.P(...R.pit), b = this.P(...R.edge);
    r.pos.copy(a).lerp(b, k);
    // he comes up out of the balls as he gets ready (at rest, just his head shows)
    r.root.position.set(r.pos.x, -0.5 + Math.min(1, k * 1.6) * 0.5, r.pos.z);
    r.yaw = R.yaw ?? Math.PI;
    r.root.rotation.set(0, r.yaw, 0);
  }

  updateRunner(dt) {
    const R = this.def.runner, run = this.run, r = this.runner;
    if (run.state === 'pit') {
      if (this.t < (R.from || 0)) { this.placeRunner(); return; }
      // watching his camera keeps him in the pit (and pushes him back down)
      if (this.watching(R.cam)) run.k = Math.max(0, run.k - R.back * dt);
      else run.k += (100 / R.patience) * this.game.diff.speed * dt;
      const stage = Math.floor(run.k / 34);
      if (stage > (run.stage || 0)) { sfx.plexCreak(); run.stage = stage; }
      if (stage < (run.stage || 0)) run.stage = stage;
      this.placeRunner();
      poseRig(r.rig, run.k > 66 ? 'stare' : 'idle', this.t, 0.4, dt);
      if (run.k >= 100) {
        run.state = 'running';
        run.t = 0;
        const hall = this.P(...R.hall);
        sfx.plexRun(hall);
        r.pos.copy(hall);
        r.root.position.set(hall.x, 0, hall.z);
        r.root.rotation.set(0, R.hallYaw ?? 0, 0);
      }
      return;
    }
    // running up the hall: a couple of seconds to shut that door
    run.t += dt;
    poseRig(r.rig, 'chase', this.t * 10, 1, dt);
    if (run.t < R.runTime) return;
    if (this.doors[R.side]) {
      sfx.plexKnock(this.P(...this.def.seat));
      setTimeout(() => sfx.pound(this.P(...this.def.seat)), 450);
      run.state = 'pit';
      run.k = R.reset ?? 10;
      run.stage = 0;
      this.placeRunner();
      this.mode.check('runner');
    } else {
      r.root.visible = false;
      this.get(r, `${r.name} ran right into the office!`);
    }
  }

  // ── Chomper chews the wires ───────────────────────────────────────────

  chew(n) {
    const C = this.def.chew;
    const was = this.offline(this.cams.find((c) => c.n === n) || this.cams[0]);
    this.chewed[n] = C.dur;
    if (!was) {
      sfx.chew(this.P(...this.def.seat));
      this.game.hud.toast(`🦫 Something chewed through the wires to CAM ${String(n).padStart(2, '0')}!`, 2.6);
      if (this.watching(n) || (this.camsUp && this.cams[this.camI].n === n)) this.static = 1;
      if (this.camsUp) this.refreshCam();
    }
  }

  updateChew(dt) {
    const C = this.def.chew;
    let changed = false;
    for (const n of Object.keys(this.chewed)) {
      if (this.chewed[n] > 0) { this.chewed[n] -= dt; if (this.chewed[n] <= 0) { changed = true; delete this.chewed[n]; } }
    }
    this.chewT -= dt;
    if (this.chewT <= 0) {
      this.chewT = C.every * (0.75 + Math.random() * 0.5);
      const pool = this.cams.filter((c) => !this.offline(c) && !(C.spare || []).includes(c.n));
      if (pool.length) this.chew(pool[Math.floor(Math.random() * pool.length)].n);
    }
    if (changed && this.camsUp) this.refreshCam();
  }

  // Gotcha.
  get(who, why) {
    const m = this.mode;
    if (m.grace > 0) return;
    this.setCams(false, true);
    if (who.state === 'in' || who.state === 'door') { who.root.visible = true; }
    m.caught(who, why || `${who.name} got into the office.`);
    if (m.game.mode === 'escape') {
      // a second chance: it goes all the way back
      if (who === this.runner) { this.run.state = 'pit'; this.run.k = 0; this.runner.root.visible = true; this.placeRunner(); return; }
      if (who !== this.gus) { who.stop = 0; who.state = 'route'; this.placeBot(who); }
      return;
    }
    stopMusicBox();
    this.ui.classList.add('hidden');
    for (const b of this.bots) if (b !== who) b.root.visible = false;
  }
}
