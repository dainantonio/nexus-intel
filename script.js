// ===== APP STATE & NAMESPACE =====
const app = {
    // Core state
    articles: [],
    savedArticles: JSON.parse(localStorage.getItem('nexus_saved') || '[]'),
    readArticles: JSON.parse(localStorage.getItem('nexus_read') || '[]'),
    recentSearches: JSON.parse(localStorage.getItem('nexus_recent_searches') || '[]'),
    settings: JSON.parse(localStorage.getItem('nexus_settings') || '{"cyberpunk":false, "breakingNews":true, "liveSim":false, "viewMode":"row", "geminiKey":"", "newsApiKey":"", "gnewsApiKey":"", "accentColor":"#00ff9d", "mutedKeywords":[], "highlightKeywords":[], "autoMarkRead":true, "zenFontSize":16, "zenDarkMode":true}'),
    currentFilter: localStorage.getItem('nexus_filter') || 'all',
    viewMode: 'row',
    map: null,
    markers: {},
    charts: { sentiment: null, impact: null, fundingTimeline: null },
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
        duration: 5 * 60 * 1000
    },
    
    // New features state
    zenMode: false,
    zenFontSize: parseInt(localStorage.getItem('zenFontSize')) || 16,
    zenDarkMode: localStorage.getItem('zenDarkMode') !== 'false',
    
    knowledgeGraph: null,
    graphData: null,
    
    startups: JSON.parse(localStorage.getItem('nexus_startups') || '[]'),
    selectedStartupId: null,
    
    // ===== INITIALIZATION =====
    init: function() {
        // Initialize app on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.onReady.bind(this));
        } else {
            this.onReady();
        }
    },
    
    onReady: function() {
        // Initialize icons
        if(window.lucide) window.lucide.createIcons();
        
        // Ensure legacy settings compatibility
        if(!this.settings.mutedKeywords) this.settings.mutedKeywords = [];
        if(!this.settings.highlightKeywords) this.settings.highlightKeywords = [];
        if(this.settings.autoMarkRead === undefined) this.settings.autoMarkRead = true;
        
        // Initialize view mode from settings
        this.viewMode = this.settings.viewMode || 'row';
        
        // Restore UI state
        this.applySettings();
        this.applyViewMode(this.viewMode);
        
        // Restore filter UI state
        const activeFilter = document.querySelector(`.filter-chip[data-filter="${this.currentFilter}"]`);
        if(activeFilter) {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            activeFilter.classList.add('active');
        }
        
        // Restore sort order
        const savedSort = localStorage.getItem('nexus_sort_order');
        if(savedSort) document.getElementById('sortSelect').value = savedSort;
        
        // Initialize components
        this.initCharts();
        this.initMap();
        
        // Load data and restore scroll
        this.refreshData().then(() => {
            const savedScroll = localStorage.getItem('nexus_scroll_pos');
            if(savedScroll) {
                document.getElementById('mainFeed').scrollTop = parseInt(savedScroll);
            }
        });
        
        // Setup event listeners and start services
        this.setupEventListeners();
        this.startLiveSimulation();
        this.startClock();
        this.startFakeLogStream();
        this.initTooltip();
        this.renderMutedKeywords();
        this.renderHighlightKeywords();
        
        // Initialize startup data if empty
        if (this.startups.length === 0) {
            this.initializeStartupData();
        }
        
        console.log('Nexus Intel v4.1.0 initialized');
    },
    
    // ===== STARTUP DATA =====
    initializeStartupData: function() {
        const startupMockData = [
            {
                id: 'startup_1',
                name: 'NeuroSynth AI',
                founder: 'Dr. Elara Vance',
                description: 'AGI safety research with interpretability tools for large language models',
                website: 'https://neurosynth.ai',
                stage: 'series_a',
                valuation: 850,
                raised: 42,
                investors: ['a16z', 'Sequoia', 'OpenAI Fund', 'YC'],
                lastRound: '2025-03-15',
                technology: 'Interpretability, AI Safety, LLMs',
                market: 'Enterprise AI Safety',
                competitors: 'Anthropic, OpenAI, Cohere',
                founded: '2023',
                employees: 45,
                location: 'San Francisco, CA',
                tags: ['ai-safety', 'llm', 'research'],
                fundingRounds: [
                    { date: '2023-06-01', amount: 2.5, stage: 'pre_seed', investors: ['YC'] },
                    { date: '2024-01-15', amount: 8, stage: 'seed', investors: ['a16z', 'Sequoia'] },
                    { date: '2025-03-15', amount: 31.5, stage: 'series_a', investors: ['a16z', 'OpenAI Fund'] }
                ]
            },
            {
                id: 'startup_2',
                name: 'Quantum Core Energy',
                founder: 'Marcus Chen',
                description: 'AI-optimized nuclear fusion reactor design using quantum simulations',
                website: 'https://quantumcore.energy',
                stage: 'seed',
                valuation: 320,
                raised: 15,
                investors: ['Breakthrough Energy', 'DCVC', 'Temasek'],
                lastRound: '2025-01-20',
                technology: 'Quantum Computing, Nuclear Fusion, AI Simulation',
                market: 'Clean Energy',
                competitors: 'TAE Technologies, Commonwealth Fusion',
                founded: '2024',
                employees: 28,
                location: 'Boston, MA',
                tags: ['energy', 'quantum', 'fusion'],
                fundingRounds: [
                    { date: '2024-09-10', amount: 15, stage: 'seed', investors: ['Breakthrough Energy', 'DCVC'] }
                ]
            },
            {
                id: 'startup_3',
                name: 'DataFortress',
                founder: 'Sarah Johnson & Alex Rodriguez',
                description: 'Zero-knowledge proofs for enterprise data privacy in AI training',
                website: 'https://datafortress.io',
                stage: 'series_b',
                valuation: 1200,
                raised: 85,
                investors: ['Andreessen Horowitz', 'Tiger Global', 'Insight Partners'],
                lastRound: '2025-02-10',
                technology: 'ZK-Proofs, Federated Learning, Homomorphic Encryption',
                market: 'Data Privacy & Security',
                competitors: 'TripleBlind, Opaque Systems',
                founded: '2022',
                employees: 120,
                location: 'Austin, TX',
                tags: ['privacy', 'security', 'crypto'],
                fundingRounds: [
                    { date: '2022-08-01', amount: 3, stage: 'pre_seed', investors: ['YC'] },
                    { date: '2023-04-15', amount: 12, stage: 'seed', investors: ['Andreessen Horowitz'] },
                    { date: '2024-03-20', amount: 30, stage: 'series_a', investors: ['Tiger Global'] },
                    { date: '2025-02-10', amount: 40, stage: 'series_b', investors: ['Insight Partners', 'Andreessen Horowitz'] }
                ]
            },
            {
                id: 'startup_4',
                name: 'NeuroChip',
                founder: 'Dr. Kenji Tanaka',
                description: 'Neuromorphic computing chips for edge AI applications',
                website: 'https://neurochip.ai',
                stage: 'series_a',
                valuation: 650,
                raised: 38,
                investors: ['Intel Capital', 'Qualcomm Ventures', 'Samsung Next'],
                lastRound: '2024-11-30',
                technology: 'Neuromorphic Computing, ASIC Design, Edge AI',
                market: 'Edge Computing & IoT',
                competitors: 'BrainChip, Mythic AI',
                founded: '2023',
                employees: 52,
                location: 'Tokyo, Japan',
                tags: ['hardware', 'edge-computing', 'neuromorphic'],
                fundingRounds: [
                    { date: '2023-03-01', amount: 5, stage: 'seed', investors: ['University of Tokyo'] },
                    { date: '2024-11-30', amount: 33, stage: 'series_a', investors: ['Intel Capital', 'Qualcomm Ventures'] }
                ]
            }
        ];
        
        this.startups = startupMockData;
        localStorage.setItem('nexus_startups', JSON.stringify(this.startups));
    },
    
    // ===== UTILITY FUNCTIONS =====
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    calculateReadTime: function(text) {
        const wpm = 225;
        const words = text.trim().split(/\s+/).length;
        return Math.ceil(words / wpm);
    },
    
    generateSparkline: function() {
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
    },
    
    getTagIcon: function(tag) {
        const icons = {
            'ai': 'cpu',
            'energy': 'zap',
            'policy': 'scale',
            'realestate': 'building',
            'startup': 'rocket'
        };
        return icons[tag] || 'tag';
    },
    
    getStartupColor: function(stage) {
        switch(stage) {
            case 'seed': return '#00ff9d';
            case 'series_a': return '#0095ff';
            case 'series_b': return '#ff9f43';
            case 'series_c': return '#ff9f43';
            case 'acquired': return '#8a2be2';
            case 'public': return '#ff4757';
            default: return '#7a7a8a';
        }
    },
    
    // ===== DATA MANAGEMENT =====
    generateMockData: function() {
        const sources = [
            { name: 'Reuters', baseUrl: 'https://www.reuters.com/site-search/?query=' },
            { name: 'TechCrunch', baseUrl: 'https://techcrunch.com/?s=' },
            { name: 'Bloomberg', baseUrl: 'https://www.bloomberg.com/search?query=' },
            { name: 'Wired', baseUrl: 'https://www.wired.com/search/?q=' },
            { name: 'The Verge', baseUrl: 'https://www.theverge.com/search?q=' }
        ];
        
        // Startup-specific articles
        const startupArticles = this.startups.map((startup, i) => ({
            id: `startup_art_${i}_${Date.now()}`,
            title: `${startup.name} Raises $${startup.raised}M ${startup.stage.replace('_', ' ').toUpperCase()} Round`,
            summary: `${startup.name}, founded by ${startup.founder}, has secured $${startup.raised} million in funding. ${startup.description}`,
            source: 'TechCrunch',
            url: startup.website || '#',
            timeObj: new Date(Date.now() - Math.floor(Math.random() * 7) * 86400000),
            time: `${Math.floor(Math.random() * 7) + 1}d ago`,
            tag: 'startup',
            impact: startup.raised > 50 ? 'high' : 'medium',
            impactScore: (startup.raised / 10 + 5).toFixed(1),
            startupId: startup.id,
            stage: startup.stage,
            lat: 37.7749 + (Math.random() - 0.5) * 10,
            lng: -122.4194 + (Math.random() - 0.5) * 10,
            aiAnalysis: null
        }));
        
        const otherTopics = [
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

        const otherArticles = otherTopics.map((t, i) => {
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
        
        return [...startupArticles, ...otherArticles];
    },
    
    async fetchRSS() {
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
                        tag: this.determineTag(item.title, item.description),
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
    },
    
    determineTag: function(title, desc) {
        const text = (title + " " + (desc||"")).toLowerCase();
        if(text.includes('energy') || text.includes('nuclear') || text.includes('grid')) return 'energy';
        if(text.includes('policy') || text.includes('regulation') || text.includes('law')) return 'policy';
        if(text.includes('real estate') || text.includes('data center')) return 'realestate';
        if(text.includes('startup') || text.includes('funding') || text.includes('series')) return 'startup';
        return 'ai';
    },
    
    async fetchRealNews() {
        const now = Date.now();
        if (this.cache.data && (now - this.cache.timestamp < this.cache.duration)) {
            return this.cache.data;
        }

        let newsData = [];
        try {
            const rss = await this.fetchRSS(); 
            if(rss.length > 0) newsData = rss; 
        } catch(e) {
            console.log("RSS fetch failed, using mock data");
        }
        
        if (newsData.length === 0) newsData = this.generateMockData();

        this.cache.data = newsData;
        this.cache.timestamp = now;
        return newsData;
    },
    
    async refreshData() {
        const refreshBtn = document.getElementById('refreshBtn');
        const icon = refreshBtn?.querySelector('svg') || refreshBtn?.querySelector('i');
        if(icon) icon.classList.add('fa-spin'); 
        
        if (this.articles.length === 0) this.renderSkeletonLoader(); 
        
        const newArticles = await this.fetchRealNews();
        
        if (newArticles.length !== this.articles.length || newArticles[0]?.id !== this.articles[0]?.id) {
            this.articles = newArticles;
            this.articles.sort((a, b) => b.timeObj - a.timeObj);
            this.refreshUIComponents();
        } else {
            console.log("Data up to date, skipping re-render.");
        }

        if(icon) icon.classList.remove('fa-spin');
        this.showNotification("Data Stream Synced", "success");
    },
    
    refreshUIComponents: function() {
        this.renderFeed(); 
        this.checkBreakingNews(); 
        this.updateQuickSaved(); 
        this.updateMapMarkers(); 
        this.updateCharts(); 
        this.updateAnalytics(); 
        this.updateTLDRWidget(); 
        this.updateFilterCounts();
        this.updateStartupSidebarStats();
        if(window.lucide) window.lucide.createIcons();
    },
    
    renderSkeletonLoader: function() {
        const container = document.getElementById('articlesContainer');
        const isGrid = this.viewMode === 'grid';
        container.innerHTML = Array(isGrid ? 6 : 4).fill(0).map(() => `
            <div class="news-card"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text" style="width: 80%;"></div><div style="margin-top: 15px;"><div class="skeleton skeleton-tag"></div></div></div>
        `).join('');
    },
    
    // ===== CORE UI FUNCTIONS =====
    applyViewMode: function(mode) {
        this.viewMode = mode;
        const container = document.getElementById('articlesContainer');
        const buttons = document.querySelectorAll('.view-btn');
        if (mode === 'grid') container.classList.add('grid-view');
        else container.classList.remove('grid-view');
        buttons.forEach(btn => {
            if (btn.dataset.view === mode) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        this.settings.viewMode = mode;
        localStorage.setItem('nexus_settings', JSON.stringify(this.settings));
        const select = document.getElementById('defaultViewSelect');
        if(select) select.value = mode;
    },
    
    toggleViewMode: function() {
        const newMode = this.viewMode === 'row' ? 'grid' : 'row';
        this.applyViewMode(newMode);
        this.showNotification(`Switched to ${newMode.charAt(0).toUpperCase() + newMode.slice(1)} View`, 'info');
    },
    
