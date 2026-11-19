// Gus tokens 🪙 and the Shop: the designer's idea ("add gus tokens where you get 1 per arcade
// machene and quests and make a shop to get stuff like a gus mask and other things like a one
// use genorator").
//
// You get a token for every kid game you fix at night at the PlayPlace (not the fuse boxes),
// and one for every story quest the first time you ever finish it. It's one wallet for every
// story, kept in localStorage under `survive_gus_shop` beside the save, not in it: a New game
// keeps it, and getting caught never takes a token back. The very first time, you're given a
// token for every game you'd already fixed and every quest you'd already done. In debug mode
// you have 999 to try things with, and nothing is saved.
//
// What you buy works at night at the PlayPlace and in the house (`turn` and `tick`): the Gus
// mask (R), your pocket of things (X picks one, V uses it), and the extra life, which works by
// itself. Hats and the new emotes are for every story.
import * as THREE from 'three';
import { FLASHLIGHT, EMOTES, KEYMAP, P1_KEYMAP, P2_KEYMAP, weaponById } from './config.js';
import { sfx } from './audio.js';

const KEY = 'survive_gus_shop';
const MAX_CARRY = 9;

export const SHOP = {
  maskTime: 15,       // seconds you can wear the mask before you need air (his pick)
  maskCool: 6,        // ...and how long until it's ready again, after a full 15
  skateSpeed: 1.75,   // × walking speed: faster than running, and it never runs out
  skateHear: 1.4,     // × how far away they hear you running (and through walls)
  doorTime: 20,       // seconds the office shutters stay down
  throwSpeed: 9,      // the balloon decoy
  lureRange: 30,      // metres: who comes to look at it
  lureTime: 9,        // seconds they stare at it, and can't see you
  balloonLife: 14,    // then it pops
  glowLights: 3,      // glow sticks that light the room (the newest); the rest just glow
  glowMax: 12,
};

// Who the mask doesn't fool: Gus, and anything with Gus inside it.
const SEES_THROUGH = ['gus', 'moony', 'junk'];
export const fooledByMask = (id) => !SEES_THROUGH.includes(id);

// ── What's in the Shop ──────────────────────────────────────────────────
//
// `kind`: gear is yours for good; `use` is gone once you use it (carry up to nine of each);
// hats and emotes are yours for good. Prices are in Gus tokens.

export const SHOP_ITEMS = [
  { id: 'mask', kind: 'gear', icon: '🎭', name: 'Gus Mask', price: 20,
    desc: 'Put it on and they think you\'re one of them. Fools everyone but Gus! 15 seconds at a time, then you need air. No zapping, running or grabbing with it on.' },
  { id: 'skate', kind: 'gear', icon: '🛹', name: 'Skateboard', price: 25,
    desc: 'Ride it to go super fast, and it never gets tired. But it\'s LOUD: they hear you rolling, even through walls.' },

  { id: 'power', kind: 'use', icon: '⚡', name: 'Power Generator', price: 6,
    desc: 'Ends a blackout. The lights come back on and Gus goes back to the stage.' },
  { id: 'charger', kind: 'use', icon: '🔋', name: 'Charger Generator', price: 4,
    desc: 'Fills up your flashlight, your taser and your running, all the way.' },
  { id: 'doors', kind: 'use', icon: '🚪', name: 'Door Generator', price: 5,
    desc: 'Use it in the Security Office: metal shutters slam down over both doors for 20 seconds. Nothing gets in!' },
  { id: 'balloon', kind: 'use', icon: '🎈', name: 'Balloon Decoy', price: 2,
    desc: 'Throw it, and they go look at the balloon instead of you. Gus isn\'t fooled.' },
  { id: 'life', kind: 'use', icon: '❤️', name: 'Extra Life', price: 8,
    desc: 'The next time something catches you, you wriggle free. Then RUN! (Works by itself.)' },
  { id: 'glow', kind: 'use', icon: '🟢', name: 'Glow Sticks', price: 2, pack: 3,
    desc: 'A pack of three. Drop one and it lights up the dark for the rest of the night.' },

  { id: 'hat-party', kind: 'hat', icon: '🎉', name: 'Party Hat', price: 8, desc: 'A pointy birthday hat with a pom-pom.' },
  { id: 'hat-cap', kind: 'hat', icon: '🧢', name: 'Gus Cap', price: 8, desc: 'A purple PlayPlace cap with Gus on the front.' },
  { id: 'hat-prop', kind: 'hat', icon: '🚁', name: 'Propeller Beanie', price: 10, desc: 'The propeller spins when you move!' },
  { id: 'hat-crown', kind: 'hat', icon: '👑', name: 'Crown', price: 15, desc: 'Shiny gold, with jewels.' },

  { id: 'emote-pizza', kind: 'emote', emote: 'pizza', icon: '🍕', name: 'Noice', price: 10, desc: 'Eat a slice of pizza and say "noice." (His idea!)' },
  { id: 'emote-floss', kind: 'emote', emote: 'floss', icon: '💃', name: 'The Floss', price: 10, desc: 'Swing your arms back and forth.' },
  { id: 'emote-robot', kind: 'emote', emote: 'robot', icon: '🤖', name: 'The Robot', price: 10, desc: 'Dance like an animatronic.' },
  { id: 'emote-backflip', kind: 'emote', emote: 'backflip', icon: '🤸', name: 'Backflip', price: 12, desc: 'A big flip.' },
  { id: 'emote-sleep', kind: 'emote', emote: 'sleep', icon: '😴', name: 'Fall Asleep', price: 10, desc: 'Lie down and snore. Zzz...' },
];
export const shopItem = (id) => SHOP_ITEMS.find((i) => i.id === id);

const SECTIONS = [
  { kind: 'gear', title: 'GEAR', sub: 'Yours to keep' },
  { kind: 'use', title: 'POWER-UPS', sub: 'One use each · carry up to 9' },
  { kind: 'hat', title: 'HATS', sub: 'For Jonathan and Jimmy' },
  { kind: 'emote', title: 'EMOTES', sub: 'For your emote wheel' },
];

