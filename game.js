/**
 * Sovereign State: Global Hegemony
 * A geopolitical simulator
 */

const FEATURED_NATION_OVERRIDES = {
  usa: { leader: 'James Holloway', leaderTitle: 'President', leaderTraits: ['Pragmatist', 'Economist'], leaderTerm: '2025–2029', gdp: 25.0, population: 331, militaryPower: 78, techLevel: 5.5, relation: { base: 0, trend: 0 }, featured: true },
  chn: { leader: 'Wei Zhang', leaderTitle: 'President', leaderTraits: ['Authoritarian', 'Technocrat'], gdp: 18.5, population: 1425, militaryPower: 72, techLevel: 5.2, relation: { base: -20, trend: -2 }, featured: true },
  rus: { leader: 'Dmitri Volkov', leaderTitle: 'President', leaderTraits: ['Expansionist', 'Strategist'], gdp: 2.0, population: 144, militaryPower: 85, techLevel: 4.8, relation: { base: -35, trend: -3 }, featured: true },
  ind: { leader: 'Aarav Patel', leaderTitle: 'Prime Minister', leaderTraits: ['Nationalist', 'Reformer'], gdp: 3.7, population: 1428, militaryPower: 60, techLevel: 4.0, relation: { base: 10, trend: 1 }, featured: true },
  gbr: { leader: 'Eleanor Cross', leaderTitle: 'Prime Minister', leaderTraits: ['Diplomat', 'Traditionalist'], gdp: 3.3, population: 67, militaryPower: 55, techLevel: 5.0, relation: { base: 40, trend: 0 }, featured: true },
  deu: { leader: 'Klaus Richter', leaderTitle: 'Chancellor', leaderTraits: ['Pragmatist', 'Industrialist'], gdp: 4.5, population: 84, militaryPower: 50, techLevel: 5.3, relation: { base: 35, trend: 0 }, featured: true },
  fra: { leader: 'Marie Dubois', leaderTitle: 'President', leaderTraits: ['Diplomat', 'Strategist'], gdp: 3.0, population: 65, militaryPower: 48, techLevel: 4.9, relation: { base: 30, trend: 0 }, featured: true },
  jpn: { leader: 'Haruto Tanaka', leaderTitle: 'Prime Minister', leaderTraits: ['Technocrat', 'Traditionalist'], gdp: 4.2, population: 125, militaryPower: 35, techLevel: 5.8, relation: { base: 45, trend: 0 }, featured: true },
  bra: { leader: 'Lucas Silva', leaderTitle: 'President', leaderTraits: ['Populist', 'Environmentalist'], gdp: 2.1, population: 216, militaryPower: 30, techLevel: 3.5, relation: { base: 15, trend: 1 }, featured: true },
  sau: { leader: 'Faisal Al-Rashid', leaderTitle: 'Crown Prince', leaderTraits: ['Authoritarian', 'Industrialist'], gdp: 1.1, population: 36, militaryPower: 45, techLevel: 4.0, relation: { base: 10, trend: -1 }, featured: true },
};

const CONTINENT_COLORS = {
  northAmerica: '#4a90d9',
  southAmerica: '#4caf80',
  europe: '#9b59b6',
  africa: '#f0c040',
  asia: '#e74c5e',
  oceania: '#36cfc9',
  antarctica: '#b8c4d6',
};

const CONTINENT_LABELS = {
  northAmerica: 'North America',
  southAmerica: 'South America',
  europe: 'Europe',
  africa: 'Africa',
  asia: 'Asia',
  oceania: 'Oceania',
  antarctica: 'Antarctica',
};

const CONTINENT_TRAITS = {
  northAmerica: ['Industrial', 'Alliance Builder', 'Maritime'],
  southAmerica: ['Resource Rich', 'Regional Power', 'Adaptive'],
  europe: ['Diplomatic', 'Financial', 'Innovative'],
  africa: ['Strategic', 'Resource Rich', 'Resilient'],
  asia: ['Technocratic', 'Manufacturing', 'Expansionist'],
  oceania: ['Maritime', 'Scientific', 'Island Network'],
  antarctica: ['Scientific', 'Remote', 'Neutral'],
};

const CONTINENT_POLYGONS = [
  { fill: 'rgba(74, 144, 217, 0.16)', stroke: 'rgba(125, 197, 255, 0.32)', points: [[0.05, 0.20], [0.14, 0.10], [0.23, 0.12], [0.29, 0.19], [0.27, 0.27], [0.19, 0.33], [0.12, 0.31], [0.06, 0.24]] },
  { fill: 'rgba(76, 175, 128, 0.18)', stroke: 'rgba(139, 224, 180, 0.32)', points: [[0.22, 0.39], [0.27, 0.36], [0.32, 0.42], [0.31, 0.53], [0.28, 0.69], [0.24, 0.84], [0.19, 0.76], [0.17, 0.58]] },
  { fill: 'rgba(155, 89, 182, 0.18)', stroke: 'rgba(212, 157, 241, 0.34)', points: [[0.41, 0.15], [0.47, 0.12], [0.55, 0.14], [0.58, 0.19], [0.52, 0.24], [0.44, 0.22]] },
  { fill: 'rgba(240, 192, 64, 0.16)', stroke: 'rgba(255, 224, 128, 0.32)', points: [[0.44, 0.26], [0.52, 0.25], [0.57, 0.33], [0.56, 0.47], [0.52, 0.64], [0.47, 0.72], [0.42, 0.62], [0.40, 0.46]] },
  { fill: 'rgba(231, 76, 94, 0.18)', stroke: 'rgba(255, 135, 149, 0.36)', points: [[0.53, 0.16], [0.68, 0.10], [0.83, 0.15], [0.90, 0.26], [0.84, 0.36], [0.74, 0.38], [0.66, 0.33], [0.61, 0.38], [0.56, 0.34], [0.55, 0.26]] },
  { fill: 'rgba(54, 207, 201, 0.16)', stroke: 'rgba(136, 255, 249, 0.34)', points: [[0.77, 0.58], [0.84, 0.56], [0.90, 0.62], [0.92, 0.72], [0.87, 0.80], [0.80, 0.77], [0.76, 0.68]] },
  { fill: 'rgba(184, 196, 214, 0.12)', stroke: 'rgba(240, 246, 255, 0.26)', points: [[0.06, 0.86], [0.20, 0.83], [0.40, 0.86], [0.60, 0.85], [0.82, 0.88], [0.94, 0.92], [0.08, 0.95]] },
];

