// Chapter 50 — The Great Escape (the designer's ending: they all escape together).
//
// 5:50 AM at the Main Entrance (js/plex/maps/lobby.js). You're Jonathan, and everybody's
// here somewhere: Max at the Security Desk, Jack in the Coat Check, Thomas and Timmy hiding
// in the Gift Shop, Jackson behind the Ticket Booths. Find each of them (E) and they come
// along behind you (js/plex/followers.js). Get everyone to the front doors — and then hold on
// for the last minute, while every animatronic in the Pizzaplex comes for you, until 6 AM,
// when P.A.L.'s steel shutters roll up and the doors unlock. Out you all go: the ending
// (plexFinale in js/plex/story.js).
import { lobbyLayout, buildLobby, LOBBY_SPOTS } from '../maps/lobby.js';
import { buildOld, buildRocco, buildSparky } from '../cast.js';
import { Follower } from '../followers.js';
import { sfx } from '../../audio.js';

const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;
const $ = (id) => document.getElementById(id);

// Where each of them is waiting, and their place in the group once they're with you.
const FRIENDS = [
  { id: 'max', name: 'Max', icon: '🟣', at: [5, 38], room: 'Security Desk', slot: [1.2, -0.7], line: 'Max! Come on — it\'s nearly six!', reply: 'Finally! I\'ve been holding that radio for an HOUR.' },
  { id: 'jack', name: 'Jack', icon: '🔴', at: [57, 32.5], room: 'Coat Check', slot: [1.2, 0.7], line: 'Jack! This way!', reply: 'Jonathan! P.A.L.\'s off. For real this time!' },
  { id: 'thomas', name: 'Thomas', icon: '🟢', at: [6, 5], room: 'Gift Shop', slot: [2.2, -0.5], line: 'Thomas! Are you okay?', reply: 'We\'re okay! Timmy\'s with me.' },
  { id: 'timmy', name: 'Timmy', icon: '⚪', at: [8, 4.4], room: 'Gift Shop', slot: [2.3, 0.5], line: 'Timmy! Stay close, okay?', reply: 'Okay. Is it six yet?' },
  { id: 'jackson', name: 'Jackson', icon: '🔦', at: [56, 5], room: 'Ticket Booths', slot: [3.2, 0], line: 'Jackson! Everybody\'s here!', reply: 'Good work, kid. Now let\'s get to those doors.' },
];

const COUNTDOWN = 60;     // seconds of the last minute, at the doors

function build(d) {
  buildLobby(d);
  d.exitDoor(...LOBBY_SPOTS.frontDoors, 'south', { w: 4.4, label: 'FRONT DOORS' });
  // a target where each friend is waiting, so your Gus Watch shows you where they are
  for (const f of FRIENDS) d.target(f.id, f.at[0], f.at[1], 'south', `Come on, ${f.name}! ${f.icon}`, null, { reach: 2.0 });
  d.item('plushie', 'plushie', 61.4, 43.4, 0.5);
  d.spots.spawn = d.place.P(...LOBBY_SPOTS.spawn);
}

const bot = (id, name, extra) => ({
  id, name, build: buildOld(id), sight: 11, hear: 9, hunt: 0.3, lose: 4, steps: id, stride: 0.9, shoutWho: name, ...extra,
});