// The emotes you can buy, added to the end of the wheel once they're yours.
export const SHOP_EMOTES = [
  { id: 'pizza', name: 'Noice', icon: '🍕', len: 3.6 },
  { id: 'floss', name: 'The floss', icon: '💃', len: 6 },
  { id: 'robot', name: 'The robot', icon: '🤖', len: 6 },
  { id: 'backflip', name: 'Backflip', icon: '🤸', len: 2.2 },
  { id: 'sleep', name: 'Fall asleep', icon: '😴', len: 7 },
];

// What can go in your pocket, in order.
const POCKET = ['skate', 'power', 'charger', 'doors', 'balloon', 'glow'];

// ── The wallet ──────────────────────────────────────────────────────────

const blank = () => ({ tokens: 0, earned: 0, owned: {}, have: {}, hats: ['', ''] });

function readWallet() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const w = JSON.parse(raw);
    return {
      ...blank(), ...w,
      tokens: Math.max(0, w.tokens | 0),
      owned: { ...(w.owned || {}) },
      have: { ...(w.have || {}) },
      hats: [w.hats?.[0] || '', w.hats?.[1] || ''],
    };
  } catch { return null; }
}

// Everything you'd already done before there was a Shop: every game fixed, every quest.
function pastTokens(profile) {
  let n = profile?.stats?.fixed | 0;
  for (const story of [profile?.escape, profile?.plex]) {
    for (const list of Object.values(story?.quests || {})) n += Array.isArray(list) ? list.length : 0;
  }
  return n;
}

const clone = (w) => JSON.parse(JSON.stringify(w));
const $ = (id) => document.getElementById(id);

export class Shop {
  constructor(game) {
    this.game = game;
    this.real = readWallet();
    this.welcome = 0;
    if (!this.real) {
      this.real = blank();
      this.welcome = pastTokens(game.profile);
      this.real.tokens = this.real.earned = this.welcome;
      this.write();
    }
    this.dbg = null;
    this.tab = 'gear';
    this.shutters = null;   // the office shutters, while they're down
    this.balloons = [];
    this.glows = [];
    this.boards = [];
    this.notes = [];        // things in the HUD, per player
    this.popT = 0;
    this.pizza = null;
    this.zees = [];
    this.syncEmotes();
  }

  get w() {
    if (!this.game.debugMode) return this.real;
    if (!this.dbg) { this.dbg = clone(this.real); this.dbg.tokens = 999; }
    return this.dbg;
  }

  write() {
    if (this.game.debugMode) return;
    try { localStorage.setItem(KEY, JSON.stringify(this.real)); } catch { /* private mode */ }
  }

  setDebug(on) {
    this.dbg = null;
    this.syncEmotes();
    if (!on) this.refresh();
  }

  get tokens() { return this.w.tokens; }
  owns(id) { return !!this.w.owned[id]; }
  count(id) { return this.w.have[id] | 0; }
  hatFor(index) { return this.w.hats[index] || ''; }

  // A token (or a few) for something you did. Shows a little 🪙 +1 by the clock.
  earn(n = 1) {
    if (n <= 0) return 0;
    const w = this.w;
    w.tokens += n;
    w.earned += n;
    this.write();
    this.pop(n);
    return n;
  }

  pop(n) {
    let el = $('tokenPop');
    if (!el) {
      el = document.createElement('div');
      el.id = 'tokenPop';
      el.className = 'token-pop';
      $('stage').appendChild(el);
    }
    el.textContent = `🪙 +${n}`;
    el.classList.remove('show');
    void el.offsetWidth;   // restart the animation
    el.classList.add('show');
    sfx.pickup();
  }

  buy(id) {
    const it = shopItem(id);
    const w = this.w;
    if (!it || w.tokens < it.price) return false;
    if (it.kind === 'use') {
      if (this.count(id) >= MAX_CARRY) return false;
      w.have[id] = Math.min(MAX_CARRY, this.count(id) + (it.pack || 1));
    } else {
      if (w.owned[id]) return false;
      w.owned[id] = true;
      // a new hat goes straight on Jonathan, if he isn't wearing one
      if (it.kind === 'hat' && !w.hats[0]) w.hats[0] = id;
    }
    w.tokens -= it.price;
    this.write();
    if (it.kind === 'emote') this.syncEmotes();
    sfx.happy();
    return true;
  }

  use(id) {
    const w = this.w;
    if (!w.have[id]) return false;
    w.have[id]--;
    this.write();
    return true;
  }

  wear(index, hat) {
    const w = this.w;
    if (!w.owned[hat]) return;
    w.hats[index] = w.hats[index] === hat ? '' : hat;
    this.write();
    sfx.ui();
  }

  // The bought emotes go on the end of the wheel. (The wheel is drawn once, so it's
  // thrown away to be drawn again with them on.)
  syncEmotes() {
    for (let i = EMOTES.length - 1; i >= 0; i--) if (EMOTES[i].shop) EMOTES.splice(i, 1);
    for (const e of SHOP_EMOTES) if (this.owns('emote-' + e.id)) EMOTES.push({ ...e, shop: true });
    const wheels = this.game.wheels || [];
    for (const el of wheels) if (el) el.remove();
    wheels.length = 0;
  }

  // ── The Shop screen ───────────────────────────────────────────────────

  open() {
    this.refresh();
    if (this.welcome && !this.game.debugMode) {
      this.flash(`🎁 Welcome to the Shop! Here are <b>${this.welcome}</b> Gus tokens: one for every game you've fixed and every quest you've done.`);
      this.welcome = 0;
    } else this.flash('');
  }

  flash(html) {
    const el = $('shopNote');
    if (!el) return;
    el.innerHTML = html;
    el.classList.toggle('hidden', !html);
  }

