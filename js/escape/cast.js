// The characters of When Jonathan Was Five, built from the same parts as everyone else in
// models.js: little Jonathan and Jack in their pajamas, the daycare's teacher, and everything
// that walks around at night — the Night Bots, Pjork the pig, the librarian, the custodian,
// the hospital's nurse robot, the mall cop robot, the museum's statues and guard, the movie
// theater's ticket robot, and the baby Gus's of the giant pizza place.
//
// Every rig works with poseRig (hips → torso → head, arms, legs), and `finish` works out
// where its face is for the jumpscare.
import * as THREE from 'three';
import {
  buildPerson, mat, fur, cloth, setEyes, biped, part, group, eyes, addFur, MODEL_G as G,
  buildGus, GUS_LOOK, DARK_METAL, vmMat,
} from '../models.js';
import { REALISTIC, GLOW } from '../config.js';

const EYE_GLOW = Math.max(1, GLOW * 0.5);

// Where the face is (for the jumpscare, which pushes it into the camera) and how far in front
// of the head it sticks out.
function finish(rig, id, snout = 0.5, person = false) {
  // (buildPerson furs its own hair)
  if (REALISTIC && !person) addFur(rig.root);
  rig.id = id;
  rig.root.updateMatrixWorld(true);
  const head = new THREE.Vector3();
  rig.head.getWorldPosition(head);
  rig.faceY = head.y + rig.headR;
  rig.snout = snout;
  return rig;
}

// Glowing eyes on a person's face — the grown-ups who walk around at night have them.
function personEyes(rig, color, h, headScale = 0.075) {
  const hr = h * headScale;
  eyes(rig.head, rig, { color, x: hr * 0.33, y: hr * 1.12, z: hr * 0.9, r: hr * 0.1, white: false });
  rig.headR = hr;
}

// ── The kids ────────────────────────────────────────────────────────────

// Jonathan at five: blue pajamas, the same dark hair he'll have at fifteen.
export function buildLittleJonathan() {
  const rig = buildPerson({
    height: 1.1, headScale: 0.11, shoulders: 0.15, shirt: 0x3a6ab8, pants: 0x2a4a8a,
    skin: 0xd9a07a, hair: 0x3a2414, shadows: true,
  });
  rig.headR = 1.1 * 0.11;
  return rig;
}

// Jack, his best friend: red pajamas and messy sandy hair.
export function buildJack() {
  const rig = buildPerson({
    height: 1.12, headScale: 0.11, shoulders: 0.15, shirt: 0xc0262d, pants: 0x7a1a20,
    skin: 0xf1c7a5, hair: 0xb8843a, shadows: true,
  });
  rig.headR = 1.12 * 0.11;
  return rig;
}

// Miss Penny, the daycare's night teacher (the intro cutscene).
export function buildTeacher() {
  const rig = buildPerson({
    height: 1.66, shirt: 0x5aa86a, pants: 0x34363e, skin: 0xa86b45, hair: 0x111111, shoulders: 0.19,
    shadows: true,
  });
  rig.headR = 1.66 * 0.075;
  return rig;
}

// Jonathan's mom and Jack's, waiting outside at 6 AM (the finale).
export function buildMom(jack = false) {
  const rig = buildPerson({
    height: 1.68, shirt: jack ? 0x7ad151 : 0xff7eb6, pants: 0x2a3a5a, skin: jack ? 0xf1c7a5 : 0xd9a07a,
    hair: jack ? 0xd9b45a : 0x2b1a10, shoulders: 0.19, shadows: true,
  });
  rig.headR = 1.68 * 0.075;
  return rig;
}

// John, on his first day as the night guard at the pizza place — the old night guard of
// Gus's PlayPlace, ten years before (the secret ending).
export function buildYoungJohn() {
  const rig = buildPerson({
    height: 1.82, shirt: 0x2b4a7a, pants: 0x1f2533, skin: 0xe8c4a8, cap: 0x1f3360, hair: 0x6b3e1f, badge: true,
    shoulders: 0.22, shadows: true,
  });
  rig.headR = 1.82 * 0.075;
  return rig;
}

