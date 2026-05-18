// ============================================================
// ECONOMIC SYSTEM — Taxes, Industries, Companies, Stock Market
// ============================================================
// Loaded BEFORE game.js, hooks into main loop via:
//   processAllEconomicSystems() — called every turn
//   renderEconomyTab() — replaces game.js version

// Economic systems are processed every 2 simulation turns.
// Keep values aligned with monthly expectations by scaling internal economics.
const ECON_UPDATE_MONTHS = 2;
if (typeof window !== 'undefined') {
  window.ECON_UPDATE_MONTHS = ECON_UPDATE_MONTHS;
}

function getEconomicUpdateMonths() {
  const raw = (typeof window !== 'undefined' && window.ECON_UPDATE_MONTHS !== undefined)
    ? Number(window.ECON_UPDATE_MONTHS)
    : Number(ECON_UPDATE_MONTHS || 1);
  return clamp(Number.isFinite(raw) ? raw : 1, 1, 12);
}

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

function getCompanyBrandKey(company) {
  const base = String(company?.baseName || company?.displayName || company?.name || 'Unknown Co').trim();
  return base.toLowerCase();
}

function getCompanyBaseName(company) {
  return String(company?.baseName || company?.displayName || company?.name || 'Unknown Co').trim();
}

function getGlobalCompanyBrandCounts() {
  const counts = {};
  Object.values(NATIONS || {}).forEach(nation => {
    if (!nation || !Array.isArray(nation.companies)) return;
    nation.companies.forEach(company => {
      const key = getCompanyBrandKey(company);
      counts[key] = (counts[key] || 0) + 1;
    });
  });
  return counts;
}

function getCompanyDisplayName(company, options = {}) {
  if (!company) return 'Unknown Co';
  const base = getCompanyBaseName(company);
  const key = getCompanyBrandKey(company);
  const counts = options.brandCounts || getGlobalCompanyBrandCounts();
  const duplicates = Number(counts[key] || 0) > 1;
  const needsTag = options.forceCountryTag || duplicates;
  if (needsTag && company.countryTag) return base + ' ' + company.countryTag;
  return base;
}

function getGlobalCompanyById(companyId) {
  if (!companyId) return null;
  const nations = Object.values(NATIONS || {});
  for (let i = 0; i < nations.length; i++) {
    const nation = nations[i];
    if (!nation || !Array.isArray(nation.companies)) continue;
    const company = nation.companies.find(c => c?.id === companyId);
    if (company) return { nation, company };
  }
  return null;
}

function getAllPublicCompanies() {
  const list = [];
  Object.values(NATIONS || {}).forEach(nation => {
    if (!nation || nation.failedState || !Array.isArray(nation.companies)) return;
    nation.companies.forEach(company => {
      if (company?.public) list.push({ nation, company });
    });
  });
  return list;
}

function getCompanyTotalHeldShares(company) {
  const sovereignHeld = Object.values(company?.sovereignOwners || {}).reduce((sum, shares) => sum + Math.max(0, Number(shares || 0)), 0);
  return Math.max(0, Number(company?.populationOwnedShares || 0)) + Math.max(0, Number(company?.companyOwnedShares || 0)) + sovereignHeld;
}

function applySharePurchase(position, sharesToBuy, executionPrice) {
  const addShares = Math.max(0, Number(sharesToBuy || 0));
  if (addShares <= 0) return;
  const px = Math.max(0.01, Number(executionPrice || 0.1));
  const currentShares = Math.max(0, Number(position.shares || 0));
  const currentCost = Math.max(0.01, Number(position.averageCost || px));
  const totalCostBasis = currentShares * currentCost + addShares * px;
  position.shares = currentShares + addShares;
  position.averageCost = totalCostBasis / Math.max(1, position.shares);
}

function ensureNationFinanceLedger(nation) {
  if (!nation) return null;
  if (!nation.financeLedger || typeof nation.financeLedger !== 'object') {
    nation.financeLedger = {
      turn: -1,
      inflows: {},
      outflows: {},
      entries: [],
    };
  }
  if (!Array.isArray(nation.financeLedgerHistory)) nation.financeLedgerHistory = [];

  const currentTurn = Number(GAME?.turn || 0);
  if (nation.financeLedger.turn !== currentTurn) {
    if (Array.isArray(nation.financeLedger.entries) && nation.financeLedger.entries.length > 0) {
      nation.financeLedgerHistory.push(...nation.financeLedger.entries.map(entry => ({ ...entry })));
      if (nation.financeLedgerHistory.length > 600) {
        nation.financeLedgerHistory.splice(0, nation.financeLedgerHistory.length - 600);
      }
    }
    nation.financeLedger.turn = currentTurn;
    nation.financeLedger.inflows = {};
    nation.financeLedger.outflows = {};
    nation.financeLedger.entries = [];
  }

  return nation.financeLedger;
}

function recordNationFinanceFlow(nation, bucket, key, amount, details) {
  if (!nation || !bucket || !key) return 0;
  const value = Math.max(0, Number(amount || 0));
  if (value <= 0) return 0;
  const ledger = ensureNationFinanceLedger(nation);
  if (!ledger) return 0;
  const targetBucket = bucket === 'outflows' ? ledger.outflows : ledger.inflows;
  targetBucket[key] = Math.max(0, Number(targetBucket[key] || 0) + value);
  if (!Array.isArray(ledger.entries)) ledger.entries = [];
  ledger.entries.push({
    turn: Number(GAME?.turn || 0),
    bucket: bucket === 'outflows' ? 'outflows' : 'inflows',
    key,
    amount: value,
    note: String(details?.note || ''),
    counterparty: String(details?.counterparty || ''),
    context: String(details?.context || ''),
  });
  return value;
}

function getNationFinanceEntries(nation, bucket, key, limit = 60) {
  if (!nation) return [];
  const current = Array.isArray(nation.financeLedger?.entries) ? nation.financeLedger.entries : [];
  const history = Array.isArray(nation.financeLedgerHistory) ? nation.financeLedgerHistory : [];
  const all = history.concat(current);
  return all
    .filter(entry => (!bucket || entry.bucket === bucket) && (!key || entry.key === key))
    .slice(-Math.max(1, Number(limit || 60)))
    .reverse();
}

function getRecentNationFinanceBuckets(nation, lookbackTurns = 2) {
  const result = { inflows: {}, outflows: {} };
  if (!nation) return result;
  const turns = Math.max(1, Number(lookbackTurns || 1));
  const currentTurn = Number(GAME?.turn || 0);
  const minTurn = currentTurn - (turns - 1);
  const entries = getNationFinanceEntries(nation, null, null, 400);

  entries.forEach(entry => {
    if (!entry) return;
    const turn = Number(entry.turn || 0);
    if (turn < minTurn) return;
    const bucket = entry.bucket === 'outflows' ? 'outflows' : 'inflows';
    const key = String(entry.key || 'other');
    const amount = Math.max(0, Number(entry.amount || 0));
    if (!amount) return;
    result[bucket][key] = Math.max(0, Number(result[bucket][key] || 0) + amount);
  });

  return result;
}

function getLedgerTotal(bucket) {
  if (!bucket) return 0;
  return Object.values(bucket).reduce((sum, value) => sum + Math.max(0, Number(value || 0)), 0);
}

function getNationMilitaryStockpileValueM(nation) {
  const stockpile = nation?.militaryStockpile || {};
  let totalValue = 0;

  Object.keys(stockpile).forEach(category => {
    (stockpile[category] || []).forEach(item => {
      const quantity = Math.max(0, Number(item?.quantity || 0));
      if (!quantity) return;
      let unitCost = 5_000_000;
      if (typeof findEquipmentTemplate === 'function' && typeof getEquipmentUnitCost === 'function') {
        const template = findEquipmentTemplate(item.name, category);
        if (template) {
          unitCost = getEquipmentUnitCost(template, category) || unitCost;
        }
      }
      totalValue += (quantity * unitCost) / 1_000_000;
    });
  });

  return totalValue;
}

function getNationFinanceSnapshot(nation) {
  if (!nation) {
    return {
      cashM: 0,
      gdpT: 0,
      treasuryInM: 0,
      treasuryOutM: 0,
      assetsM: 0,
      liabilitiesM: 0,
      netWorthM: 0,
      inflows: {},
      outflows: {},
      assetBreakdown: {},
      liabilityBreakdown: {},
    };
  }

  const treasuryM = Math.max(0, Number(nation.treasury || (nation.id === GAME?.playerNation?.id ? GAME?.treasury : 0)));
  const ledger = ensureNationFinanceLedger(nation) || { inflows: {}, outflows: {} };
  const lookbackTurns = Math.max(1, Number(typeof getEconomicUpdateMonths === 'function' ? getEconomicUpdateMonths() : 1));
  const recent = getRecentNationFinanceBuckets(nation, lookbackTurns);
  const inflows = Object.keys(recent.inflows).length > 0 ? { ...recent.inflows } : { ...ledger.inflows };
  const outflows = Object.keys(recent.outflows).length > 0 ? { ...recent.outflows } : { ...ledger.outflows };

  const taxRevenueM = Math.max(0, Number(nation.taxRevenue || 0));
  if (!inflows.taxes && taxRevenueM > 0) inflows.taxes = taxRevenueM;

  const companyTaxM = Array.isArray(nation.companies)
    ? nation.companies.reduce((sum, company) => sum + Math.max(0, Number(company?.taxPaid || 0)), 0)
    : 0;
  if (!inflows.company_taxes && companyTaxM > 0) inflows.company_taxes = companyTaxM;

  const populationDividendsM = Math.max(0, Number(nation.populationPortfolio?.dividendReceived || 0));
  const sovereignDividendsM = Math.max(0, Number(nation.sovereignPortfolio?.dividendReceived || 0));
  if (!inflows.dividends && (populationDividendsM + sovereignDividendsM) > 0) {
    inflows.dividends = populationDividendsM + sovereignDividendsM;
  }

  const publicEquityM = Math.max(0, Number(nation.sovereignPortfolio?.totalInvested || 0));
  const marketHeldM = Object.values(nation.sovereignPortfolio?.stockHoldings || {}).reduce((sum, holding) => {
    const shares = Math.max(0, Number(holding?.shares || 0));
    const averageCost = Math.max(0.01, Number(holding?.averageCost || 0.1));
    return sum + (shares * averageCost) / 1_000_000;
  }, 0);
  const publicEquityValueM = Math.max(publicEquityM, marketHeldM);
  const militaryStockpileValueM = getNationMilitaryStockpileValueM(nation);

  let loanLiabilitiesM = 0;
  if (Array.isArray(GAME?.worldBank?.loans)) {
    GAME.worldBank.loans.forEach(loan => {
      if (loan.borrowerId === nation.id && !['paid', 'settled-via-bailout'].includes(loan.status)) {
        loanLiabilitiesM += Math.max(0, Number(loan.outstanding ?? loan.amount ?? 0) * 1000);
      }
    });
  }
  if (Array.isArray(GAME?.sovereignLoans)) {
    GAME.sovereignLoans.forEach(loan => {
      if (loan.borrowerId === nation.id && !['paid', 'settled-via-collateral'].includes(loan.status)) {
        loanLiabilitiesM += Math.max(0, Number(loan.outstanding ?? loan.amount ?? loan.principal ?? 0) * 1_000_000);
      }
    });
  }
  const bailoutLiabilitiesM = Array.isArray(GAME?.worldBank?.bailouts)
    ? GAME.worldBank.bailouts.reduce((sum, bailout) => {
        if (bailout.nationId !== nation.id || bailout.status !== 'active') return sum;
        return sum + Math.max(0, Number(bailout.amount || 0) * 1000);
      }, 0)
    : 0;

  const assetBreakdown = {
    public_equity: publicEquityValueM,
    military_stockpile: militaryStockpileValueM,
  };
  const liabilityBreakdown = {
    loans: loanLiabilitiesM,
    bailouts: bailoutLiabilitiesM,
  };

  const assetsM = getLedgerTotal(assetBreakdown);
  const liabilitiesM = getLedgerTotal(liabilityBreakdown);
  const treasuryInM = getLedgerTotal(inflows);
  const treasuryOutM = getLedgerTotal(outflows);

  return {
    cashM: treasuryM,
    gdpT: Math.max(0, Number(nation.gdp || 0)),
    treasuryInM,
    treasuryOutM,
    assetsM,
    liabilitiesM,
    netWorthM: treasuryM + assetsM - liabilitiesM,
    inflows,
    outflows,
    assetBreakdown,
    liabilityBreakdown,
  };
}

function rebuildGlobalOwnershipLedgers() {
  Object.values(NATIONS || {}).forEach(nation => {
    if (!nation || !Array.isArray(nation.companies)) return;
    nation.companies.forEach(company => {
      company.populationOwnedShares = 0;
      company.companyOwnedShares = 0;
      company.sovereignOwners = {};
    });
  });

  // Population holdings
  Object.values(NATIONS || {}).forEach(nation => {
    const holdings = nation?.populationPortfolio?.stockHoldings || {};
    Object.entries(holdings).forEach(([companyId, pos]) => {
      const found = getGlobalCompanyById(companyId);
      if (!found) return;
      const shares = Math.max(0, Number(pos?.shares || 0));
      const maxShares = Math.max(1, Number(found.company.sharesOutstanding || 1));
      found.company.populationOwnedShares = clamp(Number(found.company.populationOwnedShares || 0) + shares, 0, maxShares);
    });
  });

  // Company cross-holdings
  Object.values(NATIONS || {}).forEach(nation => {
    const map = nation?.companyInvestments || {};
    Object.values(map).forEach(targets => {
      Object.entries(targets || {}).forEach(([targetId, sharesRaw]) => {
        const found = getGlobalCompanyById(targetId);
        if (!found) return;
        const shares = Math.max(0, Number(sharesRaw || 0));
        const maxShares = Math.max(1, Number(found.company.sharesOutstanding || 1));
        found.company.companyOwnedShares = clamp(Number(found.company.companyOwnedShares || 0) + shares, 0, maxShares);
      });
    });
  });

  // Sovereign holdings (can be cross-border)
  Object.values(NATIONS || {}).forEach(ownerNation => {
    const holdings = ownerNation?.sovereignPortfolio?.stockHoldings || {};
    Object.entries(holdings).forEach(([companyId, pos]) => {
      const found = getGlobalCompanyById(companyId);
      if (!found) return;
      const shares = Math.max(0, Number(pos?.shares || 0));
      const maxShares = Math.max(1, Number(found.company.sharesOutstanding || 1));
      if (!found.company.sovereignOwners || typeof found.company.sovereignOwners !== 'object') found.company.sovereignOwners = {};
      found.company.sovereignOwners[ownerNation.id] = clamp(Number(found.company.sovereignOwners[ownerNation.id] || 0) + shares, 0, maxShares);
    });
  });
}

