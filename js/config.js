// Every tuning number and content table in the game. Nothing here reaches into the engine;
// the other modules read from this, so balancing is a one-file job.

export const DEBUG = new URLSearchParams(location.search).has('debug');

// Phones get no shadows: the flashlight's shadow map is the single most expensive thing
// on screen, and a small screen hides most of what it adds.
export const TOUCH_DEVICE = matchMedia('(pointer: coarse)').matches;
export const SHADOWS = !TOUCH_DEVICE;

// Graphics: 'real' (lifelike lighting, reflections, fur, film effects) or 'fast' (the
// original toy-box look, for phones and tablets). Picked on the title screen and kept
// apart from the save, so a new game doesn't reset it. `?gfx=fast` overrides, for testing.
export const GFX_KEY = 'survive_gus_gfx';
const gfxChoice = (() => {
  const q = new URLSearchParams(location.search).get('gfx');
  if (q === 'real' || q === 'fast') return q;
  try { return localStorage.getItem(GFX_KEY); } catch { return null; }
})();
export const REALISTIC = (gfxChoice || (TOUCH_DEVICE ? 'fast' : 'real')) === 'real';
// Self-lit things (eyes, neon, exit signs, light panels) are pushed past white in the
// realistic look so they bloom.
export const GLOW = REALISTIC ? 6 : 1;

// ── Jonathan ────────────────────────────────────────────────────────────

export const PLAYER = {
  eyeHeight: 1.62,
  radius: 0.34,
  walkSpeed: 4.0,
  sprintSpeed: 6.6,
  carrySpeed: 2.9,          // dragging a powered-down animatronic is hard work
  crouchSpeed: 2.0,         // crouching: only Gus can see you, but no weapons and no dragging
  crouchHeight: 1.0,
  ballPitSpeed: 0.6,        // multiplier while wading through the balls
  accel: 38,
  friction: 12,
  stamina: 5.0,             // seconds of sprinting from full
  staminaRegen: 0.55,       // seconds of sprint regained per second of rest
  mouseSensitivity: 0.0022,
  touchLookSensitivity: 0.0055,
  maxPitch: 1.45,
  reach: 2.0,               // how close you must be to press E on something
};

export const FLASHLIGHT = {
  battery: 100,
  drain: 1.35,              // % per second while on: about 75 seconds from full
  regen: 0.5,               // % per second while off
  officeRegen: 9,           // % per second in the Security Office, where the charger is
  range: 24,
  angle: 0.48,
  // The realistic look uses a truer falloff: blinding up close, dimmer far away.
  intensity: REALISTIC ? 22 : 70,
  decay: REALISTIC ? 1.5 : 1.2,
};

// ── The clock ───────────────────────────────────────────────────────────

export const CLOCK = {
  hourSeconds: 60,          // 12 AM → 6 AM is six minutes
  hours: 6,
};

// ── Kids' happiness ─────────────────────────────────────────────────────
//
// Fixing games raises it, leaving them broken lowers it, and a day of kids playing always
// wears it down a little. The animatronics love making the kids happy, so the happier the
// kids, the calmer the animatronics are at night.

export const HAPPINESS = {
  start: 50,
  fix: 3,                   // per game fixed during the night
  brokenAtDawn: -4,         // per game still broken at 6 AM
  wear: -3,                 // every day, however well the night went
};

// Mood bands, lowest first. `level` is added to every animatronic's aggression level;
// `downTime` scales how long a zapped animatronic stays powered down.
export const MOODS = [
  { min: 0,  name: 'Grumpy',      face: '😠', level: 3,  downTime: 0.75, color: '#e8484a' },
  { min: 25, name: 'Bored',       face: '😐', level: 1,  downTime: 0.9,  color: '#e8a33a' },
  { min: 50, name: 'Happy',       face: '🙂', level: 0,  downTime: 1.0,  color: '#7fd35a' },
  { min: 75, name: 'Super Happy', face: '😄', level: -2, downTime: 1.25, color: '#3fd0c9' },
];

export const moodOf = (h) => {
  let m = MOODS[0];
  for (const band of MOODS) if (h >= band.min) m = band;
  return m;
};

