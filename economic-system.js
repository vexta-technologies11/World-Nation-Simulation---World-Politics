// ============================================================
// ECONOMIC SYSTEM — Taxes, Industries, Companies, Stock Market
// ============================================================
// Loaded BEFORE game.js, hooks into main loop via:
//   processAllEconomicSystems() — called every turn
//   renderEconomyTab() — replaces game.js version

// ─── 1,000 COMPANY NAMES ──────────────────────────────
// Organized by industry sector for realistic generation

const COMPANY_NAMES = {
  technology: [
    'NovaTech Solutions', 'Quantum Dynamics', 'Apex Digital Systems', 'Fusion Innovations',
    'Vertex Computing', 'Pulse Technologies', 'Orbit Software', 'Zenith Data Systems',
    'Crest Networks', 'Titan Microsystems', 'Echelon Analytics', 'Prism Logic Corp',
    'Stratum Digital', 'Vanguard Informatics', 'CoreByte Systems', 'Aether Technologies',
    'Dynamo Software', 'Helix Data Corp', 'NexGen Solutions', 'Sapphire Logic',
    'IronGate Computing', 'CloudPeak Systems', 'DataStream Corp', 'Meridian Tech',
    'Pioneer Digital Labs', 'Spectrum Innovations', 'TerraByte Solutions', 'UltraLogic Systems',
    'Axiom Software Inc', 'Brevity Technologies', 'Catalyst Data Corp', 'Dawn Computing',
    'Ember Technologies', 'Flux Software Labs', 'Gravity Digital', 'Horizon Tech Ventures',
    'Incline Systems', 'Junction Networks', 'Kinetic Software', 'Lumen Data Corp',
    'Matrix Innovations', 'Nimbus Technologies', 'OmniSoft Solutions', 'Photon Systems',
    'Ridge Analytics', 'Sentinel Data Corp', 'TrailBlazer Tech', 'Unity Digital Labs',
    'Vector Computing', 'Wavefront Software', 'Xenon Technologies', 'ZenithByte Systems',
    'AlphaCore Tech', 'BetaWave Digital', 'GammaSoft Solutions', 'Delta Computing',
    'Epsilon Analytics', 'Zeta Technologies', 'Eta Software Corp', 'Theta Systems',
    'Iota Innovations', 'Kappa Digital Labs', 'Lambda Tech Ventures', 'Mu Computing',
    'NuSoft Solutions', 'Xi Technologies', 'Omicron Data Corp', 'Pi Systems',
    'Rho Digital Labs', 'Sigma Tech Corp', 'Tau Innovations', 'Upsilon Software',
    'Phi Computing', 'Chi Technologies', 'Psi Digital', 'Omega Systems',
    'ArcSoft Technologies', 'Beacon Digital Corp', 'Cipher Solutions', 'Drift Software',
    'Echo Tech Labs', 'Forge Innovations', 'Gleam Computing', 'Hive Data Corp',
    'InnoTech Solutions', 'Jade Software Inc', 'Kite Digital Labs', 'Lynx Technologies',
    'Mosaic Systems', 'Nexus Digital Corp', 'Oak Software', 'Pivot Technologies',
    'Quest Innovations', 'Ripple Data Corp', 'Sage Computing', 'Trove Digital Labs',
    'Urban Tech Solutions', 'Vivid Software', 'Wing Technologies', 'Yonder Digital Corp',
    'Zest Innovations', 'Arcane Systems', 'BrightMind Technologies', 'Circuit Digital',
    'DeepCore Software', 'EdgeWave Technologies', 'FreeMind Solutions', 'GreenTech Innovations',
    'Hyperion Systems', 'IntelliSoft Corp', 'Jupiter Digital Labs', 'Kraken Technologies',
    'LightSpeed Software', 'MoonShot Innovations', 'NeuralPath Systems', 'OpenGate Digital',
    'PeakVision Tech', 'Quadrant Software', 'RapidFire Solutions', 'StarDust Technologies',
    'TechForge Inc', 'Unbound Digital', 'ValleyView Systems', 'WildFire Tech Labs',
    'Xenith Software', 'YellowBrick Technologies', 'ZeroPoint Digital', 'AstraLogic Corp',
    'BlueShift Technologies', 'Cosmic Software Solutions', 'DarkMatter Systems',
  ],
  manufacturing: [
    'Atlas Manufacturing', 'IronWorks Industries', 'SteelCraft Corp', 'Titan Forge Ltd',
    'Meridian Fabrication', 'Crestline Manufacturing', 'Summit Industrial Works', 'Peak Precision Parts',
    'Valley Forge Industries', 'Ridgeway Manufacturing', 'Apex Fabrication Co', 'Banner Industrial Supply',
    'Crown Manufacturing Corp', 'Diamond Tool & Die', 'Elite Fabrication Works', 'Fortress Industries',
    'Grand Manufacturing Co', 'Heritage Industrial Ltd', 'Imperial Forge Works', 'Jade Manufacturing Inc',
    'Keystone Fabrication', 'Liberty Industrial Corp', 'Majestic Manufacturing', 'Northern Precision Parts',
    'Oakland Industrial Supply', 'Pacific Manufacturing Co', 'Queensland Fabrication', 'Royal Industrial Works',
    'Sovereign Manufacturing', 'Triumph Fabrication Co', 'United Industrial Corp', 'Victory Manufacturing',
    'Western Precision Parts', 'Xcel Manufacturing Inc', 'York Industrial Supply', 'Zenith Fabrication Works',
    'Alpine Manufacturing Co', 'Bayside Industrial Corp', 'Central Fabrication Ltd', 'Delta Manufacturing Inc',
    'Eastern Precision Parts', 'Frontier Industrial Works', 'Gateway Manufacturing Co', 'Harbor Fabrication',
    'Inland Industrial Supply', 'Jet Manufacturing Corp', 'Kingston Precision Parts', 'Lakeside Industrial',
    'Metro Manufacturing Co', 'NorthStar Fabrication', 'OceanView Industrial Corp', 'Prairie Manufacturing',
    'Quarry Industrial Supply', 'RiverBend Fabrication', 'Sunrise Manufacturing Co', 'Timber Industrial Works',
    'Union Precision Parts', 'Valiant Manufacturing', 'Windsor Fabrication Ltd', 'Yorktown Industrial Corp',
    'Armstrong Manufacturing', 'Bristol Fabrication Co', 'Clinton Industrial Works', 'Durham Precision Parts',
    'Essex Manufacturing Inc', 'Fulton Industrial Corp', 'Gibraltar Fabrication Ltd', 'Hamilton Manufacturing',
    'Ipswich Industrial Supply', 'Jefferson Precision Parts', 'Kent Manufacturing Co', 'Lancaster Fabrication',
    'Monroe Industrial Works', 'Newcastle Manufacturing', 'Oxford Precision Parts', 'Plymouth Industrial Corp',
    'Richmond Fabrication Co', 'Sheffield Manufacturing Inc', 'Trenton Industrial Supply', 'Warwick Precision Parts',
    'Aberdeen Manufacturing', 'Belfast Fabrication Co', 'Cardiff Industrial Works', 'Dundee Precision Parts',
    'Edinburgh Manufacturing', 'Glasgow Industrial Corp', 'Inverness Fabrication', 'Leeds Manufacturing Co',
    'Liverpool Precision Parts', 'Manchester Industrial Works', 'Norwich Manufacturing Inc', 'Perth Industrial Corp',
  ],
  energy: [
    'Crest Energy Partners', 'Summit Power Group', 'Titan Energy Corp', 'Apex Drilling Co',
    'Heritage Oil & Gas', 'Frontier Energy Solutions', 'Peak Petroleum Ltd', 'Valley Resources Inc',
    'NorthStar Energy Corp', 'Pacific Rim Petroleum', 'Continental Drilling Co', 'Global Energy Partners',
    'Imperial Petroleum Corp', 'Meridian Energy Group', 'Royal Dutch Resources', 'United Oil & Gas',
    'Western Energy Solutions', 'Atlantic Petroleum Ltd', 'Beacon Energy Corp', 'Caspian Drilling Co',
    'Delta Petroleum Group', 'Eastern Energy Partners', 'Falcon Oil & Gas', 'Golden Energy Corp',
    'Horizon Petroleum Ltd', 'Indigo Energy Solutions', 'Jade Oil & Gas Corp', 'Keystone Energy Partners',
    'Liberty Petroleum Inc', 'Majestic Energy Corp', 'Northern Oil & Gas', 'Oceanic Energy Solutions',
    'Pacific Petroleum Corp', 'Quantum Energy Group', 'Ridge Petroleum Ltd', 'Sahara Oil & Gas',
    'Titan Energy Partners', 'Unified Petroleum Corp', 'Vanguard Oil & Gas', 'Western Energy Corp',
    'Xenon Petroleum Ltd', 'Yellowstone Energy Co', 'Zenith Oil & Gas', 'Alpine Energy Partners',
    'BlueRidge Petroleum Corp', 'ClearWater Energy Group', 'DeepWell Oil & Gas', 'Eagle Energy Solutions',
    'GreenField Petroleum Ltd', 'Highland Energy Corp', 'IronClad Oil & Gas', 'Jupiter Energy Partners',
    'Knox Petroleum Corp', 'LoneStar Oil & Gas', 'Midwest Energy Group', 'NewHorizon Petroleum Ltd',
    'Oasis Energy Solutions', 'Pioneer Oil & Gas Corp', 'RedRock Energy Partners', 'SilverCreek Petroleum',
    'StoneGate Energy Corp', 'ThunderBay Oil & Gas', 'Vista Energy Solutions', 'WildWell Petroleum Ltd',
    'Arcadia Energy Corp', 'Bridger Oil & Gas', 'Cedar Creek Energy', 'DiamondBack Petroleum',
    'EverGreen Energy Solutions', 'FossilRidge Oil & Gas', 'Granite Peak Energy', 'Harvest Petroleum Corp',
    'Iron Mountain Energy', 'JadeRock Oil & Gas', 'Kingsford Energy Partners', 'LavaField Petroleum',
    'Mesa Grande Energy', 'NewFields Oil & Gas', 'OldFaithful Energy', 'Prairie Sky Petroleum',
    'Quartz Mountain Energy', 'RedRiver Oil & Gas', 'SageBrush Energy Corp', 'TwinForks Petroleum',
    'UpperCrust Energy Co', 'Vulcan Petroleum Ltd', 'WhitePeak Energy Solutions', 'YellowGrass Oil & Gas',
    'Azure Energy Corp', 'Fusion Power Group', 'Solaris Energy Solutions', 'Windward Power Corp',
    'GeoThermal Partners', 'HydroMax Energy Ltd', 'BioFuel Innovations', 'TidalWave Energy Corp',
    'AmpEre Power Group', 'Volt Energy Solutions', 'GridMaster Corp', 'Current Electric Co',
    'PowerLine Energy', 'Watt Innovations', 'React Energy Corp', 'Fission Power Group',
  ],
  agriculture: [
    'GreenField Agricultural Co', 'Harvest Valley Farms', 'Sunrise Agribusiness', 'Golden Grain Corp',
    'Prairie Land Agricultural', 'RiverBend Farms Inc', 'Mountain View Produce', 'Crestline Agribusiness',
    'Valley Fresh Produce Co', 'Summit Agricultural Group', 'Cedar Creek Farms', 'Meadow Lark Agriculture',
    'Oakland Agricultural Co', 'Pioneer Harvest Corp', 'Redwood Valley Farms', 'Timber Creek Agribusiness',
    'Blue Ridge Produce', 'Clear Water Agriculture', 'Double Oak Farms Inc', 'Evergreen Agricultural Co',
    'Fairview Harvest Corp', 'Green Valley Produce', 'Highland Agriculture Group', 'Iron Gate Farms',
    'Jade Mountain Agribusiness', 'Kings Valley Produce', 'Lake View Agriculture', 'Maple Ridge Farms',
    'North Field Agricultural', 'Orchid Valley Produce', 'Pearl River Agribusiness', 'Quail Run Farms',
    'Red Earth Agriculture', 'Silver Creek Produce', 'Twin Oaks Agribusiness', 'Union Valley Farms',
    'Verdant Fields Agriculture', 'White Oak Harvest Corp', 'Yellow Meadow Produce', 'Arcadia Agricultural Co',
    'Birchwood Valley Farms', 'Chestnut Ridge Agriculture', 'Deer Creek Produce Co', 'Elm Street Agribusiness',
    'Fern Valley Farms Inc', 'Glenwood Agricultural Group', 'Hawthorne Harvest Corp', 'Ivy Lane Produce',
    'Juniper Valley Agriculture', 'Larkspur Agribusiness Co', 'Magnolia Fields Farms', 'Nutmeg Valley Produce',
    'Orchard View Agriculture', 'Pine Grove Harvest Corp', 'Ridgeway Farms Inc', 'Sunflower Agricultural Co',
    'Thornwood Valley Produce', 'Umbrella Leaf Agribusiness', 'Violet Fields Agriculture', 'Walnut Creek Farms',
    'Yarrow Valley Produce Co', 'Zephyr Agricultural Group', 'Acacia Harvest Corp', 'Buttercup Farms Inc',
    'Clover Field Agriculture', 'Dandelion Valley Produce', 'Elderberry Agribusiness Co', 'Foxglove Farms',
    'Ginger Root Agriculture', 'Hemlock Valley Harvest', 'Indigo Fields Produce', 'Jasmine Agribusiness Corp',
    'Kudzu Valley Farms', 'Lavender Field Agriculture', 'Mint Creek Produce Co', 'Nettle Valley Harvest',
    'Okra Fields Agribusiness', 'Peppermint Valley Produce', 'Quinoa Agricultural Co', 'Rosemary Farms Inc',
    'Saffron Valley Agriculture', 'Thyme Field Harvest Corp', 'Wasabi Agribusiness Co', 'Yam Valley Produce',
    'Artichoke Agricultural Group', 'Basil Creek Farms', 'Celery Fields Produce', 'Dill Valley Agribusiness',
    'Endive Harvest Corp', 'Fennel Agriculture Co', 'Ginseng Valley Farms', 'Horseradish Produce Inc',
    'Kale Fields Agriculture', 'Lentil Valley Corp', 'Mushroom Agribusiness Co', 'Okra Harvest Group',
    'Parsnip Valley Farms', 'Radish Field Agriculture', 'Spinach Creek Produce', 'Turnip Valley Corp',
  ],
  services: [
    'Premier Services Group', 'Apex Consulting Corp', 'Meridian Financial Services', 'Summit Advisory Group',
    'Crestline Solutions Inc', 'Valley Professional Services', 'Pinnacle Business Group', 'Titan Service Corp',
    'Accord Consulting Partners', 'BridgePoint Services Inc', 'Catalyst Advisory Group', 'Dawn Professional Corp',
    'Elite Service Solutions', 'Frontier Business Group', 'Global Consulting Partners', 'Horizon Services Inc',
    'Integra Advisory Group', 'Junction Business Corp', 'KeyStone Service Solutions', 'Lighthouse Consulting',
    'Metro Services Group', 'NewAge Advisory Corp', 'Omni Professional Solutions', 'Pulse Business Group',
    'Quest Services Inc', 'RidgeLine Consulting', 'Synergy Advisory Group', 'TrueNorth Services Corp',
    'Unity Business Solutions', 'Vanguard Consulting Inc', 'WestGate Services Group', 'Xcell Advisory Corp',
    'Zen Professional Solutions', 'ApexOne Services', 'BrightPath Consulting', 'ClearView Advisory Group',
    'DirectLine Services Inc', 'EastGate Business Corp', 'FirstRate Consulting', 'GoldenGate Services',
    'HighPoint Advisory Corp', 'IronShield Services', 'JadeBridge Consulting', 'KeyPoint Business Group',
    'Liberty Services Inc', 'Magna Consulting Corp', 'NorthGate Advisory', 'OpenDoor Services Group',
    'PremierPath Consulting', 'RedCarpet Services', 'SilverLine Advisory Corp', 'StarGate Business Group',
    'TrustBridge Consulting', 'UpperEchelon Services', 'VividPath Advisory', 'WhiteGlove Services Corp',
    'Aegis Consulting Group', 'BluePrint Services Inc', 'Citadel Advisory Corp', 'DiamondEdge Solutions',
    'Emerald Services Group', 'Fortress Consulting Ltd', 'Guardian Advisory Corp', 'Harbinger Services',
    'Ivy League Consulting', 'Jewel Business Group', 'KnightBridge Services', 'Legacy Advisory Corp',
    'Marble Arch Consulting', 'Noble Services Group', 'OakStone Advisory', 'Platinum Consulting Corp',
    'Royal Crest Services', 'Sapphire Advisory Group', 'TowerBridge Consulting', 'Utopia Services Inc',
    'Veritas Advisory Corp', 'Windsor Consulting Group', 'Xenith Services Ltd', 'YorkBridge Advisory',
    'Zenith Consulting Corp', 'Ambassador Services', 'Baron Consulting Group', 'Chancellor Advisory Corp',
    'Duke Services Inc', 'Emperor Business Group', 'Falcon Consulting Ltd', 'GrandMaster Services',
    'Herald Advisory Corp', 'Imperial Consulting Group', 'Kingston Business Services', 'Lord Bridge Advisory',
    'Majesty Services Corp', 'NoblePath Consulting', 'PrinceGate Advisory', 'QueenBridge Services',
    'Regent Consulting Group', 'Senate Advisory Corp', 'Throne Services Inc', 'Viceroy Business Corp',
  ],
  tourism: [
    'Paradise Resorts & Travel', 'Coastal Escape Tours', 'Summit Hospitality Group', 'Golden Horizon Travel',
    'Crystal Coast Resorts', 'Azure Seas Tourism', 'Tranquil Destinations Inc', 'Mountain Peak Hospitality',
    'Serene Shores Travel Co', 'Royal Palm Resorts', 'Emerald Isle Tourism', 'Heritage Trail Adventures',
    'Sunset Boulevard Tours', 'Ocean Pearl Hospitality', 'Alpine Escape Travel', 'Blue Lagoon Resorts',
    'Coral Reef Tourism Group', 'Desert Rose Travel Co', 'Enchanted Destinations', 'Forest Glen Hospitality',
    'Grand Vista Resorts', 'Harbor Light Tours', 'Island Breeze Travel', 'Jade Mountain Hospitality',
    'Kingdom Tours & Travel', 'Lakeside Paradise Resorts', 'Moonlight Bay Tourism', 'Northern Lights Travel Co',
    'Oasis Hospitality Group', 'Palm Grove Resorts', 'Quiet Cove Tourism', 'Rainbow Destinations Inc',
    'Silver Sands Travel Co', 'Tropical Breeze Resorts', 'Underwater Wonders Tourism', 'Valley View Hospitality',
    'Whispering Pines Travel', 'Xanadu Resorts & Spa', 'Yellow Sands Tourism', 'Zen Retreat Hospitality',
    'Atlantis Dive Resorts', 'Bella Vista Tourism', 'Casa del Sol Travel', 'Don Fernando Hospitality',
    'El Dorado Resorts', 'Fiesta Island Tourism', 'Garden of Eden Travel', 'Hawaiian Paradise Resorts',
    'Iberian Sun Tourism', 'Jamaican Breeze Travel', 'Kona Coast Hospitality', 'Laguna Beach Resorts',
    'Mediterranean Pearl Tourism', 'Naples Bay Travel Co', 'Oriental Dream Resorts', 'Portofino Hospitality',
    'Rio Grande Tourism', 'Santorini View Travel', 'Tahiti Pearl Resorts', 'Umbrian Hills Tourism',
    'Venetian Nights Travel', 'Waikiki Beach Hospitality', 'Xalapa Veracruz Tourism', 'Yucatan Travel Co',
    'Zanzibar Shore Resorts', 'Amalfi Coast Tourism', 'Bora Bora Travel', 'Cannes Hospitality Group',
    'Dubai Pearl Resorts', 'Fiji Paradise Tourism', 'Greek Isles Travel Co', 'Hawaiian Sun Hospitality',
    'Ibiza Nights Tourism', 'Jamaican Vibes Travel', 'Kauai Beach Resorts', 'Lombok Bay Tourism',
    'Maldives Dream Travel', 'Nice Promenade Hospitality', 'Osaka Gate Tourism', 'Phuket Sands Resorts',
    'Queenstown Adventures', 'Riviera Maya Travel', 'Seychelles Pearl Tourism', 'Tulum Beach Resorts',
    'Udaipur Palace Hospitality', 'Valletta Knights Tourism', 'Whitsunday Tours', 'Xiamen Dragon Travel',
    'Yosemite Wild Hospitality', 'Zermatt Alpine Resorts', 'Angkor Wat Tourism', 'Bali Hai Travel Co',
    'Chiang Mai Hospitality', 'Dolomites Mountain Tours', 'Everest Base Travel', 'Fuji View Resorts',
    'Great Barrier Tourism', 'Hong Kong Peak Travel', 'Inca Trail Adventures', 'Jeju Island Resorts',
    'Kilimanjaro Tours', 'Lake Como Hospitality', 'Machu Picchu Travel', 'Niagara Falls Tourism',
  ],
};

