// Sushi's Pizzaplex, in four parts (the designer's story; DESIGN.md has it all):
//
//   1 The Dare           the blue card, Bob in Laser Tag, the card machine's DAYCARE card
//   2 Gerald's Daycare   five fuses, the generator, Gerald set free, the Security Badge
//   3 The Badge          Billy at the Go-Karts, the broken roller coaster and Tim
//   4 The Vents          up through the ducts to Peter's room, then down and out
//
// Each part is a level for When Jonathan Was Five's engine (js/escape/mode.js), with the
// story's own pieces on top (SushiMode, mode.js): cards and card doors, vents, plushies.
import { pizzaplexLayout, buildPizzaplex, SPOTS, KART_LOOP, CHOMPER_RUN } from './maps/pizzaplex.js';
import { daycareLayout, buildDaycare, DAYCARE_SPOTS } from './maps/daycare.js';
import { ventsLayout, buildVents, VENT_SPOTS } from './maps/vents.js';
import { buildSushi, buildPuppetGerald, buildCoasterChomper, buildKartFlipper, buildMoony, buildPeter } from './cast.js';
import { Puppet, Rider, Blinker, Springer } from './enemies.js';
import { E, W, N, S, talk, windToy, updateToys, setShelf, sfx, THREE } from './kit.js';
import { Stalker } from '../escape/enemies.js';
import { poseRig } from '../models.js';

const pick = (a) => () => a[Math.floor(Math.random() * a.length)];
const find = (m, id) => m.enemies.find((e) => e.id === id);

// ── Who's after you ─────────────────────────────────────────────────────

const sushi = (extra = {}) => ({
  id: 'sushi', name: 'Sushi', cls: Stalker, build: buildSushi, walk: 1.7, chase: 3.7, sight: 11, hear: 9, hunt: 0.3, lose: 5,
  steps: 'cranker', stride: 0.7, shoutWho: 'Sushi', roam: ['N', 'M', 'S', 'B'],
  shout: pick(['Welcome to Sushi\'s! Stay FOREVER!', 'Table for one?', 'No running in the Pizzaplex!', 'There you are, little customer!']),
  ...extra,
});
const moony = (extra = {}) => ({
  id: 'moony', name: 'Moony', cls: Blinker, build: buildMoony, walk: 1.6, chase: 3.5, sight: 10, hear: 8, hunt: 0.4, lose: 3,
  steps: 'gerald', stride: 1.0, shoutWho: 'Moony', roam: ['L'], start: [15, 13.5],
  shout: pick(['Tag. You\'re it.', 'Lights out, little one.', 'I see you in the dark...']),
  ...extra,
});
const flipper = () => ({
  id: 'flipper', name: 'Flipper', cls: Rider, build: buildKartFlipper, track: KART_LOOP, loop: true, speed: 6.2, boost: 1.35,
  sight: 11, reach: 1.35, steps: 'chomper', shout: pick(['Vroom VROOM!', 'Out of my lane!', 'Beep beep!']),
  why: 'Flipper ran you over with his go-kart!',
});
const chomper = () => ({
  id: 'chomper', name: 'Chomper', cls: Rider, build: buildCoasterChomper, track: CHOMPER_RUN, speed: 4.4, boost: 1.85,
  sight: 12, reach: 1.4, steps: 'gerald', shout: pick(['All aboard!', 'Wheeeee!', 'Keep your arms inside the cart!']),
  why: 'Chomper ran you over with a roller-coaster cart!',
});

const PLUSH_QUEST = (text) => ({ id: 'plush', type: 'collect', item: 'splush', count: 3, optional: true, text, done: 'All three plushies here!' });

// ═════════════════════════════════════════════════════════════════════════
// Part 1 — The Dare
// ═════════════════════════════════════════════════════════════════════════

