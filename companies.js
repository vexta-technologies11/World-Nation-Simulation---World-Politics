// ============================================================
// COMPANY PRODUCT ENGINE — Product lines, supply chains, R&D
// ============================================================

const PRODUCT_ENGINE_CATALOG = [
  {
    id: 'fertilizer',
    label: 'Fertilizer',
    sector: 'agriculture',
    kind: 'material',
    minTechTier: 1,
    educationNeed: 28,
    baseDemand: 0.85,
    valueShare: 0.80,
    researchWeight: 0.70,
    inputs: [{ type: 'resource', id: 'oil', intensity: 0.18 }, { type: 'resource', id: 'minerals', intensity: 0.22 }],
  },
  {
    id: 'packaged_food',
    label: 'Packaged Food',
    sector: 'agriculture',
    kind: 'consumer',
    minTechTier: 1,
    educationNeed: 24,
    baseDemand: 1.25,
    valueShare: 1.00,
    researchWeight: 0.55,
    inputs: [{ type: 'resource', id: 'fertileLand', intensity: 0.32 }, { type: 'product', id: 'fertilizer', intensity: 0.18 }],
  },
  {
    id: 'steel',
    label: 'Steel',
    sector: 'manufacturing',
    kind: 'material',
    minTechTier: 1,
    educationNeed: 30,
    baseDemand: 0.95,
    valueShare: 0.90,
    researchWeight: 0.75,
    inputs: [{ type: 'resource', id: 'minerals', intensity: 0.34 }, { type: 'resource', id: 'oil', intensity: 0.12 }],
  },
  {
    id: 'industrial_machinery',
    label: 'Industrial Machinery',
    sector: 'manufacturing',
    kind: 'material',
    minTechTier: 2,
    educationNeed: 38,
    baseDemand: 0.88,
    valueShare: 1.08,
    researchWeight: 0.95,
    inputs: [{ type: 'product', id: 'steel', intensity: 0.28 }, { type: 'product', id: 'chips', intensity: 0.08 }],
  },
  {
    id: 'refined_fuel',
    label: 'Refined Fuel',
    sector: 'energy',
    kind: 'material',
    minTechTier: 1,
    educationNeed: 26,
    baseDemand: 1.10,
    valueShare: 1.00,
    researchWeight: 0.65,
    inputs: [{ type: 'resource', id: 'oil', intensity: 0.42 }],
  },
  {
    id: 'power_systems',
    label: 'Grid Power Systems',
    sector: 'energy',
    kind: 'industrial',
    minTechTier: 3,
    educationNeed: 42,
    baseDemand: 0.92,
    valueShare: 1.20,
    researchWeight: 1.05,
    inputs: [{ type: 'product', id: 'steel', intensity: 0.18 }, { type: 'product', id: 'chips', intensity: 0.10 }, { type: 'resource', id: 'rareEarth', intensity: 0.12 }],
  },
  {
    id: 'chips',
    label: 'Semiconductors',
    sector: 'technology',
    kind: 'material',
    minTechTier: 2,
    educationNeed: 58,
    baseDemand: 1.05,
    valueShare: 1.32,
    researchWeight: 1.30,
    inputs: [{ type: 'resource', id: 'rareEarth', intensity: 0.34 }, { type: 'product', id: 'industrial_machinery', intensity: 0.08 }],
  },
  {
    id: 'battery_cells',
    label: 'Battery Cells',
    sector: 'technology',
    kind: 'material',
    minTechTier: 2,
    educationNeed: 48,
    baseDemand: 0.98,
    valueShare: 1.08,
    researchWeight: 1.10,
    inputs: [{ type: 'resource', id: 'rareEarth', intensity: 0.22 }, { type: 'resource', id: 'minerals', intensity: 0.18 }],
  },
  {
    id: 'smartphones',
    label: 'Smartphones',
    sector: 'technology',
    kind: 'consumer',
    minTechTier: 1,
    educationNeed: 52,
    baseDemand: 1.40,
    valueShare: 1.45,
    researchWeight: 1.45,
    inputs: [{ type: 'product', id: 'chips', intensity: 0.18 }, { type: 'product', id: 'battery_cells', intensity: 0.14 }, { type: 'resource', id: 'rareEarth', intensity: 0.14 }],
  },
  {
    id: 'cloud_platforms',
    label: 'Cloud Platforms',
    sector: 'technology',
    kind: 'service',
    minTechTier: 4,
    educationNeed: 64,
    baseDemand: 1.15,
    valueShare: 1.55,
    researchWeight: 1.60,
    inputs: [{ type: 'product', id: 'chips', intensity: 0.12 }, { type: 'product', id: 'power_systems', intensity: 0.08 }],
  },
  {
    id: 'digital_banking',
    label: 'Digital Banking',
    sector: 'services',
    kind: 'service',
    minTechTier: 2,
    educationNeed: 46,
    baseDemand: 1.05,
    valueShare: 1.18,
    researchWeight: 1.00,
    inputs: [{ type: 'product', id: 'cloud_platforms', intensity: 0.08 }, { type: 'product', id: 'smartphones', intensity: 0.06 }],
  },
  {
    id: 'tourism_networks',
    label: 'Tourism Networks',
    sector: 'tourism',
    kind: 'service',
    minTechTier: 1,
    educationNeed: 30,
    baseDemand: 0.78,
    valueShare: 0.95,
    researchWeight: 0.70,
    inputs: [{ type: 'product', id: 'refined_fuel', intensity: 0.10 }, { type: 'product', id: 'digital_banking', intensity: 0.05 }],
  },
];

