// Lost in the Pizzaplex: Max's chapters after the first, keyed by chapter number. Every one
// is a night in the Sleepover Suite (ch2-suite.js) played like FNAF 4 (bedroom.js) — the
// doors, the closet and the bed — each with something new, and each a little harder:
//
//    7  Footsteps            Gerald and Flipper in the halls
//   12  Lights Out           the night light breaks; DJ Rocco comes to the door
//   17  The Music Box        a lullaby box to keep wound, or Gus wakes up
//   22  Sparky               the robot dog: much faster than anything else
//   29  Plushie Party        four plushies on the bed, and they're quick
//   35  Everything At Once   doors, closet, bed and music box, with Rocco and Sparky
//   41  The Old Ones         the old originals at the doors: they knock instead of breathing
//   47  The Last Half Hour   Max's hardest night, all the way to 6 AM
//
// Max is eleven, the oldest kid, with long red hair. She's the one who keeps the base safe.
import { Bedroom } from '../bedroom.js';
import { suiteRoom, SUITE } from './ch2-suite.js';
import { buildRocco, buildSparky } from '../cast.js';

const { E, W } = SUITE;

// Who can come down a hall. (`tune`: that one's own numbers, on top of the room's.)
const BOT = {
  chomper: { bot: 'chomper', name: 'Chomper' },
  cranker: { bot: 'cranker', name: 'Cranker' },
  gerald: { bot: 'gerald', name: 'Gerald' },
  flipper: { bot: 'flipper', name: 'Flipper' },
  rocco: { id: 'rocco', name: 'DJ Rocco', build: buildRocco, tune: { step: 6.2, closer: 0.55 } },
  sparky: { id: 'sparky', name: 'Sparky', build: buildSparky, bark: true,
    tune: { step: 4.6, come: 0.55, closer: 0.6, nearMax: 9.5, flashToScare: 0.45, holdToSend: 2.0 } },
  // the old originals: they don't breathe, they knock — and they push harder on the door
  oldGerald: { bot: 'gerald', old: true, id: 'oldgerald', name: 'Old Gerald', cue: 'knock', tune: { holdToSend: 2.8 } },
  oldFlipper: { bot: 'flipper', old: true, id: 'oldflipper', name: 'Old Flipper', cue: 'knock', tune: { holdToSend: 2.8 } },
};
const hall = (side, who) => ({ far: SUITE.far[side], yaw: side === 'left' ? E : W, ...BOT[who] });

// 1:40 AM, from minutes after midnight.
const clockText = (mins) => `${Math.floor(mins / 60) || 12}:${String(mins % 60).padStart(2, '0')} AM`;

const MOOD = { amb: 0.085, hemi: 0.085, fog: 0.04, bg: 0x03020a };
const DARK = { amb: 0.05, hemi: 0.05, fog: 0.045, bg: 0x020108 };

// The bonus quests a chapter can have (bedroom.js checks them).
const BONUS = {
  door: { id: 'door', type: 'door', optional: true, text: 'Hold a door shut until it goes away', done: 'It went away!' },
  flash: { id: 'flash', type: 'flash', optional: true, text: 'Shine the light on one far down a hall', done: 'It backed off!' },
  bed: { id: 'bed', type: 'bed', optional: true, text: 'Shine the light on the plushies on the bed', done: 'Shoo! Off the bed!' },
  closet: { id: 'closet', type: 'closet', optional: true, text: 'Push the closet all the way shut after it\'s halfway open', done: 'Back in the closet!' },
  wind: { id: 'wind', type: 'wind', optional: true, text: 'Wind the music box all the way up when it\'s nearly run down', done: 'All wound up!' },
};

const TIPS = {
  chomper: 'BREATHING at a door means it\'s right outside: don\'t shine the light, hold the door shut until it runs away.',
  cranker: 'Check both doors a lot! Far down the hall? Shine the light. Breathing? Hold the door shut.',
  gerald: 'Gerald\'s big feet thump when he moves. Go and listen at that door!',
  flipper: 'Flipper slaps along the hall when he moves. Listen at the door — breathing means hold it shut.',
  rocco: 'DJ Rocco moves a bit faster than the others. Check his door more often.',
  sparky: 'Sparky barks when he shows up at the end of the hall — go straight to that door and shine the light!',
  oldgerald: 'The old ones don\'t breathe: they KNOCK. Knocking at a door means hold it shut — and hold it a little longer.',
  oldflipper: 'The old ones don\'t breathe: they KNOCK. Knocking at a door means hold it shut — and hold it a little longer.',
  babygus: 'Keep holding the closet shut, and turn round (S) to shine the light on the bed when the plushies climb on.',
  gus: 'Go back to the middle and hold SPACE to wind the music box before it runs down. If Gus\'s music starts, wind it FAST!',
};

