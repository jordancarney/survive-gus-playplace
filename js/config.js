// Every tuning number and content table in the game. Nothing here reaches into the engine;
// the other modules read from this, so balancing is a one-file job.

export const DEBUG = new URLSearchParams(location.search).has('debug');

// Phones get no shadows: the flashlight's shadow map is the single most expensive thing
// on screen, and a small screen hides most of what it adds.
export const TOUCH_DEVICE = matchMedia('(pointer: coarse)').matches;
export const SHADOWS = !TOUCH_DEVICE;

// ── Jonathan ────────────────────────────────────────────────────────────

export const PLAYER = {
  eyeHeight: 1.62,
  radius: 0.34,
  walkSpeed: 4.0,
  sprintSpeed: 6.6,
  carrySpeed: 2.9,          // dragging a powered-down animatronic is hard work
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
  intensity: 70,
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

// ── The animatronics ────────────────────────────────────────────────────
//
// Each one has a single readable trait a kid can work out from watching it on camera.
// `hits` is how many zaps power it down. Speeds are metres per second; Jonathan walks at
// 4.0 and sprints at 6.6. `likes` are the rooms it prefers to wander to.

export const ANIMATRONICS = {
  cranker: {
    name: 'Cranker', species: 'Penguin', hits: 1,
    walk: 2.3, chase: 3.4, sight: 15,
    likes: ['H', 'D', 'T', 'E'],
    squeaky: true, stubborn: true,
    trait: 'His feet squeak, so you can hear him coming from far away. Slow, but once he is ' +
      'after you he does not give up.',
  },
  chomper: {
    name: 'Chomper', species: 'Beaver', hits: 1,
    walk: 3.0, chase: 4.4, sight: 13,
    likes: ['A', 'R', 'K', 'P'],
    chews: true,
    trait: 'Chews wires. Broken games and fuzzy cameras mean Chomper is close.',
  },
  gerald: {
    name: 'Gerald', species: 'Gorilla', hits: 2,
    walk: 2.2, chase: 3.7, sight: 14,
    likes: ['P', 'D', 'K', 'A'],
    pounds: true,
    trait: 'Big, slow and strong. Takes two zaps, and smashes games when nobody is looking.',
  },
  flipper: {
    name: 'Flipper', species: 'Dolphin', hits: 1,
    walk: 3.2, chase: 4.8, sight: 13, hearing: 15,
    likes: ['B', 'T', 'H'],
    trait: 'Hides in the ball pit. Can hear you running, so walk when you are near.',
  },
  gus: {
    name: 'Gus', species: 'Platypus', leader: true,
    walk: 3.6, chase: 3.9, sight: 99,
    likes: [],
    trait: 'The leader. Only comes out when the power goes out, and senses you through ' +
      'walls. Nothing stops him except the Magnum.',
  },
};

export const ANIMATRONIC_ORDER = ['gus', 'gerald', 'chomper', 'cranker', 'flipper'];
export const ROAMERS = ['cranker', 'chomper', 'gerald', 'flipper'];

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
  n(2,  5,  3,  0,  0,  0, 0,  { title: 'Chewed Wires', wake: { chomper: 1 } }),
  n(3,  6,  4,  3,  0,  0, 0,  { title: 'Heavy Footsteps', wake: { gerald: 2 } }),
  n(4,  6,  5,  4,  3,  0, 0,  { title: 'Something in the Balls', wake: { flipper: 1 } }),
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

// ── The manager's notes ─────────────────────────────────────────────────
//
// One per night, shown on the night card. This is the game's tutorial — each one teaches
// exactly the thing that's new tonight.

export const MANAGER_NOTES = {
  1: 'Welcome aboard! Your desk has the camera monitors — press E to use them. If a game ' +
     'breaks, go fix it: happy kids make happy animatronics. And if Cranker wanders off ' +
     'the stage, zap him with your taser and drag him to Parts & Service.',
  2: 'Chomper chews wires. If a camera goes fuzzy or a game suddenly breaks, Chomper is ' +
     'probably close by.',
  3: 'Gerald takes TWO zaps. Here is a baseball — throw it to freeze him from far away. ' +
     'Don\'t forget to pick it back up.',
  4: 'Flipper likes to hide in the ball pit and can hear you running. Walk when you are close.',
  5: 'The power has been flickering. If it goes out, find the fuse box that tripped and fix ' +
     'it FAST. And whatever you do... don\'t let Gus find you. Nothing you have can stop him.',
  6: 'Got you some running shoes. You can sprint for twice as long now.',
  7: 'Here is a knife. It cuts their power cables — quick, and no recharge, but you have to ' +
     'get really close.',
  8: 'Gerald has been smashing games. Keep the kids happy and everybody stays calmer.',
  9: 'Taser Mk II! It zaps from farther away and recharges twice as fast.',
  10: 'Halfway there. The power might go out twice tonight. Remember: when Gus is out, the ' +
      'others move faster, and he wakes up everyone in the junk room.',
  11: 'Big Flashlight: brighter, wider, and the battery lasts twice as long.',
  12: 'Hear a music box in the dark? That is Gus. Get to the fuse box before he gets to you.',
  13: 'They are getting faster every night. Fix games when you can — grumpy kids make ' +
      'grumpy animatronics.',
  14: 'Almost there. Keep the cameras moving. Watch the halls outside your office.',
  15: 'This is the Magnum. It is the ONLY thing that can stop Gus — one shot freezes him. ' +
      'Six shots a night, so make them count. It is LOUD, and everyone will hear it.',
  16: 'Three blackouts tonight. Know where all three fuse boxes are: the Kitchen, the Ball ' +
      'Pit and the Prize Counter.',
  17: 'Five nights to go. You can do this.',
  18: 'Full house tonight. Everyone is awake from midnight.',
  19: 'Something is wrong with Gus. Tomorrow night... be ready.',
  20: 'Gus has gone completely haywire and the fuse boxes are fried — the power is not ' +
      'coming back. The Magnum is the only thing that can hurt him. There are ammo boxes ' +
      'around the PlayPlace. End this.',
  21: 'Something climbed out of the junk pile. It is made of every broken part you ever threw ' +
      'in there. This time you are not alone — your friends are with you.',
};

// ── Input ───────────────────────────────────────────────────────────────
//
// Movement is WASD only: the arrow keys belong to the repair puzzles and the camera monitor.

export const KEYMAP = {
  forward:    { keys: ['KeyW'],                  label: 'Walk forward',  show: 'W' },
  back:       { keys: ['KeyS'],                  label: 'Walk back',     show: 'S' },
  left:       { keys: ['KeyA'],                  label: 'Step left',     show: 'A' },
  right:      { keys: ['KeyD'],                  label: 'Step right',    show: 'D' },
  sprint:     { keys: ['ShiftLeft', 'ShiftRight'], label: 'Sprint',      show: 'SHIFT' },
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
