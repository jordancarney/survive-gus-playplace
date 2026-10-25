// Jonathan's house: the level after Night 10, when the animatronics follow him home.
//
// It's a second Building on the same grid system as the PlayPlace, parked 100 m to the east
// so both can live in one scene (only one is ever visible). Bedroom, bathroom, kitchen,
// hallway, living room and a garage with the PlayPlace van in it. Zap each animatronic and
// load it into the van — then it drives them back where they belong.
import * as THREE from 'three';
import { Building } from './map.js';
import { Decor, G, lam, glowMat } from './decor.js';
import { mat } from './models.js';
import * as T from './textures.js';
import { SHADOWS } from './config.js';

export const HOUSE = {
  w: 26, h: 22, wallH: 2.8, offsetX: 100, panels: false,
  wallColor: 0x4a3f38, headerColor: 0xe8e0d0,
  ceiling: () => T.tiles('#ece6dc', '#d8d0c2'),
  rooms: {
    B: { name: 'Bedroom',     x0: 1,  z0: 1,  x1: 8,  z1: 7,
         floor: () => T.wood('#7a5230'), wall: ['#4a7ab8', '#ffd23f', '#2a4a78', 'stars'] },
    W: { name: 'Bathroom',    x0: 10, z0: 1,  x1: 14, z1: 7,
         floor: () => T.tiles('#e8f4f8', '#b8d0d8'), wall: ['#bfe9ff', '#ffffff', '#7fb8d8', 'panels'] },
    K: { name: 'Kitchen',     x0: 16, z0: 1,  x1: 24, z1: 7,
         floor: () => T.checker('#f2ead8', '#c8a878'), wall: ['#f2e6c8', '#c0262d', '#8a6a4a', 'panels'] },
    H: { name: 'Hallway',     x0: 1,  z0: 9,  x1: 24, z1: 11,
         floor: () => T.wood('#8a5a32'), wall: ['#d9c8a8', '#6b3e1f', '#8a6a4a', 'stripes'] },
    L: { name: 'Living Room', x0: 1,  z0: 13, x1: 13, z1: 20,
         floor: () => T.wood('#9a6a3c'), wall: ['#c8d8b0', '#6b3e1f', '#5a7a4a', 'stripes'] },
    G: { name: 'Garage',      x0: 15, z0: 13, x1: 24, z1: 20,
         floor: () => T.concrete(), wall: ['#8a8f99', '#f2c230', '#4a4d55', 'bricks'] },
  },
  doors: [
    { a: 'B', b: 'H', x0: 3,  z0: 8,  x1: 4,  z1: 8 },
    { a: 'W', b: 'H', x0: 11, z0: 8,  x1: 12, z1: 8 },
    { a: 'K', b: 'H', x0: 19, z0: 8,  x1: 20, z1: 8 },
    { a: 'L', b: 'H', x0: 5,  z0: 12, x1: 7,  z1: 12 },
    { a: 'G', b: 'H', x0: 18, z0: 12, x1: 19, z1: 12 },
    { a: 'L', b: 'G', x0: 14, z0: 16, x1: 14, z1: 17 },
  ],
};

export class House extends Building {
  constructor() { super(HOUSE); }
}

const DAYLIGHT = 0xfff1d6;

export class HouseDecor extends Decor {
  constructor(house) {
    super(house);
    this.spawn = {};
    this.van = null;
  }

  build() {
    this.bedroom();
    this.bathroom();
    this.kitchen();
    this.hallway();
    this.livingRoom();
    this.garage();
    return this.group;
  }

  // A window on an outside wall: a bright pane of morning, with a frame.
  window(px, pz, y, w, h, facing) {
    const g = this.anchor(px, pz, facing, y);
    this.mesh(G.plane, glowMat(0xdff2ff), g, { p: [0, 0, 0], s: [w, h, 1], shadow: false });
    const frame = lam(0xf4f1ea);
    this.mesh(G.box, frame, g, { p: [0, h / 2, 0.02], s: [w + 0.1, 0.08, 0.05] });
    this.mesh(G.box, frame, g, { p: [0, -h / 2, 0.02], s: [w + 0.1, 0.08, 0.05] });
    this.mesh(G.box, frame, g, { p: [0, 0, 0.02], s: [0.06, h, 0.05] });
    // half-drawn curtains
    for (const sx of [-1, 1]) this.mesh(G.box, lam(0x7a2a3a), g, { p: [sx * (w / 2 + 0.05), -0.1, 0.06], s: [0.35, h + 0.4, 0.04] });
  }

