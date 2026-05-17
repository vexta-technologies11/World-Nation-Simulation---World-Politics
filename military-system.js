// ============================================================
// MILITARY SYSTEM — Defense Companies, Equipment, Tech Eras
// ============================================================
// 52 fictional defense companies, 8 tech eras (WW1→futuristic),
// 500+ equipment items, company founding, research, production,
// purchasing system. NO real companies or country references.
// ============================================================

// ─── TECH ERAS ────────────────────────────────────────
const MILITARY_ERAS = {
  ERA1: { name: "Great War",       techMin: 1.0, techMax: 2.5, label: "WW1 Era" },
  ERA2: { name: "Interwar",        techMin: 2.5, techMax: 4.0, label: "Interwar" },
  ERA3: { name: "Second War",      techMin: 4.0, techMax: 5.5, label: "WW2 Era" },
  ERA4: { name: "Early Cold War",  techMin: 5.5, techMax: 7.0, label: "Early Cold War" },
  ERA5: { name: "Late Cold War",   techMin: 7.0, techMax: 8.0, label: "Late Cold War" },
  ERA6: { name: "Modern",          techMin: 8.0, techMax: 9.0, label: "Modern" },
  ERA7: { name: "Near Future",     techMin: 9.0, techMax: 9.5, label: "Near Future" },
  ERA8: { name: "Futuristic",      techMin: 9.5, techMax: 10.0, label: "Futuristic" },
};

