// Every character mesh, built from primitives in code: the five animatronics, the Junk
// Monster, the daytime kids, and Jonathan's hands and gear.
//
// The look is old furry costumes over a metal skeleton, like the first Five Nights at
// Freddy's (the designer's call): worn, a bit dirty, plastic bills and beaks and hats, so
// the same characters can be cheerful on the stage at noon and terrifying in a dark
// hallway at 3 AM. The only thing that changes is the light and the eyes. On the realistic
// graphics setting the fur is real fur: shells of strands standing off every furry part.
//
// Every character is a rig of nested groups (hips → torso → head → jaw, shoulders → arms,
// hips → legs) facing +Z, so `rotation.y = atan2(dx, dz)` turns it to face (dx, dz).
import * as THREE from 'three';
import { SHADOWS, GLOW, REALISTIC } from './config.js';
import * as R from './realtex.js';

const matCache = new Map();
// Plastic, paint and metal. On realistic graphics, anything that isn't shiny metal is
// scuffed and grubby (`worn: false` for skin and clothes).
export function mat(color, { rough = 0.42, metal = 0.08, emissive = null, worn = true } = {}) {
  const key = `${color}|${rough}|${metal}|${emissive}|${worn}`;
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
  if (emissive !== null) { m.emissive = new THREE.Color(emissive); m.emissiveIntensity = 1; }
  if (REALISTIC && worn && metal < 0.5) {
    const w = R.wornPlastic(), info = R.surfaceInfo.get(w);
    m.map = w; m.normalMap = info.normalMap; m.roughnessMap = info.roughnessMap;
    m.normalScale.set(0.6, 0.6);
  }
  matCache.set(key, m);
  return m;
}

// A costume's fur. `pile` is how long it is (1 = shaggy, 0.4 = short velour). Realistic
// graphics give it a soft sheen and shells of strands (see addFur); fast graphics make it
// matte so it at least doesn't shine like plastic.
const furCache = new Map();
export function fur(color, { pile = 1 } = {}) {
  if (!REALISTIC) return mat(color, { rough: 0.85, metal: 0 });
  const key = `${color}|${pile}`;
  if (furCache.has(key)) return furCache.get(key);
  const t = R.fur();
  const m = new THREE.MeshPhysicalMaterial({
    color, map: t.map, normalMap: t.normalMap, roughness: 0.92, metalness: 0,
    sheen: 1, sheenRoughness: 0.55, sheenColor: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.35),
  });
  m.userData.fur = { pile };
  furCache.set(key, m);
  return m;
}

// Felt, velvet and knit: soft like fur but with no strands.
const clothCache = new Map();
export function cloth(color) {
  if (!REALISTIC) return mat(color);
  if (!clothCache.has(color)) {
    const t = R.fur();
    clothCache.set(color, new THREE.MeshPhysicalMaterial({
      color, map: t.map, normalMap: t.normalMap, normalScale: new THREE.Vector2(0.5, 0.5), roughness: 0.9,
      sheen: 1, sheenRoughness: 0.4, sheenColor: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.3),
    }));
  }
  return clothCache.get(color);
}
const METAL = () => mat(0x8a8f99, { rough: 0.35, metal: 0.7 });
const DARK_METAL = () => mat(0x3a3d44, { rough: 0.4, metal: 0.6 });

// Smoother on realistic graphics, where the silhouettes are lit and furred up close.
const SEG = REALISTIC ? 2 : 1;
const G = {
  sphere: new THREE.SphereGeometry(1, 20 * SEG, 14 * SEG),
  sphereLo: new THREE.SphereGeometry(1, 12 * SEG, 8 * SEG),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 14 * SEG),
  cylTaper: new THREE.CylinderGeometry(0.8, 1, 1, 14 * SEG),
  cone: new THREE.ConeGeometry(1, 1, 14 * SEG),
  box: new THREE.BoxGeometry(1, 1, 1),
  torus: new THREE.TorusGeometry(1, 0.18, 8 * SEG, 20 * SEG),
  lid: new THREE.SphereGeometry(1, 12 * SEG, 6 * SEG, 0, Math.PI * 2, 0, Math.PI / 2),
  capsule: new THREE.CapsuleGeometry(0.5, 1, 6, 16),   // 2 tall, 1 across
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
// dark (not as hot as neon, so they keep their colour on realistic graphics) — `setEyes(rig, level)` dims them for powered-down and turns them blue for friends.

const EYE_GLOW = Math.max(1, GLOW * 0.5);

// Old glass-and-plastic eyeballs, yellowed, under heavy lids — on realistic graphics.
let eyeWhite = null;
function eyeballMat() {
  if (!REALISTIC) return mat(0xf4f1ea, { rough: 0.2 });
  return eyeWhite || (eyeWhite = new THREE.MeshPhysicalMaterial({
    color: 0xe6dfc8, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.04,
  }));
}

function eyes(head, rig, { color, x = 0.13, y = 0.08, z = 0.3, r = 0.085, white = true }) {
  const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(EYE_GLOW) });
  rig.eyeMat = glow;
  rig.eyeColor = new THREE.Color(color);
  // (kept, for the jumpscare's creepy eyes: creepyEyes)
  rig.eyeballs = rig.eyeballs || [];
  rig.pupils = rig.pupils || [];
  for (const sx of [-1, 1]) {
    if (white) rig.eyeballs.push(part(G.sphereLo, eyeballMat(), head, { p: [sx * x, y, z], s: [r, r, r * 0.7] }));
    rig.pupils.push(part(G.sphereLo, glow, head, { p: [sx * x, y, z + r * 0.55], s: [r * 0.45, r * 0.45, r * 0.25] }));
    // a heavy upper lid in the head's own fur, half shut
    if (REALISTIC && white && rig.skull) {
      part(G.lid, rig.skull.material, head, { p: [sx * x, y + r * 0.08, z - r * 0.05], s: [r * 1.12, r * 1.05, r * 0.95], r: [-0.75, 0, 0] });
    }
  }
}

// The jumpscare's eyes, like FNAF: first `void` — the eyes go pitch black with one tiny white
// dot in each — then `red`, the dots blaze up big and red; `null` puts them back.
const VOID = new THREE.MeshBasicMaterial({ color: 0x000000 });
export function creepyEyes(rig, mode) {
  if (!rig.pupils) return;
  if (!rig.eyeHome) rig.eyeHome = { balls: rig.eyeballs.map((m) => m.material), scale: rig.pupils.map((m) => m.scale.clone()) };
  const home = rig.eyeHome;
  rig.eyeballs.forEach((m, i) => { m.material = mode ? VOID : home.balls[i]; });
  rig.pupils.forEach((m, i) => {
    m.scale.copy(home.scale[i]).multiplyScalar(mode === 'void' ? 0.32 : mode === 'red' ? 1.35 : 1);
  });
  for (const m of rig.eyeMats || (rig.eyeMat ? [rig.eyeMat] : [])) {
    if (mode === 'void') m.color.setRGB(3, 3, 3);
    else if (mode === 'red') m.color.set(0xff0a0a).multiplyScalar(EYE_GLOW * 2.2);
  }
  if (!mode) delete rig.eyeHome;
}

