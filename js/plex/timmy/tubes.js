// Timmy's chapters (the designer's call: "play tubes hide & seek"). Timmy is six, the smallest
// of all of them, so he fits in the play tubes and the little play houses that nothing else
// can get into.
//
//   Tubes        crawl tunnels on the floor. You crawl in them (you can't stand up), and
//                anything more than an arm's length inside one can't see you or reach you.
//   Play houses  little huts where tubes meet, with doorways out onto the floor. Stand in
//                the middle of one and you're hidden too.
//
// The animatronics walk the open floor between them. Anything that saw you dive in comes to
// the opening and waits — so come out somewhere else.
//
// A tube world is a list of houses ({ x, z, open: 'nesw' — which sides have a doorway }) and
// tubes ([x0, z0, x1, z1], straight, from house to house or out onto the floor). Houses are
// 3 m square, centred on (x, z); tubes are 1.1 m across.
import * as THREE from 'three';
import { G, lam } from '../../decor.js';
import { mat } from '../../models.js';
import { ITEMS } from '../../escape/decor.js';
import { ITEM_ICON } from '../../escape/watch.js';
import { glowMat } from '../../decor.js';

const R = 0.55;          // a tube's radius
const HOUSE = 1.5;       // half a house's width
const DOOR = 0.6;        // half a doorway's width
const WALL_H = 1.3;

const COLORS = [0xff3b30, 0x2a6ad8, 0xffd23f, 0x2fa04a, 0xff7eb6, 0xa970ff, 0xff9a1f, 0x3ec1d3];

// The music box key, in three pieces (Chapter 39).
Object.assign(ITEMS, {
  keypiece: { color: 0xffd23f, name: 'piece of the music box key', build: (d, g, glow) => {
    d.mesh(G.cyl, glow, g, { s: [0.035, 0.26, 0.035], r: [0, 0, Math.PI / 2], still: false });
    d.mesh(new THREE.TorusGeometry(0.07, 0.022, 8, 16), glow, g, { p: [-0.16, 0, 0], still: false });
    d.mesh(G.box, glow, g, { p: [0.13, -0.04, 0], s: [0.04, 0.08, 0.03], still: false });
  } },
});
Object.assign(ITEM_ICON, { keypiece: '🗝️' });

