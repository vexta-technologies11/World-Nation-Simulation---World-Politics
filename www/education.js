// ═══════════════════════════════════════════════════════════════
// education.js — Sovereign State: Education System Engine
// ─────────────────────────────────────────────────────────────
// 3-Tier Pipeline: Primary → Secondary → Tertiary (University)
// Fictional universities per nation, global + local rankings,
// R&D wiring, brain drain, lost generation, tech breakthroughs.
// ═══════════════════════════════════════════════════════════════

'use strict';

// ─── CONSTANTS ────────────────────────────────────────────────
const EDU_SPEND_MIN_GDP_PCT  = 2.0;   // Below this → education decays
const EDU_SPEND_FULL_GDP_PCT = 6.5;   // Above this → max growth effect
const EDU_TURN_LAG_TERTIARY  = 18;    // Turns before tertiary investment shows
const MAX_UNIS_PER_NATION    = 12;
const UNI_RANKING_INTERVAL   = 4;     // Recalculate rankings every N turns

// ─── UNIVERSITY NAME POOLS ────────────────────────────────────
const UNI_NAME_PREFIXES = [
  'Aldwick','Brennar','Calveth','Dorvale','Elstow','Farwick','Grenvale','Harwick',
  'Irondale','Jaxmore','Keldren','Lorwick','Morval','Nelvast','Ortham','Pelwick',
  'Quelmar','Renvale','Solwick','Talmore','Ulvast','Veldren','Westham','Xorvale',
  'Yeldwick','Zeltham','Ashthorn','Brackmoor','Coldwick','Dunmore','Eastholm',
  'Frostwick','Greyholm','Hallwick','Ironwick','Jarlmore','Kellwick','Landmoor',
  'Marshwick','Northmoor','Oldwick','Pinholm','Queensmoor','Redmoor','Sandwick',
  'Tealwick','Undholm','Verdwick','Windmoor','Yarwick','Zelmoor','Brightwick',
  'Clearwick','Deepmoor','Edgewick','Fairholm','Goldwick','Highmore','Ivymoor',
  'Jadwick','Kirkwick','Longmoor','Mistwick','Nightholm','Oakmoor','Primwick',
  'Quickmoor','Rainwick','Stonewick','Tidewick','Upperwick','Valwick','Wavemore',
  'Ximoor','Yellowwick','Zealmoor','Ardwick','Bladewick','Crestwick','Dawnmore',
  'Embermoor','Fablewick','Glorywick','Honorwick','Ironholme','Justwick','Knightwick',
  'Lionmoor','Mightwick','Noblwick','Orderwick','Peacewick','Questwick','Risenwick',
  'Shieldwick','Trustwick','Unitywick','Valorwick','Wisdomoor','Xcelmoor','Aldenmoor',
  'Braxton','Creston','Delvir','Elwyn','Forwick','Grasmoor','Havenmoor','Inwick',
  'Jaswick','Kendwick','Larchwick','Minwick','Norwick','Oldmoor','Plymwick',
];

const UNI_SUFFIXES = [
  'University',
  'Institute of Technology',
  'College',
  'Academy',
  'Polytechnic',
  'School of Science and Technology',
  'Institute of Advanced Studies',
  'University of Applied Sciences',
  'Technical University',
  'National University',
];

const UNI_COUNTRY_PATTERNS = [
  (name) => `University of ${name}`,
  (name) => `${name} Institute of Technology`,
  (name) => `National University of ${name}`,
  (name, abbr) => `${abbr} Polytechnic University`,
  (name) => `Royal ${name} University`,
  (name) => `${name} Academy of Sciences`,
  (name) => `${name} State University`,
  (name, abbr) => `${abbr} Institute of Advanced Studies`,
];

const UNI_SPECIALIZATIONS = [
  { id: 'stem',         label: '🔬 STEM',           rdBoost: 0.40, techBoost: 0.35 },
  { id: 'engineering',  label: '⚙️ Engineering',     rdBoost: 0.30, techBoost: 0.28 },
  { id: 'medicine',     label: '🏥 Medicine',        rdBoost: 0.20, techBoost: 0.10 },
  { id: 'business',     label: '💼 Business',        rdBoost: 0.08, techBoost: 0.05 },
  { id: 'liberal_arts', label: '📚 Liberal Arts',    rdBoost: 0.05, techBoost: 0.03 },
  { id: 'agriculture',  label: '🌾 Agriculture',     rdBoost: 0.12, techBoost: 0.08 },
  { id: 'military_sci', label: '🎖️ Military Science', rdBoost: 0.15, techBoost: 0.18 },
];

