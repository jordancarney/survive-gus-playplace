// The people and animatronics of Sushi's Pizzaplex (the designer's fourth story), built from the
// same parts as everyone else (models.js):
//
//   Tom, 12, with his perm (and no hat — the designer took it off), and his friends Bob (11),
//   Billy (13) and Tim (9½), who snuck in with him on a dare
//   Sushi the penguin, the old Pizzaplex's star
//   Gerald the gorilla as a puppet: hanging from the ceiling on strings
//   Chomper in a roller-coaster cart, and Flipper in a go-kart
//   Peter in the very first Gus suit: an otter, with springlocks
//
// Every rig works with poseRig, and `finish` works out where its face is for the jumpscare.
import * as THREE from 'three';
import {
  buildPerson, buildAnimatronic, mat, fur, cloth, biped, part, group, eyes, addFur, MODEL_G as G, addKnees, tailRoot,
} from '../models.js';
import { buildHands } from '../plex/cast.js';
import { REALISTIC, GLOW } from '../config.js';

function finish(rig, id, snout = 0.5, person = false) {
  if (REALISTIC && !person) addFur(rig.root);
  rig.id = id;
  rig.root.updateMatrixWorld(true);
  const head = new THREE.Vector3();
  rig.head.getWorldPosition(head);
  rig.faceY = head.y + rig.headR;
  rig.snout = snout;
  rig.root.traverse((o) => { if (o.isMesh) o.userData.owner = id; });
  return rig;
}

// ── Tom and his friends ─────────────────────────────────────────────────
//
// Everyone's hair is different (the designer asked for that in Lost in the Pizzaplex, and it
// helps you tell them apart in the dark).

const kid = (o) => {
  const rig = buildPerson({ headScale: o.height < 1.3 ? 0.11 : 0.1, shoulders: 0.17, shadows: true, ...o });
  rig.headR = o.height * (o.height < 1.3 ? 0.11 : 0.1);
  addKnees(rig);
  return rig;
};

// Tom, 12: a dark-brown perm, an orange hoodie, jeans.
export const buildTom = () => kid({ height: 1.5, shirt: 0xe0701a, pants: 0x2a3a5a, skin: 0xe8b48a, hair: 0x3a2414, style: 'perm', eye: 0x4a2e1a });
// Bob, 11: spiky blond hair, a blue t-shirt.
export const buildBob = () => kid({ height: 1.44, shirt: 0x2a6ad8, pants: 0x3a3a3a, skin: 0xf1c7a5, hair: 0xe8c86a, style: 'spiky', eye: 0x2f5a8a });
// Billy, 13: the oldest, and it was his dare. Messy black hair and a grey hoodie.
export const buildBilly = () => kid({ height: 1.6, shirt: 0x6a6e78, pants: 0x1f2533, skin: 0x8a5a3a, hair: 0x111111, style: 'messy', eye: 0x2a1a10 });
// Tim, 9½: the youngest. Long-ish red hair and a green t-shirt.
export const buildTim = () => kid({ height: 1.32, shirt: 0x2f9a4a, pants: 0x2a4a8a, skin: 0xf6d7bf, hair: 0xc0501a, style: 'long', eye: 0x3a5a2a });

// What you see of yourself: orange hoodie sleeves, a flashlight, and a cheap Gus Watch.
export const tomHands = () => buildHands({ sleeve: 0xe0701a, skin: 0xe8b48a, scale: 0.76 });

// ── Sushi the penguin ───────────────────────────────────────────────────
//
// The old Pizzaplex's star (from the designer's drawing): a fat navy-black penguin with a white
// belly, an orange beak and feet, a red chef's headband with his name on it, and a pizza peel
// he carries like a paddle. His eyes are round and blue — until he sees you.

