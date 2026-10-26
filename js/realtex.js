// The realistic look's textures: the same surfaces textures.js paints, at real-world detail
// (grout, scuffs, carpet fibres, wood grain, cinder block, acoustic ceiling tiles). Each one
// also gets a height map, turned into a normal map so light rakes across the bumps, and a
// roughness map so waxed tile shines and grout doesn't. Still no image files: everything is
// generated at startup from seeded noise, so the PlayPlace looks the same on every visit.
//
// `surfaceInfo` maps each colour texture to its companions; materials.js reads it.
import * as THREE from 'three';

export const surfaceInfo = new WeakMap();   // colour texture → { normalMap, roughnessMap, normalScale, reflect }

const cache = new Map();

// ── Noise ───────────────────────────────────────────────────────────────

function rng(seed) {
  let s = (seed >>> 0) % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Tileable value noise: a cx × cy lattice of random values spread over the canvas and
// wrapped at the edges, smoothly interpolated. 0..1 per pixel.
function valueNoise(w, h, cx, cy, rand) {
  const lat = new Float32Array(cx * cy);
  for (let i = 0; i < lat.length; i++) lat[i] = rand();
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const fy = (y / h) * cy, y0 = Math.floor(fy), ty = fy - y0, sy = ty * ty * (3 - 2 * ty);
    const r0 = (y0 % cy) * cx, r1 = ((y0 + 1) % cy) * cx;
    for (let x = 0; x < w; x++) {
      const fx = (x / w) * cx, x0 = Math.floor(fx), tx = fx - x0, sx = tx * tx * (3 - 2 * tx);
      const x1 = (x0 + 1) % cx;
      const a = lat[r0 + x0], b = lat[r0 + x1], c = lat[r1 + x0], d = lat[r1 + x1];
      out[y * w + x] = (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
    }
  }
  return out;
}

// Fractal noise: octaves of value noise, each twice as fine. `sx`/`sy` stretch the cells
// (wood grain is long and thin).
function fbm(w, h, cells, octaves, rand, { gain = 0.5, sx = 1, sy = 1 } = {}) {
  const out = new Float32Array(w * h);
  let amp = 1, total = 0;
  for (let o = 0; o < octaves; o++) {
    const c = cells * 2 ** o;
    const n = valueNoise(w, h, Math.max(1, Math.round(c * sx)), Math.max(1, Math.round(c * sy * (h / w))), rand);
    for (let i = 0; i < out.length; i++) out[i] += n[i] * amp;
    total += amp;
    amp *= gain;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

// ── Canvases and maps ───────────────────────────────────────────────────

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// A greyscale canvas painted with the 2D API, read back as 0..1 floats.
function drawn(w, h, paint) {
  const c = canvas(w, h);
  const g = c.getContext('2d', { willReadFrequently: true });
  paint(g, w, h);
  const d = g.getImageData(0, 0, w, h).data;
  const out = new Float32Array(w * h);
  for (let i = 0; i < out.length; i++) out[i] = d[i * 4] / 255;
  return out;
}

function linearTex(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

// Height → tangent-space normal map. Canvas rows run down while texture v runs up, hence
// the sign on the y slope.
function normalFromHeight(hgt, w, h, strength) {
  const c = canvas(w, h);
  const g = c.getContext('2d');
  const img = g.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    const yu = ((y - 1 + h) % h) * w, yd = ((y + 1) % h) * w, row = y * w;
    for (let x = 0; x < w; x++) {
      const dx = hgt[row + (x + 1) % w] - hgt[row + (x - 1 + w) % w];
      const dy = hgt[yd + x] - hgt[yu + x];
      let nx = -dx * strength, ny = dy * strength, nz = 1;
      const l = Math.hypot(nx, ny, nz);
      nx /= l; ny /= l; nz /= l;
      const i = (row + x) * 4;
      d[i] = (nx * 0.5 + 0.5) * 255;
      d[i + 1] = (ny * 0.5 + 0.5) * 255;
      d[i + 2] = (nz * 0.5 + 0.5) * 255;
      d[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return linearTex(c);
}

function greyTex(vals, w, h) {
  const c = canvas(w, h);
  const g = c.getContext('2d');
  const img = g.createImageData(w, h);
  for (let i = 0; i < vals.length; i++) {
    const v = Math.max(0, Math.min(255, vals[i] * 255));
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return linearTex(c);
}

// Multiply every pixel of a colour canvas by `f(i)` (0..2), for mottling and grime.
function shade(c, f) {
  const g = c.getContext('2d', { willReadFrequently: true });
  const img = g.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const k = f(p);
    d[i] = Math.min(255, d[i] * k); d[i + 1] = Math.min(255, d[i + 1] * k); d[i + 2] = Math.min(255, d[i + 2] * k);
  }
  g.putImageData(img, 0, 0);
}

// Build one surface: the colour texture (sRGB) with its normal and roughness maps
// registered in `surfaceInfo`. `companions` lets several colourways share one set of maps.
function surfaceTex(key, w, h, { color, height, rough, normal = 3, reflect = 0, companions = null, repeat = null }) {
  if (cache.has(key)) return cache.get(key);
  const c = canvas(w, h);
  color(c.getContext('2d', { willReadFrequently: true }), w, h, c);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  if (repeat) tex.repeat.set(repeat[0], repeat[1]);
  let maps = companions && cache.get(companions);
  if (!maps) {
    maps = {
      normalMap: height ? normalFromHeight(height(), w, h, normal) : null,
      roughnessMap: rough ? greyTex(rough(), w, h) : null,
    };
    if (companions) cache.set(companions, maps);
  }
  const info = { ...maps, reflect };
  if (repeat) for (const m of [info.normalMap, info.roughnessMap]) if (m) m.repeat.set(repeat[0], repeat[1]);
  surfaceInfo.set(tex, info);
  cache.set(key, tex);
  return tex;
}

const hex = (c) => new THREE.Color(c);
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const css = (col, k = 1) => `rgb(${Math.round(Math.min(1, col.r * k) * 255)},${Math.round(Math.min(1, col.g * k) * 255)},${Math.round(Math.min(1, col.b * k) * 255)})`;

// ── World-space grime ───────────────────────────────────────────────────
//
// One tileable noise every surface samples in world space (materials.js), so no two
// metres of wall or table are quite the same colour. R is broad blotches, G is fine grit.

export function grime() {
  if (cache.has('grime')) return cache.get('grime');
  const W = 256, rand = rng(99);
  const broad = fbm(W, W, 3, 5, rand, { gain: 0.55 });
  const grit = fbm(W, W, 32, 3, rand, { gain: 0.6 });
  const c = canvas(W, W);
  const g = c.getContext('2d');
  const img = g.createImageData(W, W);
  for (let i = 0; i < broad.length; i++) {
    img.data[i * 4] = broad[i] * 255;
    img.data[i * 4 + 1] = grit[i] * 255;
    img.data[i * 4 + 2] = 128;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = linearTex(c);
  cache.set('grime', t);
  return t;
}

// ── Floors (one canvas = 2 m × 2 m) ─────────────────────────────────────

// Waxed vinyl checkerboard: 50 cm tiles, grout, chips of colour, scuffs, worn wax.
export function checker(a, b) {
  const S = 512, N = 4, T = S / N, GR = 3;
  const rand = rng(hashStr('checker' + a + b));
  const wear = fbm(S, S, 3, 4, rng(11));
  const scuffs = [];
  for (let i = 0; i < 46; i++) scuffs.push([rand() * S, rand() * S, 6 + rand() * 30, rand() * 6.28, 0.6 + rand() * 1.8]);
  return surfaceTex(`checker${a}${b}`, S, S, {
    reflect: 0.85,
    normal: 2.4,
    companions: 'checker-maps',
    color(g) {
      g.fillStyle = '#6f6c66'; g.fillRect(0, 0, S, S);
      const A = hex(a), B = hex(b);
      for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) {
        const base = (i + k) % 2 ? B : A;
        g.fillStyle = css(base, 0.96 + rand() * 0.07);
        g.fillRect(i * T + GR / 2, k * T + GR / 2, T - GR, T - GR);
      }
      // the coloured chips every vinyl tile has
      for (let i = 0; i < 2600; i++) {
        const x = rand() * S, y = rand() * S;
        const light = ((Math.floor(x / T) + Math.floor(y / T)) % 2) === 0;
        g.fillStyle = light ? `rgba(120,110,100,${0.08 + rand() * 0.12})` : `rgba(255,255,255,${0.03 + rand() * 0.05})`;
        g.fillRect(x, y, 1 + rand() * 2, 1 + rand() * 1.5);
      }
      g.lineCap = 'round';
      for (const [x, y, len, ang, wdt] of scuffs) {
        g.strokeStyle = `rgba(20,18,16,${0.12 + rand() * 0.2})`;
        g.lineWidth = wdt;
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(x + Math.cos(ang + 0.6) * len * 0.6, y + Math.sin(ang + 0.6) * len * 0.6, x + Math.cos(ang) * len, y + Math.sin(ang) * len);
        g.stroke();
      }
      shade(g.canvas, (p) => 0.9 + wear[p] * 0.16);
    },
    height: () => {
      const hgt = drawn(S, S, (g) => {
        g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
        g.fillStyle = '#fff';
        for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) g.fillRect(i * T + GR / 2 + 1, k * T + GR / 2 + 1, T - GR - 2, T - GR - 2);
        g.filter = 'blur(1px)';
        g.drawImage(g.canvas, 0, 0);
      });
      const orange = fbm(S, S, 64, 2, rng(5));
      for (let i = 0; i < hgt.length; i++) hgt[i] = hgt[i] * 0.6 + orange[i] * 0.04;
      return hgt;
    },
    rough: () => {
      const grout = drawn(S, S, (g) => {
        g.fillStyle = '#fff'; g.fillRect(0, 0, S, S);
        g.fillStyle = '#000';
        for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) g.fillRect(i * T + GR / 2, k * T + GR / 2, T - GR, T - GR);
      });
      const r = new Float32Array(S * S);
      for (let i = 0; i < r.length; i++) r[i] = grout[i] > 0.5 ? 0.9 : 0.1 + Math.pow(wear[i], 2.2) * 0.55;
      return r;
    },
  });
}

// Arcade carpet: the neon squiggles and stars, woven into dense fibres, with stains.
export function carpet(base) {
  const S = 512;
  const rand = rng(7);
  return surfaceTex(`carpet${base}`, S, S, {
    normal: 5,
    companions: 'carpet-maps',
    color(g) {
      g.fillStyle = base; g.fillRect(0, 0, S, S);
      const colors = ['#ff3fa4', '#2de2e6', '#ffd23f', '#7cff6b', '#a970ff'];
      g.lineWidth = 10; g.lineCap = 'round';
      // drawn three times over, offset by a canvas, so shapes cross the edges seamlessly
      const shapes = [];
      for (let i = 0; i < 18; i++) shapes.push(['s', colors[i % colors.length], rand() * S, rand() * S]);
      for (let i = 0; i < 16; i++) shapes.push(['*', colors[(i + 2) % colors.length], rand() * S, rand() * S]);
      for (const [kind, col, x0, y0] of shapes) for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
        const x = x0 + ox, y = y0 + oy;
        g.strokeStyle = col; g.fillStyle = col;
        g.beginPath();
        if (kind === 's') {
          g.moveTo(x, y);
          g.bezierCurveTo(x + 56, y - 48, x + 40, y + 64, x + 104, y + 24);
          g.stroke();
        } else {
          for (let k = 0; k < 10; k++) {
            const r = k % 2 ? 8 : 20, a = (k / 10) * Math.PI * 2;
            g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
          }
          g.fill();
        }
      }
      const fib = fbm(S, S, 128, 2, rng(3), { gain: 0.7 });
      const blot = fbm(S, S, 4, 4, rng(8));
      shade(g.canvas, (p) => (0.72 + fib[p] * 0.5) * (blot[p] < 0.38 ? 0.8 : 1));
    },
    height: () => fbm(S, S, 160, 2, rng(3), { gain: 0.7 }),
    rough: () => new Float32Array(S * S).fill(0.97),
  });
}

// Glazed ceramic tiles, 50 cm, with grimy grout.
export function tiles(a, line) {
  const S = 512, N = 4, T = S / N, GR = 4;
  const rand = rng(hashStr('tiles' + a));
  const dirt = fbm(S, S, 6, 4, rng(21));
  return surfaceTex(`tiles${a}${line}`, S, S, {
    reflect: 0.6,
    normal: 2.2,
    companions: 'tiles-maps',
    color(g) {
      g.fillStyle = line; g.fillRect(0, 0, S, S);
      const A = hex(a);
      for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) {
        g.fillStyle = css(A, 0.95 + rand() * 0.08);
        g.fillRect(i * T + GR / 2, k * T + GR / 2, T - GR, T - GR);
      }
      shade(g.canvas, (p) => 0.86 + dirt[p] * 0.2);
    },
    height: () => drawn(S, S, (g) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
      g.fillStyle = '#fff';
      for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) g.fillRect(i * T + GR, k * T + GR, T - GR * 2, T - GR * 2);
      g.filter = 'blur(2px)';
      g.drawImage(g.canvas, 0, 0);
    }),
    rough: () => {
      const grout = drawn(S, S, (g) => {
        g.fillStyle = '#fff'; g.fillRect(0, 0, S, S);
        g.fillStyle = '#000';
        for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) g.fillRect(i * T + GR / 2, k * T + GR / 2, T - GR, T - GR);
      });
      return grout.map((v, i) => (v > 0.5 ? 0.92 : 0.08 + dirt[i] * 0.25));
    },
  });
}