// ── Robots ──────────────────────────────────────────────────────────────
//
// Shiny plastic shells on metal joints, one wide glowing visor for eyes. `extra` adds whatever
// makes each one itself.

function robot({ height = 1.9, shell, trim, eye, visor = true, headR = 0.26, extra = null }) {
  const plastic = mat(shell, { rough: 0.3, metal: 0.1 });
  const trimMat = mat(trim, { rough: 0.4, metal: 0.3 });
  const legLen = height * 0.36;
  const rig = biped({
    height, legLen, hipW: 0.15, legR: 0.075, legMat: trimMat, footMat: plastic, footW: 0.15, footL: 0.26,
    torsoH: height * 0.32, torsoW: 0.62, torsoD: 0.46, bodyMat: plastic, headR, headMat: plastic,
    headSY: 0.9, armLen: height * 0.3, armR: 0.065, armMat: trimMat, handMat: plastic, handR: 0.09,
  });
  rig.headR = headR;
  rig.radius = 0.38;
  const h = rig.head;
  if (visor) {
    // a dark glass band across the face, with the eyes glowing through it
    part(G.sphere, mat(0x0a0c12, { rough: 0.1, metal: 0.5, worn: false }), h,
      { p: [0, headR * 1.02, headR * 0.42], s: [headR * 0.86, headR * 0.34, headR * 0.6] });
    eyes(h, rig, { color: eye, x: headR * 0.36, y: headR * 1.02, z: headR * 0.92, r: headR * 0.17, white: false });
  } else {
    eyes(h, rig, { color: eye, x: headR * 0.4, y: headR * 1.05, z: headR * 0.82, r: headR * 0.2 });
  }
  // a speaker grille for a mouth, which is also its jaw
  rig.jaw = group(h, [0, headR * 0.6, headR * 0.6]);
  part(G.box, mat(0x16181e, { rough: 0.6 }), rig.jaw, { p: [0, -0.02, headR * 0.28], s: [headR * 0.7, headR * 0.16, 0.04] });
  rig.jawMax = 0.5;
  if (extra) extra(rig, { plastic, trimMat, h, headR });
  return rig;
}

// The Night Bots: the daycare's babysitter robots. White, with a sleepy moon on the chest
// and an antenna, they put the kids to bed — and at night they walk the halls.
export function buildNightBot() {
  const rig = robot({
    height: 1.95, shell: 0xe8ecf2, trim: 0x4a6ab8, eye: 0x5ad1ff,
    extra(r, { h, headR }) {
      part(G.cyl, DARK_METAL(), h, { p: [0, headR * 2.0, 0], s: [0.015, 0.22, 0.015] });
      const bulb = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd23f).multiplyScalar(EYE_GLOW) });
      part(G.sphereLo, bulb, h, { p: [0, headR * 2.0 + 0.12, 0], s: [0.04, 0.04, 0.04] });
      const moon = mat(0xffd23f, { rough: 0.3 });
      part(new THREE.TorusGeometry(0.09, 0.03, 6, 16, Math.PI * 1.25), moon, r.torso,
        { p: [0, 0.42, 0.24], r: [0, 0, 1.0] });
      // little cuffs and a belt, so the shape reads in the dark
      part(G.cyl, mat(0x4a6ab8), r.torso, { p: [0, 0.06, 0], s: [0.3, 0.06, 0.24] });
    },
  });
  return finish(rig, 'nightbot', 0.42);
}