// ── Difficulty ──────────────────────────────────────────────────────────
//
// Picked in Settings on the title screen and kept beside the save, like the graphics, so a
// new game doesn't reset it. The designer named them Spooky, Horror and Nightmare (the ids
// are still easy, medium and hard, so saved settings carry over). Horror is the game as
// designed. `level` is added to every
// animatronic's aggression level (like the kids' mood), `speed` scales how fast they move,
// `gear` scales how fast the flashlight drains and how long the taser takes to recharge,
// `unlimited` means the flashlight, the taser and sprinting never run out, `blackoutsFrom` is
// the first night the power can go out (boss nights aside), and `secondChance` lets you get
// away the first time you're caught each night. Every night beaten on Nightmare gets a star
// on the night select. `scare` is how much scarier it all looks and sounds: Horror's nights
// a little (darker, stuttering lights, whispers, reddish eyes), Nightmare everything, the
// title screen too (`nightmare`; see Game.applyNightmare).

export const DIFFICULTY_KEY = 'survive_gus_difficulty';

export const DIFFICULTIES = {
  easy: {
    name: 'Spooky', face: '👻', scare: 0, level: -3, speed: 0.85, gear: 1, unlimited: true, blackoutsFrom: 10,
    secondChance: true,
    desc: 'They\'re slower and leave the stage less. Unlimited flashlight, taser zaps and running, ' +
      'and the power doesn\'t go out until Night 10. The first time you get caught each night, ' +
      'you get away!',
  },
  medium: {
    name: 'Horror', face: '😱', scare: 1, level: 0, speed: 1, gear: 1, unlimited: false, blackoutsFrom: 0,
    secondChance: false,
    desc: 'The game the way it was made. Get caught and you start the night over.',
  },
  hard: {
    name: 'Nightmare', face: '💀', scare: 2, level: 3, speed: 1.12, gear: 1.35, unlimited: false, blackoutsFrom: 0,
    secondChance: false, nightmare: true,
    desc: 'EVERYTHING is way scarier, even this screen. They\'re faster and come out a lot more, ' +
      'your flashlight runs out sooner and your taser takes longer to recharge. No second ' +
      'chances — but every night you beat gets a ⭐.',
  },
};

// How long nothing can catch you after a second chance, so you can run.
export const SECOND_CHANCE_GRACE = 3;

// How many times the power goes out on a night, at a difficulty.
export const blackoutCount = (def, diff) => (def.night < diff.blackoutsFrom ? 0 : def.blackouts);

// ── The animatronics ────────────────────────────────────────────────────
//
// Each one has a single readable trait a kid can work out from watching it on camera.
// `hits` is how many zaps power it down. Speeds are metres per second; Jonathan walks at
// 4.0 and sprints at 6.6. `likes` are the rooms it prefers to wander to.

export const ANIMATRONICS = {
  cranker: {
    name: 'Cranker', species: 'Penguin', hits: 1,
    walk: 2.3, chase: 3.4, sight: 15,
    likes: ['H', 'D', 'T', 'E', 'G'],
    squeaky: true, stubborn: true,
    trait: 'His feet squeak, so you can hear him coming from far away. Slow, but once he is ' +
      'after you he does not give up.',
  },
  chomper: {
    name: 'Chomper', species: 'Beaver', hits: 1,
    walk: 3.0, chase: 4.4, sight: 13,
    likes: ['A', 'R', 'K', 'P', 'C'],
    chews: true,
    trait: 'Chews wires. Broken games and fuzzy cameras mean Chomper is close.',
  },
  gerald: {
    name: 'Gerald', species: 'Gorilla', hits: 2,
    walk: 2.2, chase: 3.7, sight: 14,
    likes: ['P', 'D', 'K', 'A', 'L'],
    pounds: true,
    trait: 'Big, slow and strong. Takes two zaps, and smashes games when nobody is looking.',
  },
  flipper: {
    name: 'Flipper', species: 'Dolphin', hits: 1,
    walk: 3.2, chase: 4.8, sight: 13, hearing: 15,
    likes: ['B', 'T', 'H', 'M'],
    trait: 'Hides in the ball pit. Can hear you running, so walk when you are near.',
  },
  gus: {
    name: 'Gus', species: 'Platypus', leader: true,
    walk: 3.6, chase: 3.9, sight: 99,
    likes: [],
    trait: 'The leader. Only comes out when the power goes out, and senses you through ' +
      'walls. Nothing stops him except the Magnum.',
  },

  // ── The new wing's two (Night 11 on). Each lives in one room and never leaves it. ──
  moony: {
    name: 'Moony', species: 'Possessed Gus', room: 'L', unstoppable: true, steps: 'gus',
    walk: 3.0, chase: 4.1, sight: 14, blink: [9, 16],
    likes: ['L'],
    trait: 'Gus, possessed. Lives in Laser Tag and never leaves it. He vanishes and pops up ' +
      'somewhere else, crouching doesn\'t hide you from him, and only the Magnum stops him.',
  },
  sunny: {
    name: 'Sunny', species: 'Made of fog', room: 'M', hits: 1, silent: true,
    walk: 2.0, chase: 2.9, sight: 9,
    likes: ['M'],
    trait: 'Made of fog. Lives in the Play Maze, drifts straight through its walls, and you ' +
      'can only see her when your flashlight is on her.',
  },
};

