/**
 * Sovereign State: Global Hegemony
 * A geopolitical simulator
 */

// ============================================================
// GAME STATE
// ============================================================
const GAME = {
  turn: 0,
  speed: 0, // 0 = paused, 1, 2, 5, 10
  running: false,
  timer: null,
  date: new Date(2025, 5, 1), // June 2025

  treasury: 2450, // in millions
  approval: 58,
  threatLevel: 'Low',

  // Budget allocation (percentages)
  budget: {
    military: 30,
    economy: 25,
    diplomacy: 15,
    intelligence: 10,
    space: 10,
    social: 10,
  },

  // Player nation
  playerNation: {
    id: 'usa',
    name: 'United States',
    flag: '🇺🇸',
    leader: 'James Holloway',
    leaderTraits: ['Pragmatist', 'Economist'],
    leaderTerm: '2025–2029',
    gdp: 25.0,
    population: 331,
    militaryPower: 78,
    techLevel: 5.5,
  },

  selectedNation: null, // for viewing other nations
};

// ============================================================
// NATIONS DATA
// ============================================================
const NATIONS = {
  usa: {
    id: 'usa', name: 'United States', flag: '🇺🇸',
    leader: 'James Holloway', traits: ['Pragmatist', 'Economist'],
    gdp: 25.0, population: 331, militaryPower: 78, techLevel: 5.5,
    color: '#4a90d9', x: 0.25, y: 0.45,
    relation: { base: 0, trend: 0 },
  },
  china: {
    id: 'china', name: 'China', flag: '🇨🇳',
    leader: 'Wei Zhang', traits: ['Authoritarian', 'Technocrat'],
    gdp: 18.5, population: 1425, militaryPower: 72, techLevel: 5.2,
    color: '#e74c5e', x: 0.68, y: 0.4,
    relation: { base: -20, trend: -2 },
  },
  russia: {
    id: 'russia', name: 'Russia', flag: '🇷🇺',
    leader: 'Dmitri Volkov', traits: ['Expansionist', 'Strategist'],
    gdp: 2.0, population: 144, militaryPower: 85, techLevel: 4.8,
    color: '#9b59b6', x: 0.55, y: 0.32,
    relation: { base: -35, trend: -3 },
  },
  india: {
    id: 'india', name: 'India', flag: '🇮🇳',
    leader: 'Aarav Patel', traits: ['Nationalist', 'Reformer'],
    gdp: 3.7, population: 1428, militaryPower: 60, techLevel: 4.0,
    color: '#f0c040', x: 0.72, y: 0.48,
    relation: { base: 10, trend: 1 },
  },
  uk: {
    id: 'uk', name: 'United Kingdom', flag: '🇬🇧',
    leader: 'Eleanor Cross', traits: ['Diplomat', 'Traditionalist'],
    gdp: 3.3, population: 67, militaryPower: 55, techLevel: 5.0,
    color: '#4caf80', x: 0.46, y: 0.3,
    relation: { base: 40, trend: 0 },
  },
  germany: {
    id: 'germany', name: 'Germany', flag: '🇩🇪',
    leader: 'Klaus Richter', traits: ['Pragmatist', 'Industrialist'],
    gdp: 4.5, population: 84, militaryPower: 50, techLevel: 5.3,
    color: '#4a90d9', x: 0.48, y: 0.33,
    relation: { base: 35, trend: 0 },
  },
  france: {
    id: 'france', name: 'France', flag: '🇫🇷',
    leader: 'Marie Dubois', traits: ['Diplomat', 'Strategist'],
    gdp: 3.0, population: 65, militaryPower: 48, techLevel: 4.9,
    color: '#4caf80', x: 0.45, y: 0.35,
    relation: { base: 30, trend: 0 },
  },
  japan: {
    id: 'japan', name: 'Japan', flag: '🇯🇵',
    leader: 'Haruto Tanaka', traits: ['Technocrat', 'Traditionalist'],
    gdp: 4.2, population: 125, militaryPower: 35, techLevel: 5.8,
    color: '#e74c5e', x: 0.8, y: 0.38,
    relation: { base: 45, trend: 0 },
  },
  brasil: {
    id: 'brasil', name: 'Brasil', flag: '🇧🇷',
    leader: 'Lucas Silva', traits: ['Populist', 'Environmentalist'],
    gdp: 2.1, population: 216, militaryPower: 30, techLevel: 3.5,
    color: '#4caf80', x: 0.3, y: 0.65,
    relation: { base: 15, trend: 1 },
  },
  saudi: {
    id: 'saudi', name: 'Saudi Arabia', flag: '🇸🇦',
    leader: 'Faisal Al-Rashid', traits: ['Authoritarian', 'Industrialist'],
    gdp: 1.1, population: 36, militaryPower: 45, techLevel: 4.0,
    color: '#f0c040', x: 0.55, y: 0.45,
    relation: { base: 10, trend: -1 },
  },
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

// Dynamic relations between player and other nations
function getRelation(nationId) {
  const n = NATIONS[nationId];
  if (!n) return 0;
  return n.relation.base;
}

function getRelationBadge(score) {
  if (score >= 20) return { text: '🤝 Friendly', cls: 'friendly' };
  if (score <= -20) return { text: '⚔️ Hostile', cls: 'hostile' };
  return { text: '➖ Neutral', cls: 'neutral' };
}

// ============================================================
// DOM REFS
// ============================================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {};

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
}

