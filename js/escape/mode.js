// When Jonathan Was Five: the story of Jonathan and his best friend Jack, ten years before
// Gus's PlayPlace. At the overnight daycare they see a Night Bot go after somebody, and they
// run — through the daycare, a library, a school, a hospital, a shopping mall, a museum and a
// movie theater — until they end up at Gus's Giant Pizza Palace, where they have to survive
// until 6 AM while the baby Gus's toddle about.
//
// Each level (js/escape/levels/) is its own Building, built the first time you reach it, with
// quests on your Gus Watch: things to find and use, and then the exit. Smiling SAVE boxes
// remember how far you got; get caught and you're back at the last one you touched.
//
// The game's state machine hands over to this while `game.mode` is one of:
//   escMenu   the level list         escCard   a level's story card
//   escape    playing a level        escScare  the jumpscare
//   escWin    a level escaped
import * as THREE from 'three';
import { input, requestPointerLock, exitPointerLock } from '../input.js';
import { sfx, playMusic, stopMusic, startAmbience, stopAmbience } from '../audio.js';
import { Building } from '../map.js';
import { poseRig, setEyes } from '../models.js';
import { makePerson } from '../cutscene.js';
import { EscapeDecor } from './decor.js';
import { Stalker, Watcher } from './enemies.js';
import { Jack } from './jack.js';
import { GusWatch, ENTITY } from './watch.js';
import { buildKidViewmodel, buildLittleJonathan, buildTeacher, buildMom, buildYoungJohn } from './cast.js';
import { jimmyHands } from '../plex/cast.js';
import { LEVELS } from './levels/index.js';
import { STORY } from './story.js';
import { LUNGE, STATIC, holdFor, placeScare, finishScare, showStatic, drawStatic, hideStatic } from '../jumpscare.js';

const $ = (id) => document.getElementById(id);

const REWARDS = {
  radar: 'Baby Gus radar: they show up on your map',
  shoes: 'Light-up running shoes: run twice as long',
  light: 'Super flashlight: brighter, and lasts forever',
  beeper: 'Danger beeper: your watch beeps when one is close',
  sneak: 'Sneaky socks: nothing can hear you run',
  chance: 'Lucky Gus coin: get away once if you\'re caught',
  items: 'Finder: the things you need show on your map',
};

// When Jonathan Was Five, as a story this engine plays. Lost in the Pizzaplex (js/plex/) is
// another: same engine, its own chapters, save, cast and menu words.
export const FIVE = {
  key: 'escape', levels: LEVELS, area: 'esc', offsetZ: 0, unit: 'Level', buddy: 'Jack', box: true,
  eyebrow: 'WHEN JONATHAN WAS FIVE',
  menu: {
    eyebrow: 'TEN YEARS BEFORE GUS\'S PLAYPLACE',
    title: 'WHEN JONATHAN<span>WAS FIVE</span>',
    brief: 'Jonathan and his best friend Jack escape the overnight daycare... and keep running. Find what you need on your <b>Gus Watch</b> (<b>G</b>), hide in your <b>box</b> (<b>B</b>, 30 seconds!), and touch every <b>save box</b>.',
  },
  resumeLine: 'We\'re back at the save box. Let\'s keep going!',
  finale: 'finale', secret: 'secretEnding',
};

// A story's quiet companion, for when nobody tags along.
const NO_BUDDY = {
  root: { visible: false }, pointed: new Set(), pos: new THREE.Vector3(),
  place() {}, hide() {}, come() {}, update() {},
};

export class EscapeMode {
  constructor(game, story = FIVE) {
    this.game = game;
    this.story = story;
    this.levels = story.levels;
    this.built = new Map();     // level n → { def, place, decor, enemies, area }
    this.level = null;
    this.grace = 0;
    this.sayT = 0;
    this.done = new Set();
    this.used = new Set();
    this.upgrades = new Set();
    this.flags = {};
    this.jack = story.buddy ? new Jack(this) : NO_BUDDY;
    this.cast = this.makeCast();
    this.watch = new GusWatch(this);
    // The box you carry (the designer's idea): hide in it anywhere, but only for 30 seconds,
    // and then it has to fill back up before you can use it again. (Two playing: one each.)
    this.boxMeshes = [buildCardboardBox(), buildCardboardBox()];
    for (const b of this.boxMeshes) { b.visible = false; game.scene.add(b); }
    this.wireUI();
  }

  get player() { return this.game.player; }
  // Each player's own: where they're hiding, their box, the room they're in. (`player` is
  // whoever's turn it is — see game.js — so these are always about the right one.)
  get hiding() { return this.player.hiding || null; }
  set hiding(v) { this.player.hiding = v; }
  get hideYaw() { return this.player.hideYaw || 0; }
  set hideYaw(v) { this.player.hideYaw = v; }
  get room() { return this.player.escRoom ?? null; }
  set room(v) { this.player.escRoom = v; }
  get box() { return this.player.escBox || (this.player.escBox = { charge: BOX_SECONDS }); }
  get boxMesh() { return this.boxMeshes[this.player.index]; }

  // Who player 1 looks like to player 2, and what their half of the screen calls them.
  heroBody() { return ['jonathan5', buildLittleJonathan]; }
  heroName() { return ['Jonathan', '🧸']; }

  // Everyone (both of you, when two are playing), for a fresh start.
  forAll(fn) { for (const p of this.game.players) this.game.withPlayer(p, () => fn(p)); }
  get place() { return this.level ? this.level.place : this.game.place; }
  get decor() { return this.level.decor; }
  get enemies() { return this.level ? this.level.enemies : []; }
  get def() { return this.level.def; }
  get save() { return this.game.profile[this.story.key]; }
  get total() { return this.story.total || this.levels.length; }
  areaName(n) { return `${this.story.area}${n}`; }

  // Everyone who's only in the cutscenes.
  makeCast() {
    const sc = this.game.scene;
    this.kid = makePerson(sc, buildLittleJonathan);
    this.teacher = makePerson(sc, buildTeacher);
    this.moms = [makePerson(sc, () => buildMom(false)), makePerson(sc, () => buildMom(true))];
    this.john = makePerson(sc, buildYoungJohn);
    return [this.kid, this.teacher, ...this.moms, this.john];
  }

  // Who you are in this level: little Jonathan, in When Jonathan Was Five.
  setupHero(p) {
    p.kid = true;
    p.vmBuild = buildKidViewmodel;
  }

  // ── Menus ─────────────────────────────────────────────────────────────

