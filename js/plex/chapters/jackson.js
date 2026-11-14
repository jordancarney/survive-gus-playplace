// Lost in the Pizzaplex: Jackson's chapters after Chapter 3 (8, 13, 18, 23, 30, 36, 42, 48),
// keyed by chapter number. They all play like FNAF 1 (office.js) in the same security
// office, with the same eleven cameras (ch3-office.js), each a little harder and each with
// its own twist:
//
//    8  Night Guard, Part 2  John phones with tips; everything's a bit faster
//   13  The Ball Pit Cam     Flipper waits in the ball pit: watch CAM 06 or he runs for your door
//   18  Chewed Wires         Chomper chews the camera wires
//   23  Sparky Runs          Sparky the robot dog skips rooms
//   30  Gus Walks            Gus leaves the stage — but only while the cameras are down
//   36  Timmy on Camera      follow the new kid across the Pizzaplex on the cameras
//   42  Everyone's Coming    all of them, and the power drains faster
//   48  6 AM                 the last half hour, and the hardest
//
// John — the night guard at Gus's Giant Pizza Palace, years before he's Old John — phones
// at the start of every one.
import { pizzaplexLayout, pulseDanceFloor } from '../pizzaplex.js';
import { buildRocco, buildSparky } from '../cast.js';
import { Office } from '../office.js';
import { sfx } from '../../audio.js';
import { build, CAMS, ROUTES, stop } from './ch3-office.js';

const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;

// Everybody who can come up the halls, at level `ai` (0–20, FNAF's way), from `from` seconds.
const bot = {
  cranker: (ai, from = 0) => ({ id: 'cranker', name: 'Cranker', side: 'left', ai, from, steps: 'cranker', route: ROUTES.cranker }),
  chomper: (ai, from = 0) => ({ id: 'chomper', name: 'Chomper', side: 'right', ai, from, steps: 'chomper', route: ROUTES.chomper }),
  gerald: (ai, from = 0) => ({ id: 'gerald', name: 'Gerald', side: 'left', ai, from, steps: 'gerald', route: ROUTES.gerald }),
  rocco: (ai, from = 0) => ({ id: 'rocco', name: 'DJ Rocco', side: 'right', ai, from, steps: 'gerald', build: buildRocco, route: ROUTES.rocco }),
  // Sparky runs two rooms at a time, barking
  sparky: (ai, from = 0) => ({
    id: 'sparky', name: 'Sparky', side: 'right', ai, from, steps: 'chomper', build: buildSparky, skip: 2, bark: true,
    route: [stop(60, 20, 4, S), stop(52, 31, 4, N), stop(55, 6, 8, W), stop(44, 25, 2, W), stop(41.4, 10.5, 10, N), stop(40.2, 6.0, null, W)],
  }),
  // Gus, off his stage: he only moves while you aren't on the cameras
  gus: (ai, from = 0) => ({
    id: 'gus', name: 'Gus', side: 'left', ai, from, steps: 'gus', whenDown: true,
    route: [stop(33, 16.3, 1, S), stop(30, 22, 1, S), stop(25, 25, 2, N), stop(23.8, 16.5, 2, N), stop(24.6, 10.5, 9, N), stop(25.7, 6.0, null, E)],
  }),
};

// Flipper, in the ball pit (CAM 06). `patience`: seconds of not being watched before he runs.
const flipper = (patience, from = 0) => ({
  id: 'flipper', name: 'Flipper', cam: 6, side: 'left', pit: [26.5, 45.2], edge: [27.6, 40.4], yaw: -1.1, hall: [24.6, 9.8], hallYaw: N,
  patience, back: 25, runTime: 2.6, reset: 10, from,
});

// A kid on the cameras: walking from a to b between `from` and `to` seconds, on camera `cam`.
const kid = (who, cam, a, b, from, to, line, key) => ({ who, cam, a, b, from, to, line, key });
const spot = (key, text, done) => ({ id: key, type: 'spot', who: key, optional: true, text, done });

const TIPS = {
  cranker: 'Hold Z to check the LEFT hall. If someone is standing in the light, press Q to shut the door!',
  chomper: 'Hold C to check the RIGHT hall. Someone there? Press E to shut the door until they leave.',
  gerald: 'Check the West Hall (CAM 09) and the East Hall (CAM 10) to see who\'s coming.',
  rocco: 'DJ Rocco moves fast. Check the East Hall (CAM 10) a lot, and the right light (C).',
  sparky: 'Sparky skips rooms! Check your RIGHT light (C) more often than usual.',
  flipper: 'Look at CAM 06 (the Ball Pit) every few seconds — watching Flipper keeps him in the pit. If you hear him RUN, shut the LEFT door (Q) fast!',
  gus: 'Gus only moves while your cameras are DOWN. When you hear his music box, check the LEFT light (Z).',
};

