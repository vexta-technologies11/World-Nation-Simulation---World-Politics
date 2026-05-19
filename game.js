/**
 * Sovereign State: Global Hegemony
 * A geopolitical simulator
 */

// ============================================================
// GAME STATE
// ============================================================
const GAME = {
  turn: 0,
  speed: 0, // 0 = paused, 1, 2, 5, 10
  running: false,
  timer: null,
  turnInProgress: false,
  timerGeneration: 0,
  date: new Date(1910, 0, 1), // January 1910 — simulation start

  treasury: 8000,   // in millions — 1910-era reserve
  approval: 58,
  threatLevel: 'Low',

  // Budget allocation (percentages)
  budget: {
    military: 30,
    economy: 25,
    diplomacy: 15,
    intelligence: 10,
    education: 10,
    social: 10,
  },

  // Player nation — 1910 era starting values
  playerNation: {
    id: 'player',
    name: 'United States',
    flag: '\u{1F1FA}\u{1F1F8}',
    leader: 'Theodore Marshall',
    leaderTraits: ['Pragmatist', 'Industrialist'],
    leaderTerm: '1909\u20131913',
    gdp: 1.4,
    population: 92,
    militaryPower: 28,
    techLevel: 1.8,
    education: 32,
    governance: 42,
    infrastructure: 28,
    resources: 55,
    health: 28,
    environment: 62,
    energySecurity: 35,
    renewableShare: 0,
    stability: 52,
    inequality: 60,
    inflation: 2.5,
    debtRatio: 30,
    migrationPressure: 30,
    innovationRisk: 25,
    factories: 22,
    jobs: 38,
    religionInfluence: 65,
    atrocityRisk: 8,
    governmentStyle: 'federal_republic',
    leaderType: 'Elected President',
    policyDoctrine: 'education-first',
    decisionQuality: 72,
    aiBudget: {
      military: 28,
      economy: 26,
      diplomacy: 14,
      intelligence: 12,
      education: 10,
      social: 16,
    },
    happiness: 42,
    resilience: 45,
  },

  selectedNation: null,
  historyByNation: {},
  historyView: { countryId: null, metric: 'gdp' },
  leaderboardMetric: 'resources',
  activeTab: null,
  globalMarketIndex: 100,
  marketCrashTurns: 0,
  bilateralRelations: {},
  alliances: [],
  conflicts: [],
  perf: {
    renderIntervalMs: 130,
    tabRenderIntervalMs: 180,
    baseRenderIntervalMs: 130,
    baseTabRenderIntervalMs: 180,
    lastUiRenderAt: 0,
    lastTabRenderAt: 0,
    nationCardRenderEveryTurns: 1,
    lowFpsMode: false,
    simTurnAvgMs: 0,
    adaptiveEnabled: true,
    profileEveryTurns: 20,
    profileRolling: {},
  },
  turnCache: null,
  uiDirty: true,
  uiDirtyReason: 'init',
};

const SIM_TICK = {
  diplomacy: 2,
  defenseAndArms: 3,
  worldBankAndDebt: 4,
  allianceSeeking: 5,
};

function nowMs() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') return performance.now();
  return Date.now();
}

function isMobileDevice() {
  const ua = typeof navigator !== 'undefined' ? String(navigator.userAgent || '') : '';
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

function markUiDirty(reason = 'turn') {
  GAME.uiDirty = true;
  GAME.uiDirtyReason = reason;
}

function profileStage(name, fn) {
  const started = nowMs();
  const result = fn();
  const elapsed = nowMs() - started;
  const store = GAME.perf.profileRolling;
  if (!store[name]) store[name] = { totalMs: 0, count: 0 };
  store[name].totalMs += elapsed;
  store[name].count += 1;
  return result;
}

function maybeLogPerfProfile() {
  if (GAME.turn <= 0 || GAME.turn % GAME.perf.profileEveryTurns !== 0) return;
  const entries = Object.entries(GAME.perf.profileRolling)
    .map(([name, stat]) => ({ name, avgMs: stat.totalMs / Math.max(1, stat.count) }))
    .sort((a, b) => b.avgMs - a.avgMs)
    .slice(0, 5);
  if (!entries.length) return;
  const line = entries.map(e => `${e.name}:${e.avgMs.toFixed(1)}ms`).join(' | ');
  console.log(`[Perf T${GAME.turn}] ${line}`);
  GAME.perf.profileRolling = {};
}

function estimateNationDebtStockM(nation) {
  const gdpM = Math.max(1, Number(nation?.gdp || 0.2) * 1_000_000);
  const ratio = Math.max(0, Number(nation?.debtRatio || 0));
  return gdpM * ratio / 100;
}

function ensureNationDebtStockM(nation) {
  if (!nation) return 0;
  if (!Number.isFinite(Number(nation.debtStockM))) {
    nation.debtStockM = estimateNationDebtStockM(nation);
  }
  return Math.max(0, Number(nation.debtStockM || 0));
}

function syncNationDebtRatioFromStock(nation) {
  if (!nation) return 0;
  const debtStockM = ensureNationDebtStockM(nation);
  const gdpM = Math.max(1, Number(nation.gdp || 0.2) * 1_000_000);
  nation.debtRatio = clamp((debtStockM / gdpM) * 100, 0, 320);
  return nation.debtRatio;
}

function adjustNationDebtStockM(nation, deltaM, reason = 'debt_adjustment') {
  if (!nation) return 0;
  const next = Math.max(0, ensureNationDebtStockM(nation) + Number(deltaM || 0));
  nation.debtStockM = next;
  const ratio = syncNationDebtRatioFromStock(nation);
  if (!Array.isArray(nation.debtEvents)) nation.debtEvents = [];
  nation.debtEvents.push({ turn: GAME.turn, deltaM: Number(deltaM || 0), reason, debtStockM: next, debtRatio: ratio });
  if (nation.debtEvents.length > 25) nation.debtEvents.shift();
  return ratio;
}

function _splitTurnPairKey(key) {
  if (typeof key !== 'string') return ['', ''];
  if (key.includes('::')) {
    const [aId, bId] = key.split('::');
    return [aId || '', bId || ''];
  }
  if (key.includes('_')) {
    const [aId, bId] = key.split('_');
    return [aId || '', bId || ''];
  }
  return [key, ''];
}

function rebuildTurnCache() {
  const cache = {
    turn: GAME.turn,
    aliveNations: [],
    aliveNationIds: new Set(),
    creditByNation: {},
    resilienceByNation: {},
    lendingPowerByNation: {},
    boomPhaseByNation: {},
    warPressureByNation: {},
    allianceSupportByNation: {},
    diplomacyPowerByNation: {},
    financeByNation: {},
    alliancePartnersByNation: {},
    warInvolvedNations: new Set(),
    friendlyByNation: {},
    hostileByNation: {},
  };

  const nations = Object.values(NATIONS);
  nations.forEach((nation) => {
    if (!nation || nation.failedState) return;
    cache.aliveNations.push(nation);
    cache.aliveNationIds.add(nation.id);
    cache.friendlyByNation[nation.id] = [];
    cache.hostileByNation[nation.id] = [];
  });

  (GAME.alliances || []).forEach((alliance) => {
    if (!alliance) return;
    if (!cache.alliancePartnersByNation[alliance.a]) cache.alliancePartnersByNation[alliance.a] = [];
    if (!cache.alliancePartnersByNation[alliance.b]) cache.alliancePartnersByNation[alliance.b] = [];
    cache.alliancePartnersByNation[alliance.a].push(alliance.b);
    cache.alliancePartnersByNation[alliance.b].push(alliance.a);
  });

  (GAME.conflicts || []).forEach((conflict) => {
    if (!conflict || conflict.phase === 'peace') return;
    if (conflict.a) cache.warInvolvedNations.add(conflict.a);
    if (conflict.b) cache.warInvolvedNations.add(conflict.b);
  });

  Object.entries(GAME.bilateralRelations || {}).forEach(([key, rel]) => {
    const [aId, bId] = _splitTurnPairKey(key);
    if (!aId || !bId) return;
    if (!cache.aliveNationIds.has(aId) || !cache.aliveNationIds.has(bId)) return;
    if (rel >= 20) {
      cache.friendlyByNation[aId].push(bId);
      cache.friendlyByNation[bId].push(aId);
    }
    if (rel <= -20) {
      cache.hostileByNation[aId].push(bId);
      cache.hostileByNation[bId].push(aId);
    }
  });

  GAME.turnCache = cache;
  return cache;
}

function getTurnCache() {
  if (!GAME.turnCache || GAME.turnCache.turn !== GAME.turn) {
    return rebuildTurnCache();
  }
  return GAME.turnCache;
}

function getCachedCreditScore(nation) {
  if (!nation || !nation.id) return 0;
  const cache = getTurnCache();
  if (Number.isFinite(cache.creditByNation[nation.id])) return cache.creditByNation[nation.id];
  return null;
}

function setCachedCreditScore(nationId, value) {
  if (!nationId) return;
  const cache = getTurnCache();
  cache.creditByNation[nationId] = value;
}

function getCachedDiplomaticPower(nationId) {
  const cache = getTurnCache();
  return Number.isFinite(cache.diplomacyPowerByNation[nationId]) ? cache.diplomacyPowerByNation[nationId] : null;
}

function setCachedDiplomaticPower(nationId, value) {
  if (!nationId) return;
  const cache = getTurnCache();
  cache.diplomacyPowerByNation[nationId] = value;
}

function setCachedFinanceSnapshot(nationId, snapshot) {
  if (!nationId || !snapshot) return;
  const cache = getTurnCache();
  cache.financeByNation[nationId] = snapshot;
}

function getCachedFinanceSnapshot(nationId) {
  const cache = getTurnCache();
  return cache.financeByNation[nationId] || null;
}

function getCachedResilience(nationId) {
  if (!nationId) return null;
  const cache = getTurnCache();
  return Number.isFinite(cache.resilienceByNation[nationId]) ? cache.resilienceByNation[nationId] : null;
}

function setCachedResilience(nationId, value) {
  if (!nationId) return;
  const cache = getTurnCache();
  cache.resilienceByNation[nationId] = value;
}

function getCachedLendingPower(nationId) {
  if (!nationId) return null;
  const cache = getTurnCache();
  return Number.isFinite(cache.lendingPowerByNation[nationId]) ? cache.lendingPowerByNation[nationId] : null;
}

function setCachedLendingPower(nationId, value) {
  if (!nationId) return;
  const cache = getTurnCache();
  cache.lendingPowerByNation[nationId] = value;
}

function getCachedBoomPhase(nationId) {
  if (!nationId) return null;
  const cache = getTurnCache();
  const value = cache.boomPhaseByNation[nationId];
  return value && typeof value === 'object' ? value : null;
}

function setCachedBoomPhase(nationId, value) {
  if (!nationId || !value || typeof value !== 'object') return;
  const cache = getTurnCache();
  cache.boomPhaseByNation[nationId] = value;
}

// ============================================================
// NATIONS DATA
// ============================================================
// 1910 ERA STARTING VALUES — nations begin with pre-industrial baselines.
// buildNations() adds seeded variation so each country diverges from turn 1.
const STARTING_NATION = {
  leader: 'National Council',
  traits: ['Pragmatist', 'Stabilizer'],
  gdp: 0.28,
  population: 22,
  militaryPower: 12,
  techLevel: 1.0,
  education: 18,
  governance: 30,
  infrastructure: 15,
  resources: 35,
  health: 22,
  environment: 65,
  energySecurity: 20,
  renewableShare: 0,
  stability: 45,
  inequality: 62,
  inflation: 2.0,
  debtRatio: 25,
  migrationPressure: 22,
  innovationRisk: 40,
  factories: 8,
  jobs: 30,
  religionInfluence: 72,
  atrocityRisk: 12,
  stockMarket: 20,
  corruption: 58,
  deficit: 1.5,
  recessionMonths: 0,
  inCrisis: false,
  crisisRisk: 35,
  failedState: false,
  governmentStyle: 'federal_republic',
  leaderType: 'Elected President',
  policyDoctrine: 'balanced',
  decisionQuality: 45,
  leaderTenureMonths: 0,
  lastLeaderChangeTurn: -120,
  happiness: 35,
  resilience: 38,
  relation: { base: 0, trend: 0 },
};

const GOVERNMENT_MODELS = {
  liberal_democracy: {
    name: 'Liberal Democracy',
    econBoost: 1.08,
    innovationBoost: 1.1,
    stabilityBoost: 1.04,
    corruptionControl: 1.16,
    crisisVulnerability: 0.92,
    oustSensitivity: 1.45,
  },
  federal_republic: {
    name: 'Federal Republic',
    econBoost: 1.07,
    innovationBoost: 1.08,
    stabilityBoost: 1.05,
    corruptionControl: 1.1,
    crisisVulnerability: 0.95,
    oustSensitivity: 1.25,
  },
  constitutional_monarchy: {
    name: 'Constitutional Monarchy',
    econBoost: 1.06,
    innovationBoost: 1.05,
    stabilityBoost: 1.1,
    corruptionControl: 1.06,
    crisisVulnerability: 0.94,
    oustSensitivity: 1.15,
  },
  authoritarian_state: {
    name: 'Authoritarian State',
    econBoost: 1.02,
    innovationBoost: 0.96,
    stabilityBoost: 0.96,
    corruptionControl: 0.88,
    crisisVulnerability: 1.18,
    oustSensitivity: 0.58,
  },
  dictatorship: {
    name: 'Dictatorship',
    econBoost: 0.95,
    innovationBoost: 0.86,
    stabilityBoost: 0.9,
    corruptionControl: 0.76,
    crisisVulnerability: 1.3,
    oustSensitivity: 0.42,
  },
  military_junta: {
    name: 'Military Junta',
    econBoost: 0.93,
    innovationBoost: 0.84,
    stabilityBoost: 0.88,
    corruptionControl: 0.82,
    crisisVulnerability: 1.28,
    oustSensitivity: 0.5,
  },
  technocratic_council: {
    name: 'Technocratic Council',
    econBoost: 1.13,
    innovationBoost: 1.2,
    stabilityBoost: 1.0,
    corruptionControl: 1.2,
    crisisVulnerability: 0.9,
    oustSensitivity: 0.9,
  },
};

const DOCTRINE_LABELS = {
  balanced: 'Balanced',
  militarized: 'Militarized',
  'education-first': 'Education First',
  'industrial-expansion': 'Industrial Expansion',
  'resource-extraction': 'Resource Extraction',
  'diplomatic-network': 'Diplomatic Network',
  'security-state': 'Security State',
  'welfare-state': 'Welfare State',
  'innovation-drive': 'Innovation Drive',
  'austerity-stabilization': 'Austerity Stabilization',
};

const POLICY_DOCTRINES = Object.keys(DOCTRINE_LABELS);

const LEADER_ARCHETYPES = {
  'Elected President': {
    traits: ['Reformer', 'Diplomat'],
    decisionBoost: 12,
  },
  'Prime Minister': {
    traits: ['Pragmatist', 'Stabilizer'],
    decisionBoost: 10,
  },
  Chancellor: {
    traits: ['Technocrat', 'Planner'],
    decisionBoost: 11,
  },
  Monarch: {
    traits: ['Traditionalist', 'Symbolic'],
    decisionBoost: 6,
  },
  'General Secretary': {
    traits: ['Ideologue', 'Organizer'],
    decisionBoost: 8,
  },
  'Supreme Leader': {
    traits: ['Authoritarian', 'Survivor'],
    decisionBoost: 7,
  },
};

const LEADER_FIRST_NAMES = [
  'Alexander', 'Amina', 'Carlos', 'Dmitri', 'Elena', 'Farah', 'Gabriel', 'Hana', 'Isaac', 'Jamal',
  'Kaito', 'Leila', 'Marcus', 'Nadia', 'Omar', 'Priya', 'Quentin', 'Rafael', 'Sofia', 'Tariq',
  'Uma', 'Viktor', 'Wen', 'Xavier', 'Yara', 'Zane', 'Bianca', 'Noah', 'Mila', 'Arman'
];

const LEADER_LAST_NAMES = [
  'Avery', 'Belov', 'Caldwell', 'Demir', 'Estevez', 'Farouk', 'Grimaldi', 'Haddad', 'Ivanov', 'Jensen',
  'Kovacs', 'Laurent', 'Mendoza', 'Nakamura', 'Orlov', 'Patel', 'Qureshi', 'Romanov', 'Silva', 'Tanaka',
  'Uddin', 'Volkov', 'Walker', 'Xu', 'Yildiz', 'Zoric', 'Bautista', 'Khan', 'Moreau', 'Serrano'
];

function seededRandom01(seed) {
  return (hashCode(seed) % 10000) / 10000;
}

function seededChoice(list, seed) {
  if (!list.length) return null;
  const idx = Math.floor(seededRandom01(seed) * list.length) % list.length;
  return list[idx];
}

function normalizeBudgetObject(budget) {
  const keys = ['military', 'economy', 'diplomacy', 'intelligence', 'education', 'social'];
  let total = 0;
  keys.forEach(k => {
    budget[k] = clamp(Number(budget[k]) || 0, 2, 75);
    total += budget[k];
  });
  if (total <= 0) {
    keys.forEach(k => { budget[k] = 100 / keys.length; });
    return budget;
  }
  keys.forEach(k => {
    budget[k] = (budget[k] / total) * 100;
  });
  return budget;
}

function doctrineBaseBudget(doctrine) {
  const presets = {
    balanced: { military: 24, economy: 24, diplomacy: 14, intelligence: 10, education: 10, social: 18 },
    militarized: { military: 36, economy: 22, diplomacy: 10, intelligence: 12, education: 8, social: 12 },
    'education-first': { military: 16, economy: 24, diplomacy: 14, intelligence: 10, education: 12, social: 24 },
    'industrial-expansion': { military: 22, economy: 34, diplomacy: 10, intelligence: 8, education: 10, social: 16 },
    'resource-extraction': { military: 26, economy: 30, diplomacy: 8, intelligence: 8, education: 6, social: 22 },
    'diplomatic-network': { military: 16, economy: 22, diplomacy: 24, intelligence: 10, education: 8, social: 20 },
    'security-state': { military: 30, economy: 20, diplomacy: 10, intelligence: 20, education: 8, social: 12 },
    'welfare-state': { military: 14, economy: 20, diplomacy: 14, intelligence: 10, education: 8, social: 34 },
    'innovation-drive': { military: 18, economy: 22, diplomacy: 12, intelligence: 14, education: 20, social: 14 },
    'austerity-stabilization': { military: 18, economy: 32, diplomacy: 16, intelligence: 10, education: 6, social: 18 },
  };
  return normalizeBudgetObject({ ...(presets[doctrine] || presets.balanced) });
}

function createLeaderFromSeed(seedBase) {
  const first = seededChoice(LEADER_FIRST_NAMES, `${seedBase}-first`) || 'Alex';
  const last = seededChoice(LEADER_LAST_NAMES, `${seedBase}-last`) || 'Gray';
  const type = seededChoice(Object.keys(LEADER_ARCHETYPES), `${seedBase}-type`) || 'Prime Minister';
  const profile = LEADER_ARCHETYPES[type] || LEADER_ARCHETYPES['Prime Minister'];

  return {
    name: `${first} ${last}`,
    type,
    traits: [...profile.traits],
    decisionBonus: profile.decisionBoost,
  };
}

function getGovernmentProfile(style) {
  return GOVERNMENT_MODELS[style] || GOVERNMENT_MODELS.federal_republic;
}

function getGovernmentTurnoverConfig(style) {
  const cfg = {
    liberal_democracy: { minTerm: 22, electionTerm: 48, cooldown: 16, emergencyThreshold: 82, baseScale: 1.0 },
    federal_republic: { minTerm: 24, electionTerm: 48, cooldown: 16, emergencyThreshold: 82, baseScale: 0.95 },
    constitutional_monarchy: { minTerm: 30, electionTerm: 60, cooldown: 20, emergencyThreshold: 86, baseScale: 0.8 },
    authoritarian_state: { minTerm: 42, electionTerm: 84, cooldown: 26, emergencyThreshold: 92, baseScale: 0.55 },
    dictatorship: { minTerm: 54, electionTerm: 120, cooldown: 30, emergencyThreshold: 95, baseScale: 0.42 },
    military_junta: { minTerm: 40, electionTerm: 96, cooldown: 26, emergencyThreshold: 94, baseScale: 0.5 },
    technocratic_council: { minTerm: 30, electionTerm: 72, cooldown: 20, emergencyThreshold: 86, baseScale: 0.85 },
    socialist_republic: { minTerm: 30, electionTerm: 72, cooldown: 20, emergencyThreshold: 87, baseScale: 0.82 },
    theocratic_state: { minTerm: 46, electionTerm: 100, cooldown: 28, emergencyThreshold: 93, baseScale: 0.48 },
  };
  return cfg[style] || cfg.federal_republic;
}

function getGovernmentLabel(style) {
  return getGovernmentProfile(style).name;
}

function getDoctrineLabel(doctrine) {
  return DOCTRINE_LABELS[doctrine] || 'Balanced';
}

const PLAYER_ISO2 = 'US';
const NATION_COLORS = ['#4a90d9', '#4caf80', '#e74c5e', '#f0c040', '#9b59b6'];
const GEO_REPO_TREE_URL = 'https://api.github.com/repos/georgique/world-geojson/git/trees/develop?recursive=1';
const GEO_REPO_RAW_BASE = 'https://raw.githubusercontent.com/georgique/world-geojson/develop/';

function slugifyCountryName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function isoToFlag(iso2) {
  return String.fromCodePoint(...iso2.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0)));
}

function hashCode(input) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) - h) + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const COUNTRY_ISO2_CODES = [
  'AF','AL','DZ','AD','AO','AG','AR','AM','AU','AT','AZ',
  'BS','BH','BD','BB','BY','BE','BZ','BJ','BT','BO','BA','BW','BR','BN','BG','BF','BI',
  'CV','KH','CM','CA','CF','TD','CL','CN','CO','KM','CG','CD','CR','CI','HR','CU','CY','CZ',
  'DK','DJ','DM','DO',
  'EC','EG','SV','GQ','ER','EE','SZ','ET',
  'FJ','FI','FR',
  'GA','GM','GE','DE','GH','GR','GD','GT','GN','GW','GY',
  'HT','HN','HU',
  'IS','IN','ID','IR','IQ','IE','IL','IT',
  'JM','JP','JO',
  'KZ','KE','KI','KP','KR','KW','KG',
  'LA','LV','LB','LS','LR','LY','LI','LT','LU',
  'MG','MW','MY','MV','ML','MT','MH','MR','MU','MX','FM','MD','MC','MN','ME','MA','MZ','MM',
  'NA','NR','NP','NL','NZ','NI','NE','NG','MK','NO',
  'OM',
  'PK','PW','PA','PG','PY','PE','PH','PL','PT',
  'QA',
  'RO','RU','RW',
  'KN','LC','VC','WS','SM','ST','SA','SN','RS','SC','SL','SG','SK','SI','SB','SO','ZA','SS','ES','LK','SD','SR','SE','CH','SY',
  'TJ','TZ','TH','TL','TG','TO','TT','TN','TR','TM','TV',
  'UG','UA','AE','GB','US','UY','UZ',
  'VU','VE','VN',
  'YE',
  'ZM','ZW'
];

function getCountryName(iso2) {
  if (typeof Intl.DisplayNames === 'function') {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return displayNames.of(iso2) || iso2;
  }
  return iso2;
}

function buildCountryPlacement(index, total, iso2) {
  const cols = Math.ceil(Math.sqrt(total * 1.8));
  const row = Math.floor(index / cols);
  const col = index % cols;
  const rows = Math.ceil(total / cols);
  const jitter = (hashCode(iso2) % 100) / 100;

  const x = 0.04 + ((col + 0.3 + jitter * 0.4) / cols) * 0.92;
  const y = 0.1 + ((row + 0.35 + jitter * 0.3) / rows) * 0.78;
  return { x, y };
}

function buildNations() {
  const isoCodes = COUNTRY_ISO2_CODES;
  const nations = {};

  isoCodes.forEach((iso2, index) => {
    const name = getCountryName(iso2);
    const id = slugifyCountryName(name);
    const pos = buildCountryPlacement(index, isoCodes.length, iso2);
    const governmentStyle = seededChoice(Object.keys(GOVERNMENT_MODELS), `${iso2}-gov`) || 'federal_republic';
    const policyDoctrine = seededChoice(POLICY_DOCTRINES, `${iso2}-doctrine`) || 'balanced';
    const leader = createLeaderFromSeed(`${iso2}-${name}-${index}`);
    const aiBudget = doctrineBaseBudget(policyDoctrine);
    const decisionQuality = clamp(48 + leader.decisionBonus + seededRandom01(`${iso2}-iq`) * 26, 15, 95);

    // ── 1910-era seeded variation ─────────────────────────────────────────
    const _sv = k => seededRandom01(`${iso2}-1910-${k}`);
    const _era_gdp   = STARTING_NATION.gdp    * (0.5 + _sv('gdp')   * 2.8);
    const _era_edu   = clamp(STARTING_NATION.education    + (_sv('edu')   - 0.3) * 28, 8,  50);
    const _era_tech  = clamp(STARTING_NATION.techLevel    + _sv('tech')  * 1.4,        1.0, 2.5);
    const _era_mil   = clamp(STARTING_NATION.militaryPower + (_sv('mil')  - 0.2) * 30,  5,  50);
    const _era_gov   = clamp(STARTING_NATION.governance   + (_sv('gov')  - 0.3) * 30,  10, 60);
    const _era_infra = clamp(STARTING_NATION.infrastructure + (_sv('infra') - 0.2) * 25, 5, 45);
    const _era_res   = clamp(STARTING_NATION.resources    + (_sv('res')  - 0.3) * 40,  10, 80);
    const _era_pop   = clamp(STARTING_NATION.population   * (0.3 + _sv('pop')  * 3.5),  2, 200);
    const _era_corr  = clamp(STARTING_NATION.corruption   + (_sv('corr') - 0.3) * 25,  30, 90);
    const _era_stab  = clamp(STARTING_NATION.stability    + (_sv('stab') - 0.4) * 30,  15, 72);
    const _era_ineq  = clamp(STARTING_NATION.inequality   + (_sv('ineq') - 0.3) * 22,  35, 90);
    const _era_fact  = clamp(STARTING_NATION.factories    + Math.round(_sv('fact') * 20), 2, 35);

    nations[id] = {
      id,
      iso2,
      name,
      flag: isoToFlag(iso2),
      leader: leader.name,
      traits: [...leader.traits],
      gdp: _era_gdp,
      population: _era_pop,
      militaryPower: _era_mil,
      techLevel: _era_tech,
      education: _era_edu,
      governance: _era_gov,
      infrastructure: _era_infra,
      resources: _era_res,
      health: STARTING_NATION.health,
      environment: STARTING_NATION.environment,
      energySecurity: STARTING_NATION.energySecurity,
      renewableShare: STARTING_NATION.renewableShare,
      stability: _era_stab,
      inequality: _era_ineq,
      inflation: STARTING_NATION.inflation,
      debtRatio: STARTING_NATION.debtRatio,
      migrationPressure: STARTING_NATION.migrationPressure,
      innovationRisk: STARTING_NATION.innovationRisk,
      factories: _era_fact,
      jobs: STARTING_NATION.jobs,
      religionInfluence: STARTING_NATION.religionInfluence,
      atrocityRisk: STARTING_NATION.atrocityRisk,
      stockMarket: STARTING_NATION.stockMarket,
      corruption: STARTING_NATION.corruption,
      deficit: STARTING_NATION.deficit,
      recessionMonths: STARTING_NATION.recessionMonths,
      inCrisis: STARTING_NATION.inCrisis,
      crisisRisk: STARTING_NATION.crisisRisk,
      failedState: STARTING_NATION.failedState,
      governmentStyle,
      leaderType: leader.type,
      policyDoctrine,
      decisionQuality,
      leaderTenureMonths: 0,
      lastLeaderChangeTurn: -120,
      aiBudget,
      happiness: STARTING_NATION.happiness,
      resilience: STARTING_NATION.resilience,
      color: NATION_COLORS[index % NATION_COLORS.length],
      x: pos.x,
      y: pos.y,
      relation: { ...STARTING_NATION.relation },
    };
  });

  return nations;
}

const NATIONS = buildNations();
const PLAYER_ID = Object.keys(NATIONS).find(id => NATIONS[id].iso2 === PLAYER_ISO2) || Object.keys(NATIONS)[0];

GAME.playerNation = Object.assign({}, GAME.playerNation, NATIONS[PLAYER_ID], {
  leader: 'Theodore Marshall',
  leaderType: 'Elected President',
  governmentStyle: 'federal_republic',
  policyDoctrine: 'education-first',
  decisionQuality: 78,
  aiBudget: doctrineBaseBudget('education-first'),
  leaderTraits: ['Pragmatist', 'Industrialist'],
  traits: ['Pragmatist', 'Industrialist'],
  leaderTerm: '1909-1913'
});
window.NATIONS = NATIONS;
window.GAME = GAME;

// Events list for simulation
const EVENTS_POOL = [
  { title: 'Economic recession fears grow globally', type: 'major', effect: { treasury: -50, approval: -3 } },
  { title: 'Tech stock rally boosts investor confidence', type: 'minor', effect: { treasury: 30, approval: 2 } },
  { title: 'Diplomatic summit yields trade agreements', type: 'minor', effect: { approval: 3, treasury: 40 } },
  { title: 'Military parade showcases new technology', type: 'minor', effect: { approval: 2, threatLevel: 'Medium' } },
  { title: 'Terrorist attack thwarted by intelligence', type: 'major', effect: { approval: 5, threatLevel: 'High' } },
  { title: 'Natural disaster strikes allied nation', type: 'major', effect: { treasury: -80, approval: -2 } },
  { title: 'Space program achieves successful launch', type: 'minor', effect: { approval: 4 } },
  { title: 'Inflation rates drop unexpectedly', type: 'minor', effect: { treasury: 20, approval: 3 } },
  { title: 'Border dispute escalates into conflict', type: 'critical', effect: { treasury: -120, threatLevel: 'High', approval: -5 } },
  { title: 'Energy crisis drives up costs', type: 'major', effect: { treasury: -60, approval: -4 } },
  { title: 'Public health initiative reduces costs', type: 'minor', effect: { treasury: 10, approval: 4 } },
  { title: 'Cyber attack targets government systems', type: 'major', effect: { approval: -3, threatLevel: 'Medium' } },
  { title: 'Trade surplus boosts economy', type: 'minor', effect: { treasury: 50, approval: 2 } },
  { title: 'Political scandal rocks administration', type: 'major', effect: { approval: -8 } },
  { title: 'Scientific breakthrough in renewable energy', type: 'minor', effect: { treasury: 25, approval: 3 } },
  { title: 'Foreign relations improve with key ally', type: 'minor', effect: { approval: 3 } },
  { title: 'Military spending bill passes congress', type: 'major', effect: { treasury: -90, militaryPower: 3 } },
  { title: 'Cultural exchange program launched', type: 'minor', effect: { approval: 2 } },
  { title: 'International sanctions imposed', type: 'major', effect: { treasury: -40, approval: -2 } },
  { title: 'New trade route opens with Asia-Pacific', type: 'minor', effect: { treasury: 60, approval: 2 } },
];

// Dynamic relations between player and other nations
function getRelation(nationId) {
  const n = NATIONS[nationId];
  if (!n) return 0;
  return n.relation.base;
}

function getRelationBetween(aId, bId) {
  if (!aId || !bId) return 0;
  if (aId === bId) return 100;

  const playerId = GAME.playerNation?.id;
  if (aId === playerId) return getRelation(bId);
  if (bId === playerId) return getRelation(aId);

  const key = relationshipKey(aId, bId);
  if (GAME.bilateralRelations[key] === undefined) {
    const baseline = (hashCode(key) % 161) - 80;
    GAME.bilateralRelations[key] = clamp(baseline, -100, 100);
  }

  return GAME.bilateralRelations[key];
}

function getRelationBadge(score) {
  if (score >= 20) return { text: '🤝 Friendly', cls: 'friendly' };
  if (score <= -20) return { text: '⚔️ Hostile', cls: 'hostile' };
  return { text: '➖ Neutral', cls: 'neutral' };
}

function playerDeclareWar(targetId) {
  if (!targetId || targetId === GAME.playerNation.id) return;
  if (typeof declareWar === 'function') {
    const success = declareWar(GAME.playerNation.id, targetId, 6, 'conquer');
    if (!success) addNews(`🕊️ War declaration blocked (active truce, alliance, or existing conflict).`, 'minor');
  } else {
    declareConflict(GAME.playerNation.id, targetId, 'player declaration');
  }
  renderNationCard();
  refreshRealtimeTabs();
}

function playerFormAlliance(targetId) {
  if (!targetId || targetId === GAME.playerNation.id) return;
  addAlliance(GAME.playerNation.id, targetId);
  addNews(`🤝 ${NATIONS[GAME.playerNation.id].name} forms alliance with ${NATIONS[targetId].name}`, 'minor');
  renderNationCard();
  refreshRealtimeTabs();
}

function playerRaidResources(targetId) {
  if (!targetId || targetId === GAME.playerNation.id) return;
  const player = NATIONS[GAME.playerNation.id];
  const target = NATIONS[targetId];
  if (!player || !target || player.failedState || target.failedState) return;

  const raidStrength = (player.militaryPower * 0.55 + GAME.budget.intelligence * 0.2 + Math.random() * 15);
  const defenseStrength = (target.militaryPower * 0.5 + target.stability * 0.4 + Math.random() * 14);

  if (raidStrength >= defenseStrength) {
    const loot = clamp(target.resources * 0.08, 0.2, 7.5);
    target.resources = clamp(target.resources - loot, 1, 100);
    player.resources = clamp(player.resources + loot, 1, 100);
    target.stability = clamp(target.stability - 3.5, 1, 100);
    target.crisisRisk = clamp(target.crisisRisk + 5, 0, 100);
    addNews(`🛢️ ${player.name} raids ${target.name} and seizes strategic resources`, 'major');
  } else {
    player.stability = clamp(player.stability - 2.5, 1, 100);
    player.crisisRisk = clamp(player.crisisRisk + 3, 0, 100);
    addNews(`🛡️ ${target.name} repels a resource raid from ${player.name}`, 'major');
  }

  refreshRealtimeTabs();
}

// ============================================================
// DOM REFS
// ============================================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {};

function cacheDom() {
  dom.treasuryVal = $('#treasuryVal');
  dom.approvalVal = $('#approvalVal');
  dom.threatVal = $('#threatVal');
  dom.dateDisplay = $('#dateDisplay');
  dom.turnVal = $('#turnVal');
  dom.worldMap = $('#worldMap');
  dom.mapBackdrop = $('#mapBackdrop');
  dom.newsTicker = $('#newsTicker');
  dom.newsCount = $('#newsCount');
  dom.tabOverlay = $('#tabOverlay');
  dom.tabTitle = $('#tabTitle');
  dom.tabContent = $('#tabContent');
  dom.closeTab = $('#closeTab');
  dom.leftSidebar = $('#leftSidebar');
  dom.rightSidebar = $('#rightSidebar');
}