  refresh() {
    const grid = $('shopGrid');
    if (!grid) return;
    $('shopTokens').textContent = this.tokens;
    $('shopDebug').classList.toggle('hidden', !this.game.debugMode);
    const tabs = $('shopTabs');
    tabs.innerHTML = SECTIONS.map((s) =>
      `<button class="shop-tab${s.kind === this.tab ? ' on' : ''}" data-tab="${s.kind}">${s.title}</button>`).join('');
    tabs.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { this.tab = b.dataset.tab; sfx.ui(); this.refresh(); }));
    const sec = SECTIONS.find((s) => s.kind === this.tab);
    $('shopSub').textContent = sec.sub;
    grid.innerHTML = SHOP_ITEMS.filter((it) => it.kind === this.tab).map((it) => this.card(it)).join('');
    grid.querySelectorAll('[data-buy]').forEach((b) => b.addEventListener('click', () => {
      const it = shopItem(b.dataset.buy);
      if (this.buy(it.id)) this.flash(`${it.icon} <b>${it.name}</b>${it.pack ? ` ×${it.pack}` : ''}: it's yours! ${this.howToUse(it)}`);
      else sfx.repairBad();
      this.refresh();
    }));
    grid.querySelectorAll('[data-wear]').forEach((b) => b.addEventListener('click', () => {
      this.wear(Number(b.dataset.who), b.dataset.wear);
      this.refresh();
    }));
  }

  howToUse(it) {
    if (it.kind === 'hat') return 'Pick who wears it. You see it when you emote, and in 2 Players.';
    if (it.kind === 'emote') return 'It\'s on your emote wheel now (hold T).';
    if (it.id === 'mask') return 'At night, press R to put it on (player 2: M · a controller: d-pad ← · a touch screen: 🎭).';
    if (it.id === 'life') return 'It works by itself the next time you\'re caught.';
    return 'At night, pick it with X and use it with V (player 2: J and N · a controller: d-pad → and ↓ · a touch screen: ↻ and the pocket button).';
  }

  card(it) {
    const w = this.w;
    const mine = it.kind === 'use' ? this.count(it.id) : w.owned[it.id];
    const afford = w.tokens >= it.price;
    let action;
    if (it.kind === 'use') {
      const full = this.count(it.id) >= MAX_CARRY;
      action = `<button class="btn shop-buy" data-buy="${it.id}" ${full || !afford ? 'disabled' : ''}>${full ? 'Full' : `Buy 🪙 ${it.price}`}</button>`;
    } else if (mine && it.kind === 'hat') {
      const who = [['Jonathan', 0], ['Jimmy', 1]];
      action = `<div class="shop-wear">${who.map(([n, i]) =>
        `<button class="btn btn-ghost${w.hats[i] === it.id ? ' on' : ''}" data-wear="${it.id}" data-who="${i}">${w.hats[i] === it.id ? '✓ ' : ''}${n}</button>`).join('')}</div>`;
    } else if (mine) {
      action = '<div class="shop-owned">✓ Yours</div>';
    } else {
      action = `<button class="btn shop-buy" data-buy="${it.id}" ${afford ? '' : 'disabled'}>Buy 🪙 ${it.price}</button>`;
    }
    const have = it.kind === 'use' && mine ? `<div class="shop-have">You have ${mine}</div>` : '';
    return `<div class="shop-card${mine ? ' mine' : ''}">
      <div class="shop-icon">${it.icon}</div>
      <div class="shop-name">${it.name}${it.pack ? ` <small>×${it.pack}</small>` : ''}</div>
      <div class="shop-desc">${it.desc}</div>
      ${have}${action}</div>`;
  }

  // ── At night ──────────────────────────────────────────────────────────

  active() { return this.game.mode === 'night' || this.game.mode === 'home'; }

  pocket() { return POCKET.filter((id) => (id === 'skate' ? this.owns(id) : this.count(id) > 0)); }

  // The thing this player's pocket has picked, and its icon (for the touch button).
  pocketItem(p) {
    const list = this.pocket();
    return list.length ? list[Math.min(p.pocketSel | 0, list.length - 1)] : null;
  }
  pocketIcon(p) { const id = this.pocketItem(p); return id ? shopItem(id).icon : '🎒'; }

  // What to call the mask and pocket buttons for this player: keys, a controller's d-pad,
  // or the touch buttons.
  keysFor(p) {
    const g = this.game;
    if (p.ctl && p.ctl.pad !== null && p.ctl.pad !== undefined && p.ctl.usedPad) return { mask: 'D-pad ←', item: 'D-pad ↓', next: 'D-pad →' };
    if (p.index === 0 && g.touch?.active) return { mask: '🎭', item: this.pocketIcon(p), next: '↻' };
    const map = p.index === 1 ? P2_KEYMAP : g.twoUp ? P1_KEYMAP : KEYMAP;
    return { mask: map.mask.show, item: map.item.show, next: map.nextItem.show };
  }

  // A fresh night (or the house): everything you'd put down is gone, the shutters are up.
  startNight() {
    this.clear();
    for (const p of this.game.players) {
      p.masked = false; p.maskT = 0; p.maskCool = 0; p.skating = false;
      p.pocketSel = 0;
      p.breathT = 0;
    }
  }

  endNight() {
    this.clear();
    for (const p of this.game.players) { p.masked = false; p.skating = false; }
    for (const n of this.notes) if (n) { n.pocket.classList.add('hidden'); n.mask.classList.add('hidden'); }
  }

  clear() {
    this.openShutters(true);
    for (const b of this.balloons) this.game.scene.remove(b.group);
    this.balloons = [];
    for (const s of this.glows) this.game.scene.remove(s.mesh);
    this.glows = [];
    if (this.glowLights) for (const l of this.glowLights) l.intensity = 0;
    for (const b of this.boards) b.visible = false;
  }

  // One player's keys, from the night step (game.js nightTurn) after they've walked.
  turn(dt, p) {
    const ctl = p.ctl;
    if (ctl.pressed('mask')) this.toggleMask(p);
    const list = this.pocket();
    if (ctl.pressed('nextItem')) {
      if (!list.length) this.game.hud.toast('Your pocket is empty. Get things in the 🪙 Shop!');
      else { p.pocketSel = ((p.pocketSel | 0) + 1) % list.length; sfx.ui(); }
    }
    if (ctl.pressed('item')) {
      if (!list.length) this.game.hud.toast('Your pocket is empty. Get things in the 🪙 Shop!');
      else this.useItem(p, this.pocketItem(p));
    }
  }

  // Wearing the mask, you can't press E on anything: this is the prompt instead.
  maskedPrompt(p) {
    return { text: `<b>${this.keysFor(p).mask}</b> Take the mask off first`, act: () => {}, quiet: true };
  }

  toggleMask(p) {
    const hud = this.game.hud;
    if (p.masked) { this.maskOff(p, false); return; }
    if (!this.owns('mask')) { hud.toast('You need the 🎭 Gus Mask from the Shop!'); return; }
    if (p.carrying) { hud.toast(`Put ${p.carrying.name} down first!`); return; }
    if (p.maskCool > 0) { hud.toast(`Catch your breath... ${Math.ceil(p.maskCool)}`); return; }
    p.masked = true;
    p.maskT = 0;
    p.skating = false;
    p.breathT = 0.4;
    sfx.escHide();
    hud.toast('🎭 Mask on. Stand still and act like one of them... (Gus can tell!)', 3);
  }

  maskOff(p, outOfAir) {
    p.masked = false;
    p.maskCool = outOfAir ? SHOP.maskCool : Math.max(1.5, SHOP.maskCool * (p.maskT / SHOP.maskTime));
    sfx.escHide();
    if (outOfAir) this.game.hud.toast('*GASP* You need air! The mask comes off.', 3);
  }

  useItem(p, id) {
    const g = this.game, hud = g.hud;
    if (id === 'skate') {
      if (p.skating) { p.skating = false; sfx.clink(); return; }
      if (p.masked) { hud.toast('Take the mask off to ride!'); return; }
      if (p.carrying) { hud.toast(`You can't ride while dragging ${p.carrying.name}!`); return; }
      if (p.crouching) p.crouching = false;
      p.skating = true;
      sfx.clink();
      hud.toast('🛹 Skateboard! Super fast, but they can HEAR you.', 2.6);
      return;
    }
    if (id === 'power') {
      const n = g.night;
      if (g.mode !== 'night' || n.power) { hud.toast('The power\'s on. Save the generator for a blackout!'); return; }
      if (n.boss === 'gus') { hud.toast('Gus fried the fuse boxes. Not even a generator can fix them tonight!'); return; }
      if (!this.use(id)) return;
      sfx.powerOn();
      n.restorePower();
      setTimeout(() => hud.toast('⚡ VRRRMMM! The Power Generator kicked on!', 3), 1600);
      return;
    }
    if (id === 'charger') {
      const taser = weaponById('taser');
      if (!this.use(id)) return;
      p.battery = FLASHLIGHT.battery;
      p.taserCharges = taser.charges;
      p.taserEmpty = 0;
      p.stamina = p.maxStamina;
      p.winded = false;
      sfx.recharged();
      hud.toast('🔋 Fully charged: flashlight, taser and running!', 2.6);
      return;
    }
    if (id === 'doors') {
      if (this.shutters) { hud.toast('The shutters are already down!'); return; }
      if (!g.area.isPlayPlace || g.place.roomAt(p.pos.x, p.pos.z) !== 'O' || this.inOfficeDoor(p.pos)) {
        hud.toast('Use the Door Generator inside the Security Office!');
        return;
      }
      if (!this.use(id)) return;
      this.closeShutters();
      return;
    }
    if (id === 'balloon') {
      if (p.masked) { hud.toast('Take the mask off to throw!'); return; }
      if (!this.use(id)) return;
      this.throwBalloon(p);
      return;
    }
    if (id === 'glow') {
      if (!this.use(id)) return;
      this.dropGlow(p);
    }
  }

  // Caught (game.js caught): use up an extra life and get away, like Spooky's second chance.
  saveLife(who) {
    if (!this.active() || !this.use('life')) return false;
    this.game.getAway(who, `❤️ Extra life! You wriggled free from ${who.name}. RUN!`);
    return true;
  }

  // Once a frame at night: the mask's air, the shutters, balloons, glow sticks, skateboards
  // and the HUD.
  tick(dt) {
    const g = this.game;
    for (const p of g.players) {
      if (p.masked) {
        p.maskT += dt;
        p.breathT -= dt;
        if (p.breathT <= 0) { p.breathT = 1.7; sfx.plexBreath(0.5 + p.maskT / SHOP.maskTime); }
        if (p.maskT >= SHOP.maskTime || p.out) this.maskOff(p, !p.out);
      } else if (p.maskCool > 0) p.maskCool = Math.max(0, p.maskCool - dt);
      if (p.skating && (p.carrying || p.out || p.crouching)) p.skating = false;
    }
    if (this.shutters) {
      this.shutters.t -= dt;
      this.animateShutters(dt);
      if (this.shutters.t <= 0) this.openShutters(false);
    }
    this.updateBalloons(dt);
    this.updateGlows();
    this.updateBoards(dt);
    this.drawHud();
  }

  // ── The HUD: your pocket, the mask, the shutters ─────────────────────

  hostFor(p) {
    const g = this.game;
    return g.split && g.panes ? g.panes[p.index].el : $('hud');
  }

  drawHud() {
    const g = this.game;
    const on = this.active();
    g.players.forEach((p) => {
      let n = this.notes[p.index];
      if (!n) {
        n = { pocket: document.createElement('div'), mask: document.createElement('div') };
        n.pocket.className = 'shop-pocket hidden';
        n.mask.className = 'gus-mask hidden';
        n.mask.innerHTML = '<div class="gm-face"></div><div class="gm-air"><span>🎭 AIR</span><div class="bar"><div class="fill"></div></div></div>';
        this.notes[p.index] = n;
      }
      const host = this.hostFor(p);
      // (the mask goes under everything else in the HUD, so the clock and bars still show)
      if (n.pocket.parentNode !== host) { host.insertBefore(n.mask, host.firstChild); host.appendChild(n.pocket); }
      // the mask over your eyes
      const masked = on && p.masked;
      n.mask.classList.toggle('hidden', !masked);
      if (masked) n.mask.querySelector('.fill').style.width = `${Math.max(0, 100 * (1 - p.maskT / SHOP.maskTime))}%`;
      // your pocket
      const list = this.pocket();
      const lives = this.count('life');
      const k = this.keysFor(p);
      let html = '';
      if (on && (list.length || lives || this.owns('mask'))) {
        const id = list.length ? list[Math.min(p.pocketSel | 0, list.length - 1)] : null;
        const it = id && shopItem(id);
        if (it) {
          const n2 = id === 'skate' ? (p.skating ? 'ON' : '') : `×${this.count(id)}`;
          html += `<div class="sp-item"><span class="sp-icon">${it.icon}</span><span class="sp-name">${it.name} <b>${n2}</b></span></div>`;
          html += `<div class="sp-keys"><b>${k.item}</b> use${list.length > 1 ? ` · <b>${k.next}</b> next (${list.length})` : ''}</div>`;
        }
        const tags = [];
        if (this.owns('mask')) tags.push(p.masked ? '🎭 ON' : p.maskCool > 0 ? `🎭 ${Math.ceil(p.maskCool)}s` : k.mask === '🎭' ? '🎭 ready' : `🎭 <b>${k.mask}</b>`);
        if (lives) tags.push(`❤️×${lives}`);
        if (this.shutters) tags.push(`🚪 ${Math.ceil(this.shutters.t)}s`);
        if (tags.length) html += `<div class="sp-tags">${tags.join(' ')}</div>`;
      }
      if (n.html !== html) { n.pocket.innerHTML = html; n.html = html; }
      n.pocket.classList.toggle('hidden', !html);
    });
  }

  // ── The Door Generator: shutters over the Security Office's two doors ─

  officeDoors() { return this.game.playplace.doors.filter((d) => d.a === 'O' || d.b === 'O'); }

  inOfficeDoor(pos) {
    const place = this.game.place;
    return this.officeDoors().some((d) => {
      const a = place.P(d.x0 - 0.6, d.z0 - 0.6), b = place.P(d.x1 + 1.6, d.z1 + 1.6);
      return pos.x > Math.min(a.x, b.x) && pos.x < Math.max(a.x, b.x) && pos.z > Math.min(a.z, b.z) && pos.z < Math.max(a.z, b.z);
    });
  }

  closeShutters() {
    const g = this.game, place = g.playplace;
    const doors = this.officeDoors();
    if (!this.shutterMeshes) {
      const tex = stripes();
      const mat = new THREE.MeshStandardMaterial({ map: tex, color: 0xb9bcc4, roughness: 0.55, metalness: 0.6 });
      this.shutterMeshes = doors.map((d) => {
        const w = d.x1 - d.x0 + 1, dd = d.z1 - d.z0 + 1;
        const along = w >= dd;
        const h = Math.min(3.0, place.wallH - 0.5);
        const m = new THREE.Mesh(new THREE.BoxGeometry(along ? w : 0.18, h, along ? 0.18 : dd), mat);
        m.userData = { h, home: place.P(d.x0 + w / 2, d.z0 + dd / 2, h / 2) };
        return m;
      });
    }
    for (const m of this.shutterMeshes) {
      m.position.copy(m.userData.home);
      m.position.y += m.userData.h;
      if (!m.parent) g.scene.add(m);
    }
    place.setDoorsClosed(doors, true);
    this.shutters = { t: SHOP.doorTime, drop: 0 };
    // anyone already on their way in has to find another way (there isn't one)
    for (const a of [...g.bots, ...g.wingBots]) if (a.dest && a.path?.length) a.goTo(a.dest);
    sfx.garageDoor();
    g.hud.toast('🚪 SLAM! The shutters are down for 20 seconds. Nothing gets in!', 3.2);
  }

  animateShutters(dt) {
    const s = this.shutters;
    s.drop = Math.min(1, s.drop + dt * 4);
    for (const m of this.shutterMeshes) {
      m.position.y = m.userData.home.y + m.userData.h * (1 - s.drop) * (s.t < 0.6 ? 0 : 1);
      if (s.t < 0.6) m.position.y = m.userData.home.y + m.userData.h * (1 - s.t / 0.6);
    }
  }

  openShutters(quiet) {
    if (!this.shutters) return;
    this.shutters = null;
    this.game.playplace.setDoorsClosed(this.officeDoors(), false);
    for (const m of this.shutterMeshes || []) if (m.parent) m.parent.remove(m);
    if (!quiet) { sfx.garageDoor(); this.game.hud.toast('The shutters are going back up!', 2.4); }
  }

  // ── The Balloon Decoy ─────────────────────────────────────────────────

  throwBalloon(p) {
    const g = this.game;
    const group = new THREE.Group();
    const colors = [0xff3fa4, 0x2de2e6, 0xffd23f, 0x3cff6b];
    const color = colors[this.balloons.length % colors.length];
    const skin = new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.05, emissive: color, emissiveIntensity: 0.25 });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 14), skin);
    ball.scale.set(1, 1.18, 1);
    const knot = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.08, 8), skin);
    knot.position.y = -0.33;
    knot.rotation.x = Math.PI;
    const top = new THREE.Group();
    top.add(ball, knot);
    const string = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    const weight = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.1, 10),
      new THREE.MeshStandardMaterial({ color: 0x8a1aa8, roughness: 0.5 }));
    group.add(top, string, weight);
    const eye = p.eye(), aim = p.aimDir();
    const pos = eye.clone().addScaledVector(aim, 0.5);
    pos.y -= 0.25;
    group.position.copy(pos);
    g.scene.add(group);
    this.balloons.push({
      group, top, string, weight, pos,
      vel: aim.clone().multiplyScalar(SHOP.throwSpeed).add(new THREE.Vector3(0, 2.6, 0)),
      landed: false, t: 0, seed: Math.random() * 10,
    });
    sfx.throwBall();
  }

  updateBalloons(dt) {
    const g = this.game, place = g.place;
    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      b.t += dt;
      if (!b.landed) {
        b.vel.y -= 9.8 * dt;
        const nx = b.pos.x + b.vel.x * dt, nz = b.pos.z + b.vel.z * dt;
        if (place.isWalkable(nx, nz)) { b.pos.x = nx; b.pos.z = nz; } else { b.vel.x *= -0.25; b.vel.z *= -0.25; }
        b.pos.y += b.vel.y * dt;
        const floor = place.floorAt(b.pos.x, b.pos.z);
        if (b.pos.y <= floor + 0.05) {
          b.pos.y = floor + 0.05;
          b.landed = true;
          b.t = 0;
          sfx.ballBounce(b.pos);
          this.lure(b.pos);
        }
      }
      // the weight on the floor (or flying), the balloon bobbing on its string above it
      b.weight.position.set(0, 0, 0);
      const up = b.landed ? Math.min(1.5, 0.4 + b.t * 4) : 0.45;
      const sway = Math.sin(b.t * 1.7 + b.seed) * 0.08;
      b.top.position.set(sway, up + Math.sin(b.t * 2.3 + b.seed) * 0.04, Math.cos(b.t * 1.3 + b.seed) * 0.06);
      b.string.position.set(sway / 2, up / 2, 0);
      b.string.scale.y = up;
      b.group.position.copy(b.pos);
      if (b.landed && b.t > SHOP.balloonLife) {
        g.effects.burst(b.group.position.clone().add(b.top.position), 10, 2);
        sfx.bonk(b.pos);
        g.scene.remove(b.group);
        this.balloons.splice(i, 1);
      }
    }
  }

  // Everyone it fools, close enough and awake, goes to look — and for a while they only
  // have eyes for the balloon.
  lure(pos) {
    const g = this.game;
    let n = 0;
    for (const a of [...g.bots, ...g.wingBots]) {
      if (!fooledByMask(a.id) || !a.root?.visible) continue;
      if (!['roam', 'linger', 'search', 'chase', 'notice', 'hunt', 'return'].includes(a.state)) continue;
      if (Math.hypot(a.pos.x - pos.x, a.pos.z - pos.z) > SHOP.lureRange) continue;
      a.state = 'search';
      a.searchRun = true;
      a.goTo(pos.clone());
      a.decoyUntil = g.t + SHOP.lureTime;
      n++;
    }
    if (n) g.hud.toast(`🎈 ${n === 1 ? 'Something is' : `${n} of them are`} coming to look at the balloon!`, 2.6);
  }

  // ── Glow sticks ───────────────────────────────────────────────────────

  dropGlow(p) {
    const g = this.game;
    if (!this.glowLights) {
      this.glowLights = [];
      for (let i = 0; i < SHOP.glowLights; i++) {
        const l = new THREE.PointLight(0x3cff6b, 0, 6.5, 1.6);
        g.scene.add(l);
        this.glowLights.push(l);
      }
    }
    const colors = [0x3cff6b, 0xff3fa4, 0x2de2e6, 0xffd23f];
    const color = colors[this.glows.length % colors.length];
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 8), new THREE.MeshBasicMaterial({ color }));
    const aim = p.aimDir();
    const len = Math.hypot(aim.x, aim.z) || 1;
    const x = p.pos.x + (aim.x / len) * 0.7, z = p.pos.z + (aim.z / len) * 0.7;
    const at = g.place.isWalkable(x, z) ? [x, z] : [p.pos.x, p.pos.z];
    mesh.position.set(at[0], g.place.floorAt(at[0], at[1]) + 0.03, at[1]);
    mesh.rotation.set(Math.PI / 2, 0, Math.random() * Math.PI);
    g.scene.add(mesh);
    this.glows.push({ mesh, color, t: g.t });
    if (this.glows.length > SHOP.glowMax) g.scene.remove(this.glows.shift().mesh);
    sfx.clink();
  }

  updateGlows() {
    if (!this.glowLights) return;
    const newest = this.glows.slice(-SHOP.glowLights);
    this.glowLights.forEach((l, i) => {
      const s = newest[i];
      if (!s) { l.intensity = 0; return; }
      l.color.setHex(s.color);
      l.position.set(s.mesh.position.x, s.mesh.position.y + 0.35, s.mesh.position.z);
      l.intensity = 2.4 + Math.sin(this.game.t * 3 + i) * 0.15;
    });
  }

  // ── The skateboard, under whoever's riding ────────────────────────────

  updateBoards(dt) {
    const g = this.game;
    g.players.forEach((p, i) => {
      let b = this.boards[i];
      if (!b && p.skating) { b = this.boards[i] = buildBoard(); g.scene.add(b); }
      if (!b) return;
      b.visible = !!p.skating && this.active();
      if (!b.visible) return;
      b.position.set(p.pos.x, p.pos.y + 0.06, p.pos.z);
      b.rotation.y = p.yaw;
      const spin = (p.moving || 0) * dt * 20;
      for (const w of b.userData.wheels) w.rotation.x -= spin;
      // a rumble as you roll
      p.rollT = (p.rollT || 0) - dt * Math.min(1.5, p.moving || 0);
      if (p.rollT <= 0 && (p.moving || 0) > 0.3) { p.rollT = 0.32; sfx.skate(p.pos); }
    });
  }

  // ── Hats and the bought emotes, on the players' bodies (game.js updateBodies) ─

  dress(p, b, e) {
    const rig = b.rig;
    const want = this.hatFor(p.index);
    if (rig.hatId !== want) {
      if (rig.hat) { rig.hat.parent?.remove(rig.hat); rig.hat = null; }
      rig.hatId = want;
      if (want) { rig.hat = buildHat(want, headTop(rig)); rig.head.add(rig.hat); }
    }
    if (rig.hat?.userData.prop) rig.hat.userData.prop.rotation.y += 0.25 + (p.moving || 0) * 0.5;
    const mine = e && (e.id === 'backflip' || e.id === 'sleep');
    // (game.js turns the body with the usual order; only these two tip it over in its own)
    if (!mine && b.root.rotation.order !== 'XYZ') b.root.rotation.order = 'XYZ';
    this.prop(rig, e && e.id === 'pizza' ? e.t : null);
    this.zzz(rig, e && e.id === 'sleep' ? e.t : null);
    if (!mine) return;
    const t = e.t, th = e.yaw + Math.PI, h = rig.height || 1.6;
    if (e.id === 'backflip') {
      // up, all the way over backwards round the middle of the body, and down on your feet
      const k = Math.min(1, Math.max(0, (t - 0.2) / 1.0));
      const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const rx = -ease * Math.PI * 2, off = h * 0.5;
      const cy = p.pos.y + off + Math.sin(Math.PI * k) * 0.8;
      b.root.rotation.set(rx, th, 0, 'YXZ');
      b.root.position.set(p.pos.x - off * Math.sin(rx) * Math.sin(th), cy - off * Math.cos(rx), p.pos.z - off * Math.sin(rx) * Math.cos(th));
    } else {
      // lie down on your back, middle of you where you were standing, and snore
      const k = Math.min(1, t / 0.6);
      const a = -Math.PI / 2 * k;
      b.root.rotation.set(a, th, 0, 'YXZ');
      // where the head ends up, so the body can be slid back to lie centred
      const hx = Math.sin(a) * Math.sin(th), hz = Math.sin(a) * Math.cos(th);
      b.root.position.set(p.pos.x - hx * h * 0.45, p.pos.y + 0.16 * k, p.pos.z - hz * h * 0.45);
    }
  }

  // A slice of pizza in your right hand for "Noice" — and at the end, "noice."
  prop(rig, t) {
    if (t === null) { if (rig.slice) rig.slice.visible = false; rig.saidNoice = false; return; }
    if (!rig.slice) { rig.slice = buildSlice(); rig.armR.add(rig.slice); }
    rig.slice.visible = true;
    rig.slice.position.set(0, -armLength(rig) * 0.95, 0.06);
    // three bites, and the slice gets smaller each time
    const bites = Math.min(3, Math.floor(t / 0.75));
    rig.slice.scale.setScalar(1 - bites * 0.22);
    if (t > 2.4 && !rig.saidNoice) { rig.saidNoice = true; sayNoice(); }
  }

  zzz(rig, t) {
    if (t === null) { if (rig.zees) for (const z of rig.zees) z.visible = false; return; }
    if (!rig.zees) {
      rig.zees = [0, 1, 2].map(() => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTexture(), transparent: true, depthWrite: false }));
        s.scale.setScalar(0.22);
        rig.head.add(s);
        return s;
      });
    }
    rig.zees.forEach((z, i) => {
      const k = ((t * 0.5 + i / 3) % 1);
      z.visible = t > 0.8;
      // (the head's lying back, so "up" in the head is towards its face)
      z.position.set(0.12 + k * 0.2, 0.25 + k * 0.1, 0.25 + k * 0.6);
      z.material.opacity = Math.sin(k * Math.PI);
      z.scale.setScalar(0.14 + k * 0.18);
    });
  }
}