function safeNum(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getEraForTechLevel(techLevel) {
  const eras = Object.values(MILITARY_ERAS);
  for (let i = eras.length - 1; i >= 0; i--) {
    if (techLevel >= eras[i].techMin) return eras[i];
  }
  return eras[0];
}

function getEraIndex(eraLabel) {
  const labels = Object.values(MILITARY_ERAS).map(e => e.label);
  return labels.indexOf(eraLabel);
}

// ─── 52 FICTIONAL DEFENSE COMPANIES ────────────────────
// NO real-world names or country references.
// Each starts at Tier 1 when founded and researches upward.
const DEFENSE_COMPANIES = [
  { id: "co_01", name: "Aegis Dynamics", desc: "Advanced aeronautics and missile systems", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_02", name: "Ironforge Armaments", desc: "Heavy armor and artillery platforms", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_03", name: "Crimson Shipworks", desc: "Naval combat vessels and submarines", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_04", name: "Stormforge Industries", desc: "Multi-domain defense electronics", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_05", name: "Vanguard Systems", desc: "Future combat aircraft and drones", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_06", name: "Silverback Ordnance", desc: "Small arms and infantry equipment", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_07", name: "Northcliff Technologies", desc: "Satellite and space defense systems", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_08", name: "Ashford Munitions", desc: "Artillery rockets and guided munitions", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_09", name: "Copperhead Marine", desc: "Amphibious assault and naval landing craft", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_10", name: "Dusk Aviation", desc: "Stealth bombers and reconnaissance aircraft", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_11", name: "Thunderchild Propulsion", desc: "Jet engines and missile propulsion", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_12", name: "Voidwalker Systems", desc: "Electronic warfare and cyber defense", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_13", name: "Grandforge Heavy Industries", desc: "Main battle tanks and armored vehicles", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_14", name: "Peregrine Defense", desc: "Light attack aircraft and training jets", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_15", name: "Ravenwing Dynamics", desc: "Helicopters and vertical lift systems", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_16", name: "Obsidian Naval", desc: "Destroyers and anti-submarine warfare", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_17", name: "Scarab Industries", desc: "Ballistic missile and rocket systems", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_18", name: "Wolfpack Armory", desc: "Infantry weapons and tactical gear", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_19", name: "Hightower Defense", desc: "Anti-air systems and point defense", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_20", name: "Coral Sea Shipbuilding", desc: "Aircraft carriers and fleet support", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_21", name: "Kestrel Aeronautics", desc: "Supersonic fighters and interceptors", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_22", name: "Mammoth Engineering", desc: "Heavy transport and strategic lift", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_23", name: "Shadowbrook Labs", desc: "Directed energy and next-gen weapons", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_24", name: "Hammerfall Industries", desc: "Self-propelled artillery and mortars", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_25", name: "Cobalt Dynamics", desc: "Naval electronics and sonar systems", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_26", name: "Typhoon Defense Systems", desc: "Cruise missiles and precision strike", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_27", name: "Fortress Armor Works", desc: "Reactive armor and vehicle protection", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_28", name: "Harbinger Systems", desc: "Nuclear deterrent and strategic weapons", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_29", name: "Skywatch Radar", desc: "Early warning and battle management", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_30", name: "Anvil Heavy Industries", desc: "Infantry fighting vehicles and APCs", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_31", name: "Eclipse Maritime", desc: "Stealth patrol boats and corvettes", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_32", name: "Blade Aerospace", desc: "Spaceplanes and orbital defense", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_33", name: "Paladin Munitions", desc: "Tank shells and anti-armor rounds", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_34", name: "Mohawk Electronics", desc: "Military communications and encryption", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_35", name: "Sentinel Robotics", desc: "Autonomous drones and robotic systems", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_36", name: "Grizzly Ordnance", desc: "Grenade launchers and shoulder-fired weapons", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_37", name: "Whitecap Marine", desc: "Frigates and ocean escort vessels", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_38", name: "Firebrand Technologies", desc: "Incendiary and thermobaric weapons", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_39", name: "Starlight Navigation", desc: "Military GPS and guidance systems", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_40", name: "Steel Tide Shipbuilding", desc: "Landing helicopter docks and assault ships", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_41", name: "Thornwood Defense", desc: "Border security and anti-infiltration systems", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_42", name: "Nightfall Systems", desc: "Night vision and thermal optics", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_43", name: "Boulder Stone Quarries", desc: "Fortification and barrier construction", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_44", name: "Viper Chemical", desc: "Chemical defense and decontamination", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_45", name: "Titan Pressure Systems", desc: "Deep-sea and submarine technologies", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_46", name: "Hawkeye Optics", desc: "Sniper systems and targeting scopes", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_47", name: "Gridiron Defense", desc: "Cyber warfare and network protection", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_48", name: "Pinnacle Aerospace", desc: "High-altitude reconnaissance aircraft", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_49", name: "Cragrock Technologies", desc: "Counter-IED and mine clearance", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_50", name: "Aether Dynamics", desc: "Hypersonic vehicles and reentry systems", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_51", name: "Wildcat Technologies", desc: "Light tactical vehicles and buggies", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 },
  { id: "co_52", name: "Onyx Naval Systems", desc: "Mine warfare and undersea defense", foundedBy: null, foundedTurn: null, tier: 1, techLevel: 1.0, equipment: [], researchFocus: null, researchProgress: 0 }
];

const _DC_FOUNDING_TIERS = {
  co_01: 4, co_02: 2, co_03: 2, co_04: 4, co_05: 5, co_06: 1, co_07: 5, co_08: 2, co_09: 2, co_10: 5,
  co_11: 3, co_12: 5, co_13: 2, co_14: 3, co_15: 3, co_16: 3, co_17: 3, co_18: 1, co_19: 3, co_20: 3,
  co_21: 4, co_22: 3, co_23: 5, co_24: 2, co_25: 3, co_26: 3, co_27: 3, co_28: 5, co_29: 3, co_30: 2,
  co_31: 4, co_32: 5, co_33: 2, co_34: 4, co_35: 4, co_36: 1, co_37: 2, co_38: 2, co_39: 4, co_40: 3,
  co_41: 3, co_42: 4, co_43: 1, co_44: 2, co_45: 3, co_46: 1, co_47: 5, co_48: 4, co_49: 2, co_50: 5,
  co_51: 1, co_52: 3,
};

DEFENSE_COMPANIES.forEach(company => {
  company.foundingTier = _DC_FOUNDING_TIERS[company.id] || 3;
});


// ─── EQUIPMENT TEMPLATES BY ERA ──────────────────────
// 500+ equipment items across 8 eras. Each has power (combat strength),
// cost (in $M to produce), techReq (minimum tech level), cat, and era.
const EQUIPMENT_TEMPLATES = {};

// ── ERA 1: Great War (WW1) ─────────────────────────────
EQUIPMENT_TEMPLATES.ERA1 = {
  fighter: [
    { name: 'Scout Biplane', power: 5, cost: 2, techReq: 1.0, cat: 'fighter', era: 'ERA1', desc: 'Wood-and-canvas recon fighter' },
    { name: 'Pursuit Monoplane', power: 7, cost: 3, techReq: 1.5, cat: 'fighter', era: 'ERA1', desc: 'Early purpose-built fighter' },
  ],
  bomber: [
    { name: 'Zeppelin Raider', power: 8, cost: 4, techReq: 1.0, cat: 'bomber', era: 'ERA1', desc: 'Airship for strategic bombing' },
    { name: 'Biplane Bomber', power: 10, cost: 5, techReq: 1.8, cat: 'bomber', era: 'ERA1', desc: 'Twin-engine biplane bomber' },
  ],
  transport: [ { name: 'Cargo Biplane', power: 3, cost: 1, techReq: 1.0, cat: 'transport', era: 'ERA1', desc: 'Basic supply transport' } ],
  tank: [
    { name: 'Landship Mk-I', power: 8, cost: 6, techReq: 1.0, cat: 'tank', era: 'ERA1', desc: 'First-gen rhomboid tank' },
    { name: 'Light Tank A', power: 6, cost: 4, techReq: 1.5, cat: 'tank', era: 'ERA1', desc: 'Fast light breakthrough tank' },
  ],
  ifv: [ { name: 'Armored Car Mk1', power: 4, cost: 3, techReq: 1.0, cat: 'ifv', era: 'ERA1', desc: 'Wheeled armored scout car' } ],
  destroyer: [
    { name: 'Torpedo Boat', power: 7, cost: 5, techReq: 1.0, cat: 'destroyer', era: 'ERA1', desc: 'Fast torpedo-armed vessel' },
    { name: 'Flotilla Leader', power: 10, cost: 7, techReq: 1.8, cat: 'destroyer', era: 'ERA1', desc: 'Larger destroyer with deck guns' },
  ],
  submarine: [
    { name: 'Coastal Submersible', power: 6, cost: 5, techReq: 1.0, cat: 'submarine', era: 'ERA1', desc: 'Short-range coastal sub' },
    { name: 'Ocean Raider', power: 9, cost: 7, techReq: 1.8, cat: 'submarine', era: 'ERA1', desc: 'Long-range commerce raider' },
  ],
  carrier: [],
  patrol: [ { name: 'Armed Trawler', power: 3, cost: 2, techReq: 1.0, cat: 'patrol', era: 'ERA1', desc: 'Converted patrol vessel' } ],
  missile: [],
  rifle: [
    { name: 'Bolt-Action Rifle', power: 2, cost: 0.5, techReq: 1.0, cat: 'rifle', era: 'ERA1', desc: 'Standard bolt-action rifle' },
    { name: 'Early Machine Gun', power: 5, cost: 2, techReq: 1.5, cat: 'rifle', era: 'ERA1', desc: 'Water-cooled HMG' },
  ],
  artillery: [
    { name: 'Field Gun 75mm', power: 6, cost: 4, techReq: 1.0, cat: 'artillery', era: 'ERA1', desc: 'Quick-firing field gun' },
    { name: 'Siege Howitzer', power: 10, cost: 8, techReq: 1.8, cat: 'artillery', era: 'ERA1', desc: 'Heavy siege howitzer' },
  ],
  drone: [], satellite: [],
};

// ── ERA 2: Interwar ─────────────────────────────────────
EQUIPMENT_TEMPLATES.ERA2 = {
  fighter: [
    { name: 'Metal Monoplane', power: 12, cost: 5, techReq: 2.5, cat: 'fighter', era: 'ERA2', desc: 'All-metal monoplane fighter' },
    { name: 'Naval Biplane', power: 9, cost: 4, techReq: 2.5, cat: 'fighter', era: 'ERA2', desc: 'Carrier-capable biplane' },
  ],
  bomber: [
    { name: 'Medium Bomber Mk1', power: 15, cost: 8, techReq: 2.5, cat: 'bomber', era: 'ERA2', desc: 'Twin-engine medium bomber' },
    { name: 'Dive Bomber', power: 12, cost: 6, techReq: 3.0, cat: 'bomber', era: 'ERA2', desc: 'Precision dive bomber' },
  ],
  transport: [ { name: 'Trimotor Transport', power: 5, cost: 3, techReq: 2.5, cat: 'transport', era: 'ERA2', desc: 'Three-engine cargo' } ],
  helicopter: [ { name: 'Autogyro Recon', power: 4, cost: 3, techReq: 3.0, cat: 'helicopter', era: 'ERA2', desc: 'Early rotary observation' } ],
  tank: [
    { name: 'Cavalry Tank', power: 10, cost: 6, techReq: 2.5, cat: 'tank', era: 'ERA2', desc: 'Fast cruiser tank' },
    { name: 'Infantry Support Tank', power: 14, cost: 10, techReq: 3.0, cat: 'tank', era: 'ERA2', desc: 'Heavily armored slow tank' },
    { name: 'Light Tank B', power: 8, cost: 5, techReq: 2.5, cat: 'tank', era: 'ERA2', desc: 'Improved light tank' },
  ],
  ifv: [ { name: 'Half-Track Carrier', power: 5, cost: 4, techReq: 2.5, cat: 'ifv', era: 'ERA2', desc: 'Half-track APC' } ],
  destroyer: [ { name: 'Fleet Destroyer', power: 14, cost: 9, techReq: 2.5, cat: 'destroyer', era: 'ERA2', desc: 'Modern fleet destroyer' } ],
  submarine: [ { name: 'Fleet Submarine', power: 12, cost: 8, techReq: 2.5, cat: 'submarine', era: 'ERA2', desc: 'Improved ocean-going sub' } ],
  carrier: [ { name: 'Escort Carrier', power: 15, cost: 12, techReq: 3.0, cat: 'carrier', era: 'ERA2', desc: 'Small escort carrier' } ],
  patrol: [ { name: 'PT Boat', power: 6, cost: 3, techReq: 2.5, cat: 'patrol', era: 'ERA2', desc: 'Fast patrol torpedo boat' } ],
  missile: [],
  rifle: [
    { name: 'Semi-Auto Rifle', power: 4, cost: 1, techReq: 2.5, cat: 'rifle', era: 'ERA2', desc: 'Semi-auto infantry rifle' },
    { name: 'Submachine Gun', power: 3, cost: 1, techReq: 3.0, cat: 'rifle', era: 'ERA2', desc: 'Compact automatic weapon' },
  ],
  artillery: [
    { name: 'Howitzer 105mm', power: 12, cost: 7, techReq: 2.5, cat: 'artillery', era: 'ERA2', desc: 'Standard field howitzer' },
    { name: 'Anti-Tank Gun', power: 8, cost: 5, techReq: 3.0, cat: 'artillery', era: 'ERA2', desc: 'Dedicated AT cannon' },
  ],
  drone: [], satellite: [],
};

// ── ERA 3: Second War (WW2) ─────────────────────────────
EQUIPMENT_TEMPLATES.ERA3 = {
  fighter: [
    { name: 'Propeller Interceptor', power: 18, cost: 7, techReq: 4.0, cat: 'fighter', era: 'ERA3', desc: 'High-performance prop fighter' },
    { name: 'Naval Fighter', power: 16, cost: 7, techReq: 4.0, cat: 'fighter', era: 'ERA3', desc: 'Carrier-based fighter' },
    { name: 'Night Fighter', power: 17, cost: 8, techReq: 4.5, cat: 'fighter', era: 'ERA3', desc: 'Radar night interceptor' },
    { name: 'Jet Prototype', power: 22, cost: 10, techReq: 5.0, cat: 'fighter', era: 'ERA3', desc: 'First-gen jet fighter' },
  ],
  bomber: [
    { name: 'Heavy Bomber', power: 25, cost: 14, techReq: 4.0, cat: 'bomber', era: 'ERA3', desc: 'Four-engine strategic bomber' },
    { name: 'Torpedo Bomber', power: 18, cost: 9, techReq: 4.0, cat: 'bomber', era: 'ERA3', desc: 'Carrier torpedo bomber' },
    { name: 'Jet Bomber Proto', power: 28, cost: 16, techReq: 5.0, cat: 'bomber', era: 'ERA3', desc: 'Early jet bomber' },
  ],
  transport: [
    { name: 'Military Glider', power: 4, cost: 2, techReq: 4.0, cat: 'transport', era: 'ERA3', desc: 'Troop glider' },
    { name: 'Cargo Skytrain', power: 8, cost: 5, techReq: 4.0, cat: 'transport', era: 'ERA3', desc: 'Twin-engine cargo aircraft' },
  ],
  helicopter: [ { name: 'Rotary Observation', power: 6, cost: 4, techReq: 5.0, cat: 'helicopter', era: 'ERA3', desc: 'First practical mil helicopter' } ],
  tank: [
    { name: 'Medium Tank M4', power: 18, cost: 10, techReq: 4.0, cat: 'tank', era: 'ERA3', desc: 'Reliable medium tank' },
    { name: 'Heavy Tank', power: 25, cost: 16, techReq: 4.5, cat: 'tank', era: 'ERA3', desc: 'Heavily armored breakthrough tank' },
    { name: 'Tank Destroyer', power: 22, cost: 12, techReq: 4.0, cat: 'tank', era: 'ERA3', desc: 'Turretless AT vehicle' },
    { name: 'Light Recon Tank', power: 12, cost: 7, techReq: 4.0, cat: 'tank', era: 'ERA3', desc: 'Fast scout tank' },
  ],
  ifv: [ { name: 'Armored Personnel Carrier', power: 8, cost: 6, techReq: 4.0, cat: 'ifv', era: 'ERA3', desc: 'Full-tracked APC' } ],
  destroyer: [
    { name: 'Fleet Destroyer II', power: 20, cost: 12, techReq: 4.0, cat: 'destroyer', era: 'ERA3', desc: 'Advanced radar destroyer' },
    { name: 'Anti-Air Destroyer', power: 18, cost: 11, techReq: 4.5, cat: 'destroyer', era: 'ERA3', desc: 'AA specialized destroyer' },
  ],
  submarine: [
    { name: 'Type VII U-Boat', power: 16, cost: 10, techReq: 4.0, cat: 'submarine', era: 'ERA3', desc: 'Medium attack submarine' },
    { name: 'Type IX Cruiser', power: 20, cost: 14, techReq: 4.5, cat: 'submarine', era: 'ERA3', desc: 'Long-range sub cruiser' },
    { name: 'Midget Submarine', power: 8, cost: 5, techReq: 4.0, cat: 'submarine', era: 'ERA3', desc: 'Small special-mission sub' },
  ],
  carrier: [
    { name: 'Fleet Carrier', power: 30, cost: 22, techReq: 4.0, cat: 'carrier', era: 'ERA3', desc: 'Full-size fleet carrier' },
    { name: 'Light Carrier', power: 20, cost: 15, techReq: 4.0, cat: 'carrier', era: 'ERA3', desc: 'Smaller light carrier' },
  ],
  patrol: [
    { name: 'Corvette', power: 10, cost: 6, techReq: 4.0, cat: 'patrol', era: 'ERA3', desc: 'Small escort corvette' },
    { name: 'Frigate Mk1', power: 14, cost: 9, techReq: 4.5, cat: 'patrol', era: 'ERA3', desc: 'Ocean escort frigate' },
  ],
  missile: [
    { name: 'V-1 Flying Bomb', power: 12, cost: 6, techReq: 4.5, cat: 'missile', era: 'ERA3', desc: 'Early cruise missile' },
    { name: 'V-2 Ballistic Missile', power: 20, cost: 12, techReq: 5.0, cat: 'missile', era: 'ERA3', desc: 'First ballistic missile' },
  ],
  rifle: [
    { name: 'Assault Rifle Mk1', power: 6, cost: 2, techReq: 4.5, cat: 'rifle', era: 'ERA3', desc: 'First assault rifle' },
    { name: 'Battle Rifle', power: 5, cost: 2, techReq: 4.0, cat: 'rifle', era: 'ERA3', desc: 'Full-power semi-auto rifle' },
    { name: 'Light Machine Gun', power: 8, cost: 3, techReq: 4.0, cat: 'rifle', era: 'ERA3', desc: 'Squad automatic weapon' },
  ],
  artillery: [
    { name: 'Self-Propelled Gun', power: 18, cost: 11, techReq: 4.0, cat: 'artillery', era: 'ERA3', desc: 'Motorized artillery' },
    { name: 'Rocket Artillery', power: 20, cost: 12, techReq: 4.5, cat: 'artillery', era: 'ERA3', desc: 'Multiple rocket launcher' },
  ],
  drone: [], satellite: [],
};

// ── ERA 4: Early Cold War ───────────────────────────────
EQUIPMENT_TEMPLATES.ERA4 = {
  fighter: [
    { name: 'Sabre Jet', power: 28, cost: 12, techReq: 5.5, cat: 'fighter', era: 'ERA4', desc: 'Swept-wing jet fighter' },
    { name: 'Interceptor Jet', power: 32, cost: 14, techReq: 6.0, cat: 'fighter', era: 'ERA4', desc: 'High-speed interceptor' },
    { name: 'Naval Jet Fighter', power: 26, cost: 13, techReq: 5.5, cat: 'fighter', era: 'ERA4', desc: 'Carrier jet fighter' },
    { name: 'Superfighter Mk1', power: 35, cost: 16, techReq: 6.5, cat: 'fighter', era: 'ERA4', desc: 'Mach 2 capable fighter' },
  ],
  bomber: [
    { name: 'Strategic Jet Bomber', power: 35, cost: 18, techReq: 5.5, cat: 'bomber', era: 'ERA4', desc: 'Subsonic strategic bomber' },
    { name: 'Supersonic Bomber', power: 40, cost: 22, techReq: 6.5, cat: 'bomber', era: 'ERA4', desc: 'Supersonic nuclear bomber' },
  ],
  transport: [
    { name: 'Turbo Cargo', power: 10, cost: 6, techReq: 5.5, cat: 'transport', era: 'ERA4', desc: 'Turboprop cargo aircraft' },
    { name: 'Jet Transport', power: 14, cost: 9, techReq: 6.5, cat: 'transport', era: 'ERA4', desc: 'Jet-powered cargo lifter' },
  ],
  helicopter: [
    { name: 'Utility Helicopter', power: 8, cost: 5, techReq: 5.5, cat: 'helicopter', era: 'ERA4', desc: 'Multi-role utility helo' },
    { name: 'Attack Helicopter Proto', power: 14, cost: 9, techReq: 6.5, cat: 'helicopter', era: 'ERA4', desc: 'First attack helicopter' },
  ],
  tank: [
    { name: 'Main Battle Tank Mk1', power: 28, cost: 14, techReq: 5.5, cat: 'tank', era: 'ERA4', desc: 'First MBT design' },
    { name: 'Heavy Breakthrough Tank', power: 32, cost: 18, techReq: 6.5, cat: 'tank', era: 'ERA4', desc: 'Heavy Cold War tank' },
    { name: 'Light Amphibious Tank', power: 16, cost: 9, techReq: 5.5, cat: 'tank', era: 'ERA4', desc: 'Amphibious light tank' },
  ],
  ifv: [
    { name: 'Infantry Fighting Vehicle', power: 12, cost: 8, techReq: 5.5, cat: 'ifv', era: 'ERA4', desc: 'First IFV design' },
    { name: 'Armored Recon Vehicle', power: 8, cost: 6, techReq: 6.0, cat: 'ifv', era: 'ERA4', desc: 'Wheeled recon vehicle' },
  ],
  destroyer: [
    { name: 'Guided Missile Destroyer', power: 28, cost: 16, techReq: 5.5, cat: 'destroyer', era: 'ERA4', desc: 'First missile destroyer' },
    { name: 'Nuclear Destroyer', power: 32, cost: 20, techReq: 6.5, cat: 'destroyer', era: 'ERA4', desc: 'Nuclear-powered destroyer' },
  ],
  submarine: [
    { name: 'Diesel Attack Sub', power: 18, cost: 11, techReq: 5.5, cat: 'submarine', era: 'ERA4', desc: 'Improved diesel sub' },
    { name: 'Nuclear Attack Sub', power: 28, cost: 18, techReq: 6.5, cat: 'submarine', era: 'ERA4', desc: 'First nuclear attack sub' },
    { name: 'Ballistic Missile Sub', power: 35, cost: 24, techReq: 6.5, cat: 'submarine', era: 'ERA4', desc: 'SSBN strategic deterrence' },
  ],
  carrier: [
    { name: 'Super Carrier Mk1', power: 40, cost: 30, techReq: 5.5, cat: 'carrier', era: 'ERA4', desc: 'First supercarrier' },
    { name: 'Nuclear Carrier', power: 45, cost: 35, techReq: 6.5, cat: 'carrier', era: 'ERA4', desc: 'Nuclear-powered carrier' },
  ],
  patrol: [
    { name: 'Missile Corvette', power: 16, cost: 9, techReq: 5.5, cat: 'patrol', era: 'ERA4', desc: 'Missile-armed corvette' },
    { name: 'Ocean Frigate Mk2', power: 20, cost: 12, techReq: 6.0, cat: 'patrol', era: 'ERA4', desc: 'ASW frigate' },
  ],
  missile: [
    { name: 'Anti-Ship Missile', power: 24, cost: 8, techReq: 5.5, cat: 'missile', era: 'ERA4', desc: 'Ship-killing missile' },
    { name: 'Surface-to-Air Missile', power: 18, cost: 7, techReq: 5.5, cat: 'missile', era: 'ERA4', desc: 'SAM system' },
    { name: 'ICBM Proto', power: 40, cost: 20, techReq: 6.5, cat: 'missile', era: 'ERA4', desc: 'Intercontinental ballistic missile' },
    { name: 'Air-to-Air Missile Mk1', power: 16, cost: 5, techReq: 5.5, cat: 'missile', era: 'ERA4', desc: 'First guided AAM' },
  ],
  rifle: [
    { name: 'Assault Rifle Mk2', power: 8, cost: 2, techReq: 5.5, cat: 'rifle', era: 'ERA4', desc: 'Modern assault rifle' },
    { name: 'Squad LMG', power: 10, cost: 4, techReq: 5.5, cat: 'rifle', era: 'ERA4', desc: 'Squad light machine gun' },
    { name: 'Designated Marksman Rifle', power: 7, cost: 3, techReq: 6.0, cat: 'rifle', era: 'ERA4', desc: 'Semi-auto DMR' },
  ],
  artillery: [
    { name: 'Self-Propelled Howitzer', power: 24, cost: 14, techReq: 5.5, cat: 'artillery', era: 'ERA4', desc: 'SP howitzer' },
    { name: 'MLRS System', power: 28, cost: 16, techReq: 6.0, cat: 'artillery', era: 'ERA4', desc: 'Multiple launch rocket system' },
  ],
  drone: [], satellite: [
    { name: 'Recon Satellite', power: 5, cost: 12, techReq: 6.5, cat: 'satellite', era: 'ERA4', desc: 'Photo recon satellite' },
    { name: 'Comms Satellite', power: 3, cost: 10, techReq: 6.0, cat: 'satellite', era: 'ERA4', desc: 'Military communications sat' },
  ],
};

// ── ERA 5: Late Cold War ────────────────────────────────
EQUIPMENT_TEMPLATES.ERA5 = {
  fighter: [
    { name: 'Gen4 Fighter', power: 42, cost: 18, techReq: 7.0, cat: 'fighter', era: 'ERA5', desc: '4th-gen multirole fighter' },
    { name: 'Interceptor Mk3', power: 38, cost: 16, techReq: 7.0, cat: 'fighter', era: 'ERA5', desc: 'High-speed interceptor' },
    { name: 'Carrier Fighter Gen4', power: 40, cost: 18, techReq: 7.5, cat: 'fighter', era: 'ERA5', desc: 'Carrier-based 4th-gen fighter' },
    { name: 'Ground Attack Jet', power: 35, cost: 15, techReq: 7.0, cat: 'fighter', era: 'ERA5', desc: 'Dedicated CAS aircraft' },
  ],
  bomber: [
    { name: 'Stealth Bomber Proto', power: 50, cost: 30, techReq: 7.5, cat: 'bomber', era: 'ERA5', desc: 'First stealth bomber' },
    { name: 'Supersonic Bomber Mk2', power: 45, cost: 25, techReq: 7.0, cat: 'bomber', era: 'ERA5', desc: 'Swing-wing supersonic bomber' },
  ],
  transport: [
    { name: 'Heavy Cargo Jet', power: 16, cost: 10, techReq: 7.0, cat: 'transport', era: 'ERA5', desc: 'Heavy strategic transport' },
    { name: 'Tanker Aircraft', power: 12, cost: 9, techReq: 7.0, cat: 'transport', era: 'ERA5', desc: 'Air-to-air refueling tanker' },
  ],
  helicopter: [
    { name: 'Attack Helicopter Mk1', power: 22, cost: 12, techReq: 7.0, cat: 'helicopter', era: 'ERA5', desc: 'Dedicated attack helo' },
    { name: 'Heavy Lift Helicopter', power: 12, cost: 8, techReq: 7.0, cat: 'helicopter', era: 'ERA5', desc: 'Heavy transport helo' },
    { name: 'Naval Helo', power: 14, cost: 9, techReq: 7.0, cat: 'helicopter', era: 'ERA5', desc: 'ASW naval helicopter' },
  ],
  tank: [
    { name: 'MBT Mk2', power: 35, cost: 18, techReq: 7.0, cat: 'tank', era: 'ERA5', desc: 'Improved MBT with ERA' },
    { name: 'MBT Mk3', power: 40, cost: 22, techReq: 7.5, cat: 'tank', era: 'ERA5', desc: 'Advanced composite armor MBT' },
  ],
  ifv: [
    { name: 'IFV Mk2', power: 16, cost: 10, techReq: 7.0, cat: 'ifv', era: 'ERA5', desc: 'IFV with ATGM capability' },
    { name: 'Wheeled APC', power: 10, cost: 7, techReq: 7.0, cat: 'ifv', era: 'ERA5', desc: '8x8 wheeled armored vehicle' },
  ],
  destroyer: [
    { name: 'Aegis Destroyer', power: 38, cost: 22, techReq: 7.0, cat: 'destroyer', era: 'ERA5', desc: 'Phased-array radar destroyer' },
    { name: 'Stealth Destroyer', power: 42, cost: 26, techReq: 7.5, cat: 'destroyer', era: 'ERA5', desc: 'Stealth surface combatant' },
  ],
  submarine: [
    { name: 'Nuclear Attack Sub Mk2', power: 32, cost: 20, techReq: 7.0, cat: 'submarine', era: 'ERA5', desc: 'Improved SSN' },
    { name: 'SSBN Mk2', power: 40, cost: 28, techReq: 7.5, cat: 'submarine', era: 'ERA5', desc: 'Advanced ballistic missile sub' },
    { name: 'Cruise Missile Sub', power: 36, cost: 24, techReq: 7.5, cat: 'submarine', era: 'ERA5', desc: 'SSGN cruise missile sub' },
  ],
  carrier: [
    { name: 'Super Carrier Mk2', power: 50, cost: 38, techReq: 7.0, cat: 'carrier', era: 'ERA5', desc: 'Advanced supercarrier' },
  ],
  patrol: [
    { name: 'Stealth Corvette', power: 20, cost: 12, techReq: 7.0, cat: 'patrol', era: 'ERA5', desc: 'Stealth corvette' },
    { name: 'Frigate Mk3', power: 24, cost: 15, techReq: 7.0, cat: 'patrol', era: 'ERA5', desc: 'Multi-role frigate' },
  ],
  missile: [
    { name: 'Cruise Missile', power: 30, cost: 10, techReq: 7.0, cat: 'missile', era: 'ERA5', desc: 'Terrain-following cruise missile' },
    { name: 'AAM Mk2', power: 22, cost: 6, techReq: 7.0, cat: 'missile', era: 'ERA5', desc: 'Beyond-visual-range AAM' },
    { name: 'SAM Mk2', power: 24, cost: 9, techReq: 7.0, cat: 'missile', era: 'ERA5', desc: 'Long-range SAM system' },
    { name: 'Anti-Ship Missile Mk2', power: 28, cost: 9, techReq: 7.0, cat: 'missile', era: 'ERA5', desc: 'Sea-skimming anti-ship missile' },
  ],
  rifle: [
    { name: 'Assault Rifle Mk3', power: 9, cost: 3, techReq: 7.0, cat: 'rifle', era: 'ERA5', desc: 'Bullpup assault rifle' },
    { name: 'Sniper Rifle', power: 10, cost: 4, techReq: 7.0, cat: 'rifle', era: 'ERA5', desc: 'Bolt-action sniper system' },
    { name: 'GPMG', power: 11, cost: 4, techReq: 7.0, cat: 'rifle', era: 'ERA5', desc: 'General purpose machine gun' },
  ],
  artillery: [
    { name: 'SP Howitzer Mk2', power: 28, cost: 16, techReq: 7.0, cat: 'artillery', era: 'ERA5', desc: '155mm SP howitzer' },
    { name: 'MLRS Mk2', power: 32, cost: 18, techReq: 7.5, cat: 'artillery', era: 'ERA5', desc: 'Guided MLRS system' },
  ],
  drone: [
    { name: 'Recon Drone', power: 6, cost: 3, techReq: 7.5, cat: 'drone', era: 'ERA5', desc: 'Tactical recon UAV' },
  ],
  satellite: [
    { name: 'Early Warning Satellite', power: 8, cost: 14, techReq: 7.0, cat: 'satellite', era: 'ERA5', desc: 'Missile early warning sat' },
    { name: 'GPS Satellite', power: 6, cost: 12, techReq: 7.5, cat: 'satellite', era: 'ERA5', desc: 'Navigation satellite constellation' },
  ],
};

// ── ERA 6: Modern ────────────────────────────────────────
EQUIPMENT_TEMPLATES.ERA6 = {
  fighter: [
    { name: 'Gen5 Stealth Fighter', power: 52, cost: 28, techReq: 8.0, cat: 'fighter', era: 'ERA6', desc: '5th-gen stealth multirole' },
    { name: 'Strike Fighter', power: 48, cost: 24, techReq: 8.0, cat: 'fighter', era: 'ERA6', desc: 'Advanced strike fighter' },
    { name: 'Carrier Stealth Fighter', power: 50, cost: 28, techReq: 8.5, cat: 'fighter', era: 'ERA6', desc: 'Carrier-based stealth fighter' },
  ],
  bomber: [
    { name: 'Stealth Bomber', power: 60, cost: 35, techReq: 8.0, cat: 'bomber', era: 'ERA6', desc: 'Stealth strategic bomber' },
    { name: 'Supersonic Bomber Mk3', power: 52, cost: 28, techReq: 8.0, cat: 'bomber', era: 'ERA6', desc: 'Supersonic stealth bomber' },
  ],
  transport: [
    { name: 'Strategic Airlifter', power: 20, cost: 14, techReq: 8.0, cat: 'transport', era: 'ERA6', desc: 'Heavy strategic airlifter' },
    { name: 'VTOL Transport', power: 16, cost: 12, techReq: 8.5, cat: 'transport', era: 'ERA6', desc: 'Vertical lift transport' },
  ],
  helicopter: [
    { name: 'Attack Helicopter Mk2', power: 28, cost: 15, techReq: 8.0, cat: 'helicopter', era: 'ERA6', desc: 'Advanced attack helo' },
    { name: 'Tiltrotor', power: 18, cost: 12, techReq: 8.0, cat: 'helicopter', era: 'ERA6', desc: 'Tiltrotor transport' },
    { name: 'Scout Helicopter', power: 14, cost: 8, techReq: 8.0, cat: 'helicopter', era: 'ERA6', desc: 'Armed scout helo' },
  ],
  tank: [
    { name: 'MBT Mk4', power: 46, cost: 26, techReq: 8.0, cat: 'tank', era: 'ERA6', desc: 'Advanced MBT with APS' },
    { name: 'Light Tank Mk3', power: 22, cost: 14, techReq: 8.0, cat: 'tank', era: 'ERA6', desc: 'Air-deployable light tank' },
  ],
  ifv: [
    { name: 'IFV Mk3', power: 20, cost: 14, techReq: 8.0, cat: 'ifv', era: 'ERA6', desc: 'Advanced IFV' },
    { name: 'Amphibious IFV', power: 16, cost: 12, techReq: 8.0, cat: 'ifv', era: 'ERA6', desc: 'Amphibious tracked IFV' },
    { name: 'MRAP', power: 12, cost: 8, techReq: 8.0, cat: 'ifv', era: 'ERA6', desc: 'Mine-resistant ambush protected' },
  ],
  destroyer: [
    { name: 'Stealth Destroyer Mk2', power: 46, cost: 28, techReq: 8.0, cat: 'destroyer', era: 'ERA6', desc: 'Next-gen stealth destroyer' },
    { name: 'AAW Destroyer', power: 42, cost: 26, techReq: 8.5, cat: 'destroyer', era: 'ERA6', desc: 'Area air warfare destroyer' },
  ],
  submarine: [
    { name: 'Nuclear Attack Sub Mk3', power: 38, cost: 24, techReq: 8.0, cat: 'submarine', era: 'ERA6', desc: 'Advanced SSN' },
    { name: 'SSBN Mk3', power: 46, cost: 32, techReq: 8.5, cat: 'submarine', era: 'ERA6', desc: 'Next-gen ballistic missile sub' },
  ],
  carrier: [
    { name: 'Super Carrier Mk3', power: 55, cost: 42, techReq: 8.0, cat: 'carrier', era: 'ERA6', desc: 'Next-gen supercarrier' },
    { name: 'Amphibious Assault Ship', power: 35, cost: 28, techReq: 8.0, cat: 'carrier', era: 'ERA6', desc: 'LHD amphibious assault' },
  ],
  patrol: [
    { name: 'Littoral Combat Ship', power: 22, cost: 14, techReq: 8.0, cat: 'patrol', era: 'ERA6', desc: 'Littoral combat vessel' },
    { name: 'Frigate Mk4', power: 28, cost: 18, techReq: 8.0, cat: 'patrol', era: 'ERA6', desc: 'Multi-mission frigate' },
  ],
  missile: [
    { name: 'Hypersonic Missile Proto', power: 45, cost: 18, techReq: 8.5, cat: 'missile', era: 'ERA6', desc: 'Hypersonic glide vehicle' },
    { name: 'AAM Mk3', power: 26, cost: 8, techReq: 8.0, cat: 'missile', era: 'ERA6', desc: 'Advanced BVR AAM' },
    { name: 'SAM Mk3', power: 28, cost: 12, techReq: 8.0, cat: 'missile', era: 'ERA6', desc: 'Long-range area SAM' },
    { name: 'Anti-Ship Missile Mk3', power: 32, cost: 10, techReq: 8.0, cat: 'missile', era: 'ERA6', desc: 'Supersonic anti-ship missile' },
    { name: 'Cruise Missile Mk2', power: 36, cost: 12, techReq: 8.0, cat: 'missile', era: 'ERA6', desc: 'Stealth cruise missile' },
  ],
  rifle: [
    { name: 'Assault Rifle Mk4', power: 10, cost: 3, techReq: 8.0, cat: 'rifle', era: 'ERA6', desc: 'Modular assault rifle system' },
    { name: 'Sniper Rifle Mk2', power: 12, cost: 5, techReq: 8.0, cat: 'rifle', era: 'ERA6', desc: 'Anti-material sniper rifle' },
    { name: 'LMG Mk2', power: 12, cost: 4, techReq: 8.0, cat: 'rifle', era: 'ERA6', desc: 'Modern light machine gun' },
    { name: 'PDW', power: 6, cost: 2, techReq: 8.0, cat: 'rifle', era: 'ERA6', desc: 'Personal defense weapon' },
  ],
  artillery: [
    { name: 'SP Howitzer Mk3', power: 32, cost: 18, techReq: 8.0, cat: 'artillery', era: 'ERA6', desc: '155mm wheeled SP howitzer' },
    { name: 'MLRS Mk3', power: 36, cost: 20, techReq: 8.0, cat: 'artillery', era: 'ERA6', desc: 'Precision MLRS' },
    { name: 'Mortar Carrier', power: 18, cost: 10, techReq: 8.0, cat: 'artillery', era: 'ERA6', desc: 'Self-propelled mortar' },
  ],
  drone: [
    { name: 'Recon Drone Mk2', power: 8, cost: 4, techReq: 8.0, cat: 'drone', era: 'ERA6', desc: 'Long-endurance recon UAV' },
    { name: 'Attack Drone', power: 16, cost: 8, techReq: 8.5, cat: 'drone', era: 'ERA6', desc: 'Armed MALE UAV' },
    { name: 'Loitering Munition', power: 12, cost: 5, techReq: 8.0, cat: 'drone', era: 'ERA6', desc: 'Kamikaze drone' },
  ],
  satellite: [
    { name: 'Spy Satellite Mk2', power: 10, cost: 16, techReq: 8.0, cat: 'satellite', era: 'ERA6', desc: 'High-res recon satellite' },
    { name: 'Comms Satellite Mk2', power: 6, cost: 14, techReq: 8.0, cat: 'satellite', era: 'ERA6', desc: 'Secure milsatcom' },
    { name: 'SIGINT Satellite', power: 8, cost: 15, techReq: 8.5, cat: 'satellite', era: 'ERA6', desc: 'Signals intelligence sat' },
  ],
};

// ── ERA 7: Near Future ───────────────────────────────────
EQUIPMENT_TEMPLATES.ERA7 = {
  fighter: [
    { name: 'Gen6 Fighter', power: 62, cost: 35, techReq: 9.0, cat: 'fighter', era: 'ERA7', desc: '6th-gen AI-assisted fighter' },
    { name: 'Loyal Wingman Drone', power: 35, cost: 15, techReq: 9.0, cat: 'fighter', era: 'ERA7', desc: 'AI-controlled drone wingman' },
    { name: 'Space Fighter', power: 55, cost: 40, techReq: 9.5, cat: 'fighter', era: 'ERA7', desc: 'Orbital space superiority craft' },
  ],
  bomber: [
    { name: 'Hypersonic Bomber', power: 70, cost: 42, techReq: 9.0, cat: 'bomber', era: 'ERA7', desc: 'Hypersonic strategic bomber' },
    { name: 'Orbital Bomber', power: 75, cost: 48, techReq: 9.5, cat: 'bomber', era: 'ERA7', desc: 'Space-plane bomber' },
  ],
  transport: [
    { name: 'Hypersonic Transport', power: 25, cost: 18, techReq: 9.0, cat: 'transport', era: 'ERA7', desc: 'Hypersonic global transport' },
    { name: 'Orbital Cargo', power: 30, cost: 25, techReq: 9.5, cat: 'transport', era: 'ERA7', desc: 'Space cargo lifter' },
  ],
  helicopter: [
    { name: 'Compound Helo', power: 24, cost: 14, techReq: 9.0, cat: 'helicopter', era: 'ERA7', desc: 'Compound coaxial helo' },
    { name: 'High-Speed Raider', power: 30, cost: 18, techReq: 9.5, cat: 'helicopter', era: 'ERA7', desc: 'High-speed VTOL assault' },
  ],
  tank: [
    { name: 'Future MBT', power: 52, cost: 30, techReq: 9.0, cat: 'tank', era: 'ERA7', desc: 'Future main battle tank' },
    { name: 'Robotic Tank', power: 40, cost: 24, techReq: 9.5, cat: 'tank', era: 'ERA7', desc: 'UGV main battle tank' },
  ],
  ifv: [
    { name: 'Future IFV', power: 24, cost: 16, techReq: 9.0, cat: 'ifv', era: 'ERA7', desc: 'Next-gen IFV' },
    { name: 'Robotic APC', power: 18, cost: 12, techReq: 9.5, cat: 'ifv', era: 'ERA7', desc: 'UGV infantry transport' },
  ],
  destroyer: [
    { name: 'Future Destroyer', power: 52, cost: 32, techReq: 9.0, cat: 'destroyer', era: 'ERA7', desc: 'Future surface combatant' },
    { name: 'Laser Destroyer', power: 48, cost: 30, techReq: 9.5, cat: 'destroyer', era: 'ERA7', desc: 'DEW-armed destroyer' },
  ],
  submarine: [
    { name: 'Future SSN', power: 44, cost: 28, techReq: 9.0, cat: 'submarine', era: 'ERA7', desc: 'Future attack submarine' },
    { name: 'Future SSBN', power: 52, cost: 36, techReq: 9.5, cat: 'submarine', era: 'ERA7', desc: 'Future ballistic missile sub' },
  ],
  carrier: [
    { name: 'Future Carrier', power: 60, cost: 48, techReq: 9.0, cat: 'carrier', era: 'ERA7', desc: 'Next-gen supercarrier' },
    { name: 'Orbital Carrier', power: 55, cost: 50, techReq: 9.5, cat: 'carrier', era: 'ERA7', desc: 'Space aircraft carrier' },
  ],
  patrol: [
    { name: 'Future Corvette', power: 26, cost: 16, techReq: 9.0, cat: 'patrol', era: 'ERA7', desc: 'Future stealth corvette' },
    { name: 'Unmanned Surface Vessel', power: 18, cost: 12, techReq: 9.5, cat: 'patrol', era: 'ERA7', desc: 'Large USV patrol' },
  ],
  missile: [
    { name: 'Hypersonic Missile', power: 55, cost: 22, techReq: 9.0, cat: 'missile', era: 'ERA7', desc: 'Hypersonic anti-ship/land attack' },
    { name: 'AAM Mk4', power: 30, cost: 10, techReq: 9.0, cat: 'missile', era: 'ERA7', desc: 'Next-gen AAM' },
    { name: 'Directed Energy Weapon', power: 35, cost: 18, techReq: 9.5, cat: 'missile', era: 'ERA7', desc: 'Vehicle-mounted laser' },
    { name: 'Railgun Projectile', power: 50, cost: 15, techReq: 9.5, cat: 'missile', era: 'ERA7', desc: 'Electromagnetic railgun round' },
  ],
  rifle: [
    { name: 'Smart Rifle', power: 12, cost: 5, techReq: 9.0, cat: 'rifle', era: 'ERA7', desc: 'Computer-assisted smart rifle' },
    { name: 'Caseless Rifle', power: 11, cost: 4, techReq: 9.0, cat: 'rifle', era: 'ERA7', desc: 'Caseless ammunition rifle' },
  ],
  artillery: [
    { name: 'Railgun Platform', power: 45, cost: 28, techReq: 9.5, cat: 'artillery', era: 'ERA7', desc: 'EM railgun artillery' },
    { name: 'Future MLRS', power: 40, cost: 24, techReq: 9.0, cat: 'artillery', era: 'ERA7', desc: 'Precision deep strike' },
  ],
  drone: [
    { name: 'Swarm Drone', power: 14, cost: 4, techReq: 9.0, cat: 'drone', era: 'ERA7', desc: 'AI-swarm micro drone' },
    { name: 'Stealth UAV', power: 22, cost: 12, techReq: 9.0, cat: 'drone', era: 'ERA7', desc: 'Stealth combat UAV' },
    { name: 'Solar High-Altitude UAV', power: 10, cost: 6, techReq: 9.0, cat: 'drone', era: 'ERA7', desc: 'Stratospheric endurance UAV' },
  ],
  satellite: [
    { name: 'Space-Based Laser', power: 20, cost: 25, techReq: 9.5, cat: 'satellite', era: 'ERA7', desc: 'SBL anti-missile platform' },
    { name: 'Quantum Comms Sat', power: 8, cost: 18, techReq: 9.0, cat: 'satellite', era: 'ERA7', desc: 'Quantum-encrypted comms' },
  ],
};

// ── ERA 8: Futuristic ────────────────────────────────────
EQUIPMENT_TEMPLATES.ERA8 = {
  fighter: [
    { name: 'Gen7 AI Fighter', power: 75, cost: 45, techReq: 9.5, cat: 'fighter', era: 'ERA8', desc: 'Fully autonomous 7th-gen fighter' },
    { name: 'Space Superiority Craft', power: 70, cost: 48, techReq: 9.8, cat: 'fighter', era: 'ERA8', desc: 'Orbital space dominance' },
    { name: 'Energy Fighter', power: 80, cost: 50, techReq: 10.0, cat: 'fighter', era: 'ERA8', desc: 'Directed-energy equipped fighter' },
  ],
  bomber: [
    { name: 'Orbital Bombardment Craft', power: 85, cost: 55, techReq: 9.8, cat: 'bomber', era: 'ERA8', desc: 'Orbital kinetic bombardment' },
    { name: 'Quantum Bomber', power: 90, cost: 60, techReq: 10.0, cat: 'bomber', era: 'ERA8', desc: 'Quantum-stealth long range bomber' },
  ],
  transport: [
    { name: 'Suborbital Transport', power: 35, cost: 28, techReq: 9.8, cat: 'transport', era: 'ERA8', desc: 'Suborbital global transport' },
    { name: 'Warp Cargo', power: 40, cost: 35, techReq: 10.0, cat: 'transport', era: 'ERA8', desc: 'Near-light-speed logistics' },
  ],
  helicopter: [
    { name: 'Anti-Grav VTOL', power: 28, cost: 18, techReq: 9.8, cat: 'helicopter', era: 'ERA8', desc: 'Repulsor-lift assault craft' },
    { name: 'Stealth Gyro', power: 32, cost: 20, techReq: 10.0, cat: 'helicopter', era: 'ERA8', desc: 'Silent stealth rotorcraft' },
  ],
  tank: [
    { name: 'Energy Shield Tank', power: 58, cost: 35, techReq: 9.8, cat: 'tank', era: 'ERA8', desc: 'MBT with energy shield' },
    { name: 'Grav Tank', power: 55, cost: 38, techReq: 10.0, cat: 'tank', era: 'ERA8', desc: 'Hover-assault MBT' },
  ],
  ifv: [
    { name: 'Repulsor IFV', power: 28, cost: 20, techReq: 9.8, cat: 'ifv', era: 'ERA8', desc: 'Hovering IFV' },
    { name: 'Battlesuit Squad', power: 22, cost: 14, techReq: 10.0, cat: 'ifv', era: 'ERA8', desc: 'Powered exoskeleton infantry' },
  ],
  destroyer: [
    { name: 'Energy Shield Destroyer', power: 58, cost: 36, techReq: 9.8, cat: 'destroyer', era: 'ERA8', desc: 'Shielded advanced destroyer' },
    { name: 'Space Navy Frigate', power: 55, cost: 40, techReq: 10.0, cat: 'destroyer', era: 'ERA8', desc: 'Orbital combat vessel' },
  ],
  submarine: [
    { name: 'Deep Sea Combat Sub', power: 50, cost: 32, techReq: 9.8, cat: 'submarine', era: 'ERA8', desc: 'Full-ocean-depth combat sub' },
    { name: 'Space Submersible', power: 48, cost: 35, techReq: 10.0, cat: 'submarine', era: 'ERA8', desc: 'Orbital/underwater convertible' },
  ],
  carrier: [
    { name: 'Orbital Fleet Carrier', power: 65, cost: 55, techReq: 9.8, cat: 'carrier', era: 'ERA8', desc: 'Orbital aircraft carrier' },
    { name: 'Mobile Space Dock', power: 60, cost: 58, techReq: 10.0, cat: 'carrier', era: 'ERA8', desc: 'Mobile orbital shipyard' },
  ],
  patrol: [
    { name: 'Orbital Patrol Craft', power: 30, cost: 20, techReq: 9.8, cat: 'patrol', era: 'ERA8', desc: 'Space patrol vessel' },
    { name: 'Auto-Patrol USV', power: 22, cost: 14, techReq: 10.0, cat: 'patrol', era: 'ERA8', desc: 'AI autonomous patrol fleet' },
  ],
  missile: [
    { name: 'Anti-Matter Missile', power: 70, cost: 30, techReq: 10.0, cat: 'missile', era: 'ERA8', desc: 'Matter-antimatter warhead' },
    { name: 'Orbital Strike Missile', power: 65, cost: 28, techReq: 9.8, cat: 'missile', era: 'ERA8', desc: 'Space-to-ground precision strike' },
    { name: 'Defense Laser Satellite', power: 40, cost: 25, techReq: 10.0, cat: 'missile', era: 'ERA8', desc: 'Orbital defense laser' },
  ],
  rifle: [
    { name: 'Energy Rifle', power: 15, cost: 7, techReq: 9.8, cat: 'rifle', era: 'ERA8', desc: 'Directed-energy infantry rifle' },
    { name: 'Smart Rifle Mk2', power: 14, cost: 6, techReq: 9.8, cat: 'rifle', era: 'ERA8', desc: 'AI-targeting smart rifle' },
  ],
  artillery: [
    { name: 'Orbital Kinetic Strike', power: 55, cost: 35, techReq: 9.8, cat: 'artillery', era: 'ERA8', desc: 'Kinetic orbital bombardment' },
    { name: 'Directed Energy Cannon', power: 50, cost: 32, techReq: 10.0, cat: 'artillery', era: 'ERA8', desc: 'Ground-based DEW artillery' },
  ],
  drone: [
    { name: 'Nano Drone Swarm', power: 18, cost: 6, techReq: 9.8, cat: 'drone', era: 'ERA8', desc: 'Micro/nano drone swarm' },
    { name: 'Orbital Drone Platform', power: 28, cost: 15, techReq: 10.0, cat: 'drone', era: 'ERA8', desc: 'Space-based drone mothership' },
    { name: 'Combat Android', power: 20, cost: 10, techReq: 10.0, cat: 'drone', era: 'ERA8', desc: 'Autonomous combat android' },
  ],
  satellite: [
    { name: 'Death Star Platform', power: 30, cost: 40, techReq: 10.0, cat: 'satellite', era: 'ERA8', desc: 'Orbital DEW platform' },
    { name: 'Quantum Entanglement Comms', power: 10, cost: 22, techReq: 9.8, cat: 'satellite', era: 'ERA8', desc: 'Instant comms satellite' },
  ],
};


// ============================================================
// MILITARY SYSTEM GAME LOGIC
// ============================================================

// ─── COMPANY MANAGEMENT ─────────────────────────────────

// Get all companies currently owned by a nation
function getNationDefenseCompanies(nation) {
  return DEFENSE_COMPANIES.filter(c => c.foundedBy === (nation.id || nation.name));
}

// Get a specific company by ID
function getCompanyById(companyId) {
  return DEFENSE_COMPANIES.find(c => c.id === companyId);
}

// Get available equipment templates for a company's tech level
function getAvailableEquipment(company) {
  const era = getEraForTechLevel(company.techLevel);
  const eraKey = era.label === 'WW1 Era' ? 'ERA1' :
                 era.label === 'Interwar' ? 'ERA2' :
                 era.label === 'WW2 Era' ? 'ERA3' :
                 era.label === 'Early Cold War' ? 'ERA4' :
                 era.label === 'Late Cold War' ? 'ERA5' :
                 era.label === 'Modern' ? 'ERA6' :
                 era.label === 'Near Future' ? 'ERA7' : 'ERA8';
  return EQUIPMENT_TEMPLATES[eraKey] || { fighter: [], bomber: [], transport: [], helicopter: [], tank: [], ifv: [], destroyer: [], submarine: [], carrier: [], patrol: [], missile: [], rifle: [], artillery: [], drone: [], satellite: [] };
}

// Get all equipment a company has researched
function getCompanyEquipment(company) {
  return company.equipment || [];
}

// Find a specific equipment template by name and category
function findEquipmentTemplate(name, category) {
  for (const eraKey of Object.keys(EQUIPMENT_TEMPLATES)) {
    const era = EQUIPMENT_TEMPLATES[eraKey];
    if (era[category]) {
      const found = era[category].find(e => e.name === name);
      if (found) return found;
    }
  }
  return null;
}

function getDefenseInputRecipe(category, techReq) {
  const recipes = {
    rifle: {
      products: { steel: 0.002, gunpowder: 0.0022, explosives: 0.0005 },
      resources: { minerals: 0.0008 },
    },
    tank: {
      products: { steel: 2.8, armor_composites: 1.5, chips: 0.8, guidance_electronics: 0.45, refined_fuel: 1.2, explosives: 0.7 },
      resources: { rareEarth: 0.45, minerals: 0.55 },
    },
    ifv: {
      products: { steel: 1.2, armor_composites: 0.6, chips: 0.35, refined_fuel: 0.5, explosives: 0.2 },
      resources: { rareEarth: 0.2, minerals: 0.3 },
    },
    artillery: {
      products: { steel: 1.0, gunpowder: 0.25, explosives: 0.45, industrial_machinery: 0.3 },
      resources: { minerals: 0.28 },
    },
    missile: {
      products: { steel: 0.08, explosives: 0.10, chips: 0.06, guidance_electronics: 0.10, refined_fuel: 0.08 },
      resources: { rareEarth: 0.05 },
    },
    drone: {
      products: { steel: 0.05, chips: 0.09, guidance_electronics: 0.08, battery_cells: 0.05 },
      resources: { rareEarth: 0.07 },
    },
    fighter: {
      products: { steel: 1.7, armor_composites: 1.2, chips: 1.2, guidance_electronics: 1.0, refined_fuel: 1.6, industrial_machinery: 0.8 },
      resources: { rareEarth: 0.75, minerals: 0.4 },
    },
    bomber: {
      products: { steel: 2.3, armor_composites: 1.6, chips: 1.0, guidance_electronics: 1.1, refined_fuel: 1.8 },
      resources: { rareEarth: 0.8, minerals: 0.5 },
    },
    helicopter: {
      products: { steel: 0.9, armor_composites: 0.5, chips: 0.5, guidance_electronics: 0.35, refined_fuel: 0.65 },
      resources: { rareEarth: 0.28, minerals: 0.2 },
    },
    transport: {
      products: { steel: 0.85, chips: 0.25, refined_fuel: 0.7, industrial_machinery: 0.35 },
      resources: { minerals: 0.25 },
    },
    destroyer: {
      products: { steel: 4.5, armor_composites: 2.1, chips: 1.8, guidance_electronics: 1.5, refined_fuel: 2.6, industrial_machinery: 1.2 },
      resources: { rareEarth: 1.15, minerals: 1.2 },
    },
    submarine: {
      products: { steel: 4.0, armor_composites: 2.5, chips: 2.0, guidance_electronics: 1.7, refined_fuel: 2.2 },
      resources: { rareEarth: 1.4, minerals: 1.0 },
    },
    carrier: {
      products: { steel: 9.0, armor_composites: 4.0, chips: 3.0, guidance_electronics: 2.6, refined_fuel: 4.8, industrial_machinery: 2.8 },
      resources: { rareEarth: 2.4, minerals: 2.6 },
    },
    patrol: {
      products: { steel: 0.7, chips: 0.2, refined_fuel: 0.5, industrial_machinery: 0.2 },
      resources: { minerals: 0.2 },
    },
    satellite: {
      products: { steel: 0.2, chips: 1.8, guidance_electronics: 1.8, battery_cells: 1.0, armor_composites: 0.2 },
      resources: { rareEarth: 1.8, minerals: 0.35 },
    },
  };
  const base = recipes[category] || { products: {}, resources: {} };
  const techScale = clamp(0.55 + (Number(techReq || 1) * 0.04), 0.50, 1.0);
  const out = { products: {}, resources: {} };
  Object.entries(base.products || {}).forEach(([id, qty]) => {
    out.products[id] = Number(qty) * techScale;
  });
  Object.entries(base.resources || {}).forEach(([id, qty]) => {
    out.resources[id] = Number(qty) * techScale;
  });
  return out;
}

function scaleDefenseInputRecipe(recipe, scale) {
  const normalizedScale = Math.max(1, Number(scale) || 1);
  const effectiveScale = Math.pow(normalizedScale, 0.82);
  const bulkDiscount = clamp(1.05 - Math.log10(normalizedScale + 9) * 0.22, 0.55, 1.0);
  const result = { products: {}, resources: {} };
  Object.entries(recipe.products || {}).forEach(([id, qty]) => {
    result.products[id] = Number(qty) * effectiveScale * bulkDiscount;
  });
  Object.entries(recipe.resources || {}).forEach(([id, qty]) => {
    result.resources[id] = Number(qty) * effectiveScale * bulkDiscount;
  });
  return result;
}

// ─── COMPANY RESEARCH ──────────────────────────────────

// Calculate research cost multiplier based on tier (makes higher tiers exponentially slower)
function getResearchCostMultiplier(tier) {
  // Tier 1: 1.0x, Tier 5: 2.0x, Tier 10: 4.5x
  return 1 + (tier - 1) * 0.35;
}

// Process company research each turn
function processCompanyResearch(company, nation, isPlayer = false) {
  if (!company.researchFocus) return;
  
  const era = getEraForTechLevel(company.techLevel);
  const templates = EQUIPMENT_TEMPLATES[company.techLevel >= 9.5 ? 'ERA8' :
                     company.techLevel >= 9.0 ? 'ERA7' :
                     company.techLevel >= 8.0 ? 'ERA6' :
                     company.techLevel >= 7.0 ? 'ERA5' :
                     company.techLevel >= 5.5 ? 'ERA4' :
                     company.techLevel >= 4.0 ? 'ERA3' :
                     company.techLevel >= 2.5 ? 'ERA2' : 'ERA1'];
  
  const categoryItems = templates[company.researchFocus] || [];
  
  // Find unresearched item
  const alreadyHas = new Set((company.equipment || []).map(e => e.name));
  const target = categoryItems.find(item => !alreadyHas.has(item.name) && item.techReq <= company.techLevel);
  
  if (!target) {
    // All items in this category researched - upgrade tier (breakthrough)
    company.researchFocus = null;
    company.researchProgress = 0;
    company.tier = Math.min(10, company.tier + 1);
    company.techLevel = Math.min(10, company.techLevel + 0.5);
    return;
  }
  
  // Research speed based on nation education, gov quality, budget
  const eduBoost = clamp(nation.education / 40, 0.5, 2.5);
  const govBoost = clamp(nation.governance / 40, 0.5, 2.0);
  const budgetBoost = 1 + (isPlayer ? (GAME.budget?.defense || 0) * 0.02 : 0);
  const techBoost = clamp(nation.techLevel / 5, 0.3, 2.0);
  
  const researchSpeed = 0.5 * eduBoost * govBoost * budgetBoost * techBoost;
  company.researchProgress += researchSpeed;
  company.totalResearchCost = (company.totalResearchCost || 0) + researchSpeed; // track cumulative R&D spend
  
  // Check if research complete (with tier-based cost multiplier)
  const tierMultiplier = getResearchCostMultiplier(company.tier);
  const cost = target.cost * 2 * tierMultiplier; // Research cost scales with tier
  if (company.researchProgress >= cost) {
    if (!company.equipment) company.equipment = [];
    company.equipment.push({...target, produced: 0, id: `${company.id}_${target.name.replace(/\s+/g, '_')}`, tierUnlockedAt: company.tier});
    company.researchProgress = 0;
    
    // Add news if player
    if (isPlayer) {
      addNews(`🏭 ${company.name} has developed ${target.name} (${company.researchFocus})`, 'minor');
    }
  }
}

// ─── COMPANY PRODUCTION ───────────────────────────────

// Produce equipment (costs treasury)
// Internal production function used by both AI and UI
function _produceEquipInternal(company, equipmentId, quantity, nation, isPlayer) {
  const eq = company.equipment?.find(e => e.id === equipmentId);
  if (!eq) return 0;
  
  const template = findEquipmentTemplate(eq.name, eq.cat);
  if (!template) return 0;

  const requestQty = Math.max(0, Math.floor(Number(quantity || 0)));
  if (requestQty <= 0) return 0;

  const displayUnitsRequested = Math.max(1, getDisplayQuantity(eq.cat, requestQty));
  const recipe = getDefenseInputRecipe(eq.cat, template.techReq || company.techLevel || 1);
  const scaledRecipe = scaleDefenseInputRecipe(recipe, displayUnitsRequested);

  let materialCoverage = 1;
  let materialCost = 0;
  let shortages = [];
  if (typeof acquireDefenseInputMaterials === 'function') {
    const procurement = acquireDefenseInputMaterials(nation, company, scaledRecipe);
    materialCoverage = clamp(Number(procurement.coverage || 0), 0, 1);
    materialCost = Math.max(0, Number(procurement.totalCost || 0));
    shortages = Array.isArray(procurement.shortage) ? procurement.shortage : [];
    company.lastProcurement = procurement;
    company.procurementSpend = Number(company.procurementSpend || 0) + materialCost;
    const supplierVolumes = {};
    (procurement.procurement || []).forEach((entry) => {
      // Extract actual company name from the "from" field (format: "flag CompanyName" or "flag nation CompanyName")
      const from = entry?.from || 'unknown';
      // Skip the flag emoji (first part), take everything after it
      const parts = from.split(' ');
      // If format is "flag CompanyName", take parts[1]
      // If format is "flag nation CompanyName", take parts[2:]
      // If format is just a name, take it as-is
      let companyName = 'Unknown';
      if (parts.length === 1) {
        companyName = parts[0];
      } else if (parts.length === 2) {
        companyName = parts[1];
      } else if (parts.length >= 3) {
        companyName = parts.slice(2).join(' ');
      }
      const key = companyName || 'Unknown';
      supplierVolumes[key] = (supplierVolumes[key] || 0) + Math.max(0, Number(entry?.units || 0));
    });
    company.supplierRelations = Object.entries(supplierVolumes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, units]) => ({ name, units }));
  }

  const producibleQty = Math.max(0, Math.floor(requestQty * materialCoverage));
  if (producibleQty <= 0) {
    if (isPlayer) {
      addNews(`⚠ ${company.name} cannot produce ${eq.name}: missing industrial inputs.`, 'minor');
    }
    return 0;
  }
  
  const manufacturingCost = getEquipmentUnitCost(template, eq.cat) * producibleQty;
  const procurementCost = materialCost * (producibleQty / Math.max(1, requestQty));
  const totalCost = manufacturingCost + procurementCost;
  
  if (isPlayer && typeof GAME !== 'undefined' && GAME.treasury < totalCost) {
    addNews('⚠ Insufficient funds for production!', 'minor');
    return 0;
  }
  
  if (isPlayer && typeof GAME !== 'undefined') {
    GAME.treasury -= totalCost;
  }
  
  eq.produced = (eq.produced || 0) + producibleQty;
  
  // Add to nation's military stockpile
  if (!nation.militaryStockpile) nation.militaryStockpile = {};
  if (!nation.militaryStockpile[eq.cat]) nation.militaryStockpile[eq.cat] = [];
  
  const existing = nation.militaryStockpile[eq.cat].find(s => s.name === eq.name);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + producibleQty;
    existing.condition = Math.max(existing.condition || 100, 100);
  } else {
    nation.militaryStockpile[eq.cat].push({
      ...eq,
      quantity: producibleQty,
      condition: 100,
      companyTier: company.tier,  // Track which tier unlocked this equipment
      producedByCompany: company.id,  // Track source company
    });
  }

  const shortfallQty = Math.max(0, requestQty - producibleQty);
  if (shortfallQty > 0) {
    company.unmetMaterialDemand = Number(company.unmetMaterialDemand || 0) + shortfallQty;
  }
  
  if (isPlayer) {
    addNews(`✅ Produced ${formatEquipmentDisplayQuantity(eq.cat, producibleQty)} ${eq.name}`, 'minor');
    if (shortfallQty > 0 || shortages.length > 0) {
      addNews(`⚠ ${company.name} partial output due to input shortages (${formatEquipmentDisplayQuantity(eq.cat, shortfallQty)} deferred).`, 'minor');
    }
  }
  return producibleQty;
}

