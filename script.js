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

// Enhanced sample data with more variety
let curatedNews = [
    { id: 1, source: "TECHCRUNCH", category: "AI", time: "15:24", title: "Thinking Machines Lab secures historic $2B Seed funding", summary: "Early-stage AI lab founded by ex-Google researchers raises massive round at $15B valuation.", implication: "Signals intense investor appetite for foundational AI research.", sentiment: "pos", impact: 95, url: "https://techcrunch.com", timestamp: Date.now() },
    { id: 2, source: "THE VERGE", category: "Data Center", time: "14:18", title: "NVIDIA Blackwell Ultra shortages confirmed for Q4", summary: "Supply chain constraints could delay enterprise GPU shipments by 3-6 months.", implication: "High inference costs likely to persist through FY2025.", sentiment: "neg", impact: 88, url: "https://theverge.com", timestamp: Date.now() - 3600000 },
    { id: 3, source: "BLOOMBERG", category: "Policy", time: "12:42", title: "EU approves strict AI compute export controls", summary: "New regulations will limit export of high-performance computing hardware to non-EU nations.", implication: "Potential supply chain fragmentation and regional compute disparities.", sentiment: "neu", impact: 76, url: "https://bloomberg.com", timestamp: Date.now() - 7200000 },
    { id: 4, source: "WIRED", category: "Energy", time: "11:15", title: "Microsoft signs 10GW nuclear power deal for data centers", summary: "Largest-ever corporate nuclear PPA to power AI compute infrastructure in Midwest US.", implication: "Accelerating shift to sovereign energy for critical infrastructure.", sentiment: "pos", impact: 82, url: "https://wired.com", timestamp: Date.now() - 10800000 }
];

const startups = [
    { id: 1, name: "Safe Superintelligence", ticker: "SSI", stage: "Growth", raised: "$5.0B", nexusScore: 98, sector: "AGI", desc: "Pure-play AI safety lab founded by Ilya Sutskever, focusing on alignment-first AGI development.", velocity: "high" },
    { id: 2, name: "Unconventional AI", ticker: "UNCON", stage: "Seed", raised: "$475M", nexusScore: 92, sector: "Hardware", desc: "Biology-inspired neuromorphic computing systems with 100x energy efficiency over GPUs.", velocity: "high" },
    { id: 3, name: "Quantum Lithography", ticker: "QLITH", stage: "Series A", raised: "$320M", nexusScore: 87, sector: "Semiconductors", desc: "Using quantum effects for sub-1nm chip patterning, partnership with TSMC announced.", velocity: "medium" },
    { id: 4, name: "Aether Compute", ticker: "AETH", stage: "Seed", raised: "$210M", nexusScore: 85, sector: "Infrastructure", desc: "Orbital data centers using passive cooling in LEO for energy-free computation.", velocity: "high" }
];

const globalIntel = [
    { region: "US", event: "Export Control Expansion (China/UAE)" },
    { region: "EU", event: "AI Act: High-Risk Classification" },
    { region: "CN", event: "Domestic GPU Yield Report" },
    { region: "UAE", event: "MGX Sovereign Fund Deployment" },
    { region: "UK", event: "AI Safety Summit: Round 2 Announced" }
];

let marketData = [
    { symbol: 'NVDA', name: 'NVIDIA Corp', price: 1145.20, change: 2.45, prevPrice: 1145.20 },
    { symbol: 'PLTR', name: 'Palantir', price: 28.50, change: -1.20, prevPrice: 28.50 },
    { symbol: 'MSFT', name: 'Microsoft', price: 415.86, change: 0.85, prevPrice: 415.86 },
    { symbol: 'GOOGL', name: 'Alphabet', price: 172.34, change: 1.20, prevPrice: 172.34 }
];

let map = null;
let mapTileLayer = null;

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initMap();
    loadSettings(); 
    updateApiConfigUI();
    loadNewsFeed(); 
    renderStartups(startups);
    renderGlobalIntel();
    startClock();
    initImpactChart();
    renderMarketWatch();
    setInterval(updateMarketData, 2000); 
    setTimeout(() => showToast("System Diagnostics: All Systems Nominal"), 1000);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            document.getElementById('globalSearch').focus();
        }
    });
});

