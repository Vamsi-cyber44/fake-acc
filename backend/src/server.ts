import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { connectDB } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

connectDB().catch(() => {/* continue with stub DB */});

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);

// Minimal endpoints used by frontend
app.get('/api/dashboard/stats', (req, res) => {
  res.json({ totalScans: 0, threatsBlocked: 0, authenticUsers: 0, systemStatus: 'Operational', recentScans: [], threatHistory: [], currentRiskLevel: 0, lastUpdated: new Date().toISOString() });
});

app.post('/api/scan/profile', (req, res) => {
  const { username, platform } = req.body || {};
  const result = {
    id: 'scan_stub_' + Date.now(),
    targetUsername: username || 'unknown',
    platform: platform || 'unknown',
    riskScore: 5,
    verdict: 'REAL',
    flags: [],
    scannedAt: new Date().toISOString()
  };
  res.json(result);
});

app.get('/api/scan/history', (req, res) => {
  res.json([]);
});

app.get('/api/scan/:id', (req, res) => {
  res.json({ id: req.params.id, targetUsername: 'unknown', platform: 'unknown', riskScore: 0, verdict: 'REAL', flags: [], scannedAt: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Stub backend running on http://localhost:${PORT}`);
});

export default app;
