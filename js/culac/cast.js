// Who's at Culac's Daycare (the designer's sixth story), built from the same parts as everyone
// else (models.js):
//
//   Jimmy, five, in his astronaut suit (models.js: buildJimmy), and Leo, six, in green
//   dinosaur pajamas — a kid from the beds, player 2 when two are playing
//   the other kids asleep in the beds
//   Officer Grumble, the night guard: tall and skinny, and he never smiles
//   the four new ones, the designer's own: Mean Baby (a cursed baby), Roglego (a bunch of
//   wires and a face), Ouchie (an owl) and Gokupug (a super-fighter in the shape of a pug,
//   with tiny legs, spiky blue hair and a black karate suit with a lightning bolt on it)
//
// Every rig works with poseRig, and `finish` works out where its face is for the jumpscare.
import * as THREE from 'three';
import {
  buildPerson, buildKid, mat, fur, cloth, biped, part, group, eyes, addFur, MODEL_G as G, addKnees, tailRoot,
} from '../models.js';
import { buildHands } from '../plex/cast.js';
import { REALISTIC, GLOW } from '../config.js';

function finish(rig, id, snout = 0.5, { person = false, furry = true } = {}) {
  if (REALISTIC && !person && furry) addFur(rig.root);
  rig.id = id;
  rig.root.updateMatrixWorld(true);
  const head = new THREE.Vector3();
  rig.head.getWorldPosition(head);
  rig.faceY = head.y + rig.headR;
  rig.snout = snout;
  rig.root.traverse((o) => { if (o.isMesh) o.userData.owner = id; });
  return rig;
}

const glowing = (c, k = 0.5) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(Math.max(1, GLOW * k)) });

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

// ── Leo ─────────────────────────────────────────────────────────────────
//
// Six, in green dinosaur pajamas (the designer's call): a hood with a row of spikes down the
// back and little white teeth round the edge of it, and a tail.

export function buildLeo() {
  const h = 1.12;
  const rig = buildPerson({
    height: h, headScale: 0.11, shoulders: 0.16, shirt: 0x3a9a3a, pants: 0x2f8a34,
    skin: 0xf1c7a5, hair: 0x6a3a1a, shadows: true, eye: 0x3a5a2a,
  });
  addKnees(rig);
  const hr = h * 0.11;
  rig.headR = hr;
  const green = cloth(0x3a9a3a), spike = mat(0xa8e04a, { rough: 0.6 });
  // the hood, open at the front
  const hood = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12, Math.PI / 2 + 1.05, Math.PI * 2 - 2.1, 0, Math.PI * 0.62), green);
  hood.position.set(0, hr * 1.05, -hr * 0.05);
  hood.scale.set(hr * 1.25, hr * 1.3, hr * 1.25);
  rig.head.add(hood);
  for (let i = 0; i < 4; i++) part(G.cone, spike, rig.head, { p: [0, hr * (2.25 - i * 0.32), -hr * (0.2 + i * 0.38)], s: [0.025, 0.06, 0.04], r: [-0.4 - i * 0.35, 0, 0] });
  for (let i = 0; i < 5; i++) {
    const a = -0.9 + i * 0.45;
    part(G.cone, mat(0xf4f1ea), rig.head, { p: [Math.sin(a) * hr * 1.05, hr * 1.7 - Math.abs(a) * hr * 0.5, Math.cos(a) * hr * 0.7], s: [0.012, 0.03, 0.012], r: [Math.PI, 0, 0] });
  }
  const th = h * 0.3;
  for (let i = 0; i < 3; i++) part(G.cone, spike, rig.torso, { p: [0, th * (0.85 - i * 0.3), -0.1], s: [0.03, 0.07, 0.04], r: [-0.5, 0, 0] });
  // the tail
  const tail = group(rig.torso, [0, 0.02, -0.08]);
  part(G.cone, green, tail, { p: [0, 0, -0.14], s: [0.07, 0.3, 0.07], r: [-1.9, 0, 0] });
  rig.root.updateMatrixWorld(true);
  return finish(rig, 'leo', 0.3, { person: true });
}

export const leoHands = () => buildHands({ sleeve: 0x3a9a3a, skin: 0xf1c7a5, scale: 0.6 });

// The kids asleep in the beds (Leo's in the one right next to Jimmy's).
export const KID_NAMES = ['Leo', 'Mia', 'Sam', 'Ava', 'Noah', 'Lily', 'Ben', 'Zara', 'Theo'];

