// Shared pieces for Sushi's Pizzaplex (js/sushi/): the cards and the doors they open, the
// vents you crawl through, the plushies and the Gift Shop's shelf, the noisy toys, ropes to
// climb, and the walkie-talkie lines from Tom's friends.
import * as THREE from 'three';
import { G, lam, glowMat } from '../decor.js';
import { mat, cloth, MODEL_G as MG } from '../models.js';
import { ITEMS } from '../escape/decor.js';
import { ITEM_ICON, ENTITY } from '../escape/watch.js';
import { sfx } from '../audio.js';
import { GLOW } from '../config.js';

export const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;
export const css = (c) => (typeof c === 'number' ? '#' + c.toString(16).padStart(6, '0') : c);

// A glowing sign.
export const neon = (d, text, px, pz, y, w, h, facing, fg, glow = fg, bg = '#0a0614') =>
  d.label(text, px, pz, y, w, h, facing, { bg, fg: css(fg), glow: css(glow) });

Object.assign(ENTITY, {
  sushi: ['🐧', 'Sushi'], gerald: ['🦍', 'Gerald'], chomper: ['🦫', 'Chomper'], flipper: ['🐬', 'Flipper'],
  moony: ['🌙', 'Moony'], peter: ['🦦', '???'],
});

// ── Cards ───────────────────────────────────────────────────────────────
//
// The designer's idea: collect cards to get into locked places. They come a mix of three ways
// (hidden, from friends, from jobs). Blue and green go up in levels; the DAYCARE card only
// opens the daycare; the Security Badge opens every staff lock; the VIP card, from the Gift
// Shop's trade counter, is the only thing that opens VIP Seating.

export const CARDS = {
  blue:    { name: 'Blue card', icon: '🟦', color: 0x3a8aff, css: '#3a8aff', rank: 1 },
  green:   { name: 'Green card', icon: '🟩', color: 0x3cdc6b, css: '#3cdc6b', rank: 2 },
  daycare: { name: 'DAYCARE card', icon: '🟪', color: 0xc040ff, css: '#c040ff', rank: 0 },
  badge:   { name: 'Security Badge', icon: '🟨', color: 0xffd23f, css: '#ffd23f', rank: 3 },
  vip:     { name: 'VIP card', icon: '💗', color: 0xff3fa4, css: '#ff3fa4', rank: 0 },
};

// Does a set of cards open a lock that needs `need`?
export function opens(have, need) {
  if (have.has(need)) return true;
  if (need === 'vip' || need === 'daycare') return need === 'daycare' && have.has('badge');
  const r = CARDS[need].rank;
  return [...have].some((c) => CARDS[c] && CARDS[c].rank >= r && CARDS[c].rank > 0);
}

// The best card you've got, for the top of the screen.
export function bestCard(have) {
  for (const c of ['badge', 'green', 'blue', 'daycare']) if (have.has(c)) return c;
  return null;
}

const cardMesh = (d, g, color, stripe = 0xffffff) => {
  d.mesh(G.box, glowMat(color, 0.55), g, { s: [0.32, 0.21, 0.02], still: false });
  d.mesh(G.box, lam(stripe), g, { p: [0, 0.04, 0.012], s: [0.22, 0.04, 0.005], still: false });
  d.mesh(G.box, lam(0x111111), g, { p: [0, -0.05, 0.012], s: [0.26, 0.03, 0.005], still: false });
  d.mesh(G.box, mat(0xd8b040, { metal: 0.8 }), g, { p: [-0.09, -0.01, 0.012], s: [0.06, 0.05, 0.005], still: false });
};

// ── Plushies ────────────────────────────────────────────────────────────
//
// Twelve, three in each part, one of everybody. Each is a little soft figure: a round body,
// a round head, and the one thing that says who it is.

