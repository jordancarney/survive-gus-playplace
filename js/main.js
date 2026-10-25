// Boot + fixed-timestep game loop.
import * as THREE from 'three';
import { DEBUG, SHADOWS } from './config.js';
import { initInput, input } from './input.js';
import { audio } from './audio.js';
import { initUpdateCheck } from './updates.js';
import { Game } from './game.js';

const canvas = document.getElementById('game');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: window.devicePixelRatio < 2,   // a retina phone doesn't need MSAA on top
  powerPreference: 'high-performance',
});
// Cap the pixel ratio: a 3× phone display renders 9× the pixels for no visible gain.
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = SHADOWS;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

initInput(canvas);
audio.init();

const game = new Game(renderer, canvas);

// The AudioContext can only start inside a real user gesture.
for (const ev of ['pointerdown', 'keydown', 'touchstart']) {
  addEventListener(ev, () => audio.resume(), { once: false });
}

initUpdateCheck(game);

function resize() {
  const w = innerWidth;
  const h = innerHeight;
  renderer.setSize(w, h, false);
  game.resize(w, h);
}
addEventListener('resize', resize);
addEventListener('orientationchange', resize);
if (window.visualViewport) visualViewport.addEventListener('resize', resize);
// Catches anything the events miss: first layout, mobile chrome sliding away, rotation.
if (window.ResizeObserver) new ResizeObserver(resize).observe(document.documentElement);
resize();

game.toTitle();

const STEP = 1 / 60;
const MAX_CATCHUP = 0.1;   // after a tab-switch, skip the backlog instead of fast-forwarding
let last = performance.now();
let acc = 0;

function frame(nowMs) {
  requestAnimationFrame(frame);
  const dt = Math.min(MAX_CATCHUP, (nowMs - last) / 1000);
  last = nowMs;
  acc += dt;
  while (acc >= STEP) {
    game.update(STEP);
    input.endFrame();
    acc -= STEP;
  }
  game.render(dt);
}
requestAnimationFrame(frame);

if (DEBUG) {
  window.__three = THREE;
  window.__input = input;
  console.info('[survive-gus-playplace] debug mode — window.__game is the running game');
}
