// 10 Nights at Culac's Daycare (the designer's story; DESIGN.md has it all). Every night the way
// out is somewhere different (his rule). Some nights you find what opens it, some you hide
// until 6 AM — 25 minutes (his pick) — and then run for it, and on the last night you wake
// the kids and bring them all out with you.
//
//   1 Wake Up, Jimmy     the fire door key (Owl's Café), the alarm (Pet Zone) → FIRE EXIT
//   2 Officer Grumble    three padlock keys → the POOL DOOR
//   3 Hide Until Six     survive → the Arcade's PRIZE DOOR
//   4 The Trail          four lantern batteries → the Forest's TRAIL GATE
//   5 Super Jump         survive → the SLIDE EXIT
//   6 Into the Maze      the key in Sunny's clearing → the Maze's SECRET DOOR
//   7 Lights Out         survive → the Bathroom WINDOW
//   8 Five Fuses         five fuses into the generator → the Ball Pit's BACK DOOR
//   9 The Longest Night  survive → the PLAY GATE
//  10 Everybody Out      Officer Grumble's key card, wake the kids → the FRONT DOORS
//
// Each night is a level for When Jonathan Was Five's engine (js/escape/mode.js), with the
// daycare's own pieces on top (CulacMode, mode.js): the kids in the beds, the raids, the
// cameras, the giant slide.
import { buildAnimatronic } from '../models.js';
import { buildSparky } from '../plex/cast.js';
import { buildMeanBaby, buildRoglego, buildOuchie, buildGokupug, buildGrumble } from './cast.js';
import { Raider, Crier, Wirer, Jumper, Drifter, Flyer, Guard } from './enemies.js';
import { Blinker } from '../sushi/enemies.js';
import { EXITS, HOMES, BEDS, mazeCell, MAZE_HOME } from './layout.js';
import { sfx } from '../audio.js';
import { G, lam, glowMat } from '../decor.js';

const pick = (a) => () => a[Math.floor(Math.random() * a.length)];

// ── Who's after you ─────────────────────────────────────────────────────
//
// Jimmy walks at 3.8 m/s and runs at 6.3, for five seconds at a time.

