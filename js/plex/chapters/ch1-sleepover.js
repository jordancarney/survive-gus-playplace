// Chapter 1 — Jonathan, 9: Sleepover Night. (Plays like Security Breach: the whole main
// floor of the Pizzaplex to roam, the Gus Watch on your wrist, and things to hide in.)
//
// At midnight the lights went out and everyone ran. Jonathan's on his own in the Atrium.
// Find a walkie-talkie at the Prize Counter — Jackson, the night guard, is on the other end
// — then the three Party Passes that open the STAFF ONLY door up to his office. Cranker
// squeaks around the Food Court, Chomper chews up the Arcade, DJ Rocco wakes up when you
// pick up your first pass, and Gus stands on his giant stage, moving when you aren't looking.
import { pizzaplexLayout, buildPizzaplex, pulseDanceFloor } from '../pizzaplex.js';
import { buildOld, buildRocco } from '../cast.js';
import { sfx } from '../../audio.js';

const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;

function build(d) {
  buildPizzaplex(d);
  // the way up to the Security Office: locked until you have the Party Passes
  d.exitDoor(24, 14.6, 'south', { w: 2.0, label: 'STAFF ONLY' });
  d.label('STAFF ONLY\nSECURITY OFFICE ↑', 24, 14.04, 3.2, 2.4, 0.8, 'south', { bg: '#2a0606', fg: '#ff3b30', glow: '#ff3b30' });

  // things to find
  d.item('walkie', 'walkie', 5.2, 43.6, 0.7);
  d.item('pass', 'pass1', 62.6, 33.6);
  d.item('pass', 'pass2', 63.2, 38.6);
  d.item('pass', 'pass3', 16.6, 10.6);
  d.item('plushie', 'plushie', 42.2, 46.6, 0.5);

  // hiding spots, and the save boxes
  d.hideSpot('counter', 3.4, 32.6, 'east', { color: 0xc0262d });
  d.hideSpot('curtain', 21.6, 33.6, 'east', { color: 0xb0102a });
  d.hideSpot('tube', 44.2, 33.0, 'west', { color: 0x3ec1d3 });
  d.hideSpot('box', 63.4, 15.6, 'west', { color: 0x2a4fa0 });
  d.hideSpot('locker', 47.8, 33.8, 'east', { color: 0x7a2a8a });
  d.hideSpot('box', 2.2, 38.4, 'south', { color: 0xa8805a });
  d.hideSpot('curtain', 48.2, 39.2, 'east', { color: 0xc040ff });
  d.hideSpot('locker', 2.0, 11.0, 'east', { color: 0x5b2a86 });
  d.hideSpot('box', 48.6, 11.0, 'east');
  d.savePoint(30, 34.6, 'north');
  d.savePoint(17.6, 34.4, 'west');
  d.savePoint(63.6, 20.5, 'west');
  d.savePoint(17.4, 46.6, 'west');
  d.spots.spawn = d.place.P(33, 24.8);
}

const bot = (id, name, extra) => ({
  id, name, build: buildOld(id), sight: 11, hear: 8, hunt: 0.25, lose: 5, steps: id, stride: 0.9, shoutWho: name, ...extra,
});

