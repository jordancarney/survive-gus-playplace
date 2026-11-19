// Jonathan: movement, camera, stamina, the flashlight, and the hands you see on screen.
//
// What he does with the weapon in his hand lives in weapons.js; what he can press E on is
// worked out by the game, which knows about every machine and animatronic.
import * as THREE from 'three';
import { PLAYER, KID, FLASHLIGHT, SHADOWS, GLOW, weaponById, hasGear } from './config.js';
import { input } from './input.js';
import { buildViewmodel } from './models.js';
import { resolveCircle } from './physics.js';
import { sfx } from './audio.js';
import { SHOP } from './shop.js';

const VM_HOME = new THREE.Vector3(0, 0, 0);

export class Player {
  // `ctl`: what this player presses — the shared `input` when one is playing, or their own
  // Controls (coop.js) when two are.
  constructor(game, camera, { ctl = input, index = 0 } = {}) {
    this.game = game;
    this.camera = camera;
    this.ctl = ctl;
    this.index = index;
    this.out = false;           // caught, with the other player still going: out until morning
    // (Jimmy, player 2: his own size and his own space-suit hands, everywhere)
    this.fixedSizes = null;
    this.look = null;

    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0;
    this.height = PLAYER.eyeHeight;
    this.moving = 0;

    this.stamina = PLAYER.stamina;
    this.maxStamina = PLAYER.stamina;
    this.winded = false;        // ran out: no sprinting until half full again
    this.sprinting = false;

    this.battery = FLASHLIGHT.battery;
    this.lightOn = true;
    this.bigLight = false;

    this.weapons = ['taser'];
    this.slot = 0;
    this.cool = { taser: 0, knife: 0, magnum: 0, baseball: 0 };
    this.balls = 0;
    this.ammo = 0;
    this.carrying = null;
    this.dazed = 0;
    this.useAnim = 0;

    this.bobPhase = 0;
    this.bob = 0;
    this.shake = 0;

    this.vmGroup = new THREE.Group();
    this.vmGroup.userData.noReflect = true;   // no floating hands in the shiny floor
    this.camera.add(this.vmGroup);
    this.vm = null;

    // The flashlight hangs off the camera a little to the left — where the hand is — so the
    // shadows it throws are offset and move as you turn.
    this.flashlight = new THREE.SpotLight(0xfff1d0, FLASHLIGHT.intensity, FLASHLIGHT.range, FLASHLIGHT.angle, 0.45, FLASHLIGHT.decay);
    this.flashlight.position.set(-0.22, -0.12, 0);
    this.flashlight.target.position.set(-0.05, -0.08, -4);
    this.camera.add(this.flashlight, this.flashlight.target);
    if (SHADOWS) {
      this.flashlight.castShadow = true;
      this.flashlight.shadow.mapSize.set(1024, 1024);
      this.flashlight.shadow.camera.near = 0.3;
      this.flashlight.shadow.camera.far = 30;
      this.flashlight.shadow.bias = -0.0008;
    }
    this.lightVisible = true;   // false while on the cameras, or in daylight
    // When Jonathan Was Five: he's a little kid (KID sizes and speeds), and his hands are
    // built by the story mode instead of buildViewmodel.
    this.kid = false;
    this.sizes = null;
    this.vmBuild = null;
    // In When Jonathan Was Five's box (the designer wanted to walk around in it, like Rainbow
    // Friends): slow, low, and no running.
    this.inBox = false;
  }

  // Sizes and speeds: a teenager, or Jonathan at five — or, in Lost in the Pizzaplex, whoever
  // the chapter's about (`sizes`, set by the story).
  get S() { return this.fixedSizes || this.sizes || (this.kid ? KID : PLAYER); }

  get weapon() { return weaponById(this.weapons[this.slot]); }