const dare = {
  id: 'dare',
  name: 'The Dare',
  layout: pizzaplexLayout(),
  build(d) {
    buildPizzaplex(d, { part: 1 });
    d.item('cblue', 'blue', 25.1, 16.6, 0.35);
    d.item('splush', 'p1', 31, 43.6, 1.25);
    d.item('splush', 'p2', 16.2, 17.2, 0.5);
    d.item('splush', 'p3', 42.8, 9.9, 1.2);
    d.target('bob', SPOTS.bobHide[0] + 0.6, SPOTS.bobHide[1] - 0.2, 'east', 'Bob! It\'s me, Tom!', null, { reach: 1.6 });
    d.exitDoor(...SPOTS.daycareDoor, 'north', { w: 1.8, label: 'DAYCARE' });
    d.spots.spawn = d.place.P(...SPOTS.spawn);
  },
  intro: 'sushiIntro',
  mood: { amb: 0.07, hemi: 0.07, fog: 0.032, bg: 0x050308 },
  spawn: { at: SPOTS.spawn, yaw: N },
  cards: [],
  firstLine: 'Bob? Billy? Tim?! ...Where did everybody go?',
  card: {
    story: 'Sushi\'s Pizzaplex has been closed for years. <b>Billy</b> dared everybody to spend one night inside: <b>Tom</b>, <b>Bob</b> and little <b>Tim</b>. The front doors slammed shut behind them, a music box started playing somewhere in the dark — and everybody ran.',
    goal: '⌚ Find a <b>key card</b> near the Entrance, find <b>Bob</b> in Laser Tag, then <b>upgrade your card</b> at the card machine.',
    watchOut: '👀 <b>Sushi</b> the penguin is waking up on his stage. And something in <b>Laser Tag</b> keeps... appearing.',
    after: 'The card machine buzzed and spat out a purple card. It didn\'t say LEVEL 3. It said <b>DAYCARE</b>. And from somewhere above, very faintly, a music box played.',
  },
  winTitle: 'PART 1 DONE!',
  exitText: 'Open the DAYCARE door 🟪',
  quests: [
    { id: 'blue', type: 'collect', item: 'cblue', count: 1, text: 'Find a key card (look round the Entrance)', done: 'A blue card!' },
    { id: 'bob', type: 'use', target: 'bob', text: 'Find Bob in Laser Tag (the blue door)', done: 'Found Bob!' },
    { id: 'upgrade', type: 'use', target: 'cardMachine', text: 'Upgrade your card at the card machine (Main Area)', done: 'A... DAYCARE card?' },
    { id: 'exit', type: 'exit', text: 'Go through the DAYCARE door (Main Area, bottom left)' },
    { id: 'gift', type: 'visit', room: 'S', optional: true, text: 'Look in the Gift Shop (the blue door)', done: 'A whole shelf for plushies!' },
    PLUSH_QUEST('Find 3 plushies'),
    { id: 'trade', type: 'trade', optional: true, after: 'gift', text: 'Trade a plushie at the Gift Shop counter', done: 'It\'s on the shelf!' },
    { id: 'vent', type: 'visit', room: 'U', optional: true, text: 'Crawl through a vent', done: 'Vents go everywhere in here!' },
    { id: 'pizza', type: 'pizza', optional: true, secret: true, text: 'Bake an old pizza', done: 'Yuck. It\'s REALLY old.' },
  ],
  enemies: [sushi({ start: [31, 44.4], yaw: N, asleep: true, wait: 2 }), moony()],
  tips: {
    sushi: 'Sushi waddles, so walk away and hide — a shelf, a cart, a curtain. If he didn\'t see you get in, he walks right past.',
    moony: 'Moony never leaves Laser Tag, but he can blink from place to place. Keep moving, and get out of Laser Tag if he sees you!',
  },
  start(m, resumed) {
    m.setUp();
    if (!m.flags.bob) m.placeFriend('bob', SPOTS.bobHide, E, 'crouch');
    else m.placeFriend('bob', SPOTS.backRoom[0], W);
    m.decor.exit.setOpen(m.hasCard('daycare'));
    if (m.hasCard('blue')) find(m, 'sushi').wake();
    if (!resumed) {
      talk(m, 'dare', [
        [3800, 'Billy', '*kshh* Tom?! Tom, it\'s Billy! Everybody okay?!'],
        [7800, 'Tom', 'The doors locked! Where are you?'],
        [11400, 'Billy', 'I don\'t know! I ran and ran. I think Bob went into Laser Tag. And Tim... I didn\'t see where Tim went.', 5.2],
        [17400, 'Billy', 'The doors in here have card readers. Look for a card!', 3.6],
      ]);
    }
  },
  collect(m, item) {
    if (item.kind === 'cblue') {
      m.giveCard('blue');
      const s = find(m, 'sushi');
      s.wake(1.0);
      sfx.musicBoxSting();
      setTimeout(() => m.say('*clunk* ...the stage lights just came on. Is that... Sushi?!', 3.4), 1500);
    }
  },
  use(m, t) {
    if (t.id === 'bob') { foundBob(m); return true; }
    if (t.id === 'cardMachine') {
      if (!m.hasCard('green')) {
        sfx.repairBad();
        m.say('"PLEASE INSERT A GREEN CARD TO UPGRADE." ...I need a green card.', 3.4);
        return false;
      }
      cardMachine(m);
      return true;
    }
    return true;
  },
  update(m, dt) { cardMachineTick(m, dt); },
};

