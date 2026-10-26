// Materials for the buildings and everything in them.
//
// On 'fast' a surface is the original flat Lambert material. On 'real' it's physically
// based: the texture brings its own bumps and shine (realtex.js paints them alongside the
// colour), every surface picks up a little world-space grime so no two metres of wall or
// tabletop are quite the same, dirt gathers near the floor, and floors reflect the room
// (graphics.js renders the mirror image they sample).
import * as THREE from 'three';
import { REALISTIC } from './config.js';
import { floorUniforms } from './graphics.js';
import { surfaceInfo, grime } from './realtex.js';

const DETAIL_VERT_PARS = /* glsl */`
varying vec3 vWPos;
varying vec3 vWNrm;
#ifdef FLOOR_REFLECT
uniform mat4 uReflectMatrix;
varying vec4 vReflect;
#endif`;

const DETAIL_VERT = /* glsl */`
{
  vec4 wp = vec4(transformed, 1.0);
  vec3 wn = objectNormal;
  #ifdef USE_INSTANCING
    wp = instanceMatrix * wp;
    wn = mat3(instanceMatrix) * wn;
  #endif
  wp = modelMatrix * wp;
  vWPos = wp.xyz;
  vWNrm = normalize(mat3(modelMatrix) * wn);
  #ifdef FLOOR_REFLECT
    vReflect = uReflectMatrix * wp;
  #endif
}`;

const DETAIL_FRAG_PARS = /* glsl */`
uniform sampler2D tGrime;
uniform float uGrime;
varying vec3 vWPos;
varying vec3 vWNrm;
float grimeAt;
#ifdef FLOOR_REFLECT
uniform sampler2D tReflect;
uniform float uReflectOn, uReflect;
varying vec4 vReflect;
#endif`;

// Triplanar: sample the grime from whichever axis the surface faces.
const DETAIL_COLOR = /* glsl */`
{
  vec3 bw = pow(abs(normalize(vWNrm)), vec3(4.0));
  bw /= dot(bw, vec3(1.0));
  vec2 gx = texture2D(tGrime, vWPos.zy * 0.21).rg, gy = texture2D(tGrime, vWPos.xz * 0.21).rg, gz = texture2D(tGrime, vWPos.xy * 0.21).rg;
  vec2 gr = gx * bw.x + gy * bw.y + gz * bw.z;
  grimeAt = gr.r * 0.75 + gr.g * 0.25;
  diffuseColor.rgb *= mix(1.0 - 0.3 * uGrime, 1.0 + 0.06 * uGrime, grimeAt);
  // dirt and shadow gather along the bottom of walls and furniture
  float low = (1.0 - smoothstep(0.0, 0.45, vWPos.y)) * (1.0 - bw.y);
  diffuseColor.rgb *= 1.0 - low * 0.3 * uGrime;
}`;

const DETAIL_ROUGH = /* glsl */`
roughnessFactor = clamp(roughnessFactor + (grimeAt - 0.5) * 0.3 * uGrime, 0.04, 1.0);`;

// The mirror image, blurrier where the floor is rougher, stronger at a glancing angle, and
// wobbled by the floor's own bumps.
const FLOOR_REFLECT_FRAG = /* glsl */`
#ifdef FLOOR_REFLECT
if (uReflectOn > 0.5) {
  vec2 ruv = vReflect.xy / vReflect.w + (normal.xy - nonPerturbedNormal.xy) * 0.06;
  vec3 refl = textureLod(tReflect, ruv, roughnessFactor * 7.0).rgb;
  float ndv = clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
  float fres = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
  outgoingLight += refl * uReflect * (0.12 + 0.88 * fres) * (1.0 - roughnessFactor) * (1.0 - roughnessFactor);
}
#endif`;

function detail(m, { floor = false, reflect = 0, grimeAmt = 1 } = {}) {
  if (floor && reflect > 0) m.defines = { ...(m.defines || {}), FLOOR_REFLECT: '' };
  m.onBeforeCompile = (shader) => {
    shader.uniforms.tGrime = { value: grime() };
    shader.uniforms.uGrime = { value: grimeAmt };
    if (floor && reflect > 0) {
      shader.uniforms.tReflect = floorUniforms.tReflect;
      shader.uniforms.uReflectMatrix = floorUniforms.uReflectMatrix;
      shader.uniforms.uReflectOn = floorUniforms.uReflectOn;
      shader.uniforms.uReflect = { value: reflect };
    }
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${DETAIL_VERT_PARS}`)
      .replace('#include <project_vertex>', `#include <project_vertex>\n${DETAIL_VERT}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${DETAIL_FRAG_PARS}`)
      .replace('#include <map_fragment>', `#include <map_fragment>\n${DETAIL_COLOR}`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n${DETAIL_ROUGH}`)
      .replace('#include <opaque_fragment>', `${FLOOR_REFLECT_FRAG}\n#include <opaque_fragment>`);
  };
  m.customProgramCacheKey = () => `surface${floor && reflect > 0 ? '-floor' : ''}`;
  return m;
}

// A building surface or piece of furniture. Takes the same options as a Lambert material,
// plus `floor` (it may reflect) and `rough`/`metal` for untextured things.
export function surface({ color = 0xffffff, map = null, transparent = false, opacity = 1, side = THREE.FrontSide,
                          floor = false, rough = 0.62, metal = 0, grimeAmt = 1 } = {}) {
  if (!REALISTIC) return new THREE.MeshLambertMaterial({ color, map, transparent, opacity, side });
  const info = (map && surfaceInfo.get(map)) || {};
  const m = new THREE.MeshStandardMaterial({
    color, map, transparent, opacity, side,
    roughness: info.roughnessMap ? 1 : rough,
    metalness: metal,
    normalMap: info.normalMap || null,
    roughnessMap: info.roughnessMap || null,
  });
  // A floor that reflects the room shouldn't also reflect the stand-in environment.
  if (floor && info.reflect) m.envMapIntensity = 0.25;
  return detail(m, { floor, reflect: info.reflect || 0, grimeAmt });
}