// --- FIXED AI ANALYST FUNCTION WITH CORRECT GEMINI API ---
async function analyzeArticle(title, summary) {
    const geminiKey = localStorage.getItem('nexus_key_gemini');
    
    if (!geminiKey) {
        showToast("Missing Gemini API Key. Please add it in Settings.");
        toggleSettings();
        document.getElementById('apiProviderSelector').value = 'gemini';
        updateApiConfigUI();
        return;
    }

    const modal = document.getElementById('aiAnalysisModal');
    const content = document.getElementById('aiModalContent');
    
    modal.classList.add('active');
    content.innerHTML = `
        <div class="analysis-loader">
            <i data-lucide="loader-2"></i>
            <span>Connecting to Neural Network...</span>
        </div>
    `;
    lucide.createIcons();

    try {
        const prompt = `Analyze the following news headline and summary. Provide a strategic analysis in 3 short bullet points focusing on: 1. Market Impact, 2. Threat Level, 3. Future Opportunity. Use markdown bolding for key terms. Keep it brief and tactical.
        
        Headline: ${title}
        Summary: ${summary}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 500,
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.error) throw new Error(data.error.message);
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error("Invalid response format from Gemini API");
        }
        
        const analysisText = data.candidates[0].content.parts[0].text;
        
        content.innerHTML = `
            <div style="margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
                <h4 style="color:var(--accent-blue); font-size: 0.9rem;">TARGET: ${title}</h4>
            </div>
            <div>${marked.parse(analysisText)}</div>
        `;

    } catch (error) {
        console.error("AI Analysis Failed:", error);
        content.innerHTML = `
            <div style="color:var(--accent-red); padding: 1rem;">
                <h4>Analysis Protocol Failed</h4>
                <p>${error.message}</p>
                <div style="margin-top:12px; padding:8px; background:rgba(255,255,255,0.05); border-radius:4px; font-size:0.8rem;">
                    <strong>Demo Analysis:</strong><br>
                    • <strong>Market Impact:</strong> Positive sentiment likely to drive investor interest in adjacent sectors.<br>
                    • <strong>Threat Level:</strong> Moderate - potential regulatory scrutiny but limited immediate risk.<br>
                    • <strong>Future Opportunity:</strong> Creates openings for supporting infrastructure and complementary technologies.
                </div>
            </div>
        `;
    }
}

// --- TEST GEMINI API FUNCTION ---
async function testGeminiAPI() {
    const geminiKey = localStorage.getItem('nexus_key_gemini');
    if (!geminiKey) {
        showToast("No Gemini API key found");
        return;
    }
    
    try {
        const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: "Hello, are you working?" }]
                }]
            })
        });
        
        if (testResponse.ok) {
            showToast("API connection successful!");
        } else {
            showToast(`API Error: ${testResponse.status} ${testResponse.statusText}`);
        }
    } catch (error) {
        showToast(`Connection failed: ${error.message}`);
    }
}

function closeAiModal() {
    document.getElementById('aiAnalysisModal').classList.remove('active');
}

// --- LINK RESOLVER ---
function resolveSmartLink(apiLink, htmlContent) {
    let finalLink = apiLink;
    if (finalLink && (finalLink.includes("google.com/url") || finalLink.includes("google.com/search"))) {
        try {
            const urlParams = new URLSearchParams(new URL(finalLink).search);
            const q = urlParams.get('q');
            const u = urlParams.get('url');
            if (q) finalLink = q; else if (u) finalLink = u;
        } catch(e) { }
    }
    if ((!finalLink || finalLink.startsWith('/')) && htmlContent) {
        const match = htmlContent.match(/href=["'](https?:\/\/[^"']+)["']/i);
        if (match && match[1]) finalLink = match[1];
    }
    if ((!finalLink || finalLink.startsWith('/')) && htmlContent) {
        const textMatch = htmlContent.match(/(https?:\/\/[^\s]+)/g);
        if (textMatch && textMatch.length > 0) {
             const goodLink = textMatch.find(l => !l.includes('google.com'));
             if(goodLink) finalLink = goodLink; else finalLink = textMatch[0];
        }
    }
    if (finalLink && !finalLink.startsWith('http')) {
        if (finalLink.startsWith('www')) finalLink = 'https://' + finalLink;
    }
    return finalLink;
}

// --- ENHANCED FEED RENDERER WITH NEW LAYOUT ---
function renderFeed(data) {
    const container = document.getElementById('feedContainer');
    const isGrid = document.body.classList.contains('grid-layout');
    container.className = isGrid ? 'grid-view-active' : '';

    const getColor = (cat) => {
        if (cat === 'Data Center') return 'var(--accent-orange)';
        if (cat === 'AI') return 'var(--accent-blue)';
        if (cat === 'Policy') return 'var(--accent-red)';
        if (cat === 'Energy') return 'var(--accent-yellow)';
        return 'var(--accent-green)';
    };

    const getSentimentClass = (sent) => sent === 'pos' ? 'sentiment-pos' : sent === 'neg' ? 'sentiment-neg' : 'sentiment-neu';
    const isSentimentActive = document.getElementById('sentimentToggle')?.classList.contains('active');

    container.innerHTML = data.map(item => {
        const safeTitle = item.title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const safeSummary = item.summary.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        let sentimentIcon = 'circle';
        if (item.sentiment === 'pos') sentimentIcon = 'trending-up';
        if (item.sentiment === 'neg') sentimentIcon = 'trending-down';
        if (item.sentiment === 'neu') sentimentIcon = 'minus';

        return `
        <div class="feed-card ${isSentimentActive ? getSentimentClass(item.sentiment) : ''}">
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="feed-content-link">
                <div class="feed-viz" style="background:${getColor(item.category)}"></div>
                <div class="feed-main">
                    <div class="feed-top">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="feed-source">${item.source}</span>
                            <span class="feed-cat-tag" style="color:${getColor(item.category)}">${item.category.toUpperCase()}</span>
                            ${isSentimentActive ? `<i data-lucide="${sentimentIcon}" style="width:12px; color:${item.sentiment === 'pos' ? 'var(--accent-green)' : item.sentiment === 'neg' ? 'var(--accent-red)' : 'var(--text-muted)'}"></i>` : ''}
                        </div>
                        <span style="font-family:var(--font-mono)">${item.time}</span>
                    </div>
                    <h3 class="feed-title">${item.title}</h3>
                    <p class="feed-body">${item.summary}</p>
                </div>
            </a>
            
            <div class="card-footer">
                <div class="impact-score">
                    <i data-lucide="bar-chart-3" style="width:14px;"></i> 
                    <span style="font-weight:600;">IMPACT: ${item.impact}/100</span>
                </div>
                <div class="ai-summary-btn" onclick="analyzeArticle('${safeTitle}', '${safeSummary}')">
                    <i data-lucide="brain" style="width:14px;"></i> ANALYZE
                </div>
            </div>
        </div>
    `}).join('');
    lucide.createIcons();
}

// --- MAP LOGIC ---
function initMap() {
    map = L.map('miniMap', { zoomControl:false, attributionControl:false }).setView([20, 0], 1);
    mapTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
    
    if (document.body.classList.contains('light-mode')) updateMapTheme();
    
    globalIntel.forEach(item => {
        let coords = [0,0];
        if(item.region === 'US') coords = [38, -97];
        if(item.region === 'EU') coords = [48, 12];
        if(item.region === 'CN') coords = [35, 104];
        if(item.region === 'UAE') coords = [23, 54];
        if(item.region === 'UK') coords = [52, 0];
        
        L.circleMarker(coords, {
            color: '#0095ff', fillColor: '#0095ff', fillOpacity: 0.8, radius: 5
        }).bindTooltip(item.event).addTo(map);
    });
}

function updateMapTheme() {
    if (!map || !mapTileLayer) return;
    map.removeLayer(mapTileLayer);

    if (document.body.classList.contains('light-mode')) {
        mapTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd' }).addTo(map);
    } else {
        mapTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd' }).addTo(map);
    }
}

// --- SETTINGS LOGIC ---
function updateApiConfigUI() {
    const provider = document.getElementById('apiProviderSelector').value;
    const container = document.getElementById('apiConfigInputArea');
    let keyId = "", description = "", savedValue = "";
    let isEnabled = localStorage.getItem(`nexus_enable_${provider}`) !== 'false'; 

    if (provider === 'guardian') {
        keyId = "key-guardian"; description = "Excellent quality, reliable."; savedValue = localStorage.getItem('nexus_key_guardian') || "";
    } else if (provider === 'gnews') {
        keyId = "key-gnews"; description = "Free backup news source."; savedValue = localStorage.getItem('nexus_key_gnews') || "";
    } else if (provider === 'newsapi') {
        keyId = "key-newsapi"; description = "Sim mode only (Browser blocked)."; savedValue = localStorage.getItem('nexus_key_newsapi') || "";
    } else if (provider === 'finnhub') {
        keyId = "key-finnhub"; description = "Live stock ticker data."; savedValue = localStorage.getItem('nexus_key_finnhub') || "";
    } else if (provider === 'gemini') {
        keyId = "key-gemini"; description = "Required for AI Analysis features. Use 'gemini-1.5-pro' model."; savedValue = localStorage.getItem('nexus_key_gemini') || "";
    }

    container.innerHTML = `
        <div class="api-enable-row">
            <span class="api-enable-label">Enable Feature</span>
            <div class="toggle-switch ${isEnabled ? 'active' : ''}" id="apiEnableToggle" onclick="toggleApiEnable(this)"></div>
        </div>
        <label class="api-input-label">${provider.toUpperCase()} API Key</label>
        <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;">${description}</p>
        <div class="api-input-wrapper">
            <input type="password" class="api-input" id="${keyId}" value="${savedValue}" placeholder="Enter Key...">
            ${provider === 'gemini' ? '<button class="action-btn" onclick="testGeminiAPI()" style="font-size:0.7rem; padding:6px 10px;">Test</button>' : ''}
        </div>
    `;
}

function toggleApiEnable(el) { el.classList.toggle('active'); }

function saveSettings() {
    const provider = document.getElementById('apiProviderSelector').value;
    const isEnabled = document.getElementById('apiEnableToggle').classList.contains('active');
    localStorage.setItem(`nexus_enable_${provider}`, isEnabled);

    if(provider === 'guardian') localStorage.setItem('nexus_key_guardian', document.getElementById('key-guardian').value);
    if(provider === 'gnews') localStorage.setItem('nexus_key_gnews', document.getElementById('key-gnews').value);
    if(provider === 'newsapi') localStorage.setItem('nexus_key_newsapi', document.getElementById('key-newsapi').value);
    if(provider === 'finnhub') localStorage.setItem('nexus_key_finnhub', document.getElementById('key-finnhub').value);
    if(provider === 'gemini') localStorage.setItem('nexus_key_gemini', document.getElementById('key-gemini').value);
    
    localStorage.removeItem('nexus_gnews_cache'); 
    loadNewsFeed();
    updateMarketData();
    toggleSettings();
}

function loadSettings() {
    const layout = localStorage.getItem('nexus_layout_pref');
    if (layout === 'grid') {
        document.body.classList.add('grid-layout');
        document.getElementById('gridLayoutToggle').classList.add('active');
    }
    if(!localStorage.getItem('nexus_key_guardian')) localStorage.setItem('nexus_key_guardian', "f761d3b8-21df-4cdd-bbbb-6151f4d392e8");
}

// --- STANDARD UTILS ---
function toggleCyberpunk() {
    document.body.classList.remove('light-mode');
    document.getElementById('lightModeToggle').classList.remove('active');
    document.body.classList.toggle('cyberpunk-mode');
    document.getElementById('cyberpunkToggle').classList.toggle('active');
    updateMapTheme();
    initImpactChart();
}
function toggleLightMode() {
    document.body.classList.remove('cyberpunk-mode');
    document.getElementById('cyberpunkToggle').classList.remove('active');
    document.body.classList.toggle('light-mode');
    document.getElementById('lightModeToggle').classList.toggle('active');
    updateMapTheme();
    initImpactChart();
}
function toggleGridLayout() {
    document.body.classList.toggle('grid-layout');
    const isGrid = document.body.classList.contains('grid-layout');
    document.getElementById('gridLayoutToggle').classList.toggle('active');
    localStorage.setItem('nexus_layout_pref', isGrid ? 'grid' : 'list');
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
    loadNewsFeed();
}
function toggleSettings() { document.getElementById('settingsModal').classList.toggle('active'); }
function toggleAlerts() { document.getElementById('alertsModal').classList.toggle('active'); }
function toggleTLDR() {
    document.getElementById('tldrToggle').classList.toggle('active');
    document.querySelectorAll('.ai-pill').forEach(p => p.style.display = p.style.display === 'none' ? 'inline-flex' : 'none');
}
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').innerText = msg;
    toast.classList.add('visible');
    setTimeout(() => hideToast(), 5000);
}
function hideToast() { document.getElementById('toast').classList.remove('visible'); }
function manualRefresh() {
    showToast("Refreshing Intel...");
    const btn = document.getElementById('refreshBtn');
    btn.style.transform = "rotate(360deg)";
    btn.style.transition = "transform 0.5s ease";
    setTimeout(() => btn.style.transform = "rotate(0deg)", 500);
    localStorage.removeItem('nexus_gnews_cache');
    loadNewsFeed();
}
let refreshInterval = null;
function toggleAutoRefresh() {
    const btn = document.getElementById('autoRefreshToggle');
    btn.classList.toggle('active');
    if (btn.classList.contains('active')) {
        showToast("Auto-Refresh Enabled (30s)");
        refreshInterval = setInterval(loadNewsFeed, 30000);
    } else {
        showToast("Auto-Refresh Disabled");
        clearInterval(refreshInterval);
    }
}

// --- AGGREGATOR FUNCTIONS ---
async function loadNewsFeed() {
    const gnewsKey = localStorage.getItem('nexus_key_gnews');
    const guardianKey = localStorage.getItem('nexus_key_guardian');
    
    const useGNews = localStorage.getItem('nexus_enable_gnews') === 'true';
    const useGuardian = localStorage.getItem('nexus_enable_guardian') !== 'false';

    document.getElementById('systemStatus').innerText = "AGGREGATING SOURCES...";
    document.getElementById('statusFill').style.background = "var(--accent-purple)";

    const promises = [];
    if (guardianKey && useGuardian) promises.push(fetchGuardianAPI(guardianKey));
    if (gnewsKey && useGNews) promises.push(fetchGNews(gnewsKey));
    promises.push(fetchRSSFeeds());

    const results = await Promise.allSettled(promises);
    let combinedArticles = [];
    results.forEach(res => {
        if(res.status === 'fulfilled' && Array.isArray(res.value)) combinedArticles = combinedArticles.concat(res.value);
    });

    if (combinedArticles.length === 0) {
        combinedArticles = curatedNews;
    }

    const uniqueArticles = combinedArticles.filter((article, index, self) =>
        index === self.findIndex((t) => (t.title.toLowerCase().trim() === article.title.toLowerCase().trim()))
    );
    const sortedArticles = uniqueArticles.sort((a, b) => {
        if (b.impact !== a.impact) return b.impact - a.impact;
        return b.timestamp - a.timestamp;
    });

    if (sortedArticles.length > 0) {
        document.getElementById('systemStatus').innerText = "MULTI-SOURCE LINKED";
        document.getElementById('statusFill').style.background = "var(--accent-green)";
        renderFeed(sortedArticles);
        scanNewsForTickers(sortedArticles);
    } else {
        renderFeed(curatedNews);
    }
}

async function fetchRSSFeeds() {
    const feeds = [
        "https://techcrunch.com/category/artificial-intelligence/feed/", 
        "https://www.wired.com/feed/category/ai/latest/rss", 
        "https://www.theverge.com/rss/energy/index.xml"
    ];
    const feedPromises = feeds.map(feed => 
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`)
            .then(res => res.json()).then(data => {
                if(data.status === 'ok') {
                    return data.items.map((item, index) => ({
                        id: index + 900, source: data.feed.title, category: inferCategory(item.title + " " + item.content),
                        time: new Date(item.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), timestamp: new Date(item.pubDate).getTime(),
                        title: item.title, summary: item.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...", 
                        implication: "Direct RSS Feed.", sentiment: 'neu', url: item.link, impact: 75
                    }));
                } return [];
            }).catch(e => [])
    );
    const results = await Promise.all(feedPromises);
    return results.flat();
}

