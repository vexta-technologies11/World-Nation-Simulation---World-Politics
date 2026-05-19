/**
 * Global War & Geopolitical Conflict System
 * Dynamic wars, generals, intel, diplomacy, economic impact
 * Loaded AFTER game.js — accesses GAME, NATIONS, addNews, getRelation, etc.
 */

// ============================================================
// GENERAL ARCHETYPES
// ============================================================
const GENERAL_ARCHETYPES = {
  'Master Strategist': { strategy: 90, intelligence: 85, aggression: 45, defense: 80, logistics: 85, morale: 80, desc: 'Brilliant long-term planner, minimizes casualties' },
  'Aggressive Commander': { strategy: 55, intelligence: 40, aggression: 95, defense: 40, logistics: 55, morale: 75, desc: 'Drives hard offensives but wastes manpower' },
  'Defensive Fortifier': { strategy: 70, intelligence: 60, aggression: 30, defense: 95, logistics: 80, morale: 70, desc: 'Master of entrenchment and attrition defense' },
  'Reckless General': { strategy: 35, intelligence: 30, aggression: 90, defense: 25, logistics: 30, morale: 50, desc: 'Attacks without planning, high casualties' },
  'Logistics Expert': { strategy: 65, intelligence: 70, aggression: 40, defense: 70, logistics: 95, morale: 75, desc: 'Keeps armies supplied and well-equipped' },
  'Guerrilla Leader': { strategy: 75, intelligence: 80, aggression: 60, defense: 60, logistics: 40, morale: 90, desc: 'Excels at asymmetric warfare and insurgency' },
  'Politician General': { strategy: 45, intelligence: 55, aggression: 50, defense: 40, logistics: 50, morale: 60, desc: 'Appointed for connections, not competence' },
  'People\'s Champion': { strategy: 60, intelligence: 50, aggression: 55, defense: 65, logistics: 60, morale: 95, desc: 'Troops fight to the death for this leader' },
  'Tactical Genius': { strategy: 85, intelligence: 80, aggression: 70, defense: 75, logistics: 70, morale: 75, desc: 'Brilliant battlefield commander, flexible' },
  'Incompetent Fool': { strategy: 20, intelligence: 25, aggression: 40, defense: 20, logistics: 25, morale: 30, desc: 'Disastrous leadership, causes needless losses' },
  'Cold Calculator': { strategy: 80, intelligence: 90, aggression: 50, defense: 70, logistics: 75, morale: 60, desc: 'Weighs every move, low emotion high precision' },
  'Patriot': { strategy: 60, intelligence: 55, aggression: 65, defense: 60, logistics: 60, morale: 90, desc: 'Fights for country, inspires troops' },
};

// ============================================================
// WAR / CONFLICT SYSTEM
// ============================================================
// Each active conflict stored in GAME.conflicts[] with these fields:

function initConflictTemplate() {
  return {
    key: '',
    a: '',
    b: '',
    type: 'war',                // 'war', 'invasion', 'civil_war'
    severity: 5,                // 1-10 scale
    
    // Duration tracking
    startTurn: 0,
    startDate: null,
    turn: 0,
    
    // Current state
    phase: 'active',            // 'active', 'ceasefire', 'peace'
    ceasefireTurns: 0,
    ceasefireDuration: 0,
    peaceTurns: 0,
    
    // Battle tracking
    battles: [],
    currentFront: 'stalemate',  // 'a_advancing', 'b_advancing', 'stalemate', 'a_retreating', 'b_retreating'
    frontShift: 0,              // negative = pushes into A, positive = pushes into B
    
    // Casualties
    casualties: { a_military: 0, b_military: 0, a_civilian: 0, b_civilian: 0, a_wounded: 0, b_wounded: 0 },
    equipmentLost: { a: { total: 0, byType: {} }, b: { total: 0, byType: {} } },
    
    // Exhaustion
    aExhaustion: 0,             // 0-100
    bExhaustion: 0,
    
    // Economic damage inflicted so far (total GDP lost)
    economicDamage: { a: 0, b: 0 },
    moneySpent: { a: 0, b: 0 },
    
    // Mobilization levels (0-100, how much military deployed)
    aMobilization: 50,
    bMobilization: 50,
    
    // War goals
    aGoal: 'defend',            // 'defend', 'conquer', 'annex', 'liberate', 'punish'
    bGoal: 'defend',
    
    // Last escalation
    lastEscalationTurn: 0,

    // Settlement tracking
    warDeals: [],
    surrender: null,
    winner: null,
    endReason: null,
  };
}

function getTruceKey(a, b) {
  return [a, b].sort().join('::');
}

function hasActiveTruce(a, b) {
  const key = getTruceKey(a, b);
  const tr = GAME.truces?.[key];
  return !!tr && tr.turnsRemaining > 0;
}

function createTruce(a, b, turns = 18, reason = 'post-war settlement') {
  if (!GAME.truces) GAME.truces = {};
  const key = getTruceKey(a, b);
  GAME.truces[key] = {
    a,
    b,
    turnsRemaining: clamp(Math.floor(turns), 6, 48),
    reason,
    startTurn: GAME.turn,
  };
}

function processTruceDecay() {
  if (!GAME.truces) GAME.truces = {};
  Object.keys(GAME.truces).forEach((k) => {
    const tr = GAME.truces[k];
    if (!tr) return;
    tr.turnsRemaining -= 1;
    if (tr.turnsRemaining <= 0) delete GAME.truces[k];
  });
}

function ensureWarArchive() {
  if (!GAME.warHistory) GAME.warHistory = [];
}

function archiveConflict(conflict) {
  if (!conflict) return;
  ensureWarArchive();

  const exists = GAME.warHistory.some((w) => w.key === conflict.key && w.startTurn === conflict.startTurn);
  if (exists) return;

  const totalCasualties = (conflict.casualties?.a_military || 0) + (conflict.casualties?.b_military || 0);
  GAME.warHistory.unshift({
    key: conflict.key,
    a: conflict.a,
    b: conflict.b,
    type: conflict.type,
    severity: conflict.severity,
    startTurn: conflict.startTurn,
    endTurn: GAME.turn,
    duration: conflict.turn,
    casualties: { ...(conflict.casualties || {}) },
    equipmentLost: {
      a: { total: conflict.equipmentLost?.a?.total || 0, byType: { ...(conflict.equipmentLost?.a?.byType || {}) } },
      b: { total: conflict.equipmentLost?.b?.total || 0, byType: { ...(conflict.equipmentLost?.b?.byType || {}) } },
    },
    moneySpent: { ...(conflict.moneySpent || { a: 0, b: 0 }) },
    economicDamage: { ...(conflict.economicDamage || { a: 0, b: 0 }) },
    winner: conflict.winner || null,
    surrender: conflict.surrender || null,
    endReason: conflict.endReason || 'peace',
    warDeals: Array.isArray(conflict.warDeals) ? [...conflict.warDeals] : [],
    totalCasualties,
  });

  if (GAME.warHistory.length > 60) GAME.warHistory.length = 60;
}

function summarizeLossTypes(byType = {}) {
  return Object.keys(byType)
    .sort((x, y) => (byType[y] || 0) - (byType[x] || 0))
    .slice(0, 4)
    .map((k) => `${k}:${byType[k]}`)
    .join(', ');
}

function estimateWinChances(conflict) {
  const aCas = conflict.casualties?.a_military || 0;
  const bCas = conflict.casualties?.b_military || 0;
  const front = conflict.frontShift || 0;
  const aEx = conflict.aExhaustion || 0;
  const bEx = conflict.bExhaustion || 0;
  const lastBattle = conflict.battles?.length ? conflict.battles[conflict.battles.length - 1] : null;
  const lastDelta = lastBattle ? ((lastBattle.aPower || 0) - (lastBattle.bPower || 0)) / Math.max((lastBattle.aPower || 0) + (lastBattle.bPower || 0), 1) : 0;

  const aSignal = -front * 8 + (bCas - aCas) / 2000 + (bEx - aEx) * 0.35 + lastDelta * 22;
  const aPct = clamp(50 + aSignal, 5, 95);
  return { aPct: Math.round(aPct), bPct: Math.round(100 - aPct) };
}

// ============================================================
// WAR DECISION AI
// ============================================================
// Nations decide whether to declare war / escalate / seek peace
// based on economy, military, ideology, intel, alliances, etc.

function getWarScore(nation) {
  if (!nation) return 0;
  const milPower = nation.militaryPower || 0;
  const tech = nation.techLevel || 1;
  const gdp = nation.gdp || 0.1;
  const pop = nation.population || 1;
  const stability = nation.stability || 50;
  const gov = getGovernmentProfile(nation.governmentStyle);
  return gdp * 0.2 + milPower * 0.5 + tech * 3 + pop * 0.01 + stability * 0.1 + (gov.stabilityBoost || 1) * 5;
}

function getAggressionScore(nation) {
  if (!nation) return 0;
  const gov = getGovernmentProfile(nation.governmentStyle);
  const leaderType = nation.leaderType || 'Prime Minister';
  const leaderProfile = LEADER_ARCHETYPES[leaderType] || LEADER_ARCHETYPES['Prime Minister'];
  
  // Government ideology aggression
  let govAggression = 0.5;
  const style = nation.governmentStyle || 'federal_republic';
  if (['dictatorship', 'military_junta', 'authoritarian_state'].includes(style)) govAggression = 0.85;
  else if (['federal_republic', 'liberal_democracy', 'constitutional_monarchy'].includes(style)) govAggression = 0.4;
  else if (['theocratic_state', 'socialist_republic'].includes(style)) govAggression = 0.6;
  
  // Leadership aggression (from archetype)
  const leaderAggression = leaderProfile?.traits?.includes('Aggressive') ? 0.8 :
                           leaderProfile?.traits?.includes('Pragmatist') ? 0.5 :
                           leaderProfile?.traits?.includes('Diplomat') ? 0.3 : 0.5;
  
  // National conditions
  const instabilityDesperation = nation.stability < 30 ? 0.7 : nation.stability < 45 ? 0.4 : 0;
  const powerConfidence = getWarScore(nation) > 50 ? 0.3 : 0;
  const economicDistress = nation.recessionMonths > 6 ? 0.5 : 0;
  
  return clamp(govAggression + leaderAggression + instabilityDesperation + powerConfidence + economicDistress, 0, 2.5);
}

