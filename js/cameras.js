// The security camera monitor at Jonathan's desk.
//
// Twelve cameras, each a real viewpoint in the building, rendered live: an animatronic on
// a camera is exactly where it is. The picture is brightened (night vision) and tinted,
// slowly pans back and forth, and fills with static when Chomper has chewed the cable,
// when something big walks right under it, or when the power is out.
import * as THREE from 'three';
import { ROOMS, GRID_W, GRID_H, planOf } from './map.js';
import { sfx } from './audio.js';
import { exitPointerLock, requestPointerLock } from './input.js';

export class CameraSystem {
  constructor(game) {
    this.game = game;
    this.cams = game.decor.cams;
    this.cam = new THREE.PerspectiveCamera(64, 16 / 9, 0.1, 90);
    this.index = 0;
    this.active = false;
    this.t = 0;
    this.static = 0;

    this.ui = document.getElementById('camUI');
    this.nameEl = document.getElementById('camName');
    this.clockEl = document.getElementById('camClock');
    this.offlineEl = document.getElementById('camOffline');
    this.noise = document.getElementById('camNoise');
    this.noise.width = 160; this.noise.height = 90;
    this.nctx = this.noise.getContext('2d');
    this.noiseImg = this.nctx.createImageData(160, 90);
    this.buildMap();
    document.getElementById('btnCamClose').addEventListener('click', () => this.close());

    // The office monitors show the cameras too — one small feed, cycled through all three.
    this.monitorTarget = new THREE.WebGLRenderTarget(256, 144);
    this.monitorCam = new THREE.PerspectiveCamera(64, 16 / 9, 0.1, 60);
    this.monitorTimer = 0;
    this.monitorIndex = 0;
    this.monitorTargets = [0, 1, 2].map(() => new THREE.WebGLRenderTarget(192, 108));
  }

  buildMap() {
    const map = document.getElementById('camMap');
    this.roomEls = {};
    for (const [id, r] of Object.entries(ROOMS)) {
      const el = document.createElement('div');
      el.className = 'room';
      el.style.left = (r.x0 / GRID_W) * 100 + '%';
      el.style.top = (r.z0 / GRID_H) * 100 + '%';
      el.style.width = ((r.x1 - r.x0 + 1) / GRID_W) * 100 + '%';
      el.style.height = ((r.z1 - r.z0 + 1) / GRID_H) * 100 + '%';
      const warn = document.createElement('span');
      warn.className = 'warn';
      el.appendChild(warn);
      map.appendChild(el);
      this.roomEls[id] = { el, warn };
    }
    this.btns = this.cams.map((c, i) => {
      const b = document.createElement('div');
      b.className = 'cam-btn';
      b.textContent = String(c.id).padStart(2, '0');
      const { px, pz } = planOf(c.pos.x, c.pos.z);
      b.style.left = (Math.min(GRID_W - 2, Math.max(2, px)) / GRID_W) * 100 + '%';
      b.style.top = (Math.min(GRID_H - 1.5, Math.max(1.5, pz)) / GRID_H) * 100 + '%';
      b.addEventListener('click', (e) => { e.stopPropagation(); this.switchTo(i); });
      map.appendChild(b);
      return b;
    });
  }

  open() {
    if (this.active) return;
    this.active = true;
    this.ui.classList.remove('hidden');
    this.game.canvas.classList.add('night-vision');
    this.game.lighting.setCams(true);
    this.game.player.lightVisible = false;
    this.game.player.vmGroup.visible = false;
    this.static = 0.8;
    this.game.hud.show(false);
    document.getElementById('clickToPlay').classList.add('hidden');
    sfx.camOpen();
    exitPointerLock();
    this.refresh();
  }

  close() {
    if (!this.active) return;
    this.active = false;
    this.ui.classList.add('hidden');
    this.game.canvas.classList.remove('night-vision');
    this.game.lighting.setCams(false);
    this.game.player.lightVisible = this.game.mode !== 'day';
    this.game.player.vmGroup.visible = true;
    this.game.hud.show(this.game.isPlaying());
    sfx.camClose();
    if (this.game.mode === 'night') requestPointerLock();
  }

  switchTo(i) {
    this.index = (i + this.cams.length) % this.cams.length;
    this.static = 0.85;
    sfx.camSwitch();
    this.refresh();
  }

  get current() { return this.cams[this.index]; }

  offline(c = this.current) { return !this.game.night.power || c.chewed > 0; }

  refresh() {
    const c = this.current;
    this.nameEl.textContent = `CAM ${String(c.id).padStart(2, '0')} · ${c.name.toUpperCase()}`;
    this.btns.forEach((b, i) => {
      b.classList.toggle('on', i === this.index);
      b.classList.toggle('fuzzy', this.offline(this.cams[i]));
    });
  }

