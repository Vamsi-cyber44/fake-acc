import httpClient from './httpClient';

// By default this scaffold will call the local backend. Set USE_MOCK=true to use local mock.
const USE_MOCK = (import.meta as any).env.VITE_USE_MOCK === 'true' || false;

export const BackendService = {
  login: async (credentials: any) => {
    if (USE_MOCK) {
      localStorage.setItem('cyberguard_token', 'mock_token');
      return { accessToken: 'mock_token', requiresMfa: false };
    }
    return httpClient.post('/auth/login', credentials);
  },

  register: async (data: any) => {
    if (USE_MOCK) return { success: true };
    return httpClient.post('/auth/register', data);
  },

  getDashboardStats: async () => {
    if (USE_MOCK) return { totalScans: 0, threatsBlocked: 0, authenticUsers: 0, systemStatus: 'Operational', recentScans: [], threatHistory: [], currentRiskLevel: 0, lastUpdated: new Date().toISOString() };
    return httpClient.get('/dashboard/stats');
  },

  submitScan: async (data: any) => {
    if (USE_MOCK) return { id: 'stub', targetUsername: data.username, platform: data.platform, riskScore: 0, verdict: 'REAL', flags: [], scannedAt: new Date().toISOString() };
    return httpClient.post('/scan/profile', data);
  },

  getScanHistory: async () => {
    if (USE_MOCK) return [];
    return httpClient.get('/scan/history');
  },

  getScanById: async (id: string) => {
    if (USE_MOCK) return { id, targetUsername: 'unknown', platform: 'unknown', riskScore: 0, verdict: 'REAL', flags: [], scannedAt: new Date().toISOString() };
    return httpClient.get(`/scan/${id}`);
  }
};