export function buildSleepyKid(i) {
  if (i === 0) return buildLeo();
  const rig = buildKid(seeded(31 + i * 17));
  rig.root.scale.setScalar(0.85);
  rig.headR = rig.height * 0.11 * 0.85;
  return finish(rig, `kid${i}`, 0.3, { person: true });
}

// ── Officer Grumble ─────────────────────────────────────────────────────
//
// The night guard (the designer: "tall and skinny, never smiles"). A navy uniform hanging off
// him, a cap pulled low, a grey moustache, and a flashlight the size of a baseball bat.

export function buildGrumble() {
  const rig = buildPerson({
    height: 1.98, headScale: 0.07, shoulders: 0.17, shirt: 0x1f2a4a, pants: 0x161b28, skin: 0xd8b8a0,
    cap: 0x161b28, hair: 0x8a8a8a, badge: true, shadows: true, beard: null, eye: 0x2a2a2a,
  });
  addKnees(rig);
  const hr = 1.98 * 0.07;
  rig.headR = hr;
  rig.radius = 0.32;
  // the moustache, and a frown
  part(G.box, mat(0x8a8a8a, { rough: 0.9 }), rig.head, { p: [0, hr * 0.68, hr * 0.92], s: [hr * 0.9, hr * 0.14, hr * 0.12] });
  for (const sx of [-1, 1]) part(G.box, mat(0x5a2a2a), rig.head, { p: [sx * hr * 0.2, hr * 0.48, hr * 0.92], s: [hr * 0.3, hr * 0.05, hr * 0.06], r: [0, 0, sx * 0.35] });
  // the big flashlight, in his right hand
  const torch = group(rig.armR, [0, -0.62, 0.1]);
  part(G.cyl, mat(0x1a1a1a, { rough: 0.4, metal: 0.4 }), torch, { p: [0, 0, 0.15], s: [0.05, 0.5, 0.05], r: [Math.PI / 2, 0, 0] });
  part(G.cyl, mat(0x2a2a2a, { metal: 0.5 }), torch, { p: [0, 0, 0.42], s: [0.085, 0.1, 0.085], r: [Math.PI / 2, 0, 0] });
  rig.torchLens = part(G.cyl, glowing(0xfff4c8, 0.8), torch, { p: [0, 0, 0.475], s: [0.075, 0.01, 0.075], r: [Math.PI / 2, 0, 0] });
  rig.torch = torch;
  // a radio on his shoulder
  part(G.box, mat(0x111111), rig.torso, { p: [-0.13, 1.98 * 0.3 * 0.86, 0.1], s: [0.05, 0.1, 0.03] });
  part(G.cyl, mat(0x111111), rig.torso, { p: [-0.13, 1.98 * 0.3 * 0.86 + 0.09, 0.1], s: [0.006, 0.08, 0.006] });
  // eyes that glint for the jumpscare
  const glint = glowing(0xffffff, 0.3);
  rig.eyeMat = glint;
  rig.eyeColor = new THREE.Color(0xffffff);
  rig.pupils = [];
  rig.eyeballs = [];
  for (const sx of [-1, 1]) rig.pupils.push(part(G.sphereLo, glint, rig.head, { p: [sx * hr * 0.35, hr * 1.05, hr * 0.93], s: [0.012, 0.012, 0.006] }));
  rig.root.updateMatrixWorld(true);
  return finish(rig, 'grumble', 0.25, { person: true });
}

// ── Mean Baby ───────────────────────────────────────────────────────────
//
// A cursed baby (the designer's call): an old porcelain baby doll as tall as Jimmy, cracked
// all over, in a faded bonnet and a onesie, with red eyes and a dummy in its mouth. When it
// sees you it cries — and everything else comes running.

