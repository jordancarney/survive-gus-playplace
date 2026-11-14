// The people and animatronics of Lost in the Pizzaplex, built from the same parts as everyone
// else (models.js): the four kids and Jackson the night guard, who each get a chapter of
// their own; DJ Rocco, the Pizzaplex's new raccoon DJ; tiny Gus plushies for Max's bed; and
// the hands you see on screen, a different pair for each of them.
//
// Every rig works with poseRig, and `finish` works out where its face is for the jumpscare.
import * as THREE from 'three';
import {
  buildPerson, buildAnimatronic, mat, fur, cloth, biped, part, group, eyes, addFur, MODEL_G as G, vmMat,
} from '../models.js';
import { buildBabyGus } from '../escape/cast.js';
import { REALISTIC, GLOW } from '../config.js';

function finish(rig, id, snout = 0.5, person = false) {
  if (REALISTIC && !person) addFur(rig.root);
  rig.id = id;
  rig.root.updateMatrixWorld(true);
  const head = new THREE.Vector3();
  rig.head.getWorldPosition(head);
  rig.faceY = head.y + rig.headR;
  rig.snout = snout;
  return rig;
}

// ── The five of them ────────────────────────────────────────────────────
//
// Kid heights and the clothes they came to the sleepover in. (Their eye heights and speeds,
// when you're playing them, are in heroes.js.)

const kid = (o) => {
  const rig = buildPerson({ headScale: o.height < 1.3 ? 0.11 : 0.1, shoulders: 0.16, shadows: true, ...o });
  rig.headR = o.height * (o.height < 1.3 ? 0.11 : 0.1);
  return rig;
};

// Jonathan at nine: a blue hoodie, and his dark hair in a perm (the designer's call).
export const buildJonathan9 = () => kid({ height: 1.34, shirt: 0x2a5ab8, pants: 0x2a3a5a, skin: 0xd9a07a, hair: 0x3a2414, style: 'perm' });
// Max, eleven: the oldest kid. A girl, with long red hair (the designer's call) and a purple
// t-shirt.
export const buildMax = () => kid({ height: 1.46, shirt: 0x7a3ab8, pants: 0x2b2b33, skin: 0xf1c7a5, hair: 0xb8401a, style: 'long', eye: 0x3a6a9a });
// Jack, ten: still in red, still with the messy sandy hair he had at five.
export const buildJack10 = () => kid({ height: 1.4, shirt: 0xc0262d, pants: 0x3a3a3a, skin: 0xf1c7a5, hair: 0xb8843a, style: 'messy' });
// Thomas, seven: the littlest. Spiky brown hair, green eyes and a baggy green sweatshirt (the
// designer's call).
export const buildThomas = () => kid({ height: 1.2, shirt: 0x2f7a3a, pants: 0x2a4a8a, skin: 0xf6d7bf, hair: 0x5a3a22, style: 'spiky', eye: 0x3aa04a, baggy: true });

// Jackson, 22, the Pizzaplex's brand-new night guard: purple Pizzaplex security shirt, cap,
// a gold badge, and short locs under the cap.
export function buildJackson() {
  const rig = buildPerson({
    height: 1.84, shirt: 0x4a2a7a, pants: 0x1f2533, skin: 0x6e4529, cap: 0x2a1a4a, hair: 0x111111, badge: true,
    shoulders: 0.22, shadows: true, style: 'locs',
  });
  rig.headR = 1.84 * 0.075;
  return rig;
}

// The other kids at the sleepover, for the intro.
export { buildKid } from '../models.js';

// ── DJ Rocco ────────────────────────────────────────────────────────────
//
// The Pizzaplex's new star, made up for the first build (the designer can change him): a
// grey raccoon DJ with a black mask, a ringed tail, neon-pink headphones and purple eyes
// that glow through the dark. He's quick and quiet — raccoons sneak.

