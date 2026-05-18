/**
 * World Bank & IMF System - Multilateral lending, collateral management,
 * default escalation, and bailout protocols.
 * 
 * Economic Flow Integration:
 * - Loans deduct from lender treasury, add to borrower treasury
 * - Repayments flow back proportionally to all lenders
 * - Default triggers collateral seizure (stocks, military, resources, tax revenue)
 * - GDP impact from loan inflows/outflows and collateral transfers
 */

// ============================================================
// WORLD BANK STATE INITIALIZATION
// ============================================================

function initWorldBankState() {
  if (!GAME.worldBank) {
    GAME.worldBank = {
      capital: 0,              // Total contributed capital
      contributions: {},       // { nationId: amount }
      votingPower: {},         // { nationId: power }
      loans: [],               // Multilateral loans
      proposals: [],           // Pending loan proposals
      bailouts: [],            // IMF bailout programs
      creditRatings: {},       // { nationId: { score, outlook, turn } }
      defaultHistory: [],      // Historical defaults
      transactions: [],        // All transaction history
      declineCooldowns: {},    // { nationId: turn } - cooldown after decline
      turn: 0,
    };
  }
  if (!GAME.worldBank.loans) GAME.worldBank.loans = [];
  if (!GAME.worldBank.proposals) GAME.worldBank.proposals = [];
  if (!GAME.worldBank.bailouts) GAME.worldBank.bailouts = [];
  if (!GAME.worldBank.creditRatings) GAME.worldBank.creditRatings = {};
  if (!GAME.worldBank.defaultHistory) GAME.worldBank.defaultHistory = [];
  if (!GAME.worldBank.contributions) GAME.worldBank.contributions = {};
  if (!GAME.worldBank.votingPower) GAME.worldBank.votingPower = {};
  if (!GAME.worldBank.transactions) GAME.worldBank.transactions = [];
  if (!GAME.worldBank.declineCooldowns) GAME.worldBank.declineCooldowns = {};
}

function addWorldBankTransaction(type, loanId, nationId, amountM, details) {
  initWorldBankState();
  GAME.worldBank.transactions.unshift({
    id: `txn_${GAME.turn}_${Math.floor(Math.random() * 99999)}`,
    type,          // 'loan_issued', 'payment', 'default', 'collateral_seized', 'bailout', 'state_recovery', 'contribution'
    loanId,
    nationId,
    amountM,
    turn: GAME.turn,
    date: GAME.date ? GAME.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : `Turn ${GAME.turn}`,
    details: details || '',
  });
  // Keep last 200 transactions
  if (GAME.worldBank.transactions.length > 200) {
    GAME.worldBank.transactions = GAME.worldBank.transactions.slice(0, 200);
  }
}

function computeNationLiquidityNeedM(nation) {
  const taxRevenueM = Math.max(1, Number(nation.taxRevenue || 1));
  const treasuryM = nation.id === GAME.playerNation.id ? Number(GAME.treasury || 0) : Number(nation.treasury || 0);
  const gdpMonthlyM = Math.max(1, Number(nation.gdp || 0.2) * 1_000_000 / 12);
  const deficitRatio = Math.max(0, Number(nation.deficit || 0)) / 100;
  const monthlyShortfallM = Math.max(0, gdpMonthlyM * deficitRatio);
  const reserveTargetM = Math.max(taxRevenueM * 4, gdpMonthlyM * 0.6);
  const liquidityGapM = Math.max(0, reserveTargetM + monthlyShortfallM * 3 - treasuryM);
  return {
    treasuryM,
    taxRevenueM,
    monthlyShortfallM,
    liquidityGapM,
  };
}

function computeNeedBasedWorldBankLoanAmount(borrower, rating, needScore) {
  const creditMult = clamp(Number(rating?.score || 40) / 55, 0.35, 1.6);
  const liquidity = computeNationLiquidityNeedM(borrower);
  const stabilityStress = Math.max(0, 55 - Number(borrower.stability || 50));
  const crisisStress = Math.max(0, Number(borrower.crisisRisk || 0) - 35);
  const debtStress = Math.max(0, Number(borrower.debtRatio || 0) - 95);

  const baselineB = Number(borrower.gdp || 0.2) * (0.004 + Math.max(0, needScore) * 0.00022) * creditMult;
  const liquidityCoverB = (liquidity.liquidityGapM / 1000) * clamp(0.35 + Number(rating?.score || 40) / 220, 0.25, 0.75);
  const stressReserveB = (stabilityStress * 0.003 + crisisStress * 0.0025 + debtStress * 0.0018);

  const minLoanB = Math.max(0.01, Math.min(0.12, Number(borrower.gdp || 0.2) * 0.002));
  const maxLoanB = clamp(Number(borrower.gdp || 0.2) * 0.18, 0.2, 6.0);

  return clamp(baselineB + liquidityCoverB + stressReserveB, minLoanB, maxLoanB);
}

function getGlobalDefenseCompanyById(companyId) {
  if (typeof DEFENSE_COMPANIES === 'undefined') return null;
  const company = (DEFENSE_COMPANIES || []).find(c => c && c.id === companyId && c.foundedBy);
  if (!company) return null;
  const nation = NATIONS[company.foundedBy] || null;
  return { company, nation };
}

function getLoanLenderAmountM(lender) {
  if (!lender) return 0;
  if (lender.amountM !== undefined) return Math.max(0, Number(lender.amountM || 0));
  return Math.max(0, Number(lender.amount || 0) * 1000);
}

function getLoanLenderReceivedM(lender) {
  if (!lender) return 0;
  if (lender.receivedM !== undefined) return Math.max(0, Number(lender.receivedM || 0));
  return Math.max(0, Number(lender.received || 0));
}

function getWorldBankLenderEntity(lender) {
  if (!lender) return null;
  if (lender.entityType === 'company') {
    const defenseFound = getGlobalDefenseCompanyById(lender.companyId);
    if (defenseFound) return defenseFound;
    if (typeof getGlobalCompanyById === 'function') return getGlobalCompanyById(lender.companyId);
    return null;
  }
  if (lender.nationId) {
    return { nation: NATIONS[lender.nationId] || null, company: null };
  }
  return null;
}

function getWorldBankLenderLabel(lender) {
  const entity = getWorldBankLenderEntity(lender);
  if (!entity) return 'Unknown lender';
  if (lender?.entityType === 'company' && entity.company) {
    const companyName = entity.company.name || (typeof getCompanyDisplayName === 'function' ? getCompanyDisplayName(entity.company) : (lender.companyId || 'Company'));
    return `${entity.nation?.flag || '🏳️'} ${companyName}`;
  }
  if (entity.nation) return `${entity.nation.flag || '🏳️'} ${entity.nation.name || lender.nationId}`;
  return 'Unknown lender';
}

function creditWorldBankLender(lender, paymentM) {
  const payment = Math.max(0, Number(paymentM || 0));
  if (!lender || payment <= 0) return;
  lender.receivedM = Math.max(0, Number(lender.receivedM || 0) + payment);
  const entity = getWorldBankLenderEntity(lender);
  if (!entity) return;

  if (lender.entityType === 'company' && entity.company) {
    if (typeof initDefenseCompanyFinancials === 'function') initDefenseCompanyFinancials(entity.company);
    entity.company.privateCreditCapitalM = Math.max(0, Number(entity.company.privateCreditCapitalM || 0) + payment);
    entity.company.loanInterestIncome = Math.max(0, Number(entity.company.loanInterestIncome || 0) + payment);
    entity.company.investmentIncome = Math.max(0, Number(entity.company.investmentIncome || 0) + payment * 0.7);
    entity.company.worldBankLoanReceiptsM = Math.max(0, Number(entity.company.worldBankLoanReceiptsM || 0) + payment);
    return;
  }

  if (entity.nation?.id === GAME.playerNation.id) {
    GAME.treasury += payment;
  } else if (entity.nation) {
    entity.nation.treasury = (entity.nation.treasury || 0) + payment;
    entity.nation.gdp = clamp(entity.nation.gdp + payment / 1000 * 0.005, 0.05, 100);
  }
  if (typeof recordNationFinanceFlow === 'function' && entity.nation) {
    recordNationFinanceFlow(entity.nation, 'inflows', 'loan_repayment', payment);
  }
}

function getEligibleWorldBankCompanies(limit = 15) {
  const companies = [];
  if (typeof DEFENSE_COMPANIES === 'undefined') return companies;
  (DEFENSE_COMPANIES || []).forEach(company => {
    if (!company || !company.foundedBy) return;
    const nation = NATIONS[company.foundedBy];
    if (!nation || nation.failedState) return;
    if (typeof initDefenseCompanyFinancials === 'function') initDefenseCompanyFinancials(company);

    const revenue = Math.max(0, Number(company.totalRevenue || 0));
    const researchCost = Math.max(0, Number(company.totalResearchCost || 0));
    const pnl = revenue - researchCost;
    const marketValue = typeof getDefenseCompanyMarketValue === 'function'
      ? Math.max(0, Number(getDefenseCompanyMarketValue(company) || 0))
      : Math.max(0, revenue * 1.2);

    if (!Number.isFinite(Number(company.privateCreditCapitalM))) {
      company.privateCreditCapitalM = Math.max(25, revenue * 0.38 + Math.max(0, pnl) * 0.85 + marketValue * 0.06);
    }

    const liquidityReserve = Math.max(12, revenue * 0.12);
    const lendableCapital = Math.max(0, Number(company.privateCreditCapitalM || 0) - liquidityReserve);
    const pnlMargin = revenue > 0 ? pnl / revenue : -1;

    if (lendableCapital < 20 || marketValue < 90 || revenue < 10 || pnlMargin < -0.2) return;
    const score = lendableCapital * 0.62 + marketValue * 0.2 + revenue * 0.2 + Math.max(-20, pnlMargin * 140);
    companies.push({ nation, company, lendableCapital, score, pnl, marketValue, revenue });
  });
  return companies.sort((a, b) => b.score - a.score).slice(0, Math.max(1, limit));
}

function processCompanySovereignLoanApplications() {
  initWorldBankState();
  const wb = GAME.worldBank;
  const nations = Object.values(NATIONS || {}).filter(n => n && !n.failedState);
  const eligibleCompanies = getEligibleWorldBankCompanies(20);
  if (eligibleCompanies.length === 0) return;

  nations.forEach(borrower => {
    const existingCorporateLoan = wb.loans.find(loan => loan.borrowerId === borrower.id && loan.type === 'corporate_private_credit' && ['active', 'delinquent', 'restructuring'].includes(loan.status));
    if (existingCorporateLoan) return;

    const rating = wb.creditRatings[borrower.id] || computeWorldBankCreditRating(borrower);
    const treasury = borrower.id === GAME.playerNation.id ? GAME.treasury : Number(borrower.treasury || 0);
    const stressScore = Math.max(0, Number(borrower.debtRatio || 0) - 70) + Math.max(0, Number(borrower.crisisRisk || 0) - 45) + Math.max(0, 120 - treasury / Math.max(1, Number(borrower.taxRevenue || 1)));
    if (stressScore < 28 || rating.score < 18) return;
    // Reduce corporate private-credit application frequency to be less aggressive
    if (Math.random() > clamp(0.05 + stressScore * 0.003, 0.05, 0.30)) return;

    const lenderPool = eligibleCompanies.filter(entry => entry.nation.id !== borrower.id);
    if (lenderPool.length === 0) return;

    const selected = lenderPool.slice(0, 4);
    const totalLendableM = selected.reduce((sum, entry) => sum + entry.lendableCapital, 0);
    const requestedAmountB = clamp(Math.min(Math.max(0.01, borrower.gdp * 0.018 + stressScore * 0.0025), totalLendableM / 1000 * 0.45), 0.01, 2.8);
    const requestedAmountM = requestedAmountB * 1000;
    // Require slightly larger private-credit facilities to avoid tiny churny loans
    if (requestedAmountM < 20) return;

    const totalScore = selected.reduce((sum, entry) => sum + entry.score, 0);
    const lenders = [];
    let fundedM = 0;
    selected.forEach(entry => {
      const share = entry.score / Math.max(1, totalScore);
      const desiredM = requestedAmountM * share;
      const amountM = Math.min(entry.lendableCapital, desiredM);
      if (amountM <= 0) return;
      entry.company.privateCreditCapitalM = Math.max(0, Number(entry.company.privateCreditCapitalM || 0) - amountM);
      entry.company.worldBankLoanExposureM = Math.max(0, Number(entry.company.worldBankLoanExposureM || 0) + amountM);
      fundedM += amountM;
      lenders.push({
        entityType: 'company',
        companyId: entry.company.id,
        hostNationId: entry.nation.id,
        share: 0,
        amount: amountM / 1000,
        amountM,
        receivedM: 0,
      });
    });
    if (fundedM < 40 || lenders.length === 0) return;
    lenders.forEach(lender => {
      lender.share = lender.amountM / fundedM;
    });

    const interestRate = clamp(24 + (100 - rating.score) * 0.19 + Math.max(0, Number(borrower.debtRatio || 0) - 80) * 0.09, 24, 58);
    const termMonths = clamp(6 + Math.floor(rating.score / 16), 4, 12);
    const loan = {
      id: `corp_loan_${GAME.turn}_${borrower.id}_${Math.floor(Math.random() * 9999)}`,
      type: 'corporate_private_credit',
      borrowerId: borrower.id,
      amount: fundedM / 1000,
      interestRate,
      termMonths,
      monthlyPayment: ((fundedM / 1000) * (1 + interestRate / 100)) / termMonths,
      remainingMonths: termMonths,
      status: 'active',
      createdTurn: GAME.turn,
      dueTurn: GAME.turn + termMonths,
      lenders,
      collateral: null,
      strictPrivateCredit: true,
      missedPayments: 0,
      extensions: 0,
      totalRepaid: 0,
      unpaidAccruedM: 0,
      loanReason: { title: 'Defense private credit', category: 'private_credit', reason: `${borrower.name} entered a high-interest no-collateral private credit facility backed by defense contractors.` },
    };
    wb.loans.push(loan);

    if (borrower.id === GAME.playerNation.id) {
      GAME.treasury += fundedM;
      borrower.treasury = GAME.treasury;
    } else {
      borrower.treasury = (borrower.treasury || 0) + fundedM;
    }
    if (typeof adjustNationDebtStockM === 'function') {
      adjustNationDebtStockM(borrower, fundedM, 'worldbank_corporate_private_credit');
    }
    borrower.crisisRisk = clamp(Number(borrower.crisisRisk || 0) - fundedM / 1000 * 3, 0, 100);
    borrower.stability = clamp(Number(borrower.stability || 0) + fundedM / 1000 * 2, 1, 100);
    if (typeof recordNationFinanceFlow === 'function') {
      recordNationFinanceFlow(borrower, 'inflows', 'loan_proceeds', fundedM, { note: 'Corporate private credit facility', context: 'corporate-private-credit' });
    }

    const lenderNames = lenders.map(getWorldBankLenderLabel).join(', ');
    addWorldBankTransaction('company_loan_issued', loan.id, borrower.id, fundedM, `${borrower.flag} ${borrower.name} borrowed $${fundedM.toFixed(0)}M from ${lenderNames} at ${interestRate.toFixed(1)}% private-credit terms.`);
    if (typeof addNews === 'function') {
      addNews(`🏢 Private Credit: ${borrower.flag} ${borrower.name} secures $${fundedM.toFixed(0)}M from ${lenderNames} at ${interestRate.toFixed(1)}% over ${termMonths} months.`, 'major');
    }
  });
}

// ============================================================
// CREDIT RATING AGENCY
// ============================================================

function computeWorldBankCreditRating(nation) {
  initWorldBankState();
  const wb = GAME.worldBank;
  
  const gdp = Number(nation.gdp || 0.2);
  const stability = Number(nation.stability || 50);
  const governance = Number(nation.governance || 50);
  const debtRatio = Number(nation.debtRatio || 30);
  const crisisRisk = Number(nation.crisisRisk || 20);
  const inflation = Number(nation.inflation || 3);
  
  // Base score from fundamentals
  let score = 50;
  score += (gdp - 0.5) * 15;           // GDP factor
  score += (stability - 50) * 0.3;     // Stability factor
  score += (governance - 50) * 0.25;   // Governance factor
  score -= (debtRatio - 50) * 0.2;     // Debt penalty
  score -= (crisisRisk - 30) * 0.25;   // Crisis risk penalty
  score -= (inflation - 4) * 2;        // Inflation penalty
  
  // Existing loan history
  const existingLoans = wb.loans.filter(l => l.borrowerId === nation.id && ['active', 'delinquent'].includes(l.status));
  const missedPayments = existingLoans.reduce((sum, l) => sum + (l.missedPayments || 0), 0);
  score -= missedPayments * 5;
  
  // Default history
  const pastDefaults = wb.defaultHistory.filter(d => d.nationId === nation.id).length;
  score -= pastDefaults * 10;
  
  score = Math.max(10, Math.min(95, Math.round(score)));
  
  // Outlook determination
  let outlook = 'stable';
  if (stability < 40 || crisisRisk > 60) outlook = 'negative';
  else if (stability > 65 && crisisRisk < 25) outlook = 'positive';
  
  wb.creditRatings[nation.id] = {
    score,
    outlook,
    turn: GAME.turn,
    gdp,
    stability,
    debtRatio,
  };
  
  return wb.creditRatings[nation.id];
}