// ─── TAX RATES PER GOVERNMENT TYPE ────────────────────

const TAX_BY_GOVERNMENT = {
  liberal_democracy:          { corp: 0.21, income: 0.28, vat: 0.10, tariff: 0.02, efficiency: 0.92 },
  federal_republic:           { corp: 0.18, income: 0.25, vat: 0.08, tariff: 0.03, efficiency: 0.88 },
  constitutional_monarchy:    { corp: 0.20, income: 0.24, vat: 0.12, tariff: 0.04, efficiency: 0.85 },
  authoritarian_state:        { corp: 0.25, income: 0.18, vat: 0.18, tariff: 0.08, efficiency: 0.65 },
  dictatorship:               { corp: 0.10, income: 0.12, vat: 0.20, tariff: 0.12, efficiency: 0.45 },
  military_junta:             { corp: 0.15, income: 0.14, vat: 0.15, tariff: 0.10, efficiency: 0.55 },
  technocratic_council:       { corp: 0.15, income: 0.22, vat: 0.08, tariff: 0.01, efficiency: 0.95 },
  socialist_republic:         { corp: 0.35, income: 0.40, vat: 0.15, tariff: 0.05, efficiency: 0.72 },
  theocratic_state:           { corp: 0.12, income: 0.13, vat: 0.08, tariff: 0.06, efficiency: 0.50 },
};

