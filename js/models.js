// Every character mesh, built from primitives in code: the five animatronics, the Junk
// Monster, the daytime kids, and Jonathan's hands and gear.
//
// The look is Security Breach by way of a toy box — glossy, chunky, brightly coloured
// plastic over a metal skeleton — so the same characters can be cheerful on the stage at
// noon and terrifying in a dark hallway at 3 AM. The only thing that changes is the light
// and the eyes.
//
// Every character is a rig of nested groups (hips → torso → head → jaw, shoulders → arms,
// hips → legs) facing +Z, so `rotation.y = atan2(dx, dz)` turns it to face (dx, dz).
import * as THREE from 'three';
import { SHADOWS } from './config.js';

const matCache = new Map();
export function mat(color, { rough = 0.42, metal = 0.08, emissive = null } = {}) {
  const key = `${color}|${rough}|${metal}|${emissive}`;
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
  if (emissive !== null) { m.emissive = new THREE.Color(emissive); m.emissiveIntensity = 1; }
  matCache.set(key, m);
  return m;
}
const METAL = () => mat(0x8a8f99, { rough: 0.35, metal: 0.7 });
const DARK_METAL = () => mat(0x3a3d44, { rough: 0.4, metal: 0.6 });

const G = {
  sphere: new THREE.SphereGeometry(1, 20, 14),
  sphereLo: new THREE.SphereGeometry(1, 12, 8),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 14),
  cylTaper: new THREE.CylinderGeometry(0.8, 1, 1, 14),
  cone: new THREE.ConeGeometry(1, 1, 14),
  box: new THREE.BoxGeometry(1, 1, 1),
  torus: new THREE.TorusGeometry(1, 0.18, 8, 20),
};

function part(geo, material, parent, { p = [0, 0, 0], s = [1, 1, 1], r = [0, 0, 0] } = {}) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(p[0], p[1], p[2]);
  m.scale.set(s[0], s[1], s[2]);
  m.rotation.set(r[0], r[1], r[2]);
  m.castShadow = SHADOWS;
  parent.add(m);
  return m;
}

function group(parent, p = [0, 0, 0]) {
  const g = new THREE.Group();
  g.position.set(p[0], p[1], p[2]);
  parent.add(g);
  return g;
}

// A limb hanging down from its pivot: a metal joint ball, then a plastic sleeve.
function limb(parent, len, rad, material, { joint = true, foot = null } = {}) {
  if (joint) part(G.sphereLo, DARK_METAL(), parent, { s: [rad * 1.1, rad * 1.1, rad * 1.1] });
  part(G.cyl, material, parent, { p: [0, -len / 2, 0], s: [rad, len, rad] });
  if (foot) foot(parent, len);
  return parent;
}

// ── Eyes ────────────────────────────────────────────────────────────────
//
// Each animatronic has its own eye colour. The pupils are emissive so they glow in the
// dark — `setEyes(rig, level)` dims them for powered-down and turns them blue for friends.

function eyes(head, rig, { color, x = 0.13, y = 0.08, z = 0.3, r = 0.085, white = true }) {
  const glow = new THREE.MeshBasicMaterial({ color });
  rig.eyeMat = glow;
  rig.eyeColor = new THREE.Color(color);
  for (const sx of [-1, 1]) {
    if (white) part(G.sphereLo, mat(0xf4f1ea, { rough: 0.2 }), head, { p: [sx * x, y, z], s: [r, r, r * 0.7] });
    part(G.sphereLo, glow, head, { p: [sx * x, y, z + r * 0.55], s: [r * 0.45, r * 0.45, r * 0.25] });
  }
}

export function setEyes(rig, mode) {
  // The Junk Monster has a whole set of heads, so it can have many eye materials.
  for (const m of rig.eyeMats || (rig.eyeMat ? [rig.eyeMat] : [])) {
    if (mode === 'off') m.color.setRGB(0.05, 0.05, 0.05);
    else if (mode === 'friend') m.color.set(0x5ad1ff);
    else if (mode === 'scare') m.color.set(0xff1a1a);
    else if (mode === 'dim') m.color.copy(rig.eyeColor).multiplyScalar(0.35);
    else m.color.copy(rig.eyeColor);
  }
}

// ── The generic biped ───────────────────────────────────────────────────

function biped(o) {
  const root = new THREE.Group();
  const rig = { root, height: o.height, radius: o.radius || 0.45, swing: o.swing || 0.55 };
  rig.hips = group(root, [0, o.legLen, 0]);
  rig.legL = group(rig.hips, [-o.hipW, 0, 0]);
  rig.legR = group(rig.hips, [o.hipW, 0, 0]);
  for (const leg of [rig.legL, rig.legR]) {
    limb(leg, o.legLen, o.legR, o.legMat, {
      foot: (g, len) => part(G.sphereLo, o.footMat || o.legMat, g,
        { p: [0, -len + 0.05, 0.08], s: [o.footW || 0.16, 0.08, o.footL || 0.24] }),
    });
  }
  rig.torso = group(rig.hips, [0, 0, 0]);
  rig.body = part(G.sphere, o.bodyMat, rig.torso,
    { p: [0, o.torsoH / 2, 0], s: [o.torsoW / 2, o.torsoH / 2 + 0.08, o.torsoD / 2] });
  if (o.bellyMat) {
    part(G.sphere, o.bellyMat, rig.torso,
      { p: [0, o.torsoH * 0.45, o.torsoD * 0.18], s: [o.torsoW * 0.36, o.torsoH * 0.42, o.torsoD * 0.38] });
  }
  rig.neck = group(rig.torso, [0, o.torsoH + (o.neck || 0.06), 0]);
  part(G.cyl, DARK_METAL(), rig.neck, { p: [0, 0, 0], s: [0.09, 0.2, 0.09] });
  rig.head = group(rig.neck, [0, 0.05, 0]);
  rig.skull = part(G.sphere, o.headMat || o.bodyMat, rig.head,
    { p: [0, o.headR, 0], s: [o.headR * (o.headSX || 1), o.headR * (o.headSY || 1), o.headR * (o.headSZ || 1)] });

  const shoulderY = o.torsoH * 0.82;
  rig.armL = group(rig.torso, [-(o.torsoW / 2 + 0.04), shoulderY, 0]);
  rig.armR = group(rig.torso, [o.torsoW / 2 + 0.04, shoulderY, 0]);
  for (const arm of [rig.armL, rig.armR]) {
    limb(arm, o.armLen, o.armR, o.armMat || o.bodyMat);
    rig[arm === rig.armL ? 'handL' : 'handR'] =
      part(G.sphereLo, o.handMat || o.armMat || o.bodyMat, arm,
        { p: [0, -o.armLen - 0.02, 0.02], s: [o.handR || 0.11, o.handR || 0.11, o.handR || 0.11] });
  }
  rig.armBase = { L: [0, 0, 0.12], R: [0, 0, -0.12] };
  rig.hipY = o.legLen;
  return rig;
}