// Sealed concrete: mottled, cracked, stained, pitted.
export function concrete() {
  const S = 512;
  const rand = rng(31);
  const mott = fbm(S, S, 4, 6, rng(32), { gain: 0.55 });
  const cracks = drawn(S, S, (g) => {
    g.fillStyle = '#fff'; g.fillRect(0, 0, S, S);
    g.strokeStyle = '#000'; g.lineWidth = 1.4;
    for (let c = 0; c < 5; c++) {
      let x = rand() * S, y = rand() * S, a = rand() * 6.28;
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 18; k++) { a += (rand() - 0.5) * 1.1; x += Math.cos(a) * 9; y += Math.sin(a) * 9; g.lineTo(x, y); }
      g.stroke();
    }
    g.fillStyle = '#000';
    for (let i = 0; i < 500; i++) { g.globalAlpha = 0.3 + rand() * 0.7; g.fillRect(rand() * S, rand() * S, 1 + rand() * 2, 1 + rand() * 2); }
  });
  return surfaceTex('concrete', S, S, {
    reflect: 0.18,
    normal: 3,
    color(g) {
      g.fillStyle = '#5c5e63'; g.fillRect(0, 0, S, S);
      for (let i = 0; i < 9; i++) {
        const x = rand() * S, y = rand() * S, r = 20 + rand() * 60;
        const grd = g.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, `rgba(25,22,18,${0.15 + rand() * 0.2})`); grd.addColorStop(1, 'rgba(25,22,18,0)');
        g.fillStyle = grd; g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      shade(g.canvas, (p) => (0.7 + mott[p] * 0.55) * (0.55 + cracks[p] * 0.45));
    },
    height: () => mott.map((v, i) => v * 0.35 + cracks[i] * 0.5),
    rough: () => mott.map((v, i) => 0.55 + v * 0.35 + (1 - cracks[i]) * 0.2),
  });
}

