// ===== ENHANCED APP STATE =====
const appState = {
    // Existing state remains
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
    
    // New state for Zen Mode
    zenMode: false,
    zenFontSize: parseInt(localStorage.getItem('zenFontSize')) || 16,
    zenDarkMode: localStorage.getItem('zenDarkMode') !== 'false',
    
    // New state for Knowledge Graph
    knowledgeGraph: null,
    graphData: null,
    
    // New state for Startup Tracker
    startups: JSON.parse(localStorage.getItem('nexus_startups') || '[]'),
    selectedStartupId: null
};

// ===== STARTUP DATA MODEL =====
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
        competitors: ['Anthropic', 'OpenAI', 'Cohere'],
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
        competitors: ['TAE Technologies', 'Commonwealth Fusion'],
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
        competitors: ['TripleBlind', 'Opaque Systems'],
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
        competitors: ['BrainChip', 'Mythic AI'],
        founded: '2023',
        employees: 52,
        location: 'Tokyo, Japan',
        tags: ['hardware', 'edge-computing', 'neuromorphic'],
        fundingRounds: [
            { date: '2023-03-01', amount: 5, stage: 'seed', investors: ['University of Tokyo'] },
            { date: '2024-11-30', amount: 33, stage: 'series_a', investors: ['Intel Capital', 'Qualcomm Ventures'] }
        ]
    },
    {
        id: 'startup_5',
        name: 'Climate Forecast AI',
        founder: 'Dr. Maria Gonzalez',
        description: 'AI-powered climate risk modeling for insurance and agriculture',
        website: 'https://climateforecast.ai',
        stage: 'acquired',
        valuation: 450,
        raised: 28,
        investors: ['Climate Capital', 'SoftBank', 'Goldman Sachs'],
        lastRound: '2024-08-15',
        technology: 'Climate Modeling, ML, Satellite Data Analysis',
        market: 'Climate Tech & Insurance',
        competitors: ['ClimateAI', 'Jupiter Intelligence'],
        founded: '2021',
        employees: 65,
        location: 'London, UK',
        tags: ['climate', 'insurance', 'agriculture'],
        fundingRounds: [
            { date: '2021-11-01', amount: 2, stage: 'pre_seed', investors: ['Climate Capital'] },
            { date: '2022-09-15', amount: 8, stage: 'seed', investors: ['SoftBank'] },
            { date: '2024-08-15', amount: 18, stage: 'series_a', investors: ['Goldman Sachs'] }
        ]
    }
];

// Initialize startups if empty
if (appState.startups.length === 0) {
    appState.startups = startupMockData;
    localStorage.setItem('nexus_startups', JSON.stringify(appState.startups));
}

// ===== ZEN MODE FUNCTIONS =====
function toggleZenMode(article = null) {
    appState.zenMode = !appState.zenMode;
    const overlay = document.getElementById('zenModeOverlay');
    
    if (appState.zenMode) {
        overlay.classList.add('active');
        if (appState.zenDarkMode) {
            overlay.classList.remove('light-mode');
        } else {
            overlay.classList.add('light-mode');
        }
        
        if (article) {
            loadArticleIntoZenMode(article);
        } else {
            // Load current article or default content
            const defaultContent = `
                <h1>Zen Reading Mode</h1>
                <p>Welcome to distraction-free reading. This mode removes all UI elements for focused reading.</p>
                <p>Use the controls above to adjust font size or toggle dark/light mode.</p>
                <p>Return to the main dashboard by clicking the close button or pressing ESC.</p>
            `;
            document.getElementById('zenContent').innerHTML = defaultContent;
        }
        
        updateZenFontSize();
        showNotification("Zen Mode Activated", "info");
    } else {
        overlay.classList.remove('active');
        showNotification("Zen Mode Deactivated", "info");
    }
}