export const PLUSHIES = {
  p1: { who: 'sushi', name: 'Sushi plushie', part: 1 },
  p2: { who: 'moony', name: 'Moony plushie', part: 1 },
  p3: { who: 'gus', name: 'Gus plushie', part: 1 },
  p4: { who: 'gerald', name: 'Gerald plushie', part: 2 },
  p5: { who: 'baby', name: 'baby Gerald plushie', part: 2 },
  p6: { who: 'cranker', name: 'Cranker plushie', part: 2 },
  p7: { who: 'chomper', name: 'Chomper plushie', part: 3 },
  p8: { who: 'flipper', name: 'Flipper plushie', part: 3 },
  p9: { who: 'sushi2', name: 'golden Sushi plushie', part: 3 },
  p10: { who: 'otter', name: 'otter plushie', part: 4 },
  p11: { who: 'pjork', name: 'Pjork plushie', part: 4 },
  p12: { who: 'gold', name: 'golden Gus plushie', part: 4 },
};
export const PLUSH_COUNT = Object.keys(PLUSHIES).length;

const LOOK = {
  sushi:   { body: 0x1d2230, belly: 0xf2f4f7, head: 0x1d2230, bit: 0xff8a1a, band: 0xc0102a },
  sushi2:  { body: 0xf2c230, belly: 0xfff2a0, head: 0xf2c230, bit: 0xff8a1a, band: 0xc0102a, gold: true },
  moony:   { body: 0x1c1530, belly: 0x3b2f5c, head: 0x1c1530, bit: 0x23262f, hat: 0x0d0b14 },
  gus:     { body: 0x7a4a2b, belly: 0xc99a6b, head: 0x7a4a2b, bit: 0x4a5262, hat: 0x5b2a86 },
  gold:    { body: 0xf2c230, belly: 0xfff2a0, head: 0xf2c230, bit: 0xd8a020, hat: 0x5b2a86, gold: true },
  gerald:  { body: 0x3a3a44, belly: 0x9b8f86, head: 0x3a3a44, bit: 0x9b8f86 },
  baby:    { body: 0x5a5a66, belly: 0xffd23f, head: 0x5a5a66, bit: 0xb8aca2 },
  cranker: { body: 0x1d2230, belly: 0xf2f4f7, head: 0x1d2230, bit: 0xff9a1f, band: 0x3fb8ff },
  chomper: { body: 0xa8642e, belly: 0xe8c39a, head: 0xa8642e, bit: 0xfffbe6, hat: 0xf2c230 },
  flipper: { body: 0x5b8fc4, belly: 0xd9e8f5, head: 0x5b8fc4, bit: 0xd9e8f5 },
  otter:   { body: 0x5a3e2a, belly: 0xcfb48a, head: 0x5a3e2a, bit: 0xcfb48a, band: 0x5b3a6e },
  pjork:   { body: 0xff9ab8, belly: 0xffc8d8, head: 0xff9ab8, bit: 0xff7aa0 },
};

export function plushMesh(d, g, who, s = 1) {
  const L = LOOK[who] || LOOK.sushi;
  const soft = (c) => (L.gold ? mat(c, { metal: 0.7, rough: 0.3, emissive: 0x4a3400 }) : cloth(c));
  const m = (geo, c, p, sc, r = [0, 0, 0]) => d.mesh(geo, soft(c), g, { p: p.map((v) => v * s), s: sc.map((v) => v * s), r, still: false });
  m(G.sphere, L.body, [0, -0.06, 0], [0.13, 0.15, 0.11]);
  m(G.sphere, L.belly, [0, -0.07, 0.06], [0.09, 0.1, 0.06]);
  m(G.sphere, L.head, [0, 0.13, 0], [0.1, 0.1, 0.1]);
  m(G.sphere, L.bit, [0, 0.11, 0.09], [0.05, 0.03, 0.05]);     // snout / beak / bill
  for (const sx of [-1, 1]) d.mesh(MG.sphereLo, lam(0x111111), g, { p: [sx * 0.035 * s, 0.16 * s, 0.085 * s], s: [0.014 * s, 0.014 * s, 0.01 * s], still: false });
  if (L.hat) m(G.cyl, L.hat, [0, 0.25, 0], [0.06, 0.08, 0.06]);
  if (L.band) m(MG.torus, L.band, [0, 0.18, 0], [0.1, 0.1, 0.1], [Math.PI / 2, 0, 0]);
}