function foundBob(m) {
  m.flags.bob = true;
  m.friendUp('bob');
  sfx.happy();
  talk(m, 'dare', [
    [200, 'Bob', 'TOM! You found me! There\'s a purple Gus in here — he just APPEARS out of nowhere!', 4],
    [4500, 'Bob', 'I found this in a locker. A green card! It\'s better than the blue one.', 3.6],
    [8400, 'Bob', 'I\'m going to hide in the Gift Shop\'s back room. Come get me when we find a way out!', 4],
  ]);
  setTimeout(() => {
    if (m.game.mode !== 'escape' || m.def.id !== 'dare') return;
    m.giveCard('green');
  }, 4700);
  setTimeout(() => {
    if (m.game.mode !== 'escape' || m.def.id !== 'dare') return;
    m.placeFriend('bob', SPOTS.backRoom[0], W);
  }, 12500);
}

// The card machine: green in... purple out.
function cardMachine(m) {
  const d = m.decor;
  m.flags.machine = 3.2;
  sfx.camSwitch();
  m.say('"UPGRADING YOUR CARD... PLEASE WAIT..."', 2.6, '🎫 Card machine');
  setTimeout(() => {
    if (m.game.mode !== 'escape' || m.def.id !== 'dare') return;
    m.giveCard('daycare');
    d.exit.setOpen(true);
    sfx.musicBoxSting();
    talk(m, 'dare', [
      [600, 'Tom', 'DAYCARE? I wanted a better card... Why would it give me a DAYCARE card?', 3.8],
      [4800, '???', '...Go on, Tom. Gerald\'s been waiting for you.', 3.6],
      [8800, 'Tom', '...Who said that?!', 2.4],
    ]);
  }, 3000);
  void d;
}

function cardMachineTick(m, dt) {
  const d = m.decor;
  if (!d.cardScreen) return;
  if (m.flags.machine > 0) {
    m.flags.machine -= dt;
    d.cardScreen.material.color.set(Math.sin(m.game.t * 20) > 0 ? 0xc040ff : 0x3cdc6b).multiplyScalar(2);
  }
}

// ═════════════════════════════════════════════════════════════════════════
// Part 2 — Gerald's Daycare
// ═════════════════════════════════════════════════════════════════════════

