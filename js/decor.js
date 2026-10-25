// Everything inside the rooms: the show stage, tables, the slide tower and ball pit, the
// arcade, every kid game that can break, the fuse boxes, the security office, signs,
// cameras on the walls, and the lights.
//
// Positions are plan metres (see map.js). Solid furniture registers a collider and takes
// its cells off the navigation grid; small things (chairs, balloons, hats) are decoration
// only, so nobody gets stuck on a party hat.
import * as THREE from 'three';
import { P, ROOMS, WALL_H } from './map.js';
import { mat } from './models.js';
import * as T from './textures.js';
import { SHADOWS } from './config.js';

export const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 16),
  cylLo: new THREE.CylinderGeometry(1, 1, 1, 8),
  sphere: new THREE.SphereGeometry(1, 14, 10),
  cone: new THREE.ConeGeometry(1, 1, 12),
  plane: new THREE.PlaneGeometry(1, 1),
};

const lambert = new Map();
export function lam(color) {
  if (!lambert.has(color)) lambert.set(color, new THREE.MeshLambertMaterial({ color }));
  return lambert.get(color);
}
export const glowMat = (color) => new THREE.MeshBasicMaterial({ color });

// Rotation that turns a +Z-facing thing to face one of the four walls' directions.
export const FACE = { south: 0, north: Math.PI, east: Math.PI / 2, west: -Math.PI / 2 };

export class Decor {
  constructor(place) {
    this.place = place;
    this.group = new THREE.Group();
    this.machines = [];
    this.fuses = [];
    this.balloons = [];
    this.spinners = [];
    this.lights = [];       // { light, day, night, room, flicker }
    this.stageSpots = {};
    this.junkSpots = [];
    this.crateSpots = [];
    this.cams = [];
    this.monitors = [];
    this.exitSigns = [];
    this.glows = [];        // self-lit signs and neon that die in a blackout
    this.ballPit = null;
    this.desk = null;
    this.timeClock = null;
    this.employeePhoto = null;
  }

  // ── Placement helpers ─────────────────────────────────────────────────

  mesh(geo, material, parent = this.group, { p = [0, 0, 0], s = [1, 1, 1], r = [0, 0, 0], shadow = true, still = true } = {}) {
    const m = new THREE.Mesh(geo, material);
    m.position.set(p[0], p[1], p[2]);
    m.scale.set(s[0], s[1], s[2]);
    m.rotation.set(r[0], r[1], r[2]);
    m.castShadow = shadow && SHADOWS;
    m.receiveShadow = true;
    if (still) { m.matrixAutoUpdate = false; m.updateMatrix(); }
    parent.add(m);
    return m;
  }

  // A box sitting on the floor (or at `y`), centred on plan (px, pz). Solid by default.
  block(px, pz, w, d, h, material, { y = 0, solid = true, nav = solid, parent = this.group, shadow = true } = {}) {
    const c = this.place.P(px, pz, y + h / 2);
    const m = this.mesh(G.box, typeof material === 'number' ? lam(material) : material, parent,
      { p: [c.x, c.y, c.z], s: [w, h, d], shadow });
    if (solid) this.place.addBlock(px - w / 2, pz - d / 2, px + w / 2, pz + d / 2, y + h, { nav });
    else if (nav) this.place.blockNav(px - w / 2, pz - d / 2, px + w / 2, pz + d / 2);
    return m;
  }

  // A group positioned at plan (px, pz) and turned to face `facing`.
  anchor(px, pz, facing = 'south', y = 0) {
    const g = new THREE.Group();
    g.position.copy(this.place.P(px, pz, y));
    g.rotation.y = typeof facing === 'number' ? facing : FACE[facing];
    this.group.add(g);
    return g;
  }

  // A self-lit material that goes dark when the power does.
  glow(color) {
    const m = glowMat(color);
    this.glows.push({ mat: m, base: m.color.clone() });
    return m;
  }

  sign(text, px, pz, y, w, h, facing, opts = {}) {
    const g = this.anchor(px, pz, facing, y);
    const material = new THREE.MeshBasicMaterial({ map: T.signTex(text, opts) });
    this.glows.push({ mat: material, base: material.color.clone() });
    const m = new THREE.Mesh(G.plane, material);
    m.scale.set(w, h, 1);
    g.add(m);
    return m;
  }

  poster(title, color, face, px, pz, y, facing) {
    const g = this.anchor(px, pz, facing, y);
    const m = new THREE.Mesh(G.plane, new THREE.MeshLambertMaterial({ map: T.posterTex(title, color, face) }));
    m.scale.set(1.0, 1.4, 1);
    g.add(m);
  }

  light(px, pz, y, color, day, night, { room = null, distance = 14, flicker = false } = {}) {
    const l = new THREE.PointLight(color, day, distance, 1.6);
    l.position.copy(this.place.P(px, pz, y));
    this.group.add(l);
    this.lights.push({ light: l, day, night, room, flicker });
    return l;
  }

  // ── Build everything ──────────────────────────────────────────────────

  build() {
    this.stage();
    this.dining();
    this.kitchen();
    this.junkRoom();
    this.ballPitRoom();
    this.slideTower();
    this.hall();
    this.office();
    this.lobby();
    this.partyRoom();
    this.arcade();
    this.prizeCounter();
    this.cameras();
    this.exits();
    return this.group;
  }

  // ── Machines ──────────────────────────────────────────────────────────

  // Registers a kid game. `face` is the direction its front looks; the interaction point is
  // `reach` metres out in front of it.
  machine(id, name, room, type, px, pz, facing, build, { reach = 1.1, fuse = false } = {}) {
    const g = this.anchor(px, pz, facing);
    const parts = { lights: [], screens: [] };
    build(g, parts);
    const yaw = FACE[facing];
    const front = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const base = this.place.P(px, pz);
    const m = {
      id, name, room, type, fuse,
      group: g,
      point: base.clone().addScaledVector(front, reach),
      sparkAt: base.clone().add(new THREE.Vector3(0, 1.4, 0)).addScaledVector(front, 0.3),
      lights: parts.lights,
      screens: parts.screens,
      broken: false,
      spotted: false,
    };
    (fuse ? this.fuses : this.machines).push(m);
    return m;
  }

