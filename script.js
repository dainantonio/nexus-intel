// --- CONFIGURATION & MAPPING ---
const COMPANY_MAP = {
    'nvidia': { symbol: 'NVDA', name: 'NVIDIA Corp' },
    'microsoft': { symbol: 'MSFT', name: 'Microsoft' },
    'openai': { symbol: 'MSFT', name: 'Microsoft (OpenAI)' },
    'google': { symbol: 'GOOGL', name: 'Alphabet Inc' },
    'gemini': { symbol: 'GOOGL', name: 'Alphabet Inc' },
    'meta': { symbol: 'META', name: 'Meta Platforms' },
    'apple': { symbol: 'AAPL', name: 'Apple Inc' },
    'amazon': { symbol: 'AMZN', name: 'Amazon.com' },
    'aws': { symbol: 'AMZN', name: 'Amazon AWS' },
    'amd': { symbol: 'AMD', name: 'Adv Micro Dev' },
    'intel': { symbol: 'INTC', name: 'Intel Corp' },
    'tsmc': { symbol: 'TSM', name: 'Taiwan Semi' },
    'palantir': { symbol: 'PLTR', name: 'Palantir Tech' },
    'oracle': { symbol: 'ORCL', name: 'Oracle Corp' },
    'tesla': { symbol: 'TSLA', name: 'Tesla Inc' },
    'deepseek': { symbol: 'BABA', name: 'DeepSeek (via Peers)' }
};

// --- BACKUP FEED (SAFE FALLBACK) ---
// Uses Verified Real URLs to prevent 404s if APIs fail
let curatedNews = [
    { 
        id: 1, 
        source: "Reuters", 
        category: "AI", 
        time: "Fallback", 
        title: "Ilya Sutskever's SSI raises $1B for safe superintelligence", 
        summary: "The OpenAI co-founder's new venture, Safe Superintelligence Inc., has secured massive funding to pursue pure research.", 
        implication: "Major capital flowing into pure-play safety labs.", 
        sentiment: "pos", 
        impact: 95,
        url: "https://www.reuters.com/technology/artificial-intelligence/openai-co-founder-sutskever-raises-1-billion-safety-focused-ai-startup-2024-09-04/" 
    },
    { 
        id: 2, 
        source: "Bloomberg", 
        category: "Data Center", 
        time: "Fallback", 
        title: "Amazon acquires nuclear-powered data center campus", 
        summary: "AWS has purchased a data center campus from Talen Energy located adjacent to the Susquehanna nuclear power plant.", 
        implication: "Direct-connect nuclear power is the new standard.", 
        sentiment: "pos", 
        impact: 92,
        url: "https://www.datacenterfrontier.com/energy/article/55141639/amazon-acquires-talen-energys-nuclear-data-center-campus" 
    },
    { 
        id: 3, 
        source: "DeepSeek", 
        category: "AI", 
        time: "Fallback", 
        title: "DeepSeek-V3 Released: Open Source MoE", 
        summary: "New open model claims parity with top closed models at fraction of cost.", 
        implication: "Open source commoditization accelerating.", 
        sentiment: "pos", 
        impact: 98,
        url: "https://api-docs.deepseek.com/news/news1226" 
    }
];

const startups = [
    { id: 1, name: "Safe Superintelligence", ticker: "SSI", stage: "Series A", raised: "$1.0B", nexusScore: 99, sector: "AGI", desc: "Pure-play AI safety lab founded by Ilya Sutskever.", velocity: "high" },
    { id: 2, name: "DeepSeek", ticker: "DPS K", stage: "Private", raised: "N/A", nexusScore: 96, sector: "Models", desc: "Open-weights champion challenging US labs.", velocity: "high" },
    { id: 3, name: "Physical Intelligence", ticker: "PI", stage: "Seed", raised: "$400M", nexusScore: 94, sector: "Robotics", desc: "Foundation models for physical world interaction.", velocity: "med" },
    { id: 4, name: "Black Forest Labs", ticker: "FLUX", stage: "Seed", raised: "$31M", nexusScore: 88, sector: "Media", desc: "State-of-the-art generative image models.", velocity: "high" },
    { id: 5, name: "Cradle", ticker: "BIO", stage: "Series B", raised: "$73M", nexusScore: 85, sector: "Bio", desc: "Generative protein design and biology.", velocity: "med" },
];

const globalIntel = [
    { region: "US", event: "Export Control Expansion (China/UAE)" },
    { region: "EU", event: "AI Act: High-Risk Classification" },
    { region: "CN", event: "DeepSeek V3 Open Source Release" },
    { region: "UAE", event: "MGX Sovereign Fund Deployment" }
];

