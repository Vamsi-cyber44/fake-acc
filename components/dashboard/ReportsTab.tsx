import React, { useState, FC } from 'react';
import { Download, Trash2, Eye, AlertCircle } from 'lucide-react';
import httpClient from '../../services/httpClient';

interface Report {
  _id: string;
  username: string;
  platform: string;
  verdict: string;
  riskScore: number;
  createdAt: string;
}

const ReportsTab: FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = (await httpClient.get('/api/reports')) as any;
      if (response?.success) {
        setReports(response?.data || []);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      const response = (await httpClient.delete(`/api/reports/${reportId}`)) as any;
      if (response?.success) {
        setReports(reports.filter(r => r._id !== reportId));
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const downloadReport = async (reportId: string, format: string) => {
    try {
      const response = await httpClient.get(`/api/reports/${reportId}/download?format=${format}`);
      if (response) {
        const blob = new Blob([JSON.stringify(response)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.${format}`;
        a.click();
      }
    } catch (error) {
      console.error('Failed to download report:', error);
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
        <h2 className="text-2xl font-bold">Forensic Reports</h2>
        <button
          onClick={loadReports}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition font-semibold"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">No reports available</p>
          </div>
        ) : (
          reports.map(report => (
            <div key={report._id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-red-500 transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{report.username}</h3>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-gray-500">Platform: <span className="text-gray-300">{report.platform}</span></span>
                    <span className="text-gray-500">Risk Score: <span className="text-red-400">{report.riskScore.toFixed(1)}</span></span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getVerdictColor(report.verdict)}`}>
                      {report.verdict.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{new Date(report.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-blue-400 hover:bg-gray-700 rounded transition">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button onClick={() => downloadReport(report._id, 'json')} className="p-2 text-green-400 hover:bg-gray-700 rounded transition">
                    <Download className="w-5 h-5" />
                  </button>
                  <button onClick={() => deleteReport(report._id)} className="p-2 text-red-400 hover:bg-gray-700 rounded transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReportsTab;