export function setEyes(rig, mode) {
  // The Junk Monster has a whole set of heads, so it can have many eye materials.
  for (const m of rig.eyeMats || (rig.eyeMat ? [rig.eyeMat] : [])) {
    if (mode === 'off') m.color.setRGB(0.05, 0.05, 0.05);
    else if (mode === 'friend') m.color.set(0x5ad1ff).multiplyScalar(EYE_GLOW);
    else if (mode === 'scare') m.color.set(0xff1a1a).multiplyScalar(EYE_GLOW * 1.5);
    else if (mode === 'dim') m.color.copy(rig.eyeColor).multiplyScalar(0.35);
    else m.color.copy(rig.eyeColor).multiplyScalar(EYE_GLOW);
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
  // the body's egg shape, for tailRoot
  rig.bodyDims = { cy: o.torsoH / 2, ry: o.torsoH / 2 + 0.08, rz: o.torsoD / 2 };
  return rig;
}

// Where a tail comes out: the small of the back, low on the body and tucked just inside it,
// so the tail grows out of the costume instead of floating behind the legs (the designer: "the
// animatronic tails aren't aligned"). It's on the torso, so the tail leans when the body does.
// Build the tail in this group's space, pointing back (-z) from its origin.
function tailRoot(rig, { k = 0.55, x = 0, dims = rig.bodyDims } = {}) {
  const y = dims.cy - dims.ry * k;
  const z = -dims.rz * Math.sqrt(1 - k * k) * 0.92;
  return group(rig.torso, [x, y, z]);
}

// The flat beaver-ish tail every platypus has, drooping a little.
function gusTail(rig, material, root = tailRoot(rig)) {
  const a = 0.35, L = 0.42;
  part(G.sphere, material, root, { p: [0, -Math.sin(a) * L, 0.06 - Math.cos(a) * L], s: [0.3, 0.07, L], r: [-a, 0, 0] });
}

// Chomper's flat paddle, drooping toward the floor like a real beaver's.
function chomperTail(rig, root) {
  const a = 0.55, half = 0.3;
  part(G.box, mat(0x4a3020, { rough: 0.7 }), root, { p: [0, -Math.sin(a) * half, 0.06 - Math.cos(a) * half], s: [0.36, 0.06, half * 2], r: [-a, 0, 0] });
}

// ── Gus the Platypus ────────────────────────────────────────────────────
//
// Moony is Gus, possessed: the same costume gone midnight purple, pale moon eyes, a black hat
// with a glowing crescent on it.

const GUS_LOOK = { fur: 0x7a4a2b, belly: 0xc99a6b, bill: 0x4a5262, eye: 0xffa21f, hat: 0x5b2a86, band: 0xf2c230, tail: 0x5a341d };
const MOONY_LOOK = { fur: 0x1c1530, belly: 0x3b2f5c, bill: 0x23262f, eye: 0xbfe4ff, hat: 0x0d0b14, band: 0xcfe6ff, tail: 0x120d22, moon: true };

function buildGus(look = GUS_LOOK) {
  const brown = fur(look.fur), tan = fur(look.belly), bill = mat(look.bill, { rough: 0.35 });
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
  eyes(h, rig, { color: look.eye, x: 0.15, y: 0.44, z: 0.27 });
  // top hat, a little crooked, and a gold bow tie — he is the star of the show (the baby
  // Gus's of When Jonathan Was Five have neither, nor a microphone: js/escape/cast.js)
  if (look.baby) return rig;
  const hat = group(h, [0.04, 0.64, -0.02]);
  hat.rotation.z = -0.14;
  part(G.cyl, cloth(look.hat), hat, { p: [0, 0.02, 0], s: [0.32, 0.04, 0.32] });
  part(G.cyl, cloth(look.hat), hat, { p: [0, 0.2, 0], s: [0.21, 0.34, 0.21] });
  part(G.cyl, mat(look.band, { metal: 0.5, rough: 0.3 }), hat, { p: [0, 0.08, 0], s: [0.215, 0.06, 0.215] });
  if (look.moon) {
    const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(look.eye).multiplyScalar(EYE_GLOW) });
    part(new THREE.TorusGeometry(0.09, 0.025, 6, 16, Math.PI * 1.2), glow, hat, { p: [0, 0.22, 0.22], r: [0, 0, 1.1] });
  }
  const tie = group(rig.torso, [0, 0.9, 0.33]);
  part(G.cone, mat(look.band, { metal: 0.5, rough: 0.3 }), tie, { p: [-0.09, 0, 0], s: [0.07, 0.14, 0.07], r: [0, 0, Math.PI / 2] });
  part(G.cone, mat(look.band, { metal: 0.5, rough: 0.3 }), tie, { p: [0.09, 0, 0], s: [0.07, 0.14, 0.07], r: [0, 0, -Math.PI / 2] });
  // the beaver-ish tail every platypus has
  gusTail(rig, fur(look.tail, { pile: 0.6 }));
  // microphone
  part(G.cyl, mat(0x222222), rig.armR, { p: [0, -0.72, 0.12], s: [0.03, 0.22, 0.03], r: [1.2, 0, 0] });
  part(G.sphereLo, METAL(), rig.armR, { p: [0, -0.68, 0.24], s: [0.06, 0.06, 0.06] });
  return rig;
}

// ── Sunny, made of fog ──────────────────────────────────────────────────
//
// A sun-shaped animatronic made entirely of drifting cloud, head and all: see-through puffs
// on the usual frame, a misty head with a ring of little puffs for the sun's rays, glowing
// sun-yellow eyes and a smile. Every material is her own copy, so she can fade in and out
// of the fog without touching anyone else's; `rig.fogMats` lists them with their full
// opacity.

function buildSunny() {
  const fog = (color, opacity, glow = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0, transparent: true, opacity });
    if (glow) { m.emissive = new THREE.Color(color); m.emissiveIntensity = glow; }
    return m;
  };
  // her head is fog too, just a warmer, sunnier fog
  const cloud = fog(0xd8dde8, 0.5, 0.12), mist = fog(0xeee4c4, 0.5, 0.25);
  const rig = biped({
    height: 2.1, legLen: 0.8, hipW: 0.18, legR: 0.11, legMat: cloud, footMat: cloud,
    torsoH: 0.9, torsoW: 0.8, torsoD: 0.6, bodyMat: cloud, headR: 0.3, headMat: mist,
    armLen: 0.62, armR: 0.09,
  });
  // puffs of cloud all over, so she reads as fog rather than a body
  const puffs = [[rig.torso, [[-0.3, 0.3, 0.1], [0.32, 0.5, 0], [0, 0.85, -0.15], [-0.15, 0.1, -0.2], [0.2, 0.15, 0.22]]],
    [rig.armL, [[0, -0.3, 0], [0, -0.55, 0.05]]], [rig.armR, [[0, -0.3, 0], [0, -0.55, 0.05]]],
    [rig.legL, [[0, -0.35, 0], [0, -0.65, 0.05]]], [rig.legR, [[0, -0.35, 0], [0, -0.65, 0.05]]]];
  for (const [g, list] of puffs) {
    for (const [x, y, z] of list) part(G.sphereLo, cloud, g, { p: [x, y, z], s: [0.2, 0.17, 0.2] });
  }
  const h = rig.head;
  for (const [x, y, z] of [[-0.2, 0.4, 0.04], [0.22, 0.34, 0.02], [0, 0.56, -0.06], [0.04, 0.12, -0.1]]) {
    part(G.sphereLo, mist, h, { p: [x, y, z], s: [0.16, 0.14, 0.16] });
  }
  // the sun's rays, as a ring of little puffs
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    part(G.sphereLo, mist, h, { p: [Math.cos(a) * 0.44, 0.3 + Math.sin(a) * 0.44, -0.02], s: [0.08, 0.08, 0.07] });
  }
  rig.jaw = group(h, [0, 0.18, 0.2]);
  const mouth = fog(0x3a2a20, 0.6);
  part(G.sphere, mouth, rig.jaw, { p: [0, -0.02, 0.07], s: [0.13, 0.05, 0.05] });
  rig.jawMax = 0.5;
  eyes(h, rig, { color: 0xffd23f, x: 0.11, y: 0.36, z: 0.27, r: 0.1, white: false });
  // The frame's metal joints and neck turn to cloud too; then everything gets her own
  // see-through copy — one per material, so both eyes still share one.
  const keep = new Set([cloud, mist, mouth, rig.eyeMat]);
  rig.root.traverse((o) => { if (o.isMesh && !keep.has(o.material)) o.material = cloud; });
  const own = new Map();
  rig.fogMats = [];
  rig.root.traverse((o) => {
    if (!o.isMesh) return;
    if (!own.has(o.material)) {
      const m = o.material.clone();
      m.transparent = true;
      m.depthWrite = false;
      own.set(o.material, m);
      rig.fogMats.push({ mat: m, full: o.material.transparent ? o.material.opacity : 1 });
    }
    o.material = own.get(o.material);
    o.castShadow = false;
  });
  rig.eyeMat = own.get(rig.eyeMat);
  return rig;
}

// ── Gerald the Gorilla ──────────────────────────────────────────────────

function buildGerald() {
  const coat = fur(0x3a3a44), face = mat(0x9b8f86, { rough: 0.75 });
  const rig = biped({
    height: 2.55, legLen: 0.72, hipW: 0.26, legR: 0.14, legMat: coat, footMat: face,
    footW: 0.2, footL: 0.28,
    torsoH: 1.15, torsoW: 1.3, torsoD: 0.9, bodyMat: coat, bellyMat: face,
    headR: 0.32, headSY: 0.95, armLen: 1.12, armR: 0.17, handMat: face, handR: 0.19,
    swing: 0.4,
  });
  rig.radius = 0.6;
  const h = rig.head;
  part(G.box, coat, h, { p: [0, 0.48, 0.2], s: [0.56, 0.1, 0.18] });               // brow
  part(G.sphere, face, h, { p: [0, 0.22, 0.26], s: [0.26, 0.16, 0.16] });           // muzzle
  rig.jaw = group(h, [0, 0.12, 0.2]);
  part(G.sphere, face, rig.jaw, { p: [0, -0.04, 0.06], s: [0.22, 0.08, 0.13] });
  part(G.box, mat(0xf4f1ea), rig.jaw, { p: [0, 0.02, 0.15], s: [0.24, 0.04, 0.03] }); // teeth
  eyes(h, rig, { color: 0xff2a2a, x: 0.12, y: 0.38, z: 0.26, r: 0.07 });
  // a red drummer's vest and two drumsticks
  part(G.cylTaper, cloth(0xc0262d), rig.torso, { p: [0, 0.65, 0], s: [0.62, 0.7, 0.46] });
  for (const arm of [rig.armL, rig.armR]) {
    part(G.cyl, mat(0xd9b07a), arm, { p: [0, -1.2, 0.2], s: [0.025, 0.5, 0.025], r: [1.3, 0, 0] });
  }
  return rig;
}

