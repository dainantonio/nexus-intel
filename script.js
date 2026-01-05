const appState = {
    articles: [],
    savedArticles: JSON.parse(localStorage.getItem('nexus_saved') || '[]'),
    readArticles: JSON.parse(localStorage.getItem('nexus_read') || '[]'),
    settings: JSON.parse(localStorage.getItem('nexus_settings') || '{"cyberpunk":false, "viewMode":"row", "liveSim":true}'),
    currentFilter: 'all',
    zenMode: false,
    graphNodes: [],
    map: null,
    markers: {}
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
    showNotification(appState.zenMode ? "Zen Mode Active" : "Standard View", "info");
}

// ===== KNOWLEDGE GRAPH ENGINE =====
function initKnowledgeGraph() {
    const canvas = document.getElementById('graphCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    canvas.width = container.clientWidth;
    canvas.height = 450;

    // Create particles from articles
    appState.graphNodes = appState.articles.map(art => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        color: art.tag === 'ai' ? '#0095ff' : '#00ff9d',
        title: art.title
    }));

    function animate() {
        if (!document.getElementById('graphModal').classList.contains('active')) return;
        
        ctx.fillStyle = '#08080a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        ctx.lineWidth = 0.5;
        for (let i = 0; i < appState.graphNodes.length; i++) {
            for (let j = i + 1; j < appState.graphNodes.length; j++) {
                const n1 = appState.graphNodes[i];
                const n2 = appState.graphNodes[j];
                const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                if (dist < 120) {
                    ctx.strokeStyle = `rgba(0, 255, 157, ${1 - dist/120})`;
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(n2.x, n2.y);
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        appState.graphNodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

            ctx.fillStyle = node.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        requestAnimationFrame(animate);
    }
    animate();
}

function toggleGraphModal() {
    const modal = document.getElementById('graphModal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
        setTimeout(initKnowledgeGraph, 100);
    }
}

// ===== CORE UI FUNCTIONS =====
function showNotification(text, type) {
    const el = document.getElementById('notificationArea');
    document.getElementById('notificationText').innerText = text;
    el.className = `notification ${type} visible`;
    setTimeout(() => el.classList.remove('visible'), 3000);
}

function init() {
    setupEventListeners();
    // Simulate initial data fetch
    appState.articles = [
        { id: 1, title: "NVIDIA Blackwell Output", tag: "ai", summary: "Production scales up.", impact: "high" },
        { id: 2, title: "Fusion Grid Integration", tag: "energy", summary: "New tests successful.", impact: "medium" }
    ];
    renderFeed();
}

function setupEventListeners() {
    document.getElementById('zenModeToggle')?.addEventListener('click', toggleZenMode);
    document.getElementById('graphModeToggle')?.addEventListener('click', toggleGraphModal);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'z') toggleZenMode();
        if (e.key === 'g') toggleGraphModal();
    });
}

function renderFeed() {
    const container = document.getElementById('articlesContainer');
    container.innerHTML = appState.articles.map(art => `
        <div class="news-card">
            <h3>${art.title}</h3>
            <p>${art.summary}</p>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', init);