Object.assign(ITEMS, {
  cblue: { color: 0x3a8aff, name: 'blue key card', build: (d, g) => cardMesh(d, g, CARDS.blue.color) },
  splush: { color: 0xffd23f, name: 'plushie', build: (d, g, glow, id) => plushMesh(d, g, (PLUSHIES[id] || PLUSHIES.p1).who) },
  cpart: { color: 0xff9a1f, name: 'coaster part', build: (d, g, glow, id) => {
    const steel = mat(0xb8c0c8, { metal: 0.8, rough: 0.3 });
    if (id === 'gear') {
      d.mesh(G.cyl, glow, g, { s: [0.15, 0.04, 0.15], r: [Math.PI / 2, 0, 0], still: false });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        d.mesh(G.box, glow, g, { p: [Math.cos(a) * 0.17, Math.sin(a) * 0.17, 0], s: [0.05, 0.05, 0.04], r: [0, 0, a], still: false });
      }
    } else if (id === 'chain') {
      for (let k = 0; k < 4; k++) d.mesh(MG.torus, k % 2 ? steel : glow, g, { p: [(k - 1.5) * 0.09, 0, 0], s: [0.06, 0.035, 0.035], r: [0, k % 2 ? Math.PI / 2 : 0, 0], still: false });
    } else {
      d.mesh(G.cyl, steel, g, { p: [0, -0.05, 0], s: [0.02, 0.32, 0.02], still: false });
      d.mesh(G.sphere, glow, g, { p: [0, 0.13, 0], s: [0.06, 0.06, 0.06], still: false });
    }
  } },
  clue: { color: 0xfff2c0, name: 'clue', build: (d, g, glow) => {
    d.mesh(G.box, lam(0xf4ecd6), g, { s: [0.26, 0.34, 0.01], still: false });
    d.mesh(G.box, glow, g, { p: [0, 0, 0.007], s: [0.2, 0.26, 0.002], still: false });
  } },
  badge: { color: 0xffd23f, name: 'Security Badge', build: (d, g) => cardMesh(d, g, 0xffd23f, 0x2a2a30) },
});
Object.assign(ITEM_ICON, { cblue: '🟦', splush: '🧸', cpart: '⚙️', clue: '📄', badge: '🟨' });

// ── Doors with card readers ─────────────────────────────────────────────
//
// A steel door filling one of the floor plan's doorways (x0, z0)–(x1, z1), in cells, with a
// card reader in the colour of the card it wants. Locked, it blocks you and everything that
// walks. `vent` makes it a small grate instead (for a vent opening).