const COMPANY_PRODUCT_NAMES = {
  smartphones: ['Phone 1', 'Phone 2', 'Phone 3', 'Phone 4', 'Phone 5', 'Phone 6', 'Phone 7', 'Phone 8', 'Phone 9', 'Phone X'],
  cloud_platforms: ['Cloud Core I', 'Cloud Core II', 'Cloud Core III', 'Cloud Core IV', 'Cloud Core V', 'Cloud Core VI', 'Cloud Core VII', 'Cloud Core VIII', 'Cloud Core IX', 'Cloud Core X'],
  chips: ['Chipset 1', 'Chipset 2', 'Chipset 3', 'Chipset 4', 'Chipset 5', 'Chipset 6', 'Chipset 7', 'Chipset 8', 'Chipset 9', 'Chipset X'],
  battery_cells: ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5', 'Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell X'],
  power_systems: ['Grid 1', 'Grid 2', 'Grid 3', 'Grid 4', 'Grid 5', 'Grid 6', 'Grid 7', 'Grid 8', 'Grid 9', 'Grid X'],
  steel: ['Alloy 1', 'Alloy 2', 'Alloy 3', 'Alloy 4', 'Alloy 5', 'Alloy 6', 'Alloy 7', 'Alloy 8', 'Alloy 9', 'Alloy X'],
  industrial_machinery: ['Machine 1', 'Machine 2', 'Machine 3', 'Machine 4', 'Machine 5', 'Machine 6', 'Machine 7', 'Machine 8', 'Machine 9', 'Machine X'],
  packaged_food: ['Food Line 1', 'Food Line 2', 'Food Line 3', 'Food Line 4', 'Food Line 5', 'Food Line 6', 'Food Line 7', 'Food Line 8', 'Food Line 9', 'Food Line X'],
  fertilizer: ['Agri Mix 1', 'Agri Mix 2', 'Agri Mix 3', 'Agri Mix 4', 'Agri Mix 5', 'Agri Mix 6', 'Agri Mix 7', 'Agri Mix 8', 'Agri Mix 9', 'Agri Mix X'],
  refined_fuel: ['Fuel Blend 1', 'Fuel Blend 2', 'Fuel Blend 3', 'Fuel Blend 4', 'Fuel Blend 5', 'Fuel Blend 6', 'Fuel Blend 7', 'Fuel Blend 8', 'Fuel Blend 9', 'Fuel Blend X'],
  digital_banking: ['Wallet 1', 'Wallet 2', 'Wallet 3', 'Wallet 4', 'Wallet 5', 'Wallet 6', 'Wallet 7', 'Wallet 8', 'Wallet 9', 'Wallet X'],
  tourism_networks: ['Travel Net 1', 'Travel Net 2', 'Travel Net 3', 'Travel Net 4', 'Travel Net 5', 'Travel Net 6', 'Travel Net 7', 'Travel Net 8', 'Travel Net 9', 'Travel Net X'],
};

