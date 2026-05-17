/**
 * Diplomacy System - Active diplomatic actions, sanctions, foreign aid, trade agreements,
 * relation dynamics, coalition formation, and investment flows.
 */

// ============================================================
// DIPLOMACY STATE INITIALIZATION
// ============================================================

function initDiplomacyState() {
  if (!GAME.diplomacyState) {
    GAME.diplomacyState = {
      sanctions: {},        // { "nationA_nationB": { severity, turn, reason } }
      tradeAgreements: {},  // { "nationA_nationB": { turn, gdpBoost, dividend } }
      foreignAid: {},       // { "nationA_nationB": { amount, turn, purpose } }
      investments: {},      // { "nationA_nationB": { amount, turn, companies: [], expectedReturn } }
      diplomaticEvents: [], // Recent events for UI
      coalitions: [],       // Active coalitions
    };
  }
  if (!GAME.diplomacyState.sanctions) GAME.diplomacyState.sanctions = {};
  if (!GAME.diplomacyState.tradeAgreements) GAME.diplomacyState.tradeAgreements = {};
  if (!GAME.diplomacyState.foreignAid) GAME.diplomacyState.foreignAid = {};
  if (!GAME.diplomacyState.investments) GAME.diplomacyState.investments = {};
  if (!GAME.diplomacyState.diplomaticEvents) GAME.diplomacyState.diplomaticEvents = [];
  if (!GAME.diplomacyState.coalitions) GAME.diplomacyState.coalitions = [];
}

