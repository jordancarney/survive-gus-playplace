// Culac's Daycare, from the designer's map (gallery/culacs-daycare-map.jpg). It's square: he
// labelled it 10 miles a side, 7 for the building on the left and 3 for the strip on the right,
// and asked for it to take Jimmy 9.57 minutes to walk up, down or across — 2,182 m at his
// walking speed. Plan metres, x to the east and z to the south, on the same 1 m grid as every
// other map (place.js has the Building that can cope with one this big).
//
//   ┌ Pool ──────┐  ┌ Beds ───────────────────┐ │ Forest Area, │ Play  │
//   │ Deep Zone  │  └─────────────────────────┘ │ with a trail │ Area  │
//   │  ~ swim ~  │  ┌ Play Structure ─┐  Owl's  │ and          │       │
//   └────────────┘  │                 │  Café   │ animatronics │       │
//   ┌ Arcade ────┐  │                 │  Pet    ├──────────────┴───────┤
//   └────────────┘  └─────────────────┘  Zone   │ Slides (into the pit)│
//   ┌ Maze ──┐  ┌ Meal Zone ┐  Baby Zone        ├──────────────────────┤
//   │        │  └───────────┘  ┌ Bathroom ┐     │ Ball Pit             │
//   │        │  ┌ Security ─┐  │          │     │                      │
//   └────────┘  └───────────┘  └──────────┘     └──────────────────────┘
//
// Everything between the rooms on the left is the hallway (the building's own big carpet),
// and the rooms are partition walls in one enormous hall under a roof well above them.
import * as T from '../textures.js';

export const SIZE = 2184;          // grid cells a side: 2,182 m of floor between the outside walls
export const WALL_H = 6.5;         // the rooms' partition walls
export const CEIL_H = 13;          // the roof, high over everything (Ouchie flies up there)

// ── The rooms ───────────────────────────────────────────────────────────

const grass = () => T.carpet('#1e3a1a');

export const ROOMS = {
  // (first, so every room after it is carved out of it)
  H: { name: 'Hallway', x0: 1, z0: 1, x1: 1525, z1: 2182, mapLabel: false, mapColor: '#1a1030',
       floor: () => T.carpet('#2a2050'), wall: ['#ffb8d0', '#ffd23f', '#5aa86a', 'bubbles'] },
  P: { name: 'Pool', x0: 1, z0: 1, x1: 640, z1: 960,
       floor: () => T.tiles('#d8eef4', '#9cc4d0'), wall: ['#bfe9ff', '#ffffff', '#3a8ab8', 'panels'] },
  B: { name: 'Beds', x0: 742, z0: 1, x1: 1500, z1: 330,
       floor: () => T.carpet('#1b2a5a'), wall: ['#2a3a7a', '#ffd23f', '#1a2450', 'stars'] },
  O: { name: "Owl's Café", short: 'Café', x0: 1352, z0: 382, x1: 1500, z1: 520,
       floor: () => T.wood('#8a5a32'), wall: ['#d8b890', '#6a3a1a', '#4a2a14', 'stripes'] },
  S: { name: 'Play Structure', short: 'Play Structure', x0: 702, z0: 502, x1: 1310, z1: 1130,
       floor: () => T.playmat(), wall: ['#ff9a1f', '#ffd23f', '#d11f2a', 'bubbles'] },
  Z: { name: 'Pet Zone', x0: 1352, z0: 762, x1: 1500, z1: 920,
       floor: grass, wall: ['#9fd89a', '#ffffff', '#4a8a4a', 'stripes'] },
  A: { name: 'Arcade', x0: 1, z0: 992, x1: 680, z1: 1150,
       floor: () => T.carpet('#1b1440'), wall: ['#2a1050', '#ff3fa4', '#120830', 'stars'] },
  M: { name: 'Meal Zone', x0: 702, z0: 1202, x1: 1140, z1: 1740,
       floor: () => T.checker(), wall: ['#ffe08a', '#d11f2a', '#c05a1a', 'stripes'] },
  Y: { name: 'Baby Zone', x0: 1222, z0: 1182, x1: 1490, z1: 1440,
       floor: () => T.playmat(), wall: ['#ffd0e8', '#ffffff', '#a8d8ff', 'bubbles'] },
  R: { name: 'Bathroom', x0: 1192, z0: 1492, x1: 1490, z1: 2182,
       floor: () => T.tiles(), wall: ['#cfe8f0', '#ffffff', '#6a9ab8', 'panels'] },
  C: { name: 'Security Office', short: 'Security', x0: 662, z0: 1872, x1: 1140, z1: 2182,
       floor: () => T.concrete(), wall: ['#4a4d55', '#2a3a6a', '#2b2d33', 'bricks'] },
  Q: { name: 'Maze', x0: 1, z0: 1202, x1: 608, z1: 2182, foggy: true,
       floor: () => T.carpet('#2a1a3a'), wall: ['#6a5a8a', '#a08ac0', '#3a2a5a', 'panels'] },
  // the strip on the right
  F: { name: 'Forest Area', short: 'Forest', x0: 1527, z0: 1, x1: 1880, z1: 1130,
       floor: grass, wall: ['#1a2a20', '#2a4a30', '#101810', 'stripes'] },
  L: { name: 'Play Area', x0: 1882, z0: 1, x1: 2182, z1: 1130,
       floor: grass, wall: ['#1a2a20', '#2a4a30', '#101810', 'stripes'] },
  D: { name: 'Slides', x0: 1527, z0: 1132, x1: 2182, z1: 1680,
       floor: () => T.playmat(), wall: ['#3ec1d3', '#ffd23f', '#2a4fa0', 'bubbles'] },
  K: { name: 'Ball Pit', x0: 1527, z0: 1682, x1: 2182, z1: 2182,
       floor: () => T.playmat(), wall: ['#2a4fa0', '#ffd23f', '#ff3fa4', 'bubbles'] },
};

