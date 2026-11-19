// Timmy's house, for In the Closets: up to four floors — the basement, downstairs, upstairs
// and the attic — with five closets on every floor (the designer: "5 per floor and more per
// level"). The levels open the floors up as they go.
//
// The grid is flat, so every floor is its own strip of one Building, side by side, and the
// stairs in the middle of each hall take you to the next one (E on the stairs: see mode.js).
// Every floor is laid out the same way, with different rooms:
//
//   ┌ A ──────┬ B ────────┬ C ───────┐     a closet against the far wall of every room
//   │         │           │          │     (A, B and C on the north wall, D and E on the
//   ├──┐ ┌────┴───┐ ┌─────┴──┐ ┌─────┤      south one), a door from each room to the hall,
//   │  H  (the hall)    ⬆  ⬇          🪞    the stairs (up, down) in the middle of the hall's
//   ├────┐ ┌───────┴───┐ ┌───────────┤      south side, and a mirror on the wall at its
//   │ D            │ E               │      east end
//   └──────────────┴─────────────────┘
import * as THREE from 'three';
import * as T from '../textures.js';
import { G, lam, glowMat, FACE } from '../decor.js';
import { mat, cloth } from '../models.js';

export const FLOORS = [
  {
    key: 'b', name: 'Basement', mood: 'concrete',
    rooms: { A: 'Boiler Room', B: 'Storage Room', C: 'Workshop', D: 'Old Laundry', E: 'Fruit Cellar' },
    closets: { A: 'the boiler cupboard', B: 'the storage closet', C: 'the tool closet', D: 'the old wardrobe', E: 'the cellar closet' },
  },
  {
    key: 'd', name: 'Downstairs', mood: 'home',
    rooms: { A: 'Kitchen', B: 'Living Room', C: 'Front Hall', D: 'Dining Room', E: 'Laundry Room' },
    closets: { A: 'the pantry', B: 'the TV closet', C: 'the coat closet', D: 'the china cupboard', E: 'the laundry closet' },
  },
  {
    key: 'u', name: 'Upstairs', mood: 'home',
    rooms: { A: "Timmy's Room", B: 'Bathroom', C: "Gramma's Room", D: 'Toy Room', E: 'Guest Room' },
    closets: { A: "Timmy's closet", B: 'the bathroom cupboard', C: "Gramma's wardrobe", D: 'the toy closet', E: 'the guest closet' },
  },
  {
    key: 'a', name: 'Attic', mood: 'attic',
    rooms: { A: 'West Attic', B: 'Trunk Corner', C: 'East Attic', D: 'Old Bedroom', E: 'The Rafters' },
    closets: { A: 'the dusty wardrobe', B: 'the old chest closet', C: 'the cedar closet', D: "the old bedroom's wardrobe", E: 'the crooked wardrobe' },
  },
];

const FW = 24, FH = 16;        // one floor, in metres
const GAP = 3;                 // wall between one floor's strip and the next
export const floorX = (f) => 1 + f * (FW + GAP);

// Each room's rectangle on a floor, in that floor's own metres.
const ROOMS = {
  A: { x0: 0, z0: 0, x1: 6, z1: 4 }, B: { x0: 8, z0: 0, x1: 15, z1: 4 }, C: { x0: 17, z0: 0, x1: 23, z1: 4 },
  H: { x0: 0, z0: 6, x1: 23, z1: 8 },
  D: { x0: 0, z0: 10, x1: 10, z1: 15 }, E: { x0: 12, z0: 10, x1: 23, z1: 15 },
};
const DOORS = [
  { r: 'A', x0: 3, x1: 4, z: 5 }, { r: 'B', x0: 11, x1: 12, z: 5 }, { r: 'C', x0: 20, x1: 21, z: 5 },
  { r: 'D', x0: 5, x1: 6, z: 9 }, { r: 'E', x0: 17, x1: 18, z: 9 },
];
// Where each room's closet stands (its middle, in floor metres), and which way it faces.
const CLOSETS = {
  A: { x: 3.5, z: 0.45, facing: 'south' }, B: { x: 12, z: 0.45, facing: 'south' }, C: { x: 20.5, z: 0.45, facing: 'south' },
  D: { x: 5.5, z: 15.55, facing: 'north' }, E: { x: 18, z: 15.55, facing: 'north' },
};