export function buildMeanBaby() {
  const porcelain = REALISTIC
    ? new THREE.MeshPhysicalMaterial({ color: 0xf0dcd0, roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.2 })
    : mat(0xf0dcd0, { rough: 0.25 });
  const onesie = cloth(0x9ab8d8), bonnet = cloth(0xe8b8c8), crack = mat(0x2a1a1a, { rough: 0.9 });
  const rig = biped({
    height: 1.25, legLen: 0.3, hipW: 0.1, legR: 0.08, legMat: onesie, footMat: porcelain,
    footW: 0.1, footL: 0.14,
    torsoH: 0.42, torsoW: 0.52, torsoD: 0.44, bodyMat: onesie, bellyMat: null,
    headR: 0.27, headMat: porcelain, armLen: 0.34, armR: 0.07, armMat: onesie, handMat: porcelain, handR: 0.07,
    swing: 0.5,
  });
  rig.radius = 0.34;
  const h = rig.head, r = 0.27;
  // round baby cheeks, a little nose
  for (const sx of [-1, 1]) part(G.sphere, porcelain, h, { p: [sx * 0.12, 0.2, 0.17], s: [0.1, 0.09, 0.08] });
  part(G.sphereLo, porcelain, h, { p: [0, 0.26, 0.26], s: [0.035, 0.03, 0.03] });
  eyes(h, rig, { color: 0xff1a1a, x: 0.1, y: 0.33, z: 0.22, r: 0.065 });
  // the dummy
  rig.jaw = group(h, [0, 0.16, 0.24]);
  part(G.cyl, mat(0x7ad1d8, { rough: 0.3 }), rig.jaw, { p: [0, 0, 0.03], s: [0.07, 0.02, 0.07], r: [Math.PI / 2, 0, 0] });
  part(G.torus, mat(0xffd23f, { rough: 0.3 }), rig.jaw, { p: [0, 0, 0.06], s: [0.04, 0.04, 0.04] });
  // cracks across the face and the top of the head
  for (const [x, y, z, len, rz] of [[0.08, 0.42, 0.18, 0.18, 0.9], [-0.05, 0.36, 0.23, 0.14, -0.5], [0.15, 0.25, 0.16, 0.12, 0.2], [-0.12, 0.48, 0.1, 0.16, 1.3], [0.02, 0.5, 0.16, 0.12, -1.1]]) {
    part(G.box, crack, h, { p: [x, y, z], s: [0.008, len, 0.008], r: [0.3, 0.2, rz] });
  }
  // a chip out of its head, dark inside
  part(G.sphereLo, mat(0x0a0606, { rough: 1 }), h, { p: [-0.16, 0.42, 0.13], s: [0.05, 0.04, 0.03] });
  // the bonnet, and its ribbon
  const bon = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), bonnet);
  bon.position.set(0, r * 1.02, -0.04);
  bon.rotation.x = -0.55;
  bon.scale.set(r * 1.12, r * 1.12, r * 1.12);
  h.add(bon);
  for (const sx of [-1, 1]) part(G.box, cloth(0xe8b8c8), h, { p: [sx * 0.16, 0.08, 0.12], s: [0.03, 0.16, 0.02], r: [0, 0, sx * 0.3] });
  // a bib
  part(G.sphere, cloth(0xf4f1ea), rig.torso, { p: [0, 0.34, 0.2], s: [0.15, 0.1, 0.04] });
  rig.headR = r;
  return finish(rig, 'meanbaby', 0.3, { furry: false });
}

// ── Roglego ─────────────────────────────────────────────────────────────
//
// "A bunch of wires and a face" (the designer's words): nothing inside but cables, red and
// yellow and blue and black, knotted into the shape of somebody, with one old white face mask
// stuck on the front. Its wires crawl through the walls to get to you.