function getCreditRatingLabel(score) {
  if (score >= 80) return { label: 'AAA', color: 'var(--accent-green)' };
  if (score >= 70) return { label: 'AA', color: 'var(--accent-green)' };
  if (score >= 60) return { label: 'A', color: 'var(--accent-blue)' };
  if (score >= 50) return { label: 'BBB', color: 'var(--accent-blue)' };
  if (score >= 40) return { label: 'BB', color: 'var(--accent-yellow)' };
  if (score >= 30) return { label: 'B', color: 'var(--accent-yellow)' };
  if (score >= 20) return { label: 'CCC', color: 'var(--accent-red)' };
  return { label: 'D', color: 'var(--accent-red)' };
}

// ============================================================
// WORLD BANK CAPITAL CONTRIBUTIONS
// ============================================================

function processWorldBankCapitalContributions() {
  initWorldBankState();
  const wb = GAME.worldBank;
  const nations = (GAME?.turnCache && GAME.turnCache.turn === GAME.turn && Array.isArray(GAME.turnCache.aliveNations))
    ? GAME.turnCache.aliveNations
    : Object.values(NATIONS).filter(n => !n.failedState);
  
  // Nations contribute based on GDP (rich nations contribute more)
  nations.forEach(nation => {
    if (nation.failedState) return;
    
    const gdp = Number(nation.gdp || 0.2);
    if (gdp < 0.5) return;  // Only nations with GDP > 0.5T contribute
    
    const contributionChance = clamp(0.1 + gdp * 0.05, 0.05, 0.35);
    if (Math.random() > contributionChance) return;
    
    const contribution = clamp(gdp * 0.005, 0.01, 0.5);  // 0.5% of GDP
    
    wb.contributions[nation.id] = (wb.contributions[nation.id] || 0) + contribution;
    wb.capital += contribution;
    
    // Voting power proportional to contribution
    wb.votingPower[nation.id] = wb.contributions[nation.id] / wb.capital * 100;
    
    // Small GDP cost for contribution
    nation.gdp = clamp(nation.gdp - contribution * 0.01, 0.05, 100);
  });
}

// ============================================================
// MULTILATERAL LOAN CREATION
// ============================================================

function processWorldBankLoanApplications() {
  initWorldBankState();
  const wb = GAME.worldBank;
  const nations = (GAME?.turnCache && GAME.turnCache.turn === GAME.turn && Array.isArray(GAME.turnCache.aliveNations))
    ? GAME.turnCache.aliveNations
    : Object.values(NATIONS).filter(n => !n.failedState);
  
  // First process existing proposals
  processWorldBankProposals();
  
  // Find nations that need loans and create proposals
  nations.forEach(borrower => {
    if (borrower.failedState) return;
    
    const rating = computeWorldBankCreditRating(borrower);
    if (rating.score < 20) return;  // Too risky
    
    // Check if already has active World Bank loan
    const existingLoan = wb.loans.find(l => 
      l.borrowerId === borrower.id && 
      ['active', 'delinquent', 'restructuring'].includes(l.status)
    );
    if (existingLoan) return;
    
    // Check if already has pending proposal
    const existingProposal = wb.proposals.find(p => 
      p.borrowerId === borrower.id && 
      ['pending', 'under_review', 'countered'].includes(p.status)
    );
    if (existingProposal) return;
    
    // Check cooldown
    const cooldownTurn = wb.declineCooldowns[borrower.id];
    if (cooldownTurn && GAME.turn - cooldownTurn < 10) return;
    
    // Loan application chance based on need
    const stability = Number(borrower.stability || 50);
    const crisisRisk = Number(borrower.crisisRisk || 20);
    const privateCreditStress = wb.loans.some(l => l.borrowerId === borrower.id && l.type === 'corporate_private_credit' && l.status === 'delinquent') ? 25 : 0;
    const needScore = Math.max(0, 45 - stability) + Math.max(0, crisisRisk - 30) + privateCreditStress;

    // Require stronger need to reduce churn; lower issuance frequency
    if (needScore < 22) return;  // Not enough need

    const applyChance = clamp(0.03 + needScore * 0.005, 0.02, 0.18);
    if (Math.random() > applyChance) return;
    
    // Determine loan amount based on need and credit rating
    const loanAmount = computeNeedBasedWorldBankLoanAmount(borrower, rating, needScore);
    
    // Interest rate based on credit rating
    const interestRate = clamp(
      3 + (100 - rating.score) * 0.08,
      2,
      15
    );
    
    // Loan term based on rating
    const termMonths = clamp(
      12 + Math.floor(rating.score / 10),
      6,
      36
    );
    
    // Generate realistic reason
    const reason = generateLoanReason(borrower, loanAmount);
    
    // Create proposal
    createLoanProposal(borrower, loanAmount, interestRate, termMonths, reason);
  });
}

// ============================================================
// LOAN REASON GENERATOR - Realistic reasons for borrowing
// ============================================================

function generateLoanReason(nation, requestedAmount) {
  const gdp = Number(nation.gdp || 0.2);
  const stability = Number(nation.stability || 50);
  const education = Number(nation.education || 40);
  const health = Number(nation.health || 40);
  const infrastructure = Number(nation.infrastructure || 30);
  const militaryPower = Number(nation.militaryPower || 20);
  const resources = Number(nation.resources || 30);
  const environment = Number(nation.environment || 50);
  const crisisRisk = Number(nation.crisisRisk || 20);
  const debtRatio = Number(nation.debtRatio || 30);
  const inflation = Number(nation.inflation || 3);
  const techLevel = Number(nation.techLevel || 1);
  const population = Number(nation.population || 10);
  const governance = Number(nation.governance || 40);
  const energySecurity = Number(nation.energySecurity || 30);
  
  const reasons = [];
  
  // Education reasons
  if (education < 50) {
    reasons.push({
      category: 'education',
      title: 'Education Infrastructure',
      reason: `${nation.name} is facing a critical shortage in education funding. With an education index of ${education.toFixed(0)}/100, we are unable to build enough schools and train teachers for our growing population of ${(population).toFixed(0)}M. This loan of $${(requestedAmount * 1000).toFixed(0)}M will help us construct schools, provide teacher training programs, and expand access to education across rural areas. We commit to repaying within the agreed term through increased tax revenue from a more educated workforce.`,
      priority: 70 - education,
    });
  }
  
  // Health reasons
  if (health < 50) {
    reasons.push({
      category: 'health',
      title: 'Healthcare System Expansion',
      reason: `${nation.name}'s healthcare system is under severe strain. Our health index stands at ${health.toFixed(0)}/100, and we lack sufficient hospitals, medical supplies, and trained healthcare professionals. We are requesting $${(requestedAmount * 1000).toFixed(0)}M to build medical facilities, procure essential medicines, and train healthcare workers. This investment will reduce mortality rates and improve workforce productivity, enabling us to meet our repayment obligations.`,
      priority: 75 - health,
    });
  }
  
  // Infrastructure reasons
  if (infrastructure < 50) {
    reasons.push({
      category: 'infrastructure',
      title: 'Infrastructure Development',
      reason: `${nation.name} urgently needs infrastructure investment. Our infrastructure index is only ${infrastructure.toFixed(0)}/100, with inadequate roads, bridges, ports, and public utilities hindering economic growth. We seek $${(requestedAmount * 1000).toFixed(0)}M to modernize our transport networks, expand electricity grids, and improve water supply systems. These improvements will boost trade and GDP growth, ensuring we can service this debt responsibly.`,
      priority: 70 - infrastructure,
    });
  }
  
  // Military/defense reasons
  if (militaryPower < 40 && crisisRisk > 40) {
    reasons.push({
      category: 'defense',
      title: 'National Defense Modernization',
      reason: `${nation.name} faces growing security threats with a military power index of ${militaryPower.toFixed(0)}/100 and crisis risk at ${crisisRisk.toFixed(0)}%. Our armed forces lack modern equipment and adequate training. We request $${(requestedAmount * 1000).toFixed(0)}M to upgrade our defense capabilities, procure essential military equipment, and improve readiness. A stable ${nation.name} benefits regional security and protects international investments in our country.`,
      priority: 60 - militaryPower + crisisRisk * 0.3,
    });
  }
  
  // Economic crisis / budget shortfall
  if (stability < 45 || crisisRisk > 50) {
    reasons.push({
      category: 'economic_stability',
      title: 'Economic Stabilization',
      reason: `${nation.name} is experiencing economic instability with a stability index of ${stability.toFixed(0)}/100 and crisis risk at ${crisisRisk.toFixed(0)}%. Our government budget is severely constrained, and we risk a deeper economic downturn. We are requesting $${(requestedAmount * 1000).toFixed(0)}M to stabilize our currency, support critical public services, and implement economic reforms. This bridge financing will prevent a deeper crisis and restore investor confidence.`,
      priority: 80 - stability + crisisRisk * 0.4,
    });
  }
  
  // Energy reasons
  if (energySecurity < 40) {
    reasons.push({
      category: 'energy',
      title: 'Energy Security Program',
      reason: `${nation.name}'s energy security index is critically low at ${energySecurity.toFixed(0)}/100. We face frequent power outages and depend heavily on expensive energy imports, which strains our trade balance. We seek $${(requestedAmount * 1000).toFixed(0)}M to develop domestic energy infrastructure, including power plants and renewable energy projects. Energy independence will reduce our import costs and strengthen our ability to repay this loan.`,
      priority: 65 - energySecurity,
    });
  }
  
  // Resource development
  if (resources < 40) {
    reasons.push({
      category: 'resource_development',
      title: 'Natural Resource Development',
      reason: `${nation.name} has untapped natural resource potential but lacks the capital to develop them. Our resource index is ${resources.toFixed(0)}/100. We request $${(requestedAmount * 1000).toFixed(0)}M to invest in mining, agriculture, and resource extraction infrastructure. Developing these resources will create jobs, increase exports, and generate the revenue needed to repay this loan with interest.`,
      priority: 60 - resources,
    });
  }
  
  // Debt refinancing
  if (debtRatio > 80) {
    reasons.push({
      category: 'debt_refinancing',
      title: 'Debt Restructuring',
      reason: `${nation.name}'s debt-to-GDP ratio has reached ${debtRatio.toFixed(0)}%, making it difficult to service existing obligations. We are requesting $${(requestedAmount * 1000).toFixed(0)}M to refinance high-interest debt and consolidate our obligations into a manageable repayment schedule. This restructuring will prevent default and restore fiscal sustainability.`,
      priority: debtRatio - 50,
    });
  }
  
  // Inflation crisis
  if (inflation > 8) {
    reasons.push({
      category: 'inflation_control',
      title: 'Inflation Control Measures',
      reason: `${nation.name} is battling runaway inflation at ${inflation.toFixed(1)}%, which is eroding purchasing power and destabilizing our economy. We seek $${(requestedAmount * 1000).toFixed(0)}M to support our central bank's stabilization efforts, build foreign exchange reserves, and implement monetary reforms. Controlling inflation will restore economic stability and our capacity to service debt.`,
      priority: inflation * 5,
    });
  }
  
  // Technology/innovation
  if (techLevel < 3 && gdp > 0.3) {
    reasons.push({
      category: 'technology',
      title: 'Technology & Innovation Investment',
      reason: `${nation.name} is falling behind in technological development with a tech level of T${techLevel.toFixed(1)}. Despite a GDP of $${gdp.toFixed(2)}T, our technology infrastructure is outdated. We request $${(requestedAmount * 1000).toFixed(0)}M to invest in digital infrastructure, research institutions, and technology transfer programs. This investment will modernize our economy and create high-value industries that generate sustainable repayment capacity.`,
      priority: 40 - techLevel * 10,
    });
  }
  
  // Environmental
  if (environment < 35) {
    reasons.push({
      category: 'environment',
      title: 'Environmental Recovery Program',
      reason: `${nation.name}'s environment index has deteriorated to ${environment.toFixed(0)}/100 due to industrial pollution and deforestation. This environmental degradation is affecting agriculture, health, and tourism. We seek $${(requestedAmount * 1000).toFixed(0)}M for reforestation, pollution cleanup, and sustainable development projects. Environmental recovery will protect our natural resource base and long-term economic productivity.`,
      priority: 55 - environment,
    });
  }
  
  // Governance reform
  if (governance < 40) {
    reasons.push({
      category: 'governance',
      title: 'Governance & Institutional Reform',
      reason: `${nation.name}'s governance index is ${governance.toFixed(0)}/100, indicating weak institutions and public administration capacity. We request $${(requestedAmount * 1000).toFixed(0)}M to strengthen our judicial system, improve public financial management, and combat corruption. Better governance will improve tax collection efficiency and ensure responsible use of borrowed funds.`,
      priority: 55 - governance,
    });
  }
  
  // Default: general development
  if (reasons.length === 0) {
    reasons.push({
      category: 'general_development',
      title: 'National Development Program',
      reason: `${nation.name} is seeking $${(requestedAmount * 1000).toFixed(0)}M to fund our national development program. With a GDP of $${gdp.toFixed(2)}T and population of ${(population).toFixed(0)}M, we need investment across multiple sectors including education, healthcare, and infrastructure. This loan will support our development goals and economic growth, ensuring we can meet our repayment commitments.`,
      priority: 30,
    });
  }
  
  // Sort by priority and return top reason
  reasons.sort((a, b) => b.priority - a.priority);
  return reasons[0];
}

// ============================================================
// LOAN PROPOSAL SYSTEM
// ============================================================

function createLoanProposal(nation, requestedAmount, requestedRate, requestedTerm, reason) {
  initWorldBankState();
  const wb = GAME.worldBank;
  const rating = computeWorldBankCreditRating(nation);
  
  // Check cooldown
  const cooldownTurn = wb.declineCooldowns[nation.id];
  if (cooldownTurn && GAME.turn - cooldownTurn < 10) {
    return { success: false, message: `${nation.name} must wait ${10 - (GAME.turn - cooldownTurn)} more turns before submitting a new proposal after a decline.` };
  }
  
  // Check existing active loan
  const existingLoan = wb.loans.find(l => l.borrowerId === nation.id && ['active', 'delinquent', 'restructuring'].includes(l.status));
  if (existingLoan) {
    return { success: false, message: `${nation.name} already has an active World Bank loan.` };
  }
  
  // Check existing pending proposal
  const existingProposal = wb.proposals.find(p => p.borrowerId === nation.id && p.status === 'pending');
  if (existingProposal) {
    return { success: false, message: `${nation.name} already has a pending proposal under review.` };
  }
  
  // Calculate fair terms based on credit rating
  const fairRate = clamp(3 + (100 - rating.score) * 0.08, 2, 15);
  const fairNeedScore = Math.max(0, 45 - Number(nation.stability || 50)) + Math.max(0, Number(nation.crisisRisk || 20) - 30);
  const fairAmount = computeNeedBasedWorldBankLoanAmount(nation, rating, fairNeedScore);
  const fairTerm = clamp(12 + Math.floor(rating.score / 10), 6, 36);
  
  // Assess if request is reasonable
  const amountReasonable = requestedAmount <= fairAmount * 2.5;  // Can ask up to 2.5x fair
  const rateReasonable = requestedRate >= fairRate * 0.5;  // Can't ask for less than half fair rate
  const termReasonable = requestedTerm <= fairTerm * 2;  // Can ask up to 2x fair term
  
  // World Bank assessment
  const assessmentScore = (
    (amountReasonable ? 30 : -20) +
    (rateReasonable ? 25 : -15) +
    (termReasonable ? 20 : -10) +
    (rating.score * 0.25) +  // Credit rating weight
    (reason ? 10 : -5)  // Having a reason helps
  );
  
  // Generate counter-proposal if needed
  const counterProposal = {
    amount: Math.min(requestedAmount, fairAmount * 1.5),  // World Bank caps at 1.5x fair
    interestRate: Math.max(requestedRate, fairRate),  // World Bank won't go below fair rate
    termMonths: Math.min(requestedTerm, fairTerm + 6),  // World Bank caps term
    collateral: determineWorldBankCollateral(nation, Math.min(requestedAmount, fairAmount * 1.5), rating.score),
  };
  
  // Determine initial status
  let status = 'pending';
  let wbDecision = null;
  
  if (assessmentScore < 15) {
    // Likely to be declined
    status = 'under_review';
  } else if (assessmentScore >= 55 && amountReasonable && rateReasonable) {
    // Good proposal - auto-approve small loans
    if (requestedAmount <= fairAmount * 0.8) {
      status = 'approved';
      wbDecision = 'approved';
    }
  }
  
  const proposal = {
    id: `wb_proposal_${GAME.turn}_${nation.id}_${Math.floor(Math.random() * 9999)}`,
    borrowerId: nation.id,
    requestedAmount: requestedAmount,
    requestedRate: requestedRate,
    requestedTerm: requestedTerm,
    reason: reason || generateLoanReason(nation, requestedAmount),
    fairTerms: { amount: fairAmount, rate: fairRate, term: fairTerm },
    counterProposal,
    assessmentScore,
    status,  // 'pending', 'under_review', 'approved', 'countered', 'declined'
    wbDecision,
    counterCount: 0,
    maxCounters: 3,
    createdTurn: GAME.turn,
    reviewTurn: GAME.turn + 1 + Math.floor(Math.random() * 2),  // Review in 1-2 turns
    counterHistory: [],
  };
  
  wb.proposals.push(proposal);
  
  // News
  if (typeof addNews === 'function') {
    addNews(`📋 ${nation.flag} ${nation.name} submits World Bank loan proposal: $${(requestedAmount * 1000).toFixed(0)}M at ${requestedRate.toFixed(1)}% for ${requestedTerm} months. Reason: ${proposal.reason.title}`, 'major');
  }
  
  return { success: true, proposal };
}