const LOOKS = {
  concrete: { floor: () => T.concrete(), wall: ['#4a4d55', '#6a6255', '#2b2d33', 'bricks'], hall: () => T.concrete() },
  home: { floor: () => T.wood('#7a5232'), wall: ['#6a5a7a', '#c9b48a', '#3a2a40', 'stripes'], hall: () => T.wood('#5a3a24') },
  attic: { floor: () => T.wood('#5a4028'), wall: ['#5a4a3a', '#7a6248', '#2a2018', 'panels'], hall: () => T.wood('#4a3420') },
};

// The floor plan for a level with these floors open (indexes into FLOORS).
export function houseLayout(open) {
  const rooms = {}, doors = [];
  for (const f of open) {
    const F = FLOORS[f], X = floorX(f), look = LOOKS[F.mood];
    for (const [id, r] of Object.entries(ROOMS)) {
      const name = id === 'H' ? `${F.name} Hall` : F.rooms[id];
      rooms[F.key + id] = {
        name, short: name, x0: X + r.x0, z0: 1 + r.z0, x1: X + r.x1, z1: 1 + r.z1,
        floor: id === 'H' ? look.hall : look.floor, wall: look.wall,
      };
    }
    for (const d of DOORS) doors.push({ a: F.key + d.r, b: F.key + 'H', x0: X + d.x0, z0: 1 + d.z, x1: X + d.x1, z1: 1 + d.z });
  }
  return {
    w: floorX(4) + 1, h: FH + 3, wallH: 2.8, panels: false,
    wallColor: 0x2a2228, headerColor: 0xc9b48a,
    ceiling: () => T.ceiling(),
    rooms, doors,
  };
}

// Plan metres on floor f.
export const fp = (f, x, z) => [floorX(f) + x, 1 + z];

// ── Building it ─────────────────────────────────────────────────────────

// Everything in the house for these open floors: lamps, furniture, the closets, the stairs and
// the mirrors. Fills d.closets, d.stairs and d.mirrors for the mode.
export function buildHouse(d, open) {
  d.closets = [];
  d.stairs = [];
  d.mirrors = [];
  for (const f of open) buildFloor(d, f, open);
}

function buildFloor(d, f, open) {
  const F = FLOORS[f];
  const at = (x, z) => fp(f, x, z);
  const warm = F.mood === 'concrete' ? 0xbfd0ff : F.mood === 'attic' ? 0xffc890 : 0xffd9a0;
  // lights: one in every room, two down the hall, some of them flickering
  for (const [id, r] of Object.entries(ROOMS)) {
    if (id === 'H') {
      for (const x of [5, 17]) d.lamp(...at(x, 7.5), 2.55, warm, 0.9, { distance: 9, room: F.key + 'H', flicker: f !== 1 && x === 17 });
      continue;
    }
    const cx = (r.x0 + r.x1 + 1) / 2, cz = (r.z0 + r.z1 + 1) / 2;
    d.lamp(...at(cx, cz), 2.5, warm, 0.75, { distance: 8, room: F.key + id, flicker: (f + id.charCodeAt(0)) % 3 === 0 });
  }
  // a sign over every door, so you know where you are
  for (const dr of DOORS) {
    const name = F.rooms[dr.r].toUpperCase();
    const z = dr.z + (dr.r < 'D' ? 1.04 : -0.04);
    d.label(name, ...at((dr.x0 + dr.x1 + 1) / 2, z), 2.45, 1.9, 0.26, dr.r < 'D' ? 'south' : 'north',
      { bg: '#2a1a24', fg: '#f2e2c0', glow: '#c9b48a' });
  }
  furnish(d, f, at);

  // ── The closets
  for (const [id, c] of Object.entries(CLOSETS)) {
    d.closets.push(buildCloset(d, f, F.key + id, F.closets[id], F.rooms[id], at(c.x, c.z), c.facing));
  }

  // ── The stairs, in the middle of the hall against its south wall (between the doors to the
  // rooms below): up on the left, down on the right
  const up = open.includes(f + 1), down = open.includes(f - 1);
  if (up) d.stairs.push(buildStairs(d, f, f + 1, at(10.0, 8.55), 'up'));
  if (down) d.stairs.push(buildStairs(d, f, f - 1, at(14.0, 8.55), 'down'));
  d.label(F.name.toUpperCase(), ...at(0.04, 7.5), 2.3, 1.6, 0.3, 'east', { bg: '#1a1218', fg: '#ffd23f', glow: '#ff9a1f' });
  d.label(F.name.toUpperCase(), ...at(12, 8.96), 2.4, 1.5, 0.28, 'north', { bg: '#1a1218', fg: '#ffd23f', glow: '#ff9a1f' });

  // ── The mirror, on the wall at the hall's east end, looking back down it
  d.mirrors.push(buildMirror(d, f, at(23.96, 7.5)));
}