// ─── COMPANY FOUNDING ─────────────────────────────────

// Found a new defense company (costs money)
function foundDefenseCompany(nation, companyIndex) {
  if (companyIndex < 0 || companyIndex >= DEFENSE_COMPANIES.length) return false;
  
  const company = DEFENSE_COMPANIES[companyIndex];
  if (company.foundedBy !== null) return false; // Already founded
  
  // Cost based on nation GDP
  const cost = clamp(50 + nation.techLevel * 10, 30, 200);
  if (typeof GAME !== 'undefined' && GAME.treasury < cost) return false;
  
  if (typeof GAME !== 'undefined') {
    GAME.treasury -= cost;
  }
  
  company.foundedBy = nation.id || nation.name;
  company.foundedTurn = GAME.turn || 0;
  company.techLevel = nation.techLevel;
  company.tier = 1;
  company.equipment = [];
  company.researchFocus = null;
  company.researchProgress = 0;
  
  // Grant initial equipment based on era
  const era = getEraForTechLevel(company.techLevel);
  const eraKey = era.label === 'WW1 Era' ? 'ERA1' :
                 era.label === 'Interwar' ? 'ERA2' :
                 era.label === 'WW2 Era' ? 'ERA3' :
                 era.label === 'Early Cold War' ? 'ERA4' :
                 era.label === 'Late Cold War' ? 'ERA5' :
                 era.label === 'Modern' ? 'ERA6' :
                 era.label === 'Near Future' ? 'ERA7' : 'ERA8';
  const templates = EQUIPMENT_TEMPLATES[eraKey];
  if (templates) {
    // Give one basic item from each available category
    const cats = ['rifle', 'fighter', 'tank', 'transport', 'destroyer'];
    cats.forEach(cat => {
      const items = templates[cat] || [];
      if (items.length > 0) {
        company.equipment.push({...items[0], produced: 0, id: `${company.id}_${items[0].name.replace(/\s+/g, '_')}`});
      }
    });
  }
  
  addNews(`🏭 ${company.name} founded in ${nation.name}`, 'minor');
  return true;
}

const DEFENSE_FOUNDING_THRESHOLDS = [
  { tier: 1, education: 20, score: 0.16 },
  { tier: 2, education: 30, score: 0.28 },
  { tier: 3, education: 40, score: 0.42 },
  { tier: 4, education: 52, score: 0.58 },
  { tier: 5, education: 62, score: 0.72 },
];

function _dcHash(input) {
  let hash = 0;
  const text = String(input || '');
  for (let i = 0; i < text.length; i++) {
    hash = Math.imul(31, hash) + text.charCodeAt(i) | 0;
  }
  return Math.abs(hash);
}

function _tierLabel(tier) {
  const labels = {
    1: 'infantry & small arms',
    2: 'armor & naval',
    3: 'missiles & aviation',
    4: 'electronics & advanced jets',
    5: 'stealth, cyber & space',
  };
  return labels[tier] || 'defense';
}

function _defenseResourceScore(nation) {
  const data = nation?.resourceData || {};
  const minerals = Number(data.minerals?.level || 0);
  const rareEarth = Number(data.rareEarth?.level || 0);
  const oil = Number(data.oil?.level || 0);
  const gas = Number(data.gas?.level || 0);
  const coal = Number(data.coal?.level || 0);
  const base = Number(nation?.resources || 0);
  return clamp(
    base * 0.18 + minerals * 0.26 + rareEarth * 0.34 + oil * 0.12 + gas * 0.06 + coal * 0.04,
    8,
    160
  );
}

function _defenseTierResourceGate(nation, tier) {
  const resourceScore = _defenseResourceScore(nation);
  const techLevel = Number(nation?.techLevel || 1);
  const gates = {
    1: 14,
    2: 24,
    3: 36,
    4: 52,
    5: 68,
  };
  const required = gates[tier] || 24;
  return resourceScore >= required && techLevel >= Math.max(1, tier * 0.85);
}