let marketData = [
    { symbol: 'NVDA', name: 'NVIDIA Corp', price: 142.50, change: 2.45, prevPrice: 140.05 },
    { symbol: 'PLTR', name: 'Palantir', price: 62.40, change: 1.20, prevPrice: 61.20 },
    { symbol: 'MSFT', name: 'Microsoft', price: 415.00, change: -0.5, prevPrice: 415.50 },
    { symbol: 'GOOGL', name: 'Alphabet', price: 190.20, change: 1.1, prevPrice: 189.10 }
];

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initMap();
    loadSettings(); 
    loadNewsFeed(); 
    renderStartups(startups);
    renderGlobalIntel();
    startClock();
    initImpactChart();
    
    setInterval(updateMarketData, 5000); 
});

// --- ALERT SYSTEM ---
function pushAlert(title, message, type='neutral') {
    const list = document.getElementById('alertsList');
    // Clear "No active alerts" if present
    if(list.innerText.includes("No active alerts")) list.innerHTML = '';
    
    const colors = { error: '#ff4757', success: '#00ff9d', neutral: '#0095ff' };
    const icon = type === 'error' ? 'alert-triangle' : type === 'success' ? 'check-circle' : 'info';
    
    const html = `
    <div class="alert-item" style="animation: fadeIn 0.3s ease;">
        <i data-lucide="${icon}" class="alert-icon" style="color:${colors[type]}"></i>
        <div class="alert-content">
            <h4>${title}</h4>
            <p>${message}</p>
            <div class="alert-time">Just now</div>
        </div>
    </div>`;
    
    list.innerHTML = html + list.innerHTML;
    lucide.createIcons();
    
    // Show dot
    document.getElementById('alertDot').style.display = 'block';
}

// --- NEWS LOGIC (UPDATED WITH GUARDIAN) ---
async function loadNewsFeed() {
    const guardianKey = localStorage.getItem('nexus_key_guardian');
    const gnewsKey = localStorage.getItem('nexus_key_gnews');
    const newsApiKey = localStorage.getItem('nexus_key_newsapi');

    let success = false;

    // PRIORITY 1: THE GUARDIAN (Best for Browsers)
    if (guardianKey && !success) {
        success = await fetchGuardian(guardianKey);
        if(!success) pushAlert("Guardian API Failed", "Check key or quota. Trying next source...", "error");
    }
    
    // PRIORITY 2: GNEWS
    if (gnewsKey && !success) {
        success = await fetchGNews(gnewsKey);
        if(!success) pushAlert("GNews API Failed", "Check key or quota. Trying next source...", "error");
    }

    // PRIORITY 3: NEWSAPI (Often blocked by CORS in browser)
    if (newsApiKey && !success) {
        success = await fetchNewsAPI(newsApiKey);
        if(!success) pushAlert("NewsAPI Failed", "Likely blocked by browser (CORS). Use Guardian or GNews.", "error");
    }

    // FALLBACK
    if (!success) {
        console.log("Using backup feed (Verified Links).");
        if(guardianKey || gnewsKey || newsApiKey) {
             pushAlert("System Offline", "All API connections failed. Displaying cached/backup intel.", "neutral");
        } else {
             pushAlert("Welcome", "No API keys configured. Running in simulation mode.", "neutral");
        }
        renderFeed(curatedNews);
        updateBrief(curatedNews);
        scanNewsForTickers(curatedNews); 
        renderMarketWatch();
    }
}

