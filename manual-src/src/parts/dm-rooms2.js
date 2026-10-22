// Dream Machine rooms v2 (Alphonse, 2026-10-21). Same API as DM_ROOMS in vendor/rooms.js, on a 1280 x 720 world:
//   { defs, order, stations, world, draw(ctx, key, colorway, quiet, t), pixelText(ctx, text, x, y, color, size, align) }
// Needs persona-engine.js first (COLORWAYS, tone). The static art of a room is painted once per room, colorway,
// scale and motion setting into an offscreen canvas and blitted; only the small animated bits paint each frame.
// With quiet true nothing moves: the resting frame of every animated bit is baked into the static layer.
"use strict";
const DM_ROOMS2 = (function(){
const W = 1280, H = 720, FLOOR = 382, BASE = 388;
let c = null, p = null, T = 0;

// ---------- color helpers ----------
const TONES = new Map();
function sh(hex, a){ const k = hex + a; let v = TONES.get(k); if (v === undefined) { v = tone(hex, a); TONES.set(k, v); } return v; }
function mix(a, b, t){ const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16); const ch = s => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t); return "#" + ((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1); }
function rgba(hex, a){ const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
function hash32(v){ let h = 2166136261; for (const ch of String(v)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const PALS = new Map();
function pal(cw){ let v = PALS.get(cw); if (v) return v; const b = COLORWAYS[cw] || COLORWAYS.voidArcade; v = Object.assign({}, b, { panel: mix(b.ink, b.sky2, .5) }); PALS.set(cw, v); return v; }

// ---------- pixel font: 7 rows, 2 px stems, NES style. Drawn as cached Path2D shapes, integer scales only ----------
const GLYPHS = {
A:"..###..|.##.##.|##...##|##...##|#######|##...##|##...##",B:"######.|##...##|##...##|######.|##...##|##...##|######.",
C:".#####.|##...##|##.....|##.....|##.....|##...##|.#####.",D:"#####..|##..##.|##...##|##...##|##...##|##..##.|#####..",
E:"#######|##.....|##.....|######.|##.....|##.....|#######",F:"#######|##.....|##.....|######.|##.....|##.....|##.....",
G:".#####.|##...##|##.....|##.####|##...##|##...##|.######",H:"##...##|##...##|##...##|#######|##...##|##...##|##...##",
I:"######|..##..|..##..|..##..|..##..|..##..|######",J:".....##|.....##|.....##|.....##|##...##|##...##|.#####.",
K:"##...##|##..##.|##.##..|####...|##.##..|##..##.|##...##",L:"##.....|##.....|##.....|##.....|##.....|##.....|#######",
M:"##...##|###.###|#######|##.#.##|##...##|##...##|##...##",N:"##...##|###..##|####.##|##.####|##..###|##...##|##...##",
O:".#####.|##...##|##...##|##...##|##...##|##...##|.#####.",P:"######.|##...##|##...##|######.|##.....|##.....|##.....",
Q:".#####.|##...##|##...##|##...##|##.#.##|##..##.|.###.##",R:"######.|##...##|##...##|######.|##.##..|##..##.|##...##",
S:".#####.|##...##|##.....|.#####.|.....##|##...##|.#####.",T:"######|..##..|..##..|..##..|..##..|..##..|..##..",
U:"##...##|##...##|##...##|##...##|##...##|##...##|.#####.",V:"##...##|##...##|##...##|##...##|.##.##.|..###..|...#...",
W:"##...##|##...##|##...##|##.#.##|#######|###.###|##...##",X:"##...##|##...##|.##.##.|..###..|.##.##.|##...##|##...##",
Y:"##..##|##..##|##..##|.####.|..##..|..##..|..##..",Z:"#######|....##.|...##..|..##...|.##....|##.....|#######",
0:".#####.|##...##|##..###|##.#.##|###..##|##...##|.#####.",1:"..##..|.###..|..##..|..##..|..##..|..##..|.####.",
2:".#####.|##...##|.....##|..####.|.##....|##.....|#######",3:".#####.|##...##|.....##|..####.|.....##|##...##|.#####.",
4:"...###.|..####.|.##.##.|##..##.|#######|....##.|....##.",5:"#######|##.....|######.|.....##|.....##|##...##|.#####.",
6:".#####.|##.....|##.....|######.|##...##|##...##|.#####.",7:"#######|##...##|....##.|...##..|..##...|..##...|..##...",
8:".#####.|##...##|##...##|.#####.|##...##|##...##|.#####.",9:".#####.|##...##|##...##|.######|.....##|.....##|.#####.",
" ":"...|...|...|...|...|...|...","-":".....|.....|.....|#####|.....|.....|.....",".":"..|..|..|..|..|##|##",",":"...|...|...|...|.##|.##|##.",
":":"..|##|##|..|##|##|..","!":"##|##|##|##|##|..|##","?":".#####.|##...##|.....##|...###.|..##...|.......|..##...",
"/":".....##|....##.|...##..|..##...|.##....|##.....|.......","'":"##|##|.#|..|..|..|..","+":"......|..##..|..##..|######|..##..|..##..|......",
"#":".##.##.|#######|.##.##.|.##.##.|#######|.##.##.|.......","(":".##|##.|##.|##.|##.|##.|.##",")":"##.|.##|.##|.##|.##|.##|##.",
"=":"......|......|######|......|######|......|......","%":"##...##|##..##.|...##..|..##...|.##....|##..##.|##...##",
">":".##....|..##...|...##..|....##.|...##..|..##...|.##....","<":"....##.|...##..|..##...|.##....|..##...|...##..|....##.",
"*":"......|.#..#.|..##..|######|..##..|.#..#.|......","·":"..|..|..|##|##|..|..","&":".###...|##.##..|.###...|.###.##|##.###.|##..##.|.###.##"
};
const GP = {}; for (const k in GLYPHS) { const rows = GLYPHS[k].split("|"); GP[k] = { rows, w: Math.max(...rows.map(r => r.length)) }; }
const TXT = new Map();
function textShape(text, u){
  const key = u + "|" + text; let v = TXT.get(key); if (v) return v;
  if (TXT.size > 900) TXT.clear();
  const fill = new Path2D(), out = new Path2D(); let x = 0;
  for (const ch of text) {
    const g = GP[ch] || GP["?"];
    for (let r = 0; r < 7; r++) { const row = g.rows[r] || ""; for (let i = 0; i < row.length; i++) if (row[i] === "#") { fill.rect(x + i * u, r * u, u, u); out.rect(x + i * u - 1, r * u - 1, u + 2, u + 2); } }
    x += (g.w + 1) * u;
  }
  v = { fill, out, w: Math.max(0, x - u) }; TXT.set(key, v); return v;
}
const unitFor = size => size < 10 ? 1 : size < 20 ? 2 : Math.max(2, Math.round(size / 8));
function textW(text, size = 8){ return textShape(String(text).toUpperCase(), unitFor(size)).w; }
// size 8 = 1x (8 px cell), 16 = 2x, 24 = 3x. y is the vertical center. outline: color, or null for none.
function pixelText(ctx, text, x, y, color, size = 12, align = "left", outline){
  const s = String(text).toUpperCase(), u = unitFor(size), t = textShape(s, u);
  let x0 = x; if (align === "center") x0 -= t.w / 2; else if (align === "right") x0 -= t.w;
  x0 = Math.round(x0); const y0 = Math.round(y - Math.floor(7 * u / 2));
  ctx.save(); ctx.translate(x0, y0);
  if (outline !== null) { ctx.fillStyle = outline || (p ? p.ink : "#05060B"); const d = Math.max(1, u >> 1); ctx.translate(d, d); ctx.fill(t.out); ctx.translate(-d, -d); ctx.fill(t.out); }
  ctx.fillStyle = color; ctx.fill(t.fill); ctx.restore();
  return t.w;
}
const txt = (text, x, y, color, size = 8, align = "left", outline) => pixelText(c, text, x, y, color, size, align, outline);

// ---------- primitives ----------
function R(col, x, y, w, h){ c.fillStyle = col; c.fillRect(x, y, w, h); }
function P(col, pts){ c.fillStyle = col; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); c.fill(); }
function E(col, cx, cy, rx, ry){ c.fillStyle = col; c.beginPath(); c.ellipse(cx, cy, Math.max(.5, rx), Math.max(.5, ry ?? rx), 0, 0, Math.PI * 2); c.fill(); }
// beveled slab: 2 px ink outline, then light top, lit left, shaded right, dark bottom
function box(col, x, y, w, h, o){
  const ol = o && o.ol !== undefined ? o.ol : 2, b = (o && o.b) || 2;
  if (ol) R(p.ink, x - ol, y - ol, w + ol * 2, h + ol * 2);
  R(col, x, y, w, h);
  R(sh(col, .35), x, y, w, b); R(sh(col, .14), x, y + b, b, h - b * 2);
  R(sh(col, -.28), x + w - b, y + b, b, h - b * 2); R(sh(col, -.5), x, y + h - b, w, b);
}
function inset(col, x, y, w, h){ R(p.ink, x - 2, y - 2, w + 4, h + 4); R(col, x, y, w, h); R(sh(col, -.45), x, y, w, 2); R(sh(col, -.3), x, y, 2, h); R(sh(col, .22), x, y + h - 1, w, 1); }
const PATS = new Map();
function pat(col, kind){
  const k = col + kind; let v = PATS.get(k); if (v) return v;
  const n = kind === "chk" ? 2 : 4, cv = document.createElement("canvas"); cv.width = cv.height = n;
  const g = cv.getContext("2d"); g.fillStyle = col;
  if (kind === "chk") { g.fillRect(0, 0, 1, 1); g.fillRect(1, 1, 1, 1); }
  else if (kind === "chk2") { g.fillRect(0, 0, 2, 2); g.fillRect(2, 2, 2, 2); }
  else if (kind === "sparse") { g.fillRect(0, 0, 1, 1); g.fillRect(2, 2, 1, 1); }
  else if (kind === "lines") { g.fillRect(0, 0, 4, 1); g.fillRect(0, 2, 4, 1); }
  else if (kind === "dense") { g.fillRect(0, 0, 4, 4); g.clearRect(0, 0, 1, 1); g.clearRect(2, 2, 1, 1); }
  v = c.createPattern(cv, "repeat"); PATS.set(k, v); return v;
}
function D(col, x, y, w, h, kind = "chk"){ c.fillStyle = pat(col, kind); c.fillRect(x, y, w, h); }
// stepped vertical gradient with dithered seams, SNES sky style
function bands(x, y, w, h, cols){
  const n = cols.length, bh = h / n;
  for (let i = 0; i < n; i++) R(cols[i], x, Math.round(y + i * bh), w, Math.ceil(bh) + 1);
  for (let i = 1; i < n; i++) { const yy = Math.round(y + i * bh), q = Math.max(2, Math.min(6, Math.round(bh / 4)));
    D(cols[i], x, yy - q * 2, w, q, "sparse"); D(cols[i], x, yy - q, w, q, "chk"); D(cols[i - 1], x, yy, w, q, "sparse"); }
}
function halo(col, x, y, w, h, a = .16){ c.save(); c.globalCompositeOperation = "lighter"; c.fillStyle = col;
  c.globalAlpha = a; c.fillRect(x - 2, y - 2, w + 4, h + 4); c.globalAlpha = a * .55; c.fillRect(x - 6, y - 6, w + 12, h + 12); c.globalAlpha = a * .3; c.fillRect(x - 12, y - 12, w + 24, h + 24); c.restore(); }
function pool(col, cx, cy, rx, ry, a = .07){ c.save(); c.globalCompositeOperation = "lighter"; c.globalAlpha = a; for (const k of [1, .72, .46]) E(col, cx, cy, rx * k, ry * k); c.restore(); }
function floorShadow(x, w, y = BASE){ c.save(); c.globalAlpha = .3; E(p.ink, x + w / 2, y + 4, w / 2 + 22, 12); c.globalAlpha = .5; E(p.ink, x + w / 2, y + 2, w / 2 + 8, 7); c.restore(); }
function bulb(x, y){ R(p.ink, x - 1, y - 1, 6, 6); R(sh(p.gold, -.25), x, y, 4, 4); R(sh(p.gold, .5), x, y, 2, 2); }
function litBulb(x, y){ R(p.gold, x, y, 4, 4); R("#ffffff", x, y, 2, 2); }
function star(cx, cy, r, col){ const a1 = [], a2 = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * .45 : r; a1.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); a2.push([cx + Math.cos(a) * (rr + 2.5), cy + Math.sin(a) * (rr + 2.5)]); } P(p.ink, a2); P(col, a1); R(sh(col, .5), cx - 2, cy - 4, 3, 3); }
// sign plate on the wall: ink outline, beveled dark panel, outlined text
function plate(text, cx, cy, col, size = 8, glow){
  const u = unitFor(size), tw = textW(text, size), px = 5 + 2 * u, py = 3 + u, w = tw + px * 2, h = 7 * u + py * 2;
  const x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
  if (glow) halo(col, x, y, w, h, .12);
  R(p.ink, x - 2, y - 2, w + 4, h + 4); R(p.panel, x, y, w, h); R(sh(p.panel, .25), x, y, w, 1); R(sh(p.panel, -.45), x, y + h - 2, w, 2);

  txt(text, cx, cy, col, size, "center");
}

// ---------- the shell every room shares: ceiling, molding, wall, wainscot, baseboard, floor ----------
function env(o){
  bands(0, 0, W, 112, [sh(p.sky, -.4), sh(p.sky, -.22), p.sky, mix(p.sky, p.sky2, .55)]);
  if (o.ceil === "dome") dome();
  else if (o.ceil === "coffer") {
    const X = (xf, y) => 640 + (xf - 640) * (1 + (112 - y) / 112 * .9), dk = sh(p.sky, -.35), lt = mix(p.sky, p.sky2, .8);
    for (const [y0, hh] of [[4, 30], [40, 22], [68, 16], [90, 12]]) for (let i = -8; i < 22; i++) {
      const xa = Math.round(X(i * 96 + 8, y0 + hh / 2)), xb = Math.round(X(i * 96 + 88, y0 + hh / 2)); if (xb < 0 || xa > W) continue;
      R(p.ink, xa, y0, xb - xa, hh); R(dk, xa + 2, y0 + 2, xb - xa - 4, hh - 4); R(lt, xa + 2, y0 + hh - 3, xb - xa - 4, 1); R(sh(dk, -.3), xa + 2, y0 + 2, xb - xa - 4, 2);
    }
  } else {
    const beam = sh(p.sky, -.5);
    for (const yy of [38, 68, 88, 101, 108]) R(beam, 0, yy, W, 2);
    for (let i = -6; i <= 22; i++) { const xf = i * 80, xn = 640 + (xf - 640) * 1.8; P(beam, [[xn - 2, 0], [xn + 2, 0], [xf + 1, 112], [xf - 1, 112]]); }
  }
  // crown molding with dentils
  R(p.ink, 0, 110, W, 16); R(o.trim, 0, 112, W, 11); R(sh(o.trim, .4), 0, 112, W, 2); R(sh(o.trim, -.45), 0, 121, W, 2);
  for (let x = 3; x < W; x += 14) { R(sh(o.trim, -.32), x, 115, 7, 4); R(sh(o.trim, .22), x, 115, 7, 1); }
  // upper wall
  bands(0, 126, W, 170, [sh(o.wall, -.3), sh(o.wall, -.15), o.wall, sh(o.wall, .05)]);
  wallpaper(o);
  if (o.neon) { R(p.ink, 0, 156, W, 7); R(o.neon, 0, 158, W, 3); R(sh(o.neon, .6), 0, 159, W, 1); halo(o.neon, 0, 158, W, 3, .14); }
  // chair rail + wainscot panels
  R(p.ink, 0, 294, W, 9); R(o.trim, 0, 296, W, 5); R(sh(o.trim, .35), 0, 296, W, 1);
  R(o.wall2, 0, 303, W, 59);
  for (let x = 6; x < W; x += 64) { R(sh(o.wall2, -.35), x, 310, 52, 2); R(sh(o.wall2, -.35), x, 310, 2, 44); R(sh(o.wall2, .16), x, 352, 52, 2); R(sh(o.wall2, .16), x + 50, 310, 2, 44); }
  // baseboard
  R(p.ink, 0, 360, W, 24); R(o.trim, 0, 362, W, 18); R(sh(o.trim, .3), 0, 362, W, 2); R(sh(o.trim, -.4), 0, 377, W, 3);
  if (o.floor === "carpet") carpet(); else tiles(o.floor === "marble");
  c.save(); c.globalAlpha = .55; R(p.ink, 0, FLOOR, W, 5); c.restore(); D(p.ink, 0, FLOOR + 5, W, 6, "chk"); D(p.ink, 0, FLOOR + 11, W, 6, "sparse");
}
function wallpaper(o){
  const a = sh(o.wall, .12), b = sh(o.wall, -.16);
  if (o.paper === "diamond") { for (let y = 138, r = 0; y < 292; y += 22, r++) for (let x = (r % 2) * 18; x < W; x += 36) { P(b, [[x, y - 7], [x + 7, y], [x, y + 7], [x - 7, y]]); R(a, x - 1, y - 1, 2, 2); } }
  else if (o.paper === "stripe") { for (let x = 0; x < W; x += 28) { R(a, x, 126, 4, 168); R(b, x + 4, 126, 1, 168); D(a, x + 12, 126, 6, 168, "sparse"); } }
  else if (o.paper === "panel") {
    for (let x = 0; x < W; x += 80) { R(b, x, 126, 2, 168); R(a, x + 2, 126, 1, 168); for (const y of [134, 214, 284]) for (const dx of [8, 70]) { R(p.ink, x + dx, y, 3, 3); R(a, x + dx, y, 2, 2); } }
    R(b, 0, 208, W, 2); R(a, 0, 210, W, 1);
  } else if (o.paper === "block") {
    for (let r = 0, y = 146; y < 294; y += 30, r++) { R(b, 0, y, W, 2); R(a, 0, y + 2, W, 1); for (let x = (r % 2) * 48; x < W; x += 96) R(b, x, y, 2, 30); }
    c.save(); c.globalAlpha = .5; for (let i = 0; i < 60; i++) { const h = hash32("vein" + i), x = h % W, y = 150 + (h >>> 9) % 140; P(a, [[x, y], [x + 14, y + 5], [x + 13, y + 6], [x - 1, y + 1]]); } c.restore();
    R(p.ink, 0, 126, W, 20); R(sh(o.trim, -.25), 0, 128, W, 16);
    const m = sh(o.trim, .25);
    for (let x = 0; x < W; x += 20) { R(m, x + 2, 130, 14, 2); R(m, x + 14, 130, 2, 10); R(m, x + 6, 138, 10, 2); R(m, x + 6, 134, 2, 6); R(m, x + 6, 134, 5, 2); R(m, x + 2, 130, 2, 12); R(m, x + 2, 140, 18, 2); }
  }
}
function carpet(){
  const base = mix(p.ink, p.violet, .2);
  bands(0, FLOOR, W, H - FLOOR, [mix(p.ink, p.violet, .1), mix(p.ink, p.violet, .15), base, mix(p.ink, p.violet, .25)]);
  D(sh(base, .14), 0, FLOOR, W, H - FLOOR, "sparse");
  const cols = [p.pink, p.cyan, p.gold, p.mint, sh(p.violet, .35)];
  for (let i = 0; i < 180; i++) {
    const h = hash32("cpt" + i), y = FLOOR + 12 + (h >>> 8) % (H - FLOOR - 14), x = (h % 1300) - 10;
    const k = .55 + (y - FLOOR) / (H - FLOOR) * .6, col = mix(cols[(h >>> 4) % 5], base, .38), dk = sh(col, -.55), s = Math.max(2, Math.round(2.6 * k));
    switch ((h >>> 12) % 6) {
      case 0: P(dk, [[x + 1, y + 1], [x + 4 * s + 1, y + s + 1], [x + s + 1, y + 4 * s + 1]]); P(col, [[x, y], [x + 4 * s, y + s], [x + s, y + 4 * s]]); break;
      case 1: for (let j = 0; j < 4; j++) { R(dk, x + j * s + 1, y + (j % 2) * s + 1, s, s); R(col, x + j * s, y + (j % 2) * s, s, s); } break;
      case 2: R(dk, x + 1, y + s + 1, s * 3, s); R(dk, x + s + 1, y + 1, s, s * 3); R(col, x, y + s, s * 3, s); R(col, x + s, y, s, s * 3); break;
      case 3: c.strokeStyle = col; c.lineWidth = Math.max(1, s * .8); c.beginPath(); c.arc(x, y, s * 1.6, 0, Math.PI * 2); c.stroke(); break;
      case 4: R(dk, x + 1, y + 1, s * 4, s); R(col, x, y, s * 4, s); break;
      default: R(dk, x + 1, y + 1, s * 2, s * 2); R(col, x, y, s * 2, s * 2); R(sh(col, .5), x, y, s, s);
    }
  }
}
function tiles(marble){
  const VY = 40, r = Math.pow((H - VY) / (FLOOR - VY), 1 / 8), rows = [];
  for (let k = 0; k <= 8; k++) rows.push(VY + (FLOOR - VY) * Math.pow(r, k));
  const X = (xb, y) => 640 + (xb - 640) * (y - VY) / (H - VY);
  const A = marble ? mix(p.paper, p.ink, .5) : mix(p.floor, p.grid, .45), B = marble ? mix(p.paper, p.ink, .66) : sh(p.floor, -.05), G = sh(B, -.45);
  for (let k = 0; k < 8; k++) { const y0 = rows[k], y1 = rows[k + 1];
    for (let i = -11; i <= 11; i++) { const xa = 640 + (i - .5) * 128, xb = 640 + (i + .5) * 128;
      P((i + k) & 1 ? A : B, [[X(xa, y0), y0], [X(xb, y0), y0], [X(xb, y1), y1], [X(xa, y1), y1]]);
      R(sh((i + k) & 1 ? A : B, .2), X(xa, y0) + 2, y0 + 1, X(xb, y0) - X(xa, y0) - 4, 1); }
    R(G, 0, Math.round(y0), W, 1);
  }
  c.strokeStyle = G; c.lineWidth = 1; c.beginPath();
  for (let i = -11; i <= 12; i++) { const xa = 640 + (i - .5) * 128; c.moveTo(X(xa, FLOOR), FLOOR); c.lineTo(X(xa, H), H); } c.stroke();
  if (marble) { c.save(); c.globalAlpha = .45; for (let i = 0; i < 70; i++) { const h = hash32("mv" + i), x = h % W, y = FLOOR + 10 + (h >>> 9) % 320; P(sh(A, .3), [[x, y], [x + 20, y + 6], [x + 34, y + 3], [x + 34, y + 4], [x + 20, y + 7], [x, y + 1]]); } c.restore();
    R(p.ink, 0, FLOOR + 18, W, 10); R(mix(p.gold, p.ink, .45), 0, FLOOR + 20, W, 6); for (let x = 0; x < W; x += 24) R(sh(mix(p.gold, p.ink, .45), .3), x, FLOOR + 22, 12, 2); }
  else D(sh(A, .25), 0, FLOOR, W, H - FLOOR, "sparse");
}
function dome(){
  for (let i = -9; i <= 9; i++) { const xb = 700 + i * 92, xt = 700 + i * 36; P(p.ink, [[xt - 2, 0], [xt + 2, 0], [xb + 3, 112], [xb - 3, 112]]); P(sh(p.steel, -.35), [[xt - 1, 0], [xt, 0], [xb + 1, 112], [xb - 1, 112]]); }
  P(p.ink, [[610, 0], [790, 0], [810, 112], [590, 112]]);
  c.save(); c.beginPath(); c.moveTo(620, 0); c.lineTo(780, 0); c.lineTo(800, 112); c.lineTo(600, 112); c.closePath(); c.clip();
  bands(596, 0, 210, 112, [sh(p.sky, -.55), sh(p.sky, -.35), p.sky, mix(p.sky, p.violet, .22)]);
  for (let k = 0; k < 44; k++) { const h = hash32("ds" + k), z = k % 9 ? 1 : 2; R(k % 6 ? p.paper : p.cyan, 600 + h % 200, (h >>> 8) % 110, z, z); }
  E(p.paper, 758, 30, 11); E(mix(p.sky, p.ink, .3), 763, 26, 10);
  c.restore();
  P(sh(p.steel, .1), [[613, 0], [620, 0], [600, 112], [593, 112]]); P(sh(p.steel, .1), [[780, 0], [787, 0], [807, 112], [800, 112]]);
}
function lamps(xs, col){
  for (const x of xs) {
    R(p.ink, x - 1, 0, 3, 34);
    P(p.ink, [[x - 14, 32], [x + 14, 32], [x + 22, 52], [x - 22, 52]]); P(sh(p.steel, -.2), [[x - 12, 34], [x + 12, 34], [x + 19, 50], [x - 19, 50]]);
    R(sh(p.steel, .3), x - 11, 35, 10, 2); R(p.ink, x - 20, 50, 40, 4); R(col, x - 8, 52, 16, 4); R(sh(col, .6), x - 4, 52, 8, 2);
    c.save(); c.globalCompositeOperation = "lighter"; c.globalAlpha = .045; P(col, [[x - 16, 56], [x + 16, 56], [x + 90, 300], [x - 90, 300]]); c.globalAlpha = .03; P(col, [[x - 16, 56], [x + 16, 56], [x + 130, 384], [x - 130, 384]]); c.restore();
  }
}
// the hanging DREAM MACHINE cloud with a marquee strip of chasing bulbs
const SIGN_X = 640, SIGN_Y = 58, SIGN_BULBS = []; for (let bx = SIGN_X - 140; bx <= SIGN_X + 140; bx += 14) SIGN_BULBS.push(bx);
function cloudSign(){
  const cx = SIGN_X, cy = SIGN_Y;
  for (const dx of [-112, 112]) for (let y = 0; y < cy - 28; y += 6) { R(p.ink, cx + dx - 2, y, 5, 6); R(sh(p.steel, .15), cx + dx - 1, y + 1, 3, 3); }
  c.save(); c.globalCompositeOperation = "lighter"; c.globalAlpha = .08; E(p.pink, cx, cy, 240, 70); E(p.cyan, cx, cy, 200, 56); c.restore();
  const puffs = [[-170, 10, 24], [-142, -8, 28], [-98, -18, 30], [-44, -24, 31], [12, -26, 31], [68, -20, 30], [120, -9, 29], [164, 9, 24], [-122, 20, 25], [-62, 24, 27], [0, 25, 28], [62, 24, 27], [122, 20, 25]];
  for (const [dx, dy, r] of puffs) E(p.ink, cx + dx, cy + dy, r + 3);
  for (const [dx, dy, r] of puffs) E(sh(p.paper, -.32), cx + dx, cy + dy + 3, r);
  for (const [dx, dy, r] of puffs) E(p.paper, cx + dx - 1, cy + dy - 1, r - 3);
  R(p.paper, cx - 150, cy - 10, 300, 30);
  for (const [dx, dy, r] of puffs.slice(0, 8)) R("#ffffff", cx + dx - r * .4, cy + dy - r * .62, 7, 3);
  txt("DREAM", cx, cy - 14, p.pink, 32, "center");
  txt("MACHINE", cx, cy + 18, p.violet, 24, "center");
  R(p.ink, cx - 150, cy + 38, 300, 11); R(mix(p.violet, p.ink, .55), cx - 148, cy + 40, 296, 7);
  for (const bx of SIGN_BULBS) R(sh(p.gold, -.55), bx - 2, cy + 41, 4, 4);
}
function signBulbs(){ const on = Math.floor(T * 8); SIGN_BULBS.forEach((bx, i) => { if ((i + on) % 3 === 0) litBulb(bx - 2, SIGN_Y + 41); }); }
// ambient touches every room keeps: the bobbing glitch critter, the little gold candle, the drifting cloud
function amb(){
  const bob = Math.round(Math.sin(T * 2) * 2), x = 14, y = 546 + bob;
  R(p.ink, x - 8, y + 6, 40, 8); R(p.mint, x - 6, y + 8, 36, 4);
  R(p.ink, x - 2, y - 2, 26, 20); R(p.mint, x, y, 22, 16); R(sh(p.mint, .45), x, y, 22, 3); R(sh(p.mint, -.35), x, y + 13, 22, 3);
  R(p.ink, x + 5, y + 5, 4, 4); R(p.ink, x + 13, y + 5, 4, 4); R("#ffffff", x + 5, y + 5, 2, 2); R("#ffffff", x + 13, y + 5, 2, 2);
  if (Math.floor(T * 3) % 7 === 3) { R(p.pink, x - 4, y + 3, 30, 2); R(p.cyan, x + 3, y + 11, 24, 1); }
  const fx = 1250, fy = 556, fl = Math.round(Math.sin(T * 9) * 1.5);
  R(p.ink, fx - 2, fy - 2, 15, 26); R(p.gold, fx, fy, 11, 22); R(sh(p.gold, .4), fx, fy, 3, 22); R(sh(p.gold, -.35), fx + 8, fy, 3, 22);
  R(p.pink, fx + 3, fy - 8 + fl, 5, 7); R(p.gold, fx + 4, fy - 5 + fl, 3, 4);
  const u = (T * 22) % 1400 - 60;
  if (u > -50) { for (const [dx, dy, r] of [[8, 30, 8], [20, 25, 10], [32, 30, 8]]) E(p.ink, u + dx, dy, r + 2); for (const [dx, dy, r] of [[8, 30, 8], [20, 25, 10], [32, 30, 8]]) E(p.paper, u + dx, dy, r); R(sh(p.paper, -.25), u + 2, 34, 36, 2); }
}

// ---------- arcade props ----------
function game(gi, x, y, w, h, t){
  R(sh(p.sky, -.3), x, y, w, h);
  const bg = sh(p.sky, -.3);
  if (gi === 0) {
    R(mix(p.violet, p.ink, .6), x, y, w, 28); R(mix(p.bronze, p.ink, .3), x, y + h - 10, w, 10); R(sh(p.bronze, .1), x, y + h - 10, w, 1);
    const h1 = 20 - (Math.floor(t * .7) % 9) * 2, h2 = 20 - (Math.floor(t * .9 + 3) % 8) * 2;
    R(p.gold, x + 3, y + 3, h1, 3); R(p.gold, x + w - 3 - h2, y + 3, h2, 3);
    const a = Math.round(Math.sin(t * 2.2) * 6), b = Math.round(Math.sin(t * 2.2 + 1.3) * 6);
    for (const [fx, col, dir] of [[x + 15 + a, p.pink, 1], [x + w - 15 - b, p.cyan, -1]]) { const fy = y + h - 10; R(col, fx - 3, fy - 11, 7, 7); R(sh(p.rust, .5), fx - 2, fy - 16, 5, 5); R(sh(col, -.4), fx - 3, fy - 4, 2, 4); R(sh(col, -.4), fx + 2, fy - 4, 2, 4); R(p.paper, fx + 4 * dir, fy - 10, 3, 2); }
    if (Math.sin(t * 6) > .8) R("#ffffff", x + w / 2 - 2, y + h - 24, 4, 4);
  } else if (gi === 1) {
    // MKII: two kombatants squared off on a dark stone arena under a sickly green sky
    R(mix(p.mint, p.ink, .84), x, y, w, 24); E(mix(p.mint, p.paper, .45), x + 43, y + 11, 5); E(mix(p.mint, p.ink, .84), x + 45, y + 10, 4);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 8; k++) { const bx = x + k * 8 - (r % 2) * 4; R(mix(p.steel, p.ink, r % 2 ? .62 : .52), bx, y + 22 + r * 6, 7, 5); R(mix(p.steel, p.ink, .35), bx, y + 22 + r * 6, 7, 1); }
    R(mix(p.steel, p.ink, .74), x, y + 40, w, 12); R(mix(p.steel, p.ink, .45), x, y + 40, w, 1); R(rgba(p.mint, .25), x, y + 18, w, 2);
    const h1 = 21 - (Math.floor(t * .8) % 8) * 2, h2 = 21 - (Math.floor(t * .6 + 2) % 9) * 2;
    R(p.ink, x + 2, y + 2, 23, 6); R(p.ink, x + w - 25, y + 2, 23, 6); R(p.rust, x + 3, y + 3, 21, 4); R(p.rust, x + w - 24, y + 3, 21, 4); R(p.mint, x + 3, y + 3, h1, 4); R(p.mint, x + w - 3 - h2, y + 3, h2, 4);
    const a = Math.round(Math.sin(t * 1.9) * 4), b = Math.round(Math.sin(t * 1.9 + 2) * 4), hit = Math.sin(t * 3.1) > .7;
    for (const [fx, col, dir, atk] of [[x + 16 + a, p.gold, 1, hit], [x + w - 16 - b, p.cyan, -1, !hit && Math.sin(t * 2.3) > .6]]) { const fy = y + 46;
      R(sh(col, -.35), fx - 3, fy - 5, 2, 5); R(sh(col, -.35), fx + 2, fy - 5, 2, 5); R(col, fx - 3, fy - 13, 7, 8); R(p.ink, fx - 3, fy - 8, 7, 1);
      R(col, fx - 2, fy - 18, 5, 5); R(p.ink, fx - 2 + (dir > 0 ? 2 : 0), fy - 16, 3, 1); R(p.paper, fx - 1 + (dir > 0 ? 2 : 0), fy - 16, 1, 1);
      R(col, atk ? fx + (dir > 0 ? 4 : -9) : fx + (dir > 0 ? 3 : -5), fy - 12, atk ? 6 : 3, 2); }
    if (hit) R(p.paper, x + w / 2 - 1, y + 32, 3, 3);
    if (t % 7 < 1.1) txt("FIGHT", x + w / 2, y + 20, p.rust, 8, "center");
  } else if (gi === 2) {
    // TMNT: two turtles brawling on a city street at dusk, a Foot-style ninja walking in
    R(mix(p.violet, p.ink, .5), x, y, w, 18); R(mix(p.pink, p.violet, .5), x, y + 14, w, 6); D(mix(p.rust, p.pink, .4), x, y + 14, w, 3, "chk");
    for (let k = 0; k < 6; k++) { const bh = 8 + (k * 7) % 11, bx = x + k * 10 - 2; R(mix(p.ink, p.violet, .25), bx, y + 22 - bh, 9, bh); for (let j = 0; j < 2; j++) if ((k + j) % 2) R(p.gold, bx + 2 + j * 4, y + 24 - bh, 2, 2); }
    R(mix(p.steel, p.ink, .5), x, y + 22, w, 30); R(mix(p.steel, p.ink, .25), x, y + 30, w, 1);
    for (let k = 0; k < 4; k++) R(p.gold, Math.round(x + ((k * 16 - t * 12) % 64 + 64) % 64 - 6), y + 47, 6, 1);
    const h1 = 16 - (Math.floor(t * .7) % 6) * 2, h2 = 16 - (Math.floor(t * .5 + 1) % 7) * 2;
    R(p.cyan, x + 3, y + 3, h1, 3); R(p.rust, x + 3, y + 8, h2, 3);
    const g = sh(p.mint, -.3), a = Math.round(Math.sin(t * 2.4) * 3), nx = Math.round(x + w - 8 - ((t * 7) % 14));
    for (const [fx, mask] of [[x + 12 + a, p.cyan], [x + 24 - a, p.rust]]) { const fy = y + 46;
      R(g, fx - 3, fy - 5, 2, 5); R(g, fx + 1, fy - 5, 2, 5); R(p.bronze, fx - 4, fy - 13, 8, 8); R(sh(p.gold, -.1), fx - 2, fy - 12, 4, 6); R(g, fx - 3, fy - 13, 1, 8);
      R(g, fx - 2, fy - 18, 6, 5); R(mask, fx - 2, fy - 17, 6, 2); R(p.ink, fx + 2, fy - 17, 1, 1); R(p.silver, fx + 4, fy - 20, 1, 9); }
    const fc = mix(p.violet, p.ink, .45); R(fc, nx - 3, y + 41, 2, 5); R(fc, nx + 1, y + 41, 2, 5); R(fc, nx - 3, y + 33, 6, 8); R(fc, nx - 2, y + 28, 5, 5); R(p.rust, nx - 2, y + 30, 2, 1); R(p.paper, nx - 5, y + 32, 2, 1);
  } else if (gi === 3) {
    // X-Men: heroes in blue and gold suits in the Danger Room, a Sentinel looming on the right
    R(mix(p.steel, p.ink, .66), x, y, w, h); for (let k = 0; k < 7; k++) { R(mix(p.cyan, p.ink, .75), x + k * 9, y, 1, 40); R(mix(p.cyan, p.ink, .75), x, y + k * 7, w, 1); }
    R(mix(p.steel, p.ink, .42), x, y + 40, w, 12); R(mix(p.steel, p.ink, .2), x, y + 40, w, 1);
    const sv = mix(p.violet, p.pink, .25), sy2 = y + 4 + Math.round(Math.sin(t * .8) * 1);
    R(sv, x + 33, sy2 + 16, 22, 22); R(p.silver, x + 39, sy2 + 21, 10, 7); R(sv, x + 30, sy2 + 16, 4, 14); R(sv, x + 36, sy2, 14, 15); R(p.silver, x + 38, sy2 + 4, 10, 9);
    const blink = Math.floor(t * 2) % 5 !== 0; if (blink) { R(p.gold, x + 39, sy2 + 7, 3, 2); R(p.gold, x + 44, sy2 + 7, 3, 2); } R(p.ink, x + 40, sy2 + 11, 6, 1);
    const blue = mix(p.cyan, p.ink, .35), h1 = 18 - (Math.floor(t * .6) % 6) * 2, a = Math.round(Math.sin(t * 2.2) * 3);
    R(p.gold, x + 3, y + 3, h1, 3); R(sv, x + w - 21, y + 3, 18, 3);
    for (const [fx, kind] of [[x + 9 + a, 0], [x + 21 - a, 1]]) { const fy = y + 46;
      R(blue, fx - 3, fy - 5, 2, 5); R(blue, fx + 1, fy - 5, 2, 5); R(p.gold, fx - 3, fy - 13, 6, 8); R(blue, fx - 3, fy - 13, 1, 8); R(blue, fx + 2, fy - 13, 1, 8); R(p.ink, fx - 3, fy - 7, 6, 1);
      R(kind ? p.gold : blue, fx - 2, fy - 18, 5, 5); if (kind) { R(blue, fx - 3, fy - 19, 2, 3); R(blue, fx + 2, fy - 19, 2, 3); for (let j = 0; j < 3; j++) R(p.silver, fx + 4, fy - 13 + j * 2, 3, 1); } else R(p.rust, fx - 1, fy - 16, 4, 1); }
    if (Math.sin(t * 2) > .45) { R(p.rust, x + 13 + a, y + 30, x + 33 - (x + 13 + a), 2); R(p.paper, x + 13 + a, y + 30, x + 33 - (x + 13 + a), 1); }
  } else {
    // OUTRUN: a red convertible on a road to the horizon, palm trees, sunset
    bands(x, y, w, 20, [mix(p.violet, p.ink, .35), mix(p.pink, p.violet, .45), mix(p.rust, p.gold, .35)]);
    c.save(); c.beginPath(); c.rect(x, y, w, 20); c.clip(); E(p.gold, x + w / 2, y + 20, 10, 8); for (let k = 0; k < 3; k++) R(mix(p.pink, p.violet, .45), x + w / 2 - 10, y + 13 + k * 3, 20, 1); c.restore();
    R(mix(p.cyan, p.ink, .4), x, y + 20, w, 3); R(mix(p.gold, p.ink, .45), x, y + 23, w, h - 23);
    P(mix(p.steel, p.ink, .45), [[x + w / 2 - 3, y + 21], [x + w / 2 + 3, y + 21], [x + w + 8, y + h], [x - 8, y + h]]);
    P(p.paper, [[x + w / 2 - 3, y + 21], [x + w / 2 - 2, y + 21], [x - 5, y + h], [x - 8, y + h]]); P(p.paper, [[x + w / 2 + 2, y + 21], [x + w / 2 + 3, y + 21], [x + w + 8, y + h], [x + w + 5, y + h]]);
    for (let k = 0; k < 4; k++) { const s = (t * 1.5 + k / 4) % 1; R(p.paper, x + w / 2 - 1, Math.round(y + 21 + s * s * (h - 21)), 2, Math.round(1 + s * 4)); }
    for (let k = 0; k < 4; k++) { const s = (t * 1.1 + k / 4) % 1, side = k % 2 ? 1 : -1, sc = .35 + s * 1.1, px = Math.round(x + w / 2 + side * (5 + s * s * 36)), py = Math.round(y + 22 + s * s * 30), th = Math.round(12 * sc);
      R(p.bronze, px, py - th, Math.max(1, Math.round(2 * sc)), th); for (const dd of [-1, 1]) P(sh(p.mint, -.2), [[px + 1, py - th], [px + 1 + dd * 7 * sc, py - th + 2 * sc], [px + 1 + dd * 5 * sc, py - th + 4 * sc]]); R(sh(p.mint, -.2), px - 1, py - th - 2 * sc, 3, 2); }
    const car = mix(p.rust, p.pink, .35), cx = Math.round(x + w / 2 + Math.sin(t * 1.3) * 8), cy = y + h - 4;
    R(p.ink, cx - 9, cy - 9, 18, 8); R(car, cx - 8, cy - 8, 16, 6); R(sh(car, .4), cx - 8, cy - 8, 16, 1); R(p.paper, cx - 5, cy - 11, 10, 2);
    R(p.gold, cx - 4, cy - 14, 3, 3); R(p.bronze, cx + 1, cy - 14, 3, 3); R(p.pink, cx - 8, cy - 5, 2, 1); R(p.pink, cx + 6, cy - 5, 2, 1); R(p.ink, cx - 8, cy - 2, 4, 3); R(p.ink, cx + 4, cy - 2, 4, 3);
  }
  D("rgba(0,0,0,.3)", x, y, w, h, "lines"); R("rgba(255,255,255,.1)", x + 2, y + 2, w - 4, 3);
}
const CAB_X = i => 350 + i * 108;
function cabinet(x, y, col, title){
  const body = mix(col, p.ink, .55), bodyL = mix(col, p.ink, .35), side = mix(col, p.ink, .72);
  floorShadow(x - 4, 104);
  P(p.ink, [[x + 76, y - 2], [x + 98, y + 8], [x + 98, y + 194], [x + 76, y + 194]]); P(side, [[x + 78, y + 1], [x + 96, y + 10], [x + 96, y + 192], [x + 78, y + 192]]);
  for (let i = 0; i < 4; i++) P(i % 2 ? col : sh(col, -.35), [[x + 79, y + 70 + i * 26], [x + 95, y + 56 + i * 26], [x + 95, y + 62 + i * 26], [x + 79, y + 76 + i * 26]]);
  box(body, x, y, 78, 192);
  R(p.ink, x + 3, y + 4, 72, 30); bands(x + 5, y + 6, 68, 26, [sh(col, .5), sh(col, .25), col]); D(sh(col, -.25), x + 5, y + 6, 68, 26, "sparse");
  txt(title, x + 39, y + 19, p.paper, textW(title, 16) <= 62 ? 16 : 8, "center"); halo(col, x + 5, y + 6, 68, 26, .12);
  R(p.ink, x + 4, y + 38, 70, 68); R(mix(p.ink, col, .2), x + 6, y + 40, 66, 64);
  P(col, [[x + 6, y + 40], [x + 18, y + 40], [x + 6, y + 52]]); P(col, [[x + 72, y + 104], [x + 60, y + 104], [x + 72, y + 92]]);
  R(p.ink, x + 10, y + 44, 58, 56); R(sh(p.sky, -.3), x + 12, y + 46, 54, 52);
  P(p.ink, [[x - 6, y + 106], [x + 84, y + 106], [x + 90, y + 132], [x - 12, y + 132]]); P(bodyL, [[x - 4, y + 108], [x + 82, y + 108], [x + 87, y + 130], [x - 9, y + 130]]);
  R(sh(bodyL, .35), x - 4, y + 108, 86, 2); box(mix(col, p.ink, .66), x - 10, y + 132, 98, 8);
  R(p.ink, x + 13, y + 100, 6, 18); R(p.silver, x + 15, y + 101, 2, 16); E(p.ink, x + 16, y + 99, 7); E(p.rust, x + 16, y + 99, 5); R("#ffffff", x + 13, y + 96, 2, 2);
  [p.pink, p.cyan, p.gold].forEach((bc, i) => { const bx = x + 40 + i * 13; E(p.ink, bx, y + 120, 6, 5); E(sh(bc, -.4), bx, y + 120, 5, 4); E(bc, bx, y + 119, 5, 3); R("#ffffff", bx - 2, y + 117, 2, 1); });
  inset(mix(p.steel, p.ink, .45), x + 20, y + 148, 38, 30);
  for (const dx of [24, 41]) { R(p.ink, x + dx, y + 152, 12, 12); R(p.rust, x + dx + 2, y + 154, 8, 8); R(sh(p.rust, .5), x + dx + 5, y + 155, 2, 6); }
  for (let i = 0; i < 3; i++) R(p.ink, x + 26, y + 168 + i * 3, 26, 1);
  R(mix(col, p.ink, .75), x + 2, y + 182, 74, 8);
  pool(col, x + 39, 406, 60, 13, .08);
}
// pinball themes: each machine gets its own cabinet color, trim, legs, backglass art and playfield layout
const PIN_FIELDS = [
  [[34, 112, "pink"], [60, 110, "cyan"], [47, 126, "gold"]],
  [[30, 106, "violet"], [64, 104, "pink"], [47, 120, "gold"]],
  [[36, 120, "mint"], [62, 124, "gold"]],
  [[48, 122, "cyan"]],
  [[48, 100, "gold"], [34, 114, "pink"], [62, 114, "pink"], [48, 128, "gold"]]
];
function pinArt(x, y, th, col){
  const X0 = x + 15, Y0 = y + 8;
  if (th.art === "burst") { for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; P(sh(col, .3), [[x + 48, y + 29], [x + 48 + Math.cos(a) * 32, y + 29 + Math.sin(a) * 19], [x + 48 + Math.cos(a + .22) * 32, y + 29 + Math.sin(a + .22) * 19]]); } R(mix(col, p.ink, .7), X0, Y0, 66, 2); return; }
  if (th.art === "cat") {
    for (let k = 0; k < 9; k++) { const hh = hash32("jx" + k); R(p.paper, X0 + 3 + hh % 60, Y0 + 2 + (hh >>> 8) % 22, 1, 1); }
    E(p.gold, x + 70, y + 17, 7); E(mix(col, p.ink, .45), x + 73, y + 15, 6);
    E(p.ink, x + 30, y + 30, 9, 6); E(p.ink, x + 30, y + 21, 6); P(p.ink, [[x + 25, y + 19], [x + 25, y + 12], [x + 29, y + 17]]); P(p.ink, [[x + 35, y + 19], [x + 35, y + 12], [x + 31, y + 17]]);
    R(p.gold, x + 27, y + 20, 2, 2); R(p.gold, x + 32, y + 20, 2, 2); c.strokeStyle = p.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 38, y + 32); c.quadraticCurveTo(x + 48, y + 30, x + 46, y + 20); c.stroke();
  } else if (th.art === "slime") {
    const sl = sh(p.mint, .25);
    for (let k = 0; k < 7; k++) { const len = 4 + hash32("oz" + k) % 13, dx = X0 + 2 + k * 9; R(sl, dx, Y0, 6, len); E(sl, dx + 3, Y0 + len, 3); }
    E(p.ink, x + 46, y + 30, 13, 7); E(sl, x + 46, y + 29, 12, 6); for (const d of [-4, 4]) { E(p.paper, x + 46 + d, y + 27, 2.5); R(p.ink, x + 46 + d, y + 27, 1, 2); }
    P(p.ink, [[x + 68, y + 16], [x + 74, y + 16], [x + 74, y + 21], [x + 79, y + 34], [x + 63, y + 34], [x + 68, y + 21]]); P(mix(p.mint, p.paper, .4), [[x + 69, y + 17], [x + 73, y + 17], [x + 73, y + 22], [x + 77, y + 33], [x + 65, y + 33], [x + 69, y + 22]]);
    R(sl, x + 66, y + 27, 10, 6); R(p.paper, x + 69, y + 24, 2, 2); R(p.paper, x + 72, y + 20, 1, 1);
  } else if (th.art === "yeti") {
    P(p.paper, [[X0, y + 36], [x + 32, y + 12], [x + 50, y + 36]]); P(sh(p.paper, -.25), [[x + 42, y + 36], [x + 62, y + 15], [x + 81, y + 36]]);
    P(mix(col, p.ink, .3), [[x + 26, y + 21], [x + 32, y + 12], [x + 38, y + 21], [x + 34, y + 19], [x + 32, y + 22], [x + 29, y + 19]]);
    E(p.ink, x + 48, y + 25, 11, 10); E(p.paper, x + 48, y + 25, 10, 9); R(mix(p.cyan, p.paper, .5), x + 43, y + 22, 10, 7); R(p.ink, x + 44, y + 23, 2, 2); R(p.ink, x + 50, y + 23, 2, 2);
    R(p.ink, x + 45, y + 27, 6, 2); R(p.paper, x + 45, y + 27, 1, 2); R(p.paper, x + 50, y + 27, 1, 2);
    for (let k = 0; k < 8; k++) { const hh = hash32("yt" + k); R(p.paper, X0 + 2 + hh % 62, Y0 + 2 + (hh >>> 8) % 24, 1, 1); }
  } else {
    P(p.ink, [[x + 55, Y0], [x + 39, y + 26], [x + 48, y + 26], [x + 40, y + 37], [x + 63, y + 19], [x + 53, y + 19], [x + 62, Y0]]);
    P(p.cyan, [[x + 56, Y0 + 1], [x + 42, y + 25], [x + 50, y + 25], [x + 44, y + 33], [x + 60, y + 20], [x + 51, y + 20], [x + 60, Y0 + 1]]);
    box(p.silver, x + 19, y + 15, 14, 12, { ol: 1, b: 1 }); R(p.pink, x + 22, y + 19, 3, 2); R(p.pink, x + 28, y + 19, 3, 2); R(p.ink, x + 23, y + 23, 6, 1); R(p.ink, x + 25, y + 10, 2, 5); E(p.pink, x + 26, y + 10, 2);
    for (let k = 0; k < 4; k++) R(p.cyan, x + 68 + (k % 2) * 5, y + 13 + k * 5, 2, 2);
  }
}
function pinball(x, y, th){
  const col = p[th.body], trim = p[th.trim], legs = th.legs === "ink" ? mix(p.ink, p.steel, .3) : p[th.legs], body = mix(col, p.ink, .5), dark = mix(col, p.ink, .7), classic = th.art === "burst";
  floorShadow(x - 2, 100);
  for (const lx of [x + 8, x + 82]) { R(p.ink, lx - 2, y + 168, 10, 24); R(legs, lx, y + 168, 6, 22); R(sh(legs, -.35), lx + 4, y + 168, 2, 22); R(p.ink, lx - 4, y + 190, 14, 4); }
  box(body, x + 8, y, 80, 80); if (!classic) { R(trim, x + 8, y, 80, 2); R(trim, x + 8, y + 52, 2, 22); R(trim, x + 86, y + 52, 2, 22); }
  R(p.ink, x + 13, y + 6, 70, 46); bands(x + 15, y + 8, 66, 42, classic ? [mix(col, p.sky, .3), mix(col, p.ink, .3), mix(col, p.ink, .5)] : [mix(col, p.ink, .55), mix(col, p.ink, .4), mix(col, p.ink, .62)]);
  c.save(); c.beginPath(); c.rect(x + 15, y + 8, 66, 42); c.clip(); pinArt(x, y, th, col); c.restore();
  if (classic) txt(th.name, x + 48, y + 29, p.paper, textW(th.name, 16) <= 62 ? 16 : 8, "center");
  else { R(rgba(p.ink, .55), x + 15, y + 36, 66, 14); txt(th.name, x + 48, y + 43, p.paper, textW(th.name, 16) <= 64 ? 16 : 8, "center"); }
  R(p.ink, x + 13, y + 56, 70, 18); R(mix(p.rust, p.ink, .8), x + 15, y + 58, 66, 14); D(mix(p.rust, p.ink, .62), x + 15, y + 58, 66, 14, "chk");
  R(p.ink, x + 38, y + 80, 20, 8); R(dark, x + 40, y + 80, 16, 6);
  P(p.ink, [[x + 8, y + 86], [x + 88, y + 86], [x + 98, y + 152], [x - 2, y + 152]]); P(mix(col, p.sky2, .55), [[x + 11, y + 89], [x + 85, y + 89], [x + 94, y + 149], [x + 2, y + 149]]);
  const f = th.field;
  if (f === 0) for (let k = 0; k < 3; k++) R(sh(p.paper, -.2), x + 31 + k * 14, y + 92, 2, 12);
  if (f === 1) { R(p.ink, x + 45, y + 91, 6, 10); R(p.silver, x + 46, y + 92, 4, 8); for (let j = 0; j < 3; j++) { R(p.ink, x + 12, y + 104 + j * 8, 7, 6); R(trim, x + 13, y + 105 + j * 8, 5, 4); } }
  if (f === 2) { for (const [lw, sc] of [[7, p.ink], [5, sh(p.mint, .2)], [1, sh(p.mint, .6)]]) { c.strokeStyle = sc; c.lineWidth = lw; c.beginPath(); c.moveTo(x + 16, y + 140); c.quadraticCurveTo(x + 16, y + 94, x + 78, y + 98); c.stroke(); }
    R(p.ink, x + 66, y + 104, 12, 14); R(mix(p.mint, p.paper, .45), x + 67, y + 105, 10, 12); R(sh(p.mint, .1), x + 67, y + 110, 10, 7); R(p.paper, x + 70, y + 108, 2, 2); }
  if (f === 3) { for (const [lw, sc] of [[7, p.ink], [5, mix(p.cyan, p.paper, .35)]]) { c.strokeStyle = sc; c.lineWidth = lw; c.beginPath(); c.moveTo(x + 76, y + 140); c.lineTo(x + 64, y + 94); c.stroke(); }
    for (let j = 0; j < 4; j++) { R(p.ink, x + 27 + j * 10, y + 97, 8, 8); R(p.paper, x + 28 + j * 10, y + 98, 6, 6); R(trim, x + 28 + j * 10, y + 98, 6, 2); }
    c.strokeStyle = p.paper; c.lineWidth = 1; c.beginPath(); for (let j = 0; j < 4; j++) { const a = j * Math.PI / 4; c.moveTo(x + 26 - Math.cos(a) * 6, y + 120 - Math.sin(a) * 6); c.lineTo(x + 26 + Math.cos(a) * 6, y + 120 + Math.sin(a) * 6); } c.stroke(); }
  if (f === 4) { R(p.ink, x + 77, y + 100, 6, 20); R(p.silver, x + 78, y + 101, 4, 18); for (let j = 0; j < 4; j++) R(p.bronze, x + 76, y + 104 + j * 4, 8, 2); E(p.ink, x + 80, y + 99, 4.5); E(p.silver, x + 80, y + 99, 3.5); }
  for (const [dx, dy, ck] of PIN_FIELDS[f]) { const bx = x + dx, by = y + dy, bc = p[ck]; E(p.ink, bx, by, 8, 6); E(sh(bc, -.3), bx, by, 7, 5); E(bc, bx, by - 1, 6, 4); R("#ffffff", bx - 3, by - 3, 2, 1); }
  P(p.ink, [[x + 12, y + 126], [x + 22, y + 142], [x + 12, y + 142]]); P(p.paper, [[x + 14, y + 130], [x + 19, y + 140], [x + 14, y + 140]]);
  P(p.ink, [[x + 84, y + 126], [x + 84, y + 142], [x + 74, y + 142]]); P(p.paper, [[x + 82, y + 130], [x + 82, y + 140], [x + 77, y + 140]]);
  P(p.ink, [[x + 26, y + 141], [x + 45, y + 146], [x + 45, y + 149], [x + 26, y + 146]]); P(p.ink, [[x + 70, y + 141], [x + 51, y + 146], [x + 51, y + 149], [x + 70, y + 146]]);
  const flip = classic ? p.gold : trim; R(flip, x + 28, y + 143, 14, 2); R(flip, x + 54, y + 143, 14, 2);
  c.save(); c.globalAlpha = .16; P("#ffffff", [[x + 60, y + 89], [x + 70, y + 89], [x + 42, y + 149], [x + 32, y + 149]]); c.restore();
  box(body, x, y + 152, 96, 20); R(classic ? p.silver : trim, x + 2, y + 152, 92, 3); if (!classic) R(trim, x + 2, y + 167, 92, 2);
  R(p.ink, x + 38, y + 157, 20, 12); R(p.rust, x + 40, y + 159, 6, 8); R(p.rust, x + 50, y + 159, 6, 8);
  E(p.ink, x + 12, y + 162, 5); E(p.gold, x + 12, y + 161, 4);
  pool(col, x + 48, 406, 60, 13, .07);
}
function pinAnim(x, y, i, th){
  const t = T + i * 1.3, bx = x + 48 + Math.sin(t * 2.1) * 26 * (.75 + .25 * Math.sin(t * .7)), by = y + 118 + Math.sin(t * 3.3 + i) * 22, bs = PIN_FIELDS[th.field];
  E(p.ink, bx, by, 3.5); E(p.silver, bx, by, 2.5); R("#ffffff", bx - 1.5, by - 1.5, 1, 1);
  const [dx, dy, ck] = bs[Math.floor(t * 5) % bs.length], fc = p[ck];
  E(sh(fc, .6), x + dx, y + dy - 1, 6, 4); halo(fc, x + dx - 7, y + dy - 6, 14, 10, .15);
  if (th.field === 4 && Math.sin(t * 4) > .3) { c.strokeStyle = p.cyan; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 80, y + 99); c.lineTo(x + 72, y + 102 + (Math.floor(t * 20) % 3)); c.lineTo(x + 68, y + 108); c.lineTo(x + 62, y + 112); c.stroke(); halo(p.cyan, x + 77, y + 96, 6, 6, .2); }
  if (th.field === 1) R(p.paper, x + 46, y + 92 + (Math.floor(t * 12) % 4) * 2, 4, 1);
  txt(String((Math.floor(t * 23) * 130 + i * 41210) % 1000000).padStart(6, "0"), x + 48, y + 65, p.rust, 8, "center", null);
}
function scoreBulbs(x, y, w, h){ const out = []; for (let bx = x + 8; bx < x + w - 8; bx += 14) { out.push([bx, y + 5]); out.push([bx, y + h - 9]); } for (let by = y + 19; by < y + h - 12; by += 14) { out.push([x + 5, by]); out.push([x + w - 9, by]); } return out; }
function scoreWall(x, y, w, h){
  floorShadow(x, w);
  box(mix(p.violet, p.ink, .55), x, y, w, h);
  for (const [bx, by] of scoreBulbs(x, y, w, h)) bulb(bx, by);
  inset(mix(p.sky, p.ink, .3), x + 16, y + 16, w - 32, h - 32);
  txt("HIGH SCORES", x + w / 2, y + 34, p.gold, 16, "center"); R(p.pink, x + 24, y + 46, w - 48, 2);
  const names = ["AAA", "DMX", "SOL", "KIM", "OPS", "ZED", "YOU", "???"], cols = [p.gold, p.silver, p.bronze, p.cyan, p.mint, p.pink, p.paper, p.steel];
  for (let k = 0; k < 8; k++) { const ry = y + 62 + k * 20; txt((k + 1) + ".", x + 28, ry, cols[k]); txt(names[k], x + 54, ry, cols[k]); txt(String(99990 - k * 11730).padStart(6, "0"), x + w - 28, ry, p.paper, 8, "right"); }
  pool(p.violet, x + w / 2, 406, w / 2, 14, .06);
}
function scoreAnim(x, y, w, h){ const b = scoreBulbs(x, y, w, h), on = Math.floor(T * 6); b.forEach(([bx, by], i) => { if ((i + on) % 4 === 0) litBulb(bx, by); }); if (Math.floor(T * 2) % 2 === 0) txt("NEW", x + 96, y + 62 + 6 * 20, p.pink); }
function ticketEater(x, y, title, sub){
  const body = mix(p.violet, p.ink, .3), dk = mix(p.violet, p.ink, .6);
  floorShadow(x, 116);
  box(dk, x + 8, y + 204, 30, 12); box(dk, x + 78, y + 204, 30, 12);
  E(p.ink, x + 58, y + 46, 58, 46); E(body, x + 58, y + 46, 55, 43); E(sh(body, .25), x + 44, y + 22, 22, 10);
  for (const ex of [x + 36, x + 80]) { E(p.ink, ex, y + 30, 15); E(sh(p.paper, -.25), ex, y + 31, 13); E(p.paper, ex - 1, y + 29, 11); }
  box(body, x + 2, y + 46, 112, 160);
  R(p.ink, x + 10, y + 54, 96, 34); R(p.paper, x + 12, y + 56, 92, 30); txt(title, x + 58, y + 64, p.violet, 8, "center", null); txt(sub, x + 58, y + 77, p.pink, 8, "center", null);
  R(p.ink, x + 16, y + 94, 84, 50); teeth(x, y, 0);
  R(p.ink, x + 30, y + 152, 56, 10); R(sh(p.steel, .2), x + 32, y + 154, 52, 2);
  R(p.ink, x + 46, y + 160, 24, 34); R(p.paper, x + 48, y + 160, 20, 32); for (let k = 0; k < 4; k++) R(p.pink, x + 48, y + 166 + k * 8, 20, 2);
  R(p.ink, x + 74, y + 168, 36, 18); R(mix(p.mint, p.ink, .82), x + 76, y + 170, 32, 14);
  R(p.ink, x + 8, y + 168, 30, 18); R(mix(p.gold, p.ink, .3), x + 10, y + 170, 26, 14); R(p.ink, x + 21, y + 172, 4, 10);
  pool(p.pink, x + 58, 406, 70, 14, .08);
}
function teeth(x, y, o){
  R(mix(p.pink, p.ink, .72), x + 18, y + 96, 80, 46); R(p.pink, x + 30, y + 128, 56, 10); R(sh(p.pink, .35), x + 34, y + 129, 20, 2);
  for (let k = 0; k < 7; k++) { P(p.paper, [[x + 20 + k * 11, y + 96], [x + 30 + k * 11, y + 96], [x + 25 + k * 11, y + 109 - o]]); P(p.paper, [[x + 20 + k * 11, y + 142], [x + 30 + k * 11, y + 142], [x + 25 + k * 11, y + 131 + o]]); }
}
function eaterAnim(x, y){
  teeth(x, y, Math.round((Math.sin(T * 5) + 1) * 3));
  const px = Math.round(Math.sin(T * .9) * 5), py = Math.round(Math.cos(T * 1.3) * 3);
  for (const ex of [x + 36, x + 80]) { E(p.ink, ex + px, y + 31 + py, 5); R("#ffffff", ex + px - 3, y + 28 + py, 2, 2); }
  txt(String(Math.floor(T * 7) % 10000).padStart(4, "0"), x + 92, y + 177, p.mint, 8, "center", null);
}
function tokenMachine(x, y){
  const body = mix(p.gold, p.ink, .3), side = mix(p.gold, p.ink, .62);
  floorShadow(x, 126);
  P(p.ink, [[x + 110, y - 2], [x + 128, y + 8], [x + 128, y + 214], [x + 110, y + 214]]); P(side, [[x + 112, y + 1], [x + 126, y + 10], [x + 126, y + 212], [x + 112, y + 212]]);
  box(body, x, y, 112, 212); R(p.ink, x + 46, y - 6, 20, 6);
  R(p.ink, x + 4, y + 8, 104, 28); bands(x + 6, y + 10, 100, 24, [p.paper, sh(p.paper, -.14)]); txt("TOKENS", x + 56, y + 22, p.pink, 16, "center");
  inset(mix(p.sky2, p.ink, .4), x + 10, y + 46, 92, 56);
  for (let k = 0; k < 5; k++) { const sx = x + 16 + k * 18, n = 3 + hash32("tk" + k) % 4; for (let j = 0; j < n; j++) { E(p.ink, sx + 7, y + 94 - j * 6, 8, 4); E(p.gold, sx + 7, y + 93 - j * 6, 7, 3); R(sh(p.gold, .5), sx + 3, y + 92 - j * 6, 4, 1); } }
  txt("1 = 4", x + 56, y + 113, p.ink, 8, "center", null);
  R(p.ink, x + 18, y + 122, 76, 16); R(sh(p.steel, .2), x + 20, y + 124, 72, 12); R(p.ink, x + 30, y + 129, 52, 3); R(p.mint, x + 22, y + 127, 5, 5);
  R(p.ink, x + 70, y + 144, 20, 22); R(sh(p.steel, .1), x + 72, y + 146, 16, 18); R(p.ink, x + 79, y + 149, 2, 12);
  R(p.ink, x + 14, y + 174, 84, 28); R(mix(p.gold, p.ink, .72), x + 16, y + 176, 80, 24); R(sh(p.steel, .3), x + 16, y + 176, 80, 3);
  for (let k = 0; k < 5; k++) { E(p.ink, x + 30 + k * 13, y + 196, 6, 3); E(p.gold, x + 30 + k * 13, y + 195, 5, 2); }
  pool(p.gold, x + 56, 406, 70, 14, .08);
}
function tokenAnim(x, y){
  const on = Math.floor(T * 4) % 2 === 0, bx = x + 56, by = y - 12;
  E(p.ink, bx, by, 10, 9); E(on ? p.rust : sh(p.rust, -.5), bx, by, 8, 7); R("#ffffff", bx - 4, by - 5, 2, 2);
  if (on) { halo(p.rust, bx - 8, by - 7, 16, 14, .18); c.save(); c.globalCompositeOperation = "lighter"; c.globalAlpha = .1; const a = Math.cos(T * 3) * 140; P(p.rust, [[bx, by], [bx + a, by - 34], [bx + a, by + 26]]); c.restore(); }
}
function prize(k, x, b){
  const o = { ol: 1, b: 1 };
  if (k === 0) { const col = p.bronze; for (const ex of [x + 7, x + 21]) { E(p.ink, ex, b - 33, 5); E(col, ex, b - 33, 3.5); } box(col, x + 6, b - 18, 16, 18, o); box(col, x + 6, b - 34, 16, 15, o); R(sh(col, .45), x + 10, b - 26, 8, 5); R(p.ink, x + 13, b - 26, 2, 2); R(p.ink, x + 9, b - 30, 2, 2); R(p.ink, x + 17, b - 30, 2, 2); R(p.pink, x + 9, b - 19, 10, 2); }
  else if (k === 1) { box(p.gold, x + 3, b - 14, 22, 14, o); box(p.gold, x + 12, b - 27, 12, 12, o); R(p.rust, x + 24, b - 22, 5, 4); R(p.ink, x + 19, b - 24, 2, 2); R(sh(p.gold, -.3), x + 6, b - 8, 12, 2); }
  else if (k === 2) { R(p.ink, x + 3, b - 17, 3, 8); R(p.ink, x + 22, b - 17, 3, 8); box(p.silver, x + 6, b - 20, 16, 20, o); box(p.steel, x + 8, b - 33, 12, 12, o); R(p.ink, x + 13, b - 39, 2, 6); R(p.pink, x + 12, b - 42, 4, 3); R(p.cyan, x + 10, b - 29, 3, 3); R(p.cyan, x + 15, b - 29, 3, 3); R(p.gold, x + 10, b - 15, 8, 3); }
  else if (k === 3) { R(p.ink, x + 8, b - 31, 2, 8); R(p.ink, x + 18, b - 31, 2, 8); R(p.pink, x + 7, b - 33, 4, 3); R(p.pink, x + 17, b - 33, 4, 3); box(p.mint, x + 5, b - 24, 18, 24, o); R(p.ink, x + 8, b - 19, 5, 6); R(p.ink, x + 15, b - 19, 5, 6); R("#ffffff", x + 9, b - 18, 2, 2); R("#ffffff", x + 16, b - 18, 2, 2); R(sh(p.mint, -.4), x + 11, b - 8, 6, 2); }
  else if (k === 4) { E(p.ink, x + 14, b - 12, 12); E(p.pink, x + 14, b - 12, 10.5); R(p.paper, x + 4, b - 14, 21, 4); R(p.cyan, x + 12, b - 22, 4, 20); R("#ffffff", x + 7, b - 19, 3, 2); }
  else if (k === 5) star(x + 14, b - 13, 13, p.gold);
  else if (k === 6) { box(p.gold, x + 10, b - 38, 8, 30, o); P(p.ink, [[x + 9, b - 8], [x + 19, b - 8], [x + 14, b]]); P(sh(p.bronze, .4), [[x + 11, b - 8], [x + 17, b - 8], [x + 14, b - 2]]); box(p.pink, x + 10, b - 44, 8, 5, o); R(p.silver, x + 10, b - 38, 8, 2); }
  else if (k === 7) { box(mix(p.cyan, p.ink, .5), x + 5, b - 26, 18, 26, o); for (let j = 0; j < 6; j++) R([p.pink, p.gold, p.mint][j % 3], x + 8 + (j % 3) * 5, b - 20 + Math.floor(j / 3) * 8, 3, 3); box(p.pink, x + 4, b - 30, 20, 4, o); }
  else if (k === 8) { R(p.paper, x + 13, b - 16, 2, 16); E(p.ink, x + 14, b - 25, 10); E(p.pink, x + 14, b - 25, 8.5); c.strokeStyle = p.paper; c.lineWidth = 2; c.beginPath(); c.arc(x + 14, b - 25, 5, 0, 4.6); c.stroke(); c.beginPath(); c.arc(x + 14, b - 25, 2, 0, 4.6); c.stroke(); R("#ffffff", x + 8, b - 31, 2, 2); }
  else if (k === 9) { box(mix(p.bronze, p.ink, .35), x + 7, b - 34, 14, 6, o); box(p.violet, x + 5, b - 29, 18, 29, o); R(p.gold, x + 5, b - 20, 18, 8); R(p.rust, x + 7, b - 18, 14, 4); for (let j = 0; j < 3; j++) R(sh(p.violet, -.35), x + 6 + j * 6, b - 3, 3, 2); }
  else if (k === 10) { for (const [gx, gc] of [[x + 9, p.rust], [x + 20, p.mint], [x + 14, p.gold]]) { const gy = gx === x + 14 ? b : b - 3; E(p.ink, gx, gy - 12, 5); E(p.ink, gx, gy - 5, 6); E(p.ink, gx - 4, gy - 16, 2.5); E(p.ink, gx + 4, gy - 16, 2.5); E(gc, gx, gy - 12, 4); E(gc, gx, gy - 5, 5); E(gc, gx - 4, gy - 16, 1.6); E(gc, gx + 4, gy - 16, 1.6); E(sh(gc, -.25), gx, gy - 3, 3.5, 2.5); R("#ffffff", gx - 2, gy - 14, 1, 2); } }
  else if (k === 11) { E(p.ink, x + 14, b - 12, 12); E(p.cyan, x + 14, b - 12, 10.5); E(p.pink, x + 14, b - 12, 8); E(p.gold, x + 14, b - 12, 5.5); E(p.paper, x + 14, b - 12, 3); R("#ffffff", x + 7, b - 19, 3, 2); }
  else if (k === 12) { R(p.bronze, x + 13, b - 44, 2, 12); for (let j = 0; j < 7; j++) { const cx2 = x + 14 + (j % 2 ? 3 : -3), cy2 = b - 12 - j * 4; P(p.ink, [[cx2, cy2 - 6], [cx2 + 6, cy2], [cx2, cy2 + 6], [cx2 - 6, cy2]]); P(mix(p.violet, p.paper, .45), [[cx2, cy2 - 4], [cx2 + 4, cy2], [cx2, cy2 + 4], [cx2 - 4, cy2]]); R("#ffffff", cx2 - 1, cy2 - 2, 1, 1); } box(mix(p.cyan, p.ink, .55), x + 8, b - 8, 12, 8, o); }
  else if (k === 13) { P(p.ink, [[x + 9, b - 17], [x + 19, b - 17], [x + 14, b]]); P(p.paper, [[x + 10, b - 16], [x + 18, b - 16], [x + 14, b - 2]]); R(p.cyan, x + 12, b - 12, 4, 1); R(p.cyan, x + 13, b - 8, 2, 1); const cc = mix(p.pink, p.paper, .35); for (const [dx, dy, r] of [[-6, -22, 7], [6, -22, 7], [0, -29, 8], [0, -20, 7]]) E(p.ink, x + 14 + dx, b + dy, r + 1.5); for (const [dx, dy, r] of [[-6, -22, 7], [6, -22, 7], [0, -29, 8], [0, -20, 7]]) E(cc, x + 14 + dx, b + dy, r); R("#ffffff", x + 10, b - 33, 3, 2); }
  else if (k === 14) { for (let j = 0; j < 14; j++) { const a = j / 14 * Math.PI * 2, bx = x + 14 + Math.cos(a) * 10, by = b - 14 + Math.sin(a) * 12; E(p.ink, bx, by, 3); E(mix([p.pink, p.mint, p.gold, p.cyan, p.violet][j % 5], p.paper, .35), bx, by, 2.2); } }
  else if (k === 15) { box(p.cyan, x + 10, b - 30, 9, 30, o); R(sh(p.cyan, .35), x + 11, b - 29, 2, 28); R(p.pink, x + 11, b - 33, 7, 3); P(p.ink, [[x + 7, b - 42], [x + 12, b - 42], [x + 8, b - 48]]); P(p.ink, [[x + 22, b - 42], [x + 17, b - 42], [x + 21, b - 48]]); box(p.gold, x + 8, b - 43, 13, 10, o); R(p.ink, x + 11, b - 40, 2, 2); R(p.ink, x + 16, b - 40, 2, 2); R(p.rust, x + 13, b - 37, 3, 1); }
  else if (k === 16) { P(p.ink, [[x + 8, b - 32], [x + 21, b - 32], [x + 14.5, b - 45]]); P(p.rust, [[x + 10, b - 33], [x + 19, b - 33], [x + 14.5, b - 42]]); for (const d of [-1, 1]) { P(p.ink, [[x + 14.5 + d * 4, b - 16], [x + 14.5 + d * 11, b - 3], [x + 14.5 + d * 4, b - 6]]); P(p.rust, [[x + 14.5 + d * 4, b - 14], [x + 14.5 + d * 9, b - 4], [x + 14.5 + d * 4, b - 7]]); } box(p.paper, x + 10, b - 33, 9, 30, o); E(p.ink, x + 14.5, b - 24, 3); E(p.cyan, x + 14.5, b - 24, 2); }
  else if (k === 17) { for (let j = 0; j < 8; j++) { const sc = [p.pink, p.gold, p.mint, p.cyan, p.violet][j % 5]; E(p.ink, x + 14, b - 3 - j * 4, 11, 3.5); E(sc, x + 14, b - 3 - j * 4, 10, 2.5); } }
  else if (k === 18) { const path = () => { c.beginPath(); c.moveTo(x + 11, b); c.lineTo(x + 11, b - 30); c.arc(x + 16, b - 30, 5, Math.PI, 0); c.lineTo(x + 21, b - 26); }; c.lineCap = "round"; path(); c.strokeStyle = p.ink; c.lineWidth = 6; c.stroke(); path(); c.strokeStyle = p.paper; c.lineWidth = 4; c.stroke(); c.setLineDash([3, 3]); path(); c.strokeStyle = p.rust; c.stroke(); c.setLineDash([]); c.lineCap = "butt"; }
  else { for (const [cx2, cy2, cc] of [[x + 9, b - 5, p.pink], [x + 20, b - 5, p.mint], [x + 14, b - 12, p.gold]]) { P(p.ink, [[cx2 - 4, cy2], [cx2 - 11, cy2 - 5], [cx2 - 11, cy2 + 5]]); P(p.ink, [[cx2 + 4, cy2], [cx2 + 11, cy2 - 5], [cx2 + 11, cy2 + 5]]); P(sh(cc, .3), [[cx2 - 4, cy2], [cx2 - 10, cy2 - 4], [cx2 - 10, cy2 + 4]]); P(sh(cc, .3), [[cx2 + 4, cy2], [cx2 + 10, cy2 - 4], [cx2 + 10, cy2 + 4]]); E(p.ink, cx2, cy2, 5.5, 4.5); E(cc, cx2, cy2, 4.5, 3.5); R("#ffffff", cx2 - 2, cy2 - 2, 2, 1); } }
}
// about half candy, half toys, alternating along each shelf
const PRIZE_SEQ = [8, 0, 9, 2, 10, 16, 11, 3, 12, 5, 13, 1, 14, 17, 15, 4, 18, 6, 19, 7];
function prizeWall(x, y, w, h, rows){
  floorShadow(x, w);
  box(mix(p.violet, p.ink, .45), x, y, w, h);
  const step = Math.floor((h - 16) / rows), n = Math.floor((w - 24) / 34);
  for (let r = 0; r < rows; r++) { const sy = y + 8 + r * step, inner = step - 10;
    inset(mix(p.wall, p.ink, .35), x + 10, sy, w - 20, inner);
    for (let k = 0; k < n; k++) prize(PRIZE_SEQ[(r * 13 + k + (w < 260 ? 3 : 0)) % PRIZE_SEQ.length], x + 14 + k * 34, sy + inner);
    box(mix(p.bronze, p.ink, .2), x + 6, sy + inner, w - 12, 6);
    for (let k = 0; k < n; k++) { R(p.paper, x + 20 + k * 34, sy + inner + 1, 14, 4); R(p.pink, x + 22 + k * 34, sy + inner + 2, 5, 2); }
  }
  for (let by = y + 10; by < y + h - 8; by += 16) { bulb(x + 1, by); bulb(x + w - 5, by); }
  pool(p.gold, x + w / 2, 406, w / 2, 14, .05);
}
function pickupWindow(x, y, w, h){
  floorShadow(x, w);
  box(mix(p.steel, p.ink, .45), x, y, w, h);
  R(p.ink, x + 10, y + 8, w - 20, 30); R(mix(p.mint, p.ink, .8), x + 12, y + 10, w - 24, 26);
  txt("PRIZE PICKUP", x + w / 2, y + 23, p.mint, textW("PRIZE PICKUP", 16) <= w - 34 ? 16 : 8, "center"); halo(p.mint, x + 12, y + 10, w - 24, 26, .14);
  R(p.ink, x + 14, y + 46, w - 28, 104);
  bands(x + 16, y + 48, w - 32, 100, [mix(p.sky2, p.ink, .5), mix(p.sky2, p.ink, .3), mix(p.gold, p.ink, .7)]);
  for (let r = 0; r < 2; r++) { const sy = y + 110 + r * 32; R(mix(p.bronze, p.ink, .3), x + 18, sy, w - 36, 4);
    for (let k = 0; k < 8; k++) { const hh = hash32("bx" + r + k), bw = 14 + hh % 10, bh = 10 + (hh >>> 4) % 12, col = [p.pink, p.cyan, p.gold, p.violet, p.mint][hh % 5], bx = x + 22 + k * 25; if (bx + bw > x + w - 20) break; box(col, bx, sy - bh, bw, bh, { ol: 1, b: 1 }); R(p.paper, bx + Math.floor(bw / 2) - 1, sy - bh, 2, bh); } }
  for (let k = 0; k < 6; k++) { R(sh(p.steel, .15), x + 16, y + 48 + k * 6, w - 32, 4); R(sh(p.steel, -.35), x + 16, y + 52 + k * 6, w - 32, 2); }
  R(p.ink, x + 16, y + 84, w - 32, 3);
  box(mix(p.bronze, p.ink, .15), x + 6, y + 150, w - 12, 14);
  R(p.ink, x + 47, y + 136, 2, 4); E(p.ink, x + 48, y + 146, 9, 7); E(p.gold, x + 48, y + 146, 7, 5); R(sh(p.gold, .5), x + 44, y + 143, 3, 2);
  const pw = Math.floor((w - 28) / 3);
  for (let k = 0; k < 3; k++) inset(mix(p.steel, p.ink, .3), x + 14 + k * pw, y + 174, pw - 8, h - 186);
  R(p.ink, x + w - 66, y + 180, 52, 18); R(mix(p.mint, p.ink, .75), x + w - 64, y + 182, 48, 14); txt("EXIT", x + w - 40, y + 189, p.mint, 8, "center"); halo(p.mint, x + w - 64, y + 182, 48, 14, .12);
  pool(p.mint, x + w / 2, 406, w / 2, 14, .08);
}
function exitDoor(x, y, w, h, label, col){
  floorShadow(x, w);
  box(mix(p.steel, p.ink, .5), x + 6, y + 40, w - 12, h - 40);
  R(p.ink, x + w / 2 - 62, y, 124, 34); R(mix(col, p.ink, .8), x + w / 2 - 60, y + 2, 120, 30); txt(label, x + w / 2, y + 17, col, 16, "center"); halo(col, x + w / 2 - 60, y + 2, 120, 30, .14);
  const dw = Math.floor((w - 40) / 2);
  for (let d = 0; d < 2; d++) { const dx = x + 18 + d * (dw + 4);
    box(mix(p.steel, p.ink, .22), dx, y + 52, dw, h - 52);
    E(p.ink, dx + dw / 2, y + 92, 17); E(mix(col, p.ink, .45), dx + dw / 2, y + 92, 14); R("#ffffff", dx + dw / 2 - 7, y + 84, 4, 3);
    R(p.ink, dx + 6, y + 138, dw - 12, 9); R(p.silver, dx + 8, y + 140, dw - 16, 4); }
  c.save(); c.globalCompositeOperation = "lighter"; c.globalAlpha = .22; P(col, [[x + 18, y + h], [x + w - 18, y + h], [x + w + 18, y + h + 20], [x - 18, y + h + 20]]); c.restore();
  c.save(); c.translate(x + 30, y + 30); c.rotate(.35); P(p.ink, [[-16, -6], [6, -6], [6, -12], [20, 0], [6, 12], [6, 6], [-16, 6]]); P(p.gold, [[-14, -4], [8, -4], [8, -8], [17, 0], [8, 8], [8, 4], [-14, 4]]); c.restore();
}
function exitAnim(x, y, w, h, col){
  if (Math.floor(T * 6) % 17 === 0) { c.save(); c.globalAlpha = .7; R(p.ink, x + w / 2 - 60, y + 2, 120, 30); c.restore(); }
  const dw = Math.floor((w - 40) / 2), a = .06 + .06 * Math.sin(T * 2.4);
  for (let d = 0; d < 2; d++) halo(col, x + 18 + d * (dw + 4) + dw / 2 - 12, y + 80, 24, 24, a);
}
function vending(x, y, col, label, glass){
  const top = y - 150, body = mix(col, p.ink, .38);
  c.save(); c.globalAlpha = .45; E(p.ink, x + 50, y + 3, 60, 7); c.restore();
  box(body, x, top, 100, 150);
  R(p.ink, x + 8, top + 8, 60, 92);
  if (glass) { R(mix(p.sky, p.ink, .3), x + 10, top + 10, 56, 88); for (let r = 0; r < 4; r++) { R(sh(p.steel, -.2), x + 10, top + 30 + r * 22, 56, 2); for (let k = 0; k < 4; k++) { const hh = hash32(label + r + k); R([p.pink, p.gold, p.mint, p.rust, p.cyan][hh % 5], x + 13 + k * 13, top + 16 + r * 22, 9, 13); R(p.paper, x + 13 + k * 13, top + 16 + r * 22, 9, 2); } } c.save(); c.globalAlpha = .14; P("#ffffff", [[x + 40, top + 10], [x + 52, top + 10], [x + 26, top + 98], [x + 14, top + 98]]); c.restore(); }
  else { bands(x + 10, top + 10, 56, 88, [sh(col, .45), sh(col, .2), col]); for (let k = 0; k < label.length; k++) txt(label[k], x + 38, top + 26 + k * 20, p.paper, 16, "center"); halo(col, x + 10, top + 10, 56, 88, .1); }
  R(p.ink, x + 74, top + 10, 18, 70); for (let k = 0; k < 5; k++) { R(sh(p.steel, .3), x + 77, top + 13 + k * 13, 12, 9); R(k % 2 ? p.pink : p.mint, x + 79, top + 15 + k * 13, 8, 2); }
  R(p.ink, x + 77, top + 86, 12, 16); R(p.gold, x + 81, top + 88, 4, 12);
  R(p.ink, x + 10, top + 108, 60, 26); R(mix(p.ink, col, .15), x + 12, top + 110, 56, 22); R(sh(p.steel, -.2), x + 14, top + 112, 52, 3);
  R(p.ink, x + 6, top + 140, 88, 4);
}
function couch(x, y, w, col, dark){
  c.save(); c.globalAlpha = .45; E(p.ink, x + w / 2, y + 26, w / 2 + 14, 9); c.restore();
  const hi = sh(col, .25), lo = sh(col, -.3), n = Math.max(2, Math.round((w - 16) / 86)), sw = (w - 16) / n;
  box(col, x + 8, y - 70, w - 16, 48);
  for (let k = 0; k < n; k++) { const sx = x + 8 + k * sw; if (k) R(sh(col, -.45), sx - 1, y - 68, 2, 44); R(hi, sx + 4, y - 66, sw - 8, 3); R(sh(col, -.42), sx + sw / 2 - 1, y - 52, 3, 3); R(sh(col, -.42), sx + sw / 2 - 1, y - 38, 3, 3); }
  box(sh(col, .08), x + 6, y - 24, w - 12, 22);
  for (let k = 1; k < n; k++) R(sh(col, -.4), x + 6 + k * (w - 12) / n - 1, y - 22, 2, 18);
  box(lo, x + 6, y - 2, w - 12, 20);
  for (const ax of [x - 8, x + w - 16]) { box(col, ax, y - 50, 24, 68); R(hi, ax + 2, y - 48, 20, 6); R(sh(col, .45), ax + 4, y - 47, 16, 2); }
  for (const lx of [x + 4, x + w - 14]) { R(p.ink, lx - 1, y + 18, 12, 9); R(p.bronze, lx + 1, y + 18, 8, 7); }
  if (dark) { D(p.ink, x + 8, y - 70, w - 16, 48, "chk"); D(p.ink, x + 6, y - 24, w - 12, 42, "sparse"); for (let k = 0; k < 16; k++) { const hh = hash32("dm" + k); R(k % 3 ? p.violet : p.paper, x + 14 + hh % (w - 28), y - 66 + (hh >>> 8) % 40, k % 5 ? 1 : 2, k % 5 ? 1 : 2); } }
}
function lavaLamp(x, y){
  box(mix(p.bronze, p.ink, .35), x - 6, y - 32, 50, 10); R(p.ink, x - 2, y - 22, 4, 26); R(p.ink, x + 36, y - 22, 4, 26);
  P(p.ink, [[x + 6, y - 46], [x + 32, y - 46], [x + 38, y - 31], [x, y - 31]]);
  P(p.silver, [[x + 8, y - 44], [x + 30, y - 44], [x + 35, y - 33], [x + 3, y - 33]]);
  P(p.ink, [[x + 9, y - 100], [x + 29, y - 100], [x + 36, y - 46], [x + 2, y - 46]]); P(mix(p.pink, p.ink, .55), [[x + 11, y - 98], [x + 27, y - 98], [x + 33, y - 48], [x + 5, y - 48]]);
  R(p.ink, x + 9, y - 106, 20, 8); R(p.silver, x + 11, y - 104, 16, 4);
  halo(p.pink, x + 6, y - 96, 26, 48, .07);
}
function lavaAnim(x, y){ E(p.pink, x + 19 + Math.sin(T * .7) * 3, y - 72 + Math.sin(T * .5) * 16, 6, 7); E(sh(p.pink, .4), x + 17 + Math.cos(T * .6) * 3, y - 60 + Math.cos(T * .4) * 9, 4, 5); E(p.pink, x + 19, y - 50, 11, 3); }
function queueRope(x0, x1, y, col){
  const brass = p.gold, n = Math.max(2, Math.round((x1 - x0) / 108)), step = (x1 - x0) / n;
  for (let i = 0; i < n; i++) { const xa = x0 + i * step, xb = xa + step;
    for (const [lw, sc] of [[6, p.ink], [4, col], [1, sh(col, .45)]]) { c.strokeStyle = sc; c.lineWidth = lw; c.beginPath(); c.moveTo(xa, y - 30 - (lw === 1 ? 1 : 0)); c.quadraticCurveTo((xa + xb) / 2, y - 8 - (lw === 1 ? 1 : 0), xb, y - 30 - (lw === 1 ? 1 : 0)); c.stroke(); } }
  for (let i = 0; i <= n; i++) { const px = Math.round(x0 + i * step);
    E(p.ink, px, y + 2, 13, 5); E(brass, px, y + 1, 11, 3.5); R(p.ink, px - 3, y - 34, 6, 35); R(brass, px - 2, y - 33, 4, 33); R(sh(brass, .45), px - 2, y - 33, 1, 33);
    E(p.ink, px, y - 37, 5.5); E(brass, px, y - 37, 4); R("#ffffff", px - 2, y - 40, 2, 2); }
}
function bunting(seed, y0){
  for (let seg = 0; seg < 8; seg++) { const xa = seg * 160;
    c.strokeStyle = p.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(xa, y0); c.quadraticCurveTo(xa + 80, y0 + 28, xa + 160, y0); c.stroke();
    for (let k = 0; k < 7; k++) { const t2 = (k + .5) / 7, fx = xa + t2 * 160, fy = y0 + Math.sin(t2 * Math.PI) * 14, col = [p.pink, p.cyan, p.gold, p.mint, p.violet][hash32(seed + seg + "-" + k) % 5];
      P(p.ink, [[fx - 9, fy - 1], [fx + 9, fy - 1], [fx, fy + 18]]); P(col, [[fx - 7, fy], [fx + 7, fy], [fx, fy + 14]]); R(sh(col, .4), fx - 6, fy, 12, 2); } }
}

