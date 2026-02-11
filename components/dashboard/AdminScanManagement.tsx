import React, { useState, FC, FormEvent, ChangeEvent } from 'react';
import { Zap, AlertCircle, CheckCircle } from 'lucide-react';
import httpClient from '../../services/httpClient';

interface Scan {
  _id: string;
  username: string;
  platform: string;
  verdict: string;
  totalRiskScore: number;
  timestamp: string;
}

const AdminScanManagement: FC = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchInput, setBatchInput] = useState('');

  const loadScans = async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/scans/history');
      if (response.success) {
        setScans(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchScan = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const lines = batchInput.split('\n').filter(line => line.trim());
      const profiles = lines.map(line => {
        const [platform, username] = line.split(',').map(s => s.trim());
        return { platform, username };
      });

      const response = await httpClient.post('/api/scans/batch', { profiles });
      if (response.success) {
        alert(`Batch scan started: ${response.data?.count || 0} profiles`);
        setBatchInput('');
        setShowBatchForm(false);
        loadScans();
      }
    } catch (error) {
      console.error('Failed to start batch scan:', error);
      alert('Failed to start batch scan');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'likely_fake':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'suspicious':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'likely_fake':
        return 'bg-red-900 text-red-200';
      case 'suspicious':
        return 'bg-orange-900 text-orange-200';
      default:
        return 'bg-green-900 text-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Scan Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBatchForm(!showBatchForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-semibold"
          >
            <Zap className="w-5 h-5" />
            Batch Scan
          </button>
          <button
            onClick={loadScans}
            disabled={loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition font-semibold"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {showBatchForm && (
        <form onSubmit={handleBatchScan} className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-4">
          <h3 className="text-lg font-semibold">Batch Scan Profiles</h3>
          <p className="text-sm text-gray-400">Enter profiles in format: platform,username (one per line)</p>
          <textarea
            value={batchInput}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBatchInput(e.target.value)}
            placeholder="instagram,username1&#10;twitter,username2&#10;tiktok,username3"
            className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 font-mono text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !batchInput.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-white font-semibold"
            >
              {loading ? 'Scanning...' : 'Start Batch Scan'}
            </button>
            <button
              type="button"
              onClick={() => setShowBatchForm(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {scans.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">No scans found</p>
          </div>
        ) : (
          scans.map(scan => (
            <div key={scan._id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-red-500 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getVerdictIcon(scan.verdict)}
                  <div>
                    <h3 className="text-lg font-semibold">{scan.username}</h3>
                    <div className="flex gap-4 mt-1 text-sm">
                      <span className="text-gray-500">Platform: <span className="text-gray-300">{scan.platform}</span></span>
                      <span className="text-gray-500">Risk Score: <span className="text-red-400">{scan.totalRiskScore.toFixed(1)}</span></span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getVerdictColor(scan.verdict)}`}>
                        {scan.verdict.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{new Date(scan.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminScanManagement;
