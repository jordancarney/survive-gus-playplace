// Culac's Daycare is huge: the designer wanted it to take Jimmy 9.57 minutes to walk up, down
// or across, which at his walking speed (3.8 m/s) is 2,182 m. Every other map in the game is
// under 120 m, and the plain Building (map.js) was written for those: a fresh A* buffer the
// size of the whole grid on every path, every collider checked on every step, one mesh per
// wall box. This is the same Building — the same 1 m grid, rooms, doors and queries — with
// the parts that don't scale done differently:
//
//   colliders  a spatial grid, so a step only looks at the boxes near it (physics.js asks
//              for `near` when a list has one)
//   findPath   reuses its buffers, stops after a budget of cells and walks toward the
//              closest it got (it paths again when it gets there), and string-pulls in a
//              line instead of trying every pair of points
//   floors, walls, paint   merged and instanced in chunks, so the camera only draws what's
//              near it
//   ceiling    high above the walls: the rooms are partitions in one enormous hall, which
//              is how Ouchie flies over everything
import * as THREE from 'three';
import { Building } from '../map.js';
import { surface } from '../materials.js';
import * as T from '../textures.js';
import { SHADOWS } from '../config.js';

const WALL = '#';
export const CHUNK = 96;          // metres: how big a piece of floor, wall or furniture is drawn as one
const COL_CELL = 16;              // metres: the collider grid
const PATH_BUDGET = 70000;        // cells A* may open before it settles for the closest it got

// An array of colliders that can also say which ones are near a point.
class ColliderGrid extends Array {
  static get [Symbol.species]() { return Array; }
  push(...c) { this.idx = null; return super.push(...c); }
  splice(...a) { this.idx = null; return super.splice(...a); }

  index() {
    const idx = new Map();
    for (const c of this) {
      const x0 = Math.floor(c.minX / COL_CELL), x1 = Math.floor(c.maxX / COL_CELL);
      const z0 = Math.floor(c.minZ / COL_CELL), z1 = Math.floor(c.maxZ / COL_CELL);
      for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
        const k = (x + 512) * 1024 + (z + 512);
        let l = idx.get(k);
        if (!l) idx.set(k, (l = []));
        l.push(c);
      }
    }
    this.idx = idx;
  }

  near(x, z, r) {
    if (!this.idx) this.index();
    const out = this.out || (this.out = []);
    out.length = 0;
    const stamp = (this.stamp = (this.stamp || 0) + 1);
    const x0 = Math.floor((x - r) / COL_CELL), x1 = Math.floor((x + r) / COL_CELL);
    const z0 = Math.floor((z - r) / COL_CELL), z1 = Math.floor((z + r) / COL_CELL);
    for (let cx = x0; cx <= x1; cx++) for (let cz = z0; cz <= z1; cz++) {
      const l = this.idx.get((cx + 512) * 1024 + (cz + 512));
      if (!l) continue;
      for (const c of l) if (c._q !== stamp) { c._q = stamp; out.push(c); }
    }
    return out;
  }
}

const DIRS = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
];

// Greedy rectangles over the grid: `key(x, z)` is what a cell is (null to leave it out), and
// a rectangle only ever holds cells with the same key, at most `cap` on a side so they fall
// into chunks.
function rects(w, h, key, cap, fn) {
  const used = new Uint8Array(w * h);
  for (let z = 0; z < h; z++) {
    for (let x = 0; x < w; x++) {
      if (used[z * w + x]) continue;
      const k = key(x, z);
      if (k === null) continue;
      const ok = (xx, zz) => !used[zz * w + xx] && key(xx, zz) === k;
      let x1 = x;
      while (x1 + 1 < w && x1 - x + 1 < cap && ok(x1 + 1, z)) x1++;
      let z1 = z;
      outer: while (z1 + 1 < h && z1 - z + 1 < cap) {
        for (let q = x; q <= x1; q++) if (!ok(q, z1 + 1)) break outer;
        z1++;
      }
      for (let zz = z; zz <= z1; zz++) used.fill(1, zz * w + x, zz * w + x1 + 1);
      fn(x, z, x1, z1, k);
    }
  }
}

const chunkKey = (x, z) => `${Math.floor(x / CHUNK)},${Math.floor(z / CHUNK)}`;

export class BigPlace extends Building {
  constructor(layout) {
    super(layout);
    this.ceilH = layout.ceilH || this.wallH;
    this.colliders = new ColliderGrid();
  }

