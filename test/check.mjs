// Zero-dependency checks for the engine files and the build output. Run: node test/check.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.readFileSync(path.join(REPO, f), 'utf8');
let failed = 0;
const ok = (name, pass, detail = '') => { console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`); if (!pass) failed++; };

// Load the engine the way a page does: plain scripts sharing one global scope, in order.
const ctx = vm.createContext({ console });
ctx.window = ctx;  // the engine registers itself on window, as in a browser
for (const f of ['persona-module.js', 'persona-engine.js', 'persona-live.js', 'meta.js', 'dream-machine-rooms.js']) {
  try { vm.runInContext(read('engine/' + f), ctx, { filename: f }); ok('loads ' + f, true); }
  catch (e) { ok('loads ' + f, false, e.message); }
}
const run = code => vm.runInContext(code, ctx);

// Check the authored recipes and compile the roster with the keys the Manual uses.
const roster = run('Object.entries(CHARACTER_META).map(([key, meta]) => [key, meta.name])');
const bad = roster.filter(([key, name]) => !run(`(() => {
  const api = TeamLoopPersona;
  const dna = api.compile(${JSON.stringify(name)}, ${JSON.stringify(key)});
  return api.isKnown(${JSON.stringify(key)}) && dna.key === ${JSON.stringify(key)} && dna.provenance !== 'generated';
})()`));
ok('all roster keys select authored recipes', bad.length === 0 && roster.length === run('TeamLoopPersona.catalog.length'), `${roster.length} entries`);
ok('authored recipe slots and palette keys are valid', run('TeamLoopPersona.catalogValid()'));
ok('catalog validation catches invalid authored input even after compiling it', run(`(() => {
  const recipe = PERSONA_RECIPES.boyleactor;
  const hat = recipe.hat;
  const color = recipe.colors[0];
  try {
    recipe.hat = 'bald';
    const rejectsHat = !TeamLoopPersona.catalogValid();
    recipe.hat = hat;
    recipe.colors[0] = 'not-a-color';
    return rejectsHat && !TeamLoopPersona.catalogValid();
  } finally {
    recipe.hat = hat;
    recipe.colors[0] = color;
  }
})()`));
ok('mutating returned colors does not change the cached persona', run(`(() => {
  const dna = TeamLoopPersona.compile('Sol');
  const original = dna.colors[0];
  dna.colors[0] = 'not-a-color';
  return TeamLoopPersona.compile('Sol').colors[0] === original;
})()`));
ok('inherited keys use the generated fallback', run("!TeamLoopPersona.isKnown('constructor') && TeamLoopPersona.compile('constructor').provenance === 'generated'"));
ok('an explicit roster key handles a mismatched display name', run("TeamLoopPersona.compile('Zeno Of Citium', 'zeno').provenance === 'original'"));
ok('Sol gets the elf sovereign head', run('TeamLoopPersona.compile("Sol").head') === 'elfSovereign');
const a = run('JSON.stringify(TeamLoopPersona.compile("Mark"))'), b = run('JSON.stringify(TeamLoopPersona.compile("Mark"))');
ok('a name not on the roster compiles, the same every time', a === b && JSON.parse(a).body, JSON.parse(a).body);
ok('three colorways', run('Object.keys(COLORWAYS).join(",")').split(',').length === 3, run('Object.keys(COLORWAYS).join(", ")'));
ok('the live drawer is there', run('typeof DM_LIVE.drawCharacter') === 'function');

// The rooms: five of them, each with its six stations and 34 places to stand.
const rooms = run('DM_ROOMS2.order');
ok('five rooms', rooms.length === 5, rooms.join(', '));
for (const k of rooms) {
  const z = run(`DM_ROOMS2.defs[${JSON.stringify(k)}].zones`);
  const spots = Object.values(z).flat().length;
  ok(`${k}: six stations, 34 spots`, Object.keys(z).length === 6 && spots === 34, `${Object.keys(z).join(' ')}; ${spots}`);
}
ok('rooms world is 1280 by 720', run('DM_ROOMS2.world.width + "x" + DM_ROOMS2.world.height') === '1280x720');

// Build output: the Manual is one file, and the starter needs nothing from outside.
const manual = read('manual/index.html');
// Skip escaped quotes in the Manual's JavaScript code listings.
const realSrc = /<script\b[^>]*\ssrc\s*=\s*(?:["']|[^\s"'\\=>])/i;
ok('Manual has no outside scripts', !realSrc.test(manual));
ok('the src check catches quoted and unquoted script URLs', ['"x.js"', "'x.js'", 'x.js'].every(src => realSrc.test(`<script src=${src}></script>`)));
ok('Manual is the second edition', manual.includes('2ND EDITION'));
const starter = read('starter/dream-machine-starter.html');
ok('starter has no outside scripts', !realSrc.test(starter));
ok('starter carries all four scripts', ['persona-module.js', 'persona-engine.js', 'persona-live.js', 'dream-machine-rooms.js'].every(n => starter.includes(`/* ${n} */`)));

const inlineScripts = [...starter.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
ok('the starter inline scripts parse', inlineScripts.length === 5 && inlineScripts.every(([, script]) => {
  try { new vm.Script(script); return true; }
  catch { return false; }
}));

console.log(failed ? `${failed} FAILED` : 'ALL PASS');
process.exit(failed ? 1 : 0);