// The hospital's nurse robot: white with a red cross, a nurse's cap and a clipboard, and one
// big round eye that looks for kids who should be in bed.
export function buildNurseBot() {
  const rig = robot({
    height: 2.0, shell: 0xf4f6f8, trim: 0x9aa4b0, eye: 0xff4a4a, visor: false, headR: 0.25,
    extra(r, { h, headR }) {
      const red = mat(0xd11f2a, { rough: 0.35 });
      part(G.box, red, r.torso, { p: [0, 0.45, 0.25], s: [0.05, 0.18, 0.02] });
      part(G.box, red, r.torso, { p: [0, 0.45, 0.25], s: [0.18, 0.05, 0.02] });
      const cap = group(h, [0, headR * 1.85, 0.02]);
      part(G.box, mat(0xffffff, { rough: 0.5 }), cap, { p: [0, 0.04, 0], s: [0.24, 0.1, 0.16] });
      part(G.box, red, cap, { p: [0, 0.05, 0.081], s: [0.05, 0.05, 0.005] });
      part(G.box, mat(0x8a5a32), r.armL, { p: [0, -0.62, 0.12], s: [0.2, 0.28, 0.02], r: [-0.4, 0, 0] });
    },
  });
  return finish(rig, 'nurse', 0.42);
}

// The mall cop robot: navy blue, a peaked cap, a gold badge and a whistle. `guard` is the
// museum's grey version.
export function buildCopBot({ guard = false } = {}) {
  const rig = robot({
    height: 2.05, shell: guard ? 0x6a7078 : 0x1f2f5a, trim: guard ? 0x2a2c31 : 0x10182e, eye: guard ? 0xffd23f : 0xff3b30,
    extra(r, { h, headR }) {
      const cap = group(h, [0, headR * 1.7, 0]);
      const capMat = cloth(guard ? 0x2a2c31 : 0x10182e);
      part(G.cyl, capMat, cap, { p: [0, 0.05, 0], s: [0.27, 0.1, 0.27] });
      part(G.cyl, capMat, cap, { p: [0, 0.0, 0.14], s: [0.2, 0.02, 0.14] });
      part(G.box, mat(0xf2c230, { metal: 0.8, rough: 0.25 }), cap, { p: [0, 0.07, 0.27], s: [0.07, 0.06, 0.01] });
      part(G.box, mat(0xf2c230, { metal: 0.8, rough: 0.25 }), r.torso, { p: [-0.16, 0.5, 0.23], s: [0.08, 0.09, 0.02] });
      // a torch in its hand (it can't see any better with it, but it looks like it can)
      part(G.cyl, mat(0x111111), r.armR, { p: [0, -0.68, 0.12], s: [0.035, 0.22, 0.035], r: [1.3, 0, 0] });
    },
  });
  return finish(rig, guard ? 'guard' : 'cop', 0.42);
}

// The movie theater's ticket robot: a red usher's jacket with gold buttons, a bow tie and a
// pillbox hat, and a ticket stub sticking out of its mouth slot.
export function buildTicketBot() {
  const rig = robot({
    height: 1.9, shell: 0xb01a26, trim: 0x3a0a10, eye: 0xffe08a,
    extra(r, { h, headR }) {
      const gold = mat(0xf2c230, { metal: 0.8, rough: 0.25 });
      for (let k = 0; k < 3; k++) part(G.sphereLo, gold, r.torso, { p: [0, 0.2 + k * 0.14, 0.25], s: [0.025, 0.025, 0.02] });
      const tie = group(r.torso, [0, 0.56, 0.24]);
      for (const sx of [-1, 1]) part(G.cone, mat(0x111111), tie, { p: [sx * 0.06, 0, 0], s: [0.05, 0.1, 0.05], r: [0, 0, -sx * Math.PI / 2] });
      const hat = group(h, [0, headR * 1.75, 0]);
      part(G.cyl, cloth(0xb01a26), hat, { p: [0, 0.05, 0], s: [0.17, 0.12, 0.17] });
      part(G.cyl, gold, hat, { p: [0, 0.0, 0], s: [0.175, 0.03, 0.175] });
      part(G.box, mat(0xf4e6b0, { rough: 0.7 }), r.jaw, { p: [0, -0.06, headR * 0.3], s: [0.09, 0.12, 0.01] });
    },
  });
  return finish(rig, 'ticket', 0.42);
}

// ── Pjork the pig ───────────────────────────────────────────────────────
//
// The daycare's mascot: a big pink pig in blue overalls with a propeller cap. By day he sings
// on his stage. At night he only moves when nobody is looking at him.

