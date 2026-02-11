import React, { FC } from 'react';
import { ThumbsUp, Target, BarChart3 } from 'lucide-react';

const WhyUs: FC = () => {
  return (
    <section id="about" className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-lg transition">
            <ThumbsUp className="w-12 h-12 text-red-600 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Trusted by Thousands</h3>
            <p className="text-gray-600">Used by community managers and safety teams worldwide</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-lg transition">
            <Target className="w-12 h-12 text-red-600 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Proven Accuracy</h3>
            <p className="text-gray-600">95% detection rate with continuous model improvements</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-lg transition">
            <BarChart3 className="w-12 h-12 text-red-600 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Advanced Analytics</h3>
            <p className="text-gray-600">Detailed insights and comprehensive reporting</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
