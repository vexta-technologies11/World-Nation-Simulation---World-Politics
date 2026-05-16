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
    type: 'war',                // 'war', 'border_skirmish', 'invasion', 'civil_war'
    severity: 5,                // 1-10 scale
    
    // Duration tracking
    startTurn: 0,
    startDate: null,
    turn: 0,
    
    // Current state
    phase: 'active',            // 'active', 'ceasefire', 'peace'
    ceasefireTurns: 0,
    ceasefireDuration: 0,
    
    // Battle tracking
    battles: [],
    currentFront: 'stalemate',  // 'a_advancing', 'b_advancing', 'stalemate', 'a_retreating', 'b_retreating'
    frontShift: 0,              // negative = pushes into A, positive = pushes into B
    
    // Casualties
    casualties: { a_military: 0, b_military: 0, a_civilian: 0, b_civilian: 0, a_wounded: 0, b_wounded: 0 },
    equipmentLost: { a: { total: 0 }, b: { total: 0 } },
    
    // Exhaustion
    aExhaustion: 0,             // 0-100
    bExhaustion: 0,
    
    // Economic damage inflicted so far (total GDP lost)
    economicDamage: { a: 0, b: 0 },
    
    // Mobilization levels (0-100, how much military deployed)
    aMobilization: 50,
    bMobilization: 50,
    
    // War goals
    aGoal: 'defend',            // 'defend', 'conquer', 'annex', 'liberate', 'punish'
    bGoal: 'defend',
    
    // Last escalation
    lastEscalationTurn: 0,
  };
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

function evaluateWarDecision(attackerId, defenderId) {
  const a = NATIONS[attackerId];
  const b = NATIONS[defenderId];
  if (!a || !b || a.failedState || b.failedState) return { decision: 'none', reason: 'invalid' };
  
  const aScore = getWarScore(a);
  const bScore = getWarScore(b);
  const aAggression = getAggressionScore(a);
  const aDesperation = getDesperationScore(a);
  
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
  
  // Calculate war desire
  let warDesire = aAggression * powerRatio * randomFactor;
  
  // Desperation can push nations to war (distraction) or peace
  if (aDesperation > 1 && aAggression > 0.6) warDesire += aDesperation * 0.5;
  else if (aDesperation > 1) warDesire -= aDesperation * 0.3; // desperate peaceful nations seek peace
  
  // Existing relations (getRelation only takes player's perspective, so approximate)
  const rel = typeof getRelation === 'function' ? getRelation(attackerId) : 0;
  warDesire -= rel * 0.005;
  
  // Border tension (random proxy)
  warDesire += (Math.random() - 0.5) * 0.3;
  
  // Check if already at war
  const alreadyAtWar = GAME.conflicts.some(c => (c.a === attackerId || c.b === attackerId));
  if (alreadyAtWar) warDesire *= 0.3;
  
  if (warDesire > 1.2 && powerRatio > 1.3) {
    return { decision: 'attack', reason: 'military_advantage', desire: warDesire };
  } else if (warDesire > 0.8) {
    return { decision: 'provoke', reason: 'aggressive_posture', desire: warDesire };
  }
  return { decision: 'peace', reason: 'no_interest', desire: warDesire };
}

// ============================================================
// DECLARE WAR
// ============================================================