export function buildPjork() {
  const pink = fur(0xe58f9e), light = fur(0xf5c2ca, { pile: 0.6 }), snoutMat = mat(0xd97587, { rough: 0.5 });
  const rig = biped({
    height: 2.3, legLen: 0.7, hipW: 0.22, legR: 0.12, legMat: cloth(0x2a4fa0), footMat: mat(0x3a2a2a),
    footW: 0.18, footL: 0.26,
    torsoH: 0.95, torsoW: 1.05, torsoD: 0.85, bodyMat: pink, bellyMat: light,
    headR: 0.36, headSX: 1.08, headSY: 0.95, armLen: 0.62, armR: 0.1, handMat: snoutMat, handR: 0.12,
  });
  rig.headR = 0.36;
  rig.radius = 0.55;
  const h = rig.head;
  // overalls: a bib and two straps over the belly
  const denim = cloth(0x2a4fa0);
  part(G.cylTaper, denim, rig.torso, { p: [0, 0.28, 0], s: [0.54, 0.56, 0.44] });
  part(G.box, denim, rig.torso, { p: [0, 0.6, 0.38], s: [0.4, 0.32, 0.06] });
  for (const sx of [-1, 1]) {
    part(G.box, denim, rig.torso, { p: [sx * 0.2, 0.78, 0.3], s: [0.07, 0.4, 0.06], r: [-0.3, 0, 0] });
    part(G.sphereLo, mat(0xf2c230, { metal: 0.7, rough: 0.3 }), rig.torso, { p: [sx * 0.17, 0.72, 0.42], s: [0.04, 0.04, 0.02] });
  }
  // the snout, with nostrils
  part(G.cyl, snoutMat, h, { p: [0, 0.3, 0.38], s: [0.16, 0.14, 0.12], r: [Math.PI / 2, 0, 0] });
  for (const sx of [-1, 1]) part(G.sphereLo, mat(0x3a1418), h, { p: [sx * 0.06, 0.3, 0.455], s: [0.03, 0.045, 0.015] });
  // floppy ears
  for (const sx of [-1, 1]) part(G.cone, pink, h, { p: [sx * 0.26, 0.66, 0.02], s: [0.12, 0.22, 0.06], r: [0.3, 0, sx * -0.6] });
  // a wide grin of a jaw under the snout
  rig.jaw = group(h, [0, 0.18, 0.24]);
  part(G.sphere, mat(0x2a0a10, { rough: 0.9 }), rig.jaw, { p: [0, -0.02, 0.06], s: [0.2, 0.05, 0.1] });
  for (let k = 0; k < 5; k++) part(G.box, mat(0xf4f1ea, { rough: 0.3 }), rig.jaw, { p: [-0.1 + k * 0.05, 0.02, 0.14], s: [0.035, 0.04, 0.02] });
  rig.jawMax = 0.6;
  eyes(h, rig, { color: 0x7fffd4, x: 0.15, y: 0.47, z: 0.29 });
  // a propeller cap, a little crooked
  const cap = group(h, [0.03, 0.68, 0]);
  cap.rotation.z = -0.12;
  const yellow = cloth(0xffd23f), red = cloth(0xd11f2a);
  part(G.lid, yellow, cap, { p: [0, 0, 0], s: [0.3, 0.2, 0.3] });
  part(G.cyl, red, cap, { p: [0, 0.0, 0.2], s: [0.22, 0.015, 0.14] });
  part(G.cyl, DARK_METAL(), cap, { p: [0, 0.24, 0], s: [0.012, 0.08, 0.012] });
  rig.propeller = group(cap, [0, 0.29, 0]);
  for (const sx of [-1, 1]) part(G.box, mat(sx > 0 ? 0xd11f2a : 0x2a4fa0, { rough: 0.4 }), rig.propeller, { p: [sx * 0.12, 0, 0], s: [0.24, 0.01, 0.05] });
  // a curly tail
  part(new THREE.TorusGeometry(0.08, 0.025, 6, 14, Math.PI * 1.6), light, rig.hips, { p: [0, -0.05, -0.46], r: [0, Math.PI / 2, 0] });
  return finish(rig, 'pjork', 0.55);
}