// ── Gus the Platypus ────────────────────────────────────────────────────

function buildGus() {
  const brown = mat(0x7a4a2b), tan = mat(0xc99a6b), bill = mat(0x4a5262, { rough: 0.25 });
  const rig = biped({
    height: 2.35, legLen: 0.78, hipW: 0.2, legR: 0.1, legMat: brown,
    footMat: bill, footW: 0.2, footL: 0.32,
    torsoH: 0.95, torsoW: 0.95, torsoD: 0.75, bodyMat: brown, bellyMat: tan,
    headR: 0.34, headSX: 1.05, armLen: 0.62, armR: 0.085, handMat: bill, handR: 0.12,
  });
  const h = rig.head;
  // the bill: a wide flat upper, and a lower half that is the jaw
  part(G.sphere, bill, h, { p: [0, 0.25, 0.44], s: [0.3, 0.1, 0.4], r: [0.12, 0, 0] });
  part(G.sphere, mat(0x1d2128), h, { p: [0, 0.29, 0.62], s: [0.05, 0.025, 0.04] });          // nostrils
  // A dark mouth behind the bill, and a darker, toothed lower bill, so a wide-open jaw
  // reads as a mouth in the flashlight rather than a pale beard.
  part(G.sphere, mat(0x1a0608, { rough: 0.9 }), h, { p: [0, 0.2, 0.38], s: [0.22, 0.06, 0.3] });
  rig.jaw = group(h, [0, 0.19, 0.2]);
  part(G.sphere, mat(0x24282f, { rough: 0.95 }), rig.jaw, { p: [0, -0.02, 0.26], s: [0.27, 0.07, 0.34], r: [0.05, 0, 0] });
  for (let k = 0; k < 6; k++) {
    part(G.cone, mat(0xe8e2d0, { rough: 0.3 }), rig.jaw, { p: [-0.15 + k * 0.06, 0.04, 0.42 - Math.abs(k - 2.5) * 0.03], s: [0.018, 0.05, 0.018] });
  }
  rig.jawMax = 0.45;
  eyes(h, rig, { color: 0xffa21f, x: 0.15, y: 0.44, z: 0.27 });
  // top hat, a little crooked, and a gold bow tie — he is the star of the show
  const hat = group(h, [0.04, 0.64, -0.02]);
  hat.rotation.z = -0.14;
  part(G.cyl, mat(0x5b2a86), hat, { p: [0, 0.02, 0], s: [0.32, 0.04, 0.32] });
  part(G.cyl, mat(0x5b2a86), hat, { p: [0, 0.2, 0], s: [0.21, 0.34, 0.21] });
  part(G.cyl, mat(0xf2c230, { metal: 0.5, rough: 0.3 }), hat, { p: [0, 0.08, 0], s: [0.215, 0.06, 0.215] });
  const tie = group(rig.torso, [0, 0.9, 0.33]);
  part(G.cone, mat(0xf2c230, { metal: 0.5, rough: 0.3 }), tie, { p: [-0.09, 0, 0], s: [0.07, 0.14, 0.07], r: [0, 0, Math.PI / 2] });
  part(G.cone, mat(0xf2c230, { metal: 0.5, rough: 0.3 }), tie, { p: [0.09, 0, 0], s: [0.07, 0.14, 0.07], r: [0, 0, -Math.PI / 2] });
  // the beaver-ish tail every platypus has
  part(G.sphere, mat(0x5a341d), rig.hips, { p: [0, -0.2, -0.5], s: [0.3, 0.07, 0.42], r: [0.5, 0, 0] });
  // microphone
  part(G.cyl, mat(0x222222), rig.armR, { p: [0, -0.72, 0.12], s: [0.03, 0.22, 0.03], r: [1.2, 0, 0] });
  part(G.sphereLo, METAL(), rig.armR, { p: [0, -0.68, 0.24], s: [0.06, 0.06, 0.06] });
  return rig;
}

// ── Gerald the Gorilla ──────────────────────────────────────────────────

