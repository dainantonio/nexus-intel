// --- CONFIGURATION & MAPPING ---
// Map keywords in news to stock tickers
const COMPANY_MAP = {
    'nvidia': { symbol: 'NVDA', name: 'NVIDIA Corp' },
    'microsoft': { symbol: 'MSFT', name: 'Microsoft' },
    'openai': { symbol: 'MSFT', name: 'Microsoft (OpenAI)' }, // Proxy
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
    'taiwan semi': { symbol: 'TSM', name: 'Taiwan Semi' },
    'palantir': { symbol: 'PLTR', name: 'Palantir Tech' },
    'oracle': { symbol: 'ORCL', name: 'Oracle Corp' },
    'super micro': { symbol: 'SMCI', name: 'Super Micro' },
    'tesla': { symbol: 'TSLA', name: 'Tesla Inc' },
    'grok': { symbol: 'TSLA', name: 'Tesla (xAI)' }
};

// --- HIGH-SIGNAL CURATED STREAM (2026 CONTEXT) ---
let curatedNews = [
    { 
        id: 1, 
        source: "The Information", 
        category: "AI", 
        time: "10m ago", 
        title: "Thinking Machines Lab secures historic $2B Seed.", 
        summary: "The massive round sets a new precedent for seed-stage valuations. Mira Murati's new venture aims to build 'proprietary reasoning architectures' distinct from Transformer models.", 
        implication: "Signifies a shift back to capital-intensive foundation model startups.", 
        sentiment: "pos", 
        impact: 95,
        url: "https://www.theinformation.com/articles/thinking-machines-lab-raises-2b-seed-round-led-by-a16z" 
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
        url: "https://www.bloomberg.com/news/articles/2026-05-12/nvidia-blackwell-ultra-shortages-expected-through-q3" 
    },
    { 
        id: 3, 
        source: "Reuters", 
        category: "Policy", 
        time: "1h ago", 
        title: "EU AI Act enters full enforcement phase.", 
        summary: "Compliance deadlines for high-risk models are approaching faster than anticipated. Fines for non-compliance set at 7% of global turnover.", 
        implication: "Open source models in EU may face geoblocking; Brussels Effect likely to influence US policy.", 
        sentiment: "neu", 
        impact: 88,
        url: "https://www.reuters.com/technology/eu-ai-act-enters-full-enforcement-phase-2026-01-15/" 
    },
    { 
        id: 4, 
        source: "Datacenter Dynamics", 
        category: "Data Center", 
        time: "2h ago", 
        title: "AWS Nuclear Power Deal Approved", 
        summary: "Regulatory approval granted for direct-connect nuclear reactor for US-East-1 expansion. The 950MW deal creates a dedicated energy grid for AWS training clusters.", 
        implication: "Sovereign compute capabilities decoupling from public grid constraints.", 
        sentiment: "pos", 
        impact: 92,
        url: "https://www.datacenterdynamics.com/en/news/aws-nuclear-deal-approved/" 
    },
    {
        id: 5,
        source: "TechCrunch",
        category: "AI",
        time: "3h ago",
        title: "OpenAI 'Operator' enters widespread beta.",
        summary: "The autonomous agent, capable of performing complex multi-step workflows across browsers, is now available to Enterprise tier users. Initial reports show 40% efficiency gains in procurement.",
        implication: "Agentic workflows moving from theory to production; SaaS pricing models under threat.",
        sentiment: "pos",
        impact: 90,
        url: "https://techcrunch.com/2026/01/22/openai-operator-beta-launch/"
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
        url: "https://www.ft.com/content/us-export-controls-bio-ai"
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
        url: "https://venturebeat.com/ai/coolchip-raises-200m-series-b/"
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
        url: "https://www.theverge.com/2026/02/01/anthropic-constitution-2-0"
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

// Market Data Tickers - Initial Set
let marketData = [
    { symbol: 'NVDA', name: 'NVIDIA Corp', price: 1145.20, change: 2.45, prevPrice: 1145.20 },
    { symbol: 'PLTR', name: 'Palantir', price: 28.50, change: -1.20, prevPrice: 28.50 },
    // Others will be injected dynamically based on news
];

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initMap();
    loadNewsFeed(); // This now also triggers the market watch update
    renderStartups(startups);
    renderGlobalIntel();
    startClock();
    loadSettings();
    
    // Initialize ApexCharts
    initImpactChart();
    
    // Start Ticker Loop
    setInterval(updateMarketData, 2000); // 2s tick
});

// --- DYNAMIC MARKET LOGIC ---

// New function: Scans news and updates marketData
function scanNewsForTickers(articles) {
    let newTickersFound = false;

    articles.forEach(article => {
        // Combine title and summary for scanning
        const text = (article.title + " " + article.summary).toLowerCase();

        // Check against our map
        for (const [keyword, data] of Object.entries(COMPANY_MAP)) {
            if (text.includes(keyword)) {
                // If found, check if it already exists in marketData
                const exists = marketData.some(m => m.symbol === data.symbol);
                
                if (!exists) {
                    // Add it with a mock starting price
                    marketData.push({
                        symbol: data.symbol,
                        name: data.name,
                        price: Math.floor(Math.random() * 500) + 100, // Random price 100-600
                        change: (Math.random() * 4) - 2, // Random change -2% to +2%
                        prevPrice: 0 // Will be set on next tick
                    });
                    newTickersFound = true;
                }
            }
        }
    });

    if (newTickersFound) {
        renderMarketWatch();
    }
}