// ============================================================
// DATE & FORMATTING
// ============================================================
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatDate(date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function safeRun(label, fn, fallback = undefined) {
  try {
    return fn();
  } catch (error) {
    console.error(`${label} failed:`, error);
    return fallback;
  }
}

function formatMoney(m) {
  return formatHumanMoneyMillions(m);
}

function formatHumanNumber(value, decimals = 1) {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return '0';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs >= 1_000_000_000_000) return sign + (abs / 1_000_000_000_000).toFixed(decimals) + ' Trillion';
  if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toFixed(decimals) + ' Billion';
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(decimals) + ' Million';
  if (abs >= 1_000) return sign + (abs / 1_000).toFixed(decimals) + ' Thousand';
  return sign + abs.toFixed(abs >= 100 ? 0 : decimals);
}

function formatHumanMoneyMillions(valueM, decimals = 1) {
  const num = Number(valueM || 0);
  if (!Number.isFinite(num)) return '$0';
  return '$' + formatHumanNumber(num * 1_000_000, decimals);
}

function formatHumanTrillions(valueT, decimals = 2) {
  const num = Number(valueT || 0);
  if (!Number.isFinite(num)) return '$0';
  return '$' + formatHumanNumber(num * 1_000_000_000_000, decimals);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeShareMap(shares) {
  const entries = Object.entries(shares).map(([key, value]) => [key, Math.max(0, Number(value) || 0)]);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (total <= 0) {
    const even = 100 / Math.max(entries.length, 1);
    entries.forEach(([key]) => { shares[key] = even; });
    return shares;
  }
  entries.forEach(([key, value]) => {
    shares[key] = (value / total) * 100;
  });
  return shares;
}

function getEducationLevelShares(nation) {
  const es = nation && nation.eduState ? nation.eduState : null;
  if (es) {
    const tertiary = clamp(es.highSkillPct || 0, 0, 60);
    const secondary = clamp((es.skilledLaborPct || 0) - tertiary, 0, 85);
    const primary = clamp((es.literacyRate || 0) - (es.skilledLaborPct || 0), 0, 95);
    const belowPrimary = clamp(100 - (es.literacyRate || 0), 0, 100);
    return normalizeShareMap({
      belowPrimary,
      primary,
      secondary,
      tertiary,
    });
  }

  const edu = clamp(Number(nation?.education) || 50, 1, 100);
  const tertiary = clamp((edu - 45) * 0.45, 1, 24);
  const secondary = clamp(edu * 0.42 - tertiary * 0.35, 8, 48);
  const primary = clamp(edu * 0.34 - tertiary * 0.1, 18, 55);
  const belowPrimary = clamp(100 - tertiary - secondary - primary, 4, 55);
  return normalizeShareMap({
    belowPrimary,
    primary,
    secondary,
    tertiary,
  });
}

function initNationDemographics(nation) {
  if (!nation || nation.demographics) return;

  const baseYouth = clamp(
    25 + (Number(nation.religionInfluence || 50) - 50) * 0.12 - (Number(nation.education || 50) - 50) * 0.08,
    16,
    40
  );
  const baseElderly = clamp(
    9 + (Number(nation.health || 50) - 50) * 0.10 + (Number(nation.education || 50) - 50) * 0.04,
    4,
    24
  );
  const ageShares = normalizeShareMap({
    youthPct: baseYouth,
    workingAgePct: Math.max(38, 100 - baseYouth - baseElderly),
    elderlyPct: baseElderly,
  });
  const eduShares = getEducationLevelShares(nation);

  nation.demographics = {
    youthPct: ageShares.youthPct,
    workingAgePct: ageShares.workingAgePct,
    elderlyPct: ageShares.elderlyPct,
    belowPrimaryPct: eduShares.belowPrimary,
    primaryOnlyPct: eduShares.primary,
    secondaryPct: eduShares.secondary,
    tertiaryPct: eduShares.tertiary,
    recruitablePct: 0,
    recruitablePoolM: 0,
    supportPersonnelPoolM: 0,
    annualPopulationChangePct: 0,
  };
}

function updateNationDemographics(nation, nationId, previousPopulation) {
  if (!nation) return null;
  initNationDemographics(nation);

  const demographics = nation.demographics;
  const warPressure = typeof getWarPressure === 'function' ? getWarPressure(nationId || nation.id) : 0;
  const health = clamp(Number(nation.health) || 50, 1, 100);
  const education = clamp(Number(nation.education) || 50, 1, 100);
  const religion = clamp(Number(nation.religionInfluence) || 50, 1, 100);
  const stability = clamp(Number(nation.stability) || 50, 1, 100);
  const jobs = clamp(Number(nation.jobs) || 50, 1, 100);
  const migration = clamp(Number(nation.migrationPressure) || 50, 1, 100);

  const targetYouth = clamp(24 + (religion - 50) * 0.10 - (education - 50) * 0.10 - warPressure * 1.4, 14, 40);
  const targetElderly = clamp(10 + (health - 50) * 0.12 + (education - 50) * 0.05 - warPressure * 1.6 - migration * 0.02, 3, 28);
  const targetWorking = Math.max(35, 100 - targetYouth - targetElderly);
  const ageShares = normalizeShareMap({
    youthPct: demographics.youthPct + (targetYouth - demographics.youthPct) * 0.08,
    workingAgePct: demographics.workingAgePct + (targetWorking - demographics.workingAgePct) * 0.08,
    elderlyPct: demographics.elderlyPct + (targetElderly - demographics.elderlyPct) * 0.08,
  });

  demographics.youthPct = ageShares.youthPct;
  demographics.workingAgePct = ageShares.workingAgePct;
  demographics.elderlyPct = ageShares.elderlyPct;

  const eduShares = getEducationLevelShares(nation);
  demographics.belowPrimaryPct = eduShares.belowPrimary;
  demographics.primaryOnlyPct = eduShares.primary;
  demographics.secondaryPct = eduShares.secondary;
  demographics.tertiaryPct = eduShares.tertiary;

  const workingAgePoolM = (Number(nation.population) || 0) * (demographics.workingAgePct / 100);
  const laborFitness = clamp(0.10 + health * 0.0012 + stability * 0.0008 + jobs * 0.0004 - warPressure * 0.04, 0.06, 0.22);
  const supportFitness = clamp(0.05 + education * 0.0008 + health * 0.0004, 0.04, 0.12);

  demographics.recruitablePct = laborFitness * 100;
  demographics.recruitablePoolM = clamp(workingAgePoolM * laborFitness, 0.03, Math.max(0.03, workingAgePoolM * 0.35));
  demographics.supportPersonnelPoolM = clamp(workingAgePoolM * supportFitness, 0.02, Math.max(0.02, workingAgePoolM * 0.2));

  const priorPopulation = Number(previousPopulation) || Number(nation.population) || 1;
  demographics.annualPopulationChangePct = clamp((((Number(nation.population) || 0) - priorPopulation) / Math.max(priorPopulation, 0.1)) * 12 * 100, -8, 8);
  return demographics;
}

function renderPopulationDetailCard(nation) {
  if (!nation) return '<div class="section-card"><p class="empty">No nation selected.</p></div>';

  initNationDemographics(nation);
  const demographics = nation.demographics || {};
  const forces = nation.militaryForces || {};
  const es = nation.eduState || {};
  const activePersonnel = Number(forces.activePersonnel || 0);
  const reservePersonnel = Number(forces.reservePersonnel || 0);
  const recruitablePoolM = Number(demographics.recruitablePoolM || 0);
  const serviceUsePct = recruitablePoolM > 0 ? clamp(((activePersonnel + reservePersonnel) / recruitablePoolM) * 100, 0, 100) : 0;

  return `
    <div class="section-card">
      <h4>👥 Population & Demographics</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin-top:8px">
        <div class="resource-item"><span class="r-name">Population</span><span class="r-val">${formatHumanNumber((Number(nation.population) || 0) * 1_000_000, 1)}</span></div>
        <div class="resource-item"><span class="r-name">Annual Change</span><span class="r-val ${Number(demographics.annualPopulationChangePct || 0) >= 0 ? 'positive' : 'negative'}">${Number(demographics.annualPopulationChangePct || 0).toFixed(2)}%</span></div>
        <div class="resource-item"><span class="r-name">Youth</span><span class="r-val">${Number(demographics.youthPct || 0).toFixed(1)}%</span></div>
        <div class="resource-item"><span class="r-name">Working Age</span><span class="r-val">${Number(demographics.workingAgePct || 0).toFixed(1)}%</span></div>
        <div class="resource-item"><span class="r-name">Elderly</span><span class="r-val">${Number(demographics.elderlyPct || 0).toFixed(1)}%</span></div>
        <div class="resource-item"><span class="r-name">Recruitable Pool</span><span class="r-val">${Number(recruitablePoolM || 0).toFixed(2)}M</span></div>
      </div>
    </div>
    <div class="section-card">
      <h4>🎓 Education Levels</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin-top:8px">
        <div class="resource-item"><span class="r-name">No / Low School</span><span class="r-val">${Number(demographics.belowPrimaryPct || 0).toFixed(1)}%</span></div>
        <div class="resource-item"><span class="r-name">Primary</span><span class="r-val">${Number(demographics.primaryOnlyPct || 0).toFixed(1)}%</span></div>
        <div class="resource-item"><span class="r-name">Secondary</span><span class="r-val">${Number(demographics.secondaryPct || 0).toFixed(1)}%</span></div>
        <div class="resource-item"><span class="r-name">Tertiary</span><span class="r-val">${Number(demographics.tertiaryPct || 0).toFixed(1)}%</span></div>
        <div class="resource-item"><span class="r-name">Literacy</span><span class="r-val">${Number(es.literacyRate || nation.education || 0).toFixed(1)}%</span></div>
        <div class="resource-item"><span class="r-name">High Skill</span><span class="r-val">${Number(es.highSkillPct || 0).toFixed(1)}%</span></div>
      </div>
      <div style="margin-top:8px;font-size:11px;color:var(--text-secondary)">
        Graduates / turn: ${Math.round(Number(es.primaryGrads || 0)).toLocaleString()} primary • ${Math.round(Number(es.secondaryGrads || 0)).toLocaleString()} secondary • ${Math.round(Number(es.tertiaryGrads || 0)).toLocaleString()} tertiary
      </div>
    </div>
    <div class="section-card">
      <h4>⚔️ Military Manpower</h4>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin-top:8px">
        <div class="resource-item"><span class="r-name">Active Duty</span><span class="r-val">${activePersonnel.toFixed(2)}M</span></div>
        <div class="resource-item"><span class="r-name">Reserve</span><span class="r-val">${reservePersonnel.toFixed(2)}M</span></div>
        <div class="resource-item"><span class="r-name">Readiness</span><span class="r-val">${Number(forces.readiness || 0).toFixed(1)}</span></div>
        <div class="resource-item"><span class="r-name">Maintenance</span><span class="r-val">${formatHumanMoneyMillions(Number(forces.maintenanceCost || 0), 2)}</span></div>
        <div class="resource-item"><span class="r-name">Force Power</span><span class="r-val">${Number(forces.totalPower || 0).toFixed(1)}</span></div>
        <div class="resource-item"><span class="r-name">Recruit Pool Used</span><span class="r-val ${serviceUsePct < 55 ? 'positive' : 'negative'}">${serviceUsePct.toFixed(1)}%</span></div>
      </div>
    </div>
  `;
}

function showPopulationDetail(nationId) {
  const overlay = document.getElementById('tabOverlay');
  const content = document.getElementById('tabContent');
  const title = document.getElementById('tabTitle');
  if (!overlay || !content) return;

  const nation = NATIONS[nationId] || (GAME.playerNation && GAME.playerNation.id === nationId ? GAME.playerNation : null);
  if (!nation) return;

  if (title) title.textContent = `👥 ${nation.name} Population`;
  content.innerHTML = renderPopulationDetailCard(nation);
  overlay.classList.remove('hidden');
}

const NATION_NUMERIC_DEFAULTS = {
  gdp: STARTING_NATION.gdp,
  population: STARTING_NATION.population,
  militaryPower: STARTING_NATION.militaryPower,
  techLevel: STARTING_NATION.techLevel,
  education: STARTING_NATION.education,
  governance: STARTING_NATION.governance,
  infrastructure: STARTING_NATION.infrastructure,
  resources: STARTING_NATION.resources,
  health: STARTING_NATION.health,
  environment: STARTING_NATION.environment,
  energySecurity: STARTING_NATION.energySecurity,
  renewableShare: STARTING_NATION.renewableShare,
  stability: STARTING_NATION.stability,
  inequality: STARTING_NATION.inequality,
  inflation: STARTING_NATION.inflation,
  debtRatio: STARTING_NATION.debtRatio,
  migrationPressure: STARTING_NATION.migrationPressure,
  innovationRisk: STARTING_NATION.innovationRisk,
  factories: STARTING_NATION.factories,
  jobs: STARTING_NATION.jobs,
  religionInfluence: STARTING_NATION.religionInfluence,
  atrocityRisk: STARTING_NATION.atrocityRisk,
  stockMarket: STARTING_NATION.stockMarket,
  corruption: STARTING_NATION.corruption,
  deficit: STARTING_NATION.deficit,
  recessionMonths: STARTING_NATION.recessionMonths,
  crisisRisk: STARTING_NATION.crisisRisk,
  decisionQuality: STARTING_NATION.decisionQuality,
  leaderTenureMonths: STARTING_NATION.leaderTenureMonths,
  lastLeaderChangeTurn: STARTING_NATION.lastLeaderChangeTurn,
  happiness: STARTING_NATION.happiness,
  resilience: STARTING_NATION.resilience,
};

function ensureFiniteNationState(nation) {
  if (!nation) return;

  Object.keys(NATION_NUMERIC_DEFAULTS).forEach(key => {
    if (!Number.isFinite(nation[key])) {
      nation[key] = NATION_NUMERIC_DEFAULTS[key];
    }
  });

  if (!nation.aiBudget || typeof nation.aiBudget !== 'object') {
    nation.aiBudget = doctrineBaseBudget(nation.policyDoctrine || 'balanced');
  }

  nation.aiBudget = normalizeBudgetObject({
    military: Number.isFinite(nation.aiBudget.military) ? nation.aiBudget.military : 20,
    economy: Number.isFinite(nation.aiBudget.economy) ? nation.aiBudget.economy : 24,
    diplomacy: Number.isFinite(nation.aiBudget.diplomacy) ? nation.aiBudget.diplomacy : 14,
    intelligence: Number.isFinite(nation.aiBudget.intelligence) ? nation.aiBudget.intelligence : 10,
    education: Number.isFinite(nation.aiBudget.education) ? nation.aiBudget.education : (Number.isFinite(nation.aiBudget.space) ? nation.aiBudget.space : 10),
    space: Number.isFinite(nation.aiBudget.space) ? nation.aiBudget.space : 10,
    social: Number.isFinite(nation.aiBudget.social) ? nation.aiBudget.social : 22,
  });
}

function getPlayerRecord() {
  return NATIONS[GAME.playerNation.id];
}

function syncPlayerNationFromRecord() {
  const record = getPlayerRecord();
  if (!record) return;
  ensureFiniteNationState(record);
  const n = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  GAME.playerNation = {
    ...GAME.playerNation,
    leader: record.leader,
    leaderType: record.leaderType,
    leaderTraits: [...record.traits],
    traits: [...record.traits],
    gdp: record.gdp,
    population: record.population,
    militaryPower: record.militaryPower,
    techLevel: record.techLevel,
    education: record.education,
    governance: record.governance,
    infrastructure: record.infrastructure,
    resources: record.resources,
    health: record.health,
    environment: record.environment,
    energySecurity: record.energySecurity,
    renewableShare: record.renewableShare,
    stability: record.stability,
    inequality: record.inequality,
    inflation: record.inflation,
    debtRatio: record.debtRatio,
    migrationPressure: record.migrationPressure,
    innovationRisk: record.innovationRisk,
    factories: record.factories,
    jobs: record.jobs,
    religionInfluence: record.religionInfluence,
    atrocityRisk: record.atrocityRisk,
    stockMarket: record.stockMarket,
    corruption: record.corruption,
    deficit: record.deficit,
    recessionMonths: record.recessionMonths,
    inCrisis: record.inCrisis,
    crisisRisk: record.crisisRisk,
    failedState: record.failedState,
    governmentStyle: record.governmentStyle,
    leaderType: record.leaderType,
    policyDoctrine: record.policyDoctrine,
    decisionQuality: record.decisionQuality,
    leaderTenureMonths: record.leaderTenureMonths,
    lastLeaderChangeTurn: record.lastLeaderChangeTurn,
    aiBudget: { ...record.aiBudget },
    traits: [...record.traits],
    happiness: record.happiness,
    resilience: record.resilience,
    companies: Array.isArray(record.companies) ? record.companies : [],
    industries: (record.industries && typeof record.industries === 'object') ? record.industries : {},
    taxRevenue: n(record.taxRevenue),
    corporateEarnings: n(record.corporateEarnings),
    treasury: n(record.treasury, n(GAME.treasury)),
    informalEconomy: n(record.informalEconomy),
    taxCollected: n(record.taxCollected),
  };
}

function relationshipKey(a, b) {
  return [a, b].sort().join('::');
}

function getWarPressure(nationId) {
  const cache = GAME.turnCache;
  if (cache && cache.turn === GAME.turn && Number.isFinite(cache.warPressureByNation?.[nationId])) {
    return cache.warPressureByNation[nationId];
  }
  if (cache && cache.turn === GAME.turn && cache.warInvolvedNations && !cache.warInvolvedNations.has(nationId)) {
    if (cache.warPressureByNation) cache.warPressureByNation[nationId] = 0;
    return 0;
  }

  let pressure = 0;
  for (const conflict of GAME.conflicts) {
    if (!conflict || conflict.phase === 'peace') continue;
    if (conflict.a === nationId || conflict.b === nationId) {
      const intensity = Number.isFinite(conflict.intensity)
        ? conflict.intensity
        : (Number.isFinite(conflict.severity) ? conflict.severity * 10 : 40);
      pressure += 1 + (intensity / 120);
    }
  }
  if (cache && cache.turn === GAME.turn && cache.warPressureByNation) {
    cache.warPressureByNation[nationId] = pressure;
  }
  return pressure;
}

function getAllianceSupport(nationId) {
  const cache = GAME.turnCache;
  if (cache && cache.turn === GAME.turn && Number.isFinite(cache.allianceSupportByNation?.[nationId])) {
    return cache.allianceSupportByNation[nationId];
  }
  if (cache && cache.turn === GAME.turn && cache.alliancePartnersByNation) {
    const partners = cache.alliancePartnersByNation[nationId] || [];
    if (!partners.length) {
      if (cache.allianceSupportByNation) cache.allianceSupportByNation[nationId] = 0;
      return 0;
    }
    const strengthByPartner = {};
    for (const alliance of GAME.alliances) {
      if (alliance.a === nationId) strengthByPartner[alliance.b] = alliance.strength;
      else if (alliance.b === nationId) strengthByPartner[alliance.a] = alliance.strength;
    }
    const support = partners.reduce((sum, partnerId) => sum + 1 + ((strengthByPartner[partnerId] || 50) / 180), 0);
    if (cache.allianceSupportByNation) cache.allianceSupportByNation[nationId] = support;
    return support;
  }

  let support = 0;
  for (const alliance of GAME.alliances) {
    if (alliance.a === nationId || alliance.b === nationId) {
      support += 1 + (alliance.strength / 180);
    }
  }
  if (cache && cache.turn === GAME.turn && cache.allianceSupportByNation) {
    cache.allianceSupportByNation[nationId] = support;
  }
  return support;
}

function hasAlliance(a, b) {
  const key = relationshipKey(a, b);
  return GAME.alliances.some(alliance => alliance.key === key);
}

function hasConflict(a, b) {
  const key = relationshipKey(a, b);
  return GAME.conflicts.some(conflict => conflict.key === key);
}

function pickRandomNationId(excluded = []) {
  const excludedSet = new Set(excluded);
  const options = Object.keys(NATIONS).filter(id => !excludedSet.has(id));
  if (!options.length) return null;
  return options[Math.floor(Math.random() * options.length)];
}

function isNationAvailableForGeopolitics(nationId) {
  const n = NATIONS[nationId];
  return !!n && !n.failedState;
}

function addAlliance(a, b) {
  if (a === b || !isNationAvailableForGeopolitics(a) || !isNationAvailableForGeopolitics(b)) return;
  if (hasAlliance(a, b)) return;

  GAME.conflicts = GAME.conflicts.filter(conflict => conflict.key !== relationshipKey(a, b));
  GAME.alliances.push({
    key: relationshipKey(a, b),
    a,
    b,
    strength: 45 + Math.random() * 35,
    formedTurn: GAME.turn,
  });
}

function declareConflict(a, b, reason = 'territorial escalation') {
  if (a === b || !isNationAvailableForGeopolitics(a) || !isNationAvailableForGeopolitics(b)) return;
  if (hasConflict(a, b)) return;

  GAME.alliances = GAME.alliances.filter(alliance => alliance.key !== relationshipKey(a, b));
  GAME.conflicts.push({
    key: relationshipKey(a, b),
    a,
    b,
    intensity: 42 + Math.random() * 38,
    duration: 0,
    reason,
  });
  addNews(`⚔️ ${NATIONS[a].name} and ${NATIONS[b].name} enter conflict (${reason})`, 'major');
}

function processGlobalMarketCycle() {
    // Collect macro averages weighted by GDP so larger economies matter more.
    let totalWeight = 0;
    let weightedInflation = 0;
    let weightedDebt = 0;
    let weightedCorruption = 0;
    let avgCreditScore = 0;
    let boomCount = 0;
    let recessionCount = 0;
    let count = 0;

    Object.values(NATIONS).forEach(n => {
      if (n.failedState) return;
      const w = clamp(n.gdp, 0.1, 30);
      totalWeight += w;
      weightedInflation += n.inflation * w;
      weightedDebt += n.debtRatio * w;
      weightedCorruption += n.corruption * w;
      avgCreditScore += computeNationCreditScore(n);
      const bp = computeBoomPhase(n);
      if (bp.phase === 'boom') boomCount++;
      if (bp.phase === 'recession' || bp.phase === 'depression') recessionCount++;
      count += 1;
    });

    if (count === 0) return;
    avgCreditScore /= count;

    const avgInflation = totalWeight ? weightedInflation / totalWeight : 0;
    const avgDebt = totalWeight ? weightedDebt / totalWeight : 0;
    const avgCorruption = totalWeight ? weightedCorruption / totalWeight : 0;
    const boomRatio = count ? boomCount / count : 0;
    const recessionRatio = count ? recessionCount / count : 0;

    // Global market index driven by credit conditions + boom/recession balance
    const creditSignal = (avgCreditScore - 50) * 0.08;
    const boomSignal = boomRatio * 5;
    const recessionDrag = recessionRatio * 3;
    const inflationPenalty = Math.max(0, avgInflation - 3) * 0.5;
    const debtPenalty = Math.max(0, avgDebt - 80) * 0.04;

    const drift = creditSignal + boomSignal - recessionDrag - inflationPenalty - debtPenalty;

    // Crash risk — when the boom is overheated + credit is strained
    const overheatCrashRisk = boomRatio > 0.15
      ? clamp((avgInflation - 4) * 0.03 + (avgDebt - 90) * 0.003 + (avgCreditScore < 45 ? 0.05 : 0), 0, 0.3)
      : 0;
    const recessionCrashRisk = recessionRatio > 0.3 ? 0.02 : 0;
    const totalCrashRisk = clamp(overheatCrashRisk + recessionCrashRisk, 0.01, 0.35);

    if (GAME.marketCrashTurns <= 0 && Math.random() < totalCrashRisk * 0.4) {
      GAME.marketCrashTurns = 3 + Math.floor(Math.random() * 6);
      addNews('📉 Global financial crisis: credit markets seize up!', 'critical');
    }

    if (GAME.marketCrashTurns > 0) {
      GAME.marketCrashTurns -= 1;
      GAME.globalMarketIndex = clamp(GAME.globalMarketIndex - (4 + Math.random() * 6), 30, 220);
    } else {
      GAME.globalMarketIndex = clamp(GAME.globalMarketIndex + drift * 0.3 + (Math.random() - 0.5) * 1.5, 30, 220);
    }

    // Store for use in runCountrySystemModel
    GAME._avgCreditScore = avgCreditScore;
    GAME._boomRatio = boomRatio;
    GAME._recessionRatio = recessionRatio;
  }

function processAlliancesAndConflicts() {
  const advancedWarEnabled = typeof processAllWars === 'function';

  // ── ALLIANCE FORMATION ────────────────────────────────
  // Pass 1: Random sampling (increased from 4→20 to cover more of the ~16k possible pairs)
  for (let i = 0; i < 20; i++) {
    const a = pickRandomNationId();
    const b = pickRandomNationId([a]);
    if (!a || !b) continue;
    const na = NATIONS[a];
    const nb = NATIONS[b];
    if (na.failedState || nb.failedState || hasConflict(a, b) || hasAlliance(a, b)) continue;

    const rel = typeof getRelationBetween === 'function' ? getRelationBetween(a, b) : 0;
    // Bilateral relation is the primary driver — nations that like each other seek alliances
    const relationBonus = clamp(rel * 0.003, -0.05, 0.18);
    const allianceChance = clamp(
      ((na.governance + nb.governance) / 200) * 0.09 +
      ((na.stability + nb.stability) / 200) * 0.06 +
      ((na.happiness + nb.happiness) / 200) * 0.04 +
      relationBonus,
      0, 0.55
    );

    if (Math.random() < allianceChance) {
      addAlliance(a, b);
      if (Math.random() < 0.35) addNews(`🤝 ${na.name} and ${nb.name} sign a strategic alliance`, 'minor');
    }
  }

  // Pass 2: Active alliance-seeking — nations with good bilateral relations (>35) proactively ally
  // Runs every 3 turns to avoid spam; samples a subset of nation pairs with high relation
  if (GAME.turn % 3 === 0) {
    const aliveIds = Object.keys(NATIONS).filter(id => !NATIONS[id].failedState);
    const checked = new Set();
    for (const aId of aliveIds) {
      if (typeof getFriendlyNationIds !== 'function') break;
      const friends = getFriendlyNationIds(aId, 35);
      for (const bId of friends) {
        const pairKey = [aId, bId].sort().join('::');
        if (checked.has(pairKey)) continue;
        checked.add(pairKey);
        if (hasAlliance(aId, bId) || hasConflict(aId, bId)) continue;
        const na = NATIONS[aId];
        const nb = NATIONS[bId];
        if (!na || !nb || na.failedState || nb.failedState) continue;
        const rel = getRelationBetween(aId, bId);
        // High-relation nations have a meaningful chance to formalize an alliance each cycle
        const allyChance = clamp((rel - 30) * 0.004 + 0.04, 0, 0.30);
        if (Math.random() < allyChance) {
          addAlliance(aId, bId);
          if (Math.random() < 0.4) addNews(`🤝 ${na.name} and ${nb.name} formalize a strategic partnership`, 'minor');
        }
      }
    }
  }

  // Legacy conflict generation/resolution is disabled when advanced war system is loaded.
  if (!advancedWarEnabled) {
    // Trigger conflicts from aggressive or unstable states.
    for (let i = 0; i < 5; i++) {
      const attackerId = pickRandomNationId();
      if (!attackerId) continue;
      const attacker = NATIONS[attackerId];
      if (attacker.failedState) continue;

      const targetId = pickRandomNationId([attackerId]);
      if (!targetId) continue;
      const target = NATIONS[targetId];
      if (target.failedState || hasAlliance(attackerId, targetId) || hasConflict(attackerId, targetId)) continue;

      const aggression = (
        (attacker.militaryPower - target.militaryPower) * 0.004 +
        (45 - attacker.resources) * 0.003 +
        (attacker.corruption - 35) * 0.002 +
        (attacker.inCrisis ? 0.04 : 0) +
        (attacker.failedState ? 0.06 : 0)
      );

      if (Math.random() < Math.max(0.01, aggression)) {
        declareConflict(attackerId, targetId, attacker.resources < 40 ? 'resource raid' : 'regional rivalry');
      }
    }

    // Resolve ongoing conflicts and apply war economics.
    const nextConflicts = [];
    for (const conflict of GAME.conflicts) {
      const a = NATIONS[conflict.a];
      const b = NATIONS[conflict.b];
      if (!a || !b || a.failedState || b.failedState) continue;

      conflict.duration += 1;
      const powerA = a.militaryPower * (0.6 + a.stability / 150) * (0.7 + a.resources / 140);
      const powerB = b.militaryPower * (0.6 + b.stability / 150) * (0.7 + b.resources / 140);
      const totalPower = Math.max(1, powerA + powerB);

      const warDamageA = (conflict.intensity / 100) * (0.05 + powerB / totalPower * 0.12);
      const warDamageB = (conflict.intensity / 100) * (0.05 + powerA / totalPower * 0.12);

      a.gdp = clamp(a.gdp - warDamageA, 0.05, 220);
      b.gdp = clamp(b.gdp - warDamageB, 0.05, 220);
      a.population = clamp(a.population - warDamageA * 0.9, 1, 1800);
      b.population = clamp(b.population - warDamageB * 0.9, 1, 1800);
      a.stability = clamp(a.stability - warDamageA * 2.4, 1, 100);
      b.stability = clamp(b.stability - warDamageB * 2.4, 1, 100);
      a.migrationPressure = clamp(a.migrationPressure + warDamageA * 3.3, 1, 100);
      b.migrationPressure = clamp(b.migrationPressure + warDamageB * 3.3, 1, 100);
      a.jobs = clamp(a.jobs - warDamageA * 2.4, 1, 100);
      b.jobs = clamp(b.jobs - warDamageB * 2.4, 1, 100);
      a.atrocityRisk = clamp(a.atrocityRisk + conflict.intensity * 0.015, 0, 100);
      b.atrocityRisk = clamp(b.atrocityRisk + conflict.intensity * 0.015, 0, 100);

      const winner = (powerA + (Math.random() - 0.5) * 18) >= (powerB + (Math.random() - 0.5) * 18) ? a : b;
      const loser = winner === a ? b : a;
      const loot = clamp(loser.resources * 0.06, 0, 6);
      winner.resources = clamp(winner.resources + loot, 1, 100);
      loser.resources = clamp(loser.resources - loot, 1, 100);
      loser.deficit = clamp(loser.deficit + 0.35, -12, 35);
      winner.stockMarket = clamp(winner.stockMarket + 0.8, 15, 240);
      loser.stockMarket = clamp(loser.stockMarket - 1.8, 15, 240);

      const endChance = clamp(0.08 + conflict.duration * 0.025 + Math.abs(powerA - powerB) / totalPower * 0.2, 0.08, 0.75);
      if (Math.random() < endChance) {
        addNews(`🕊️ ${a.name} and ${b.name} agree to a ceasefire after ${conflict.duration} months`, 'minor');
        continue;
      }

      nextConflicts.push(conflict);
    }
    GAME.conflicts = nextConflicts;
  }

  // Alliance economic spillover.
  GAME.alliances = GAME.alliances.filter(alliance => {
    const a = NATIONS[alliance.a];
    const b = NATIONS[alliance.b];
    if (!a || !b || a.failedState || b.failedState) return false;
    alliance.strength = clamp(alliance.strength + (Math.random() - 0.45) * 2.2, 20, 100);
    a.stability = clamp(a.stability + 0.08, 1, 100);
    b.stability = clamp(b.stability + 0.08, 1, 100);
    a.governance = clamp(a.governance + 0.04, 1, 100);
    b.governance = clamp(b.governance + 0.04, 1, 100);
    return alliance.strength > 22;
  });
}

function processAllianceLending() {
    // First, process sovereign lending from stable nations to struggling ones
    // based on credit scores, not just alliances. This simulates bond markets/IMF.

    const allNations = Object.values(NATIONS).filter(n => !n.failedState);
    const creditors = allNations
      .map(n => ({ nation: n, lendingPower: computeNationLendingPower(n), creditScore: computeNationCreditScore(n) }))
      .filter(c => c.lendingPower > 3 && c.nation.gdp > 2.0 && !c.nation.inCrisis)
      .sort((a, b) => b.lendingPower - a.lendingPower);

    const debtors = allNations
      .map(n => ({ nation: n, creditScore: computeNationCreditScore(n), need: (n.inCrisis ? 20 : 0) + clamp(50 - n.stability, 0, 30) + clamp(n.deficit * 2, 0, 20) + (n.gdp < 1.5 ? 10 : 0) }))
      .filter(d => d.creditScore < 50 && d.need > 5)
      .sort((a, b) => a.creditScore - b.creditScore);

    // ALLIANCE-BASED LENDING (existing system, now enhanced)
    for (const alliance of GAME.alliances) {
      const a = NATIONS[alliance.a];
      const b = NATIONS[alliance.b];
      if (!a || !b || a.failedState || b.failedState) continue;

      const aLendingPower = computeNationLendingPower(a);
      const bLendingPower = computeNationLendingPower(b);
      const aCredit = computeNationCreditScore(a);
      const bCredit = computeNationCreditScore(b);
      const aNeedsHelp = aCredit < 45 || a.inCrisis || a.crisisRisk > 72 || a.gdp < 1.6 || a.deficit > 9;
      const bNeedsHelp = bCredit < 45 || b.inCrisis || b.crisisRisk > 72 || b.gdp < 1.6 || b.deficit > 9;
      if (!aNeedsHelp && !bNeedsHelp) continue;

      const borrower = aNeedsHelp && !bNeedsHelp ? a : (bNeedsHelp && !aNeedsHelp ? b : (aCredit < bCredit ? a : b));
      const lender = borrower === a ? b : a;

      const lenderPower = borrower === a ? bLendingPower : aLendingPower;
      if (lenderPower < 2) continue;

      const lendingChance = clamp(
        (alliance.strength / 100) * 0.5 +
        (lender.stability - 40) * 0.005 +
        (100 - borrower.crisisRisk) * 0.002,
        0.08, 0.55
      );
      if (Math.random() > lendingChance) continue;

      // Support amount based on lender's lending power and alliance strength
      const interestRate = computeLendingInterestRate(borrower) / 100; // monthly rate
      const supportPower = clamp(
        (lenderPower / 20) * 0.5 +
        (lender.gdp - borrower.gdp) * 0.05 +
        alliance.strength * 0.002,
        0.05, 0.5
      );

      // Transfer: lender loses some GDP (loan), borrower gains more (stimulus)
      const loanAmount = supportPower * 0.3;
      lender.gdp = clamp(lender.gdp - loanAmount, 0.05, 140);
      borrower.gdp = clamp(borrower.gdp + supportPower, 0.05, 140);

      // Borrower benefits
      borrower.stability = clamp(borrower.stability + supportPower * 3.5, 1, 100);
      borrower.crisisRisk = clamp(borrower.crisisRisk - supportPower * 7, 0, 100);
      borrower.deficit = clamp(borrower.deficit - supportPower * 1.4, -12, 35);
      borrower.inflation = clamp(borrower.inflation - supportPower * 0.4, 0.2, 45);
      borrower.recessionMonths = clamp(borrower.recessionMonths - Math.round(supportPower * 2), 0, 240);

      // Interest income for lender (small boost to stock market)
      lender.stockMarket = clamp(lender.stockMarket + interestRate * 2, 15, 240);
      adjustNationDebtStockM(borrower, loanAmount * 1_000_000, 'alliance_lending_issuance');
      borrower.stockMarket = clamp(borrower.stockMarket + supportPower * 2, 15, 240);

      alliance.strength = clamp(alliance.strength + 0.6, 20, 100);

      if (Math.random() < 0.25) {
        addNews(`💳 ${lender.name} lends $${(loanAmount * 100).toFixed(0)}M to ally ${borrower.name} at ${(interestRate * 100).toFixed(1)}% interest`, 'minor');
      }
    }

    // SOVEREIGN BOND MARKET LENDING (new)
    // Top creditors lend to worst-off debtors independently of alliances
    let loansMade = 0;
    for (const creditor of creditors) {
      if (loansMade >= 5) break;
      if (Math.random() > 0.15) continue; // Not every creditor acts every turn

      // Find a suitable debtor
      const suitableDebtors = debtors.filter(d =>
        d.nation.id !== creditor.nation.id &&
        !hasAlliance(creditor.nation.id, d.nation.id) &&
        !hasConflict(creditor.nation.id, d.nation.id) &&
        d.creditScore < creditor.creditScore - 20
      );
      if (!suitableDebtors.length) continue;

      const debtor = suitableDebtors[Math.floor(Math.random() * Math.min(3, suitableDebtors.length))];
      const interestRate = computeLendingInterestRate(debtor.nation) / 100;

      // Lending power limits the loan size
      const maxLoan = clamp(creditor.lendingPower * 0.02, 0.02, 0.3);
      const loanSize = maxLoan * (0.3 + Math.random() * 0.7);

      // Transfer
      creditor.nation.gdp = clamp(creditor.nation.gdp - loanSize * 0.2, 0.05, 140);
      debtor.nation.gdp = clamp(debtor.nation.gdp + loanSize, 0.05, 140);
      debtor.nation.stability = clamp(debtor.nation.stability + loanSize * 4, 1, 100);
      debtor.nation.crisisRisk = clamp(debtor.nation.crisisRisk - loanSize * 8, 0, 100);
      debtor.nation.deficit = clamp(debtor.nation.deficit - loanSize * 1.5, -12, 35);

      // Debt accumulation for borrower
      adjustNationDebtStockM(debtor.nation, loanSize * 1_000_000, 'sovereign_bond_issuance');

      // Interest income for lender
      creditor.nation.stockMarket = clamp(creditor.nation.stockMarket + interestRate * 1.5, 15, 240);

      if (Math.random() < 0.3) {
        addNews(`🏦 Sovereign bond: ${creditor.nation.name} lends to ${debtor.nation.name} at ${(interestRate * 100).toFixed(1)}% APR`, 'minor');
      }
      loansMade++;
    }
  }

function computeNationResilience(nation) {
  if (!nation) return 0;
  if (nation.id) {
    const cached = getCachedResilience(nation.id);
    if (cached !== null) return cached;
  }
  const govProfile = getGovernmentProfile(nation.governmentStyle);
  const religionDrag = clamp(nation.religionInfluence * 0.004, 0, 0.4);
  const govStabilityBonus = govProfile.stabilityBoost || 1.0;

  const foundation = (
    nation.governance * 0.18 +
    nation.health * 0.14 +
    nation.infrastructure * 0.14 +
    nation.education * 0.16 +
    nation.stability * 0.18 +
    nation.environment * 0.12 +
    nation.energySecurity * 0.08
  );

  const penalties =
    nation.inflation * 2.2 +
    nation.debtRatio * 0.12 +
    nation.inequality * 0.18 +
    nation.migrationPressure * 0.08 +
    nation.corruption * 0.06;

  const educationEnvSynergy = (nation.education > 55 && nation.environment > 55) ? 6 : 0;
  const govEducationSynergy = (nation.governance > 55 && nation.education > 55) ? 5 : 0;
  const religionGovernancePenalty = religionDrag * (nation.governance < 45 ? 8 : 3);

  const resilience = clamp(
    (foundation - penalties * 0.15 + 15) * govStabilityBonus +
    educationEnvSynergy + govEducationSynergy - religionGovernancePenalty,
    1, 100
  );
  if (nation.id) setCachedResilience(nation.id, resilience);
  return resilience;
}

function computeNationHappiness(nation) {
  if (!nation) return 0;
  // Education broadens perspective and reduces inequality-driven unhappiness.
  // High environment quality increases life satisfaction.
  // Religion provides community but can create tension with governance in secular models.
  // Government type affects how well the state meets citizen needs.

  const govProfile = getGovernmentProfile(nation.governmentStyle);
  const educationWisdom = clamp(nation.education / 50, 0.5, 1.5);
  const envBeauty = clamp(nation.environment / 50, 0.5, 1.5);

  const materialWellbeing = (
    nation.health * 0.18 +
    nation.education * 0.12 +
    nation.governance * 0.12 +
    nation.stability * 0.18 +
    nation.environment * 0.10 +
    nation.infrastructure * 0.10 +
    nation.resources * 0.08 +
    nation.jobs * 0.12
  ) * educationWisdom * envBeauty;

  const stress = (
    nation.inequality * 0.18 +
    nation.inflation * 2.0 +
    nation.migrationPressure * 0.12 +
    nation.corruption * 0.05 +
    (nation.recessionMonths > 6 ? nation.recessionMonths * 0.05 : 0)
  );

  // Religion provides community buffer against stress in traditional societies
  const religionComfort = (nation.religionInfluence > 60 && nation.education < 45)
    ? clamp((nation.religionInfluence - 50) * 0.08, 0, 3)
    : 0;

  // But high religion + high education = cognitive dissonance (stress)
  const religionEducationClash = (nation.religionInfluence > 70 && nation.education > 60)
    ? clamp((nation.religionInfluence + nation.education - 120) * 0.05, 0, 3)
    : 0;

  return clamp(
    materialWellbeing - stress * 0.12 + 15 + religionComfort - religionEducationClash,
    1, 100
  );
}

// ============================================================
// CREDIT, LENDING & BOOM CYCLE SYSTEM
// ============================================================

/**
 * computeNationCreditScore(nation)
 * Returns 0–100 creditworthiness based on governance, GDP, debt, inflation,
 * education, environment, stability, and corruption.
 * Used for lending decisions, bond markets, and interest rates.
 */
function computeNationCreditScore(nation) {
  if (!nation) return 0;
  if (nation.failedState) {
    const failedScore = clamp(nation.governance * 0.05 + 2, 1, 15);
    if (nation.id) setCachedCreditScore(nation.id, failedScore);
    return failedScore;
  }

  const cached = getCachedCreditScore(nation);
  if (cached !== null) return cached;

  const govProfile = getGovernmentProfile(nation.governmentStyle);
  const educationQuality = clamp(nation.education / 50, 0.5, 1.5);
  const governanceQuality = nation.governance * govProfile.corruptionControl;

  const baseScore =
    governanceQuality * 0.25 +
    (100 - nation.corruption) * 0.10 +
    (100 - nation.inflation * 2) * 0.12 +
    (100 - nation.debtRatio * 0.35) * 0.10 +
    nation.stability * 0.12 +
    nation.education * 0.08 +
    clamp(nation.gdp * 2, 0, 40) * 0.08 +
    nation.environment * 0.05 +
    (100 - nation.inequality * 0.5) * 0.05 +
    (100 - nation.migrationPressure * 0.3) * 0.05;

  // Penalty for being in crisis
  const crisisPenalty = nation.inCrisis ? 18 : 0;
  const recessionPenalty = clamp(nation.recessionMonths * 0.3, 0, 15);
  const atrocityPenalty = nation.atrocityRisk * 0.15;

  // Bonus for education-environment synergy (sustainable development)
  const sustainabilityBonus = (nation.education > 55 && nation.environment > 55) ? 5 : 0;

  const score = clamp(
    baseScore * educationQuality - crisisPenalty - recessionPenalty - atrocityPenalty + sustainabilityBonus,
    1, 100
  );
  if (nation.id) setCachedCreditScore(nation.id, score);
  return score;
}

/**
 * computeNationLendingPower(nation)
 * Returns a lending capacity score. Higher means the nation can extend more credit to others.
 * Based on fiscal surplus, GDP size, credit score, and reserves.
 */
function computeNationLendingPower(nation) {
  if (!nation || nation.failedState) return 0;
  if (nation.id) {
    const cached = getCachedLendingPower(nation.id);
    if (cached !== null) return cached;
  }

  const creditScore = computeNationCreditScore(nation) / 100;
  const gdpScale = clamp(nation.gdp / 5, 0.2, 8);
  const fiscalHealth = clamp((5 - Math.max(0, nation.deficit)) / 5, 0, 1);
  const reserveHealth = clamp(nation.resources / 50, 0.2, 2);
  const governanceEfficiency = clamp(nation.governance / 50, 0.3, 2);

  // Surplus nations + high governance = strong lenders
  const baseLendingPower = creditScore * gdpScale * fiscalHealth * reserveHealth * governanceEfficiency * 15;

  // War and crisis reduce lending capacity
  const warPenalty = getWarPressure(nation.id || '') > 0.5 ? 0.5 : 1;
  const crisisPenalty = nation.inCrisis ? 0.4 : 1;

  const lendingPower = clamp(baseLendingPower * warPenalty * crisisPenalty, 0, 80);
  if (nation.id) setCachedLendingPower(nation.id, lendingPower);
  return lendingPower;
}

/**
 * LENDING INTEREST RATE
 * Returns an annualized interest rate (0-25%) based on the borrower's credit score.
 * Lower score = higher risk = higher interest.
 */
function computeLendingInterestRate(borrowerNation) {
  const credit = computeNationCreditScore(borrowerNation);
  // Risk premium curve: good credit (80+) = 2-5%, bad credit (<30) = 15-25%
  const baseRate = 25 - credit * 0.25;
  const crisisPremium = borrowerNation.inCrisis ? 5 : 0;
  const stabilityDiscount = clamp((borrowerNation.stability - 40) * 0.05, -2, 3);
  return clamp(baseRate + crisisPremium - stabilityDiscount, 1, 28);
}

/**
 * computeBoomPhase(nation)
 * Returns an object describing the current economic boom/bust phase:
 * { phase: 'recession'|'stagnation'|'growth'|'boom', momentum: -1..1, boomRisk: 0..1 }
 *
 * Booms are driven by leadership + government type + education level + environment.
 * A "boom" requires good leadership, educated populace, stable government, and healthy environment.
 */
function computeBoomPhase(nation) {
  if (!nation) return { phase: 'collapse', momentum: -0.8, boomRisk: 0 };
  if (nation.failedState) {
    const failed = { phase: 'collapse', momentum: -0.8, boomRisk: 0 };
    if (nation.id) setCachedBoomPhase(nation.id, failed);
    return failed;
  }
  if (nation.id) {
    const cached = getCachedBoomPhase(nation.id);
    if (cached) return cached;
  }

  const govProfile = getGovernmentProfile(nation.governmentStyle);
  const educationFactor = clamp(nation.education / 50, 0.4, 1.6);
  const envFactor = clamp(nation.environment / 50, 0.4, 1.6);
  const leaderQuality = clamp((nation.decisionQuality || 50) / 50, 0.6, 1.5);
  const governanceFactor = clamp(nation.governance / 50, 0.5, 1.5);

  // Leadership + government innovation boost = boom potential
  const boomPotential =
    leaderQuality *
    educationFactor *
    envFactor *
    governanceFactor *
    (govProfile.innovationBoost || 1.0) *
    (govProfile.econBoost || 1.0);

  // Constraints that prevent or end booms
  const debtConstraint = clamp(1 - nation.debtRatio / 150, 0.2, 1);
  const inflationConstraint = clamp(1 - Math.max(0, nation.inflation - 2) * 0.04, 0.2, 1);
  const warConstraint = getWarPressure(nation.id || '') > 0.3 ? 0.6 : 1;
  const crisisConstraint = nation.inCrisis ? 0.3 : 1;

  // Actual momentum: -1 (severe recession) to +1 (roaring boom)
  const rawMomentum =
    (boomPotential - 0.9) * 1.5 +
    (nation.stability - 50) * 0.005 +
    (nation.stockMarket - 100) * 0.002 +
    (nation.jobs - 50) * 0.003 -
    (nation.recessionMonths > 3 ? nation.recessionMonths * 0.005 : 0);

  const constrainedMomentum = clamp(
    rawMomentum * debtConstraint * inflationConstraint * warConstraint * crisisConstraint,
    -1, 1
  );

  // Determine phase
  let phase;
  if (constrainedMomentum > 0.5) phase = 'boom';
  else if (constrainedMomentum > 0.15) phase = 'growth';
  else if (constrainedMomentum > -0.1) phase = 'stagnation';
  else if (constrainedMomentum > -0.4) phase = 'recession';
  else phase = 'depression';

  // Boom overheating risk (booms carry seeds of their own destruction)
  const boomRisk = constrainedMomentum > 0.6
    ? clamp((constrainedMomentum - 0.6) * 2.5 + (nation.inflation > 5 ? 0.2 : 0) + (nation.inequality > 55 ? 0.15 : 0), 0, 0.85)
    : 0;

  const boom = { phase, momentum: constrainedMomentum, boomRisk };
  if (nation.id) setCachedBoomPhase(nation.id, boom);
  return boom;
}

function getBoomPhaseEmoji(phase) {
  switch(phase) {
    case 'boom': return '🚀';
    case 'growth': return '📈';
    case 'stagnation': return '⏸️';
    case 'recession': return '📉';
    case 'depression': return '💀';
    case 'collapse': return '☠️';
    default: return '➖';
  }
}

function getBoomPhaseLabel(phase) {
  const labels = {
    boom: 'Economic Boom',
    growth: 'Healthy Growth',
    stagnation: 'Economic Stagnation',
    recession: 'Recession',
    depression: 'Depression',
    collapse: 'State Collapse',
  };
  return labels[phase] || 'Unknown';
}

function aiChooseDoctrine(nation) {
  if (nation.failedState) return 'security-state';
  // Emergency fiscal collapse: highest priority
  if (nation.inCrisis && (nation.deficit > 10 || nation.debtRatio > 140)) return 'austerity-stabilization';
  if (nation.crisisRisk > 72 || nation.inCrisis) return 'austerity-stabilization';
  // Fiscal stress
  if (nation.deficit > 7 || nation.debtRatio > 120 || nation.inflation > 10) return 'austerity-stabilization';
  // Labor crisis
  if (nation.jobs < 42 || nation.factories < 35 || nation.recessionMonths > 8) return 'industrial-expansion';
  // Education crisis (slows long-term growth)
  if (nation.education < 38) return 'education-first';
  // Tech crisis
  if (nation.innovationRisk > 68 || nation.techLevel < 3) return 'innovation-drive';
  // High religion + low education → welfare helps stability
  if (nation.religionInfluence > 76 && nation.education < 44) return 'welfare-state';
  // Low resources → extraction
  if (nation.resources < 30) return 'resource-extraction';
  // Diplomatic stability when at war
  if (getWarPressure(nation.id || '') > 0.6) return 'diplomatic-network';
  // Government-type defaults
  if (nation.governmentStyle === 'military_junta' || nation.governmentStyle === 'dictatorship') return 'security-state';
  if (nation.governmentStyle === 'technocratic_council') return 'innovation-drive';
  if (nation.governmentStyle === 'theocratic_state') return 'welfare-state';
  // Expansion when doing well
  if (nation.gdp > 8 && nation.stability > 60 && nation.deficit < 4) return 'industrial-expansion';
  return nation.policyDoctrine || 'balanced';
}

function aiAdjustNationStrategy(nation, nationId) {
  if (!nation.aiBudget) nation.aiBudget = doctrineBaseBudget('balanced');

  const targetDoctrine = aiChooseDoctrine(nation);
  nation.policyDoctrine = targetDoctrine;
  const warPressure = getWarPressure(nationId);
  const allianceSupport = getAllianceSupport(nationId);
  const target = doctrineBaseBudget(targetDoctrine);

  // ── SITUATION-SPECIFIC ADJUSTMENTS ──────────────────────
  // Under fire: shift to military+intel, cut discretionary
  if (warPressure > 0.15) {
    target.military = clamp(target.military + 18, 10, 60);
    target.intelligence = clamp(target.intelligence + 8, 5, 30);
    target.education = clamp(target.education - 10, 2, 25);
    target.social = clamp(target.social - 8, 4, 30);
    target.economy = clamp(target.economy - 8, 5, 40);
  }

  // Fiscal emergency: hard austerity — cut spending, boost economic productivity
  if (nation.deficit > 8 || nation.debtRatio > 125 || nation.inflation > 11) {
    target.economy = clamp(target.economy + 16, 10, 55);
    target.social = clamp(target.social - 6, 4, 30);
    target.education = clamp(target.education - 6, 2, 20);
    target.military = clamp(target.military - 6, 5, 45);
    target.diplomacy = clamp(target.diplomacy + 4, 4, 25);
  }

  // Crisis or near-crisis: stabilize society + economy
  if (nation.crisisRisk > 65 || nation.inCrisis) {
    target.economy = clamp(target.economy + 10, 10, 55);
    target.social = clamp(target.social + 8, 4, 35);
    target.intelligence = clamp(target.intelligence + 5, 4, 25);
    target.military = clamp(target.military - 8, 4, 45);
    target.education = clamp(target.education - 6, 2, 20);
  }

  // Unemployment / factory shortage
  if (nation.jobs < 42 || nation.factories < 36) {
    target.economy = clamp(target.economy + 12, 10, 55);
    target.social = clamp(target.social + 5, 4, 35);
    target.education = clamp(target.education - 8, 2, 20);
    target.military = clamp(target.military - 6, 4, 45);
    target.diplomacy = clamp(target.diplomacy - 3, 3, 25);
  }

  // Education deficit: invest in social/education
  if (nation.education < 40) {
    target.social = clamp(target.social + 10, 4, 40);
    target.military = clamp(target.military - 5, 4, 45);
    target.education = clamp(target.education - 4, 2, 20);
  }

  // Strong alliances: reduce military need
    // Education deficit: invest in social/education
    if (nation.education < 40) {
      target.social = clamp(target.social + 10, 4, 40);
      target.military = clamp(target.military - 5, 4, 45);
      target.education = clamp(target.education - 4, 2, 20);
    }

    // Strict spending rule: if edu spend below minimum viable threshold, force social investment
    const _eduSpend = (nation.eduState && nation.eduState.spendGDP != null)
      ? nation.eduState.spendGDP
      : (nation.aiBudget ? nation.aiBudget.social * 0.112 : 0);
    if (_eduSpend < 2.0 && nation.education < 80) {
      target.social = clamp(target.social + 8, 4, 42);
      target.military = clamp(target.military - 4, 4, 45);
    }

    // Strong alliances: reduce military need
  if (allianceSupport > 0.6) {
    target.diplomacy = clamp(target.diplomacy + 5, 4, 25);
    target.military = clamp(target.military - 4, 4, 45);
  }

  // Tech lag: invest in R&D
  if (nation.techLevel < 3.5 || nation.innovationRisk > 70) {
    target.education = clamp(target.education + 8, 2, 25);
    target.intelligence = clamp(target.intelligence + 5, 4, 25);
    target.military = clamp(target.military - 6, 4, 45);
    target.social = clamp(target.social - 3, 4, 35);
  }

  if (typeof applyGovernmentStrategyLayer === 'function') {
    applyGovernmentStrategyLayer(nation, nationId, target);
  }

  normalizeBudgetObject(target);
  // Faster adaptation for high decision quality leaders
  const adaptSpeed = clamp((nation.decisionQuality || 55) / 200, 0.12, 0.45);
  Object.keys(target).forEach(key => {
    if (nation.aiBudget[key] !== undefined) {
      nation.aiBudget[key] = nation.aiBudget[key] + (target[key] - nation.aiBudget[key]) * adaptSpeed;
    }
  });
  normalizeBudgetObject(nation.aiBudget);
}

function maybeReplaceLeader(nation, nationId) {
  const gov = getGovernmentProfile(nation.governmentStyle);
  const turnsSinceLastChange = GAME.turn - (nation.lastLeaderChangeTurn ?? -999);
  if (turnsSinceLastChange < 24) return;

  const crimeAgainstHumanityTrigger = nation.atrocityRisk > 72;
  const economicCollapseTrigger = nation.gdp < 0.7 && nation.recessionMonths > 16 && nation.crisisRisk > 90;
  const severeCorruptionTrigger = nation.corruption > 92 && nation.crisisRisk > 84;

  if (!(crimeAgainstHumanityTrigger || economicCollapseTrigger || severeCorruptionTrigger)) return;

  const severeChance = clamp(
    (crimeAgainstHumanityTrigger ? 0.18 : 0) +
    (economicCollapseTrigger ? 0.14 : 0) +
    (severeCorruptionTrigger ? 0.12 : 0) +
    ((nation.stability < 25 ? 0.08 : 0) * gov.oustSensitivity),
    0.04,
    0.5
  );
  if (Math.random() >= severeChance) return;

  const oldLeader = nation.leader;
  const newLeader = createLeaderFromSeed(`${nationId}-${GAME.turn}-${Math.random()}`);
  nation.leader = newLeader.name;
  nation.leaderType = newLeader.type;
  nation.traits = [...newLeader.traits];
  nation.decisionQuality = clamp(45 + newLeader.decisionBonus + Math.random() * 28, 15, 95);
  nation.leaderTenureMonths = 0;
  nation.lastLeaderChangeTurn = GAME.turn;
  nation.corruption = clamp(nation.corruption - (8 + Math.random() * 10), 1, 100);
  nation.stability = clamp(nation.stability + 6 + Math.random() * 9, 1, 100);
  nation.crisisRisk = clamp(nation.crisisRisk - (10 + Math.random() * 8), 0, 100);
  nation.atrocityRisk = clamp(nation.atrocityRisk - (12 + Math.random() * 10), 0, 100);

  addNews(`🧨 ${nation.name} forces out leader ${oldLeader}; ${nation.leader} takes over after severe national crisis`, 'critical');
}

function maybeTransitionGovernment(nation, nationId) {
  if (nation.failedState && Math.random() < 0.06) {
    nation.governmentStyle = 'military_junta';
    nation.policyDoctrine = 'security-state';
    nation.lastLeaderChangeTurn = GAME.turn;
    nation.leaderTenureMonths = 0;
    addNews(`🪖 ${nation.name} falls under a military junta`, 'critical');
    return;
  }

  if ((nation.governmentStyle === 'dictatorship' || nation.governmentStyle === 'authoritarian_state') && nation.stability < 28 && nation.crisisRisk > 80 && Math.random() < 0.08) {
    nation.governmentStyle = 'federal_republic';
    nation.policyDoctrine = 'balanced';
    addNews(`🏛️ ${nation.name} transitions toward a federal republic`, 'major');
    maybeReplaceLeader(nation, `${nationId}-transition`);
    return;
  }

  // Social regression: low education + high religiosity increases authoritarian drift.
  if (nation.education < 28 && nation.religionInfluence > 78 && nation.governance < 42 && !nation.failedState) {
    if ((nation.governmentStyle === 'liberal_democracy' || nation.governmentStyle === 'federal_republic' || nation.governmentStyle === 'constitutional_monarchy') && Math.random() < 0.05) {
      nation.governmentStyle = 'authoritarian_state';
      nation.policyDoctrine = 'security-state';
      addNews(`🗜️ ${nation.name} slides into authoritarian rule amid social regression`, 'major');
      return;
    }

    if (nation.governmentStyle === 'authoritarian_state' && Math.random() < 0.03) {
      nation.governmentStyle = 'dictatorship';
      nation.policyDoctrine = 'security-state';
      addNews(`☠️ ${nation.name} hardens into dictatorship after institutional collapse`, 'critical');
      return;
    }
  }

  if (nation.governmentStyle === 'military_junta' && nation.stability > 58 && nation.governance > 56 && nation.inflation < 8 && Math.random() < 0.03) {
    nation.governmentStyle = 'constitutional_monarchy';
    nation.policyDoctrine = 'balanced';
    nation.lastLeaderChangeTurn = GAME.turn;
    nation.leaderTenureMonths = 0;
    addNews(`📜 ${nation.name} establishes constitutional rule`, 'major');
  }
}

const HISTORY_METRICS = {
  gdp: { label: 'Economy (GDP)', unit: 'trillion' },
  militaryPower: { label: 'Military', unit: 'index' },
  education: { label: 'Education', unit: 'index' },
  resources: { label: 'Resources', unit: 'index' },
  governance: { label: 'Governance', unit: 'index' },
  infrastructure: { label: 'Infrastructure', unit: 'index' },
  health: { label: 'Health', unit: 'index' },
  environment: { label: 'Environment', unit: 'index' },
  energySecurity: { label: 'Energy Security', unit: 'index' },
  renewableShare: { label: 'Renewables %', unit: 'percent' },
  stability: { label: 'Stability', unit: 'index' },
  inequality: { label: 'Inequality', unit: 'index' },
  inflation: { label: 'Inflation %', unit: 'percent' },
  debtRatio: { label: 'Debt/GDP %', unit: 'percent' },
  migrationPressure: { label: 'Migration Pressure', unit: 'index' },
  innovationRisk: { label: 'Innovation Risk', unit: 'index' },
  factories: { label: 'Factory Base', unit: 'index' },
  jobs: { label: 'Employment', unit: 'index' },
  religionInfluence: { label: 'Religiosity', unit: 'index' },
  atrocityRisk: { label: 'Atrocity Risk', unit: 'index' },
  stockMarket: { label: 'Stock Index', unit: 'index' },
  corruption: { label: 'Corruption', unit: 'index' },
  deficit: { label: 'Deficit %GDP', unit: 'percent' },
  recessionMonths: { label: 'Recession Months', unit: 'count' },
  crisisRisk: { label: 'Crisis Risk', unit: 'index' },
  decisionQuality: { label: 'State AI Quality', unit: 'index' },
  happiness: { label: 'Happiness', unit: 'index' },
  resilience: { label: 'Resilience', unit: 'index' },
  techsDiscovered: { label: 'Techs Discovered', unit: 'count' },
};

const LEADERBOARD_METRICS = {
  techsDiscovered: 'Technologies',
  resources: 'Resources',
  education: 'Education',
  militaryPower: 'Military',
  gdp: 'GDP',
  governance: 'Governance',
  infrastructure: 'Infrastructure',
  health: 'Health',
  environment: 'Environment',
  energySecurity: 'Energy Security',
  renewableShare: 'Renewables %',
  stability: 'Stability',
  inequality: 'Inequality',
  inflation: 'Low Inflation',
  debtRatio: 'Low Debt',
  migrationPressure: 'Low Migration Pressure',
  innovationRisk: 'Low Innovation Risk',
  factories: 'Factory Base',
  jobs: 'Employment',
  religionInfluence: 'Low Religiosity Drag',
  atrocityRisk: 'Low Atrocity Risk',
  stockMarket: 'Stock Market',
  corruption: 'Low Corruption',
  deficit: 'Low Deficit',
  recessionMonths: 'Low Recession',
  crisisRisk: 'Low Crisis Risk',
  decisionQuality: 'AI Quality',
  happiness: 'Happiness',
  resilience: 'Resilience',
};

function getNationMetricValue(nation, metric) {
  if (!nation) return 0;
  if (metric === 'gdp') return Number.isFinite(nation.gdp) ? nation.gdp : 0;
  if (metric === 'militaryPower') return Number.isFinite(nation.militaryPower) ? nation.militaryPower : 0;
  if (metric === 'education') return Number.isFinite(nation.education) ? nation.education : 0;
  if (metric === 'resources') return Number.isFinite(nation.resources) ? nation.resources : 0;
  if (metric === 'governance') return Number.isFinite(nation.governance) ? nation.governance : 0;
  if (metric === 'infrastructure') return Number.isFinite(nation.infrastructure) ? nation.infrastructure : 0;
  if (metric === 'health') return Number.isFinite(nation.health) ? nation.health : 0;
  if (metric === 'environment') return Number.isFinite(nation.environment) ? nation.environment : 0;
  if (metric === 'energySecurity') return Number.isFinite(nation.energySecurity) ? nation.energySecurity : 0;
  if (metric === 'renewableShare') return Number.isFinite(nation.renewableShare) ? nation.renewableShare : 0;
  if (metric === 'stability') return Number.isFinite(nation.stability) ? nation.stability : 0;
  if (metric === 'inequality') return Number.isFinite(nation.inequality) ? nation.inequality : 0;
  if (metric === 'inflation') return 100 - (Number.isFinite(nation.inflation) ? nation.inflation : 0);
  if (metric === 'debtRatio') return 200 - (Number.isFinite(nation.debtRatio) ? nation.debtRatio : 0);
  if (metric === 'migrationPressure') return 100 - (Number.isFinite(nation.migrationPressure) ? nation.migrationPressure : 0);
  if (metric === 'innovationRisk') return 100 - (Number.isFinite(nation.innovationRisk) ? nation.innovationRisk : 0);
  if (metric === 'factories') return Number.isFinite(nation.factories) ? nation.factories : 0;
  if (metric === 'jobs') return Number.isFinite(nation.jobs) ? nation.jobs : 0;
  if (metric === 'religionInfluence') return 100 - (Number.isFinite(nation.religionInfluence) ? nation.religionInfluence : 0);
  if (metric === 'atrocityRisk') return 100 - (Number.isFinite(nation.atrocityRisk) ? nation.atrocityRisk : 0);
  if (metric === 'stockMarket') return Number.isFinite(nation.stockMarket) ? nation.stockMarket : 0;
  if (metric === 'corruption') return 100 - (Number.isFinite(nation.corruption) ? nation.corruption : 0);
  if (metric === 'deficit') return 100 - ((Number.isFinite(nation.deficit) ? nation.deficit : 0) + 30);
  if (metric === 'recessionMonths') return 120 - (Number.isFinite(nation.recessionMonths) ? nation.recessionMonths : 0);
  if (metric === 'crisisRisk') return 100 - (Number.isFinite(nation.crisisRisk) ? nation.crisisRisk : 0);
  if (metric === 'decisionQuality') return Number.isFinite(nation.decisionQuality) ? nation.decisionQuality : 0;
  if (metric === 'happiness') return Number.isFinite(nation.happiness) ? nation.happiness : 0;
  if (metric === 'resilience') return Number.isFinite(nation.resilience) ? nation.resilience : 0;
  if (metric === 'techsDiscovered') return countNationTechs(nation);
  return 0;
}

function initializeHistory() {
  GAME.historyByNation = {};
  Object.keys(NATIONS).forEach(id => {
    GAME.historyByNation[id] = [];
  });
  recordHistorySnapshot();
}

function recordHistorySnapshot() {
  const snapshotDate = new Date(GAME.date);
  const year = snapshotDate.getFullYear();
  const month = snapshotDate.getMonth() + 1;

  Object.keys(NATIONS).forEach(id => {
    const nation = NATIONS[id];
    if (!GAME.historyByNation[id]) GAME.historyByNation[id] = [];
    GAME.historyByNation[id].push({
      turn: GAME.turn,
      year,
      month,
      gdp: nation.gdp,
      militaryPower: nation.militaryPower,
      education: nation.education,
      resources: nation.resources,
      governance: nation.governance,
      infrastructure: nation.infrastructure,
      health: nation.health,
      environment: nation.environment,
      energySecurity: nation.energySecurity,
      renewableShare: nation.renewableShare,
      stability: nation.stability,
      inequality: nation.inequality,
      inflation: nation.inflation,
      debtRatio: nation.debtRatio,
      migrationPressure: nation.migrationPressure,
      innovationRisk: nation.innovationRisk,
      factories: nation.factories,
      jobs: nation.jobs,
      religionInfluence: nation.religionInfluence,
      atrocityRisk: nation.atrocityRisk,
      stockMarket: nation.stockMarket,
      corruption: nation.corruption,
      deficit: nation.deficit,
      recessionMonths: nation.recessionMonths,
      crisisRisk: nation.crisisRisk,
      decisionQuality: nation.decisionQuality,
      happiness: nation.happiness,
      resilience: nation.resilience,
      techsDiscovered: countNationTechs(nation),
    });

    if (GAME.historyByNation[id].length > 180) {
      GAME.historyByNation[id].shift();
    }
  });
}

function formatMetricDisplay(metric, value) {
  if (!Number.isFinite(value)) return '--';
  if (metric === 'gdp') return formatHumanTrillions(value, 2);
  if (metric === 'renewableShare' || metric === 'inflation' || metric === 'debtRatio' || metric === 'deficit') return `${value.toFixed(1)}%`;
  if (metric === 'recessionMonths') return `${Math.round(value)}`;
  if (metric === 'techsDiscovered') return `${Math.round(value)}`;
  if (metric === 'factories' || metric === 'resources' || metric === 'stockMarket' || metric === 'militaryPower' || metric === 'education' || metric === 'governance' || metric === 'infrastructure' || metric === 'health' || metric === 'environment' || metric === 'energySecurity' || metric === 'stability' || metric === 'happiness' || metric === 'resilience') {
    return formatHumanNumber(value, 1);
  }
  return `${value.toFixed(1)}`;
}

function runCountrySystemModel(nation, isPlayer = false, nationId = null) {
  ensureFiniteNationState(nation);
  initNationDemographics(nation);
  const id = nationId || nation.id;
  const previousPopulation = Number(nation.population || 0);
  nation.leaderTenureMonths = (nation.leaderTenureMonths || 0) + 1;

  if (!isPlayer) aiAdjustNationStrategy(nation, id);

  // ALL nations — player and AI — use the same budget slider system.
  const sourceBudget = isPlayer ? GAME.budget : (nation.aiBudget || doctrineBaseBudget('balanced'));
  const econPct   = clamp(sourceBudget.economy,     2, 70);
  const socialPct = clamp(sourceBudget.social,       2, 60);
  const milPct    = clamp(sourceBudget.military,     2, 70);
  const diplPct   = clamp(sourceBudget.diplomacy,    2, 40);
  const intlPct   = clamp(sourceBudget.intelligence, 2, 35);
  const educationPct  = clamp(sourceBudget.education ?? sourceBudget.space,        2, 35);

  const gov = getGovernmentProfile(nation.governmentStyle);
  const leaderProfile = LEADER_ARCHETYPES[nation.leaderType] || LEADER_ARCHETYPES['Prime Minister'];
  const decisionFactor = clamp((nation.decisionQuality || 55) / 65, 0.85, 1.2);

  const econ = econPct / 100;
  const social = socialPct / 100;
  const military = milPct / 100;
  const diplomacy = diplPct / 100;
  const intel = intlPct / 100;
  const education = educationPct / 100;

  const rand = (s) => (Math.random() - 0.5) * s;
  const warPressure = getWarPressure(id);
  const allianceSupport = getAllianceSupport(id);
  const globalMarketDrift = (GAME.globalMarketIndex - 100) / 100;
  const preResilience = computeNationResilience(nation);

  // ── NEW: BOOM PHASE & CREDIT SCORE ────────────────────
  const boomPhase = computeBoomPhase(nation);
  const creditScore = computeNationCreditScore(nation);
  const lendingPower = computeNationLendingPower(nation);
  const boomMomentum = boomPhase.momentum; // -1 to 1
  const boomRisk = boomPhase.boomRisk;
  const isBooming = boomPhase.phase === 'boom';
  const isRecession = boomPhase.phase === 'recession' || boomPhase.phase === 'depression';

  // ── FAILED STATE HANDLER ──────────────────────────────
  if (nation.failedState) {
    const hasRecoveryProgram = nation.recoveryProgram && (nation.recoveryProgram.turnsRemaining || 0) > 0;

    if (hasRecoveryProgram) {
      nation.gdp = clamp(nation.gdp * 1.004 + rand(0.04), 0.02, 140);
      nation.population = clamp(nation.population - 0.05 + rand(0.06), 1, 1800);
      nation.factories = clamp(nation.factories + 0.18 + rand(0.08), 1, 100);
      nation.jobs = clamp(nation.jobs + 0.22 + rand(0.1), 1, 100);
      nation.stability = clamp(nation.stability + 0.55 + rand(0.2), 1, 100);
      nation.inflation = clamp(nation.inflation - 0.14 + rand(0.08), 0.2, 45);
      adjustNationDebtStockM(nation, (Number(nation.gdp || 0.2) * 1_000_000 / 12) * (0.0022 + rand(0.0016)), 'failed_state_recovery_drift');
      nation.deficit = clamp(nation.deficit - 0.1 + rand(0.12), -12, 40);
      nation.stockMarket = clamp(nation.stockMarket + 1.1 + rand(0.9), 8, 240);
      nation.crisisRisk = clamp(nation.crisisRisk - 0.65, 0, 100);
      nation.recessionMonths = clamp(nation.recessionMonths + (nation.gdp > 0.6 ? 0 : 1), 0, 240);

      nation.recoveryProgram.turnsRemaining = Math.max(0, (nation.recoveryProgram.turnsRemaining || 0) - 1);
      if (nation.recoveryProgram.turnsRemaining === 0) {
        nation.recoveryProgram.phase = 'monitoring';
      }
    } else {
      nation.gdp = clamp(nation.gdp * 0.994 + rand(0.03), 0.02, 140);
      nation.population = clamp(nation.population - 0.16 + rand(0.08), 1, 1800);
      nation.factories = clamp(nation.factories - 0.2 + rand(0.1), 1, 100);
      nation.jobs = clamp(nation.jobs - 0.25 + rand(0.1), 1, 100);
      nation.stability = clamp(nation.stability - 0.4 + rand(0.2), 1, 100);
      nation.inflation = clamp(nation.inflation + 0.18 + rand(0.1), 0.2, 45);
      adjustNationDebtStockM(nation, (Number(nation.gdp || 0.2) * 1_000_000 / 12) * (0.0052 + rand(0.0024)), 'failed_state_collapse_drift');
      nation.deficit = clamp(nation.deficit + 0.2 + rand(0.1), -12, 40);
      nation.stockMarket = clamp(nation.stockMarket - 1.4 + rand(1), 8, 240);
      nation.crisisRisk = clamp(nation.crisisRisk + 0.45, 0, 100);
      nation.recessionMonths = clamp(nation.recessionMonths + 1, 0, 240);
    }

    nation.atrocityRisk = clamp(nation.atrocityRisk + warPressure * 0.25 + (nation.corruption > 80 ? 0.1 : 0), 0, 100);

    const recoveryBoost = hasRecoveryProgram ? 0.1 : 0;
    const recoveryChance = clamp(((nation.governance + nation.resources + nation.stability) / 300) * 0.05 + recoveryBoost, 0, 0.25);
    const recoveryReady = (
      nation.gdp > (hasRecoveryProgram ? 0.45 : 0.7) &&
      nation.stability > (hasRecoveryProgram ? 24 : 35) &&
      nation.crisisRisk < (hasRecoveryProgram ? 78 : 65) &&
      nation.jobs > (hasRecoveryProgram ? 18 : 25)
    );
    if (recoveryReady && Math.random() < recoveryChance) {
      nation.failedState = false;
      nation.inCrisis = true;
      if (nation.recoveryProgram) {
        nation.recoveryProgram.phase = 'completed';
      }
      addNews(`🧱 ${nation.name} begins recovery from state failure`, 'major');
    }

    nation.happiness = computeNationHappiness(nation);
    nation.resilience = computeNationResilience(nation);
    return;
  }

  // ── BAD DECISION RISK (corruption + low governance + low decision quality) ──
  const badDecisionRisk = clamp(
    (((nation.corruption - 32) / 145) + ((52 - nation.governance) / 180) + ((58 - (nation.decisionQuality || 55)) / 190)) /
    Math.max(0.6, gov.corruptionControl),
    0, 0.18
  );
  if (Math.random() < badDecisionRisk) {
    nation.deficit = clamp(nation.deficit + 0.25 + Math.random() * 0.45, -12, 35);
    nation.inflation = clamp(nation.inflation + 0.12 + Math.random() * 0.28, 0.2, 45);
    nation.stability = clamp(nation.stability - 0.22 - Math.random() * 0.35, 1, 100);
    nation.stockMarket = clamp(nation.stockMarket - 0.7 - Math.random() * 1.3, 15, 240);
  }

  // ── STRUCTURAL DRAGS & PRESSURE ────────────────────────
  // Education below 45 drags growth; high religion combined with low education increases drag
  const educationDrag = clamp((45 - nation.education) * 0.00035, 0, 0.012);
  const religionDrag = clamp((nation.religionInfluence - 62) * 0.00028, 0, 0.012);
  // Environment below 40 also drags (pollution, climate costs)
  const environmentDrag = clamp((40 - nation.environment) * 0.0002, 0, 0.008);
  // High governance with high education and good environment = synergy bonus
  const educationEnvSynergy = (nation.education > 55 && nation.environment > 55) ? 0.003 : 0;
  const govEducationSynergy = (nation.governance > 55 && nation.education > 55) ? 0.002 : 0;
  // High religion reduces education investment effectiveness
  const religionEducationPenalty = nation.religionInfluence > 70
    ? clamp((nation.religionInfluence - 70) * 0.00015, 0, 0.004)
    : 0;

  const pressure = (
    nation.inequality * 0.12 +
    nation.inflation * 1.25 +
    nation.migrationPressure * 0.09 +
    nation.corruption * 0.08
  ) / 100;

  // ── INNOVATION ENGINE ──────────────────────────────────
  // Innovation is driven by education, tech level, infrastructure, governance,
  // and budget for intel/space. High religion influences reduce it slightly.
  // University R&D adds a modest bonus on top.
  const uniRDBonus = (typeof getEducationRDMultiplier === 'function')
    ? clamp((getEducationRDMultiplier(nation) - 1.0) * 0.015, -0.005, 0.04)
    : 0;
  const innovationEngine = (
    nation.education * 0.2 +
    nation.techLevel * 8 +
    nation.infrastructure * 0.1 +
    nation.governance * 0.09 +
    intlPct * 0.35 +
    educationPct * 0.3
  ) / 100 * (1 - religionEducationPenalty) + uniRDBonus;

  // ── PRODUCTIVITY ENGINE ────────────────────────────────
  const productivityEngine = (
    nation.infrastructure * 0.22 +
    nation.energySecurity * 0.16 +
    nation.resources * 0.12 +
    nation.jobs * 0.2 +
    nation.factories * 0.2 +
    nation.governance * 0.1
  ) / 100;

  // ── POPULATION ────────────────────────────────────────
  // Realistic: ~0.5-1.5% annual growth = ~0.04-0.12% monthly
  const fertilityPressure = clamp((nation.religionInfluence - 52) * 0.0008 + (40 - nation.education) * 0.0009, -0.01, 0.03);
  const jobsPressure = clamp((nation.jobs - 58) * 0.0004, -0.015, 0.01);
  nation.population = clamp(
    nation.population * (1 + 0.0008 + fertilityPressure + jobsPressure + (nation.health - 50) * 0.00015) + rand(0.05),
    1, 1800
  );

  // ── FACTORIES ─────────────────────────────────────────
  // DIMINISHING RETURNS: building factories gets harder as industrial base saturates
  const factoryDiminish = clamp(1.0 - (nation.factories / 100) * 0.88, 0.12, 1.0);
  nation.factories = clamp(
    nation.factories +
    ((nation.infrastructure - 50) * 0.006 +
     (nation.resources - 50) * 0.003 +
     econ * 0.6 +
     (isBooming ? 0.15 : 0) -
     warPressure * 0.12 -
     (nation.environment < 35 ? 0.1 : 0)) * factoryDiminish +
    rand(0.12),
    1, 100
  );

  // ── JOBS ──────────────────────────────────────────────
  // DIMINISHING RETURNS: harder to create jobs when employment is already high
  const jobsDiminish = clamp(1.0 - (nation.jobs / 100) * 0.88, 0.12, 1.0);
  // Jobs GDP factor: smooth ramp instead of hard cliff (no poverty trap at $5T)
  const jobsGdpFactor = clamp((nation.gdp - 1.5) * 0.025, -0.055, 0.08);
  nation.jobs = clamp(
    nation.jobs +
    ((nation.factories - 50) * 0.005 +
     jobsGdpFactor -
     (nation.population > 280 ? 0.08 : 0) -
     warPressure * 0.18 +
     econ * 0.4 +
     social * 0.18 +
     (isBooming ? 0.25 : 0)) * jobsDiminish +
    rand(0.16),
    1, 100
  );

  // ── MILITARY POWER ────────────────────────────────────
  // DIMINISHING RETURNS: harder to improve military when already powerful
  const milDiminish = clamp(1.0 - (nation.militaryPower / 100) * 0.85, 0.15, 1.0);
  nation.militaryPower = clamp(
    nation.militaryPower +
    ((nation.gdp / 120) * 0.12 +
     (nation.stability - 50) * 0.003 +
     military * 0.4) * milDiminish +
    rand(0.12),
    1, 100
  );

  // ── TECH LEVEL ────────────────────────────────────────
  // DIMINISHING RETURNS: harder to advance as tech level rises
  // Real-world: going from T1→T3 takes decades, T8→T9 takes generations
  const techDiminish = clamp(1.0 - (nation.techLevel / 10) * 0.92, 0.08, 1.0);
  nation.techLevel = clamp(
    nation.techLevel +
    (innovationEngine * 0.012 + (education + intel) * 0.008) * techDiminish -
    religionDrag * 0.15 -
    (nation.education < 35 ? 0.003 : 0) +
    rand(0.003),
    1, 10
  );

  // ── EDUCATION (managed by education.js) ───────────────────
  // 3-tier pipeline: Primary → Secondary → Tertiary
  // Spending strictly enforced; gov type caps; brain drain; university R&D
  if (typeof runEducationTurn === 'function') {
    runEducationTurn(nation, id, sourceBudget);
  } else {
    const eduDiminish = clamp(1.0 - (nation.education / 100) * 0.9, 0.1, 1.0);
    nation.education = clamp(
      nation.education +
      ((nation.governance - 50) * 0.003 + social * 0.35 +
       (nation.environment > 55 ? 0.03 : 0) + (isBooming ? 0.04 : 0) -
       (nation.governmentStyle === 'dictatorship' ? 0.12 : 0) -
       (nation.governmentStyle === 'authoritarian_state' ? 0.06 : 0) -
       (nation.religionInfluence > 72 ? 0.06 : 0)) * eduDiminish + rand(0.15),
      1, 100
    );
  }

  // ── RELIGION INFLUENCE ────────────────────────────────
  // Religion grows where education is low and governance is weak.
  // Strong governance + high education reduces religious influence.
  // Theocratic states naturally have high influence.
  nation.religionInfluence = clamp(
    nation.religionInfluence +
    (nation.education < 40 ? 0.1 : -0.05) +
    (nation.governmentStyle === 'theocratic_state' ? 0.2 : 0) +
    (nation.governance > 65 ? -0.08 : 0) +
    rand(0.16),
    5, 98
  );

  // ── INFRASTRUCTURE ────────────────────────────────────
  // DIMINISHING RETURNS: building roads in a developed country is maintenance, not growth
  const infraDiminish = clamp(1.0 - (nation.infrastructure / 100) * 0.88, 0.12, 1.0);
  nation.infrastructure = clamp(
    nation.infrastructure +
    ((nation.gdp / 220) +
     (nation.resources - 50) * 0.003 +
     econ * 0.4 -
     warPressure * 0.1) * infraDiminish +
    rand(0.13),
    1, 100
  );

  // ── RESOURCES ─────────────────────────────────────────
  // Environment affects resource sustainability. Factory-heavy nations deplete more.
  nation.resources = clamp(
    nation.resources +
    (nation.environment - 50) * 0.007 -
    (nation.factories - 50) * 0.005 -
    warPressure * 0.08 +
    rand(0.3),
    1, 100
  );

  // ── GOVERNANCE ────────────────────────────────────────
  // DIMINISHING RETURNS: institutional reform is slow and hard
  const govDiminish = clamp(1.0 - (nation.governance / 100) * 0.9, 0.1, 1.0);
  const religionGovernancePenalty = (nation.religionInfluence > 70 && (nation.governmentStyle === 'liberal_democracy' || nation.governmentStyle === 'federal_republic'))
    ? clamp((nation.religionInfluence - 70) * 0.01, 0, 0.3)
    : 0;
  nation.governance = clamp(
    nation.governance +
    ((nation.education - 50) * 0.003 -
     (nation.inequality - 50) * 0.004 +
     (diplomacy + social) * 0.08 -
     (nation.corruption - 50) * 0.003 -
     religionGovernancePenalty) * govDiminish +
    rand(0.1),
    1, 100
  );

  // ── HEALTH ────────────────────────────────────────────
  // DIMINISHING RETURNS: basic healthcare is cheap, advanced medicine is expensive
  const healthDiminish = clamp(1.0 - (nation.health / 100) * 0.88, 0.12, 1.0);
  nation.health = clamp(
    nation.health +
    ((nation.environment - 50) * 0.005 +
     (nation.infrastructure - 50) * 0.004 -
     (nation.inflation - 4) * 0.08 +
     social * 0.2) * healthDiminish +
    rand(0.14),
    1, 100
  );

  // ── RENEWABLE SHARE ──────────────────────────────────
  // DIMINISHING: first 30% is easy (wind/solar), last 30% is very hard (grid storage)
  const renewDiminish = clamp(1.0 - (nation.renewableShare / 100) * 0.85, 0.15, 1.0);
  nation.renewableShare = clamp(
    nation.renewableShare +
    ((nation.techLevel - 5) * 0.08 +
     (econ + education) * 0.18) * renewDiminish +
    rand(0.11),
    2, 96
  );

  // ── ENVIRONMENT ───────────────────────────────────────
  // DIMINISHING: cleaning up the last 10% of pollution is exponentially harder
  const envDiminish = clamp(1.0 - (nation.environment / 100) * 0.85, 0.15, 1.0);
  nation.environment = clamp(
    nation.environment +
    (-(nation.gdp / 95) * 0.09 * (1 - nation.renewableShare / 100 * 0.5) -
     (nation.militaryPower / 100) * 0.06 +
     (nation.renewableShare / 100) * 0.28 +
     social * 0.05 +
     (nation.education > 55 ? 0.04 : 0)) * envDiminish +
    rand(0.14),
    1, 100
  );

  // ── ENERGY SECURITY ───────────────────────────────────
  // DIMINISHING: energy independence gets harder as you approach 100%
  const energyDiminish = clamp(1.0 - (nation.energySecurity / 100) * 0.88, 0.12, 1.0);
  nation.energySecurity = clamp(
    nation.energySecurity +
    ((nation.renewableShare - 35) * 0.01 +
     (nation.infrastructure - 50) * 0.004 +
     (econ + education) * 0.12) * energyDiminish +
    rand(0.12),
    1, 100
  );

  // ── INFLATION ─────────────────────────────────────────
  // Slower drift — inflation doesn't jump 5% in a month
  nation.inflation = clamp(
    nation.inflation +
    (nation.debtRatio - 65) * 0.0025 -
    (nation.governance - 50) * 0.002 -
    (nation.energySecurity - 50) * 0.001 +
    Math.max(0, nation.deficit) * 0.006 +
    (GAME.marketCrashTurns > 0 ? 0.04 : -0.005) +
    warPressure * 0.012 +
    military * 0.04 +
    (isBooming ? 0.03 : isRecession ? -0.02 : 0) +
    rand(0.12),
    0.2, 45
  );

  // ── DEBT RATIO ────────────────────────────────────────
  const gdpMonthlyM = Math.max(1, Number(nation.gdp || 0.2) * 1_000_000 / 12);
  const structuralBorrowingM = Math.max(0, Number(nation.deficit || 0)) / 100 * gdpMonthlyM * 0.6;
  const inflationBorrowingM = nation.inflation > 8 ? gdpMonthlyM * 0.003 : 0;
  const crisisBorrowingM = nation.inCrisis ? gdpMonthlyM * 0.0045 : 0;
  const governancePaydownM = Math.max(0, Number(nation.governance || 50) - 50) * gdpMonthlyM * 0.0009;
  const scalePaydownM = nation.gdp > 10 ? gdpMonthlyM * 0.0012 : 0;
  const stochasticDebtM = (Math.random() - 0.5) * gdpMonthlyM * 0.0015;
  adjustNationDebtStockM(
    nation,
    structuralBorrowingM + inflationBorrowingM + crisisBorrowingM - governancePaydownM - scalePaydownM + stochasticDebtM,
    'macro_fiscal_drift'
  );

  // ── CORRUPTION ────────────────────────────────────────
  nation.corruption = clamp(
    nation.corruption +
    (55 - nation.governance) * 0.005 +
    (nation.recessionMonths > 6 ? 0.03 : -0.015) +
    (nation.inCrisis ? 0.04 : 0) -
    allianceSupport * 0.02 +
    (nation.education > 55 ? -0.015 : 0) +
    rand(0.13),
    1, 100
  );

  // ── INNOVATION RISK ───────────────────────────────────
  nation.innovationRisk = clamp(
    nation.innovationRisk +
    (nation.techLevel - 5) * 0.2 +
    (nation.corruption - 35) * 0.04 -
    (nation.governance - 50) * 0.03 -
    intel * 0.7 +
    rand(0.45),
    0, 100
  );

  if (nation.innovationRisk > 76 && Math.random() < 0.0009) {
    nation.stockMarket = clamp(nation.stockMarket - 8, 15, 240);
    nation.gdp = clamp(nation.gdp - 0.2, 0.05, 140);
    nation.stability = clamp(nation.stability - 2.5, 1, 100);
    nation.crisisRisk = clamp(nation.crisisRisk + 5, 0, 100);
    addNews(`🧪 ${nation.name} faces destabilizing black-market innovation scandal`, 'major');
  }

  // ── DEFICIT MODEL ─────────────────────────────────────
  // Coefficients calibrated so a balanced-budget stable nation (GDP≈2T, governance≈50)
  // runs near-zero deficit. Poor governance/high corruption cause realistic deficits.
  const revenueStrength =
    (nation.gdp / 70) +
    (nation.governance - 50) * 0.02 +
    econ * 1.8 +
    diplomacy * 0.45;
  const spendingPressure =
    military * 1.05 +
    social * 0.82 +
    education * 0.70 +
    intel * 0.50 +
    warPressure * 0.6 +
    (nation.corruption - 35) * 0.02;

  nation.deficit = clamp(
    nation.deficit +
    (spendingPressure - revenueStrength) * 0.16 +
    (nation.inflation > 9 ? 0.15 : -0.05) +
    rand(0.26),
    -12, 35
  );

  // ── INEQUALITY ────────────────────────────────────────
  // Booms can increase inequality if unchecked (rich get richer).
  // Education and social spending reduce it.
  nation.inequality = clamp(
    nation.inequality +
    (nation.gdp > 40 ? 0.08 : -0.03) -
    (nation.education - 50) * 0.005 -
    social * 0.3 +
    (isBooming && nation.education < 55 ? 0.15 : 0) +
    rand(0.22),
    1, 100
  );

  // ── MIGRATION PRESSURE ────────────────────────────────
  nation.migrationPressure = clamp(
    nation.migrationPressure +
    (nation.stability < 50 ? 0.2 : -0.12) +
    (nation.environment < 45 ? 0.2 : -0.06) +
    (nation.inequality - 50) * 0.01 -
    diplomacy * 0.12 +
    rand(0.2),
    1, 100
  );

  // ── STABILITY ─────────────────────────────────────────
  nation.stability = clamp(
    nation.stability +
    (nation.governance - 50) * 0.01 +
    (nation.health - 50) * 0.006 -
    (nation.inequality - 50) * 0.011 -
    (nation.inflation - 4) * 0.13 -
    (nation.migrationPressure - 50) * 0.006 +
    allianceSupport * 0.08 -
    warPressure * 0.42 -
    nation.corruption * 0.004 +
    (diplomacy + intel) * 0.2 +
    rand(0.26),
    1, 100
  );
  nation.stability = clamp(nation.stability * gov.stabilityBoost, 1, 100);

  // ── CRISIS RISK ───────────────────────────────────────
  nation.crisisRisk = clamp(
    12 +
    nation.inflation * 0.7 +
    nation.debtRatio * 0.07 +
    Math.max(0, nation.deficit) * 0.55 +
    nation.corruption * 0.28 +
    nation.recessionMonths * 0.35 +
    (100 - nation.stability) * 0.24 +
    warPressure * 2.4 +
    (GAME.marketCrashTurns > 0 ? 4 : 0) -
    nation.governance * 0.12 -
    preResilience * 0.07,
    0, 100
  );
  nation.crisisRisk = clamp(nation.crisisRisk * gov.crisisVulnerability, 0, 100);

  // ── ATROCITY RISK ─────────────────────────────────────
  nation.atrocityRisk = clamp(
    nation.atrocityRisk +
    warPressure * 0.22 +
    (nation.governmentStyle === 'dictatorship' || nation.governmentStyle === 'military_junta' ? 0.1 : 0) +
    (nation.education < 35 ? 0.08 : -0.03) +
    (nation.religionInfluence > 80 ? 0.06 : 0) -
    (nation.governance > 62 ? 0.1 : 0) +
    rand(0.1),
    0, 100
  );

  // ── CRISIS ENTRY/EXIT ────────────────────────────────
  const crisisEnterChance = clamp(0.03 + (nation.crisisRisk - 70) * 0.003, 0, 0.22);
  if (!nation.inCrisis && nation.crisisRisk > 70 && Math.random() < crisisEnterChance) {
    nation.inCrisis = true;
    addNews(`🚨 ${nation.name} enters a sovereign crisis`, 'critical');
  }

  if (nation.inCrisis) {
    const crisisLossRate = clamp(0.004 + nation.crisisRisk * 0.00008, 0.004, 0.014);
    nation.gdp = clamp(nation.gdp * (1 - crisisLossRate), 0.05, 140);
    nation.stockMarket = clamp(nation.stockMarket - (0.8 + nation.crisisRisk * 0.012), 15, 240);
    nation.stability = clamp(nation.stability - (0.22 + nation.crisisRisk * 0.003), 1, 100);
    nation.deficit = clamp(nation.deficit + 0.12, -12, 35);
    nation.inflation = clamp(nation.inflation + 0.08, 0.2, 45);

    if (nation.crisisRisk < 50 && nation.stability > 45 && Math.random() < 0.28) {
      nation.inCrisis = false;
      addNews(`✅ ${nation.name} exits acute crisis mode`, 'minor');
    }
  }

  // ── FAILED STATE CHECK ────────────────────────────────
  if (
    !nation.failedState &&
    nation.inCrisis &&
    nation.crisisRisk > 90 &&
    nation.stability < 18 &&
    nation.gdp < 0.8 &&
    (nation.jobs < 30 || nation.recessionMonths > 26) &&
    Math.random() < 0.16
  ) {
    nation.failedState = true;
    addNews(`💥 ${nation.name} collapses into state failure`, 'critical');
  }

  updateNationDemographics(nation, id, previousPopulation);

  nation.happiness = computeNationHappiness(nation);
  nation.resilience = computeNationResilience(nation);

  // ── RESEARCH PROCESSING ────────────────────────────────
  // Every nation conducts research each turn
  if (!nation.research) initNationResearch(nation);
  processNationResearch(nation, isPlayer);

  if (!isPlayer) {
    maybeReplaceLeader(nation, id);
    maybeTransitionGovernment(nation, id);
  }
}

function buildLineChartSvg(values, labels) {
  if (!values || values.length < 2) {
    return '<p class="text-muted">Not enough historical data yet. Run simulation turns to build chart history.</p>';
  }

  const w = 760;
  const h = 260;
  const p = 34;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(0.0001, max - min);

  const toX = (i) => p + (i / (values.length - 1)) * (w - p * 2);
  const toY = (v) => h - p - ((v - min) / range) * (h - p * 2);

  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');
  const guide = [0.2, 0.4, 0.6, 0.8].map(r => {
    const y = (h - p) - r * (h - p * 2);
    return `<line x1="${p}" y1="${y.toFixed(2)}" x2="${w - p}" y2="${y.toFixed(2)}" class="chart-guide"/>`;
  }).join('');

  const labelIndexes = [0, Math.floor((values.length - 1) / 2), values.length - 1]
    .filter((v, i, arr) => arr.indexOf(v) === i);
  const xLabels = labelIndexes.map(idx => {
    const x = toX(idx);
    return `<text x="${x.toFixed(2)}" y="${(h - 8).toFixed(2)}" text-anchor="middle" class="chart-label">${labels[idx]}</text>`;
  }).join('');

  return `
    <svg viewBox="0 0 ${w} ${h}" class="history-chart-svg" role="img" aria-label="Country metric history chart">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(46,167,255,0.45)"/>
          <stop offset="100%" stop-color="rgba(46,167,255,0.03)"/>
        </linearGradient>
      </defs>
      ${guide}
      <path d="${d} L ${toX(values.length - 1).toFixed(2)},${(h - p).toFixed(2)} L ${toX(0).toFixed(2)},${(h - p).toFixed(2)} Z" fill="url(#chartFill)"/>
      <path d="${d}" class="chart-line"/>
      ${xLabels}
    </svg>
  `;
}

// ============================================================
// INVENTION & TECHNOLOGY SYSTEM
// ============================================================
// 5 Branches x 25 Tiers = 500+ discoverable technologies
// Each nation has: researchPoints, discoveredTechs[], techTreeProgress{}

const TECH_BRANCHES = {
  medicine: {
    name: '💊 Medicine & Biology',
    icon: '💊',
    color: '#4caf80',
    description: 'Healthcare, genetics, longevity, bioweapons',
  },
  nuclear: {
    name: '☢️ Nuclear Science',
    icon: '☢️',
    color: '#ff8c00',
    description: 'Fission, fusion, weapons, energy',
  },
  power: {
    name: '⚡ Power & Energy',
    icon: '⚡',
    color: '#f0c040',
    description: 'Grid tech, batteries, renewables, fusion',
  },
  computing: {
    name: '🖥️ Computing & AI',
    icon: '🖥️',
    color: '#4a90d9',
    description: 'Computers, internet, AI, quantum, cyber',
  },
  weapons: {
    name: '🔫 Weapons & Defense',
    icon: '🔫',
    color: '#e74c5e',
    description: 'Conventional, missiles, space weapons, drones',
  },
};

const TECH_BRANCH_KEYS = Object.keys(TECH_BRANCHES);

// Generate 500+ tech items across 5 branches, 25 tiers each
function generateTechTree() {
  const tree = {};
  const techNames = {
    medicine: [
      // Tier 1-5: Basic medicine
      ['Antibiotics', 'Vaccination Programs', 'Sanitation Standards', 'Basic Surgery', 'Disease Classification'],
      // Tier 6-10: Advanced medicine
      ['Organ Transplants', 'Antiviral Therapies', 'MRI Imaging', 'Genetic Sequencing', 'Stem Cell Research'],
      // Tier 11-15: Genetic & nano
      ['Gene Therapy', 'CRISPR Editing', 'Nanomedicine', 'Targeted Immunotherapy', 'Synthetic Biology'],
      // Tier 16-20: Transhuman
      ['Cybernetic Prosthetics', 'Neural Interface', 'Organ Cloning', 'Longevity Treatments', 'Bio-Engineered Tissue'],
      // Tier 21-25: Transcendent
      ['Cellular Regeneration', 'Memory Encoding', 'Brain-Cloud Interface', 'Biological Immortality', 'Consciousness Upload'],
      // Extra tier fillers
      ['Blood Transfusion', 'Penicillin Mass Production', 'Anesthesia', 'X-Ray Diagnostics', 'Germ Theory'],
      ['Polio Eradication', 'Chemotherapy', 'LASIK Surgery', 'Prosthetic Limbs', 'Heart Bypass Surgery'],
      ['DNA Profiling', 'Phage Therapy', 'Bionic Eye', 'Lab-Grown Organs', 'Telomere Extension'],
      ['Epigenetic Reprogramming', 'Nanorobotic Surgery', 'Brain-Machine Fusion', 'Hibernation Induction', 'Metabolic Control'],
      ['Pandemic Prediction AI', 'Biological 3D Printing', 'Neural Mapping', 'Death Reversal Research', 'Augmented Evolution'],
    ],
    nuclear: [
      // Tier 1-5
      ['Uranium Enrichment', 'Nuclear Fission Theory', 'Atomic Pile Experiment', 'Radiation Shielding', 'Isotope Separation'],
      // Tier 6-10
      ['Nuclear Reactor Design', 'Pressurized Water Reactor', 'Breeder Reactor', 'Nuclear Submarine Engine', 'Radioisotope Thermoelectric'],
      // Tier 11-15
      ['Fast Neutron Reactor', 'Thorium Cycle', 'Small Modular Reactor', 'Nuclear Waste Reprocessing', 'Fusion Confinement'],
      // Tier 16-20
      ['Tokamak Fusion', 'Stellarator Design', 'Laser Ignition Fusion', 'Plasma Stabilization', 'Helium-3 Extraction'],
      // Tier 21-25
      ['Commercial Fusion Power', 'Aneutronic Fusion', 'Fusion Microreactor', 'Antimatter Catalysis', 'Zero-Point Energy Extraction'],
      // Extra fillers
      ['Neutron Activation Analysis', 'Gamma Spectroscopy', 'MOX Fuel Fabrication', 'Nuclear Desalination', 'Particle Accelerator'],
      ['Nuclear Propulsion', 'Containment Dome', 'Spent Fuel Storage', 'Fast Breeder Loop', 'Tritium Breeding'],
      ['Laser Fusion Ignition', 'Magnetic Mirror', 'Plasma Heating', 'Superconducting Magnets', 'Boron-11 Fuel'],
      ['Fusion Waste Transmutation', 'Subcritical Reactor', 'Traveling Wave Reactor', 'Liquid Salt Reactor', 'Pebble Bed Reactor'],
      ['Dark Matter Reactor Theory', 'QCD Energy Harvesting', 'Spacetime Lensing Power', 'Vacuum Energy Extraction', 'Micro Singularity Reactor'],
    ],
    power: [
      // Tier 1-5
      ['Steam Turbine', 'Hydroelectric Dam', 'Coal Power Plant', 'Electrical Grid', 'AC/DC Transmission'],
      // Tier 6-10
      ['Natural Gas Turbine', 'Solar Photovoltaic', 'Wind Turbine Farm', 'Geothermal Plant', 'Smart Grid'],
      // Tier 11-15
      ['Offshore Wind', 'Concentrated Solar', 'Tidal Energy', 'Grid-Scale Batteries', 'Hydrogen Fuel Cells'],
      // Tier 16-20
      ['Superconducting Grid', 'Space-Based Solar', 'Wireless Power Transfer', 'Graphene Batteries', 'Quantum Battery'],
      // Tier 21-25
      ['Stellar-Level Harvesting', 'Dyson Swarm Concept', 'Zero-Loss Grid', 'Matter-Energy Conversion', 'Exotic Matter Power'],
      // Extra fillers
      ['Grid Synchronization', 'Peak Load Management', 'Substation Automation', 'Power Transformer', 'Insulator Technology'],
      ['Solar Inverter', 'Lithium-Ion Cell', 'Grid Storage Farm', 'Pumped Hydro Storage', 'Compressed Air Storage'],
      ['Thermal Storage', 'Molten Salt Reactor Heat', 'Ocean Thermal Conversion', 'Kinetic Energy Storage', 'Supercapacitor'],
      ['Room Temp Superconductor', 'Quantum Grid Routing', 'Self-Healing Grid', 'Fusion Grid Integration', 'Plasma Power Extraction'],
      ['Quantum Entanglement Power', 'Dimensional Tapping', 'Solar Satellite Network', 'Mega-Battery Array', 'Atmospheric Energy Harvesting'],
    ],
    computing: [
      // Tier 1-5
      ['Transistor', 'Integrated Circuit', 'Microprocessor', 'Computer Memory', 'Operating System'],
      // Tier 6-10
      ['Internet Protocol', 'Personal Computer', 'Mobile Network', 'World Wide Web', 'Cloud Computing'],
      // Tier 11-15
      ['Machine Learning', 'Neural Networks', 'Quantum Computing Theory', 'Blockchain', 'Optical Computing'],
      // Tier 16-20
      ['Quantum Processor', 'Photonic Chip', 'Neuromorphic Hardware', 'DNA Storage', 'Quantum Internet'],
      // Tier 21-25
      ['Quantum Supremacy', 'True AI General Intelligence', 'Quantum Teleportation', 'Consciousness Computing', 'Reality Simulation Engine'],
      // Extra fillers
      ['Semiconductor Fabrication', 'Silicon Wafer', 'Logic Gate Design', 'Compiler Design', 'Database Engine'],
      ['TCP/IP Stack', 'Web Browser', 'Search Algorithm', 'Social Media Platform', 'Encryption Protocol'],
      ['Big Data Analytics', 'GPU Computing', 'Voice Recognition', 'Computer Vision', 'Natural Language Processing'],
      ['Edge Computing', 'Swarm Intelligence', 'Federated Learning', 'Homomorphic Encryption', 'Post-Quantum Crypto'],
      ['Self-Writing Code', 'Emotion AI', 'Collective Intelligence', 'Quantum Neural Net', 'Universal Translator'],
    ],
    weapons: [
      // Tier 1-5
      ['Rifle Standardization', 'Artillery Shell', 'Armored Vehicle', 'Naval Gunship', 'Military Radio'],
      // Tier 6-10
      ['Jet Fighter', 'Ballistic Missile', 'Nuclear Warhead', 'Guided Munition', 'Stealth Technology'],
      // Tier 11-15
      ['Cruise Missile', 'Drone Swarm', 'Railgun', 'Directed Energy', 'Cyber Warfare Suite'],
      // Tier 16-20
      ['Orbital Weapon Platform', 'Hypersonic Glider', 'Kinetic Rod System', 'Space Laser', 'AI Battle Command'],
      // Tier 21-25
      ['Planetary Defense Grid', 'Orbital Bombardment', 'Quantum Jamming', 'Nano-Weapon Swarm', 'Reality Denial Weapon'],
      // Extra fillers
      ['Mortar System', 'Machine Gun', 'Combat Helmet', 'Night Vision', 'Body Armor'],
      ['Radar System', 'Sonar Array', 'Satellite Recon', 'Electronic Warfare', 'Missile Guidance'],
      ['Precision Bombing', 'Smart Bullet', 'Active Protection', 'C4I System', 'Battlefield Network'],
      ['Robotic Soldier', 'Exoskeleton Suit', 'Orbital Satellite Weapon', 'Plasma Cannon', 'EMP Generator'],
      ['Temporal Dampening Field', 'Gravity Weapon', 'Molecular Disassembler', 'Void Warhead', 'Probability Munition'],
    ],
  };

  let globalId = 0;

  TECH_BRANCH_KEYS.forEach(branch => {
    tree[branch] = {};
    const names = techNames[branch] || [];
    // Flatten all names and assign tiers
    const allNames = names.flat();
    
    allNames.forEach((name, idx) => {
      const tier = Math.min(25, Math.floor(idx / 2) + 1); // ~2 techs per tier
      const id = `${branch}_${++globalId}`;
      const researchCost = Math.floor(20 + tier * 18 + Math.random() * 15);
      const sellValue = Math.floor(researchCost * (0.6 + Math.random() * 0.5));
      
      tree[branch][id] = {
        id,
        name,
        branch,
        tier,
        index: idx,
        researchCost,
        sellValue,
        discovered: false,
        // Effects applied on discovery
        effects: generateTechEffects(branch, tier, name),
        description: generateTechDescription(branch, tier, name),
      };
    });

    // Ensure we have enough techs (at least 100 per branch)
    while (Object.keys(tree[branch]).length < 100) {
      const tier = (Object.keys(tree[branch]).length % 25) + 1;
      const id = `${branch}_${++globalId}`;
      const name = `${branch}-tech-${Object.keys(tree[branch]).length + 1}`;
      const researchCost = Math.floor(20 + tier * 18 + Math.random() * 15);
      tree[branch][id] = {
        id,
        name,
        branch,
        tier,
        index: Object.keys(tree[branch]).length,
        researchCost,
        sellValue: Math.floor(researchCost * 0.6),
        discovered: false,
        effects: generateTechEffects(branch, tier, name),
        description: `${TECH_BRANCHES[branch].name} advancement at tier ${tier}`,
      };
    }
  });

  return tree;
}

function generateTechEffects(branch, tier, name) {
  const tierScale = tier / 25;
  const effects = {};
  
  // Core branch effects scale with tier
  switch(branch) {
    case 'medicine':
      effects.health = 1.2 + tier * 0.35;
      effects.population = 0.05 + tier * 0.008;
      effects.education = tier > 15 ? 0.1 : 0;
      effects.happiness = 0.3 + tier * 0.04;
      if (tier > 20) effects.longevity = true;
      break;
    case 'nuclear':
      effects.energySecurity = 1.0 + tier * 0.3;
      effects.militaryPower = 0.8 + tier * 0.25;
      effects.renewableShare = tier > 12 ? 0.3 : 0;
      effects.inflation = tier > 15 ? -0.02 : 0;
      if (tier > 22) effects.fusionPower = true;
      break;
    case 'power':
      effects.energySecurity = 1.5 + tier * 0.4;
      effects.infrastructure = 0.5 + tier * 0.15;
      effects.environment = 0.3 + tier * 0.1;
      effects.renewableShare = 0.5 + tier * 0.2;
      effects.factories = 0.3 + tier * 0.08;
      if (tier > 22) effects.infinitePower = true;
      break;
    case 'computing':
      effects.techLevel = 0.08 + tier * 0.03;
      effects.education = 0.5 + tier * 0.12;
      effects.innovationRisk = -(0.5 + tier * 0.1);
      effects.stockMarket = 1.0 + tier * 0.2;
      effects.governance = 0.2 + tier * 0.05;
      if (tier > 20) effects.quantumComputing = true;
      if (tier > 23) effects.trueAI = true;
      break;
    case 'weapons':
      effects.militaryPower = 1.5 + tier * 0.4;
      effects.stability = tier > 10 ? 0.05 : -0.1;
      effects.resources = tier > 8 ? 0.2 : 0;
      if (tier > 18) effects.spaceWeapons = true;
      if (tier > 23) effects.orbitalDominance = true;
      break;
  }

  // Generic economic boost
  effects.gdpBoost = 0.001 + tier * 0.0004;
  effects.researchBoost = 1 + tier * 0.5;

  return effects;
}

function generateTechDescription(branch, tier, name) {
  const tierLabels = ['Primitive', 'Basic', 'Developing', 'Advanced', 'Cutting-Edge', 'Revolutionary', 'Transcendent'];
  const tierLabel = tierLabels[Math.min(tierLabels.length - 1, Math.floor(tier / 4))];
  return `${TECH_BRANCHES[branch].name} - ${tierLabel} (Tier ${tier}): ${name}`;
}

// Initialize the tech tree
const TECH_TREE = generateTechTree();

// Count total techs
const TOTAL_TECHS = TECH_BRANCH_KEYS.reduce((sum, b) => sum + Object.keys(TECH_TREE[b]).length, 0);

// Initialize a nation's research state
function initNationResearch(nation) {
  if (!nation.research) {
    nation.research = {
      points: 0,
      totalPointsInvested: 0,
      discoveredTechs: [], // array of tech IDs
      currentProject: null, // { branch, techId, investedPoints }
      completedBranches: {}, // { branch: { completed: count, total: count } }
      techsForSale: [], // tech IDs this nation is willing to sell
      soldTechs: [], // tech IDs this nation has sold
      purchasedTechs: [], // tech IDs bought from others
    };
  }
  
  // Ensure completion tracking
  TECH_BRANCH_KEYS.forEach(branch => {
    if (!nation.research.completedBranches) nation.research.completedBranches = {};
    if (!nation.research.completedBranches[branch]) {
      nation.research.completedBranches[branch] = {
        completed: 0,
        total: Object.keys(TECH_TREE[branch]).length,
      };
    }
  });

  // Ensure arrays exist
  if (!nation.research.discoveredTechs) nation.research.discoveredTechs = [];
  if (!nation.research.techsForSale) nation.research.techsForSale = [];
  if (!nation.research.soldTechs) nation.research.soldTechs = [];
  if (!nation.research.purchasedTechs) nation.research.purchasedTechs = [];
}

// Generate research points per turn for a nation
function computeNationResearchPerTurn(nation) {
  if (nation.failedState) return 0.3;
  
  const eduFactor = clamp(nation.education / 50, 0.1, 2.5);
  const govFactor = clamp(nation.governance / 50, 0.2, 2.0);
  const techFactor = clamp(nation.techLevel / 5, 0.1, 2.0);
  const infraFactor = clamp(nation.infrastructure / 50, 0.2, 1.8);
  
  // Budget contribution (R&D from space + intel + social budgets)
  const budget = nation.aiBudget || { education: 10, intelligence: 10, social: 10, economy: 10 };
  const budgetFactor = ((budget.education ?? budget.space) * 0.4 + budget.intelligence * 0.2 + budget.social * 0.15 + budget.economy * 0.1) / 20;
  
  // Religion drag (traditional societies research less)
  const religionDrag = clamp(nation.religionInfluence > 65 ? (nation.religionInfluence - 65) * 0.01 : 0, 0, 0.35);
  
  // Environment bonus (clean environment = healthy researchers)
  const envBonus = clamp(nation.environment / 100, 0.5, 1.2);
  
  // Synergy: high education + high governance = research powerhouse
  const synergyBonus = (nation.education > 60 && nation.governance > 55) ? 1.3 : 1.0;
  
  // DIMINISHING RETURNS: more techs discovered = harder to discover new ones
  const discoveredCount = (nation.research?.discoveredTechs?.length || 0) + (nation.research?.purchasedTechs?.length || 0);
  const discoveryDiminish = clamp(1.0 - (discoveredCount / 500) * 0.7, 0.3, 1.0);
  
  const basePoints = 0.8 + eduFactor * 1.2 + govFactor * 0.5 + techFactor * 1.0 + infraFactor * 0.4;
  const budgetPoints = budgetFactor * 1.5;
  
  return clamp(
    (basePoints + budgetPoints) * envBonus * synergyBonus * (1 - religionDrag) * discoveryDiminish,
    0.3, 18
  ) * (nation.inCrisis ? 0.4 : 1.0) * (nation.recessionMonths > 6 ? 0.7 : 1.0);
}

// Get all available (undiscovered) techs for a nation, sorted by tier
function getAvailableTechs(nation, branch) {
  const discovered = new Set(nation.research.discoveredTechs);
  const purchased = new Set(nation.research.purchasedTechs || []);
  const allTechs = Object.values(TECH_TREE[branch]);
  
  return allTechs
    .filter(t => !discovered.has(t.id) && !purchased.has(t.id))
    .sort((a, b) => a.tier - b.tier || a.researchCost - b.researchCost);
}

// Pick the best next research project for AI nations
function aiPickResearchProject(nation) {
  if (!nation.research) initNationResearch(nation);
  
  // Prefer branches where nation is weakest or has strategic need
  const branchPriorities = [];
  
  TECH_BRANCH_KEYS.forEach(branch => {
    const completed = nation.research.completedBranches[branch]?.completed || 0;
    const total = nation.research.completedBranches[branch]?.total || 1;
    const progress = completed / total;
    
    let priority = 1 - progress; // Base: prioritize unfinished branches
    
    // Strategic needs boost priority
    if (branch === 'medicine' && nation.health < 45) priority += 0.3;
    if (branch === 'power' && nation.energySecurity < 40) priority += 0.3;
    if (branch === 'weapons' && (nation.militaryPower < 35 || getWarPressure(nation.id || '') > 0.3)) priority += 0.4;
    if (branch === 'computing' && nation.techLevel < 4) priority += 0.3;
    if (branch === 'nuclear' && nation.resources < 35) priority += 0.2;
    if (branch === 'computing' && nation.education > 55) priority += 0.2; // Educated nations push computing
    
    branchPriorities.push({ branch, priority: clamp(priority, 0, 2) });
  });
  
  // Sort by priority (highest first)
  branchPriorities.sort((a, b) => b.priority - a.priority);
  
  // Pick from highest priority branch with available techs
  for (const bp of branchPriorities) {
    const available = getAvailableTechs(nation, bp.branch);
    if (available.length > 0) {
      // Pick the cheapest available tech in this branch (rapid progress) or highest tier based on education
      const pick = nation.education > 60
        ? available[Math.min(available.length - 1, Math.floor(available.length * 0.6))] // Go for advanced if smart
        : available[0]; // Go for easy wins
      return { branch: bp.branch, techId: pick.id, tech: pick };
    }
  }
  
  return null;
}

// Apply tech effects when discovered
function applyTechEffects(nation, tech) {
  const effects = tech.effects;
  if (!effects) return;
  
  if (effects.health) nation.health = clamp(nation.health + effects.health * 0.15, 1, 100);
  if (effects.energySecurity) nation.energySecurity = clamp(nation.energySecurity + effects.energySecurity * 0.12, 1, 100);
  if (effects.infrastructure) nation.infrastructure = clamp(nation.infrastructure + effects.infrastructure * 0.1, 1, 100);
  if (effects.militaryPower) nation.militaryPower = clamp(nation.militaryPower + effects.militaryPower * 0.08, 1, 100);
  if (effects.education) nation.education = clamp(nation.education + effects.education * 0.1, 1, 100);
  if (effects.population) nation.population = clamp(nation.population + effects.population, 1, 1800);
  if (effects.happiness) nation.happiness = clamp(nation.happiness + effects.happiness * 0.08, 1, 100);
  if (effects.renewableShare) nation.renewableShare = clamp(nation.renewableShare + effects.renewableShare * 0.08, 2, 96);
  if (effects.governance) nation.governance = clamp(nation.governance + effects.governance * 0.08, 1, 100);
  if (effects.environment) nation.environment = clamp(nation.environment + effects.environment * 0.08, 1, 100);
  if (effects.factories) nation.factories = clamp(nation.factories + effects.factories * 0.1, 1, 100);
  if (effects.stockMarket) nation.stockMarket = clamp(nation.stockMarket + effects.stockMarket * 0.15, 15, 240);
  if (effects.innovationRisk) nation.innovationRisk = clamp(nation.innovationRisk + effects.innovationRisk * 0.1, 0, 100);
  
  // GDP boost from tech
  if (effects.gdpBoost) {
    nation.gdp = clamp(nation.gdp * (1 + effects.gdpBoost), 0.03, 140);
  }
  
  // Tech level boost
  if (effects.techLevel) {
    nation.techLevel = clamp(nation.techLevel + effects.techLevel * 0.5, 1, 10);
  }
  
  // Special flags
  if (effects.longevity) nation._hasLongevity = true;
  if (effects.fusionPower) nation._hasFusionPower = true;
  if (effects.infinitePower) nation._hasInfinitePower = true;
  if (effects.quantumComputing) nation._hasQuantumComputing = true;
  if (effects.trueAI) nation._hasTrueAI = true;
  if (effects.spaceWeapons) nation._hasSpaceWeapons = true;
  if (effects.orbitalDominance) nation._hasOrbitalDominance = true;
}

// Process research for a nation each turn
function processNationResearch(nation, isPlayer = false) {
  if (!nation.research) initNationResearch(nation);
  
  // Generate research points
  const pointsPerTurn = computeNationResearchPerTurn(nation);
  nation.research.points += pointsPerTurn;
  nation.research.totalPointsInvested += pointsPerTurn;
  
  // If no current project, AI picks one
  if (!nation.research.currentProject) {
    if (isPlayer) return; // Player must pick manually
    const project = aiPickResearchProject(nation);
    if (project) {
      nation.research.currentProject = {
        branch: project.branch,
        techId: project.techId,
        investedPoints: 0,
      };
    }
  }
  
  // Invest points in current project
  if (nation.research.currentProject) {
    const project = nation.research.currentProject;
    const tech = TECH_TREE[project.branch]?.[project.techId];
    
    if (!tech || nation.research.discoveredTechs.includes(project.techId) || (nation.research.purchasedTechs || []).includes(project.techId)) {
      // Tech no longer valid
      nation.research.currentProject = null;
      return;
    }
    
    // Education greatly affects research speed
    const eduSpeed = clamp(nation.education / 40, 0.3, 2.5);
    const pointsToInvest = Math.min(nation.research.points, (2 + pointsPerTurn * 0.3) * eduSpeed);
    
    project.investedPoints += pointsToInvest;
    nation.research.points -= pointsToInvest;
    
    // Check if discovery threshold reached
    if (project.investedPoints >= tech.researchCost) {
      // DISCOVERY!
      completeTechDiscovery(nation, project.branch, project.techId, tech);
      nation.research.currentProject = null;
    }
  }
}

// Complete a tech discovery
function completeTechDiscovery(nation, branch, techId, tech) {
  if (!tech) tech = TECH_TREE[branch]?.[techId];
  if (!tech) return;
  
  nation.research.discoveredTechs.push(techId);
  tech.discovered = true;
  
  // Update branch completion tracking
  if (nation.research.completedBranches[branch]) {
    nation.research.completedBranches[branch].completed++;
  }
  
  // Apply effects
  applyTechEffects(nation, tech);
  
  // Boost to stock market (innovation excitement)
  nation.stockMarket = clamp(nation.stockMarket + tech.tier * 0.3 + 2, 15, 240);
  
  // GDP boost from successful research (tiny — gdp is in $T)
  const gdpBoost = (0.002 + tech.tier * 0.0005) / 100;
  nation.gdp = clamp(nation.gdp * (1 + gdpBoost), 0.03, 140);
  
  // Stability boost (national pride)
  nation.stability = clamp(nation.stability + tech.tier * 0.04 + 0.3, 1, 100);
  
  // Add news for significant breakthroughs (tier 10+ or for player)
  if (tech.tier >= 10 || tech.tier % 5 === 0) {
    const branchIcon = TECH_BRANCHES[branch]?.icon || '🔬';
    addNews(`${branchIcon} ${nation.name} achieves breakthrough: ${tech.name} (Tier ${tech.tier})`, 'major');
  }
}

// Sell a tech to another nation
function sellTechToNation(sellerNation, buyerNation, techId) {
  if (!sellerNation.research || !buyerNation.research) return false;
  if (!sellerNation.research.discoveredTechs.includes(techId)) return false;
  if (buyerNation.research.discoveredTechs.includes(techId) || (buyerNation.research.purchasedTechs || []).includes(techId)) return false;
  
  const tech = findTechById(techId);
  if (!tech) return false;
  
  // Calculate price based on tier and seller's bargaining power
  const basePrice = tech.sellValue;
  const sellerPower = clamp(sellerNation.decisionQuality / 50, 0.5, 2);
  const buyerNeed = clamp((40 - buyerNation.techLevel) * 5, 0, 50);
  const price = Math.floor(basePrice * sellerPower * 0.8 + buyerNeed * 0.5);
  
  // Transfer tech
  buyerNation.research.purchasedTechs.push(techId);
  sellerNation.research.soldTechs.push(techId);
  
  // Apply partial effects to buyer (less effective than discovering it yourself)
  const partialEffects = { ...tech.effects };
  Object.keys(partialEffects).forEach(k => {
    if (typeof partialEffects[k] === 'number') partialEffects[k] *= 0.5;
  });
  applyTechEffects(buyerNation, { effects: partialEffects, tier: tech.tier });
  
  // GDP boost for seller (revenue)
  const revenue = price * 0.02;
  sellerNation.gdp = clamp(sellerNation.gdp + revenue * 0.01, 0.03, 140);
  sellerNation.stockMarket = clamp(sellerNation.stockMarket + tech.tier * 0.1, 15, 240);
  
  // Buyer gets a smaller boost
  buyerNation.techLevel = clamp(buyerNation.techLevel + 0.02 * tech.tier, 1, 10);
  
  addNews(`💼 ${sellerNation.name} sells ${tech.name} technology to ${buyerNation.name}`, 'minor');
  return true;
}

function findTechById(techId) {
  for (const branch of TECH_BRANCH_KEYS) {
    if (TECH_TREE[branch][techId]) return TECH_TREE[branch][techId];
  }
  return null;
}

// Get tech tier name
function getTechTierName(tier) {
  if (tier <= 3) return '🗿 Primitive';
  if (tier <= 6) return '🔧 Basic';
  if (tier <= 9) return '⚙️ Developing';
  if (tier <= 12) return '🏭 Advanced';
  if (tier <= 15) return '💡 Cutting-Edge';
  if (tier <= 18) return '🔬 Revolutionary';
  if (tier <= 21) return '🧬 Transcendent';
  return '🌟 God-Tier';
}

// Count total discovered techs for a nation
function countNationTechs(nation) {
  if (!nation.research) return 0;
  return (nation.research.discoveredTechs?.length || 0) + (nation.research.purchasedTechs?.length || 0);
}

// Get nation's highest discovered tier
function getNationHighestTechTier(nation) {
  if (!nation.research) return 0;
  let highest = 0;
  const all = [...(nation.research.discoveredTechs || []), ...(nation.research.purchasedTechs || [])];
  all.forEach(id => {
    const tech = findTechById(id);
    if (tech && tech.tier > highest) highest = tech.tier;
  });
  return highest;
}

// ============================================================
// UPDATE HUD
// ============================================================
function updateHUD() {
  if (dom.treasuryVal) dom.treasuryVal.textContent = GAME.treasury;
  if (dom.approvalVal) dom.approvalVal.textContent = GAME.approval;
  if (dom.threatVal) dom.threatVal.textContent = GAME.threatLevel;
  if (dom.dateDisplay) dom.dateDisplay.textContent = formatDate(GAME.date);
  if (dom.turnVal) dom.turnVal.textContent = GAME.turn;
}

function refreshSimulationUi() {
  const now = nowMs();
  const canRender = now - GAME.perf.lastUiRenderAt >= GAME.perf.renderIntervalMs;
  if (!GAME.uiDirty || !canRender) return;

  GAME.perf.lastUiRenderAt = now;
  const shouldRenderCard = (GAME.turn % GAME.perf.nationCardRenderEveryTurns === 0) || GAME.uiDirtyReason !== 'turn';

  safeRun('syncPlayerNationFromRecord', () => syncPlayerNationFromRecord());
  safeRun('updateHUD', () => updateHUD());
  if (shouldRenderCard) safeRun('renderNationCard', () => renderNationCard());
  safeRun('renderMap', () => renderMap());

  if (now - GAME.perf.lastTabRenderAt >= GAME.perf.tabRenderIntervalMs) {
    GAME.perf.lastTabRenderAt = now;
    safeRun('refreshRealtimeTabs', () => refreshRealtimeTabs());
  }

  if (typeof flushNewsUiIfPending === 'function') {
    safeRun('flushNewsUiIfPending', () => flushNewsUiIfPending());
  }

  GAME.uiDirty = false;
  GAME.uiDirtyReason = 'idle';
}

// ── AI TECH TRADING ────────────────────────────────────
function processTechTrading() {
  // Gather nations with techs to sell (must have at least 5 discovered and willing)
  const potentialSellers = Object.values(NATIONS).filter(n =>
    !n.failedState && n.research && n.research.discoveredTechs &&
    n.research.discoveredTechs.length >= 5 &&
    !n.inCrisis &&
    computeNationCreditScore(n) > 40
  );

  const potentialBuyers = Object.values(NATIONS).filter(n =>
    !n.failedState && n.research &&
    (n.research.discoveredTechs?.length || 0) + (n.research.purchasedTechs?.length || 0) < 20 &&
    n.techLevel < 6
  );

  // Each seller tries to sell some techs
  let tradesMade = 0;
  for (const seller of potentialSellers) {
    if (tradesMade >= 6) break;
    if (Math.random() > 0.12) continue;

    // Pick a tech to sell (prefer lower tier ones they have extras of)
    const sellableTechs = seller.research.discoveredTechs.filter(id => {
      const t = findTechById(id);
      return t && t.tier <= 15; // Don't sell the most advanced stuff
    });
    if (sellableTechs.length < 3) continue;

    const techId = sellableTechs[Math.floor(Math.random() * sellableTechs.length)];
    const tech = findTechById(techId);
    if (!tech) continue;

    // Find a suitable buyer (not allied, not at war, with need)
    const suitableBuyers = potentialBuyers.filter(b =>
      b.id !== seller.id &&
      !b.research.discoveredTechs.includes(techId) &&
      !(b.research.purchasedTechs || []).includes(techId) &&
      !hasConflict(seller.id, b.id) &&
      b.techLevel < tech.tier + 2
    );

    if (suitableBuyers.length === 0) continue;
    const buyer = suitableBuyers[Math.floor(Math.random() * Math.min(3, suitableBuyers.length))];
    if (!buyer) continue;

    sellTechToNation(seller, buyer, techId);
    tradesMade++;
  }
}

// ============================================================
// TURN SIMULATION
// ============================================================
function simulateTurn() {
  const tick = GAME.turn + 1;
  GAME.turn++;
  GAME.date.setMonth(GAME.date.getMonth() + 1);
  rebuildTurnCache();

  profileStage('globalMarket', () => processGlobalMarketCycle());

  // Random event
  if (Math.random() < 0.35) {
    const event = EVENTS_POOL[Math.floor(Math.random() * EVENTS_POOL.length)];
    addNews(`📌 ${event.title}`, event.type);
    if (event.effect.treasury) GAME.treasury += event.effect.treasury;
    if (event.effect.approval) {
      GAME.approval = Math.max(0, Math.min(100, GAME.approval + event.effect.approval));
    }
    if (event.effect.threatLevel) GAME.threatLevel = event.effect.threatLevel;
    if (event.effect.militaryPower) {
      const player = getPlayerRecord();
      if (player) player.militaryPower = clamp(player.militaryPower + event.effect.militaryPower, 0, 100);
    }
  }

  // Approval drift
  GAME.approval += Math.round((Math.random() - 0.45) * 4);
  GAME.approval = Math.max(5, Math.min(100, GAME.approval));

  // Treasury floor
  GAME.treasury = Math.max(100, GAME.treasury);

  // Update all countries every turn (core simulation).
  profileStage('countryModel', () => {
    for (const id in NATIONS) {
      const n = NATIONS[id];
      runCountrySystemModel(n, id === GAME.playerNation.id, id);

      n.relation.base += n.relation.trend + Math.round((Math.random() - 0.5) * 4);
      n.relation.base = Math.max(-100, Math.min(100, n.relation.base));
    }
  });

  profileStage('nationGovernance', () => {
    if (typeof processNationGovernanceTick === 'function') processNationGovernanceTick();
  });

  profileStage('alliancesConflictLegacy', () => processAlliancesAndConflicts());

  // Every turn: active war resolution and military readiness baseline.
  profileStage('warResolution', () => {
    if (typeof processAllWars === 'function') processAllWars();
    if (typeof processAIWarDecisions === 'function' && tick % 2 === 0) processAIWarDecisions();
  });

  profileStage('militaryForces', () => {
    processAllNationMilitaryForces();
    processTechUpgradeSalesWithPayment(GAME.playerNation);
  });

  // Every 2 turns: diplomacy pass and full economic systems.
  if (tick % SIM_TICK.diplomacy === 0) {
    profileStage('diplomacy', () => {
      if (typeof processDiplomacyAll === 'function') processDiplomacyAll();
    });
    profileStage('economy', () => processAllEconomicSystems());
  }

  // Every 3 turns: defense procurement + arms market + tech trading.
  if (tick % SIM_TICK.defenseAndArms === 0) {
    profileStage('defenseIndustry', () => {
      processAllDefenseCompanies();
      if (typeof processDefenseCompanyFoundings === 'function') processDefenseCompanyFoundings();
    });
    profileStage('armsMarket', () => processArmsMarketAll());
    profileStage('techTrading', () => processTechTrading());
  }

  // Every 4 turns: debt-market and world bank heavy processes.
  if (tick % SIM_TICK.worldBankAndDebt === 0) {
    profileStage('govDebtMarkets', () => {
      if (typeof processGovernmentDebtMarkets === 'function') processGovernmentDebtMarkets();
      else processAllianceLending();
    });
    profileStage('worldBank', () => {
      if (typeof processWorldBankAll === 'function') processWorldBankAll();
    });
    profileStage('governanceEmergencySupport', () => {
      if (typeof processNationGovernanceEmergencySupport === 'function') processNationGovernanceEmergencySupport();
    });
  }

  // Every 5 turns: alliance-seeking diplomacy sweeps.
  if (tick % SIM_TICK.allianceSeeking === 0) {
    profileStage('allianceSeeking', () => {
      if (typeof processAllianceSeeking === 'function') processAllianceSeeking();
    });
  }

  // Additional player-level impacts on state resources and sentiment.
  const player = getPlayerRecord();
  if (player) {
    GAME.approval = clamp(
      GAME.approval +
      Math.round(
        (player.happiness - 50) * 0.05 +
        (player.stability - 50) * 0.04 -
        (player.inflation - 4) * 0.8 -
        (player.debtRatio - 70) * 0.03 +
        (Math.random() - 0.5) * 2
      ),
      5,
      100
    );
  }

  safeRun('syncPlayerNationFromRecord', () => syncPlayerNationFromRecord());
  if (GAME.turn % 2 === 0) {
    safeRun('recordHistorySnapshot', () => recordHistorySnapshot());
  }

  // Threat level adjustment
  if (GAME.threatLevel === 'High' && Math.random() < 0.2) GAME.threatLevel = 'Medium';
  else if (GAME.threatLevel === 'Medium' && Math.random() < 0.15) GAME.threatLevel = 'Low';

  if (player) {
    if (player.failedState || player.inCrisis || player.stability < 35 || player.migrationPressure > 75 || GAME.conflicts.some(c => c.a === player.id || c.b === player.id)) GAME.threatLevel = 'High';
    else if (player.stability < 48 || player.inflation > 9 || player.debtRatio > 110 || GAME.marketCrashTurns > 0) GAME.threatLevel = 'Medium';
  }

  markUiDirty('turn');
  refreshSimulationUi();
  maybeLogPerfProfile();
}

// ============================================================
// SPEED CONTROLS
// ============================================================
function stopSimulationTimer() {
  GAME.timerGeneration += 1;
  if (GAME.timer) {
    clearTimeout(GAME.timer);
    GAME.timer = null;
  }
}

function applyCadenceForSpeed(speed) {
  const isMobile = isMobileDevice();
  const baseRender = isMobile
    ? (speed >= 10 ? 320 : speed >= 5 ? 250 : 190)
    : (speed >= 10 ? 180 : speed >= 5 ? 130 : 95);
  const baseTab = Math.max(isMobile ? 380 : 220, baseRender + (isMobile ? 100 : 50));

  GAME.perf.baseRenderIntervalMs = baseRender;
  GAME.perf.baseTabRenderIntervalMs = baseTab;
  if (!GAME.perf.lowFpsMode) {
    GAME.perf.renderIntervalMs = baseRender;
    GAME.perf.tabRenderIntervalMs = baseTab;
    GAME.perf.nationCardRenderEveryTurns = 1;
  }
}

function tuneAdaptivePerf(turnElapsedMs) {
  if (!GAME.perf.adaptiveEnabled || !Number.isFinite(turnElapsedMs)) return;

  const perf = GAME.perf;
  perf.simTurnAvgMs = perf.simTurnAvgMs > 0
    ? perf.simTurnAvgMs * 0.82 + turnElapsedMs * 0.18
    : turnElapsedMs;

  const isMobile = isMobileDevice();
  const heavyTurn = turnElapsedMs > (isMobile ? 70 : 55) || perf.simTurnAvgMs > (isMobile ? 48 : 38);
  const recovered = turnElapsedMs < (isMobile ? 42 : 32) && perf.simTurnAvgMs < (isMobile ? 35 : 28);

  if (heavyTurn && !perf.lowFpsMode) {
    perf.lowFpsMode = true;
    perf.renderIntervalMs = Math.max(perf.baseRenderIntervalMs || perf.renderIntervalMs, isMobile ? 360 : 210);
    perf.tabRenderIntervalMs = Math.max(perf.baseTabRenderIntervalMs || perf.tabRenderIntervalMs, isMobile ? 500 : 280);
    perf.nationCardRenderEveryTurns = isMobile ? 2 : 1;
    return;
  }

  if (recovered && perf.lowFpsMode) {
    perf.lowFpsMode = false;
    perf.renderIntervalMs = perf.baseRenderIntervalMs || perf.renderIntervalMs;
    perf.tabRenderIntervalMs = perf.baseTabRenderIntervalMs || perf.tabRenderIntervalMs;
    perf.nationCardRenderEveryTurns = 1;
  }
}

function getSimulationInterval(speed) {
  const mobileFloor = 125;
  const desktopFloor = 75;
  const isMobile = isMobileDevice();
  const floor = isMobile ? mobileFloor : desktopFloor;
  return Math.max(floor, 1000 / Math.max(1, speed));
}

function scheduleNextTurn() {
  stopSimulationTimer();
  if (!GAME.running || GAME.speed <= 0) return;

  const interval = getSimulationInterval(GAME.speed);
  const generation = GAME.timerGeneration;
  GAME.timer = setTimeout(() => runScheduledTurn(generation), interval);
}

function safelySimulateTurn() {
  const started = nowMs();
  try {
    simulateTurn();
    return true;
  } catch (error) {
    console.error('Simulation turn failed:', error);
    refreshSimulationUi();
    return false;
  } finally {
    tuneAdaptivePerf(nowMs() - started);
  }
}

function runScheduledTurn(generation) {
  if (generation !== GAME.timerGeneration) return;

  if (!GAME.running || GAME.speed <= 0 || GAME.turnInProgress) {
    refreshSimulationUi();
    scheduleNextTurn();
    return;
  }

  GAME.turnInProgress = true;
  try {
    safelySimulateTurn();
  } finally {
    GAME.turnInProgress = false;
    scheduleNextTurn();
  }
}

function setSimulationSpeed(speed) {
  GAME.speed = speed;
  GAME.running = speed > 0;
  stopSimulationTimer();

  if (!GAME.running) return;

  if (!GAME.turnInProgress) {
    GAME.turnInProgress = true;
    try {
      safelySimulateTurn();
    } finally {
      GAME.turnInProgress = false;
    }
  }

  GAME.perf.lowFpsMode = false;
  applyCadenceForSpeed(speed);
  markUiDirty('speed-change');
  refreshSimulationUi();

  scheduleNextTurn();
}

function setupSpeedControls() {
  $$('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const speed = parseInt(btn.dataset.speed);
      $$('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      setSimulationSpeed(speed);
    });
  });
}