  // The menus are shared by every story, so their buttons act on whichever one is open.
  wireUI() {
    if (EscapeMode.wired) return;
    EscapeMode.wired = true;
    const g = this.game;
    const click = (id, fn) => $(id).addEventListener('click', () => { sfx.ui(); fn(g.story); });
    click('btnFive', () => g.escape.showMenu());
    click('btnPlex', () => g.plex.showMenu());
    click('btnEscBack', () => g.toTitle('survival'));
    click('btnEscGo', (m) => m.begin(m.cardLevel));
    click('btnEscCardBack', (m) => m.showMenu());
    click('btnEscWinGo', (m) => m.afterWin());
    click('btnEscWinMenu', () => g.toTitle(g.campaign.on ? 'story' : 'main'));
    click('btnEscSecret', (m) => m.playSecret(() => m.showMenu()));
  }

  // The level list: everything you've reached (everything, in debug mode), and Continue.
  // (Story mode has no level list: "without chapters". Back from a card is back to its menu.)
  showMenu() {
    const g = this.game;
    if (g.campaign.on) { g.toTitle('story'); return; }
    g.story = this;
    this.leave();
    g.setArea('playplace');
    g.lighting.set('title');
    const st = this.story, unit = st.unit;
    const L = this.levels;
    $('escMenu').classList.toggle('screen-plex', !!st.plex);
    $('escCard').classList.toggle('screen-plex', !!st.plex);
    $('escMenuEyebrow').textContent = st.menu.eyebrow;
    $('escMenuTitle').innerHTML = st.menu.title;
    $('escMenuBrief').innerHTML = st.menu.brief;
    const e = this.save;
    const open = g.debugMode ? L.length : Math.min(L.length, e.level);
    // (a chapter that isn't built yet can't be played: Continue goes to the furthest one that is)
    const grid = $('escLevels');
    grid.innerHTML = '';
    grid.classList.toggle('many', this.total > 12);
    for (let n = 1; n <= this.total; n++) {
      const def = L[n - 1];
      const b = document.createElement('button');
      // (chapters that aren't built yet are on the list too, coming soon)
      if (!def) {
        b.className = 'btn esc-level locked soon';
        b.disabled = true;
        b.innerHTML = `<span class="esc-n">${n}</span><span class="esc-name">${st.soon ? st.soon(n) : 'Coming soon'}</span>`;
        grid.appendChild(b);
        continue;
      }
      b.className = 'btn esc-level' + (n <= open ? '' : ' locked') + (e.stars[n] ? ' star' : '');
      b.disabled = n > open;
      const who = def.hero && st.heroes ? `<span class="esc-who">${st.heroes[def.hero].icon} ${st.heroes[def.hero].name}</span>` : '';
      b.innerHTML = `<span class="esc-n">${n}</span>${who}<span class="esc-name">${n <= open ? def.name : '???'}</span>` +
        (e.plushies[n] ? '<span class="esc-plush" title="Golden Gus plushie found">🧸</span>' : '');
      b.addEventListener('click', () => { sfx.ui(); this.showCard(n); });
      grid.appendChild(b);
    }
    let cont = e.save && e.save.level <= open ? e.save.level : Math.min(open, L.length);
    while (cont > 1 && !L[cont - 1]) cont--;
    const go = $('btnEscContinue');
    const again = st.againText || '▶ Play the pizza place again';
    go.textContent = e.done && !e.save ? again : e.save ? `▶ Continue ${unit} ${cont} (from your save)` : `▶ ${e.level > 1 ? 'Continue' : 'Start'}: ${unit} ${cont}`;
    go.onclick = () => { sfx.ui(); this.showCard(cont); };
    const plush = Object.keys(e.plushies).length;
    $('escPlushies').textContent = plush ? `🧸 Golden Gus plushies found: ${plush} of ${L.length}` : '';
    const qt = this.questTotals();
    $('escQuests').innerHTML = !st.secret ? `⭐ Quests done: <b>${qt.done} of ${qt.total}</b>`
      : e.secret
        ? `⭐ Every quest done (${qt.total} of ${qt.total}) — you found the <b>SECRET ENDING!</b>`
        : `⭐ Quests done: <b>${qt.done} of ${qt.total}</b> — do every quest in every ${unit.toLowerCase()} for a secret...`;
    $('btnEscSecret').classList.toggle('hidden', !e.secret || !st.secret);
    g.showScreen('escMenu');
    playMusic(g.nightmare ? 'nightmare' : 'title');
  }

  // A level's story card: where they are now, and what they have to do.
  showCard(n) {
    const g = this.game;
    const def = this.levels[n - 1];
    g.story = this;
    this.cardLevel = n;
    g.setArea('playplace');
    g.lighting.set('title');
    const hero = def.hero && this.story.heroes ? this.story.heroes[def.hero] : null;
    // (Story mode doesn't count chapters)
    const where = g.campaign.on ? `📖 STORY · ${this.story.eyebrow}` : `${this.story.eyebrow} · ${this.story.unit.toUpperCase()} ${n} OF ${this.total}`;
    $('escCardEyebrow').textContent = where + (hero ? ` · ${hero.icon} ${hero.name.toUpperCase()}, ${hero.age}` : '');
    $('escCardTitle').textContent = def.name;
    $('escCardStory').innerHTML = def.card.story;
    $('escCardGoal').innerHTML = def.card.goal;
    $('escCardWho').innerHTML = def.card.watchOut;
    const s = this.save.save;
    $('btnEscGo').textContent = s && s.level === n ? '▶ Go (from your save box)' : def.goText || (def.clock ? '▶ Survive the night' : '▶ Escape!');
    g.showScreen('escCard');
  }

  // The first time, level 1 opens with the cutscene at the daycare; the last level ends with one.
  begin(n) {
    const seen = this.save.seen;
    const def = this.levels[n - 1];
    if (def.intro && !seen[def.intro]) {
      seen[def.intro] = true;
      this.game.save();
      this.playCutscene(def.intro, n, () => this.start(n, { resume: true }));
      return;
    }
    this.start(n, { resume: true });
  }

  playCutscene(id, n, done) {
    const lv = this.build(n);
    this.level = lv;
    this.inStory = true;
    this.game.lighting.setEscape(lv.decor, lv.def.mood);
    this.game.cutscene(id, () => { this.inStory = false; done(); });
  }

  // The cutscene player asks who's talking, for their mouth.
  actor(who) {
    if (!this.inStory) return null;
    if (who === 'Jonathan') return this.kid;
    if (who === 'Jack') return this.jack;
    if (who === 'Miss Penny') return this.teacher;
    if (who === 'Mom') return this.moms[0];
    if (who === 'John') return this.john;
    return null;
  }

  // ── Building a level ──────────────────────────────────────────────────

