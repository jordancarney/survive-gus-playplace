// The floor plan of Gus's PlayPlace: rooms, doors, walls, collision, line of sight and the
// navigation grid the animatronics walk on.
//
// Everything is laid out on a 1 m grid in "plan" coordinates — metres from the building's
// north-west corner, x to the east, z to the south. Rooms are rectangles of cells with a
// one-cell wall between neighbours; a door is a few wall cells carved open. World space is
// the plan shifted so the building is centred on the origin.
import * as THREE from 'three';
import * as T from './textures.js';

export const GRID_W = 60;
export const GRID_H = 44;
export const WALL_H = 4.6;
const OX = GRID_W / 2;
const OZ = GRID_H / 2;

// Plan metres → world. `y` is passed through so call sites read naturally.
export const P = (px, pz, y = 0) => new THREE.Vector3(px - OX, y, pz - OZ);
export const planOf = (x, z) => ({ px: x + OX, pz: z + OZ });

// Inclusive cell bounds. `floor` and `wall` pick the room's look.
export const ROOMS = {
  K: { name: 'Kitchen',         x0: 1,  z0: 1,  x1: 13, z1: 11,
       floor: () => T.tiles('#dfe6e9', '#b5c0c4'), wall: ['#e8f1f2', '#ff5a5f', '#2d6a73', 'panels'] },
  J: { name: 'Parts & Service', x0: 1,  z0: 13, x1: 13, z1: 23,
       floor: () => T.concrete(), wall: ['#4a4d55', '#f2c230', '#2b2d33', 'bricks'] },
  B: { name: 'Ball Pit',        x0: 1,  z0: 25, x1: 13, z1: 42,
       floor: () => T.playmat(), wall: ['#3a2a7a', '#ffd23f', '#1f9fbf', 'bubbles'] },
  D: { name: 'Show Stage',      x0: 15, z0: 1,  x1: 44, z1: 23,
       floor: () => T.checker(), wall: ['#3b1a5a', '#ff3fa4', '#1d1c24', 'stars'] },
  H: { name: 'Main Hall',       x0: 15, z0: 25, x1: 44, z1: 30,
       floor: () => T.checker('#ece8f5', '#26243a'), wall: ['#24345e', '#2de2e6', '#1d1c24', 'stripes'] },
  T: { name: 'Slide Tower',     x0: 15, z0: 32, x1: 29, z1: 42,
       floor: () => T.playmat(), wall: ['#1f6f5a', '#ffd23f', '#ff5a5f', 'bubbles'] },
  O: { name: 'Security Office', x0: 31, z0: 32, x1: 38, z1: 42,
       floor: () => T.tiles('#8e9aa0', '#6c777c'), wall: ['#5a6670', '#3e4a52', '#2c3238', 'panels'] },
  E: { name: 'Lobby',           x0: 40, z0: 32, x1: 44, z1: 42,
       floor: () => T.checker('#f2f0ea', '#5a1f4f'), wall: ['#5a1f4f', '#ffd23f', '#1d1c24', 'stars'] },
  P: { name: 'Party Room',      x0: 46, z0: 1,  x1: 58, z1: 11,
       floor: () => T.carpet('#3a1450'), wall: ['#ff7eb6', '#ffd23f', '#7a2a8a', 'stars'] },
  A: { name: 'Arcade',          x0: 46, z0: 13, x1: 58, z1: 27,
       floor: () => T.carpet('#120e33'), wall: ['#120e33', '#2de2e6', '#ff3fa4', 'stars'] },
  R: { name: 'Prize Counter',   x0: 46, z0: 29, x1: 58, z1: 42,
       floor: () => T.carpet('#14304a'), wall: ['#ffd23f', '#ff3fa4', '#2a4fa0', 'stripes'] },
};