const MIN_MAP_SCALE = 0.65;
const MAX_MAP_SCALE = 3;
const ZOOM_IN_FACTOR = 1.22;
const ZOOM_OUT_FACTOR = 0.82;
const ZOOM_WHEEL_STEP = 0.12;
const DRAG_THRESHOLD = 6;
const FEATURED_NATION_HIT_RADIUS = 14;
const REGULAR_NATION_HIT_RADIUS = 8;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getSeed(country) {
  return country.numeric || country.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function deriveContinent(lat, lon) {
  if (lat <= -55) return 'antarctica';
  if (lon <= -30) return lat >= 12 ? 'northAmerica' : 'southAmerica';
  if (lon < 45) return lat >= 35 ? 'europe' : 'africa';
  if (lon < 120) return lat < -10 ? 'oceania' : 'asia';
  if (lat < 8) return 'oceania';
  if (lat >= 10) return 'asia';
  return 'oceania';
}

function getContinentColor(continent) {
  return CONTINENT_COLORS[continent] || '#4a90d9';
}

function getLeaderTraits(continent, seed) {
  const pool = CONTINENT_TRAITS[continent] || CONTINENT_TRAITS.northAmerica;
  return [pool[seed % pool.length], pool[(seed + 1) % pool.length]];
}

function projectCoordinates(lat, lon) {
  return {
    x: clamp((lon + 180) / 360, 0.02, 0.98),
    y: clamp((90 - lat) / 180, 0.06, 0.94),
  };
}

function buildNation(country) {
  const seed = getSeed(country);
  const continent = deriveContinent(country.lat, country.lon);
  const projected = projectCoordinates(country.lat, country.lon);

  return {
    id: country.id,
    alpha2: country.alpha2,
    name: country.name,
    flag: country.flag || '🏳️',
    numeric: country.numeric,
    lat: country.lat,
    lon: country.lon,
    x: projected.x,
    y: projected.y,
    continent,
    leader: `${country.name} State Council`,
    leaderTitle: 'Head of Government',
    leaderTraits: getLeaderTraits(continent, seed),
    leaderTerm: '2025–2029',
    gdp: Number((0.2 + ((seed * 13) % 220) / 10).toFixed(1)),
    population: clamp(Math.round(1 + (seed * 17) % 240), 1, 240),
    militaryPower: clamp(18 + (seed * 7) % 68, 12, 92),
    techLevel: Number((2.0 + ((seed * 11) % 40) / 10).toFixed(1)),
    color: getContinentColor(continent),
    relation: { base: clamp((seed % 61) - 30, -45, 45), trend: (seed % 5) - 2 },
    featured: false,
  };
}

function mergeNation(base, override = {}) {
  return {
    ...base,
    ...override,
    relation: { ...base.relation, ...(override.relation || {}) },
    leaderTraits: override.leaderTraits || base.leaderTraits,
    color: override.color || base.color || getContinentColor(base.continent),
  };
}

const NATIONS = Object.fromEntries(
  COUNTRY_DIRECTORY.map((country) => {
    const generated = buildNation(country);
    return [generated.id, mergeNation(generated, FEATURED_NATION_OVERRIDES[generated.id])];
  })
);

const NATION_LIST = Object.values(NATIONS).sort((a, b) => a.name.localeCompare(b.name));
const FEATURED_NATIONS = NATION_LIST.filter((nation) => nation.featured && nation.id !== 'usa');

const GAME = {
  turn: 0,
  speed: 0,
  running: false,
  timer: null,
  date: new Date(2025, 5, 1),
  treasury: 2450,
  approval: 58,
  threatLevel: 'Low',
  budget: {
    military: 30,
    economy: 25,
    diplomacy: 15,
    intelligence: 10,
    space: 10,
    social: 10,
  },
  playerNationId: 'usa',
  playerNation: NATIONS.usa,
  selectedNationId: null,
};

// News items log
const newsLog = [];
let newsId = 0;

// Events list for simulation
const EVENTS_POOL = [
  { title: 'Economic recession fears grow globally', type: 'major', effect: { treasury: -50, approval: -3 } },
  { title: 'Tech stock rally boosts investor confidence', type: 'minor', effect: { treasury: 30, approval: 2 } },
  { title: 'Diplomatic summit yields trade agreements', type: 'minor', effect: { approval: 3, treasury: 40 } },
  { title: 'Military parade showcases new technology', type: 'minor', effect: { approval: 2, threatLevel: 'Medium' } },
  { title: 'Terrorist attack thwarted by intelligence', type: 'major', effect: { approval: 5, threatLevel: 'High' } },
  { title: 'Natural disaster strikes allied nation', type: 'major', effect: { treasury: -80, approval: -2 } },
  { title: 'Space program achieves successful launch', type: 'minor', effect: { approval: 4 } },
  { title: 'Inflation rates drop unexpectedly', type: 'minor', effect: { treasury: 20, approval: 3 } },
  { title: 'Border dispute escalates into conflict', type: 'critical', effect: { treasury: -120, threatLevel: 'High', approval: -5 } },
  { title: 'Energy crisis drives up costs', type: 'major', effect: { treasury: -60, approval: -4 } },
  { title: 'Public health initiative reduces costs', type: 'minor', effect: { treasury: 10, approval: 4 } },
  { title: 'Cyber attack targets government systems', type: 'major', effect: { approval: -3, threatLevel: 'Medium' } },
  { title: 'Trade surplus boosts economy', type: 'minor', effect: { treasury: 50, approval: 2 } },
  { title: 'Political scandal rocks administration', type: 'major', effect: { approval: -8 } },
  { title: 'Scientific breakthrough in renewable energy', type: 'minor', effect: { treasury: 25, approval: 3 } },
  { title: 'Foreign relations improve with key ally', type: 'minor', effect: { approval: 3 } },
  { title: 'Military spending bill passes congress', type: 'major', effect: { treasury: -90, militaryPower: 3 } },
  { title: 'Cultural exchange program launched', type: 'minor', effect: { approval: 2 } },
  { title: 'International sanctions imposed', type: 'major', effect: { treasury: -40, approval: -2 } },
  { title: 'New trade route opens with Asia-Pacific', type: 'minor', effect: { treasury: 60, approval: 2 } },
];

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const dom = {};
let countrySearchTerm = '';

function getSelectedNation() {
  return GAME.selectedNationId ? NATIONS[GAME.selectedNationId] : null;
}

function getViewedNation() {
  return getSelectedNation() || GAME.playerNation;
}

function getRelation(nationId) {
  const nation = NATIONS[nationId];
  return nation ? nation.relation.base : 0;
}

function getRelationBadge(score) {
  if (score >= 20) return { text: '🤝 Friendly', cls: 'friendly' };
  if (score <= -20) return { text: '⚔️ Hostile', cls: 'hostile' };
  return { text: '➖ Neutral', cls: 'neutral' };
}

function cacheDom() {
  dom.treasuryVal = $('#treasuryVal');
  dom.approvalVal = $('#approvalVal');
  dom.threatVal = $('#threatVal');
  dom.dateDisplay = $('#dateDisplay');
  dom.turnVal = $('#turnVal');
  dom.worldMap = $('#worldMap');
  dom.newsTicker = $('#newsTicker');
  dom.newsCount = $('#newsCount');
  dom.tabOverlay = $('#tabOverlay');
  dom.tabTitle = $('#tabTitle');
  dom.tabContent = $('#tabContent');
  dom.closeTab = $('#closeTab');
  dom.leftSidebar = $('#leftSidebar');
  dom.rightSidebar = $('#rightSidebar');
  dom.leaderInfo = $('#leaderInfo');
  dom.countryCount = $('#countryCount');
  dom.countryList = $('#countryList');
  dom.countrySearch = $('#countrySearch');
  dom.registrySummary = $('#registrySummary');
  dom.mapMeta = $('#mapMeta');
  dom.mapSelection = $('#mapSelection');
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatDate(date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatMoney(m) {
  if (m >= 1000) return '$' + (m / 1000).toFixed(1) + 'T';
  return '$' + Math.round(m) + 'M';
}

function formatPopulation(population) {
  if (population >= 1000) return `${(population / 1000).toFixed(2)}B`;
  return `${Math.round(population)}M`;
}

function formatContinent(continent) {
  return CONTINENT_LABELS[continent] || 'Global';
}

function updateHUD() {
  dom.treasuryVal.textContent = GAME.treasury.toLocaleString();
  dom.approvalVal.textContent = GAME.approval;
  dom.threatVal.textContent = GAME.threatLevel;
  dom.dateDisplay.textContent = formatDate(GAME.date);
  dom.turnVal.textContent = GAME.turn;
}

// ============================================================
// NEWS SYSTEM
// ============================================================
function addNews(title, type = 'minor') {
  const item = { id: ++newsId, title, type, turn: GAME.turn };
  newsLog.unshift(item);
  if (newsLog.length > 50) newsLog.length = 50;
  renderNews();
}

function renderNews() {
  dom.newsTicker.innerHTML = newsLog.map(n =>
    `<div class="news-item ${n.type}">${n.title}</div>`
  ).join('');
  dom.newsCount.textContent = newsLog.length;
}

function clearSelectedNation() {
  GAME.selectedNationId = null;
  renderNationCard();
  renderLeaderInfo();
  renderMap();
  renderCountryRegistry();
}

// ============================================================
// TURN SIMULATION
// ============================================================
function simulateTurn() {
  GAME.turn++;
  GAME.date.setMonth(GAME.date.getMonth() + 1);

  // Budget effects on treasury
  const income = 200 + Math.random() * 100;
  const spending = (
    GAME.budget.military * 2 +
    GAME.budget.economy * 0.5 +
    GAME.budget.diplomacy * 1.5 +
    GAME.budget.intelligence * 1.2 +
    GAME.budget.space * 3 +
    GAME.budget.social * 1.8
  );
  const netIncome = Math.round(income - spending);
  GAME.treasury += netIncome;

  // Random event
  if (Math.random() < 0.35) {
    const event = EVENTS_POOL[Math.floor(Math.random() * EVENTS_POOL.length)];
    addNews(`📌 ${event.title}`, event.type);
    if (event.effect.treasury) GAME.treasury += event.effect.treasury;
    if (event.effect.approval) {
      GAME.approval = Math.max(0, Math.min(100, GAME.approval + event.effect.approval));
    }
    if (event.effect.threatLevel) GAME.threatLevel = event.effect.threatLevel;
    if (event.effect.militaryPower) {
      GAME.playerNation.militaryPower = Math.min(100, GAME.playerNation.militaryPower + event.effect.militaryPower);
    }
  }

  // Approval drift
  GAME.approval += Math.round((Math.random() - 0.45) * 4);
  GAME.approval = Math.max(5, Math.min(100, GAME.approval));

  // Treasury floor
  GAME.treasury = Math.max(100, GAME.treasury);

  NATION_LIST.forEach((nation) => {
    if (nation.id === GAME.playerNationId) return;
    nation.relation.base += nation.relation.trend + Math.round((Math.random() - 0.5) * 4);
    nation.relation.base = Math.max(-100, Math.min(100, nation.relation.base));
  });

  // Threat level adjustment
  if (GAME.threatLevel === 'High' && Math.random() < 0.2) GAME.threatLevel = 'Medium';
  else if (GAME.threatLevel === 'Medium' && Math.random() < 0.15) GAME.threatLevel = 'Low';

  updateHUD();
  renderNationCard();
  renderLeaderInfo();
  renderMap();
}

// ============================================================
// SPEED CONTROLS
// ============================================================
function setupSpeedControls() {
  $$('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const speed = parseInt(btn.dataset.speed);
      GAME.speed = speed;
      $$('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (GAME.timer) {
        clearInterval(GAME.timer);
        GAME.timer = null;
      }

      if (speed > 0) {
        GAME.running = true;
        const interval = Math.max(200, 2000 / speed);
        GAME.timer = setInterval(simulateTurn, interval);
        // Run first turn immediately
        simulateTurn();
      } else {
        GAME.running = false;
      }
    });
  });
}

