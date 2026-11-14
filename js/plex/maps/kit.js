// Shared pieces for Jonathan's Pizzaplex maps and chapters (js/plex/maps/*, chapters/jonathan.js):
// glowing signs, doors that stay locked until a quest opens them, the walkie-talkie (and
// P.A.L.) talking, the things to find that only these chapters have, and the animatronics
// set up the way Jonathan's chapters use them.
import * as THREE from 'three';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth } from '../../models.js';
import { ITEMS } from '../../escape/decor.js';
import { ITEM_ICON, ENTITY } from '../../escape/watch.js';
import { buildBabyGus } from '../../escape/cast.js';
import { buildOld, buildRocco, buildSparky } from '../cast.js';
import { sfx } from '../../audio.js';

export const E = Math.PI / 2, W = -Math.PI / 2, N = Math.PI, S = 0;

// Colours as numbers, like everywhere else; the sign painter wants CSS.
export const css = (c) => (typeof c === 'number' ? '#' + c.toString(16).padStart(6, '0') : c);

// A glowing sign.
export const neon = (d, text, px, pz, y, w, h, facing, fg, glow = fg, bg = '#0a0614') =>
  d.label(text, px, pz, y, w, h, facing, { bg, fg: css(fg), glow: css(glow) });

// ── Locked doors ────────────────────────────────────────────────────────
//
// A steel door filling one of the floor plan's doorways (x0, z0)–(x1, z1), in cells. Locked,
// it blocks you and everything that walks; `set(false)` opens it (and `set(true)` shuts it
// again, for a retry).
export function lockedDoor(d, x0, z0, x1, z1, { color = 0x6a7078, label = null } = {}) {
  const place = d.place;
  const across = x0 === x1;        // a doorway in a wall running north–south
  const w = across ? z1 - z0 + 1 : x1 - x0 + 1;
  const cx = (x0 + x1 + 1) / 2, cz = (z0 + z1 + 1) / 2;
  const g = d.anchor(cx, cz, across ? 'east' : 'south', 0);
  const steel = mat(color, { metal: 0.55, rough: 0.4 });
  const door = d.mesh(G.box, steel, g, { p: [0, 1.25, 0], s: [w, 2.5, 0.14], still: false });
  const lamp = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
  const light = d.mesh(G.box, lamp, g, { p: [w / 2 - 0.25, 1.5, 0.09], s: [0.12, 0.2, 0.03], still: false });
  const light2 = d.mesh(G.box, lamp, g, { p: [w / 2 - 0.25, 1.5, -0.09], s: [0.12, 0.2, 0.03], still: false });
  if (label) {
    // on the wall above the doorway, both sides
    const sides = across ? [['east', x1 + 1.04, cz], ['west', x0 - 0.04, cz]] : [['south', cx, z1 + 1.04], ['north', cx, z0 - 0.04]];
    for (const [f, px, pz] of sides) {
      d.label(label, px, pz, 2.75, Math.min(w + 0.4, 2.6), 0.32, f, { bg: '#2a0606', fg: '#ff3b30', glow: '#ff3b30' });
    }
  }
  let collider = null;
  const lock = {
    locked: false,
    set(on) {
      this.locked = on;
      door.visible = on;
      lamp.color.set(on ? 0xff3b30 : 0x3cff6b);
      const i = place.colliders.indexOf(collider);
      if (i >= 0) place.colliders.splice(i, 1);
      collider = null;
      if (on) collider = place.addBlock(x0, z0, x1 + 1, z1 + 1, 3, { nav: true, margin: 0 });
      else for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) place.walkable[z * place.w + x] = 1;
    },
  };
  void light; void light2;
  lock.set(true);
  return lock;
}

// ── Talking ─────────────────────────────────────────────────────────────
//
// Lines over the walkie-talkie (or P.A.L. on the speakers), one after another: [ms, who,
// text, seconds]. They only play while you're still in that chapter.
export function talk(m, chapterId, lines) {
  for (const [ms, who, text, secs = 3.6] of lines) {
    setTimeout(() => {
      if (m.game.mode !== 'escape' || !m.level || m.def.id !== chapterId) return;
      if (who === 'P.A.L.') { sfx.plexPal(); m.say(text, secs, '🔊 P.A.L.'); return; }
      if (who === 'Jonathan') { m.say(text, secs, 'Jonathan'); return; }
      sfx.plexWalkie();
      m.say(text, secs, `📻 ${who}`);
    }, ms);
  }
}

// ── Things to find ──────────────────────────────────────────────────────