// Interlocking foam play mats: 1 m squares, a fine diamond texture, scuffed.
export function playmat() {
  const S = 512, T = 256;
  const dirt = fbm(S, S, 5, 4, rng(41));
  const edges = (g, w) => {
    // puzzle-piece teeth along every edge
    for (let k = 0; k < 2; k++) for (let i = 0; i < 2; i++) {
      for (let t = 0; t < 4; t++) {
        const c = t * 64 + 32;
        g.fillRect(i * T + c - 9, k * T - w, 18, w * 2);
        g.fillRect(i * T - w, k * T + c - 9, w * 2, 18);
      }
    }
  };
  return surfaceTex('playmat', S, S, {
    reflect: 0.05,
    normal: 3.5,
    color(g) {
      const c = ['#e85457', '#f2c63c', '#3ab3c4', '#6fbf4b'];
      for (let i = 0; i < 4; i++) { g.fillStyle = c[i]; g.fillRect((i % 2) * T, Math.floor(i / 2) * T, T, T); }
      g.fillStyle = 'rgba(0,0,0,0.35)';
      for (let i = 0; i <= 2; i++) { g.fillRect(i * T - 1, 0, 2, S); g.fillRect(0, i * T - 1, S, 2); }
      shade(g.canvas, (p) => 0.84 + dirt[p] * 0.22);
    },
    height: () => {
      const hgt = new Float32Array(S * S);
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const d = Math.abs(((x + y) % 8) - 4) + Math.abs(((x - y + 1024) % 8) - 4);
        hgt[y * S + x] = d / 8 * 0.25;
      }
      const seams = drawn(S, S, (g) => {
        g.fillStyle = '#fff'; g.fillRect(0, 0, S, S);
        g.fillStyle = '#000';
        for (let i = 0; i <= 2; i++) { g.fillRect(i * T - 2, 0, 4, S); g.fillRect(0, i * T - 2, S, 4); }
        edges(g, 1);
      });
      for (let i = 0; i < hgt.length; i++) hgt[i] = hgt[i] * seams[i] + seams[i] * 0.6;
      return hgt;
    },
    rough: () => dirt.map((v) => 0.7 + v * 0.2),
  });
}