function getDesperationScore(nation) {
  if (!nation) return 0;
  let score = 0;
  if (nation.stability < 25) score += 0.7;
  if (nation.recessionMonths > 12) score += 0.5;
  if (nation.debtRatio > 150) score += 0.4;
  if (nation.inCrisis) score += 0.6;
  if (nation.gdp < 0.5) score += 0.3;
  return clamp(score, 0, 2);
}

function getActiveEquipmentPower(nation) {
  const f = nation?.militaryForces;
  if (!f) return 0;

  const weights = {
    fighters: 1.6, bombers: 2.4, helicopters: 0.8, transport: 0.3,
    tanks: 1.8, ifvs: 0.7, artillery: 1.2,
    destroyers: 3.0, submarines: 3.2, carriers: 7.0, patrol: 0.8,
    missileSystems: 2.5, drones: 0.5, satellites: 0.2, rifles: 0.005,
  };

  let power = 0;
  Object.keys(weights).forEach((k) => {
    const active = Number(f[k]?.active) || 0;
    power += active * weights[k];
  });
  return power;
}

function getWarCrisisKey(attackerId, defenderId) {
  return `${attackerId}::${defenderId}`;
}

function ensureWarMobilizationState() {
  if (!GAME.warMobilizationCrises || typeof GAME.warMobilizationCrises !== 'object') {
    GAME.warMobilizationCrises = {};
  }
  return GAME.warMobilizationCrises;
}

function getNationWarReadinessProfile(nation, defender, goal = 'conquer') {
  const forces = nation?.militaryForces || {};
  const readinessRatio = clamp((Number(forces.readiness) || 0) / 100, 0, 1);
  const trainingRatio = clamp((Number(forces.trainingQuality) || 45) / 100, 0, 1);
  const fundingRatio = clamp(Number(forces.lastFundingRatio || 0.75), 0, 1.5);
  const fundingCoverage = clamp(fundingRatio / 1.05, 0, 1);
  const manpowerPressure = clamp((Number(forces.manpowerPressure) || 55) / 100, 0, 1.5);
  const manpowerCoverage = clamp(1 - Math.max(0, manpowerPressure - 0.85) * 1.6, 0, 1);

  const activeTroops = Math.max(5000, Math.round((Number(forces.activePersonnel) || 0.02) * 1000000));
  const scale = clamp(Math.sqrt(activeTroops / 140000), 0.65, 4.2);
  const requiredActive = {
    tanks: Math.max(10, Math.round(8 * scale)),
    fighters: Math.max(6, Math.round(6 * scale)),
    missileSystems: Math.max(20, Math.round(15 * scale)),
    artillery: Math.max(14, Math.round(12 * scale)),
  };
  if (goal === 'defend') {
    requiredActive.tanks = Math.max(8, Math.round(requiredActive.tanks * 0.75));
    requiredActive.fighters = Math.max(4, Math.round(requiredActive.fighters * 0.75));
    requiredActive.missileSystems = Math.max(12, Math.round(requiredActive.missileSystems * 0.7));
    requiredActive.artillery = Math.max(10, Math.round(requiredActive.artillery * 0.8));
  }

  const activeLevels = {
    tanks: Math.max(0, Number(forces.tanks?.active) || 0),
    fighters: Math.max(0, Number(forces.fighters?.active) || 0),
    missileSystems: Math.max(0, Number(forces.missileSystems?.active) || 0),
    artillery: Math.max(0, Number(forces.artillery?.active) || 0),
  };

  const heavyCoverageByType = {};
  let heavyCoverageMet = 0;
  Object.keys(requiredActive).forEach((k) => {
    const ratio = clamp(activeLevels[k] / Math.max(1, requiredActive[k]), 0, 1.6);
    heavyCoverageByType[k] = ratio;
    if (ratio >= 1) heavyCoverageMet += 1;
  });
  const heavyCoverage = clamp(
    Object.values(heavyCoverageByType).reduce((sum, val) => sum + val, 0) / 4,
    0,
    1.4
  );

  const demandProfile = typeof getNationEquipmentDemand === 'function'
    ? getNationEquipmentDemand(nation)
    : {};
  const stockCoverageCats = ['tank', 'fighter', 'missile', 'artillery', 'drone', 'ifv'];
  let stockCoverageTotal = 0;
  let stockCoverageWeight = 0;
  stockCoverageCats.forEach((category) => {
    const desired = Math.max(1, Number(demandProfile[category] || 0));
    const inventory = typeof getCategoryInventoryTotal === 'function'
      ? Number(getCategoryInventoryTotal(nation, category) || 0)
      : 0;
    const weight = ['tank', 'fighter', 'missile', 'artillery'].includes(category) ? 2 : 1;
    stockCoverageTotal += clamp(inventory / desired, 0, 1.35) * weight;
    stockCoverageWeight += weight;
  });
  const stockpileCoverage = stockCoverageWeight > 0
    ? clamp(stockCoverageTotal / stockCoverageWeight, 0, 1.35)
    : 0.45;

  const companies = typeof getNationDefenseCompanies === 'function'
    ? (getNationDefenseCompanies(nation) || [])
    : [];
  let procurementCoverage = 0.42;
  if (companies.length > 0) {
    let procurementSum = 0;
    let procurementWeight = 0;
    let pendingOrders = 0;
    companies.forEach((company) => {
      const cov = clamp(Number(company?.lastProcurement?.coverage || 0.58), 0, 1);
      const weight = Math.max(1, Number(company?.tier || 1));
      procurementSum += cov * weight;
      procurementWeight += weight;
      pendingOrders += (company?.pendingOrders?.length || 0);
    });
    const backlogPenalty = clamp(pendingOrders / Math.max(6, companies.length * 9), 0, 0.45);
    procurementCoverage = clamp((procurementWeight > 0 ? procurementSum / procurementWeight : 0.5) - backlogPenalty, 0, 1);
  }

  const logisticsCoverage = clamp(
    readinessRatio * 0.42 +
    trainingRatio * 0.18 +
    fundingCoverage * 0.24 +
    manpowerCoverage * 0.16,
    0,
    1
  );

  const attackerPower = getActiveEquipmentPower(nation);
  const defenderPower = defender ? getActiveEquipmentPower(defender) : 0;
  const minimumPowerFloor = clamp(36 + scale * 22, 30, 180);
  const relativePowerCoverage = defender
    ? clamp(attackerPower / Math.max(minimumPowerFloor, defenderPower * 0.55), 0, 1.4)
    : clamp(attackerPower / minimumPowerFloor, 0, 1.4);

  const hardFailures = [];
  if (readinessRatio < 0.45) hardFailures.push('low_readiness');
  if (heavyCoverageMet < 2) hardFailures.push('insufficient_heavy_equipment');
  if (stockpileCoverage < 0.52) hardFailures.push('low_stockpile_coverage');
  if (relativePowerCoverage < 0.65) hardFailures.push('insufficient_active_equipment_power');

  const overallCoverage = clamp(
    heavyCoverage * 0.30 +
    stockpileCoverage * 0.30 +
    logisticsCoverage * 0.22 +
    procurementCoverage * 0.18,
    0,
    1.4
  );

  const sharpCoverage = clamp(logisticsCoverage * 0.45 + procurementCoverage * 0.35 + stockpileCoverage * 0.20, 0, 1);
  const declarationFactor = hardFailures.length > 0 ? 0 : clamp(Math.pow(sharpCoverage, 2.35), 0.02, 1);

  return {
    hardFailures,
    hardBlocked: hardFailures.length > 0,
    readinessRatio,
    stockpileCoverage,
    procurementCoverage,
    logisticsCoverage,
    heavyCoverage,
    heavyCoverageByType,
    heavyCoverageMet,
    requiredActive,
    activeLevels,
    activeEquipmentPower: attackerPower,
    relativePowerCoverage,
    overallCoverage,
    declarationFactor,
  };
}

function registerWarMobilizationCrisis(attackerId, defenderId, profile, contextReason = 'equipment_shortfall') {
  const crises = ensureWarMobilizationState();
  const key = getWarCrisisKey(attackerId, defenderId);
  const attacker = NATIONS[attackerId];
  const defender = NATIONS[defenderId];
  if (!attacker || !defender || attacker.failedState || defender.failedState) return;

  const existing = crises[key];
  if (existing && existing.status === 'active') {
    existing.lastUpdatedTurn = GAME.turn || 0;
    existing.readiness = profile;
    existing.reason = contextReason;
    return;
  }

  const severityPenalty = Math.max(0, 3 - Number(profile?.heavyCoverageMet || 0));
  const delayTurns = clamp(3 + Math.floor(Math.random() * 3) + severityPenalty, 3, 9);

  crises[key] = {
    key,
    attackerId,
    defenderId,
    status: 'active',
    phase: 'crisis',
    reason: contextReason,
    createdTurn: GAME.turn || 0,
    lastUpdatedTurn: GAME.turn || 0,
    earliestWarTurn: (GAME.turn || 0) + delayTurns,
    attempts: 0,
    readiness: profile,
  };

  const shortageLabel = (profile?.hardFailures || []).join(', ') || 'equipment gap';
  addNews(`🚨 CRISIS MOBILIZATION: ${attacker.name} escalates against ${defender.name} but delays war to rearm (${shortageLabel}).`, 'major');
}