  cabinet(id, name, room, px, pz, facing, color, opts = {}) {
    const build = (g, parts) => {
      const body = lam(color);
      this.mesh(G.box, body, g, { p: [0, 0.9, 0], s: [0.85, 1.8, 0.75] });
      this.mesh(G.box, lam(0x111111), g, { p: [0, 0.95, 0.3], s: [0.8, 0.3, 0.3], r: [-0.5, 0, 0] });
      const marquee = glowMat(color);
      this.mesh(G.box, marquee, g, { p: [0, 1.95, 0.25], s: [0.85, 0.3, 0.2] });
      parts.lights.push({ mat: marquee, on: new THREE.Color(color) });
      const okTex = T.screenTex(name, '#' + new THREE.Color(color).getHexString());
      const badTex = T.screenTex(name, '#ff0000', true);
      const scr = new THREE.MeshBasicMaterial({ map: okTex });
      this.mesh(G.plane, scr, g, { p: [0, 1.45, 0.38], s: [0.6, 0.5, 1], r: [-0.18, 0, 0] });
      parts.screens.push({ mat: scr, ok: okTex, bad: badTex });
      for (const [bx, c] of [[-0.2, 0xff3b30], [0, 0xffd23f], [0.2, 0x3ec1d3]]) {
        this.mesh(G.cylLo, lam(c), g, { p: [bx, 1.07, 0.42], s: [0.04, 0.03, 0.04], r: [-0.5, 0, 0] });
      }
    };
    const c = P(px, pz);
    this.place.addBlock(px - 0.45, pz - 0.4, px + 0.45, pz + 0.4, 1.8);
    if (id) return this.machine(id, name, room, 'sequence', px, pz, facing, build, opts);
    const g = this.anchor(px, pz, facing);
    build(g, { lights: [], screens: [] });
    return c;
  }

  fuseBox(id, name, room, px, pz, facing) {
    return this.machine(id, name, room, 'fuse', px, pz, facing, (g, parts) => {
      this.mesh(G.box, mat(0x6f747c, { metal: 0.6, rough: 0.4 }), g, { p: [0, 1.4, 0.08], s: [0.7, 0.9, 0.16] });
      this.mesh(G.box, new THREE.MeshLambertMaterial({ map: T.hazard() }), g, { p: [0, 0.88, 0.1], s: [0.7, 0.1, 0.18] });
      this.mesh(G.box, lam(0x222222), g, { p: [0.22, 1.4, 0.2], s: [0.06, 0.3, 0.06] });   // lever
      const lamp = glowMat(0x3cff6b);
      this.mesh(G.sphere, lamp, g, { p: [-0.2, 1.7, 0.18], s: [0.05, 0.05, 0.05] });
      parts.lights.push({ mat: lamp, on: new THREE.Color(0x3cff6b) });
      // the cable run up to the ceiling
      this.mesh(G.box, lam(0x333333), g, { p: [0, (1.85 + WALL_H) / 2, 0.05], s: [0.1, WALL_H - 1.85, 0.08] });
    }, { reach: 0.85, fuse: true });
  }

  // ── Rooms ─────────────────────────────────────────────────────────────

  stage() {
    // The platform is a walkable raised floor rather than a collider.
    const a = P(19, 1), b = P(41, 6.5);
    this.place.raised.push({ x0: a.x, z0: a.z, x1: b.x, z1: b.z, h: 0.35 });
    this.block(30, 3.75, 22, 5.5, 0.35, 0x2a1840, { solid: false, nav: false });
    // The glowing edge sits just proud of the platform's front face. Sharing that face made
    // the two fight over every pixel (the flickering stripes Safari and Chrome both showed).
    this.block(30, 6.56, 22.04, 0.08, 0.37, this.glow(0xffd23f), { solid: false, nav: false, shadow: false });

    const curtain = new THREE.MeshLambertMaterial({ map: T.withRepeat(T.curtain(), 11, 1) });
    this.block(30, 1.1, 22, 0.15, 4.2, curtain, { y: 0.35, solid: false, nav: false });
    for (const x of [19.4, 40.6]) this.block(x, 1.6, 0.8, 1.2, 4.2, new THREE.MeshLambertMaterial({ map: T.curtain() }), { y: 0.35, solid: false, nav: false });
    this.sign("GUS'S PLAYPLACE", 30, 1.25, 3.85, 9, 1.4, 'south',
      { w: 768, h: 128, fg: '#ffd23f', glow: '#ff3fa4', bg: '#2a0f45' });

    // truss and stage cans
    this.block(30, 6.2, 22, 0.2, 0.2, 0x333333, { y: 4.1, solid: false, nav: false, shadow: false });
    for (let i = 0; i < 6; i++) {
      const c = P(21 + i * 3.6, 6.2, 3.85);
      this.mesh(G.cylLo, lam(0x111111), this.group, { p: [c.x, c.y, c.z], s: [0.14, 0.3, 0.14], r: [0.6, 0, 0], shadow: false });
    }
    // speaker stacks
    for (const x of [17, 43]) this.block(x, 3, 1.2, 1.2, 2.2, 0x15151c);

    // Gerald's drum kit and Gus's mic stand
    for (const [dx, r, h] of [[-0.7, 0.35, 0.5], [0.7, 0.35, 0.5], [0, 0.5, 0.4]]) {
      const c = P(25.5 + dx, 1.9, 0.35 + h / 2 + 0.1);
      this.mesh(G.cyl, lam(0xc0262d), this.group, { p: [c.x, c.y, c.z], s: [r, h, r] });
    }
    const ms = P(30, 4.4);
    this.mesh(G.cylLo, lam(0x222222), this.group, { p: [ms.x, 0.35 + 0.7, ms.z], s: [0.02, 1.4, 0.02] });
    this.mesh(G.sphere, mat(0x8a8f99, { metal: 0.7 }), this.group, { p: [ms.x, 0.35 + 1.45, ms.z], s: [0.06, 0.06, 0.06] });

    this.stageSpots = {
      gus: P(30, 3.4, 0.35), gerald: P(25.5, 3.0, 0.35), chomper: P(22, 3.6, 0.35),
      cranker: P(34.5, 3.6, 0.35), flipper: P(38, 3.4, 0.35), junk: P(30, 3.2, 0.35),
    };

    const sp = P(30, 6.5);
    for (const sx of [-6, 6]) {
      const s = new THREE.SpotLight(0xffe8c8, 0, 22, 0.55, 0.5, 1);
      s.position.set(sp.x + sx, 4.3, sp.z + 6);
      s.target.position.set(sp.x + sx * 0.4, 0, sp.z - 3);
      this.group.add(s, s.target);
      this.lights.push({ light: s, day: 60, night: 0, room: 'D' });
    }
    this.light(30, 6, 3.4, 0xff3fa4, 30, 2.5, { room: 'D', distance: 16 });

    this.machine('stagelights', 'Stage Lights', 'D', 'simon', 44.2, 11, 'west', (g, parts) => {
      this.mesh(G.box, lam(0x23232c), g, { p: [0, 0.5, 0], s: [1.6, 1.0, 0.7] });
      this.mesh(G.box, lam(0x111116), g, { p: [0, 1.05, 0.05], s: [1.5, 0.1, 0.6], r: [-0.25, 0, 0] });
      const colors = [0xff3b30, 0xffd23f, 0x3cff6b, 0x3ec1d3];
      colors.forEach((c, i) => {
        const m = glowMat(c);
        this.mesh(G.box, m, g, { p: [-0.5 + i * 0.33, 1.13, 0.1], s: [0.18, 0.05, 0.18] });
        parts.lights.push({ mat: m, on: new THREE.Color(c) });
      });
    }, { reach: 1.2 });
    this.place.addBlock(43.85, 10.2, 44.95, 11.8, 1.1);
  }