function declareWar(attackerId, defenderId, severity = 5, goal = 'conquer') {
  const a = NATIONS[attackerId];
  const b = NATIONS[defenderId];
  if (!a || !b || a.failedState || b.failedState) return false;
  
  // Check not already in conflict
  if (GAME.conflicts.some(c => (c.a === attackerId && c.b === defenderId) || (c.a === defenderId && c.b === attackerId))) return false;
  
  const key = relationshipKey(attackerId, defenderId);
  
  const conflict = initConflictTemplate();
  conflict.key = key;
  conflict.a = attackerId;
  conflict.b = defenderId;
  conflict.type = severity >= 7 ? 'invasion' : severity >= 4 ? 'war' : 'border_skirmish';
  conflict.severity = clamp(severity, 1, 10);
  conflict.startTurn = GAME.turn;
  conflict.startDate = new Date(GAME.date);
  conflict.aGoal = goal;
  conflict.bGoal = 'defend';
  conflict.aMobilization = severity >= 7 ? 80 : severity >= 4 ? 50 : 20;
  conflict.bMobilization = 50;
  
  GAME.conflicts.push(conflict);
  
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
      
      const rel = typeof getRelation === 'function' ? getRelation(allyId) : 0;
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
  
  // Random
  const randomness = 0.5 + Math.random();
  
  // Final power
  const aPower = (aMil * aMob * aGenBonus + aEconSupport) * (1 - aExhaustionPenalty) * (1 + techAdvantage * 0.02) * randomness;
  const bPower = (bMil * bMob * bGenBonus + bEconSupport) * (1 - bExhaustionPenalty) * (1 - techAdvantage * 0.02) * randomness;
  
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
  const aTroops = (a.militaryForces?.activePersonnel || 0.1) * 1000000;
  const bTroops = (b.militaryForces?.activePersonnel || 0.1) * 1000000;
  
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
  conflict.equipmentLost.a.total += aEquipLoss;
  conflict.equipmentLost.b.total += bEquipLoss;
  
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
  if (aNation) aNation.treasury = Math.max(0, (aNation.treasury || 0) - (severity * 15 + warDuration * 2));
  if (bNation) bNation.treasury = Math.max(0, (bNation.treasury || 0) - (severity * 18 + warDuration * 3));
  
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
  
  const ceasefireThreshold = 0.4; // Peace desire over this = ceasefire
  const peaceThreshold = 0.7;     // Higher threshold for full peace
  
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
  } else {
      addNews(`🤝 STALEMATE: ${NATIONS[conflict.a]?.name} and ${NATIONS[conflict.b]?.name} sign a peace treaty after ${conflict.turn} turns.`, 'major');
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
  
  const finishedConflicts = [];
  
  for (let i = GAME.conflicts.length - 1; i >= 0; i--) {
    const conflict = GAME.conflicts[i];
    
    // Skip conflicts that don't have war.js fields (old-format from game.js's declareConflict)
    if (!conflict.type) continue;
    
    conflict.turn++;
    
    if (conflict.phase === 'peace') {
      // Remove after some turns of peace
      if (conflict.turn > conflict.startTurn + 6) {
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
    
    // 3. Escalation
    if (GAME.turn - conflict.lastEscalationTurn > 3) {
      escalateConflict(conflict);
    }
    
    // 4. Check for ceasefire
    if (conflict.turn > 3 && Math.random() < 0.1) {
      requestCeasefire(conflict);
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
      const severity = Math.floor(3 + Math.random() * 5); // 3-7 severity
      const goal = Math.random() < 0.3 ? 'annex' : Math.random() < 0.5 ? 'conquer' : 'punish';
      declareWar(attackerId, defenderId, severity, goal);
      warsDeclared++;
    } else if (evalResult.decision === 'provoke' && Math.random() < 0.3) {
      // Border skirmish
      declareWar(attackerId, defenderId, 2 + Math.floor(Math.random() * 2), 'punish');
      warsDeclared++;
    }
  }
}

// ============================================================
// INIT WARS FOR NEW GAME
// ============================================================

function initWarSystem() {
  if (!GAME.conflicts) GAME.conflicts = [];
  
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
  
  const totalCasualties = conflict.casualties.a_military + conflict.casualties.b_military;
  const totalCivCasualties = conflict.casualties.a_civilian + conflict.casualties.b_civilian;
  const frontIcon = conflict.currentFront === 'stalemate' ? '⚖️' : conflict.currentFront === 'a_advancing' ? '➡️' : conflict.currentFront === 'b_advancing' ? '⬅️' : '🔀';
  
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
        <span>${frontIcon} Front: ${conflict.currentFront.replace('_', ' ')}</span>
        <span>💀 Military: ${totalCasualties.toLocaleString()}</span>
        <span>👶 Civilian: ${totalCivCasualties.toLocaleString()}</span>
        <span>⏱️ Turn ${conflict.turn}</span>
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