export const ANIMATRONIC_ORDER = ['gus', 'gerald', 'chomper', 'cranker', 'flipper'];
export const WING_BOTS = ['moony', 'sunny'];
export const ROAMERS = ['cranker', 'chomper', 'gerald', 'flipper'];

// Moony's and Sunny's aggression: nothing before the new wing opens or on Night 21 (when
// everyone's inside the Junk Monster), climbing night by night like everyone else's —
// right through the Gus fight on Night 20.
export const wingLevel = (id, night) =>
  (night < 11 || night >= 21 ? 0 : (id === 'moony' ? 5 : 4) + (night - 11));

export const AI = {
  checkEvery: 5,            // seconds between "do I leave the stage?" rolls
  catchRadius: 1.05,
  downTime: 28,             // seconds a zapped animatronic stays powered down
  staggerTime: 3.0,         // a zap that doesn't finish the job still freezes it
  loseSight: 5,             // seconds out of sight before a chase gives up
  hearSprint: 7,            // anyone hears you sprinting this close
  gusDelay: 6,              // seconds after the lights go out before Gus steps off the stage
  gusFreeze: 8,             // a Magnum hit freezes Gus this long
  freeJunked: 10,           // seconds into a blackout before Gus wakes the junk room
  bossedSpeed: 1.25,        // everyone moves faster while Gus is out
};

// ── Weapons and gear ────────────────────────────────────────────────────
//
// Unlocked by reaching a night, never bought — every night survived is the reward.

export const WEAPONS = [
  // Three zaps, then it has to recharge. It also tops itself up, one zap at a time, while
  // you're not using it.
  { id: 'taser', name: 'Taser', unlock: 1, slot: 1, range: 3.6, charges: 3, gap: 0.35,
    recharge: 4.0, topUp: 2.5, hits: 1,
    desc: 'Three zaps up close, then it needs a few seconds to recharge.' },
  { id: 'baseball', name: 'Baseball', unlock: 3, slot: 2, speed: 19, stun: 3.5, count: 3,
    desc: 'Throw it to freeze an animatronic from far away. Go pick it back up.' },
  { id: 'knife', name: 'Knife', unlock: 7, slot: 3, range: 2.3, cooldown: 0.55, hits: 1,
    desc: 'Cuts an animatronic\'s power cable. Fast, no recharge, but you have to get close.' },
  { id: 'magnum', name: 'Magnum', unlock: 15, slot: 4, range: 45, cooldown: 0.75, ammo: 6,
    desc: 'The ultimate weapon. One shot powers down anything, and it is the only thing that ' +
      'stops Gus. Six shots a night, and it is LOUD.' },
];

export const GEAR = [
  { id: 'shoes', name: 'Running Shoes', unlock: 6, desc: 'Sprint for twice as long.' },
  { id: 'taser2', name: 'Taser Mk II', unlock: 9,
    desc: 'Zaps from farther away and recharges twice as fast.' },
  { id: 'bigLight', name: 'Big Flashlight', unlock: 11,
    desc: 'A brighter, wider beam, and the battery lasts twice as long.' },
];

