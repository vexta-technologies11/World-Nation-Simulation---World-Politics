(function() {
  const GOV_DIAGNOSTIC_GROUPS = [
    'economy',
    'education',
    'military',
    'diplomacy',
    'society',
    'stateCapacity'
  ];

  const GOAL_LIBRARY = {
    stabilize_prices: {
      title: 'Stabilize Prices',
      detail: 'Inflation and deficit are eroding public confidence. Tighten spending and protect productive sectors.',
      budgetEffect: { economy: 7, diplomacy: 2, military: -4, social: -2, education: -3 },
      doctrine: 'austerity-stabilization'
    },
    industrial_recovery: {
      title: 'Industrial Recovery',
      detail: 'Weak jobs and factory output require industrial and infrastructure focus before growth can resume.',
      budgetEffect: { economy: 8, social: 3, education: -4, military: -3 },
      doctrine: 'industrial-expansion'
    },
    education_reform: {
      title: 'Education Reform',
      detail: 'Low education is limiting workforce quality, innovation, and long-term growth.',
      budgetEffect: { social: 8, education: 2, military: -3, economy: 2 },
      doctrine: 'education-first'
    },
    innovation_push: {
      title: 'Innovation Push',
      detail: 'Tech lag and innovation risk are weakening the state against advanced rivals.',
      budgetEffect: { education: 6, intelligence: 4, social: -2, military: -2 },
      doctrine: 'innovation-drive'
    },
    social_stabilization: {
      title: 'Social Stabilization',
      detail: 'Low stability, low happiness, or rising crisis risk require domestic calm and internal support.',
      budgetEffect: { social: 6, intelligence: 3, military: -3, economy: 2 },
      doctrine: 'welfare-state'
    },
    rearmament_drive: {
      title: 'Rearmament Drive',
      detail: 'External pressure and rival growth require rebuilding readiness and procurement.',
      budgetEffect: { military: 8, intelligence: 3, education: -2, social: -4, economy: -2 },
      doctrine: 'militarized'
    },
    alliance_buffer: {
      title: 'Alliance Buffer',
      detail: 'Diplomatic alignment can offset threats more cheaply than pure military expansion.',
      budgetEffect: { diplomacy: 6, intelligence: 2, military: -2, economy: -1 },
      doctrine: 'diplomatic-network'
    },
    anti_corruption: {
      title: 'Anti-Corruption Drive',
      detail: 'Corruption is degrading state capacity and worsening fiscal leakage.',
      budgetEffect: { intelligence: 4, economy: 3, social: 2, military: -2 },
      doctrine: 'balanced'
    },
    resource_security: {
      title: 'Resource Security',
      detail: 'Weak energy or raw materials require a security buffer around critical extraction and imports.',
      budgetEffect: { economy: 4, diplomacy: 3, military: 2, social: -2 },
      doctrine: 'resource-extraction'
    }
  };

  function safeNum(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : (fallback ?? 0);
  }

  function clampGov(value, min, max) {
    if (typeof clamp === 'function') return clamp(value, min, max);
    return Math.min(max, Math.max(min, value));
  }

  function govStatus(score) {
    if (score >= 72) return 'Strong';
    if (score >= 55) return 'Stable';
    if (score >= 40) return 'Strained';
    return 'Critical';
  }

  function ensureGovernmentState(nation) {
    if (!nation) return null;
    if (!nation.governmentState) {
      nation.governmentState = {
        diagnostics: {},
        goals: [],
        rival: null,
        internalMemo: '',
        lastReviewTurn: -1,
        history: [],
        budgetPressure: null,
        finance: null,
        loanView: null,
        internalCommunications: [],
        externalCommunications: [],
      };
    }
    if (!Array.isArray(nation.governmentState.history)) nation.governmentState.history = [];
    if (!Array.isArray(nation.governmentState.goals)) nation.governmentState.goals = [];
    if (!Array.isArray(nation.governmentState.internalCommunications)) nation.governmentState.internalCommunications = [];
    if (!Array.isArray(nation.governmentState.externalCommunications)) nation.governmentState.externalCommunications = [];
    return nation.governmentState;
  }

  function invalidateGovernmentReview(nation) {
    if (!nation) return;
    const state = ensureGovernmentState(nation);
    state.lastReviewTurn = -1;
  }

  function getGovernmentScaleFactor(nation) {
    const gdpFactor = clampGov(Math.log10(Math.max(safeNum(nation.gdp, 0.2) * 1000, 50)) / 3.2, 0.45, 1.25);
    const popFactor = clampGov(Math.log10(Math.max(safeNum(nation.population, 5), 2)) / 2.3, 0.55, 1.2);
    return (gdpFactor * 0.6) + (popFactor * 0.4);
  }

  function computeGovernmentDiagnostics(nation, nationId) {
    const warPressure = typeof getWarPressure === 'function' ? getWarPressure(nationId || nation.id || '') : 0;
    const allianceSupport = typeof getAllianceSupport === 'function' ? getAllianceSupport(nationId || nation.id || '') : 0;
    const sourceBudget = nation.aiBudget || (typeof doctrineBaseBudget === 'function' ? doctrineBaseBudget(nation.policyDoctrine || 'balanced') : {});
    const eduSpend = nation.eduState && nation.eduState.spendGDP != null
      ? safeNum(nation.eduState.spendGDP)
      : safeNum(sourceBudget.social) * 0.112;
    const recruitablePool = safeNum(nation.demographics?.recruitablePoolM);
    const activePersonnel = safeNum(nation.militaryForces?.activePersonnel);
    const readiness = safeNum(nation.militaryForces?.readiness, 50);
    const training = safeNum(nation.militaryForces?.trainingQuality, 50);
    const economyScore = clampGov(
      38 + safeNum(nation.gdp) * 2.5 + safeNum(nation.jobs) * 0.25 + safeNum(nation.factories) * 0.18 - safeNum(nation.inflation) * 2.2 - safeNum(nation.deficit) * 2.4 - safeNum(nation.debtRatio) * 0.11 - safeNum(nation.recessionMonths) * 1.2,
      0,
      100
    );
    const educationScore = clampGov(
      safeNum(nation.education) * 0.62 + eduSpend * 7 + safeNum(nation.techLevel) * 3.5 - safeNum(nation.eduState?.brainDrainRate) * 120,
      0,
      100
    );
    const militaryScore = clampGov(
      safeNum(nation.militaryPower) * 0.55 + readiness * 0.28 + training * 0.22 + Math.min(recruitablePool * 6, 18) + warPressure * 8,
      0,
      100
    );
    const diplomacyScore = clampGov(
      45 + safeNum(sourceBudget.diplomacy) * 0.8 + safeNum(sourceBudget.intelligence) * 0.35 + allianceSupport * 14 - warPressure * 5,
      0,
      100
    );
    const societyScore = clampGov(
      safeNum(nation.stability) * 0.35 + safeNum(nation.happiness) * 0.28 + safeNum(nation.health) * 0.14 - safeNum(nation.inequality) * 0.18 - safeNum(nation.migrationPressure) * 0.16 - safeNum(nation.crisisRisk) * 0.22,
      0,
      100
    );
    const stateCapacityScore = clampGov(
      safeNum(nation.governance) * 0.42 + (100 - safeNum(nation.corruption)) * 0.28 + safeNum(nation.decisionQuality) * 0.2 + safeNum(nation.resilience) * 0.14,
      0,
      100
    );

    return {
      economy: {
        score: economyScore,
        status: govStatus(economyScore),
        summary: `GDP ${safeNum(nation.gdp).toFixed(2)}T, inflation ${safeNum(nation.inflation).toFixed(1)}%, deficit ${safeNum(nation.deficit).toFixed(1)}%, recession ${Math.round(safeNum(nation.recessionMonths))}m`,
      },
      education: {
        score: educationScore,
        status: govStatus(educationScore),
        summary: `Education ${safeNum(nation.education).toFixed(1)}, edu spend ${eduSpend.toFixed(2)}% GDP, tech ${safeNum(nation.techLevel).toFixed(1)}, brain drain ${(safeNum(nation.eduState?.brainDrainRate) * 100).toFixed(1)}%`,
      },
      military: {
        score: militaryScore,
        status: govStatus(militaryScore),
        summary: `Military ${safeNum(nation.militaryPower).toFixed(1)}, readiness ${readiness.toFixed(1)}%, training ${training.toFixed(1)}%, active ${activePersonnel.toFixed(2)}M`,
      },
      diplomacy: {
        score: diplomacyScore,
        status: govStatus(diplomacyScore),
        summary: `War pressure ${warPressure.toFixed(2)}, alliance support ${allianceSupport.toFixed(2)}, diplomacy budget ${safeNum(sourceBudget.diplomacy).toFixed(1)}%`,
      },
      society: {
        score: societyScore,
        status: govStatus(societyScore),
        summary: `Stability ${safeNum(nation.stability).toFixed(1)}, happiness ${safeNum(nation.happiness).toFixed(1)}, crisis ${safeNum(nation.crisisRisk).toFixed(1)}, inequality ${safeNum(nation.inequality).toFixed(1)}`,
      },
      stateCapacity: {
        score: stateCapacityScore,
        status: govStatus(stateCapacityScore),
        summary: `Governance ${safeNum(nation.governance).toFixed(1)}, corruption ${safeNum(nation.corruption).toFixed(1)}, decision quality ${safeNum(nation.decisionQuality).toFixed(1)}`,
      },
      meta: {
        warPressure,
        allianceSupport,
        eduSpend,
        scaleFactor: getGovernmentScaleFactor(nation),
      }
    };
  }

  function computeRivalAssessment(nation) {
    if (typeof NATIONS === 'undefined') return null;
    const selfId = nation.id;
    const candidates = Object.values(NATIONS)
      .filter(other => other && other.id !== selfId && !other.failedState)
      .map(other => {
        const relation = typeof getRelationBetween === 'function' ? getRelationBetween(selfId, other.id) : 0;
        const allied = typeof hasAlliance === 'function' ? hasAlliance(selfId, other.id) : false;
        const threatScore = clampGov(
          safeNum(other.militaryPower) * 0.45 + safeNum(other.techLevel) * 4 + safeNum(other.gdp) * 1.4 + Math.max(0, -relation) * 0.22 + (allied ? -14 : 0),
          0,
          100
        );
        return { id: other.id, name: other.name, flag: other.flag || '', relation, threatScore, military: safeNum(other.militaryPower), tech: safeNum(other.techLevel), gdp: safeNum(other.gdp) };
      })
      .sort((a, b) => b.threatScore - a.threatScore);
    return candidates[0] || null;
  }

  function buildStrategicGoals(nation, diagnostics, rival) {
    const goals = [];
    const addGoal = (key, urgency, reason) => {
      const def = GOAL_LIBRARY[key];
      if (!def) return;
      goals.push({
        key,
        title: def.title,
        detail: def.detail,
        urgency: clampGov(urgency, 1, 100),
        reason,
        budgetEffect: { ...def.budgetEffect },
        doctrine: def.doctrine,
      });
    };

    if (safeNum(nation.inflation) > 8 || safeNum(nation.deficit) > 6 || safeNum(nation.debtRatio) > 105) {
      addGoal('stabilize_prices', 90 - diagnostics.economy.score, 'Inflation, debt, or deficit are undermining fiscal stability.');
    }
    if (safeNum(nation.jobs) < 48 || safeNum(nation.factories) < 40 || safeNum(nation.recessionMonths) > 5) {
      addGoal('industrial_recovery', 88 - diagnostics.economy.score, 'Industrial output and employment are too weak for durable growth.');
    }
    if (safeNum(nation.education) < 46 || safeNum(diagnostics.meta?.eduSpend) < 2.4) {
      addGoal('education_reform', 92 - diagnostics.education.score, 'Education quality or funding is below strategic needs.');
    }
    if (safeNum(nation.techLevel) < 4.2 || safeNum(nation.innovationRisk) > 60) {
      addGoal('innovation_push', 82 - diagnostics.education.score, 'Technological competitiveness is slipping.');
    }
    if (safeNum(nation.stability) < 52 || safeNum(nation.happiness) < 48 || safeNum(nation.crisisRisk) > 56) {
      addGoal('social_stabilization', 90 - diagnostics.society.score, 'Domestic pressure is rising and needs immediate stabilization.');
    }
    if (diagnostics.meta.warPressure > 0.18 || (rival && rival.threatScore > 72)) {
      addGoal('rearmament_drive', 86 - diagnostics.military.score + diagnostics.meta.warPressure * 8, 'External pressure or rival power growth is increasing threat exposure.');
    }
    if ((rival && rival.threatScore > 62) || diagnostics.meta.allianceSupport < 0.25) {
      addGoal('alliance_buffer', 76 - diagnostics.diplomacy.score, 'The state needs stronger diplomatic buffers around emerging threats.');
    }
    if (safeNum(nation.corruption) > 58 || diagnostics.stateCapacity.score < 55) {
      addGoal('anti_corruption', 82 - diagnostics.stateCapacity.score, 'State leakage and weak administrative capacity are hurting execution.');
    }
    if (safeNum(nation.resources) < 34 || safeNum(nation.energySecurity) < 42) {
      addGoal('resource_security', 74 - diagnostics.economy.score, 'Energy or raw material security is not sufficient for strategic autonomy.');
    }

    goals.sort((a, b) => b.urgency - a.urgency);
    return goals.slice(0, 3);
  }

  function buildInternalMemo(nation, diagnostics, goals, rival) {
    const leader = nation.leaderType || 'Council';
    const priority = goals[0];
    const rivalLine = rival && rival.threatScore > 55
      ? `${rival.flag || ''} ${rival.name} is the main external concern (threat ${rival.threatScore.toFixed(0)}).`
      : 'No major rival currently outweighs domestic priorities.';
    if (!priority) {
      return `${leader} review: the state remains broadly balanced. ${rivalLine}`;
    }
    return `${leader} review: priority is ${priority.title.toLowerCase()}. ${priority.reason} ${rivalLine}`;
  }

  function pushGovernmentHistory(state, turn, text) {
    if (!text) return;
    const last = state.history[state.history.length - 1];
    if (last && last.text === text) return;
    state.history.push({ turn, text });
    if (state.history.length > 12) state.history = state.history.slice(-12);
  }

  function computeBudgetPressure(goals) {
    const pressure = {
      military: 0,
      economy: 0,
      diplomacy: 0,
      intelligence: 0,
      education: 0,
      social: 0,
    };
    goals.forEach(goal => {
      Object.keys(goal.budgetEffect || {}).forEach(k => {
        const key = k === 'space' ? 'education' : k;
        pressure[key] += safeNum(goal.budgetEffect[k]);
      });
    });
    return pressure;
  }

  function formatGovMoney(amountT) {
    const value = safeNum(amountT);
    const abs = Math.abs(value);
    if (abs >= 1) return '$' + value.toFixed(2) + 'T';
    if (abs >= 0.001) return '$' + (value * 1000).toFixed(1) + 'B';
    return '$' + (value * 1000000).toFixed(0) + 'M';
  }

  function getNationTreasuryM(nation) {
    if (!nation) return 0;
    if (typeof GAME !== 'undefined' && nation.id === GAME.playerNation?.id) {
      return safeNum(GAME.treasury);
    }
    if (!Number.isFinite(nation.treasury)) {
      nation.treasury = Math.max(250, safeNum(nation.gdp) * 120000 + safeNum(nation.taxRevenue) * 4);
    }
    return safeNum(nation.treasury);
  }

  function setNationTreasuryM(nation, amountM) {
    const next = Math.max(0, safeNum(amountM));
    if (typeof GAME !== 'undefined' && nation.id === GAME.playerNation?.id) {
      GAME.treasury = next;
    }
    nation.treasury = next;
  }

  function adjustNationTreasuryM(nation, deltaM) {
    const next = getNationTreasuryM(nation) + safeNum(deltaM);
    setNationTreasuryM(nation, next);
  }

  function getHoldingValueT(companyId, position) {
    const shares = Math.max(0, safeNum(position?.shares));
    if (!shares) return 0;
    let price = safeNum(position?.averageCost, 0.1);
    if (typeof getGlobalCompanyById === 'function') {
      const found = getGlobalCompanyById(companyId);
      if (found && found.company) price = Math.max(0.01, safeNum(found.company.stockPrice, price));
    }
    return (shares * price) / 1_000_000_000_000;
  }

  function computeSovereignPortfolioValueT(nation) {
    const holdings = nation?.sovereignPortfolio?.stockHoldings || {};
    return Object.entries(holdings).reduce((sum, entry) => sum + getHoldingValueT(entry[0], entry[1]), 0);
  }

  function computeNationBorrowingPowerT(nation, creditScore, diagnostics) {
    const creditFactor = clampGov(safeNum(creditScore) / 100, 0.12, 0.98);
    const debtHeadroom = clampGov((165 - safeNum(nation.debtRatio)) / 165, 0.05, 1.05);
    const stabilitySupport = clampGov(safeNum(nation.stability) / 65, 0.45, 1.3);
    const allianceSupport = clampGov(safeNum(diagnostics?.meta?.allianceSupport), 0, 1);
    const crisisPenalty = nation.inCrisis ? 0.76 : 1;
    const scale = safeNum(nation.gdp) * (0.05 + creditFactor * 0.16 + allianceSupport * 0.05);
    return clampGov(scale * debtHeadroom * stabilitySupport * crisisPenalty, 0.002, Math.max(0.01, safeNum(nation.gdp) * 0.34));
  }

  function computeNationBuyingPowerT(nation, creditScore) {
    const treasuryT = getNationTreasuryM(nation) / 1_000_000;
    const taxFlowT = safeNum(nation.taxRevenue) * 8 / 1_000_000;
    const portfolioT = computeSovereignPortfolioValueT(nation) * 0.65;
    const commercialStrengthT = safeNum(nation.gdp) * clampGov((safeNum(creditScore) / 100) * 0.08, 0.01, 0.12);
    return Math.max(0.001, treasuryT + taxFlowT + portfolioT + commercialStrengthT);
  }

  function computeNationLendingCapacityT(nation, lendingPowerScore) {
    const treasuryT = getNationTreasuryM(nation) / 1_000_000;
    const portfolioT = computeSovereignPortfolioValueT(nation);
    const cashStrength = safeNum(lendingPowerScore) / 100;
    return clampGov((safeNum(nation.gdp) * 0.03 + treasuryT * 0.45 + portfolioT * 0.2) * clampGov(cashStrength * 1.4, 0.08, 1.2), 0, Math.max(0.005, safeNum(nation.gdp) * 0.22));
  }

  function computeFinanceSnapshot(nation, diagnostics) {
    const creditScore = typeof computeNationCreditScore === 'function' ? computeNationCreditScore(nation) : 0;
    const lendingPower = typeof computeNationLendingPower === 'function' ? computeNationLendingPower(nation) : 0;
    const borrowingPowerT = computeNationBorrowingPowerT(nation, creditScore, diagnostics);
    const lendingCapacityT = computeNationLendingCapacityT(nation, lendingPower);
    const buyingPowerT = computeNationBuyingPowerT(nation, creditScore);
    const buyingPowerScore = clampGov((buyingPowerT / Math.max(0.02, safeNum(nation.gdp) * 0.08)) * 55 + safeNum(nation.stockMarket) * 0.18, 1, 100);
    return {
      creditScore,
      lendingPower,
      borrowingPowerT,
      lendingCapacityT,
      buyingPowerT,
      buyingPowerScore,
      portfolioValueT: computeSovereignPortfolioValueT(nation),
      treasuryT: getNationTreasuryM(nation) / 1_000_000,
    };
  }

  function ensureSovereignLoanState() {
    if (typeof GAME === 'undefined') return [];
    if (!Array.isArray(GAME.sovereignLoans)) GAME.sovereignLoans = [];
    return GAME.sovereignLoans;
  }

  function ensureSovereignDebtFeedState() {
    if (typeof GAME === 'undefined') return [];
    if (!Array.isArray(GAME.sovereignDebtFeed)) GAME.sovereignDebtFeed = [];
    return GAME.sovereignDebtFeed;
  }

  function pushDebtFeedEvent(kind, title, detail, nationIds) {
    const feed = ensureSovereignDebtFeedState();
    const entry = {
      id: 'debt-feed-' + safeNum(GAME?.turn) + '-' + Math.floor(Math.random() * 100000),
      kind,
      title,
      detail,
      nationIds: Array.isArray(nationIds) ? nationIds.filter(Boolean) : [],
      turn: safeNum(GAME?.turn),
    };
    feed.unshift(entry);
    if (feed.length > 40) feed.length = 40;
    return entry;
  }

  function getDebtFeedForNation(nationId) {
    return ensureSovereignDebtFeedState().filter(entry => !nationId || (entry.nationIds || []).includes(nationId));
  }

  function pushGovernmentMessage(nation, channel, text) {
    if (!nation || !text) return;
    const state = ensureGovernmentState(nation);
    const currentTurn = typeof GAME !== 'undefined' ? safeNum(GAME.turn) : 0;
    const bucket = channel === 'external' ? state.externalCommunications : state.internalCommunications;
    const last = bucket[bucket.length - 1];
    if (last && last.text === text) return;
    bucket.push({ turn: currentTurn, text });
    if (bucket.length > 10) bucket.splice(0, bucket.length - 10);
  }

  function summarizeLoanCollateral(collateral) {
    if (!collateral) return 'unsecured';
    if (collateral.type === 'stock') return `stock collateral: ${collateral.companyName || collateral.companyId} (${Math.round(safeNum(collateral.shares)).toLocaleString()} shares)`;
    if (collateral.type === 'military') return `${collateral.itemName || collateral.category} collateral (${Math.round(safeNum(collateral.quantity)).toLocaleString()} units)`;
    return 'unsecured';
  }

  function getAllianceBetween(aId, bId) {
    return (GAME?.alliances || []).find(item => (item.a === aId && item.b === bId) || (item.a === bId && item.b === aId)) || null;
  }

  function getLoanByParticipants(lenderId, borrowerId) {
    return ensureSovereignLoanState().find(loan => ['active', 'delinquent'].includes(loan.status) && loan.lenderId === lenderId && loan.borrowerId === borrowerId);
  }

  function chooseStockCollateral(borrower, principalT) {
    const holdings = Object.entries(borrower?.sovereignPortfolio?.stockHoldings || {})
      .map(([companyId, position]) => ({
        companyId,
        position,
        valueT: getHoldingValueT(companyId, position),
      }))
      .filter(item => item.valueT > 0)
      .sort((a, b) => b.valueT - a.valueT);
    if (!holdings.length) return null;
    const top = holdings[0];
    const neededValueT = Math.max(0.001, principalT * 0.55);
    const shareRatio = clampGov(neededValueT / Math.max(top.valueT, 0.0001), 0.08, 0.7);
    const shareCount = Math.max(1, Math.floor(safeNum(top.position?.shares) * shareRatio));
    if (!shareCount) return null;
    let companyName = top.companyId;
    if (typeof getGlobalCompanyById === 'function') {
      const found = getGlobalCompanyById(top.companyId);
      if (found?.company?.name) companyName = found.company.name;
    }
    return {
      type: 'stock',
      companyId: top.companyId,
      companyName,
      shares: shareCount,
      estimatedValueT: getHoldingValueT(top.companyId, { shares: shareCount, averageCost: top.position?.averageCost }),
    };
  }

  function chooseMilitaryCollateral(borrower, principalT) {
    const stockpile = borrower?.militaryStockpile || {};
    const options = [];
    Object.keys(stockpile).forEach(category => {
      (stockpile[category] || []).forEach(item => {
        const quantity = Math.max(0, safeNum(item?.quantity, 1));
        if (!quantity) return;
        let unitCost = 5_000_000;
        if (typeof findEquipmentTemplate === 'function' && typeof getEquipmentUnitCost === 'function') {
          const template = findEquipmentTemplate(item.name, category);
          unitCost = template ? getEquipmentUnitCost(template, category) : unitCost;
        }
        const valueT = (quantity * unitCost) / 1_000_000_000_000;
        options.push({ category, itemName: item.name, quantity, estimatedValueT: valueT });
      });
    });
    options.sort((a, b) => b.estimatedValueT - a.estimatedValueT);
    const pick = options.find(option => option.estimatedValueT > Math.max(0.0005, principalT * 0.1));
    if (!pick) return null;
    const takeRatio = clampGov((principalT * 0.7) / Math.max(pick.estimatedValueT, 0.0001), 0.06, 0.55);
    return {
      type: 'military',
      category: pick.category,
      itemName: pick.itemName,
      quantity: Math.max(1, Math.floor(pick.quantity * takeRatio)),
      estimatedValueT: pick.estimatedValueT * takeRatio,
    };
  }

  function chooseLoanCollateral(borrower, principalT) {
    return chooseStockCollateral(borrower, principalT) || chooseMilitaryCollateral(borrower, principalT) || null;
  }

  function transferStockCollateral(borrower, lender, collateral) {
    if (!collateral || collateral.type !== 'stock') return 0;
    borrower.sovereignPortfolio = borrower.sovereignPortfolio || { stockHoldings: {} };
    lender.sovereignPortfolio = lender.sovereignPortfolio || { stockHoldings: {} };
    const borrowerHolding = borrower.sovereignPortfolio.stockHoldings[collateral.companyId];
    if (!borrowerHolding || safeNum(borrowerHolding.shares) <= 0) return 0;
    const shares = Math.min(safeNum(collateral.shares), safeNum(borrowerHolding.shares));
    if (shares <= 0) return 0;
    borrowerHolding.shares -= shares;
    if (borrowerHolding.shares <= 0) delete borrower.sovereignPortfolio.stockHoldings[collateral.companyId];
    const lenderHolding = lender.sovereignPortfolio.stockHoldings[collateral.companyId] || { shares: 0, averageCost: safeNum(borrowerHolding.averageCost, 0.1) };
    lenderHolding.shares += shares;
    lender.sovereignPortfolio.stockHoldings[collateral.companyId] = lenderHolding;
    return getHoldingValueT(collateral.companyId, { shares, averageCost: lenderHolding.averageCost });
  }

  function transferMilitaryCollateral(borrower, lender, collateral) {
    if (!collateral || collateral.type !== 'military') return 0;
    const category = collateral.category;
    const wanted = Math.max(1, Math.floor(safeNum(collateral.quantity)));
    const sourceItems = borrower?.militaryStockpile?.[category];
    if (!Array.isArray(sourceItems) || !sourceItems.length) return 0;
    let remaining = wanted;
    let recoveredT = 0;
    if (!lender.militaryStockpile) lender.militaryStockpile = {};
    if (!lender.militaryStockpile[category]) lender.militaryStockpile[category] = [];
    for (let i = sourceItems.length - 1; i >= 0 && remaining > 0; i -= 1) {
      const item = sourceItems[i];
      if (item.name !== collateral.itemName) continue;
      const available = Math.max(0, safeNum(item.quantity, 1));
      if (!available) continue;
      const taken = Math.min(available, remaining);
      item.quantity = available - taken;
      remaining -= taken;
      let unitCost = 5_000_000;
      if (typeof findEquipmentTemplate === 'function' && typeof getEquipmentUnitCost === 'function') {
        const template = findEquipmentTemplate(item.name, category);
        unitCost = template ? getEquipmentUnitCost(template, category) : unitCost;
      }
      recoveredT += (taken * unitCost) / 1_000_000_000_000;
      lender.militaryStockpile[category].push({ ...item, quantity: taken, condition: item.condition || 100 });
      if (item.quantity <= 0) sourceItems.splice(i, 1);
    }
    borrower.militaryPower = clampGov(safeNum(borrower.militaryPower) - recoveredT * 35, 0, 100);
    lender.militaryPower = clampGov(safeNum(lender.militaryPower) + recoveredT * 18, 0, 100);
    return recoveredT;
  }

  function seizeLoanCollateral(loan, borrower, lender) {
    let recoveredT = 0;
    if (loan.collateral?.type === 'stock') recoveredT = transferStockCollateral(borrower, lender, loan.collateral);
    if (!recoveredT && loan.collateral?.type === 'military') recoveredT = transferMilitaryCollateral(borrower, lender, loan.collateral);
    if (!recoveredT) {
      const fallback = chooseLoanCollateral(borrower, Math.max(loan.outstanding, loan.principal * 0.25));
      if (fallback?.type === 'stock') recoveredT = transferStockCollateral(borrower, lender, fallback);
      if (!recoveredT && fallback?.type === 'military') recoveredT = transferMilitaryCollateral(borrower, lender, fallback);
      if (fallback) loan.collateral = fallback;
    }
    return recoveredT;
  }

  function recordLoanCommunications(loan, lender, borrower, internalText, externalText) {
    pushGovernmentHistory(ensureGovernmentState(lender), safeNum(GAME?.turn), internalText);
    pushGovernmentHistory(ensureGovernmentState(borrower), safeNum(GAME?.turn), internalText);
    pushGovernmentMessage(lender, 'internal', internalText);
    pushGovernmentMessage(borrower, 'internal', internalText);
    pushGovernmentMessage(lender, 'external', externalText);
    pushGovernmentMessage(borrower, 'external', externalText);
    invalidateGovernmentReview(lender);
    invalidateGovernmentReview(borrower);
  }

  function emitDebtNews(title, detail, nationIds, type) {
    pushDebtFeedEvent(type || 'debt', title, detail, nationIds);
    if (typeof addNews === 'function') {
      addNews({ title, details: detail, category: 'diplomacy', tags: ['debt', type || 'debt'] }, type === 'default' ? 'major' : 'minor');
    }
  }

  function buildManualLoanTerms(lender, borrower, alliance, profile) {
    const relation = typeof getRelationBetween === 'function' ? getRelationBetween(lender.id, borrower.id) : 0;
    const strength = safeNum(alliance?.strength, 50);
    const borrowerState = reviewGovernmentState(borrower, borrower.id);
    const lenderState = reviewGovernmentState(lender, lender.id);
    const baseAmount = Math.min(safeNum(lenderState.finance?.lendingCapacityT) * 0.28, safeNum(borrowerState.finance?.borrowingPowerT) * 0.4);
    const templates = {
      soft: {
        amountT: clampGov(baseAmount * 0.82 + 0.004, 0.004, 0.14),
        annualRate: clampGov(2.2 + Math.max(0, 55 - relation) * 0.02 - strength * 0.015, 1, 8),
        months: clampGov(Math.round(16 + strength * 0.06), 12, 28),
        preferCollateral: 'stock',
        label: 'soft support loan'
      },
      strict: {
        amountT: clampGov(baseAmount * 0.92 + 0.006, 0.004, 0.16),
        annualRate: clampGov(6 + Math.max(0, 65 - relation) * 0.04, 4, 14),
        months: clampGov(Math.round(8 + strength * 0.03), 6, 16),
        preferCollateral: 'military',
        label: 'strict secured loan'
      },
      balanced: {
        amountT: clampGov(baseAmount * 0.88 + 0.005, 0.004, 0.15),
        annualRate: clampGov(4 + Math.max(0, 60 - relation) * 0.03 - strength * 0.01, 2, 12),
        months: clampGov(Math.round(12 + strength * 0.05), 8, 22),
        preferCollateral: 'stock',
        label: 'balanced alliance loan'
      }
    };
    return templates[profile] || templates.balanced;
  }

  function getPreferredCollateral(borrower, principalT, preference) {
    if (preference === 'military') {
      return chooseMilitaryCollateral(borrower, principalT) || chooseStockCollateral(borrower, principalT);
    }
    return chooseStockCollateral(borrower, principalT) || chooseMilitaryCollateral(borrower, principalT);
  }

  function createAllianceLoan(lender, borrower, alliance, termOverrides) {
    const loans = ensureSovereignLoanState();
    if (getLoanByParticipants(lender.id, borrower.id)) return null;
    const lenderState = reviewGovernmentState(lender, lender.id);
    const borrowerState = reviewGovernmentState(borrower, borrower.id);
    const lenderFinance = lenderState.finance;
    const borrowerFinance = borrowerState.finance;
    const relation = typeof getRelationBetween === 'function' ? getRelationBetween(lender.id, borrower.id) : 0;
    let amountT = clampGov(
      Math.min(
        lenderFinance.lendingCapacityT * clampGov((safeNum(alliance?.strength) / 100) * 0.55 + 0.08, 0.08, 0.45),
        borrowerFinance.borrowingPowerT * 0.32,
        0.01 + Math.max(0, relation) * 0.0008 + safeNum(alliance?.strength) * 0.0006
      ),
      0.004,
      0.12
    );
    if (termOverrides?.amountT != null) {
      amountT = clampGov(safeNum(termOverrides.amountT), 0.004, Math.max(0.004, safeNum(lenderFinance.lendingCapacityT) * 0.45));
    }
    if (amountT < 0.004) return null;

    const collateral = getPreferredCollateral(borrower, amountT, termOverrides?.preferCollateral) || chooseLoanCollateral(borrower, amountT);
    if (!collateral) return null;

    let rate = clampGov(
      (typeof computeLendingInterestRate === 'function' ? computeLendingInterestRate(borrower) : 8)
      - safeNum(alliance?.strength) * 0.03
      - Math.max(0, relation) * 0.02,
      1,
      16
    );
    if (termOverrides?.annualRate != null) rate = clampGov(safeNum(termOverrides.annualRate), 1, 18);
    let months = clampGov(Math.round(8 + safeNum(alliance?.strength) * 0.12 + Math.max(0, relation) * 0.08), 6, 24);
    if (termOverrides?.months != null) months = clampGov(Math.round(safeNum(termOverrides.months)), 6, 28);
    const monthlyDue = (amountT * (1 + (rate / 100) * (months / 12))) / months;
    const currentTurn = safeNum(GAME?.turn);
    const loan = {
      id: 'loan-' + lender.id + '-' + borrower.id + '-' + currentTurn + '-' + Math.floor(Math.random() * 10000),
      lenderId: lender.id,
      borrowerId: borrower.id,
      principal: amountT,
      outstanding: amountT,
      annualRate: rate,
      monthlyDue,
      startTurn: currentTurn,
      dueTurn: currentTurn + months,
      months,
      status: 'active',
      collateral,
      missedPayments: 0,
      extensions: 0,
      recoveredT: 0,
      lastPaymentTurn: currentTurn - 1,
      profile: termOverrides?.label || 'standard alliance loan',
      isManual: !!termOverrides,
    };
    loans.push(loan);

    adjustNationTreasuryM(lender, -amountT * 1_000_000);
    adjustNationTreasuryM(borrower, amountT * 1_000_000);
    if (typeof recordNationFinanceFlow === 'function') {
      recordNationFinanceFlow(lender, 'outflows', 'loan_disbursement', amountT * 1_000_000);
      recordNationFinanceFlow(borrower, 'inflows', 'loan_proceeds', amountT * 1_000_000);
    }
    lender.gdp = clampGov(safeNum(lender.gdp) - amountT * 0.025, 0.05, 140);
    borrower.gdp = clampGov(safeNum(borrower.gdp) + amountT * 0.08, 0.05, 140);
    borrower.stability = clampGov(safeNum(borrower.stability) + amountT * 90, 1, 100);
    borrower.crisisRisk = clampGov(safeNum(borrower.crisisRisk) - amountT * 120, 0, 100);
    borrower.deficit = clampGov(safeNum(borrower.deficit) - amountT * 26, -12, 35);
    if (typeof adjustNationDebtStockM === 'function') {
      adjustNationDebtStockM(borrower, amountT * 1_000_000, 'alliance_credit_issuance');
    }
    invalidateGovernmentReview(lender);
    invalidateGovernmentReview(borrower);

    const internalText = `Treasury brief: alliance credit approved. ${borrower.name} receives ${formatGovMoney(amountT)} with ${summarizeLoanCollateral(collateral)} attached.`;
    const externalText = `${lender.leader || lender.name}: ${borrower.leader || borrower.name}, under our alliance agreement please remit ${formatGovMoney(monthlyDue)} monthly through turn ${loan.dueTurn}, or transfer ${summarizeLoanCollateral(collateral)}.`;
    recordLoanCommunications(loan, lender, borrower, internalText, externalText);
    emitDebtNews(
      `🤝 ${lender.name} extends alliance credit of ${formatGovMoney(amountT)} to ${borrower.name}`,
      `${lender.name} issued a ${loan.profile} to ally ${borrower.name}. Terms: ${safeNum(loan.annualRate).toFixed(1)}% annualized, due turn ${loan.dueTurn}, with ${summarizeLoanCollateral(collateral)}.`,
      [lender.id, borrower.id],
      'loan-issued'
    );
    return loan;
  }

  function extendAllianceLoan(loan, lender, borrower, alliance, manualBias) {
    if (!alliance || !hasAlliance?.(lender.id, borrower.id) || loan.extensions >= 2) return false;
    const relation = typeof getRelationBetween === 'function' ? getRelationBetween(lender.id, borrower.id) : 0;
    const diplomacyBudget = safeNum((lender.aiBudget || GAME?.budget || {}).diplomacy);
    const chance = clampGov((safeNum(alliance.strength) / 100) * 0.45 + Math.max(0, relation) * 0.005 + diplomacyBudget * 0.008 + safeNum(manualBias), 0.12, 0.95);
    if (Math.random() > chance) return false;
    const extensionTurns = clampGov(Math.round(3 + safeNum(alliance.strength) * 0.05 + Math.max(0, relation) * 0.04), 2, 8);
    loan.dueTurn += extensionTurns;
    loan.extensions += 1;
    loan.annualRate = clampGov(loan.annualRate + 0.4, 1, 18);
    loan.missedPayments = 0;
    const internalText = `Cabinet note: repayment timetable extended for ${borrower.name}. Deadline moved by ${extensionTurns} turns to preserve alliance stability.`;
    const externalText = `${lender.leader || lender.name}: ${borrower.leader || borrower.name}, we extend your deadline to turn ${loan.dueTurn}. Keep payments flowing under our alliance terms.`;
    recordLoanCommunications(loan, lender, borrower, internalText, externalText);
    emitDebtNews(
      `🕊 ${lender.name} restructures alliance credit for ${borrower.name}`,
      `${lender.name} extended ${borrower.name}'s repayment deadline by ${extensionTurns} turns. Revised due turn: ${loan.dueTurn}. Diplomatic goodwill inside the alliance prevented immediate default.`,
      [lender.id, borrower.id],
      'restructure'
    );
    return true;
  }

  function maybeExtendAllianceLoan(loan, lender, borrower, alliance) {
    return extendAllianceLoan(loan, lender, borrower, alliance, 0);
  }

  function processSingleLoan(loan) {
    if (!loan || !['active', 'delinquent'].includes(loan.status)) return;
    const lender = NATIONS?.[loan.lenderId];
    const borrower = NATIONS?.[loan.borrowerId];
    if (!lender || !borrower) return;
    const currentTurn = safeNum(GAME?.turn);
    const alliance = GAME?.alliances?.find(item => (item.a === loan.lenderId && item.b === loan.borrowerId) || (item.a === loan.borrowerId && item.b === loan.lenderId)) || null;
    const interestDue = loan.outstanding * (loan.annualRate / 1200);
    const scheduledPayment = Math.min(loan.outstanding + interestDue, loan.monthlyDue);
    const affordableT = clampGov((getNationTreasuryM(borrower) / 1_000_000) * 0.3 + Math.max(0, safeNum(borrower.taxRevenue)) / 1_000_000 * 2, 0, scheduledPayment);
    const paymentT = Math.min(scheduledPayment, affordableT);

    if (paymentT > 0.0001) {
      adjustNationTreasuryM(borrower, -paymentT * 1_000_000);
      adjustNationTreasuryM(lender, paymentT * 1_000_000);
      if (typeof recordNationFinanceFlow === 'function') {
        recordNationFinanceFlow(borrower, 'outflows', 'loan_repayment', paymentT * 1_000_000);
        recordNationFinanceFlow(lender, 'inflows', 'loan_repayment', paymentT * 1_000_000);
      }
      const principalPaid = Math.max(0, paymentT - interestDue);
      loan.outstanding = clampGov(loan.outstanding - principalPaid, 0, 999);
      loan.lastPaymentTurn = currentTurn;
      if (typeof adjustNationDebtStockM === 'function') {
        adjustNationDebtStockM(borrower, -principalPaid * 1_000_000, 'alliance_credit_repayment_principal');
      }
      lender.stockMarket = clampGov(safeNum(lender.stockMarket) + paymentT * 10, 15, 240);
      borrower.stability = clampGov(safeNum(borrower.stability) + principalPaid * 6, 1, 100);
      invalidateGovernmentReview(lender);
      invalidateGovernmentReview(borrower);
      if (paymentT < scheduledPayment * 0.8) {
        loan.status = 'delinquent';
        loan.missedPayments += 1;
      } else {
        loan.status = 'active';
        loan.missedPayments = 0;
      }
    } else {
      loan.missedPayments += 1;
      loan.status = 'delinquent';
    }

    if (loan.outstanding <= 0.0005) {
      loan.status = 'paid';
      const internalText = `Treasury closeout: ${borrower.name} completed sovereign repayment to ${lender.name}.`; 
      const externalText = `${borrower.leader || borrower.name}: ${lender.leader || lender.name}, final payment has been transferred under our alliance agreement.`;
      recordLoanCommunications(loan, lender, borrower, internalText, externalText);
      emitDebtNews(
        `✅ ${borrower.name} clears alliance debt to ${lender.name}`,
        `${borrower.name} finished repayment on a sovereign alliance facility. The file closes without collateral transfer.`,
        [lender.id, borrower.id],
        'repaid'
      );
      return;
    }

    if (currentTurn >= loan.dueTurn || loan.missedPayments >= 2) {
      if (maybeExtendAllianceLoan(loan, lender, borrower, alliance)) return;
      const recoveredT = seizeLoanCollateral(loan, borrower, lender);
      loan.recoveredT = safeNum(loan.recoveredT) + recoveredT;
      loan.outstanding = clampGov(loan.outstanding - recoveredT, 0, 999);
      loan.status = loan.outstanding <= 0.0005 ? 'settled-via-collateral' : 'defaulted';
      borrower.stability = clampGov(safeNum(borrower.stability) - 6, 1, 100);
      borrower.crisisRisk = clampGov(safeNum(borrower.crisisRisk) + 8, 0, 100);
      if (alliance) alliance.strength = clampGov(safeNum(alliance.strength) - 6, 5, 100);
      const internalText = `Default protocol: ${borrower.name} failed to meet sovereign terms. ${formatGovMoney(recoveredT)} recovered through ${summarizeLoanCollateral(loan.collateral)}.`;
      const externalText = `${lender.leader || lender.name}: ${borrower.leader || borrower.name}, because payment failed, collateral has been transferred under our alliance credit agreement.`;
      recordLoanCommunications(loan, lender, borrower, internalText, externalText);
      emitDebtNews(
        `🏦 ${borrower.name} defaults on alliance credit from ${lender.name}`,
        `${borrower.name} missed sovereign repayment. ${formatGovMoney(recoveredT)} was recovered via ${summarizeLoanCollateral(loan.collateral)}. Alliance trust deteriorated and the debt file moved into default protocol.`,
        [lender.id, borrower.id],
        'default'
      );
    }
  }

  function processGovernmentDebtMarkets() {
    if (typeof GAME === 'undefined' || typeof NATIONS === 'undefined') return;
    ensureSovereignLoanState().forEach(processSingleLoan);

    let newLoans = 0;
    (GAME.alliances || []).forEach(alliance => {
      if (newLoans >= 4) return;
      const a = NATIONS[alliance.a];
      const b = NATIONS[alliance.b];
      if (!a || !b || a.failedState || b.failedState) return;
      const aState = reviewGovernmentState(a, a.id);
      const bState = reviewGovernmentState(b, b.id);
      const aNeed = (55 - safeNum(aState.finance?.creditScore)) + Math.max(0, safeNum(a.crisisRisk) - 42) + Math.max(0, 45 - safeNum(a.stability));
      const bNeed = (55 - safeNum(bState.finance?.creditScore)) + Math.max(0, safeNum(b.crisisRisk) - 42) + Math.max(0, 45 - safeNum(b.stability));
      const aCanLend = safeNum(aState.finance?.lendingCapacityT) > 0.01 && safeNum(aState.finance?.creditScore) > 60;
      const bCanLend = safeNum(bState.finance?.lendingCapacityT) > 0.01 && safeNum(bState.finance?.creditScore) > 60;
      let lender = null;
      let borrower = null;
      if (aNeed > bNeed + 10 && bCanLend) {
        lender = b;
        borrower = a;
      } else if (bNeed > aNeed + 10 && aCanLend) {
        lender = a;
        borrower = b;
      }
      if (!lender || !borrower) return;
      if (getLoanByParticipants(lender.id, borrower.id)) return;
      const chance = clampGov((safeNum(alliance.strength) / 100) * 0.45 + Math.max(0, 55 - safeNum(reviewGovernmentState(borrower, borrower.id).finance?.creditScore)) * 0.008, 0.08, 0.72);
      if (Math.random() > chance) return;
      if (createAllianceLoan(lender, borrower, alliance)) newLoans += 1;
    });

    // ── STRUGGLING NATIONS SEEK LOANS FROM SUPERPOWERS (non-alliance) ──
    processSovereignLoanSeeking();
  }

  function processSovereignLoanSeeking() {
    if (typeof GAME === 'undefined' || typeof NATIONS === 'undefined') return;
    const loans = ensureSovereignLoanState();
    let newLoans = 0;

    const aliveNations = (GAME?.turnCache && GAME.turnCache.turn === GAME.turn && Array.isArray(GAME.turnCache.aliveNations))
      ? GAME.turnCache.aliveNations
      : Object.values(NATIONS).filter(n => !n.failedState);

    aliveNations.forEach(borrower => {
      if (newLoans >= 2) return;
      if (borrower.failedState) return;

      const borrowerState = reviewGovernmentState(borrower, borrower.id);
      const creditScore = safeNum(borrowerState.finance?.creditScore);
      const crisisRisk = safeNum(borrower.crisisRisk);
      const stability = safeNum(borrower.stability);
      const gdp = safeNum(borrower.gdp);

      // Only struggling nations seek loans
      const needScore = (55 - creditScore) + Math.max(0, crisisRisk - 42) + Math.max(0, 45 - stability);
      if (needScore < 15) return;  // Not struggling enough

      // Already have an active loan?
      const existingLoan = loans.find(l => l.borrowerId === borrower.id && ['active', 'delinquent'].includes(l.status));
      if (existingLoan) return;

      // Find superpower lenders (not already allied)
      const allyIds = new Set((GAME.alliances || [])
        .filter(a => a.a === borrower.id || a.b === borrower.id)
        .map(a => a.a === borrower.id ? a.b : a.a));

      const potentialLenders = aliveNations.filter(nation => {
        if (nation.failedState || nation.id === borrower.id) return false;
        if (allyIds.has(nation.id)) return false;  // Already handled by alliance loans
        const lenderState = reviewGovernmentState(nation, nation.id);
        const canLend = safeNum(lenderState.finance?.lendingCapacityT) > 0.02 && safeNum(lenderState.finance?.creditScore) > 65;
        const rel = typeof getRelationBetween === 'function' ? getRelationBetween(borrower.id, nation.id) : 0;
        return canLend && rel > -20;  // Can lend and not hostile
      });

      if (potentialLenders.length === 0) return;

      // Prefer nations with good relations and high lending capacity (single-pass top-1).
      let pick = null;
      potentialLenders.forEach(lender => {
        const lenderState = reviewGovernmentState(lender, lender.id);
        const rel = typeof getRelationBetween === 'function' ? getRelationBetween(borrower.id, lender.id) : 0;
        const lendingCap = safeNum(lenderState.finance?.lendingCapacityT);
        const score = lendingCap * 100 + rel * 2;
        if (!pick || score > pick.score) pick = { lender, score };
      });

      if (!pick) return;

      // Loan approval chance based on relations, borrower need, and lender capacity
      const rel = typeof getRelationBetween === 'function' ? getRelationBetween(borrower.id, pick.lender.id) : 0;
      const approvalChance = clampGov(
        0.15 + (rel > 0 ? rel * 0.005 : 0) + Math.max(0, needScore - 15) * 0.008 + safeNum(pick.lender.gdp) * 0.05,
        0.05, 0.55
      );

      if (Math.random() > approvalChance) return;

      // Create sovereign loan (non-alliance)
      const loanAmount = clampGov(safeNum(pick.lender.gdp) * 0.02 * (0.5 + Math.random() * 0.5), 0.05, 2.0);
      const interestRate = clampGov(3 + (100 - creditScore) * 0.05 + (rel < 10 ? 2 : 0), 2, 12);
      const termMonths = 12 + Math.floor(Math.random() * 24);

      const loan = {
        id: `sov_loan_${GAME.turn}_${borrower.id}_${pick.lender.id}_${Math.floor(Math.random() * 9999)}`,
        lenderId: pick.lender.id,
        borrowerId: borrower.id,
        amount: loanAmount,
        interestRate,
        termMonths,
        remainingMonths: termMonths,
        monthlyPayment: (loanAmount * (1 + interestRate / 100)) / termMonths,
        status: 'active',
        createdTurn: GAME.turn,
        allianceId: null,  // Non-alliance loan
        type: 'sovereign',
      };

      loans.push(loan);
      newLoans++;

      // Improve relations slightly
      const key = typeof relationshipKey === 'function' ? relationshipKey(borrower.id, pick.lender.id) : `${borrower.id}_${pick.lender.id}`;
      if (typeof GAME !== 'undefined' && GAME.bilateralRelations) {
        const currentRel = typeof getRelationBetween === 'function' ? getRelationBetween(borrower.id, pick.lender.id) : 0;
        GAME.bilateralRelations[key] = typeof clamp === 'function' ? clamp(currentRel + 5, -100, 100) : currentRel + 5;
      }

      // Boost borrower's stability and GDP slightly
      borrower.stability = typeof clamp === 'function' ? clamp(borrower.stability + loanAmount * 2, 1, 100) : borrower.stability + loanAmount * 2;
      borrower.gdp = typeof clamp === 'function' ? clamp(borrower.gdp + loanAmount * 0.01, 0.05, 100) : borrower.gdp + loanAmount * 0.01;
      if (typeof adjustNationDebtStockM === 'function') {
        adjustNationDebtStockM(borrower, loanAmount * 1_000_000, 'sovereign_non_alliance_issuance');
      }

      if (typeof addNews === 'function') {
        addNews(`🏦 ${borrower.flag} ${borrower.name} secures $${(loanAmount * 1000).toFixed(0)}M sovereign loan from ${pick.lender.flag} ${pick.lender.name} (${interestRate.toFixed(1)}% interest, ${termMonths} months).`, 'minor');
      }
    });
  }

  function processAllianceSeeking() {
    if (typeof GAME === 'undefined' || typeof NATIONS === 'undefined') return;

    Object.values(NATIONS).forEach(nation => {
      if (nation.failedState) return;

      const stability = safeNum(nation.stability);
      const crisisRisk = safeNum(nation.crisisRisk);
      const gdp = safeNum(nation.gdp);
      const militaryPower = safeNum(nation.militaryPower);

      // Only struggling/weak nations seek alliances
      const needScore = Math.max(0, 45 - stability) + Math.max(0, crisisRisk - 40) + Math.max(0, 30 - militaryPower);
      if (needScore < 20) return;

      // Alliance seeking chance
      const seekChance = clampGov(0.08 + needScore * 0.005 + (gdp < 0.5 ? 0.1 : 0), 0.04, 0.35);
      if (Math.random() > seekChance) return;

      // Already in enough alliances?
      const currentAlliances = (GAME.alliances || []).filter(a => a.a === nation.id || a.b === nation.id);
      if (currentAlliances.length >= 3) return;

      // Find potential superpower partners
      const existingPartnerIds = new Set(currentAlliances.map(a => a.a === nation.id ? a.b : a.a));
      const potentialPartners = Object.values(NATIONS).filter(candidate => {
        if (candidate.failedState || candidate.id === nation.id) return false;
        if (existingPartnerIds.has(candidate.id)) return false;
        const candidateGdp = safeNum(candidate.gdp);
        const candidateMil = safeNum(candidate.militaryPower);
        const rel = typeof getRelationBetween === 'function' ? getRelationBetween(nation.id, candidate.id) : 0;
        // Prefer stronger nations with good relations
        return (candidateGdp > 1.0 || candidateMil > 50) && rel > -10;
      });

      if (potentialPartners.length === 0) return;

      // Score potential partners
      const scored = potentialPartners.map(candidate => {
        const rel = typeof getRelationBetween === 'function' ? getRelationBetween(nation.id, candidate.id) : 0;
        const gdp = safeNum(candidate.gdp);
        const mil = safeNum(candidate.militaryPower);
        const score = gdp * 50 + mil * 2 + rel * 3;
        return { candidate, score };
      }).sort((a, b) => b.score - a.score);

      const pick = scored[0];
      if (!pick) return;

      // Alliance approval chance
      const rel = typeof getRelationBetween === 'function' ? getRelationBetween(nation.id, pick.candidate.id) : 0;
      const approvalChance = clampGov(
        0.12 + rel * 0.004 + safeNum(pick.candidate.gdp) * 0.03,
        0.05, 0.45
      );

      if (Math.random() > approvalChance) return;

      // Form alliance
      if (typeof addAlliance === 'function') {
        addAlliance(nation.id, pick.candidate.id);
      } else {
        GAME.alliances.push({
          a: nation.id,
          b: pick.candidate.id,
          strength: clampGov(30 + rel * 0.3 + Math.min(safeNum(nation.gdp), safeNum(pick.candidate.gdp)) * 10, 20, 100),
          stability: 50 + rel * 0.2,
          governance: (safeNum(nation.governance) + safeNum(pick.candidate.governance)) / 2,
          createdTurn: GAME.turn,
        });
      }

      // Improve relations
      const key = typeof relationshipKey === 'function' ? relationshipKey(nation.id, pick.candidate.id) : `${nation.id}_${pick.candidate.id}`;
      if (typeof GAME !== 'undefined' && GAME.bilateralRelations) {
        const currentRel = typeof getRelationBetween === 'function' ? getRelationBetween(nation.id, pick.candidate.id) : 0;
        GAME.bilateralRelations[key] = typeof clamp === 'function' ? clamp(currentRel + 8, -100, 100) : currentRel + 8;
      }

      if (typeof addNews === 'function') {
        addNews(`🤝 ${nation.flag} ${nation.name} forms alliance with ${pick.candidate.flag} ${pick.candidate.name} seeking security and stability.`, 'major');
      }
    });
  }

  function getNationLoanView(nationId) {
    const loans = ensureSovereignLoanState();
    return {
      incoming: loans.filter(loan => loan.borrowerId === nationId && !['paid'].includes(loan.status)),
      outgoing: loans.filter(loan => loan.lenderId === nationId && !['paid'].includes(loan.status)),
    };
  }

  function getAlliancePartnersForNation(nationId) {
    return (GAME?.alliances || []).map(alliance => {
      const otherId = alliance.a === nationId ? alliance.b : alliance.b === nationId ? alliance.a : null;
      if (!otherId) return null;
      return { alliance, nation: NATIONS?.[otherId] || null };
    }).filter(Boolean);
  }

  function getAllianceTransactionsForNation(nationId) {
    const allyIds = new Set(getAlliancePartnersForNation(nationId).map(item => item.nation?.id).filter(Boolean));
    const loans = ensureSovereignLoanState().filter(loan => {
      const otherId = loan.lenderId === nationId ? loan.borrowerId : loan.borrowerId === nationId ? loan.lenderId : null;
      return !!otherId && allyIds.has(otherId);
    });
    const debtFeed = getDebtFeedForNation(nationId).filter(entry => (entry.nationIds || []).some(id => id !== nationId && allyIds.has(id)));
    return { loans, debtFeed };
  }

  function getNationCorporatePower(nation) {
    const companyCount = Array.isArray(nation?.companies) ? nation.companies.length : 0;
    const localCap = safeNum(nation?.localMarketCap) / 1000;
    const earnings = safeNum(nation?.corporateEarnings) / 1000;
    return Math.max(0, Math.round(companyCount * 320 + localCap * 1800 + earnings * 4200 + safeNum(nation?.stockMarket) * 95));
  }

  function getNationDiplomacyPower(nation) {
    const diplomacyBudget = safeNum((nation?.aiBudget || GAME?.budget || {}).diplomacy);
    const allianceCount = (GAME?.alliances || []).filter(item => item.a === nation.id || item.b === nation.id).length;
    const allianceStrength = (GAME?.alliances || [])
      .filter(item => item.a === nation.id || item.b === nation.id)
      .reduce((sum, item) => sum + safeNum(item.strength), 0);
    return Math.max(0, Math.round(safeNum(nation.governance) * 260 + diplomacyBudget * 380 + allianceCount * 2200 + allianceStrength * 55 + safeNum(nation.stability) * 150));
  }

  function getRealMilitaryPowerBreakdown(nation) {
    const forces = nation?.militaryForces || {};
    const activePersonnel = Math.max(0, Math.round(safeNum(forces.activePersonnel) * 1_000_000));
    const reservePersonnel = Math.max(0, Math.round(safeNum(forces.reservePersonnel) * 1_000_000));
    const readinessFactor = clampGov(safeNum(forces.readiness, 50) / 100, 0.35, 1.2);
    const trainingFactor = clampGov(safeNum(forces.trainingQuality, 50) / 100, 0.35, 1.25);
    const techFactor = clampGov(0.65 + safeNum(nation.techLevel, 1) * 0.12, 0.75, 1.95);

    const activePoints = Math.round(activePersonnel * 1.0 * readinessFactor * trainingFactor);
    const reservePoints = Math.round(reservePersonnel * 0.35 * trainingFactor);

    let equipmentPoints = 0;
    const equipmentDetails = [];
    const stockpile = nation?.militaryStockpile || {};
    Object.keys(stockpile).forEach(category => {
      (stockpile[category] || []).forEach(item => {
        const quantity = Math.max(0, safeNum(item?.quantity, 0));
        if (!quantity) return;
        let displayQuantity = quantity;
        if (typeof getDisplayQuantity === 'function') {
          displayQuantity = getDisplayQuantity(category, quantity);
        }
        let templatePower = 1;
        let templateTech = safeNum(nation.techLevel, 1);
        if (typeof findEquipmentTemplate === 'function') {
          const template = findEquipmentTemplate(item.name, category);
          if (template) {
            templatePower = Math.max(1, safeNum(template.power, 1));
            templateTech = Math.max(1, safeNum(template.techReq, templateTech));
          }
        }
        const itemTechFactor = clampGov(0.75 + templateTech * 0.1, 0.8, 2.0);
        const categoryWeight = category === 'rifle'
          ? 0.18
          : category === 'tank'
            ? 3.2
            : category === 'fighter' || category === 'bomber'
              ? 4.8
              : category === 'carrier'
                ? 12
                : category === 'submarine' || category === 'destroyer'
                  ? 6.5
                  : category === 'missile'
                    ? 5.2
                    : category === 'drone' || category === 'satellite'
                      ? 3.5
                      : category === 'artillery'
                        ? 2.6
                        : category === 'ifv' || category === 'helicopter' || category === 'transport' || category === 'patrol'
                          ? 1.8
                          : 1.2;
        const points = Math.round(displayQuantity * templatePower * itemTechFactor * categoryWeight);
        equipmentPoints += points;
        equipmentDetails.push({
          label: item.name,
          category,
          quantity: Math.round(displayQuantity),
          points,
        });
      });
    });

    equipmentDetails.sort((a, b) => b.points - a.points);
    const totalPoints = activePoints + reservePoints + equipmentPoints;
    return {
      totalPoints,
      activePoints,
      reservePoints,
      equipmentPoints,
      activePersonnel,
      reservePersonnel,
      topEquipment: equipmentDetails.slice(0, 3),
    };
  }

  function getNationFinancePower(nation, finance) {
    return Math.max(0, Math.round(
      safeNum(finance.creditScore) * 240
      + safeNum(finance.buyingPowerT) * 18_000
      + safeNum(finance.borrowingPowerT) * 11_000
      + safeNum(finance.lendingCapacityT) * 14_000
      + safeNum(finance.treasuryT) * 9_000
    ));
  }

  function computeSuperpowerRows() {
    if (typeof NATIONS === 'undefined') return [];
    return Object.values(NATIONS)
      .filter(nation => nation && !nation.failedState)
      .map(nation => {
        const diagnostics = computeGovernmentDiagnostics(nation, nation.id);
        const finance = computeFinanceSnapshot(nation, diagnostics);
        const militaryBreakdown = getRealMilitaryPowerBreakdown(nation);
        const militaryPower = militaryBreakdown.totalPoints;
        const diplomacyPower = getNationDiplomacyPower(nation);
        const corporatePower = getNationCorporatePower(nation);
        const financePower = getNationFinancePower(nation, finance);
        const influence = Math.round(militaryPower * 0.38 + financePower * 0.24 + diplomacyPower * 0.22 + corporatePower * 0.16);
        return {
          nation,
          militaryPower,
          militaryBreakdown,
          financePower,
          diplomacyPower,
          corporatePower,
          influence,
          allianceCount: (GAME?.alliances || []).filter(item => item.a === nation.id || item.b === nation.id).length,
        };
      })
      .sort((a, b) => b.influence - a.influence)
      .slice(0, 50)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  function renderCommunicationList(entries, emptyText) {
    if (!entries.length) return '<p class="empty">' + emptyText + '</p>';
    return entries.slice().reverse().slice(0, 8).map(entry => {
      return '<div style="padding:6px 8px;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px">'
        + '<div style="color:var(--text-muted);margin-bottom:2px">Turn ' + safeNum(entry.turn) + '</div>'
        + '<div style="color:var(--text-secondary)">' + entry.text + '</div>'
        + '</div>';
    }).join('');
  }

  function renderLoanRows(loans, nationId) {
    if (!loans.length) return '<p class="empty">No alliance credit records.</p>';
    return loans.map(loan => {
      const otherId = loan.lenderId === nationId ? loan.borrowerId : loan.lenderId;
      const otherNation = NATIONS?.[otherId];
      const direction = loan.lenderId === nationId ? 'Outgoing' : 'Incoming';
      return '<div style="padding:8px;background:rgba(9,28,54,0.42);border:1px solid var(--border-color);border-radius:8px;margin-bottom:6px">'
        + '<div style="display:flex;justify-content:space-between;gap:8px"><strong>' + direction + ' · ' + (otherNation?.flag || '') + ' ' + (otherNation?.name || otherId) + '</strong><span style="color:' + (loan.status === 'active' ? 'var(--accent-blue)' : loan.status === 'delinquent' ? 'var(--accent-yellow)' : 'var(--accent-red)') + '">' + loan.status + '</span></div>'
        + '<div style="font-size:11px;color:var(--text-secondary);margin-top:4px">Principal ' + formatGovMoney(loan.principal) + ' · Outstanding ' + formatGovMoney(loan.outstanding) + ' · Rate ' + safeNum(loan.annualRate).toFixed(1) + '%</div>'
        + '<div style="font-size:11px;color:var(--text-muted);margin-top:4px">Monthly due ' + formatGovMoney(loan.monthlyDue) + ' · Due turn ' + safeNum(loan.dueTurn) + ' · ' + summarizeLoanCollateral(loan.collateral) + '</div>'
        + '</div>';
    }).join('');
  }

  function renderDebtFeedRows(entries) {
    if (!entries.length) return '<p class="empty">No sovereign debt diplomacy events recorded yet.</p>';
    return entries.slice(0, 10).map(entry => {
      return '<div style="padding:8px;background:rgba(9,28,54,0.42);border:1px solid var(--border-color);border-radius:8px;margin-bottom:6px">'
        + '<div style="display:flex;justify-content:space-between;gap:8px"><strong>' + entry.title + '</strong><span style="color:var(--text-muted)">T' + safeNum(entry.turn) + '</span></div>'
        + '<div style="font-size:11px;color:var(--text-secondary);margin-top:4px">' + entry.detail + '</div>'
        + '</div>';
    }).join('');
  }

  function renderAllianceRows(nation) {
    const partners = getAlliancePartnersForNation(nation.id).filter(item => item.nation && !item.nation.failedState);
    if (!partners.length) return '<p class="empty">No active alliances.</p>';
    return partners.map(item => {
      const ally = item.nation;
      const relation = typeof getRelationBetween === 'function' ? getRelationBetween(nation.id, ally.id) : 0;
      const activeLoan = getLoanByParticipants(nation.id, ally.id) || getLoanByParticipants(ally.id, nation.id);
      const transactions = getAllianceTransactionsForNation(nation.id).debtFeed.filter(entry => (entry.nationIds || []).includes(ally.id)).slice(0, 2);
      let html = '<div style="padding:8px;background:rgba(9,28,54,0.42);border:1px solid var(--border-color);border-radius:8px;margin-bottom:6px">';
      html += '<div style="display:flex;justify-content:space-between;gap:8px"><strong>' + (ally.flag || '') + ' ' + ally.name + '</strong><span style="color:var(--text-secondary)">Strength ' + safeNum(item.alliance.strength).toFixed(0) + ' · Rel ' + (relation >= 0 ? '+' : '') + relation.toFixed(0) + '</span></div>';
      html += '<div style="font-size:11px;color:var(--text-secondary);margin-top:4px">Gov ' + (typeof getGovernmentLabel === 'function' ? getGovernmentLabel(ally.governmentStyle) : ally.governmentStyle) + ' · Doctrine ' + (typeof getDoctrineLabel === 'function' ? getDoctrineLabel(ally.policyDoctrine) : ally.policyDoctrine) + ' · GDP ' + formatGovMoney(safeNum(ally.gdp)) + '</div>';
      html += '<div style="font-size:11px;color:var(--text-muted);margin-top:4px">' + (activeLoan ? ('Active transaction: ' + activeLoan.profile + ', outstanding ' + formatGovMoney(activeLoan.outstanding) + ', due T' + safeNum(activeLoan.dueTurn)) : 'No live sovereign loan transaction with this ally.') + '</div>';
      if (transactions.length) {
        html += '<div style="margin-top:6px">' + transactions.map(entry => '<div style="font-size:11px;color:var(--text-muted)">T' + safeNum(entry.turn) + ' · ' + entry.title + '</div>').join('') + '</div>';
      }
      html += '</div>';
      return html;
    }).join('');
  }

  function renderSuperpowerRows(rows) {
    if (!rows.length) return '<p class="empty">No ranking data yet.</p>';
    let html = '<div style="max-height:420px;overflow:auto;border:1px solid var(--border-color);border-radius:10px">';
    rows.forEach(row => {
      const tier = row.rank <= 10 ? 'Superpower' : row.rank <= 25 ? 'Major Power' : 'Regional Power';
      const topEquipmentText = (row.militaryBreakdown.topEquipment || [])
        .map(item => item.label + ' +' + item.points.toLocaleString())
        .join(' · ');
      const weight = row.rank <= 3 ? '700' : '400';
      html += '<button class="news-browser-entry" onclick="showInternalAffairs(\'' + row.nation.id + '\')" style="width:100%;text-align:left;display:grid;grid-template-columns:52px 1.45fr repeat(5, 0.9fr);gap:8px;padding:8px 10px;border:0;border-bottom:1px solid rgba(84,140,196,0.12);align-items:center;background:rgba(9,28,54,0.42);color:#fff;font-weight:' + weight + '">';
      html += '<div style="color:#fff"><strong>#' + row.rank + '</strong></div>';
      html += '<div style="color:#fff"><strong>' + (row.nation.flag || '') + ' ' + row.nation.name + '</strong><div style="font-size:10px;color:#fff;opacity:0.88">' + tier + ' · ' + row.allianceCount + ' alliances · ' + row.militaryBreakdown.activePersonnel.toLocaleString() + ' active</div><div style="font-size:10px;color:#fff;opacity:0.82">' + (topEquipmentText || 'Personnel-led force structure') + '</div></div>';
      html += '<div style="font-size:11px;color:#fff">Mil ' + row.militaryPower.toLocaleString() + '</div>';
      html += '<div style="font-size:11px;color:#fff">Fin ' + row.financePower.toLocaleString() + '</div>';
      html += '<div style="font-size:11px;color:#fff">Dip ' + row.diplomacyPower.toLocaleString() + '</div>';
      html += '<div style="font-size:11px;color:#fff">Corp ' + row.corporatePower.toLocaleString() + '</div>';
      html += '<div style="font-size:11px;color:#fff">Inf ' + row.influence.toLocaleString() + '</div>';
      html += '</button>';
    });
    html += '</div>';
    return html;
  }

  function scrollInternalAffairsSection(sectionId) {
    if (typeof document === 'undefined') return;
    const node = document.getElementById(sectionId);
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderPlayerCreditControls(nation) {
    if (!GAME?.playerNation || nation.id !== GAME.playerNation.id) return '';
    const allies = getAlliancePartnersForNation(nation.id).filter(item => item.nation && !item.nation.failedState);
    let html = '<div class="section-card"><h4>🤝 Alliance Credit Actions</h4>';
    if (!allies.length) {
      html += '<p class="empty">No allies available for sovereign credit negotiations.</p>';
      html += '</div>';
      return html;
    }
    allies.forEach(item => {
      const other = item.nation;
      const loan = getLoanByParticipants(nation.id, other.id);
      const relation = typeof getRelationBetween === 'function' ? getRelationBetween(nation.id, other.id) : 0;
      html += '<div style="padding:8px;background:rgba(9,28,54,0.42);border:1px solid var(--border-color);border-radius:8px;margin-bottom:6px">';
      html += '<div style="display:flex;justify-content:space-between;gap:8px"><strong>' + (other.flag || '') + ' ' + other.name + '</strong><span style="color:var(--text-secondary)">Alliance ' + safeNum(item.alliance.strength).toFixed(0) + ' · Rel ' + (relation >= 0 ? '+' : '') + relation.toFixed(0) + '</span></div>';
      html += '<div style="font-size:11px;color:var(--text-muted);margin:4px 0 8px">' + (loan ? ('Active file: ' + loan.profile + ', due T' + safeNum(loan.dueTurn) + ', outstanding ' + formatGovMoney(loan.outstanding)) : 'No active sovereign loan file with this ally.') + '</div>';
      html += '<div style="display:flex;flex-wrap:wrap;gap:6px">';
      if (!loan) {
        html += '<button class="btn-sm" onclick="playerOfferAllianceLoan(\'' + other.id + '\', \'' + 'soft' + '\')">Offer Soft Loan</button>';
        html += '<button class="btn-sm" onclick="playerOfferAllianceLoan(\'' + other.id + '\', \'' + 'balanced' + '\')">Offer Balanced Loan</button>';
        html += '<button class="btn-sm" onclick="playerOfferAllianceLoan(\'' + other.id + '\', \'' + 'strict' + '\')">Offer Strict Loan</button>';
      } else {
        html += '<button class="btn-sm" onclick="playerExtendAllianceLoan(\'' + other.id + '\')">Extend Deadline</button>';
      }
      html += '</div></div>';
    });
    html += '</div>';
    return html;
  }

  function playerOfferAllianceLoan(targetId, profile) {
    if (!GAME?.playerNation || !NATIONS?.[targetId]) return;
    const lender = NATIONS[GAME.playerNation.id];
    const borrower = NATIONS[targetId];
    const alliance = getAllianceBetween(lender.id, borrower.id);
    if (!alliance) {
      if (typeof addNews === 'function') addNews('⚠️ Sovereign loans require an alliance.', 'minor');
      return;
    }
    if (getLoanByParticipants(lender.id, borrower.id)) {
      if (typeof addNews === 'function') addNews(`⚠️ ${borrower.name} already has an active alliance credit file with you.`, 'minor');
      return;
    }
    const terms = buildManualLoanTerms(lender, borrower, alliance, profile);
    const created = createAllianceLoan(lender, borrower, alliance, terms);
    if (!created) {
      if (typeof addNews === 'function') addNews(`⚠️ ${borrower.name} could not receive a ${terms.label} right now. Check treasury, alliance strength, or collateral availability.`, 'minor');
      return;
    }
    showInternalAffairs(lender.id);
  }

  function playerExtendAllianceLoan(targetId) {
    if (!GAME?.playerNation || !NATIONS?.[targetId]) return;
    const lender = NATIONS[GAME.playerNation.id];
    const borrower = NATIONS[targetId];
    const loan = getLoanByParticipants(lender.id, borrower.id);
    const alliance = getAllianceBetween(lender.id, borrower.id);
    if (!loan || !alliance) {
      if (typeof addNews === 'function') addNews(`⚠️ No active alliance credit file with ${borrower.name} to extend.`, 'minor');
      return;
    }
    if (!extendAllianceLoan(loan, lender, borrower, alliance, 0.35)) {
      if (typeof addNews === 'function') addNews(`⚠️ Deadline extension for ${borrower.name} was rejected by cabinet conditions.`, 'minor');
      return;
    }
    showInternalAffairs(lender.id);
  }

  function reviewGovernmentState(nation, nationId) {
    const state = ensureGovernmentState(nation);
    const currentTurn = typeof GAME !== 'undefined' ? safeNum(GAME.turn) : 0;
    if (state.lastReviewTurn === currentTurn && state.internalMemo) return state;

    const diagnostics = computeGovernmentDiagnostics(nation, nationId);
    const rival = computeRivalAssessment(nation);
    const goals = buildStrategicGoals(nation, diagnostics, rival);
    const memo = buildInternalMemo(nation, diagnostics, goals, rival);

    state.diagnostics = diagnostics;
    state.goals = goals;
    state.rival = rival;
    state.internalMemo = memo;
    state.lastReviewTurn = currentTurn;
    state.budgetPressure = computeBudgetPressure(goals);
    state.finance = computeFinanceSnapshot(nation, diagnostics);
    if (typeof setCachedFinanceSnapshot === 'function') {
      setCachedFinanceSnapshot(nation.id, state.finance);
    }
    state.loanView = getNationLoanView(nation.id);
    pushGovernmentHistory(state, currentTurn, memo);
    return state;
  }

  function applyGovernmentStrategyLayer(nation, nationId, targetBudget) {
    const state = reviewGovernmentState(nation, nationId);
    const pressure = state.budgetPressure || {};
    const scale = (state.diagnostics?.meta?.scaleFactor || 0.8) * 0.55;
    Object.keys(pressure).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(targetBudget, key)) return;
      const delta = clampGov(pressure[key] * scale, -8, 8);
      targetBudget[key] = clampGov(safeNum(targetBudget[key]) + delta, 2, 62);
    });

    const preferredDoctrine = state.goals[0]?.doctrine;
    if (preferredDoctrine && state.goals[0].urgency > 68) {
      nation.policyDoctrine = preferredDoctrine;
    }
    return state;
  }

  function getNationGovernmentSummary(nation, nationId) {
    const state = reviewGovernmentState(nation, nationId);
    return {
      memo: state.internalMemo,
      topGoal: state.goals[0] || null,
      rival: state.rival || null,
      diagnostics: state.diagnostics || {},
      finance: state.finance || null,
      loanView: state.loanView || { incoming: [], outgoing: [] },
    };
  }

  function renderDiagnosticCard(label, item) {
    if (!item) return '';
    const color = item.score >= 72
      ? 'var(--accent-green)'
      : item.score >= 55
        ? 'var(--accent-blue)'
        : item.score >= 40
          ? 'var(--accent-yellow)'
          : 'var(--accent-red)';
    return '<div style="padding:8px;background:rgba(9,28,54,0.42);border:1px solid var(--border-color);border-radius:8px">'
      + '<div style="display:flex;justify-content:space-between;gap:8px"><strong>' + label + '</strong><span style="color:' + color + '">' + item.status + ' (' + item.score.toFixed(0) + ')</span></div>'
      + '<div style="font-size:11px;color:var(--text-secondary);margin-top:4px">' + item.summary + '</div>'
      + '</div>';
  }

  function renderInternalAffairsDiplomacySection(nationId) {
    if (typeof GAME === 'undefined' || !GAME.diplomacyState) return '';
    const ds = GAME.diplomacyState;
    const nation = (typeof NATIONS !== 'undefined' && NATIONS[nationId]) || null;
    if (!nation) return '';

    const sanctions = Object.entries(ds.sanctions || {}).filter(([key]) => key.includes(nationId));
    const tradeAgreements = Object.entries(ds.tradeAgreements || {}).filter(([key]) => key.includes(nationId));
    const investments = Object.entries(ds.investments || {}).filter(([key]) => key.includes(nationId));
    const aid = Object.entries(ds.foreignAid || {}).filter(([key]) => key.includes(nationId));
    const coalitions = (ds.coalitions || []).filter(c => c.members.includes(nationId));
    const events = (ds.diplomaticEvents || []).filter(e => e.nation === nationId || e.target === nationId).slice(0, 10);

    if (sanctions.length === 0 && tradeAgreements.length === 0 && investments.length === 0 && aid.length === 0 && coalitions.length === 0 && events.length === 0) {
      return '';
    }

    let html = '<div class="section-card"><h4>🕊️ Diplomacy & International Relations</h4>';

    // Diplomatic Events
    if (events.length > 0) {
      html += '<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--text-secondary)">📋 Recent Diplomatic Activities:</div>';
      events.forEach(e => {
        const isOutgoing = e.nation === nationId;
        const otherId = isOutgoing ? e.target : e.nation;
        const other = NATIONS[otherId];
        const icon = e.success ? '✅' : '❌';
        const relChange = e.relationChange > 0 ? `+${e.relationChange}` : e.relationChange;
        const relColor = e.relationChange > 0 ? 'var(--accent-green)' : 'var(--accent-red)';
        html += `<div style="font-size:11px;padding:4px 8px;border-bottom:1px solid rgba(84,140,196,0.1);display:flex;justify-content:space-between">`;
        html += `<span>${icon} ${e.message}</span>`;
        html += `<span style="color:${relColor};font-weight:600">${relChange}</span>`;
        html += `</div>`;
      });
      html += '</div>';
    }

    // Trade Agreements
    if (tradeAgreements.length > 0) {
      html += '<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--text-secondary)">📜 Trade Agreements:</div>';
      tradeAgreements.forEach(([key, agreement]) => {
        const [aId, bId] = key.split('_');
        const partnerId = aId === nationId ? bId : aId;
        const partner = NATIONS[partnerId];
        const turnsLeft = agreement.duration - (GAME.turn - agreement.turn);
        html += `<div style="font-size:11px;padding:4px 8px;border-bottom:1px solid rgba(84,140,196,0.1);display:flex;justify-content:space-between">`;
        html += `<span>${partner ? partner.flag : '🏳️'} ${partner ? partner.name : partnerId}</span>`;
        html += `<span style="color:var(--accent-green)">GDP +${(agreement.gdpBoost * 100).toFixed(1)}% | ${turnsLeft} turns</span>`;
        html += `</div>`;
      });
      html += '</div>';
    }

    // Investments
    if (investments.length > 0) {
      html += '<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--text-secondary)">💰 Investments & Returns:</div>';
      investments.forEach(([key, investment]) => {
        const [aId, bId] = key.split('_');
        const isInvestor = aId === nationId;
        const otherId = isInvestor ? bId : aId;
        const other = NATIONS[otherId];
        const turnsLeft = investment.maturityTurn - GAME.turn;
        const profit = investment.expectedReturn - investment.amount;
        const profitColor = profit > 0 ? 'var(--accent-green)' : 'var(--accent-red)';
        const companies = (investment.companies || []).slice(0, 3).join(', ');
        html += `<div style="font-size:11px;padding:4px 8px;border-bottom:1px solid rgba(84,140,196,0.1)">`;
        html += `<div style="display:flex;justify-content:space-between">`;
        html += `<span>${isInvestor ? '📤 Invested in' : '📥 Received from'} ${other ? other.flag : '🏳️'} ${other ? other.name : otherId}</span>`;
        html += `<span>$${(investment.amount * 1000).toFixed(0)}M | <span style="color:${profitColor}">+${(profit * 1000).toFixed(0)}M</span></span>`;
        html += `</div>`;
        if (companies) {
          html += `<div style="color:var(--text-muted);margin-top:2px">Companies: ${companies}</div>`;
        }
        html += `<div style="color:var(--text-muted);font-size:10px">${turnsLeft > 0 ? turnsLeft + ' turns to maturity' : 'Matured'}</div>`;
        html += `</div>`;
      });
      html += '</div>';
    }

    // Foreign Aid
    if (aid.length > 0) {
      html += '<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--text-secondary)">🤝 Foreign Aid:</div>';
      aid.forEach(([key, aidData]) => {
        const [aId, bId] = key.split('_');
        const isGiver = aId === nationId;
        const otherId = isGiver ? bId : aId;
        const other = NATIONS[otherId];
        html += `<div style="font-size:11px;padding:4px 8px;border-bottom:1px solid rgba(84,140,196,0.1);display:flex;justify-content:space-between">`;
        html += `<span>${isGiver ? '📤 Aid given to' : '📥 Aid received from'} ${other ? other.flag : '🏳️'} ${other ? other.name : otherId}</span>`;
        html += `<span>$${(aidData.amount * 1000).toFixed(0)}M | ${aidData.purpose}</span>`;
        html += `</div>`;
      });
      html += '</div>';
    }

    // Sanctions
    if (sanctions.length > 0) {
      html += '<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--accent-red)">🚫 Sanctions:</div>';
      sanctions.forEach(([key, sanction]) => {
        const [aId, bId] = key.split('_');
        const isTarget = bId === nationId;
        const otherId = isTarget ? aId : bId;
        const other = NATIONS[otherId];
        html += `<div style="font-size:11px;padding:4px 8px;border-bottom:1px solid rgba(84,140,196,0.1);display:flex;justify-content:space-between">`;
        html += `<span>${isTarget ? '⚠️ Sanctioned by' : '🚫 Sanctioning'} ${other ? other.flag : '🏳️'} ${other ? other.name : otherId}</span>`;
        html += `<span style="color:var(--accent-red)">Severity: ${sanction.severity}</span>`;
        html += `</div>`;
      });
      html += '</div>';
    }

    // Coalitions
    if (coalitions.length > 0) {
      html += '<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--text-secondary)">⚔️ Coalitions:</div>';
      coalitions.forEach(coalition => {
        const target = NATIONS[coalition.target];
        const memberNames = coalition.members.map(id => {
          const n = NATIONS[id];
          return n ? `${n.flag} ${n.name}` : id;
        }).join(', ');
        html += `<div style="font-size:11px;padding:4px 8px;border-bottom:1px solid rgba(84,140,196,0.1)">`;
        html += `<div style="display:flex;justify-content:space-between">`;
        html += `<span>Target: ${target ? target.flag : '🏳️'} ${target ? target.name : coalition.target}</span>`;
        html += `<span>${coalition.purpose}</span>`;
        html += `</div>`;
        html += `<div style="color:var(--text-muted);font-size:10px;margin-top:2px">Members: ${memberNames}</div>`;
        html += `</div>`;
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function renderInternalAffairsPanel(nationId) {
    if (typeof NATIONS === 'undefined') return '<div class="empty">No nation data.</div>';
    const nation = NATIONS[nationId] || (typeof GAME !== 'undefined' ? GAME.playerNation : null);
    if (!nation) return '<div class="empty">No nation selected.</div>';
    const state = reviewGovernmentState(nation, nationId);
    const diagnostics = state.diagnostics || {};
    const goals = Array.isArray(state.goals) ? state.goals : [];
    const rival = state.rival;
    const history = Array.isArray(state.history) ? state.history.slice().reverse() : [];
    const finance = state.finance || computeFinanceSnapshot(nation, diagnostics);
    const loanView = state.loanView || getNationLoanView(nation.id);
    const debtFeed = getDebtFeedForNation(nation.id);
    const allianceTransactions = getAllianceTransactionsForNation(nation.id);
    const superpowerRows = computeSuperpowerRows();
    const budget = nation.id === GAME.playerNation?.id ? GAME.budget : nation.aiBudget;

    let html = '<div class="section-card"><h4>🏛 Internal Affairs</h4>';
    html += '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">' + state.internalMemo + '</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">';
    html += '<button class="btn-sm" onclick="scrollInternalAffairsSection(\'ia-alliances\')">🤝 Alliances</button>';
    html += '<button class="btn-sm" onclick="scrollInternalAffairsSection(\'ia-superpowers\')">🌐 Superpowers</button>';
    html += '</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
    html += '<div class="resource-item"><span class="r-name">Government</span><span class="r-val">' + (typeof getGovernmentLabel === 'function' ? getGovernmentLabel(nation.governmentStyle) : nation.governmentStyle) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Doctrine</span><span class="r-val">' + (typeof getDoctrineLabel === 'function' ? getDoctrineLabel(nation.policyDoctrine) : nation.policyDoctrine) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Decision Quality</span><span class="r-val">' + safeNum(nation.decisionQuality).toFixed(1) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Review Turn</span><span class="r-val">' + safeNum(state.lastReviewTurn) + '</span></div>';
    html += '</div></div>';

    if (typeof renderNationGovernanceAdvisorCard === 'function') {
      html += renderNationGovernanceAdvisorCard(nation.id);
    }

    html += '<div class="section-card"><h4>🏦 Sovereign Finance</h4>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
    html += '<div class="resource-item"><span class="r-name">Credit Score</span><span class="r-val">' + safeNum(finance.creditScore).toFixed(0) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Buying Power</span><span class="r-val">' + formatGovMoney(finance.buyingPowerT) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Borrowing Power</span><span class="r-val">' + formatGovMoney(finance.borrowingPowerT) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Lending Power</span><span class="r-val">' + safeNum(finance.lendingPower).toFixed(0) + ' · ' + formatGovMoney(finance.lendingCapacityT) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Treasury Buffer</span><span class="r-val">' + formatGovMoney(finance.treasuryT) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Stock Collateral Base</span><span class="r-val">' + formatGovMoney(finance.portfolioValueT) + '</span></div>';
    html += '</div>';
    html += '<div style="font-size:11px;color:var(--text-secondary);margin-top:8px">Alliance credit is the only sovereign lending channel in this layer. Terms, deadline extensions, and collateral enforcement all stay inside allied relationships.</div>';
    html += '</div>';

    html += '<div class="section-card" id="ia-alliances"><h4>🤝 Alliances & Transactions</h4>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">';
    html += '<div class="resource-item"><span class="r-name">Active Alliances</span><span class="r-val">' + getAlliancePartnersForNation(nation.id).length + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Alliance Transactions</span><span class="r-val">' + safeNum(allianceTransactions.loans.length) + ' loans · ' + safeNum(allianceTransactions.debtFeed.length) + ' events</span></div>';
    html += '</div>';
    html += renderAllianceRows(nation);
    html += '</div>';

    html += renderPlayerCreditControls(nation);

    html += '<div class="section-card"><h4>🧠 Strategic Goals</h4>';
    if (!goals.length) {
      html += '<p class="empty">No active strategic goals. The state is operating near a balanced posture.</p>';
    } else {
      goals.forEach(goal => {
        html += '<div style="padding:8px;background:rgba(9,28,54,0.42);border:1px solid var(--border-color);border-radius:8px;margin-bottom:6px">';
        html += '<div style="display:flex;justify-content:space-between;gap:8px"><strong>' + goal.title + '</strong><span style="color:' + (goal.urgency > 78 ? 'var(--accent-red)' : goal.urgency > 60 ? 'var(--accent-yellow)' : 'var(--accent-blue)') + '">Urgency ' + goal.urgency.toFixed(0) + '</span></div>';
        html += '<div style="font-size:11px;color:var(--text-secondary);margin-top:4px">' + goal.reason + '</div>';
        html += '<div style="font-size:11px;color:var(--text-muted);margin-top:4px">' + goal.detail + '</div>';
        html += '</div>';
      });
    }
    html += '</div>';

    html += '<div class="section-card"><h4>📊 State Diagnostics</h4>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    GOV_DIAGNOSTIC_GROUPS.forEach(key => {
      const label = key === 'stateCapacity' ? 'State Capacity' : key.charAt(0).toUpperCase() + key.slice(1);
      html += renderDiagnosticCard(label, diagnostics[key]);
    });
    html += '</div></div>';

    html += '<div class="section-card"><h4>🎯 Threat & Rival Assessment</h4>';
    if (rival) {
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
      html += '<div class="resource-item"><span class="r-name">Primary Rival</span><span class="r-val">' + (rival.flag || '') + ' ' + rival.name + '</span></div>';
      html += '<div class="resource-item"><span class="r-name">Threat Score</span><span class="r-val">' + rival.threatScore.toFixed(0) + '</span></div>';
      html += '<div class="resource-item"><span class="r-name">Relation</span><span class="r-val">' + (rival.relation >= 0 ? '+' : '') + rival.relation.toFixed(0) + '</span></div>';
      html += '<div class="resource-item"><span class="r-name">Rival GDP / Tech / Mil</span><span class="r-val">' + rival.gdp.toFixed(1) + 'T / T' + rival.tech.toFixed(1) + ' / ' + rival.military.toFixed(1) + '</span></div>';
      html += '</div>';
    } else {
      html += '<p class="empty">No meaningful rival pressure detected.</p>';
    }
    html += '</div>';

    html += '<div class="section-card"><h4>💼 Budget Steering</h4>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
    ['military', 'economy', 'diplomacy', 'intelligence', 'education', 'social'].forEach(key => {
      const pressure = safeNum(state.budgetPressure?.[key]);
      const direction = pressure > 0 ? 'up' : pressure < 0 ? 'down' : 'hold';
      html += '<div class="resource-item"><span class="r-name">' + key.charAt(0).toUpperCase() + key.slice(1) + '</span><span class="r-val">' + safeNum(budget?.[key]).toFixed(1) + '% · ' + direction + '</span></div>';
    });
    html += '</div>';
    html += '<div style="font-size:11px;color:var(--text-secondary);margin-top:8px">This layer only steers doctrine and budgets. It does not directly inject GDP, so it stays balanced while making AI choices more coherent.</div>';
    html += '</div>';

    html += '<div class="section-card"><h4>💳 Alliance Credit Book</h4>';
    html += renderLoanRows([...(loanView.outgoing || []), ...(loanView.incoming || [])], nation.id);
    html += '</div>';

    html += '<div class="section-card"><h4>📰 Sovereign Debt Diplomacy Feed</h4>';
    html += renderDebtFeedRows(debtFeed);
    html += '</div>';

    html += '<div class="section-card" id="ia-superpowers"><h4>🌐 Superpowers & Top 50 Nations</h4>';
    html += '<div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px">Influence combines military power, finance power, diplomacy power, and corporate power. This board is scrollable and updates from the live simulation state.</div>';
    html += renderSuperpowerRows(superpowerRows);
    html += '</div>';

    html += '<div class="section-card"><h4>🗣 Internal Communication</h4>';
    html += renderCommunicationList(state.internalCommunications || [], 'No cabinet or treasury messages recorded yet.');
    html += '</div>';

    html += '<div class="section-card"><h4>🌐 External Communication</h4>';
    html += renderCommunicationList(state.externalCommunications || [], 'No diplomatic finance traffic recorded yet.');
    html += '</div>';

    // ── DIPLOMACY SECTION ──
    html += renderInternalAffairsDiplomacySection(nationId);

    html += '<div class="section-card"><h4>🗂 Internal Record</h4>';
    if (!history.length) {
      html += '<p class="empty">No cabinet notes recorded yet.</p>';
    } else {
      history.slice(0, 8).forEach(entry => {
        html += '<div style="padding:6px 8px;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px">';
        html += '<div style="color:var(--text-muted);margin-bottom:2px">Turn ' + safeNum(entry.turn) + '</div>';
        html += '<div style="color:var(--text-secondary)">' + entry.text + '</div>';
        html += '</div>';
      });
    }
    html += '</div>';

    return html;
  }

  function showInternalAffairs(nationId) {
    if (typeof document === 'undefined') return;
    const nation = (typeof NATIONS !== 'undefined' && NATIONS[nationId])
      ? NATIONS[nationId]
      : (typeof GAME !== 'undefined' ? GAME.playerNation : null);
    if (!nation) return;
    const overlay = document.getElementById('tabOverlay');
    const title = document.getElementById('tabTitle');
    const content = document.getElementById('tabContent');
    if (!overlay || !title || !content) return;
    title.textContent = '🏛 Internal Affairs: ' + nation.name;
    content.innerHTML = renderInternalAffairsPanel(nationId);
    overlay.classList.remove('hidden');
  }

  window.ensureGovernmentState = ensureGovernmentState;
  window.reviewGovernmentState = reviewGovernmentState;
  window.applyGovernmentStrategyLayer = applyGovernmentStrategyLayer;
  window.processGovernmentDebtMarkets = processGovernmentDebtMarkets;
  window.playerOfferAllianceLoan = playerOfferAllianceLoan;
  window.playerExtendAllianceLoan = playerExtendAllianceLoan;
  window.scrollInternalAffairsSection = scrollInternalAffairsSection;
  window.renderInternalAffairsPanel = renderInternalAffairsPanel;
  window.showInternalAffairs = showInternalAffairs;
  window.getNationGovernmentSummary = getNationGovernmentSummary;
})();