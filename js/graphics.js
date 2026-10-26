// The realistic look: every pass that turns the toy box into a real place. Built only when
// the graphics setting is 'real'; on 'fast', render() is a plain renderer.render().
//
//   1. Floor reflections: the scene again from a mirror camera under the floor, at half
//      size, for the polished tiles to reflect (floors and Jonathan's hands are left out).
//   2. The scene into a high-dynamic-range target with a depth texture.
//   3. Ambient occlusion from the depth, at half size and blurred: dark corners, contact
//      shadows under tables and animatronics.
//   4. Bloom from anything brighter than white: eyes, neon, exit signs, light panels.
//   5. One composite: the flashlight's beam ray-marched through dusty air (with the
//      flashlight's own shadows in it), lens fringing, vignette, a film-like highlight
//      roll-off and film grain.
//
// Environment maps (a lit room by day, neon-only by night) give the shiny materials
// something to reflect; Lighting picks one per mood through `scene.userData.env`.
import * as THREE from 'three';
import { REALISTIC } from './config.js';

const QUAD_CAM = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const QUAD_GEO = new THREE.BufferGeometry();
QUAD_GEO.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
QUAD_GEO.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));

const QUAD_VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

// A full-screen shader pass.
function pass(fragmentShader, uniforms, extra = {}) {
  const material = new THREE.ShaderMaterial({
    vertexShader: QUAD_VERT, fragmentShader, uniforms, depthTest: false, depthWrite: false, ...extra,
  });
  const mesh = new THREE.Mesh(QUAD_GEO, material);
  mesh.frustumCulled = false;
  return {
    material,
    u: material.uniforms,
    run(renderer, target) { renderer.setRenderTarget(target); renderer.render(mesh, QUAD_CAM); },
  };
}

const target = (w, h, opts = {}) => new THREE.WebGLRenderTarget(w, h, {
  type: THREE.HalfFloatType, depthBuffer: false, ...opts,
});

// Shared by every pass that rebuilds positions from the depth buffer.
const VIEW_FROM_DEPTH = /* glsl */`
uniform sampler2D tDepth;
uniform mat4 uProjInv;
vec3 viewAt(vec2 uv) {
  float d = texture2D(tDepth, uv).x;
  vec4 v = uProjInv * vec4(vec3(uv, d) * 2.0 - 1.0, 1.0);
  return v.xyz / v.w;
}
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }`;

// ── Ambient occlusion ───────────────────────────────────────────────────

const AO_SAMPLES = 16;
const AO_FRAG = /* glsl */`
${VIEW_FROM_DEPTH}
uniform mat4 uProj;
uniform vec2 uTexel;          // one full-resolution depth texel
uniform vec3 uKernel[${AO_SAMPLES}];
uniform float uRadius;
varying vec2 vUv;
void main() {
  float d = texture2D(tDepth, vUv).x;
  if (d >= 1.0) { gl_FragColor = vec4(1.0, -1e4, 0.0, 1.0); return; }
  vec3 p = viewAt(vUv);
  // The normal from the neighbours, picking the closer one each way so edges stay crisp.
  vec3 pr = viewAt(vUv + vec2(uTexel.x, 0.0)), pl = viewAt(vUv - vec2(uTexel.x, 0.0));
  vec3 pu = viewAt(vUv + vec2(0.0, uTexel.y)), pd = viewAt(vUv - vec2(0.0, uTexel.y));
  vec3 dx = abs(pr.z - p.z) < abs(p.z - pl.z) ? pr - p : p - pl;
  vec3 dy = abs(pu.z - p.z) < abs(p.z - pd.z) ? pu - p : p - pd;
  vec3 n = normalize(cross(dx, dy));
  float a = ign(gl_FragCoord.xy) * 6.2831853;
  vec3 rnd = vec3(cos(a), sin(a), 0.0);
  vec3 t = normalize(rnd - n * dot(rnd, n));
  mat3 tbn = mat3(t, cross(n, t), n);
  float occ = 0.0;
  for (int i = 0; i < ${AO_SAMPLES}; i++) {
    vec3 s = p + tbn * uKernel[i] * uRadius;
    vec4 c = uProj * vec4(s, 1.0);
    vec2 suv = c.xy / c.w * 0.5 + 0.5;
    float sz = viewAt(suv).z;
    float range = smoothstep(0.0, 1.0, uRadius / max(1e-3, abs(p.z - sz)));
    occ += (sz >= s.z + 0.02 ? 1.0 : 0.0) * range;
  }
  gl_FragColor = vec4(1.0 - occ / float(${AO_SAMPLES}), p.z, 0.0, 1.0);
}`;

