import React, { useState, FC, FormEvent, ChangeEvent } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle } from 'lucide-react';
import httpClient from '../../services/httpClient';

interface DetectionRule {
  _id: string;
  name: string;
  description: string;
  indicatorType: string;
  weight: number;
  threshold: number;
  riskScore: number;
  confidenceLevel: number;
  enabled: boolean;
}

const RulesTab: FC = () => {
  const [rules, setRules] = useState<DetectionRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    indicatorType: '',
    weight: 1,
    threshold: 50,
    riskScore: 10,
    confidenceLevel: 0.8
  });

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('weight') || name.includes('threshold') || name.includes('riskScore') || name.includes('confidence')
        ? parseFloat(value)
        : value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await httpClient.post('/api/rules', formData);
      if (response.success) {
        setFormData({
          name: '',
          description: '',
          indicatorType: '',
          weight: 1,
          threshold: 50,
          riskScore: 10,
          confidenceLevel: 0.8
        });
        setShowForm(false);
        loadRules();
      }
    } catch (error) {
      console.error('Failed to create rule:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRules = async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/rules');
      if (response.success) {
        setRules(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      const response = await httpClient.delete(`/api/rules/${ruleId}`);
      if (response.success) {
        setRules(rules.filter(r => r._id !== ruleId));
      }
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Detection Rules</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition font-semibold"
        >
          <Plus className="w-5 h-5" />
          New Rule
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Rule name"
              required
              className="col-span-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Description"
              className="col-span-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
            />
            <select
              name="indicatorType"
              value={formData.indicatorType}
              onChange={handleFormChange}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="">Select Type</option>
              <option value="profile_age">Profile Age</option>
              <option value="followers">Followers</option>
              <option value="engagement">Engagement</option>
              <option value="bot_pattern">Bot Pattern</option>
            </select>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleFormChange}
              placeholder="Weight"
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <input
              type="number"
              name="threshold"
              value={formData.threshold}
              onChange={handleFormChange}
              placeholder="Threshold"
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <input
              type="number"
              name="riskScore"
              value={formData.riskScore}
              onChange={handleFormChange}
              placeholder="Risk Score"
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-semibold">
              {loading ? 'Creating...' : 'Create Rule'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">No detection rules yet</p>
          </div>
        ) : (
          rules.map(rule => (
            <div key={rule._id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-red-500 transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {rule.enabled ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-gray-500" />}
                    {rule.name}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">{rule.description}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-gray-500">Type: <span className="text-gray-300">{rule.indicatorType}</span></span>
                    <span className="text-gray-500">Risk: <span className="text-red-400">{rule.riskScore}</span></span>
                    <span className="text-gray-500">Weight: <span className="text-gray-300">{rule.weight}</span></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-blue-400 hover:bg-gray-700 rounded transition">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => deleteRule(rule._id)} className="p-2 text-red-400 hover:bg-gray-700 rounded transition">
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

export default RulesTab;
