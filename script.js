// ===== SAFE INIT HELPER =====
// This ensures the code doesn't crash if external libraries are slow to load
function safeCreateIcons() {
    if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
    }
}

// ===== APP STATE =====
// We wrap localStorage in try-catch to prevent crashes if data is corrupted
let savedSettings;
try {
    savedSettings = JSON.parse(localStorage.getItem('nexus_settings')) || {};
} catch (e) {
    console.error("Settings corrupted, resetting", e);
    savedSettings = {};
}

const defaultSettings = {
    cyberpunk: false,
    breakingNews: true,
    liveSim: false,
    viewMode: "row",
    geminiKey: "",
    newsApiKey: "",
    gnewsApiKey: "",
    accentColor: "#00ff9d",
    mutedKeywords: [],
    highlightKeywords: [],
    autoMarkRead: true
};

const appState = {
    articles: [],
    savedArticles: JSON.parse(localStorage.getItem('nexus_saved') || '[]'),
    readArticles: JSON.parse(localStorage.getItem('nexus_read') || '[]'),
    recentSearches: JSON.parse(localStorage.getItem('nexus_recent_searches') || '[]'),
    settings: { ...defaultSettings, ...savedSettings }, // Merge defaults with saved
    currentFilter: localStorage.getItem('nexus_filter') || 'all',
    searchQuery: '',
    viewMode: 'row',
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
    cache: { data: null, timestamp: 0, duration: 5 * 60 * 1000 }
};

// Update view mode from settings immediately
appState.viewMode = appState.settings.viewMode || 'row';

// ===== INITIALIZATION =====
function init() {
    // We use a small delay to ensure HTML is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        setTimeout(onReady, 50); 
    }
}

function onReady() {
    console.log("System Initializing...");

    // 1. SETUP LISTENERS FIRST (Crucial so buttons work even if data fails)
    setupEventListeners();
    
    // 2. APPLY VISUALS
    applySettings();
    applyViewMode(appState.viewMode);
    
    // 3. INITIALIZE WIDGETS (with safety checks)
    try { initCharts(); } catch(e) { console.warn("Charts failed to load:", e); }
    try { initMap(); } catch(e) { console.warn("Map failed to load:", e); }
    
    // 4. RESTORE STATE
    const savedSort = localStorage.getItem('nexus_sort_order');
    if(savedSort && document.getElementById('sortSelect')) {
        document.getElementById('sortSelect').value = savedSort;
    }
    
    // 5. FETCH DATA
    refreshData();
    
    // 6. START BACKGROUND TASKS
    startLiveSimulation();
    startClock();
    startFakeLogStream();
    initTooltip();
    renderMutedKeywords();
    renderHighlightKeywords();
    
    // Attempt to load icons
    setTimeout(safeCreateIcons, 100);
    setTimeout(safeCreateIcons, 1000); // Retry later for slow connections
}