function loadArticleIntoZenMode(article) {
    const content = `
        <h1>${article.title}</h1>
        <div style="display: flex; gap: 15px; margin-bottom: 30px; font-size: 0.9rem; color: var(--color-text-muted);">
            <span><i data-lucide="globe" style="width: 14px;"></i> ${article.source}</span>
            <span>•</span>
            <span>${article.time}</span>
            <span>•</span>
            <span>~${calculateReadTime(article.summary)} min read</span>
        </div>
        <p style="font-size: 1.2rem; line-height: 1.8; color: ${appState.zenDarkMode ? '#d0d0e0' : '#444'};">
            ${article.summary}
        </p>
        ${article.aiAnalysis && article.aiAnalysis !== 'loading' ? `
            <h2>AI Analysis</h2>
            <div style="background: ${appState.zenDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)'}; padding: 20px; border-radius: 8px; border-left: 3px solid var(--color-data-blue);">
                ${article.aiAnalysis}
            </div>
        ` : ''}
        ${article.tag === 'startup' ? `
            <h2>Startup Details</h2>
            <p>This intelligence item is connected to startup tracking. Open the Startup Dashboard for detailed investment analysis.</p>
        ` : ''}
    `;
    
    document.getElementById('zenContent').innerHTML = content;
    if(window.lucide) window.lucide.createIcons();
}

function updateZenFontSize() {
    const content = document.getElementById('zenContent');
    content.style.fontSize = `${appState.zenFontSize}px`;
    localStorage.setItem('zenFontSize', appState.zenFontSize);
}

function increaseZenFontSize() {
    if (appState.zenFontSize < 24) {
        appState.zenFontSize += 1;
        updateZenFontSize();
    }
}

function decreaseZenFontSize() {
    if (appState.zenFontSize > 12) {
        appState.zenFontSize -= 1;
        updateZenFontSize();
    }
}

function toggleZenDarkMode() {
    appState.zenDarkMode = !appState.zenDarkMode;
    const overlay = document.getElementById('zenModeOverlay');
    
    if (appState.zenDarkMode) {
        overlay.classList.remove('light-mode');
    } else {
        overlay.classList.add('light-mode');
    }
    
    localStorage.setItem('zenDarkMode', appState.zenDarkMode);
    showNotification(`Zen Mode: ${appState.zenDarkMode ? 'Dark' : 'Light'}`, "info");
}

// ===== KNOWLEDGE GRAPH FUNCTIONS =====
function openKnowledgeGraph() {
    document.getElementById('knowledgeGraphModal').classList.add('active');
    if (!appState.graphData) {
        generateKnowledgeGraphData();
    }
    renderKnowledgeGraph();
}

function generateKnowledgeGraphData() {
    // Generate nodes and edges from articles and startups
    const nodes = [];
    const edges = [];
    let nodeId = 1;
    
    // Add startups as nodes
    appState.startups.forEach((startup, index) => {
        nodes.push({
            id: nodeId,
            label: startup.name,
            color: getStartupColor(startup.stage),
            shape: 'box',
            font: { size: 16, color: '#fff' },
            value: startup.valuation / 50,
            title: `
                <strong>${startup.name}</strong><br/>
                Stage: ${startup.stage.toUpperCase().replace('_', ' ')}<br/>
                Raised: $${startup.raised}M<br/>
                Valuation: $${startup.valuation}M
            `
        });
        const startupNodeId = nodeId;
        nodeId++;
        
        // Add investors as nodes and edges
        if (startup.investors && Array.isArray(startup.investors)) {
            startup.investors.forEach(investor => {
                let investorNode = nodes.find(n => n.label === investor);
                if (!investorNode) {
                    nodes.push({
                        id: nodeId,
                        label: investor,
                        color: '#0095ff',
                        shape: 'circle',
                        font: { size: 14, color: '#fff' },
                        value: 10
                    });
                    investorNode = { id: nodeId };
                    nodeId++;
                }
                
                edges.push({
                    from: startupNodeId,
                    to: investorNode.id,
                    color: { color: '#0095ff', opacity: 0.6 },
                    width: 2
                });
            });
        }
        
        // Add technology nodes
        if (startup.technology) {
            const techs = startup.technology.split(',').map(t => t.trim());
            techs.forEach(tech => {
                let techNode = nodes.find(n => n.label === tech);
                if (!techNode) {
                    nodes.push({
                        id: nodeId,
                        label: tech,
                        color: '#ff9f43',
                        shape: 'database',
                        font: { size: 12, color: '#fff' },
                        value: 5
                    });
                    techNode = { id: nodeId };
                    nodeId++;
                }
                
                edges.push({
                    from: startupNodeId,
                    to: techNode.id,
                    color: { color: '#ff9f43', opacity: 0.6 },
                    width: 1.5,
                    dashes: true
                });
            });
        }
    });
    
    // Add high-impact articles as nodes
    appState.articles.filter(a => a.impact === 'high').slice(0, 5).forEach(article => {
        nodes.push({
            id: nodeId,
            label: article.title.substring(0, 20) + '...',
            color: '#ff4757',
            shape: 'triangle',
            font: { size: 12, color: '#fff' },
            value: 15
        });
        nodeId++;
    });
    
    appState.graphData = { nodes, edges };
}