// ─── GOVERNMENT EDUCATION PROFILES ────────────────────────────
// primaryCap/secondaryCap/tertiaryCap = max enrollment % for that gov type
// completionBonus = multiplier on completion rates
// brainDrainResist = 0 (no resist) → 1 (full resist)
// rdBonus = university R&D multiplier
// uniCount = [min, max] universities
const EDU_GOV_PROFILES = {
  liberal_democracy:       { primaryCap: 98, secondaryCap: 92, tertiaryCap: 65, completionBonus: 1.10, brainDrainResist: 0.80, rdBonus: 1.10, uniCount: [3, 8]  },
  federal_republic:        { primaryCap: 96, secondaryCap: 88, tertiaryCap: 60, completionBonus: 1.05, brainDrainResist: 0.75, rdBonus: 1.00, uniCount: [3, 7]  },
  constitutional_monarchy: { primaryCap: 94, secondaryCap: 85, tertiaryCap: 58, completionBonus: 1.00, brainDrainResist: 0.70, rdBonus: 0.95, uniCount: [2, 6]  },
  welfare_state:           { primaryCap: 99, secondaryCap: 96, tertiaryCap: 75, completionBonus: 1.25, brainDrainResist: 0.85, rdBonus: 1.20, uniCount: [4, 9]  },
  technocratic_council:    { primaryCap: 97, secondaryCap: 95, tertiaryCap: 80, completionBonus: 1.30, brainDrainResist: 0.90, rdBonus: 1.50, uniCount: [5, 12] },
  authoritarian_state:     { primaryCap: 85, secondaryCap: 68, tertiaryCap: 35, completionBonus: 0.80, brainDrainResist: 0.30, rdBonus: 0.70, uniCount: [1, 4]  },
  dictatorship:            { primaryCap: 75, secondaryCap: 52, tertiaryCap: 20, completionBonus: 0.60, brainDrainResist: 0.20, rdBonus: 0.50, uniCount: [1, 3]  },
  military_junta:          { primaryCap: 70, secondaryCap: 48, tertiaryCap: 18, completionBonus: 0.55, brainDrainResist: 0.25, rdBonus: 0.45, uniCount: [1, 3]  },
  theocratic_state:        { primaryCap: 72, secondaryCap: 45, tertiaryCap: 22, completionBonus: 0.50, brainDrainResist: 0.35, rdBonus: 0.40, uniCount: [1, 4]  },
  socialist_republic:      { primaryCap: 95, secondaryCap: 82, tertiaryCap: 50, completionBonus: 0.95, brainDrainResist: 0.50, rdBonus: 0.85, uniCount: [2, 7]  },
  communist_state:         { primaryCap: 92, secondaryCap: 78, tertiaryCap: 45, completionBonus: 0.90, brainDrainResist: 0.40, rdBonus: 0.80, uniCount: [2, 6]  },
  oligarchic_republic:     { primaryCap: 80, secondaryCap: 62, tertiaryCap: 38, completionBonus: 0.75, brainDrainResist: 0.40, rdBonus: 0.65, uniCount: [1, 5]  },
  tribal_confederation:    { primaryCap: 55, secondaryCap: 30, tertiaryCap: 10, completionBonus: 0.40, brainDrainResist: 0.60, rdBonus: 0.30, uniCount: [0, 2]  },
  failed_state:            { primaryCap: 20, secondaryCap: 10, tertiaryCap: 3,  completionBonus: 0.20, brainDrainResist: 0.10, rdBonus: 0.15, uniCount: [0, 1]  },
};

// ─── GLOBAL UNIVERSITY REGISTRY ───────────────────────────────
const GLOBAL_UNIVERSITIES = {};  // { nationId: [uniObjects] }
let _uniRankingCache  = null;
let _lastRankingTurn  = -999;

// ─── HELPERS ──────────────────────────────────────────────────
function clampEdu(v, lo, hi) {
  return Math.max(lo, Math.min(hi, isFinite(v) ? v : lo));
}

function seededEduRand(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  h = ((h ^ (h >>> 16)) * 0x45d9f3b) | 0;
  h = ((h ^ (h >>> 16)) * 0x45d9f3b) | 0;
  h ^= h >>> 16;
  return (h >>> 0) / 0xffffffff;
}

function seededEduChoice(arr, seed) {
  if (!arr || arr.length === 0) return arr ? arr[0] : undefined;
  return arr[Math.floor(seededEduRand(seed) * arr.length)];
}

function getEduGovProfile(governmentStyle) {
  return EDU_GOV_PROFILES[governmentStyle] || EDU_GOV_PROFILES.federal_republic;
}

// ─── UNIVERSITY NAME GENERATION ───────────────────────────────
function generateUniversityName(nationName, nationAbbr, index, seed) {
  const r  = seededEduRand(seed + '_name_' + index);
  const r2 = seededEduRand(seed + '_type_' + index);

  // 30% chance → use a country-name pattern
  if (r < 0.30 && nationName) {
    const pattern = UNI_COUNTRY_PATTERNS[Math.floor(r2 * UNI_COUNTRY_PATTERNS.length)];
    const abbr = nationAbbr || nationName.slice(0, 3).toUpperCase();
    return pattern(nationName, abbr);
  }

  // 70% chance → fictional prefix + suffix
  const prefix = seededEduChoice(UNI_NAME_PREFIXES, seed + '_pre_' + index);
  const suffix = seededEduChoice(UNI_SUFFIXES,      seed + '_suf_' + index);
  return prefix + ' ' + suffix;
}

function generateUniversityShortName(fullName) {
  return fullName
    .split(' ')
    .filter(w => w.length > 3 && !['of', 'the', 'and', 'for'].includes(w.toLowerCase()))
    .map(w => w[0].toUpperCase())
    .join('')
    .slice(0, 5) || fullName.slice(0, 3).toUpperCase();
}

function generateUniversitiesForNation(nation, nationId) {
  if (GLOBAL_UNIVERSITIES[nationId]) return; // already seeded

  const govProfile = getEduGovProfile(nation.governmentStyle);
  const [minUni, maxUni] = govProfile.uniCount;
  const gdpFactor = clampEdu((nation.gdp || 1) / 12, 0.05, 1);
  const eduFactor = clampEdu((nation.education || 50) / 100, 0.05, 1);

  const rawCount  = minUni + Math.round((maxUni - minUni) * (gdpFactor * 0.6 + eduFactor * 0.4));
  const uniCount  = clampEdu(rawCount, minUni, Math.min(maxUni, MAX_UNIS_PER_NATION));

  const unis = [];
  for (let i = 0; i < uniCount; i++) {
    const seed   = nationId + '_uni_' + i;
    const abbr   = (nation.abbr || nationId.slice(0, 3)).toUpperCase();
    const name   = generateUniversityName(nation.name || nationId, abbr, i, seed);
    const specIdx = Math.floor(seededEduRand(seed + '_spec') * UNI_SPECIALIZATIONS.length);
    const spec    = UNI_SPECIALIZATIONS[specIdx];

    // First university is always a research tier; rest are teaching / polytechnic
    const tierRoll = seededEduRand(seed + '_tier');
    const tier = i === 0 ? 'research' : (tierRoll < 0.35 ? 'teaching' : 'polytechnic');

    const basePrestige = clampEdu(
      30 + (nation.education || 50) * 0.45 + (nation.gdp || 1) * 1.2 - i * 6
        + (seededEduRand(seed + '_pres') - 0.5) * 22,
      5, 99
    );

    // Capacity proportional to population + GDP
    const baseCapacity = Math.round(clampEdu(
      (nation.population || 10) * 600 + (nation.gdp || 1) * 2200 - i * 1200,
      400, 150000
    ));

    unis.push({
      id:           `uni_${nationId}_${i}`,
      name,
      shortName:    generateUniversityShortName(name),
      nationId,
      specialization: spec.id,
      tier,
      founded:      -(Math.round(seededEduRand(seed + '_age') * 500)),
      enrollment:   Math.round(baseCapacity * 0.65),
      capacity:     baseCapacity,
      prestige:     basePrestige,
      fundingLevel: clampEdu(50 + (nation.gdp || 1) * 2.5 + (seededEduRand(seed + '_fund') - 0.5) * 20, 5, 100),
      researchOutput: 0,
      annualGrads:  0,
      rdFocus:      tier === 'research' ? 0.55 : (tier === 'polytechnic' ? 0.25 : 0.15),
      breakthroughs: 0,
      ranking:      { local: i + 1, global: 9999 },
    });
  }

  GLOBAL_UNIVERSITIES[nationId] = unis;
}