function buildGerald() {
  const fur = mat(0x3a3a44, { rough: 0.6 }), face = mat(0x9b8f86, { rough: 0.5 });
  const rig = biped({
    height: 2.55, legLen: 0.72, hipW: 0.26, legR: 0.14, legMat: fur, footMat: face,
    footW: 0.2, footL: 0.28,
    torsoH: 1.15, torsoW: 1.3, torsoD: 0.9, bodyMat: fur, bellyMat: face,
    headR: 0.32, headSY: 0.95, armLen: 1.12, armR: 0.17, handMat: face, handR: 0.19,
    swing: 0.4,
  });
  rig.radius = 0.6;
  const h = rig.head;
  part(G.box, fur, h, { p: [0, 0.48, 0.2], s: [0.56, 0.1, 0.18] });                // brow
  part(G.sphere, face, h, { p: [0, 0.22, 0.26], s: [0.26, 0.16, 0.16] });           // muzzle
  rig.jaw = group(h, [0, 0.12, 0.2]);
  part(G.sphere, face, rig.jaw, { p: [0, -0.04, 0.06], s: [0.22, 0.08, 0.13] });
  part(G.box, mat(0xf4f1ea), rig.jaw, { p: [0, 0.02, 0.15], s: [0.24, 0.04, 0.03] }); // teeth
  eyes(h, rig, { color: 0xff2a2a, x: 0.12, y: 0.38, z: 0.26, r: 0.07 });
  // a red drummer's vest and two drumsticks
  part(G.cylTaper, mat(0xc0262d), rig.torso, { p: [0, 0.65, 0], s: [0.62, 0.7, 0.46] });
  for (const arm of [rig.armL, rig.armR]) {
    part(G.cyl, mat(0xd9b07a), arm, { p: [0, -1.2, 0.2], s: [0.025, 0.5, 0.025], r: [1.3, 0, 0] });
  }
  return rig;
}

// ── Chomper the Beaver ──────────────────────────────────────────────────

function buildChomper() {
  const fur = mat(0xa8642e), muzzle = mat(0xe8c39a);
  const rig = biped({
    height: 1.6, legLen: 0.45, hipW: 0.17, legR: 0.08, legMat: fur, footMat: mat(0x3a2414),
    torsoH: 0.66, torsoW: 0.78, torsoD: 0.66, bodyMat: fur, bellyMat: muzzle,
    headR: 0.3, armLen: 0.42, armR: 0.07, handMat: mat(0x3a2414), handR: 0.08,
    swing: 0.7,
  });
  rig.radius = 0.4;
  const h = rig.head;
  part(G.sphere, muzzle, h, { p: [0, 0.22, 0.24], s: [0.18, 0.13, 0.12] });
  part(G.sphereLo, mat(0x2a1a10), h, { p: [0, 0.3, 0.35], s: [0.05, 0.04, 0.04] });     // nose
  // the teeth. Big ones.
  part(G.box, mat(0xfffbe6, { rough: 0.2 }), h, { p: [-0.04, 0.1, 0.32], s: [0.065, 0.13, 0.03] });
  part(G.box, mat(0xfffbe6, { rough: 0.2 }), h, { p: [0.04, 0.1, 0.32], s: [0.065, 0.13, 0.03] });
  rig.jaw = group(h, [0, 0.12, 0.2]);
  part(G.sphere, muzzle, rig.jaw, { p: [0, -0.03, 0.04], s: [0.13, 0.06, 0.09] });
  for (const sx of [-1, 1]) part(G.sphereLo, fur, h, { p: [sx * 0.22, 0.52, -0.02], s: [0.08, 0.08, 0.05] });
  eyes(h, rig, { color: 0x7cff3a, x: 0.12, y: 0.4, z: 0.24, r: 0.075 });
  // hard hat: he builds things (out of your arcade machines)
  part(G.sphere, mat(0xf2c230, { rough: 0.3 }), h, { p: [0, 0.5, -0.01], s: [0.3, 0.17, 0.3] });
  part(G.cyl, mat(0xf2c230, { rough: 0.3 }), h, { p: [0, 0.48, 0.06], s: [0.34, 0.025, 0.36] });
  // flat paddle tail with a cross-hatch
  part(G.box, mat(0x4a3020, { rough: 0.7 }), rig.hips, { p: [0, -0.3, -0.48], s: [0.36, 0.06, 0.6], r: [0.35, 0, 0] });
  return rig;
}

// ── Cranker the Penguin ─────────────────────────────────────────────────

function buildCranker() {
  const black = mat(0x1d2230, { rough: 0.3 }), white = mat(0xf2f4f7, { rough: 0.3 }), orange = mat(0xff9a1f);
  const rig = biped({
    height: 1.72, legLen: 0.32, hipW: 0.16, legR: 0.07, legMat: orange, footMat: orange,
    footW: 0.15, footL: 0.3,
    torsoH: 0.95, torsoW: 0.76, torsoD: 0.68, bodyMat: black, bellyMat: white,
    headR: 0.28, armLen: 0.55, armR: 0.06, handMat: black, handR: 0.06,
    swing: 0.3,
  });
  rig.radius = 0.42;
  // flippers instead of arms
  for (const arm of [rig.armL, rig.armR]) {
    part(G.sphere, black, arm, { p: [0, -0.3, 0], s: [0.06, 0.32, 0.15] });
  }
  const h = rig.head;
  part(G.sphere, white, h, { p: [0, 0.3, 0.13], s: [0.21, 0.18, 0.18] });               // face patch
  part(G.cone, orange, h, { p: [0, 0.27, 0.36], s: [0.07, 0.18, 0.05], r: [Math.PI / 2, 0, 0] });
  rig.jaw = group(h, [0, 0.21, 0.28]);
  part(G.cone, mat(0xe0801a), rig.jaw, { p: [0, 0, 0.07], s: [0.06, 0.13, 0.03], r: [Math.PI / 2, 0, 0] });
  eyes(h, rig, { color: 0x6fe3ff, x: 0.1, y: 0.38, z: 0.24, r: 0.07 });
  // ice-blue scarf: he's cold all the time
  part(G.torus, mat(0x3fb8ff), rig.neck, { p: [0, -0.02, 0], s: [0.24, 0.24, 0.4], r: [Math.PI / 2, 0, 0] });
  part(G.box, mat(0x3fb8ff), rig.neck, { p: [0.12, -0.24, 0.28], s: [0.1, 0.32, 0.04], r: [0.1, 0, 0.2] });
  return rig;
}

// ── Flipper the Dolphin ─────────────────────────────────────────────────

