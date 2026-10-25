// HUD updates and the content of every menu screen.
import {
  KEYMAP, MOUSE_HELP, moodOf, ANIMATRONICS, ANIMATRONIC_ORDER, NIGHTS, MANAGER_NOTES,
  unlocksAt, weaponById, wakeHour, LAST_STORY_NIGHT,
} from './config.js';

const $ = (id) => document.getElementById(id);
const ICONS = { taser: '⚡', baseball: '⚾', knife: '🔪', magnum: '🔫' };

export class Hud {
  constructor(game) {
    this.game = game;
    this.el = $('hud');
    this.toastEl = $('toast');
    this.toastTimer = 0;
    this.lastSlots = '';
    this.renderControls($('controlsList'));
    this.renderControls($('howtoList'));
  }

  show(on) { this.el.classList.toggle('hidden', !on); }

  toast(text, secs = 2.6) {
    this.toastEl.textContent = text;
    this.toastEl.classList.add('show');
    this.toastTimer = secs;
  }

  hitmark() {
    const c = $('crosshair');
    c.style.background = '#ffd23f';
    setTimeout(() => { c.style.background = ''; }, 120);
  }

  flashHit() {
    const f = $('hitFlash');
    f.style.transition = 'none';
    f.style.opacity = '0.5';
    f.style.background = '#ff2020';
    requestAnimationFrame(() => { f.style.transition = 'opacity 0.5s'; f.style.opacity = '0'; });
  }

  prompt(html) {
    const p = $('prompt');
    if (!html) { p.classList.add('hidden'); $('crosshair').classList.remove('can-use'); return; }
    p.innerHTML = html;
    p.classList.remove('hidden');
    $('crosshair').classList.add('can-use');
  }

  renderControls(el) {
    const rows = [
      ...Object.values(KEYMAP).map((d) => [d.label, d.show]),
      ...MOUSE_HELP.map((d) => [d.label, d.show]),
    ];
    el.innerHTML = rows.map(([l, k]) => `<span class="key">${k}</span><span>${l}</span>`).join('');
  }

  // ── Per-frame ─────────────────────────────────────────────────────────