// ─── SEED ALL NATIONS AT GAME START ───────────────────────────
function seedAllUniversities() {
  if (typeof NATIONS === 'undefined') return;
  Object.entries(NATIONS).forEach(([nId, n]) => generateUniversitiesForNation(n, nId));
}

// ─── EDUCATION STATE INITIALIZER ──────────────────────────────
function initNationEducationState(nation, nationId) {
  if (nation.eduState) return;

  const govProfile = getEduGovProfile(nation.governmentStyle);
  const edu = nation.education || 50;

  const basePrimary   = clampEdu(edu * 0.88 + (govProfile.primaryCap   - 60) * 0.35, 8,  govProfile.primaryCap);
  const baseSecondary = clampEdu(edu * 0.65 + (govProfile.secondaryCap - 60) * 0.25, 4,  govProfile.secondaryCap);
  const baseTertiary  = clampEdu(edu * 0.38 + (govProfile.tertiaryCap  - 30) * 0.22, 1,  govProfile.tertiaryCap);

  nation.eduState = {
    // Enrollment rates (% of eligible age group)
    primaryEnrollPct:   basePrimary,
    secondaryEnrollPct: baseSecondary,
    tertiaryEnrollPct:  baseTertiary,

    // Completion rates (of those enrolled, per tier)
    primaryCompletePct:   clampEdu(basePrimary * 0.88,   5, 98),
    secondaryCompletePct: clampEdu(baseSecondary * 0.75,  3, 95),
    tertiaryCompletePct:  clampEdu(baseTertiary * 0.65,   1, 90),

    // Derived workforce stats
    literacyRate:    clampEdu(basePrimary * 0.88,   5, 99),
    skilledLaborPct: clampEdu(baseSecondary * 0.65,  2, 92),
    highSkillPct:    clampEdu(baseTertiary * 0.55,   0.5, 55),

    // Spending
    spendGDP:      0,
    spendAbsolute: 0,

    // Graduates per turn (approx monthly)
    primaryGrads:   0,
    secondaryGrads: 0,
    tertiaryGrads:  0,

    // Pipeline lag for tertiary changes
    tertiaryLagTurns: EDU_TURN_LAG_TERTIARY,
    tertiaryPipeline: baseTertiary,

    // Brain drain
    brainDrainRate:    0,
    emigratedScholars: 0,

    // War disruption effects
    lostGeneration: 0,  // 0-1, decays ~0.003/turn
    schoolDamage:   0,  // 0-1, repairs with spending

    // R&D contribution
    uniRDOutput:       0,
    techBreakthroughs: 0,
  };
}

// ─── SPENDING COMPUTATION ─────────────────────────────────────
// Education is ~40% of social spending; govt spends ~28% of GDP overall.
function computeEduSpendGDP(sourceBudget) {
  const socialPct   = clampEdu(sourceBudget ? (Number(sourceBudget.social) || 0) : 0, 0, 60);
  const govSpendPct = 28;
  const eduShare    = 0.40;
  return clampEdu((socialPct / 100) * govSpendPct * eduShare, 0, 18);
}

// ─── DISRUPTION FACTORS ───────────────────────────────────────
function computeEduDisruption(nation, nationId) {
  const warPressure  = (typeof getWarPressure === 'function') ? getWarPressure(nationId) : 0;
  const warHit       = clampEdu(warPressure * 0.75, 0, 0.80);
  const inflationHit = clampEdu((nation.inflation - 6) * 0.012,        0, 0.40);
  const ineqHit      = clampEdu((nation.inequality - 50) * 0.005,      0, 0.25);
  const corruptHit   = clampEdu((nation.corruption - 40) * 0.006,      0, 0.30);
  const religHit     = clampEdu((nation.religionInfluence - 65) * 0.006, 0, 0.25);
  const crisisHit    = (nation.inCrisis || nation.failedState) ? 0.35 : 0;

  return {
    total: clampEdu(warHit + inflationHit + ineqHit + corruptHit + religHit + crisisHit, 0, 0.95),
    warHit, inflationHit, ineqHit, corruptHit, religHit, crisisHit,
  };
}

// ─── ENROLLMENT PROCESSING ────────────────────────────────────
function processEnrollmentRates(nation, disruption, govProfile, spendGDP) {
  const es = nation.eduState;

  // How far above/below the minimum viable spend are we?
  const spendDelta = clampEdu(
    (spendGDP - EDU_SPEND_MIN_GDP_PCT) / (EDU_SPEND_FULL_GDP_PCT - EDU_SPEND_MIN_GDP_PCT),
    -1, 1
  );
  const spendMult = 1 + spendDelta * 0.5;

  // Enrollment targets scale down under disruption
  const primaryTarget   = govProfile.primaryCap   * (1 - disruption.total * 0.55);
  const secondaryTarget = govProfile.secondaryCap * (1 - disruption.total * 0.75);
  const tertiaryTarget  = govProfile.tertiaryCap  * (1 - disruption.total * 0.95);

  // Primary moves fastest (cheapest), tertiary slowest (expensive, long pipeline)
  es.primaryEnrollPct   = clampEdu(es.primaryEnrollPct   + (primaryTarget   - es.primaryEnrollPct)   * 0.008 * spendMult, 2, govProfile.primaryCap);
  es.secondaryEnrollPct = clampEdu(es.secondaryEnrollPct + (secondaryTarget  - es.secondaryEnrollPct) * 0.005 * spendMult, 1, govProfile.secondaryCap);

  // Tertiary uses a pipeline buffer with a lag before enrollment changes are felt
  es.tertiaryPipeline   = clampEdu(es.tertiaryPipeline + (tertiaryTarget - es.tertiaryPipeline) * 0.003 * spendMult, 0.5, govProfile.tertiaryCap);
  if (es.tertiaryLagTurns > 0) {
    es.tertiaryLagTurns--;
  } else {
    es.tertiaryEnrollPct = clampEdu(es.tertiaryEnrollPct + (es.tertiaryPipeline - es.tertiaryEnrollPct) * 0.04, 0.5, govProfile.tertiaryCap);
  }
}