export const weaponById = (id) => WEAPONS.find((w) => w.id === id);
export const weaponsFor = (night) => WEAPONS.filter((w) => night >= w.unlock).map((w) => w.id);
export const hasGear = (night, id) => night >= GEAR.find((g) => g.id === id).unlock;
export const unlocksAt = (night) => [
  ...WEAPONS.filter((w) => w.unlock === night),
  ...GEAR.filter((g) => g.unlock === night),
];

// ── Repairs ─────────────────────────────────────────────────────────────

export const REPAIR = {
  // Key prompts. Arrows rather than letters so they're the same on every keyboard layout,
  // and a touch screen can show them as four big buttons.
  keys: ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'],
  arrows: ['←', '↑', '→', '↓'],
  sequenceBase: 4,          // arrows in a "Rewire it!" puzzle on night 1
  simonBase: 3,             // lights in a "Copy the lights!" pattern on night 1
  timingHits: 3,            // green-zone hits needed in "Hit the green!"
  fuseExtra: 2,             // fuse boxes take a longer sequence than games
};

// 1 on night 1, rising to 5 by night 17.
export const repairLevel = (night) => Math.min(5, 1 + Math.floor((night - 1) / 4));

// ── The twenty-one nights ───────────────────────────────────────────────
//
// `ai` is each animatronic's aggression level, 0–20 (0 = stays on the stage all night).
// `wake` is the hour it starts moving (0 = 12 AM). `blackouts` is how many times the power
// goes out — the only time Gus leaves the stage. `boss` nights replace the clock with a
// boss fight.

const n = (night, cranker, chomper, gerald, flipper, blackouts, gus, extra = {}) => ({
  night,
  ai: { cranker, chomper, gerald, flipper, gus },
  blackouts,
  ...extra,
});

export const NIGHTS = [
  n(1,  4,  0,  0,  0,  0, 0,  { title: 'First Shift', wake: { cranker: 1 } }),
  n(2,  5,  3,  0,  0,  1, 2,  { title: 'Chewed Wires', wake: { chomper: 1 } }),
  n(3,  6,  4,  3,  0,  1, 3,  { title: 'Heavy Footsteps', wake: { gerald: 2 } }),
  n(4,  6,  5,  4,  3,  1, 3,  { title: 'Something in the Balls', wake: { flipper: 1 } }),
  n(5,  7,  6,  5,  4,  1, 4,  { title: 'Lights Out' }),
  n(6,  8,  7,  6,  5,  1, 5,  { title: 'Running Late' }),
  n(7,  9,  8,  7,  6,  1, 6,  { title: 'Sharp Thinking' }),
  n(8,  10, 9,  8,  7,  1, 7,  { title: 'Smash Hour' }),
  n(9,  10, 10, 9,  8,  1, 8,  { title: 'Supercharged' }),
  n(10, 11, 11, 10, 9,  2, 9,  { title: 'Halfway There' }),
  n(11, 12, 11, 11, 10, 2, 10, { title: 'Bright Idea' }),
  n(12, 12, 12, 12, 11, 2, 11, { title: 'The Music Box' }),
  n(13, 13, 13, 12, 12, 2, 12, { title: 'Unlucky' }),
  n(14, 14, 13, 13, 13, 2, 13, { title: 'Overtime' }),
  n(15, 14, 14, 14, 14, 2, 14, { title: 'The Magnum' }),
  n(16, 15, 15, 15, 15, 3, 15, { title: 'Flicker' }),
  n(17, 16, 16, 15, 16, 3, 16, { title: 'No Sleep' }),
  n(18, 17, 17, 16, 17, 3, 17, { title: 'Full House' }),
  n(19, 18, 18, 18, 18, 3, 18, { title: 'The Last Normal Night' }),
  n(20, 12, 12, 12, 12, 0, 20, { title: 'Gus', boss: 'gus' }),
  n(21, 0,  0,  0,  0,  0, 0,  { title: 'The Junk Monster', boss: 'junk', secret: true }),
];