function processWarMobilizationCrises() {
  const crises = ensureWarMobilizationState();
  const keys = Object.keys(crises);
  if (!keys.length) return;

  keys.forEach((key) => {
    const crisis = crises[key];
    if (!crisis || crisis.status !== 'active') {
      delete crises[key];
      return;
    }

    const attacker = NATIONS[crisis.attackerId];
    const defender = NATIONS[crisis.defenderId];
    if (!attacker || !defender || attacker.failedState || defender.failedState) {
      delete crises[key];
      return;
    }

    if (hasActiveTruce(crisis.attackerId, crisis.defenderId)) {
      crisis.status = 'cancelled';
      delete crises[key];
      return;
    }

    if (GAME.conflicts.some(c =>
      (c.a === crisis.attackerId && c.b === crisis.defenderId) ||
      (c.a === crisis.defenderId && c.b === crisis.attackerId)
    )) {
      crisis.status = 'resolved';
      delete crises[key];
      return;
    }

    if (attacker.aiBudget && typeof attacker.aiBudget === 'object') {
      attacker.aiBudget.military = clamp((attacker.aiBudget.military || 20) + 1.8, 8, 72);
      attacker.aiBudget.economy = clamp((attacker.aiBudget.economy || 20) - 0.35, 4, 60);
    }

    attacker.defenseRequestCooldown = 0;
    triggerWarProcurement(attacker, 1.0);

    const companies = typeof getNationDefenseCompanies === 'function'
      ? (getNationDefenseCompanies(attacker) || [])
      : [];
    if (companies.length > 0 && typeof _produceEquipInternal === 'function' && typeof getNationEquipmentDemand === 'function') {
      const demand = getNationEquipmentDemand(attacker);
      const priority = ['tank', 'fighter', 'missile', 'artillery', 'drone', 'ifv', 'rifle'];
      companies.forEach((company) => {
        if (!company?.equipment?.length) return;
        company.researchFocus = priority[Math.floor(Math.random() * Math.min(priority.length, 5))];
        const choice = [...company.equipment]
          .filter(eq => priority.includes(eq.cat))
          .sort((a, b) => {
            const gapA = Math.max(0, (demand[a.cat] || 0) - (typeof getCategoryInventoryTotal === 'function' ? getCategoryInventoryTotal(attacker, a.cat) : 0));
            const gapB = Math.max(0, (demand[b.cat] || 0) - (typeof getCategoryInventoryTotal === 'function' ? getCategoryInventoryTotal(attacker, b.cat) : 0));
            return gapB - gapA;
          })[0];
        if (!choice) return;
        const shortage = Math.max(0, (demand[choice.cat] || 0) - (typeof getCategoryInventoryTotal === 'function' ? getCategoryInventoryTotal(attacker, choice.cat) : 0));
        const qty = typeof getEquipmentProcurementBatch === 'function'
          ? getEquipmentProcurementBatch(choice.cat, Math.max(shortage, Math.ceil(shortage * 0.55)), true, attacker)
          : 0;
        if (qty > 0) {
          _produceEquipInternal(company, choice.id, qty, attacker, false);
        }
      });
    }

    const readiness = getNationWarReadinessProfile(attacker, defender, 'conquer');
    crisis.readiness = readiness;
    crisis.lastUpdatedTurn = GAME.turn || 0;

    const currentTurn = GAME.turn || 0;
    if (currentTurn < Number(crisis.earliestWarTurn || 0)) return;
    if (readiness.hardBlocked || readiness.overallCoverage < 0.62) {
      if (currentTurn - (crisis.createdTurn || 0) > 28) {
        crisis.status = 'stalled';
        addNews(`🧯 MOBILIZATION STALLED: ${attacker.name} cannot sustain a war plan against ${defender.name} and de-escalates.`, 'minor');
        delete crises[key];
      }
      return;
    }

    const severity = Math.floor(4 + Math.random() * 5);
    const goal = Math.random() < 0.35 ? 'annex' : (Math.random() < 0.5 ? 'conquer' : 'punish');
    const launched = declareWar(crisis.attackerId, crisis.defenderId, severity, goal);
    crisis.attempts = (crisis.attempts || 0) + 1;
    if (launched) {
      crisis.status = 'launched';
      delete crises[key];
    } else if ((crisis.attempts || 0) > 3) {
      crisis.earliestWarTurn = currentTurn + 3;
    }
  });
}

function applyBattleEquipmentLosses(nation, totalLoss) {
  const f = nation?.militaryForces;
  if (!f || !totalLoss || totalLoss <= 0) return { total: 0, byType: {} };

  const priority = [
    'tanks', 'ifvs', 'artillery', 'fighters', 'helicopters', 'bombers',
    'destroyers', 'submarines', 'patrol', 'missileSystems', 'drones', 'rifles'
  ];

  let remaining = Math.floor(totalLoss);
  let removed = 0;
  const byType = {};

  for (const type of priority) {
    if (remaining <= 0) break;
    if (!f[type]) continue;

    const active = Math.max(0, Math.floor(f[type].active || 0));
    if (active <= 0) continue;

    const chunk = Math.max(1, Math.floor(totalLoss * 0.12));
    const loss = Math.min(active, remaining, chunk);
    f[type].active = Math.max(0, active - loss);
    f[type].total = Math.max(0, (f[type].total || 0) - loss);
    byType[type] = (byType[type] || 0) + loss;
    remaining -= loss;
    removed += loss;
  }

  return { total: removed, byType };
}

function triggerWarProcurement(nation, severity) {
  if (!nation || nation.failedState) return;
  const isPlayerNation = !!(typeof GAME !== 'undefined' && nation.id === GAME.playerNation?.id);

  if (nation.aiBudget && typeof nation.aiBudget === 'object') {
    nation.aiBudget.military = clamp((nation.aiBudget.military || 20) + severity * 0.12, 4, 55);
    nation.aiBudget.diplomacy = clamp((nation.aiBudget.diplomacy || 12) + 0.15, 3, 30);
  }

  if (typeof getNationDefenseCompanies === 'function' && typeof _produceEquipInternal === 'function') {
    const demandProfile = typeof getNationEquipmentDemand === 'function' ? getNationEquipmentDemand(nation) : {};

    const companies = getNationDefenseCompanies(nation) || [];
  const militarySpend = clamp(((isPlayerNation ? GAME?.budget?.military : nation.aiBudget?.military) || 20) / 100, 0.05, 0.7);
    const productionPulse = clamp(0.16 + severity * 0.18 + militarySpend * 0.45, 0.18, 0.85);

    companies.forEach((company) => {
      if (!company?.equipment?.length) return;
      if (Math.random() > productionPulse) return;

      const candidates = company.equipment.filter((eq) => ['tank', 'fighter', 'artillery', 'missile', 'drone', 'rifle', 'destroyer', 'submarine'].includes(eq.cat));
      if (!candidates.length) return;

      const riflePool = candidates.filter((eq) => eq.cat === 'rifle');
      const heavyPool = candidates.filter((eq) => ['tank', 'fighter', 'destroyer', 'submarine', 'artillery', 'missile'].includes(eq.cat));

      let pick = null;
      const rifleShortage = Math.max(0, (demandProfile.rifle || 0) - (typeof getCategoryInventoryTotal === 'function' ? getCategoryInventoryTotal(nation, 'rifle') : 0));
      if (rifleShortage > 0 && riflePool.length > 0 && Math.random() < 0.6) {
        pick = riflePool[Math.floor(Math.random() * riflePool.length)];
      } else if (heavyPool.length > 0) {
        heavyPool.sort((a, b) => {
          const shortageA = Math.max(0, (demandProfile[a.cat] || 0) - (typeof getCategoryInventoryTotal === 'function' ? getCategoryInventoryTotal(nation, a.cat) : 0));
          const shortageB = Math.max(0, (demandProfile[b.cat] || 0) - (typeof getCategoryInventoryTotal === 'function' ? getCategoryInventoryTotal(nation, b.cat) : 0));
          return shortageB - shortageA;
        });
        pick = heavyPool[0];
      } else {
        pick = candidates[Math.floor(Math.random() * candidates.length)];
      }

      const shortage = Math.max(0, (demandProfile[pick.cat] || 0) - (typeof getCategoryInventoryTotal === 'function' ? getCategoryInventoryTotal(nation, pick.cat) : 0));
      const qty = typeof getEquipmentProcurementBatch === 'function'
        ? getEquipmentProcurementBatch(pick.cat, shortage, true, nation)
        : 0;
      if (qty > 0) _produceEquipInternal(company, pick.id, qty, nation, false);
    });
  }
}

function applyWarDealsAndTruce(conflict, winnerId) {
  const loserId = winnerId === conflict.a ? conflict.b : conflict.a;
  const winner = NATIONS[winnerId];
  const loser = NATIONS[loserId];
  if (!winner || !loser) return;

  const deals = [];

  // Reparations
  const loserTreasury = loser.treasury || 0;
  const reparations = Math.min(loserTreasury * 0.18, 240 + conflict.severity * 20);
  if (reparations > 1) {
    loser.treasury = Math.max(0, loserTreasury - reparations);
    winner.treasury = (winner.treasury || 0) + reparations;
    deals.push(`reparations:$${Math.round(reparations)}M`);
  }

  // Disarmament and exhaustion relief for both sides
  loser.militaryPower = clamp((loser.militaryPower || 50) * 0.93, 1, 100);
  winner.militaryPower = clamp((winner.militaryPower || 50) * 0.99, 1, 100);
  conflict.aExhaustion = clamp(conflict.aExhaustion - 25, 0, 100);
  conflict.bExhaustion = clamp(conflict.bExhaustion - 25, 0, 100);
  deals.push('disarmament-lite');

  // Truce duration scales with severity
  const truceTurns = 12 + conflict.severity * 2;
  createTruce(conflict.a, conflict.b, truceTurns, winnerId ? 'peace-deal' : 'stalemate');
  deals.push(`truce:${truceTurns}t`);

  conflict.warDeals = deals;
  conflict.winner = winnerId;
  conflict.endReason = conflict.surrender ? 'surrender' : 'peace-deal';
}

function trySurrender(conflict) {
  const a = NATIONS[conflict.a];
  const b = NATIONS[conflict.b];
  if (!a || !b || conflict.phase !== 'active' || conflict.turn < 6) return false;

  const aPressure = conflict.aExhaustion + (100 - (a.stability || 50)) + (a.gdp < 0.9 ? 25 : 0);
  const bPressure = conflict.bExhaustion + (100 - (b.stability || 50)) + (b.gdp < 0.9 ? 25 : 0);
  const casualtyGapA = conflict.casualties.a_military - conflict.casualties.b_military;
  const casualtyGapB = conflict.casualties.b_military - conflict.casualties.a_military;

  // A surrenders
  if ((aPressure > 185 || casualtyGapA > 18000) && conflict.frontShift > 4) {
    conflict.surrender = conflict.a;
    conflict.phase = 'peace';
    conflict.peaceTurns = 0;
    applyWarDealsAndTruce(conflict, conflict.b);
    addNews(`🏳️ SURRENDER: ${a.name} surrenders to ${b.name}. War ends with binding deals and truce.`, 'critical');
    return true;
  }

  // B surrenders
  if ((bPressure > 185 || casualtyGapB > 18000) && conflict.frontShift < -4) {
    conflict.surrender = conflict.b;
    conflict.phase = 'peace';
    conflict.peaceTurns = 0;
    applyWarDealsAndTruce(conflict, conflict.a);
    addNews(`🏳️ SURRENDER: ${b.name} surrenders to ${a.name}. War ends with binding deals and truce.`, 'critical');
    return true;
  }

  return false;
}