// ─── COMPLETION RATE PROCESSING ───────────────────────────────
function processCompletionRates(nation, disruption, govProfile) {
  const es       = nation.eduState;
  const govBonus = govProfile.completionBonus;
  const lostGen  = es.lostGeneration || 0;
  const schDmg   = es.schoolDamage   || 0;
  const gdpF     = clampEdu((nation.gdp || 1) / 8, 0.1, 1.5);
  const govF     = clampEdu((nation.governance || 50) / 65, 0.2, 1.3);
  const disFactor = 1 - disruption.total;

  const tPrim = clampEdu(85 * govBonus * gdpF * govF * disFactor * (1 - schDmg * 0.4) * (1 - lostGen * 0.3), 3, 98);
  const tSec  = clampEdu(72 * govBonus * gdpF * govF * disFactor * (1 - lostGen * 0.5), 2, 95);
  const tTert = clampEdu(
    62 * govBonus * (gdpF * 0.7 + clampEdu(es.spendGDP / 6, 0, 0.5)) * govF * disFactor * (1 - lostGen * 0.6),
    0.5, 90
  );

  es.primaryCompletePct   = clampEdu(es.primaryCompletePct   + (tPrim - es.primaryCompletePct)   * 0.020, 1,   98);
  es.secondaryCompletePct = clampEdu(es.secondaryCompletePct + (tSec  - es.secondaryCompletePct) * 0.015, 0.5, 95);
  es.tertiaryCompletePct  = clampEdu(es.tertiaryCompletePct  + (tTert - es.tertiaryCompletePct)  * 0.012, 0.3, 90);
}

// ─── GRADUATE COUNTING ────────────────────────────────────────
function processGraduates(nation, nationId) {
  const es  = nation.eduState;
  const pop = (nation.population || 10) * 1e6;  // in absolute people

  // School-age cohorts as % of total population (rough real-world estimates)
  const primaryAgePop   = pop * 0.12;
  const secondaryAgePop = pop * 0.08;
  const tertiaryAgePop  = pop * 0.06;

  // Grads = enrolled × completion ÷ years in tier
  es.primaryGrads   = Math.round(primaryAgePop   * (es.primaryEnrollPct / 100)   * (es.primaryCompletePct / 100)   / 6);
  es.secondaryGrads = Math.round(secondaryAgePop * (es.secondaryEnrollPct / 100) * (es.secondaryCompletePct / 100) / 6);
  es.tertiaryGrads  = Math.round(tertiaryAgePop  * (es.tertiaryEnrollPct / 100)  * (es.tertiaryCompletePct / 100)  / 4);

  // Distribute university enrollment proportionally by prestige
  const unis = GLOBAL_UNIVERSITIES[nationId] || [];
  if (unis.length > 0) {
    const totalCapacity = unis.reduce((s, u) => s + (u.capacity || 0), 0);
    const enrollTarget  = Math.min(tertiaryAgePop * (es.tertiaryEnrollPct / 100), totalCapacity);
    const totalPrestige = unis.reduce((s, u) => s + Math.max(u.prestige || 1, 1), 0);
    unis.forEach(u => {
      u.enrollment  = Math.round(enrollTarget * ((u.prestige || 1) / totalPrestige));
      u.annualGrads = Math.round(u.enrollment * (es.tertiaryCompletePct / 100) / 4);
    });
  }
}

// ─── BRAIN DRAIN ─────────────────────────────────────────────
function processBrainDrain(nation, nationId) {
  const es         = nation.eduState;
  const govProfile = getEduGovProfile(nation.governmentStyle);

  const gdpPerCapN    = clampEdu((nation.gdp || 1) / Math.max(1, (nation.population || 10)), 0, 10);
  const authorPenalty = 1 - govProfile.brainDrainResist;
  const ineqFactor    = clampEdu((nation.inequality - 40) / 60, 0, 1);
  const gdpPull       = clampEdu(1 - gdpPerCapN / 5, 0, 0.8);  // low GDP/cap → pull to richer
  const warP          = (typeof getWarPressure === 'function') ? getWarPressure(nationId) : 0;

  es.brainDrainRate = clampEdu(
    (authorPenalty * 0.4 + ineqFactor * 0.2 + gdpPull * 0.3 + warP * 0.5) * (es.highSkillPct / 30),
    0, 0.5
  );

  // Drain slowly erodes the high-skill workforce
  if (es.brainDrainRate > 0.05) {
    const drained = es.highSkillPct * es.brainDrainRate * 0.003;
    es.highSkillPct      = clampEdu(es.highSkillPct - drained, 0.1, 55);
    es.emigratedScholars = (es.emigratedScholars || 0) + Math.round(drained * (nation.population || 10) * 1e4);
  }
}

