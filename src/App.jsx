import { useState, useEffect, useRef, useMemo } from "react";

// ============================================================
// IRONWORLD: Empire of the Iron God
// A god-sim powered by real gym sessions.
// Train -> earn Power -> build your island, conquer nations,
// raise mortals into Champions, and write one growing Saga.
// ============================================================

const SAVE_KEY = "ironworld-save-v1";

// ---------- ERAS ----------
const ERAS = [
  { name: "Stone Age", need: 0, color: "#8a8578", desc: "A barren rock. A few believers." },
  { name: "Bronze Age", need: 8, color: "#b07d3f", desc: "Fire, farms, and the first forges." },
  { name: "Iron Age", need: 16, color: "#9aa3ad", desc: "Weapons of iron. Your name spreads." },
  { name: "Classical Age", need: 28, color: "#e0d6b3", desc: "Temples rise in your honor." },
  { name: "Medieval Age", need: 40, color: "#7d5ba6", desc: "Castles, banners, and crusades." },
  { name: "Renaissance", need: 56, color: "#d9a441", desc: "Art, invention, golden light." },
  { name: "Industrial Age", need: 72, color: "#c4673a", desc: "Smoke stacks and steel rails." },
  { name: "Modern Age", need: 92, color: "#5fb3c9", desc: "Cities of glass touch the clouds." },
  { name: "Atomic Age", need: 112, color: "#7ee08a", desc: "Power to split the world itself." },
  { name: "Space Age", need: 136, color: "#6d7ff0", desc: "Your people leave the cradle." },
  { name: "Ascension", need: 160, color: "#f0b541", desc: "A god among gods. The map is yours to finish." },
];

// ---------- NPC NATIONS ----------
const NATIONS = [
  { id: "mosskin", name: "Mosskin Tribe", god: "Gnarl, the Root-God", eraReq: 0, defense: 80, cost: 150, tribute: 10, color: "#5e8c4a", flavor: "Mud huts and mushroom shamans. An easy first conquest — if you've been showing up." },
  { id: "ashen", name: "Ashen Clan", god: "Cindra, Lady of Embers", eraReq: 1, defense: 200, cost: 300, tribute: 15, color: "#a04f3a", flavor: "Fire worshippers living on a smoking ridge. They respect only strength." },
  { id: "river", name: "River Kingdom", god: "Oshu, the Drowned King", eraReq: 2, defense: 360, cost: 500, tribute: 20, color: "#4a7fa0", flavor: "Rich delta farmers with a navy of reed ships and a lazy god." },
  { id: "duneborn", name: "Duneborn Caliphate", god: "Sahir of the Endless Sand", eraReq: 3, defense: 560, cost: 700, tribute: 25, color: "#d4a955", flavor: "Desert traders whose gold mines never empty. Their tribute is legendary." },
  { id: "frosthold", name: "Frosthold", god: "Ymra, the Sleeping Glacier", eraReq: 4, defense: 800, cost: 900, tribute: 30, color: "#9fc4d8", flavor: "Hardened northmen behind walls of ice. Wars here are won in winters, not days." },
  { id: "jade", name: "Jade Dynasty", god: "The Celestial Serpent", eraReq: 5, defense: 1100, cost: 1200, tribute: 35, color: "#56a878", flavor: "Ancient, wealthy, and proud. Their serpent god has never lost a war." },
  { id: "legion", name: "The Iron Legion", god: "Ferrum, God-Machine", eraReq: 6, defense: 1450, cost: 1500, tribute: 45, color: "#7a7f8a", flavor: "A nation that is also an army. Conquering them doubles as recruiting them." },
  { id: "storm", name: "Storm Isles", god: "Kaelos, Thrower of Thunder", eraReq: 7, defense: 1850, cost: 1900, tribute: 55, color: "#5b6fc4", flavor: "Island raiders whose god hurls lightning. Beat him and take his arm strength." },
  { id: "obsidian", name: "Obsidian Empire", god: "Vexxa, the Black Mirror", eraReq: 8, defense: 2300, cost: 2400, tribute: 70, color: "#3d3548", flavor: "An empire of dark glass that has conquered twelve gods. You would be unlucky thirteen... or their end." },
  { id: "oldgods", name: "Dominion of the Old Gods", god: "The Nameless Three", eraReq: 9, defense: 2900, cost: 3000, tribute: 100, color: "#c9a227", flavor: "The final throne. The gods who made this world. Take it, and every nation kneels to you alone." },
];

// ---------- DEFAULT WORKOUT PROGRAM (seeded into editable state) ----------
const PRESET_SESSIONS = [
  {
    id: "lowerA", name: "Lower A — Squat Day", tag: "LEGS", blurb: "Raw lower-body power. This is where throw velocity actually comes from.",
    exercises: [
      { name: "Back Squat", sets: "4 × 5", note: "Heavy but clean. 2-3 min rest." },
      { name: "Romanian Deadlift", sets: "3 × 8", note: "Hinge at hips, feel hamstrings." },
      { name: "Leg Press", sets: "3 × 10", note: "Full depth, controlled." },
      { name: "Standing Calf Raise", sets: "3 × 12", note: "Pause at top." },
      { name: "Plank", sets: "3 × 45s", note: "Brace like taking a hit." },
    ],
  },
  {
    id: "upperA", name: "Upper A — Push Day", tag: "PUSH", blurb: "Neutral grips only. Pressing strength without poking the inner elbow.",
    exercises: [
      { name: "DB Bench Press (neutral grip)", sets: "4 × 6", note: "Palms facing each other = elbow-safe." },
      { name: "Chest-Supported Row", sets: "3 × 10", note: "Squeeze shoulder blades." },
      { name: "Seated DB Shoulder Press (neutral)", sets: "3 × 8", note: "No grinding reps." },
      { name: "Face Pulls", sets: "3 × 15", note: "Rotator cuff gold. Protects the throwing arm." },
      { name: "Pallof Press", sets: "3 × 10/side", note: "Anti-rotation core = throwing core." },
    ],
  },
  {
    id: "lowerB", name: "Lower B — Hinge Day", tag: "LEGS", blurb: "Posterior chain. Hips and hamstrings are the engine of every throw.",
    exercises: [
      { name: "Trap Bar Deadlift", sets: "4 × 5", note: "Neutral grip, easy on the elbow." },
      { name: "Goblet Squat", sets: "3 × 10", note: "Upright torso, deep." },
      { name: "Hip Thrust", sets: "3 × 8", note: "Hard glute squeeze at top." },
      { name: "Lying Hamstring Curl", sets: "3 × 12", note: "Slow negative." },
      { name: "Hanging Knee Raise", sets: "3 × 10", note: "No swinging." },
    ],
  },
  {
    id: "upperB", name: "Upper B — Pull Day", tag: "PULL", blurb: "Back width, grip, and the rotator-cuff work that keeps your arm in the game.",
    exercises: [
      { name: "Lat Pulldown (neutral grip)", sets: "4 × 8", note: "Pull to collarbone." },
      { name: "Incline DB Press (neutral)", sets: "3 × 8", note: "30° incline." },
      { name: "Seated Cable Row", sets: "3 × 10", note: "Chest up, no yank." },
      { name: "Band External Rotation", sets: "3 × 15/side", note: "Light. Thrower's insurance policy." },
      { name: "Farmer Carry", sets: "3 × 40yd", note: "Heavy DBs, tall posture." },
    ],
  },
];

const ELBOW_RULES = [
  "Neutral grips (palms facing in) on all pressing and pulling.",
  "No barbell curls, skull crushers, or straight-bar work — those load the inner elbow.",
  "Any sharp inner-elbow pain mid-set: stop the exercise, not the workout.",
  "Face pulls and band external rotations are non-negotiable. They're why your arm gets to keep throwing.",
];

const BANNER_COLORS = ["#f0b541", "#c4453c", "#5fb3c9", "#7ee08a", "#7d5ba6", "#e8e0cc"];

// ---------- BUILDINGS (spend Power; even mix of military / economy / population / utility) ----------
const BUILDINGS = [
  {
    id: "forge", name: "War Forge", branch: "Military", icon: "🔥", color: "#c4453c", max: 6,
    base: 180, growth: 1.7,
    effect: (lvl) => `+${lvl * 25} War Strength`,
    blurb: "Anvils ring day and night. Iron becomes blades, and blades become conquest.",
  },
  {
    id: "shrine", name: "Grand Shrine", branch: "Economy", icon: "⛩", color: "#f0b541", max: 6,
    base: 160, growth: 1.65,
    effect: (lvl) => `+${lvl * 8} Power per workout`,
    blurb: "Obelisks of your name. Every prayer you earn returns to you doubled in devotion.",
  },
  {
    id: "longhouse", name: "Longhouses", branch: "Population", icon: "🏘", color: "#7ee08a", max: 6,
    base: 140, growth: 1.6,
    effect: (lvl) => `+${lvl * 2} people · larger pool of Chosen`,
    blurb: "Hearths and crowded halls. More mortals are born to live, toil, and worship you.",
  },
  {
    id: "ward", name: "Ward Stones", branch: "Resilience", icon: "🪨", color: "#5fb3c9", max: 5,
    base: 200, growth: 1.8,
    effect: (lvl) => `+${lvl} grace day${lvl === 1 ? "" : "s"} before your streak breaks`,
    blurb: "Standing stones humming with old magic. They keep your momentum alive through rest.",
  },
];

// ---------- THE SAGA (one growing story; chapters unlock by progress) ----------
const SAGA = [
  {
    id: "genesis", title: "I · The Waking",
    cond: () => true,
    text: (s) => `In the beginning there was only the grey sea, endless and dreaming. Then a will moved upon the water — yours. The waves drew back, and ${s.worldName} broke the surface like a held breath finally let go. A handful of mortals knelt on the new shore, looked up, and gave the silence a name: ${s.godName}. They do not yet know what you are. Neither, perhaps, do you. But every time their god grows stronger, so will their world.`,
  },
  {
    id: "firstblood", title: "II · First Devotion",
    cond: (s) => s.counted >= 1,
    text: (s) => `Your first true act of will reached the shore. The people felt it in their bones — a heat, a certainty. They built a fire that night and did not let it go out. Word of ${s.godName} began to travel on the wind. A god who shows up, they whisper, is a god worth following.`,
  },
  {
    id: "bronze", title: "III · The Age of Fire",
    cond: (s) => s.era >= 1,
    text: () => `The forges took their first breath. Bronze poured into molds, fields were broken and sown, and the village became something with walls and intention. Your people stopped merely surviving. They began to build — because you did.`,
  },
  {
    id: "iron", title: "IV · The Iron Promise",
    cond: (s) => s.era >= 2,
    text: (s) => `Iron changed everything. Your name was no longer spoken only by ${s.worldName} — it crossed water now, carried by traders and feared by rival gods. With iron came choice: a god this strong could lift a single mortal above all the rest, and let them shine. The first Champion could now be crowned.`,
  },
  {
    id: "firstconquest", title: "V · The First Throne Taken",
    cond: (s) => s.conquered >= 1,
    text: (s) => `For the first time, another god knelt. Their people, once strangers, now whisper ${s.godName} at their own hearths. An empire is not given. It is taken, one war at a time, by a god who keeps coming back stronger.`,
  },
  {
    id: "champion", title: "VI · The Chosen Rises",
    cond: (s) => s.champions >= 1,
    text: (s) => `You reached down into the crowd and lifted one mortal into legend. Where once there was a face in the throng, now there is a name carved in stone, a hero who will outlive every age and rule in your name. The people no longer only fear ${s.godName}. They have someone to follow into the light.`,
  },
  {
    id: "classical", title: "VII · Temples in the Light",
    cond: (s) => s.era >= 3,
    text: () => `White stone and golden roofs. Your temples crown the high places now, and pilgrims walk for weeks to stand in their shade. An age of philosophers, athletes, and priests — all of them, in the end, yours.`,
  },
  {
    id: "medieval", title: "VIII · Banners and Crusades",
    cond: (s) => s.era >= 4,
    text: (s) => `The age of the banner. Knights ride out beneath the colors of ${s.worldName}, and your Champions lead them. War becomes ritual, and faith becomes a fortress no rival god can breach.`,
  },
  {
    id: "halfmap", title: "IX · Half a World Kneels",
    cond: (s) => s.conquered >= 5,
    text: (s) => `Five gods undone. Half the known map answers to one name. The old gods, who once laughed at the rock rising from the sea, have stopped laughing. They are watching ${s.godName} now, and they are afraid.`,
  },
  {
    id: "ascension", title: "X · The God Among Gods",
    cond: (s) => s.era >= 10,
    text: (s) => `You have Ascended. There is no era beyond this one — only the finishing of the map. ${s.worldName} blazes like a second sun, and your Champions stand immortal at your side. One throne remains: the Dominion of the Old Gods, who made this world and never dreamed it would make you. Take it, and the saga is complete.`,
  },
  {
    id: "finished", title: "XI · The Last Throne",
    cond: (s) => s.conquered >= NATIONS.length,
    text: (s) => `Every god has knelt. Every nation flies your banner. The Old Gods are silent, and the world they built belongs to ${s.godName} alone. There is nothing left to conquer — only to be worshipped, forever, by a world you raised from the grey sea with your own two hands. The Saga of ${s.worldName} is complete. But the gym, of course, is open tomorrow.`,
  },
];

// ---------- CHOSEN / CHAMPION DATA ----------
const CHOSEN_TRAITS = {
  warrior: { epithets: ["the Ironhanded", "Shieldbearer", "the Unbroken", "the Red Wolf"], bonusLabel: "+60 War Strength", color: "#c4453c",
    story: (n, w) => `${n} was the first to pick up a blade when raiders came for ${w}. They have not put it down since. Where ${n} stands, the line holds.` },
  prophet: { epithets: ["the Devout", "Star-touched", "Lightbringer", "the Whisperer"], bonusLabel: "+12 Power per workout", color: "#f0b541",
    story: (n, w) => `${n} heard your voice in a dream before anyone knew your name. Now they lead the prayers of ${w}, and every devotion burns a little brighter.` },
  mason: { epithets: ["the Builder", "Stonewright", "Hammerhand", "the Patient"], bonusLabel: "−15% building cost", color: "#9aa3ad",
    story: (n, w) => `${n} can look at a hill and see the temple it wants to become. Under their hands, the stones of ${w} rise faster and cost less.` },
  shepherd: { epithets: ["the Shepherd", "Keeper of Hearths", "the Gentle", "Field-friend"], bonusLabel: "+4 people in your world", color: "#7ee08a",
    story: (n, w) => `${n} knows every family in ${w} by name. Where ${n} walks, more children are born, more hearths are lit, and the village grows.` },
};
const TRAIT_ORDER = ["warrior", "prophet", "mason", "shepherd"];
const FIRST_NAMES = ["Bren", "Kael", "Soren", "Mira", "Thane", "Ola", "Dax", "Vesh", "Ryn", "Tamsin", "Goro", "Esca", "Hild", "Pax", "Juno", "Wren", "Castor", "Nael", "Oru", "Sable", "Yara", "Dorn", "Lio", "Fenn"];

// ---------- HELPERS ----------
const todayStr = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function eraIndexFor(count) {
  let idx = 0;
  for (let i = 0; i < ERAS.length; i++) if (count >= ERAS[i].need) idx = i;
  return idx;
}

// generate a stable Chosen by index for this world
function makeChosen(worldSeed, index) {
  const rand = mulberry32(worldSeed + index * 9973 + 17);
  const name = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
  const trait = TRAIT_ORDER[index % TRAIT_ORDER.length];
  const ep = CHOSEN_TRAITS[trait].epithets;
  const epithet = ep[Math.floor(rand() * ep.length)];
  return { cid: `c${index}`, name, trait, epithet };
}

function buildChosenPool(worldSeed, count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(makeChosen(worldSeed, i));
  return out;
}