// ─── INDUSTRY SECTORS ─────────────────────────────────

const INDUSTRY_SECTORS = [
  { id: 'agriculture',   label: 'Agriculture',    baseRevenue: 0.5,  volatility: 0.15, icon: '🌾' },
  { id: 'manufacturing', label: 'Manufacturing',   baseRevenue: 1.0,  volatility: 0.20, icon: '🏭' },
  { id: 'energy',        label: 'Energy',          baseRevenue: 1.5,  volatility: 0.35, icon: '⚡' },
  { id: 'technology',    label: 'Technology',      baseRevenue: 2.0,  volatility: 0.25, icon: '💻' },
  { id: 'services',      label: 'Financial Services', baseRevenue: 1.2, volatility: 0.15, icon: '🏦' },
  { id: 'tourism',       label: 'Tourism',         baseRevenue: 0.8,  volatility: 0.30, icon: '✈️' },
];

// ─── INIT INDUSTRIES FOR A NATION ─────────────────────

function initNationIndustries(nation) {
  if (nation.industries) return;
  
  nation.industries = {};
  nation.companies = [];
  nation.taxRevenue = 0;
  nation.taxCollected = 0;
  nation.informalEconomy = clamp((100 - nation.governance) * 0.3 + nation.corruption * 0.5, 5, 60);
  nation.corporateEarnings = 0;
  
  // Initialize each sector
  INDUSTRY_SECTORS.forEach(sector => {
    nation.industries[sector.id] = {
      totalRevenue: 0,
      totalEmployees: 0,
      companyCount: 0,
      growthRate: 0.01 + Math.random() * 0.02,
    };
  });
  
  // Generate initial companies
  generateNationCompanies(nation, true);
}