  rug(px, pz, w, d, a, b) {
    const c = this.place.P(px, pz, 0.015);
    this.mesh(G.plane, new THREE.MeshLambertMaterial({ map: T.rug(a, b) }), this.group,
      { p: [c.x, c.y, c.z], s: [w, d, 1], r: [-Math.PI / 2, 0, 0], shadow: false });
  }

  bedroom() {
    // Jonathan's bed, head against the north wall
    this.block(3.1, 2.1, 2.0, 2.4, 0.45, 0x5a3a24);
    this.block(3.1, 2.3, 1.9, 1.9, 0.12, 0x3a6ab8, { y: 0.45, solid: false, nav: false });     // blanket
    this.block(3.1, 1.25, 1.2, 0.4, 0.14, 0xf4f1ea, { y: 0.47, solid: false, nav: false });    // pillow
    this.block(3.1, 1.05, 2.0, 0.1, 0.9, 0x5a3a24, { solid: false, nav: false });              // headboard
    this.bed = { head: this.place.P(3.1, 1.6, 0.6), side: this.place.P(4.6, 2.6) };
    this.block(7.3, 1.6, 1.3, 0.7, 0.75, 0x6b4a2a);                                            // desk
    const lamp = this.place.P(7.7, 1.5, 0.75);
    this.mesh(G.cyl, lam(0x222222), this.group, { p: [lamp.x, lamp.y + 0.2, lamp.z], s: [0.03, 0.4, 0.03] });
    this.mesh(G.cone, glowMat(0xffe9b0), this.group, { p: [lamp.x, lamp.y + 0.45, lamp.z], s: [0.14, 0.16, 0.14] });
    this.block(1.4, 6.4, 0.8, 1.6, 2.0, 0x8a6a4a);                                             // closet
    this.window(5.5, 1.03, 1.6, 1.6, 1.0, 'south');
    this.poster('GUS\'S\nPLAYPLACE', '#5b2a86', 'gus', 8.97, 4.5, 1.6, 'west');
    this.poster('NIGHT\nSHIFT', '#1f6f9a', 'cranker', 1.03, 4.0, 1.6, 'east');
    this.rug(4.5, 4.8, 2.4, 1.6, '#3a6ab8', '#ffd23f');
    this.light(5, 4, 1.9, DAYLIGHT, 5, 0, { room: 'B', distance: 9 });
    this.spawn.jonathan = this.place.P(4.6, 4.6);
  }

  bathroom() {
    // the tub: a rim you step over, and water you wade through (Flipper's favourite)
    const porcelain = mat(0xf4f6f8, { rough: 0.2 });
    this.block(12.2, 1.25, 4.0, 0.12, 0.55, porcelain);
    this.block(12.2, 2.7, 4.0, 0.12, 0.55, porcelain, { solid: false });
    this.block(10.25, 2.0, 0.12, 1.6, 0.55, porcelain);
    this.block(14.15, 2.0, 0.12, 1.6, 0.55, porcelain);
    const water = this.place.P(12.2, 2.0, 0.42);
    this.mesh(G.plane, new THREE.MeshLambertMaterial({ color: 0x7fd0f0, transparent: true, opacity: 0.75 }), this.group,
      { p: [water.x, water.y, water.z], s: [3.8, 1.4, 1], r: [-Math.PI / 2, 0, 0], shadow: false });
    const a = this.place.P(10.4, 1.4), b = this.place.P(14.0, 2.6);
    this.place.slowZones.push({ x0: a.x, z0: a.z, x1: b.x, z1: b.z });
    this.block(14.3, 5.6, 0.5, 0.7, 0.45, porcelain);                                          // toilet
    this.block(10.5, 5.5, 0.6, 0.9, 0.85, porcelain);                                          // sink
    const mirror = this.anchor(10.03, 5.5, 'east', 1.6);
    this.mesh(G.plane, mat(0xbfe9ff, { metal: 0.9, rough: 0.05 }), mirror, { p: [0, 0, 0], s: [0.7, 0.8, 1] });
    this.window(12.2, 1.03, 2.1, 0.9, 0.5, 'south');
    this.light(12, 4, 1.9, DAYLIGHT, 4, 0, { room: 'W', distance: 7 });
    this.spawn.flipper = this.place.P(12.2, 2.0);
  }

