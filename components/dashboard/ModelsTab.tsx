import React, { useState, FC } from 'react';
import { Zap, CheckCircle, Trash2, AlertCircle } from 'lucide-react';
import httpClient from '../../services/httpClient';

interface MLModel {
  _id: string;
  name: string;
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  active: boolean;
  createdAt: string;
}

const ModelsTab: FC = () => {
  const [models, setModels] = useState<MLModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<MLModel | null>(null);

  const loadModels = async () => {
    setLoading(true);
    try {
      const response = await httpClient.get('/api/models');
      if (response.success) {
        const modelList = response.data || [];
        setModels(modelList);
        const active = modelList.find((m: MLModel) => m.active);
        if (active) setActiveModel(active);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };

  const activateModel = async (modelId: string) => {
    try {
      const response = await httpClient.post(`/api/models/${modelId}/activate`, {});
      if (response.success) {
        loadModels();
      }
    } catch (error) {
      console.error('Failed to activate model:', error);
    }
  };

  const deleteModel = async (modelId: string) => {
    if (activeModel?._id === modelId) {
      alert('Cannot delete the active model');
      return;
    }
    if (!window.confirm('Delete this model?')) return;
    try {
      const response = await httpClient.delete(`/api/models/${modelId}`);
      if (response.success) {
        setModels(models.filter(m => m._id !== modelId));
      }
    } catch (error) {
      console.error('Failed to delete model:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ML Models</h2>
        <button
          onClick={loadModels}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition font-semibold"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {activeModel && (
        <div className="bg-green-900 border border-green-700 rounded-lg p-4">
          <h3 className="font-semibold text-green-200 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Active Model: {activeModel.name} v{activeModel.version}
          </h3>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-green-300">Accuracy: {(activeModel.accuracy * 100).toFixed(1)}%</span>
            <span className="text-green-300">Precision: {(activeModel.precision * 100).toFixed(1)}%</span>
            <span className="text-green-300">Recall: {(activeModel.recall * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {models.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">No models available</p>
          </div>
        ) : (
          models.map(model => (
            <div key={model._id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-red-500 transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    {model.name}
                    {model.active && <span className="text-xs bg-green-700 px-2 py-0.5 rounded">ACTIVE</span>}
                  </h3>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-gray-500">Version: <span className="text-gray-300">{model.version}</span></span>
                    <span className="text-gray-500">Accuracy: <span className="text-blue-400">{(model.accuracy * 100).toFixed(1)}%</span></span>
                    <span className="text-gray-500">Precision: <span className="text-blue-400">{(model.precision * 100).toFixed(1)}%</span></span>
                    <span className="text-gray-500">Recall: <span className="text-blue-400">{(model.recall * 100).toFixed(1)}%</span></span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{new Date(model.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  {!model.active && (
                    <button
                      onClick={() => activateModel(model._id)}
                      className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 rounded transition font-semibold"
                    >
                      Activate
                    </button>
                  )}
                  <button
                    onClick={() => deleteModel(model._id)}
                    disabled={model.active}
                    className="p-2 text-red-400 hover:bg-gray-700 rounded transition disabled:opacity-50"
                  >
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

export default ModelsTab;
