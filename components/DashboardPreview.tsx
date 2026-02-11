import React, { FC } from 'react';

const DashboardPreview: FC = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Scan Dashboard</h2>
        <div className="bg-gray-100 rounded-lg p-8 border-2 border-gray-300 min-h-96 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Dashboard Preview</p>
            <p className="text-gray-400">Complete scan results, history, and analytics</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