function _defenseNationScore(nation) {
  const education = Number(nation?.education || 0);
  const governance = Number(nation?.governance || 0);
  const techLevel = Number(nation?.techLevel || 0);
  const innovationRisk = Number(nation?.innovationRisk ?? 45);
  const riskDiscipline = 100 - innovationRisk;
  const rawInnovation = ((education * 0.45) + (governance * 0.20) + (techLevel * 12) + (riskDiscipline * 0.15)) / 100;
  const militaryBudgetShare = clamp(((nation?.aiBudget?.military ?? 20) / 35), 0.5, 1.6);
  const resourceFactor = clamp((_defenseResourceScore(nation) / 62), 0.45, 1.9);
  return clamp(rawInnovation * militaryBudgetShare * resourceFactor, 0.08, 2.5);
}

function _defenseMaxFoundingTier(nation) {
  const score = _defenseNationScore(nation);
  const education = Number(nation?.education || 0);
  let maxTier = 0;

  DEFENSE_FOUNDING_THRESHOLDS.forEach(threshold => {
    if (education >= threshold.education && score >= threshold.score) {
      maxTier = threshold.tier;
    }
  });

  return maxTier;
}

function processDefenseCompanyFoundings() {
  const unfounded = DEFENSE_COMPANIES.filter(company => company.foundedBy === null);
  if (unfounded.length === 0 || !NATIONS) return;

  const COOLDOWN_TURNS = 30;
  const MAX_PER_NATION = 3;
  const MAX_GLOBAL_PER_TURN = 2;
  let globalFoundedThisTurn = 0;

  const nationIds = Object.keys(NATIONS).sort((a, b) => {
    const aHash = _dcHash(`${a}-${GAME?.turn || 0}`) % 10000;
    const bHash = _dcHash(`${b}-${GAME?.turn || 0}`) % 10000;
    return aHash - bHash;
  });

  for (const nationId of nationIds) {
    if (globalFoundedThisTurn >= MAX_GLOBAL_PER_TURN) break;

    const nation = NATIONS[nationId];
    if (!nation || nation.failedState) continue;

    if (nation.lastDefCompanyFoundedTurn != null && ((GAME?.turn || 0) - nation.lastDefCompanyFoundedTurn) < COOLDOWN_TURNS) {
      continue;
    }

    const ownedCount = DEFENSE_COMPANIES.filter(company => company.foundedBy === nationId).length;
    if (ownedCount >= MAX_PER_NATION) continue;

    const maxTier = _defenseMaxFoundingTier(nation);
    if (maxTier <= 0) continue;

    const eligible = unfounded.filter(company => {
      const tier = company.foundingTier || 3;
      return tier <= maxTier && _defenseTierResourceGate(nation, tier);
    });
    if (eligible.length === 0) continue;

    const score = _defenseNationScore(nation);
    const threshold = DEFENSE_FOUNDING_THRESHOLDS.find(entry => entry.tier === maxTier);
    const excess = threshold ? Math.max(0, score - threshold.score) : 0;
    const probability = clamp(excess * 0.08 + 0.01, 0.005, 0.12);
    if (Math.random() > probability) continue;

    const lowestTier = Math.min(...eligible.map(company => company.foundingTier || 3));
    const sameTierCandidates = eligible.filter(company => (company.foundingTier || 3) === lowestTier);
    const pickIndex = _dcHash(`${nationId}-${GAME?.turn || 0}-defense-company`) % sameTierCandidates.length;
    const pick = sameTierCandidates[pickIndex];
    if (!pick) continue;

    pick.foundedBy = nationId;
    pick.foundedTurn = GAME?.turn || 0;
    pick.tier = 1;
    pick.techLevel = clamp(Number(nation.techLevel || 1) * 0.8, 1.0, 10.0);
    pick.researchProgress = 0;
    pick.researchFocus = null;
    pick.equipment = [];
    pick.supplierRelations = [];

    const eraLabel = getEraForTechLevel(pick.techLevel).label;
    const eraKey = eraLabel === 'WW1 Era' ? 'ERA1' :
      eraLabel === 'Interwar' ? 'ERA2' :
      eraLabel === 'WW2 Era' ? 'ERA3' :
      eraLabel === 'Early Cold War' ? 'ERA4' :
      eraLabel === 'Late Cold War' ? 'ERA5' :
      eraLabel === 'Modern' ? 'ERA6' :
      eraLabel === 'Near Future' ? 'ERA7' : 'ERA8';
    const eraTemplates = EQUIPMENT_TEMPLATES[eraKey] || EQUIPMENT_TEMPLATES.ERA1;
    const resourceScore = _defenseResourceScore(nation);
    const starterCategories = resourceScore >= 70
      ? ['tank', 'fighter', 'missile', 'artillery', 'drone', 'rifle']
      : resourceScore >= 40
        ? ['tank', 'artillery', 'drone', 'rifle', 'ifv']
        : ['rifle', 'artillery', 'ifv', 'drone'];

    starterCategories.forEach((cat) => {
      const options = (eraTemplates?.[cat] || []).filter(item => Number(item.techReq || 1) <= pick.techLevel + 0.65);
      if (!options.length) return;
      const selected = options[Math.floor(Math.random() * Math.min(options.length, 2))];
      if (!selected) return;
      pick.equipment.push({
        ...selected,
        produced: 0,
        id: `${pick.id}_${selected.name.replace(/\s+/g, '_')}`,
        tierUnlockedAt: pick.tier,
      });
    });

    if (!pick.equipment.length) {
      const fallback = (eraTemplates?.rifle || [])[0] || (EQUIPMENT_TEMPLATES.ERA1.rifle || [])[0];
      if (fallback) {
        pick.equipment.push({
          ...fallback,
          produced: 0,
          id: `${pick.id}_${fallback.name.replace(/\s+/g, '_')}`,
          tierUnlockedAt: pick.tier,
        });
      }
    }

    pick.researchFocus = pick.equipment[0]?.cat || 'rifle';
    nation.lastDefCompanyFoundedTurn = GAME?.turn || 0;

    if (typeof initDefenseCompanyFinancials === 'function') {
      initDefenseCompanyFinancials(pick);
    }
    if (typeof initDefenseCompanyOrderState === 'function') {
      initDefenseCompanyOrderState(pick);
    }

    const year = GAME?.date instanceof Date ? GAME.date.getFullYear() : '?';
    if (typeof addNews === 'function') {
      addNews(`🏭 ${nation.flag || ''} ${nation.name} establishes ${pick.name} — ${_tierLabel(lowestTier)} contractor (${year})`, 'military');
    }

    globalFoundedThisTurn++;
    const unfoundedIndex = unfounded.indexOf(pick);
    if (unfoundedIndex !== -1) unfounded.splice(unfoundedIndex, 1);
  }
}

// ─── AI DECISIONS ─────────────────────────────────────

// AI nations decide to found companies periodically
function aiManageDefenseCompanies(nation) {
  if (nation.failedState) return;
  if (nation.aiDefenseCooldown === undefined) nation.aiDefenseCooldown = 0;
  if (nation.aiDefenseCooldown > 0) { nation.aiDefenseCooldown--; return; }

  const warPressure = typeof getWarPressure === 'function' ? getWarPressure(nation.id || '') : 0;
  const inHotWar = warPressure > 0.2;
  const owned = getNationDefenseCompanies(nation);
  
  // Assign research focus for owned companies
  owned.forEach(company => {
    if (!company.researchFocus) {
      const cats = inHotWar
        ? ['tank', 'fighter', 'artillery', 'missile', 'drone', 'rifle', 'ifv', 'helicopter', 'submarine', 'destroyer', 'transport']
        : ['fighter', 'tank', 'rifle', 'destroyer', 'missile', 'drone', 'submarine', 'artillery', 'helicopter', 'transport'];
      company.researchFocus = cats[Math.floor(Math.random() * cats.length)];
      company.researchProgress = 0;
    }
    
    // Process research
    processCompanyResearch(company, nation, false);

    // During active wars, periodically retarget research toward combat essentials.
    if (inHotWar && Math.random() < 0.2) {
      const wartimeFocus = ['tank', 'fighter', 'artillery', 'missile', 'drone', 'rifle'];
      company.researchFocus = wartimeFocus[Math.floor(Math.random() * wartimeFocus.length)];
    }
    
    // Produce equipment if needed
    const productionChance = clamp(0.45 + warPressure * 0.3, 0.45, 0.95);
    if (Math.random() < productionChance && company.equipment && company.equipment.length > 0) {
      const demandProfile = getNationEquipmentDemand(nation);
      const toProduce = company.equipment.filter(e => {
        const desired = demandProfile[e.cat] || 0;
        if (desired <= 0) return false;
        return getCategoryInventoryTotal(nation, e.cat) < desired;
      });
      if (toProduce.length > 0) {
        const prioritized = inHotWar
          ? toProduce.filter(e => ['tank', 'fighter', 'artillery', 'missile', 'drone', 'rifle', 'ifv', 'helicopter'].includes(e.cat))
          : toProduce;
        const sourcePool = prioritized.length > 0 ? prioritized : toProduce;
        sourcePool.sort((a, b) => {
          const shortageA = (demandProfile[a.cat] || 0) - getCategoryInventoryTotal(nation, a.cat);
          const shortageB = (demandProfile[b.cat] || 0) - getCategoryInventoryTotal(nation, b.cat);
          return shortageB - shortageA;
        });
        const pick = sourcePool[0];
        const shortage = Math.max(0, (demandProfile[pick.cat] || 0) - getCategoryInventoryTotal(nation, pick.cat));
        const qty = getEquipmentProcurementBatch(pick.cat, Math.max(shortage, Math.ceil(shortage * 0.45) + 20), true, nation);
        if (qty > 0) _produceEquipInternal(company, pick.id, qty, nation, false);
      }
    }
  });
  
  // Set cooldown
  nation.aiDefenseCooldown = 1 + Math.floor(Math.random() * 2);
}

const DEFENSE_GOV_PROCUREMENT_BIAS = {
  liberal_democracy: 1.0,
  federal_republic: 1.05,
  constitutional_monarchy: 0.95,
  authoritarian_state: 1.2,
  dictatorship: 1.15,
  military_junta: 1.35,
  technocratic_council: 1.12,
  socialist_republic: 1.08,
  theocratic_state: 1.02,
};

function initDefenseCompanyOrderState(company) {
  if (!Array.isArray(company.pendingOrders)) company.pendingOrders = [];
  if (!Array.isArray(company.completedOrders)) company.completedOrders = [];
  if (!company.orderLedger || typeof company.orderLedger !== 'object') company.orderLedger = {};
  if (!company.productionByCategory || typeof company.productionByCategory !== 'object') company.productionByCategory = {};
}

function getNationDefenseBuyingStrategy(nation) {
  initNationMilitaryForces(nation);
  const techLevel = Number(nation?.techLevel || 1);
  const gdp = Number(nation?.gdp || 0.2);
  const education = Number(nation?.education || 40);
  const readiness = Number(nation?.militaryForces?.readiness || 50);
  const warPressure = typeof getWarPressure === 'function' ? getWarPressure(nation?.id || '') : 0;

  const modernization = clamp((techLevel - 4.5) * 0.26 + (education - 45) * 0.01 + warPressure * 0.9, -0.8, 1.4);
  const wealth = clamp(Math.log10(Math.max(gdp, 0.08)) + 0.6, 0, 2.2);
  const qualityIndex = clamp((modernization + wealth * 0.7 + (readiness - 50) * 0.01) / 2, 0, 1);
  const volumeMode = qualityIndex < 0.52;

  return {
    mode: volumeMode ? 'volume' : 'quality',
    qtyMultiplier: volumeMode ? clamp(1.35 + (0.55 - qualityIndex), 1.2, 2.1) : clamp(0.55 + qualityIndex * 0.65, 0.7, 1.3),
    techPreference: volumeMode ? 'low' : 'high',
    qualityIndex,
  };
}

function getNationByIdOrName(idOrName) {
  if (!idOrName) return null;
  return Object.values(NATIONS || {}).find(n => n && (n.id === idOrName || n.name === idOrName)) || null;
}

function getDefenseOrderCandidateCompanies(category, buyerNation) {
  const buyerId = buyerNation?.id;
  const list = [];
  DEFENSE_COMPANIES.forEach(company => {
    if (!company || !company.foundedBy) return;
    if (!(company.equipment || []).some(eq => eq.cat === category)) return;
    const sellerNation = getNationByIdOrName(company.foundedBy);
    if (!sellerNation || sellerNation.failedState) return;
    const relation = typeof getRelationBetween === 'function'
      ? getRelationBetween(buyerId, sellerNation.id)
      : (typeof getRelation === 'function' ? getRelation(sellerNation.id) : 0);
    const allied = typeof isAlliedNation === 'function' ? isAlliedNation(buyerId, sellerNation.id) : false;
    if (sellerNation.id !== buyerId && !allied && relation < -25) return;

    const score = (company.tier || 1) * 0.9 + (company.techLevel || 1) * 0.8 + ((allied ? 16 : 0) + relation * 0.3);
    list.push({ company, sellerNation, score });
  });
  return list.sort((a, b) => b.score - a.score);
}

function processDefenseProcurementRequests() {
  let issuedThisTurn = 0;
  Object.values(NATIONS).forEach(buyerNation => {
    if (!buyerNation || buyerNation.failedState) return;
    if (issuedThisTurn >= 20) return;

    if (Number(buyerNation.defenseRequestCooldown || 0) > 0) {
      buyerNation.defenseRequestCooldown = Math.max(0, Number(buyerNation.defenseRequestCooldown || 0) - 1);
      return;
    }

    initNationMilitaryForces(buyerNation);

    const demand = getNationEquipmentDemand(buyerNation);
    const govBias = DEFENSE_GOV_PROCUREMENT_BIAS[buyerNation.governmentStyle] || 1;
    const warPressure = typeof getWarPressure === 'function' ? getWarPressure(buyerNation.id || '') : 0;
    const inHotWar = warPressure > 0.2;
    const strategy = getNationDefenseBuyingStrategy(buyerNation);
    buyerNation.defenseBuyingStrategy = strategy.mode;
    const requestChance = clamp(0.16 + govBias * 0.08 + warPressure * 0.34 + (strategy.mode === 'volume' ? 0.08 : 0.03), 0.12, 0.92);
    if (Math.random() > requestChance) return;

    // Build shortage list for all categories
    const shortages = [];
    Object.keys(demand).forEach(category => {
      const desired = Number(demand[category] || 0);
      const inventory = getCategoryInventoryTotal(buyerNation, category);
      const gap = Math.max(0, desired - inventory);
      if (gap <= 0) return;
      shortages.push({ category, gap });
    });
    if (!shortages.length) return;

    shortages.sort((a, b) => b.gap - a.gap);

    // Determine package size: 2-4 items based on war pressure and strategy
    const packageSize = inHotWar
      ? clamp(3 + Math.floor(Math.random() * 2), 2, 5)
      : clamp(2 + Math.floor(Math.random() * 2), 1, 4);

    // Select categories for the package deal
    const preferredCats = strategy.mode === 'volume'
      ? ['rifle', 'tank', 'artillery', 'ifv', 'drone', 'helicopter', 'patrol']
      : ['fighter', 'missile', 'drone', 'satellite', 'submarine', 'destroyer', 'tank'];

    // Pick primary category (largest gap from preferred list)
    const primaryPick = shortages.find(entry => preferredCats.includes(entry.category)) || shortages[0];
    const packageCategories = [primaryPick];

    // Fill remaining slots with other shortages
    for (const shortage of shortages) {
      if (packageCategories.length >= packageSize) break;
      if (!packageCategories.find(p => p.category === shortage.category)) {
        packageCategories.push(shortage);
      }
    }

    // Create orders for each category in the package
    const packageId = `pkg_${(GAME?.turn || 0)}_${buyerNation.id}_${Math.floor(Math.random() * 9999)}`;
    const orderDetails = [];

    for (const pick of packageCategories) {
      const candidates = getDefenseOrderCandidateCompanies(pick.category, buyerNation);
      if (!candidates.length) continue;

      const shortlisted = candidates.slice(0, Math.min(6, candidates.length));
      const sellerPick = strategy.techPreference === 'high'
        ? shortlisted[0]
        : shortlisted[Math.floor(Math.random() * Math.min(3, shortlisted.length))];
      const company = sellerPick.company;
      initDefenseCompanyOrderState(company);

      const qtyScale = getEquipmentUnitMultiplier(pick.category);
      const desiredUnits = Math.max(1, Math.floor(pick.gap / Math.max(1, qtyScale)));
      // Package deals: slightly smaller quantities per item since buying multiple types
      const packageDiscount = packageCategories.length > 1 ? 0.7 : 1.0;
      const baselineQty = Math.round(desiredUnits * (inHotWar ? 0.72 : 0.42) * strategy.qtyMultiplier * packageDiscount + (inHotWar ? 9 : 4));
      const requestQty = clamp(
        baselineQty,
        2,
        pick.category === 'rifle' ? 420 : (pick.category === 'tank' ? 2400 : (pick.category === 'missile' ? 12000 : 520))
      );

      const order = {
        id: `ord_${(GAME?.turn || 0)}_${buyerNation.id}_${company.id}_${pick.category}_${Math.floor(Math.random() * 9999)}`,
        packageId: packageId,
        buyerNationId: buyerNation.id,
        sellerNationId: sellerPick.sellerNation.id,
        companyId: company.id,
        category: pick.category,
        requestedQuantity: requestQty,
        remainingQuantity: requestQty,
        createdTurn: GAME?.turn || 0,
        priority: inHotWar ? 'urgent' : 'standard',
        status: 'queued',
      };

      company.pendingOrders.push(order);
      orderDetails.push({ category: pick.category, qty: requestQty, company: company.name });
      issuedThisTurn++;
    }

    if (orderDetails.length > 0) {
      buyerNation.defenseRequestCooldown = inHotWar ? (1 + Math.floor(Math.random() * 2)) : (2 + Math.floor(Math.random() * 4));

      // News for package deals
      if (Math.random() < 0.35 || inHotWar) {
        const summary = orderDetails.map(o => `${formatEquipmentDisplayQuantity(o.category, o.qty)} ${o.category}`).join(', ');
        const primaryCompany = orderDetails[0].company;
        addNews(`📨 ${buyerNation.flag || '🏳️'} ${buyerNation.name} requested package deal: ${summary} from ${primaryCompany}.`, inHotWar ? 'major' : 'minor');
      }
    }
  });
}

function fulfillDefenseCompanyOrders(company, sellerNation) {
  initDefenseCompanyOrderState(company);
  if (!company.pendingOrders.length) return;

  const remainingOrders = [];
  const processedThisTurn = 4 + Math.floor((company.tier || 1) / 2);
  let processed = 0;

  company.pendingOrders.forEach(order => {
    if (processed >= processedThisTurn) {
      remainingOrders.push(order);
      return;
    }

    const buyerNation = NATIONS[order.buyerNationId];
    if (!buyerNation || buyerNation.failedState) return;

    const candidateEq = (company.equipment || [])
      .filter(eq => eq.cat === order.category)
      .sort((a, b) => Number(b.techReq || 0) - Number(a.techReq || 0))[0];
    if (!candidateEq) {
      remainingOrders.push(order);
      return;
    }

    const warPressure = typeof getWarPressure === 'function' ? getWarPressure(buyerNation.id || '') : 0;
    const inHotWar = warPressure > 0.2;
    const buyerStrategy = getNationDefenseBuyingStrategy(buyerNation);
    const batch = clamp(
      Math.ceil(order.remainingQuantity * (inHotWar ? 0.78 : 0.5) * buyerStrategy.qtyMultiplier),
      1,
      getEquipmentProcurementBatch(order.category, order.remainingQuantity * getEquipmentUnitMultiplier(order.category), inHotWar, buyerNation)
    );

    const producedQty = _produceEquipInternal(company, candidateEq.id, batch, sellerNation, false);
    if (!producedQty || producedQty <= 0) {
      remainingOrders.push(order);
      return;
    }

    const reserved = reserveEquipmentForExport(sellerNation, candidateEq.name, order.category, producedQty);
    if (!reserved || reserved.quantity <= 0) {
      remainingOrders.push(order);
      return;
    }

    addEquipmentToStockpile(buyerNation, order.category, candidateEq.name, reserved.quantity, reserved.condition || 100);

    const template = findEquipmentTemplate(candidateEq.name, order.category);
    const unitPrice = Math.max(1, Math.round(getDefenseMarketPrice(template, reserved.condition || 100) * 0.95));
    const totalPrice = unitPrice * reserved.quantity;
    processArmsPayment(sellerNation, buyerNation, totalPrice, {
      sourceCompanyId: company.id,
      quantity: reserved.quantity,
      itemName: candidateEq.name,
      category: order.category,
    });

    company.productionByCategory[order.category] = Number(company.productionByCategory[order.category] || 0) + reserved.quantity;
    const buyerKey = buyerNation.id || buyerNation.name;
    if (!company.orderLedger[buyerKey]) company.orderLedger[buyerKey] = { nationName: buyerNation.name || buyerKey, units: 0, byCategory: {} };
    company.orderLedger[buyerKey].units += reserved.quantity;
    company.orderLedger[buyerKey].byCategory[order.category] = Number(company.orderLedger[buyerKey].byCategory[order.category] || 0) + reserved.quantity;

    order.remainingQuantity = Math.max(0, Number(order.remainingQuantity || 0) - reserved.quantity);
    processed++;

    if (order.remainingQuantity <= 0) {
      order.status = 'fulfilled';
      order.fulfilledTurn = GAME?.turn || 0;
      company.completedOrders.push(order);
      if (company.completedOrders.length > 40) company.completedOrders.shift();
      addNews(`🤝 ${company.name} fulfilled ${formatEquipmentDisplayQuantity(order.category, order.requestedQuantity)} contract for ${buyerNation.name}.`, 'minor');
    } else {
      order.status = 'partial';
      remainingOrders.push(order);
    }
  });

  company.pendingOrders = remainingOrders;
}

// ─── COMPANY ECONOMIC EFFECTS ─────────────────────────

function applyDefenseEconomicEffects(nation) {
  const companies = getNationDefenseCompanies(nation);
  if (companies.length === 0) return;
  
  let totalValue = 0;
  let totalProduction = 0;
  
  companies.forEach(company => {
    const equipCount = company.equipment?.length || 0;
    const tier = company.tier || 1;
    totalValue += equipCount * tier * 2;
    totalProduction += equipCount * 0.5;
  });
  
  // Boost GDP
  const gdpBoost = totalValue * 0.001;
  nation.gdp = clamp(nation.gdp + gdpBoost, 0.02, 140);
  
  // Boost military power
  const milBoost = totalProduction * 0.05;
  nation.militaryPower = clamp(nation.militaryPower + milBoost, 1, 100);
  
  // Boost tech level slightly
  const techBoost = totalValue * 0.00005;
  nation.techLevel = clamp(nation.techLevel + techBoost, 1, 10);
  
  // Employment boost
  nation.employment = clamp(nation.employment + totalProduction * 0.02, 1, 100);
}

// ─── SELL EQUIPMENT BETWEEN NATIONS ───────────────────

// Check if a nation can sell specific equipment (only lower-tier items can be sold)
function canSellEquipment(nation, equipmentItem) {
  const companies = getNationDefenseCompanies(nation);
  if (companies.length === 0) return true; // If no companies, can sell anything
  
  // Find highest tier any company has reached
  const maxTier = Math.max(...companies.map(c => c.tier || 1));

  // Nations at tech 5 and below can freely export inventory to stabilize early/mid game arms flow.
  if ((Number(nation?.techLevel || 1) <= 5) || maxTier <= 5) return true;
  
  // Equipment can only be sold if it's from a lower tier
  const equipTier = equipmentItem.companyTier || equipmentItem.tier || 0;
  return equipTier < maxTier;
}