async function fetchGuardian(apiKey) {
    try {
        const query = "artificial intelligence OR nvidia OR openai OR data center";
        const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&show-fields=trailText,thumbnail&api-key=${apiKey}`;
        
        const res = await fetch(url);
        if(!res.ok) throw new Error(res.status);
        const data = await res.json();
        
        const articles = data.response.results.map((art, idx) => ({
            id: idx + 300,
            source: "The Guardian",
            category: inferCategory(art.webTitle),
            time: new Date(art.webPublicationDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
            title: art.webTitle,
            summary: art.fields?.trailText || "No summary available",
            implication: "Live Guardian Intel. Analysis pending...",
            sentiment: "neu",
            url: art.webUrl,
            impact: 85
        }));
        
        renderFeed(articles);
        updateBrief(articles);
        scanNewsForTickers(articles);
        pushAlert("System Online", "Guardian feed established successfully.", "success");
        return true;
    } catch(e) {
        console.error("Guardian Error:", e);
        return false;
    }
}

async function fetchGNews(apiKey) {
    try {
        const query = '"Artificial Intelligence" OR "Data Center" OR "AI Policy"';
        const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&sortby=publishedAt&apikey=${apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();

        if (data.articles) {
            const articles = data.articles.map((art, index) => ({
                id: index + 200,
                source: art.source.name,
                category: inferCategory(art.title + " " + art.description),
                time: new Date(art.publishedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                title: art.title,
                summary: art.description || "No summary available.",
                implication: "Live GNews Intel. Analysis pending...",
                sentiment: Math.random() > 0.5 ? 'pos' : 'neu',
                url: art.url,
                impact: Math.floor(Math.random() * 30) + 70
            }));

            renderFeed(articles);
            updateBrief(articles);
            scanNewsForTickers(articles);
            pushAlert("System Online", "GNews feed established successfully.", "success");
            return true;
        }
        return false;
    } catch (e) {
        console.error("GNews Fetch Failed:", e);
        return false;
    }
}

async function fetchNewsAPI(apiKey) {
    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q="Artificial Intelligence" OR "Data Center" OR "AI Policy"&sortBy=publishedAt&language=en&apiKey=${apiKey}`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();

        if(data.status === 'ok') {
            const articles = data.articles.slice(0, 20).map((art, index) => ({
                id: index + 100,
                source: art.source.name,
                category: inferCategory(art.title + " " + art.description),
                time: new Date(art.publishedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                title: art.title,
                summary: art.description || "No summary available.",
                implication: "Live NewsAPI Intel. Analysis pending...", 
                sentiment: Math.random() > 0.5 ? 'pos' : 'neu', 
                url: art.url, 
                impact: Math.floor(Math.random() * 30) + 70 
            }));
            
            renderFeed(articles);
            updateBrief(articles);
            scanNewsForTickers(articles);
            pushAlert("System Online", "NewsAPI feed established successfully.", "success");
            return true;
        }
        return false;
    } catch (e) {
        console.error("NewsAPI Error:", e);
        return false;
    }
}

function inferCategory(text) {
    const t = (text || "").toLowerCase();
    if (t.includes('data center') || t.includes('nvidia') || t.includes('chip') || t.includes('compute') || t.includes('cooling')) return "Data Center";
    if (t.includes('policy') || t.includes('regulation') || t.includes('law') || t.includes('ban') || t.includes('eu') || t.includes('congress')) return "Policy";
    return "AI";
}

// --- RENDER FEED ---
function renderFeed(data) {
    const container = document.getElementById('feedContainer');
    const sortedData = [...data].sort((a, b) => b.impact - a.impact);
    const isGrid = document.body.classList.contains('grid-layout');
    container.className = isGrid ? 'grid-view-active' : '';

    const getColor = (cat) => {
        if (cat === 'Data Center') return 'var(--accent-orange)';
        if (cat === 'AI') return 'var(--accent-blue)';
        if (cat === 'Policy') return 'var(--accent-red)';
        return 'var(--accent-green)';
    };

    container.innerHTML = sortedData.map(item => `
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="feed-card">
            <div class="feed-viz" style="background:${getColor(item.category)}"></div>
            <div class="feed-main">
                <div class="feed-top">
                    <div>
                        <span class="feed-cat-tag" style="color:${getColor(item.category)}">${item.category.toUpperCase()}</span>
                        <span class="feed-source">${item.source}</span>
                    </div>
                    <span style="font-family:var(--font-mono)">${item.time}</span>
                </div>
                <h3 class="feed-title">${item.title}</h3>
                <p class="feed-body">${item.summary}</p>
                <div class="ai-pill"><i data-lucide="bot"></i> INTELLIGENCE: ${item.implication}</div>
            </div>
        </a>
    `).join('');
    lucide.createIcons();
}

function updateBrief(data) {
    const topItem = data.sort((a, b) => b.impact - a.impact)[0];
    const secondItem = data.sort((a, b) => b.impact - a.impact)[1];
    
    if (topItem && secondItem) {
        document.getElementById('briefPoints').innerHTML = `
            <div class="brief-point"><i data-lucide="arrow-right"></i> <span>${topItem.implication}</span></div>
            <div class="brief-point"><i data-lucide="arrow-right"></i> <span>${secondItem.implication}</span></div>
        `;
    }
}

function filterFeed(category, el) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    if(el) el.classList.add('active');
    
    const cards = document.querySelectorAll('.feed-card');
    cards.forEach(card => {
        const catTag = card.querySelector('.feed-cat-tag').innerText;
        if (category === 'All' || catTag === category.toUpperCase()) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function renderStartups(data) {
    const container = document.getElementById('startupGrid');
    container.innerHTML = data.map(s => `
        <div class="startup-card">
            <div class="card-header">
                <div class="company-name">
                    ${s.name} 
                    <span style="font-size:0.7rem; color:var(--text-muted); font-weight:400; font-family:var(--font-mono)">${s.ticker}</span>
                </div>
                <div class="nexus-badge">NXS ${s.nexusScore}</div>
            </div>
            <p class="card-desc">${s.desc}</p>
            <div class="data-grid">
                <div class="data-point">
                    <span class="data-label">Total Raised</span>
                    <span class="data-value" style="color:var(--accent-green)">${s.raised}</span>
                </div>
                <div class="data-point">
                    <span class="data-label">Sector</span>
                    <span class="data-value" style="color:var(--accent-blue)">${s.sector}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// --- MARKET LOGIC & UTILS ---
function scanNewsForTickers(articles) {
    let newTickersFound = false;
    articles.forEach(article => {
        const text = (article.title + " " + article.summary).toLowerCase();
        for (const [keyword, data] of Object.entries(COMPANY_MAP)) {
            if (text.includes(keyword)) {
                const exists = marketData.some(m => m.symbol === data.symbol);
                if (!exists) {
                    marketData.push({
                        symbol: data.symbol,
                        name: data.name,
                        price: Math.floor(Math.random() * 500) + 100,
                        change: (Math.random() * 4) - 2,
                        prevPrice: 0 
                    });
                    newTickersFound = true;
                }
            }
        }
    });
    if (newTickersFound) renderMarketWatch();
}

function renderMarketWatch() {
    const container = document.getElementById('marketWatchList');
    container.innerHTML = marketData.map(item => {
        const isPositive = item.change >= 0;
        const changeClass = isPositive ? 'val-up' : 'val-down';
        const icon = isPositive ? 'arrow-up-right' : 'arrow-down-right';
        return `
        <div class="market-item">
            <div>
                <div class="ticker-symbol">${item.symbol}</div>
                <div class="ticker-name">${item.name}</div>
            </div>
            <div class="ticker-data">
                <div class="ticker-price">${item.price.toFixed(2)}</div>
                <div class="ticker-change ${changeClass}">
                    <i data-lucide="${icon}" style="width:12px;"></i> ${Math.abs(item.change).toFixed(2)}%
                </div>
            </div>
        </div>
    `}).join('');
    lucide.createIcons();
}

async function updateMarketData() {
    const apiKey = localStorage.getItem('nexus_key_finnhub'); 
    
    if (apiKey) {
        const symbolsToFetch = marketData.slice(0, 3).map(m => m.symbol);
        for (let sym of symbolsToFetch) {
             try {
                const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${apiKey}`);
                const data = await res.json();
                if(data.c) {
                    const stock = marketData.find(m => m.symbol === sym);
                    stock.prevPrice = stock.price;
                    stock.price = data.c;
                    stock.change = data.dp;
                }
            } catch(e) { console.log("Finnhub error/limit"); }
        }
    } else {
        marketData.forEach(item => {
            item.prevPrice = item.price;
            const volatility = 0.003; 
            const change = (Math.random() - 0.5) * volatility * item.price;
            item.price += change;
            item.change = ((item.price - item.prevPrice) / item.prevPrice) * 100; 
        });
    }
    renderMarketWatch();
}

