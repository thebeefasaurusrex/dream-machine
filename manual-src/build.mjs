// Builds everything in this repo from manual-src. Node 18 or newer, no npm install.
//   node manual-src/build.mjs
// Writes:
//   manual/index.html        The Manual: one self-contained file (scripts, styles, fonts and pictures inlined)
//   engine/*.js              the files the Manual's download buttons hand out
//   starter/*.html           the one-file starter, plus the room page and minimal page from the code chapter
//
// Directives a page can use (each on its own line):
//   <!--@KIT-->       the character engine, the live renderer, the first edition rooms, shared copy and dm-kit.js
//   <!--@GSAP-->      GSAP core (vendor/gsap)
//   <!--@FONTS A|B--> Google Fonts, latin only, inlined as data URIs (cached in cache/fonts, so builds work offline)
//   <!--@PART a b-->  src/parts/<a>.css and .js; a name with a slash (site/manual-images) resolves from src/
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(ROOT, '..');
const P = (...a) => path.join(ROOT, ...a);
const read = f => fs.readFileSync(P(f), 'utf8');
const write = (rel, text) => { const f = path.join(REPO, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); console.log((text.length / 1024).toFixed(0).padStart(6) + ' KB  ' + rel); };

const KIT_FILES = ['vendor/live-helpers.js', 'vendor/persona-module.js', 'vendor/persona-engine.js', 'vendor/meta.js', 'vendor/persona-live.js', 'vendor/rooms.js', 'src/content.js', 'src/dm-kit.js'];
const safeJs = s => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const KIT = safeJs(KIT_FILES.map(f => `/* ==== ${f} ==== */\n` + read(f)).join('\n;\n'));
const gsapFile = name => safeJs(read(`vendor/gsap/${name}.min.js`).replace(/\/\/# sourceMappingURL=.*$/m, ''));

// ---------- fonts ----------
const FONT_CACHE = P('cache', 'fonts');
fs.mkdirSync(FONT_CACHE, { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
async function fontCss(spec){
  const id = crypto.createHash('md5').update(spec).digest('hex').slice(0, 12);
  const cached = path.join(FONT_CACHE, id + '.css');
  if (fs.existsSync(cached)) return fs.readFileSync(cached, 'utf8');
  const res = await fetch(`https://fonts.googleapis.com/css2?family=${spec.trim().replace(/ /g, '+')}&display=swap`, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`font ${spec}: HTTP ${res.status}`);
  const css = await res.text();
  const blocks = css.split(/(?=\/\*\s*[a-z-]+\s*\*\/)/).filter(b => /\/\*\s*latin\s*\*\//.test(b));
  let out = '';
  for (const b of blocks.length ? blocks : [css]) {
    let block = b;
    for (const [, u] of b.matchAll(/url\((https:[^)]+)\)/g)) {
      const buf = Buffer.from(await (await fetch(u, { headers: { 'User-Agent': UA } })).arrayBuffer());
      block = block.replace(u, `data:font/woff2;base64,${buf.toString('base64')}`);
    }
    out += block.replace(/\/\*\s*latin\s*\*\/\s*/, '') + '\n';
  }
  fs.writeFileSync(cached, out);
  return out;
}

// ---------- directives ----------
const DIRECTIVE = /^[ \t]*<!--@(KIT|GSAP|FONTS|PART)([^>]*)-->[ \t]*$/gm;
const partBase = name => name.includes('/') ? P('src', name) : P('src', 'parts', name);
function partHtml(args){
  const out = [];
  for (const name of args.split(/\s+/).filter(Boolean)) {
    const base = partBase(name);
    if (!fs.existsSync(base + '.js') && !fs.existsSync(base + '.css')) throw new Error(`@PART ${name}: no ${base}.js or .css`);
    if (fs.existsSync(base + '.css')) out.push(`<style>/* part ${name} */\n${fs.readFileSync(base + '.css', 'utf8')}</style>`);
    if (fs.existsSync(base + '.js')) out.push(`<script>/* part ${name} */\n${safeJs(fs.readFileSync(base + '.js', 'utf8'))}\n</script>`);
  }
  return out.join('\n');
}
async function resolve(html){
  for (const m of [...html.matchAll(DIRECTIVE)]) {
    const [raw, kind, a] = m, args = a.trim();
    let rep = '';
    if (kind === 'KIT') rep = `<script>\n${KIT}\n</script>`;
    if (kind === 'GSAP') rep = ['gsap', ...args.split(/\s+/).filter(Boolean)].map(n => `<script>${gsapFile(n)}</script>`).join('\n');
    if (kind === 'FONTS') { const css = []; for (const f of args.split('|').map(s => s.trim()).filter(Boolean)) css.push(await fontCss(f)); rep = `<style>\n${css.join('\n')}</style>`; }
    if (kind === 'PART') rep = partHtml(args);
    html = html.replace(raw, () => rep);
  }
  return html;
}

// ---------- the Manual ----------
const manualSrc = read('src/site/manual.html');
const dashes = (manualSrc.match(/[—–]/g) || []).length;
if (dashes) console.warn(`  note: ${dashes} em/en dash(es) in manual.html`);
write('manual/index.html', await resolve(manualSrc));

// ---------- the downloads (same text the Manual's buttons save) ----------
const src = {};
for (const f of ['live-helpers.js', 'persona-module.js', 'persona-engine.js', 'meta.js', 'persona-live.js']) src[f] = read('vendor/' + f) + '\n';
src['dream-machine-rooms.js'] = '// dream-machine-rooms.js: The Dream Machine rooms, second edition. Load it after persona-engine.js.\n' + read('src/parts/dm-rooms2.js') + '\n';
const publicNotes = new Function(read('src/content.js') + '\nreturn DM_PUBLIC_NOTES;')();
const engine = {
  'persona-module.js': '// persona-module.js from The Dream Machine, with hash32 and pick included so compile() works for any name.\n' + src['live-helpers.js'] + '\n' + src['persona-module.js'],
  'persona-engine.js': src['persona-engine.js'],
  'persona-live.js': src['persona-live.js'],
  'meta.js': src['meta.js'] + '\n// Public notes for the characters whose old notes were review comments.\n(function(){ const P = ' + JSON.stringify(publicNotes) + '; for (const k in P) if (CHARACTER_META[k]) CHARACTER_META[k].note = P[k]; })();\n',
  'dream-machine-rooms.js': src['dream-machine-rooms.js']
};
for (const [f, body] of Object.entries(engine)) write('engine/' + f, body);

// The two code listings live in manual.html; read them from there so the repo never drifts from the booklet.
const listing = name => { const m = manualSrc.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\])\\.join\\("\\\\n"\\);`)); if (!m) throw new Error('listing ' + name + ' not found'); return new Function('return ' + m[1])().join('\n'); };
const ROOMQUICK = listing('ROOMQUICK'), QUICKSTART = listing('QUICKSTART');
const inline = s => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const libs = ['persona-module.js', 'persona-engine.js', 'persona-live.js', 'dream-machine-rooms.js'].map(n => `<script>/* ${n} */\n${inline(engine[n])}\n</script>\n`).join('');
const program = ROOMQUICK.slice(ROOMQUICK.lastIndexOf('<script>') + 8, ROOMQUICK.lastIndexOf('</script>'));
write('starter/dream-machine-starter.html', `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Dream Machine starter</title>\n` +
  `<style>html,body{margin:0;background:#05030a;color:#f4f1ff;font:15px/1.5 system-ui,sans-serif}main{max-width:1280px;margin:0 auto;padding:16px}canvas{display:block;width:100%;height:auto;cursor:pointer}p{opacity:.8}</style>\n</head>\n<body>\n<main>\n` +
  `<canvas id="room" width="1280" height="720"></canvas>\n<p>The Dream Machine starter: five guys wandering a room. Click the room for the next one. Change the names in the last script to make your own crew. Every character is compiled from its name, so any name works.</p>\n</main>\n` +
  libs + `<script>${program}</script>\n</body>\n</html>\n`);
const page = (title, body) => `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>${title}</title>\n<style>html,body{margin:0;background:#05030a}canvas{max-width:100%;height:auto}</style>\n</head>\n<body>\n${body.replace(/src="([\w-]+\.js)"/g, 'src="../engine/$1"')}\n</body>\n</html>\n`;
write('starter/room.html', page('Dream Machine room page', ROOMQUICK));
write('starter/minimal.html', page('Dream Machine minimal page', QUICKSTART));