function sellEquipmentBetweenNations(sellerNation, buyerNation, equipmentItem, quantity) {
  if (!sellerNation.militaryStockpile || !buyerNation) return false;
  
  // Check if seller can sell this equipment (only lower-tier items)
  if (!canSellEquipment(sellerNation, equipmentItem)) return false;
  
  const cat = equipmentItem.cat || equipmentItem.category;
  if (!sellerNation.militaryStockpile[cat]) return false;
  
  // Find enough items
  let available = 0;
  sellerNation.militaryStockpile[cat].forEach(item => {
    if (item.name === equipmentItem.name) available += item.quantity || 1;
  });
  
  if (available < quantity) return false;
  
  // Calculate price
  const template = findEquipmentTemplate(equipmentItem.name, cat);
  const price = template ? getEquipmentUnitCost(template, cat) * quantity * 1.5 : quantity * 5;
  
  // Check buyer can afford
  if (buyerNation.gdp * 1000 < price) return false;
  
  // Transfer treasury (simplified)
  if (typeof GAME !== 'undefined') {
    // Use player treasury as proxy for now
    if (buyerNation.id === GAME.playerNation?.id) {
      if (GAME.treasury < price) return false;
      GAME.treasury -= price;
    }
  }
  
  // Remove from seller, add to buyer
  let remaining = quantity;
  for (let i = sellerNation.militaryStockpile[cat].length - 1; i >= 0 && remaining > 0; i--) {
    const item = sellerNation.militaryStockpile[cat][i];
    if (item.name === equipmentItem.name) {
      const take = Math.min(remaining, item.quantity || 1);
      item.quantity = (item.quantity || 1) - take;
      remaining -= take;
      if (item.quantity <= 0) {
        sellerNation.militaryStockpile[cat].splice(i, 1);
      }
    }
  }
  
  // Add to buyer
  if (!buyerNation.militaryStockpile) buyerNation.militaryStockpile = {};
  if (!buyerNation.militaryStockpile[cat]) buyerNation.militaryStockpile[cat] = [];
  buyerNation.militaryStockpile[cat].push({...equipmentItem, quantity: quantity, condition: 100});
  
  addNews(`🛒 ${buyerNation.name} purchases ${quantity}x ${equipmentItem.name} from ${sellerNation.name}`, 'minor');
  return true;
}

// ─── COMPUTE NATION MILITARY STRENGTH ─────────────────

function computeNationMilitaryStrength(nation) {
  let strength = 0;
  
  // Base from military power stat
  strength += nation.militaryPower * 10;
  
  // Add from equipment stockpile
  if (nation.militaryStockpile) {
    Object.keys(nation.militaryStockpile).forEach(cat => {
      (nation.militaryStockpile[cat] || []).forEach(item => {
        const template = findEquipmentTemplate(item.name, cat);
        const power = template ? template.power : 5;
        const qty = item.quantity || 1;
        strength += power * qty * 0.5;
      });
    });
  }
  
  // Add from defense companies
  const companies = getNationDefenseCompanies(nation);
  companies.forEach(company => {
    (company.equipment || []).forEach(eq => {
      const template = findEquipmentTemplate(eq.name, eq.cat);
      const power = template ? template.power : 5;
      strength += power * 0.2;
    });
  });
  
  // Modifiers
  strength *= clamp(nation.techLevel / 5, 0.5, 2.0);
  strength *= clamp(nation.governance / 50, 0.5, 1.5);
  
  return Math.floor(strength);
}

// ─── PROCESS ALL DEFENSE COMPANIES (main loop hook) ──

function processAllDefenseCompanies() {
  processDefenseProcurementRequests();

  Object.values(NATIONS).forEach(nation => {
    if (nation.failedState) return;
    const companies = getNationDefenseCompanies(nation);

    companies.forEach(company => {
      initDefenseCompanyOrderState(company);
      fulfillDefenseCompanyOrders(company, nation);
    });
    
    // AI management
    aiManageDefenseCompanies(nation);
    
    // Economic effects
    applyDefenseEconomicEffects(nation);
    
    // Update company tech levels to match nation
    companies.forEach(company => {
      if (nation.techLevel > company.techLevel) {
        company.techLevel += clamp((nation.techLevel - company.techLevel) * 0.1, 0, 0.5);
      }
    });
  });
}


// ============================================================
// MILITARY TAB RENDERER
// ============================================================

function renderMilitaryIndustrialTab() {
  const p = GAME.playerNation;
  if (!p) return '<div class="tab-error">No nation selected</div>';
  
  let html = '<div class="tab-content"><h3>🏭 Military-Industrial Complex</h3>';
  
  // ── STOCKPILE ─────────────────────────────────────────
  html += '<div class="section-card"><h4>📦 Military Stockpile</h4>';
  if (p.militaryStockpile && Object.keys(p.militaryStockpile).length > 0) {
    let hasItems = false;
    Object.keys(p.militaryStockpile).forEach(cat => {
      const items = p.militaryStockpile[cat] || [];
      if (items.length > 0) {
        hasItems = true;
        html += `<div class="subsection"><h5>${cat.charAt(0).toUpperCase() + cat.slice(1)}</h5>`;
        html += '<div class="equip-list">';
        items.forEach(item => {
          const qty = item.quantity || 1;
          const cond = item.condition || 100;
          html += `<div class="equip-item">
            <span class="equip-name">${item.name}</span>
            <span class="equip-qty">x${qty}</span>
            <span class="equip-cond">${cond}%</span>
          </div>`;
        });
        html += '</div></div>';
      }
    });
    if (!hasItems) html += '<p class="empty">No equipment in stockpile.</p>';
  } else {
    html += '<p class="empty">No equipment in stockpile.</p>';
  }
  html += '</div>';
  
  // ─── COMPANIES ────────────────────────────────────────
  const companies = getNationDefenseCompanies(p);
  html += `<div class="section-card"><h4>🏢 Defense Companies (${companies.length})</h4>`;
  
  if (companies.length > 0) {
    companies.forEach(company => {
      const companyTech = safeNum(company.techLevel);
      const era = getEraForTechLevel(companyTech);
      const equipCount = company.equipment?.length || 0;
      html += `<div class="company-card">
        <div class="company-header">
          <span class="company-name">${company.name}</span>
          <span class="company-tier">Tier ${company.tier}</span>
          <span class="company-era">${era.label}</span>
        </div>
        <div class="company-desc">${company.desc}</div>
        <div class="company-stats">
          <span>Tech: ${companyTech.toFixed(1)}</span>
          <span>Equipment: ${equipCount}</span>
          <span>Focus: ${company.researchFocus || 'None'}</span>
        </div>`;
      
      // Research progress bar
      if (company.researchFocus) {
        const progressPct = clamp((safeNum(company.researchProgress) / (company.equipment?.length ? 15 : 10)) * 100, 0, 99);
        html += `<div class="research-bar-container">
          <span class="research-label">Researching ${company.researchFocus}:</span>
          <div class="research-bar-bg">
            <div class="research-bar-fill" style="width:${progressPct}%"></div>
          </div>
          <span class="research-pct">${progressPct.toFixed(0)}%</span>
        </div>`;
      }
      
      // Equipment list
      if (company.equipment && company.equipment.length > 0) {
        html += '<div class="company-equipment"><h6>Developed Equipment:</h6>';
        company.equipment.forEach(eq => {
          const produced = eq.produced || 0;
          const singleQty = eq.cat === 'rifle' ? 10 : 1;
          const bulkQty = eq.cat === 'rifle' ? 50 : 5;
          const singleLabel = eq.cat === 'rifle' ? '+10K' : '+1';
          const bulkLabel = eq.cat === 'rifle' ? '+50K' : '+5';
          html += `<div class="equip-row">
            <span>${eq.name}</span>
            <span class="equip-type">${eq.cat}</span>
            <span class="equip-produced">Produced: ${formatEquipmentDisplayQuantity(eq.cat, produced)}</span>
            <button class="btn-small" onclick="produceEquipment('${company.id}', '${eq.id}', ${singleQty})">${singleLabel}</button>
            <button class="btn-small" onclick="produceEquipment('${company.id}', '${eq.id}', ${bulkQty})">${bulkLabel}</button>
          </div>`;
        });
        html += '</div>';
      }
      
      // Set research focus
      html += '<div class="research-controls">';
      html += '<span>Research: </span>';
      ['fighter','bomber','tank','ifv','destroyer','submarine','missile','rifle','artillery','drone','helicopter','transport','carrier','patrol','satellite'].forEach(cat => {
        const active = company.researchFocus === cat ? 'active' : '';
        html += `<button class="btn-sm ${active}" onclick="setCompanyResearch('${company.id}', '${cat}')">${cat}</button>`;
      });
      html += '</div>';
      
      html += '</div>';
    });
  } else {
    html += '<p class="empty">No defense companies. Found one below!</p>';
  }
  html += '</div>';
  
  // ─── FOUND COMPANY ────────────────────────────────────
  html += '<div class="section-card"><h4>🔧 Found New Defense Company</h4>';
  const available = DEFENSE_COMPANIES.filter(c => c.foundedBy === null);
  if (available.length > 0) {
    html += '<div class="available-companies">';
    available.slice(0, 10).forEach((company, idx) => {
      const realIdx = DEFENSE_COMPANIES.indexOf(company);
      const cost = clamp(50 + p.techLevel * 10, 30, 200);
      html += `<div class="avail-company">
        <span class="ac-name">${company.name}</span>
        <span class="ac-desc">${company.desc}</span>
        <button class="btn-small" onclick="foundDefenseCompany(GAME.playerNation, ${realIdx})">Found ($${cost}M)</button>
      </div>`;
    });
    if (available.length > 10) {
      html += `<p class="more">...and ${available.length - 10} more companies available</p>`;
    }
    html += '</div>';
  } else {
    html += '<p class="empty">All companies have been founded.</p>';
  }
  html += '</div>';
  
  // ─── MILITARY STRENGTH & FORCES ───────────────────────
  const strength = computeNationMilitaryStrength(p);
  initNationMilitaryForces(p);
  const forces = p.militaryForces;
  const basePower = safeNum(p.militaryPower) * 10;
  const readiness = safeNum(forces.readiness);
  const maintenance = safeNum(forces.maintenanceCost);
  
  html += '<div class="section-card"><h4>⚔ Military Power</h4>';
  html += '<div class="strength-display">' + Math.round(safeNum(strength)).toLocaleString() + '</div>';
  html += '<div class="strength-breakdown">';
  html += '<div>Base Power: ' + basePower.toFixed(0) + '</div>';
  html += '<div>Readiness: ' + readiness.toFixed(1) + '%</div>';
  html += '<div>Maintenance: $' + maintenance.toFixed(1) + 'M</div>';
  html += '</div></div>';
  
  // Forces overview
  html += renderNationMilitaryForces(p);
  
  // ── DEFENSE REVENUE & TRADE ──────────────────────────
  html += renderDefenseRevenueSection(p);
  
  // ── ARMS PURCHASE UI ─────────────────────────────────
  html += renderArmsPurchaseUI();
  
  // Tech upgrade / sell old equipment button
  html += '<div class="section-card"><h4>🔄 Tech Upgrades & Sales</h4>';
  html += '<p class="text-muted" style="font-size:11px;margin-bottom:8px">When you discover new technologies, you can sell outdated equipment to allies or neutral nations for profit.</p>';
  html += '<button class="btn-sm" onclick="processTechUpgradeSalesWithPayment(GAME.playerNation); if(typeof renderGame===\'function\') renderGame();">🔄 Sell Surplus Equipment</button>';
  html += '</div>';
  
  html += '</div>';
  return html;
}

// ─── GLOBAL FUNCTIONS (for onclick) ─────────────────────

// Set a company's research focus
window.setCompanyResearch = function(companyId, category) {
  const company = getCompanyById(companyId);
  if (!company) return;
  company.researchFocus = category;
  company.researchProgress = 0;
  if (typeof renderGame === 'function') renderGame();
};

// Produce equipment from a company (UI onclick handler)
window.produceEquipment = function(companyId, equipmentId, quantity) {
  const company = getCompanyById(companyId);
  if (!company) return;
  const nation = Object.values(NATIONS).find(n => n.id === company.foundedBy || n.name === company.foundedBy);
  if (!nation) return;
  
  const isPlayerNation = nation.id === GAME.playerNation?.id;
  const success = _produceEquipInternal(company, equipmentId, quantity, nation, isPlayerNation);
  if (success && isPlayerNation && typeof renderGame === 'function') renderGame();
};

// ─── FOREIGN NATION INTEL OVERLAY ──────────────────────
// Opens a detailed view of another nation's military + industry + stats

function openForeignNationIntel(nationId) {
  const nation = NATIONS[nationId];
  if (!nation) return;

  GAME.selectedNation = nationId;
  
  const companies = getNationDefenseCompanies(nation);
  const strength = computeNationMilitaryStrength(nation);
  const stockpile = nation.militaryStockpile || {};
  const totalItems = Object.values(stockpile).reduce((sum, arr) => sum + arr.reduce((s, i) => s + (i.quantity || 1), 0), 0);
  const totalEquipTypes = Object.values(stockpile).reduce((sum, arr) => sum + arr.length, 0);
  
  let html = '<div class="tab-content">';
  const militaryPower = safeNum(nation.militaryPower);
  const techLevel = safeNum(nation.techLevel);
  const gdpVal = safeNum(nation.gdp);
  const populationVal = safeNum(nation.population);
  const stabilityVal = safeNum(nation.stability);
  html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">';
  html += '<span style="font-size:36px">' + nation.flag + '</span>';
  html += '<div>';
  html += '<h3 style="font-size:20px;font-weight:700">' + nation.name + '</h3>';
  html += '<p style="color:var(--text-secondary);font-size:13px">' + nation.leader + ' • ' + getGovernmentLabel(nation.governmentStyle) + ' • ' + getDoctrineLabel(nation.policyDoctrine) + '</p>';
  html += '</div></div>';

  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">';
  html += '<div class="resource-item"><span class="r-name">Military Power</span><span class="r-val" style="color:var(--accent-red)">' + militaryPower.toFixed(1) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Total Strength</span><span class="r-val" style="color:var(--accent-green)">' + Math.round(safeNum(strength)).toLocaleString() + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Tech Level</span><span class="r-val" style="color:var(--accent-blue)">T' + techLevel.toFixed(1) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Defense Companies</span><span class="r-val">' + companies.length + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Equipment Types</span><span class="r-val">' + totalEquipTypes + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Total Units</span><span class="r-val">' + totalItems + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">GDP</span><span class="r-val">$' + gdpVal.toFixed(1) + 'T</span></div>';
  html += '<div class="resource-item"><span class="r-name">Population</span><span class="r-val">' + Math.round(populationVal) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Stability</span><span class="r-val" style="color:' + (stabilityVal >= 55 ? 'var(--accent-green)' : 'var(--accent-red)') + '">' + stabilityVal.toFixed(1) + '</span></div>';
  html += '</div>';

  // Defense companies section
  if (companies.length > 0) {
    html += '<div class="section-card"><h4>🏭 Defense Contractors (' + companies.length + ')</h4>';
    companies.forEach(function(company) {
      const era = getEraForTechLevel(company.techLevel);
      html += '<div class="company-card" style="margin-bottom:6px">';
      html += '<div class="company-header">';
      html += '<span class="company-name">' + company.name + '</span>';
      html += '<span class="company-tier">Tier ' + company.tier + '</span>';
      html += '<span class="company-era">' + era.label + '</span>';
      html += '</div>';
      html += '<div class="company-desc">' + company.desc + '</div>';
      html += '<div class="company-stats">';
      html += '<span>Tech: ' + safeNum(company.techLevel).toFixed(1) + '</span>';
      html += '<span>Focus: ' + (company.researchFocus || 'Idle') + '</span>';
      html += '<span>Equipment: ' + (company.equipment ? company.equipment.length : 0) + ' designs</span>';
      html += '</div>';
      if (company.equipment && company.equipment.length > 0) {
        html += '<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:4px">';
        company.equipment.forEach(function(eq) {
          const produced = eq.produced || 0;
          html += '<span style="background:rgba(46,167,255,0.12);border:1px solid var(--border-color);border-radius:4px;padding:1px 6px;font-size:10px;color:var(--text-secondary)">' + eq.name + ' (' + formatEquipmentDisplayQuantity(eq.cat, produced) + ')</span>';
        });
        html += '</div>';
      }
      html += '</div>';
    });
    html += '</div>';
  } else {
    html += '<div class="section-card"><h4>🏭 Defense Contractors</h4><p class="empty">No defense companies founded in this nation.</p></div>';
  }

  // Stockpile section
  if (totalItems > 0) {
    html += '<div class="section-card"><h4>📦 Military Stockpile (' + totalItems + ' units)</h4>';
    Object.keys(stockpile).forEach(function(cat) {
      const items = stockpile[cat] || [];
      if (items.length > 0) {
        html += '<div class="subsection"><h5>' + cat.charAt(0).toUpperCase() + cat.slice(1) + '</h5><div class="equip-list">';
        items.forEach(function(item) {
          html += '<div class="equip-item"><span class="equip-name">' + item.name + '</span><span class="equip-qty">x' + (item.quantity || 1) + '</span><span class="equip-cond">' + (item.condition || 100) + '%</span></div>';
        });
        html += '</div></div>';
      }
    });
    html += '</div>';
  } else {
    html += '<div class="section-card"><h4>📦 Military Stockpile</h4><p class="empty">No equipment stockpiled.</p></div>';
  }

  // Military forces section
  html += renderNationMilitaryForces(nation);
  
  // Defense trade section
  html += renderDefenseRevenueSection(nation);
  html += renderArmsPurchaseUIForNation(nation);

  // Strategic assessment
  html += '<div class="section-card"><h4>📊 Strategic Assessment</h4>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px">';
  const educationVal = safeNum(nation.education);
  const governanceVal = safeNum(nation.governance);
  const corruptionVal = safeNum(nation.corruption);
  const infrastructureVal = safeNum(nation.infrastructure);
  const happinessVal = safeNum(nation.happiness);
  const resilienceVal = safeNum(nation.resilience);
  const healthVal = safeNum(nation.health);
  const innovationRiskVal = safeNum(nation.innovationRisk);
  const environmentVal = safeNum(nation.environment);
  const inflationVal = safeNum(nation.inflation);
  const debtRatioVal = safeNum(nation.debtRatio);
  const religionVal = safeNum(nation.religionInfluence);
  const jobsVal = safeNum(nation.jobs);
  const stockVal = safeNum(nation.stockMarket);
  html += '<div>Education: <strong>' + educationVal.toFixed(1) + '</strong></div>';
  html += '<div>Governance: <strong>' + governanceVal.toFixed(1) + '</strong></div>';
  html += '<div>Corruption: <strong style="color:' + (corruptionVal <= 38 ? 'var(--accent-green)' : 'var(--accent-red)') + '">' + corruptionVal.toFixed(1) + '</strong></div>';
  html += '<div>Infrastructure: <strong>' + infrastructureVal.toFixed(1) + '</strong></div>';
  html += '<div>Happiness: <strong>' + happinessVal.toFixed(1) + '</strong></div>';
  html += '<div>Resilience: <strong>' + resilienceVal.toFixed(1) + '</strong></div>';
  html += '<div>Health: <strong>' + healthVal.toFixed(1) + '</strong></div>';
  html += '<div>Innovation Risk: <strong>' + innovationRiskVal.toFixed(1) + '</strong></div>';
  html += '<div>Environment: <strong>' + environmentVal.toFixed(1) + '</strong></div>';
  html += '<div>Inflation: <strong>' + inflationVal.toFixed(1) + '%</strong></div>';
  html += '<div>Debt/GDP: <strong>' + debtRatioVal.toFixed(1) + '%</strong></div>';
  html += '<div>Religion: <strong>' + religionVal.toFixed(1) + '</strong></div>';
  html += '<div>Jobs: <strong style="color:' + (jobsVal >= 55 ? 'var(--accent-green)' : 'var(--accent-red)') + '">' + jobsVal.toFixed(1) + '</strong></div>';
  html += '<div>Stock Index: <strong>' + stockVal.toFixed(1) + '</strong></div>';
  html += '</div></div>';

  html += '</div>';

  // Show in overlay
  const overlay = document.getElementById('tabOverlay');
  const title = document.getElementById('tabTitle');
  const content = document.getElementById('tabContent');
  if (overlay && title && content) {
    title.textContent = '🔍 Intel Report: ' + nation.name;
    content.innerHTML = html;
    overlay.classList.remove('hidden');
  }
}

// Also expose for onclick
window.openForeignNationIntel = openForeignNationIntel;


// ============================================================
// NATION MILITARY FORCES — Production, Maintenance, Tech
// ============================================================

// Initialize a nation's military forces tracking
function initNationMilitaryForces(nation) {
  if (!nation.militaryForces) {
    nation.militaryForces = {
      activePersonnel: 0,       // in millions
      reservePersonnel: 0,      // in millions
      // Combat equipment counts
      fighters: { total: 0, active: 0, reserve: 0, mothballed: 0 },
      bombers: { total: 0, active: 0, reserve: 0, mothballed: 0 },
      helicopters: { total: 0, active: 0, reserve: 0, mothballed: 0 },
      transport: { total: 0, active: 0, reserve: 0, mothballed: 0 },
      tanks: { total: 0, active: 0, reserve: 0, mothballed: 0 },
      ifvs: { total: 0, active: 0, reserve: 0, mothballed: 0 },
      artillery: { total: 0, active: 0, reserve: 0, mothballed: 0 },
      destroyers: { total: 0, active: 0, reserve: 0, mothballed: 0 },
      submarines: { total: 0, active: 0, reserve: 0, mothballed: 0 },
      carriers: { total: 0, active: 0, reserve: 0, mothballed: 0 },
      patrol: { total: 0, active: 0, reserve: 0, mothballed: 0 },
      missileSystems: { total: 0, active: 0, reserve: 0, mothballed: 0 },
      drones: { total: 0, active: 0, reserve: 0, mothballed: 0 },
      satellites: { total: 0, active: 0, reserve: 0, mothballed: 0 },
      rifles: { total: 0, active: 0, reserve: 0, mothballed: 0 },
      // Derived stats
      readiness: 100,          // 0-100
      maintenanceCost: 0,      // Monthly $M
      totalPower: 0,
      trainingQuality: 50,
      manpowerPressure: 0,
      equipmentAge: 0,
    };
  }
  // Ensure all sub-objects have all fields
  const equipTypes = ['fighters','bombers','helicopters','transport','tanks','ifvs','artillery',
                      'destroyers','submarines','carriers','patrol','missileSystems','drones','satellites','rifles'];
  equipTypes.forEach(t => {
    if (!nation.militaryForces[t]) {
      nation.militaryForces[t] = { total: 0, active: 0, reserve: 0, mothballed: 0 };
    }
    if (nation.militaryForces[t].total === undefined) nation.militaryForces[t].total = 0;
    if (nation.militaryForces[t].active === undefined) nation.militaryForces[t].active = 0;
    if (nation.militaryForces[t].reserve === undefined) nation.militaryForces[t].reserve = 0;
    if (nation.militaryForces[t].mothballed === undefined) nation.militaryForces[t].mothballed = 0;
  });
}

function getNationMilitaryBudgetProfile(nation) {
  const isPlayerNation = !!(nation && typeof GAME !== 'undefined' && nation.id === GAME.playerNation?.id);
  const budget = isPlayerNation && GAME?.budget
    ? GAME.budget
    : (nation.aiBudget || doctrineBaseBudget('balanced'));
  const milPct = clamp((Number(budget.military) || 0) / 100, 0.02, 0.70);
  return { budget, milPct, isPlayerNation };
}

function getPersonnelCountFromMillions(value) {
  return Math.max(0, Math.round((Number(value) || 0) * 1000000));
}

function getEquipmentUnitMultiplier(category) {
  return category === 'rifle' ? 1000 : 1;
}

function getDisplayQuantity(category, quantity) {
  return Math.max(0, Number(quantity) || 0) * getEquipmentUnitMultiplier(category);
}

function formatMilitaryQuantity(value) {
  const qty = Math.max(0, Number(value) || 0);
  if (typeof formatHumanNumber === 'function') return formatHumanNumber(qty, qty >= 1000 ? 1 : 0);
  return Math.round(qty).toLocaleString();
}

function formatEquipmentDisplayQuantity(category, quantity) {
  return formatMilitaryQuantity(getDisplayQuantity(category, quantity));
}