export function cardDoor(d, x0, z0, x1, z1, need, { label = null, vent = false } = {}) {
  const place = d.place;
  const across = x0 === x1;        // a doorway in a wall running north–south
  const w = across ? z1 - z0 + 1 : x1 - x0 + 1;
  const cx = (x0 + x1 + 1) / 2, cz = (z0 + z1 + 1) / 2;
  const g = d.anchor(cx, cz, across ? 'east' : 'south', 0);
  const info = CARDS[need];
  const h = vent ? 1.0 : 2.5;
  const panel = vent ? mat(0x8a9098, { metal: 0.6, rough: 0.4 }) : mat(0x5a6068, { metal: 0.55, rough: 0.45 });
  const door = d.mesh(G.box, panel, g, { p: [0, h / 2, 0], s: [w, h, vent ? 0.05 : 0.14], still: false });
  const slats = [];
  if (vent) for (let k = 0; k < 5; k++) slats.push(d.mesh(G.box, lam(0x2a2c31), g, { p: [0, 0.15 + k * 0.17, 0.03], s: [w * 0.85, 0.04, 0.02], still: false }));
  // a stripe in the card's colour across the door, and the reader beside it
  const stripe = d.mesh(G.box, glowMat(info.color, 0.35), g, { p: [0, vent ? 0.92 : 1.6, vent ? 0.03 : 0.075], s: [w * 0.9, 0.08, 0.01], still: false });
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
  const readers = [];
  for (const side of [1, -1]) {
    const r = d.mesh(G.box, lam(0x1a1a1e), g, { p: [w / 2 + 0.22, vent ? 0.6 : 1.25, side * 0.1], s: [0.16, 0.24, 0.04], still: false });
    readers.push(r, d.mesh(G.box, glowMat(info.color, 0.5), g, { p: [w / 2 + 0.22, vent ? 0.66 : 1.31, side * 0.125], s: [0.1, 0.05, 0.01], still: false }));
    readers.push(d.mesh(G.box, lampMat, g, { p: [w / 2 + 0.22, vent ? 0.54 : 1.19, side * 0.125], s: [0.04, 0.04, 0.01], still: false }));
  }
  if (label) {
    const sides = across ? [['east', x1 + 1.04, cz], ['west', x0 - 0.04, cz]] : [['south', cx, z1 + 1.04], ['north', cx, z0 - 0.04]];
    for (const [f, px, pz] of sides) {
      d.label(`${label}\n${info.icon} ${info.name.toUpperCase()}`, px, pz, vent ? 1.5 : 2.75, Math.min(w + 0.6, 2.6), vent ? 0.42 : 0.5, f,
        { bg: '#0a0a12', fg: info.css, glow: info.css });
    }
  }
  let collider = null;
  const pos = place.P(cx, cz);
  const lock = {
    need, pos, locked: false, label: label || info.name, vent,
    set(on) {
      this.locked = on;
      door.visible = stripe.visible = on;
      for (const s of slats) s.visible = on;
      lampMat.color.set(on ? 0xff3b30 : 0x3cff6b).multiplyScalar(Math.max(1, GLOW * 0.4));
      const i = place.colliders.indexOf(collider);
      if (i >= 0) place.colliders.splice(i, 1);
      collider = null;
      if (on) collider = place.addBlock(x0, z0, x1 + 1, z1 + 1, 3, { nav: true, margin: 0 });
      else for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) place.walkable[z * place.w + x] = lock.navOpen === false ? 0 : 1;
    },
  };
  // (a vent's grate opens for you, but the cells behind it stay off the walking grid)
  if (vent) lock.navOpen = false;
  lock.set(true);
  (d.cardDoors || (d.cardDoors = [])).push(lock);
  return lock;
}

// ── Vents ───────────────────────────────────────────────────────────────
//
// "Vents can go above and below the pizzeria" (the designer). A vent is a run of floor-plan
// cells too low to stand up in: a metal duct (`up`, the ones that run above the rooms) or a
// dark concrete crawlspace with pipes (`down`, under the floor). Nothing that walks fits in
// them, so they come off the walking grid.