function buildFlipper() {
  const blue = mat(0x5b8fc4, { rough: 0.25 }), belly = mat(0xd9e8f5, { rough: 0.25 });
  const rig = biped({
    height: 2.1, legLen: 0.7, hipW: 0.17, legR: 0.09, legMat: belly, footMat: blue,
    torsoH: 0.9, torsoW: 0.8, torsoD: 0.7, bodyMat: blue, bellyMat: belly,
    headR: 0.3, headSZ: 1.2, armLen: 0.55, armR: 0.07, handMat: blue,
    swing: 0.5,
  });
  for (const arm of [rig.armL, rig.armR]) {
    part(G.sphere, blue, arm, { p: [0, -0.35, 0], s: [0.07, 0.3, 0.17], r: [0, 0, 0.1] });
  }
  const h = rig.head;
  // the rostrum (snout) and its lower half
  part(G.cyl, belly, h, { p: [0, 0.22, 0.42], s: [0.09, 0.3, 0.07], r: [Math.PI / 2, 0, 0] });
  rig.jaw = group(h, [0, 0.17, 0.3]);
  part(G.cyl, mat(0xc4d8ea, { rough: 0.25 }), rig.jaw, { p: [0, -0.02, 0.12], s: [0.075, 0.26, 0.04], r: [Math.PI / 2, 0, 0] });
  part(G.cone, blue, h, { p: [0, 0.66, -0.12], s: [0.05, 0.3, 0.2], r: [-0.45, 0, 0] });   // dorsal fin
  eyes(h, rig, { color: 0xff5ad1, x: 0.17, y: 0.36, z: 0.2, r: 0.07 });
  // lifeguard sunglasses pushed up on the head
  for (const sx of [-1, 1]) part(G.cyl, mat(0x111111, { rough: 0.1 }), h, { p: [sx * 0.12, 0.58, 0.18], s: [0.08, 0.02, 0.08], r: [1.1, 0, 0] });
  // tail fluke behind
  part(G.sphere, blue, rig.hips, { p: [0, -0.3, -0.45], s: [0.38, 0.05, 0.16], r: [0.3, 0, 0] });
  return rig;
}

// ── The Junk Monster ────────────────────────────────────────────────────
//
// On Night 21 the junk pile pulls all five of them in and spits out one thing: Gerald's body
// and arm, Gus's head in the middle with Chomper's and Cranker's on its shoulders, Flipper's
// face in its belly, a flipper for a right arm, two different legs, and junk and wires
// holding it all together.

// Build one of the five and take just its head.
function takeHead(build, scale, p, r = [0, 0, 0]) {
  const src = build();
  const h = src.head;
  h.parent.remove(h);
  h.position.set(p[0], p[1], p[2]);
  h.rotation.set(r[0], r[1], r[2]);
  h.scale.setScalar(scale);
  return src;
}

function buildJunk() {
  const fur = mat(0x3a3a44, { rough: 0.6 }), tan = mat(0x9b8f86, { rough: 0.5 });
  const rust = mat(0x7a4b2a, { rough: 0.8, metal: 0.4 });
  const steel = METAL();
  const root = new THREE.Group();
  const rig = { root, height: 3.8, radius: 0.9, swing: 0.35 };
  rig.hips = group(root, [0, 1.15, 0]);
  rig.legL = group(rig.hips, [-0.4, 0, 0]);
  rig.legR = group(rig.hips, [0.4, 0, 0]);
  // a gorilla leg and a penguin leg
  limb(rig.legL, 1.15, 0.2, fur, { foot: (g, len) => part(G.sphereLo, tan, g, { p: [0, -len + 0.06, 0.12], s: [0.24, 0.1, 0.36] }) });
  limb(rig.legR, 1.15, 0.13, mat(0x1d2230, { rough: 0.3 }), { foot: (g, len) => part(G.sphereLo, mat(0xff9a1f), g, { p: [0, -len + 0.06, 0.14], s: [0.2, 0.09, 0.4] }) });

  rig.torso = group(rig.hips, [0, 0, 0]);
  rig.skull = part(G.sphere, fur, rig.torso, { p: [0, 0.95, 0], s: [0.95, 1.0, 0.7] });       // Gerald's body
  part(G.sphere, tan, rig.torso, { p: [0, 0.95, 0.35], s: [0.6, 0.7, 0.38] });
  part(G.cylTaper, mat(0xc0262d), rig.torso, { p: [0, 1.25, 0], s: [0.85, 0.5, 0.66] });      // his vest, torn
  const tie = group(rig.torso, [0, 1.62, 0.55]);                                             // Gus's bow tie
  part(G.cone, mat(0xf2c230, { metal: 0.5, rough: 0.3 }), tie, { p: [-0.1, 0, 0], s: [0.08, 0.16, 0.08], r: [0, 0, Math.PI / 2] });
  part(G.cone, mat(0xf2c230, { metal: 0.5, rough: 0.3 }), tie, { p: [0.1, 0, 0], s: [0.08, 0.16, 0.08], r: [0, 0, -Math.PI / 2] });
  part(G.cone, mat(0x5b8fc4, { rough: 0.25 }), rig.torso, { p: [0, 1.6, -0.6], s: [0.08, 0.5, 0.35], r: [-0.6, 0, 0] });   // Flipper's fin
  part(G.box, mat(0x4a3020, { rough: 0.7 }), rig.hips, { p: [0.25, -0.1, -0.6], s: [0.4, 0.06, 0.7], r: [0.4, 0.3, 0] }); // Chomper's tail
  part(G.sphere, mat(0x5a341d), rig.hips, { p: [-0.25, -0.1, -0.6], s: [0.32, 0.07, 0.45], r: [0.5, -0.3, 0] });          // Gus's tail
  for (const [x, y, z, sx, sy, sz, rz] of [[0.6, 0.4, 0.3, 0.35, 0.3, 0.3, 0.6], [-0.65, 1.3, 0.2, 0.3, 0.35, 0.3, -0.4], [0.4, 1.55, -0.3, 0.4, 0.25, 0.3, 0.2]]) {
    part(G.box, rust, rig.torso, { p: [x, y, z], s: [sx, sy, sz], r: [0, rz, rz] });
  }
  rig.core = part(G.sphere, new THREE.MeshBasicMaterial({ color: 0xff3b30 }), rig.torso, { p: [0.5, 0.45, 0.45], s: [0.12, 0.12, 0.06] });

  // The heads. Gus in the middle (he's the leader, even now), and Flipper staring out of
  // the belly.
  const gus = takeHead(buildGus, 1.25, [0, 1.85, 0.05]);
  const chomper = takeHead(buildChomper, 1.15, [-0.78, 1.6, 0.05], [0, 0.35, 0.35]);
  const cranker = takeHead(buildCranker, 1.15, [0.78, 1.62, 0.05], [0, -0.35, -0.35]);
  const flipper = takeHead(buildFlipper, 0.95, [0, 0.55, 0.5], [0.15, 0, 0]);
  rig.neck = group(rig.torso, [0, 0, 0]);
  rig.neck.add(gus.head, chomper.head, cranker.head, flipper.head);
  rig.head = gus.head;
  rig.jaw = gus.jaw;
  rig.jawMax = 0.6;
  rig.eyeColor = new THREE.Color(0xff2a2a);
  rig.eyeMats = [gus, chomper, cranker, flipper].map((r) => r.eyeMat);
  rig.eyeMat = rig.eyeMats[0];
  for (const m of rig.eyeMats) m.color.copy(rig.eyeColor);

  // left arm: Gerald's. right arm: Flipper's flipper, with a claw-machine claw on the end.
  rig.armL = group(rig.torso, [-0.95, 1.5, 0]);
  rig.armR = group(rig.torso, [0.95, 1.5, 0]);
  limb(rig.armL, 1.5, 0.22, fur);
  part(G.sphereLo, tan, rig.armL, { p: [0, -1.55, 0.05], s: [0.26, 0.26, 0.26] });
  limb(rig.armR, 1.2, 0.1, mat(0x5b8fc4, { rough: 0.25 }));
  part(G.sphere, mat(0x5b8fc4, { rough: 0.25 }), rig.armR, { p: [0, -0.7, 0], s: [0.1, 0.6, 0.24] });
  for (const a of [-0.5, 0.5]) part(G.box, DARK_METAL(), rig.armR, { p: [Math.sin(a) * 0.12, -1.32, 0.05], s: [0.05, 0.3, 0.05], r: [0, 0, a] });

  // wires hanging out of it everywhere
  const wireColors = [0xff3b30, 0x2de2e6, 0xffd23f, 0x7cff3a];
  for (let i = 0; i < 9; i++) {
    part(G.cyl, mat(wireColors[i % 4]), rig.torso, {
      p: [(i / 8 - 0.5) * 1.3, 0.2 + (i % 3) * 0.45, 0.5], s: [0.015, 0.4 + (i % 3) * 0.15, 0.015], r: [0.2, 0, (i % 2 ? 1 : -1) * 0.3],
    });
  }
  rig.armBase = { L: [0, 0, 0.2], R: [0, 0, -0.2] };
  rig.hipY = 1.15;
  return rig;
}