  kitchen() {
    this.block(20, 1.4, 8, 0.8, 0.95, 0xc8b89a);                                               // counters
    this.block(23.9, 3.0, 1.0, 1.0, 2.0, mat(0xe8eef2, { metal: 0.3, rough: 0.3 }));           // fridge
    this.block(19.5, 4.8, 2.0, 1.2, 0.75, 0x8a5a32);                                           // table
    for (const [x, z] of [[18.2, 4.8], [20.8, 4.8], [19.5, 3.8], [19.5, 5.8]]) {
      this.block(x, z, 0.45, 0.45, 0.48, 0x6b4a2a, { solid: false, nav: false });
    }
    const bowl = this.place.P(19.5, 4.8, 0.8);
    this.mesh(G.sphere, lam(0xff9a1f), this.group, { p: [bowl.x, bowl.y, bowl.z], s: [0.18, 0.08, 0.18] });
    this.window(18.5, 1.03, 1.7, 1.4, 0.7, 'south');
    this.light(20, 4, 1.9, DAYLIGHT, 5, 0, { room: 'K', distance: 9 });
    this.spawn.chomper = this.place.P(22.6, 3.2);
  }

  hallway() {
    this.rug(12.5, 10, 16, 1.4, '#5a2a1a', '#d9b45a');
    // family photos down the hall
    const colors = ['#3a6ab8', '#c0262d', '#2f8f3a', '#ffd23f'];
    colors.forEach((c, i) => {
      const g = this.anchor(5 + i * 4.5, 11.97, 'north', 1.6);
      this.mesh(G.box, lam(0x3a2414), g, { p: [0, 0, 0], s: [0.6, 0.45, 0.04] });
      this.mesh(G.plane, lam(new THREE.Color(c).getHex()), g, { p: [0, 0, 0.025], s: [0.5, 0.36, 1] });
    });
    this.light(8, 10, 1.9, 0xffe2b0, 3, 0, { room: 'H', distance: 9 });
    this.light(19, 10, 1.9, 0xffe2b0, 3, 0, { room: 'H', distance: 9 });
    this.spawn.cranker = this.place.P(23, 10);
  }

  livingRoom() {
    this.block(10.5, 18.9, 3.4, 1.0, 0.8, 0x3a5a7a);                                             // couch
    this.block(10.5, 19.4, 3.4, 0.3, 1.0, 0x2f4a66, { solid: false, nav: false });
    this.block(10.5, 16.2, 1.6, 0.8, 0.42, 0x6b4a2a);                                             // coffee table
    this.block(10.5, 13.5, 2.0, 0.5, 0.6, 0x2a2a2a);                                             // TV stand
    const tv = this.anchor(10.5, 13.55, 'south', 1.05);
    this.mesh(G.box, lam(0x111111), tv, { p: [0, 0, 0], s: [1.6, 0.9, 0.08] });
    this.mesh(G.plane, new THREE.MeshBasicMaterial({ map: T.screenTex('Gus Show', '#ff7eb6') }), tv, { p: [0, 0, 0.045], s: [1.45, 0.78, 1] });
    this.block(1.4, 16.5, 0.6, 2.4, 2.0, 0x6b4a2a);                                           // bookshelf
    for (let k = 0; k < 6; k++) {
      const b = this.place.P(1.75, 15.6 + k * 0.35, 0.5 + (k % 3) * 0.6);
      this.mesh(G.box, lam([0xc0262d, 0x3a6ab8, 0x2f8f3a][k % 3]), this.group, { p: [b.x, b.y, b.z], s: [0.08, 0.3, 0.25] });
    }
    this.rug(10.2, 16.6, 4.2, 3.0, '#7a2a3a', '#d9b45a');
    this.window(2.5, 20.97, 1.6, 1.4, 1.0, 'north');
    this.window(9.5, 20.97, 1.6, 1.4, 1.0, 'north');
    // the front door, locked tight
    const door = this.anchor(6.5, 20.97, 'north', 1.05);
    this.mesh(G.box, lam(0x7a3a1a), door, { p: [0, 0, 0], s: [1.0, 2.1, 0.06] });
    this.mesh(G.sphere, mat(0xd9b45a, { metal: 0.8 }), door, { p: [0.38, 0, 0.05], s: [0.04, 0.04, 0.04] });
    this.light(5, 16.5, 1.9, DAYLIGHT, 6, 0, { room: 'L', distance: 11 });
    this.spawn.gerald = this.place.P(5, 17.2);
  }