function processWorldBankProposals() {
  initWorldBankState();
  const wb = GAME.worldBank;
  
  wb.proposals.forEach(proposal => {
    if (proposal.status !== 'under_review' && proposal.status !== 'pending') return;
    if (GAME.turn < proposal.reviewTurn) return;
    
    const borrower = NATIONS[proposal.borrowerId];
    if (!borrower || borrower.failedState) {
      proposal.status = 'declined';
      proposal.wbDecision = 'declined';
      proposal.declineReason = 'Nation is in failed state.';
      return;
    }
    
    const rating = wb.creditRatings[borrower.id] || computeWorldBankCreditRating(borrower);
    
    // World Bank review logic
    const score = proposal.assessmentScore;
    
    if (score < 10) {
      // Decline - too risky
      proposal.status = 'declined';
      proposal.wbDecision = 'declined';
      proposal.declineReason = generateDeclineReason(borrower, proposal, rating);
      wb.declineCooldowns[borrower.id] = GAME.turn;
      
      if (typeof addNews === 'function') {
        addNews(`❌ World Bank declines ${borrower.flag} ${borrower.name}'s loan proposal of $${(proposal.requestedAmount * 1000).toFixed(0)}M. Reason: ${proposal.declineReason}`, 'major');
      }
      addWorldBankTransaction('proposal_declined', proposal.id, borrower.id, proposal.requestedAmount * 1000,
        `World Bank declined ${borrower.flag} ${borrower.name}'s proposal: ${proposal.declineReason}`);
      
    } else if (score < 40) {
      // Counter-proposal
      proposal.status = 'countered';
      proposal.wbDecision = 'countered';
      proposal.counterCount = 1;
      proposal.counterHistory.push({
        turn: GAME.turn,
        amount: proposal.counterProposal.amount,
        rate: proposal.counterProposal.interestRate,
        term: proposal.counterProposal.termMonths,
        from: 'world_bank',
      });
      
      if (typeof addNews === 'function') {
        addNews(`🔄 World Bank counters ${borrower.flag} ${borrower.name}'s proposal: offers $${(proposal.counterProposal.amount * 1000).toFixed(0)}M at ${proposal.counterProposal.interestRate.toFixed(1)}% for ${proposal.counterProposal.termMonths} months (original: $${(proposal.requestedAmount * 1000).toFixed(0)}M at ${proposal.requestedRate.toFixed(1)}%)`, 'major');
      }
      addWorldBankTransaction('proposal_countered', proposal.id, borrower.id, proposal.counterProposal.amount * 1000,
        `World Bank countered ${borrower.flag} ${borrower.name}'s proposal with $${(proposal.counterProposal.amount * 1000).toFixed(0)}M at ${proposal.counterProposal.interestRate.toFixed(1)}%`);
      
    } else {
      // Approve - create the loan
      finalizeLoanFromProposal(proposal, borrower);
    }
  });
}

function generateDeclineReason(borrower, proposal, rating) {
  const reasons = [];
  
  if (rating.score < 25) reasons.push('credit rating too low');
  if (proposal.requestedAmount > borrower.gdp * 0.1) reasons.push('requested amount exceeds borrowing capacity');
  if (proposal.requestedRate < 2) reasons.push('interest rate below minimum threshold');
  if (borrower.stability < 25) reasons.push('political instability too high');
  if (borrower.crisisRisk > 80) reasons.push('crisis risk critically high');
  
  const pastDefaults = GAME.worldBank.defaultHistory.filter(d => d.nationId === borrower.id).length;
  if (pastDefaults > 0) reasons.push(`history of ${pastDefaults} previous default(s)`);
  
  return reasons.length > 0 ? reasons.join('; ') : 'does not meet World Bank lending criteria';
}

function borrowerAcceptCounter(proposalId) {
  initWorldBankState();
  const wb = GAME.worldBank;
  const proposal = wb.proposals.find(p => p.id === proposalId);
  if (!proposal || proposal.status !== 'countered') return { success: false, message: 'No active counter-proposal.' };
  
  const borrower = NATIONS[proposal.borrowerId];
  if (!borrower) return { success: false, message: 'Nation not found.' };
  
  // Accept counter and create loan
  proposal.requestedAmount = proposal.counterProposal.amount;
  proposal.requestedRate = proposal.counterProposal.interestRate;
  proposal.requestedTerm = proposal.counterProposal.termMonths;
  
  finalizeLoanFromProposal(proposal, borrower);
  
  return { success: true };
}

function borrowerCounterProposal(proposalId, amount, rate, term) {
  initWorldBankState();
  const wb = GAME.worldBank;
  const proposal = wb.proposals.find(p => p.id === proposalId);
  if (!proposal || proposal.status !== 'countered') return { success: false, message: 'No active counter-proposal.' };
  
  if (proposal.counterCount >= proposal.maxCounters) {
    proposal.status = 'declined';
    proposal.wbDecision = 'declined';
    proposal.declineReason = `Maximum counter-proposals (${proposal.maxCounters}) reached. Negotiations failed.`;
    wb.declineCooldowns[proposal.borrowerId] = GAME.turn;
    
    if (typeof addNews === 'function') {
      const borrower = NATIONS[proposal.borrowerId];
      addNews(`❌ World Bank negotiations with ${borrower?.flag} ${borrower?.name} failed after ${proposal.maxCounters} counter-proposals.`, 'major');
    }
    return { success: false, message: `Maximum ${proposal.maxCounters} counter-proposals reached. Loan declined.` };
  }
  
  const borrower = NATIONS[proposal.borrowerId];
  if (!borrower) return { success: false, message: 'Nation not found.' };
  
  // Update proposal with borrower's counter
  proposal.requestedAmount = amount;
  proposal.requestedRate = rate;
  proposal.requestedTerm = term;
  proposal.counterCount++;
  proposal.counterHistory.push({
    turn: GAME.turn,
    amount,
    rate,
    term,
    from: 'borrower',
  });
  
  // World Bank re-evaluates
  const rating = wb.creditRatings[borrower.id] || computeWorldBankCreditRating(borrower);
  const fairRate = clamp(3 + (100 - rating.score) * 0.08, 2, 15);
  const fairNeedScore = Math.max(0, 45 - Number(borrower.stability || 50)) + Math.max(0, Number(borrower.crisisRisk || 20) - 30);
  const fairAmount = computeNeedBasedWorldBankLoanAmount(borrower, rating, fairNeedScore);
  
  const newScore = (
    (amount <= fairAmount * 2 ? 30 : -10) +
    (rate >= fairRate * 0.7 ? 25 : -10) +
    (term <= 30 ? 20 : -5) +
    (rating.score * 0.2)
  );
  
  if (newScore >= 45) {
    // Accept borrower's counter
    finalizeLoanFromProposal(proposal, borrower);
    return { success: true, message: 'World Bank accepted your counter-proposal!' };
  } else if (proposal.counterCount >= proposal.maxCounters) {
    // Max counters reached - decline
    proposal.status = 'declined';
    proposal.wbDecision = 'declined';
    proposal.declineReason = `Negotiations failed after ${proposal.maxCounters} rounds. Terms could not be agreed upon.`;
    wb.declineCooldowns[borrower.id] = GAME.turn;
    
    if (typeof addNews === 'function') {
      addNews(`❌ World Bank negotiations with ${borrower.flag} ${borrower.name} failed. Could not agree on loan terms after ${proposal.maxCounters} rounds.`, 'major');
    }
    return { success: false, message: 'Negotiations failed. Loan declined.' };
  } else {
    // World Bank counters again
    proposal.counterProposal = {
      amount: Math.min(amount, fairAmount * 1.3),
      interestRate: Math.max(rate, fairRate * 0.85),
      termMonths: Math.min(term, 30),
      collateral: determineWorldBankCollateral(borrower, Math.min(amount, fairAmount * 1.3), rating.score),
    };
    proposal.status = 'countered';
    proposal.reviewTurn = GAME.turn + 1;
    
    if (typeof addNews === 'function') {
      addNews(`🔄 World Bank re-counters ${borrower.flag} ${borrower.name}'s proposal: $${(proposal.counterProposal.amount * 1000).toFixed(0)}M at ${proposal.counterProposal.interestRate.toFixed(1)}% for ${proposal.counterProposal.termMonths} months (Round ${proposal.counterCount + 1}/${proposal.maxCounters})`, 'major');
    }
    return { success: true, message: 'World Bank has issued a new counter-proposal.' };
  }
}

function finalizeLoanFromProposal(proposal, borrower) {
  initWorldBankState();
  const wb = GAME.worldBank;
  const rating = wb.creditRatings[borrower.id] || computeWorldBankCreditRating(borrower);
  
  // Find potential lenders
  const nations = (GAME?.turnCache && GAME.turnCache.turn === GAME.turn && Array.isArray(GAME.turnCache.aliveNations))
    ? GAME.turnCache.aliveNations
    : Object.values(NATIONS).filter(n => !n.failedState);

  const potentialLenders = nations.filter(nation => {
    if (nation.failedState || nation.id === borrower.id) return false;
    const treasury = nation.id === GAME.playerNation.id ? GAME.treasury : (nation.treasury || 0);
    const gdp = Number(nation.gdp || 0.2);
    return treasury > proposal.requestedAmount * 200 || gdp > 1.0;
  });
  
  if (potentialLenders.length < 2) {
    proposal.status = 'declined';
    proposal.wbDecision = 'declined';
    proposal.declineReason = 'Insufficient lenders available.';
    wb.declineCooldowns[borrower.id] = GAME.turn;
    return;
  }
  
  // Score and select lenders (bounded top-k; avoid full-array sort).
  const lenderCount = clamp(2 + Math.floor(proposal.requestedAmount), 2, 6);
  const topLenders = [];

  potentialLenders.forEach(lender => {
    const rel = typeof getRelationBetween === 'function' ? getRelationBetween(borrower.id, lender.id) : 0;
    const gdp = Number(lender.gdp || 0.2);
    const votingPower = wb.votingPower[lender.id] || 0;
    const score = gdp * 50 + votingPower * 2 + Math.max(0, rel) * 3;
    if (topLenders.length < lenderCount) {
      topLenders.push({ lender, score });
      topLenders.sort((a, b) => b.score - a.score);
      return;
    }
    if (score <= topLenders[topLenders.length - 1].score) return;
    topLenders[topLenders.length - 1] = { lender, score };
    topLenders.sort((a, b) => b.score - a.score);
  });

  const selectedLenders = topLenders.slice(0, Math.min(lenderCount, topLenders.length));
  
  const totalScore = selectedLenders.reduce((sum, s) => sum + s.score, 0);
  const lenderShares = selectedLenders.map(s => ({
    lender: s.lender,
    share: s.score / totalScore,
    amount: proposal.requestedAmount * (s.score / totalScore),
  }));
  
  const collateral = proposal.counterProposal?.collateral || determineWorldBankCollateral(borrower, proposal.requestedAmount, rating.score);
  
  // Create the loan
  const loan = {
    id: `wb_loan_${GAME.turn}_${borrower.id}_${Math.floor(Math.random() * 9999)}`,
    type: 'multilateral',
    borrowerId: borrower.id,
    amount: proposal.requestedAmount,
    interestRate: proposal.requestedRate,
    termMonths: proposal.requestedTerm,
    monthlyPayment: (proposal.requestedAmount * (1 + proposal.requestedRate / 100)) / proposal.requestedTerm,
    remainingMonths: proposal.requestedTerm,
    status: 'active',
    createdTurn: GAME.turn,
    dueTurn: GAME.turn + proposal.requestedTerm,
      lenders: lenderShares.map(ls => ({
      entityType: 'nation',
      nationId: ls.lender.id,
      share: ls.share,
      amount: ls.amount,
      amountM: ls.amount * 1000,
      receivedM: 0,
    })),
    collateral,
    missedPayments: 0,
    extensions: 0,
    totalRepaid: 0,
    proposalId: proposal.id,
    loanReason: proposal.reason,
  };
  
  wb.loans.push(loan);
  proposal.status = 'approved';
  proposal.wbDecision = 'approved';
  proposal.loanId = loan.id;
  
  // Transfer funds
  lenderShares.forEach(ls => {
    const lender = ls.lender;
    const amountM = ls.amount * 1000;
    if (lender.id === GAME.playerNation.id) {
      GAME.treasury -= amountM;
    } else {
      lender.treasury = (lender.treasury || 0) - amountM;
      lender.gdp = clamp(lender.gdp - ls.amount * 0.01, 0.05, 100);
    }
    if (typeof recordNationFinanceFlow === 'function') {
      recordNationFinanceFlow(lender, 'outflows', 'loan_disbursement', amountM);
    }
  });
  
  if (borrower.id === GAME.playerNation.id) {
    GAME.treasury += proposal.requestedAmount * 1000;
  } else {
    borrower.treasury = (borrower.treasury || 0) + proposal.requestedAmount * 1000;
  }
  if (typeof recordNationFinanceFlow === 'function') {
    recordNationFinanceFlow(borrower, 'inflows', 'loan_proceeds', proposal.requestedAmount * 1000);
  }
  
  // Convert requestedAmount (billions) to trillions when touching `nation.gdp` (which is in $T)
  const loanAmountTrillions = Number(proposal.requestedAmount || 0) / 1000;
  borrower.gdp = clamp(borrower.gdp + loanAmountTrillions * 0.05, 0.05, 100);
  borrower.stability = clamp(borrower.stability + loanAmountTrillions * 3, 1, 100);
  borrower.crisisRisk = clamp(borrower.crisisRisk - loanAmountTrillions * 5, 0, 100);
  if (typeof adjustNationDebtStockM === 'function') {
    adjustNationDebtStockM(borrower, proposal.requestedAmount * 1000, 'worldbank_multilateral_issuance');
  }
  
  // Relations
  lenderShares.forEach(ls => {
    const key = typeof relationshipKey === 'function' ? relationshipKey(borrower.id, ls.lender.id) : `${borrower.id}_${ls.lender.id}`;
    if (GAME.bilateralRelations) {
      const currentRel = typeof getRelationBetween === 'function' ? getRelationBetween(borrower.id, ls.lender.id) : 0;
      GAME.bilateralRelations[key] = typeof clamp === 'function' ? clamp(currentRel + 4, -100, 100) : currentRel + 4;
    }
  });
  
  const lenderNames = lenderShares.map(ls => `${ls.lender.flag} ${ls.lender.name}`).join(', ');
  if (typeof addNews === 'function') {
    addNews(`✅ World Bank approves ${borrower.flag} ${borrower.name}'s loan: $${(proposal.requestedAmount * 1000).toFixed(0)}M at ${proposal.requestedRate.toFixed(1)}% for ${proposal.requestedTerm} months. Purpose: ${proposal.reason.title}. Lenders: ${lenderNames}`, 'major');
  }
  
  addWorldBankTransaction('loan_issued', loan.id, borrower.id, proposal.requestedAmount * 1000,
    `${borrower.flag} ${borrower.name} borrowed $${(proposal.requestedAmount * 1000).toFixed(0)}M for ${proposal.reason.title} at ${proposal.requestedRate.toFixed(1)}% from ${lenderNames}`);
}

// ============================================================
// COLLATERAL DETERMINATION
// ============================================================

function determineWorldBankCollateral(borrower, loanAmount, creditScore) {
  const collateralTypes = [];
  
  if (creditScore >= 70) {
    // Light collateral - stock portfolio
    const stockValue = borrower.sovereignPortfolio?.stockHoldings ? 
      Object.values(borrower.sovereignPortfolio.stockHoldings).reduce((sum, h) => sum + (h.shares * h.averageCost || 0), 0) : 0;
    if (stockValue > 0) {
      collateralTypes.push({
        type: 'stock',
        value: stockValue * 0.1,
        description: '10% stock portfolio',
      });
    }
  } else if (creditScore >= 50) {
    // Moderate collateral - stock or military
    const stockValue = borrower.sovereignPortfolio?.stockHoldings ? 
      Object.values(borrower.sovereignPortfolio.stockHoldings).reduce((sum, h) => sum + (h.shares * h.averageCost || 0), 0) : 0;
    if (stockValue > loanAmount * 0.3) {
      collateralTypes.push({
        type: 'stock',
        value: stockValue * 0.3,
        description: '30% stock portfolio',
      });
    } else {
      // Military collateral
      const stockpile = borrower.militaryStockpile || {};
      const totalItems = Object.values(stockpile).reduce((sum, arr) => sum + arr.reduce((s, i) => s + (i.quantity || 0), 0), 0);
      if (totalItems > 10) {
        collateralTypes.push({
          type: 'military',
          value: loanAmount * 0.5,
          description: '50% military equipment',
        });
      }
    }
  } else if (creditScore >= 30) {
    // Heavy collateral - military + resources
    collateralTypes.push({
      type: 'military',
      value: loanAmount * 0.5,
      description: '50% military equipment',
    });
    
    // Resource rights
    if (borrower.resources > 30) {
      collateralTypes.push({
        type: 'resource_rights',
        value: loanAmount * 0.2,
        description: '20% resource production rights',
      });
    }
  } else {
    // Maximum collateral - everything
    collateralTypes.push({
      type: 'military',
      value: loanAmount * 0.7,
      description: '70% military equipment',
    });
    
    if (borrower.resources > 20) {
      collateralTypes.push({
        type: 'resource_rights',
        value: loanAmount * 0.3,
        description: '30% resource production rights',
      });
    }
    
    // Tax revenue pledge
    collateralTypes.push({
      type: 'tax_revenue_pledge',
      value: loanAmount * 0.1,
      description: '10% tax revenue pledge',
    });
  }
  
  return collateralTypes.length > 0 ? collateralTypes : null;
}

