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


// ─── EQUIPMENT TEMPLATES BY ERA ──────────────────────
// 500+ equipment items across 8 eras. Each has power (combat strength),
// cost (in $B to produce), techReq (minimum tech level), cat, and era.
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

// ─── COMPANY RESEARCH ──────────────────────────────────

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
    // All items in this category researched - upgrade tier
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
  
  // Check if research complete
  const cost = target.cost * 2; // Research cost is 2x production cost
  if (company.researchProgress >= cost) {
    if (!company.equipment) company.equipment = [];
    company.equipment.push({...target, produced: 0, id: `${company.id}_${target.name.replace(/\s+/g, '_')}`});
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
  if (!eq) return false;
  
  const template = findEquipmentTemplate(eq.name, eq.cat);
  if (!template) return false;
  
  const totalCost = template.cost * quantity;
  
  if (isPlayer && typeof GAME !== 'undefined' && GAME.treasury < totalCost) {
    addNews('⚠ Insufficient funds for production!', 'minor');
    return false;
  }
  
  if (isPlayer && typeof GAME !== 'undefined') {
    GAME.treasury -= totalCost;
  }
  
  eq.produced = (eq.produced || 0) + quantity;
  
  // Add to nation's military stockpile
  if (!nation.militaryStockpile) nation.militaryStockpile = {};
  if (!nation.militaryStockpile[eq.cat]) nation.militaryStockpile[eq.cat] = [];
  
  const existing = nation.militaryStockpile[eq.cat].find(s => s.name === eq.name);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + quantity;
    existing.condition = Math.max(existing.condition || 100, 100);
  } else {
    nation.militaryStockpile[eq.cat].push({
      ...eq,
      quantity: quantity,
      condition: 100,
    });
  }
  
  if (isPlayer) {
    addNews(`✅ Produced ${quantity}x ${eq.name}`, 'minor');
  }
  return true;
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

// ─── AI DECISIONS ─────────────────────────────────────

