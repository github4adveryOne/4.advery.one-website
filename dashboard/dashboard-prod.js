// Advery.One Agent Dashboard - Pixel-Art Visualization
// Fixed positioning and scaling issues
class AgentDashboard {
    constructor() {
        this.canvas = document.getElementById('dashboardCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 32;
        this.gridVisible = true;
        this.debugMode = false; // Toggle with 'D'
        this.isConnected = false;
        this.socket = null;
        this.agents = [];
        this.rooms = [];
        this.sprites = {};
        this.animationId = null;
        
        console.log("AgentDashboard initialized with GridSize:", this.gridSize);
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.loadSprites();
        this.setupRooms();
        this.setupAgents();
        this.setupEventListeners();
        this.animate();
    }
    
    setupCanvas() {
        const container = this.canvas.parentElement;
        
        const resizeCanvas = () => {
            // Get actual size of the container on screen
            const rect = container.getBoundingClientRect();
            const width = Math.floor(rect.width);
            const height = Math.floor(rect.height);
            
            if (width > 0 && height > 0) {
                this.canvas.width = width;
                this.canvas.height = height;
                console.log(`Canvas set to ${width}x${height}`);
            }
            this.draw();
        };

        // Resize on start and whenever window changes
        resizeCanvas();
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(resizeCanvas, 100);
        });
        
