// --- CONFIGURATION & MAPPING ---
const COMPANY_MAP = {
    'nvidia': { symbol: 'NVDA', name: 'NVIDIA Corp' },
    'microsoft': { symbol: 'MSFT', name: 'Microsoft' },
    'openai': { symbol: 'MSFT', name: 'Microsoft (OpenAI)' },
    'google': { symbol: 'GOOGL', name: 'Alphabet Inc' },
    'gemini': { symbol: 'GOOGL', name: 'Alphabet Inc' },
    'meta': { symbol: 'META', name: 'Meta Platforms' },
    'llama': { symbol: 'META', name: 'Meta Platforms' },
    'apple': { symbol: 'AAPL', name: 'Apple Inc' },
    'amazon': { symbol: 'AMZN', name: 'Amazon.com' },
    'aws': { symbol: 'AMZN', name: 'Amazon AWS' },
    'amd': { symbol: 'AMD', name: 'Adv Micro Dev' },
    'intel': { symbol: 'INTC', name: 'Intel Corp' },
    'tsmc': { symbol: 'TSM', name: 'Taiwan Semi' },
    'palantir': { symbol: 'PLTR', name: 'Palantir Tech' },
    'oracle': { symbol: 'ORCL', name: 'Oracle Corp' },
    'tesla': { symbol: 'TSLA', name: 'Tesla Inc' },
    'grok': { symbol: 'TSLA', name: 'Tesla (xAI)' }
};

// --- BACKUP CURATED STREAM (Offline Mode) ---
// Updated with REAL world news and DIRECT links for immediate utility
let curatedNews = [
    { 
        id: 1, 
        source: "Reuters", 
        category: "AI", 
        time: "Trending", 
        title: "Ilya Sutskever's SSI raises $1B for safe superintelligence", 
        summary: "The OpenAI co-founder's new venture, Safe Superintelligence Inc., has secured massive funding to pursue pure research into safe AI systems.", 
        implication: "Major capital flowing into pure-play safety labs.", 
        sentiment: "pos", 
        impact: 95,
        url: "https://www.reuters.com/technology/artificial-intelligence/openai-co-founder-sutskever-raises-1-billion-safety-focused-ai-startup-2024-09-04/" 
    },
    { 
        id: 2, 
        source: "Bloomberg", 
        category: "AI", 
        time: "Upcoming", 
        title: "OpenAI nears launch of 'Operator' agent", 
        summary: "OpenAI is preparing to release a new autonomous AI agent codenamed 'Operator' that can control computers to perform tasks.", 
        implication: "Agentic workflows moving to production execution.", 
        sentiment: "neu", 
        impact: 90,
        url: "https://www.bloomberg.com/news/articles/2024-11-13/openai-nears-launch-of-autonomous-ai-agent-operator-to-automate-tasks" 
    },
    { 
        id: 3, 
        source: "Data Center Frontier", 
        category: "Data Center", 
        time: "Recent", 
        title: "Amazon acquires nuclear-powered data center campus", 
        summary: "AWS has purchased a data center campus from Talen Energy located adjacent to the Susquehanna nuclear power plant.", 
        implication: "Direct-connect nuclear power is the new standard for hyperscalers.", 
        sentiment: "pos", 
        impact: 92,
        url: "https://www.datacenterfrontier.com/energy/article/55141639/amazon-acquires-talen-energys-nuclear-data-center-campus" 
    },
    { 
        id: 4, 
        source: "The Register", 
        category: "Data Center", 
        time: "Update", 
        title: "NVIDIA Blackwell chips in full production", 
        summary: "Despite earlier snag reports, NVIDIA confirms its next-gen Blackwell GPU platform is ramping production with 'insane' demand.", 
        implication: "Compute supply remains the critical bottleneck for AI scaling.", 
        sentiment: "pos", 
        impact: 98,
        url: "https://www.theregister.com/2024/10/24/nvidia_blackwell_design_flaw/" 
    },
    { 
        id: 5, 
        source: "Euronews", 
        category: "Policy", 
        time: "Enforced", 
        title: "EU AI Act enters into force", 
        summary: "The world's first comprehensive AI law has officially come into effect, setting compliance deadlines for general purpose AI models.", 
        implication: "Global regulatory fragmentation begins now.", 
        sentiment: "neg", 
        impact: 88,
        url: "https://www.euronews.com/my-europe/2024/07/12/eu-ai-act-published-in-official-journal-setting-clock-ticking-for-compliance" 
    },
    {
        id: 6,
        source: "HPCwire", 
        category: "Data Center", 
        time: "Funding", 
        title: "Accelsius lands $24M for liquid cooling", 
        summary: "Direct-to-chip liquid cooling startup raises Series A as rack densities hit limits of air cooling.", 
        implication: "Infrastructure adaptation accelerating for high-density compute.", 
        sentiment: "pos", 
        impact: 75,
        url: "https://www.hpcwire.com/off-the-wire/accelsius-lands-24m-to-advance-liquid-cooling-systems-amid-ai-demand-surge/" 
    },
    {
        id: 7,
        source: "Anthropic", 
        category: "AI", 
        time: "Blog", 
        title: "Claude's Constitution", 
        summary: "Anthropic details the 'Constitutional AI' approach used to train Claude, focusing on helpfulness, honesty, and harmlessness.", 
        implication: "Transparency in alignment techniques becomes a competitive differentiator.", 
        sentiment: "neu", 
        impact: 80,
        url: "https://www.anthropic.com/news/claudes-constitution" 
    }
];