// ---------- party room props ----------
function pizza(cx, cy, k){
  E(p.ink, cx, cy, 34, 11); E(sh(p.bronze, .2), cx, cy - 1, 32, 9); E(p.rust, cx, cy - 1, 27, 7); E(p.gold, cx, cy - 2, 25, 6);
  for (let j = 0; j < 6; j++) { const a = j * 1.05 + k; E(sh(p.rust, -.15), cx + Math.cos(a) * 15, cy - 2 + Math.sin(a) * 3.5, 3.5, 1.6); }
  if (k === 1) P(sh(p.bronze, -.1), [[cx, cy - 2], [cx + 32, cy - 4], [cx + 26, cy + 6]]);
}
function pizzaCounter(x, y, w, h){
  floorShadow(x, w);
  box(mix(p.ink, p.bronze, .22), x + 8, y, w - 16, 50);
  txt("PIZZA", x + 76, y + 25, p.gold, 24, "center");
  [["SLICE", "2"], ["PIE", "9"], ["SODA", "1"]].forEach(([a, b], k) => { txt(a, x + 152, y + 12 + k * 13, p.paper); txt(b, x + w - 22, y + 12 + k * 13, p.mint, 8, "right"); });
  box(mix(p.rust, p.ink, .5), x + 12, y + 58, 150, 98);
  for (let r = 0; r < 6; r++) for (let k = 0; k < 9; k++) { const bx = x + 16 + k * 18 - (r % 2) * 9; if (bx < x + 14 || bx + 16 > x + 160) continue; R(mix(p.rust, p.ink, .3), bx, y + 62 + r * 15, 16, 12); R(sh(mix(p.rust, p.ink, .3), .25), bx, y + 62 + r * 15, 16, 2); }
  E(p.ink, x + 87, y + 126, 46, 30); R(p.ink, x + 41, y + 126, 92, 30); E(mix(p.rust, p.ink, .82), x + 87, y + 126, 42, 26); R(mix(p.rust, p.ink, .82), x + 45, y + 126, 84, 28);
  halo(p.gold, x + 50, y + 108, 74, 44, .08);
  box(mix(p.silver, p.ink, .3), x + 176, y + 66, 104, 84);
  for (let k = 0; k < 4; k++) { const col = [p.rust, p.mint, p.gold, p.violet][k]; R(p.ink, x + 186 + k * 24, y + 74, 16, 28); R(col, x + 188 + k * 24, y + 76, 12, 24); R(sh(col, .45), x + 188 + k * 24, y + 76, 12, 3); R(p.ink, x + 192 + k * 24, y + 102, 4, 10); }
  for (let k = 0; k < 3; k++) box(p.paper, x + 190 + k * 26, y + 124, 16, 20, { ol: 1, b: 1 });
  box(p.bronze, x, y + 156, w, h - 156); R(sh(p.bronze, .35), x + 2, y + 158, w - 4, 4);
  c.save(); c.beginPath(); c.rect(x + 8, y + 176, w - 16, h - 186); c.clip(); for (let i = 0; i < 26; i++) for (let j = 0; j < 6; j++) R((i + j) % 2 ? p.paper : p.rust, x + 8 + i * 12, y + 176 + j * 12, 12, 12); c.restore();
  R(p.ink, x + 6, y + 174, w - 12, 2);
  for (let k = 0; k < 3; k++) pizza(x + 56 + k * 94, y + 160, k);
  pool(p.gold, x + w / 2, 406, w / 2, 14, .06);
}
function ovenAnim(x, y){ const f = Math.sin(T * 7) * 3, g = Math.sin(T * 11) * 2; E(p.rust, x + 87, y + 144, 32 + f, 9); E(p.gold, x + 87, y + 146, 20 + g, 5); if (Math.sin(T * 5) > .6) R("#ffffff", x + 80 + Math.round(f * 3), y + 134, 2, 2); }
function partyWall(){
  const cols = [p.pink, p.cyan, p.gold, p.mint, p.violet];
  for (let k = 0; k <= 22; k++) { const a = Math.PI * k / 22, bx = 612 - Math.cos(a) * 238, by = 386 - Math.sin(a) * 178;
    [[-7, 0], [7, 2]].forEach(([dx, dy], j) => { const col = cols[(k * 2 + j) % 5]; E(p.ink, bx + dx, by + dy, 12, 13); E(sh(col, -.3), bx + dx, by + dy, 10, 11); E(col, bx + dx - 1, by + dy - 1, 8.5, 9.5); R("#ffffff", bx + dx - 5, by + dy - 7, 3, 3); }); }
  c.strokeStyle = p.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(418, 236); c.quadraticCurveTo(612, 268, 806, 236); c.stroke();
  const word = "PARTY TIME";
  for (let k = 0; k < word.length; k++) { if (word[k] === " ") continue; const t2 = (k + .5) / word.length, fx = Math.round(418 + t2 * 388), fy = Math.round(236 + Math.sin(t2 * Math.PI) * 16), col = cols[k % 5];
    P(p.ink, [[fx - 18, fy - 1], [fx + 18, fy - 1], [fx + 18, fy + 26], [fx, fy + 38], [fx - 18, fy + 26]]); P(col, [[fx - 16, fy + 1], [fx + 16, fy + 1], [fx + 16, fy + 25], [fx, fy + 35], [fx - 16, fy + 25]]); R(sh(col, .4), fx - 16, fy + 1, 32, 2);
    txt(word[k], fx, fy + 14, p.paper, 16, "center"); }
  box(p.violet, 556, 330, 56, 58); R(p.gold, 581, 330, 6, 58); R(p.gold, 556, 352, 56, 6);
  box(p.pink, 616, 346, 46, 42); R(p.mint, 636, 346, 6, 42); R(p.mint, 616, 362, 46, 5);
  box(p.cyan, 582, 300, 38, 30); R(p.pink, 598, 300, 6, 30); P(p.ink, [[590, 300], [601, 292], [612, 300]]); P(p.pink, [[593, 299], [601, 294], [609, 299]]);
}
function partyTable(cx, y, w){
  const top = y - 22, xl = cx - w / 2;
  c.save(); c.globalAlpha = .45; E(p.ink, cx, y + 24, w / 2 + 6, 8); c.restore();
  P(p.ink, [[xl + 8, top - 2], [xl + w - 8, top - 2], [xl + w + 2, y + 2], [xl - 2, y + 2]]); P(p.paper, [[xl + 10, top], [xl + w - 10, top], [xl + w, y], [xl, y]]);
  for (let k = 0; k < 16; k++) { const hh = hash32("cf" + cx + k); R([p.pink, p.cyan, p.gold, p.mint][hh % 4], xl + 14 + hh % (w - 28), top + 3 + (hh >>> 7) % 16, 3, 2); }
  R(p.ink, xl - 2, y, w + 4, 20);
  for (let k = 0; k < w; k += 12) { const col = (k / 12) % 2 ? p.pink : p.cyan; R(col, xl + k, y + 2, Math.min(12, w - k), 14); E(col, xl + k + 6, y + 16, 6, 4); R(sh(col, .4), xl + k, y + 2, Math.min(12, w - k), 2); }
  box(p.pink, cx - 20, top - 12, 40, 16, { ol: 2, b: 2 }); R(p.paper, cx - 20, top - 12, 40, 4); for (let k = 0; k < 4; k++) R(p.paper, cx - 13 + k * 8, top - 20, 2, 8);
  box(p.cyan, xl + 22, top - 6, 9, 11, { ol: 1, b: 1 }); box(p.gold, xl + 36, top - 4, 9, 11, { ol: 1, b: 1 });
  P(p.ink, [[xl + w - 46, top + 6], [xl + w - 30, top + 6], [xl + w - 38, top - 16]]); P(p.mint, [[xl + w - 44, top + 4], [xl + w - 32, top + 4], [xl + w - 38, top - 12]]); R(p.pink, xl + w - 41, top - 4, 6, 2);
  box(sh(p.bronze, .2), xl + w - 26, top - 3, 18, 10, { ol: 1, b: 1 });
}
function tableAnim(cx, y, w, k){
  const top = y - 22, xl = cx - w / 2;
  for (let j = 0; j < 4; j++) { const fx = cx - 13 + j * 8, f = Math.round(Math.sin(T * 10 + j * 2 + k)); R(p.gold, fx - 1, top - 25 + f, 4, 5); R(p.paper, fx, top - 23 + f, 2, 2); }
  [[10, p.pink, 0], [w - 10, p.cyan, 1.7], [30, p.gold, 3.1]].forEach(([dx, col, ph], j) => {
    const ax = xl + dx, bx = ax + Math.round(Math.sin(T * .9 + ph + k) * 3), by = top - 104 + Math.round(Math.sin(T * 1.3 + ph + k) * 4);
    if (k === 2 && j === 1) { // a little Drifloon homage drifting with the balloons: purple body, yellow cross, two thin string arms
      const dv = mix(p.violet, p.pink, .25); c.strokeStyle = p.ink; c.lineWidth = 1; c.beginPath(); c.moveTo(bx - 4, by + 12); c.lineTo(bx - 7, by + 26); c.moveTo(bx + 4, by + 12); c.lineTo(bx + 7, by + 27); c.stroke();
      R(p.gold, bx - 9, by + 25, 3, 3); R(p.gold, bx + 6, by + 26, 3, 3);
      E(p.ink, bx, by, 12, 13); E(sh(dv, -.3), bx, by, 10, 11); E(dv, bx - 1, by - 1, 8.5, 9.5); E(p.ink, bx, by - 13, 5, 3.5); E(p.paper, bx, by - 13, 4, 2.5);
      R(p.ink, bx - 5, by - 4, 2, 3); R(p.ink, bx + 3, by - 4, 2, 3); for (const [qx, qy] of [[-3, 2], [1, 2], [-1, 4], [-3, 6], [1, 6]]) R(p.gold, bx + qx, by + qy, 2, 2); R("#ffffff", bx - 6, by - 8, 2, 3);
      return; }
    c.strokeStyle = p.ink; c.lineWidth = 1; c.beginPath(); c.moveTo(ax, top + 2); c.quadraticCurveTo(ax + 6, top - 50, bx, by + 14); c.stroke();
    E(p.ink, bx, by, 12, 14); E(sh(col, -.3), bx, by, 10, 12); E(col, bx - 1, by - 1, 8.5, 10.5); R("#ffffff", bx - 5, by - 8, 3, 4); P(col, [[bx - 3, by + 15], [bx + 3, by + 15], [bx, by + 11]]);
  });
}
const DISCO_X = 1010;
function discoBall(){ const x = DISCO_X; R(p.ink, x - 1, 0, 3, 42); E(p.ink, x, 60, 20); E(p.silver, x, 60, 18); c.save(); c.beginPath(); c.arc(x, 60, 18, 0, Math.PI * 2); c.clip(); for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) if ((i + j) % 2) R(sh(p.silver, -.32), x - 21 + i * 6, 39 + j * 6, 6, 6); c.restore(); R("#ffffff", x - 9, 49, 4, 4); }
function discoAnim(){
  c.save(); c.globalCompositeOperation = "lighter"; c.globalAlpha = .17; const cols = [p.pink, p.cyan, p.gold, p.mint];
  for (let k = 0; k < 12; k++) { const a = T * .45 + k * 2.4; E(cols[k % 4], 640 + Math.sin(a) * 600, 420 + Math.sin(a * 1.3 + k) * 240, 11, 7); } c.restore();
  const s = Math.floor(T * 3) % 6; R("#ffffff", DISCO_X - 10 + (s * 5) % 18, 52 + (s * 7) % 16, 2, 2);
}
function ballPit(x, y, w){
  const top = y - 44, bot = y + 30;
  c.save(); c.globalAlpha = .3; for (let k = 0; k <= w; k += 8) R(p.paper, x + k, top - 96, 1, 70); for (let k = 0; k <= 70; k += 8) R(p.paper, x, top - 96 + k, w, 1); c.restore();
  box(mix(p.cyan, p.ink, .35), x, top - 26, w, 30); for (let k = 40; k < w; k += 48) R(mix(p.cyan, p.ink, .6), x + k, top - 24, 2, 26);
  R(mix(p.sky2, p.ink, .4), x + 2, top + 4, w - 4, bot - top - 4);
  const cols = [p.pink, p.cyan, p.gold, p.mint, p.violet], balls = [];
  for (let i = 0; i < 160; i++) { const hh = hash32("ball" + i); balls.push([x + 8 + hh % (w - 16), top + 6 + (hh >>> 9) % (bot - top - 10), cols[(hh >>> 4) % 5]]); }
  balls.sort((a, b) => a[1] - b[1]);
  for (const [bx, by, col] of balls) { E(p.ink, bx, by, 6.5); E(sh(col, -.35), bx, by, 5.5); E(col, bx - 1, by - 1, 4.2); R("#ffffff", bx - 3, by - 4, 2, 2); }
  for (const px of [x - 12, x + w - 2]) { box(p.gold, px, top - 50, 14, bot - top + 54); E(p.ink, px + 7, top - 55, 9); E(p.pink, px + 7, top - 55, 7); R("#ffffff", px + 4, top - 59, 2, 2); }
  box(mix(p.pink, p.ink, .3), x - 4, bot - 6, w + 8, 18); for (let k = 40; k < w; k += 48) R(mix(p.pink, p.ink, .55), x + k, bot - 4, 2, 14);
}