// Inclusive wall cells to carve open, and the two rooms each door joins.
export const DOORS = [
  { a: 'K', b: 'D', x0: 14, z0: 5,  x1: 14, z1: 7 },
  { a: 'J', b: 'D', x0: 14, z0: 17, x1: 14, z1: 19 },
  { a: 'K', b: 'J', x0: 6,  z0: 12, x1: 8,  z1: 12 },
  { a: 'B', b: 'H', x0: 14, z0: 26, x1: 14, z1: 28 },
  { a: 'B', b: 'T', x0: 14, z0: 36, x1: 14, z1: 38 },
  { a: 'D', b: 'H', x0: 20, z0: 24, x1: 23, z1: 24 },
  { a: 'D', b: 'H', x0: 36, z0: 24, x1: 39, z1: 24 },
  { a: 'D', b: 'P', x0: 45, z0: 5,  x1: 45, z1: 7 },
  { a: 'D', b: 'A', x0: 45, z0: 17, x1: 45, z1: 19 },
  { a: 'P', b: 'A', x0: 51, z0: 12, x1: 53, z1: 12 },
  { a: 'H', b: 'A', x0: 45, z0: 25, x1: 45, z1: 27 },
  { a: 'A', b: 'R', x0: 51, z0: 28, x1: 53, z1: 28 },
  { a: 'T', b: 'H', x0: 20, z0: 31, x1: 23, z1: 31 },
  { a: 'O', b: 'H', x0: 33, z0: 31, x1: 35, z1: 31 },
  { a: 'E', b: 'H', x0: 41, z0: 31, x1: 43, z1: 31 },
  { a: 'O', b: 'E', x0: 39, z0: 38, x1: 39, z1: 40 },
];

const WALL = '#';

// ── A* over the walkable grid ───────────────────────────────────────────

class Heap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(node, f) {
    const a = this.a;
    a.push([f, node]);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top[1];
  }
}

const DIRS = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
];

export class PlayPlace {
  constructor() {
    this.grid = [];
    for (let z = 0; z < GRID_H; z++) this.grid.push(new Array(GRID_W).fill(WALL));
    for (const [id, r] of Object.entries(ROOMS)) {
      for (let z = r.z0; z <= r.z1; z++) for (let x = r.x0; x <= r.x1; x++) this.grid[z][x] = id;
    }
    // Door cells belong to their first room, so "which room am I in" always has an answer.
    for (const d of DOORS) {
      for (let z = d.z0; z <= d.z1; z++) for (let x = d.x0; x <= d.x1; x++) this.grid[z][x] = d.a;
    }
    this.walkable = new Uint8Array(GRID_W * GRID_H);
    for (let z = 0; z < GRID_H; z++) for (let x = 0; x < GRID_W; x++) {
      this.walkable[z * GRID_W + x] = this.grid[z][x] !== WALL ? 1 : 0;
    }
    this.colliders = [];
    this.raised = [];        // walkable platforms: { x0, z0, x1, z1, h } in world space
    this.slowZones = [];     // the ball pit
    this.group = new THREE.Group();
    this.ceilingLights = [];
  }

  // ── Queries ───────────────────────────────────────────────────────────

  cell(x, z) {
    const cx = Math.floor(x + OX), cz = Math.floor(z + OZ);
    if (cx < 0 || cz < 0 || cx >= GRID_W || cz >= GRID_H) return WALL;
    return this.grid[cz][cx];
  }

  roomAt(x, z) {
    const c = this.cell(x, z);
    return c === WALL ? null : c;
  }

  isWalkable(x, z) {
    const cx = Math.floor(x + OX), cz = Math.floor(z + OZ);
    if (cx < 0 || cz < 0 || cx >= GRID_W || cz >= GRID_H) return false;
    return this.walkable[cz * GRID_W + cx] === 1;
  }