function setupEventListeners() {
    // We use optional chaining (?.) to prevent crashes if an element is missing
    document.getElementById('refreshBtn')?.addEventListener('click', refreshData);
    document.getElementById('tldrToggleBtn')?.addEventListener('click', toggleTLDR);
    document.getElementById('triggerSearchBtn')?.addEventListener('click', toggleSearch);
    document.getElementById('closeSearchBtn')?.addEventListener('click', toggleSearch);
    
    // Settings Modal Triggers
    document.getElementById('triggerSettingsBtn')?.addEventListener('click', () => {
        const modal = document.getElementById('settingsModal');
        if(modal) {
            modal.classList.add('active');
            renderMutedKeywords();
            renderHighlightKeywords();
        }
    });
    
    document.getElementById('closeSettingsBtn')?.addEventListener('click', () => {
        document.getElementById('settingsModal')?.classList.remove('active');
    });
    
    document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
    
    document.getElementById('forceBreakingBtn')?.addEventListener('click', forceBreakingNews);
    
    document.getElementById('sortSelect')?.addEventListener('change', (e) => {
        localStorage.setItem('nexus_sort_order', e.target.value);
        renderFeed();
    });
    
    document.getElementById('closeInfoBtn')?.addEventListener('click', () => {
        document.getElementById('infoModal')?.classList.remove('active');
    });

    // Mobile Widget Toggle
    document.getElementById('mobileWidgetsToggle')?.addEventListener('click', () => {
        const sidebar = document.getElementById('rightSidebar');
        if(sidebar) {
            sidebar.classList.toggle('mobile-active');
            setTimeout(() => { if(appState.map) appState.map.invalidateSize(); }, 300);
        }
    });

    // View Mode Buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.view;
            applyViewMode(mode);
        });
    });

    // Filter Chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            const filter = e.currentTarget.dataset.filter;
            // UI Update
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            // Logic Update
            appState.currentFilter = filter;
            if (filter !== 'search') {
                const searchInput = document.getElementById('feedSearchInput');
                if(searchInput) searchInput.value = '';
                appState.searchQuery = '';
                document.getElementById('clearSearchBtn')?.classList.remove('visible');
                document.getElementById('searchResultChip').style.display = 'none';
            }
            localStorage.setItem('nexus_filter', appState.currentFilter);
            renderFeed();
            updateMapMarkers();
        });
    });

    // Search Input
    const feedSearchInput = document.getElementById('feedSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    if(feedSearchInput) {
        feedSearchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value;
            appState.searchQuery = query;
            
            if (query.trim().length > 0) {
                clearSearchBtn?.classList.add('visible');
                appState.currentFilter = 'search';
                const searchChip = document.getElementById('searchResultChip');
                if(searchChip) {
                    searchChip.style.display = 'flex';
                    searchChip.classList.add('active');
                }
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            } else {
                clearSearchBtn?.classList.remove('visible');
                appState.currentFilter = 'all';
                document.getElementById('searchResultChip').style.display = 'none';
                document.querySelector('.filter-chip[data-filter="all"]')?.classList.add('active');
            }
            renderFeed();
        }, 300));
    }

    if(clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if(feedSearchInput) feedSearchInput.value = '';
            appState.searchQuery = '';
            clearSearchBtn.classList.remove('visible');
            appState.currentFilter = 'all';
            document.getElementById('searchResultChip').style.display = 'none';
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            document.querySelector('.filter-chip[data-filter="all"]')?.classList.add('active');
            renderFeed();
        });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => { 
        if((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); toggleSearch(); } 
        if(e.key === 'Escape') { 
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
            document.getElementById('rightSidebar')?.classList.remove('mobile-active');
            if(appState.bulkMode) toggleBulkMode();
        }
        if(e.shiftKey && e.key === '?') { document.getElementById('helpModal')?.classList.add('active'); }
        if(e.key === 's' && !e.metaKey && !e.ctrlKey && document.activeElement.tagName !== 'INPUT') { 
            document.getElementById('settingsModal')?.classList.add('active'); 
        }
    });

    // Close modals on outside click
    document.querySelectorAll('.modal-overlay').forEach(m => { 
        m.addEventListener('click', e => { if(e.target === m) m.classList.remove('active'); }); 
    });
}