// ─── GENERATE COMPANIES ───────────────────────────────

function generateNationCompanies(nation, initial = false) {
  initNationIndustries(nation);
  
  const pop = nation.population; // millions
  const edu = nation.education;
  const tech = nation.techLevel;
  const gov = getGovernmentProfile(nation.governmentStyle);
  const govFactor = gov.econBoost || 1.0;
  
  // Education factor: low edu = almost no companies
  const eduFactor = clamp(edu / 25, 0.1, 3.0);
  // Population factor: more people = more companies
  const popFactor = clamp(pop / 50, 0.3, 3.0);
  // Governance factor: good governance enables business
  const govBusinessFactor = clamp(nation.governance / 40, 0.3, 2.0);
  
  const baseCompaniesPerTurn = clamp(eduFactor * popFactor * govBusinessFactor * govFactor * 0.15, 0.05, 4);
  
  // If initial, generate a stock of companies
  const initialCount = initial ? Math.round(baseCompaniesPerTurn * 8 + Math.random() * 5) : Math.floor(baseCompaniesPerTurn);
  
  // Distribute by education level (low edu = mostly agriculture, high edu = mostly tech)
  const sectorWeights = {};
  if (edu < 25) {
    sectorWeights.agriculture = 0.50; sectorWeights.manufacturing = 0.20;
    sectorWeights.energy = 0.10;       sectorWeights.technology = 0.02;
    sectorWeights.services = 0.08;     sectorWeights.tourism = 0.10;
  } else if (edu < 45) {
    sectorWeights.agriculture = 0.30; sectorWeights.manufacturing = 0.30;
    sectorWeights.energy = 0.12;       sectorWeights.technology = 0.05;
    sectorWeights.services = 0.13;     sectorWeights.tourism = 0.10;
  } else if (edu < 65) {
    sectorWeights.agriculture = 0.15; sectorWeights.manufacturing = 0.25;
    sectorWeights.energy = 0.15;       sectorWeights.technology = 0.15;
    sectorWeights.services = 0.18;     sectorWeights.tourism = 0.12;
  } else {
    sectorWeights.agriculture = 0.05; sectorWeights.manufacturing = 0.15;
    sectorWeights.energy = 0.10;       sectorWeights.technology = 0.30;
    sectorWeights.services = 0.25;     sectorWeights.tourism = 0.15;
  }
  
  for (let i = 0; i < initialCount; i++) {
    // Pick sector by weight
    const rand = Math.random();
    let cumulative = 0;
    let chosenSector = 'agriculture';
    for (const [sectorId, weight] of Object.entries(sectorWeights)) {
      cumulative += weight;
      if (rand <= cumulative) { chosenSector = sectorId; break; }
    }
    
    // Company size based on education and governance
    const sizeRoll = Math.random() + eduFactor * 0.1 + govBusinessFactor * 0.05;
    let size, sizeMultiplier;
    if (sizeRoll > 1.6) { size = 'corporation'; sizeMultiplier = 5; }
    else if (sizeRoll > 1.2) { size = 'large'; sizeMultiplier = 2.5; }
    else if (sizeRoll > 0.6) { size = 'medium'; sizeMultiplier = 1.0; }
    else { size = 'small'; sizeMultiplier = 0.3; }
    
    const namePool = COMPANY_NAMES[chosenSector] || COMPANY_NAMES.services;
    const name = namePool[Math.floor(Math.random() * namePool.length)];
    
    // Skip if duplicate name
    if (nation.companies.some(c => c.name === name)) continue;
    
    const baseRevenue = (INDUSTRY_SECTORS.find(s => s.id === chosenSector)?.baseRevenue || 1.0);
    // Company revenue based on sector, size, tech, and education - NOT directly on GDP (avoids feedback loop)
    const marketSizeFactor = clamp(nation.population / 100, 0.3, 3.0);
    const revenue = baseRevenue * sizeMultiplier * (0.5 + Math.random()) * clamp(tech / 5, 0.2, 2.5) * marketSizeFactor;
    const employees = Math.round(revenue * (20 + Math.random() * 30) * (1 + eduFactor * 0.2));
    
    const company = {
      id: nation.id + '_comp_' + nation.companies.length,
      name: name,
      sector: chosenSector,
      size: size,
      revenue: clamp(revenue, 0.01, 200), // $M per month
      employees: clamp(employees, 1, 50000),
      taxPaid: 0,
      founded: GAME?.turn || 0,
      stockPrice: sizeMultiplier > 2 ? (10 + Math.random() * 90) : 0,
      public: size === 'corporation' && Math.random() > 0.4,
      growthRate: (Math.random() - 0.4) * 0.04,
      profitMargin: clamp((0.05 + Math.random() * 0.15) * govFactor, 0.01, 0.25),
    };
    
    nation.companies.push(company);
    
    // Track in sector totals
    if (nation.industries[chosenSector]) {
      nation.industries[chosenSector].companyCount++;
      nation.industries[chosenSector].totalRevenue += company.revenue;
      nation.industries[chosenSector].totalEmployees += company.employees;
    }
  }
}

