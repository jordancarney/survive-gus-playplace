// The office phone: type Timmy's gramma's number on the keyboard (or tap the keypad).
//
// Number keys dial, Backspace takes one back, Escape hangs up. Get all ten digits right and
// it rings; get one wrong and it beeps and clears so you can try again.
import { input, exitPointerLock } from './input.js';
import { sfx } from './audio.js';

const $ = (id) => document.getElementById(id);
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

export class Phone {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.ui = $('phoneUI');
    this.display = $('phoneDisplay');
    this.status = $('phoneStatus');
    this.taps = [];
    const pad = $('phoneKeys');
    for (const k of KEYS) {
      const b = document.createElement('button');
      b.className = 'btn btn-ghost';
      b.textContent = k;
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); this.taps.push(k); });
      pad.appendChild(b);
    }
    $('phoneDel').addEventListener('pointerdown', (e) => { e.preventDefault(); this.taps.push('del'); });
    $('phoneHang').addEventListener('pointerdown', (e) => { e.preventDefault(); this.close(); });
  }

  // When Jonathan Was Five uses it as the library's door keypad: `opts` changes what it says
  // and whether it rings.
  open(number, label, onConnect, { prompt = 'Type the number on your keyboard', success = 'Ringing...', ring = true } = {}) {
    this.number = number.replace(/\D/g, '');
    this.promptText = prompt;
    this.successText = success;
    this.rings = ring;
    this.onConnect = onConnect;
    this.typed = '';
    this.ringing = 0;
    this.wrongTimer = 0;
    this.lock = 0.2;          // ignore the E that opened it
    this.active = true;
    $('phoneNote').innerHTML = `📝 ${label}<br><b>${number}</b>`;
    this.status.textContent = this.promptText;
    this.ui.classList.remove('hidden');
    exitPointerLock();
    this.draw();
  }

  close() {
    if (!this.active) return;
    this.active = false;
    this.ui.classList.add('hidden');
  }

  draw() {
    const d = this.typed;
    const fmt = [d.slice(0, 3), d.slice(3, 6), d.slice(6)].filter(Boolean).join('-');
    this.display.textContent = fmt || '_';
  }

  press(k) {
    if (this.ringing > 0 || this.wrongTimer > 0) return;
    if (k === 'del') { this.typed = this.typed.slice(0, -1); this.draw(); return; }
    if (!/\d/.test(k)) { sfx.dtmf(k); return; }
    sfx.dtmf(k);
    this.typed += k;
    this.draw();
    if (this.typed.length < this.number.length) return;
    if (this.typed === this.number) {
      this.ringing = this.rings ? 3.2 : 1.2;
      this.status.textContent = this.successText;
      if (this.rings) sfx.ring(); else sfx.escUnlock();
    } else {
      this.wrongTimer = 1.6;
      this.status.textContent = this.rings ? 'Hmm, wrong number! Check the note and try again.' : 'BZZT! Wrong code. Check the note and try again.';
      sfx.repairBad();
    }
  }

  update(dt) {
    if (!this.active) return;
    if (this.lock > 0) { this.lock -= dt; this.taps = []; return; }
    if (input.keyPressed('Escape')) { this.close(); return; }
    if (input.keyPressed('Backspace')) this.press('del');
    for (let i = 0; i <= 9; i++) {
      if (input.keyPressed('Digit' + i) || input.keyPressed('Numpad' + i)) this.press(String(i));
    }
    for (const k of this.taps) this.press(k);
    this.taps = [];
    if (this.wrongTimer > 0) {
      this.wrongTimer -= dt;
      if (this.wrongTimer <= 0) { this.typed = ''; this.draw(); this.status.textContent = this.promptText; }
    }
    if (this.ringing > 0) {
      const before = this.ringing;
      this.ringing -= dt;
      if (this.rings && before > 1.6 && this.ringing <= 1.6) sfx.ring();
      if (this.ringing <= 0) {
        this.close();
        if (this.onConnect) this.onConnect();
      }
    }
  }
}