export function buildSushi() {
  const black = fur(REALISTIC ? 0x232838 : 0x161a26, { pile: 0.6 }), white = fur(0xe8e6de, { pile: 0.6 });
  const orange = mat(0xff8a1a, { rough: 0.4 });
  const rig = biped({
    height: 1.95, legLen: 0.34, hipW: 0.18, legR: 0.08, legMat: orange, footMat: orange,
    footW: 0.18, footL: 0.34,
    torsoH: 1.08, torsoW: 0.92, torsoD: 0.82, bodyMat: black, bellyMat: white,
    headR: 0.31, armLen: 0.6, armR: 0.065, handMat: black, handR: 0.07,
    swing: 0.32,
  });
  rig.radius = 0.48;
  for (const arm of [rig.armL, rig.armR]) part(G.sphere, black, arm, { p: [0, -0.32, 0], s: [0.07, 0.36, 0.17] });
  const h = rig.head;
  part(G.sphere, white, h, { p: [0, 0.3, 0.14], s: [0.23, 0.2, 0.2] });            // face patch
  part(G.cone, orange, h, { p: [0, 0.27, 0.4], s: [0.09, 0.22, 0.06], r: [Math.PI / 2, 0, 0] });
  rig.jaw = group(h, [0, 0.2, 0.3]);
  part(G.cone, mat(0xe06a10), rig.jaw, { p: [0, 0, 0.08], s: [0.075, 0.16, 0.035], r: [Math.PI / 2, 0, 0] });
  eyes(h, rig, { color: 0x3a9aff, x: 0.11, y: 0.4, z: 0.25, r: 0.08 });
  // the red headband, knotted at the back, with a white SUSHI patch on the front
  part(G.torus, cloth(0xc0102a), h, { p: [0, 0.52, 0], s: [0.31, 0.31, 0.35], r: [Math.PI / 2, 0, 0] });
  part(G.box, mat(0xf4f1ea, { rough: 0.6 }), h, { p: [0, 0.53, 0.3], s: [0.16, 0.06, 0.02] });
  for (const sx of [-1, 1]) part(G.box, cloth(0xc0102a), h, { p: [sx * 0.06, 0.44, -0.33], s: [0.05, 0.2, 0.02], r: [0.3, 0, sx * 0.4] });
  // a little bow tie, and the pizza peel in his right flipper
  part(G.sphereLo, cloth(0xc0102a), rig.neck, { p: [0, -0.05, 0.36], s: [0.1, 0.05, 0.03] });
  const peel = group(rig.armR, [0, -0.62, 0.08]);
  part(G.cyl, mat(0x8a5a32, { rough: 0.7 }), peel, { p: [0, 0.1, 0], s: [0.022, 0.8, 0.022] });
  part(G.cyl, mat(0xb88a52, { rough: 0.7 }), peel, { p: [0, 0.6, 0], s: [0.2, 0.02, 0.24], r: [Math.PI / 2, 0, 0] });
  rig.headR = 0.31;
  return finish(rig, 'sushi', 0.62);
}

// ── Gerald the puppet ───────────────────────────────────────────────────
//
// In his daycare Gerald hangs from the ceiling like a marionette (the designer's call): long
// strings from his wrists, his head and his knees up into the dark, where somebody else is
// pulling them. His feet dangle. `rig.strings` are the strings, `setStrings(rig, len)` makes
// them reach the ceiling, and `cutStrings` lets them fall once he's good.

export function buildPuppetGerald() {
  const rig = buildAnimatronic('gerald');
  rig.root.scale.setScalar(0.86);
  // patched with mismatched fabric: a daycare's well-loved puppet
  const patch = cloth(0x5a3a7a);
  part(G.box, patch, rig.torso, { p: [0.3, 0.55, 0.42], s: [0.2, 0.2, 0.04], r: [0, 0.3, 0.2] });
  part(G.box, cloth(0x3a7a5a), rig.legL, { p: [0, -0.35, 0.13], s: [0.15, 0.15, 0.03] });
  // a big bib with a smiley sun on it (he's the daycare's), over his drummer's vest
  part(G.sphere, cloth(0xffd23f), rig.torso, { p: [0, 0.55, 0.36], s: [0.32, 0.3, 0.08] });
  // the strings: white, thin, glowing faintly so you can see them in the dark
  const string = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xe8e4d8).multiplyScalar(Math.max(1, GLOW * 0.2)) });
  rig.strings = [];
  const tie = (parent, p) => {
    const s = part(G.cyl, string, parent, { p: [p[0], p[1], p[2]], s: [0.008, 1, 0.008] });
    s.castShadow = false;
    s.userData.base = new THREE.Vector3(...p);
    rig.strings.push(s);
  };
  tie(rig.armL, [0, -1.18, 0]);
  tie(rig.armR, [0, -1.18, 0]);
  tie(rig.head, [0, 0.62, 0]);
  tie(rig.legL, [0, -0.36, 0.1]);
  tie(rig.legR, [0, -0.36, 0.1]);
  // the control bar's shadow, way up top (moved with the strings)
  rig.bar = part(G.box, mat(0x3a2a1a, { rough: 0.8 }), rig.root, { p: [0, 4, 0], s: [1.4, 0.06, 0.06] });
  rig.headR = 0.32 * 0.86;
  rig.faceY = (rig.faceY || 2.3) * 0.86;
  rig.id = 'gerald';
  return rig;
}