// ─── COMPUTE TAX REVENUE ──────────────────────────────

function computeNationTaxRevenue(nation) {
  initNationIndustries(nation);
  
  const govType = nation.governmentStyle;
  const taxConfig = TAX_BY_GOVERNMENT[govType] || TAX_BY_GOVERNMENT.federal_republic;
  const gdp = nation.gdp; // $T
  const gdpMonthly = (gdp * 1000) / 12; // $M per month
  
  // Tax base is GDP-based + corporate earnings
  const corporateBase = gdpMonthly * 0.4;
  const incomeBase = gdpMonthly * 0.5;
  const consumptionBase = gdpMonthly * 0.3;
  const tradeBase = gdpMonthly * 0.1;
  
  // Efficiency: corruption and informal economy reduce collection
  const efficiency = taxConfig.efficiency * (1 - nation.corruption / 200) * clamp(1 - nation.informalEconomy / 100, 0.4, 1.0);
  
  const corpTax = corporateBase * taxConfig.corp * efficiency;
  const incomeTax = incomeBase * taxConfig.income * efficiency;
  const vatTax = consumptionBase * taxConfig.vat * efficiency;
  const tariffTax = tradeBase * taxConfig.tariff * efficiency;
  
  const totalTax = corpTax + incomeTax + vatTax + tariffTax;
  
  nation.taxRevenue = totalTax;
  nation.taxCollected += totalTax;
  
  return {
    total: totalTax,
    breakdown: { corp: corpTax, income: incomeTax, vat: vatTax, tariff: tariffTax },
    efficiency: efficiency,
    rates: taxConfig
  };
}

// ─── PROCESS ALL ECONOMIC SYSTEMS ─────────────────────

function processAllEconomicSystems() {
  Object.values(NATIONS).forEach(nation => {
    if (nation.failedState) return;
    
    initNationIndustries(nation);
    
    // 1. Generate new companies (education-dependent)
    generateNationCompanies(nation, false);
    
    // 2. Update existing companies
    updateNationCompanies(nation);
    
    // 3. Compute tax revenue
    const taxData = computeNationTaxRevenue(nation);
    
    // 4. Update GDP growth with FIXED rate
    updateNationGDP(nation, taxData);
    
    // 5. Update stock market
    updateNationStockMarket(nation);
    
    // 6. Update informal economy
    updateInformalEconomy(nation);
    
    // 7. Update corporate earnings tracking
    updateCorporateEarnings(nation);
  });
  
  // 8. Apply player treasury from taxes
  applyPlayerTreasuryFromTaxes();
}

// ─── UPDATE COMPANIES ─────────────────────────────────

