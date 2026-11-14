// Chapter 3 — Jackson, 22: Night Guard. (Plays like FNAF 1 — see office.js.)
//
// Jackson started at the Pizzaplex this week. He was told the animatronics stand on their
// stages all night. At midnight he watched them all step off. He's in the security office at
// the top of the two halls, with a door on each side, a hall light for each, eleven cameras
// and a power meter — and somewhere out there, four lost kids. Hold out until 1 AM.
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth } from '../../models.js';
import { pizzaplexLayout, buildPizzaplex, pulseDanceFloor } from '../pizzaplex.js';
import { buildRocco } from '../cast.js';
import { Office } from '../office.js';
import * as THREE from 'three';

const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;

export function build(d) {
  buildPizzaplex(d, { halls: true });
  const P = d.place.P;

  // the desk, its monitors, the clutter
  d.counter(33, 2.7, 6.2, 1.2, 0.8, 0x4a3a2a, 0x6a5a48);
  d.screens = [];
  for (const [x, w] of [[31.7, 0.55], [33.0, 0.7], [34.3, 0.55]]) {
    const c = P(x, 2.5, 1.08);
    d.mesh(G.box, lam(0x1a1a1e), d.group, { p: [c.x, c.y, c.z], s: [w + 0.08, 0.44, 0.3] });
    const s = d.mesh(G.plane, glowMat(0x1f7a4a, 0.15), d.group, { p: [c.x, c.y, c.z + 0.16], s: [w, 0.36, 1], shadow: false, still: false });
    d.screens.push(s);
  }
  const cup = P(34.4, 3.0, 0.88);
  d.mesh(G.cyl, mat(0xf4f1ea, { rough: 0.3 }), d.group, { p: [cup.x, cup.y, cup.z], s: [0.05, 0.12, 0.05] });
  const fan = P(29.8, 2.8, 0.92);
  d.mesh(G.cyl, lam(0x2a2a30), d.group, { p: [fan.x, fan.y, fan.z], s: [0.18, 0.04, 0.18] });
  d.mesh(G.sphere, lam(0x3a3a44), d.group, { p: [fan.x, fan.y + 0.3, fan.z], s: [0.2, 0.2, 0.08] });
  // kids' drawings of the animatronics taped up on the wall, and a Pizzaplex poster
  const pics = ['#ff3fa4', '#2de2e6', '#ffd23f', '#7cff6b', '#c040ff'];
  pics.forEach((c, i) => {
    const g = d.anchor(29.7 + i * 0.6 + (i > 1 ? 4.6 : 0), 2.03, 'south', 2.05 + (i % 2) * 0.32);
    d.mesh(G.plane, new THREE.MeshLambertMaterial({ map: T.posterTex(['GUS', 'ROCCO', 'CHOMP', 'CRANK', 'HI!'][i], c, 'gus') }), g, { s: [0.42, 0.56, 1], r: [0, 0, (i % 2 ? 0.08 : -0.06)], shadow: false });
  });
  d.label('SECURITY', 33, 2.04, 3.6, 2.6, 0.5, 'south', { bg: '#2a1a4a', fg: '#ffd23f', glow: '#ffd23f' });
  d.officeLight = d.lamp(33, 6.0, 4.2, 0xffe2b0, 1.2, { distance: 9, room: 'O', bulb: true });

  // the doors: a steel shutter in each doorway, and the buttons beside it
  d.shutters = {};
  d.hallLights = {};
  for (const [side, x, hallX, face, sx] of [['left', 29.1, 26.7, 'east', 1], ['right', 36.9, 39.3, 'west', -1]]) {
    const c = P(x, 6.0, 0);
    const steel = mat(0x5a6070, { metal: 0.7, rough: 0.35 });
    const mesh = d.mesh(G.box, steel, d.group, { p: [c.x, 4.4, c.z], s: [0.16, 2.6, 2.1], still: false });
    // the yellow-and-black edge of the doorway
    d.block(x, 4.9, 0.18, 0.12, 2.8, mat(0xffd23f), { solid: false, nav: false });
    d.block(x, 7.1, 0.18, 0.12, 2.8, mat(0xffd23f), { solid: false, nav: false });
    // two buttons on a panel: DOOR (red) and LIGHT (white)
    const panelX = x + sx * 0.06;
    const g = d.anchor(panelX, 4.3, face, 1.3);
    d.mesh(G.box, lam(0x2a2a30), g, { p: [0, 0, 0], s: [0.3, 0.6, 0.06] });
    const btn = new THREE.MeshBasicMaterial({ color: 0x3a0808 });
    const lightBtn = new THREE.MeshBasicMaterial({ color: 0x2a2a20 });
    d.mesh(G.cyl, btn, g, { p: [0, 0.14, 0.04], s: [0.08, 0.04, 0.08], r: [Math.PI / 2, 0, 0], shadow: false });
    d.mesh(G.cyl, lightBtn, g, { p: [0, -0.14, 0.04], s: [0.08, 0.04, 0.08], r: [Math.PI / 2, 0, 0], shadow: false });
    d.shutters[side] = { mesh, up: 4.4, down: 1.3, btn, lightBtn };
    // the hall light, just outside the door: off until you hold the button
    const l = d.lamp(hallX, 6.0, 2.9, 0xfff0d0, 2.2, { distance: 6.5, room: side === 'left' ? 'W' : 'E' });
    l.off = true;
    if (l.bulb) l.bulb.visible = false;
    d.hallLights[side] = l;
  }
  d.spots.spawn = P(33, 5.2);
}