function getProductDef(productId) {
  return PRODUCT_ENGINE_CATALOG.find(product => product.id === productId) || null;
}

function getProductsForSector(sectorId) {
  return PRODUCT_ENGINE_CATALOG.filter(product => product.sector === sectorId);
}

function getCountryInnovationScore(nation) {
  return clamp(
    ((Number(nation.education || 0) * 0.45) + (Number(nation.governance || 0) * 0.2) + (Number(nation.techLevel || 0) * 12) + (Number(nation.innovationRisk ? 100 - nation.innovationRisk : 55) * 0.15)) / 100,
    0.35,
    1.8
  );
}

function getBrandKnowledgeLevel(company, productId) {
  if (typeof getCompanyBrandKey !== 'function') return 0;
  const brandKey = getCompanyBrandKey(company);
  let best = 0;
  Object.values(NATIONS || {}).forEach(nation => {
    (nation?.companies || []).forEach(candidate => {
      if (getCompanyBrandKey(candidate) !== brandKey) return;
      const line = (candidate.productLines || []).find(item => item.productId === productId);
      if (line) best = Math.max(best, Number(line.techLevel || 0));
    });
  });
  return best;
}

function initCompanyProductState(company) {
  if (!Array.isArray(company.productLines)) company.productLines = [];
  if (!company.productResearch) company.productResearch = {};
  if (!company.productMetrics) {
    company.productMetrics = {
      inputCost: 0,
      importCost: 0,
      bottleneck: 0,
      productRevenue: 0,
      researchSpend: 0,
    };
  }
}

