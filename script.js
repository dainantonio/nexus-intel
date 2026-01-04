// ===== APP STATE =====
const appState = {
    articles: [],
    savedArticles: JSON.parse(localStorage.getItem('nexus_saved') || '[]'),
    readArticles: JSON.parse(localStorage.getItem('nexus_read') || '[]'),
    settings: JSON.parse(localStorage.getItem('nexus_settings') || '{"cyberpunk":false, "breakingNews":true, "viewMode":"row", "geminiKey":""}'),
    currentFilter: 'all',
    viewMode: 'row',
    map: null,
    markers: {},
    charts: { sentiment: null, impact: null }
};

// ===== INITIALIZATION =====
function init() {
    if(window.lucide) window.lucide.createIcons();
    applySettings();
    initCharts();
    initMap();
    refreshData();
    setupEventListeners();
    startClock();
}

// ===== CORE FUNCTIONS =====
async function refreshData() {
    // This would typically fetch from RSS or APIs
    appState.articles = generateMockData(); 
    refreshUIComponents();
}

function refreshUIComponents() {
    renderFeed();
    updateMapMarkers();
    updateCharts();
}

function renderFeed() {
    const container = document.getElementById('articlesContainer');
    container.innerHTML = appState.articles.map(art => `
        <div class="news-card" data-category="${art.tag}">
            <div class="card-body">
                <h3 onclick="openReader('${art.id}')">${art.title}</h3>
                <p>${art.summary}</p>
                <button onclick="toggleBookmark('${art.id}')">Save</button>
            </div>
        </div>
    `).join('');
    if(window.lucide) window.lucide.createIcons();
}

function setupEventListeners() {
    document.getElementById('refreshBtn').addEventListener('click', refreshData);
    document.getElementById('tldrToggleBtn').addEventListener('click', toggleTLDR);
    // ... all other event listeners ...
}

// ... All other functions like generateMockData, openReader, initMap, etc. ...

window.onload = init;