  floorAt(x, z) {
    for (const r of this.raised) {
      if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) return r.h;
    }
    return 0;
  }

  inSlowZone(x, z) {
    for (const r of this.slowZones) {
      if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) return true;
    }
    return false;
  }

  // Walls block sight; furniture doesn't. Cheap enough to call a few hundred times a frame.
  sightClear(a, b) {
    const dx = b.x - a.x, dz = b.z - a.z;
    const d = Math.hypot(dx, dz);
    const n = Math.ceil(d / 0.25);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      if (this.cell(a.x + dx * t, a.z + dz * t) === WALL) return false;
    }
    return true;
  }

  // Can something of radius `r` walk a straight line from a to b?
  walkClear(a, b, r = 0.45) {
    const dx = b.x - a.x, dz = b.z - a.z;
    const d = Math.hypot(dx, dz);
    if (d < 1e-4) return true;
    const nx = -dz / d * r, nz = dx / d * r;
    const n = Math.ceil(d / 0.3);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = a.x + dx * t, z = a.z + dz * t;
      if (!this.isWalkable(x, z) || !this.isWalkable(x + nx, z + nz) || !this.isWalkable(x - nx, z - nz)) return false;
    }
    return true;
  }

  nearestWalkable(cx, cz) {
    if (this.walkable[cz * GRID_W + cx]) return [cx, cz];
    for (let r = 1; r < 8; r++) {
      for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
        const x = cx + dx, z = cz + dz;
        if (x < 0 || z < 0 || x >= GRID_W || z >= GRID_H) continue;
        if (this.walkable[z * GRID_W + x]) return [x, z];
      }
    }
    return [cx, cz];
  }

  // World-space waypoints from `from` to `to`, smoothed so walkers cut corners naturally.
  findPath(from, to) {
    const W = GRID_W;
    const clampC = (v, m) => Math.max(0, Math.min(m - 1, v));
    const [sx, sz] = this.nearestWalkable(clampC(Math.floor(from.x + OX), W), clampC(Math.floor(from.z + OZ), GRID_H));
    const [gx, gz] = this.nearestWalkable(clampC(Math.floor(to.x + OX), W), clampC(Math.floor(to.z + OZ), GRID_H));
    const start = sz * W + sx, goal = gz * W + gx;
    if (start === goal) return [new THREE.Vector3(to.x, 0, to.z)];

    const g = new Float32Array(W * GRID_H).fill(Infinity);
    const came = new Int32Array(W * GRID_H).fill(-1);
    const closed = new Uint8Array(W * GRID_H);
    const h = (i) => {
      const dx = Math.abs((i % W) - gx), dz = Math.abs(Math.floor(i / W) - gz);
      return Math.max(dx, dz) + (Math.SQRT2 - 1) * Math.min(dx, dz);
    };
    const open = new Heap();
    g[start] = 0;
    open.push(start, h(start));
    let found = false;
    while (open.size) {
      const cur = open.pop();
      if (cur === goal) { found = true; break; }
      if (closed[cur]) continue;
      closed[cur] = 1;
      const cx = cur % W, cz = Math.floor(cur / W);
      for (const [dx, dz, cost] of DIRS) {
        const nx = cx + dx, nz = cz + dz;
        if (nx < 0 || nz < 0 || nx >= W || nz >= GRID_H) continue;
        const ni = nz * W + nx;
        if (!this.walkable[ni] || closed[ni]) continue;
        // no cutting a corner diagonally through a wall
        if (dx && dz && (!this.walkable[cz * W + nx] || !this.walkable[nz * W + cx])) continue;
        const ng = g[cur] + cost;
        if (ng < g[ni]) {
          g[ni] = ng;
          came[ni] = cur;
          open.push(ni, ng + h(ni));
        }
      }
    }
    if (!found) return [];

    const cells = [];
    for (let i = goal; i !== -1; i = came[i]) cells.push(i);
    cells.reverse();
    const pts = cells.map((i) => new THREE.Vector3((i % W) + 0.5 - OX, 0, Math.floor(i / W) + 0.5 - OZ));
    pts[pts.length - 1].set(to.x, 0, to.z);

    // String-pull: from each point, jump to the farthest one we can walk to in a line.
    const out = [];
    let i = 0;
    let at = new THREE.Vector3(from.x, 0, from.z);
    while (i < pts.length - 1) {
      let j = pts.length - 1;
      while (j > i + 1 && !this.walkClear(at, pts[j])) j--;
      out.push(pts[j]);
      at = pts[j];
      i = j;
    }
    if (!out.length) out.push(pts[pts.length - 1]);
    return out;
  }

  randomPointIn(roomId, rand = Math.random) {
    const r = ROOMS[roomId];
    for (let tries = 0; tries < 40; tries++) {
      const px = r.x0 + 0.5 + rand() * (r.x1 - r.x0);
      const pz = r.z0 + 0.5 + rand() * (r.z1 - r.z0);
      const p = P(px, pz);
      if (this.isWalkable(p.x, p.z) && this.isWalkable(p.x + 0.5, p.z) && this.isWalkable(p.x - 0.5, p.z) &&
          this.isWalkable(p.x, p.z + 0.5) && this.isWalkable(p.x, p.z - 0.5)) return p;
    }
    return P((r.x0 + r.x1) / 2 + 0.5, (r.z0 + r.z1) / 2 + 0.5);
  }

  roomCenter(roomId) {
    const r = ROOMS[roomId];
    return P((r.x0 + r.x1 + 1) / 2, (r.z0 + r.z1 + 1) / 2);
  }

  // ── Building it ───────────────────────────────────────────────────────

  // An axis-aligned solid box (plan coordinates, metres). Blocks movement and, unless
  // `nav` is false, takes its cells off the walking grid.
  addBlock(px0, pz0, px1, pz1, h, { nav = true, margin = 0.3 } = {}) {
    const a = P(px0, pz0), b = P(px1, pz1);
    const c = {
      minX: Math.min(a.x, b.x), maxX: Math.max(a.x, b.x),
      minZ: Math.min(a.z, b.z), maxZ: Math.max(a.z, b.z),
      minY: 0, maxY: h,
    };
    c.box = new THREE.Box3(new THREE.Vector3(c.minX, 0, c.minZ), new THREE.Vector3(c.maxX, h, c.maxZ));
    this.colliders.push(c);
    if (nav) this.blockNav(px0, pz0, px1, pz1, margin);
    return c;
  }

  blockNav(px0, pz0, px1, pz1, margin = 0.3) {
    const x0 = Math.min(px0, px1) - margin, x1 = Math.max(px0, px1) + margin;
    const z0 = Math.min(pz0, pz1) - margin, z1 = Math.max(pz0, pz1) + margin;
    for (let z = Math.max(0, Math.floor(z0)); z <= Math.min(GRID_H - 1, Math.floor(z1)); z++) {
      for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(GRID_W - 1, Math.floor(x1)); x++) {
        const cx = x + 0.5, cz = z + 0.5;
        if (cx >= x0 && cx <= x1 && cz >= z0 && cz <= z1) this.walkable[z * GRID_W + x] = 0;
      }
    }
  }

  build() {
    this.buildFloors();
    this.buildWalls();
    this.buildPaint();
    this.buildCeiling();
    return this.group;
  }

  buildFloors() {
    const add = (x0, z0, x1, z1, tex) => {
      const w = x1 - x0 + 1, d = z1 - z0 + 1;
      const t = T.withRepeat(tex, w / 2, d / 2);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: t }));
      m.rotation.x = -Math.PI / 2;
      m.position.copy(P(x0 + w / 2, z0 + d / 2, 0));
      m.receiveShadow = true;
      m.matrixAutoUpdate = false;
      m.updateMatrix();
      this.group.add(m);
    };
    for (const r of Object.values(ROOMS)) add(r.x0, r.z0, r.x1, r.z1, r.floor());
    for (const d of DOORS) add(d.x0, d.z0, d.x1, d.z1, ROOMS[d.b].floor());
  }

  // Wall cells merged into as few boxes as possible: one collider and one mesh each.
  buildWalls() {
    const used = new Uint8Array(GRID_W * GRID_H);
    const isWall = (x, z) => this.grid[z][x] === WALL;
    const mat = new THREE.MeshLambertMaterial({ color: 0x1a1722 });
    for (let z = 0; z < GRID_H; z++) {
      for (let x = 0; x < GRID_W; x++) {
        if (!isWall(x, z) || used[z * GRID_W + x]) continue;
        let x1 = x;
        while (x1 + 1 < GRID_W && isWall(x1 + 1, z) && !used[z * GRID_W + x1 + 1]) x1++;
        let z1 = z;
        outer: while (z1 + 1 < GRID_H) {
          for (let k = x; k <= x1; k++) if (!isWall(k, z1 + 1) || used[(z1 + 1) * GRID_W + k]) break outer;
          z1++;
        }
        for (let zz = z; zz <= z1; zz++) for (let k = x; k <= x1; k++) used[zz * GRID_W + k] = 1;

        this.addBlock(x, z, x1 + 1, z1 + 1, WALL_H, { nav: false });
        const w = x1 - x + 1, d = z1 - z + 1;
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, WALL_H, d), mat);
        m.position.copy(P(x + w / 2, z + d / 2, WALL_H / 2));
        m.castShadow = true;
        m.receiveShadow = true;
        m.matrixAutoUpdate = false;
        m.updateMatrix();
        this.group.add(m);
      }
    }

    // Door headers: a lintel over every opening, so doors read as doors.
    const header = new THREE.MeshLambertMaterial({ color: 0x2b2440 });
    for (const d of DOORS) {
      const w = d.x1 - d.x0 + 1, dd = d.z1 - d.z0 + 1;
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, WALL_H - 3.0, dd), header);
      m.position.copy(P(d.x0 + w / 2, d.z0 + dd / 2, 3.0 + (WALL_H - 3.0) / 2));
      m.matrixAutoUpdate = false;
      m.updateMatrix();
      this.group.add(m);
    }
  }

  // Each room's walls painted on as one merged mesh of quads, one quad per wall-facing cell
  // edge, with UVs in metres so the pattern runs continuously around the room.
  buildPaint() {
    const eps = 0.02;   // far enough off the wall boxes not to flicker at a distance
    for (const [id, r] of Object.entries(ROOMS)) {
      const pos = [], nrm = [], uv = [], idx = [];
      const quad = (ax, az, bx, bz, nx, nz, u0) => {
        const base = pos.length / 3;
        const A = P(ax, az), B = P(bx, bz);
        pos.push(A.x, 0, A.z, B.x, 0, B.z, B.x, WALL_H, B.z, A.x, WALL_H, A.z);
        for (let k = 0; k < 4; k++) nrm.push(nx, 0, nz);
        uv.push(u0, 0, u0 + 1, 0, u0 + 1, 1, u0, 1);
        idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
      };
      for (let z = r.z0; z <= r.z1; z++) {
        for (let x = r.x0; x <= r.x1; x++) {
          if (this.grid[z][x] !== id) continue;
          // Counter-clockwise seen from inside the room, so each quad faces into it.
          if (this.grid[z - 1][x] === WALL) quad(x, z + eps, x + 1, z + eps, 0, 1, x);
          if (this.grid[z + 1][x] === WALL) quad(x + 1, z + 1 - eps, x, z + 1 - eps, 0, -1, -(x + 1));
          if (this.grid[z][x - 1] === WALL) quad(x + eps, z + 1, x + eps, z, 1, 0, -(z + 1));
          if (this.grid[z][x + 1] === WALL) quad(x + 1 - eps, z, x + 1 - eps, z + 1, -1, 0, z);
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(idx);
      const [upper, band, lower, pattern] = r.wall;
      const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: T.wallPaint(upper, band, lower, pattern) }));
      m.receiveShadow = true;
      m.matrixAutoUpdate = false;
      this.group.add(m);
    }
  }

  buildCeiling() {
    const t = T.withRepeat(T.ceiling(), GRID_W / 2, GRID_H / 2);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(GRID_W, GRID_H), new THREE.MeshLambertMaterial({ map: t }));
    m.rotation.x = Math.PI / 2;
    m.position.set(0, WALL_H, 0);
    m.matrixAutoUpdate = false;
    m.updateMatrix();
    this.group.add(m);

    // Light panels, a grid of them per room. Lit by day, dead by night.
    const panelGeo = new THREE.BoxGeometry(1.6, 0.06, 0.8);
    for (const [id, r] of Object.entries(ROOMS)) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xfff6e0 });
      const w = r.x1 - r.x0 + 1, d = r.z1 - r.z0 + 1;
      const nx = Math.max(1, Math.round(w / 6)), nz = Math.max(1, Math.round(d / 6));
      for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
        const p = new THREE.Mesh(panelGeo, mat);
        p.position.copy(P(r.x0 + (i + 0.5) * w / nx, r.z0 + (k + 0.5) * d / nz, WALL_H - 0.03));
        p.matrixAutoUpdate = false;
        p.updateMatrix();
        this.group.add(p);
      }
      this.ceilingLights.push({ room: id, mat });
    }
  }
}