export function buildRoglego() {
  const black = mat(0x14141a, { rough: 0.5 });
  const rig = biped({
    height: 1.95, legLen: 0.78, hipW: 0.13, legR: 0.05, legMat: black, footMat: black,
    footW: 0.12, footL: 0.22,
    torsoH: 0.72, torsoW: 0.48, torsoD: 0.36, bodyMat: black, bellyMat: null,
    headR: 0.22, armLen: 0.92, armR: 0.045, armMat: black, handMat: black, handR: 0.06,
    swing: 0.75,
  });
  rig.radius = 0.36;
  rig.body.visible = false;            // there's no body: just the wires
  rig.skull.visible = false;
  const cols = [0xd11f2a, 0xffd23f, 0x2a6ad8, 0x2f9a4a, 0x14141a, 0xff9a1f];
  const rand = seeded(9);
  const wire = (parent, pts, c, r = 0.022) => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, r, 5, false), mat(c, { rough: 0.35 }));
    m.castShadow = true;
    parent.add(m);
    return m;
  };
  // the body: loops of cable wound round where a chest would be
  for (let i = 0; i < 22; i++) {
    const y0 = rand() * 0.7, a0 = rand() * Math.PI * 2;
    const pts = [];
    for (let k = 0; k < 6; k++) {
      const a = a0 + k * 1.1, y = y0 + (rand() - 0.5) * 0.25;
      pts.push([Math.cos(a) * (0.18 + rand() * 0.08), Math.max(0, Math.min(0.8, y)), Math.sin(a) * (0.13 + rand() * 0.06)]);
    }
    wire(rig.torso, pts, cols[i % cols.length], 0.016 + rand() * 0.014);
  }
  // the arms and legs: bundles of wires, and loose ends trailing off the hands
  for (const arm of [rig.armL, rig.armR]) {
    for (let i = 0; i < 5; i++) {
      const s = (rand() - 0.5) * 0.06;
      wire(arm, [[s, 0, s], [s * 2, -0.3, 0.03], [-s, -0.6, -s], [s, -0.92, 0.02]], cols[(i + 2) % cols.length], 0.014);
    }
    for (let i = 0; i < 4; i++) {
      const a = rand() * Math.PI * 2;
      wire(arm, [[0, -0.9, 0], [Math.cos(a) * 0.08, -1.05, Math.sin(a) * 0.08], [Math.cos(a) * 0.16, -1.15 - rand() * 0.15, Math.sin(a) * 0.16]], cols[i % cols.length], 0.012);
    }
  }
  for (const leg of [rig.legL, rig.legR]) {
    for (let i = 0; i < 4; i++) {
      const s = (rand() - 0.5) * 0.07;
      wire(leg, [[s, 0, s], [-s, -0.4, 0.02], [s, -0.78, -s]], cols[(i + 1) % cols.length], 0.016);
    }
  }
  // the neck: a twist of cables
  for (let i = 0; i < 4; i++) wire(rig.neck, [[0.03 * (i - 1.5), -0.05, 0], [0.02 * (1.5 - i), 0.12, 0.02], [0, 0.22, 0.04]], cols[i], 0.016);
  // the face: an old white mask, with a crack and a too-wide grin
  const h = rig.head;
  const mask = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 12, Math.PI * 0.2, Math.PI * 0.6, Math.PI * 0.15, Math.PI * 0.6),
    mat(0xeae4d8, { rough: 0.35 }));
  mask.position.set(0, 0.24, 0.02);
  mask.scale.set(0.22, 0.26, 0.22);
  h.add(mask);
  const face = group(h, [0, 0.24, 0.252]);
  eyes(face, rig, { color: 0xffe23a, x: 0.07, y: 0.05, z: 0.0, r: 0.045, white: false });
  for (const sx of [-1, 1]) part(G.sphereLo, mat(0x050505, { rough: 1 }), face, { p: [sx * 0.07, 0.05, -0.005], s: [0.05, 0.035, 0.02] });
  rig.jaw = group(face, [0, -0.07, 0]);
  part(G.box, mat(0x050505, { rough: 1 }), rig.jaw, { p: [0, 0, 0.0], s: [0.16, 0.035, 0.02] });
  for (let i = 0; i < 6; i++) part(G.box, mat(0xd8d0b0), rig.jaw, { p: [-0.065 + i * 0.026, 0.012, 0.008], s: [0.016, 0.02, 0.008] });
  part(G.box, mat(0x2a1a1a), face, { p: [0.04, 0.1, 0.005], s: [0.006, 0.08, 0.006], r: [0, 0, 0.6] });
  // wires pouring out from behind the mask like hair
  for (let i = 0; i < 9; i++) {
    const a = -1.2 + i * 0.3;
    wire(h, [[Math.sin(a) * 0.12, 0.42, -0.02], [Math.sin(a) * 0.2, 0.3, -0.12], [Math.sin(a) * 0.26, 0.05 - rand() * 0.15, -0.16]], cols[i % cols.length], 0.014);
  }
  rig.headR = 0.24;
  return finish(rig, 'roglego', 0.3, { furry: false });
}

// ── Ouchie the owl ──────────────────────────────────────────────────────
//
// An owl from Owl's Café: round and brown, huge orange-ringed eyes, ear tufts, a hooked beak,
// wings for arms and big talons. He's called Ouchie, so he's covered in sticking plasters.
// He flies over everything (the designer's call) and swoops down to grab you.