// ============================================================
// CANVAS MAP
// ============================================================
let mapCtx = null;
let currentLayer = 'political';
let mapScale = 1;
let mapOffsetX = 0;
let mapOffsetY = 0;
const MAP_WORLD_WIDTH = 2200;
const MAP_WORLD_HEIGHT = 1100;
let isDragging = false;
let didPan = false;
let dragStartX, dragStartY;
let geoBoundaryFeatures = [];
let geoCountries = [];
let geoBoundariesLoading = false;
let mapStaticCanvas = null;
let mapStaticCtx = null;
let mapStaticDirty = true;

function invalidateMapStaticLayer() {
  mapStaticDirty = true;
  markUiDirty('map-static');
}

function ensureMapStaticLayer() {
  const canvas = dom.worldMap;
  if (!canvas) return;
  if (!mapStaticCanvas) {
    mapStaticCanvas = document.createElement('canvas');
    mapStaticCtx = mapStaticCanvas.getContext('2d');
    mapStaticDirty = true;
  }
  if (mapStaticCanvas.width !== canvas.width || mapStaticCanvas.height !== canvas.height) {
    mapStaticCanvas.width = canvas.width;
    mapStaticCanvas.height = canvas.height;
    mapStaticDirty = true;
  }
}

function drawStaticMapLayer(ctx, mapW, mapH) {
  ensureMapStaticLayer();
  if (!mapStaticCanvas || !mapStaticCtx) return;
  if (mapStaticDirty) {
    mapStaticCtx.clearRect(0, 0, mapStaticCanvas.width, mapStaticCanvas.height);

    // Keep overlays readable while letting the backdrop map remain visible.
    mapStaticCtx.fillStyle = 'rgba(10, 14, 20, 0.22)';
    mapStaticCtx.fillRect(0, 0, mapStaticCanvas.width, mapStaticCanvas.height);

    mapStaticCtx.save();
    mapStaticCtx.translate(mapOffsetX, mapOffsetY);
    mapStaticCtx.scale(mapScale, mapScale);

    drawGeoBoundaries(mapStaticCtx, mapW, mapH);

    // Grid lines
    mapStaticCtx.strokeStyle = 'rgba(42, 51, 70, 0.4)';
    mapStaticCtx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * mapW;
      const y = (i / 10) * mapH;
      mapStaticCtx.beginPath();
      mapStaticCtx.moveTo(x, 0);
      mapStaticCtx.lineTo(x, mapH);
      mapStaticCtx.stroke();
      mapStaticCtx.beginPath();
      mapStaticCtx.moveTo(0, y);
      mapStaticCtx.lineTo(mapW, y);
      mapStaticCtx.stroke();
    }

    mapStaticCtx.restore();
    mapStaticDirty = false;
  }
  ctx.drawImage(mapStaticCanvas, 0, 0);
}