// One of Jackson's chapters: Chapter 3's office, cameras and look, plus this chapter's own.
function chapter(o) {
  const { office = {}, ...rest } = o;
  return {
    hero: 'jackson',
    layout: pizzaplexLayout({ halls: true }),
    build,
    controller: Office,
    mood: { amb: 0.06, hemi: 0.06, fog: 0.03, bg: 0x04030a },
    spawn: { at: [33, 5.2], yaw: 0 },
    goText: '▶ Start your shift',
    enemies: [],
    tips: TIPS,
    questDone(m, q) {
      if (q.id !== 'survive') return;
      if (this.sixAM) sfx.sixAM();
      m.win();
    },
    update(m) { pulseDanceFloor(m.decor, m.game.t); },
    ...rest,
    office: {
      seat: [33, 5.2], eye: 1.2, yawMax: 1.85, drain: 0.14, tick: 4.8, doorWait: 7,
      gus: { stage: [33, 16.3], door: [25.9, 6.0] },
      cams: CAMS, kids: [],
      ...office,
    },
  };
}

const survive = (time) => ({ id: 'survive', type: 'survive', text: `Hold out until ${time}` });
const doorQuest = { id: 'door', type: 'door', optional: true, text: 'Shut a door on one of them', done: 'It gave up and went back!' };
const runnerQuest = { id: 'runner', type: 'runner', optional: true, text: 'Shut the left door on Flipper when he runs', done: 'BANG BANG BANG... and he went back to the pit!' };

const CONTROLS = '<b>A</b> / <b>D</b> look left and right. <b>Q</b> / <b>E</b> shut the left / right door. Hold <b>Z</b> / <b>C</b> for the hall lights. <b>SPACE</b> for the cameras.';