function seedInitialPublicOwnership(nation, company, source = 'ipo') {
  if (!nation || !company || !company.public) return;
  if (company.__ownershipSeeded) return;
  const sharesOutstanding = Math.max(1, Number(company.sharesOutstanding || 1));
  const stockPrice = Math.max(0.01, Number(company.stockPrice || estimateFairStockPrice(company)));

  nation.populationPortfolio = nation.populationPortfolio || { investmentRate: 4, totalInvested: 0, dividendReceived: 0, stockHoldings: {}, history: [] };
  nation.sovereignPortfolio = nation.sovereignPortfolio || { allocationRate: 1, totalInvested: 0, dividendReceived: 0, stockHoldings: {} };
  nation.companyInvestments = nation.companyInvestments || {};

  const popPct = clamp(0.08 + (Number(nation.education || 50) - 40) * 0.001 + Math.random() * 0.04, 0.06, 0.22);
  const sovPct = clamp(0.02 + (Number(nation.governance || 50) - 45) * 0.0006 + Math.random() * 0.02, 0.01, 0.08);
  const crossPct = clamp(0.005 + Math.random() * 0.025, 0.005, 0.04);

  const popShares = Math.floor(sharesOutstanding * popPct);
  const sovShares = Math.floor(sharesOutstanding * sovPct);
  let crossSharesRemaining = Math.floor(sharesOutstanding * crossPct);

  if (popShares > 0) {
    if (!nation.populationPortfolio.stockHoldings[company.id]) {
      nation.populationPortfolio.stockHoldings[company.id] = { shares: 0, averageCost: stockPrice };
    }
    applySharePurchase(nation.populationPortfolio.stockHoldings[company.id], popShares, stockPrice);
    nation.populationPortfolio.totalInvested = Math.max(0, Number(nation.populationPortfolio.totalInvested || 0) + (popShares * stockPrice) / 1_000_000);
  }

  if (sovShares > 0) {
    if (!nation.sovereignPortfolio.stockHoldings[company.id]) {
      nation.sovereignPortfolio.stockHoldings[company.id] = { shares: 0, averageCost: stockPrice };
    }
    applySharePurchase(nation.sovereignPortfolio.stockHoldings[company.id], sovShares, stockPrice);
    nation.sovereignPortfolio.totalInvested = Math.max(0, Number(nation.sovereignPortfolio.totalInvested || 0) + (sovShares * stockPrice) / 1_000_000);
  }

  if (crossSharesRemaining > 0) {
    const candidates = (nation.companies || [])
      .filter(c => c.id !== company.id && c.public)
      .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))
      .slice(0, 3);
    candidates.forEach((investor, idx) => {
      if (crossSharesRemaining <= 0) return;
      const alloc = Math.min(crossSharesRemaining, Math.max(1000, Math.floor(crossSharesRemaining / (candidates.length - idx || 1))));
      if (!nation.companyInvestments[investor.id]) nation.companyInvestments[investor.id] = {};
      nation.companyInvestments[investor.id][company.id] = Number(nation.companyInvestments[investor.id][company.id] || 0) + alloc;
      crossSharesRemaining -= alloc;
    });
  }

  company.__ownershipSeeded = source;
}

function ensureNationPublicListings(nation) {
  if (!nation || !Array.isArray(nation.companies) || nation.companies.length === 0) return;
  const companies = nation.companies;
  let publicCompanies = companies.filter(c => c.public);
  const targetPublicCount = clamp(Math.round(Math.sqrt(companies.length)), 1, 5);
  if (publicCompanies.length >= targetPublicCount) {
    publicCompanies.forEach(c => {
      if (!c.stockPrice || c.stockPrice <= 0) c.stockPrice = estimateFairStockPrice(c);
      seedInitialPublicOwnership(nation, c, 'listing-backfill');
    });
    return;
  }

  const candidates = companies
    .filter(c => !c.public)
    .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0));

  while (publicCompanies.length < targetPublicCount && candidates.length > 0) {
    const company = candidates.shift();
    company.public = true;
    company.sharesOutstanding = Math.max(10_000_000, Number(company.sharesOutstanding || 50_000_000));
    company.stockPrice = Math.max(0.1, estimateFairStockPrice(company));
    company.marketCap = (company.stockPrice * company.sharesOutstanding) / 1_000_000;
    seedInitialPublicOwnership(nation, company, 'auto-listing');
    publicCompanies.push(company);
  }
}

function getGlobalBrandMarketView() {
  const brands = {};
  Object.values(NATIONS || {}).forEach(nation => {
    if (!nation || nation.failedState || !Array.isArray(nation.companies)) return;
    nation.companies.forEach(company => {
      const key = getCompanyBrandKey(company);
      if (!brands[key]) {
        brands[key] = {
          key,
          name: getCompanyBaseName(company),
          listedCount: 0,
          totalRevenue: 0,
          totalProfit: 0,
          totalWorth: 0,
          totalMarketCap: 0,
          moveSum: 0,
          moveCount: 0,
          entries: [],
        };
      }

      const revenue = Number(company.revenue || 0);
      const profit = revenue * Number(company.profitMargin || 0);
      const worth = Number(company.worth || estimateCompanyWorth(company));
      const cap = Number(company.marketCap || worth || 0);
      const change = Number(company.stockChangePct || 0);
      const brand = brands[key];

      brand.totalRevenue += revenue;
      brand.totalProfit += profit;
      brand.totalWorth += worth;
      if (company.public) {
        brand.listedCount += 1;
        brand.totalMarketCap += Math.max(0, cap);
        brand.moveSum += change;
        brand.moveCount += 1;
      }

      brand.entries.push({ nation, company, revenue, profit, worth, cap, change });
    });
  });

  return Object.values(brands).map(brand => ({
    ...brand,
    avgMove: brand.moveCount > 0 ? (brand.moveSum / brand.moveCount) : 0,
    countryCount: new Set(brand.entries.map(e => e.nation.id)).size,
  }));
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
  const hardWorthCap = 2_500_000; // $2.5T in $M units
  const privateWorth = Math.max(0.01, profit * 26 * tierPremium * growthPremium);
  if (company.public) {
    const shares = Math.max(1, Number(company.sharesOutstanding || 50_000_000));
    const marketCap = Math.max(0.01, Number(company.stockPrice || 0.1) * shares / 1_000_000);
    const revenueFloor = Math.max(0.01, revenue * clamp(1.2 + (company.techTier || 1) * 0.1, 1.2, 2.6));
    const speculativeCeiling = Math.max(revenueFloor, privateWorth * clamp(1.6 + (company.techTier || 1) * 0.18 + Math.max(0, company.growthRate || 0) * 5, 1.8, 4.5));
    const boundedCeiling = Math.min(speculativeCeiling, hardWorthCap);
    const boundedFloor = Math.min(revenueFloor, boundedCeiling);
    return clamp(marketCap, boundedFloor, boundedCeiling);
  }
  return Math.min(privateWorth, hardWorthCap * 0.65);
}