export function buildTubes(d, { tubes = [], houses = [] }) {
  const P = d.place.P;
  const hidden = [];
  let ci = 0;
  // ── the play houses
  for (const h of houses) {
    const color = COLORS[ci++ % COLORS.length];
    const wall = mat(color, { rough: 0.35 });
    const open = h.open || '';
    const side = (dir, x0, z0, x1, z1) => {
      // a wall along one side, with a doorway in the middle if that side's open
      const along = Math.abs(x1 - x0) > Math.abs(z1 - z0);
      const len = along ? x1 - x0 : z1 - z0;
      const parts = open.includes(dir) ? [[-len / 2, -DOOR], [DOOR, len / 2]] : [[-len / 2, len / 2]];
      for (const [a, b] of parts) {
        const mid = (a + b) / 2, l = b - a;
        const cx = along ? (x0 + x1) / 2 + mid : x0, cz = along ? z0 : (z0 + z1) / 2 + mid;
        d.block(cx, cz, along ? l : 0.12, along ? 0.12 : l, WALL_H, wall, { nav: false });
      }
    };
    const { x, z } = h;
    side('n', x - HOUSE, z - HOUSE, x + HOUSE, z - HOUSE);
    side('s', x - HOUSE, z + HOUSE, x + HOUSE, z + HOUSE);
    side('w', x - HOUSE, z - HOUSE, x - HOUSE, z + HOUSE);
    side('e', x + HOUSE, z - HOUSE, x + HOUSE, z + HOUSE);
    // the pointy roof
    const c = P(x, z, WALL_H);
    d.mesh(new THREE.ConeGeometry(HOUSE * 1.45, 1.1, 4), mat(COLORS[(ci + 3) % COLORS.length], { rough: 0.35 }), d.group,
      { p: [c.x, c.y + 0.55, c.z], r: [0, Math.PI / 4, 0] });
    d.mesh(G.box, lam(0x2a2030), d.group, { p: [c.x, c.y - 0.02, c.z], s: [HOUSE * 2, 0.04, HOUSE * 2], shadow: false });
    // nothing else fits inside
    d.place.blockNav(x - HOUSE + 0.1, z - HOUSE + 0.1, x + HOUSE - 0.1, z + HOUSE - 0.1, 0);
    hidden.push({ x0: x - HOUSE + 0.45, z0: z - HOUSE + 0.45, x1: x + HOUSE - 0.45, z1: z + HOUSE - 0.45, house: true });
  }
  // ── the tubes
  for (const [x0, z0, x1, z1] of tubes) {
    const color = COLORS[ci++ % COLORS.length];
    const along = Math.abs(x1 - x0) > Math.abs(z1 - z0);
    const len = along ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const c = P(cx, cz, R);
    const shell = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.05, side: THREE.DoubleSide });
    d.mesh(new THREE.CylinderGeometry(R, R, len, 20, 1, true), shell, d.group,
      { p: [c.x, c.y, c.z], r: along ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0] });
    // rims at the ends, and little round windows along it
    for (const e of [-1, 1]) {
      const p = P(cx + (along ? e * len / 2 : 0), cz + (along ? 0 : e * len / 2), R);
      d.mesh(new THREE.TorusGeometry(R, 0.05, 8, 20), mat(0xf4f1ea, { rough: 0.3 }), d.group,
        { p: [p.x, p.y, p.z], r: along ? [0, Math.PI / 2, 0] : [0, 0, 0] });
    }
    // the sides you bump into (the shell's too low to stand up in — bedroom.js-style crawl)
    if (along) {
      for (const s of [-1, 1]) d.place.addBlock(Math.min(x0, x1), cz + s * R - 0.05, Math.max(x0, x1), cz + s * R + 0.05, R * 2, { nav: false });
    } else {
      for (const s of [-1, 1]) d.place.addBlock(cx + s * R - 0.05, Math.min(z0, z1), cx + s * R + 0.05, Math.max(z0, z1), R * 2, { nav: false });
    }
    d.place.blockNav(along ? Math.min(x0, x1) : cx - R, along ? cz - R : Math.min(z0, z1), along ? Math.max(x0, x1) : cx + R, along ? cz + R : Math.max(z0, z1), 0);
    // in it, past an arm's length from either end, you're out of sight and out of reach
    const inset = 0.8;
    hidden.push(along
      ? { x0: Math.min(x0, x1) + inset, z0: cz - R, x1: Math.max(x0, x1) - inset, z1: cz + R, tube: true, crawl: { x0: Math.min(x0, x1), z0: cz - R, x1: Math.max(x0, x1), z1: cz + R } }
      : { x0: cx - R, z0: Math.min(z0, z1) + inset, x1: cx + R, z1: Math.max(z0, z1) - inset, tube: true, crawl: { x0: cx - R, z0: Math.min(z0, z1), x1: cx + R, z1: Math.max(z0, z1) } });
  }
  d.hiddenZones = hidden;
  return hidden;
}

// Every frame of a Timmy chapter: are you in a tube or a house? In a tube you crawl; deep
// enough in either and nothing can see you or grab you.
export function updateTubes(m) {
  const p = m.player, d = m.decor;
  const zones = d.hiddenZones || [];
  const a = (z) => m.place.P(z.x0, z.z0), b = (z) => m.place.P(z.x1, z.z1);
  const inside = (z) => { const A = a(z), B = b(z); return p.pos.x > A.x && p.pos.x < B.x && p.pos.z > A.z && p.pos.z < B.z; };
  let unseen = false, crawl = false;
  for (const z of zones) {
    if (z.crawl && inside(z.crawl)) crawl = true;
    if (inside(z)) unseen = true;
  }
  if (crawl && !p.crouching) p.crouching = true;
  if (unseen !== m.unseen) {
    m.unseen = unseen;
    if (unseen) {
      // anything chasing you loses you here, and goes to where it saw you last
      for (const e of m.enemies) if (e.chasing && e.state !== 'getHidden') { e.state = 'search'; e.searchRun = false; e.goTo(e.lastSeen); }
      m.check('hide');
    }
  }
  let tag = document.getElementById('timmyTag');
  if (!tag) {
    tag = document.createElement('div');
    tag.id = 'timmyTag';
    tag.className = 'crouch-tag';
    tag.style.cssText = 'position:absolute;left:50%;bottom:calc(84px + env(safe-area-inset-bottom));transform:translateX(-50%);font-size:14px;white-space:nowrap;';
    document.getElementById('escHud').appendChild(tag);
  }
  const t = unseen ? '🫥 HIDDEN — nothing can see you or reach you in here' : crawl ? '🐛 Crawling through the tube...' : '';
  if (tag.textContent !== t) tag.textContent = t;
  tag.classList.toggle('hidden', !t);
}

// Leaving a Timmy chapter: the tag goes.
export function clearTubes() {
  document.getElementById('timmyTag')?.classList.add('hidden');
}

export { glowMat };