const daycare = {
  id: 'daycare',
  name: "Gerald's Daycare",
  layout: daycareLayout,
  build(d) {
    buildDaycare(d);
    d.item('badge', 'badge', DAYCARE_SPOTS.desk[0] - 0.6, DAYCARE_SPOTS.desk[1] + 0.9, 1.25);
    d.item('splush', 'p4', 2.6, 2.4, 0.5);
    d.item('splush', 'p5', 18.0, 9.6, 1.0);
    d.item('splush', 'p6', 41.6, 5.6, 0.5);
    d.target('geraldTalk', ...DAYCARE_SPOTS.talk, 'north', 'Talk to Gerald', null, { reach: 2.2 });
    for (const id of ['rope1', 'rope2', 'toy1', 'toy2', 'toy3']) d.targets.find((t) => t.id === id).free = true;
    d.spots.spawn = d.place.P(...DAYCARE_SPOTS.spawn);
  },
  mood: { amb: 0.06, hemi: 0.06, fog: 0.03, bg: 0x04030a },
  spawn: { at: DAYCARE_SPOTS.spawn, yaw: E },
  cards: ['blue', 'green', 'daycare'],
  firstLine: 'The door... it locked behind me. Hello? Is anybody in here?',
  card: {
    story: 'Behind the DAYCARE door it was dark and quiet, except for the soft creak of rope. Then the door slammed behind Tom. High up in the dark, something big swung on its <b>strings</b>.',
    goal: '⌚ Find all <b>5 fuses</b> and put them in the <b>generator</b>. Some are up high — <b>climb the ropes</b>. Then get the <b>Security Badge</b> and get out the <b>Daycare Exit</b>.',
    watchOut: '👀 <b>Gerald</b> hangs from the ceiling on strings, and he goes right over the ball pit and the pool. When he\'s close he swoops down. Wind up a <b>noisy toy</b> to make him go and look.',
    after: 'With the Security Badge, the bars on the Daycare Exit slid back. Gerald waved from his stage. <i>"Be careful, Tom. Whoever was pulling my strings... is still out there."</i>',
  },
  winTitle: 'PART 2 DONE!',
  exitText: 'Out the DAYCARE EXIT 🟨',
  quests: [
    { id: 'fuses', type: 'collect', item: 'fuse', count: 5, text: 'Find 5 fuses (some are up high — climb the ropes)', done: 'All five fuses!' },
    { id: 'power', type: 'use', target: 'generator', text: 'Put the fuses in the generator (top right)', done: 'The power is back on!' },
    { id: 'gerald', type: 'use', target: 'geraldTalk', text: 'Talk to Gerald on his stage', done: 'Gerald is GOOD!' },
    { id: 'badge', type: 'collect', item: 'badge', count: 1, text: 'Get the Security Badge from the Security Desk', done: 'The Security Badge!' },
    { id: 'exit', type: 'exit', text: 'Out the Daycare Exit, by the stage!' },
    { id: 'toy', type: 'toy', optional: true, text: 'Wind up a noisy toy (the Distraction)', done: 'Diddle-diddle-dee!' },
    { id: 'climb', type: 'climb', optional: true, text: 'Climb a rope', done: 'Up high!' },
    PLUSH_QUEST('Find 3 plushies'),
  ],
  enemies: [{
    id: 'gerald', name: 'Gerald', cls: Puppet, build: buildPuppetGerald, walk: 2.0, chase: 3.6, sight: 12, hear: 9, hunt: 0.35, lose: 5,
    roam: ['R'], start: [20, 18], hang: 1.1, reach: 1.3, shoutWho: 'Gerald', wait: 3,
    shout: pick(['Snack time!', 'Come here, little snack!', 'Playtime! PLAYTIME!', 'Nap time is OVER!']),
  }],
  tips: {
    gerald: 'Gerald can go right over the ball pit and the pool. Hide before he swoops — or wind up a noisy toy so he goes to look at that instead.',
  },
  start(m, resumed) {
    m.setUp();
    const d = m.decor;
    const g = find(m, 'gerald');
    if (m.flags.power) powerOn(m, true);
    else for (const f of d.genFuses) f.visible = false;
    if (!m.done.has('gerald')) m.setFound(d.items.find((i) => i.kind === 'badge'), true);
    if (m.flags.good) { g.pos.copy(m.place.P(...DAYCARE_SPOTS.stage)); g.makeGood(); g.yaw = 0; }
    for (const b of d.exitBars) b.visible = !m.hasCard('badge');
    d.exit.setOpen(m.hasCard('badge'));
    if (!resumed) {
      talk(m, 'daycare', [
        [4200, 'Billy', '*kshh* Tom? Bob says you went into the DAYCARE?! Why would you go in there?!', 4],
        [8600, 'Tom', 'The door locked behind me. I\'ve got to find another way out.', 3.4],
        [12600, 'Gerald', 'Playtime... PLAYTIME! Who\'s ready for a snack?', 3.2],
      ]);
    }
  },
  collect(m, item) {
    if (item.kind === 'fuse' && m.count('fuse') === 1) setTimeout(() => m.say('A fuse! The generator\'s in the top right corner.', 3), 900);
    if (item.kind === 'badge') {
      m.giveCard('badge');
      for (const b of m.decor.exitBars) b.visible = false;
      m.decor.exit.setOpen(true);
      sfx.escUnlock();
      setTimeout(() => m.say('The bars on the Daycare Exit just slid open!', 3), 1000);
    }
  },
  use(m, t) {
    if (t.id === 'generator') { powerOn(m, false); return true; }
    if (t.id === 'geraldTalk') { geraldTalks(m); return true; }
    if (t.id.startsWith('toy')) { if (windToy(m, t.id)) m.check('toy'); return true; }
    if (t.id.startsWith('rope')) { m.climb(t); m.check('climb'); return true; }
    return true;
  },
  update(m, dt) { updateToys(m, dt); },
};

// Five fuses in, and the power comes up: Gerald's strings go slack.
function powerOn(m, quiet) {
  const d = m.decor, g = find(m, 'gerald');
  m.flags.power = true;
  for (const f of d.genFuses) f.visible = true;
  for (const l of d.power) l.off = false;
  m.game.lighting.setEscape(d, { ...m.def.mood, amb: 0.1, hemi: 0.1 });
  if (quiet) { m.flags.good = true; return; }
  sfx.powerOn();
  g.pos.copy(m.place.P(...DAYCARE_SPOTS.stage));
  g.yaw = 0;
  g.makeGood();
  m.flags.good = true;
  sfx.friendly(g.pos);
  talk(m, 'daycare', [
    [1200, 'Gerald', '...Huh? Where... Oh no. Oh, no, no. Did I scare you?', 3.4],
    [5000, 'Gerald', 'I\'m so sorry. I couldn\'t stop. Somebody was pulling my strings! Come here, to my stage.', 4.4],
  ]);
}