export const stop = (x, z, cam, yaw = S) => ({ at: [x, z], cam, yaw });

// The eleven cameras, and each animatronic's way up to the office — shared by every one of
// Jackson's chapters (jackson.js builds the rest from these).
export const CAMS = [
  { name: 'Show Stage', pos: [33, 33.5, 4.6], look: [33, 16, 1.4], map: [33, 30] },
  { name: 'Atrium', pos: [44.6, 34.6, 4.8], look: [26, 16, 0.6], map: [43, 32] },
  { name: 'Food Court', pos: [17.6, 35.2, 4.6], look: [4, 17, 0.4], map: [15, 32] },
  { name: 'Arcade', pos: [47.4, 35.2, 4.6], look: [62, 17, 0.4], map: [50, 32] },
  { name: 'Prize Counter', pos: [17.6, 48.2, 4.4], look: [4, 40, 0.6], map: [15, 45] },
  { name: 'Ball Pit', pos: [20.5, 48.4, 4.6], look: [40, 39, 0], map: [23, 45] },
  { name: 'Party Room', pos: [64.6, 48.4, 4.4], look: [50, 39, 0.4], map: [62, 45] },
  { name: 'Parts & Service', pos: [47.4, 1.4, 4.4], look: [62, 10, 0.3], map: [50, 4] },
  { name: 'West Hall', pos: [24.5, 12.7, 4.4], look: [25, 2, 1.0], map: [24, 9] },
  { name: 'East Hall', pos: [41.5, 12.7, 4.4], look: [41, 2, 1.0], map: [41, 9] },
  { name: 'Gus Shop', pos: [17.6, 1.4, 4.2], look: [4, 11, 0.3], map: [15, 4] },
];

export const ROUTES = {
  cranker: [stop(9, 25, 3, E), stop(15, 31, 3, N), stop(25, 31, 2, N), stop(24, 17.5, 2, N), stop(24.6, 10, 9, N), stop(25.7, 6.0, null, E)],
  chomper: [stop(56, 24, 4, S), stop(60, 30, 4, N), stop(55, 6, 8, W), stop(42.5, 17, 2, N), stop(41.2, 9.5, 10, N), stop(40.2, 6.0, null, W)],
  gerald: [stop(9, 7, 11, S), stop(12, 17.5, 3, E), stop(22.5, 15.8, 2, N), stop(24.2, 8.5, 9, N), stop(25.7, 6.0, null, E)],
  rocco: [stop(56, 44.6, 7, S), stop(38, 42, 6, W), stop(33, 20.8, 1, S), stop(41.6, 8.8, 10, N), stop(40.2, 6.0, null, W)],
};