// ============================================================
// CANVAS MAP
// ============================================================
let mapCtx = null;
let currentLayer = 'political';
let mapScale = 1;
let mapOffsetX = 0;
let mapOffsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragDistance = 0;

function initMap() {
  const rect = dom.worldMap.parentElement.getBoundingClientRect();
  dom.worldMap.width = rect.width;
  dom.worldMap.height = rect.height;
  mapCtx = dom.worldMap.getContext('2d');
  renderMap();
}

function getLayerColor(nation) {
  if (currentLayer === 'military') return `hsl(0, 78%, ${28 + nation.militaryPower * 0.42}%)`;
  if (currentLayer === 'economic') return `hsl(145, 58%, ${clamp(22 + (nation.gdp / 25) * 34, 24, 72)}%)`;
  if (currentLayer === 'resources') return `hsl(44, 86%, ${clamp(26 + (nation.population / 1500) * 30, 28, 68)}%)`;
  return nation.color;
}

function drawOceanBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#04111f');
  gradient.addColorStop(0.45, '#08233f');
  gradient.addColorStop(1, '#04101d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(width * 0.5, height * 0.35, width * 0.1, width * 0.5, height * 0.35, width * 0.65);
  glow.addColorStop(0, 'rgba(74, 144, 217, 0.18)');
  glow.addColorStop(1, 'rgba(74, 144, 217, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
}

function drawGrid(ctx, width, height) {
  ctx.strokeStyle = 'rgba(99, 133, 176, 0.16)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 12; i++) {
    const x = (i / 12) * width;
    const y = (i / 12) * height;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawContinents(ctx, width, height) {
  CONTINENT_POLYGONS.forEach((continent) => {
    ctx.beginPath();
    continent.points.forEach(([x, y], index) => {
      const px = x * width;
      const py = y * height;
      if (index === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle = continent.fill;
    ctx.fill();
    ctx.strokeStyle = continent.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function drawNationMarker(ctx, nation, width, height) {
  const x = nation.x * width;
  const y = nation.y * height;
  const selected = nation.id === GAME.selectedNationId;
  const player = nation.id === GAME.playerNationId;
  const radius = nation.featured ? 5 + nation.militaryPower / 25 : 1.7 + nation.militaryPower / 90;
  const fillColor = getLayerColor(nation);

  ctx.save();
  if (player || selected) {
    ctx.shadowColor = fillColor;
    ctx.shadowBlur = 18;
  }
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = selected ? '#ffffff' : 'rgba(255,255,255,0.26)';
  ctx.lineWidth = selected ? 2.2 : 1;
  ctx.stroke();

  if (player || selected) {
    ctx.beginPath();
    ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = selected ? 'rgba(255,255,255,0.55)' : 'rgba(74, 144, 217, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();

  if (selected || player || nation.featured) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f4f7fb';
    ctx.font = selected ? 'bold 14px sans-serif' : 'bold 11px sans-serif';
    ctx.fillText(nation.flag, x, y - radius - 10);
    ctx.font = selected ? 'bold 12px sans-serif' : '10px sans-serif';
    ctx.fillText(nation.name, x, y + radius + 14);
    ctx.restore();
  }
}

function renderMapMeta() {
  const selectedNation = getSelectedNation();
  dom.mapMeta.textContent = `${NATION_LIST.length} countries tracked · ${FEATURED_NATIONS.length + 1} strategic powers highlighted`;
  dom.mapSelection.textContent = selectedNation
    ? `Focus: ${selectedNation.flag} ${selectedNation.name} · ${formatContinent(selectedNation.continent)}`
    : `Focus: ${GAME.playerNation.flag} ${GAME.playerNation.name} · ${formatContinent(GAME.playerNation.continent)}`;
}

function renderMap() {
  const ctx = mapCtx;
  if (!ctx) return;

  const width = dom.worldMap.width;
  const height = dom.worldMap.height;
  ctx.clearRect(0, 0, width, height);

  drawOceanBackground(ctx, width, height);
  ctx.save();
  ctx.translate(mapOffsetX, mapOffsetY);
  ctx.scale(mapScale, mapScale);
  drawGrid(ctx, width, height);
  drawContinents(ctx, width, height);
  NATION_LIST.forEach((nation) => drawNationMarker(ctx, nation, width, height));
  ctx.restore();
  renderMapMeta();
}

function findNationAtPoint(clientX, clientY) {
  const rect = dom.worldMap.getBoundingClientRect();
  const localX = (clientX - rect.left - mapOffsetX) / mapScale;
  const localY = (clientY - rect.top - mapOffsetY) / mapScale;
  const width = dom.worldMap.width;
  const height = dom.worldMap.height;
  let closestNation = null;
  let closestDistance = Infinity;

  NATION_LIST.forEach((nation) => {
    const distance = Math.hypot(localX - (nation.x * width), localY - (nation.y * height));
    const threshold = nation.featured ? FEATURED_NATION_HIT_RADIUS : REGULAR_NATION_HIT_RADIUS;
    if (distance <= threshold && distance < closestDistance) {
      closestNation = nation;
      closestDistance = distance;
    }
  });

  return closestNation;
}

// ============================================================
// MAP CONTROLS
// ============================================================
function setupMapControls() {
  $('#zoomIn').addEventListener('click', () => {
    mapScale = Math.min(MAX_MAP_SCALE, mapScale * ZOOM_IN_FACTOR);
    renderMap();
  });

  $('#zoomOut').addEventListener('click', () => {
    mapScale = Math.max(MIN_MAP_SCALE, mapScale * ZOOM_OUT_FACTOR);
    renderMap();
  });

  $('#resetView').addEventListener('click', () => {
    mapScale = 1;
    mapOffsetX = 0;
    mapOffsetY = 0;
    renderMap();
  });

  // Layer toggles
  $$('.layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.layer-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLayer = btn.dataset.layer;
      renderMap();
    });
  });

  const canvas = dom.worldMap;
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragDistance = 0;
    dragStartX = e.clientX - mapOffsetX;
    dragStartY = e.clientY - mapOffsetY;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const nextOffsetX = e.clientX - dragStartX;
    const nextOffsetY = e.clientY - dragStartY;
    dragDistance += Math.abs(nextOffsetX - mapOffsetX) + Math.abs(nextOffsetY - mapOffsetY);
    mapOffsetX = nextOffsetX;
    mapOffsetY = nextOffsetY;
    renderMap();
  });

  canvas.addEventListener('mouseup', () => { isDragging = false; });
  canvas.addEventListener('mouseleave', () => { isDragging = false; });
  canvas.addEventListener('click', (e) => {
    if (dragDistance > DRAG_THRESHOLD) {
      dragDistance = 0;
      return;
    }
    const nation = findNationAtPoint(e.clientX, e.clientY);
    if (nation) {
      GAME.selectedNationId = nation.id;
      renderNationCard();
      renderLeaderInfo();
      renderMap();
      renderCountryRegistry();
    } else {
      dom.leftSidebar.classList.remove('mobile-show');
      dom.rightSidebar.classList.remove('mobile-show');
    }
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    mapScale = clamp(mapScale + (e.deltaY < 0 ? ZOOM_WHEEL_STEP : -ZOOM_WHEEL_STEP), MIN_MAP_SCALE, MAX_MAP_SCALE);
    renderMap();
  }, { passive: false });

  canvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    isDragging = true;
    dragStartX = t.clientX - mapOffsetX;
    dragStartY = t.clientY - mapOffsetY;
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches[0]) return;
    const t = e.touches[0];
    mapOffsetX = t.clientX - dragStartX;
    mapOffsetY = t.clientY - dragStartY;
    renderMap();
  }, { passive: true });

  canvas.addEventListener('touchend', () => { isDragging = false; });
}