async function fetchGNews(apiKey) {
    try {
        const url = `https://gnews.io/api/v4/search?q="artificial intelligence"&lang=en&max=10&apikey=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if(data.articles) return data.articles.map(art => ({
            id: Math.random(), source: art.source.name, category: inferCategory(art.title),
            time: new Date(art.publishedAt).toLocaleTimeString(), timestamp: new Date(art.publishedAt).getTime(),
            title: art.title, summary: art.description, implication: "GNews Live", sentiment: 'neu', url: art.url, impact: 80
        }));
        return [];
    } catch(e) { return []; }
}

async function fetchGuardianAPI(apiKey) {
    try {
        const url = `https://content.guardianapis.com/search?q=technology&api-key=${apiKey}&show-fields=trailText&page-size=10`;
        const res = await fetch(url);
        const data = await res.json();
        if(data.response && data.response.results) return data.response.results.map(art => ({
            id: Math.random(), source: "Guardian", category: inferCategory(art.webTitle),
            time: new Date(art.webPublicationDate).toLocaleTimeString(), timestamp: new Date(art.webPublicationDate).getTime(),
            title: art.webTitle, summary: art.fields?.trailText || "", implication: "Guardian Verified", sentiment: 'neu', url: art.webUrl, impact: 85
        }));
        return [];
    } catch(e) { return []; }
}

