let socket;
let currentToken = localStorage.getItem('research_hub_token');
let currentUsername = localStorage.getItem('research_hub_username');
let activeJobId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (currentToken && currentUsername) {
        validateSession();
    } else {
        showScreen('login-screen');
    }
});

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

function updateStatus(msg, isError = false) {
    const status = document.getElementById('auth-status');
    if (status) {
        status.innerText = msg;
        status.style.color = isError ? '#ef4444' : '#10b981';
    }
}

async function requestOTP() {
    const username = document.getElementById('username').value.trim();
    if (!username) return updateStatus('Enter your username', true);

    updateStatus('Sending code to Telegram...');
    try {
        const res = await fetch('/research-api/api/auth/request-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('username-form').style.display = 'none';
            document.getElementById('otp-form').style.display = 'block';
            updateStatus('Check your Telegram app!');
            localStorage.setItem('research_hub_username', username);
            currentUsername = username;
        } else {
            updateStatus(data.error || 'Failed to send OTP', true);
        }
    } catch (e) {
        updateStatus('Network error. Check connection.', true);
    }
}

async function verifyOTP() {
    const otp = document.getElementById('otp').value.trim();
    if (!otp) return updateStatus('Enter the 6-digit code', true);

    updateStatus('Verifying...');
    try {
        const res = await fetch('/research-api/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUsername, otp })
        });
        const data = await res.json();
        if (data.success) {
            currentToken = data.session_token;
            localStorage.setItem('research_hub_token', currentToken);
            updateStatus('Verified! Redirecting...');
            initApp();
        } else {
            updateStatus(data.error || 'Invalid code', true);
        }
    } catch (e) {
        updateStatus('Verification failed.', true);
    }
}

function resetLogin() {
    document.getElementById('username-form').style.display = 'block';
    document.getElementById('otp-form').style.display = 'none';
    updateStatus('');
}

async function validateSession() {
    try {
        const res = await fetch('/research-api/api/auth/validate-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_token: currentToken })
        });
        const data = await res.json();
        if (data.success) {
            currentUsername = data.username;
            localStorage.setItem('research_hub_username', currentUsername);
            initApp();
        } else {
            logout();
        }
    } catch (e) {
        logout();
    }
}

function logout() {
    localStorage.removeItem('research_hub_token');
    localStorage.removeItem('research_hub_username');
    currentToken = null;
    currentUsername = null;
    showScreen('login-screen');
    resetLogin();
}

function initApp() {
    document.getElementById('display-username').innerText = `@${currentUsername}`;
    showScreen('main-screen');
    initWebSocket();
    fetchHistory();
}

function initWebSocket() {
    if (socket) socket.disconnect();
    
    // Ensure socket.io uses the correct path for the proxy
    const socketPath = window.location.pathname.includes('/research/') ? '/research-api/socket.io' : '/socket.io';

    socket = io({
        query: { token: currentToken },
        path: socketPath,
        transports: ['websocket']
    });

    socket.on('connect', () => {
        console.log('Connected to Research Hub WebSocket');
    });

    socket.on('job_log', (data) => {
        console.log('Log entry:', data);
        if (activeJobId === data.job_id) {
            appendLog(data.message, data.timestamp);
        }
    });

    socket.on('job_update', (data) => {
        console.log('Job update:', data);
        fetchHistory();
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
    });
}

function appendLog(message, timestamp) {
    const logWindow = document.getElementById('active-job-log');
    if (!logWindow) return;
    
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const timeStr = new Date(timestamp).toLocaleTimeString();
    entry.innerHTML = `<span class="log-time">[${timeStr}]</span> <span class="log-msg">${message}</span>`;
    logWindow.appendChild(entry);
    logWindow.scrollTop = logWindow.scrollHeight;
}

async function fetchHistory() {
    try {
        const res = await fetch('/research-api/api/research/jobs', {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        const jobs = await res.json();
        renderJobs(jobs);
    } catch (e) {
        console.error('Failed to fetch history:', e);
    }
}

function renderJobs(jobs) {
    const list = document.getElementById('jobs-list');
    if (!jobs || jobs.length === 0) {
        list.innerHTML = '<p>No research jobs found.</p>';
        return;
    }

    list.innerHTML = jobs.map(job => `
        <div class="job-item ${job.status}" onclick="viewJob(${job.id})">
            <div class="job-info">
                <strong>${job.topic}</strong>
                <small>${new Date(job.created_at).toLocaleString()}</small>
            </div>
            <div class="job-status-badge ${job.status}">${job.status}</div>
        </div>
    `).join('');
}

async function startResearch() {
    const topic = document.getElementById('topic').value.trim();
    const model = document.getElementById('llm_model').value;
    const max_iterations = document.getElementById('max_iterations').value;
    const max_tokens = document.getElementById('max_tokens').value;

    if (!topic) return alert('Enter a research topic');

    const btn = document.getElementById('launch-btn');
    btn.disabled = true;
    btn.innerText = 'Launching...';

    try {
        const res = await fetch('/research-api/api/research/jobs', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ 
                topic, 
                llm_model: model,
                max_iterations: parseInt(max_iterations),
                max_tokens: parseInt(max_tokens)
            })
        });
        const data = await res.json();
        
        if (data.id) {
            activeJobId = data.id;
            document.getElementById('active-job-topic').innerText = topic;
            document.getElementById('active-job-status').innerText = 'Starting...';
            document.getElementById('active-job-log').innerHTML = '';
            document.getElementById('active-job-container').style.display = 'block';
            fetchHistory();
        } else {
            alert('Failed to start research job.');
        }
    } catch (e) {
        alert('Network error.');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Launch Agent';
        document.getElementById('topic').value = '';
    }
}

async function viewJob(id) {
    try {
        const res = await fetch(`/research-api/api/research/jobs/${id}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });
        const job = await res.json();
        showJobResult(job);
    } catch (e) {
        alert('Failed to load job results.');
    }
}

function showJobResult(job) {
    document.getElementById('modal-topic').innerText = job.topic;
    document.getElementById('tab-report').innerHTML = marked.parse(job.markdown_result || 'No report generated yet.');
    
    try {
        const structured = JSON.parse(job.structured_data || '{}');
        document.getElementById('structured-json').innerText = JSON.stringify(structured, null, 2);
    } catch (e) {
        document.getElementById('structured-json').innerText = job.structured_data || '{}';
    }
    
    document.getElementById('full-logs').innerText = job.logs || 'No logs available.';
    
    document.getElementById('result-modal').style.display = 'block';
    showTab('report');
}

function closeModal() {
    document.getElementById('result-modal').style.display = 'none';
}

function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`tab-${tab}`).style.display = 'block';
    document.querySelector(`button[onclick="showTab('${tab}')"]`).classList.add('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('result-modal');
    if (event.target == modal) {
        closeModal();
    }
}