  // A fresh start: called at the top of every night and every day.
  reset(at, yaw, night) {
    this.pos.copy(at);
    this.vel.set(0, 0, 0);
    this.yaw = yaw;
    this.pitch = 0;
    this.maxStamina = PLAYER.stamina * (hasGear(night, 'shoes') ? 2 : 1);
    this.stamina = this.maxStamina;
    this.winded = false;
    this.crouching = false;
    this.inBox = false;
    this.height = this.S.eyeHeight;
    this.battery = FLASHLIGHT.battery;
    this.lightOn = true;
    this.bigLight = hasGear(night, 'bigLight');
    const taser = weaponById('taser');
    const mk2 = hasGear(night, 'taser2');
    const gear = this.game.diff.gear;
    this.taserRecharge = taser.recharge * (mk2 ? 0.5 : 1) * gear;
    this.taserTopUp = taser.topUp * (mk2 ? 0.5 : 1) * gear;
    this.taserRange = taser.range * (mk2 ? 1.45 : 1);
    this.taserCharges = taser.charges;
    this.taserEmpty = 0;      // counts down while recharging from empty
    this.taserIdle = 0;       // time since the last zap, for topping up
    this.flashlight.angle = FLASHLIGHT.angle * (this.bigLight ? 1.3 : 1);
    this.flashlight.distance = FLASHLIGHT.range * (this.bigLight ? 1.3 : 1);
    this.carrying = null;
    this.dazed = 0;
    for (const k of Object.keys(this.cool)) this.cool[k] = 0;
    this.balls = weaponById('baseball').count;
    this.ammo = weaponById('magnum').ammo;
    this.slot = 0;
    this.emote = null;
    this.wheel = null;
  }

  setWeapons(ids) {
    this.weapons = ids.slice();
    if (this.slot >= this.weapons.length) this.slot = 0;
    this.rebuildViewmodel();
  }

  selectSlot(i) {
    if (i < 0 || i >= this.weapons.length || i === this.slot) return;
    this.slot = i;
    this.rebuildViewmodel();
    sfx.ui();
  }

  rebuildViewmodel() {
    if (this.vm) this.vmGroup.remove(this.vm.root);
    this.vm = this.vmBuild ? this.vmBuild() : buildViewmodel(this.carrying ? 'none' : this.weapons[this.slot], this.look);
    this.vmGroup.add(this.vm.root);
  }

  eye() { return new THREE.Vector3(this.pos.x, this.pos.y + this.height, this.pos.z); }

  // Crouching hides you from everyone but Gus. You can't crouch while dragging one.
  toggleCrouch() {
    if (this.carrying) { this.game.hud.toast(`Let go of ${this.carrying.name} first!`); return; }
    this.crouching = !this.crouching;
    if (this.crouching) this.skating = false;   // (off the skateboard)
    sfx.ui();
  }

  aimDir() {
    const cp = Math.cos(this.pitch);
    return new THREE.Vector3(-Math.sin(this.yaw) * cp, Math.sin(this.pitch), -Math.cos(this.yaw) * cp);
  }

  forward2() { return { x: -Math.sin(this.yaw), z: -Math.cos(this.yaw) }; }

  // ── Update ────────────────────────────────────────────────────────────

  update(dt, { canMove = true, canLook = true } = {}) {
    if (canLook) this.turn(dt);
    else this.ctl.drainLook();
    this.move(dt, canMove);
    this.flash(dt);
    for (const k of Object.keys(this.cool)) this.cool[k] = Math.max(0, this.cool[k] - dt);
    this.taserTick(dt);
    this.dazed = Math.max(0, this.dazed - dt);
    this.useAnim = Math.max(0, this.useAnim - dt * 4);
    this.shake = Math.max(0, this.shake - dt * 2.5);
    this.updateCamera(dt);
  }

  turn(dt = 1 / 60) {
    const { dx, dy, level } = this.ctl.drainLook();
    this.yaw -= dx * PLAYER.mouseSensitivity;
    this.pitch -= dy * PLAYER.mouseSensitivity;
    // (the arrow keys can't look up or down, so the view drifts back to level)
    if (level) this.pitch *= 1 - Math.min(1, dt * 2.5);
    this.pitch = Math.max(-PLAYER.maxPitch, Math.min(PLAYER.maxPitch, this.pitch));
  }