export default {
  // ── Chapter 8 ─────────────────────────────────────────────────────────
  8: chapter({
    id: 'office2',
    name: 'Night Guard, Part 2',
    clock: { seconds: 270, from: 60, minutes: 40 },
    firstLine: 'They went back to recharge... for about five minutes. Okay. Round two.',
    winTitle: 'JACKSON MADE IT TO 1:40!',
    card: {
      story: 'At 1 AM the animatronics went back to recharge — for about five minutes. Then the phone on Jackson\'s desk rang. Nobody had called that phone all week. The voice on the other end said his name was <b>John</b>, and that he was the night guard at <b>Gus\'s Giant Pizza Palace</b>, across town. <i>"I know they\'re walking,"</i> he said. <i>"They walk at my place too."</i>',
      goal: `🔦 Hold out until <b>1:40</b>. ${CONTROLS}`,
      watchOut: '⚡ They\'re a bit <b>faster</b> now. Listen to John\'s tips! <i>Bonus: spot Jonathan, Jack and Thomas on the cameras.</i>',
      after: 'At 1:40 the walkie-talkie crackled. <i>"Jackson? It\'s Jack. I\'m back down in the tunnels. There\'s a voice down here that says the generator\'s broken. It keeps saying please."</i><br><br>Jackson didn\'t like the sound of that voice at all. Down under the Pizzaplex, <b>Jack</b> picked up a flashlight.',
    },
    quests: [
      survive('1:40'), doorQuest,
      spot('jonathan', 'Spot Jonathan on the cameras', 'Found Jonathan!'),
      spot('jack', 'Spot Jack on the cameras', 'Found Jack!'),
      spot('thomas', 'Spot Thomas on the cameras', 'Found Thomas!'),
    ],
    calls: [
      [3, 'Hello? Hello! Is this the Pizzaplex security office? My name\'s John. I\'m the night guard at Gus\'s Giant Pizza Palace.'],
      [10, 'I know they walk at night. They walk at my place too. Nobody ever believes me.'],
      [18, 'Tip number one: the hall lights cost power, so just a quick look. Shut a door ONLY when one of them is standing right in it.'],
      [27, 'Tip number two: they come up the West Hall and the East Hall. CAM 09 and CAM 10. I\'ll call back. Good luck.'],
    ],
    office: {
      tick: 4.6,
      bots: [bot.cranker(8), bot.chomper(7, 8), bot.gerald(7, 35), bot.rocco(9, 70)],
      kids: [
        kid('jonathan', 9, [24.6, 10.5], [23.2, 4.5], 12, 60, 'Jonathan, on CAM 09! He\'s sneaking up the West Hall... no — he went through the side door. Backstage. Be careful, kid.'),
        kid('jack', 11, [6, 6], [12.5, 10.5], 70, 125, 'Jack! In the Gus Shop! He got out of the tunnels — hey, why is that hatch in the floor open again?'),
        kid('thomas', 5, [4, 44.5], [12, 45.5], 140, 200, 'That\'s Thomas, behind the Prize Counter. He\'s covered in ball-pit balls. Where has he BEEN?'),
      ],
    },
  }),

  // ── Chapter 13 ────────────────────────────────────────────────────────
  13: chapter({
    id: 'office3',
    name: 'The Ball Pit Cam',
    clock: { seconds: 270, from: 100, minutes: 40 },
    firstLine: 'Something\'s been moving in the ball pit all night. Let\'s have a look...',
    winTitle: 'JACKSON MADE IT TO 2:20!',
    card: {
      story: 'On <b>CAM 06</b> a dolphin\'s fin is sticking up out of the Giant Ball Pit. <b>Flipper</b>. He hasn\'t come up the halls once tonight. He\'s been <i>waiting</i>.',
      goal: `🔦 Hold out until <b>2:20</b>. ${CONTROLS}`,
      watchOut: '🐬 <b>Watch Flipper on CAM 06</b> every few seconds — while you\'re looking at him, he stays in the pit. Stop looking and he climbs out... and then he <b>RUNS</b> up the West Hall. When you hear him, <b>shut the LEFT door!</b>',
      after: 'Down in the tunnels under the Workshop, Jack heard heavy footsteps go right over his head. Then the speakers clicked on. <i>"Hello, Jack! DJ Rocco is coming to check the Workshop. Please hide. Please do not breathe."</i><br><br><b>Jack</b> looked around for somewhere — anywhere — to hide.',
    },
    quests: [
      survive('2:20'), runnerQuest, doorQuest,
      spot('jonathan', 'Spot Jonathan on the cameras', 'Found Jonathan!'),
      spot('thomas', 'Spot Thomas on the cameras', 'Found Thomas!'),
    ],
    calls: [
      [3, 'It\'s John again. Is there a ball pit at your place? ...Of course there is. Watch it.'],
      [10, 'The dolphin. Flipper. If you don\'t keep checking on him, he climbs out. And then he runs.'],
      [18, 'He runs up the West Hall. You\'ll HEAR him. Shut the left door, fast.'],
      [26, 'Keep looking at him on CAM 06 and he stays down in the balls. Okay. Talk later.'],
    ],
    office: {
      runner: flipper(30, 15),
      bots: [bot.cranker(8), bot.chomper(8, 10), bot.rocco(9, 55), bot.gerald(7, 110)],
      kids: [
        kid('jonathan', 4, [50, 33], [62.5, 20], 18, 70, 'Jonathan\'s going through the Arcade... toward the Fun Zone. The kart track\'s back there.'),
        kid('thomas', 6, [24, 46.5], [31, 44], 170, 225, 'Thomas is climbing into the ball pit — WITH FLIPPER IN IT! He went under... and he\'s gone. Again.'),
      ],
    },
  }),

  // ── Chapter 18 ────────────────────────────────────────────────────────
  18: chapter({
    id: 'office4',
    name: 'Chewed Wires',
    clock: { seconds: 270, from: 140, minutes: 40 },
    firstLine: 'CAM 04 just went black. Was that... CHOMPER? Chewing the cable?',
    winTitle: 'JACKSON MADE IT TO 3:00!',
    card: {
      story: 'The cameras keep cutting out. On CAM 04, right before it went black, Jackson saw <b>Chomper</b> — chewing on the cable.',
      goal: `🔦 Hold out until <b>3:00</b>. ${CONTROLS}`,
      watchOut: '🦫 Chewed cameras show <b>NO SIGNAL</b> until they fix themselves. When you can\'t see, use your <b>hall lights</b> — they always work. And don\'t forget <b>Flipper</b> on CAM 06!',
      after: 'At 3 AM the walkie-talkie crackled, very quietly. <i>"Jackson, it\'s Jack. There\'s a room down here full of screens. P.A.L.\'s screens. Every animatronic in the Pizzaplex is on them."</i><br><br>Down in the tunnels, <b>Jack</b> crept closer to see what P.A.L. was really doing.',
    },
    quests: [
      survive('3:00'), runnerQuest, doorQuest,
      spot('jonathan', 'Spot Jonathan on the cameras', 'Found Jonathan!'),
    ],
    calls: [
      [3, 'John here. Your cameras going fuzzy? That\'s the beaver. He chews the wires.'],
      [10, 'A chewed camera fixes itself after a while. Until then, use your hall lights. They always work.'],
      [18, 'And don\'t forget the dolphin. Never forget the dolphin.'],
    ],
    office: {
      runner: flipper(34, 20),
      chew: { every: 15, first: 10, dur: 22, under: 0.5 },
      bots: [bot.cranker(9), bot.chomper(9, 5), bot.gerald(8, 40), bot.rocco(9, 85)],
      kids: [
        kid('jonathan', 3, [16, 30], [3, 20], 15, 70, 'Jonathan, in the Food Court — heading for the Sleepover Suite. He\'s going to find Max!'),
      ],
    },
  }),

  // ── Chapter 23 ────────────────────────────────────────────────────────
  23: chapter({
    id: 'office5',
    name: 'Sparky Runs',
    clock: { seconds: 255, from: 180, minutes: 30 },
    firstLine: 'Was that... barking?',
    winTitle: 'JACKSON MADE IT TO 3:30!',
    card: {
      story: 'There\'s a new one tonight: <b>Sparky</b>, the robot dog from the Fun Zone\'s kart track. He doesn\'t walk from room to room. He <b>runs</b> — and he skips right past some of them.',
      goal: `🔦 Hold out until <b>3:30</b>. ${CONTROLS}`,
      watchOut: '🐕 Sparky comes up the <b>East Hall</b> and skips rooms, so check your <b>RIGHT</b> light (<b>C</b>) more. You\'ll hear him bark when he moves. <b>Flipper</b> is still in the ball pit.',
      after: 'At 3:30 Sparky trotted back to the kart track, wagging his lightning-bolt tail like it had all been a game. On the walkie: <i>"Jackson, it\'s Jack. P.A.L. lives in a room called the Core. It\'s locked. There has to be a key down here somewhere."</i><br><br><b>Jack</b> started looking.',
    },
    quests: [
      survive('3:30'), runnerQuest, doorQuest,
      spot('jonathan', 'Spot Jonathan on the cameras', 'Found Jonathan!'),
      spot('thomas', 'Spot Thomas on the cameras', 'Found Thomas!'),
    ],
    calls: [
      [3, 'John. I heard barking on your line. A dog? You\'ve got a robot DOG?'],
      [10, 'Fast ones skip rooms. Check your right light more than you think you need to.'],
      [19, 'Six AM. That\'s when your doors unlock, right? Hang on till then.'],
    ],
    office: {
      runner: flipper(32, 30),
      bots: [bot.sparky(9, 15), bot.cranker(9), bot.chomper(9, 30), bot.rocco(10, 75)],
      kids: [
        kid('jonathan', 5, [4, 44], [13, 45.5], 15, 75, 'Jonathan, at the Prize Counter, filling his pockets with... batteries. Walkie batteries. Smart kid.'),
        kid('thomas', 6, [24, 46.5], [32, 43], 140, 195, 'Thomas, back in the ball pit. How many times is he going to do that?'),
      ],
    },
  }),

  // ── Chapter 30 ────────────────────────────────────────────────────────
  30: chapter({
    id: 'office6',
    name: 'Gus Walks',
    clock: { seconds: 255, from: 210, minutes: 30 },
    firstLine: 'CAM 01... the stage is empty. Where\'s Gus?',
    winTitle: 'JACKSON MADE IT TO 4:00!',
    card: {
      story: 'Gus isn\'t on his stage. Jackson checked CAM 01 three times. And every time he puts the cameras down, he hears a music box — a little bit closer.',
      goal: `🔦 Hold out until <b>4:00</b>. ${CONTROLS}`,
      watchOut: '🎩 <b>Gus only moves while your cameras are DOWN.</b> Keep them up and he stays where he is — but you can\'t watch the cameras and your doors at the same time. When you hear the music box, check your <b>LEFT</b> light! <i>Bonus: who\'s that new kid in the ball pit?</i>',
      after: 'At 4 AM Gus walked back to his stage and stood there like nothing had happened. On the walkie, Jack whispered: <i>"I\'ve got the key. I\'m going down to the Core."</i><br><br>Down under the Pizzaplex, <b>Jack</b> turned the key.',
    },
    quests: [
      survive('4:00'), doorQuest,
      spot('timmy', 'Spot the new kid on the cameras', 'A new kid?! His name is... Timmy?'),
    ],
    calls: [
      [3, 'John. Is Gus off his stage? ...Then listen carefully. Gus only moves when you\'re NOT watching.'],
      [11, 'Keep the cameras up and he stays put. But you can\'t watch the cameras AND your doors. That\'s the trick of it.'],
      [20, 'He comes up the West Hall. When you hear the music box, check your left light.'],
    ],
    office: {
      toast: '🎩 Gus is off his stage. He only moves while the cameras are DOWN!',
      bots: [bot.gus(10, 5), bot.cranker(9), bot.chomper(10, 20), bot.sparky(9, 55), bot.rocco(10, 95)],
      kids: [
        kid('timmy', 6, [36, 45], [30, 42.5], 15, 110, 'Wait — there\'s a NEW kid in the ball pit. Little guy, white shirt, bowl cut. I\'ve never seen him before. Who ARE you, buddy?'),
      ],
    },
  }),

  // ── Chapter 36 ────────────────────────────────────────────────────────
  36: chapter({
    id: 'office7',
    name: 'Timmy on Camera',
    clock: { seconds: 255, from: 240, minutes: 30 },
    firstLine: 'Okay, Timmy. I can see you. Do exactly what I say.',
    winTitle: 'JACKSON MADE IT TO 4:30!',
    card: {
      story: 'The new kid\'s name is <b>Timmy</b>. He says he fell asleep in a ball pit and woke up <i>here</i>. Now he\'s crossing the whole Pizzaplex to get to the others — all by himself — and Jackson is the only one who can see the way.',
      goal: `🔦 Hold out until <b>4:30</b>. ${CONTROLS} <b>Find Timmy on the cameras</b> as he goes: the Ball Pit, the Atrium, the Food Court, the Gus Shop.`,
      watchOut: '👀 Every camera you find Timmy on is a bonus. But <b>Sparky</b>, <b>Flipper</b> and the rest are still coming — don\'t stare at the cameras too long!',
      after: 'Timmy made it, all the way. Then, down in the tunnels, every light turned red at once, and P.A.L.\'s voice came out of every speaker: <i>"Rebooting animatronics. Please stand by."</i><br><br><b>Jack</b> had a very, very bad feeling.',
    },
    quests: [
      survive('4:30'), runnerQuest, doorQuest,
      spot('timmy1', 'Find Timmy on CAM 06 (Ball Pit)', 'There he is!'),
      spot('timmy2', 'Find Timmy on CAM 02 (Atrium)', 'Good, Timmy!'),
      spot('timmy3', 'Find Timmy on CAM 03 (Food Court)', 'Keep going!'),
      spot('timmy4', 'Find Timmy on CAM 11 (Gus Shop)', 'He made it!'),
    ],
    calls: [
      [3, 'John. A little kid in a white shirt, lost? ...That\'s strange. I feel like I\'ve met— never mind.'],
      [11, 'Keep him on the cameras and talk him through it. You\'re all he\'s got.'],
    ],
    office: {
      runner: flipper(30, 25),
      bots: [bot.sparky(9, 10), bot.cranker(10), bot.chomper(9, 20), bot.rocco(10, 70)],
      kids: [
        kid('timmy', 6, [36, 46], [32, 39.5], 8, 58, 'There you are, Timmy. Climb out of the balls... quietly. Flipper\'s right there.', 'timmy1'),
        kid('timmy', 2, [33, 34], [25, 24], 66, 118, 'Good! Now through the Atrium. Stay away from the stage. Stay AWAY from the stage.', 'timmy2'),
        kid('timmy', 3, [17, 25], [8, 15.5], 126, 178, 'Into the Food Court... under the tables... you\'re doing great, buddy.', 'timmy3'),
        kid('timmy', 11, [9, 11.5], [4, 4.5], 186, 240, 'The Gus Shop! The others are waiting for you. Go, go!', 'timmy4'),
      ],
    },
  }),

  // ── Chapter 42 ────────────────────────────────────────────────────────
  42: chapter({
    id: 'office8',
    name: 'Everyone\'s Coming',
    clock: { seconds: 255, from: 270, minutes: 30 },
    firstLine: 'Half past four. Here they ALL come.',
    winTitle: 'JACKSON MADE IT TO 5:00!',
    card: {
      story: 'Half past four, and P.A.L. has sent every single one of them. Gus is walking again, Sparky\'s running, Flipper\'s in the pit, Chomper\'s hungry — and the power is draining faster than ever.',
      goal: `🔦 Hold out until <b>5:00</b>. ${CONTROLS}`,
      watchOut: '⚡ The power goes <b>faster</b> tonight. Lights first, then doors — only shut one when somebody\'s right there. Watch <b>Flipper</b> on CAM 06, and when the music box plays, check your <b>left</b> light for Gus.',
      after: 'At 5 AM the walkie crackled. Jack, out of breath: <i>"Jackson! P.A.L. has an off switch. Three levers — in three corners of the tunnels. I need all three."</i><br><br>Down under the Pizzaplex, <b>Jack</b> ran for the first lever.',
    },
    quests: [
      survive('5:00'), runnerQuest, doorQuest,
      spot('jonathan', 'Spot Jonathan on the cameras', 'Found Jonathan!'),
    ],
    calls: [
      [3, 'John. This is the worst part of the night. It always is. Save your power.'],
      [11, 'Lights, THEN doors. Only shut one when they\'re right there.'],
      [21, 'An hour and a half to go. You can do this, Jackson.'],
    ],
    office: {
      drain: 0.15,
      runner: flipper(32, 25),
      bots: [bot.cranker(10), bot.chomper(10, 10), bot.gerald(9, 30), bot.rocco(10, 50), bot.sparky(9, 70), bot.gus(8, 90)],
      kids: [
        kid('jonathan', 2, [42, 30], [27.5, 15.2], 30, 85, 'Jonathan\'s crossing the Atrium toward backstage. Toward the music box. Go get it, kid.'),
      ],
    },
  }),

  // ── Chapter 48 ────────────────────────────────────────────────────────
  48: chapter({
    id: 'office9',
    name: '6 AM',
    clock: { seconds: 270, from: 330, minutes: 30 },
    firstLine: 'Half an hour. Everyone\'s heading for the front doors. Just keep them busy.',
    winTitle: '6 AM! JACKSON DID IT!',
    sixAM: true,
    card: {
      story: 'The last half hour. Everyone is on their way to the <b>Main Entrance</b> — Jackson can see them on the cameras, one by one. All he has to do is keep the animatronics busy until the doors unlock at <b>6 AM</b>.',
      goal: `🔦 Hold out until <b>6 AM</b>. ${CONTROLS}`,
      watchOut: '💀 <b>Everything</b>, all at once: every animatronic, Flipper in the pit, Gus walking, Chomper chewing the wires, and the power draining fast. Stay calm. Lights, then doors. <i>Bonus: watch your friends make it to the front.</i>',
      after: 'The clock hit <b>6 AM</b>, and every animatronic in the halls stopped dead — mid-step. Jackson didn\'t know yet how close it had been. Because twenty minutes earlier, down in the tunnels, <b>Jack</b> had been standing in front of P.A.L.\'s Core, with his hand on the very last switch.',
    },
    quests: [
      survive('6 AM'), runnerQuest, doorQuest,
      spot('thomas', 'Spot Thomas heading for the front', 'Go, Thomas!'),
      spot('timmy', 'Spot Timmy heading for the front', 'Run, Timmy!'),
      spot('jonathan', 'Spot Jonathan heading for the front', 'Almost there!'),
    ],
    calls: [
      [3, 'John. Last call, I promise. At six your doors unlock. Get everybody to the Main Entrance.'],
      [13, 'And Jackson? When this is over... maybe find a different job. Trust me.'],
    ],
    office: {
      drain: 0.15, doorWait: 7,
      runner: flipper(30, 20),
      chew: { every: 20, first: 30, dur: 18, under: 0.3 },
      bots: [bot.cranker(10), bot.chomper(10, 10), bot.gerald(10, 25), bot.rocco(10, 45), bot.sparky(10, 60), bot.gus(9, 80)],
      kids: [
        kid('thomas', 3, [16, 31], [4, 20], 20, 75, 'Thomas, through the Food Court toward the front. Go, go, GO!'),
        kid('timmy', 2, [40, 32], [22, 20], 85, 140, 'Timmy\'s going too — straight across the Atrium. Run, buddy!'),
        kid('jonathan', 4, [62, 18], [49, 31], 150, 205, 'And Jonathan. Heading for the front doors. That\'s everybody... almost.'),
      ],
    },
  }),
};
