// ===== APP STATE =====
const appState = {
    articles: [],
    savedArticles: JSON.parse(localStorage.getItem('nexus_saved') || '[]'),
    readArticles: JSON.parse(localStorage.getItem('nexus_read') || '[]'),
    recentSearches: JSON.parse(localStorage.getItem('nexus_recent_searches') || '[]'),
    settings: JSON.parse(localStorage.getItem('nexus_settings') || '{"cyberpunk":false, "breakingNews":true, "liveSim":false, "viewMode":"row", "geminiKey":"", "newsApiKey":"", "gnewsApiKey":"", "accentColor":"#00ff9d", "mutedKeywords":[], "highlightKeywords":[], "autoMarkRead":true}'),
    currentFilter: localStorage.getItem('nexus_filter') || 'all',
    viewMode: 'row', // 'row' or 'grid'
    map: null,
    markers: {},
    charts: { sentiment: null, impact: null },
    simInterval: null,
    clockInterval: null,
    logInterval: null,
    tldrMode: false,
    briefCollapsed: false,
    searchIndex: -1,
    bulkMode: false,
    selectedIds: new Set(),
    cache: {
        data: null,
        timestamp: 0,
        duration: 5 * 60 * 1000 // 5 minutes cache
    }
};

// Ensure legacy settings compatibility
if(!appState.settings.mutedKeywords) appState.settings.mutedKeywords = [];
if(!appState.settings.highlightKeywords) appState.settings.highlightKeywords = [];
if(appState.settings.autoMarkRead === undefined) appState.settings.autoMarkRead = true;

// Initialize view mode from settings
appState.viewMode = appState.settings.viewMode || 'row';

// ===== MOCK DATA =====
const generateMockData = () => {
    const sources = [
        { name: 'Reuters', baseUrl: 'https://www.reuters.com/site-search/?query=' },
        { name: 'TechCrunch', baseUrl: 'https://techcrunch.com/?s=' },
        { name: 'Bloomberg', baseUrl: 'https://www.bloomberg.com/search?query=' },
        { name: 'Wired', baseUrl: 'https://www.wired.com/search/?q=' },
        { name: 'The Verge', baseUrl: 'https://www.theverge.com/search?q=' }
    ];
    
    const topics = [
        { title: "NVIDIA Announces New Blackwell Chip Efficiency", tag: "ai", impact: "high", score: 9.2 },
        { title: "Global Energy Grid Strain due to AI Data Centers", tag: "energy", impact: "high", score: 8.8 },
        { title: "EU Passes Comprehensive AI Regulation Act", tag: "policy", impact: "medium", score: 7.5 },
        { title: "Nuclear Fusion Breakthrough at Lawrence Livermore", tag: "energy", impact: "high", score: 9.5 },
        { title: "Google DeepMind Solves Protein Folding at Scale", tag: "ai", impact: "medium", score: 7.2 },
        { title: "Tesla Energy Deployments Hit Record High", tag: "energy", impact: "medium", score: 6.8 },
        { title: "White House Executive Order on Crypto Mining", tag: "policy", impact: "medium", score: 7.0 },
        { title: "AWS Invests $10B in Nuclear-Powered Data Centers", tag: "ai", impact: "high", score: 8.9 },
        { title: "Blackstone Acquires Digital Realty Portfolio for $7B", tag: "realestate", impact: "high", score: 8.5 },
        { title: "Data Center Land Prices Surge in Northern Virginia", tag: "realestate", impact: "medium", score: 7.4 },
        { title: "Microsoft & BlackRock Launch $30B AI Infrastructure Fund", tag: "ai", impact: "high", score: 9.1 },
        { title: "Grid Congestion: Renewables Face Interconnection Delays", tag: "energy", impact: "medium", score: 6.5 }
    ];

    return topics.map((t, i) => {
        const src = sources[Math.floor(Math.random() * sources.length)];
        const deepLink = src.baseUrl + encodeURIComponent(t.title);
        return {
            id: `art_${i}_${Date.now()}`,
            title: t.title,
            summary: "Market analysis indicates significant movement following this announcement. Sector impact projected to be substantial over the next quarter.",
            source: src.name,
            url: deepLink, 
            timeObj: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
            time: `${Math.floor(Math.random() * 12) + 1}h ago`,
            tag: t.tag,
            impact: t.impact,
            impactScore: t.score || (Math.random() * 4 + 5).toFixed(1),
            lat: 20 + Math.random() * 40, 
            lng: -100 + Math.random() * 100,
            aiAnalysis: null 
        };
    });
};

// ===== AI LOGIC (GEMINI) =====
async function performGeminiAnalysis(article) {
    const key = appState.settings.geminiKey;
    if (!key) {
        return `
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; margin-bottom: 8px; color: var(--color-electric-green);">
                <i class="fas fa-bolt"></i> SYSTEM PROJECTION
            </div>
            <ul style="margin: 0; padding-left: 20px; color: #d0d0e0; font-size: 0.9rem; line-height: 1.6;">
                <li style="margin-bottom: 4px;"><strong>Sector Impact:</strong> Direct correlation with ${article.tag.toUpperCase()} volatility index.</li>
                <li style="margin-bottom: 4px;"><strong>Risk Profile:</strong> Moderate variance expected in short term.</li>
                <li><strong>Strategic Action:</strong> Monitor liquidity flows and regulatory filings.</li>
            </ul>
            <div style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
                *Simulated data. Configure API Key in Settings for live neural inference.*
            </div>
        `;
    }

    try {
        const prompt = `Analyze this news event for the ${article.tag} sector. Output valid HTML only: a <ul> with exactly 3 <li> elements. Each <li> must start with a <strong>Label:</strong> followed by a concise 10-15 word analysis. The Labels must be exactly: 'Market Impact', 'Risk Vector', and 'Strategic Response'. Do not include any other text. Title: "${article.title}". Summary: "${article.summary}"`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${key}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const cleanText = text.replace(/```html/g, '').replace(/```/g, '').trim();
        return cleanText ? `
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; margin-bottom: 8px; color: var(--color-data-blue);">
                <i class="fas fa-brain"></i> GEMINI NEURAL INTEL
            </div>
            ${cleanText}
        ` : "Analysis Unavailable";
    } catch (error) { return "AI Analysis Connection Failed. Please check API Key."; }
}