// Timmy, the kid left behind on Night 2. He starts crying `cryAt` seconds into the night.
export const TIMMY = {
  name: 'Timmy',
  pit: [9.4, 30.8],          // where he fell asleep in the ball pit (plan metres)
  cryAt: 45,
  number: '145-247-3719',    // his gramma's phone number, as the designer chose it
  rescue: 10,                // kids' happiness when gramma picks him up
};

// The house level after Night 10: the four who followed Jonathan home.
export const HOME_DEF = {
  night: 10, title: 'They Followed Me Home', home: true, blackouts: 0,
  ai: { cranker: 8, chomper: 8, gerald: 8, flipper: 8, gus: 0 },
  wake: { cranker: 0, chomper: 0, gerald: 0, flipper: 0 },
};

export const LAST_STORY_NIGHT = 20;
export const nightDef = (night) => NIGHTS[Math.max(0, Math.min(NIGHTS.length - 1, night - 1))];

// Hour each animatronic wakes when the night doesn't say. From night 6 everyone is up
// at midnight.
export const wakeHour = (def, id) => {
  if (def.wake && def.wake[id] !== undefined) return def.wake[id];
  if (def.night >= 6) return 0;
  return { cranker: 0, chomper: 1, gerald: 1, flipper: 1, gus: 0 }[id];
};

// Games already broken when the night starts (the kids had a busy day), and how often
// another one breaks on its own.
export const startBroken = (night) => Math.min(6, 1 + Math.ceil(night / 4));
export const breakEvery = (night) => Math.max(24, 66 - night * 2.2);

// ── Bosses ──────────────────────────────────────────────────────────────

export const BOSS = {
  gus: {
    health: 15,             // Magnum hits
    freeze: 2.0,            // each hit freezes him this long (it doesn't stack)
    speed: [3.9, 4.4, 5.0], // per phase
    ammoCrates: 4,
    crateAmmo: 6,
    crateRespawn: 30,
  },
  junk: {
    health: 90,
    speed: [3.2, 3.6, 4.1],
    throwEvery: [6.5, 5.0, 3.8],
    damage: { taser: 3, knife: 2, baseball: 1, magnum: 4, friend: 1.2 },
    friendStagger: 0.8,
    ammoCrates: 3,
    crateAmmo: 6,
    crateRespawn: 30,
  },
};

// ── The night notes ─────────────────────────────────────────────────────
//
// One per night, shown on the night card. This is the game's tutorial — each one teaches
// exactly the thing that's new tonight. Nobody knows the animatronics move at night, so
// Night 1's is from the manager and says nothing about them. Jonathan finds out on his own
// (see the old guard's note in index.html); every night after that is a page from the
// old night guard's notebook. He knew.

export const NIGHT_NOTES = {
  1: 'Welcome aboard! Your desk has the camera monitors — press E to use them. If a game ' +
     'breaks, go fix it: happy kids make happy animatronics. Don\'t worry, nothing ever ' +
     'happens here at night. Have a quiet shift!',
  2: 'Chomper chews wires. If a camera goes fuzzy or a game suddenly breaks, Chomper is ' +
     'close by. And if you ever find a kid left behind in here, keep them safe — they go ' +
     'after kids too.',
  3: 'Gerald takes TWO zaps. I left my old baseball in the desk — throw it to freeze him ' +
     'from far away. Don\'t forget to pick it back up.',
  4: 'Flipper hides in the ball pit and can hear you running. Walk when you are close.',
  5: 'When the lights go out, Gus can sense you through walls. Hiding won\'t work. Run ' +
     'straight for the fuse box — and don\'t stop.',
  6: 'I left you my running shoes. You can sprint for twice as long in them.',
  7: 'There\'s a knife in the desk drawer. It cuts their power cables — quick, and no ' +
     'recharge, but you have to get really close.',
  8: 'Gerald smashes games when nobody is looking. Keep the kids happy and everybody stays ' +
     'calmer.',
  9: 'My Taser Mk II is in the locker. It zaps from farther away and recharges twice as fast.',
  10: 'Halfway. The power can go out twice in one night. Remember: when Gus is out, the ' +
      'others move faster, and he wakes up everyone in the junk room.',
  11: 'My Big Flashlight is under the desk: brighter, wider, and the battery lasts twice as ' +
      'long.',
  12: 'Hear a music box in the dark? That is Gus. Get to the fuse box before he gets to you.',
  13: 'They get faster every night. Fix games when you can — grumpy kids make grumpy ' +
      'animatronics.',
  14: 'Keep the cameras moving. Watch the halls outside your office.',
  15: 'My Magnum is in the office safe. It is the ONLY thing that can stop Gus — one shot ' +
      'freezes him. Six shots a night, so make them count. It is LOUD, and everyone will ' +
      'hear it.',
  16: 'Some nights the power goes out three times. Know where all three fuse boxes are: the ' +
      'Kitchen, the Ball Pit and the Prize Counter.',
  17: 'This is as far as I got before I quit. You can do better.',
  18: 'Some nights they are ALL awake from midnight.',
  19: 'Something is wrong with Gus. He keeps glitching. If he ever breaks for real... be ready.',
  20: 'If Gus ever goes haywire, the fuse boxes fry and the power is not coming back. The ' +
      'Magnum is the only thing that can hurt him. I hid ammo boxes all around the ' +
      'PlayPlace. End this.',
  21: 'You beat Gus. But the junk pile pulls things in. If something climbs out of it, the ' +
      'old animatronics under the dust sheets will help you. They were my friends.',
};