// A few things in each room so it looks like a house (and the mirrors have something to show).
function furnish(d, f, at) {
  const wood = 0x6a4428, dark = 0x3a2418;
  if (f === 1) {
    // Kitchen: counter, table
    d.counter(...at(0.5, 2.5), 0.9, 3.0, 0.95, 0xe8e0d0, 0xd8d0c0);
    d.table(...at(4.5, 3.2), 1.2, 0.8, 0.76, wood);
    // Living Room: a couch and a TV
    d.block(...at(13.6, 2.8), 0.9, 2.0, 0.7, cloth(0x5a3a5a));
    d.block(...at(9.0, 2.4), 0.4, 1.4, 0.9, lam(0x1a1a1a));
    d.mesh(G.plane, glowMat(0x2a4a8a, 0.15), d.group, { p: [d.place.P(...at(9.21, 2.4), 0.6).x, 0.6, d.place.P(...at(9.21, 2.4)).z], s: [1.1, 0.6, 1], r: [0, Math.PI / 2, 0], shadow: false });
    // Front Hall: the front door (Gramma's way home), a mat
    d.block(...at(23.6, 2.4), 0.2, 1.2, 2.2, lam(0x4a2a1a));
    d.rug(...at(22.3, 2.4), 1.2, 1.4, '#5a2a1a', '#c9a44a');
    // Dining Room: table and chairs
    d.table(...at(5, 12.8), 2.6, 1.2, 0.76, wood);
    for (const x of [4, 6]) { d.chair(...at(x, 11.7)); d.chair(...at(x, 13.9)); }
    // Laundry: washer and dryer
    for (const x of [14, 15.2]) d.block(...at(x, 14.9), 1.0, 0.8, 0.95, lam(0xe8e8e8));
  } else if (f === 2) {
    d.bed(...at(1.4, 2.6), 'east', 0x3a6ab8, { len: 1.6, wid: 0.9 });      // Timmy's bed
    d.block(...at(10.0, 3.8), 1.2, 0.6, 0.85, lam(0xf4f1ea));              // bathroom sink
    d.block(...at(14.6, 2.8), 0.7, 1.6, 0.6, lam(0xf4f1ea));              // tub
    d.bed(...at(22.0, 3.0), 'west', 0x8a4a8a, { len: 1.9, wid: 1.3 });     // Gramma's bed
    d.block(...at(2.2, 12.5), 1.0, 0.7, 0.6, lam(0xd11f2a));               // toy box
    d.bed(...at(20.5, 12.8), 'west', 0x2f7a5a, { len: 1.8, wid: 1.0 });    // guest bed
  } else if (f === 0) {
    // (everything kept clear of the doors and the closets, so you can always get to them)
    d.block(...at(1.0, 3.6), 1.2, 1.2, 2.0, mat(0x5a4a3a, { metal: 0.6, rough: 0.5 }));   // the boiler
    for (const [x, z] of [[9.5, 3.5], [14.6, 3.4]]) d.block(...at(x, z), 0.9, 0.9, 0.8, lam(0x8a6a42));
    d.table(...at(22.6, 3.0), 0.9, 2.2, 0.9, dark);                         // workbench, on the east wall
    d.block(...at(1.5, 12.5), 1.0, 0.8, 0.95, lam(0xc8c8c0));              // the old washer
    d.shelf(...at(22.7, 12.5), 0.4, 3.0, 1.8, 'west', { books: false });
  } else if (f === 3) {
    for (const [x, z] of [[1.5, 3.2], [2.8, 3.6], [9.5, 3.4], [14.5, 3.0], [18.5, 3.5], [21.5, 3.2]]) d.block(...at(x, z), 0.8, 0.8, 0.7, lam(0x7a5a3a));
    d.bed(...at(2.2, 12.6), 'east', 0x6a5a4a, { len: 1.8, wid: 1.0 });     // the old bed
    d.block(...at(20, 12.5), 0.3, 4.0, 1.4, lam(0x4a3420), { solid: true }); // a fallen rafter
  }
  // a rug down every hall
  d.rug(...at(12, 7.5), 16, 1.2, f === 0 ? '#3a3a3a' : '#5a1f2a', '#c9a44a');
}

