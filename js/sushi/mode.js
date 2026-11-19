// Sushi's Pizzaplex: the designer's fourth story. Tom, 12, and his friends Bob, Billy and Tim
// sneak into the old, closed Sushi's Pizzaplex on a dare, four years before Gus's PlayPlace —
// and find out who's been behind everything all along.
//
// It runs on When Jonathan Was Five's engine (js/escape/mode.js): the part list, story cards,
// quests on the Gus Watch, save boxes, hiding, getting caught, winning. On top of that it adds
// what the designer asked for: cards that open locked doors (and upgrade), vents you crawl
// through (above and below), friends to find, plushies for a shelf (and a secret ending), and
// Peter.
import { EscapeMode } from '../escape/mode.js';
import { makePerson } from '../cutscene.js';
import { poseRig } from '../models.js';
import { requestPointerLock } from '../input.js';
import { sfx, startAmbience } from '../audio.js';
import { KID } from '../config.js';
import { Follower } from '../plex/followers.js';
import { PARTS } from './parts.js';
import { SUSHI_STORY } from './story.js';
import { buildTom, buildBob, buildBilly, buildTim, tomHands } from './cast.js';
import { Rider, Puppet } from './enemies.js';
import { CARDS, opens, bestCard, PLUSHIES, PLUSH_COUNT, setShelf, crawl } from './kit.js';

const $ = (id) => document.getElementById(id);

// Tom is twelve: taller and quicker than little Jonathan at five.
const TOM = { ...KID, eyeHeight: 1.36, walkSpeed: 4.0, sprintSpeed: 6.6, crouchHeight: 0.75, crouchSpeed: 2.0, radius: 0.3 };

// What the Gift Shop's shelf gives you as it fills up (the designer: plushies are for a shelf,
// for trading in for better cards or gear, and a secret ending — all three).
const SHELF = [
  { n: 2, id: 'sneak', text: '🧦 Sneaky socks — nothing can hear you run' },
  { n: 4, id: 'vip', text: '💗 The VIP card — VIP Seating is open' },
  { n: 6, id: 'shoes', text: '👟 Running shoes — run twice as long' },
  { n: 8, id: 'light', text: '🔦 Super flashlight — brighter, and it lasts forever' },
  { n: 10, id: 'chance', text: '🍀 Lucky coin — get away once, every part' },
];

// Things you can always press E on (not just while a quest wants them).
const FREE = new Set(['trade', 'oven', 'photo']);

const SUSHI = {
  key: 'sushi', levels: PARTS, area: 'sushi', offsetZ: 800, unit: 'Part', buddy: null, box: false,
  eyebrow: "SUSHI'S PIZZAPLEX",
  menu: {
    eyebrow: "FOUR YEARS BEFORE GUS'S PLAYPLACE",
    title: "SUSHI'S<span>PIZZAPLEX</span>",
    brief: 'Tom and his friends Bob, Billy and Tim sneak into the old, closed <b>Sushi\'s Pizzaplex</b> on a dare. Find your friends, collect <b>cards</b> to open the locked doors, crawl through the <b>vents</b>, and find every <b>plushie</b>.',
  },
  resumeLine: 'Back at the save box. Okay... keep going.',
  againText: '▶ Play it again',
  finale: 'sushiFinale', secret: 'sushiSecret',
};

// A friend crawling along behind you in the vents (the last part). In a duct there's no room
// to walk beside you, so they follow your trail in a line, one behind the other.
class CrawlFollower extends Follower {
  update(dt) {
    if (!this.root.visible) return;
    if (!this.with) { this.wait(dt); return; }
    const trail = this.mode.trail;
    this.t += dt;
    this.speed = 0;
    const back = this.slot[0] * 4;     // breadcrumbs are 0.3 m apart
    const goal = trail.length > back ? trail[trail.length - 1 - back] : this.pos;
    const dx = goal.x - this.pos.x, dz = goal.z - this.pos.z, d = Math.hypot(dx, dz);
    let pose = 'idle';
    if (d > 12) this.pos.set(goal.x, 0, goal.z);
    else if (d > 0.12) {
      const step = Math.min(d, Math.min(6.5, d * 4 + 1) * dt);
      this.pos.x += (dx / d) * step;
      this.pos.z += (dz / d) * step;
      this.yaw = Math.atan2(dx, dz);
      this.speed = step / dt;
      if (this.speed > 0.3) pose = 'walk';
    }
    this.draw(pose, dt);
  }