// ── Chomper the Beaver ──────────────────────────────────────────────────

function buildChomper() {
  const coat = fur(0xa8642e), muzzle = fur(0xe8c39a, { pile: 0.7 });
  const rig = biped({
    height: 1.6, legLen: 0.45, hipW: 0.17, legR: 0.08, legMat: coat, footMat: mat(0x3a2414, { rough: 0.7 }),
    torsoH: 0.66, torsoW: 0.78, torsoD: 0.66, bodyMat: coat, bellyMat: muzzle,
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
  for (const sx of [-1, 1]) part(G.sphereLo, coat, h, { p: [sx * 0.22, 0.52, -0.02], s: [0.08, 0.08, 0.05] });
  eyes(h, rig, { color: 0x7cff3a, x: 0.12, y: 0.4, z: 0.24, r: 0.075 });
  // hard hat: he builds things (out of your arcade machines)
  part(G.sphere, mat(0xf2c230, { rough: 0.3 }), h, { p: [0, 0.5, -0.01], s: [0.3, 0.17, 0.3] });
  part(G.cyl, mat(0xf2c230, { rough: 0.3 }), h, { p: [0, 0.48, 0.06], s: [0.34, 0.025, 0.36] });
  // flat paddle tail, drooping toward the floor
  chomperTail(rig, tailRoot(rig));
  return rig;
}

// ── Cranker the Penguin ─────────────────────────────────────────────────

function buildCranker() {
  const black = fur(REALISTIC ? 0x2a3040 : 0x1d2230, { pile: 0.6 }), white = fur(0xf2f4f7, { pile: 0.6 }), orange = mat(0xff9a1f);
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
  part(G.torus, cloth(0x3fb8ff), rig.neck, { p: [0, -0.02, 0], s: [0.24, 0.24, 0.4], r: [Math.PI / 2, 0, 0] });
  part(G.box, cloth(0x3fb8ff), rig.neck, { p: [0.12, -0.24, 0.28], s: [0.1, 0.32, 0.04], r: [0.1, 0, 0.2] });
  return rig;
}

// ── Flipper the Dolphin ─────────────────────────────────────────────────

function buildFlipper() {
  const blue = fur(0x5b8fc4, { pile: 0.4 }), belly = fur(0xd9e8f5, { pile: 0.4 });
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
  part(G.cyl, fur(0xc4d8ea, { pile: 0.4 }), rig.jaw, { p: [0, -0.02, 0.12], s: [0.075, 0.26, 0.04], r: [Math.PI / 2, 0, 0] });
  part(G.cone, blue, h, { p: [0, 0.66, -0.12], s: [0.05, 0.3, 0.2], r: [-0.45, 0, 0] });   // dorsal fin
  eyes(h, rig, { color: 0xff5ad1, x: 0.17, y: 0.36, z: 0.2, r: 0.07 });
  // lifeguard sunglasses pushed up on the head
  for (const sx of [-1, 1]) part(G.cyl, mat(0x111111, { rough: 0.1 }), h, { p: [sx * 0.12, 0.58, 0.18], s: [0.08, 0.02, 0.08], r: [1.1, 0, 0] });
  // a short tail out of the small of the back, tapering, with the fluke on the end
  {
    const root = tailRoot(rig), a = 0.45, L = 0.42;
    const dy = -Math.sin(a), dz = -Math.cos(a);
    part(G.cone, blue, root, { p: [0, dy * L / 2, 0.05 + dz * L / 2], s: [0.15, L + 0.1, 0.12], r: [-(Math.PI / 2 + a), 0, 0] });
    part(G.sphere, blue, root, { p: [0, dy * L, 0.05 + dz * L], s: [0.36, 0.045, 0.14], r: [-a, 0, 0] });
  }
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
  const coat = fur(0x3a3a44), tan = mat(0x9b8f86, { rough: 0.75 });
  const rust = mat(0x7a4b2a, { rough: 0.8, metal: 0.4 });
  const steel = METAL();
  const root = new THREE.Group();
  const rig = { root, height: 3.8, radius: 0.9, swing: 0.35 };
  rig.hips = group(root, [0, 1.15, 0]);
  rig.legL = group(rig.hips, [-0.4, 0, 0]);
  rig.legR = group(rig.hips, [0.4, 0, 0]);
  // a gorilla leg and a penguin leg
  limb(rig.legL, 1.15, 0.2, coat, { foot: (g, len) => part(G.sphereLo, tan, g, { p: [0, -len + 0.06, 0.12], s: [0.24, 0.1, 0.36] }) });
  limb(rig.legR, 1.15, 0.13, fur(0x1d2230, { pile: 0.6 }), { foot: (g, len) => part(G.sphereLo, mat(0xff9a1f), g, { p: [0, -len + 0.06, 0.14], s: [0.2, 0.09, 0.4] }) });

  rig.torso = group(rig.hips, [0, 0, 0]);
  rig.skull = part(G.sphere, coat, rig.torso, { p: [0, 0.95, 0], s: [0.95, 1.0, 0.7] });       // Gerald's body
  part(G.sphere, tan, rig.torso, { p: [0, 0.95, 0.35], s: [0.6, 0.7, 0.38] });
  part(G.cylTaper, cloth(0xc0262d), rig.torso, { p: [0, 1.25, 0], s: [0.85, 0.5, 0.66] });      // his vest, torn
  const tie = group(rig.torso, [0, 1.62, 0.55]);                                             // Gus's bow tie
  part(G.cone, mat(0xf2c230, { metal: 0.5, rough: 0.3 }), tie, { p: [-0.1, 0, 0], s: [0.08, 0.16, 0.08], r: [0, 0, Math.PI / 2] });
  part(G.cone, mat(0xf2c230, { metal: 0.5, rough: 0.3 }), tie, { p: [0.1, 0, 0], s: [0.08, 0.16, 0.08], r: [0, 0, -Math.PI / 2] });
  part(G.cone, fur(0x5b8fc4, { pile: 0.4 }), rig.torso, { p: [0, 1.6, -0.6], s: [0.08, 0.5, 0.35], r: [-0.6, 0, 0] });   // Flipper's fin
  // Chomper's and Gus's tails, out of the bottom of Gerald's back, splayed apart
  const back = { cy: 0.95, ry: 1.0, rz: 0.7 };
  const ct = tailRoot(rig, { x: 0.28, dims: back }), gt = tailRoot(rig, { x: -0.28, dims: back });
  ct.rotation.y = -0.3; gt.rotation.y = 0.3;
  chomperTail(rig, ct);
  gusTail(rig, fur(0x5a341d, { pile: 0.6 }), gt);
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
  for (const m of rig.eyeMats) m.color.copy(rig.eyeColor).multiplyScalar(EYE_GLOW);

  // left arm: Gerald's. right arm: Flipper's flipper, with a claw-machine claw on the end.
  rig.armL = group(rig.torso, [-0.95, 1.5, 0]);
  rig.armR = group(rig.torso, [0.95, 1.5, 0]);
  limb(rig.armL, 1.5, 0.22, coat);
  part(G.sphereLo, tan, rig.armL, { p: [0, -1.55, 0.05], s: [0.26, 0.26, 0.26] });
  limb(rig.armR, 1.2, 0.1, fur(0x5b8fc4, { pile: 0.4 }));
  part(G.sphere, fur(0x5b8fc4, { pile: 0.4 }), rig.armR, { p: [0, -0.7, 0], s: [0.1, 0.6, 0.24] });
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

const BUILDERS = {
  gus: () => buildGus(), gerald: buildGerald, chomper: buildChomper, cranker: buildCranker, flipper: buildFlipper,
  junk: buildJunk, moony: () => buildGus(MOONY_LOOK), sunny: buildSunny,
};

// How far each face sticks out in front of its head (a platypus bill is long), so the
// jumpscare stops just short of it instead of putting the camera inside the bill.
const SNOUT = { gus: 0.85, flipper: 0.7, cranker: 0.5, gerald: 0.5, chomper: 0.45, junk: 1.1, moony: 0.85, sunny: 0.45 };

// The old originals, retired to Parts & Service years ago: same shapes, faded and dusty,
// one eye gone dark.
const oldCache = new Map();
const DUST = new THREE.Color(0x8a8478);
function aged(m) {
  if (!m.isMeshStandardMaterial) return m;
  if (!oldCache.has(m)) {
    // a copy keeps the fur and the scuffs; then it's faded, dusty and matted down
    const a = m.clone();
    a.color.lerp(DUST, 0.45).multiplyScalar(0.8);
    a.roughness = Math.max(0.85, m.roughness);
    a.metalness = Math.min(0.3, m.metalness);
    if (a.userData.fur) a.userData.fur = { pile: a.userData.fur.pile * 0.7 };
    if (a.sheenColor) a.sheenColor.lerp(DUST, 0.6);
    oldCache.set(m, a);
  }
  return oldCache.get(m);
}

// ── Fur ─────────────────────────────────────────────────────────────────
//
// Shell fur: each furry part is drawn again FUR_SHELLS times (one instanced draw), each
// copy pushed a little further out along its normals and cut down to a pattern of strands
// that thins toward the tips. Roots are in shadow, tips catch the light, and some patches
// are matted flat. Shells fade out with distance, where strands would only shimmer.

const FUR_SHELLS = 10;
const FUR_LEN = 0.022;      // metres, at pile 1
const FUR_DENSITY = 8;      // strand-pattern repeats per metre

const SHELL_VERT_PARS = /* glsl */`
uniform float uFurLen;
varying float vShell, vFurFade;
varying vec3 vFurPos, vFurNrm;`;

const SHELL_VERT = /* glsl */`
  vShell = (float(gl_InstanceID) + 1.0) / ${FUR_SHELLS}.0;
  vec3 furScale = vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), length(modelMatrix[2].xyz));
  vFurPos = position * furScale;
  vFurNrm = normal / furScale;
  mvPosition.xyz += normalize(transformedNormal) * uFurLen * vShell;
  gl_Position = projectionMatrix * mvPosition;
  vFurFade = 1.0 - smoothstep(6.0, 10.0, -mvPosition.z);`;

const SHELL_FRAG_PARS = /* glsl */`
uniform sampler2D tStrands;
varying float vShell, vFurFade;
varying vec3 vFurPos, vFurNrm;`;

// Strands are looked up from whichever axis the surface faces, in metres, so they're the
// same size on a big belly and a small hand.
const SHELL_FRAG = /* glsl */`
{
  vec3 an = abs(vFurNrm);
  vec2 fp = an.x > an.y && an.x > an.z ? vFurPos.yz : (an.y > an.z ? vFurPos.xz : vFurPos.xy);
  vec3 st = texture2D(tStrands, fp * ${FUR_DENSITY}.0).rgb;
  float len = st.g * mix(0.45, 1.0, smoothstep(0.25, 0.6, texture2D(tStrands, fp * 0.9).b));
  float need = (vShell * 0.85 + 0.15) / max(vFurFade, 1e-3);
  if (st.r < need || vShell > len) discard;
  diffuseColor.rgb *= mix(0.35, 1.08, vShell);
}`;

const shellCache = new Map();
function shellMat(base) {
  if (shellCache.has(base)) return shellCache.get(base);
  const m = new THREE.MeshStandardMaterial({ color: base.color, map: base.map, roughness: 1, metalness: 0 });
  const len = FUR_LEN * base.userData.fur.pile;
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uFurLen = { value: len };
    shader.uniforms.tStrands = { value: R.fur().strands };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${SHELL_VERT_PARS}`)
      .replace('#include <project_vertex>', `#include <project_vertex>\n${SHELL_VERT}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${SHELL_FRAG_PARS}`)
      .replace('#include <map_fragment>', `#include <map_fragment>\n${SHELL_FRAG}`);
  };
  m.customProgramCacheKey = () => 'fur-shell';
  shellCache.set(base, m);
  return m;
}

function addFur(root) {
  const furry = [];
  root.traverse((o) => { if (o.isMesh && o.material.userData.fur?.pile > 0) furry.push(o); });
  for (const o of furry) {
    const shells = new THREE.InstancedMesh(o.geometry, shellMat(o.material), FUR_SHELLS);
    shells.castShadow = false;
    shells.receiveShadow = true;
    o.add(shells);
  }
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
  if (REALISTIC) addFur(rig.root);
  rig.root.updateMatrixWorld(true);
  const head = new THREE.Vector3();
  rig.head.getWorldPosition(head);
  rig.faceY = head.y + (id === 'junk' ? 0.42 : 0.38);
  rig.snout = SNOUT[id];
  rig.root.traverse((o) => { if (o.isMesh) o.userData.owner = id; });
  return rig;
}

// ── Big teeth, like FNAF 4 ──────────────────────────────────────────────
//
// The designer: "make animatronics have big teeth like in FNAF 4", for In the Closets and
// Max's chapters. Two rows of long, sharp, yellowed teeth: the bottom row stands on the jaw
// and the top row hangs from the head right above it, so they show even with the mouth shut
// and the mouth becomes all teeth when it opens. Placed from the jaw's own size, so it fits
// any animatronic with a jaw.
export function addBigTeeth(rig, { n = 7, size = 1 } = {}) {
  if (!rig.jaw || rig.bigTeeth) return rig;
  rig.bigTeeth = true;
  const jaw = rig.jaw, head = jaw.parent;
  const box = new THREE.Box3(), b = new THREE.Box3();
  for (const m of jaw.children) {
    if (!m.isMesh) continue;
    m.updateMatrix();
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    box.union(b.copy(m.geometry.boundingBox).applyMatrix4(m.matrix));
  }
  if (box.isEmpty()) return rig;
  rig.teeth = [];
  const keep = (m) => { rig.teeth.push(m); return m; };
  const w = Math.max(0.1, (box.max.x - box.min.x) / 2);
  const front = box.max.z, depth = Math.max(0.08, box.max.z - box.min.z);
  const h = Math.max(0.07, w * 0.42) * size, r = h * 0.28;
  const tooth = mat(0xe9dfc2, { rough: 0.35 });
  for (let k = 0; k < n; k++) {
    const u = (k / (n - 1)) * 2 - 1;                     // -1 … 1, side to side
    const x = u * w * 0.8;
    const z = front - depth * 0.12 - u * u * depth * 0.3;   // round the front of the mouth
    const big = 1 - Math.abs(u) * 0.3;                   // biggest at the front
    // bottom row, pointing up out of the jaw
    keep(part(G.cone, tooth, jaw, { p: [x, box.max.y + h * big * 0.4, z], s: [r * big, h * big, r * big] }));
    // top row, hanging from the hinge into the gaps between the bottom ones: tucked inside
    // the jaw while it's shut, all there when it opens
    if (k === n - 1) break;
    const u2 = ((k + 0.5) / (n - 1)) * 2 - 1, x2 = u2 * w * 0.8;
    const z2 = front - depth * 0.12 - u2 * u2 * depth * 0.3 - 0.01, big2 = 1 - Math.abs(u2) * 0.3;
    keep(part(G.cone, tooth, head, {
      p: [jaw.position.x + x2, jaw.position.y + 0.02 - h * big2 * 0.475, jaw.position.z + z2],
      s: [r * big2, h * big2 * 0.95, r * big2], r: [Math.PI, 0, 0],
    }));
  }
  return rig;
}

// Every jumpscare bares the big teeth (the designer: "super scary like FNAF"); the ones that
// don't always have them (outside In the Closets and Max's chapters) hide them again after.
export function scareTeeth(rig, on) {
  if (on && !rig.bigTeeth) { addBigTeeth(rig, { size: 1.15 }); rig.teethForScare = true; }
  if (!rig.teethForScare || !rig.teeth) return;
  for (const m of rig.teeth) m.visible = on;
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
  let torsoX = 0, headX = 0, headY = 0, headZ = 0, jaw = 0, bob = 0, hipDrop = 0, kneeL = 0, kneeR = 0;

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
    case 'give':      // holding something out in the right hand
      armRx = -1.35;
      torsoX = 0.06; headX = 0.12;
      bob = Math.sin(t * 1.4) * 0.01;
      break;
    case 'wave': {
      bob = Math.sin(t * 1.4) * 0.012;
      armRx = -2.7; armRz = -0.5 + Math.sin(t * 6) * 0.35;
      headZ = 0.15;
      jaw = Math.max(0, Math.sin(t * 3)) * 0.2;
      break;
    }
    // ── Emotes (the designer's list; game.js plays them) ──
    case 'thumbs': {
      armRx = -1.25; armRz = -0.25;
      headX = Math.sin(t * 5) * 0.12;
      bob = Math.abs(Math.sin(t * 2.5)) * 0.03;
      jaw = 0.15;
      break;
    }
    case 'point': {       // pointing at something behind you and SCREAMING
      armRx = -1.55; armRz = -0.05;
      armLx = -2.9; armLz = 0.5;
      torsoX = -0.18;
      headY = Math.sin(t * 9) * 0.12; headX = -0.15;
      jaw = 0.9;
      bob = Math.abs(Math.sin(t * 10)) * 0.04;
      break;
    }
    case 'chicken': {     // elbows flapping, knees bobbing, head pecking
      const f = Math.abs(Math.sin(t * 7));
      armLz = 0.45 + f * 0.75; armRz = -(0.45 + f * 0.75);
      armLx = 0.35; armRx = 0.35;
      torsoX = 0.3;
      headX = Math.sin(t * 7) * 0.35;
      hipDrop = Math.abs(Math.sin(t * 3.5)) * 0.07;
      legL = Math.sin(t * 3.5) * 0.3; legR = -legL;
      jaw = f * 0.4;
      break;
    }
    case 'worm': {        // flat on the floor (game.js lays them down), a wave rolling along
      torsoX = Math.sin(t * 5) * 0.4;
      legL = legR = Math.sin(t * 5 + 1.8) * 0.45;
      armLx = armRx = Math.PI;      // arms out past the head
      headX = -0.5 + Math.sin(t * 5 - 1) * 0.25;
      break;
    }
    case 'headspin': {    // upside down (game.js flips them), legs in a V, arms out
      armLz = 1.4; armRz = -1.4;
      headX = 0.1;
      break;
    }
    // ── The Shop's emotes (js/shop.js holds the slice of pizza, the flip and the bed) ──
    case 'pizza': {       // three big bites of pizza, then a thumbs up: "noice"
      if (t < 2.25) {
        const bite = (t % 0.75) / 0.75;
        const up = bite < 0.45 ? bite / 0.45 : 1 - (bite - 0.45) / 0.55;
        armRx = -1.1 - up * 1.3; armRz = -0.35 + up * 0.2;
        headX = 0.12 * up;
        jaw = up > 0.8 ? 0.45 : Math.max(0, Math.sin(t * 14)) * 0.2;
      } else {
        armRx = -0.9; armRz = -0.3;            // still holding what's left
        armLx = -1.25; armLz = 0.25;           // thumbs up with the other hand
        headX = -0.1 + Math.sin(t * 6) * 0.04;
        jaw = t < 2.9 ? 0.35 : 0.05;
      }
      bob = Math.sin(t * 1.4) * 0.012;
      break;
    }
    case 'floss': {       // both arms swinging side to side, in front and behind, hips the other way
      const s = Math.sin(t * 7.5), f = Math.sin(t * 15);
      armLz = 0.25 + s * 0.55; armRz = -0.25 + s * 0.55;
      armLx = f * 0.45; armRx = -f * 0.45;
      headZ = -s * 0.12;
      legL = -s * 0.12; legR = -s * 0.12;
      bob = Math.abs(f) * 0.025;
      break;
    }
    case 'robot': {       // stiff and jerky: snap from pose to pose, like an animatronic
      const q = Math.floor(t * 2);
      const poses = [[-1.57, 0, 0], [-1.57, -1.57, 0.4], [0, -1.57, -0.4], [-2.6, 0, 0.4], [-0.8, -0.8, 0]];
      const [a, b, h] = poses[q % poses.length];
      armLx = a; armRx = b;
      armLz = 0.15; armRz = -0.15;
      headY = h;
      torsoX = 0;
      jaw = q % 2 ? 0.3 : 0;
      bob = (q % 2) * 0.03;
      break;
    }
    case 'backflip': {    // arms swing up, tuck in the air, land and ta-da
      if (t < 0.25) { armLx = armRx = 0.6; hipDrop = 0.12; torsoX = 0.3; }
      else if (t < 1.2) { armLx = armRx = -2.8; legL = legR = -1.1; jaw = 0.4; }
      else { armLx = armRx = -2.9; armLz = 0.6; armRz = -0.6; jaw = 0.3; }
      break;
    }
    case 'sleep': {       // flat on your back (shop.js lays you down), arms by your sides, snoring
      armLz = 0.2; armRz = -0.2;
      headZ = 0.25;
      jaw = 0.15 + Math.max(0, Math.sin(t * Math.PI)) * 0.25;
      bob = Math.sin(t * Math.PI) * 0.01;
      break;
    }
    // Low and sneaking (two players: the other one crouching, the designer asked for it
    // not to look squished): knees forward, hips down, leaning in, head up to see ahead.
    // `amt`: how fast they're creeping along.
    case 'crouch': {
      const s = Math.sin(t) * 0.18 * Math.min(1, amt);
      if (rig.kneeL) {
        // a real squat: thighs forward, shins folded back under, feet flat
        const th = 1.25;
        legL = -th + s; legR = -th - s;
        kneeL = 1.95 - s * 0.6; kneeR = 1.95 + s * 0.6;
        const down = (a, kn) => (Math.cos(-a) + Math.cos(kn + a)) / 2;
        hipDrop = rig.hipY * (1 - Math.max(down(legL, kneeL), down(legR, kneeR))) - 0.01;
        torsoX = 0.5;
        headX = -0.42;
      } else {
        legL = -0.95 + s; legR = -0.95 - s;
        hipDrop = rig.hipY * (1 - Math.cos(0.95)) + 0.015;
        torsoX = 0.45;
        headX = -0.38;
      }
      bob = Math.abs(Math.cos(t)) * 0.015 * Math.min(1, amt);
      armLx = -0.5 - s * 0.8; armRx = -0.5 + s * 0.8;
      armLz = 0.25; armRz = -0.25;
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
  // (the legs only spread for the head spin)
  const spread = pose === 'headspin' ? 0.55 : 0;
  rig.legL.rotation.z = ease(rig.legL.rotation.z, spread, k);
  rig.legR.rotation.z = ease(rig.legR.rotation.z, -spread, k);
  // Knees, for the ones that have them (addKnees: the players' bodies). Walking bends them a
  // little on the way forward; crouching folds them right up.
  if (rig.kneeL) {
    let kl = 0, kr = 0;
    if (pose === 'crouch') { kl = kneeL; kr = kneeR; }
    else if (pose === 'walk' || pose === 'chase') { kl = Math.max(0, -legL) * 0.9 + 0.08; kr = Math.max(0, -legR) * 0.9 + 0.08; }
    else if (pose === 'chicken') { kl = kr = hipDrop * 9; }
    rig.kneeL.rotation.x = ease(rig.kneeL.rotation.x, kl, k);
    rig.kneeR.rotation.x = ease(rig.kneeR.rotation.x, kr, k);
  }
}

// Give someone knees: each leg cut in two at the middle, the shin (and the shoe, and
// anything else below the knee) hanging from a knee joint. Only the players' bodies have
// them (game.js), so the one crouching squats instead of sitting on thin air.
export function addKnees(rig) {
  if (rig.kneeL) return rig;
  const L = rig.hipY;
  for (const side of ['L', 'R']) {
    const leg = rig['leg' + side];
    const meshes = leg.children.filter((c) => c.isMesh);
    if (!meshes.length) return rig;
    const main = meshes.reduce((a, b) => (b.scale.y > a.scale.y ? b : a));
    const knee = group(leg, [0, -L / 2, 0]);
    // the thigh: the top half of the leg where it was
    const top = main.position.y + L / 4;
    main.scale.y *= 0.5;
    main.position.y = top;
    // the shin: the same again, below the knee
    const shin = main.clone();
    shin.position.y = main.position.y;
    knee.add(shin);
    // everything else below the knee moves onto it
    for (const c of [...leg.children]) {
      if (c === knee || c === main) continue;
      if (c.position.y < -L / 2) { leg.remove(c); c.position.y += L / 2; knee.add(c); }
    }
    rig['knee' + side] = knee;
  }
  return rig;
}

// ── Kids ────────────────────────────────────────────────────────────────

const SHIRTS = [0xff5a5f, 0x3ec1d3, 0xffd23f, 0x7ad151, 0xa970ff, 0xff9a1f, 0xff7eb6, 0x2a4fa0];
const SKIN = [0xf1c7a5, 0xd9a07a, 0xa86b45, 0x6e4529, 0xf6d7bf];
const HAIR = [0x2b1a10, 0x6b3e1f, 0xd9b45a, 0x111111, 0xa0461d];

// A person: kids by day, and Jonathan and the manager in the cutscenes. Kids get big heads
// and random clothes; grown-ups are built from the same parts at adult proportions.
export function buildPerson(o) {
  return REALISTIC ? buildPersonReal(o) : buildPersonSimple(o);
}

function buildPersonSimple({
  height: h, shirt, pants, skin, hair = null, cap = null, tie = null, badge = false, glasses = false,
  headScale = 0.075, shoulders = 0.2, shadows = false, bowl = false, beard = null, eye = null, style = null, baggy = false,
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
  addHair(rig.head, hr, 1.0, hair !== null ? mat(hair, { rough: 0.8 }) : null, cap !== null ? mat(cap) : null, G.sphereLo, bowl);
  for (const sx of [-1, 1]) part(G.sphereLo, mat(eye ?? 0x111111), rig.head, { p: [sx * hr * 0.35, hr * 1.05, hr * 0.9], s: [0.015, 0.02, 0.01] });
  if (style && hair !== null) addStyle(rig.head, hr, mat(hair, { rough: 0.8 }), style, G.sphereLo, cap !== null);
  addMouth(rig, mat(0x4a1414), hr, hr * 0.7, hr * 0.92);
  if (beard !== null) addBeard(rig.head, hr, mat(beard, { rough: 0.8 }), G.sphereLo, 0.7);
  if (glasses) for (const sx of [-1, 1]) part(G.torus, mat(0x111111), rig.head, { p: [sx * hr * 0.38, hr * 1.05, hr * 0.95], s: [hr * 0.28, hr * 0.28, hr * 0.28] });
  rig.armL = group(rig.torso, [-(shoulders + 0.03), th * 0.9, 0]);
  rig.armR = group(rig.torso, [shoulders + 0.03, th * 0.9, 0]);
  for (const arm of [rig.armL, rig.armR]) {
    part(G.cyl, sm, arm, { p: [0, -th * 0.25, 0], s: [shoulders * 0.24, th * 0.5, shoulders * 0.24] });
    part(G.cyl, sk, arm, { p: [0, -th * 0.7, 0], s: [shoulders * 0.2, th * 0.45, shoulders * 0.2] });
  }
  if (baggy) addBaggy(rig, sm, th, shoulders, G.sphereLo);
  rig.armBase = { L: [0, 0, 0.15], R: [0, 0, -0.15] };
  root.traverse((o) => { if (o.isMesh) o.castShadow = shadows && SHADOWS; });
  return rig;
}

// Realistic graphics: the same rig with rounded limbs, hands and shoes, fabric clothes,
// soft skin, a face (eyes, brows, nose, ears, mouth) and hair you can see the strands of.
const skinCache = new Map();
function skinMat(color) {
  if (!skinCache.has(color)) {
    skinCache.set(color, new THREE.MeshPhysicalMaterial({
      color, roughness: 0.55, sheen: 0.35, sheenRoughness: 0.8,
      sheenColor: new THREE.Color(color).lerp(new THREE.Color(0xffd0c0), 0.5),
    }));
  }
  return skinCache.get(color);
}
const IRIS = [0x4a2e1a, 0x2f5a8a, 0x3a5a2a, 0x2a1a10];

function buildPersonReal({
  height: h, shirt, pants, skin, hair = null, cap = null, tie = null, badge = false, glasses = false,
  headScale = 0.075, shoulders = 0.2, shadows = false, bowl = false, beard = null, eye = null, style = null, baggy = false,
}) {
  const kid = headScale > 0.09;
  const sm = cloth(shirt), pm = cloth(pants), sk = skinMat(skin);
  const shoe = mat(kid ? 0xf4f1ea : 0x1a1a1a, { rough: 0.5, worn: false });
  const hm = hair !== null ? fur(hair, { pile: 0.45 }) : null;
  const root = new THREE.Group();
  const legLen = h * (kid ? 0.42 : 0.47);
  const rig = { root, height: h, radius: 0.25, swing: 0.6, hipY: legLen };
  rig.hips = group(root, [0, legLen, 0]);
  rig.legL = group(rig.hips, [-shoulders * 0.45, 0, 0]);
  rig.legR = group(rig.hips, [shoulders * 0.45, 0, 0]);
  for (const leg of [rig.legL, rig.legR]) {
    part(G.capsule, pm, leg, { p: [0, -legLen / 2 + 0.02, 0], s: [shoulders * 0.62, legLen * 0.5, shoulders * 0.62] });
    part(G.sphere, shoe, leg, { p: [0, -legLen + 0.045, 0.045], s: [shoulders * 0.32, 0.05, shoulders * 0.7] });
  }
  rig.torso = group(rig.hips, [0, 0, 0]);
  const th = h * 0.3;
  part(G.capsule, sm, rig.torso, { p: [0, th * 0.5, 0], s: [shoulders * 1.62, th * 0.55, shoulders * 1.15] });
  if (tie !== null) part(G.box, cloth(tie), rig.torso, { p: [0, th * 0.55, shoulders * 0.58], s: [0.05, th * 0.7, 0.02] });
  if (badge) part(G.box, mat(0xffd23f, { metal: 0.8, rough: 0.3 }), rig.torso, { p: [-shoulders * 0.35, th * 0.75, shoulders * 0.57], s: [0.06, 0.07, 0.02] });
  rig.neck = group(rig.torso, [0, th, 0]);
  const hr = h * headScale;
  part(G.cyl, sk, rig.neck, { p: [0, 0, 0], s: [hr * 0.38, hr * 0.6, hr * 0.38] });
  rig.head = group(rig.neck, [0, 0.02, 0]);
  const hd = rig.head;
  part(G.sphere, sk, hd, { p: [0, hr, 0], s: [hr * 0.92, hr * 1.08, hr * 0.98] });
  part(G.sphereLo, sk, hd, { p: [0, hr * 0.95, hr * 0.96], s: [hr * 0.12, hr * 0.16, hr * 0.13] });           // nose
  addMouth(rig, mat(0x4a1414, { rough: 0.5, worn: false }), hr, hr * 0.62, hr * 0.89);
  if (beard !== null) addBeard(hd, hr, fur(beard, { pile: 0.6 }), G.sphere, 0.62);
  const iris = mat(eye ?? IRIS[Math.floor(Math.random() * IRIS.length)], { rough: 0.2, worn: false });
  for (const sx of [-1, 1]) {
    part(G.sphereLo, sk, hd, { p: [sx * hr * 0.92, hr * 1.0, 0], s: [hr * 0.12, hr * 0.24, hr * 0.14] });    // ears
    part(G.sphereLo, eyeballMat(), hd, { p: [sx * hr * 0.33, hr * 1.12, hr * 0.8], s: [hr * 0.16, hr * 0.13, hr * 0.1] });
    part(G.sphereLo, iris, hd, { p: [sx * hr * 0.33, hr * 1.12, hr * 0.88], s: [hr * 0.085, hr * 0.085, hr * 0.04] });
    part(G.box, hm || mat(0x3a2a1a, { worn: false }), hd, { p: [sx * hr * 0.34, hr * 1.33, hr * 0.84], s: [hr * 0.3, hr * 0.06, hr * 0.06], r: [0, 0, -sx * 0.12] });
  }
  addHair(hd, hr, 0.92, hm, cap !== null ? cloth(cap) : null, G.sphere, bowl);
  if (style && hm) addStyle(hd, hr, hm, style, G.sphere, cap !== null);
  if (glasses) for (const sx of [-1, 1]) part(G.torus, mat(0x111111, { worn: false }), hd, { p: [sx * hr * 0.34, hr * 1.12, hr * 0.92], s: [hr * 0.26, hr * 0.26, hr * 0.26] });
  rig.armL = group(rig.torso, [-(shoulders + 0.03), th * 0.9, 0]);
  rig.armR = group(rig.torso, [shoulders + 0.03, th * 0.9, 0]);
  for (const arm of [rig.armL, rig.armR]) {
    part(G.capsule, sm, arm, { p: [0, -th * 0.22, 0], s: [shoulders * 0.5, th * 0.27, shoulders * 0.5] });
    part(G.capsule, sk, arm, { p: [0, -th * 0.68, 0], s: [shoulders * 0.36, th * 0.26, shoulders * 0.36] });
    part(G.sphereLo, sk, arm, { p: [0, -th * 0.98, 0.01], s: [shoulders * 0.24, shoulders * 0.3, shoulders * 0.16] });   // hand
  }
  if (baggy) addBaggy(rig, sm, th, shoulders, G.sphere);
  rig.armBase = { L: [0, 0, 0.15], R: [0, 0, -0.15] };
  root.traverse((o) => { if (o.isMesh) o.castShadow = shadows && SHADOWS; });
  addFur(root);
  return rig;
}

// Hair and caps. The head reaches 2.08 head-radii up, and both have to clear that or the
// scalp shows through on top. Hair is a shell over the top and back that stays behind the
// face, plus a fringe in front that stops above the eyebrows (realistic hair is fur, about a
// centimetre deep, so both keep clear of the eyes). A cap sits over the crown, with short
// hair showing under it at the back. A bowl cut swaps the fringe for a dome cut dead
// straight all the way round, just above the eyebrows. `w` is the head's half-width, in
// head radii.
function addHair(head, hr, w, hairMat, capMat, geo, bowl = false) {
  if (hairMat) part(geo, hairMat, head, { p: [0, hr * 1.12, -hr * 0.12], s: [hr * (w + 0.05), hr * (capMat ? 0.98 : 1.04), hr] });
  if (capMat) {
    part(geo, capMat, head, { p: [0, hr * 1.6, -hr * 0.02], s: [hr * (w + 0.1), hr * 0.56, hr * 1.06] });
    part(G.cyl, capMat, head, { p: [0, hr * 1.42, hr * 0.8], s: [hr * 0.8, 0.015, hr * 0.62] });
  } else if (hairMat && bowl) {
    part(G.lid, hairMat, head, { p: [0, hr * 1.4, -hr * 0.04], s: [hr * (w + 0.12), hr * 0.8, hr * 1.08] });
  } else if (hairMat) {
    part(geo, hairMat, head, { p: [0, hr * 1.62, hr * 0.28], s: [hr * (w - 0.08), hr * 0.4, hr * 0.68] });
  }
}

// Hairstyles on top of the plain cut, so everyone looks different (Lost in the Pizzaplex's
// kids — the designer gave each of them their own):
//   perm   tight curls all over the top, sides and back
//   long   long hair down the back past the shoulders, and down the sides of the face
//   spiky  short spikes sticking up off the top
//   messy  a few tufts going every which way
//   locs   short locs hanging down under a cap
function addStyle(head, hr, m, style, geo, capped) {
  if (style === 'perm') {
    for (let ring = 0; ring < 4; ring++) {
      const lat = 0.15 + ring * 0.33;
      const n = 6 + ring * 2;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ring * 0.4;
        const back = Math.cos(a) > 0.35 && ring < 2;      // keep the curls off the face
        if (back) continue;
        const r = hr * (1.08 - lat * 0.2);
        part(geo, m, head, { p: [Math.sin(a) * r * Math.cos(lat), hr * (1.15 + Math.sin(lat) * 0.92), Math.cos(a) * r * Math.cos(lat) * 0.97 - hr * 0.08],
          s: [hr * 0.34, hr * 0.32, hr * 0.34] });
      }
    }
    part(geo, m, head, { p: [0, hr * 2.0, -hr * 0.05], s: [hr * 0.5, hr * 0.28, hr * 0.5] });
  } else if (style === 'long') {
    part(geo, m, head, { p: [0, hr * 0.55, -hr * 0.55], s: [hr * 0.98, hr * 1.35, hr * 0.42] });
    for (const sx of [-1, 1]) part(geo, m, head, { p: [sx * hr * 0.82, hr * 0.62, -hr * 0.05], s: [hr * 0.2, hr * 0.8, hr * 0.42] });
  } else if (style === 'spiky') {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      part(G.cone, m, head, { p: [Math.sin(a) * hr * 0.42, hr * 2.0, Math.cos(a) * hr * 0.38 - hr * 0.05], s: [hr * 0.2, hr * 0.55, hr * 0.2],
        r: [Math.cos(a) * 0.5 - 0.2, 0, -Math.sin(a) * 0.5] });
    }
  } else if (style === 'messy') {
    for (const [x, z, rx, rz] of [[-0.3, 0.3, 0.6, 0.4], [0.25, 0.35, 0.5, -0.5], [0, -0.2, -0.6, 0.1], [0.4, -0.1, -0.2, -0.8], [-0.4, -0.15, -0.3, 0.8]]) {
      part(G.cone, m, head, { p: [x * hr, hr * 2.0, z * hr], s: [hr * 0.24, hr * 0.48, hr * 0.24], r: [rx, 0, rz] });
    }
  } else if (style === 'locs') {
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * 0.55 + (i / 8) * Math.PI * 0.9;
      part(G.cyl, m, head, { p: [Math.cos(a) * hr * 0.92, hr * (capped ? 0.95 : 1.1), Math.sin(a) * hr * 0.9 - hr * 0.1], s: [hr * 0.09, hr * 0.85, hr * 0.09] });
    }
  }
}

// A baggy sweatshirt: a puffier body and sleeves, and a hood bunched up at the back.
// (The designer asked for Thomas to look less fat: the sweatshirt hangs loose, not round —
// only a little wider than he is, and long, down over the top of his trousers.)
function addBaggy(rig, m, th, shoulders, geo) {
  part(geo, m, rig.torso, { p: [0, th * 0.4, 0], s: [shoulders * 0.88, th * 0.58, shoulders * 0.64] });
  part(geo, m, rig.torso, { p: [0, th * 0.95, -shoulders * 0.5], s: [shoulders * 0.7, th * 0.2, shoulders * 0.38] });
  for (const arm of [rig.armL, rig.armR]) part(geo, m, arm, { p: [0, -th * 0.3, 0], s: [shoulders * 0.27, th * 0.42, shoulders * 0.27] });
}

// A big beard under the mouth and a moustache over it, leaving the mouth free to open.
// `mouthY` is where the mouth sits, in head radii.
function addBeard(head, hr, material, geo, mouthY) {
  part(geo, material, head, { p: [0, hr * (mouthY - 0.34), hr * 0.6], s: [hr * 0.58, hr * 0.32, hr * 0.46] });
  for (const sx of [-1, 1]) {
    part(geo, material, head, { p: [sx * hr * 0.15, hr * (mouthY + 0.11), hr * 0.9], s: [hr * 0.2, hr * 0.07, hr * 0.08], r: [0, 0, sx * 0.25] });
  }
}

// A dark mouth on the front of the face. Shut it's a thin line; talking, it opens (setMouth).
function addMouth(rig, material, hr, y, z) {
  rig.mouth = part(G.sphereLo, material, rig.head, { p: [0, y, z], s: [hr * 0.17, hr * 0.03, hr * 0.06] });
  rig.mouthShut = hr * 0.03;
  rig.mouthOpen = hr * 0.13;
}

// How far open someone's mouth is while they talk, 0–1. People open their mouth; the
// animatronics drop their jaw.
export function setMouth(rig, open) {
  if (rig.mouth) rig.mouth.scale.y = rig.mouthShut + (rig.mouthOpen - rig.mouthShut) * open;
  else if (rig.jaw) rig.jaw.rotation.x = open * 0.7 * (rig.jawMax ?? 1);
}

export function buildKid(rand = Math.random) {
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const capped = rand() < 0.35;
  return buildPerson({
    height: 1.05 + rand() * 0.4, headScale: 0.11, shoulders: 0.15,
    shirt: pick(SHIRTS), skin: pick(SKIN), pants: pick([0x2a3a5a, 0x3a3a3a, 0x5a3a2a, 0x1f6f5a]),
    cap: capped ? pick(SHIRTS) : null, hair: pick(HAIR),
  });
}

// Jonathan, as other people see him: fifteen, in his security uniform and cap.
export const buildJonathan = () => buildPerson({
  height: 1.72, shirt: 0x2b4a7a, pants: 0x1f2533, skin: 0xd9a07a, cap: 0x1f3360, hair: 0x3a2414, badge: true,
  shadows: true,
});

// Timmy, the kid who got left behind on Night 2, and his gramma.
export const buildTimmy = () => buildPerson({
  // a white shirt, so he stands out against the ball pit, and a bowl cut
  height: 1.15, headScale: 0.11, shoulders: 0.15, shirt: 0xf4f1ea, pants: 0x2a4a8a,
  skin: 0xf1c7a5, hair: 0x6b3e1f, bowl: true, shadows: true,
});

export const buildGramma = () => buildPerson({
  height: 1.6, shirt: 0x8a4a8a, pants: 0x5a5a6a, skin: 0xf1c7a5, hair: 0xe8e8e8, glasses: true,
  shoulders: 0.2, shadows: true,
});

export const buildManager = () => buildPerson({
  height: 1.82, shirt: 0xf4f1ea, pants: 0x2a2a2a, skin: 0xf1c7a5, hair: 0x8a8a8a, tie: 0xc0262d,
  glasses: true, shoulders: 0.23, shadows: true,
});

// Old John, the old night guard: thirty years on the night shift, a grey beard, his faded
// old uniform and cap, and a cane. His gold badge is in his right hand, out of sight until
// he gives it to Jonathan (`rig.badge`).
export function buildOldJohn() {
  const h = 1.7;
  const rig = buildPerson({
    height: h, shirt: 0x5a6472, pants: 0x34363e, skin: 0xe8c4a8, cap: 0x3e4756, hair: 0xd0d0d0, beard: 0xdedede,
    shadows: true,
  });
  const hand = -h * 0.3 * 0.98;
  const wood = mat(0x5a3a22, { rough: 0.6 });
  part(G.cyl, wood, rig.armL, { p: [0, hand - 0.37, 0.06], s: [0.02, 0.78, 0.02] });
  part(G.sphereLo, wood, rig.armL, { p: [0, hand + 0.02, 0.06], s: [0.04, 0.03, 0.07] });
  rig.badge = part(G.box, mat(0xf2c230, { metal: 0.8, rough: 0.25, emissive: 0x4a3400 }), rig.armR,
    { p: [0, hand - 0.03, 0.09], s: [0.09, 0.11, 0.015] });
  rig.badge.visible = false;
  return rig;
}

// ── Jonathan's hands ────────────────────────────────────────────────────
//
// Built at roughly life size in camera space: +X right, +Y up, -Z forward. The right hand
// holds the current weapon; the left always holds the flashlight.

const UNIFORM = 0x2b4a7a;

// Viewmodel materials glow faintly on their own, so Jonathan's hands are never lost in the
// dark — the flashlight points away from them. They sit right beside the flashlight, so
// their brightness is capped (keeping the colour), or the realistic look's bloom turns
// the left hand into a second sun.
const vmCache = new Map();
const CAP_LIGHT = (shader) => {
  shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>',
    'outgoingLight *= 0.85 / max(0.85, max(outgoingLight.r, max(outgoingLight.g, outgoingLight.b)));\n#include <opaque_fragment>');
};
function vmMat(color, { rough = 0.6, metal = 0.1, glow = 0.22 } = {}) {
  const key = `${color}|${rough}|${metal}|${glow}`;
  if (!vmCache.has(key)) {
    const m = new THREE.MeshStandardMaterial({
      color, roughness: rough, metalness: metal, emissive: color, emissiveIntensity: glow,
    });
    m.onBeforeCompile = CAP_LIGHT;
    vmCache.set(key, m);
  }
  return vmCache.get(key);
}