for (const [id, r] of Object.entries(ROOMS)) if (id !== 'H') r.outline = true;
// (the shortest names, for the little map on the Gus Watch)
Object.assign(ROOMS.S, { mapShort: 'PLAY' }); Object.assign(ROOMS.M, { mapShort: 'MEAL' });
Object.assign(ROOMS.Y, { mapShort: 'BABY' }); Object.assign(ROOMS.R, { mapShort: 'BATH' });
Object.assign(ROOMS.Z, { mapShort: 'PETS' }); Object.assign(ROOMS.O, { mapShort: 'CAFÉ' });
Object.assign(ROOMS.F, { mapShort: 'FOREST' }); Object.assign(ROOMS.L, { mapShort: 'PLAY' });
Object.assign(ROOMS.C, { mapShort: 'GUARD' }); Object.assign(ROOMS.K, { mapShort: 'BALLS' });

// The rooms inside the hallway each have a wall all the way round (the ones on the right are
// separated by the walls between them, which are just cells no room owns).
const INNER = ['P', 'B', 'O', 'S', 'Z', 'A', 'M', 'Y', 'R', 'C', 'Q'];

function ring(r) {
  const x0 = r.x0 - 1, x1 = r.x1 + 1, z0 = r.z0 - 1, z1 = r.z1 + 1;
  return [
    { x0, z0, x1, z1: z0 }, { x0, z0: z1, x1, z1 },
    { x0, z0, x1: x0, z1 }, { x0: x1, z0, x1, z1 },
  ];
}

// ── The doors ───────────────────────────────────────────────────────────
//
// A door is `w` cells carved out of a room's wall on one `side`, centred `at` along it.

function door(a, b, side, at, w = 8) {
  const r = ROOMS[a];
  const h = Math.floor(w / 2);
  if (side === 'n') return { a, b, x0: at - h, z0: r.z0 - 1, x1: at - h + w - 1, z1: r.z0 - 1 };
  if (side === 's') return { a, b, x0: at - h, z0: r.z1 + 1, x1: at - h + w - 1, z1: r.z1 + 1 };
  if (side === 'w') return { a, b, x0: r.x0 - 1, z0: at - h, x1: r.x0 - 1, z1: at - h + w - 1 };
  return { a, b, x0: r.x1 + 1, z0: at - h, x1: r.x1 + 1, z1: at - h + w - 1 };
}

// ── The maze ────────────────────────────────────────────────────────────
//
// A real, giant maze (like the Play Maze at the PlayPlace, but much bigger): 10 m cells, an
// 8 m corridor and a 2 m wall, carved from a fixed seed so it's the same every time, with
// some dead ends knocked through so there are loops, and a clearing in the middle where Sunny
// lives.

export const MAZE_PITCH = 10;