function attemptGreatPowerMediation(conflict) {
  if (!conflict || conflict.phase !== 'active' || conflict.turn < 5) return false;
  const a = NATIONS[conflict.a];
  const b = NATIONS[conflict.b];
  if (!a || !b) return false;

  const mediators = Object.values(NATIONS).filter((n) => {
    if (!n || n.failedState || n.id === conflict.a || n.id === conflict.b) return false;
    const relA = typeof getRelationBetween === 'function' ? getRelationBetween(n.id, conflict.a) : 0;
    const relB = typeof getRelationBetween === 'function' ? getRelationBetween(n.id, conflict.b) : 0;
    const diplomaticWeight = (n.aiBudget?.diplomacy || 10) + (n.leaderType === 'Diplomat' ? 8 : 0);
    return relA > -10 && relB > -10 && n.militaryPower > 55 && diplomaticWeight > 14;
  });

  if (!mediators.length) return false;
  const mediator = mediators[Math.floor(Math.random() * mediators.length)];
  const mediationChance = clamp(
    0.08 + (mediator.militaryPower || 50) / 450 + ((mediator.aiBudget?.diplomacy || 10) / 100) + (conflict.turn * 0.003),
    0.08,
    0.45
  );

  if (Math.random() >= mediationChance) return false;

  conflict.severity = clamp(conflict.severity - 1, 1, 10);
  conflict.aExhaustion = clamp(conflict.aExhaustion + 3, 0, 100);
  conflict.bExhaustion = clamp(conflict.bExhaustion + 3, 0, 100);
  conflict.aMobilization = clamp(conflict.aMobilization - 5, 0, 100);
  conflict.bMobilization = clamp(conflict.bMobilization - 5, 0, 100);

  addNews(`🕊️ MEDIATION: ${mediator.name} brokers de-escalation between ${a.name} and ${b.name}.`, 'major');
  if (Math.random() < 0.35) requestCeasefire(conflict);
  return true;
}

function evaluateWarDecision(attackerId, defenderId) {
  const a = NATIONS[attackerId];
  const b = NATIONS[defenderId];
  if (!a || !b || a.failedState || b.failedState) return { decision: 'none', reason: 'invalid' };
  if (hasActiveTruce(attackerId, defenderId)) return { decision: 'peace', reason: 'active_truce', desire: 0 };

  const readinessProfile = getNationWarReadinessProfile(a, b, 'conquer');
  if (readinessProfile.hardBlocked) {
    return {
      decision: 'crisis',
      reason: 'insufficient_equipment',
      desire: 0,
      readiness: readinessProfile,
    };
  }
  
  const aScore = getWarScore(a);
  const bScore = getWarScore(b);
  const aAggression = getAggressionScore(a);
  const aDesperation = getDesperationScore(a);
  const aReadiness = (a.militaryForces?.readiness || 50) / 100;
  const bReadiness = (b.militaryForces?.readiness || 50) / 100;
  
  // Alliance support for defender
  const defenderAllies = GAME.alliances.filter(al => al.a === defenderId || al.b === defenderId);
  const allyStrength = defenderAllies.reduce((sum, al) => {
    const allyId = al.a === defenderId ? al.b : al.a;
    const ally = NATIONS[allyId];
    return sum + (ally ? getWarScore(ally) : 0);
  }, 0);
  
  // Random factor
  const randomFactor = 0.6 + Math.random() * 0.8;
  
  // Power ratio (attacker advantage)
  const powerRatio = aScore / Math.max(bScore + allyStrength * 0.5, 1);
  const deterrenceGap = Math.max(0, (bScore + allyStrength * 0.5) - aScore);
  const fearFactor = clamp(deterrenceGap / Math.max(aScore, 1), 0, 1.5) + clamp((bReadiness - aReadiness) * 0.8, 0, 0.6);
  
  // Calculate war desire
  let warDesire = aAggression * powerRatio * randomFactor;
  warDesire += (aReadiness - bReadiness) * 0.25;
  warDesire += (readinessProfile.heavyCoverage - 0.8) * 0.55;
  warDesire += (readinessProfile.stockpileCoverage - 0.75) * 0.6;
  warDesire += (readinessProfile.logisticsCoverage - 0.7) * 0.52;
  
  // Desperation can push nations to war (distraction) or peace
  if (aDesperation > 1 && aAggression > 0.6) warDesire += aDesperation * 0.5;
  else if (aDesperation > 1) warDesire -= aDesperation * 0.3; // desperate peaceful nations seek peace
  
  const rel = typeof getRelationBetween === 'function'
    ? getRelationBetween(attackerId, defenderId)
    : (typeof getRelation === 'function' ? getRelation(defenderId) : 0);
  warDesire -= rel * 0.005;
  warDesire -= fearFactor * 0.65;
  
  // Border tension (random proxy)
  warDesire += (Math.random() - 0.5) * 0.3;
  
  // Check if already at war
  const alreadyAtWar = GAME.conflicts.some(c => (c.a === attackerId || c.b === attackerId));
  if (alreadyAtWar) warDesire *= 0.3;

  // Sharp declaration downscale when procurement/logistics/stockpile are weak.
  warDesire *= readinessProfile.declarationFactor;

  // Strong deterrence pushes weaker nations into caution.
  if (fearFactor > 0.9 && powerRatio < 1.05) {
    return { decision: 'peace', reason: 'deterrence', desire: warDesire };
  }
  
  if (warDesire > 1.2 && powerRatio > 1.3) {
    return { decision: 'attack', reason: 'military_advantage', desire: warDesire, readiness: readinessProfile };
  } else if (warDesire > 0.8) {
    return { decision: 'provoke', reason: 'aggressive_posture', desire: warDesire, readiness: readinessProfile };
  }
  return { decision: 'peace', reason: 'no_interest', desire: warDesire, readiness: readinessProfile };
}

// ============================================================
// DECLARE WAR
// ============================================================

function declareWar(attackerId, defenderId, severity = 5, goal = 'conquer') {
  const a = NATIONS[attackerId];
  const b = NATIONS[defenderId];
  if (!a || !b || a.failedState || b.failedState) return false;
  if (hasActiveTruce(attackerId, defenderId)) return false;

  const readinessProfile = getNationWarReadinessProfile(a, b, goal);
  if (readinessProfile.hardBlocked || readinessProfile.overallCoverage < 0.58) {
    registerWarMobilizationCrisis(attackerId, defenderId, readinessProfile, 'declare_war_blocked');
    return false;
  }
  
  // Check not already in conflict
  if (GAME.conflicts.some(c => (c.a === attackerId && c.b === defenderId) || (c.a === defenderId && c.b === attackerId))) return false;
  
  const key = relationshipKey(attackerId, defenderId);
  
  const conflict = initConflictTemplate();
  conflict.key = key;
  conflict.a = attackerId;
  conflict.b = defenderId;
  conflict.type = severity >= 7 ? 'invasion' : 'war';
  conflict.severity = clamp(severity, 4, 10);
  conflict.startTurn = GAME.turn;
  conflict.startDate = new Date(GAME.date);
  conflict.aGoal = goal;
  conflict.bGoal = 'defend';
  conflict.aMobilization = severity >= 7 ? 80 : severity >= 4 ? 50 : 20;
  conflict.bMobilization = 50;
  
  GAME.conflicts.push(conflict);

  const crises = ensureWarMobilizationState();
  delete crises[getWarCrisisKey(attackerId, defenderId)];
  
  // Trigger alliance chain reactions
  triggerAllianceReactions(attackerId, defenderId, severity);
  
  // Economic shock
  a.stockMarket = clamp((a.stockMarket || 100) - severity * 3, 15, 240);
  b.stockMarket = clamp((b.stockMarket || 100) - severity * 4, 15, 240);
  
  addNews(`⚔️ WAR DECLARED: ${a.name} declares ${conflict.type} on ${b.name}! (Severity: ${severity}/10)`, 'major');
  
  return true;
}

// ============================================================
// ALLIANCE CHAIN REACTION
// ============================================================

function triggerAllianceReactions(attackerId, defenderId, severity = 5) {
  // Defender's allies may join
  GAME.alliances.forEach(al => {
    if (al.a === defenderId || al.b === defenderId) {
      const allyId = al.a === defenderId ? al.b : al.a;
      const ally = NATIONS[allyId];
      if (!ally || ally.failedState) return;
      
      const rel = typeof getRelationBetween === 'function'
        ? getRelationBetween(allyId, defenderId)
        : (typeof getRelation === 'function' ? getRelation(defenderId) : 0);
      // 60% chance allies join
      if (rel > 10 || Math.random() < 0.6) {
        const existing = GAME.conflicts.some(c => (c.a === allyId && c.b === attackerId) || (c.b === allyId && c.a === attackerId));
        if (!existing) {
          declareWar(allyId, attackerId, clamp(severity - 1, 1, 10), 'defend');
          addNews(`🤝 ${ally.name} joins war in defense of their ally ${NATIONS[defenderId]?.name}!`, 'major');
        }
      }
    }
  });
  
  // Attacker's allies may opportunistically join
  GAME.alliances.forEach(al => {
    if (al.a === attackerId || al.b === attackerId) {
      const allyId = al.a === attackerId ? al.b : al.a;
      const ally = NATIONS[allyId];
      if (!ally || ally.failedState) return;
      
      const existing = GAME.conflicts.some(c => (c.a === allyId && c.b === defenderId) || (c.b === allyId && c.a === defenderId));
      if (!existing && Math.random() < 0.25) {
        declareWar(allyId, defenderId, clamp(severity - 1, 1, 10), 'conquer');
        addNews(`🤝 ${ally.name} joins war alongside their ally ${NATIONS[attackerId]?.name}!`, 'major');
      }
    }
  });
}