// ---------- WEEK KEY (ISO week, computed from a YYYY-MM-DD string) ----------
function isoWeekKey(str) {
  const [y, m, d] = str.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThu = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((date - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

// ---------- WEEKLY DECREES ----------
const DECREE_POOL = [
  { id: "show3", bucket: "attend", text: "Train 3 days this week", reward: 100, check: (w) => w.days >= 3 },
  { id: "show4", bucket: "attend", text: "Train 4 days this week", reward: 170, check: (w) => w.days >= 4 },
  { id: "b2b", bucket: "attend", text: "Train two days back-to-back", reward: 100, check: (w) => w.backToBack },
  { id: "pr", bucket: "quality", text: "Set a new personal record", reward: 120, check: (w) => w.prThisWeek },
  { id: "variety", bucket: "quality", text: "Complete two different sessions", reward: 90, check: (w) => w.distinctSessions >= 2 },
  { id: "bank", bucket: "quality", text: "Bank 300 Power this week", reward: 110, check: (w) => w.powerThisWeek >= 300 },
];
function rollDecrees(seed) {
  const attend = DECREE_POOL.filter((d) => d.bucket === "attend");
  const quality = DECREE_POOL.filter((d) => d.bucket === "quality");
  const r = mulberry32(seed);
  return [attend[Math.floor(r() * attend.length)].id, quality[Math.floor(r() * quality.length)].id];
}
function weekStatsFor(workouts) {
  const wk = isoWeekKey(todayStr());
  const week = workouts.filter((w) => w.counted && isoWeekKey(w.date) === wk);
  const dates = [...new Set(week.map((w) => w.date))].sort();
  let backToBack = false;
  for (let i = 1; i < dates.length; i++) if (daysBetween(dates[i - 1], dates[i]) === 1) backToBack = true;
  return {
    days: dates.length,
    prThisWeek: week.some((w) => w.prs && w.prs.length > 0),
    distinctSessions: new Set(week.map((w) => w.type)).size,
    powerThisWeek: week.reduce((s, w) => s + (w.power || 0), 0),
    backToBack,
  };
}

// ---------- BLOODLINES ----------
const HOUSE_NAMES = ["Emberfell", "Ironvale", "Stormcrest", "Ashmoor", "Goldhelm", "Thornwood", "Wyrmstone", "Hollowmere", "Brightwater", "Ravenhold", "Drakemont", "Sunspear", "Coldforge", "Mossgrave", "Highwind"];
const LIFESPAN = 3; // eras a head reigns before passing the throne to an heir
function ordinal(n) { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }

// per-champion bonus, scaling with the generation of the bloodline
function champLabel(c) {
  const g = c.gen || 1;
  if (c.trait === "warrior") return `+${60 + (g - 1) * 15} War Strength`;
  if (c.trait === "prophet") return `+${12 + (g - 1) * 3} Power per workout`;
  if (c.trait === "mason") return `−${Math.round((1 - Math.max(0.6, 0.85 - (g - 1) * 0.03)) * 100)}% building cost`;
  return `+${4 + (g - 1)} people in your world`;
}
function champBonuses(champions) {
  let war = 0, prophet = 0, shepherdV = 0, masonFactor = 1;
  (champions || []).forEach((c) => {
    const g = c.gen || 1;
    if (c.trait === "warrior") war += 60 + (g - 1) * 15;
    else if (c.trait === "prophet") prophet += 12 + (g - 1) * 3;
    else if (c.trait === "shepherd") shepherdV += 4 + (g - 1);
    else if (c.trait === "mason") masonFactor *= Math.max(0.6, 0.85 - (g - 1) * 0.03);
  });
  return { war, prophet, shepherdV, masonFactor };
}
function epitaphFor(c) {
  const lines = {
    warrior: `${c.name} of House ${c.surname} never lost a war they meant to win.`,
    prophet: `${c.name} of House ${c.surname} heard the god clearer than any before, and lit the way.`,
    mason: `${c.name} of House ${c.surname} left a world built in stone that will outlast them all.`,
    shepherd: `${c.name} of House ${c.surname} knew every name, and was mourned by every hearth.`,
  };
  return lines[c.trait] || `${c.name} of House ${c.surname} reigned well, and passed in peace.`;
}
// advance every reigning champion through the eras gained; pass the throne to heirs as needed
function ageBloodlines(champions, legacies, fromEra, toEra, seed) {
  let champs = (champions || []).map((c) => ({ ...c }));
  const legs = [...(legacies || [])];
  const events = [];
  for (let e = fromEra + 1; e <= toEra; e++) {
    champs = champs.map((c) => {
      const reign = (c.reign || 0) + 1;
      if (reign >= LIFESPAN) {
        const g = (c.gen || 1) + 1;
        const r = mulberry32(seed + hashStr(c.line + ":" + g));
        const heirName = FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)];
        const eps = CHOSEN_TRAITS[c.trait].epithets;
        const heirEp = eps[Math.floor(r() * eps.length)];
        legs.push({ line: c.line, surname: c.surname, name: c.name, epithet: c.epithet, trait: c.trait, gen: c.gen || 1, fromEra: c.bornEra ?? fromEra, toEra: e, epitaph: epitaphFor(c) });
        events.push(`⚰️ ${c.name} ${c.epithet} of House ${c.surname} passes into legend. ${heirName}, ${ordinal(g)}-generation heir, takes the throne.`);
        return { ...c, name: heirName, epithet: heirEp, gen: g, reign: 0, bornEra: e };
      }
      return { ...c, reign };
    });
  }
  return { champions: champs, legacies: legs, events };
}

// ---------- DISCIPLINES (muscle-group → empire mapping) ----------
const DISCIPLINES = [
  { id: "legs", name: "Legions", focus: "Legs", icon: "🦵", color: "#7ee08a", reward: "War Strength", per: 15 },
  { id: "push", name: "Siege", focus: "Push", icon: "💥", color: "#c4453c", reward: "War Strength", per: 12 },
  { id: "pull", name: "Bulwark", focus: "Pull", icon: "🛡", color: "#5fb3c9", reward: "Power / workout", per: 5 },
  { id: "core", name: "Discipline", focus: "Core", icon: "🧘", color: "#f0b541", reward: "Power / workout", per: 3 },
];
const FOCUS_IDS = ["legs", "push", "pull", "core"];
function focusFromTag(tag) {
  const t = (tag || "").toUpperCase();
  if (t === "LEGS") return "legs";
  if (t === "PUSH") return "push";
  if (t === "PULL") return "pull";
  return "core";
}
function sessionFocus(s) { return (s && FOCUS_IDS.includes(s.focus)) ? s.focus : focusFromTag(s && s.tag); }
function discLevel(count) { return Math.min(10, Math.floor(count / 3)); }

// ---------- DIVINE POWERS (spend Power to act, not just build) ----------
const POWERS = [
  { id: "vigor", name: "Blessing of Vigor", icon: "✨", cost: 150, color: "#f0b541", cooldownDays: 0, desc: "Your next counted workout earns +50% Power." },
  { id: "smite", name: "Smite a Rival", icon: "⚡", cost: 250, color: "#c4453c", cooldownDays: 0, desc: "Permanently crack one rival nation's defenses by 20%." },
  { id: "golden", name: "Golden Age", icon: "🌅", cost: 400, color: "#d9a441", cooldownDays: 7, desc: "Declare a festival and reap a surge of Power now." },
  { id: "muse", name: "Divine Inspiration", icon: "🎲", cost: 120, color: "#7d5ba6", cooldownDays: 0, desc: "Reroll this week's Decrees for a fresh pair." },
];

// ---------- RELICS (one per conquered nation; a collection with bonuses) ----------
const RELICS = {
  mosskin: { name: "Root Crown", icon: "🌿", bonus: { power: 3 }, flavor: "A circlet of living moss, still growing." },
  ashen: { name: "Ember Heart", icon: "🔥", bonus: { war: 30 }, flavor: "A coal that has never cooled." },
  river: { name: "Drowned Pearl", icon: "🫧", bonus: { tribute: 5 }, flavor: "It weeps a single drop of seawater each dawn." },
  duneborn: { name: "Endless Coffer", icon: "🪙", bonus: { power: 6, tribute: 4 }, flavor: "However much you take, it is never empty." },
  frosthold: { name: "Glacier Shard", icon: "❄️", bonus: { grace: 1, war: 30 }, flavor: "Cold enough to still time itself." },
  jade: { name: "Serpent Coil", icon: "🐍", bonus: { war: 60 }, flavor: "It tightens when war is near." },
  legion: { name: "God-Gear", icon: "⚙️", bonus: { war: 80 }, flavor: "A cog from a god that was also a machine." },
  storm: { name: "Thunder Arm", icon: "🌩", bonus: { war: 70, power: 6 }, flavor: "The throwing arm of a thunder god." },
  obsidian: { name: "Black Mirror", icon: "🪞", bonus: { power: 12 }, flavor: "It shows you the god you are becoming." },
  oldgods: { name: "The Nameless Sigil", icon: "👁", bonus: { war: 120, power: 20 }, flavor: "The mark of those who made the world." },
};
function relicBonuses(conquered, eternal) {
  let war = 0, power = 0, tribute = 0, grace = 0;
  (conquered || []).forEach((id) => { const r = RELICS[id]; if (r && r.bonus) { war += r.bonus.war || 0; power += r.bonus.power || 0; tribute += r.bonus.tribute || 0; grace += r.bonus.grace || 0; } });
  (eternal || []).forEach((id) => { const r = RELICS[id]; if (r && r.bonus) { war += 2 * (r.bonus.war || 0); power += 2 * (r.bonus.power || 0); tribute += 2 * (r.bonus.tribute || 0); grace += 2 * (r.bonus.grace || 0); } });
  const complete = NATIONS.every((n) => (conquered || []).includes(n.id));
  if (complete) { war += 200; power += 40; }
  return { war, power, tribute, grace, complete, eternalCount: (eternal || []).length };
}

// ---------- WONDERS (one-time grand projects; big bonuses + unique art) ----------
const WONDERS = [
  { id: "flame", name: "The Eternal Flame", icon: "🔥", era: 2, cost: 1800, color: "#e0843a", desc: "A fire that never dies. Every counted workout earns +15% Power.", effect: "+15% Power on every workout" },
  { id: "colossus", name: "The Colossus", icon: "🗿", era: 3, cost: 2600, color: "#c9b98a", desc: "A titan of bronze raised in your likeness.", effect: "+160 War Strength" },
  { id: "worldtree", name: "The World Tree", icon: "🌳", era: 5, cost: 3400, color: "#7ee08a", desc: "Roots that cradle the whole island.", effect: "+22 Power / workout · +4 people" },
  { id: "spire", name: "The Sky Spire", icon: "🗼", era: 7, cost: 4400, color: "#5fb3c9", desc: "A tower that scrapes the floor of heaven.", effect: "+180 War Strength · +3 grace days" },
];
function wonderBonuses(w) {
  w = w || {};
  return {
    war: (w.colossus ? 160 : 0) + (w.spire ? 180 : 0),
    power: (w.worldtree ? 22 : 0),
    grace: (w.spire ? 3 : 0),
    villagers: (w.worldtree ? 4 : 0),
    mult: w.flame ? 1.15 : 1,
  };
}

const DEFAULT_STATE = {
  godName: "", worldName: "", banner: BANNER_COLORS[0],
  power: 0, workouts: [], conquered: [], bestLifts: {}, log: [], momentum: 0,
  startDate: null,
  // systems added in v2:
  sessions: null,        // editable program (seeded from PRESET_SESSIONS)
  buildings: {},         // { forge: lvl, shrine: lvl, longhouse: lvl, ward: lvl }
  saga: [],              // unlocked chapter ids
  champions: [],         // [{ cid, name, trait, epithet, era, date, line, gen, surname, reign, bornEra }]
  chosen: [],            // candidate pool
  worldSeed: 0,
  // systems added in v3:
  bestStreak: 0,         // longest session streak ever
  decrees: null,         // { week, ids:[], claimed:{} }
  legacies: [],          // past bloodline heads who have passed into legend
  powers: { blessing: false, smited: {}, cooldowns: {} }, // divine powers
  wonders: {},           // one-time grand projects { id: true }
  prestige: 0,           // New Age count (conquest layer prestige)
  eternalRelics: [],     // relics carried across New Ages (double bonus, permanent)
  settings: { discordWebhook: "", sound: true }, // integrations + audio
};

// migrate any older save so existing progress is never lost
function migrate(s) {
  const seed = s.worldSeed || hashStr((s.godName || "") + "::" + (s.worldName || "") + "::seed");
  const base = {
    ...DEFAULT_STATE, ...s,
    buildings: s.buildings || {},
    saga: s.saga || [],
    champions: (s.champions || []).map((c, i) => ({
      ...c,
      line: c.line || `L0${i}`,
      gen: c.gen || 1,
      surname: c.surname || HOUSE_NAMES[(c.cid ? hashStr(c.cid) : i) % HOUSE_NAMES.length],
      reign: c.reign || 0,
      bornEra: c.bornEra ?? (c.era || 0),
      founderName: c.founderName || c.name,
    })),
    legacies: s.legacies || [],
    bestStreak: s.bestStreak || s.momentum || 0,
    decrees: s.decrees || null,
    powers: s.powers || { blessing: false, smited: {}, cooldowns: {} },
    wonders: s.wonders || {},
    prestige: s.prestige || 0,
    eternalRelics: s.eternalRelics || [],
    settings: s.settings || { discordWebhook: "", sound: true },
    sessions: s.sessions || PRESET_SESSIONS.map((x) => JSON.parse(JSON.stringify(x))),
    worldSeed: seed,
  };
  // attribute a discipline focus to historical workouts where possible
  const sessList = base.sessions || [];
  base.workouts = (base.workouts || []).map((w) => {
    if (w.focus && FOCUS_IDS.includes(w.focus)) return w;
    const src = sessList.find((s) => s.name === w.type);
    return { ...w, focus: src ? sessionFocus(src) : focusFromTag(null) };
  });
  if (!base.chosen || base.chosen.length === 0) base.chosen = buildChosenPool(seed, 4);
  return base;
}

// ---------- WORLD CANVAS ----------
function WorldCanvas({ state, dormant }) {
  const canvasRef = useRef(null);
  const villagersRef = useRef([]);
  const counted = state.workouts.filter((w) => w.counted).length;
  const era = eraIndexFor(counted);
  const conqueredCount = state.conquered.length;
  const B = state.buildings || {};
  const champCount = (state.champions || []).length;
  const bKey = `${B.forge || 0}-${B.shrine || 0}-${B.longhouse || 0}-${B.ward || 0}-${Object.keys(state.wonders || {}).filter((k) => state.wonders[k]).sort().join(",")}`;
  const shepherds = champBonuses(state.champions).shepherdV + wonderBonuses(state.wonders).villagers;

  // build tile map (deterministic per era + conquests + buildings + champions)
  const tiles = useMemo(() => {
    const W = 26, H = 16;
    const rand = mulberry32(1337 + era * 7 + conqueredCount * 31 + hashStr(bKey) % 1000);
    const grid = [];
    const cx = W / 2, cy = H / 2;
    const radius = 3.4 + era * 0.62;
    for (let y = 0; y < H; y++) {
      const row = [];
      for (let x = 0; x < W; x++) {
        const dx = (x - cx) / 1.45, dy = y - cy;
        const d = Math.sqrt(dx * dx + dy * dy) + (rand() - 0.5) * 1.6;
        if (d < radius - 1.4) {
          const r = rand();
          if (r < 0.10 + era * 0.005) row.push("mountain");
          else if (r < 0.30) row.push("forest");
          else if (era >= 1 && r < 0.38) row.push("farm");
          else row.push("grass");
        } else if (d < radius) row.push("sand");
        else row.push("water");
      }
      grid.push(row);
    }
    // structures on grass
    const placeOn = (type, n, base = "grass") => {
      let placed = 0, guard = 0;
      while (placed < n && guard++ < 800) {
        const x = Math.floor(rand() * W), y = Math.floor(rand() * H);
        if (grid[y][x] === base) { grid[y][x] = type; placed++; }
      }
    };
    placeOn("house", 2 + era * 2);
    if (era >= 3) grid[Math.round(cy)][Math.round(cx)] = "temple";
    if (era >= 6) placeOn("tower", 1 + Math.floor((era - 6) / 1.5));
    if (era >= 9) placeOn("rocket", 1);
    // player-built upgrades
    if ((B.forge || 0) > 0) placeOn("forge", 1);
    placeOn("obelisk", Math.min(B.shrine || 0, 4));
    placeOn("longhouse", Math.min(B.longhouse || 0, 6));
    if ((B.ward || 0) > 0) placeOn("wardstone", Math.min((B.ward || 0) * 3, 12), "sand");
    // wonders (one-time grand projects)
    const wn = state.wonders || {};
    if (wn.flame) placeOn("w_flame", 1);
    if (wn.colossus) placeOn("w_colossus", 1);
    if (wn.worldtree) placeOn("w_worldtree", 1);
    if (wn.spire) placeOn("w_spire", 1);
    // champion homes near the temple/center
    const champSpots = [[Math.round(cx) - 2, Math.round(cy)], [Math.round(cx) + 2, Math.round(cy)], [Math.round(cx), Math.round(cy) - 2], [Math.round(cx), Math.round(cy) + 2]];
    (state.champions || []).slice(0, 4).forEach((c, i) => {
      const [sx, sy] = champSpots[i % champSpots.length];
      if (grid[sy] && grid[sy][sx] !== undefined && grid[sy][sx] !== "water" && grid[sy][sx] !== "temple") {
        grid[sy][sx] = { t: "champhome", c: state.banner };
      }
    });
    // conquered satellite islands in corners/edges
    const spots = [
      [2, 2], [W - 3, 2], [2, H - 3], [W - 3, H - 3], [Math.floor(cx), 1],
      [Math.floor(cx), H - 2], [1, Math.floor(cy)], [W - 2, Math.floor(cy)],
      [4, 1], [W - 5, H - 2],
    ];
    state.conquered.forEach((id, i) => {
      const nation = NATIONS.find((n) => n.id === id);
      const [sx, sy] = spots[i % spots.length];
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const x = sx + ox, y = sy + oy;
        if (x >= 0 && x < W && y >= 0 && y < H && grid[y][x] === "water")
          grid[y][x] = { t: "colony", c: nation.color };
      }
      if (grid[sy] && grid[sy][sx]) grid[sy][sx] = { t: "flag", c: nation.color };
    });
    return grid;
  }, [era, conqueredCount, state.conquered, bKey, champCount, state.banner]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const W = 26, H = 16, T = 28;
    cvs.width = W * T; cvs.height = H * T;
    ctx.imageSmoothingEnabled = false;

    // spawn villagers on land
    const landCells = [];
    tiles.forEach((row, y) => row.forEach((t, x) => {
      if (t === "grass" || t === "farm" || t === "sand") landCells.push([x, y]);
    }));
    const vCount = Math.min(44, 3 + era * 2 + conqueredCount + (B.longhouse || 0) * 2 + champCount + shepherds);
    const rand = mulberry32(99 + era + (B.longhouse || 0) * 13);
    villagersRef.current = Array.from({ length: vCount }, () => {
      const [x, y] = landCells[Math.floor(rand() * landCells.length)] || [13, 8];
      return { x: x + 0.5, y: y + 0.5, tx: x + 0.5, ty: y + 0.5, hue: rand() };
    });

    let raf, last = 0;
    const COLORS = {
      water: "#1d3a52", water2: "#234561", sand: "#cdb87b", grass: "#4a7c43",
      grass2: "#54894c", forest: "#2f5e33", mountain: "#8a8578", farm: "#a8913f",
    };

    function draw(ts) {
      const tick = Math.floor(ts / 600);
      ctx.fillStyle = "#0b0e14";
      ctx.fillRect(0, 0, cvs.width, cvs.height);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const t = tiles[y][x];
        const px = x * T, py = y * T;
        if (t === "water") {
          ctx.fillStyle = (x + y + tick) % 7 === 0 ? COLORS.water2 : COLORS.water;
          ctx.fillRect(px, py, T, T);
        } else if (t === "sand") { ctx.fillStyle = COLORS.sand; ctx.fillRect(px, py, T, T); }
        else if (t === "grass") { ctx.fillStyle = (x * 3 + y) % 5 === 0 ? COLORS.grass2 : COLORS.grass; ctx.fillRect(px, py, T, T); }
        else if (t === "forest") {
          ctx.fillStyle = COLORS.grass; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = COLORS.forest; ctx.fillRect(px + 6, py + 8, 16, 14);
          ctx.fillRect(px + 10, py + 3, 8, 8);
          ctx.fillStyle = "#5a3d22"; ctx.fillRect(px + 12, py + 22, 4, 5);
        } else if (t === "mountain") {
          ctx.fillStyle = COLORS.grass; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = COLORS.mountain;
          ctx.beginPath(); ctx.moveTo(px + 3, py + 25); ctx.lineTo(px + 14, py + 4); ctx.lineTo(px + 25, py + 25); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#e8e0cc"; ctx.fillRect(px + 11, py + 5, 6, 5);
        } else if (t === "farm") {
          ctx.fillStyle = COLORS.farm; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = "#8a7430";
          for (let i = 0; i < 4; i++) ctx.fillRect(px, py + 3 + i * 7, T, 2);
        } else if (t === "house") {
          ctx.fillStyle = COLORS.grass; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = "#8a6a4a"; ctx.fillRect(px + 5, py + 12, 18, 12);
          ctx.fillStyle = "#b5443a";
          ctx.beginPath(); ctx.moveTo(px + 3, py + 13); ctx.lineTo(px + 14, py + 4); ctx.lineTo(px + 25, py + 13); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#f5d97e"; ctx.fillRect(px + 12, py + 17, 4, 4);
        } else if (t === "longhouse") {
          ctx.fillStyle = COLORS.grass; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = "#7a5a3c"; ctx.fillRect(px + 2, py + 12, 24, 13);
          ctx.fillStyle = "#9c7a4a";
          ctx.beginPath(); ctx.moveTo(px + 1, py + 13); ctx.lineTo(px + 14, py + 3); ctx.lineTo(px + 27, py + 13); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#f5d97e"; ctx.fillRect(px + 6, py + 17, 3, 4); ctx.fillRect(px + 18, py + 17, 3, 4);
        } else if (t === "forge") {
          ctx.fillStyle = COLORS.grass; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = "#3a3a40"; ctx.fillRect(px + 4, py + 10, 20, 14);
          ctx.fillStyle = "#1a1a1f"; ctx.fillRect(px + 16, py + 4, 5, 8); // chimney
          // glowing forge mouth + flicker
          ctx.fillStyle = tick % 2 ? "#f0b541" : "#c4453c"; ctx.fillRect(px + 7, py + 15, 8, 7);
          ctx.fillStyle = "#ffe6a0"; ctx.fillRect(px + 9, py + 17, 4, 3);
          ctx.fillStyle = tick % 2 ? "#5a5a60" : "#6a6a70"; ctx.fillRect(px + 16, py - 1, 5, 4); // smoke
        } else if (t === "obelisk") {
          ctx.fillStyle = COLORS.grass; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = state.banner; ctx.fillRect(px + 10, py + 4, 8, 20);
          ctx.fillStyle = "#0b0e14"; ctx.fillRect(px + 13, py + 10, 2, 8);
          ctx.fillStyle = "#fff3c4"; ctx.fillRect(px + 11, py + 1, 6, 4); // gold tip
        } else if (t === "wardstone") {
          ctx.fillStyle = COLORS.sand; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = "#6a7280"; ctx.fillRect(px + 9, py + 8, 10, 16);
          ctx.fillStyle = "#8a93a3"; ctx.fillRect(px + 11, py + 6, 6, 4);
          ctx.fillStyle = tick % 2 ? "#5fb3c9" : "#3d7f93"; ctx.fillRect(px + 12, py + 12, 4, 4); // rune glow
        } else if (t === "temple") {
          ctx.fillStyle = COLORS.grass; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = state.banner; ctx.fillRect(px + 4, py + 8, 20, 16);
          ctx.fillStyle = "#0b0e14"; ctx.fillRect(px + 11, py + 14, 6, 10);
          ctx.fillStyle = "#fff3c4"; ctx.fillRect(px + 12, py + 2, 4, 6);
        } else if (t === "tower") {
          ctx.fillStyle = COLORS.grass; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = "#6a6f7a"; ctx.fillRect(px + 9, py + 4, 10, 20);
          ctx.fillStyle = "#9aa3ad"; ctx.fillRect(px + 7, py + 2, 14, 4);
        } else if (t === "rocket") {
          ctx.fillStyle = COLORS.grass; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = "#d8dde4"; ctx.fillRect(px + 10, py + 4, 8, 16);
          ctx.beginPath(); ctx.moveTo(px + 10, py + 4); ctx.lineTo(px + 14, py - 2); ctx.lineTo(px + 18, py + 4); ctx.closePath(); ctx.fill();
          ctx.fillStyle = tick % 2 ? "#f0b541" : "#c4453c"; ctx.fillRect(px + 11, py + 20, 6, 5);
        } else if (t === "w_flame") {
          ctx.fillStyle = COLORS.grass; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = "#3a3a40"; ctx.fillRect(px + 8, py + 18, 12, 6); // brazier
          ctx.fillStyle = "#5a5a60"; ctx.fillRect(px + 12, py + 12, 4, 8);
          ctx.fillStyle = tick % 2 ? "#f0b541" : "#e0843a";
          ctx.beginPath(); ctx.moveTo(px + 8, py + 14); ctx.lineTo(px + 14, py - 2); ctx.lineTo(px + 20, py + 14); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#fff3c4"; ctx.beginPath(); ctx.moveTo(px + 11, py + 12); ctx.lineTo(px + 14, py + 3); ctx.lineTo(px + 17, py + 12); ctx.closePath(); ctx.fill();
        } else if (t === "w_colossus") {
          ctx.fillStyle = COLORS.grass; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = "#3a4250"; ctx.fillRect(px + 6, py + 24, 16, 3); // plinth
          ctx.fillStyle = "#c9b98a"; ctx.fillRect(px + 10, py + 6, 8, 18); // body
          ctx.fillRect(px + 5, py + 9, 5, 3); ctx.fillRect(px + 18, py + 9, 5, 3); // arms
          ctx.fillStyle = "#e0d6b3"; ctx.fillRect(px + 11, py + 1, 6, 6); // head
        } else if (t === "w_worldtree") {
          ctx.fillStyle = COLORS.grass; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = "#5a3d22"; ctx.fillRect(px + 12, py + 16, 5, 10); // trunk
          ctx.fillStyle = "#2f5e33"; ctx.beginPath(); ctx.arc(px + 14, py + 11, 12, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#3f7a43"; ctx.beginPath(); ctx.arc(px + 9, py + 9, 6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#7ee08a"; ctx.fillRect(px + 11, py + 6, 3, 3); ctx.fillRect(px + 17, py + 11, 3, 3);
        } else if (t === "w_spire") {
          ctx.fillStyle = COLORS.grass; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = "#5fb3c9";
          ctx.beginPath(); ctx.moveTo(px + 10, py + 26); ctx.lineTo(px + 14, py - 2); ctx.lineTo(px + 18, py + 26); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#0b0e14"; ctx.fillRect(px + 13, py + 12, 2, 10);
          ctx.fillStyle = tick % 2 ? "#fff3c4" : "#f0b541"; ctx.fillRect(px + 12, py - 4, 4, 4); // beacon
        } else if (t && t.t === "champhome") {
          ctx.fillStyle = COLORS.grass; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = "#5a3d22"; ctx.fillRect(px + 6, py + 12, 16, 12);
          ctx.fillStyle = t.c;
          ctx.beginPath(); ctx.moveTo(px + 4, py + 13); ctx.lineTo(px + 14, py + 4); ctx.lineTo(px + 24, py + 13); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#fff3c4"; ctx.fillRect(px + 12, py + 1, 4, 5); // star/crown spark
          ctx.fillStyle = (tick % 2) ? "#fff3c4" : t.c; ctx.fillRect(px + 12, py + 16, 4, 5);
        } else if (t && t.t === "colony") { ctx.fillStyle = "#3a4a3a"; ctx.fillRect(px, py, T, T); ctx.fillStyle = t.c + "55"; ctx.fillRect(px, py, T, T); }
        else if (t && t.t === "flag") {
          ctx.fillStyle = "#3a4a3a"; ctx.fillRect(px, py, T, T);
          ctx.fillStyle = "#5a3d22"; ctx.fillRect(px + 12, py + 5, 3, 19);
          ctx.fillStyle = t.c; ctx.fillRect(px + 15, py + 5, 10, 7);
        }
      }
      // villagers
      villagersRef.current.forEach((v) => {
        if (ts - last > 50) {
          if (Math.abs(v.x - v.tx) < 0.1 && Math.abs(v.y - v.ty) < 0.1) {
            const nx = v.x + (Math.random() * 4 - 2), ny = v.y + (Math.random() * 4 - 2);
            const gx = Math.floor(nx), gy = Math.floor(ny);
            const tt = tiles[gy] && tiles[gy][gx];
            if (tt && tt !== "water" && typeof tt === "string") { v.tx = nx; v.ty = ny; }
          }
          v.x += (v.tx - v.x) * 0.02; v.y += (v.ty - v.y) * 0.02;
        }
        ctx.fillStyle = "#1a1a1a"; ctx.fillRect(v.x * T - 3, v.y * T - 2, 6, 7);
        ctx.fillStyle = v.hue > 0.5 ? "#e8c49a" : "#c49a6a"; ctx.fillRect(v.x * T - 3, v.y * T - 6, 6, 5);
      });
      if (ts - last > 50) last = ts;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [tiles, era, conqueredCount, state.banner, bKey, champCount, shepherds]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%", display: "block", imageRendering: "pixelated",
        borderRadius: 10, border: "2px solid #2a3242",
        filter: dormant ? "grayscale(0.95) brightness(0.6)" : "none",
        transition: "filter 1.2s",
      }}
    />
  );
}