function chooseCompanyProductLines(nation, company) {
  initCompanyProductState(company);
  const sectorProducts = getProductsForSector(company.sector);
  if (sectorProducts.length === 0) return;

  const education = Number(nation.education || 0);
  const unlockedTier = Math.max(1, Number(company.techTier || 1));
  const desiredSlots = clamp(company.size === 'corporation' ? 3 : company.size === 'large' ? 2 : 1, 1, 3);
  const scored = sectorProducts
    .map(product => {
      const educationFit = clamp((education - product.educationNeed) / 30 + 1, 0.35, 1.6);
      const tierFit = clamp((unlockedTier - product.minTechTier) * 0.25 + 1, 0.2, 1.8);
      return { product, score: product.baseDemand * educationFit * tierFit * (product.kind === 'material' ? 1.05 : 1.0) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, desiredSlots);

  const existing = {};
  company.productLines.forEach(line => { existing[line.productId] = line; });
  company.productLines = scored.map(item => {
    const current = existing[item.product.id];
    if (current) return current;
    const seedTech = Math.max(item.product.minTechTier, Math.min(unlockedTier, Math.max(1, getBrandKnowledgeLevel(company, item.product.id) - 1 || 1)));
    return {
      productId: item.product.id,
      techLevel: seedTech,
      progress: 0,
      monthlyDemand: 0,
      monthlySupply: 0,
      demandServed: 0,
      inputCoverage: 1,
      competitionScore: 1,
      imports: [],
      displayName: '',
    };
  });
}

function getGlobalResourceSuppliers(resourceId, buyerNationId) {
  const suppliers = [];
  Object.values(NATIONS || {}).forEach(nation => {
    if (!nation || nation.id === buyerNationId || nation.failedState) return;
    const res = nation.resourceData?.[resourceId];
    if (!res) return;
    const surplus = Math.max(0, Number(res.level || 0) - 45) + Math.max(0, Number(res.produced || 0) - Number(res.consumed || 0));
    if (surplus <= 0) return;
    suppliers.push({ nation, strength: surplus });
  });
  return suppliers.sort((a, b) => b.strength - a.strength).slice(0, 3);
}

function getGlobalProductSuppliers(productId, buyerCompanyId) {
  const suppliers = [];
  Object.values(NATIONS || {}).forEach(nation => {
    if (!nation || nation.failedState) return;
    (nation.companies || []).forEach(company => {
      if (company.id === buyerCompanyId) return;
      const line = (company.productLines || []).find(item => item.productId === productId);
      if (!line) return;
      suppliers.push({
        nation,
        company,
        strength: Math.max(0.1, Number(line.techLevel || 1) * 0.7 + Number(line.monthlySupply || 0) * 0.2 + Number(company.revenue || 0) * 0.03),
      });
    });
  });
  return suppliers.sort((a, b) => b.strength - a.strength).slice(0, 4);
}

function evaluateInputCoverage(nation, company, line, productDef) {
  const imports = [];
  let coverage = 1;
  let importCost = 0;
  let inputCost = 0;

  productDef.inputs.forEach(input => {
    if (input.type === 'resource') {
      const localLevel = Number(nation.resourceData?.[input.id]?.level || 0);
      const localCoverage = clamp(localLevel / (45 + input.intensity * 55), 0.15, 1);
      let totalCoverage = localCoverage;
      inputCost += input.intensity * 0.16;
      if (totalCoverage < 0.92) {
        const suppliers = getGlobalResourceSuppliers(input.id, nation.id);
        const importCoverage = clamp(suppliers.reduce((sum, supplier) => sum + supplier.strength, 0) / 220, 0, 1 - totalCoverage);
        if (importCoverage > 0) {
          const leader = suppliers[0];
          imports.push({
            type: 'resource',
            id: input.id,
            from: leader?.nation?.name || 'global market',
            coverage: importCoverage,
          });
          importCost += input.intensity * 0.28 * (1 + Math.max(0, 0.9 - localCoverage));
          totalCoverage += importCoverage;
        }
      }
      coverage *= clamp(totalCoverage, 0.2, 1);
      return;
    }

    if (input.type === 'product') {
      const localSuppliers = (nation.companies || []).filter(candidate => candidate.id !== company.id && (candidate.productLines || []).some(item => item.productId === input.id));
      const localStrength = localSuppliers.reduce((sum, candidate) => {
        const supplierLine = candidate.productLines.find(item => item.productId === input.id);
        return sum + Math.max(0.1, Number(supplierLine?.techLevel || 1) * 0.18 + Number(candidate.revenue || 0) * 0.02);
      }, 0);
      let totalCoverage = clamp(localStrength / 18, 0, 1);
      inputCost += input.intensity * 0.14;
      if (totalCoverage < 0.95) {
        const suppliers = getGlobalProductSuppliers(input.id, company.id);
        const importCoverage = clamp(suppliers.reduce((sum, supplier) => sum + supplier.strength, 0) / 26, 0, 1 - totalCoverage);
        if (importCoverage > 0) {
          const leader = suppliers[0];
          imports.push({
            type: 'product',
            id: input.id,
            from: leader ? ((leader.nation.flag || '🏳️') + ' ' + (typeof getCompanyDisplayName === 'function' ? getCompanyDisplayName(leader.company) : (leader.company.name || 'Supplier'))) : 'global market',
            coverage: importCoverage,
          });
          importCost += input.intensity * 0.24;
          totalCoverage += importCoverage;
        }
      }
      coverage *= clamp(totalCoverage, 0.12, 1);
    }
  });

  line.imports = imports;
  return {
    coverage: clamp(coverage, 0.08, 1),
    importCost,
    inputCost,
  };
}

function scoreProductCompetition(nation, company, line, productDef) {
  const competitors = [];
  Object.values(NATIONS || {}).forEach(otherNation => {
    if (!otherNation || otherNation.failedState) return;
    (otherNation.companies || []).forEach(otherCompany => {
      if (otherCompany.id === company.id) return;
      const otherLine = (otherCompany.productLines || []).find(item => item.productId === line.productId);
      if (!otherLine) return;
      const quality = Number(otherLine.techLevel || 1) * 1.5 + Number(otherCompany.moat || 1) + Math.max(0, Number(otherCompany.profitMargin || 0) * 4);
      competitors.push({ nation: otherNation, company: otherCompany, quality });
    });
  });

  const myQuality = Number(line.techLevel || 1) * 1.7 + Number(company.moat || 1) + Math.max(0, Number(company.profitMargin || 0) * 4) + clamp((Number(nation.education || 0) - productDef.educationNeed) * 0.02, -0.4, 1.2);
  const totalQuality = competitors.reduce((sum, item) => sum + item.quality, 0) + myQuality;
  const share = clamp(myQuality / Math.max(1, totalQuality), 0.04, 0.75);
  const marketCapture = clamp(0.72 + share * 1.05, 0.72, 1.32);
  return {
    share,
    marketCapture,
    pressure: clamp(1 - share * 1.6, 0.2, 1.1),
    rivalCount: competitors.length,
  };
}

function updateCompanyProductResearch(nation, company, line, productDef) {
  const innovationScore = getCountryInnovationScore(nation);
  const brandKnowledge = getBrandKnowledgeLevel(company, line.productId);
  const targetTech = clamp(Math.min(Number(company.techTier || 1), Math.max(productDef.minTechTier, brandKnowledge || productDef.minTechTier)), productDef.minTechTier, 10);
  const desiredTech = Math.max(targetTech, Math.min(10, Number(company.techTier || 1) + (Number(nation.education || 0) >= productDef.educationNeed ? 1 : 0)));
  const currentTech = Math.max(productDef.minTechTier, Number(line.techLevel || productDef.minTechTier));
  const productGap = Math.max(0, desiredTech - currentTech);
  const baseResearchSpend = Math.max(0, Number(company.revenue || 0) * (0.018 + productDef.researchWeight * 0.008));
  const catchUpSpend = baseResearchSpend * clamp(productGap * 0.55, 0, 1.6);
  const researchSpend = baseResearchSpend + catchUpSpend;
  const progressGain = researchSpend * innovationScore * clamp((Number(nation.education || 0) / Math.max(30, productDef.educationNeed)) * 0.9, 0.3, 1.9);
  line.progress = Number(line.progress || 0) + progressGain;
  const requirement = 24 + currentTech * currentTech * (1.8 + productDef.researchWeight * 0.9);
  if (currentTech < desiredTech && line.progress >= requirement) {
    line.techLevel = currentTech + 1;
    line.progress = Math.max(0, line.progress - requirement);
  }
  return researchSpend;
}

function generateProductDisplayName(company, productId, techLevel) {
  const names = COMPANY_PRODUCT_NAMES[productId] || [];
  const base = names[Math.max(0, Math.min(9, Math.floor(techLevel) - 1))] || (getProductDef(productId)?.label || productId);
  const brand = typeof getCompanyBaseName === 'function' ? getCompanyBaseName(company) : (company.baseName || company.name || 'Brand');
  return brand + ' ' + base;
}

function processCompanyProductEngine(nation) {
  if (!nation || !Array.isArray(nation.companies)) return;
  const innovationScore = getCountryInnovationScore(nation);
  nation.productEconomy = nation.productEconomy || { imports: [], exports: [], productDemand: {}, productSupply: {} };
  nation.productEconomy.imports = [];
  nation.productEconomy.exports = [];
  nation.productEconomy.productDemand = {};
  nation.productEconomy.productSupply = {};

  nation.companies.forEach(company => {
    initCompanyProductState(company);
    chooseCompanyProductLines(nation, company);
    if (company.productLines.length === 0) return;
    const baselineRevenue = Math.max(0.05, Number(company.revenue || 0));

    let adjustedRevenue = 0;
    let totalResearchSpend = 0;
    let totalInputCost = 0;
    let totalImportCost = 0;
    let maxBottleneck = 0;

    company.productLines.forEach(line => {
      const productDef = getProductDef(line.productId);
      if (!productDef) return;
      const inputResult = evaluateInputCoverage(nation, company, line, productDef);
      const competition = scoreProductCompetition(nation, company, line, productDef);
      const researchSpend = updateCompanyProductResearch(nation, company, line, productDef);
      const educationFit = clamp((Number(nation.education || 0) - productDef.educationNeed) / 35 + 1, 0.4, 1.8);
      const demandPulse = clamp((Number(nation.marketDynamics?.sectorDemand?.[company.sector] || 100) / 100) * productDef.baseDemand, 0.55, 2.1);
      const brandNetworkBoost = clamp(1 + getBrandKnowledgeLevel(company, line.productId) * 0.025, 1, 1.35);
      const lineRevenueBase = baselineRevenue * productDef.valueShare / Math.max(1, company.productLines.length);
      const realizedRevenue = lineRevenueBase * demandPulse * educationFit * inputResult.coverage * competition.marketCapture * brandNetworkBoost * innovationScore;

      line.monthlyDemand = lineRevenueBase * demandPulse;
      line.monthlySupply = realizedRevenue;
      line.demandServed = clamp(realizedRevenue / Math.max(0.1, line.monthlyDemand), 0.05, 1.2);
      line.inputCoverage = inputResult.coverage;
      line.competitionScore = competition.share;
      line.displayName = generateProductDisplayName(company, line.productId, line.techLevel);

      adjustedRevenue += realizedRevenue;
      totalResearchSpend += researchSpend;
      totalInputCost += inputResult.inputCost * lineRevenueBase;
      totalImportCost += inputResult.importCost * lineRevenueBase;
      maxBottleneck = Math.max(maxBottleneck, 1 - inputResult.coverage);

      nation.productEconomy.productDemand[line.productId] = (nation.productEconomy.productDemand[line.productId] || 0) + line.monthlyDemand;
      nation.productEconomy.productSupply[line.productId] = (nation.productEconomy.productSupply[line.productId] || 0) + line.monthlySupply;
      line.imports.forEach(item => {
        nation.productEconomy.imports.push({ companyId: company.id, companyName: typeof getCompanyDisplayName === 'function' ? getCompanyDisplayName(company) : (company.name || 'Company'), productId: line.productId, ...item });
      });
    });

    company.productMetrics = {
      inputCost: totalInputCost,
      importCost: totalImportCost,
      bottleneck: maxBottleneck,
      productRevenue: adjustedRevenue,
      researchSpend: totalResearchSpend,
    };

    if (adjustedRevenue > 0) {
      const blendedRevenue = baselineRevenue * 0.58 + adjustedRevenue * 0.42;
      company.revenue = clamp(blendedRevenue, 0.05, Math.max(40, Number(nation.gdp || 0.1) * 1_000_000 / 12 * 0.16));
    }

    const marginHit = (totalImportCost / Math.max(1, company.revenue || 1)) + (totalResearchSpend / Math.max(1, company.revenue || 1)) * 0.55;
    company.profitMargin = clamp(Number(company.profitMargin || 0.08) - marginHit, 0.02, 0.45);
    company.growthRate = clamp(Number(company.growthRate || 0) + (innovationScore - 1) * 0.004 - maxBottleneck * 0.02 + (company.productLines.reduce((sum, line) => sum + (Number(line.techLevel || 1) - 1), 0) / Math.max(1, company.productLines.length)) * 0.002, -0.08, 0.09);
    company.primaryProduct = company.productLines.slice().sort((a, b) => Number(b.monthlySupply || 0) - Number(a.monthlySupply || 0))[0]?.productId || null;
    if (typeof estimateCompanyWorth === 'function') {
      company.worth = estimateCompanyWorth(company);
    }
    if (company.public && typeof estimateFairStockPrice === 'function' && (!company.stockPrice || company.stockPrice <= 0)) {
      company.stockPrice = estimateFairStockPrice(company);
    }
    if (company.public) {
      const shares = Math.max(1, Number(company.sharesOutstanding || 1));
      company.marketCap = Math.max(0.01, Number(company.stockPrice || 0.1) * shares / 1_000_000);
    }
  });
}

function getCompanyCompetitionSnapshot(nation, company) {
  if (!nation || !company) return { productId: null, rivals: [], overallScore: 0, trajectory: 0 };
  const primaryProductId = company.primaryProduct || company.productLines?.[0]?.productId || null;
  const ownLine = (company.productLines || []).find(line => line.productId === primaryProductId) || company.productLines?.[0] || null;
  const ownInnovation = Number(ownLine?.techLevel || company.techTier || 1) * 12 + Number(company.productMetrics?.researchSpend || 0) * 0.6;
  const ownSupply = clamp((Number(ownLine?.inputCoverage || 1) * 100) - (Number(company.productMetrics?.bottleneck || 0) * 35), 5, 100);
  const ownStock = company.public ? Number(company.stockPrice || 0) : 0;
  const ownRevenue = Number(company.revenue || 0);
  const ownTrajectory = clamp(Number(company.growthRate || 0) * 100 + Number(company.stockChangePct || 0) * 0.35 + (Number(company.techTier || 1) - 1) * 1.5 - Number(company.productMetrics?.bottleneck || 0) * 18, -25, 25);
  const ownOverall = clamp(ownRevenue * 0.18 + ownInnovation * 0.45 + ownSupply * 0.6 + ownStock * 0.14 + Math.max(0, ownTrajectory) * 0.5, 1, 9999);

  const rivals = [];
  Object.values(NATIONS || {}).forEach(otherNation => {
    if (!otherNation || otherNation.failedState) return;
    (otherNation.companies || []).forEach(otherCompany => {
      if (otherCompany.id === company.id) return;
      const comparable = (otherCompany.productLines || []).find(line => line.productId === primaryProductId) || (!primaryProductId && otherCompany.sector === company.sector ? otherCompany.productLines?.[0] : null);
      if (!comparable && otherCompany.sector !== company.sector) return;

      const innovation = Number(comparable?.techLevel || otherCompany.techTier || 1) * 12 + Number(otherCompany.productMetrics?.researchSpend || 0) * 0.6;
      const supply = clamp((Number(comparable?.inputCoverage || 1) * 100) - (Number(otherCompany.productMetrics?.bottleneck || 0) * 35), 5, 100);
      const stock = otherCompany.public ? Number(otherCompany.stockPrice || 0) : 0;
      const revenue = Number(otherCompany.revenue || 0);
      const trajectory = clamp(Number(otherCompany.growthRate || 0) * 100 + Number(otherCompany.stockChangePct || 0) * 0.35 + (Number(otherCompany.techTier || 1) - 1) * 1.5 - Number(otherCompany.productMetrics?.bottleneck || 0) * 18, -25, 25);
      const overall = clamp(revenue * 0.18 + innovation * 0.45 + supply * 0.6 + stock * 0.14 + Math.max(0, trajectory) * 0.5, 1, 9999);

      rivals.push({
        nation: otherNation,
        company: otherCompany,
        productId: comparable?.productId || null,
        innovation,
        supply,
        stock,
        revenue,
        overall,
        trajectory,
        deltaStock: stock - ownStock,
        deltaRevenue: revenue - ownRevenue,
        deltaInnovation: innovation - ownInnovation,
        deltaSupply: supply - ownSupply,
        deltaOverall: overall - ownOverall,
        deltaTrajectory: trajectory - ownTrajectory,
      });
    });
  });

  rivals.sort((a, b) => Number(b.overall || 0) - Number(a.overall || 0));
  return {
    productId: primaryProductId,
    overallScore: ownOverall,
    trajectory: ownTrajectory,
    rivals: rivals.slice(0, 8),
  };
}

window.PRODUCT_ENGINE_CATALOG = PRODUCT_ENGINE_CATALOG;
window.getProductDef = getProductDef;
window.processCompanyProductEngine = processCompanyProductEngine;
window.getCompanyCompetitionSnapshot = getCompanyCompetitionSnapshot;