// ─── WORKFORCE DERIVATION ─────────────────────────────────────
function deriveWorkforcePcts(nation) {
  const es = nation.eduState;

  const tLit  = clampEdu(es.primaryCompletePct   * 0.95, 5, 99);
  const tSkil = clampEdu(es.secondaryCompletePct * 0.88, 2, 92);
  const tHigh = clampEdu(es.tertiaryCompletePct  * 0.72, 0.2, 55);

  // Literacy is a slow generational stat; high-skill is slowest
  es.literacyRate    = clampEdu(es.literacyRate    + (tLit  - es.literacyRate)    * 0.005, 1, 99);
  es.skilledLaborPct = clampEdu(es.skilledLaborPct + (tSkil - es.skilledLaborPct) * 0.008, 0.5, 92);
  es.highSkillPct    = clampEdu(es.highSkillPct    + (tHigh - es.highSkillPct)    * 0.004, 0.1, 55);
}

// ─── WAR / CRISIS DAMAGE DECAY ────────────────────────────────
function decayWarDamage(nation, nationId) {
  const es  = nation.eduState;
  const war = (typeof getWarPressure === 'function') ? getWarPressure(nationId) : 0;

  // Active war inflates lost-generation and damages school infrastructure
  if (war > 0.1) {
    es.lostGeneration = clampEdu(es.lostGeneration + war * 0.015, 0, 1);
    es.schoolDamage   = clampEdu(es.schoolDamage   + war * 0.008, 0, 1);
  }

  // Natural recovery (schools repair faster when funded)
  es.lostGeneration = clampEdu(es.lostGeneration - 0.003, 0, 1);
  const repairRate  = 0.006 + (es.spendGDP > EDU_SPEND_MIN_GDP_PCT ? 0.006 : 0);
  es.schoolDamage   = clampEdu(es.schoolDamage   - repairRate, 0, 1);
}

// ─── UNIVERSITY R&D PROCESSING ────────────────────────────────
function processUniversityRD(nation, nationId) {
  const es        = nation.eduState;
  const unis      = GLOBAL_UNIVERSITIES[nationId] || [];
  if (!unis.length) return 0;

  const spendFactor = clampEdu(es.spendGDP / EDU_SPEND_FULL_GDP_PCT, 0.05, 1.5);
  const gdpFactor   = clampEdu((nation.gdp || 1) / 10, 0.05, 2.0);
  const govProfile  = getEduGovProfile(nation.governmentStyle);
  let   totalRD     = 0;

  unis.forEach(uni => {
    const specDef  = UNI_SPECIALIZATIONS.find(s => s.id === uni.specialization) || UNI_SPECIALIZATIONS[0];
    const tierMult = uni.tier === 'research' ? 1.5 : uni.tier === 'polytechnic' ? 0.9 : 0.6;

    uni.researchOutput = clampEdu(
      (uni.prestige / 100) * tierMult * uni.rdFocus * spendFactor * gdpFactor * govProfile.rdBonus * specDef.rdBoost * 10,
      0, 8
    );

    // Funding pressure slowly drifts prestige
    const fundingDiff = (es.spendGDP / EDU_SPEND_FULL_GDP_PCT) - 0.5;
    uni.prestige      = clampEdu(uni.prestige + fundingDiff * 0.05 + (Math.random() - 0.5) * 0.2, 1, 99);
    uni.fundingLevel  = clampEdu(spendFactor * 80 + Math.random() * 10, 5, 100);

    // Research breakthrough chance (small but real)
    const btChance = clampEdu(
      uni.rdFocus * specDef.rdBoost * spendFactor * 0.002 * (uni.prestige / 60),
      0.0001, 0.015
    );
    if (Math.random() < btChance) {
      uni.breakthroughs = (uni.breakthroughs || 0) + 1;
      es.techBreakthroughs = (es.techBreakthroughs || 0) + 1;
      if (typeof addNews === 'function') {
        addNews(`🎓 ${uni.name} (${nation.flag || ''} ${nation.name}) achieves a research breakthrough!`, 'minor');
      }
      // Direct tech bump from a breakthrough
      if (nation.techLevel !== undefined) {
        nation.techLevel = clampEdu(nation.techLevel + clampEdu(totalRD * 0.0008 * govProfile.rdBonus, 0, 0.05), 1, 10);
      }
    }

    totalRD += uni.researchOutput;
  });

  es.uniRDOutput = totalRD;
  return totalRD;
}

// ─── MAIN EDUCATION TURN ──────────────────────────────────────
function processNationEducation(nation, nationId, sourceBudget) {
  initNationEducationState(nation, nationId);
  const es = nation.eduState;

  // 1. Spending
  es.spendGDP      = computeEduSpendGDP(sourceBudget);
  es.spendAbsolute = (nation.gdp || 1) * (es.spendGDP / 100);

  // 2. Disruption snapshot
  const govProfile = getEduGovProfile(nation.governmentStyle);
  const disruption = computeEduDisruption(nation, nationId);

  // 3. Pipeline
  decayWarDamage(nation, nationId);
  processEnrollmentRates(nation, disruption, govProfile, es.spendGDP);
  processCompletionRates(nation, disruption, govProfile);
  processGraduates(nation, nationId);
  deriveWorkforcePcts(nation);
  processBrainDrain(nation, nationId);

  // 4. University R&D
  processUniversityRD(nation, nationId);

  // 5. Recompute composite nation.education (0-100)
  //    Replaces the old social*0.35 formula in game.js
  const compositeTarget =
    es.literacyRate    * 0.30 +
    es.skilledLaborPct * 0.40 +
    es.highSkillPct    * 2    * 0.30;  // ×2 because highSkillPct maxes ~55

  nation.education = clampEdu(
    nation.education + (compositeTarget - nation.education) * 0.04,
    1, 100
  );
}

// ─── R&D MULTIPLIER (called from innovationEngine in game.js) ─
function getEducationRDMultiplier(nation) {
  if (!nation || !nation.eduState) return 1.0;
  const es          = nation.eduState;
  const highSkillF  = clampEdu(es.highSkillPct / 20, 0.1, 2.0);
  const litF        = clampEdu(es.literacyRate  / 70, 0.1, 1.4);
  const uniRDF      = clampEdu((es.uniRDOutput || 0) / 10, 0, 1.5);
  return clampEdu(highSkillF * 0.5 + litF * 0.25 + uniRDF * 0.25, 0.1, 3.0);
}