const FOES = {
  sparky: {
    id: 'sparky', name: 'Sparky', cls: Raider, build: buildSparky, walk: 2.4, chase: 4.6, sight: 13, hear: 12, near: 0.35, lose: 4,
    steps: 'chomper', stride: 0.45, shoutWho: 'Sparky', roam: ['Z', 'H', 'O', 'B'],
    shout: pick(['*BARK BARK BARK!*', 'Woof! Wanna play fetch?!', '*GRRRRR... ARF!*']),
  },
  meanbaby: {
    id: 'meanbaby', name: 'Mean Baby', cls: Crier, build: buildMeanBaby, walk: 1.3, chase: 2.7, sight: 13, hear: 9, near: 0.3,
    steps: 'kid', stride: 0.4, roam: ['Y', 'H', 'M'], callRange: 220, lose: 6,
  },
  roglego: {
    id: 'roglego', name: 'Roglego', cls: Wirer, build: buildRoglego, walk: 1.7, chase: 3.5, sight: 11, hear: 9, feel: 9, near: 0.35, lose: 5,
    steps: 'junk', stride: 0.8, shoutWho: 'Roglego', roam: ['S', 'H', 'B', 'M'],
    shout: pick(['*bzzzt* ...f-found you...', '*crackle* Come into the w-wires...', 'I can go through w-walls. Can YOU?']),
  },
  flipper: {
    id: 'flipper', name: 'Flipper', cls: Raider, build: () => buildAnimatronic('flipper'), walk: 1.9, chase: 3.8, sight: 12, hear: 9, near: 0.3,
    steps: 'flipper', stride: 0.7, shoutWho: 'Flipper', roam: ['P', 'A', 'H'],
    shout: pick(['No running by the pool!', 'Come for a swim!', 'Splish splash!']),
  },
  chomper: {
    id: 'chomper', name: 'Chomper', cls: Raider, build: () => buildAnimatronic('chomper'), walk: 1.8, chase: 3.9, sight: 12, hear: 9, near: 0.3,
    steps: 'chomper', stride: 0.7, shoutWho: 'Chomper', roam: ['K', 'D'],
    shout: pick(['CHOMP CHOMP!', 'Into the balls with you!', 'Found a snack!']),
  },
  gerald: {
    id: 'gerald', name: 'Gerald', cls: Raider, build: () => buildAnimatronic('gerald'), walk: 1.7, chase: 3.7, sight: 12, hear: 9, near: 0.3,
    steps: 'gerald', stride: 1.0, shoutWho: 'Gerald', roam: ['F', 'L', 'D'],
    shout: pick(['*OOH OOH AAH AAH!*', 'No kids in the forest at night!', 'Gerald SEES you!']),
  },
  moony: {
    id: 'moony', name: 'Moony', cls: Blinker, build: () => buildAnimatronic('moony'), walk: 1.6, chase: 3.6, sight: 10, hear: 8, hunt: 0.4, lose: 3,
    steps: 'gerald', stride: 1.0, shoutWho: 'Moony', roam: ['A'],
    shout: pick(['Game over, little one.', 'Insert coin to continue...', 'I see you in the dark...']),
  },
  sunny: {
    id: 'sunny', name: 'Sunny', cls: Drifter, build: () => buildAnimatronic('sunny'), walk: 1.2, chase: 2.9, sight: 10, hear: 8, hunt: 0.4, lose: 6,
    steps: null, shoutWho: 'Sunny', roam: ['Q'],
    shout: pick(['*whispers* ...lost in the fog...', '*whispers* ...stay with me...', '*whispers* ...shhh...']),
  },
  ouchie: {
    id: 'ouchie', name: 'Ouchie', cls: Flyer, build: buildOuchie, fly: 4.2, swoop: 6.0, sight: 20, near: 0.45, lose: 2.5,
    roam: ['O', 'B', 'S', 'H', 'Z'],
    shout: pick(['HOO-HOO! I SEE YOU!', 'HOOOO is out of bed?!', 'Ouchie\'s coming to get you!']),
  },
  gokupug: {
    id: 'gokupug', name: 'Gokupug', cls: Jumper, build: buildGokupug, walk: 2.0, chase: 3.6, sight: 16, hear: 10, near: 0.35, jumpRange: 30, lose: 6,
    steps: 'kid', stride: 0.35, shoutWho: 'Gokupug', roam: ['Y', 'R', 'H', 'Z'],
    shout: pick(['HYAAAH! You can\'t escape me!', 'My power is OVER NINE... um... a LOT!', 'Time to train!']),
  },
  grumble: {
    id: 'grumble', name: 'Officer Grumble', cls: Guard, build: buildGrumble, walk: 1.8, chase: 4.0, beam: 24, legs: 4, near: 0.4, lose: 5,
    steps: 'kid', stride: 0.85, shoutWho: 'Officer Grumble', roam: ['H', 'C', 'M', 'R', 'Y'], calls: 2,
    shout: pick(['HEY! Back to bed!', 'Out of bed after lights out?!', 'Gotcha now, kiddo!']),
  },
};

// One of them, for one night: where it starts is its home on the designer's map.
const foe = (id, extra = {}) => ({ ...FOES[id], start: HOMES[id], ...extra });

// Everyone, for the later nights.
const everyone = (k = {}) => ['sparky', 'meanbaby', 'roglego', 'flipper', 'chomper', 'gerald', 'moony', 'sunny', 'ouchie', 'gokupug', 'grumble'].map((id) => foe(id, k[id] || {}));

const TIPS = {
  sparky: 'Sparky is FAST, but he can\'t open a hiding spot he didn\'t see you get into. Hide!',
  meanbaby: 'Mean Baby is slow, but when it sees you it CRIES and the others come running. Keep away from it!',
  roglego: 'Roglego\'s wires go through the walls. Crouch — it feels you walking when you\'re close.',
  flipper: 'Flipper likes the Pool and the Arcade. Go round him, and hide if he sees you.',
  chomper: 'Chomper isn\'t slowed down by the balls. You are! Stay on the paths in the Ball Pit.',
  gerald: 'Gerald guards the Forest. Walk the trail quietly — running is loud.',
  moony: 'Moony never leaves the Arcade, but he blinks from place to place in it. Get out of the Arcade if he sees you!',
  sunny: 'Sunny is made of fog — you can only see her in your flashlight. Keep it on in the Maze!',
  ouchie: 'Ouchie flies over everything. When he screeches, HIDE — he can\'t get into hiding spots.',
  gokupug: 'Gokupug does a super jump and lands right next to you. After he lands he needs a second: that\'s when you run!',
  grumble: 'Officer Grumble chases you if his flashlight lands on you, and he watches the cameras from his desk. Stay out of the cameras\' red light!',
};