// A 5×5 blur that won't smear across a depth edge.
const AO_BLUR_FRAG = /* glsl */`
uniform sampler2D tAO;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  vec2 c = texture2D(tAO, vUv).rg;
  float sum = 0.0, wsum = 0.0;
  for (int x = -2; x <= 2; x++) for (int y = -2; y <= 2; y++) {
    vec2 s = texture2D(tAO, vUv + vec2(x, y) * uTexel).rg;
    float w = max(0.0, 1.0 - abs(s.g - c.g) / (0.08 * abs(c.g) + 0.05));
    sum += s.r * w; wsum += w;
  }
  gl_FragColor = vec4(wsum > 0.0 ? sum / wsum : c.r, c.g, 0.0, 1.0);
}`;

// ── Bloom ───────────────────────────────────────────────────────────────

// 13-tap downsample (the Call of Duty one): smooth, no shimmering as things move.
const DOWN13 = /* glsl */`
vec3 down13(sampler2D t, vec2 uv, vec2 px) {
  vec3 a = texture2D(t, uv + px * vec2(-2.0, 2.0)).rgb, b = texture2D(t, uv + px * vec2(0.0, 2.0)).rgb;
  vec3 c = texture2D(t, uv + px * vec2(2.0, 2.0)).rgb, d = texture2D(t, uv + px * vec2(-2.0, 0.0)).rgb;
  vec3 e = texture2D(t, uv).rgb, f = texture2D(t, uv + px * vec2(2.0, 0.0)).rgb;
  vec3 g = texture2D(t, uv + px * vec2(-2.0, -2.0)).rgb, h = texture2D(t, uv + px * vec2(0.0, -2.0)).rgb;
  vec3 i = texture2D(t, uv + px * vec2(2.0, -2.0)).rgb, j = texture2D(t, uv + px * vec2(-1.0, 1.0)).rgb;
  vec3 k = texture2D(t, uv + px * vec2(1.0, 1.0)).rgb, l = texture2D(t, uv + px * vec2(-1.0, -1.0)).rgb;
  vec3 m = texture2D(t, uv + px * vec2(1.0, -1.0)).rgb;
  return e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
}`;

const BLOOM_PREFILTER = /* glsl */`
${DOWN13}
uniform sampler2D tSrc;
uniform vec2 uTexel;
uniform float uThreshold;
varying vec2 vUv;
void main() {
  vec3 c = min(down13(tSrc, vUv, uTexel), vec3(40.0));
  float br = max(c.r, max(c.g, c.b));
  float knee = uThreshold * 0.5;
  float soft = clamp(br - uThreshold + knee, 0.0, 2.0 * knee);
  soft = soft * soft / (4.0 * knee + 1e-4);
  c *= max(soft, br - uThreshold) / max(br, 1e-4);
  gl_FragColor = vec4(c, 1.0);
}`;

const BLOOM_DOWN = /* glsl */`
${DOWN13}
uniform sampler2D tSrc;
uniform vec2 uTexel;
varying vec2 vUv;
void main() { gl_FragColor = vec4(down13(tSrc, vUv, uTexel), 1.0); }`;

// 3×3 tent upsample, added onto the level above.
const BLOOM_UP = /* glsl */`
uniform sampler2D tSrc;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  vec3 s = texture2D(tSrc, vUv).rgb * 4.0;
  s += (texture2D(tSrc, vUv + uTexel * vec2(-1.0, 0.0)).rgb + texture2D(tSrc, vUv + uTexel * vec2(1.0, 0.0)).rgb
      + texture2D(tSrc, vUv + uTexel * vec2(0.0, -1.0)).rgb + texture2D(tSrc, vUv + uTexel * vec2(0.0, 1.0)).rgb) * 2.0;
  s += texture2D(tSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb + texture2D(tSrc, vUv + uTexel * vec2(1.0, -1.0)).rgb
     + texture2D(tSrc, vUv + uTexel * vec2(-1.0, 1.0)).rgb + texture2D(tSrc, vUv + uTexel * vec2(1.0, 1.0)).rgb;
  gl_FragColor = vec4(s / 16.0, 1.0);
}`;