        // Also check periodically in case of layout shifts
        setInterval(() => {
            const rect = container.getBoundingClientRect();
            if (Math.floor(rect.width) !== this.canvas.width || Math.floor(rect.height) !== this.canvas.height) {
                resizeCanvas();
            }
        }, 1000);
    }
    
    loadSprites() {
        // Create 24x24 pixel-art sprites for 32px grid
        const colors = {
            'ceo': '#00adb5',
            'developer': '#4CAF50',
            'security': '#FF5722',
            'operations': '#9C27B0',
            'creative': '#FF9800',
            'integration': '#2196F3'
        };
        const emojis = {
            'ceo': '👔',
            'developer': '💻',
            'security': '🛡️',
            'operations': '⚙️',
            'creative': '🎨',
            'integration': '🔌'
        };

        for (const type in colors) {
            this.sprites[type] = this.createSprite(24, colors[type], emojis[type]);
        }
    }
    
    createSprite(size, color, emoji) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Body
        ctx.fillStyle = color;
        ctx.fillRect(2, 2, size-4, size-4);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, size, size);
        
        // Icon
        ctx.font = `${size * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(emoji, size/2, size/2);
        
        return canvas;
    }
    
    setupRooms() {
        // Exact coordinates from requirements
        this.rooms = [
            { name: 'CEO Office', x: 2, y: 2, width: 4, height: 4, color: '#00adb5', description: 'Strategy' },
            { name: 'Dev Room', x: 8, y: 2, width: 5, height: 4, color: '#4CAF50', description: 'Dev' },
            { name: 'Security Hub', x: 2, y: 8, width: 4, height: 3, color: '#FF5722', description: 'Security' },
            { name: 'Operations', x: 8, y: 8, width: 5, height: 3, color: '#9C27B0', description: 'Ops' },
            { name: 'Creative Studio', x: 14, y: 2, width: 4, height: 4, color: '#FF9800', description: 'Design' },
            { name: 'Integration Lab', x: 14, y: 8, width: 4, height: 3, color: '#2196F3', description: 'Sync' }
        ];
    }
    
    setupAgents() {
        // Correct initial positions
        this.agents = [
            { 
                id: 'ceo-1', 
                name: 'Age', 
                role: 'Head & Owner', 
                type: 'ceo', 
                x: 4, y: 4, 
                targetX: 4, targetY: 4, 
                status: 'active', 
                speed: 0.05 
            },
            { 
                id: 'dev-1', 
                name: 'DevBot', 
                role: 'Lead Developer', 
                type: 'developer', 
                x: 10, y: 4, 
                targetX: 10, targetY: 4, 
                status: 'busy', 
                speed: 0.05 
            }
        ];
        this.updateAgentList();
    }
    
    setupEventListeners() {
        const gridBtn = document.getElementById('gridToggle');
        if (gridBtn) {
            gridBtn.addEventListener('click', () => {
                this.gridVisible = !this.gridVisible;
                gridBtn.textContent = this.gridVisible ? 'Hide Grid' : 'Toggle Grid';
            });
        }
        
        const connectBtn = document.getElementById('connectBtn');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.connectWebSocket());
        }
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            // Important: calculate based on rendered size
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            const x = Math.floor(((e.clientX - rect.left) * scaleX) / this.gridSize);
            const y = Math.floor(((e.clientY - rect.top) * scaleY) / this.gridSize);
            
            console.log(`Clicked at grid: ${x}, ${y}`);
            
            if (this.agents.length > 0) {
                const agent = this.agents[0]; // Move the first agent for demo
                agent.targetX = x;
                agent.targetY = y;
                
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    this.socket.send(JSON.stringify({
                        type: 'agent_move',
                        agentId: agent.id,
                        x: x,
                        y: y
                    }));
                }
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'd') {
                this.debugMode = !this.debugMode;
                console.log("Debug mode:", this.debugMode);
            }
        });
    }
    
    connectWebSocket() {
        if (this.isConnected) {
            if (this.socket) this.socket.close();
            return;
        }
        
        const connectBtn = document.getElementById('connectBtn');
        const statusDot = document.getElementById('connectionDot');
        const statusText = document.getElementById('connectionStatus');
        
        connectBtn.textContent = 'Connecting...';
        connectBtn.disabled = true;
        
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/dashboard-api/ws`;
        
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
            this.isConnected = true;
            connectBtn.textContent = 'Disconnect';
            connectBtn.disabled = false;
            statusDot.className = 'connected';
            statusText.textContent = 'Connected';
            this.socket.send(JSON.stringify({ type: 'get_agents' }));
        };
        
        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            } catch (error) {
                console.error('Error parsing WS message:', error);
            }
        };
        
        this.socket.onclose = () => {
            this.isConnected = false;
            connectBtn.textContent = 'Connect to Server';
            connectBtn.disabled = false;
            statusDot.className = 'disconnected';
            statusText.textContent = 'Disconnected';
        };
    }
    
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'agent_update':
                this.updateAgent(data.agent);
                break;
            case 'agent_list':
            case 'init':
                this.syncAgents(data.agents || []);
                break;
        }
    }
    
    updateAgent(agentData) {
        let agent = this.agents.find(a => a.id === agentData.id);
        if (agent) {
            if (agentData.x !== undefined) agent.targetX = agentData.x;
            if (agentData.y !== undefined) agent.targetY = agentData.y;
            if (agentData.status) agent.status = agentData.status;
            if (agentData.name) agent.name = agentData.name;
        } else {
            const newAgent = { ...agentData };
            newAgent.targetX = agentData.x || 0;
            newAgent.targetY = agentData.y || 0;
            newAgent.x = newAgent.targetX;
            newAgent.y = newAgent.targetY;
            this.agents.push(newAgent);
            this.updateAgentList();
        }
    }

    syncAgents(newAgents) {
        newAgents.forEach(newA => {
            let existing = this.agents.find(a => a.id === newA.id);
            if (existing) {
                if (newA.x !== undefined) existing.targetX = newA.x;
                if (newA.y !== undefined) existing.targetY = newA.y;
                existing.status = newA.status;
                existing.name = newA.name;
            } else {
                const a = { ...newA };
                a.targetX = a.x || 0;
                a.targetY = a.y || 0;
                a.x = a.targetX;
                a.y = a.targetY;
                this.agents.push(a);
            }
        });
        this.updateAgentList();
    }
    
    updateAgentList() {
        const agentList = document.getElementById('agentList');
        if (!agentList) return;
        agentList.innerHTML = '';
        
        this.agents.forEach(agent => {
            const item = document.createElement('div');
            item.className = 'agent-item';
            item.innerHTML = `
                <div class="agent-avatar" style="background: ${this.sprites[agent.type]?.getContext('2d').fillStyle || '#333'}"></div>
                <div class="agent-info">
                    <div class="agent-name">${agent.name}</div>
                    <div class="agent-role">${agent.role || agent.type}</div>
                </div>
                <div class="status-indicator status-${agent.status || 'active'}"></div>
            `;
            agentList.appendChild(item);
        });
    }
    
    animate() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    update() {
        this.agents.forEach(agent => {
            if (agent.targetX !== undefined && agent.targetY !== undefined) {
                const dx = agent.targetX - agent.x;
                const dy = agent.targetY - agent.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 0.02) {
                    const speed = agent.speed || 0.05;
                    agent.x += dx * speed;
                    agent.y += dy * speed;
                } else {
                    agent.x = agent.targetX;
                    agent.y = agent.targetY;
                }
            }
            
            // Safety: fallback if coordinates are missing
            if (agent.x === undefined || isNaN(agent.x)) agent.x = 0;
            if (agent.y === undefined || isNaN(agent.y)) agent.y = 0;
        });
    }
    
    draw() {
        if (!this.canvas) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        this.ctx.fillStyle = '#16213e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Rooms
        this.rooms.forEach(room => this.drawRoom(room));
        
        // Grid
        if (this.gridVisible) this.drawGrid();
        
        // Agents
        this.agents.forEach(agent => this.drawAgent(agent));
        
        // Labels
        this.rooms.forEach(room => this.drawRoomLabel(room));

        // Debug
        if (this.debugMode) this.drawDebugOverlay();
    }
    
    drawRoom(room) {
        const x = room.x * this.gridSize;
        const y = room.y * this.gridSize;
        const w = room.width * this.gridSize;
        const h = room.height * this.gridSize;
        
        // Background with transparency
        this.ctx.fillStyle = room.color + '22';
        this.ctx.fillRect(x, y, w, h);
        
        // Border
        this.ctx.strokeStyle = room.color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, w, h);
    }
    
    drawRoomLabel(room) {
        const x = room.x * this.gridSize;
        const y = room.y * this.gridSize;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 10px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(room.name, x + 4, y + 12);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#ffffff0a';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawAgent(agent) {
        const px = agent.x * this.gridSize;
        const py = agent.y * this.gridSize;
        
        const sprite = this.sprites[agent.type] || this.sprites.ceo;
        const offset = (this.gridSize - sprite.width) / 2;
        
        this.ctx.drawImage(sprite, px + offset, py + offset);
        
        // Name
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '9px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(agent.name, px + this.gridSize/2, py - 4);
        
        // Debug position
        if (this.debugMode) {
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText(`${Math.round(agent.x)},${Math.round(agent.y)}`, px + this.gridSize/2, py + this.gridSize + 8);
        }
    }

    drawDebugOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(5, this.canvas.height - 60, 150, 55);
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '10px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Canvas: ${this.canvas.width}x${this.canvas.height}`, 10, this.canvas.height - 45);
        this.ctx.fillText(`GridSize: ${this.gridSize}px`, 10, this.canvas.height - 30);
        this.ctx.fillText(`Agents: ${this.agents.length}`, 10, this.canvas.height - 15);
        
        // Draw coordinate numbers on grid
        this.ctx.fillStyle = '#ffffff33';
        for (let i = 0; i < 20; i++) {
            this.ctx.fillText(i, i * this.gridSize + 2, 10);
            this.ctx.fillText(i, 2, i * this.gridSize + 10);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new AgentDashboard();
});
