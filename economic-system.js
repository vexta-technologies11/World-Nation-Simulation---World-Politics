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






  { id: 'agriculture',   label: 'Agriculture',    baseRevenue: 0.5,  volatility: 0.15, icon: '🌾', resourceReq: 'fertileLand', resourceWeight: 0.6 },
  { id: 'manufacturing', label: 'Manufacturing',   baseRevenue: 1.0,  volatility: 0.20, icon: '🏭', resourceReq: 'minerals',    resourceWeight: 0.5 },
  { id: 'energy',        label: 'Energy',          baseRevenue: 1.5,  volatility: 0.35, icon: '⚡', resourceReq: 'oil',         resourceWeight: 0.7 },
  { id: 'technology',    label: 'Technology',      baseRevenue: 2.0,  volatility: 0.25, icon: '💻', resourceReq: 'rareEarth',   resourceWeight: 0.4 },
  { id: 'services',      label: 'Financial Services', baseRevenue: 1.2, volatility: 0.15, icon: '🏦', resourceReq: null, resourceWeight: 0 },
  { id: 'tourism',       label: 'Tourism',         baseRevenue: 0.8,  volatility: 0.30, icon: '✈️', resourceReq: null, resourceWeight: 0 },
];

// ─── RESOURCE TYPES ──────────────────────────────────
// Each nation gets random levels of these resources.
// Resources deplete with industrial use but can recover with good env policy.
const RESOURCE_TYPES = [
  { id: 'oil',        label: 'Oil',         icon: '🛢️', basePrice: 1.0, depleteRate: 0.002 },
  { id: 'rareEarth',  label: 'Rare Earth',  icon: '🧪', basePrice: 3.5, depleteRate: 0.001 },
  { id: 'minerals',   label: 'Minerals',    icon: '⛏️', basePrice: 0.8, depleteRate: 0.003 },
  { id: 'fertileLand',label: 'Fertile Land',icon: '🌱', basePrice: 0.3, depleteRate: 0.001 },
];

const COMPANY_TYPES = [
  { id: 'startup', label: 'Startup', growthBias: 0.012, resilience: -0.01, rndBias: 0.08, capBias: 0.8 },
  { id: 'private', label: 'Private Firm', growthBias: 0.004, resilience: 0.01, rndBias: 0.03, capBias: 1.0 },
  { id: 'state', label: 'State-backed', growthBias: -0.002, resilience: 0.03, rndBias: 0.02, capBias: 1.15 },
  { id: 'cooperative', label: 'Co-op', growthBias: 0.001, resilience: 0.02, rndBias: 0.01, capBias: 0.95 },
  { id: 'multinational', label: 'Multinational', growthBias: 0.006, resilience: 0.015, rndBias: 0.05, capBias: 1.25 },
];

const SECTOR_DEMAND_BASE = {
  agriculture: 0.060,
  manufacturing: 0.085,
  energy: 0.070,
  technology: 0.045,
  services: 0.090,
  tourism: 0.030,
};

const SECTOR_TIER_RESOURCE_GATES = {
  agriculture: [0, 0, 10, 13, 16, 20, 24, 28, 32, 36, 40],
  manufacturing: [0, 0, 9, 12, 15, 18, 22, 26, 30, 34, 38],
  energy: [0, 0, 12, 15, 18, 22, 26, 30, 33, 37, 42],
  technology: [0, 0, 13, 16, 19, 23, 27, 31, 35, 39, 44],
  services: [0, 0, 8, 10, 13, 16, 20, 24, 28, 32, 36],
  tourism: [0, 0, 6, 9, 12, 15, 18, 22, 26, 30, 34],
};

const COMPANY_TIER_RESEARCH_REQUIREMENT = [0, 0, 1, 3, 6, 10, 15, 21, 28, 36, 45];

// ─── SEEDED RANDOM HELPER ────────────────────────────
function seededResourceRand(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h) + seed.charCodeAt(i);
  h = (h * 1103515245 + 12345) & 0x7fffffff;
  return () => { h = (h * 1103515245 + 12345) & 0x7fffffff; return h / 0x7fffffff; };
}

// ─── INIT NATION RESOURCES ───────────────────────────
function initNationResources(nation) {
  if (nation.resourceData) return;
  const rng = seededResourceRand(nation.id || nation.name || 'default');
  nation.resourceData = {};
  RESOURCE_TYPES.forEach(rt => {
    const base = 5 + rng() * 90;
    const jackpot = rng() > 0.9 ? base + rng() * 40 : 0;
    const level = Math.round(Math.min(base + jackpot, 100));
    nation.resourceData[rt.id] = { level, depletion: 0, produced: 0, consumed: 0 };
  });
}

function initNationMarketDynamics(nation) {
  if (nation.marketDynamics) return;
  nation.marketDynamics = { sectorDemand: {} };
  INDUSTRY_SECTORS.forEach(sector => {
    nation.marketDynamics.sectorDemand[sector.id] = clamp(90 + Math.random() * 25, 55, 145);
  });
}

function getCompanyTypeDef(typeId) {
  return COMPANY_TYPES.find(t => t.id === typeId) || COMPANY_TYPES[1];
}

function getNationCompanyTag(nation) {
  if (nation?.iso2) return String(nation.iso2).toUpperCase();
  if (!nation?.name) return 'LOCAL';
  return String(nation.name)
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 4)
    .toUpperCase() || 'LOCAL';
}

function getCompanyDisplayName(company) {
  if (!company) return 'Unknown Co';
  if (company.displayName) return company.displayName;
  if (company.baseName && company.countryTag) return company.baseName + ' ' + company.countryTag;
  return company.name || company.baseName || 'Unknown Co';
}

function pickCompanyTypeForNation(nation) {
  const gov = String(nation.governmentStyle || '');
  const weights = {
    startup: clamp((nation.education - 30) * 0.02 + 1.0, 0.4, 2.8),
    private: 1.5,
    state: (gov.includes('authoritarian') || gov.includes('dictatorship') || gov.includes('military')) ? 1.9 : 0.8,
    cooperative: clamp((nation.happiness - 40) * 0.02 + 0.9, 0.3, 2.0),
    multinational: clamp((nation.gdp - 2) * 0.04 + 0.6, 0.2, 2.4),
  };

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const t of COMPANY_TYPES) {
    roll -= weights[t.id] || 0;
    if (roll <= 0) return t.id;
  }
  return 'private';
}

function getNationResearchStrength(nation) {
  const discovered = nation.research?.discoveredTechs || [];
  const purchased = nation.research?.purchasedTechs || [];
  const allTechs = [...discovered, ...purchased];
  let weighted = 0;
  allTechs.forEach(id => {
    const tech = findTechById(id);
    weighted += tech ? clamp(tech.tier, 1, 25) : 1;
  });
  weighted += clamp((nation.techLevel || 1) * 3, 0, 40);
  return weighted;
}

function getNationUnlockedCompanyTier(nation, sectorId) {
  initNationResources(nation);
  const researchStrength = getNationResearchStrength(nation);
  const techCap = clamp(Math.floor((nation.techLevel || 1.0) + (nation.education || 0) / 25), 1, 10);
  let unlocked = 1;
  for (let tier = 1; tier <= techCap; tier++) {
    const reqResearch = COMPANY_TIER_RESEARCH_REQUIREMENT[tier] || 999;
    const reqResource = (SECTOR_TIER_RESOURCE_GATES[sectorId] || SECTOR_TIER_RESOURCE_GATES.services)[tier] || 100;
    const resourceReq = INDUSTRY_SECTORS.find(s => s.id === sectorId)?.resourceReq;
    const resourceLevel = resourceReq ? Number(nation.resourceData?.[resourceReq]?.level || 0) : Number(nation.resources || 0);
    if (researchStrength >= reqResearch && resourceLevel >= reqResource) {
      unlocked = tier;
    } else {
      break;
    }
  }
  return clamp(unlocked, 1, 10);
}

function getSectorDemandStats(nation, sectorId) {
  initNationMarketDynamics(nation);
  const baseIndex = Number(nation.marketDynamics.sectorDemand[sectorId] || 100);
  const perCapita = nation.gdp / Math.max(nation.population / 1000, 1);
  const consumerPower = clamp(perCapita * 0.55 + 0.35, 0.35, 3.5);
  const macroStability = clamp((nation.stability + nation.governance + nation.jobs) / 180, 0.55, 1.35);
  const inflationDrag = clamp(1 - Math.max(0, nation.inflation - 4) * 0.03, 0.5, 1.1);
  const globalPulse = clamp((GAME?.globalMarketIndex || 100) / 100, 0.6, 1.5);
  const populationScale = Math.max(1, nation.population || 1);
  const baseDemand = (SECTOR_DEMAND_BASE[sectorId] || 0.05) * populationScale;
  const demandDollar = Math.max(0.1, baseDemand * (baseIndex / 100) * consumerPower * macroStability * inflationDrag * globalPulse);
  return { demandIndex: baseIndex, demandDollar };
}