const BUILDERS = { gus: buildGus, gerald: buildGerald, chomper: buildChomper, cranker: buildCranker, flipper: buildFlipper, junk: buildJunk };

// How far each face sticks out in front of its head (a platypus bill is long), so the
// jumpscare stops just short of it instead of putting the camera inside the bill.
const SNOUT = { gus: 0.85, flipper: 0.7, cranker: 0.5, gerald: 0.5, chomper: 0.45, junk: 1.1 };

// The old originals, retired to Parts & Service years ago: same shapes, faded and dusty,
// one eye gone dark.
const oldCache = new Map();
const DUST = new THREE.Color(0x8a8478);
function aged(m) {
  if (!m.isMeshStandardMaterial) return m;
  if (!oldCache.has(m)) {
    const c = m.color.clone().lerp(DUST, 0.45).multiplyScalar(0.8);
    oldCache.set(m, new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: Math.min(0.3, m.metalness) }));
  }
  return oldCache.get(m);
}

export function buildAnimatronic(id, { old = false } = {}) {
  const rig = BUILDERS[id]();
  rig.id = id;
  if (old) {
    rig.root.traverse((o) => { if (o.isMesh) o.material = aged(o.material); });
    rig.eyeColor.multiplyScalar(0.7);
    let dark = null;
    rig.root.traverse((o) => { if (o.isMesh && o.material === rig.eyeMat && o.position.x > 0) dark = o; });
    if (dark) dark.material = new THREE.MeshBasicMaterial({ color: 0x111111 });
    rig.root.scale.setScalar(0.96);
  }
  rig.root.updateMatrixWorld(true);
  const head = new THREE.Vector3();
  rig.head.getWorldPosition(head);
  rig.faceY = head.y + (id === 'junk' ? 0.42 : 0.38);
  rig.snout = SNOUT[id];
  rig.root.traverse((o) => { if (o.isMesh) o.userData.owner = id; });
  return rig;
}

// ── Posing ──────────────────────────────────────────────────────────────
//
// One function poses any rig. `pose` picks what it's doing; `t` is a running clock and
// `amt` how hard (walk speed, dance energy). Everything eases toward the target pose so
// state changes never snap.

const ease = (cur, target, k) => cur + (target - cur) * k;

