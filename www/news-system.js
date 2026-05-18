// ============================================================
// NEWS SYSTEM (Single Source of Truth)
// ============================================================

const NEWS_CATEGORIES = {
  economy: { label: 'Economy', icon: '💹' },
  war: { label: 'War', icon: '⚔️' },
  weapons: { label: 'Weapons', icon: '🛡️' },
  inflation: { label: 'Inflation', icon: '📈' },
  corporate: { label: 'Corporate', icon: '🏢' },
  diplomacy: { label: 'Diplomacy', icon: '🤝' },
  technology: { label: 'Technology', icon: '🔬' },
  politics: { label: 'Politics', icon: '🏛️' },
  society: { label: 'Society', icon: '👥' },
  environment: { label: 'Environment', icon: '🌍' },
  intelligence: { label: 'Intelligence', icon: '🕵️' },
  general: { label: 'General', icon: '📰' },
};

const NEWS_STATE = {
  items: [],
  nextId: 1,
  maxItems: 250,
  activeFilter: 'all',
  browserFilter: 'all',
  browserSearch: '',
};

function inferNewsCategory(title) {
  const txt = String(title || '').toLowerCase();
  if (/conflict|war|ceasefire|raid|invasion|declare|junta|collapse/.test(txt)) return 'war';
  if (/arms|weapon|defense|military industrial|fighter|missile|tank/.test(txt)) return 'weapons';
  if (/inflation|rates|debt|austerity|stimulus|budget|refinanc/.test(txt)) return 'inflation';
  if (/acquire|merge|buyout|company|corporation|market cap|sales|bankrupt|ipo|public/.test(txt)) return 'corporate';
  if (/trade|econom|gdp|revenue|tax|treasury|stocks|financial/.test(txt)) return 'economy';
  if (/treaty|alliance|sanction|diplomatic|summit/.test(txt)) return 'diplomacy';
  if (/research|tech|fusion|nuclear|innovation|breakthrough/.test(txt)) return 'technology';
  if (/election|president|parliament|government|policy/.test(txt)) return 'politics';
  if (/health|migration|social|jobs|welfare|education/.test(txt)) return 'society';
  if (/climate|carbon|environment|green|renewable/.test(txt)) return 'environment';
  if (/intel|cyber|spy|infiltrat|counter-intel/.test(txt)) return 'intelligence';
  return 'general';
}

function extractActors(title) {
  const txt = String(title || '');
  const versus = txt.match(/([A-Za-z .'-]{3,}) and ([A-Za-z .'-]{3,})/);
  if (versus) return { a: versus[1].trim(), b: versus[2].trim() };
  const to = txt.match(/([A-Za-z .'-]{3,}) to ([A-Za-z .'-]{3,})/);
  if (to) return { a: to[1].trim(), b: to[2].trim() };
  return { a: 'the administration', b: 'regional stakeholders' };
}

function getRandomCompanyExample() {
  if (typeof NATIONS === 'undefined' || !NATIONS) return null;
  const player = Object.values(NATIONS).find(n => !n.failedState && n.companies && n.companies.length > 0);
  if (!player || !player.companies) return null;
  const comp = player.companies[Math.floor(Math.random() * Math.min(3, player.companies.length))];
  return comp || null;
}

function formatPrice(val) {
  if (!Number.isFinite(val)) return '0';
  if (Math.abs(val) >= 1e9) return '$' + (val / 1e9).toFixed(1) + 'B';
  if (Math.abs(val) >= 1e6) return '$' + (val / 1e6).toFixed(1) + 'M';
  if (Math.abs(val) >= 1e3) return '$' + (val / 1e3).toFixed(1) + 'K';
  return '$' + val.toFixed(0);
}