// ---------- MAIN APP ----------
export default function Ironworld() {
  const [state, setState] = useState(null); // null = loading
  const [tab, setTab] = useState("world");
  const [session, setSession] = useState(null); // active workout session id
  const [checks, setChecks] = useState({});
  const [weights, setWeights] = useState({});
  const [reward, setReward] = useState(null);
  const [battle, setBattle] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [editing, setEditing] = useState(null);     // session draft being edited/created
  const [crownOpen, setCrownOpen] = useState(false); // champion selection modal
  const [celebrate, setCelebrate] = useState(null);  // newly crowned champion
  const [readChapter, setReadChapter] = useState(null); // saga chapter open in modal
  const [sagaPing, setSagaPing] = useState(null);    // latest newly-unlocked chapter
  const [calOffset, setCalOffset] = useState(0);     // calendar month offset (0 = current)
  const [exportCode, setExportCode] = useState("");  // backup code shown to user
  const [importText, setImportText] = useState("");  // restore code pasted by user
  const [importMsg, setImportMsg] = useState("");    // restore status message
  const [confirmImport, setConfirmImport] = useState(false);
  const [smiteOpen, setSmiteOpen] = useState(false); // smite target picker
  const [prestigeOpen, setPrestigeOpen] = useState(false); // New Age relic picker
  const [shareImg, setShareImg] = useState(null);    // generated empire card data URL
  const [discordStatus, setDiscordStatus] = useState(""); // webhook test status
  const audioRef = useRef(null);                     // shared AudioContext for SFX

  // load save
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) { setState(migrate(JSON.parse(raw))); return; }
    } catch (e) { /* no save yet */ }
    setState({ ...DEFAULT_STATE });
  }, []);

  // persist
  const save = (next) => {
    setState(next);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(next)); } catch (e) { console.error("save failed", e); }
  };

  const addLog = (arr, text) => [{ date: todayStr(), text }, ...arr].slice(0, 60);

  // ---------- derived (declared before sync effect uses them) ----------
  const ready = !!state;
  const counted = ready ? state.workouts.filter((w) => w.counted).length : 0;
  const era = eraIndexFor(counted);
  const champions = ready ? (state.champions || []) : [];
  const stats = { counted, era, conquered: ready ? state.conquered.length : 0, champions: champions.length, godName: state?.godName, worldName: state?.worldName };

  // keep the Saga and Chosen pool in sync with progress (also retroactively on load)
  useEffect(() => {
    if (!state || !state.godName) return;
    const want = SAGA.filter((c) => c.cond(stats)).map((c) => c.id);
    const have = state.saga || [];
    const newIds = want.filter((id) => !have.includes(id));
    const houseLvl = (state.buildings && state.buildings.longhouse) || 0;
    const wantPool = 4 + houseLvl;
    const poolShort = (state.chosen || []).length < wantPool;
    if (newIds.length === 0 && !poolShort) return;
    let log = state.log;
    if (newIds.length > 0) log = [{ date: todayStr(), text: `📖 A new chapter is written in the Saga of ${state.worldName}.` }, ...log].slice(0, 60);
    const nextChosen = poolShort ? buildChosenPool(state.worldSeed, wantPool) : state.chosen;
    save({ ...state, saga: want, chosen: nextChosen, log });
    if (newIds.length > 0) setSagaPing(SAGA.find((c) => c.id === newIds[newIds.length - 1]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counted, era, stats.conquered, champions.length, ready, (state && state.buildings && state.buildings.longhouse)]);

  // battle animation stepper (kept above the early return to preserve hook order)
  useEffect(() => {
    if (!state || !battle || battle.done) return;
    if (battle.step >= battle.allLines.length) {
      if (battle.won) {
        const n = battle.nation;
        save({
          ...state, power: state.power - n.cost,
          conquered: [...state.conquered, n.id],
          log: addLog(state.log, `⚔️ ${n.name} CONQUERED. Their people now worship ${state.godName}. +${n.tribute} tribute per workout.`),
        });
        playSfx("conquest");
        postDiscord(`⚔️ **${state.godName}** has conquered **${battle.nation.name}**! ${battle.nation.god} kneels.`);
      }
      setBattle((b) => ({ ...b, done: true }));
      return;
    }
    const t = setTimeout(() => {
      setBattle((b) => b && ({ ...b, lines: [...b.lines, b.allLines[b.step]], step: b.step + 1 }));
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle]);

  // rotate Weekly Decrees when the week changes (kept above the early return)
  useEffect(() => {
    if (!state || !state.godName) return;
    const wk = isoWeekKey(todayStr());
    if (state.decrees && state.decrees.week === wk) return;
    save({ ...state, decrees: { week: wk, ids: rollDecrees(hashStr(state.worldSeed + wk)), claimed: {} } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, state && state.godName]);

  if (!state) return (
    <div style={{ minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0e14", color: "#e8e0cc", fontFamily: "monospace" }}>
      Raising the world from the sea...
    </div>
  );

  // ---------- more derived ----------
  const sessions = state.sessions || [];
  const B = state.buildings || {};
  const forgeLvl = B.forge || 0, shrineLvl = B.shrine || 0, houseLvl = B.longhouse || 0, wardLvl = B.ward || 0;
  const cb = champBonuses(champions);
  const buildDiscount = cb.masonFactor;

  // disciplines (muscle-group mapping)
  const discCount = { legs: 0, push: 0, pull: 0, core: 0 };
  state.workouts.forEach((w) => { if (w.counted && discCount[w.focus] !== undefined) discCount[w.focus]++; });
  const discLv = { legs: discLevel(discCount.legs), push: discLevel(discCount.push), pull: discLevel(discCount.pull), core: discLevel(discCount.core) };
  const discLevels = [discLv.legs, discLv.push, discLv.pull, discLv.core];
  const maxL = Math.max(...discLevels), minL = Math.min(...discLevels);
  const balance = maxL > 0 ? minL / maxL : 0;
  const balanceMult = 1 + 0.25 * balance;
  const discWar = Math.round((discLv.legs * 15 + discLv.push * 12) * balanceMult);
  const discPower = Math.round((discLv.pull * 5 + discLv.core * 3) * balanceMult);
  const discGrace = Math.floor(discLv.core / 2);

  // relics (from conquered nations + eternal relics carried across New Ages)
  const relicB = relicBonuses(state.conquered, state.eternalRelics);

  // wonders + prestige
  const wb = wonderBonuses(state.wonders);
  const prestige = state.prestige || 0;

  // divine powers
  const pw = state.powers || { blessing: false, smited: {}, cooldowns: {} };
  const powerReady = (p) => { const lu = pw.cooldowns && pw.cooldowns[p.id]; return !lu || daysBetween(lu, todayStr()) >= p.cooldownDays; };
  const effectiveDefense = (n) => Math.round(n.defense * (1 + 0.6 * prestige) * ((pw.smited && pw.smited[n.id]) || 1));

  const nextEra = ERAS[era + 1] || null;
  const momentumMult = 1 + Math.min(Math.max(state.momentum - 1, 0), 10) * 0.1;
  const armyPower = counted * 15 + era * 80 + state.momentum * 12 + forgeLvl * 25 + cb.war + discWar + relicB.war + wb.war;
  const shrineBonus = shrineLvl * 8 + cb.prophet + discPower + relicB.power + wb.power;
  const tributePerWorkout = Math.round(state.conquered.reduce((s, id) => s + (NATIONS.find((n) => n.id === id)?.tribute || 0), 0) * (1 + 0.3 * prestige)) + relicB.tribute;
  const momentumWindow = 3 + wardLvl + discGrace + relicB.grace + wb.grace;
  const lastW = state.workouts[state.workouts.length - 1];
  const dormant = lastW ? daysBetween(lastW.date, todayStr()) > (5 + wardLvl) : false;
  const trainedToday = state.workouts.some((w) => w.date === todayStr() && w.counted);

  // champion slots unlock at these eras; you may crown one per unlocked slot
  const CHAMP_SLOTS = [2, 5, 8, 10];
  const maxChampions = CHAMP_SLOTS.filter((e) => era >= e).length;
  const canCrown = champions.length < maxChampions;
  const nextSlotEra = CHAMP_SLOTS.find((e) => era < e);
  const crownCost = 400 * (champions.length + 1);
  const championedIds = champions.map((c) => c.cid);
  const availableChosen = (state.chosen || []).filter((c) => !championedIds.includes(c.cid));

  const buildCost = (b) => Math.round(b.base * Math.pow(b.growth, B[b.id] || 0) * buildDiscount);

  // streak + weekly decrees
  const currentStreak = state.momentum || 0;
  const bestStreak = Math.max(state.bestStreak || 0, currentStreak);
  const ws = weekStatsFor(state.workouts);
  const currentWeek = isoWeekKey(todayStr());
  const decrees = (state.decrees && state.decrees.week === currentWeek) ? state.decrees : { week: currentWeek, ids: rollDecrees(hashStr(state.worldSeed + currentWeek)), claimed: {} };
  const decreeList = decrees.ids.map((id) => DECREE_POOL.find((d) => d.id === id)).filter(Boolean);

  // ---------- INTEGRATIONS & FEEL (v6) ----------
  const setSetting = (patch) => save({ ...state, settings: { ...(state.settings || {}), ...patch } });

  const playSfx = (type) => {
    if (!(state.settings && state.settings.sound)) return;
    try {
      let ctx = audioRef.current;
      if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); audioRef.current = ctx; }
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const seqs = {
        done: [[440, 0]],
        pr: [[523, 0], [659, 0.08], [784, 0.16], [1047, 0.24]],
        era: [[523, 0], [784, 0.12], [1047, 0.26]],
        conquest: [[392, 0], [523, 0.1], [659, 0.2], [523, 0.32], [784, 0.44]],
        crown: [[659, 0], [880, 0.12], [1175, 0.26]],
        claim: [[784, 0], [1047, 0.08]],
        power: [[300, 0], [600, 0.1]],
        wonder: [[440, 0], [554, 0.1], [659, 0.2], [880, 0.32]],
      };
      const notes = seqs[type] || seqs.done;
      notes.forEach(([f, t]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "square"; o.frequency.value = f;
        o.connect(g); g.connect(ctx.destination);
        const s = now + t;
        g.gain.setValueAtTime(0.0001, s);
        g.gain.exponentialRampToValueAtTime(0.12, s + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, s + 0.13);
        o.start(s); o.stop(s + 0.14);
      });
    } catch (e) { /* audio not available */ }
  };

  const validWebhook = (url) => /^https:\/\/(discord|discordapp)\.com\/api\/webhooks\//.test((url || "").trim());
  const postDiscord = (content) => {
    const url = state.settings && state.settings.discordWebhook;
    if (!validWebhook(url)) return;
    try {
      fetch(url.trim(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, username: `${state.worldName} · IronWorld` }) }).catch(() => {});
    } catch (e) { /* ignore */ }
  };
  const sendTestDiscord = async () => {
    const url = state.settings && state.settings.discordWebhook;
    if (!(url && url.trim())) { setDiscordStatus("Paste your webhook URL first."); return; }
    if (!validWebhook(url)) { setDiscordStatus("That doesn't look like a Discord webhook URL."); return; }
    setDiscordStatus("Sending…");
    try {
      const r = await fetch(url.trim(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: `🌍 **${state.worldName}** is now linked. ${state.godName} will report each training session here.`, username: `${state.worldName} · IronWorld` }) });
      setDiscordStatus(r.ok ? "Sent — check your Discord channel." : `Discord returned ${r.status}.`);
    } catch (e) { setDiscordStatus("Couldn't reach Discord (network/CORS). The URL is still saved."); }
  };

  const makeShareCard = () => {
    const W = 600, H = 360;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d");
    x.fillStyle = "#0b0e14"; x.fillRect(0, 0, W, H);
    x.strokeStyle = state.banner; x.lineWidth = 6; x.strokeRect(7, 7, W - 14, H - 14);
    x.fillStyle = state.banner; x.font = "bold 32px monospace"; x.fillText(state.worldName.toUpperCase().slice(0, 18), 28, 54);
    x.fillStyle = "#9aa3ad"; x.font = "15px monospace";
    x.fillText(`Realm of ${state.godName}${prestige > 0 ? `  ·  Age ${ordinal(prestige + 1)}` : ""}`.slice(0, 46), 28, 80);
    const src = typeof document !== "undefined" ? document.querySelector("canvas") : null;
    if (src) { try { x.drawImage(src, 312, 96, 260, 160); x.strokeStyle = "#2a3242"; x.lineWidth = 2; x.strokeRect(312, 96, 260, 160); } catch (e) {} }
    const rows = [["Era", ERAS[era].name], ["Sessions", String(counted)], ["Streak", `${currentStreak} (best ${bestStreak})`], ["Nations", `${state.conquered.length}/${NATIONS.length}`], ["Champions", String(champions.length)], ["War Strength", String(armyPower)]];
    x.font = "17px monospace";
    rows.forEach(([k, v], i) => { const yy = 120 + i * 34; x.fillStyle = "#6a7280"; x.fillText(k, 28, yy); x.fillStyle = "#e8e0cc"; x.fillText(v, 168, yy); });
    x.fillStyle = state.banner; x.font = "bold 14px monospace"; x.fillText("⚔ IRONWORLD", 28, H - 24);
    try { setShareImg(c.toDataURL("image/png")); } catch (e) { setDiscordStatus("Couldn't generate the card."); }
  };

  // ---------- ACTIONS ----------
  const createWorld = (godName, worldName, banner) => {
    const gName = godName || "The Iron God";
    const wName = worldName || "Ironworld";
    const seed = hashStr(gName + "::" + wName + "::seed");
    save({
      ...DEFAULT_STATE,
      godName: gName, worldName: wName, banner, startDate: todayStr(),
      sessions: PRESET_SESSIONS.map((x) => JSON.parse(JSON.stringify(x))),
      worldSeed: seed,
      chosen: buildChosenPool(seed, 4),
      saga: ["genesis"],
      log: addLog([], "The world rises from the sea. A god opens their eyes."),
    });
    setReadChapter(SAGA[0]); // show opening lore
  };

  const completeWorkout = () => {
    const sess = sessions.find((s) => s.id === session);
    if (!sess) return;
    const isCounted = !trainedToday;
    let momentum = state.momentum;
    if (isCounted) {
      if (!lastW) momentum = 1;
      else momentum = daysBetween(lastW.date, todayStr()) <= momentumWindow ? momentum + 1 : 1;
    }
    const mult = 1 + Math.min(Math.max(momentum - 1, 0), 10) * 0.1;
    const prs = [];
    const bestLifts = { ...state.bestLifts };
    sess.exercises.forEach((ex) => {
      const w = parseFloat(weights[ex.name]);
      if (!isNaN(w) && w > 0) {
        if (!bestLifts[ex.name] || w > bestLifts[ex.name]) {
          if (bestLifts[ex.name]) prs.push({ name: ex.name, weight: w, old: bestLifts[ex.name] });
          bestLifts[ex.name] = w;
        }
      }
    });
    const base = Math.round(100 * mult);
    const prBonus = prs.length * 50;
    const shrineGain = isCounted ? shrineBonus : 0;
    const tribute = isCounted ? tributePerWorkout : 0;
    const blessed = isCounted && pw.blessing;
    const blessGain = blessed ? Math.round(base * 0.5) : 0;
    // comeback bonus: returning after a broken streak is a celebration, not a punishment
    let comeback = 0;
    if (isCounted && lastW) {
      const gap = daysBetween(lastW.date, todayStr());
      if (gap > momentumWindow && state.momentum >= 2) comeback = Math.min(300, gap * 20);
    }
    let gained;
    if (isCounted) {
      gained = Math.round((base + prBonus + tribute + shrineGain + blessGain) * wb.mult) + comeback;
    } else {
      gained = Math.round(base / 2) + prBonus;
    }
    const newCounted = counted + (isCounted ? 1 : 0);
    const newEraIdx = eraIndexFor(newCounted);
    const eraUp = newEraIdx > era;

    // bloodlines age each era; heads pass the throne to heirs
    let nextChampions = champions;
    let nextLegacies = state.legacies || [];
    let bloodEvents = [];
    if (eraUp && champions.length > 0) {
      const aged = ageBloodlines(champions, state.legacies || [], era, newEraIdx, state.worldSeed);
      nextChampions = aged.champions; nextLegacies = aged.legacies; bloodEvents = aged.events;
    }

    let log = state.log;
    log = addLog(log, `${sess.name} complete. +${gained} Power.`);
    prs.forEach((p) => { log = addLog(log, `⚡ A golden meteor falls! New record: ${p.name} ${p.weight}.`); });
    if (eraUp) log = addLog(log, `🏛 THE ${ERAS[newEraIdx].name.toUpperCase()} BEGINS. ${ERAS[newEraIdx].desc}`);
    bloodEvents.forEach((e) => { log = addLog(log, e); });
    if (blessed) log = addLog(log, "✨ The Blessing of Vigor pours through your training. +Power.");
    if (comeback > 0) log = addLog(log, `🎉 The people feared their god was gone. Your return is a festival — +${comeback} Power.`);
    if (isCounted && tributePerWorkout > 0) log = addLog(log, `Conquered nations pay ${tributePerWorkout} tribute.`);
    if (!isCounted) log = addLog(log, "Second session today — half Power, the world only ages once per day.");

    const nextMomentum = isCounted ? momentum : state.momentum;
    const next = {
      ...state,
      power: state.power + gained,
      workouts: [...state.workouts, { date: todayStr(), type: sess.name, focus: sessionFocus(sess), counted: isCounted, power: gained, prs: prs.map((p) => p.name) }],
      bestLifts, momentum: nextMomentum, log,
      bestStreak: Math.max(state.bestStreak || 0, nextMomentum),
      champions: nextChampions, legacies: nextLegacies,
      powers: blessed ? { ...pw, blessing: false } : pw,
    };
    save(next);
    playSfx(prs.length ? "pr" : "done");
    if (eraUp) playSfx("era");
    postDiscord(`⚡ **${state.godName}** trained — ${sess.name}. ${ERAS[newEraIdx].name} · +${gained} Power${prs.length ? ` · ${prs.length} new PR${prs.length > 1 ? "s" : ""} 🌟` : ""}${isCounted && nextMomentum >= 2 ? ` · ${nextMomentum}🔥` : ""}.`);
    if (eraUp) postDiscord(`🏛 **${state.worldName}** enters the **${ERAS[newEraIdx].name}**.`);
    setReward({ session: sess.name, gained, base, prs, prBonus, shrine: shrineGain, tribute, bless: blessGain, comeback, mult, eraUp: eraUp ? ERAS[newEraIdx] : null, counted: isCounted, momentum: nextMomentum, bloodEvents });
    setSession(null); setChecks({}); setWeights({});
  };

  // ----- program editor -----
  const blankSession = () => ({ id: `custom-${Date.now()}`, name: "", tag: "CUSTOM", focus: "core", blurb: "", exercises: [{ name: "", sets: "", note: "" }], custom: true });
  const saveSession = (draft) => {
    const clean = {
      ...draft,
      name: draft.name.trim() || "Untitled Session",
      focus: FOCUS_IDS.includes(draft.focus) ? draft.focus : "core",
      exercises: draft.exercises.filter((e) => e.name.trim()).map((e) => ({ name: e.name.trim(), sets: e.sets.trim(), note: e.note.trim() })),
    };
    if (clean.exercises.length === 0) clean.exercises = [{ name: "Exercise", sets: "", note: "" }];
    const exists = sessions.some((s) => s.id === clean.id);
    const nextSessions = exists ? sessions.map((s) => (s.id === clean.id ? clean : s)) : [...sessions, clean];
    save({ ...state, sessions: nextSessions });
    setEditing(null);
  };
  const deleteSession = (id) => {
    save({ ...state, sessions: sessions.filter((s) => s.id !== id) });
    setEditing(null);
  };

  // ----- build -----
  const buildUpgrade = (b) => {
    const cur = B[b.id] || 0;
    if (cur >= b.max) return;
    const cost = buildCost(b);
    if (state.power < cost) return;
    const nextB = { ...B, [b.id]: cur + 1 };
    save({
      ...state, power: state.power - cost, buildings: nextB,
      log: addLog(state.log, `🔨 ${b.name} raised to Lv.${cur + 1}. (${b.effect(cur + 1)})`),
    });
  };

  // ----- champions -----
  const crownChampion = (chosen) => {
    if (!canCrown || state.power < crownCost) return;
    const line = `L${Date.now()}`;
    const surname = HOUSE_NAMES[hashStr(line + chosen.cid) % HOUSE_NAMES.length];
    const champ = { cid: chosen.cid, name: chosen.name, trait: chosen.trait, epithet: chosen.epithet, era, date: todayStr(), line, gen: 1, surname, reign: 0, bornEra: era, founderName: chosen.name };
    save({
      ...state, power: state.power - crownCost,
      champions: [...champions, champ],
      log: addLog(state.log, `👑 ${chosen.name} ${chosen.epithet} founds House ${surname}, crowned Champion of ${state.worldName}. (${champLabel(champ)})`),
    });
    setCrownOpen(false);
    setCelebrate(champ);
    playSfx("crown");
    postDiscord(`👑 **${chosen.name} ${chosen.epithet}** is crowned Champion of ${state.worldName}, founding House ${surname}.`);
  };

  // ----- weekly decrees -----
  const claimDecree = (d) => {
    if (!d.check(ws) || (decrees.claimed && decrees.claimed[d.id])) return;
    playSfx("claim");
    save({
      ...state, power: state.power + d.reward,
      decrees: { ...decrees, claimed: { ...(decrees.claimed || {}), [d.id]: true } },
      log: addLog(state.log, `📜 Decree fulfilled: "${d.text}". +${d.reward} Power.`),
    });
  };

  // ----- backup / restore -----
  const exportSave = () => {
    try {
      const code = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
      setExportCode(code);
    } catch (e) { setExportCode(""); }
  };
  const copyExport = async () => {
    try { await navigator.clipboard.writeText(exportCode); setImportMsg("Backup code copied to clipboard."); }
    catch (e) { setImportMsg("Couldn't auto-copy — select the code and copy it manually."); }
  };
  const doImport = () => {
    try {
      const json = decodeURIComponent(escape(atob(importText.trim())));
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.workouts) || typeof parsed.godName !== "string") {
        setImportMsg("That doesn't look like a valid IronWorld backup."); setConfirmImport(false); return;
      }
      save(migrate(parsed));
      setImportMsg("World restored."); setImportText(""); setConfirmImport(false); setTab("world");
    } catch (e) {
      setImportMsg("Couldn't read that code. Make sure you pasted the whole thing."); setConfirmImport(false);
    }
  };

  const startBattle = (nation) => {
    const def = effectiveDefense(nation);
    const lines = [
      `Your armies sail for ${nation.name}...`,
      `${nation.god} answers with ${def} War Strength${def < nation.defense ? " (cracked by your smite)" : ""}.`,
      `Your empire marches with ${armyPower} War Strength.`,
    ];
    const won = armyPower >= def && state.power >= nation.cost;
    setBattle({ nation, lines: [], allLines: [...lines, won ? `The walls fall. ${nation.god} kneels.` : "Your forces are repelled..."], step: 0, done: false, won });
  };

  // ----- divine powers -----
  const castPower = (p) => {
    if (state.power < p.cost || !powerReady(p)) return;
    if (p.id === "smite") { setSmiteOpen(true); return; }
    playSfx("power");
    let next = { ...state };
    if (p.id === "vigor") {
      next.powers = { ...pw, blessing: true };
      next.power = state.power - p.cost;
      next.log = addLog(state.log, "✨ Blessing of Vigor cast. Your next session will burn brighter.");
    } else if (p.id === "golden") {
      const grant = Math.max(150, tributePerWorkout * 5 + era * 40);
      next.power = state.power - p.cost + grant;
      next.powers = { ...pw, cooldowns: { ...(pw.cooldowns || {}), golden: todayStr() } };
      next.log = addLog(state.log, `🌅 A Golden Age dawns over ${state.worldName}. The people feast. +${grant} Power.`);
    } else if (p.id === "muse") {
      const wk = isoWeekKey(todayStr());
      next.power = state.power - p.cost;
      next.decrees = { week: wk, ids: rollDecrees(hashStr(state.worldSeed + wk + ":" + Date.now())), claimed: {} };
      next.log = addLog(state.log, "🎲 Divine Inspiration: new Decrees are proclaimed.");
    }
    save(next);
  };
  const smiteNation = (n) => {
    const p = POWERS.find((x) => x.id === "smite");
    if (state.power < p.cost) return;
    save({
      ...state, power: state.power - p.cost,
      powers: { ...pw, smited: { ...(pw.smited || {}), [n.id]: 0.8 } },
      log: addLog(state.log, `⚡ You smite ${n.name}. ${n.god}'s defenses crack — their War Strength falls by 20%.`),
    });
    setSmiteOpen(false);
  };

  // ----- wonders -----
  const buildWonder = (w) => {
    if ((state.wonders || {})[w.id] || era < w.era || state.power < w.cost) return;
    playSfx("wonder");
    postDiscord(`🗿 **${state.worldName}** raises **${w.name}**. (${w.effect})`);
    save({
      ...state, power: state.power - w.cost,
      wonders: { ...(state.wonders || {}), [w.id]: true },
      log: addLog(state.log, `🗿 ${w.name} is raised over ${state.worldName}. (${w.effect})`),
    });
  };

  // ----- New Age (prestige) -----
  const doPrestige = (relicId) => {
    const newEternal = [...(state.eternalRelics || []), relicId];
    save({
      ...state,
      prestige: (state.prestige || 0) + 1,
      eternalRelics: newEternal,
      conquered: [],
      powers: { ...pw, smited: {} },
      log: addLog(state.log, `🌌 A New Age dawns over ${state.worldName}. The fallen gods rise again, stronger than before — but ${RELICS[relicId].name} is yours forever.`),
    });
    setPrestigeOpen(false);
    setTab("world");
  };

  // ---------- STYLES ----------
  const S = {
    app: { fontFamily: "'Pixelify Sans', 'Courier New', monospace", background: "#0b0e14", color: "#e8e0cc", minHeight: "100vh", maxWidth: 560, margin: "0 auto", paddingBottom: 90 },
    panel: { background: "#151a24", border: "2px solid #2a3242", borderRadius: 10, padding: 14, margin: "10px 12px" },
    btn: (bg = "#f0b541", fg = "#1a1408") => ({ background: bg, color: fg, border: "none", borderRadius: 8, padding: "12px 16px", fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%" }),
    small: { fontSize: 12, opacity: 0.7 },
    h: { margin: "0 0 6px", fontSize: 18, letterSpacing: 0.5 },
    input: { width: "100%", background: "#0b0e14", border: "2px solid #2a3242", color: "#e8e0cc", borderRadius: 8, padding: "10px", fontFamily: "inherit", fontSize: 14, marginTop: 6, boxSizing: "border-box" },
  };

  // ---------- ONBOARDING ----------
  if (!state.godName) return <Onboarding S={S} onCreate={createWorld} />;

  // ---------- TABS ----------
  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      {/* HEADER */}
      <div style={{ padding: "14px 12px 4px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: state.banner }}>{state.worldName.toUpperCase()}{prestige > 0 && <span style={{ fontSize: 13, color: "#caa6f0", marginLeft: 8 }}>✦ Age {ordinal(prestige + 1)}</span>}</div>
          <div style={S.small}>Realm of {state.godName}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#f0b541" }}>⚡ {state.power}</div>
          <div style={S.small}>Power</div>
        </div>
      </div>

      {/* WORLD TAB */}
      {tab === "world" && (
        <>
          <div style={{ margin: "8px 12px" }}>
            <WorldCanvas state={state} dormant={dormant} />
            {dormant && (
              <div style={{ textAlign: "center", marginTop: 6, color: "#9aa3ad", fontSize: 13 }}>
                The skies have gone grey. Your world sleeps until its god returns to the gym.
              </div>
            )}
            <button style={{ ...S.btn("#2a3242", "#caa6f0"), padding: "9px", marginTop: 8 }} onClick={makeShareCard}>📸 Share Empire Card</button>
          </div>
          <div style={S.panel}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ ...S.h, color: ERAS[era].color }}>{ERAS[era].name}</div>
              <div style={S.small}>{counted} sessions</div>
            </div>
            <div style={{ ...S.small, marginBottom: 8 }}>{ERAS[era].desc}</div>
            {nextEra ? (
              <>
                <div style={{ background: "#0b0e14", borderRadius: 6, height: 14, overflow: "hidden", border: "1px solid #2a3242" }}>
                  <div style={{ width: `${Math.min(100, ((counted - ERAS[era].need) / (nextEra.need - ERAS[era].need)) * 100)}%`, height: "100%", background: nextEra.color, transition: "width .6s" }} />
                </div>
                <div style={{ ...S.small, marginTop: 5 }}>{nextEra.need - counted} workouts to the {nextEra.name}</div>
              </>
            ) : (
              <div style={{ color: "#f0b541", fontSize: 13 }}>You have Ascended. Finish the conquest map to complete your legend.</div>
            )}
          </div>
          <div style={S.panel}>
            <div style={{ display: "flex", gap: 8, textAlign: "center" }}>
              <Stat label="Momentum" value={`${momentumMult.toFixed(1)}x`} hint={state.momentum > 0 ? `${state.momentum} chained` : "train to start"} color={state.momentum >= 4 ? "#7ee08a" : "#e8e0cc"} />
              <Stat label="War Strength" value={armyPower} hint="grows as you train" color="#c4453c" />
              <Stat label="Nations" value={`${state.conquered.length}/${NATIONS.length}`} hint={`+${tributePerWorkout}⚡/workout`} color="#5fb3c9" />
            </div>
          </div>

          {/* STREAK + WEEKLY DECREES */}
          <div style={{ ...S.panel, borderColor: currentStreak > 0 ? "#e0843a" : "#2a3242" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 34 }}>{currentStreak > 0 ? "🔥" : "🪵"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: currentStreak > 0 ? "#f0a043" : "#9aa3ad" }}>{currentStreak}-session streak</div>
                <div style={S.small}>{trainedToday ? "Trained today — streak is safe." : currentStreak > 0 ? `Train within ${momentumWindow} days to keep it. Best ever: ${bestStreak}.` : `Best ever: ${bestStreak}. Train to light it again.`}</div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #1f2530", margin: "12px 0 8px" }} />
            <div style={{ ...S.h, fontSize: 15, display: "flex", justifyContent: "space-between" }}><span>📜 Weekly Decrees</span><span style={S.small}>this week</span></div>
            {decreeList.map((d) => {
              const done = d.check(ws);
              const claimed = decrees.claimed && decrees.claimed[d.id];
              return (
                <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #1f2530" }}>
                  <div style={{ width: 24, height: 24, minWidth: 24, borderRadius: 6, border: `2px solid ${claimed ? "#7ee08a" : done ? "#f0b541" : "#4a5568"}`, background: claimed ? "#1f3a26" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: claimed ? "#7ee08a" : "#f0b541", fontSize: 14 }}>{claimed ? "✓" : done ? "★" : ""}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, opacity: claimed ? 0.6 : 1 }}>{d.text}</div>
                    <div style={S.small}>Reward: +{d.reward}⚡</div>
                  </div>
                  {done && !claimed && (
                    <button style={{ ...S.btn("#f0b541"), width: "auto", padding: "7px 12px", fontSize: 13 }} onClick={() => claimDecree(d)}>Claim</button>
                  )}
                  {claimed && <div style={{ fontSize: 12, color: "#7ee08a", fontWeight: 700 }}>claimed</div>}
                </div>
              );
            })}
            <div style={{ ...S.small, marginTop: 8 }}>New decrees each week. Unclaimed rewards don't carry over.</div>
          </div>

          {/* CHAMPIONS */}
          <div style={{ ...S.panel, borderColor: champions.length ? "#f0b541" : "#2a3242" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={S.h}>👑 Champions</div>
              <div style={S.small}>{champions.length}/{Math.max(maxChampions, champions.length)}</div>
            </div>
            {champions.length === 0 && maxChampions === 0 && (
              <div style={S.small}>At the {ERAS[2].name} you may raise a mortal above all others — a hero to rule in your name across every age to come.{nextSlotEra ? ` (${ERAS[nextSlotEra].need - counted} workouts away)` : ""}</div>
            )}
            {champions.map((c) => {
              const lineage = (state.legacies || []).filter((l) => l.line === c.line);
              const tale = () => {
                let t = `${CHOSEN_TRAITS[c.trait].story(c.founderName || c.name, state.worldName)}\n\nHouse ${c.surname} now sits the throne in its ${ordinal(c.gen || 1)} generation, led by ${c.name} ${c.epithet}. Gift to your empire: ${champLabel(c)}.`;
                if (lineage.length) {
                  t += `\n\n— Those who came before —`;
                  lineage.forEach((l) => { t += `\n${l.name} ${l.epithet} (${ERAS[l.fromEra]?.name || "?"}–${ERAS[l.toEra]?.name || "?"}): ${l.epitaph}`; });
                }
                t += `\n\nSo long as ${state.worldName} stands, House ${c.surname} rules in your name.`;
                return t;
              };
              return (
                <div key={c.cid} onClick={() => setReadChapter({ title: `House ${c.surname} · ${c.name} ${c.epithet}`, text: tale })}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #1f2530", cursor: "pointer" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: CHOSEN_TRAITS[c.trait].color + "33", border: `2px solid ${CHOSEN_TRAITS[c.trait].color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👑</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name} <span style={{ color: CHOSEN_TRAITS[c.trait].color }}>{c.epithet}</span></div>
                    <div style={S.small}>House {c.surname} · Gen {c.gen || 1} · {champLabel(c)}</div>
                  </div>
                </div>
              );
            })}
            {canCrown && availableChosen.length > 0 && (
              <button style={{ ...S.btn("#f0b541"), marginTop: 10, padding: "10px" }} onClick={() => setCrownOpen(true)}>
                👑 Crown a Champion · {crownCost}⚡
              </button>
            )}
            {!canCrown && champions.length > 0 && nextSlotEra && (
              <div style={{ ...S.small, marginTop: 8 }}>The next Champion may be crowned in the {ERAS[nextSlotEra].name} ({ERAS[nextSlotEra].need - counted} workouts away).</div>
            )}
            {canCrown && state.power < crownCost && availableChosen.length > 0 && (
              <div style={{ ...S.small, marginTop: 8, color: "#c4453c" }}>You need {crownCost}⚡ to crown your {champions.length === 0 ? "first" : "next"} Champion.</div>
            )}
          </div>

          <div style={S.panel}>
            <div style={S.h}>Latest in the Saga</div>
            {state.log.slice(0, 6).map((l, i) => (
              <div key={i} style={{ fontSize: 13, padding: "5px 0", borderBottom: i < 5 ? "1px solid #1f2530" : "none" }}>
                <span style={{ opacity: 0.45, marginRight: 6 }}>{l.date.slice(5)}</span>{l.text}
              </div>
            ))}
            {state.log.length === 0 && <div style={S.small}>Your story has not yet been written.</div>}
          </div>
        </>
      )}

      {/* BUILD TAB */}
      {tab === "build" && (
        <>
          {/* DIVINE POWERS */}
          <div style={{ ...S.panel, borderColor: "#7d5ba6" }}>
            <div style={{ ...S.h, color: "#caa6f0" }}>🌩 Divine Powers</div>
            <div style={{ ...S.small, marginBottom: 6 }}>Spend Power to act, not just build. A god does things.</div>
            {pw.blessing && <div style={{ fontSize: 13, color: "#f0b541", marginBottom: 8 }}>✨ Blessing of Vigor is active — your next session burns brighter.</div>}
            {POWERS.map((p) => {
              const ready = powerReady(p);
              const afford = state.power >= p.cost;
              const lu = pw.cooldowns && pw.cooldowns[p.id];
              const daysLeft = lu ? Math.max(0, p.cooldownDays - daysBetween(lu, todayStr())) : 0;
              const blessingActive = p.id === "vigor" && pw.blessing;
              const usable = afford && ready && !blessingActive;
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #1f2530" }}>
                  <div style={{ fontSize: 22, width: 28, textAlign: "center" }}>{p.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: p.color }}>{p.name}</div>
                    <div style={S.small}>{p.desc}</div>
                  </div>
                  <button
                    style={{ ...S.btn(usable ? p.color : "#2a3242", usable ? "#0b0e14" : "#6a7280"), width: "auto", padding: "8px 12px", fontSize: 13 }}
                    disabled={!usable}
                    onClick={() => castPower(p)}
                  >
                    {blessingActive ? "Active" : !ready ? `${daysLeft}d` : afford ? `${p.cost}⚡` : `${p.cost}⚡`}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={S.panel}>
            <div style={S.h}>🔨 Build Your World</div>
            <div style={S.small}>Spend Power to raise structures. Each one changes the island and makes your empire stronger. Era is earned by showing up; this is what you do with the Power it pays you.</div>
          </div>
          {BUILDINGS.map((b) => {
            const lvl = B[b.id] || 0;
            const maxed = lvl >= b.max;
            const cost = buildCost(b);
            const afford = state.power >= cost;
            return (
              <div key={b.id} style={{ ...S.panel, borderColor: lvl > 0 ? b.color : "#2a3242" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: b.color }}>{b.icon} {b.name}</div>
                  <div style={S.small}>{b.branch} · Lv.{lvl}/{b.max}</div>
                </div>
                <div style={{ ...S.small, margin: "4px 0 6px" }}>{b.blurb}</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {Array.from({ length: b.max }).map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 8, borderRadius: 3, background: i < lvl ? b.color : "#0b0e14", border: "1px solid #2a3242" }} />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, color: lvl > 0 ? b.color : "#9aa3ad" }}>
                    {lvl > 0 ? `Now: ${b.effect(lvl)}` : "Not yet built"}
                    {!maxed && <span style={{ opacity: 0.65 }}> → {b.effect(lvl + 1)}</span>}
                  </div>
                </div>
                <button
                  style={{ ...S.btn(maxed ? "#2a3242" : afford ? b.color : "#2a3242", maxed || !afford ? "#6a7280" : "#0b0e14"), marginTop: 10, padding: "10px" }}
                  disabled={maxed || !afford}
                  onClick={() => buildUpgrade(b)}
                >
                  {maxed ? "Fully Raised" : afford ? `${lvl > 0 ? "Upgrade" : "Build"} · ${cost}⚡` : `Need ${cost}⚡`}
                </button>
              </div>
            );
          })}
          {buildDiscount < 1 && (
            <div style={{ ...S.panel, borderColor: "#9aa3ad" }}>
              <div style={{ fontSize: 13, color: "#9aa3ad" }}>🛠 Your mason bloodline cuts every building cost by {Math.round((1 - buildDiscount) * 100)}%.</div>
            </div>
          )}

          {/* WONDERS */}
          <div style={{ ...S.panel, borderColor: "#d9a441" }}>
            <div style={{ ...S.h, color: "#f0c674" }}>🗿 Wonders</div>
            <div style={S.small}>Once-in-an-age projects. Each is built a single time, reshapes the island, and grants a mighty permanent boon.</div>
          </div>
          {WONDERS.map((w) => {
            const built = (state.wonders || {})[w.id];
            const locked = era < w.era;
            const afford = state.power >= w.cost;
            return (
              <div key={w.id} style={{ ...S.panel, borderColor: built ? w.color : "#2a3242", opacity: locked && !built ? 0.6 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: w.color }}>{w.icon} {w.name}</div>
                  {built && <div style={{ fontSize: 12, color: w.color }}>✓ raised</div>}
                </div>
                <div style={{ ...S.small, margin: "4px 0 6px" }}>{w.desc}</div>
                <div style={{ fontSize: 13, color: w.color, marginBottom: 8 }}>{w.effect}</div>
                {built ? (
                  <div style={{ fontSize: 13, color: w.color, fontWeight: 700 }}>An eternal monument to your devotion.</div>
                ) : locked ? (
                  <div style={{ fontSize: 13, color: "#9aa3ad" }}>🔒 Requires the {ERAS[w.era].name}</div>
                ) : (
                  <button style={{ ...S.btn(afford ? w.color : "#2a3242", afford ? "#0b0e14" : "#6a7280"), padding: "10px" }} disabled={!afford} onClick={() => buildWonder(w)}>
                    {afford ? `Raise · ${w.cost}⚡` : `Need ${w.cost}⚡`}
                  </button>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* CONQUEST TAB */}
      {tab === "conquest" && (
        <>
          <div style={{ ...S.panel, display: "flex", gap: 8, textAlign: "center" }}>
            <Stat label="War Strength" value={armyPower} hint="train + forge = stronger" color="#c4453c" />
            <Stat label="Power" value={state.power} hint="wars cost Power" color="#f0b541" />
          </div>

          {/* NEW AGE (prestige) */}
          {(relicB.complete || (state.eternalRelics || []).length > 0) && (
            <div style={{ ...S.panel, borderColor: "#7d5ba6" }}>
              <div style={{ ...S.h, color: "#caa6f0" }}>🌌 The New Age</div>
              {(state.eternalRelics || []).length > 0 && (
                <div style={{ ...S.small, marginBottom: 6 }}>Eternal relics carried with you: {(state.eternalRelics || []).map((id) => `${RELICS[id].icon} ${RELICS[id].name}`).join(" · ")} (double boon, forever).</div>
              )}
              {relicB.complete ? (
                <>
                  <div style={{ ...S.small, marginBottom: 8 }}>Every god kneels. You may begin a New Age: the map resets and the fallen gods return {Math.round(60 * (prestige + 1))}% stronger, but you carry one relic into eternity — and keep every workout, PR, and Champion you've earned.</div>
                  <button style={{ ...S.btn("#7d5ba6", "#fff"), padding: "10px" }} onClick={() => setPrestigeOpen(true)}>✦ Begin a New Age</button>
                </>
              ) : (
                <div style={S.small}>You are in the {ordinal(prestige + 1)} Age. The gods stand {Math.round(60 * prestige)}% stronger than the first. Conquer them all again to ascend further.</div>
              )}
            </div>
          )}

          {/* RELIC VAULT */}
          <div style={{ ...S.panel, borderColor: relicB.complete ? "#f0b541" : "#2a3242" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={S.h}>🏛 Relic Vault</div>
              <div style={S.small}>{state.conquered.length}/{NATIONS.length}</div>
            </div>
            <div style={{ ...S.small, marginBottom: 8 }}>Every nation you conquer yields a relic. Each grants a quiet, permanent boon — and the full set is its own reward.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {NATIONS.map((n) => {
                const have = state.conquered.includes(n.id);
                const r = RELICS[n.id];
                return (
                  <div key={n.id} title={have ? r.name : "Undiscovered"}
                    style={{ aspectRatio: "1", borderRadius: 8, border: `1px solid ${have ? n.color : "#2a3242"}`, background: have ? n.color + "22" : "#0b0e14", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                    <div style={{ fontSize: 20, filter: have ? "none" : "grayscale(1) brightness(0.4)" }}>{have ? r.icon : "❔"}</div>
                    <div style={{ fontSize: 8, color: have ? "#e8e0cc" : "#3a4250", marginTop: 2, lineHeight: 1.1, padding: "0 2px" }}>{have ? r.name : "???"}</div>
                  </div>
                );
              })}
            </div>
            {(relicB.war > 0 || relicB.power > 0 || relicB.tribute > 0 || relicB.grace > 0) && (
              <div style={{ ...S.small, marginTop: 8, color: "#f0b541" }}>
                Relic boons: {[relicB.war ? `+${relicB.war} War` : "", relicB.power ? `+${relicB.power} Power/workout` : "", relicB.tribute ? `+${relicB.tribute} tribute` : "", relicB.grace ? `+${relicB.grace} grace day${relicB.grace > 1 ? "s" : ""}` : ""].filter(Boolean).join(" · ")}
              </div>
            )}
            {relicB.complete && <div style={{ fontSize: 13, color: "#f0b541", fontWeight: 700, marginTop: 6 }}>👁 THE FULL SET. The Nameless Sigil blazes — +200 War, +40 Power/workout.</div>}
          </div>

          {NATIONS.map((n) => {
            const conqueredN = state.conquered.includes(n.id);
            const eraLocked = era < n.eraReq;
            const def = effectiveDefense(n);
            const smited = def < n.defense;
            const canWin = armyPower >= def;
            const canAfford = state.power >= n.cost;
            return (
              <div key={n.id} style={{ ...S.panel, borderColor: conqueredN ? n.color : "#2a3242", opacity: eraLocked && !conqueredN ? 0.55 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: n.color }}>{conqueredN ? "👑 " : ""}{n.name}</div>
                  {conqueredN && <div style={{ fontSize: 12, color: n.color }}>+{n.tribute}⚡/workout</div>}
                </div>
                <div style={{ ...S.small, margin: "2px 0 8px" }}>God: {n.god} · {n.flavor}</div>
                {conqueredN ? (
                  <div style={{ fontSize: 13, color: n.color }}>Their people worship {state.godName} now. Relic claimed: {RELICS[n.id].icon} {RELICS[n.id].name}.</div>
                ) : eraLocked ? (
                  <div style={{ fontSize: 13, color: "#9aa3ad" }}>🔒 Requires the {ERAS[n.eraReq].name} ({ERAS[n.eraReq].need} total workouts)</div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 10, fontSize: 13, marginBottom: 8 }}>
                      <span style={{ color: canWin ? "#7ee08a" : "#c4453c" }}>Defense {smited ? <><span style={{ textDecoration: "line-through", opacity: 0.5 }}>{n.defense}</span> {def}</> : def} {canWin ? "✓" : `(you: ${armyPower})`}</span>
                      <span style={{ color: canAfford ? "#7ee08a" : "#c4453c" }}>Cost {n.cost}⚡</span>
                    </div>
                    <button style={{ ...S.btn(canWin && canAfford ? "#c4453c" : "#2a3242", canWin && canAfford ? "#fff" : "#6a7280"), padding: "10px" }} onClick={() => startBattle(n)}>
                      {canWin && canAfford ? "⚔️ Declare War" : "⚔️ Attack Anyway (you will lose)"}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* TRAIN TAB — list */}
      {tab === "train" && !session && (
        <>
          <div style={S.panel}>
            <div style={S.h}>Choose Today's Session</div>
            <div style={S.small}>
              {trainedToday ? "Already trained today — extra sessions earn half Power and no era progress. Recovery matters." : `Completing a session: +${Math.round(100 * momentumMult)}⚡ base${shrineBonus ? ` +${shrineBonus}⚡ shrine` : ""}${tributePerWorkout ? ` +${tributePerWorkout}⚡ tribute` : ""}${state.momentum >= 1 ? ` (${momentumMult.toFixed(1)}x momentum)` : ""}.`}
            </div>
          </div>

          {/* DISCIPLINES */}
          <div style={S.panel}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={S.h}>⚔ Disciplines</div>
              <div style={S.small}>balance: +{Math.round((balanceMult - 1) * 100)}%</div>
            </div>
            <div style={{ ...S.small, marginBottom: 8 }}>What you train shapes your empire. Train all four to earn the balance bonus — don't skip leg day.</div>
            {DISCIPLINES.map((d) => {
              const lvl = discLv[d.id];
              const cnt = discCount[d.id];
              const toNext = 3 - (cnt % 3);
              return (
                <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                  <div style={{ fontSize: 18, width: 24, textAlign: "center" }}>{d.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.name} <span style={{ opacity: 0.6, fontWeight: 400 }}>({d.focus})</span></span>
                      <span style={S.small}>Lv.{lvl}</span>
                    </div>
                    <div style={{ display: "flex", gap: 3, marginTop: 3 }}>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} style={{ flex: 1, height: 6, borderRadius: 2, background: i < lvl ? d.color : "#0b0e14", border: "1px solid #2a3242" }} />
                      ))}
                    </div>
                    <div style={{ ...S.small, marginTop: 2 }}>+{lvl * d.per} {d.reward} · {lvl < 10 ? `${toNext} more ${d.focus} session${toNext > 1 ? "s" : ""} to Lv.${lvl + 1}` : "maxed"}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {sessions.map((s) => {
            const f = sessionFocus(s);
            const disc = DISCIPLINES.find((d) => d.id === f);
            return (
            <div key={s.id} style={S.panel}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{s.name} {s.custom && <span style={{ fontSize: 11, color: "#5fb3c9" }}>· yours</span>}</div>
                  <div style={S.small}>{s.blurb || `${s.exercises.length} exercises`}</div>
                  <div style={{ fontSize: 11, color: disc.color, marginTop: 3 }}>{disc.icon} builds your {disc.name}</div>
                </div>
                <button onClick={() => setEditing(JSON.parse(JSON.stringify(s)))} style={{ background: "transparent", border: "1px solid #2a3242", color: "#9aa3ad", borderRadius: 6, padding: "4px 8px", fontFamily: "inherit", fontSize: 12, cursor: "pointer", marginLeft: 8 }}>✎ Edit</button>
              </div>
              <button style={{ ...S.btn("#2f5e33", "#e8e0cc"), marginTop: 10, padding: "10px" }} onClick={() => { setSession(s.id); setChecks({}); setWeights({}); }}>
                Start Session
              </button>
            </div>
          );})}
          <div style={{ margin: "10px 12px" }}>
            <button style={{ ...S.btn("#5fb3c9", "#0b0e14") }} onClick={() => setEditing(blankSession())}>+ Build a New Session</button>
          </div>
          <div style={{ ...S.panel, borderColor: "#5fb3c9" }}>
            <div style={{ ...S.h, color: "#5fb3c9" }}>🛡 Elbow Rules</div>
            {ELBOW_RULES.map((r, i) => (
              <div key={i} style={{ fontSize: 13, padding: "4px 0" }}>• {r}</div>
            ))}
            <div style={{ ...S.small, marginTop: 6 }}>Years of inner-elbow pain that's getting worse deserves a real look from Ole Miss sports medicine — strength training helps, but it's not a diagnosis.</div>
          </div>
        </>
      )}

      {/* TRAIN TAB — active session */}
      {tab === "train" && session && (() => {
        const s = sessions.find((x) => x.id === session);
        if (!s) { setSession(null); return null; }
        const done = s.exercises.filter((e) => checks[e.name]).length;
        return (
          <>
            <div style={S.panel}>
              <div style={S.h}>{s.name}</div>
              <div style={S.small}>{done}/{s.exercises.length} exercises · log weight to hunt PRs (golden meteors)</div>
            </div>
            {s.exercises.map((ex) => (
              <div key={ex.name} style={{ ...S.panel, borderColor: checks[ex.name] ? "#7ee08a" : "#2a3242", display: "flex", alignItems: "center", gap: 10 }}>
                <div onClick={() => setChecks({ ...checks, [ex.name]: !checks[ex.name] })}
                  style={{ width: 30, height: 30, minWidth: 30, borderRadius: 6, border: "2px solid " + (checks[ex.name] ? "#7ee08a" : "#4a5568"), background: checks[ex.name] ? "#1f3a26" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#7ee08a", fontSize: 18 }}>
                  {checks[ex.name] ? "✓" : ""}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{ex.name} {ex.sets && <span style={{ color: "#f0b541" }}>{ex.sets}</span>}</div>
                  <div style={{ ...S.small }}>{ex.note}{state.bestLifts[ex.name] ? `${ex.note ? " · " : ""}Best: ${state.bestLifts[ex.name]}` : ""}</div>
                </div>
                <input type="number" inputMode="decimal" placeholder="lbs" value={weights[ex.name] || ""}
                  onChange={(e) => setWeights({ ...weights, [ex.name]: e.target.value })}
                  style={{ width: 62, background: "#0b0e14", border: "1px solid #2a3242", color: "#e8e0cc", borderRadius: 6, padding: "8px 6px", fontFamily: "inherit", fontSize: 14 }} />
              </div>
            ))}
            <div style={{ margin: "10px 12px", display: "flex", gap: 8 }}>
              <button style={{ ...S.btn("#2a3242", "#9aa3ad") }} onClick={() => setSession(null)}>Back</button>
              <button style={{ ...S.btn(done > 0 ? "#f0b541" : "#2a3242", done > 0 ? "#1a1408" : "#6a7280") }} disabled={done === 0} onClick={completeWorkout}>
                Complete Workout ⚡
              </button>
            </div>
            <div style={{ ...S.small, textAlign: "center", marginBottom: 10 }}>A rough day still counts. Check what you finished and claim it.</div>
          </>
        );
      })()}

      {/* CHRONICLE TAB */}
      {tab === "history" && (
        <>
          <div style={{ ...S.panel, display: "flex", gap: 8, textAlign: "center" }}>
            <Stat label="Total Sessions" value={counted} hint={state.startDate ? `since ${state.startDate.slice(5)}` : ""} color="#f0b541" />
            <Stat label="This Week" value={ws.days + "/4"} hint="weekly goal" color="#7ee08a" />
            <Stat label="PRs" value={Object.keys(state.bestLifts).length} hint="lifts tracked" color="#c4453c" />
          </div>

          {/* STREAK + CALENDAR */}
          <div style={S.panel}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={S.h}>🔥 {currentStreak}-session streak</div>
              <div style={S.small}>best {bestStreak}</div>
            </div>
            <CalendarHeatmap workouts={state.workouts} banner={state.banner} offset={calOffset} setOffset={setCalOffset} S={S} />
          </div>

          {/* SAGA */}
          <div style={{ ...S.panel, borderColor: "#7d5ba6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ ...S.h, color: "#caa6f0", margin: 0 }}>📖 The Saga of {state.worldName}</div>
              <div style={S.small}>{(state.saga || []).length}/{SAGA.length}</div>
            </div>
            <div style={{ ...S.small, margin: "4px 0 8px" }}>One story, written by your consistency. New chapters unlock as your world grows.</div>
            {SAGA.map((ch) => {
              const unlocked = (state.saga || []).includes(ch.id);
              return (
                <div key={ch.id} onClick={() => unlocked && setReadChapter(ch)}
                  style={{ padding: "9px 10px", margin: "6px 0", borderRadius: 8, border: "1px solid #2a3242", background: unlocked ? "#1a1426" : "#0b0e14", cursor: unlocked ? "pointer" : "default", opacity: unlocked ? 1 : 0.5 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: unlocked ? "#caa6f0" : "#6a7280" }}>{unlocked ? ch.title : "🔒 " + ch.title.split("·")[0] + "· ? ? ?"}</div>
                  {unlocked && <div style={S.small}>Tap to read</div>}
                </div>
              );
            })}
          </div>

          {/* BLOODLINES */}
          {(champions.length > 0 || (state.legacies || []).length > 0) && (
            <div style={{ ...S.panel, borderColor: "#f0b541" }}>
              <div style={S.h}>⚜ Bloodlines</div>
              <div style={{ ...S.small, marginBottom: 6 }}>Every {LIFESPAN} eras a reigning Champion passes the throne to an heir. A line that endures grows stronger each generation.</div>
              {champions.map((c) => {
                const lineage = (state.legacies || []).filter((l) => l.line === c.line);
                return (
                  <div key={c.line} style={{ background: "#0b0e14", border: "1px solid #2a3242", borderRadius: 8, padding: 10, marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>House {c.surname}</div>
                      <div style={{ fontSize: 12, color: CHOSEN_TRAITS[c.trait].color }}>Gen {c.gen || 1} · {champLabel(c)}</div>
                    </div>
                    <div style={S.small}>Now reigning: {c.name} {c.epithet}</div>
                    {lineage.map((l, i) => (
                      <div key={i} style={{ ...S.small, opacity: 0.6, marginTop: 4 }}>⚰️ {l.name} {l.epithet} — {l.epitaph}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          <div style={S.panel}>
            <div style={S.h}>Personal Records</div>
            {Object.keys(state.bestLifts).length === 0 && <div style={S.small}>Log weights during sessions to track records here.</div>}
            {Object.entries(state.bestLifts).map(([name, w]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "5px 0", borderBottom: "1px solid #1f2530" }}>
                <span>{name}</span><span style={{ color: "#f0b541", fontWeight: 700 }}>{w} lbs</span>
              </div>
            ))}
          </div>
          <div style={S.panel}>
            <div style={S.h}>Session Log</div>
            {[...state.workouts].reverse().slice(0, 25).map((w, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", borderBottom: "1px solid #1f2530" }}>
                <span><span style={{ opacity: 0.45, marginRight: 6 }}>{w.date.slice(5)}</span>{w.type}{w.prs && w.prs.length > 0 ? " ⚡PR" : ""}</span>
                <span style={{ color: "#f0b541" }}>+{w.power}</span>
              </div>
            ))}
            {state.workouts.length === 0 && <div style={S.small}>No sessions yet. The world is waiting.</div>}
          </div>
          {/* SETTINGS */}
          <div style={{ ...S.panel, borderColor: "#7d5ba6" }}>
            <div style={{ ...S.h, color: "#caa6f0" }}>⚙ Settings</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0 10px" }}>
              <div style={{ fontSize: 14 }}>🔊 Sound effects</div>
              <button onClick={() => setSetting({ sound: !(state.settings && state.settings.sound) })}
                style={{ width: 52, height: 28, borderRadius: 14, border: "none", cursor: "pointer", background: (state.settings && state.settings.sound) ? "#7ee08a" : "#2a3242", position: "relative" }}>
                <span style={{ position: "absolute", top: 3, left: (state.settings && state.settings.sound) ? 27 : 3, width: 22, height: 22, borderRadius: "50%", background: "#0b0e14", transition: "left .15s" }} />
              </button>
            </div>
            <div style={{ borderTop: "1px solid #1f2530", margin: "4px 0 10px" }} />
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>🎮 Discord</div>
            <div style={{ ...S.small, marginBottom: 6 }}>Paste a channel webhook URL and IronWorld will post your sessions, eras, and conquests there. (Server Settings → Integrations → Webhooks → New Webhook → Copy URL.)</div>
            <input style={{ ...S.input, fontSize: 11 }} placeholder="https://discord.com/api/webhooks/…" value={(state.settings && state.settings.discordWebhook) || ""} onChange={(e) => { setSetting({ discordWebhook: e.target.value }); setDiscordStatus(""); }} />
            <button style={{ ...S.btn("#5fb3c9", "#0b0e14"), padding: "9px", marginTop: 8 }} onClick={sendTestDiscord}>Send Test Message</button>
            {discordStatus && <div style={{ ...S.small, marginTop: 8, color: discordStatus.includes("Sent") ? "#7ee08a" : "#f0a043" }}>{discordStatus}</div>}
          </div>

          {/* BACKUP & RESTORE */}
          <div style={{ ...S.panel, borderColor: "#5fb3c9" }}>
            <div style={{ ...S.h, color: "#5fb3c9" }}>💾 Backup & Restore</div>
            <div style={{ ...S.small, marginBottom: 8 }}>Your world lives in this browser. Save a backup code somewhere safe so a wipe can't erase your empire or training history.</div>
            <button style={{ ...S.btn("#5fb3c9", "#0b0e14"), padding: "10px" }} onClick={exportSave}>Export Save Code</button>
            {exportCode && (
              <>
                <textarea readOnly value={exportCode} onFocus={(e) => e.target.select()} style={{ ...S.input, height: 70, resize: "vertical", fontSize: 11, color: "#9aa3ad" }} />
                <button style={{ ...S.btn("#2a3242", "#e8e0cc"), padding: "9px", marginTop: 6 }} onClick={copyExport}>Copy Code</button>
              </>
            )}
            <div style={{ borderTop: "1px solid #1f2530", margin: "12px 0 8px" }} />
            <div style={{ ...S.small, marginBottom: 4 }}>Restore from a code (this replaces your current world):</div>
            <textarea value={importText} onChange={(e) => { setImportText(e.target.value); setImportMsg(""); }} placeholder="Paste a backup code here" style={{ ...S.input, height: 60, resize: "vertical", fontSize: 11 }} />
            {!confirmImport ? (
              <button style={{ ...S.btn(importText.trim() ? "#2a3242" : "#1a2028", importText.trim() ? "#e8e0cc" : "#4a5568"), padding: "9px", marginTop: 6 }} disabled={!importText.trim()} onClick={() => setConfirmImport(true)}>Restore This World</button>
            ) : (
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button style={{ ...S.btn("#2a3242", "#9aa3ad"), padding: "9px" }} onClick={() => setConfirmImport(false)}>Cancel</button>
                <button style={{ ...S.btn("#c4453c", "#fff"), padding: "9px" }} onClick={doImport}>Overwrite & Restore</button>
              </div>
            )}
            {importMsg && <div style={{ ...S.small, marginTop: 8, color: importMsg.includes("restored") || importMsg.includes("copied") ? "#7ee08a" : "#f0a043" }}>{importMsg}</div>}
          </div>

          <div style={S.panel}>
            {!confirmReset ? (
              <button style={{ ...S.btn("#2a3242", "#c4453c"), padding: "10px" }} onClick={() => setConfirmReset(true)}>Destroy World (reset all progress)</button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...S.btn("#2a3242", "#9aa3ad"), padding: "10px" }} onClick={() => setConfirmReset(false)}>Cancel</button>
                <button style={{ ...S.btn("#c4453c", "#fff"), padding: "10px" }} onClick={() => { setConfirmReset(false); save({ ...DEFAULT_STATE }); setTab("world"); }}>Yes, destroy everything</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* REWARD MODAL */}
      {reward && (
        <Modal onClose={() => setReward(null)}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>⚡</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#f0b541", margin: "4px 0" }}>+{reward.gained} POWER</div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>{reward.session}</div>
            <div style={{ textAlign: "left", margin: "14px 0", fontSize: 14, background: "#0b0e14", borderRadius: 8, padding: 12 }}>
              <Row k={`Base ${reward.counted ? `(${reward.mult.toFixed(1)}x momentum)` : "(extra session)"}`} v={`+${reward.counted ? reward.base : Math.round(reward.base / 2)}`} />
              {reward.shrine > 0 && <Row k="Grand Shrine devotion" v={`+${reward.shrine}`} />}
              {reward.bless > 0 && <Row k="✨ Blessing of Vigor" v={`+${reward.bless}`} gold />}
              {reward.comeback > 0 && <Row k="🎉 A god returns (comeback)" v={`+${reward.comeback}`} gold />}
              {reward.tribute > 0 && <Row k="Tribute from conquered nations" v={`+${reward.tribute}`} />}
              {reward.prs.map((p) => <Row key={p.name} k={`🌟 PR: ${p.name} ${p.weight} (was ${p.old})`} v="+50" gold />)}
              {reward.counted && <Row k="Momentum chain" v={`${reward.momentum} 🔥`} />}
            </div>
            {reward.eraUp && (
              <div style={{ border: `2px solid ${reward.eraUp.color}`, borderRadius: 8, padding: 12, margin: "10px 0" }}>
                <div style={{ color: reward.eraUp.color, fontWeight: 700, fontSize: 17 }}>🏛 NEW ERA: {reward.eraUp.name.toUpperCase()}</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{reward.eraUp.desc}</div>
              </div>
            )}
            {reward.bloodEvents && reward.bloodEvents.length > 0 && (
              <div style={{ border: "2px solid #f0b541", borderRadius: 8, padding: 12, margin: "10px 0", textAlign: "left" }}>
                <div style={{ color: "#f0b541", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>⚜ A throne passes</div>
                {reward.bloodEvents.map((e, i) => <div key={i} style={{ fontSize: 12, opacity: 0.85, padding: "2px 0" }}>{e}</div>)}
              </div>
            )}
            <button style={S.btn()} onClick={() => { setReward(null); setTab("world"); }}>Witness Your World</button>
          </div>
        </Modal>
      )}

      {/* BATTLE MODAL */}
      {battle && (
        <Modal onClose={() => battle.done && setBattle(null)}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: battle.nation.color }}>WAR FOR {battle.nation.name.toUpperCase()}</div>
            <div style={{ textAlign: "left", margin: "14px 0", minHeight: 110, fontSize: 14, background: "#0b0e14", borderRadius: 8, padding: 12 }}>
              {battle.lines.map((l, i) => <div key={i} style={{ padding: "4px 0" }}>{l}</div>)}
              {!battle.done && <div style={{ opacity: 0.5 }}>▋</div>}
            </div>
            {battle.done && (
              <>
                <div style={{ fontSize: 24, fontWeight: 700, color: battle.won ? "#7ee08a" : "#c4453c", margin: "8px 0" }}>
                  {battle.won ? "👑 VICTORY" : "DEFEAT"}
                </div>
                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 12 }}>
                  {battle.won
                    ? `${battle.nation.name} is yours. Their people worship ${state.godName} now, paying +${battle.nation.tribute} Power every time you train.`
                    : `Your War Strength (${armyPower}) wasn't enough${state.power < battle.nation.cost ? " and your Power reserves ran dry" : ""}. No losses — return when your training has made you stronger.`}
                </div>
                <button style={S.btn()} onClick={() => setBattle(null)}>Return to the Map</button>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* SHARE CARD MODAL */}
      {shareImg && (
        <Modal onClose={() => setShareImg(null)}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#caa6f0", textAlign: "center", marginBottom: 12 }}>📸 Your Empire</div>
          <img src={shareImg} alt="IronWorld empire card" style={{ width: "100%", borderRadius: 8, border: "1px solid #2a3242" }} />
          <a href={shareImg} download={`ironworld-${state.worldName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`} style={{ textDecoration: "none" }}>
            <button style={{ ...S.btn("#7d5ba6", "#fff"), marginTop: 12 }}>⬇ Download Card</button>
          </a>
          <div style={{ ...S.small, textAlign: "center", marginTop: 8 }}>Save it and share your world anywhere.</div>
        </Modal>
      )}

      {/* NEW AGE MODAL */}
      {prestigeOpen && (
        <Modal onClose={() => setPrestigeOpen(false)}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#caa6f0", textAlign: "center" }}>✦ Begin a New Age</div>
          <div style={{ ...S.small, textAlign: "center", margin: "6px 0 12px" }}>Choose one relic to carry into eternity. It keeps a doubled boon forever, across every Age to come. The map will reset and the gods will return stronger — but your training, Champions, Wonders, and Power all remain.</div>
          {NATIONS.filter((n) => state.conquered.includes(n.id) && !(state.eternalRelics || []).includes(n.id)).map((n) => {
            const r = RELICS[n.id];
            return (
              <div key={n.id} style={{ background: "#0b0e14", border: `1px solid ${n.color}`, borderRadius: 8, padding: 12, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{r.icon} {r.name}</div>
                <div style={S.small}>{r.flavor}</div>
                <button style={{ ...S.btn("#7d5ba6", "#fff"), padding: "9px", marginTop: 8 }} onClick={() => doPrestige(n.id)}>Carry {r.name} into the New Age</button>
              </div>
            );
          })}
          {NATIONS.filter((n) => state.conquered.includes(n.id) && !(state.eternalRelics || []).includes(n.id)).length === 0 && (
            <div style={S.small}>All your relics are already eternal. Conquer a new map to bank more.</div>
          )}
        </Modal>
      )}

      {/* SMITE MODAL */}
      {smiteOpen && (        <Modal onClose={() => setSmiteOpen(false)}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#c4453c", textAlign: "center" }}>⚡ Smite a Rival</div>
          <div style={{ ...S.small, textAlign: "center", margin: "6px 0 12px" }}>Crack one nation's defenses by 20%, forever. Cost: {POWERS.find((p) => p.id === "smite").cost}⚡.</div>
          {NATIONS.filter((n) => !state.conquered.includes(n.id) && era >= n.eraReq && !(pw.smited && pw.smited[n.id])).map((n) => (
            <div key={n.id} style={{ background: "#0b0e14", border: `1px solid ${n.color}`, borderRadius: 8, padding: 12, marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: n.color }}>{n.name}</div>
              <div style={S.small}>Defense {n.defense} → {Math.round(n.defense * 0.8)}</div>
              <button style={{ ...S.btn(state.power >= 250 ? n.color : "#2a3242", state.power >= 250 ? "#0b0e14" : "#6a7280"), padding: "9px", marginTop: 8 }} disabled={state.power < 250} onClick={() => smiteNation(n)}>
                ⚡ Smite {n.name}
              </button>
            </div>
          ))}
          {NATIONS.filter((n) => !state.conquered.includes(n.id) && era >= n.eraReq && !(pw.smited && pw.smited[n.id])).length === 0 && (
            <div style={S.small}>No rivals to smite right now — reach a new era to unlock more nations.</div>
          )}
        </Modal>
      )}

      {/* CROWN CHAMPION MODAL */}
      {crownOpen && (
        <Modal onClose={() => setCrownOpen(false)}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#f0b541", textAlign: "center" }}>Crown a Champion</div>
          <div style={{ ...S.small, textAlign: "center", margin: "6px 0 12px" }}>Raise one mortal into legend. They rule in your name forever, and their gift never fades. Cost: {crownCost}⚡.</div>
          {availableChosen.map((c) => {
            const tr = CHOSEN_TRAITS[c.trait];
            return (
              <div key={c.cid} style={{ background: "#0b0e14", border: `1px solid ${tr.color}`, borderRadius: 8, padding: 12, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name} <span style={{ color: tr.color }}>{c.epithet}</span></div>
                <div style={{ ...S.small, margin: "4px 0 6px" }}>{tr.story(c.name, state.worldName)}</div>
                <div style={{ fontSize: 13, color: tr.color, marginBottom: 8 }}>Gift: {tr.bonusLabel}</div>
                <button style={{ ...S.btn(state.power >= crownCost ? tr.color : "#2a3242", state.power >= crownCost ? "#0b0e14" : "#6a7280"), padding: "10px" }} disabled={state.power < crownCost} onClick={() => crownChampion(c)}>
                  👑 Crown {c.name} · {crownCost}⚡
                </button>
              </div>
            );
          })}
          {availableChosen.length === 0 && <div style={S.small}>No mortals are ready. Build Longhouses to grow your people.</div>}
        </Modal>
      )}

      {/* CHAMPION CELEBRATION MODAL */}
      {celebrate && (
        <Modal onClose={() => setCelebrate(null)}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 44 }}>👑</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: CHOSEN_TRAITS[celebrate.trait].color, margin: "6px 0" }}>{celebrate.name} {celebrate.epithet}</div>
            <div style={{ ...S.small, marginBottom: 8 }}>Founder of House {celebrate.surname}</div>
            <div style={{ fontSize: 13, opacity: 0.85, margin: "0 0 12px" }}>{CHOSEN_TRAITS[celebrate.trait].story(celebrate.name, state.worldName)}</div>
            <div style={{ fontSize: 14, color: CHOSEN_TRAITS[celebrate.trait].color, marginBottom: 14 }}>Eternal gift: {champLabel(celebrate)}</div>
            <button style={S.btn()} onClick={() => { setCelebrate(null); setTab("world"); }}>Long may they reign</button>
          </div>
        </Modal>
      )}

      {/* SAGA CHAPTER READER */}
      {readChapter && (
        <Modal onClose={() => setReadChapter(null)}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#caa6f0", textAlign: "center", marginBottom: 12 }}>{readChapter.title}</div>
          <div style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{readChapter.text(stats)}</div>
          <button style={{ ...S.btn("#7d5ba6", "#fff"), marginTop: 16 }} onClick={() => setReadChapter(null)}>Close the book</button>
        </Modal>
      )}

      {/* NEW CHAPTER PING */}
      {sagaPing && !readChapter && (
        <Modal onClose={() => setSagaPing(null)}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36 }}>📖</div>
            <div style={{ fontSize: 13, opacity: 0.7, margin: "6px 0" }}>A new chapter is written</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#caa6f0", marginBottom: 14 }}>{sagaPing.title}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...S.btn("#2a3242", "#9aa3ad") }} onClick={() => setSagaPing(null)}>Later</button>
              <button style={{ ...S.btn("#7d5ba6", "#fff") }} onClick={() => { setReadChapter(sagaPing); setSagaPing(null); }}>Read it</button>
            </div>
          </div>
        </Modal>
      )}

      {/* SESSION EDITOR MODAL */}
      {editing && (
        <SessionEditor S={S} draft={editing} setDraft={setEditing} onSave={saveSession} onDelete={editing.custom || !PRESET_SESSIONS.some((p) => p.id === editing.id) ? () => deleteSession(editing.id) : () => deleteSession(editing.id)} isExisting={sessions.some((s) => s.id === editing.id)} />
      )}

      {/* TAB BAR */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 560, margin: "0 auto", display: "flex", background: "#10141d", borderTop: "2px solid #2a3242" }}>
        {[["world", "🌍", "World"], ["build", "🔨", "Build"], ["conquest", "⚔️", "Conquest"], ["train", "🏋️", "Train"], ["history", "📜", "Chronicle"]].map(([id, icon, label]) => (
          <div key={id} onClick={() => { setTab(id); setSession(null); }}
            style={{ flex: 1, textAlign: "center", padding: "10px 0 12px", cursor: "pointer", color: tab === id ? "#f0b541" : "#6a7280", borderTop: tab === id ? "2px solid #f0b541" : "2px solid transparent", marginTop: -2 }}>
            <div style={{ fontSize: 19 }}>{icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- SMALL COMPONENTS ----------
function Stat({ label, value, hint, color }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 19, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, opacity: 0.7 }}>{label}</div>
      {hint && <div style={{ fontSize: 10, opacity: 0.45 }}>{hint}</div>}
    </div>
  );
}

function Row({ k, v, gold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: gold ? "#f0b541" : "#e8e0cc" }}>
      <span style={{ fontSize: 13 }}>{k}</span><span style={{ fontWeight: 700 }}>{v}</span>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(5,7,12,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#151a24", border: "2px solid #2a3242", borderRadius: 12, padding: 18, width: "100%", maxWidth: 420, maxHeight: "85vh", overflowY: "auto", fontFamily: "inherit", color: "#e8e0cc" }}>
        {children}
      </div>
    </div>
  );
}

// ---------- CALENDAR HEATMAP ----------
function CalendarHeatmap({ workouts, banner, offset, setOffset, S }) {
  const now = new Date();
  const view = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const y = view.getFullYear(), m = view.getMonth();
  const monthName = view.toLocaleString("en-US", { month: "long", year: "numeric" });
  const daysIn = new Date(y, m + 1, 0).getDate();
  const firstDow = new Date(y, m, 1).getDay();
  const pad = (n) => String(n).padStart(2, "0");
  const trained = new Set(workouts.filter((w) => w.counted).map((w) => w.date));
  const prDays = new Set(workouts.filter((w) => w.counted && w.prs && w.prs.length > 0).map((w) => w.date));
  const todayS = todayStr();
  const monthCount = workouts.filter((w) => w.counted && w.date.startsWith(`${y}-${pad(m + 1)}`)).length;
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(`${y}-${pad(m + 1)}-${pad(d)}`);
  const cellStyle = (key) => {
    const isTrained = key && trained.has(key);
    const isPr = key && prDays.has(key);
    const isToday = key === todayS;
    return {
      aspectRatio: "1", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 10, fontWeight: 700,
      background: isTrained ? banner : key ? "#0b0e14" : "transparent",
      color: isTrained ? "#0b0e14" : "#3a4250",
      border: isPr ? "2px solid #f0b541" : isToday ? "2px solid #e8e0cc" : key ? "1px solid #1f2530" : "none",
    };
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <button onClick={() => setOffset(offset - 1)} style={{ background: "#0b0e14", border: "1px solid #2a3242", color: "#e8e0cc", borderRadius: 6, width: 30, height: 28, cursor: "pointer", fontFamily: "inherit" }}>‹</button>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{monthName}<span style={{ ...S.small, marginLeft: 8 }}>{monthCount} sessions</span></div>
        <button onClick={() => offset < 0 && setOffset(offset + 1)} disabled={offset >= 0} style={{ background: "#0b0e14", border: "1px solid #2a3242", color: offset >= 0 ? "#3a4250" : "#e8e0cc", borderRadius: 6, width: 30, height: 28, cursor: offset >= 0 ? "default" : "pointer", fontFamily: "inherit" }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 10, opacity: 0.5 }}>{d}</div>
        ))}
        {cells.map((key, i) => (
          <div key={i} style={cellStyle(key)}>{key ? Number(key.slice(8)) : ""}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 10, ...S.small }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: banner, borderRadius: 2, marginRight: 4, verticalAlign: "middle" }} />trained</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, border: "2px solid #f0b541", borderRadius: 2, marginRight: 4, verticalAlign: "middle" }} />PR day</span>
      </div>
    </div>
  );
}

// ---------- SESSION EDITOR ----------
function SessionEditor({ S, draft, setDraft, onSave, onDelete, isExisting }) {
  const set = (patch) => setDraft({ ...draft, ...patch });
  const setEx = (i, patch) => set({ exercises: draft.exercises.map((e, j) => (j === i ? { ...e, ...patch } : e)) });
  const addEx = () => set({ exercises: [...draft.exercises, { name: "", sets: "", note: "" }] });
  const rmEx = (i) => set({ exercises: draft.exercises.filter((_, j) => j !== i) });
  const [confirmDel, setConfirmDel] = useState(false);
  return (
    <Modal onClose={() => setDraft(null)}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#5fb3c9", marginBottom: 6 }}>{isExisting ? "Edit Session" : "New Session"}</div>
      <label style={{ fontSize: 12, opacity: 0.7 }}>Session name</label>
      <input style={S.input} placeholder="e.g. Throwing Day — Power" value={draft.name} onChange={(e) => set({ name: e.target.value })} />
      <label style={{ fontSize: 12, opacity: 0.7, display: "block", marginTop: 12 }}>Short description (optional)</label>
      <input style={S.input} placeholder="What this day is for" value={draft.blurb} onChange={(e) => set({ blurb: e.target.value })} />

      <label style={{ fontSize: 12, opacity: 0.7, display: "block", marginTop: 12 }}>Discipline (what this builds in your empire)</label>
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        {DISCIPLINES.map((d) => {
          const sel = sessionFocus(draft) === d.id;
          return (
            <button key={d.id} onClick={() => set({ focus: d.id })}
              style={{ flex: 1, background: sel ? d.color : "#0b0e14", color: sel ? "#0b0e14" : "#9aa3ad", border: `1px solid ${sel ? d.color : "#2a3242"}`, borderRadius: 8, padding: "8px 2px", fontFamily: "inherit", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
              {d.icon}<br />{d.focus}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, margin: "16px 0 4px" }}>Exercises</div>
      {draft.exercises.map((ex, i) => (
        <div key={i} style={{ background: "#0b0e14", border: "1px solid #2a3242", borderRadius: 8, padding: 10, marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <input style={{ ...S.input, marginTop: 0, flex: 2 }} placeholder="Exercise" value={ex.name} onChange={(e) => setEx(i, { name: e.target.value })} />
            <input style={{ ...S.input, marginTop: 0, flex: 1, minWidth: 0 }} placeholder="4 × 6" value={ex.sets} onChange={(e) => setEx(i, { sets: e.target.value })} />
          </div>
          <input style={{ ...S.input, marginTop: 6 }} placeholder="Cue / note (optional)" value={ex.note} onChange={(e) => setEx(i, { note: e.target.value })} />
          {draft.exercises.length > 1 && (
            <button onClick={() => rmEx(i)} style={{ background: "transparent", border: "none", color: "#c4453c", fontFamily: "inherit", fontSize: 12, cursor: "pointer", marginTop: 6, padding: 0 }}>✕ remove</button>
          )}
        </div>
      ))}
      <button style={{ ...S.btn("#2a3242", "#9aa3ad"), padding: "9px" }} onClick={addEx}>+ Add exercise</button>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button style={{ ...S.btn("#2a3242", "#9aa3ad") }} onClick={() => setDraft(null)}>Cancel</button>
        <button style={{ ...S.btn("#5fb3c9", "#0b0e14") }} onClick={() => onSave(draft)}>Save Session</button>
      </div>
      {isExisting && (
        <div style={{ marginTop: 10 }}>
          {!confirmDel ? (
            <button style={{ ...S.btn("#1a1420", "#c4453c"), padding: "9px" }} onClick={() => setConfirmDel(true)}>Delete this session</button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...S.btn("#2a3242", "#9aa3ad"), padding: "9px" }} onClick={() => setConfirmDel(false)}>Keep it</button>
              <button style={{ ...S.btn("#c4453c", "#fff"), padding: "9px" }} onClick={onDelete}>Delete</button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

// ---------- ONBOARDING ----------
function Onboarding({ S, onCreate }) {
  const [god, setGod] = useState("");
  const [world, setWorld] = useState("");
  const [banner, setBanner] = useState(BANNER_COLORS[0]);
  const input = { width: "100%", background: "#0b0e14", border: "2px solid #2a3242", color: "#e8e0cc", borderRadius: 8, padding: "12px", fontFamily: "inherit", fontSize: 15, marginTop: 6, boxSizing: "border-box" };
  return (
    <div style={{ ...S.app, paddingBottom: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center", padding: "36px 16px 8px" }}>
        <div style={{ fontSize: 34, fontWeight: 700, color: "#f0b541", letterSpacing: 2 }}>IRONWORLD</div>
        <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>Empire of the Iron God</div>
      </div>
      <div style={S.panel}>
        <div style={{ fontSize: 14, lineHeight: 1.7 }}>
          <span style={{ color: "#caa6f0" }}>In the beginning there was only the grey sea.</span> Then a will moved upon the water — and a world broke the surface, looking for a god to name it.<br /><br />
          <span style={{ color: "#f0b541" }}>⚡ Every gym session generates Power.</span> Power grows your civilization through <b>11 eras</b>, and you spend it to <b>build</b> forges, shrines, and longhouses that reshape your island.<br /><br />
          <span style={{ color: "#c4453c" }}>⚔️ Ten rival nations</span> surround you, each with their own god to conquer.<br /><br />
          <span style={{ color: "#7ee08a" }}>👑 Raise mortals into Champions</span> who rule in your name forever — and watch your whole legend unfold, one chapter at a time, in the Saga.<br /><br />
          <span style={{ opacity: 0.8 }}>🔥 Consistency is the whole game. Miss days and nothing is destroyed; your world just sleeps until you return.</span>
        </div>
      </div>
      <div style={S.panel}>
        <label style={{ fontSize: 13, opacity: 0.8 }}>Your god name</label>
        <input style={input} placeholder="e.g. Derek the Undying" value={god} onChange={(e) => setGod(e.target.value)} />
        <label style={{ fontSize: 13, opacity: 0.8, display: "block", marginTop: 14 }}>Your world's name</label>
        <input style={input} placeholder="e.g. New Oxford" value={world} onChange={(e) => setWorld(e.target.value)} />
        <label style={{ fontSize: 13, opacity: 0.8, display: "block", marginTop: 14 }}>Banner color</label>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {BANNER_COLORS.map((c) => (
            <div key={c} onClick={() => setBanner(c)} style={{ width: 38, height: 38, borderRadius: 8, background: c, cursor: "pointer", border: banner === c ? "3px solid #fff" : "3px solid transparent" }} />
          ))}
        </div>
      </div>
      <div style={{ margin: "10px 12px" }}>
        <button style={S.btn()} onClick={() => onCreate(god.trim(), world.trim(), banner)}>⚡ Raise the World</button>
      </div>
    </div>
  );
}