// ── Models ──────────────────────────────────────────────────────────────

// Where the top of someone's head is, in the head's own space, and how wide it is.
function headTop(rig) {
  const head = rig.head;
  head.updateWorldMatrix(true, true);
  const box = new THREE.Box3();
  head.traverse((o) => {
    if (!o.isMesh || o.userData.hat) return;
    o.geometry.computeBoundingBox();
    const bb = o.geometry.boundingBox.clone();
    // into the head's space
    const m = new THREE.Matrix4().copy(head.matrixWorld).invert().multiply(o.matrixWorld);
    box.union(bb.applyMatrix4(m));
  });
  if (box.isEmpty()) return { y: 0.25, r: 0.11, z: 0 };
  return { y: box.max.y, r: Math.max(0.06, (box.max.x - box.min.x) / 2), z: (box.max.z + box.min.z) / 2 };
}

function armLength(rig) {
  if (rig.armLen) return rig.armLen;
  const arm = rig.armR;
  arm.updateWorldMatrix(true, true);
  let low = 0;
  arm.traverse((o) => {
    if (!o.isMesh || o === rig.slice) return;
    o.geometry.computeBoundingBox();
    const bb = o.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().copy(arm.matrixWorld).invert().multiply(o.matrixWorld));
    low = Math.min(low, bb.min.y);
  });
  rig.armLen = -low || 0.5;
  return rig.armLen;
}

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.05, ...o });