// --- MARKET LOGIC (RESTORED) ---
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

// --- FULLY DEFINED UTILITY FUNCTIONS ---
function startClock() {
    setInterval(() => {
        const now = new Date();
        const clockEl = document.getElementById('clock');
        if(clockEl) clockEl.innerText = now.toISOString().split('T')[1].split('.')[0] + " UTC";
    }, 1000);
}

function renderGlobalIntel() {
    const list = document.getElementById('globalIntelList');
    if(!list) return;
    list.innerHTML = globalIntel.map(item => `
        <div class="intel-item">
            <span class="intel-region">${item.region}</span>
            <span class="intel-event">${item.event}</span>
        </div>
    `).join('');
}

function renderStartups(data) {
    const container = document.getElementById('startupGrid');
    if(!container) return;
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
    lucide.createIcons();
}

function initImpactChart() {
    const el = document.querySelector("#impactChart");
    if(!el) return;
    el.innerHTML = ""; // Clear previous if any
    const isLight = document.body.classList.contains('light-mode');
    const options = {
        chart: { type: 'donut', height: 200, background: 'transparent' },
        series: [44, 55, 13], 
        labels: ['Hardware', 'Models', 'Apps'],
        colors: ['#ff4757', '#0095ff', '#00ff9d'],
        plotOptions: { pie: { donut: { size: '70%', labels: { show: false } } } },
        dataLabels: { enabled: false },
        legend: { 
            position: 'bottom', 
            fontSize: '10px', 
            markers: { width: 8, height: 8 },
            itemMargin: { horizontal: 5, vertical: 0 },
            labels: { colors: isLight ? '#000' : '#fff' }
        },
        stroke: { show: true, width: 1, colors: [isLight ? '#fff' : '#0f0f16'] },
        theme: { mode: isLight ? 'light' : 'dark' }
    };
    new ApexCharts(el, options).render();
}