function generateNewsDetails(entry) {
  if (entry.details) return entry.details;

  const actors = extractActors(entry.title);
  const actorA = actors.a;
  const actorB = actors.b;
  const gameState = (typeof GAME !== 'undefined') ? GAME : {};
  const currentTurn = Number.isFinite(gameState.turn) ? gameState.turn : 0;

  if (entry.category === 'war') {
    const conflictCost = Math.floor(Math.random() * 500) + 200;
    const casualty = Math.floor(Math.random() * 5000) + 2000;
    return `Turn ${currentTurn}: Fighting broke out between ${actorA} and ${actorB}. Border tensions finally boiled over into open combat.\n\nWhy it happened: ${actorA} claims resource rights or territory that ${actorB} controls. Both sides have been building up troops for months. Diplomats failed to broker a deal.\n\nWhat's happening now: Soldiers are clashing along the border. At least ${casualty.toLocaleString()} people have been killed or wounded. The fighting has already cost both nations roughly $${conflictCost}M in military spending.\n\nWhat it means: War is expensive. Both economies will slow down as resources get diverted to the military. Stock markets dropped 8-12% on the news. If this goes on for many turns, expect shortages of goods, higher inflation, and real suffering for ordinary people.`;
  }

  if (entry.category === 'corporate') {
    const exComp = getRandomCompanyExample();
    const oldPrice = Math.floor(Math.random() * 150) + 50;
    const newPrice = Math.floor(Math.random() * 250) + 100;
    const priceChange = ((newPrice - oldPrice) / oldPrice * 100).toFixed(1);
    const buyoutVal = Math.floor(newPrice * 1.3);
    return `Turn ${currentTurn}: Major corporate news shook markets today.\n\nWhat happened: ${exComp?.name || 'A major tech company'} was acquired by a rival for $${buyoutVal}M. Before the deal, the stock was trading at $${oldPrice} per share. After today's announcement, it jumped to $${newPrice}—that's a ${priceChange}% gain.\n\nWhy: The buyer wanted ${exComp?.name || 'the company'}'s technology and customer base. Instead of competing, they decided to buy out the competition. This happens a lot when smaller companies can't keep up.\n\nWhat it means for you: Shareholders made money fast. Workers at the losing company might worry about layoffs as the buyer cuts duplicate roles. The merged company will be bigger and stronger, but less competitive choice in the market. Prices for consumers could go up.`;
  }

  if (entry.category === 'inflation') {
    const inflationRate = (Math.random() * 6 + 2).toFixed(1);
    const householdImpact = Math.floor(Math.random() * 3000) + 1000;
    const treasuryHit = Math.floor(Math.random() * 200) + 100;
    return `Turn ${currentTurn}: Your government's chief economist just released new numbers, and they're not great.\n\nThe problem: Prices are rising fast. Inflation hit ${inflationRate}% this turn—that means everything costs more. Rent, food, gas, clothes. A shopping cart that cost $100 last month now costs $${(100 * (1 + parseFloat(inflationRate) / 100)).toFixed(0)}.\n\nWhy it's happening: Supply chain bottlenecks, rising wages, and too much money chasing too few goods. When wars or crises disrupt production, prices spike.\n\nWhat it means: People are getting poorer in real terms. A family earning $50,000 a year effectively earned $${(50000 - householdImpact).toLocaleString()} after inflation this turn. The government's budget gets squeezed too—your treasury loses about $${treasuryHit}M in buying power even though the number stays the same. People get angry. Approval ratings drop. Expect protests and demands for wage increases.`;
  }

  if (entry.category === 'economy') {
    const gdpGrowth = ((Math.random() * 4) - 2).toFixed(2);
    const gdpNum = Math.floor(Math.random() * 5000) + 2000;
    const trend = parseFloat(gdpGrowth) > 0 ? 'up' : 'down';
    const employment = Math.floor(Math.random() * 300000) + 100000;
    return `Turn ${currentTurn}: New economic data came in today.\n\nThe headline: GDP grew (or shrank) by ${gdpGrowth}%. Your nation produced about $${gdpNum}B worth of goods and services this turn.\n\nBreaking it down: ${trend === 'up' ? 'Manufacturing is humming along. Consumer spending is strong. Businesses are hiring.' : 'Manufacturing is sluggish. People are saving money instead of spending it. Businesses are cutting staff.'} About ${employment.toLocaleString()} new jobs were created (or lost) this month.\n\nWhy it matters: If the economy is growing, people feel richer, unemployment drops, and tax revenue goes up. If it's shrinking, people cut back on spending, more go jobless, and government revenue drops—all while people demand more social programs.\n\nLooking ahead: Economists predict the trend will ${trend === 'up' ? 'continue unless a shock hits' : 'reverse if stimulus kicks in'}. Markets are watching to see what the central bank does next.`;
  }

  if (entry.category === 'weapons') {
    const weaponBudget = Math.floor(Math.random() * 300) + 150;
    const unitCost = Math.floor(Math.random() * 50) + 20;
    const unitsOrdered = Math.floor(weaponBudget / unitCost);
    return `Turn ${currentTurn}: Your military just announced a big procurement deal.\n\nThe announcement: The armed forces are buying new equipment. The contract is worth $${weaponBudget}M. They're ordering ${unitsOrdered} new fighter jets, tanks, or whatever the need is at an average cost of $${unitCost}M per unit.\n\nWhy now: The military says older gear is wearing out and adversaries are getting new tech. They need to modernize to stay competitive.\n\nThe catch: This money comes out of the budget. That's $${weaponBudget}M that can't go to schools, hospitals, or infrastructure. Contractors and military suppliers will see business boom—their stocks might jump 5-10%. But your treasury shrinks by that amount.\n\nWhat happens next: These weapons will take time to build and deliver. When they arrive, your military strength improves. But for now, you're just poorer and the jobs mostly go to defense contractors, not the average worker.`;
  }

  if (entry.category === 'technology') {
    const investmentVal = Math.floor(Math.random() * 200) + 100;
    const breakthroughType = ['AI', 'renewable energy', 'quantum computing', 'nuclear fusion', 'biotech', 'space exploration'][Math.floor(Math.random() * 6)];
    return `Turn ${currentTurn}: A major technological breakthrough was announced today.\n\nWhat happened: Scientists achieved a significant breakthrough in ${breakthroughType}. Your nation is investing $${investmentVal}M in this new research to stay ahead of competitors.\n\nWhy it matters: Technology is how nations stay competitive. Better tech means better products, which means exports, jobs, and wealth. Countries that lead in AI, energy, or space will dominate trade for the next decade.\n\nThe reality check: Breakthroughs take time to turn into actual products and profits. This news is great for long-term growth, but you won't see the payoff for several turns. In the meantime, your competitors are also investing in the same tech, so staying ahead requires constant, expensive R&D.\n\nMarket reaction: Tech stocks jumped 4-6% on the news. Investors see potential profits down the road, even if they have to wait.`;
  }

  if (entry.category === 'diplomacy') {
    const dealValue = Math.floor(Math.random() * 150) + 50;
    return `Turn ${currentTurn}: Diplomats inked a new deal today.\n\nThe agreement: ${actorA} and ${actorB} just signed a treaty. Could be a trade agreement, a military alliance, or just a pledge to stay out of each other's business. The deal is worth about $${dealValue}M in estimated benefits.\n\nWhat's in it: Usually a trade deal means lower tariffs and easier business between the two countries. A military alliance means promising to help in a fight. Either way, both nations think they come out ahead.\n\nThe gamble: Alliances can drag you into wars you don't want. Trade deals can hurt domestic industries that can't compete with imports. But the upside is friendship, trade revenue, and strategic advantage.\n\nMarkets liked it: Stocks of companies that export to the other country jumped because they'll face fewer barriers. Currency traders pushed up the value of both nations' currencies—investors think peace and trade are good for the economy.`;
  }

  if (entry.category === 'politics') {
    const approvalChange = Math.floor(Math.random() * 20) - 10;
    const protestors = Math.floor(Math.random() * 100000) + 50000;
    return `Turn ${currentTurn}: Political upheaval is shaking the nation.\n\nWhat happened: A scandal, election, or major policy shift has people talking. Public opinion is shifting. Approval ratings moved by about ${Math.abs(approvalChange)}% ${approvalChange > 0 ? 'up' : 'down'}.\n\nThe details: Leadership is either gaining confidence from voters (maybe they handled a crisis well) or losing it (scandal, broken promises, economic pain). About ${protestors.toLocaleString()} people are actively engaged—some protesting, others rallying in support.\n\nWhy it matters: Politics affects everything. A popular leader can pass unpopular but necessary reforms. An unpopular one gets blocked at every turn, no matter how good the idea. Investors watch approval ratings closely—they want stability and competent leadership.\n\nWhat's next: If approval is falling, expect strikes, protests, and gridlock. If it's rising, the leader has a window to push through controversial decisions. Elections might be coming.`;
  }

  if (entry.category === 'society') {
    const unemploymentChange = (Math.random() * 4 - 2).toFixed(1);
    const wageChange = (Math.random() * 8 - 2).toFixed(1);
    return `Turn ${currentTurn}: Social conditions just changed.\n\nWhat's happening: Unemployment moved ${Math.abs(unemploymentChange)}% ${parseFloat(unemploymentChange) > 0 ? 'up' : 'down'}. Wages are changing too—average worker pay shifted by ${wageChange}% ${parseFloat(wageChange) > 0 ? 'up' : 'down'}.\n\nThe reality: When unemployment is high, people are desperate. Crime goes up, homelessness grows, and depression spreads. When unemployment is low, workers have power—they can demand raises and better conditions.\n\nEconomic impact: Higher wages are great for workers but bad for business profit margins. Companies might cut hours, raise prices, or lay people off. It's a balancing act. Too much wage growth causes inflation. Too little causes unrest.\n\nWhat to watch: If unemployment is rising while wages are stagnant, people are suffering. Expect declining approval and potential civil unrest. If both are rising, the economy is heating up—good times now, but inflation risk looming.`;
  }

  if (entry.category === 'environment') {
    const climateRisk = Math.floor(Math.random() * 60) + 20;
    const disasterCost = Math.floor(Math.random() * 200) + 100;
    return `Turn ${currentTurn}: Environmental news made headlines today.\n\nThe issue: Climate risk increased. Scientists say conditions are degrading at a rate of about ${climateRisk}% per cycle if nothing changes. Extreme weather events are becoming more frequent and costly.\n\nWhat this means: Farming becomes harder. Droughts, floods, and hurricanes hurt agriculture. Insurance costs rise. Tourism might suffer. Refugees from climate-hit regions try to migrate to safer areas, causing border tensions.\n\nFinancial impact: A major disaster just caused about $${disasterCost}M in damage. That's money that has to come out of the budget for rebuilding instead of schools and hospitals. Over time, climate damage compounds and slows economic growth.\n\nThe long game: Investing in renewable energy and climate resilience costs money now but saves much more later. Countries that ignore climate risks will find themselves poorer, less stable, and less attractive to investors in the long run.`;
  }

  if (entry.category === 'intelligence') {
    const threatLevel = ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)];
    const cost = Math.floor(Math.random() * 150) + 50;
    return `Turn ${currentTurn}: Intelligence agencies just briefed leadership.\n\nThe threat: Threat level is assessed at ${threatLevel}. Spies, cyber attackers, or terrorist groups are active. The government is spending about $${cost}M on intelligence and counter-intelligence operations.\n\nWhat they're doing: Signals intelligence (tapping communications), human intelligence (spies), and cyber defense are all running 24/7. The goal is to stop attacks before they happen.\n\nThe trade-off: Privacy vs. security. The more money spent on spying, the more threats get caught—but also the more citizens get spied on. People don't like it, but they like terrorist attacks even less.\n\nReality check: Most intelligence work prevents nothing you ever hear about. That's the point. But when something does happen, people blame the intelligence agencies for not catching it. It's a thankless job that's also expensive.`;
  }

  return `Turn ${currentTurn}: ${entry.title}\n\nWhat happened: A significant event just unfolded. Details are still coming in, but it's likely to have ripple effects across the economy and geopolitics.\n\nWhy it matters: Every event in the world moves markets, changes people's confidence, and can start chain reactions. Even small changes add up over time.\n\nWhat to watch: Pay attention to follow-up reports over the next few turns to see how this plays out. Markets overreact sometimes, so opportunities might appear if you keep your eyes open.`;
}

