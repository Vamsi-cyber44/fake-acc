import React, { useState, FC } from 'react';
import { LogOut, BarChart3, Shield, Settings, Zap } from 'lucide-react';
import authService from '../services/authService';
import RulesTab from './dashboard/RulesTab';
import ReportsTab from './dashboard/ReportsTab';
import ModelsTab from './dashboard/ModelsTab';
import AdminScanManagement from './dashboard/AdminScanManagement';

interface AdminPageProps {
  onLogout?: () => void;
  onBackToHome?: () => void;
}

const AdminPage: FC<AdminPageProps> = ({ onLogout, onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'reports' | 'models' | 'scans' | 'settings'>('overview');
  const [loading, setLoading] = useState(false);
  const user = authService.getUser();

  const handleLogout = async () => {
    setLoading(true);
    try {
      authService.logout();
      if (onLogout) onLogout();
      if (onBackToHome) onBackToHome();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'rules' as const, label: 'Detection Rules', icon: Shield },
    { id: 'reports' as const, label: 'Reports', icon: BarChart3 },
    { id: 'models' as const, label: 'ML Models', icon: Zap },
    { id: 'scans' as const, label: 'Scan Management', icon: Shield },
    { id: 'settings' as const, label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Shield className="w-8 h-8" />
                Admin Dashboard
              </h1>
              <p className="text-red-100 mt-1">
                Welcome back, <span className="font-semibold">{user?.username || user?.email}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-800 hover:bg-red-900 disabled:bg-gray-600 rounded-lg transition font-semibold"
            >
              <LogOut className="w-5 h-5" />
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 font-semibold whitespace-nowrap transition border-b-2 ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'rules' && <RulesTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'models' && <ModelsTab />}
        {activeTab === 'scans' && <AdminScanManagement />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Scans" value="1,234" icon={BarChart3} />
        <StatCard title="Suspicious Profiles" value="156" icon={Shield} />
        <StatCard title="Likely Fake" value="89" icon={Zap} />
        <StatCard title="Legitimate" value="989" icon={BarChart3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <ActivityItem timestamp="2 hours ago" action="User registered" />
            <ActivityItem timestamp="5 hours ago" action="Suspicious profile detected" />
            <ActivityItem timestamp="1 day ago" action="Model updated" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-3">
            <StatusItem label="Backend API" status="Online" />
            <StatusItem label="Database" status="Connected" />
            <StatusItem label="Detection Engine" status="Running" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Tab Component
const SettingsTab: FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <p className="text-gray-300">Settings configuration coming soon...</p>
      </div>
    </div>
  );
};

// Helper Components
const StatCard: FC<{ title: string; value: string; icon: any }> = ({ title, value, icon: Icon }) => (
  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <Icon className="w-8 h-8 text-red-500 opacity-50" />
    </div>
  </div>
);

const ActivityItem: FC<{ timestamp: string; action: string }> = ({ timestamp, action }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
    <span className="text-gray-300">{action}</span>
    <span className="text-gray-500 text-sm">{timestamp}</span>
  </div>
);

const StatusItem: FC<{ label: string; status: string }> = ({ label, status }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
    <span className="text-gray-300">{label}</span>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="text-green-400 text-sm">{status}</span>
    </div>
  </div>
);

export default AdminPage;
