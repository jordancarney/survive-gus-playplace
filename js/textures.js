// Every texture in the game, painted onto small canvases at startup. No image files.
//
// On 'fast' graphics they're deliberately low resolution with nearest-neighbour filtering
// on the patterns, so the PlayPlace reads as chunky and toy-like. On 'real' the surfaces
// come from realtex.js instead: the same designs at real-world detail, with bump and shine.
import * as THREE from 'three';
import { REALISTIC } from './config.js';
import * as R from './realtex.js';

const cache = new Map();

function canvasTex(key, w, h, paint, { repeat = null, nearest = false } = {}) {
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  paint(g, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  if (repeat) tex.repeat.set(repeat[0], repeat[1]);
  if (nearest) { tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestMipmapLinearFilter; }
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

// A fresh copy that shares the canvas but can have its own repeat.
export function withRepeat(tex, rx, ry) {
  const t = tex.clone();
  t.repeat.set(rx, ry);
  t.needsUpdate = true;
  // its bump and shine maps repeat with it
  const info = R.surfaceInfo.get(tex);
  if (info) {
    const copy = { ...info };
    for (const k of ['normalMap', 'roughnessMap']) {
      if (!info[k]) continue;
      copy[k] = info[k].clone();
      copy[k].repeat.set(rx * info[k].repeat.x, ry * info[k].repeat.y);
      copy[k].needsUpdate = true;
    }
    R.surfaceInfo.set(t, copy);
  }
  return t;
}

// ── Floors ──────────────────────────────────────────────────────────────

// The classic pizzeria checkerboard. One canvas = 2 m × 2 m.
export const checker = (a = '#f2f0ea', b = '#1d1c24') => REALISTIC ? R.checker(a, b) : canvasTex(`checker${a}${b}`, 64, 64, (g) => {
  g.fillStyle = a; g.fillRect(0, 0, 64, 64);
  g.fillStyle = b; g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32);
  g.strokeStyle = 'rgba(0,0,0,0.12)';
  g.strokeRect(0.5, 0.5, 31, 31); g.strokeRect(32.5, 32.5, 31, 31);
}, { nearest: true });

// Arcade carpet: dark, with the neon squiggles and stars every kid remembers.
export const carpet = (base = '#1b1440') => REALISTIC ? R.carpet(base) : canvasTex(`carpet${base}`, 128, 128, (g) => {
  g.fillStyle = base; g.fillRect(0, 0, 128, 128);
  const colors = ['#ff3fa4', '#2de2e6', '#ffd23f', '#7cff6b', '#a970ff'];
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  g.lineWidth = 3;
  for (let i = 0; i < 18; i++) {
    g.strokeStyle = colors[i % colors.length];
    g.beginPath();
    const x = rand() * 128, y = rand() * 128;
    g.moveTo(x, y);
    g.bezierCurveTo(x + 14, y - 12, x + 10, y + 16, x + 26, y + 6);
    g.stroke();
  }
  for (let i = 0; i < 16; i++) {
    g.fillStyle = colors[(i + 2) % colors.length];
    const x = rand() * 128, y = rand() * 128;
    g.beginPath();
    for (let k = 0; k < 10; k++) {
      const r = k % 2 ? 2 : 5;
      const a = (k / 10) * Math.PI * 2;
      g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    g.fill();
  }
});

export const tiles = (a = '#cfd8dc', line = '#9aa6ab') => REALISTIC ? R.tiles(a, line) : canvasTex(`tiles${a}`, 64, 64, (g) => {
  g.fillStyle = a; g.fillRect(0, 0, 64, 64);
  g.strokeStyle = line; g.lineWidth = 2;
  for (let i = 0; i <= 64; i += 32) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(64, i); g.stroke();
  }
});

export const concrete = () => REALISTIC ? R.concrete() : canvasTex('concrete', 64, 64, (g) => {
  g.fillStyle = '#56585e'; g.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 260; i++) {
    const v = 70 + Math.floor(Math.random() * 30);
    g.fillStyle = `rgb(${v},${v},${v + 4})`;
    g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2);
  }
  g.strokeStyle = 'rgba(20,20,24,0.4)';
  g.beginPath(); g.moveTo(5, 40); g.lineTo(22, 34); g.lineTo(30, 44); g.stroke();
});

// Squishy rubber play-mat squares in four bright colours.
export const playmat = () => REALISTIC ? R.playmat() : canvasTex('playmat', 64, 64, (g) => {
  const c = ['#ff5a5f', '#ffd23f', '#3ec1d3', '#7ad151'];
  for (let i = 0; i < 4; i++) {
    g.fillStyle = c[i];
    g.fillRect((i % 2) * 32, Math.floor(i / 2) * 32, 32, 32);
  }
  g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 2;
  g.strokeRect(1, 1, 30, 30); g.strokeRect(33, 1, 30, 30);
  g.strokeRect(1, 33, 30, 30); g.strokeRect(33, 33, 30, 30);
}, { nearest: true });

