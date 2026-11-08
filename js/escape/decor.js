// Furniture and the things you use in When Jonathan Was Five's levels.
//
// Every level is a Building (map.js) with an EscapeDecor in it. On top of the PlayPlace's
// placement helpers (block, anchor, sign, light...) this adds what the story mode needs:
//
//   savePoint   the smiling SAVE box the designer drew on the School map
//   hideSpot    somewhere to hide (a locker, a toy box, a tube, a curtain...)
//   item        something to find: a fuse, a glowing book, a key, a golden Gus plushie...
//   target      something to press E on for a quest: the generator, a power switch...
//   exitDoor    the way out, locked until the level's quests are done
//
// and a few common pieces of furniture. Positions are plan metres, like everywhere else.
import * as THREE from 'three';
import { Decor, G, lam, glowMat, FACE } from '../decor.js';
import { mat, cloth } from '../models.js';
import * as T from '../textures.js';
import { surface } from '../materials.js';
import { GLOW } from '../config.js';

// The save box's face: two big black eyes, a wide toothy grin, and SAVE underneath, just like
// the drawing.
let saveFaceTex = null;
function saveFace() {
  if (saveFaceTex) return saveFaceTex;
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#f4ecd6'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = '#2a2018'; g.lineWidth = 10; g.strokeRect(5, 5, 246, 246);
  g.fillStyle = '#111';
  for (const x of [84, 172]) { g.beginPath(); g.ellipse(x, 78, 24, 32, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#fff';
  for (const x of [78, 166]) { g.beginPath(); g.arc(x, 66, 7, 0, Math.PI * 2); g.fill(); }
  // the grin: a big curved mouth full of teeth
  g.fillStyle = '#2a0a0a';
  g.beginPath();
  g.moveTo(40, 132); g.quadraticCurveTo(128, 150, 216, 132); g.quadraticCurveTo(128, 214, 40, 132); g.fill();
  g.strokeStyle = '#f4ecd6'; g.lineWidth = 4;
  for (let i = 1; i < 9; i++) {
    const x = 40 + i * 19.5;
    g.beginPath(); g.moveTo(x, 128); g.lineTo(x, 196 - Math.abs(i - 4.5) * 9); g.stroke();
  }
  g.beginPath(); g.moveTo(52, 156); g.quadraticCurveTo(128, 172, 204, 156); g.stroke();
  g.fillStyle = '#2a2018';
  g.font = 'bold 34px "Avenir Next", sans-serif'; g.textAlign = 'center';
  g.fillText('save', 128, 238);
  saveFaceTex = new THREE.CanvasTexture(c);
  saveFaceTex.colorSpace = THREE.SRGBColorSpace;
  return saveFaceTex;
}

// Rows of book spines on shelves, for the library's bookcases: one canvas is 1.2 m across and
// two shelves (0.9 m) high.
let spinesTex = null;
function bookSpines() {
  if (spinesTex) return spinesTex;
  const c = document.createElement('canvas');
  c.width = 512; c.height = 384;
  const g = c.getContext('2d');
  const cols = ['#8a1a20', '#1f3a7a', '#2f6a3a', '#b8902a', '#5a2a6a', '#d8d0b8', '#1f5a6a', '#6a3a1a', '#3a3a3a', '#a84a2a'];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  g.fillStyle = '#2a1a10'; g.fillRect(0, 0, 512, 384);
  for (let row = 0; row < 2; row++) {
    const base = (row + 1) * 192 - 14;
    let x = 4;
    while (x < 508) {
      const w = 10 + rnd() * 18, h = 110 + rnd() * 60;
      g.fillStyle = cols[Math.floor(rnd() * cols.length)];
      g.fillRect(x, base - h, w, h);
      g.fillStyle = 'rgba(255,230,160,0.35)';
      g.fillRect(x + 2, base - h + 14, w - 4, 3);
      g.fillRect(x + 2, base - 22, w - 4, 3);
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.fillRect(x + w - 2, base - h, 2, h);
      x += w + 1 + (rnd() < 0.08 ? 14 : 0);
    }
    g.fillStyle = '#5a3a24'; g.fillRect(0, base, 512, 14);
  }
  spinesTex = new THREE.CanvasTexture(c);
  spinesTex.colorSpace = THREE.SRGBColorSpace;
  spinesTex.wrapS = spinesTex.wrapT = THREE.RepeatWrapping;
  spinesTex.anisotropy = 4;
  return spinesTex;
}

// What each kind of thing to find looks like: a colour and a shape.
const ITEMS = {
  fuse:    { color: 0xffd23f, name: 'fuse' },
  book:    { color: 0x7cff6b, name: 'glowing book' },
  key:     { color: 0xffc23a, name: 'key' },
  battery: { color: 0x5ad1ff, name: 'battery' },
  bag:     { color: 0xff7eb6, name: 'gate key' },
  gem:     { color: 0xa970ff, name: 'gem' },
  reel:    { color: 0xffe08a, name: 'film reel' },
  plushie: { color: 0xffd23f, name: 'golden Gus plushie' },
  token:   { color: 0xffd23f, name: 'Gus token' },
  slice:   { color: 0xff9a1f, name: 'golden pizza slice' },
  sock:    { color: 0x9fd8ff, name: "Jack's sock" },
  balloon: { color: 0xff3fa4, name: 'balloon' },
  star:    { color: 0xfff2a0, name: 'party star' },
};
export const itemName = (kind) => ITEMS[kind]?.name || kind;

export class EscapeDecor extends Decor {
  constructor(place) {
    super(place);
    this.saves = [];
    this.hides = [];
    this.items = [];
    this.targets = [];
    this.exit = null;
    this.cams = [];        // the library's security cameras
    this.spinners = [];
    this.bobbers = [];
    this.spots = {};       // named places the level wants to remember (spawns, patrol points)
  }

  // ── Lights ────────────────────────────────────────────────────────────

  // A lamp: a point light (on only while you're in this level — see Lighting.setEscape) and a
  // little glowing bulb so you can see where the light is coming from.
  lamp(px, pz, y, color, k = 3, { distance = 9, flicker = false, room = null, bulb = true, size = 0.09 } = {}) {
    this.light(px, pz, y, color, 0, k, { room, distance, flicker });
    const entry = this.lights[this.lights.length - 1];
    if (bulb) {
      const p = this.place.P(px, pz, y);
      entry.bulb = this.mesh(G.sphere, glowMat(color, 0.4), this.group, { p: [p.x, p.y, p.z], s: [size, size, size], shadow: false });
    }
    // `off`: dark until the level switches it on (Lighting.apply leaves it at 0)
    return entry;
  }

  // A light hanging from the ceiling in a shade.
  hanging(px, pz, color = 0xffe2b0, k = 3, opts = {}) {
    const y = this.place.wallH - 0.55;
    const p = this.place.P(px, pz, y);
    this.mesh(G.cyl, lam(0x222222), this.group, { p: [p.x, y + 0.3, p.z], s: [0.01, 0.5, 0.01], shadow: false });
    this.mesh(G.cone, lam(0x2a2a30), this.group, { p: [p.x, y + 0.08, p.z], s: [0.28, 0.2, 0.28], shadow: false });
    return this.lamp(px, pz, y - 0.05, color, k, { distance: 11, ...opts });
  }

  // A night window: dark blue glass with a little moonlight.
  window(px, pz, y, w, h, facing) {
    const g = this.anchor(px, pz, facing, y);
    this.mesh(G.plane, glowMat(0x1a2a4a, 0.3), g, { p: [0, 0, 0], s: [w, h, 1], shadow: false });
    const frame = lam(0xd8d0c0);
    for (const yy of [-h / 2, h / 2]) this.mesh(G.box, frame, g, { p: [0, yy, 0.02], s: [w + 0.1, 0.07, 0.05] });
    for (const xx of [-w / 2, 0, w / 2]) this.mesh(G.box, frame, g, { p: [xx, 0, 0.02], s: [0.06, h, 0.05] });
  }

  rug(px, pz, w, d, a, b) {
    const c = this.place.P(px, pz, 0.015);
    this.mesh(G.plane, surface({ map: T.rug(a, b) }), this.group,
      { p: [c.x, c.y, c.z], s: [w, d, 1], r: [-Math.PI / 2, 0, 0], shadow: false });
  }

  // A flat coloured patch on the floor (a pool, a mat, a painted line).
  patch(px, pz, w, d, color, { y = 0.012, glow = 0 } = {}) {
    const c = this.place.P(px, pz, y);
    const m = glow ? glowMat(color, glow) : surface({ color });
    return this.mesh(G.plane, m, this.group, { p: [c.x, c.y, c.z], s: [w, d, 1], r: [-Math.PI / 2, 0, 0], shadow: false });
  }

  // A sign. The lettering is sized to fit, however long the words are.
  label(text, px, pz, y, w, h, facing, opts = {}) {
    const cw = 1024, ch = Math.max(48, Math.round(cw * h / w));
    const lines = text.split('\n');
    const longest = Math.max(...lines.map((l) => l.length));
    const px2 = Math.floor(Math.min(110, (ch * 0.78) / lines.length, (cw * 0.9) / (longest * 0.62)));
    return this.sign(text, px, pz, y, w, h, facing, { w: cw, h: ch, font: `bold ${px2}px "Avenir Next", sans-serif`, ...opts });
  }

  // ── Furniture ─────────────────────────────────────────────────────────

  table(px, pz, w, d, h = 0.72, color = 0x8a5a32, { legs = 0x5a3a22 } = {}) {
    this.block(px, pz, w, d, 0.06, color, { y: h - 0.06, solid: false });
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      this.block(px + sx * (w / 2 - 0.08), pz + sz * (d / 2 - 0.08), 0.07, 0.07, h - 0.06, legs, { solid: false, nav: false });
    }
    this.place.addBlock(px - w / 2, pz - d / 2, px + w / 2, pz + d / 2, h);
  }

  chair(px, pz, color = 0x3a6ab8, s = 1) {
    this.block(px, pz, 0.42 * s, 0.42 * s, 0.42 * s, color, { solid: false, nav: false });
    this.block(px, pz - 0.19 * s, 0.42 * s, 0.05, 0.85 * s, color, { solid: false, nav: false });
  }

  // A bookshelf `w` long, its books facing `facing`.
  shelf(px, pz, w, d, h, facing = 'south', { wood = 0x5a3a24, books = true } = {}) {
    this.block(px, pz, w, d, h, wood);
    if (!books) return;
    const along = facing === 'south' || facing === 'north';
    const len = along ? w : d;
    const cols = [0xc0262d, 0x2a4fa0, 0x2f8f3a, 0xd9b45a, 0x6b3e8a, 0xe8e0d0, 0x1f6f9a];
    const g = this.anchor(px, pz, facing, 0);
    const depth = (along ? d : w) / 2 + 0.005;
    const rows = Math.max(1, Math.floor(h / 0.45));
    for (let r = 0; r < rows; r++) {
      let x = -len / 2 + 0.06;
      while (x < len / 2 - 0.1) {
        const bw = 0.05 + ((x * 37 + r * 13) % 1 + 1) % 1 * 0.06;
        const bh = 0.24 + (((x * 91 + r * 7) % 1 + 1) % 1) * 0.12;
        const c = cols[Math.floor(((x * 53 + r * 29) % 7 + 7) % 7)];
        this.mesh(G.box, lam(c), g, { p: [x + bw / 2, 0.1 + r * 0.45 + bh / 2, depth], s: [bw, bh, 0.02], shadow: false });
        x += bw + 0.008;
      }
    }
  }

  // A big bookcase full of books on both of its long sides. `wall`: its cells are already wall
  // in the floor plan (so it blocks sight, the way a tall bookcase should) and this dresses them.
  bookcase(px, pz, w, d, h, { wood = 0x4a2e1a, wall = false } = {}) {
    const grow = wall ? 0.08 : 0;
    this.block(px, pz, w + grow, d + grow, h, wood, { solid: !wall, nav: !wall });
    const along = w >= d;
    const len = along ? w : d;
    const tex = T.withRepeat(bookSpines(), len / 1.2, Math.min(h, this.place.wallH - 0.1) / 0.9);
    const m = surface({ map: tex });
    const hh = Math.min(h, this.place.wallH - 0.1) - 0.1;
    const off = (along ? d : w) / 2 + grow / 2 + 0.012;
    for (const side of [-1, 1]) {
      const c = this.place.P(px + (along ? 0 : side * off), pz + (along ? side * off : 0), 0.05 + hh / 2);
      const yaw = along ? (side > 0 ? 0 : Math.PI) : (side > 0 ? Math.PI / 2 : -Math.PI / 2);
      this.mesh(G.plane, m, this.group, { p: [c.x, c.y, c.z], s: [len - 0.1, hh, 1], r: [0, yaw, 0], shadow: false });
    }
  }

  // A kid's bed with a pillow and a blanket, its head against `facing`'s opposite wall.
  bed(px, pz, facing = 'south', blanket = 0x3a6ab8, { len = 1.7, wid = 0.9 } = {}) {
    const g = this.anchor(px, pz, facing, 0);
    const wood = lam(0x8a5a32);
    this.mesh(G.box, wood, g, { p: [0, 0.2, 0], s: [wid, 0.18, len] });
    this.mesh(G.box, lam(0xf4f1ea), g, { p: [0, 0.32, 0], s: [wid - 0.06, 0.1, len - 0.04] });
    this.mesh(G.box, cloth(blanket), g, { p: [0, 0.39, 0.18], s: [wid - 0.02, 0.06, len * 0.7] });
    this.mesh(G.box, lam(0xffffff), g, { p: [0, 0.42, -len / 2 + 0.22], s: [wid * 0.6, 0.1, 0.28] });
    this.mesh(G.box, wood, g, { p: [0, 0.45, -len / 2 + 0.03], s: [wid, 0.6, 0.06] });
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      this.mesh(G.box, wood, g, { p: [sx * (wid / 2 - 0.04), 0.06, sz * (len / 2 - 0.04)], s: [0.07, 0.12, 0.07] });
    }
    const along = facing === 'north' || facing === 'south';
    const w = along ? wid : len, d = along ? len : wid;
    this.place.addBlock(px - w / 2, pz - d / 2, px + w / 2, pz + d / 2, 0.45);
    return g;
  }

  crate(px, pz, s = 0.8, color = 0x8a6a42) { this.block(px, pz, s, s, s, color); }

  // A heap of old junk: crates, a broken robot arm, wheels, all of it.
  junk(px, pz, r = 1.6) {
    const cols = [0x6a5a4a, 0x4a4d55, 0x8a6a42, 0x3a3d44, 0x7a2a2a, 0x2a4fa0];
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4, d = (i % 3) * r * 0.32;
      const x = px + Math.cos(a) * d, z = pz + Math.sin(a) * d;
      const s = 0.4 + (i % 4) * 0.18;
      const c = this.place.P(x, z, s / 2 + (i > 5 ? 0.4 : 0));
      this.mesh(G.box, lam(cols[i % cols.length]), this.group, { p: [c.x, c.y, c.z], s: [s, s * 0.8, s * 1.1], r: [0, a, i * 0.2] });
    }
    for (let i = 0; i < 3; i++) {
      const c = this.place.P(px + (i - 1) * 0.7, pz + 0.9, 0.3);
      this.mesh(G.cyl, lam(0x1a1a1a), this.group, { p: [c.x, c.y, c.z], s: [0.3, 0.12, 0.3], r: [Math.PI / 2, 0, i] });
    }
    this.place.addBlock(px - r * 0.7, pz - r * 0.7, px + r * 0.7, pz + r * 0.7, 1.2);
  }

  plant(px, pz) {
    this.block(px, pz, 0.45, 0.45, 0.45, 0x8a4a2a);
    const c = this.place.P(px, pz, 0.95);
    this.mesh(G.sphere, lam(0x2f7a3a), this.group, { p: [c.x, c.y, c.z], s: [0.4, 0.55, 0.4] });
  }

  counter(px, pz, w, d, h = 1.0, color = 0xc8b89a, top = 0xe8e0d0) {
    this.block(px, pz, w, d, h - 0.05, color);
    this.block(px, pz, w + 0.06, d + 0.06, 0.05, top, { y: h - 0.05, solid: false, nav: false });
  }

  // A ball pit's worth of balls in one draw: plan rectangle (x0, z0)–(x1, z1), `n` of them.
  balls(x0, z0, x1, z1, n = 300) {
    const cols = [0xff3b30, 0xffd23f, 0x3ec1d3, 0x7ad151, 0xa970ff, 0xff9a1f].map((c) => new THREE.Color(c));
    const geo = new THREE.SphereGeometry(0.14, 10, 8);
    const im = new THREE.InstancedMesh(geo, surface({ color: 0xffffff }), n);
    const m4 = new THREE.Matrix4();
    let seed = 3;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      const p = this.place.P(x0 + rnd() * (x1 - x0), z0 + rnd() * (z1 - z0), 0.12 + rnd() * 0.3);
      im.setMatrixAt(i, m4.makeTranslation(p.x, p.y, p.z));
      im.setColorAt(i, cols[i % cols.length]);
    }
    im.receiveShadow = true;
    this.group.add(im);
    return im;
  }

  // An arcade machine with a glowing screen.
  cabinet(px, pz, facing, color = 0x2a4fa0, title = 'GAME') {
    const g = this.anchor(px, pz, facing, 0);
    this.mesh(G.box, lam(color), g, { p: [0, 0.85, 0], s: [0.75, 1.7, 0.7] });
    this.mesh(G.box, lam(0x111111), g, { p: [0, 1.25, 0.3], s: [0.6, 0.5, 0.12] });
    const scr = new THREE.MeshBasicMaterial({ map: T.screenTex(title, '#ffd23f') });
    scr.color.setScalar(Math.max(1, GLOW * 0.35));
    this.mesh(G.plane, scr, g, { p: [0, 1.25, 0.365], s: [0.52, 0.42, 1], shadow: false });
    this.mesh(G.box, lam(0x222222), g, { p: [0, 0.92, 0.42], s: [0.6, 0.06, 0.22] });
    this.mesh(G.box, glowMat(color, 0.25), g, { p: [0, 1.65, 0.36], s: [0.7, 0.12, 0.02], shadow: false });
    const along = facing === 'north' || facing === 'south';
    this.place.addBlock(px - (along ? 0.38 : 0.36), pz - (along ? 0.36 : 0.38), px + (along ? 0.38 : 0.36), pz + (along ? 0.36 : 0.38), 1.7);
    return scr;
  }

  // Rows of seats (a movie theater, a waiting room) facing `facing`, `cols` across.
  seats(x0, z0, cols, rows, facing, color = 0x8a1a20, { dx = 0.7, dz = 1.2 } = {}) {
    const ns = facing === 'north' || facing === 'south';
    for (let r = 0; r < rows; r++) {
      const cx = ns ? x0 + (cols - 1) * dx / 2 : x0 + r * dz;
      const cz = ns ? z0 + r * dz : z0 + (cols - 1) * dx / 2;
      const len = cols * dx;
      this.block(cx, cz, ns ? len : 0.6, ns ? 0.6 : len, 0.45, cloth(color), { solid: true });
      const back = FACE[facing] === 0 ? -0.28 : FACE[facing] === Math.PI ? 0.28 : 0;
      const backX = facing === 'east' ? -0.28 : facing === 'west' ? 0.28 : 0;
      this.block(cx + backX, cz + back, ns ? len : 0.1, ns ? 0.1 : len, 0.95, cloth(color), { solid: false, nav: false });
      for (let c = 0; c <= cols; c++) {
        const ax = ns ? x0 - dx / 2 + c * dx : cx, az = ns ? cz : z0 - dx / 2 + c * dx;
        this.block(ax, az, ns ? 0.06 : 0.6, ns ? 0.6 : 0.06, 0.62, 0x1a1a1a, { solid: false, nav: false });
      }
    }
  }

  // A classroom's little desks, each with a chair.
  desks(x0, z0, cols, rows, { dx = 1.6, dz = 1.6, color = 0xd8b880 } = {}) {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = x0 + c * dx, z = z0 + r * dz;
      this.table(x, z, 0.9, 0.6, 0.62, color, { legs: 0x6a6a72 });
      this.chair(x, z + 0.55, [0xd11f2a, 0x2a4fa0, 0x2f8f3a, 0xffd23f][(r + c) % 4], 0.85);
    }
  }

  chalkboard(px, pz, facing, w, text = '') {
    const g = this.anchor(px, pz, facing, 1.5);
    this.mesh(G.box, lam(0x6b4a2a), g, { p: [0, 0, 0], s: [w + 0.12, 1.32, 0.04] });
    const tex = T.signTex(text, { bg: '#1f3a2a', fg: '#e8f0e8', glow: '#1f3a2a', w: 512, h: Math.round(512 * 1.2 / w), border: false,
      font: 'bold 44px "Chalkboard SE", "Comic Sans MS", sans-serif' });
    this.mesh(G.plane, surface({ map: tex }), g, { p: [0, 0, 0.025], s: [w, 1.2, 1], shadow: false });
  }

  hospitalBed(px, pz, facing = 'south') {
    const g = this.anchor(px, pz, facing, 0);
    const steel = mat(0xc0c8d0, { metal: 0.6, rough: 0.35 });
    this.mesh(G.box, steel, g, { p: [0, 0.55, 0], s: [0.95, 0.12, 2.0] });
    this.mesh(G.box, lam(0xf4f6f8), g, { p: [0, 0.66, 0.05], s: [0.9, 0.12, 1.9] });
    this.mesh(G.box, cloth(0x9fc8d8), g, { p: [0, 0.74, 0.35], s: [0.92, 0.05, 1.2] });
    this.mesh(G.box, lam(0xffffff), g, { p: [0, 0.76, -0.72], s: [0.6, 0.1, 0.35] });
    this.mesh(G.box, steel, g, { p: [0, 0.85, -0.98], s: [0.95, 0.6, 0.05] });
    for (const sx of [-1, 1]) this.mesh(G.box, steel, g, { p: [sx * 0.48, 0.85, 0.1], s: [0.03, 0.2, 1.2] });
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) this.mesh(G.cyl, lam(0x222222), g, { p: [sx * 0.4, 0.08, sz * 0.85], s: [0.07, 0.05, 0.07], r: [Math.PI / 2, 0, 0] });
    const ns = facing === 'north' || facing === 'south';
    this.place.addBlock(px - (ns ? 0.48 : 1.0), pz - (ns ? 1.0 : 0.48), px + (ns ? 0.48 : 1.0), pz + (ns ? 1.0 : 0.48), 0.9);
  }

  // Tall thin glowing thing (an IV pole's bag, a lava lamp, a neon tube).
  pole(px, pz, h, color = 0xc0c8d0) {
    const c = this.place.P(px, pz, h / 2);
    this.mesh(G.cyl, mat(color, { metal: 0.6 }), this.group, { p: [c.x, c.y, c.z], s: [0.025, h, 0.025] });
  }

  // ── The story mode's own things ───────────────────────────────────────

  // The save box. Press E on it to save: if you get caught, you come back here.
  savePoint(px, pz, facing = 'south') {
    const g = this.anchor(px, pz, facing, 0);
    const body = lam(0xe8dcbc);
    this.mesh(G.box, body, g, { p: [0, 0.38, 0], s: [0.72, 0.76, 0.6] });
    this.mesh(G.plane, new THREE.MeshBasicMaterial({ map: saveFace(), color: new THREE.Color(1, 1, 1).multiplyScalar(REALGLOW) }), g,
      { p: [0, 0.39, 0.301], s: [0.66, 0.7, 1], shadow: false });
    this.place.addBlock(px - 0.36, pz - 0.36, px + 0.36, pz + 0.36, 0.76);
    const front = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), FACE[facing]);
    const pos = this.place.P(px, pz);
    const sp = { id: this.saves.length, pos, out: pos.clone().addScaledVector(front, 0.95), yaw: FACE[facing] + Math.PI };
    // a soft glow on the floor in front, so you can spot one across a dark room
    const c = sp.out.clone();
    const glow = this.mesh(G.plane, new THREE.MeshBasicMaterial({ color: 0xfff2a0, transparent: true, opacity: 0.12, depthWrite: false }), this.group,
      { p: [c.x, 0.02, c.z], s: [1.4, 1.4, 1], r: [-Math.PI / 2, 0, 0], shadow: false });
    sp.glow = glow;
    this.saves.push(sp);
    return sp;
  }

  // Somewhere to hide. You climb in with E and peek out through the gap; whatever didn't see
  // you get in walks right past. `kind` picks what it is.
  hideSpot(kind, px, pz, facing = 'south', { color = null } = {}) {
    const g = this.anchor(px, pz, facing, 0);
    let w = 0.9, d = 0.8, h = 1.2, eye = 0.7, name = 'Hide';
    let look = g;          // what to hide from view while you're in it, so you can see out
    if (kind === 'locker') {
      w = 0.7; d = 0.6; h = 2.0; eye = 1.05; name = 'Hide in the locker';
      const m = mat(color ?? 0x3a6ab8, { rough: 0.4, metal: 0.5 });
      this.mesh(G.box, m, g, { p: [0, 1.0, 0], s: [w, 2.0, d] });
      for (let k = 0; k < 4; k++) this.mesh(G.box, lam(0x111111), g, { p: [0, 1.55 - k * 0.07, d / 2 + 0.005], s: [0.42, 0.025, 0.01], shadow: false });
      this.mesh(G.box, lam(0xc0c0c0), g, { p: [0.24, 1.0, d / 2 + 0.01], s: [0.04, 0.12, 0.02] });
    } else if (kind === 'toybox') {
      w = 1.2; d = 0.8; h = 0.8; eye = 0.55; name = 'Hide in the toy box';
      const m = lam(color ?? 0xd11f2a);
      this.mesh(G.box, m, g, { p: [0, 0.35, 0], s: [w, 0.7, d] });
      this.mesh(G.box, lam(0xffd23f), g, { p: [0, 0.74, -0.05], s: [w + 0.04, 0.08, d], r: [-0.5, 0, 0] });
      for (const [x, c] of [[-0.3, 0x2a4fa0], [0.05, 0x2f8f3a], [0.35, 0xff9a1f]]) {
        this.mesh(G.sphere, lam(c), g, { p: [x, 0.72, 0.1], s: [0.12, 0.12, 0.12], shadow: false });
      }
    } else if (kind === 'tube') {
      w = 1.1; d = 2.0; h = 1.1; eye = 0.5; name = 'Crawl into the tube';
      const m = mat(color ?? 0xff9a1f, { rough: 0.35 });
      const tube = this.mesh(G.cyl, m, g, { p: [0, 0.55, 0], s: [0.55, 2.0, 0.55], r: [Math.PI / 2, 0, 0] });
      tube.material = m;
      this.mesh(G.cyl, lam(0x111111), g, { p: [0, 0.55, 1.005], s: [0.42, 0.01, 0.42], r: [Math.PI / 2, 0, 0], shadow: false });
    } else if (kind === 'curtain') {
      w = 1.3; d = 1.0; h = 2.1; eye = 1.0; name = 'Hide behind the curtain';
      this.mesh(G.box, cloth(color ?? 0x7fb8a8), g, { p: [0, 1.05, 0.45], s: [w, 2.1, 0.05] });
      this.mesh(G.box, cloth(color ?? 0x7fb8a8), g, { p: [-w / 2, 1.05, 0], s: [0.05, 2.1, d] });
      this.mesh(G.box, cloth(color ?? 0x7fb8a8), g, { p: [w / 2, 1.05, 0], s: [0.05, 2.1, d] });
      this.mesh(G.cyl, lam(0xc0c0c0), g, { p: [0, 2.15, 0.45], s: [0.015, w, 0.015], r: [0, 0, Math.PI / 2] });
    } else if (kind === 'box') {
      w = 1.0; d = 1.0; h = 1.0; eye = 0.6; name = 'Hide in the big box';
      this.mesh(G.box, lam(color ?? 0xa8805a), g, { p: [0, 0.5, 0], s: [w, 1.0, d] });
      this.mesh(G.box, lam(0x8a6a42), g, { p: [0, 1.0, 0.25], s: [w, 0.02, 0.5], r: [0.5, 0, 0] });
      this.mesh(G.box, lam(0x111111), g, { p: [0, 0.7, d / 2 + 0.005], s: [0.3, 0.08, 0.01], shadow: false });
    } else if (kind === 'counter') {
      w = 1.4; d = 0.8; h = 1.0; eye = 0.55; name = 'Hide under the counter';
      this.mesh(G.box, lam(color ?? 0x8a5a32), g, { p: [0, 0.5, -0.15], s: [w, 1.0, d - 0.3] });
      this.mesh(G.box, lam(0xe8e0d0), g, { p: [0, 1.0, 0], s: [w + 0.06, 0.05, d] });
    } else if (kind === 'bed') {
      w = 1.0; d = 1.9; h = 0.55; eye = 0.25; name = 'Hide under the bed';
      look = this.bed(px, pz, facing, color ?? 0x7fb8a8, { len: 1.9, wid: 1.0 });
    }
    const along = facing === 'north' || facing === 'south';
    const bw = along ? w : d, bd = along ? d : w;
    if (kind !== 'bed') this.place.addBlock(px - bw / 2, pz - bd / 2, px + bw / 2, pz + bd / 2, h);
    const yaw = FACE[facing] + Math.PI;     // the camera looks out the front
    const front = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), FACE[facing]);
    const pos = this.place.P(px, pz);
    const spot = {
      id: this.hides.length, kind, name, pos, yaw, group: look,
      eye: pos.clone().addScaledVector(front, d * 0.3).setY(eye),
      out: pos.clone().addScaledVector(front, d / 2 + 0.6),
    };
    this.hides.push(spot);
    return spot;
  }

  // Something to find. It floats and turns, glowing, until you walk into it.
  item(kind, id, px, pz, y = 0.55) {
    const info = ITEMS[kind] || ITEMS.key;
    const g = new THREE.Group();
    const p = this.place.P(px, pz, y);
    g.position.copy(p);
    this.group.add(g);
    const glow = glowMat(info.color, 0.5);
    if (kind === 'fuse') {
      this.mesh(G.cyl, glowMat(0xfff4c8, 0.4), g, { s: [0.07, 0.26, 0.07], r: [0, 0, Math.PI / 2], still: false });
      for (const sx of [-1, 1]) this.mesh(G.cyl, mat(0xc0c0c0, { metal: 0.8 }), g, { p: [sx * 0.15, 0, 0], s: [0.08, 0.06, 0.08], r: [0, 0, Math.PI / 2], still: false });
    } else if (kind === 'book') {
      this.mesh(G.box, glow, g, { s: [0.24, 0.32, 0.06], still: false });
    } else if (kind === 'key' || kind === 'bag') {
      this.mesh(G.torus, glow, g, { p: [0, 0.07, 0], s: [0.08, 0.08, 0.08], still: false });
      this.mesh(G.box, glow, g, { p: [0, -0.08, 0], s: [0.04, 0.2, 0.02], still: false });
      this.mesh(G.box, glow, g, { p: [0.04, -0.15, 0], s: [0.06, 0.03, 0.02], still: false });
    } else if (kind === 'battery') {
      this.mesh(G.cyl, glow, g, { s: [0.08, 0.26, 0.08], still: false });
      this.mesh(G.cyl, mat(0xc0c0c0, { metal: 0.8 }), g, { p: [0, 0.15, 0], s: [0.03, 0.04, 0.03], still: false });
    } else if (kind === 'gem') {
      this.mesh(new THREE.OctahedronGeometry(0.16), glow, g, { s: [1, 1.4, 1], still: false });
    } else if (kind === 'reel') {
      this.mesh(G.cyl, glow, g, { s: [0.22, 0.05, 0.22], r: [Math.PI / 2, 0, 0], still: false });
      this.mesh(G.cyl, lam(0x111111), g, { s: [0.05, 0.06, 0.05], r: [Math.PI / 2, 0, 0], still: false });
    } else if (kind === 'plushie') {
      // a little golden Gus: a body, a head, a bill and a top hat
      const gold = mat(0xf2c230, { metal: 0.7, rough: 0.3, emissive: 0x4a3400 });
      this.mesh(G.sphere, gold, g, { p: [0, -0.06, 0], s: [0.13, 0.15, 0.11], still: false });
      this.mesh(G.sphere, gold, g, { p: [0, 0.13, 0], s: [0.1, 0.1, 0.1], still: false });
      this.mesh(G.sphere, gold, g, { p: [0, 0.11, 0.1], s: [0.08, 0.03, 0.08], still: false });
      this.mesh(G.cyl, mat(0x5b2a86), g, { p: [0, 0.25, 0], s: [0.06, 0.1, 0.06], still: false });
    } else if (kind === 'token') {
      this.mesh(G.cyl, mat(0xf2c230, { metal: 0.8, rough: 0.25, emissive: 0x4a3400 }), g, { s: [0.12, 0.02, 0.12], r: [Math.PI / 2, 0, 0], still: false });
    } else if (kind === 'slice') {
      this.mesh(G.cone, glow, g, { s: [0.16, 0.04, 0.3], r: [0, 0, 0], still: false });
      this.mesh(new THREE.ConeGeometry(1, 1, 3), glow, g, { s: [0.2, 0.04, 0.3], r: [Math.PI / 2, 0, 0], still: false });
    } else {
      this.mesh(G.sphere, glow, g, { s: [0.13, 0.13, 0.13], still: false });
    }
    // a soft halo under it, so it can be spotted in the dark
    const halo = this.mesh(G.plane, new THREE.MeshBasicMaterial({ color: info.color, transparent: true, opacity: 0.18, depthWrite: false }), this.group,
      { p: [p.x, 0.02, p.z], s: [0.8, 0.8, 1], r: [-Math.PI / 2, 0, 0], shadow: false });
    const it = { id, kind, name: info.name, group: g, halo, pos: p.clone().setY(0), y, found: false };
    this.items.push(it);
    return it;
  }

  // Something to press E on for a quest. `build` draws it (in an anchor group facing `facing`).
  target(id, px, pz, facing, name, build = null, { reach = 1.6 } = {}) {
    const g = this.anchor(px, pz, facing, 0);
    if (build) build(g, this);
    const front = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), FACE[facing]);
    const pos = this.place.P(px, pz);
    const t = { id, name, group: g, pos, point: pos.clone().addScaledVector(front, 0.6), reach };
    this.targets.push(t);
    return t;
  }

  // The way out. A door in the wall with a sign over it: red LOCKED until the level's quests are
  // done, then green EXIT. (px, pz) is the floor just inside the door.
  exitDoor(px, pz, facing, { w = 1.4, label = 'EXIT' } = {}) {
    const g = this.anchor(px, pz, facing, 0);
    // the door sits against the wall behind (px, pz)
    const door = this.mesh(G.box, mat(0x6a7078, { metal: 0.5, rough: 0.4 }), g, { p: [0, 1.05, -0.47], s: [w, 2.1, 0.06], still: false });
    const bar = this.mesh(G.box, lam(0x2a2c31), g, { p: [0, 1.0, -0.43], s: [w * 0.8, 0.06, 0.04], still: false });
    const locked = new THREE.MeshBasicMaterial({ map: T.signTex('LOCKED', { bg: '#2a0606', fg: '#ff3b30', glow: '#ff3b30', w: 256, h: 96, font: 'bold 52px sans-serif' }) });
    const open = new THREE.MeshBasicMaterial({ map: T.signTex(label, { bg: '#0a2a0a', fg: '#3cff6b', glow: '#3cff6b', w: 256, h: 96, font: 'bold 52px sans-serif' }) });
    locked.color.setScalar(GLOW * 0.6);
    open.color.setScalar(GLOW * 0.6);
    const sign = this.mesh(G.plane, locked, g, { p: [0, 2.35, -0.44], s: [0.9, 0.34, 1], shadow: false, still: false });
    // the light behind the door, once it opens
    const outside = this.mesh(G.plane, glowMat(0x22325a, 0.3), g, { p: [0, 1.05, -0.5], s: [w, 2.1, 1], shadow: false, still: false });
    outside.visible = false;
    const pos = this.place.P(px, pz);
    this.exit = {
      pos, group: g, open: false, door,
      setOpen: (on) => {
        this.exit.open = on;
        sign.material = on ? open : locked;
        door.visible = bar.visible = !on;
        outside.visible = on;
      },
    };
    this.exit.setOpen(false);
    return this.exit;
  }

  // A security camera on the wall (the Library): it sweeps from side to side, and a pale cone
  // shows where it's looking.
  securityCam(px, pz, y, facing, { sweep = 0.7, range = 11, speed = 0.45, phase = 0 } = {}) {
    const g = this.anchor(px, pz, facing, y);
    const head = new THREE.Group();
    g.add(head);
    this.mesh(G.box, lam(0x2a2c31), g, { p: [0, 0.12, -0.05], s: [0.08, 0.25, 0.08] });
    this.mesh(G.box, lam(0xd8d8d8), head, { p: [0, 0, 0.15], s: [0.16, 0.14, 0.32], still: false });
    const led = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff2020).multiplyScalar(GLOW * 0.6) });
    this.mesh(G.sphereLo, led, head, { p: [0.05, 0.05, 0.32], s: [0.025, 0.025, 0.025], still: false });
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xff6060, transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(Math.tan(0.42) * range, range, 20, 1, true), coneMat);
    cone.rotation.x = -Math.PI / 2 + 0.32;
    cone.position.set(0, -Math.sin(0.32) * range / 2, Math.cos(0.32) * range / 2 + 0.3);
    head.add(cone);
    const cam = { group: g, head, led, cone, base: FACE[facing], sweep, range, speed, phase, on: true, yaw: FACE[facing],
      pos: this.place.P(px, pz, y) };
    this.cams.push(cam);
    return cam;
  }

  // ── Per frame ─────────────────────────────────────────────────────────

  update(dt, t) {
    for (const it of this.items) {
      if (it.found) continue;
      it.group.position.y = it.y + Math.sin(t * 2.2 + it.pos.x) * 0.06;
      it.group.rotation.y += dt * 1.6;
    }
    for (const s of this.spinners) s.obj.rotation[s.axis] += s.speed * dt;
    for (const b of this.bobbers) b.obj.position.y = b.base + Math.sin(t * b.speed + b.phase) * b.amp;
    for (const sp of this.saves) sp.glow.material.opacity = 0.1 + Math.sin(t * 2.5 + sp.id) * 0.05;
  }
}

// The save box's face glows a little, so it can be seen in the dark.
const REALGLOW = Math.max(1, GLOW * 0.25);