  dining() {
    const cloths = [0xff7eb6, 0x3ec1d3, 0xffd23f];
    let i = 0;
    // Two rows, with the middle of the front row left open: from the hall doors (and from
    // CAM 01) there's a clear line straight down the aisle to the stage.
    for (const z of [12.5, 17.5]) {
      for (const x of [21, 30, 39]) {
        if (x === 30 && z === 12.5) continue;
        const cloth = cloths[i++ % 3];
        this.block(x, z, 5, 1.2, 0.75, cloth);
        for (let k = 0; k < 4; k++) {
          for (const sz of [-1, 1]) {
            this.block(x - 1.8 + k * 1.2, z + sz * 0.95, 0.4, 0.4, 0.45, 0x5b2a86, { solid: false, nav: false });
          }
          const hp = P(x - 1.8 + k * 1.2, z + (k % 2 ? 0.3 : -0.3), 0.75 + 0.14);
          this.mesh(G.cone, lam(cloths[(k + i) % 3]), this.group, { p: [hp.x, hp.y, hp.z], s: [0.08, 0.28, 0.08], shadow: false });
        }
      }
    }
    this.poster('GUS\nSINGS!', '#5b2a86', 'gus', 15.03, 13, 2.2, 'east');
    this.poster('CRANKER\nSLIDES!', '#1f6f9a', 'cranker', 44.97, 14.5, 2.2, 'west');
  }

  kitchen() {
    const steel = mat(0xb8bec6, { metal: 0.6, rough: 0.35 });
    this.block(7, 1.45, 10, 0.9, 0.95, steel);
    this.block(12.9, 1.7, 1.6, 1.4, 2.2, mat(0xe8eef2, { metal: 0.3, rough: 0.3 }));      // fridge
    this.block(7, 5.8, 4, 1.4, 0.95, steel);                                              // island
    const oven = this.block(1.7, 4.5, 1.2, 3, 1.6, 0x8a3a2a);
    oven.material = lam(0x8a3a2a);
    const glow = P(2.33, 4.5, 0.8);
    this.mesh(G.plane, this.glow(0xff7a1a), this.group, { p: [glow.x, glow.y, glow.z], s: [2.0, 0.5, 1], r: [0, Math.PI / 2, 0], shadow: false });
    this.light(2.5, 4.5, 1.2, 0xff7a1a, 4, 1.2, { room: 'K', distance: 5 });

    this.machine('softserve', 'Ice Cream Machine', 'K', 'sequence', 5.2, 1.6, 'south', (g, parts) => {
      this.mesh(G.box, mat(0xf2f4f7, { rough: 0.3 }), g, { p: [0, 1.45, 0], s: [0.8, 1.0, 0.6] });
      this.mesh(G.cylLo, mat(0x8a8f99, { metal: 0.7 }), g, { p: [0, 0.95, 0.25], s: [0.05, 0.12, 0.05] });
      this.mesh(G.cone, lam(0xd9a05a), g, { p: [0, 2.15, 0], s: [0.12, 0.3, 0.12], r: [Math.PI, 0, 0] });
      this.mesh(G.sphere, lam(0xfff1f7), g, { p: [0, 2.35, 0], s: [0.15, 0.12, 0.15] });
      const okTex = T.screenTex('Soft Serve', '#ff7eb6');
      const scr = new THREE.MeshBasicMaterial({ map: okTex });
      this.mesh(G.plane, scr, g, { p: [0, 1.65, 0.31], s: [0.4, 0.3, 1] });
      parts.screens.push({ mat: scr, ok: okTex, bad: T.screenTex('Soft Serve', '#f00', true) });
    }, { reach: 1.3 });

    this.fuseBox('fuseK', 'Fuse Box', 'K', 1.0, 9.5, 'east');
    this.light(8, 6, 4.2, 0xdff4ff, 18, 0.6, { room: 'K', distance: 14 });
  }