// --- SYSTEM UTILS ---
let refreshInterval = null;
function toggleAutoRefresh() {
    const btn = document.getElementById('refreshBtn');
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        refreshInterval = setInterval(() => { loadNewsFeed(); }, 30000);
    } else {
        clearInterval(refreshInterval);
    }
}

function toggleCyberpunk() {
    document.body.classList.toggle('cyberpunk-mode');
    document.getElementById('cyberpunkToggle').classList.toggle('active');
}
function toggleLightMode() {
    document.body.classList.toggle('light-mode');
    document.getElementById('lightModeToggle').classList.toggle('active');
}
function toggleGridLayout() {
    document.body.classList.toggle('grid-layout');
    document.getElementById('gridLayoutToggle').classList.toggle('active');
    const container = document.getElementById('feedContainer');
    container.className = document.body.classList.contains('grid-layout') ? 'grid-view-active' : '';
}
function toggleZenMode() {
    document.body.classList.toggle('zen-mode');
}
function toggleSentimentOverlay() {
    document.getElementById('sentimentToggle').classList.toggle('active');
    loadNewsFeed();
}
function toggleSettings() {
    document.getElementById('settingsModal').classList.toggle('active');
}
function toggleAlerts() {
    document.getElementById('alertsModal').classList.toggle('active');
    document.getElementById('alertDot').style.display = 'none';
}
function toggleTLDR() {
    document.getElementById('tldrToggle').classList.toggle('active');
    document.querySelectorAll('.ai-pill').forEach(p => p.style.display = p.style.display === 'none' ? 'inline-flex' : 'none');
}