function geraldTalks(m) {
  const g = find(m, 'gerald');
  g.waving = true;
  sfx.friendly(g.pos);
  talk(m, 'daycare', [
    [100, 'Gerald', 'Thank you. The strings went up into the dark, and I never saw who was holding them. Only heard... a music box.', 5],
    [5400, 'Gerald', 'The Security Badge is in the drawer at the Security Desk. It opens every staff door in Sushi\'s.', 4.4],
    [10000, 'Gerald', 'Go find your friends, Tom. And stay away from the music.', 3.4],
  ]);
  setTimeout(() => {
    if (m.game.mode !== 'escape' || m.def.id !== 'daycare') return;
    m.setFound(m.decor.items.find((i) => i.kind === 'badge'), false);
    sfx.escUnlock();
    g.waving = false;
  }, 5600);
}

// ═════════════════════════════════════════════════════════════════════════
// Part 3 — The Badge
// ═════════════════════════════════════════════════════════════════════════

const badge = {
  id: 'badge',
  name: 'The Badge',
  layout: pizzaplexLayout(),
  build(d) {
    buildPizzaplex(d, { part: 3 });
    d.item('cpart', 'gear', SPOTS.billyHide[0], SPOTS.billyHide[1], 0.5);
    d.item('cpart', 'chain', 62.0, 24.0, 0.5);
    d.item('cpart', 'lever', 62.0, 46.2, 0.5);
    d.item('splush', 'p7', 10.4, 28.4, 0.5);
    d.item('splush', 'p8', 55.2, 18.6, 0.6);
    d.item('splush', 'p9', 20.5, 33.0, 1.05);
    d.target('billy', SPOTS.billyHide[0] + 1.0, SPOTS.billyHide[1], 'east', 'Billy! It\'s me!', null, { reach: 1.7 });
    d.target('tim', SPOTS.timOut[0] + 0.8, SPOTS.timOut[1], 'west', 'Tim! You\'re okay!', null, { reach: 1.8 });
    d.exitDoor(43.45, 16.2, 'west', { w: 1.2, label: 'VENT' });
    d.label('BIG VENT ↗', 43.96, 16.2, 2.55, 1.4, 0.3, 'west', { bg: '#22242a', fg: '#f2c230', glow: '#f2c230' });
    d.spots.spawn = d.place.P(21, 44.8);
  },
  mood: { amb: 0.075, hemi: 0.075, fog: 0.03, bg: 0x050308 },
  spawn: { at: [21, 44.8], yaw: 0 },
  cards: ['blue', 'green', 'daycare', 'badge'],
  firstLine: 'Back in the Main Area. Okay. Billy said the Go-Karts...',
  card: {
    story: 'The Daycare Exit came out right back in Sushi\'s Main Area. Tom had the <b>Security Badge</b> now — and every staff door in the place would open for it.',
    goal: '⌚ Find <b>Billy</b> at the Go-Karts, find <b>3 roller-coaster parts</b>, fix the coaster at its <b>control booth</b> to bring <b>Tim</b> down, then get everybody to the <b>Back Room</b>\'s big vent.',
    watchOut: '👀 <b>Flipper</b> drives his go-kart round and round the track, and <b>Chomper</b> rides a runaway coaster cart up and down the rails. Don\'t be on the track when they come! And <b>Sushi</b> is still waddling about.',
    after: 'All four of them squeezed into the big vent, one after another. The metal was cold and it went up, and up, into the dark over the rooms. Somewhere ahead, a music box was playing.',
  },
  winTitle: 'PART 3 DONE!',
  exitText: 'Everybody into the big vent! 🌀',
  quests: [
    { id: 'billy', type: 'use', target: 'billy', text: 'Find Billy at the Go-Karts (in the garage in the middle)', done: 'Found Billy!' },
    { id: 'parts', type: 'collect', item: 'cpart', count: 3, text: 'Find 3 roller-coaster parts (Play Area)', done: 'All 3 parts!' },
    { id: 'fix', type: 'use', target: 'booth', text: 'Fix the coaster at its control booth (bottom of the Play Area)', done: 'The coaster\'s running!' },
    { id: 'tim', type: 'use', target: 'tim', text: 'Get Tim at the END station', done: 'Tim\'s safe!' },
    { id: 'exit', type: 'exit', text: 'Everybody to the Back Room — into the big vent!' },
    { id: 'vip', type: 'visit', room: 'Q', optional: true, text: 'Get into VIP Seating (trade plushies for the VIP card)', done: 'VIP!' },
    { id: 'photo', type: 'photo', optional: true, after: 'vip', text: 'Look at the old photo in VIP Seating', done: 'Who\'s the guy in the otter suit?' },
    PLUSH_QUEST('Find 3 plushies'),
    { id: 'trade', type: 'trade', optional: true, text: 'Trade plushies at the Gift Shop counter', done: 'More on the shelf!' },
  ],
  enemies: [sushi({ start: [33, 33], wait: 6, roam: ['N', 'M', 'S', 'B', 'Q'] }), flipper(), chomper(), moony()],
  tips: {
    sushi: 'Sushi waddles. Walk away and hide in a shelf or a cart — if he didn\'t see you get in, he walks right past.',
    flipper: 'Flipper\'s kart goes round and round. Wait till he\'s gone by, then cross the track behind him!',
    chomper: 'Chomper\'s cart goes up and down the rails. When he\'s at the far end, cross — fast!',
    moony: 'Moony never leaves Laser Tag. Stay out of it!',
  },
  start(m, resumed) {
    m.setUp();
    const d = m.decor;
    m.placeFriend('bob', SPOTS.backRoom[0], W);
    if (m.flags.billy) m.placeFriend('billy', SPOTS.backRoom[1], N);
    else m.placeFriend('billy', SPOTS.billyHide, E, 'crouch');
    if (m.flags.tim) m.placeFriend('tim', SPOTS.backRoom[2], W);
    else m.placeFriend('tim', SPOTS.timTop, N, 'cry', 2.35);
    if (!m.done.has('billy')) m.setFound(d.items.find((i) => i.id === 'gear'), true);
    d.exit.setOpen(!!m.flags.tim && !!m.flags.billy);
    if (m.flags.fixed) coasterFixed(m, true);
    if (!resumed) {
      talk(m, 'badge', [
        [3500, 'Billy', '*kshh* Tom?! It\'s Billy! I\'m hiding in the garage in the middle of the Go-Kart track — and FLIPPER keeps driving round and round!', 5],
        [9400, 'Billy', 'And Tim... I can hear Tim crying. I think he\'s stuck up on the roller coaster!', 4],
        [14200, 'Tom', 'Hang on, Billy. I\'ve got the Security Badge now. I\'m coming!', 3.4],
      ]);
    }
  },
  collect(m, item) {
    if (item.kind === 'cpart' && m.count('cpart') < 3) setTimeout(() => m.say(`A coaster part! (${m.count('cpart')} of 3)`, 2.4), 600);
  },
  use(m, t) {
    if (t.id === 'billy') { foundBilly(m); return true; }
    if (t.id === 'booth') { coasterFixed(m, false); return true; }
    if (t.id === 'tim') { foundTim(m); return true; }
    return true;
  },
  questDone(m, q) {
    if (q.id === 'tim' || q.id === 'billy') m.decor.exit.setOpen(!!m.flags.tim && !!m.flags.billy);
  },
  update(m, dt) { trainRoll(m, dt); },
};