function buildHat(id, top) {
  const g = new THREE.Group();
  const r = top.r;
  const mark = (m) => { m.userData.hat = true; return m; };
  if (id === 'hat-party') {
    const tex = canvasTex(64, 64, (c) => {
      for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffd23f' : '#ff3fa4'; c.fillRect(i * 8, 0, 8, 64); }
      c.fillStyle = '#2de2e6';
      for (let i = 0; i < 10; i++) { c.beginPath(); c.arc(Math.random() * 64, Math.random() * 64, 3, 0, 7); c.fill(); }
    });
    const cone = mark(new THREE.Mesh(new THREE.ConeGeometry(r * 0.62, r * 1.9, 20, 1, true), std(0xffffff, { map: tex, side: THREE.DoubleSide })));
    cone.position.y = r * 0.95;
    const pom = mark(new THREE.Mesh(new THREE.SphereGeometry(r * 0.2, 12, 10), std(0xffffff, { roughness: 0.9 })));
    pom.position.y = r * 1.95;
    g.add(cone, pom);
    g.rotation.z = 0.12;
  } else if (id === 'hat-cap') {
    const purple = std(0x6a2bb8);
    const dome = mark(new THREE.Mesh(new THREE.SphereGeometry(r * 1.03, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), purple));
    dome.scale.y = 0.72;
    const brim = mark(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.75, r * 0.75, r * 0.07, 20, 1, false, -Math.PI / 2, Math.PI), std(0xffd23f)));
    brim.position.set(0, 0, r * 0.62);
    brim.scale.set(1, 1, 1.1);
    const badge = mark(new THREE.Mesh(new THREE.CircleGeometry(r * 0.3, 18), new THREE.MeshBasicMaterial({ map: gusBadge() })));
    badge.position.set(0, r * 0.38, r * 0.92);
    badge.rotation.x = -0.35;
    const button = mark(new THREE.Mesh(new THREE.SphereGeometry(r * 0.1, 8, 6), std(0xffd23f)));
    button.position.y = r * 0.74;
    g.add(dome, brim, badge, button);
    g.position.y = -r * 0.32;
  } else if (id === 'hat-prop') {
    const cols = [0xff3b30, 0xffd23f, 0x3c8bff, 0x3cff6b];
    for (let i = 0; i < 4; i++) {
      const s = mark(new THREE.Mesh(new THREE.SphereGeometry(r * 1.02, 10, 10, (i * Math.PI) / 2, Math.PI / 2, 0, Math.PI / 2), std(cols[i], { roughness: 0.8 })));
      s.scale.y = 0.7;
      g.add(s);
    }
    const stem = mark(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.05, r * 0.05, r * 0.35, 6), std(0xdddddd, { metalness: 0.6 })));
    stem.position.y = r * 0.85;
    const prop = new THREE.Group();
    prop.position.y = r * 1.02;
    for (const s of [-1, 1]) {
      const blade = mark(new THREE.Mesh(new THREE.BoxGeometry(r * 0.9, r * 0.03, r * 0.2), std(s < 0 ? 0xff3b30 : 0x3c8bff)));
      blade.position.x = s * r * 0.45;
      blade.rotation.x = s * 0.25;
      prop.add(blade);
    }
    g.add(stem, prop);
    g.userData.prop = prop;
    g.position.y = -r * 0.3;
  } else if (id === 'hat-crown') {
    const gold = std(0xffc21a, { metalness: 0.85, roughness: 0.28, emissive: 0x3a2600 });
    const band = mark(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.82, r * 0.78, r * 0.34, 24, 1, true), gold));
    band.material.side = THREE.DoubleSide;
    band.position.y = r * 0.17;
    g.add(band);
    const gems = [0xff1a3c, 0x2d7bff, 0x3cff6b];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const pt = mark(new THREE.Mesh(new THREE.ConeGeometry(r * 0.15, r * 0.36, 6), gold));
      pt.position.set(Math.sin(a) * r * 0.8, r * 0.5, Math.cos(a) * r * 0.8);
      const ball = mark(new THREE.Mesh(new THREE.SphereGeometry(r * 0.07, 8, 6), gold));
      ball.position.set(Math.sin(a) * r * 0.8, r * 0.7, Math.cos(a) * r * 0.8);
      const gem = mark(new THREE.Mesh(new THREE.SphereGeometry(r * 0.08, 8, 6), std(gems[i % 3], { roughness: 0.1, metalness: 0.2, emissive: gems[i % 3], emissiveIntensity: 0.3 })));
      gem.position.set(Math.sin(a) * r * 0.82, r * 0.17, Math.cos(a) * r * 0.82);
      g.add(pt, ball, gem);
    }
    g.position.y = -r * 0.12;
  }
  g.traverse((o) => { o.userData.hat = true; if (o.isMesh) o.castShadow = true; });
  g.position.y += top.y;
  g.position.z = top.z;
  return g;
}

