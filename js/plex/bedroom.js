// Max's chapters (they play like FNAF 4, the designer's call): you don't walk around. Max
// stands in the middle of the Sleepover Suite and goes to one of four places —
//
//   A / ←  the left door       D / →  the right door
//   W / ↑  the closet          S / ↓  turn round to the bed
//
// and the opposite key goes back to the middle. At a door or the closet, hold SPACE (or the
// 🚪 button) to hold it shut, and hold F (or 🔦) to shine the flashlight.
//
//   The doors   Something comes down each hall. Far away, at the end of the hall, the
//               flashlight finds it — shine it and it backs off. Right outside the door you
//               can't see it, but you can HEAR it breathing: then don't shine the light, hold
//               the door shut until its footsteps go away. Leave it there and it comes in.
//   The closet  A baby Gus is in there, coming a little further out whenever you aren't
//               holding the doors shut.
//   The bed     Tiny Gus plushies climb onto the bed while your back is turned. Turn round
//               and shine the light to scatter them. Three at once and they get you (four,
//               in the chapters with a bigger party).
//   The music   From Chapter 17: a lullaby box on the table in the middle of the room. Wind it
//     box       from the middle (hold SPACE). While it's wound, Gus sleeps on his stage. Let it
//               run down and Gus's own music box starts to play — and he comes for you. Wind
//               it back up quick enough and he goes back.
//
// The chapter gives the numbers (`def.room`): who's in each hall (any animatronic — an
// `id` to build, or a `build` of its own, and `tune` to make that one faster or slower than
// the rest), what's in the closet, how many plushies, the music box. The clock and winning
// are the story mode's.
import * as THREE from 'three';
import { input } from '../input.js';
import { sfx, startMusicBox, stopMusicBox } from '../audio.js';
import { buildAnimatronic, poseRig, setEyes } from '../models.js';
import { buildBabyGus } from '../escape/cast.js';
import { buildPlushGus } from './cast.js';

const $ = (id) => document.getElementById(id);

const SPOTS = ['middle', 'left', 'right', 'closet', 'bed'];

export class Bedroom {
  constructor(mode, lv) {
    this.mode = mode;
    this.lv = lv;
    this.def = lv.def.room;
    const P = lv.place.P;
    const s = this.def.spots;
    // where Max stands, and which way she looks, at each place
    this.views = {
      middle: { pos: P(...s.middle), yaw: 0 },
      left: { pos: P(...s.left), yaw: Math.PI / 2 },
      right: { pos: P(...s.right), yaw: -Math.PI / 2 },
      closet: { pos: P(...s.closet), yaw: 0 },
      bed: { pos: P(...s.middle), yaw: Math.PI },
    };
    // the two things coming down the halls
    this.halls = ['left', 'right'].map((side) => {
      const h = this.def[side];
      const rig = h.build ? h.build() : buildAnimatronic(h.bot, h.old ? { old: true } : undefined);
      rig.root.rotation.order = 'YXZ';
      rig.root.visible = false;
      mode.game.scene.add(rig.root);
      // `R`: this hall's numbers — the room's, with this one's own `tune` on top (Sparky's faster)
      const R = { ...this.def, ...(h.tune || {}) };
      return { side, rig, root: rig.root, id: h.id || h.bot, name: h.name, def: { kind: 'watcher' }, R, cue: h.cue || 'breath', bark: h.bark,
        pos: P(...h.far), far: P(...h.far), yaw: h.yaw, state: 'away', timer: 0, near: 0, held: 0, lit: 0 };
    });
    // the closet's baby Gus, and the plushies on the bed
    const c = this.def.closet;
    const baby = c.build ? c.build() : buildBabyGus(2);
    baby.root.rotation.order = 'YXZ';
    baby.root.visible = false;
    mode.game.scene.add(baby.root);
    this.baby = { rig: baby, root: baby.root, id: c.id || 'babygus', name: c.name || 'the baby Gus', def: { kind: 'watcher' }, pos: P(...c.back), yaw: 0, from: P(...c.back), to: P(...c.front) };
    // the music box's Gus: nowhere to be seen until it runs down
    if (this.def.musicBox) {
      const gus = buildAnimatronic('gus');
      gus.root.rotation.order = 'YXZ';
      gus.root.visible = false;
      mode.game.scene.add(gus.root);
      this.gus = { rig: gus, root: gus.root, id: 'gus', name: 'Gus', def: { kind: 'watcher' }, pos: P(...s.middle), yaw: 0 };
      this.boxAt = P(...(this.def.musicBox.at || s.middle));
    }
    this.plush = this.def.bed.spots.map((p, i) => {
      const r = buildPlushGus(i);
      r.root.visible = false;
      mode.game.scene.add(r.root);
      const at = P(p[0], p[1], p[2]);
      r.root.position.copy(at);
      r.root.rotation.y = p[3] || 0;
      poseRig(r, 'idle', 0, 0.3, 1);
      return r;
    });
    this.makeUI();
  }