function getEquipmentUnitCost(template, category) {
  if (!template) return 5;
  const baseCost = Number(template.cost) || 5;
  const procurementDiscount = category === 'rifle' ? 0.22 : 0.16;
  return Math.max(1, baseCost * procurementDiscount);
}

function getEquipmentForceField(category) {
  const catMap = {
    fighter: 'fighters',
    bomber: 'bombers',
    helicopter: 'helicopters',
    transport: 'transport',
    tank: 'tanks',
    ifv: 'ifvs',
    artillery: 'artillery',
    destroyer: 'destroyers',
    submarine: 'submarines',
    carrier: 'carriers',
    patrol: 'patrol',
    missile: 'missileSystems',
    drone: 'drones',
    satellite: 'satellites',
    rifle: 'rifles'
  };
  return catMap[category] || null;
}

function getCategoryInventoryTotal(nation, category) {
  initNationMilitaryForces(nation);

  const stockTotal = (nation.militaryStockpile?.[category] || []).reduce((sum, item) => sum + getDisplayQuantity(category, item.quantity || 0), 0);
  const forceField = getEquipmentForceField(category);
  if (!forceField || !nation.militaryForces[forceField]) return stockTotal;

  return stockTotal + getDisplayQuantity(category, nation.militaryForces[forceField].total || 0);
}

function getNationEquipmentDemand(nation) {
  initNationMilitaryForces(nation);
  const forces = nation.militaryForces;
  const { milPct } = getNationMilitaryBudgetProfile(nation);
  const activeTroops = getPersonnelCountFromMillions(forces.activePersonnel);
  const reserveTroops = getPersonnelCountFromMillions(forces.reservePersonnel);
  const troopBase = activeTroops + reserveTroops * 0.35;
  const techFactor = clamp((Number(nation.techLevel) || 5) / 5, 0.6, 2.2);
  const spendFactor = clamp(milPct / 0.12, 0.5, 3.0);
  const wealthFactor = clamp(Math.sqrt(Math.max(Number(nation.gdp) || 0.2, 0.2)), 0.5, 4.5);
  const navalFactor = clamp((Number(nation.gdp) || 0.2) * 0.6 * techFactor * spendFactor, 0.2, 12);

  return {
    rifle: Math.max(8000, Math.round((activeTroops + reserveTroops * 0.2) * 1.2)),
    tank: Math.max(20, Math.round((troopBase / 850) * spendFactor * wealthFactor)),
    ifv: Math.max(40, Math.round((troopBase / 260) * spendFactor * wealthFactor)),
    artillery: Math.max(24, Math.round((troopBase / 650) * spendFactor * wealthFactor)),
    fighter: Math.max(12, Math.round((troopBase / 38000) * techFactor * spendFactor * wealthFactor)),
    bomber: Math.max(4, Math.round((troopBase / 140000) * techFactor * spendFactor * wealthFactor)),
    helicopter: Math.max(12, Math.round((troopBase / 22000) * techFactor * spendFactor * wealthFactor)),
    transport: Math.max(8, Math.round((troopBase / 65000) * techFactor * wealthFactor)),
    missile: Math.max(30, Math.round((troopBase / 320) * techFactor * spendFactor * wealthFactor)),
    drone: Math.max(30, Math.round((troopBase / 900) * techFactor * spendFactor * wealthFactor)),
    destroyer: Math.max(0, Math.round(navalFactor * 2.5)),
    submarine: Math.max(0, Math.round(navalFactor * 1.4)),
    carrier: Math.max(0, Math.round(Math.max((Number(nation.gdp) || 0) - 4, 0) * 0.7 * techFactor)),
    patrol: Math.max(6, Math.round(navalFactor * 5)),
    satellite: Math.max(0, Math.round(Math.max((Number(nation.techLevel) || 0) - 5, 0) * 6 * spendFactor)),
  };
}

function getEquipmentProcurementBatch(category, shortage, inHotWar, nation) {
  const { milPct } = getNationMilitaryBudgetProfile(nation);
  const gap = Math.max(0, Math.floor(shortage || 0));
  if (gap <= 0) return 0;

  const pressure = clamp((inHotWar ? 0.34 : 0.18) + milPct * 0.32, 0.18, 0.9);
  const qty = Math.round(gap * pressure);

  switch (category) {
    case 'rifle': return clamp(Math.round(qty / 1000), 2, inHotWar ? 140 : 70);
    case 'missile': return clamp(qty, 180, inHotWar ? 12000 : 5000);
    case 'drone': return clamp(qty, 140, inHotWar ? 9500 : 4500);
    case 'artillery': return clamp(qty, 45, inHotWar ? 2800 : 1200);
    case 'ifv': return clamp(qty, 35, inHotWar ? 2200 : 900);
    case 'tank': return clamp(qty, 20, inHotWar ? 1600 : 650);
    case 'fighter':
    case 'bomber':
    case 'helicopter':
    case 'transport': return clamp(qty, 4, inHotWar ? 240 : 110);
    case 'destroyer':
    case 'submarine':
    case 'carrier': return clamp(qty, 1, inHotWar ? 16 : 8);
    case 'patrol': return clamp(qty, 6, inHotWar ? 90 : 40);
    case 'satellite': return clamp(qty, 1, 20);
    default: return clamp(qty, 2, inHotWar ? 120 : 45);
  }
}

// ─── COMPUTE MANPOWER & MILITARY PRODUCTION ──────────

function computeNationMilitaryProduction(nation) {
  initNationMilitaryForces(nation);
  if (typeof initNationDemographics === 'function') initNationDemographics(nation);
  
  const pop = nation.population; // in millions
  const tech = nation.techLevel;
  const gov = getGovernmentProfile(nation.governmentStyle);
  const { milPct } = getNationMilitaryBudgetProfile(nation);
  const demographics = nation.demographics || {};
  
  // --- MANPOWER ---
  const workingAgePool = pop * clamp((Number(demographics.workingAgePct) || 60) / 100, 0.35, 0.8);
  const recruitablePool = clamp(
    Number(demographics.recruitablePoolM) || workingAgePool * 0.12,
    0.03,
    Math.max(0.03, workingAgePool * 0.45)
  );
  const supportPool = clamp(
    Number(demographics.supportPersonnelPoolM) || workingAgePool * 0.06,
    0.02,
    Math.max(0.02, workingAgePool * 0.2)
  );
  const warPressure = getWarPressure(nation.id || '');
  const mobilizationRate = clamp(gov.stabilityBoost || 1.0, 0.6, 1.45);
  const maxMilitaryPop = clamp(recruitablePool * mobilizationRate, 0.05, Math.max(0.05, recruitablePool));
  const activeRatio = clamp(0.08 + milPct * 0.22 + warPressure * 0.16 + (nation.inCrisis ? 0.03 : 0), 0.05, 0.42);
  const targetActive = clamp(maxMilitaryPop * activeRatio, 0.03, maxMilitaryPop);
  const reserveBase = Math.max(0, recruitablePool - targetActive);
  const reserveRatio = clamp(gov.stabilityBoost > 1.2 ? 0.92 : 0.72, 0.5, 1.0);
  const targetReserve = clamp(reserveBase * reserveRatio + supportPool * 0.25, 0.03, recruitablePool * 1.35);
  const skilledLabor = nation.eduState ? Number(nation.eduState.skilledLaborPct || 0) : Number(nation.education || 50);
  const highSkill = nation.eduState ? Number(nation.eduState.highSkillPct || 0) : Math.max(0, Number(nation.education || 50) * 0.18);
  const trainingQuality = clamp(
    32 + skilledLabor * 0.30 + highSkill * 0.40 + (nation.health || 50) * 0.14 + (nation.governance || 50) * 0.12 + milPct * 22 - warPressure * 4,
    20,
    100
  );
  
  // Smoothly move toward targets
  nation.militaryForces.activePersonnel += (targetActive - nation.militaryForces.activePersonnel) * 0.05;
  nation.militaryForces.reservePersonnel += (targetReserve - nation.militaryForces.reservePersonnel) * 0.03;
  
  // Clamp
  nation.militaryForces.activePersonnel = clamp(nation.militaryForces.activePersonnel, 0.01, maxMilitaryPop);
  nation.militaryForces.reservePersonnel = clamp(nation.militaryForces.reservePersonnel, 0, recruitablePool * 1.35);
  nation.militaryForces.trainingQuality = trainingQuality;
  nation.militaryForces.manpowerPressure = clamp(
    ((nation.militaryForces.activePersonnel + nation.militaryForces.reservePersonnel) / Math.max(recruitablePool, 0.01)) * 100,
    0,
    100
  );
  
  return {
    maxMilitaryPop,
    recruitablePool,
    supportPool,
    activeRatio,
    targetActive,
    targetReserve,
    trainingQuality,
    warPressure
  };
}

// ─── PRODUCE EQUIPMENT FROM STOCKPILE TO FORCES ──────

function deployEquipmentToForces(nation) {
  initNationMilitaryForces(nation);
  const forces = nation.militaryForces;
  const stockpile = nation.militaryStockpile || {};
  
  const deployRateByCategory = {
    rifle: 0.65,
    missile: 0.55,
    drone: 0.55,
    ifv: 0.45,
    artillery: 0.45,
    tank: 0.40,
    fighter: 0.35,
    bomber: 0.35,
    helicopter: 0.35,
    transport: 0.30,
    destroyer: 0.22,
    submarine: 0.22,
    carrier: 0.18,
    patrol: 0.32,
    satellite: 0.20,
  };
  
  Object.keys(stockpile).forEach(cat => {
    const targetField = getEquipmentForceField(cat);
    if (!targetField || !forces[targetField]) return;
    
    const items = stockpile[cat] || [];
    items.forEach(item => {
      const qty = item.quantity || 0;
      if (qty <= 0) return;
      
      const deployRate = deployRateByCategory[cat] || 0.30;
      const toDeploy = Math.floor(qty * deployRate);
      if (toDeploy > 0) {
        forces[targetField].total += toDeploy;
        forces[targetField].active += toDeploy;
        item.quantity = (item.quantity || 1) - toDeploy;
        if (item.quantity <= 0) item.quantity = 0;
      }
    });
    
    // Clean up zero-quantity items
    stockpile[cat] = items.filter(i => (i.quantity || 0) > 0);
  });
}

// ─── CONSCRIPTION (DURING WARS) ──────────────────────

function applyConscription(nation) {
  initNationMilitaryForces(nation);
  const forces = nation.militaryForces;
  const warPressure = getWarPressure(nation.id || '');
  
  if (warPressure > 0.1) {
    // Conscription: pull from reserve to active
    const conscriptRate = clamp(warPressure * 0.15, 0, 0.3);
    const toConscript = forces.reservePersonnel * conscriptRate;
    forces.activePersonnel += toConscript;
    forces.reservePersonnel -= toConscript;
  }
}

// ─── COMPUTE MAINTENANCE COSTS ───────────────────────

function computeMaintenanceCosts(nation) {
  initNationMilitaryForces(nation);
  const forces = nation.militaryForces;
  let totalCost = 0;
  
  // Personnel salary pressure is intentionally minimized so budgets prioritize equipment and procurement.
  totalCost += forces.reservePersonnel * 42;
  
  // Equipment maintenance costs per unit per month
  const maintRates = {
    fighters: 0.18, bombers: 0.25, helicopters: 0.12, transport: 0.08,
    tanks: 0.09, ifvs: 0.06, artillery: 0.05,
    destroyers: 0.35, submarines: 0.40, carriers: 0.80, patrol: 0.12,
    missileSystems: 0.15, drones: 0.04, satellites: 0.10, rifles: 0.002
  };
  
  Object.keys(maintRates).forEach(type => {
    if (forces[type]) {
      totalCost += forces[type].active * maintRates[type] * 0.8; // 80% of active cost
      totalCost += forces[type].reserve * maintRates[type] * 0.15; // 15% for reserve
      totalCost += forces[type].mothballed * maintRates[type] * 0.02; // 2% for mothballed
    }
  });
  
  // Tech level multiplier: higher tech = more expensive
  totalCost *= clamp(1 + (nation.techLevel - 5) * 0.1, 0.6, 1.8);
  
  forces.maintenanceCost = totalCost;
  return totalCost;
}

// ─── APPLY MAINTENANCE & READINESS ───────────────────

function applyMaintenanceAndReadiness(nation, isPlayer) {
  initNationMilitaryForces(nation);
  const forces = nation.militaryForces;
  const cost = computeMaintenanceCosts(nation);
  
  // Estimate nation's military budget in $M
  const gdpMonthly = (nation.gdp * 1000) / 12; // GDP in $B/month * 1000 = $M
  const { milPct } = getNationMilitaryBudgetProfile(nation);
  const availableBudget = gdpMonthly * milPct * 0.38;
  
  // Check if they can afford maintenance
  const fundingRatio = clamp(availableBudget / Math.max(cost, 0.01), 0, 2.5);
  forces.lastFundingRatio = fundingRatio;
  
  // Update readiness
  if (fundingRatio >= 1.0) {
    // Well-funded: readiness improves
    forces.readiness = clamp(forces.readiness + 0.5, 0, 100);
  } else if (fundingRatio < 0.8) {
    // Under-funded: readiness drops
    const dropRate = (1.0 - fundingRatio) * 2;
    forces.readiness = clamp(forces.readiness - dropRate, 1, 100);
    
    // Mothball equipment if critically underfunded
    if (fundingRatio < 0.4) {
      const mothballPct = clamp((0.4 - fundingRatio) * 0.1, 0, 0.05);
      ['fighters','bombers','tanks','destroyers','submarines','carriers'].forEach(type => {
        if (forces[type]) {
          const toMothball = Math.floor(forces[type].active * mothballPct);
          forces[type].active -= toMothball;
          forces[type].mothballed += toMothball;
        }
      });
    }
  } else {
    // Marginal: slight decay
    forces.readiness = clamp(forces.readiness - 0.1, 1, 100);
  }
  
  // War pressure increases readiness (combat experience) but damages equipment
  const warPressure = getWarPressure(nation.id || '');
  if (warPressure > 0.05) {
    forces.readiness = clamp(forces.readiness + warPressure * 0.5, 1, 100);
    // Equipment attrition
    const attritionRate = warPressure * 0.02;
    ['fighters','tanks','ifvs','destroyers'].forEach(type => {
      if (forces[type]) {
        const lost = Math.floor(forces[type].active * attritionRate);
        forces[type].active -= lost;
        forces[type].total -= lost;
        if (forces[type].active < 0) forces[type].active = 0;
        if (forces[type].total < 0) forces[type].total = 0;
      }
    });
  }
  
  // Ability to reactivate mothballed equipment (if budget improves)
  if (fundingRatio > 1.2 && forces.readiness > 60) {
    ['fighters','bombers','tanks','destroyers','submarines','carriers'].forEach(type => {
      if (forces[type]) {
        const toReactivate = Math.floor(forces[type].mothballed * 0.02);
        forces[type].active += toReactivate;
        forces[type].mothballed -= toReactivate;
      }
    });
  }
  
  return { cost, availableBudget, fundingRatio };
}

// ─── COMPUTE TOTAL MILITARY POWER (UPDATED) ──────────

function computeNationMilitaryPower(nation) {
  initNationMilitaryForces(nation);
  const forces = nation.militaryForces;
  
  // Base power from personnel
  let power = forces.activePersonnel * 0.3 + forces.reservePersonnel * 0.05;
  
  // Equipment power
  const equipPower = {
    fighters: 2.0, bombers: 3.5, helicopters: 1.2, transport: 0.5,
    tanks: 2.5, ifvs: 1.0, artillery: 1.8,
    destroyers: 5.0, submarines: 6.0, carriers: 12.0, patrol: 1.5,
    missileSystems: 4.0, drones: 0.8, satellites: 0.3, rifles: 0.01
  };
  
  Object.keys(equipPower).forEach(type => {
    if (forces[type]) {
      power += forces[type].active * equipPower[type];
      power += forces[type].reserve * equipPower[type] * 0.3;
    }
  });
  
  // Modifiers
  power *= clamp(nation.techLevel / 5, 0.5, 2.0);
  power *= clamp(forces.readiness / 50, 0.5, 1.5);
  power *= clamp((forces.trainingQuality || 50) / 50, 0.65, 1.65);
  power *= clamp(nation.governance / 50, 0.5, 1.5);
  power *= clamp(1 - Math.max(0, (forces.manpowerPressure || 0) - 85) * 0.004, 0.75, 1.0);
  
  // Normalize to 0-100 scale (logarithmic)
  const normalizedPower = clamp(Math.log10(power + 1) * 20, 1, 100);
  
  nation.militaryPower = normalizedPower;
  forces.totalPower = power;
  
  return normalizedPower;
}

// ─── PROCESS: MAIN CALLBACK EVERY TURN ──────────────

function processAllNationMilitaryForces() {
  Object.values(NATIONS).forEach(nation => {
    if (nation.failedState) return;
    
    initNationMilitaryForces(nation);
    
    // 1. Compute manpower
    computeNationMilitaryProduction(nation);
    
    // 2. Conscription if at war
    applyConscription(nation);
    
    // 3. Deploy stockpile equipment to active forces
    deployEquipmentToForces(nation);
    
    // 4. Apply maintenance and readiness
    const isPlayer = nation.id === GAME.playerNation?.id;
    applyMaintenanceAndReadiness(nation, isPlayer);
    
    // 5. Update military power
    computeNationMilitaryPower(nation);
  });
}

// ─── TECH UPGRADE / SELL OLD EQUIPMENT ──────────────

// When a nation discovers new tech that unlocks better equipment,
// they can sell their old (lower-tier) equipment to allies or neutral nations

function processTechUpgradeSales(nation) {
  initNationMilitaryForces(nation);
  const forces = nation.militaryForces;
  const stockpile = nation.militaryStockpile || {};
  
  // Check if nation has discovered new tech recently
  if (!nation.research) return;
  const recentDiscoveries = (nation.research.discoveredTechs || []).filter(id => {
    const tech = findTechById(id);
    return tech && tech.tier > 3;
  });
  
  if (recentDiscoveries.length === 0) return;
  
  // Find old equipment in stockpile (only lower-tier items)
  let oldEquipmentForSale = [];
  Object.keys(stockpile).forEach(cat => {
    (stockpile[cat] || []).forEach(item => {
      // Only sell equipment from lower tiers (not current max tier)
      if (canSellEquipment(nation, item)) {
        const template = findEquipmentTemplate(item.name, cat);
        if (template) {
          oldEquipmentForSale.push({ item, cat });
        }
      }
    });
  });
  
  if (oldEquipmentForSale.length === 0) return;
  
  // Find potential buyers (allies or neutral, less technologically advanced)
  const allies = GAME.alliances.filter(a => a.a === nation.id || a.b === nation.id);
  const allyNations = [];
  allies.forEach(a => {
    const otherId = a.a === nation.id ? a.b : a.a;
    if (NATIONS[otherId] && !NATIONS[otherId].failedState) {
      allyNations.push(NATIONS[otherId]);
    }
  });
  
  // Also consider neutral nations with positive relations
  const neutrals = Object.values(NATIONS).filter(n =>
    !n.failedState && n.id !== nation.id &&
    !allyNations.find(a => a.id === n.id) &&
    (typeof getRelationBetween === 'function' ? getRelationBetween(nation.id, n.id) : getRelation(n.id)) > 10
  );
  
  const potentialBuyers = [...allyNations, ...neutrals].filter(n => 
    n.techLevel < nation.techLevel - 0.5
  );
  
  if (potentialBuyers.length === 0) return;
  
  // Sell some old equipment
  const saleChance = 0.15;
  oldEquipmentForSale.forEach(sale => {
    if (Math.random() > saleChance) return;
    
    const buyer = potentialBuyers[Math.floor(Math.random() * potentialBuyers.length)];
    const qty = Math.min(sale.item.quantity || 1, 1 + Math.floor(Math.random() * 3));
    
    // Price: heavily discounted (20-40% of original)
    const template = findEquipmentTemplate(sale.item.name, sale.cat);
    const price = template ? Math.floor(getEquipmentUnitCost(template, sale.cat) * qty * (0.2 + Math.random() * 0.2)) : qty;
    
    // Remove from seller
    sale.item.quantity = (sale.item.quantity || 1) - qty;
    if (sale.item.quantity <= 0) sale.item.quantity = 0;
    
    // Add to buyer
    if (!buyer.militaryStockpile) buyer.militaryStockpile = {};
    if (!buyer.militaryStockpile[sale.cat]) buyer.militaryStockpile[sale.cat] = [];
    buyer.militaryStockpile[sale.cat].push({
      ...sale.item,
      quantity: qty,
      condition: 50 + Math.floor(Math.random() * 30), // Used equipment
    });
    
    addNews(`🔄 ${nation.name} sells ${formatEquipmentDisplayQuantity(sale.cat, qty)} ${sale.item.name} to ${buyer.name} ($${price}M)`, 'minor');
  });
  
  // Clean up zero-quantity items
  Object.keys(stockpile).forEach(cat => {
    stockpile[cat] = stockpile[cat].filter(i => (i.quantity || 0) > 0);
  });
}

// ─── RENDER NATION FORCES (for tabs/overlays) ────────

function renderNationMilitaryForces(nation) {
  initNationMilitaryForces(nation);
  const forces = nation.militaryForces;
  const activeDuty = safeNum(forces.activePersonnel);
  const reserves = safeNum(forces.reservePersonnel);
  const readiness = safeNum(forces.readiness);
  const maintenance = safeNum(forces.maintenanceCost);
  
  let html = '<div class="section-card"><h4>👥 Personnel</h4>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
  html += '<div class="resource-item"><span class="r-name">Active Duty</span><span class="r-val">' + formatMilitaryQuantity(activeDuty * 1000000) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Reserves</span><span class="r-val">' + formatMilitaryQuantity(reserves * 1000000) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Readiness</span><span class="r-val" style="color:' + (readiness >= 70 ? 'var(--accent-green)' : readiness >= 40 ? 'var(--accent-yellow)' : 'var(--accent-red)') + '">' + readiness.toFixed(1) + '%</span></div>';
  html += '<div class="resource-item"><span class="r-name">Maintenance</span><span class="r-val" style="color:var(--accent-red)">$' + maintenance.toFixed(1) + 'M</span></div>';
  html += '</div></div>';
  
  // Equipment by category
  const equipLabels = {
    fighters: 'Fighter Aircraft', bombers: 'Bombers', helicopters: 'Helicopters', transport: 'Transport',
    tanks: 'Main Battle Tanks', ifvs: 'IFVs/APCs', artillery: 'Artillery',
    destroyers: 'Warships', submarines: 'Submarines', carriers: 'Aircraft Carriers', patrol: 'Patrol Vessels',
    missileSystems: 'Missile Systems', drones: 'Drones/UAVs', satellites: 'Satellites', rifles: 'Small Arms'
  };
  
  html += '<div class="section-card"><h4>⚙️ Equipment Inventory</h4>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px">';
  
  Object.keys(equipLabels).forEach(type => {
    if (forces[type]) {
      const f = forces[type];
      const displayCategoryMap = {
        fighters: 'fighter',
        bombers: 'bomber',
        helicopters: 'helicopter',
        transport: 'transport',
        tanks: 'tank',
        ifvs: 'ifv',
        artillery: 'artillery',
        destroyers: 'destroyer',
        submarines: 'submarine',
        carriers: 'carrier',
        patrol: 'patrol',
        missileSystems: 'missile',
        drones: 'drone',
        satellites: 'satellite',
        rifles: 'rifle'
      };
      const displayCategory = displayCategoryMap[type] || type;
      html += '<div style="padding:4px 6px;background:rgba(9,28,54,0.4);border-radius:4px;border:1px solid var(--border-color)">';
      html += '<div style="font-weight:600;font-size:11px;color:var(--text-secondary)">' + equipLabels[type] + '</div>';
      html += '<div style="display:flex;gap:6px;font-size:10px;margin-top:2px">';
      html += '<span style="color:var(--accent-blue)">Active: ' + formatEquipmentDisplayQuantity(displayCategory, f.active) + '</span>';
      if (f.reserve > 0) html += '<span style="color:var(--text-muted)">Res: ' + formatEquipmentDisplayQuantity(displayCategory, f.reserve) + '</span>';
      if (f.mothballed > 0) html += '<span style="color:var(--accent-red)">Moth: ' + formatEquipmentDisplayQuantity(displayCategory, f.mothballed) + '</span>';
      html += '</div></div>';
    }
  });
  
  html += '</div></div>';
  
  return html;
}