// ── Composite ───────────────────────────────────────────────────────────

const BEAM_STEPS = 28;
const COMPOSITE_FRAG = /* glsl */`
#include <packing>
${VIEW_FROM_DEPTH}
uniform sampler2D tScene, tAO, tBloom, tShadow;
uniform float uAO, uBloom, uGrain, uVignette, uFringe, uTime, uExposure;
uniform mat4 uCamWorld;
uniform float uBeam, uSpotCos, uSpotInner, uSpotRange, uShadowOn;
uniform vec3 uSpotPos, uSpotDir, uSpotColor, uCamPos;
uniform mat4 uShadowMatrix;
varying vec2 vUv;

float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise3(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x), mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x), mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}

// Light scattered toward the eye by dust in the flashlight's cone, along this pixel's ray.
vec3 beam(vec2 uv) {
  vec3 end = (uCamWorld * vec4(viewAt(uv), 1.0)).xyz;
  vec3 ro = uCamPos;
  vec3 rd = end - ro;
  float len = min(length(rd), uSpotRange);
  rd = normalize(rd);
  float stepLen = len / float(${BEAM_STEPS});
  float jitter = ign(gl_FragCoord.xy + fract(uTime * 7.0) * 61.0);
  // Forward scattering: looking down the beam is brighter than looking across it.
  float phase = 0.55 + 0.45 * pow(max(0.0, dot(rd, uSpotDir)), 4.0);
  float acc = 0.0;
  for (int i = 0; i < ${BEAM_STEPS}; i++) {
    vec3 p = ro + rd * (float(i) + jitter) * stepLen;
    vec3 L = p - uSpotPos;
    float dist = length(L);
    float cone = smoothstep(uSpotCos, uSpotInner, dot(L / max(dist, 1e-3), uSpotDir));
    if (cone <= 0.0) continue;
    // fades in a little way from the lens, so the beam doesn't start as a glaring blob
    float fall = pow(clamp(1.0 - dist / uSpotRange, 0.0, 1.0), 2.0) / (1.0 + dist * dist * 0.35) * smoothstep(0.2, 1.6, dist);
    float dust = 0.45 + 0.9 * noise3(p * 2.3 + vec3(0.0, uTime * 0.07, uTime * 0.03));
    float lit = 1.0;
    if (uShadowOn > 0.5) {
      vec4 sc = uShadowMatrix * vec4(p, 1.0);
      sc.xyz /= sc.w;
      if (sc.x > 0.0 && sc.x < 1.0 && sc.y > 0.0 && sc.y < 1.0 && sc.z < 1.0)
        lit = step(sc.z - 0.002, unpackRGBAToDepth(texture2D(tShadow, sc.xy)));
    }
    acc += cone * fall * dust * lit;
  }
  return uSpotColor * acc * stepLen * uBeam * phase;
}

// Linear up to a knee, then a soft shoulder into white, like film. Unlike the usual filmic
// curves it leaves the darks alone: nearly the whole night lives down there.
vec3 shoulder(vec3 c) {
  c *= uExposure;
  float m = max(c.r, max(c.g, c.b));
  const float k = 0.6;
  if (m <= k) return c;
  float y = k + (1.0 - k) * (1.0 - exp(-(m - k) / (1.0 - k)));
  return mix(c * (y / m), vec3(y), smoothstep(1.0, 10.0, m) * 0.7);
}

void main() {
  vec2 uv = vUv;
  vec2 dc = uv - 0.5;
  float r2 = dot(dc, dc);
  // Lens fringing: red and blue drift apart toward the corners, like a cheap real lens.
  vec2 off = dc * r2 * uFringe;
  vec3 col = vec3(texture2D(tScene, uv - off).r, texture2D(tScene, uv).g, texture2D(tScene, uv + off).b);
  col *= mix(1.0, texture2D(tAO, uv).r, uAO);
  if (uBeam > 0.0) col += beam(uv);
  col += texture2D(tBloom, uv).rgb * uBloom;
  col *= 1.0 - uVignette * smoothstep(0.08, 0.55, r2);
  gl_FragColor = vec4(shoulder(col), 1.0);
  #include <colorspace_fragment>
  // Film grain, in display space so it reads the same in the dark and the light.
  float g = fract(sin(dot(gl_FragCoord.xy + fract(uTime) * 97.0, vec2(12.9898, 78.233))) * 43758.5453);
  gl_FragColor.rgb += (g - 0.5) * uGrain;
}`;