function estimateCompanyWorth(company) {
  const revenue = Number(company.revenue || 0);
  const profit = revenue * Number(company.profitMargin || 0);
  const tierPremium = 1 + clamp((company.techTier || 1) * 0.08, 0.05, 1.3);
  const growthPremium = 1 + clamp((company.growthRate || 0) * 2.5, -0.4, 1.4);
  const privateWorth = Math.max(0.01, profit * 26 * tierPremium * growthPremium);
  if (company.public) {
    const shares = Math.max(1, Number(company.sharesOutstanding || 50_000_000));
    const marketCap = Math.max(0.01, Number(company.stockPrice || 0.1) * shares / 1_000_000);
    return Math.max(privateWorth, marketCap);
  }
  return privateWorth;
}

// ─── GET RESOURCE MULTIPLIER FOR A SECTOR ────────────
// Returns 0.2-2.0 multiplier based on how much resource the nation has.
function getResourceMultiplier(nation, sectorId) {
  const sector = INDUSTRY_SECTORS.find(s => s.id === sectorId);
  if (!sector || !sector.resourceReq || !nation.resourceData) return 1.0;
  const res = nation.resourceData[sector.resourceReq];
  if (!res) return 1.0;
  return clamp(res.level / 50, 0.2, 2.0);
}

// ─── INIT INDUSTRIES FOR A NATION ─────────────────────