const MOOD = { amb: 0.06, hemi: 0.06, fog: 0.034, bg: 0x040308 };
const spawn = { at: [BEDS.jimmy[0] + 1.1, BEDS.jimmy[1] + 0.2], yaw: -Math.PI / 2 };

// The night's exit, against its outside wall.
const exitAt = (d, id, w = 2.2) => d.exitDoor(...EXITS[id].at, EXITS[id].face, { w, label: EXITS[id].label });
const exitQ = (id, text) => ({ id: 'exit', type: 'exit', text });

// What the kids say when Jimmy gets up (the first line of each night).
const LINES = [
  'Okay, Jimmy. You can do this. Astronauts are BRAVE.',
  'Officer Grumble is awake tonight. I can hear his radio...',
  'Mom said six in the morning. That\'s a LONG time to hide.',
  'The trail gate in the Forest... it\'s really dark in there.',
  'Something\'s going BOOM BOOM BOOM out in the hallway...',
  'The Maze. Why does it have to be the Maze?',
  'Hide till six again. The window in the Bathroom... I can do it.',
  'Five fuses. Five! Okay. Mission control, I\'m going in.',
  'Last night before the last night. Everybody\'s here now...',
  'Tonight we ALL go home. Every single kid.',
];

export const NIGHTS = [
  // ═══ Night 1 — Wake Up, Jimmy ═══════════════════════════════════════
  {
    id: 'wake', name: 'Wake Up, Jimmy',
    layout: null, mood: MOOD, spawn, firstLine: LINES[0],
    intro: 'culacIntro',
    build(d) {
      exitAt(d, 'beds');
      d.item('key', 'firekey', 1430, 389.4, 1.1);
      d.target('alarm', HOMES.sparky[0] + 3.4, HOMES.sparky[1] - 7.2, 'south', 'Switch off the fire door alarm', (g, dd) => {
        dd.mesh(G.box, lam(0xd11f2a), g, { p: [0, 1.3, -0.1], s: [0.7, 0.9, 0.2] });
        dd.mesh(G.sphere, glowMat(0xff3b30, 0.6), g, { p: [0, 1.95, -0.05], s: [0.12, 0.12, 0.12], still: false });
      });
    },
    card: {
      story: 'Jimmy is five. Mom works nights, and so does his big brother Jonathan — at <b>Gus\'s PlayPlace</b>. So on school nights Jimmy sleeps at <b>Culac\'s Daycare</b>, the biggest daycare in the whole world. Tonight something woke him up: footsteps. Big, heavy ones.',
      goal: '⌚ Find the <b>fire door key</b> in <b>Owl\'s Café</b>, switch off the door <b>alarm</b> in the <b>Pet Zone</b>, then get out the <b>FIRE EXIT</b> at the top of the Beds.',
      watchOut: '🐶 <b>Sparky</b> sleeps in the Pet Zone. 😭 Something in the Baby Zone is crying. And <b>don\'t wake the owl</b>.',
      after: 'The fire door clanged open onto the cold night air... and the alarm stayed quiet. Jimmy ran all the way round to the front, and in the morning Mom found him asleep on the steps. "You must have been sleepwalking," she said. Jimmy didn\'t say anything. Because the next night, she brought him back.',
    },
    winTitle: 'NIGHT 1 DONE!',
    exitText: 'Out the FIRE EXIT! 🏃',
    quests: [
      { id: 'key', type: 'collect', item: 'key', count: 1, text: 'Find the fire door key (Owl\'s Café, by the counter)', done: 'Got the key!' },
      { id: 'alarm', type: 'use', target: 'alarm', text: 'Switch off the door alarm (Pet Zone, by Sparky\'s doghouse)', done: 'The alarm\'s off!' },
      exitQ('beds', 'Out the FIRE EXIT (the top of the Beds)'),
      { id: 'cafe', type: 'visit', room: 'O', optional: true, text: 'Sneak into Owl\'s Café', done: 'Shhh... Ouchie\'s asleep up in the tree.' },
      { id: 'hide', type: 'hide', optional: true, text: 'Hide somewhere', done: 'Good hiding spot!' },
      { id: 'save', type: 'save', optional: true, text: 'Touch a save box 😁', done: 'Saved!' },
    ],
    enemies: [foe('sparky', { asleep: true }), foe('meanbaby'), foe('ouchie', { asleep: true }), foe('grumble', { asleep: true })],
    tips: TIPS,
    start(m, resumed) {
      if (m.found('firekey')) m.wake('sparky');
      if (!resumed) {
        m.talk([[3200, 'Jimmy', 'Leo? ...Leo, wake up! Did you hear that?'], [6800, 'Leo', '*snore*... five more minutes, Mom...'], [10400, 'Jimmy', 'Something BIG is walking around out there. I have to get out and tell Mom!', 4]]);
      }
    },
    collect(m, item) {
      if (item.id === 'firekey') {
        m.wake('sparky', 1.0);
        setTimeout(() => m.say('*clink*... and from the Pet Zone: *ARF!* Uh oh. Sparky\'s awake.', 3.4), 1200);
      }
    },
    use(m, t) {
      if (t.id === 'alarm') { sfx.escUnlock(); return true; }
      return true;
    },
  },

  // ═══ Night 2 — Officer Grumble ══════════════════════════════════════
  {
    id: 'grumble', name: 'Officer Grumble',
    mood: MOOD, spawn, firstLine: LINES[1],
    build(d) {
      exitAt(d, 'pool');
      d.item('key', 'pad1', 1005, 820, 0.55);         // the middle of the Play Structure
      d.item('key', 'pad2', 641.3, 1050, 1.3);        // on the Arcade's prize counter
      d.item('key', 'pad3', 580, 300, 1.3);           // under a lifeguard chair at the Pool
    },
    raids: { first: 150, every: 300 },
    card: {
      story: 'The fire exit has a new lock on it, and the daycare has a new night guard: <b>Officer Grumble</b>. He\'s tall and skinny and he never smiles, and he sits up all night watching the cameras. Jimmy saw something walk past the Beds again. Big. Lots of wires.',
      goal: '⌚ The <b>POOL DOOR</b> has three padlocks. Find the <b>three keys</b>: the <b>Play Structure</b>, the <b>Arcade</b>\'s prize counter, and under a <b>lifeguard chair</b> at the Pool.',
      watchOut: '👮 <b>Officer Grumble</b> watches the cameras (keep out of their red light) and walks his rounds. 🧶 <b>Roglego</b> lives in the Play Structure. And if one goes for the <b>Beds</b>... lead it away from the kids!',
      after: 'Click, click, CLICK. The pool door swung open, and Jimmy ran out past the empty lifeguard chair into the night. Behind him, Officer Grumble\'s radio crackled: "...one got out. Tell the boss."',
    },
    winTitle: 'NIGHT 2 DONE!',
    exitText: 'Out the POOL DOOR! 🏃',
    quests: [
      { id: 'keys', type: 'collect', item: 'key', count: 3, text: 'Find the three padlock keys (Play Structure, Arcade, Pool)', done: 'All three keys!' },
      exitQ('pool', 'Out the POOL DOOR (the top of the Pool)'),
      { id: 'grumble', type: 'visit', room: 'C', optional: true, text: 'Peek into the Security Office', done: 'So many cameras...' },
      { id: 'save', type: 'save', optional: true, text: 'Touch a save box 😁', done: 'Saved!' },
    ],
    enemies: [foe('sparky'), foe('meanbaby'), foe('roglego'), foe('ouchie', { asleep: true }), foe('grumble')],
    tips: TIPS,
    start(m, resumed) {
      if (!resumed) m.talk([[3600, 'Leo', '*whispers* Jimmy! Where are you going?!'], [7200, 'Jimmy', 'Out. Something\'s walking around. Stay in bed, okay? I\'ll get help.'], [11000, 'Leo', 'Okay... but if a monster comes for me, you come back!', 3.6]]);
    },
  },

  // ═══ Night 3 — Hide Until Six ═══════════════════════════════════════
  {
    id: 'six', name: 'Hide Until Six',
    mood: MOOD, spawn, firstLine: LINES[2],
    clock: { seconds: 1500 },
    goText: '▶ Survive the night',
    build(d) { exitAt(d, 'arcade'); },
    raids: { first: 100, every: 220 },
    card: {
      story: 'Every door is locked tonight — Officer Grumble locked them himself. But at <b>6 AM</b> the Arcade\'s prize door opens for the morning delivery. Jimmy just has to stay hidden until then. And keep the kids safe. And there are more of them now: <b>Flipper</b> and <b>Chomper</b>, from Gus\'s PlayPlace. They <b>sneak over at night</b>.',
      goal: '⌚ <b>Survive until 6 AM</b> (25 minutes), and keep them away from the <b>Beds</b>. Then RUN for the <b>PRIZE DOOR</b> on the far side of the Arcade!',
      watchOut: '🐬 <b>Flipper</b> at the Pool, 🦫 <b>Chomper</b> in the Ball Pit — and everyone from before. If one takes a kid, go and <b>get them back</b>.',
      after: 'At six the prize door rattled up, and Jimmy ran out past a very surprised delivery man. "Gus\'s PlayPlace? Those animatronics?" Jonathan said at breakfast. "No way. They were on the stage all night. ...Weren\'t they?"',
    },
    winTitle: 'YOU MADE IT TO 6 AM!',
    exitText: 'Out the PRIZE DOOR! 🏃',
    quests: [
      { id: 'survive', type: 'survive', text: 'Survive until 6 AM — and keep them away from the Beds' },
      exitQ('arcade', 'RUN! Out the PRIZE DOOR (the far end of the Arcade)'),
      { id: 'save', type: 'save', optional: true, text: 'Touch a save box 😁', done: 'Saved!' },
      { id: 'hide', type: 'hide', optional: true, text: 'Hide somewhere', done: 'Good hiding spot!' },
    ],
    enemies: [foe('sparky'), foe('meanbaby'), foe('roglego'), foe('flipper'), foe('chomper'), foe('ouchie', { asleep: true }), foe('grumble')],
    tips: TIPS,
  },

  // ═══ Night 4 — The Trail ════════════════════════════════════════════
  {
    id: 'trail', name: 'The Trail',
    mood: MOOD, spawn, firstLine: LINES[3],
    build(d) {
      exitAt(d, 'forest');
      d.item('battery', 'b1', 1450, 880, 0.55);       // the Pet Zone
      d.item('battery', 'b2', 1990, 520, 0.55);       // the Play Area
      d.item('battery', 'b3', 2050, 1450, 0.55);      // the Slides
      d.item('battery', 'b4', 1580, 640, 0.55);       // deep in the Forest
      d.target('gate', EXITS.forest.at[0] + 3, EXITS.forest.at[1] + 1.2, 'south', 'Put the batteries in the gate\'s lock', (g, dd) => {
        dd.mesh(G.box, lam(0x3a3d44), g, { p: [0, 1.1, -0.3], s: [0.8, 1.0, 0.3] });
        dd.mesh(G.box, glowMat(0x5ad1ff, 0.4), g, { p: [0, 1.3, -0.14], s: [0.5, 0.2, 0.02], still: false });
      });
    },
    raids: { first: 160, every: 280 },
    card: {
      story: 'The Forest at Culac\'s has a trail through it, with old animatronic animals along the way — a deer, a bear, a giant rabbit — and at the end of it, a gate out. Its lock runs on batteries. Tonight, Jimmy heard wings up by the roof. Big ones.',
      goal: '⌚ Find <b>four batteries</b> (Pet Zone, Play Area, Slides, and deep in the Forest), put them in the <b>gate\'s lock</b>, and out the <b>TRAIL GATE</b> at the top of the Forest.',
      watchOut: '🦉 <b>Ouchie</b> is awake! He flies over everything — when he screeches, HIDE. 🦍 <b>Gerald</b> guards the Forest.',
      after: 'The lock beeped four times, and the gate creaked open. Jimmy ran, and didn\'t look back at the deer. Its head had turned to watch him go.',
    },
    winTitle: 'NIGHT 4 DONE!',
    exitText: 'Out the TRAIL GATE! 🏃',
    quests: [
      { id: 'batteries', type: 'collect', item: 'battery', count: 4, text: 'Find four batteries (Pet Zone, Play Area, Slides, Forest)', done: 'Four batteries!' },
      { id: 'gate', type: 'use', target: 'gate', text: 'Put the batteries in the gate\'s lock (the top of the Forest trail)', done: 'Beep beep beep BEEP!' },
      exitQ('forest', 'Out the TRAIL GATE!'),
      { id: 'slide', type: 'slide', optional: true, text: 'Go down the GIANT SLIDE (Slides)', done: 'WHEEEEEE!' },
      { id: 'save', type: 'save', optional: true, text: 'Touch a save box 😁', done: 'Saved!' },
    ],
    enemies: [foe('sparky'), foe('meanbaby'), foe('roglego'), foe('flipper'), foe('chomper'), foe('ouchie'), foe('gerald'), foe('grumble')],
    tips: TIPS,
  },

  // ═══ Night 5 — Super Jump ═══════════════════════════════════════════
  {
    id: 'jump', name: 'Super Jump',
    mood: MOOD, spawn, firstLine: LINES[4],
    clock: { seconds: 1500 },
    goText: '▶ Survive the night',
    build(d) { exitAt(d, 'slides'); },
    raids: { first: 100, every: 210 },
    card: {
      story: 'BOOM. BOOM. BOOM. Something in the Baby Zone has been training: a pug, with tiny legs, spiky blue hair and a black karate suit. <b>Gokupug</b>. And the Arcade has a new player tonight, all in midnight purple: <b>Moony</b>.',
      goal: '⌚ <b>Survive until 6 AM</b> (25 minutes) and keep the kids safe. Then RUN for the <b>SLIDE EXIT</b>, on the far side of the Slides.',
      watchOut: '🐶 <b>Gokupug</b> does a SUPER JUMP and lands right next to you — run while he gets up. 🌙 <b>Moony</b> blinks around the Arcade.',
      after: 'The slide exit\'s door was at the bottom of the tallest slide. Jimmy went down it so fast he flew right out into the morning. "HYAAAH," said something behind him. Then the door slammed.',
    },
    winTitle: 'YOU MADE IT TO 6 AM!',
    exitText: 'Out the SLIDE EXIT! 🏃',
    quests: [
      { id: 'survive', type: 'survive', text: 'Survive until 6 AM — and keep them away from the Beds' },
      exitQ('slides', 'RUN! Out the SLIDE EXIT (the far side of the Slides)'),
      { id: 'slide', type: 'slide', optional: true, text: 'Go down the GIANT SLIDE (Slides)', done: 'WHEEEEEE!' },
      { id: 'save', type: 'save', optional: true, text: 'Touch a save box 😁', done: 'Saved!' },
    ],
    enemies: [foe('sparky'), foe('meanbaby'), foe('roglego'), foe('flipper'), foe('chomper'), foe('ouchie'), foe('gerald'), foe('gokupug'), foe('moony'), foe('grumble')],
    tips: TIPS,
  },

  // ═══ Night 6 — Into the Maze ════════════════════════════════════════
  {
    id: 'maze', name: 'Into the Maze',
    mood: MOOD, spawn, firstLine: LINES[5],
    build(d) {
      exitAt(d, 'maze');
      const [x0, z0] = mazeCell(MAZE_HOME[0], MAZE_HOME[1]);
      const [x1, z1] = mazeCell(MAZE_HOME[2], MAZE_HOME[3]);
      d.item('key', 'mazekey', (x0 + x1) / 2 + 6, (z0 + z1) / 2 + 5, 0.6);
    },
    raids: { first: 180, every: 300 },
    card: {
      story: 'Culac\'s Maze is a real one, and it\'s giant, and it\'s always full of fog. The kids say there\'s a secret door out of it, if you have the key. And the key is in the middle — where <b>Sunny</b> lives. She\'s made of fog.',
      goal: '⌚ Find the <b>maze key</b> in <b>Sunny\'s clearing</b>, in the middle of the Maze, then out the <b>SECRET DOOR</b> on the Maze\'s left side.',
      watchOut: '☀️ <b>Sunny</b> is made of fog — only your <b>flashlight</b> shows her, and she drifts through walls. Keep it ON.',
      after: 'The secret door was just a bit of wall that swung round. Jimmy came out into the dawn with fog still curling off his space suit. Somewhere inside, very softly, someone was humming.',
    },
    winTitle: 'NIGHT 6 DONE!',
    exitText: 'Through the SECRET DOOR! 🏃',
    quests: [
      { id: 'key', type: 'collect', item: 'key', count: 1, text: 'Find the maze key (Sunny\'s clearing, the middle of the Maze)', done: 'The maze key!' },
      exitQ('maze', 'Out the SECRET DOOR (the Maze\'s left side, near the bottom)'),
      { id: 'maze', type: 'visit', room: 'Q', optional: true, text: 'Go into the Maze', done: 'It\'s SO foggy...' },
      { id: 'save', type: 'save', optional: true, text: 'Touch a save box 😁', done: 'Saved!' },
    ],
    enemies: everyone(),
    tips: TIPS,
  },

  // ═══ Night 7 — Lights Out ═══════════════════════════════════════════
  {
    id: 'lights', name: 'Lights Out',
    mood: { ...MOOD, amb: 0.045, hemi: 0.045, fog: 0.04 }, spawn, firstLine: LINES[6],
    clock: { seconds: 1500 },
    goText: '▶ Survive the night',
    build(d) { exitAt(d, 'bathroom', 2.6); },
    raids: { first: 90, every: 180 },
    card: {
      story: 'Tonight half the lights at Culac\'s won\'t come on. Officer Grumble said it was "the boss\'s orders". Who\'s the boss? Not Mr. Culac — he\'s never even here. Jimmy heard a music box playing in the Security Office.',
      goal: '⌚ <b>Survive until 6 AM</b> (25 minutes) and keep the kids safe. Then RUN for the <b>WINDOW</b> at the very bottom of the Bathroom.',
      watchOut: '🔦 It\'s darker than ever. Everyone is out tonight.',
      after: 'The bathroom window was tiny, but so was Jimmy. He squeezed out and landed in a bush, and when he looked up there was a face in the window of the Security Office. Not Officer Grumble. Something furry. Watching.',
    },
    winTitle: 'YOU MADE IT TO 6 AM!',
    exitText: 'Out the WINDOW! 🏃',
    quests: [
      { id: 'survive', type: 'survive', text: 'Survive until 6 AM — and keep them away from the Beds' },
      exitQ('bathroom', 'RUN! Out the WINDOW (the very bottom of the Bathroom)'),
      { id: 'save', type: 'save', optional: true, text: 'Touch a save box 😁', done: 'Saved!' },
    ],
    enemies: everyone(),
    tips: TIPS,
  },

  // ═══ Night 8 — Five Fuses ═══════════════════════════════════════════
  {
    id: 'fuses', name: 'Five Fuses',
    mood: MOOD, spawn, firstLine: LINES[7],
    build(d) {
      exitAt(d, 'ballpit');
      d.item('fuse', 'f1', 1100, 1205, 1.5);          // on the Meal Zone's kitchen counter
      d.item('fuse', 'f2', 1300, 1430, 0.6);          // the Baby Zone
      d.item('fuse', 'f3', 1250, 2150, 0.6);          // the far end of the Bathroom
      d.item('fuse', 'f4', 1746, 1744, 0.6);          // at the bottom of the giant slide, in the Ball Pit
      d.item('fuse', 'f5', 700, 2150, 0.6);           // the Security Office
      d.target('generator', 2170, 2080, 'west', 'Put the fuses in the generator', (g, dd) => {
        dd.mesh(G.box, lam(0x5a6070), g, { p: [0, 0.8, -0.2], s: [2.4, 1.6, 1.2] });
        dd.mesh(G.box, lam(0xf2c230), g, { p: [0, 1.3, 0.41], s: [1.8, 0.3, 0.02] });
      });
    },
    raids: { first: 150, every: 260 },
    card: {
      story: 'The Ball Pit\'s back door is electric, and the power to it is off — somebody took the fuses out of the generator and hid them all over the daycare. Five of them. One is at the bottom of the <b>giant slide</b>, in the balls.',
      goal: '⌚ Find <b>five fuses</b> (Meal Zone, Baby Zone, Bathroom, the bottom of the giant slide, Security Office), put them in the <b>generator</b> in the Ball Pit, and out the <b>BACK DOOR</b>.',
      watchOut: '🦫 <b>Chomper</b> isn\'t slowed down by the balls. You are. Stay on the paths!',
      after: 'The generator roared, the back door hissed open, and Jimmy ran out into the sunrise covered in ball pit balls. Two more nights, Mom said. Just two more.',
    },
    winTitle: 'NIGHT 8 DONE!',
    exitText: 'Out the BACK DOOR! 🏃',
    quests: [
      { id: 'fuses', type: 'collect', item: 'fuse', count: 5, text: 'Find five fuses (Meal Zone, Baby Zone, Bathroom, the bottom of the giant slide, Security Office)', done: 'Five fuses!' },
      { id: 'generator', type: 'use', target: 'generator', text: 'Put the fuses in the generator (the Ball Pit, by the back door)', done: 'VRRRRROOOOM!' },
      exitQ('ballpit', 'Out the BACK DOOR (the Ball Pit)'),
      { id: 'slide', type: 'slide', optional: true, text: 'Go down the GIANT SLIDE (Slides)', done: 'WHEEEEEE!' },
      { id: 'save', type: 'save', optional: true, text: 'Touch a save box 😁', done: 'Saved!' },
    ],
    enemies: everyone(),
    tips: TIPS,
  },

  // ═══ Night 9 — The Longest Night ════════════════════════════════════
  {
    id: 'longest', name: 'The Longest Night',
    mood: { ...MOOD, fog: 0.038 }, spawn, firstLine: LINES[8],
    clock: { seconds: 1500 },
    goText: '▶ Survive the night',
    build(d) { exitAt(d, 'play'); },
    raids: { first: 80, every: 160 },
    speedK: 1.1,
    card: {
      story: 'They\'re faster tonight. All of them. Officer Grumble keeps talking on his radio to somebody he calls "boss", and the music box hasn\'t stopped once. Leo says he\'s not scared. He is.',
      goal: '⌚ <b>Survive until 6 AM</b> (25 minutes) and keep the kids safe. Then RUN for the <b>PLAY GATE</b> on the far side of the Play Area.',
      watchOut: '⚡ Everyone is out, and everyone is faster.',
      after: 'At the play gate Jimmy turned round and counted the windows of the Beds. Every kid was still in there. Tomorrow, he decided, they ALL come out with him.',
    },
    winTitle: 'YOU MADE IT TO 6 AM!',
    exitText: 'Out the PLAY GATE! 🏃',
    quests: [
      { id: 'survive', type: 'survive', text: 'Survive until 6 AM — and keep them away from the Beds' },
      exitQ('play', 'RUN! Out the PLAY GATE (the far side of the Play Area)'),
      { id: 'save', type: 'save', optional: true, text: 'Touch a save box 😁', done: 'Saved!' },
    ],
    enemies: everyone(),
    tips: TIPS,
    start(m) { m.speedK = 1.1; },
  },

  // ═══ Night 10 — Everybody Out ═══════════════════════════════════════
  {
    id: 'out', name: 'Everybody Out',
    mood: MOOD, spawn, firstLine: LINES[9],
    finale: true,
    build(d) {
      exitAt(d, 'front', 4.2);
      d.target('card', HOMES.grumble[0] + 1.6, HOMES.grumble[1] - 2.2, 'south', 'Take Officer Grumble\'s key card', (g, dd) => {
        dd.mesh(G.box, glowMat(0xffd23f, 0.4), g, { p: [0, 0.93, -0.1], s: [0.12, 0.01, 0.08], still: false });
      });
    },
    card: {
      story: 'The last night. The <b>front doors</b> only open with <b>Officer Grumble\'s key card</b>, and he keeps it on his desk. Jimmy has a plan: wait for Grumble to go on his rounds, grab the card, then wake up <b>every kid</b> in the Beds and lead them all out together.',
      goal: '⌚ Take <b>Officer Grumble\'s key card</b> from his desk (Security Office) while he\'s out on his rounds. Go back and <b>wake up the kids</b> in the Beds. Then lead them ALL out the <b>FRONT DOORS</b> (the bottom of the Security Office).',
      watchOut: '👮 Grumble sits at his desk until he goes on his rounds. Everyone is out tonight — and they all know.',
      after: '',
    },
    winTitle: 'EVERYBODY GOT OUT!',
    exitText: 'Out the FRONT DOORS — everybody! 🏃',
    quests: [
      { id: 'card', type: 'use', target: 'card', text: 'Take Officer Grumble\'s key card (his desk, Security Office) — wait till he\'s on his rounds!', done: 'Got the key card!' },
      { id: 'wake', type: 'wake', text: 'Wake up the kids in the Beds', done: 'Everybody\'s up! Follow me!' },
      exitQ('front', 'Lead them ALL out the FRONT DOORS (the bottom of the Security Office)'),
      { id: 'save', type: 'save', optional: true, text: 'Touch a save box 😁', done: 'Saved!' },
    ],
    enemies: everyone({ grumble: { office: 45 } }),
    tips: TIPS,
    use(m, t) {
      if (t.id === 'card') {
        const g = m.enemies.find((e) => e.id === 'grumble');
        if (g && g.state === 'office' && g.distToPlayer() < 12) {
          sfx.repairBad();
          m.say('He\'s RIGHT THERE! I have to wait till he goes on his rounds...', 3);
          return false;
        }
        sfx.escUnlock();
        return true;
      }
      return true;
    },
  },
];