function updateNationCompanies(nation) {
  const edu = nation.education;
  const tech = nation.techLevel;
  const govFactor = (getGovernmentProfile(nation.governmentStyle)?.econBoost || 1.0);
  
  const companiesToRemove = [];
  
  nation.companies.forEach(company => {
    // Company growth/decline
    const innovationBonus = company.sector === 'technology' ? clamp((tech - 3) * 0.002, 0, 0.01) : 0;
    const eduBonus = clamp((edu - 30) * 0.0002, -0.005, 0.005);
    const randomShock = (Math.random() - 0.5) * 0.03;
    
    company.growthRate = clamp(company.growthRate + innovationBonus + eduBonus + randomShock * 0.1, -0.08, 0.08);
    company.revenue = clamp(company.revenue * (1 + company.growthRate), 0.01, 200);
    company.employees = Math.round(company.employees * (1 + company.growthRate * 0.5));
    company.employees = clamp(company.employees, 1, 50000);
    
    // Update sector totals
    const sector = nation.industries[company.sector];
    if (sector) {
      sector.totalRevenue += company.revenue;
      sector.totalEmployees += company.employees;
    }
    
    // Company death (bankruptcy)
    if (company.revenue < 0.005 || (company.growthRate < -0.05 && Math.random() < 0.05)) {
      companiesToRemove.push(company);
    }
    
    // Company growth: small → medium → large → corporation
    if (company.size === 'small' && company.revenue > 8 && Math.random() < 0.08) {
      company.size = 'medium';
    } else if (company.size === 'medium' && company.revenue > 25 && Math.random() < 0.05) {
      company.size = 'large';
    } else if (company.size === 'large' && company.revenue > 60 && Math.random() < 0.03) {
      company.size = 'corporation';
      if (!company.public && Math.random() > 0.3) {
        company.public = true;
        company.stockPrice = 10 + Math.random() * 90;
        addNews(`📈 ${company.name} (${nation.name}) goes public at $${company.stockPrice.toFixed(0)}/share`, 'minor');
      }
    }
    
    // Compute tax paid
    const taxConfig = TAX_BY_GOVERNMENT[nation.governmentStyle] || TAX_BY_GOVERNMENT.federal_republic;
    const effectiveRate = company.public ? taxConfig.corp * 1.1 : taxConfig.corp;
    company.taxPaid = company.revenue * effectiveRate * (1 - nation.corruption / 200);
  });
  
  // Remove dead companies
  companiesToRemove.forEach(dead => {
    const idx = nation.companies.indexOf(dead);
    if (idx > -1) {
      nation.companies.splice(idx, 1);
      const sector = nation.industries[dead.sector];
      if (sector) {
        sector.companyCount = Math.max(0, sector.companyCount - 1);
        sector.totalRevenue = Math.max(0, sector.totalRevenue - dead.revenue);
        sector.totalEmployees = Math.max(0, sector.totalEmployees - dead.employees);
      }
    }
  });
}

// ─── FIXED GDP GROWTH RATE ────────────────────────────

function updateNationGDP(nation, taxData) {
  const gov = getGovernmentProfile(nation.governmentStyle);
  const decisionFactor = clamp((nation.decisionQuality || 55) / 65, 0.85, 1.2);
  
  // ── ECONOMIC MOMENTUM FROM BOOM PHASE ──────────────
  const boomPhase = computeBoomPhase(nation);
  const boomMomentum = boomPhase.momentum; // -1 to +1
  const inRecession = boomPhase.phase === 'recession' || boomPhase.phase === 'depression';
  
  // ── REALISTIC BASE: very small organic growth for healthy economies ──
  let baseGrowth = 0;
  if (nation.stability > 55 && nation.inflation < 10 && nation.debtRatio < 90) {
    baseGrowth = 0.0008; // ~0.08% / month = ~1% / year organic drift
  }
  
  // ── MODERATE INNOVATION BOOST ──
  const techFactor = clamp(nation.techLevel / 10, 0.2, 1.0);
  const eduFactor = clamp(nation.education / 60, 0.2, 1.3);
  const govFactor = clamp(nation.governance / 55, 0.3, 1.2);
  
  const innovationEngine = (
    eduFactor * 0.3 + techFactor * 0.5 + govFactor * 0.2
  ) * 0.0015 * gov.innovationBoost; // max ~+0.15%/mo at peak tech+edu
  
  // ── MODERATE PRODUCTIVITY BOOST ──
  const infraFactor = clamp(nation.infrastructure / 55, 0.2, 1.2);
  const factoryFactor = clamp(nation.factories / 55, 0.2, 1.2);
  const energyFactor = clamp(nation.energySecurity / 55, 0.2, 1.2);
  const jobsFactor = clamp(nation.jobs / 55, 0.2, 1.2);
  
  const productivityEngine = (
    infraFactor * 0.35 + factoryFactor * 0.30 + energyFactor * 0.20 + jobsFactor * 0.15
  ) * 0.001 * gov.econBoost; // max ~+0.12%/mo
  
  // ── COMPANY SECTOR SIGNAL (small) ──
  let sectorGrowth = 0;
  let totalCompanyRevenue = 0;
  INDUSTRY_SECTORS.forEach(sector => {
    const data = nation.industries[sector.id];
    if (data) {
      totalCompanyRevenue += data.totalRevenue || 0;
      sectorGrowth += (data.growthRate || 0) * 0.03;
    }
  });
  sectorGrowth = clamp(sectorGrowth, -0.001, 0.0015);
  
  // ── CATCH-UP FOR POOR NATIONS (only if they have decent governance) ──
  let catchUpGrowth = 0;
  if (nation.gdp < 2 && nation.governance > 35) {
    const gap = clamp((2 - nation.gdp) / 2, 0, 1);
    const capability = clamp((nation.governance + nation.education) / 120, 0, 1);
    catchUpGrowth = gap * capability * 0.002; // max +0.2%/mo
  }
  
  // ── PENALTIES ──
  const inflationPenalty = nation.inflation > 4
    ? clamp((nation.inflation - 4) * 0.0003, 0, 0.008) : 0;
  const debtPenalty = nation.debtRatio > 70
    ? clamp((nation.debtRatio - 70) * 0.00006, 0, 0.006) : 0;
  const inequalityPenalty = nation.inequality > 50
    ? clamp((nation.inequality - 50) * 0.0001, 0, 0.004) : 0;
  const corruptionPenalty = nation.corruption > 35
    ? clamp((nation.corruption - 35) * 0.00008, 0, 0.004) : 0;
  const warPenalty = getWarPressure(nation.id || '') * 0.004; // up to -0.4%
  const recessionPenalty = inRecession
    ? clamp((nation.recessionMonths || 0) * 0.0002, 0, 0.005) : 0;
  
  // ── TAX DRAG (higher taxes slightly reduce growth) ──
  const taxDrag = taxData.rates.corp * 0.002 + taxData.rates.income * 0.001;
  
  // ── GDP GROWTH RATE ──
  const rawGrowth = 
    baseGrowth + innovationEngine + productivityEngine +
    sectorGrowth + catchUpGrowth -
    inflationPenalty - debtPenalty - inequalityPenalty -
    corruptionPenalty - warPenalty - recessionPenalty - taxDrag;
  
  // Boom momentum feeds in subtly
  const boomBoost = clamp(boomMomentum * 0.002, -0.002, 0.002);
  
  const gdpGrowthRate = clamp(
    (rawGrowth + boomBoost) * decisionFactor,
    -0.01, 0.008 // -1% to +0.8% per month (realistic)
  );
  
  // ── BOOM OVERHEAT TRACKING ──
  if (boomPhase.phase === 'boom' && (boomPhase.boomRisk || 0) > 0.3) {
    nation.boomOverheat = (nation.boomOverheat || 0) + 1;
  } else {
    nation.boomOverheat = Math.max(0, (nation.boomOverheat || 0) - 1);
  }
  const overheatPenalty = clamp((nation.boomOverheat || 0) * 0.00015, 0, 0.005);
  const finalGrowth = gdpGrowthRate - overheatPenalty;
  
  // ── APPLY GDP CHANGE ──
  nation.gdp = clamp(
    nation.gdp * (1 + finalGrowth) + (Math.random() - 0.5) * 0.0005,
    0.03, 140
  );
  
  // ── TRACK RECESSION ──
  if (finalGrowth < -0.0003) {
    nation.recessionMonths = clamp((nation.recessionMonths || 0) + 1, 0, 240);
  } else if ((nation.recessionMonths || 0) > 0) {
    nation.recessionMonths = clamp(nation.recessionMonths - 1, 0, 240);
  }
  
  // ── BOOM CRASH (rare correction) ──
  if ((nation.boomOverheat || 0) > 20 && Math.random() < 0.1) {
    const crash = -0.003 - Math.random() * 0.005;
    nation.gdp = clamp(nation.gdp * (1 + crash), 0.03, 140);
    nation.boomOverheat = 0;
  }
}