export default {
  50: {
    id: 'great-escape',
    hero: 'jonathan',
    name: 'The Great Escape',
    layout: lobbyLayout,
    build,
    mood: { amb: 0.08, hemi: 0.08, fog: 0.026, bg: 0x05030a },
    spawn: { at: LOBBY_SPOTS.spawn, yaw: 0 },
    clock: { seconds: COUNTDOWN, from: 359, minutes: 1 },
    firstLine: 'Everybody\'s somewhere around the Main Entrance. I have to find them all — before six!',
    goText: '▶ The great escape',
    exitText: 'OUT THE FRONT DOORS — ALL OF US! 🌅',
    winTitle: 'YOU ALL ESCAPED!',
    card: {
      story: 'It\'s 5:50 AM. P.A.L. is switched off, the music box is stopped, and at <b>6 AM</b> the Pizzaplex\'s front doors unlock. Everybody made it to the <b>Main Entrance</b> — but they\'re all hiding in different corners of it, and the animatronics are still walking.',
      goal: '⌚ Find <b>Max</b>, <b>Jack</b>, <b>Thomas</b>, <b>Timmy</b> and <b>Jackson</b> (they\'re on your Gus Watch map), bring everyone to the <b>front doors</b>, and hold on until <b>6 AM</b>.',
      watchOut: '⚠️ The last minute is the worst: <b>every animatronic in the Pizzaplex</b> comes for you. Hide if you have to — your friends will wait. And keep an eye on the big <b>Gus</b> statue in the Entry Hall...',
      after: 'At six o\'clock the steel shutters rolled up, the front doors clicked open, and five kids and one very tired night guard ran out into the sunrise. Together.',
    },
    quests: [
      { id: 'gather', type: 'gather', text: 'Find everybody: Max, Jack, Thomas, Timmy and Jackson', done: 'Everybody\'s here!' },
      { id: 'doors', type: 'doors', text: 'Take everyone to the front doors', done: 'At the doors! Now hold on until 6 AM...' },
      { id: 'survive', type: 'survive', text: 'Hold on until 6 AM — the doors unlock at six!', done: '6 AM!' },
      { id: 'exit', type: 'exit', text: 'OUT THE FRONT DOORS — ALL TOGETHER!' },
      ...FRIENDS.map((f) => ({ id: f.id, type: 'use', target: f.id, optional: true, text: `Find ${f.name} (${f.room})`, done: `${f.name} is with you!` })),
      { id: 'plushie', type: 'collect', item: 'plushie', count: 1, optional: true, secret: true, text: 'Find the golden Gus plushie' },
    ],
    enemies: [
      bot('cranker', 'Cranker', { walk: 1.6, chase: 3.4, roam: ['H', 'S', 'E'], start: [22, 32], wait: 10 }),
      bot('chomper', 'Chomper', { walk: 2.0, chase: 3.8, roam: ['G', 'E', 'H'], start: [9, 18], wait: 16 }),
      bot('gerald', 'Gerald', { walk: 1.9, chase: 3.7, roam: ['C', 'T', 'H'], start: [55, 40], wait: 20, asleep: true }),
      bot('flipper', 'Flipper', { walk: 1.8, chase: 3.7, hear: 11, roam: ['T', 'E', 'C'], start: [56, 18], wait: 24, asleep: true }),
      { ...bot('rocco', 'DJ Rocco', { walk: 2.3, chase: 4.2, roam: ['E', 'H', 'G', 'T'], start: [40, 30], wait: 30, asleep: true, steps: 'gerald' }), build: buildRocco,
        shout: () => ['Last dance!', 'Nobody leaves the party!', 'Where do you think you\'re going?'][Math.floor(Math.random() * 3)] },
      { ...bot('sparky', 'Sparky', { walk: 2.6, chase: 4.5, roam: ['E', 'H', 'C', 'S'], start: [24, 40], wait: 40, asleep: true, steps: 'chomper', stride: 0.7 }), build: buildSparky,
        shout: () => ['WOOF! WOOF!', '*sniff sniff*'][Math.floor(Math.random() * 2)] },
      { id: 'gus', kind: 'watcher', name: 'Gus', build: buildOld('gus'), start: LOBBY_SPOTS.statue, yaw: S, speed: 4.2, reach: 1.4,
        area: LOBBY_SPOTS.statueArea, asleep: false },
    ],
    tips: {
      cranker: 'Find your friends one at a time, and hide when something sees you — they\'ll wait for you.',
      chomper: 'Chomper\'s in the Gift Shop at the start. Wait for him to wander off before you go in.',
      gerald: 'Gerald wakes up when you find someone. Check your Gus Watch (G) to see where everyone is.',
      flipper: 'Flipper can hear you run. Walk past the Ticket Booths.',
      rocco: 'In the last minute, hide in the curtain or the counter near the doors if you have to!',
      sparky: 'Sparky is the fastest of them all. In the last minute, stay near a hiding spot by the doors.',
      gus: 'The Gus statue moves when you aren\'t looking. Keep your eyes on it when you\'re near the doors!',
    },
    friends: [],
    progress(m, q) {
      if (q.id === 'gather') return `(${(this.gang || []).filter((f) => f.with).length}/5)`;
      return '';
    },
    start(m, resumed) {
      const d = m.decor;
      // the clock only starts at the doors
      m.clock = null;
      $('escClock').classList.add('hidden');
      d.setShutters(false);
      d.exit.setOpen(false);
      d.lobbyClock.set(350);
      m.huntK = 1;
      // everybody, waiting where they hid
      this.gang = FRIENDS.map((f) => {
        const fl = new Follower(m, m.people[f.id], f.slot);
        fl.info = f;
        fl.place(m.place.P(...f.at), N);
        fl.with = m.done.has(f.id);
        if (fl.with) fl.place(m.player.pos.clone(), 0);
        return fl;
      });
      this.refreshFriends(m);
      // back from a save box after reaching the doors: the last minute starts again
      if (m.done.has('doors') && !m.done.has('survive')) this.questDone(m, { id: 'doors' });
      if (m.done.has('survive')) this.questDone(m, { id: 'survive' });
    },
    use(m, t) {
      const f = this.gang.find((g) => g.info.id === t.id);
      if (!f || f.with) return true;
      f.with = true;
      sfx.happy();
      m.say(f.info.line, 2.4, 'Jonathan');
      setTimeout(() => { if (m.game.mode === 'escape') m.say(f.info.reply, 3.2, f.info.name); }, 2400);
      // every friend you find wakes another one of them up
      const next = m.enemies.find((e) => e.state === 'off');
      if (next) { next.wake(1.1); sfx.musicBoxSting(); }
      this.refreshFriends(m);
      return true;
    },
    questDone(m, q) {
      if (FRIENDS.some((f) => f.id === q.id) && this.gang.every((g) => g.with)) m.complete('gather');
      if (q.id === 'doors') {
        // the last minute
        m.clock = { t: 0, len: COUNTDOWN };
        $('escClock').classList.remove('hidden');
        for (const e of m.enemies) if (e.state === 'off') e.wake(1.15);
        m.huntK = 3;
        sfx.escAlarm();
        m.game.hud.toast('⏱ ONE MINUTE TO 6 AM — every animatronic is coming. HOLD ON!', 4.5);
        sfx.plexWalkie();
        setTimeout(() => { if (m.game.mode === 'escape') m.say('One more minute. Everybody stay together!', 3, 'Jackson'); }, 1800);
      }
      if (q.id === 'survive') {
        const d = m.decor;
        d.setShutters(true);
        d.exit.setOpen(true);
        d.lobbyClock.set(360);
        sfx.sixAM();
        for (const e of m.enemies) { if (e.frozen !== undefined) e.frozen = 999; e.state = e.def.kind === 'watcher' ? 'still' : 'off'; }
        m.game.hud.toast('🌅 6 AM! THE DOORS ARE OPEN! GO GO GO!', 4);
      }
    },
    refreshFriends(m) {
      this.friends.length = 0;
      for (const g of this.gang) {
        this.friends.push(g.with ? `${g.info.icon} ${g.info.name}: <b>with you!</b>` : `${g.info.icon} ${g.info.name}: <b>${g.info.room}</b> · waiting for you`);
      }
    },
    update(m, dt) {
      if (!this.gang) return;
      for (const g of this.gang) g.update(dt);
      const d = m.decor;
      // the wall clock: 5:50, a minute later for each friend, then the last minute
      if (m.clock) d.lobbyClock.set(359 + m.clock.t / m.clock.len);
      else d.lobbyClock.set(350 + this.gang.filter((g) => g.with).length * 1.6);
      // at the doors with everybody
      if (m.done.has('gather') && !m.done.has('doors')) {
        const door = m.place.P(...LOBBY_SPOTS.frontDoors);
        const p = m.player.pos;
        if (Math.hypot(p.x - door.x, p.z - door.z) < 5 && this.gang.every((g) => Math.hypot(g.pos.x - door.x, g.pos.z - door.z) < 9)) m.complete('doors');
      }
    },
  },
};