function saveSettings() {
    localStorage.setItem('nexus_key_guardian', document.getElementById('key-guardian').value); // NEW
    localStorage.setItem('nexus_key_newsapi', document.getElementById('key-newsapi').value);
    localStorage.setItem('nexus_key_gnews', document.getElementById('key-gnews').value);
    localStorage.setItem('nexus_key_finnhub', document.getElementById('key-finnhub').value);
    
    loadNewsFeed();
    updateMarketData();
    toggleSettings();
}

function loadSettings() {
    if(localStorage.getItem('nexus_key_guardian')) document.getElementById('key-guardian').value = localStorage.getItem('nexus_key_guardian');
    if(localStorage.getItem('nexus_key_newsapi')) document.getElementById('key-newsapi').value = localStorage.getItem('nexus_key_newsapi');
    if(localStorage.getItem('nexus_key_gnews')) document.getElementById('key-gnews').value = localStorage.getItem('nexus_key_gnews');
    if(localStorage.getItem('nexus_key_finnhub')) document.getElementById('key-finnhub').value = localStorage.getItem('nexus_key_finnhub');

    if (localStorage.getItem('nexus_layout_pref') === 'grid') {
        document.body.classList.add('grid-layout');
        document.getElementById('gridLayoutToggle').classList.add('active');
    }
}

function switchView(viewName) {
    document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
    document.getElementById(`${viewName}View`).classList.add('active');
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    if (viewName === 'graph' && !window.network) initGraph();
    if (viewName === 'heatmap') setTimeout(initHeatMap, 100);
}

function initMap() {
    const map = L.map('miniMap', { zoomControl:false, attributionControl:false }).setView([20, 0], 1);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
    globalIntel.forEach(item => {
        let coords = [0,0];
        if(item.region === 'US') coords = [38, -97];
        if(item.region === 'EU') coords = [48, 12];
        if(item.region === 'CN') coords = [35, 104];
        if(item.region === 'UAE') coords = [23, 54];
        L.circleMarker(coords, {color: '#0095ff', fillColor: '#0095ff', fillOpacity: 0.6, radius: 5}).bindTooltip(item.event).addTo(map);
    });
}

function initGraph() {
    const container = document.getElementById('knowledgeGraph');
    const nodes = new vis.DataSet([
        {id: 1, label: 'SSI', group: 'startup'}, {id: 2, label: 'DeepSeek', group: 'startup'},
        {id: 3, label: 'Hardware', group: 'sector'}, {id: 4, label: 'a16z', group: 'vc'}
    ]);
    const edges = new vis.DataSet([{from: 1, to: 4}, {from: 2, to: 3}]);
    window.network = new vis.Network(container, {nodes, edges}, {
        nodes: { shape: 'dot', font: {color:'#fff'} },
        groups: { startup:{color:'#0095ff'}, vc:{color:'#00ff9d'}, sector:{color:'#8a2be2'} }
    });
}

function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('clock').innerText = now.toISOString().split('T')[1].split('.')[0] + " UTC";
    }, 1000);
}

function handleSearch(query) {
    const lowerQ = query.toLowerCase();
    const filteredNews = curatedNews.filter(n => n.title.toLowerCase().includes(lowerQ));
    renderFeed(filteredNews);
}

function renderGlobalIntel() {
    document.getElementById('globalIntelList').innerHTML = globalIntel.map(item => `
        <div class="intel-item">
            <span class="intel-region">${item.region}</span>
            <span class="intel-event">${item.event}</span>
        </div>
    `).join('');
}

function initImpactChart() {
    const options = {
        chart: { type: 'donut', height: 200, background: 'transparent' },
        series: [44, 55, 13], labels: ['Hardware', 'Models', 'Apps'],
        colors: ['#ff4757', '#0095ff', '#00ff9d'],
        legend: { position: 'bottom', fontSize: '10px' },
        theme: { mode: 'dark' }
    };
    new ApexCharts(document.querySelector("#impactChart"), options).render();
}

function initHeatMap() {
    // Basic placeholder for brevity, ensures no errors
    document.querySelector("#heatMapContainer").innerHTML = "<div style='padding:20px; color:#666;'>Heatmap loading...</div>";
}