function raiseEmergencySovereignLiquidityForDebtService(borrower, shortageM, loan) {
  const targetShortage = Math.max(0, Number(shortageM || 0));
  if (!borrower || targetShortage <= 0.5) return 0;

  let raisedM = 0;
  const donors = Object.values(NATIONS || {})
    .filter(n => n && !n.failedState && n.id !== borrower.id)
    .map(n => ({
      nation: n,
      treasuryM: n.id === GAME.playerNation.id ? Number(GAME.treasury || 0) : Number(n.treasury || 0),
      relation: typeof getRelationBetween === 'function' ? Number(getRelationBetween(borrower.id, n.id) || 0) : 0,
      allied: typeof hasAlliance === 'function' ? !!hasAlliance(borrower.id, n.id) : false,
    }))
    .filter(entry => entry.treasuryM > 80)
    .sort((a, b) => (b.treasuryM + (b.allied ? 120 : 0) + Math.max(0, b.relation) * 2) - (a.treasuryM + (a.allied ? 120 : 0) + Math.max(0, a.relation) * 2));

  // Phase 1: allied emergency aid grants.
  donors.forEach(entry => {
    if (raisedM >= targetShortage) return;
    if (!entry.allied && entry.relation < 35) return;
    const donor = entry.nation;
    const donorTreasury = donor.id === GAME.playerNation.id ? Number(GAME.treasury || 0) : Number(donor.treasury || 0);
    const reserveM = Math.max(120, Number(donor.taxRevenue || 0) * 2.5);
    const grantM = Math.min(targetShortage - raisedM, Math.max(0, donorTreasury - reserveM) * 0.18);
    if (grantM <= 1) return;

    if (donor.id === GAME.playerNation.id) {
      GAME.treasury -= grantM;
      donor.treasury = GAME.treasury;
    } else {
      donor.treasury = Math.max(0, donorTreasury - grantM);
    }
    if (borrower.id === GAME.playerNation.id) {
      GAME.treasury += grantM;
      borrower.treasury = GAME.treasury;
    } else {
      borrower.treasury = Math.max(0, Number(borrower.treasury || 0) + grantM);
    }
    raisedM += grantM;

    if (typeof recordNationFinanceFlow === 'function') {
      recordNationFinanceFlow(donor, 'outflows', 'foreign_aid', grantM, { note: 'Emergency aid for private-credit repayment' });
      recordNationFinanceFlow(borrower, 'inflows', 'foreign_aid', grantM, { note: 'Emergency aid received for private-credit repayment' });
    }
  });

  // Phase 2: diplomatic bridge loans if aid is not enough.
  donors.forEach(entry => {
    if (raisedM >= targetShortage) return;
    const donor = entry.nation;
    const donorTreasury = donor.id === GAME.playerNation.id ? Number(GAME.treasury || 0) : Number(donor.treasury || 0);
    const reserveM = Math.max(150, Number(donor.taxRevenue || 0) * 3.2);
    const bridgeM = Math.min(targetShortage - raisedM, Math.max(0, donorTreasury - reserveM) * 0.24);
    if (bridgeM <= 2) return;

    if (donor.id === GAME.playerNation.id) {
      GAME.treasury -= bridgeM;
      donor.treasury = GAME.treasury;
    } else {
      donor.treasury = Math.max(0, donorTreasury - bridgeM);
    }
    if (borrower.id === GAME.playerNation.id) {
      GAME.treasury += bridgeM;
      borrower.treasury = GAME.treasury;
    } else {
      borrower.treasury = Math.max(0, Number(borrower.treasury || 0) + bridgeM);
    }
    raisedM += bridgeM;

    if (typeof adjustNationDebtStockM === 'function') {
      adjustNationDebtStockM(borrower, bridgeM, 'diplomatic_bridge_for_private_credit');
    }
    if (typeof recordNationFinanceFlow === 'function') {
      recordNationFinanceFlow(donor, 'outflows', 'loan_disbursement', bridgeM, { note: 'Diplomatic bridge financing for private-credit repayment' });
      recordNationFinanceFlow(borrower, 'inflows', 'loan_proceeds', bridgeM, { note: 'Diplomatic bridge financing received for private-credit repayment' });
    }
  });

  if (raisedM > 0) {
    addWorldBankTransaction('bridge_liquidity', loan?.id || null, borrower.id, raisedM, `${borrower.flag} ${borrower.name} raised emergency aid/bridge liquidity of $${raisedM.toFixed(0)}M to service private-credit obligations.`);
  }
  return raisedM;
}

// ============================================================
// LOAN REPAYMENT PROCESSING
// ============================================================

function processWorldBankRepayments() {
  initWorldBankState();
  const wb = GAME.worldBank;
  
  wb.loans.forEach(loan => {
    if (!['active', 'delinquent', 'restructuring'].includes(loan.status)) return;
    
    const borrower = NATIONS[loan.borrowerId];
    if (!borrower || borrower.failedState) return;
    
    const currentTurn = GAME.turn;
    const baseMonthlyPaymentM = loan.monthlyPayment * 1000;
    const catchUpM = loan.type === 'corporate_private_credit'
      ? Math.min(Number(loan.unpaidAccruedM || 0), baseMonthlyPaymentM * 0.6)
      : 0;
    const monthlyPaymentM = baseMonthlyPaymentM + catchUpM;  // Convert to millions
    
    // Check if borrower can afford payment
    let borrowerTreasury = borrower.id === GAME.playerNation.id ? GAME.treasury : (borrower.treasury || 0);
    const taxRevenueM = Math.max(1, Number(borrower.taxRevenue || 1));
    // Use sustainable cashflow (tax revenue) plus a small portion of reserves
    let affordablePayment = Math.min(monthlyPaymentM, taxRevenueM * 0.25 + borrowerTreasury * 0.05);
    if (loan.type === 'corporate_private_credit' && affordablePayment + 1 < monthlyPaymentM) {
      raiseEmergencySovereignLiquidityForDebtService(borrower, monthlyPaymentM - affordablePayment, loan);
      borrowerTreasury = borrower.id === GAME.playerNation.id ? GAME.treasury : (borrower.treasury || 0);
      affordablePayment = Math.min(monthlyPaymentM, taxRevenueM * 0.30 + borrowerTreasury * 0.06);
    }
    
    if (affordablePayment > 1) {
      // Make payment
      if (borrower.id === GAME.playerNation.id) {
        GAME.treasury -= affordablePayment;
      } else {
        borrower.treasury = (borrower.treasury || 0) - affordablePayment;
      }
      if (typeof recordNationFinanceFlow === 'function') {
        recordNationFinanceFlow(borrower, 'outflows', 'loan_repayment', affordablePayment);
      }
      
      // Distribute to lenders proportionally
      loan.lenders.forEach(lender => {
        const paymentShare = affordablePayment * lender.share;
        creditWorldBankLender(lender, paymentShare);
      });
      
      loan.totalRepaid += affordablePayment / 1000;  // Convert back to billions
      loan.remainingMonths -= 1;
      loan.missedPayments = 0;
      loan.status = 'active';
      if (loan.type === 'corporate_private_credit' && catchUpM > 0) {
        const paidTowardArrearsM = Math.max(0, affordablePayment - baseMonthlyPaymentM);
        loan.unpaidAccruedM = Math.max(0, Number(loan.unpaidAccruedM || 0) - paidTowardArrearsM);
      }
      
      // Borrower benefits from good repayment
      borrower.stability = clamp(borrower.stability + 0.5, 1, 100);
      if (typeof adjustNationDebtStockM === 'function') {
        const totalDueB = Math.max(0.0001, Number(loan.amount || 0) * (1 + Number(loan.interestRate || 0) / 100));
        const principalShare = clamp(Number(loan.amount || 0) / totalDueB, 0.35, 1.0);
        const principalPaidM = affordablePayment * principalShare;
        adjustNationDebtStockM(borrower, -principalPaidM, 'worldbank_repayment_principal');
      }
      
      // Log payment transaction
      addWorldBankTransaction(loan.type === 'corporate_private_credit' ? 'company_payment' : 'payment', loan.id, borrower.id, affordablePayment,
        `${borrower.flag} ${borrower.name} paid $${affordablePayment.toFixed(0)}M monthly payment on $${(loan.amount * 1000).toFixed(0)}M loan`);
    } else {
      // Missed payment
      loan.missedPayments += 1;
      if (loan.type === 'corporate_private_credit') {
        loan.status = 'restructuring';
        loan.unpaidAccruedM = Math.max(0, Number(loan.unpaidAccruedM || 0) + monthlyPaymentM);
        loan.interestRate = clamp(Number(loan.interestRate || 24) + 1.2, 24, 62);
        loan.remainingMonths = Math.max(1, Number(loan.remainingMonths || 1) + 1);
        loan.termMonths = Math.max(Number(loan.termMonths || 1), Number(loan.remainingMonths || 1));
        loan.dueTurn = Math.max(GAME.turn + 1, Number(loan.dueTurn || GAME.turn) + 1);
      } else {
        loan.status = 'delinquent';
      }
      
      // Stability hit
      borrower.stability = clamp(borrower.stability - 2, 1, 100);
      borrower.crisisRisk = clamp(borrower.crisisRisk + 3, 0, 100);
    }
    
    // Check for loan completion
    if (loan.remainingMonths <= 0 || loan.totalRepaid >= loan.amount * (1 + loan.interestRate / 100)) {
      loan.status = 'paid';
      
      // Final GDP boost for successful repayment
      borrower.gdp = clamp(borrower.gdp + loan.amount * 0.02, 0.05, 100);
      borrower.stability = clamp(borrower.stability + 5, 1, 100);
      
      const lenderNames = loan.lenders.map(getWorldBankLenderLabel).join(', ');
      if (typeof addNews === 'function') {
        addNews(`✅ ${borrower.flag} ${borrower.name} completes $${(loan.amount * 1000).toFixed(0)}M World Bank loan repayment to ${lenderNames}.`, 'minor');
      }
      
      // Log completion
      addWorldBankTransaction(loan.type === 'corporate_private_credit' ? 'company_loan_completed' : 'loan_completed', loan.id, borrower.id, loan.totalRepaid * 1000,
        `${borrower.flag} ${borrower.name} fully repaid $${(loan.amount * 1000).toFixed(0)}M loan. Total paid: $${(loan.totalRepaid * 1000).toFixed(0)}M`);
      return;
    }
    
    // Check for default
    if (loan.type !== 'corporate_private_credit' && (loan.missedPayments >= 3 || currentTurn >= loan.dueTurn)) {
      processWorldBankDefault(loan, borrower);
    }
  });
}

// ============================================================
// DEFAULT PROCESSING
// ============================================================

function processWorldBankDefault(loan, borrower) {
  initWorldBankState();
  const wb = GAME.worldBank;
  
  loan.status = 'defaulted';
  
  // Record default history
  wb.defaultHistory.push({
    nationId: borrower.id,
    loanId: loan.id,
    amount: loan.amount,
    turn: GAME.turn,
    lenders: loan.lenders.map(l => l.nationId),
  });
  
  // Seize collateral
  if (loan.collateral) {
    loan.collateral.forEach(coll => {
      switch (coll.type) {
        case 'stock':
          seizeStockCollateral(borrower, loan, coll);
          break;
        case 'military':
          seizeMilitaryCollateral(borrower, loan, coll);
          break;
        case 'resource_rights':
          seizeResourceCollateral(borrower, loan, coll);
          break;
        case 'tax_revenue_pledge':
          seizeTaxRevenueCollateral(borrower, loan, coll);
          break;
      }
    });
  }
  
  // Stability and crisis impact
  borrower.stability = clamp(borrower.stability - 10, 1, 100);
  borrower.crisisRisk = clamp(borrower.crisisRisk + 15, 0, 100);
  borrower.gdp = clamp(borrower.gdp - loan.amount * 0.05, 0.05, 100);
  
  // Relations hit with all lenders
  loan.lenders.forEach(lender => {
    if (lender.entityType === 'company') return;
    const lenderNation = NATIONS[lender.nationId];
    if (!lenderNation) return;
    
    const key = typeof relationshipKey === 'function' ? relationshipKey(borrower.id, lender.nationId) : `${borrower.id}_${lender.nationId}`;
    if (GAME.bilateralRelations) {
      const currentRel = typeof getRelationBetween === 'function' ? getRelationBetween(borrower.id, lender.nationId) : 0;
      GAME.bilateralRelations[key] = typeof clamp === 'function' ? clamp(currentRel - 15, -100, 100) : currentRel - 15;
    }
    
    // Lenders impose sanctions
    if (typeof GAME !== 'undefined' && GAME.diplomacyState) {
      GAME.diplomacyState.sanctions[key] = {
        severity: 10 + Math.floor(Math.random() * 10),
        turn: GAME.turn,
        reason: 'World Bank loan default',
        imposedBy: lender.nationId,
      };
    }
  });
  
  // Credit score hit
  const rating = wb.creditRatings[borrower.id];
  if (rating) {
    rating.score = Math.max(10, rating.score - 20);
    rating.outlook = 'negative';
  }
  
  const lenderNames = loan.lenders.map(getWorldBankLenderLabel).join(', ');
  if (typeof addNews === 'function') {
    addNews(`🚨 ${borrower.flag} ${borrower.name} defaults on $${(loan.amount * 1000).toFixed(0)}M World Bank loan. Collateral seized, sanctions imposed by ${lenderNames}.`, 'major');
  }
  
  // Log default
  addWorldBankTransaction('default', loan.id, borrower.id, loan.amount * 1000,
    `${borrower.flag} ${borrower.name} defaulted on $${(loan.amount * 1000).toFixed(0)}M loan. Collateral seized.`);
}

// ============================================================
// COLLATERAL SEIZURE FUNCTIONS
// ============================================================

function seizeStockCollateral(borrower, loan, collateral) {
  if (!borrower.sovereignPortfolio?.stockHoldings) return;
  
  const holdings = Object.entries(borrower.sovereignPortfolio.stockHoldings);
  if (holdings.length === 0) return;
  
  // Transfer shares proportionally to lenders
  loan.lenders.forEach(lender => {
    const lenderNation = NATIONS[lender.nationId];
    if (!lenderNation) return;
    
    if (!lenderNation.sovereignPortfolio) lenderNation.sovereignPortfolio = { stockHoldings: {} };
    
    holdings.forEach(([companyId, holding]) => {
      const sharesToTransfer = Math.floor(holding.shares * lender.share * 0.3);
      if (sharesToTransfer <= 0) return;
      
      holding.shares -= sharesToTransfer;
      
      if (!lenderNation.sovereignPortfolio.stockHoldings[companyId]) {
        lenderNation.sovereignPortfolio.stockHoldings[companyId] = {
          shares: 0,
          averageCost: holding.averageCost,
        };
      }
      lenderNation.sovereignPortfolio.stockHoldings[companyId].shares += sharesToTransfer;
    });
  });
}

function seizeMilitaryCollateral(borrower, loan, collateral) {
  const stockpile = borrower.militaryStockpile || {};
  
  loan.lenders.forEach(lender => {
    const lenderNation = NATIONS[lender.nationId];
    if (!lenderNation) return;
    if (!lenderNation.militaryStockpile) lenderNation.militaryStockpile = {};
    
    Object.keys(stockpile).forEach(category => {
      const items = stockpile[category];
      if (!Array.isArray(items)) return;
      
      items.forEach(item => {
        const quantity = Math.floor((item.quantity || 0) * lender.share * 0.5);
        if (quantity <= 0) return;
        
        item.quantity -= quantity;
        
        if (!lenderNation.militaryStockpile[category]) {
          lenderNation.militaryStockpile[category] = [];
        }
        lenderNation.militaryStockpile[category].push({
          ...item,
          quantity,
          condition: Math.max(50, (item.condition || 100) - 20),
        });
      });
    });
  });
  
  // Military power adjustment
  borrower.militaryPower = clamp(borrower.militaryPower - 15, 0, 100);
}

function seizeResourceCollateral(borrower, loan, collateral) {
  // Lenders get production share from borrower's resources
  loan.lenders.forEach(lender => {
    const lenderNation = NATIONS[lender.nationId];
    if (!lenderNation) return;
    
    // GDP boost from resource access
    lenderNation.gdp = clamp(lenderNation.gdp + collateral.value * 0.01, 0.05, 100);
  });
  
  // Borrower loses resource production
  borrower.resources = clamp(borrower.resources - 10, 1, 100);
  borrower.gdp = clamp(borrower.gdp - collateral.value * 0.02, 0.05, 100);
}

function seizeTaxRevenueCollateral(borrower, loan, collateral) {
  // Future tax revenue goes to lenders
  loan.lenders.forEach(lender => {
    // Direct treasury transfer
    const transferAmount = collateral.value * lender.share * 100;  // In millions
    creditWorldBankLender(lender, transferAmount);
  });
  
  // Borrower loses treasury
  if (borrower.id === GAME.playerNation.id) {
    GAME.treasury -= collateral.value * 100;
  } else {
    borrower.treasury = Math.max(0, (borrower.treasury || 0) - collateral.value * 100);
  }
}