  // ── Paths ─────────────────────────────────────────────────────────────

  findPath(from, to, budget = PATH_BUDGET) {
    const W = this.w, H = this.h, N = W * H;
    const pf = this.pf || (this.pf = {
      g: new Float32Array(N), came: new Int32Array(N), st: new Uint32Array(N), stamp: 0,
      hf: new Float32Array(1 << 15), hn: new Int32Array(1 << 15),
    });
    const clampC = (v, m) => Math.max(0, Math.min(m - 1, v));
    const [sx, sz] = this.nearestWalkable(clampC(Math.floor(from.x + this.ox), W), clampC(Math.floor(from.z + this.oz), H));
    const [gx, gz] = this.nearestWalkable(clampC(Math.floor(to.x + this.ox), W), clampC(Math.floor(to.z + this.oz), H));
    const start = sz * W + sx, goal = gz * W + gx;
    if (start === goal) return [new THREE.Vector3(to.x, 0, to.z)];
    pf.stamp += 2;
    if (pf.stamp > 4e9) { pf.st.fill(0); pf.stamp = 2; }
    const OPEN = pf.stamp, CLOSED = pf.stamp + 1;
    const { g, came, st } = pf;
    const walk = this.walkable;
    const h = (i) => {
      const dx = Math.abs((i % W) - gx), dz = Math.abs(((i / W) | 0) - gz);
      return (Math.max(dx, dz) + 0.4142 * Math.min(dx, dz)) * 1.15;
    };
    // a binary heap on typed arrays
    let size = 0;
    const push = (node, f) => {
      if (size >= pf.hf.length) {
        const hf = new Float32Array(pf.hf.length * 2); hf.set(pf.hf); pf.hf = hf;
        const hn = new Int32Array(pf.hn.length * 2); hn.set(pf.hn); pf.hn = hn;
      }
      const hf = pf.hf, hn = pf.hn;
      let i = size++;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (hf[p] <= f) break;
        hf[i] = hf[p]; hn[i] = hn[p];
        i = p;
      }
      hf[i] = f; hn[i] = node;
    };
    const pop = () => {
      const hf = pf.hf, hn = pf.hn;
      const top = hn[0];
      size--;
      if (size > 0) {
        const f = hf[size], node = hn[size];
        let i = 0;
        for (;;) {
          const l = i * 2 + 1, r = l + 1;
          if (l >= size) break;
          const c = r < size && hf[r] < hf[l] ? r : l;
          if (hf[c] >= f) break;
          hf[i] = hf[c]; hn[i] = hn[c];
          i = c;
        }
        hf[i] = f; hn[i] = node;
      }
      return top;
    };
    g[start] = 0;
    came[start] = -1;
    st[start] = OPEN;
    push(start, h(start));
    let found = false, best = start, bestH = h(start), opened = 0;
    while (size) {
      const cur = pop();
      if (cur === goal) { found = true; break; }
      if (st[cur] === CLOSED) continue;
      st[cur] = CLOSED;
      const hc = h(cur);
      if (hc < bestH) { bestH = hc; best = cur; }
      if (++opened > budget) break;
      const cx = cur % W, cz = (cur / W) | 0;
      for (const [dx, dz, cost] of DIRS) {
        const nx = cx + dx, nz = cz + dz;
        if (nx < 0 || nz < 0 || nx >= W || nz >= H) continue;
        const ni = nz * W + nx;
        if (!walk[ni] || st[ni] === CLOSED) continue;
        if (dx && dz && (!walk[cz * W + nx] || !walk[nz * W + cx])) continue;
        const ng = g[cur] + cost;
        if (st[ni] !== OPEN || ng < g[ni]) {
          st[ni] = OPEN;
          g[ni] = ng;
          came[ni] = cur;
          push(ni, ng + h(ni));
        }
      }
    }
    const end = found ? goal : best;
    if (end === start) return [];
    const cells = [];
    for (let i = end; i !== -1; i = came[i]) cells.push(i);
    cells.reverse();
    const pts = cells.map((i) => new THREE.Vector3((i % W) + 0.5 - this.ox, 0, ((i / W) | 0) + 0.5 - this.oz));
    if (found) pts[pts.length - 1].set(to.x, 0, to.z);
    // String-pull, forwards: from each point, carry on in a straight line as far as it's
    // clear (up to 40 m at a time, so it never checks a line across the whole map).
    const out = [];
    let at = new THREE.Vector3(from.x, 0, from.z);
    let i = 0;
    while (i < pts.length - 1) {
      let j = i + 1;
      while (j + 1 < pts.length && at.distanceTo(pts[j + 1]) < 40 && this.walkClear(at, pts[j + 1])) j++;
      out.push(pts[j]);
      at = pts[j];
      i = j;
    }
    if (!out.length) out.push(pts[pts.length - 1]);
    return out;
  }

  // ── Building it ───────────────────────────────────────────────────────

  build() {
    this.buildFloors();
    this.buildWalls();
    this.buildPaint();
    this.buildCeiling();
    return this.group;
  }

  // Each room's floor, merged into rectangles and then into one mesh per room per chunk. The
  // texture's laid in metres (a tile every 2 m) so the pieces meet without a seam.
  buildFloors() {
    const byRoom = new Map();
    const W = this.w, H = this.h, grid = this.grid;
    for (const id of Object.keys(this.rooms)) byRoom.set(id, new Map());
    rects(W, H, (x, z) => (grid[z][x] === WALL ? null : grid[z][x]), CHUNK, (x0, z0, x1, z1, id) => addQuad(byRoom.get(id), x0, z0, x1, z1));
    function addQuad(map, x0, z0, x1, z1) {
      const k = chunkKey(x0, z0);
      let q = map.get(k);
      if (!q) map.set(k, (q = []));
      q.push([x0, z0, x1 + 1, z1 + 1]);
    }
    for (const [id, map] of byRoom) {
      const r = this.rooms[id];
      const tex = T.withRepeat(r.floor(), 1, 1);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      const material = surface({ map: tex, floor: true });
      const tile = r.tile || 2;
      for (const quads of map.values()) {
        const pos = [], uv = [], nrm = [], idx = [];
        for (const [x0, z0, x1, z1] of quads) {
          const b = pos.length / 3;
          const A = this.P(x0, z0), B = this.P(x1, z1);
          pos.push(A.x, 0, A.z, A.x, 0, B.z, B.x, 0, B.z, B.x, 0, A.z);
          uv.push(x0 / tile, -z0 / tile, x0 / tile, -z1 / tile, x1 / tile, -z1 / tile, x1 / tile, -z0 / tile);
          for (let k = 0; k < 4; k++) nrm.push(0, 1, 0);
          idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
        }
        const m = new THREE.Mesh(geometry(pos, nrm, uv, idx), material);
        m.receiveShadow = true;
        m.userData.floor = true;
        m.matrixAutoUpdate = false;
        this.group.add(m);
      }
    }
  }

  // Wall cells merged into boxes (each one collider), drawn instanced, a batch per chunk. The
  // outside walls go all the way up to the roof; the rooms' walls are partitions.
  buildWalls() {
    const W = this.w, H = this.h, grid = this.grid;
    const material = surface({ color: this.layout.wallColor || 0x1a1722 });
    const batches = new Map();
    rects(W, H, (x, z) => (grid[z][x] === WALL ? 1 : null), CHUNK, (x0, z0, x1, z1) => {
      const outside = x0 === 0 || z0 === 0 || x1 === W - 1 || z1 === H - 1;
      const h = outside ? this.ceilH : this.wallH;
      this.addBlock(x0, z0, x1 + 1, z1 + 1, h, { nav: false });
      const w = x1 - x0 + 1, d = z1 - z0 + 1;
      const c = this.P(x0 + w / 2, z0 + d / 2, h / 2);
      const k = chunkKey(x0, z0);
      let b = batches.get(k);
      if (!b) batches.set(k, (b = []));
      b.push(new THREE.Matrix4().compose(c, new THREE.Quaternion(), new THREE.Vector3(w, h, d)));
    });
    const box = new THREE.BoxGeometry(1, 1, 1);
    for (const list of batches.values()) this.group.add(instanced(box, material, list));
    // a lintel over every opening, so doors read as doors
    const header = surface({ color: this.layout.headerColor || 0x2b2440 });
    const doorTop = this.layout.doorTop || 3.4;
    const list = [];
    for (const d of this.doors) {
      const w = d.x1 - d.x0 + 1, dd = d.z1 - d.z0 + 1;
      const c = this.P(d.x0 + w / 2, d.z0 + dd / 2, doorTop + (this.wallH - doorTop) / 2);
      list.push(new THREE.Matrix4().compose(c, new THREE.Quaternion(), new THREE.Vector3(w, this.wallH - doorTop, dd)));
    }
    if (list.length) this.group.add(instanced(box, header, list, false));
  }

  // Each room's walls painted on, a long quad per straight run of wall (not one per cell), a
  // mesh per room per chunk.
  buildPaint() {
    const eps = 0.02;
    const grid = this.grid, Hh = this.wallH;
    for (const [id, r] of Object.entries(this.rooms)) {
      if (!r.wall) continue;
      const chunks = new Map();
      const get = (x, z) => {
        const k = chunkKey(x, z);
        let c = chunks.get(k);
        if (!c) chunks.set(k, (c = { pos: [], nrm: [], uv: [], idx: [] }));
        return c;
      };
      const quad = (c, ax, az, bx, bz, nx, nz, u0, u1) => {
        const base = c.pos.length / 3;
        const A = this.P(ax, az), B = this.P(bx, bz);
        c.pos.push(A.x, 0, A.z, B.x, 0, B.z, B.x, Hh, B.z, A.x, Hh, A.z);
        for (let k = 0; k < 4; k++) c.nrm.push(nx, 0, nz);
        c.uv.push(u0, 0, u1, 0, u1, 1, u0, 1);
        c.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
      };
      const x0 = Math.max(1, r.x0 - 1), x1 = Math.min(this.w - 2, r.x1 + 1);
      const z0 = Math.max(1, r.z0 - 1), z1 = Math.min(this.h - 2, r.z1 + 1);
      // north- and south-facing runs, along each row
      for (let z = z0; z <= z1; z++) {
        for (const side of [-1, 1]) {
          let run = -1;
          for (let x = x0; x <= x1 + 1; x++) {
            const on = x <= x1 && grid[z][x] === id && grid[z + side][x] === WALL && (run < 0 || Math.floor(x / CHUNK) === Math.floor(run / CHUNK));
            if (on && run < 0) run = x;
            if (!on && run >= 0) {
              const c = get(run, z);
              if (side < 0) quad(c, run, z + eps, x, z + eps, 0, 1, run, x);
              else quad(c, x, z + 1 - eps, run, z + 1 - eps, 0, -1, -x, -run);
              run = -1;
              if (x <= x1 && grid[z][x] === id && grid[z + side][x] === WALL) run = x;
            }
          }
        }
      }
      // east- and west-facing runs, down each column
      for (let x = x0; x <= x1; x++) {
        for (const side of [-1, 1]) {
          let run = -1;
          for (let z = z0; z <= z1 + 1; z++) {
            const on = z <= z1 && grid[z][x] === id && grid[z][x + side] === WALL && (run < 0 || Math.floor(z / CHUNK) === Math.floor(run / CHUNK));
            if (on && run < 0) run = z;
            if (!on && run >= 0) {
              const c = get(x, run);
              if (side < 0) quad(c, x + eps, z, x + eps, run, 1, 0, -z, -run);
              else quad(c, x + 1 - eps, run, x + 1 - eps, z, -1, 0, run, z);
              run = -1;
              if (z <= z1 && grid[z][x] === id && grid[z][x + side] === WALL) run = z;
            }
          }
        }
      }
      const [upper, band, lower, pattern] = r.wall;
      const material = surface({ map: T.wallPaint(upper, band, lower, pattern) });
      for (const c of chunks.values()) {
        const m = new THREE.Mesh(geometry(c.pos, c.nrm, c.uv, c.idx), material);
        m.receiveShadow = true;
        m.matrixAutoUpdate = false;
        this.group.add(m);
      }
    }
  }

  buildCeiling() {
    const t = T.withRepeat((this.layout.ceiling || T.ceiling)(), this.w / 4, this.h / 4);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(this.w, this.h), surface({ map: t }));
    m.rotation.x = Math.PI / 2;
    m.position.copy(this.P(this.w / 2, this.h / 2, this.ceilH));
    m.matrixAutoUpdate = false;
    m.updateMatrix();
    this.group.add(m);
  }
}

function geometry(pos, nrm, uv, idx) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeBoundingSphere();
  return geo;
}

export function instanced(geo, material, matrices, shadow = true) {
  const im = new THREE.InstancedMesh(geo, material, matrices.length);
  matrices.forEach((m, i) => im.setMatrixAt(i, m));
  im.instanceMatrix.needsUpdate = true;
  im.castShadow = shadow && SHADOWS;
  im.receiveShadow = true;
  im.computeBoundingSphere();
  im.matrixAutoUpdate = false;
  return im;
}