// ─── RANKINGS ─────────────────────────────────────────────────
function computeUniversityRankings() {
  if (!GAME || (GAME.turn - _lastRankingTurn < UNI_RANKING_INTERVAL)) return;
  _lastRankingTurn = GAME.turn;

  // Flatten all universities
  const all = [];
  Object.entries(GLOBAL_UNIVERSITIES).forEach(([nId, unis]) => {
    unis.forEach(u => all.push(Object.assign({}, u, { _nId: nId })));
  });

  // Global sort: prestige 50% + R&D 30% + breakthroughs 20%
  all.sort((a, b) => {
    const sA = (a.prestige || 0) * 0.5 + (a.researchOutput || 0) * 3 + (a.breakthroughs || 0) * 2;
    const sB = (b.prestige || 0) * 0.5 + (b.researchOutput || 0) * 3 + (b.breakthroughs || 0) * 2;
    return sB - sA;
  });

  all.forEach((u, idx) => {
    const ref = (GLOBAL_UNIVERSITIES[u._nId] || []).find(x => x.id === u.id);
    if (ref) ref.ranking.global = idx + 1;
  });

  // Local rankings
  Object.entries(GLOBAL_UNIVERSITIES).forEach(([, unis]) => {
    [...unis]
      .sort((a, b) => ((b.prestige || 0) + (b.researchOutput || 0) * 2) - ((a.prestige || 0) + (a.researchOutput || 0) * 2))
      .forEach((u, idx) => { u.ranking.local = idx + 1; });
  });

  _uniRankingCache = all;
}

// ─── INTEGRATION ENTRY POINTS ─────────────────────────────────

// Called once at game init (after NATIONS is populated)
function eduSystemInit() {
  seedAllUniversities();
}

// Called each turn from runCountrySystemModel() in game.js
// replaces the old '// ── EDUCATION' block
function runEducationTurn(nation, nationId, sourceBudget) {
  processNationEducation(nation, nationId, sourceBudget);
  computeUniversityRankings();
}

// ─── UI HELPERS ───────────────────────────────────────────────
function _fmtEduNum(v) {
  if (!isFinite(v)) return '0';
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(0) + 'K';
  return Math.round(v).toString();
}
function _fmtP(v) { return Number(v || 0).toFixed(1) + '%'; }

// ─── UI: EDUCATION PANEL (embedded inside economy / nation view) ─
function renderEducationPanel(nation, nationId) {
  if (!nation) return '';
  initNationEducationState(nation, nationId);
  const es   = nation.eduState;
  const unis = (GLOBAL_UNIVERSITIES[nationId] || []).slice().sort((a, b) => a.ranking.local - b.ranking.local);

  const spendColor = es.spendGDP >= EDU_SPEND_MIN_GDP_PCT ? 'var(--accent-green)' : 'var(--accent-red)';
  const spendLabel = es.spendGDP < EDU_SPEND_MIN_GDP_PCT
    ? `⚠️ ${_fmtP(es.spendGDP)} of GDP (min ${EDU_SPEND_MIN_GDP_PCT}% required)`
    : `${_fmtP(es.spendGDP)} of GDP`;

  let html = '<div class="section-card" style="margin-bottom:12px">';
  html += `<h4 style="margin:0 0 10px">Education System — ${nation.name || nationId}</h4>`;

  // ── Stats row ──
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));gap:6px;margin-bottom:10px">';
  html += `<div class="resource-item"><span class="r-name">Edu Spend</span><span class="r-val" style="color:${spendColor}">${spendLabel}</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Edu $ Absolute</span><span class="r-val">${typeof formatMarketMoney === 'function' ? formatMarketMoney(es.spendAbsolute) : _fmtP(es.spendAbsolute)}</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Literacy Rate</span><span class="r-val">${_fmtP(es.literacyRate)}</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Skilled Labor</span><span class="r-val">${_fmtP(es.skilledLaborPct)}</span></div>`;
  html += `<div class="resource-item"><span class="r-name">High-Skill Workers</span><span class="r-val">${_fmtP(es.highSkillPct)}</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Brain Drain</span><span class="r-val" style="color:${es.brainDrainRate > 0.1 ? 'var(--accent-red)' : 'var(--text-secondary)'}">${_fmtP(es.brainDrainRate * 100)}</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Uni R&D Output</span><span class="r-val" style="color:var(--accent-blue)">${Number(es.uniRDOutput || 0).toFixed(2)}</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Breakthroughs</span><span class="r-val" style="color:var(--accent-yellow)">🏆 ${es.techBreakthroughs || 0}</span></div>`;
  html += '</div>';

  // ── Pipeline table ──
  html += '<strong style="font-size:12px">Education Pipeline</strong>';
  html += '<table style="width:100%;margin-top:6px;font-size:11px;border-collapse:collapse">';
  html += '<tr style="color:var(--text-muted);border-bottom:1px solid var(--border-color)">';
  html += '<th style="text-align:left;padding:3px 4px">Tier</th><th style="text-align:center">Enrollment</th><th style="text-align:center">Completion</th><th style="text-align:center">Grads/Turn</th></tr>';

  [
    { label: 'Primary',    enroll: es.primaryEnrollPct,   complete: es.primaryCompletePct,   grads: es.primaryGrads },
    { label: 'Secondary', enroll: es.secondaryEnrollPct, complete: es.secondaryCompletePct, grads: es.secondaryGrads },
    { label: 'Tertiary',   enroll: es.tertiaryEnrollPct,  complete: es.tertiaryCompletePct,  grads: es.tertiaryGrads },
  ].forEach(t => {
    const ec = t.enroll > 60 ? 'var(--accent-green)' : t.enroll > 30 ? 'var(--accent-yellow)' : 'var(--accent-red)';
    html += `<tr style="border-bottom:1px solid rgba(84,140,196,0.1)">`;
    html += `<td style="padding:3px 4px">${t.label}</td>`;
    html += `<td style="text-align:center;color:${ec}">${_fmtP(t.enroll)}</td>`;
    html += `<td style="text-align:center">${_fmtP(t.complete)}</td>`;
    html += `<td style="text-align:center;color:var(--accent-blue)">${_fmtEduNum(t.grads)}</td>`;
    html += '</tr>';
  });
  html += '</table>';

  // ── War disruption alert ──
  if (es.lostGeneration > 0.08 || es.schoolDamage > 0.08) {
    html += '<div style="background:rgba(255,60,60,0.1);border:1px solid rgba(255,60,60,0.3);border-radius:6px;padding:8px;margin-top:8px;font-size:11px">';
    if (es.lostGeneration > 0.08) html += `⚠️ <strong>Lost Generation:</strong> ${_fmtP(es.lostGeneration * 100)} of cohort affected by conflict<br>`;
    if (es.schoolDamage   > 0.08) html += `🔥 <strong>School Damage:</strong> ${_fmtP(es.schoolDamage * 100)} infrastructure degraded`;
    html += '</div>';
  }

  // ── Universities ──
  html += `<div style="margin-top:12px"><strong style="font-size:12px">Universities (${unis.length})</strong>`;
  if (unis.length === 0) {
    html += '<div class="empty" style="margin-top:6px">No universities established.</div>';
  } else {
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(258px,1fr));gap:8px;margin-top:6px">';
    unis.forEach(uni => {
      const specDef    = UNI_SPECIALIZATIONS.find(s => s.id === uni.specialization) || UNI_SPECIALIZATIONS[0];
      const presColor  = uni.prestige > 75 ? 'var(--accent-yellow)' : uni.prestige > 45 ? 'var(--accent-blue)' : 'var(--text-secondary)';
      const globalDisp = uni.ranking.global <= 9999 ? '#' + uni.ranking.global : 'Unranked';
      const globalColor= uni.ranking.global <= 100 ? 'var(--accent-green)' : 'inherit';
      html += `<div style="background:rgba(9,28,54,0.5);border:1px solid var(--border-color);border-radius:8px;padding:10px;cursor:pointer" onclick="showUniversityDetail('${uni.id}','${nationId}')">`;
      html += `<div style="font-weight:700;font-size:12px;margin-bottom:2px">${uni.name}</div>`;
      html += `<div style="font-size:10px;color:var(--text-muted);margin-bottom:6px">${uni.shortName} • ${specDef.label} • ${uni.tier.charAt(0).toUpperCase() + uni.tier.slice(1)}</div>`;
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;font-size:10px">';
      html += `<div><span style="color:var(--text-muted)">Prestige </span><span style="color:${presColor}">${Math.round(uni.prestige)}</span></div>`;
      html += `<div><span style="color:var(--text-muted)">Local </span><span>#${uni.ranking.local}</span></div>`;
      html += `<div><span style="color:var(--text-muted)">Global </span><span style="color:${globalColor}">${globalDisp}</span></div>`;
      html += `<div><span style="color:var(--text-muted)">Enrolled </span><span>${_fmtEduNum(uni.enrollment)}</span></div>`;
      html += `<div><span style="color:var(--text-muted)">Grads/yr </span><span>${_fmtEduNum(uni.annualGrads)}</span></div>`;
      html += `<div><span style="color:var(--text-muted)">R&D </span><span style="color:var(--accent-blue)">${Number(uni.researchOutput || 0).toFixed(2)}</span></div>`;
      html += `<div><span style="color:var(--text-muted)">Breakthru </span><span style="color:var(--accent-yellow)">🏆 ${uni.breakthroughs || 0}</span></div>`;
      html += '</div></div>';
    });
    html += '</div>';
  }
  html += '</div>';

  // ── Global ranking button ──
  html += `<div style="margin-top:10px"><button class="btn-sm" onclick="showGlobalUniversityRankings()" style="width:100%">View Global Top 100 Universities</button></div>`;
  html += '</div>';
  return html;
}