function initNationIndustries(nation) {
  const hasIndustryMap = !!nation.industries && typeof nation.industries === 'object' && Object.keys(nation.industries).length > 0;
  const hasCompaniesArray = Array.isArray(nation.companies);
  if (hasIndustryMap && hasCompaniesArray) return;
  
  nation.industries = {};
  nation.companies = [];
  nation.taxRevenue = 0;
  nation.taxCollected = 0;
  nation.informalEconomy = clamp((100 - nation.governance) * 0.3 + nation.corruption * 0.5, 5, 60);
  nation.corporateEarnings = 0;
  nation.localMarketCap = 0;
  nation.localListedCount = 0;

    // Population stock portfolio: citizens invest in public companies
    nation.populationPortfolio = nation.populationPortfolio || {
      investmentRate: clamp(2 + Math.random() * 6, 2, 8), // 2-8% of employed population invests
      totalInvested: 0, // $M
      dividendReceived: 0, // $M per month
      stockHoldings: {}, // companyId -> { shares: 1000000, averageCost: 50 }
      history: [], // track price history
    };
  
    // Company cross-investments
    nation.companyInvestments = nation.companyInvestments || {}; // investorCompanyId -> { targetCompanyId -> shares }
  
  initNationMarketDynamics(nation);
  
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
  initNationResources(nation);
  initNationMarketDynamics(nation);
  
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
  
  const baseCompaniesPerTurn = clamp(eduFactor * popFactor * govBusinessFactor * govFactor * 0.25, 0.1, 6);
  
  // If initial, generate a stock of companies
  const initialCount = initial ? Math.round(baseCompaniesPerTurn * 8 + Math.random() * 5) : (Math.random() < baseCompaniesPerTurn ? 1 : 0);
  
  // Count research for sector distribution bonuses
  const allDisc = nation.research?.discoveredTechs || [];
  const allPurch = nation.research?.purchasedTechs || [];
  const allResTechs = [...allDisc, ...allPurch];
  let compTechs = 0, powerTechs = 0;
  allResTechs.forEach(id => {
    const t = findTechById(id);
    if (!t) return;
    if (t.branch === 'computing') compTechs++;
    else if (t.branch === 'power' || t.branch === 'nuclear') powerTechs++;
  });

  // Distribute by education level (low edu = mostly agriculture, high edu = mostly tech)
  // Research shifts distribution toward related sectors
  const sectorWeights = {};
  if (edu < 25) {
    sectorWeights.agriculture = 0.50; sectorWeights.manufacturing = 0.20;
    sectorWeights.energy = 0.10 + powerTechs * 0.002;       sectorWeights.technology = 0.02 + compTechs * 0.002;
    sectorWeights.services = 0.08;     sectorWeights.tourism = 0.10;
  } else if (edu < 45) {
    sectorWeights.agriculture = 0.30; sectorWeights.manufacturing = 0.30;
    sectorWeights.energy = 0.12 + powerTechs * 0.002;       sectorWeights.technology = 0.05 + compTechs * 0.003;
    sectorWeights.services = 0.13;     sectorWeights.tourism = 0.10;
  } else if (edu < 65) {
    sectorWeights.agriculture = 0.15; sectorWeights.manufacturing = 0.25;
    sectorWeights.energy = 0.15 + powerTechs * 0.002;       sectorWeights.technology = 0.15 + compTechs * 0.004;
    sectorWeights.services = 0.18;     sectorWeights.tourism = 0.12;
  } else {
    sectorWeights.agriculture = 0.05; sectorWeights.manufacturing = 0.15;
    sectorWeights.energy = 0.10 + powerTechs * 0.001;       sectorWeights.technology = 0.30 + compTechs * 0.005;
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
    const baseName = namePool[Math.floor(Math.random() * namePool.length)];
    const countryTag = getNationCompanyTag(nation);
    const companyName = baseName + ' ' + countryTag;
    
    // Skip if duplicate name
    if (nation.companies.some(c => c.baseName === baseName || c.name === companyName)) continue;
    
    const baseRevenue = (INDUSTRY_SECTORS.find(s => s.id === chosenSector)?.baseRevenue || 1.0);
    // Company revenue: resource availability × tech × edu × market size
    const resourceMult = getResourceMultiplier(nation, chosenSector);
    const demandStats = getSectorDemandStats(nation, chosenSector);
    const marketSizeFactor = clamp(nation.population / 100, 0.3, 3.0);
    const demandLift = clamp(demandStats.demandDollar / Math.max(1, marketSizeFactor * 2.5), 0.45, 3.5);
    const revenue = baseRevenue * sizeMultiplier * (0.5 + Math.random()) * clamp(tech / 5, 0.2, 2.5) * marketSizeFactor * resourceMult * demandLift;
    const employees = Math.round(revenue * (20 + Math.random() * 30) * (1 + eduFactor * 0.2));
    const companyType = pickCompanyTypeForNation(nation);
    const typeDef = getCompanyTypeDef(companyType);
    const maxTier = getNationUnlockedCompanyTier(nation, chosenSector);
    const startTier = clamp(1 + Math.floor(Math.random() * Math.max(1, Math.min(3, maxTier))), 1, 10);
    const sharesOutstanding = (8 + Math.floor(Math.random() * 260)) * 1_000_000;
    
    const company = {
      id: nation.id + '_comp_' + nation.companies.length,
      baseName,
      countryTag,
      displayName: companyName,
      name: companyName,
      sector: chosenSector,
      companyType,
      size: size,
      revenue: Math.max(0.05, revenue), // $M per month
      employees: clamp(employees, 1, 50000),
      taxPaid: 0,
      founded: GAME?.turn || 0,
      stockPrice: sizeMultiplier > 2 ? (10 + Math.random() * 90) : 0,
      sharesOutstanding,
      marketCap: 0,
      public: size === 'corporation' && Math.random() > 0.4,
      stockChangePct: 0,
      growthRate: clamp((Math.random() - 0.2) * 0.05 + typeDef.growthBias, -0.08, 0.25),
      profitMargin: clamp((0.06 + Math.random() * 0.12) * govFactor * (0.95 + typeDef.capBias * 0.1), 0.02, 0.40),
      techTier: startTier,
      techProgress: 0,
      breakthroughs: 0,
      moat: clamp(0.9 + Math.random() * 0.6, 0.8, 2.0),
      distressMonths: 0,
      strategicFocus: chosenSector, // company knows what sector it's in
      worth: 0,
      // Dividend & investor tracking
      profitDistributed: 0, // $M per month to dividends
      priceHistory: [], // track stock price over time
      populationOwnedShares: 0, // citizen ownership
      companyOwnedShares: 0, // other companies' ownership
    };
    company.worth = estimateCompanyWorth(company);
    
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
  const gdpMonthly = (gdp * 1_000_000) / 12; // $M per month (GDP in $T → $M monthly)
  
  // ── GDP PER CAPITA ADJUSTMENT ──
  // Wealthier populations = more income tax per person
  const gdpPerCapita = gdp / (nation.population / 1000);
  const incomeMultiplier = clamp(gdpPerCapita * 0.5 + 0.3, 0.5, 2.5);
  // Employment quality amplifies income tax (employed people actually pay)
  const employmentFactor = clamp(nation.jobs / 55, 0.3, 1.5);
  
  // Tax base is GDP-based + corporate earnings
  const corporateBase = gdpMonthly * 0.4;
  const incomeBase = gdpMonthly * 0.5 * incomeMultiplier * employmentFactor;
  const consumptionBase = gdpMonthly * 0.3;
  const tradeBase = gdpMonthly * 0.1;
  
  // Efficiency: corruption and informal economy reduce collection
  const efficiency = taxConfig.efficiency * (1 - nation.corruption / 200) * clamp(1 - nation.informalEconomy / 100, 0.4, 1.0);
  
  const corpTax = corporateBase * taxConfig.corp * efficiency;
  const incomeTax = incomeBase * taxConfig.income * efficiency;
  const vatTax = consumptionBase * taxConfig.vat * efficiency;
  const tariffTax = tradeBase * taxConfig.tariff * efficiency;
  
  const totalTax = corpTax + incomeTax + vatTax + tariffTax;
  
  return {
    total: totalTax,
    breakdown: { corp: corpTax, income: incomeTax, vat: vatTax, tariff: tariffTax },
    efficiency: efficiency,
    rates: taxConfig
  };
}

// ─── POPULATION STOCK INVESTMENTS ─────────────────────

function updatePopulationStockInvestments(nation) {
  initNationIndustries(nation);
  const portfolio = nation.populationPortfolio;
  
  // Calculate investment capacity: (employed population) * (investment rate %) * (disposable income)
  const employedPop = nation.population * Math.max(0, nation.jobs / 100); // millions
  const investmentCapacity = employedPop * (portfolio.investmentRate / 100) * 0.0005; // $M per month
  
  const publicCompanies = nation.companies.filter(c => c.public);
  if (publicCompanies.length === 0) return;
  
  // Redistribute portfolio to match sector preferences + company fundamentals
  const targetAllocation = {}; // companyId -> % to hold
  let totalScore = 0;
  
  publicCompanies.forEach(c => {
    // Score: profit margin (quality) + tech tier (growth) - volatility (risk)
    const score = (c.profitMargin || 0) * 3 + (c.techTier || 1) * 0.5 + (c.growthRate || 0) * 2;
    targetAllocation[c.id] = Math.max(0.1, score);
    totalScore += targetAllocation[c.id];
  });
  
  // Normalize to percentages
  Object.keys(targetAllocation).forEach(cid => {
    targetAllocation[cid] = targetAllocation[cid] / Math.max(0.1, totalScore);
  });
  
  // Buy/sell to rebalance portfolio monthly (5-10% rebalancing pace)
  const rebalancingPace = 0.075;
  publicCompanies.forEach(c => {
    const holdingShares = portfolio.stockHoldings[c.id]?.shares || 0;
    const targetValue = investmentCapacity * targetAllocation[c.id];
    const targetShares = targetValue / Math.max(0.01, c.stockPrice || 0.1);
    
    const shareDelta = (targetShares - holdingShares) * rebalancingPace;
    if (Math.abs(shareDelta) > 100000) {
      if (!portfolio.stockHoldings[c.id]) {
        portfolio.stockHoldings[c.id] = { shares: 0, averageCost: c.stockPrice || 0 };
      }
      portfolio.stockHoldings[c.id].shares += shareDelta;
      portfolio.totalInvested += shareDelta * (c.stockPrice || 0);
      c.populationOwnedShares += shareDelta;
    }
  });
}

// ─── DIVIDEND PROCESSING ──────────────────────────────

function processDividends(nation) {
  const portfolio = nation.populationPortfolio;
  portfolio.dividendReceived = 0;
  
  nation.companies.forEach(c => {
    // Companies distribute 30-50% of profit as dividend
    const profit = (c.revenue || 0) * (c.profitMargin || 0);
    const dividendPayout = profit * clamp(0.3 + (c.techTier || 1) * 0.04, 0.3, 0.5);
    c.profitDistributed = dividendPayout;
    
    // Distribute to shareholders (population + company investors)
    const totalShares = (c.sharesOutstanding || 1);
    const perShareDividend = dividendPayout / Math.max(1, totalShares);
    
    // Population dividend
    const popShares = portfolio.stockHoldings[c.id]?.shares || 0;
    const popDividend = popShares * perShareDividend;
    portfolio.dividendReceived += popDividend;
    
    // Company-to-company dividend (via cross-investments)
    if (nation.companyInvestments) {
      Object.entries(nation.companyInvestments).forEach(([investorId, holdings]) => {
        const shares = Number(holdings?.[c.id] || 0);
        if (!shares) return;
        const investorCo = nation.companies.find(comp => comp.id === investorId);
        if (investorCo) {
          investorCo.revenue = (investorCo.revenue || 0) + shares * perShareDividend * 0.8; // 80% goes to revenue
        }
      });
    }
  });
  
  // Add dividend to nation treasury/employment income (citizens feel wealthier, boost consumption)
  const isPlayer = nation.id === GAME.playerNation?.id;
  if (!isPlayer && nation.treasury !== undefined) {
    nation.treasury += portfolio.dividendReceived * 0.5; // Half to treasury, half circulates economy
  }
}

// ─── STOCK PRICE UPDATES ──────────────────────────────

function updateCompanyStockPrices(nation) {
  nation.companies.forEach(c => {
    if (!c.public) return;
    
    // Price drivers: earnings, growth momentum, sector demand, tech tier
    const earningsYield = (c.profitMargin || 0) * 0.3 + (c.growthRate || 0) * 1.5;
    const sectorDemand = nation.marketDynamics?.sectorDemand?.[c.sector] || 100;
    const demandSignal = (sectorDemand - 100) / 100 * 0.05;
    const tierSignal = ((c.techTier || 1) - 1) * 0.01;
    const volatility = (Math.random() - 0.5) * 0.08;
    
    // Price change: +/- 5% per month max
    const priceChange = earningsYield + demandSignal + tierSignal + volatility;
    const newPrice = Math.max(0.5, (c.stockPrice || 1) * (1 + clamp(priceChange, -0.05, 0.05)));
    
    c.stockChangePct = ((newPrice - (c.stockPrice || 1)) / Math.max(0.1, c.stockPrice || 1)) * 100;
    c.stockPrice = newPrice;
    
    // Track price history (last 24 months)
    if (!c.priceHistory) c.priceHistory = [];
    c.priceHistory.push(c.stockPrice);
    if (c.priceHistory.length > 24) c.priceHistory.shift();
  });
}

// ─── COMPANY CROSS-INVESTMENTS ────────────────────────

function updateCompanyInvestments(nation) {
  if (nation.companies.length < 2) return;
  
  if (!nation.companyInvestments) nation.companyInvestments = {};
  
  // Every 3 turns, companies strategically invest in peers (diversification + synergy)
  if ((GAME?.turn || 0) % 3 !== 0) return;
  
  nation.companies.forEach(investor => {
    if (!investor.public || investor.profitMargin < 0.05) return; // Only profitable public companies invest
    const investmentBudget = (investor.revenue || 0) * 0.02;
    const candidates = nation.companies.filter(target =>
      target !== investor &&
      target.sector !== investor.sector &&
      target.public &&
      Math.random() > 0.7
    );

    if (candidates.length === 0) return;
    const target = candidates[Math.floor(Math.random() * candidates.length)];

    const sharesToBuy = Math.min(
      Math.floor(investmentBudget / Math.max(0.1, target.stockPrice || 0)),
      Math.floor((target.sharesOutstanding || 0) * 0.02)
    );

    if (sharesToBuy < 10000) return;

    if (!nation.companyInvestments[investor.id]) nation.companyInvestments[investor.id] = {};
    nation.companyInvestments[investor.id][target.id] = (nation.companyInvestments[investor.id][target.id] || 0) + sharesToBuy;
    target.companyOwnedShares += sharesToBuy;
  });
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
    nation.taxRevenue = taxData.total;
    nation.taxCollected = (nation.taxCollected || 0) + taxData.total;
    
    // 4. Update GDP growth with FIXED rate
    updateNationGDP(nation, taxData);
    
    // 5. Update stock market
    updateNationStockMarket(nation);
    
    // 6. Update informal economy
    updateInformalEconomy(nation);
    
    // 7. Update corporate earnings tracking
    updateCorporateEarnings(nation);
    
    // ── NATION TREASURY (AI nations) ──
    // Player treasury is handled by applyPlayerTreasuryFromTaxes() with player budget sliders.
    const isPlayerNation = nation.id === GAME.playerNation?.id;
    if (!isPlayerNation) {
      if (nation.treasury === undefined) nation.treasury = taxData.total * 2;

      const govBudget = nation.aiBudget || { military: 20, economy: 15, diplomacy: 10, intelligence: 10, space: 5, social: 20 };
      const totalBudgetPct = govBudget.military + govBudget.economy + govBudget.diplomacy + govBudget.intelligence + govBudget.space + govBudget.social;
      const spendingMultiplier = taxData.total / Math.max(totalBudgetPct, 1);

      const govSpending = (
        govBudget.military * spendingMultiplier * 1.2 +
        govBudget.economy * spendingMultiplier * 1.0 +
        govBudget.diplomacy * spendingMultiplier * 0.8 +
        govBudget.intelligence * spendingMultiplier * 0.7 +
        govBudget.space * spendingMultiplier * 0.9 +
        govBudget.social * spendingMultiplier * 1.1
      );

      // Debt service (% of tax revenue based on debt ratio, realistic ~2-5% of revenue)
      const debtService = taxData.total * (nation.debtRatio || 40) * 0.0005;
      const totalExpenses = govSpending + debtService;

      // Revenue includes taxes + actual company tax paid (companyTaxPaid is in $M)
      let companyTaxCollected = 0;
      nation.companies.forEach(c => { companyTaxCollected += c.taxPaid || 0; });
      const totalRevenue = taxData.total + companyTaxCollected;

      nation.treasury += Math.round(totalRevenue - totalExpenses);
      nation.treasury = Math.max(0, nation.treasury);

      const deficitChange = (totalExpenses - totalRevenue) / (nation.gdp * 1_000_000 / 12 || 1);
      nation.deficit = clamp(
        (nation.deficit || 0) + deficitChange * 0.5,
        -12, 35
      );
    }
  });
  
  // 8. Apply player treasury from taxes (player still uses GAME.treasury)
  applyPlayerTreasuryFromTaxes();
}