// Wooden floorboards: one canvas = 2 m.
export const wood = (base = '#9a6a3c') => REALISTIC ? R.wood(base) : canvasTex(`wood${base}`, 64, 64, (g) => {
  g.fillStyle = base; g.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 4; i++) {
    g.fillStyle = `rgba(0,0,0,${0.05 + (i % 2) * 0.06})`;
    g.fillRect(0, i * 16, 64, 16);
    g.fillStyle = 'rgba(40,20,10,0.5)';
    g.fillRect(0, i * 16, 64, 1);
    g.fillRect(((i * 23) % 48) + 8, i * 16, 1, 16);
  }
}, { nearest: true });

export const rug = (a = '#7a2a3a', b = '#d9b45a') => REALISTIC ? R.rug(a, b) : canvasTex(`rug${a}${b}`, 64, 64, (g) => {
  g.fillStyle = a; g.fillRect(0, 0, 64, 64);
  g.strokeStyle = b; g.lineWidth = 4; g.strokeRect(5, 5, 54, 54);
  g.lineWidth = 2; g.strokeRect(14, 14, 36, 36);
  g.fillStyle = b; g.beginPath(); g.arc(32, 32, 6, 0, Math.PI * 2); g.fill();
});

export const hazard = () => REALISTIC ? R.hazard() : canvasTex('hazard', 64, 64, (g) => {
  g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#f2c230';
  for (let i = -64; i < 128; i += 22) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 11, 0); g.lineTo(i + 11 - 64, 64); g.lineTo(i - 64, 64); g.fill();
  }
});

// ── Walls ───────────────────────────────────────────────────────────────
//
// Each wall texture is 1 m wide and the full wall height tall: a coloured upper wall, a
// stripe, and a lower band. UVs are laid out in metres, so every room tiles seamlessly.

export const wallPaint = (upper, band, lower, pattern = 'stripes') =>
  REALISTIC ? R.wallPaint(upper, band, lower, pattern) : canvasTex(`wall${upper}${band}${lower}${pattern}`, 64, 256, (g) => {
    g.fillStyle = upper; g.fillRect(0, 0, 64, 256);
    // the stripe sits at ~1.3 m on a 4.6 m wall
    g.fillStyle = band; g.fillRect(0, 168, 64, 12);
    g.fillStyle = lower; g.fillRect(0, 180, 64, 76);
    if (pattern === 'stripes') {
      g.fillStyle = 'rgba(255,255,255,0.08)';
      g.fillRect(0, 0, 32, 168);
    } else if (pattern === 'stars') {
      g.fillStyle = 'rgba(255,255,255,0.22)';
      for (const [x, y] of [[14, 30], [44, 70], [22, 118], [50, 146]]) {
        g.beginPath();
        for (let k = 0; k < 10; k++) {
          const r = k % 2 ? 3 : 7;
          const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
          g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        }
        g.fill();
      }
    } else if (pattern === 'bubbles') {
      g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 3;
      for (const [x, y, r] of [[16, 40, 8], [46, 90, 12], [24, 140, 6]]) {
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
      }
    } else if (pattern === 'panels') {
      g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2;
      g.strokeRect(4, 6, 56, 150);
    } else if (pattern === 'bricks') {
      g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = 2;
      for (let y = 0; y < 168; y += 16) {
        g.beginPath(); g.moveTo(0, y); g.lineTo(64, y); g.stroke();
        const off = (y / 16) % 2 ? 0 : 32;
        g.beginPath(); g.moveTo(off, y); g.lineTo(off, y + 16); g.stroke();
      }
    }
    // the lower band gets a checker
    g.fillStyle = 'rgba(0,0,0,0.22)';
    for (let x = 0; x < 64; x += 16) for (let y = 180; y < 256; y += 16) {
      if (((x + y) / 16) % 2 === 0) g.fillRect(x, y, 16, 16);
    }
  });

export const ceiling = () => REALISTIC ? R.ceiling() : canvasTex('ceiling', 64, 64, (g) => {
  g.fillStyle = '#2a2833'; g.fillRect(0, 0, 64, 64);
  g.strokeStyle = '#1a1920'; g.lineWidth = 3;
  g.strokeRect(0, 0, 64, 64);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.fillRect(Math.random() * 64, Math.random() * 64, 1, 1);
  }
});

export const curtain = () => REALISTIC ? R.curtain() : canvasTex('curtain', 64, 64, (g) => {
  const grd = g.createLinearGradient(0, 0, 64, 0);
  grd.addColorStop(0, '#5a0f3c'); grd.addColorStop(0.5, '#b02a72'); grd.addColorStop(1, '#5a0f3c');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
});

