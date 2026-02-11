import React, { FC } from 'react';
import { BarChart3, Clock, AlertCircle } from 'lucide-react';

interface DashboardProps {
  onLogout?: () => void;
}

const Dashboard: FC<DashboardProps> = ({ onLogout }) => {
  const [scans] = React.useState([
    { id: 1, username: 'profile1', platform: 'instagram', verdict: 'suspicious', riskScore: 67 },
    { id: 2, username: 'profile2', platform: 'twitter', verdict: 'legitimate', riskScore: 23 }
  ]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-12 h-12 text-blue-500" />
              <div>
                <p className="text-gray-600">Total Scans</p>
                <p className="text-3xl font-bold">{scans.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-12 h-12 text-orange-500" />
              <div>
                <p className="text-gray-600">Suspicious Found</p>
                <p className="text-3xl font-bold">1</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-4">
              <Clock className="w-12 h-12 text-green-500" />
              <div>
                <p className="text-gray-600">Avg Scan Time</p>
                <p className="text-3xl font-bold">2.3s</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Recent Scans</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Username</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Platform</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Verdict</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {scans.map(scan => (
                <tr key={scan.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3">{scan.username}</td>
                  <td className="px-6 py-3 capitalize">{scan.platform}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${
                      scan.verdict === 'suspicious'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {scan.verdict}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-semibold">{scan.riskScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