function normalizeNewsInput(input, type, options) {
  const raw = typeof input === 'string' ? { title: input, type, ...(options || {}) } : { ...(input || {}) };
  const title = String(raw.title || raw.headline || 'World development update');
  const category = raw.category || inferNewsCategory(title);
  const severity = raw.type || type || 'minor';
  const item = {
    id: NEWS_STATE.nextId++,
    title,
    type: severity,
    category,
    details: raw.details || '',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    turn: (typeof GAME !== 'undefined' && Number.isFinite(GAME.turn)) ? GAME.turn : 0,
    timestamp: Date.now(),
  };
  item.details = generateNewsDetails(item);
  return item;
}

function formatNewsTime(item) {
  if (typeof formatDate === 'function' && typeof GAME !== 'undefined' && GAME.date) return formatDate(GAME.date);
  const d = new Date(item.timestamp || Date.now());
  return d.toLocaleDateString();
}

function getNewsItems(filter = NEWS_STATE.activeFilter) {
  if (!filter || filter === 'all') return NEWS_STATE.items;
  return NEWS_STATE.items.filter(item => item.category === filter);
}

function getNewsItemsForBrowser() {
  const filter = NEWS_STATE.browserFilter || 'all';
  const q = String(NEWS_STATE.browserSearch || '').trim().toLowerCase();
  let list = !filter || filter === 'all'
    ? NEWS_STATE.items
    : NEWS_STATE.items.filter(item => item.category === filter);

  if (!q) return list;
  return list.filter(item => {
    return String(item.title || '').toLowerCase().includes(q)
      || String(item.details || '').toLowerCase().includes(q)
      || String(item.category || '').toLowerCase().includes(q)
      || String(item.type || '').toLowerCase().includes(q);
  });
}