const GOAL = 'Hold out until <b>{end}</b>. <b>A</b> / <b>D</b> the doors, <b>W</b> the closet, <b>S</b> the bed. Hold <b>SPACE</b> to hold a door shut{box}, hold <b>F</b> for the flashlight.';

function chapter(c) {
  const end = clockText(c.from + c.minutes);
  const { layout, build } = suiteRoom(c.opts || {});
  const box = c.room.musicBox ? ' (and, in the middle, to wind the music box)' : '';
  return {
    id: c.id,
    hero: 'max',
    name: c.name,
    layout,
    build,
    controller: Bedroom,
    mood: c.mood || MOOD,
    spawn: { at: SUITE.spots.middle, yaw: 0 },
    clock: { seconds: c.seconds, from: c.from, minutes: c.minutes },
    firstLine: c.firstLine,
    goText: `▶ Hold out until ${end}`,
    winTitle: `MAX MADE IT TO ${end.replace(':00', '')}!`,
    card: { ...c.card, goal: `🌙 ${GOAL.replace('{end}', end).replace('{box}', box)}` },
    quests: [{ id: 'survive', type: 'survive', text: `Hold out until ${end}` }, ...c.bonus.map((b) => BONUS[b])],
    enemies: [],
    room: {
      spots: SUITE.spots,
      toast: `🌙 Hold out until ${end}. ${c.room.musicBox ? 'Doors, closet, bed — and keep the music box wound!' : 'Check the doors, the closet AND the bed!'}`,
      ...c.room,
    },
    tips: TIPS,
    questDone(m, q) { if (q.id === 'survive') m.win(); },
  };
}

const closet = (start, rate, push = 32) => ({ ...SUITE.closet, start, rate, push });
const bed = (first, every, grace = 6, four = false) => ({ spots: four ? SUITE.bed4 : SUITE.bed3, first, every, grace, max: four ? 4 : 3 });
const musicBox = (drain, start = 10) => ({ at: [15, 12.5], drain, wind: 40, grace: 3.2, start });