// ── The gallery ─────────────────────────────────────────────────────────
//
// Pictures taken while the game was being made, in gallery/, shown from the 📷 tab on the
// title screen.

export const GALLERY = [
  { file: 'old-john.jpg', caption: 'Old John, the old night guard, gives Jonathan his badge' },
  { file: 'moony.jpg', caption: 'Moony, the possessed Gus, at his base in Laser Tag' },
  { file: 'sunny.jpg', caption: 'Sunny is made of fog — only your flashlight shows her' },
  { file: 'laser-tag.jpg', caption: 'The Laser Tag maze' },
  { file: 'play-maze.jpg', caption: 'The giant, foggy Play Maze' },
  { file: 'mega-arcade.jpg', caption: 'The Mega Arcade' },
  { file: 'go-karts.jpg', caption: 'The Go-Kart Track' },
  { file: 'coming-soon.jpg', caption: 'Before Day 11: the new wing, boarded up' },
  { file: 'guard-note.jpg', caption: 'The old night guard knew all along' },
  { file: 'crouch.jpg', caption: 'Crouching — Cranker can\'t see you' },
  { file: 'timmy.jpg', caption: 'Timmy and his bowl cut' },
  { file: 'hard-star.jpg', caption: 'Beat a night on Nightmare, get a star' },
  { file: 'night-one.jpg', caption: 'Night 1: "nothing ever happens here"' },
];

// ── Input ───────────────────────────────────────────────────────────────
//
// Movement is WASD only: the arrow keys belong to the repair puzzles and the camera monitor.

export const KEYMAP = {
  forward:    { keys: ['KeyW'],                  label: 'Walk forward',  show: 'W' },
  back:       { keys: ['KeyS'],                  label: 'Walk back',     show: 'S' },
  left:       { keys: ['KeyA'],                  label: 'Step left',     show: 'A' },
  right:      { keys: ['KeyD'],                  label: 'Step right',    show: 'D' },
  sprint:     { keys: ['ShiftLeft', 'ShiftRight'], label: 'Sprint',      show: 'SHIFT' },
  // Not Ctrl: Ctrl+W (crouch while walking) would close the tab.
  crouch:     { keys: ['KeyC'],                  label: 'Crouch / stand (only Gus sees you)', show: 'C' },
  interact:   { keys: ['KeyE'],                  label: 'Use / fix / grab', show: 'E' },
  flashlight: { keys: ['KeyF'],                  label: 'Flashlight',    show: 'F' },
  swap:       { keys: ['KeyQ'],                  label: 'Next weapon',   show: 'Q' },
  pause:      { keys: ['Escape', 'KeyP'],        label: 'Pause',         show: 'ESC' },
};

export const MOUSE_HELP = [
  { label: 'Look around', show: 'MOUSE' },
  { label: 'Use weapon', show: 'CLICK' },
  { label: 'Pick weapon', show: '1-4' },
  { label: 'Switch camera', show: '← →' },
  { label: 'Repair puzzles', show: '← ↑ → ↓  SPACE' },
];