// ── Signs ───────────────────────────────────────────────────────────────

export function signTex(text, { bg = '#1b0f3a', fg = '#ffd23f', glow = '#ff3fa4', w = 512, h = 128,
                                font = 'bold 64px "Avenir Next", "Arial Rounded MT Bold", sans-serif',
                                border = true } = {}) {
  return canvasTex(`sign${text}${bg}${fg}${w}${h}`, w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    if (border) {
      g.strokeStyle = glow; g.lineWidth = 8;
      g.strokeRect(6, 6, w - 12, h - 12);
    }
    g.font = font;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = glow; g.shadowBlur = 18;
    g.fillStyle = fg;
    const lines = text.split('\n');
    lines.forEach((ln, i) => g.fillText(ln, w / 2, h / 2 + (i - (lines.length - 1) / 2) * (h / (lines.length + 0.4))));
  });
}

// A little arcade screen. `broken` swaps the game for an error.
export function screenTex(title, color, broken = false) {
  const key = `screen${title}${color}${broken}`;
  const tex = paintScreen(key, title, color, broken);
  if (!REALISTIC) return tex;
  // the realistic look puts it behind scanlines and curved glass
  return canvasTex(`crt${key}`, 256, 256, (g) => g.drawImage(R.crt(tex.image), 0, 0));
}

function paintScreen(key, title, color, broken) {
  return canvasTex(key, 64, 64, (g) => {
    if (broken) {
      g.fillStyle = '#300'; g.fillRect(0, 0, 64, 64);
      g.fillStyle = '#ff3b30';
      g.font = 'bold 13px monospace'; g.textAlign = 'center';
      g.fillText('ERROR', 32, 28);
      g.fillText('X_X', 32, 46);
      return;
    }
    g.fillStyle = '#05051a'; g.fillRect(0, 0, 64, 64);
    g.fillStyle = color;
    for (let i = 0; i < 6; i++) g.fillRect(6 + i * 9, 44 - (i * 7) % 20, 6, 6);
    g.fillRect(28, 50, 8, 8);
    g.font = 'bold 9px monospace'; g.textAlign = 'center';
    g.fillText(title.toUpperCase().slice(0, 10), 32, 14);
  }, { nearest: true });
}

// A poster on a wall: a coloured card with a big emoji-free doodle face.
export function posterTex(title, color, face = 'gus') {
  const key = `poster${title}${color}${face}`;
  const tex = paintPoster(key, title, color, face);
  return REALISTIC ? R.paper(tex.image, key) : tex;
}

function paintPoster(key, title, color, face) {
  return canvasTex(key, 128, 180, (g) => {
    g.fillStyle = color; g.fillRect(0, 0, 128, 180);
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillRect(8, 8, 112, 120);
    const cx = 64, cy = 66;
    const body = { gus: '#7a4a2b', gerald: '#3a3a44', chomper: '#a8642e', cranker: '#1d2230', flipper: '#5b8fc4' }[face];
    g.fillStyle = body;
    g.beginPath(); g.arc(cx, cy, 34, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff';
    g.beginPath(); g.arc(cx - 12, cy - 8, 9, 0, Math.PI * 2); g.arc(cx + 12, cy - 8, 9, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#111';
    g.beginPath(); g.arc(cx - 11, cy - 7, 4, 0, Math.PI * 2); g.arc(cx + 13, cy - 7, 4, 0, Math.PI * 2); g.fill();
    if (face === 'gus') { g.fillStyle = '#2f3640'; g.beginPath(); g.ellipse(cx, cy + 14, 24, 10, 0, 0, Math.PI * 2); g.fill(); }
    else if (face === 'cranker') { g.fillStyle = '#ff9a1f'; g.beginPath(); g.moveTo(cx - 8, cy + 6); g.lineTo(cx + 8, cy + 6); g.lineTo(cx, cy + 20); g.fill(); }
    else if (face === 'chomper') { g.fillStyle = '#fff'; g.fillRect(cx - 7, cy + 8, 6, 12); g.fillRect(cx + 1, cy + 8, 6, 12); }
    else if (face === 'flipper') { g.fillStyle = '#8fb7e0'; g.beginPath(); g.ellipse(cx, cy + 16, 10, 7, 0, 0, Math.PI * 2); g.fill(); }
    else { g.fillStyle = '#9b8f86'; g.beginPath(); g.ellipse(cx, cy + 12, 18, 12, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#fff';
    g.font = 'bold 20px "Avenir Next", sans-serif'; g.textAlign = 'center';
    const lines = title.split('\n');
    lines.forEach((ln, i) => g.fillText(ln, 64, 150 + i * 22));
  });
}