function setMapScaleAroundPoint(newScale, screenX, screenY) {
  const oldScale = mapScale;
  if (Math.abs(newScale - oldScale) < 1e-9) return;

  const worldX = (screenX - mapOffsetX) / oldScale;
  const worldY = (screenY - mapOffsetY) / oldScale;
  mapScale = newScale;
  mapOffsetX = screenX - worldX * newScale;
  mapOffsetY = screenY - worldY * newScale;
}

function resetMapView() {
  const canvas = dom.worldMap;
  if (!canvas) return;

  mapScale = 1;
  mapOffsetX = (canvas.width - MAP_WORLD_WIDTH) * 0.5;
  mapOffsetY = (canvas.height - MAP_WORLD_HEIGHT) * 0.5;
  invalidateMapStaticLayer();
}

function normalizeCountryToken(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/gi, ' ')
    .toLowerCase()
    .replace(/\b(the|of|and)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCountryKeyFromPath(path) {
  const file = path.split('/').pop() || '';
  return file.replace(/\.json$/i, '').replace(/_/g, ' ');
}

function buildNationLookupByName() {
  const lookup = new Map();
  Object.values(NATIONS).forEach(n => {
    lookup.set(normalizeCountryToken(n.name), n.id);
  });

  const aliases = {
    'usa': 'united states',
    'united states usa': 'united states',
    'united states america': 'united states',
    'czech': 'czechia',
    'democratic congo': 'congo kinshasa',
    'congo democratic republic': 'congo kinshasa',
    'east timor': 'timor leste',
    'eswatini': 'swaziland',
    'cape verde': 'cabo verde',
    'ivory coast': 'cote divoire',
    'laos': 'lao peoples democratic republic',
    'russia': 'russian federation',
    'south korea': 'korea republic',
    'north korea': 'korea democratic peoples republic',
    'syria': 'syrian arab republic',
    'moldova': 'moldova republic',
    'bolivia': 'bolivia plurinational state',
    'venezuela': 'venezuela bolivarian republic',
    'palestine': 'palestine state',
  };

  Object.keys(aliases).forEach(alias => {
    const canonical = aliases[alias];
    const target = NATIONS[canonical]
      ? canonical
      : lookup.get(normalizeCountryToken(canonical));
    if (target) lookup.set(normalizeCountryToken(alias), target);
  });

  return lookup;
}

function projectLonLatToCanvas(lon, lat, w, h) {
  const x = ((lon + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return { x, y };
}

function drawBoundaryPolygon(ctx, rings, w, h) {
  if (!Array.isArray(rings)) return;

  rings.forEach(ring => {
    if (!Array.isArray(ring) || ring.length === 0) return;

    ring.forEach((coord, idx) => {
      if (!Array.isArray(coord) || coord.length < 2) return;
      const p = projectLonLatToCanvas(coord[0], coord[1], w, h);
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
  });
}

function drawGeoBoundaries(ctx, w, h) {
  if (!geoBoundaryFeatures.length) return;

  ctx.save();
  ctx.strokeStyle = 'rgba(190, 204, 220, 0.45)';
  ctx.lineWidth = 0.5;
  ctx.fillStyle = 'rgba(28, 38, 50, 0.09)';

  for (const feature of geoBoundaryFeatures) {
    const geom = feature && feature.geometry;
    if (!geom || !geom.type || !geom.coordinates) continue;

    ctx.beginPath();
    if (geom.type === 'Polygon') {
      drawBoundaryPolygon(ctx, geom.coordinates, w, h);
    } else if (geom.type === 'MultiPolygon') {
      geom.coordinates.forEach(poly => drawBoundaryPolygon(ctx, poly, w, h));
    } else {
      continue;
    }

    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function geometryBounds(geometry) {
  if (!geometry || !geometry.coordinates) return null;

  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  const scanRing = (ring) => {
    if (!Array.isArray(ring)) return;
    ring.forEach(coord => {
      if (!Array.isArray(coord) || coord.length < 2) return;
      const lon = coord[0];
      const lat = coord[1];
      minLon = Math.min(minLon, lon);
      maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });
  };

  if (geometry.type === 'Polygon') {
    geometry.coordinates.forEach(scanRing);
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach(poly => poly.forEach(scanRing));
  } else {
    return null;
  }

  if (!Number.isFinite(minLon)) return null;
  return { minLon, maxLon, minLat, maxLat };
}

function polygonSignedArea(ring) {
  if (!Array.isArray(ring) || ring.length < 3) return 0;
  let area2 = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    area2 += (xj * yi) - (xi * yj);
  }
  return area2 * 0.5;
}

function polygonCentroid(ring) {
  const area = polygonSignedArea(ring);
  if (Math.abs(area) < 1e-12) return null;

  let cx = 0;
  let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const cross = (xj * yi) - (xi * yj);
    cx += (xj + xi) * cross;
    cy += (yj + yi) * cross;
  }

  const factor = 1 / (6 * area);
  return { lon: cx * factor, lat: cy * factor, area: Math.abs(area) };
}

function largestPolygonCentroidForGeometry(geometry) {
  if (!geometry || !geometry.coordinates) return null;

  let best = null;
  const updateBestFromRing = (ring) => {
    const centroid = polygonCentroid(ring);
    if (!centroid) return;
    if (!best || centroid.area > best.area) best = centroid;
  };

  if (geometry.type === 'Polygon') {
    const outer = geometry.coordinates[0];
    updateBestFromRing(outer);
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach(poly => {
      const outer = poly && poly[0];
      updateBestFromRing(outer);
    });
  }

  return best;
}

function countryCentroidFromFeatures(features) {
  let best = null;
  for (const feature of features) {
    const centroid = largestPolygonCentroidForGeometry(feature.geometry);
    if (!centroid) continue;
    if (!best || centroid.area > best.area) best = centroid;
  }
  return best;
}

function ringContainsLonLat(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersects = ((yi > lat) !== (yj > lat)) && (lon < ((xj - xi) * (lat - yi)) / ((yj - yi) || 1e-12) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function geometryContainsLonLat(geometry, lon, lat) {
  if (!geometry || !geometry.coordinates) return false;

  if (geometry.type === 'Polygon') {
    return geometry.coordinates.some(ring => Array.isArray(ring) && ring.length > 2 && ringContainsLonLat(lon, lat, ring));
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some(poly => Array.isArray(poly) && poly.some(ring => Array.isArray(ring) && ring.length > 2 && ringContainsLonLat(lon, lat, ring)));
  }

  return false;
}

async function loadGeoBoundariesMap() {
  if (geoBoundariesLoading || geoBoundaryFeatures.length) return;
  geoBoundariesLoading = true;

  try {
    const treeRes = await fetch(GEO_REPO_TREE_URL);
    if (!treeRes.ok) throw new Error('Failed to fetch repo tree');

    const tree = await treeRes.json();
    const countryPaths = (tree.tree || [])
      .map(item => item.path)
      .filter(path => /^countries\/.*\.json$/i.test(path));

    const nationNameLookup = buildNationLookupByName();

    const allFeatures = [];
    const loadedCountries = [];
    const batchSize = 12;
    for (let i = 0; i < countryPaths.length; i += batchSize) {
      const batch = countryPaths.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async path => {
          try {
            const res = await fetch(GEO_REPO_RAW_BASE + path);
            if (!res.ok) return null;
            const data = await res.json();
            const features = Array.isArray(data.features) ? data.features : null;
            if (!features || !features.length) return null;

            const countryKey = extractCountryKeyFromPath(path);
            const nationId = nationNameLookup.get(normalizeCountryToken(countryKey)) || null;

            return {
              path,
              nationId,
              features,
            };
          } catch {
            return null;
          }
        })
      );

      batchResults.forEach(country => {
        if (!country) return;

        country.features.forEach(feature => {
          feature.__nationId = country.nationId;
          allFeatures.push(feature);
        });

        if (country.nationId) {
          const centroid = countryCentroidFromFeatures(country.features);
          if (!centroid) {
            loadedCountries.push(country);
            return;
          }

          const nation = NATIONS[country.nationId];
          if (nation) {
            nation.x = clamp((centroid.lon + 180) / 360, 0.01, 0.99);
            nation.y = clamp((90 - centroid.lat) / 180, 0.01, 0.99);
          }
        }

        loadedCountries.push(country);
      });
    }

    geoBoundaryFeatures = allFeatures;
    geoCountries = loadedCountries;
    if (dom.mapBackdrop) dom.mapBackdrop.style.display = 'none';
    invalidateMapStaticLayer();
    renderMap();
    addNews('🗺 Loaded GeoBoundaries world country map', 'minor');
  } catch (err) {
    console.warn('GeoBoundaries load failed, keeping fallback map image.', err);
  } finally {
    geoBoundariesLoading = false;
  }
}

function getNationRadius(nation, denseMapMode) {
  if (denseMapMode) return 3.5;
  return 25 + (nation.militaryPower / 100) * 15 + (nation.gdp / 30) * 10;
}

function getNationAtCanvasPoint(canvasX, canvasY) {
  const canvas = dom.worldMap;
  const w = MAP_WORLD_WIDTH;
  const h = MAP_WORLD_HEIGHT;
  const nationEntries = Object.values(NATIONS);
  const denseMapMode = nationEntries.length > 80;

  const worldX = (canvasX - mapOffsetX) / mapScale;
  const worldY = (canvasY - mapOffsetY) / mapScale;

  if (geoBoundaryFeatures.length) {
    const lon = (worldX / w) * 360 - 180;
    const lat = 90 - (worldY / h) * 180;
    for (const feature of geoBoundaryFeatures) {
      if (!feature.__nationId) continue;
      if (geometryContainsLonLat(feature.geometry, lon, lat)) {
        return feature.__nationId;
      }
    }
  }

  let selectedId = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const id in NATIONS) {
    const n = NATIONS[id];
    const cx = n.x * w;
    const cy = n.y * h;
    const r = getNationRadius(n, denseMapMode);
    const hitRadius = denseMapMode ? 8 : Math.max(10, r);
    const dx = worldX - cx;
    const dy = worldY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= hitRadius && dist < bestDistance) {
      bestDistance = dist;
      selectedId = id;
    }
  }

  return selectedId;
}

function selectNationByClientPoint(clientX, clientY) {
  const rect = dom.worldMap.getBoundingClientRect();
  const canvasX = clientX - rect.left;
  const canvasY = clientY - rect.top;
  const selectedId = getNationAtCanvasPoint(canvasX, canvasY);
  if (!selectedId) return;

  GAME.selectedNation = selectedId;
  renderNationCard();
  renderMap();
}

function initMap() {
  const canvas = dom.worldMap;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  mapCtx = canvas.getContext('2d');
  ensureMapStaticLayer();
  invalidateMapStaticLayer();
  resetMapView();
  renderMap();
}

function renderMap() {
  const ctx = mapCtx;
  if (!ctx) return;

  const canvas = dom.worldMap;
  const w = canvas.width;
  const h = canvas.height;
  const mapW = MAP_WORLD_WIDTH;
  const mapH = MAP_WORLD_HEIGHT;

  ctx.clearRect(0, 0, w, h);
  drawStaticMapLayer(ctx, mapW, mapH);

  ctx.save();
  ctx.translate(mapOffsetX, mapOffsetY);
  ctx.scale(mapScale, mapScale);

  const nationEntries = Object.values(NATIONS);
  const denseMapMode = nationEntries.length > 80;
  const hasGeoMap = geoBoundaryFeatures.length > 0;

  // Draw nations (compact markers when country count is large).
  for (const id in NATIONS) {
    if (hasGeoMap && denseMapMode && id !== GAME.playerNation.id && id !== GAME.selectedNation) {
      continue;
    }

    const n = NATIONS[id];
    const cx = n.x * mapW;
    const cy = n.y * mapH;

    // Glow effect for player nation
    if (id === GAME.playerNation.id) {
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 20;
    }

    // Draw marker shape
    const r = getNationRadius(n, denseMapMode);
    ctx.beginPath();
    if (denseMapMode) {
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else {
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
    }
    ctx.closePath();

    // Fill based on layer
    let fillColor = n.color;
    if (currentLayer === 'military') {
      const hue = 0; // red
      const sat = Math.round(n.militaryPower * 1.2);
      const lit = 30 + n.militaryPower * 0.4;
      fillColor = `hsl(${hue}, ${sat}%, ${lit}%)`;
    } else if (currentLayer === 'economic') {
      const hue = 120; // green
      const sat = 60;
      const lit = 20 + (n.gdp / 30) * 40;
      fillColor = `hsl(${hue}, ${sat}%, ${lit}%)`;
    } else if (currentLayer === 'resources') {
      const hue = 40; // yellow
      const sat = 70;
      const lit = 20 + (n.gdp / 30) * 30;
      fillColor = `hsl(${hue}, ${sat}%, ${lit}%)`;
    } else if (currentLayer === 'stability') {
      const hue = 190;
      const sat = 48;
      const lit = 18 + (n.stability / 100) * 44;
      fillColor = `hsl(${hue}, ${sat}%, ${lit}%)`;
    } else if (currentLayer === 'climate') {
      const hue = 140;
      const sat = 42;
      const lit = 20 + (n.environment / 100) * 45;
      fillColor = `hsl(${hue}, ${sat}%, ${lit}%)`;
    }

    ctx.fillStyle = fillColor;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Border
    const isSelected = id === GAME.selectedNation;
    ctx.strokeStyle = isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)';
    ctx.lineWidth = isSelected ? 2.2 : (denseMapMode ? 0.5 : 1.5);
    ctx.stroke();

    if (!denseMapMode || id === GAME.playerNation.id || isSelected) {
      // Nation label
      ctx.fillStyle = '#e8edf5';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(n.flag, cx, cy - 8);
      ctx.font = '10px sans-serif';
      ctx.fillText(n.name.substring(0, 12), cx, cy + 14);
    }
  }

  ctx.restore();
}

// ============================================================
// MAP CONTROLS
// ============================================================
function setupMapControls() {
  const zoomIn = $('#zoomIn');
  const zoomOut = $('#zoomOut');
  const resetView = $('#resetView');

  zoomIn.addEventListener('click', () => {
    const canvas = dom.worldMap;
    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.5;
    setMapScaleAroundPoint(Math.min(3, mapScale * 1.25), cx, cy);
    invalidateMapStaticLayer();
    renderMap();
  });

  zoomOut.addEventListener('click', () => {
    const canvas = dom.worldMap;
    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.5;
    setMapScaleAroundPoint(Math.max(0.5, mapScale * 0.8), cx, cy);
    invalidateMapStaticLayer();
    renderMap();
  });

  resetView.addEventListener('click', () => {
    resetMapView();
    renderMap();
  });

  // Layer toggles
  $$('.layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.layer-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLayer = btn.dataset.layer;
      invalidateMapStaticLayer();
      renderMap();
    });
  });

  // Drag to pan
  const canvas = dom.worldMap;
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    didPan = false;
    dragStartX = e.clientX - mapOffsetX;
    dragStartY = e.clientY - mapOffsetY;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    didPan = true;
    mapOffsetX = e.clientX - dragStartX;
    mapOffsetY = e.clientY - dragStartY;
    invalidateMapStaticLayer();
    renderMap();
  });

  canvas.addEventListener('mouseup', (e) => {
    isDragging = false;
    if (!didPan) selectNationByClientPoint(e.clientX, e.clientY);
  });
  canvas.addEventListener('mouseleave', () => { isDragging = false; });

  // Touch drag
  canvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    isDragging = true;
    didPan = false;
    dragStartX = t.clientX - mapOffsetX;
    dragStartY = t.clientY - mapOffsetY;
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches[0]) return;
    didPan = true;
    const t = e.touches[0];
    mapOffsetX = t.clientX - dragStartX;
    mapOffsetY = t.clientY - dragStartY;
    invalidateMapStaticLayer();
    renderMap();
  }, { passive: true });

  canvas.addEventListener('touchend', (e) => {
    isDragging = false;
    const t = e.changedTouches && e.changedTouches[0];
    if (!didPan && t) selectNationByClientPoint(t.clientX, t.clientY);
  });

  // Scroll to pan map viewport without changing world size.
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    mapOffsetX -= e.deltaX;
    mapOffsetY -= e.deltaY;
    invalidateMapStaticLayer();
    renderMap();
  }, { passive: false });
}