// ─── UPDATE COMPANIES ─────────────────────────────────

function updateNationCompanies(nation) {
  initNationResources(nation);
  initNationMarketDynamics(nation);
  const edu = nation.education;
  const tech = nation.techLevel;
  const resources = nation.resources;
  const energySecurity = nation.energySecurity;
  const govFactor = (getGovernmentProfile(nation.governmentStyle)?.econBoost || 1.0);
  
  // Count discovered techs per branch for research-driven bonuses
  const allDiscovered = nation.research?.discoveredTechs || [];
  const allPurchased = nation.research?.purchasedTechs || [];
  const allTechs = [...allDiscovered, ...allPurchased];
  let compTechCount = 0, powerTechCount = 0, medTechCount = 0, nukeTechCount = 0;
  allTechs.forEach(id => {
    const t = findTechById(id);
    if (!t) return;
    if (t.branch === 'computing') compTechCount++;
    else if (t.branch === 'power') powerTechCount++;
    else if (t.branch === 'medicine') medTechCount++;
    else if (t.branch === 'nuclear') nukeTechCount++;
  });
  
  // Research multiplier per sector (tech discoveries boost the sector)
  const researchMult = {
    energy:       1 + clamp(powerTechCount + nukeTechCount, 0, 20) * 0.01,
    technology:   1 + clamp(compTechCount, 0, 20) * 0.015,
    manufacturing:1 + clamp(compTechCount, 0, 20) * 0.005,
    agriculture:  1 + clamp(medTechCount, 0, 20) * 0.008,
    services:     1 + clamp(compTechCount, 0, 20) * 0.004,
    tourism:      1 + 0,
  };
  
  // Resource & energy bottleneck factors
  const resourceFactor = clamp(resources / 50, 0.3, 1.5);
  const energyFactor = clamp(energySecurity / 45, 0.3, 1.5);
  
  // ── RESOURCE DEPLETION & CONSUMPTION ──
  // Resource-consuming sectors deplete the resource each turn
  RESOURCE_TYPES.forEach(rt => {
    const data = nation.resourceData[rt.id];
    if (!data) return;
    // Natural depletion (tiny)
    data.depletion = Math.max(0, data.depletion - rt.depleteRate * 0.1);
    // Slow recovery toward base level (environment matters)
    const targetLevel = 5 + (data.level + data.depletion) * 0.98;
    data.level = clamp(data.level + (targetLevel - data.level) * 0.005 + (nation.environment - 50) * 0.003, 1, 100);
    data.produced = 0;
    data.consumed = 0;
  });
  
  const companiesToRemove = [];
  const strugglingCompanies = [];
  const sectorCompanyCounts = {};
  const sectorSupplyRevenue = {};
  const sectorTypeCounts = {};
  const sectorRDLeaders = {}; // Track highest-tier companies per sector for spillover
  
  nation.companies.forEach(company => {
    sectorCompanyCounts[company.sector] = (sectorCompanyCounts[company.sector] || 0) + 1;
    sectorSupplyRevenue[company.sector] = (sectorSupplyRevenue[company.sector] || 0) + Number(company.revenue || 0);
    const typeKey = company.sector + '::' + (company.companyType || 'private');
    sectorTypeCounts[typeKey] = (sectorTypeCounts[typeKey] || 0) + 1;
    
    // Track highest-tier company per sector
    const currentLeader = sectorRDLeaders[company.sector];
    if (!currentLeader || Number(company.techTier || 1) > Number(currentLeader.techTier || 1)) {
      sectorRDLeaders[company.sector] = company;
    }
  });
  
  INDUSTRY_SECTORS.forEach(sector => {
    const current = Number(nation.marketDynamics.sectorDemand[sector.id] || 100);
    const perCapita = nation.gdp / Math.max(nation.population / 1000, 1);
    const demandTarget = clamp(
      75 + perCapita * 7 + (nation.stability - 50) * 0.4 + (nation.jobs - 50) * 0.35 - Math.max(0, nation.inflation - 5) * 2.4,
      40,
      220
    );
    nation.marketDynamics.sectorDemand[sector.id] = clamp(
      current + (demandTarget - current) * 0.08 + (Math.random() - 0.5) * 4,
      35,
      240
    );
  });
  
  nation.companies.forEach(company => {
    // Resource multiplier: how much resource availability boosts this company
    const resourceMult = getResourceMultiplier(nation, company.sector);
    
    // Research multiplier for this sector
    const rMult = researchMult[company.sector] || 1.0;
    const typeDef = getCompanyTypeDef(company.companyType);
    const demandStats = getSectorDemandStats(nation, company.sector);
    const sectorSupply = Math.max(0.1, sectorSupplyRevenue[company.sector] || 0.1);
    const supplyRatio = sectorSupply / Math.max(demandStats.demandDollar, 0.1);
    const demandPriceMult = clamp(1 + (1 - supplyRatio) * 0.45, 0.45, 1.9);
    const sectorCount = sectorCompanyCounts[company.sector] || 1;
    const sameTypeCount = sectorTypeCounts[company.sector + '::' + (company.companyType || 'private')] || 1;
    const competitionPenalty = clamp(Math.max(0, sectorCount - 7) * 0.004 + Math.max(0, sameTypeCount - 3) * 0.003, 0, 0.16);
    const marketPower = clamp((company.moat || 1.0) * (1 + (company.techTier || 1) * 0.03), 0.65, 2.5);
    
    // Sector-specific revenue modifiers from resources & research
    let sectorBonus = 0;
    if (company.sector === 'energy') {
      sectorBonus = (resourceFactor - 1) * 0.008;
      sectorBonus += clamp(nukeTechCount + powerTechCount, 0, 15) * 0.0008;
    } else if (company.sector === 'technology') {
      sectorBonus = clamp(compTechCount, 0, 20) * 0.0008;
    } else if (company.sector === 'manufacturing') {
      sectorBonus = (resourceFactor - 1) * 0.004;
    } else if (company.sector === 'agriculture') {
      sectorBonus = (resourceFactor - 1) * 0.002;
    } else if (company.sector === 'services' || company.sector === 'tourism') {
      sectorBonus = clamp(compTechCount, 0, 20) * 0.0004;
    }
    sectorBonus = clamp(sectorBonus, -0.015, 0.015);
    
    // Energy bottleneck: low energy security drags ALL companies
    const energyDrag = energySecurity < 40 ? clamp((energySecurity - 40) * 0.0003, -0.012, 0) : 0;
    
    // Sector R&D spillover: if a leader in this sector is at T3+, smaller companies get +5% R&D
    let spilloverBonus = 0;
    const sectorLeader = sectorRDLeaders[company.sector];
    if (sectorLeader && Number(sectorLeader.techTier || 1) >= 3 && company !== sectorLeader) {
      const tierGap = Number(sectorLeader.techTier || 1) - Number(company.techTier || 1);
      spilloverBonus = clamp(tierGap * 0.02, 0.05, 0.15); // Leaders help the sector
    }
    
    // Company growth/decline — now resource & research aware + spillover
    const innovationBonus = company.sector === 'technology' ? clamp((tech - 3) * 0.002, 0, 0.01) : 0;
    const eduBonus = clamp((edu - 30) * 0.0002, -0.005, 0.005);
    const randomShock = (Math.random() - 0.5) * 0.03;
    
    company.growthRate = clamp(company.growthRate + innovationBonus + eduBonus + sectorBonus + energyDrag + randomShock * 0.1 + typeDef.growthBias + spilloverBonus * 0.08, -0.16, 0.35);
    
    // REVENUE: base × growth × resource multiplier × research multiplier
    // This is the core supply chain: resources × tech × edu = output
    const baseRevenueBefore = company.revenue;
    company.revenue = Math.max(0.0005, company.revenue * (1 + company.growthRate) * resourceMult * rMult * demandPriceMult * marketPower * (1 - competitionPenalty));
    
    // Track resource consumption: resource-using sectors consume resources
    const sectorDef = INDUSTRY_SECTORS.find(s => s.id === company.sector);
    if (sectorDef && sectorDef.resourceReq && nation.resourceData[sectorDef.resourceReq]) {
      const consumed = company.revenue * 0.01 * sectorDef.resourceWeight;
      nation.resourceData[sectorDef.resourceReq].consumed += consumed;
      nation.resourceData[sectorDef.resourceReq].depletion += consumed * 0.001;
    }
    
    // Resource-producing sectors (energy→oil, tech→rareEarth, etc.) produce resources
    const prodResMap = { energy: 'oil', technology: 'rareEarth', manufacturing: 'minerals', agriculture: 'fertileLand' };
    const produces = prodResMap[company.sector];
    if (produces && nation.resourceData[produces]) {
      const produced = company.revenue * 0.008 * clamp(tech / 5, 0.3, 2.0) * clamp(edu / 50, 0.3, 1.5);
      nation.resourceData[produces].produced += produced;
      nation.resourceData[produces].level = clamp(nation.resourceData[produces].level + produced * 0.001, 1, 100);
    }
    
    company.employees = Math.round(company.employees * (1 + company.growthRate * 0.4));
    company.employees = clamp(company.employees, 1, 50000);

    // Company tech progress with strategic tier focus
    const unlockedTier = getNationUnlockedCompanyTier(nation, company.sector);
    const tier = clamp(Number(company.techTier || 1), 1, 10);
    const nextTier = Math.min(10, tier + 1);
    // MUCH cheaper tier progression: base 10 + (tier-1)*8 = realistic advancement path
    const tierDifficulty = 10 + (nextTier - 1) * 8;
    const resourceReq = INDUSTRY_SECTORS.find(s => s.id === company.sector)?.resourceReq;
    const resourceLevel = resourceReq ? Number(nation.resourceData?.[resourceReq]?.level || 0) : Number(nation.resources || 0);
    const resourceGate = (SECTOR_TIER_RESOURCE_GATES[company.sector] || SECTOR_TIER_RESOURCE_GATES.services)[nextTier] || 100;
    // Companies with strategic focus spend 3-5x more on R&D
    const focusBonus = company.strategicFocus === company.sector ? 3.0 : 1.0;
    const rndInvestment = Math.max(0, company.revenue * (0.015 + typeDef.rndBias * 0.04) * focusBonus);
    company.techProgress = Number(company.techProgress || 0) + rndInvestment * clamp((edu + tech * 8 + nation.governance) / 170, 0.4, 1.6);
    const breakthroughChance = clamp(0.003 + (typeDef.rndBias * 0.004) + (nation.education - 40) * 0.00004 + (company.techTier || 1) * -0.0001, 0.0008, 0.025);
    const canAdvance = tier < unlockedTier && resourceLevel >= resourceGate && company.techProgress >= tierDifficulty;
    if (canAdvance && Math.random() < breakthroughChance) {
      company.techTier = tier + 1;
      company.breakthroughs = Number(company.breakthroughs || 0) + 1;
      company.techProgress = Math.max(0, company.techProgress - tierDifficulty * 0.7);
      company.strategicFocus = company.sector; // lock in focus after breakthrough
      addNews(`🚀 ${company.name} (${nation.name}) breaks through to T${company.techTier}! Strategic focus: ${company.sector}`, 'minor');
    }

    // Profitability: tech tier and moat provide pricing power
    const tierPricingPower = clamp((company.techTier || 1) * 0.015, 0.015, 0.12);
    const moatPricingPower = clamp((company.moat || 1 - 1) * 0.06, 0, 0.15);
    const marginDrift = (demandPriceMult - 1) * 0.025 - competitionPenalty * 0.15 - Math.max(0, nation.inflation - 5) * 0.001;
    company.profitMargin = clamp(
      Number(company.profitMargin || 0.08) + marginDrift + typeDef.resilience * 0.015 + tierPricingPower + moatPricingPower,
      0.02, 0.50
    );

    // Distress and bankruptcy logic — companies survive longer if they innovate
    const innovationDefense = (company.techTier || 1) > 2 ? 0.5 : 1.0; // Higher tier = resilience
    const isDistressed = company.revenue < 0.03 || company.profitMargin < 0.015 || (company.growthRate < -0.08 && supplyRatio > 1.4);
    company.distressMonths = isDistressed ? (Number(company.distressMonths || 0) + 1) : Math.max(0, Number(company.distressMonths || 0) - 1);
    const collapseRisk = clamp(
      ((company.distressMonths - 6) * 0.025 + (0.025 - company.profitMargin) * 0.6) * innovationDefense,
      0, 0.75
    );
    if (company.distressMonths >= 5) strugglingCompanies.push(company);
    
    // Update sector totals
    const sector = nation.industries[company.sector];
    if (sector) {
      sector.totalRevenue = Math.max(0, sector.totalRevenue - baseRevenueBefore + company.revenue);
      sector.totalEmployees += company.employees - Math.round(company.employees / (1 + company.growthRate * 0.5)) || 0;
    }
    
    // Company death (bankruptcy) — harder to kill if innovative
    const isHighTier = (company.techTier || 1) >= 3;
    const collapseThreshold = isHighTier ? 8 : 7;
    if ((company.distressMonths > collapseThreshold && Math.random() < collapseRisk) || (company.growthRate < -0.14 && Math.random() < 0.08)) {
      companiesToRemove.push(company);
    }
    
    // Company growth: small → medium → large → corporation (faster if high-growth)
    const sizeGrowthMult = clamp(1 + company.growthRate * 3, 0.8, 2.2); // growth rate amplifies size upgrade odds
    if (company.size === 'small' && company.revenue > 5 && Math.random() < 0.08 * sizeGrowthMult) {
      company.size = 'medium';
      addNews(`📊 ${getCompanyDisplayName(company)} (${nation.name}) expands to medium business`, 'minor');
    } else if (company.size === 'medium' && company.revenue > 18 && Math.random() < 0.06 * sizeGrowthMult) {
      company.size = 'large';
      addNews(`📈 ${getCompanyDisplayName(company)} (${nation.name}) becomes a large enterprise`, 'minor');
    } else if (company.size === 'large' && company.revenue > 50 && Math.random() < 0.04 * sizeGrowthMult) {
      company.size = 'corporation';
      if (!company.public && Math.random() > 0.4) {
        company.public = true;
        company.stockPrice = 15 + Math.random() * 85;
        company.sharesOutstanding = company.sharesOutstanding || ((15 + Math.floor(Math.random() * 235)) * 1_000_000);
        addNews(`📈 ${getCompanyDisplayName(company)} (${nation.name}) goes public at $${company.stockPrice.toFixed(0)}/share`, 'minor');
      }
    }
    
    // Compute tax paid
    const taxConfig = TAX_BY_GOVERNMENT[nation.governmentStyle] || TAX_BY_GOVERNMENT.federal_republic;
    const effectiveRate = company.public ? taxConfig.corp * 1.1 : taxConfig.corp;
    company.taxPaid = company.revenue * effectiveRate * (1 - nation.corruption / 200);
    company.worth = estimateCompanyWorth(company);
  });

  // Competitive consolidation: distressed firms can be merged/acquired by stronger rivals.
  strugglingCompanies
    .sort((a, b) => Number(b.distressMonths || 0) - Number(a.distressMonths || 0))
    .forEach(target => {
      if (companiesToRemove.includes(target)) return;
      const buyers = nation.companies
        .filter(candidate =>
          candidate !== target &&
          candidate.sector === target.sector &&
          !companiesToRemove.includes(candidate) &&
          Number(candidate.revenue || 0) > Number(target.revenue || 0) * 1.2 && // Lowered barrier
          Number(candidate.techTier || 1) >= Number(target.techTier || 1) - 1 // Allow slight tech mismatches
        )
        .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0));

      const buyer = buyers[0];
      if (!buyer) return;
      
      // Higher tech match = higher acquisition incentive
      const techSynergy = Number(buyer.techTier || 1) === Number(target.techTier || 1) ? 1.4 : 1.0;
      const buyoutChance = clamp(
        0.18 + Number(target.distressMonths || 0) * 0.06 + 
        (Number(buyer.revenue || 0) / Math.max(1, Number(target.revenue || 0))) * 0.03 +
        techSynergy * 0.08,
        0.12, 0.85
      );
      if (Math.random() > buyoutChance) return;

      // Merger synergies: revenue consolidation improved
      const mergerSynergy = 1 + techSynergy * 0.12; // up to 15% revenue uplift from tech synergy
      buyer.revenue = Math.max(0.1, Number(buyer.revenue || 0) + Number(target.revenue || 0) * 0.7 * mergerSynergy);
      buyer.employees = clamp(Math.round(Number(buyer.employees || 0) + Number(target.employees || 0) * 0.72), 1, 250000);
      
      // R&D spillover: acquire target's tech progress
      if (Number(target.techProgress || 0) > 0) {
        const spillover = Math.max(0, Number(target.techProgress || 0) * 0.35);
        buyer.techProgress = Number(buyer.techProgress || 0) + spillover;
      }
      
      // Moat improvement from consolidation
      buyer.moat = clamp(Number(buyer.moat || 1) + 0.12 + techSynergy * 0.1, 0.8, 3.5);
      
      // Strategic focus stays with buyer, or consolidates if matched
      if (Number(buyer.techTier || 1) > Number(target.techTier || 1)) {
        buyer.strategicFocus = buyer.strategicFocus || buyer.sector;
      }
      
      buyer.worth = estimateCompanyWorth(buyer);

      companiesToRemove.push(target);
      addNews(`🤝 ${getCompanyDisplayName(buyer)} acquires ${getCompanyDisplayName(target)} in ${nation.name} (R&D spillover +${Math.round((spillover || 0) * 10)})`, 'minor');
    });
  
  // Remove dead companies
  const uniqueRemovals = [...new Set(companiesToRemove)];
  uniqueRemovals.forEach(dead => {
    const idx = nation.companies.indexOf(dead);
    if (idx > -1) {
      nation.companies.splice(idx, 1);
      if (Math.random() < 0.35) {
        addNews(`💥 ${getCompanyDisplayName(dead)} declared bankruptcy in ${nation.name}`, 'minor');
      }
    }
  });

  // Rebuild sector totals after bankruptcies and acquisitions.
  Object.keys(nation.industries || {}).forEach(sectorId => {
    if (!nation.industries[sectorId]) return;
    nation.industries[sectorId].companyCount = 0;
    nation.industries[sectorId].totalRevenue = 0;
    nation.industries[sectorId].totalEmployees = 0;
  });
  nation.companies.forEach(company => {
    const sector = nation.industries?.[company.sector];
    if (!sector) return;
    sector.companyCount += 1;
    sector.totalRevenue += Number(company.revenue || 0);
    sector.totalEmployees += Number(company.employees || 0);
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
  
  // ── COMPANY REVENUE → GDP CONTRIBUTION ──
  // Total company revenue ($M) scales GDP proportionally.
  // GDP is in $T, so $1T = 1,000,000M. Company revenue boost = revenue / 1,000,000.
  let totalCompanyRevenue = 0;
  let sectorGrowth = 0;
  INDUSTRY_SECTORS.forEach(sector => {
    const data = nation.industries[sector.id];
    if (data) {
      totalCompanyRevenue += data.totalRevenue || 0;
      sectorGrowth += (data.growthRate || 0) * 0.3;
    }
  });
  sectorGrowth = clamp(sectorGrowth, -0.008, 0.012);
  
  // Company activity directly adds to GDP (revenue in $M, GDP in $T)
  // Every $1M company revenue = tiny GDP increment. Cap at 0.3% GDP boost/mo.
  const companyGDPBoost = clamp(totalCompanyRevenue / 1_000_000 * 0.5, 0, 0.003);
  
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
  // ── RESOURCE ABUNDANCE / BOTTLENECK ──
  const resourcePenalty = nation.resources < 35
    ? clamp((35 - nation.resources) * 0.00015, 0, 0.005) : 0;
  const resourceBonus = nation.resources > 65
    ? clamp((nation.resources - 65) * 0.0001, 0, 0.003) : 0;
  // ── ENERGY BOTTLENECK ──
  const energyPenalty = nation.energySecurity < 35
    ? clamp((35 - nation.energySecurity) * 0.00012, 0, 0.004) : 0;
  
  // ── TAX DRAG (higher taxes slightly reduce growth) ──
  const taxDrag = taxData.rates.corp * 0.002 + taxData.rates.income * 0.001;
  
  // ── GDP PER CAPITA TAX POWER ──
  // Wealthier populations = stronger income tax base
  const gdpPerCapita = nation.gdp / (nation.population / 1000); // $T per million people
  const incomeTaxPower = clamp(gdpPerCapita * 0.5, 0.5, 3.0);
  // Higher employment = more people paying tax
  const employmentQuality = clamp(nation.jobs / 60, 0.3, 1.5);
  // GDP per capita flows back into tax revenue via consumption
  const populationTaxPower = clamp((incomeTaxPower * employmentQuality - 1) * 0.001, -0.003, 0.005);
  
  // ── GDP GROWTH RATE ──
  const rawGrowth = 
    baseGrowth + innovationEngine + productivityEngine +
    sectorGrowth + companyGDPBoost + catchUpGrowth + populationTaxPower -
    inflationPenalty - debtPenalty - inequalityPenalty -
    corruptionPenalty - warPenalty - recessionPenalty - taxDrag -
    resourcePenalty - energyPenalty + resourceBonus;
  
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
  
  nation.stockMarket = Math.max(15, (nation.stockMarket || 100) + change);
  
  // Update individual stock prices
  publicCompanies.forEach(company => {
    const sectorVolatility = (INDUSTRY_SECTORS.find(s => s.id === company.sector)?.volatility || 0.2);
    const prev = Math.max(0.1, Number(company.stockPrice || 0.1));
    const move = (change / 100) + (Math.random() - 0.5) * sectorVolatility * 0.1 + clamp((company.growthRate || 0) * 0.5, -0.08, 0.12);
    company.stockPrice = Math.max(0.1, prev * (1 + move));
    company.stockChangePct = ((company.stockPrice - prev) / prev) * 100;
    const shares = Math.max(1, Number(company.sharesOutstanding || 50_000_000));
    company.marketCap = company.stockPrice * shares / 1_000_000;
    company.worth = estimateCompanyWorth(company);
  });

  nation.localListedCount = publicCompanies.length;
  nation.localMarketCap = publicCompanies.reduce((sum, c) => sum + Math.max(0, Number(c.marketCap || 0)), 0);
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
  
  let totalTaxRevenue = Number(player.taxRevenue) || 0;
  if (totalTaxRevenue <= 0) {
    const taxData = computeNationTaxRevenue(player);
    totalTaxRevenue = taxData.total;
    player.taxRevenue = totalTaxRevenue;
  }
  
  // Budget spending (convert percentages to $M)
  const budget = GAME.budget;
  const totalBudgetPct = budget.military + budget.economy + budget.diplomacy + budget.intelligence + budget.space + budget.social;
  const spendingMultiplier = totalTaxRevenue / Math.max(totalBudgetPct, 1);
  
  const spending = (
    budget.military * spendingMultiplier * 1.2 +
    budget.economy * spendingMultiplier * 1.0 +
    budget.diplomacy * spendingMultiplier * 0.8 +
    budget.intelligence * spendingMultiplier * 0.7 +
    budget.space * spendingMultiplier * 0.9 +
    budget.social * spendingMultiplier * 1.1
  );
  
  // Debt service (% of tax revenue based on debt ratio, realistic ~2-5% of revenue)
  const debtService = totalTaxRevenue * (player.debtRatio || 40) * 0.0005;
  
  // Also collect actual company taxes
  let companyTaxCollected = 0;
  player.companies.forEach(c => { companyTaxCollected += c.taxPaid || 0; });
  
  const netRevenue = Math.round(totalTaxRevenue + companyTaxCollected - spending - debtService);
  GAME.treasury += netRevenue;
  GAME.treasury = Math.max(50, GAME.treasury);
  
  // Sync player's nation treasury with GAME treasury
  player.treasury = GAME.treasury;
  
  // Update deficit based on tax revenue vs spending
  const deficitChange = ((spending + debtService) - (totalTaxRevenue + companyTaxCollected)) / (player.gdp * 1_000_000 / 12 || 1);
  player.deficit = clamp(
    (player.deficit || 0) + deficitChange * 0.5 + (player.inflation > 8 ? 0.05 : -0.02) + (Math.random() - 0.5) * 0.1,
    -12, 35
  );
}

function formatMarketMoney(amountM) {
  const v = Number(amountM || 0);
  if (!Number.isFinite(v)) return '$0M';
  if (v >= 1_000_000) return '$' + (v / 1_000_000).toFixed(2) + 'T';
  if (v >= 1_000) return '$' + (v / 1_000).toFixed(2) + 'B';
  return '$' + v.toFixed(1) + 'M';
}

function getNationStockMarketSnapshot(nationIdOrObj) {
  const nation = typeof nationIdOrObj === 'string' ? NATIONS[nationIdOrObj] : nationIdOrObj;
  if (!nation) {
    return {
      listed: 0,
      marketCap: 0,
      topGainer: null,
      topLoser: null,
      topRevenue: null,
      topProfit: null,
      topWorth: null,
    };
  }
  initNationIndustries(nation);
  const companies = Array.isArray(nation.companies) ? nation.companies : [];
  const listed = companies.filter(c => c.public);
  const marketCap = listed.reduce((sum, c) => sum + Math.max(0, Number(c.marketCap || estimateCompanyWorth(c))), 0);
  const byChange = listed.slice().sort((a, b) => Number(b.stockChangePct || 0) - Number(a.stockChangePct || 0));
  const byRevenue = companies.slice().sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0));
  const byProfit = companies.slice().sort((a, b) => (Number(b.revenue || 0) * Number(b.profitMargin || 0)) - (Number(a.revenue || 0) * Number(a.profitMargin || 0)));
  const byWorth = companies.slice().sort((a, b) => Number(b.worth || estimateCompanyWorth(b)) - Number(a.worth || estimateCompanyWorth(a)));
  return {
    listed: listed.length,
    marketCap,
    topGainer: byChange[0] || null,
    topLoser: byChange.length ? byChange[byChange.length - 1] : null,
    topRevenue: byRevenue[0] || null,
    topProfit: byProfit[0] || null,
    topWorth: byWorth[0] || null,
  };
}