  draw(pose, dt) {
    const m = this.mode;
    this.root.position.set(this.pos.x, m.place.floorAt(this.pos.x, this.pos.z), this.pos.z);
    this.root.rotation.set(0, this.yaw, 0);
    const low = inVent(m, this.pos);
    const walking = pose === 'walk';
    poseRig(this.rig, low ? 'crouch' : pose, walking ? this.t * (low ? 6 : 11) : this.t, low && !walking ? 0.2 : 1, dt || 1 / 60);
  }
}

function inVent(m, v) {
  return (m.decor.vents || []).some((z) => {
    const a = m.place.P(z.x0, z.z0), b = m.place.P(z.x1, z.z1);
    return v.x > a.x && v.x < b.x && v.z > a.z && v.z < b.z;
  });
}

export class SushiMode extends EscapeMode {
  constructor(game) {
    super(game, SUSHI);
    this.cards = new Set();
    this.followers = [];
    this.posed = new Map();      // friends standing about: person → { pose, amt }
    this.trail = [];             // where you've walked, for the friends crawling behind you
  }

  get plush() { return this.save.plush || (this.save.plush = {}); }

  // ── Who's who ─────────────────────────────────────────────────────────

  makeCast() {
    const sc = this.game.scene;
    const person = (name, build) => Object.assign(makePerson(sc, build), { name });
    this.people = {
      tom: person('Tom', buildTom), bob: person('Bob', buildBob), billy: person('Billy', buildBilly), tim: person('Tim', buildTim),
    };
    return Object.values(this.people);
  }

  actor(who) {
    if (!this.inStory) return null;
    const p = this.people;
    const foe = (id) => this.level?.enemies.find((e) => e.id === id) || null;
    if (who === 'Peter' || who === '???') return foe('peter');
    if (who === 'Sushi') return foe('sushi');
    if (who === 'Gerald') return foe('gerald');
    return { Tom: p.tom, Bob: p.bob, Billy: p.billy, Tim: p.tim }[who] || null;
  }

  setupHero(p) {
    p.kid = true;
    p.sizes = TOM;
    p.vmBuild = tomHands;
  }

  timeText() { return `PART ${this.level ? this.level.n : 1}`; }

  heroBody() { return ['sushi-tom', buildTom]; }
  heroName() { return ['Tom', '🧡']; }
  speaker() { return 'Tom'; }

  // ── Building and starting a part ──────────────────────────────────────

  build(n) {
    const had = this.built.has(n);
    const lv = super.build(n);
    if (!had) {
      for (const it of lv.decor.items) if (it.kind === 'splush') it.name = PLUSHIES[it.id].name;
      for (const t of lv.decor.targets) if (FREE.has(t.id) || /^(rope|toy)/.test(t.id)) t.free = true;
    }
    return lv;
  }

  start(n, opts) {
    super.start(n, opts);
    this.updateCardHud();
  }

  // Every part's start() calls this first: your cards, the plushies you've already got, the
  // shelf, the locks shut again (for a retry), nobody standing about yet.
  setUp() {
    const d = this.decor;
    this.cards = new Set([...(this.def.cards || []), ...(this.flags.cards || [])]);
    for (const it of d.items) if (it.kind === 'splush' && this.plush[it.id]) this.setFound(it, true);
    for (const l of d.cardDoors || []) l.set(true);
    this.doorNotes = new Map();
    this.ventToast = false;
    this.trainT = null;
    this.hideFriends();
    this.stopFollowers();
    setShelf(d, this.shelfMap());
    this.applyShelf(true);
  }

  leave() {
    super.leave();
    this.hideFriends();
    this.stopFollowers();
  }

  // ── Cards ─────────────────────────────────────────────────────────────

  hasCard(c) { return opens(this.cards, c); }

  giveCard(c) {
    if (this.cards.has(c)) return;
    this.cards.add(c);
    this.flags.cards = [...new Set([...(this.flags.cards || []), c])];
    const info = CARDS[c];
    sfx.escUnlock();
    this.game.hud.toast(`🎫 You got the ${info.icon} ${info.name}!`, 3.4);
    this.updateCardHud();
  }

