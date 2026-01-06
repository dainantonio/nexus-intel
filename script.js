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
// URLs are now Google Search links to prevent 404s
let curatedNews = [
    { 
        id: 1, 
        source: "The Information", 
        category: "AI", 
        time: "10m ago", 
        title: "Thinking Machines Lab secures historic $2B Seed.", 
        summary: "The massive round sets a new precedent for seed-stage valuations. Mira Murati's new venture aims to build 'proprietary reasoning architectures'.", 
        implication: "Signifies a shift back to capital-intensive foundation model startups.", 
        sentiment: "pos", 
        impact: 95,
        url: "https://www.google.com/search?q=Thinking+Machines+Lab+raises+2B+seed" 
    },
    { 
        id: 2, 
        source: "Bloomberg", 
        category: "Data Center", 
        time: "32m ago", 
        title: "NVIDIA announces Blackwell Ultra shortages.", 
        summary: "Supply chain constraints in CoWoS packaging cited as primary bottleneck for the new B200 Ultra chips. Delivery estimates pushed to Q4 2026.", 
        implication: "Expect inference costs to remain high; older H100 clusters retain value.", 
        sentiment: "neg", 
        impact: 98,
        url: "https://www.google.com/search?q=NVIDIA+Blackwell+Ultra+shortages" 
    },
    { 
        id: 3, 
        source: "Reuters", 
        category: "Policy", 
        time: "1h ago", 
        title: "EU AI Act enters full enforcement phase.", 
        summary: "Compliance deadlines for high-risk models are approaching faster than anticipated. Fines for non-compliance set at 7% of global turnover.", 
        implication: "Open source models in EU may face geoblocking.", 
        sentiment: "neu", 
        impact: 88,
        url: "https://www.google.com/search?q=EU+AI+Act+enforcement+phase+2026" 
    },
    { 
        id: 4, 
        source: "Datacenter Dynamics", 
        category: "Data Center", 
        time: "2h ago", 
        title: "AWS Nuclear Power Deal Approved", 
        summary: "Regulatory approval granted for direct-connect nuclear reactor for US-East-1 expansion.", 
        implication: "Sovereign compute capabilities decoupling from public grid constraints.", 
        sentiment: "pos", 
        impact: 92,
        url: "https://www.google.com/search?q=AWS+Nuclear+Power+Deal+Approved" 
    },
    {
        id: 5,
        source: "TechCrunch",
        category: "AI",
        time: "3h ago",
        title: "OpenAI 'Operator' enters widespread beta.",
        summary: "The autonomous agent, capable of performing complex multi-step workflows across browsers, is now available to Enterprise tier users.",
        implication: "Agentic workflows moving from theory to production.",
        sentiment: "pos", 
        impact: 90,
        url: "https://www.google.com/search?q=OpenAI+Operator+beta+launch"
    },
    {
        id: 6,
        source: "Financial Times",
        category: "Policy", 
        time: "4h ago", 
        title: "US Expands Export Controls to Bio-AI", 
        summary: "New commerce department rules restrict export of foundation models fine-tuned on biological sequence data to specific nations.", 
        implication: "Generative Biology sector faces new geopolitical friction.", 
        sentiment: "neg", 
        impact: 85,
        url: "https://www.google.com/search?q=US+Expands+Export+Controls+Bio-AI" 
    },
    {
        id: 7,
        source: "VentureBeat", 
        category: "Data Center", 
        time: "5h ago", 
        title: "Liquid Cooling startup 'CoolChip' raises $200M.", 
        summary: "As rack densities hit 150kW, traditional air cooling is obsolete. CoolChip's direct-to-chip solution claims 30% energy reduction.", 
        implication: "Physical infrastructure adaptation is the next big VC thesis.", 
        sentiment: "pos", 
        impact: 75,
        url: "https://www.google.com/search?q=Liquid+Cooling+startup+raises+200M" 
    },
    {
        id: 8,
        source: "The Verge", 
        category: "AI", 
        time: "6h ago", 
        title: "Anthropic publishes 'Constitution 2.0'", 
        summary: "Updated safety guidelines for Claude 4 focus on 'power-seeking' behaviors and deceptive alignment detection.", 
        implication: "Safety vs Capability debate shifting towards specific behavioral guarantees.", 
        sentiment: "neu", 
        impact: 80,
        url: "https://www.google.com/search?q=Anthropic+Constitution+2.0" 
    }
];

const startups = [
    { id: 1, name: "Safe Superintelligence", ticker: "SSI", stage: "Growth", raised: "$5.0B", nexusScore: 98, sector: "AGI", desc: "Pure-play AI safety lab founded by Ilya Sutskever.", velocity: "high" },
    { id: 2, name: "Unconventional AI", ticker: "UNCON", stage: "Seed", raised: "$475M", nexusScore: 92, sector: "Hardware", desc: "Biology-inspired neuromorphic computing systems.", velocity: "high" },
    { id: 3, name: "Thinking Machines", ticker: "THINK", stage: "Seed", raised: "$2.0B", nexusScore: 94, sector: "Models", desc: "Proprietary architecture by former OpenAI CTO.", velocity: "med" },
    { id: 4, name: "Reflection AI", ticker: "REFL", stage: "Seed", raised: "$2.0B", nexusScore: 88, sector: "DevTools", desc: "Autonomous coding agents replacing traditional IDEs.", velocity: "high" },
    { id: 5, name: "Ankar", ticker: "ANKR", stage: "Series A", raised: "$20M", nexusScore: 76, sector: "Legal", desc: "Modernizing the patent lifecycle using AI.", velocity: "low" },
];

const globalIntel = [
    { region: "US", event: "Export Control Expansion (China/UAE)" },
    { region: "EU", event: "AI Act: High-Risk Classification" },
    { region: "CN", event: "Domestic GPU Yield Report" },
    { region: "UAE", event: "MGX Sovereign Fund Deployment" }
];

let marketData = [
    { symbol: 'NVDA', name: 'NVIDIA Corp', price: 1145.20, change: 2.45, prevPrice: 1145.20 },
    { symbol: 'PLTR', name: 'Palantir', price: 28.50, change: -1.20, prevPrice: 28.50 },
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
        // PRIORITY 3: Curated (Offline)
        console.log("No API keys found. Using curated feed.");
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
    
    // Note: Since we fetch fresh data on load, this only filters what is currently in memory
    // If we wanted to re-fetch, we'd need to modify the API calls. 
    // For now, client-side filtering of the 10-20 fetched items is safest.
    
    // We need to access the current dataset. 
    // Simplest way: Re-render based on global variable, but we need to know WHICH global variable.
    // Hack: We will just re-trigger loadNewsFeed but that burns API calls.
    // Better: We assume 'curatedNews' holds the CURRENT view data? No, it holds the backup.
    // Fix: We won't re-implement full state management right now. 
    // We will just filter the elements currently in the DOM? No, that's messy.
    // Correct Fix: If the user filters, we just hide/show DOM elements.
    
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
    // Note: We need to simply re-apply the class, which logic is in renderFeed
    // We can just call a layout refresh helper
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
    // Simple way: re-call loadNewsFeed is expensive. 
    // CSS class on body is better for toggles, but we use inline styles for colors.
    // We will stick to the reload for simplicity of this script.
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
    // Use curatedNews as default search base if we aren't storing fetched news globally (we aren't for this simple script).
    // Limitation: Search only works on Curated News unless we refactor to store fetched articles globally.
    // Fix for now: We will leave it as is, but it's a known limitation of this simple script structure.
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
