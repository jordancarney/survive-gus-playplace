// The Gus Watch: the toy smartwatch on little Jonathan's wrist. Press G (or ⌚ on a touch
// screen) to hold it up. It has three pages — Quests (what to do, and what's done), Map (the
// level from above: you, Jack, every monster, the things to find, the save boxes, the exit and
// where your quests are) and the Entity Tracker (the designer's idea: everything in the level,
// where it is and what it's doing) — and a small face that's always in the corner with the
// time, what to do next, and the closest monster.
import { input } from '../input.js';
import { sfx } from '../audio.js';

const $ = (id) => document.getElementById(id);

// What the Entity Tracker calls each monster, and its little picture.
export const ENTITY = {
  nightbot: ['🤖', 'Night Bot'], pjork: ['🐷', 'Pjork'], librarian: ['📚', 'Librarian'],
  custodian: ['🧹', 'Custodian'], nurse: ['🏥', 'Nurse Bot'], cop: ['👮', 'Mall Cop Bot'],
  guard: ['💂', 'Guard Bot'], statue: ['🗿', 'Statue'], ticket: ['🎟️', 'Ticket Bot'], babygus: ['🍼', 'Baby Gus'],
};
const ITEM_ICON = {
  fuse: '🔌', book: '📖', key: '🔑', battery: '🔋', bag: '🗝️', gem: '💎', reel: '🎞️', token: '🪙', slice: '🍕',
  star: '⭐', balloon: '🎈', sock: '🧦', plushie: '🧸',
};