function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bigMaze(r, { seed, braid, open }) {
  const P = MAZE_PITCH, C = P - 2;
  const W = r.x1 - r.x0 + 1, H = r.z1 - r.z0 + 1;
  const cw = Math.floor((W + 2) / P), ch = Math.floor((H + 2) / P);
  const rand = seeded(seed);
  // passages[j][i]: 1 = open to the east, 2 = open to the south
  const pass = Array.from({ length: ch }, () => new Uint8Array(cw));
  const seen = Array.from({ length: ch }, () => new Uint8Array(cw));
  const knock = (i, j, di, dj) => {
    if (di > 0) pass[j][i] |= 1;
    else if (di < 0) pass[j][i - 1] |= 1;
    else if (dj > 0) pass[j][i] |= 2;
    else pass[j - 1][i] |= 2;
  };
  const isOpen = (i, j, di, dj) => (di > 0 ? pass[j][i] & 1 : di < 0 ? pass[j][i - 1] & 1 : dj > 0 ? pass[j][i] & 2 : pass[j - 1][i] & 2);
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const inside = (i, j) => i >= 0 && j >= 0 && i < cw && j < ch;
  const stack = [[0, 0]];
  seen[0][0] = 1;
  while (stack.length) {
    const [i, j] = stack[stack.length - 1];
    const next = D4.filter(([di, dj]) => inside(i + di, j + dj) && !seen[j + dj][i + di]);
    if (!next.length) { stack.pop(); continue; }
    const [di, dj] = next[Math.floor(rand() * next.length)];
    knock(i, j, di, dj);
    seen[j + dj][i + di] = 1;
    stack.push([i + di, j + dj]);
  }
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
    const shut = D4.filter(([di, dj]) => inside(i + di, j + dj) && !isOpen(i, j, di, dj));
    const all = D4.filter(([di, dj]) => inside(i + di, j + dj)).length;
    if (all - shut.length === 1 && rand() < braid) knock(i, j, ...shut[Math.floor(rand() * shut.length)]);
  }
  for (const [i0, j0, i1, j1] of open) for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    if (i < i1) pass[j][i] |= 1;
    if (j < j1) pass[j][i] |= 2;
  }
  // the walls left standing, as rectangles: each cell's east and south wall (if it's
  // shut), and the post at its corner
  const out = [];
  const add = (x0, z0, x1, z1) => out.push({ x0: r.x0 + x0, z0: r.z0 + z0, x1: r.x0 + Math.min(W - 1, x1), z1: r.z0 + Math.min(H - 1, z1) });
  const cleared = (i, j) => open.some(([i0, j0, i1, j1]) => i >= i0 && i < i1 && j >= j0 && j < j1);
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
    const x = i * P, z = j * P;
    if (i < cw - 1 && !(pass[j][i] & 1)) add(x + C, z, x + C + 1, z + C - 1);
    if (j < ch - 1 && !(pass[j][i] & 2)) add(x, z + C, x + C - 1, z + C + 1);
    if (i < cw - 1 && j < ch - 1 && !cleared(i, j)) add(x + C, z + C, x + C + 1, z + C + 1);
  }
  // whatever's left over at the far edges is wall
  if (cw * P - 2 < W) add(cw * P - 2, 0, W - 1, H - 1);
  if (ch * P - 2 < H) add(0, ch * P - 2, W - 1, H - 1);
  return { walls: out, cw, ch };
}

// Sunny's clearing, in maze cells.
export const MAZE_HOME = [28, 46, 32, 50];
const MAZE = bigMaze(ROOMS.Q, { seed: 2025, braid: 0.45, open: [MAZE_HOME] });
// The middle of maze cell (i, j), in plan metres.
export const mazeCell = (i, j) => [ROOMS.Q.x0 + i * MAZE_PITCH + 4, ROOMS.Q.z0 + j * MAZE_PITCH + 4];
// A door into the maze has to line up with a corridor: the corridor of cell `i` (or row `j`).
const mazeCol = (i) => ROOMS.Q.x0 + i * MAZE_PITCH + 4;
const mazeRow = (j) => ROOMS.Q.z0 + j * MAZE_PITCH + 4;

// ── Walls between the rooms on the right ────────────────────────────────

// Forest | Play Area: a line of trees, really, with wide gaps in it.
const FOREST_EDGE = [];
{
  let z = 1;
  for (const gap of [100, 400, 700, 1000]) {
    FOREST_EDGE.push({ x0: 1881, z0: z, x1: 1881, z1: gap - 7 });
    z = gap + 7;
  }
  FOREST_EDGE.push({ x0: 1881, z0: z, x1: 1881, z1: 1130 });
}

