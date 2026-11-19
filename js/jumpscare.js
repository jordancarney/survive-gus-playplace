// The jumpscare, done the way FNAF does it (the designer asked for "like the real FNAF game",
// and then for them to be "x99999999999999999999999999 scarier... super scary like fnaf"):
//
//   1. the lunge   out of nowhere it jumps the last two metres into your face, faster than
//                  you can blink, with a bang
//   2. the scream  right up against the camera, filling the screen, its mouth wide open and
//                  full of big teeth (scareTeeth), eyes gone pitch black with a tiny white dot
//                  in each, then blazing red (creepyEyes). The head jerks about like it's
//                  glitching and it keeps lunging at you, while the screen goes crazy: it
//                  shakes, flashes red, tears into glitch bars and flickers into negative —
//                  under a long, loud, distorted electronic screech (sfx.fnafScream)
//   3. static      the picture cuts to TV static
//
// and then the GOTCHA screen. The main game (game.js) and the story modes (escape/mode.js)
// use this, so every scare in the game is the same.
import * as THREE from 'three';
import { setMouth, scareTeeth, creepyEyes } from './models.js';
import { sfx } from './audio.js';

const $ = (id) => document.getElementById(id);

export const LUNGE = 0.1;         // seconds from where it was to right in your face
export const STATIC = 0.85;       // seconds of static afterwards
const VOID_EYES = 0.3;            // seconds of black eyes before they go red

// How long the face stays in yours (Nightmare holds it longer).
export const holdFor = (nightmare) => (nightmare ? 2.3 : 1.7);

const j = (s) => (Math.random() - 0.5) * s;

// The one doing the scaring right now, so the static can put it back the way it was.
let cur = null;

// Put the animatronic in your face, `t` seconds into the scare. Call before posing it.
export function placeScare(a, cam, player, t) {
  if (!cur || cur.a !== a) startScare(a, player);
  const f = player.forward2();
  const near = a.rig.snout + 0.14;
  const k = Math.min(1, t / LUNGE);
  const ease = 1 - (1 - k) * (1 - k) * (1 - k);
  // ...and once it's there it keeps lunging at you, a spasm every third of a second
  const spasm = t > LUNGE ? Math.max(0, Math.sin((t - LUNGE) * 19)) ** 6 * 0.1 : 0;
  const d = near + 2.2 * (1 - ease) - spasm;
  const shake = t < LUNGE ? 0.02 : 0.09;
  const eyeH = a.rig.faceY - 0.04;
  a.pos.set(cam.position.x + f.x * d + j(shake), 0, cam.position.z + f.z * d + j(shake));
  a.yaw = Math.atan2(-f.x, -f.z);
  a.root.visible = true;
  a.root.position.set(a.pos.x, cam.position.y - eyeH + j(shake * 1.6) - (1 - ease) * 0.35, a.pos.z);
  a.root.rotation.set(j(0.12), a.yaw + j(0.08), j(0.16));
  return { f, near };
}

// After posing: the head jerks, the mouth's open as wide as it goes, the eyes. Then light the
// face up — in FNAF you see every bit of it.
export function finishScare(a, cam, f, near, t, effects) {
  const h = a.rig.head;
  if (h) {
    // (side to side only a little, so you're always looking it in the eyes)
    h.rotation.x += j(0.45);
    h.rotation.y += j(0.18);
    h.rotation.z += j(0.45);
  }
  setMouth(a.rig, 0.9 + Math.random() * 0.1);
  creepyEyes(a.rig, t < VOID_EYES ? 'void' : 'red');
  const lamp = cam.position.clone().addScaledVector(new THREE.Vector3(f.x, 0, f.z), near * 0.45);
  lamp.y -= 0.15;
  const red = t > VOID_EYES && Math.random() < 0.3;
  effects.flashAt(lamp, red ? 0xff3020 : Math.random() < 0.85 ? 0xfff2e0 : 0xffffff, 3.4 + Math.random() * 1.6, 0.05);
}

function startScare(a, player) {
  endScare();
  cur = { a };
  scareTeeth(a.rig, true);
  sfx.scareBang?.();
  // the screen going crazy: all of it playing alone, only your half with two playing
  const g = player.game;
  const pane = g && g.split ? player.index : null;
  const fx = fxEl();
  fx.classList.remove('hidden', 'pane-0', 'pane-1');
  if (pane !== null) fx.classList.add('pane-' + pane);
  document.body.classList.add('scaring');
  document.body.classList.toggle('scaring-all', pane === null);
}

// Back to normal: its eyes and teeth, the screen.
function endScare() {
  if (cur) {
    creepyEyes(cur.a.rig, null);
    scareTeeth(cur.a.rig, false);
    cur = null;
  }
  document.body.classList.remove('scaring', 'scaring-all');
  if (fx) fx.classList.add('hidden');
}

// ── The screen going crazy (style.css: #scareFx, body.scaring) ──────────

let fx = null;
function fxEl() {
  if (fx) return fx;
  fx = document.createElement('div');
  fx.id = 'scareFx';
  fx.className = 'scare-fx hidden';
  fx.innerHTML = '<div class="sfx-red"></div><div class="sfx-bars"></div><div class="sfx-neg"></div>';
  $('stage').appendChild(fx);
  return fx;
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
  endScare();
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
  endScare();
  if (canvas) canvas.classList.add('hidden');
}