function rerenderNewsBrowserIfOpen() {
  if (typeof GAME === 'undefined' || GAME.activeTab !== 'news') return;
  if (typeof dom === 'undefined' || !dom.tabOverlay || dom.tabOverlay.classList.contains('hidden')) return;
  if (typeof renderTabContent === 'function') renderTabContent('news');
}

function getNewsStats() {
  const stats = { total: NEWS_STATE.items.length };
  Object.keys(NEWS_CATEGORIES).forEach(cat => { stats[cat] = 0; });
  NEWS_STATE.items.forEach(item => {
    stats[item.category] = (stats[item.category] || 0) + 1;
  });
  return stats;
}

function openNewsStory(id) {
  const item = NEWS_STATE.items.find(n => n.id === id);
  if (!item) return;

  let modal = document.getElementById('newsStoryModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'newsStoryModal';
    modal.className = 'news-story-modal hidden';
    modal.innerHTML = '<div class="news-story-card"><div class="news-story-head"><h3 id="newsStoryTitle"></h3><button id="newsStoryClose" class="icon-btn">✕</button></div><div id="newsStoryMeta" class="news-story-meta"></div><div id="newsStoryBody" class="news-story-body"></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
    const close = document.getElementById('newsStoryClose');
    if (close) close.addEventListener('click', () => modal.classList.add('hidden'));
  }

  const cat = NEWS_CATEGORIES[item.category] || NEWS_CATEGORIES.general;
  const titleEl = document.getElementById('newsStoryTitle');
  const metaEl = document.getElementById('newsStoryMeta');
  const bodyEl = document.getElementById('newsStoryBody');
  if (titleEl) titleEl.textContent = `${cat.icon} ${item.title}`;
  if (metaEl) metaEl.innerHTML = `<span class="news-pill ${item.type}">${item.type.toUpperCase()}</span><span class="news-pill category">${cat.label}</span><span class="news-story-time">${formatNewsTime(item)} • Turn ${item.turn}</span>`;
  if (bodyEl) {
    bodyEl.textContent = item.details;
    bodyEl.style.whiteSpace = 'pre-wrap';
  }

  modal.classList.remove('hidden');
}