  // Aim the camera for cam `c`, with its slow sweep.
  aim(camera, c, t) {
    camera.position.copy(c.pos);
    camera.lookAt(c.look);
    camera.rotateY(Math.sin(t * 0.28 + c.id) * 0.3);
  }

  update(dt) {
    this.t += dt;
    for (const c of this.cams) {
      if (c.chewed > 0) c.chewed = Math.max(0, c.chewed - dt);
      c.led.color.set(this.offline(c) ? 0x220000 : (Math.sin(this.t * 4 + c.id) > 0 ? 0xff2020 : 0x550000));
    }
    if (!this.active) return;

    if (this.game.input.keyPressed('ArrowRight') || this.game.input.keyPressed('KeyD')) this.switchTo(this.index + 1);
    if (this.game.input.keyPressed('ArrowLeft') || this.game.input.keyPressed('KeyA')) this.switchTo(this.index - 1);
    for (let k = 1; k <= 9; k++) if (this.game.input.keyPressed('Digit' + k)) this.switchTo(k - 1);
    if (this.game.input.keyPressed('Digit0')) this.switchTo(9);

    const c = this.current;
    this.aim(this.cam, c, this.t);
    const off = this.offline(c);
    this.offlineEl.classList.toggle('hidden', !off);
    this.offlineEl.textContent = !this.game.night.power ? 'NO POWER' : 'NO SIGNAL';
    this.clockEl.textContent = this.game.night.clockText();

    // Static: always a little, a burst on switching, heavier when something big is right
    // under the camera.
    this.static = Math.max(0, this.static - dt * 3);
    let near = 0;
    for (const a of this.game.allBots()) {
      if (!a.root.visible) continue;
      const d = a.pos.distanceTo(c.pos);
      if (d < 7 && a.speed > 0.3) near = Math.max(near, 0.35 * (1 - d / 7));
    }
    const level = off ? 1 : Math.min(1, 0.1 + this.static + near + (Math.random() < 0.02 ? 0.3 : 0));

    // You can't see the hall behind you while you're on the monitor — so it warns you.
    const close = this.game.allBots().some((a) => a.dangerous && a.root.visible && a.distToPlayer() < 8);
    document.getElementById('camAlert').classList.toggle('hidden', !close);
    this.ui.classList.toggle('danger', close);
    this.drawNoise(level);

    // Anything broken in the room you're looking at gets marked on the map.
    if (!off) {
      for (const m of this.game.machines.list) {
        if (m.broken && m.room === c.room && !m.spotted && m.point.distanceTo(c.pos) < 26) m.spotted = true;
      }
    }
    for (const [id, r] of Object.entries(this.roomEls)) {
      const n = this.game.machines.list.filter((m) => m.broken && m.spotted && m.room === id).length;
      r.warn.textContent = n ? '⚠'.repeat(Math.min(n, 3)) : '';
      r.el.classList.toggle('you', id === 'O');
    }
    this.btns.forEach((b, i) => b.classList.toggle('fuzzy', this.offline(this.cams[i])));
  }

  drawNoise(level) {
    this.noise.style.opacity = String(0.08 + level * 0.9);
    const d = this.noiseImg.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    this.nctx.putImageData(this.noiseImg, 0, 0);
  }

  // Render one office monitor's feed every few frames. Only while you're in the office
  // looking at the desk and not already on the cameras.
  renderMonitors(renderer, scene, dt) {
    const g = this.game;
    if (this.active || g.mode !== 'night' || g.place.roomAt(g.player.pos.x, g.player.pos.z) !== 'O') return;
    this.monitorTimer -= dt;
    if (this.monitorTimer > 0) return;
    this.monitorTimer = 0.2;
    const i = this.monitorIndex;
    this.monitorIndex = (i + 1) % 3;
    const mat = g.decor.monitors[i];
    if (!g.night.power) { mat.map = null; mat.color.set(0x050505); mat.needsUpdate = true; return; }
    const c = this.cams[[0, 6, 7][i]];
    this.aim(this.monitorCam, c, this.t);
    g.lighting.setCams(true);
    const prevFlash = g.player.flashlight.intensity;
    g.player.flashlight.intensity = 0;
    renderer.setRenderTarget(this.monitorTargets[i]);
    renderer.render(scene, this.monitorCam);
    renderer.setRenderTarget(null);
    g.player.flashlight.intensity = prevFlash;
    g.lighting.setCams(false);
    if (mat.map !== this.monitorTargets[i].texture) {
      mat.map = this.monitorTargets[i].texture;
      mat.color.set(0x9fffb0);
      mat.needsUpdate = true;
    }
  }
}