// ============================================================
// INTELLIGENCE / SPY SYSTEM
// ============================================================

function generateIntelReport(nationId, targetId) {
  const nation = NATIONS[nationId];
  const target = NATIONS[targetId];
  if (!nation || !target) return null;
  
  const intelBudget = (nation.aiBudget?.intelligence || 10) / 100;
  const gov = getGovernmentProfile(nation.governmentStyle);
  const intelQuality = clamp(intelBudget * 0.7 + (gov.innovationBoost || 1) * 0.3 + (nation.techLevel || 1) * 0.05 - Math.random() * 0.3, 0.1, 0.95);
  
  // Accuracy: high intel quality = more accurate
  const errorMargin = (1 - intelQuality) * 0.4;
  
  const actualMilPower = target.militaryPower || 50;
  const reportedMilPower = Math.round(actualMilPower * (1 + (Math.random() - 0.5) * errorMargin));
  
  const actualReadiness = target.militaryForces?.readiness || 50;
  const reportedReadiness = Math.round(actualReadiness * (1 + (Math.random() - 0.5) * errorMargin));
  
  const actualTroops = (target.militaryForces?.activePersonnel || 0.1) * 1000000;
  const reportedTroops = Math.round(actualTroops * (1 + (Math.random() - 0.5) * errorMargin));
  
  const stability = target.stability || 50;
  const treasury = target.treasury || 0;
  const recessionMonths = target.recessionMonths || 0;
  
  // Detect border buildup
  const borderBuildup = Math.random() < 0.3 ? Math.floor(Math.random() * 100) : 0;
  
  const report = {
    date: new Date(GAME.date),
    turn: GAME.turn,
    targetId,
    reportedMilPower,
    reportedReadiness,
    reportedTroops,
    stabilityDetected: Math.round(stability * (1 + (Math.random() - 0.5) * errorMargin)),
    treasuryDetected: Math.round(treasury * (1 + (Math.random() - 0.5) * errorMargin * 0.5)),
    recessionDetected: Math.round(recessionMonths * (1 + (Math.random() - 0.5) * errorMargin)),
    borderBuildup,
    intelQuality: Math.round(intelQuality * 100),
    accuracy: Math.round((1 - errorMargin) * 100),
    isOutdated: false,
  };
  
  return report;
}

// ============================================================
// GENERALS SYSTEM
// ============================================================

function generateGeneral(nationId) {
  const archetypeKeys = Object.keys(GENERAL_ARCHETYPES);
  const archetype = archetypeKeys[Math.floor(Math.random() * archetypeKeys.length)];
  const stats = GENERAL_ARCHETYPES[archetype];
  
  const firstNames = ['James', 'Alex', 'Marcus', 'Dmitri', 'Wei', 'Hassan', 'Carlos', 'Pierre', 'Yuki', 'Ahmed', 'Ivan', 'Soren', 'Kwame', 'Rafael', 'Omar'];
  const lastNames = ['Stone', 'Blackwood', 'Kane', 'Volkov', 'Chen', 'Rashid', 'Silva', 'Moreau', 'Tanaka', 'Al-Farsi', 'Petrov', 'Lund', 'Osei', 'Garcia', 'Nasser'];
  
  return {
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    nationId,
    archetype,
    strategy: stats.strategy + Math.floor(Math.random() * 10 - 5),
    intelligence: stats.intelligence + Math.floor(Math.random() * 10 - 5),
    aggression: stats.aggression + Math.floor(Math.random() * 10 - 5),
    defense: stats.defense + Math.floor(Math.random() * 10 - 5),
    logistics: stats.logistics + Math.floor(Math.random() * 10 - 5),
    morale: stats.morale + Math.floor(Math.random() * 10 - 5),
    desc: stats.desc,
    battlesWon: 0,
    battlesLost: 0,
    casualtiesCaused: 0,
    casualtiesSuffered: 0,
    isAlive: true,
  };
}

function assignGeneralsToNation(nationId) {
  const nation = NATIONS[nationId];
  if (!nation) return;
  if (!nation.generals) nation.generals = [];
  const numGenerals = Math.max(1, Math.floor((nation.militaryPower || 50) / 20));
  while (nation.generals.length < numGenerals) {
    nation.generals.push(generateGeneral(nationId));
  }
}

function pickBestGeneral(nationId, need) {
  const nation = NATIONS[nationId];
  if (!nation || !nation.generals || nation.generals.length === 0) {
    assignGeneralsToNation(nationId);
  }
  const alive = (nation.generals || []).filter(g => g.isAlive);
  if (alive.length === 0) return null;
  
  if (need === 'offense') alive.sort((a, b) => (b.strategy + b.aggression) - (a.strategy + a.aggression));
  else if (need === 'defense') alive.sort((a, b) => (b.defense + b.logistics) - (a.defense + a.logistics));
  else alive.sort((a, b) => (b.intelligence + b.strategy) - (a.intelligence + a.strategy));
  
  return alive[0];
}

// ============================================================
// BATTLE RESOLUTION
// ============================================================

function resolveBattle(conflict) {
  const a = NATIONS[conflict.a];
  const b = NATIONS[conflict.b];
  if (!a || !b) return;
  if (!a.militaryForces && typeof initNationMilitaryForces === 'function') initNationMilitaryForces(a);
  if (!b.militaryForces && typeof initNationMilitaryForces === 'function') initNationMilitaryForces(b);
  
  // Get generals
  assignGeneralsToNation(conflict.a);
  assignGeneralsToNation(conflict.b);
  
  const aGen = pickBestGeneral(conflict.a, conflict.aGoal === 'defend' ? 'defense' : 'offense');
  const bGen = pickBestGeneral(conflict.b, 'defense');
  
  // Calculate combat power
  const aMil = a.militaryPower || 50;
  const bMil = b.militaryPower || 50;
  const aMob = conflict.aMobilization / 100;
  const bMob = conflict.bMobilization / 100;
  const aActivePersonnel = Number(a.militaryForces?.activePersonnel || 0.1);
  const bActivePersonnel = Number(b.militaryForces?.activePersonnel || 0.1);
  const aReservePersonnel = Number(a.militaryForces?.reservePersonnel || 0);
  const bReservePersonnel = Number(b.militaryForces?.reservePersonnel || 0);
  const aTraining = Number(a.militaryForces?.trainingQuality || 50);
  const bTraining = Number(b.militaryForces?.trainingQuality || 50);
  
  // General bonuses
  const aGenBonus = aGen ? (aGen.strategy * 0.3 + aGen.intelligence * 0.2 + (conflict.aGoal === 'defend' ? aGen.defense : aGen.aggression) * 0.3 + aGen.morale * 0.2) / 100 : 0.5;
  const bGenBonus = bGen ? (bGen.strategy * 0.3 + bGen.intelligence * 0.2 + bGen.defense * 0.3 + bGen.morale * 0.2) / 100 : 0.5;
  
  // Tech advantage
  const techAdvantage = (a.techLevel || 1) - (b.techLevel || 1);
  
  // Exhaustion penalty
  const aExhaustionPenalty = conflict.aExhaustion * 0.005;
  const bExhaustionPenalty = conflict.bExhaustion * 0.005;
  
  // Economy support
  const aEconSupport = (a.gdp || 0.1) * 0.05;
  const bEconSupport = (b.gdp || 0.1) * 0.05;
  const aEquipSupport = getActiveEquipmentPower(a) * 0.01;
  const bEquipSupport = getActiveEquipmentPower(b) * 0.01;
  const aTroopSupport = (aActivePersonnel * (8 + aTraining * 0.07) + aReservePersonnel * (1.6 + aTraining * 0.015)) * (0.55 + aMob * 0.65);
  const bTroopSupport = (bActivePersonnel * (8 + bTraining * 0.07) + bReservePersonnel * (1.6 + bTraining * 0.015)) * (0.55 + bMob * 0.65);
  
  // Random
  const randomness = 0.5 + Math.random();
  
  // Final power
  const aPower = ((aMil * 0.55 + aTroopSupport) * aGenBonus + aEconSupport + aEquipSupport) * (1 - aExhaustionPenalty) * (1 + techAdvantage * 0.02) * randomness;
  const bPower = ((bMil * 0.55 + bTroopSupport) * bGenBonus + bEconSupport + bEquipSupport) * (1 - bExhaustionPenalty) * (1 - techAdvantage * 0.02) * randomness;
  
  const totalPower = aPower + bPower;
  const aWinChance = totalPower > 0 ? aPower / totalPower : 0.5;
  
  // Determine outcome
  let result;
  if (aWinChance > 0.65) result = 'a_victory';
  else if (aWinChance < 0.35) result = 'b_victory';
  else result = 'stalemate';
  
  // Calculate casualties
  const battleIntensity = conflict.severity / 10;
  const baseCasualties = 500 + Math.floor(Math.random() * 2000 * battleIntensity);
  const aTroops = aActivePersonnel * 1000000;
  const bTroops = bActivePersonnel * 1000000;
  
  let aCas, bCas;
  if (result === 'a_victory') {
    aCas = Math.floor(baseCasualties * (0.3 + Math.random() * 0.3) * (aGen?.intelligence ? (1 - aGen.intelligence * 0.004) : 1));
    bCas = Math.floor(baseCasualties * (1.5 + Math.random() * 1.5) * (bGen ? (1 + (100 - bGen.defense) * 0.005) : 1.5));
    conflict.frontShift -= 1 + Math.random() * 2;
    conflict.currentFront = 'a_advancing';
    if (aGen) aGen.battlesWon++;
    if (bGen) bGen.battlesLost++;
  } else if (result === 'b_victory') {
    bCas = Math.floor(baseCasualties * (0.3 + Math.random() * 0.3) * (bGen?.intelligence ? (1 - bGen.intelligence * 0.004) : 1));
    aCas = Math.floor(baseCasualties * (1.5 + Math.random() * 1.5) * (aGen ? (1 + (100 - aGen.defense) * 0.005) : 1.5));
    conflict.frontShift += 1 + Math.random() * 2;
    conflict.currentFront = 'b_advancing';
    if (bGen) bGen.battlesWon++;
    if (aGen) aGen.battlesLost++;
  } else {
    aCas = Math.floor(baseCasualties * (0.8 + Math.random() * 0.4));
    bCas = Math.floor(baseCasualties * (0.8 + Math.random() * 0.4));
    conflict.currentFront = 'stalemate';
  }
  
  // Cap casualties to available troops
  aCas = Math.min(aCas, Math.floor(aTroops * 0.05));
  bCas = Math.min(bCas, Math.floor(bTroops * 0.05));
  
  // Track casualties
  conflict.casualties.a_military += aCas;
  conflict.casualties.b_military += bCas;
  conflict.casualties.a_civilian += Math.floor(aCas * (0.2 + Math.random() * 0.5));
  conflict.casualties.b_civilian += Math.floor(bCas * (0.2 + Math.random() * 0.5));
  conflict.casualties.a_wounded += Math.floor(aCas * 2);
  conflict.casualties.b_wounded += Math.floor(bCas * 2);
  
  if (aGen) aGen.casualtiesCaused += bCas;
  if (bGen) bGen.casualtiesCaused += aCas;
  if (aGen) aGen.casualtiesSuffered += aCas;
  if (bGen) bGen.casualtiesSuffered += bCas;
  
  // Reduce nation troops
  a.militaryForces.activePersonnel = clamp((a.militaryForces.activePersonnel || 0.1) - aCas / 1000000, 0.001, 100);
  b.militaryForces.activePersonnel = clamp((b.militaryForces.activePersonnel || 0.1) - bCas / 1000000, 0.001, 100);
  
  // Increase exhaustion
  conflict.aExhaustion = clamp(conflict.aExhaustion + 1 + battleIntensity * 2 + (result === 'a_victory' ? 0.5 : 2), 0, 100);
  conflict.bExhaustion = clamp(conflict.bExhaustion + 1 + battleIntensity * 2 + (result === 'b_victory' ? 0.5 : 2), 0, 100);
  
  // Equipment losses
  const aEquipLoss = Math.floor(10 + Math.random() * 50 * battleIntensity);
  const bEquipLoss = Math.floor(10 + Math.random() * 50 * battleIntensity);
  const aRemoved = applyBattleEquipmentLosses(a, aEquipLoss);
  const bRemoved = applyBattleEquipmentLosses(b, bEquipLoss);
  if (!conflict.equipmentLost.a.byType) conflict.equipmentLost.a.byType = {};
  if (!conflict.equipmentLost.b.byType) conflict.equipmentLost.b.byType = {};
  conflict.equipmentLost.a.total += aRemoved.total;
  conflict.equipmentLost.b.total += bRemoved.total;
  Object.keys(aRemoved.byType).forEach((k) => {
    conflict.equipmentLost.a.byType[k] = (conflict.equipmentLost.a.byType[k] || 0) + aRemoved.byType[k];
  });
  Object.keys(bRemoved.byType).forEach((k) => {
    conflict.equipmentLost.b.byType[k] = (conflict.equipmentLost.b.byType[k] || 0) + bRemoved.byType[k];
  });
  
  const battleRecord = {
    turn: GAME.turn,
    result,
    aPower: Math.round(aPower),
    bPower: Math.round(bPower),
    aCasualties: aCas,
    bCasualties: bCas,
    aGeneral: aGen?.name || 'Unknown',
    bGeneral: bGen?.name || 'Unknown',
    frontLine: conflict.frontShift,
  };
  conflict.battles.push(battleRecord);
  if (conflict.battles.length > 20) conflict.battles.shift();
  
  return battleRecord;
}