// ============================================================
// IMF BAILOUT PROGRAM
// ============================================================

function processIMFBailoutOpportunities() {
  initWorldBankState();
  const wb = GAME.worldBank;
  
  // Find nations in crisis that might need bailout
  Object.values(NATIONS).forEach(nation => {
    const failedStateRecovery = !!nation.failedState;
    
    const stability = Number(nation.stability || 50);
    const crisisRisk = Number(nation.crisisRisk || 20);
    
    // Failed states can receive emergency stabilization; otherwise use severe crisis gate.
    if (!failedStateRecovery && (stability > 25 || crisisRisk < 70)) return;
    if (failedStateRecovery && crisisRisk < 72 && stability > 24) return;
    
    // Check if already in bailout
    const existingBailout = wb.bailouts.find(b => 
      b.nationId === nation.id && b.status === 'active'
    );
    if (existingBailout) return;
    
    // Check if has defaulted loans
    const defaultedLoans = wb.loans.filter(l => 
      l.borrowerId === nation.id && l.status === 'defaulted'
    );
    if (!failedStateRecovery && defaultedLoans.length === 0) return;
    
    // Bailout chance
    const bailoutChance = failedStateRecovery
      ? clamp(0.34 + (100 - crisisRisk) * 0.002, 0.25, 0.65)
      : clamp(0.1 + (100 - crisisRisk) * 0.005, 0.05, 0.35);
    if (Math.random() > bailoutChance) return;
    
    // Calculate bailout amount
    const totalDebt = defaultedLoans.reduce((sum, l) => sum + l.amount, 0);
    const bailoutAmount = failedStateRecovery
      ? clamp(nation.gdp * 0.12, 0.14, 3.8)
      : totalDebt * 0.8;  // 80% of defaulted debt
    
    // Find bailout contributors (superpowers)
    const contributors = Object.values(NATIONS)
      .filter(n => !n.failedState && n.id !== nation.id && n.gdp > (failedStateRecovery ? 0.9 : 1.0))
      .sort((a, b) => b.gdp - a.gdp)
      .slice(0, 4);
    
    if (contributors.length === 0) return;
    
    // Create bailout program
    const bailout = {
      id: `imf_bailout_${GAME.turn}_${nation.id}`,
      nationId: nation.id,
      amount: bailoutAmount,
      contributors: contributors.map(c => ({
        nationId: c.id,
        share: c.gdp / contributors.reduce((sum, x) => sum + x.gdp, 0),
        amount: bailoutAmount * (c.gdp / contributors.reduce((sum, x) => sum + x.gdp, 0)),
      })),
      status: 'active',
      createdTurn: GAME.turn,
      duration: 24,  // 24 months
      conditions: {
        austerity: true,
        governanceReform: true,
        militarySpendingCap: 20,
        stateRebuild: failedStateRecovery,
      },
      type: failedStateRecovery ? 'failed_state_recovery' : 'standard',
    };
    
    wb.bailouts.push(bailout);
    
    // Pay off defaulted loans for standard bailout flow.
    if (defaultedLoans.length > 0) {
      defaultedLoans.forEach(loan => {
        loan.status = 'settled-via-bailout';
        loan.lenders.forEach(lender => {
          const recoveryAmountM = loan.amount * 1000 * lender.share * 0.8;
          creditWorldBankLender(lender, recoveryAmountM);
        });
      });
    }

    // Direct stabilization liquidity injection into borrower treasury.
    const bailoutAmountM = bailoutAmount * 1000;
    if (nation.id === GAME.playerNation.id) {
      GAME.treasury += bailoutAmountM;
      nation.treasury = GAME.treasury;
    } else {
      nation.treasury = (nation.treasury || 0) + bailoutAmountM;
    }
    
    // Bailout impact on borrower
    nation.stability = clamp(nation.stability + 15, 1, 100);
    nation.crisisRisk = clamp(nation.crisisRisk - 20, 0, 100);
    nation.governance = clamp(nation.governance - 10, 1, 100);  // Sovereignty loss
    // BailoutAmount is in billions; convert to trillions before changing `nation.gdp` (which is in $T)
    nation.gdp = clamp(nation.gdp + (bailoutAmount / 1000) * 0.03, 0.05, 100);
    nation.jobs = clamp((nation.jobs || 40) + (failedStateRecovery ? 7 : 3), 1, 100);
    nation.factories = clamp((nation.factories || 35) + (failedStateRecovery ? 5 : 2), 1, 100);

    if (failedStateRecovery) {
      nation.recoveryProgram = {
        source: 'IMF',
        createdTurn: GAME.turn,
        duration: 24,
        turnsRemaining: 24,
        supportAmountM: bailoutAmountM,
        phase: 'stabilization',
      };
      nation.recoveryMomentum = clamp((nation.recoveryMomentum || 0) + 0.4, 0, 2);
    }
    
    // Contributors pay
    bailout.contributors.forEach(c => {
      const contributor = NATIONS[c.nationId];
      if (!contributor) return;
      
      if (contributor.id === GAME.playerNation.id) {
        GAME.treasury -= c.amount * 1000;
      } else {
        contributor.treasury = (contributor.treasury || 0) - c.amount * 1000;
        contributor.gdp = clamp(contributor.gdp - c.amount * 0.01, 0.05, 100);
      }

      contributor.treasury = Math.max(0, contributor.id === GAME.playerNation.id ? GAME.treasury : (contributor.treasury || 0));
    });

    if (typeof recordNationFinanceFlow === 'function') {
      recordNationFinanceFlow(nation, 'inflows', 'loan_proceeds', bailoutAmountM, {
        note: failedStateRecovery ? 'IMF failed-state recovery program proceeds' : 'IMF bailout proceeds',
        context: failedStateRecovery ? 'imf-failed-state-recovery' : 'imf-bailout',
      });
    }
    
    const contributorNames = bailout.contributors.map(c => `${NATIONS[c.nationId]?.flag || '🏳️'} ${NATIONS[c.nationId]?.name || c.nationId}`).join(', ');
    if (typeof addNews === 'function') {
      if (failedStateRecovery) {
        addNews(`🧱 IMF Recovery Mission: ${nation.flag} ${nation.name} receives $${(bailoutAmount * 1000).toFixed(0)}M stabilization package from ${contributorNames}. A supervised state-rebuild program is now active.`, 'major');
      } else {
        addNews(`🆘 IMF Bailout: ${nation.flag} ${nation.name} receives $${(bailoutAmount * 1000).toFixed(0)}M bailout from ${contributorNames}. Austerity measures imposed.`, 'major');
      }
    }

    addWorldBankTransaction(
      failedStateRecovery ? 'state_recovery' : 'bailout',
      bailout.id,
      nation.id,
      bailoutAmountM,
      failedStateRecovery
        ? `IMF recovery mission activated for ${nation.flag} ${nation.name}`
        : `IMF bailout issued to ${nation.flag} ${nation.name}`
    );
  });
}

// ============================================================
// MAIN WORLD BANK PROCESSOR
// ============================================================

function processWorldBankAll() {
  initWorldBankState();
  
  processWorldBankCapitalContributions();
  processWorldBankLoanApplications();
  processWorldBankRepayments();
  processCompanySovereignLoanApplications();
  processIMFBailoutOpportunities();
  
  // Update credit ratings every 5 turns
  if (GAME.turn % 5 === 0) {
    Object.values(NATIONS).forEach(nation => {
      if (!nation.failedState) {
        computeWorldBankCreditRating(nation);
      }
    });
  }
}

// ============================================================
// UI RENDERING FUNCTIONS
// ============================================================

// Global state for World Bank UI navigation
window._wbView = 'overview';  // 'overview', 'transactions', 'active', 'closed', 'nation', 'loan', 'proposals', 'apply_loan', 'companies', 'company'
window._wbSelectedNation = null;
window._wbSelectedLoan = null;
window._wbSelectedCompany = null;

function renderWorldBankTab() {
  initWorldBankState();
  const wb = GAME.worldBank;
  const playerId = GAME.playerNation.id;
  const view = window._wbView || 'overview';
  
  // Player's credit rating
  const playerRating = wb.creditRatings[playerId] || computeWorldBankCreditRating(GAME.playerNation);
  const ratingLabel = getCreditRatingLabel(playerRating.score);
  
  // Compute stats
  const activeLoans = wb.loans.filter(l => ['active', 'delinquent', 'restructuring'].includes(l.status));
  const closedLoans = wb.loans.filter(l => ['paid', 'defaulted', 'settled-via-collateral', 'settled-via-bailout'].includes(l.status));
  const totalLoanVolume = wb.loans.reduce((sum, l) => sum + l.amount, 0);
  const totalRepaid = wb.loans.reduce((sum, l) => sum + (l.totalRepaid || 0), 0);
  const totalInterestPaid = Math.max(0, totalRepaid - wb.loans.filter(l => ['paid', 'active', 'delinquent'].includes(l.status)).reduce((sum, l) => sum + l.amount, 0));
  
  // Pending proposals
  const pendingProposals = wb.proposals.filter(p => ['pending', 'under_review', 'countered'].includes(p.status));
  const playerProposals = pendingProposals.filter(p => p.borrowerId === playerId);
  
  // Nation loan summaries
  const nationLoanSummaries = computeNationLoanSummaries();
  const companyLoanSummaries = computeCompanyLoanSummaries();

  // Navigation header
  let html = `
    <div class="tab-section">
      <h3>🏦 World Bank & IMF</h3>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Total Capital</span><span class="r-val">$${(wb.capital * 1000).toFixed(0)}M</span></div>
        <div class="resource-item"><span class="r-name">Total Loan Volume</span><span class="r-val">$${(totalLoanVolume * 1000).toFixed(0)}M</span></div>
        <div class="resource-item"><span class="r-name">Total Repaid</span><span class="r-val positive">$${(totalRepaid * 1000).toFixed(0)}M</span></div>
        <div class="resource-item"><span class="r-name">Interest Earned</span><span class="r-val positive">$${(totalInterestPaid * 1000).toFixed(0)}M</span></div>
        <div class="resource-item"><span class="r-name">Active Loans</span><span class="r-val">${activeLoans.length}</span></div>
        <div class="resource-item"><span class="r-name">Closed Loans</span><span class="r-val">${closedLoans.length}</span></div>
        <div class="resource-item"><span class="r-name">Your Rating</span><span class="r-val" style="color:${ratingLabel.color}">${ratingLabel.label} (${playerRating.score})</span></div>
        <div class="resource-item"><span class="r-name">Pending Proposals</span><span class="r-val ${playerProposals.length > 0 ? 'positive' : ''}">${playerProposals.length}</span></div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="tab-section">
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        <button class="wb-nav-btn ${view === 'overview' ? 'active' : ''}" onclick="window._wbView='overview'; window._wbSelectedNation=null; window._wbSelectedLoan=null; refreshRealtimeTabs();">📊 Overview</button>
        <button class="wb-nav-btn ${view === 'proposals' ? 'active' : ''}" onclick="window._wbView='proposals'; window._wbSelectedNation=null; window._wbSelectedLoan=null; refreshRealtimeTabs();">📋 Proposals (${pendingProposals.length})</button>
        <button class="wb-nav-btn ${view === 'transactions' ? 'active' : ''}" onclick="window._wbView='transactions'; window._wbSelectedNation=null; window._wbSelectedLoan=null; refreshRealtimeTabs();">📜 Transactions (${wb.transactions.length})</button>
        <button class="wb-nav-btn ${view === 'active' ? 'active' : ''}" onclick="window._wbView='active'; window._wbSelectedNation=null; window._wbSelectedLoan=null; refreshRealtimeTabs();">🟢 Active Loans (${activeLoans.length})</button>
        <button class="wb-nav-btn ${view === 'closed' ? 'active' : ''}" onclick="window._wbView='closed'; window._wbSelectedNation=null; window._wbSelectedLoan=null; refreshRealtimeTabs();">⚫ Closed Loans (${closedLoans.length})</button>
        <button class="wb-nav-btn ${view === 'nations' ? 'active' : ''}" onclick="window._wbView='nations'; window._wbSelectedNation=null; window._wbSelectedLoan=null; refreshRealtimeTabs();">🌍 Nations by Debt</button>
        <button class="wb-nav-btn ${view === 'companies' ? 'active' : ''}" onclick="window._wbView='companies'; window._wbSelectedCompany=null; window._wbSelectedLoan=null; refreshRealtimeTabs();">🏭 Defense Lenders (${companyLoanSummaries.length})</button>
      </div>
    </div>
  `;

  // View content
  switch (view) {
    case 'overview':
      html += renderWbOverview(nationLoanSummaries, wb, playerId);
      break;
    case 'proposals':
      html += renderWbProposals(wb, playerId);
      break;
    case 'apply_loan':
      html += renderWbApplyLoanForm(wb, playerId, playerRating);
      break;
    case 'transactions':
      html += renderWbTransactions(wb);
      break;
    case 'active':
      html += renderWbActiveLoans(activeLoans);
      break;
    case 'closed':
      html += renderWbClosedLoans(closedLoans);
      break;
    case 'nations':
      html += renderWbNationList(nationLoanSummaries);
      break;
    case 'companies':
      html += renderWbCompanyList(companyLoanSummaries);
      break;
    case 'nation':
      html += renderWbNationDetail(window._wbSelectedNation, nationLoanSummaries);
      break;
    case 'company':
      html += renderWbCompanyDetail(window._wbSelectedCompany, companyLoanSummaries);
      break;
    case 'loan':
      html += renderWbLoanDetail(window._wbSelectedLoan);
      break;
  }

  // Actions
  html += `
    <div class="tab-section">
      <h3>🏦 Actions</h3>
      <div class="action-grid" style="grid-template-columns:1fr 1fr">
        <button class="action-btn" onclick="playerApplyWorldBankLoan()">📝 Apply for Loan</button>
        <button class="action-btn" onclick="playerContributeToWorldBank()">💰 Contribute Capital</button>
        <button class="action-btn" onclick="playerOfferBailout()">🆘 Offer Bailout</button>
        <button class="action-btn" onclick="playerRequestCreditReview()">📊 Credit Review</button>
      </div>
    </div>
  `;

  return html;
}

function renderWbOverview(nationSummaries, wb, playerId) {
  // Top borrowers
  const topBorrowers = nationSummaries
    .filter(n => n.totalBorrowed > 0)
    .sort((a, b) => b.totalBorrowed - a.totalBorrowed)
    .slice(0, 8);

  // Recent transactions
  const recentTxns = wb.transactions.slice(0, 8);

  let html = '';

  if (topBorrowers.length > 0) {
    html += `<div class="tab-section"><h3>🏆 Top Borrowers</h3>`;
    topBorrowers.forEach((n, idx) => {
      const nation = NATIONS[n.nationId];
      html += `
        <div class="wb-nation-row" onclick="window._wbView='nation'; window._wbSelectedNation='${n.nationId}'; refreshRealtimeTabs();" style="cursor:pointer">
          <span class="wb-rank">#${idx + 1}</span>
          <span class="wb-flag">${nation ? nation.flag : '🏳️'}</span>
          <span class="wb-name">${nation ? nation.name : n.nationId}</span>
          <span class="wb-amount">$${(n.totalBorrowed * 1000).toFixed(0)}M</span>
          <span class="wb-paid">$${(n.totalRepaid * 1000).toFixed(0)}M</span>
          <span class="wb-interest">$${(n.totalInterest * 1000).toFixed(0)}M</span>
        </div>
      `;
    });
    html += `</div>`;
  }

  if (recentTxns.length > 0) {
    html += `<div class="tab-section"><h3>📋 Recent Transactions</h3>`;
    recentTxns.forEach(txn => {
      const icon = getTransactionIcon(txn.type);
      const color = getTransactionColor(txn.type);
      html += `
        <div class="wb-txn-row" onclick="window._wbView='loan'; window._wbSelectedLoan='${txn.loanId}'; refreshRealtimeTabs();" style="cursor:pointer">
          <span class="wb-txn-icon">${icon}</span>
          <span class="wb-txn-details">${txn.details}</span>
          <span class="wb-txn-amount" style="color:${color}">$${txn.amountM.toFixed(0)}M</span>
          <span class="wb-txn-turn">Turn ${txn.turn}</span>
        </div>
      `;
    });
    html += `</div>`;
  }

  const topCompanies = computeCompanyLoanSummaries().slice(0, 6);
  if (topCompanies.length > 0) {
    html += `<div class="tab-section"><h3>🏭 Top Defense Lenders</h3>`;
    topCompanies.forEach((summary, idx) => {
      html += `
        <div class="wb-nation-row" onclick="window._wbView='company'; window._wbSelectedCompany='${summary.companyId}'; refreshRealtimeTabs();" style="cursor:pointer">
          <span class="wb-rank">#${idx + 1}</span>
          <span class="wb-flag">${summary.flag || '🏳️'}</span>
          <span class="wb-name">${summary.companyName}</span>
          <span class="wb-amount">Lent: $${(summary.totalLent * 1000).toFixed(0)}M</span>
          <span class="wb-paid">Paid Back: $${(summary.totalReceived * 1000).toFixed(0)}M</span>
          <span class="wb-interest">Interest: $${(summary.totalInterest * 1000).toFixed(0)}M</span>
        </div>
      `;
    });
    html += `</div>`;
  }

  return html;
}