export default {
  id: 'office',
  hero: 'jackson',
  name: 'Night Guard',
  layout: pizzaplexLayout({ halls: true }),
  build,
  controller: Office,
  mood: { amb: 0.06, hemi: 0.06, fog: 0.03, bg: 0x04030a },
  spawn: { at: [33, 5.2], yaw: 0 },
  clock: { seconds: 270, minutes: 60 },
  firstLine: 'Okay, Jackson. Doors. Lights. Cameras. You can do this.',
  goText: '▶ Start your shift',
  winTitle: 'JACKSON MADE IT TO 1 AM!',
  card: {
    story: '<b>Jackson</b> is 22, and this is his first week as the Pizzaplex\'s night guard. They told him the animatronics stand on their stages all night. At midnight he watched every one of them step off. Now they\'re coming up the halls to his office — and four kids are lost out there somewhere.',
    goal: '🔦 Hold out until <b>1 AM</b>. <b>A</b> / <b>D</b> look left and right. <b>Q</b> / <b>E</b> shut the left / right door. Hold <b>Z</b> / <b>C</b> for the hall lights. <b>SPACE</b> for the cameras.',
    watchOut: '⚡ Doors, lights and cameras all use <b>power</b>. If something is in the doorway when you turn on the light — <b>shut that door!</b> Run out of power and the doors open by themselves... and Gus starts to play his music box. <i>Bonus: spot the lost kids on the cameras!</i>',
    after: 'At 1 AM the animatronics turned round, every one of them, and walked back down the halls to recharge. Jackson let out a breath he\'d been holding for an hour.<br><br>On CAM 08 the hatch in the floor of Parts & Service was still open. Down at the bottom of the ladder, in the tunnels under the Pizzaplex, <b>Jack</b> was looking up.',
  },
  quests: [
    { id: 'survive', type: 'survive', text: 'Hold out until 1 AM' },
    { id: 'door', type: 'door', optional: true, text: 'Shut a door on one of them', done: 'It gave up and went back!' },
    { id: 'jonathan', type: 'spot', who: 'jonathan', optional: true, text: 'Spot Jonathan on the cameras', done: 'Found Jonathan!' },
    { id: 'jack', type: 'spot', who: 'jack', optional: true, text: 'Spot Jack on the cameras', done: 'Found Jack!' },
    { id: 'thomas', type: 'spot', who: 'thomas', optional: true, text: 'Spot Thomas on the cameras', done: 'Found Thomas!' },
  ],
  enemies: [],
  office: {
    seat: [33, 5.2], eye: 1.2, yawMax: 1.85, drain: 0.14, tick: 4.8, doorWait: 7,
    gus: { stage: [33, 16.3], door: [25.9, 6.0] },
    cams: CAMS,
    bots: [
      { id: 'cranker', name: 'Cranker', side: 'left', ai: 7, from: 0, steps: 'cranker', route: ROUTES.cranker },
      { id: 'chomper', name: 'Chomper', side: 'right', ai: 6, from: 10, steps: 'chomper', route: ROUTES.chomper },
      { id: 'gerald', name: 'Gerald', side: 'left', ai: 6, from: 50, steps: 'gerald', route: ROUTES.gerald },
      { id: 'rocco', name: 'DJ Rocco', side: 'right', ai: 8, from: 80, steps: 'gerald', build: buildRocco, route: ROUTES.rocco },
    ],
    kids: [
      { who: 'jonathan', cam: 2, a: [21.6, 26], b: [24, 16], from: 20, to: 75,
        line: 'That\'s Jonathan, by the STAFF ONLY door. Hang on, kid. Stay right there.' },
      { who: 'jack', cam: 8, a: [52, 10.5], b: [60, 5.5], from: 85, to: 140,
        line: 'Jack?! In Parts and Service? Nobody\'s allowed back there — wait. Where did he go?' },
      { who: 'thomas', cam: 6, a: [25, 46], b: [33, 43], from: 150, to: 210,
        line: 'There\'s a little kid in the ball pit... Thomas? He just went UNDER. He didn\'t come back up.' },
    ],
  },
  tips: {
    cranker: 'Hold Z to check the LEFT hall. If someone is standing in the light, press Q to shut the door!',
    chomper: 'Hold C to check the RIGHT hall. Someone there? Press E to shut the door until they leave.',
    gerald: 'Check the cameras (SPACE) to see who\'s coming up the West Hall (CAM 09) and East Hall (CAM 10).',
    rocco: 'DJ Rocco moves fast. Check the East Hall (CAM 10) a lot, and the right light (C).',
    gus: 'Doors, lights and the cameras all use power. Only shut a door when someone is right there!',
  },
  questDone(m, q) { if (q.id === 'survive') m.win(); },
  update(m) { pulseDanceFloor(m.decor, m.game.t); },
};