function getStartupColor(stage) {
    switch(stage) {
        case 'seed': return '#00ff9d';
        case 'series_a': return '#0095ff';
        case 'series_b': return '#ff9f43';
        case 'acquired': return '#8a2be2';
        default: return '#7a7a8a';
    }
}

function renderKnowledgeGraph() {
    const container = document.getElementById('knowledgeGraphNetwork');
    if (!container || !appState.graphData) return;
    
    const options = {
        nodes: {
            borderWidth: 1,
            borderWidthSelected: 3,
            shapeProperties: {
                useBorderWithImage: true
            },
            font: {
                face: 'Inter, sans-serif'
            }
        },
        edges: {
            smooth: {
                type: 'continuous'
            },
            arrows: {
                to: { enabled: true, scaleFactor: 0.5 }
            }
        },
        physics: {
            enabled: true,
            stabilization: {
                enabled: true,
                iterations: 1000
            },
            barnesHut: {
                gravitationalConstant: -2000,
                centralGravity: 0.3,
                springLength: 95,
                springConstant: 0.04,
                damping: 0.09,
                avoidOverlap: 0.1
            }
        },
        interaction: {
            hover: true,
            tooltipDelay: 200,
            hideEdgesOnDrag: true
        },
        layout: {
            improvedLayout: true
        }
    };
    
    if (appState.knowledgeGraph) {
        appState.knowledgeGraph.destroy();
    }
    
    appState.knowledgeGraph = new vis.Network(container, appState.graphData, options);
    
    // Add event listeners
    appState.knowledgeGraph.on('click', function(params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const node = appState.graphData.nodes.find(n => n.id === nodeId);
            if (node) {
                showNotification(`Selected: ${node.label}`, "info");
            }
        }
    });
}

// ===== STARTUP TRACKER FUNCTIONS =====
function openStartupDashboard() {
    document.getElementById('startupDashboardModal').classList.add('active');
    updateStartupDashboard();
    renderStartupList();
    
    // Initialize funding timeline chart
    initFundingTimelineChart();
}

function updateStartupDashboard() {
    const totalStartups = appState.startups.length;
    const totalFunding = appState.startups.reduce((sum, s) => sum + s.raised, 0);
    const activeRounds = appState.startups.filter(s => !['acquired', 'public'].includes(s.stage)).length;
    const allInvestors = appState.startups.flatMap(s => s.investors || []);
    const uniqueInvestors = [...new Set(allInvestors)].length;
    
    document.getElementById('totalStartups').textContent = totalStartups;
    document.getElementById('totalFunding').textContent = `$${totalFunding.toFixed(1)}B`;
    document.getElementById('activeRounds').textContent = activeRounds;
    document.getElementById('topInvestors').textContent = uniqueInvestors;
    
    // Update sidebar stats
    updateStartupSidebarStats();
}

function updateStartupSidebarStats() {
    const seedCount = appState.startups.filter(s => s.stage === 'seed').length;
    const seriesACount = appState.startups.filter(s => s.stage === 'series_a').length;
    const seriesBCount = appState.startups.filter(s => s.stage === 'series_b' || s.stage === 'series_c').length;
    const total = appState.startups.length;
    
    document.getElementById('seedCount').textContent = seedCount;
    document.getElementById('seriesACount').textContent = seriesACount;
    document.getElementById('seriesBCount').textContent = seriesBCount;
    
    document.getElementById('seedBar').style.width = `${(seedCount / total) * 100}%`;
    document.getElementById('seriesABar').style.width = `${(seriesACount / total) * 100}%`;
    document.getElementById('seriesBBar').style.width = `${(seriesBCount / total) * 100}%`;
}

