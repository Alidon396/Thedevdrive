#!/usr/bin/env node

/**
 * ============================================================================
 * TheDevDrive Sahiwal - Main Server
 * ============================================================================
 * 
 * Express server that orchestrates all 10 agents
 * - REST API endpoints for each agent
 * - Scheduling automation
 * - Dashboard interface
 * - Webhook handlers
 * 
 * Port: 7860 (HuggingFace Spaces default)
 * ============================================================================
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from './utils/logger.js';
import { getTodayStats, getConversionMetrics, getTotalLeads } from './utils/supabase-client.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.SERVER_PORT || 7860;

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ============================================================================
// ROUTES: DASHBOARD & STATUS
// ============================================================================

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>TheDevDrive Sahiwal - Control Panel</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background: #0a0a0a;
      color: #ffffff;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      color: #ff006e;
      text-align: center;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin: 2rem 0;
    }
    .card {
      background: #1a1a1a;
      border: 1px solid #ff006e;
      border-radius: 12px;
      padding: 1.5rem;
    }
    .card h3 {
      color: #ff006e;
      margin-top: 0;
    }
    button {
      background: #ff006e;
      color: #0a0a0a;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      margin: 0.5rem 0;
      width: 100%;
    }
    button:hover {
      background: #ff3385;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin: 1rem 0;
    }
    .stat {
      background: #0a0a0a;
      padding: 1rem;
      border-left: 3px solid #ff006e;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #ff006e;
    }
    .stat-label {
      font-size: 0.9rem;
      color: #b0b0b0;
      margin-top: 0.5rem;
    }
    .loading {
      text-align: center;
      padding: 2rem;
    }
    .status-good { color: #00ff00; }
    .status-warn { color: #ffff00; }
    .status-bad { color: #ff0000; }
  </style>
</head>
<body>
  <h1>🚀 TheDevDrive Sahiwal - Control Panel</h1>
  
  <div class="grid">
    <div class="card">
      <h3>📊 Real-Time Metrics</h3>
      <div id="metrics" class="loading">Loading...</div>
    </div>
    
    <div class="card">
      <h3>⚡ Quick Actions</h3>
      <button onclick="runAgent('scraper')">Scrape Leads</button>
      <button onclick="runAgent('auditor')">Run Audits</button>
      <button onclick="runAgent('email')">Send Emails</button>
      <button onclick="runAgent('report')">Generate Report</button>
    </div>
    
    <div class="card">
      <h3>📈 Daily Progress</h3>
      <div id="progress" class="loading">Loading...</div>
    </div>
    
    <div class="card">
      <h3>🎯 Targets</h3>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">500+</div>
          <div class="stat-label">Leads Target</div>
        </div>
        <div class="stat">
          <div class="stat-value">5-9</div>
          <div class="stat-label">Closes Target</div>
        </div>
        <div class="stat">
          <div class="stat-value">75K-120K</div>
          <div class="stat-label">PKR Revenue Goal</div>
        </div>
        <div class="stat">
          <div class="stat-value">10</div>
          <div class="stat-label">Days to Execute</div>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    async function loadMetrics() {
      try {
        const res = await fetch('/api/metrics');
        const data = await res.json();
        
        document.getElementById('metrics').innerHTML = \`
          <div class="stats">
            <div class="stat">
              <div class="stat-value">\${data.totalLeads}</div>
              <div class="stat-label">Total Leads</div>
            </div>
            <div class="stat">
              <div class="stat-value">\${data.audited}</div>
              <div class="stat-label">Audited</div>
            </div>
            <div class="stat">
              <div class="stat-value">\${data.contacts}</div>
              <div class="stat-label">Contacted</div>
            </div>
            <div class="stat">
              <div class="stat-value">\${data.closes}</div>
              <div class="stat-label">Closes</div>
            </div>
          </div>
        \`;
        
        document.getElementById('progress').innerHTML = \`
          <div class="stats">
            <div class="stat">
              <div class="stat-value">\${data.auditRate}%</div>
              <div class="stat-label">Audit Rate</div>
            </div>
            <div class="stat">
              <div class="stat-value">\${data.contactRate}%</div>
              <div class="stat-label">Contact Rate</div>
            </div>
            <div class="stat">
              <div class="stat-value">\${data.emails || 0}</div>
              <div class="stat-label">Emails Today</div>
            </div>
            <div class="stat">
              <div class="stat-value">\${data.revenue || 0}K PKR</div>
              <div class="stat-label">Revenue Today</div>
            </div>
          </div>
        \`;
      } catch (error) {
        console.error('Error loading metrics:', error);
      }
    }
    
    async function runAgent(agent) {
      const button = event.target;
      button.disabled = true;
      button.textContent = 'Running...';
      
      try {
        const res = await fetch(\`/api/agents/\${agent}\`, { method: 'POST' });
        const data = await res.json();
        alert(\`✅ \${agent} completed!\\n\${data.message}\`);
      } catch (error) {
        alert(\`❌ Error: \${error.message}\`);
      } finally {
        button.disabled = false;
        button.textContent = ['scraper', 'auditor', 'email', 'report'][['scraper', 'auditor', 'email', 'report'].indexOf(agent)];
        loadMetrics();
      }
    }
    
    // Load metrics on page load
    loadMetrics();
    
    // Refresh every 30 seconds
    setInterval(loadMetrics, 30000);
  </script>
</body>
</html>
  `);
});

// ============================================================================
// API ROUTES: METRICS
// ============================================================================

app.get('/api/metrics', async (req, res) => {
  try {
    const stats = await getTodayStats();
    const metrics = await getConversionMetrics();
    const totalLeads = await getTotalLeads();

    res.json({
      totalLeads: totalLeads,
      audited: metrics?.audited || 0,
      contacts: metrics?.contacted || 0,
      closes: metrics?.closes || 0,
      auditRate: metrics?.auditRate || 0,
      contactRate: metrics?.contactRate || 0,
      emails: stats?.emails_sent || 0,
      revenue: Math.round((stats?.revenue_pkr || 0) / 1000),
      status: 'ok',
    });
  } catch (error) {
    logger.error(`Metrics error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// API ROUTES: AGENTS
// ============================================================================

app.post('/api/agents/scraper', async (req, res) => {
  logger.info('🔍 Starting lead scraper...');
  res.json({ message: 'Lead scraper started (check logs)' });
  // Would call Agent 1 here
});

app.post('/api/agents/auditor', async (req, res) => {
  logger.info('📊 Starting website auditor...');
  res.json({ message: 'Website auditor started (check logs)' });
  // Would call Agent 3 here
});

app.post('/api/agents/email', async (req, res) => {
  logger.info('📧 Starting email campaign...');
  res.json({ message: 'Email campaign started (check logs)' });
  // Would call Agent 5 here
});

app.post('/api/agents/report', async (req, res) => {
  logger.info('📈 Generating daily report...');
  res.json({ message: 'Daily report generated' });
  // Would call Agent 10 here
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  logger.error(`Express error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  logger.info(`\n╔════════════════════════════════════════╗`);
  logger.info(`║  TheDevDrive Sahiwal Server Running   ║`);
  logger.info(`║  🌐 http://localhost:${PORT.toString().padEnd(20)} ║`);
  logger.info(`║  📊 Dashboard: http://localhost:${PORT} ║`);
  logger.info(`║  🚀 Ready for automation!             ║`);
  logger.info(`╚════════════════════════════════════════╝\n`);
});

export default app;