  updateCardHud() {
    if (!this.level) return;
    const best = bestCard(this.cards);
    const card = best ? ` · ${CARDS[best].icon} ${CARDS[best].name.toUpperCase()}` : ' · NO CARD YET';
    const extra = (this.cards.has('daycare') && best !== 'badge' && best !== 'daycare' ? ' · 🟪 DAYCARE' : '') + (this.cards.has('vip') ? ' · 💗 VIP' : '');
    $('escLevel').textContent = `PART ${this.level.n} · ${this.def.name.toUpperCase()}${card}${extra}`;
  }

  // Walk up to a card door: it opens if you've got the right card, and tells you which one it
  // wants if you haven't.
  tickDoors() {
    const d = this.decor;
    for (const lock of d.cardDoors || []) {
      if (!lock.locked) continue;
      const near = this.game.alive().some((p) => Math.hypot(p.pos.x - lock.pos.x, p.pos.z - lock.pos.z) < (lock.vent ? 1.7 : 2.3));
      if (!near) continue;
      const info = CARDS[lock.need];
      if (this.hasCard(lock.need)) {
        lock.set(false);
        sfx.escUnlock();
        this.game.hud.toast(`🎫 Beep! ${lock.vent ? 'The vent grate' : lock.label} — open!`, 2.4);
        continue;
      }
      const t = this.game.t;
      if ((this.doorNotes.get(lock) ?? -99) > t - 5) continue;
      this.doorNotes.set(lock, t);
      sfx.repairBad();
      this.game.hud.toast(`🔒 ${lock.vent ? 'This vent grate' : lock.label} needs the ${info.icon} ${info.name}.`, 2.8);
    }
  }

  // ── Plushies and the shelf ────────────────────────────────────────────

  plushCount() { return Object.keys(PLUSHIES).filter((id) => this.plush[id]).length; }
  shelfCount() { return Object.keys(PLUSHIES).filter((id) => this.plush[id] === 'shelf').length; }
  shelfMap() { return Object.fromEntries(Object.keys(PLUSHIES).map((id) => [id, this.plush[id] === 'shelf'])); }

  collect(item) {
    if (item.kind !== 'splush') { super.collect(item); return; }
    this.setFound(item, true);
    sfx.escCollect();
    this.game.effects.burst(item.pos.clone().setY(0.6), 10, 2);
    if (!this.plush[item.id]) this.plush[item.id] = 'bag';
    this.game.save();
    this.game.hud.toast(`🧸 Found the ${item.name}! (${this.plushCount()} of ${PLUSH_COUNT}) Trade it at the Gift Shop to put it on the shelf.`, 3.6);
    this.check('collect', 'splush');
    if (this.watch.open) this.watch.render();
  }

  // The trade counter: everything in your backpack goes up on the shelf.
  trade() {
    const bag = Object.keys(PLUSHIES).filter((id) => this.plush[id] === 'bag');
    if (!bag.length) {
      sfx.repairBad();
      this.game.hud.toast(this.shelfCount() === PLUSH_COUNT ? '🧸 Every plushie is on the shelf!' : '🧸 You haven\'t got any plushies to trade. Find some!', 2.8);
      return;
    }
    for (const id of bag) this.plush[id] = 'shelf';
    this.game.save();
    setShelf(this.decor, this.shelfMap());
    sfx.happy();
    const n = this.shelfCount();
    this.game.hud.toast(`🧸 ${bag.length === 1 ? 'A plushie' : `${bag.length} plushies`} up on the shelf! (${n} of ${PLUSH_COUNT})`, 3);
    this.applyShelf(false);
    this.check('trade');
    if (n === PLUSH_COUNT) setTimeout(() => this.say('Every single plushie... the shelf just went CLICK.', 3), 3400);
  }