// ─── STOCK MARKET ─────────────────────────────────────

function updateNationStockMarket(nation) {
  const gov = getGovernmentProfile(nation.governmentStyle);
  
  // Count public companies
  const publicCompanies = nation.companies.filter(c => c.public);
  const ipoMomentum = publicCompanies.length > 0 ? 0.3 : -0.2;
  
  // Corporate earnings drive stocks
  const earningsSignal = clamp(nation.corporateEarnings / 100, -2, 3);
  
  // Economic fundamentals
  const gdpSignal = ((nation.gdp - 5) / 50) * 0.5;
  const stabilitySignal = (nation.stability - 50) * 0.02;
  const governanceSignal = (nation.governance - 50) * 0.02;
  const inflationPenalty = nation.inflation * 0.15;
  const warPenalty = getWarPressure(nation.id || '') * 1.2;
  
  // Boom/bust cycle (from existing computeBoomPhase)
  const boomPhase = computeBoomPhase(nation);
  const boomSignal = boomPhase.phase === 'boom' ? 1.5 : boomPhase.phase === 'recession' ? -1.5 : 0;
  
  // Random volatility
  const volatility = (Math.random() - 0.5) * 3;
  
  // Crash risk: if market overheated
  if ((nation.stockMarket || 100) > 180 && Math.random() < 0.05) {
    const crash = 10 + Math.random() * 20;
    addNews(`💥 ${nation.name} stock market crashes -${crash.toFixed(0)} points!`, 'major');
    nation.stockMarket = clamp(nation.stockMarket - crash, 15, 240);
    return;
  }
  
  const change = earningsSignal + gdpSignal + stabilitySignal + governanceSignal - inflationPenalty - warPenalty + boomSignal + volatility + ipoMomentum;
  
  nation.stockMarket = clamp(
    (nation.stockMarket || 100) + change,
    15, 240
  );
  
  // Update individual stock prices
  publicCompanies.forEach(company => {
    const sectorVolatility = (INDUSTRY_SECTORS.find(s => s.id === company.sector)?.volatility || 0.2);
    company.stockPrice = clamp(
      company.stockPrice * (1 + (change / 100) + (Math.random() - 0.5) * sectorVolatility * 0.1),
      0.5, 500
    );
  });
}

// ─── INFORMAL ECONOMY ─────────────────────────────────

function updateInformalEconomy(nation) {
  // Informal economy shrinks with good governance, grows with high corruption/taxes
  const govEfficiency = clamp(nation.governance / 50, 0.3, 2.0);
  const taxPressure = (TAX_BY_GOVERNMENT[nation.governmentStyle]?.corp || 0.2) * 50;
  const corruptionPush = nation.corruption * 0.15;
  
  const targetInformal = clamp(
    30 - govEfficiency * 12 + taxPressure * 0.2 + corruptionPush,
    5, 60
  );
  
  nation.informalEconomy += (targetInformal - nation.informalEconomy) * 0.02;
  nation.informalEconomy = clamp(nation.informalEconomy, 3, 65);
}

// ─── CORPORATE EARNINGS ───────────────────────────────

function updateCorporateEarnings(nation) {
  let totalEarnings = 0;
  nation.companies.forEach(company => {
    totalEarnings += company.revenue * company.profitMargin;
  });
  nation.corporateEarnings = totalEarnings;
}

// ─── APPLY PLAYER TREASURY FROM TAXES ─────────────────