  build(n) {
    if (this.built.has(n)) return this.built.get(n);
    const g = this.game;
    const def = this.levels[n - 1];
    const place = new Building({ ...def.layout, offsetX: 300 + n * 150, offsetZ: this.story.offsetZ });
    g.scene.add(place.build());
    const decor = new EscapeDecor(place);
    def.build(decor);
    g.scene.add(decor.group);
    g.graphics.track(place.group);
    g.graphics.track(decor.group);
    const area = {
      building: place, isPlayPlace: false, groups: [place.group, decor.group], spawn: {}, roam: [], escape: n,
    };
    g.areas[this.areaName(n)] = area;
    place.group.visible = decor.group.visible = false;
    const lv = { n, def, place, decor, area, enemies: [] };
    this.built.set(n, lv);
    // the things that walk around in it (they need the building to stand in)
    const was = this.level;
    this.level = lv;
    // (`cls`: a story's own kind — Sushi's Pizzaplex has Gerald on strings, the riders, Moony)
    lv.enemies = def.enemies.map((e) => (e.cls ? new e.cls(this, e) : e.kind === 'watcher' ? new Watcher(this, e) : new Stalker(this, e)));
    if (def.controller) lv.ctrl = new def.controller(this, lv);
    for (const e of lv.enemies) e.root.visible = false;
    this.level = was;
    return lv;
  }

  // ── Starting, saving, retrying ────────────────────────────────────────

  start(n, { resume = false } = {}) {
    const g = this.game;
    g.hidePeople();
    this.leave();
    const lv = this.build(n);
    this.level = lv;
    g.setArea(this.areaName(n));
    for (const l of this.built.values()) if (l !== lv) for (const e of l.enemies) e.root.visible = false;
    const def = lv.def, d = lv.decor;
    const s = resume && this.save.save && this.save.save.level === n ? this.save.save : null;
    this.done = new Set(s ? s.done : []);
    this.used = new Set(s ? s.used : []);
    this.upgrades = new Set(s ? s.upgrades || [] : []);
    this.flags = s ? { ...s.flags } : {};
    this.forAll(() => { this.hiding = null; this.box.charge = BOX_SECONDS; this.room = null; this.hideYaw = 0; });
    for (const b of this.boxMeshes) b.visible = false;
    this.unseen = false;
    for (const h of d.hides) if (h.group) h.group.visible = true;
    this.grace = 0;
    this.chanceUsed = false;
    this.sayT = 0;
    this.beep = 0;
    this.speedK = 1;
    this.huntK = 1;
    this.sightK = 1;
    this.clock = def.clock ? { t: s ? s.time || 0 : 0, len: def.clock.seconds } : null;
    this.lastHour = this.clock ? Math.floor(this.clock.t / (this.clock.len / 6)) : 0;
    const found = new Set(s ? s.found : []);
    for (const it of d.items) this.setFound(it, found.has(it.id));
    d.exit?.setOpen(false);
    for (const e of lv.enemies) e.reset();
    // where you start: your bed, or the save box you last touched
    const sp = s ? d.saves[s.point] : null;
    const at = sp ? sp.out : def.spawn.at ? lv.place.P(...def.spawn.at) : d.spots.spawn;
    const p = this.player;
    this.setupHero(p, def);
    p.reset(at, sp ? sp.yaw : def.spawn.yaw || 0, 1);
    p.setWeapons(['taser']);   // (nothing to fire: the slot only feeds the HUD the main game uses)
    if (this.upgrades.has('shoes')) p.maxStamina = p.stamina = p.maxStamina * 2;
    p.lightOn = def.lightOn !== false;
    p.lightVisible = true;
    p.vmGroup.visible = true;
    // Who you are from the outside (for emotes, and for Jimmy to see).
    g.setP1Body(...this.heroBody(def));
    // Two playing: Jimmy starts right beside you, with his own little space-suit hands.
    if (g.twoUp) {
      const [name, icon] = this.heroName(def);
      g.p1.name = name;
      g.panes[0].setName(name.toUpperCase(), icon);
      g.p2.vmBuild = jimmyHands;
      g.spawnPartner(1);
      g.p2.rebuildViewmodel();
      g.p2.maxStamina = g.p2.stamina = p.maxStamina;
    }
    this.forAll(() => this.applyLight());
    const back = new THREE.Vector3(-Math.sin(p.yaw), 0, -Math.cos(p.yaw));
    const jackAt = at.clone().addScaledVector(back, -1.2);
    this.jack.place(lv.place.isWalkable(jackAt.x, jackAt.z) ? jackAt : at.clone(), p.yaw);
    g.lighting.setEscape(d, def.mood);
    this.ctrl = lv.ctrl || null;
    if (this.ctrl) this.ctrl.start(!!s);
    if (def.start) def.start(this, !!s);
    this.watch.toggle(false);
    this.watch.setTab('quests');
    $('escHide').classList.add('hidden');
    $('escLevel').textContent = `${this.story.unit.toUpperCase()} ${n} · ${def.name.toUpperCase()}`;
    $('escClock').classList.toggle('hidden', !this.clock);
    $('jumpFlash').classList.add('hidden');
    g.retry = () => this.start(n, { resume: true });
    stopMusic();
    startAmbience('night');
    g.showScreen('escape');
    g.hud.el.classList.toggle('esc-nobox', !this.story.box);
    g.hud.el.classList.toggle('esc-fixed', !!this.ctrl);
    g.touch.relabel?.('use', '⌚');
    g.touch.relabel?.('swap', this.story.box ? '📦' : '⤓');
    this.say(s ? this.story.resumeLine : def.firstLine || 'Come on, let\'s get out of here!', 3);
    // once in a thousand nights, a shadow (shadows.js)
    g.shadows?.roll();
    if (this.story.box) {
      setTimeout(() => {
        if (g.mode === 'escape') g.hud.toast(`📦 Your box: press ${g.touch.active ? '📦' : 'B'} to hide in it anywhere — but only for ${BOX_SECONDS} seconds!`, 4.5);
      }, 3200);
    }
    // (the chapters where you stay put — Max's bedroom, Jackson's office — use the mouse to
    // click their buttons, so they don't take it)
    if (!g.touch.active && !this.ctrl) {
      requestPointerLock();
      $('clickToPlay').classList.remove('hidden');
    } else if (this.ctrl) {
      exitPointerLock();
      $('clickToPlay').classList.add('hidden');
    }
  }

  applyLight() {
    const p = this.player;
    const sup = this.upgrades.has('light');
    p.bigLight = sup;
    p.flashlight.angle = 0.48 * (sup ? 1.3 : 1);
    p.flashlight.distance = 24 * (sup ? 1.3 : 1);
  }