// ============================================================
// ARMS MARKET — Buy/Sell Equipment Between Nations
// ============================================================

// Initialize defense revenue tracking for a nation
function initDefenseRevenue(nation) {
  if (nation.defenseRevenue === undefined) nation.defenseRevenue = 0;
  if (nation.defenseSpending === undefined) nation.defenseSpending = 0;
  if (nation.armsDeals === undefined) nation.armsDeals = [];
  if (nation.pendingArmsOrders === undefined) nation.pendingArmsOrders = [];
  if (nation.defenseMarketShare === undefined) nation.defenseMarketShare = 1 / 3;
}

function isAlliedNation(aId, bId) {
  return GAME.alliances.some(a =>
    (a.a === aId && a.b === bId) ||
    (a.b === aId && a.a === bId)
  );
}

function getDefenseMarketShare(nation) {
  initDefenseRevenue(nation);
  return clamp(Number(nation.defenseMarketShare) || 0.45, 0.2, 0.75);
}

function getExportReadyQuantity(nation, item) {
  const qty = Math.max(0, Number(item?.quantity) || 0);
  if (qty <= 0) return 0;
  
  // Check if this equipment can be exported (only lower-tier equipment can be sold)
  if (!canSellEquipment(nation, item)) return 0;
  
  return Math.floor(qty * getDefenseMarketShare(nation));
}

function addEquipmentToStockpile(nation, category, itemName, quantity, condition) {
  if (!nation.militaryStockpile) nation.militaryStockpile = {};
  if (!nation.militaryStockpile[category]) nation.militaryStockpile[category] = [];

  const existing = nation.militaryStockpile[category].find(item => item.name === itemName);
  if (existing) {
    existing.quantity = (existing.quantity || 0) + quantity;
    existing.condition = Math.max(existing.condition || 0, condition || 100);
    return;
  }

  nation.militaryStockpile[category].push({
    name: itemName,
    cat: category,
    quantity,
    condition: condition || 100,
  });
}

function reserveEquipmentForExport(sellerNation, itemName, category, quantity) {
  const stockArr = sellerNation.militaryStockpile?.[category] || [];
  let remaining = Math.max(0, Math.floor(quantity || 0));
  let moved = 0;
  let conditionWeighted = 0;

  for (let i = stockArr.length - 1; i >= 0 && remaining > 0; i--) {
    const item = stockArr[i];
    if (item.name !== itemName) continue;

    const exportable = getExportReadyQuantity(sellerNation, item);
    if (exportable <= 0) continue;

    const take = Math.min(remaining, exportable);
    item.quantity = Math.max(0, (item.quantity || 0) - take);
    moved += take;
    remaining -= take;
    conditionWeighted += take * (item.condition || 100);

    if (item.quantity <= 0) {
      stockArr.splice(i, 1);
    }
  }

  if (moved <= 0) return null;

  return {
    quantity: moved,
    condition: Math.round(conditionWeighted / moved) || 100,
  };
}

function getDefenseMarketPrice(template, condition) {
  const conditionMultiplier = 0.7 + ((condition || 100) / 100) * 0.3;
  return Math.max(1, Math.ceil(getEquipmentUnitCost(template, template?.cat) * 0.9 * conditionMultiplier));
}

function getArmsOrderLeadTime(sellerNation, buyerNation, category, quantity) {
  const avgTech = ((sellerNation.techLevel || 1) + (buyerNation.techLevel || 1)) / 2;
  const allied = isAlliedNation(sellerNation.id, buyerNation.id);
  const heavyCategory = ['tank', 'fighter', 'destroyer', 'submarine', 'carrier', 'missile', 'artillery'].includes(category);
  const volumePenalty = quantity >= 5 ? 1 : 0;
  const baseLead = 7 + (heavyCategory ? 1 : 0) + volumePenalty;
  return clamp(Math.round(baseLead - avgTech * 0.55 - (allied ? 1 : 0)), 1, 9);
}

function queueDefenseMarketOrder(sellerNation, buyerNation, itemName, category, quantity, pricePerUnit, reason) {
  initDefenseRevenue(sellerNation);
  initDefenseRevenue(buyerNation);

  const reserved = reserveEquipmentForExport(sellerNation, itemName, category, quantity);
  if (!reserved || reserved.quantity <= 0) return false;

  const totalPrice = Math.max(1, Math.ceil(pricePerUnit * reserved.quantity));
  const paymentSuccess = processArmsPayment(sellerNation, buyerNation, totalPrice);
  if (!paymentSuccess) {
    addEquipmentToStockpile(sellerNation, category, itemName, reserved.quantity, reserved.condition);
    return false;
  }

  const etaTurns = getArmsOrderLeadTime(sellerNation, buyerNation, category, reserved.quantity);
  buyerNation.pendingArmsOrders.push({
    sellerId: sellerNation.id,
    sellerName: sellerNation.name,
    itemName,
    cat: category,
    quantity: reserved.quantity,
    condition: reserved.condition,
    etaTurn: (GAME.turn || 0) + etaTurns,
    orderedTurn: GAME.turn || 0,
    totalPrice,
    reason: reason || 'market',
  });

  addNews(`📦 ${buyerNation.name} orders ${formatEquipmentDisplayQuantity(category, reserved.quantity)} ${itemName} from ${sellerNation.name} via the Defence Market. ETA ${etaTurns} turns.`, 'minor');
  return true;
}

function processPendingDefenseOrders() {
  Object.values(NATIONS).forEach(nation => {
    if (nation.failedState) return;
    initDefenseRevenue(nation);

    const pending = nation.pendingArmsOrders || [];
    if (!pending.length) return;

    const remainingOrders = [];
    pending.forEach(order => {
      if ((GAME.turn || 0) < (order.etaTurn || 0)) {
        remainingOrders.push(order);
        return;
      }

      addEquipmentToStockpile(nation, order.cat, order.itemName, order.quantity, order.condition);
      addNews(`🚚 ${nation.name} receives ${formatEquipmentDisplayQuantity(order.cat, order.quantity)} ${order.itemName} from ${order.sellerName}.`, 'minor');
    });

    nation.pendingArmsOrders = remainingOrders;
  });
}

// ─── PROCESS PAYMENT ──────────────────────────────────
// Properly transfer money between nations

function processArmsPayment(sellerNation, buyerNation, price, meta) {
  // Price is in $M (millions)
  // Buyer pays from their treasury if player, or from GDP if AI
  const isPlayerBuyer = buyerNation.id === GAME.playerNation?.id;
  const isPlayerSeller = sellerNation.id === GAME.playerNation?.id;
  
  // Check affordability
  if (isPlayerBuyer) {
    if (GAME.treasury < price) return false;
    GAME.treasury -= price;
  } else {
    // AI buyers: pay from budget, cap at % of GDP
    const aiMonthlyBudget = (buyerNation.gdp * 1000) / 12; // GDP in $M / month
    const strategy = getNationDefenseBuyingStrategy(buyerNation);
    const maxArmsSpend = aiMonthlyBudget * (strategy.mode === 'volume' ? 0.78 : 0.62);
    if (price > maxArmsSpend * (strategy.mode === 'volume' ? 10 : 7)) return false;
    buyerNation.defenseSpending = (buyerNation.defenseSpending || 0) + price;
  }
  
  // Seller receives money
  if (isPlayerSeller) {
    GAME.treasury += price;
  }
  // Track revenue
  sellerNation.defenseRevenue = (sellerNation.defenseRevenue || 0) + price;

  // Track per-company revenue and customers
  const sourceCompanyId = meta?.sourceCompanyId || null;
  if (sourceCompanyId) {
    const sourceCompany = DEFENSE_COMPANIES.find(c => c.id === sourceCompanyId);
    if (sourceCompany) {
      sourceCompany.totalRevenue = (sourceCompany.totalRevenue || 0) + price;
      sourceCompany.totalSales = (sourceCompany.totalSales || 0) + Math.max(0, Number(meta?.quantity || 0));
      if (!sourceCompany.customers) sourceCompany.customers = {};
      const buyerId = buyerNation.id || buyerNation.name;
      sourceCompany.customers[buyerId] = (sourceCompany.customers[buyerId] || 0) + 1;
      // Record price history for market movers
      if (!sourceCompany.priceHistory) sourceCompany.priceHistory = [];
      sourceCompany.priceHistory.push({ turn: GAME.turn || 0, revenue: price });
      if (sourceCompany.priceHistory.length > 20) sourceCompany.priceHistory.shift();
    }
  }
  
  // Record the deal
  if (!sellerNation.armsDeals) sellerNation.armsDeals = [];
  sellerNation.armsDeals.push({
    buyer: buyerNation.name,
    amount: price,
    turn: GAME.turn || 0,
    date: GAME.date || 'Unknown'
  });
  
  return true;
}

// ─── GET EQUIPMENT CATALOG FROM A NATION ──────────────

function getNationEquipmentCatalog(nation, options) {
  const exportOnly = !!(options && options.exportOnly);
  const catalog = [];
  
  // From stockpile
  const stockpile = nation.militaryStockpile || {};
  Object.keys(stockpile).forEach(cat => {
    (stockpile[cat] || []).forEach(item => {
      const availableQty = exportOnly ? getExportReadyQuantity(nation, item) : (item.quantity || 0);
      if (availableQty > 0) {
        catalog.push({
          name: item.name,
          cat: cat,
          quantity: availableQty,
          stockQuantity: item.quantity || 0,
          condition: item.condition || 100,
          source: 'stockpile',
          sourceId: null
        });
      }
    });
  });
  
  return catalog;
}

// ─── ARMS MARKET: Nations WITHOUT defense contractors buy from others ──

function processGlobalArmsMarket() {
  // Nations with low stock can place import orders through allied or friendly defense markets.
  Object.values(NATIONS).forEach(buyerNation => {
    if (buyerNation.failedState) return;
    
    initDefenseRevenue(buyerNation);
    initNationMilitaryForces(buyerNation);
    const buyerCompanies = getNationDefenseCompanies(buyerNation);

    // Check if they already have a decent stockpile
    const stockpile = buyerNation.militaryStockpile || {};
    const totalItems = Object.values(stockpile).reduce((sum, arr) => sum + arr.reduce((s, i) => s + (i.quantity || 0), 0), 0);
    const activePersonnel = Math.max(0, Number(buyerNation.militaryForces?.activePersonnel) || 0);
    const stockNeedThreshold = Math.max(4, Math.round(buyerNation.militaryPower * 2.4 + activePersonnel * 120));
    
    // Only buy if they need equipment (low stockpile)
    if (totalItems > stockNeedThreshold && buyerCompanies.length > 0) return;
    
    // Check if they can afford it
    const monthlyGDP = (buyerNation.gdp * 1000) / 12; // $M per month
    const strategy = getNationDefenseBuyingStrategy(buyerNation);
    const maxArmsBudget = monthlyGDP * (strategy.mode === 'volume' ? 0.62 : 0.48) * clamp(buyerNation.techLevel / 5, 0.6, 2.2);
    
    if (maxArmsBudget < 5) return; // Too poor to buy anything
    
    // Find potential sellers: allies, friendly nations, neutrals with DEFENSE COMPANIES
    const potentialSellers = Object.values(NATIONS).filter(seller => {
      if (seller.failedState || seller.id === buyerNation.id) return false;
      const sellerCompanies = getNationDefenseCompanies(seller);
      if (sellerCompanies.length === 0) return false;
      
      // Check relation
      const rel = (typeof getRelationBetween === 'function' ? getRelationBetween(buyerNation.id, seller.id) : getRelation(seller.id));
      const isAlly = isAlliedNation(buyerNation.id, seller.id);
      
      return isAlly || rel > 0; // Allies or positive relations
    });
    
    if (potentialSellers.length === 0) return;
    
    // Determine what equipment they need (stuff they lack)
    const neededCategories = [];
    const equipTypes = ['fighter','tank','rifle','destroyer','submarine','missile','artillery','ifv','helicopter','drone','patrol'];
    equipTypes.forEach(cat => {
      const items = stockpile[cat] || [];
      const total = items.reduce((s, i) => s + (i.quantity || 0), 0);
      const baseline = cat === 'rifle' ? 8 : 2;
      if (total < baseline) neededCategories.push(cat);
    });
    
    // If they have most things, just buy random upgrades
    if (neededCategories.length === 0) {
      neededCategories.push(equipTypes[Math.floor(Math.random() * equipTypes.length)]);
    }
    
    // Pick a random needed category
    const needCat = neededCategories[Math.floor(Math.random() * neededCategories.length)];
    
    // Pick a seller
    const sortedSellers = potentialSellers
      .map(seller => {
        const sellerCatalog = getNationEquipmentCatalog(seller, { exportOnly: true });
        const exportQty = sellerCatalog
          .filter(item => item.cat === needCat)
          .reduce((sum, item) => sum + (item.quantity || 0), 0);
        const rel = (typeof getRelationBetween === 'function' ? getRelationBetween(buyerNation.id, seller.id) : getRelation(seller.id));
        const allied = isAlliedNation(buyerNation.id, seller.id);
        return { seller, sellerCatalog, exportQty, score: exportQty + (allied ? 12 : 0) + rel * 0.2 };
      })
      .filter(entry => entry.exportQty > 0)
      .sort((a, b) => b.score - a.score);

    if (sortedSellers.length === 0) return;

    const { seller, sellerCatalog } = sortedSellers[0];
    
    // Package deal: buy multiple equipment types at once
    const packageSize = clamp(1 + Math.floor(Math.random() * 3), 1, 4);
    const selectedCategories = neededCategories.slice(0, packageSize);
    
    let totalPackagePrice = 0;
    const packageItems = [];
    
    for (const needCat of selectedCategories) {
      // Find matching items
      const matchingItems = sellerCatalog.filter(item => item.cat === needCat && item.quantity > 0);
      if (matchingItems.length === 0) continue;
      
      // Pick an item
      const item = matchingItems[Math.floor(Math.random() * matchingItems.length)];
      const qtyCeiling = strategy.mode === 'volume'
        ? (needCat === 'rifle' ? (70 + Math.floor(Math.random() * 110)) : (18 + Math.floor(Math.random() * 44)))
        : (needCat === 'rifle' ? (18 + Math.floor(Math.random() * 32)) : (3 + Math.floor(Math.random() * 11)));
      const qty = Math.min(item.quantity, qtyCeiling);
      
      // Calculate price (market rate: supply/demand)
      const template = findEquipmentTemplate(item.name, needCat);
      if (!template) continue;
      
      const pricePerUnit = getDefenseMarketPrice(template, item.condition);
      const itemTotalPrice = Math.ceil(pricePerUnit * qty);
      
      // Check if adding this item would exceed budget
      if (totalPackagePrice + itemTotalPrice > maxArmsBudget) {
        // Try smaller quantity
        const affordableQty = Math.floor((maxArmsBudget - totalPackagePrice) / pricePerUnit);
        if (affordableQty < 1) continue;
        packageItems.push({ item, needCat, qty: affordableQty, pricePerUnit, totalPrice: pricePerUnit * affordableQty });
        totalPackagePrice += pricePerUnit * affordableQty;
        break;
      }
      
      packageItems.push({ item, needCat, qty, pricePerUnit, totalPrice: itemTotalPrice });
      totalPackagePrice += itemTotalPrice;
    }
    
    if (packageItems.length === 0) return;
    
    // Queue all items in the package deal
    for (const pkg of packageItems) {
      queueDefenseMarketOrder(seller, buyerNation, pkg.item.name, pkg.needCat, pkg.qty, pkg.pricePerUnit, buyerCompanies.length > 0 ? 'restock' : 'import');
    }
    
    // News for package deals
    if (packageItems.length > 1 && (Math.random() < 0.3)) {
      const summary = packageItems.map(p => `${p.qty} ${p.needCat}`).join(', ');
      addNews(`📦 ${buyerNation.flag || '🏳️'} ${buyerNation.name} purchased package from ${seller.name}: ${summary}.`, 'minor');
    }
  });
}

// ─── ENHANCED processTechUpgradeSales (with payment) ──
// Replaces the old one — properly handles payments

function processTechUpgradeSalesWithPayment(nation) {
  initNationMilitaryForces(nation);
  initDefenseRevenue(nation);
  const stockpile = nation.militaryStockpile || {};
  
  // Find old equipment in stockpile (low tech relative to nation)
  let oldEquipmentForSale = [];
  Object.keys(stockpile).forEach(cat => {
    (stockpile[cat] || []).forEach(item => {
      if ((item.quantity || 0) <= 0) return;
      const template = findEquipmentTemplate(item.name, cat);
      if (!template) return;
      
      const eraNum = parseInt(template.era.replace('ERA', ''));
      let nationEraNum = 1;
      const eraLabel = getEraForTechLevel(nation.techLevel).label;
      if (eraLabel === 'Interwar') nationEraNum = 2;
      else if (eraLabel === 'WW2 Era') nationEraNum = 3;
      else if (eraLabel === 'Early Cold War') nationEraNum = 4;
      else if (eraLabel === 'Late Cold War') nationEraNum = 5;
      else if (eraLabel === 'Modern') nationEraNum = 6;
      else if (eraLabel === 'Near Future') nationEraNum = 7;
      else if (eraLabel === 'Futuristic') nationEraNum = 8;
      
      if (eraNum < nationEraNum - 1) {
        oldEquipmentForSale.push({ item, cat, eraDiff: nationEraNum - eraNum });
      }
    });
  });
  
  if (oldEquipmentForSale.length === 0) return;
  
  // Find potential buyers (less technologically advanced)
  const allies = GAME.alliances.filter(a => a.a === nation.id || a.b === nation.id);
  const allyNations = [];
  allies.forEach(a => {
    const otherId = a.a === nation.id ? a.b : a.a;
    if (NATIONS[otherId] && !NATIONS[otherId].failedState) {
      allyNations.push(NATIONS[otherId]);
    }
  });
  
  const neutrals = Object.values(NATIONS).filter(n =>
    !n.failedState && n.id !== nation.id &&
    !allyNations.find(a => a.id === n.id) &&
    (typeof getRelationBetween === 'function' ? getRelationBetween(nation.id, n.id) : getRelation(n.id)) > 5
  );
  
  const potentialBuyers = [...allyNations, ...neutrals].filter(n => 
    n.techLevel < nation.techLevel - 0.5
  );
  
  if (potentialBuyers.length === 0) return;
  
  // Sell some old equipment
  const saleChance = 0.12;
  oldEquipmentForSale.forEach(sale => {
    if (Math.random() > saleChance) return;
    
    const buyer = potentialBuyers[Math.floor(Math.random() * potentialBuyers.length)];
    const qty = Math.min(getExportReadyQuantity(nation, sale.item), 1 + Math.floor(Math.random() * 3));
    if (qty <= 0) return;
    
    const template = findEquipmentTemplate(sale.item.name, sale.cat);
    if (!template) return;
    
    // Price: discounted based on era difference (older = cheaper)
    const discount = 0.15 + (sale.eraDiff - 1) * 0.1;
    const pricePerUnit = Math.max(1, Math.floor(getEquipmentUnitCost(template, sale.cat) * clamp(discount + Math.random() * 0.15, 0.1, 0.6)));
    const totalPrice = pricePerUnit * qty;
    
    // Check buyer affordability
    const buyerMonthlyBudget = (buyer.gdp * 1000) / 12;
    if (totalPrice > buyerMonthlyBudget * 0.5) return;
    
    queueDefenseMarketOrder(nation, buyer, sale.item.name, sale.cat, qty, pricePerUnit, 'upgrade-sale');
  });
  
  // Clean up zero-quantity items
  Object.keys(stockpile).forEach(cat => {
    stockpile[cat] = stockpile[cat].filter(i => (i.quantity || 0) > 0);
  });
}

// ─── HOOK: Process arms market every turn ─────────────

function processArmsMarketAll() {
  processPendingDefenseOrders();

  // 1. Nations with low stock can place market orders with exporters.
  processGlobalArmsMarket();
  
  // 2. Tech upgrade sales for all AI nations (player handled separately)
  Object.values(NATIONS).forEach(nation => {
    if (nation.failedState || nation.id === GAME.playerNation?.id) return;
    processTechUpgradeSalesWithPayment(nation);
  });
}

// ─── RENDER DEFENSE REVENUE IN TAB ────────────────────

