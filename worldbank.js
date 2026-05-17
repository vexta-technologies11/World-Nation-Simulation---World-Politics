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
    type,          // 'loan_issued', 'payment', 'default', 'collateral_seized', 'bailout', 'contribution'
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
  
  // Nations contribute based on GDP (rich nations contribute more)
  Object.values(NATIONS).forEach(nation => {
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
  
  // First process existing proposals
  processWorldBankProposals();
  
  // Find nations that need loans and create proposals
  Object.values(NATIONS).forEach(borrower => {
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
    const needScore = Math.max(0, 45 - stability) + Math.max(0, crisisRisk - 30);
    
    if (needScore < 15) return;  // Not enough need
    
    const applyChance = clamp(0.05 + needScore * 0.008, 0.03, 0.25);
    if (Math.random() > applyChance) return;
    
    // Determine loan amount based on need and credit rating
    const loanAmount = clamp(
      borrower.gdp * 0.02 * (rating.score / 50),
      0.05,
      3.0
    );
    
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
  const fairAmount = clamp(nation.gdp * 0.02 * (rating.score / 50), 0.05, 3.0);
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
  const fairAmount = clamp(borrower.gdp * 0.02 * (rating.score / 50), 0.05, 3.0);
  
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
  const potentialLenders = Object.values(NATIONS).filter(nation => {
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
  
  // Score and select lenders
  const scored = potentialLenders.map(lender => {
    const rel = typeof getRelationBetween === 'function' ? getRelationBetween(borrower.id, lender.id) : 0;
    const gdp = Number(lender.gdp || 0.2);
    const votingPower = wb.votingPower[lender.id] || 0;
    const score = gdp * 50 + votingPower * 2 + Math.max(0, rel) * 3;
    return { lender, score };
  }).sort((a, b) => b.score - a.score);
  
  const lenderCount = clamp(2 + Math.floor(proposal.requestedAmount), 2, 6);
  const selectedLenders = scored.slice(0, Math.min(lenderCount, scored.length));
  
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
      nationId: ls.lender.id,
      share: ls.share,
      amount: ls.amount,
      received: 0,
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
  });
  
  if (borrower.id === GAME.playerNation.id) {
    GAME.treasury += proposal.requestedAmount * 1000;
  } else {
    borrower.treasury = (borrower.treasury || 0) + proposal.requestedAmount * 1000;
  }
  
  borrower.gdp = clamp(borrower.gdp + proposal.requestedAmount * 0.05, 0.05, 100);
  borrower.stability = clamp(borrower.stability + proposal.requestedAmount * 3, 1, 100);
  borrower.crisisRisk = clamp(borrower.crisisRisk - proposal.requestedAmount * 5, 0, 100);
  borrower.debtRatio = clamp(borrower.debtRatio + proposal.requestedAmount * 8, 8, 260);
  
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
    const monthlyPaymentM = loan.monthlyPayment * 1000;  // Convert to millions
    
    // Check if borrower can afford payment
    const borrowerTreasury = borrower.id === GAME.playerNation.id ? GAME.treasury : (borrower.treasury || 0);
    const affordablePayment = Math.min(monthlyPaymentM, borrowerTreasury * 0.3);
    
    if (affordablePayment > 1) {
      // Make payment
      if (borrower.id === GAME.playerNation.id) {
        GAME.treasury -= affordablePayment;
      } else {
        borrower.treasury = (borrower.treasury || 0) - affordablePayment;
      }
      
      // Distribute to lenders proportionally
      loan.lenders.forEach(lender => {
        const lenderNation = NATIONS[lender.nationId];
        if (!lenderNation) return;
        
        const paymentShare = affordablePayment * lender.share;
        lender.received += paymentShare;
        
        if (lenderNation.id === GAME.playerNation.id) {
          GAME.treasury += paymentShare;
        } else {
          lenderNation.treasury = (lenderNation.treasury || 0) + paymentShare;
          lenderNation.gdp = clamp(lenderNation.gdp + paymentShare / 1000 * 0.005, 0.05, 100);
        }
      });
      
      loan.totalRepaid += affordablePayment / 1000;  // Convert back to billions
      loan.remainingMonths -= 1;
      loan.missedPayments = 0;
      loan.status = 'active';
      
      // Borrower benefits from good repayment
      borrower.stability = clamp(borrower.stability + 0.5, 1, 100);
      borrower.debtRatio = clamp(borrower.debtRatio - 0.5, 8, 260);
      
      // Log payment transaction
      addWorldBankTransaction('payment', loan.id, borrower.id, affordablePayment,
        `${borrower.flag} ${borrower.name} paid $${affordablePayment.toFixed(0)}M monthly payment on $${(loan.amount * 1000).toFixed(0)}M loan`);
    } else {
      // Missed payment
      loan.missedPayments += 1;
      loan.status = 'delinquent';
      
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
      
      const lenderNames = loan.lenders.map(l => `${NATIONS[l.nationId]?.name || l.nationId}`).join(', ');
      if (typeof addNews === 'function') {
        addNews(`✅ ${borrower.flag} ${borrower.name} completes $${(loan.amount * 1000).toFixed(0)}M World Bank loan repayment to ${lenderNames}.`, 'minor');
      }
      
      // Log completion
      addWorldBankTransaction('loan_completed', loan.id, borrower.id, loan.totalRepaid * 1000,
        `${borrower.flag} ${borrower.name} fully repaid $${(loan.amount * 1000).toFixed(0)}M loan. Total paid: $${(loan.totalRepaid * 1000).toFixed(0)}M`);
      return;
    }
    
    // Check for default
    if (loan.missedPayments >= 3 || currentTurn >= loan.dueTurn) {
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
  
  const lenderNames = loan.lenders.map(l => `${NATIONS[l.nationId]?.flag || '🏳️'} ${NATIONS[l.nationId]?.name || l.nationId}`).join(', ');
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
    const lenderNation = NATIONS[lender.nationId];
    if (!lenderNation) return;
    
    // Direct treasury transfer
    const transferAmount = collateral.value * lender.share * 100;  // In millions
    if (lenderNation.id === GAME.playerNation.id) {
      GAME.treasury += transferAmount;
    } else {
      lenderNation.treasury = (lenderNation.treasury || 0) + transferAmount;
    }
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
    if (nation.failedState) return;
    
    const stability = Number(nation.stability || 50);
    const crisisRisk = Number(nation.crisisRisk || 20);
    
    // Only nations in severe crisis qualify
    if (stability > 25 || crisisRisk < 70) return;
    
    // Check if already in bailout
    const existingBailout = wb.bailouts.find(b => 
      b.nationId === nation.id && b.status === 'active'
    );
    if (existingBailout) return;
    
    // Check if has defaulted loans
    const defaultedLoans = wb.loans.filter(l => 
      l.borrowerId === nation.id && l.status === 'defaulted'
    );
    if (defaultedLoans.length === 0) return;
    
    // Bailout chance
    const bailoutChance = clamp(0.1 + (100 - crisisRisk) * 0.005, 0.05, 0.35);
    if (Math.random() > bailoutChance) return;
    
    // Calculate bailout amount
    const totalDebt = defaultedLoans.reduce((sum, l) => sum + l.amount, 0);
    const bailoutAmount = totalDebt * 0.8;  // 80% of defaulted debt
    
    // Find bailout contributors (superpowers)
    const contributors = Object.values(NATIONS)
      .filter(n => !n.failedState && n.id !== nation.id && n.gdp > 1.0)
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
      },
    };
    
    wb.bailouts.push(bailout);
    
    // Pay off defaulted loans
    defaultedLoans.forEach(loan => {
      loan.status = 'settled-via-bailout';
      loan.lenders.forEach(lender => {
        const lenderNation = NATIONS[lender.nationId];
        if (!lenderNation) return;
        
        const recoveryAmount = loan.amount * lender.share * 0.8;
        if (lenderNation.id === GAME.playerNation.id) {
          GAME.treasury += recoveryAmount * 1000;
        } else {
          lenderNation.treasury = (lenderNation.treasury || 0) + recoveryAmount * 1000;
        }
      });
    });
    
    // Bailout impact on borrower
    nation.stability = clamp(nation.stability + 15, 1, 100);
    nation.crisisRisk = clamp(nation.crisisRisk - 20, 0, 100);
    nation.governance = clamp(nation.governance - 10, 1, 100);  // Sovereignty loss
    nation.gdp = clamp(nation.gdp + bailoutAmount * 0.03, 0.05, 100);
    
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
    });
    
    const contributorNames = bailout.contributors.map(c => `${NATIONS[c.nationId]?.flag || '🏳️'} ${NATIONS[c.nationId]?.name || c.nationId}`).join(', ');
    if (typeof addNews === 'function') {
      addNews(`🆘 IMF Bailout: ${nation.flag} ${nation.name} receives $${(bailoutAmount * 1000).toFixed(0)}M bailout from ${contributorNames}. Austerity measures imposed.`, 'major');
    }
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
window._wbView = 'overview';  // 'overview', 'transactions', 'active', 'closed', 'nation', 'loan', 'proposals', 'apply_loan'
window._wbSelectedNation = null;
window._wbSelectedLoan = null;

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
    case 'nation':
      html += renderWbNationDetail(window._wbSelectedNation, nationLoanSummaries);
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

  return html;
}