// Varnished floorboards, 12.5 cm wide, with grain and staggered joints.
export function wood(base) {
  const S = 512, B = 32;
  const rand = rng(hashStr('wood' + base));
  const grain = fbm(S, S, 3, 5, rng(51), { sx: 0.25, sy: 6 });
  const joints = [];
  for (let k = 0; k < S / B; k++) joints.push([rand() * S, rand() * S, 0.85 + rand() * 0.3]);
  return surfaceTex(`wood${base}`, S, S, {
    reflect: 0.32,
    normal: 2,
    companions: 'wood-maps',
    color(g) {
      const C = hex(base);
      for (let k = 0; k < S / B; k++) {
        g.fillStyle = css(C, joints[k][2]);
        g.fillRect(0, k * B, S, B);
      }
      shade(g.canvas, (p) => {
        const y = Math.floor(p / S), x = p % S;
        const ring = Math.sin((y + grain[p] * 60) * 0.9 + (Math.floor(y / B) * 7)) * 0.5 + 0.5;
        return 0.78 + grain[p] * 0.3 + ring * 0.08 - (x % 3 === 0 ? 0.01 : 0);
      });
      g.fillStyle = 'rgba(30,15,5,0.65)';
      for (let k = 0; k < S / B; k++) {
        g.fillRect(0, k * B, S, 1.5);
        for (const jx of [joints[k][0], joints[k][1]]) g.fillRect(jx, k * B, 1.5, B);
      }
    },
    height: () => {
      const seams = drawn(S, S, (g) => {
        g.fillStyle = '#fff'; g.fillRect(0, 0, S, S);
        g.fillStyle = '#000';
        for (let k = 0; k < S / B; k++) {
          g.fillRect(0, k * B - 1, S, 2);
          for (const jx of [joints[k][0], joints[k][1]]) g.fillRect(jx - 1, k * B, 2, B);
        }
      });
      return seams.map((v, i) => v * 0.7 + grain[i] * 0.08);
    },
    rough: () => grain.map((v) => 0.28 + v * 0.25),
  });
}