function renderNewsTicker() {
  if (typeof dom === 'undefined' || !dom.newsTicker || !dom.newsCount) return;

  const stats = getNewsStats();
  const filtered = getNewsItems();

  let html = '<div class="news-filter-row">';
  html += `<button class="news-filter-btn ${NEWS_STATE.activeFilter === 'all' ? 'active' : ''}" data-news-filter="all">All (${stats.total})</button>`;
  ['economy','war','weapons','inflation','corporate','technology'].forEach(cat => {
    const meta = NEWS_CATEGORIES[cat];
    html += `<button class="news-filter-btn ${NEWS_STATE.activeFilter === cat ? 'active' : ''}" data-news-filter="${cat}">${meta.icon} ${meta.label} (${stats[cat] || 0})</button>`;
  });
  html += '</div>';

  html += '<div class="news-feed-list">';
  if (filtered.length === 0) {
    html += '<p class="text-muted" style="padding:8px">No reports in this section yet.</p>';
  } else {
    html += filtered.slice(0, 60).map(item => {
      const cat = NEWS_CATEGORIES[item.category] || NEWS_CATEGORIES.general;
      return `<button class="news-item ${item.type} news-entry" data-news-id="${item.id}"><span class="news-entry-top"><span class="news-cat">${cat.icon} ${cat.label}</span><span class="news-time">T${item.turn}</span></span><span class="news-entry-title">${item.title}</span><span class="news-entry-preview">${item.details.slice(0, 120)}...</span></button>`;
    }).join('');
  }
  html += '</div>';

  dom.newsTicker.innerHTML = html;
  dom.newsCount.textContent = stats.total;

  dom.newsTicker.querySelectorAll('[data-news-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      NEWS_STATE.activeFilter = btn.dataset.newsFilter || 'all';
      renderNewsTicker();
    });
  });

  dom.newsTicker.querySelectorAll('[data-news-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.newsId);
      if (Number.isFinite(id)) openNewsStory(id);
    });
  });
}