// ─── UI: UNIVERSITY DETAIL CARD ───────────────────────────────
function renderUniversityDetailCard(uniId, nationId) {
  const unis   = GLOBAL_UNIVERSITIES[nationId] || [];
  const uni    = unis.find(u => u.id === uniId);
  const nation = (typeof NATIONS !== 'undefined') ? NATIONS[nationId] : null;
  if (!uni) return '<div class="empty">University not found.</div>';

  const specDef = UNI_SPECIALIZATIONS.find(s => s.id === uni.specialization) || UNI_SPECIALIZATIONS[0];
  const ageTurns = uni.founded < 0 ? Math.abs(uni.founded) + (GAME ? GAME.turn : 0) : Math.max(0, (GAME ? GAME.turn : 0) - uni.founded);
  const ageYears = Math.round(ageTurns / 12);

  let html = '<div class="section-card">';
  html += '<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px">';
  html += '<span style="font-size:32px">🎓</span>';
  html += '<div>';
  html += `<div style="font-weight:700;font-size:15px">${uni.name}</div>`;
  html += `<div style="font-size:11px;color:var(--text-muted)">${uni.shortName} • ${nation ? nation.flag + ' ' + nation.name : nationId} • Est. ~${ageYears} years ago</div>`;
  html += `<div style="font-size:11px;color:var(--text-muted);margin-top:2px">Tier: <strong>${uni.tier}</strong> • ${specDef.label}</div>`;
  html += '</div></div>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));gap:6px">';
  html += `<div class="resource-item"><span class="r-name">Prestige</span><span class="r-val" style="color:var(--accent-yellow)">${Math.round(uni.prestige)} / 100</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Funding Level</span><span class="r-val">${Math.round(uni.fundingLevel)} / 100</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Enrollment</span><span class="r-val">${_fmtEduNum(uni.enrollment)}</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Capacity</span><span class="r-val">${_fmtEduNum(uni.capacity)}</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Annual Grads</span><span class="r-val" style="color:var(--accent-green)">${_fmtEduNum(uni.annualGrads)}</span></div>`;
  html += `<div class="resource-item"><span class="r-name">R&D Output</span><span class="r-val" style="color:var(--accent-blue)">${Number(uni.researchOutput || 0).toFixed(3)}</span></div>`;
  html += `<div class="resource-item"><span class="r-name">R&D Focus</span><span class="r-val">${(uni.rdFocus * 100).toFixed(0)}%</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Local Rank</span><span class="r-val">#${uni.ranking.local}</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Global Rank</span><span class="r-val" style="color:${uni.ranking.global <= 100 ? 'var(--accent-yellow)' : 'inherit'}">${uni.ranking.global <= 9999 ? '#' + uni.ranking.global : 'Unranked'}</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Breakthroughs</span><span class="r-val" style="color:var(--accent-yellow)">🏆 ${uni.breakthroughs || 0}</span></div>`;
  html += '</div>';

  // R&D Impact bar
  html += `<div style="margin-top:10px;font-size:11px">`;
  html += `<div style="color:var(--text-muted);margin-bottom:4px">R&D Output: ${Number(uni.researchOutput || 0).toFixed(3)} pts → contributes to ${nation ? nation.name : nationId}'s Innovation Engine</div>`;
  const rdBar = clampEdu((uni.researchOutput || 0) / 8 * 100, 0, 100);
  html += `<div style="height:6px;background:rgba(84,140,196,0.15);border-radius:3px"><div style="height:100%;width:${rdBar.toFixed(1)}%;background:var(--accent-blue);border-radius:3px;transition:width 0.3s"></div></div>`;
  html += '</div>';

  html += '</div>';
  return html;
}