export const DOORS = [
  // the Pool: out to the hallway
  door('P', 'H', 'e', 300), door('P', 'H', 'e', 700), door('P', 'H', 's', 320),
  // the Arcade
  door('A', 'H', 'n', 520), door('A', 'H', 'e', 1070), door('A', 'H', 's', 300),
  // the Beds
  door('B', 'H', 's', 900), door('B', 'H', 's', 1150), door('B', 'H', 's', 1400), door('B', 'H', 'w', 200),
  // Owl's Café
  door('O', 'H', 'w', 450), door('O', 'H', 's', 1420), door('O', 'H', 'n', 1440, 6),
  // the Play Structure
  door('S', 'H', 'n', 1000, 10), door('S', 'H', 'w', 800, 10), door('S', 'H', 'e', 650, 10), door('S', 'H', 'e', 1000, 10), door('S', 'H', 's', 900, 10),
  // the Pet Zone
  door('Z', 'H', 'w', 840), door('Z', 'H', 'n', 1420),
  // the Meal Zone
  door('M', 'H', 'n', 920, 10), door('M', 'H', 'w', 1500), door('M', 'H', 'e', 1300), door('M', 'H', 'e', 1650), door('M', 'H', 's', 900),
  // the Baby Zone
  door('Y', 'H', 'w', 1300), door('Y', 'H', 'n', 1350),
  // the Bathroom
  door('R', 'H', 'n', 1340), door('R', 'H', 'w', 1700), door('R', 'H', 'w', 2000),
  // the Security Office
  door('C', 'H', 'n', 900), door('C', 'H', 'w', 2000), door('C', 'H', 'e', 1950),
  // the Maze: one way in at the top, two on the side (each lined up with a corridor)
  door('Q', 'H', 'n', mazeCol(30)), door('Q', 'H', 'e', mazeRow(30)), door('Q', 'H', 'e', mazeRow(70)),
  // through the wall down the middle, to the strip on the right
  ...[160, 640, 1000].map((z) => ({ a: 'H', b: 'F', x0: 1526, z0: z - 6, x1: 1526, z1: z + 5 })),
  ...[1300, 1550].map((z) => ({ a: 'H', b: 'D', x0: 1526, z0: z - 6, x1: 1526, z1: z + 5 })),
  ...[1800, 2080].map((z) => ({ a: 'H', b: 'K', x0: 1526, z0: z - 6, x1: 1526, z1: z + 5 })),
  // the Forest and the Play Area to the Slides, and the Slides down to the Ball Pit
  ...[1600, 1800].map((x) => ({ a: 'F', b: 'D', x0: x - 6, z0: 1131, x1: x + 5, z1: 1131 })),
  { a: 'L', b: 'D', x0: 1994, z0: 1131, x1: 2005, z1: 1131 },
  ...[1620, 1745, 1900, 2100].map((x) => ({ a: 'D', b: 'K', x0: x - 6, z0: 1681, x1: x + 5, z1: 1681 })),
];

export const CULAC_LAYOUT = {
  w: SIZE, h: SIZE, wallH: WALL_H, ceilH: CEIL_H, panels: false, doorTop: 4.2,
  wallColor: 0x2a2240, headerColor: 0xe8d8a0,
  ceiling: () => T.tiles('#22203a', '#17152a'),
  rooms: ROOMS,
  doors: DOORS,
  walls: [...INNER.flatMap((id) => ring(ROOMS[id])), ...FOREST_EDGE, ...MAZE.walls],
};

// ── Where things are ────────────────────────────────────────────────────

// The Beds: Jimmy's bed and the kids sleeping near him, in the middle of the room.
export const BEDS = {
  jimmy: [1130, 262],
  // the kids he's looking after, on the beds all round his (Leo's is right beside him)
  kids: [[1126.4, 262], [1133.6, 262], [1122.8, 262], [1137.2, 262], [1126.4, 257], [1130, 257], [1133.6, 257], [1122.8, 257], [1137.2, 257]],
  // where the animatronics go to get one
  raid: [1130, 268],
};

// Where each of them starts (the designer's map), and the rooms they like.
export const HOMES = {
  flipper: [560, 640],
  moony: [560, 1070],
  sunny: mazeCell(30, 48),
  gerald: [1660, 870],
  chomper: [1900, 1760],
  sparky: [1425, 840],
  roglego: [1000, 600],
  ouchie: [1430, 450],
  meanbaby: [1350, 1300],
  gokupug: [1440, 1220],
  grumble: [900, 2010],
};

// The ten ways out, one a night (the designer: "every night the way out is somewhere
// different"). Each is the floor just inside an outside wall, and which way it faces.
export const EXITS = {
  beds: { at: [1200, 1.6], face: 'south', label: 'FIRE EXIT' },
  pool: { at: [330, 1.6], face: 'south', label: 'POOL DOOR' },
  arcade: { at: [1.6, 1070], face: 'east', label: 'PRIZE DOOR' },
  forest: { at: [1700, 1.6], face: 'south', label: 'TRAIL GATE' },
  slides: { at: [2181.4, 1400], face: 'west', label: 'SLIDE EXIT' },
  maze: { at: [1.6, mazeRow(80)], face: 'east', label: 'SECRET DOOR' },
  bathroom: { at: [1340, 2181.4], face: 'north', label: 'WINDOW' },
  ballpit: { at: [2181.4, 1950], face: 'west', label: 'BACK DOOR' },
  play: { at: [2181.4, 600], face: 'west', label: 'PLAY GATE' },
  front: { at: [900, 2181.4], face: 'north', label: 'FRONT DOORS' },
};