// ===== MOCK DATA GENERATOR =====
const generateMockData = () => {
    const sources = [
        { name: 'Reuters', baseUrl: '#' },
        { name: 'TechCrunch', baseUrl: '#' },
        { name: 'Bloomberg', baseUrl: '#' },
        { name: 'Wired', baseUrl: '#' }
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
        { title: "Data Center Land Prices Surge in Northern Virginia", tag: "realestate", impact: "medium", score: 7.4 }
    ];

    return topics.map((t, i) => {
        const src = sources[Math.floor(Math.random() * sources.length)];
        return {
            id: `art_${i}_${Date.now()}`,
            title: t.title,
            summary: "Market analysis indicates significant movement following this announcement. Sector impact projected to be substantial over the next quarter.",
            source: src.name,
            url: src.baseUrl, 
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

// ===== CORE LOGIC =====
async function refreshData() {
    const refreshBtn = document.getElementById('refreshBtn');
    const icon = refreshBtn?.querySelector('i, svg');
    if(icon) icon.classList.add('fa-spin'); 
    
    // Simulate Fetch
    appState.articles = generateMockData();
    appState.articles.sort((a, b) => b.timeObj - a.timeObj);
    
    refreshUIComponents();

    setTimeout(() => {
        if(icon) icon.classList.remove('fa-spin');
        showNotification("Data Stream Synced", "success");
    }, 500);
}

function refreshUIComponents() {
    renderFeed();
    checkBreakingNews();
    updateQuickSaved();
    try { updateMapMarkers(); } catch(e) {}
    try { updateCharts(); } catch(e) {}
    try { updateAnalytics(); } catch(e) {}
    updateFilterCounts();
    safeCreateIcons();
}

function renderFeed() {
    const container = document.getElementById('articlesContainer');
    if(!container) return;
    
    container.innerHTML = '';
    
    let filtered = appState.articles.filter(a => {
        // Filter Logic
        if (appState.currentFilter === 'saved') return appState.savedArticles.includes(a.id);
        if (appState.currentFilter === 'unread') return !appState.readArticles.includes(a.id);
        if (appState.currentFilter === 'breaking') return a.impact === 'high';
        if (appState.currentFilter === 'all' || appState.currentFilter === 'search') return true;
        return a.tag === appState.currentFilter;
    });

    // Sort Logic
    const sortMode = document.getElementById('sortSelect')?.value || 'latest';
    if(sortMode === 'impact') filtered.sort((a,b) => (a.impact === 'high' ? -1 : 1));
    
    document.getElementById('articleCount').innerText = filtered.length;

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state"><div style="margin-bottom:10px;">NO SIGNAL</div><div>No intelligence data found.</div></div>`;
        return;
    }

    filtered.forEach(art => {
        const isRead = appState.readArticles.includes(art.id);
        const card = document.createElement('div');
        card.className = `news-card ${art.impact === 'high' ? 'breaking' : ''} ${isRead ? 'read' : 'unread'}`;
        card.id = art.id;
        
        card.innerHTML = `
            <div class="card-body">
                <div class="card-header">
                    <span>${art.source}</span>
                    <span>${art.time}</span>
                </div>
                <h3 class="card-title" onclick="openReader('${art.id}')">${art.title}</h3>
                <p class="card-summary">${art.summary}</p>
                <div class="card-footer">
                    <span class="tag ${art.tag}">${art.tag.toUpperCase()}</span>
                    <button class="card-action-btn" onclick="toggleBookmark('${art.id}')">
                        <i data-lucide="bookmark" class="${appState.savedArticles.includes(art.id) ? 'fill-current' : ''}"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    safeCreateIcons();
}

// ===== SETTINGS LOGIC =====
function saveSettings() {
    appState.settings.cyberpunk = document.getElementById('cyberpunkToggle').checked;
    appState.settings.breakingNews = document.getElementById('breakingNewsToggle').checked;
    appState.settings.liveSim = document.getElementById('liveSimToggle').checked;
    appState.settings.autoMarkRead = document.getElementById('autoMarkReadToggle').checked;
    
    appState.settings.geminiKey = document.getElementById('geminiKey').value;
    appState.settings.newsApiKey = document.getElementById('newsApiKey').value;
    appState.settings.viewMode = document.getElementById('defaultViewSelect').value;
    appState.settings.accentColor = document.getElementById('accentColorPicker').value;

    localStorage.setItem('nexus_settings', JSON.stringify(appState.settings));
    
    applySettings();
    applyViewMode(appState.settings.viewMode);
    
    document.getElementById('settingsModal').classList.remove('active');
    showNotification("Configuration Saved", "success");
}

function applySettings() {
    if (appState.settings.cyberpunk) { 
        document.body.classList.add('cyberpunk-active'); 
        document.querySelectorAll('.scanlines, .crt-flicker, .glow-overlay').forEach(el => el.style.display = 'block'); 
    } else { 
        document.body.classList.remove('cyberpunk-active'); 
        document.querySelectorAll('.scanlines, .crt-flicker, .glow-overlay').forEach(el => el.style.display = 'none'); 
    }
    
    // Apply accent color
    document.documentElement.style.setProperty('--color-electric-green', appState.settings.accentColor);
    
    // Sync UI inputs with state
    if(document.getElementById('cyberpunkToggle')) document.getElementById('cyberpunkToggle').checked = appState.settings.cyberpunk;
    if(document.getElementById('breakingNewsToggle')) document.getElementById('breakingNewsToggle').checked = appState.settings.breakingNews;
    if(document.getElementById('defaultViewSelect')) document.getElementById('defaultViewSelect').value = appState.settings.viewMode;
    if(document.getElementById('accentColorPicker')) document.getElementById('accentColorPicker').value = appState.settings.accentColor;
}

function applyViewMode(mode) {
    const container = document.getElementById('articlesContainer');
    if(!container) return;
    
    if (mode === 'grid') container.classList.add('grid-view');
    else container.classList.remove('grid-view');
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        if (btn.dataset.view === mode) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

// ===== UTILS =====
function toggleBookmark(id) {
    const index = appState.savedArticles.indexOf(id);
    if (index === -1) { 
        appState.savedArticles.push(id); 
        showNotification("Article Saved", "success"); 
    } else { 
        appState.savedArticles.splice(index, 1); 
        showNotification("Article Removed", "info"); 
    }
    localStorage.setItem('nexus_saved', JSON.stringify(appState.savedArticles));
    refreshUIComponents();
}

function showNotification(text, type = 'info') {
    const el = document.getElementById('notificationArea');
    const txt = document.getElementById('notificationText');
    if(!el || !txt) return;
    
    txt.innerText = text;
    el.className = `notification ${type}`;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 3000);
}

function toggleSearch() {
    const modal = document.getElementById('searchModal');
    if(!modal) return;
    modal.classList.toggle('active');
    if(modal.classList.contains('active')) {
        setTimeout(() => document.getElementById('searchInput')?.focus(), 100);
    }
}

// Placeholder for missing functions to prevent crashes
function initCharts() { /* Chart initialization logic */ }
function initMap() { /* Map initialization logic */ }
function updateMapMarkers() {}
function updateCharts() {}
function updateAnalytics() {}
function startLiveSimulation() {}
function startClock() {}
function startFakeLogStream() {}
function initTooltip() {}
function renderMutedKeywords() {}
function renderHighlightKeywords() {}
function checkBreakingNews() {}
function updateQuickSaved() {}
function forceBreakingNews() {}
function toggleTLDR() {}
function openReader() {}

// Start everything
window.onload = init;