// ─── UI: GLOBAL TOP 100 RANKINGS ─────────────────────────────
function renderGlobalUniversityRankings() {
  computeUniversityRankings();
  const top100 = (_uniRankingCache || []).slice(0, 100);
  if (!top100.length) return '<div class="empty">No ranking data yet. Run a few turns first.</div>';

  let html = '<div class="section-card">';
  html += '<h4 style="margin:0 0 8px">Global Top 100 Universities</h4>';
  html += '<div style="overflow-y:auto;max-height:480px">';
  html += '<table style="width:100%;font-size:11px;border-collapse:collapse">';
  html += '<thead><tr style="color:var(--text-muted);border-bottom:1px solid var(--border-color);position:sticky;top:0;background:var(--panel-bg,#0b1a2e)">';
  html += '<th style="text-align:center;padding:5px 4px;width:42px">Rank</th>';
  html += '<th style="text-align:left;padding:5px 4px">University</th>';
  html += '<th style="text-align:center;padding:5px 4px">Country</th>';
  html += '<th style="text-align:center;padding:5px 4px">Prestige</th>';
  html += '<th style="text-align:center;padding:5px 4px">R&D</th>';
  html += '<th style="text-align:center;padding:5px 4px">🏆</th>';
  html += '</tr></thead><tbody>';

  top100.forEach((u, idx) => {
    const nId     = u._nId || u.nationId;
    const nation  = (typeof NATIONS !== 'undefined') ? NATIONS[nId] : null;
    const specDef = UNI_SPECIALIZATIONS.find(s => s.id === u.specialization) || UNI_SPECIALIZATIONS[0];
    const topBg   = idx < 10 ? 'rgba(84,140,196,0.07)' : '';
    const rankColor = idx === 0 ? '#ffd700' : idx < 3 ? 'var(--accent-blue)' : 'var(--text-secondary)';
    const medal     = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';

    html += `<tr style="border-bottom:1px solid rgba(84,140,196,0.07);cursor:pointer;background:${topBg}" onclick="showUniversityDetail('${u.id}','${nId}')" onmouseover="this.style.background='rgba(84,140,196,0.12)'" onmouseout="this.style.background='${topBg}'">`;
    html += `<td style="text-align:center;font-weight:700;color:${rankColor};padding:5px 4px">${medal || ('#' + (idx + 1))}</td>`;
    html += `<td style="padding:5px 4px"><div style="font-weight:600">${u.name}</div><div style="color:var(--text-muted);font-size:10px">${u.shortName} • ${specDef.label}</div></td>`;
    html += `<td style="text-align:center;padding:5px 4px">${nation ? nation.flag + ' ' + nation.name : nId}</td>`;
    html += `<td style="text-align:center;color:var(--accent-yellow);padding:5px 4px">${Math.round(u.prestige || 0)}</td>`;
    html += `<td style="text-align:center;color:var(--accent-blue);padding:5px 4px">${Number(u.researchOutput || 0).toFixed(2)}</td>`;
    html += `<td style="text-align:center;color:var(--accent-yellow);padding:5px 4px">${u.breakthroughs || 0}</td>`;
    html += '</tr>';
  });

  html += '</tbody></table></div>';

  // Country summary strip
  const countryMap = {};
  top100.forEach(u => {
    const nId = u._nId || u.nationId;
    if (!countryMap[nId]) countryMap[nId] = 0;
    countryMap[nId]++;
  });
  const dominators = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (dominators.length > 0) {
    html += '<div style="margin-top:10px;font-size:11px;color:var(--text-muted)">Top 5 countries in the ranking: ';
    html += dominators.map(([nId, cnt]) => {
      const n = (typeof NATIONS !== 'undefined') ? NATIONS[nId] : null;
      return `${n ? n.flag + ' ' + n.name : nId} (${cnt})`;
    }).join(' • ');
    html += '</div>';
  }

  html += '</div>';
  return html;
}

// ─── UI: SHOW DETAIL (uses existing tabOverlay) ───────────────
function showUniversityDetail(uniId, nationId) {
  const overlay = document.getElementById('tabOverlay');
  const content = document.getElementById('tabContent');
  const title   = document.getElementById('tabTitle');
  if (!overlay || !content) return;

  const uni = (GLOBAL_UNIVERSITIES[nationId] || []).find(u => u.id === uniId);
  if (!uni) return;

  if (title) title.textContent = uni.name;
  content.innerHTML = renderUniversityDetailCard(uniId, nationId);
  overlay.classList.remove('hidden');
}

function showGlobalUniversityRankings() {
  const overlay = document.getElementById('tabOverlay');
  const content = document.getElementById('tabContent');
  const title   = document.getElementById('tabTitle');
  if (!overlay || !content) return;

  if (title) title.textContent = '🌐 Global University Rankings';
  content.innerHTML = renderGlobalUniversityRankings();
  overlay.classList.remove('hidden');
}