// ===== RSS FETCHING =====
async function fetchRSS() {
    const rssFeeds = [
        "https://techcrunch.com/category/artificial-intelligence/feed/",
        "https://www.wired.com/feed/category/science/latest/rss",
        "https://www.theverge.com/rss/index.xml"
    ];
    const proxy = "https://api.rss2json.com/v1/api.json?rss_url=";
    let articles = [];
    
    const promises = rssFeeds.map(async url => {
        try {
            const res = await fetch(proxy + encodeURIComponent(url));
            const data = await res.json();
            if(data.status === 'ok') {
                return data.items.map(item => ({
                    id: `rss_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
                    title: item.title,
                    summary: item.description ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..." : "Click to read full story.",
                    source: data.feed.title || "RSS Feed",
                    url: item.link, 
                    timeObj: new Date(item.pubDate),
                    time: new Date(item.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    tag: determineTag(item.title, item.description),
                    impact: 'medium', impactScore: (Math.random() * 3 + 5).toFixed(1),
                    lat: (Math.random() * 100) - 50, lng: (Math.random() * 360) - 180, aiAnalysis: null
                }));
            }
        } catch(e) { console.warn("RSS Fetch Error", e); }
        return [];
    });
    const results = await Promise.all(promises);
    results.forEach(arr => articles = [...articles, ...arr]);
    return articles;
}

function determineTag(title, desc) {
    const text = (title + " " + (desc||"")).toLowerCase();
    if(text.includes('energy') || text.includes('nuclear') || text.includes('grid')) return 'energy';
    if(text.includes('policy') || text.includes('regulation') || text.includes('law')) return 'policy';
    if(text.includes('real estate') || text.includes('data center')) return 'realestate';
    return 'ai';
}

// ===== DATA FETCHING with CACHE =====
async function fetchRealNews() {
    const now = Date.now();
    if (appState.cache.data && (now - appState.cache.timestamp < appState.cache.duration)) {
        return appState.cache.data;
    }

    let newsData = [];
    if (newsData.length === 0) { 
        const rss = await fetchRSS(); 
        if(rss.length > 0) newsData = rss; 
    }
    if (newsData.length === 0) newsData = generateMockData();

    appState.cache.data = newsData;
    appState.cache.timestamp = now;
    return newsData;
}

// ===== SIMULATION =====
function startLiveSimulation() {
    if (appState.simInterval) clearInterval(appState.simInterval);
    if (!appState.settings.liveSim) return;
    appState.simInterval = setInterval(() => {
        const mock = generateMockData()[Math.floor(Math.random() * 10)];
        mock.id = `live_${Date.now()}`; mock.time = "JUST NOW"; mock.timeObj = new Date();
        mock.impact = "high"; mock.impactScore = "9.2";
        mock.title = "[LIVE INCOMING] " + mock.title;
        appState.articles.unshift(mock);
        refreshUIComponents();
        showNotification("INCOMING INTEL RECEIVED", "info");
    }, 45000); 
}

function startClock() {
    if(appState.clockInterval) clearInterval(appState.clockInterval);
    appState.clockInterval = setInterval(() => {
        const now = new Date();
        document.getElementById('systemClock').innerText = now.toISOString().split('T')[1].split('.')[0] + " UTC";
        const latency = Math.floor(Math.random() * 20) + 10;
        const latEl = document.getElementById('footerLatency');
        if(latEl) latEl.innerText = `${latency}ms`;
    }, 1000);
}

function startFakeLogStream() {
    if(appState.logInterval) clearInterval(appState.logInterval);
    const container = document.getElementById('systemLogContainer');
    if(!container) return;
    const actions = ["FETCHING_DATAPOINTS", "ANALYZING_SENTIMENT", "GEO_TAGGING", "ENCRYPTING_PAYLOAD", "SYNC_DB", "API_HANDSHAKE", "CACHE_INVALIDATE"];
    appState.logInterval = setInterval(() => {
        if(!document.getElementById('infoModal').classList.contains('active')) return;
        const action = actions[Math.floor(Math.random() * actions.length)];
        const time = new Date().toISOString().split('T')[1].slice(0,8);
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerHTML = `<span class="time">[${time}]</span><span class="type">${action}</span> Process ID: ${Math.floor(Math.random()*9000)+1000}`;
        container.prepend(div);
        if(container.children.length > 50) container.lastChild.remove();
    }, 1500);
}

// ===== INIT =====
function init() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }
}

function onReady() {
     if(window.lucide) window.lucide.createIcons();
     else setTimeout(() => window.lucide && window.lucide.createIcons(), 500);
     
     // Restore scroll position logic
     const savedScroll = localStorage.getItem('nexus_scroll_pos');
     
     applySettings(); 
     applyViewMode(appState.viewMode);
     
     // Restore filter UI state
     const activeFilter = document.querySelector(`.filter-chip[data-filter="${appState.currentFilter}"]`);
     if(activeFilter) {
         document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
         activeFilter.classList.add('active');
     }
     
     const savedSort = localStorage.getItem('nexus_sort_order');
     if(savedSort) document.getElementById('sortSelect').value = savedSort;

     initCharts(); 
     initMap(); 
     
     refreshData().then(() => {
         if(savedScroll) {
             document.getElementById('mainFeed').scrollTop = parseInt(savedScroll);
         }
     });
     
     setupEventListeners(); 
     startLiveSimulation(); 
     startClock();
     startFakeLogStream();
     initTooltip();
     renderMutedKeywords();
     renderHighlightKeywords();
}

// Custom Tooltip Logic
function initTooltip() {
    const tooltip = document.getElementById('cyberTooltip');
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('[title], [data-tooltip]');
        if(target) {
            const text = target.getAttribute('title') || target.getAttribute('data-tooltip');
            if(text) {
                target.setAttribute('data-original-title', text);
                target.removeAttribute('title');
                tooltip.innerText = text;
                tooltip.style.display = 'block';
            }
        }
    });
    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('[data-original-title]');
        if(target) {
            target.setAttribute('title', target.getAttribute('data-original-title'));
            tooltip.style.display = 'none';
        }
    });
    document.addEventListener('mousemove', (e) => {
        tooltip.style.left = (e.pageX + 10) + 'px';
        tooltip.style.top = (e.pageY + 10) + 'px';
    });
}

// Utility: Debounce Function for Performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function calculateReadTime(text) {
    const wpm = 225;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wpm);
}

function generateSparkline() {
    const width = 100;
    const height = 30;
    let points = [];
    let x = 0;
    let y = height / 2;
    for(let i=0; i<10; i++) {
        y += (Math.random() - 0.5) * 20;
        y = Math.max(0, Math.min(height, y));
        points.push(`${x},${y}`);
        x += width / 9;
    }
    return `<svg class="sparkline-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path class="sparkline-path" d="M${points.join(' L')}" /></svg>`;
}

async function refreshData() {
    const refreshBtn = document.getElementById('refreshBtn');
    const icon = refreshBtn?.querySelector('svg') || refreshBtn?.querySelector('i');
    if(icon) icon.classList.add('fa-spin'); 
    
    if (appState.articles.length === 0) renderSkeletonLoader(); 
    
    const newArticles = await fetchRealNews();
    
    if (newArticles.length !== appState.articles.length || newArticles[0]?.id !== appState.articles[0]?.id) {
        appState.articles = newArticles;
        appState.articles.sort((a, b) => b.timeObj - a.timeObj);
        refreshUIComponents();
    } else {
        console.log("Data up to date, skipping re-render.");
    }

    if(icon) icon.classList.remove('fa-spin');
    showNotification("Data Stream Synced", "success");
}

function refreshUIComponents() {
    renderFeed(); checkBreakingNews(); updateQuickSaved(); updateMapMarkers(); updateCharts(); updateAnalytics(); updateTLDRWidget(); updateFilterCounts();
    if(window.lucide) window.lucide.createIcons();
}

function updateFilterCounts() {
    const counts = { all: 0, ai: 0, energy: 0, realestate: 0, policy: 0, unread: 0, breaking: 0, saved: appState.savedArticles.length };
    
    appState.articles.forEach(a => {
        if(!appState.readArticles.includes(a.id)) {
            counts.unread++;
            if(a.tag) counts[a.tag]++; // Only increment unread counts per category
            counts.all++;
        }
    });
    
    // Update badges for unread counts per category
    Object.keys(counts).forEach(key => {
        const badge = document.getElementById(`badge-${key}`);
        if(badge) {
            if(counts[key] > 0) {
                badge.innerText = counts[key];
                badge.classList.add('visible');
            } else {
                badge.classList.remove('visible');
            }
        }
    });
    
    // Total Counts logic for chip sub-text (all items)
    const totalCounts = { all: appState.articles.length, ai: 0, energy: 0, realestate: 0, policy: 0, breaking: 0, saved: appState.savedArticles.length, unread: counts.unread };
    appState.articles.forEach(a => {
        if(totalCounts[a.tag] !== undefined) totalCounts[a.tag]++;
        if(a.impact === 'high') totalCounts.breaking++;
    });

    document.querySelectorAll('.filter-chip').forEach(chip => {
        const type = chip.dataset.filter;
        const countSpan = chip.querySelector('.filter-chip-count');
        if(countSpan && totalCounts[type] !== undefined) countSpan.innerText = `(${totalCounts[type]})`;
    });
}

function renderSkeletonLoader() {
    const container = document.getElementById('articlesContainer');
    const isGrid = appState.viewMode === 'grid';
    container.innerHTML = Array(isGrid ? 6 : 4).fill(0).map(() => `
        <div class="news-card"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text" style="width: 80%;"></div><div style="margin-top: 15px;"><div class="skeleton skeleton-tag"></div></div></div>
    `).join('');
}

// ===== VIEW TOGGLE LOGIC =====
function applyViewMode(mode) {
    appState.viewMode = mode;
    const container = document.getElementById('articlesContainer');
    const buttons = document.querySelectorAll('.view-btn');
    if (mode === 'grid') container.classList.add('grid-view');
    else container.classList.remove('grid-view');
    buttons.forEach(btn => {
        if (btn.dataset.view === mode) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    appState.settings.viewMode = mode;
    localStorage.setItem('nexus_settings', JSON.stringify(appState.settings));
    const select = document.getElementById('defaultViewSelect');
    if(select) select.value = mode;
}

function toggleViewMode() {
    const newMode = appState.viewMode === 'row' ? 'grid' : 'row';
    applyViewMode(newMode);
    showNotification(`Switched to ${newMode.charAt(0).toUpperCase() + newMode.slice(1)} View`, 'info');
}

// ===== BULK OPERATIONS =====
function toggleBulkMode() {
    appState.bulkMode = !appState.bulkMode;
    document.body.classList.toggle('bulk-mode-active');
    const bar = document.getElementById('bulkActionBar');
    if(appState.bulkMode) {
        bar.classList.add('visible');
        showNotification("Bulk Mode Enabled - Select items", "info");
    } else {
        bar.classList.remove('visible');
        appState.selectedIds.clear();
        updateBulkCounter();
        // Redraw to remove checkmarks
        renderFeed(); 
    }
    renderFeed(); // Re-render to show/hide checkboxes
}

function toggleSelection(id, e) {
    if(!appState.bulkMode) return;
    if(e) e.stopPropagation();
    
    const checkbox = document.getElementById(`chk-${id}`);
    if(appState.selectedIds.has(id)) {
        appState.selectedIds.delete(id);
        if(checkbox) checkbox.classList.remove('checked');
    } else {
        appState.selectedIds.add(id);
        if(checkbox) checkbox.classList.add('checked');
    }
    updateBulkCounter();
}

function updateBulkCounter() {
    document.querySelector('.bulk-counter').innerText = `${appState.selectedIds.size} SELECTED`;
}

function bulkMarkRead() {
    if(appState.selectedIds.size === 0) return;
    appState.selectedIds.forEach(id => {
        if(!appState.readArticles.includes(id)) appState.readArticles.push(id);
    });
    localStorage.setItem('nexus_read', JSON.stringify(appState.readArticles));
    showNotification(`${appState.selectedIds.size} Articles Marked Read`, "success");
    toggleBulkMode(); // Exit mode
    refreshUIComponents();
}

function bulkBookmark() {
    if(appState.selectedIds.size === 0) return;
    appState.selectedIds.forEach(id => {
        if(!appState.savedArticles.includes(id)) appState.savedArticles.push(id);
    });
    localStorage.setItem('nexus_saved', JSON.stringify(appState.savedArticles));
    showNotification(`${appState.selectedIds.size} Articles Saved`, "success");
    toggleBulkMode();
    refreshUIComponents();
}

// ===== CHARTS & WIDGETS =====
function toggleBrief() {
    appState.briefCollapsed = !appState.briefCollapsed;
    const container = document.getElementById('topBriefWidget');
    const chevron = document.getElementById('briefChevron');
    if (appState.briefCollapsed) {
        container.classList.add('collapsed');
        if(chevron) chevron.style.transform = 'rotate(180deg)';
    } else {
        container.classList.remove('collapsed');
        if(chevron) chevron.style.transform = 'rotate(0deg)';
    }
}

function updateTLDRWidget() {
    const container = document.getElementById('topBriefWidget');
    const topArticles = [...appState.articles].sort((a,b) => b.impactScore - a.impactScore).slice(0, 3);
    container.innerHTML = topArticles.map((a, i) => `
        <div class="tldr-card" onclick="window.open('${a.url}', '_blank')">
            <div class="tldr-number">${i+1}.</div>
            <div class="tldr-content">
                <h4>${a.title}</h4>
                <div class="tldr-meta">${a.source} • ${a.time} • Impact: <span style="color:${a.impactScore > 8 ? '#ff4757' : '#00ff9d'}">${a.impactScore}</span></div>
            </div>
        </div>
    `).join('');
}

function initCharts() {
    const sentimentOpts = {
        chart: { type: 'radialBar', height: 260, background: 'transparent', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
        series: [0],
        colors: [appState.settings.accentColor || '#00ff9d'],
        plotOptions: {
            radialBar: {
                startAngle: -90, endAngle: 90,
                hollow: { margin: 0, size: '65%', background: 'transparent' },
                track: { background: '#2a2a3a', strokeWidth: '100%', margin: 5 },
                dataLabels: { show: false }
            }
        },
        fill: { type: 'gradient', gradient: { shade: 'dark', type: 'horizontal', shadeIntensity: 0.5, gradientToColors: ['#ff4757'], inverseColors: false, opacityFrom: 1, opacityTo: 1, stops: [0, 100] } },
        stroke: { lineCap: 'butt' }
    };
    if(document.querySelector("#sentimentRadialChart")) {
         appState.charts.sentiment = new ApexCharts(document.querySelector("#sentimentRadialChart"), sentimentOpts);
         appState.charts.sentiment.render();
    }

    const impactOpts = {
        chart: { type: 'donut', height: 220, background: 'transparent' },
        series: [],
        labels: ['High Impact', 'Medium Impact', 'Low Impact'],
        colors: ['#ff4757', '#ffa502', '#0095ff'],
        legend: { show: false },
        plotOptions: { pie: { donut: { size: '75%', labels: { show: true, total: { show: true, showAlways: true, label: 'EVENTS', color: '#fff', fontSize: '14px' }, value: { color: '#fff', fontSize: '20px', fontWeight: 700 } } } } },
        dataLabels: { enabled: false },
        stroke: { width: 0 }
    };
    if(document.querySelector("#impactChart")) {
        appState.charts.impact = new ApexCharts(document.querySelector("#impactChart"), impactOpts);
        appState.charts.impact.render();
    }
}

function updateCharts() {
    if(!appState.charts.impact || !appState.charts.sentiment) return;
    const impacts = { high: 0, medium: 0, low: 0 };
    appState.articles.forEach(a => {
        const imp = a.impact ? a.impact.toLowerCase() : 'low';
        if(impacts[imp] !== undefined) impacts[imp]++; else impacts.low++;
    });
    appState.charts.impact.updateSeries([impacts.high, impacts.medium, impacts.low]);
}

function updateAnalytics() {
    const allText = appState.articles.map(a => a.title).join(' ').toLowerCase();
    const stopWords = ['the', 'and', 'to', 'of', 'in', 'a', 'for', 'on', 'with', 'new', 'at', 'is', 'by', 'announces', 'launches', 'passes'];
    const words = allText.split(/\W+/).filter(w => w.length > 3 && !stopWords.includes(w));
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    const sortedTags = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0, 6).map(e => e[0]);
    
    document.getElementById('trendingContainer').innerHTML = sortedTags.map(t => {
        const vol = Math.floor(Math.random() * 60) + 40; 
        return `<div class="trending-item" onclick="filterByTag('${t}')" title="Filter by #${t}"><div class="trending-info"><span class="trending-tag">#${t.toUpperCase()}</span><span class="trending-vol">${vol}K signals/hr</span></div><div class="trending-bar"><div class="trending-fill" style="width:${vol}%"></div></div></div>`;
    }).join('');

    const positive = ['surge', 'record', 'breakthrough', 'success', 'growth', 'fund', 'invests', 'launches', 'advances', 'gain'];
    const negative = ['strain', 'delays', 'congestion', 'crisis', 'ban', 'lawsuit', 'warning', 'drop', 'outage'];
    let totalScore = 50;
    appState.articles.forEach(a => {
        const text = (a.title + ' ' + a.summary).toLowerCase();
        positive.forEach(w => { if(text.includes(w)) totalScore += 2; });
        negative.forEach(w => { if(text.includes(w)) totalScore -= 2; });
    });
    totalScore = Math.max(0, Math.min(100, totalScore));
    
    if(appState.charts.sentiment) appState.charts.sentiment.updateSeries([totalScore]);
    const valEl = document.getElementById('sentimentValue');
    const txtEl = document.getElementById('sentimentText');
    if(valEl) valEl.innerText = totalScore;
    
    if(totalScore > 60) {
        if(txtEl) { txtEl.innerText = "BULLISH"; txtEl.style.color = appState.settings.accentColor || "#00ff9d"; }
    } else if (totalScore < 40) {
        if(txtEl) { txtEl.innerText = "BEARISH"; txtEl.style.color = "#ff4757"; }
    } else {
        if(txtEl) { txtEl.innerText = "NEUTRAL"; txtEl.style.color = "#ffa502"; }
    }
}

function filterByTag(tag) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = tag;
    const event = new Event('input');
    searchInput.dispatchEvent(event);
    toggleSearch();
}

// ===== READER MODE & READ STATUS =====
function markAsRead(id) {
    if(!appState.readArticles.includes(id)) {
        appState.readArticles.push(id);
        localStorage.setItem('nexus_read', JSON.stringify(appState.readArticles));
        const card = document.getElementById(id);
        if(card) {
            card.classList.add('read');
            card.classList.remove('unread');
        }
        refreshUIComponents();
    }
}

function toggleReadStatus(id, event) {
    if(event) event.stopPropagation();
    if(appState.readArticles.includes(id)) {
        appState.readArticles = appState.readArticles.filter(x => x !== id);
    } else {
        appState.readArticles.push(id);
    }
    localStorage.setItem('nexus_read', JSON.stringify(appState.readArticles));
    refreshUIComponents();
}

function openReader(id, fromSearch = false) {
    const article = appState.articles.find(a => a.id === id);
    if(!article) return;
    
    // Auto Mark as Read logic
    if(appState.settings.autoMarkRead) {
        markAsRead(id);
    }

    if(fromSearch) {
        const query = document.getElementById('searchInput').value.trim();
        addToRecentSearches(query || article.title); 
    }
    
    document.getElementById('readerTitle').innerText = article.title;
    document.getElementById('readerSource').innerText = article.source;
    document.getElementById('readerTime').innerText = article.time;
    document.getElementById('readerTag').innerText = article.tag.toUpperCase();
    document.getElementById('readerBody').innerText = article.summary;
    
    const aiDiv = document.getElementById('readerAiSummary');
    if(article.aiAnalysis && article.aiAnalysis !== 'loading') {
        aiDiv.innerHTML = article.aiAnalysis;
    } else {
        aiDiv.innerHTML = "<em>AI Analysis has not been run on this specific intelligence item yet. Use the 'Neural Analysis' button on the dashboard card to generate deep insights.</em>";
    }
    
    document.getElementById('readerExternalLink').onclick = () => window.open(article.url, '_blank');
    document.getElementById('readerModal').classList.add('active');
}

// ===== RENDERING =====
function toggleTLDR() {
    appState.tldrMode = !appState.tldrMode;
    const btn = document.getElementById('tldrToggleBtn');
    if(appState.tldrMode) {
        btn.classList.add('active');
        renderTLDRFeed();
    } else {
        btn.classList.remove('active');
        renderFeed();
    }
}

function renderTLDRFeed() {
    const container = document.getElementById('articlesContainer');
    document.getElementById('feedTitle').innerText = "TOP INTELLIGENCE BRIEF";
    const topArticles = [...appState.articles].sort((a,b) => b.impactScore - a.impactScore).slice(0, 10);
    
    if (topArticles.length === 0) {
        container.innerHTML = '<div class="empty-state"><i data-lucide="inbox" size="48"></i><div>No intelligence data available.</div></div>';
        if(window.lucide) window.lucide.createIcons();
        return;
    }

    container.innerHTML = topArticles.map((a, i) => `
        <div class="tldr-card" onclick="window.open('${a.url}', '_blank')">
            <div class="tldr-number">${i+1}.</div>
            <div class="tldr-content">
                <h4>${a.title}</h4>
                <div class="tldr-meta">${a.source} • ${a.time} • Impact: <span style="color:${a.impactScore > 8 ? '#ff4757' : '#00ff9d'}">${a.impactScore}</span></div>
            </div>
        </div>
    `).join('');
    if(window.lucide) window.lucide.createIcons();
}

function renderFeed() {
    if(appState.tldrMode) return renderTLDRFeed();
    document.getElementById('feedTitle').innerText = "LIVE INTELLIGENCE";
    const container = document.getElementById('articlesContainer');
    container.innerHTML = '';

    let filtered = appState.articles.filter(a => {
        // Muted Keyword Check
        const text = (a.title + " " + a.summary).toLowerCase();
        if(appState.settings.mutedKeywords && appState.settings.mutedKeywords.some(keyword => text.includes(keyword.toLowerCase()))) {
            return false;
        }
        
        if (appState.currentFilter === 'saved') return appState.savedArticles.includes(a.id);
        if (appState.currentFilter === 'unread') return !appState.readArticles.includes(a.id);
        if (appState.currentFilter === 'breaking') return a.impact === 'high';
        if (appState.currentFilter === 'all') return true;
        return a.tag === appState.currentFilter;
    });

    const sortMode = document.getElementById('sortSelect').value;
    if(sortMode === 'impact') filtered.sort((a,b) => (a.impact === 'high' ? -1 : 1));
    else if(sortMode === 'unread_first') filtered.sort((a,b) => {
        const aRead = appState.readArticles.includes(a.id);
        const bRead = appState.readArticles.includes(b.id);
        if(aRead === bRead) return b.timeObj - a.timeObj;
        return aRead ? 1 : -1;
    });
    else if(sortMode === 'read_first') filtered.sort((a,b) => {
        const aRead = appState.readArticles.includes(a.id);
        const bRead = appState.readArticles.includes(b.id);
        if(aRead === bRead) return b.timeObj - a.timeObj;
        return aRead ? -1 : 1;
    });
    else filtered.sort((a,b) => b.timeObj - a.timeObj);

    document.getElementById('articleCount').innerText = filtered.length;

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state"><i data-lucide="search" size="48"></i><div>No intelligence data found for this filter.</div></div>`;
        if(window.lucide) window.lucide.createIcons();
        return;
    }

    const fragment = document.createDocumentFragment();

    filtered.forEach(art => {
        const isRead = appState.readArticles.includes(art.id);
        const isSelected = appState.selectedIds.has(art.id);
        const card = document.createElement('div');
        card.id = art.id; 
        card.dataset.category = (art.impact === 'high' ? 'breaking' : art.tag);
        card.className = `news-card ${art.impact === 'high' ? 'breaking' : ''} ${isRead ? 'read' : 'unread'}`;
        
        // Card click logic: toggle selection in bulk mode, else open reader
        card.onclick = (e) => {
            if(appState.bulkMode) toggleSelection(art.id, e);
            // else handled by child elements or specific click areas if needed, 
            // but visual header and title have explicit onlick handlers
        };

        card.onmouseenter = () => highlightMapMarker(art.id);
        card.onmouseleave = () => unhighlightMapMarker(art.id);

        const sparkline = art.impactScore > 8 ? generateSparkline() : '';

        // Highlight Keywords Logic
        let displayTitle = art.title;
        let displaySummary = art.summary;
        
        if(appState.settings.highlightKeywords.length > 0) {
            const regex = new RegExp(`(${appState.settings.highlightKeywords.join('|')})`, 'gi');
            displayTitle = displayTitle.replace(regex, '<span class="keyword-highlight">$1</span>');
            displaySummary = displaySummary.replace(regex, '<span class="keyword-highlight">$1</span>');
        }

        card.innerHTML = `
            <div class="bulk-checkbox ${isSelected ? 'checked' : ''}" id="chk-${art.id}"><i data-lucide="check" size="16"></i></div>
            <div class="card-corner-indicator"></div>
            <div class="card-corner-letter">${art.tag.charAt(0).toUpperCase()}</div>
            <div class="impact-badge-strip">BREAKING</div>
            
            <div class="visual-header" onclick="if(!appState.bulkMode) openReader('${art.id}')" style="cursor:pointer">
                 <div class="visual-icon-container">
                     <i data-lucide="${getTagIcon(art.tag)}" size="24"></i>
                 </div>
            </div>

            <div class="card-body">
                <div class="card-header">
                    <span><i data-lucide="globe" style="width:12px; margin-right:5px;"></i>${art.source}</span>
                    <span>${art.time}</span>
                </div>
                <h3 class="card-title" onclick="if(!appState.bulkMode) openReader('${art.id}')">${displayTitle} <i data-lucide="external-link" style="width:14px; display:inline; opacity:0.7;"></i></h3>
                <div class="card-meta-line">
                    <span class="impact-score ${art.impact === 'high' ? 'high' : ''}">Impact: ${art.impactScore}</span>
                    <span>•</span>
                    <span>Relevance: 98%</span>
                    ${art.impactScore > 8 ? `<span style="margin-left:10px;" class="velocity-score"><i data-lucide="trending-up" size="12"></i> High Velocity</span> ${sparkline}` : ''}
                </div>
                <p class="card-summary">${displaySummary}</p>
                
                <div class="ai-analysis-container">
                    <button class="ai-analysis-btn" onclick="toggleAnalysis('${art.id}')" aria-label="Toggle Neural Analysis">
                        <i data-lucide="brain"></i> NEURAL ANALYSIS
                    </button>
                    <div id="ai-${art.id}" class="ai-content">
                        <div class="loading-spinner"><i data-lucide="loader-2" class="fa-spin"></i> Processing Neural Pathway...</div>
                    </div>
                </div>

                <div class="card-footer">
                    <div class="card-tags">
                        <span class="tag ${art.tag}"><i data-lucide="${getTagIcon(art.tag)}" size="12"></i> ${art.tag.toUpperCase()}</span>
                        ${art.impact === 'high' ? '<span class="tag" style="background:rgba(255, 71, 87, 0.1); color:#ff4757; border: 1px solid rgba(255,71,87,0.2);"><i data-lucide="alert-triangle" size="12"></i> HIGH IMPACT</span>' : ''}
                        <span style="font-size:0.7rem; color:var(--color-text-muted); margin-left:5px;">~${calculateReadTime(art.summary)} min read</span>
                    </div>
                    <div class="card-actions-right">
                        <button class="card-action-btn" onclick="toggleReadStatus('${art.id}', event)" title="${isRead ? 'Mark Unread' : 'Mark Read'}">
                            <i data-lucide="${isRead ? 'mail-open' : 'mail'}" size="16"></i>
                        </button>
                        <button class="card-action-btn share-btn" onclick="shareArticle('${art.url}')" title="Copy Link" aria-label="Copy Link"><i data-lucide="share-2" size="16"></i></button>
                        <button class="card-action-btn speak-btn" onclick="speakText('${art.summary.replace(/'/g, "\\'")}', this)" title="Read Briefing" aria-label="Speak Summary"><i data-lucide="volume-2" size="16"></i></button>
                        <button class="card-action-btn bookmark-btn ${appState.savedArticles.includes(art.id) ? 'bookmarked' : ''}" onclick="toggleBookmark('${art.id}')" aria-label="Bookmark"><i data-lucide="bookmark" size="16"></i></button>
                    </div>
                </div>
            </div>
        `;
        fragment.appendChild(card);
    });
    container.appendChild(fragment);
    if(window.lucide) window.lucide.createIcons();
}

function getTagIcon(tag) {
    if(tag === 'ai') return 'cpu';
    if(tag === 'energy') return 'zap';
    if(tag === 'policy') return 'scale';
    if(tag === 'realestate') return 'building';
    return 'tag';
}

async function toggleAnalysis(id) {
    const el = document.getElementById(`ai-${id}`);
    const article = appState.articles.find(a => a.id === id);
    if (el.classList.contains('visible')) { el.classList.remove('visible'); } 
    else { 
        el.classList.add('visible');
        if (!article.aiAnalysis || article.aiAnalysis === 'loading') {
            article.aiAnalysis = 'loading';
            const analysis = await performGeminiAnalysis(article);
            article.aiAnalysis = analysis;
            el.innerHTML = analysis;
        } else { el.innerHTML = article.aiAnalysis; }
    }
}

function speakText(text, btn) {
    if ('speechSynthesis' in window) {
        if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); btn.classList.remove('speaking'); return; }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1; utterance.pitch = 1;
        utterance.onend = () => btn.classList.remove('speaking');
        btn.classList.add('speaking');
        window.speechSynthesis.speak(utterance);
    } else { showNotification("TTS Not Supported", "error"); }
}

function shareArticle(url) {
    navigator.clipboard.writeText(url).then(() => { showNotification("Link Copied", "success"); }).catch(err => console.error(err));
}

function toggleBookmark(id) {
    const index = appState.savedArticles.indexOf(id);
    if (index === -1) { appState.savedArticles.push(id); showNotification("Article Saved", "success"); } 
    else { appState.savedArticles.splice(index, 1); showNotification("Article Removed", "info"); }
    localStorage.setItem('nexus_saved', JSON.stringify(appState.savedArticles));
    refreshUIComponents();
}

function updateQuickSaved() {
    const container = document.getElementById('quickSavedList');
    const btn = document.getElementById('downloadBriefBtn');
    const savedArts = appState.articles.filter(a => appState.savedArticles.includes(a.id));
    if (savedArts.length === 0) { container.innerHTML = '<span style="color: var(--color-text-muted); font-style: italic; font-size:0.8rem;">No bookmarks yet.</span>'; btn.style.display = 'none'; return; }
    btn.style.display = 'block';
    container.innerHTML = savedArts.slice(0, 5).map(a => `<div style="padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer;" onclick="openReader('${a.id}')"><div style="font-weight: 500; color: var(--color-text-secondary); font-size:0.85rem;">${a.title.substring(0, 40)}...</div><div style="font-size: 0.7rem; color: var(--color-text-muted);">${a.source}</div></div>`).join('');
}

function checkBreakingNews() {
    const banner = document.getElementById('breakingBanner');
    const breakingArt = appState.articles.find(a => a.impact === 'high');
    if (breakingArt && appState.settings.breakingNews) {
        document.getElementById('breakingText').innerText = "BREAKING: " + breakingArt.title.toUpperCase();
        banner.style.display = 'flex';
        banner.onclick = () => { window.open(breakingArt.url, '_blank'); };
    } else {
        banner.style.display = 'none';
    }
}

function initMap() {
    if(appState.map) return;
    const mapEl = document.getElementById('miniMap');
    if(!mapEl) return;
    appState.map = L.map('miniMap', { center: [30, -10], zoom: 1.5, zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(appState.map);
}

function updateMapMarkers() {
    if(!appState.map) return;
    Object.values(appState.markers).forEach(m => appState.map.removeLayer(m));
    appState.markers = {};
    
    let visibleArticles = appState.articles;
    // Logic handled in renderFeed, here we just use the current filter logic
    // To simplify, we re-run logic or just map all
    visibleArticles.forEach(art => {
        const customIcon = L.divIcon({ className: 'custom-map-icon', html: `<div class="map-marker-pulse ${art.tag} ${art.impact === 'high' ? 'high-impact' : ''}"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] });
        const marker = L.marker([art.lat, art.lng], { icon: customIcon }).addTo(appState.map);
        marker.bindPopup(`<div style="font-family: Inter, sans-serif; color: #eee;"><strong style="display:block; margin-bottom: 4px; font-size:0.9rem;">${art.title}</strong><span style="font-size: 0.75rem; color: #aaa; text-transform:uppercase;">${art.source}</span></div>`);
        marker.on('click', () => { const card = document.getElementById(art.id); if (card) { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); card.classList.add('highlight-card'); setTimeout(() => card.classList.remove('highlight-card'), 2000); } });
        appState.markers[art.id] = marker; 
    });
}

function highlightMapMarker(id) { const marker = appState.markers[id]; if (marker) marker.openPopup(); }
function unhighlightMapMarker(id) { const marker = appState.markers[id]; if (marker) marker.closePopup(); }

function applySettings() {
    if (appState.settings.cyberpunk) { document.body.classList.add('cyberpunk-active'); document.querySelectorAll('.scanlines, .crt-flicker, .glow-overlay').forEach(el => el.style.display = 'block'); document.getElementById('cyberpunkToggle').checked = true; } 
    else { document.body.classList.remove('cyberpunk-active'); document.querySelectorAll('.scanlines, .crt-flicker, .glow-overlay').forEach(el => el.style.display = 'none'); document.getElementById('cyberpunkToggle').checked = false; }
    document.getElementById('breakingNewsToggle').checked = appState.settings.breakingNews;
    document.getElementById('liveSimToggle').checked = appState.settings.liveSim;
    document.getElementById('autoMarkReadToggle').checked = appState.settings.autoMarkRead;
    document.getElementById('geminiKey').value = appState.settings.geminiKey || '';
    document.getElementById('newsApiKey').value = appState.settings.newsApiKey || '';
    document.getElementById('gnewsApiKey').value = appState.settings.gnewsApiKey || '';
    document.getElementById('defaultViewSelect').value = appState.settings.viewMode || 'row';
    document.getElementById('accentColorPicker').value = appState.settings.accentColor || '#00ff9d';
    document.documentElement.style.setProperty('--color-electric-green', appState.settings.accentColor || '#00ff9d');
    checkBreakingNews(); 
}

function saveSettings() {
    appState.settings.cyberpunk = document.getElementById('cyberpunkToggle').checked;
    appState.settings.breakingNews = document.getElementById('breakingNewsToggle').checked;
    appState.settings.liveSim = document.getElementById('liveSimToggle').checked;
    appState.settings.autoMarkRead = document.getElementById('autoMarkReadToggle').checked;
    appState.settings.geminiKey = document.getElementById('geminiKey').value;
    appState.settings.newsApiKey = document.getElementById('newsApiKey').value;
    appState.settings.gnewsApiKey = document.getElementById('gnewsApiKey').value;
    appState.settings.viewMode = document.getElementById('defaultViewSelect').value;
    appState.settings.accentColor = document.getElementById('accentColorPicker').value;

    localStorage.setItem('nexus_settings', JSON.stringify(appState.settings));
    applySettings(); applyViewMode(appState.settings.viewMode); refreshData(); startLiveSimulation(); 
    if (appState.charts.sentiment) appState.charts.sentiment.destroy();
    initCharts();
    updateAnalytics(); 
    
    document.getElementById('settingsModal').classList.remove('active');
    showNotification("Configuration Saved", "success");
}

// ===== Keyword Logic (Mute & Highlight) =====
function addMutedKeyword() {
    const input = document.getElementById('newKeywordInput');
    const word = input.value.trim();
    if(word && !appState.settings.mutedKeywords.includes(word)) {
        appState.settings.mutedKeywords.push(word);
        localStorage.setItem('nexus_settings', JSON.stringify(appState.settings));
        renderMutedKeywords();
        input.value = '';
        showNotification(`Muted: "${word}"`, 'info');
        renderFeed();
    }
}

function removeMutedKeyword(word) {
    appState.settings.mutedKeywords = appState.settings.mutedKeywords.filter(w => w !== word);
    localStorage.setItem('nexus_settings', JSON.stringify(appState.settings));
    renderMutedKeywords();
    renderFeed();
}

function renderMutedKeywords() {
    const container = document.getElementById('mutedKeywordsList');
    if(container) {
        container.innerHTML = appState.settings.mutedKeywords.map(word => `
            <span class="keyword-tag">
                ${word}
                <i data-lucide="x" size="12" class="keyword-tag-remove" onclick="removeMutedKeyword('${word}')"></i>
            </span>
        `).join('');
        if(window.lucide) window.lucide.createIcons();
    }
}

function addHighlightKeyword() {
    const input = document.getElementById('newHighlightInput');
    const word = input.value.trim();
    if(word && !appState.settings.highlightKeywords.includes(word)) {
        appState.settings.highlightKeywords.push(word);
        localStorage.setItem('nexus_settings', JSON.stringify(appState.settings));
        renderHighlightKeywords();
        input.value = '';
        showNotification(`Highlighting: "${word}"`, 'info');
        renderFeed();
    }
}

function removeHighlightKeyword(word) {
    appState.settings.highlightKeywords = appState.settings.highlightKeywords.filter(w => w !== word);
    localStorage.setItem('nexus_settings', JSON.stringify(appState.settings));
    renderHighlightKeywords();
    renderFeed();
}

function renderHighlightKeywords() {
    const container = document.getElementById('highlightKeywordsList');
    if(container) {
        container.innerHTML = appState.settings.highlightKeywords.map(word => `
            <span class="keyword-tag highlight">
                ${word}
                <i data-lucide="x" size="12" class="keyword-tag-remove" onclick="removeHighlightKeyword('${word}')"></i>
            </span>
        `).join('');
        if(window.lucide) window.lucide.createIcons();
    }
}

// Event listeners for keyword buttons
document.getElementById('addKeywordBtn')?.addEventListener('click', addMutedKeyword);
document.getElementById('addHighlightBtn')?.addEventListener('click', addHighlightKeyword);

function forceBreakingNews() {
    const mock = {
        id: `force_${Date.now()}`,
        title: "CRITICAL: AI SUPERMODEL BREAKTHROUGH CONFIRMED",
        summary: "Intelligence agencies report a massive leap in computational efficiency. Global markets reacting instantly. Energy sector put on high alert.",
        source: "NEXUS ALERT",
        url: "#",
        timeObj: new Date(),
        time: "JUST NOW",
        tag: "ai",
        impact: "high",
        impactScore: "9.9",
        lat: 40.7128,
        lng: -74.0060,
        aiAnalysis: null
    };
    appState.articles.unshift(mock);
    refreshUIComponents();
    showNotification("SIMULATED BREAKING EVENT", "error");
}

function showNotification(text, type = 'info') {
    const el = document.getElementById('notificationArea');
    document.getElementById('notificationText').innerText = text;
    el.className = `notification ${type}`; // Reset classes
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 3000);
}

// ===== ENHANCED SEARCH LOGIC =====
function toggleSearch() {
    const modal = document.getElementById('searchModal');
    if(modal.classList.contains('active')) {
        modal.classList.remove('active');
    } else { 
        modal.classList.add('active'); 
        const input = document.getElementById('searchInput');
        input.value = ''; 
        renderRecentSearches(); 
        setTimeout(() => input.focus(), 100); 
    }
}

function addToRecentSearches(term) {
    if(!term) return;
    const existingIndex = appState.recentSearches.indexOf(term);
    if(existingIndex > -1) {
        appState.recentSearches.splice(existingIndex, 1);
    }
    appState.recentSearches.unshift(term);
    if(appState.recentSearches.length > 5) appState.recentSearches.pop();
    localStorage.setItem('nexus_recent_searches', JSON.stringify(appState.recentSearches));
}

function removeRecentSearch(term, e) {
    e.stopPropagation();
    const index = appState.recentSearches.indexOf(term);
    if(index > -1) {
        appState.recentSearches.splice(index, 1);
        localStorage.setItem('nexus_recent_searches', JSON.stringify(appState.recentSearches));
        renderRecentSearches();
    }
}

function renderRecentSearches() {
    const container = document.getElementById('searchResults');
    if(appState.recentSearches.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--color-text-muted);"><i data-lucide="command" style="margin-bottom: 10px; opacity: 0.5;"></i><br>Type to search global intelligence...</div>';
        if(window.lucide) window.lucide.createIcons();
        return;
    }
    
    let html = '<div class="recent-section-title">Recent Searches</div>';
    appState.recentSearches.forEach((term, index) => {
        html += `
            <div class="recent-item" onclick="triggerSearchFromHistory('${term}')">
                <div style="display:flex; align-items:center;">
                    <i data-lucide="clock" size="14"></i>
                    <span>${term}</span>
                </div>
                <button class="recent-delete" onclick="removeRecentSearch('${term}', event)" title="Remove"><i data-lucide="x" size="12"></i></button>
            </div>
        `;
    });
    container.innerHTML = html;
    if(window.lucide) window.lucide.createIcons();
    appState.searchIndex = -1; 
}

function triggerSearchFromHistory(term) {
    const input = document.getElementById('searchInput');
    input.value = term;
    const event = new Event('input');
    input.dispatchEvent(event);
}

// Search Input Logic with Grouping
document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    
    if(query.length === 0) {
        renderRecentSearches();
        return;
    }

    const hits = appState.articles.filter(a => a.title.toLowerCase().includes(query) || a.summary.toLowerCase().includes(query));
    
    if(hits.length === 0) {
        resultsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--color-text-muted);">No signals found matching criteria.</div>';
        return;
    }

    // Group by Tag
    const grouped = hits.reduce((acc, hit) => {
        const cat = hit.tag.toUpperCase();
        if(!acc[cat]) acc[cat] = [];
        acc[cat].push(hit);
        return acc;
    }, {});

    let html = '';
    for(const [category, items] of Object.entries(grouped)) {
        html += `<div class="search-category-header">${category}</div>`;
        items.forEach(hit => {
             const highlightedTitle = hit.title.replace(new RegExp(query, 'gi'), (match) => `<span class="search-highlight">${match}</span>`);
             html += `
            <div class="search-result-item" data-id="${hit.id}" onclick="openReader('${hit.id}', true); toggleSearch();">
                <div class="search-icon-box"><i data-lucide="${getTagIcon(hit.tag)}"></i></div>
                <div>
                    <div style="font-weight:700; color:#fff; font-size:0.9rem;">${highlightedTitle}</div>
                    <div style="font-size:0.75rem; color:var(--color-text-muted); margin-top:2px;">${hit.source} • ${hit.time}</div>
                </div>
            </div>`;
        });
    }

    resultsContainer.innerHTML = html;
    if(window.lucide) window.lucide.createIcons();
    appState.searchIndex = -1; 
});

// Keyboard Navigation for Search
document.getElementById('searchInput').addEventListener('keydown', (e) => {
    const items = document.querySelectorAll('.search-result-item, .recent-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        appState.searchIndex++;
        if (appState.searchIndex >= items.length) appState.searchIndex = 0;
        updateSelection(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        appState.searchIndex--;
        if (appState.searchIndex < 0) appState.searchIndex = items.length - 1;
        updateSelection(items);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (appState.searchIndex > -1 && items[appState.searchIndex]) {
            items[appState.searchIndex].click();
        }
    }
});

function updateSelection(items) {
    items.forEach((item, idx) => {
        if (idx === appState.searchIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

document.getElementById('downloadBriefBtn').addEventListener('click', () => {
    const saved = appState.articles.filter(a => appState.savedArticles.includes(a.id));
    if(saved.length === 0) return;
    let content = `NEXUS INTEL BRIEF\nGenerated: ${new Date().toLocaleString()}\n\n`;
    saved.forEach((a, i) => { content += `${i+1}. ${a.title}\nSource: ${a.source} | ${a.time}\nSummary: ${a.summary}\nLink: ${a.url}\n\n`; });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `NEXUS_Brief_${Date.now()}.txt`; a.click();
    showNotification("Brief Downloaded", "success");
});

// Info Modal Tabs Logic
function openInfoModal(tabName) {
    document.getElementById('infoModal').classList.add('active');
    document.querySelectorAll('.info-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.info-section').forEach(s => s.classList.remove('active'));
    
    document.querySelector(`.info-tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

document.querySelectorAll('.info-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        const target = e.currentTarget.dataset.tab;
        openInfoModal(target);
    });
});

function setupEventListeners() {
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            e.currentTarget.classList.add('active');
            appState.currentFilter = e.currentTarget.dataset.filter;
            localStorage.setItem('nexus_filter', appState.currentFilter); // Persist filter
            renderFeed(); updateMapMarkers();
        });
    });
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
    document.getElementById('tldrToggleBtn').addEventListener('click', toggleTLDR);
    document.getElementById('triggerSearchBtn').addEventListener('click', toggleSearch);
    document.getElementById('closeSearchBtn').addEventListener('click', toggleSearch);
    document.getElementById('triggerSettingsBtn').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.add('active');
        renderMutedKeywords();
        renderHighlightKeywords();
    });
    document.getElementById('closeSettingsBtn').addEventListener('click', () => document.getElementById('settingsModal').classList.remove('active'));
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('forceBreakingBtn').addEventListener('click', forceBreakingNews);
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        localStorage.setItem('nexus_sort_order', e.target.value); // Persist sort
        renderFeed();
    });
    document.getElementById('closeInfoBtn').addEventListener('click', () => document.getElementById('infoModal').classList.remove('active'));
    
    // Scroll Persistence (Debounced)
    const mainFeed = document.getElementById('mainFeed');
    mainFeed.addEventListener('scroll', debounce(() => {
        localStorage.setItem('nexus_scroll_pos', mainFeed.scrollTop);
        const status = document.getElementById('sessionStatus');
        if(status) {
            status.style.opacity = '1';
            setTimeout(() => status.style.opacity = '0', 2000);
        }
    }, 500));

    // Mobile Widget Toggle
    document.getElementById('mobileWidgetsToggle').addEventListener('click', () => {
        const sidebar = document.getElementById('rightSidebar');
        sidebar.classList.toggle('mobile-active');
        setTimeout(() => { if(appState.map) appState.map.invalidateSize(); }, 300);
    });
    
    // View Toggles
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.view;
            applyViewMode(mode);
        });
    });

    document.addEventListener('keydown', (e) => { 
        if((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); toggleSearch(); } 
        if(e.key === 'Escape') { 
            document.getElementById('searchModal').classList.remove('active'); 
            document.getElementById('settingsModal').classList.remove('active'); 
            document.getElementById('helpModal').classList.remove('active');
            document.getElementById('readerModal').classList.remove('active');
            document.getElementById('infoModal').classList.remove('active');
            document.getElementById('rightSidebar').classList.remove('mobile-active');
            if(appState.bulkMode) toggleBulkMode();
        }
        if(e.shiftKey && e.key === '?') { document.getElementById('helpModal').classList.add('active'); }
        if(e.key === 'r' && !e.metaKey && !e.ctrlKey && document.activeElement.tagName !== 'INPUT') { refreshData(); }
        if(e.key === 'v' && !e.metaKey && !e.ctrlKey && document.activeElement.tagName !== 'INPUT') { toggleViewMode(); }
        if(e.key === 's' && !e.metaKey && !e.ctrlKey && document.activeElement.tagName !== 'INPUT') { document.getElementById('settingsModal').classList.add('active'); }
        if(e.key === 'b' && !e.metaKey && !e.ctrlKey && document.activeElement.tagName !== 'INPUT') { toggleBulkMode(); }
        // Keyboard Mark Read (M) and Mark All Visible (Shift+M)
        if(e.key === 'm' && !e.metaKey && !e.ctrlKey && document.activeElement.tagName !== 'INPUT') {
            // Logic would typically rely on focused element or hovered element if not bulk mode
            // For now, simpler implementation for Shift+M:
        }
        if(e.key === 'M' && e.shiftKey && document.activeElement.tagName !== 'INPUT') {
            // Mark all currently filtered/visible as read
            const currentIds = Array.from(document.querySelectorAll('.news-card')).map(el => el.id);
            currentIds.forEach(id => { if(!appState.readArticles.includes(id)) appState.readArticles.push(id); });
            localStorage.setItem('nexus_read', JSON.stringify(appState.readArticles));
            refreshUIComponents();
            showNotification("All Visible Marked Read", "success");
        }
    });
    document.querySelectorAll('.modal-overlay').forEach(m => { m.addEventListener('click', e => { if(e.target === m) m.classList.remove('active'); }); });
}

// Expose functions to global scope for inline onclick handlers
window.toggleBulkMode = toggleBulkMode;
window.bulkMarkRead = bulkMarkRead;
window.bulkBookmark = bulkBookmark;
window.toggleSelection = toggleSelection;
window.toggleBrief = toggleBrief;
window.filterByTag = filterByTag;
window.openReader = openReader;
window.toggleReadStatus = toggleReadStatus;
window.shareArticle = shareArticle;
window.speakText = speakText;
window.toggleBookmark = toggleBookmark;
window.toggleAnalysis = toggleAnalysis;
window.triggerSearchFromHistory = triggerSearchFromHistory;
window.openInfoModal = openInfoModal;

// Initialize the app
init();