// ─── FORMAT MONEY HELPER ──────────────────────────────
function formatMoney(val) {
  return formatHumanMoneyMillions(val);
}

// ============================================================
// NATION CARD (Left Sidebar)
// ============================================================
function renderNationCard() {
  if (!GAME.selectedNation) syncPlayerNationFromRecord();
  const selected = GAME.selectedNation ? NATIONS[GAME.selectedNation] : null;
  const p = selected || GAME.playerNation;
  const sourceNation = (!selected && typeof getPlayerRecord === 'function') ? (getPlayerRecord() || p) : p;
  initNationDemographics(sourceNation);
  const num = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const isPlayer = p.id === GAME.playerNation.id;
  const budget = isPlayer ? GAME.budget : (p.aiBudget || doctrineBaseBudget('balanced'));
  const relation = isPlayer ? null : getRelation(p.id);
  const badge = typeof relation === 'number' ? getRelationBadge(relation) : null;
  const taxSnapshot = typeof computeNationTaxRevenue === 'function' ? computeNationTaxRevenue(sourceNation) : null;
  const companyRevenueSnapshot = Array.isArray(sourceNation.companies)
    ? sourceNation.companies.reduce((sum, company) => sum + (Number(company?.revenue) || 0), 0)
    : 0;
  const warCount = GAME.conflicts.filter(c => c.a === p.id || c.b === p.id).length;
  const allianceCount = GAME.alliances.filter(a => a.a === p.id || a.b === p.id).length;
  const statusTag = p.failedState ? '💥 Failed State' : (p.inCrisis ? '🚨 In Crisis' : '✅ Stable');
  if (typeof initNationResources === 'function') initNationResources(sourceNation);
  const resourceData = sourceNation.resourceData || {};
  const oilLevel = resourceData.oil?.level;
  const mineralsLevel = resourceData.minerals?.level;
  const rareEarthLevel = resourceData.rareEarth?.level;
  const totals = Object.values(resourceData).reduce((acc, r) => {
    acc.produced += Number(r?.produced || 0);
    acc.consumed += Number(r?.consumed || 0);
    return acc;
  }, { produced: 0, consumed: 0 });
  const supplyBalance = totals.produced - totals.consumed;
  const supplyState = supplyBalance >= 0 ? 'Surplus' : 'Deficit';
  const activeConflict = GAME.conflicts.find(c => c.a === p.id || c.b === p.id);
  const conflictPhase = activeConflict ? (activeConflict.phase || 'active') : 'peace';
  const conflictSeverity = activeConflict ? (activeConflict.severity || Math.round((activeConflict.intensity || 40) / 10)) : 0;
  const conflictExhaustion = activeConflict
    ? (activeConflict.a === p.id ? activeConflict.aExhaustion : activeConflict.bExhaustion)
    : null;
  const generalCount = Array.isArray(p.generals) ? p.generals.filter(g => g?.isAlive !== false).length : 0;
  const forces = sourceNation.militaryForces || {};
  const demographics = sourceNation.demographics || {};
  const budgetMilitary = Math.round(num(budget.military));
  const budgetEconomy = Math.round(num(budget.economy));
  const budgetDiplomacy = Math.round(num(budget.diplomacy));
  const budgetIntel = Math.round(num(budget.intelligence));
  const budgetEducation = Math.round(num(budget.education ?? budget.space));
  const budgetSocial = Math.round(num(budget.social));
  const financeSnapshot = typeof getNationFinanceSnapshot === 'function'
    ? getNationFinanceSnapshot(sourceNation)
    : null;
  const gdpVal = num(sourceNation.gdp, num(p.gdp));
  const storedTreasuryVal = num(sourceNation.treasury);
  const snapshotCashVal = num(financeSnapshot?.cashM);
  const treasuryVal = isPlayer
    ? Math.max(0, num(GAME.treasury, storedTreasuryVal), storedTreasuryVal, snapshotCashVal)
    : Math.max(0, storedTreasuryVal, snapshotCashVal);

  const storedTaxRevenueVal = num(sourceNation.taxRevenue);
  const computedTaxRevenueVal = num(taxSnapshot?.total);
  const taxRevenueVal = storedTaxRevenueVal > 0 ? storedTaxRevenueVal : computedTaxRevenueVal;

  const companyProfitSnapshot = Array.isArray(sourceNation.companies)
    ? sourceNation.companies.reduce((sum, company) => {
        const revenue = Number(company?.revenue) || 0;
        const margin = Number(company?.profitMargin) || 0;
        return sum + (revenue * Math.max(0, margin));
      }, 0)
    : 0;
  const storedCorporateEarningsVal = num(sourceNation.corporateEarnings);
  const corporateEarningsVal = storedCorporateEarningsVal > 0
    ? storedCorporateEarningsVal
    : Math.max(companyProfitSnapshot, companyRevenueSnapshot * 0.1);
  const informalEconomyVal = num(
    sourceNation.informalEconomy,
    clamp(40 - num(sourceNation.governance) * 0.35 + num(sourceNation.corruption) * 0.25, 5, 70)
  );
  const populationVal = num(sourceNation.population, num(p.population));
  const recruitablePoolVal = num(demographics.recruitablePoolM);
  const activePersonnelVal = num(forces.activePersonnel);
  const reservePersonnelVal = num(forces.reservePersonnel);
  const militaryPowerVal = clamp(num(p.militaryPower), 0, 100);
  const techLevelVal = num(p.techLevel);
  const healthVal = num(p.health);
  const stabilityVal = num(p.stability);
  const environmentVal = num(p.environment);
  const resourcesVal = num(sourceNation.resources);
  const energySecurityVal = num(sourceNation.energySecurity);
  const inflationVal = num(p.inflation);
  const debtRatioVal = num(p.debtRatio);
  const factoriesVal = num(p.factories);
  const jobsVal = num(p.jobs);
  const religionInfluenceVal = num(p.religionInfluence);
  const stockMarketVal = num(p.stockMarket);
  const corruptionVal = num(p.corruption);
  const deficitVal = num(p.deficit);
  const innovationRiskVal = num(p.innovationRisk);
  const atrocityRiskVal = num(p.atrocityRisk);
  const recessionMonthsVal = num(p.recessionMonths);
  const crisisRiskVal = num(p.crisisRisk);
  const decisionQualityVal = num(p.decisionQuality);
  const happinessVal = num(p.happiness);
  const resilienceVal = num(p.resilience);
  const conflictExhaustionVal = conflictExhaustion == null ? null : num(conflictExhaustion);
  const localStockSnapshot = typeof getNationStockMarketSnapshot === 'function'
    ? getNationStockMarketSnapshot(sourceNation)
    : { listed: 0, marketCap: 0, topGainer: null, topLoser: null };
  const governmentSummary = typeof getNationGovernmentSummary === 'function'
    ? getNationGovernmentSummary(sourceNation, p.id)
    : null;
  const formatMarketMoneyCard = (amountM) => {
    return formatHumanMoneyMillions(amountM, 2);
  };
  const formatFinanceCard = (amountM) => {
    if (typeof formatHumanMoneyMillions === 'function') return formatHumanMoneyMillions(amountM, 2);
    return formatMoney(Math.round(amountM));
  };
  const financeLabelMap = {
    taxes: 'Taxes',
    company_taxes: 'Company Taxes',
    dividends: 'Dividends',
    loan_proceeds: 'Loan Proceeds',
    investment_returns: 'Investment Returns',
    aid_received: 'Aid Received',
    military: 'Military',
    economy: 'Economy / Edu',
    diplomacy: 'Diplomacy',
    intelligence: 'Intel',
    space: 'Education',
    social: 'Social',
    debt_service: 'Debt Service',
    arms_purchases: 'Arms Purchases',
    sovereign_investment: 'Sovereign Investment',
    aid_given: 'Aid Given',
    foreign_investment: 'Foreign Investment',
    loan_repayment: 'Loan Repayment',
    loan_disbursement: 'Loan Disbursement',
  };
  const renderFinanceBreakdown = (entries, emptyLabel) => {
    const rows = Object.entries(entries || {})
      .filter(([, value]) => Number(value || 0) > 0)
      .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
      .slice(0, 5);
    if (rows.length === 0) {
      return `<div class="finance-line finance-empty">${emptyLabel}</div>`;
    }
    return rows.map(([key, value]) => {
      const label = financeLabelMap[key] || key.replace(/_/g, ' ');
      return `<button class="finance-line finance-line-btn" onclick="openNationFinanceDrilldown('${p.id}','${key}','${Object.is(entries, financeSnapshot?.outflows) ? 'outflows' : 'inflows'}')"><span>${label}</span><strong>${formatFinanceCard(value)}</strong></button>`;
    }).join('');
  };
  const card = $('#nationCard');
  card.innerHTML = `
    <div class="nation-flag">${p.flag}</div>
    <h2 class="nation-name">${p.name}</h2>
    <p class="nation-leader">${p.leaderType || (isPlayer ? 'President' : 'Head of State')}: ${p.leader}</p>
    <div class="nation-stats">
      <div class="stat-row"><span class="stat-label">Government</span><span class="stat-val">${getGovernmentLabel(p.governmentStyle)}</span></div>
      <div class="stat-row"><span class="stat-label">Doctrine</span><span class="stat-val">${getDoctrineLabel(p.policyDoctrine)}</span></div>
      <div class="stat-row"><span class="stat-label">Budget: Military</span><span class="stat-val">${budgetMilitary}%</span></div>
      <div class="stat-row"><span class="stat-label">Budget: Economy</span><span class="stat-val">${budgetEconomy}%</span></div>
      <div class="stat-row"><span class="stat-label">Budget: Diplomacy</span><span class="stat-val">${budgetDiplomacy}%</span></div>
      <div class="stat-row"><span class="stat-label">Budget: Intel</span><span class="stat-val">${budgetIntel}%</span></div>
      <div class="stat-row"><span class="stat-label">Budget: Education</span><span class="stat-val">${budgetEducation}%</span></div>
      <div class="stat-row"><span class="stat-label">Budget: Social</span><span class="stat-val">${budgetSocial}%</span></div>
      <div class="stat-row"><span class="stat-label">GDP</span><span class="stat-val">${formatHumanTrillions(gdpVal, 2)}</span></div>
      <div class="stat-row"><span class="stat-label">Treasury</span><span class="stat-val" style="color:var(--accent-yellow)">${formatMoney(treasuryVal)}</span></div>
      <div class="stat-row"><span class="stat-label">Tax Revenue</span><span class="stat-val" style="color:var(--accent-green)">${formatMoney(Math.round(taxRevenueVal))}/month</span></div>
      <div class="stat-row"><span class="stat-label">Corporate Earnings</span><span class="stat-val" style="color:var(--accent-blue)">${formatMoney(corporateEarningsVal)}</span></div>
      <div class="stat-row"><span class="stat-label">Informal Economy</span><span class="stat-val ${informalEconomyVal > 30 ? 'negative' : 'positive'}">${informalEconomyVal.toFixed(1)}%</span></div>
      <div class="stat-row"><span class="stat-label">Companies</span><span class="stat-val">${(sourceNation.companies || []).length}</span></div>
      <div class="stat-row"><span class="stat-label">Population</span><span class="stat-val">${formatHumanNumber(populationVal * 1_000_000, 1)}</span></div>
      <div class="stat-row"><span class="stat-label">Recruitable Pool</span><span class="stat-val">${recruitablePoolVal.toFixed(2)}M</span></div>
      <div class="stat-row"><span class="stat-label">Military</span><span class="stat-val"><span class="bar-fill" style="width:${Math.round(militaryPowerVal)}%">${Math.round(militaryPowerVal)}</span></span></div>
      <div class="stat-row"><span class="stat-label">Active / Reserve</span><span class="stat-val">${activePersonnelVal.toFixed(2)}M / ${reservePersonnelVal.toFixed(2)}M</span></div>
      <div class="stat-row"><span class="stat-label">Tech Avg</span><span class="stat-val">T${techLevelVal.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">Technologies</span><span class="stat-val" style="color:var(--accent-blue)">${countNationTechs(p)}</span></div>
      <div class="stat-row"><span class="stat-label">Health</span><span class="stat-val">${healthVal.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">Stability</span><span class="stat-val">${stabilityVal.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">Environment</span><span class="stat-val">${environmentVal.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">Resources</span><span class="stat-val">${resourcesVal.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">Energy Security</span><span class="stat-val">${energySecurityVal.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">Oil / Minerals / RareEarth</span><span class="stat-val">${Number.isFinite(oilLevel) ? oilLevel.toFixed(1) : '-'} / ${Number.isFinite(mineralsLevel) ? mineralsLevel.toFixed(1) : '-'} / ${Number.isFinite(rareEarthLevel) ? rareEarthLevel.toFixed(1) : '-'}</span></div>
      <div class="stat-row"><span class="stat-label">Supply Chain</span><span class="stat-val ${supplyBalance >= 0 ? 'positive' : 'negative'}">${supplyState} (${formatHumanMoneyMillions(supplyBalance)})</span></div>
      <div class="stat-row"><span class="stat-label">Inflation</span><span class="stat-val">${inflationVal.toFixed(1)}%</span></div>
      <div class="stat-row"><span class="stat-label">Debt/GDP</span><span class="stat-val">${debtRatioVal.toFixed(1)}%</span></div>
      <div class="stat-row"><span class="stat-label">Factories</span><span class="stat-val">${formatHumanNumber(factoriesVal, 1)}</span></div>
      <div class="stat-row"><span class="stat-label">Jobs</span><span class="stat-val ${jobsVal >= 55 ? 'positive' : 'negative'}">${jobsVal.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">Religiosity</span><span class="stat-val ${religionInfluenceVal <= 60 ? 'positive' : 'negative'}">${religionInfluenceVal.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">Stock Index</span><span class="stat-val">${stockMarketVal.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">Local Listed</span><span class="stat-val">${Math.round(num(localStockSnapshot.listed))}</span></div>
      <div class="stat-row"><span class="stat-label">Local Market Cap</span><span class="stat-val" style="color:var(--accent-blue)">${formatMarketMoneyCard(localStockSnapshot.marketCap)}</span></div>
      <div class="stat-row"><span class="stat-label">Corruption</span><span class="stat-val ${corruptionVal <= 38 ? 'positive' : 'negative'}">${corruptionVal.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">Deficit</span><span class="stat-val ${deficitVal <= 4 ? 'positive' : 'negative'}">${deficitVal.toFixed(1)}%</span></div>
      <div class="stat-row"><span class="stat-label">Innovation Risk</span><span class="stat-val ${innovationRiskVal <= 45 ? 'positive' : 'negative'}">${innovationRiskVal.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">Atrocity Risk</span><span class="stat-val ${atrocityRiskVal <= 20 ? 'positive' : 'negative'}">${atrocityRiskVal.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">Recession</span><span class="stat-val">${Math.round(recessionMonthsVal)}m</span></div>
      <div class="stat-row"><span class="stat-label">Crisis Risk</span><span class="stat-val ${crisisRiskVal <= 45 ? 'positive' : 'negative'}">${crisisRiskVal.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">State AI</span><span class="stat-val">${decisionQualityVal.toFixed(1)}</span></div>
      ${governmentSummary?.finance ? `<div class="stat-row"><span class="stat-label">Credit Score</span><span class="stat-val ${governmentSummary.finance.creditScore >= 65 ? 'positive' : 'negative'}">${governmentSummary.finance.creditScore.toFixed(0)}</span></div>` : ''}
      ${governmentSummary?.finance ? `<div class="stat-row"><span class="stat-label">Buying / Borrowing</span><span class="stat-val">${(typeof formatHumanTrillions === 'function' ? formatHumanTrillions(governmentSummary.finance.buyingPowerT, 2) : governmentSummary.finance.buyingPowerT.toFixed(2) + 'T')} / ${(typeof formatHumanTrillions === 'function' ? formatHumanTrillions(governmentSummary.finance.borrowingPowerT, 2) : governmentSummary.finance.borrowingPowerT.toFixed(2) + 'T')}</span></div>` : ''}
      ${governmentSummary?.loanView ? `<div class="stat-row"><span class="stat-label">Loans In / Out</span><span class="stat-val">${governmentSummary.loanView.incoming.length} / ${governmentSummary.loanView.outgoing.length}</span></div>` : ''}
      ${governmentSummary?.topGoal ? `<div class="stat-row"><span class="stat-label">Top Priority</span><span class="stat-val">${governmentSummary.topGoal.title}</span></div>` : ''}
      ${governmentSummary?.rival ? `<div class="stat-row"><span class="stat-label">Primary Rival</span><span class="stat-val ${governmentSummary.rival.threatScore >= 70 ? 'negative' : 'positive'}">${governmentSummary.rival.flag || ''} ${governmentSummary.rival.name}</span></div>` : ''}
      <div class="stat-row"><span class="stat-label">Generals</span><span class="stat-val">${generalCount}</span></div>
      <div class="stat-row"><span class="stat-label">Happiness</span><span class="stat-val">${happinessVal.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">Resilience</span><span class="stat-val">${resilienceVal.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">War Phase</span><span class="stat-val ${conflictPhase === 'peace' ? 'positive' : 'negative'}">${conflictPhase}</span></div>
      <div class="stat-row"><span class="stat-label">War Severity</span><span class="stat-val">${conflictSeverity}</span></div>
      <div class="stat-row"><span class="stat-label">War Exhaustion</span><span class="stat-val ${(conflictExhaustionVal || 0) > 55 ? 'negative' : 'positive'}">${conflictExhaustionVal == null ? '-' : conflictExhaustionVal.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">Status</span><span class="stat-val">${statusTag}</span></div>
      <div class="stat-row"><span class="stat-label">Wars / Alliances</span><span class="stat-val">${warCount} / ${allianceCount}</span></div>
      ${isPlayer
        ? `<div class="stat-row"><span class="stat-label">Approval</span><span class="stat-val">${GAME.approval}%</span></div>`
        : `<div class="stat-row"><span class="stat-label">Relation</span><span class="stat-val ${relation >= 0 ? 'positive' : 'negative'}">${relation >= 0 ? '+' : ''}${relation}</span></div>`}
    </div>
    ${financeSnapshot ? `
      <div class="finance-panel">
        <div class="finance-panel-header">
          <span>National Finance</span>
          <strong>${formatFinanceCard(financeSnapshot.netWorthM)}</strong>
        </div>
        <div class="finance-grid">
          <div class="finance-card finance-card-inflow">
            <div class="finance-card-title">Treasury In</div>
            <div class="finance-card-total">${formatFinanceCard(financeSnapshot.treasuryInM)}</div>
            <div class="finance-breakdown">${renderFinanceBreakdown(financeSnapshot.inflows, 'No inflows recorded this turn.')}</div>
          </div>
          <div class="finance-card finance-card-outflow">
            <div class="finance-card-title">Treasury Out</div>
            <div class="finance-card-total">${formatFinanceCard(financeSnapshot.treasuryOutM)}</div>
            <div class="finance-breakdown">${renderFinanceBreakdown(financeSnapshot.outflows, 'No outflows recorded this turn.')}</div>
          </div>
          <div class="finance-card finance-card-balance">
            <div class="finance-card-title">Balance Sheet</div>
            <div class="finance-metrics">
              <div class="finance-line"><span>Cash</span><strong>${formatFinanceCard(financeSnapshot.cashM)}</strong></div>
              <div class="finance-line"><span>GDP</span><strong>${formatHumanTrillions(financeSnapshot.gdpT, 2)}</strong></div>
              <div class="finance-line"><span>Assets</span><strong>${formatFinanceCard(financeSnapshot.assetsM)}</strong></div>
              <div class="finance-line"><span>Liabilities</span><strong>${formatFinanceCard(financeSnapshot.liabilitiesM)}</strong></div>
              <div class="finance-line finance-net"><span>Net Worth</span><strong>${formatFinanceCard(financeSnapshot.netWorthM)}</strong></div>
            </div>
          </div>
        </div>
      </div>
    ` : ''}
    ${badge ? `<div class="nation-relations"><span class="relation-badge ${badge.cls}">${badge.text}</span></div>` : ''}
    ${!isPlayer ? renderNationDiplomacySummary(p.id) : ''}
    <div class="nation-actions">
      ${isPlayer ? '' : `<button class="btn-sm" onclick="GAME.selectedNation = '${GAME.playerNation.id}'; renderNationCard(); renderMap();">🏠 Back To Player</button>`}
      <button class="btn-sm" onclick="showPopulationDetail('${p.id}')">👥 Population</button>
      <button class="btn-sm" onclick="openTab('econ')">📊 View Economy</button>
      ${isPlayer ? `<button class="btn-sm" onclick="openTab('diplo')">🤝 Diplomacy</button>` : `<button class="btn-sm" onclick="playerDeclareWar('${p.id}')">⚔️ Declare War</button>`}
      ${isPlayer ? `<button class="btn-sm" onclick="openTab('research')">🔬 R&D Lab</button>` : `<button class="btn-sm" onclick="playerFormAlliance('${p.id}')">🤝 Alliance</button>`}
      ${isPlayer ? `<button class="btn-sm" onclick="openTab('education')">Education</button>` : `<button class="btn-sm" onclick="openForeignNationIntel('${p.id}')">🔍 Investigate</button>`}
      ${isPlayer ? `<button class="btn-sm" onclick="openTab('mil')">⚔️ Military</button>` : `<button class="btn-sm" onclick="openForeignNationIntel('${p.id}')">🏭 Defense Industry</button>`}
      <button class="btn-sm" onclick="showInternalAffairs('${p.id}')">🏛 Internal Affairs</button>
      ${isPlayer ? `<button class="btn-sm" onclick="openTab('history')">📈 Intel</button>` : `<button class="btn-sm" onclick="playerRaidResources('${p.id}')">🛢️ Raid</button>`}
    </div>
  `;
}