export function buildRocco() {
  const grey = fur(0x8a8a92), pale = fur(0xd8d8dc, { pile: 0.7 }), black = fur(0x1d1d22, { pile: 0.7 });
  const rig = biped({
    height: 1.9, legLen: 0.62, hipW: 0.17, legR: 0.08, legMat: grey, footMat: black,
    torsoH: 0.72, torsoW: 0.7, torsoD: 0.56, bodyMat: grey, bellyMat: pale,
    headR: 0.29, armLen: 0.55, armR: 0.065, handMat: black, handR: 0.075,
    swing: 0.65,
  });
  rig.radius = 0.38;
  const h = rig.head;
  // the pointed snout, pale, with a black nose
  part(G.cone, pale, h, { p: [0, 0.22, 0.32], s: [0.13, 0.26, 0.11], r: [Math.PI / 2, 0, 0] });
  part(G.sphereLo, mat(0x111111, { rough: 0.3 }), h, { p: [0, 0.24, 0.46], s: [0.05, 0.04, 0.04] });
  rig.jaw = group(h, [0, 0.14, 0.24]);
  part(G.sphere, pale, rig.jaw, { p: [0, -0.02, 0.06], s: [0.1, 0.04, 0.12] });
  // white cheeks, and the black bandit mask across the eyes
  for (const sx of [-1, 1]) part(G.sphere, pale, h, { p: [sx * 0.17, 0.2, 0.15], s: [0.12, 0.1, 0.1] });
  part(G.sphere, black, h, { p: [0, 0.37, 0.18], s: [0.29, 0.09, 0.16] });
  eyes(h, rig, { color: 0xc040ff, x: 0.11, y: 0.37, z: 0.27, r: 0.065 });
  // big pointy ears
  for (const sx of [-1, 1]) {
    part(G.cone, grey, h, { p: [sx * 0.19, 0.58, -0.02], s: [0.09, 0.17, 0.05], r: [0, 0, -sx * 0.35] });
    part(G.cone, black, h, { p: [sx * 0.19, 0.57, 0.01], s: [0.05, 0.11, 0.02], r: [0, 0, -sx * 0.35] });
  }
  // neon headphones, round over the top
  const neon = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff3fa4).multiplyScalar(Math.max(1, GLOW * 0.5)) });
  part(G.torus, mat(0x222228, { metal: 0.4, rough: 0.3 }), h, { p: [0, 0.34, -0.02], s: [0.31, 0.31, 0.2], r: [0, Math.PI / 2, 0] });
  for (const sx of [-1, 1]) {
    part(G.cyl, mat(0x222228, { metal: 0.4, rough: 0.3 }), h, { p: [sx * 0.3, 0.32, 0], s: [0.1, 0.07, 0.1], r: [0, 0, Math.PI / 2] });
    part(G.cyl, neon, h, { p: [sx * 0.34, 0.32, 0], s: [0.075, 0.01, 0.075], r: [0, 0, Math.PI / 2] });
  }
  // a glowing record on a chain, and his ringed tail
  part(G.cyl, mat(0x111111, { rough: 0.2 }), rig.torso, { p: [0, 0.48, 0.3], s: [0.13, 0.015, 0.13], r: [Math.PI / 2, 0, 0] });
  part(G.cyl, neon, rig.torso, { p: [0, 0.48, 0.31], s: [0.04, 0.016, 0.04], r: [Math.PI / 2, 0, 0] });
  for (let i = 0; i < 6; i++) {
    part(G.sphere, i % 2 ? black : grey, rig.hips, { p: [0, -0.05 - i * 0.07, -0.42 - i * 0.13], s: [0.12 - i * 0.008, 0.12 - i * 0.008, 0.1], r: [0.5, 0, 0] });
  }
  rig.headR = 0.29;
  rig.root.traverse((o) => { if (o.isMesh) o.userData.owner = 'rocco'; });
  return finish(rig, 'rocco', 0.6);
}

// ── Sparky ──────────────────────────────────────────────────────────────
//
// The Pizzaplex's other new animatronic (made up for this build, like DJ Rocco): a robot
// dog, the mascot of the Fun Zone's kart track. Shiny blue-and-white plastic, floppy black
// ears, a lightning-bolt tag on his collar and a lightning-bolt tail, cyan eyes. He's the
// fastest thing in the Pizzaplex and he can't sit still.