function renderNationCard() {
  const p = getViewedNation();
  const relation = p.id === GAME.playerNationId ? getRelationBadge(100) : getRelationBadge(getRelation(p.id));
  const subtitle = p.id === GAME.playerNationId ? 'Player Nation' : `${formatContinent(p.continent)} • Tracked Country`;
  const card = $('#nationCard');
  card.innerHTML = `
    <div class="nation-flag">${p.flag}</div>
    <div class="nation-subtitle">${subtitle}</div>
    <h2 class="nation-name">${p.name}</h2>
    <p class="nation-leader">${p.leaderTitle}: ${p.leader}</p>
    <div class="nation-stats">
      <div class="stat-row"><span class="stat-label">GDP</span><span class="stat-val">$${p.gdp.toFixed(1)}T</span></div>
      <div class="stat-row"><span class="stat-label">Population</span><span class="stat-val">${formatPopulation(p.population)}</span></div>
      <div class="stat-row"><span class="stat-label">Military</span><span class="stat-val"><span class="bar-fill" style="width:${p.militaryPower}%">${p.militaryPower}</span></span></div>
      <div class="stat-row"><span class="stat-label">Tech Avg</span><span class="stat-val">T${p.techLevel.toFixed(1)}</span></div>
      <div class="stat-row"><span class="stat-label">Treasury</span><span class="stat-val">${formatMoney(GAME.treasury)}</span></div>
      <div class="stat-row"><span class="stat-label">Approval</span><span class="stat-val">${GAME.approval}%</span></div>
    </div>
    <div class="nation-relations">
      <span class="relation-badge ${relation.cls}">${relation.text}</span>
      <span class="stat-pill">${formatContinent(p.continent)}</span>
    </div>
    <div class="nation-actions">
      ${p.id !== GAME.playerNationId ? '<button class="btn-sm" onclick="clearSelectedNation()">↩ View USA</button>' : ''}
      <button class="btn-sm" onclick="openTab('diplo')">⚔️ Declare War</button>
      <button class="btn-sm" onclick="openTab('econ')">🤝 Trade</button>
      <button class="btn-sm" onclick="openTab('diplo')">✈️ Visit</button>
    </div>
  `;
}