function renderNationDiplomacySummary(nationId) {
  initDiplomacyState();
  const ds = GAME.diplomacyState;
  const playerId = GAME.playerNation.id;
  
  // Get diplomacy info for this nation
  const sanctions = Object.entries(ds.sanctions || {}).filter(([key]) => key.includes(nationId));
  const tradeAgreements = Object.entries(ds.tradeAgreements || {}).filter(([key]) => key.includes(nationId));
  const investments = Object.entries(ds.investments || {}).filter(([key]) => key.includes(nationId));
  const aid = Object.entries(ds.foreignAid || {}).filter(([key]) => key.includes(nationId));
  
  if (sanctions.length === 0 && tradeAgreements.length === 0 && investments.length === 0 && aid.length === 0) {
    return '';
  }
  
  let html = '<div class="nation-diplomacy-summary">';
  html += '<div class="diplomacy-summary-header">🕊️ Diplomacy Overview</div>';
  
  if (sanctions.length > 0) {
    html += '<div class="diplomacy-summary-item negative">🚫 Sanctions: ' + sanctions.length + '</div>';
  }
  if (tradeAgreements.length > 0) {
    html += '<div class="diplomacy-summary-item positive">📜 Trade Agreements: ' + tradeAgreements.length + '</div>';
  }
  if (investments.length > 0) {
    const totalInvested = investments.reduce((sum, [, inv]) => sum + inv.amount, 0);
    html += '<div class="diplomacy-summary-item">💰 Investments: $' + (totalInvested * 1000).toFixed(0) + 'M</div>';
  }
  if (aid.length > 0) {
    const totalAid = aid.reduce((sum, [, a]) => sum + a.amount, 0);
    html += '<div class="diplomacy-summary-item">🤝 Aid: $' + (totalAid * 1000).toFixed(0) + 'M</div>';
  }
  
  html += '</div>';
  return html;
}