function renderGlobalStockMarketBoard(limit = 12) {
  const rows = [];
  Object.values(NATIONS).forEach(nation => {
    if (nation.failedState) return;
    initNationIndustries(nation);
    (nation.companies || []).forEach(company => {
      const revenue = Number(company.revenue || 0);
      const profit = revenue * Number(company.profitMargin || 0);
      const worth = Number(company.worth || estimateCompanyWorth(company));
      rows.push({ nation, company, revenue, profit, worth, change: Number(company.stockChangePct || 0) });
    });
  });

  const topWorth = rows.slice().sort((a, b) => b.worth - a.worth).slice(0, limit);
  const topRevenue = rows.slice().sort((a, b) => b.revenue - a.revenue).slice(0, limit);
  const topProfit = rows.slice().sort((a, b) => b.profit - a.profit).slice(0, limit);
  const gainers = rows.filter(r => r.company.public).slice().sort((a, b) => b.change - a.change).slice(0, Math.max(5, Math.floor(limit / 2)));
  const losers = rows.filter(r => r.company.public).slice().sort((a, b) => a.change - b.change).slice(0, Math.max(5, Math.floor(limit / 2)));
  const globalCap = rows.filter(r => r.company.public).reduce((sum, r) => sum + Math.max(0, Number(r.company.marketCap || r.worth || 0)), 0);
  const avgMove = rows.filter(r => r.company.public).reduce((sum, r) => sum + Number(r.change || 0), 0) / Math.max(1, rows.filter(r => r.company.public).length);
  const stamp = (typeof formatDate === 'function' && GAME?.date) ? formatDate(GAME.date) : 'Now';

  const renderRows = (list, valueLabel) => {
    if (list.length === 0) return '<p class="empty">No companies yet.</p>';
    return '<div style="max-height:240px;overflow-y:auto">' + list.map((r, i) =>
      '<div style="display:flex;gap:8px;align-items:center;padding:5px 6px;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px">' +
      '<span style="color:var(--text-muted);width:20px">#' + (i + 1) + '</span>' +
      '<span style="flex:1">' + r.nation.flag + ' ' + r.company.name + ' <span style="color:var(--text-muted)">T' + (r.company.techTier || 1) + '</span></span>' +
      '<span style="color:var(--accent-green);font-weight:600">' + valueLabel(r) + '</span>' +
      '</div>'
    ).join('') + '</div>';
  };

  let html = '<div class="section-card"><h4>🌐 Global Company Market</h4>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:6px;margin-bottom:8px">';
  html += '<div class="resource-item"><span class="r-name">Global Listed</span><span class="r-val">' + rows.filter(r => r.company.public).length + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Global Cap</span><span class="r-val" style="color:var(--accent-blue)">' + formatMarketMoney(globalCap) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Avg Daily Move</span><span class="r-val" style="color:' + (avgMove >= 0 ? 'var(--accent-green)' : 'var(--accent-red)') + '">' + avgMove.toFixed(2) + '%</span></div>';
  html += '<div class="resource-item"><span class="r-name">Snapshot</span><span class="r-val">Turn ' + (GAME?.turn || 0) + ' • ' + stamp + '</span></div>';
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:8px">';
  html += '<div><h5 style="margin:2px 0 6px 0">Top Company Worth</h5>' + renderRows(topWorth, r => formatMarketMoney(r.worth)) + '</div>';
  html += '<div><h5 style="margin:2px 0 6px 0">Top Revenue Leaders</h5>' + renderRows(topRevenue, r => formatMarketMoney(r.revenue)) + '</div>';
  html += '<div><h5 style="margin:2px 0 6px 0">Top Profit Leaders</h5>' + renderRows(topProfit, r => formatMarketMoney(r.profit)) + '</div>';
  html += '<div><h5 style="margin:2px 0 6px 0">Listed Gainers / Losers</h5>';
  html += '<div style="max-height:240px;overflow-y:auto">';
  html += gainers.map(r => '<div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px"><span>📈 ' + r.nation.flag + ' ' + r.company.name + '</span><span style="color:var(--accent-green)">+' + r.change.toFixed(2) + '%</span></div>').join('');
  html += losers.map(r => '<div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px"><span>📉 ' + r.nation.flag + ' ' + r.company.name + '</span><span style="color:var(--accent-red)">' + r.change.toFixed(2) + '%</span></div>').join('');
  html += '</div></div>';
  html += '</div></div>';
  return html;
}