function foundBilly(m) {
  m.flags.billy = true;
  m.friendUp('billy');
  sfx.happy();
  talk(m, 'badge', [
    [200, 'Billy', 'TOM! I thought Flipper was going to run me over! ...This was a dumb dare. I\'m sorry.', 4],
    [4600, 'Billy', 'Here — this gear fell off the roller coaster when it broke down. I think it\'s one of the parts it needs.', 4.2],
    [9200, 'Billy', 'I\'ll go wait in the Back Room with Bob. Get Tim, okay?', 3],
  ]);
  setTimeout(() => {
    if (m.game.mode !== 'escape' || m.def.id !== 'badge') return;
    const gear = m.decor.items.find((i) => i.id === 'gear');
    m.setFound(gear, false);
    m.collect(gear);
  }, 4800);
  setTimeout(() => {
    if (m.game.mode !== 'escape' || m.def.id !== 'badge') return;
    m.placeFriend('billy', SPOTS.backRoom[1], N);
  }, 12500);
}

// The coaster's three lights come on, it groans, and the stuck train rolls down to the END
// station with Tim in it.
function coasterFixed(m, quiet) {
  const d = m.decor;
  m.flags.fixed = true;
  for (const l of d.boothLights) l.material.color.set(0x3cff6b).multiplyScalar(2);
  if (quiet) {
    d.train.position.set(0, -1.6, -6.5);
    if (!m.flags.tim) m.placeFriend('tim', SPOTS.timOut, W, 'cry');
    return;
  }
  sfx.powerOn();
  sfx.garageDoor();
  m.trainT = 0;
  const ch = find(m, 'chomper');
  if (ch) ch.boost = 1.3;
  talk(m, 'badge', [
    [600, 'Tom', 'It\'s working! Come on, come on...', 2.6],
    [5600, 'Tim', 'TOOOOM! I\'m coming DOWN!', 2.6],
  ]);
}

function trainRoll(m, dt) {
  if (m.trainT === undefined || m.trainT === null) return;
  const d = m.decor;
  m.trainT += dt;
  const k = Math.min(1, m.trainT / 4.5);
  const e = k * k;
  d.train.position.set(0, -1.6 * Math.min(1, e * 1.6), -6.5 * e);
  // Tim rides it down
  const tim = m.people.tim;
  const p = m.place.P(47.5, 38.6 - 6.5 * e);
  tim.root.position.set(p.x, 2.35 - 2.1 * Math.min(1, e * 1.6), p.z);
  if (k >= 1) {
    m.trainT = null;
    sfx.crash(m.place.P(47.5, 32));
    m.placeFriend('tim', SPOTS.timOut, W, 'cry');
  }
}

