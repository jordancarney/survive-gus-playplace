// Story mode (the designer's idea): every story, one after another, in his order — Sushi's
// Pizzaplex (its Daycare too), When Jonathan Was Five ("put it third"), Lost in the Pizzaplex
// (all fifty chapters in a row), then the nights at Gus's PlayPlace, through Night 21 and Old
// John. No chapter menus: you press Continue or New game, and when one story ends the next
// one begins. It has a save of its own (save.js, the 'story' slot), so Survival — every story
// on its own, the way it always was — keeps its progress. Two can play it too.
//
// Each part is a story mode on the game (game.sushi, game.escape, game.plex: they all run on
// EscapeMode, which calls partDone when its last level is won), except 'nights', which is
// the PlayPlace itself (game.continueGame, and finishBoss calls partDone after Old John). A
// part whose mode isn't on the game is skipped, so adding a story is one line here.
import { setSlot, loadProfile, freshProfile, hasProfile } from './save.js';
import { sfx, playMusic } from './audio.js';

export const STORY_PARTS = [
  { key: 'sushi', icon: '🐧', name: "Sushi's Pizzaplex" },
  { key: 'escape', icon: '🧸', name: 'When Jonathan Was Five' },
  { key: 'plex', icon: '🍕', name: 'Lost in the Pizzaplex' },
  { key: 'nights', icon: '🔦', name: "Gus's PlayPlace",
    brief: 'Jonathan is fifteen and needs a job. <b>Gus\'s PlayPlace</b> needs a night guard, and the manager says nothing EVER happens there. Watch the cameras, fix the games, and survive the nights.' },
  // After the PlayPlace: In the Closets (js/closets/, game.closets), Timmy's house.
  { key: 'closets', icon: '🚪', name: 'In the Closets' },
];

const $ = (id) => document.getElementById(id);

export class Campaign {
  constructor(game) {
    this.game = game;
    this.on = false;
  }

  // The parts there are: the PlayPlace, and every story mode the game has.
  get parts() { return STORY_PARTS.filter((s) => s.key === 'nights' || this.game[s.key]); }

  modeOf(part) { return part && part.key !== 'nights' ? this.game[part.key] : null; }

  // The story you're on, and which number it is.
  partIndex(p = this.game.profile) {
    const c = p.campaign;
    const i = c ? this.parts.findIndex((s) => s.key === c.key) : 0;
    return Math.max(0, i);
  }

  // The level you're up to in a story mode: the furthest you've reached.
  levelOf(m, p) { return Math.max(1, Math.min(m.levels.length, (p[m.story.key] && p[m.story.key].level) || 1)); }

  // ── The Story menu ────────────────────────────────────────────────────

  // Where the Story save is up to, for its Continue button: null if there isn't one.
  where() {
    if (!hasProfile('story')) return null;
    const p = loadProfile('story');
    const c = p.campaign;
    if (!c) return null;
    if (c.done) return { done: true, text: '🏆 You played the whole story!' };
    const i = this.partIndex(p), part = this.parts[i];
    const m = this.modeOf(part);
    let at;
    if (m) at = m.levels[this.levelOf(m, p) - 1].name;
    else at = p.seenIntro ? `Night ${p.night}` : 'The first night';
    return { done: false, text: `${part.icon} ${part.name} — ${at}` };
  }

  // ── In and out ────────────────────────────────────────────────────────

  // Story mode on: its save in, Survival's out. `fresh`: a new game.
  enter(fresh = false) {
    const g = this.game;
    setSlot('story');
    g.profile = fresh || !hasProfile('story') ? freshProfile() : loadProfile();
    if (!g.profile.campaign || g.profile.campaign.done) g.profile.campaign = { key: this.parts[0].key, done: false };
    this.on = true;
    g.save();
    g.updatePhoto();
    this.next();
  }

  // Back to Survival's save, on the way to the title screen.
  leave() {
    if (!this.on) return;
    this.on = false;
    setSlot('main');
    this.game.profile = loadProfile();
    this.game.updatePhoto();
  }

  // Carry on with whichever story you're on, from where you left off.
  next() {
    const g = this.game;
    const part = this.parts[this.partIndex()];
    const m = this.modeOf(part);
    if (!m) { g.continueGame(); return; }
    g.story = m;
    m.showCard(this.levelOf(m, g.profile));
  }

  // A story's last level is won: on to the next story, or that was the end of them all.
  partDone(key) {
    const g = this.game, c = g.profile.campaign;
    const parts = this.parts;
    const i = parts.findIndex((s) => s.key === key);
    const nextPart = parts[i + 1];
    if (!nextPart) { this.theEnd(); return; }
    c.key = nextPart.key;
    g.save();
    this.between(nextPart, i + 2, parts.length);
  }

  // ── The cards between stories ─────────────────────────────────────────

  screen() {
    let el = $('storyNext');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'storyNext';
    el.className = 'screen screen-five story-next';
    el.innerHTML = `
      <div class="eyebrow" id="storyNextEyebrow"></div>
      <h2 class="screen-title night-number" id="storyNextTitle"></h2>
      <p class="brief-body" id="storyNextBody"></p>
      <div class="menu-actions">
        <button id="btnStoryNextGo" class="btn btn-big">▶&nbsp; Keep going</button>
        <button id="btnStoryNextMenu" class="btn btn-ghost">Main menu</button>
      </div>`;
    $('escWin').after(el);
    $('btnStoryNextGo').addEventListener('click', () => { sfx.ui(); this.next(); });
    $('btnStoryNextMenu').addEventListener('click', () => { sfx.ui(); this.game.toTitle(); });
    return el;
  }

  between(part, n, total) {
    const g = this.game;
    this.screen();
    const m = this.modeOf(part);
    $('storyNextEyebrow').textContent = `📖 STORY · ${n} OF ${total}`;
    $('storyNextTitle').textContent = `${part.icon} ${part.name}`;
    $('storyNextBody').innerHTML = part.brief || (m && m.story.menu && m.story.menu.brief) || '';
    $('btnStoryNextGo').classList.remove('hidden');
    g.setArea('playplace');
    g.lighting.set('title');
    g.showScreen('storyNext');
    playMusic(g.nightmare ? 'nightmare' : 'title');
  }

  theEnd() {
    const g = this.game;
    g.profile.campaign.done = true;
    g.save();
    this.screen();
    $('storyNextEyebrow').textContent = '📖 STORY';
    $('storyNextTitle').textContent = 'THE END';
    $('storyNextBody').innerHTML = `You played the whole story, from Sushi's Pizzaplex all the way to the last night at Gus's PlayPlace. 🏆`;
    $('btnStoryNextGo').classList.add('hidden');
    g.setArea('playplace');
    g.lighting.set('title');
    g.showScreen('storyNext');
    sfx.victory();
    playMusic(g.nightmare ? 'nightmare' : 'title');
  }
}