function hand(parent, x, y, z, look = null) {
  const g = group(parent, [x, y, z]);
  part(G.cyl, vmMat(look ? look.sleeve : UNIFORM, { rough: 0.8 }), g, { p: [0, -0.02, 0.15], s: [0.05, 0.28, 0.05], r: [Math.PI / 2 - 0.15, 0, 0] });
  part(G.box, vmMat(look ? look.skin : 0xd9a07a, { rough: 0.7 }), g, { p: [0, 0, 0], s: [0.075, 0.065, 0.1] });
  // a space suit's glove has a cuff
  if (look && look.cuff) part(G.cyl, vmMat(look.cuff, { rough: 0.5 }), g, { p: [0, -0.005, 0.06], s: [0.06, 0.04, 0.06], r: [Math.PI / 2 - 0.15, 0, 0] });
  return g;
}

// `look`: someone else's sleeves and hands (Jimmy's space suit), or Jonathan's uniform.
export function buildViewmodel(weapon, look = null) {
  const root = new THREE.Group();
  const right = hand(root, 0.3, -0.33, -0.78, look);
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

  vm.left = hand(root, -0.32, -0.35, -0.8, look);
  const torch = group(vm.left, [0, 0.03, -0.06]);
  part(G.cyl, vmMat(0x1a1a1a, { rough: 0.5 }), torch, { p: [0, 0, 0], s: [0.025, 0.2, 0.025], r: [Math.PI / 2, 0, 0] });
  part(G.cylTaper, vmMat(0x1a1a1a, { rough: 0.5 }), torch, { p: [0, 0, -0.12], s: [0.04, 0.05, 0.04], r: [-Math.PI / 2, 0, 0] });
  vm.lens = part(G.cyl, new THREE.MeshBasicMaterial({ color: 0xfff4c8 }), torch, { p: [0, 0, -0.146], s: [0.034, 0.005, 0.034], r: [Math.PI / 2, 0, 0] });

  root.scale.setScalar(0.62 * (look?.scale ?? 1));
  root.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.renderOrder = 10; } });
  return vm;
}