// ─── RENDER ECONOMY TAB ───────────────────────────────

function renderEconomyTab() {
  const p = (typeof getPlayerRecord === 'function' ? getPlayerRecord() : null) || GAME.playerNation;
  if (!p) return '<div class="tab-error">No nation selected</div>';
  
  initNationIndustries(p);
  const taxData = computeNationTaxRevenue(p);
  const allCompanies = Array.isArray(p.companies) ? p.companies : [];
  const listed = allCompanies.filter(c => c.public);
  const advancers = listed.filter(c => Number(c.stockChangePct || 0) > 0.02);
  const decliners = listed.filter(c => Number(c.stockChangePct || 0) < -0.02);
  const unchanged = Math.max(0, listed.length - advancers.length - decliners.length);
  const turnover = listed.reduce((sum, c) => sum + Math.max(0, Number(c.revenue || 0) * 0.08), 0);
  const avgMargin = allCompanies.reduce((sum, c) => sum + Number(c.profitMargin || 0), 0) / Math.max(1, allCompanies.length);
  const listedProfit = listed.reduce((sum, c) => sum + Number(c.revenue || 0) * Number(c.profitMargin || 0), 0);
  const marketSnapshot = getNationStockMarketSnapshot(p);
  const stamp = (typeof formatDate === 'function' && GAME?.date) ? formatDate(GAME.date) : 'Now';

  const topMovers = listed.slice().sort((a, b) => Math.abs(Number(b.stockChangePct || 0)) - Math.abs(Number(a.stockChangePct || 0))).slice(0, 12);
  const topByWorth = allCompanies.slice().sort((a, b) => Number(b.worth || estimateCompanyWorth(b)) - Number(a.worth || estimateCompanyWorth(a))).slice(0, 12);
  const sectorBoard = INDUSTRY_SECTORS.map(sector => {
    const data = p.industries[sector.id] || { totalRevenue: 0, totalEmployees: 0, companyCount: 0, growthRate: 0 };
    const sectorDemand = Number(p.marketDynamics?.sectorDemand?.[sector.id] || 100);
    return {
      sector,
      revenue: Number(data.totalRevenue || 0),
      employees: Number(data.totalEmployees || 0),
      companyCount: Number(data.companyCount || 0),
      growthRate: Number(data.growthRate || 0),
      demand: sectorDemand,
    };
  }).sort((a, b) => b.revenue - a.revenue);
  
  let html = '<div class="tab-content">';

  // Market tape (NYSE-style headline)
  html += '<div class="section-card" style="padding:10px 12px;margin-bottom:10px;background:linear-gradient(135deg,rgba(9,28,54,0.9),rgba(16,43,79,0.9))">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">';
  html += '<div style="font-size:13px;font-weight:700;color:var(--accent-blue)">🏛️ ' + p.name + ' Exchange • LIVE</div>';
  html += '<div style="font-size:11px;color:var(--text-muted)">Turn ' + (GAME?.turn || 0) + ' • ' + stamp + '</div>';
  html += '</div>';
  html += '<div style="margin-top:8px;display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:6px">';
  html += '<div class="resource-item"><span class="r-name">Index</span><span class="r-val">' + Number(p.stockMarket || 100).toFixed(2) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Market Cap</span><span class="r-val" style="color:var(--accent-blue)">' + formatMarketMoney(marketSnapshot.marketCap) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Listed</span><span class="r-val">' + listed.length + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Adv/Dec/Flat</span><span class="r-val" style="color:' + (advancers.length >= decliners.length ? 'var(--accent-green)' : 'var(--accent-red)') + '">' + advancers.length + '/' + decliners.length + '/' + unchanged + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Turnover</span><span class="r-val">' + formatMarketMoney(turnover) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Avg Margin</span><span class="r-val" style="color:' + (avgMargin >= 0.12 ? 'var(--accent-green)' : 'var(--accent-yellow)') + '">' + (avgMargin * 100).toFixed(2) + '%</span></div>';
  html += '</div>';
  html += '</div>';

  // Macro-to-market linkage (ensures economy wiring visibility)
  html += '<div class="section-card"><h4>🔗 Economy-Market Link</h4>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:6px">';
  html += '<div class="resource-item"><span class="r-name">GDP</span><span class="r-val">$' + Number(p.gdp || 0).toFixed(2) + 'T</span></div>';
  html += '<div class="resource-item"><span class="r-name">Tax Revenue</span><span class="r-val" style="color:var(--accent-green)">$' + Math.round(taxData.total) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Listed Profit</span><span class="r-val" style="color:var(--accent-blue)">' + formatMarketMoney(listedProfit) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Corporate Earnings</span><span class="r-val">' + formatMarketMoney(p.corporateEarnings || 0) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Inflation</span><span class="r-val ' + (Number(p.inflation || 0) <= 5 ? 'positive' : 'negative') + '">' + Number(p.inflation || 0).toFixed(2) + '%</span></div>';
  html += '<div class="resource-item"><span class="r-name">Debt/GDP</span><span class="r-val ' + (Number(p.debtRatio || 0) <= 80 ? 'positive' : 'negative') + '">' + Number(p.debtRatio || 0).toFixed(1) + '%</span></div>';
  html += '<div class="resource-item"><span class="r-name">Collection Eff.</span><span class="r-val ' + (taxData.efficiency >= 0.7 ? 'positive' : 'negative') + '">' + (taxData.efficiency * 100).toFixed(1) + '%</span></div>';
  html += '<div class="resource-item"><span class="r-name">Informal Economy</span><span class="r-val ' + (Number(p.informalEconomy || 0) > 30 ? 'negative' : 'positive') + '">' + Number(p.informalEconomy || 0).toFixed(1) + '%</span></div>';
  html += '</div></div>';

  // Movers + Leaders board
  html += '<div class="section-card"><h4>📈 Movers & Leaders</h4>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:8px">';
  html += '<div><h5 style="margin:2px 0 6px 0">Top Movers</h5><div style="max-height:280px;overflow-y:auto">';
  if (topMovers.length === 0) {
    html += '<p class="empty">No listed companies yet.</p>';
  } else {
    topMovers.forEach((company, idx) => {
      const chg = Number(company.stockChangePct || 0);
      html += '<div style="display:flex;align-items:center;gap:8px;padding:5px 6px;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px">';
      html += '<span style="width:18px;color:var(--text-muted)">#' + (idx + 1) + '</span>';
      html += '<span style="flex:1">' + getCompanyDisplayName(company) + ' <span style="color:var(--text-muted)">T' + (company.techTier || 1) + '</span></span>';
      html += '<span style="color:' + (chg >= 0 ? 'var(--accent-green)' : 'var(--accent-red)') + '">' + (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%</span>';
      html += '<span style="color:var(--accent-blue)">$' + Number(company.stockPrice || 0).toFixed(2) + '</span>';
      html += '</div>';
    });
  }
  html += '</div></div>';

  html += '<div><h5 style="margin:2px 0 6px 0">Top Worth (Local)</h5><div style="max-height:280px;overflow-y:auto">';
  if (topByWorth.length === 0) {
    html += '<p class="empty">No companies founded yet.</p>';
  } else {
    topByWorth.forEach((company, idx) => {
      const profit = Number(company.revenue || 0) * Number(company.profitMargin || 0);
      const worth = Number(company.worth || estimateCompanyWorth(company));
      html += '<div style="display:flex;align-items:center;gap:8px;padding:5px 6px;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px">';
      html += '<span style="width:18px;color:var(--text-muted)">#' + (idx + 1) + '</span>';
      html += '<span style="flex:1">' + getCompanyDisplayName(company) + '</span>';
      html += '<span style="color:var(--accent-green)">Rev ' + formatMarketMoney(company.revenue) + '</span>';
      html += '<span style="color:var(--accent-blue)">Pft ' + formatMarketMoney(profit) + '</span>';
      html += '<span style="color:var(--accent-yellow)">W ' + formatMarketMoney(worth) + '</span>';
      html += '</div>';
    });
  }
  html += '</div></div>';
  html += '</div></div>';

  // Sector tape / heatmap
  html += '<div class="section-card"><h4>🧭 Sector Heatmap</h4><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:6px">';
  sectorBoard.forEach(item => {
    const heat = clamp((item.growthRate * 100) + (item.demand - 100) * 0.15, -12, 16);
    const color = heat >= 1 ? 'var(--accent-green)' : (heat <= -1 ? 'var(--accent-red)' : 'var(--accent-yellow)');
    html += '<div style="background:rgba(9,28,54,0.5);border:1px solid var(--border-color);border-radius:6px;padding:8px">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">';
    html += '<span style="font-weight:600">' + item.sector.icon + ' ' + item.sector.label + '</span>';
    html += '<span style="color:' + color + ';font-weight:700">Heat ' + (heat >= 0 ? '+' : '') + heat.toFixed(1) + '</span>';
    html += '</div>';
    html += '<div style="font-size:11px;color:var(--text-secondary)">';
    html += 'Demand ' + item.demand.toFixed(1) + ' | Revenue ' + formatMarketMoney(item.revenue) + '<br>';
    html += 'Companies ' + item.companyCount + ' | Employees ' + item.employees.toLocaleString() + ' | Growth ' + (item.growthRate * 100).toFixed(2) + '%';
    html += '</div></div>';
  });
  html += '</div></div>';

  // Keep global board at bottom
  html += renderGlobalStockMarketBoard(10);
  
  html += '</div>';
  return html;
}

// ─── EXPOSE GLOBAL ────────────────────────────────────

window.renderEconomyTab = renderEconomyTab;
window.renderEconomyTabExternal = renderEconomyTab;
window.initNationIndustries = initNationIndustries;
window.processAllEconomicSystems = processAllEconomicSystems;
window.updateNationGDP = updateNationGDP;
window.updateNationStockMarket = updateNationStockMarket;
window.getNationStockMarketSnapshot = getNationStockMarketSnapshot;
window.renderGlobalStockMarketBoard = renderGlobalStockMarketBoard;