// ---------- observatory props ----------
function starMap(x, y, w, h){
  floorShadow(x, w);
  box(mix(p.steel, p.ink, .45), x, y, w, h);
  const sx = x + 12, sy = y + 12, sw = w - 24, shh = h - 44, cx = sx + sw / 2, cy = sy + shh / 2;
  inset(mix(p.sky, p.ink, .35), sx, sy, sw, shh);
  c.save(); c.beginPath(); c.rect(sx, sy, sw, shh); c.clip();
  c.lineWidth = 2; for (const r of [24, 48, 72, 96, 120]) { c.strokeStyle = (r / 24) % 2 ? mix(p.violet, p.ink, .35) : mix(p.cyan, p.ink, .5); c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke(); }
  R(mix(p.cyan, p.ink, .55), cx - 1, sy, 2, shh); R(mix(p.cyan, p.ink, .55), sx, cy - 1, sw, 2);
  for (let i = 0; i < 46; i++) { const hh = hash32("sm" + i); R(i % 5 ? p.paper : p.cyan, sx + 4 + hh % (sw - 8), sy + 4 + (hh >>> 8) % (shh - 8), i % 7 ? 1 : 2, i % 7 ? 1 : 2); }
  const con = [[cx - 90, cy - 40], [cx - 60, cy - 60], [cx - 28, cy - 46], [cx - 12, cy - 70], [cx + 20, cy - 52]];
  c.strokeStyle = rgba(p.gold, .7); c.lineWidth = 1; c.beginPath(); con.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.stroke(); for (const [a, b] of con) { R(p.gold, a - 2, b - 2, 4, 4); R("#ffffff", a - 1, b - 1, 1, 1); }
  E(p.ink, cx + 70, cy + 40, 13); E(p.gold, cx + 70, cy + 40, 11); E(sh(p.gold, -.35), cx + 73, cy + 43, 7); c.strokeStyle = p.paper; c.lineWidth = 2; c.beginPath(); c.ellipse(cx + 70, cy + 40, 22, 6, -.3, 0, Math.PI * 2); c.stroke();
  E(p.ink, cx - 70, cy + 52, 7); E(p.pink, cx - 70, cy + 52, 5.5);
  c.restore();
  R(p.ink, x + 12, y + h - 28, w - 24, 18); R(mix(p.steel, p.ink, .2), x + 14, y + h - 26, w - 28, 14);
  txt("RA 14 DEC 32", x + 22, y + h - 19, p.mint); for (let k = 0; k < 4; k++) { E(p.ink, x + w - 90 + k * 18, y + h - 19, 5); E(k % 2 ? p.pink : p.gold, x + w - 90 + k * 18, y + h - 20, 3.5); }
  pool(p.cyan, x + w / 2, 406, w / 2, 14, .06);
}
function mapAnim(x, y, w, h){
  const sx = x + 12, sy = y + 12, sw = w - 24, shh = h - 44, cx = sx + sw / 2, cy = sy + shh / 2, a = T * 1.2;
  c.save(); c.beginPath(); c.rect(sx, sy, sw, shh); c.clip(); c.globalCompositeOperation = "lighter";
  for (let k = 0; k < 5; k++) { c.globalAlpha = .26 - k * .05; c.fillStyle = p.mint; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, 130, a - (k + 1) * .13, a - k * .13); c.closePath(); c.fill(); }
  c.restore();
  if (T % 3 < 1.6) { R(p.pink, cx + 40, cy - 32, 4, 4); halo(p.pink, cx + 40, cy - 32, 4, 4, .3); }
  for (let k = 0; k < 6; k++) { const hh = hash32("tw" + k); if ((Math.floor(T * 2) + k) % 4 === 0) { const qx = sx + 8 + hh % (sw - 16), qy = sy + 8 + (hh >>> 8) % (shh - 16); R(p.paper, qx - 2, qy, 5, 1); R(p.paper, qx, qy - 2, 1, 5); } }
}
function domeStars(){ for (let k = 0; k < 10; k++) { const hh = hash32("dt" + k); if ((Math.floor(T * 2 + k * .7)) % 3 === 0) { const qx = 612 + hh % 176, qy = 6 + (hh >>> 8) % 96; R(p.paper, qx - 1, qy, 3, 1); R(p.paper, qx, qy - 1, 1, 3); } } }
function telescope(){
  const px = 590, py = 236, ang = Math.atan2(30 - py, 704 - px);
  c.save(); c.translate(px, py); c.rotate(ang);
  R(p.ink, -50, -24, 260, 48); R(p.silver, -48, -22, 256, 44); R(sh(p.silver, .4), -48, -22, 256, 6); R(sh(p.silver, -.35), -48, 14, 256, 8);
  for (const bx of [-10, 60, 150]) { R(p.ink, bx, -24, 8, 48); R(p.violet, bx + 2, -22, 4, 44); }
  R(p.ink, 200, -29, 30, 58); R(sh(p.silver, -.2), 202, -27, 26, 54); R(sh(p.silver, .3), 202, -27, 26, 4); R(p.cyan, 226, -22, 3, 44);
  R(p.ink, 40, -40, 84, 14); R(p.silver, 42, -38, 80, 10); R(sh(p.silver, .4), 42, -38, 80, 2);
  c.restore();
  box(mix(p.steel, p.ink, .3), px - 30, py - 12, 60, 40); E(p.ink, px, py, 18); E(p.gold, px, py, 14); E(sh(p.gold, .5), px - 4, py - 4, 4);
}
function consoleUnit(x, y, i){
  floorShadow(x - 4, 100);
  const ax = x + 70; R(p.ink, ax - 2, y - 46, 5, 48); R(p.silver, ax - 1, y - 46, 2, 46); E(p.ink, ax, y - 48, 4);
  if (i % 2 === 0) { c.save(); c.translate(x + 30, y - 18); c.rotate(-.5); E(p.ink, 0, 0, 24, 10); E(p.silver, 0, -1, 22, 8); E(sh(p.silver, -.35), 0, 2, 15, 4); R(p.ink, -1, -18, 3, 16); c.restore(); R(p.ink, x + 27, y - 14, 6, 16); }
  box(mix(p.steel, p.ink, .35), x, y, 92, 144);
  R(p.ink, x + 8, y + 10, 76, 46); R(mix(p.mint, p.ink, .84), x + 10, y + 12, 72, 42); D(mix(p.mint, p.ink, .7), x + 10, y + 12, 72, 42, "sparse"); R(mix(p.mint, p.ink, .65), x + 10, y + 32, 72, 1);
  P(p.ink, [[x - 4, y + 64], [x + 96, y + 64], [x + 100, y + 86], [x - 8, y + 86]]); P(mix(p.steel, p.ink, .15), [[x - 2, y + 66], [x + 94, y + 66], [x + 97, y + 84], [x - 5, y + 84]]);
  for (let r = 0; r < 2; r++) for (let k = 0; k < 9; k++) { R(sh(p.steel, .3), x + 1 + k * 10, y + 69 + r * 7, 8, 5); R(p.ink, x + 1 + k * 10, y + 73 + r * 7, 8, 1); }
  for (let k = 0; k < 3; k++) { E(p.ink, x + 18 + k * 28, y + 104, 8); E(sh(p.silver, -.15), x + 18 + k * 28, y + 104, 6); R(p.ink, x + 17 + k * 28, y + 98, 2, 6); }
  for (let k = 0; k < 4; k++) { R(p.ink, x + 12 + k * 20, y + 118, 5, 18); R(p.gold, x + 10 + k * 20, y + 122 + (k * 5) % 10, 9, 4); }
  pool(p.mint, x + 46, 406, 56, 12, .06);
}
function consoleAnim(x, y, i){
  c.save(); c.beginPath(); c.rect(x + 10, y + 12, 72, 42); c.clip(); c.strokeStyle = [p.mint, p.cyan, p.gold, p.mint, p.pink][i % 5]; c.lineWidth = 2; c.beginPath();
  for (let k = 0; k <= 72; k += 3) { const v = Math.sin(k * .18 + T * 4 + i) * 10 * Math.sin(T * .8 + i * 1.3) + Math.sin(k * .5 - T * 6) * 3; if (k) c.lineTo(x + 10 + k, y + 33 + v); else c.moveTo(x + 10, y + 33 + v); }
  c.stroke(); c.restore();
  if (Math.floor(T * 2 + i) % 2) { R(p.pink, x + 68, y - 50, 5, 4); halo(p.pink, x + 68, y - 50, 5, 4, .25); }
  for (let k = 0; k < 4; k++) if ((Math.floor(T * 3) + k + i) % 4 === 0) R(p.mint, x + 6 + k * 6, y + 58, 4, 3);
}
function anomaly(x, y){
  floorShadow(x, 112);
  box(mix(p.steel, p.ink, .35), x, y + 168, 112, 44);
  c.save(); c.beginPath(); c.rect(x + 6, y + 176, 100, 14); c.clip(); R(p.ink, x + 6, y + 176, 100, 14); for (let k = -2; k < 10; k++) P(p.gold, [[x + 6 + k * 14, y + 190], [x + 13 + k * 14, y + 176], [x + 20 + k * 14, y + 176], [x + 13 + k * 14, y + 190]]); c.restore();
  R(p.ink, x + 22, y + 30, 68, 140); R(mix(p.pink, p.ink, .8), x + 24, y + 32, 64, 136); D(mix(p.pink, p.ink, .65), x + 24, y + 32, 64, 136, "sparse");
  E(sh(p.pink, .2), x + 56, y + 100, 12, 24);
  for (const yy of [y + 58, y + 140]) { R(p.ink, x + 18, yy, 76, 6); R(p.silver, x + 20, yy + 1, 72, 3); }
  c.save(); c.globalAlpha = .22; R("#ffffff", x + 28, y + 36, 4, 128); c.restore();
  box(mix(p.steel, p.ink, .2), x + 14, y + 14, 84, 18); box(p.gold, x + 46, y, 20, 14);
  txt("!", x + 56, y + 197, p.ink, 8, "center", null);
  pool(p.pink, x + 56, 406, 80, 16, .1);
}
function anomalyAnim(x, y){
  const pu = (Math.sin(T * 3) + 1) / 2;
  E(sh(p.pink, .2), x + 56, y + 100, 12 + pu * 6, 24 + pu * 8); E(sh(p.pink, .7), x + 56, y + 100, 5 + pu * 3, 12 + pu * 4);
  c.save(); c.strokeStyle = p.pink; c.lineWidth = 2; for (let k = 0; k < 3; k++) { const ph = (T * .8 + k / 3) % 1; c.globalAlpha = (1 - ph) * .5; c.beginPath(); c.ellipse(x + 56, y + 100, 20 + ph * 60, 8 + ph * 24, 0, 0, Math.PI * 2); c.stroke(); } c.restore();
  for (let k = 0; k < 6; k++) { const a = T * 2 + k; R(p.paper, Math.round(x + 56 + Math.cos(a) * 24), Math.round(y + 100 + Math.sin(a) * 44), 2, 2); }
  R(Math.floor(T * 4) % 2 ? p.rust : sh(p.rust, -.5), x + 50, y + 3, 12, 8);
}
function uplink(x, y, w, h){
  floorShadow(x, w);
  R(p.ink, x + w - 66, y + 18, 10, 26); R(p.silver, x + w - 64, y + 18, 6, 24);
  c.save(); c.translate(x + w - 60, y + 16); c.rotate(-.55); E(p.ink, 0, 0, 46, 16); E(p.silver, 0, -2, 43, 13); E(sh(p.silver, -.3), 0, 3, 32, 7); R(p.ink, -2, -38, 4, 36); E(p.ink, 0, -40, 5); E(p.pink, 0, -40, 3.5); c.restore();
  box(mix(p.steel, p.ink, .4), x, y + 40, w, h - 40);
  inset(mix(p.mint, p.ink, .86), x + 14, y + 56, w - 28, 90);
  for (let k = 1; k < 4; k++) R(mix(p.mint, p.ink, .72), x + 16, y + 56 + k * 22, w - 32, 1);
  for (let r = 0; r < 3; r++) { R(p.ink, x + 10, y + 156 + r * 22, w - 20, 18); R(mix(p.steel, p.ink, .2), x + 12, y + 158 + r * 22, w - 24, 14);
    for (let k = 0; k < 10; k++) R(k % 3 ? mix(p.mint, p.ink, .4) : mix(p.gold, p.ink, .3), x + 20 + k * 9, y + 163 + r * 22, 4, 4);
    for (let k = 0; k < 6; k++) R(p.ink, x + w - 70 + k * 9, y + 161 + r * 22, 5, 8); }
  pool(p.mint, x + w / 2, 406, w / 2, 14, .08);
}
function uplinkAnim(x, y, w){
  const n = 8, bw = (w - 48) / n;
  for (let k = 0; k < n; k++) { const bh = Math.round((.3 + .7 * Math.abs(Math.sin(T * 2 + k * .7))) * 70), bx = Math.round(x + 24 + k * bw + 2); R(p.mint, bx, y + 140 - bh, Math.round(bw - 6), bh); R(sh(p.mint, .55), bx, y + 140 - bh, Math.round(bw - 6), 2); }
  c.save(); c.strokeStyle = p.mint; c.lineWidth = 2; for (let k = 0; k < 3; k++) { const ph = (T * .7 + k / 3) % 1; c.globalAlpha = (1 - ph) * .6; c.beginPath(); c.arc(x + w - 38, y - 18, 10 + ph * 40, -1.9, -.6); c.stroke(); } c.restore();
  for (let r = 0; r < 3; r++) if ((Math.floor(T * 4) + r) % 3 === 0) R(p.mint, x + 20 + ((Math.floor(T * 4) + r * 3) % 10) * 9, y + 163 + r * 22, 4, 4);
}
function sofaAnim(x, y, w){ for (let k = 0; k < 10; k++) { const ph = (T * .25 + k / 10) % 1; c.save(); c.globalAlpha = 1 - ph; R(k % 2 ? p.violet : p.paper, x + 20 + hash32("dp" + k) % (w - 40), Math.round(y - 30 - ph * 90), 2, 2); c.restore(); } }