  // Leaving a level: everyone in it goes out of sight.
  leave() {
    if (this.level) for (const e of this.level.enemies) e.root.visible = false;
    this.jack.hide();
    for (const c of this.cast) c.root.visible = false;
    if (this.ctrl) { this.ctrl.stop(); this.ctrl = null; }
    this.game.hud.el.classList.remove('esc-fixed', 'esc-nobox', 'cams-up');
    this.watch.toggle(false);
    this.forAll((q) => {
      if (this.hiding && this.hiding.group) this.hiding.group.visible = true;
      this.hiding = null;
      q.inBox = false;
    });
    for (const b of this.boxMeshes || []) b.visible = false;
    $('escHide')?.classList.add('hidden');
    const p = this.game.p1;
    if (p.kid || p.sizes) {
      p.kid = false;
      p.sizes = null;
      p.vmBuild = null;
      p.height = 1.62;
      p.rebuildViewmodel();
    }
    const p2 = this.game.p2;
    if (p2 && p2.vmBuild) { p2.vmBuild = null; p2.rebuildViewmodel(); }
    this.game.touch.relabel?.('use', '⚡');
    this.game.touch.relabel?.('swap', '⇄');
  }

  setFound(it, found) {
    it.found = found;
    it.group.visible = !found;
    it.halo.visible = !found;
  }

  saveHere(sp) {
    const e = this.save;
    e.save = {
      level: this.level.n, point: sp.id,
      found: this.level.decor.items.filter((i) => i.found).map((i) => i.id),
      done: [...this.done], used: [...this.used], upgrades: [...this.upgrades],
      flags: { ...this.flags }, time: this.clock ? this.clock.t : 0,
    };
    this.game.save();
    sfx.escSave();
    this.game.hud.toast('💾 Saved! If you get caught, you\'ll come back here.', 3);
    this.check('save');
  }

  // ── Quests ────────────────────────────────────────────────────────────
  //
  // A level's quests are a list (see levels/). The main ones go in order; bonus ones (`optional`)
  // are there all along, or once the quests in their `after` are done.

  available(q) {
    if (this.done.has(q.id)) return false;
    const list = this.def.quests;
    if (q.after) return [].concat(q.after).every((id) => this.done.has(id));
    if (q.optional) return true;
    for (const o of list) {
      if (o === q) return true;
      if (!o.optional && !this.done.has(o.id)) return false;
    }
    return true;
  }

  questList() {
    return this.def.quests.filter((q) => !q.secret || this.done.has(q.id) || this.available(q))
      .filter((q) => this.done.has(q.id) || this.available(q));
  }

  hiddenQuestCount() { return this.def.quests.filter((q) => !this.done.has(q.id) && !this.available(q)).length; }

  count(kind) { return this.level.decor.items.filter((i) => i.kind === kind && i.found).length; }

  progressText(q) {
    const own = this.def.progress && this.def.progress(this, q);
    if (own) return own;
    if (q.type === 'collect') return `(${Math.min(q.count, this.count(q.item))}/${q.count})`;
    return '';
  }

  // The thing to do right now, for the corner of the screen.
  current() {
    return this.def.quests.find((q) => !q.optional && this.available(q)) || this.def.quests.find((q) => this.available(q));
  }

  // Is anyone looking for one of these? (So Jack only points out things you still need.)
  itemWanted(it) {
    return this.def.quests.some((q) => q.type === 'collect' && q.item === it.kind && this.available(q));
  }

  // Where to go for the quests you have right now, for the map.
  questTargets() {
    const out = [];
    for (const q of this.def.quests) {
      if (!this.available(q)) continue;
      if (q.type === 'use') { const t = this.decor.targets.find((x) => x.id === q.target); if (t) out.push(t.pos); }
      if (q.type === 'exit' && this.decor.exit) out.push(this.decor.exit.pos);
      if (q.type === 'visit' && q.at) out.push(this.place.P(...q.at));
    }
    return out;
  }

  rewardName(id) { return REWARDS[id] || id; }

  // Everything the Gus Watch's Entity Tracker follows: every monster in the level.
  tracked() { return this.enemies.filter((e) => e.root.visible); }

  // What one of them is doing, in a few words, for the tracker.
  statusOf(e) {
    if (e.def.kind === 'watcher') {
      if (e.state === 'still') return { text: '🗿 not moving', still: true };
      return e.moving ? { text: '👀 MOVING — LOOK AT IT!', hot: true } : { text: '👀 awake — keep watching' };
    }
    if (e.state === 'off') return { text: '😴 asleep', still: true };
    if (e.state === 'watch') return { text: '🍿 watching the movie', still: true };
    if (e.chasing) return { text: '🚨 CHASING YOU!', hot: true };
    if (e.state === 'search') return { text: '🔎 looking for you', hot: e.searchRun };
    if (e.state === 'wait' || e.state === 'linger') return { text: '🧍 standing still' };
    return { text: '🚶 walking around' };
  }

  roomOf(v) {
    const r = this.place.roomAt(v.x, v.z);
    return r ? (this.place.rooms[r].short || this.place.rooms[r].name) : '???';
  }

  complete(id) {
    if (this.done.has(id)) return;
    const q = this.def.quests.find((x) => x.id === id);
    if (!q) return;
    this.done.add(id);
    this.remember(id);
    sfx.happy();
    const main = !q.optional;
    this.game.hud.toast(`${main ? '⭐' : '🎉'} Quest done: ${q.done || q.text}`, 3.2);
    if (q.reward) {
      this.upgrades.add(q.reward);
      setTimeout(() => this.game.hud.toast(`🎁 Gus Watch upgrade! ${this.rewardName(q.reward)}`, 4), 2200);
      if (q.reward === 'shoes') { this.player.maxStamina *= 2; this.player.stamina = this.player.maxStamina; }
      if (q.reward === 'light') this.applyLight();
    }
    if (q.id === 'plushie' || q.item === 'plushie') {
      this.save.plushies[this.level.n] = true;
      this.game.save();
    }
    if (this.def.questDone) this.def.questDone(this, q);
    if (this.watch.open) this.watch.render();
    this.recheck();
    // what's next
    const next = this.current();
    if (main && next && !next.optional) setTimeout(() => { if (this.game.mode === 'escape') this.game.hud.toast(`⌚ Next: ${next.text}`, 3.5); }, 3400);
  }

  // Every quest ever done, level by level, for the secret ending (all of them, everywhere).
  remember(id) {
    const e = this.save;
    const list = e.quests[this.level.n] || (e.quests[this.level.n] = []);
    // (the first time a quest is ever done, it's worth a Gus token in the Shop)
    if (!list.includes(id)) { list.push(id); this.game.shop.earn(1); this.game.save(); }
  }

  questTotals() {
    let done = 0, total = 0;
    this.levels.forEach((def, i) => {
      const got = this.save.quests[i + 1] || [];
      for (const q of def.quests) { total++; if (got.includes(q.id)) done++; }
    });
    return { done, total };
  }

  allQuestsDone() { const t = this.questTotals(); return !!this.story.secret && t.done === t.total; }