function addNews(input, type = 'minor', options = undefined) {
  const item = normalizeNewsInput(input, type, options);
  NEWS_STATE.items.unshift(item);
  if (NEWS_STATE.items.length > NEWS_STATE.maxItems) NEWS_STATE.items.length = NEWS_STATE.maxItems;
  renderNewsTicker();
  rerenderNewsBrowserIfOpen();
  return item;
}

function renderNewsBrowserTab() {
  const stats = getNewsStats();
  const list = getNewsItemsForBrowser();

  let html = '<div class="tab-section">';
  html += '<h3>World News Browser</h3>';
  html += '<p class="text-muted mb-1">Browse all events and reports across the simulation timeline.</p>';
  html += '<div class="news-browser-toolbar">';
  html += `<input class="news-search-input" id="newsBrowserSearch" type="text" placeholder="Search headlines, categories, details..." value="${String(NEWS_STATE.browserSearch || '').replace(/"/g, '&quot;')}">`;
  html += '<div class="news-browser-filters">';
  html += `<button class="news-filter-btn ${NEWS_STATE.browserFilter === 'all' ? 'active' : ''}" data-news-browser-filter="all">All (${stats.total})</button>`;
  Object.keys(NEWS_CATEGORIES).forEach(cat => {
    const meta = NEWS_CATEGORIES[cat];
    html += `<button class="news-filter-btn ${NEWS_STATE.browserFilter === cat ? 'active' : ''}" data-news-browser-filter="${cat}">${meta.icon} ${meta.label} (${stats[cat] || 0})</button>`;
  });
  html += '</div></div>';
  html += '</div>';

  html += '<div class="tab-section">';
  html += `<h3>Timeline Feed (${list.length})</h3>`;
  html += '<div class="news-browser-feed">';
  if (list.length === 0) {
    html += '<p class="text-muted">No events match this filter.</p>';
  } else {
    html += list.map(item => {
      const cat = NEWS_CATEGORIES[item.category] || NEWS_CATEGORIES.general;
      return `<button class="news-item ${item.type} news-browser-entry" data-news-id="${item.id}"><span class="news-entry-top"><span class="news-cat">${cat.icon} ${cat.label}</span><span class="news-time">${formatNewsTime(item)} • T${item.turn}</span></span><span class="news-entry-title">${item.title}</span><span class="news-entry-preview">${item.details.slice(0, 210)}...</span></button>`;
    }).join('');
  }
  html += '</div></div>';

  return html;
}