export function buildSparky() {
  const shell = mat(0x3a6ad8, { rough: 0.3, metal: 0.15 }), white = mat(0xeef2f8, { rough: 0.3 });
  const black = mat(0x16181e, { rough: 0.5 }), yellow = mat(0xffd23f, { rough: 0.3, metal: 0.3 });
  const rig = biped({
    height: 1.75, legLen: 0.6, hipW: 0.15, legR: 0.075, legMat: white, footMat: shell,
    torsoH: 0.62, torsoW: 0.62, torsoD: 0.5, bodyMat: shell, bellyMat: white,
    headR: 0.28, armLen: 0.5, armR: 0.065, handMat: white, handR: 0.075,
    swing: 0.8,
  });
  rig.radius = 0.36;
  const h = rig.head;
  // a long dog's muzzle with a big black nose
  part(G.sphere, white, h, { p: [0, 0.22, 0.27], s: [0.16, 0.12, 0.2] });
  part(G.sphereLo, black, h, { p: [0, 0.27, 0.46], s: [0.06, 0.05, 0.05] });
  rig.jaw = group(h, [0, 0.14, 0.22]);
  part(G.sphere, white, rig.jaw, { p: [0, -0.02, 0.1], s: [0.13, 0.04, 0.15] });
  part(G.box, mat(0xd8405a, { rough: 0.4 }), rig.jaw, { p: [0, -0.04, 0.2], s: [0.06, 0.02, 0.1] });   // tongue
  eyes(h, rig, { color: 0x2de2ff, x: 0.11, y: 0.4, z: 0.22, r: 0.07 });
  // floppy ears
  for (const sx of [-1, 1]) part(G.sphere, black, h, { p: [sx * 0.27, 0.35, -0.02], s: [0.07, 0.22, 0.13], r: [0, 0, sx * 0.25] });
  // the collar and its lightning-bolt tag, and a lightning-bolt tail
  part(G.torus, mat(0xd8405a, { rough: 0.4 }), rig.neck, { p: [0, -0.02, 0], s: [0.22, 0.22, 0.3], r: [Math.PI / 2, 0, 0] });
  part(G.cone, yellow, rig.neck, { p: [0, -0.12, 0.2], s: [0.05, 0.1, 0.02], r: [0, 0, 0.5] });
  for (let i = 0; i < 3; i++) {
    part(G.box, yellow, rig.hips, { p: [(i % 2 ? 0.06 : -0.06), -0.05 + i * 0.12, -0.36 - i * 0.05], s: [0.05, 0.16, 0.05], r: [0.4, 0, i % 2 ? -0.7 : 0.7] });
  }
  rig.headR = 0.28;
  rig.root.traverse((o) => { if (o.isMesh) o.userData.owner = 'sparky'; });
  return finish(rig, 'sparky', 0.6);
}

// The old animatronics, for the levels: they're the PlayPlace's, before the PlayPlace. Old
// Gus is the original suit from Gus's very first restaurant, long ago.
export const buildOld = (id) => () => buildAnimatronic(id);
export const buildOldGus = () => buildAnimatronic('gus', { old: true });

// A tiny Gus plushie, for Max's bed: a baby Gus no bigger than a cat.
export function buildPlushGus(seed = 0) {
  const rig = buildBabyGus(seed);
  rig.root.scale.setScalar(0.56 * 0.42);
  return rig;
}

// ── Hands ───────────────────────────────────────────────────────────────
//
// What you see of yourself: sleeves the colour of your shirt, a flashlight in the left hand
// and (for the kids) the Gus Watch on the right wrist. Jonathan still has his from when he
// was five; the Pizzaplex sells them at the Prize Counter.

export function buildHands({ sleeve, skin, watch = true, scale = 0.7, baggy = false }) {
  const root = new THREE.Group();
  const sl = vmMat(sleeve, { rough: 0.85 });
  const sk = vmMat(skin, { rough: 0.7 });
  const sw = baggy ? 0.07 : 0.045;      // a baggy sweatshirt's sleeves come right down over the wrists
  const hand = (x, y, z) => {
    const g = group(root, [x, y, z]);
    part(G.cyl, sl, g, { p: [0, -0.02, baggy ? 0.12 : 0.15], s: [sw, 0.28, sw], r: [Math.PI / 2 - 0.15, 0, 0] });
    part(G.box, sk, g, { p: [0, 0, 0], s: [0.06, 0.05, 0.075] });
    return g;
  };
  const right = hand(0.28, -0.33, -0.72);
  let face = null;
  if (watch) {
    part(G.cyl, vmMat(0x5b2a86, { rough: 0.5 }), right, { p: [0, 0, 0.09], s: [0.05, 0.035, 0.05], r: [Math.PI / 2 - 0.15, 0, 0] });
    face = part(G.box, new THREE.MeshBasicMaterial({ color: new THREE.Color(0xc98aff).multiplyScalar(Math.max(1, GLOW * 0.4)) }), right,
      { p: [0, 0.045, 0.09], s: [0.05, 0.008, 0.05] });
  }
  const left = hand(-0.3, -0.35, -0.75);
  const torch = group(left, [0, 0.03, -0.05]);
  part(G.cyl, vmMat(0x2a2a30, { rough: 0.4 }), torch, { p: [0, 0, 0], s: [0.024, 0.17, 0.024], r: [Math.PI / 2, 0, 0] });
  part(G.cylTaper, vmMat(0x3a3a44, { rough: 0.4 }), torch, { p: [0, 0, -0.1], s: [0.036, 0.04, 0.036], r: [-Math.PI / 2, 0, 0] });
  const lens = part(G.cyl, new THREE.MeshBasicMaterial({ color: 0xfff4c8 }), torch, { p: [0, 0, -0.122], s: [0.03, 0.005, 0.03], r: [Math.PI / 2, 0, 0] });
  root.scale.setScalar(scale);
  root.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.renderOrder = 10; } });
  return { root, right, left, lens, watch: face, spark: null, muzzle: null, item: null };
}

export { setEyes } from '../models.js';