// ── Floor reflections ───────────────────────────────────────────────────
//
// Floor materials read these through `floorUniforms`; the mirror pass fills them each frame.

export const floorUniforms = {
  tReflect: { value: null },
  uReflectMatrix: { value: new THREE.Matrix4() },
  uReflectOn: { value: 0 },
};

class FloorMirror {
  constructor() {
    this.rt = target(1, 1, { depthBuffer: true, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
    this.cam = new THREE.PerspectiveCamera();
    this.plane = new THREE.Plane();
    this.clip = new THREE.Vector4();
    this.q = new THREE.Vector4();
    this.v = {
      mirror: new THREE.Vector3(), eye: new THREE.Vector3(), look: new THREE.Vector3(), target: new THREE.Vector3(),
      rot: new THREE.Matrix4(), up: new THREE.Vector3(),
    };
    floorUniforms.tReflect.value = this.rt.texture;
  }

  setSize(w, h) { this.rt.setSize(Math.max(1, w >> 1), Math.max(1, h >> 1)); }

  // The camera reflected in the floor plane (y = 0), with its near plane tilted onto the
  // floor so nothing under it (Flipper in the ball pit) shows up in the reflection.
  render(renderer, scene, camera, hidden) {
    const { eye, look, target: tgt, rot, up } = this.v;
    const normal = new THREE.Vector3(0, 1, 0);
    eye.setFromMatrixPosition(camera.matrixWorld);
    if (eye.y <= 0.01) { floorUniforms.uReflectOn.value = 0; return; }
    rot.extractRotation(camera.matrixWorld);
    look.set(0, 0, -1).applyMatrix4(rot).add(eye);
    const cam = this.cam;
    cam.position.set(eye.x, -eye.y, eye.z);
    tgt.set(look.x, -look.y, look.z);
    up.set(0, 1, 0).applyMatrix4(rot).reflect(normal);
    cam.up.copy(up);
    cam.lookAt(tgt);
    cam.far = camera.far;
    cam.near = camera.near;
    cam.updateMatrixWorld();
    cam.projectionMatrix.copy(camera.projectionMatrix);

    floorUniforms.uReflectMatrix.value.set(
      0.5, 0, 0, 0.5,
      0, 0.5, 0, 0.5,
      0, 0, 0.5, 0.5,
      0, 0, 0, 1,
    ).multiply(cam.projectionMatrix).multiply(cam.matrixWorldInverse);

    this.plane.setFromNormalAndCoplanarPoint(normal, new THREE.Vector3()).applyMatrix4(cam.matrixWorldInverse);
    const c = this.clip.set(this.plane.normal.x, this.plane.normal.y, this.plane.normal.z, this.plane.constant);
    const pm = cam.projectionMatrix.elements;
    this.q.set((Math.sign(c.x) + pm[8]) / pm[0], (Math.sign(c.y) + pm[9]) / pm[5], -1, (1 + pm[10]) / pm[14]);
    c.multiplyScalar(2 / c.dot(this.q));
    pm[2] = c.x; pm[6] = c.y; pm[10] = c.z + 1; pm[14] = c.w;
    cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();

    const was = hidden.map((o) => o.visible);
    for (const o of hidden) o.visible = false;
    floorUniforms.uReflectOn.value = 0;
    renderer.setRenderTarget(this.rt);
    renderer.clear();
    renderer.render(scene, cam);
    hidden.forEach((o, i) => { o.visible = was[i]; });
    floorUniforms.uReflectOn.value = 1;
  }
}

// ── Environment maps ────────────────────────────────────────────────────
//
// A rough stand-in for the PlayPlace for shiny things to reflect: a big dark room with a
// grid of ceiling panels (lit by day) and strips of neon round the walls.

function envRoom(day) {
  const s = new THREE.Scene();
  const box = new THREE.BoxGeometry(1, 1, 1);
  const room = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: day ? 0x6a5a78 : 0x020104, side: THREE.BackSide }));
  room.scale.set(40, 8, 40);
  room.position.y = 3;
  s.add(room);
  const floor = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: day ? 0x8a8690 : 0x010101 }));
  floor.scale.set(40, 0.1, 40);
  floor.position.y = -0.9;
  s.add(floor);
  if (day) {
    const panel = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff6e0).multiplyScalar(6) });
    for (let x = -12; x <= 12; x += 6) for (let z = -12; z <= 12; z += 6) {
      const p = new THREE.Mesh(box, panel);
      p.scale.set(2.4, 0.05, 1.2);
      p.position.set(x, 6.9, z);
      s.add(p);
    }
  }
  const neon = [0xff3fa4, 0x2de2e6, 0xa970ff, 0xffd23f];
  neon.forEach((c, i) => {
    const m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(day ? 1.5 : 0.8) }));
    const a = (i / neon.length) * Math.PI * 2;
    m.position.set(Math.cos(a) * 19.5, 3.5, Math.sin(a) * 19.5);
    m.rotation.y = -a;
    m.scale.set(0.1, 0.25, 14);
    s.add(m);
  });
  return s;
}