function renderWbTransactions(wb) {
  if (wb.transactions.length === 0) {
    return `<div class="tab-section"><h3>📋 Transaction History</h3><p class="text-muted">No transactions yet.</p></div>`;
  }

  let html = `<div class="tab-section"><h3>📋 Transaction History (${wb.transactions.length})</h3>`;
  
  // Filter buttons
  html += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">`;
  ['all', 'loan_issued', 'company_loan_issued', 'payment', 'company_payment', 'loan_completed', 'company_loan_completed', 'bridge_liquidity', 'default', 'collateral_seized', 'bailout', 'state_recovery', 'contribution'].forEach(type => {
    const count = type === 'all' ? wb.transactions.length : wb.transactions.filter(t => t.type === type).length;
    html += `<button class="wb-filter-btn" onclick="filterWbTransactions('${type}')">${getTransactionIcon(type)} ${type.replace('_', ' ')} (${count})</button>`;
  });
  html += `</div>`;

  html += `<div id="wb-txn-list">`;
  wb.transactions.forEach(txn => {
    const icon = getTransactionIcon(txn.type);
    const color = getTransactionColor(txn.type);
    html += `
      <div class="wb-txn-row wb-txn-${txn.type}" onclick="window._wbView='loan'; window._wbSelectedLoan='${txn.loanId}'; refreshRealtimeTabs();" style="cursor:pointer">
        <span class="wb-txn-icon">${icon}</span>
        <span class="wb-txn-details">${txn.details}</span>
        <span class="wb-txn-amount" style="color:${color}">$${txn.amountM.toFixed(0)}M</span>
        <span class="wb-txn-turn">${txn.date}</span>
      </div>
    `;
  });
  html += `</div></div>`;

  return html;
}

function renderWbActiveLoans(activeLoans) {
  if (activeLoans.length === 0) {
    return `<div class="tab-section"><h3>🟢 Active Loans</h3><p class="text-muted">No active loans.</p></div>`;
  }

  let html = `<div class="tab-section"><h3>🟢 Active Loans (${activeLoans.length})</h3>`;
  
  activeLoans.forEach(loan => {
    const borrower = NATIONS[loan.borrowerId];
    const statusColor = loan.status === 'active' ? 'var(--accent-green)' : 
                       loan.status === 'delinquent' ? 'var(--accent-yellow)' : 'var(--accent-blue)';
    const progress = loan.totalRepaid / (loan.amount * (1 + loan.interestRate / 100)) * 100;
    const lenderNames = loan.lenders.map(getWorldBankLenderLabel).join(', ');
    
    html += `
      <div class="wb-loan-card" onclick="window._wbView='loan'; window._wbSelectedLoan='${loan.id}'; refreshRealtimeTabs();" style="cursor:pointer">
        <div class="wb-loan-header">
          <span class="wb-loan-borrower">${borrower ? borrower.flag : '🏳️'} ${borrower ? borrower.name : loan.borrowerId}</span>
          <span class="wb-loan-status" style="color:${statusColor}">${loan.status.toUpperCase()}</span>
        </div>
        <div class="wb-loan-amount">$${(loan.amount * 1000).toFixed(0)}M</div>
        <div class="wb-loan-terms">${loan.interestRate.toFixed(1)}% · ${loan.remainingMonths} months left · ${loan.termMonths} month term${loan.type === 'corporate_private_credit' ? ' · Private Credit' : ''}</div>
        <div class="wb-loan-progress-bar">
          <div class="wb-loan-progress-fill" style="width:${Math.min(100, progress).toFixed(0)}%"></div>
        </div>
        <div class="wb-loan-progress-text">Repaid: $${(loan.totalRepaid * 1000).toFixed(0)}M / $${(loan.amount * (1 + loan.interestRate / 100) * 1000).toFixed(0)}M (${progress.toFixed(0)}%)</div>
        <div class="wb-loan-lenders">Lenders: ${lenderNames}</div>
        ${loan.collateral ? `<div class="wb-loan-collateral">Collateral: ${loan.collateral.map(c => c.description).join(', ')}</div>` : ''}
      </div>
    `;
  });
  
  html += `</div>`;
  return html;
}

function renderWbClosedLoans(closedLoans) {
  if (closedLoans.length === 0) {
    return `<div class="tab-section"><h3>⚫ Closed Loans</h3><p class="text-muted">No closed loans.</p></div>`;
  }

  let html = `<div class="tab-section"><h3>⚫ Closed Loans (${closedLoans.length})</h3>`;
  
  closedLoans.forEach(loan => {
    const borrower = NATIONS[loan.borrowerId];
    const statusColor = loan.status === 'paid' ? 'var(--accent-green)' : 'var(--accent-red)';
    const statusIcon = loan.status === 'paid' ? '✅' : '❌';
    
    html += `
      <div class="wb-loan-card wb-loan-closed" onclick="window._wbView='loan'; window._wbSelectedLoan='${loan.id}'; refreshRealtimeTabs();" style="cursor:pointer">
        <div class="wb-loan-header">
          <span class="wb-loan-borrower">${statusIcon} ${borrower ? borrower.flag : '🏳️'} ${borrower ? borrower.name : loan.borrowerId}</span>
          <span class="wb-loan-status" style="color:${statusColor}">${loan.status.toUpperCase()}</span>
        </div>
        <div class="wb-loan-amount">$${(loan.amount * 1000).toFixed(0)}M</div>
        <div class="wb-loan-terms">${loan.interestRate.toFixed(1)}% · Total paid: $${(loan.totalRepaid * 1000).toFixed(0)}M</div>
        ${loan.status === 'defaulted' ? `<div class="wb-loan-collateral" style="color:var(--accent-red)">⚠️ Collateral seized</div>` : ''}
      </div>
    `;
  });
  
  html += `</div>`;
  return html;
}

function renderWbNationList(nationSummaries) {
  const sorted = nationSummaries
    .filter(n => n.totalBorrowed > 0 || n.totalLent > 0)
    .sort((a, b) => (b.totalBorrowed + b.totalLent) - (a.totalBorrowed + a.totalLent));

  if (sorted.length === 0) {
    return `<div class="tab-section"><h3>🌍 Nations by Debt</h3><p class="text-muted">No loan activity yet.</p></div>`;
  }

  let html = `<div class="tab-section"><h3>🌍 Nations by Debt & Lending</h3>`;
  
  sorted.forEach((n, idx) => {
    const nation = NATIONS[n.nationId];
    const rating = GAME.worldBank.creditRatings[n.nationId];
    const ratingLabel = rating ? getCreditRatingLabel(rating.score) : { label: '-', color: 'var(--text-muted)' };
    
    html += `
      <div class="wb-nation-row" onclick="window._wbView='nation'; window._wbSelectedNation='${n.nationId}'; refreshRealtimeTabs();" style="cursor:pointer">
        <span class="wb-rank">#${idx + 1}</span>
        <span class="wb-flag">${nation ? nation.flag : '🏳️'}</span>
        <span class="wb-name">${nation ? nation.name : n.nationId}</span>
        <span class="wb-rating" style="color:${ratingLabel.color}">${ratingLabel.label}</span>
        <span class="wb-amount">Borrowed: $${(n.totalBorrowed * 1000).toFixed(0)}M</span>
        <span class="wb-paid">Lent: $${(n.totalLent * 1000).toFixed(0)}M</span>
      </div>
    `;
  });
  
  html += `</div>`;
  return html;
}

function renderWbNationDetail(nationId, nationSummaries) {
  const nation = NATIONS[nationId];
  if (!nation) return `<div class="tab-section"><p class="text-muted">Nation not found.</p></div>`;
  
  const summary = nationSummaries.find(n => n.nationId === nationId);
  const rating = GAME.worldBank.creditRatings[nationId];
  const ratingLabel = rating ? getCreditRatingLabel(rating.score) : { label: 'N/A', color: 'var(--text-muted)' };
  
  const nationLoans = GAME.worldBank.loans.filter(l => l.borrowerId === nationId || l.lenders.some(lender => lender.nationId === nationId));
  const borrowedLoans = nationLoans.filter(l => l.borrowerId === nationId);
  const lentLoans = nationLoans.filter(l => l.lenders.some(lender => lender.nationId === nationId));
  
  let html = `
    <div class="tab-section">
      <button class="wb-back-btn" onclick="window._wbView='nations'; window._wbSelectedNation=null; refreshRealtimeTabs();">← Back to Nations</button>
      <h3>${nation.flag} ${nation.name} - Loan Portfolio</h3>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Credit Rating</span><span class="r-val" style="color:${ratingLabel.color}">${ratingLabel.label} (${rating?.score || 'N/A'})</span></div>
        <div class="resource-item"><span class="r-name">Total Borrowed</span><span class="r-val">$${((summary?.totalBorrowed || 0) * 1000).toFixed(0)}M</span></div>
        <div class="resource-item"><span class="r-name">Total Repaid</span><span class="r-val positive">$${((summary?.totalRepaid || 0) * 1000).toFixed(0)}M</span></div>
        <div class="resource-item"><span class="r-name">Interest Paid</span><span class="r-val positive">$${((summary?.totalInterest || 0) * 1000).toFixed(0)}M</span></div>
        <div class="resource-item"><span class="r-name">Total Lent</span><span class="r-val">$${((summary?.totalLent || 0) * 1000).toFixed(0)}M</span></div>
        <div class="resource-item"><span class="r-name">Collateral Collected</span><span class="r-val">$${((summary?.collateralCollected || 0) * 1000).toFixed(0)}M</span></div>
        <div class="resource-item"><span class="r-name">Active Loans</span><span class="r-val">${borrowedLoans.filter(l => ['active', 'delinquent'].includes(l.status)).length}</span></div>
        <div class="resource-item"><span class="r-name">Defaults</span><span class="r-val negative">${borrowedLoans.filter(l => l.status === 'defaulted').length}</span></div>
      </div>
    </div>
  `;

  // Borrowed loans
  if (borrowedLoans.length > 0) {
    html += `<div class="tab-section"><h3>📥 Borrowed Loans</h3>`;
    borrowedLoans.forEach(loan => {
      html += renderWbLoanCard(loan, nationId);
    });
    html += `</div>`;
  }

  // Lent loans
  if (lentLoans.length > 0) {
    html += `<div class="tab-section"><h3>📤 Lent Loans</h3>`;
    lentLoans.forEach(loan => {
      html += renderWbLoanCard(loan, nationId, true);
    });
    html += `</div>`;
  }

  return html;
}

function renderWbLoanCard(loan, viewerNationId, isLender = false) {
  const borrower = NATIONS[loan.borrowerId];
  const statusColor = loan.status === 'active' ? 'var(--accent-green)' : 
                     loan.status === 'delinquent' ? 'var(--accent-yellow)' : 
                     loan.status === 'paid' ? 'var(--accent-blue)' : 'var(--accent-red)';
  const progress = loan.totalRepaid / (loan.amount * (1 + loan.interestRate / 100)) * 100;
  const lenderNames = loan.lenders.map(getWorldBankLenderLabel).join(', ');
  
  let html = `
    <div class="wb-loan-card" onclick="window._wbView='loan'; window._wbSelectedLoan='${loan.id}'; refreshRealtimeTabs();" style="cursor:pointer">
      <div class="wb-loan-header">
        <span class="wb-loan-borrower">${borrower ? borrower.flag : '🏳️'} ${borrower ? borrower.name : loan.borrowerId}</span>
        <span class="wb-loan-status" style="color:${statusColor}">${loan.status.toUpperCase()}</span>
      </div>
      <div class="wb-loan-amount">$${(loan.amount * 1000).toFixed(0)}M</div>
      <div class="wb-loan-terms">${loan.interestRate.toFixed(1)}% · ${loan.remainingMonths} months left</div>
      <div class="wb-loan-progress-bar">
        <div class="wb-loan-progress-fill" style="width:${Math.min(100, progress).toFixed(0)}%"></div>
      </div>
      <div class="wb-loan-progress-text">Repaid: $${(loan.totalRepaid * 1000).toFixed(0)}M / $${(loan.amount * (1 + loan.interestRate / 100) * 1000).toFixed(0)}M</div>
      <div class="wb-loan-lenders">Lenders: ${lenderNames}</div>
      ${loan.collateral ? `<div class="wb-loan-collateral">Collateral: ${loan.collateral.map(c => c.description).join(', ')}</div>` : ''}
    </div>
  `;
  
  return html;
}

function renderWbLoanDetail(loanId) {
  const wb = GAME.worldBank;
  const loan = wb.loans.find(l => l.id === loanId);
  if (!loan) return `<div class="tab-section"><p class="text-muted">Loan not found.</p></div>`;
  
  const borrower = NATIONS[loan.borrowerId];
  const statusColor = loan.status === 'active' ? 'var(--accent-green)' : 
                     loan.status === 'delinquent' ? 'var(--accent-yellow)' : 
                     loan.status === 'paid' ? 'var(--accent-blue)' : 'var(--accent-red)';
  const progress = loan.totalRepaid / (loan.amount * (1 + loan.interestRate / 100)) * 100;
  const totalDue = loan.amount * (1 + loan.interestRate / 100);
  const totalInterest = totalDue - loan.amount;
  
  let html = `
    <div class="tab-section">
      <button class="wb-back-btn" onclick="window._wbView='active'; window._wbSelectedLoan=null; refreshRealtimeTabs();">← Back to Loans</button>
      <h3>💰 Loan Details</h3>
      <div class="wb-loan-detail-card">
        <div class="wb-detail-header">
          <span class="wb-detail-borrower">${borrower ? borrower.flag : '🏳️'} ${borrower ? borrower.name : loan.borrowerId}</span>
          <span class="wb-detail-status" style="color:${statusColor}">${loan.status.toUpperCase()}</span>
        </div>
        
        <div class="wb-detail-grid">
          <div class="wb-detail-item"><span class="wb-detail-label">Loan Amount</span><span class="wb-detail-value">$${(loan.amount * 1000).toFixed(0)}M</span></div>
          <div class="wb-detail-item"><span class="wb-detail-label">Loan Type</span><span class="wb-detail-value">${loan.type === 'corporate_private_credit' ? 'Corporate Private Credit' : 'World Bank Multilateral'}</span></div>
          <div class="wb-detail-item"><span class="wb-detail-label">Interest Rate</span><span class="wb-detail-value">${loan.interestRate.toFixed(1)}%</span></div>
          <div class="wb-detail-item"><span class="wb-detail-label">Total Interest</span><span class="wb-detail-value">$${(totalInterest * 1000).toFixed(0)}M</span></div>
          <div class="wb-detail-item"><span class="wb-detail-label">Total Due</span><span class="wb-detail-value">$${(totalDue * 1000).toFixed(0)}M</span></div>
          <div class="wb-detail-item"><span class="wb-detail-label">Total Repaid</span><span class="wb-detail-value positive">$${(loan.totalRepaid * 1000).toFixed(0)}M</span></div>
          <div class="wb-detail-item"><span class="wb-detail-label">Remaining</span><span class="wb-detail-value">$${(Math.max(0, totalDue - loan.totalRepaid) * 1000).toFixed(0)}M</span></div>
          <div class="wb-detail-item"><span class="wb-detail-label">Monthly Payment</span><span class="wb-detail-value">$${(loan.monthlyPayment * 1000).toFixed(0)}M</span></div>
          <div class="wb-detail-item"><span class="wb-detail-label">Months Left</span><span class="wb-detail-value">${loan.remainingMonths} / ${loan.termMonths}</span></div>
          <div class="wb-detail-item"><span class="wb-detail-label">Created</span><span class="wb-detail-value">Turn ${loan.createdTurn}</span></div>
          <div class="wb-detail-item"><span class="wb-detail-label">Due</span><span class="wb-detail-value">Turn ${loan.dueTurn}</span></div>
          <div class="wb-detail-item"><span class="wb-detail-label">Missed Payments</span><span class="wb-detail-value ${loan.missedPayments > 0 ? 'negative' : ''}">${loan.missedPayments}</span></div>
          <div class="wb-detail-item"><span class="wb-detail-label">Extensions</span><span class="wb-detail-value">${loan.extensions || 0}</span></div>
        </div>
        
        <div class="wb-detail-progress">
          <div class="wb-detail-progress-bar">
            <div class="wb-detail-progress-fill" style="width:${Math.min(100, progress).toFixed(0)}%"></div>
          </div>
          <div class="wb-detail-progress-text">${progress.toFixed(1)}% repaid</div>
        </div>
      </div>
    </div>
  `;

  // Lender breakdown
  html += `<div class="tab-section"><h3>🏦 Lender Breakdown</h3>`;
  loan.lenders.forEach(lender => {
    const profit = getLoanLenderReceivedM(lender) - getLoanLenderAmountM(lender);
    const profitColor = profit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    html += `
      <div class="wb-lender-row">
        <span class="wb-lender-flag">${lender.entityType === 'company' ? '🏢' : '🏦'}</span>
        <span class="wb-lender-name">${getWorldBankLenderLabel(lender)}</span>
        <span class="wb-lender-share">${(lender.share * 100).toFixed(1)}%</span>
        <span class="wb-lender-amount">$${getLoanLenderAmountM(lender).toFixed(0)}M</span>
        <span class="wb-lender-received">$${getLoanLenderReceivedM(lender).toFixed(0)}M</span>
        <span class="wb-lender-profit" style="color:${profitColor}">${profit >= 0 ? '+' : ''}$${profit.toFixed(0)}M</span>
      </div>
    `;
  });
  html += `</div>`;

  // Collateral details
  if (loan.collateral && loan.collateral.length > 0) {
    html += `<div class="tab-section"><h3>🔒 Collateral</h3>`;
    loan.collateral.forEach(coll => {
      html += `
        <div class="wb-collateral-row">
          <span class="wb-collateral-type">${coll.type.replace('_', ' ').toUpperCase()}</span>
          <span class="wb-collateral-desc">${coll.description}</span>
          <span class="wb-collateral-value">$${(coll.value * 1000).toFixed(0)}M</span>
        </div>
      `;
    });
    html += `</div>`;
  }

  // Transaction history for this loan
  const loanTxns = wb.transactions.filter(t => t.loanId === loanId);
  if (loanTxns.length > 0) {
    html += `<div class="tab-section"><h3>📋 Loan Transaction History</h3>`;
    loanTxns.forEach(txn => {
      const icon = getTransactionIcon(txn.type);
      const color = getTransactionColor(txn.type);
      html += `
        <div class="wb-txn-row">
          <span class="wb-txn-icon">${icon}</span>
          <span class="wb-txn-details">${txn.details}</span>
          <span class="wb-txn-amount" style="color:${color}">$${txn.amountM.toFixed(0)}M</span>
          <span class="wb-txn-turn">${txn.date}</span>
        </div>
      `;
    });
    html += `</div>`;
  }

  return html;
}