function initHeatMap() {
    const el = document.querySelector("#heatMapContainer");
    if(!el) return;
    el.innerHTML = ""; // Clear previous
     const options = {
        series: [
            { name: 'Hardware', data: [{ x: 'NVIDIA', y: 80 }, { x: 'AMD', y: 50 }, { x: 'Intel', y: 30 }] },
            { name: 'Models', data: [{ x: 'OpenAI', y: 90 }, { x: 'Anthropic', y: 70 }, { x: 'Google', y: 60 }] },
            { name: 'Apps', data: [{ x: 'Jasper', y: 20 }, { x: 'Midjourney', y: 40 }, { x: 'Character', y: 35 }] }
        ],
        chart: { height: '100%', type: 'treemap', background: 'transparent', toolbar: {show: false} },
        colors: ['#ff4757', '#0095ff', '#00ff9d'],
        plotOptions: { treemap: { distributed: true, enableShades: true } },
        theme: { mode: document.body.classList.contains('light-mode') ? 'light' : 'dark' }
    };
    new ApexCharts(el, options).render();
}

function filterFeed(category, el) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    if(el) el.classList.add('active');
    
    const cards = document.querySelectorAll('.feed-card');
    cards.forEach(card => {
        const catTag = card.querySelector('.feed-cat-tag');
        if(catTag) {
            const catText = catTag.innerText;
            if (category === 'All' || catText === category.toUpperCase()) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

function inferCategory(text) {
    const t = (text || "").toLowerCase();
    if (t.includes('energy') || t.includes('nuclear')) return "Energy";
    if (t.includes('data center') || t.includes('nvidia')) return "Data Center";
    if (t.includes('policy') || t.includes('law')) return "Policy";
    return "AI";
}

// View switching
function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
    // Deactivate all tabs
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    
    // Show selected view and activate its tab
    document.getElementById(viewName + 'View').classList.add('active');
    event.target.classList.add('active');
    
    // Initialize specific view components if needed
    if (viewName === 'graph') {
        setTimeout(initKnowledgeGraph, 100);
    } else if (viewName === 'heatmap') {
        setTimeout(initHeatMap, 100);
    }
}

function initKnowledgeGraph() {
    const container = document.getElementById('knowledgeGraph');
    container.innerHTML = '';
    
    // Create nodes and edges for the knowledge graph
    const nodes = new vis.DataSet([
        { id: 1, label: "AI Infrastructure", color: "#0095ff", shape: "dot", size: 25 },
        { id: 2, label: "Compute Hardware", color: "#ff4757", shape: "dot", size: 20 },
        { id: 3, label: "Energy Systems", color: "#00ff9d", shape: "dot", size: 18 },
        { id: 4, label: "Policy & Regulation", color: "#ff9f43", shape: "dot", size: 22 },
        { id: 5, label: "Capital Markets", color: "#8a2be2", shape: "dot", size: 20 },
        { id: 6, label: "Sovereign Compute", color: "#f1c40f", shape: "dot", size: 16 },
        { id: 7, label: "Generative Biology", color: "#00ffff", shape: "dot", size: 14 }
    ]);

    const edges = new vis.DataSet([
        { from: 1, to: 2, width: 2 },
        { from: 1, to: 3, width: 1 },
        { from: 2, to: 4, width: 3 },
        { from: 3, to: 5, width: 2 },
        { from: 4, to: 6, width: 1 },
        { from: 5, to: 7, width: 2 },
        { from: 6, to: 7, width: 1 }
    ]);

    const data = { nodes, edges };
    const options = {
        nodes: { borderWidth: 2 },
        edges: { color: { color: "rgba(255,255,255,0.2)" }, smooth: true },
        physics: {
            stabilization: true,
            barnesHut: { gravitationalConstant: -2000, springLength: 150 }
        },
        interaction: { dragNodes: true, zoomView: true, dragView: true }
    };

    window.network = new vis.Network(container, data, options);
}

// Search functionality
function handleSearch(query) {
    if (query.length < 2) {
        // Reset to show all cards
        document.querySelectorAll('.feed-card, .startup-card').forEach(card => {
            card.style.display = 'flex';
        });
        return;
    }
    
    const searchTerm = query.toLowerCase();
    
    // Search in feed cards
    document.querySelectorAll('.feed-card').forEach(card => {
        const title = card.querySelector('.feed-title')?.textContent.toLowerCase() || '';
        const body = card.querySelector('.feed-body')?.textContent.toLowerCase() || '';
        const source = card.querySelector('.feed-source')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm) || body.includes(searchTerm) || source.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Search in startup cards
    document.querySelectorAll('.startup-card').forEach(card => {
        const name = card.querySelector('.company-name')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.card-desc')?.textContent.toLowerCase() || '';
        const sector = card.querySelector('.data-value')?.textContent.toLowerCase() || '';
        
        if (name.includes(searchTerm) || desc.includes(searchTerm) || sector.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}