// ---------- agora props ----------
function column(cx, top, bot){
  const m = mix(p.paper, p.ink, .22);
  R(p.ink, cx - 19, top + 14, 38, bot - top - 28); R(m, cx - 17, top + 14, 34, bot - top - 28);
  for (let k = 0; k < 5; k++) R(sh(m, -.24), cx - 12 + k * 6, top + 16, 2, bot - top - 32);
  R(sh(m, .35), cx - 17, top + 14, 3, bot - top - 28); R(sh(m, -.35), cx + 13, top + 14, 4, bot - top - 28);
  box(m, cx - 26, top, 52, 14); for (const vx of [cx - 24, cx + 24]) { E(p.ink, vx, top + 9, 7); E(m, vx, top + 9, 5); E(sh(m, -.35), vx, top + 9, 2); }
  box(m, cx - 26, bot - 14, 52, 14); R(sh(m, -.2), cx - 22, bot - 8, 44, 2);
}
function painting(x, y, w, h, title, col, k){
  R(p.ink, x - 4, y - 4, w + 8, h + 8); box(mix(p.gold, p.ink, .25), x - 2, y - 2, w + 4, h + 4, { ol: 0 });
  R(p.ink, x + 4, y + 4, w - 8, h - 8); bands(x + 6, y + 6, w - 12, h - 12, [mix(col, p.sky, .45), mix(col, p.ink, .4), mix(col, p.ink, .6)]);
  R(mix(p.ink, col, .15), x + 6, y + 6, w - 12, 13); txt(title, x + w / 2, y + 13, col, 8, "center");
  const cx = x + w / 2, cy = y + 50;
  if (k === 0) { E(p.ink, cx, cy + 6, 16, 20); E(p.bronze, cx, cy + 6, 14, 18); E(sh(p.bronze, .3), cx, cy + 14, 8, 10); for (const d of [-6, 6]) { E(p.ink, cx + d, cy, 6); E(p.paper, cx + d, cy, 5); R(p.ink, cx + d - 1, cy - 1, 3, 3); } P(p.gold, [[cx - 3, cy + 5], [cx + 3, cy + 5], [cx, cy + 10]]); P(p.bronze, [[cx - 14, cy - 10], [cx - 8, cy - 18], [cx - 6, cy - 10]]); P(p.bronze, [[cx + 14, cy - 10], [cx + 8, cy - 18], [cx + 6, cy - 10]]); }
  else if (k === 1) { c.strokeStyle = p.paper; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy - 22); c.lineTo(cx + 24, cy + 18); c.lineTo(cx - 24, cy + 18); c.closePath(); c.stroke(); c.beginPath(); c.arc(cx, cy + 5, 12, 0, Math.PI * 2); c.stroke(); R(p.gold, cx - 2, cy + 3, 4, 4); }
  else if (k === 2) { R(p.gold, cx - 1, cy - 18, 3, 34); R(p.gold, cx - 24, cy - 14, 49, 3); for (const d of [-20, 20]) { R(p.paper, cx + d, cy - 12, 1, 12); P(p.gold, [[cx + d - 10, cy], [cx + d + 10, cy], [cx + d, cy + 7]]); } R(p.gold, cx - 10, cy + 16, 21, 4); }
  else { P(p.ink, [[cx - 12, cy + 22], [cx + 12, cy + 22], [cx + 16, cy + 4], [cx + 8, cy - 4], [cx - 8, cy - 4], [cx - 16, cy + 4]]); P(p.rust, [[cx - 10, cy + 20], [cx + 10, cy + 20], [cx + 13, cy + 5], [cx + 7, cy - 2], [cx - 7, cy - 2], [cx - 13, cy + 5]]); R(p.gold, cx - 12, cy + 8, 24, 2); for (const [fx, fy, fc] of [[-8, -14, p.pink], [0, -20, p.gold], [9, -13, p.paper]]) { R(p.mint, cx + fx, cy + fy, 2, 14); E(p.ink, cx + fx + 1, cy + fy, 5); E(fc, cx + fx + 1, cy + fy, 4); } }
  if (k === 0 || k === 2) D(p.ink, x + 6, y + 19, w - 12, h - 25, "sparse");
}
function scrollStacks(x, y, w, h){
  floorShadow(x, w);
  box(mix(p.bronze, p.ink, .35), x, y, w, h);
  const cw = Math.floor((w - 20) / 5), ch = Math.floor((h - 20) / 4);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 5; k++) { const bx = x + 10 + k * cw, by = y + 10 + r * ch, hh = hash32("cb" + r + k);
    R(p.ink, bx, by, cw - 4, ch - 4); R(mix(p.bronze, p.ink, .72), bx + 2, by + 2, cw - 8, ch - 8);
    if (hh % 5 === 4) { for (let j = 0; j < 5; j++) { const bh2 = 26 + (hh >>> j) % 14, col = [p.violet, p.gold, p.cyan, p.rust, p.mint][(hh >>> (j + 3)) % 5]; R(p.ink, bx + 6 + j * 8, by + ch - 6 - bh2, 8, bh2); R(mix(col, p.ink, .3), bx + 7 + j * 8, by + ch - 5 - bh2, 6, bh2 - 1); R(sh(col, .3), bx + 7 + j * 8, by + ch - 1 - bh2, 6, 2); } }
    else { const pos = [[12, ch - 14], [26, ch - 14], [40, ch - 14], [19, ch - 27], [33, ch - 27], [26, ch - 40]].slice(0, 3 + hh % 4);
      for (const [dx, dy] of pos) { const sx = bx + dx, sy = by + dy; E(p.ink, sx, sy, 7.5); E(mix(p.paper, p.bronze, .25), sx, sy, 6.2); E(sh(mix(p.paper, p.bronze, .25), -.35), sx, sy, 2.5); if ((hh + dx) % 3 === 0) R([p.pink, p.violet, p.gold][(hh + dy) % 3], sx - 1, sy - 7, 2, 14); } }
  }
  for (const [lx0, lx1] of [[x + w - 70, x + w - 52], [x + w - 40, x + w - 22]]) { P(p.ink, [[lx0, y + h + 2], [lx0 + 4, y + h + 2], [lx1 + 4, y + 30], [lx1, y + 30]]); P(p.bronze, [[lx0 + 1, y + h], [lx0 + 3, y + h], [lx1 + 3, y + 32], [lx1 + 1, y + 32]]); }
  for (let k = 0; k < 8; k++) { const t2 = k / 8, ya = y + h - 6 - t2 * (h - 40); R(p.ink, x + w - 68 + t2 * 18, ya, 34, 4); R(p.bronze, x + w - 67 + t2 * 18, ya + 1, 32, 2); }
  pool(p.gold, x + w / 2, 406, w / 2, 14, .05);
}
const DT = { cx: 612, y: 466, w: 430 };
function debateTable(){
  const { cx, y, w } = DT, xl = cx - w / 2, xr = cx + w / 2, wood = mix(p.bronze, p.ink, .2);
  c.save(); c.globalAlpha = .45; E(p.ink, cx, y + 26, w / 2 + 8, 9); c.restore();
  for (const lx of [xl + 14, xr - 24, cx - 6]) { R(p.ink, lx - 2, y, 14, 26); R(sh(wood, -.3), lx, y, 10, 24); }
  P(p.ink, [[xl + 8, y - 30], [xr - 4, y - 22], [xr + 4, y + 2], [xl - 4, y + 2]]); P(wood, [[xl + 10, y - 28], [xr - 6, y - 20], [xr + 1, y], [xl - 1, y]]);
  P(sh(wood, .3), [[xl + 10, y - 28], [xr - 6, y - 20], [xr - 5, y - 17], [xl + 9, y - 25]]);
  for (let k = 0; k < 6; k++) R(sh(wood, -.15), xl + 20 + k * 66, y - 14 + (k % 3) * 3, 40, 1);
  R(p.ink, xl - 4, y, w + 8, 10); R(sh(wood, -.35), xl - 2, y + 1, w + 4, 7); R(sh(wood, -.1), xl - 2, y + 1, w + 4, 1);
  for (let k = 0; k < 5; k++) { const px = xl + 60 + k * 72, py = y - 18 - (k % 2) * 3; R(p.ink, px - 1, py - 1, 26, 14); R(p.paper, px, py, 24, 12); R(sh(p.paper, -.35), px + 3, py + 4, 16, 1); R(sh(p.paper, -.35), px + 3, py + 7, 12, 1); }
  P(p.paper, [[xl + 150, y - 10], [xl + 176, y - 30], [xl + 172, y - 26]]); R(p.ink, xl + 149, y - 10, 2, 2);
  const hx = xr - 70; R(p.ink, hx - 8, y - 42, 16, 3); R(p.ink, hx - 8, y - 16, 16, 3); P(rgba(p.paper, .6), [[hx - 6, y - 39], [hx + 6, y - 39], [hx, y - 29], [hx + 6, y - 19], [hx - 6, y - 19], [hx, y - 29]]); P(p.gold, [[hx - 4, y - 19], [hx + 4, y - 19], [hx, y - 24]]);
  for (const fx of DT_CANDLES) { R(p.ink, fx - 3, y - 38, 7, 20); R(p.paper, fx - 2, y - 37, 5, 18); R(sh(p.paper, -.3), fx + 1, y - 37, 2, 18); E(p.ink, fx, y - 18, 8, 3); E(p.gold, fx, y - 18, 7, 2); }
}
const DT_CANDLES = [DT.cx - DT.w / 2 + 34, DT.cx - 30, DT.cx + DT.w / 2 - 34];
function candleAnim(){ for (let k = 0; k < DT_CANDLES.length; k++) { const fx = DT_CANDLES[k], f = Math.round(Math.sin(T * 9 + k * 2)), y = DT.y - 38; R(p.gold, fx - 2, y - 8 + f, 5, 8); R(p.paper, fx - 1, y - 5 + f, 2, 4); halo(p.gold, fx - 3, y - 10, 7, 10, .12 + .04 * Math.sin(T * 7 + k)); } }
function podium(x, y){
  floorShadow(x, 112);
  const wood = mix(p.bronze, p.ink, .3);
  box(wood, x + 20, y + 110, 72, 102); R(sh(wood, -.25), x + 26, y + 120, 60, 2);
  R(p.gold, x + 55, y + 128, 2, 34); R(p.gold, x + 38, y + 132, 36, 2); for (const d of [-16, 16]) P(p.gold, [[x + 56 + d - 9, y + 146], [x + 56 + d + 9, y + 146], [x + 56 + d, y + 152]]); R(p.gold, x + 48, y + 162, 16, 3);
  box(wood, x + 12, y + 198, 88, 14);
  P(p.ink, [[x + 4, y + 94], [x + 108, y + 84], [x + 108, y + 110], [x + 4, y + 116]]); P(sh(wood, .15), [[x + 6, y + 96], [x + 106, y + 86], [x + 106, y + 108], [x + 6, y + 114]]); R(sh(wood, .45), x + 6, y + 96, 100, 2);
  P(p.paper, [[x + 30, y + 96], [x + 70, y + 92], [x + 72, y + 104], [x + 32, y + 108]]);
  c.save(); c.translate(x + 86, y + 84); c.rotate(-.4); R(p.ink, -2, -2, 26, 9); R(p.bronze, 0, 0, 22, 5); R(p.ink, 8, -10, 9, 14); R(sh(p.bronze, .2), 9, -9, 7, 12); c.restore();
  pool(p.pink, x + 56, 406, 70, 14, .08);
}
function burstAnim(x, y){
  const s = 1 + Math.sin(T * 4) * .06, cx = x + 56, cy = y + 30, pts = [], out = [];
  for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8, r = (k % 2 ? 40 : 58) * s; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * .55]); out.push([cx + Math.cos(a) * (r + 4), cy + Math.sin(a) * (r + 4) * .55]); }
  P(p.ink, out); P(p.pink, pts); halo(p.pink, cx - 40, cy - 16, 80, 32, .08);
  txt("OBJECTION!", cx, cy, p.paper, 8, "center");
}
function archive(x, y, w, h){
  floorShadow(x, w);
  box(mix(p.bronze, p.ink, .45), x, y, w, h);
  const cols = [p.cyan, p.mint, p.gold, p.violet, p.pink, p.rust];
  for (let r = 0; r < 5; r++) { const sy = y + 12 + r * 43; R(p.ink, x + 8, sy, w - 16, 39); R(mix(p.ink, p.sky2, .4), x + 10, sy + 2, w - 20, 35);
    let bx = x + 12, k = 0;
    while (bx < x + w - 20) { const hh = hash32("bk" + r + "-" + k++), bw = 6 + hh % 6, bh = 22 + (hh >>> 4) % 12, col = cols[(hh >>> 8) % 6];
      if (hh % 11 === 0) { E(p.ink, bx + 7, sy + 31, 7.5); E(mix(p.paper, p.bronze, .25), bx + 7, sy + 31, 6); E(sh(p.paper, -.4), bx + 7, sy + 31, 2); bx += 16; continue; }
      R(p.ink, bx, sy + 37 - bh, bw, bh); R(mix(col, p.ink, .35), bx + 1, sy + 38 - bh, bw - 2, bh - 1); R(sh(col, .2), bx + 1, sy + 41 - bh, bw - 2, 2); R(sh(col, .2), bx + 1, sy + 31, bw - 2, 1);
      if (hh % 4 === 0) halo(col, bx, sy + 37 - bh, bw, bh, .1);
      bx += bw + (hh % 7 === 0 ? 3 : 0); }
    box(mix(p.bronze, p.ink, .15), x + 6, sy + 37, w - 12, 4, { ol: 1, b: 1 }); }
  P(p.ink, [[x + w - 60, y + h + 2], [x + w - 55, y + h + 2], [x + w - 35, y + 8], [x + w - 40, y + 8]]); P(p.bronze, [[x + w - 59, y + h], [x + w - 56, y + h], [x + w - 36, y + 10], [x + w - 39, y + 10]]);
  pool(p.mint, x + w / 2, 406, w / 2, 14, .09);
}
function archiveAnim(x, y, w){ const cols = [p.cyan, p.mint, p.gold, p.violet, p.pink]; for (let k = 0; k < 6; k++) { const hh = hash32("ag" + k), r = hh % 5, bx = x + 16 + (hh >>> 5) % (w - 40), sy = y + 12 + r * 43; halo(cols[k % 5], bx, sy + 8, 8, 28, .07 + .07 * Math.sin(T * 2 + k * 1.3)); } }
function pit(x, y, w){
  const cx = x + w / 2, stone = mix(p.paper, p.ink, .45);
  E(p.ink, cx, y + 6, w / 2 + 4, 64); E(stone, cx, y + 6, w / 2, 60); E(sh(stone, .2), cx, y - 2, w / 2 - 8, 48);
  E(p.ink, cx, y + 12, w / 2 - 26, 46); E(sh(stone, -.12), cx, y + 12, w / 2 - 28, 44); E(sh(stone, .08), cx, y + 6, w / 2 - 34, 34);
  E(p.ink, cx, y + 18, w / 2 - 58, 30); E(sh(stone, -.35), cx, y + 18, w / 2 - 60, 28);
  [-2.75, -2.25, -.9, -.4].forEach((a, k) => box([p.pink, p.violet, p.cyan, p.gold][k], Math.round(cx + Math.cos(a) * (w / 2 - 13) - 10), Math.round(y + 6 + Math.sin(a) * 52 - 5), 20, 10, { ol: 1, b: 2 }));
}

