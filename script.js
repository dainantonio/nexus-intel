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

// --- BACKUP CURATED STREAM (Direct URLs Restored) ---
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
        url: "https://www.theinformation.com/articles/mira-murati-seeks-capital-for-new-ai-startup" 
    },
    { 
        id: 2, 
        source: "Bloomberg", 
        category: "Data Center", 
        time: "32m ago", 
        title: "NVIDIA announces Blackwell Ultra shortages.", 
        summary: "Supply chain constraints in CoWoS packaging cited as primary bottleneck for the new B200 Ultra chips.", 
        implication: "Expect inference costs to remain high; older H100 clusters retain value.", 
        sentiment: "neg", 
        impact: 98,
        url: "https://www.bloomberg.com/news/articles/2024-05-22/nvidia-s-blackwell-chips-face-delay-due-to-design-flaw-report-says" 
    },
    { 
        id: 3, 
        source: "Reuters", 
        category: "Policy", 
        time: "1h ago", 
        title: "EU AI Act enters full enforcement phase.", 
        summary: "Compliance deadlines for high-risk models are approaching faster than anticipated.", 
        implication: "Open source models in EU may face geoblocking.", 
        sentiment: "neu", 
        impact: 88,
        url: "https://www.reuters.com/technology/eu-lawmakers-approve-landmark-ai-rules-2024-03-13/" 
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
        url: "https://www.datacenterdynamics.com/en/news/amazon-buys-talens-nuclear-powered-data-center-campus-for-650m/" 
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
        url: "https://techcrunch.com/2024/11/13/openai-is-reportedly-nearing-launch-of-an-ai-agent-codenamed-operator/"
    }
];

const startups = [
    { id: 1, name: "Safe Superintelligence", ticker: "SSI", stage: "Growth", raised: "$5.0B", nexusScore: 98, sector: "AGI", desc: "Pure-play AI safety lab founded by Ilya Sutskever.", velocity: "high" },
    { id: 2, name: "Unconventional AI", ticker: "UNCON", stage: "Seed", raised: "$475M", nexusScore: 92, sector: "Hardware", desc: "Biology-inspired neuromorphic computing systems.", velocity: "high" }
];

const globalIntel = [
    { region: "US", event: "Export Control Expansion (China/UAE)" },
    { region: "EU", event: "AI Act: High-Risk Classification" }
];

let marketData = [
    { symbol: 'NVDA', name: 'NVIDIA Corp', price: 1145.20, change: 2.45, prevPrice: 1145.20 },
    { symbol: 'PLTR', name: 'Palantir', price: 28.50, change: -1.20, prevPrice: 28.50 },
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
    if(!container) return;
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

// --- NEWS LOGIC (Direct Navigation) ---
async function loadNewsFeed() {
    const gnewsKey = localStorage.getItem('nexus_key_gnews');
    if (gnewsKey) {
        await fetchGNews(gnewsKey);
    } else {
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
                implication: "Live GNews Intel detected.",
                sentiment: Math.random() > 0.5 ? 'pos' : 'neu',
                url: art.url, // This is the direct original article link
                impact: Math.floor(Math.random() * 30) + 70
            }));
            renderFeed(normalizedArticles);
            updateBrief(normalizedArticles);
            scanNewsForTickers(normalizedArticles);
        } else {
            renderFeed(curatedNews);
        }
    } catch (e) {
        renderFeed(curatedNews);
    }
}

function inferCategory(text) {
    const t = (text || "").toLowerCase();
    if (t.includes('data center') || t.includes('nvidia') || t.includes('chip')) return "Data Center";
    if (t.includes('policy') || t.includes('regulation')) return "Policy";
    return "AI";
}

// --- RENDER FEED ---
function renderFeed(data) {
    const container = document.getElementById('feedContainer');
    if(!container) return;
    const sortedData = [...data].sort((a, b) => b.impact - a.impact);
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
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="feed-card ${isSentimentActive ? getSentimentClass(item.sentiment) : ''}">
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

// --- OTHER UTILS ---
function toggleLightMode() {
    document.body.classList.remove('cyberpunk-mode');
    document.getElementById('cyberpunkToggle').classList.remove('active');
    document.body.classList.toggle('light-mode');
    document.getElementById('lightModeToggle').classList.toggle('active');
}

function toggleGridLayout() {
    document.body.classList.toggle('grid-layout');
    const isGrid = document.body.classList.contains('grid-layout');
    document.getElementById('gridLayoutToggle').classList.toggle('active');
    localStorage.setItem('nexus_layout_pref', isGrid ? 'grid' : 'list');
    const container = document.getElementById('feedContainer');
    if(container) container.className = isGrid ? 'grid-view-active' : '';
}

function saveSettings() {
    localStorage.setItem('nexus_key_gnews', document.getElementById('key-gnews').value);
    localStorage.setItem('nexus_key_finnhub', document.getElementById('key-finnhub').value);
    loadNewsFeed();
    updateMarketData();
    toggleSettings();
}

function loadSettings() {
    if(localStorage.getItem('nexus_key_gnews')) document.getElementById('key-gnews').value = localStorage.getItem('nexus_key_gnews');
    if(localStorage.getItem('nexus_key_finnhub')) document.getElementById('key-finnhub').value = localStorage.getItem('nexus_key_finnhub');
    if (localStorage.getItem('nexus_layout_pref') === 'grid') {
        document.body.classList.add('grid-layout');
        document.getElementById('gridLayoutToggle').classList.add('active');
    }
}

function startClock() {
    setInterval(() => {
        const clockEl = document.getElementById('clock');
        if(clockEl) {
            const now = new Date();
            clockEl.innerText = now.toISOString().split('T')[1].split('.')[0] + " UTC";
        }
    }, 1000);
}

function switchView(viewName) {
    document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`${viewName}View`);
    if(target) target.classList.add('active');
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
}

function toggleSettings() { document.getElementById('settingsModal').classList.toggle('active'); }
function toggleAlerts() { document.getElementById('alertsModal').classList.toggle('active'); }
function toggleZenMode() { document.body.classList.toggle('zen-mode'); }
function renderGlobalIntel() { /* ...Existing logic... */ }
function renderStartups(data) { /* ...Existing logic... */ }
function initMap() { /* ...Existing logic... */ }
function initImpactChart() { /* ...Existing logic... */ }
function updateBrief(data) { /* ...Existing logic... */ }
