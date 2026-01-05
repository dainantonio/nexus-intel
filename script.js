// ... (keep existing appState and helper functions at the top)

// Add these to the appState if not already present or update them
appState.zenMode = false;
appState.graphNodes = [];
appState.graphLinks = [];

// ===== ZEN MODE LOGIC =====
function toggleZenMode() {
    appState.zenMode = !appState.zenMode;
    document.body.classList.toggle('zen-mode');
    
    // Update the button icon if it exists
    const zenBtn = document.getElementById('zenModeToggle');
    if (zenBtn) {
        const icon = zenBtn.querySelector('i');
        if (appState.zenMode) {
            icon.setAttribute('data-lucide', 'minimize-2');
        } else {
            icon.setAttribute('data-lucide', 'maximize-2');
        }
        if(window.lucide) window.lucide.createIcons();
    }
    
    showNotification(appState.zenMode ? "Zen Mode Activated" : "Standard View Restored", "info");
}

// ===== KNOWLEDGE GRAPH LOGIC =====
function initKnowledgeGraph() {
    const canvas = document.getElementById('graphCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    // Set canvas size
    canvas.width = container.clientWidth;
    canvas.height = 500;

    // Generate Graph Data based on current articles
    appState.graphNodes = appState.articles.map((art, i) => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 5,
        color: art.tag === 'ai' ? '#0095ff' : art.tag === 'energy' ? '#00ff9d' : '#8a2be2',
        title: art.title
    }));

    function animate() {
        if (!document.getElementById('graphModal').classList.contains('active')) return;
        
        ctx.fillStyle = '#08080a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw lines
        ctx.lineWidth = 0.5;
        for (let i = 0; i < appState.graphNodes.length; i++) {
            for (let j = i + 1; j < appState.graphNodes.length; j++) {
                const n1 = appState.graphNodes[i];
                const n2 = appState.graphNodes[j];
                const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                
                if (dist < 150) {
                    ctx.strokeStyle = `rgba(0, 255, 157, ${1 - dist/150})`;
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(n2.x, n2.y);
                    ctx.stroke();
                }
            }
        }

        // Update and draw nodes
        appState.graphNodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;

            // Bounce off walls
            if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

            ctx.fillStyle = node.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
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

// ===== UPDATE EVENT LISTENERS =====
function setupEventListeners() {
    // ... (Keep your existing listeners)

    // Zen Mode Toggle
    document.getElementById('zenModeToggle')?.addEventListener('click', toggleZenMode);
    
    // Knowledge Graph Toggle
    document.getElementById('graphModeToggle')?.addEventListener('click', toggleGraphModal);

    // Keyboard Shortcuts Update
    document.addEventListener('keydown', (e) => {
        if (e.key === 'z' && !e.metaKey && !e.ctrlKey && document.activeElement.tagName !== 'INPUT') {
            toggleZenMode();
        }
        if (e.key === 'g' && !e.metaKey && !e.ctrlKey && document.activeElement.tagName !== 'INPUT') {
            toggleGraphModal();
        }
    });
}