// AI nations decide to found companies periodically
function aiManageDefenseCompanies(nation) {
  if (nation.failedState) return;
  if (nation.aiDefenseCooldown === undefined) nation.aiDefenseCooldown = 0;
  if (nation.aiDefenseCooldown > 0) { nation.aiDefenseCooldown--; return; }
  
  // Check owned companies count
  const owned = getNationDefenseCompanies(nation);
  
  // Found new company? Only if nation can afford and has few
  const maxCompanies = Math.floor(clamp(nation.techLevel, 1, 10) * 0.5 + 1);
  if (owned.length < maxCompanies && nation.techLevel > 2 && Math.random() < 0.1) {
    const available = DEFENSE_COMPANIES.filter(c => c.foundedBy === null);
    if (available.length > 0) {
      const pick = available[Math.floor(Math.random() * available.length)];
      const idx = DEFENSE_COMPANIES.indexOf(pick);
      foundDefenseCompany(nation, idx);
    }
  }
  
  // Assign research focus for owned companies
  owned.forEach(company => {
    if (!company.researchFocus) {
      const cats = ['fighter', 'tank', 'rifle', 'destroyer', 'missile', 'drone', 'submarine', 'artillery', 'helicopter', 'transport'];
      company.researchFocus = cats[Math.floor(Math.random() * cats.length)];
      company.researchProgress = 0;
    }
    
    // Process research
    processCompanyResearch(company, nation, false);
    
    // Produce equipment if needed
    if (Math.random() < 0.2 && company.equipment && company.equipment.length > 0) {
      const toProduce = company.equipment.filter(e => (e.produced || 0) < 5);
      if (toProduce.length > 0) {
        const pick = toProduce[Math.floor(Math.random() * toProduce.length)];
        _produceEquipInternal(company, pick.id, 1 + Math.floor(Math.random() * 3), nation, false);
      }
    }
  });
  
  // Set cooldown
  nation.aiDefenseCooldown = 3 + Math.floor(Math.random() * 5);
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

function sellEquipmentBetweenNations(sellerNation, buyerNation, equipmentItem, quantity) {
  if (!sellerNation.militaryStockpile || !buyerNation) return false;
  
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
  const price = template ? template.cost * quantity * 1.5 : quantity * 5;
  
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
  Object.values(NATIONS).forEach(nation => {
    if (nation.failedState) return;
    
    // AI management
    aiManageDefenseCompanies(nation);
    
    // Economic effects
    applyDefenseEconomicEffects(nation);
    
    // Update company tech levels to match nation
    const companies = getNationDefenseCompanies(nation);
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
      const era = getEraForTechLevel(company.techLevel);
      const equipCount = company.equipment?.length || 0;
      html += `<div class="company-card">
        <div class="company-header">
          <span class="company-name">${company.name}</span>
          <span class="company-tier">Tier ${company.tier}</span>
          <span class="company-era">${era.label}</span>
        </div>
        <div class="company-desc">${company.desc}</div>
        <div class="company-stats">
          <span>Tech: ${company.techLevel.toFixed(1)}</span>
          <span>Equipment: ${equipCount}</span>
          <span>Focus: ${company.researchFocus || 'None'}</span>
        </div>`;
      
      // Research progress bar
      if (company.researchFocus) {
        const progressPct = clamp((company.researchProgress / (company.equipment?.length ? 15 : 10)) * 100, 0, 99);
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
          html += `<div class="equip-row">
            <span>${eq.name}</span>
            <span class="equip-type">${eq.cat}</span>
            <span class="equip-produced">Produced: ${produced}</span>
            <button class="btn-small" onclick="produceEquipment('${company.id}', '${eq.id}', 1)">+1</button>
            <button class="btn-small" onclick="produceEquipment('${company.id}', '${eq.id}', 5)">+5</button>
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
  
  html += '<div class="section-card"><h4>⚔ Military Power</h4>';
  html += '<div class="strength-display">' + strength.toLocaleString() + '</div>';
  html += '<div class="strength-breakdown">';
  html += '<div>Base Power: ' + (p.militaryPower * 10).toFixed(0) + '</div>';
  html += '<div>Readiness: ' + forces.readiness.toFixed(1) + '%</div>';
  html += '<div>Maintenance: $' + forces.maintenanceCost.toFixed(1) + 'M</div>';
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
  html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">';
  html += '<span style="font-size:36px">' + nation.flag + '</span>';
  html += '<div>';
  html += '<h3 style="font-size:20px;font-weight:700">' + nation.name + '</h3>';
  html += '<p style="color:var(--text-secondary);font-size:13px">' + nation.leader + ' • ' + getGovernmentLabel(nation.governmentStyle) + ' • ' + getDoctrineLabel(nation.policyDoctrine) + '</p>';
  html += '</div></div>';

  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">';
  html += '<div class="resource-item"><span class="r-name">Military Power</span><span class="r-val" style="color:var(--accent-red)">' + nation.militaryPower.toFixed(1) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Total Strength</span><span class="r-val" style="color:var(--accent-green)">' + strength.toLocaleString() + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Tech Level</span><span class="r-val" style="color:var(--accent-blue)">T' + nation.techLevel.toFixed(1) + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Defense Companies</span><span class="r-val">' + companies.length + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Equipment Types</span><span class="r-val">' + totalEquipTypes + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Total Units</span><span class="r-val">' + totalItems + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">GDP</span><span class="r-val">$' + nation.gdp.toFixed(1) + 'T</span></div>';
  html += '<div class="resource-item"><span class="r-name">Population</span><span class="r-val">' + Math.round(nation.population) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Stability</span><span class="r-val" style="color:' + (nation.stability >= 55 ? 'var(--accent-green)' : 'var(--accent-red)') + '">' + nation.stability.toFixed(1) + '</span></div>';
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
      html += '<span>Tech: ' + company.techLevel.toFixed(1) + '</span>';
      html += '<span>Focus: ' + (company.researchFocus || 'Idle') + '</span>';
      html += '<span>Equipment: ' + (company.equipment ? company.equipment.length : 0) + ' designs</span>';
      html += '</div>';
      if (company.equipment && company.equipment.length > 0) {
        html += '<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:4px">';
        company.equipment.forEach(function(eq) {
          const produced = eq.produced || 0;
          html += '<span style="background:rgba(46,167,255,0.12);border:1px solid var(--border-color);border-radius:4px;padding:1px 6px;font-size:10px;color:var(--text-secondary)">' + eq.name + ' (' + produced + ')</span>';
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
  html += '<div>Education: <strong>' + nation.education.toFixed(1) + '</strong></div>';
  html += '<div>Governance: <strong>' + nation.governance.toFixed(1) + '</strong></div>';
  html += '<div>Corruption: <strong style="color:' + (nation.corruption <= 38 ? 'var(--accent-green)' : 'var(--accent-red)') + '">' + nation.corruption.toFixed(1) + '</strong></div>';
  html += '<div>Infrastructure: <strong>' + nation.infrastructure.toFixed(1) + '</strong></div>';
  html += '<div>Happiness: <strong>' + nation.happiness.toFixed(1) + '</strong></div>';
  html += '<div>Resilience: <strong>' + nation.resilience.toFixed(1) + '</strong></div>';
  html += '<div>Health: <strong>' + nation.health.toFixed(1) + '</strong></div>';
  html += '<div>Innovation Risk: <strong>' + nation.innovationRisk.toFixed(1) + '</strong></div>';
  html += '<div>Environment: <strong>' + nation.environment.toFixed(1) + '</strong></div>';
  html += '<div>Inflation: <strong>' + nation.inflation.toFixed(1) + '%</strong></div>';
  html += '<div>Debt/GDP: <strong>' + nation.debtRatio.toFixed(1) + '%</strong></div>';
  html += '<div>Religion: <strong>' + nation.religionInfluence.toFixed(1) + '</strong></div>';
  html += '<div>Jobs: <strong style="color:' + (nation.jobs >= 55 ? 'var(--accent-green)' : 'var(--accent-red)') + '">' + nation.jobs.toFixed(1) + '</strong></div>';
  html += '<div>Stock Index: <strong>' + nation.stockMarket.toFixed(1) + '</strong></div>';
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
      activePersonnel: 0,       // in thousands
      reservePersonnel: 0,      // in thousands
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

// ─── COMPUTE MANPOWER & MILITARY PRODUCTION ──────────

function computeNationMilitaryProduction(nation) {
  initNationMilitaryForces(nation);
  
  const pop = nation.population; // in millions
  const gdp = nation.gdp; // in trillions
  const tech = nation.techLevel;
  const gov = getGovernmentProfile(nation.governmentStyle);
  
  // Budget allocation for military (as decimal 0-1)
  const budget = nation.aiBudget || doctrineBaseBudget('balanced');
  const milPct = clamp(budget.military / 100, 0.02, 0.70);
  
  // --- MANPOWER ---
  // Max military population based on government type and population
  // Dictatorships can have larger armies relative to population
  const popMobilizationRate = clamp(gov.stabilityBoost || 1.0, 0.5, 2.0);
  // Base: 0.5% to 4% of population can serve
  const maxMilitaryPop = clamp(pop * clamp(0.005 + tech * 0.003, 0.005, 0.04) * popMobilizationRate, 0.05, 60);
  // Active duty: portion of max, influenced by budget and war pressure
  const warPressure = getWarPressure(nation.id || '');
  const activeRatio = clamp(milPct * 1.2 + warPressure * 0.3 + (nation.inCrisis ? 0.1 : 0), 0.1, 1.0);
  const targetActive = clamp(maxMilitaryPop * activeRatio, 0.05, maxMilitaryPop);
  // Reserve: 2-3x active depending on doctrine
  const reserveRatio = clamp(gov.stabilityBoost > 1.2 ? 3.0 : 2.0, 1.5, 4.0);
  const targetReserve = clamp(targetActive * reserveRatio, 0.1, maxMilitaryPop * 3);
  
  // Smoothly move toward targets
  nation.militaryForces.activePersonnel += (targetActive - nation.militaryForces.activePersonnel) * 0.05;
  nation.militaryForces.reservePersonnel += (targetReserve - nation.militaryForces.reservePersonnel) * 0.03;
  
  // Clamp
  nation.militaryForces.activePersonnel = clamp(nation.militaryForces.activePersonnel, 0.01, maxMilitaryPop);
  nation.militaryForces.reservePersonnel = clamp(nation.militaryForces.reservePersonnel, 0, maxMilitaryPop * 3);
  
  return {
    maxMilitaryPop,
    activeRatio,
    targetActive,
    targetReserve,
    warPressure
  };
}

// ─── PRODUCE EQUIPMENT FROM STOCKPILE TO FORCES ──────

function deployEquipmentToForces(nation) {
  initNationMilitaryForces(nation);
  const forces = nation.militaryForces;
  const stockpile = nation.militaryStockpile || {};
  
  // Map categories to forces fields
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
  
  Object.keys(stockpile).forEach(cat => {
    const targetField = catMap[cat];
    if (!targetField || !forces[targetField]) return;
    
    const items = stockpile[cat] || [];
    items.forEach(item => {
      const qty = item.quantity || 0;
      if (qty <= 0) return;
      
      // Deploy to active forces (up to 80% of stockpile)
      const toDeploy = Math.floor(qty * 0.3); // 30% of stock per cycle
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
  
  // Personnel costs (~$50K per active soldier per year = ~$4.2K/month)
  const personnelCost = forces.activePersonnel * 0.0042; // $M per month (for thousands)
  totalCost += personnelCost;
  
  // Reserve personnel cost (20% of active)
  totalCost += forces.reservePersonnel * 0.00084;
  
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
  const budget = nation.aiBudget || doctrineBaseBudget('balanced');
  const milPct = clamp(budget.military / 100, 0.02, 0.70);
  const availableBudget = gdpMonthly * milPct * 0.15; // ~15% of mil budget for O&M
  
  // Check if they can afford maintenance
  const fundingRatio = clamp(availableBudget / Math.max(cost, 0.01), 0, 2.5);
  
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
  power *= clamp(nation.governance / 50, 0.5, 1.5);
  
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

// When a nation discovers a new tech that unlocks better equipment,
// they can sell their old equipment to allies or neutral nations

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
  
  // Find old equipment in stockpile (low power items)
  let oldEquipmentForSale = [];
  Object.keys(stockpile).forEach(cat => {
    (stockpile[cat] || []).forEach(item => {
      const template = findEquipmentTemplate(item.name, cat);
      if (template) {
        // Check if this is low-tech (old generation)
        const eraNum = parseInt(template.era.replace('ERA', ''));
        const nationEraNum = parseInt(getEraForTechLevel(nation.techLevel).label === 'WW1 Era' ? '1' :
          getEraForTechLevel(nation.techLevel).label === 'Interwar' ? '2' :
          getEraForTechLevel(nation.techLevel).label === 'WW2 Era' ? '3' :
          getEraForTechLevel(nation.techLevel).label === 'Early Cold War' ? '4' :
          getEraForTechLevel(nation.techLevel).label === 'Late Cold War' ? '5' :
          getEraForTechLevel(nation.techLevel).label === 'Modern' ? '6' :
          getEraForTechLevel(nation.techLevel).label === 'Near Future' ? '7' : '8');
        
        if (eraNum < nationEraNum - 1 && (item.quantity || 0) > 0) {
          oldEquipmentForSale.push({ item, cat, eraDiff: nationEraNum - eraNum });
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
    getRelation(n.id) > 10
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
    const price = template ? Math.floor(template.cost * qty * (0.2 + Math.random() * 0.2)) : qty;
    
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
    
    addNews(`🔄 ${nation.name} sells ${qty}x ${sale.item.name} to ${buyer.name} ($${price}M)`, 'minor');
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
  
  let html = '<div class="section-card"><h4>👥 Personnel</h4>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
  html += '<div class="resource-item"><span class="r-name">Active Duty</span><span class="r-val">' + Math.round(forces.activePersonnel * 1000).toLocaleString() + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Reserves</span><span class="r-val">' + Math.round(forces.reservePersonnel * 1000).toLocaleString() + '</span></div>';
  html += '<div class="resource-item"><span class="r-name">Readiness</span><span class="r-val" style="color:' + (forces.readiness >= 70 ? 'var(--accent-green)' : forces.readiness >= 40 ? 'var(--accent-yellow)' : 'var(--accent-red)') + '">' + forces.readiness.toFixed(1) + '%</span></div>';
  html += '<div class="resource-item"><span class="r-name">Maintenance</span><span class="r-val" style="color:var(--accent-red)">$' + forces.maintenanceCost.toFixed(1) + 'M</span></div>';
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
      html += '<div style="padding:4px 6px;background:rgba(9,28,54,0.4);border-radius:4px;border:1px solid var(--border-color)">';
      html += '<div style="font-weight:600;font-size:11px;color:var(--text-secondary)">' + equipLabels[type] + '</div>';
      html += '<div style="display:flex;gap:6px;font-size:10px;margin-top:2px">';
      html += '<span style="color:var(--accent-blue)">Active: ' + f.active + '</span>';
      if (f.reserve > 0) html += '<span style="color:var(--text-muted)">Res: ' + f.reserve + '</span>';
      if (f.mothballed > 0) html += '<span style="color:var(--accent-red)">Moth: ' + f.mothballed + '</span>';
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
}

// ─── PROCESS PAYMENT ──────────────────────────────────
// Properly transfer money between nations

function processArmsPayment(sellerNation, buyerNation, price) {
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
    const maxArmsSpend = aiMonthlyBudget * 0.3; // Max 30% of monthly budget on arms
    if (price > maxArmsSpend * 3) return false; // Can't spend more than 3 months budget
    buyerNation.defenseSpending = (buyerNation.defenseSpending || 0) + price;
  }
  
  // Seller receives money
  if (isPlayerSeller) {
    GAME.treasury += price;
  }
  // Track revenue
  sellerNation.defenseRevenue = (sellerNation.defenseRevenue || 0) + price;
  
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

function getNationEquipmentCatalog(nation) {
  const catalog = [];
  
  // From stockpile
  const stockpile = nation.militaryStockpile || {};
  Object.keys(stockpile).forEach(cat => {
    (stockpile[cat] || []).forEach(item => {
      if ((item.quantity || 0) > 0) {
        catalog.push({
          name: item.name,
          cat: cat,
          quantity: item.quantity,
          condition: item.condition || 100,
          source: 'stockpile',
          sourceId: null
        });
      }
    });
  });
  
  // From defense company production
  const companies = getNationDefenseCompanies(nation);
  companies.forEach(company => {
    (company.equipment || []).forEach(eq => {
      const produced = eq.produced || 0;
      if (produced > 0) {
        // Check if already in stockpile catalog
        const inStockpile = catalog.find(c => c.name === eq.name && c.cat === eq.cat);
        if (!inStockpile) {
          catalog.push({
            name: eq.name,
            cat: eq.cat,
            quantity: produced,
            condition: 100,
            source: 'company',
            sourceId: company.id
          });
        }
      }
    });
  });
  
  return catalog;
}

// ─── ARMS MARKET: Nations WITHOUT defense contractors buy from others ──

function processGlobalArmsMarket() {
  // For each nation that has NO defense companies, try to buy equipment
  Object.values(NATIONS).forEach(buyerNation => {
    if (buyerNation.failedState) return;
    
    initDefenseRevenue(buyerNation);
    const buyerCompanies = getNationDefenseCompanies(buyerNation);
    
    // Only nations without (or very few) defense companies buy
    if (buyerCompanies.length >= 2) return;
    
    // Check if they already have a decent stockpile
    const stockpile = buyerNation.militaryStockpile || {};
    const totalItems = Object.values(stockpile).reduce((sum, arr) => sum + arr.reduce((s, i) => s + (i.quantity || 0), 0), 0);
    
    // Only buy if they need equipment (low stockpile)
    if (totalItems > buyerNation.militaryPower * 2) return;
    
    // Check if they can afford it
    const monthlyGDP = (buyerNation.gdp * 1000) / 12; // $M per month
    const maxArmsBudget = monthlyGDP * 0.2 * (buyerNation.techLevel / 5); // More advanced = more arms spending
    
    if (maxArmsBudget < 5) return; // Too poor to buy anything
    
    // Find potential sellers: allies, friendly nations, neutrals with DEFENSE COMPANIES
    const potentialSellers = Object.values(NATIONS).filter(seller => {
      if (seller.failedState || seller.id === buyerNation.id) return false;
      const sellerCompanies = getNationDefenseCompanies(seller);
      if (sellerCompanies.length === 0) return false;
      
      // Check relation
      const rel = getRelation(seller.id);
      const isAlly = GAME.alliances.some(a => 
        (a.a === buyerNation.id && a.b === seller.id) || 
        (a.b === buyerNation.id && a.a === seller.id)
      );
      
      return isAlly || rel > 0; // Allies or positive relations
    });
    
    if (potentialSellers.length === 0) return;
    
    // Determine what equipment they need (stuff they lack)
    const neededCategories = [];
    const equipTypes = ['fighter','tank','rifle','destroyer','submarine','missile','artillery','ifv','helicopter','drone','patrol'];
    equipTypes.forEach(cat => {
      const items = stockpile[cat] || [];
      const total = items.reduce((s, i) => s + (i.quantity || 0), 0);
      if (total < 2) neededCategories.push(cat); // Need at least 2 of each type
    });
    
    // If they have most things, just buy random upgrades
    if (neededCategories.length === 0) {
      neededCategories.push(equipTypes[Math.floor(Math.random() * equipTypes.length)]);
    }
    
    // Pick a random needed category
    const needCat = neededCategories[Math.floor(Math.random() * neededCategories.length)];
    
    // Pick a seller
    const seller = potentialSellers[Math.floor(Math.random() * potentialSellers.length)];
    const sellerCatalog = getNationEquipmentCatalog(seller);
    
    // Find matching items
    const matchingItems = sellerCatalog.filter(item => item.cat === needCat && item.quantity > 0);
    if (matchingItems.length === 0) return;
    
    // Pick an item
    const item = matchingItems[Math.floor(Math.random() * matchingItems.length)];
    const qty = Math.min(item.quantity, 1 + Math.floor(Math.random() * 3));
    
    // Calculate price (market rate: supply/demand)
    const template = findEquipmentTemplate(item.name, needCat);
    if (!template) return;
    
    // Base price: 80-120% of template cost, higher for better condition
    const conditionMultiplier = 0.7 + (item.condition / 100) * 0.3;
    const pricePerUnit = template.cost * (0.8 + Math.random() * 0.4) * conditionMultiplier;
    const totalPrice = Math.ceil(pricePerUnit * qty);
    
    // Check buyer can afford
    if (totalPrice > maxArmsBudget) return;
    
    // Process the sale
    // Remove from seller's stockpile
    if (item.source === 'stockpile') {
      const stockArr = seller.militaryStockpile[needCat] || [];
      let remaining = qty;
      for (let i = stockArr.length - 1; i >= 0 && remaining > 0; i--) {
        if (stockArr[i].name === item.name) {
          const take = Math.min(remaining, stockArr[i].quantity || 1);
          stockArr[i].quantity = (stockArr[i].quantity || 1) - take;
          remaining -= take;
          if (stockArr[i].quantity <= 0) {
            stockArr.splice(i, 1);
          }
        }
      }
    }
    
    // Process payment
    const paymentSuccess = processArmsPayment(seller, buyerNation, totalPrice);
    if (!paymentSuccess) return;
    
    // Add to buyer's stockpile
    if (!buyerNation.militaryStockpile) buyerNation.militaryStockpile = {};
    if (!buyerNation.militaryStockpile[needCat]) buyerNation.militaryStockpile[needCat] = [];
    
    const existing = buyerNation.militaryStockpile[needCat].find(s => s.name === item.name);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + qty;
      existing.condition = item.condition || 100;
    } else {
      buyerNation.militaryStockpile[needCat].push({
        name: item.name,
        cat: needCat,
        quantity: qty,
        condition: item.condition || 100,
      });
    }
    
    // News
    addNews(`🛒 ${buyerNation.name} buys ${qty}x ${item.name} from ${seller.name} for $${totalPrice}M`, 'minor');
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
    getRelation(n.id) > 5
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
    const qty = Math.min(sale.item.quantity || 1, 1 + Math.floor(Math.random() * 3));
    
    const template = findEquipmentTemplate(sale.item.name, sale.cat);
    if (!template) return;
    
    // Price: discounted based on era difference (older = cheaper)
    const discount = 0.15 + (sale.eraDiff - 1) * 0.1;
    const pricePerUnit = Math.max(1, Math.floor(template.cost * clamp(discount + Math.random() * 0.15, 0.1, 0.6)));
    const totalPrice = pricePerUnit * qty;
    
    // Check buyer affordability
    const buyerMonthlyBudget = (buyer.gdp * 1000) / 12;
    if (totalPrice > buyerMonthlyBudget * 0.5) return;
    
    // Process payment
    const paymentSuccess = processArmsPayment(nation, buyer, totalPrice);
    if (!paymentSuccess) return;
    
    // Remove from seller
    sale.item.quantity = (sale.item.quantity || 1) - qty;
    if (sale.item.quantity <= 0) sale.item.quantity = 0;
    
    // Add to buyer
    if (!buyer.militaryStockpile) buyer.militaryStockpile = {};
    if (!buyer.militaryStockpile[sale.cat]) buyer.militaryStockpile[sale.cat] = [];
    buyer.militaryStockpile[sale.cat].push({
      name: sale.item.name,
      cat: sale.cat,
      quantity: qty,
      condition: 40 + Math.floor(Math.random() * 35), // Used equipment = lower condition
    });
    
    addNews(`🔄 ${nation.name} sells ${qty}x ${sale.item.name} to ${buyer.name} for $${totalPrice}M`, 'minor');
  });
  
  // Clean up zero-quantity items
  Object.keys(stockpile).forEach(cat => {
    stockpile[cat] = stockpile[cat].filter(i => (i.quantity || 0) > 0);
  });
}

// ─── HOOK: Process arms market every turn ─────────────

function processArmsMarketAll() {
  // 1. Nations without defense companies buy from allies/neutrals
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
  
  let html = '<div class="section-card"><h4>💰 Defense Trade</h4>';
  
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">';
  html += '<div class="resource-item"><span class="r-name">Arms Revenue</span><span class="r-val" style="color:var(--accent-green)">$' + revenue.toFixed(1) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Arms Spending</span><span class="r-val" style="color:var(--accent-red)">$' + spending.toFixed(1) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Trade Balance</span><span class="r-val" style="color:' + ((revenue - spending) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)') + '">$' + (revenue - spending).toFixed(1) + 'M</span></div>';
  html += '<div class="resource-item"><span class="r-name">Total Deals</span><span class="r-val">' + deals.length + '</span></div>';
  html += '</div>';
  
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
  
  let html = '<div class="section-card"><h4>🌐 International Arms Market</h4>';
  
  if (hasCompanies) {
    html += '<p class="text-muted" style="font-size:11px;margin-bottom:8px">Your nation has defense contractors. Other nations may purchase your equipment. Revenue is tracked above.</p>';
  } else {
    html += '<p class="text-muted" style="font-size:11px;margin-bottom:8px">Your nation lacks defense contractors. Purchase equipment from allies and friendly nations below.</p>';
  }
  
  // Find potential sellers (allies + friendly nations with defense companies)
  const potentialSellers = Object.values(NATIONS).filter(seller => {
    if (seller.failedState || seller.id === p.id) return false;
    const sellerCompanies = getNationDefenseCompanies(seller);
    if (sellerCompanies.length === 0) return false;
    const rel = getRelation(seller.id);
    const isAlly = GAME.alliances.some(a => 
      (a.a === p.id && a.b === seller.id) || (a.b === p.id && a.a === seller.id)
    );
    return isAlly || rel > 15;
  });
  
  if (potentialSellers.length === 0) {
    html += '<p class="empty">No nations willing to sell equipment at this time. Improve relations or form alliances.</p>';
  } else {
    html += '<div style="max-height:200px;overflow-y:auto">';
    potentialSellers.forEach(seller => {
      const catalog = getNationEquipmentCatalog(seller);
      if (catalog.length === 0) return;
      
      html += '<div style="background:rgba(9,28,54,0.5);border:1px solid var(--border-color);border-radius:6px;padding:8px;margin-bottom:6px">';
      html += '<div style="font-weight:600;font-size:12px;margin-bottom:4px">' + seller.flag + ' ' + seller.name + '</div>';
      
      catalog.slice(0, 5).forEach(item => {
        const template = findEquipmentTemplate(item.name, item.cat);
        const pricePerUnit = template ? Math.ceil(template.cost * (0.8 + Math.random() * 0.3)) : 5;
        html += '<div style="display:flex;align-items:center;gap:6px;padding:2px 4px;font-size:11px;border-bottom:1px solid rgba(84,140,196,0.1)">';
        html += '<span style="flex:1">' + item.name + '</span>';
        html += '<span style="color:var(--text-muted)">x' + item.quantity + '</span>';
        html += '<span style="color:var(--accent-yellow)">$' + pricePerUnit + 'M</span>';
        html += '<button class="btn-small" onclick="buyFromArmsMarket(\'' + seller.id + '\',\'' + item.name + '\',\'' + item.cat + '\',1)">Buy 1</button>';
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
  const stockpile = seller.militaryStockpile || {};
  const items = stockpile[category] || [];
  const item = items.find(i => i.name === itemName);
  
  if (!item || (item.quantity || 0) < quantity) {
    addNews('⚠ ' + seller.name + ' does not have enough ' + itemName + ' in stock', 'minor');
    return false;
  }
  
  const template = findEquipmentTemplate(itemName, category);
  if (!template) return false;
  
  // Price
  const conditionMultiplier = 0.7 + ((item.condition || 100) / 100) * 0.3;
  const pricePerUnit = Math.ceil(template.cost * 0.9 * conditionMultiplier);
  const totalPrice = pricePerUnit * quantity;
  
  // Check affordability
  if (GAME.treasury < totalPrice) {
    addNews('⚠ Insufficient funds! Need $' + totalPrice + 'M for ' + quantity + 'x ' + itemName, 'minor');
    return false;
  }
  
  // Process payment
  const paymentSuccess = processArmsPayment(seller, buyer, totalPrice);
  if (!paymentSuccess) return false;
  
  // Remove from seller
  item.quantity = (item.quantity || 1) - quantity;
  
  // Add to buyer
  if (!buyer.militaryStockpile) buyer.militaryStockpile = {};
  if (!buyer.militaryStockpile[category]) buyer.militaryStockpile[category] = [];
  
  const existing = buyer.militaryStockpile[category].find(s => s.name === itemName);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + quantity;
    existing.condition = item.condition || 100;
  } else {
    buyer.militaryStockpile[category].push({
      name: itemName,
      cat: category,
      quantity: quantity,
      condition: item.condition || 100,
    });
  }
  
  addNews('✅ Purchased ' + quantity + 'x ' + itemName + ' from ' + seller.name + ' for $' + totalPrice + 'M', 'major');
  
  // Re-render
  if (typeof renderGame === 'function') renderGame();
  return true;
};

// ─── ARMS PURCHASE UI FOR ANY NATION (foreign intel) ──

function renderArmsPurchaseUIForNation(nation) {
  initDefenseRevenue(nation);
  const catalog = getNationEquipmentCatalog(nation);
  
  let html = '<div class="section-card"><h4>📦 Available for Export</h4>';
  
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
      const estPrice = template ? Math.ceil(template.cost * 0.9) : 5;
      html += '<div class="equip-item">';
      html += '<span class="equip-name">' + item.name + '</span>';
      html += '<span class="equip-qty">x' + item.quantity + '</span>';
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