function renderStartupList() {
    const container = document.getElementById('startupList');
    const filter = document.getElementById('startupFilter').value;
    
    let filteredStartups = appState.startups;
    if (filter !== 'all') {
        filteredStartups = appState.startups.filter(s => s.stage === filter);
    }
    
    container.innerHTML = filteredStartups.map(startup => `
        <div class="startup-item ${startup.id === appState.selectedStartupId ? 'selected' : ''}" 
             onclick="selectStartup('${startup.id}')">
            <div class="startup-item-header">
                <div class="startup-name">${startup.name}</div>
                <span class="startup-stage-badge stage-${startup.stage}">${startup.stage.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div class="startup-meta">
                <span><i data-lucide="user" size="12"></i> ${startup.founder}</span>
                <span><i data-lucide="map-pin" size="12"></i> ${startup.location || 'N/A'}</span>
            </div>
            <div class="startup-funding">$${startup.raised}M raised</div>
            <div class="funding-progress">
                <div class="funding-progress-fill" style="width: ${Math.min((startup.raised / startup.valuation) * 100, 100)}%"></div>
            </div>
            <div style="margin-top: 8px; font-size: 0.75rem; color: var(--color-text-secondary);">
                ${startup.description.substring(0, 80)}...
            </div>
        </div>
    `).join('');
    
    if(window.lucide) window.lucide.createIcons();
    
    // If no startup selected and we have startups, select first one
    if (!appState.selectedStartupId && filteredStartups.length > 0) {
        selectStartup(filteredStartups[0].id);
    }
}

function selectStartup(startupId) {
    appState.selectedStartupId = startupId;
    const startup = appState.startups.find(s => s.id === startupId);
    if (!startup) return;
    
    renderStartupList(); // Re-render to update selection
    
    // Format investors as tags
    const investorTags = startup.investors && Array.isArray(startup.investors) 
        ? startup.investors.map(inv => `<span class="investor-tag">${inv}</span>`).join('')
        : '<span style="color: var(--color-text-muted); font-style: italic;">No investors listed</span>';
    
    // Format competitors
    const competitors = startup.competitors 
        ? startup.competitors.split(',').map(c => `<li>${c.trim()}</li>`).join('')
        : '<li style="color: var(--color-text-muted); font-style: italic;">No competitors listed</li>';
    
    const detailsHTML = `
        <div class="detail-section">
            <h4><i data-lucide="info"></i> Overview</h4>
            <p style="font-size: 0.95rem; line-height: 1.6; color: var(--color-text-secondary); margin-bottom: 20px;">
                ${startup.description}
            </p>
            
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Founded</div>
                    <div class="detail-value">${startup.founded || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Employees</div>
                    <div class="detail-value">${startup.employees || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Valuation</div>
                    <div class="detail-value">$${startup.valuation}M</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Total Raised</div>
                    <div class="detail-value">$${startup.raised}M</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h4><i data-lucide="users"></i> Investors</h4>
            <div style="margin-top: 10px;">
                ${investorTags}
            </div>
        </div>
        
        <div class="detail-section">
            <h4><i data-lucide="target"></i> Technology & Market</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Core Technology</div>
                    <div class="detail-value">${startup.technology || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Target Market</div>
                    <div class="detail-value">${startup.market || 'N/A'}</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h4><i data-lucide="shield"></i> Competition</h4>
            <ul style="margin-top: 10px; padding-left: 20px; color: var(--color-text-secondary);">
                ${competitors}
            </ul>
        </div>
        
        <div class="detail-section">
            <h4><i data-lucide="external-link"></i> Links</h4>
            <a href="${startup.website}" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; color: var(--color-electric-green); text-decoration: none; margin-top: 10px;">
                <i data-lucide="globe" size="14"></i> Visit Website
            </a>
        </div>
    `;
    
    document.getElementById('startupDetails').innerHTML = detailsHTML;
    if(window.lucide) window.lucide.createIcons();
    
    // Update funding timeline chart
    updateFundingTimelineChart(startup);
}