// ── The grown-ups ───────────────────────────────────────────────────────

// The librarian: a grey bun, a mustard cardigan and glasses — and eyes that glow behind them.
export function buildLibrarian() {
  const h = 1.68;
  const rig = buildPerson({
    height: h, shirt: 0xc9a227, pants: 0x2f4a3a, skin: 0xe8c4a8, hair: 0x9a9a9a, glasses: true, shoulders: 0.19,
    shadows: true,
  });
  personEyes(rig, 0xfff0a0, h);
  const hr = h * 0.075;
  part(G.sphereLo, fur(0x9a9a9a, { pile: 0.4 }), rig.head, { p: [0, hr * 1.9, -hr * 0.45], s: [hr * 0.42, hr * 0.38, hr * 0.42] });
  // a book under her arm
  part(G.box, mat(0x7a1a20, { rough: 0.6 }), rig.armL, { p: [0.02, -0.4, 0.1], s: [0.05, 0.28, 0.2] });
  rig.radius = 0.3;
  return finish(rig, 'librarian', 0.25, true);
}

// The custodian: grey coveralls and a cap, a big ring of keys, and a mop.
export function buildCustodian() {
  const h = 1.8;
  const rig = buildPerson({
    height: h, shirt: 0x5a6a7a, pants: 0x4a5a6a, skin: 0xd9a07a, hair: 0x2b1a10, cap: 0x2f3a46, beard: 0x2b1a10,
    shoulders: 0.22, shadows: true,
  });
  personEyes(rig, 0xffb84a, h);
  const wood = mat(0x8a6a4a, { rough: 0.6 });
  part(G.cyl, wood, rig.armR, { p: [0, -0.45, 0.18], s: [0.02, 1.5, 0.02], r: [0.15, 0, 0] });
  part(G.sphereLo, mat(0xd8d0b8, { rough: 0.95 }), rig.armR, { p: [0, -1.18, 0.29], s: [0.18, 0.08, 0.12] });
  for (let k = 0; k < 4; k++) {
    part(G.box, mat(0xd9b45a, { metal: 0.8, rough: 0.3 }), rig.hips, { p: [0.2 + k * 0.015, -0.08 - k * 0.02, 0.1], s: [0.012, 0.06, 0.02] });
  }
  rig.radius = 0.32;
  return finish(rig, 'custodian', 0.25, true);
}

// The museum's statues: stone people on plinths... that move when you aren't looking.
export function buildStatue(kind = 0) {
  const stone = mat(0x9a968e, { rough: 0.95, metal: 0 });
  const h = [1.9, 1.85, 2.0][kind % 3];
  const rig = buildPerson({ height: h, shirt: 0x9a968e, pants: 0x8a867e, skin: 0xa8a49c, hair: 0x8a867e, shoulders: 0.22, shadows: true });
  rig.root.traverse((o) => {
    if (o.isInstancedMesh) o.visible = false;      // no strands of hair on a statue
    else if (o.isMesh) o.material = stone;
  });
  // dark, empty eyes that glow faintly
  personEyes(rig, 0x9fd8ff, h);
  if (kind % 3 === 1) {     // a knight's helmet
    part(G.sphereLo, mat(0x7a7a80, { metal: 0.6, rough: 0.5 }), rig.head, { p: [0, h * 0.075 * 1.15, 0], s: [h * 0.075 * 1.08, h * 0.075 * 1.15, h * 0.075 * 1.08] });
  } else if (kind % 3 === 2) {   // a crown
    part(G.cyl, stone, rig.head, { p: [0, h * 0.075 * 2.05, 0], s: [h * 0.075 * 0.8, 0.08, h * 0.075 * 0.8] });
  }
  rig.radius = 0.32;
  return finish(rig, 'statue', 0.25, true);
}

// ── The baby Gus's ──────────────────────────────────────────────────────
//
// The giant pizza place's little ones: Gus, kid-sized, in a baby bonnet and a bib, with a
// dummy in his bill. They toddle about all night, giggling.