function computeNationLoanSummaries() {
  initWorldBankState();
  const wb = GAME.worldBank;
  const summaries = {};
  
  Object.values(NATIONS).forEach(nation => {
    summaries[nation.id] = {
      nationId: nation.id,
      totalBorrowed: 0,
      totalRepaid: 0,
      totalInterest: 0,
      totalLent: 0,
      collateralCollected: 0,
      activeLoans: 0,
      defaults: 0,
    };
  });
  
  wb.loans.forEach(loan => {
    // Borrower side
    const borrower = summaries[loan.borrowerId];
    if (borrower) {
      borrower.totalBorrowed += loan.amount;
      borrower.totalRepaid += (loan.totalRepaid || 0);
      if (['active', 'delinquent', 'restructuring'].includes(loan.status)) {
        borrower.activeLoans++;
      }
      if (loan.status === 'defaulted') {
        borrower.defaults++;
      }
    }
    
    // Lender side
    loan.lenders.forEach(lender => {
      if (lender.entityType === 'company') return;
      const lenderSummary = summaries[lender.nationId];
      if (lenderSummary) {
        lenderSummary.totalLent += lender.amount;
        lenderSummary.collateralCollected += Math.max(0, (getLoanLenderReceivedM(lender) / 1000) - Number(lender.amount || 0));
      }
    });
  });
  
  // Calculate interest
  Object.values(summaries).forEach(s => {
    s.totalInterest = Math.max(0, s.totalRepaid - s.totalBorrowed);
  });
  
  return Object.values(summaries);
}

function computeCompanyLoanSummaries() {
  initWorldBankState();
  const summaries = {};

  GAME.worldBank.loans.forEach(loan => {
    loan.lenders.forEach(lender => {
      if (lender.entityType !== 'company') return;
      const found = getGlobalDefenseCompanyById(lender.companyId) || (typeof getGlobalCompanyById === 'function' ? getGlobalCompanyById(lender.companyId) : null);
      if (!found?.company) return;
      if (!summaries[lender.companyId]) {
        summaries[lender.companyId] = {
          companyId: lender.companyId,
          companyName: found.company.name || (typeof getCompanyDisplayName === 'function' ? getCompanyDisplayName(found.company) : lender.companyId),
          flag: found.nation?.flag || '🏳️',
          nationName: found.nation?.name || '',
          totalLent: 0,
          totalReceived: 0,
          totalInterest: 0,
          activeLoans: 0,
          borrowerIds: new Set(),
        };
      }
      const summary = summaries[lender.companyId];
      summary.totalLent += getLoanLenderAmountM(lender) / 1000;
      summary.totalReceived += getLoanLenderReceivedM(lender) / 1000;
      summary.borrowerIds.add(loan.borrowerId);
      if (['active', 'delinquent', 'restructuring'].includes(loan.status)) summary.activeLoans += 1;
    });
  });

  return Object.values(summaries)
    .map(summary => ({ ...summary, totalInterest: Math.max(0, summary.totalReceived - summary.totalLent), borrowerIds: Array.from(summary.borrowerIds) }))
    .sort((a, b) => (b.totalLent + b.totalInterest) - (a.totalLent + a.totalInterest));
}

function renderWbCompanyList(companySummaries) {
  if (!companySummaries.length) {
    return `<div class="tab-section"><h3>🏭 Defense Lenders</h3><p class="text-muted">No defense private-credit loans yet.</p></div>`;
  }

  let html = `<div class="tab-section"><h3>🏭 Defense Lenders</h3>`;
  companySummaries.forEach((summary, idx) => {
    html += `
      <div class="wb-nation-row" onclick="window._wbView='company'; window._wbSelectedCompany='${summary.companyId}'; refreshRealtimeTabs();" style="cursor:pointer">
        <span class="wb-rank">#${idx + 1}</span>
        <span class="wb-flag">${summary.flag}</span>
        <span class="wb-name">${summary.companyName}</span>
        <span class="wb-amount">Lent: $${(summary.totalLent * 1000).toFixed(0)}M</span>
        <span class="wb-paid">Paid: $${(summary.totalReceived * 1000).toFixed(0)}M</span>
        <span class="wb-interest">Interest: $${(summary.totalInterest * 1000).toFixed(0)}M</span>
      </div>
    `;
  });
  html += `</div>`;
  return html;
}

function renderWbCompanyDetail(companyId, companySummaries) {
  const summary = companySummaries.find(item => item.companyId === companyId);
  const found = getGlobalDefenseCompanyById(companyId) || (typeof getGlobalCompanyById === 'function' ? getGlobalCompanyById(companyId) : null);
  if (!summary || !found?.company) return `<div class="tab-section"><p class="text-muted">Company lender not found.</p></div>`;

  if (typeof initDefenseCompanyFinancials === 'function') initDefenseCompanyFinancials(found.company);
  const revenue = Number(found.company.totalRevenue || found.company.revenue || 0);
  const researchCost = Number(found.company.totalResearchCost || 0);
  const pnl = revenue - researchCost;
  const pnlSign = pnl >= 0 ? '+' : '';

  const relatedLoans = GAME.worldBank.loans.filter(loan => loan.lenders.some(lender => lender.entityType === 'company' && lender.companyId === companyId));
  let html = `
    <div class="tab-section">
      <button class="wb-back-btn" onclick="window._wbView='companies'; window._wbSelectedCompany=null; refreshRealtimeTabs();">← Back to Defense Lenders</button>
      <h3>🏭 ${summary.flag} ${summary.companyName}</h3>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Host Nation</span><span class="r-val">${summary.nationName}</span></div>
        <div class="resource-item"><span class="r-name">Total Lent</span><span class="r-val">$${(summary.totalLent * 1000).toFixed(0)}M</span></div>
        <div class="resource-item"><span class="r-name">Total Paid Back</span><span class="r-val">$${(summary.totalReceived * 1000).toFixed(0)}M</span></div>
        <div class="resource-item"><span class="r-name">Interest Earned</span><span class="r-val">$${(summary.totalInterest * 1000).toFixed(0)}M</span></div>
        <div class="resource-item"><span class="r-name">Active Loans</span><span class="r-val">${summary.activeLoans}</span></div>
        <div class="resource-item"><span class="r-name">Borrower Countries</span><span class="r-val">${summary.borrowerIds.length}</span></div>
        <div class="resource-item"><span class="r-name">Revenue</span><span class="r-val">$${revenue.toFixed(0)}M</span></div>
        <div class="resource-item"><span class="r-name">Research Cost</span><span class="r-val">$${researchCost.toFixed(0)}M</span></div>
        <div class="resource-item"><span class="r-name">P&L</span><span class="r-val ${pnl >= 0 ? 'positive' : 'negative'}">${pnlSign}$${pnl.toFixed(0)}M</span></div>
        <div class="resource-item"><span class="r-name">Lending Capital</span><span class="r-val">$${Number(found.company.privateCreditCapitalM || 0).toFixed(0)}M</span></div>
      </div>
    </div>
  `;

  html += `<div class="tab-section"><h3>🌍 Borrowing Countries</h3>`;
  relatedLoans.forEach(loan => {
    const borrower = NATIONS[loan.borrowerId];
    const lenderEntry = loan.lenders.find(lender => lender.entityType === 'company' && lender.companyId === companyId);
    html += `
      <div class="wb-loan-card" onclick="window._wbView='loan'; window._wbSelectedLoan='${loan.id}'; refreshRealtimeTabs();" style="cursor:pointer">
        <div class="wb-loan-header">
          <span class="wb-loan-borrower">${borrower?.flag || '🏳️'} ${borrower?.name || loan.borrowerId}</span>
          <span class="wb-loan-status" style="color:${loan.status === 'defaulted' ? 'var(--accent-red)' : 'var(--accent-green)'}">${loan.status.toUpperCase()}</span>
        </div>
        <div class="wb-loan-amount">Principal: $${getLoanLenderAmountM(lenderEntry).toFixed(0)}M</div>
        <div class="wb-loan-terms">Received: $${getLoanLenderReceivedM(lenderEntry).toFixed(0)}M · Interest: $${Math.max(0, getLoanLenderReceivedM(lenderEntry) - getLoanLenderAmountM(lenderEntry)).toFixed(0)}M</div>
      </div>
    `;
  });
  html += `</div>`;
  return html;
}

function getTransactionIcon(type) {
  switch (type) {
    case 'loan_issued': return '📥';
    case 'company_loan_issued': return '🏢';
    case 'payment': return '💰';
    case 'company_payment': return '🏦';
    case 'loan_completed': return '✅';
    case 'company_loan_completed': return '🏁';
    case 'bridge_liquidity': return '🧯';
    case 'default': return '🚨';
    case 'collateral_seized': return '🔒';
    case 'bailout': return '🆘';
    case 'state_recovery': return '🧱';
    case 'contribution': return '🏦';
    default: return '📋';
  }
}

function getTransactionColor(type) {
  switch (type) {
    case 'loan_issued': return 'var(--accent-blue)';
    case 'company_loan_issued': return 'var(--accent-yellow)';
    case 'payment': return 'var(--accent-green)';
    case 'company_payment': return 'var(--accent-yellow)';
    case 'loan_completed': return 'var(--accent-green)';
    case 'company_loan_completed': return 'var(--accent-green)';
    case 'bridge_liquidity': return 'var(--accent-blue)';
    case 'default': return 'var(--accent-red)';
    case 'collateral_seized': return 'var(--accent-yellow)';
    case 'bailout': return 'var(--accent-yellow)';
    case 'state_recovery': return 'var(--accent-blue)';
    case 'contribution': return 'var(--accent-blue)';
    default: return 'var(--text-primary)';
  }
}