function foundTim(m) {
  m.flags.tim = true;
  m.friendUp('tim');
  sfx.happy();
  talk(m, 'badge', [
    [200, 'Tim', 'TOM!!! I was up there FOREVER! Chomper kept going round and round under me!', 4],
    [4400, 'Tom', 'You\'re okay now. Bob and Billy are in the Back Room. Let\'s go.', 3.2],
    [8000, 'Billy', '*kshh* Tom! The front doors are still chained. But there\'s a BIG vent back here. Bob says the vents go all over this place.', 5],
  ]);
  setTimeout(() => {
    if (m.game.mode !== 'escape' || m.def.id !== 'badge') return;
    m.placeFriend('tim', SPOTS.backRoom[2], W);
  }, 7000);
}

// ═════════════════════════════════════════════════════════════════════════
// Part 4 — The Vents
// ═════════════════════════════════════════════════════════════════════════

const vents = {
  id: 'vents',
  name: 'The Vents',
  layout: ventsLayout,
  build(d) {
    buildVents(d);
    d.item('clue', 'c1', 40.2, 2.6, 1.1);
    d.item('clue', 'c2', 44.6, 12.0, 1.2);
    d.item('clue', 'c3', 49.0, 11.6, 0.9);
    d.item('splush', 'p10', 35.2, 1.6, 0.4);
    d.item('splush', 'p11', 22.6, 38.8, 0.4);
    d.item('splush', 'p12', 38.8, 12.0, 1.2);
    d.spots.spawn = d.place.P(...VENT_SPOTS.spawn);
  },
  mood: { amb: 0.055, hemi: 0.055, fog: 0.04, bg: 0x030206 },
  spawn: { at: VENT_SPOTS.spawn, yaw: E },
  cards: ['blue', 'green', 'daycare', 'badge'],
  firstLine: 'Okay. Everybody stay right behind me.',
  card: {
    story: 'The big vent went up over the rooms of Sushi\'s Pizzaplex: a maze of cold metal ducts, with light coming up through the grates. Somewhere ahead, a music box was playing — the same tune Tom heard at the card machine.',
    goal: '⌚ Crawl through the <b>upper vents</b> and find where the music\'s coming from. Then find a way <b>down</b> — and out.',
    watchOut: '👀 Something lives up here. Listen for the <b>click... click... click...</b>',
    after: '',
  },
  winTitle: 'YOU GOT OUT OF SUSHI\'S PIZZAPLEX!',
  exitText: 'Push open the drain grate! 🌙',
  quests: [
    { id: 'room', type: 'visit', room: 'R', text: 'Crawl through the upper vents to the music', done: 'A secret room...' },
    { id: 'clues', type: 'collect', item: 'clue', count: 3, text: 'Look around the secret room (3 clues)', done: 'It\'s HIM!' },
    { id: 'fan', type: 'use', target: 'fanSwitch', text: 'RUN! Pull the FAN switch by the door!', done: 'The fan\'s stopping!' },
    { id: 'shaft', type: 'use', target: 'shaft', text: 'Down the fan shaft (the Fan Room)', done: 'Too small for the suit!' },
    { id: 'exit', type: 'exit', text: 'Crawl out of the under-floor vents!' },
    PLUSH_QUEST('Find 3 plushies'),
  ],
  enemies: [{
    id: 'peter', name: 'Peter', cls: Springer, build: buildPeter, walk: 1.6, chase: 3.4, sight: 13, hear: 10, hunt: 0.7, lose: 9,
    roam: ['U', 'R', 'F'], start: VENT_SPOTS.peterChair, yaw: -Math.PI / 2, asleep: true, steps: 'gus', stride: 0.9, sit: true, reach: 1.2,
    shoutWho: 'Peter', shout: pick(['Click, click, Tom...', 'Gus forever!', 'You can\'t crawl forever!', 'I see you, Tom.']),
  }],
  tips: {
    peter: 'Peter is slow in the ducts — but he never gives up. Keep crawling, and don\'t go back the way he\'s coming!',
  },
  start(m, resumed) {
    m.setUp();
    const d = m.decor;
    m.followAll(VENT_SPOTS.friends);
    d.exit.setOpen(!!m.flags.down);
    const p = find(m, 'peter');
    if (m.flags.awake) { p.wake(); p.state = 'search'; p.goTo(m.place.P(30, 13)); }
    if (m.flags.fanOff) fanOff(m, true);
    if (m.flags.down) { p.root.visible = false; p.state = 'off'; }
    if (!resumed) {
      talk(m, 'vents', [
        [4000, 'Bob', 'It\'s SO tight in here...', 2.4],
        [7200, 'Tim', 'Can you hear that? It\'s music. Like... a music box.', 3.2],
        [11000, 'Billy', 'It\'s coming from up ahead. Over the stage, I think.', 3],
      ]);
    }
  },
  collect(m, item) {
    if (item.kind !== 'clue') return;
    const n = m.count('clue');
    const lines = {
      1: 'An old photo: a teenager in an OTTER costume, next to an old man in a toymaker\'s apron. It says "THE FIRST GUS — PETER."',
      2: 'Drawings of Moony. "Built from Gus\'s old parts. He will LISTEN to the music."',
      3: 'A box of old fuses with a note: "The storm. Pull them all at once. Let the lightning do the rest."',
    };
    m.say(lines[n] || 'A clue...', 5.2, 'Tom');
    if (n === 3 && !m.flags.awake) setTimeout(() => peterWakes(m), 2600);
  },
  use(m, t) {
    if (t.id === 'fanSwitch') { fanOff(m, false); return true; }
    if (t.id === 'shaft') {
      if (!m.flags.fanOff) { sfx.repairBad(); m.say('The fan\'s still spinning! It\'s too dangerous.', 2.6); return false; }
      goDown(m);
      return true;
    }
    return true;
  },
  update(m, dt) {
    const d = m.decor;
    d.fanSpin = d.fanSpin ?? 9;
    d.fanSpin = m.flags.fanOff ? Math.max(0, d.fanSpin - dt * 3) : 9;
    d.fanBlades.rotation.y += d.fanSpin * dt;
    if (d.musicBox) d.musicBox.rotation.y += dt * 1.5;
    m.boxT = (m.boxT ?? 3) - dt;
    if (m.boxT <= 0 && m.room === 'R' && !m.flags.down) { m.boxT = 5; sfx.musicBoxSting(); }
    for (const s of d.screens) if (Math.random() < 0.02) s.material.color.copy(s.userData.base).multiplyScalar(0.6 + Math.random() * 0.8);
  },
};