window.showPopulationDetail = showPopulationDetail;
window.openNationFinanceDrilldown = openNationFinanceDrilldown;

function openNationFinanceDrilldown(nationId, flowKey, bucket) {
  const nation = NATIONS?.[nationId];
  if (!nation || !dom?.tabOverlay || !dom?.tabTitle || !dom?.tabContent) return;
  const flowLabels = {
    taxes: 'Taxes',
    company_taxes: 'Company Taxes',
    dividends: 'Dividends',
    loan_proceeds: 'Loan Proceeds',
    investment_returns: 'Investment Returns',
    aid_received: 'Aid Received',
    arms_sales: 'Arms Sales',
    foreign_investment: 'Foreign Investment',
    military: 'Military',
    economy: 'Economy / Edu',
    diplomacy: 'Diplomacy',
    intelligence: 'Intel',
    space: 'Space',
    social: 'Social',
    debt_service: 'Debt Service',
    arms_purchases: 'Arms Purchases',
    sovereign_investment: 'Sovereign Investment',
    aid_given: 'Aid Given',
    loan_repayment: 'Loan Repayment',
    loan_disbursement: 'Loan Disbursement',
  };
  const snapshot = typeof getNationFinanceSnapshot === 'function' ? getNationFinanceSnapshot(nation) : null;
  const total = Number(snapshot?.[bucket === 'outflows' ? 'outflows' : 'inflows']?.[flowKey] || 0);
  const entries = typeof getNationFinanceEntries === 'function'
    ? getNationFinanceEntries(nation, bucket, flowKey, 80)
    : [];

  const rowsHtml = entries.length
    ? entries.map((entry, index) => {
        const note = entry.note || 'Recorded transaction';
        const cp = entry.counterparty ? `<span class="finance-drilldown-meta">Counterparty: ${entry.counterparty}</span>` : '';
        const ctx = entry.context ? `<span class="finance-drilldown-meta">Context: ${entry.context}</span>` : '';
        return `<div class="finance-drilldown-row">
          <div class="finance-drilldown-row-head">
            <strong>#${entries.length - index}</strong>
            <span>Turn ${Number(entry.turn || 0)}</span>
            <span>${formatHumanMoneyMillions(Number(entry.amount || 0), 2)}</span>
          </div>
          <div class="finance-drilldown-note">${note}</div>
          <div class="finance-drilldown-meta-wrap">${cp}${ctx}</div>
        </div>`;
      }).join('')
    : '<div class="finance-drilldown-empty">No transactions found for this category yet.</div>';

  GAME.activeTab = 'financeDrilldown';
  dom.tabTitle.textContent = `🏦 ${nation.name} • ${flowLabels[flowKey] || flowKey}`;
  dom.tabOverlay.classList.remove('hidden');
  dom.tabContent.innerHTML = `
    <div class="finance-drilldown-panel">
      <div class="finance-drilldown-summary">
        <div><span class="muted">Bucket</span><strong>${bucket === 'outflows' ? 'Treasury Out' : 'Treasury In'}</strong></div>
        <div><span class="muted">Category</span><strong>${flowLabels[flowKey] || flowKey}</strong></div>
        <div><span class="muted">Current Turn Total</span><strong>${formatHumanMoneyMillions(total, 2)}</strong></div>
      </div>
      <div class="finance-drilldown-list">${rowsHtml}</div>
    </div>
  `;
}

// ============================================================
// TAB SYSTEM
// ============================================================
function setupTabs() {
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      openTab(tab);
    });
  });

  // Quick action buttons
  $$('.action-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      openTab(tab);
    });
  });

  dom.closeTab.addEventListener('click', closeTab);

  // Close overlay on backdrop click
  dom.tabOverlay.addEventListener('click', (e) => {
    if (e.target === dom.tabOverlay) closeTab();
  });
}

const TAB_NAMES = {
  gov: '🏛️ Government',
  econ: '💰 Economy',
  news: '📰 World News',
  society: '👥 Society',
  environment: '🌍 Environment',
  finance: '🏦 Finance',
  mil: '⚔️ Military',
  conflict: '⚔️ Conflicts',
  diplo: '🤝 Diplomacy',
  globaldiplo: '🌐 Global Diplomacy',
  worldbank: '🏦 World Bank',
  intel: '🕵️ Intelligence',
  education: 'Education',
  research: '🔬 Research & Tech',
  history: '📈 Historical Data',
  leaderboard: '🏆 Rankings',
  defensecos: '🏭 Defense Companies',
};