function renderLeaderInfo() {
  const nation = getViewedNation();
  dom.leaderInfo.innerHTML = `
    <h3>👤 Leader</h3>
    <div class="leader-portrait">${nation.featured ? nation.flag : '🌐'}</div>
    <p class="leader-name">${nation.leader}</p>
    <div class="leader-traits">
      ${nation.leaderTraits.map((trait) => `<span class="trait">${trait}</span>`).join('')}
    </div>
    <div class="leader-term">${nation.leaderTitle} • ${nation.leaderTerm}</div>
  `;
}

function getContinentBreakdown() {
  return NATION_LIST.reduce((counts, nation) => {
    counts[nation.continent] = (counts[nation.continent] || 0) + 1;
    return counts;
  }, {});
}

function getFilteredCountries() {
  const query = countrySearchTerm.trim().toLowerCase();
  return NATION_LIST.filter((nation) => !query || nation.name.toLowerCase().includes(query) || nation.alpha2.toLowerCase().includes(query));
}

function renderCountryRegistry() {
  const counts = getContinentBreakdown();
  const filtered = getFilteredCountries();
  dom.countryCount.textContent = NATION_LIST.length;
  dom.registrySummary.innerHTML = Object.entries(counts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([continent, count]) => `<span class="continent-pill">${formatContinent(continent)} <strong>${count}</strong></span>`)
    .join('');
  dom.countryList.innerHTML = filtered.map((nation) => `
    <button class="country-row ${nation.id === GAME.selectedNationId ? 'active' : ''}" data-country-id="${nation.id}">
      <span class="country-row-main">${nation.flag} ${nation.name}</span>
      <span class="country-row-meta">${formatContinent(nation.continent)}</span>
    </button>
  `).join('');
}

