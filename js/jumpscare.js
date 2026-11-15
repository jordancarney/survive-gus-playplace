// The jumpscare, done the way FNAF does it (the designer asked for "like the real FNAF game"):
//
//   1. the lunge   it jumps the last metre and a half into your face in a split second
//   2. the scream  right up against the camera, filling the screen, mouth wide open, the
//                  whole head jerking about like it's glitching, an electronic screech
//   3. static      the picture cuts to TV static for a moment
//
// and then the GOTCHA screen. The main game (game.js) and both story modes (escape/mode.js)
// use this, so every scare in the game is the same.
import * as THREE from 'three';
import { setMouth } from './models.js';
import { sfx } from './audio.js';

const $ = (id) => document.getElementById(id);

export const LUNGE = 0.14;        // seconds from where it was to right in your face
export const STATIC = 0.85;       // seconds of static afterwards

// How long the face stays in yours (Nightmare holds it longer).
export const holdFor = (nightmare) => (nightmare ? 1.6 : 1.1);

const j = (s) => (Math.random() - 0.5) * s;

// Put the animatronic in your face, `t` seconds into the scare. Call before posing it.
export function placeScare(a, cam, player, t) {
  const f = player.forward2();
  const near = a.rig.snout + 0.2;
  const k = Math.min(1, t / LUNGE);
  const ease = 1 - (1 - k) * (1 - k) * (1 - k);
  const d = near + 1.5 * (1 - ease);
  const shake = t < LUNGE ? 0.015 : 0.05;
  const eyeH = a.rig.faceY - 0.04;
  a.pos.set(cam.position.x + f.x * d + j(shake), 0, cam.position.z + f.z * d + j(shake));
  a.yaw = Math.atan2(-f.x, -f.z);
  a.root.visible = true;
  a.root.position.set(a.pos.x, cam.position.y - eyeH + j(shake * 1.6) - (1 - ease) * 0.3, a.pos.z);
  a.root.rotation.set(j(0.07), a.yaw + j(0.1), j(0.1));
  return { f, near };
}

// After posing: the head jerks and the mouth is wide open. Then light the face up — in FNAF
// you see every bit of it.
export function finishScare(a, cam, f, near, t, effects) {
  const h = a.rig.head;
  if (h) {
    h.rotation.x += j(0.3);
    h.rotation.y += j(0.25);
    h.rotation.z += j(0.3);
  }
  setMouth(a.rig, 0.8 + Math.random() * 0.2);
  const lamp = cam.position.clone().addScaledVector(new THREE.Vector3(f.x, 0, f.z), near * 0.45);
  lamp.y -= 0.15;
  effects.flashAt(lamp, Math.random() < 0.85 ? 0xfff2e0 : 0xffffff, 3.2 + Math.random() * 1.2, 0.05);
}

// ── Static ──────────────────────────────────────────────────────────────

let canvas = null, ctx = null, img = null;

function staticEl() {
  if (canvas) return canvas;
  canvas = document.createElement('canvas');
  canvas.id = 'scareStatic';
  canvas.className = 'scare-static hidden';
  canvas.width = 200;
  canvas.height = 112;
  ctx = canvas.getContext('2d');
  img = ctx.createImageData(200, 112);
  $('stage').appendChild(canvas);
  return canvas;
}

// `pane`: two playing, the static only fills the half of whoever got caught.
export function showStatic(pane = null) {
  const el = staticEl();
  el.classList.remove('hidden', 'pane-0', 'pane-1');
  if (pane !== null) el.classList.add('pane-' + pane);
  sfx.staticHiss(STATIC);
  drawStatic();
}

export function drawStatic() {
  if (!canvas || canvas.classList.contains('hidden')) return;
  const d = img.data;
  // rolling bands, like a TV losing the signal
  const band = Math.random() * 112;
  for (let i = 0; i < d.length; i += 4) {
    const y = (i / 4 / 200) | 0;
    let v = Math.random() * 255;
    if (Math.abs(y - band) < 6) v = v * 0.5 + 120;
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

export function hideStatic() {
  if (canvas) canvas.classList.add('hidden');
}
