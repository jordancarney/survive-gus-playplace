// In the Closets' ten levels: ten nights at Timmy's house, each one harder (the designer: "make
// 10 levels that get harder and harder"). The floors open up as they go — downstairs, then
// upstairs, then the basement, then the attic, four floors by the end — and every level brings
// in more of them, faster, and more at once.
//
// The numbers, per level:
//   floors   which floors are open (0 basement, 1 downstairs, 2 upstairs, 3 attic)
//   crew     how many are in the closets (mode.js CREW, in order), plus Gus from Level 3
//   quiet    seconds a closet stays quiet before it starts breathing again (a range)
//   open     seconds from the first breath until the door is all the way open and it's out
//   taps     pushes it takes to make the breathing stop; `push` how far each one shuts it
//   atOnce   how many can be breathing at the same time; `gap` the fewest seconds between two
//            starting (so two never start at the very same moment)
//   move     the chance one creeps off to a different closet after you've held it shut
//   gusOut   seconds you've got to hide once Gus is out; gusHide how long to stay hidden
//
// The story's made up for this build, for the designer to change.
import { houseLayout, buildHouse, fp } from './house.js';

const ROWS = [
  { name: 'Home Alone', floors: [1], crew: 2, gus: false, quiet: [16, 26], open: 15, taps: 6, atOnce: 1, move: 0, gap: 6, clock: 150 },
  { name: 'Creaks in the Night', floors: [1], crew: 3, gus: false, quiet: [14, 23], open: 14, taps: 7, atOnce: 1, move: 0, gap: 6, clock: 165 },
  { name: 'Eyes in the Mirror', floors: [1, 2], crew: 4, gus: true, quiet: [14, 22], open: 15, taps: 7, atOnce: 2, move: 0, gap: 5, clock: 180, gusOut: 14, gusHide: 6 },
  { name: 'Upstairs, Downstairs', floors: [1, 2], crew: 5, gus: true, quiet: [13, 21], open: 14.5, taps: 8, atOnce: 2, move: 0.15, gap: 5, clock: 195, gusOut: 13, gusHide: 6 },
  { name: 'The Basement Door', floors: [0, 1, 2], crew: 6, gus: true, quiet: [15, 22], open: 14.5, taps: 8, atOnce: 2, move: 0.2, gap: 3.5, clock: 210, gusOut: 13, gusHide: 7 },
  { name: 'Down in the Dark', floors: [0, 1, 2], crew: 7, gus: true, quiet: [17, 26], open: 14, taps: 9, atOnce: 2, move: 0.3, gap: 3.4, clock: 225, gusOut: 12, gusHide: 7 },
  { name: 'They Move', floors: [0, 1, 2], crew: 8, gus: true, quiet: [19, 29], open: 14.5, taps: 10, atOnce: 2, move: 0.5, gap: 3.6, clock: 240, gusOut: 12, gusHide: 8 },
  { name: 'The Attic', floors: [0, 1, 2, 3], crew: 9, gus: true, quiet: [22, 32], open: 15, taps: 10, atOnce: 2, move: 0.5, gap: 3.6, clock: 255, gusOut: 11, gusHide: 8 },
  { name: 'Every Floor', floors: [0, 1, 2, 3], crew: 10, gus: true, quiet: [24, 34], open: 15, taps: 11, atOnce: 2, move: 0.6, gap: 3.5, clock: 270, gusOut: 11, gusHide: 8 },
  { name: 'Gramma Comes Home', floors: [0, 1, 2, 3], crew: 11, gus: true, quiet: [26, 36], open: 15.5, taps: 12, atOnce: 2, move: 0.7, gap: 3.6, clock: 300, gusOut: 10, gusHide: 8 },
];