  update(dt) {
    const g = this.game;
    const p = g.player;
    const night = g.night;
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) this.toastEl.classList.remove('show');
    }
    const day = g.mode === 'day';
    const h = day ? g.profile.happiness : night.happiness;
    const mood = moodOf(h);
    $('happyFill').style.width = h + '%';
    $('happyFace').textContent = mood.face;
    $('happyMood').textContent = `${mood.name} (${Math.round(h)})`;
    $('happyMood').style.color = mood.color;

    $('clock').textContent = day ? 'DAYTIME' : night.clockText();
    $('nightTag').textContent = day ? `BEFORE NIGHT ${g.profile.night}` : `NIGHT ${night.n}`;

    $('batteryFill').style.width = p.battery + '%';
    $('batteryFill').style.background = p.battery < 20 ? '#ff3b30' : '';
    $('staminaFill').style.width = (p.stamina / p.maxStamina) * 100 + '%';
    $('staminaFill').style.background = p.winded ? '#ff3b30' : '';

    // Weapon slots
    const slots = p.weapons.map((id, i) => `${id}${i === p.slot ? '*' : ''}`).join(',');
    if (slots !== this.lastSlots) {
      this.lastSlots = slots;
      $('weaponSlots').innerHTML = p.weapons.map((id, i) =>
        `<div class="slot ${i === p.slot ? 'on' : ''}"><span class="n">${i + 1}</span>${ICONS[id]}</div>`).join('');
    }
    const w = p.weapon;
    $('weaponName').textContent = p.carrying ? `DRAGGING ${p.carrying.name.toUpperCase()}` : w.name.toUpperCase();
    let charge = 1, info = '';
    if (w.id === 'taser') { charge = 1 - p.cool.taser / p.taserCool; info = charge >= 1 ? 'Ready' : 'Recharging...'; }
    else if (w.id === 'knife') { charge = 1 - p.cool.knife / weaponById('knife').cooldown; info = 'Get close'; }
    else if (w.id === 'baseball') { charge = p.balls / weaponById('baseball').count; info = `${p.balls} left — walk over thrown balls to pick them up`; }
    else if (w.id === 'magnum') { charge = Math.min(1, p.ammo / weaponById('magnum').ammo); info = `${p.ammo} shots`; }
    $('chargeFill').style.width = Math.max(0, Math.min(1, charge)) * 100 + '%';
    $('weaponInfo').textContent = info;

    // Objective line (top right)
    $('objective').innerHTML = this.objective();
    const alert = $('alertTag');
    const chasing = g.allBots().filter((a) => ['chase', 'hunt', 'slide', 'windup', 'notice'].includes(a.state) && a.root.visible && g.mode === 'night');
    if (!night.power && g.mode === 'night' && night.boss !== 'gus' && night.boss !== 'junk') {
      alert.textContent = 'POWER OUT — FIX THE FUSE BOX';
      alert.classList.remove('hidden');
    } else if (chasing.length) {
      alert.textContent = `${chasing[0].name.toUpperCase()} IS AFTER YOU!`;
      alert.classList.remove('hidden');
    } else alert.classList.add('hidden');

    // Red edges when something dangerous is close.
    let danger = 0;
    if (g.mode === 'night') {
      for (const a of g.allBots()) {
        if (!a.dangerous || !a.root.visible) continue;
        const d = a.distToPlayer();
        if (d < 9) danger = Math.max(danger, 1 - d / 9);
      }
    }
    $('danger').style.opacity = String(danger * 0.9);

    const carry = $('carryTag');
    if (p.carrying) {
      const left = Math.ceil(p.carrying.timer);
      carry.textContent = `Dragging ${p.carrying.name} — get to Parts & Service! (wakes up in ${left}s)`;
      carry.classList.remove('hidden');
    } else carry.classList.add('hidden');

    // Boss bar
    const bar = $('bossBar');
    const boss = night.boss === 'gus' ? g.bot('gus') : night.boss === 'junk' ? g.junk : null;
    if (boss && g.mode === 'night') {
      bar.classList.remove('hidden');
      $('bossName').textContent = boss.name.toUpperCase();
      $('bossFill').style.width = (boss.health / boss.maxHealth) * 100 + '%';
    } else bar.classList.add('hidden');
  }

  objective() {
    const g = this.game;
    if (g.mode === 'day') return 'Daytime! Explore, then <b>clock in</b> at the time clock in the Security Office.';
    const night = g.night;
    if (night.boss === 'gus') return 'Only the <b>Magnum</b> hurts Gus.<br>Grab ammo boxes (yellow glow).';
    if (night.boss === 'junk') return 'Beat the <b>Junk Monster</b>!<br>Every weapon works. Your friends are helping.';
    if (!night.power) {
      const f = night.trippedFuse;
      return `Fix the fuse box in the <b>${f ? g.roomName(f.room) : '?'}</b>!`;
    }
    const broken = g.machines.brokenCount();
    const lines = ['Survive until <b>6 AM</b>'];
    if (broken) lines.push(`${broken} broken game${broken > 1 ? 's' : ''} — find ${broken > 1 ? 'them' : 'it'} on the cameras`);
    const down = g.bots.filter((a) => a.state === 'down').length;
    if (down) lines.push('Drag powered-down animatronics to <b>Parts &amp; Service</b>');
    return lines.join('<br>');
  }

  // ── Screens ───────────────────────────────────────────────────────────

  title(profile) {
    const n = profile.night;
    const fresh = n === 1 && !profile.seenIntro;
    $('btnPlay').innerHTML = fresh ? '▶&nbsp; Start your first night' :
      n > LAST_STORY_NIGHT ? (profile.beatJunk ? '▶&nbsp; Play Secret Night 21 again' : '▶&nbsp; Secret Night 21') :
      `▶&nbsp; Continue: Night ${n}`;
    $('btnNew').classList.toggle('hidden', fresh);
    $('btnSelect').classList.toggle('hidden', profile.best < 2);
  }

  select(profile, onPick) {
    const grid = $('selectGrid');
    grid.innerHTML = '';
    for (const d of NIGHTS) {
      const b = document.createElement('button');
      b.className = 'btn' + (d.secret ? ' secret' : '');
      b.textContent = d.secret ? '21★' : String(d.night);
      const open = d.night <= profile.best || (d.secret && profile.beatGus);
      b.disabled = !open;
      b.title = d.title;
      b.addEventListener('click', () => onPick(d.night));
      grid.appendChild(b);
    }
  }

  card(n) {
    const d = NIGHTS[n - 1];
    $('cardEyebrow').textContent = d.boss ? 'BOSS NIGHT' : '12:00 AM';
    $('cardNight').textContent = d.secret ? 'SECRET NIGHT 21' : `NIGHT ${n}`;
    $('cardTitle').textContent = d.title;
    $('cardNote').textContent = MANAGER_NOTES[n] || '';
    const un = unlocksAt(n);
    const u = $('cardUnlock');
    if (un.length) {
      u.innerHTML = un.map((x) => `NEW: <b>${x.name}</b> — ${x.desc}`).join('<br>');
      u.classList.remove('hidden');
    } else u.classList.add('hidden');
    $('cardRoster').innerHTML = ANIMATRONIC_ORDER.map((id) => {
      const a = ANIMATRONICS[id];
      const lvl = d.ai[id];
      let state;
      if (d.boss === 'junk') state = 'Your friend!';
      else if (id === 'gus') state = d.boss === 'gus' ? 'BOSS' : d.blackouts ? 'Waits for a blackout' : 'Stays on stage';
      else if (!lvl) state = 'Stays on stage';
      else {
        const wake = wakeHour(d, id);
        state = `Wakes at ${wake === 0 ? 12 : wake} AM`;
      }
      return `<div class="who ${!lvl && !d.boss ? 'asleep' : ''} ${id === 'gus' ? 'gus' : ''}"><b>${a.name}</b>${a.species} · ${state}</div>`;
    }).join('');
  }

  morning(n, report, unlocks) {
    $('morningTitle').textContent = `YOU SURVIVED NIGHT ${n}!`;
    const rows = report.rows.map((r) =>
      `<div class="row"><span>${r.label}</span><span class="${r.value >= 0 ? 'plus' : 'minus'}">${r.value >= 0 ? '+' : ''}${r.value}</span></div>`).join('');
    const m = moodOf(report.after);
    $('morningReport').innerHTML =
      `<div class="row"><span>Kids' happiness last night</span><span>${Math.round(report.before)}</span></div>${rows}` +
      `<div class="row total"><span>Kids' happiness now</span><span style="color:${m.color}">${m.face} ${Math.round(report.after)} · ${m.name}</span></div>`;
    const u = $('morningUnlock');
    if (unlocks.length) {
      u.innerHTML = 'Tonight you get: ' + unlocks.map((x) => `<b>${x.name}</b>`).join(', ') + '!';
      u.classList.remove('hidden');
    } else u.classList.add('hidden');
  }

  caught(who, n, tip) {
    $('caughtTitle').textContent = 'GOTCHA!';
    $('caughtBody').textContent = `${who} caught you.`;
    $('caughtTip').textContent = tip;
    $('btnRetry').textContent = `Try Night ${n} again`;
  }
}