function filterWbTransactions(type) {
  const rows = document.querySelectorAll('.wb-txn-row');
  rows.forEach(row => {
    if (type === 'all' || row.classList.contains(`wb-txn-${type}`)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

function renderWbProposals(wb, playerId) {
  const allProposals = wb.proposals.filter(p => ['pending', 'under_review', 'countered', 'approved', 'declined'].includes(p.status));
  const playerProposals = allProposals.filter(p => p.borrowerId === playerId);
  const otherProposals = allProposals.filter(p => p.borrowerId !== playerId);
  
  let html = '';
  
  // Player's proposals
  html += `<div class="tab-section"><h3>📋 Your Loan Proposals</h3>`;
  
  if (playerProposals.length === 0) {
    html += `<p class="text-muted">No loan proposals. Click "Apply for Loan" in Actions to submit a proposal.</p>`;
  } else {
    playerProposals.forEach(proposal => {
      const statusColor = proposal.status === 'approved' ? 'var(--accent-green)' : 
                         proposal.status === 'declined' ? 'var(--accent-red)' : 
                         proposal.status === 'countered' ? 'var(--accent-yellow)' : 'var(--accent-blue)';
      const statusIcon = proposal.status === 'approved' ? '✅' : 
                        proposal.status === 'declined' ? '❌' : 
                        proposal.status === 'countered' ? '🔄' : '⏳';
      
      html += `<div class="wb-proposal-card">`;
      html += `<div class="wb-proposal-header">`;
      html += `<span class="wb-proposal-status" style="color:${statusColor}">${statusIcon} ${proposal.status.replace('_', ' ').toUpperCase()}</span>`;
      html += `<span class="wb-proposal-turn">Submitted: Turn ${proposal.createdTurn}</span>`;
      html += `</div>`;
      
      // Loan details
      html += `<div class="wb-proposal-details">`;
      html += `<div class="wb-proposal-row"><span class="wb-proposal-label">Requested Amount:</span><span class="wb-proposal-value">$${(proposal.requestedAmount * 1000).toFixed(0)}M</span></div>`;
      html += `<div class="wb-proposal-row"><span class="wb-proposal-label">Interest Rate:</span><span class="wb-proposal-value">${proposal.requestedRate.toFixed(1)}%</span></div>`;
      html += `<div class="wb-proposal-row"><span class="wb-proposal-label">Term:</span><span class="wb-proposal-value">${proposal.requestedTerm} months</span></div>`;
      html += `<div class="wb-proposal-row"><span class="wb-proposal-label">Fair Terms (WB):</span><span class="wb-proposal-value">$${(proposal.fairTerms.amount * 1000).toFixed(0)}M at ${proposal.fairTerms.rate.toFixed(1)}% for ${proposal.fairTerms.term} months</span></div>`;
      html += `</div>`;
      
      // Reason
      if (proposal.reason) {
        html += `<div class="wb-proposal-reason">`;
        html += `<div class="wb-proposal-reason-title">📝 Purpose: ${proposal.reason.title}</div>`;
        html += `<div class="wb-proposal-reason-text">${proposal.reason.reason}</div>`;
        html += `</div>`;
      }
      
      // Counter-proposal details
      if (proposal.status === 'countered' && proposal.counterProposal) {
        html += `<div class="wb-proposal-counter">`;
        html += `<div class="wb-proposal-counter-title">🔄 World Bank Counter-Proposal (Round ${proposal.counterCount}/${proposal.maxCounters})</div>`;
        html += `<div class="wb-proposal-row"><span class="wb-proposal-label">Offered Amount:</span><span class="wb-proposal-value">$${(proposal.counterProposal.amount * 1000).toFixed(0)}M</span></div>`;
        html += `<div class="wb-proposal-row"><span class="wb-proposal-label">Offered Rate:</span><span class="wb-proposal-value">${proposal.counterProposal.interestRate.toFixed(1)}%</span></div>`;
        html += `<div class="wb-proposal-row"><span class="wb-proposal-label">Offered Term:</span><span class="wb-proposal-value">${proposal.counterProposal.termMonths} months</span></div>`;
        if (proposal.counterProposal.collateral) {
          html += `<div class="wb-proposal-row"><span class="wb-proposal-label">Required Collateral:</span><span class="wb-proposal-value">${proposal.counterProposal.collateral.map(c => c.description).join(', ')}</span></div>`;
        }
        html += `</div>`;
        
        // Accept button
        html += `<div class="wb-proposal-actions">`;
        html += `<button class="wb-accept-btn" onclick="playerAcceptCounter('${proposal.id}')">✅ Accept Counter-Proposal</button>`;
        html += `<button class="wb-counter-btn" onclick="document.getElementById('wb-counter-form-${proposal.id}').style.display='block'">🔄 Submit Counter-Offer</button>`;
        html += `</div>`;
        
        // Counter form (hidden by default)
        html += `<div id="wb-counter-form-${proposal.id}" style="display:none;margin-top:8px;padding:8px;background:rgba(9,28,54,0.5);border-radius:6px">`;
        html += `<div style="font-size:11px;font-weight:600;margin-bottom:6px">Your Counter-Offer:</div>`;
        html += `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">`;
        html += `<div><label style="font-size:9px;color:var(--text-muted)">Amount ($M)</label><input type="number" id="wb-counter-amount-${proposal.id}" value="${(proposal.counterProposal.amount * 1000).toFixed(0)}" min="50" max="10000" style="width:100%;padding:4px 6px;background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-primary);border-radius:4px;font-size:11px"></div>`;
        html += `<div><label style="font-size:9px;color:var(--text-muted)">Rate (%)</label><input type="number" id="wb-counter-rate-${proposal.id}" value="${proposal.counterProposal.interestRate.toFixed(1)}" min="1" max="20" step="0.5" style="width:100%;padding:4px 6px;background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-primary);border-radius:4px;font-size:11px"></div>`;
        html += `<div><label style="font-size:9px;color:var(--text-muted)">Term (months)</label><input type="number" id="wb-counter-term-${proposal.id}" value="${proposal.counterProposal.termMonths}" min="6" max="48" style="width:100%;padding:4px 6px;background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-primary);border-radius:4px;font-size:11px"></div>`;
        html += `</div>`;
        html += `<button class="wb-submit-btn" onclick="playerSubmitCounter('${proposal.id}')">Submit Counter-Offer</button>`;
        html += `</div>`;
      }
      
      // Decline reason
      if (proposal.status === 'declined' && proposal.declineReason) {
        html += `<div class="wb-proposal-decline">`;
        html += `<div class="wb-proposal-decline-title">❌ Declined</div>`;
        html += `<div class="wb-proposal-decline-reason">${proposal.declineReason}</div>`;
        const cooldownTurn = wb.declineCooldowns[proposal.borrowerId];
        if (cooldownTurn) {
          const turnsLeft = 10 - (GAME.turn - cooldownTurn);
          if (turnsLeft > 0) {
            html += `<div class="wb-proposal-cooldown">Can reapply in ${turnsLeft} turns.</div>`;
          }
        }
        html += `</div>`;
      }
      
      // Counter history
      if (proposal.counterHistory && proposal.counterHistory.length > 0) {
        html += `<div class="wb-proposal-history">`;
        html += `<div class="wb-proposal-history-title">📜 Negotiation History:</div>`;
        proposal.counterHistory.forEach((counter, idx) => {
          const fromLabel = counter.from === 'world_bank' ? '🏦 World Bank' : `${GAME.playerNation.flag} You`;
          html += `<div class="wb-proposal-history-row">${fromLabel}: $${(counter.amount * 1000).toFixed(0)}M at ${counter.rate.toFixed(1)}% for ${counter.term} months (Turn ${counter.turn})</div>`;
        });
        html += `</div>`;
      }
      
      html += `</div>`;
    });
  }
  
  html += `</div>`;
  
  // Other nations' proposals (for visibility)
  if (otherProposals.length > 0) {
    html += `<div class="tab-section"><h3>🌍 Other Nations' Proposals</h3>`;
    otherProposals.forEach(proposal => {
      const nation = NATIONS[proposal.borrowerId];
      const statusColor = proposal.status === 'approved' ? 'var(--accent-green)' : 
                         proposal.status === 'declined' ? 'var(--accent-red)' : 
                         proposal.status === 'countered' ? 'var(--accent-yellow)' : 'var(--accent-blue)';
      const statusIcon = proposal.status === 'approved' ? '✅' : 
                        proposal.status === 'declined' ? '❌' : 
                        proposal.status === 'countered' ? '🔄' : '⏳';
      
      html += `<div class="wb-proposal-card wb-proposal-other">`;
      html += `<div class="wb-proposal-header">`;
      html += `<span class="wb-proposal-nation">${nation ? nation.flag : '🏳️'} ${nation ? nation.name : proposal.borrowerId}</span>`;
      html += `<span class="wb-proposal-status" style="color:${statusColor}">${statusIcon} ${proposal.status.replace('_', ' ').toUpperCase()}</span>`;
      html += `</div>`;
      html += `<div class="wb-proposal-details">`;
      html += `<div class="wb-proposal-row"><span class="wb-proposal-label">Amount:</span><span class="wb-proposal-value">$${(proposal.requestedAmount * 1000).toFixed(0)}M</span></div>`;
      html += `<div class="wb-proposal-row"><span class="wb-proposal-label">Rate:</span><span class="wb-proposal-value">${proposal.requestedRate.toFixed(1)}%</span></div>`;
      html += `<div class="wb-proposal-row"><span class="wb-proposal-label">Purpose:</span><span class="wb-proposal-value">${proposal.reason?.title || 'N/A'}</span></div>`;
      html += `</div>`;
      html += `</div>`;
    });
    html += `</div>`;
  }
  
  return html;
}

function renderWbApplyLoanForm(wb, playerId, rating) {
  const ratingLabel = getCreditRatingLabel(rating.score);
  const fairAmount = clamp(GAME.playerNation.gdp * 0.02 * (rating.score / 50), 0.05, 3.0);
  const fairRate = clamp(3 + (100 - rating.score) * 0.08, 2, 15);
  const fairTerm = clamp(12 + Math.floor(rating.score / 10), 6, 36);
  
  // Check if can apply
  const existingLoan = wb.loans.find(l => l.borrowerId === playerId && ['active', 'delinquent', 'restructuring'].includes(l.status));
  const existingProposal = wb.proposals.find(p => p.borrowerId === playerId && ['pending', 'under_review', 'countered'].includes(p.status));
  const cooldownTurn = wb.declineCooldowns[playerId];
  const cooldownLeft = cooldownTurn ? Math.max(0, 10 - (GAME.turn - cooldownTurn)) : 0;
  
  if (existingLoan) {
    return `<div class="tab-section"><h3>📝 Apply for Loan</h3><p class="text-muted">You already have an active World Bank loan.</p></div>`;
  }
  if (existingProposal) {
    return `<div class="tab-section"><h3>📝 Apply for Loan</h3><p class="text-muted">You already have a pending proposal under review. <button class="wb-back-btn" onclick="window._wbView='proposals'; refreshRealtimeTabs();">View Proposals</button></p></div>`;
  }
  if (cooldownLeft > 0) {
    return `<div class="tab-section"><h3>📝 Apply for Loan</h3><p class="text-muted">You must wait ${cooldownLeft} more turns before submitting a new proposal.</p></div>`;
  }
  if (rating.score < 20) {
    return `<div class="tab-section"><h3>📝 Apply for Loan</h3><p class="text-muted">Your credit rating (${ratingLabel.label}, score: ${rating.score}) is too low to qualify. Improve your stability, governance, and reduce debt to qualify.</p></div>`;
  }
  
  let html = `<div class="tab-section">`;
  html += `<button class="wb-back-btn" onclick="window._wbView='proposals'; refreshRealtimeTabs();">← Back to Proposals</button>`;
  html += `<h3>📝 Submit Loan Proposal</h3>`;
  
  // Credit rating info
  html += `<div class="wb-form-info">`;
  html += `<div class="wb-form-info-row"><span class="wb-form-info-label">Your Credit Rating:</span><span class="wb-form-info-value" style="color:${ratingLabel.color}">${ratingLabel.label} (${rating.score}) - ${rating.outlook}</span></div>`;
  html += `<div class="wb-form-info-row"><span class="wb-form-info-label">Fair Loan Amount:</span><span class="wb-form-info-value">$${(fairAmount * 1000).toFixed(0)}M (you can request up to $${(fairAmount * 2.5 * 1000).toFixed(0)}M)</span></div>`;
  html += `<div class="wb-form-info-row"><span class="wb-form-info-label">Fair Interest Rate:</span><span class="wb-form-info-value">${fairRate.toFixed(1)}%</span></div>`;
  html += `<div class="wb-form-info-row"><span class="wb-form-info-label">Fair Term:</span><span class="wb-form-info-value">${fairTerm} months</span></div>`;
  html += `</div>`;
  
  // Form
  html += `<div class="wb-loan-form">`;
  html += `<div class="wb-form-group">`;
  html += `<label class="wb-form-label">Loan Amount ($M)</label>`;
  html += `<input type="number" id="wb-loan-amount" value="${(fairAmount * 1000).toFixed(0)}" min="50" max="10000" step="50" style="width:100%;padding:8px 10px;background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-primary);border-radius:6px;font-size:13px">`;
  html += `<div class="wb-form-hint">Recommended: $${(fairAmount * 1000).toFixed(0)}M. Max: $${(fairAmount * 2.5 * 1000).toFixed(0)}M</div>`;
  html += `</div>`;
  
  html += `<div class="wb-form-group">`;
  html += `<label class="wb-form-label">Interest Rate (%)</label>`;
  html += `<input type="number" id="wb-loan-rate" value="${fairRate.toFixed(1)}" min="1" max="20" step="0.5" style="width:100%;padding:8px 10px;background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-primary);border-radius:6px;font-size:13px">`;
  html += `<div class="wb-form-hint">Fair rate: ${fairRate.toFixed(1)}%. Lower rates may be countered by World Bank.</div>`;
  html += `</div>`;
  
  html += `<div class="wb-form-group">`;
  html += `<label class="wb-form-label">Loan Term (months)</label>`;
  html += `<input type="number" id="wb-loan-term" value="${fairTerm}" min="6" max="48" style="width:100%;padding:8px 10px;background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-primary);border-radius:6px;font-size:13px">`;
  html += `<div class="wb-form-hint">Fair term: ${fairTerm} months. Max: 48 months.</div>`;
  html += `</div>`;
  
  html += `<div class="wb-form-group">`;
  html += `<label class="wb-form-label">Loan Purpose</label>`;
  html += `<select id="wb-loan-reason" style="width:100%;padding:8px 10px;background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-primary);border-radius:6px;font-size:13px">`;
  html += `<option value="auto">🤖 Auto-detect based on nation needs</option>`;
  html += `<option value="education">🎓 Education</option>`;
  html += `<option value="health">🏥 Healthcare</option>`;
  html += `<option value="infrastructure">🏗️ Infrastructure</option>`;
  html += `<option value="defense">⚔️ Defense</option>`;
  html += `<option value="economic_stability">📊 Economic Stabilization</option>`;
  html += `<option value="energy">⚡ Energy</option>`;
  html += `<option value="resource_development">⛏️ Resource Development</option>`;
  html += `<option value="debt_refinancing">💳 Debt Refinancing</option>`;
  html += `<option value="inflation_control">📈 Inflation Control</option>`;
  html += `<option value="technology">🔬 Technology</option>`;
  html += `<option value="environment">🌍 Environment</option>`;
  html += `<option value="governance">🏛️ Governance</option>`;
  html += `<option value="custom">✏️ Custom reason</option>`;
  html += `</select>`;
  html += `</div>`;
  
  html += `<div class="wb-form-group" id="wb-custom-reason-group" style="display:none">`;
  html += `<label class="wb-form-label">Custom Reason</label>`;
  html += `<textarea id="wb-loan-custom-reason" rows="4" placeholder="Explain why you need this loan. Be specific about how the funds will be used and how you plan to repay." style="width:100%;padding:8px 10px;background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-primary);border-radius:6px;font-size:12px;resize:vertical"></textarea>`;
  html += `</div>`;
  
  html += `<div class="wb-form-actions">`;
  html += `<button class="wb-submit-btn" onclick="submitPlayerLoanProposal()">📤 Submit Proposal to World Bank</button>`;
  html += `</div>`;
  
  html += `</div>`;
  html += `</div>`;
  
  // Add script to show/hide custom reason
  html += `<script>
    document.getElementById('wb-loan-reason')?.addEventListener('change', function() {
      document.getElementById('wb-custom-reason-group').style.display = this.value === 'custom' ? 'block' : 'none';
    });
  </script>`;
  
  return html;
}

function playerApplyWorldBankLoan() {
  // Show the loan application form
  window._wbView = 'apply_loan';
  refreshRealtimeTabs();
}

function submitPlayerLoanProposal() {
  initWorldBankState();
  const wb = GAME.worldBank;
  const player = GAME.playerNation;
  
  // Get form values
  const amountInput = document.getElementById('wb-loan-amount');
  const rateInput = document.getElementById('wb-loan-rate');
  const termInput = document.getElementById('wb-loan-term');
  const reasonSelect = document.getElementById('wb-loan-reason');
  const customReason = document.getElementById('wb-loan-custom-reason');
  
  if (!amountInput || !rateInput || !termInput || !reasonSelect) return;
  
  const amount = parseFloat(amountInput.value);
  const rate = parseFloat(rateInput.value);
  const term = parseInt(termInput.value);
  const reasonCategory = reasonSelect.value;
  const customReasonText = customReason ? customReason.value : '';
  
  // Validation
  if (isNaN(amount) || amount < 0.05 || amount > 10) {
    addNews('🏦 Loan amount must be between $50M and $10,000M.', 'major');
    return;
  }
  if (isNaN(rate) || rate < 1 || rate > 20) {
    addNews('🏦 Interest rate must be between 1% and 20%.', 'major');
    return;
  }
  if (isNaN(term) || term < 6 || term > 48) {
    addNews('🏦 Loan term must be between 6 and 48 months.', 'major');
    return;
  }
  
  // Check existing loan
  const existingLoan = wb.loans.find(l => l.borrowerId === player.id && ['active', 'delinquent', 'restructuring'].includes(l.status));
  if (existingLoan) {
    addNews('🏦 You already have an active World Bank loan.', 'minor');
    return;
  }
  
  // Check existing proposal
  const existingProposal = wb.proposals.find(p => p.borrowerId === player.id && ['pending', 'under_review', 'countered'].includes(p.status));
  if (existingProposal) {
    addNews('🏦 You already have a pending loan proposal under review.', 'minor');
    return;
  }
  
  // Check cooldown
  const cooldownTurn = wb.declineCooldowns[player.id];
  if (cooldownTurn && GAME.turn - cooldownTurn < 10) {
    addNews(`🏦 You must wait ${10 - (GAME.turn - cooldownTurn)} more turns before submitting a new proposal.`, 'major');
    return;
  }
  
  // Build reason
  let reason;
  if (reasonCategory === 'custom' && customReasonText) {
    reason = {
      category: 'custom',
      title: customReasonText.substring(0, 50) + (customReasonText.length > 50 ? '...' : ''),
      reason: customReasonText,
      priority: 50,
    };
  } else {
    reason = generateLoanReason(player, amount);
    // Override category if selected
    if (reasonCategory !== 'auto') {
      reason.category = reasonCategory;
    }
  }
  
  // Submit proposal
  const result = createLoanProposal(player, amount, rate, term, reason);
  
  if (result.success) {
    addNews(`📋 Your loan proposal of $${(amount * 1000).toFixed(0)}M at ${rate.toFixed(1)}% for ${term} months has been submitted to the World Bank for review.`, 'major');
    window._wbView = 'proposals';
  } else {
    addNews(`🏦 ${result.message}`, 'major');
  }
  
  refreshRealtimeTabs();
}

function playerAcceptCounter(proposalId) {
  const result = borrowerAcceptCounter(proposalId);
  if (result.success) {
    addNews('✅ You accepted the World Bank\'s counter-proposal. Loan has been finalized!', 'major');
  } else {
    addNews(`🏦 ${result.message}`, 'major');
  }
  refreshRealtimeTabs();
}

function playerSubmitCounter(proposalId) {
  const amountInput = document.getElementById(`wb-counter-amount-${proposalId}`);
  const rateInput = document.getElementById(`wb-counter-rate-${proposalId}`);
  const termInput = document.getElementById(`wb-counter-term-${proposalId}`);
  
  if (!amountInput || !rateInput || !termInput) return;
  
  const amount = parseFloat(amountInput.value);
  const rate = parseFloat(rateInput.value);
  const term = parseInt(termInput.value);
  
  if (isNaN(amount) || isNaN(rate) || isNaN(term)) {
    addNews('🏦 Please fill in all counter-proposal fields.', 'major');
    return;
  }
  
  const result = borrowerCounterProposal(proposalId, amount, rate, term);
  if (result.success) {
    addNews(`🔄 ${result.message}`, 'major');
  } else {
    addNews(`🏦 ${result.message}`, 'major');
  }
  refreshRealtimeTabs();
}

function playerContributeToWorldBank() {
  initWorldBankState();
  const wb = GAME.worldBank;
  const player = GAME.playerNation;
  
  const contribution = clamp(player.gdp * 0.01, 0.05, 1.0);
  const contributionM = contribution * 1000;
  
  if (GAME.treasury < contributionM) {
    addNews('🏦 Insufficient treasury to contribute to World Bank.', 'major');
    return;
  }
  
  GAME.treasury -= contributionM;
  wb.contributions[player.id] = (wb.contributions[player.id] || 0) + contribution;
  wb.capital += contribution;
  wb.votingPower[player.id] = wb.contributions[player.id] / wb.capital * 100;
  
  player.gdp = clamp(player.gdp - contribution * 0.01, 0.05, 100);
  
  addNews(`🏦 ${player.flag} ${player.name} contributes $${contributionM.toFixed(0)}M to World Bank capital. Voting power: ${wb.votingPower[player.id].toFixed(1)}%`, 'minor');
  
  refreshRealtimeTabs();
}

function playerOfferBailout() {
  initWorldBankState();
  const wb = GAME.worldBank;
  const player = GAME.playerNation;
  
  // Find nations in crisis
  const crisisNations = Object.values(NATIONS).filter(n => {
    if (n.id === player.id) return false;
    if (n.failedState) return n.crisisRisk > 72 || n.stability < 24;
    return n.stability < 30 && n.crisisRisk > 60;
  });
  
  if (crisisNations.length === 0) {
    addNews('🏦 No nations currently qualify for bailout or recovery mission.', 'minor');
    return;
  }
  
  // Pick the most critical nation
  const target = crisisNations.sort((a, b) => b.crisisRisk - a.crisisRisk)[0];
  
  // Check if already in bailout
  const existingBailout = wb.bailouts.find(b => b.nationId === target.id && b.status === 'active');
  if (existingBailout) {
    addNews(`🏦 ${target.name} is already in a bailout program.`, 'minor');
    return;
  }
  
  // Trigger bailout processing
  processIMFBailoutOpportunities();
  
  refreshRealtimeTabs();
}

function playerRequestCreditReview() {
  initWorldBankState();
  const wb = GAME.worldBank;
  const player = GAME.playerNation;
  
  const rating = computeWorldBankCreditRating(player);
  const label = getCreditRatingLabel(rating.score);
  
  addNews(`📊 Credit Review: ${player.flag} ${player.name} rated ${label.label} (${rating.score}) with ${rating.outlook} outlook. GDP: $${player.gdp.toFixed(2)}T, Stability: ${player.stability.toFixed(1)}`, 'minor');
  
  refreshRealtimeTabs();
}

// Export for global access
window.renderWorldBankTab = renderWorldBankTab;
window.playerApplyWorldBankLoan = playerApplyWorldBankLoan;
window.playerContributeToWorldBank = playerContributeToWorldBank;
window.playerOfferBailout = playerOfferBailout;
window.playerRequestCreditReview = playerRequestCreditReview;