function buildSlice() {
  const g = new THREE.Group();
  const tri = new THREE.Shape();
  tri.moveTo(0, 0); tri.lineTo(-0.08, 0.17); tri.lineTo(0.08, 0.17); tri.closePath();
  const cheese = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.015, bevelEnabled: false }), std(0xffc23a, { roughness: 0.6 }));
  const crust = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.17, 8), std(0xc77a32, { roughness: 0.8 }));
  crust.rotation.z = Math.PI / 2;
  crust.position.set(0, 0.17, 0.008);
  g.add(cheese, crust);
  for (const [x, y] of [[0, 0.07], [-0.03, 0.12], [0.03, 0.12]]) {
    const pep = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.004, 10), std(0xc0262d));
    pep.rotation.x = Math.PI / 2;
    pep.position.set(x, y, 0.017);
    g.add(pep);
  }
  // held point-up in the fist, facing you
  g.rotation.set(-Math.PI / 2, 0, Math.PI);
  return g;
}

function buildBoard() {
  const g = new THREE.Group();
  const deckTex = canvasTex(128, 32, (c) => {
    c.fillStyle = '#1a1a1a'; c.fillRect(0, 0, 128, 32);
    c.fillStyle = '#ffd23f'; c.fillRect(0, 0, 128, 4); c.fillRect(0, 28, 128, 4);
    c.fillStyle = '#ff3fa4'; c.font = 'bold 18px sans-serif'; c.textAlign = 'center'; c.fillText('GUS', 64, 23);
  });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.82), std(0xffffff, { map: deckTex, roughness: 0.8 }));
  deck.position.y = 0.07;
  g.add(deck);
  for (const z of [-0.3, 0.3]) {
    const truck = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.025, 0.04), std(0x999999, { metalness: 0.7 }));
    truck.position.set(0, 0.04, z);
    g.add(truck);
  }
  g.userData.wheels = [];
  for (const x of [-0.11, 0.11]) for (const z of [-0.3, 0.3]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.03, 12), std(0x2de2e6, { roughness: 0.4 }));
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.032, z);
    const spin = new THREE.Group();
    spin.position.copy(w.position);
    w.position.set(0, 0, 0);
    spin.add(w);
    g.add(spin);
    g.userData.wheels.push(spin);
  }
  return g;
}

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function gusBadge() {
  return canvasTex(64, 64, (c) => {
    c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(32, 32, 31, 0, 7); c.fill();
    c.fillStyle = '#6a2bb8'; c.font = 'bold 40px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('G', 32, 35);
  });
}