export function poseRig(rig, pose, t, amt = 1, dt = 1 / 60) {
  const k = Math.min(1, dt * 10);
  const sw = rig.swing;
  let legL = 0, legR = 0, armLx = 0, armRx = 0, armLz = rig.armBase?.L[2] ?? 0.12, armRz = rig.armBase?.R[2] ?? -0.12;
  let torsoX = 0, headX = 0, headY = 0, headZ = 0, jaw = 0, bob = 0, hipDrop = 0;

  switch (pose) {
    case 'walk': {
      const s = Math.sin(t);
      legL = s * sw * amt; legR = -s * sw * amt;
      armLx = -s * sw * 0.8 * amt; armRx = s * sw * 0.8 * amt;
      bob = Math.abs(Math.cos(t)) * 0.05 * amt;
      torsoX = 0.06 * amt;
      headY = Math.sin(t * 0.5) * 0.08;
      break;
    }
    case 'chase': {
      const s = Math.sin(t);
      legL = s * sw * 1.3; legR = -s * sw * 1.3;
      armLx = -1.1 + s * 0.3; armRx = -1.1 - s * 0.3;      // arms out, reaching for you
      bob = Math.abs(Math.cos(t)) * 0.08;
      torsoX = 0.22;
      jaw = 0.25 + Math.sin(t * 3) * 0.1;
      break;
    }
    case 'idle':
      bob = Math.sin(t * 1.4) * 0.012;
      headY = Math.sin(t * 0.37) * 0.35 * amt;
      headX = Math.sin(t * 0.23) * 0.08;
      break;
    case 'stare':     // standing still, head locked on you
      headX = -0.05;
      break;
    case 'dance': {
      const b = Math.sin(t * 2);
      bob = Math.abs(b) * 0.1 * amt;
      armLx = -1.6 + Math.sin(t * 2) * 0.6 * amt; armRx = -1.6 - Math.sin(t * 2) * 0.6 * amt;
      armLz = 0.5; armRz = -0.5;
      headZ = Math.sin(t) * 0.25 * amt;
      headX = Math.sin(t * 2) * 0.1;
      jaw = Math.max(0, Math.sin(t * 4)) * 0.35;
      legL = Math.sin(t * 2) * 0.12; legR = -legL;
      break;
    }
    case 'down':
      torsoX = 0.75; headX = 0.8; headZ = 0.3;
      armLx = 0.3; armRx = 0.3; armLz = 0.25; armRz = -0.25;
      hipDrop = 0.25;
      jaw = 0.35;
      break;
    case 'limp':      // lying on its back, being dragged or in the junk pile
      headX = -0.5; headZ = 0.4;
      armLx = -2.6; armRx = -2.4; armLz = 0.6; armRz = -0.4;
      legL = 0.2; legR = -0.1;
      jaw = 0.4;
      break;
    case 'stagger':
      torsoX = -0.25 + Math.sin(t * 20) * 0.08;
      headX = -0.4; headZ = Math.sin(t * 17) * 0.3;
      armLz = 1.0; armRz = -1.0;
      jaw = 0.5;
      break;
    case 'scare': {
      const shake = Math.sin(t * 60) * 0.06;
      armLx = -2.2; armRx = -2.2; armLz = 0.9 + shake; armRz = -0.9 - shake;
      torsoX = 0.1; headX = -0.15 + shake; headZ = shake * 2;
      jaw = 1.0;
      break;
    }
    case 'cry': {            // standing in the balls, hands over face
      const sob = Math.sin(t * 9) * 0.04;
      armLx = -2.3; armRx = -2.3; armLz = 0.35; armRz = -0.35;
      headX = 0.4 + sob; torsoX = 0.2;
      hipDrop = 0.04;
      bob = sob * 0.5;
      break;
    }
    case 'hug':
      armLx = -1.5; armRx = -1.5; armLz = -0.35; armRz = 0.35;
      torsoX = 0.15; headX = 0.1;
      break;
    case 'wave': {
      bob = Math.sin(t * 1.4) * 0.012;
      armRx = -2.7; armRz = -0.5 + Math.sin(t * 6) * 0.35;
      headZ = 0.15;
      jaw = Math.max(0, Math.sin(t * 3)) * 0.2;
      break;
    }
    case 'throw': {
      armRx = -2.8 + amt * 3.4;
      torsoX = -0.2 + amt * 0.5;
      jaw = 0.6;
      break;
    }
    case 'swipe': {
      armLx = -1.5; armRx = -1.5; armLz = 1.2 - amt * 1.6; armRz = -1.2 + amt * 1.6;
      torsoX = 0.3; jaw = 0.8;
      break;
    }
  }

  rig.legL.rotation.x = ease(rig.legL.rotation.x, legL, k);
  rig.legR.rotation.x = ease(rig.legR.rotation.x, legR, k);
  rig.armL.rotation.x = ease(rig.armL.rotation.x, armLx, k);
  rig.armR.rotation.x = ease(rig.armR.rotation.x, armRx, k);
  rig.armL.rotation.z = ease(rig.armL.rotation.z, -armLz, k);
  rig.armR.rotation.z = ease(rig.armR.rotation.z, -armRz, k);
  rig.torso.rotation.x = ease(rig.torso.rotation.x, torsoX, k);
  rig.head.rotation.x = ease(rig.head.rotation.x, headX, k);
  rig.head.rotation.y = ease(rig.head.rotation.y, headY, k);
  rig.head.rotation.z = ease(rig.head.rotation.z, headZ + (rig.id === 'junk' ? 0.12 : 0), k);
  if (rig.jaw) rig.jaw.rotation.x = ease(rig.jaw.rotation.x, jaw * (rig.jawMax ?? 1), k * 1.5);
  rig.hips.position.y = ease(rig.hips.position.y, rig.hipY + bob - hipDrop, k);
}

// ── Kids ────────────────────────────────────────────────────────────────

const SHIRTS = [0xff5a5f, 0x3ec1d3, 0xffd23f, 0x7ad151, 0xa970ff, 0xff9a1f, 0xff7eb6, 0x2a4fa0];
const SKIN = [0xf1c7a5, 0xd9a07a, 0xa86b45, 0x6e4529, 0xf6d7bf];
const HAIR = [0x2b1a10, 0x6b3e1f, 0xd9b45a, 0x111111, 0xa0461d];