// A closet: a tall cupboard against the wall with a door that swings out. Inside, in the dark:
// whatever's hiding there (mode.js puts its animatronic in `slot`), and a pair of eyes that
// glow when the door opens a crack.
function buildCloset(d, f, id, name, room, [px, pz], facing) {
  const g = d.anchor(px, pz, facing, 0);
  const W = 1.3, H = 2.2, D = 0.9;
  const wood = lam(f === 0 ? 0x4a4038 : f === 3 ? 0x5a4230 : 0x6a4a30), dark = lam(0x050404);
  d.mesh(G.box, wood, g, { p: [0, H / 2, -D / 2 + 0.04], s: [W, H, 0.08] });            // back
  for (const sx of [-1, 1]) d.mesh(G.box, wood, g, { p: [sx * (W / 2 - 0.04), H / 2, 0], s: [0.08, H, D] });
  d.mesh(G.box, wood, g, { p: [0, H - 0.04, 0], s: [W, 0.08, D] });                     // top
  // the dark inside: a black back and sides, so whatever's in there stands in the dark
  d.mesh(G.box, dark, g, { p: [0, H / 2, -D / 2 + 0.09], s: [W - 0.16, H - 0.16, 0.02] }, );
  for (const sx of [-1, 1]) d.mesh(G.box, dark, g, { p: [sx * (W / 2 - 0.09), H / 2, 0], s: [0.02, H - 0.16, D - 0.12] });
  // the door, on a hinge at its left edge
  const hinge = new THREE.Group();
  hinge.position.set(-W / 2 + 0.06, 0, D / 2);
  g.add(hinge);
  const door = new THREE.Mesh(G.box, wood);
  door.position.set((W - 0.12) / 2, H / 2, 0.02);
  door.scale.set(W - 0.12, H - 0.1, 0.05);
  door.castShadow = true;
  hinge.add(door);
  for (const y of [0.7, 1.55]) {
    const panel = new THREE.Mesh(G.box, lam(f === 0 ? 0x3a322a : 0x5a3a26));
    panel.position.set((W - 0.12) / 2, y, 0.05);
    panel.scale.set(W - 0.42, 0.6, 0.02);
    hinge.add(panel);
  }
  const knob = new THREE.Mesh(G.sphere, mat(0xc9a44a, { metal: 0.8, rough: 0.3 }));
  knob.position.set(W - 0.26, 1.05, 0.08);
  knob.scale.setScalar(0.045);
  hinge.add(knob);
  // the eyes in the crack (their colour is set to whoever's in there)
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyes = new THREE.Group();
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(G.sphere, eyeMat);
    e.position.set(0.36 + sx * 0.08, 1.62, D / 2 - 0.1);
    e.scale.setScalar(0.035);
    eyes.add(e);
  }
  eyes.visible = false;
  g.add(eyes);
  // Gus's eyes, only in a mirror (layer 1): peering out of the crack of the door he's behind
  const gusEyes = new THREE.Group();
  const gusMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffa21f).multiplyScalar(2.5) });
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(G.sphere, gusMat);
    e.position.set(sx * 0.1, 1.68, D / 2 + 0.09);
    e.scale.setScalar(0.05);
    e.layers.set(1);
    gusEyes.add(e);
  }
  gusEyes.visible = false;
  g.add(gusEyes);
  // where the animatronic stands inside
  const slot = new THREE.Group();
  slot.position.set(0, 0, -0.12);
  g.add(slot);
  const along = facing === 'north' || facing === 'south';
  const bw = along ? W : D, bd = along ? D : W;
  d.place.addBlock(px - bw / 2, pz - bd / 2, px + bw / 2, pz + bd / 2, H);
  const front = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), FACE[facing]);
  const pos = d.place.P(px, pz);
  return {
    id, name, room, floor: f, group: g, hinge, eyes, eyeMat, gusEyes, slot, facing,
    pos, front,
    face: pos.clone().addScaledVector(front, D / 2 + 0.75),        // where you stand to hold it
    // a hiding spot inside, for the engine's hide(): you look out through the crack
    hide: {
      id: `closet-${id}`, kind: 'closet', name: `Hide in ${name}`, pos, yaw: FACE[facing] + Math.PI, group: null,
      eye: pos.clone().addScaledVector(front, 0.05).setY(1.0),
      out: pos.clone().addScaledVector(front, D / 2 + 0.65),
    },
  };
}