Object.assign(ITEMS, {
  flag: { color: 0xffffff, name: 'checkered flag', build: (d, g) => {
    d.mesh(G.cyl, lam(0x2a2a30), g, { p: [-0.12, 0, 0], s: [0.012, 0.5, 0.012], still: false });
    for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) {
      d.mesh(G.box, (i + k) % 2 ? glowMat(0xffffff, 0.4) : lam(0x111111), g,
        { p: [-0.07 + i * 0.07, 0.17 - k * 0.07, 0], s: [0.07, 0.07, 0.01], still: false });
    }
  } },
  antenna: { color: 0x7cff6b, name: 'antenna piece', build: (d, g, glow) => {
    d.mesh(G.cyl, mat(0xc0c0c8, { metal: 0.8, rough: 0.3 }), g, { s: [0.02, 0.45, 0.02], still: false });
    d.mesh(G.sphere, glow, g, { p: [0, 0.24, 0], s: [0.05, 0.05, 0.05], still: false });
    d.mesh(G.box, mat(0x2a2a30), g, { p: [0, -0.2, 0], s: [0.1, 0.06, 0.1], still: false });
  } },
  pizza: { color: 0xffb02a, name: 'slice of pizza', build: (d, g) => {
    d.mesh(new THREE.ConeGeometry(1, 1, 3), mat(0xffd27a, { rough: 0.7 }), g, { s: [0.16, 0.03, 0.26], r: [0, Math.PI / 6, 0], still: false });
    for (const [x, z] of [[0, 0.04], [-0.04, -0.05], [0.04, -0.04]]) {
      d.mesh(G.cyl, mat(0xc0262d, { rough: 0.6 }), g, { p: [x, 0.02, z], s: [0.03, 0.01, 0.03], still: false });
    }
  } },
  juice: { color: 0x5ad1ff, name: 'juice box', build: (d, g, glow) => {
    d.mesh(G.box, mat(0x3a90c8, { rough: 0.5 }), g, { s: [0.12, 0.18, 0.08], still: false });
    d.mesh(G.cyl, glow, g, { p: [0.03, 0.13, 0], s: [0.008, 0.1, 0.008], r: [0, 0, 0.3], still: false });
  } },
  mbkey: { color: 0xffd23f, name: 'music box key', build: (d, g, glow) => {
    d.mesh(G.torus, glow, g, { p: [0, 0.08, 0], s: [0.08, 0.08, 0.06], still: false });
    d.mesh(G.cyl, glow, g, { p: [0, -0.06, 0], s: [0.025, 0.2, 0.025], still: false });
    d.mesh(G.box, glow, g, { p: [0.04, -0.15, 0], s: [0.06, 0.03, 0.02], still: false });
  } },
});
Object.assign(ITEM_ICON, { flag: '🏁', antenna: '📡', pizza: '🍕', juice: '🧃', mbkey: '🗝️' });
Object.assign(ENTITY, { suit: ['🎭', 'Spare costume'] });

// ── Who's after you ─────────────────────────────────────────────────────

const pick = (a) => () => a[Math.floor(Math.random() * a.length)];

// One of the old ones (Cranker, Chomper, Gerald, Flipper), walking its rounds.
export const bot = (id, name, extra = {}) => ({
  id, name, build: buildOld(id), walk: 1.8, chase: 3.6, sight: 11, hear: 8, hunt: 0.25, lose: 5,
  steps: id, stride: 0.9, shoutWho: name, ...extra,
});

export const rocco = (extra = {}) => ({
  id: 'rocco', name: 'DJ Rocco', build: buildRocco, walk: 2.3, chase: 4.2, sight: 12, hear: 10, hunt: 0.3, lose: 5,
  steps: 'gerald', stride: 1.0, shoutWho: 'DJ Rocco', shout: pick(['Drop the beat!', 'Party time!', 'Nobody leaves the dance floor!']),
  ...extra,
});

// Sparky the robot dog: the fastest thing in the Pizzaplex. Faster than you walk — but not
// than you run, for a bit. Hide.
export const sparky = (extra = {}) => ({
  id: 'sparky', name: 'Sparky', build: buildSparky, walk: 2.6, chase: 4.5, sight: 12, hear: 12, hunt: 0.35, lose: 4,
  steps: 'chomper', stride: 0.6, noticeT: 0.7, shoutWho: 'Sparky', shout: pick(['Woof! WOOF!', 'Wanna race?!', 'Fetch! Fetch!']),
  ...extra,
});

// A baby Gus (from When Jonathan Was Five), toddling about upstairs.
export const baby = (seed, extra = {}) => ({
  id: 'babygus', name: 'a baby Gus', build: () => buildBabyGus(seed), walk: 2.0, chase: 3.6, sight: 9, hear: 7,
  hunt: 0.2, lose: 4, steps: 'cranker', stride: 0.5, ...extra,
});

// Gus himself, standing still until you look away (a Watcher), kept to `area`.
export const watcherGus = (start, yaw, area, extra = {}) => ({
  id: 'gus', kind: 'watcher', name: 'Gus', build: buildOld('gus'), start, yaw, speed: 4.5, reach: 1.4, area,
  asleep: false, ...extra,
});

// Sparky barks when he spots you. Call from a chapter's update.
export function barks(m) {
  for (const e of m.enemies) {
    if (e.id !== 'sparky') continue;
    if (e.state === 'notice' && e._was !== 'notice') sfx.plexBark(e.pos);
    e._was = e.state;
  }
}

export { THREE, G, lam, glowMat, mat, cloth, sfx };
