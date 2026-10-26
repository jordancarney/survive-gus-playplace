// Art preview: the whole PlayPlace and every character, with a set of framed shots for
// checking the look by day and by night. Not part of the game — open dev/preview.html on
// the local server. `?shot=<name>&clean=1` hides the UI, for screenshots.
import * as THREE from 'three';
import { PlayPlace, P } from '../js/map.js';
import { Decor } from '../js/decor.js';
import { Lighting } from '../js/lighting.js';
import { buildAnimatronic, buildKid, buildViewmodel, poseRig, setEyes } from '../js/models.js';
import { FLASHLIGHT } from '../js/config.js';
import { Graphics } from '../js/graphics.js';

const params = new URLSearchParams(location.search);
if (params.has('clean')) document.body.classList.add('clean');

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const graphics = new Graphics(renderer);

const scene = new THREE.Scene();
const place = new PlayPlace();
scene.add(place.build());
const decor = new Decor(place);
scene.add(decor.build());
const lighting = new Lighting(scene, decor, place);

const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 120);
camera.rotation.order = 'YXZ';
scene.add(camera);
const torch = new THREE.SpotLight(0xfff1d0, 0, FLASHLIGHT.range, FLASHLIGHT.angle, 0.45, FLASHLIGHT.decay);
torch.castShadow = true;
torch.shadow.mapSize.set(1024, 1024);
torch.shadow.camera.near = 0.2;
torch.position.set(-0.2, -0.15, 0);
camera.add(torch);
camera.add(torch.target);
torch.target.position.set(0, -0.3, -6);
const vm = buildViewmodel('taser');
camera.add(vm.root);
vm.root.visible = false;
vm.root.userData.noReflect = true;

// ── Cast ────────────────────────────────────────────────────────────────

const cast = {};
for (const id of ['gus', 'gerald', 'chomper', 'cranker', 'flipper', 'junk']) {
  cast[id] = buildAnimatronic(id);
  scene.add(cast[id].root);
}
const kids = [];
for (let i = 0; i < 26; i++) {
  const k = buildKid();
  k.root.position.copy(place.randomPointIn(['D', 'D', 'H', 'B', 'A'][i % 5]));
  k.root.rotation.y = Math.random() * 6.28;
  k.phase = Math.random() * 6;
  scene.add(k.root);
  kids.push(k);
}

const put = (id, px, pz, yaw, pose, y = null) => {
  const r = cast[id];
  const p = P(px, pz);
  r.root.position.set(p.x, y === null ? place.floorAt(p.x, p.z) : y, p.z);
  r.root.rotation.set(0, yaw, 0);
  r.root.visible = true;
  r.pose = pose;
};
const onStage = (pose) => {
  for (const id of ['gus', 'gerald', 'chomper', 'cranker', 'flipper']) {
    const s = decor.stageSpots[id];
    cast[id].root.position.copy(s);
    cast[id].root.rotation.set(0, 0, 0);
    cast[id].root.visible = true;
    cast[id].pose = pose;
  }
  cast.junk.root.visible = false;
};
const look = (px, y, pz, tx, ty, tz) => {
  camera.position.copy(P(px, pz, y));
  camera.lookAt(P(tx, tz, ty));
  const e = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
  yaw = e.y; pitch = e.x;
};

// ── Shots ───────────────────────────────────────────────────────────────