  get game() { return this.mode.game; }
  get place() { return this.lv.place; }

  // Two playing (the designer's call: "split the doors"), each of you has your own place in
  // the room and your own half of the screen — one on the left door and the closet, the
  // other on the right door and the bed, or wherever you like. These are whoever's turn it
  // is (`mode.player`, see game.js).
  get st() { const p = this.mode.player; return p.bedroom || (p.bedroom = { spot: 'middle', from: null, k: 1 }); }
  get spot() { return this.st.spot; }
  set spot(v) { this.st.spot = v; }
  get from() { return this.st.from; }
  set from(v) { this.st.from = v; }
  get k() { return this.st.k; }
  set k(v) { this.st.k = v; }
  // (split screen while two are playing — and getting caught gets you both: it's one room)
  get coopView() { return 'split'; }

  // ── The buttons on screen ─────────────────────────────────────────────

  makeUI() {
    if ($('roomUI')) { this.ui = $('roomUI'); return; }
    const ui = document.createElement('div');
    ui.id = 'roomUI';
    ui.className = 'room-ui hidden';
    ui.innerHTML = `
      <div id="roomHint" class="room-hint"></div>
      <div class="room-pad">
        <button class="room-btn" data-go="left">◀<span>Left door</span></button>
        <div class="room-mid">
          <button class="room-btn" data-go="closet">▲<span>Closet</span></button>
          <button class="room-btn small" data-go="middle">●<span>Middle</span></button>
          <button class="room-btn" data-go="bed">▼<span>Bed</span></button>
        </div>
        <button class="room-btn" data-go="right">▶<span>Right door</span></button>
      </div>
      <div id="roomBox" class="hidden" style="position:absolute;left:50%;top:calc(104px + env(safe-area-inset-top));transform:translateX(-50%);width:min(260px,60vw);text-align:center;font-family:var(--ui-font);font-weight:800;font-size:13px;color:#ffe9a0;text-shadow:0 1px 3px #000">
        <div id="roomBoxLabel">🎵 MUSIC BOX</div>
        <div class="bar" style="height:12px;margin-top:3px"><div id="roomBoxFill" class="fill" style="background:#ffd23f"></div></div>
      </div>
      <div class="room-holds">
        <button id="roomHold" class="room-hold">🚪<span id="roomHoldLabel">HOLD SHUT</span><small>SPACE</small></button>
        <button id="roomLight" class="room-hold light">🔦<span>LIGHT</span><small>F</small></button>
      </div>`;
    $('escHud').appendChild(ui);
    this.ui = ui;
    this.held = { hold: false, light: false };
    const g = this.game;
    for (const b of ui.querySelectorAll('[data-go]')) {
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); g.story.ctrl?.go?.(b.dataset.go); });
    }
    const hold = (id, key) => {
      const el = $(id);
      const on = (v) => (e) => { e.preventDefault(); e.stopPropagation(); const c = g.story.ctrl; if (c && c.held) c.held[key] = v; };
      el.addEventListener('pointerdown', on(true));
      for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(ev, on(false));
    };
    hold('roomHold', 'hold');
    hold('roomLight', 'light');
  }

  // ── Starting and stopping ─────────────────────────────────────────────

  start() {
    const m = this.mode;
    this.held = { hold: false, light: false };
    for (const p of m.game.players) {
      m.game.withPlayer(p, () => {
        this.spot = 'middle';
        this.from = { ...this.views.middle, pos: this.views.middle.pos.clone() };
        this.k = 1;
      });
      p.bodyHidden = true;    // (you're both standing in the same few places)
    }
    if (m.game.players.length > 1) m.game.hud.toast('👥 Jonathan\'s side: the LEFT door and the closet. Jimmy\'s side: the RIGHT door and the bed!', 5);
    this.t = 0;
    this.breathT = 0;
    this.atDoor = 0;
    const speed = m.game.diff.speed;
    this.pace = speed;        // Spooky's slower, Nightmare's faster
    for (const h of this.halls) {
      h.state = 'away';
      h.timer = this.def.calm + Math.random() * 6;
      h.near = 0; h.held = 0; h.lit = 0;
      h.root.visible = false;
      setEyes(h.rig, 'on');
    }
    this.closet = 0;
    this.closetDoor = 0;
    this.bedCount = 0;
    this.bedTimer = this.def.bed.first;
    this.bedFull = 0;
    this.placeBaby();
    for (const r of this.plush) r.root.visible = false;
    // the music box starts fully wound
    this.box = 100;
    this.boxOut = 0;
    this.boxLow = false;
    this.lowWound = false;
    this.closetWasOut = false;
    if (this.gus) { this.gus.root.visible = false; setEyes(this.gus.rig, 'on'); }
    stopMusicBox();
    $('roomBox').classList.toggle('hidden', !this.def.musicBox);
    this.ui.classList.remove('hidden');
    this.game.hud.toast(this.def.toast || '🌙 Hold out until 1 AM. Check the doors, the closet AND the bed!', 4.5);
    this.applyView();
  }

  stop() {
    for (const p of this.mode.game.players) p.bodyHidden = false;
    this.ui.classList.add('hidden');
    for (const h of this.halls) h.root.visible = false;
    this.baby.root.visible = false;
    if (this.gus) this.gus.root.visible = false;
    if (this.boxOut > 0) stopMusicBox();
    this.boxOut = 0;
    for (const r of this.plush) r.root.visible = false;
    const p = this.mode.player;
    p.lightOn = false;
  }

  resize() {}

  // ── Moving between the four places ────────────────────────────────────

  go(where) {
    if (!SPOTS.includes(where) || where === this.spot) return;
    // from a door or the closet, any other way is back to the middle first
    if (this.spot !== 'middle' && this.spot !== 'bed' && where !== 'middle') where = 'middle';
    if (this.spot === 'bed' && where !== 'middle' && where !== 'bed') where = 'middle';
    const v = this.current();
    this.from = { pos: v.pos.clone(), yaw: v.yaw };
    this.spot = where;
    this.k = 0;
    this.atDoor = 0;
    sfx.escHide();
  }

  current() {
    const a = this.from, b = this.views[this.spot];
    const k = this.k * this.k * (3 - 2 * this.k);
    let dy = b.yaw - a.yaw;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    return { pos: a.pos.clone().lerp(b.pos, k), yaw: a.yaw + dy * k };
  }

  applyView() {
    const p = this.mode.player;
    const v = this.current();
    p.pos.set(v.pos.x, 0, v.pos.z);
    p.yaw = v.yaw + Math.sin(this.t * 0.7) * 0.015;
    p.pitch = this.spot === 'bed' ? -0.28 : this.spot === 'closet' ? -0.05 : -0.04;
    p.height = p.S.eyeHeight;
    p.updateCamera();
  }

  // ── Update ────────────────────────────────────────────────────────────

  update(dt) {
    const m = this.mode, g = this.game;
    this.t += dt;
    // `S`: where everyone is and what they're doing, put together — a door's held if either
    // of you is holding it
    const S = { here: new Set(), hold: new Set(), lit: new Set(), wind: false, bed: false, bedLit: false };
    const ps = g.players.length > 1 ? g.alive() : [m.player];
    for (const p of ps) g.withPlayer(p, () => this.turn(dt, p, S));
    this.updateHalls(dt, S);
    if (m.game.mode !== 'escape') return;
    this.updateCloset(dt, S.hold.has('closet'));
    if (m.game.mode !== 'escape') return;
    this.updateBed(dt, S);
    if (m.game.mode !== 'escape') return;
    if (this.def.musicBox) { this.updateBox(dt, S.wind); if (m.game.mode !== 'escape') return; }
    this.updateDoors(dt, S);
    if (ps.length === 1) g.withPlayer(ps[0], () => this.hint(S.hold.has(this.spot)));
  }

  // One of you: the keys, where you're standing, what you're holding.
  turn(dt, p, S) {
    const ctl = p.ctl;
    this.k = Math.min(1, this.k + dt / 0.32);
    // (playing alone, the on-screen buttons are yours; two playing, they're player 1's)
    const btn = p.index === 0 ? this.held : {};
    const key = (a, code) => ctl.pressed(a) || ctl.keyPressed(code);
    if (key('left', 'ArrowLeft')) this.go(this.spot === 'right' ? 'middle' : 'left');
    if (key('right', 'ArrowRight')) this.go(this.spot === 'left' ? 'middle' : 'right');
    if (key('forward', 'ArrowUp')) this.go(this.spot === 'bed' ? 'middle' : 'closet');
    if (key('back', 'ArrowDown')) this.go(this.spot === 'closet' ? 'middle' : 'bed');
    const arrived = this.k >= 1;
    const space = ctl.keyHeld ? ctl.keyHeld('Space') : input.keysHeld.has('Space');
    const pushing = arrived && (space || ctl.down('interact') || btn.hold);
    const holding = pushing && this.spot !== 'middle' && this.spot !== 'bed';
    // (in the middle, the same button winds the music box, when there is one)
    const winding = pushing && this.spot === 'middle' && !!this.def.musicBox;
    const lit = arrived && (ctl.down('flashlight') || btn.light);
    this.holding = holding;
    this.winding = winding;
    p.lightOn = lit && !holding;
    p.battery = 100;
    p.lightVisible = true;
    p.flash(dt);
    p.vmGroup.visible = true;
    ctl.drainLook();
    this.applyView();
    if (arrived) S.here.add(this.spot);
    if (holding) S.hold.add(this.spot);
    if (arrived && p.lightOn) S.lit.add(this.spot);
    if (winding) S.wind = true;
    if (arrived && this.spot === 'bed') { S.bed = true; if (p.lightOn) S.bedLit = true; }
    p.roomHint = this.hintText(holding, winding, p);
  }

  // What to do here, in a few words (two playing: in your own half).
  hintText(holding, winding, p) {
    const two = this.game.players.length > 1;
    const k = two ? (p.index === 0 ? { lr: 'A / D', c: 'W', b: 'S', h: 'E' } : { lr: '← / →', c: '↑', b: '↓', h: '/' }) : null;
    if (this.spot === 'left' || this.spot === 'right') return holding ? '🚪 Holding the door shut...' : `👂 Breathing? Hold it shut${k ? ` (${k.h})` : ''}. Far away? Shine the light.`;
    if (this.spot === 'closet') return holding ? '🚪 Holding the closet shut...' : '🚪 Hold the closet shut to push it back in';
    if (this.spot === 'bed') return this.bedCount ? `🧸 ${this.bedCount} on the bed! Shine the light!` : '🛏️ Nothing on the bed... yet';
    if (!k) return '';
    return winding ? '🎵 Winding the music box...' : `${k.lr}: doors · ${k.c}: closet · ${k.b}: bed`;
  }

  paneInfo(p) { return { weapons: false, box: null, status: p.roomHint || '', alert: '', danger: 0 }; }

  // Each hall: away → at the far end (shine the light!) → right outside (listen... hold it
  // shut!) → in.
  updateHalls(dt, S) {
    for (const h of this.halls) {
      const R = h.R;
      const here = S.here.has(h.side), lit = S.lit.has(h.side), holding = S.hold.has(h.side);
      h.timer -= dt * this.pace;
      if (h.state === 'away' && h.timer <= 0) {
        h.timer = R.step + Math.random() * R.step;
        if (Math.random() < R.come) {
          h.state = 'far'; h.lit = 0; sfx.plexClunk();
          if (h.bark) setTimeout(() => sfx.plexBark(), 300);
        }
      } else if (h.state === 'far') {
        if (here && lit) {
          h.lit += dt;
          if (h.lit > R.flashToScare) { h.state = 'away'; h.timer = R.step * 1.2; sfx.plexScurry(); this.mode.check('flash'); }
        } else if (h.timer <= 0) {
          h.timer = R.step;
          if (Math.random() < R.closer) { h.state = 'near'; h.near = 0; h.held = 0; sfx.plexClunk(); }
        }
      } else if (h.state === 'near') {
        h.near += dt * this.pace;
        if (here && lit && !holding) { this.get(h, `You shone the light in ${h.name}'s face!`); return; }
        if (here && holding) {
          h.held += dt;
          if (Math.random() < dt * 1.2) sfx.pound(this.views[h.side].pos);
          if (h.held > R.holdToSend) { h.state = 'away'; h.timer = R.step * 1.5; sfx.plexScurry(); this.mode.check('door'); }
        }
        if (h.near > R.nearMax) { this.get(h, `${cap(h.name)} came in through the ${h.side} door.`); return; }
      }
      // what you can see: only the far end of the hall
      h.root.visible = h.state === 'far';
      if (h.state === 'far') {
        h.root.position.set(h.far.x, 0, h.far.z);
        h.root.rotation.set(0, h.yaw, 0);
        poseRig(h.rig, 'stare', this.t, 0.6, dt);
      }
    }
    // breathing, when you're standing at a door with something right outside it
    const at = this.halls.find((h) => S.here.has(h.side) && h.state === 'near') || this.halls.find((h) => S.here.has(h.side));
    this.atDoor = at ? this.atDoor + dt : 0;
    this.breathT -= dt;
    // (the old ones don't breathe: they knock)
    if (at && at.state === 'near' && this.atDoor > 0.6 && this.breathT <= 0) {
      if (at.cue === 'knock') { sfx.plexKnock(this.views[at.side].pos); this.breathT = 1.9; }
      else { sfx.plexBreath(S.hold.has(at.side) ? 0.6 : 1); this.breathT = 2.4; }
    }
  }

  // The closet: further out every second you aren't holding it shut.
  updateCloset(dt, holding) {
    const C = this.def.closet;
    if (this.t > C.start) {
      if (holding) {
        if (this.closet > 45) this.closetWasOut = true;
        this.closet = Math.max(0, this.closet - C.push * dt);
        if (this.closet === 0 && this.closetWasOut) { this.closetWasOut = false; this.mode.check('closet'); }
      } else this.closet = Math.min(100, this.closet + C.rate * this.pace * dt);
    }
    const before = Math.floor(this.closetStage || 0);
    this.closetStage = this.closet / 34;
    if (Math.floor(this.closetStage) > before && !holding) sfx.plexCreak();
    if (this.closet >= 100) { this.get(this.baby, `${cap(this.baby.name)} got out of the closet!`); return; }
    this.placeBaby();
    // the doors stand open as far as it's pushed them
    const want = holding ? 0 : Math.min(1, this.closet / 70);
    this.closetDoor += (want - this.closetDoor) * Math.min(1, dt * 6);
    const d = this.lv.decor.closetDoors;
    if (d) { d[0].rotation.y = -this.closetDoor * 1.2; d[1].rotation.y = this.closetDoor * 1.2; }
  }

  placeBaby() {
    const b = this.baby, k = Math.min(1, this.closet / 100);
    b.root.visible = this.closet > 20;
    b.pos.copy(b.from).lerp(b.to, k);
    b.root.position.set(b.pos.x, 0, b.pos.z);
    b.root.rotation.set(0, 0, 0);
    poseRig(b.rig, k > 0.6 ? 'stare' : 'idle', this.t, 0.4, 1 / 60);
  }

  // The bed: plushies, while you're looking somewhere else.
  updateBed(dt, S) {
    const B = this.def.bed;
    const flashing = S.bedLit;
    if (flashing && this.bedCount > 0) {
      for (let i = 0; i < this.bedCount; i++) setTimeout(() => sfx.plexPlop(), i * 90);
      this.bedCount = 0;
      this.bedFull = 0;
      this.mode.check('bed');
    }
    const most = B.max || 3;
    if (!S.bed) {
      this.bedTimer -= dt * this.pace;
      if (this.bedTimer <= 0 && this.bedCount < most) {
        this.bedCount++;
        this.bedTimer = B.every + Math.random() * B.every * 0.5;
        sfx.plexPlop();
      }
    }
    if (this.bedCount >= most) {
      this.bedFull += dt;
      if (this.bedFull > B.grace) { this.get(this.baby, `${most === 4 ? 'Four' : 'Three'} Gus plushies on the bed — they got you!`); return; }
    }
    this.plush.forEach((r, i) => { r.root.visible = i < this.bedCount; });
  }

  // The music box: winding down all the time, wound back up while you hold SPACE in the
  // middle. Empty, Gus's music box starts to play somewhere behind you — wind it back up in
  // time and it stops; don't, and Gus comes.
  updateBox(dt, winding) {
    const B = this.def.musicBox;
    const was = this.box;
    if (winding) {
      this.box = Math.min(100, this.box + B.wind * dt);
      if (Math.random() < dt * 6) sfx.plexWind();
      if (this.box >= 100 && was < 100 && this.lowWound) { this.lowWound = false; this.mode.check('wind'); }
    } else if (this.t > (B.start || 0)) this.box = Math.max(0, this.box - B.drain * this.pace * dt);
    if (this.box < 35) this.lowWound = true;
    // nearly empty: a warning
    if (this.box < 20 && !this.boxLow && this.boxOut === 0) { this.boxLow = true; sfx.musicBoxSting(); this.game.hud.toast('🎵 The music box is running down! Wind it up (middle, hold SPACE)!', 3); }
    if (this.box > 30) this.boxLow = false;
    if (this.box <= 0 && this.boxOut === 0) {
      this.boxOut = 0.001;
      startMusicBox(() => this.boxAt);
    }
    if (this.boxOut > 0) {
      if (this.box > 15) {
        this.boxOut = 0;
        stopMusicBox();
        sfx.plexScurry();
      } else {
        this.boxOut += dt;
        if (this.boxOut > B.grace) { stopMusicBox(); this.get(this.gus, 'The music box ran down, and Gus woke up.'); return; }
      }
    }
    // the crank turns while you wind
    const crank = this.lv.decor.musicCrank;
    if (crank && winding) crank.rotation.x += dt * 8;
    const fill = $('roomBoxFill');
    fill.style.width = `${this.box}%`;
    fill.style.background = this.box < 20 ? '#ff3b30' : this.box < 45 ? '#ff9a1f' : '#ffd23f';
    $('roomBoxLabel').textContent = this.boxOut > 0 ? '🎵 GUS IS COMING — WIND IT UP!' : winding ? '🎵 Winding...' : '🎵 MUSIC BOX';
  }

  // The door leaves swing shut while you hold them.
  updateDoors(dt, S) {
    const doors = this.lv.decor.roomDoors;
    if (!doors) return;
    for (const [side, d] of Object.entries(doors)) {
      const shut = S.hold.has(side) ? 1 : 0;
      d.k = (d.k ?? 0) + (shut - (d.k ?? 0)) * Math.min(1, dt * 12);
      d.pivot.rotation.y = d.open * (1 - d.k);
      if (shut && !d.wasShut) sfx.plexDoor();
      d.wasShut = shut;
    }
  }

  // What to do here, in a word.
  hint(holding) {
    const el = $('roomHint');
    let t = '';
    if (this.spot === 'left' || this.spot === 'right') t = holding ? '🚪 Holding the door shut...' : '👂 Listen... breathing means it\'s RIGHT THERE. Far away? Shine the light.';
    else if (this.spot === 'closet') t = holding ? '🚪 Holding the closet shut...' : '🚪 Hold the closet shut to push it back in';
    else if (this.spot === 'bed') t = this.bedCount ? `🧸 ${this.bedCount} on the bed! Shine the light!` : '🛏️ Nothing on the bed... yet';
    else if (this.def.musicBox) t = this.winding ? '🎵 Winding the music box...' : 'A / D: doors · W: closet · S: bed · hold SPACE: wind the music box';
    else t = 'A / D: doors · W: closet · S: bed';
    if (el.textContent !== t) el.textContent = t;
    for (const b of this.ui.querySelectorAll('[data-go]')) b.classList.toggle('on', b.dataset.go === this.spot);
    const wind = this.spot === 'middle' && !!this.def.musicBox;
    $('roomHold').classList.toggle('on', holding || this.winding);
    $('roomHold').classList.toggle('off', (this.spot === 'middle' && !wind) || this.spot === 'bed');
    const label = wind ? 'WIND IT UP' : 'HOLD SHUT';
    if ($('roomHoldLabel').textContent !== label) $('roomHoldLabel').textContent = label;
    $('roomLight').classList.toggle('on', this.mode.player.lightOn);
  }

  // Gotcha. Whatever it was rushes you — unless it's your second chance (Spooky, or the
  // lucky coin), and then it backs off and you keep going.
  get(who, why) {
    const m = this.mode;
    if (m.grace > 0) return;
    m.caught(who, why);
    if (m.game.mode === 'escape') { this.backOff(who); return; }
    if (this.boxOut > 0) stopMusicBox();
    this.ui.classList.add('hidden');
    for (const h of this.halls) if (h !== who) h.root.visible = false;
  }

  backOff(who) {
    if (this.halls.includes(who)) { who.state = 'away'; who.timer = who.R.step * 2; who.near = 0; }
    if (who === this.baby) { this.closet = Math.min(this.closet, 25); this.bedCount = 0; this.bedFull = 0; }
    if (who === this.gus) { this.box = 60; this.boxOut = 0; stopMusicBox(); }
  }
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export { THREE };