export function vent(d, x0, z0, x1, z1, { kind = 'up', h = 1.05, walk = false } = {}) {
  const P = d.place.P;
  const up = kind === 'up';
  const skin = up ? mat(0x9aa2aa, { metal: 0.65, rough: 0.35 }) : mat(0x4a4640, { rough: 0.95 });
  const a = P(x0, z0), b = P(x1 + 1, z1 + 1);
  const midX = (a.x + b.x) / 2, midZ = (a.z + b.z) / 2, w = b.x - a.x, dd = b.z - a.z;
  // the low ceiling, and the duct's floor
  d.mesh(G.box, skin, d.group, { p: [midX, h, midZ], s: [w, 0.05, dd] });
  d.mesh(G.plane, up ? mat(0x7a828a, { metal: 0.6, rough: 0.4 }) : mat(0x2e2c28, { rough: 1 }), d.group,
    { p: [midX, 0.02, midZ], s: [w, dd, 1], r: [-Math.PI / 2, 0, 0], shadow: false });
  // seams every metre and a half (ducts) or pipes along the ceiling (the crawlspace)
  const long = w > dd;
  const len = long ? w : dd;
  for (let t = 0.75; t < len; t += 1.5) {
    const px = long ? a.x + t : midX, pz = long ? midZ : a.z + t;
    if (up) d.mesh(G.box, mat(0x6a727a, { metal: 0.7 }), d.group, { p: [px, h - 0.04, pz], s: [long ? 0.05 : w, 0.04, long ? dd : 0.05] });
    else if (Math.round(t / 1.5) % 3 === 0) d.mesh(G.box, mat(0x2a3a2a, { rough: 0.9 }), d.group, { p: [px, 0.025, pz], s: [long ? 1.0 : w * 0.6, 0.01, long ? dd * 0.6 : 1.0] });
  }
  if (!up) {
    const pipe = mat(0x6a4a3a, { metal: 0.5, rough: 0.6 });
    for (const off of [-0.25, 0.25]) {
      d.mesh(G.cyl, pipe, d.group, { p: [long ? midX : midX + off * w, h - 0.12, long ? midZ + off * dd : midZ], s: [0.05, len, 0.05], r: long ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0] });
    }
  }
  // a dim light every few metres so it isn't pitch black
  for (let t = 2; t < len; t += 5) {
    const px = long ? x0 + t : (x0 + x1 + 1) / 2, pz = long ? (z0 + z1 + 1) / 2 : z0 + t;
    d.lamp(px, pz, h - 0.08, up ? 0x9fd8ff : 0xffb070, 0.35, { distance: 3, bulb: true, size: 0.035 });
  }
  // (`walk`: Peter's ducts, in the last part — he crawls them too)
  if (!walk) d.place.blockNav(x0 + 0.01, z0 + 0.01, x1 + 0.99, z1 + 0.99, 0);
  (d.vents || (d.vents = [])).push({ x0, z0, x1: x1 + 1, z1: z1 + 1 });
}

// You can't stand up in a vent. Call from a part's update.
export function crawl(m, zones) {
  const p = m.player;
  for (const z of zones || []) {
    const a = m.place.P(z.x0, z.z0), b = m.place.P(z.x1, z.z1);
    if (p.pos.x > a.x && p.pos.x < b.x && p.pos.z > a.z && p.pos.z < b.z) {
      if (!p.crouching) {
        p.crouching = true;
        if (!m.ventToast) { m.ventToast = true; m.game.hud.toast('⤓ It\'s too low to stand up in a vent — crawl!', 2.6); }
      }
      return true;
    }
  }
  return false;
}

// ── Noisy toys ──────────────────────────────────────────────────────────
//
// The Distraction ("like in Security Breach"): wind one up (E) and it plays a jingle for ten
// seconds, lights flashing; whatever hears it goes over to look. Then it needs winding again.

export function noiseToy(d, id, px, pz, facing = 'south') {
  const t = d.target(id, px, pz, facing, 'Wind up the noisy toy 🎵', (g) => {
    d.mesh(G.cyl, mat(0xff3fa4, { rough: 0.4 }), g, { p: [0, 0.3, 0], s: [0.35, 0.6, 0.35] });
    d.mesh(G.cyl, mat(0xffd23f, { rough: 0.4 }), g, { p: [0, 0.62, 0], s: [0.38, 0.06, 0.38] });
    // a jack-in-the-box clown's head on its spring
    const head = d.mesh(G.sphere, mat(0xf4f1ea, { rough: 0.4 }), g, { p: [0, 0.85, 0], s: [0.16, 0.16, 0.16], still: false });
    d.mesh(MG.sphereLo, mat(0xc0102a), g, { p: [0, 0.85, 0.15], s: [0.04, 0.04, 0.04] });
    d.mesh(G.box, mat(0xc8c8c8, { metal: 0.7 }), g, { p: [0.42, 0.35, 0], s: [0.25, 0.04, 0.04] });
    const light = d.mesh(MG.sphereLo, glowMat(0x5ad1ff, 0.2), g, { p: [0, 0.68, 0.34], s: [0.06, 0.06, 0.06], still: false });
    d.toys = d.toys || [];
    d.toys.push({ id, head, light, on: 0, cool: 0 });
  }, { reach: 1.5 });
  d.place.addBlock(px - 0.4, pz - 0.4, px + 0.4, pz + 0.4, 0.7);
  return t;
}