// ── Jimmy ───────────────────────────────────────────────────────────────
//
// Player 2 (the designer's idea): Jonathan's little brother, five, who wants to be an
// astronaut — so he goes everywhere in his little white space suit, with a mission patch, a
// backpack, and a helmet with a gold visor, flipped up so you can see his face.

export const JIMMY_LOOK = { sleeve: 0xe9edf2, skin: 0xd8dde4, cuff: 0x3a6ab8, scale: 0.86 };

export function buildJimmy() {
  const h = 1.08;
  const rig = buildPerson({
    height: h, headScale: 0.11, shoulders: 0.155, shirt: 0xe9edf2, pants: 0xdfe3ea,
    skin: 0xd9a07a, hair: 0x3a2414, shadows: true,
  });
  const hr = h * 0.11;
  rig.headR = hr;
  const suit = mat(0xe9edf2, { rough: 0.55 });
  const trim = mat(0x3a6ab8, { rough: 0.5 });
  const th = h * 0.3;
  // the helmet: a round shell around the head, open at the front, and the gold visor tipped up
  const shell = new THREE.MeshStandardMaterial({ color: 0xf2f4f7, roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide });
  // (three.js puts phi = π/2 at +Z, the way the face looks: leave ±65° of it open)
  const open = Math.PI * 0.36;
  const helm = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14, Math.PI / 2 + open, Math.PI * 2 - open * 2, 0, Math.PI * 0.8), shell);
  helm.position.set(0, hr * 1.02, -hr * 0.04);
  helm.scale.set(hr * 1.42, hr * 1.5, hr * 1.42);
  rig.head.add(helm);
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9a52a, roughness: 0.15, metalness: 0.95 });
  const visor = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 8, Math.PI / 2 - open * 1.05, open * 2.1, Math.PI * 0.1, Math.PI * 0.26), gold);
  visor.position.set(0, hr * 1.02, -hr * 0.04);
  visor.rotation.x = -0.18;
  visor.scale.set(hr * 1.47, hr * 1.55, hr * 1.47);
  rig.head.add(visor);
  // the neck ring, chest panel and mission patch
  part(G.torus, trim, rig.neck, { p: [0, 0.0, 0], s: [hr * 1.05, hr * 1.05, hr * 0.9], r: [Math.PI / 2, 0, 0] });
  part(G.box, mat(0x2a2f3a, { rough: 0.5 }), rig.torso, { p: [0, th * 0.62, 0.155 * 0.6], s: [0.11, 0.07, 0.02] });
  for (const [x, c] of [[-0.03, 0xff3b30], [0, 0x3cff6b], [0.03, 0xffd23f]]) {
    part(G.box, mat(c, { emissive: c }), rig.torso, { p: [x, th * 0.62, 0.155 * 0.6 + 0.012], s: [0.014, 0.014, 0.006] });
  }
  part(G.sphereLo, trim, rig.torso, { p: [-0.1, th * 0.8, 0.07], s: [0.035, 0.035, 0.012] });
  // the backpack (his oxygen, he says)
  part(G.box, suit, rig.torso, { p: [0, th * 0.55, -0.13], s: [0.2, 0.24, 0.1] });
  for (const sx of [-1, 1]) part(G.cyl, trim, rig.torso, { p: [sx * 0.05, th * 0.58, -0.19], s: [0.03, 0.2, 0.03] });
  // blue boots and belt
  for (const leg of [rig.legL, rig.legR]) part(G.box, trim, leg, { p: [0, -rig.hipY + 0.05, 0.03], s: [0.1, 0.1, 0.17] });
  part(G.cyl, trim, rig.hips, { p: [0, 0.01, 0], s: [0.155 * 0.82, 0.04, 0.155 * 0.6] });
  rig.root.traverse((o) => { if (o.isMesh) o.castShadow = SHADOWS; });
  rig.root.updateMatrixWorld(true);
  const head = new THREE.Vector3();
  rig.head.getWorldPosition(head);
  rig.faceY = head.y + hr;
  return rig;
}

// The building blocks, for the characters of When Jonathan Was Five (js/escape/cast.js).
export { biped, part, group, eyes, limb, addFur, G as MODEL_G, buildGus, GUS_LOOK, METAL, DARK_METAL, eyeballMat, skinMat, vmMat, tailRoot, gusTail };