// The third clue: the costume in the chair isn't empty.
function peterWakes(m) {
  if (m.game.mode !== 'escape' || m.def.id !== 'vents') return;
  m.flags.awake = true;
  m.midScene('peterReveal', () => {
    const p = find(m, 'peter');
    p.wake(1);
    p.state = 'wait';
    p.timer = 2.5;
    m.grace = 3;
    m.complete('clues');
    talk(m, 'vents', [[300, 'Billy', 'GO, GO, GO!', 1.6]]);
  });
}

function fanOff(m, quiet) {
  const d = m.decor;
  m.flags.fanOff = true;
  if (d.fanLever) d.fanLever.rotation.x = -0.5;
  const i = m.place.colliders.indexOf(d.fanBlock);
  if (i >= 0) m.place.colliders.splice(i, 1);
  if (quiet) return;
  sfx.powerDown(m.place.P(31, 20, 1));
  setTimeout(() => m.say('The fan\'s winding down! The Fan Room — the shaft goes DOWN!', 3.2), 600);
}

// Down the shaft into the vents under the floor, where the suit can't follow.
function goDown(m) {
  const p = m.player;
  m.flags.down = true;
  p.pos.copy(m.place.P(...VENT_SPOTS.shaftBottom));
  p.yaw = E;
  // and your friends drop down right behind you, in a line
  const [bx, bz] = VENT_SPOTS.shaftBottom;
  m.trail = [];
  for (let x = bx + 2.4; x > bx; x -= 0.3) m.trail.push(m.place.P(x, bz));
  m.followers.forEach((f, i) => f.pos.copy(m.place.P(bx + 0.9 + i * 0.75, bz)));
  sfx.plexClunk();
  m.decor.exit.setOpen(true);
  const peter = find(m, 'peter');
  talk(m, 'vents', [
    [800, '???', 'You can\'t hide down there forever, Tom!', 2.8],
    [4200, 'Peter', '...Fine. Run along home. I\'ll be seeing you.', 3.2],
    [7800, 'Tim', 'Is he gone? I think he\'s GONE.', 2.4],
  ]);
  setTimeout(() => {
    if (m.game.mode !== 'escape' || m.def.id !== 'vents') return;
    peter.state = 'off';
    peter.root.visible = false;
    sfx.clicks(peter.pos);
  }, 4200);
}

export const PARTS = [dare, daycare, badge, vents];
export { setShelf, THREE, poseRig };
