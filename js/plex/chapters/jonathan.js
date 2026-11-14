// Lost in the Pizzaplex: Jonathan's chapters after the first (6, 11, 16, 21, 26, 28, 34, 40,
// 46). They play like Chapter 1 — Security Breach-style free roam with the Gus Watch, things
// to find, doors to open, places to hide — each in a different part of the Pizzaplex (the
// maps are in js/plex/maps/). Jonathan is nine: a blue hoodie, a perm, and Jackson the night
// guard on the other end of his walkie-talkie.
import { pizzaplexLayout, buildPizzaplex, pulseDanceFloor } from '../pizzaplex.js';
import { backstageLayout, buildBackstage, spinMusicBox } from '../maps/backstage.js';
import { funzoneLayout, buildFunZone } from '../maps/funzone.js';
import { upstairsLayout, buildUpstairs } from '../maps/upstairs.js';
import { kitchenLayout, buildKitchen } from '../maps/kitchen.js';
import { lobbyLayout, buildLobby, LOBBY_SPOTS } from '../maps/lobby.js';
import { E, W, N, S, talk, bot, rocco, sparky, baby, watcherGus, barks, neon, G, lam, glowMat, mat, sfx } from '../maps/kit.js';
import { buildOld } from '../cast.js';
import { poseRig, setEyes } from '../../models.js';

const find = (m, id) => m.enemies.find((e) => e.id === id);

// A Party-Pass-style panel with fuse slots that light up (the stage lift's).
function fusePanel(d, g) {
  d.mesh(G.box, mat(0x5a6070, { metal: 0.6, rough: 0.4 }), g, { p: [0, 1.2, 0], s: [0.9, 1.0, 0.25] });
  d.liftFuses = [0, 1, 2].map((k) => {
    const m = d.mesh(G.cyl, glowMat(0xfff4c8, 0.4), g, { p: [-0.25 + k * 0.25, 1.2, 0.14], s: [0.05, 0.2, 0.05], r: [0, 0, Math.PI / 2], still: false });
    m.visible = false;
    return m;
  });
  d.mesh(G.box, glowMat(0xffd23f, 0.3), g, { p: [0, 1.6, 0.13], s: [0.6, 0.12, 0.01] });
}

// A person standing still (Max, in her Suite).
function stand(m, person, px, pz, yaw) {
  const p = m.place.P(px, pz);
  person.root.position.set(p.x, 0, p.z);
  person.root.rotation.set(0, yaw, 0);
  person.root.visible = true;
  poseRig(person.rig, 'idle', 0, 0.4, 1);
}

// The music box, playing: a few notes every few seconds, and its little Gus going round.
function musicBoxPlaying(m, dt, k = 1) {
  spinMusicBox(m.decor, dt, k);
  m.boxT = (m.boxT ?? 1) - dt;
  if (m.boxT <= 0) { m.boxT = 4.5; sfx.musicBoxSting(); }
}

// ═════════════════════════════════════════════════════════════════════════
// Chapter 6 — Backstage (1:00)
// ═════════════════════════════════════════════════════════════════════════