// Stairs, against the hall's south wall, facing into the hall: steps climbing up into the wall
// (or a dark hole going down), with an arrow sign over them.
function buildStairs(d, f, to, [px, pz], dir) {
  const g = d.anchor(px, pz, 'north', 0);
  const a = lam(0x5a3a24), b = lam(0x4a2e1c);
  if (dir === 'up') {
    for (let k = 0; k < 5; k++) {
      const h = 0.16 + k * 0.17;
      d.mesh(G.box, k % 2 ? b : a, g, { p: [0, h / 2, 0.22 - k * 0.1], s: [1.2, h, 0.12] });
    }
  } else {
    d.mesh(G.box, lam(0x020202), g, { p: [0, 0.012, 0.05], s: [1.2, 0.02, 0.5], shadow: false });
    for (let k = 0; k < 3; k++) d.mesh(G.box, k % 2 ? b : a, g, { p: [0, 0.02, 0.24 - k * 0.12], s: [1.2, 0.02, 0.1], shadow: false });
  }
  d.label(dir === 'up' ? `⬆ UP: ${FLOORS[to].name.toUpperCase()}` : `⬇ DOWN: ${FLOORS[to].name.toUpperCase()}`,
    px, pz + 0.4, 1.95, 1.4, 0.24, 'north', { bg: '#1a1218', fg: '#f2e2c0', glow: '#ffd23f' });
  const pos = d.place.P(px, pz);
  const front = new THREE.Vector3(0, 0, -1);
  return { floor: f, to, dir, pos, front, point: pos.clone().addScaledVector(front, 0.55), reach: 1.4 };
}

// A mirror: a frame on the wall and a glass that mode.js draws its reflection into.
function buildMirror(d, f, [px, pz]) {
  const g = d.anchor(px, pz, 'west', 1.45);
  d.mesh(G.box, lam(0xb08a3a), g, { p: [0, 0, -0.02], s: [1.2, 1.6, 0.05] });
  const glass = new THREE.MeshBasicMaterial({ color: 0x8a96a0 });
  const mesh = new THREE.Mesh(G.plane, glass);
  mesh.position.set(0, 0, 0.01);
  mesh.scale.set(-1.04, 1.44, 1);     // (flipped left to right: it's a mirror)
  glass.side = THREE.DoubleSide;
  g.add(mesh);
  const pos = d.place.P(px, pz, 1.45);
  return { floor: f, mesh, glass, pos, normal: new THREE.Vector3(-1, 0, 0), group: g };
}