const CARDS = [
  {
    story: 'After everything at Gus\'s PlayPlace, <b>Timmy</b> lives with his <b>Gramma</b>. This week she\'s working the <b>night shift at the bakery</b>. "Lock the door, sweetie. I\'ll be home at six." The house is very, very quiet... until a closet door creaks.',
    goal: '⌚ <b>Hold out until 6 AM.</b> When you hear <b>BREATHING</b>, the screen says which closet. Get there and <b>SPAM E</b> (or Space) to hold the door shut until the breathing stops!',
    watchOut: '🚪 Two of them are in the closets downstairs. If a door opens all the way... it\'s out.',
    after: 'At six o\'clock, Gramma\'s key turned in the lock. "Morning, sweetie! Did you sleep?" Timmy didn\'t say anything about the closets.',
  },
  {
    story: 'The second night. Timmy told himself it was just the pipes. Pipes don\'t <b>breathe</b>.',
    goal: '⌚ <b>Hold out until 6 AM.</b> Spam E on any closet that\'s breathing. Keep moving — there are more of them now.',
    watchOut: '🚪 Three of them, downstairs. Only one breathes at a time... for now.',
    after: 'Six o\'clock again. Gramma brought warm cinnamon rolls. Timmy ate two and checked every closet in the daylight. Nothing. Of course nothing.',
  },
  {
    story: 'Night three, and now the noises come from <b>upstairs</b> too. In the bathroom mirror Timmy saw something that wasn\'t in the hall behind him: two <b>orange eyes</b>. <b>Gus</b>.',
    goal: '⌚ <b>Hold out until 6 AM.</b> Gus is <b>invisible</b> — only a <b>mirror</b> (at the end of every hall) shows which closet he\'s in. When he breathes, hold <i>his</i> door shut too. Use the <b>stairs</b> (E) at the end of the hall.',
    watchOut: '🪞 If Gus gets out, he\'s <b>right behind you</b> — and you\'ll only see him in a mirror. <b>Hide in an EMPTY closet</b> until he\'s gone!',
    after: 'Gramma found Timmy asleep in the hall, the hallway mirror turned to face the wall. "Silly goose," she said, and turned it back.',
  },
  {
    story: 'Night four. Upstairs and downstairs, and the closets are getting <b>restless</b>: hold one shut, and sometimes it isn\'t in that closet next time.',
    goal: '⌚ <b>Hold out until 6 AM.</b> Two can breathe at once now. Check the mirror to find Gus.',
    watchOut: '🚪 Five in the closets, and Gus. They\'re faster tonight.',
    after: '6 AM. "You look tired, Timmy." "I\'m fine, Gramma." He wasn\'t fine.',
  },
  {
    story: 'Night five. The <b>basement door</b> was standing open. Taped to it, a note in old pencil: <b>"GUS FOREVER."</b> Peter got away from Sushi\'s Pizzaplex... and now he knows where Timmy lives.',
    goal: '⌚ <b>Hold out until 6 AM.</b> The <b>basement</b> is open: three floors now. The stairs are in the middle of every hall.',
    watchOut: '🚪 Six of them, and Gus. The basement closets are a long way from the upstairs ones — listen for which floor!',
    after: 'Gramma got home, frowned at the basement door, and locked it. "Who left this open?" Timmy didn\'t know. He really didn\'t.',
  },
  {
    story: 'Night six. The lock on the basement door was broken in the morning. From the <b>inside</b>.',
    goal: '⌚ <b>Hold out until 6 AM.</b> Three floors, seven of them, Gus.',
    watchOut: '🚪 Hold a door shut and it might creep off to <b>another</b> closet. Keep listening.',
    after: '6 AM. Timmy had pushed a chair against every closet he could. Gramma moved them all back without a word.',
  },
  {
    story: 'Night seven. Now they <b>move</b>. Every time Timmy holds a door shut, whatever was behind it slips off somewhere else in the house.',
    goal: '⌚ <b>Hold out until 6 AM.</b> <b>Three</b> can breathe at once now. Find them fast!',
    watchOut: '🚪 Eight of them, and Gus — and they don\'t stay put.',
    after: 'The sun came up. Gramma said, "Three more nights and I\'m back on days, sweetie." Three more nights.',
  },
  {
    story: 'Night eight. Something is walking around up in the <b>attic</b>. The pull-down ladder was down when Timmy got home from school.',
    goal: '⌚ <b>Hold out until 6 AM.</b> All <b>four floors</b> are open: the attic too.',
    watchOut: '🚪 Nine of them, and Gus. The attic\'s at the very top: the stairs UP in the upstairs hall.',
    after: 'Six o\'clock. Gramma pushed the attic ladder back up with her broom. "Drafty old house," she said.',
  },
  {
    story: 'Night nine. Every floor, every closet. Timmy can hear them all, breathing in the walls.',
    goal: '⌚ <b>Hold out until 6 AM.</b> Four floors, ten of them, and Gus.',
    watchOut: '🚪 They\'re faster than ever and they won\'t stay put. One more night after this.',
    after: '"Last shift tomorrow, Timmy," Gramma said. "Then it\'s pancakes every morning." Just one more night.',
  },
  {
    story: 'The last night. Gramma promised: <b>"I\'ll come straight home, the minute my shift ends."</b> Every animatronic is in the house now — and Gus is the hungriest of all.',
    goal: '⌚ <b>Hold out until Gramma gets home at 6 AM!</b> Everything you\'ve learned: listen, spam E, check the mirrors, and hide from Gus.',
    watchOut: '🚪 Eleven of them and Gus, on every floor, three at once, and they move.',
    after: 'Headlights in the driveway. A key in the front door. "TIMMY? I\'m home!"',
  },
];