  // A quest that just opened up might be done already: the tokens you picked up before you
  // knew you needed them, the room you're standing in.
  recheck() {
    for (const q of this.def.quests) {
      if (!this.available(q)) continue;
      if (q.type === 'collect' && this.count(q.item) >= q.count) { this.complete(q.id); return; }
      if (q.type === 'visit' && this.room === q.room) { this.complete(q.id); return; }
    }
  }

  // Something happened that might finish a quest of this type.
  check(type, arg) {
    for (const q of this.def.quests) {
      if (q.type !== type || !this.available(q)) continue;
      if (type === 'collect' && (q.item !== arg || this.count(q.item) < q.count)) continue;
      if (type === 'visit' && q.room !== arg) continue;
      if (type === 'use' && q.target !== arg) continue;
      if (type === 'spot' && q.who !== arg) continue;
      this.complete(q.id);
    }
  }

  // ── Talking ───────────────────────────────────────────────────────────

  say(text, secs = 2.6, who = this.speaker()) {
    const el = $('escSay');
    el.innerHTML = who ? `<b>${who}:</b> ${text}` : text;
    el.classList.remove('hidden');
    this.sayT = secs;
  }

  // Who's talking when nobody says who: Jack, who's always with you at five.
  speaker() { return this.story.buddy || ''; }

  timeText() {
    if (!this.clock) return `LEVEL ${this.level ? this.level.n : 1}`;
    const per = this.clock.len / 6;
    const h = Math.floor(this.clock.t / per);
    const min = Math.floor(((this.clock.t % per) / per) * 60);
    return `${h === 0 ? 12 : h}:${String(min).padStart(2, '0')} AM`;
  }

  // ── Hiding ────────────────────────────────────────────────────────────

  // Into your own box, right where you're standing.
  enterBox() {
    const p = this.player;
    if (this.box.charge < 3) {
      sfx.repairBad();
      this.game.hud.toast(`📦 Your box is still squished — it fills back up in ${Math.ceil((BOX_SECONDS - this.box.charge) / BOX_REFILL)} seconds.`, 2.6);
      return;
    }
    const pos = p.pos.clone().setY(0);
    this.boxMesh.position.set(pos.x, this.place.floorAt(pos.x, pos.z), pos.z);
    this.boxMesh.rotation.y = p.yaw;
    this.boxMesh.visible = true;
    for (const f of this.boxMesh.userData.lid) f.visible = false;
    p.inBox = true;
    this.hide({ id: -1, kind: 'mybox', name: 'Your box', portable: true, pos, yaw: p.yaw, out: pos.clone(), eye: pos.clone().setY(0.72) });
  }

  hide(spot) {
    this.hiding = spot;
    // A clear view out (the designer asked for normal vision in there): the locker door, the
    // tube's end, the curtain would all be right in front of your eyes, so they aren't drawn
    // while you're inside.
    if (spot.group) spot.group.visible = false;
    this.player.crouching = false;
    this.player.vmGroup.visible = false;
    this.player.lightOn = false;
    sfx.escHide();
    this.jack.hide();
    this.hideYaw = 0;
    $('escHide').classList.remove('hidden');
    const buddy = this.story.buddy ? ` with ${this.story.buddy}` : '';
    $('escHideText').textContent = spot.portable ? 'In your box!' : `${spot.kind === 'bed' ? 'Under the bed' : 'Hiding'}${buddy} — shhh! Press E to come out.`;
    for (const e of this.enemies) if (e.onHide) e.onHide(spot);
    this.check('hide');
  }

  unhide() {
    const spot = this.hiding;
    this.hiding = null;
    if (spot.group) spot.group.visible = true;
    const p = this.player;
    p.pos.copy(spot.out);
    p.yaw = spot.yaw;
    p.vmGroup.visible = true;
    sfx.escHide();
    $('escHide').classList.add('hidden');
    if (spot.portable) {
      this.boxMesh.visible = false;
      p.inBox = false;
      const f = p.forward2();
      this.jack.come(spot.pos.clone().add(new THREE.Vector3(-f.x * 0.9, 0, -f.z * 0.9)));
      return;
    }
    this.jack.come(spot.pos.clone().lerp(spot.out, 0.5));
  }

  // ── What can I press E on? ────────────────────────────────────────────

  interaction() {
    const p = this.player, d = this.decor;
    const near = (pt, r) => Math.hypot(pt.x - p.pos.x, pt.z - p.pos.z) < r;
    if (this.hiding) return { text: '<b>E</b> Come out', act: () => this.unhide() };
    const atExit = d.exit && near(d.exit.pos, 1.7);
    if (atExit && d.exit.open) return { text: `<b>E</b> ${this.def.exitText || 'ESCAPE! 🏃'}`, act: () => this.win() };
    // (a keypad or a switch right by a locked door comes before the door)
    for (const t of d.targets) {
      if (!near(t.point, t.reach)) continue;
      const q = this.def.quests.find((x) => x.type === 'use' && x.target === t.id && this.available(x));
      if (q) return { text: `<b>E</b> ${t.name}`, act: () => this.use(t, q) };
    }
    if (atExit) return { text: '🔒 Locked — check your Gus Watch (G)', act: () => { sfx.repairBad(); this.watch.toggle(true); }, quiet: true };
    for (const sp of d.saves) if (near(sp.pos, 1.5)) return { text: '<b>E</b> Save your game 💾', act: () => this.saveHere(sp) };
    for (const h of d.hides) if (near(h.out, 1.0) || near(h.pos, 1.0)) return { text: `<b>E</b> ${h.name}`, act: () => this.hide(h) };
    return null;
  }

  use(t, q) {
    const res = this.def.use ? this.def.use(this, t, q) : true;
    if (res === false || res === 'pending') return;
    this.used.add(t.id);
    this.check('use', t.id);
  }

  // ── Update ────────────────────────────────────────────────────────────

  update(dt) {
    const g = this.game;
    this.grace = Math.max(0, this.grace - dt);
    g.scareTick(dt, 75);
    if (this.sayT > 0) { this.sayT -= dt; if (this.sayT <= 0) $('escSay').classList.add('hidden'); }
    const hud = g.hud;
    if (hud.toastTimer > 0) { hud.toastTimer -= dt; if (hud.toastTimer <= 0) hud.toastEl.classList.remove('show'); }

    // Chapters where you stay in one place (Max's bedroom, Jackson's office) run themselves.
    if (this.ctrl) {
      if (g.ctl.pressed('pause')) { g.togglePause(); return; }
      g.hud.prompt(null);
      this.ctrl.update(dt);
      if (g.mode !== 'escape') return;
      if (this.clock) this.tickClock(dt);
      if (g.mode !== 'escape') return;
      if (this.def.update) this.def.update(this, dt);
      this.updateHud(dt);
      return;
    }
    // Each of you in turn (just you, playing alone): keys, walking or hiding, pressing E,
    // picking things up, your box.
    if (g.eachPlayer((p) => this.turn(dt, p))) return;
    if (g.mode !== 'escape') return;
    if (this.clock) this.tickClock(dt);
    if (g.mode !== 'escape') return;
    if (this.def.update) this.def.update(this, dt);
    for (const e of this.enemies) {
      if (g.twoUp) g.asPrey(e, () => e.update(dt));
      else e.update(dt);
      if (g.mode !== 'escape') return;
    }
    this.jack.update(dt);
    this.decor.update(dt, g.t);
    g.withPlayer(this.watch.owner && !this.watch.owner.out ? this.watch.owner : g.lead, () => this.watch.update());
    this.updateHud(dt);
  }