// ============================================================
// WAR ECONOMIC EFFECTS
// ============================================================

function applyWarEconomicEffects(conflict) {
  const a = NATIONS[conflict.a];
  const b = NATIONS[conflict.b];
  if (!a || !b) return;
  
  const severity = conflict.severity / 10;
  const warDuration = conflict.turn;
  
  // GDP decline
  const gdpDamage = 0.002 + severity * 0.003 + warDuration * 0.0005;
  a.gdp = clamp(a.gdp * (1 - gdpDamage), 0.02, 140);
  b.gdp = clamp(b.gdp * (1 - gdpDamage * 1.2), 0.02, 140); // defender takes more economic damage
  
  conflict.economicDamage.a += a.gdp * gdpDamage;
  conflict.economicDamage.b += b.gdp * gdpDamage * 1.2;
  
  // Inflation spike
  a.inflation = clamp((a.inflation || 4) + 0.3 * severity + warDuration * 0.02, 0.2, 45);
  b.inflation = clamp((b.inflation || 4) + 0.5 * severity + warDuration * 0.03, 0.2, 45);
  
  // Stability drops
  a.stability = clamp((a.stability || 50) - 0.3 * severity - (conflict.casualties.a_military / 10000) * 0.01, 1, 100);
  b.stability = clamp((b.stability || 50) - 0.4 * severity - (conflict.casualties.b_military / 10000) * 0.01, 1, 100);
  
  // Employment drops (war production partially offsets)
  a.jobs = clamp((a.jobs || 50) - 0.2 * severity + 0.1, 1, 100);
  b.jobs = clamp((b.jobs || 50) - 0.3 * severity + 0.1, 1, 100);
  
  // Factories shift to war production
  a.factories = clamp((a.factories || 50) - 0.1 * severity, 1, 100);
  b.factories = clamp((b.factories || 50) - 0.15 * severity, 1, 100);
  
  // Happiness decline
  a.happiness = clamp((a.happiness || 50) - 0.4 * severity - (conflict.casualties.a_military / 10000) * 0.02, 1, 100);
  b.happiness = clamp((b.happiness || 50) - 0.5 * severity - (conflict.casualties.b_military / 10000) * 0.02, 1, 100);
  
  // Treasury drain per nation
  const aNation = NATIONS[conflict.a];
  const bNation = NATIONS[conflict.b];
  const aMonthlySpend = severity * 15 + warDuration * 2;
  const bMonthlySpend = severity * 18 + warDuration * 3;
  if (aNation) aNation.treasury = Math.max(0, (aNation.treasury || 0) - aMonthlySpend);
  if (bNation) bNation.treasury = Math.max(0, (bNation.treasury || 0) - bMonthlySpend);
  conflict.moneySpent.a += aMonthlySpend;
  conflict.moneySpent.b += bMonthlySpend;
  
  // Defense spending tracking
  if (aNation) aNation.defenseSpending = (aNation.defenseSpending || 0) + severity * 20 + warDuration * 3;
  if (bNation) bNation.defenseSpending = (bNation.defenseSpending || 0) + severity * 25 + warDuration * 4;
  
  // Market impact
  a.stockMarket = clamp((a.stockMarket || 100) - severity * 0.5, 15, 240);
  b.stockMarket = clamp((b.stockMarket || 100) - severity * 0.8, 15, 240);
  
  // Global market shock for big wars
  if (conflict.severity >= 6) {
    GAME.globalMarketIndex = clamp((GAME.globalMarketIndex || 100) - severity * 0.3, 20, 200);
  }
}

// ============================================================
// WAR ESCALATION
// ============================================================

function escalateConflict(conflict) {
  if (conflict.severity >= 10) return;
  
  const a = NATIONS[conflict.a];
  const b = NATIONS[conflict.b];
  if (!a || !b) return;
  
  const aAggression = getAggressionScore(a);
  const bAggression = getAggressionScore(b);
  
  const escalationChance = 0.05 + (aAggression + bAggression) * 0.03 + conflict.turn * 0.002;
  
  if (Math.random() < escalationChance) {
    conflict.severity = clamp(conflict.severity + 1, 1, 10);
    conflict.aMobilization = clamp(conflict.aMobilization + 10, 0, 100);
    conflict.bMobilization = clamp(conflict.bMobilization + 10, 0, 100);
    conflict.lastEscalationTurn = GAME.turn;
    
    addNews(`⚠️ ${NATIONS[conflict.a]?.name} vs ${NATIONS[conflict.b]?.name}: War escalates to severity ${conflict.severity}/10!`, 'major');
    
    // At severity 10, trigger total mobilization
    if (conflict.severity === 10) {
      addNews(`💀 TOTAL WAR: ${NATIONS[conflict.a]?.name} and ${NATIONS[conflict.b]?.name} are now fully mobilized!`, 'critical');
    }
  }
}

// ============================================================
// CEASEFIRE / PEACE SYSTEM
// ============================================================

function requestCeasefire(conflict) {
  const a = NATIONS[conflict.a];
  const b = NATIONS[conflict.b];
  if (!a || !b) return false;
  
  const aDesperation = getDesperationScore(a);
  const bDesperation = getDesperationScore(b);
  const aAggression = getAggressionScore(a);
  const bAggression = getAggressionScore(b);
  
  // Exhaustion + desperation drives peace
  const aPeaceDesire = (conflict.aExhaustion / 100) * 0.5 + aDesperation * 0.5 - aAggression * 0.3;
  const bPeaceDesire = (conflict.bExhaustion / 100) * 0.5 + bDesperation * 0.5 - bAggression * 0.3;
  
  // If either side is far ahead, they won't seek peace
  const frontAdvantage = Math.abs(conflict.frontShift);
  if (frontAdvantage > 3 && conflict.currentFront !== 'stalemate') return false;
  
  const ceasefireThreshold = 0.38; // Peace desire over this = ceasefire
  
  if (aPeaceDesire > ceasefireThreshold && bPeaceDesire > ceasefireThreshold) {
    conflict.phase = 'ceasefire';
    conflict.ceasefireTurns = 0;
    conflict.ceasefireDuration = Math.floor(3 + Math.random() * 6);
    addNews(`🕊️ CEASEFIRE: ${a.name} and ${b.name} agree to a ceasefire (${conflict.ceasefireDuration} turns)`, 'major');
    return true;
  }
  return false;
}

