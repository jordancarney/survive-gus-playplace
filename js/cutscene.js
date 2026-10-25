// The cutscene player.
//
// A cutscene is a list of shots played in the real game world: each one moves the camera
// from one spot to another, puts characters where they need to be, and shows a line of
// dialogue typed out letterbox-style. Scripts live in story.js; this module only plays them.
//
// Space / Enter / a click finishes the line or moves to the next shot; Escape or the Skip
// button ends the whole thing.
import { input } from './input.js';
import { poseRig } from './models.js';
import { playMusic, stopMusic } from './audio.js';

const $ = (id) => document.getElementById(id);
export const smooth = (k) => k * k * (3 - 2 * k);

const SPEAKER_COLORS = {
  Jonathan: '#2de2e6', Manager: '#ffd23f', Gus: '#ff9a1f', Gerald: '#ff6b6b',
  Chomper: '#9cff6b', Cranker: '#6fe3ff', Flipper: '#ff7ad1',
  Timmy: '#7cff6b', Gramma: '#ff9ad5', 'Old Gus': '#d9b48a', '???': '#d9b48a',
};

export class Cutscene {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.ui = $('cutscene');
    this.subEl = $('cutSub');
    this.whoEl = $('cutWho');
    this.textEl = $('cutText');
    this.cardEl = $('cutCard');
    this.fadeEl = $('fade');
    this.poses = new Map();
    this.shake = 0;
    $('cutSkip').addEventListener('click', (e) => { e.stopPropagation(); this.finish(); });
    this.ui.addEventListener('click', () => this.advance());
  }

  get P() { return this.game.area.building.P; }

  play(script, done) {
    const g = this.game;
    this.script = script;
    this.done = done;
    this.i = -1;
    this.poses.clear();
    this.shake = 0;
    this.active = true;
    g.setArea(script.area || 'playplace');
    g.showScreen('cutscene');
    this.ui.classList.remove('hidden');
    g.player.vmGroup.visible = false;
    g.player.lightVisible = false;
    g.player.flashlight.intensity = 0;   // the player doesn't update during a cutscene
    if (script.light) g.lighting.set(script.light);
    if (script.music) playMusic(script.music); else stopMusic();
    g.hidePeople();
    if (script.setup) script.setup(g, this);
    this.next();
  }

  next() {
    this.i++;
    const shots = this.script.shots;
    if (this.i >= shots.length) { this.finish(); return; }
    const s = this.shot = shots[this.i];
    this.t = 0;
    const line = s.line || '';
    this.dur = s.dur ?? Math.max(2.6, 1.5 + line.length * 0.055);
    this.typed = 0;
    this.whoEl.textContent = s.who || '';
    this.whoEl.style.color = SPEAKER_COLORS[s.who] || '#ffd23f';
    this.subEl.classList.toggle('hidden', !line);
    this.subEl.classList.toggle('narrator', !s.who);
    this.cardEl.classList.toggle('hidden', !s.card);
    if (s.card) this.cardEl.textContent = s.card;
    this.fadeEl.style.transition = 'none';
    this.fadeEl.style.opacity = s.fade === 'in' ? '1' : '0';
    if (s.start) s.start(this.game, this);
  }

  advance() {
    if (!this.active) return;
    const line = this.shot.line || '';
    if (this.typed < line.length) { this.typed = line.length; return; }
    this.next();
  }

  finish() {
    if (!this.active) return;
    this.active = false;
    this.ui.classList.add('hidden');
    this.fadeEl.style.opacity = '0';
    this.fadeEl.style.transition = '';
    if (this.script.cleanup) this.script.cleanup(this.game, this);
    const done = this.done;
    this.done = null;
    if (done) done();
  }

  // ── Helpers for scripts ───────────────────────────────────────────────
  //
  // Actors are anything with a `root` and a `rig`: an animatronic, or one of the people.

  put(a, px, pz, yaw = 0, y = null) {
    const p = this.P(px, pz);
    const floor = y === null ? this.game.place.floorAt(p.x, p.z) : y;
    a.root.position.set(p.x, floor, p.z);
    a.root.rotation.set(0, yaw, 0);
    a.root.visible = true;
    if (a.pos) a.pos.set(p.x, 0, p.z);
  }

  pose(a, pose, amt = 1) {
    const cur = this.poses.get(a);
    if (cur && cur.pose === pose) { cur.amt = amt; return; }
    this.poses.set(a, { pose, amt, phase: cur ? cur.phase : 0 });
  }

  hide(a) { a.root.visible = false; this.poses.delete(a); }

  // Walk from one plan point to another; k runs 0 → 1.
  walk(a, from, to, k) {
    const e = Math.min(1, Math.max(0, k));
    const px = from[0] + (to[0] - from[0]) * e, pz = from[1] + (to[1] - from[1]) * e;
    this.put(a, px, pz, Math.atan2(to[0] - from[0], to[1] - from[1]));
    this.pose(a, e < 1 ? 'walk' : 'idle', e < 1 ? 1 : 0.3);
  }

  // Turn an actor to face a world point (or another actor).
  face(a, target) {
    const t = target.root ? target.root.position : target;
    a.root.rotation.y = Math.atan2(t.x - a.root.position.x, t.z - a.root.position.z);
  }

  // Turn just the head toward a world point, k of the way.
  headTo(a, target, k = 1) {
    const r = a.root.position;
    const want = Math.atan2(target.x - r.x, target.z - r.z) - a.root.rotation.y;
    let d = want;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    a.rig.head.rotation.y = Math.max(-1.3, Math.min(1.3, d)) * k;
  }

  // ── Update ────────────────────────────────────────────────────────────

  update(dt) {
    if (!this.active) return;
    if (input.keyPressed('Escape')) { this.finish(); return; }
    if (input.keyPressed('Space') || input.keyPressed('Enter')) this.advance();
    if (!this.active) return;
    const s = this.shot;
    const g = this.game;
    this.t += dt;
    const k = Math.min(1, this.t / this.dur);

    if (s.cam) {
      const e = smooth(k);
      const c = s.cam;
      const lerp3 = (a, b) => [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e];
      const [px, pz, py] = lerp3(c.from, c.to || c.from);
      const [lx, lz, ly] = lerp3(c.look, c.lookTo || c.look);
      g.camera.position.copy(this.P(px, pz, py));
      g.camera.lookAt(this.P(lx, lz, ly));
    }
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 1.5);
      const j = this.shake * this.shake * 0.12;
      g.camera.position.x += (Math.random() - 0.5) * j;
      g.camera.position.y += (Math.random() - 0.5) * j;
    }

    for (const [a, st] of this.poses) {
      st.phase += dt * (st.pose === 'walk' ? 9 : 1);
      poseRig(a.rig, st.pose, st.phase, st.amt, dt);
    }
    if (s.update) s.update(g, this, k, dt);

    if (s.fade === 'out') this.fadeEl.style.opacity = String(Math.max(0, (k - 0.6) / 0.4));
    if (s.fade === 'in') this.fadeEl.style.opacity = String(Math.max(0, 1 - k / 0.4));

    const line = s.line || '';
    if (this.typed < line.length) this.typed = Math.min(line.length, this.typed + dt * 45);
    this.textEl.textContent = line.slice(0, Math.floor(this.typed));
    if (this.t >= this.dur && this.typed >= line.length) this.next();
  }
}

export function makePerson(scene, build) {
  const rig = build();
  rig.root.rotation.order = 'YXZ';
  rig.root.visible = false;
  scene.add(rig.root);
  return { root: rig.root, rig };
}