// ============================================================
// DATE & FORMATTING
// ============================================================
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatDate(date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatMoney(m) {
  if (m >= 1000) return '$' + (m / 1000).toFixed(1) + 'T';
  return '$' + Math.round(m) + 'M';
}

// ============================================================
// UPDATE HUD
// ============================================================
function updateHUD() {
  dom.treasuryVal.textContent = GAME.treasury;
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

  // Update relations drift
  for (const id in NATIONS) {
    const n = NATIONS[id];
    n.relation.base += n.relation.trend + Math.round((Math.random() - 0.5) * 4);
    n.relation.base = Math.max(-100, Math.min(100, n.relation.base));
  }

  // Threat level adjustment
  if (GAME.threatLevel === 'High' && Math.random() < 0.2) GAME.threatLevel = 'Medium';
  else if (GAME.threatLevel === 'Medium' && Math.random() < 0.15) GAME.threatLevel = 'Low';

  updateHUD();
  renderNationCard();
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
let dragStartX, dragStartY;

function initMap() {
  const canvas = dom.worldMap;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  mapCtx = canvas.getContext('2d');
  renderMap();
}

function renderMap() {
  const ctx = mapCtx;
  if (!ctx) return;

  const canvas = dom.worldMap;
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background
  ctx.fillStyle = '#0a0e14';
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(mapOffsetX, mapOffsetY);
  ctx.scale(mapScale, mapScale);

  // Grid lines
  ctx.strokeStyle = 'rgba(42, 51, 70, 0.4)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 10; i++) {
    const x = (i / 10) * w;
    const y = (i / 10) * h;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Draw nations as hex-like shapes
  for (const id in NATIONS) {
    const n = NATIONS[id];
    const cx = n.x * w;
    const cy = n.y * h;

    // Glow effect for player nation
    if (id === 'usa') {
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 20;
    }

    // Draw hex shape
    const r = 25 + (n.militaryPower / 100) * 15 + (n.gdp / 30) * 10;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    // Fill based on layer
    let fillColor = n.color;
    if (currentLayer === 'military') {
      const hue = 0; // red
      const sat = Math.round(n.militaryPower * 1.2);
      const lit = 30 + n.militaryPower * 0.4;
      fillColor = `hsl(${hue}, ${sat}%, ${lit}%)`;
    } else if (currentLayer === 'economic') {
      const hue = 120; // green
      const sat = 60;
      const lit = 20 + (n.gdp / 30) * 40;
      fillColor = `hsl(${hue}, ${sat}%, ${lit}%)`;
    } else if (currentLayer === 'resources') {
      const hue = 40; // yellow
      const sat = 70;
      const lit = 20 + (n.gdp / 30) * 30;
      fillColor = `hsl(${hue}, ${sat}%, ${lit}%)`;
    }

    ctx.fillStyle = fillColor;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Nation label
    ctx.fillStyle = '#e8edf5';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(n.flag, cx, cy - 8);
    ctx.font = '10px sans-serif';
    ctx.fillText(n.name.substring(0, 12), cx, cy + 14);
  }

  ctx.restore();
}

// ============================================================
// MAP CONTROLS
// ============================================================
function setupMapControls() {
  const zoomIn = $('#zoomIn');
  const zoomOut = $('#zoomOut');
  const resetView = $('#resetView');

  zoomIn.addEventListener('click', () => {
    mapScale = Math.min(3, mapScale * 1.3);
    renderMap();
  });

  zoomOut.addEventListener('click', () => {
    mapScale = Math.max(0.3, mapScale * 0.7);
    renderMap();
  });

  resetView.addEventListener('click', () => {
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

  // Drag to pan
  const canvas = dom.worldMap;
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX - mapOffsetX;
    dragStartY = e.clientY - mapOffsetY;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    mapOffsetX = e.clientX - dragStartX;
    mapOffsetY = e.clientY - dragStartY;
    renderMap();
  });

  canvas.addEventListener('mouseup', () => { isDragging = false; });
  canvas.addEventListener('mouseleave', () => { isDragging = false; });

  // Touch drag
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

// ============================================================
// NATION CARD (Left Sidebar)
// ============================================================
function renderNationCard() {
  const p = GAME.playerNation;
  const card = $('#nationCard');
  card.innerHTML = `
    <div class="nation-flag">${p.flag}</div>
    <h2 class="nation-name">${p.name}</h2>
    <p class="nation-leader">President: ${p.leader}</p>
    <div class="nation-stats">
      <div class="stat-row"><span class="stat-label">GDP</span><span class="stat-val">$${p.gdp}T</span></div>
      <div class="stat-row"><span class="stat-label">Population</span><span class="stat-val">${p.population}M</span></div>
      <div class="stat-row"><span class="stat-label">Military</span><span class="stat-val"><span class="bar-fill" style="width:${p.militaryPower}%">${p.militaryPower}</span></span></div>
      <div class="stat-row"><span class="stat-label">Tech Avg</span><span class="stat-val">T${p.techLevel}</span></div>
      <div class="stat-row"><span class="stat-label">Treasury</span><span class="stat-val">$${GAME.treasury}M</span></div>
      <div class="stat-row"><span class="stat-label">Approval</span><span class="stat-val">${GAME.approval}%</span></div>
    </div>
    <div class="nation-actions">
      <button class="btn-sm" onclick="openTab('diplo')">⚔️ Declare War</button>
      <button class="btn-sm" onclick="openTab('econ')">🤝 Trade</button>
      <button class="btn-sm" onclick="openTab('diplo')">✈️ Visit</button>
    </div>
  `;
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
  const p = GAME.playerNation;
  return `
    <div class="tab-section">
      <h3>Administration</h3>
      <div class="leader-portrait" style="font-size:60px">👤</div>
      <p style="text-align:center;font-size:18px;font-weight:700">${p.leader}</p>
      <p style="text-align:center;color:var(--text-secondary)">President of the ${p.name}</p>
      <div class="leader-traits" style="justify-content:center;margin:8px 0">
        ${p.leaderTraits.map(t => `<span class="trait">${t}</span>`).join('')}
      </div>
      <p style="text-align:center;font-size:12px;color:var(--text-muted)">Term: ${p.leaderTerm}</p>
    </div>
    <div class="tab-section">
      <h3>Cabinet Overview</h3>
      <div class="resource-grid">
        <div class="resource-item"><span class="r-name">Treasury</span><span class="r-val">$${GAME.treasury}M</span></div>
        <div class="resource-item"><span class="r-name">Approval</span><span class="r-val ${GAME.approval >= 50 ? 'positive' : 'negative'}">${GAME.approval}%</span></div>
        <div class="resource-item"><span class="r-name">Term Year</span><span class="r-val">${GAME.date.getFullYear()}</span></div>
        <div class="resource-item"><span class="r-name">Turn</span><span class="r-val">${GAME.turn}</span></div>
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
        <div class="resource-item"><span class="r-name">GDP</span><span class="r-val">$${GAME.playerNation.gdp}T</span></div>
        <div class="resource-item"><span class="r-name">Population</span><span class="r-val">${GAME.playerNation.population}M</span></div>
        <div class="resource-item"><span class="r-name">Treasury</span><span class="r-val">$${GAME.treasury}M</span></div>
        <div class="resource-item"><span class="r-name">Tech Level</span><span class="r-val">T${GAME.playerNation.techLevel}</span></div>
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
  const nations = Object.values(NATIONS).filter(n => n.id !== 'usa');

  return `
    <div class="tab-section">
      <h3>Foreign Relations</h3>
      <p class="text-muted mb-1">Relations with other nations</p>
      ${nations.map(n => {
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
      <h3>Diplomatic Actions</h3>
      <div class="action-grid" style="grid-template-columns:1fr 1fr">
        <button class="action-btn">✍️ Sign Treaty</button>
        <button class="action-btn">📦 Send Aid</button>
        <button class="action-btn">🚫 Sanctions</button>
        <button class="action-btn">🤝 Alliance</button>
      </div>
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

  // Close sidebars when clicking on map
  dom.worldMap.addEventListener('click', () => {
    dom.leftSidebar.classList.remove('mobile-show');
    dom.rightSidebar.classList.remove('mobile-show');
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
  setupSpeedControls();
  setupMapControls();
  setupTabs();
  setupMobileSidebar();
  setupMenu();

  // Add initial news
  addNews('📌 Welcome to Sovereign State: Global Hegemony', 'minor');
  addNews('📌 China GDP growth slows to 4.2%', 'minor');
  addNews('⚡ Russia achieves Nuclear Fusion research breakthrough', 'major');
  addNews('🔥 BREAKING: Border conflict erupts between India and Pakistan', 'critical');

  window.addEventListener('resize', handleResize);

  console.log('🏛️ Sovereign State: Global Hegemony initialized');
  console.log(`📅 ${formatDate(GAME.date)} | Turn ${GAME.turn}`);
}

// Kick off when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
