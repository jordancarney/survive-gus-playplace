// Gus's Pizza Shack, Gus's very first restaurant, long ago — the floor plan and furniture for
// the chapters that go back there after Chapter 5 (10, The Music Box: an evening after closing;
// 32, The Storm: the stormy night lightning hit the sign). Same rooms as Chapter 5's, on the
// right-hand side of the building: the Dining Room, the Kitchen, Gus's Stage and the back
// room (`back` names it).
import * as T from '../../textures.js';
import { G, lam, glowMat } from '../../decor.js';
import { mat, cloth } from '../../models.js';

export function shackRooms(back = 'Office') {
  return {
    D: { name: 'Dining Room (long ago)', short: 'Dining (past)', x0: 36, z0: 1, x1: 55, z1: 16,
         floor: () => T.checker('#f2f0ea', '#c0262d'), wall: ['#ffe9a0', '#c0262d', '#7a2a2a', 'stripes'] },
    K: { name: 'Kitchen (long ago)', short: 'Kitchen (past)', x0: 57, z0: 1, x1: 68, z1: 12,
         floor: () => T.tiles('#f4f1ea', '#c8c0b0'), wall: ['#f4f1ea', '#3a90c8', '#6a8aa0', 'panels'] },
    S: { name: "Gus's Stage (long ago)", short: 'Stage (past)', x0: 57, z0: 14, x1: 68, z1: 25,
         floor: () => T.wood('#9a6a3c'), wall: ['#5b2a86', '#ffd23f', '#2a1440', 'stars'] },
    O: { name: `${back} (long ago)`, short: `${back} (past)`, x0: 36, z0: 18, x1: 55, z1: 32,
         floor: () => T.wood('#7a5232'), wall: ['#e8d8b8', '#7a2a2a', '#5a3a24', 'panels'] },
  };
}

export const SHACK_DOORS = [
  { a: 'D', b: 'K', x0: 56, z0: 5, x1: 56, z1: 7 },
  { a: 'D', b: 'S', x0: 56, z0: 14, x1: 56, z1: 15 },
  { a: 'D', b: 'O', x0: 44, z0: 17, x1: 46, z1: 17 },
];

// The furniture every visit shares. `closed`: after hours — the chairs are up on the tables.
export function buildShack(d, { closed = false, lights = 0xfff0d0, k = 2.0 } = {}) {
  const P = d.place.P;
  d.label("GUS'S PIZZA SHACK", 46, 16.96, 3.1, 5, 0.8, 'north', { bg: '#c0262d', fg: '#ffd23f', glow: '#ffd23f' });
  for (const [x, z] of [[46, 6], [51, 6], [46, 11.5], [51, 11.5]]) {
    d.table(x, z, 2.0, 1.2, 0.74, 0xd8b880, { legs: 0x5a3a22 });
    if (closed) {
      for (const sx of [-0.5, 0.5]) {
        const c = P(x + sx, z, 0.98);
        d.mesh(G.box, lam(0xc0262d), d.group, { p: [c.x, c.y, c.z], s: [0.4, 0.4, 0.4], r: [Math.PI, 0, 0] });
      }
    }
  }
  d.lamp(46, 8, 3.7, lights, k, { distance: 14, room: 'D', bulb: false });
  d.lamp(52, 8, 3.7, lights, k * 0.9, { distance: 14, room: 'D', bulb: false });
  d.savePoint(54.6, 15.2, 'west');
  d.hideSpot('counter', 54.4, 2.6, 'west', { color: 0xc0262d });

  // the kitchen
  d.counter(62.5, 2.2, 10, 1.0, 1.0, 0xc8c8d0, 0xe8e8f0);
  for (const x of [59, 62, 65]) d.block(x, 11.4, 1.6, 1.0, 1.4, mat(0x5a6070, { metal: 0.6, rough: 0.4 }));
  d.hideSpot('locker', 67.6, 11.4, 'west', { color: 0x3a90c8 });
  d.lamp(62.5, 6.5, 3.7, lights, k, { distance: 12, room: 'K', bulb: false });

  // the stage
  d.block(65, 19.5, 6, 9, 0.5, mat(0x5b2a86, { rough: 0.5 }), { solid: false, nav: false });
  const sa = P(62, 15), sb = P(68, 24);
  d.place.raised.push({ x0: sa.x, z0: sa.z, x1: sb.x, z1: sb.z, h: 0.5 });
  d.label('GUS!', 68.96, 19.5, 2.8, 2.4, 0.8, 'west', { bg: '#5b2a86', fg: '#ffd23f', glow: '#ff3fa4' });
  for (const z of [14.6, 24.4]) d.block(62.5, z, 1.0, 0.3, 3.0, cloth(0xb0102a), { solid: false, nav: false });
  d.lamp(63, 19.5, 3.7, 0xffd8a0, k, { distance: 12, room: 'S', bulb: false });

  // the back room
  d.hideSpot('toybox', 54.4, 20, 'west', { color: 0xffd23f });
  d.savePoint(36.6, 25, 'east');
  d.lamp(45, 25, 3.7, lights, k, { distance: 14, room: 'O', bulb: false });
}

// The Toymaker: an old man in a brown apron, with a big white beard.
export const toymaker = { height: 1.72, shirt: 0x7a5232, pants: 0x3a2a1a, skin: 0xf1c7a5, hair: 0xe8e8e8, beard: 0xe8e8e8, glasses: true, shoulders: 0.2, shadows: true };

export { glowMat, G, lam, mat, cloth };
