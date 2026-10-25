// The repair puzzles. Walk up to a broken game, press E, and do one of three things:
//
//   sequence  "Rewire it!"       press the arrows shown, in order
//   simon     "Copy the lights!" watch four lights flash, then repeat the pattern
//   timing    "Hit the green!"   stop a sweeping needle inside the green zone
//
// Fuse boxes are always a longer "Rewire it!". The night keeps running while you work —
// you can't walk, so check the cameras before you start.
import { REPAIR } from './config.js';
import { sfx } from './audio.js';
import { input } from './input.js';

const PAD_COLORS = ['#ff3b30', '#ffd23f', '#3cff6b', '#3ec1d3'];
const CANCEL_KEYS = ['Escape', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE'];

export class Repair {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.ui = document.getElementById('repairUI');
    this.titleEl = document.getElementById('repairTitle');
    this.hintEl = document.getElementById('repairHint');
    this.body = document.getElementById('repairBody');
    this.pads = document.getElementById('repairPads');
    this.pendingTaps = [];
  }

  start(machine, level) {
    this.m = machine;
    this.level = level;
    this.type = machine.fuse ? 'sequence' : machine.type;
    this.active = true;
    this.lock = 0.25;            // ignore the E press that opened it
    this.ui.classList.remove('hidden');
    this.titleEl.textContent = machine.fuse ? 'FIX THE FUSE BOX' : `FIX THE ${machine.name.toUpperCase()}`;
    this.buildPads();
    if (this.type === 'sequence') this.startSequence();
    else if (this.type === 'simon') this.startSimon();
    else this.startTiming();
  }

  close() {
    this.active = false;
    this.ui.classList.add('hidden');
    this.body.innerHTML = '';
  }

  buildPads() {
    this.pads.innerHTML = '';
    const keys = this.type === 'timing' ? ['Space'] : REPAIR.keys;
    const labels = this.type === 'timing' ? ['HIT!'] : REPAIR.arrows;
    keys.forEach((k, i) => {
      const b = document.createElement('button');
      b.className = 'btn btn-ghost';
      b.textContent = labels[i];
      if (this.type === 'simon') { b.style.borderColor = PAD_COLORS[i]; b.style.color = PAD_COLORS[i]; }
      if (this.type === 'timing') b.style.minWidth = '140px';
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); this.pendingTaps.push(k); });
      this.pads.appendChild(b);
    });
    const cancel = document.createElement('button');
    cancel.className = 'btn btn-ghost';
    cancel.textContent = '✕';
    cancel.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); this.cancel(); });
    this.pads.appendChild(cancel);
  }

  // ── Rewire it! ────────────────────────────────────────────────────────

  startSequence() {
    const n = REPAIR.sequenceBase + this.level + (this.m.fuse ? REPAIR.fuseExtra : 0);
    this.seq = Array.from({ length: n }, () => Math.floor(Math.random() * 4));
    this.idx = 0;
    this.hintEl.textContent = 'Rewire it! Press the arrows in order.';
    this.drawSequence();
  }

  drawSequence() {
    this.body.innerHTML = this.seq.map((d, i) =>
      `<div class="arrow ${i < this.idx ? 'done' : i === this.idx ? 'next' : ''}">${REPAIR.arrows[d]}</div>`).join('');
  }

  // ── Copy the lights! ──────────────────────────────────────────────────

  startSimon() {
    const n = REPAIR.simonBase + Math.floor(this.level / 2);
    this.seq = Array.from({ length: n }, () => Math.floor(Math.random() * 4));
    this.body.innerHTML = PAD_COLORS.map((c, i) =>
      `<div class="pad" data-i="${i}" style="background:${c};color:${c}"></div>`).join('');
    this.padEls = [...this.body.querySelectorAll('.pad')];
    this.replay();
  }

  replay() {
    this.idx = 0;
    this.showing = true;
    this.showStep = 0;
    this.showTimer = 0.6;
    this.hintEl.textContent = 'Watch the lights...';
  }

  light(i, on) { this.padEls[i].classList.toggle('lit', on); }

  // ── Hit the green! ────────────────────────────────────────────────────

  startTiming() {
    this.hits = 0;
    this.needle = 0;
    this.dir = 1;
    this.speed = 0.75 + this.level * 0.22;
    this.zoneW = Math.max(0.12, 0.26 - this.level * 0.03);
    this.newZone();
    this.hintEl.textContent = `Hit the green! Press SPACE when the line is in it. (${REPAIR.timingHits} times)`;
    this.body.innerHTML = '<div class="track"><div class="zone"></div><div class="needle"></div></div><div class="hits"></div>';
    this.zoneEl = this.body.querySelector('.zone');
    this.needleEl = this.body.querySelector('.needle');
    this.hitsEl = this.body.querySelector('.hits');
    this.drawTiming();
  }

  newZone() { this.zone = 0.1 + Math.random() * (0.8 - this.zoneW); }

  drawTiming() {
    this.zoneEl.style.left = this.zone * 100 + '%';
    this.zoneEl.style.width = this.zoneW * 100 + '%';
    this.needleEl.style.left = this.needle * 100 + '%';
    this.hitsEl.textContent = '★'.repeat(this.hits) + '☆'.repeat(REPAIR.timingHits - this.hits);
  }

  // ── Shared ────────────────────────────────────────────────────────────

  pressed() {
    const out = [];
    const keys = this.type === 'timing' ? ['Space', ...REPAIR.keys] : REPAIR.keys;
    for (const k of keys) if (input.keyPressed(k)) out.push(k);
    out.push(...this.pendingTaps);
    this.pendingTaps = [];
    return out;
  }

  wrong() {
    sfx.repairBad();
    this.body.classList.remove('shake');
    void this.body.offsetWidth;
    this.body.classList.add('shake');
    this.lock = 0.35;
  }

  done() {
    const m = this.m;
    this.close();
    this.game.onRepaired(m);
  }

  cancel() {
    this.close();
    this.game.onRepairCancelled();
  }

  update(dt) {
    if (!this.active) return;
    if (this.lock > 0) {
      this.lock -= dt;
      this.pendingTaps = [];
      if (this.type === 'timing') this.tickTiming(dt);
      return;
    }
    for (const k of CANCEL_KEYS) if (input.keyPressed(k)) { this.cancel(); return; }
    const presses = this.pressed();

    if (this.type === 'sequence') {
      for (const k of presses) {
        const d = REPAIR.keys.indexOf(k);
        if (d === this.seq[this.idx]) {
          sfx.repairGood(this.idx);
          this.idx++;
          if (this.idx >= this.seq.length) { this.drawSequence(); this.done(); return; }
        } else {
          // Low levels only knock you back a step; higher ones start you over.
          this.idx = this.level >= 3 ? 0 : Math.max(0, this.idx - 1);
          this.wrong();
          break;
        }
      }
      this.drawSequence();
    } else if (this.type === 'simon') {
      if (this.showing) {
        this.showTimer -= dt;
        if (this.showTimer <= 0) {
          const step = this.showStep;
          const gap = Math.max(0.28, 0.5 - this.level * 0.04);
          if (step % 2 === 0) {
            const i = this.seq[step / 2];
            this.light(i, true);
            sfx.simon(i);
            this.showTimer = gap;
          } else {
            this.padEls.forEach((_, i) => this.light(i, false));
            this.showTimer = 0.15;
          }
          this.showStep++;
          if (this.showStep >= this.seq.length * 2) {
            this.showing = false;
            this.hintEl.textContent = 'Your turn! Copy the lights with the arrows.';
          }
        }
        return;
      }
      for (const k of presses) {
        const i = REPAIR.keys.indexOf(k);
        if (i < 0) continue;
        this.padEls.forEach((_, j) => this.light(j, j === i));
        setTimeout(() => this.padEls && this.padEls[i] && this.light(i, false), 180);
        if (i === this.seq[this.idx]) {
          sfx.simon(i);
          this.idx++;
          if (this.idx >= this.seq.length) { this.done(); return; }
        } else {
          this.wrong();
          this.replay();
          this.hintEl.textContent = 'Oops! Watch again...';
          return;
        }
      }
    } else {
      this.tickTiming(dt);
      if (presses.length) {
        if (this.needle >= this.zone && this.needle <= this.zone + this.zoneW) {
          this.hits++;
          sfx.repairGood(this.hits * 2);
          if (this.hits >= REPAIR.timingHits) { this.done(); return; }
          this.newZone();
          this.speed *= 1.1;
        } else {
          this.hits = Math.max(0, this.hits - 1);
          this.wrong();
        }
        this.drawTiming();
      }
    }
  }

  tickTiming(dt) {
    this.needle += this.dir * this.speed * dt;
    if (this.needle > 1) { this.needle = 1; this.dir = -1; }
    if (this.needle < 0) { this.needle = 0; this.dir = 1; }
    this.drawTiming();
  }
}