function initFundingTimelineChart() {
    const options = {
        chart: {
            type: 'line',
            height: 200,
            background: 'transparent',
            toolbar: { show: false }
        },
        series: [],
        xaxis: { type: 'datetime', labels: { style: { colors: '#7a7a8a' } } },
        yaxis: { 
            labels: { 
                style: { colors: '#7a7a8a' },
                formatter: function(value) {
                    return '$' + value + 'M';
                }
            }
        },
        stroke: { width: 3, curve: 'smooth' },
        markers: { size: 5 },
        colors: ['#00ff9d', '#0095ff', '#ff9f43'],
        grid: { borderColor: 'rgba(255,255,255,0.1)' },
        tooltip: {
            theme: 'dark',
            x: { format: 'MMM yyyy' },
            y: { formatter: function(value) { return '$' + value + 'M'; } }
        }
    };
    
    appState.charts.fundingTimeline = new ApexCharts(document.querySelector("#fundingTimelineChart"), options);
    appState.charts.fundingTimeline.render();
}

function updateFundingTimelineChart(startup) {
    if (!startup.fundingRounds || startup.fundingRounds.length === 0) {
        appState.charts.fundingTimeline.updateSeries([]);
        return;
    }
    
    const seriesData = startup.fundingRounds.map(round => ({
        x: new Date(round.date).getTime(),
        y: round.amount
    }));
    
    const series = [{
        name: 'Funding Amount',
        data: seriesData
    }];
    
    appState.charts.fundingTimeline.updateSeries(series);
}

function addStartup() {
    document.getElementById('addStartupModal').classList.add('active');
}

function saveStartup() {
    const name = document.getElementById('startupName').value;
    const founder = document.getElementById('startupFounder').value;
    const description = document.getElementById('startupDescription').value;
    const website = document.getElementById('startupWebsite').value;
    const stage = document.getElementById('startupStage').value;
    const valuation = parseFloat(document.getElementById('startupValuation').value) || 0;
    const raised = parseFloat(document.getElementById('startupRaised').value) || 0;
    const investors = document.getElementById('startupInvestors').value.split(',').map(i => i.trim());
    const lastRound = document.getElementById('startupLastRound').value;
    const technology = document.getElementById('startupTechnology').value;
    const market = document.getElementById('startupMarket').value;
    const competitors = document.getElementById('startupCompetitors').value;
    
    if (!name || !founder) {
        showNotification("Please fill in required fields", "error");
        return;
    }
    
    const newStartup = {
        id: `startup_${Date.now()}`,
        name,
        founder,
        description,
        website,
        stage,
        valuation,
        raised,
        investors,
        lastRound,
        technology,
        market,
        competitors,
        founded: new Date().getFullYear().toString(),
        employees: Math.floor(Math.random() * 100) + 10,
        location: 'San Francisco, CA',
        tags: [],
        fundingRounds: [
            {
                date: lastRound || new Date().toISOString().split('T')[0],
                amount: raised,
                stage: stage,
                investors: investors
            }
        ]
    };
    
    appState.startups.push(newStartup);
    localStorage.setItem('nexus_startups', JSON.stringify(appState.startups));
    
    document.getElementById('addStartupModal').classList.remove('active');
    renderStartupList();
    updateStartupDashboard();
    showNotification(`${name} added to tracker`, "success");
    
    // Clear form
    document.getElementById('addStartupModal').querySelectorAll('input, textarea').forEach(el => el.value = '');
}