// ---------- the five rooms: static layer (s) and animated bits (a) ----------
const FORGE = [["SFII", "cyan"], ["MKII", "pink"], ["TMNT", "violet"], ["X-MEN", "gold"], ["OUTRUN", "mint"]];
const PINS = [
  { name: "JINX", body: "violet", trim: "gold", legs: "ink", art: "cat", field: 1 },
  { name: "DUNE", body: "cyan", trim: "silver", legs: "silver", art: "burst", field: 0 },
  { name: "OOZE", body: "mint", trim: "silver", legs: "silver", art: "slime", field: 2 },
  { name: "YETI", body: "steel", trim: "cyan", legs: "silver", art: "yeti", field: 3 },
  { name: "ZAP!", body: "gold", trim: "pink", legs: "gold", art: "bolt", field: 4 }
];
const ARTS = [["WISDOM", "gold"], ["LOGIC", "cyan"], ["ETHICS", "violet"], ["AESTHETIC", "mint"]];
const ROOMS = {
  forgeFloor: {
    s(){
      env({ floor: "carpet", wall: mix(p.sky2, p.ink, .25), wall2: mix(p.violet, p.ink, .72), trim: mix(p.violet, p.ink, .45), paper: "diamond", neon: p.pink });
      prizeWall(22, 150, 300, 238, 4);
      FORGE.forEach(([t, k], i) => cabinet(CAB_X(i), 198, p[k], t));
      tokenMachine(900, 176); pickupWindow(1040, 158, 220, 230);
      couch(40, 668, 345, mix(p.violet, p.ink, .25)); lavaLamp(410, 668); queueRope(735, 1060, 652, p.pink);
      lamps([150, 380, 900, 1150], p.gold); cloudSign();
      plate("PRIZE WALL", 172, 137, p.paper); plate("CABINET ROW", 612, 181, p.cyan, 16, true); plate("TOKEN MACHINE", 962, 148, p.gold);
      plate("LOUNGE", 212, 708, p.paper); plate("TOKEN LINE", 898, 708, p.gold);
    },
    a(){ FORGE.forEach((f, i) => game(i, CAB_X(i) + 12, 244, 54, 52, T + i * 1.7)); tokenAnim(900, 176); lavaAnim(410, 668); signBulbs(); amb(); }
  },
  nullArcade: {
    s(){
      env({ floor: "carpet", wall: mix(p.sky2, p.violet, .22), wall2: mix(p.pink, p.ink, .7), trim: mix(p.gold, p.ink, .5), paper: "stripe" });
      scoreWall(22, 150, 300, 238);
      PINS.forEach((th, i) => pinball(CAB_X(i) - 2, 196, th));
      ticketEater(898, 172, "TICKET EATER", "FEED ME"); exitDoor(1036, 158, 224, 230, "EXIT?", p.pink);
      vending(36, 652, p.rust, "SODA", 0); vending(150, 652, p.steel, "SNAX", 1); vending(264, 652, p.mint, "POP", 0);
      queueRope(735, 1060, 652, p.gold); bunting("dm2", 124); lamps([150, 380, 900, 1150], p.gold); cloudSign();
      plate("PINBALL ROW", 612, 181, p.cyan, 16, true); plate("SODA MACHINES", 212, 708, p.paper); plate("QUEUE", 898, 708, p.gold);
    },
    a(){ PINS.forEach((th, i) => pinAnim(CAB_X(i) - 2, 196, i, th)); scoreAnim(22, 150, 300, 238); eaterAnim(898, 172); exitAnim(1036, 158, 224, 230, p.pink); signBulbs(); amb(); }
  },
  dmParty: {
    s(){
      env({ floor: "carpet", wall: mix(p.sky2, p.pink, .16), wall2: mix(p.mint, p.ink, .72), trim: mix(p.mint, p.ink, .5), paper: "diamond", neon: p.cyan });
      pizzaCounter(22, 150, 300, 238); partyWall();
      partyTable(503, 462, 190); partyTable(721, 462, 190);
      ticketEater(898, 172, "TICKET EATER", "5000"); prizeWall(1036, 158, 224, 230, 3);
      ballPit(40, 668, 345); queueRope(735, 1060, 652, p.pink);
      bunting("dm3", 124); discoBall(); lamps([150, 380], p.gold); cloudSign();
      plate("PIZZA COUNTER", 172, 137, p.paper); plate("PARTY TABLES", 612, 181, p.cyan, 16, true); plate("PRIZE SHELF", 1148, 137, p.paper);
      plate("BALL PIT", 212, 701, p.paper); plate("QUEUE", 898, 708, p.gold);
    },
    a(){ ovenAnim(22, 150); tableAnim(503, 462, 190, 0); tableAnim(721, 462, 190, 2); eaterAnim(898, 172); discoAnim(); signBulbs(); amb(); }
  },
  observatory: {
    s(){
      env({ floor: "tile", wall: mix(p.steel, p.ink, .62), wall2: mix(p.steel, p.ink, .76), trim: mix(p.steel, p.ink, .4), paper: "panel", ceil: "dome" });
      starMap(22, 150, 300, 238); telescope();
      for (let i = 0; i < 5; i++) consoleUnit(CAB_X(i), 246, i);
      anomaly(900, 176); uplink(1036, 158, 224, 230);
      couch(40, 668, 345, mix(p.violet, p.ink, .55), true); queueRope(735, 1060, 652, p.gold);
      plate("STAR MAP", 172, 137, p.paper); plate("ANTENNA BANK", 470, 181, p.cyan, 16, true); plate("ANOMALY", 956, 152, p.pink); plate("UPLINK", 1148, 137, p.mint);
      plate("DARK MATTER SOFA", 212, 708, p.paper); plate("QUEUE", 898, 708, p.gold);
    },
    a(){ domeStars(); mapAnim(22, 150, 300, 238); for (let i = 0; i < 5; i++) consoleAnim(CAB_X(i), 246, i); anomalyAnim(900, 176); uplinkAnim(1036, 158, 224); sofaAnim(40, 668, 345); amb(); }
  },
  agoraArchive: {
    s(){
      env({ floor: "marble", wall: mix(p.paper, p.ink, .62), wall2: mix(p.bronze, p.ink, .6), trim: mix(p.gold, p.ink, .45), paper: "block", ceil: "coffer" });
      scrollStacks(22, 150, 300, 238); column(360, 146, 388); column(864, 146, 388);
      ARTS.forEach(([t, k], i) => painting(396 + i * 112, 190, 96, 86, t, p[k], i));
      debateTable(); podium(900, 176); archive(1036, 158, 224, 230);
      pit(40, 668, 345); queueRope(735, 1060, 652, p.gold); lamps([150, 1150], p.gold);
      plate("SCROLL STACKS", 172, 137, p.paper); plate("DEBATE TABLE", 612, 166, p.gold, 16, true); plate("GLOWING ARCHIVE", 1148, 137, p.mint);
      plate("PHILOSOPHER PIT", 212, 708, p.paper); plate("QUEUE", 898, 708, p.gold);
    },
    a(){ candleAnim(); burstAnim(900, 176); archiveAnim(1036, 158, 224); amb(); }
  }
};