  // What the shelf has given you so far. `quiet` at the start of a part; out loud after a trade.
  applyShelf(quiet) {
    const n = this.shelfCount();
    const got = [];
    for (const r of SHELF) {
      if (r.n > n) continue;
      if (r.id === 'vip') {
        if (!this.cards.has('vip')) { this.cards.add('vip'); got.push(r); }
        continue;
      }
      if (r.id === 'chance') {
        if (!this.flags.luck) { this.flags.luck = true; this.upgrades.add('chance'); got.push(r); }
        continue;
      }
      if (this.upgrades.has(r.id)) continue;
      this.upgrades.add(r.id);
      got.push(r);
      if (r.id === 'shoes') this.forAll((p) => { p.maxStamina *= 2; p.stamina = p.maxStamina; });
      if (r.id === 'light') this.forAll(() => this.applyLight());
    }
    this.updateCardHud();
    if (quiet) return;
    got.forEach((r, i) => setTimeout(() => this.game.hud.toast(`🎁 The shelf gave you: ${r.text}`, 3.6), 3200 + i * 3800));
    const next = SHELF.find((r) => r.n > n);
    if (next && !got.length) setTimeout(() => this.game.hud.toast(`🧸 ${next.n - n} more on the shelf for: ${next.text}`, 3.2), 3200);
  }

  // Every plushie found: that's the secret ending.
  allQuestsDone() { return this.plushCount() === PLUSH_COUNT; }

  playSecret(done) {
    this.save.secret = true;
    this.game.save();
    this.playCutscene(this.story.secret, 3, () => { this.leave(); done(); });
  }

  // ── Pressing E ────────────────────────────────────────────────────────

  interaction() {
    const base = super.interaction();
    if (this.hiding || (base && !base.quiet)) return base;
    const p = this.player;
    for (const t of this.decor.targets) {
      if (!t.free || Math.hypot(t.point.x - p.pos.x, t.point.z - p.pos.z) > t.reach) continue;
      return { text: `<b>E</b> ${t.name}`, act: () => this.useFree(t) };
    }
    return base;
  }

  useFree(t) {
    if (t.id === 'trade') { this.trade(); return; }
    if (t.id === 'oven') {
      const g = this.decor.ovenGlow;
      if (g) g.material.color.set(0xff6a1a).multiplyScalar(2.5);
      sfx.escCollect();
      this.say('*ding!* ...Ew. It\'s REALLY old pizza. Like, green.', 3);
      this.check('pizza');
      return;
    }
    if (t.id === 'photo') {
      this.say('Sushi\'s opening day, years and years ago. In the corner there\'s a teenager in a raggedy OTTER costume. It says: "PETER — OUR REPAIR GUY."', 5.4);
      this.check('photo');
      return;
    }
    if (this.def.use) this.def.use(this, t, null);
  }

  // Up a rope, onto the platform at the top.
  climb(t) {
    const p = this.player;
    p.pos.set(t.top.x, t.top.y, t.top.z);
    p.crouching = false;
    sfx.escHide();
    this.say('Up we go! (Step off the edge to come back down.)', 2.6);
  }

  // ── Friends ───────────────────────────────────────────────────────────

  // A friend standing (or crouching, or crying) somewhere. `yaw` as the animatronics use it.
  placeFriend(id, [px, pz], yaw = 0, pose = 'idle', y = null) {
    const f = this.people[id];
    const p = this.place.P(px, pz);
    f.root.position.set(p.x, y ?? this.place.floorAt(p.x, p.z), p.z);
    f.root.rotation.set(0, yaw, 0);
    f.root.visible = true;
    this.posed.set(f, { pose, amt: pose === 'idle' ? 0.4 : 1 });
  }

  friendUp(id) { this.flags[id] = true; }

  hideFriends() {
    for (const f of Object.values(this.people || {})) f.root.visible = false;
    this.posed.clear();
  }

  // The last part: all three crawl along behind you.
  followAll(spots) {
    if (!this.followers.length) {
      this.followers = [['bob', [1, 0]], ['billy', [2, 0]], ['tim', [3, 0]]]
        .map(([id, slot]) => new CrawlFollower(this, this.people[id], slot));
    }
    this.trail = [];
    this.followers.forEach((f, i) => {
      f.place(this.place.P(...spots[i]), 0);
      f.with = true;
    });
  }

  stopFollowers() {
    for (const f of this.followers) { f.with = false; f.hide(); }
  }