export function rug(a, b) {
  const S = 256;
  return surfaceTex(`rug${a}${b}`, S, S, {
    normal: 4,
    color(g) {
      g.fillStyle = a; g.fillRect(0, 0, S, S);
      g.strokeStyle = b; g.lineWidth = 16; g.strokeRect(20, 20, S - 40, S - 40);
      g.lineWidth = 8; g.strokeRect(56, 56, S - 112, S - 112);
      g.fillStyle = b; g.beginPath(); g.arc(S / 2, S / 2, 24, 0, Math.PI * 2); g.fill();
      const weave = new Float32Array(S * S);
      for (let i = 0; i < weave.length; i++) { const x = i % S, y = Math.floor(i / S); weave[i] = ((x >> 1) + (y >> 1)) % 2; }
      const fib = fbm(S, S, 64, 2, rng(61));
      shade(g.canvas, (p) => 0.8 + weave[p] * 0.08 + fib[p] * 0.2);
    },
    height: () => fbm(S, S, 96, 2, rng(61)),
    rough: () => new Float32Array(S * S).fill(0.98),
  });
}

// Hazard stripes painted on concrete, half worn away.
export function hazard() {
  const S = 256;
  const chip = fbm(S, S, 8, 4, rng(71));
  const stripes = drawn(S, S, (g) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
    g.fillStyle = '#fff';
    for (let i = -S; i < S * 2; i += 88) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 44, 0); g.lineTo(i + 44 - S, S); g.lineTo(i - S, S); g.fill();
    }
  });
  return surfaceTex('hazard', S, S, {
    normal: 2,
    color(g) {
      const img = g.createImageData(S, S);
      for (let i = 0; i < S * S; i++) {
        const worn = chip[i] < 0.4;
        let r, gg, b;
        if (worn) { r = gg = b = 88 + chip[i] * 40; } else if (stripes[i] > 0.5) { r = 236; gg = 190; b = 48; } else { r = 26; gg = 26; b = 26; }
        const k = 0.85 + chip[i] * 0.25;
        img.data[i * 4] = r * k; img.data[i * 4 + 1] = gg * k; img.data[i * 4 + 2] = b * k; img.data[i * 4 + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    },
    height: () => chip.map((v) => (v < 0.4 ? 0 : 0.3)),
    rough: () => chip.map((v) => (v < 0.4 ? 0.85 : 0.5)),
  });
}

// ── Walls ───────────────────────────────────────────────────────────────
//
// One canvas = 2 m wide × the full wall height (UVs run one unit per metre, so the texture
// repeats at 0.5 across). Painted drywall above a glossy stripe, a tiled wainscot below,
// and a rubber baseboard, with shoe scuffs low down and a few dents and smudges.

const WALL_W = 512, WALL_H = 1024;
const BAND_TOP = 672, BAND_BOT = 720, BASE_TOP = 994;

function wallLayout(pattern, g) {
  // white = raised, black = recessed; the band, tile joints and pattern relief
  g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, WALL_W, WALL_H);
  if (pattern === 'bricks') {
    g.fillStyle = '#333';
    for (let y = 0; y < BAND_TOP; y += 44) {
      g.fillRect(0, y, WALL_W, 4);
      const off = (y / 44) % 2 ? 0 : 64;
      for (let x = off; x < WALL_W; x += 128) g.fillRect(x, y, 4, 44);
    }
  } else if (pattern === 'panels') {
    g.fillStyle = '#555';
    for (let x = 0; x < WALL_W; x += 256) { g.fillRect(x + 12, 24, 232, 4); g.fillRect(x + 12, 620, 232, 4); g.fillRect(x + 12, 24, 4, 600); g.fillRect(x + 240, 24, 4, 600); }
  }
  g.fillStyle = '#d0d0d0'; g.fillRect(0, BAND_TOP, WALL_W, BAND_BOT - BAND_TOP);
  g.fillStyle = '#444';
  for (let y = BAND_BOT; y < BASE_TOP; y += 64) g.fillRect(0, y, WALL_W, 3);
  for (let x = 0; x < WALL_W; x += 64) g.fillRect(x, BAND_BOT, 3, BASE_TOP - BAND_BOT);
  g.fillStyle = '#b8b8b8'; g.fillRect(0, BASE_TOP, WALL_W, WALL_H - BASE_TOP);
}