// ---------- defs: same keys, order, legends and meaning as DM_ROOMS; 34 foot spots per room ----------
const ZONES = {
  work: [[396, 425], [504, 425], [612, 425], [720, 425], [828, 425], [450, 495], [558, 495], [666, 495], [774, 495], [612, 565]],
  think: [[80, 425], [165, 425], [250, 425], [122, 495], [207, 495], [292, 495]],
  attention: [[955, 425], [912, 495], [997, 495], [955, 565]],
  complete: [[1065, 425], [1150, 425], [1235, 425], [1107, 495], [1192, 495], [1150, 565]],
  idle: [[95, 668], [180, 668], [265, 668], [350, 668]],
  queued: [[770, 668], [855, 668], [940, 668], [1025, 668]]
};
const zones = () => JSON.parse(JSON.stringify(ZONES));
const ROOM_DEFS = {
  forgeFloor: { label: "DM Main Floor", icon: "01", accent: "#00E5FF",
    description: "Agents work the cabinet row under the cloud sign, browse the prize wall, break the token machine, and head out through prize pickup.",
    legend: [["#00E5FF", "Cabinet row · active build"], ["#B300FF", "Prize wall · plan / research"], ["#FF007F", "Token machine · needs attention"], ["#6EF3A5", "Prize pickup · turn ended"], ["#FFD166", "Token line · not started"], ["#8C91A8", "Lounge · stale / idle"]], zones: zones() },
  observatory: { label: "Signal Observatory", icon: "04", accent: "#B300FF",
    description: "Agents read the star map, work the antenna bank, investigate the anomaly beacon, and send completed signals through the uplink.",
    legend: [["#00E5FF", "Antenna bank · active build"], ["#B300FF", "Star map · plan / research"], ["#FF007F", "Anomaly · needs attention"], ["#6EF3A5", "Uplink · turn ended"], ["#FFD166", "Queue · not started"], ["#8C91A8", "Dark matter sofa · stale / idle"]], zones: zones() },
  agoraArchive: { label: "Agora Archive", icon: "05", accent: "#FFD166",
    description: "Agents gather around a crooked debate table, inspect scroll stacks, visit the objection podium, and file finished work in the glowing archive.",
    legend: [["#00E5FF", "Debate table · active build"], ["#B300FF", "Scroll stacks · plan / research"], ["#FF007F", "Objection · needs attention"], ["#6EF3A5", "Archive · turn ended"], ["#FFD166", "Queue · not started"], ["#8C91A8", "Philosopher pit · stale / idle"]], zones: zones() },
  nullArcade: { label: "DM Pinball Row", icon: "02", accent: "#FF007F",
    description: "Agents lean on the pinball row, chase the high-score wall, feed the ticket eater, and slip out through the suspicious exit.",
    legend: [["#00E5FF", "Pinball row · active build"], ["#B300FF", "High scores · plan / research"], ["#FF007F", "Ticket eater · needs attention"], ["#6EF3A5", "Suspicious exit · turn ended"], ["#FFD166", "Queue · not started"], ["#8C91A8", "Soda machines · stale / idle"]], zones: zones() },
  dmParty: { label: "DM Party Room", icon: "03", accent: "#6EF3A5",
    description: "Agents grab slices at the pizza counter, work the party tables under the balloons, feed the Ticket Eater 5000, and crash in the ball pit.",
    legend: [["#00E5FF", "Party tables · active build"], ["#B300FF", "Pizza counter · plan / research"], ["#FF007F", "Ticket Eater 5000 · needs attention"], ["#6EF3A5", "Prize shelf · turn ended"], ["#FFD166", "Queue · not started"], ["#8C91A8", "Ball pit · stale / idle"]], zones: zones() }
};
const ROOM_ORDER = ["forgeFloor", "nullArcade", "dmParty", "observatory", "agoraArchive"];
const STATION_NAMES = { forgeFloor: { work: "Cabinet Row", think: "Prize Wall", attention: "Token Machine", complete: "Prize Pickup", queued: "Token Line", idle: "Lounge" }, observatory: { work: "Antenna Bank", think: "Star Map", attention: "Anomaly Beacon", complete: "Uplink", queued: "Queue", idle: "Dark Matter Sofa" }, agoraArchive: { work: "Debate Table", think: "Scroll Stacks", attention: "Objection Podium", complete: "Glowing Archive", queued: "Queue", idle: "Philosopher Pit" }, nullArcade: { work: "Pinball Row", think: "High Scores", attention: "Ticket Eater", complete: "Suspicious Exit", queued: "Queue", idle: "Soda Machines" }, dmParty: { work: "Party Tables", think: "Pizza Counter", attention: "Ticket Eater 5000", complete: "Prize Shelf", queued: "Queue", idle: "Ball Pit" } };