function estimateFairStockPrice(company) {
  const shares = Math.max(1, Number(company.sharesOutstanding || 50_000_000));
  const fairWorth = estimateCompanyWorth({ ...company, public: false });
  return Math.max(0.1, fairWorth * 1_000_000 / shares);
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

    nation.sovereignPortfolio = nation.sovereignPortfolio || {
      allocationRate: clamp(0.4 + Math.random() * 1.6, 0.4, 2.0), // 0.4-2.0% of treasury/month into equities
      totalInvested: 0, // $M
      dividendReceived: 0, // $M per month
      stockHoldings: {}, // companyId -> { shares, averageCost }
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
  const researchStrength = getNationResearchStrength(nation);

  // National company capacity: hard limit tied to economy + institutions + research depth.
  const capacityFromGDP = Math.max(4, Number(nation.gdp || 0.1) * 48);
  const capacityFromEducation = Math.max(0, Number(nation.education || 0) * 1.8);
  const capacityFromResearch = Math.max(0, researchStrength * 0.75);
  const capacityFromGovernance = Math.max(0, Number(nation.governance || 0) * 0.9);
  const capacityFromInfra = Math.max(0, Number(nation.infrastructure || 0) * 0.7);
  const companyCapacity = clamp(
    Math.round(8 + capacityFromGDP + capacityFromEducation + capacityFromResearch + capacityFromGovernance + capacityFromInfra),
    12,
    2200
  );
  const currentCompanyCount = Array.isArray(nation.companies) ? nation.companies.length : 0;
  const remainingSlots = Math.max(0, companyCapacity - currentCompanyCount);
  if (remainingSlots <= 0) return;
  
  // Education factor: low edu = almost no companies
  const eduFactor = clamp(edu / 25, 0.1, 3.0);
  // Population factor: more people = more companies
  const popFactor = clamp(pop / 50, 0.3, 3.0);
  // Governance factor: good governance enables business
  const govBusinessFactor = clamp(nation.governance / 40, 0.3, 2.0);
  
  const baseCompaniesPerTurn = clamp(eduFactor * popFactor * govBusinessFactor * govFactor * 0.25, 0.1, 6);
  const cadenceMonths = getEconomicUpdateMonths();
  
  // If initial, generate a stock of companies
  let initialCount = 0;
  if (initial) {
    initialCount = Math.round(baseCompaniesPerTurn * 8 + Math.random() * 5);
  } else {
    const expectedNewCompanies = clamp(baseCompaniesPerTurn * cadenceMonths * 0.8, 0.05, 8);
    const guaranteed = Math.floor(expectedNewCompanies);
    const fractional = expectedNewCompanies - guaranteed;
    initialCount = guaranteed + (Math.random() < fractional ? 1 : 0);
    initialCount = clamp(initialCount, 0, 8);
  }
  initialCount = Math.min(initialCount, remainingSlots);
  
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
    const earlyScaleBoost = clamp(1 + Number(nation.gdp || 0.1) * 0.08 + edu * 0.004 + researchStrength * 0.003, 1.0, 2.8);
    const revenue = baseRevenue * sizeMultiplier * (0.5 + Math.random()) * clamp(tech / 5, 0.2, 2.5) * marketSizeFactor * resourceMult * demandLift * earlyScaleBoost;
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
      revenue: Math.max(0.25, revenue), // $M per month
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
    if (company.public && (!company.stockPrice || company.stockPrice <= 0)) {
      company.stockPrice = Math.max(0.1, estimateFairStockPrice(company));
    }
    if (company.public) {
      company.marketCap = (Math.max(0.01, Number(company.stockPrice || 0.1)) * Math.max(1, Number(company.sharesOutstanding || 1))) / 1_000_000;
      seedInitialPublicOwnership(nation, company, 'initial');
    }
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
  const cadenceMonths = getEconomicUpdateMonths();
  
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
  
  // Tax base is now anchored to actual company activity with a GDP floor.
  const companies = Array.isArray(nation.companies) ? nation.companies : [];
  const companyRevenueBase = companies.reduce((sum, company) => sum + Math.max(0, Number(company?.revenue || 0)), 0);
  const companyProfitBase = companies.reduce((sum, company) => {
    const revenue = Math.max(0, Number(company?.revenue || 0));
    const margin = clamp(Number(company?.profitMargin || 0), 0, 0.8);
    return sum + (revenue * margin);
  }, 0);
  const corporateBase = Math.max(gdpMonthly * 0.12, companyProfitBase * 0.9 + companyRevenueBase * 0.08);
  const incomeBase = gdpMonthly * 0.5 * incomeMultiplier * employmentFactor;
  const consumptionBase = gdpMonthly * 0.3;
  const tradeBase = gdpMonthly * 0.1;
  
  // Efficiency: corruption and informal economy reduce collection
  const efficiency = taxConfig.efficiency * (1 - nation.corruption / 200) * clamp(1 - nation.informalEconomy / 100, 0.4, 1.0);
  
  const corpTaxMonthly = corporateBase * taxConfig.corp * efficiency;
  const incomeTaxMonthly = incomeBase * taxConfig.income * efficiency;
  const vatTaxMonthly = consumptionBase * taxConfig.vat * efficiency;
  const tariffTaxMonthly = tradeBase * taxConfig.tariff * efficiency;
  
  const corpTax = corpTaxMonthly * cadenceMonths;
  const incomeTax = incomeTaxMonthly * cadenceMonths;
  const vatTax = vatTaxMonthly * cadenceMonths;
  const tariffTax = tariffTaxMonthly * cadenceMonths;
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
  
  // Calculate investment capacity from GDP-per-worker as a wage proxy.
  // GDP is annual in $T, so convert to monthly $M and then to $ per worker.
  const employedPop = nation.population * Math.max(0, nation.jobs / 100); // millions
  const gdpMonthly = Math.max(1, (nation.gdp || 0.1) * 1_000_000 / 12); // $M / month
  const monthlyIncomePerWorker = gdpMonthly / Math.max(employedPop, 1); // $ / worker / month
  const disposableIncomePerWorker = monthlyIncomePerWorker * clamp(0.22 + (100 - (nation.inequality || 50)) * 0.002, 0.12, 0.40);
  const monthlySavingsRate = clamp((portfolio.investmentRate || 0) / 100, 0.02, 0.08);
  const investmentCapacity = Math.max(0.1, employedPop * disposableIncomePerWorker * monthlySavingsRate / 1_000_000); // $M per month
  
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
  
  // Monthly fresh inflow from household savings builds ownership steadily.
  const monthlyContribution = Math.max(0.05, investmentCapacity);
  portfolio.cashBalance = Math.max(0, Number(portfolio.cashBalance || 0) + monthlyContribution);
  publicCompanies.forEach(c => {
    const allocValue = monthlyContribution * targetAllocation[c.id];
    let shareDelta = (allocValue * 1_000_000) / Math.max(0.01, c.stockPrice || 0.1);
    const sharesOutstanding = Math.max(1, Number(c.sharesOutstanding || 1));
    const popHolding = Number(c.populationOwnedShares || 0);
    const popCapShares = sharesOutstanding * 0.58; // Keep private/free-float alive.
    shareDelta = Math.min(shareDelta, Math.max(0, popCapShares - popHolding));
    const heldShares = getCompanyTotalHeldShares(c);
    const remainingFloat = Math.max(0, sharesOutstanding - heldShares);
    if (shareDelta > remainingFloat) shareDelta = remainingFloat;
    if (shareDelta >= 1000) {
      const purchasePrice = Math.max(0.01, Number(c.stockPrice || 0.1));
      const actualSpend = Math.min(portfolio.cashBalance, (shareDelta * purchasePrice) / 1_000_000);
      if (actualSpend <= 0) return;
      if (!portfolio.stockHoldings[c.id]) {
        portfolio.stockHoldings[c.id] = { shares: 0, averageCost: c.stockPrice || 0 };
      }
      applySharePurchase(portfolio.stockHoldings[c.id], shareDelta, purchasePrice);
      portfolio.totalInvested = Math.max(0, portfolio.totalInvested + actualSpend);
      portfolio.cashBalance = Math.max(0, portfolio.cashBalance - actualSpend);
      c.populationOwnedShares = clamp(Number(c.populationOwnedShares || 0) + shareDelta, 0, sharesOutstanding);
    }
  });
}

function updateSovereignStockInvestments(nation) {
  initNationIndustries(nation);
  const portfolio = nation.sovereignPortfolio;
  if (!portfolio) return;

  const publicCompanies = getAllPublicCompanies();
  if (publicCompanies.length === 0) return;

  const isPlayerNation = nation.id === GAME.playerNation?.id;
  let treasuryBalance = Math.max(0, Number(isPlayerNation ? GAME.treasury : nation.treasury || 0));
  const monthlyBudget = Math.max(0, treasuryBalance * clamp((portfolio.allocationRate || 0) / 100, 0.004, 0.02));
  if (monthlyBudget <= 0) return;
  let remainingBudget = monthlyBudget;

  const targetAllocation = {};
  let totalScore = 0;
  publicCompanies.forEach(entry => {
    const company = entry.company;
    const hostNation = entry.nation;
    const profitability = Math.max(0.02, Number(company.profitMargin || 0));
    const growth = Math.max(-0.02, Number(company.growthRate || 0));
    const homeBias = hostNation.id === nation.id ? 1.25 : 1.0;
    const governanceTrust = clamp((hostNation.governance || 50) / 55, 0.6, 1.4);
    const score = (profitability * 5 + growth * 6 + (Number(company.techTier || 1) * 0.35)) * homeBias * governanceTrust;
    targetAllocation[company.id] = Math.max(0.1, score);
    totalScore += targetAllocation[company.id];
  });

  Object.keys(targetAllocation).forEach(cid => {
    targetAllocation[cid] = targetAllocation[cid] / Math.max(0.1, totalScore);
  });

  const monthlyContribution = monthlyBudget;
  publicCompanies.forEach(entry => {
    const company = entry.company;
    const targetValue = Math.min(remainingBudget, monthlyContribution * targetAllocation[company.id]);
    if (targetValue <= 0) return;
    let shareDelta = (targetValue * 1_000_000) / Math.max(0.01, Number(company.stockPrice || 0.1));
    const holding = portfolio.stockHoldings[company.id] || { shares: 0, averageCost: Number(company.stockPrice || 0.1) };
    const sharesOutstanding = Math.max(1, Number(company.sharesOutstanding || 1));
    const sovereignHeldTotal = Object.values(company.sovereignOwners || {}).reduce((sum, s) => sum + Math.max(0, Number(s || 0)), 0);
    const sovereignClassCap = sharesOutstanding * 0.3;
    shareDelta = Math.min(shareDelta, Math.max(0, sovereignClassCap - sovereignHeldTotal));
    const nationSovCap = sharesOutstanding * 0.16;
    shareDelta = Math.min(shareDelta, Math.max(0, nationSovCap - Number(company.sovereignOwners?.[nation.id] || 0)));
    const heldShares = getCompanyTotalHeldShares(company);
    const remainingFloat = Math.max(0, sharesOutstanding - heldShares);
    if (shareDelta > remainingFloat) shareDelta = remainingFloat;
    if (shareDelta < 1000) return;

    const purchasePrice = Math.max(0.01, Number(company.stockPrice || 0.1));
    const actualSpend = Math.min(targetValue, (shareDelta * purchasePrice) / 1_000_000);
    if (actualSpend <= 0) return;
    applySharePurchase(holding, shareDelta, purchasePrice);
    portfolio.stockHoldings[company.id] = holding;
    portfolio.totalInvested = Math.max(0, Number(portfolio.totalInvested || 0) + actualSpend);
    remainingBudget = Math.max(0, remainingBudget - actualSpend);
    treasuryBalance = Math.max(0, treasuryBalance - actualSpend);

    if (isPlayerNation) {
      GAME.treasury = treasuryBalance;
      nation.treasury = GAME.treasury;
    } else {
      nation.treasury = treasuryBalance;
    }
    recordNationFinanceFlow(nation, 'outflows', 'sovereign_investment', actualSpend);

    if (!company.sovereignOwners || typeof company.sovereignOwners !== 'object') company.sovereignOwners = {};
    company.sovereignOwners[nation.id] = clamp(Number(company.sovereignOwners[nation.id] || 0) + shareDelta, 0, sharesOutstanding);
  });
}

// ─── DIVIDEND PROCESSING ──────────────────────────────

function processDividends(nation) {
  const portfolio = nation.populationPortfolio;
  const sovereignPortfolio = nation.sovereignPortfolio || { stockHoldings: {}, dividendReceived: 0 };
  portfolio.dividendReceived = 0;
  sovereignPortfolio.dividendReceived = 0;
  const localPerShare = {};
  
  nation.companies.forEach(c => {
    const turnsRemaining = Number(c.dividendPolicyTurnsRemaining || 0);
    if (turnsRemaining <= 0) {
      c.dividendPolicyTurnsRemaining = 10;
      c.dividendPolicyPayout = clamp(0.22 + Math.random() * 0.38 + Math.max(0, Number(c.profitMargin || 0) - 0.08) * 0.6, 0.2, 0.72);
    } else {
      c.dividendPolicyTurnsRemaining = Math.max(0, turnsRemaining - 1);
    }

    // Companies commit to a dividend policy for 10 turns so payouts are visible and persistent.
    const profit = (c.revenue || 0) * (c.profitMargin || 0);
    const dividendPayout = Math.max(0, profit * clamp(Number(c.dividendPolicyPayout || 0.3), 0.2, 0.72));
    c.profitDistributed = dividendPayout;
    
    // Distribute to shareholders (population + company investors)
    const totalShares = (c.sharesOutstanding || 1);
    const perShareDividend = dividendPayout / Math.max(1, totalShares);
    localPerShare[c.id] = perShareDividend;
    
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
          const grossInvestmentIncome = Math.max(0, shares * perShareDividend);
          const maxPassThrough = Math.max(0.35, Number(investorCo.revenue || 0) * 0.3 + Number(investorCo.cashReserves || 0) * 0.02);
          const recognizedIncome = Math.min(grossInvestmentIncome, maxPassThrough);
          investorCo.investmentIncome = Math.max(0, Number(investorCo.investmentIncome || 0) + recognizedIncome);
          investorCo.dividendIncome = Math.max(0, Number(investorCo.dividendIncome || 0) + recognizedIncome);
          investorCo.revenue = (investorCo.revenue || 0) + recognizedIncome;
          investorCo.cashReserves = Math.max(0, Number(investorCo.cashReserves || 0) + recognizedIncome * 0.65);
        }
      });
    }
  });

  // Sovereign portfolios receive dividends from both domestic and foreign holdings.
  Object.entries(sovereignPortfolio.stockHoldings || {}).forEach(([companyId, pos]) => {
    const shares = Math.max(0, Number(pos?.shares || 0));
    if (!shares) return;
    let perShareDividend = Number(localPerShare[companyId] || 0);
    if (!perShareDividend) {
      const found = getGlobalCompanyById(companyId);
      if (!found || !found.company) return;
      const c = found.company;
      const profit = Math.max(0, Number(c.revenue || 0) * Number(c.profitMargin || 0));
      const payout = profit * clamp(0.3 + (Number(c.techTier || 1) * 0.04), 0.3, 0.5);
      perShareDividend = payout / Math.max(1, Number(c.sharesOutstanding || 1));
    }
    sovereignPortfolio.dividendReceived += shares * perShareDividend;
  });
  
  // Add dividend to nation treasury/employment income (citizens feel wealthier, boost consumption)
  const citizenTreasuryShare = portfolio.dividendReceived * 0.35;
  const sovereignTreasuryShare = sovereignPortfolio.dividendReceived;
  if (nation.id === GAME.playerNation?.id) {
    GAME.treasury += citizenTreasuryShare + sovereignTreasuryShare;
    nation.treasury = GAME.treasury;
  } else if (nation.treasury !== undefined) {
    nation.treasury += citizenTreasuryShare + sovereignTreasuryShare;
  }

  nation.consumptionDividendBoost = (portfolio.dividendReceived || 0) * 0.65;
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
    const availableCash = Math.max(0, Number(investor.cashReserves || 0));
    const investmentBudget = Math.min(availableCash, Math.max(0, (investor.revenue || 0) * Math.max(0, investor.profitMargin || 0) * 0.25));
    const candidates = nation.companies.filter(target =>
      target !== investor &&
      target.sector !== investor.sector &&
      target.public
    );

    if (candidates.length === 0) return;
    const target = candidates
      .slice()
      .sort((a, b) => Number(b.profitMargin || 0) - Number(a.profitMargin || 0))[Math.floor(Math.random() * Math.min(3, candidates.length))];

    const sharesToBuy = Math.min(
      Math.floor((investmentBudget * 1_000_000) / Math.max(0.1, target.stockPrice || 0)),
      Math.floor((target.sharesOutstanding || 0) * 0.01)
    );

    if (sharesToBuy < 1000) return;

    const targetOutstanding = Math.max(1, Number(target.sharesOutstanding || 1));
    const heldShares = getCompanyTotalHeldShares(target);
    const remainingFloat = Math.max(0, targetOutstanding - heldShares);
    const buyShares = Math.min(sharesToBuy, Math.floor(remainingFloat));
    if (buyShares < 1000) return;

    if (!nation.companyInvestments[investor.id]) nation.companyInvestments[investor.id] = {};
    nation.companyInvestments[investor.id][target.id] = (nation.companyInvestments[investor.id][target.id] || 0) + buyShares;
    target.companyOwnedShares = clamp(Number(target.companyOwnedShares || 0) + buyShares, 0, targetOutstanding);
    investor.cashReserves = Math.max(0, availableCash - ((buyShares * Math.max(0.1, target.stockPrice || 0)) / 1_000_000));
  });
}

// ─── PROCESS ALL ECONOMIC SYSTEMS ─────────────────────