// Wind it up: every enemy that's awake and can hear comes to look.
export function windToy(m, id) {
  const toy = m.decor.toys.find((t) => t.id === id);
  if (!toy) return false;
  if (toy.cool > 0) {
    sfx.repairBad();
    m.game.hud.toast(`🎵 It's still winding down... ${Math.ceil(toy.cool)} s`, 2);
    return false;
  }
  toy.on = 10;
  toy.cool = 22;
  const t = m.decor.targets.find((x) => x.id === id);
  for (const e of m.enemies) if (e.alert && e.root.visible) e.alert(t.pos.clone(), true);
  sfx.musicBoxSting();
  m.game.hud.toast('🎵 Diddle-diddle-dee! Something will come to look — sneak past!', 3);
  return true;
}

export function updateToys(m, dt) {
  for (const toy of m.decor.toys || []) {
    toy.cool = Math.max(0, toy.cool - dt);
    if (toy.on > 0) {
      toy.on -= dt;
      toy.head.position.y = 0.85 + Math.abs(Math.sin(m.game.t * 9)) * 0.3;
      toy.light.material.color.set(Math.sin(m.game.t * 14) > 0 ? 0xff3fa4 : 0x5ad1ff).multiplyScalar(2);
      toy.ding = (toy.ding ?? 0) - dt;
      if (toy.ding <= 0) { toy.ding = 0.9; sfx.escCollect(); }
      // keep calling them over while it plays
      const t = m.decor.targets.find((x) => x.id === toy.id);
      for (const e of m.enemies) if (e.alert && e.root.visible && e.state !== 'chase' && e.state !== 'notice') e.alert(t.pos.clone(), false);
    } else {
      toy.head.position.y = 0.85;
      toy.light.material.color.set(0x5ad1ff).multiplyScalar(0.4);
    }
  }
}

// ── Ropes ───────────────────────────────────────────────────────────────
//
// "Use ropes to get to these" (the designer's note on the daycare map): a rope hanging down to
// a high platform. E climbs it; you step off the edge to come back down.

export function rope(d, id, px, pz, topX, topZ, topH, facing = 'south') {
  const P = d.place.P;
  const c = P(px, pz);
  const top = P(topX, topZ);
  d.mesh(G.cyl, cloth(0xd8c08a), d.group, { p: [c.x, topH / 2 + 0.6, c.z], s: [0.03, topH + 1.2, 0.03] });
  for (let k = 0.5; k < topH; k += 0.5) d.mesh(MG.sphereLo, cloth(0xc8b07a), d.group, { p: [c.x, k, c.z], s: [0.05, 0.05, 0.05] });
  const t = d.target(id, px, pz, facing, 'Climb the rope 🧗', null, { reach: 1.3 });
  t.top = top.setY(topH);
  return t;
}

// A high platform you can stand on (reached by a rope): it blocks you at ground level and holds
// you up once you're on top.
export function platform(d, px, pz, w, dd, h, color = 0xffd23f) {
  d.block(px, pz, w, dd, 0.12, mat(color, { rough: 0.4 }), { y: h - 0.12, solid: false, nav: false });
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    d.block(px + sx * (w / 2 - 0.1), pz + sz * (dd / 2 - 0.1), 0.14, 0.14, h - 0.12, mat(0x2a4fa0, { rough: 0.4 }), { solid: false, nav: false });
  }
  // a little rail round the edge, low enough to step over
  const a = d.place.P(px - w / 2, pz - dd / 2), b = d.place.P(px + w / 2, pz + dd / 2);
  d.place.raised.push({ x0: a.x, z0: a.z, x1: b.x, z1: b.z, h });
  d.place.addBlock(px - w / 2, pz - dd / 2, px + w / 2, pz + dd / 2, h - 0.05);
}