// A person: kids by day, and Jonathan and the manager in the cutscenes. Kids get big heads
// and random clothes; grown-ups are built from the same parts at adult proportions.
export function buildPerson({
  height: h, shirt, pants, skin, hair = null, cap = null, tie = null, badge = false, glasses = false,
  headScale = 0.075, shoulders = 0.2, shadows = false,
}) {
  const sm = mat(shirt), sk = mat(skin, { rough: 0.6 }), pm = mat(pants, { rough: 0.7 });
  const root = new THREE.Group();
  const legLen = h * (headScale > 0.09 ? 0.42 : 0.47);
  const rig = { root, height: h, radius: 0.25, swing: 0.6, hipY: legLen };
  rig.hips = group(root, [0, legLen, 0]);
  rig.legL = group(rig.hips, [-shoulders * 0.45, 0, 0]);
  rig.legR = group(rig.hips, [shoulders * 0.45, 0, 0]);
  for (const leg of [rig.legL, rig.legR]) {
    part(G.cyl, pm, leg, { p: [0, -legLen / 2, 0], s: [shoulders * 0.32, legLen, shoulders * 0.32] });
    part(G.box, mat(headScale > 0.09 ? 0xf4f1ea : 0x1a1a1a), leg, { p: [0, -legLen + 0.03, 0.04], s: [0.1, 0.06, 0.2] });
  }
  rig.torso = group(rig.hips, [0, 0, 0]);
  const th = h * 0.3;
  part(G.cyl, sm, rig.torso, { p: [0, th / 2, 0], s: [shoulders * 0.8, th, shoulders * 0.58] });
  if (tie !== null) part(G.box, mat(tie), rig.torso, { p: [0, th * 0.55, shoulders * 0.58], s: [0.05, th * 0.7, 0.02] });
  if (badge) part(G.box, mat(0xffd23f, { metal: 0.6, rough: 0.3 }), rig.torso, { p: [-shoulders * 0.35, th * 0.75, shoulders * 0.58], s: [0.06, 0.07, 0.02] });
  rig.neck = group(rig.torso, [0, th, 0]);
  rig.head = group(rig.neck, [0, 0.02, 0]);
  const hr = h * headScale;
  part(G.sphereLo, sk, rig.head, { p: [0, hr, 0], s: [hr, hr * 1.08, hr] });
  if (cap !== null) {
    part(G.sphereLo, mat(cap), rig.head, { p: [0, hr * 1.5, -0.01], s: [hr * 1.04, hr * 0.5, hr * 1.04] });
    part(G.cyl, mat(cap), rig.head, { p: [0, hr * 1.42, hr * 0.75], s: [hr * 0.8, 0.015, hr * 0.6] });
  } else if (hair !== null) {
    part(G.sphereLo, mat(hair, { rough: 0.8 }), rig.head, { p: [0, hr * 1.25, -0.02], s: [hr * 1.05, hr * 0.8, hr * 1.05] });
  }
  for (const sx of [-1, 1]) part(G.sphereLo, mat(0x111111), rig.head, { p: [sx * hr * 0.35, hr * 1.05, hr * 0.9], s: [0.015, 0.02, 0.01] });
  if (glasses) for (const sx of [-1, 1]) part(G.torus, mat(0x111111), rig.head, { p: [sx * hr * 0.38, hr * 1.05, hr * 0.95], s: [hr * 0.28, hr * 0.28, hr * 0.28] });
  rig.armL = group(rig.torso, [-(shoulders + 0.03), th * 0.9, 0]);
  rig.armR = group(rig.torso, [shoulders + 0.03, th * 0.9, 0]);
  for (const arm of [rig.armL, rig.armR]) {
    part(G.cyl, sm, arm, { p: [0, -th * 0.25, 0], s: [shoulders * 0.24, th * 0.5, shoulders * 0.24] });
    part(G.cyl, sk, arm, { p: [0, -th * 0.7, 0], s: [shoulders * 0.2, th * 0.45, shoulders * 0.2] });
  }
  rig.armBase = { L: [0, 0, 0.15], R: [0, 0, -0.15] };
  root.traverse((o) => { if (o.isMesh) o.castShadow = shadows && SHADOWS; });
  return rig;
}

export function buildKid(rand = Math.random) {
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const capped = rand() < 0.35;
  return buildPerson({
    height: 1.05 + rand() * 0.4, headScale: 0.11, shoulders: 0.15,
    shirt: pick(SHIRTS), skin: pick(SKIN), pants: pick([0x2a3a5a, 0x3a3a3a, 0x5a3a2a, 0x1f6f5a]),
    cap: capped ? pick(SHIRTS) : null, hair: capped ? null : pick(HAIR),
  });
}

// Jonathan, as other people see him: fifteen, in his security uniform and cap.
export const buildJonathan = () => buildPerson({
  height: 1.72, shirt: 0x2b4a7a, pants: 0x1f2533, skin: 0xd9a07a, cap: 0x1f3360, badge: true, shadows: true,
});

// Timmy, the kid who got left behind on Night 2, and his gramma.
export const buildTimmy = () => buildPerson({
  // a white shirt, so he stands out against the ball pit
  height: 1.15, headScale: 0.11, shoulders: 0.15, shirt: 0xf4f1ea, pants: 0x2a4a8a,
  skin: 0xf1c7a5, hair: 0x6b3e1f, shadows: true,
});

export const buildGramma = () => buildPerson({
  height: 1.6, shirt: 0x8a4a8a, pants: 0x5a5a6a, skin: 0xf1c7a5, hair: 0xe8e8e8, glasses: true,
  shoulders: 0.2, shadows: true,
});

export const buildManager = () => buildPerson({
  height: 1.82, shirt: 0xf4f1ea, pants: 0x2a2a2a, skin: 0xf1c7a5, hair: 0x8a8a8a, tie: 0xc0262d,
  glasses: true, shoulders: 0.23, shadows: true,
});

