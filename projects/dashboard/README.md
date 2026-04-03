# Agent Dashboard Frontend

Pixel-art visualization and real-time WebSocket client for the Advery.One Agent Dashboard.

## Features Implemented

### ✅ Basic Canvas Setup
- HTML5 Canvas with responsive design
- Grid system (32px cells)
- Office layout: 20×15 grid cells
- Smooth animations using requestAnimationFrame

### ✅ Agent Sprites
- 4 sample agent sprites (16×16 pixels):
  1. **CEO Agent** - Blue suit with tie
  2. **Developer Agent** - Green hoodie with laptop
  3. **Security Agent** - Orange armor with shields
  4. **Operations Agent** - Purple uniform with server rack
- Pixel-art style with image-rendering: pixelated

### ✅ Office Layout
- 6 defined rooms:
  1. **CEO Office** (2,2) - Strategic direction
  2. **Dev Room** (8,2) - Code implementation
  3. **Security Hub** (2,8) - Authentication & access
  4. **Operations Center** (8,8) - System health
  5. **Creative Studio** (14,2) - Design & content
  6. **Integration Lab** (14,8) - API connections
- Room borders and floor patterns
- Room labels with descriptions

### ✅ WebSocket Client
- Simulated WebSocket connection for demo
- Real-time agent position updates
- Status indicator system:
  - 🟢 Active (green)
  - 🟡 Idle (yellow)
  - 🔴 Busy (red)
  - ⚫ Offline (gray)
- Agent movement animation
- Click-to-move functionality

### ✅ UI Components
- Responsive sidebar with agent list
- Connection status indicator
- Grid toggle control
- Status-based color coding
- Mobile-friendly layout

## File Structure

```
frontend/
├── index.html          # Main dashboard interface
├── dashboard.js        # Core dashboard logic
├── test.html          # Frontend test page
└── README.md          # This file
```

## Usage

### Quick Test
Open `test.html` in a browser to see:
- Agent sprite samples
- Status indicator demo
- WebSocket simulation test
- Office layout preview

### Full Dashboard
Open `index.html` for the complete dashboard:
1. Click "Connect to Server" to enable WebSocket simulation
2. Click on the canvas to move agents
3. Toggle grid visibility with the grid button
4. Watch agents move and change status automatically

### Development
The dashboard uses pure JavaScript with:
- HTML5 Canvas for rendering
- CSS Grid/Flexbox for layout
- WebSocket API for real-time updates
- requestAnimationFrame for smooth animations

## Technical Details

### Grid System
- Each grid cell: 32×32 pixels
- Office dimensions: 20 cells wide × 15 cells tall
- Agents move between grid cells
- Rooms are defined in grid coordinates

### Agent Properties
```javascript
{
  id: 'unique-agent-id',
  name: 'Agent Name',
  role: 'Agent Role',
  x: 3, y: 3,           // Current position
  targetX: 3, targetY: 3, // Target position
  color: '#00adb5',     // Primary color
  status: 'active',     // active|idle|busy|offline
  speed: 0.05,          // Movement speed
  sprite: Canvas        // 16×16 pixel sprite
}
```

### WebSocket Protocol
```javascript
// Client → Server
{
  type: 'agent_move',
  agentId: 'agent-id',
  x: 5,
  y: 7
}

// Server → Client
{
  type: 'agent_update',
  agentId: 'agent-id',
  x: 5,
  y: 7,
  status: 'active'
}
```

## Next Steps

### Immediate Improvements
1. **Real WebSocket backend** - Connect to Flask/SocketIO server
2. **More agent types** - Add Creative and Integration agents
3. **Pathfinding** - Implement A* algorithm for obstacle avoidance
4. **Room interactions** - Agents perform room-specific actions

### Future Features
1. **Telegram OTP integration** - Authentication flow
2. **Performance metrics** - Charts and graphs
3. **Agent communication** - Speech bubbles and lines
4. **Export functionality** - Screenshots and reports
5. **Mobile optimization** - Touch gestures and responsive UI

## Browser Support
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Performance
- 60 FPS animation target
- GPU-accelerated canvas rendering
- Efficient sprite rendering
- Debounced resize events

## Testing
Run the test page to verify:
- Canvas rendering works
- Sprites display correctly
- WebSocket simulation functions
- Responsive design adapts

---

**Created**: 2026-03-15  
**Frontend Specialist**: Subagent for pixel-art visualization  
**Status**: ✅ Basic canvas working with all deliverables met