function setupCountryRegistry() {
  dom.countrySearch.addEventListener('input', () => {
    countrySearchTerm = dom.countrySearch.value;
    renderCountryRegistry();
  });

  dom.countryList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-country-id]');
    if (!button) return;
    GAME.selectedNationId = button.dataset.countryId;
    renderNationCard();
    renderLeaderInfo();
    renderMap();
    renderCountryRegistry();
  });

  renderCountryRegistry();
}

// ============================================================
// TAB SYSTEM
// ============================================================
function setupTabs() {
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      openTab(tab);
    });
  });

  // Quick action buttons
  $$('.action-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      openTab(tab);
    });
  });

  dom.closeTab.addEventListener('click', closeTab);

  // Close overlay on backdrop click
  dom.tabOverlay.addEventListener('click', (e) => {
    if (e.target === dom.tabOverlay) closeTab();
  });
}

const TAB_NAMES = {
  gov: '🏛️ Government',
  econ: '💰 Economy',
  mil: '⚔️ Military',
  diplo: '🤝 Diplomacy',
  intel: '🕵️ Intelligence',
  space: '🚀 Space Program',
};

function openTab(tabName) {
  dom.tabTitle.textContent = TAB_NAMES[tabName] || tabName;
  dom.tabOverlay.classList.remove('hidden');

  $$('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });

  renderTabContent(tabName);
}

function closeTab() {
  dom.tabOverlay.classList.add('hidden');
}

function renderTabContent(tab) {
  const content = dom.tabContent;

  switch (tab) {
    case 'gov':
      content.innerHTML = renderGovernmentTab();
      break;
    case 'econ':
      content.innerHTML = renderEconomyTab();
      attachBudgetListeners();
      break;
    case 'mil':
      content.innerHTML = renderMilitaryTab();
      break;
    case 'diplo':
      content.innerHTML = renderDiplomacyTab();
      break;
    case 'intel':
      content.innerHTML = renderIntelTab();
      break;
    case 'space':
      content.innerHTML = renderSpaceTab();
      break;
    default:
      content.innerHTML = `<p class="text-muted">Tab content not available.</p>`;
  }
}

// ============================================================
// TAB: GOVERNMENT
// ============================================================
function renderGovernmentTab() {
  const p = getViewedNation();
  return `
    <div class="tab-section">
      <h3>Administration</h3>
      <div class="leader-portrait" style="font-size:60px">${p.flag}</div>
      <p style="text-align:center;font-size:18px;font-weight:700">${p.leader}</p>
      <p style="text-align:center;color:var(--text-secondary)">${p.leaderTitle} of ${p.name}</p>
      <div class="leader-traits" style="justify-content:center;margin:8px 0">
        ${p.leaderTraits.map(t => `<span class="trait">${t}</span>`).join('')}
      </div>
      <p style="text-align:center;font-size:12px;color:var(--text-muted)">Term: ${p.leaderTerm}</p>
    </div>
    <div class="tab-section">
      <h3>Cabinet Overview</h3>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Treasury</span><span class="r-val">${formatMoney(GAME.treasury)}</span></div>
        <div class="resource-item"><span class="r-name">Approval</span><span class="r-val ${GAME.approval >= 50 ? 'positive' : 'negative'}">${GAME.approval}%</span></div>
        <div class="resource-item"><span class="r-name">Tracked</span><span class="r-val">${NATION_LIST.length}</span></div>
        <div class="resource-item"><span class="r-name">Focus</span><span class="r-val">${formatContinent(p.continent)}</span></div>
      </div>
    </div>
    <div class="tab-section">
      <h3>Threat Assessment</h3>
      <p class="text-muted">Current Threat Level: <strong style="color:${GAME.threatLevel === 'High' ? 'var(--accent-red)' : GAME.threatLevel === 'Medium' ? 'var(--accent-yellow)' : 'var(--accent-green)'}">${GAME.threatLevel}</strong></p>
    </div>
  `;
}

// ============================================================
// TAB: ECONOMY
// ============================================================
function renderEconomyTab() {
  const b = GAME.budget;
  return `
    <div class="tab-section">
      <h3>Budget Allocation</h3>
      <p class="text-muted mb-1">Adjust spending priorities across departments.</p>
      ${renderSlider('military', '⚔️ Military', b.military)}
      ${renderSlider('economy', '💰 Economy', b.economy)}
      ${renderSlider('diplomacy', '🤝 Diplomacy', b.diplomacy)}
      ${renderSlider('intelligence', '🕵️ Intelligence', b.intelligence)}
      ${renderSlider('space', '🚀 Space', b.space)}
      ${renderSlider('social', '🏥 Social', b.social)}
      <div style="margin-top:12px;padding:10px;background:var(--bg-card);border-radius:var(--radius-sm);border:1px solid var(--border-color)">
        <div class="stat-row"><span class="stat-label">Total Budget</span><span class="stat-val" id="budgetTotal">100%</span></div>
        <div class="stat-row"><span class="stat-label">Income (est.)</span><span class="stat-val" style="color:var(--accent-green)">+$225M/turn</span></div>
      </div>
    </div>
    <div class="tab-section">
      <h3>Resources</h3>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">GDP</span><span class="r-val">$${GAME.playerNation.gdp.toFixed(1)}T</span></div>
        <div class="resource-item"><span class="r-name">Population</span><span class="r-val">${formatPopulation(GAME.playerNation.population)}</span></div>
        <div class="resource-item"><span class="r-name">Treasury</span><span class="r-val">${formatMoney(GAME.treasury)}</span></div>
        <div class="resource-item"><span class="r-name">Tech Level</span><span class="r-val">T${GAME.playerNation.techLevel.toFixed(1)}</span></div>
      </div>
    </div>
  `;
}

function renderSlider(id, label, value) {
  return `
    <div class="budget-slider-row">
      <label for="budget-${id}">${label}</label>
      <input type="range" id="budget-${id}" min="0" max="100" value="${value}" data-budget="${id}">
      <span class="pct-val" id="pct-${id}">${value}%</span>
    </div>
  `;
}

function attachBudgetListeners() {
  $$('[data-budget]').forEach(input => {
    input.addEventListener('input', () => {
      const id = input.dataset.budget;
      const val = parseInt(input.value);
      GAME.budget[id] = val;
      document.getElementById(`pct-${id}`).textContent = val + '%';

      // Normalize to 100%
      const total = Object.values(GAME.budget).reduce((a, b) => a + b, 0);
      const totalEl = document.getElementById('budgetTotal');
      if (totalEl) totalEl.textContent = Math.round(total) + '%';
    });
  });
}

// ============================================================
// TAB: MILITARY
// ============================================================
function renderMilitaryTab() {
  const p = GAME.playerNation;
  const units = [
    { name: 'Infantry Division', count: 12, power: 15, cost: 10 },
    { name: 'Naval Fleet', count: 4, power: 25, cost: 20 },
    { name: 'Air Force Wing', count: 6, power: 20, cost: 18 },
    { name: 'Special Forces', count: 2, power: 30, cost: 25 },
    { name: 'Cyber Command', count: 1, power: 18, cost: 15 },
    { name: 'Missile Defense', count: 3, power: 22, cost: 22 },
  ];

  return `
    <div class="tab-section">
      <h3>Armed Forces</h3>
      <p class="text-muted mb-1">Military Power: <strong>${p.militaryPower}/100</strong></p>
      ${units.map(u => `
        <div class="unit-card">
          <div>
            <div class="unit-name">${u.name} (×${u.count})</div>
            <div class="unit-stats">Power: ${u.power} | Cost: $${u.cost}M/turn</div>
          </div>
          <button class="btn-sm" onclick="alert('Funding increased for ${u.name}')">+ Fund</button>
        </div>
      `).join('')}
    </div>
    <div class="tab-section">
      <h3>Defense Budget</h3>
      <p class="text-muted">Current allocation: ${GAME.budget.military}% of budget</p>
      <p class="text-muted">Estimated spending: $${Math.round(GAME.budget.military * 2)}M/turn</p>
    </div>
  `;
}

// ============================================================
// TAB: DIPLOMACY
// ============================================================
function renderDiplomacyTab() {
  const nations = NATION_LIST.filter((nation) => nation.id !== GAME.playerNationId);
  const topRelations = [...nations].sort((a, b) => getRelation(b.id) - getRelation(a.id) || a.name.localeCompare(b.name));

  return `
    <div class="tab-section">
      <h3>Featured Powers</h3>
      <p class="text-muted mb-1">Major geopolitical actors highlighted on the world map.</p>
      ${FEATURED_NATIONS.map(n => {
        const rel = getRelation(n.id);
        const badge = getRelationBadge(rel);
        return `
          <div class="relation-item">
            <span>${n.flag} <strong>${n.name}</strong></span>
            <span>
              <span class="relation-badge ${badge.cls}" style="margin:0;font-size:10px;padding:1px 6px">${badge.text}</span>
              <span class="relation-score ${rel >= 0 ? 'positive' : 'negative'}">${rel >= 0 ? '+' : ''}${rel}</span>
            </span>
          </div>
        `;
      }).join('')}
    </div>
    <div class="tab-section">
      <h3>World Directory</h3>
      <p class="text-muted mb-1">All ${NATION_LIST.length} tracked countries and territories are included in the atlas.</p>
      ${topRelations.slice(0, 40).map(n => {
        const rel = getRelation(n.id);
        return `
          <div class="relation-item">
            <span>${n.flag} ${n.name}</span>
            <span class="relation-score ${rel >= 0 ? 'positive' : 'negative'}">${rel >= 0 ? '+' : ''}${rel}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ============================================================
// TAB: INTELLIGENCE
// ============================================================
function renderIntelTab() {
  return `
    <div class="tab-section">
      <h3>Intelligence Overview</h3>
      <p class="text-muted mb-1">Intelligence budget: ${GAME.budget.intelligence}%</p>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Agents</span><span class="r-val">${5 + Math.floor(GAME.budget.intelligence / 5)}</span></div>
        <div class="resource-item"><span class="r-name">Coverage</span><span class="r-val">${Math.min(100, GAME.budget.intelligence * 3)}%</span></div>
        <div class="resource-item"><span class="r-name">Cyber</span><span class="r-val">${GAME.playerNation.techLevel >= 5 ? 'Advanced' : 'Standard'}</span></div>
        <div class="resource-item"><span class="r-name">Threat Intel</span><span class="r-val">${GAME.threatLevel}</span></div>
      </div>
    </div>
    <div class="tab-section">
      <h3>Reports</h3>
      ${newsLog.length === 0 
        ? '<p class="text-muted">No intel reports yet. Run the simulation to gather intelligence.</p>'
        : newsLog.slice(0, 5).map(n => 
            `<div class="news-item ${n.type}" style="margin-bottom:4px">🕵️ ${n.title}</div>`
          ).join('')
      }
    </div>
    <div class="tab-section">
      <h3>Covert Actions</h3>
      <div class="action-grid" style="grid-template-columns:1fr 1fr">
        <button class="action-btn">🔍 Gather Intel</button>
        <button class="action-btn">💻 Cyber Op</button>
        <button class="action-btn">🕵️ Infiltrate</button>
        <button class="action-btn">🛡️ Counter-Intel</button>
      </div>
    </div>
  `;
}

// ============================================================
// TAB: SPACE
// ============================================================
function renderSpaceTab() {
  const spaceBudget = GAME.budget.space;
  const progress = Math.min(100, GAME.turn * 2 + spaceBudget * 0.5);

  return `
    <div class="tab-section">
      <h3>Space Program</h3>
      <p class="text-muted mb-1">Space budget: ${spaceBudget}%</p>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Program</span><span class="r-val">${progress < 30 ? 'Early Dev' : progress < 60 ? 'Active' : 'Advanced'}</span></div>
        <div class="resource-item"><span class="r-name">Progress</span><span class="r-val">${Math.round(progress)}%</span></div>
        <div class="resource-item"><span class="r-name">Satellites</span><span class="r-val">${Math.floor(progress / 10)}</span></div>
        <div class="resource-item"><span class="r-name">Missions</span><span class="r-val">${Math.floor(progress / 25)}</span></div>
      </div>
    </div>
    <div class="tab-section">
      <h3>Space Assets</h3>
      ${progress < 10 
        ? '<p class="text-muted">Space program is in early stages. Increase space budget to accelerate.</p>'
        : `
          <div class="unit-card">
            <div>
              <div class="unit-name">🛰️ Communication Satellites</div>
              <div class="unit-stats">Fleet: ${Math.floor(progress / 10)} | Status: Active</div>
            </div>
          </div>
          <div class="unit-card">
            <div>
              <div class="unit-name">🔭 Orbital Telescope</div>
              <div class="unit-stats">Research: +${Math.floor(progress / 20)}% tech speed</div>
            </div>
          </div>
        `
      }
    </div>
    <div class="tab-section">
      <h3>Future Initiatives</h3>
      <div class="action-grid" style="grid-template-columns:1fr 1fr">
        <button class="action-btn">🚀 Launch Mission</button>
        <button class="action-btn">🔬 Research Tech</button>
        <button class="action-btn">🌕 Moon Base</button>
        <button class="action-btn">🛰️ Expand Fleet</button>
      </div>
    </div>
    ${progress >= 90 ? `
    <div class="tab-section">
      <button class="btn-nuke" onclick="alert('🚀 MARS MISSION LAUNCHED! Congratulations!')">🚀 Launch Mars Mission</button>
    </div>` : ''}
  `;
}

// ============================================================
// SIDEBAR TOGGLE (Mobile)
// ============================================================
function setupMobileSidebar() {
  // Create toggle buttons if not exist
  let leftToggle = $('#showLeftSidebar');
  let rightToggle = $('#showRightSidebar');

  if (!leftToggle) {
    leftToggle = document.createElement('button');
    leftToggle.id = 'showLeftSidebar';
    leftToggle.textContent = '▶';
    document.getElementById('mapContainer').appendChild(leftToggle);
  }

  if (!rightToggle) {
    rightToggle = document.createElement('button');
    rightToggle.id = 'showRightSidebar';
    rightToggle.textContent = '◀';
    document.getElementById('mapContainer').appendChild(rightToggle);
  }

  leftToggle.addEventListener('click', () => {
    dom.leftSidebar.classList.toggle('mobile-show');
  });

  rightToggle.addEventListener('click', () => {
    dom.rightSidebar.classList.toggle('mobile-show');
  });
}

// ============================================================
// MENU BUTTON
// ============================================================
function setupMenu() {
  $('#menuBtn').addEventListener('click', () => {
    openTab('gov');
  });
}

// ============================================================
// WINDOW RESIZE
// ============================================================
function handleResize() {
  const canvas = dom.worldMap;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  renderMap();
}

// ============================================================
// INITIALIZATION
// ============================================================
function init() {
  cacheDom();
  updateHUD();
  initMap();
  renderNationCard();
  renderLeaderInfo();
  setupSpeedControls();
  setupMapControls();
  setupTabs();
  setupCountryRegistry();
  setupMobileSidebar();
  setupMenu();

  addNews('📌 Welcome to Sovereign State: Global Hegemony', 'minor');
  addNews('📌 Global atlas synchronized with all tracked countries', 'minor');
  addNews('⚡ Strategic overlays updated for military, economic, and resource views', 'major');
  addNews('🔥 Focus any highlighted country on the map or from the registry', 'critical');

  window.addEventListener('resize', handleResize);
  window.clearSelectedNation = clearSelectedNation;

  console.log('🏛️ Sovereign State: Global Hegemony initialized');
  console.log(`📅 ${formatDate(GAME.date)} | Turn ${GAME.turn}`);
}

// Kick off when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