// Every frame: each string runs straight up from where it's tied to `top` (world height).
const _w = new THREE.Vector3(), _q = new THREE.Quaternion(), _up = new THREE.Vector3(0, 1, 0);
export function setStrings(rig, top) {
  rig.root.updateMatrixWorld(true);
  for (const s of rig.strings) {
    if (!s.visible) continue;
    s.parent.updateMatrixWorld(true);
    s.position.copy(s.userData.base);
    s.getWorldPosition(_w);
    const len = Math.max(0.1, top - _w.y);
    // point the string straight up in world space, whatever its limb is doing
    s.parent.getWorldQuaternion(_q).invert();
    s.quaternion.setFromUnitVectors(_up, _up.clone().applyQuaternion(_q));
    const sc = s.parent.getWorldScale(new THREE.Vector3()).y || 1;
    s.scale.set(0.008, len / sc, 0.008);
    // the cylinder's centre is halfway up
    const half = _up.clone().applyQuaternion(_q).multiplyScalar(len / 2 / sc);
    s.position.add(half);
  }
  const rs = rig.root.scale.y || 1;
  rig.bar.position.set(0, (top - rig.root.position.y) / rs, 0);
}

export function cutStrings(rig, on = true) {
  for (const s of rig.strings) s.visible = !on;
  rig.bar.visible = !on;
}

// ── The riders ──────────────────────────────────────────────────────────
//
// Chomper in a runaway roller-coaster cart, and Flipper in a go-kart (the designer's calls).
// The cart goes on the rig's root, so it comes along for the jumpscare.

function sitDown(rig, lean = 0) {
  rig.seated = true;
  rig.lean = lean;
}

// Once posed, a rider's legs go out in front and its hands grip the bar.
export function seat(rig) {
  if (!rig.seated) return;
  rig.legL.rotation.x = rig.legR.rotation.x = -1.45;
  rig.armL.rotation.x = rig.armR.rotation.x = -1.1;
  rig.torso.rotation.x = rig.lean;
}

export function buildCoasterChomper() {
  const rig = buildAnimatronic('chomper');
  const cart = group(rig.root, [0, 0, 0]);
  const red = mat(0xc0262d, { rough: 0.35, metal: 0.25 }), steel = mat(0x8a9098, { metal: 0.7, rough: 0.3 });
  part(G.box, red, cart, { p: [0, 0.42, 0], s: [1.05, 0.55, 1.6] });
  part(G.box, mat(0x1a1a1e, { rough: 0.6 }), cart, { p: [0, 0.68, 0.05], s: [0.9, 0.08, 1.1] });   // the seat
  part(G.box, red, cart, { p: [0, 0.95, -0.72], s: [1.05, 0.6, 0.12] });                            // seat back
  part(G.cyl, mat(0xffd23f, { rough: 0.3, metal: 0.5 }), cart, { p: [0, 1.0, 0.35], s: [0.03, 0.9, 0.03], r: [0, 0, Math.PI / 2] }); // lap bar
  for (const [x, z] of [[-0.48, -0.6], [0.48, -0.6], [-0.48, 0.6], [0.48, 0.6]]) {
    part(G.cyl, steel, cart, { p: [x, 0.14, z], s: [0.14, 0.08, 0.14], r: [0, 0, Math.PI / 2] });
  }
  // a big number and a grin painted on the nose
  part(G.box, mat(0xffd23f, { rough: 0.4 }), cart, { p: [0, 0.5, 0.81], s: [0.6, 0.18, 0.01] });
  rig.hipY = rig.hips.position.y = 0.72;   // (poseRig holds the hips at hipY)
  rig.hips.position.z = -0.15;
  sitDown(rig, 0.1);
  rig.cart = cart;
  rig.radius = 0.7;
  rig.root.updateMatrixWorld(true);
  const head = new THREE.Vector3();
  rig.head.getWorldPosition(head);
  rig.faceY = head.y + 0.38;
  return rig;
}