  // One player's part of a step. True if it ended the step (paused, caught, escaped...).
  turn(dt, p) {
    const g = this.game, ctl = p.ctl;
    if (g.phone.active && g.phone.user === p) {
      g.phone.update(dt);
      p.update(dt, { canMove: false, canLook: false });
      g.hud.prompt(null);
    } else if (!this.hiding && g.emoteTurn(dt, p)) {
      if (ctl.pressed('pause')) { g.togglePause(); return true; }
    } else {
      if (ctl.pressed('pause')) { if (this.watch.open) this.watch.toggle(false); else { g.togglePause(); return true; } }
      if (ctl.pressed('watch')) this.watch.toggle(!(this.watch.open && this.watch.owner === p) );
      if (this.story.box && (ctl.pressed('box') || ctl.pressed('swap'))) {
        if (this.hiding && this.hiding.portable) this.unhide();
        else if (!this.hiding) this.enterBox();
      }
      if (!this.story.box && ctl.pressed('swap') && !this.hiding) p.toggleCrouch();
      if (ctl.pressed('flashlight') && !this.hiding) p.toggleLight();
      if (ctl.pressed('crouch') && !this.hiding) p.toggleCrouch();
      if (this.hiding) this.updateHidden(dt);
      else p.update(dt);
      const it = this.interaction();
      g.hud.prompt(it ? it.text : null);
      if (it && ctl.pressed('interact')) it.act();
    }
    if (g.mode !== 'escape') return true;

    // walking into things you're looking for picks them up (in your box too)
    if (!this.hiding || this.hiding.portable) {
      for (const item of this.decor.items) {
        if (item.found) continue;
        if (Math.hypot(item.pos.x - p.pos.x, item.pos.z - p.pos.z) < 1.0) this.collect(item);
      }
      const room = this.place.roomAt(p.pos.x, p.pos.z);
      if (room !== this.room) { this.room = room; this.check('visit', room); }
    }
    if (this.story.box) this.tickBox(dt);
    return g.mode !== 'escape';
  }

  // Two playing: what goes in your half of the screen.
  paneInfo(p) {
    if (this.ctrl && this.ctrl.paneInfo) return this.ctrl.paneInfo(p);
    let danger = 0, chaser = null;
    for (const e of this.enemies) {
      if (!e.dangerous || !e.root.visible) continue;
      const d = e.distToPlayer();
      if (d < 10) danger = Math.max(danger, 1 - d / 10);
      if (e.prey === p && e.chasing) chaser = e;
    }
    let status = '';
    if (this.hiding) status = this.hiding.portable ? `📦 In your box — ${Math.ceil(this.box.charge)} s left` : 'Hiding — shhh!';
    else if (p.crouching) status = '⤓ Crouching — harder to see';
    const alert = chaser ? (chaser.def.kind === 'watcher' ? `👀 DON'T LOOK AWAY FROM ${chaser.name.toUpperCase()}!` : `🏃 ${chaser.name.toUpperCase()} SEES YOU!`) : '';
    return { weapons: false, box: this.story.box ? this.box.charge / BOX_SECONDS : null, status, alert, danger: this.hiding ? 0 : danger };
  }

  // In a hiding spot you can look around (a clear view — the designer asked for normal vision
  // in there), but you can't move. In your own box you can walk, slowly, and it goes with you.
  updateHidden(dt) {
    const p = this.player, s = this.hiding;
    if (s.portable) {
      p.update(dt);
      s.pos.set(p.pos.x, 0, p.pos.z);
      s.out.copy(s.pos);
      s.eye.set(p.pos.x, 0.72, p.pos.z);
      s.yaw = p.yaw;
      this.boxMesh.position.set(p.pos.x, this.place.floorAt(p.pos.x, p.pos.z), p.pos.z);
      // it turns with you, a little behind, like a box being carried from the inside
      let d = p.yaw - this.boxMesh.rotation.y;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      this.boxMesh.rotation.y += d * Math.min(1, dt * 6);
      this.boxMesh.position.y += Math.abs(Math.sin(p.bobPhase)) * 0.03 * Math.min(1, p.moving);
      return;
    }
    const { dx, dy } = p.ctl.drainLook();
    this.hideYaw = Math.max(-1.4, Math.min(1.4, this.hideYaw - dx * 0.0022));
    p.pitch = Math.max(-1.1, Math.min(1.0, p.pitch - dy * 0.0022));
    p.yaw = s.yaw + this.hideYaw;
    p.pos.set(s.eye.x, 0, s.eye.z);
    p.height = s.eye.y;
    p.sprinting = false;
    p.stamina = Math.min(p.maxStamina, p.stamina + dt);
    p.flash(dt);
    p.updateCamera(dt);
  }

  // Thirty seconds in the box, then out you pop; it fills back up while you're out of it.
  tickBox(dt) {
    const b = this.box;
    if (this.hiding && this.hiding.portable) {
      b.charge = Math.max(0, b.charge - dt);
      $('escHideText').textContent = `📦 In your box — ${Math.ceil(b.charge)} seconds left. You can walk around! ${this.game.touch.active ? '📦' : 'E or B'} to come out.`;
      if (b.charge <= 0) {
        this.unhide();
        sfx.uiBack();
        this.game.hud.toast('📦 Time\'s up — you had to come out of your box!', 3);
      }
    } else b.charge = Math.min(BOX_SECONDS, b.charge + dt * BOX_REFILL);
  }

  collect(item) {
    this.setFound(item, true);
    sfx.escCollect();
    this.game.effects.burst(item.pos.clone().setY(0.6), 10, 2);
    const same = this.decor.items.filter((i) => i.kind === item.kind);
    const got = same.filter((i) => i.found).length;
    const q = this.def.quests.find((x) => x.type === 'collect' && x.item === item.kind);
    this.game.hud.toast(q && same.length > 1 ? `Found a ${item.name}! (${Math.min(got, q.count)} of ${q.count})` : `Found the ${item.name}!`, 2.6);
    if (this.def.collect) this.def.collect(this, item);
    this.check('collect', item.kind);
    if (this.watch.open) this.watch.render();
  }