// ===== UPDATED MOCK DATA GENERATION =====
const generateMockData = () => {
    const sources = [
        { name: 'Reuters', baseUrl: 'https://www.reuters.com/site-search/?query=' },
        { name: 'TechCrunch', baseUrl: 'https://techcrunch.com/?s=' },
        { name: 'Bloomberg', baseUrl: 'https://www.bloomberg.com/search?query=' },
        { name: 'Wired', baseUrl: 'https://www.wired.com/search/?q=' },
        { name: 'The Verge', baseUrl: 'https://www.theverge.com/search?q=' }
    ];
    
    // Startup-specific articles
    const startupArticles = appState.startups.map((startup, i) => ({
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
};

// ===== UPDATED RENDER FUNCTIONS =====
function getTagIcon(tag) {
    if(tag === 'ai') return 'cpu';
    if(tag === 'energy') return 'zap';
    if(tag === 'policy') return 'scale';
    if(tag === 'realestate') return 'building';
    if(tag === 'startup') return 'rocket';
    return 'tag';
}

// Add startup stage indicator to card rendering
function getStageBadge(stage) {
    const stages = {
        'pre_seed': { label: 'PRE-SEED', color: '#7a7a8a' },
        'seed': { label: 'SEED', color: '#00ff9d' },
        'series_a': { label: 'SERIES A', color: '#0095ff' },
        'series_b': { label: 'SERIES B+', color: '#ff9f43' },
        'acquired': { label: 'ACQUIRED', color: '#8a2be2' },
        'public': { label: 'PUBLIC', color: '#ff4757' }
    };
    
    const stageInfo = stages[stage] || stages.seed;
    return `<span class="startup-stage-indicator" style="background: ${stageInfo.color}20; color: ${stageInfo.color}; border: 1px solid ${stageInfo.color}40;">${stageInfo.label}</span>`;
}

// Update renderFeed to include startup cards
// In the filtered.forEach loop, add:
if (art.tag === 'startup') {
    const startup = appState.startups.find(s => s.id === art.startupId);
    if (startup) {
        // Add startup-specific elements to card
        sparkline = generateSparkline();
        displayTitle += ` ${getStageBadge(startup.stage)}`;
        
        // Add funding info to summary
        displaySummary = `${startup.description.substring(0, 120)}... Raised: $${startup.raised}M at $${startup.valuation}M valuation.`;
    }
}

// ===== UPDATED EVENT LISTENERS =====
function setupEventListeners() {
    // Existing event listeners...
    
    // New Zen Mode listeners
    document.getElementById('zenModeBtn').addEventListener('click', () => toggleZenMode());
    document.getElementById('zenFontIncrease').addEventListener('click', increaseZenFontSize);
    document.getElementById('zenFontDecrease').addEventListener('click', decreaseZenFontSize);
    document.getElementById('zenToggleDark').addEventListener('click', toggleZenDarkMode);
    
    // Knowledge Graph listeners
    document.getElementById('knowledgeGraphBtn').addEventListener('click', openKnowledgeGraph);
    document.getElementById('closeGraphBtn').addEventListener('click', () => {
        document.getElementById('knowledgeGraphModal').classList.remove('active');
    });
    document.getElementById('graphResetView').addEventListener('click', () => {
        if (appState.knowledgeGraph) {
            appState.knowledgeGraph.fit();
        }
    });
    
    // Startup Dashboard listeners
    document.getElementById('startupDashboardBtn').addEventListener('click', openStartupDashboard);
    document.getElementById('closeStartupDashboardBtn').addEventListener('click', () => {
        document.getElementById('startupDashboardModal').classList.remove('active');
    });
    document.getElementById('addStartupBtn').addEventListener('click', addStartup);
    document.getElementById('saveStartupBtn').addEventListener('click', saveStartup);
    document.getElementById('startupFilter').addEventListener('change', renderStartupList);
    
    // Update keyboard shortcuts
    document.addEventListener('keydown', (e) => { 
        if((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); toggleSearch(); } 
        if(e.key === 'Escape') { 
            document.getElementById('searchModal').classList.remove('active'); 
            document.getElementById('settingsModal').classList.remove('active'); 
            document.getElementById('helpModal').classList.remove('active');
            document.getElementById('readerModal').classList.remove('active');
            document.getElementById('infoModal').classList.remove('active');
            document.getElementById('knowledgeGraphModal').classList.remove('active');
            document.getElementById('startupDashboardModal').classList.remove('active');
            document.getElementById('addStartupModal').classList.remove('active');
            document.getElementById('rightSidebar').classList.remove('mobile-active');
            if(appState.bulkMode) toggleBulkMode();
            if(appState.zenMode) toggleZenMode();
        }
        if(e.key === 'z' || e.key === 'Z') { 
            e.preventDefault();
            toggleZenMode(); 
        }
        if(e.key === 'g' || e.key === 'G') { 
            e.preventDefault();
            openKnowledgeGraph(); 
        }
        if(e.key === 't' || e.key === 'T') { 
            e.preventDefault();
            openStartupDashboard(); 
        }
        // ... rest of existing shortcuts
    });
}

// ===== GLOBAL EXPORTS =====
window.toggleZenMode = toggleZenMode;
window.openKnowledgeGraph = openKnowledgeGraph;
window.openStartupDashboard = openStartupDashboard;
window.selectStartup = selectStartup;
window.addStartup = addStartup;
window.saveStartup = saveStartup;

// Initialize the app
init();