function splitDiplomacyPairKey(key) {
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

// ============================================================
// RELATION DYNAMICS - Natural decay/improvement over time
// ============================================================

function processRelationDynamics() {
  initDiplomacyState();
  
  Object.keys(GAME.bilateralRelations).forEach(key => {
    const [aId, bId] = splitDiplomacyPairKey(key);
    const nationA = NATIONS[aId];
    const nationB = NATIONS[bId];
    if (!nationA || !nationB) return;
    
    let relation = GAME.bilateralRelations[key];
    
    // Loan default penalty
    if (nationA.loans && nationA.loans.some(l => l.lender === bId && l.defaulted)) {
      relation = clamp(relation - 8, -100, 100);
    }
    if (nationB.loans && nationB.loans.some(l => l.lender === aId && l.defaulted)) {
      relation = clamp(relation - 8, -100, 100);
    }
    
    // Economic crisis spillover - if one nation is in crisis and other didn't help
    if (nationA.stability < 30 && !GAME.diplomacyState.foreignAid[`${bId}_${aId}`]) {
      relation = clamp(relation - 2, -100, 100);
    }
    if (nationB.stability < 30 && !GAME.diplomacyState.foreignAid[`${aId}_${bId}`]) {
      relation = clamp(relation - 2, -100, 100);
    }
    
    // Trade agreement bonus
    const tradeKey = GAME.diplomacyState.tradeAgreements[key];
    if (tradeKey) {
      relation = clamp(relation + 1, -100, 100);
    }
    
    // Investment bonus
    const investKey = GAME.diplomacyState.investments[key];
    if (investKey) {
      relation = clamp(relation + 2, -100, 100);
    }
    
    // Natural drift toward neutral (slow)
    if (relation > 10) relation -= 0.5;
    else if (relation < -10) relation += 0.5;
    
    GAME.bilateralRelations[key] = clamp(Math.round(relation), -100, 100);
  });
}

// ============================================================
// ACTIVE DIPLOMACY - Nations proactively pursue diplomacy
// ============================================================

function processActiveDiplomacy() {
  initDiplomacyState();
  
  Object.values(NATIONS).forEach(nation => {
    if (nation.failedState) return;
    
    const diplomacyBudget = Number(nation.aiBudget?.diplomacy || 14);
    const gdp = Number(nation.gdp || 0.2);
    const stability = Number(nation.stability || 50);
    
    // Diplomacy chance based on budget
    const diplomacyChance = clamp(0.15 + diplomacyBudget * 0.012, 0.08, 0.45);
    if (Math.random() > diplomacyChance) return;
    
    // Pick a target nation (random, including those with no relation yet)
    const allNations = Object.values(NATIONS).filter(n => 
      n.id !== nation.id && !n.failedState
    );
    if (allNations.length === 0) return;
    
    // Prefer nations with bad relations or no relation
    const targetWeights = allNations.map(target => {
      const rel = getRelationBetween(nation.id, target.id);
      // Higher weight for bad relations (need diplomacy) or neutral (opportunity)
      if (rel < -30) return 3;  // Hostile - need diplomacy
      if (rel < 0) return 2;    // Negative - could improve
      if (rel < 20) return 1;   // Neutral - opportunity
      return 0.3;               // Already friendly - less need
    });
    
    const totalWeight = targetWeights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let target = allNations[0];
    for (let i = 0; i < allNations.length; i++) {
      random -= targetWeights[i];
      if (random <= 0) {
        target = allNations[i];
        break;
      }
    }
    
    const currentRel = getRelationBetween(nation.id, target.id);
    const key = relationshipKey(nation.id, target.id);
    
    // Diplomatic event types
    const eventTypes = [];
    
    if (currentRel < -20) {
      eventTypes.push('summit', 'envoy', 'cultural_exchange');
    } else if (currentRel < 20) {
      eventTypes.push('summit', 'envoy', 'cultural_exchange', 'trade_talks');
    } else {
      eventTypes.push('state_visit', 'joint_exercise', 'cultural_exchange');
    }
    
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    // Success chance based on diplomacy budget, stability, and current relations
    const successChance = clamp(
      0.45 + diplomacyBudget * 0.015 + stability * 0.003 - Math.abs(currentRel) * 0.002,
      0.25, 0.85
    );
    
    const success = Math.random() < successChance;
    const relationChange = success 
      ? clamp(Math.floor(3 + Math.random() * 8), 2, 12)
      : clamp(Math.floor(-2 - Math.random() * 4), -6, -1);
    
    GAME.bilateralRelations[key] = clamp(currentRel + relationChange, -100, 100);
    
    // Build detailed news message with investment breakdown for successful visits
    let detailedMessage = '';
    if (success && (eventType === 'state_visit' || eventType === 'summit')) {
      // Generate investment details for successful high-level diplomacy
      const investmentAmount = clamp(gdp * (0.02 + Math.random() * 0.05), 0.05, 2.0);
      const targetCompanies = target.companies || [];
      const investmentBreakdown = [];
      
      if (targetCompanies.length > 0) {
        const selectedCompanies = targetCompanies.slice(0, Math.min(3, targetCompanies.length));
        let remaining = investmentAmount;
        selectedCompanies.forEach((company, idx) => {
          const share = idx === selectedCompanies.length - 1 ? remaining : remaining * (0.3 + Math.random() * 0.3);
          investmentBreakdown.push({ company: company.name || 'Company', amount: share });
          remaining -= share;
        });
      }
      
      const breakdownStr = investmentBreakdown.map(ib => `${ib.company}=$${(ib.amount * 1000).toFixed(0)}M`).join(', ');
      const promiseAid = Math.random() < 0.4;
      const promiseLoan = Math.random() < 0.3;
      
      detailedMessage = `${nation.flag} President ${nation.leader} visited ${target.flag} ${target.name} and made deals worth $${(investmentAmount * 1000).toFixed(0)}M`;
      if (breakdownStr) detailedMessage += ` (${breakdownStr})`;
      if (promiseAid) detailedMessage += `, promised crisis assistance`;
      if (promiseLoan) detailedMessage += `, and offered loan support`;
      detailedMessage += '.';
    }
    
    // Diplomatic event descriptions
    const eventDescriptions = {
      summit: {
        success: detailedMessage || `${nation.flag} ${nation.name} and ${target.flag} ${target.name} held diplomatic summit, improving relations.`,
        fail: `${nation.flag} ${nation.name}'s diplomatic summit with ${target.flag} ${target.name} ended in disagreement.`
      },
      envoy: {
        success: `${nation.flag} ${nation.name} sent envoy to ${target.flag} ${target.name}, building bridges.`,
        fail: `${nation.flag} ${nation.name}'s envoy to ${target.flag} ${target.name} was poorly received.`
      },
      cultural_exchange: {
        success: `${nation.flag} ${nation.name} and ${target.flag} ${target.name} launched cultural exchange program.`,
        fail: `${nation.flag} ${nation.name}'s cultural exchange with ${target.flag} ${target.name} faced backlash.`
      },
      trade_talks: {
        success: `${nation.flag} ${nation.name} and ${target.flag} ${target.name} began trade negotiations.`,
        fail: `${nation.flag} ${nation.name}'s trade talks with ${target.flag} ${target.name} stalled.`
      },
      state_visit: {
        success: `${nation.flag} ${nation.name}'s leader visited ${target.flag} ${target.name}, strengthening ties.`,
        fail: `${nation.flag} ${nation.name}'s state visit to ${target.flag} ${target.name} was marred by controversy.`
      },
      joint_exercise: {
        success: `${nation.flag} ${nation.name} and ${target.flag} ${target.name} conducted joint military exercises.`,
        fail: `${nation.flag} ${nation.name}'s joint exercise with ${target.flag} ${target.name} was cancelled.`
      }
    };
    
    const desc = eventDescriptions[eventType];
    const message = success ? desc.success : desc.fail;
    
    // Record event
    GAME.diplomacyState.diplomaticEvents.unshift({
      turn: GAME.turn,
      nation: nation.id,
      target: target.id,
      type: eventType,
      success,
      relationChange,
      message
    });
    
    if (GAME.diplomacyState.diplomaticEvents.length > 50) {
      GAME.diplomacyState.diplomaticEvents = GAME.diplomacyState.diplomaticEvents.slice(0, 50);
    }
    
    // News for significant events
    if (Math.random() < 0.3 || (success && relationChange > 5)) {
      addNews(`🕊️ ${message}`, 'minor');
    }
  });
}

// ============================================================
// SANCTIONS - Economic penalties against hostile nations
// ============================================================

function processSanctions() {
  initDiplomacyState();
  
  Object.values(NATIONS).forEach(nation => {
    if (nation.failedState) return;
    
    const gdp = Number(nation.gdp || 0.2);
    const stability = Number(nation.stability || 50);
    const governance = Number(nation.governance || 50);
    
    // Only powerful/stable nations impose sanctions
    if (gdp < 0.5 || stability < 40) return;
    
    // Sanction chance based on governance and power
    const sanctionChance = clamp(0.05 + governance * 0.002 + gdp * 0.02, 0.03, 0.25);
    if (Math.random() > sanctionChance) return;
    
    // Find hostile nations to sanction
    const hostileNations = Object.values(NATIONS).filter(target => {
      if (target.failedState || target.id === nation.id) return false;
      const rel = getRelationBetween(nation.id, target.id);
      return rel < -40;  // Only sanction very hostile nations
    });
    
    if (hostileNations.length === 0) return;
    
    const target = hostileNations[Math.floor(Math.random() * hostileNations.length)];
    const key = relationshipKey(nation.id, target.id);
    
    // Check if already sanctioned
    if (GAME.diplomacyState.sanctions[key]) return;
    
    // Impose sanctions
    const severity = clamp(Math.floor(5 + Math.random() * 15), 3, 20);
    GAME.diplomacyState.sanctions[key] = {
      severity,
      turn: GAME.turn,
      reason: 'hostile relations',
      imposedBy: nation.id
    };
    
    // Economic impact on target
    target.gdp = clamp(target.gdp * (1 - severity * 0.008), 0.05, 100);
    target.stability = clamp(target.stability - severity * 0.3, 1, 100);
    
    // Foreign investors pull out if relations are bad
    if (severity > 10) {
      // Pull investments from sanctioned nation
      Object.keys(GAME.diplomacyState.investments).forEach(invKey => {
        if (invKey.includes(target.id)) {
          const [investorId, investedId] = splitDiplomacyPairKey(invKey);
          if (investedId === target.id) {
            const investment = GAME.diplomacyState.investments[invKey];
            // Partial loss on pullout
            const loss = investment.amount * 0.3;
            const investor = NATIONS[investorId];
            if (investor) {
              investor.gdp = clamp(investor.gdp - loss * 0.001, 0.05, 100);
            }
            delete GAME.diplomacyState.investments[invKey];
            
            addNews(`📉 ${nation.flag} ${nation.name} pulls investments from sanctioned ${target.flag} ${target.name}.`, 'minor');
          }
        }
      });
    }
    
    addNews(`⚠️ ${nation.flag} ${nation.name} imposes sanctions on ${target.flag} ${target.name} (severity: ${severity}).`, 'major');
  });
  
  // Sanction decay over time
  Object.keys(GAME.diplomacyState.sanctions).forEach(key => {
    const sanction = GAME.diplomacyState.sanctions[key];
    const turnsSinceImposed = GAME.turn - sanction.turn;
    
    // Sanctions weaken over time (20 turns)
    if (turnsSinceImposed > 20) {
      delete GAME.diplomacyState.sanctions[key];
    } else if (turnsSinceImposed > 10) {
      sanction.severity = Math.max(1, sanction.severity - 1);
    }
  });
}

// ============================================================
// FOREIGN AID - Rich countries aid others to build goodwill
// ============================================================

function processForeignAid() {
  initDiplomacyState();
  
  Object.values(NATIONS).forEach(nation => {
    if (nation.failedState) return;
    
    const gdp = Number(nation.gdp || 0.2);
    const stability = Number(nation.stability || 50);
    
    // Only rich/stable nations give aid
    if (gdp < 1.0 || stability < 50) return;
    
    // Aid chance based on wealth and stability
    const aidChance = clamp(0.08 + gdp * 0.03 + stability * 0.002, 0.05, 0.35);
    if (Math.random() > aidChance) return;
    
    // Find nations in need
    const needyNations = Object.values(NATIONS).filter(target => {
      if (target.failedState || target.id === nation.id) return false;
      const rel = getRelationBetween(nation.id, target.id);
      // Prefer nations with neutral/bad relations (to improve) or allies
      return (target.stability < 50 || target.gdp < 0.5) && rel > -30;
    });
    
    if (needyNations.length === 0) return;
    
    const target = needyNations[Math.floor(Math.random() * needyNations.length)];
    const key = relationshipKey(nation.id, target.id);
    
    // Aid amount based on giver's GDP
    const aidAmount = clamp(gdp * (0.02 + Math.random() * 0.05), 0.05, 2.0);
    
    // Give aid
    GAME.diplomacyState.foreignAid[`${nation.id}_${target.id}`] = {
      amount: aidAmount,
      turn: GAME.turn,
      purpose: ['humanitarian', 'infrastructure', 'education', 'health'][Math.floor(Math.random() * 4)]
    };
    
    // Economic impact
    nation.gdp = clamp(nation.gdp - aidAmount * 0.01, 0.05, 100);  // Small cost
    target.gdp = clamp(target.gdp + aidAmount * 0.02, 0.05, 100);  // Boost for receiver
    target.stability = clamp(target.stability + aidAmount * 2, 1, 100);
    
    // Relation improvement
    const currentRel = getRelationBetween(nation.id, target.id);
    const relationBoost = clamp(Math.floor(3 + aidAmount * 3), 2, 12);
    GAME.bilateralRelations[key] = clamp(currentRel + relationBoost, -100, 100);
    
    addNews(`🤝 ${nation.flag} ${nation.name} provides $${(aidAmount * 1000).toFixed(0)}M aid to ${target.flag} ${target.name}.`, 'minor');
  });
}

// ============================================================
// TRADE AGREEMENTS - Formal deals boosting GDP
// ============================================================

function processTradeAgreements() {
  initDiplomacyState();
  
  Object.values(NATIONS).forEach(nation => {
    if (nation.failedState) return;
    
    const gdp = Number(nation.gdp || 0.2);
    const diplomacyBudget = Number(nation.aiBudget?.diplomacy || 14);
    
    // Trade agreement chance
    const tradeChance = clamp(0.06 + diplomacyBudget * 0.008 + gdp * 0.02, 0.04, 0.25);
    if (Math.random() > tradeChance) return;
    
    // Find potential partners (friendly nations)
    const partners = Object.values(NATIONS).filter(target => {
      if (target.failedState || target.id === nation.id) return false;
      const rel = getRelationBetween(nation.id, target.id);
      return rel > 10;  // Only trade with friendly nations
    });
    
    if (partners.length === 0) return;
    
    const target = partners[Math.floor(Math.random() * partners.length)];
    const key = relationshipKey(nation.id, target.id);
    
    // Check if already have trade agreement
    if (GAME.diplomacyState.tradeAgreements[key]) return;
    
    // Create trade agreement
    const gdpBoost = clamp(0.01 + Math.random() * 0.03, 0.005, 0.05);
    GAME.diplomacyState.tradeAgreements[key] = {
      turn: GAME.turn,
      gdpBoost,
      duration: 10 + Math.floor(Math.random() * 10),  // 10-20 turns
    };
    
    // Immediate relation boost
    const currentRel = getRelationBetween(nation.id, target.id);
    GAME.bilateralRelations[key] = clamp(currentRel + 5, -100, 100);
    
    addNews(`📋 ${nation.flag} ${nation.name} and ${target.flag} ${target.name} sign trade agreement.`, 'minor');
  });
  
  // Apply trade agreement benefits
  Object.keys(GAME.diplomacyState.tradeAgreements).forEach(key => {
    const agreement = GAME.diplomacyState.tradeAgreements[key];
    const turnsSinceSigned = GAME.turn - agreement.turn;
    
    if (turnsSinceSigned > agreement.duration) {
      delete GAME.diplomacyState.tradeAgreements[key];
      return;
    }
    
    const [aId, bId] = splitDiplomacyPairKey(key);
    const nationA = NATIONS[aId];
    const nationB = NATIONS[bId];
    
    if (nationA && !nationA.failedState) {
      nationA.gdp = clamp(nationA.gdp * (1 + agreement.gdpBoost * 0.1), 0.05, 100);
    }
    if (nationB && !nationB.failedState) {
      nationB.gdp = clamp(nationB.gdp * (1 + agreement.gdpBoost * 0.1), 0.05, 100);
    }
  });
}

// ============================================================
// INVESTMENT FLOWS - Nations invest in each other based on relations
// ============================================================

function processInvestmentFlows() {
  initDiplomacyState();
  
  Object.values(NATIONS).forEach(nation => {
    if (nation.failedState) return;
    
    const gdp = Number(nation.gdp || 0.2);
    const stability = Number(nation.stability || 50);
    
    // Only stable nations with decent GDP invest
    if (gdp < 0.5 || stability < 45) return;
    
    // Investment chance
    const investChance = clamp(0.05 + gdp * 0.03 + stability * 0.002, 0.03, 0.25);
    if (Math.random() > investChance) return;
    
    // Find investment targets (good relations, growing economy)
    const targets = Object.values(NATIONS).filter(target => {
      if (target.failedState || target.id === nation.id) return false;
      const rel = getRelationBetween(nation.id, target.id);
      return rel > 15 && target.stability > 40;
    });
    
    if (targets.length === 0) return;
    
    const target = targets[Math.floor(Math.random() * targets.length)];
    const key = relationshipKey(nation.id, target.id);
    
    // Check if already invested
    if (GAME.diplomacyState.investments[key]) return;
    
    // Investment amount
    const investAmount = clamp(gdp * (0.03 + Math.random() * 0.08), 0.1, 3.0);
    const expectedReturn = investAmount * (1.2 + Math.random() * 0.5);  // 20-70% return
    
    GAME.diplomacyState.investments[key] = {
      amount: investAmount,
      turn: GAME.turn,
      expectedReturn,
      maturityTurn: GAME.turn + 10,  // 10 turns maturity
      companies: target.companies?.slice(0, 3).map(c => c.name) || ['Various']
    };
    
    // Economic impact
    nation.gdp = clamp(nation.gdp - investAmount * 0.005, 0.05, 100);  // Small initial cost
    target.gdp = clamp(target.gdp + investAmount * 0.015, 0.05, 100);  // Boost for receiver
    
    // Relation improvement
    const currentRel = getRelationBetween(nation.id, target.id);
    GAME.bilateralRelations[key] = clamp(currentRel + 4, -100, 100);
    
    addNews(`💰 ${nation.flag} ${nation.name} invests $${(investAmount * 1000).toFixed(0)}M in ${target.flag} ${target.name}.`, 'minor');
  });
  
  // Process matured investments (returns after 10 turns)
  Object.keys(GAME.diplomacyState.investments).forEach(key => {
    const investment = GAME.diplomacyState.investments[key];
    
    if (GAME.turn >= investment.maturityTurn) {
      const [investorId, investedId] = splitDiplomacyPairKey(key);
      const investor = NATIONS[investorId];
      const invested = NATIONS[investedId];
      
      if (investor && !investor.failedState) {
        // Return on investment
        const actualReturn = investment.expectedReturn * (0.7 + Math.random() * 0.6);  // 70-130% of expected
        investor.gdp = clamp(investor.gdp + actualReturn * 0.01, 0.05, 100);
        
        const profit = actualReturn - investment.amount;
        if (profit > 0) {
          addNews(`📈 ${investor.flag} ${investor.name} earns $${(profit * 1000).toFixed(0)}M profit from ${invested?.flag || ''} ${invested?.name || investedId} investment.`, 'minor');
        } else {
          addNews(`📉 ${investor.flag} ${investor.name} loses $${(Math.abs(profit) * 1000).toFixed(0)}M on ${invested?.flag || ''} ${invested?.name || investedId} investment.`, 'minor');
        }
      }
      
      delete GAME.diplomacyState.investments[key];
    }
  });
}

// ============================================================
// COALITION FORMATION - Multi-nation responses to aggressors
// ============================================================

function processCoalitionFormation() {
  initDiplomacyState();
  
  // Check for active wars
  if (!GAME.conflicts || GAME.conflicts.length === 0) return;
  
  GAME.conflicts.forEach(conflict => {
    if (conflict.ended) return;
    
    const attacker = NATIONS[conflict.a];
    const defender = NATIONS[conflict.b];
    if (!attacker || !defender) return;
    
    // Coalition formation chance (higher for aggressive wars)
    const coalitionChance = 0.15;
    if (Math.random() > coalitionChance) return;
    
    // Find nations that might join coalition against attacker
    const potentialMembers = Object.values(NATIONS).filter(nation => {
      if (nation.failedState || nation.id === attacker.id || nation.id === defender.id) return false;
      
      // Check if allied with defender
      const alliedWithDefender = GAME.alliances.some(a => 
        (a.a === defender.id && a.b === nation.id) || (a.a === nation.id && a.b === defender.id)
      );
      
      // Check relations with attacker
      const relWithAttacker = getRelationBetween(nation.id, attacker.id);
      
      // Join if allied with defender or very hostile to attacker
      return alliedWithDefender || relWithAttacker < -30;
    });
    
    if (potentialMembers.length === 0) return;
    
    // Form coalition
    const coalition = {
      id: `coalition_${GAME.turn}_${Math.floor(Math.random() * 9999)}`,
      target: attacker.id,
      members: [defender.id, ...potentialMembers.slice(0, 3).map(n => n.id)],
      turn: GAME.turn,
      purpose: 'contain aggression'
    };
    
    GAME.diplomacyState.coalitions.push(coalition);
    
    // Coalition members improve relations with each other
    coalition.members.forEach(memberId => {
      coalition.members.forEach(otherId => {
        if (memberId === otherId) return;
        const key = relationshipKey(memberId, otherId);
        const currentRel = getRelationBetween(memberId, otherId);
        GAME.bilateralRelations[key] = clamp(currentRel + 8, -100, 100);
      });
    });
    
    // Coalition imposes sanctions on target
    coalition.members.forEach(memberId => {
      const member = NATIONS[memberId];
      if (!member || member.failedState) return;
      
      const key = relationshipKey(memberId, attacker.id);
      GAME.diplomacyState.sanctions[key] = {
        severity: 10 + Math.floor(Math.random() * 10),
        turn: GAME.turn,
        reason: 'coalition sanctions',
        imposedBy: memberId
      };
    });
    
    const memberNames = coalition.members.map(id => NATIONS[id]?.name || id).join(', ');
    addNews(`⚔️ Coalition formed against ${attacker.flag} ${attacker.name}: ${memberNames}.`, 'major');
  });
  
  // Coalition decay
  GAME.diplomacyState.coalitions = GAME.diplomacyState.coalitions.filter(coalition => {
    const turnsSinceFormed = GAME.turn - coalition.turn;
    return turnsSinceFormed < 15;  // Coalitions last 15 turns
  });
}

// ============================================================
// DIPLOMATIC POWER CALCULATION
// ============================================================

function computeDiplomaticPower(nation) {
  if (!nation || nation.failedState) return 0;
  
  const gdp = Number(nation.gdp || 0.2);
  const militaryPower = Number(nation.militaryPower || 20);
  const techLevel = Number(nation.techLevel || 1);
  const governance = Number(nation.governance || 40);
  const stability = Number(nation.stability || 50);
  const diplomacyBudget = Number(nation.aiBudget?.diplomacy || 14);
  
  // Alliance count and strength
  const alliances = (GAME.alliances || []).filter(a => a.a === nation.id || a.b === nation.id);
  const allianceCount = alliances.length;
  const allianceStrength = alliances.reduce((sum, a) => sum + (a.strength || 50), 0);
  
  // Trade agreements
  const tradeCount = Object.keys(GAME.diplomacyState?.tradeAgreements || {})
    .filter(k => {
      const [aId, bId] = splitDiplomacyPairKey(k);
      return aId === nation.id || bId === nation.id;
    }).length;
  
  // Investments
  const investments = Object.entries(GAME.diplomacyState?.investments || {}).filter(([k]) => {
    const [aId, bId] = splitDiplomacyPairKey(k);
    return aId === nation.id || bId === nation.id;
  });
  const totalInvested = investments.reduce((sum, [, inv]) => sum + (inv.amount || 0), 0);
  
  // Aid given
  const aidGiven = Object.entries(GAME.diplomacyState?.foreignAid || {}).filter(([k]) => k.startsWith(nation.id + '_'));
  const totalAidGiven = aidGiven.reduce((sum, [, a]) => sum + (a.amount || 0), 0);
  
  // Relations
  const friendlyCount = Object.values(NATIONS).filter(n => n.id !== nation.id && getRelationBetween(nation.id, n.id) >= 20).length;
  
  // Diplomatic power score (0-1000 scale)
  const power = (
    gdp * 80 +                    // GDP weight
    militaryPower * 3 +           // Military weight
    techLevel * 25 +              // Tech weight
    governance * 1.5 +            // Governance weight
    stability * 1 +               // Stability weight
    diplomacyBudget * 8 +         // Diplomacy budget weight
    allianceCount * 40 +          // Alliance count weight
    allianceStrength * 0.5 +      // Alliance strength weight
    tradeCount * 20 +             // Trade agreements weight
    totalInvested * 15 +          // Investment weight
    totalAidGiven * 10 +          // Aid given weight
    friendlyCount * 8             // Friendly relations weight
  );
  
  return Math.round(clamp(power, 0, 1000));
}

function getTopDiplomaticPowers(limit = 10) {
  const powers = Object.values(NATIONS)
    .filter(n => !n.failedState)
    .map(nation => ({
      nation,
      power: computeDiplomaticPower(nation),
    }))
    .sort((a, b) => b.power - a.power)
    .slice(0, limit);
  
  return powers;
}

function getNationDiplomaticProfile(nationId) {
  const nation = NATIONS[nationId];
  if (!nation) return null;
  
  const ds = GAME.diplomacyState || {};
  
  // Investments
  const investments = Object.entries(ds.investments || {}).filter(([k]) => {
    const [aId, bId] = splitDiplomacyPairKey(k);
    return aId === nationId || bId === nationId;
  });
  const totalInvested = investments.reduce((sum, [, inv]) => sum + (inv.amount || 0), 0);
  const totalExpected = investments.reduce((sum, [, inv]) => sum + (inv.expectedReturn || 0), 0);
  const totalReceived = investments.reduce((sum, [, inv]) => sum + (inv.received || 0), 0);
  const profit = totalReceived - totalInvested;
  
  // Aid
  const aidGiven = Object.entries(ds.foreignAid || {}).filter(([k]) => {
    const [aId] = splitDiplomacyPairKey(k);
    return aId === nationId;
  });
  const aidReceived = Object.entries(ds.foreignAid || {}).filter(([k]) => {
    const [, bId] = splitDiplomacyPairKey(k);
    return bId === nationId;
  });
  const totalAidGiven = aidGiven.reduce((sum, [, a]) => sum + (a.amount || 0), 0);
  const totalAidReceived = aidReceived.reduce((sum, [, a]) => sum + (a.amount || 0), 0);
  
  // Alliances
  const alliances = (GAME.alliances || []).filter(a => a.a === nationId || a.b === nationId);
  
  // Trade agreements
  const tradeAgreements = Object.entries(ds.tradeAgreements || {}).filter(([k]) => {
    const [aId, bId] = splitDiplomacyPairKey(k);
    return aId === nationId || bId === nationId;
  });
  
  // Sanctions
  const sanctionsImposed = Object.entries(ds.sanctions || {}).filter(([, sanction]) => sanction?.imposedBy === nationId);
  const sanctionsReceived = Object.entries(ds.sanctions || {}).filter(([k, sanction]) => {
    const [aId, bId] = splitDiplomacyPairKey(k);
    if (sanction?.imposedBy === nationId) return false;
    return aId === nationId || bId === nationId;
  });
  
  // Relations
  const friendlyCount = Object.values(NATIONS).filter(n => n.id !== nationId && getRelationBetween(nationId, n.id) >= 20).length;
  const hostileCount = Object.values(NATIONS).filter(n => n.id !== nationId && getRelationBetween(nationId, n.id) <= -20).length;
  
  return {
    nation,
    diplomaticPower: computeDiplomaticPower(nation),
    investments: {
      count: investments.length,
      totalInvested,
      totalExpected,
      totalReceived,
      profit,
    },
    aid: {
      given: totalAidGiven,
      received: totalAidReceived,
      givenCount: aidGiven.length,
      receivedCount: aidReceived.length,
    },
    alliances: {
      count: alliances.length,
      totalStrength: alliances.reduce((sum, a) => sum + (a.strength || 50), 0),
      list: alliances.map(a => {
        const partnerId = a.a === nationId ? a.b : a.a;
        return { nation: NATIONS[partnerId], strength: a.strength };
      }).filter(p => p.nation),
    },
    tradeAgreements: {
      count: tradeAgreements.length,
      list: tradeAgreements.map(([k, v]) => {
        const [aId, bId] = splitDiplomacyPairKey(k);
        const partnerId = aId === nationId ? bId : aId;
        return { nation: NATIONS[partnerId], ...v };
      }).filter(p => p.nation),
    },
    sanctions: {
      imposed: sanctionsImposed.length,
      received: sanctionsReceived.length,
    },
    relations: {
      friendly: friendlyCount,
      hostile: hostileCount,
    },
  };
}

// ============================================================
// DIPLOMATIC PRESSURE / POWER PROJECTION
// ============================================================

function processDiplomaticPressure() {
  initDiplomacyState();

  // 1) Pressure in active wars
  (GAME.conflicts || []).forEach(conflict => {
    if (conflict.phase === 'peace') return;
    
    const attacker = NATIONS[conflict.a];
    const defender = NATIONS[conflict.b];
    if (!attacker || !defender) return;
    
    // Find high-power nations that might intervene
    const highPowerNations = Object.values(NATIONS).filter(nation => {
      if (nation.failedState || nation.id === attacker.id || nation.id === defender.id) return false;
      const power = computeDiplomaticPower(nation);
      return power > 200;  // Only nations with significant diplomatic power
    });
    
    if (highPowerNations.length === 0) return;
    
    highPowerNations.forEach(intervener => {
      // Pressure chance based on power gap
      const attackerPower = computeDiplomaticPower(attacker);
      const defenderPower = computeDiplomaticPower(defender);
      const intervenerPower = computeDiplomaticPower(intervener);
      
      // Only intervene if significantly more powerful
      const powerGap = intervenerPower - Math.max(attackerPower, defenderPower);
      if (powerGap < 100) return;  // Need significant power advantage
      
      const pressureChance = clamp(0.05 + powerGap * 0.001, 0.03, 0.25);
      if (Math.random() > pressureChance) return;
      
      // Determine intervention type
      const relWithAttacker = getRelationBetween(intervener.id, attacker.id);
      const relWithDefender = getRelationBetween(intervener.id, defender.id);
      
      let interventionType = 'ceasefire_demand';
      if (relWithAttacker < -30) {
        interventionType = 'support_defender';
      } else if (relWithDefender < -30) {
        interventionType = 'support_attacker';
      } else if (powerGap > 300) {
        interventionType = 'forced_ceasefire';
      }
      
      // Apply pressure
      const boostedChance = powerGap >= 260 ? 0.22 : 0;
      const successChance = clamp(0.3 + powerGap * 0.002 + boostedChance, 0.2, 0.95);
      const success = powerGap >= 340 ? true : Math.random() < successChance;
      
      if (success) {
        // Ceasefire success
        const ceasefireTurns = 5 + Math.floor(Math.random() * 10);
        conflict.phase = 'ceasefire';
        conflict.ceasefireTurns = 0;
        conflict.ceasefireDuration = ceasefireTurns;
        conflict.ceasefireBy = intervener.id;
        
        // Relations improve with both parties
        const key1 = relationshipKey(intervener.id, attacker.id);
        const key2 = relationshipKey(intervener.id, defender.id);
        GAME.bilateralRelations[key1] = clamp((GAME.bilateralRelations[key1] || 0) + 5, -100, 100);
        GAME.bilateralRelations[key2] = clamp((GAME.bilateralRelations[key2] || 0) + 5, -100, 100);
        
        if (typeof addNews === 'function') {
          addNews(`🕊️ ${intervener.flag} ${intervener.name} (Diplomatic Power: ${intervenerPower}) demands ceasefire between ${attacker.flag} ${attacker.name} and ${defender.flag} ${defender.name}. Ceasefire accepted for ${ceasefireTurns} turns.`, 'major');
        }
      } else {
        // Pressure rejected - relations worsen and coercive action can follow.
        const key1 = relationshipKey(intervener.id, attacker.id);
        GAME.bilateralRelations[key1] = clamp((GAME.bilateralRelations[key1] || 0) - 8, -100, 100);

        const coerciveTarget = relWithAttacker <= relWithDefender ? attacker : defender;
        const coerciveAction = powerGap > 240 ? 'military' : 'financial';
        if (coerciveAction === 'military') {
          coerciveTarget.militaryPower = clamp((coerciveTarget.militaryPower || 0) - 1.5, 0, 100);
          coerciveTarget.stability = clamp((coerciveTarget.stability || 50) - 2.5, 1, 100);
        } else {
          coerciveTarget.gdp = clamp((coerciveTarget.gdp || 0.2) - 0.025, 0.05, 100);
          coerciveTarget.stability = clamp((coerciveTarget.stability || 50) - 1.5, 1, 100);
          const sancKey = relationshipKey(intervener.id, coerciveTarget.id);
          GAME.diplomacyState.sanctions[sancKey] = {
            severity: clamp(7 + Math.floor(powerGap / 90), 6, 18),
            turn: GAME.turn,
            reason: 'coercive ceasefire pressure',
            imposedBy: intervener.id,
          };
        }
        
        if (typeof addNews === 'function') {
          addNews(`⚠️ ${intervener.flag} ${intervener.name}'s ceasefire pressure was rejected. ${coerciveTarget.flag} ${coerciveTarget.name} faces ${coerciveAction} pressure.`, 'major');
        }
      }
    });
  });

  // 2) Pressure on rising tensions (hostile pairs not yet in open war).
  const tensePairs = Object.entries(GAME.bilateralRelations || {}).filter(([key, rel]) => {
    const [aId, bId] = splitDiplomacyPairKey(key);
    if (!aId || !bId) return false;
    if (!NATIONS[aId] || !NATIONS[bId]) return false;
    if ((NATIONS[aId].failedState || NATIONS[bId].failedState)) return false;
    if (hasConflict(aId, bId)) return false;
    return rel <= -65;
  });

  tensePairs.forEach(([pairKey, relation]) => {
    const [aId, bId] = splitDiplomacyPairKey(pairKey);
    const a = NATIONS[aId];
    const b = NATIONS[bId];
    if (!a || !b) return;

    const intervener = Object.values(NATIONS).find(n => {
      if (!n || n.failedState) return false;
      if (n.id === aId || n.id === bId) return false;
      return computeDiplomaticPower(n) > 240;
    });
    if (!intervener) return;

    const aPower = computeDiplomaticPower(a);
    const bPower = computeDiplomaticPower(b);
    const intervenerPower = computeDiplomaticPower(intervener);
    const powerGap = intervenerPower - Math.max(aPower, bPower);
    if (powerGap < 120) return;
    if (Math.random() > clamp(0.05 + powerGap * 0.0008, 0.04, 0.18)) return;

    const tougherTarget = (getRelationBetween(intervener.id, aId) <= getRelationBetween(intervener.id, bId)) ? a : b;
    const honorChance = clamp(0.28 + powerGap * 0.0022 + Math.abs(relation) * 0.001, 0.25, 0.92);
    const honored = powerGap >= 320 ? true : Math.random() < honorChance;

    if (honored) {
      GAME.bilateralRelations[pairKey] = clamp((GAME.bilateralRelations[pairKey] || relation) + (10 + Math.floor(Math.random() * 8)), -100, 100);
      if (typeof addNews === 'function') {
        addNews(`🕊️ ${intervener.flag} ${intervener.name} issues a high-pressure ultimatum to ${a.flag} ${a.name} and ${b.flag} ${b.name}. Both sides step back from war.`, 'major');
      }
    } else {
      const actionType = powerGap > 250 ? 'military' : 'financial';
      if (actionType === 'military') {
        tougherTarget.militaryPower = clamp((tougherTarget.militaryPower || 0) - 2, 0, 100);
        tougherTarget.stability = clamp((tougherTarget.stability || 50) - 2, 1, 100);
      } else {
        tougherTarget.gdp = clamp((tougherTarget.gdp || 0.2) - 0.03, 0.05, 100);
        tougherTarget.stability = clamp((tougherTarget.stability || 50) - 2, 1, 100);
      }

      const coercionKey = relationshipKey(intervener.id, tougherTarget.id);
      GAME.diplomacyState.sanctions[coercionKey] = {
        severity: clamp(8 + Math.floor(powerGap / 85), 7, 20),
        turn: GAME.turn,
        reason: 'tension de-escalation ultimatum',
        imposedBy: intervener.id,
      };

      if (typeof addNews === 'function') {
        addNews(`⚠️ ${intervener.flag} ${intervener.name} warns ${a.flag} ${a.name} and ${b.flag} ${b.name}: de-escalate or face action. ${tougherTarget.flag} ${tougherTarget.name} is hit with ${actionType} pressure.`, 'major');
      }
    }
  });
}

// ============================================================
// MAIN DIPLOMACY PROCESSOR - Called each turn
// ============================================================

function processDiplomacyAll() {
  processRelationDynamics();
  processActiveDiplomacy();
  processSanctions();
  processForeignAid();
  processTradeAgreements();
  processInvestmentFlows();
  processCoalitionFormation();
  processDiplomaticPressure();
}