export function wallPaint(upper, band, lower, pattern) {
  const rand = rng(hashStr('wall' + upper + pattern));
  const mott = fbm(WALL_W, WALL_H, 3, 5, rng(81));
  return surfaceTex(`wall${upper}${band}${lower}${pattern}`, WALL_W, WALL_H, {
    normal: 2.2,
    repeat: [0.5, 1],
    companions: `wall-maps-${pattern}`,
    color(g) {
      g.fillStyle = upper; g.fillRect(0, 0, WALL_W, BAND_TOP);
      const pat = (draw) => { for (const ox of [-WALL_W, 0, WALL_W]) draw(ox); };
      if (pattern === 'stripes') {
        g.fillStyle = 'rgba(255,255,255,0.08)';
        for (let x = 0; x < WALL_W; x += 256) g.fillRect(x, 0, 128, BAND_TOP);
      } else if (pattern === 'stars') {
        g.fillStyle = 'rgba(255,255,255,0.2)';
        const stars = [];
        for (let i = 0; i < 9; i++) stars.push([rand() * WALL_W, 60 + rand() * (BAND_TOP - 120), 14 + rand() * 18]);
        pat((ox) => {
          for (const [x, y, r] of stars) {
            g.beginPath();
            for (let k = 0; k < 10; k++) {
              const rr = k % 2 ? r * 0.42 : r, a = (k / 10) * Math.PI * 2 - Math.PI / 2;
              g.lineTo(x + ox + Math.cos(a) * rr, y + Math.sin(a) * rr);
            }
            g.fill();
          }
        });
      } else if (pattern === 'bubbles') {
        g.strokeStyle = 'rgba(255,255,255,0.24)'; g.lineWidth = 7;
        const bubbles = [];
        for (let i = 0; i < 8; i++) bubbles.push([rand() * WALL_W, 60 + rand() * (BAND_TOP - 120), 12 + rand() * 30]);
        pat((ox) => { for (const [x, y, r] of bubbles) { g.beginPath(); g.arc(x + ox, y, r, 0, Math.PI * 2); g.stroke(); } });
      } else if (pattern === 'panels') {
        g.strokeStyle = 'rgba(0,0,0,0.2)'; g.lineWidth = 4;
        for (let x = 0; x < WALL_W; x += 256) g.strokeRect(x + 14, 26, 228, 596);
      } else if (pattern === 'bricks') {
        g.fillStyle = 'rgba(0,0,0,0.18)';
        for (let y = 0; y < BAND_TOP; y += 44) {
          g.fillRect(0, y, WALL_W, 4);
          const off = (y / 44) % 2 ? 0 : 64;
          for (let x = off; x < WALL_W; x += 128) g.fillRect(x, y, 4, 44);
        }
      }
      g.fillStyle = band; g.fillRect(0, BAND_TOP, WALL_W, BAND_BOT - BAND_TOP);
      // the tiled wainscot, alternate tiles a shade darker like the old checker
      const L = hex(lower);
      for (let x = 0; x < WALL_W; x += 64) for (let y = BAND_BOT; y < BASE_TOP; y += 64) {
        const dark = (((x + y - BAND_BOT) / 64) % 2) === 0;
        g.fillStyle = css(L, (dark ? 0.8 : 1) * (0.96 + rand() * 0.06));
        g.fillRect(x, y, 64, 64);
      }
      g.fillStyle = 'rgba(30,30,30,0.5)';
      for (let y = BAND_BOT; y < BASE_TOP; y += 64) g.fillRect(0, y, WALL_W, 3);
      for (let x = 0; x < WALL_W; x += 64) g.fillRect(x, BAND_BOT, 3, BASE_TOP - BAND_BOT);
      g.fillStyle = '#1c1b1d'; g.fillRect(0, BASE_TOP, WALL_W, WALL_H - BASE_TOP);
      // shoe scuffs just above the baseboard, and grubby handprint smudges at kid height
      g.lineCap = 'round';
      for (let i = 0; i < 14; i++) {
        const x = rand() * WALL_W, y = BASE_TOP - 6 - rand() * 120;
        g.strokeStyle = `rgba(15,12,10,${0.15 + rand() * 0.3})`; g.lineWidth = 1 + rand() * 3;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + 8 + rand() * 30, y + (rand() - 0.5) * 8); g.stroke();
      }
      for (let i = 0; i < 4; i++) {
        const x = rand() * WALL_W, y = BAND_BOT - 120 - rand() * 160, r = 10 + rand() * 14;
        const grd = g.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, 'rgba(40,30,20,0.1)'); grd.addColorStop(1, 'rgba(40,30,20,0)');
        g.fillStyle = grd; g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      shade(g.canvas, (p) => {
        const y = Math.floor(p / WALL_W);
        const low = y > BAND_TOP ? 0 : (1 - y / BAND_TOP);
        return 0.9 + mott[p] * 0.14 + low * 0.03;
      });
    },
    height: () => {
      const lay = drawn(WALL_W, WALL_H, (g) => {
        wallLayout(pattern, g);
        g.filter = 'blur(1.5px)';
        g.drawImage(g.canvas, 0, 0);
      });
      const peel = fbm(WALL_W, WALL_H, 96, 2, rng(83), { gain: 0.6 });
      const block = pattern === 'bricks' ? fbm(WALL_W, WALL_H, 48, 3, rng(84)) : null;
      return lay.map((v, i) => v + peel[i] * 0.025 + (block && i < BAND_TOP * WALL_W ? block[i] * 0.12 : 0));
    },
    rough: () => {
      const r = new Float32Array(WALL_W * WALL_H);
      for (let i = 0; i < r.length; i++) {
        const y = Math.floor(i / WALL_W);
        r[i] = y < BAND_TOP ? (pattern === 'bricks' ? 0.9 : 0.72) + mott[i] * 0.12
          : y < BAND_BOT ? 0.3 : y < BASE_TOP ? 0.2 + mott[i] * 0.15 : 0.6;
      }
      return r;
    },
  });
}