export function buildKartFlipper() {
  const rig = buildAnimatronic('flipper');
  const kart = group(rig.root, [0, 0, 0]);
  const body = mat(0x2de2e6, { rough: 0.3, metal: 0.2 }), tyre = mat(0x111114, { rough: 0.8 });
  part(G.box, body, kart, { p: [0, 0.28, 0.1], s: [1.1, 0.26, 1.9] });
  part(G.box, body, kart, { p: [0, 0.42, 0.85], s: [0.7, 0.16, 0.5], r: [0.3, 0, 0] });      // nose
  part(G.box, mat(0x1a1a1e), kart, { p: [0, 0.55, -0.35], s: [0.75, 0.5, 0.1] });            // seat back
  part(G.box, mat(0xff3fa4, { rough: 0.4 }), kart, { p: [0, 0.3, -0.95], s: [1.3, 0.12, 0.2] }); // bumper
  part(G.torus, mat(0x222228), kart, { p: [0, 0.95, 0.4], s: [0.16, 0.16, 0.16], r: [0.9, 0, 0] }); // steering wheel
  for (const [x, z] of [[-0.62, -0.62], [0.62, -0.62], [-0.62, 0.68], [0.62, 0.68]]) {
    part(G.cyl, tyre, kart, { p: [x, 0.2, z], s: [0.22, 0.2, 0.22], r: [0, 0, Math.PI / 2] });
  }
  part(G.box, mat(0xf4f1ea), kart, { p: [0, 0.42, 1.06], s: [0.3, 0.12, 0.01] });             // number plate
  rig.hipY = rig.hips.position.y = 0.45;
  rig.hips.position.z = -0.1;
  rig.root.scale.setScalar(0.92);
  sitDown(rig, -0.15);
  rig.cart = kart;
  rig.radius = 0.7;
  rig.root.updateMatrixWorld(true);
  const head = new THREE.Vector3();
  rig.head.getWorldPosition(head);
  rig.faceY = head.y + 0.38;
  return rig;
}

export const buildMoony = () => buildAnimatronic('moony');

// ── Peter ───────────────────────────────────────────────────────────────
//
// Peter is 27, and he's wearing the very first Gus: an otter, from before Gus was a platypus
// (the designer's call), and a springlock suit — half costume, half robot, with spring latches
// that fold the robot parts out of the way so a person fits inside. Long since gone dull:
// brown fur gone patchy, a cream muzzle and chest, small round ears, whiskers of bent wire, a
// long thick tail, webbed paddle feet, a faded purple bow tie and the old gold sash that says
// GUS. Brass springlock latches at every joint, and they click when he moves. His eyes are a
// tired amber, and behind the mesh of the open mouth there's only dark.