const startups = [
    { id: 1, name: "Safe Superintelligence", ticker: "SSI", stage: "Growth", raised: "$1.0B", nexusScore: 98, sector: "AGI", desc: "Pure-play AI safety lab founded by Ilya Sutskever.", velocity: "high" },
    { id: 2, name: "Unconventional AI", ticker: "UNCON", stage: "Seed", raised: "$475M", nexusScore: 92, sector: "Hardware", desc: "Biology-inspired neuromorphic computing systems.", velocity: "high" },
    { id: 3, name: "Thinking Machines", ticker: "THINK", stage: "Seed", raised: "$2.0B", nexusScore: 94, sector: "Models", desc: "Proprietary architecture by former OpenAI CTO.", velocity: "med" },
    { id: 4, name: "Reflection AI", ticker: "REFL", stage: "Seed", raised: "$120M", nexusScore: 88, sector: "DevTools", desc: "Autonomous coding agents replacing traditional IDEs.", velocity: "high" },
    { id: 5, name: "Ankar", ticker: "ANKR", stage: "Series A", raised: "$20M", nexusScore: 76, sector: "Legal", desc: "Modernizing the patent lifecycle using AI.", velocity: "low" },
];

const globalIntel = [
    { region: "US", event: "Export Control Expansion (China/UAE)" },
    { region: "EU", event: "AI Act: High-Risk Classification" },
    { region: "CN", event: "Domestic GPU Yield Report" },
    { region: "UAE", event: "MGX Sovereign Fund Deployment" }
];

let marketData = [
    { symbol: 'NVDA', name: 'NVIDIA Corp', price: 142.50, change: 2.45, prevPrice: 140.05 },
    { symbol: 'PLTR', name: 'Palantir', price: 62.40, change: 1.20, prevPrice: 61.20 },
];

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initMap();
    loadSettings(); // Loads keys AND layout preference
    loadNewsFeed(); 
    renderStartups(startups);
    renderGlobalIntel();
    startClock();
    
    // Initialize ApexCharts
    initImpactChart();
    
    // Start Ticker Loop
    setInterval(updateMarketData, 2000); 
});