  addLook(dx, dy) {   // touch controls
    this.yaw -= dx * PLAYER.touchLookSensitivity;
    this.pitch -= dy * PLAYER.touchLookSensitivity;
    this.pitch = Math.max(-PLAYER.maxPitch, Math.min(PLAYER.maxPitch, this.pitch));
  }

  move(dt, canMove) {
    let fx = 0, fz = 0;
    const ctl = this.ctl;
    const stick = canMove && ctl.moveAxis ? ctl.moveAxis() : null;
    if (stick) { fx = stick.x; fz = stick.z; }
    else if (canMove) {
      if (ctl.down('forward')) fz -= 1;
      if (ctl.down('back')) fz += 1;
      // (player 2's left and right arrows turn instead)
      if (!ctl.turns) {
        if (ctl.down('left')) fx -= 1;
        if (ctl.down('right')) fx += 1;
      }
    }
    let len = Math.hypot(fx, fz);
    if (len > 1) { fx /= len; fz /= len; len = 1; }
    else if (len > 0 && !stick) { fx /= len; fz /= len; len = 1; }

    // Sprinting drains stamina; run it dry and you're winded until it's half back.
    // (no running in the Gus mask, and no need on a skateboard)
    const wantSprint = canMove && ctl.down('sprint') && len > 0 && !this.carrying && !this.winded && !this.crouching && !this.inBox &&
      !this.masked && !this.skating;
    this.sprinting = wantSprint && this.stamina > 0;
    if (this.sprinting) {
      if (!this.game.diff.unlimited) this.stamina = Math.max(0, this.stamina - dt);
      if (this.stamina === 0) this.winded = true;
    } else {
      this.stamina = Math.min(this.maxStamina, this.stamina + PLAYER.staminaRegen * dt);
      if (this.winded && this.stamina > this.maxStamina * 0.5) this.winded = false;
    }

    const place = this.game.place;
    const S = this.S;
    let speed = this.inBox ? S.crouchSpeed * 1.25 : this.carrying ? S.carrySpeed : this.crouching ? S.crouchSpeed
      : this.sprinting ? S.sprintSpeed : this.skating ? S.walkSpeed * SHOP.skateSpeed : S.walkSpeed;
    const wantHeight = this.inBox ? 0.72 : this.crouching ? S.crouchHeight : S.eyeHeight;
    this.height += (wantHeight - this.height) * Math.min(1, dt * 10);
    if (place.inSlowZone(this.pos.x, this.pos.z)) speed *= PLAYER.ballPitSpeed;
    if (this.dazed > 0) speed *= 0.45;

    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    const wishX = -fz * -sin + fx * cos;
    const wishZ = -fz * -cos + fx * -sin;

    this.vel.x += wishX * PLAYER.accel * dt;
    this.vel.z += wishZ * PLAYER.accel * dt;
    const hs = Math.hypot(this.vel.x, this.vel.z);
    if (stick) speed *= Math.max(0.35, len);
    if (hs > speed) { this.vel.x *= speed / hs; this.vel.z *= speed / hs; }
    if (len === 0) {
      const drop = Math.max(0, hs - PLAYER.friction * dt * Math.max(hs, 3)) / Math.max(hs, 1e-6);
      this.vel.x *= drop; this.vel.z *= drop;
    }

    const nx = this.pos.x + this.vel.x * dt;
    const nz = this.pos.z + this.vel.z * dt;
    const solved = resolveCircle(place.colliders, nx, nz, this.inBox ? 0.5 : S.radius, this.pos.y + 0.36, this.pos.y + Math.max(this.height, 0.95));
    if (Math.abs(solved.x - nx) > 1e-4) this.vel.x *= 0.2;
    if (Math.abs(solved.z - nz) > 1e-4) this.vel.z *= 0.2;
    this.pos.x = solved.x;
    this.pos.z = solved.z;
    // the stage and the karaoke riser are low enough to just step onto
    this.pos.y += (place.floorAt(this.pos.x, this.pos.z) - this.pos.y) * Math.min(1, dt * 14);

    this.moving = Math.hypot(this.vel.x, this.vel.z) / S.walkSpeed;
    this.bobPhase += dt * (7 + this.moving * 4);
    this.bob += (Math.min(1.4, this.moving) - this.bob) * Math.min(1, dt * 8);
  }