const ch6 = {
  id: 'backstage',
  hero: 'jonathan',
  name: 'Backstage',
  layout: backstageLayout,
  build(d) {
    buildBackstage(d, { exit: 'lift' });
    d.item('fuse', 'fuse1', 8, 24.6);
    d.item('fuse', 'fuse2', 14.2, 37.2);
    d.item('fuse', 'fuse3', 34.6, 31);
    d.item('plushie', 'plushie', 20.2, 20.5, 0.5);
    d.target('liftPanel', ...d.liftPanel, 'west', 'Put the fuses in the stage lift panel', (g) => fusePanel(d, g));
    d.spots.spawn = d.place.P(7.5, 5);
  },
  mood: { amb: 0.07, hemi: 0.07, fog: 0.035, bg: 0x040306 },
  spawn: { at: [7.5, 5], yaw: N },
  firstLine: 'Okay... backstage. Jackson said stay out of the halls.',
  winTitle: 'CHAPTER 6 DONE!',
  exitText: 'Ride the STAGE LIFT down! ⬇️',
  card: {
    story: 'Behind the STAFF ONLY door it was pitch black. Then Jonathan\'s walkie crackled: <i>"Jonathan, it\'s Jackson. DON\'T come up the halls — Cranker\'s right outside my office. Go backstage instead. There\'s a stage lift that goes down to the Fun Zone."</i>',
    goal: '⌚ Find <b>3 fuses</b> backstage, put them in the <b>stage lift panel</b> in the Stage Wings, and ride the lift down.',
    watchOut: '👀 <b>Gerald</b> and <b>Chomper</b> walk the backstage halls. And in Costume Storage... one of the spare costumes isn\'t empty. It only moves when you aren\'t looking.',
    after: 'The stage lift groaned and sank down into the dark. On the walkie, very quietly, a girl\'s voice: <i>"...Jackson? It\'s Max. I\'m still in the Sleepover Suite. I can hear something breathing outside the door."</i><br><br><b>Max</b> was going to have to hold on a little longer.',
  },
  friends: [
    '🟣 Max: <b>Sleepover Suite</b> · hiding',
    '🔦 Jackson: <b>Security Office</b> · on the walkie',
    '🔴 Jack: <b>???</b> · nobody\'s heard from him',
    '🟢 Thomas: <b>???</b> · nobody\'s heard from him',
  ],
  quests: [
    { id: 'fuses', type: 'collect', item: 'fuse', count: 3, text: 'Find 3 fuses for the stage lift (the yellow ◆ on your map)', done: 'All 3 fuses!' },
    { id: 'lift', type: 'use', target: 'liftPanel', text: 'Put the fuses in the stage lift panel (Stage Wings)', done: 'The stage lift has power!' },
    { id: 'exit', type: 'exit', text: 'Ride the STAGE LIFT down to the Fun Zone!' },
    { id: 'costumes', type: 'visit', room: 'C', optional: true, text: 'Look around Costume Storage', done: '...did one of those costumes just move?' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    bot('gerald', 'Gerald', { walk: 1.7, chase: 3.4, roam: ['H', 'D', 'C', 'W', 'P', 'S'], start: [42, 12], wait: 10, stride: 1.1 }),
    bot('chomper', 'Chomper', { walk: 1.9, chase: 3.6, roam: ['C', 'S', 'P', 'H'], start: [28, 34], wait: 18 }),
    { id: 'suit', kind: 'watcher', name: 'the spare Cranker suit', build: buildOld('cranker'), start: [34.6, 25], yaw: N,
      speed: 3.6, reach: 1.3, area: [19.6, 15.6, 36.4, 26.4], asleep: false },
  ],
  tips: {
    gerald: 'Gerald walks the Backstage Hall. When he sees you, run into a room and hide in a locker or behind a curtain.',
    chomper: 'Chomper hears you run. Walk when he\'s close — and hide in the Sound Booth or the Prop Room.',
    suit: 'The spare costume in Costume Storage only moves when you look away. Walk through with your eyes on it!',
  },
  start(m, resumed) {
    const d = m.decor;
    d.gusDoor.set(true);
    d.exit.setOpen(m.done.has('lift'));
    for (let i = 0; i < 3; i++) d.liftFuses[i].visible = m.done.has('lift');
    if (!resumed) {
      talk(m, 'backstage', [
        [3600, 'Jackson', 'Jonathan? Good, you made it backstage. The stage lift is in the Stage Wings — it needs 3 fuses.', 4.5],
        [8800, 'Jackson', 'And don\'t go near Gus\'s Room. That door\'s been locked since before I started.', 3.8],
      ]);
    }
  },
  use(m, t) {
    if (t.id === 'liftPanel') {
      for (const f of m.decor.liftFuses) f.visible = true;
      sfx.powerOn();
      return true;
    }
    return true;
  },
  questDone(m, q) {
    if (q.id === 'lift') {
      m.decor.exit.setOpen(true);
      sfx.escUnlock();
      talk(m, 'backstage', [[1200, 'Jonathan', 'The lift\'s working! Down to the Fun Zone...', 3]]);
    }
  },
};

// ═════════════════════════════════════════════════════════════════════════
// Chapter 11 — The Fun Zone (1:40)
// ═════════════════════════════════════════════════════════════════════════

const ch11 = {
  id: 'funzone',
  hero: 'jonathan',
  name: 'The Fun Zone',
  layout: funzoneLayout,
  build(d) {
    buildFunZone(d);
    d.item('flag', 'flag1', 65.6, 43.6);
    d.item('flag', 'flag2', 53.4, 27.8);
    d.item('flag', 'flag3', 68.2, 6);
    d.item('plushie', 'plushie', 15.4, 32.8, 0.5);
    d.target('kiosk', ...d.spots.kiosk, 'south', "Show P.A.L.'s kiosk your 3 checkered flags", (g) => {
      d.mesh(G.box, mat(0x2a2a30, { rough: 0.4 }), g, { p: [0, 0.6, 0], s: [0.6, 1.2, 0.4] });
      d.mesh(G.box, glowMat(0x2de2e6, 0.3), g, { p: [0, 1.05, 0.21], s: [0.45, 0.32, 0.01] });
    });
    d.spots.spawn = d.place.P(6.5, 12.6);
  },
  mood: { amb: 0.09, hemi: 0.09, fog: 0.022, bg: 0x04040c },
  spawn: { at: [6.5, 12.6], yaw: 0 },
  firstLine: 'The Fun Zone... the go-karts! If I wasn\'t so scared this would be AWESOME.',
  winTitle: 'CHAPTER 11 DONE!',
  exitText: 'Back out to the main floor 🏁',
  card: {
    story: 'The stage lift opened in the <b>Fun Zone</b>: Sparky Speedway, the giant go-kart track, and the Laser Tag arena. The exit gate is locked, and the screen on its kiosk just says, in P.A.L.\'s cheerful voice: <i>"FUN ZONE IS CLOSED. PLEASE SHOW THREE CHECKERED FLAGS."</i>',
    goal: '⌚ Find the <b>3 checkered flags</b> — one on the track, one in Laser Tag, one in the Snack Bar — and show them to <b>P.A.L.\'s kiosk</b> by the exit.',
    watchOut: '🐕 This is <b>Sparky</b>\'s home: the Pizzaplex\'s robot dog. He\'s asleep on his charger... until you pick up a flag. He\'s FAST — hide. <b>Cranker</b> squeaks round the track, and <b>Flipper</b> is in the dark of Laser Tag, listening for running.',
    after: 'P.A.L.\'s kiosk beeped: <i>"Thank you for visiting the Fun Zone! Please come again!"</i> and the gate swung open. Behind Jonathan, a robot dog barked, far away and getting closer.<br><br>On the walkie, Max sounded scared: <i>"The night light just went out in here."</i> It was up to <b>Max</b>.',
  },
  friends: [
    '🟣 Max: <b>Sleepover Suite</b> · hiding',
    '🔦 Jackson: <b>Security Office</b> · on the walkie',
    '🔴 Jack: <b>the tunnels</b> · somewhere under the Pizzaplex',
    '🟢 Thomas: <b>???</b> · he fell in the ball pit',
  ],
  quests: [
    { id: 'flags', type: 'collect', item: 'flag', count: 3, text: 'Find 3 checkered flags (the yellow ◆ on your map)', done: 'All 3 flags!' },
    { id: 'kiosk', type: 'use', target: 'kiosk', text: "Show the 3 flags to P.A.L.'s kiosk by the exit", done: 'The gate is open!' },
    { id: 'exit', type: 'exit', text: 'Out the Fun Zone gate!' },
    { id: 'charger', type: 'visit', room: 'G', optional: true, text: "Find Sparky's charger in the Pit Garage", done: 'That\'s where the robot dog sleeps...' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    sparky({ roam: ['K', 'G', 'L', 'K', 'E', 'P'], start: [26, 43.4], yaw: N, asleep: true }),
    bot('cranker', 'Cranker', { walk: 1.4, chase: 3.1, roam: ['K', 'K', 'E', 'B'], start: [40, 27], wait: 10, hear: 10 }),
    bot('flipper', 'Flipper', { walk: 1.7, chase: 3.6, sight: 8, hear: 11, roam: ['L', 'L', 'G'], start: [59, 44], wait: 12, stride: 1.0 }),
  ],
  tips: {
    sparky: 'Sparky is faster than you walk. When he barks, RUN round a corner and hide in a box, a locker or the tube!',
    cranker: 'Cranker is slow. Walk the other way round the track — it\'s a loop!',
    flipper: 'Flipper hears you run in Laser Tag. Walk in the dark, and hide behind the curtains.',
  },
  start(m, resumed) {
    m.decor.exit.setOpen(m.done.has('kiosk'));
    if (m.count('flag') > 0) find(m, 'sparky').wake(1.0);
    if (!resumed) {
      talk(m, 'funzone', [
        [3800, 'Jackson', 'Jonathan, you\'re in the Fun Zone? Careful. That\'s where Sparky lives — the kart track\'s robot dog.', 4.4],
        [8800, 'Jackson', 'He\'s the fastest thing in the Pizzaplex. If he barks, you hide.', 3.6],
      ]);
    }
  },
  collect(m, item) {
    if (item.kind === 'flag' && m.count('flag') === 1) {
      find(m, 'sparky').wake(1.0);
      setTimeout(() => sfx.plexBark(), 900);
      talk(m, 'funzone', [[2200, 'Jonathan', 'Was that... a BARK? Sparky\'s awake!', 3]]);
    }
  },
  use(m, t) {
    if (t.id === 'kiosk') {
      talk(m, 'funzone', [[300, 'P.A.L.', 'Three checkered flags! Congratulations, winner! The Fun Zone gate is now open. Have a FUN night!', 4.6]]);
      return true;
    }
    return true;
  },
  questDone(m, q) {
    if (q.id === 'kiosk') { m.decor.exit.setOpen(true); sfx.escUnlock(); }
  },
  update(m) { barks(m); },
};

// ═════════════════════════════════════════════════════════════════════════
// Chapter 16 — The Sleepover Suite (2:20)
// ═════════════════════════════════════════════════════════════════════════

const ch16 = {
  id: 'upstairs-suite',
  hero: 'jonathan',
  name: 'The Sleepover Suite',
  layout: upstairsLayout,
  build(d) {
    buildUpstairs(d, { suiteLocked: true });
    d.item('key', 'suiteKey', 51, 29.3);
    d.item('battery', 'bat1', 37.6, 8.6);
    d.item('battery', 'bat2', 36.5, 19.8);
    d.item('battery', 'bat3', 50, 33.2);
    d.item('plushie', 'plushie', 56.2, 2.0, 0.5);
    d.target('suite', 21.5, 29.75, 'north', 'Unlock the Sleepover Suite 🔑');
    d.spots.spawn = d.place.P(5, 14);
  },
  mood: { amb: 0.075, hemi: 0.075, fog: 0.03, bg: 0x05040c },
  spawn: { at: [5, 14], yaw: -Math.PI / 2 },
  firstLine: 'Upstairs. Max said the Sleepover Suite... I\'m coming, Max.',
  winTitle: 'JONATHAN FOUND MAX!',
  exitText: 'Back down the stairs ⬇️',
  card: {
    story: 'Max\'s voice on the walkie is getting quieter: her flashlight batteries are almost dead, and she\'s been holding the Sleepover Suite\'s doors shut for over an hour. Jackson can see the stairs on his cameras. <i>"Jonathan, she\'s right above you. Go up."</i>',
    goal: '⌚ Go upstairs, find the <b>Suite key</b> in the Pajama Shop and <b>3 batteries</b> for Max\'s flashlight, then <b>unlock the Sleepover Suite</b>.',
    watchOut: '👀 <b>Chomper</b> and <b>Cranker</b> are the ones that have been at Max\'s doors all night — and they\'re still up here. Two <b>baby Gus\'s</b> toddle round the party rooms, giggling.',
    after: 'Max grabbed the batteries and gave Jonathan the biggest hug. <i>"Somebody has to keep this room safe,"</i> she said, <i>"so we have somewhere to come back to. Go. I\'ve got the doors."</i><br><br>Inside the Suite, on the dresser, something started to tick. <b>Max</b> had a music box to deal with.',
  },
  friends: [
    '🟣 Max: <b>Sleepover Suite</b> · RIGHT ABOVE YOU',
    '🔦 Jackson: <b>Security Office</b> · on the walkie',
    '🔴 Jack: <b>the tunnels</b> · P.A.L. is giving him jobs',
    '🟢 Thomas: <b>the ball pit</b> · he keeps disappearing',
  ],
  quests: [
    { id: 'stairs', type: 'visit', room: 'H', text: 'Go up to the Upstairs Hall', done: 'Upstairs!' },
    { id: 'key', type: 'collect', item: 'key', count: 1, text: 'Find the Sleepover Suite key (Pajama Shop)', done: 'Got the Suite key!' },
    { id: 'batteries', type: 'collect', item: 'battery', count: 3, text: 'Find 3 flashlight batteries for Max', done: 'Batteries for Max!' },
    { id: 'suite', type: 'use', target: 'suite', text: 'Unlock the Sleepover Suite and find Max', done: 'You found Max!' },
    { id: 'exit', type: 'exit', text: 'Back down the stairs' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    bot('chomper', 'Chomper', { walk: 1.9, chase: 3.6, roam: ['W', 'T', 'H', 'K', 'W'], start: [26, 24], wait: 14 }),
    bot('cranker', 'Cranker', { walk: 1.5, chase: 3.2, roam: ['W', 'H', 'L', 'K'], start: [45, 38], wait: 8, hear: 9 }),
    baby(0, { roam: ['A', 'B', 'H'], start: [19, 7], wait: 4 }),
    baby(1, { roam: ['B', 'C', 'H'], start: [50, 7], wait: 9 }),
  ],
  tips: {
    chomper: 'Chomper hangs round the Sleepover Wing. Hide in the tube by the Suite door, or in the Bathrooms.',
    cranker: 'Cranker is slow but he never stops. Walk away and hide in the Laundry box or the locker.',
    babygus: 'The baby Gus\'s giggle — listen for them in the party rooms and hide in the toy boxes.',
  },
  start(m, resumed) {
    const d = m.decor;
    const open = m.done.has('suite');
    d.suiteDoor.set(!open);
    d.exit.setOpen(open);
    if (open) stand(m, m.people.max, ...d.spots.max, N);
    if (!resumed) {
      talk(m, 'upstairs-suite', [
        [3600, 'Max', 'Jonathan? Is that you on the stairs? I\'m in the Suite... the door\'s locked from outside. The key\'s at the Pajama Shop counter.', 5],
        [9600, 'Max', 'And... can you find me batteries? My flashlight\'s almost dead.', 3.6],
      ]);
    }
  },
  use(m, t) {
    if (t.id !== 'suite') return true;
    if (m.count('key') < 1) { sfx.repairBad(); m.game.hud.toast('🔒 It\'s locked. The key is in the Pajama Shop.', 2.6); return false; }
    if (m.count('battery') < 3) { sfx.repairBad(); m.game.hud.toast('🔦 Find 3 batteries for Max first!', 2.6); return false; }
    m.decor.suiteDoor.set(false);
    sfx.escUnlock();
    stand(m, m.people.max, ...m.decor.spots.max, N);
    talk(m, 'upstairs-suite', [
      [700, 'Jonathan', 'MAX! It\'s me!', 2.2],
      [3000, 'Max', 'JONATHAN! You came! Batteries — thank you, thank you!', 3.4],
      [6600, 'Max', 'Go back down. I\'ll keep this room safe for everybody. Somebody has to.', 4],
    ]);
    return true;
  },
  questDone(m, q) {
    if (q.id === 'suite') m.decor.exit.setOpen(true);
  },
};

// ═════════════════════════════════════════════════════════════════════════
// Chapter 21 — The Prize Counter (3:00)
// ═════════════════════════════════════════════════════════════════════════

const ch21 = {
  id: 'prizes',
  hero: 'jonathan',
  name: 'The Prize Counter',
  layout: pizzaplexLayout(),
  build(d) {
    buildPizzaplex(d);
    d.exitDoor(24, 14.6, 'south', { w: 2.0, label: 'STAFF ONLY' });
    d.item('battery', 'bat1', 9.5, 45.6);
    d.item('battery', 'bat2', 55.5, 21);
    d.item('battery', 'bat3', 4.4, 34.2);
    d.item('battery', 'bat4', 49.6, 44);
    d.item('battery', 'bat5', 2.6, 6);
    d.item('plushie', 'plushie', 20.7, 47.4, 0.5);
    d.hideSpot('counter', 3.4, 32.6, 'east', { color: 0xc0262d });
    d.hideSpot('curtain', 21.6, 33.6, 'east', { color: 0xb0102a });
    d.hideSpot('tube', 44.2, 33.0, 'west', { color: 0x3ec1d3 });
    d.hideSpot('box', 63.4, 15.6, 'west', { color: 0x2a4fa0 });
    d.hideSpot('locker', 47.8, 33.8, 'east', { color: 0x7a2a8a });
    d.hideSpot('box', 2.2, 38.4, 'south', { color: 0xa8805a });
    d.hideSpot('curtain', 48.2, 39.2, 'east', { color: 0xc040ff });
    d.hideSpot('locker', 2.0, 11.0, 'east', { color: 0x5b2a86 });
    d.savePoint(30, 34.6, 'north');
    d.savePoint(17.6, 34.4, 'west');
    d.savePoint(63.6, 20.5, 'west');
    d.savePoint(17.4, 46.6, 'west');
    d.spots.spawn = d.place.P(24, 16.8);
  },
  mood: { amb: 0.07, hemi: 0.07, fog: 0.03, bg: 0x05030a },
  spawn: { at: [24, 16.8], yaw: N },
  firstLine: 'Back on the main floor. Batteries, batteries, batteries...',
  winTitle: 'CHAPTER 21 DONE!',
  exitText: 'Back through the STAFF ONLY door 🚪',
  card: {
    story: 'It\'s 3 AM, and every walkie-talkie in the Pizzaplex is dying. Jackson\'s keeps cutting out, Max\'s is crackling, and nobody\'s heard from Thomas in ages. <i>"Batteries,"</i> says Jackson. <i>"The Prize Counter keeps a whole box of them — but they\'re all over the floor. Somebody knocked it over."</i>',
    goal: '⌚ Get to the <b>Prize Counter</b>, then find <b>5 batteries</b> all over the main floor, and get back to the <b>STAFF ONLY door</b>.',
    watchOut: '👀 Everybody\'s out on the main floor now: <b>Cranker</b>, <b>Chomper</b>, <b>DJ Rocco</b> — and when you\'ve got three batteries, <b>Sparky</b>. And <b>Gus</b> is still on his giant stage, moving when you look away.',
    after: 'Five batteries, one for every walkie. The radios came back loud and clear: Jackson, Max, Jack — even P.A.L., who said <i>"Hello, friends!"</i> on the same channel, which was creepy.<br><br>Up in the Sleepover Suite, something was scratching at Max\'s door. Something fast. <b>Max</b> was on.',
  },
  friends: [
    '🟣 Max: <b>Sleepover Suite</b> · holding the base',
    '🔦 Jackson: <b>Security Office</b> · his walkie keeps cutting out',
    '🔴 Jack: <b>the tunnels</b> · he found out something about P.A.L.',
    '🟢 Thomas: <b>???</b> · in the ball pit... or somewhen else',
  ],
  quests: [
    { id: 'counter', type: 'visit', room: 'P', text: 'Get to the Prize Counter', done: 'The battery box is empty — they\'re all over the floor!' },
    { id: 'batteries', type: 'collect', item: 'battery', count: 5, text: 'Find 5 batteries all over the main floor', done: 'Five batteries — one for every walkie!' },
    { id: 'exit', type: 'exit', text: 'Get back to the STAFF ONLY door by the stage' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    bot('cranker', 'Cranker', { walk: 1.5, chase: 3.2, roam: ['F', 'A', 'P', 'N', 'F'], start: [6, 40], wait: 12, hear: 9 }),
    bot('chomper', 'Chomper', { walk: 2.0, chase: 3.7, roam: ['R', 'A', 'T', 'R'], start: [55.5, 27], wait: 12 }),
    rocco({ roam: ['K', 'B', 'R', 'A', 'K'], start: [56, 44.6], wait: 10 }),
    sparky({ roam: ['A', 'F', 'R', 'B', 'P'], start: [33, 42], yaw: N, asleep: true }),
    watcherGus([33, 16.2], S, [27, 14.8, 39, 18.3]),
  ],
  tips: {
    cranker: 'Cranker is slow. You can hear his squeaky feet from far away — walk the other way.',
    chomper: 'Chomper hears running. Walk past the Arcade.',
    rocco: 'DJ Rocco is fast. Find a hiding spot BEFORE he sees you.',
    sparky: 'Sparky wakes up when you have 3 batteries. Plan where you\'ll hide before you grab the third one!',
    gus: 'Gus never leaves his stage — but walk past it with your eyes on him.',
  },
  start(m, resumed) {
    m.decor.exit.setOpen(m.done.has('batteries'));
    if (m.count('battery') >= 3) find(m, 'sparky').wake(1.0);
    if (!resumed) talk(m, 'prizes', [[3600, 'Jackson', '*kshh* ...the Prize Counter, Jonathan. Batteries. And — *kshh* — watch out for the dog.', 4]]);
  },
  collect(m, item) {
    if (item.kind === 'battery' && m.count('battery') === 3) {
      find(m, 'sparky').wake(1.1);
      setTimeout(() => sfx.plexBark(), 700);
      talk(m, 'prizes', [[1800, 'Jonathan', 'Uh oh. That\'s Sparky.', 2.6]]);
    }
  },
  questDone(m, q) {
    if (q.id === 'batteries') { m.decor.exit.setOpen(true); sfx.escUnlock(); }
  },
  update(m) { pulseDanceFloor(m.decor, m.game.t); barks(m); },
};

// ═════════════════════════════════════════════════════════════════════════
// Chapter 26 — Gus's Room (3:30)
// ═════════════════════════════════════════════════════════════════════════

const ch26 = {
  id: 'gusroom',
  hero: 'jonathan',
  name: "Gus's Room",
  layout: backstageLayout,
  build(d) {
    buildBackstage(d, { exit: 'loading' });
    d.item('key', 'gk1', 16, 24.4);
    d.item('key', 'gk2', 3, 29.2);
    d.item('key', 'gk3', 36.6, 35.4);
    d.item('plushie', 'plushie', 53.5, 16.6, 0.5);
    d.target('gusDoor', 47.5, 26.75, 'north', "Unlock Gus's Room 🔑");
    d.target('musicbox', 47, 34, 'north', 'Look at the old music box...');
    d.spots.spawn = d.place.P(7.5, 5);
  },
  mood: { amb: 0.065, hemi: 0.065, fog: 0.038, bg: 0x040306 },
  spawn: { at: [7.5, 5], yaw: N },
  firstLine: 'Backstage again. Gus\'s Room. Thomas said the music box is in there.',
  winTitle: 'JONATHAN FOUND THE MUSIC BOX!',
  exitText: 'OUT through the STAFF EXIT! 🏃',
  card: {
    story: 'Thomas has been somewhere — somewhen — very strange, and he came back knowing something: the night they wake up, there\'s always a <b>music box</b> playing. Gus\'s old music box. Jackson knows where it is. <i>"Backstage. Gus\'s Room. It\'s been locked since before I started. Nobody goes in there."</i>',
    goal: '⌚ Find the <b>3 keys to Gus\'s Room</b> backstage, <b>unlock</b> it, and find what\'s inside. Then get out through the <b>STAFF EXIT</b>.',
    watchOut: '👀 <b>Gerald</b>, <b>Chomper</b> and <b>Flipper</b> are all backstage. And Gus\'s Room isn\'t empty: <b>Gus</b> is sitting in there, in front of his mirror. He hasn\'t moved... yet.',
    after: 'Jonathan didn\'t stop running until the STAFF EXIT banged shut behind him. Behind it, the music box was still playing. <i>"It\'s the music box,"</i> Jackson said. <i>"Every camera went crazy when you touched it. That\'s what wakes them up."</i><br><br>And in the giant ball pit, something small in a white shirt climbed out, rubbing its eyes. <b>Timmy</b> had arrived.',
  },
  friends: [
    '🟣 Max: <b>Sleepover Suite</b> · holding the base',
    '🔦 Jackson: <b>Security Office</b> · watching you on CAM 2',
    '🔴 Jack: <b>the tunnels</b> · looking for P.A.L.\'s Core',
    '🟢 Thomas: <b>the ball pit</b> · he says he saw the future',
  ],
  quests: [
    { id: 'keys', type: 'collect', item: 'key', count: 3, text: "Find the 3 keys to Gus's Room", done: 'All 3 keys!' },
    { id: 'unlock', type: 'use', target: 'gusDoor', text: "Unlock Gus's Room (off the Stage Wings)", done: "Gus's Room is open..." },
    { id: 'musicbox', type: 'use', target: 'musicbox', text: "Find what's in Gus's Room", done: 'The music box! It\'s playing by itself!' },
    { id: 'exit', type: 'exit', text: 'RUN back to the STAFF EXIT in the Loading Hall!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    bot('gerald', 'Gerald', { walk: 1.8, chase: 3.5, roam: ['H', 'D', 'C', 'W', 'P', 'S'], start: [42, 12], wait: 8, stride: 1.1 }),
    bot('chomper', 'Chomper', { walk: 2.0, chase: 3.7, roam: ['C', 'S', 'P', 'H'], start: [28, 34], wait: 14 }),
    bot('flipper', 'Flipper', { walk: 1.8, chase: 3.7, hear: 11, roam: ['D', 'P', 'H', 'L'], start: [8, 33], wait: 20, stride: 1.0 }),
    { ...watcherGus([51.4, 33], -Math.PI / 2, [40.6, 28.6, 54.4, 38.4]), asleep: undefined },
  ],
  tips: {
    gerald: 'Gerald walks the Backstage Hall. Hide in a locker until he goes by.',
    chomper: 'Walk, don\'t run, near Chomper.',
    flipper: 'Flipper hears running — walk near the Dressing Rooms and the Prop Room.',
    gus: 'Gus only moves when you look away. Back out of his room with your eyes on him!',
  },
  start(m, resumed) {
    const d = m.decor;
    d.gusDoor.set(!m.done.has('unlock'));
    d.exit.setOpen(m.done.has('musicbox'));
    m.flags.playing = m.done.has('musicbox');
    if (m.flags.playing) wakeUp(m, true);
    if (!resumed) {
      talk(m, 'gusroom', [
        [3600, 'Jackson', 'Jonathan — the keys to Gus\'s Room are hidden around backstage. Three of them. I\'ll watch the cameras.', 4.4],
      ]);
    }
  },
  use(m, t) {
    if (t.id === 'gusDoor') {
      if (m.count('key') < 3) { sfx.repairBad(); m.game.hud.toast('🔒 You need all 3 keys.', 2.4); return false; }
      m.decor.gusDoor.set(false);
      sfx.escUnlock();
      return true;
    }
    if (t.id === 'musicbox') { wakeUp(m, false); return true; }
    return true;
  },
  questDone(m, q) {
    if (q.id === 'musicbox') m.decor.exit.setOpen(true);
  },
  update(m, dt) {
    if (m.flags.playing) musicBoxPlaying(m, dt, 1);
  },
};

// Touching the music box: it starts to play, Gus opens his eyes, and everything comes for you.
function wakeUp(m, quiet) {
  m.flags.playing = true;
  find(m, 'gus').wake();
  m.huntK = 3;
  m.speedK = 1.12;
  for (const e of m.enemies) if (e.wake) e.wake(1.1);
  if (quiet) return;
  m.game.lighting.glitch(0.5);
  sfx.musicBoxSting();
  talk(m, 'gusroom', [
    [600, 'Jonathan', 'It\'s... playing. All by itself.', 2.6],
    [3400, 'Jackson', 'JONATHAN! Every camera just went crazy! GET OUT OF THERE!', 3.6],
  ]);
}

// ═════════════════════════════════════════════════════════════════════════
// Chapter 28 — Up the Stairs (3:40)
// ═════════════════════════════════════════════════════════════════════════

const ch28 = {
  id: 'upstairs-antenna',
  hero: 'jonathan',
  name: 'Up the Stairs',
  layout: upstairsLayout,
  build(d) {
    buildUpstairs(d, { suiteLocked: false });
    d.item('antenna', 'ant1', 13.6, 2.2);
    d.item('antenna', 'ant2', 38.6, 9);
    d.item('antenna', 'ant3', 57.2, 2.2);
    d.item('plushie', 'plushie', 14.2, 41.6, 0.5);
    d.target('antenna', ...d.spots.hatch, 'west', 'Put the antenna together at the roof hatch 📡', (g) => {
      d.mesh(G.box, mat(0x5a6070, { metal: 0.6, rough: 0.4 }), g, { p: [0, 1.0, 0.3], s: [0.6, 0.5, 0.3] });
      d.antennaLight = d.mesh(G.sphere, glowMat(0xff3b30, 0.5), g, { p: [0, 1.35, 0.3], s: [0.06, 0.06, 0.06], still: false });
    });
    d.spots.spawn = d.place.P(5, 14);
  },
  mood: { amb: 0.07, hemi: 0.07, fog: 0.03, bg: 0x05040c },
  spawn: { at: [5, 14], yaw: -Math.PI / 2 },
  firstLine: 'Upstairs again. Party rooms. An antenna... how hard can it be?',
  winTitle: 'EVERYBODY CAN HEAR EVERYBODY!',
  exitText: 'Back down the stairs ⬇️',
  card: {
    story: 'Thomas came back through the ball pit with a <b>new kid</b> — a little boy in a white shirt called <b>Timmy</b>, who says he\'s from <i>years from now</i>. He\'s in the play tubes, and his walkie can\'t reach anybody. <i>"There\'s a big antenna for the walkies,"</i> says Jackson. <i>"It came apart in the party rooms upstairs. Put it back together on the roof hatch, and everybody can hear everybody."</i>',
    goal: '⌚ Find the <b>3 antenna pieces</b> in the party rooms, and put the antenna together at the <b>roof hatch</b> in the Laundry.',
    watchOut: '👀 <b>DJ Rocco</b> is up here, and <b>Gerald</b> and <b>Flipper</b>. <b>Sparky</b> wakes up when you take the first antenna piece.',
    after: 'The antenna\'s light went green, and the walkie filled up with voices: Jackson, Max, Jack, Thomas — and a small one Jonathan had never heard before. <i>"H-hello? I\'m Timmy. I\'m six."</i><br><br>In the Sleepover Suite, Max heard it too — and then heard the bed creak behind her. <b>Max</b> was on.',
  },
  friends: [
    '🟣 Max: <b>Sleepover Suite</b> · just down the hall from you',
    '🔦 Jackson: <b>Security Office</b> · on the walkie',
    '🔴 Jack: <b>the tunnels</b> · heading for P.A.L.\'s Core',
    '🟢 Thomas: <b>the ball pit</b> · he brought Timmy back',
    '⚪ Timmy: <b>the play tubes</b> · his walkie can\'t reach anybody',
  ],
  quests: [
    { id: 'parts', type: 'collect', item: 'antenna', count: 3, text: 'Find 3 antenna pieces in the party rooms', done: 'All 3 antenna pieces!' },
    { id: 'antenna', type: 'use', target: 'antenna', text: 'Put the antenna together at the roof hatch (Laundry)', done: 'The antenna works!' },
    { id: 'exit', type: 'exit', text: 'Back down the stairs' },
    { id: 'max', type: 'visit', room: 'Q', optional: true, text: 'Say hi to Max in the Sleepover Suite', done: 'Max waved at you!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    rocco({ roam: ['H', 'A', 'B', 'C', 'W'], start: [50, 6], wait: 10 }),
    sparky({ roam: ['H', 'K', 'L', 'T', 'W'], start: [50, 38], asleep: true }),
    bot('gerald', 'Gerald', { walk: 1.8, chase: 3.5, roam: ['L', 'T', 'K'], start: [36, 38], wait: 12, stride: 1.1 }),
    bot('flipper', 'Flipper', { walk: 1.8, chase: 3.7, hear: 11, roam: ['W', 'H', 'A'], start: [16, 26], wait: 16, stride: 1.0 }),
  ],
  tips: {
    rocco: 'DJ Rocco walks the Upstairs Hall. Duck into a party room and hide in a toy box.',
    sparky: 'Sparky is fast: when he barks, hide — the Laundry has a box and a locker.',
    gerald: 'Gerald likes the Laundry. Hide in the box by the door if he comes.',
    flipper: 'Flipper hears running. Walk past the Sleepover Wing.',
  },
  start(m, resumed) {
    const d = m.decor;
    d.exit.setOpen(m.done.has('antenna'));
    d.antennaLight?.material.color.set(m.done.has('antenna') ? 0x3cff6b : 0xff3b30);
    stand(m, m.people.max, ...d.spots.max, N);
    if (m.count('antenna') > 0) find(m, 'sparky').wake(1.0);
    if (!resumed) talk(m, 'upstairs-antenna', [[3600, 'Max', 'Jonathan, you\'re back upstairs? I\'m in the Suite if you need me. Don\'t let DJ Rocco see you.', 4.4]]);
  },
  collect(m, item) {
    if (item.kind === 'antenna' && m.count('antenna') === 1) {
      find(m, 'sparky').wake(1.0);
      setTimeout(() => sfx.plexBark(), 800);
    }
  },
  use(m, t) {
    if (t.id === 'antenna') {
      m.decor.antennaLight?.material.color.set(0x3cff6b);
      sfx.powerOn();
      talk(m, 'upstairs-antenna', [
        [900, 'Jackson', 'I can hear you LOUD and clear! Everybody check in!', 3.2],
        [4400, 'Max', 'Max here. Still holding the Suite.', 2.6],
        [7400, 'Jack', 'Jack! I\'m under the floor. P.A.L. is being REALLY weird.', 3.4],
        [11200, 'Thomas', 'Thomas! The new kid is with me — say hi, Timmy!', 3.2],
        [14800, 'Timmy', 'H-hello? I\'m Timmy. I\'m six.', 3],
      ]);
      return true;
    }
    return true;
  },
  questDone(m, q) {
    if (q.id === 'antenna') { m.decor.exit.setOpen(true); sfx.escUnlock(); }
  },
  update(m) { barks(m); },
};

// ═════════════════════════════════════════════════════════════════════════
// Chapter 34 — The Kitchen (4:00)
// ═════════════════════════════════════════════════════════════════════════

const ch34 = {
  id: 'kitchen',
  hero: 'jonathan',
  name: 'The Kitchen',
  layout: kitchenLayout,
  build(d) {
    buildKitchen(d);
    d.item('pizza', 'pz1', 11, 10.5);
    d.item('pizza', 'pz2', 19, 15.6);
    d.item('pizza', 'pz3', 46.6, 13.2);
    d.item('pizza', 'pz4', 31.2, 6);
    d.item('juice', 'j1', 44, 2.2);
    d.item('juice', 'j2', 11.4, 31.6);
    d.item('juice', 'j3', 46.6, 25);
    d.item('plushie', 'plushie', 46.6, 31.6, 0.5);
  },
  mood: { amb: 0.08, hemi: 0.08, fog: 0.03, bg: 0x050405 },
  spawn: { at: [3, 9], yaw: -Math.PI / 2 },
  firstLine: 'The kitchen. Pizza for everybody... and juice. Okay.',
  winTitle: 'PIZZA FOR EVERYBODY!',
  exitText: 'Out through the Loading Dock 🚚',
  card: {
    story: 'It\'s 4 AM and everybody is <b>starving</b>. Timmy hasn\'t had dinner in six years (he says). Max\'s stomach is growling so loud the animatronics might hear it. Jackson has a plan: <i>"The kitchen behind the Food Court. Grab pizza and juice, and take it all to the Suite."</i>',
    goal: '⌚ Grab <b>4 slices of pizza</b> and <b>3 juice boxes</b>, then get out through the <b>Loading Dock</b>.',
    watchOut: '👀 <b>Chomper</b> is in the kitchen (of course), <b>Cranker</b> likes the freezer, and <b>DJ Rocco</b> is out on the Loading Dock. <b>Sparky</b> wakes up when you take the first juice box. And P.A.L. turned the ovens on.',
    after: 'Jonathan staggered into the Sleepover Suite with an armful of pizza. Everybody who could get there ate on Max\'s bed, and for ten whole minutes, nobody was scared.<br><br>Then the doors started rattling — all of them at once. <b>Max</b> put her slice down.',
  },
  friends: [
    '🟣 Max: <b>Sleepover Suite</b> · hungry',
    '🔦 Jackson: <b>Security Office</b> · REALLY hungry',
    '🔴 Jack: <b>the tunnels</b> · P.A.L. is rebooting everything',
    '🟢 Thomas: <b>the ball pit</b> · going back to Gus\'s workshop',
    '⚪ Timmy: <b>the play tubes</b> · hasn\'t had dinner in six years',
  ],
  quests: [
    { id: 'pizza', type: 'collect', item: 'pizza', count: 4, text: 'Grab 4 slices of pizza (the yellow ◆ on your map)', done: 'Four slices!' },
    { id: 'juice', type: 'collect', item: 'juice', count: 3, text: 'Grab 3 juice boxes', done: 'Three juice boxes!' },
    { id: 'exit', type: 'exit', text: 'Out through the Loading Dock' },
    { id: 'freezer', type: 'visit', room: 'F', optional: true, text: 'Look inside the walk-in freezer', done: 'BRRR! It\'s freezing in here!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    bot('chomper', 'Chomper', { walk: 2.0, chase: 3.7, roam: ['K', 'D', 'P', 'K'], start: [35, 6], wait: 12 }),
    bot('cranker', 'Cranker', { walk: 1.5, chase: 3.2, roam: ['F', 'D', 'P', 'F'], start: [45, 6], wait: 5, hear: 9 }),
    rocco({ roam: ['L', 'S', 'L', 'K'], start: [30, 28], wait: 12 }),
    sparky({ roam: ['K', 'L', 'P', 'S'], start: [20, 30], asleep: true }),
  ],
  tips: {
    chomper: 'Chomper walks between the prep tables. Hide under the counters at the ends of the kitchen.',
    cranker: 'Cranker LOVES the freezer. Get the juice box in there when he\'s gone round to the Pantry.',
    rocco: 'DJ Rocco walks the Loading Dock. Hide in a box when he comes.',
    sparky: 'Sparky wakes up when you take a juice box. Know where you\'ll hide first!',
  },
  start(m, resumed) {
    m.decor.exit.setOpen(m.done.has('pizza') && m.done.has('juice'));
    if (m.count('juice') > 0) find(m, 'sparky').wake(1.0);
    if (!resumed) {
      talk(m, 'kitchen', [
        [3200, 'P.A.L.', 'PIZZA TIME! The ovens are hot. Please do not touch the ovens. Have a delicious night!', 4.6],
        [9000, 'Jackson', 'Pizza AND juice, Jonathan. And grab one for me.', 3],
      ]);
    }
  },
  collect(m, item) {
    if (item.kind === 'juice' && m.count('juice') === 1) {
      find(m, 'sparky').wake(1.0);
      setTimeout(() => sfx.plexBark(), 800);
    }
  },
  questDone(m, q) {
    if ((q.id === 'pizza' || q.id === 'juice') && m.done.has('pizza') && m.done.has('juice')) { m.decor.exit.setOpen(true); sfx.escUnlock(); }
  },
  update(m) { barks(m); },
};

// ═════════════════════════════════════════════════════════════════════════
// Chapter 40 — The Music Box (4:40)
// ═════════════════════════════════════════════════════════════════════════

const TURN = 6;   // seconds of winding it down, standing right there

const ch40 = {
  id: 'musicbox',
  hero: 'jonathan',
  name: 'The Music Box',
  layout: backstageLayout,
  build(d) {
    buildBackstage(d, { exit: 'loading' });
    d.item('mbkey', 'mbkey', 3, 29.2);
    d.item('plushie', 'plushie', 36.4, 16, 0.5);
    // Timmy's play tube comes out in the Prop Room: that's where he left the key
    const g = d.anchor(1.4, 29.6, 'east', 0);
    d.mesh(G.cyl, mat(0x3ec1d3, { rough: 0.35 }), g, { p: [0, 0.5, 0], s: [0.5, 0.6, 0.5], r: [Math.PI / 2, 0, 0] });
    d.mesh(G.cyl, lam(0x111111), g, { p: [0, 0.5, 0.31], s: [0.4, 0.01, 0.4], r: [Math.PI / 2, 0, 0], shadow: false });
    d.target('musicbox', 47, 34, 'north', 'Wind the music box DOWN with the key 🗝️');
    d.spots.spawn = d.place.P(7.5, 5);
  },
  mood: { amb: 0.06, hemi: 0.06, fog: 0.04, bg: 0x040306 },
  spawn: { at: [7.5, 5], yaw: N },
  firstLine: 'I can hear it from here. The music box. Okay... let\'s turn it OFF.',
  winTitle: 'THE MUSIC BOX STOPPED!',
  exitText: 'OUT through the STAFF EXIT! 🏃',
  card: {
    story: 'Long ago, Thomas saw where Gus was built — and found the <b>music box key</b>. Timmy carried it through the play tubes, where nobody else could fit, and left it at the end of the tube in the backstage <b>Prop Room</b>. Now it\'s Jonathan\'s turn. <i>"Wind it down,"</i> says Thomas. <i>"All the way. And don\'t stop."</i>',
    goal: '⌚ Get the <b>music box key</b> from the Prop Room, then stand at the music box in <b>Gus\'s Room</b> and <b>wind it down</b> — it takes a while, and you have to stay right there.',
    watchOut: '👀 <b>Gus</b> is in his room, and he\'s awake. Keep your eyes on him — he\'s right behind the music box. <b>Gerald</b>, <b>Chomper</b>, <b>DJ Rocco</b> and <b>Sparky</b> are all backstage, and they don\'t want the music to stop.',
    after: 'The music box wound down... slower... slower... and stopped. Every animatronic in the Pizzaplex dropped where it stood. For four whole seconds it was quiet. Then every speaker crackled at once: <i>"PARTY TIME IS NOT OVER,"</i> said P.A.L. <i>"REBOOTING ALL FRIENDS."</i> Their eyes came back on.<br><br>It wasn\'t only the music box. It was P.A.L. too. In the Sleepover Suite, <b>Max</b> heard old, heavy footsteps — not the ones she knew.',
  },
  friends: [
    '🟣 Max: <b>Sleepover Suite</b> · holding the base',
    '🔦 Jackson: <b>Security Office</b> · watching CAM 2',
    '🔴 Jack: <b>the tunnels</b> · at P.A.L.\'s Core',
    '🟢 Thomas: <b>the ball pit</b> · he found the key long ago',
    '⚪ Timmy: <b>the play tubes</b> · he left you the key!',
  ],
  quests: [
    { id: 'key', type: 'collect', item: 'mbkey', count: 1, text: 'Get the music box key from the Prop Room (Timmy left it at his tube)', done: 'Got the music box key!' },
    { id: 'stopbox', type: 'use', target: 'musicbox', text: "Wind the music box DOWN in Gus's Room — stay there until it stops!", done: 'The music stopped!' },
    { id: 'exit', type: 'exit', text: 'Get out — the STAFF EXIT in the Loading Hall!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    bot('gerald', 'Gerald', { walk: 1.8, chase: 3.5, roam: ['H', 'D', 'C', 'W', 'P', 'S'], start: [42, 12], wait: 6, stride: 1.1 }),
    bot('chomper', 'Chomper', { walk: 2.0, chase: 3.7, roam: ['C', 'S', 'P', 'H'], start: [28, 34], wait: 10 }),
    rocco({ roam: ['W', 'H', 'C', 'S'], start: [50, 22], wait: 14 }),
    sparky({ roam: ['H', 'D', 'P', 'L', 'W'], start: [52, 11.5], wait: 24 }),
    // behind the music box, facing it: look at the box and you're looking at him
    watcherGus([47, 37.4], N, [40.6, 35.6, 54.4, 38.4]),
  ],
  tips: {
    gus: 'Gus is right behind the music box. Stand in front of it and look at the box — he can\'t move while you can see him.',
    gerald: 'Gerald walks the halls. Hide, then go back to winding — the music box remembers how far you got.',
    chomper: 'Walk, don\'t run, near Chomper.',
    rocco: 'DJ Rocco comes into the Stage Wings. Hide behind the curtain there.',
    sparky: 'Sparky is fast. When he barks, hide right away.',
  },
  progress(m, q) { return q.id === 'stopbox' && m.flags.turn ? `(${Math.min(100, Math.round((m.flags.turn / TURN) * 100))}%)` : ''; },
  start(m, resumed) {
    const d = m.decor;
    d.gusDoor.set(false);
    m.flags.turn = m.flags.turn || 0;
    m.flags.winding = false;
    d.exit.setOpen(m.done.has('stopbox'));
    this.reboot = 0;
    if (!resumed) {
      talk(m, 'musicbox', [
        [3400, 'Timmy', 'I left the key at the end of my tube! In the room with the giant pizza!', 3.8],
        [8000, 'Thomas', 'Wind it DOWN, Jonathan. All the way. Don\'t stop till it stops.', 3.6],
      ]);
    }
  },
  use(m, t) {
    if (t.id !== 'musicbox') return true;
    if (m.count('mbkey') < 1) { sfx.repairBad(); m.game.hud.toast('🗝️ You need the music box key first!', 2.4); return false; }
    if (!m.flags.winding) {
      m.flags.winding = true;
      sfx.plexWind();
      m.game.hud.toast('🗝️ Winding it down... STAY RIGHT HERE!', 2.4);
    }
    return 'pending';
  },
  update(m, dt) {
    const d = m.decor;
    if (!m.done.has('stopbox')) {
      // the music box plays until you wind it all the way down
      const left = 1 - (m.flags.turn || 0) / TURN;
      musicBoxPlaying(m, dt, Math.max(0.15, left));
      if (m.flags.winding) {
        const p = m.player.pos, b = d.musicBox.pos;
        const near = Math.hypot(p.x - b.x, p.z - b.z) < 1.9 && !m.hiding;
        if (near) {
          m.flags.turn = Math.min(TURN, (m.flags.turn || 0) + dt);
          m.windClick = (m.windClick || 0) - dt;
          if (m.windClick <= 0) { m.windClick = 0.5; sfx.plexWind(); }
          m.game.hud.toast(`🗝️ Winding it down... ${Math.round((m.flags.turn / TURN) * 100)}%`, 0.3);
          if (m.flags.turn >= TURN) musicStops(m, this);
        }
      }
    } else if (this.reboot > 0) {
      // four seconds of quiet, and then P.A.L. turns them all back on
      this.reboot -= dt;
      if (this.reboot <= 0) {
        talk(m, 'musicbox', [[0, 'P.A.L.', 'PARTY TIME IS NOT OVER. REBOOTING ALL FRIENDS.', 3.6]]);
        sfx.powerOn();
        for (const e of m.enemies) {
          e.frozen = 0;
          setEyes(e.rig, 'on');
          if (e.def.kind === 'watcher') { e.state = 'stalk'; } else { e.state = 'wait'; e.timer = 0.5; e.boost = 1.15; }
          sfx.reboot(e.pos);
        }
        m.huntK = 2.5;
        m.decor.exit.setOpen(true);
        sfx.escUnlock();
        setTimeout(() => m.game.mode === 'escape' && m.def.id === 'musicbox' && m.say('They\'re back on?! RUN — the STAFF EXIT!', 3, 'Jonathan'), 4200);
      }
    }
    barks(m);
  },
};

// The music box winds down and stops: every animatronic drops where it stands — for now.
function musicStops(m, def) {
  m.flags.winding = false;
  m.complete('stopbox');
  sfx.blackout();
  m.game.lighting.glitch(0.4);
  for (const e of m.enemies) {
    e.frozen = 99;
    if (e.def.kind === 'watcher') e.state = 'still';
    else { e.state = 'off'; e.path = []; }
    setEyes(e.rig, 'off');
    sfx.powerDown(e.pos);
  }
  def.reboot = 4;
  setTimeout(() => m.game.mode === 'escape' && m.def.id === 'musicbox' && m.say('It stopped. They all... stopped!', 2.6, 'Jonathan'), 800);
}

// ═════════════════════════════════════════════════════════════════════════
// Chapter 46 — The Main Entrance (5:10)
// ═════════════════════════════════════════════════════════════════════════

const ch46 = {
  id: 'entrance',
  hero: 'jonathan',
  name: 'The Main Entrance',
  layout: lobbyLayout,
  build(d) {
    buildLobby(d);
    const sw = LOBBY_SPOTS.beaconSwitches;
    const lever = (g) => {
      d.mesh(G.box, mat(0x5a6070, { metal: 0.6, rough: 0.4 }), g, { p: [0, 1.2, 0], s: [0.5, 0.7, 0.2] });
      d.mesh(G.box, glowMat(0xffd23f, 0.3), g, { p: [0, 1.62, 0.1], s: [0.4, 0.1, 0.01] });
    };
    d.target('b1', ...sw[0], 'south', 'Switch on the Gift Shop beacon 💡', lever);
    d.target('b2', ...sw[1], 'south', 'Switch on the Ticket Booth beacon 💡', lever);
    d.target('b3', ...sw[2], 'north', 'Switch on the big Entry Hall beacon 💡', lever);
    d.target('radio', ...LOBBY_SPOTS.radio, 'east', 'Radio everybody: COME TO THE MAIN ENTRANCE! 📻', (g) => {
      d.mesh(G.box, mat(0xffd23f, { rough: 0.4 }), g, { p: [0, 1.16, 0.2], s: [0.3, 0.2, 0.14] });
      d.mesh(G.cyl, lam(0x111111), g, { p: [0.1, 1.36, 0.2], s: [0.012, 0.25, 0.012] });
    });
    d.item('plushie', 'plushie', 60, 42.6, 0.5);
  },
  mood: { amb: 0.07, hemi: 0.07, fog: 0.022, bg: 0x05030a },
  spawn: { at: LOBBY_SPOTS.spawn, yaw: 0 },
  firstLine: 'The Main Entrance. The front doors... and they\'re covered in steel shutters.',
  winTitle: 'EVERYBODY KNOWS THE WAY!',
  card: {
    story: 'It\'s ten past five. At 6 AM the Pizzaplex unlocks its front doors — that\'s the plan, the whole plan: be at the <b>Main Entrance</b> at 6. Jonathan gets there first. The front doors are behind P.A.L.\'s steel shutters, the lobby is pitch black, and everybody else is going to have to find their way here in the dark.',
    goal: '⌚ Switch on the <b>3 big beacon lights</b> — Gift Shop, Ticket Booths, Entry Hall — so everybody can find the way, then <b>radio everybody</b> from the Security Desk.',
    watchOut: '👀 There\'s a giant <b>Gus</b> on the statue plinth in the Entry Hall — and it isn\'t a statue. <b>DJ Rocco</b>, <b>Sparky</b>, <b>Cranker</b>, <b>Chomper</b> and <b>Gerald</b> are ALL here. Hide a lot.',
    after: 'The three beacons blazed across the lobby, and Jonathan\'s voice went out on every walkie in the Pizzaplex: <i>"Everybody — the Main Entrance. Follow the lights."</i> One by one, they answered.<br><br>Fifty minutes to go. Up in the Sleepover Suite, <b>Max</b> had one last half hour to hold.',
  },
  friends: [
    '🟣 Max: <b>Sleepover Suite</b> · one last half hour',
    '🔦 Jackson: <b>Security Office</b> · the power\'s nearly gone',
    '🔴 Jack: <b>the tunnels</b> · going to switch P.A.L. off',
    '🟢 Thomas: <b>the ball pit</b> · on his way',
    '⚪ Timmy: <b>the play tubes</b> · on his way',
  ],
  quests: [
    { id: 'b1', type: 'use', target: 'b1', text: 'Switch on the Gift Shop beacon', done: 'One beacon on!' },
    { id: 'b2', type: 'use', target: 'b2', text: 'Switch on the Ticket Booth beacon', done: 'Two beacons on!' },
    { id: 'b3', type: 'use', target: 'b3', text: 'Switch on the big beacon in the Entry Hall', done: 'All three beacons on!' },
    { id: 'radio', type: 'use', target: 'radio', text: 'Radio everybody from the Security Desk', done: 'Everybody heard you!' },
    { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
  ],
  enemies: [
    watcherGus(LOBBY_SPOTS.statue, 0, LOBBY_SPOTS.statueArea),
    rocco({ roam: ['E', 'H', 'G', 'E'], start: [6, 20], wait: 10 }),
    sparky({ roam: ['E', 'T', 'C', 'H'], start: [55, 36], wait: 14 }),
    bot('cranker', 'Cranker', { walk: 1.5, chase: 3.2, roam: ['G', 'S', 'G', 'E'], start: [6, 19], wait: 6, hear: 9 }),
    bot('chomper', 'Chomper', { walk: 2.0, chase: 3.7, roam: ['T', 'C', 'E'], start: [56, 8], wait: 10 }),
    bot('gerald', 'Gerald', { walk: 1.8, chase: 3.5, roam: ['H', 'S', 'C', 'H'], start: [8, 40], wait: 20, stride: 1.1 }),
  ],
  tips: {
    gus: 'The big Gus never leaves his plinth — but he moves when you look away. Keep your eyes on him when you walk past.',
    rocco: 'DJ Rocco walks the Entry Hall. Hide behind the curtain or under the info desk.',
    sparky: 'When Sparky barks, hide right away.',
    cranker: 'Cranker is slow. Get the Gift Shop beacon when he\'s walked away.',
    chomper: 'Chomper is in the Ticket Booths. Walk, don\'t run.',
    gerald: 'Gerald walks the Main Hall and the Security Desk. Watch your Gus Watch tracker.',
  },
  start(m) {
    const d = m.decor;
    this.winIn = 0;
    d.setShutters(false);
    d.lobbyClock.set(5 * 60 + 10);
    ['b1', 'b2', 'b3'].forEach((id, i) => lightBeacon(m, i, m.done.has(id)));
    talk(m, 'entrance', [[3600, 'Jackson', 'You made it to the Main Entrance! Turn those beacons on, Jonathan — nobody will find you in the dark.', 4.4]]);
  },
  use(m, t) {
    const i = ['b1', 'b2', 'b3'].indexOf(t.id);
    if (i >= 0) { lightBeacon(m, i, true); sfx.powerOn(); return true; }
    if (t.id === 'radio') {
      sfx.plexWalkie();
      m.say('Everybody — the Main Entrance. Follow the lights!', 3.4, '📻 Jonathan');
      return true;
    }
    return true;
  },
  // (a few seconds after the radio call, so you hear yourself say it — counted in update, so
  // pausing can't lose it)
  questDone(m, q) { if (q.id === 'radio') this.winIn = 3; },
  update(m, dt) {
    barks(m);
    if (this.winIn > 0) { this.winIn -= dt; if (this.winIn <= 0) m.win(); }
  },
};

function lightBeacon(m, i, on) {
  const l = m.decor.beacons[i];
  if (l.off === !on) return;
  l.off = !on;
  if (l.bulb) l.bulb.visible = on;
  m.game.lighting.apply();
}

export default { 6: ch6, 11: ch11, 16: ch16, 21: ch21, 26: ch26, 28: ch28, 34: ch34, 40: ch40, 46: ch46 };

export { E, W, N, S, neon };
