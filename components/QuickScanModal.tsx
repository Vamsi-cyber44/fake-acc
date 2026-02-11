import React, { useState, FC, FormEvent, ChangeEvent } from 'react';
import { X, Search, Loader } from 'lucide-react';

interface QuickScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickScanModal: FC<QuickScanModalProps> = ({ isOpen, onClose }) => {
  const [platform, setPlatform] = useState('instagram');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulate scan
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    alert(`Scan result for ${username} on ${platform}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Quick Scan</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Platform</label>
            <select
              value={platform}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              placeholder="@username"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Scan Profile
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickScanModal;