// --- MARKET LOGIC ---
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
        let flashClass = '';
        if(item.prevPrice !== 0) {
            if(item.price > item.prevPrice) flashClass = 'flash-up';
            if(item.price < item.prevPrice) flashClass = 'flash-down';
        }
        
        return `
        <div class="market-item ${flashClass}">
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
            } catch(e) { console.log("Finnhub error"); }
        }
        renderMarketWatch();
    } else {
        marketData.forEach(item => {
            item.prevPrice = item.price;
            const volatility = 0.003; 
            const change = (Math.random() - 0.5) * volatility * item.price;
            item.price += change;
            item.change = ((item.price - item.prevPrice) / item.prevPrice) * 100; 
        });
        renderMarketWatch();
    }
}

// --- NEWS LOGIC (UPDATED FOR GNEWS) ---
async function loadNewsFeed() {
    const gnewsKey = localStorage.getItem('nexus_key_gnews');
    const newsApiKey = localStorage.getItem('nexus_key_newsapi');

    if (gnewsKey) {
        // PRIORITY 1: GNews (Works in browser)
        await fetchGNews(gnewsKey);
    } else if (newsApiKey) { 
        // PRIORITY 2: NewsAPI (Might block browser)
        await fetchNewsAPI(newsApiKey); 
    } else {
        // PRIORITY 3: Curated (Offline/Fallback)
        console.log("No API keys found. Using real-world backup feed.");
        renderFeed(curatedNews);
        updateBrief(curatedNews);
        scanNewsForTickers(curatedNews); 
        renderMarketWatch();
    }
}

async function fetchGNews(apiKey) {
    try {
        const query = '"Artificial Intelligence" OR "Data Center" OR "AI Policy"';
        const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&sortby=publishedAt&apikey=${apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.articles) {
            const normalizedArticles = data.articles.map((art, index) => ({
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

            renderFeed(normalizedArticles);
            updateBrief(normalizedArticles);
            scanNewsForTickers(normalizedArticles);
        } else {
            console.warn("GNews Error:", data);
            renderFeed(curatedNews); // Fallback
        }
    } catch (e) {
        console.error("GNews Fetch Failed:", e);
        renderFeed(curatedNews); // Fallback
    }
}

async function fetchNewsAPI(apiKey) {
    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q="Artificial Intelligence" OR "Data Center" OR "AI Policy"&sortBy=publishedAt&language=en&apiKey=${apiKey}`);
        const data = await response.json();

        if(data.status === 'ok') {
            const realArticles = data.articles.slice(0, 20).map((art, index) => ({
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
            
            renderFeed(realArticles);
            updateBrief(realArticles);
            scanNewsForTickers(realArticles);
        } else {
            console.warn("NewsAPI Error (Likely CORS):", data.message);
            renderFeed(curatedNews); 
        }
    } catch (e) {
        console.error("NewsAPI Fetch Failed (CORS likely):", e);
        renderFeed(curatedNews); 
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

    // Apply Grid View if active
    const isGrid = document.body.classList.contains('grid-layout');
    container.className = isGrid ? 'grid-view-active' : '';

    const getColor = (cat) => {
        if (cat === 'Data Center') return 'var(--accent-orange)';
        if (cat === 'AI') return 'var(--accent-blue)';
        if (cat === 'Policy') return 'var(--accent-red)';
        return 'var(--accent-green)';
    };

    const getSentimentClass = (sent) => sent === 'pos' ? 'sentiment-pos' : sent === 'neg' ? 'sentiment-neg' : 'sentiment-neu';
    const isSentimentActive = document.getElementById('sentimentToggle')?.classList.contains('active');

    container.innerHTML = sortedData.map(item => `
        <a href="${item.url}" target="_blank" class="feed-card ${isSentimentActive ? getSentimentClass(item.sentiment) : ''}">
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
    
    // Simple DOM filtering to avoid re-fetching
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
                 <div class="data-point">
                    <span class="data-label">Deal Velocity</span>
                    <div style="height:12px; display:flex; align-items:end; gap:2px; margin-top:2px;">
                        <div style="width:4px; height:4px; background:var(--accent-orange); opacity:${s.velocity === 'low' ? 0.3 : 1}"></div>
                        <div style="width:4px; height:8px; background:var(--accent-orange); opacity:${s.velocity === 'low' ? 0.3 : 1}"></div>
                        <div style="width:4px; height:12px; background:var(--accent-orange); opacity:${s.velocity === 'high' ? 1 : 0.3}"></div>
                    </div>
                </div>
            </div>
            <div class="phase-track-mini">
                 <span class="phase-label">STAGE</span>
                <div class="phase-seg filled"></div>
                <div class="phase-seg ${s.stage !== 'Stealth' ? 'filled' : ''}"></div>
                <div class="phase-seg ${s.stage === 'Growth' || s.stage === 'Series A' ? 'filled' : ''}"></div>
                <div class="phase-seg ${s.stage === 'Growth' ? 'filled' : ''}"></div>
            </div>
        </div>
    `).join('');
}

// --- SYSTEM UTILS ---
let refreshInterval = null;
function toggleAutoRefresh() {
    const btn = document.getElementById('refreshBtn');
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        refreshInterval = setInterval(() => {
            loadNewsFeed();
        }, 30000);
    } else {
        clearInterval(refreshInterval);
    }
}

// --- LAYOUT & THEME TOGGLES ---
function toggleCyberpunk() {
    // Manually remove Light Mode if active to prevent conflicts
    document.body.classList.remove('light-mode');
    document.getElementById('lightModeToggle').classList.remove('active');

    document.body.classList.toggle('cyberpunk-mode');
    document.getElementById('cyberpunkToggle').classList.toggle('active');
    
    const logo = document.querySelector('.logo-text');
    logo.innerHTML = document.body.classList.contains('cyberpunk-mode') 
        ? "NEXUS_INTEL <span style='font-size:0.8em;opacity:0.5'>v6.8</span>"
        : "NEXUS INTEL <span style='font-size:0.8em;opacity:0.5'>v6.8</span>";
}

function toggleLightMode() {
    // Manually remove Cyberpunk if active
    document.body.classList.remove('cyberpunk-mode');
    document.getElementById('cyberpunkToggle').classList.remove('active');

    document.body.classList.toggle('light-mode');
    document.getElementById('lightModeToggle').classList.toggle('active');
}

function toggleGridLayout() {
    document.body.classList.toggle('grid-layout');
    const isGrid = document.body.classList.contains('grid-layout');
    document.getElementById('gridLayoutToggle').classList.toggle('active');
    
    // Save Preference
    localStorage.setItem('nexus_layout_pref', isGrid ? 'grid' : 'list');
    
    // Re-render to apply class to container
    const container = document.getElementById('feedContainer');
    container.className = isGrid ? 'grid-view-active' : '';
}

function toggleZenMode() {
    document.body.classList.toggle('zen-mode');
    document.getElementById('zenToggle').classList.toggle('active');
    if(window.network) setTimeout(() => window.network.fit(), 500);
}

function toggleSentimentOverlay() {
    document.getElementById('sentimentToggle').classList.toggle('active');
    // Force re-render of whatever is currently visible
    loadNewsFeed();
}

function toggleSettings() {
    document.getElementById('settingsModal').classList.toggle('active');
}

function toggleAlerts() {
    document.getElementById('alertsModal').classList.toggle('active');
}

function toggleTLDR() {
    document.getElementById('tldrToggle').classList.toggle('active');
    document.querySelectorAll('.ai-pill').forEach(p => p.style.display = p.style.display === 'none' ? 'inline-flex' : 'none');
}

function saveSettings() {
    localStorage.setItem('nexus_key_newsapi', document.getElementById('key-newsapi').value);
    localStorage.setItem('nexus_key_gnews', document.getElementById('key-gnews').value);
    localStorage.setItem('nexus_key_finnhub', document.getElementById('key-finnhub').value);
    localStorage.setItem('nexus_key_openai', document.getElementById('key-openai').value);
    localStorage.setItem('nexus_key_gemini', document.getElementById('key-gemini').value);
    
    loadNewsFeed();
    updateMarketData();
    toggleSettings();
}

function loadSettings() {
    // Load Keys
    if(localStorage.getItem('nexus_key_newsapi')) document.getElementById('key-newsapi').value = localStorage.getItem('nexus_key_newsapi');
    if(localStorage.getItem('nexus_key_gnews')) document.getElementById('key-gnews').value = localStorage.getItem('nexus_key_gnews');
    if(localStorage.getItem('nexus_key_finnhub')) document.getElementById('key-finnhub').value = localStorage.getItem('nexus_key_finnhub');
    if(localStorage.getItem('nexus_key_openai')) document.getElementById('key-openai').value = localStorage.getItem('nexus_key_openai');
    if(localStorage.getItem('nexus_key_gemini')) document.getElementById('key-gemini').value = localStorage.getItem('nexus_key_gemini');

    // Load Layout Pref
    const layout = localStorage.getItem('nexus_layout_pref');
    if (layout === 'grid') {
        document.body.classList.add('grid-layout');
        document.getElementById('gridLayoutToggle').classList.add('active');
    }
}

// --- VIEW LOGIC ---
function switchView(viewName) {
    document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
    document.getElementById(`${viewName}View`).classList.add('active');
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    if (viewName === 'graph' && !window.network) initGraph();
    if (viewName === 'heatmap') setTimeout(initHeatMap, 100);
}

// --- MAP & GRAPH ---
function initMap() {
    const map = L.map('miniMap', { zoomControl:false, attributionControl:false }).setView([20, 0], 1);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
    
    globalIntel.forEach(item => {
        let coords = [0,0];
        if(item.region === 'US') coords = [38, -97];
        if(item.region === 'EU') coords = [48, 12];
        if(item.region === 'CN') coords = [35, 104];
        if(item.region === 'UAE') coords = [23, 54];
        
        L.circleMarker(coords, {
            color: '#0095ff', fillColor: '#0095ff', fillOpacity: 0.6, radius: 5
        }).bindTooltip(item.event).addTo(map);
    });
}

function initGraph() {
    const container = document.getElementById('knowledgeGraph');
    const nodes = new vis.DataSet([
        {id: 1, label: 'SSI', group: 'startup'}, {id: 2, label: 'Unconventional', group: 'startup'},
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
    const filteredNews = curatedNews.filter(n => n.title.toLowerCase().includes(lowerQ) || n.summary.toLowerCase().includes(lowerQ));
    renderFeed(filteredNews);
    
    const filteredStartups = startups.filter(s => s.name.toLowerCase().includes(lowerQ) || s.ticker.toLowerCase().includes(lowerQ));
    renderStartups(filteredStartups);
}

function renderGlobalIntel() {
    const list = document.getElementById('globalIntelList');
    list.innerHTML = globalIntel.map(item => `
        <div class="intel-item">
            <span class="intel-region">${item.region}</span>
            <span class="intel-event">${item.event}</span>
        </div>
    `).join('');
}

function initImpactChart() {
    const options = {
        chart: { type: 'donut', height: 200, background: 'transparent' },
        series: [44, 55, 13], // Hardware, Models, Apps
        labels: ['Hardware', 'Models', 'Apps'],
        colors: ['#ff4757', '#0095ff', '#00ff9d'],
        plotOptions: { pie: { donut: { size: '70%', labels: { show: false } } } },
        dataLabels: { enabled: false },
        legend: { position: 'bottom', fontSize: '10px', markers: { width: 8, height: 8 } },
        stroke: { show: true, width: 1, colors: ['#0f0f16'] },
        theme: { mode: 'dark' }
    };
    new ApexCharts(document.querySelector("#impactChart"), options).render();
}

function initHeatMap() {
     const options = {
        series: [
            { name: 'Hardware', data: [{ x: 'NVIDIA', y: 80 }, { x: 'AMD', y: 50 }, { x: 'Intel', y: 30 }] },
            { name: 'Models', data: [{ x: 'OpenAI', y: 90 }, { x: 'Anthropic', y: 70 }, { x: 'Google', y: 60 }] },
            { name: 'Apps', data: [{ x: 'Jasper', y: 20 }, { x: 'Midjourney', y: 40 }, { x: 'Character', y: 35 }] }
        ],
        chart: { height: '100%', type: 'treemap', background: 'transparent', toolbar: {show: false} },
        colors: ['#ff4757', '#0095ff', '#00ff9d'],
        plotOptions: { treemap: { distributed: true, enableShades: true } },
        theme: { mode: 'dark' }
    };
    document.querySelector("#heatMapContainer").innerHTML = "";
    new ApexCharts(document.querySelector("#heatMapContainer"), options).render();
}