// ── The walkie-talkies ──────────────────────────────────────────────────
//
// Billy brought walkie-talkies: one each. Lines are [ms, who, text, seconds], and only play while
// you're still in that part.

export function talk(m, partId, lines) {
  for (const [ms, who, text, secs = 3.6] of lines) {
    setTimeout(() => {
      if (m.game.mode !== 'escape' || !m.level || m.def.id !== partId) return;
      if (who === 'Tom') { m.say(text, secs, 'Tom'); return; }
      if (who === '???') { sfx.musicBoxSting(); m.say(text, secs, '???'); return; }
      sfx.plexWalkie();
      m.say(text, secs, `📻 ${who}`);
    }, ms);
  }
}

// ── The Gift Shop's shelf ───────────────────────────────────────────────
//
// Twelve spots in a row on a glass shelf. Traded plushies stand on it (setShelf shows them).

export function plushShelf(d, px, pz, facing = 'south') {
  const g = d.anchor(px, pz, facing, 0);
  const wood = mat(0x6a4a2a, { rough: 0.7 });
  d.mesh(G.box, wood, g, { p: [0, 1.0, -0.15], s: [3.2, 2.0, 0.1] });
  for (const y of [0.9, 1.45]) d.mesh(G.box, mat(0xbfe9ff, { rough: 0.05, metal: 0.1 }), g, { p: [0, y, 0.05], s: [3.1, 0.03, 0.4] });
  const spots = [];
  Object.keys(PLUSHIES).forEach((id, i) => {
    const row = i < 6 ? 0 : 1;
    const slot = new THREE.Group();
    slot.position.set(-1.3 + (i % 6) * 0.52, (row ? 1.45 : 0.9) + 0.17, 0.05);
    g.add(slot);
    plushMesh(d, slot, PLUSHIES[id].who, 1.0);
    // an empty spot shows a little tag with a question mark instead
    const tag = d.mesh(G.box, lam(0xf4ecd6), g, { p: [slot.position.x, slot.position.y - 0.12, 0.2], s: [0.14, 0.06, 0.01], still: false });
    spots.push({ id, slot, tag });
  });
  d.label('🧸 PLUSHIE SHELF', px, pz, 2.25, 2.2, 0.32, facing, { bg: '#2a0e33', fg: '#ffd23f', glow: '#ff3fa4' });
  const ns = facing === 'south' || facing === 'north';
  d.place.addBlock(px - (ns ? 1.7 : 0.35), pz - (ns ? 0.35 : 1.7), px + (ns ? 1.7 : 0.35), pz + (ns ? 0.35 : 1.7), 2.0);
  d.plushSpots = spots;
  d.shelfGroup = g;
  return spots;
}

export function setShelf(d, onShelf) {
  for (const s of d.plushSpots || []) {
    s.slot.visible = !!onShelf[s.id];
    s.tag.visible = !onShelf[s.id];
  }
}

// ── More places to hide ─────────────────────────────────────────────────
//
// "Hide in shelves, carts etc." (the designer): a tall shelf unit with a gap at the bottom you
// squeeze into, a cleaning cart with a cloth over it, and a stack of old tyres. They work like
// the other hiding spots (EscapeDecor.hideSpot): E to get in, a clear view out.