export class GusWatch {
  constructor(mode) {
    this.mode = mode;
    this.open = false;
    this.tab = 'quests';
    this.el = $('gusWatch');
    this.canvas = $('gwMap');
    this.ctx = this.canvas.getContext('2d');
    const pick = (tab) => (e) => { e.preventDefault(); e.stopPropagation(); this.setTab(tab); };
    $('gwTabQuests').addEventListener('pointerdown', pick('quests'));
    $('gwTabMap').addEventListener('pointerdown', pick('map'));
    $('gwTabTracker').addEventListener('pointerdown', pick('tracker'));
    $('gwClose').addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); this.toggle(false); });
  }

  toggle(on = !this.open) {
    this.open = on;
    this.el.classList.toggle('hidden', !on);
    sfx.escWatch();
    if (on) this.render();
  }

  setTab(tab) {
    this.tab = tab;
    $('gwTabQuests').classList.toggle('on', tab === 'quests');
    $('gwTabMap').classList.toggle('on', tab === 'map');
    $('gwTabTracker').classList.toggle('on', tab === 'tracker');
    $('gwQuests').classList.toggle('hidden', tab !== 'quests');
    $('gwTracker').classList.toggle('hidden', tab !== 'tracker');
    this.canvas.classList.toggle('hidden', tab !== 'map');
    sfx.ui();
    this.render();
  }

  update() {
    if (!this.open) return;
    if (input.keyPressed('Digit1') || input.keyPressed('ArrowLeft')) this.setTab('quests');
    if (input.keyPressed('Digit2') || input.keyPressed('KeyM')) this.setTab('map');
    if (input.keyPressed('Digit3') || input.keyPressed('KeyT')) this.setTab('tracker');
    if (input.keyPressed('ArrowRight')) this.setTab(this.tab === 'quests' ? 'map' : 'tracker');
    if (input.keyPressed('ArrowLeft')) this.setTab(this.tab === 'tracker' ? 'map' : 'quests');
    if (this.tab === 'map') this.drawMap();
    // the Entity Tracker keeps itself up to date
    this.refresh = (this.refresh || 0) - 1 / 60;
    if (this.tab === 'tracker' && this.refresh <= 0) { this.refresh = 0.4; this.renderTracker(); }
    $('gwTime').textContent = this.mode.timeText();
  }

  render() {
    $('gwTime').textContent = this.mode.timeText();
    if (this.tab === 'map') { this.drawMap(); return; }
    if (this.tab === 'tracker') { this.renderTracker(); return; }
    const m = this.mode;
    const rows = [];
    for (const q of m.questList()) {
      const prog = m.progressText(q);
      const reward = q.reward && !m.done.has(q.id) ? `<div class="gw-reward">🎁 ${m.rewardName(q.reward)}</div>` : '';
      const tag = q.optional ? (q.secret ? '<span class="gw-tag">SECRET</span>' : '<span class="gw-tag">BONUS</span>') : '';
      rows.push(`<div class="gw-q ${m.done.has(q.id) ? 'done' : ''}">
        <span class="gw-box">${m.done.has(q.id) ? '✅' : '⬜'}</span>
        <span class="gw-text">${tag}${q.text}${prog ? ` <b>${prog}</b>` : ''}${reward}</span></div>`);
    }
    const left = m.hiddenQuestCount();
    if (left) rows.push(`<div class="gw-more">+ ${left} more quest${left > 1 ? 's' : ''} to unlock...</div>`);
    $('gwQuests').innerHTML = rows.join('');
  }

  // The Entity Tracker: every monster (where it is, how far, what it's doing), Jack, the things
  // you still need to find, the nearest save box and the exit.
  renderTracker() {
    const m = this.mode;
    const dist = (v) => Math.round(Math.hypot(v.x - m.player.pos.x, v.z - m.player.pos.z));
    const sec = (title, lines) => (lines.length ? `<div class="gw-tracker"><div class="gw-tracker-head">${title}</div>${lines.join('')}</div>` : '');
    const count = {};
    const monsters = m.tracked().map((e) => {
      const [icon, name] = ENTITY[e.id] || ['👾', e.name];
      const same = m.tracked().filter((x) => x.id === e.id).length;
      count[e.id] = (count[e.id] || 0) + 1;
      const label = same > 1 ? `${name} ${count[e.id]}` : name;
      const st = m.statusOf(e);
      return `<div class="gw-bot ${st.hot ? 'hot' : ''}">${icon} ${label}: <b>${m.roomOf(e.pos)}</b> · ${Math.round(e.distToPlayer())} m · ${st.text}</div>`;
    });
    const jack = m.hiding ? '🧒 Jack: hiding with you' : `🧒 Jack: <b>${m.roomOf(m.jack.pos)}</b> · ${dist(m.jack.pos)} m · right behind you`;
    const wanted = m.decor.items.filter((it) => !it.found && it.kind !== 'plushie' && m.itemWanted(it))
      .sort((a, b) => dist(a.pos) - dist(b.pos));
    const things = wanted.slice(0, 6).map((it) => `<div class="gw-bot">${ITEM_ICON[it.kind] || '✨'} ${cap(it.name)}: <b>${m.roomOf(it.pos)}</b> · ${dist(it.pos)} m</div>`);
    if (wanted.length > 6) things.push(`<div class="gw-more">...and ${wanted.length - 6} more</div>`);
    const save = [...m.decor.saves].sort((a, b) => dist(a.pos) - dist(b.pos))[0];
    const places = [];
    if (save) places.push(`<div class="gw-bot">😁 Nearest save box: <b>${m.roomOf(save.pos)}</b> · ${dist(save.pos)} m</div>`);
    if (m.decor.exit) places.push(`<div class="gw-bot">${m.decor.exit.open ? '🟢' : '🔒'} Exit (${m.decor.exit.open ? 'OPEN' : 'locked'}): <b>${m.roomOf(m.decor.exit.pos)}</b> · ${dist(m.decor.exit.pos)} m</div>`);
    $('gwTracker').innerHTML = sec('👾 MONSTERS', monsters) + sec('🧒 FRIENDS', [`<div class="gw-bot">${jack}</div>`]) +
      sec('⭐ THINGS TO FIND', things) + sec('📍 PLACES', places);
  }

  // The level from above, scaled to fit.
  drawMap() {
    const m = this.mode, place = m.place, g = this.ctx;
    const W = this.canvas.width, H = this.canvas.height;
    g.clearRect(0, 0, W, H);
    const s = Math.min((W - 16) / place.w, (H - 16) / place.h);
    const ox = (W - place.w * s) / 2, oz = (H - place.h * s) / 2;
    const X = (px) => ox + px * s, Z = (pz) => oz + pz * s;
    const plan = (v) => ({ x: v.x + place.ox, z: v.z + place.oz });
    g.fillStyle = '#120a22';
    g.fillRect(0, 0, W, H);
    const here = place.roomAt(m.player.pos.x, m.player.pos.z);
    for (const [id, r] of Object.entries(place.rooms)) {
      g.fillStyle = id === here ? '#4a2a7a' : '#2a1a4a';
      g.fillRect(X(r.x0), Z(r.z0), (r.x1 - r.x0 + 1) * s, (r.z1 - r.z0 + 1) * s);
    }
    for (const d of place.doors) {
      g.fillStyle = '#2a1a4a';
      g.fillRect(X(d.x0), Z(d.z0), (d.x1 - d.x0 + 1) * s, (d.z1 - d.z0 + 1) * s);
    }
    for (const w of place.layout.walls || []) {
      g.fillStyle = '#120a22';
      g.fillRect(X(w.x0), Z(w.z0), (w.x1 - w.x0 + 1) * s, (w.z1 - w.z0 + 1) * s);
    }
    g.font = 'bold 9px sans-serif';
    g.textAlign = 'center';
    g.fillStyle = 'rgba(220, 200, 255, 0.55)';
    for (const r of Object.values(place.rooms)) {
      const w = (r.x1 - r.x0 + 1) * s;
      if (r.mapLabel === false) continue;
      // the room's name if it fits, its short name if that does, and nothing otherwise
      let label = r.name.toUpperCase();
      if (g.measureText(label).width > w - 4) label = (r.short || '').toUpperCase();
      if (!label || g.measureText(label).width > w - 4) continue;
      g.fillText(label, X((r.x0 + r.x1 + 1) / 2), Z(r.z0) + 11);
    }
    const dot = (v, color, r = 3.5) => {
      const p = plan(v);
      g.fillStyle = color;
      g.beginPath(); g.arc(X(p.x), Z(p.z), r, 0, Math.PI * 2); g.fill();
    };
    // the save boxes: little yellow smiles
    for (const sp of m.decor.saves) {
      const p = plan(sp.pos);
      g.fillStyle = '#ffe9a0';
      g.fillRect(X(p.x) - 4, Z(p.z) - 4, 8, 8);
      g.fillStyle = '#111';
      g.fillRect(X(p.x) - 2.5, Z(p.z) - 2, 1.5, 1.5);
      g.fillRect(X(p.x) + 1, Z(p.z) - 2, 1.5, 1.5);
      g.fillRect(X(p.x) - 2.5, Z(p.z) + 1, 5, 1.2);
    }
    if (m.decor.exit) {
      const p = plan(m.decor.exit.pos);
      g.fillStyle = m.decor.exit.open ? '#3cff6b' : '#ff3b30';
      g.fillRect(X(p.x) - 5, Z(p.z) - 3, 10, 6);
    }
    // where your quests are
    for (const t of m.questTargets()) {
      const p = plan(t);
      g.fillStyle = '#ff3fa4';
      g.font = 'bold 13px sans-serif';
      g.fillText('★', X(p.x), Z(p.z) + 4);
    }
    // the things you still need to find (the Entity Tracker shows them all; the designer first
    // asked for the Daycare's fuses)
    {
      for (const it of m.decor.items) {
        if (it.found || it.kind === 'plushie' || !m.itemWanted(it)) continue;
        const p = plan(it.pos);
        g.fillStyle = '#ffd23f';
        g.beginPath();
        const k = 1 + Math.sin(performance.now() / 180) * 0.2;       // a little pulse, so they catch the eye
        g.moveTo(X(p.x), Z(p.z) - 7 * k); g.lineTo(X(p.x) + 5.5 * k, Z(p.z)); g.lineTo(X(p.x), Z(p.z) + 7 * k); g.lineTo(X(p.x) - 5.5 * k, Z(p.z));
        g.fill();
        g.strokeStyle = '#1a0a24'; g.lineWidth = 1.5; g.stroke();
      }
    }
    // the Entity Tracker puts every monster on the map: its picture in a ring — red when
    // it's after you, blue when it's walking, grey when it's asleep or still
    g.font = '11px sans-serif';
    g.textBaseline = 'middle';
    for (const e of m.tracked()) {
      const p = plan(e.pos);
      const x = X(p.x), z = Z(p.z);
      const st = m.statusOf(e);
      g.fillStyle = '#0a0612';
      g.beginPath(); g.arc(x, z, 7, 0, Math.PI * 2); g.fill();
      g.lineWidth = 2;
      g.strokeStyle = st.hot ? '#ff2020' : st.still ? '#6a6a7a' : '#5ad1ff';
      g.stroke();
      g.fillText((ENTITY[e.id] || ['👾'])[0], x, z + 0.5);
    }
    g.textBaseline = 'alphabetic';
    if (m.jack.root.visible) dot(m.jack.pos, '#ff6b6b', 3);
    // you: an arrow pointing the way you're looking
    const p = plan(m.player.pos);
    const f = m.player.forward2();
    const cx = X(p.x), cz = Z(p.z);
    g.fillStyle = '#2de2e6';
    g.beginPath();
    g.moveTo(cx + f.x * 8, cz + f.z * 8);
    g.lineTo(cx - f.x * 4 + f.z * 5, cz - f.z * 4 - f.x * 5);
    g.lineTo(cx - f.x * 4 - f.z * 5, cz - f.z * 4 + f.x * 5);
    g.closePath();
    g.fill();
  }
}

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
