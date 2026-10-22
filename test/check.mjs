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

// Every roster name compiles to its own recipe, and the same name always gives the same character.
const names = run('Object.values(CHARACTER_META).map(m => m.name)');
const bad = names.filter(n => { try { const d = run(`TeamLoopPersona.compile(${JSON.stringify(n)})`); return !d || !d.body || !d.colors || d.colors.length !== 3; } catch (e) { return true; } });
ok('every roster name compiles', bad.length === 0, `${names.length} names${bad.length ? ', bad: ' + bad.join(', ') : ''}`);
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
// (the code listings inside the page mention script tags as text, with escaped quotes; a real tag has src=")
const realSrc = /<script[^>]*\ssrc="/i;
ok('Manual has no outside scripts', !realSrc.test(manual));
ok('the src check would catch one', realSrc.test('<script src="x.js"></script>'));
ok('Manual is the second edition', manual.includes('2ND EDITION'));
const starter = read('starter/dream-machine-starter.html');
ok('starter has no outside scripts', !realSrc.test(starter));
ok('starter carries all four scripts', ['persona-module.js', 'persona-engine.js', 'persona-live.js', 'dream-machine-rooms.js'].every(n => starter.includes(`/* ${n} */`)));

console.log(failed ? `${failed} FAILED` : 'ALL PASS');
process.exit(failed ? 1 : 0);