const SHOTS = {
  'stage-day'() {
    lighting.set('day'); torchOn(false); onStage('dance'); kidsOn(true);
    for (const k of kids.slice(0, 14)) k.root.position.copy(P(19 + Math.random() * 22, 7 + Math.random() * 2.6));
    look(25.5, 1.75, 13.5, 30, 1.8, 3.5);
  },
  lineup() {
    lighting.set('day'); torchOn(false); kidsOn(false);
    ['gerald', 'chomper', 'gus', 'cranker', 'flipper'].forEach((id, i) => put(id, 25 + i * 2.5, 5.0, 0, 'idle'));
    cast.junk.root.visible = false;
    look(30, 1.7, 10.2, 30, 1.5, 4.5);
  },
  'stage-night'() {
    lighting.set('night'); torchOn(true); onStage('stare'); kidsOn(false);
    look(30, 1.62, 15, 30, 1.6, 3);
  },
  'hall-night'() {
    lighting.set('night'); torchOn(true); kidsOn(false);
    for (const id in cast) cast[id].root.visible = false;
    put('gus', 31, 27.6, Math.PI / 2, 'walk');
    put('cranker', 21, 26.2, Math.PI / 2, 'idle');
    look(40.5, 1.62, 28.4, 25, 1.5, 27.6);
  },
  arcade() {
    lighting.set('night'); torchOn(true); kidsOn(false);
    for (const id in cast) cast[id].root.visible = false;
    put('chomper', 50.2, 22.8, -0.67, 'chase');
    look(47.5, 1.62, 26.2, 53, 1.2, 15);
  },
  'ballpit-day'() {
    lighting.set('day'); torchOn(false); onStage('dance'); kidsOn(true);
    for (const k of kids.slice(0, 12)) k.root.position.copy(place.randomPointIn('B'));
    put('flipper', 7, 34, 0.6, 'idle', -1.1);
    look(13.2, 2.4, 41.5, 6, 0.3, 32);
  },
  office() {
    lighting.set('night'); torchOn(false); onStage('stare'); kidsOn(false);
    vm.root.visible = true;
    look(36.2, 1.62, 37.2, 31.3, 1.15, 37.2);
  },
  cam() {
    lighting.set('night'); torchOn(false); kidsOn(false);
    for (const id in cast) cast[id].root.visible = false;
    put('cranker', 33, 27.4, -Math.PI / 2, 'walk');
    put('gerald', 22, 26.8, Math.PI / 2, 'walk');
    const c = decor.cams[7];
    // step out of the camera housing so we see what the lens sees
    camera.position.copy(c.pos).addScaledVector(c.look.clone().sub(c.pos).normalize(), 0.45);
    camera.lookAt(c.look);
    camOn = true;
    lighting.setCams(true);
  },
  junk() {
    lighting.set('night'); torchOn(true); kidsOn(false);
    for (const id in cast) cast[id].root.visible = false;
    put('gerald', 4.6, 21.4, 0.4, 'limp', 0.25);
    cast.gerald.root.rotation.set(-Math.PI / 2 + 0.15, 0.4, 0, 'YXZ');
    put('chomper', 9.5, 18.5, -2.2, 'stare');
    look(12.6, 1.62, 16.2, 4.5, 0.6, 21.4);
  },
  jumpscare() {
    lighting.set('night'); torchOn(true); kidsOn(false);
    for (const id in cast) cast[id].root.visible = false;
    put('gus', 30, 27.0, 0, 'scare');
    look(30, 1.62, 28.9, 30, 1.95, 27.0);
  },
  'junk-monster'() {
    lighting.set('blackout'); torchOn(true); kidsOn(false);
    for (const id in cast) cast[id].root.visible = false;
    put('junk', 6, 19, 0.5, 'chase');
    look(12.5, 1.62, 22.5, 6, 2.2, 19);
  },
  'party-day'() {
    lighting.set('day'); torchOn(false); onStage('dance'); kidsOn(true);
    for (const k of kids.slice(0, 10)) k.root.position.copy(place.randomPointIn('P'));
    look(47, 1.8, 10.8, 54, 1.0, 3);
  },
};

let yaw = 0, pitch = 0, camOn = false;
function torchOn(on) { torch.intensity = on ? FLASHLIGHT.intensity : 0; vm.root.visible = on; }
function kidsOn(on) { for (const k of kids) k.root.visible = on; }

function shot(name) {
  camOn = false;
  lighting.setCams(false);
  document.body.classList.remove('cam');
  for (const id in cast) cast[id].root.rotation.set(0, cast[id].root.rotation.y, 0);
  (SHOTS[name] || SHOTS['stage-day'])();
  document.body.classList.toggle('cam', camOn);
  for (const id in cast) setEyes(cast[id], lighting.mode === 'day' && cast[id].pose === 'dance' ? 'dim' : 'on');
  for (const b of bar.children) b.classList.toggle('on', b.textContent === name);
}

const bar = document.getElementById('bar');
for (const name of Object.keys(SHOTS)) {
  const b = document.createElement('button');
  b.textContent = name;
  b.onclick = () => shot(name);
  bar.appendChild(b);
}

// ── Free look ───────────────────────────────────────────────────────────

const keys = new Set();
addEventListener('keydown', (e) => keys.add(e.code));
addEventListener('keyup', (e) => keys.delete(e.code));
let drag = null;
canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; });
addEventListener('pointerup', () => { drag = null; });
addEventListener('pointermove', (e) => {
  if (!drag) return;
  yaw -= (e.clientX - drag.x) * 0.004;
  pitch = Math.max(-1.5, Math.min(1.5, pitch - (e.clientY - drag.y) * 0.004));
  drag = { x: e.clientX, y: e.clientY };
});

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  graphics.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
graphics.prepare(scene);
resize();
shot(params.get('shot') || 'stage-day');

const clock = new THREE.Clock();
let t = 0;
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, clock.getDelta());
  t += dt;
  if (!camOn) {
    camera.rotation.set(pitch, yaw, 0);
    const f = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const r = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const sp = keys.has('ShiftLeft') ? 12 : 5;
    if (keys.has('KeyW')) camera.position.addScaledVector(f, sp * dt);
    if (keys.has('KeyS')) camera.position.addScaledVector(f, -sp * dt);
    if (keys.has('KeyA')) camera.position.addScaledVector(r, -sp * dt);
    if (keys.has('KeyD')) camera.position.addScaledVector(r, sp * dt);
    if (keys.has('KeyQ')) camera.position.y -= sp * dt;
    if (keys.has('KeyE')) camera.position.y += sp * dt;
  }
  for (const id in cast) {
    const c = cast[id];
    if (c.root.visible) poseRig(c, c.pose, t * (c.pose === 'walk' || c.pose === 'chase' ? 6 : 1) + id.length, 1, dt);
  }
  for (const k of kids) {
    if (!k.root.visible) continue;
    poseRig(k, 'walk', t * 7 + k.phase, 0.8, dt);
  }
  decor.update(dt, t, () => false);
  lighting.update(dt);
  graphics.render(scene, camera, { spot: torch, dt });
}
frame();

window.__preview = { scene, camera, cast, place, decor, lighting, shot };
