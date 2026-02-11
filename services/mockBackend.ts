export const MockBackend = {
  getDashboardStats: async () => ({ totalScans: 0, threatsBlocked: 0, authenticUsers: 0, systemStatus: 'Operational', recentScans: [], threatHistory: [], currentRiskLevel: 0, lastUpdated: new Date().toISOString() }),
  getScanHistory: async () => [],
  addScanToHistory: (scan: any) => { /* no-op for stub */ }
};