  garage() {
    // The PlayPlace van, backed in, rear doors open toward the hall door.
    const van = new THREE.Group();
    van.position.copy(this.place.P(19.5, 17.4));
    this.group.add(van);
    const body = lam(0xf4f1ea);
    const purple = lam(0x5b2a86);
    const part = (geo, m, p, s, parent = van) => {
      const o = new THREE.Mesh(geo, m);
      o.position.set(p[0], p[1], p[2]);
      o.scale.set(s[0], s[1], s[2]);
      o.castShadow = SHADOWS;
      parent.add(o);
      return o;
    };
    // cargo box: floor, roof, two sides and a front wall, open at the back (-z)
    part(G.box, body, [0, 0.55, 0], [2.2, 0.1, 3.6]);
    part(G.box, body, [0, 2.25, 0], [2.2, 0.1, 3.6]);
    part(G.box, body, [-1.05, 1.4, 0], [0.1, 1.7, 3.6]);
    part(G.box, body, [1.05, 1.4, 0], [0.1, 1.7, 3.6]);
    part(G.box, body, [0, 1.4, 1.75], [2.2, 1.7, 0.1]);
    part(G.box, purple, [0, 1.2, 2.55], [2.2, 1.3, 1.5]);                     // cab
    part(G.box, glowMat(0x9fd8ff), [0, 1.55, 3.31], [1.9, 0.5, 0.02]);       // windscreen
    for (const [x, z] of [[-1.05, -1.1], [1.05, -1.1], [-1.05, 2.4], [1.05, 2.4]]) {
      const w = part(G.cyl, lam(0x1a1a1a), [x, 0.38, z], [0.38, 0.25, 0.38]);
      w.rotation.z = Math.PI / 2;
    }
    for (const sx of [-1, 1]) {
      const sign = new THREE.Mesh(G.plane, new THREE.MeshBasicMaterial({
        map: T.signTex("GUS'S PLAYPLACE", { w: 512, h: 128, bg: '#5b2a86', fg: '#ffd23f', glow: '#ff3fa4' }),
      }));
      sign.scale.set(3.0, 0.75, 1);
      sign.position.set(sx * 1.11, 1.55, 0.1);
      sign.rotation.y = sx * Math.PI / 2;
      van.add(sign);
    }
    // rear doors, hinged at the outside edges
    const doors = [];
    for (const sx of [-1, 1]) {
      const hinge = new THREE.Group();
      hinge.position.set(sx * 1.1, 1.4, -1.8);
      van.add(hinge);
      part(G.box, body, [-sx * 0.55, 0, 0], [1.1, 1.7, 0.06], hinge);
      doors.push(hinge);
    }
    this.place.addBlock(18.4, 15.6, 20.6, 20.4, 2.3);
    // the cargo floor, so whatever gets loaded lies on it rather than under it
    const fa = this.place.P(18.5, 15.6), fb = this.place.P(20.5, 19.2);
    this.place.raised.push({ x0: fa.x, z0: fa.z, x1: fb.x, z1: fb.z, h: 0.6 });
    this.van = {
      group: van, doors,
      drop: this.place.P(19.5, 14.6),
      spots: [this.place.P(19.1, 16.3), this.place.P(19.9, 16.9), this.place.P(19.1, 17.6), this.place.P(19.9, 18.3)],
      home: van.position.clone(),
    };
    this.setVanDoors(true);

    // the big garage door, and the bright morning behind it when it opens
    const gd = this.anchor(19.5, 20.96, 'north', 1.2);
    this.outside = this.mesh(G.plane, glowMat(0xfff8e8), gd, { p: [0, 0, -0.01], s: [6, 2.4, 1], shadow: false, still: false });
    this.garageDoor = this.mesh(G.box, lam(0xd8d8d8), gd, { p: [0, 0, 0.03], s: [6.1, 2.4, 0.06], still: false });
    this.block(16, 19.9, 1.6, 0.6, 0.9, 0x5a4a3a);                                            // workbench
    const bike = this.place.P(23.5, 14.2, 0.4);
    this.mesh(G.box, lam(0xc0262d), this.group, { p: [bike.x, bike.y, bike.z], s: [0.08, 0.5, 1.2] });
    this.light(16.5, 14.2, 1.9, 0xfff4e0, 5, 0, { room: 'G', distance: 11 });
    this.spawn.gus = this.place.P(16, 14);      // never used: Gus stays at the PlayPlace
  }

  setVanDoors(open, k = 1) {
    const [l, r] = this.van.doors;
    // positive on the left hinge (and negative on the right) swings a door out behind the van
    const a = open ? 1.9 * k : 1.9 * (1 - k);
    l.rotation.y = a;
    r.rotation.y = -a;
  }
}