function attemptPeace(conflict) {
  if (conflict.phase !== 'ceasefire') return false;
  conflict.ceasefireTurns++;
  
  // Peace negotiation
  const aDesperation = getDesperationScore(NATIONS[conflict.a]);
  const bDesperation = getDesperationScore(NATIONS[conflict.b]);
  const aExhausted = conflict.aExhaustion > 60;
  const bExhausted = conflict.bExhaustion > 60;
  
  const peaceChance = 0.15 + (aDesperation + bDesperation) * 0.1 + (aExhausted ? 0.2 : 0) + (bExhausted ? 0.2 : 0);
  
  if (Math.random() < peaceChance || conflict.ceasefireTurns >= conflict.ceasefireDuration) {
    const a = NATIONS[conflict.a];
    const b = NATIONS[conflict.b];
    conflict.phase = 'peace';
    conflict.peaceTurns = 0;
    
    // Determine winner based on frontShift and casualties
    let winner = null;
    if (conflict.frontShift < -3) winner = conflict.a;
    else if (conflict.frontShift > 3) winner = conflict.b;
    else if (conflict.casualties.a_military > conflict.casualties.b_military * 1.5) winner = conflict.b;
    else if (conflict.casualties.b_military > conflict.casualties.a_military * 1.5) winner = conflict.a;
    
    if (winner) {
      const winnerNation = NATIONS[winner];
      const loserNation = winner === conflict.a ? NATIONS[conflict.b] : NATIONS[conflict.a];
      addNews(`🏆 PEACE: ${winnerNation?.name} wins the war against ${loserNation?.name}! Estimated ${(conflict.casualties.a_military + conflict.casualties.b_military).toLocaleString()} total casualties.`, 'major');
      
      // Winner gets GDP boost, loser penalty
      if (winnerNation) winnerNation.gdp = clamp((winnerNation.gdp || 1) * 1.005, 0.02, 140);
      if (loserNation) loserNation.gdp = clamp((loserNation.gdp || 1) * 0.98, 0.02, 140);
      applyWarDealsAndTruce(conflict, winner);
  } else {
      addNews(`🤝 STALEMATE: ${NATIONS[conflict.a]?.name} and ${NATIONS[conflict.b]?.name} sign a peace treaty after ${conflict.turn} turns.`, 'major');
      createTruce(conflict.a, conflict.b, 10 + conflict.severity, 'stalemate');
      conflict.winner = null;
      conflict.endReason = 'stalemate';
    }
    
    // Post-war recovery
    if (a) {
      a.stability = clamp((a.stability || 50) + 5, 1, 100);
      a.happiness = clamp((a.happiness || 50) + (winner === conflict.a ? 8 : 2), 1, 100);
    }
    if (b) {
      b.stability = clamp((b.stability || 50) + 5, 1, 100);
      b.happiness = clamp((b.happiness || 50) + (winner === conflict.b ? 8 : 2), 1, 100);
    }
    
    return true;
  }
  return false;
}

// ============================================================
// MAIN PROCESSOR - CALLED EVERY TURN
// ============================================================

function processAllWars() {
  // Ensure GAME.conflicts is an array
  if (!GAME.conflicts) GAME.conflicts = [];
  processTruceDecay();
  processWarMobilizationCrises();
  
  const finishedConflicts = [];

  const normalizeLegacyConflict = (conflict) => {
    if (!conflict || conflict.type) return conflict;
    if (!conflict.a || !conflict.b) return null;

    conflict.key = conflict.key || relationshipKey(conflict.a, conflict.b);
    conflict.type = 'war';
    conflict.severity = clamp(Math.round((conflict.intensity || 45) / 10), 1, 10);
    conflict.startTurn = Number.isFinite(conflict.startTurn) ? conflict.startTurn : GAME.turn;
    conflict.startDate = conflict.startDate || new Date(GAME.date);
    conflict.turn = Number.isFinite(conflict.duration) ? conflict.duration : (Number.isFinite(conflict.turn) ? conflict.turn : 0);
    conflict.phase = conflict.phase || 'active';
    conflict.ceasefireTurns = Number.isFinite(conflict.ceasefireTurns) ? conflict.ceasefireTurns : 0;
    conflict.ceasefireDuration = Number.isFinite(conflict.ceasefireDuration) ? conflict.ceasefireDuration : 0;
    conflict.peaceTurns = Number.isFinite(conflict.peaceTurns) ? conflict.peaceTurns : 0;
    conflict.battles = Array.isArray(conflict.battles) ? conflict.battles : [];
    conflict.currentFront = conflict.currentFront || 'stalemate';
    conflict.frontShift = Number.isFinite(conflict.frontShift) ? conflict.frontShift : 0;
    conflict.casualties = conflict.casualties || { a_military: 0, b_military: 0, a_civilian: 0, b_civilian: 0, a_wounded: 0, b_wounded: 0 };
    conflict.equipmentLost = conflict.equipmentLost || { a: { total: 0 }, b: { total: 0 } };
    if (!conflict.equipmentLost.a.byType) conflict.equipmentLost.a.byType = {};
    if (!conflict.equipmentLost.b.byType) conflict.equipmentLost.b.byType = {};
    conflict.aExhaustion = Number.isFinite(conflict.aExhaustion) ? conflict.aExhaustion : 0;
    conflict.bExhaustion = Number.isFinite(conflict.bExhaustion) ? conflict.bExhaustion : 0;
    conflict.economicDamage = conflict.economicDamage || { a: 0, b: 0 };
    conflict.moneySpent = conflict.moneySpent || { a: 0, b: 0 };
    conflict.aMobilization = Number.isFinite(conflict.aMobilization) ? conflict.aMobilization : 50;
    conflict.bMobilization = Number.isFinite(conflict.bMobilization) ? conflict.bMobilization : 50;
    conflict.aGoal = conflict.aGoal || 'defend';
    conflict.bGoal = conflict.bGoal || 'defend';
    conflict.lastEscalationTurn = Number.isFinite(conflict.lastEscalationTurn) ? conflict.lastEscalationTurn : GAME.turn;
    conflict.warDeals = Array.isArray(conflict.warDeals) ? conflict.warDeals : [];
    if (conflict.winner === undefined) conflict.winner = null;
    if (!conflict.endReason) conflict.endReason = null;
    return conflict;
  };
  
  for (let i = GAME.conflicts.length - 1; i >= 0; i--) {
    const conflict = normalizeLegacyConflict(GAME.conflicts[i]);
    if (!conflict) continue;
    
    conflict.turn++;
    
    if (conflict.phase === 'peace') {
      conflict.peaceTurns = (conflict.peaceTurns || 0) + 1;
      if (conflict.peaceTurns > 6) {
        finishedConflicts.push(i);
      }
      continue;
    }
    
    if (conflict.phase === 'ceasefire') {
      const madePeace = attemptPeace(conflict);
      if (madePeace) continue;
      
      // Ceasefire broke
      if (conflict.ceasefireTurns >= conflict.ceasefireDuration) {
        conflict.phase = 'active';
        conflict.ceasefireTurns = 0;
        addNews(`💥 CEASEFIRE BROKEN: ${NATIONS[conflict.a]?.name} and ${NATIONS[conflict.b]?.name} resume hostilities!`, 'major');
      }
      continue;
    }
    
    // Active war processing
    
    // 1. Resolve battle (not every turn — battle frequency depends on severity)
    const battleFrequency = conflict.severity >= 7 ? 0.7 : conflict.severity >= 4 ? 0.5 : 0.3;
    if (Math.random() < battleFrequency) {
      resolveBattle(conflict);
    }
    
    // 2. Apply economic effects
    applyWarEconomicEffects(conflict);

    // 2.5. Wartime procurement and industrial mobilization
    const severity = conflict.severity / 10;
    triggerWarProcurement(NATIONS[conflict.a], severity);
    triggerWarProcurement(NATIONS[conflict.b], severity);
    
    // 3. Escalation
    if (GAME.turn - conflict.lastEscalationTurn > 3) {
      escalateConflict(conflict);
    }

    // 3.5. Great-power mediation attempts in prolonged wars
    if (conflict.turn > 4 && Math.random() < 0.12) {
      attemptGreatPowerMediation(conflict);
    }
    
    // 4. Check for ceasefire
    if (conflict.turn > 3 && Math.random() < 0.1) {
      requestCeasefire(conflict);
    }

    // 4.5. Surrender checks in prolonged decisive wars
    if (trySurrender(conflict)) {
      continue;
    }
    
    // 5. Check for AI war exhaustion / peace
    const aExhausted = conflict.aExhaustion > 75;
    const bExhausted = conflict.bExhaustion > 75;
    const aStability = NATIONS[conflict.a]?.stability || 50;
    const bStability = NATIONS[conflict.b]?.stability || 50;
    
    if ((aExhausted || aStability < 20) && (bExhausted || bStability < 20) && conflict.turn > 5) {
      requestCeasefire(conflict);
    }
  }
  
  // Remove finished conflicts (indexes stored in reverse order)
  for (const idx of finishedConflicts.sort((a, b) => b - a)) {
    archiveConflict(GAME.conflicts[idx]);
    GAME.conflicts.splice(idx, 1);
  }
}

// ============================================================
// AI WAR DECISIONS (runs periodically for all nations)
// ============================================================

