(function() {
  function ngNum(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : (fallback || 0);
  }

  function ngClamp(value, min, max) {
    if (typeof clamp === 'function') return clamp(value, min, max);
    return Math.min(max, Math.max(min, value));
  }

  function ensureGovernanceStore() {
    if (typeof GAME === 'undefined') return null;
    if (!GAME.nationGovernanceAI || typeof GAME.nationGovernanceAI !== 'object') {
      GAME.nationGovernanceAI = { nations: {} };
    }
    if (!GAME.nationGovernanceAI.nations || typeof GAME.nationGovernanceAI.nations !== 'object') {
      GAME.nationGovernanceAI.nations = {};
    }
    return GAME.nationGovernanceAI;
  }

  function ensureNationGovernanceState(nationId) {
    const store = ensureGovernanceStore();
    if (!store || !nationId) return null;
    if (!store.nations[nationId]) {
      store.nations[nationId] = {
        trendHistory: [],
        amberStreak: 0,
        redStreak: 0,
        selectedStrategy: 'maintain',
        preferredBorrowChannel: 'world_bank',
        lastUpdatedTurn: -1,
        lastVetoTurn: -999,
        current: null,
      };
    }
    return store.nations[nationId];
  }

  function getNationTreasuryM(nation) {
    if (!nation) return 0;
    if (nation.id === GAME?.playerNation?.id) return Math.max(0, ngNum(GAME.treasury));
    return Math.max(0, ngNum(nation.treasury));
  }

  function setNationTreasuryM(nation, amountM) {
    const next = Math.max(0, ngNum(amountM));
    if (nation.id === GAME?.playerNation?.id) {
      GAME.treasury = next;
      nation.treasury = GAME.treasury;
      return;
    }
    nation.treasury = next;
  }

  function estimateSpendingEnvelope(nation, taxRevenue, govBudget) {
    const totalBudgetPct = ngNum(govBudget.military) + ngNum(govBudget.economy) + ngNum(govBudget.diplomacy) + ngNum(govBudget.intelligence) + ngNum(govBudget.education ?? govBudget.space) + ngNum(govBudget.social);
    const spendingMultiplier = Math.max(0, ngNum(taxRevenue)) / Math.max(totalBudgetPct, 1);
    const category = {
      military: ngNum(govBudget.military) * spendingMultiplier * 1.2,
      economy: ngNum(govBudget.economy) * spendingMultiplier * 1.0,
      diplomacy: ngNum(govBudget.diplomacy) * spendingMultiplier * 0.8,
      intelligence: ngNum(govBudget.intelligence) * spendingMultiplier * 0.7,
      education: ngNum(govBudget.education ?? govBudget.space) * spendingMultiplier * 0.9,
      social: ngNum(govBudget.social) * spendingMultiplier * 1.1,
    };
    const categoryTotal = Object.values(category).reduce((sum, value) => sum + Math.max(0, ngNum(value)), 0);
    return {
      category,
      categoryTotal,
      spendingMultiplier,
    };
  }

  function evaluateTrendFlags(history) {
    const h = Array.isArray(history) ? history : [];
    if (h.length < 3) {
      return {
        runwayDown: false,
        fiscalWorsening: false,
        macroStress: false,
      };
    }
    const a = h[h.length - 3];
    const b = h[h.length - 2];
    const c = h[h.length - 1];

    const runwayDown = c.runwayMonths < b.runwayMonths && b.runwayMonths < a.runwayMonths && c.runwayMonths < 1.8;
    const fiscalWorsening = c.deficit > b.deficit && b.deficit > a.deficit && c.deficit > 5;
    const macroStress = (
      (c.crisisRisk > b.crisisRisk && b.crisisRisk > a.crisisRisk && c.stability < b.stability) ||
      (c.inflation > b.inflation && b.inflation > a.inflation && c.inflation > 8)
    );

    return { runwayDown, fiscalWorsening, macroStress };
  }

  function getRiskTier(snapshot, badTrendCount) {
    if (!snapshot) return 'green';
    if (snapshot.treasuryM < snapshot.taxRevenueM * 0.45 || snapshot.crisisRisk > 78 || snapshot.stability < 30) {
      return 'red';
    }
    if (badTrendCount >= 2 || snapshot.deficit > 6 || snapshot.runwayMonths < 1.6) {
      return 'amber';
    }
    return 'green';
  }

  function getPrimaryDrivers(snapshot) {
    const drivers = [];
    if (!snapshot) return drivers;
    if (snapshot.education < 42) drivers.push('weak education outcomes');
    if (snapshot.resources < 34) drivers.push('low resource capacity');
    if (snapshot.inflation > 8) drivers.push('high inflation pressure');
    if (snapshot.deficit > 6) drivers.push('persistent fiscal deficit');
    if (snapshot.crisisRisk > 62) drivers.push('rising crisis risk');
    if (snapshot.stability < 46) drivers.push('fragile political stability');
    return drivers.slice(0, 3);
  }

  function buildRecommendations(tier, allowBorrow, snapshot) {
    const recommendations = [];
    if (tier === 'green') {
      recommendations.push({ id: 'maintain', title: 'Maintain and Optimize', detail: 'Hold current posture, tighten waste, and protect treasury buffer.', channel: 'none', priority: 1 });
      recommendations.push({ id: 'stabilize_cuts', title: 'Preventive Efficiency Cuts', detail: 'Apply light discretionary cuts to preserve runway while growth remains stable.', channel: 'none', priority: 2 });
      return recommendations;
    }
    if (tier === 'amber') {
      recommendations.push({ id: 'stabilize_cuts', title: 'Stabilize With Controlled Cuts', detail: 'Reduce non-core spending and defend treasury runway before debt.', channel: 'none', priority: 1 });
      recommendations.push({ id: 'world_bank', title: 'World Bank First Option', detail: 'If decline persists across all three trends, request structured World Bank support.', channel: 'world_bank', priority: 2 });
      if (allowBorrow) {
        recommendations.push({ id: 'superpower_support', title: 'Emergency Superpower Support', detail: 'Only if World Bank route is blocked and decline keeps worsening. Very high interest.', channel: 'superpower', priority: 3 });
      }
      return recommendations;
    }

    recommendations.push({ id: 'world_bank', title: 'Immediate Stabilization via World Bank', detail: 'Prioritize multilateral support first to avoid expensive bilateral dependence.', channel: 'world_bank', priority: 1 });
    recommendations.push({ id: 'superpower_support', title: 'Fallback: Superpower Emergency Credit', detail: 'Use only as last resort. Large principal, short tenor, very high interest.', channel: 'superpower', priority: 2 });
    recommendations.push({ id: 'stabilize_cuts', title: 'Emergency Spending Controls', detail: 'Freeze discretionary projects and protect continuity spending.', channel: 'none', priority: 3 });
    return recommendations;
  }

  function generateMonologue(nation, guidance) {
    const leaderTitle = nation?.leaderType || 'President';
    const leaderName = nation?.leader || nation?.name || 'Leader';
    const drivers = guidance.drivers.length ? guidance.drivers.join(', ') : 'mixed economic pressure';
    const trendText = guidance.badTrendCount >= 3
      ? 'all three risk trends are deteriorating'
      : guidance.badTrendCount === 2
        ? 'two of the three risk trends are deteriorating'
        : 'trend pressure is currently limited';
    const base = `${leaderTitle} ${leaderName}, we are seeing decline driven by ${drivers}. Right now ${trendText}.`;

    if (guidance.riskTier === 'green') {
      return `${base} My advice is to maintain stability, protect runway, and avoid borrowing while conditions remain manageable.`;
    }
    if (guidance.riskTier === 'amber') {
      if (guidance.allowBorrow) {
        return `${base} We should continue controlled cuts, but we can prepare a World Bank request if this persists. Superpower borrowing should remain a last-resort fallback only.`;
      }
      return `${base} My proposal is to cut discretionary spending now and avoid borrowing until all three trends confirm sustained deterioration.`;
    }
    return `${base} My proposal is World Bank first. If that path is blocked or delayed, we should use emergency superpower support with high interest to prevent state failure.`;
  }

  function updateNationGovernanceGuidance(nation) {
    if (!nation || nation.failedState) return null;
    const node = ensureNationGovernanceState(nation.id);
    if (!node) return null;
    const turn = ngNum(GAME?.turn);

    const taxRevenueM = Math.max(0, ngNum(nation.taxRevenue));
    const treasuryM = getNationTreasuryM(nation);
    const runwayMonths = treasuryM / Math.max(1, taxRevenueM * 0.9);

    const snapshot = {
      turn,
      treasuryM,
      taxRevenueM,
      runwayMonths,
      deficit: ngNum(nation.deficit),
      inflation: ngNum(nation.inflation),
      stability: ngNum(nation.stability),
      crisisRisk: ngNum(nation.crisisRisk),
      education: ngNum(nation.education),
      resources: ngNum(nation.resources),
    };

    node.trendHistory.push(snapshot);
    if (node.trendHistory.length > 10) node.trendHistory.shift();

    const trendFlags = evaluateTrendFlags(node.trendHistory);
    const badTrendCount = [trendFlags.runwayDown, trendFlags.fiscalWorsening, trendFlags.macroStress].filter(Boolean).length;
    const riskTier = getRiskTier(snapshot, badTrendCount);

    node.amberStreak = riskTier === 'amber' ? node.amberStreak + 1 : 0;
    node.redStreak = riskTier === 'red' ? node.redStreak + 1 : 0;

    const allowBorrow = riskTier === 'red' || (riskTier === 'amber' && badTrendCount === 3 && node.amberStreak >= 2);
    const drivers = getPrimaryDrivers(snapshot);
    const recommendations = buildRecommendations(riskTier, allowBorrow, snapshot);

    if (!node.selectedStrategy || node.lastUpdatedTurn < turn) {
      if (riskTier === 'green') node.selectedStrategy = 'maintain';
      else if (riskTier === 'amber') node.selectedStrategy = allowBorrow ? 'world_bank' : 'stabilize_cuts';
      else node.selectedStrategy = 'world_bank';
    }

    const selectedRecommendation = recommendations.find(item => item.id === node.selectedStrategy) || recommendations[0] || null;

    node.current = {
      nationId: nation.id,
      turn,
      riskTier,
      allowBorrow,
      badTrendCount,
      trendFlags,
      amberStreak: node.amberStreak,
      redStreak: node.redStreak,
      drivers,
      recommendations,
      selectedStrategy: node.selectedStrategy,
      preferredBorrowChannel: node.preferredBorrowChannel,
      monologue: generateMonologue(nation, {
        riskTier,
        allowBorrow,
        badTrendCount,
        drivers,
      }),
      runwayMonths,
      treasuryM,
      taxRevenueM,
    };

    node.lastUpdatedTurn = turn;
    return node.current;
  }

  function processNationGovernanceTick() {
    if (typeof NATIONS === 'undefined') return;
    Object.values(NATIONS).forEach(nation => {
      if (!nation || nation.failedState) return;
      updateNationGovernanceGuidance(nation);
    });
  }

  function getNationGovernanceGuidance(nationId) {
    const nation = NATIONS?.[nationId];
    if (!nation) return null;
    const node = ensureNationGovernanceState(nationId);
    if (!node) return null;
    if (!node.current || node.current.turn !== ngNum(GAME?.turn)) {
      return updateNationGovernanceGuidance(nation);
    }
    return node.current;
  }

  function getBorrowReviewChance(governmentStyle, riskTier) {
    const base = {
      liberal_democracy: 0.12,
      federal_republic: 0.1,
      constitutional_monarchy: 0.08,
      technocratic_council: 0.06,
      socialist_republic: 0.07,
      authoritarian_state: 0.04,
      military_junta: 0.03,
      dictatorship: 0.02,
      theocratic_state: 0.04,
    };
    let chance = ngNum(base[governmentStyle], 0.06);
    if (riskTier === 'red') chance *= 0.55;
    return ngClamp(chance, 0.01, 0.2);
  }

  function runBorrowingReview(nation, guidance, amountT, channel) {
    const vetoChance = getBorrowReviewChance(nation.governmentStyle, guidance.riskTier);
    const vetoed = Math.random() < vetoChance;
    if (!vetoed) return { approved: true, reason: 'approved' };
    const reason = `Legislative review paused ${channel} borrowing of ${amountT.toFixed(2)}T to protect long-term fiscal interest. Cabinet requests revised terms.`;
    if (typeof pushGovernmentMessage === 'function') {
      pushGovernmentMessage(nation, 'internal', reason);
      pushGovernmentMessage(nation, 'external', `${nation.name} delayed borrowing decision pending review of national-interest terms.`);
    }
    return { approved: false, reason: 'vetoed' };
  }

  function hasActiveEmergencyLoan(nationId) {
    return Array.isArray(GAME?.sovereignLoans) && GAME.sovereignLoans.some(loan =>
      loan.borrowerId === nationId && loan.type === 'superpower_emergency' && ['active', 'delinquent'].includes(loan.status)
    );
  }

  function hasActiveWorldBankTrack(nationId) {
    const wb = GAME?.worldBank;
    if (!wb) return false;
    const activeLoan = Array.isArray(wb.loans) && wb.loans.some(loan =>
      loan.borrowerId === nationId && ['active', 'delinquent', 'restructuring'].includes(loan.status)
    );
    const activeProposal = Array.isArray(wb.proposals) && wb.proposals.some(proposal =>
      proposal.borrowerId === nationId && ['pending', 'under_review', 'countered'].includes(proposal.status)
    );
    return !!(activeLoan || activeProposal);
  }

  function selectSuperpowerLender(borrower, amountT) {
    if (typeof NATIONS === 'undefined') return null;
    const amountM = amountT * 1_000_000;
    let best = null;

    Object.values(NATIONS).forEach(nation => {
      if (!nation || nation.failedState || nation.id === borrower.id) return;
      if (ngNum(nation.gdp) < 3) return;
      const treasury = getNationTreasuryM(nation);
      if (treasury < amountM * 1.15) return;
      const rel = typeof getRelationBetween === 'function' ? ngNum(getRelationBetween(borrower.id, nation.id)) : 0;
      const score = ngNum(nation.gdp) * 12 + treasury / 10000 + Math.max(0, rel) * 2;
      if (!best || score > best.score) best = { nation, score, rel };
    });

    return best ? best.nation : null;
  }

  function maybeIssueSuperpowerEmergencySupport(nation) {
    const guidance = getNationGovernanceGuidance(nation.id);
    if (!guidance) return;
    if (!guidance.allowBorrow) return;
    if (guidance.selectedStrategy !== 'superpower_support' && guidance.riskTier !== 'red') return;
    if (hasActiveEmergencyLoan(nation.id)) return;

    const wbPrimaryActive = hasActiveWorldBankTrack(nation.id);
    if (guidance.riskTier === 'amber' && wbPrimaryActive) return;

    const wbCooldownTurn = ngNum(GAME?.worldBank?.declineCooldowns?.[nation.id], -999);
    const wbRecentlyDeclined = ngNum(GAME?.turn) - wbCooldownTurn <= 8;
    if (guidance.riskTier !== 'red' && !wbRecentlyDeclined) return;

    const amountT = ngClamp(ngNum(nation.gdp) * (guidance.riskTier === 'red' ? 0.06 : 0.04), 0.08, 5.2);
    const lender = selectSuperpowerLender(nation, amountT);
    if (!lender) return;

    const review = runBorrowingReview(nation, guidance, amountT, 'superpower emergency');
    if (!review.approved) return;

    if (!Array.isArray(GAME.sovereignLoans)) GAME.sovereignLoans = [];

    const annualRate = ngClamp(18 + Math.max(0, 60 - ngNum(nation.stability)) * 0.08 + Math.max(0, ngNum(nation.crisisRisk) - 60) * 0.07, 18, 32);
    const months = ngClamp(Math.round(guidance.riskTier === 'red' ? 10 : 12), 6, 16);
    const monthlyDue = (amountT * (1 + (annualRate / 100) * (months / 12))) / months;

    const loan = {
      id: `sp_emergency_${GAME.turn}_${nation.id}_${lender.id}_${Math.floor(Math.random() * 10000)}`,
      lenderId: lender.id,
      borrowerId: nation.id,
      principal: amountT,
      outstanding: amountT,
      annualRate,
      monthlyDue,
      startTurn: ngNum(GAME.turn),
      dueTurn: ngNum(GAME.turn) + months,
      months,
      status: 'active',
      collateral: null,
      missedPayments: 0,
      extensions: 0,
      recoveredT: 0,
      lastPaymentTurn: ngNum(GAME.turn) - 1,
      profile: 'superpower emergency support',
      type: 'superpower_emergency',
      isManual: false,
    };

    const amountM = amountT * 1_000_000;
    const lenderTreasury = getNationTreasuryM(lender);
    if (lenderTreasury < amountM) return;

    setNationTreasuryM(lender, lenderTreasury - amountM);
    setNationTreasuryM(nation, getNationTreasuryM(nation) + amountM);

    GAME.sovereignLoans.push(loan);

    if (typeof recordNationFinanceFlow === 'function') {
      recordNationFinanceFlow(lender, 'outflows', 'loan_disbursement', amountM, {
        note: 'Superpower emergency support disbursement',
        counterparty: nation.name,
        context: 'superpower-emergency-loan',
      });
      recordNationFinanceFlow(nation, 'inflows', 'loan_proceeds', amountM, {
        note: 'Superpower emergency support proceeds',
        counterparty: lender.name,
        context: 'superpower-emergency-loan',
      });
    }

    if (typeof pushGovernmentMessage === 'function') {
      pushGovernmentMessage(nation, 'internal', `Emergency desk update: ${lender.name} approved high-interest support (${amountT.toFixed(2)}T at ${annualRate.toFixed(1)}% annual). This is a last-resort bridge.`);
      pushGovernmentMessage(nation, 'external', `${lender.name} extends emergency sovereign support to stabilize ${nation.name}. Terms are strict and short-tenor.`);
      pushGovernmentMessage(lender, 'internal', `Sovereign desk approved emergency credit to ${nation.name} at high risk-adjusted yield (${annualRate.toFixed(1)}%).`);
    }

    if (typeof addNews === 'function') {
      addNews(`🏦 ${nation.flag || ''} ${nation.name} secures emergency superpower support from ${lender.flag || ''} ${lender.name}: ${amountT.toFixed(2)}T at ${annualRate.toFixed(1)}%.`, 'major');
    }
  }

  function processNationGovernanceEmergencySupport() {
    if (typeof NATIONS === 'undefined') return;
    Object.values(NATIONS).forEach(nation => {
      if (!nation || nation.failedState) return;
      maybeIssueSuperpowerEmergencySupport(nation);
    });
  }

  function setNationGovernanceDecision(nationId, decisionId) {
    const nation = NATIONS?.[nationId];
    if (!nation) return;
    const node = ensureNationGovernanceState(nationId);
    if (!node) return;
    node.selectedStrategy = decisionId;
    if (decisionId === 'world_bank') node.preferredBorrowChannel = 'world_bank';
    if (decisionId === 'superpower_support') node.preferredBorrowChannel = 'superpower';

    const guidance = getNationGovernanceGuidance(nationId);
    if (typeof pushGovernmentMessage === 'function') {
      pushGovernmentMessage(nation, 'internal', `Policy direction updated: ${decisionId.replace(/_/g, ' ')} selected for this cycle.`);
    }

    if (typeof document !== 'undefined' && typeof showInternalAffairs === 'function') {
      showInternalAffairs(nationId);
    }

    return guidance;
  }

  function getNationCashAwareSpendingPlan(nation, payload) {
    if (!nation || !payload) return null;

    const guidance = getNationGovernanceGuidance(nation.id);
    const taxData = payload.taxData || { total: 0 };
    const govBudget = payload.govBudget || { military: 20, economy: 20, diplomacy: 15, intelligence: 10, education: 10, social: 25 };
    const envelope = estimateSpendingEnvelope(nation, ngNum(taxData.total), govBudget);

    const rawCategory = envelope.category;
    const rawCategoryTotal = envelope.categoryTotal;
    const debtServiceRaw = ngNum(payload.debtService);
    const totalRevenue = Math.max(0, ngNum(payload.totalRevenue));
    const treasury = getNationTreasuryM(nation);

    const tier = guidance?.riskTier || 'green';
    const reserveMonths = tier === 'red' ? 3.0 : tier === 'amber' ? 2.2 : 1.5;
    const coreBaseline = rawCategory.economy + rawCategory.social + rawCategory.military * 0.35 + rawCategory.intelligence * 0.25;
    const reserveBuffer = Math.max(120, coreBaseline * reserveMonths);

    const rawTotalExpenses = rawCategoryTotal + debtServiceRaw;
    const spendCap = Math.max(0, Math.min(rawTotalExpenses, treasury + totalRevenue - reserveBuffer));

    const category = { ...rawCategory };
    let debtService = debtServiceRaw;

    if (spendCap < rawTotalExpenses) {
      debtService = Math.min(debtServiceRaw, spendCap);
      let targetCategorySpend = Math.max(0, spendCap - debtService);
      const currentCategorySpend = Object.values(category).reduce((sum, value) => sum + value, 0);

      if (targetCategorySpend < currentCategorySpend) {
        let cutNeeded = currentCategorySpend - targetCategorySpend;
        const cutOrder = ['education', 'diplomacy', 'intelligence', 'military', 'economy', 'social'];

        cutOrder.forEach(key => {
          if (cutNeeded <= 0) return;
          const raw = ngNum(rawCategory[key]);
          const floorRatio = (key === 'economy' || key === 'social') ? 0.55 : (key === 'military' ? 0.35 : 0.15);
          const minAllowed = raw * floorRatio;
          const availableCut = Math.max(0, category[key] - minAllowed);
          const cut = Math.min(availableCut, cutNeeded);
          category[key] = Math.max(minAllowed, category[key] - cut);
          cutNeeded -= cut;
        });

        if (cutNeeded > 0) {
          const keys = Object.keys(category);
          const pool = keys.reduce((sum, key) => sum + Math.max(0, category[key]), 0);
          if (pool > 0) {
            keys.forEach(key => {
              const extraCut = cutNeeded * (Math.max(0, category[key]) / pool);
              category[key] = Math.max(0, category[key] - extraCut);
            });
            cutNeeded = 0;
          }
        }
      }
    }

    const categoryTotal = Object.values(category).reduce((sum, value) => sum + Math.max(0, ngNum(value)), 0);
    const totalExpenses = categoryTotal + debtService;

    return {
      category,
      debtService,
      totalExpenses,
      reserveBuffer,
      rawTotalExpenses,
      spendCap,
      throttled: totalExpenses + 0.01 < rawTotalExpenses,
    };
  }

  function renderNationGovernanceAdvisorCard(nationId) {
    const nation = NATIONS?.[nationId];
    const guidance = getNationGovernanceGuidance(nationId);
    if (!nation || !guidance) return '';

    const riskColor = guidance.riskTier === 'red'
      ? 'var(--accent-red)'
      : guidance.riskTier === 'amber'
        ? 'var(--accent-yellow)'
        : 'var(--accent-green)';

    let html = '<div class="section-card" style="border:1px solid rgba(84,140,196,0.35)">';
    html += '<h4>🧭 National Governance Advisory</h4>';
    html += '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:6px">';
    html += '<span style="font-size:11px;color:var(--text-secondary)">Risk tier</span>';
    html += '<strong style="color:' + riskColor + ';text-transform:uppercase">' + guidance.riskTier + '</strong>';
    html += '</div>';
    html += '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">' + guidance.monologue + '</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">';
    html += '<div class="resource-item"><span class="r-name">Runway</span><span class="r-val">' + guidance.runwayMonths.toFixed(2) + 'm</span></div>';
    html += '<div class="resource-item"><span class="r-name">Bad Trends</span><span class="r-val">' + guidance.badTrendCount + '/3</span></div>';
    html += '<div class="resource-item"><span class="r-name">Borrowing</span><span class="r-val">' + (guidance.allowBorrow ? 'Allowed' : 'Blocked') + '</span></div>';
    html += '</div>';

    html += '<div style="display:grid;gap:6px">';
    (guidance.recommendations || []).forEach(rec => {
      const active = guidance.selectedStrategy === rec.id;
      html += '<button class="btn-sm" onclick="setNationGovernanceDecision(\'' + nation.id + '\',\'' + rec.id + '\')" style="text-align:left;padding:7px 8px;border:' + (active ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)') + ';background:' + (active ? 'rgba(34,77,122,0.55)' : 'rgba(9,28,54,0.42)') + '">';
      html += '<div style="display:flex;justify-content:space-between;gap:8px"><strong>' + rec.title + '</strong><span style="font-size:10px;color:var(--text-muted)">P' + rec.priority + '</span></div>';
      html += '<div style="font-size:11px;color:var(--text-secondary);margin-top:2px">' + rec.detail + '</div>';
      html += '</button>';
    });
    html += '</div>';

    html += '</div>';
    return html;
  }

  window.ensureNationGovernanceState = ensureNationGovernanceState;
  window.processNationGovernanceTick = processNationGovernanceTick;
  window.processNationGovernanceEmergencySupport = processNationGovernanceEmergencySupport;
  window.getNationGovernanceGuidance = getNationGovernanceGuidance;
  window.setNationGovernanceDecision = setNationGovernanceDecision;
  window.getNationCashAwareSpendingPlan = getNationCashAwareSpendingPlan;
  window.renderNationGovernanceAdvisorCard = renderNationGovernanceAdvisorCard;
})();
