// Shared copy for every layout study, so only the layout changes between options.
// Rewritten from the live site with the facts kept and the em dashes removed (Mark's voice rule).
"use strict";
const DM_CONTENT = {
  title: "The Dream Machine",
  kicker: "A team you can see",
  heroLine: "Your AI agent sessions, drawn as 8-bit arcade characters living in rooms on your own machine.",
  origin: "Named after a real arcade in the Lincoln Mall, Lincoln, Rhode Island. Early to mid 90s. It mattered.",
  originLong: "The Dream Machine was the arcade in the Lincoln Mall in Lincoln, Rhode Island, in the early to mid 90s: red carpet, a cloud-shaped sign, a row of cabinets glowing in the dark. This one runs on a laptop instead of quarters.",
  teamloop: "The Dream Machine is the window into TeamLoop, Mark's open-source toolkit for running several AI models as one team on Codex. TeamLoop does the work. The Dream Machine lets you see it.",

  what: [
    "The Dream Machine is a team presence visualizer. It is a local web page that shows your live AI agent sessions (Codex threads, Claude sessions, local tools) as little pixel characters walking around an arcade. Each room is a group of threads. Each character is an agent.",
    "Glance at it and you know who is working, who needs you, and who is done, the same way you would read a room full of actual people."
  ],
  lowTech: "It stays low-tech where it counts: one HTML file plus a tiny read-only Python bridge on 127.0.0.1. No framework, no build step, no cloud. Every character is drawn on a canvas at a 2-pixel grid, Mega Man style, and none of them are image files. Each one is compiled from a recipe.",

  features: [
    { id: "rooms",  title: "Five rooms",          body: "DM Main Floor, DM Pinball Row, DM Party Room, Signal Observatory and Agora Archive. Each is an 8-bit diorama with its own props. Rooms map to groups of threads, and agents wander the room they belong to." },
    { id: "states", title: "Live states",         body: "Working, needs you, idle, ended. They show up as posture and position, not just a color. A character that needs you looks like it needs you." },
    { id: "the101", title: "The 101",             body: "Every named agent has a hand-designed costume. Euclid is a square-headed geometer, Schrodinger is literally the cat, and Jason is exactly who you think he is. 129 fixed recipes ship in the catalog." },
    { id: "forge",  title: "Persona Forge",       body: "Type any name, a friend, a bot, a bit, and the machine builds a character from it. Same name, same guy, every time. Nobody gets a default avatar." },
    { id: "memory", title: "Room memory",         body: "Rooms remember. Clear one and its crew is saved, so you can bring the scene back and look at who was there." },
    { id: "honest", title: "Honest when offline", body: "If the bridge goes down, the page says so, keeps your last good state, and recovers on its own. No fake loading screens and no quietly stale data." }
  ],

  recipeSlots: ["body", "head", "face", "hat", "outfit", "shell", "prop", "aura", "motif"],
  parts: { body: 12, head: 12, face: 10, hat: 18, outfit: 12, shell: 8, prop: 30, aura: 18, motif: 15 },

  stats: [
    { n: "129",      label: "fixed recipes" },
    { n: "135",      label: "parts in the library" },
    { n: "9",        label: "slots per character" },
    { n: "5",        label: "rooms" },
    { n: "3",        label: "colorways" },
    { n: "7",        label: "formulation batches" },
    { n: "0",        label: "image files" }
  ],

  upgrade: {
    title: "Atari in. NES out.",
    intro: "The first version worked, but next to a Master System it looked like an Atari 2600. The overhaul rebuilt the whole look at NES Blue Bomber fidelity, then kept going until the machine had 101 weird little guys in it.",
    phases: [
      { n: "00", title: "The audit",            body: "Full code review, contract tests in Playwright, and regression gates. From here on every change shipped behind a failing test first, then a green one." },
      { n: "01", title: "The parts library",    body: "Every body part redesigned and approved piece by piece on isolated review pages: 12 bodies, 12 heads, 10 faces, 18 hats, 12 outfits, 8 shells, 30 props, 18 auras and 15 chest motifs, including a DNA helix for Rosalind Franklin." },
      { n: "02", title: "The rooms",            body: "All five rooms rebuilt in 8-bit through three-way shootouts per room. Neon Nights won the arcade rooms. Blue Bomber won where reading matters most." },
      { n: "03", title: "The model crew",       body: "The house characters got bespoke designs. Sol, the Dream Machine itself, got an elf-sovereign head, a token railgun and orbiting tokens, and became the best-dressed thing in the building." },
      { n: "04", title: "The 101 formulations", body: "101 names, 101 hand-designed costumes, reviewed fifteen at a time and locked behind tests. No two share a palette. By the last batch exactly one color combination was left. Ramanujan got it." }
    ]
  },

  how: [
    { n: "01", verb: "Sense",   body: "A read-only Python bridge serves session state as JSON on localhost. It never writes anything." },
    { n: "02", verb: "Compile", body: "Each agent name becomes character DNA: its fixed recipe if it is one of the 129, otherwise a build hashed from the name. Same name, same guy, forever." },
    { n: "03", verb: "Draw",    body: "The canvas engine draws each character from the parts library at 2-pixel resolution, animated every frame. No image assets." },
    { n: "04", verb: "Gate",    body: "Changes ship through contract tests: static checks, desktop and mobile Playwright suites, bridge unit tests, and a live compile of every recipe." }
  ],

  doctrine: [
    { title: "Every pixel earns its place.",      body: "If a part does not read at 2-pixel resolution, it gets redesigned, not excused." },
    { title: "The costume matches the reference.", body: "Plato gets the shadow of the cave. Wegener gets Greenland snow. If you know, you know, and if you don't, it still has to look cool." },
    { title: "Palettes are a finite resource.",   body: "Three color channels per character, and no two formulations share a set. Scarcity breeds taste." },
    { title: "Nothing goes live until approved.", body: "Every visual change was reviewed on an isolated page first, then locked in with a checkpoint you can roll back to." }
  ],

  chapters: [
    { n: "01", title: "Where we started",   body: "A working app with good plumbing and mushy people: characters drawn in about 20 by 28 pixels, flat tones, no outlines.", quote: "It looks half the fidelity of an 8-bit NES machine. A little too Atari 2600 for me. I'm more of a NES/Master System kinda guy." },
    { n: "02", title: "Picking a dialect",  body: "8-bit is a hardware limit with a dozen schools inside it. Tesla and Hopper were drawn five ways: Plumber Chunk, Blue Bomber, Dark Sector and Storybook Quest.", quote: "Blue Bomber, all day. Dark Sector is cool as hell but it gets edged out." },
    { n: "03", title: "The review loop",    body: "Build a batch, show it on an isolated page, take notes, fix, show again, approve, lock it in. Three batches rebuilt the parts library.", quote: "Longlegs rules btw no notes there." },
    { n: "04", title: "The model crew",     body: "Sol got a full shootout: Gundam spirit, crystalline ghost, sun knight, ring wraith, arcade ace. The late entry won.", quote: "What a dope name." },
    { n: "05", title: "The 101",            body: "101 names, each researched, each costume a joke, a tribute or a fact. Ideally all three. Franklin is Rosalind. Bernoulli is Jacob. Jason is Voorhees. Yes, really.", quote: "Schrodinger is literally the cat." },
    { n: "06", title: "The rooms",          body: "Five rooms, three dialects each, judged side by side as dioramas. Neon Nights for the arcade rooms, because it is a mall arcade at night.", quote: "" },
    { n: "07", title: "Where it is now",    body: "Every batch landed in the live build behind regression gates, with a ledger of every approved state so any look can be checked or restored.", quote: "" }
  ],

  code: {
    intro: "The character system is three plain script files. Hand them to a friend or another AI tool and they can stand it up anywhere there is a canvas.",
    files: [
      { name: "persona-module.js", role: "The brain: parts library, all 129 recipes, and compile(name)." },
      { name: "persona-engine.js", role: "The body: colorways and every part renderer at 2-pixel resolution." },
      { name: "meta.js",           role: "The story: names, eras and design notes. Optional." }
    ],
    steps: [
      "Load persona-module.js, persona-engine.js and meta.js with plain script tags.",
      "Get DNA: TeamLoopPersona.compile(\"Sagan\"). Known names return their recipe, any other name gets a generated build.",
      "Pick a palette: paletteCW(\"voidArcade\", ...dna.colors).",
      "Draw every frame: drawCharacter(ctx, x, y, scale, dna, palette, performance.now(), seed).",
      "Add your own: append one recipe to PERSONA_RECIPES with an unused palette set."
    ],
    snippet: "const dna = TeamLoopPersona.compile(\"Schrodinger\"); // or any name\nconst pal = paletteCW(\"voidArcade\", ...dna.colors);\nfunction frame(t){\n  ctx.clearRect(0, 0, 240, 236);\n  drawCharacter(ctx, 120, 196, 4.2, dna, pal, t, 7);\n  requestAnimationFrame(frame);\n}\nrequestAnimationFrame(frame);",
    recipe: "schrodinger: { body:\"round\", head:\"feline\", face:\"dots\", outfit:\"suit\",\n  aura:\"probability\", colors:[\"mint\",\"cyan\",\"violet\"] }\n// he IS the cat. feline head + probability aura = the superposition."
  },

  heroCast: ["sol", "schrodinger", "jason", "archimedes", "tesla", "heisenberg", "ramanujan", "einstein"],
  crew: ["sol", "flash", "sonnet", "opus", "astra", "terra", "luna", "deepseek"],
  favorites: ["sol", "schrodinger", "bernoulli", "franklin", "jason", "longlegs-note"],

  credits: "Built by Mark + Kimi. Characters compiled, not drawn.",
  links: {
    site: "https://starforge-dream-machine.netlify.app/",
    process: "https://starforge-dream-machine.netlify.app/process",
    roster: "https://starforge-dream-machine.netlify.app/roster",
    code: "https://starforge-dream-machine.netlify.app/code",
    teamloop: "https://github.com/thebeefasaurusrex/teamloop",
    mark: "https://marksalisburyai.com/"
  },

  // Synthetic sessions for any study that shows the app running. Made up on purpose:
  // the real bridge data is private and never leaves Mark's machine.
  demoSessions: [
    { agent: "sol",      task: "teamloop: route review packet",   room: "forgeFloor",   state: "work" },
    { agent: "sonnet",   task: "teamloop: route review packet",   room: "forgeFloor",   state: "think" },
    { agent: "opus",     task: "teamloop: route review packet",   room: "forgeFloor",   state: "attention" },
    { agent: "flash",    task: "buryboard: halloween themes",     room: "nullArcade",   state: "work" },
    { agent: "astra",    task: "buryboard: halloween themes",     room: "nullArcade",   state: "complete" },
    { agent: "curie",    task: "site: fix mobile nav",            room: "dmParty",      state: "work" },
    { agent: "tesla",    task: "site: fix mobile nav",            room: "dmParty",      state: "idle" },
    { agent: "sagan",    task: "research: room shootout notes",   room: "observatory",  state: "think" },
    { agent: "socrates", task: "review: palette doctrine",        room: "agoraArchive", state: "work" },
    { agent: "plato",    task: "review: palette doctrine",        room: "agoraArchive", state: "attention" }
  ]
};

// Public notes for roster entries whose live note is an internal review comment.
const DM_PUBLIC_NOTES = {
  hypatia:    "star diadem, toga, scroll, starfield. the first one in the building, and still one of the best dressed.",
  laplace:    "the jester of chance: mask, dice, probability field.",
  ampere:     "a full current knight: battery pack, meter, crown of the amp.",
  faraday:    "a tiny giant inside his own cage, with an induction coil and a static field.",
  curie:      "hooded, aproned, flask in hand, chemistry aura. two nobels, zero aura changes.",
  noether:    "the symmetry saint: halo, staff, snowfall.",
  turing:     "the machine man: rain of code, and a wrench for the bombe.",
  socrates:   "the gadfly. bald, bearded, a question in hand and more overhead.",
  boyle:      "the air-pump showman.",
  ohm:        "the resistance itself.",
  heisenberg: "the porkpie, the glasses, the flask. say my name.",
  bernoulli:  "the flask of probable fluid: it phases in and out because it is only probably there. the nerdiest joke in the build."
};