export function buildPeter() {
  const brown = fur(0x5a3e2a), cream = fur(0xcfb48a, { pile: 0.7 }), dark = fur(0x3a281c, { pile: 0.8 });
  const brass = mat(0xb08a3a, { metal: 0.8, rough: 0.35 });
  const rig = biped({
    height: 2.05, legLen: 0.66, hipW: 0.16, legR: 0.085, legMat: brown, footMat: dark,
    footW: 0.2, footL: 0.36,
    torsoH: 0.86, torsoW: 0.66, torsoD: 0.54, bodyMat: brown, bellyMat: cream,
    headR: 0.27, headSZ: 1.15, armLen: 0.68, armR: 0.07, handMat: dark, handR: 0.085,
    swing: 0.5,
  });
  rig.radius = 0.4;
  const h = rig.head;
  // a broad flat otter's muzzle, a big dark nose, wire whiskers
  part(G.sphere, cream, h, { p: [0, 0.2, 0.25], s: [0.2, 0.13, 0.16] });
  part(G.sphereLo, mat(0x1a1210, { rough: 0.3 }), h, { p: [0, 0.27, 0.4], s: [0.07, 0.05, 0.04] });
  for (const sx of [-1, 1]) for (const k of [0, 1, 2]) {
    part(G.cyl, mat(0xd8d0c0, { metal: 0.6 }), h, { p: [sx * 0.22, 0.2 - k * 0.025, 0.32], s: [0.004, 0.22, 0.004], r: [0, 0, sx * (1.35 + k * 0.12)] });
  }
  // the open jaw: dark mesh inside (that's where the person is), and old flat teeth
  rig.jaw = group(h, [0, 0.1, 0.22]);
  part(G.sphere, cream, rig.jaw, { p: [0, -0.04, 0.06], s: [0.17, 0.06, 0.12] });
  part(G.sphereLo, mat(0x050505, { rough: 1 }), h, { p: [0, 0.12, 0.27], s: [0.13, 0.05, 0.06] });
  for (const sx of [-1, 1]) part(G.box, mat(0xd8cfb0, { rough: 0.4 }), h, { p: [sx * 0.05, 0.13, 0.36], s: [0.05, 0.05, 0.02] });
  eyes(h, rig, { color: 0xffb02a, x: 0.12, y: 0.37, z: 0.24, r: 0.065 });
  // small round ears
  for (const sx of [-1, 1]) {
    part(G.sphere, brown, h, { p: [sx * 0.21, 0.5, -0.05], s: [0.07, 0.07, 0.04] });
    part(G.sphere, dark, h, { p: [sx * 0.21, 0.5, -0.02], s: [0.04, 0.04, 0.02] });
  }
  // a faded purple bow tie, and the old gold sash: GUS
  part(G.sphereLo, cloth(0x5b3a6e), rig.neck, { p: [-0.07, -0.06, 0.28], s: [0.08, 0.05, 0.03] });
  part(G.sphereLo, cloth(0x5b3a6e), rig.neck, { p: [0.07, -0.06, 0.28], s: [0.08, 0.05, 0.03] });
  part(G.box, cloth(0xb8902a), rig.torso, { p: [0, 0.5, 0.05], s: [0.1, 1.0, 0.6], r: [0, 0, 0.75] });
  // brass springlock latches at the joints: shoulders, elbows-ish, hips, knees, neck
  const latch = (parent, p) => {
    part(G.box, brass, parent, { p, s: [0.07, 0.05, 0.03] });
    part(G.cyl, brass, parent, { p: [p[0], p[1] + 0.035, p[2]], s: [0.012, 0.04, 0.012] });
  };
  for (const arm of [rig.armL, rig.armR]) { latch(arm, [0, -0.05, 0.08]); latch(arm, [0, -0.35, 0.08]); }
  for (const leg of [rig.legL, rig.legR]) { latch(leg, [0, -0.05, 0.1]); latch(leg, [0, -0.34, 0.1]); }
  latch(rig.neck, [0.12, 0, 0.12]);
  latch(rig.neck, [-0.12, 0, 0.12]);
  // the long thick tail, tapering, out of the small of his back (tailRoot) and down
  const tail = tailRoot(rig);
  for (let i = 0; i < 6; i++) {
    part(G.sphere, i < 3 ? brown : dark, tail, { p: [0, -0.03 - i * 0.075, 0.04 - i * 0.13], s: [0.13 - i * 0.015, 0.11 - i * 0.012, 0.16], r: [-0.5, 0, 0] });
  }
  // webbed paddle feet
  for (const leg of [rig.legL, rig.legR]) part(G.box, dark, leg, { p: [0, -0.64, 0.14], s: [0.2, 0.03, 0.2] });
  rig.headR = 0.27;
  return finish(rig, 'peter', 0.5);
}