// ── The pipeline ────────────────────────────────────────────────────────

export class Graphics {
  constructor(renderer) {
    this.renderer = renderer;
    this.realistic = REALISTIC;
    this.t = 0;
    if (!REALISTIC) return;

    // One shadow-map update per frame, shared by the mirror and the main view.
    renderer.shadowMap.autoUpdate = false;

    this.samples = renderer.getPixelRatio() < 1.5 ? 4 : 0;
    this.scene = target(1, 1, {
      depthBuffer: true, samples: this.samples,
      depthTexture: new THREE.DepthTexture(1, 1, THREE.UnsignedIntType),
    });
    this.ao = target(1, 1);
    this.aoBlur = target(1, 1);
    this.bloomLevels = [];
    for (let i = 0; i < 6; i++) this.bloomLevels.push(target(1, 1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }));
    this.mirror = new FloorMirror();
    this.hidden = [];

    const kernel = [];
    for (let i = 0; i < AO_SAMPLES; i++) {
      const v = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 0.85 + 0.15).normalize();
      const s = i / AO_SAMPLES;
      kernel.push(v.multiplyScalar(Math.random() * (0.1 + 0.9 * s * s) + 0.05));
    }
    const depth = { value: this.scene.depthTexture };
    this.aoPass = pass(AO_FRAG, {
      tDepth: depth, uProjInv: { value: new THREE.Matrix4() }, uProj: { value: new THREE.Matrix4() },
      uTexel: { value: new THREE.Vector2() }, uKernel: { value: kernel }, uRadius: { value: 0.6 },
    });
    this.aoBlurPass = pass(AO_BLUR_FRAG, { tAO: { value: this.ao.texture }, uTexel: { value: new THREE.Vector2() } });
    this.prefilter = pass(BLOOM_PREFILTER, { tSrc: { value: this.scene.texture }, uTexel: { value: new THREE.Vector2() }, uThreshold: { value: 4.0 } });
    this.down = pass(BLOOM_DOWN, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() } });
    this.up = pass(BLOOM_UP, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() } }, {
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
    });
    this.composite = pass(COMPOSITE_FRAG, {
      tScene: { value: this.scene.texture }, tAO: { value: this.aoBlur.texture }, tBloom: { value: this.bloomLevels[0].texture },
      tDepth: depth, tShadow: { value: null },
      uProjInv: { value: new THREE.Matrix4() }, uCamWorld: { value: new THREE.Matrix4() }, uCamPos: { value: new THREE.Vector3() },
      uAO: { value: 0.85 }, uBloom: { value: 0.32 }, uGrain: { value: 0.045 }, uVignette: { value: 0.45 },
      uFringe: { value: 0.012 }, uTime: { value: 0 }, uExposure: { value: 1 },
      uBeam: { value: 0 }, uSpotPos: { value: new THREE.Vector3() }, uSpotDir: { value: new THREE.Vector3() },
      uSpotColor: { value: new THREE.Color() }, uSpotCos: { value: 0.9 }, uSpotInner: { value: 0.95 },
      uSpotRange: { value: 20 }, uShadowOn: { value: 0 }, uShadowMatrix: { value: new THREE.Matrix4() },
    });
  }

  // Environment maps, and the list of things left out of the floor's reflection. Call once
  // the scene is built.
  prepare(scene) {
    if (!this.realistic) return;
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    scene.userData.env = { day: pmrem.fromScene(envRoom(true), 0.04).texture, night: pmrem.fromScene(envRoom(false), 0.04).texture };
    pmrem.dispose();
    this.hidden = [];
    scene.traverse((o) => { if (o.userData.floor || o.userData.noReflect) this.hidden.push(o); });
  }

  setSize(w, h) {
    if (!this.realistic) return;
    const pr = this.renderer.getPixelRatio();
    const W = Math.max(1, Math.round(w * pr)), H = Math.max(1, Math.round(h * pr));
    this.scene.setSize(W, H);
    this.scene.depthTexture.image.width = W;
    this.scene.depthTexture.image.height = H;
    const hw = Math.max(1, W >> 1), hh = Math.max(1, H >> 1);
    this.ao.setSize(hw, hh);
    this.aoBlur.setSize(hw, hh);
    this.aoPass.u.uTexel.value.set(1 / W, 1 / H);
    this.aoBlurPass.u.uTexel.value.set(1 / hw, 1 / hh);
    this.prefilter.u.uTexel.value.set(1 / W, 1 / H);
    let bw = hw, bh = hh;
    for (const l of this.bloomLevels) { l.setSize(Math.max(1, bw), Math.max(1, bh)); bw >>= 1; bh >>= 1; }
    this.mirror.setSize(W, H);
  }

  // `spot` is the flashlight, for the beam through the air.
  render(scene, camera, { spot = null, dt = 0 } = {}) {
    const r = this.renderer;
    if (!this.realistic) { r.render(scene, camera); return; }
    this.t += dt;
    const autoClear = r.autoClear;
    r.autoClear = false;
    r.shadowMap.needsUpdate = true;
    camera.updateMatrixWorld();

    this.mirror.render(r, scene, camera, this.hidden);

    r.setRenderTarget(this.scene);
    r.clear();
    r.render(scene, camera);

    const proj = camera.projectionMatrix, projInv = camera.projectionMatrixInverse;
    this.aoPass.u.uProj.value.copy(proj);
    this.aoPass.u.uProjInv.value.copy(projInv);
    this.aoPass.run(r, this.ao);
    this.aoBlurPass.run(r, this.aoBlur);

    const L = this.bloomLevels;
    this.prefilter.run(r, L[0]);
    for (let i = 1; i < L.length; i++) {
      this.down.u.tSrc.value = L[i - 1].texture;
      this.down.u.uTexel.value.set(1 / L[i - 1].width, 1 / L[i - 1].height);
      this.down.run(r, L[i]);
    }
    for (let i = L.length - 1; i > 0; i--) {
      this.up.u.tSrc.value = L[i].texture;
      this.up.u.uTexel.value.set(1 / L[i].width, 1 / L[i].height);
      this.up.run(r, L[i - 1]);
    }

    const u = this.composite.u;
    u.uProjInv.value.copy(projInv);
    u.uCamWorld.value.copy(camera.matrixWorld);
    u.uCamPos.value.setFromMatrixPosition(camera.matrixWorld);
    u.uTime.value = this.t;
    u.uExposure.value = scene.userData.exposure ?? 1;
    u.uBeam.value = 0;
    if (spot && spot.intensity > 0 && spot.parent) {
      spot.updateMatrixWorld();
      spot.target.updateMatrixWorld();
      u.uSpotPos.value.setFromMatrixPosition(spot.matrixWorld);
      u.uSpotDir.value.setFromMatrixPosition(spot.target.matrixWorld).sub(u.uSpotPos.value).normalize();
      u.uSpotCos.value = Math.cos(spot.angle);
      u.uSpotInner.value = Math.cos(spot.angle * (1 - spot.penumbra * 0.8));
      u.uSpotRange.value = spot.distance || 20;
      u.uSpotColor.value.copy(spot.color).multiplyScalar(spot.intensity * 0.002);
      u.uBeam.value = 1;
      const sm = spot.castShadow && spot.shadow.map;
      u.uShadowOn.value = sm ? 1 : 0;
      if (sm) { u.tShadow.value = sm.texture; u.uShadowMatrix.value.copy(spot.shadow.matrix); }
    }
    r.setRenderTarget(null);
    this.composite.run(r, null);
    r.autoClear = autoClear;
  }
}