function processAIWarDecisions() {
  // Every 3-5 turns, consider going to war
  if (!GAME.turn || GAME.turn % (3 + Math.floor(Math.random() * 3)) !== 0) return;
  
  const nationIds = Object.keys(NATIONS).filter(id => {
    const n = NATIONS[id];
    return n && !n.failedState && !n.inCrisis;
  });
  
  // Shuffle to randomize AI decisions
  const shuffled = [...nationIds].sort(() => Math.random() - 0.5);
  
  // Try up to 2 war declarations per cycle
  let warsDeclared = 0;
  
  for (const attackerId of shuffled) {
    if (warsDeclared >= 2) break;
    
    // Find a valid target
    const potentialTargets = nationIds.filter(targetId => {
      if (targetId === attackerId) return false;
      if (hasActiveTruce(attackerId, targetId)) return false;
      // Don't attack allies
      if (GAME.alliances?.some(al => (al.a === attackerId && al.b === targetId) || (al.b === attackerId && al.a === targetId))) return false;
      // Not already at war
      if (GAME.conflicts?.some(c => (c.a === attackerId && c.b === targetId) || (c.a === targetId && c.b === attackerId))) return false;
      return true;
    });
    
    if (potentialTargets.length === 0) continue;
    
    // Pick a random target and evaluate
    const defenderId = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
    const evalResult = evaluateWarDecision(attackerId, defenderId);
    
    if (evalResult.decision === 'attack') {
      // Severity range 2-7: allows small border skirmishes up to serious wars
      const severity = Math.floor(2 + Math.random() * 6);
      const goal = Math.random() < 0.3 ? 'annex' : Math.random() < 0.5 ? 'conquer' : 'punish';
      if (declareWar(attackerId, defenderId, severity, goal)) {
        warsDeclared++;
      }
    } else if (evalResult.decision === 'crisis') {
      registerWarMobilizationCrisis(attackerId, defenderId, evalResult.readiness, evalResult.reason || 'insufficient_readiness');
    } else if (evalResult.decision === 'provoke' && Math.random() < 0.4) {
      // Diplomatic pressure instead of border skirmish warfare
      if (typeof getRelationBetween === 'function') {
        const rel = getRelationBetween(attackerId, defenderId);
        const key = relationshipKey(attackerId, defenderId);
        if (!GAME.bilateralRelations) GAME.bilateralRelations = {};
        GAME.bilateralRelations[key] = clamp(rel - 4, -100, 100);
      }
      addNews(`🧭 DIPLOMATIC CRISIS: ${NATIONS[attackerId]?.name} escalates pressure on ${NATIONS[defenderId]?.name}, but war is avoided for now.`, 'minor');
    }
  }
}

// ============================================================
// INIT WARS FOR NEW GAME
// ============================================================

function initWarSystem() {
  if (!GAME.conflicts) GAME.conflicts = [];
  if (!GAME.truces) GAME.truces = {};
  
  // Randomly generate 1-3 initial low-level conflicts
  const numInitialConflicts = Math.floor(1 + Math.random() * 3);
  const nationIds = Object.keys(NATIONS).filter(id => {
    const n = NATIONS[id];
    return n && !n.failedState && n.militaryPower > 25;
  });
  
  for (let i = 0; i < numInitialConflicts && nationIds.length >= 2; i++) {
    // Pick two random nations that aren't already in conflict
    const idx1 = Math.floor(Math.random() * nationIds.length);
    const id1 = nationIds.splice(idx1, 1)[0];
    const idx2 = Math.floor(Math.random() * nationIds.length);
    const id2 = nationIds.splice(idx2, 1)[0];
    
    if (id1 && id2) {
      // Start at lower severity (2-5) so initial wars don't immediately devastate economies
      declareWar(id1, id2, 2 + Math.floor(Math.random() * 4), Math.random() < 0.5 ? 'conquer' : 'punish');
    }
  }
}

// ============================================================
// RENDER: WAR & CONFLICT UI (for game interface integration)
// ============================================================

function renderConflictSummary(conflict) {
  const a = NATIONS[conflict.a];
  const b = NATIONS[conflict.b];
  if (!a || !b) return '<div class="war-card invalid">Invalid conflict data</div>';

  const totalCasualties = (conflict.casualties?.a_military || 0) + (conflict.casualties?.b_military || 0);
  const totalCivCasualties = (conflict.casualties?.a_civilian || 0) + (conflict.casualties?.b_civilian || 0);
  const chances = estimateWinChances(conflict);
  const aLostTypes = summarizeLossTypes(conflict.equipmentLost?.a?.byType || {});
  const bLostTypes = summarizeLossTypes(conflict.equipmentLost?.b?.byType || {});

  return `
    <div class="war-card ${conflict.phase}">
      <div class="war-card-header">
        <span class="war-type-badge">${conflict.type.toUpperCase()}</span>
        <span class="war-severity">Severity: ${conflict.severity}/10</span>
        <span class="war-phase">${conflict.phase.toUpperCase()}</span>
      </div>
      <div class="war-card-belligerents">
        <span class="belligerent ${conflict.frontShift < 0 ? 'winning' : ''}">${a.flag} ${a.name}</span>
        <span class="vs">vs</span>
        <span class="belligerent ${conflict.frontShift > 0 ? 'winning' : ''}">${b.flag} ${b.name}</span>
      </div>
      <div class="war-card-stats">
        <span>⚖️ Front: ${conflict.currentFront.replace('_', ' ')}</span>
        <span>🏁 Win Odds: ${a.name} ${chances.aPct}% • ${b.name} ${chances.bPct}%</span>
        <span>💀 Military: ${totalCasualties.toLocaleString()}</span>
        <span>👶 Civilian: ${totalCivCasualties.toLocaleString()}</span>
        <span>⏱️ Turn ${conflict.turn}</span>
        <span>💸 Spending: ${a.name} $${Math.round(conflict.moneySpent?.a || 0).toLocaleString()}M • ${b.name} $${Math.round(conflict.moneySpent?.b || 0).toLocaleString()}M</span>
        <span>🧨 Tanks/Arms Lost: ${a.name} ${(conflict.equipmentLost?.a?.total || 0).toLocaleString()} (${aLostTypes || 'n/a'})</span>
        <span>🧨 Tanks/Arms Lost: ${b.name} ${(conflict.equipmentLost?.b?.total || 0).toLocaleString()} (${bLostTypes || 'n/a'})</span>
      </div>
      <div class="war-card-exhaustion">
        <div class="exhaustion-bar"><label>${a.name} Exhaustion</label><div class="bar-bg"><div class="bar-fill" style="width:${conflict.aExhaustion}%"></div></div></div>
        <div class="exhaustion-bar"><label>${b.name} Exhaustion</label><div class="bar-bg"><div class="bar-fill" style="width:${conflict.bExhaustion}%"></div></div></div>
      </div>
    </div>
  `;
}

function renderAllConflicts() {
  if (!GAME.conflicts || GAME.conflicts.length === 0) {
    return '<div class="war-panel-empty">🌍 No active conflicts</div>';
  }
  return GAME.conflicts.map(c => renderConflictSummary(c)).join('');
}

function renderEndedWarCard(war) {
  const a = NATIONS[war.a];
  const b = NATIONS[war.b];
  const aName = a?.name || war.a;
  const bName = b?.name || war.b;
  const aFlag = a?.flag || '🏳️';
  const bFlag = b?.flag || '🏳️';
  const winnerName = war.winner ? (NATIONS[war.winner]?.name || war.winner) : 'No clear winner';
  const deals = (war.warDeals || []).length ? war.warDeals.join(', ') : 'none';
  const aLossTypes = summarizeLossTypes(war.equipmentLost?.a?.byType || {});
  const bLossTypes = summarizeLossTypes(war.equipmentLost?.b?.byType || {});

  return `
    <div class="war-card peace">
      <div class="war-card-header">
        <span class="war-type-badge">ENDED ${String(war.type || 'war').toUpperCase()}</span>
        <span class="war-phase">${String(war.endReason || 'peace').toUpperCase()}</span>
      </div>
      <div class="war-card-belligerents">
        <span class="belligerent">${aFlag} ${aName}</span>
        <span class="vs">vs</span>
        <span class="belligerent">${bFlag} ${bName}</span>
      </div>
      <div class="war-card-stats">
        <span>🏆 Winner: ${winnerName}</span>
        <span>⏱️ Duration: ${war.duration || 0} turns</span>
        <span>💀 Military: ${((war.casualties?.a_military || 0) + (war.casualties?.b_military || 0)).toLocaleString()}</span>
        <span>💸 Spending: ${aName} $${Math.round(war.moneySpent?.a || 0).toLocaleString()}M • ${bName} $${Math.round(war.moneySpent?.b || 0).toLocaleString()}M</span>
        <span>🧨 ${aName} lost ${(war.equipmentLost?.a?.total || 0).toLocaleString()} (${aLossTypes || 'n/a'})</span>
        <span>🧨 ${bName} lost ${(war.equipmentLost?.b?.total || 0).toLocaleString()} (${bLossTypes || 'n/a'})</span>
        <span>📜 War Deals: ${deals}</span>
      </div>
    </div>
  `;
}

function renderWarCommandTab() {
  ensureWarArchive();
  const active = GAME.conflicts || [];
  const ended = GAME.warHistory || [];

  return `
    <div class="tab-section">
      <h3>War Theater</h3>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Active Wars</span><span class="r-val ${active.length ? 'negative' : 'positive'}">${active.length}</span></div>
        <div class="resource-item"><span class="r-name">Ended Wars</span><span class="r-val">${ended.length}</span></div>
        <div class="resource-item"><span class="r-name">Active Truces</span><span class="r-val">${Object.keys(GAME.truces || {}).length}</span></div>
      </div>
    </div>
    <div class="tab-section">
      <h3>Active War Cards</h3>
      ${active.length ? active.map((c) => renderConflictSummary(c)).join('') : '<div class="section-card"><p class="empty">No active wars.</p></div>'}
    </div>
    <div class="tab-section">
      <h3>Ended War Cards</h3>
      ${ended.length ? ended.slice(0, 20).map((w) => renderEndedWarCard(w)).join('') : '<div class="section-card"><p class="empty">No ended wars archived yet.</p></div>'}
    </div>
  `;
}

// ============================================================
// EXPORT TO GLOBAL SCOPE
// ============================================================

window.GeneralArchetypes = GENERAL_ARCHETYPES;
window.initConflictTemplate = initConflictTemplate;
window.getWarScore = getWarScore;
window.getAggressionScore = getAggressionScore;
window.getDesperationScore = getDesperationScore;
window.evaluateWarDecision = evaluateWarDecision;
window.declareWar = declareWar;
window.triggerAllianceReactions = triggerAllianceReactions;
window.generateIntelReport = generateIntelReport;
window.generateGeneral = generateGeneral;
window.assignGeneralsToNation = assignGeneralsToNation;
window.pickBestGeneral = pickBestGeneral;
window.resolveBattle = resolveBattle;
window.applyWarEconomicEffects = applyWarEconomicEffects;
window.escalateConflict = escalateConflict;
window.requestCeasefire = requestCeasefire;
window.attemptPeace = attemptPeace;
window.processAllWars = processAllWars;
window.processAIWarDecisions = processAIWarDecisions;
window.initWarSystem = initWarSystem;
window.renderConflictSummary = renderConflictSummary;
window.renderAllConflicts = renderAllConflicts;
window.renderWarCommandTab = renderWarCommandTab;
