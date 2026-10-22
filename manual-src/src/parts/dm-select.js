/* DMSelect: Character Select with the Persona Forge built in (round 2, part F2). Needs the kit (DM).
 *
 *   const h = DMSelect.mount(el, { mode: "manual" | "app", theme: "paper" | "arcade", live: [names], onPick(name, info) })
 *   h.setLive(names)   app mode: mark who is on the floor right now (names or keys; unknown names get a generated tile)
 *   h.focus(name)      jump to a character (a name outside the roster goes into the name field and gets built)
 *   h.destroy()        removes the markup, stops every canvas and observer
 *
 * One screen: browse every character, or type any name. A known name moves the cursor to that character; any other name
 * is compiled by the real persona compiler into a new challenger. Lock in up to four picks; they walk into a live room.
 * Every character is drawn by DM.draw / DM.room only, whole figure, head to feet.
 */
(function(){
  "use strict";
  if (typeof DM === "undefined") { console.error("DMSelect needs the kit (DM)"); return; }

  // Measured once per character in round 1 (41 animation frames at scale 2, outer box), in figure units from the feet:
  // [top, bottom, left, right]. Names outside the table are measured live.
  const ENV = {"sol":[31.5,5,22,26],"flash":[26.5,7,21,10.5],"sonnet":[38,5,17.5,17],"opus":[29.5,6.5,16.5,15.5],"astra":[31,5,18,17.5],"terra":[30,4.5,16.5,17],"luna":[31,5,9,12],"deepseek":[31,6.5,16,19],"unmapped":[29.5,5,16.5,16.5],"hopper":[29,4,17.5,17],"local-tools":[29.5,6.5,18.5,18],"euclid":[22.5,5,9,14.5],"archimedes":[31,6,16,19],"ptolemy":[29.5,5,13.5,14.5],"hypatia":[30.5,5,17,18],"avicenna":[38,5,17.5,17],"averroes":[23.5,6,11.5,14.5],"aquinas":[31,6,11.5,14.5],"copernicus":[30.5,5,17,18],"kepler":[19.5,6,13,12.5],"galileo":[30.5,6,17,18],"bacon":[29,6,20,15.5],"descartes":[35.5,6,20,19],"pascal":[18.5,6,12,12],"fermat":[31.5,6,18,17],"huygens":[28.5,6.5,13,13.5],"newton":[29.5,6,16.5,17],"halley":[31,6,16,19],"euler":[30,6,18,17.5],"lagrange":[23.5,5,9,14.5],"laplace":[32,5,16.5,17],"volta":[29.5,6,18.5,18],"gauss":[30.5,6,17,18],"ampere":[29.5,6.5,18.5,18],"faraday":[19,6,13.5,13],"darwin":[29.5,6,16.5,17],"lovelace":[30.5,5,17,18],"boole":[23.5,6,11.5,14.5],"pasteur":[31,6,16,19],"maxwell":[29.5,6,18.5,18],"mendel":[29.5,6,16.5,17],"curie":[29.5,5,20,15.5],"planck":[28,6,17.5,17],"tesla":[20,6,13.5,13],"poincare":[23.5,6,11.5,19.5],"noether":[31,7,18,17.5],"hilbert":[29,6,11.5,14.5],"einstein":[30.5,6,17,18],"raman":[29.5,6,17,17.5],"bohr":[29.5,6,20,11],"turing":[29.5,6.5,17,17.5],"hubble":[30.5,6.5,17,18],"feynman":[23.5,6,11.5,17],"franklin":[31,6,18,17.5],"mcclintock":[29.5,6,16.5,17],"meitner":[23.5,6,16.5,15.5],"herschel":[30.5,6,17,18],"linnaeus":[29.5,6,16.5,17],"wegener":[30,6,18,17.5],"chandrasekhar":[23.5,6,11.5,14.5],"sagan":[30.5,6,17,18],"goodall":[29.5,6,16.5,17],"carson":[29.5,6,17,17.5],"carver":[29,6,11.5,15.5],"socrates":[31.5,6,18,17],"plato":[26.5,5,16.5,15.5],"aristotle":[23.5,6,11.5,14.5],"epicurus":[29.5,6,16.5,19.5],"cicero":[23.5,6,11.5,14],"confucius":[23.5,5,9,14.5],"mencius":[25,5,9,16.5],"zeno":[29.5,5,17,17.5],"locke":[23.5,6,11.5,14.5],"hume":[23.5,6,11.5,17],"kant":[30.5,6,17,18],"hegel":[38,6,17.5,17],"kierkegaard":[26.5,6,16.5,15.5],"mill":[23.5,6,11.5,14.5],"nietzsche":[25,6,16.5,16.5],"peirce":[23.5,6,11.5,11],"james":[35.5,6,20,19],"dewey":[23.5,6,11.5,15.5],"russell":[30.5,6,17,19.5],"popper":[23.5,6,11.5,15.5],"sartre":[23.5,6,11.5,11],"beauvoir":[28.5,6,11.5,14.5],"arendt":[23.5,6,11.5,14.5],"rawls":[23.5,6,11.5,14.5],"singer":[31,6,16,19],"anscombe":[23.5,6,11.5,14.5],"parfit":[38,6,17.5,17],"kuhn":[23.5,6,11.5,14.5],"boyle":[31,6,16,19],"hooke":[23.5,6,11.5,13.5],"harvey":[23.5,6,11.5,11],"dalton":[29.5,6,17,17.5],"ohm":[35.5,6,18.5,18],"helmholtz":[23.5,6,11.5,15.5],"gibbs":[28,6,17.5,17],"lorentz":[15,6,15,8],"schrodinger":[28.5,6,16.5,15.5],"heisenberg":[29,6,20,15.5],"pauli":[29.5,6,18.5,18],"dirac":[23.5,6,11.5,11],"bernoulli":[28.5,5,16.5,17.5],"godel":[23.5,6,11.5,14.5],"nash":[23.5,6,11.5,17],"banach":[23.5,6,11.5,15.5],"ramanujan":[38,6,17.5,17],"erdos":[23.5,6,11.5,14.5],"jason":[29.5,6.5,17,17.5],"kaneda":[35.5,6.5,20,19],"baki":[30,6.5,16.5,15.5],"spike":[30,6.5,16.5,15.5],"vegeta":[30,6.5,16.5,16.5],"frieren":[30.5,5,17,18],"alphonse":[38,6.5,17.5,17],"heero":[32,6.5,17,18],"kuroko":[26.5,6.5,16.5,16.5],"saitama":[22.5,6.5,11.5,11],"ainz":[29.5,5,16.5,16.5],"migi":[35.5,4,20,19],"san":[29.5,6.5,16.5,17],"yusuke":[38,6.5,17.5,17],"rudeus":[27,5,20,16.5]};
  const envC = document.createElement("canvas"); envC.width = 200; envC.height = 200;
  const envX = envC.getContext("2d", { willReadFrequently: true });
  const envCache = new Map();
  function envelope(who){
    const key = DM.keyOf(who);
    if (key && ENV[key]) { const [top, bottom, left, right] = ENV[key]; return { top, bottom, left, right }; }
    const id = key || "gen:" + String(who).toLowerCase();
    if (envCache.has(id)) return envCache.get(id);
    envX.clearRect(0, 0, 200, 200);
    for (let t = 0; t <= 3000; t += 250) DM.draw(envX, 100, 150, 2, who, t);
    const a = new Uint32Array(envX.getImageData(0, 0, 200, 200).data.buffer);
    let t = 1e9, b = -1, l = 1e9, r = -1;
    for (let y = 0; y < 200; y++) for (let x = 0; x < 200; x++) if ((a[y * 200 + x] >>> 24) > 16) { if (y < t) t = y; if (y > b) b = y; if (x < l) l = x; if (x > r) r = x; }
    const e = b < 0 ? { top: 34, bottom: 4, left: 20, right: 20 } : { top: (150 - t + 1) / 2 + 1, bottom: (b - 150 + 1) / 2 + .5, left: (100 - l + 1) / 2 + 1, right: (r - 100 + 1) / 2 + 1 };
    if (envCache.size > 200) envCache.clear();
    envCache.set(id, e); return e;
  }
  // Largest scale that keeps the whole figure inside W x H (snapped to step for crisp pixels), feet near the bottom.
  function fit(who, W, H, cap, step, pad = 3){
    const e = envelope(who), m = 1.04;
    let s = Math.min(cap, (H - pad * 2) / ((e.top + e.bottom) * m), (W - pad * 2) / ((e.left + e.right) * m));
    if (step) s = Math.max(step, Math.floor(s / step + 1e-6) * step);
    return { s, x: Math.round(W / 2 + (e.left - e.right) / 2 * s), foot: Math.round(H - pad - e.bottom * s * m) };
  }

  const GROUP_C = { floor: "a4", crew: "a3", house: "a4", "batch-1": "a1", "batch-2": "violet", "batch-3": "a2", "batch-4": "a4", "batch-5": "a3", "batch-6": "a1", "batch-7": "rust", anime: "violet", forge: "fg" };
  const SHORT = { floor: "On the floor", crew: "Crew", house: "House", "batch-1": "B1 Ancients", "batch-2": "B2 Natural Phil.", "batch-3": "B3 Moderns", "batch-4": "B4 Naturalists", "batch-5": "B5 Philosophy", "batch-6": "B6 Physicists", "batch-7": "B7 Finale", anime: "Anime", forge: "New challenger" };
  const CW_SHORT = { voidArcade: "VOID", toxicCandy: "CANDY", spectralOxide: "OXIDE" };
  const SLOT_C = ["a1", "a2", "a3", "a4"];
  const JOBS = [["design_pass", "doing a design pass"], ["research_sources", "doing internet research"], ["red_team", "red-teaming the plan"], ["build_ui", "building the screens"], ["test_suite", "running the tests"]];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pretty = v => String(v).replace(/([a-z])([A-Z0-9])/g, "$1 $2").toLowerCase();
  const cleanName = s => String(s || "").replace(/\s+/g, " ").trim().slice(0, 28);
  const slug = s => String(s || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/_+/g, "_").slice(0, 32) || "player";
  const PUBLIC_COUNT = DM.keys().length;
  let uid = 0;

  function mount(el, o = {}){
    const opt = Object.assign({ mode: "manual", live: [], onPick: null }, o);
    opt.theme = o.theme || (opt.mode === "app" ? "arcade" : "paper");
    const id = "dms" + (++uid);
    const root = document.createElement("div");
    root.className = `dms dms--${opt.theme}`;
    root.dataset.mode = opt.mode;
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", "Character select. Browse every character or type any name.");
    root.innerHTML = `
      <div class="dms-head">
        <h2 class="dms-title"><span>${opt.theme === "paper" ? "Character Select" : "SELECT YOUR AGENT"}</span></h2>
        <div class="dms-count">${PUBLIC_COUNT} characters · any name works</div>
        <div class="dms-cw" role="group" aria-label="Colorway"><span>COLOR</span></div>
      </div>
      <div class="dms-arena">
        <div class="dms-entry">
          <label><span class="dms-k">Enter a name <small>known names jump to their tile, new names build a new challenger</small></span>
            <span class="dms-field"><input type="text" maxlength="28" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="TYPE ANY NAME"><button type="button" class="dms-x" aria-label="Clear the name">&times;</button></span>
          </label>
          <div class="dms-sugg" aria-label="Characters that start with what you typed"></div>
        </div>
        <section class="dms-pane dms-p1" aria-labelledby="${id}-name">
          <div class="dms-banner" hidden></div>
          <div class="dms-ptag"><span class="dms-tag">1P</span><span class="dms-group"></span></div>
          <div class="dms-port"><canvas aria-hidden="true"></canvas><span class="dms-live" hidden>ON THE FLOOR</span></div>
          <h3 class="dms-name" id="${id}-name">SOL</h3>
          <div class="dms-era"></div>
          <p class="dms-note"></p>
          <dl class="dms-load" aria-label="Loadout: the nine parts this character is built from"></dl>
          <div class="dms-sw" aria-label="Color channels"></div>
          <p class="dms-recipe" aria-label="Recipe line"></p>
          <div class="dms-acts">
            <button type="button" class="dms-btn dms-lock">LOCK IN <kbd>ENTER</kbd></button>
            <button type="button" class="dms-btn ghost dms-rand">RANDOM</button>
          </div>
          <div class="dms-use">
            <p class="dms-k">Use this character</p>
            <p class="dms-use-line"></p>
            <button type="button" class="dms-btn ghost dms-copy">COPY THE NAME</button><span class="dms-copied" role="status"></span>
          </div>
        </section>
        <div class="dms-gridbox">
          <div class="dms-legend" role="group" aria-label="Jump to a group"></div>
          <div class="dms-grid-scroll"><div class="dms-grid" role="group" aria-label="Every character. Arrow keys move, Enter locks in, typing starts a name."></div></div>
          <p class="dms-ghint">Arrows move · Enter locks in · start typing to build anyone · Esc clears</p>
        </div>
        <section class="dms-pane dms-team" aria-labelledby="${id}-team">
          <div class="dms-ptag"><span class="dms-tag">TEAM</span><span id="${id}-team">Your picks, up to four</span></div>
          <ol class="dms-slots"></ol>
          <div class="dms-room"><canvas aria-label="A live room. Your picks walk in and get to work."></canvas><div class="dms-room-tag"></div><div class="dms-room-empty">Lock in a pick and they walk in here</div></div>
          <div class="dms-team-acts"><button type="button" class="dms-btn ghost dms-nextroom">NEXT ROOM</button><button type="button" class="dms-btn ghost dms-clear">CLEAR TEAM</button></div>
        </section>
      </div>
      <div class="dms-sr" aria-live="polite"></div>`;
    el.append(root);
    const q = s => root.querySelector(s);
    const input = q("input"), sugg = q(".dms-sugg"), gridEl = q(".dms-grid"), scroller = q(".dms-grid-scroll"), sr = q(".dms-sr");
    const disposers = [];
    const listen = (target, type, fn, o2) => { target.addEventListener(type, fn, o2); disposers.push(() => target.removeEventListener(type, fn, o2)); };
    let dead = false;

    // ---------- colorway ----------
    function applyColorway(){
      const p = DM.COLORWAYS[DM.colorway];
      if (opt.theme === "arcade") for (const [v, k] of [["--bg", "sky"], ["--bg2", "sky2"], ["--fg", "paper"], ["--a1", "cyan"], ["--a2", "pink"], ["--a3", "gold"], ["--a4", "mint"], ["--plate", "ink"]]) root.style.setProperty(v, p[k]);
      root.style.setProperty("--violet", p.violet); root.style.setProperty("--rust", p.rust);
      root.querySelectorAll(".dms-cw button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.cw === DM.colorway)));
    }
    const cwRow = q(".dms-cw");
    for (const cw of DM.colorways) {
      const b = document.createElement("button"); b.type = "button"; b.dataset.cw = cw; b.textContent = CW_SHORT[cw] || cw;
      b.setAttribute("aria-label", "Colorway " + (CW_SHORT[cw] || cw).toLowerCase());
      const c = DM.COLORWAYS[cw]; b.style.setProperty("--sw", `linear-gradient(90deg,${c.cyan},${c.pink},${c.gold})`);
      listen(b, "click", () => DM.setColorway(cw));
      cwRow.append(b);
    }
    // Plain CSS colors for the group bands (theme-aware through the variables above).
    const colorVar = k => k === "fg" ? "var(--fg)" : k === "violet" ? "var(--violet,#B300FF)" : k === "rust" ? "var(--rust,#FF785A)" : `var(--${k})`;

    // ---------- tiles ----------
    let tiles = [];          // { who, key, band, btn, cv, painted }
    let cur = 0, typed = "", shown = null, team = [null, null, null, null];
    let liveKeys = new Set(), liveGen = [];
    const anims = new Map();
    let tileIO = null, idleT = 0;
    function setLive(names){
      liveKeys = new Set(); liveGen = [];
      for (const n of names || []) {
        const k = DM.keyOf(n);
        if (k) liveKeys.add(k);
        else { const c = cleanName(n); if (c && !liveGen.some(x => x.toLowerCase() === c.toLowerCase())) liveGen.push(c); }
      }
    }
    function bands(){
      const out = [];
      if (opt.mode === "app" && (liveKeys.size || liveGen.length)) out.push({ key: "floor", label: "On the floor now", items: [...liveKeys].map(k => ({ who: k, key: k })).concat(liveGen.map(n => ({ who: n, key: null }))) });
      for (const g of DM.groups) if (g.key !== "dev") out.push({ key: g.key, label: g.label, items: g.keys.map(k => ({ who: k, key: k })) });
      out.push({ key: "forge", label: "New challenger", items: [{ forge: true }] });
      return out;
    }
    function paintTile(t, time){
      const ctx = t.cv.getContext("2d"); ctx.imageSmoothingEnabled = false;
      const W = t.cv.width, H = t.cv.height, p = DM.COLORWAYS[DM.colorway];
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, p.sky2); g.addColorStop(1, p.ink);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = p.grid || p.wall; for (let x = 0; x < W; x += 12) ctx.fillRect(x, 74, 1, 22); ctx.fillRect(0, 74, W, 1);
      if (!t.forge) { const f = t.fit || (t.fit = fit(t.who, W, H, 2.6, 0, 2)); DM.draw(ctx, f.x, f.foot, f.s, t.who, time); }
    }
    function tileLabel(t){
      if (t.forge) return "New challenger: type any name";
      const m = DM.meta(t.who);
      let s = m.name + ", " + (t.key ? m.groupLabel : "generated");
      if (isLive(t.who)) s += ", on the floor now";
      const slot = team.findIndex(w => w && same(w, t.who));
      if (slot >= 0) s += ", picked as " + (slot + 1) + "P";
      return s;
    }
    function same(a, b){ const ka = DM.keyOf(a), kb = DM.keyOf(b); return ka || kb ? ka === kb : cleanName(a).toLowerCase() === cleanName(b).toLowerCase(); }
    function isLive(who){ if (opt.mode !== "app") return false; const k = DM.keyOf(who); return k ? liveKeys.has(k) : liveGen.some(n => n.toLowerCase() === cleanName(who).toLowerCase()); }
    function buildGrid(){
      for (const h of anims.values()) h.destroy(); anims.clear();
      if (tileIO) tileIO.disconnect();
      const keepWho = tiles[cur] && !tiles[cur].forge ? tiles[cur].who : null;
      gridEl.replaceChildren(); tiles = [];
      const legend = q(".dms-legend"); legend.replaceChildren();
      tileIO = "IntersectionObserver" in window ? new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) { const t = tiles[+e.target.dataset.i]; if (t && !t.painted) { t.painted = true; paintTile(t, 1000); } } }, { root: null, rootMargin: "200px" }) : null;
      for (const b of bands()) {
        const wrap = document.createElement("div"); wrap.className = "dms-band"; wrap.style.setProperty("--c", colorVar(GROUP_C[b.key] || "a3"));
        const lab = document.createElement("div"); lab.className = "dms-band-label"; lab.textContent = b.label; lab.id = `${id}-b-${b.key}`;
        const box = document.createElement("div"); box.className = "dms-tiles"; box.setAttribute("role", "group"); box.setAttribute("aria-labelledby", lab.id);
        for (const it of b.items) {
          const i = tiles.length;
          const btn = document.createElement("button"); btn.type = "button"; btn.className = "dms-tile" + (it.forge ? " dms-forge" : ""); btn.tabIndex = -1; btn.dataset.i = i;
          const cv = document.createElement("canvas"); cv.width = 96; cv.height = 96; cv.setAttribute("aria-hidden", "true"); btn.append(cv);
          if (it.forge) { const s = document.createElement("span"); s.textContent = "???"; s.setAttribute("aria-hidden", "true"); btn.append(s); }
          const t = Object.assign({ btn, cv, band: b.key, painted: false }, it);
          tiles.push(t); box.append(btn);
          if (tileIO) tileIO.observe(btn); else { t.painted = true; paintTile(t, 1000); }
        }
        wrap.append(lab, box); gridEl.append(wrap);
        const chip = document.createElement("button"); chip.type = "button"; chip.innerHTML = `<i style="--c:${colorVar(GROUP_C[b.key] || "a3")}"></i>${esc(SHORT[b.key] || b.label)}`;
        chip.title = b.label;
        chip.addEventListener("click", () => { const i = tiles.findIndex(t => t.band === b.key); if (i >= 0) { if (tiles[i].forge) { input.focus(); return; } clearTyped(); setCursor(i, true); } });
        legend.append(chip);
      }
      // Paint whatever the observer has not reached yet in small idle batches, so no tile is ever left black.
      clearTimeout(idleT);
      const batch = () => { if (dead) return; let n = 0; for (const t of tiles) { if (!t.painted) { t.painted = true; paintTile(t, 1000); if (++n >= 12) break; } } if (n) idleT = setTimeout(batch, 30); };
      idleT = setTimeout(batch, 250);
      let ni = keepWho ? tiles.findIndex(t => !t.forge && t.band !== "floor" && same(t.who, keepWho)) : -1;
      if (ni < 0) ni = keepWho ? tiles.findIndex(t => !t.forge && same(t.who, keepWho)) : -1;
      cur = ni >= 0 ? ni : Math.min(cur, tiles.length - 1);
      decorate();
    }
    function decorate(){
      tiles.forEach((t, i) => {
        t.btn.classList.toggle("is-cur", i === cur && showCur());
        t.btn.tabIndex = i === cur ? 0 : -1;
        let live = t.btn.querySelector(".dms-live");
        if (!t.forge && isLive(t.who)) { if (!live) { live = document.createElement("span"); live.className = "dms-live"; live.textContent = "LIVE"; live.setAttribute("aria-hidden", "true"); t.btn.append(live); } }
        else if (live) live.remove();
        let slotEl = t.btn.querySelector(".dms-slot");
        const slot = t.forge ? -1 : team.findIndex(w => w && same(w, t.who));
        if (slot >= 0) { if (!slotEl) { slotEl = document.createElement("span"); slotEl.className = "dms-slot"; slotEl.setAttribute("aria-hidden", "true"); t.btn.append(slotEl); } slotEl.textContent = (slot + 1) + "P"; slotEl.style.setProperty("--sc", colorVar(SLOT_C[slot])); }
        else if (slotEl) slotEl.remove();
        t.btn.setAttribute("aria-label", tileLabel(t));
      });
      // animate the cursor tile only
      const want = showCur() ? cur : null;
      for (const [i, h] of anims) if (i !== want) { h.destroy(); anims.delete(i); if (tiles[i]) paintTile(tiles[i], 1000); }
      if (want != null && tiles[want] && !tiles[want].forge && !anims.has(want)) { const t = tiles[want]; t.painted = true; anims.set(want, DM.mount(t.cv, (ctx, time) => paintTile(t, time))); }
    }
    function showCur(){ return !typed || DM.isKnown(typed); }
    function scrollTileIntoView(t, allowPage){
      const box = scroller;
      if (box.scrollHeight > box.clientHeight + 2) {
        const r = t.btn.getBoundingClientRect(), br = box.getBoundingClientRect();
        if (r.top < br.top + 4) box.scrollTop -= br.top - r.top + 16;
        else if (r.bottom > br.bottom - 4) box.scrollTop += r.bottom - br.bottom + 16;
      } else if (allowPage) {
        const r = t.btn.getBoundingClientRect();
        if (r.top < 0 || r.bottom > innerHeight) t.btn.scrollIntoView({ block: "nearest" });
      }
    }
    function setCursor(i, focus, quiet){
      if (!tiles.length) return;
      cur = Math.max(0, Math.min(tiles.length - 1, i));
      decorate();
      if (!typed) show(tiles[cur].forge ? null : tiles[cur].who, quiet);
      if (focus) { tiles[cur].btn.focus({ preventScroll: true }); scrollTileIntoView(tiles[cur], true); }
    }
    function move(dx, dy){
      if (dx) return setCursor(cur + dx, true);
      const rects = tiles.map(t => t.btn.getBoundingClientRect());
      const me = rects[cur], cx = me.left + me.width / 2;
      const cand = rects.map((r, i) => ({ r, i })).filter(({ r }) => dy > 0 ? r.top > me.top + me.height / 2 : r.bottom < me.top + me.height / 2);
      if (!cand.length) return;
      const rowTop = dy > 0 ? Math.min(...cand.map(c => c.r.top)) : Math.max(...cand.map(c => c.r.top));
      const row = cand.filter(c => Math.abs(c.r.top - rowTop) < 4);
      row.sort((a, b) => Math.abs(a.r.left + a.r.width / 2 - cx) - Math.abs(b.r.left + b.r.width / 2 - cx));
      setCursor(row[0].i, true);
    }

    // ---------- the 1P panel ----------
    const portCv = q(".dms-port canvas");
    let portFit = null, portWho = "sol";
    const portH = DM.mount(portCv, (ctx, t) => { ctx.clearRect(0, 0, portCv.width, portCv.height); if (portFit) DM.draw(ctx, portFit.x, portFit.foot, portFit.s, portWho, t); });
    function refitPortrait(){
      const r = portCv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = Math.max(120, Math.round((r.width || 300) * dpr)), H = Math.max(100, Math.round((r.height || 250) * dpr));
      if (portCv.width !== W || portCv.height !== H) { portCv.width = W; portCv.height = H; }
      portFit = fit(portWho, W, H, 12 * dpr, 1, Math.round(4 * dpr));
      portH.redraw();
    }
    function fitName(node, max){
      node.style.fontSize = max + "px";
      let s = max, guard = 0;
      while (node.scrollWidth > node.clientWidth + 1 && s > 16 && guard++ < 40) { s -= 2; node.style.fontSize = s + "px"; }
    }
    let announceT = 0;
    function say(text, now){ clearTimeout(announceT); announceT = setTimeout(() => { sr.textContent = text; }, now ? 0 : 450); }
    function show(who, quiet){
      const forgeTile = who == null;
      if (forgeTile) who = typed || "Player One";
      shown = who;
      const known = DM.isKnown(who), m = DM.meta(who), d = DM.dna(who);
      const generated = !known;
      const p1 = q(".dms-p1");
      p1.style.setProperty("--band", colorVar(GROUP_C[known ? m.group : "forge"] || "a3"));
      const banner = q(".dms-banner");
      if (typed && generated) { banner.hidden = false; banner.textContent = "HERE COMES A NEW CHALLENGER!"; banner.className = "dms-banner is-new"; }
      else if (typed && known) { banner.hidden = false; banner.textContent = "ALREADY IN THE BUILDING"; banner.className = "dms-banner is-known"; }
      else banner.hidden = true;
      q(".dms-group").textContent = generated ? "Persona Forge · built from the name" : m.groupLabel;
      const nameEl = q(".dms-name"); nameEl.textContent = (generated ? cleanName(who) : m.name).toUpperCase();
      fitName(nameEl, root.clientWidth < 420 ? 34 : 44);
      q(".dms-era").textContent = generated ? "generated from the name" : m.era;
      q(".dms-note").textContent = m.note;
      q(".dms-port .dms-live").hidden = !isLive(who);
      const load = q(".dms-load"); load.replaceChildren();
      for (const s of DM.content.recipeSlots) {
        const v = d[s] ?? "none", box = document.createElement("div");
        box.innerHTML = `<dt>${esc(s)}</dt><dd class="${v === "none" ? "none" : ""}" title="${esc(pretty(v))}">${esc(pretty(v))}</dd>`;
        load.append(box);
      }
      const sw = q(".dms-sw"); sw.replaceChildren();
      const roles = ["base", "second", "accent"];
      (d.colors || []).forEach((c, k) => { const s = document.createElement("span"); s.textContent = c; s.title = roles[k] + " channel: " + c; s.style.background = DM.COLORWAYS[DM.colorway][c] || c; sw.append(s); });
      q(".dms-recipe").textContent = DM.recipeLine(who);
      const display = generated ? cleanName(who) : m.name;
      const job = JOBS[DM.seedOf(who) % JOBS.length];
      const handle = slug(known ? DM.keyOf(who) : display) + "__" + job[0];
      useHandle = handle;
      q(".dms-use-line").innerHTML = `Name a subagent <code>${esc(handle)}</code> and ${esc(display)} shows up on the floor ${esc(job[1])}.`;
      q(".dms-copied").textContent = "";
      portWho = who; refitPortrait();
      if (quiet) return;
      if (typed) say(generated ? `New challenger: ${display}. Generated from the name.` : `${display} is already in the building. Cursor moved to their tile.`);
      else say(`${display}, ${generated ? "generated" : m.groupLabel}.`);
    }
    let useHandle = "";

    // ---------- name entry ----------
    let typeT = 0;
    function onTyped(){
      typed = cleanName(input.value);
      sugg.replaceChildren();
      if (!typed) { decorate(); show(tiles[cur] && !tiles[cur].forge ? tiles[cur].who : "sol"); return; }
      if (DM.isKnown(typed)) {
        const k = DM.keyOf(typed);
        const i = tiles.findIndex(t => t.key === k && t.band !== "floor");
        if (i >= 0) { cur = i; scrollTileIntoView(tiles[i], false); }
      } else {
        const low = typed.toLowerCase();
        const hits = DM.keys().map(k => DM.meta(k)).filter(m => m.name.toLowerCase().startsWith(low)).slice(0, 4);
        for (const m of hits) {
          const b = document.createElement("button"); b.type = "button"; b.textContent = m.name;
          b.addEventListener("click", () => { input.value = m.name; onTyped(); input.focus(); });
          sugg.append(b);
        }
      }
      decorate();
      show(typed);
    }
    function clearTyped(){ if (!typed && !input.value) return; input.value = ""; typed = ""; sugg.replaceChildren(); decorate(); }
    listen(input, "input", () => { clearTimeout(typeT); typeT = setTimeout(onTyped, 80); });
    listen(input, "keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); clearTimeout(typeT); onTyped(); lock(); }
      else if (e.key === "Escape") { e.preventDefault(); if (input.value) { clearTyped(); show(tiles[cur] && !tiles[cur].forge ? tiles[cur].who : "sol"); } else input.blur(); }
      else if (e.key === "ArrowDown" && !e.altKey) { e.preventDefault(); if (tiles[cur]) { tiles[cur].btn.focus({ preventScroll: true }); scrollTileIntoView(tiles[cur], true); } }
    });
    listen(q(".dms-x"), "click", () => { clearTyped(); show(tiles[cur] && !tiles[cur].forge ? tiles[cur].who : "sol"); input.focus(); });

    // ---------- grid input ----------
    // A tap picks a tile, a second tap locks it in. A mouse hover already moves the cursor, so one click locks.
    let preCur = null;
    listen(gridEl, "pointerdown", () => { preCur = typed ? -1 : cur; });
    listen(gridEl, "click", e => {
      const btn = e.target.closest(".dms-tile"); if (!btn) return;
      const i = +btn.dataset.i, t = tiles[i];
      const keyboard = e.detail === 0;
      const was = !keyboard && preCur != null ? preCur : (typed ? -1 : cur); preCur = null;
      if (t.forge) { cur = i; decorate(); input.focus(); return; }
      if (keyboard) { if (typed) clearTyped(); if (i !== cur) setCursor(i, false, true); lock(); return; }
      if (typed) { clearTyped(); setCursor(i, true); return; }
      if (i !== was) { setCursor(i, true); return; }
      lock();
    });
    // Hover moves the cursor only after the mouse really moves, so keyboard use and scrolling never get overridden.
    let kbMode = false;
    listen(root, "keydown", () => { kbMode = true; });
    listen(gridEl, "pointermove", e => { if (e.pointerType === "mouse" && (e.movementX || e.movementY)) kbMode = false; });
    listen(gridEl, "pointerover", e => {
      if (e.pointerType !== "mouse" || typed || kbMode) return;
      const btn = e.target.closest(".dms-tile"); if (!btn) return;
      const i = +btn.dataset.i; if (i !== cur && !tiles[i].forge) setCursor(i, false, true);
    });
    listen(gridEl, "focusin", e => {
      const btn = e.target.closest(".dms-tile"); if (!btn) return;
      const i = +btn.dataset.i; if (i !== cur) { if (typed) clearTyped(); setCursor(i, false); }
    });
    listen(gridEl, "keydown", e => {
      const btn = e.target.closest(".dms-tile"); if (!btn) return;
      const dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (dirs[e.key]) { e.preventDefault(); if (typed) clearTyped(); move(...dirs[e.key]); return; }
      if (e.key === "Home") { e.preventDefault(); setCursor(0, true); return; }
      if (e.key === "End") { e.preventDefault(); setCursor(tiles.length - 1, true); return; }
      if (e.key === "Escape") { if (typed) { e.preventDefault(); clearTyped(); show(tiles[cur].forge ? null : tiles[cur].who); } return; }
      if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault(); input.focus(); input.value = (input.value + e.key).slice(0, 28);
        clearTimeout(typeT); typeT = setTimeout(onTyped, 80);
      }
    });

    // ---------- picks, team, room ----------
    const slotsEl = q(".dms-slots");
    const slotCanvases = [];
    for (let i = 0; i < 4; i++) {
      const li = document.createElement("li"); li.style.setProperty("--sc", colorVar(SLOT_C[i]));
      li.innerHTML = `<canvas width="104" height="104" aria-hidden="true"></canvas><div><b>${i + 1}P</b><span></span></div><button type="button" class="dms-rm" hidden>&times;</button>`;
      const rm = li.querySelector(".dms-rm");
      rm.addEventListener("click", () => { team[i] = null; renderTeam(); decorate(); say(`${i + 1}P is free again.`, true); });
      slotsEl.append(li); slotCanvases.push(li.querySelector("canvas"));
    }
    function paintSlot(i){
      const cv = slotCanvases[i], ctx = cv.getContext("2d"); ctx.imageSmoothingEnabled = false;
      const p = DM.COLORWAYS[DM.colorway];
      ctx.fillStyle = p.ink; ctx.fillRect(0, 0, cv.width, cv.height);
      if (team[i]) { const f = fit(team[i], cv.width, cv.height, 3, 0, 3); DM.draw(ctx, f.x, f.foot, f.s, team[i], 1000); }
    }
    function renderTeam(){
      slotsEl.querySelectorAll("li").forEach((li, i) => {
        const w = team[i];
        li.classList.toggle("is-empty", !w);
        li.querySelector("span").textContent = w ? (DM.isKnown(w) ? DM.meta(w).name : cleanName(w)) : (opt.theme === "paper" ? "Empty" : "PRESS START");
        const rm = li.querySelector(".dms-rm"); rm.hidden = !w; if (w) rm.setAttribute("aria-label", `Remove ${li.querySelector("span").textContent} from ${i + 1}P`);
        paintSlot(i);
      });
      const cast = team.map((w, i) => w ? { id: "pick" + i + ":" + (DM.keyOf(w) || cleanName(w).toLowerCase()), who: w, lead: false } : null).filter(Boolean);
      room.setCast(cast);
      q(".dms-room-empty").hidden = cast.length > 0;
    }
    function flashSlot(i){ const li = slotsEl.children[i]; if (!li || DM.reduced) return; li.classList.remove("is-flash"); void li.offsetWidth; li.classList.add("is-flash"); }
    function lock(){
      const who = typed || (tiles[cur] && !tiles[cur].forge ? tiles[cur].who : null);
      if (!who) { input.focus(); return; }
      const name = DM.isKnown(who) ? DM.meta(who).name : cleanName(who);
      const have = team.findIndex(w => w && same(w, who));
      if (have >= 0) { flashSlot(have); say(`${name} is already on your team as ${have + 1}P.`, true); return; }
      const free = team.indexOf(null);
      if (free < 0) { for (let i = 0; i < 4; i++) flashSlot(i); say("Your team is full. Remove a pick first.", true); return; }
      team[free] = DM.isKnown(who) ? DM.keyOf(who) : cleanName(who);
      renderTeam(); decorate(); flashSlot(free);
      say(`${name} locked in as ${free + 1}P.`, true);
      if (typeof opt.onPick === "function") { try { opt.onPick(name, { key: DM.keyOf(who), generated: !DM.isKnown(who), slot: free + 1, handle: useHandle }); } catch (err) { console.error(err); } }
    }
    listen(q(".dms-lock"), "click", lock);
    listen(q(".dms-rand"), "click", () => { clearTyped(); const pool = tiles.map((t, i) => i).filter(i => !tiles[i].forge); setCursor(pool[Math.floor(Math.random() * pool.length)], true); });
    listen(q(".dms-clear"), "click", () => { team = [null, null, null, null]; renderTeam(); decorate(); say("Team cleared.", true); });
    listen(q(".dms-copy"), "click", () => {
      const done = ok => { q(".dms-copied").textContent = ok ? "COPIED" : "SELECT IT AND COPY"; };
      const fallback = () => {
        const ta = document.createElement("textarea"); ta.value = useHandle; ta.setAttribute("readonly", ""); ta.style.cssText = "position:absolute;left:-9999px;top:0";
        root.append(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch (e) {} ta.remove(); done(ok);
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(useHandle).then(() => done(true), fallback); else fallback();
    });

    const roomCv = q(".dms-room canvas");
    let roomIdx = opt.mode === "app" ? 0 : 2;
    roomCv.width = 960; roomCv.height = 540;
    const room = DM.room(roomCv, DM.rooms[roomIdx].key, { cast: [], seed: 5 + uid, enter: [480, 600] });
    function roomTag(){ const r = DM.rooms[roomIdx]; q(".dms-room-tag").textContent = r.icon + " · " + r.label; }
    roomTag();
    listen(q(".dms-nextroom"), "click", () => { roomIdx = (roomIdx + 1) % DM.rooms.length; room.setRoom(DM.rooms[roomIdx].key); roomTag(); });
    function sizeRoom(){
      const w = roomCv.clientWidth || 300, dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = Math.min(960, Math.max(240, Math.round(w * dpr)));
      if (roomCv.width !== W) { roomCv.width = W; roomCv.height = Math.round(W * 9 / 16); room.redraw(); }
    }

    // ---------- resize, colorway, motion ----------
    let lastW = 0;
    const ro = "ResizeObserver" in window ? new ResizeObserver(() => {
      if (dead) return;
      const w = root.clientWidth; if (Math.abs(w - lastW) < 2) return; lastW = w;
      refitPortrait(); sizeRoom();
      const nameEl = q(".dms-name"); fitName(nameEl, root.clientWidth < 420 ? 34 : 44);
    }) : null;
    if (ro) ro.observe(root);
    const offCw = DM.onColorway(() => {
      applyColorway();
      for (const t of tiles) if (t.painted) paintTile(t, 1000);
      for (let i = 0; i < 4; i++) paintSlot(i);
      if (shown) show(typed ? typed : (tiles[cur] && !tiles[cur].forge ? tiles[cur].who : null), true);
    });
    const offReduced = DM.onReduced(() => { portH.redraw(); room.redraw(); });

    // ---------- start ----------
    applyColorway();
    setLive(opt.live);
    buildGrid();
    if (opt.mode === "app" && (liveKeys.size || liveGen.length)) { const i = tiles.findIndex(t => t.band === "floor"); if (i >= 0) cur = i; }
    decorate();
    show(tiles[cur] && !tiles[cur].forge ? tiles[cur].who : "sol");
    renderTeam();
    requestAnimationFrame(() => { if (!dead) { refitPortrait(); sizeRoom(); } });

    return {
      destroy(){
        if (dead) return; dead = true;
        clearTimeout(typeT); clearTimeout(announceT); clearTimeout(idleT);
        for (const d of disposers) d();
        for (const h of anims.values()) h.destroy(); anims.clear();
        if (tileIO) tileIO.disconnect();
        if (ro) ro.disconnect();
        offCw(); offReduced();
        portH.destroy(); room.destroy();
        root.remove();
      },
      setLive(names){
        if (dead) return;
        const before = [...liveKeys].sort().join() + "|" + liveGen.join();
        setLive(names);
        if ([...liveKeys].sort().join() + "|" + liveGen.join() === before) return;
        const hadFocus = root.contains(document.activeElement) && document.activeElement.classList.contains("dms-tile");
        buildGrid();
        if (!typed) show(tiles[cur] && !tiles[cur].forge ? tiles[cur].who : "sol"); else q(".dms-port .dms-live").hidden = !isLive(shown);
        if (hadFocus && tiles[cur]) tiles[cur].btn.focus({ preventScroll: true });
      },
      focus(name){
        if (dead || !name) return;
        if (DM.isKnown(name)) {
          clearTyped();
          const k = DM.keyOf(name);
          let i = tiles.findIndex(t => t.key === k && t.band !== "floor"); if (i < 0) i = tiles.findIndex(t => t.key === k);
          if (i >= 0) setCursor(i, true);
        } else {
          input.value = cleanName(name); onTyped(); input.focus({ preventScroll: true });
        }
      }
    };
  }

  window.DMSelect = { mount };
})();
