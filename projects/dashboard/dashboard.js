// Advery.One Agent Dashboard - Frontend Specialist
// Pixel-art visualization with WebSocket real-time updates

class AgentDashboard {
    constructor() {
        this.canvas = document.getElementById('officeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 32; // Pixel size for grid cells
        this.showGrid = true;
        this.agents = [];
        this.rooms = [];
        this.socket = null;
        this.isConnected = false;
        
        // Office layout dimensions (in grid cells)
        this.officeWidth = 20;
        this.officeHeight = 15;
        
        // Initialize
        this.initCanvas();
        this.initRooms();
        this.initSampleAgents();
        this.initEventListeners();
        this.draw();
        
        // Animation loop
        this.animationId = null;
        this.startAnimation();
    }
    
    initCanvas() {
        // Set canvas size based on container
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            this.draw();
        });
    }
    
    initRooms() {
        // Define office rooms with their positions and sizes
        this.rooms = [
            {
                name: 'CEO Office',
                x: 2, y: 2, width: 4, height: 4,
                color: '#00adb5',
                description: 'Strategic direction & project coordination'
            },
            {
                name: 'Dev Room',
                x: 8, y: 2, width: 5, height: 4,
                color: '#4CAF50',
                description: 'Code implementation & system maintenance'
            },
            {
                name: 'Security Hub',
                x: 2, y: 8, width: 4, height: 3,
                color: '#FF5722',
                description: 'Authentication & access control'
            },
            {
                name: 'Operations Center',
                x: 8, y: 8, width: 5, height: 3,
                color: '#9C27B0',
                description: 'System health & infrastructure'
            },
            {
                name: 'Creative Studio',
                x: 14, y: 2, width: 4, height: 4,
                color: '#FF9800',
                description: 'Design & content creation'
            },
            {
                name: 'Integration Lab',
                x: 14, y: 8, width: 4, height: 3,
                color: '#2196F3',
                description: 'API connections & data sync'
            }
        ];
    }
    
    initSampleAgents() {
        // Create sample agents for demonstration
        this.agents = [
            {
                id: 'agent-ceo',
                name: 'CEO Agent',
                role: 'Project Manager',
                x: 3, y: 3,
                targetX: 3, targetY: 3,
                color: '#00adb5',
                status: 'active',
                speed: 0.05,
                sprite: this.createCEOSprite()
            },
            {
                id: 'agent-dev',
                name: 'Developer Agent',
                role: 'Code Implementation',
                x: 9, y: 3,
                targetX: 9, targetY: 3,
                color: '#4CAF50',
                status: 'busy',
                speed: 0.08,
                sprite: this.createDevSprite()
            },
            {
                id: 'agent-security',
                name: 'Security Agent',
                role: 'Access Control',
                x: 3, y: 9,
                targetX: 3, targetY: 9,
                color: '#FF5722',
                status: 'active',
                speed: 0.06,
                sprite: this.createSecuritySprite()
            },
            {
                id: 'agent-ops',
                name: 'Operations Agent',
                role: 'System Health',
                x: 9, y: 9,
                targetX: 9, targetY: 9,
                color: '#9C27B0',
                status: 'idle',
                speed: 0.07,
                sprite: this.createOpsSprite()
            }
        ];
        
        // Update agent list in sidebar
        this.updateAgentList();
    }
    
    createCEOSprite() {
        // Create a 16x16 CEO agent sprite
        const sprite = document.createElement('canvas');
        sprite.width = 16;
        sprite.height = 16;
        const ctx = sprite.getContext('2d');
        
        // Body (suit)
        ctx.fillStyle = '#00adb5';
        ctx.fillRect(4, 4, 8, 8);
        
        // Head
        ctx.fillStyle = '#FFCC99';
        ctx.fillRect(6, 2, 4, 4);
        
        // Tie
        ctx.fillStyle = '#16213e';
        ctx.fillRect(7, 8, 2, 4);
        
        return sprite;
    }
    
    createDevSprite() {
        // Create a 16x16 Developer agent sprite
        const sprite = document.createElement('canvas');
        sprite.width = 16;
        sprite.height = 16;
        const ctx = sprite.getContext('2d');
        
        // Body (hoodie)
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(4, 4, 8, 8);
        
        // Head
        ctx.fillStyle = '#FFCC99';
        ctx.fillRect(6, 2, 4, 4);
        
        // Laptop
        ctx.fillStyle = '#333333';
        ctx.fillRect(5, 9, 6, 3);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(6, 10, 4, 1);
        
        return sprite;
    }
    
    createSecuritySprite() {
        // Create a 16x16 Security agent sprite
        const sprite = document.createElement('canvas');
        sprite.width = 16;
        sprite.height = 16;
        const ctx = sprite.getContext('2d');
        
        // Body (armor)
        ctx.fillStyle = '#FF5722';
        ctx.fillRect(4, 4, 8, 8);
        
        // Head
        ctx.fillStyle = '#FFCC99';
        ctx.fillRect(6, 2, 4, 4);
        
        // Shield
        ctx.fillStyle = '#FFC107';
        ctx.fillRect(3, 6, 3, 6);
        ctx.fillRect(10, 6, 3, 6);
        
        return sprite;
    }
    
    createOpsSprite() {
        // Create a 16x16 Operations agent sprite
        const sprite = document.createElement('canvas');
        sprite.width = 16;
        sprite.height = 16;
        const ctx = sprite.getContext('2d');
        
        // Body
        ctx.fillStyle = '#9C27B0';
        ctx.fillRect(4, 4, 8, 8);
        
        // Head
        ctx.fillStyle = '#FFCC99';
        ctx.fillRect(6, 2, 4, 4);
        
        // Server rack
        ctx.fillStyle = '#333333';
        ctx.fillRect(5, 8, 6, 4);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(6, 9, 1, 1);
        ctx.fillRect(8, 9, 1, 1);
        ctx.fillRect(10, 9, 1, 1);
        
        return sprite;
    }
    
    updateAgentList() {
        const agentList = document.getElementById('agentList');
        agentList.innerHTML = '';
        
        this.agents.forEach(agent => {
            const agentItem = document.createElement('div');
            agentItem.className = 'agent-item';
            
            const avatar = document.createElement('div');
            avatar.className = 'agent-avatar';
            avatar.style.backgroundImage = `url(${agent.sprite.toDataURL()})`;
            avatar.style.backgroundSize = 'cover';
            
            const info = document.createElement('div');
            info.className = 'agent-info';
            
            const name = document.createElement('div');
            name.className = 'agent-name';
            name.textContent = agent.name;
            
            const role = document.createElement('div');
            role.className = 'agent-role';
            role.textContent = agent.role;
            
            info.appendChild(name);
            info.appendChild(role);
            
            const status = document.createElement('div');
            status.className = `status-indicator status-${agent.status}`;
            
            agentItem.appendChild(avatar);
            agentItem.appendChild(info);
            agentItem.appendChild(status);
            
            agentList.appendChild(agentItem);
        });
    }
    
    initEventListeners() {
        // Connect button
        document.getElementById('connectBtn').addEventListener('click', () => {
            this.connectWebSocket();
        });
        
        // Grid toggle button
        document.getElementById('gridToggle').addEventListener('click', () => {
            this.showGrid = !this.showGrid;
            this.draw();
        });
        
        // Canvas click for agent movement
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Convert to grid coordinates
            const gridX = Math.floor(x / this.gridSize);
            const gridY = Math.floor(y / this.gridSize);
            
            // Move first agent to clicked position (demo)
            if (this.agents.length > 0) {
                this.agents[0].targetX = gridX;
                this.agents[0].targetY = gridY;
                
                // Send movement to server if connected
                if (this.isConnected && this.socket) {
                    this.socket.send(JSON.stringify({
                        type: 'agent_move',
                        agentId: this.agents[0].id,
                        x: gridX,
                        y: gridY
                    }));
                }
            }
        });
    }
    
    connectWebSocket() {
        if (this.isConnected) {
            this.disconnectWebSocket();
            return;
        }
        
        // Update UI
        const connectBtn = document.getElementById('connectBtn');
        const statusDot = document.getElementById('connectionDot');
        const statusText = document.getElementById('connectionStatus');
        
        connectBtn.textContent = 'Connecting...';
        connectBtn.disabled = true;
        statusText.textContent = 'Connecting...';
        
        // For demo purposes, we'll simulate WebSocket connection
        // In production, this would connect to the actual backend
        setTimeout(() => {
            this.isConnected = true;
            this.socket = {
                send: (data) => {
                    console.log('WebSocket send:', data);
                    // Simulate server response
                    setTimeout(() => {
                        this.handleWebSocketMessage({
                            type: 'agent_update',
                            data: JSON.parse(data)
                        });
                    }, 100);
                },
                close: () => {
                    this.isConnected = false;
                    this.socket = null;
                }
            };
            
            connectBtn.textContent = 'Disconnect';
            connectBtn.disabled = false;
            statusDot.className = 'connected';
            statusText.textContent = 'Connected (Demo Mode)';
            
            // Simulate initial data from server
            this.handleWebSocketMessage({
                type: 'init',
                agents: this.agents.map(agent => ({
                    id: agent.id,
                    name: agent.name,
                    role: agent.role,
                    x: agent.x,
                    y: agent.y,
                    status: agent.status
                }))
            });
            
        }, 1000);
    }
    
    disconnectWebSocket() {
        if (this.socket && this.socket.close) {
            this.socket.close();
        }
        
        this.isConnected = false;
        this.socket = null;
        
        const connectBtn = document.getElementById('connectBtn');
        const statusDot = document.getElementById('connectionDot');
        const statusText = document.getElementById('connectionStatus');
        
        connectBtn.textContent = 'Connect to Server';
        statusDot.className = '';
        statusText.textContent = 'Disconnected';
    }
    
    handleWebSocketMessage(message) {
        console.log('WebSocket message:', message);
        
        switch (message.type) {
            case 'init':
                // Initialize agents from server data
                if (message.agents) {
                    message.agents.forEach(serverAgent => {
                        const localAgent = this.agents.find(a => a.id === serverAgent.id);
                        if (localAgent) {
                            localAgent.x = serverAgent.x;
                            localAgent.y = serverAgent.y;
                            localAgent.targetX = serverAgent.x;
                            localAgent.targetY = serverAgent.y;
                            localAgent.status = serverAgent.status;
                        }
                    });
                    this.updateAgentList();
                }
                break;
                
            case 'agent_update':
                // Update agent position/status
                if (message.data) {
                    const agent = this.agents.find(a => a.id === message.data.agentId);
                    if (agent) {
                        agent.targetX = message.data.x;
                        agent.targetY = message.data.y;
                        if (message.data.status) {
                            agent.status = message.data.status;
                            this.updateAgentList();
                        }
                    }
                }
                break;
                
            case 'agent_status':
                // Update agent status only
                if (message.agentId && message.status) {
                    const agent = this.agents.find(a => a.id === message.agentId);
                    if (agent) {
                        agent.status = message.status;
                        this.updateAgentList();
                    }
                }
                break;
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#16213e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate offset to center the office
        const officePixelWidth = this.officeWidth * this.gridSize;
        const officePixelHeight = this.officeHeight * this.gridSize;
        const offsetX = (this.canvas.width - officePixelWidth) / 2;
        const offsetY = (this.canvas.height - officePixelHeight) / 2;
        
        // Draw grid if enabled
        if (this.showGrid) {
            this.drawGrid(offsetX, offsetY);
        }
        
        // Draw rooms
        this.drawRooms(offsetX, offsetY);
        
        // Draw agents
        this.drawAgents(offsetX, offsetY);
        
        // Draw room labels
        this.drawRoomLabels(offsetX, offsetY);
    }
    
    drawGrid(offsetX, offsetY) {
        this.ctx.strokeStyle = 'rgba(0, 173, 181, 0.2)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.officeWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX + x * this.gridSize, offsetY);
            this.ctx.lineTo(offsetX + x * this.gridSize, offsetY + this.officeHeight * this.gridSize);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.officeHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, offsetY + y * this.gridSize);
            this.ctx.lineTo(offsetX + this.officeWidth * this.gridSize, offsetY + y * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawRooms(offsetX, offsetY) {
        this.rooms.forEach(room => {
            const x = offsetX + room.x * this.gridSize;
            const y = offsetY + room.y * this.gridSize;
            const width = room.width * this.gridSize;
            const height = room.height * this.gridSize;
            
            // Room background
            this.ctx.fillStyle = room.color + '40'; // 40 = 25% opacity
            this.ctx.fillRect(x, y, width, height);
            
            // Room border
            this.ctx.strokeStyle = room.color;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, width, height);
            
            // Room floor pattern (checkerboard)
            this.ctx.fillStyle = room.color + '20'; // 20 = 12.5% opacity
            const patternSize = this.gridSize / 2;
            for (let ry = 0; ry < room.height; ry++) {
                for (let rx = 0; rx < room.width; rx++) {
                    if ((rx + ry) % 2 === 0) {
                        this.ctx.fillRect(
                            x + rx * patternSize,
                            y + ry * patternSize,
                            patternSize,
                            patternSize
                        );
                    }
                }
            }
        });
    }
    
    drawAgents(offsetX, offsetY) {
        this.agents.forEach(agent => {
            // Smooth movement towards target
            const dx = agent.targetX - agent.x;
            const dy = agent.targetY - agent.y;
            
            if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
                agent.x += dx * agent.speed;
                agent.y += dy * agent.speed;
            }
            
            const x = offsetX + agent.x * this.gridSize;
            const y = offsetY + agent.y * this.gridSize;
            
            // Draw agent shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(x + 2, y + 2, this.gridSize, this.gridSize);
            
            // Draw agent sprite
            this.ctx.drawImage(
                agent.sprite,
                x + (this.gridSize - 16) / 2,
                y + (this.gridSize - 16) / 2
            );
            
            // Draw status indicator
            this.drawStatusIndicator(x, y, agent.status);
            
            // Draw agent name
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '10px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(agent.name, x + this.gridSize / 2, y - 5);
        });
    }
    
    drawStatusIndicator(x, y, status) {
        const indicatorSize = 6;
        const indicatorX = x + this.gridSize - indicatorSize - 2;
        const indicatorY = y + 2;
        
        this.ctx.beginPath();
        this.ctx.arc(
            indicatorX + indicatorSize / 2,
            indicatorY + indicatorSize / 2,
            indicatorSize / 2,
            0,
            Math.PI * 2
        );
        
        switch (status) {
            case 'active':
                this.ctx.fillStyle = '#00ff88';
                break;
            case 'idle':
                this.ctx.fillStyle = '#ffaa00';
                break;
            case 'busy':
                this.ctx.fillStyle = '#ff5555';
                break;
            default:
                this.ctx.fillStyle = '#666666';
        }
        
        this.ctx.fill();
        
        // Add glow effect
        this.ctx.shadowColor = this.ctx.fillStyle;
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    drawRoomLabels(offsetX, offsetY) {
        this.ctx.font = 'bold 12px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        this.rooms.forEach(room => {
            const x = offsetX + room.x * this.gridSize + (room.width * this.gridSize) / 2;
            const y = offsetY + room.y * this.gridSize - 15;
            
            // Label background
            this.ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
            this.ctx.fillRect(x - 60, y - 10, 120, 20);
            
            // Label border
            this.ctx.strokeStyle = room.color;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x - 60, y - 10, 120, 20);
            
            // Label text
            this.ctx.fillStyle = room.color;
            this.ctx.fillText(room.name, x, y);
        });
    }
    
    startAnimation() {
        const animate = () => {
            this.draw();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }
    
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    // Public method to simulate agent activity (for demo)
    simulateActivity() {
        setInterval(() => {
            if (this.agents.length > 0 && Math.random() > 0.7) {
                const agent = this.agents[Math.floor(Math.random() * this.agents.length)];
                
                // Random movement within office bounds
                agent.targetX = Math.max(1, Math.min(this.officeWidth - 2, 
                    agent.targetX + (Math.random() > 0.5 ? 1 : -1)));
                agent.targetY = Math.max(1, Math.min(this.officeHeight - 2,
                    agent.targetY + (Math.random() > 0.5 ? 1 : -1)));
                
                // Random status change
                const statuses = ['active', 'idle', 'busy'];
                agent.status = statuses[Math.floor(Math.random() * statuses.length)];
                
                this.updateAgentList();
                
                // Simulate WebSocket update
                if (this.isConnected && this.socket) {
                    this.socket.send(JSON.stringify({
                        type: 'agent_update',
                        agentId: agent.id,
                        x: agent.targetX,
                        y: agent.targetY,
                        status: agent.status
                    }));
                }
            }
        }, 3000);
    }
}

// Initialize dashboard when page loads
window.addEventListener('load', () => {
    const dashboard = new AgentDashboard();
    
    // Start simulating activity after a delay
    setTimeout(() => {
        dashboard.simulateActivity();
    }, 5000);
    
    // Make dashboard available globally for debugging
    window.dashboard = dashboard;
});