function applyPlayerTreasuryFromTaxes() {
  const player = getPlayerRecord();
  if (!player) return;
  
  initNationIndustries(player);
  
  const taxData = computeNationTaxRevenue(player);
  const totalTaxRevenue = taxData.total;
  
  // Budget spending (convert percentages to $M)
  const budget = GAME.budget;
  const totalBudgetPct = budget.military + budget.economy + budget.diplomacy + budget.intelligence + budget.space + budget.social;
  const spendingMultiplier = totalTaxRevenue / Math.max(totalBudgetPct, 1);
  
  const spending = (
    budget.military * spendingMultiplier * 0.4 +
    budget.economy * spendingMultiplier * 0.1 +
    budget.diplomacy * spendingMultiplier * 0.3 +
    budget.intelligence * spendingMultiplier * 0.25 +
    budget.space * spendingMultiplier * 0.6 +
    budget.social * spendingMultiplier * 0.35
  );
  
  // Debt service
  const debtService = player.debtRatio * 0.15;
  
  const netRevenue = Math.round(totalTaxRevenue - spending - debtService);
  GAME.treasury += netRevenue;
  GAME.treasury = Math.max(50, GAME.treasury);
  
  // Update deficit based on tax revenue vs spending
  const deficitChange = ((spending + debtService) - totalTaxRevenue) / (player.gdp * 100);
  player.deficit = clamp(
    (player.deficit || 0) + deficitChange * 0.5 + (player.inflation > 8 ? 0.05 : -0.02) + (Math.random() - 0.5) * 0.1,
    -12, 35
  );
}

// ─── RENDER ECONOMY TAB ───────────────────────────────

function renderEconomyTab() {
  const p = GAME.playerNation;
  if (!p) return '<div class="tab-error">No nation selected</div>';
  
  initNationIndustries(p);
  const taxData = computeNationTaxRevenue(p);
  
  // Summary cards
  let html = '<div class="tab-content">';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">';
  html += '<div class="resource-item"><span class="r-name">GDP</span><span class="r-val" style="font-size:18px">$' + p.gdp.toFixed(2) + 'T</span></div>';
  html += '<div class="resource-item"><span class="r-name">Treasury</span><span class="r-val" style="font-size:18px;color:var(--accent-yellow)">$' + Math.round(GAME.treasury) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Tax Revenue</span><span class="r-val" style="font-size:18px;color:var(--accent-green)">$' + Math.round(taxData.total) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Stock Market</span><span class="r-val">' + (p.stockMarket || 100).toFixed(1) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Corporate Earnings</span><span class="r-val" style="color:var(--accent-blue)">$' + (p.corporateEarnings || 0).toFixed(1) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Informal Economy</span><span class="r-val" style="color:' + (p.informalEconomy > 30 ? 'var(--accent-red)' : 'var(--accent-green)') + '">' + p.informalEconomy.toFixed(1) + '%</span></div>';
  html += '</div>';
  
  // Tax breakdown
  html += '<div class="section-card"><h4>💰 Tax Revenue Breakdown</h4>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
  html += '<div class="resource-item"><span class="r-name">Corporate Tax (' + (taxData.rates.corp * 100).toFixed(0) + '%)</span><span class="r-val">$' + Math.round(taxData.breakdown.corp) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Income Tax (' + (taxData.rates.income * 100).toFixed(0) + '%)</span><span class="r-val">$' + Math.round(taxData.breakdown.income) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">VAT (' + (taxData.rates.vat * 100).toFixed(0) + '%)</span><span class="r-val">$' + Math.round(taxData.breakdown.vat) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Tariffs (' + (taxData.rates.tariff * 100).toFixed(0) + '%)</span><span class="r-val">$' + Math.round(taxData.breakdown.tariff) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Collection Efficiency</span><span class="r-val" style="color:' + (taxData.efficiency > 0.7 ? 'var(--accent-green)' : 'var(--accent-red)') + '">' + (taxData.efficiency * 100).toFixed(0) + '%</span></div>';
  html += '<div class="resource-item"><span class="r-name">Total Collected</span><span class="r-val" style="color:var(--accent-green)">$' + Math.round(p.taxCollected) + 'M</span></div>';
  html += '</div></div>';
  
  // Industry sectors
  html += '<div class="section-card"><h4>🏗️ Industry Sectors</h4>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
  INDUSTRY_SECTORS.forEach(sector => {
    const data = p.industries[sector.id];
    if (!data) return;
    const sectorRevenue = data.totalRevenue || 0;
    const employees = data.totalEmployees || 0;
    html += '<div style="background:rgba(9,28,54,0.5);border:1px solid var(--border-color);border-radius:6px;padding:8px">';
    html += '<div style="font-weight:600;font-size:12px;margin-bottom:3px">' + sector.icon + ' ' + sector.label + '</div>';
    html += '<div style="font-size:11px;color:var(--text-secondary)">';
    html += 'Companies: ' + data.companyCount + ' | Revenue: $' + sectorRevenue.toFixed(1) + 'M<br>';
    html += 'Employees: ' + employees.toLocaleString() + ' | Growth: ' + (data.growthRate * 100).toFixed(1) + '%';
    html += '</div></div>';
  });
  html += '</div></div>';
  
  // Top companies
  const topCompanies = p.companies.slice().sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  html += '<div class="section-card"><h4>🏢 Top Companies (' + p.companies.length + ' total)</h4>';
  if (topCompanies.length === 0) {
    html += '<p class="empty">No companies founded yet. Improve education and governance to attract investment.</p>';
  } else {
    html += '<div style="max-height:300px;overflow-y:auto">';
    topCompanies.forEach((company, idx) => {
      const sector = INDUSTRY_SECTORS.find(s => s.id === company.sector);
      html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px solid rgba(84,140,196,0.12);font-size:12px">';
      html += '<span style="color:var(--text-muted);width:20px">#' + (idx+1) + '</span>';
      html += '<span style="font-weight:500;flex:1">' + (sector ? sector.icon : '') + ' ' + company.name + '</span>';
      html += '<span style="color:var(--text-secondary);font-size:10px;background:rgba(46,167,255,0.1);padding:1px 5px;border-radius:3px">' + company.size + '</span>';
      html += '<span style="color:var(--accent-green);font-weight:600">$' + company.revenue.toFixed(1) + 'M</span>';
      if (company.public) {
        html += '<span style="color:var(--accent-blue)">$' + company.stockPrice.toFixed(1) + '</span>';
      }
      html += '<span style="color:var(--text-muted);font-size:10px">' + company.employees.toLocaleString() + ' emp</span>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';
  
  html += '</div>';
  return html;
}

// ─── EXPOSE GLOBAL ────────────────────────────────────

window.renderEconomyTab = renderEconomyTab;
window.initNationIndustries = initNationIndustries;
window.processAllEconomicSystems = processAllEconomicSystems;
window.updateNationGDP = updateNationGDP;
window.updateNationStockMarket = updateNationStockMarket;