let zTex = null;
function zTexture() {
  if (!zTex) {
    zTex = canvasTex(64, 64, (c) => {
      c.font = 'bold 52px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineWidth = 6; c.strokeStyle = '#1a0a24'; c.strokeText('Z', 32, 34);
      c.fillStyle = '#9fe0ff'; c.fillText('Z', 32, 34);
    });
  }
  return zTex;
}

let stripeTex = null;
function stripes() {
  if (!stripeTex) {
    stripeTex = canvasTex(128, 128, (c) => {
      c.fillStyle = '#8d9099'; c.fillRect(0, 0, 128, 128);
      c.fillStyle = '#6c6f78';
      for (let y = 0; y < 128; y += 10) c.fillRect(0, y, 128, 3);   // the slats
      c.fillStyle = '#ffd23f'; c.fillRect(0, 100, 128, 28);
      c.fillStyle = '#1a1a1a';
      for (let x = -28; x < 128; x += 24) { c.beginPath(); c.moveTo(x, 128); c.lineTo(x + 12, 128); c.lineTo(x + 40, 100); c.lineTo(x + 28, 100); c.fill(); }
    });
  }
  return stripeTex;
}

// "Noice" in the device's voice (where it has one).
function sayNoice() {
  try {
    if (typeof speechSynthesis === 'undefined') return;
    const u = new SpeechSynthesisUtterance('Noice.');
    u.rate = 0.75;
    u.pitch = 0.8;
    speechSynthesis.speak(u);
  } catch { /* no voice */ }
}