function renderDefenseRevenueSection(nation) {
  initDefenseRevenue(nation);
  const revenue = nation.defenseRevenue || 0;
  const spending = nation.defenseSpending || 0;
  const deals = nation.armsDeals || [];
  const pendingOrders = nation.pendingArmsOrders || [];
  const exportReadyTotal = getNationEquipmentCatalog(nation, { exportOnly: true }).reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  let html = '<div class="section-card"><h4>💰 Defence Market</h4>';
  
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">';
  html += '<div class="resource-item"><span class="r-name">Arms Revenue</span><span class="r-val" style="color:var(--accent-green)">$' + revenue.toFixed(1) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Arms Spending</span><span class="r-val" style="color:var(--accent-red)">$' + spending.toFixed(1) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Trade Balance</span><span class="r-val" style="color:' + ((revenue - spending) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)') + '">$' + (revenue - spending).toFixed(1) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Total Deals</span><span class="r-val">' + deals.length + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Export Ready</span><span class="r-val">' + exportReadyTotal + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Inbound Orders</span><span class="r-val">' + pendingOrders.length + '</span></div>';
  html += '</div>';

  html += '<div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px">Roughly ' + Math.round(getDefenseMarketShare(nation) * 100) + '% of military stock is reserved for the Defence Market. The rest stays in national reserve.</div>';

  if (pendingOrders.length > 0) {
    html += '<div style="font-size:11px;color:var(--text-secondary);margin-top:6px;margin-bottom:6px">';
    html += '<div style="font-weight:600;margin-bottom:4px;color:var(--text-muted)">Inbound Orders:</div>';
    pendingOrders.slice(0, 4).forEach(order => {
      const eta = Math.max(0, (order.etaTurn || 0) - (GAME.turn || 0));
      html += '<div style="padding:2px 4px;border-bottom:1px solid rgba(84,140,196,0.12);display:flex;justify-content:space-between">';
      html += '<span>' + order.itemName + ' x' + formatEquipmentDisplayQuantity(order.cat, order.quantity) + '</span>';
      html += '<span style="color:var(--accent-blue)">ETA ' + eta + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }
  
  // Recent deals
  if (deals.length > 0) {
    html += '<div style="font-size:11px;color:var(--text-secondary);margin-top:6px">';
    html += '<div style="font-weight:600;margin-bottom:4px;color:var(--text-muted)">Recent Deals:</div>';
    const recentDeals = deals.slice(-5).reverse();
    recentDeals.forEach(deal => {
      html += '<div style="padding:2px 4px;border-bottom:1px solid rgba(84,140,196,0.12);display:flex;justify-content:space-between">';
      html += '<span>Sold to ' + deal.buyer + '</span>';
      html += '<span style="color:var(--accent-green)">+$' + deal.amount.toFixed(1) + 'M</span>';
      html += '</div>';
    });
    html += '</div>';
  }
  
  html += '</div>';
  return html;
}

// ─── ARMS PURCHASE UI (for player to buy from others) ──

function renderArmsPurchaseUI() {
  const p = GAME.playerNation;
  if (!p) return '';
  
  const hasCompanies = getNationDefenseCompanies(p).length > 0;
  
  let html = '<div class="section-card"><h4>🌐 Global Defence Market</h4>';
  
  if (hasCompanies) {
    html += '<p class="text-muted" style="font-size:11px;margin-bottom:8px">Your nation has defense contractors. About one third of stock is export-ready, and foreign orders arrive after a tech-based delivery delay.</p>';
  } else {
    html += '<p class="text-muted" style="font-size:11px;margin-bottom:8px">Your nation can place import orders with allies and friendly exporters. Deliveries take longer for lower-tech logistics.</p>';
  }
  
  // Find potential sellers (allies + friendly nations with defense companies)
  const potentialSellers = Object.values(NATIONS).filter(seller => {
    if (seller.failedState || seller.id === p.id) return false;
    const sellerCompanies = getNationDefenseCompanies(seller);
    if (sellerCompanies.length === 0) return false;
    const rel = (typeof getRelationBetween === 'function' ? getRelationBetween(p.id, seller.id) : getRelation(seller.id));
    const isAlly = isAlliedNation(p.id, seller.id);
    return isAlly || rel > 15;
  });
  
  if (potentialSellers.length === 0) {
    html += '<p class="empty">No nations willing to sell equipment at this time. Improve relations or form alliances.</p>';
  } else {
    html += '<div style="max-height:200px;overflow-y:auto">';
    potentialSellers.forEach(seller => {
      const catalog = getNationEquipmentCatalog(seller, { exportOnly: true });
      if (catalog.length === 0) return;
      
      html += '<div style="background:rgba(9,28,54,0.5);border:1px solid var(--border-color);border-radius:6px;padding:8px;margin-bottom:6px">';
      html += '<div style="font-weight:600;font-size:12px;margin-bottom:4px">' + seller.flag + ' ' + seller.name + '</div>';
      
      catalog.slice(0, 5).forEach(item => {
        const template = findEquipmentTemplate(item.name, item.cat);
        const pricePerUnit = getDefenseMarketPrice(template, item.condition);
        const etaTurns = getArmsOrderLeadTime(seller, p, item.cat, 1);
        const orderLabel = item.cat === 'rifle' ? 'Order 1,000' : 'Order 1';
        html += '<div style="display:flex;align-items:center;gap:6px;padding:2px 4px;font-size:11px;border-bottom:1px solid rgba(84,140,196,0.1)">';
        html += '<span style="flex:1">' + item.name + '</span>';
        html += '<span style="color:var(--text-muted)">x' + formatEquipmentDisplayQuantity(item.cat, item.quantity) + '</span>';
        html += '<span style="color:var(--accent-yellow)">$' + pricePerUnit + 'M</span>';
        html += '<span style="color:var(--accent-blue);font-size:10px">ETA ' + etaTurns + '</span>';
        html += '<button class="btn-small" onclick="buyFromArmsMarket(\'' + seller.id + '\',\'' + item.name + '\',\'' + item.cat + '\',1)">' + orderLabel + '</button>';
        html += '</div>';
      });
      
      if (catalog.length > 5) {
        html += '<div style="font-size:10px;color:var(--text-muted);text-align:center;margin-top:2px">+' + (catalog.length - 5) + ' more items...</div>';
      }
      
      html += '</div>';
    });
    html += '</div>';
  }
  
  html += '</div>';
  return html;
}

// ─── BUY FROM ARMS MARKET (player action) ─────────────

window.buyFromArmsMarket = function(sellerId, itemName, category, quantity) {
  const buyer = GAME.playerNation;
  const seller = NATIONS[sellerId];
  if (!buyer || !seller) return false;
  
  initDefenseRevenue(buyer);
  initDefenseRevenue(seller);
  
  // Find the item in seller's stockpile
  const catalog = getNationEquipmentCatalog(seller, { exportOnly: true });
  const item = catalog.find(i => i.name === itemName && i.cat === category);
  
  if (!item || (item.quantity || 0) < quantity) {
    addNews('⚠ ' + seller.name + ' does not have enough export-ready ' + itemName + ' in stock', 'minor');
    return false;
  }
  
  const template = findEquipmentTemplate(itemName, category);
  if (!template) return false;
  
  // Price
  const pricePerUnit = getDefenseMarketPrice(template, item.condition);
  const totalPrice = pricePerUnit * quantity;
  
  // Check affordability
  if (GAME.treasury < totalPrice) {
    addNews('⚠ Insufficient funds! Need $' + totalPrice + 'M for ' + formatEquipmentDisplayQuantity(category, quantity) + ' ' + itemName, 'minor');
    return false;
  }
  
  const orderSuccess = queueDefenseMarketOrder(seller, buyer, itemName, category, quantity, pricePerUnit, 'player-order');
  if (!orderSuccess) {
    addNews('⚠ Unable to place market order for ' + itemName, 'minor');
    return false;
  }

  const etaTurns = getArmsOrderLeadTime(seller, buyer, category, quantity);
  addNews('✅ Ordered ' + formatEquipmentDisplayQuantity(category, quantity) + ' ' + itemName + ' from ' + seller.name + ' for $' + totalPrice + 'M. ETA ' + etaTurns + ' turns.', 'major');
  
  // Re-render
  if (typeof renderGame === 'function') renderGame();
  return true;
};

// ─── ARMS PURCHASE UI FOR ANY NATION (foreign intel) ──

function renderArmsPurchaseUIForNation(nation) {
  initDefenseRevenue(nation);
  const catalog = getNationEquipmentCatalog(nation, { exportOnly: true });
  
  let html = '<div class="section-card"><h4>📦 Defence Market Export Stock</h4>';
  
  if (catalog.length === 0) {
    html += '<p class="empty">No equipment available for export.</p>';
    html += '</div>';
    return html;
  }
  
  // Group by category
  const byCat = {};
  catalog.forEach(item => {
    if (!byCat[item.cat]) byCat[item.cat] = [];
    byCat[item.cat].push(item);
  });
  
  Object.keys(byCat).slice(0, 6).forEach(cat => {
    const items = byCat[cat];
    html += '<div class="subsection"><h5>' + cat.charAt(0).toUpperCase() + cat.slice(1) + ' (' + items.length + ' types)</h5>';
    html += '<div class="equip-list">';
    items.slice(0, 4).forEach(item => {
      const template = findEquipmentTemplate(item.name, item.cat);
      const estPrice = template ? Math.ceil(getEquipmentUnitCost(template, item.cat) * 0.9) : 5;
      html += '<div class="equip-item">';
      html += '<span class="equip-name">' + item.name + '</span>';
      html += '<span class="equip-qty">x' + formatEquipmentDisplayQuantity(item.cat, item.quantity) + '</span>';
      html += '<span style="color:var(--accent-yellow);font-size:10px">$' + estPrice + 'M</span>';
      html += '</div>';
    });
    if (items.length > 4) {
      html += '<div style="font-size:10px;color:var(--text-muted);padding:2px 6px">+' + (items.length - 4) + ' more...</div>';
    }
    html += '</div></div>';
  });
  
  if (Object.keys(byCat).length > 6) {
    html += '<p class="text-muted" style="font-size:10px;text-align:center">+' + (Object.keys(byCat).length - 6) + ' more categories</p>';
  }
  
  html += '</div>';
  return html;
}


// ============================================================
// DEFENSE COMPANIES REGISTRY — Standalone Tab
// ============================================================

// Government types that result in publicly listed (traded) companies
const PUBLIC_GOV_TYPES = new Set([
  'liberal_democracy', 'federal_republic', 'constitutional_monarchy',
  'technocratic_council', 'parliamentary_democracy', 'republic',
]);

// Initialize per-company financial tracking fields
function initDefenseCompanyFinancials(company) {
  if (company.totalRevenue === undefined)     company.totalRevenue = 0;
  if (company.totalResearchCost === undefined) company.totalResearchCost = 0;
  if (company.totalSales === undefined)        company.totalSales = 0;
  if (company.procurementSpend === undefined)   company.procurementSpend = 0;
  if (company.unmetMaterialDemand === undefined) company.unmetMaterialDemand = 0;
  if (!company.customers)                      company.customers = {};
  if (!company.priceHistory)                   company.priceHistory = [];
  if (!Array.isArray(company.pendingOrders))   company.pendingOrders = [];
  if (!Array.isArray(company.completedOrders)) company.completedOrders = [];
  if (!company.orderLedger || typeof company.orderLedger !== 'object') company.orderLedger = {};
  if (!company.productionByCategory || typeof company.productionByCategory !== 'object') company.productionByCategory = {};
  if (!Array.isArray(company.supplierRelations)) company.supplierRelations = [];
}

// Is the company publicly listed? Depends on founding nation's government type
function isPublicDefenseCompany(company, foundingNation) {
  if (!foundingNation) return false;
  return PUBLIC_GOV_TYPES.has(foundingNation.governmentStyle || '');
}

// Total military power-points produced across all company equipment
function computeCompanyPowerProduced(company) {
  let total = 0;
  (company.equipment || []).forEach(eq => {
    const template = findEquipmentTemplate(eq.name, eq.cat);
    if (!template) return;
    const techFactor = clamp(0.75 + (template.techReq || 1) * 0.1, 0.8, 1.8);
    const catWeights = { rifle:0.18, tank:3.2, fighter:4.8, bomber:4.8, carrier:12, submarine:6.5,
      destroyer:6.5, missile:5.2, drone:3.5, satellite:3.5, artillery:2.6, ifv:1.8,
      helicopter:1.8, transport:1.8, patrol:1.8 };
    const w = catWeights[eq.cat] || 1.2;
    total += (eq.produced || 0) * (template.power || 1) * techFactor * w;
  });
  return total;
}

// Market valuation: revenue base + tech premium + tier scale
function getDefenseCompanyMarketValue(company) {
  const rev = company.totalRevenue || 0;
  const tier = company.tier || 1;
  const tech = company.techLevel || 1;
  const eqCount = (company.equipment || []).length;
  return rev * 1.6 + tier * 120 + tech * 80 + eqCount * 40;
}

// UI state for the defense companies tab
const DC_UI_STATE = { selectedCompany: null };

// ── DETAIL VIEW ─────────────────────────────────────
function renderDefenseCompanyDetail(co) {
  const foundingNation = Object.values(NATIONS).find(n => n.id === co.foundedBy) || null;
  const era = getEraForTechLevel(co.techLevel || 1);
  const isPublic = isPublicDefenseCompany(co, foundingNation);
  const totalPower = computeCompanyPowerProduced(co);
  const pnl = (co.totalRevenue || 0) - (co.totalResearchCost || 0);
  const pnlColor = pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
  const pnlSign = pnl >= 0 ? '+' : '';

  let html = '<div class="section-card" style="background:rgba(9,28,54,0.85);border:1px solid var(--accent-blue);margin-bottom:10px">';
  html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">';
  html += '<div><div style="font-size:14px;font-weight:700">' + co.name + '</div>';
  html += '<div style="font-size:11px;color:var(--text-muted)">' + co.desc + '</div></div>';
  html += '<button class="btn-sm" data-defco-id="">✕ Close</button>';
  html += '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px;margin-bottom:8px">';
  html += '<div class="resource-item"><span class="r-name">Founded By</span><span class="r-val">' + (foundingNation ? foundingNation.flag + ' ' + foundingNation.name : (co.foundedBy || '?')) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Founded Turn</span><span class="r-val">T' + (co.foundedTurn || 0) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Status</span><span class="r-val">' + (isPublic ? '📈 Public' : '🔒 Private') + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Tier / Era</span><span class="r-val">T' + co.tier + ' • ' + era.label + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Tech Level</span><span class="r-val">' + Number(co.techLevel || 1).toFixed(1) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Equipment Lines</span><span class="r-val">' + (co.equipment ? co.equipment.length : 0) + '</span></div>';
  html += '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px;margin-bottom:8px">';
  html += '<div class="resource-item"><span class="r-name">Total Revenue</span><span class="r-val" style="color:var(--accent-green)">$' + Number(co.totalRevenue || 0).toFixed(1) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Research Cost</span><span class="r-val" style="color:var(--accent-red)">$' + Number(co.totalResearchCost || 0).toFixed(1) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">P&L</span><span class="r-val" style="color:' + pnlColor + '">' + pnlSign + '$' + pnl.toFixed(1) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Units Sold</span><span class="r-val">' + Number(co.totalSales || 0).toLocaleString() + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Power Produced</span><span class="r-val" style="color:var(--accent-blue)">' + Math.round(totalPower).toLocaleString() + ' pts</span></div>';
  html += '<div class="resource-item"><span class="r-name">Market Value</span><span class="r-val" style="color:var(--accent-yellow)">$' + getDefenseCompanyMarketValue(co).toFixed(1) + 'M</span></div>';
  html += '</div>';

  const producedByCat = {};
  (co.equipment || []).forEach((eq) => {
    const cat = eq.cat || 'other';
    producedByCat[cat] = Number(producedByCat[cat] || 0) + Number(eq.produced || 0);
  });
  const producedRows = Object.entries(producedByCat).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (producedRows.length > 0) {
    html += '<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:600;margin-bottom:4px;color:var(--text-secondary)">Manufacturing Totals:</div>';
    producedRows.forEach(([cat, qty]) => {
      html += '<div style="font-size:11px;display:flex;justify-content:space-between;padding:2px 6px;border-bottom:1px solid rgba(84,140,196,0.1)">';
      html += '<span>' + String(cat).toUpperCase() + '</span><span style="color:var(--accent-green)">' + formatEquipmentDisplayQuantity(cat, qty) + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  const suppliers = Array.isArray(co.supplierRelations) ? co.supplierRelations.slice(0, 3) : [];
  if (suppliers.length > 0) {
    html += '<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:600;margin-bottom:4px;color:var(--text-secondary)">Main Suppliers (Top 3):</div>';
    suppliers.forEach((supplier) => {
      html += '<div style="font-size:11px;display:flex;justify-content:space-between;padding:2px 6px;border-bottom:1px solid rgba(84,140,196,0.1)">';
      html += '<span>' + (supplier.name || 'Unknown') + '</span><span style="color:var(--accent-blue)">' + Number(supplier.units || 0).toLocaleString() + ' input units</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  const orderDestinations = Object.values(co.orderLedger || {}).sort((a, b) => Number(b.units || 0) - Number(a.units || 0)).slice(0, 6);
  if (orderDestinations.length > 0) {
    html += '<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:600;margin-bottom:4px;color:var(--text-secondary)">Top Military Orders by Destination:</div>';
    orderDestinations.forEach((dest) => {
      const catBreakdown = Object.entries(dest.byCategory || {})
        .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
        .slice(0, 2)
        .map(([cat, qty]) => String(cat).toUpperCase() + ':' + Number(qty).toLocaleString())
        .join(' • ');
      html += '<div style="font-size:11px;display:flex;justify-content:space-between;gap:8px;padding:2px 6px;border-bottom:1px solid rgba(84,140,196,0.1)">';
      html += '<span>' + (dest.nationName || 'Unknown') + (catBreakdown ? ' <span style="color:var(--text-muted)">(' + catBreakdown + ')</span>' : '') + '</span>';
      html += '<span style="color:var(--accent-yellow)">' + Number(dest.units || 0).toLocaleString() + ' units</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  // Top customers
  const customers = co.customers || {};
  const topCustomers = Object.entries(customers).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (topCustomers.length > 0) {
    html += '<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:600;margin-bottom:4px;color:var(--text-secondary)">Top Customers:</div>';
    topCustomers.forEach(([nid, deals]) => {
      const nation = NATIONS[nid] || null;
      const label = nation ? nation.flag + ' ' + nation.name : nid;
      html += '<div style="font-size:11px;display:flex;justify-content:space-between;padding:2px 6px;border-bottom:1px solid rgba(84,140,196,0.1)">';
      html += '<span>' + label + '</span><span style="color:var(--accent-blue)">' + deals + ' deal' + (deals > 1 ? 's' : '') + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  // Technologies developed
  if (co.equipment && co.equipment.length > 0) {
    html += '<div style="margin-bottom:4px"><div style="font-size:11px;font-weight:600;margin-bottom:4px;color:var(--text-secondary)">Technologies Developed (' + co.equipment.length + '):</div>';
    html += '<div style="max-height:130px;overflow-y:auto">';
    co.equipment.forEach(eq => {
      html += '<div style="font-size:11px;display:flex;justify-content:space-between;padding:2px 6px;border-bottom:1px solid rgba(84,140,196,0.1)">';
      html += '<span>' + eq.name + ' <span style="color:var(--text-muted)">(' + eq.cat + ')</span></span>';
      html += '<span style="color:var(--accent-green)">Produced: ' + formatEquipmentDisplayQuantity(eq.cat, eq.produced || 0) + '</span>';
      html += '</div>';
    });
    html += '</div></div>';
  }

  html += '</div>';
  return html;
}

// ── MAIN TAB RENDERER ────────────────────────────────
function renderDefenseCompaniesTab() {
  const allFounded = DEFENSE_COMPANIES.filter(c => c.foundedBy !== null);
  allFounded.forEach(c => initDefenseCompanyFinancials(c));

  // Build ranked rows
  const rows = allFounded.map(co => {
    const foundingNation = Object.values(NATIONS).find(n => n.id === co.foundedBy) || null;
    const totalPower = computeCompanyPowerProduced(co);
    const isPublic = isPublicDefenseCompany(co, foundingNation);
    const marketValue = getDefenseCompanyMarketValue(co);
    const pnl = (co.totalRevenue || 0) - (co.totalResearchCost || 0);
    return { co, foundingNation, totalPower, isPublic, marketValue, pnl };
  }).sort((a, b) => b.marketValue - a.marketValue);

  const totalRevAll   = allFounded.reduce((s, c) => s + (c.totalRevenue || 0), 0);
  const totalSalesAll = allFounded.reduce((s, c) => s + (c.totalSales || 0), 0);
  const publicCount   = rows.filter(r => r.isPublic).length;
  const stamp = (typeof formatDate === 'function' && GAME?.date) ? formatDate(GAME.date) : 'Now';

  let html = '<div class="tab-content" id="defco-tab-root">';

  // ── Header bar ──
  html += '<div class="section-card" style="padding:10px 12px;margin-bottom:10px;background:linear-gradient(135deg,rgba(9,28,54,0.9),rgba(16,43,79,0.9))">';
  html += '<div style="font-size:13px;font-weight:700;color:var(--accent-blue)">🏭 Defense Companies Registry</div>';
  html += '<div style="font-size:11px;color:var(--text-muted)">Turn ' + (GAME?.turn || 0) + ' • ' + stamp + ' • ' + allFounded.length + ' founded / ' + DEFENSE_COMPANIES.length + ' total</div>';
  html += '<div style="margin-top:8px;display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px">';
  html += '<div class="resource-item"><span class="r-name">Active Companies</span><span class="r-val">' + allFounded.length + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Public / Private</span><span class="r-val">' + publicCount + ' / ' + (allFounded.length - publicCount) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Total Revenue</span><span class="r-val" style="color:var(--accent-green)">$' + totalRevAll.toFixed(1) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Units Sold</span><span class="r-val">' + totalSalesAll.toLocaleString() + '</span></div>';
  html += '</div></div>';

  // ── Detail view (if selected) ──
  if (DC_UI_STATE.selectedCompany) {
    const co = allFounded.find(c => c.id === DC_UI_STATE.selectedCompany);
    if (co) html += renderDefenseCompanyDetail(co);
  }

  // ── Rankings table ──
  if (rows.length === 0) {
    html += '<div class="section-card"><p class="empty">No defense companies have been founded yet. Found one in the Military tab.</p></div>';
  } else {
    html += '<div class="section-card"><h4>📊 Company Rankings — by Market Value</h4>';
    html += '<div style="max-height:420px;overflow-y:auto">';
    rows.forEach(({ co, foundingNation, isPublic, marketValue, pnl }, i) => {
      const pnlColor = pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
      const pnlSign  = pnl >= 0 ? '+' : '';
      const era = getEraForTechLevel(co.techLevel || 1);
      const isSel = DC_UI_STATE.selectedCompany === co.id;
      const rowBg = isSel ? 'rgba(46,167,255,0.12)' : 'transparent';
      const producedTotal = (co.equipment || []).reduce((sum, eq) => sum + Math.max(0, Number(eq.produced || 0)), 0);
      const topOrder = Object.values(co.orderLedger || {}).sort((a, b) => Number(b.units || 0) - Number(a.units || 0))[0] || null;
      const topOrderLabel = topOrder ? (topOrder.nationName + ' ' + Number(topOrder.units || 0).toLocaleString() + 'u') : 'No major orders yet';
      html += '<button class="btn-sm" data-defco-id="' + co.id + '" style="width:100%;display:flex;gap:8px;align-items:center;padding:7px 6px;border:0;border-bottom:1px solid rgba(84,140,196,0.12);font-size:11px;text-align:left;background:' + rowBg + '">';
      html += '<span style="color:var(--text-muted);min-width:22px">#' + (i + 1) + '</span>';
      html += '<span style="flex:1"><b>' + co.name + '</b><br><span style="color:var(--text-muted)">' + co.desc + '</span><br><span style="color:var(--accent-green)">Manufactured: ' + Number(producedTotal).toLocaleString() + ' units</span><br><span style="color:var(--accent-blue)">Top Order: ' + topOrderLabel + '</span></span>';
      html += '<span style="color:var(--text-muted);font-size:10px;text-align:right">' + (foundingNation ? foundingNation.flag + ' ' + foundingNation.name : (co.foundedBy || '?')) + '<br>' + (isPublic ? '📈 Public' : '🔒 Private') + '</span>';
      html += '<span style="color:var(--accent-blue);font-size:10px;text-align:right">T' + co.tier + '<br>' + era.label.split(' ')[0] + '</span>';
      html += '<span style="font-size:10px;text-align:right;min-width:60px"><span style="color:var(--accent-yellow)">$' + marketValue.toFixed(0) + 'M</span><br><span style="color:' + pnlColor + '">' + pnlSign + '$' + pnl.toFixed(0) + '</span></span>';
      html += '</button>';
    });
    html += '</div>';

    // ── Top movers section ──
    const withHistory = rows.filter(r => (r.co.priceHistory || []).length >= 2);
    if (withHistory.length > 0) {
      html += '<div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border-color)">';
      html += '<div style="font-size:11px;font-weight:600;margin-bottom:4px;color:var(--text-secondary)">Recent Revenue Movers:</div>';
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
      const sorted = withHistory.sort((a, b) => {
        const lastA = a.co.priceHistory[a.co.priceHistory.length - 1]?.revenue || 0;
        const lastB = b.co.priceHistory[b.co.priceHistory.length - 1]?.revenue || 0;
        return lastB - lastA;
      });
      sorted.slice(0, 4).forEach(({ co }) => {
        const last = co.priceHistory[co.priceHistory.length - 1]?.revenue || 0;
        const prev = co.priceHistory[co.priceHistory.length - 2]?.revenue || last;
        const diff = last - prev;
        const color = diff >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
        const arrow = diff >= 0 ? '📈' : '📉';
        html += '<div style="font-size:11px;display:flex;justify-content:space-between;padding:2px 4px;background:rgba(9,28,54,0.4);border-radius:4px">';
        html += '<span>' + arrow + ' ' + co.name.split(' ')[0] + '</span>';
        html += '<span style="color:' + color + '">$' + last.toFixed(1) + 'M</span>';
        html += '</div>';
      });
      html += '</div></div>';
    }

    html += '</div>'; // close rankings section-card
  }

  html += '</div>'; // close tab-content
  return html;
}

// ── ATTACH INTERACTIONS ──────────────────────────────
function attachDefenseCompaniesTabInteractions() {
  const root = document.getElementById('defco-tab-root');
  if (!root) return;
  root.querySelectorAll('[data-defco-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-defco-id');
      DC_UI_STATE.selectedCompany = id || null;
      if (typeof renderTabContent === 'function') renderTabContent('defensecos');
    });
  });
}

window.renderDefenseCompaniesTab = renderDefenseCompaniesTab;
window.attachDefenseCompaniesTabInteractions = attachDefenseCompaniesTabInteractions;
window.getDefenseCompanyMarketValue = getDefenseCompanyMarketValue;
window.isPublicDefenseCompany = isPublicDefenseCompany;
window.initDefenseCompanyFinancials = initDefenseCompanyFinancials;
window.computeCompanyPowerProduced = computeCompanyPowerProduced;
window.processDefenseCompanyFoundings = processDefenseCompanyFoundings;