  tickClock(dt) {
    const c = this.clock;
    c.t = Math.min(c.len, c.t + dt);
    const hour = Math.floor(c.t / (c.len / 6));
    if (hour !== this.lastHour) {
      this.lastHour = hour;
      if (hour < 6) {
        sfx.hour();
        this.game.hud.toast(`🕐 ${hour} AM`, 2.5);
        if (this.def.onHour) this.def.onHour(this, hour);
      }
    }
    $('escClock').textContent = this.timeText();
    if (c.t >= c.len) this.check('survive');
  }

  updateHud() {
    const p = this.player;
    $('escBattery').style.width = p.battery + '%';
    $('escStamina').style.width = (p.stamina / p.maxStamina) * 100 + '%';
    $('escStamina').style.background = p.winded ? '#ff3b30' : '';
    const q = this.current();
    $('wmTime').textContent = this.timeText();
    $('wmQuest').textContent = q ? `${q.text} ${this.progressText(q)}`.trim() : 'All done!';
    // the Entity Tracker, on the little watch face: the closest monster that's awake
    const awake = this.tracked().filter((e) => !this.statusOf(e).still).sort((a, b) => a.distToPlayer() - b.distToPlayer());
    const tr = $('wmTracker');
    if (awake.length) {
      const e = awake[0];
      const [icon, name] = ENTITY[e.id] || ['👾', e.name];
      const st = this.statusOf(e);
      tr.textContent = `${icon} ${name}: ${Math.round(e.distToPlayer())} m · ${this.roomOf(e.pos)}${st.hot ? ' · CHASING!' : ''}`;
      tr.classList.toggle('hot', !!st.hot);
    } else tr.textContent = this.tracked().length ? '👾 Everything is asleep... for now' : '';
    tr.classList.toggle('hidden', !tr.textContent);
    // Something's after you, or Pjork is watching.
    const alert = $('escAlert');
    const chaser = this.enemies.find((e) => e.chasing && e.root.visible);
    if (this.hiding && this.enemies.some((e) => e.state === 'getHidden')) {
      alert.textContent = '😱 IT SAW YOU HIDE!';
    } else if (chaser && !this.hiding) {
      alert.textContent = chaser.def.kind === 'watcher' ? `👀 DON'T LOOK AWAY FROM ${chaser.name.toUpperCase()}!` : `🏃 ${chaser.name.toUpperCase()} SEES YOU — RUN AND HIDE!`;
    } else alert.textContent = '';
    alert.classList.toggle('hidden', !alert.textContent);
    $('escCrouch').classList.toggle('hidden', !p.crouching || !!this.hiding);
    $('escBox').style.width = (this.box.charge / BOX_SECONDS) * 100 + '%';
    $('escBox').style.background = this.box.charge < 3 ? '#ff3b30' : '';
    // the danger beeper upgrade
    if (this.upgrades.has('beeper')) {
      this.beep -= 1 / 60;
      const near = Math.min(...this.enemies.filter((e) => e.dangerous).map((e) => e.distToPlayer()), 99);
      if (near < 10 && this.beep <= 0) { sfx.escWatch(); this.beep = 0.25 + near * 0.12; }
    }
  }

  // ── Caught! ───────────────────────────────────────────────────────────

  caught(who, why = null) {
    const g = this.game;
    if (g.mode !== 'escape' || this.grace > 0 || this.player.out) return;
    // Spooky's second chance, and the lucky Gus coin (but nothing stops a shadow)
    if (!who.shadow && ((g.diff.secondChance && !this.chanceUsed) || this.upgrades.has('chance'))) {
      if (this.upgrades.has('chance')) this.upgrades.delete('chance');
      else this.chanceUsed = true;
      this.grace = 3;
      if (who.frozen !== undefined) who.frozen = 4;
      if (who.state && who.def.kind !== 'watcher') { who.state = 'search'; who.goTo(who.lastSeen); }
      if (this.hiding) this.unhide();
      this.player.shake = 0.8;
      g.hud.flashHit();
      g.hud.toast(`You wriggled away from ${who.name}! That was your second chance — RUN!`, 4);
      return;
    }
    if (this.hiding) {
      // pulled out of the hiding spot, face to face
      const s = this.hiding;
      this.hiding = null;
      if (s.group) s.group.visible = true;
      this.boxMesh.visible = false;
      this.player.inBox = false;
      $('escHide').classList.add('hidden');
      this.player.pos.copy(s.out);
      this.player.yaw = s.yaw + Math.PI;
      this.player.height = this.player.S.eyeHeight;
    }
    g.stopEmote(this.player);
    g.closeWheel(this.player);
    // (two playing: only the one it caught sees it, in their half — except in the chapters
    // where you both stay in one room, where it gets you both)
    const partner = g.twoUp && g.alive().length > 1 && !this.ctrl;
    this.partnerScare = partner;
    if (!partner || this.watch.owner === this.player) this.watch.toggle(false);
    if (g.phone.active && (!partner || g.phone.user === this.player)) g.phone.close();
    this.scareP = this.player;
    this.scarer = who;
    this.why = why;
    // (the FNAF way — see jumpscare.js: lunge, scream in your face, static)
    this.scareLen = holdFor(g.nightmare) + STATIC;
    this.scareTimer = this.scareLen;
    this.scareStatic = false;
    this.scareState = who.state;
    setEyes(who.rig, 'scare');
    this.player.vmGroup.visible = false;
    this.player.lightVisible = false;
    if (!partner) {
      g.hud.show(false);
      $('clickToPlay').classList.add('hidden');
      stopAmbience();
      stopMusic();
    } else g.panes[this.player.index].el.classList.add('scared');
    sfx.fnafScream();
    if (g.nightmare) setTimeout(() => sfx.fnafScream(), 700);
    g.profile.stats.caught++;
    g.save();
    g.mode = 'escScare';
  }