// Black acoustic drop ceiling: 66 cm tiles in a T-bar grid, fissured, a water stain or two.
export function ceiling() {
  const S = 512, N = 3, T = S / N, BAR = 5;
  const rand = rng(91);
  const fis = drawn(S, S, (g) => {
    g.fillStyle = '#fff'; g.fillRect(0, 0, S, S);
    g.strokeStyle = '#000'; g.lineCap = 'round';
    for (let i = 0; i < 1600; i++) {
      const x = rand() * S, y = rand() * S, a = rand() * 6.28, l = 1 + rand() * 4;
      g.globalAlpha = 0.4 + rand() * 0.6; g.lineWidth = 0.8 + rand() * 0.8;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
  });
  const grid = drawn(S, S, (g) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
    g.fillStyle = '#fff';
    for (let i = 0; i <= N; i++) { g.fillRect(Math.round(i * T) - BAR / 2, 0, BAR, S); g.fillRect(0, Math.round(i * T) - BAR / 2, S, BAR); }
  });
  const mott = fbm(S, S, 4, 4, rng(92));
  return surfaceTex('ceiling', S, S, {
    normal: 2.5,
    color(g) {
      g.fillStyle = '#2b2933'; g.fillRect(0, 0, S, S);
      const x = rand() * S, y = rand() * S;
      const grd = g.createRadialGradient(x, y, 10, x, y, 60);
      grd.addColorStop(0, 'rgba(90,70,40,0.12)'); grd.addColorStop(0.8, 'rgba(110,80,40,0.2)'); grd.addColorStop(1, 'rgba(90,70,40,0)');
      g.fillStyle = grd; g.fillRect(x - 60, y - 60, 120, 120);
      shade(g.canvas, (p) => (grid[p] > 0.5 ? 1.25 : (0.78 + fis[p] * 0.25) * (0.9 + mott[p] * 0.2)));
    },
    height: () => fis.map((v, i) => (grid[i] > 0.5 ? 1 : 0.55 + v * 0.1)),
    rough: () => grid.map((v) => (v > 0.5 ? 0.45 : 0.97)),
  });
}

// Stage curtain velvet: deep folds, fine pile.
export function curtain() {
  const W = 256, H = 256;
  const pile = fbm(W, H, 64, 2, rng(101), { sx: 0.3, sy: 3 });
  const fold = (x) => Math.cos((x / W) * Math.PI * 2);
  return surfaceTex('curtain', W, H, {
    normal: 6,
    color(g) {
      const grd = g.createLinearGradient(0, 0, W, 0);
      grd.addColorStop(0, '#4a0c32'); grd.addColorStop(0.5, '#b02a72'); grd.addColorStop(1, '#4a0c32');
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
      shade(g.canvas, (p) => 0.82 + pile[p] * 0.3);
    },
    height: () => {
      const h = new Float32Array(W * H);
      for (let i = 0; i < h.length; i++) h[i] = fold(i % W) * 0.5 + 0.5 + pile[i] * 0.02;
      return h;
    },
    rough: () => new Float32Array(W * H).fill(0.92),
  });
}

// ── Pictures ────────────────────────────────────────────────────────────

// A CRT: the game drawn small, blown up with scanlines and a curved-glass vignette.
export function crt(c) {
  const S = 256;
  const out = canvas(S, S);
  const g = out.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(c, 0, 0, S, S);
  g.fillStyle = 'rgba(0,0,0,0.35)';
  for (let y = 0; y < S; y += 4) g.fillRect(0, y + 2, S, 2);
  const v = g.createRadialGradient(S / 2, S / 2, S * 0.3, S / 2, S / 2, S * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.7)');
  g.fillStyle = v; g.fillRect(0, 0, S, S);
  return out;
}

// Printed paper: grain, a little yellowing, scuffed edges and a fold.
export function paper(c, key) {
  if (cache.has('paper' + key)) return cache.get('paper' + key);
  const W = c.width * 2, H = c.height * 2;
  const grain = fbm(W, H, 80, 2, rng(111));
  const crease = Math.floor(H * (0.35 + (hashStr(key) % 30) / 100));
  const tex = surfaceTex('paper' + key, W, H, {
    normal: 1.5,
    color(g) {
      g.drawImage(c, 0, 0, W, H);
      g.fillStyle = 'rgba(200,170,90,0.08)'; g.fillRect(0, 0, W, H);
      shade(g.canvas, (p) => {
        const x = p % W, y = Math.floor(p / W);
        const edge = Math.min(x, y, W - 1 - x, H - 1 - y) < 6 ? 1.12 : 1;
        return (0.92 + grain[p] * 0.12) * edge * (Math.abs(y - crease) < 2 ? 0.9 : 1);
      });
    },
    height: () => {
      const h = grain.map((v) => v * 0.1);
      for (let x = 0; x < W; x++) for (let d = -3; d <= 3; d++) h[(crease + d) * W + x] += (3 - Math.abs(d)) * 0.06;
      return h;
    },
    rough: () => new Float32Array(W * H).fill(0.82),
  });
  return tex;
}