  // Where the Gus Watch's tracker says everybody is.
  friendLines() {
    const n = this.level ? this.level.n : 1, fl = this.flags;
    const line = (icon, name, where) => `<div class="gw-bot">${icon} ${name}: <b>${where}</b></div>`;
    const safe = 'Back Room · safe';
    const bob = n === 1 && !fl.bob ? 'Laser Tag? · nobody knows' : n === 4 ? 'right behind you' : safe;
    const billy = n < 3 ? '??? · on the walkie' : n === 4 ? 'right behind you' : fl.billy ? safe : 'Go-Karts · hiding in the garage';
    const tim = n < 3 ? '??? · nobody\'s seen him' : n === 4 ? 'right behind you' : fl.tim ? safe : 'the roller coaster · STUCK';
    return [line('🔵', 'Bob', bob), line('⚫', 'Billy', billy), line('🟢', 'Tim', tim)];
  }

  // What the riders and Gerald are doing, for the tracker.
  statusOf(e) {
    if (e instanceof Rider) {
      if (e.state === 'off') return { text: '😴 asleep', still: true };
      if (e.chasing) return { text: '🚨 COMING YOUR WAY!', hot: true };
      return { text: e.id === 'chomper' ? '🎢 riding the coaster' : '🏎️ driving round the track' };
    }
    if (e instanceof Puppet && e.good) return { text: '💙 friendly now', still: true };
    return super.statusOf(e);
  }

  // ── Each step ─────────────────────────────────────────────────────────

  update(dt) {
    const g = this.game;
    // you can't stand up in a vent
    if (this.level && !this.ctrl && g.mode === 'escape') this.forAll(() => crawl(this, this.decor.vents));
    super.update(dt);
    if (g.mode !== 'escape' || !this.level) return;
    this.tickDoors();
    for (const [f, st] of this.posed) if (f.root.visible) poseRig(f.rig, st.pose, g.t * (st.pose === 'cry' ? 3 : 1), st.amt, dt);
    if (this.followers.some((f) => f.with)) {
      // where you've been, for your friends to follow
      const p = this.player.pos, last = this.trail[this.trail.length - 1];
      if (!last || Math.hypot(p.x - last.x, p.z - last.z) > 0.3) this.trail.push(p.clone().setY(0));
      if (this.trail.length > 120) this.trail.shift();
    }
    for (const f of this.followers) if (f.root.visible) f.update(dt);
  }

  // A cutscene in the middle of a part (Peter waking up), and back to it right where you were.
  midScene(id, after) {
    const g = this.game, lv = this.level;
    this.inStory = true;
    this.watch.toggle(false);
    g.hud.prompt(null);
    g.cutscene(id, () => {
      this.inStory = false;
      g.setArea(this.areaName(lv.n));
      g.lighting.setEscape(lv.decor, lv.def.mood);
      g.showScreen('escape');
      startAmbience('night');
      for (const p of g.players) { p.vmGroup.visible = true; p.lightVisible = true; }
      this.forAll(() => this.applyLight());
      if (!g.touch.active) { requestPointerLock(); $('clickToPlay').classList.remove('hidden'); }
      if (after) after();
    });
  }

  // ── Menus ─────────────────────────────────────────────────────────────

  showMenu() {
    super.showMenu();
    const e = this.save;
    const n = this.plushCount();
    $('escPlushies').textContent = n ? `🧸 Plushies found: ${n} of ${PLUSH_COUNT} · on the Gift Shop shelf: ${this.shelfCount()}` : '';
    const qt = this.questTotals();
    $('escQuests').innerHTML = e.secret
      ? `⭐ Every plushie found (${PLUSH_COUNT} of ${PLUSH_COUNT}) — you found the <b>SECRET ENDING!</b>`
      : `⭐ Quests done: <b>${qt.done} of ${qt.total}</b> — find all ${PLUSH_COUNT} plushies for a secret...`;
  }

  win() {
    super.win();
    $('escWinPlush').textContent += ` · 🧸 Plushies: ${this.plushCount()} of ${PLUSH_COUNT}`;
  }

  // On the title screen: a badge for getting everybody out.
  titleBadge() { $('sushiTag').classList.toggle('hidden', !this.save.done); }

  // ── From the console (?debug=1) ───────────────────────────────────────

  allPlushies() {
    for (const id of Object.keys(PLUSHIES)) this.plush[id] = 'shelf';
    this.game.save();
    if (this.level) { setShelf(this.decor, this.shelfMap()); this.applyShelf(false); }
  }
}

export { SUSHI_STORY };