function renderMarketWatch() {
    const container = document.getElementById('marketWatchList');
    // Sort slightly so "flashier" stocks don't jump around too much, or keep append order
    
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
        // If user has key, try to fetch for all symbols
        // Limiting to first 3 to avoid hitting free tier rate limits too hard
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
        // SIMULATION LOGIC (Brownian Motion) for ALL stocks
        marketData.forEach(item => {
            item.prevPrice = item.price;
            const volatility = 0.003; // Slight volatility
            const change = (Math.random() - 0.5) * volatility * item.price;
            item.price += change;
            item.change = ((item.price - item.prevPrice) / item.prevPrice) * 100; 
        });
        renderMarketWatch();
    }
}

// --- NEWS LOGIC ---
async function loadNewsFeed() {
    const newsApiKey = localStorage.getItem('nexus_key_newsapi');
    if (newsApiKey) { 
       await fetchRealNews(newsApiKey); 
    } else {
       renderFeed(curatedNews);
       updateBrief(curatedNews);
       scanNewsForTickers(curatedNews); // <--- Trigger Scan
       renderMarketWatch(); // Ensure they appear
    }
}

async function fetchRealNews(apiKey) {
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
                implication: "Live intel ingest. Auto-analysis pending...", 
                sentiment: Math.random() > 0.5 ? 'pos' : 'neu', 
                url: art.url,
                impact: Math.floor(Math.random() * 30) + 70 
            }));
            
            curatedNews = realArticles; 
            renderFeed(curatedNews);
            updateBrief(curatedNews);
            scanNewsForTickers(curatedNews); // <--- Trigger Scan
        } else {
            console.warn("NewsAPI Error:", data.message);
            renderFeed(curatedNews); 
            scanNewsForTickers(curatedNews);
        }
    } catch (e) {
        console.error("Fetch failed:", e);
        renderFeed(curatedNews); 
        scanNewsForTickers(curatedNews);
    }
}

function inferCategory(text) {
    const t = (text || "").toLowerCase();
    if (t.includes('data center') || t.includes('nvidia') || t.includes('chip') || t.includes('compute') || t.includes('cooling')) return "Data Center";
    if (t.includes('policy') || t.includes('regulation') || t.includes('law') || t.includes('ban') || t.includes('eu') || t.includes('congress')) return "Policy";
    return "AI";
}

// --- GLOBAL INTEL RENDER ---
function renderGlobalIntel() {
    const list = document.getElementById('globalIntelList');
    list.innerHTML = globalIntel.map(item => `
        <div class="intel-item">
            <span class="intel-region">${item.region}</span>
            <span class="intel-event">${item.event}</span>
        </div>
    `).join('');
}

// --- APEX CHARTS ---
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

// --- RENDER FEED ---
function renderFeed(data) {
    const container = document.getElementById('feedContainer');
    const sortedData = [...data].sort((a, b) => b.impact - a.impact);

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

// --- DYNAMIC BRIEF UPDATE ---
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
    
    if (category === 'All') {
        renderFeed(curatedNews);
    } else {
        renderFeed(curatedNews.filter(n => n.category === category));
    }
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

// --- AUTO REFRESH ---
let refreshInterval = null;
function toggleAutoRefresh() {
    const btn = document.getElementById('refreshBtn');
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        refreshInterval = setInterval(() => {
            const apiKey = localStorage.getItem('nexus_key_newsapi');
            if (apiKey) {
                fetchRealNews(apiKey); 
            } else {
                const shuffled = [...curatedNews].sort(() => 0.5 - Math.random());
                renderFeed(shuffled);
            }
        }, 30000);
    } else {
        clearInterval(refreshInterval);
    }
}

// --- THEME & UTILS ---
function toggleCyberpunk() {
    document.body.classList.toggle('cyberpunk-mode');
    document.getElementById('cyberpunkToggle').classList.toggle('active');
    const logo = document.querySelector('.logo-text');
    logo.innerHTML = document.body.classList.contains('cyberpunk-mode') 
        ? "NEXUS_INTEL <span style='font-size:0.8em;opacity:0.5'>v6.6</span>"
        : "NEXUS INTEL <span style='font-size:0.8em;opacity:0.5'>v6.6</span>";
}

function toggleZenMode() {
    document.body.classList.toggle('zen-mode');
    document.getElementById('zenToggle').classList.toggle('active');
    if(window.network) setTimeout(() => window.network.fit(), 500);
}

function toggleSentimentOverlay() {
    document.getElementById('sentimentToggle').classList.toggle('active');
    renderFeed(curatedNews);
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
    
    const btn = document.querySelector('.settings-modal .action-btn:last-child');
    const originalText = btn.innerText;
    btn.innerText = "Configuration Saved";
    btn.style.background = "var(--accent-green)";
    btn.style.color = "#000";
    
    loadNewsFeed();
    updateMarketData();
    
    setTimeout(() => {
        toggleSettings();
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = "transparent";
            btn.style.color = "var(--accent-green)";
        }, 500);
    }, 800);
}

function loadSettings() {
    if(localStorage.getItem('nexus_key_newsapi')) document.getElementById('key-newsapi').value = localStorage.getItem('nexus_key_newsapi');
    if(localStorage.getItem('nexus_key_gnews')) document.getElementById('key-gnews').value = localStorage.getItem('nexus_key_gnews');
    if(localStorage.getItem('nexus_key_finnhub')) document.getElementById('key-finnhub').value = localStorage.getItem('nexus_key_finnhub');
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