export function buildOuchie() {
  const brown = fur(0x7a5232, { pile: 0.7 }), tan = fur(0xd8b888, { pile: 0.6 }), dark = fur(0x4a3020, { pile: 0.8 });
  const orange = mat(0xff9a1a, { rough: 0.4 });
  const rig = biped({
    height: 1.75, legLen: 0.36, hipW: 0.15, legR: 0.07, legMat: mat(0xe0a030, { rough: 0.5 }), footMat: mat(0xe0a030),
    footW: 0.2, footL: 0.2,
    torsoH: 0.86, torsoW: 0.84, torsoD: 0.7, bodyMat: brown, bellyMat: tan,
    headR: 0.36, headSX: 1.15, headSY: 0.95, armLen: 0.66, armR: 0.06, armMat: brown, handMat: brown, handR: 0.05,
    swing: 0.35,
  });
  rig.radius = 0.46;
  const h = rig.head;
  // the face disc, the big eyes in orange rings, the beak
  part(G.sphere, tan, h, { p: [0, 0.34, 0.16], s: [0.34, 0.27, 0.18] });
  for (const sx of [-1, 1]) part(G.torus, orange, h, { p: [sx * 0.14, 0.38, 0.32], s: [0.1, 0.1, 0.1] });
  eyes(h, rig, { color: 0xffb020, x: 0.14, y: 0.38, z: 0.3, r: 0.1 });
  part(G.cone, mat(0x3a3020, { rough: 0.4 }), h, { p: [0, 0.27, 0.38], s: [0.05, 0.13, 0.05], r: [Math.PI * 0.8, 0, 0] });
  rig.jaw = group(h, [0, 0.22, 0.34]);
  part(G.cone, mat(0x2a2010), rig.jaw, { p: [0, 0, 0.02], s: [0.035, 0.06, 0.035], r: [Math.PI * 0.6, 0, 0] });
  // ear tufts
  for (const sx of [-1, 1]) part(G.cone, dark, h, { p: [sx * 0.26, 0.66, 0], s: [0.07, 0.2, 0.06], r: [0, 0, -sx * 0.4] });
  // wings: a fan of long feathers down each arm
  for (const arm of [rig.armL, rig.armR]) {
    const sx = arm === rig.armL ? -1 : 1;
    for (let i = 0; i < 5; i++) {
      part(G.sphere, i % 2 ? dark : brown, arm, { p: [sx * 0.05, -0.12 - i * 0.12, -0.06 - i * 0.02], s: [0.04, 0.2, 0.14 + i * 0.015], r: [0.2, 0, sx * 0.15] });
    }
  }
  // talons
  for (const leg of [rig.legL, rig.legR]) {
    for (const a of [-0.5, 0, 0.5]) part(G.cone, mat(0x2a2010), leg, { p: [Math.sin(a) * 0.08, -0.34, 0.1 + Math.cos(a) * 0.08], s: [0.02, 0.08, 0.02], r: [Math.PI / 2, 0, -a] });
  }
  // the sticking plasters: on his head, a wing and his tummy
  const plaster = mat(0xe8c098, { rough: 0.8 });
  part(G.box, plaster, h, { p: [0.1, 0.62, 0.18], s: [0.16, 0.04, 0.02], r: [0.6, 0, 0.5] });
  part(G.box, plaster, h, { p: [0.1, 0.62, 0.18], s: [0.16, 0.04, 0.02], r: [0.6, 0, -0.5] });
  part(G.box, plaster, rig.torso, { p: [-0.12, 0.42, 0.33], s: [0.16, 0.05, 0.02], r: [0, 0, 0.4] });
  part(G.box, plaster, rig.armR, { p: [0.06, -0.3, 0.05], s: [0.02, 0.14, 0.05] });
  // a short tail of feathers
  const tail = tailRoot(rig, { k: 0.6 });
  for (let i = -1; i <= 1; i++) part(G.sphere, dark, tail, { p: [i * 0.06, -0.08, -0.06], s: [0.05, 0.14, 0.04], r: [-0.8, 0, i * 0.3] });
  rig.headR = 0.36;
  return finish(rig, 'ouchie', 0.45);
}

// ── Gokupug ─────────────────────────────────────────────────────────────
//
// The designer's super-fighter in the shape of a pug, with tiny legs: a squashed pug face with
// wrinkles, a curly tail, spiky blue hair (his pick), and a black karate suit with a yellow
// lightning bolt on it and a belt. He does a super jump: really high, and he lands right next
// to you. (He's his own fighter, not anybody from another show.)