// ---------- draw: blit the cached static layer at device resolution, then paint the animated bits ----------
const CACHE = new Map(), MAX_SIDE = 4096;
function draw(ctx, key, colorway, quiet, t){
  const room = ROOMS[key] || ROOMS.forgeFloor, cw = COLORWAYS[colorway] ? colorway : "voidArcade";
  const m = ctx.getTransform(), s = Math.hypot(m.a, m.b) || 1, sk = Math.min(Math.round(s * 1000) / 1000, MAX_SIDE / W);
  const ck = key + "|" + cw + "|" + sk + "|" + (quiet ? 1 : 0);
  let cv = CACHE.get(ck);
  if (!cv) {
    cv = document.createElement("canvas"); cv.width = Math.ceil(W * sk); cv.height = Math.ceil(H * sk);
    const g = cv.getContext("2d"); g.imageSmoothingEnabled = sk < 1; g.setTransform(sk, 0, 0, sk, 0, 0);
    const keepC = c; c = g; p = pal(cw); room.s(); if (quiet) { T = 0; room.a(); } c = keepC;
    CACHE.set(ck, cv); if (CACHE.size > 12) CACHE.delete(CACHE.keys().next().value);
  } else { CACHE.delete(ck); CACHE.set(ck, cv); }
  ctx.save(); const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
  if (sk === Math.round(s * 1000) / 1000) { ctx.setTransform(1, 0, 0, 1, Math.round(m.e), Math.round(m.f)); ctx.drawImage(cv, 0, 0); }
  else ctx.drawImage(cv, 0, 0, W, H);
  ctx.imageSmoothingEnabled = sm; ctx.restore();
  if (!quiet) { c = ctx; p = pal(cw); T = (t ?? performance.now()) / 1000; ctx.save(); room.a(); ctx.restore(); }
}
return {
  defs: ROOM_DEFS, order: ROOM_ORDER, stations: STATION_NAMES, world: { width: W, height: H }, draw,
  pixelText(ctx, text, x, y, color, size, align, outline){ return pixelText(ctx, text, x, y, color, size, align, outline); },
  textWidth: textW, version: 2, clearCache(){ CACHE.clear(); }
};
})();