export default {
  id: 'sleepover',
  hero: 'jonathan',
  name: 'Sleepover Night',
  layout: pizzaplexLayout(),
  build,
  intro: 'plexIntro',
  mood: { amb: 0.075, hemi: 0.075, fog: 0.028, bg: 0x05030a },
  spawn: { at: [33, 24.8], yaw: 0 },
  firstLine: 'Max? Jack? Thomas?! ...Where did everybody GO?',
  card: {
    story: 'It\'s the first <b>Sleepover Night</b> at the brand-new <b>Gus\'s Pizzaplex</b>. Jonathan just met Max, Thomas — and his old friend <b>Jack</b> from daycare! Then at midnight the lights went out, a music box started playing, and every animatronic in the place opened its eyes. Everybody ran. Now Jonathan is all alone in the Atrium.',
    goal: '⌚ Find a <b>walkie-talkie</b> at the Prize Counter, then the <b>3 Party Passes</b>, and open the <b>STAFF ONLY</b> door left of the big stage. Jackson the night guard is up there.',
    watchOut: '👀 <b>Cranker</b> squeaks around the Food Court, <b>Chomper</b> is in the Arcade, and <b>DJ Rocco</b> is asleep in his Party Room... for now. And <b>Gus</b> never leaves his giant stage — but he moves when you aren\'t looking.',
    after: 'The STAFF ONLY door clicked open. The hallway behind it was pitch black. <i>"Jonathan? It\'s Jackson. I can see you on CAM 2. Stay right there and DON\'T come up the hall — something just walked past my door."</i><br><br>Meanwhile, on the other side of the Pizzaplex, in the Sleepover Suite... <b>Max</b> was hiding.',
  },
  winTitle: 'CHAPTER 1 DONE!',
  exitText: 'Go through the STAFF ONLY door 🚪',
  friends: [
    '🟣 Max: <b>???</b> · ran off in the dark',
    '🔴 Jack: <b>???</b> · ran off in the dark',
    '🟢 Thomas: <b>???</b> · ran off in the dark',
  ],
  quests: [
    { id: 'walkie', type: 'collect', item: 'walkie', count: 1, text: 'Find a walkie-talkie at the Prize Counter', done: 'Got a walkie-talkie!' },
    { id: 'passes', type: 'collect', item: 'pass', count: 3, text: 'Find 3 Party Passes (the yellow ◆ on your map)', done: 'All 3 Party Passes!' },
    { id: 'exit', type: 'exit', text: 'Open the STAFF ONLY door, left of the big stage!' },
    { id: 'pit', type: 'visit', room: 'B', optional: true, text: 'Peek at the giant ball pit', done: 'The ball pit... did something just move in there?' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    bot('cranker', 'Cranker', { walk: 1.5, chase: 3.2, roam: ['F', 'A', 'P', 'N', 'F'], start: [9, 25], wait: 9, hear: 9 }),
    bot('chomper', 'Chomper', { walk: 2.0, chase: 3.7, roam: ['R', 'A', 'T', 'R'], start: [55.5, 27], wait: 16 }),
    { ...bot('rocco', 'DJ Rocco', { walk: 2.3, chase: 4.3, sight: 12, hear: 10, roam: ['K', 'B', 'R', 'A', 'K'], start: [56, 44.6], asleep: true, steps: 'gerald', stride: 1.0 }),
      build: buildRocco, shout: () => ['Drop the beat!', 'Party time!', 'Nobody leaves the dance floor!'][Math.floor(Math.random() * 3)] },
    // He never leaves his stage — but he moves when you look away.
    { id: 'gus', kind: 'watcher', name: 'Gus', build: buildOld('gus'), start: [33, 16.2], yaw: S, speed: 4.5, reach: 1.4,
      area: [27, 14.8, 39, 18.3], asleep: false },
  ],
  tips: {
    cranker: 'Cranker is slow — walk away from him and hide. You can hear his squeaky feet from far away.',
    chomper: 'Chomper can hear you run. Walk past the Arcade, and hide in the box or the locker if he sees you.',
    rocco: 'DJ Rocco is FAST. When his music starts, find a hiding spot before he finds you.',
    gus: 'Gus never leaves his stage, but he moves when you look away. Keep your eyes on him near the stage!',
  },
  start(m, resumed) {
    const d = m.decor;
    d.exit.setOpen(m.done.has('passes'));
    if (m.count('pass') > 0) m.enemies.find((e) => e.id === 'rocco').wake();
  },
  collect(m, item) {
    if (item.kind === 'walkie') walkieCall(m);
    if (item.kind === 'pass' && m.count('pass') === 1) {
      const rocco = m.enemies.find((e) => e.id === 'rocco');
      rocco.wake(1.1);
      sfx.musicBoxSting();
      setTimeout(() => m.say('*thump thump thump* ...is that MUSIC? In the Party Room?', 3.2), 1200);
    }
  },
  questDone(m, q) {
    if (q.id === 'passes') {
      m.decor.exit.setOpen(true);
      sfx.escUnlock();
      setTimeout(() => m.say('All three! Now the STAFF ONLY door by the stage!', 3), 900);
    }
  },
  update(m) { pulseDanceFloor(m.decor, m.game.t); },
};

// Jackson, on the other end of the walkie-talkie.
function walkieCall(m) {
  const lines = [
    [600, '*kshhh* ...Hello? Is somebody on this? This is Jackson, the night guard.', 'Jackson', 3.8],
    [4500, 'It\'s Jonathan! The lights went out and everybody ran!', 'Jonathan', 3.2],
    [8000, 'I\'m locked in the security office. The doors up here need Party Passes — find three and come up the STAFF ONLY door by the stage.', 'Jackson', 5.2],
    [13600, 'And kid? Stay away from that stage.', 'Jackson', 3],
  ];
  for (const [t, text, who, secs] of lines) {
    setTimeout(() => {
      if (m.game.mode !== 'escape' || m.def.id !== 'sleepover') return;
      if (who === 'Jackson') sfx.plexWalkie();
      m.say(text, secs, who === 'Jackson' ? '📻 Jackson' : who);
    }, t);
  }
}