const BABY_LOOK = { ...GUS_LOOK, fur: 0x9a6038, belly: 0xe0b484, eye: 0xffb02a, baby: true };

export function buildBabyGus(seed = 0) {
  const rig = buildGus(BABY_LOOK);
  const h = rig.head;
  const pastel = [0x9fd8ff, 0xffb3d9, 0xb8f2a0, 0xffe08a][seed % 4];
  part(G.lid, cloth(pastel), h, { p: [0, 0.4, -0.04], s: [0.37, 0.36, 0.38], r: [-0.25, 0, 0] });
  part(G.torus, cloth(0xffffff), h, { p: [0, 0.38, 0.2], s: [0.3, 0.3, 0.3], r: [-0.3, 0, 0] });
  part(G.sphere, cloth(0xffffff), rig.torso, { p: [0, 0.72, 0.3], s: [0.3, 0.22, 0.08] });
  part(G.torus, mat(pastel, { rough: 0.3 }), h, { p: [0, 0.2, 0.75], s: [0.07, 0.07, 0.07] });
  part(G.sphere, fur(0x5a341d, { pile: 0.6 }), rig.hips, { p: [0, -0.2, -0.5], s: [0.3, 0.07, 0.42], r: [0.5, 0, 0] });
  rig.root.scale.setScalar(0.56);
  rig.headR = 0.34 * 0.56;
  rig.radius = 0.3;
  rig.height *= 0.56;
  finish(rig, 'babygus', 0.85 * 0.56);
  return rig;
}

// ── Little Jonathan's hands ─────────────────────────────────────────────
//
// What you see at five: small hands in pajama sleeves, a toy flashlight in the left, and the
// Gus Watch on the right wrist, its face glowing purple.

export function buildKidViewmodel() {
  const root = new THREE.Group();
  const sleeve = vmMat(0x3a6ab8, { rough: 0.85 });
  const skin = vmMat(0xd9a07a, { rough: 0.7 });
  const hand = (x, y, z) => {
    const g = group(root, [x, y, z]);
    part(G.cyl, sleeve, g, { p: [0, -0.02, 0.15], s: [0.045, 0.28, 0.045], r: [Math.PI / 2 - 0.15, 0, 0] });
    part(G.box, skin, g, { p: [0, 0, 0], s: [0.06, 0.05, 0.075] });
    return g;
  };
  const right = hand(0.28, -0.33, -0.72);
  // the Gus Watch: a purple band and a glowing face
  part(G.cyl, vmMat(0x5b2a86, { rough: 0.5 }), right, { p: [0, 0, 0.09], s: [0.05, 0.035, 0.05], r: [Math.PI / 2 - 0.15, 0, 0] });
  const face = part(G.box, new THREE.MeshBasicMaterial({ color: new THREE.Color(0xc98aff).multiplyScalar(Math.max(1, GLOW * 0.4)) }), right,
    { p: [0, 0.045, 0.09], s: [0.05, 0.008, 0.05] });
  const left = hand(-0.3, -0.35, -0.75);
  const torch = group(left, [0, 0.03, -0.05]);
  part(G.cyl, vmMat(0xffd23f, { rough: 0.4 }), torch, { p: [0, 0, 0], s: [0.022, 0.15, 0.022], r: [Math.PI / 2, 0, 0] });
  part(G.cylTaper, vmMat(0xd11f2a, { rough: 0.4 }), torch, { p: [0, 0, -0.09], s: [0.034, 0.04, 0.034], r: [-Math.PI / 2, 0, 0] });
  const lens = part(G.cyl, new THREE.MeshBasicMaterial({ color: 0xfff4c8 }), torch, { p: [0, 0, -0.112], s: [0.028, 0.005, 0.028], r: [Math.PI / 2, 0, 0] });
  root.scale.setScalar(0.62);
  root.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.renderOrder = 10; } });
  return { root, right, left, lens, watch: face, spark: null, muzzle: null, item: null };
}

export { setEyes };