  flash(dt) {
    const inOffice = this.game.place.roomAt(this.pos.x, this.pos.z) === 'O';
    const drain = FLASHLIGHT.drain * (this.bigLight ? 0.5 : 1) * this.game.diff.gear;
    if (this.lightOn && this.battery > 0 && !this.game.diff.unlimited) {
      this.battery = Math.max(0, this.battery - drain * dt);
      if (this.battery === 0) { this.lightOn = false; sfx.flashlight(); }
    }
    if (inOffice) this.battery = Math.min(FLASHLIGHT.battery, this.battery + FLASHLIGHT.officeRegen * dt);
    else if (!this.lightOn) this.battery = Math.min(FLASHLIGHT.battery, this.battery + FLASHLIGHT.regen * dt);

    let k = this.lightOn && this.lightVisible ? 1 : 0;
    // a dying battery flickers
    if (k && this.battery < 15 && Math.random() < 0.08) k = 0.2;
    this.flashlight.intensity = FLASHLIGHT.intensity * (this.bigLight ? 1.5 : 1) * k;
    if (this.vm && this.vm.lens) this.vm.lens.material.color.set(this.lightOn ? 0xfff4c8 : 0x333333).multiplyScalar(this.lightOn ? GLOW * 0.5 : 1);
  }

  // Empty: a full recharge. Not empty: one zap back every few seconds of not zapping.
  taserTick(dt) {
    const max = weaponById('taser').charges;
    if (this.taserEmpty > 0) {
      this.taserEmpty -= dt;
      if (this.taserEmpty <= 0) { this.taserCharges = max; sfx.recharged(); }
      return;
    }
    this.taserIdle += dt;
    if (this.taserCharges < max && this.taserIdle >= this.taserTopUp) {
      this.taserCharges++;
      this.taserIdle = 0;
    }
  }

  useTaserCharge() {
    if (this.game.diff.unlimited) return;
    this.taserCharges--;
    this.taserIdle = 0;
    if (this.taserCharges <= 0) { this.taserCharges = 0; this.taserEmpty = this.taserRecharge; }
  }

  toggleLight() {
    if (!this.lightOn && this.battery < 3) { sfx.zapEmpty(); return; }
    this.lightOn = !this.lightOn;
    sfx.flashlight();
  }

  updateCamera() {
    const bobY = Math.sin(this.bobPhase * 2) * 0.035 * this.bob;
    const bobX = Math.cos(this.bobPhase) * 0.025 * this.bob;
    const sh = this.shake * this.shake;
    this.camera.position.set(
      this.pos.x + (Math.random() - 0.5) * sh * 0.2,
      this.pos.y + this.height + bobY + (Math.random() - 0.5) * sh * 0.2,
      this.pos.z,
    );
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    // (a tall half of a split screen crops the sides, so the hands come in a little smaller)
    const vs = this.game.split && this.game.splitDir === 'v' ? 0.8 : 1;
    this.vmGroup.scale.setScalar(vs);
    this.vmGroup.position.set(VM_HOME.x + bobX * 0.6, VM_HOME.y + bobY * 0.6 - this.useAnim * 0.02 + (1 - vs) * 0.05, VM_HOME.z + this.useAnim * 0.06);
    this.vmGroup.rotation.x = this.useAnim * 0.35;
  }
}