function renderWbTransactions(wb) {
  if (wb.transactions.length === 0) {
    return `<div class="tab-section"><h3>📋 Transaction History</h3><p class="text-muted">No transactions yet.</p></div>`;
  }

  let html = `<div class="tab-section"><h3>📋 Transaction History (${wb.transactions.length})</h3>`;
  
  // Filter buttons
  html += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">`;
  ['all', 'loan_issued', 'payment', 'loan_completed', 'default', 'collateral_seized', 'bailout', 'contribution'].forEach(type => {
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
    const lenderNames = loan.lenders.map(l => `${NATIONS[l.nationId]?.flag || '🏳️'} ${NATIONS[l.nationId]?.name || l.nationId}`).join(', ');
    
    html += `
      <div class="wb-loan-card" onclick="window._wbView='loan'; window._wbSelectedLoan='${loan.id}'; refreshRealtimeTabs();" style="cursor:pointer">
        <div class="wb-loan-header">
          <span class="wb-loan-borrower">${borrower ? borrower.flag : '🏳️'} ${borrower ? borrower.name : loan.borrowerId}</span>
          <span class="wb-loan-status" style="color:${statusColor}">${loan.status.toUpperCase()}</span>
        </div>
        <div class="wb-loan-amount">$${(loan.amount * 1000).toFixed(0)}M</div>
        <div class="wb-loan-terms">${loan.interestRate.toFixed(1)}% · ${loan.remainingMonths} months left · ${loan.termMonths} month term</div>
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
  const lenderNames = loan.lenders.map(l => `${NATIONS[l.nationId]?.flag || '🏳️'} ${NATIONS[l.nationId]?.name || l.nationId}`).join(', ');
  
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
    const lenderNation = NATIONS[lender.nationId];
    const profit = lender.received - lender.amount;
    const profitColor = profit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    html += `
      <div class="wb-lender-row">
        <span class="wb-lender-flag">${lenderNation ? lenderNation.flag : '🏳️'}</span>
        <span class="wb-lender-name">${lenderNation ? lenderNation.name : lender.nationId}</span>
        <span class="wb-lender-share">${(lender.share * 100).toFixed(1)}%</span>
        <span class="wb-lender-amount">$${(lender.amount * 1000).toFixed(0)}M</span>
        <span class="wb-lender-received">$${(lender.received * 1000).toFixed(0)}M</span>
        <span class="wb-lender-profit" style="color:${profitColor}">${profit >= 0 ? '+' : ''}$${(profit * 1000).toFixed(0)}M</span>
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
      const lenderSummary = summaries[lender.nationId];
      if (lenderSummary) {
        lenderSummary.totalLent += lender.amount;
        lenderSummary.collateralCollected += (lender.received - lender.amount) > 0 ? (lender.received - lender.amount) : 0;
      }
    });
  });
  
  // Calculate interest
  Object.values(summaries).forEach(s => {
    s.totalInterest = Math.max(0, s.totalRepaid - s.totalBorrowed);
  });
  
  return Object.values(summaries);
}

function getTransactionIcon(type) {
  switch (type) {
    case 'loan_issued': return '📥';
    case 'payment': return '💰';
    case 'loan_completed': return '✅';
    case 'default': return '🚨';
    case 'collateral_seized': return '🔒';
    case 'bailout': return '🆘';
    case 'contribution': return '🏦';
    default: return '📋';
  }
}

function getTransactionColor(type) {
  switch (type) {
    case 'loan_issued': return 'var(--accent-blue)';
    case 'payment': return 'var(--accent-green)';
    case 'loan_completed': return 'var(--accent-green)';
    case 'default': return 'var(--accent-red)';
    case 'collateral_seized': return 'var(--accent-yellow)';
    case 'bailout': return 'var(--accent-yellow)';
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
    if (n.failedState || n.id === player.id) return false;
    return n.stability < 30 && n.crisisRisk > 60;
  });
  
  if (crisisNations.length === 0) {
    addNews('🏦 No nations currently qualify for bailout.', 'minor');
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