export function buildGokupug() {
  const fawn = fur(0xd8b078, { pile: 0.5 }), black = mat(0x16161c, { rough: 0.6 }), suit = cloth(0x1a1a22);
  const blue = mat(0x2a7aff, { rough: 0.3, emissive: 0x0a2050 });
  const rig = biped({
    height: 1.3, legLen: 0.2, hipW: 0.15, legR: 0.08, legMat: suit, footMat: fawn,
    footW: 0.13, footL: 0.18,
    torsoH: 0.58, torsoW: 0.72, torsoD: 0.6, bodyMat: suit, bellyMat: null,
    headR: 0.32, headSX: 1.1, headSZ: 0.9, headMat: fawn, armLen: 0.4, armR: 0.085, armMat: suit, handMat: fawn, handR: 0.09,
    swing: 0.6,
  });
  rig.radius = 0.42;
  const h = rig.head;
  // the pug face: a flat black muzzle, wrinkles, a little nose, big round eyes, floppy ears
  part(G.sphere, black, h, { p: [0, 0.22, 0.24], s: [0.17, 0.12, 0.08] });
  part(G.sphereLo, mat(0x050505, { rough: 0.3 }), h, { p: [0, 0.27, 0.31], s: [0.06, 0.04, 0.03] });
  for (const y of [0.42, 0.47]) part(G.torus, mat(0xb08850, { rough: 0.8 }), h, { p: [0, y, 0.22], s: [0.12, 0.05, 0.05], r: [Math.PI / 2 - 0.4, 0, 0] });
  eyes(h, rig, { color: 0x2affd0, x: 0.14, y: 0.34, z: 0.25, r: 0.075 });
  for (const sx of [-1, 1]) part(G.sphere, black, h, { p: [sx * 0.3, 0.46, 0], s: [0.06, 0.12, 0.1], r: [0, 0, sx * 0.7] });
  rig.jaw = group(h, [0, 0.13, 0.22]);
  part(G.sphere, black, rig.jaw, { p: [0, -0.02, 0.03], s: [0.12, 0.04, 0.06] });
  part(G.box, mat(0xd8405a), rig.jaw, { p: [0, -0.04, 0.08], s: [0.05, 0.02, 0.05] });
  // the spiky blue hair: a crown of spikes sticking up and back
  for (let i = 0; i < 9; i++) {
    const a = -1.4 + i * 0.35;
    part(G.cone, blue, h, { p: [Math.sin(a) * 0.17, 0.62 + Math.cos(a) * 0.06, -0.04 - Math.abs(a) * 0.03], s: [0.085, 0.34, 0.085], r: [-0.3, 0, -a * 0.6] });
  }
  for (let i = 0; i < 4; i++) part(G.cone, blue, h, { p: [-0.12 + i * 0.08, 0.5, 0.18], s: [0.04, 0.12, 0.04], r: [1.1, 0, 0] });
  // the karate suit: the wrap of the jacket, the lightning bolt on the chest, and the belt
  const th = 0.58;
  part(G.box, cloth(0x2a2a34), rig.torso, { p: [0.05, th * 0.6, 0.29], s: [0.05, 0.4, 0.02], r: [0, 0, 0.45] });
  const bolt = mat(0xffd23f, { rough: 0.3, emissive: 0x4a3400 });
  part(G.box, bolt, rig.torso, { p: [-0.12, th * 0.72, 0.3], s: [0.05, 0.14, 0.02], r: [0, 0, 0.5] });
  part(G.box, bolt, rig.torso, { p: [-0.1, th * 0.58, 0.31], s: [0.1, 0.03, 0.02], r: [0, 0, -0.4] });
  part(G.box, bolt, rig.torso, { p: [-0.08, th * 0.45, 0.3], s: [0.05, 0.14, 0.02], r: [0, 0, 0.5] });
  part(G.cyl, cloth(0xffd23f), rig.torso, { p: [0, th * 0.18, 0], s: [0.37, 0.06, 0.31] });
  for (const sx of [-1, 1]) part(G.box, cloth(0xffd23f), rig.torso, { p: [sx * 0.06, th * 0.08, 0.3], s: [0.04, 0.14, 0.02], r: [0, 0, sx * 0.2] });
  // the curly tail
  const tail = tailRoot(rig, { k: 0.4 });
  part(G.torus, fawn, tail, { p: [0, 0.06, -0.08], s: [0.07, 0.07, 0.07], r: [0, Math.PI / 2, 0] });
  rig.headR = 0.32;
  return finish(rig, 'gokupug', 0.35);
}