function attachNewsBrowserListeners(root) {
  if (!root) return;

  root.querySelectorAll('[data-news-browser-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      NEWS_STATE.browserFilter = btn.dataset.newsBrowserFilter || 'all';
      rerenderNewsBrowserIfOpen();
    });
  });

  const search = root.querySelector('#newsBrowserSearch');
  if (search) {
    search.addEventListener('input', () => {
      NEWS_STATE.browserSearch = String(search.value || '').slice(0, 120);
      rerenderNewsBrowserIfOpen();
    });
  }

  root.querySelectorAll('[data-news-id]').forEach(node => {
    node.addEventListener('click', () => {
      const id = Number(node.dataset.newsId);
      if (Number.isFinite(id)) openNewsStory(id);
    });
  });
}

function renderNewsCenter(limit = 80) {
  const stats = getNewsStats();
  const groups = {};
  Object.keys(NEWS_CATEGORIES).forEach(cat => { groups[cat] = []; });
  NEWS_STATE.items.slice(0, limit).forEach(item => {
    groups[item.category] = groups[item.category] || [];
    groups[item.category].push(item);
  });

  let html = '<div class="tab-section"><h3>World News Command Center</h3>';
  html += '<div class="resource-grid" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))">';
  html += `<div class="resource-item"><span class="r-name">Total Reports</span><span class="r-val">${stats.total}</span></div>`;
  ['economy','war','weapons','inflation','corporate','technology','diplomacy'].forEach(cat => {
    const meta = NEWS_CATEGORIES[cat];
    html += `<div class="resource-item"><span class="r-name">${meta.icon} ${meta.label}</span><span class="r-val">${stats[cat] || 0}</span></div>`;
  });
  html += '</div></div>';

  html += '<div class="tab-section"><h3>Sectioned Feed (Clickable)</h3>';
  html += '<div class="news-center-grid">';
  ['war','economy','corporate','weapons','inflation','technology','diplomacy','politics'].forEach(cat => {
    const meta = NEWS_CATEGORIES[cat];
    const list = groups[cat] || [];
    html += `<div class="news-center-card"><h4>${meta.icon} ${meta.label} (${list.length})</h4>`;
    if (list.length === 0) {
      html += '<p class="text-muted">No reports yet.</p>';
    } else {
      html += list.slice(0, 8).map(item =>
        `<button class="news-item ${item.type} news-center-entry" data-news-id="${item.id}"><strong>${item.title}</strong><span>${item.details.slice(0, 150)}...</span></button>`
      ).join('');
    }
    html += '</div>';
  });
  html += '</div></div>';

  return html;
}

function attachNewsCenterListeners(root) {
  if (!root) return;
  root.querySelectorAll('[data-news-id]').forEach(node => {
    node.addEventListener('click', () => {
      const id = Number(node.dataset.newsId);
      if (Number.isFinite(id)) openNewsStory(id);
    });
  });
}

function refreshNewsUi() {
  renderNewsTicker();
}

window.addNews = addNews;
window.renderNews = renderNewsTicker;
window.openNewsStory = openNewsStory;
window.renderNewsCenter = renderNewsCenter;
window.attachNewsCenterListeners = attachNewsCenterListeners;
window.renderNewsBrowserTab = renderNewsBrowserTab;
window.attachNewsBrowserListeners = attachNewsBrowserListeners;
window.getNewsItems = getNewsItems;
window.refreshNewsUi = refreshNewsUi;
window.NEWS_CATEGORIES = NEWS_CATEGORIES;
