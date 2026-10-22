// dm-kit.js: shared helpers for the Dream Machine layout studies.
// Draws every character with the live app's own renderer (DM_LIVE) and every room with the
// live app's own room code (DM_ROOMS). Nothing about the characters or rooms is changed here.
// Load order: live-helpers.js, persona-module.js, persona-engine.js, meta.js, persona-live.js,
// rooms.js, content.js, dm-kit.js.
"use strict";
const DM = (function(){
  const mq = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  let reduced = !!mq.matches;
  let colorway = "voidArcade";
  let paused = false;
  const cwListeners = new Set();
  const jobs = new Set();
  const COLORWAY_NAMES = Object.keys(COLORWAYS);

  // ---------- roster data ----------
  const GROUP_LABELS = {
    crew: "The Model Crew", house: "House Originals",
    "batch-1": "Batch 1 · Ancients", "batch-2": "Batch 2 · Natural Philosophers", "batch-3": "Batch 3 · The Moderns",
    "batch-4": "Batch 4 · Naturalists and Greeks", "batch-5": "Batch 5 · The Philosophy Gauntlet",
    "batch-6": "Batch 6 · Last Philosophers and Physicists", "batch-7": "Batch 7 · The Finale",
    anime: "The Anime Block", dev: "Dev Fixtures"
  };
  const byGroup = {};
  for (const [key, m] of Object.entries(CHARACTER_META)) (byGroup[m.group] ||= []).push(key);
  const groups = ROSTER_GROUPS.filter(([g]) => byGroup[g]).map(([g]) => ({ key: g, label: GROUP_LABELS[g] || g, keys: byGroup[g].slice() }));
  const nameIndex = {};
  for (const [key, m] of Object.entries(CHARACTER_META)) nameIndex[m.name.toLowerCase()] = key;

  function keys(opts = {}){
    const want = opts.groups || null;
    const out = [];
    for (const g of groups) {
      if (want ? !want.includes(g.key) : g.key === "dev") continue;
      out.push(...g.keys);
    }
    return out;
  }
  function keyOf(nameOrKey){
    if (nameOrKey == null) return null;
    const s = String(nameOrKey).trim();
    if (CHARACTER_META[s]) return s;
    const lower = s.toLowerCase();
    if (CHARACTER_META[lower]) return lower;
    return nameIndex[lower] || null;
  }
  function clean(s){ return String(s || "").replace(/\s*[—–]\s*/g, ", "); }
  function meta(nameOrKey){
    const key = keyOf(nameOrKey);
    if (!key) {
      const name = String(nameOrKey || "?").trim().slice(0, 32) || "?";
      return { key: null, name, era: "generated", note: "Not on the roster, so the machine built this one from the name. Same name, same guy, every time.", group: "generated", groupLabel: "Persona Forge" };
    }
    const m = CHARACTER_META[key];
    return { key, name: m.name, era: m.era, note: clean(DM_PUBLIC_NOTES[key] || m.note), group: m.group, groupLabel: GROUP_LABELS[m.group] || m.group };
  }
  const dnaCache = new Map();
  function dna(nameOrKey){
    if (nameOrKey && typeof nameOrKey === "object" && nameOrKey.body) return nameOrKey;
    const key = keyOf(nameOrKey);
    const cacheKey = key || "gen:" + String(nameOrKey);
    if (dnaCache.has(cacheKey)) return dnaCache.get(cacheKey);
    let d;
    try { d = key ? TeamLoopPersona.compile(CHARACTER_META[key].name, key) : TeamLoopPersona.compile(String(nameOrKey || "glitchling")); }
    catch (e) { d = PERSONA_RECIPES[key] || { body: "round", head: "round", face: "dots", hat: "none", outfit: "coat", shell: "none", prop: "none", aura: "none", motif: "none", colors: ["bronze", "paper", "cyan"] }; }
    dnaCache.set(cacheKey, d);
    return d;
  }
  function seedOf(nameOrKey){ const k = keyOf(nameOrKey) || String(nameOrKey || ""); let h = 0; for (const c of k) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 97; }
  function palette(d, cw){ const c = (d && d.colors) || ["bronze", "paper", "cyan"]; return paletteCW(cw || colorway, c[0], c[1], c[2]); }
  function recipeLine(d){ d = dna(d); return DM_CONTENT.recipeSlots.map(s => s + ":" + (d[s] ?? "none")).join(" | ") + " | " + (d.colors || []).join("+"); }

  // ---------- drawing ----------
  // Draws one character with its feet at (x, y). scale 3 is room size; 4 to 6 reads as a portrait.
  function draw(ctx, x, y, scale, who, t, opts = {}){
    const d = dna(who);
    ctx.imageSmoothingEnabled = false;
    DM_LIVE.drawCharacter(ctx, Math.round(x), Math.round(y), scale, d, palette(d, opts.cw), reduced ? 1000 : t, opts.seed ?? seedOf(who));
  }
  function stageFill(ctx, W, H, cw){ stage(ctx, W, H, COLORWAYS[cw || colorway]); }
  // The room library in use. DM.useRooms(lib) swaps in another one with the same API (defs, order, stations, world, draw, pixelText).
  let R = DM_ROOMS;
  function pixelText(ctx, text, x, y, color, size = 12, align = "left"){ R.pixelText(ctx, text, x, y, color, size, align); }

  // ---------- one animation loop for the whole page ----------
  function mount(canvas, fn, opts = {}){
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const job = { canvas, ctx, fn, visible: true, dirty: true, always: !!opts.always, last: 0 };
    if (!job.always && "IntersectionObserver" in window) {
      job.visible = false;
      job.io = new IntersectionObserver(es => { for (const e of es) { job.visible = e.isIntersecting; if (job.visible) job.dirty = true; } }, { rootMargin: "160px" });
      job.io.observe(canvas);
    }
    jobs.add(job);
    return {
      ctx, canvas,
      redraw(){ job.dirty = true; },
      destroy(){ jobs.delete(job); if (job.io) job.io.disconnect(); }
    };
  }
  let lastT = performance.now();
  function tick(t){
    const dt = Math.min(64, t - lastT); lastT = t;
    const hold = paused || window.DM_PAUSED || document.hidden;
    if (!hold) {
      for (const job of jobs) {
        if (!job.visible) continue;
        if (reduced && !job.dirty) continue;
        job.dirty = false;
        job.ctx.imageSmoothingEnabled = false;
        try { job.fn(job.ctx, t, dt, job.canvas); } catch (e) { console.error(e); jobs.delete(job); }
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  function redrawAll(){ for (const job of jobs) job.dirty = true; }

  // A single character on its own canvas. Pass stage:false for a transparent background,
  // or stage:"#hex" for a flat color. Returns a handle with set(newWho).
  function portrait(canvas, who, opts = {}){
    let current = who;
    const h = mount(canvas, (ctx, t) => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      if (opts.stage === undefined || opts.stage === true) stageFill(ctx, W, H, opts.cw);
      else if (typeof opts.stage === "string") { ctx.fillStyle = opts.stage; ctx.fillRect(0, 0, W, H); }
      else if (typeof opts.stage === "function") opts.stage(ctx, W, H, t);
      const scale = opts.scale || W / 62;
      const footY = opts.footY ?? (H - Math.max(10, H * 0.12));
      draw(ctx, W / 2 + (opts.dx || 0), footY, scale, current, t, { cw: opts.cw });
      if (opts.after) opts.after(ctx, W, H, t);
    }, opts);
    h.set = next => { current = next; h.redraw(); };
    Object.defineProperty(h, "who", { get: () => current, enumerable: true });
    return h;
  }

  // ---------- rooms with a walking cast ----------
  const roomList = () => R.order.map(k => {
    const r = R.defs[k];
    return { key: k, label: r.label, icon: r.icon, accent: r.accent, description: r.description, legend: r.legend, stations: R.stations[k], zones: r.zones };
  });
  let ROOM_LIST = roomList();
  function useRooms(lib){ R = lib; ROOM_LIST = roomList(); return ROOM_LIST; }
  const ZONE_WEIGHTS = [["work", .36], ["think", .2], ["idle", .14], ["complete", .1], ["attention", .1], ["queued", .1]];
  function pickZone(rand){ let r = rand(), acc = 0; for (const [z, w] of ZONE_WEIGHTS) { acc += w; if (r <= acc) return z; } return "work"; }
  function rng(seed){ let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return (s % 100000) / 100000; }; }

  // canvas: any size, drawn at the room's 960 x 540 world and scaled to fit (letterboxed by cover/contain).
  // opts.cast: array of keys or names. opts.zones: { key: "work" } pins someone to a station type.
  // opts.wander (default true) lets unpinned actors stroll between stations.
  function room(canvas, roomKey, opts = {}){
    let key = roomKey;
    const rand = rng(opts.seed || 7);
    const W0 = R.world.width, H0 = R.world.height;
    let actors = [];
    const pins = Object.assign({}, opts.zones || {});
    const taken = new Map();
    function spotFor(actor, zone){
      const spots = R.defs[key].zones[zone] || R.defs[key].zones.idle;
      for (let i = 0; i < spots.length; i++) {
        const id = zone + ":" + i;
        const holder = taken.get(id);
        if (!holder || holder === actor) { if (actor.spot) taken.delete(actor.spot); taken.set(id, actor); actor.spot = id; return spots[i]; }
      }
      const s = spots[Math.floor(rand() * spots.length)];
      return [s[0] + Math.round((rand() - .5) * 40), s[1] + Math.round((rand() - .5) * 16)];
    }
    function find(who){ return actors.find(x => x.id === who) || actors.find(x => x.key && x.key === (keyOf(who) || who)) || null; }
    function send(actor, zone){ actor.zone = zone; const [x, y] = spotFor(actor, zone); actor.tx = x; actor.ty = y; actor.wait = 1800 + rand() * 4200; }
    // A cast item is a name/key, or { id, who, seed, lead } when several agents share one character.
    // Calling it again with the same ids keeps those actors where they stand (safe to call on every poll).
    function setCast(list){
      taken.clear();
      const before = new Map(actors.map(a => [a.id, a]));
      actors = (list || []).map((item, i) => {
        const o = item && typeof item === "object" ? item : { who: item };
        const who = o.who;
        const id = o.id || keyOf(who) || who;
        const old = before.get(id);
        if (old) { Object.assign(old, { who, seed: o.seed, lead: o.lead, key: keyOf(who), spot: null }); send(old, pins[id] || old.zone); return old; }
        const a = { who, id, seed: o.seed, lead: o.lead, key: keyOf(who), x: 0, y: 0, tx: 0, ty: 0, wait: 0, zone: "idle", spot: null, bob: rand() * 6 };
        send(a, pins[a.id] || (opts.wander === false ? "work" : pickZone(rand)));
        a.x = a.tx; a.y = a.ty;
        if (opts.enter) { a.x = opts.enter[0] + i * 18; a.y = opts.enter[1]; }
        return a;
      });
    }
    setCast(opts.cast || []);
    const fit = opts.fit || "contain";
    const h = mount(canvas, (ctx, t, dt) => {
      const W = canvas.width, H = canvas.height;
      const s = fit === "cover" ? Math.max(W / W0, H / H0) : Math.min(W / W0, H / H0);
      const ox = (W - W0 * s) / 2, oy = (H - H0 * s) / 2;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = COLORWAYS[opts.cw || colorway].ink; ctx.fillRect(0, 0, W, H);
      ctx.setTransform(s, 0, 0, s, ox, oy);
      R.draw(ctx, key, opts.cw || colorway, reduced, t);
      const k = 1 - Math.pow(1 - 0.065, (dt || 16.7) / 16.7);
      for (const a of actors) {
        if (reduced) { a.x = a.tx; a.y = a.ty; }
        else { a.x += (a.tx - a.x) * k; a.y += (a.ty - a.y) * k; }
        const moving = Math.abs(a.tx - a.x) + Math.abs(a.ty - a.y) > 2;
        if (!moving && !reduced && opts.wander !== false && !pins[a.id]) {
          a.wait -= dt || 16.7;
          if (a.wait <= 0) send(a, pickZone(rand));
        }
        a.moving = moving;
      }
      const order = actors.slice().sort((p, q) => p.y - q.y);
      for (const a of order) {
        const lead = a.lead ?? a.key === "sol";
        const bob = reduced ? 0 : Math.round(Math.sin(t / 170 + a.bob) * 1.5);
        const step = a.moving && !reduced ? Math.round(Math.abs(Math.sin(t / 80)) * -2) : 0;
        a.scale = lead ? 3.45 : 3;
        draw(ctx, a.x, a.y + bob + step, a.scale, a.who, t, a.seed != null ? { seed: a.seed } : {});
        if (opts.onActor) opts.onActor(ctx, a, t);
      }
      if (opts.after) opts.after(ctx, t, { scale: s, ox, oy });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }, opts);
    Object.defineProperties(h, {
      actors: { get: () => actors, enumerable: true },
      roomKey: { get: () => key, enumerable: true }
    });
    return Object.assign(h, {
      setRoom(next){ key = next; setCast(actors.map(a => ({ id: a.id, who: a.who, seed: a.seed, lead: a.lead }))); h.redraw(); },
      setCast(list){ setCast(list); h.redraw(); },
      // Move someone to a station type: work, think, attention, complete, idle, queued.
      // who is a cast id, or a name/key (first match).
      act(who, zone){ const a = find(who); const id = a ? a.id : (keyOf(who) || who); pins[id] = zone; if (a && a.zone !== zone) send(a, zone); h.redraw(); },
      release(who){ const a = find(who); delete pins[a ? a.id : (keyOf(who) || who)]; },
      // Canvas pixel to the actor under it (or null). Use for click-to-inspect.
      hit(px, py){
        const W = canvas.width, H = canvas.height; const s = fit === "cover" ? Math.max(W / W0, H / H0) : Math.min(W / W0, H / H0);
        const x = (px - (W - W0 * s) / 2) / s, y = (py - (H - H0 * s) / 2) / s;
        const order = actors.slice().sort((p, q) => q.y - p.y);
        return order.find(a => { const k = a.scale || 3; return x >= a.x - 13 * k && x <= a.x + 13 * k && y >= a.y - 50 * k && y <= a.y + 4 * k; }) || null;
      },
      // World (960 x 540) to canvas pixels, for placing HTML labels over the room.
      toCanvas(x, y){ const W = canvas.width, H = canvas.height; const s = fit === "cover" ? Math.max(W / W0, H / H0) : Math.min(W / W0, H / H0); return [x * s + (W - W0 * s) / 2, y * s + (H - H0 * s) / 2]; }
    });
  }

  // ---------- the cloud logo (homage to the Lincoln Mall sign) ----------
  // Returns an SVG string. Uses the "Luckiest Guy" font when the study loads it, falls back to a heavy sans.
  function cloudLogo(o = {}){
    const cloud = o.cloud ?? "#FFF200", line = o.line ?? "#0b0b14", top = o.top ?? "DREAM", bottom = o.bottom ?? "MACHINE";
    const red = o.red ?? "#FF1E1E", lime = o.lime ?? "#DDFF00", blue = o.blue ?? "#2C3BFF", dot = o.dot ?? "#1E6BFF", shadow = o.shadow ?? "#7A0016";
    const font = o.font ?? "'Luckiest Guy','Lilita One','Arial Black',Impact,sans-serif";
    const bumps = [[150,118,74],[245,82,88],[350,96,80],[438,140,66],[452,236,64],[372,282,74],[262,296,80],[150,276,74],[82,206,64],[96,140,56]];
    const showCloud = o.cloud !== "none";
    const cloudSvg = showCloud ? `<g>${bumps.map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r + 5}" fill="${line}"/>`).join("")}${bumps.map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${cloud}"/>`).join("")}<rect x="96" y="120" width="330" height="170" fill="${cloud}"/></g>` : "";
    // advance per letter as a share of font size (Luckiest Guy is narrow and the sign's letters overlap)
    const ADV = { I: .33, M: .78, W: .8, A: .64, D: .58, R: .62, E: .56, C: .6, H: .64, N: .64, " ": .3 };
    const adv = (ch, size) => size * (ADV[ch] ?? .62);
    const word = (text, y, size, fill, shade, startX, tilt) => {
      let x = startX;
      return [...text].map((ch, i) => {
        const rot = ((i % 2 ? 1 : -1) * tilt) + (i === 0 ? -5 : 0);
        const dy = (i % 3 === 1 ? -7 : i % 3 === 2 ? 4 : 0);
        const cx = x; x += adv(ch, size);
        return `<g transform="translate(${cx.toFixed(1)} ${y + dy}) rotate(${rot})">` +
          `<text x="7" y="8" font-size="${size}" fill="${shadow}" stroke="${shadow}" stroke-width="12" stroke-linejoin="round">${ch}</text>` +
          `<text x="3" y="4" font-size="${size}" fill="${shade}" stroke="${shade}" stroke-width="11" stroke-linejoin="round">${ch}</text>` +
          `<text x="0" y="0" font-size="${size}" fill="${fill}" stroke="${blue}" stroke-width="8" stroke-linejoin="round" paint-order="stroke">${ch}</text>` +
          `<circle cx="${(size * 0.27).toFixed(1)}" cy="${(-size * 0.44).toFixed(1)}" r="${(size * 0.07).toFixed(1)}" fill="${dot}" stroke="${line}" stroke-width="2.5"/></g>`;
      }).join("");
    };
    const topSize = o.topSize || 112, botSize = o.botSize || 98;
    const widthOf = (t, size) => [...t].reduce((a, ch) => a + adv(ch, size), 0);
    const topW = widthOf(top, topSize), botW = widthOf(bottom, botSize);
    const tagline = o.tagline ? `<text x="18" y="30" font-size="30" fill="${o.taglineColor || line}" stroke="${o.taglineStroke || cloud}" stroke-width="7" stroke-linejoin="round" paint-order="stroke" font-family="${font}" transform="rotate(-4 18 30)">${o.tagline}</text>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 380" role="img" aria-label="${o.label || "The Dream Machine"}" class="${o.className || "dm-logo"}" style="font-family:${font};overflow:visible">` +
      `${cloudSvg}` +
      `<g font-family="${font}" text-anchor="start">${word(top, 196, topSize, red, lime, 272 - topW / 2, 5)}${word(bottom, 296, botSize, lime, red, 268 - botW / 2, 6)}</g>${tagline}</svg>`;
  }

  // ---------- colorway + motion controls (the gallery viewer calls these) ----------
  function setColorway(cw){ if (!COLORWAYS[cw]) return; colorway = cw; dnaCache.clear(); redrawAll(); for (const fn of cwListeners) fn(cw); }
  function onColorway(fn){ cwListeners.add(fn); return () => cwListeners.delete(fn); }
  function setReduced(b){ reduced = !!b; document.documentElement.classList.toggle("dm-reduced", reduced); redrawAll(); for (const fn of reducedListeners) fn(reduced); }
  const reducedListeners = new Set();
  function onReduced(fn){ reducedListeners.add(fn); return () => reducedListeners.delete(fn); }
  if (mq.addEventListener) mq.addEventListener("change", e => setReduced(e.matches));
  document.documentElement.classList.toggle("dm-reduced", reduced);
  window.addEventListener("message", e => {
    const m = e.data || {};
    if (m.dmPause !== undefined) paused = !!m.dmPause;
    if (m.dmColorway) setColorway(m.dmColorway);
    if (m.dmReduced !== undefined) setReduced(m.dmReduced);
  });

  return {
    content: DM_CONTENT, links: DM_CONTENT.links,
    groups, keys, keyOf, meta, dna, seedOf, palette, recipeLine, isKnown: n => !!keyOf(n),
    draw, stage: stageFill, pixelText, mount, portrait, room, get rooms(){ return ROOM_LIST; }, useRooms, get roomLib(){ return R; }, cloudLogo,
    colorways: COLORWAY_NAMES, COLORWAYS,
    get colorway(){ return colorway; }, setColorway, onColorway,
    get reduced(){ return reduced; }, setReduced, onReduced,
    pause(b){ paused = !!b; }, redrawAll
  };
})();