  junkRoom() {
    // shelves of spare parts: heads, arms, a pair of feet
    for (const z of [14.2, 16.4]) {
      this.block(1.5, z, 0.9, 2, 2.4, 0x4a3a2a);
      const colors = [0x7a4a2b, 0x3a3a44, 0xa8642e, 0x1d2230, 0x5b8fc4];
      for (let k = 0; k < 3; k++) {
        const c = P(1.6, z - 0.6 + k * 0.6, 0.6 + k * 0.7);
        this.mesh(G.sphere, mat(colors[(k + Math.round(z)) % 5]), this.group, { p: [c.x, c.y, c.z], s: [0.22, 0.22, 0.22] });
      }
    }
    this.block(11, 23.4, 4, 1.0, 0.9, 0x5a4a3a);              // workbench
    for (let k = 0; k < 4; k++) {
      const c = P(9.6 + k * 0.9, 23.3, 1.0);
      this.mesh(G.box, mat(0x8a8f99, { metal: 0.7 }), this.group, { p: [c.x, c.y, c.z], s: [0.3, 0.06, 0.1], r: [0, k, 0] });
    }
    // the junk pile — hazard floor and a heap of old parts
    const hz = P(4.5, 21.3, 0.02);
    this.mesh(G.plane, new THREE.MeshLambertMaterial({ map: T.withRepeat(T.hazard(), 3, 2.5) }), this.group,
      { p: [hz.x, hz.y, hz.z], s: [5.2, 4.6, 1], r: [-Math.PI / 2, 0, 0], shadow: false });
    let seed = 3;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let k = 0; k < 14; k++) {
      const c = P(2.2 + rand() * 1.6, 19.5 + rand() * 4, 0.15 + rand() * 0.3);
      this.mesh(G.box, mat([0x6a6e78, 0x7a4b2a, 0x3a3d44][k % 3], { metal: 0.5, rough: 0.6 }), this.group,
        { p: [c.x, c.y, c.z], s: [0.3 + rand() * 0.5, 0.2 + rand() * 0.4, 0.3 + rand() * 0.5], r: [rand(), rand() * 3, rand()] });
    }
    this.junkSpots = [P(4.2, 20.4), P(5.8, 21.3), P(4.0, 22.6), P(6.2, 22.9), P(5.2, 19.6), P(3.4, 21.5)];
    this.sign('PARTS & SERVICE', 13.95, 15.5, 3.1, 3.4, 0.7, 'west', { bg: '#2b2d33', fg: '#f2c230', glow: '#f2c230' });
    this.sign('KEEP OUT', 3.5, 13.05, 2.6, 1.8, 0.5, 'south', { bg: '#f2c230', fg: '#111', glow: '#111', w: 256, h: 64, font: 'bold 34px sans-serif' });
    // one bare bulb on a cord, which flickers at night
    const b = P(6, 18, 3.4);
    this.mesh(G.sphere, this.glow(0xffc46b), this.group, { p: [b.x, b.y, b.z], s: [0.1, 0.12, 0.1], shadow: false });
    this.mesh(G.cylLo, lam(0x111111), this.group, { p: [b.x, (b.y + WALL_H) / 2 + 0.05, b.z], s: [0.01, WALL_H - b.y, 0.01], shadow: false });
    this.light(6, 18, 3.2, 0xffb35a, 14, 3, { room: 'J', distance: 12, flicker: true });
  }

  ballPitRoom() {
    // a padded rim with two gaps on each long side
    const pad = mat(0xff5a5f, { rough: 0.7 });
    const x0 = 3, x1 = 11, z0 = 29, z1 = 39;
    const rim = (px, pz, w, d) => this.block(px, pz, w, d, 0.6, pad);
    rim((x0 + x1) / 2, z0, x1 - x0 + 0.3, 0.3);
    rim((x0 + x1) / 2, z1, x1 - x0 + 0.3, 0.3);
    rim(x0, (z0 + 32.3) / 2, 0.3, 32.3 - z0);
    rim(x0, (34.2 + z1) / 2, 0.3, z1 - 34.2);
    rim(x1, (z0 + 32.3) / 2, 0.3, 32.3 - z0);
    rim(x1, (34.2 + z1) / 2, 0.3, z1 - 34.2);
    const a = P(x0 + 0.2, z0 + 0.2), b = P(x1 - 0.2, z1 - 0.2);
    this.place.slowZones.push({ x0: a.x, z0: a.z, x1: b.x, z1: b.z });

    const count = 2400;
    const balls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshLambertMaterial(), count);
    const colors = [0xff3b30, 0xffd23f, 0x3ec1d3, 0x7ad151, 0xa970ff, 0xff7eb6].map((c) => new THREE.Color(c));
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      const p = P(x0 + 0.3 + Math.random() * (x1 - x0 - 0.6), z0 + 0.3 + Math.random() * (z1 - z0 - 0.6), 0.1 + Math.random() * 0.36);
      m4.makeTranslation(p.x, p.y, p.z);
      balls.setMatrixAt(i, m4);
      balls.setColorAt(i, colors[i % colors.length]);
    }
    balls.receiveShadow = true;
    this.group.add(balls);
    this.ballPit = balls;

    this.machine('blower', 'Ball Blower', 'B', 'timing', 13.3, 34, 'west', (g, parts) => {
      this.mesh(G.box, lam(0x3ec1d3), g, { p: [0, 0.8, 0], s: [1.2, 1.6, 0.8] });
      this.mesh(G.cyl, lam(0x1a1a1a), g, { p: [0, 1.0, 0.41], s: [0.42, 0.04, 0.42], r: [Math.PI / 2, 0, 0] });
      const fan = this.mesh(G.box, lam(0xdddddd), g, { p: [0, 1.0, 0.44], s: [0.75, 0.08, 0.02], still: false });
      this.spinners.push({ obj: fan, axis: 'z', speed: 9, machine: 'blower' });
      const lamp = glowMat(0x7cff3a);
      this.mesh(G.sphere, lamp, g, { p: [0.45, 1.5, 0.41], s: [0.06, 0.06, 0.06] });
      parts.lights.push({ mat: lamp, on: new THREE.Color(0x7cff3a) });
      this.mesh(G.cyl, lam(0x3ec1d3), g, { p: [0, 2.9, 0], s: [0.18, 2.6, 0.18] });
    }, { reach: 1.3 });
    this.place.addBlock(12.7, 33.4, 13.95, 34.6, 1.6);

    this.fuseBox('fuseB', 'Fuse Box', 'B', 1.0, 27, 'east');
    for (let x = 3; x <= 10; x += 2.4) this.block(x + 0.6, 42.4, 2, 0.6, 0.45, 0x7a2a8a);
    this.light(7, 34, 3.6, 0x2de2e6, 22, 1.4, { room: 'B', distance: 16 });
    this.sign('BALL PIT', 13.95, 30.5, 3.0, 2.6, 0.7, 'west', { bg: '#1f9fbf', fg: '#fff', glow: '#ffd23f' });
  }

  slideTower() {
    const cx = 22, cz = 38;
    this.place.addBlock(cx - 3, cz - 3, cx + 3, cz + 3, 4.0);
    const posts = [0xff5a5f, 0xffd23f, 0x3ec1d3, 0x7ad151];
    [[-3, -3], [3, -3], [3, 3], [-3, 3]].forEach(([dx, dz], i) => {
      this.block(cx + dx * 0.95, cz + dz * 0.95, 0.3, 0.3, 4.0, posts[i], { solid: false, nav: false });
    });
    for (const [y, c] of [[1.3, 0x7ad151], [2.6, 0xff5a5f]]) {
      this.block(cx, cz, 5.8, 5.8, 0.15, c, { y, solid: false, nav: false });
    }
    // net walls and a bright roof
    const net = new THREE.MeshLambertMaterial({ color: 0x222244, transparent: true, opacity: 0.45 });
    for (const [dx, dz, w, d] of [[0, -2.9, 5.8, 0.05], [0, 2.9, 5.8, 0.05], [-2.9, 0, 0.05, 5.8], [2.9, 0, 0.05, 5.8]]) {
      this.block(cx + dx, cz + dz, w, d, 1.2, net, { y: 1.45, solid: false, nav: false, shadow: false });
    }
    const roof = P(cx, cz, 3.95);
    this.mesh(G.cone, lam(0xffd23f), this.group, { p: [roof.x, roof.y, roof.z], s: [4.4, 0.8, 4.4], r: [0, Math.PI / 4, 0] });
    // two tube slides spiralling down
    const tube = (pts, color) => {
      const curve = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => P(x, z, y)));
      const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 60, 0.45, 12, false), mat(color, { rough: 0.3 }));
      m.castShadow = SHADOWS;
      this.group.add(m);
    };
    tube([[25.2, 2.6, 36], [27.3, 2.2, 36.5], [27.8, 1.6, 39.5], [26.8, 1.0, 41.3], [26.8, 0.45, 41.9]], 0xff3fa4);
    tube([[18.8, 2.6, 36.5], [16.8, 2.0, 35.3], [16.4, 1.2, 33.4], [17.8, 0.45, 33.0]], 0x3ec1d3);
    this.place.blockNav(26, 39, 28.4, 42.4, 0.1);
    this.place.blockNav(15.6, 32.8, 17.4, 36, 0.1);

    this.machine('slidelights', 'Slide Lights', 'T', 'simon', 29.85, 36.5, 'west', (g, parts) => {
      this.mesh(G.box, lam(0x222233), g, { p: [0, 1.4, 0.05], s: [1.3, 1.1, 0.1] });
      [0xff3b30, 0xffd23f, 0x3cff6b, 0x3ec1d3].forEach((c, i) => {
        const m = glowMat(c);
        this.mesh(G.cyl, m, g, { p: [-0.42 + i * 0.28, 1.4, 0.12], s: [0.1, 0.05, 0.1], r: [Math.PI / 2, 0, 0] });
        parts.lights.push({ mat: m, on: new THREE.Color(c) });
      });
      // a string of lights up the wall
      for (let k = 0; k < 6; k++) {
        const m = glowMat([0xff3b30, 0xffd23f, 0x3cff6b, 0x3ec1d3][k % 4]);
        this.mesh(G.sphere, m, g, { p: [0, 2.2 + k * 0.35, 0.08], s: [0.06, 0.06, 0.06] });
        parts.lights.push({ mat: m, on: m.color.clone() });
      }
    }, { reach: 0.9 });
    this.sign('SLIDE TOWER', 22, 32.05, 3.4, 3.6, 0.8, 'south', { bg: '#1f6f5a', fg: '#ffd23f', glow: '#ff5a5f' });
    this.light(22, 34, 3.6, 0xffd23f, 20, 1.2, { room: 'T', distance: 14 });
  }

  hall() {
    this.poster('GERALD\nROCKS!', '#c0262d', 'gerald', 26, 30.97, 2.0, 'north');
    this.poster('CHOMPER\nBUILDS!', '#a8642e', 'chomper', 30, 24.03 + 1, 2.0, 'south');
    this.poster('FLIPPER\nSPLASHES!', '#1f6f9a', 'flipper', 17.5, 30.97, 2.0, 'north');
    for (const x of [16.2, 43.8]) {
      this.block(x, 30.3, 0.6, 0.6, 0.5, 0x6b3e1f);
      const c = P(x, 30.3, 0.95);
      this.mesh(G.sphere, lam(0x2f8f3a), this.group, { p: [c.x, c.y, c.z], s: [0.45, 0.5, 0.45] });
    }
    for (const z of [25.05, 30.95]) {
      const a = P(30, z, 3.3);
      this.mesh(G.box, this.glow(0x2de2e6), this.group, { p: [a.x, a.y, a.z], s: [29, 0.05, 0.05], shadow: false });
    }
    this.light(23, 28, 3.6, 0xa970ff, 16, 1.2, { room: 'H', distance: 14 });
    this.light(38, 28, 3.6, 0xa970ff, 16, 1.2, { room: 'H', distance: 14 });
  }

  office() {
    // desk along the west wall, three monitors facing into the room
    this.block(31.6, 37.2, 1.2, 4.4, 0.78, 0x5a4636);
    for (let i = 0; i < 3; i++) {
      const g = this.anchor(31.5, 35.8 + i * 1.4, 'east', 0.78);
      this.mesh(G.box, lam(0x1a1a1f), g, { p: [0, 0.32, 0], s: [0.9, 0.6, 0.12] });
      const scr = new THREE.MeshBasicMaterial({ color: 0x1f5a3a });
      this.mesh(G.plane, scr, g, { p: [0, 0.33, 0.065], s: [0.8, 0.5, 1] });
      this.monitors.push(scr);
      this.mesh(G.box, lam(0x1a1a1f), g, { p: [0, 0.02, 0], s: [0.2, 0.05, 0.2] });
    }
    // a desk fan that never stops
    const fan = this.anchor(31.7, 39.0, 'east', 0.78);
    this.mesh(G.cylLo, lam(0x333333), fan, { p: [0, 0.15, 0], s: [0.03, 0.3, 0.03] });
    const blades = this.mesh(G.box, lam(0x777777), fan, { p: [0, 0.32, 0.05], s: [0.3, 0.05, 0.01], still: false });
    this.spinners.push({ obj: blades, axis: 'z', speed: 14 });
    // the charging dock for the flashlight
    const dock = P(31.8, 34.5, 0.78);
    this.mesh(G.box, lam(0x222222), this.group, { p: [dock.x, dock.y + 0.05, dock.z], s: [0.3, 0.1, 0.2] });
    this.mesh(G.box, glowMat(0x3cff6b), this.group, { p: [dock.x + 0.16, dock.y + 0.08, dock.z], s: [0.01, 0.03, 0.12], shadow: false });
    // chair
    const ch = this.anchor(32.9, 35.3, -Math.PI / 2 - 0.6);
    this.mesh(G.box, lam(0x222233), ch, { p: [0, 0.5, 0], s: [0.55, 0.1, 0.55] });
    this.mesh(G.box, lam(0x222233), ch, { p: [0, 0.85, -0.25], s: [0.55, 0.65, 0.08] });
    this.mesh(G.cylLo, lam(0x111111), ch, { p: [0, 0.25, 0], s: [0.05, 0.5, 0.05] });
    // lockers
    this.block(38.4, 33.8, 0.9, 2.8, 2.0, 0x4a5a6a);
    this.desk = { point: P(32.9, 37.2), lookYaw: Math.PI / 2 };

    // time clock on the south wall
    const tc = this.anchor(36, 42.95, 'north');
    this.mesh(G.box, lam(0x8a8f99), tc, { p: [0, 1.4, 0.1], s: [0.5, 0.6, 0.2] });
    this.mesh(G.plane, glowMat(0x3cff6b), tc, { p: [0, 1.55, 0.21], s: [0.36, 0.14, 1] });
    this.mesh(G.box, lam(0xc0262d), tc, { p: [0, 1.25, 0.22], s: [0.2, 0.1, 0.04] });
    this.timeClock = { point: P(36, 42.1) };

    // employee of the month: empty until you earn it
    const eg = this.anchor(34.5, 42.97, 'north', 2.1);
    this.mesh(G.box, lam(0xc9a227), eg, { p: [0, 0, 0], s: [1.0, 1.25, 0.05] });
    const photo = new THREE.MeshLambertMaterial({ map: T.signTex('EMPLOYEE\nOF THE\nMONTH\n?', { bg: '#f4f1ea', fg: '#333', glow: '#c9a227', w: 256, h: 320, font: 'bold 40px sans-serif' }) });
    this.mesh(G.plane, photo, eg, { p: [0, 0, 0.03], s: [0.85, 1.1, 1] });
    this.employeePhoto = photo;

    this.poster('SAFETY\nFIRST!', '#2a4fa0', 'gus', 38.97, 36, 2.0, 'west');
    this.light(35, 37.5, 3.6, 0xfff1d6, 14, 4, { room: 'O', distance: 10 });
  }

  lobby() {
    // the front doors: glass onto the night (or the sunny car park)
    const glass = new THREE.MeshBasicMaterial({ color: 0x0c1830 });
    this.outsideGlass = glass;
    for (const x of [41.5, 43.5]) {
      const g = this.anchor(x, 42.97, 'north', 1.4);
      this.mesh(G.plane, glass, g, { p: [0, 0, 0], s: [0.95, 2.6, 1] });
      this.mesh(G.box, lam(0x888888), g, { p: [0, 0, 0.02], s: [0.06, 2.6, 0.03] });
    }
    this.sign('CLOSED', 42.5, 42.9, 2.95, 1.4, 0.4, 'north', { bg: '#300', fg: '#ff3b30', glow: '#ff3b30', w: 256, h: 64, font: 'bold 40px sans-serif' });
    this.block(44.3, 41, 1.2, 3.2, 1.1, 0x5b2a86);                  // ticket booth
    this.sign('NOW HIRING\nNIGHT SECURITY', 44.95, 38.2, 2.1, 1.6, 0.8, 'west',
      { w: 320, h: 160, bg: '#f4f1ea', fg: '#c0262d', glow: '#c0262d', font: 'bold 44px sans-serif' });
    this.sign('WELCOME TO\nGUS\'S PLAYPLACE', 39.95 + 0.1, 35, 3.0, 3.6, 1.2, 'east', { w: 512, h: 170 });

    this.machine('spinride', "Gus's Spin Ride", 'E', 'timing', 42.5, 35.6, 'south', (g, parts) => {
      this.mesh(G.cyl, lam(0x5b2a86), g, { p: [0, 0.2, 0], s: [0.7, 0.4, 0.7] });
      const spin = new THREE.Group();
      spin.position.set(0, 0.4, 0);
      g.add(spin);
      this.spinners.push({ obj: spin, axis: 'y', speed: 1.2, machine: 'spinride' });
      this.mesh(G.sphere, mat(0x7a4a2b), spin, { p: [0, 0.45, 0], s: [0.32, 0.35, 0.3], still: false });
      this.mesh(G.sphere, mat(0x7a4a2b), spin, { p: [0, 0.95, 0], s: [0.22, 0.22, 0.22], still: false });
      this.mesh(G.sphere, mat(0x2f3640), spin, { p: [0, 0.92, 0.2], s: [0.16, 0.05, 0.14], still: false });
      this.mesh(G.cylLo, mat(0x5b2a86), spin, { p: [0, 1.25, 0], s: [0.12, 0.2, 0.12], still: false });
      const lamp = glowMat(0xffd23f);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        this.mesh(G.sphere, lamp, g, { p: [Math.sin(a) * 0.7, 0.42, Math.cos(a) * 0.7], s: [0.04, 0.04, 0.04] });
      }
      parts.lights.push({ mat: lamp, on: new THREE.Color(0xffd23f) });
    }, { reach: 1.3 });
    this.place.addBlock(41.8, 34.9, 43.2, 36.3, 1.4);
    this.light(42.5, 37, 3.6, 0xff7eb6, 12, 1, { room: 'E', distance: 10 });
  }

  partyRoom() {
    // karaoke stage on a little riser
    const a = P(50, 1), b = P(56, 3);
    this.place.raised.push({ x0: a.x, z0: a.z, x1: b.x, z1: b.z, h: 0.25 });
    this.block(53, 2, 6, 2, 0.25, 0x5b2a86, { solid: false, nav: false });
    this.machine('karaoke', 'Karaoke Machine', 'P', 'simon', 53, 1.7, 'south', (g, parts) => {
      this.mesh(G.box, lam(0x1a1a22), g, { p: [0, 0.85, 0], s: [1.4, 1.2, 0.5] });
      const okTex = T.screenTex('Sing!', '#ff7eb6');
      const scr = new THREE.MeshBasicMaterial({ map: okTex });
      this.mesh(G.plane, scr, g, { p: [0, 1.05, 0.26], s: [1.0, 0.6, 1] });
      parts.screens.push({ mat: scr, ok: okTex, bad: T.screenTex('Sing!', '#f00', true) });
      for (const sx of [-1.1, 1.1]) {
        this.mesh(G.box, lam(0x111111), g, { p: [sx, 0.9, 0], s: [0.5, 1.5, 0.5] });
        const ring = glowMat([0xff3fa4, 0x2de2e6][sx > 0 ? 1 : 0]);
        this.mesh(G.cyl, ring, g, { p: [sx, 1.1, 0.26], s: [0.17, 0.02, 0.17], r: [Math.PI / 2, 0, 0] });
        parts.lights.push({ mat: ring, on: ring.color.clone() });
      }
    }, { reach: 1.5 });
    this.place.addBlock(51.2, 1.0, 54.8, 2.3, 1.6);

    for (const [x, z] of [[49.5, 7.5], [55.5, 7.5]]) {
      const c = P(x, z);
      this.mesh(G.cyl, lam(0xffd23f), this.group, { p: [c.x, 0.75, c.z], s: [0.9, 0.06, 0.9] });
      this.mesh(G.cylLo, lam(0x444444), this.group, { p: [c.x, 0.37, c.z], s: [0.08, 0.74, 0.08] });
      this.place.addBlock(x - 0.8, z - 0.8, x + 0.8, z + 0.8, 0.78);
      // a balloon bunch on every table
      for (let k = 0; k < 4; k++) {
        const color = [0xff3b30, 0x3ec1d3, 0xffd23f, 0xa970ff][k];
        const bal = new THREE.Group();
        bal.position.set(c.x + Math.sin(k * 1.7) * 0.4, 2.0 + k * 0.15, c.z + Math.cos(k * 1.7) * 0.4);
        this.mesh(G.sphere, mat(color, { rough: 0.15 }), bal, { p: [0, 0, 0], s: [0.2, 0.26, 0.2], still: false });
        this.mesh(G.cylLo, lam(0xffffff), bal, { p: [0, -0.62, 0], s: [0.004, 1.0, 0.004], still: false, shadow: false });
        this.group.add(bal);
        this.balloons.push({ obj: bal, base: bal.position.y, phase: k * 1.3 + x });
      }
    }
    const cake = P(55.5, 7.5, 0.9);
    this.mesh(G.cyl, lam(0xfff1f7), this.group, { p: [cake.x, cake.y, cake.z], s: [0.3, 0.22, 0.3] });
    this.mesh(G.cyl, lam(0xff7eb6), this.group, { p: [cake.x, cake.y + 0.13, cake.z], s: [0.31, 0.04, 0.31] });
    for (const [x, z, c] of [[57.6, 10.5, 0xff3b30], [57.9, 9.6, 0x3ec1d3], [47.2, 10.6, 0x7ad151]]) {
      this.block(x, z, 0.6, 0.6, 0.5, c, { solid: false, nav: false });
    }
    this.sign('HAPPY BIRTHDAY!', 52.5, 1.05, 3.6, 5, 0.9, 'south', { bg: '#ff7eb6', fg: '#fff', glow: '#5b2a86' });
    this.light(52.5, 6, 3.6, 0xff7eb6, 22, 1.2, { room: 'P', distance: 14 });
  }

  arcade() {
    const C = [0xff3fa4, 0x2de2e6, 0xffd23f, 0x7cff6b, 0xa970ff, 0xff9a1f];
    this.cabinet('arcade1', 'Gus Racer', 'A', 47.5, 13.5, 'south', C[0]);
    this.cabinet(null, 'Space Puggle', 'A', 49, 13.5, 'south', C[4]);
    this.cabinet(null, 'Bonk!', 'A', 55.5, 13.5, 'south', C[3]);
    this.cabinet('arcade2', 'Chomp Attack', 'A', 57.2, 13.5, 'south', C[2]);
    for (let k = 0; k < 4; k++) {
      this.cabinet(k === 1 ? 'arcade3' : null, ['Ice Dash', 'Penguin Slide', 'Fin Frenzy', 'Ape Escape'][k], 'A',
        49.6 + k * 1.6, 19.6, 'north', C[(k + 1) % 6]);
      this.cabinet(null, 'Mega Bounce', 'A', 49.6 + k * 1.6, 20.5, 'south', C[(k + 3) % 6]);
    }
    for (const z of [16, 17.6, 23, 24.6]) this.cabinet(null, 'Neon Run', 'A', 58.3, z, 'west', C[Math.round(z) % 6]);

    this.machine('airhockey', 'Air Hockey', 'A', 'timing', 52.5, 25, 'south', (g, parts) => {
      this.mesh(G.box, lam(0x1f2a6a), g, { p: [0, 0.4, 0], s: [1.2, 0.8, 2.2] });
      this.mesh(G.box, lam(0xeef4ff), g, { p: [0, 0.81, 0], s: [1.05, 0.02, 2.05] });
      const rim = glowMat(0x2de2e6);
      this.mesh(G.box, rim, g, { p: [0, 0.86, 0], s: [1.2, 0.08, 0.06] });
      parts.lights.push({ mat: rim, on: new THREE.Color(0x2de2e6) });
      this.mesh(G.cyl, lam(0xff3b30), g, { p: [0, 0.84, 0.6], s: [0.09, 0.04, 0.09] });
      this.mesh(G.cyl, lam(0x111111), g, { p: [0.2, 0.84, -0.3], s: [0.05, 0.02, 0.05] });
    }, { reach: 1.6 });
    this.place.addBlock(51.9, 23.9, 53.1, 26.1, 0.9);

    this.sign('ARCADE', 45.97 + 0.1, 22.5, 3.2, 3, 0.8, 'east', { bg: '#120e33', fg: '#2de2e6', glow: '#ff3fa4' });
    this.light(52.5, 17, 3.6, 0x2de2e6, 22, 2, { room: 'A', distance: 14 });
    this.light(52.5, 24, 3.6, 0xff3fa4, 18, 1.5, { room: 'A', distance: 12 });
  }

  prizeCounter() {
    this.block(56.5, 34.5, 5, 0.9, 1.1, mat(0xbfe9ff, { rough: 0.1 }));
    this.block(54.4, 37.8, 0.9, 5.7, 1.1, mat(0xbfe9ff, { rough: 0.1 }));
    // shelves of plushies: tiny versions of the five
    const plush = [0x7a4a2b, 0x3a3a44, 0xa8642e, 0x1d2230, 0x5b8fc4];
    for (let row = 0; row < 3; row++) {
      this.block(58.5, 38.5, 0.8, 7, 0.05, 0xffd23f, { y: 0.8 + row * 0.7, solid: false, nav: false });
      for (let k = 0; k < 8; k++) {
        const c = P(58.5, 35.4 + k * 0.85, 0.98 + row * 0.7);
        this.mesh(G.sphere, mat(plush[(k + row) % 5], { rough: 0.8 }), this.group, { p: [c.x, c.y, c.z], s: [0.14, 0.15, 0.13] });
      }
    }
    this.place.addBlock(58.1, 35, 58.95, 42, 2.4);

    this.machine('claw', 'Claw Machine', 'R', 'timing', 47.4, 33, 'east', (g, parts) => {
      this.mesh(G.box, lam(0xff3fa4), g, { p: [0, 0.45, 0], s: [1.2, 0.9, 1.2] });
      const glass = new THREE.MeshLambertMaterial({ color: 0xbfe9ff, transparent: true, opacity: 0.25 });
      this.mesh(G.box, glass, g, { p: [0, 1.4, 0], s: [1.15, 1.0, 1.15], shadow: false });
      const top = glowMat(0xffd23f);
      this.mesh(G.box, top, g, { p: [0, 2.05, 0], s: [1.2, 0.3, 1.2] });
      parts.lights.push({ mat: top, on: new THREE.Color(0xffd23f) });
      this.mesh(G.cylLo, mat(0x8a8f99, { metal: 0.7 }), g, { p: [0.1, 1.65, 0.1], s: [0.02, 0.5, 0.02] });
      for (let k = 0; k < 7; k++) {
        this.mesh(G.sphere, mat(plush[k % 5], { rough: 0.8 }), g, { p: [-0.35 + (k % 4) * 0.23, 1.02, -0.3 + Math.floor(k / 4) * 0.4], s: [0.12, 0.12, 0.12] });
      }
    }, { reach: 1.2 });
    this.place.addBlock(46.8, 32.4, 48.0, 33.6, 2.2);

    this.machine('tickets', 'Ticket Muncher', 'R', 'sequence', 50.5, 42.5, 'north', (g, parts) => {
      this.mesh(G.box, lam(0x2a4fa0), g, { p: [0, 0.9, 0], s: [0.8, 1.8, 0.6] });
      this.mesh(G.box, lam(0x111111), g, { p: [0, 1.0, 0.31], s: [0.4, 0.06, 0.02] });
      const okTex = T.screenTex('Tickets', '#ffd23f');
      const scr = new THREE.MeshBasicMaterial({ map: okTex });
      this.mesh(G.plane, scr, g, { p: [0, 1.45, 0.31], s: [0.5, 0.35, 1] });
      parts.screens.push({ mat: scr, ok: okTex, bad: T.screenTex('Tickets', '#f00', true) });
      this.mesh(G.sphere, lam(0xffffff), g, { p: [-0.18, 0.75, 0.32], s: [0.08, 0.08, 0.02] });
      this.mesh(G.sphere, lam(0xffffff), g, { p: [0.18, 0.75, 0.32], s: [0.08, 0.08, 0.02] });
      this.mesh(G.box, lam(0xffffff), g, { p: [0, 0.55, 0.32], s: [0.3, 0.06, 0.02] });
    }, { reach: 1.1 });
    this.place.addBlock(50.1, 42.1, 50.9, 42.95, 1.8);

    this.fuseBox('fuseR', 'Fuse Box', 'R', 46.0, 38.5, 'east');
    this.sign('PRIZES!', 56.5, 34.03, 1.9, 2.4, 0.6, 'south', { bg: '#ffd23f', fg: '#ff3fa4', glow: '#2a4fa0' });
    this.light(52, 36, 3.6, 0xffd23f, 20, 1.4, { room: 'R', distance: 14 });
  }

  // ── Security cameras ──────────────────────────────────────────────────

  cameras() {
    const defs = [
      ['Show Stage', 'D', [30, 3.9, 21.6], [30, 1.3, 3]],
      ['Dining Area', 'D', [15.6, 4.0, 1.6], [34, 0.2, 18]],
      ['Kitchen', 'K', [13.4, 3.9, 11.4], [5, 0.6, 3]],
      ['Parts & Service', 'J', [13.4, 3.9, 13.6], [4, 0.3, 21]],
      ['Ball Pit', 'B', [13.4, 3.9, 42.4], [6, 0.2, 31]],
      ['Slide Tower', 'T', [29.4, 3.9, 42.4], [19, 1.2, 34]],
      ['West Hall', 'H', [15.6, 3.9, 30.4], [32, 0.8, 26.5]],
      ['East Hall', 'H', [44.4, 3.9, 30.4], [28, 0.8, 26.5]],
      ['Party Room', 'P', [46.6, 3.9, 11.4], [55, 0.6, 2.5]],
      ['Arcade', 'A', [58.4, 3.9, 27.4], [49, 0.6, 16]],
      ['Prize Counter', 'R', [46.6, 3.9, 29.6], [55, 0.4, 40]],
      ['Lobby', 'E', [40.6, 3.9, 32.4], [43, 0.4, 41]],
    ];
    defs.forEach(([name, room, [px, y, pz], [lx, ly, lz]], i) => {
      const pos = P(px, pz, y);
      const look = P(lx, lz, ly);
      const housing = new THREE.Group();
      housing.position.copy(pos);
      housing.lookAt(look);
      this.mesh(G.box, lam(0xdedede), housing, { p: [0, 0, -0.1], s: [0.18, 0.16, 0.34] });
      this.mesh(G.cylLo, lam(0x111111), housing, { p: [0, 0, 0.08], s: [0.06, 0.04, 0.06], r: [Math.PI / 2, 0, 0] });
      const led = glowMat(0xff2020);
      this.mesh(G.sphere, led, housing, { p: [0.06, 0.06, 0.05], s: [0.015, 0.015, 0.015], shadow: false });
      this.group.add(housing);
      this.cams.push({ id: i + 1, name, room, pos, look, led, chewed: 0 });
    });
  }

  exits() {
    for (const [px, pz, facing] of [[15.03, 6.5, 'east'], [44.97, 26.5, 'west'], [42.5, 30.97, 'north'], [38, 23.97, 'north']]) {
      const g = this.anchor(px, pz, facing, 3.4);
      const m = new THREE.MeshBasicMaterial({ map: T.signTex('EXIT', { bg: '#0a2a0a', fg: '#3cff6b', glow: '#3cff6b', w: 128, h: 48, font: 'bold 32px sans-serif' }) });
      this.mesh(G.plane, m, g, { p: [0, 0, 0], s: [0.6, 0.22, 1], shadow: false });
      this.exitSigns.push(m);
    }
    // ammo crate spots for the boss nights
    this.crateSpots = [P(21, 28), P(52.5, 21.6), P(7, 17), P(36, 13.3), P(24, 33.2), P(52, 39.5)];
  }

  // ── Per-frame decoration ──────────────────────────────────────────────

  update(dt, t, machineBroken) {
    for (const b of this.balloons) b.obj.position.y = b.base + Math.sin(t * 0.9 + b.phase) * 0.08;
    for (const s of this.spinners) {
      if (s.machine && machineBroken(s.machine)) continue;
      s.obj.rotation[s.axis] += s.speed * dt;
    }
  }
}

export const roomName = (id) => (ROOMS[id] ? ROOMS[id].name : '');