const TIPS = {
  1: ['👂 Listen for BREATHING — the top of the screen says which closet. Run there and SPAM E (or Space) to hold it shut!',
    '🚪 Keep tapping until the breathing stops. Too slow, and the door opens all the way...'],
  3: ['🪞 Gus is INVISIBLE. Look in the MIRROR at the end of a hall to see which closet he\'s in!',
    '🪜 Press E on the stairs in the middle of the hall to go up or down.'],
  5: ['🪜 The basement\'s open: the stairs DOWN are in the middle of the downstairs hall.'],
  8: ['🪜 The attic\'s open: the stairs UP are in the middle of the upstairs hall.'],
};

export const LEVELS = ROWS.map((r, i) => {
  const n = i + 1;
  const card = CARDS[i];
  const quests = [
    { id: 'survive', type: 'survive', text: n === 10 ? 'Hold out until Gramma gets home (6 AM)' : 'Hold out until 6 AM', done: n === 10 ? 'GRAMMA\'S HOME!' : 'IT\'S 6 AM!' },
    { id: 'hold', type: 'use', target: 'hold', optional: true, text: 'Hold a breathing closet shut', done: 'The breathing stopped!' },
  ];
  if (r.floors.length > 1) quests.push({ id: 'stairs', type: 'use', target: 'stairs', optional: true, text: 'Take the stairs (E, at the end of the hall)' });
  if (r.gus) {
    quests.push(
      { id: 'mirror', type: 'use', target: 'mirror', optional: true, text: 'Look in a mirror to find Gus 🪞' },
      { id: 'holdgus', type: 'use', target: 'holdgus', optional: true, text: 'Hold Gus\'s closet shut' },
      { id: 'hidegus', type: 'use', target: 'hidegus', optional: true, text: 'Hide from Gus in an empty closet' },
    );
  }
  return {
    id: `closets${n}`, n, name: r.name,
    ...r,
    push: 1.1 / r.taps,
    layout: houseLayout(r.floors),
    build: (d) => buildHouse(d, r.floors),
    clock: { seconds: r.clock },
    mood: { amb: 0.1, hemi: 0.08, fog: 0.035, bg: 0x050308 },
    spawn: { at: fp(1, 12, 7.5), yaw: -Math.PI / 2 },
    firstLine: ['Gramma said lock the door and go straight to bed...', 'It\'s just the pipes. Just the pipes...', 'Something\'s in the mirror...', 'Okay. Upstairs, downstairs. I can do this.',
      'Who opened the basement door?', 'Don\'t go in the basement. Don\'t go in the basement...', 'They\'re moving around in there...', 'Why is the attic ladder down?',
      'Every floor... I can hear them ALL.', 'Last night. Gramma\'s coming home. I just have to make it to six.'][i],
    intro: n === 1 ? 'closetsIntro' : null,
    winTitle: n === 10 ? 'GRAMMA\'S HOME!' : 'YOU MADE IT TO 6 AM!',
    card,
    quests,
    enemies: [],
    tips: Object.fromEntries(['chomper', 'cranker', 'gerald', 'flipper', 'sunny', 'moony', 'rocco', 'sparky', 'sushi', 'oldgerald', 'oldchomper']
      .map((id) => [id, 'Listen for the breathing, get there fast, and SPAM E until it stops. Two breathing at once? Do the one whose door is opening most first!']).concat([
        ['gus', 'Gus only shows up in a mirror. Check one to see which closet he\'s in, and hold it shut when he breathes. If he gets out, hide in an EMPTY closet — quick!'],
      ])),
    tips2: TIPS[n] || [],
    questDone(m, q) { m.onQuest(q); },
  };
});