export function hideIn(d, kind, px, pz, facing = 'south', { color = null } = {}) {
  const g = d.anchor(px, pz, facing, 0);
  let w = 1.2, dd = 0.7, h = 1.9, eye = 0.55, name = 'Hide';
  if (kind === 'shelf') {
    name = 'Squeeze into the shelf';
    const wood = mat(color ?? 0x6a4a2a, { rough: 0.7 });
    d.mesh(G.box, wood, g, { p: [0, 0.95, -0.3], s: [w, 1.9, 0.08] });
    for (const sx of [-1, 1]) d.mesh(G.box, wood, g, { p: [sx * w / 2, 0.95, 0], s: [0.06, 1.9, dd] });
    for (const y of [0.95, 1.4, 1.85]) d.mesh(G.box, wood, g, { p: [0, y, 0], s: [w, 0.05, dd] });
    // boxes of old stock on the upper shelves, a cloth hanging over the bottom gap
    for (const [x, y, c] of [[-0.3, 1.1, 0x2a6ad8], [0.25, 1.1, 0xc0262d], [0, 1.55, 0xffd23f]]) d.mesh(G.box, lam(c), g, { p: [x, y, 0], s: [0.35, 0.26, 0.4] });
    d.mesh(G.box, cloth(0x7a2a3a), g, { p: [0, 0.48, dd / 2 - 0.02], s: [w - 0.08, 0.9, 0.02] });
  } else if (kind === 'cart') {
    name = 'Hide in the cart';
    w = 1.3; dd = 0.8; h = 1.1; eye = 0.5;
    const steel = mat(0x8a9098, { metal: 0.6, rough: 0.4 });
    d.mesh(G.box, lam(color ?? 0x3a6ab8), g, { p: [0, 0.55, 0], s: [w, 0.75, dd] });
    d.mesh(G.box, cloth(0xd8d0c0), g, { p: [0, 0.95, 0.05], s: [w + 0.04, 0.06, dd + 0.04] });
    d.mesh(G.cyl, steel, g, { p: [0, 1.05, -dd / 2 - 0.1], s: [0.025, w, 0.025], r: [0, 0, Math.PI / 2] });
    for (const [x, z] of [[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]]) d.mesh(G.cyl, lam(0x111111), g, { p: [x, 0.08, z], s: [0.08, 0.05, 0.08], r: [0, 0, Math.PI / 2] });
  } else if (kind === 'tires') {
    name = 'Hide in the tyre stack';
    w = 1.2; dd = 1.2; h = 1.5; eye = 0.6;
    for (let k = 0; k < 5; k++) d.mesh(MG.torus, lam(0x16161a), g, { p: [0, 0.16 + k * 0.28, 0], s: [0.5, 0.5, 0.9], r: [Math.PI / 2, 0, 0] });
  }
  const ns = facing === 'south' || facing === 'north';
  const bw = ns ? w : dd, bd = ns ? dd : w;
  d.place.addBlock(px - bw / 2, pz - bd / 2, px + bw / 2, pz + bd / 2, h);
  const yaw = FACE_OF[facing] + Math.PI;
  const front = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), FACE_OF[facing]);
  const pos = d.place.P(px, pz);
  const spot = {
    id: d.hides.length, kind, name, pos, yaw, group: g,
    eye: pos.clone().addScaledVector(front, dd * 0.3).setY(eye),
    out: pos.clone().addScaledVector(front, dd / 2 + 0.6),
  };
  d.hides.push(spot);
  return spot;
}
const FACE_OF = { south: 0, north: Math.PI, east: Math.PI / 2, west: -Math.PI / 2 };

// A vent opening in a wall: the doorway's top is filled in down to vent height, so it reads as
// a hole you crawl through. (x, z) is the doorway cell.
export function ventHole(d, x, z, { across = false, h = 1.05 } = {}) {
  const wallH = d.place.wallH;
  const top = Math.min(3.0, wallH - 0.5);
  d.block(x + 0.5, z + 0.5, 1.0, 1.0, top - h, mat(0x2a2c31, { metal: 0.3, rough: 0.6 }), { y: h, solid: false, nav: false });
  // a grille frame round the hole on both sides
  const frame = mat(0x9aa2aa, { metal: 0.65, rough: 0.35 });
  for (const s of [-0.5, 0.5]) {
    const px = across ? x + 0.5 + s : x + 0.5, pz = across ? z + 0.5 : z + 0.5 + s;
    d.block(px, pz, across ? 0.04 : 1.0, across ? 1.0 : 0.04, 0.06, frame, { y: h, solid: false, nav: false });
  }
  d.place.blockNav(x + 0.01, z + 0.01, x + 0.99, z + 0.99, 0);
  (d.vents || (d.vents = [])).push({ x0: x, z0: z, x1: x + 1, z1: z + 1 });
}

export { THREE, G, lam, glowMat, mat, cloth, sfx };