// ── Costumes ────────────────────────────────────────────────────────────
//
// The animatronics are old furry costumes. `fur()` is the suit's surface (a near-white
// detail map the material colour tints: streaks of pile, matted dirty patches) and the
// strand pattern the fur shells cut out (models.js): R is each strand's profile, G its
// length, B broad patches where the fur is matted flat.

export function fur() {
  if (cache.has('fur')) return cache.get('fur');
  const S = 512;
  const streak = fbm(S, S, 16, 4, rng(121), { sx: 3, sy: 0.6, gain: 0.7 });
  const dirt = fbm(S, S, 3, 5, rng(122));
  const map = surfaceTex('fur-map', S, S, {
    normal: 4,
    repeat: [3, 2],
    color(g) {
      const img = g.createImageData(S, S);
      for (let i = 0; i < S * S; i++) {
        const k = 0.84 + streak[i] * 0.2;
        const d = 1 - (1 - smooth(0.22, 0.5, dirt[i])) * 0.24;    // grubby patches
        img.data[i * 4] = 255 * k * d;
        img.data[i * 4 + 1] = 255 * k * d * (d < 1 ? 0.95 : 1);
        img.data[i * 4 + 2] = 255 * k * d * (d < 1 ? 0.86 : 1);
        img.data[i * 4 + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    },
    height: () => streak,
  });

  // Strands: a tileable cell pattern, one strand per cell, nearest one wins.
  const T = 256, C = 40, cell = T / C, rand = rng(123);
  const fx = new Float32Array(C * C), fy = new Float32Array(C * C), fh = new Float32Array(C * C);
  for (let i = 0; i < C * C; i++) { fx[i] = rand(); fy[i] = rand(); fh[i] = 0.55 + rand() * 0.45; }
  const matted = fbm(T, T, 3, 3, rng(124));
  const c = canvas(T, T);
  const g = c.getContext('2d');
  const img = g.createImageData(T, T);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
    let best = 1e9, h = 0;
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      const nx = cx + ox, ny = cy + oy;
      const k = ((ny + C) % C) * C + ((nx + C) % C);
      const dx = (nx + fx[k]) * cell - x, dy = (ny + fy[k]) * cell - y;
      const d = dx * dx + dy * dy;
      if (d < best) { best = d; h = fh[k]; }
    }
    const i = (y * T + x) * 4;
    img.data[i] = Math.max(0, 1 - Math.sqrt(best) / (cell * 0.8)) * 255;
    img.data[i + 1] = h * 255;
    img.data[i + 2] = matted[y * T + x] * 255;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const strands = linearTex(c);
  const out = { map, normalMap: surfaceInfo.get(map).normalMap, strands };
  cache.set('fur', out);
  return out;
}

// Scuffed, grubby plastic and paint for everything that isn't fur: a near-white detail
// map with scratches and dirt, and a matching roughness map.
export function wornPlastic() {
  const S = 512;
  const rand = rng(131);
  const dirt = fbm(S, S, 3, 5, rng(132));
  const scratches = drawn(S, S, (g) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
    g.strokeStyle = '#fff'; g.lineCap = 'round';
    for (let i = 0; i < 220; i++) {
      const x = rand() * S, y = rand() * S, a = rand() * 6.28, l = 4 + rand() * 30;
      g.globalAlpha = 0.2 + rand() * 0.6; g.lineWidth = 0.5 + rand();
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
  });
  return surfaceTex('worn-plastic', S, S, {
    normal: 1.2,
    repeat: [2, 2],
    color(g) {
      const img = g.createImageData(S, S);
      for (let i = 0; i < S * S; i++) {
        const d = (1 - (1 - smooth(0.2, 0.45, dirt[i])) * 0.2) * (0.96 + dirt[i] * 0.06);
        const k = d * (1 - scratches[i] * 0.12);
        img.data[i * 4] = 255 * Math.min(1, k);
        img.data[i * 4 + 1] = 255 * Math.min(1, k * (d < 0.9 ? 0.96 : 1));
        img.data[i * 4 + 2] = 255 * Math.min(1, k * (d < 0.9 ? 0.9 : 1));
        img.data[i * 4 + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    },
    height: () => scratches.map((v, i) => -v * 0.5 + dirt[i] * 0.05),
    rough: () => dirt.map((v, i) => Math.min(1, 0.75 + (1 - smooth(0.2, 0.45, v)) * 0.25 + scratches[i] * 0.3)),
  });
}
