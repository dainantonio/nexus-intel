const appState = {
    articles: [],
    savedArticles: JSON.parse(localStorage.getItem('nexus_saved') || '[]'),
    readArticles: JSON.parse(localStorage.getItem('nexus_read') || '[]'),
    settings: { cyberpunk: true, viewMode: "row" },
    currentFilter: 'all',
    zenMode: false,
    graphNodes: []
};

// ===== ZEN MODE =====
function toggleZenMode() {
    appState.zenMode = !appState.zenMode;
    document.body.classList.toggle('zen-mode', appState.zenMode);
    
    const zenBtn = document.getElementById('zenModeToggle');
    if (zenBtn) {
        const icon = zenBtn.querySelector('i');
        icon.setAttribute('data-lucide', appState.zenMode ? 'minimize-2' : 'maximize-2');
        if(window.lucide) window.lucide.createIcons();
    }
    showNotification(appState.zenMode ? "ZEN_MODE: ENABLED" : "ZEN_MODE: DISABLED", "info");
}

// ===== KNOWLEDGE GRAPH =====
function initKnowledgeGraph() {
    const canvas = document.getElementById('graphCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 450;

    appState.graphNodes = appState.articles.map(art => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        color: art.tag === 'ai' ? '#0095ff' : '#00ff9d'
    }));

    function animate() {
        if (!document.getElementById('graphModal').classList.contains('active')) return;
        ctx.fillStyle = '#08080a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 0.5;
        for (let i = 0; i < appState.graphNodes.length; i++) {
            for (let j = i + 1; j < appState.graphNodes.length; j++) {
                const n1 = appState.graphNodes[i];
                const n2 = appState.graphNodes[j];
                const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                if (dist < 100) {
                    ctx.strokeStyle = `rgba(0, 255, 157, ${1 - dist/100})`;
                    ctx.beginPath(); ctx.moveTo(n1.x, n1.y); ctx.lineTo(n2.x, n2.y); ctx.stroke();
                }
            }
        }

        appState.graphNodes.forEach(node => {
            node.x += node.vx; node.y += node.vy;
            if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
            ctx.fillStyle = node.color;
            ctx.beginPath(); ctx.arc(node.x, node.y, 4, 0, Math.PI * 2); ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

function toggleGraphModal() {
    const modal = document.getElementById('graphModal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) setTimeout(initKnowledgeGraph, 100);
}

// ===== FEED RENDER =====
function renderFeed() {
    const container = document.getElementById('articlesContainer');
    const filtered = appState.articles.filter(a => appState.currentFilter === 'all' || a.tag === appState.currentFilter);
    
    container.innerHTML = filtered.map(art => `
        <div class="news-card ${art.impact === 'high' ? 'breaking' : ''}" data-category="${art.tag}">
            <div class="card-body">
                <div class="card-header">
                    <span>${art.source}</span>
                    <span>${art.time}</span>
                </div>
                <h3 class="card-title">${art.title}</h3>
                <p class="card-summary">${art.summary}</p>
                <div class="card-footer">
                    <span class="tag ${art.tag}">${art.tag.toUpperCase()}</span>
                    <button class="card-action-btn"><i data-lucide="bookmark"></i></button>
                </div>
            </div>
        </div>
    `).join('');
    if(window.lucide) window.lucide.createIcons();
}

function showNotification(text, type) {
    const el = document.getElementById('notificationArea');
    document.getElementById('notificationText').innerText = text;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 3000);
}

function setupEventListeners() {
    document.getElementById('zenModeToggle')?.addEventListener('click', toggleZenMode);
    document.getElementById('graphModeToggle')?.addEventListener('click', toggleGraphModal);
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            appState.currentFilter = chip.dataset.filter;
            renderFeed();
        });
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'z') toggleZenMode();
        if (e.key === 'g') toggleGraphModal();
    });
}

function init() {
    // Original Mock Data Logic
    appState.articles = [
        { id: 1, title: "NVIDIA Blackwell Cluster Update", tag: "ai", source: "Reuters", time: "2h ago", summary: "Efficiency gains detected.", impact: "high" },
        { id: 2, title: "Fusion Grid Stability Tests", tag: "energy", source: "Bloomberg", time: "5h ago", summary: "Stabilization protocol active.", impact: "medium" }
    ];
    setupEventListeners();
    renderFeed();
    if(window.lucide) window.lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', init);