function processAllEconomicSystems() {
  Object.values(NATIONS).forEach(nation => {
    if (nation.failedState) return;
    
    initNationIndustries(nation);
    ensureNationFinanceLedger(nation);
    
    // 1. Generate new companies (education-dependent)
    generateNationCompanies(nation, false);
    
    // 2. Update existing companies
    updateNationCompanies(nation);

    // 2.25. Product-layer simulation: real product lines, sourcing, bottlenecks, and R&D.
    if (typeof processCompanyProductEngine === 'function') {
      processCompanyProductEngine(nation);
    }

    // Ensure each nation has listed companies so ownership ecosystems can form.
    ensureNationPublicListings(nation);

    // 2.5. Capital markets: households, sovereign funds, cross-company ownership, dividends
    updatePopulationStockInvestments(nation);
    updateSovereignStockInvestments(nation);
    updateCompanyInvestments(nation);
    processDividends(nation);
    
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

      const govBudget = nation.aiBudget || { military: 20, economy: 15, diplomacy: 10, intelligence: 10, education: 5, social: 20 };
      const totalBudgetPct = govBudget.military + govBudget.economy + govBudget.diplomacy + govBudget.intelligence + (govBudget.education ?? govBudget.space ?? 0) + govBudget.social;
      const spendingMultiplier = taxData.total / Math.max(totalBudgetPct, 1);

      const rawCategorySpending = {
        military: govBudget.military * spendingMultiplier * 1.2,
        economy: govBudget.economy * spendingMultiplier * 1.0,
        diplomacy: govBudget.diplomacy * spendingMultiplier * 0.8,
        intelligence: govBudget.intelligence * spendingMultiplier * 0.7,
        education: (govBudget.education ?? govBudget.space) * spendingMultiplier * 0.9,
        social: govBudget.social * spendingMultiplier * 1.1,
      };
      const rawGovSpending = Object.values(rawCategorySpending).reduce((sum, value) => sum + value, 0);

      // Debt service (% of tax revenue based on debt ratio, realistic ~2-5% of revenue)
      const rawDebtService = taxData.total * (nation.debtRatio || 40) * 0.0005;

      // Revenue includes taxes + actual company tax paid (companyTaxPaid is in $M)
      let companyTaxCollected = 0;
      (nation.companies || []).forEach(c => { companyTaxCollected += c.taxPaid || 0; });
      const totalRevenue = taxData.total + companyTaxCollected;

      let categorySpending = { ...rawCategorySpending };
      let debtService = rawDebtService;
      let totalExpenses = rawGovSpending + debtService;
      if (typeof getNationCashAwareSpendingPlan === 'function') {
        const spendingPlan = getNationCashAwareSpendingPlan(nation, {
          taxData,
          govBudget,
          debtService: rawDebtService,
          totalRevenue,
          spendingMultiplier,
        });
        if (spendingPlan && spendingPlan.category) {
          categorySpending = {
            military: Math.max(0, Number(spendingPlan.category.military) || 0),
            economy: Math.max(0, Number(spendingPlan.category.economy) || 0),
            diplomacy: Math.max(0, Number(spendingPlan.category.diplomacy) || 0),
            intelligence: Math.max(0, Number(spendingPlan.category.intelligence) || 0),
            education: Math.max(0, Number(spendingPlan.category.education) || Number(spendingPlan.category.space) || 0),
            social: Math.max(0, Number(spendingPlan.category.social) || 0),
          };
          debtService = Math.max(0, Number(spendingPlan.debtService) || 0);
          totalExpenses = Math.max(0, Number(spendingPlan.totalExpenses) || 0);
        }
      }

      recordNationFinanceFlow(nation, 'inflows', 'taxes', taxData.total);
      recordNationFinanceFlow(nation, 'inflows', 'company_taxes', companyTaxCollected);
      recordNationFinanceFlow(nation, 'outflows', 'military', categorySpending.military);
      recordNationFinanceFlow(nation, 'outflows', 'economy', categorySpending.economy);
      recordNationFinanceFlow(nation, 'outflows', 'diplomacy', categorySpending.diplomacy);
      recordNationFinanceFlow(nation, 'outflows', 'intelligence', categorySpending.intelligence);
      recordNationFinanceFlow(nation, 'outflows', 'education', categorySpending.education || categorySpending.space || 0);
      recordNationFinanceFlow(nation, 'outflows', 'social', categorySpending.social);
      recordNationFinanceFlow(nation, 'outflows', 'debt_service', debtService);

      nation.treasury += Math.round(totalRevenue - totalExpenses);
      nation.treasury = Math.max(0, nation.treasury);

      const deficitChange = (totalExpenses - totalRevenue) / (nation.gdp * 1_000_000 / 12 || 1);
      nation.deficit = clamp(
        (nation.deficit || 0) + deficitChange * 0.5,
        -12, 35
      );
    }
  });

  rebuildGlobalOwnershipLedgers();
  
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
  const cadenceMonths = getEconomicUpdateMonths();
  const nationMonthlyGDP = Math.max(1, Number(nation.gdp || 0.1) * 1_000_000 / 12); // $M/month
  
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
    // DIMINISHING: large companies grow slower (realistic: small startups can grow 20%/yr, megacorps grow 2-3%/yr)
    const sizeGrowthDrag = company.size === 'corporation' ? 0.3 : company.size === 'large' ? 0.5 : company.size === 'medium' ? 0.7 : 1.0;
    const innovationBonus = company.sector === 'technology' ? clamp((tech - 3) * 0.0008, 0, 0.004) : 0;
    const eduBonus = clamp((edu - 30) * 0.00008, -0.002, 0.002);
    const randomShock = (Math.random() - 0.5) * 0.012 * Math.sqrt(cadenceMonths);
    
    // Monthly growth rate: realistic range -8% to +8% per month for small companies, -2% to +2% for corps
    const maxMonthlyGrowth = 0.08 * sizeGrowthDrag;
    const minMonthlyGrowth = -0.08;
    company.growthRate = clamp(
      company.growthRate * Math.pow(0.7, cadenceMonths) +
      (innovationBonus + eduBonus + sectorBonus + energyDrag + randomShock + typeDef.growthBias * 0.3 + spilloverBonus * 0.03) * sizeGrowthDrag * cadenceMonths,
      minMonthlyGrowth, maxMonthlyGrowth
    );
    
    // REVENUE: base × growth × resource multiplier × research multiplier
    // This is the core supply chain: resources × tech × edu = output
    const baseRevenueBefore = company.revenue;
    const compoundedGrowth = Math.pow(Math.max(0.05, 1 + company.growthRate), cadenceMonths);
    company.revenue = Math.max(0.0005, company.revenue * compoundedGrowth * resourceMult * rMult * demandPriceMult * marketPower * (1 - competitionPenalty));
    const dominanceShare = company.revenue / Math.max(1, nationMonthlyGDP);
    if (dominanceShare > 0.22) {
      company.growthRate = clamp(company.growthRate - Math.min(0.03, (dominanceShare - 0.22) * 0.18), -0.08, maxMonthlyGrowth);
      company.profitMargin = clamp(Number(company.profitMargin || 0.08) - Math.min(0.05, (dominanceShare - 0.22) * 0.12), 0.02, 0.5);
    }
    
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
    // DIMINISHING: each tier is exponentially harder than the last
    const unlockedTier = getNationUnlockedCompanyTier(nation, company.sector);
    const tier = clamp(Number(company.techTier || 1), 1, 10);
    const nextTier = Math.min(10, tier + 1);
    // Exponential difficulty: T1→T2 = 15, T5→T6 = 80, T9→T10 = 200
    const tierDifficulty = 15 + (nextTier - 1) * (nextTier * 2);
    const resourceReq = INDUSTRY_SECTORS.find(s => s.id === company.sector)?.resourceReq;
    const resourceLevel = resourceReq ? Number(nation.resourceData?.[resourceReq]?.level || 0) : Number(nation.resources || 0);
    const resourceGate = (SECTOR_TIER_RESOURCE_GATES[company.sector] || SECTOR_TIER_RESOURCE_GATES.services)[nextTier] || 100;
    // Companies with strategic focus spend more on R&D
    const focusBonus = company.strategicFocus === company.sector ? 2.0 : 1.0;
    const rndInvestment = Math.max(0, company.revenue * (0.008 + typeDef.rndBias * 0.02) * focusBonus);
    company.techProgress = Number(company.techProgress || 0) + rndInvestment * clamp((edu + tech * 8 + nation.governance) / 170, 0.4, 1.6) * cadenceMonths;
    // Breakthrough chance: rare, harder at higher tiers
    const breakthroughChanceMonthly = clamp(0.001 + (typeDef.rndBias * 0.002) + (nation.education - 40) * 0.00002 - (company.techTier || 1) * 0.0003, 0.0003, 0.012);
    const breakthroughChance = 1 - Math.pow(1 - breakthroughChanceMonthly, cadenceMonths);
    const canAdvance = tier < unlockedTier && resourceLevel >= resourceGate && company.techProgress >= tierDifficulty;
    if (canAdvance && Math.random() < breakthroughChance) {
      company.techTier = tier + 1;
      company.breakthroughs = Number(company.breakthroughs || 0) + 1;
      company.techProgress = Math.max(0, company.techProgress - tierDifficulty * 0.6);
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
    company.distressMonths = isDistressed
      ? (Number(company.distressMonths || 0) + cadenceMonths)
      : Math.max(0, Number(company.distressMonths || 0) - cadenceMonths);
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
    const sizeGrowthMult = clamp(1 + company.growthRate * 3.4, 0.85, 2.8); // growth rate amplifies size upgrade odds
    const smallUpgradeChance = 1 - Math.pow(1 - clamp(0.12 * sizeGrowthMult, 0, 0.7), cadenceMonths);
    const mediumUpgradeChance = 1 - Math.pow(1 - clamp(0.09 * sizeGrowthMult, 0, 0.68), cadenceMonths);
    const largeUpgradeChance = 1 - Math.pow(1 - clamp(0.06 * sizeGrowthMult, 0, 0.65), cadenceMonths);
    if (company.size === 'small' && company.revenue > 3.5 && Math.random() < smallUpgradeChance) {
      company.size = 'medium';
      addNews(`📊 ${getCompanyDisplayName(company)} (${nation.name}) expands to medium business`, 'minor');
    } else if (company.size === 'medium' && company.revenue > 11 && Math.random() < mediumUpgradeChance) {
      company.size = 'large';
      addNews(`📈 ${getCompanyDisplayName(company)} (${nation.name}) becomes a large enterprise`, 'minor');
    } else if (company.size === 'large' && company.revenue > 30 && Math.random() < largeUpgradeChance) {
      company.size = 'corporation';
      if (!company.public && Math.random() > 0.4) {
        company.public = true;
        company.stockPrice = 15 + Math.random() * 85;
        company.sharesOutstanding = company.sharesOutstanding || ((15 + Math.floor(Math.random() * 235)) * 1_000_000);
        company.marketCap = (Math.max(0.01, Number(company.stockPrice || 0.1)) * Math.max(1, Number(company.sharesOutstanding || 1))) / 1_000_000;
        seedInitialPublicOwnership(nation, company, 'ipo-transition');
        addNews(`📈 ${getCompanyDisplayName(company)} (${nation.name}) goes public at $${company.stockPrice.toFixed(0)}/share`, 'minor');
      }
    }
    
    // Compute tax paid
    const taxConfig = TAX_BY_GOVERNMENT[nation.governmentStyle] || TAX_BY_GOVERNMENT.federal_republic;
    const effectiveRate = company.public ? taxConfig.corp * 1.1 : taxConfig.corp;
    company.taxPaid = company.revenue * effectiveRate * (1 - nation.corruption / 200) * cadenceMonths;
    company.worth = estimateCompanyWorth(company);

    const monthlyProfit = Number(company.revenue || 0) * Number(company.profitMargin || 0);
    company.cashReserves = Math.max(0, Number(company.cashReserves || 0) + Math.max(0, monthlyProfit) * 0.28 * cadenceMonths);
    if (!Array.isArray(company.revenueHistory)) company.revenueHistory = [];
    if (!Array.isArray(company.profitHistory)) company.profitHistory = [];
    if (!Array.isArray(company.marketCapHistory)) company.marketCapHistory = [];
    company.revenueHistory.push(Number(company.revenue || 0));
    company.profitHistory.push(monthlyProfit);
    company.marketCapHistory.push(Number(company.marketCap || 0));
    if (company.revenueHistory.length > 12) company.revenueHistory.shift();
    if (company.profitHistory.length > 12) company.profitHistory.shift();
    if (company.marketCapHistory.length > 12) company.marketCapHistory.shift();
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
      let spillover = 0;
      if (Number(target.techProgress || 0) > 0) {
        spillover = Math.max(0, Number(target.techProgress || 0) * 0.35);
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
// Each turn = 1 month. Real-world developed economies grow ~2-3%/year = ~0.2%/month.
// Developing economies can grow 5-8%/year = ~0.4-0.6%/month.
// This model uses DIMINISHING RETURNS — the richer you are, the slower you grow.

function updateNationGDP(nation, taxData) {
  const gov = getGovernmentProfile(nation.governmentStyle);
  const cadenceMonths = getEconomicUpdateMonths();
  const decisionFactor = clamp((nation.decisionQuality || 55) / 65, 0.85, 1.2);
  const nationMonthlyGDP = Math.max(1, Number(nation.gdp || 0.1) * 1_000_000 / 12); // $M/month
  
  // ── ECONOMIC MOMENTUM FROM BOOM PHASE ──────────────
  const boomPhase = computeBoomPhase(nation);
  const boomMomentum = boomPhase.momentum; // -1 to +1
  const inRecession = boomPhase.phase === 'recession' || boomPhase.phase === 'depression';
  
  // ── DIMINISHING RETURNS: rich economies grow slower ──
  // GDP scale factor: $25T economy grows at ~25% of the speed of a $1T economy
  const gdpScale = clamp(1.0 - (nation.gdp / 35) * 0.85, 0.15, 1.0);
  
  // ── REALISTIC BASE: tiny organic drift ──
  let baseGrowth = 0;
  if (nation.stability > 55 && nation.inflation < 10 && nation.debtRatio < 90) {
    baseGrowth = 0.0003; // ~0.03% / month = ~0.36% / year organic drift
  }
  
  // ── INNOVATION BOOST (diminishing with GDP) ──
  const techFactor = clamp(nation.techLevel / 10, 0.2, 1.0);
  const eduFactor = clamp(nation.education / 60, 0.2, 1.3);
  const govFactor = clamp(nation.governance / 55, 0.3, 1.2);
  
  const innovationEngine = (
    eduFactor * 0.3 + techFactor * 0.5 + govFactor * 0.2
  ) * 0.0008 * gov.innovationBoost * gdpScale; // max ~+0.08%/mo at peak, less for rich
  
  // ── PRODUCTIVITY BOOST (diminishing with GDP) ──
  const infraFactor = clamp(nation.infrastructure / 55, 0.2, 1.2);
  const factoryFactor = clamp(nation.factories / 55, 0.2, 1.2);
  const energyFactor = clamp(nation.energySecurity / 55, 0.2, 1.2);
  const jobsFactor = clamp(nation.jobs / 55, 0.2, 1.2);
  
  const productivityEngine = (
    infraFactor * 0.35 + factoryFactor * 0.30 + energyFactor * 0.20 + jobsFactor * 0.15
  ) * 0.0005 * gov.econBoost * gdpScale; // max ~+0.06%/mo, less for rich
  
  // ── COMPANY REVENUE → GDP CONTRIBUTION ──
  let totalCompanyRevenue = 0;
  let totalCompanyProfit = 0;
  let sectorGrowth = 0;
  INDUSTRY_SECTORS.forEach(sector => {
    const data = nation.industries[sector.id];
    if (data) {
      totalCompanyRevenue += data.totalRevenue || 0;
      sectorGrowth += (data.growthRate || 0) * 0.15;
    }
  });
  (nation.companies || []).forEach(company => {
    totalCompanyProfit += Math.max(0, Number(company.revenue || 0) * Number(company.profitMargin || 0));
  });
  sectorGrowth = clamp(sectorGrowth, -0.004, 0.006);
  
  // Company activity contribution now uses revenue and profit shares of national monthly GDP.
  const companyRevenueShare = totalCompanyRevenue / Math.max(1, nationMonthlyGDP);
  const companyProfitShare = totalCompanyProfit / Math.max(1, nationMonthlyGDP);
  const companyGDPBoost = clamp(companyRevenueShare * 0.0012 + companyProfitShare * 0.0024, 0, 0.0045);
  
  // ── CATCH-UP FOR POOR NATIONS (only if they have decent governance) ──
  let catchUpGrowth = 0;
  if (nation.gdp < 3 && nation.governance > 35) {
    const gap = clamp((3 - nation.gdp) / 3, 0, 1);
    const capability = clamp((nation.governance + nation.education) / 120, 0, 1);
    catchUpGrowth = gap * capability * 0.0015; // max +0.15%/mo for very poor nations
  }
  
  // ── PENALTIES ──
  const inflationPenalty = nation.inflation > 4
    ? clamp((nation.inflation - 4) * 0.0002, 0, 0.005) : 0;
  const debtPenalty = nation.debtRatio > 70
    ? clamp((nation.debtRatio - 70) * 0.00004, 0, 0.004) : 0;
  const inequalityPenalty = nation.inequality > 50
    ? clamp((nation.inequality - 50) * 0.00006, 0, 0.003) : 0;
  const corruptionPenalty = nation.corruption > 35
    ? clamp((nation.corruption - 35) * 0.00005, 0, 0.003) : 0;
  const warPenalty = getWarPressure(nation.id || '') * 0.003; // up to -0.3%
  const recessionPenalty = inRecession
    ? clamp((nation.recessionMonths || 0) * 0.00015, 0, 0.004) : 0;
  // ── RESOURCE ABUNDANCE / BOTTLENECK ──
  const resourcePenalty = nation.resources < 35
    ? clamp((35 - nation.resources) * 0.0001, 0, 0.004) : 0;
  const resourceBonus = nation.resources > 65
    ? clamp((nation.resources - 65) * 0.00006, 0, 0.002) : 0;
  // ── ENERGY BOTTLENECK ──
  const energyPenalty = nation.energySecurity < 35
    ? clamp((35 - nation.energySecurity) * 0.00008, 0, 0.003) : 0;
  
  // ── TAX DRAG (higher taxes slightly reduce growth) ──
  const taxDrag = taxData.rates.corp * 0.001 + taxData.rates.income * 0.0005;
  
  // ── GDP PER CAPITA TAX POWER ──
  const gdpPerCapita = nation.gdp / (nation.population / 1000);
  const incomeTaxPower = clamp(gdpPerCapita * 0.5, 0.5, 3.0);
  const employmentQuality = clamp(nation.jobs / 60, 0.3, 1.5);
  const populationTaxPower = clamp((incomeTaxPower * employmentQuality - 1) * 0.0005, -0.002, 0.003);
  
  // ── GDP GROWTH RATE ──
  const rawGrowth = 
    baseGrowth + innovationEngine + productivityEngine +
    sectorGrowth + companyGDPBoost + catchUpGrowth + populationTaxPower -
    inflationPenalty - debtPenalty - inequalityPenalty -
    corruptionPenalty - warPenalty - recessionPenalty - taxDrag -
    resourcePenalty - energyPenalty + resourceBonus;
  
  // Boom momentum feeds in subtly
  const boomBoost = clamp(boomMomentum * 0.001, -0.001, 0.001);
  
  // ── REALISTIC CAPS: developed max ~0.25%/mo (3%/yr), developing max ~0.5%/mo (6%/yr) ──
  const maxGrowth = nation.gdp > 10 ? 0.0025 : nation.gdp > 3 ? 0.004 : 0.005;
  const minGrowth = nation.gdp > 10 ? -0.006 : -0.008;
  
  const gdpGrowthRate = clamp(
    (rawGrowth + boomBoost) * decisionFactor,
    minGrowth, maxGrowth
  );
  
  // ── BOOM OVERHEAT TRACKING ──
  if (boomPhase.phase === 'boom' && (boomPhase.boomRisk || 0) > 0.3) {
    nation.boomOverheat = (nation.boomOverheat || 0) + cadenceMonths;
  } else {
    nation.boomOverheat = Math.max(0, (nation.boomOverheat || 0) - cadenceMonths);
  }
  const overheatPenalty = clamp((nation.boomOverheat || 0) * 0.0001, 0, 0.003);
  const finalGrowth = gdpGrowthRate - overheatPenalty;
  
  // ── APPLY GDP CHANGE ──
  nation.gdp = clamp(
    nation.gdp * Math.pow(Math.max(0.92, 1 + finalGrowth), cadenceMonths) + (Math.random() - 0.5) * 0.0003 * cadenceMonths,
    0.03, 35
  );
  
  // ── TRACK RECESSION ──
  if (finalGrowth < -0.0002) {
    nation.recessionMonths = clamp((nation.recessionMonths || 0) + cadenceMonths, 0, 240);
  } else if ((nation.recessionMonths || 0) > 0) {
    nation.recessionMonths = clamp(nation.recessionMonths - cadenceMonths, 0, 240);
  }
  
  // ── BOOM CRASH (rare correction) ──
  const crashChance = 1 - Math.pow(1 - 0.08, cadenceMonths);
  if ((nation.boomOverheat || 0) > 20 && Math.random() < crashChance) {
    const crash = -0.002 - Math.random() * 0.004;
    nation.gdp = clamp(nation.gdp * (1 + crash), 0.03, 35);
    nation.boomOverheat = 0;
  }
}

// ─── STOCK MARKET ─────────────────────────────────────

function updateNationStockMarket(nation) {
  const gov = getGovernmentProfile(nation.governmentStyle);
  
  // Count public companies
  const publicCompanies = nation.companies.filter(c => c.public);
  const ipoMomentum = publicCompanies.length > 0 ? 0.15 : -0.1;
  
  // Corporate earnings drive stocks (scaled down)
  const earningsSignal = clamp(nation.corporateEarnings / 250, -1, 1.5);
  
  // Economic fundamentals (scaled down)
  const gdpSignal = ((nation.gdp - 5) / 50) * 0.25;
  const stabilitySignal = (nation.stability - 50) * 0.01;
  const governanceSignal = (nation.governance - 50) * 0.01;
  const inflationPenalty = nation.inflation * 0.08;
  const warPenalty = getWarPressure(nation.id || '') * 0.6;
  
  // Boom/bust cycle
  const boomPhase = computeBoomPhase(nation);
  const boomSignal = boomPhase.phase === 'boom' ? 0.8 : boomPhase.phase === 'recession' ? -0.8 : 0;
  
  // Random volatility (reduced)
  const volatility = (Math.random() - 0.5) * 1.5;
  
  // Crash risk: if market overheated
  if ((nation.stockMarket || 100) > 180 && Math.random() < 0.04) {
    const crash = 8 + Math.random() * 15;
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
    const fairPrice = estimateFairStockPrice(company);
    const valuationGap = fairPrice > 0 ? (fairPrice - prev) / fairPrice : 0;
    const momentumMove = (change / 100) + (Math.random() - 0.5) * sectorVolatility * 0.05 + clamp((company.growthRate || 0) * 0.25, -0.03, 0.05);
    const reversionMove = clamp(valuationGap * 0.18, -0.05, 0.05);
    const move = clamp(momentumMove + reversionMove, -0.08, 0.08);
    company.stockPrice = Math.max(0.1, prev * (1 + move));
    company.stockPrice = clamp(company.stockPrice, Math.max(0.1, fairPrice * 0.45), Math.max(0.25, fairPrice * 3.2));
    company.stockChangePct = ((company.stockPrice - prev) / prev) * 100;
    const shares = Math.max(1, Number(company.sharesOutstanding || 50_000_000));
    const hardMarketCapCap = Math.max(600, Number(nation.gdp || 0.1) * 1_000_000 * 0.7);
    company.marketCap = clamp(company.stockPrice * shares / 1_000_000, 0.01, hardMarketCapCap);
    company.stockPrice = Math.max(0.01, (company.marketCap * 1_000_000) / shares);
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
  ensureNationFinanceLedger(player);
  
  let totalTaxRevenue = Number(player.taxRevenue) || 0;
  if (totalTaxRevenue <= 0) {
    const taxData = computeNationTaxRevenue(player);
    totalTaxRevenue = taxData.total;
    player.taxRevenue = totalTaxRevenue;
  }
  
  // Budget spending (convert percentages to $M)
  const budget = GAME.budget;
  const totalBudgetPct = budget.military + budget.economy + budget.diplomacy + budget.intelligence + (budget.education ?? budget.space ?? 0) + budget.social;
  const spendingMultiplier = totalTaxRevenue / Math.max(totalBudgetPct, 1);
  
  const spending = (
    budget.military * spendingMultiplier * 1.2 +
    budget.economy * spendingMultiplier * 1.0 +
    budget.diplomacy * spendingMultiplier * 0.8 +
    budget.intelligence * spendingMultiplier * 0.7 +
    (budget.education ?? budget.space) * spendingMultiplier * 0.9 +
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

  recordNationFinanceFlow(player, 'inflows', 'taxes', totalTaxRevenue);
  recordNationFinanceFlow(player, 'inflows', 'company_taxes', companyTaxCollected);
  recordNationFinanceFlow(player, 'outflows', 'military', budget.military * spendingMultiplier * 1.2);
  recordNationFinanceFlow(player, 'outflows', 'economy', budget.economy * spendingMultiplier * 1.0);
  recordNationFinanceFlow(player, 'outflows', 'diplomacy', budget.diplomacy * spendingMultiplier * 0.8);
  recordNationFinanceFlow(player, 'outflows', 'intelligence', budget.intelligence * spendingMultiplier * 0.7);
  recordNationFinanceFlow(player, 'outflows', 'education', (budget.education ?? budget.space) * spendingMultiplier * 0.9);
  recordNationFinanceFlow(player, 'outflows', 'social', budget.social * spendingMultiplier * 1.1);
  recordNationFinanceFlow(player, 'outflows', 'debt_service', debtService);
  
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
  const brands = getGlobalBrandMarketView();
  const topWorth = brands.slice().sort((a, b) => b.totalWorth - a.totalWorth).slice(0, limit);
  const topRevenue = brands.slice().sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, limit);
  const topProfit = brands.slice().sort((a, b) => b.totalProfit - a.totalProfit).slice(0, limit);
  const gainers = brands.filter(b => b.listedCount > 0).slice().sort((a, b) => b.avgMove - a.avgMove).slice(0, Math.max(5, Math.floor(limit / 2)));
  const losers = brands.filter(b => b.listedCount > 0).slice().sort((a, b) => a.avgMove - b.avgMove).slice(0, Math.max(5, Math.floor(limit / 2)));
  const globalCap = brands.reduce((sum, b) => sum + Math.max(0, Number(b.totalMarketCap || 0)), 0);
  const totalCorporateValue = brands.reduce((sum, b) => sum + Math.max(0, Number(b.totalWorth || 0)), 0);
  const listedBrandCount = brands.filter(b => b.listedCount > 0).length;
  const avgMove = brands.filter(b => b.listedCount > 0).reduce((sum, b) => sum + Number(b.avgMove || 0), 0) / Math.max(1, listedBrandCount);
  const stamp = (typeof formatDate === 'function' && GAME?.date) ? formatDate(GAME.date) : 'Now';

  const renderRows = (list, valueLabel) => {
    if (list.length === 0) return '<p class="empty">No companies yet.</p>';
    return '<div style="max-height:240px;overflow-y:auto">' + list.map((r, i) =>
      '<button class="btn-sm" data-econ-brand="' + r.key + '" style="width:100%;display:flex;gap:8px;align-items:center;padding:5px 6px;border:0;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px;text-align:left;background:transparent">' +
      '<span style="color:var(--text-muted);width:20px">#' + (i + 1) + '</span>' +
      '<span style="flex:1">' + r.name + ' <span style="color:var(--text-muted)">(' + r.countryCount + ' countries)</span></span>' +
      '<span style="color:var(--accent-green);font-weight:600">' + valueLabel(r) + '</span>' +
      '</button>'
    ).join('') + '</div>';
  };

  let html = '<div class="section-card"><h4>🌐 Global Company Market</h4>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:6px;margin-bottom:8px">';
  html += '<div class="resource-item"><span class="r-name">Listed Brands</span><span class="r-val">' + listedBrandCount + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Global Cap</span><span class="r-val" style="color:var(--accent-blue)">' + formatMarketMoney(globalCap) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Total Corporate Value</span><span class="r-val" style="color:var(--accent-yellow)">' + formatMarketMoney(totalCorporateValue) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Avg Daily Move</span><span class="r-val" style="color:' + (avgMove >= 0 ? 'var(--accent-green)' : 'var(--accent-red)') + '">' + avgMove.toFixed(2) + '%</span></div>';
  html += '<div class="resource-item"><span class="r-name">Snapshot</span><span class="r-val">Turn ' + (GAME?.turn || 0) + ' • ' + stamp + '</span></div>';
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:8px">';
  html += '<div><h5 style="margin:2px 0 6px 0">Top Company Worth</h5>' + renderRows(topWorth, r => formatMarketMoney(r.totalWorth)) + '</div>';
  html += '<div><h5 style="margin:2px 0 6px 0">Top Revenue Leaders</h5>' + renderRows(topRevenue, r => formatMarketMoney(r.totalRevenue)) + '</div>';
  html += '<div><h5 style="margin:2px 0 6px 0">Top Profit Leaders</h5>' + renderRows(topProfit, r => formatMarketMoney(r.totalProfit)) + '</div>';
  html += '<div><h5 style="margin:2px 0 6px 0">Listed Gainers / Losers</h5>';
  html += '<div style="max-height:240px;overflow-y:auto">';
  html += gainers.map(r => '<button class="btn-sm" data-econ-brand="' + r.key + '" style="width:100%;display:flex;justify-content:space-between;padding:4px 6px;border:0;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px;text-align:left;background:transparent"><span>📈 ' + r.name + '</span><span style="color:var(--accent-green)">+' + r.avgMove.toFixed(2) + '%</span></button>').join('');
  html += losers.map(r => '<button class="btn-sm" data-econ-brand="' + r.key + '" style="width:100%;display:flex;justify-content:space-between;padding:4px 6px;border:0;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px;text-align:left;background:transparent"><span>📉 ' + r.name + '</span><span style="color:var(--accent-red)">' + r.avgMove.toFixed(2) + '%</span></button>').join('');
  html += '</div></div>';
  html += '</div></div>';

  // ── DEFENSE COMPANIES MARKET SECTION ─────────────
  html += renderDefenseCompanyMarketBlock();

  return html;
}

// Build the defense companies block for the Global Company Market
function renderDefenseCompanyMarketBlock() {
  if (typeof DEFENSE_COMPANIES === 'undefined') return '';

  const founded = DEFENSE_COMPANIES.filter(c => c.foundedBy !== null);
  if (founded.length === 0) return '';

  // Init financials for any company that lacks them
  if (typeof initDefenseCompanyFinancials === 'function') {
    founded.forEach(c => initDefenseCompanyFinancials(c));
  }

  // Separate public vs private
  const publicCos  = founded.filter(c => {
    const n = Object.values(NATIONS).find(na => na.id === c.foundedBy);
    return typeof isPublicDefenseCompany === 'function' ? isPublicDefenseCompany(c, n) : false;
  });
  const privateCos = founded.filter(c => !publicCos.includes(c));

  // Sort by market value
  const byValue = (a, b) => {
    const va = typeof getDefenseCompanyMarketValue === 'function' ? getDefenseCompanyMarketValue(a) : 0;
    const vb = typeof getDefenseCompanyMarketValue === 'function' ? getDefenseCompanyMarketValue(b) : 0;
    return vb - va;
  };
  const topPublic  = [...publicCos].sort(byValue).slice(0, 6);
  const topPrivate = [...privateCos].sort(byValue).slice(0, 4);

  // Top movers/losers by last revenue entry
  const withHistory = founded.filter(c => (c.priceHistory || []).length >= 2);
  const movers = withHistory.map(c => {
    const last = c.priceHistory[c.priceHistory.length - 1]?.revenue || 0;
    const prev = c.priceHistory[c.priceHistory.length - 2]?.revenue || last;
    return { c, delta: last - prev };
  }).sort((a, b) => b.delta - a.delta);
  const gainers = movers.filter(m => m.delta > 0).slice(0, 3);
  const losers  = movers.filter(m => m.delta < 0).slice(-3).reverse();

  const totalDefCap = founded.reduce((s, c) =>
    s + (typeof getDefenseCompanyMarketValue === 'function' ? getDefenseCompanyMarketValue(c) : 0), 0);

  let html = '<div class="section-card" style="margin-top:10px"><h4>🏭 Defense Industry Market</h4>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px;margin-bottom:8px">';
  html += '<div class="resource-item"><span class="r-name">Active Companies</span><span class="r-val">' + founded.length + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Public Listed</span><span class="r-val">' + publicCos.length + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">State-Owned</span><span class="r-val">' + privateCos.length + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Defense Market Cap</span><span class="r-val" style="color:var(--accent-yellow)">$' + totalDefCap.toFixed(0) + 'M</span></div>';
  html += '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:8px">';

  // Public listings
  if (topPublic.length > 0) {
    html += '<div><h5 style="margin:2px 0 6px 0">📈 Public Listed</h5><div style="max-height:200px;overflow-y:auto">';
    topPublic.forEach((co, i) => {
      const n = Object.values(NATIONS).find(na => na.id === co.foundedBy);
      const val = typeof getDefenseCompanyMarketValue === 'function' ? getDefenseCompanyMarketValue(co) : 0;
      const pnl = (co.totalRevenue || 0) - (co.totalResearchCost || 0);
      html += '<button class="btn-sm" onclick="if(typeof openTab===\'function\') openTab(\'defensecos\')" style="width:100%;display:flex;gap:6px;align-items:center;padding:5px 6px;border:0;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px;text-align:left;background:transparent">';
      html += '<span style="color:var(--text-muted);width:18px">#' + (i+1) + '</span>';
      html += '<span style="flex:1">' + co.name + ' <span style="color:var(--text-muted)">(' + (n ? n.flag + n.name : co.foundedBy) + ')</span></span>';
      html += '<span style="color:var(--accent-yellow)">$' + val.toFixed(0) + 'M</span>';
      html += '<span style="color:' + (pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)') + ';font-size:10px">' + (pnl >= 0 ? '+' : '') + '$' + pnl.toFixed(0) + '</span>';
      html += '</button>';
    });
    html += '</div></div>';
  }

  // State-owned companies
  if (topPrivate.length > 0) {
    html += '<div><h5 style="margin:2px 0 6px 0">🔒 State-Owned</h5><div style="max-height:200px;overflow-y:auto">';
    topPrivate.forEach((co, i) => {
      const n = Object.values(NATIONS).find(na => na.id === co.foundedBy);
      const val = typeof getDefenseCompanyMarketValue === 'function' ? getDefenseCompanyMarketValue(co) : 0;
      html += '<div style="display:flex;gap:6px;align-items:center;padding:5px 6px;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px">';
      html += '<span style="color:var(--text-muted);width:18px">#' + (i+1) + '</span>';
      html += '<span style="flex:1">' + co.name + ' <span style="color:var(--text-muted)">(' + (n ? n.flag + n.name : co.foundedBy) + ')</span></span>';
      html += '<span style="color:var(--accent-blue)">$' + val.toFixed(0) + 'M</span>';
      html += '</div>';
    });
    html += '</div></div>';
  }

  // Movers/losers
  if (gainers.length > 0 || losers.length > 0) {
    html += '<div><h5 style="margin:2px 0 6px 0">Defense Movers</h5><div style="max-height:200px;overflow-y:auto">';
    gainers.forEach(({ c, delta }) => {
      html += '<div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px">';
      html += '<span>📈 ' + c.name.split(' ')[0] + '</span><span style="color:var(--accent-green)">+$' + delta.toFixed(1) + 'M</span>';
      html += '</div>';
    });
    losers.forEach(({ c, delta }) => {
      html += '<div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px">';
      html += '<span>📉 ' + c.name.split(' ')[0] + '</span><span style="color:var(--accent-red)">-$' + Math.abs(delta).toFixed(1) + 'M</span>';
      html += '</div>';
    });
    html += '</div></div>';
  }

  html += '</div>'; // grid
  html += '<div style="margin-top:6px;font-size:10px;color:var(--text-muted)">Public companies can participate in the global stock market. State-owned companies are controlled by their founding government. View full rankings in the <button class="btn-sm" onclick="if(typeof openTab===\'function\') openTab(\'defensecos\')" style="font-size:10px;padding:1px 6px">🏭 DefCo tab</button>.</div>';
  html += '</div>';
  return html;
}

// ─── RENDER ECONOMY TAB ───────────────────────────────

const ECONOMY_UI_STATE = {
  section: 'macro',
  companyId: null,
  companySort: 'worth',
  companySector: 'all',
  brandKey: null,
};

function getEconomyViewNation() {
  const selected = NATIONS?.[GAME?.selectedNation];
  if (selected) return selected;
  return (typeof getPlayerRecord === 'function' ? getPlayerRecord() : null) || GAME.playerNation;
}

function getBudgetForNation(nation, taxData) {
  const isPlayer = nation.id === GAME.playerNation?.id;
  const b = isPlayer ? (GAME.budget || {}) : (nation.aiBudget || { military: 25, economy: 20, diplomacy: 10, intelligence: 10, education: 8, social: 27 });
  const totalPct = Number(b.military || 0) + Number(b.economy || 0) + Number(b.diplomacy || 0) + Number(b.intelligence || 0) + Number(b.education ?? b.space ?? 0) + Number(b.social || 0);
  const multiplier = Number(taxData.total || 0) / Math.max(1, totalPct);
  return {
    military: Number(b.military || 0) * multiplier,
    economy: Number(b.economy || 0) * multiplier,
    diplomacy: Number(b.diplomacy || 0) * multiplier,
    intelligence: Number(b.intelligence || 0) * multiplier,
    education: Number(b.education ?? b.space ?? 0) * multiplier,
    social: Number(b.social || 0) * multiplier,
    totalPct,
  };
}

function renderSeriesChart(values, stroke) {
  const points = (Array.isArray(values) ? values : []).filter(v => Number.isFinite(Number(v))).map(v => Number(v));
  if (!points.length) return '<div class="empty">No history yet.</div>';
  const trimmed = points.slice(-12);
  const max = Math.max(...trimmed);
  const min = Math.min(...trimmed);
  const spread = Math.max(0.0001, max - min);
  const w = 320;
  const h = 80;
  const coords = trimmed.map((v, i) => {
    const x = (i / Math.max(1, trimmed.length - 1)) * (w - 8) + 4;
    const y = h - 6 - ((v - min) / spread) * (h - 12);
    return x.toFixed(1) + ',' + y.toFixed(1);
  }).join(' ');
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:86px;background:rgba(9,28,54,0.45);border:1px solid var(--border-color);border-radius:6px"><polyline fill="none" stroke="' + stroke + '" stroke-width="2" points="' + coords + '" /></svg>';
}

function getCompanyProductProfile(company) {
  if (Array.isArray(company?.productLines) && company.productLines.length > 0 && typeof getProductDef === 'function') {
    return company.productLines
      .slice()
      .sort((a, b) => Number(b.monthlySupply || 0) - Number(a.monthlySupply || 0))
      .slice(0, 2)
      .map(line => line.displayName || getProductDef(line.productId)?.label || line.productId)
      .join(' | ');
  }
  const tier = Math.max(1, Number(company.techTier || 1));
  const map = {
    agriculture: ['grain exports', 'processed food', 'agri biotech seeds', 'precision farming systems'],
    manufacturing: ['consumer goods', 'industrial tooling', 'automation lines', 'advanced materials'],
    energy: ['power generation', 'grid services', 'storage systems', 'clean energy platforms'],
    technology: ['software services', 'cloud platforms', 'ai systems', 'semiconductor design'],
    services: ['banking services', 'insurance packages', 'fintech rails', 'digital private banking'],
    tourism: ['hospitality', 'air/rail packages', 'luxury travel', 'immersive destination services'],
  };
  const list = map[company.sector] || ['general business services'];
  if (tier <= 2) return list[0];
  if (tier <= 4) return list[1] || list[0];
  if (tier <= 7) return list[2] || list[list.length - 1];
  return list[3] || list[list.length - 1];
}

function renderCompanyOwnership(company) {
  const shares = Math.max(1, Number(company.sharesOutstanding || 1));
  const popPct = clamp((Number(company.populationOwnedShares || 0) / shares) * 100, 0, 100);
  const companyPct = clamp((Number(company.companyOwnedShares || 0) / shares) * 100, 0, 100);
  const sovereignOwners = company.sovereignOwners || {};
  const sovereignRows = Object.entries(sovereignOwners)
    .map(([nationId, held]) => {
      const ownerNation = NATIONS[nationId];
      const pct = clamp((Number(held || 0) / shares) * 100, 0, 100);
      return { name: ownerNation ? ownerNation.name : nationId, pct, flag: ownerNation?.flag || '🏛️' };
    })
    .filter(r => r.pct > 0.01)
    .sort((a, b) => b.pct - a.pct);
  const sovereignPct = sovereignRows.reduce((sum, r) => sum + r.pct, 0);
  const accounted = popPct + companyPct + sovereignPct;
  const privatePct = clamp(100 - accounted, 0, 100);

  let barOffset = 0;
  const barSegments = [
    { label: 'Population', pct: popPct, color: '#4fc3f7' },
    { label: 'Cross-Holdings', pct: companyPct, color: '#81c784' },
    { label: 'Government', pct: sovereignPct, color: '#ffb74d' },
    { label: 'Private/Float', pct: privatePct, color: '#b0bec5' },
  ];
  const barHtml = barSegments.map(seg => {
    const width = Math.max(0, seg.pct);
    const part = '<div title="' + seg.label + ' ' + seg.pct.toFixed(2) + '%" style="position:absolute;left:' + barOffset.toFixed(3) + '%;top:0;height:100%;width:' + width.toFixed(3) + '%;background:' + seg.color + '"></div>';
    barOffset += width;
    return part;
  }).join('');

  let html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:6px">';
  html += '<div class="resource-item"><span class="r-name">Population</span><span class="r-val">' + popPct.toFixed(2) + '%</span></div>';
  html += '<div class="resource-item"><span class="r-name">Company Cross-Holdings</span><span class="r-val">' + companyPct.toFixed(2) + '%</span></div>';
  html += '<div class="resource-item"><span class="r-name">Government Holdings</span><span class="r-val">' + sovereignPct.toFixed(2) + '%</span></div>';
  html += '<div class="resource-item"><span class="r-name">Private / Free Float</span><span class="r-val">' + privatePct.toFixed(2) + '%</span></div>';
  html += '</div>';
  html += '<div style="margin-top:8px">';
  html += '<div style="position:relative;height:14px;border:1px solid var(--border-color);border-radius:999px;overflow:hidden;background:rgba(9,28,54,0.45)">' + barHtml + '</div>';
  html += '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;font-size:11px;color:var(--text-secondary)">';
  html += barSegments.map(seg => '<span><span style="display:inline-block;width:8px;height:8px;background:' + seg.color + ';border-radius:50%;margin-right:4px"></span>' + seg.label + '</span>').join('');
  html += '</div></div>';
  if (sovereignRows.length) {
    html += '<div style="margin-top:8px;font-size:11px;color:var(--text-secondary)">Government ownership:</div>';
    html += sovereignRows.map(r => '<div style="font-size:11px;padding-top:2px">' + r.flag + ' ' + r.name + ': <span style="color:var(--accent-blue)">' + r.pct.toFixed(2) + '%</span></div>').join('');
  }
  return html;
}

function renderCompanyCompetitionLayer(nation, company) {
  if (typeof getCompanyCompetitionSnapshot !== 'function') {
    return '<div class="section-card"><p class="empty">Competition layer unavailable.</p></div>';
  }
  const snapshot = getCompanyCompetitionSnapshot(nation, company);
  const rivals = Array.isArray(snapshot.rivals) ? snapshot.rivals : [];
  const ownProduct = snapshot.productId && typeof getProductDef === 'function' ? getProductDef(snapshot.productId)?.label || snapshot.productId : (company.sector || 'general');

  let html = '<div class="section-card"><h4>🥊 Competition Layer</h4>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:6px">';
  html += '<div class="resource-item"><span class="r-name">Arena</span><span class="r-val">' + ownProduct + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Overall Score</span><span class="r-val">' + Number(snapshot.overallScore || 0).toFixed(1) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Trajectory</span><span class="r-val ' + (Number(snapshot.trajectory || 0) >= 0 ? 'positive' : 'negative') + '">' + (Number(snapshot.trajectory || 0) >= 0 ? '+' : '') + Number(snapshot.trajectory || 0).toFixed(1) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Tracked Rivals</span><span class="r-val">' + rivals.length + '</span></div>';
  html += '</div>';

  if (!rivals.length) {
    html += '<p class="empty" style="margin-top:8px">No comparable rivals detected yet.</p></div>';
    return html;
  }

  const deltaColor = (value, higherIsBetter = true) => {
    if (Math.abs(Number(value || 0)) < 0.001) return 'var(--text-secondary)';
    const positive = higherIsBetter ? value > 0 : value < 0;
    return positive ? 'var(--accent-red)' : 'var(--accent-green)';
  };
  const renderDelta = (value, formatter, higherIsBetter = true) => {
    const num = Number(value || 0);
    const sign = num > 0 ? '+' : '';
    return '<span style="color:' + deltaColor(num, higherIsBetter) + '">' + sign + formatter(num) + '</span>';
  };

  html += '<div style="margin-top:8px"><strong>Rival Comparison</strong>';
  html += '<div style="max-height:320px;overflow-y:auto;margin-top:6px">';
  rivals.forEach((rival, idx) => {
    const comp = rival.company;
    html += '<div style="padding:8px 0;border-bottom:1px solid rgba(84,140,196,0.12)">';
    html += '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center">';
    html += '<div><span style="color:var(--text-muted)">#' + (idx + 1) + '</span> ' + rival.nation.flag + ' ' + getCompanyDisplayName(comp) + '</div>';
    html += '<div style="color:var(--accent-yellow)">Overall ' + Number(rival.overall || 0).toFixed(1) + ' (' + renderDelta(rival.deltaOverall, v => Math.abs(v).toFixed(1)) + ')</div>';
    html += '</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px;margin-top:6px;font-size:11px">';
    html += '<div>Stock: ' + (comp.public ? ('$' + Number(rival.stock || 0).toFixed(2)) : 'Private') + ' • ' + renderDelta(rival.deltaStock, v => '$' + Math.abs(v).toFixed(2)) + '</div>';
    html += '<div>Revenue: ' + formatMarketMoney(rival.revenue || 0) + ' • ' + renderDelta(rival.deltaRevenue, v => formatMarketMoney(Math.abs(v))) + '</div>';
    html += '<div>Innovation: ' + Number(rival.innovation || 0).toFixed(1) + ' • ' + renderDelta(rival.deltaInnovation, v => Math.abs(v).toFixed(1)) + '</div>';
    html += '<div>Supply Chain: ' + Number(rival.supply || 0).toFixed(1) + '% • ' + renderDelta(rival.deltaSupply, v => Math.abs(v).toFixed(1) + '%') + '</div>';
    html += '<div>Trajectory: ' + (Number(rival.trajectory || 0) >= 0 ? '+' : '') + Number(rival.trajectory || 0).toFixed(1) + ' • ' + renderDelta(rival.deltaTrajectory, v => Math.abs(v).toFixed(1)) + '</div>';
    html += '<div>Innovation Edge: ' + (Number(rival.deltaInnovation || 0) > 0 ? 'Rival ahead' : Number(rival.deltaInnovation || 0) < 0 ? 'You lead' : 'Even') + '</div>';
    html += '</div>';
    html += '</div>';
  });
  html += '</div></div>';
  return html + '</div>';
}

function renderCompanyDetailCard(nation, company) {
  if (!company) return '<div class="section-card"><p class="empty">Select a company to view analytics.</p></div>';
  const profit = Number(company.revenue || 0) * Number(company.profitMargin || 0);
  const worth = Number(company.worth || estimateCompanyWorth(company));
  const investorsIn = Object.values(nation.companyInvestments || {}).reduce((count, holdings) => count + (holdings?.[company.id] ? 1 : 0), 0);
  const products = getCompanyProductProfile(company);
  const listed = !!company.public;
  const productLines = Array.isArray(company.productLines) ? company.productLines : [];
  const productMetrics = company.productMetrics || { importCost: 0, researchSpend: 0, bottleneck: 0 };

  let html = '<div class="section-card">';
  html += '<h4>🏢 ' + getCompanyDisplayName(company) + ' • ' + nation.flag + ' ' + nation.name + '</h4>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:6px">';
  html += '<div class="resource-item"><span class="r-name">Sector</span><span class="r-val">' + company.sector + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Listing</span><span class="r-val" style="color:' + (listed ? 'var(--accent-green)' : 'var(--accent-yellow)') + '">' + (listed ? 'Public' : 'Private') + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Products</span><span class="r-val">' + products + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Stock Price</span><span class="r-val" style="color:var(--accent-blue)">' + (listed ? ('$' + Number(company.stockPrice || 0).toFixed(2)) : 'Private') + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Stock Move</span><span class="r-val" style="color:' + (Number(company.stockChangePct || 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)') + '">' + (listed ? ((Number(company.stockChangePct || 0) >= 0 ? '+' : '') + Number(company.stockChangePct || 0).toFixed(2) + '%') : 'n/a') + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Revenue</span><span class="r-val">' + formatMarketMoney(company.revenue) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Profit</span><span class="r-val" style="color:var(--accent-green)">' + formatMarketMoney(profit) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Dividends</span><span class="r-val">' + formatMarketMoney(company.profitDistributed) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Worth</span><span class="r-val" style="color:var(--accent-yellow)">' + formatMarketMoney(worth) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Investors In</span><span class="r-val">' + investorsIn + ' companies</span></div>';
  html += '<div class="resource-item"><span class="r-name">Research Spend</span><span class="r-val">' + formatMarketMoney(productMetrics.researchSpend || 0) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Import Cost</span><span class="r-val">' + formatMarketMoney(productMetrics.importCost || 0) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Supply Bottleneck</span><span class="r-val ' + ((Number(productMetrics.bottleneck || 0) < 0.25) ? 'positive' : 'negative') + '">' + (Number(productMetrics.bottleneck || 0) * 100).toFixed(1) + '%</span></div>';
  html += '</div>';
  if (productLines.length > 0) {
    html += '<div style="margin-top:8px"><strong>Real Product Lines</strong>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:6px;margin-top:6px">';
    productLines.forEach(line => {
      const imports = Array.isArray(line.imports) ? line.imports : [];
      html += '<div style="background:rgba(9,28,54,0.45);border:1px solid var(--border-color);border-radius:6px;padding:8px">';
      html += '<div style="font-weight:600">' + (line.displayName || line.productId) + '</div>';
      html += '<div style="font-size:11px;color:var(--text-secondary)">Tech ' + Number(line.techLevel || 1) + ' • Demand Served ' + (Number(line.demandServed || 0) * 100).toFixed(1) + '% • Input Cover ' + (Number(line.inputCoverage || 0) * 100).toFixed(1) + '%</div>';
      html += '<div style="font-size:11px;color:var(--accent-blue);padding-top:2px">Demand ' + formatMarketMoney(line.monthlyDemand || 0) + ' • Supply ' + formatMarketMoney(line.monthlySupply || 0) + '</div>';
      if (imports.length > 0) {
        html += '<div style="font-size:11px;color:var(--text-secondary);padding-top:4px">Imports: ' + imports.map(item => item.id + ' from ' + item.from).join(' | ') + '</div>';
      }
      html += '</div>';
    });
    html += '</div></div>';
  }
  html += renderCompanyCompetitionLayer(nation, company);
  html += '<div style="margin-top:8px"><strong>1Y Price History</strong>' + (listed ? renderSeriesChart(company.priceHistory, 'var(--accent-blue)') : '<div class="empty">Private company (no exchange price history).</div>') + '</div>';
  html += '<div style="margin-top:8px"><strong>Ownership Breakdown</strong>' + renderCompanyOwnership(company) + '</div>';
  if (!listed) {
    html += '<div style="margin-top:6px;font-size:11px;color:var(--text-secondary)">Entity investment buckets apply to listed companies. This company is private until it lists.</div>';
  }
  html += '</div>';
  return html;
}

function renderGlobalBrandBreakdownCard(brand) {
  if (!brand) return '<div class="section-card"><p class="empty">Select a global brand to view country-by-country breakdown.</p></div>';
  const entries = (brand.entries || []).slice().sort((a, b) => Number(b.worth || 0) - Number(a.worth || 0));
  const brandCounts = getGlobalCompanyBrandCounts();
  let html = '<div class="section-card"><h4>🌐 ' + brand.name + ' Global Breakdown</h4>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:6px">';
  html += '<div class="resource-item"><span class="r-name">Countries</span><span class="r-val">' + brand.countryCount + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Total Worth</span><span class="r-val" style="color:var(--accent-yellow)">' + formatMarketMoney(brand.totalWorth) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Total Revenue</span><span class="r-val">' + formatMarketMoney(brand.totalRevenue) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Total Profit</span><span class="r-val" style="color:var(--accent-green)">' + formatMarketMoney(brand.totalProfit) + '</span></div>';
  html += '</div>';
  html += '<div style="margin-top:8px"><strong>Per-country entities</strong>';
  html += entries.map((entry, idx) => {
    const c = entry.company;
    return '<div style="display:grid;grid-template-columns:22px 1fr auto auto auto;gap:8px;padding:5px 0;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px">' +
      '<span style="color:var(--text-muted)">#' + (idx + 1) + '</span>' +
      '<span>' + entry.nation.flag + ' ' + getCompanyDisplayName(c, { brandCounts, forceCountryTag: true }) + '</span>' +
      '<span style="color:var(--accent-blue)">Rev ' + formatMarketMoney(entry.revenue) + '</span>' +
      '<span style="color:var(--accent-green)">Pft ' + formatMarketMoney(entry.profit) + '</span>' +
      '<span style="color:var(--accent-yellow)">W ' + formatMarketMoney(entry.worth) + '</span>' +
      '</div>';
  }).join('');
  html += '</div></div>';
  return html;
}

function renderEconomyTab() {
  const p = getEconomyViewNation();
  if (!p) return '<div class="tab-error">No nation selected</div>';

  initNationIndustries(p);
  const taxData = computeNationTaxRevenue(p);
  const budgetSpend = getBudgetForNation(p, taxData);
  const allCompanies = Array.isArray(p.companies) ? p.companies : [];
  const listed = allCompanies.filter(c => c.public);
  const snapshot = getNationStockMarketSnapshot(p);
  const stamp = (typeof formatDate === 'function' && GAME?.date) ? formatDate(GAME.date) : 'Now';
  const playerNation = (typeof getPlayerRecord === 'function' ? getPlayerRecord() : null) || GAME.playerNation;

  if (!ECONOMY_UI_STATE.companyId || !allCompanies.some(c => c.id === ECONOMY_UI_STATE.companyId)) {
    ECONOMY_UI_STATE.companyId = allCompanies[0]?.id || null;
  }

  const portfolio = p.populationPortfolio || { totalInvested: 0, dividendReceived: 0 };
  const sovereign = p.sovereignPortfolio || { totalInvested: 0, dividendReceived: 0, stockHoldings: {} };
  let selectedCompany = allCompanies.find(c => c.id === ECONOMY_UI_STATE.companyId) || null;

  let html = '<div class="tab-content" id="economy-tab-root">';
  html += '<div class="section-card" style="padding:10px 12px;margin-bottom:10px;background:linear-gradient(135deg,rgba(9,28,54,0.9),rgba(16,43,79,0.9))">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">';
  html += '<div style="font-size:13px;font-weight:700;color:var(--accent-blue)">📊 ' + p.flag + ' ' + p.name + ' Economy View</div>';
  html += '<div style="font-size:11px;color:var(--text-muted)">Turn ' + (GAME?.turn || 0) + ' • ' + stamp + '</div>';
  html += '</div>';
  html += '<div style="margin-top:8px;display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:6px">';
  html += '<div class="resource-item"><span class="r-name">GDP</span><span class="r-val">$' + Number(p.gdp || 0).toFixed(2) + 'T</span></div>';
  html += '<div class="resource-item"><span class="r-name">Treasury</span><span class="r-val" style="color:var(--accent-green)">' + formatMarketMoney(Number(p.treasury || 0)) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Exchange Index</span><span class="r-val">' + Number(p.stockMarket || 100).toFixed(2) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Listed / Cap</span><span class="r-val">' + snapshot.listed + ' / ' + formatMarketMoney(snapshot.marketCap) + '</span></div>';
  html += '</div></div>';

  html += '<div class="section-card" style="padding:8px;display:flex;gap:6px;flex-wrap:wrap">';
  html += '<button class="btn-sm ' + (ECONOMY_UI_STATE.section === 'macro'        ? 'btn-primary' : '') + '" data-econ-section="macro">🏛️ Macro</button>';
  html += '<button class="btn-sm ' + (ECONOMY_UI_STATE.section === 'investments'  ? 'btn-primary' : '') + '" data-econ-section="investments">💼 Investments</button>';
  html += '<button class="btn-sm ' + (ECONOMY_UI_STATE.section === 'companies'    ? 'btn-primary' : '') + '" data-econ-section="companies">🏢 Companies</button>';
  html += '<button class="btn-sm ' + (ECONOMY_UI_STATE.section === 'education'    ? 'btn-primary' : '') + '" data-econ-section="education">🎓 Education</button>';
  html += '</div>';

  if (ECONOMY_UI_STATE.section === 'macro') {
    html += '<div class="section-card"><h4>🏦 Government Spending & Revenue</h4>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:6px">';
    html += '<div class="resource-item"><span class="r-name">Tax Revenue</span><span class="r-val">' + formatMarketMoney(taxData.total) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Military Spend</span><span class="r-val">' + formatMarketMoney(budgetSpend.military) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Economy Spend</span><span class="r-val">' + formatMarketMoney(budgetSpend.economy) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Social Spend</span><span class="r-val">' + formatMarketMoney(budgetSpend.social) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Diplomacy + Intel</span><span class="r-val">' + formatMarketMoney(budgetSpend.diplomacy + budgetSpend.intelligence) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Education</span><span class="r-val">' + formatMarketMoney(budgetSpend.education || budgetSpend.space) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Inflation</span><span class="r-val ' + (Number(p.inflation || 0) <= 5 ? 'positive' : 'negative') + '">' + Number(p.inflation || 0).toFixed(2) + '%</span></div>';
    html += '<div class="resource-item"><span class="r-name">Debt / GDP</span><span class="r-val ' + (Number(p.debtRatio || 0) <= 80 ? 'positive' : 'negative') + '">' + Number(p.debtRatio || 0).toFixed(1) + '%</span></div>';
    html += '</div></div>';

    if (playerNation && playerNation.id !== p.id) {
      const pTax = computeNationTaxRevenue(playerNation);
      const rows = [
        {
          label: 'GDP',
          left: Number(p.gdp || 0),
          right: Number(playerNation.gdp || 0),
          fmt: v => '$' + v.toFixed(2) + 'T',
          invert: false,
        },
        {
          label: 'Tax Revenue',
          left: Number(taxData.total || 0),
          right: Number(pTax.total || 0),
          fmt: v => formatMarketMoney(v),
          invert: false,
        },
        {
          label: 'Inflation',
          left: Number(p.inflation || 0),
          right: Number(playerNation.inflation || 0),
          fmt: v => v.toFixed(2) + '%',
          invert: true,
        },
        {
          label: 'Debt/GDP',
          left: Number(p.debtRatio || 0),
          right: Number(playerNation.debtRatio || 0),
          fmt: v => v.toFixed(1) + '%',
          invert: true,
        },
        {
          label: 'Stock Index',
          left: Number(p.stockMarket || 0),
          right: Number(playerNation.stockMarket || 0),
          fmt: v => v.toFixed(2),
          invert: false,
        },
      ];

      html += '<div class="section-card"><h4>⚖️ Compare vs Player Nation</h4>';
      html += '<div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px">Left: ' + p.flag + ' ' + p.name + ' • Right: ' + playerNation.flag + ' ' + playerNation.name + '</div>';
      html += rows.map(r => {
        const delta = r.left - r.right;
        const better = r.invert ? delta < 0 : delta > 0;
        const color = delta === 0 ? 'var(--text-secondary)' : (better ? 'var(--accent-green)' : 'var(--accent-red)');
        const sign = delta > 0 ? '+' : '';
        return '<div style="display:grid;grid-template-columns:1fr auto 1fr auto;gap:8px;padding:5px 0;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px">' +
          '<span style="text-align:left">' + r.fmt(r.left) + '</span>' +
          '<span style="color:var(--text-muted)">' + r.label + '</span>' +
          '<span style="text-align:right">' + r.fmt(r.right) + '</span>' +
          '<span style="color:' + color + '">' + sign + r.fmt(delta) + '</span>' +
          '</div>';
      }).join('');
      html += '</div>';
    }
  }

  if (ECONOMY_UI_STATE.section === 'investments') {
    const sovereignRows = Object.entries(sovereign.stockHoldings || {})
      .map(([companyId, pos]) => {
        const found = getGlobalCompanyById(companyId);
        if (!found) return null;
        const company = found.company;
        const host = found.nation;
        const shares = Number(pos?.shares || 0);
        if (shares <= 0) return null;
        return {
          company,
          host,
          shares,
          value: shares * Math.max(0.01, Number(company.stockPrice || 0.1)) / 1_000_000,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);

    html += '<div class="section-card"><h4>💼 Capital Flows</h4>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:6px">';
    html += '<div class="resource-item"><span class="r-name">Population Invested</span><span class="r-val">' + formatMarketMoney(portfolio.totalInvested || 0) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Population Dividends</span><span class="r-val" style="color:var(--accent-green)">' + formatMarketMoney(portfolio.dividendReceived || 0) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Sovereign Invested</span><span class="r-val">' + formatMarketMoney(sovereign.totalInvested || 0) + '</span></div>';
    html += '<div class="resource-item"><span class="r-name">Sovereign Dividends</span><span class="r-val" style="color:var(--accent-blue)">' + formatMarketMoney(sovereign.dividendReceived || 0) + '</span></div>';
    html += '</div>';
    html += '<div style="margin-top:8px"><strong>Sovereign holdings (domestic + foreign)</strong>';
    html += sovereignRows.length
      ? sovereignRows.map(r => '<div style="font-size:11px;padding-top:4px;border-bottom:1px solid rgba(84,140,196,0.1)">' + r.host.flag + ' ' + getCompanyDisplayName(r.company) + ' • Shares ' + Math.round(r.shares).toLocaleString() + ' • Value <span style="color:var(--accent-blue)">' + formatMarketMoney(r.value) + '</span></div>').join('')
      : '<p class="empty">No sovereign equity positions yet.</p>';
    html += '</div></div>';
  }

  if (ECONOMY_UI_STATE.section === 'education') {
    if (typeof renderEducationPanel === 'function') {
      const econNationId = p.id || (ECONOMY_UI_STATE.viewNationId) || (GAME.playerNation && GAME.playerNation.id);
      html += renderEducationPanel(p, econNationId);
    } else {
      html += '<div class="section-card"><p class="empty">Education system not loaded.</p></div>';
    }
  }

  if (ECONOMY_UI_STATE.section === 'companies') {
    const filteredCompanies = allCompanies.filter(c => {
      if (ECONOMY_UI_STATE.companySector === 'all') return true;
      return c.sector === ECONOMY_UI_STATE.companySector;
    });

    const sortedCompanies = filteredCompanies.slice().sort((a, b) => {
      switch (ECONOMY_UI_STATE.companySort) {
        case 'revenue':
          return Number(b.revenue || 0) - Number(a.revenue || 0);
        case 'gainers':
          return Number(b.stockChangePct || 0) - Number(a.stockChangePct || 0);
        case 'dividend': {
          const ay = Number(a.stockPrice || 0) > 0 ? (Number(a.profitDistributed || 0) / Math.max(0.01, Number(a.stockPrice || 1))) : 0;
          const by = Number(b.stockPrice || 0) > 0 ? (Number(b.profitDistributed || 0) / Math.max(0.01, Number(b.stockPrice || 1))) : 0;
          return by - ay;
        }
        case 'worth':
        default:
          return Number(b.worth || 0) - Number(a.worth || 0);
      }
    });

    if (ECONOMY_UI_STATE.companyId && !sortedCompanies.some(c => c.id === ECONOMY_UI_STATE.companyId)) {
      ECONOMY_UI_STATE.companyId = sortedCompanies[0]?.id || null;
    }
    selectedCompany = sortedCompanies.find(c => c.id === ECONOMY_UI_STATE.companyId) || null;

    html += '<div class="section-card"><h4>🏢 Company Explorer</h4>';
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">';
    html += '<button class="btn-sm ' + (ECONOMY_UI_STATE.companySort === 'worth' ? 'btn-primary' : '') + '" data-econ-sort="worth">Worth</button>';
    html += '<button class="btn-sm ' + (ECONOMY_UI_STATE.companySort === 'revenue' ? 'btn-primary' : '') + '" data-econ-sort="revenue">Revenue</button>';
    html += '<button class="btn-sm ' + (ECONOMY_UI_STATE.companySort === 'gainers' ? 'btn-primary' : '') + '" data-econ-sort="gainers">Top Gainers</button>';
    html += '<button class="btn-sm ' + (ECONOMY_UI_STATE.companySort === 'dividend' ? 'btn-primary' : '') + '" data-econ-sort="dividend">Dividend Yield</button>';
    html += '</div>';
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">';
    html += '<button class="btn-sm ' + (ECONOMY_UI_STATE.companySector === 'all' ? 'btn-primary' : '') + '" data-econ-sector="all">All Sectors</button>';
    INDUSTRY_SECTORS.forEach(sector => {
      html += '<button class="btn-sm ' + (ECONOMY_UI_STATE.companySector === sector.id ? 'btn-primary' : '') + '" data-econ-sector="' + sector.id + '">' + sector.icon + ' ' + sector.label + '</button>';
    });
    html += '</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:6px">';
    sortedCompanies.forEach(company => {
      const profit = Number(company.revenue || 0) * Number(company.profitMargin || 0);
      html += '<button class="btn-sm" data-econ-company="' + company.id + '" style="text-align:left;padding:8px;border:' + (company.id === ECONOMY_UI_STATE.companyId ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)') + '">';
      html += '<div style="font-weight:600">' + getCompanyDisplayName(company) + '</div>';
      html += '<div style="font-size:11px;color:var(--text-secondary)">' + company.sector + ' • T' + Number(company.techTier || 1) + ' • ' + (company.public ? 'Public' : 'Private') + '</div>';
      html += '<div style="font-size:11px;color:var(--accent-green)">Rev ' + formatMarketMoney(company.revenue) + ' • Pft ' + formatMarketMoney(profit) + '</div>';
      html += '</button>';
    });
    if (!sortedCompanies.length) {
      html += '<p class="empty">No companies match this filter.</p>';
    }
    html += '</div></div>';
    html += renderCompanyDetailCard(p, selectedCompany);

    const globalBrands = getGlobalBrandMarketView().sort((a, b) => Number(b.totalWorth || 0) - Number(a.totalWorth || 0));
    if (!ECONOMY_UI_STATE.brandKey || !globalBrands.some(b => b.key === ECONOMY_UI_STATE.brandKey)) {
      ECONOMY_UI_STATE.brandKey = globalBrands[0]?.key || null;
    }
    const selectedBrand = globalBrands.find(b => b.key === ECONOMY_UI_STATE.brandKey) || null;

    html += '<div class="section-card"><h4>🌍 Merged Global Brands</h4>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:6px">';
    globalBrands.slice(0, 24).forEach(brand => {
      html += '<button class="btn-sm" data-econ-brand="' + brand.key + '" style="text-align:left;padding:8px;border:' + (brand.key === ECONOMY_UI_STATE.brandKey ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)') + '">';
      html += '<div style="font-weight:600">' + brand.name + '</div>';
      html += '<div style="font-size:11px;color:var(--text-secondary)">' + brand.countryCount + ' countries • ' + brand.listedCount + ' listed entities</div>';
      html += '<div style="font-size:11px;color:var(--accent-yellow)">Worth ' + formatMarketMoney(brand.totalWorth) + '</div>';
      html += '</button>';
    });
    html += '</div></div>';
    html += renderGlobalBrandBreakdownCard(selectedBrand);
  }

  html += renderGlobalStockMarketBoard(10);
  html += '</div>';
  return html;
}

function attachEconomyTabInteractions() {
  const root = document.getElementById('economy-tab-root');
  if (!root) return;

  root.querySelectorAll('[data-econ-section]').forEach(btn => {
    btn.addEventListener('click', () => {
      ECONOMY_UI_STATE.section = btn.getAttribute('data-econ-section') || 'macro';
      if (typeof renderTabContent === 'function') renderTabContent('econ');
    });
  });

  root.querySelectorAll('[data-econ-company]').forEach(btn => {
    btn.addEventListener('click', () => {
      ECONOMY_UI_STATE.section = 'companies';
      ECONOMY_UI_STATE.companyId = btn.getAttribute('data-econ-company');
      if (typeof renderTabContent === 'function') renderTabContent('econ');
    });
  });

  root.querySelectorAll('[data-econ-sort]').forEach(btn => {
    btn.addEventListener('click', () => {
      ECONOMY_UI_STATE.companySort = btn.getAttribute('data-econ-sort') || 'worth';
      ECONOMY_UI_STATE.section = 'companies';
      if (typeof renderTabContent === 'function') renderTabContent('econ');
    });
  });

  root.querySelectorAll('[data-econ-sector]').forEach(btn => {
    btn.addEventListener('click', () => {
      ECONOMY_UI_STATE.companySector = btn.getAttribute('data-econ-sector') || 'all';
      ECONOMY_UI_STATE.section = 'companies';
      if (typeof renderTabContent === 'function') renderTabContent('econ');
    });
  });

  root.querySelectorAll('[data-econ-brand]').forEach(btn => {
    btn.addEventListener('click', () => {
      ECONOMY_UI_STATE.brandKey = btn.getAttribute('data-econ-brand');
      ECONOMY_UI_STATE.section = 'companies';
      if (typeof renderTabContent === 'function') renderTabContent('econ');
    });
  });
}

// ─── EXPOSE GLOBAL ────────────────────────────────────

window.renderEconomyTab = renderEconomyTab;
window.renderEconomyTabExternal = renderEconomyTab;
window.attachEconomyTabInteractions = attachEconomyTabInteractions;
window.initNationIndustries = initNationIndustries;
window.processAllEconomicSystems = processAllEconomicSystems;
window.updateNationGDP = updateNationGDP;
window.updateNationStockMarket = updateNationStockMarket;
window.getNationStockMarketSnapshot = getNationStockMarketSnapshot;
window.renderGlobalStockMarketBoard = renderGlobalStockMarketBoard;