// ── Jonathan's hands ────────────────────────────────────────────────────
//
// Built at roughly life size in camera space: +X right, +Y up, -Z forward. The right hand
// holds the current weapon; the left always holds the flashlight.

const UNIFORM = 0x2b4a7a;

// Viewmodel materials glow faintly on their own, so Jonathan's hands are never lost in the
// dark — the flashlight points away from them.
const vmCache = new Map();
function vmMat(color, { rough = 0.6, metal = 0.1, glow = 0.22 } = {}) {
  const key = `${color}|${rough}|${metal}|${glow}`;
  if (!vmCache.has(key)) {
    vmCache.set(key, new THREE.MeshStandardMaterial({
      color, roughness: rough, metalness: metal, emissive: color, emissiveIntensity: glow,
    }));
  }
  return vmCache.get(key);
}

function hand(parent, x, y, z) {
  const g = group(parent, [x, y, z]);
  part(G.cyl, vmMat(UNIFORM, { rough: 0.8 }), g, { p: [0, -0.02, 0.15], s: [0.05, 0.28, 0.05], r: [Math.PI / 2 - 0.15, 0, 0] });
  part(G.box, vmMat(0xd9a07a, { rough: 0.7 }), g, { p: [0, 0, 0], s: [0.075, 0.065, 0.1] });
  return g;
}

export function buildViewmodel(weapon) {
  const root = new THREE.Group();
  const right = hand(root, 0.3, -0.33, -0.78);
  const vm = { root, right, left: null, lens: null, spark: null, muzzle: null, item: null };

  const item = group(right, [0, 0.03, -0.05]);
  vm.item = item;
  if (weapon === 'taser') {
    // Mostly black with a yellow stripe: a big yellow block read as a toy brick on screen.
    part(G.box, vmMat(0x23252b, { rough: 0.45 }), item, { p: [0, 0.03, -0.08], s: [0.05, 0.055, 0.17] });
    part(G.box, vmMat(0xf2c230, { rough: 0.35 }), item, { p: [0, 0.058, -0.08], s: [0.052, 0.008, 0.15] });
    part(G.box, vmMat(0x1a1a1a), item, { p: [0, -0.03, 0.0], s: [0.045, 0.09, 0.05], r: [0.2, 0, 0] });
    part(G.box, vmMat(0xf2c230, { rough: 0.35 }), item, { p: [0, 0.03, -0.17], s: [0.06, 0.04, 0.025] });
    for (const sx of [-1, 1]) part(G.cyl, vmMat(0x8a8f99, { metal: 0.7, rough: 0.35 }), item, { p: [sx * 0.018, 0.03, -0.195], s: [0.005, 0.03, 0.005], r: [Math.PI / 2, 0, 0] });
    vm.spark = part(G.sphereLo, new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.9 }), item,
      { p: [0, 0.03, -0.22], s: [0.03, 0.03, 0.03] });
    vm.spark.visible = false;
  } else if (weapon === 'baseball') {
    part(G.sphere, vmMat(0xf6f3ea, { rough: 0.6 }), item, { p: [0, 0.05, -0.06], s: [0.05, 0.05, 0.05] });
    part(G.torus, vmMat(0xd2262e), item, { p: [0, 0.05, -0.06], s: [0.045, 0.045, 0.06], r: [0, 0.6, 0] });
    vm.ballMesh = item;
  } else if (weapon === 'knife') {
    part(G.box, vmMat(0x2a2a2a), item, { p: [0, 0.0, -0.02], s: [0.03, 0.03, 0.11] });
    part(G.box, vmMat(0x8a8f99, { metal: 0.7, rough: 0.35 }), item, { p: [0, 0.0, -0.085], s: [0.06, 0.012, 0.012] });
    part(G.box, vmMat(0xd8dde3, { metal: 0.85, rough: 0.2 }), item, { p: [0, 0.008, -0.17], s: [0.008, 0.032, 0.16] });
  } else if (weapon === 'magnum') {
    const gun = vmMat(0x2a2c31, { metal: 0.7, rough: 0.3 });
    part(G.box, vmMat(0x6b3e1f, { rough: 0.6 }), item, { p: [0, -0.03, 0.01], s: [0.04, 0.1, 0.05], r: [0.25, 0, 0] });
    part(G.box, gun, item, { p: [0, 0.04, -0.05], s: [0.045, 0.06, 0.1] });
    part(G.cyl, gun, item, { p: [0, 0.045, -0.06], s: [0.032, 0.06, 0.032], r: [Math.PI / 2, 0, 0] });
    part(G.cyl, gun, item, { p: [0, 0.06, -0.19], s: [0.014, 0.2, 0.014], r: [Math.PI / 2, 0, 0] });
    part(G.box, gun, item, { p: [0, 0.08, -0.26], s: [0.006, 0.01, 0.01] });
    vm.muzzle = part(G.sphereLo, new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.95 }), item,
      { p: [0, 0.06, -0.31], s: [0.06, 0.06, 0.1] });
    vm.muzzle.visible = false;
  }

  vm.left = hand(root, -0.32, -0.35, -0.8);
  const torch = group(vm.left, [0, 0.03, -0.06]);
  part(G.cyl, vmMat(0x1a1a1a, { rough: 0.5 }), torch, { p: [0, 0, 0], s: [0.025, 0.2, 0.025], r: [Math.PI / 2, 0, 0] });
  part(G.cylTaper, vmMat(0x1a1a1a, { rough: 0.5 }), torch, { p: [0, 0, -0.12], s: [0.04, 0.05, 0.04], r: [-Math.PI / 2, 0, 0] });
  vm.lens = part(G.cyl, new THREE.MeshBasicMaterial({ color: 0xfff4c8 }), torch, { p: [0, 0, -0.146], s: [0.034, 0.005, 0.034], r: [Math.PI / 2, 0, 0] });

  root.scale.setScalar(0.62);
  root.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.renderOrder = 10; } });
  return vm;
}