export default {
  7: chapter({
    id: 'footsteps', name: 'Footsteps', from: 60, minutes: 40, seconds: 255,
    firstLine: 'Those footsteps are heavier than before...',
    room: {
      left: hall('left', 'gerald'), right: hall('right', 'flipper'),
      calm: 14, step: 6.8, come: 0.47, closer: 0.5, flashToScare: 0.55, holdToSend: 2.4, nearMax: 11.5,
      closet: closet(30, 1.3), bed: bed(25, 14.5),
    },
    bonus: ['door', 'flash'],
    card: {
      story: 'Jackson said on the walkie to stay put, so <b>Max</b> is still in the <b>Sleepover Suite</b>. At 1 AM the footsteps came back — heavier ones. Big thumping feet down the left hall, and something wet slapping along the right.',
      watchOut: '👀 <b>Gerald</b> is in the left hall and <b>Flipper</b> in the right. Same as before: far away, shine the light; <b>breathing</b> right outside, hold the door shut. And the closet. And the bed.',
      after: '<i>"Jackson? It\'s Max. Gerald and Flipper were right outside my doors!"</i><br><i>"I know. I saw them on the cameras. And now they\'re coming up MY halls."</i><br><br>Then the office phone rang. Nobody had called that phone all week. <b>Jackson</b> picked it up.',
    },
  }),

  12: chapter({
    id: 'lightsout', name: 'Lights Out', from: 100, minutes: 40, seconds: 255,
    firstLine: 'The night light just... went POP. I can\'t see anything!',
    mood: DARK,
    opts: { dark: true },
    room: {
      left: hall('left', 'chomper'), right: hall('right', 'rocco'),
      calm: 13, step: 6.8, come: 0.48, closer: 0.5, flashToScare: 0.55, holdToSend: 2.4, nearMax: 11.5,
      closet: closet(32, 1.3), bed: bed(24, 14),
    },
    bonus: ['bed', 'door'],
    card: {
      story: 'At 1:40 the night light in the Sleepover Suite went <b>pop</b>. Now there\'s only the moon through the window — and <b>Max\'s</b> flashlight. Down the right hall, music is thumping. Somebody\'s DJing.',
      watchOut: '🔦 It\'s <b>dark</b> now: you\'ll need the flashlight to see the bed and the ends of the halls. <b>Chomper</b> is in the left hall, and <b>DJ Rocco</b> — a little faster than the others — is in the right.',
      after: 'Max\'s walkie hissed. <i>"Max, you okay?"</i> It was Jackson. <i>"I\'m okay. It\'s really dark in here."</i> Then, behind his voice, a SPLASH. <i>"...Flipper\'s in the ball pit,"</i> said <b>Jackson</b>, very quietly. <i>"And I think he\'s waiting for me to stop watching."</i>',
    },
  }),

  17: chapter({
    id: 'musicbox', name: 'The Music Box', from: 140, minutes: 40, seconds: 270,
    firstLine: 'Okay, music box. Don\'t you DARE stop.',
    opts: { musicBox: true },
    room: {
      left: hall('left', 'cranker'), right: hall('right', 'gerald'),
      calm: 14, step: 7.2, come: 0.45, closer: 0.5, flashToScare: 0.55, holdToSend: 2.4, nearMax: 12,
      closet: closet(40, 1.15), bed: bed(30, 16),
      musicBox: musicBox(3.0),
    },
    bonus: ['wind', 'closet'],
    card: {
      story: 'Jonathan found Max at 2:20, and the <b>Sleepover Suite</b> is the <b>base</b> now. Before he went off again he showed her a little wind-up <b>music box</b> on a table: the Sleepover Suite\'s lullaby box. <i>"While it plays, Gus sleeps,"</i> said the label. <i>"Do NOT let it run down."</i>',
      watchOut: '🎵 From the <b>middle</b> of the room, hold <b>SPACE</b> to wind the music box. If it runs down, Gus\'s music starts playing — wind it up <b>fast</b> or <b>Gus</b> comes. <b>Cranker</b> and <b>Gerald</b> are in the halls.',
      after: '<i>"Jackson, the music box works! Gus stayed asleep!"</i><br><i>"Good,"</i> said Jackson, <i>"because something\'s wrong with my cameras. They keep going fuzzy, one at a time. Like something\'s... chewing the wires."</i><br><br>Up in the office, <b>Jackson</b> heard crunching in the walls.',
    },
  }),

  22: chapter({
    id: 'sparky', name: 'Sparky', from: 180, minutes: 30, seconds: 255,
    firstLine: 'Was that... a BARK?',
    opts: { musicBox: true },
    room: {
      left: hall('left', 'flipper'), right: hall('right', 'sparky'),
      calm: 12, step: 6.8, come: 0.47, closer: 0.5, flashToScare: 0.55, holdToSend: 2.4, nearMax: 11.5,
      closet: closet(35, 1.25), bed: bed(26, 15),
      musicBox: musicBox(2.6),
    },
    bonus: ['flash', 'door'],
    card: {
      story: 'Jonathan saw him at the kart track: <b>Sparky</b>, the Fun Zone\'s robot dog, the fastest thing in the Pizzaplex. Now Sparky has sniffed out the base. <b>Max</b> can hear him barking at the end of the right hall.',
      watchOut: '🐕 <b>Sparky</b> barks when he turns up at the end of the hall, and he gets to the door MUCH faster than anyone else — go straight there! <b>Flipper</b> is in the left hall. Keep the music box wound.',
      after: 'Sparky gave up with a sad electronic whine. <i>"Jackson, did you see that dog?!"</i><br><i>"I saw him,"</i> said Jackson. <i>"He went straight past two of my cameras like they weren\'t there. He doesn\'t stop in rooms like the others do."</i><br><br><b>Jackson</b> put both hands on the door buttons.',
    },
  }),

  29: chapter({
    id: 'plushieparty', name: 'Plushie Party', from: 210, minutes: 30, seconds: 255,
    firstLine: 'Why are there so many plushies? Where did they all COME from?',
    opts: { musicBox: true, plushPile: true },
    room: {
      left: hall('left', 'rocco'), right: hall('right', 'chomper'),
      calm: 13, step: 7, come: 0.45, closer: 0.5, flashToScare: 0.55, holdToSend: 2.4, nearMax: 12,
      closet: closet(40, 1.2), bed: bed(16, 9.5, 5, true),
      musicBox: musicBox(2.3),
    },
    bonus: ['bed', 'wind'],
    card: {
      story: 'Big news on the walkie: a new kid called <b>Timmy</b> turned up in the ball pit at 3:30 — and Thomas says he\'s from <b>the future</b>! But <b>Max</b> has a problem of her own. Somebody tipped every Gus plushie in the Gus Shop out across the Sleepover Suite floor... and they\'re climbing.',
      watchOut: '🧸 This time it takes <b>four</b> plushies on the bed to get you, but they climb on <b>fast</b>. Turn round (<b>S</b>) and shine the light on the bed a lot! <b>DJ Rocco</b> and <b>Chomper</b> are in the halls.',
      after: 'At 4 AM the plushies flopped over and lay still, like they\'d never moved at all. <i>"Jackson? The plushies stopped."</i><br><i>"Max..."</i> Jackson\'s voice was strange. <i>"Gus isn\'t on his stage. He\'s not on CAM 01. He\'s not anywhere."</i><br><br><b>Jackson</b> brought the cameras down — and the stage was still empty.',
    },
  }),

  35: chapter({
    id: 'everything', name: 'Everything At Once', from: 240, minutes: 30, seconds: 270,
    firstLine: 'Doors, closet, bed, music box. Doors, closet, bed, music box...',
    opts: { musicBox: true },
    room: {
      left: hall('left', 'rocco'), right: hall('right', 'sparky'),
      calm: 11, step: 6.6, come: 0.5, closer: 0.52, flashToScare: 0.55, holdToSend: 2.4, nearMax: 11,
      closet: closet(30, 1.35), bed: bed(24, 13),
      musicBox: musicBox(2.9),
    },
    bonus: ['door', 'closet'],
    card: {
      story: 'It\'s 4 AM, and everyone else is busy: Jack\'s down in the tunnels, Thomas is in the ball pit, Jonathan\'s backstage and Timmy\'s in the play tubes. That leaves <b>Max</b> to keep the base safe — and tonight it\'s everything at once.',
      watchOut: '⚡ <b>DJ Rocco</b> on the left, <b>Sparky</b> (fast!) on the right, the <b>closet</b>, the <b>bed</b> and the <b>music box</b>, all at once. Go round them in the same order every time.',
      after: '<i>"Jackson, I did it! All of it!"</i><br><i>"That was amazing, Max. Now I need you on the walkie. Timmy\'s out in the Pizzaplex all by himself, and I\'m going to guide him round with the cameras. Stay on the line."</i><br><br><b>Jackson</b> found a small kid in a white shirt on CAM 03.',
    },
  }),

  41: chapter({
    id: 'oldones', name: 'The Old Ones', from: 270, minutes: 30, seconds: 270,
    firstLine: 'Did somebody just... knock?',
    opts: { musicBox: true, sheets: true },
    room: {
      left: hall('left', 'oldGerald'), right: hall('right', 'oldFlipper'),
      calm: 11, step: 6.4, come: 0.5, closer: 0.52, flashToScare: 0.55, holdToSend: 2.4, nearMax: 11,
      closet: closet(32, 1.35), bed: bed(22, 13),
      musicBox: musicBox(3.0),
    },
    bonus: ['door', 'wind'],
    card: {
      story: 'In Parts & Service, under dust sheets, the Pizzaplex keeps the <b>old originals</b>: the very first Gus band, from Gus\'s Pizza Shack long ago. At 4:30 they woke up. And they came straight for the Sleepover Suite.',
      watchOut: '✊ <b>Old Gerald</b> and <b>Old Flipper</b> don\'t breathe — they <b>knock</b>. Knocking at a door means it\'s right outside: hold it shut, and hold it a little longer than before. Keep the music box wound.',
      after: 'The knocking stopped. Max let go of the door and slid down to the floor. <i>"Jackson... how long till 6?"</i><br><i>"An hour and a half,"</i> said Jackson. <i>"And Max — ALL of them are coming up my halls now. Every single one."</i><br><br><b>Jackson</b> looked at the power meter, and swallowed.',
    },
  }),

  47: chapter({
    id: 'lasthalfhour', name: 'The Last Half Hour', from: 330, minutes: 30, seconds: 285,
    firstLine: 'Half an hour. Just half an hour. I can do this.',
    opts: { musicBox: true },
    room: {
      left: hall('left', 'sparky'), right: hall('right', 'rocco'),
      calm: 9, step: 6.2, come: 0.52, closer: 0.55, flashToScare: 0.55, holdToSend: 2.4, nearMax: 10.5,
      closet: closet(25, 1.45), bed: bed(20, 12, 5, true),
      musicBox: musicBox(3.1, 6),
    },
    bonus: ['door', 'bed', 'wind'],
    card: {
      story: '5:30 AM. Everyone else is heading for the <b>Main Entrance</b>, where the doors unlock at 6. But somebody has to keep the base safe until the very end — so the kids can get there. That\'s <b>Max</b>. One last half hour.',
      watchOut: '🔥 Max\'s hardest night: <b>Sparky</b> and <b>DJ Rocco</b> in the halls, a fast <b>closet</b>, <b>four</b> plushies for the bed and the <b>music box</b> running down quick. You\'ve done all of this before. All the way to 6 AM!',
      after: 'The clock said <b>6:00</b>. Out in the halls, every footstep stopped at once. Max grabbed her walkie. <i>"Jackson! I made it! I MADE IT!"</i><br><i>"Max — run. The Main Entrance. NOW. I\'m coming too."</i><br><br>Up in the office, <b>Jackson</b> had one last thing to do.',
    },
  }),
};