function openTab(tabName) {
  GAME.activeTab = tabName;
  dom.tabTitle.textContent = TAB_NAMES[tabName] || tabName;
  dom.tabOverlay.classList.remove('hidden');

  $$('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });

  renderTabContent(tabName);
}

function closeTab() {
  GAME.activeTab = null;
  dom.tabOverlay.classList.add('hidden');
}

function refreshRealtimeTabs() {
  if (!GAME.activeTab) return;
  if (dom.tabOverlay.classList.contains('hidden')) return;

  // Keep high-churn analytics tabs live while simulation runs.
  if (GAME.activeTab === 'history' || GAME.activeTab === 'leaderboard' || GAME.activeTab === 'econ' || GAME.activeTab === 'finance' || GAME.activeTab === 'intel' || GAME.activeTab === 'news' || GAME.activeTab === 'defensecos' || GAME.activeTab === 'worldbank' || GAME.activeTab === 'diplo' || GAME.activeTab === 'globaldiplo') {
    renderTabContent(GAME.activeTab);
  }
}

function renderTabContent(tab) {
  const content = dom.tabContent;

  switch (tab) {
    case 'gov':
      content.innerHTML = renderGovernmentTab();
      break;
    case 'econ':
      content.innerHTML = renderEconomyTab();
      attachBudgetListeners();
      if (typeof attachEconomyTabInteractions === 'function') attachEconomyTabInteractions();
      break;
    case 'news':
      content.innerHTML = renderWorldNewsTab();
      if (typeof attachNewsBrowserListeners === 'function') {
        attachNewsBrowserListeners(content);
      } else if (typeof attachNewsCenterListeners === 'function') {
        attachNewsCenterListeners(content);
      }
      break;
    case 'society':
      content.innerHTML = renderSocietyTab();
      break;
    case 'environment':
      content.innerHTML = renderEnvironmentTab();
      break;
    case 'finance':
      content.innerHTML = renderFinanceTab();
      break;
    case 'mil':
      content.innerHTML = renderMilitaryIndustrialTab();
      break;
    case 'conflict':
      content.innerHTML = renderConflictsTab();
      break;
    case 'diplo':
      content.innerHTML = renderDiplomacyTab();
      attachDiplomacyListeners();
      break;
    case 'globaldiplo':
      window._diploView = 'top_powers';
      content.innerHTML = renderDiplomacyTab();
      attachDiplomacyListeners();
      break;
    case 'worldbank':
      content.innerHTML = typeof renderWorldBankTab === 'function' ? renderWorldBankTab() : '<div class="tab-error">World Bank module unavailable.</div>';
      break;
    case 'intel':
      content.innerHTML = renderIntelTab();
      if (typeof attachNewsCenterListeners === 'function') {
        attachNewsCenterListeners(content);
      }
      break;
    case 'education':
      content.innerHTML = typeof renderEducationTab === 'function' ? renderEducationTab() : (typeof renderEducationPanel === 'function' ? renderEducationPanel(GAME.playerNation, GAME.playerNation.id) : '<div class="tab-error">Education module unavailable.</div>');
      break;
    case 'research':
      content.innerHTML = renderResearchTab();
      attachResearchListeners();
      break;
    case 'history':
      content.innerHTML = renderHistoryTab();
      attachHistoryListeners();
      break;
    case 'leaderboard':
      content.innerHTML = renderLeaderboardTab();
      attachLeaderboardListeners();
      break;
    case 'defensecos':
      content.innerHTML = renderDefenseCompaniesTab();
      if (typeof attachDefenseCompaniesTabInteractions === 'function') attachDefenseCompaniesTabInteractions();
      break;
    default:
      content.innerHTML = `<p class="text-muted">Tab content not available.</p>`;
  }
}

// ============================================================
// TAB: GOVERNMENT
// ============================================================
function renderGovernmentTab() {
  const p = GAME.playerNation;
  if (!p.research) initNationResearch(p);
  const totalTechs = countNationTechs(p);
  const highestTier = getNationHighestTechTier(p);
  const resPts = p.research.points || 0;
  return `
    <div class="tab-section">
      <h3>Administration</h3>
      <div class="leader-portrait" style="font-size:60px">👤</div>
      <p style="text-align:center;font-size:18px;font-weight:700">${p.leader}</p>
      <p style="text-align:center;color:var(--text-secondary)">President of the ${p.name}</p>
      <div class="leader-traits" style="justify-content:center;margin:8px 0">
        ${p.leaderTraits.map(t => `<span class="trait">${t}</span>`).join('')}
      </div>
      <p style="text-align:center;font-size:12px;color:var(--text-muted)">Term: ${p.leaderTerm}</p>
    </div>
    <div class="tab-section">
      <h3>Cabinet Overview</h3>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">System</span><span class="r-val">${getGovernmentLabel(p.governmentStyle)}</span></div>
        <div class="resource-item"><span class="r-name">Doctrine</span><span class="r-val">${getDoctrineLabel(p.policyDoctrine)}</span></div>
        <div class="resource-item"><span class="r-name">Leader Type</span><span class="r-val">${p.leaderType}</span></div>
        <div class="resource-item"><span class="r-name">State AI</span><span class="r-val">${p.decisionQuality.toFixed(1)}</span></div>
        <div class="resource-item"><span class="r-name">Treasury</span><span class="r-val">$${GAME.treasury}M</span></div>
        <div class="resource-item"><span class="r-name">Approval</span><span class="r-val ${GAME.approval >= 50 ? 'positive' : 'negative'}">${GAME.approval}%</span></div>
        <div class="resource-item"><span class="r-name">Turn</span><span class="r-val">${GAME.turn}</span></div>
        <div class="resource-item"><span class="r-name">Conflicts</span><span class="r-val ${GAME.conflicts.length ? 'negative' : 'positive'}">${GAME.conflicts.length}</span></div>
      </div>
    </div>
    <div class="tab-section">
      <h3>Technology & Research</h3>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Tech Level</span><span class="r-val">T${p.techLevel.toFixed(1)}</span></div>
        <div class="resource-item"><span class="r-name">Technologies</span><span class="r-val">${totalTechs}</span></div>
        <div class="resource-item"><span class="r-name">Highest Tier</span><span class="r-val">${getTechTierName(highestTier)} (${highestTier})</span></div>
        <div class="resource-item"><span class="r-name">Research Points</span><span class="r-val" style="color:var(--accent-blue)">${resPts.toFixed(1)}</span></div>
      </div>
    </div>
    <div class="tab-section">
      <h3>Threat Assessment</h3>
      <p class="text-muted">Current Threat Level: <strong style="color:${GAME.threatLevel === 'High' ? 'var(--accent-red)' : GAME.threatLevel === 'Medium' ? 'var(--accent-yellow)' : 'var(--accent-green)'}">${GAME.threatLevel}</strong></p>
    </div>
  `;
}

function renderWorldNewsTab() {
  if (typeof renderNewsBrowserTab === 'function') {
    return renderNewsBrowserTab();
  }
  if (typeof renderNewsCenter === 'function') {
    return renderNewsCenter(180);
  }
  return `
    <div class="tab-section">
      <h3>World News Command Center</h3>
      <p class="text-muted">News system is unavailable.</p>
    </div>
  `;
}

function renderEconomyTab() {
  if (typeof window.renderEconomyTabExternal === 'function') {
    return window.renderEconomyTabExternal();
  }
  return '<div class="tab-error">Economy module unavailable.</div>';
}

function renderSocietyTab() {
  const p = GAME.playerNation;
  return `
    <div class="tab-section">
      <h3>Social Cohesion</h3>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Health</span><span class="r-val">${p.health.toFixed(1)}</span></div>
        <div class="resource-item"><span class="r-name">Stability</span><span class="r-val">${p.stability.toFixed(1)}</span></div>
        <div class="resource-item"><span class="r-name">Happiness</span><span class="r-val">${p.happiness.toFixed(1)}</span></div>
        <div class="resource-item"><span class="r-name">Inequality</span><span class="r-val ${p.inequality <= 45 ? 'positive' : 'negative'}">${p.inequality.toFixed(1)}</span></div>
        <div class="resource-item"><span class="r-name">Migration Pressure</span><span class="r-val ${p.migrationPressure <= 45 ? 'positive' : 'negative'}">${p.migrationPressure.toFixed(1)}</span></div>
        <div class="resource-item"><span class="r-name">Approval</span><span class="r-val ${GAME.approval >= 50 ? 'positive' : 'negative'}">${GAME.approval}%</span></div>
      </div>
    </div>
    <div class="tab-section">
      <h3>Policy Levers</h3>
      <div class="action-grid" style="grid-template-columns:1fr 1fr">
        <button class="action-btn" onclick="addNews('📌 Welfare package expanded to reduce inequality', 'minor')">🏥 Expand Welfare</button>
        <button class="action-btn" onclick="addNews('📌 Education reform launched nationwide', 'minor')">🎓 Education Reform</button>
        <button class="action-btn" onclick="addNews('📌 Anti-corruption campaign deployed', 'major')">⚖️ Anti-Corruption</button>
        <button class="action-btn" onclick="addNews('📌 National integration program announced', 'minor')">🫱🫲 Integration Program</button>
      </div>
    </div>
  `;
}

function renderEnvironmentTab() {
  const p = GAME.playerNation;
  return `
    <div class="tab-section">
      <h3>Climate & Energy</h3>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Environment</span><span class="r-val">${p.environment.toFixed(1)}</span></div>
        <div class="resource-item"><span class="r-name">Energy Security</span><span class="r-val">${p.energySecurity.toFixed(1)}</span></div>
        <div class="resource-item"><span class="r-name">Renewables</span><span class="r-val">${p.renewableShare.toFixed(1)}%</span></div>
        <div class="resource-item"><span class="r-name">Resources</span><span class="r-val">${p.resources.toFixed(1)}</span></div>
      </div>
    </div>
    <div class="tab-section">
      <h3>Green Actions</h3>
      <div class="action-grid" style="grid-template-columns:1fr 1fr">
        <button class="action-btn" onclick="addNews('📌 Green grid bill passes parliament', 'major')">⚡ Green Grid</button>
        <button class="action-btn" onclick="addNews('📌 Reforestation mega-project begins', 'minor')">🌳 Reforest</button>
        <button class="action-btn" onclick="addNews('📌 Carbon efficiency standards upgraded', 'minor')">🏭 Carbon Rules</button>
        <button class="action-btn" onclick="addNews('📌 National disaster readiness drill completed', 'minor')">🛟 Disaster Prep</button>
      </div>
    </div>
  `;
}

function renderFinanceTab() {
  const p = GAME.playerNation;
  const creditRisk = clamp((p.debtRatio * 0.55 + p.inflation * 4.2 - p.governance * 0.4), 1, 100);
  const globalBoard = typeof window.renderGlobalStockMarketBoard === 'function'
    ? window.renderGlobalStockMarketBoard(10)
    : '<div class="section-card"><h4>🌐 Global Company Market</h4><p class="empty">Global market module unavailable.</p></div>';

  return `
    <div class="tab-section">
      <h3>Macro Finance</h3>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Inflation</span><span class="r-val ${p.inflation <= 5 ? 'positive' : 'negative'}">${p.inflation.toFixed(1)}%</span></div>
        <div class="resource-item"><span class="r-name">Debt/GDP</span><span class="r-val ${p.debtRatio <= 80 ? 'positive' : 'negative'}">${p.debtRatio.toFixed(1)}%</span></div>
        <div class="resource-item"><span class="r-name">Credit Risk</span><span class="r-val ${creditRisk <= 45 ? 'positive' : 'negative'}">${creditRisk.toFixed(1)}</span></div>
        <div class="resource-item"><span class="r-name">Resilience</span><span class="r-val">${p.resilience.toFixed(1)}</span></div>
      </div>
    </div>
    <div class="tab-section">
      <h3>Fiscal Options</h3>
      <div class="action-grid" style="grid-template-columns:1fr 1fr">
        <button class="action-btn" onclick="addNews('📌 Central bank raises rates to tackle inflation', 'major')">📈 Raise Rates</button>
        <button class="action-btn" onclick="addNews('📌 Counter-cyclical stimulus package approved', 'major')">💸 Stimulus</button>
        <button class="action-btn" onclick="addNews('📌 Budget austerity framework enacted', 'major')">📉 Austerity</button>
        <button class="action-btn" onclick="addNews('📌 Sovereign debt refinancing negotiated', 'major')">🔁 Refinance Debt</button>
      </div>
    </div>
    ${globalBoard}
  `;
}

function renderSlider(id, label, value) {
  return `
    <div class="budget-slider-row">
      <label for="budget-${id}">${label}</label>
      <input type="range" id="budget-${id}" min="0" max="100" value="${value}" data-budget="${id}">
      <span class="pct-val" id="pct-${id}">${value}%</span>
    </div>
  `;
}

function attachBudgetListeners() {
  $$('[data-budget]').forEach(input => {
    input.addEventListener('input', () => {
      const id = input.dataset.budget;
      const val = parseInt(input.value);
      GAME.budget[id] = val;
      document.getElementById(`pct-${id}`).textContent = val + '%';

      // Normalize to 100%
      const total = Object.values(GAME.budget).reduce((a, b) => a + b, 0);
      const totalEl = document.getElementById('budgetTotal');
      if (totalEl) totalEl.textContent = Math.round(total) + '%';
    });
  });
}

// ============================================================
// TAB: CONFLICTS
// ============================================================
function renderConflictsTab() {
  if (typeof window.renderWarCommandTab === 'function') {
    return window.renderWarCommandTab();
  }
  return `
    <div class="tab-section">
      <h3>War Theater</h3>
      <div class="section-card"><p class="empty">War UI unavailable.</p></div>
    </div>
  `;
}

// ============================================================
// TAB: EDUCATION (replaces legacy Space tab)
// ============================================================
function renderEducationTab() {
  if (typeof renderEducationPanel === 'function') {
    return renderEducationPanel(GAME.playerNation, GAME.playerNation.id);
  }
  const eduBudget = GAME.budget.education ?? GAME.budget.space;
  const estEnroll = Math.round((eduBudget / 100) * 40);
  return `
    <div class="tab-section">
      <h3>Education</h3>
      <p class="text-muted mb-1">Education budget: ${eduBudget}%</p>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Tertiary Enrollment</span><span class="r-val">${estEnroll}%</span></div>
        <div class="resource-item"><span class="r-name">R&D Focus</span><span class="r-val">${eduBudget > 20 ? 'High' : eduBudget > 10 ? 'Medium' : 'Low'}</span></div>
        <div class="resource-item"><span class="r-name">Graduates / Turn</span><span class="r-val">${Math.round((eduBudget / 100) * 120000)}</span></div>
        <div class="resource-item"><span class="r-name">Universities</span><span class="r-val">${Object.keys(GLOBAL_UNIVERSITIES || {}).length}</span></div>
      </div>
    </div>
  `;
}

function renderDiplomacyTab() {
  if (window._diploView === 'top_powers') return renderTopDiplomaticPowers();
  if (window._diploView === 'nation_profile') return renderNationDiplomaticProfile(window._diploSelectedNation);
  const ds = GAME.diplomacyState || {};
  const playerId = GAME.playerNation.id;
  const playerEvents = (ds.diplomaticEvents || []).filter(e => e.nation === playerId || e.target === playerId).slice(0, 10);
  const playerSanctions = Object.entries(ds.sanctions || {}).filter(([key]) => {
    const [aId, bId] = splitDiplomacyPairKey(key);
    return aId === playerId || bId === playerId;
  });
  const playerTradeAgreements = Object.entries(ds.tradeAgreements || {}).filter(([key]) => {
    const [aId, bId] = splitDiplomacyPairKey(key);
    return aId === playerId || bId === playerId;
  });
  const playerInvestments = Object.entries(ds.investments || {}).filter(([key]) => {
    const [aId, bId] = splitDiplomacyPairKey(key);
    return aId === playerId || bId === playerId;
  });
  
  // Player's foreign aid
  const playerAid = Object.entries(ds.foreignAid || {}).filter(([key]) => {
    const [aId, bId] = splitDiplomacyPairKey(key);
    return aId === playerId || bId === playerId;
  });
  
  // Player's coalitions
  const playerCoalitions = (ds.coalitions || []).filter(c => c.members.includes(playerId));

  const nations = Object.values(NATIONS)
    .filter(n => n.id !== playerId)
    .sort((a, b) => a.name.localeCompare(b.name));

  return `
    <div class="tab-section">
      <h3>🕊️ Diplomatic Overview</h3>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Alliances</span><span class="r-val">${GAME.alliances.length}</span></div>
        <div class="resource-item"><span class="r-name">Friendly States</span><span class="r-val positive">${nations.filter(n => getRelation(n.id) >= 20).length}</span></div>
        <div class="resource-item"><span class="r-name">Hostile States</span><span class="r-val negative">${nations.filter(n => getRelation(n.id) <= -20).length}</span></div>
        <div class="resource-item"><span class="r-name">Active Sanctions</span><span class="r-val negative">${playerSanctions.length}</span></div>
        <div class="resource-item"><span class="r-name">Trade Agreements</span><span class="r-val positive">${playerTradeAgreements.length}</span></div>
        <div class="resource-item"><span class="r-name">Investments</span><span class="r-val">${playerInvestments.length}</span></div>
        <div class="resource-item"><span class="r-name">Coalitions</span><span class="r-val">${playerCoalitions.length}</span></div>
        <div class="resource-item"><span class="r-name">Diplomacy Budget</span><span class="r-val">${GAME.budget.diplomacy}%</span></div>
      </div>
    </div>

    ${playerEvents.length > 0 ? `
    <div class="tab-section">
      <h3>📋 Diplomatic Activities</h3>
      ${playerEvents.map(e => {
        const isOutgoing = e.nation === playerId;
        const otherId = isOutgoing ? e.target : e.nation;
        const other = NATIONS[otherId];
        const flag = other ? other.flag : '🏳️';
        const name = other ? other.name : otherId;
        const icon = e.success ? '✅' : '❌';
        const relChange = e.relationChange > 0 ? `+${e.relationChange}` : e.relationChange;
        const relColor = e.relationChange > 0 ? 'positive' : 'negative';
        return `
          <div class="diplomacy-event-item">
            <span>${icon} ${e.message}</span>
            <span class="${relColor}">Relation: ${relChange}</span>
          </div>
        `;
      }).join('')}
    </div>
    ` : '<div class="tab-section"><h3>📋 Diplomatic Activities</h3><p class="text-muted">No recent diplomatic activities.</p></div>'}

    ${playerTradeAgreements.length > 0 ? `
    <div class="tab-section">
      <h3>📜 Trade Agreements</h3>
      ${playerTradeAgreements.map(([key, agreement]) => {
        const [aId, bId] = splitDiplomacyPairKey(key);
        const partnerId = aId === playerId ? bId : aId;
        const partner = NATIONS[partnerId];
        const turnsLeft = agreement.duration - (GAME.turn - agreement.turn);
        return `
          <div class="diplomacy-detail-item">
            <span>${partner ? partner.flag : '🏳️'} ${partner ? partner.name : partnerId}</span>
            <span>GDP Boost: +${(agreement.gdpBoost * 100).toFixed(1)}% | ${turnsLeft} turns left</span>
          </div>
        `;
      }).join('')}
    </div>
    ` : ''}

    ${playerInvestments.length > 0 ? `
    <div class="tab-section">
      <h3>💰 Investments & Returns</h3>
      ${playerInvestments.map(([key, investment]) => {
        const [aId, bId] = splitDiplomacyPairKey(key);
        const isInvestor = aId === playerId;
        const otherId = isInvestor ? bId : aId;
        const other = NATIONS[otherId];
        const turnsLeft = investment.maturityTurn - GAME.turn;
        const profit = investment.expectedReturn - investment.amount;
        const profitColor = profit > 0 ? 'positive' : 'negative';
        return `
          <div class="diplomacy-detail-item">
            <span>${isInvestor ? '📤 Invested in' : '📥 Received from'} ${other ? other.flag : '🏳️'} ${other ? other.name : otherId}</span>
            <span>$${(investment.amount * 1000).toFixed(0)}M | Expected: <span class="${profitColor}">+${(profit * 1000).toFixed(0)}M</span> | ${turnsLeft > 0 ? turnsLeft + ' turns' : 'Matured'}</span>
          </div>
        `;
      }).join('')}
    </div>
    ` : ''}

    ${playerAid.length > 0 ? `
    <div class="tab-section">
      <h3>🤝 Foreign Aid</h3>
      ${playerAid.map(([key, aid]) => {
        const [aId, bId] = splitDiplomacyPairKey(key);
        const isGiver = aId === playerId;
        const otherId = isGiver ? bId : aId;
        const other = NATIONS[otherId];
        return `
          <div class="diplomacy-detail-item">
            <span>${isGiver ? '📤 Aid given to' : '📥 Aid received from'} ${other ? other.flag : '🏳️'} ${other ? other.name : otherId}</span>
            <span>$${(aid.amount * 1000).toFixed(0)}M | ${aid.purpose}</span>
          </div>
        `;
      }).join('')}
    </div>
    ` : ''}

    ${playerSanctions.length > 0 ? `
    <div class="tab-section">
      <h3>🚫 Sanctions</h3>
      ${playerSanctions.map(([key, sanction]) => {
        const [aId, bId] = splitDiplomacyPairKey(key);
        const isTarget = bId === playerId;
        const otherId = isTarget ? aId : bId;
        const other = NATIONS[otherId];
        return `
          <div class="diplomacy-detail-item">
            <span>${isTarget ? '⚠️ Sanctioned by' : '🚫 Sanctioning'} ${other ? other.flag : '🏳️'} ${other ? other.name : otherId}</span>
            <span>Severity: ${sanction.severity} | ${sanction.reason}</span>
          </div>
        `;
      }).join('')}
    </div>
    ` : ''}

    ${playerCoalitions.length > 0 ? `
    <div class="tab-section">
      <h3>⚔️ Coalitions</h3>
      ${playerCoalitions.map(coalition => {
        const target = NATIONS[coalition.target];
        const memberNames = coalition.members.map(id => {
          const n = NATIONS[id];
          return n ? `${n.flag} ${n.name}` : id;
        }).join(', ');
        return `
          <div class="diplomacy-detail-item">
            <span>Target: ${target ? target.flag : '🏳️'} ${target ? target.name : coalition.target}</span>
            <span>Members: ${memberNames}</span>
          </div>
        `;
      }).join('')}
    </div>
    ` : ''}

    <div class="tab-section">
      <h3>🌍 Foreign Relations</h3>
      <p class="text-muted mb-1">Relations with other nations</p>
      ${nations.map(n => {
        const rel = getRelation(n.id);
        const badge = getRelationBadge(rel);
        return `
          <div class="relation-item" data-country-id="${n.id}">
            <span>
              ${n.flag} <strong>${n.name}</strong><br>
              <small style="color:var(--text-muted)">${getGovernmentLabel(n.governmentStyle)} • ${getDoctrineLabel(n.policyDoctrine)}</small>
            </span>
            <span>
              <span class="relation-badge ${badge.cls}" style="margin:0;font-size:10px;padding:1px 6px">${badge.text}</span>
              <span class="relation-score ${rel >= 0 ? 'positive' : 'negative'}">${rel >= 0 ? '+' : ''}${rel}</span>
            </span>
          </div>
        `;
      }).join('')}
    </div>

    <div class="tab-section">
      <h3>🕊️ Diplomatic Actions</h3>
      <div class="action-grid" style="grid-template-columns:1fr 1fr">
        <button class="action-btn" onclick="playerDiplomaticAction('summit')">🤝 Diplomatic Summit</button>
        <button class="action-btn" onclick="playerDiplomaticAction('aid')">📦 Send Aid</button>
        <button class="action-btn" onclick="playerDiplomaticAction('sanctions')">🚫 Impose Sanctions</button>
        <button class="action-btn" onclick="playerDiplomaticAction('trade')">📜 Trade Agreement</button>
        <button class="action-btn" onclick="playerDiplomaticAction('invest')">💰 Invest Abroad</button>
        <button class="action-btn" onclick="playerDiplomaticAction('alliance')">🤝 Form Alliance</button>
      </div>
    </div>

    <div class="tab-section">
      <h3>🏆 Top Diplomatic Powers</h3>
      <button class="action-btn" onclick="window._diploView='top_powers'; refreshRealtimeTabs();" style="width:100%;margin-bottom:8px">🌐 View Top 10 Diplomatic Powers</button>
    </div>
  `;
}

function renderTopDiplomaticPowers() {
  if (typeof getTopDiplomaticPowers !== 'function') {
    return `<div class="tab-section"><p class="text-muted">Diplomatic power system not available.</p></div>`;
  }
  
  const topPowers = getTopDiplomaticPowers(10);
  const playerId = GAME.playerNation.id;
  const playerPower = typeof computeDiplomaticPower === 'function' ? computeDiplomaticPower(GAME.playerNation) : 0;
  const playerRank = topPowers.findIndex(p => p.nation.id === playerId) + 1;
  
  let html = `
    <div class="tab-section">
      <button class="wb-back-btn" onclick="window._diploView='main'; refreshRealtimeTabs();">← Back to Diplomacy</button>
      <h3>🏆 Top 10 Diplomatic Powers</h3>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Your Rank</span><span class="r-val">${playerRank > 0 ? '#' + playerRank : 'Unranked'}</span></div>
        <div class="resource-item"><span class="r-name">Your Power</span><span class="r-val">${playerPower}</span></div>
      </div>
    </div>
  `;
  
  html += `<div class="tab-section">`;
  
  topPowers.forEach((entry, idx) => {
    const nation = entry.nation;
    const power = entry.power;
    const profile = typeof getNationDiplomaticProfile === 'function' ? getNationDiplomaticProfile(nation.id) : null;
    const isPlayer = nation.id === playerId;
    const rankColor = idx < 3 ? 'var(--accent-green)' : idx < 7 ? 'var(--accent-blue)' : 'var(--text-secondary)';
    
    html += `
      <div class="wb-loan-card" onclick="window._diploView='nation_profile'; window._diploSelectedNation='${nation.id}'; refreshRealtimeTabs();" style="cursor:pointer;border-left:3px solid ${rankColor}">
        <div class="wb-loan-header">
          <span class="wb-loan-borrower">#${idx + 1} ${nation.flag} ${nation.name} ${isPlayer ? '(You)' : ''}</span>
          <span class="wb-loan-status" style="color:${rankColor};font-size:14px;font-weight:700">${power}</span>
        </div>
        <div class="wb-loan-terms">
          GDP: $${(nation.gdp || 0).toFixed(2)}T · Military: ${nation.militaryPower?.toFixed(0) || 0} · Tech: T${nation.techLevel?.toFixed(1) || 1}
        </div>
        ${profile ? `
        <div class="wb-loan-terms">
          Alliances: ${profile.alliances.count} · Aid Sent: $${(profile.aid.given * 1000).toFixed(0)}M · Invested: $${(profile.investments.totalInvested * 1000).toFixed(0)}M
        </div>
        <div class="wb-loan-terms">
          Returns: $${(profile.investments.totalReceived * 1000).toFixed(0)}M · P/L: <span class="${profile.investments.profit >= 0 ? 'positive' : 'negative'}">$${(profile.investments.profit * 1000).toFixed(0)}M</span> · Trade: ${profile.tradeAgreements.count}
        </div>
        ` : ''}
      </div>
    `;
  });
  
  html += `</div>`;
  
  return html;
}

function renderNationDiplomaticProfile(nationId) {
  if (typeof getNationDiplomaticProfile !== 'function') {
    return `<div class="tab-section"><p class="text-muted">Diplomatic profile not available.</p></div>`;
  }
  
  const profile = getNationDiplomaticProfile(nationId);
  if (!profile) return `<div class="tab-section"><p class="text-muted">Nation not found.</p></div>`;
  
  const nation = profile.nation;
  const isPlayer = nation.id === GAME.playerNation.id;
  
  let html = `
    <div class="tab-section">
      <button class="wb-back-btn" onclick="window._diploView='top_powers'; refreshRealtimeTabs();">← Back to Top Powers</button>
      <h3>${nation.flag} ${nation.name} - Diplomatic Profile ${isPlayer ? '(You)' : ''}</h3>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Diplomatic Power</span><span class="r-val" style="font-size:18px;font-weight:700">${profile.diplomaticPower}</span></div>
        <div class="resource-item"><span class="r-name">GDP</span><span class="r-val">$${(nation.gdp || 0).toFixed(2)}T</span></div>
        <div class="resource-item"><span class="r-name">Military</span><span class="r-val">${nation.militaryPower?.toFixed(0) || 0}</span></div>
        <div class="resource-item"><span class="r-name">Tech Level</span><span class="r-val">T${nation.techLevel?.toFixed(1) || 1}</span></div>
        <div class="resource-item"><span class="r-name">Friendly</span><span class="r-val positive">${profile.relations.friendly}</span></div>
        <div class="resource-item"><span class="r-name">Hostile</span><span class="r-val negative">${profile.relations.hostile}</span></div>
      </div>
    </div>
  `;
  
  // Investments
  html += `<div class="tab-section"><h3>💰 Investments</h3>`;
  html += `<div class="resource-grid">`;
  html += `<div class="resource-item"><span class="r-name">Total Invested</span><span class="r-val">$${(profile.investments.totalInvested * 1000).toFixed(0)}M</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Expected Return</span><span class="r-val">$${(profile.investments.totalExpected * 1000).toFixed(0)}M</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Received</span><span class="r-val">$${(profile.investments.totalReceived * 1000).toFixed(0)}M</span></div>`;
  const profitColor = profile.investments.profit >= 0 ? 'positive' : 'negative';
  html += `<div class="resource-item"><span class="r-name">Profit/Loss</span><span class="r-val ${profitColor}">$${(profile.investments.profit * 1000).toFixed(0)}M</span></div>`;
  html += `</div></div>`;
  
  // Aid
  html += `<div class="tab-section"><h3>🤝 Foreign Aid</h3>`;
  html += `<div class="resource-grid">`;
  html += `<div class="resource-item"><span class="r-name">Aid Given</span><span class="r-val positive">$${(profile.aid.given * 1000).toFixed(0)}M (${profile.aid.givenCount})</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Aid Received</span><span class="r-val">$${(profile.aid.received * 1000).toFixed(0)}M (${profile.aid.receivedCount})</span></div>`;
  html += `</div></div>`;
  
  // Alliances
  html += `<div class="tab-section"><h3>🤝 Alliances (${profile.alliances.count})</h3>`;
  if (profile.alliances.list.length > 0) {
    profile.alliances.list.forEach(a => {
      html += `<div class="diplomacy-detail-item">
        <span>${a.nation.flag} ${a.nation.name}</span>
        <span>Strength: ${a.strength?.toFixed(0) || 50}</span>
      </div>`;
    });
  } else {
    html += `<p class="text-muted">No active alliances.</p>`;
  }
  html += `</div>`;
  
  // Trade Agreements
  html += `<div class="tab-section"><h3>📜 Trade Agreements (${profile.tradeAgreements.count})</h3>`;
  if (profile.tradeAgreements.list.length > 0) {
    profile.tradeAgreements.list.forEach(t => {
      const turnsLeft = t.duration - (GAME.turn - t.turn);
      html += `<div class="diplomacy-detail-item">
        <span>${t.nation.flag} ${t.nation.name}</span>
        <span>GDP +${(t.gdpBoost * 100).toFixed(1)}% | ${turnsLeft} turns left</span>
      </div>`;
    });
  } else {
    html += `<p class="text-muted">No active trade agreements.</p>`;
  }
  html += `</div>`;
  
  // Sanctions
  html += `<div class="tab-section"><h3>🚫 Sanctions</h3>`;
  html += `<div class="resource-grid">`;
  html += `<div class="resource-item"><span class="r-name">Imposed</span><span class="r-val negative">${profile.sanctions.imposed}</span></div>`;
  html += `<div class="resource-item"><span class="r-name">Received</span><span class="r-val">${profile.sanctions.received}</span></div>`;
  html += `</div></div>`;
  
  // Diplomatic pressure action (for high-power nations)
  if (!isPlayer && profile.diplomaticPower > 150) {
    html += `<div class="tab-section">
      <h3>⚡ Diplomatic Pressure</h3>
      <p class="text-muted mb-1">Use your diplomatic power (${profile.diplomaticPower}) to influence this nation.</p>
      <div class="action-grid" style="grid-template-columns:1fr 1fr">
        <button class="action-btn" onclick="playerDiplomaticPressure('${nation.id}', 'ceasefire')">🕊️ Demand Ceasefire</button>
        <button class="action-btn" onclick="playerDiplomaticPressure('${nation.id}', 'sanctions')">🚫 Threaten Sanctions</button>
        <button class="action-btn" onclick="playerDiplomaticPressure('${nation.id}', 'military')">⚔️ Military Threat</button>
        <button class="action-btn" onclick="playerDiplomaticPressure('${nation.id}', 'financial')">💰 Financial Pressure</button>
      </div>
    </div>`;
  }
  
  return html;
}

function playerDiplomaticPressure(targetId, type) {
  const target = NATIONS[targetId];
  if (!target) return;
  
  const playerPower = typeof computeDiplomaticPower === 'function' ? computeDiplomaticPower(GAME.playerNation) : 0;
  const targetPower = typeof computeDiplomaticPower === 'function' ? computeDiplomaticPower(target) : 0;
  const powerGap = playerPower - targetPower;
  
  if (powerGap < 50) {
    addNews(`⚠️ Your diplomatic power (${playerPower}) is not significantly higher than ${target.flag} ${target.name} (${targetPower}). Pressure may backfire.`, 'major');
    return;
  }
  
  const successChance = clamp(0.3 + powerGap * 0.002, 0.2, 0.8);
  const success = powerGap >= 300 ? true : Math.random() < successChance;
  
  const key = relationshipKey(GAME.playerNation.id, targetId);
  
  switch (type) {
    case 'ceasefire':
      // Check if target is in conflict
      const conflict = GAME.conflicts.find(c => (c.a === targetId || c.b === targetId) && c.phase !== 'peace');
      if (!conflict) {
        addNews(`🕊️ ${target.flag} ${target.name} is not currently in a conflict.`, 'minor');
        return;
      }
      if (success) {
        conflict.phase = 'ceasefire';
        conflict.ceasefireTurns = 0;
        conflict.ceasefireDuration = 5 + Math.floor(Math.random() * 10);
        conflict.ceasefireBy = GAME.playerNation.id;
        GAME.bilateralRelations[key] = clamp((GAME.bilateralRelations[key] || 0) + 5, -100, 100);
        addNews(`🕊️ ${GAME.playerNation.flag} ${GAME.playerNation.name} demands ceasefire. ${target.flag} ${target.name} accepts for ${conflict.ceasefireDuration} turns.`, 'major');
      } else {
        GAME.bilateralRelations[key] = clamp((GAME.bilateralRelations[key] || 0) - 10, -100, 100);
        addNews(`⚠️ ${target.flag} ${target.name} rejects ${GAME.playerNation.flag} ${GAME.playerNation.name}'s ceasefire demand. Relations worsen.`, 'major');
      }
      break;
      
    case 'sanctions':
      if (success) {
        if (typeof GAME !== 'undefined' && GAME.diplomacyState) {
          GAME.diplomacyState.sanctions[key] = {
            severity: clamp(5 + Math.floor(powerGap / 50), 3, 20),
            turn: GAME.turn,
            reason: 'diplomatic pressure',
            imposedBy: GAME.playerNation.id,
          };
        }
        target.stability = clamp(target.stability - 3, 1, 100);
        addNews(`🚫 ${GAME.playerNation.flag} ${GAME.playerNation.name} threatens sanctions on ${target.flag} ${target.name}. ${target.name} backs down.`, 'major');
      } else {
        GAME.bilateralRelations[key] = clamp((GAME.bilateralRelations[key] || 0) - 8, -100, 100);
        addNews(`⚠️ ${target.flag} ${target.name} defies ${GAME.playerNation.flag} ${GAME.playerNation.name}'s sanction threat.`, 'major');
      }
      break;
      
    case 'military':
      if (success) {
        target.militaryPower = clamp(target.militaryPower - 2, 0, 100);
        target.stability = clamp(target.stability - 5, 1, 100);
        GAME.bilateralRelations[key] = clamp((GAME.bilateralRelations[key] || 0) - 5, -100, 100);
        addNews(`⚔️ ${GAME.playerNation.flag} ${GAME.playerNation.name} threatens military action. ${target.flag} ${target.name} shows restraint.`, 'major');
      } else {
        GAME.bilateralRelations[key] = clamp((GAME.bilateralRelations[key] || 0) - 15, -100, 100);
        addNews(`🔥 ${target.flag} ${target.name} calls ${GAME.playerNation.flag} ${GAME.playerNation.name}'s military bluff. Tensions escalate!`, 'major');
      }
      break;
      
    case 'financial':
      if (success) {
        target.gdp = clamp(target.gdp - 0.05, 0.05, 100);
        target.stability = clamp(target.stability - 3, 1, 100);
        addNews(`💰 ${GAME.playerNation.flag} ${GAME.playerNation.name} applies financial pressure. ${target.flag} ${target.name}'s economy weakens.`, 'major');
      } else {
        GAME.bilateralRelations[key] = clamp((GAME.bilateralRelations[key] || 0) - 10, -100, 100);
        addNews(`⚠️ ${target.flag} ${target.name} resists ${GAME.playerNation.flag} ${GAME.playerNation.name}'s financial pressure.`, 'major');
      }
      break;
  }
  
  renderNationCard();
  refreshRealtimeTabs();
}

function attachDiplomacyListeners() {
  $$('[data-country-id]').forEach(item => {
    item.addEventListener('click', () => {
      GAME.selectedNation = item.dataset.countryId;
      renderNationCard();
      renderMap();
      closeTab();
    });
  });
}

function playerDiplomaticAction(action) {
  initDiplomacyState();
  const playerId = GAME.playerNation.id;
  const player = GAME.playerNation;
  
  // Get selected nation or first available
  const targetId = GAME.selectedNation || Object.keys(NATIONS).find(id => id !== playerId);
  if (!targetId || targetId === playerId) {
    addNews('🕊️ Select a nation first to perform diplomatic actions.', 'minor');
    return;
  }
  
  const target = NATIONS[targetId];
  if (!target) return;
  
  const key = relationshipKey(playerId, targetId);
  const currentRel = getRelationBetween(playerId, targetId);
  
  switch (action) {
    case 'summit':
      const success = Math.random() < clamp(0.5 + GAME.budget.diplomacy * 0.02, 0.3, 0.8);
      const relChange = success ? clamp(3 + Math.floor(Math.random() * 6), 2, 10) : clamp(-1 - Math.floor(Math.random() * 3), -4, -1);
      GAME.bilateralRelations[key] = clamp(currentRel + relChange, -100, 100);
      addNews(success 
        ? `🕊️ President ${player.leader} held diplomatic summit with ${target.flag} ${target.name}, improving relations by +${relChange}.`
        : `🕊️ Diplomatic summit with ${target.flag} ${target.name} ended in disagreement. Relation: ${relChange}.`,
        success ? 'minor' : 'major');
      break;
      
    case 'aid':
      const aidAmount = clamp(player.gdp * 0.02, 0.1, 1.0);
      if (GAME.treasury < aidAmount * 100) {
        addNews(`🕊️ Insufficient treasury to send aid to ${target.name}.`, 'major');
        return;
      }
      GAME.treasury -= aidAmount * 100;
      GAME.diplomacyState.foreignAid[`${playerId}_${targetId}`] = {
        amount: aidAmount,
        turn: GAME.turn,
        purpose: 'humanitarian'
      };
      target.gdp = clamp(target.gdp + aidAmount * 0.02, 0.05, 100);
      target.stability = clamp(target.stability + aidAmount * 2, 1, 100);
      GAME.bilateralRelations[key] = clamp(currentRel + 5, -100, 100);
      addNews(`🤝 ${player.flag} ${player.name} sends $${(aidAmount * 1000).toFixed(0)}M humanitarian aid to ${target.flag} ${target.name}.`, 'minor');
      break;
      
    case 'sanctions':
      if (currentRel > -20) {
        addNews(`🕊️ Relations with ${target.name} are not hostile enough to justify sanctions.`, 'minor');
        return;
      }
      const severity = clamp(5 + Math.floor(Math.random() * 10), 3, 15);
      GAME.diplomacyState.sanctions[key] = {
        severity,
        turn: GAME.turn,
        reason: 'player imposed sanctions',
        imposedBy: playerId
      };
      target.gdp = clamp(target.gdp * (1 - severity * 0.008), 0.05, 100);
      target.stability = clamp(target.stability - severity * 0.3, 1, 100);
      addNews(`⚠️ ${player.flag} ${player.name} imposes sanctions on ${target.flag} ${target.name} (severity: ${severity}).`, 'major');
      break;
      
    case 'trade':
      if (currentRel < 10) {
        addNews(`🕊️ Relations with ${target.name} are not friendly enough for a trade agreement.`, 'minor');
        return;
      }
      if (GAME.diplomacyState.tradeAgreements[key]) {
        addNews(`🕊️ Already have a trade agreement with ${target.name}.`, 'minor');
        return;
      }
      const gdpBoost = clamp(0.01 + Math.random() * 0.03, 0.005, 0.05);
      GAME.diplomacyState.tradeAgreements[key] = {
        turn: GAME.turn,
        gdpBoost,
        duration: 10 + Math.floor(Math.random() * 10)
      };
      GAME.bilateralRelations[key] = clamp(currentRel + 5, -100, 100);
      addNews(`📋 ${player.flag} ${player.name} and ${target.flag} ${target.name} sign trade agreement (GDP boost: +${(gdpBoost * 100).toFixed(1)}%).`, 'minor');
      break;
      
    case 'invest':
      if (currentRel < 15) {
        addNews(`🕊️ Relations with ${target.name} are not strong enough for investment.`, 'minor');
        return;
      }
      if (GAME.diplomacyState.investments[key]) {
        addNews(`🕊️ Already invested in ${target.name}.`, 'minor');
        return;
      }
      const investAmount = clamp(player.gdp * 0.05, 0.1, 2.0);
      if (GAME.treasury < investAmount * 100) {
        addNews(`🕊️ Insufficient treasury to invest in ${target.name}.`, 'major');
        return;
      }
      GAME.treasury -= investAmount * 100;
      const expectedReturn = investAmount * (1.2 + Math.random() * 0.5);
      GAME.diplomacyState.investments[key] = {
        amount: investAmount,
        turn: GAME.turn,
        expectedReturn,
        maturityTurn: GAME.turn + 10,
        companies: target.companies?.slice(0, 3).map(c => c.name) || ['Various']
      };
      target.gdp = clamp(target.gdp + investAmount * 0.015, 0.05, 100);
      GAME.bilateralRelations[key] = clamp(currentRel + 4, -100, 100);
      addNews(`💰 ${player.flag} ${player.name} invests $${(investAmount * 1000).toFixed(0)}M in ${target.flag} ${target.name} companies.`, 'minor');
      break;
      
    case 'alliance':
      playerFormAlliance(targetId);
      break;
  }
  
  renderNationCard();
  refreshRealtimeTabs();
}

// ============================================================
// TAB: INTELLIGENCE
// ============================================================
function renderIntelTab() {
  const center = typeof renderNewsCenter === 'function'
    ? renderNewsCenter(120)
    : '<div class="tab-section"><h3>World News Command Center</h3><p class="text-muted">News system not available.</p></div>';

  return `
    <div class="tab-section">
      <h3>Intelligence Overview</h3>
      <p class="text-muted mb-1">Intelligence budget: ${GAME.budget.intelligence}%</p>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Agents</span><span class="r-val">${5 + Math.floor(GAME.budget.intelligence / 5)}</span></div>
        <div class="resource-item"><span class="r-name">Coverage</span><span class="r-val">${Math.min(100, GAME.budget.intelligence * 3)}%</span></div>
        <div class="resource-item"><span class="r-name">Cyber</span><span class="r-val">${GAME.playerNation.techLevel >= 5 ? 'Advanced' : 'Standard'}</span></div>
        <div class="resource-item"><span class="r-name">Threat Intel</span><span class="r-val">${GAME.threatLevel}</span></div>
      </div>
    </div>
    ${center}
    <div class="tab-section">
      <h3>Covert Actions</h3>
      <div class="action-grid" style="grid-template-columns:1fr 1fr">
        <button class="action-btn">🔍 Gather Intel</button>
        <button class="action-btn">💻 Cyber Op</button>
        <button class="action-btn">🕵️ Infiltrate</button>
        <button class="action-btn">🛡️ Counter-Intel</button>
      </div>
    </div>
  `;
}

// ============================================================
// TAB: SPACE
// ============================================================
function renderSpaceTab() {
  const spaceBudget = GAME.budget.space;
  const progress = Math.min(100, GAME.turn * 2 + spaceBudget * 0.5);

  return `
    <div class="tab-section">
      <h3>Space Program</h3>
      <p class="text-muted mb-1">Space budget: ${spaceBudget}%</p>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Program</span><span class="r-val">${progress < 30 ? 'Early Dev' : progress < 60 ? 'Active' : 'Advanced'}</span></div>
        <div class="resource-item"><span class="r-name">Progress</span><span class="r-val">${Math.round(progress)}%</span></div>
        <div class="resource-item"><span class="r-name">Satellites</span><span class="r-val">${Math.floor(progress / 10)}</span></div>
        <div class="resource-item"><span class="r-name">Missions</span><span class="r-val">${Math.floor(progress / 25)}</span></div>
      </div>
    </div>
    <div class="tab-section">
      <h3>Space Assets</h3>
      ${progress < 10 
        ? '<p class="text-muted">Space program is in early stages. Increase space budget to accelerate.</p>'
        : `
          <div class="unit-card">
            <div>
              <div class="unit-name">🛰️ Communication Satellites</div>
              <div class="unit-stats">Fleet: ${Math.floor(progress / 10)} | Status: Active</div>
            </div>
          </div>
          <div class="unit-card">
            <div>
              <div class="unit-name">🔭 Orbital Telescope</div>
              <div class="unit-stats">Research: +${Math.floor(progress / 20)}% tech speed</div>
            </div>
          </div>
        `
      }
    </div>
    <div class="tab-section">
      <h3>Future Initiatives</h3>
      <div class="action-grid" style="grid-template-columns:1fr 1fr">
        <button class="action-btn">🚀 Launch Mission</button>
        <button class="action-btn">🔬 Research Tech</button>
        <button class="action-btn">🌕 Moon Base</button>
        <button class="action-btn">🛰️ Expand Fleet</button>
      </div>
    </div>
    ${progress >= 90 ? `
    <div class="tab-section">
      <button class="btn-nuke" onclick="alert('🚀 MARS MISSION LAUNCHED! Congratulations!')">🚀 Launch Mars Mission</button>
    </div>` : ''}
  `;
}

// ============================================================
// TAB: RESEARCH & TECHNOLOGY
// ============================================================
function renderResearchTab() {
  const p = GAME.playerNation;
  if (!p.research) initNationResearch(p);

  const res = p.research;
  const pointsPerTurn = computeNationResearchPerTurn(p);
  const totalTechs = countNationTechs(p);
  const highestTier = getNationHighestTechTier(p);
  const totalTechCount = TECH_BRANCH_KEYS.reduce((sum, b) => sum + Object.keys(TECH_TREE[b]).length, 0);

  // Current project info
  const currentProject = res.currentProject;
  let projectHtml = '';
  if (currentProject) {
    const tech = TECH_TREE[currentProject.branch]?.[currentProject.techId];
    if (tech) {
      const progress = clamp(currentProject.investedPoints / tech.researchCost * 100, 0, 99.9);
      const remaining = Math.max(0, tech.researchCost - currentProject.investedPoints);
      const branchInfo = TECH_BRANCHES[currentProject.branch];
      projectHtml = `
        <div class="tab-section" style="border-color:${branchInfo.color};border-width:2px">
          <h3 style="color:${branchInfo.color}">🔬 Current Research Project</h3>
          <div class="resource-grid">
            <div class="resource-item"><span class="r-name">Project</span><span class="r-val">${branchInfo.icon} ${tech.name}</span></div>
            <div class="resource-item"><span class="r-name">Branch</span><span class="r-val">${branchInfo.name}</span></div>
            <div class="resource-item"><span class="r-name">Tier</span><span class="r-val">${getTechTierName(tech.tier)} (${tech.tier})</span></div>
            <div class="resource-item"><span class="r-name">Progress</span><span class="r-val">${progress.toFixed(1)}%</span></div>
            <div class="resource-item"><span class="r-name">Invested</span><span class="r-val">${currentProject.investedPoints.toFixed(0)} / ${tech.researchCost} pts</span></div>
            <div class="resource-item"><span class="r-name">Remaining</span><span class="r-val">${remaining.toFixed(0)} pts</span></div>
          </div>
          <div style="background:var(--bg-card);border-radius:6px;padding:4px;margin-top:8px">
            <div style="height:14px;background:rgba(255,255,255,0.08);border-radius:6px;overflow:hidden">
              <div style="height:100%;width:${progress}%;background:linear-gradient(90deg,${branchInfo.color},${branchInfo.color}88);border-radius:6px;transition:width 0.3s"></div>
            </div>
          </div>
          <p class="text-muted" style="margin-top:8px;font-size:11px">${tech.description}</p>
        </div>
      `;
    } else {
      projectHtml = `<div class="tab-section"><p class="text-muted">Current project no longer available. Select a new one below.</p></div>`;
      res.currentProject = null;
    }
  } else {
    projectHtml = `<div class="tab-section"><p class="text-muted" style="text-align:center;padding:16px">🔬 No active research project. Select a technology below to start researching.</p></div>`;
  }

  // Generate branch sections with available techs
  let branchSectionsHtml = '';
  TECH_BRANCH_KEYS.forEach(branch => {
    const branchInfo = TECH_BRANCHES[branch];
    const completed = res.completedBranches[branch]?.completed || 0;
    const total = res.completedBranches[branch]?.total || 1;
    const branchProgress = (completed / total * 100);
    const available = getAvailableTechs(p, branch).slice(0, 10); // Show first 10 available

    let techListHtml = '';
    if (available.length === 0) {
      techListHtml = `<p class="text-muted" style="padding:8px;font-size:11px">✨ All technologies in this branch discovered or purchased!</p>`;
    } else {
      techListHtml = available.map(t => {
        const isCurrent = currentProject && currentProject.techId === t.id;
        return `
          <div class="tech-item ${isCurrent ? 'tech-active' : ''}" 
               style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;margin:3px 0;border-radius:6px;background:${isCurrent ? 'rgba(255,255,255,0.06)' : 'var(--bg-card)'};border:1px solid ${isCurrent ? branchInfo.color + '66' : 'transparent'};cursor:pointer"
               data-tech-id="${t.id}" data-branch="${branch}">
            <div style="flex:1">
              <div style="font-weight:600;font-size:13px">${t.name}</div>
              <div style="font-size:10px;color:var(--text-muted)">${getTechTierName(t.tier)} • Cost: ${t.researchCost} pts</div>
            </div>
            <div style="text-align:right">
              <span style="font-size:10px;color:var(--text-muted)">T${t.tier}</span>
              ${!currentProject ? `<button class="btn-sm" onclick="playerStartResearch('${branch}','${t.id}')" style="margin-left:6px">🔬 Research</button>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    branchSectionsHtml += `
      <div class="tab-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <h3 style="color:${branchInfo.color};margin:0">${branchInfo.icon} ${branchInfo.name}</h3>
          <span style="font-size:11px;color:var(--text-muted)">${completed}/${total} (${branchProgress.toFixed(0)}%)</span>
        </div>
        <p class="text-muted" style="font-size:11px;margin-bottom:6px">${branchInfo.description}</p>
        <div style="background:var(--bg-card);border-radius:6px;padding:3px;margin-bottom:8px">
          <div style="height:8px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${branchProgress}%;background:${branchInfo.color};border-radius:4px"></div>
          </div>
        </div>
        <div class="tech-list">
          ${techListHtml}
        </div>
      </div>
    `;
  });

  // Discovered techs summary
  const discoveredHtml = res.discoveredTechs.slice(-10).reverse().map(id => {
    const tech = findTechById(id);
    if (!tech) return '';
    const branchInfo = TECH_BRANCHES[tech.branch];
    return `<span style="font-size:11px;padding:2px 6px;background:rgba(255,255,255,0.04);border-radius:4px;margin:2px;display:inline-block">${branchInfo.icon} ${tech.name} <span style="color:var(--text-muted)">T${tech.tier}</span></span>`;
  }).join('');

  return `
    <div class="tab-section" style="background:linear-gradient(135deg,rgba(100,180,255,0.06),transparent)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <h3>🔬 National R&D Program</h3>
          <p class="text-muted">${totalTechs} technologies discovered • Highest Tier: ${highestTier} • Total: ${totalTechCount} techs</p>
        </div>
        <div style="text-align:right">
          <div style="font-size:22px;font-weight:700;color:var(--accent-blue)">${res.points.toFixed(1)}</div>
          <div style="font-size:11px;color:var(--text-muted)">Research Points</div>
          <div style="font-size:11px;color:var(--accent-green)">+${pointsPerTurn.toFixed(1)}/turn</div>
        </div>
      </div>
      <div class="resource-grid" style="margin-top:10px">
        <div class="resource-item"><span class="r-name">Research Speed</span><span class="r-val">×${(pointsPerTurn / 3).toFixed(1)}</span></div>
        <div class="resource-item"><span class="r-name">Education Factor</span><span class="r-val">${clamp(p.education / 50, 0.1, 2.5).toFixed(2)}×</span></div>
        <div class="resource-item"><span class="r-name">Tech Factor</span><span class="r-val">${clamp(p.techLevel / 5, 0.1, 2.0).toFixed(2)}×</span></div>
        <div class="resource-item"><span class="r-name">Governance Factor</span><span class="r-val">${clamp(p.governance / 50, 0.2, 2.0).toFixed(2)}×</span></div>
      </div>
    </div>

    ${projectHtml}

    <div class="tab-section">
      <h3>🧬 Discovered Technologies (Last 10)</h3>
      ${discoveredHtml || '<p class="text-muted">No technologies discovered yet.</p>'}
      ${res.discoveredTechs.length > 10 ? `<p class="text-muted" style="margin-top:6px;font-size:10px">+${res.discoveredTechs.length - 10} more...</p>` : ''}
      <div style="margin-top:10px">
        <button class="btn-sm" onclick="openTab('leaderboard')">🏆 View Global Tech Leaderboard</button>
        <button class="btn-sm" onclick="playerStartRandomResearch()" style="margin-left:6px">🎲 Auto-Select Project</button>
      </div>
    </div>

    ${branchSectionsHtml}
  `;
}

function attachResearchListeners() {
  $$('.tech-item').forEach(item => {
    item.addEventListener('click', function() {
      const techId = this.dataset.techId;
      const branch = this.dataset.branch;
      const tech = TECH_TREE[branch]?.[techId];
      if (!tech) return;
      const branchInfo = TECH_BRANCHES[branch];
      addNews(`🔬 ${tech.name} - ${branchInfo.icon} ${branchInfo.name} Tier ${tech.tier} - Cost: ${tech.researchCost} pts`, 'minor');
    });
  });
}

// Player action: start researching a specific tech
function playerStartResearch(branch, techId) {
  const p = GAME.playerNation;
  if (!p.research) initNationResearch(p);
  
  const tech = TECH_TREE[branch]?.[techId];
  if (!tech) return;
  
  if (p.research.discoveredTechs.includes(techId) || (p.research.purchasedTechs || []).includes(techId)) {
    addNews(`⚠️ ${tech.name} already discovered!`, 'minor');
    return;
  }
  
  p.research.currentProject = {
    branch,
    techId,
    investedPoints: 0,
  };
  
  addNews(`🔬 Research started: ${TECH_BRANCHES[branch]?.icon || '🔬'} ${tech.name} (Tier ${tech.tier})`, 'minor');
  dom.tabContent.innerHTML = renderResearchTab();
  attachResearchListeners();
}

// Player action: auto-pick a random research project
function playerStartRandomResearch() {
  const p = GAME.playerNation;
  if (!p.research) initNationResearch(p);
  
  const project = aiPickResearchProject(p);
  if (!project) {
    addNews('⚠️ No available technologies to research!', 'minor');
    return;
  }
  
  p.research.currentProject = {
    branch: project.branch,
    techId: project.techId,
    investedPoints: 0,
  };
  
  const tech = TECH_TREE[project.branch]?.[project.techId];
  addNews(`🎲 Auto-selected: ${tech?.name || 'Unknown'} (${TECH_BRANCHES[project.branch]?.name || ''})`, 'minor');
  dom.tabContent.innerHTML = renderResearchTab();
  attachResearchListeners();
}

// ============================================================
// TAB: HISTORY
// ============================================================
function renderHistoryTab() {
  const countries = Object.values(NATIONS).sort((a, b) => a.name.localeCompare(b.name));
  const selectedCountryId = GAME.historyView.countryId && NATIONS[GAME.historyView.countryId]
    ? GAME.historyView.countryId
    : (GAME.selectedNation || GAME.playerNation.id);
  const selectedMetric = HISTORY_METRICS[GAME.historyView.metric] ? GAME.historyView.metric : 'gdp';
  GAME.historyView.countryId = selectedCountryId;
  GAME.historyView.metric = selectedMetric;

  const history = GAME.historyByNation[selectedCountryId] || [];
  const series = history.map(h => h[selectedMetric]);
  const labels = history.map(h => String(h.year));
  const chart = buildLineChartSvg(series, labels);

  const latestVal = series.length ? series[series.length - 1] : 0;
  const firstVal = series.length ? series[0] : 0;
  const delta = latestVal - firstVal;

  return `
    <div class="tab-section">
      <h3>Country History</h3>
      <div class="history-controls">
        <select id="historyCountrySelect" class="history-select">
          ${countries.map(c => `<option value="${c.id}" ${c.id === selectedCountryId ? 'selected' : ''}>${c.flag} ${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="metric-pills" id="historyMetricPills">
        ${Object.keys(HISTORY_METRICS).map(metric => `<button class="metric-pill ${metric === selectedMetric ? 'active' : ''}" data-history-metric="${metric}">${HISTORY_METRICS[metric].label}</button>`).join('')}
      </div>
      <div class="history-chart-card">
        ${chart}
      </div>
      <div class="history-summary">
        <div class="resource-item"><span class="r-name">Latest</span><span class="r-val">${formatMetricDisplay(selectedMetric, latestVal)}</span></div>
        <div class="resource-item"><span class="r-name">Change</span><span class="r-val ${delta >= 0 ? 'positive' : 'negative'}">${delta >= 0 ? '+' : '-'}${formatMetricDisplay(selectedMetric, Math.abs(delta))}</span></div>
        <div class="resource-item"><span class="r-name">Points</span><span class="r-val">${series.length}</span></div>
      </div>
    </div>
  `;
}

function attachHistoryListeners() {
  const select = document.getElementById('historyCountrySelect');
  if (select) {
    select.addEventListener('change', () => {
      GAME.historyView.countryId = select.value;
      dom.tabContent.innerHTML = renderHistoryTab();
      attachHistoryListeners();
    });
  }

  $$('[data-history-metric]').forEach(btn => {
    btn.addEventListener('click', () => {
      GAME.historyView.metric = btn.dataset.historyMetric;
      dom.tabContent.innerHTML = renderHistoryTab();
      attachHistoryListeners();
    });
  });
}

function renderLeaderboardTab() {
  const metric = LEADERBOARD_METRICS[GAME.leaderboardMetric] ? GAME.leaderboardMetric : 'resources';
  GAME.leaderboardMetric = metric;
  const sorted = Object.values(NATIONS)
    .sort((a, b) => getNationMetricValue(b, metric) - getNationMetricValue(a, metric));

  return `
    <div class="tab-section">
      <h3>Global Rankings</h3>
      <div class="metric-pills" id="leaderboardMetricPills">
        ${Object.keys(LEADERBOARD_METRICS).map(m => `<button class="metric-pill ${m === metric ? 'active' : ''}" data-leaderboard-metric="${m}">${LEADERBOARD_METRICS[m]}</button>`).join('')}
      </div>
      <div class="leaderboard-list">
        ${sorted.map((n, i) => `
          <div class="leaderboard-row" data-country-id="${n.id}">
            <div class="leaderboard-rank">#${i + 1}</div>
            <div class="leaderboard-country">${n.flag} ${n.name}</div>
            <div class="leaderboard-value">${formatMetricDisplay(metric, getNationMetricValue(n, metric))}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function attachLeaderboardListeners() {
  $$('[data-leaderboard-metric]').forEach(btn => {
    btn.addEventListener('click', () => {
      GAME.leaderboardMetric = btn.dataset.leaderboardMetric;
      dom.tabContent.innerHTML = renderLeaderboardTab();
      attachLeaderboardListeners();
    });
  });

  $$('[data-country-id]').forEach(row => {
    row.addEventListener('click', () => {
      GAME.selectedNation = row.dataset.countryId;
      renderNationCard();
      renderMap();
      closeTab();
    });
  });
}

// ============================================================
// SIDEBAR TOGGLE (Mobile)
// ============================================================
function setupMobileSidebar() {
  // Create toggle buttons if not exist
  let leftToggle = $('#showLeftSidebar');
  let rightToggle = $('#showRightSidebar');

  if (!leftToggle) {
    leftToggle = document.createElement('button');
    leftToggle.id = 'showLeftSidebar';
    leftToggle.textContent = '▶';
    document.getElementById('mapContainer').appendChild(leftToggle);
  }

  if (!rightToggle) {
    rightToggle = document.createElement('button');
    rightToggle.id = 'showRightSidebar';
    rightToggle.textContent = '◀';
    document.getElementById('mapContainer').appendChild(rightToggle);
  }

  leftToggle.addEventListener('click', () => {
    dom.leftSidebar.classList.toggle('mobile-show');
  });

  rightToggle.addEventListener('click', () => {
    dom.rightSidebar.classList.toggle('mobile-show');
  });

  // Close sidebars when clicking on map
  dom.worldMap.addEventListener('click', () => {
    dom.leftSidebar.classList.remove('mobile-show');
    dom.rightSidebar.classList.remove('mobile-show');
  });
}

// ============================================================
// MENU BUTTON
// ============================================================
function setupMenu() {
  $('#menuBtn').addEventListener('click', () => {
    openTab('gov');
  });
}

// ============================================================
// WINDOW RESIZE
// ============================================================
function handleResize() {
  const canvas = dom.worldMap;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  // Keep map world size stable; preserve center point in view after resize.
  const centerX = canvas.width * 0.5;
  const centerY = canvas.height * 0.5;
  const worldX = (centerX - mapOffsetX) / mapScale;
  const worldY = (centerY - mapOffsetY) / mapScale;
  mapOffsetX = centerX - worldX * mapScale;
  mapOffsetY = centerY - worldY * mapScale;

  renderMap();
}

// ============================================================
// INITIALIZATION
// ============================================================
function init() {
  cacheDom();
  initializeHistory();
  if (typeof initNationIndustries === 'function') {
    Object.values(NATIONS).forEach(nation => {
      if (!nation.failedState) initNationIndustries(nation);
    });
    syncPlayerNationFromRecord();
  }
  // Seed all universities for every nation
  if (typeof eduSystemInit === 'function') eduSystemInit();
  updateHUD();
  initMap();
  loadGeoBoundariesMap();
  renderNationCard();
  setupSpeedControls();
  setupMapControls();
  setupTabs();
  setupMobileSidebar();
  setupMenu();
  if (typeof initWarSystem === 'function') initWarSystem();

  // Add initial news
  addNews('📌 Welcome to Sovereign State: Global Hegemony', 'minor');
  addNews('📌 China GDP growth slows to 4.2%', 'minor');
  addNews('⚡ Russia achieves Nuclear Fusion research breakthrough', 'major');
  addNews('🔥 BREAKING: Border conflict erupts between India and Pakistan', 'critical');

  window.addEventListener('resize', handleResize);

  console.log('🏛️ Sovereign State: Global Hegemony initialized');
  console.log(`📅 ${formatDate(GAME.date)} | Turn ${GAME.turn}`);
}

// Kick off when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}