  // It lunges into your face, screams there with its head jerking about, and then the
  // picture cuts to static (jumpscare.js).
  updateScare(dt) {
    const g = this.game, a = this.scarer;
    this.scareTimer -= dt;
    const t = this.scareLen - this.scareTimer;
    const sp = this.scareP || this.player;
    const cam = sp.camera;
    sp.pitch += (0 - sp.pitch) * Math.min(1, dt * 20);
    sp.shake = t < LUNGE ? 0.4 : 0.9;
    sp.updateCamera();
    if (this.scareTimer > STATIC) {
      const { f, near } = placeScare(a, cam, sp, t);
      poseRig(a.rig, 'scare', t, 1, dt);
      finishScare(a, cam, f, near, t, g.effects);
      return;
    }
    if (!this.scareStatic) { this.scareStatic = true; showStatic(g.split && this.partnerScare ? sp.index : null); }
    drawStatic();
    if (this.scareTimer > 0) return;
    hideStatic();
    // Two playing, and the other one's still in: this one's out, and the other has to get
    // out of here for both of them.
    if (this.partnerScare && g.knockOut(sp, this.clock ? null : `${sp.name} got caught! ${g.alive()[0]?.name}, you have to finish the ${this.story.unit.toLowerCase()} on your own!`)) {
      this.afterKnockOut(a);
      return;
    }
    exitPointerLock();
    setEyes(a.rig, 'on');
    const s = this.save.save;
    const back = s && s.level === this.level.n ? 'Back to your save box' : `Try ${this.story.unit} ${this.level.n} again`;
    const tip = a.tip || (this.def.tips && this.def.tips[a.id]) || 'Hide when they see you, and touch every save box you find!';
    g.hud.caught(a.name, back, tip, a.title || 'GOTCHA!', cap(this.why || `${a.name} caught you.`));
    for (const e of this.enemies) e.root.visible = false;
    this.jack.hide();
    g.setArea('playplace');
    g.lighting.set('title');
    g.showScreen('caught');
  }

  // Back to the level after one of you was caught: whatever did it backs off, stunned for a
  // moment, and nothing can catch the other one straight away.
  afterKnockOut(a) {
    const g = this.game;
    g.mode = 'escape';
    for (const pane of g.panes) pane.el.classList.remove('scared');
    setEyes(a.rig, 'on');
    if (a.frozen !== undefined) a.frozen = 3;
    if (a.state && a.def && a.def.kind !== 'watcher' && a.goTo) { a.state = 'search'; a.goTo(a.lastSeen || a.pos.clone()); }
    a.prey = null;
    this.scarer = null;
    this.scareP = null;
    this.grace = 2.5;
    if (this.ctrl && this.ctrl.backOff) this.ctrl.backOff(a);
    g.player = g.lead;
    g.layout();
    if (!g.touch.active && !this.ctrl && g.lead.index === 0) requestPointerLock();
  }

  // ── Escaped! ──────────────────────────────────────────────────────────

  win() {
    const g = this.game;
    const n = this.level.n;
    const e = this.save;
    exitPointerLock();
    for (const q of this.def.quests) if (q.type === 'exit') this.remember(q.id);
    e.level = Math.max(e.level, Math.min(this.levels.length, n + 1));
    e.save = null;
    if (g.difficulty === 'hard' && !g.debugMode) e.stars[n] = true;
    g.save();
    sfx.victory();
    this.leave();
    g.setArea('playplace');
    g.lighting.set('title');
    const def = this.levels[n - 1];
    const next = this.levels[n];
    $('escWinTitle').textContent = def.winTitle || (def.clock ? 'YOU MADE IT TO 6 AM!' : `YOU ESCAPED ${def.name.toUpperCase()}!`);
    $('escWinBody').innerHTML = def.card.after || '';
    const lq = def.quests.filter((q) => (e.quests[n] || []).includes(q.id)).length;
    $('escWinPlush').textContent = (e.plushies[n] ? '🧸 You found the golden Gus plushie!  ' : '') +
      `⭐ Quests done here: ${lq} of ${def.quests.length}`;
    this.secretNow = this.allQuestsDone() && !e.secret;
    const unit = this.story.unit;
    $('btnEscWinGo').textContent = g.campaign.on
      ? (next ? `▶ Keep going: ${next.name}` : '▶ Keep going')
      : next ? `On to ${unit} ${n + 1}: ${next.name}` : n < this.total ? `${unit} ${n + 1} is coming soon!` : 'The end ✨';
    this.wonLevel = n;
    g.showScreen('escWin');
  }

  afterWin() {
    const n = this.wonLevel;
    // That was the last quest of all: the secret ending plays first (straight after the pizza
    // place's own ending, if that's where you finished them).
    const secret = this.secretNow;
    this.secretNow = false;
    if (n < this.levels.length && this.levels[n]) {
      if (secret) this.playSecret(() => this.showCard(n + 1));
      else this.showCard(n + 1);
      return;
    }
    // the story isn't finished yet: more chapters are on the way (in Story mode: on to the next)
    if (n < this.total || !this.story.finale) { if (this.game.campaign.on) this.finished(); else this.showMenu(); return; }
    // the very end: morning at the pizza place, and ten years later...
    const e = this.save;
    e.done = true;
    this.game.save();
    this.playCutscene(this.story.finale, n, () => {
      if (secret) this.playSecret(() => this.finished());
      else this.finished();
    });
  }

  // The whole story's over: back to the title — or, in Story mode, on to the next story.
  finished() {
    this.leave();
    if (this.game.campaign.on) this.game.campaign.partDone(this.story.key);
    else this.game.toTitle();
  }

  // The secret ending, for doing every quest in every level: John's first day.
  playSecret(done) {
    this.save.secret = true;
    this.game.save();
    this.playCutscene(this.story.secret, this.levels.length, () => { this.leave(); done(); });
  }

  // On the title screen: a star for finding the secret ending.
  titleBadge() {
    if (this.story.key === 'escape') $('secretTag').classList.toggle('hidden', !this.save.secret);
  }

  // From the console (?debug=1): __game.escape.skip() finishes every quest but the exit.
  skip() {
    for (const q of this.def.quests) if (q.type !== 'exit' && q.type !== 'survive') this.complete(q.id);
    if (this.clock) this.clock.t = this.clock.len - 5;
  }
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// The box you carry: how long you can stay in it, and how fast it fills back up (seconds per
// second) once you're out.
const BOX_SECONDS = 30;
const BOX_REFILL = 0.5;

// A cardboard box, flaps and all, big enough for two five-year-olds.
function buildCardboardBox() {
  const g = new THREE.Group();
  const card = new THREE.MeshStandardMaterial({ color: 0xa8805a, roughness: 0.95 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.95 });
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.95, 1.1), card);
  box.position.y = 0.475;
  box.castShadow = true;
  g.add(box);
  // the flaps and the tape would hang right across your view from inside, so they only show
  // when nobody's in it
  g.userData.lid = [];
  for (const [x, z, ry] of [[0, 0.55, 0], [0, -0.55, 0], [0.55, 0, Math.PI / 2], [-0.55, 0, Math.PI / 2]]) {
    const flap = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.02, 0.4), dark);
    flap.position.set(x * 1.2, 0.97, z * 1.2);
    flap.rotation.set(x ? 0 : (z > 0 ? 0.5 : -0.5), ry, x ? (x > 0 ? -0.5 : 0.5) : 0);
    g.add(flap);
    g.userData.lid.push(flap);
  }
  const tape = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.01, 1.12), new THREE.MeshStandardMaterial({ color: 0xc8b088 }));
  tape.position.y = 0.955;
  g.add(tape);
  g.userData.lid.push(tape);
  return g;
}

export { STORY };
