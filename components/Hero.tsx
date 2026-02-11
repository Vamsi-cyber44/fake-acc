import React, { FC } from 'react';
import { Shield, ArrowRight } from 'lucide-react';

interface HeroProps {
  onGetStarted?: () => void;
}

const Hero: FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="flex items-center justify-center gap-2 text-red-500 font-semibold">
          <Shield className="w-5 h-5" />
          Protect Your Community
        </div>

        <h1 className="text-5xl md:text-6xl font-bold">
          Detect Fake Accounts in Seconds
        </h1>

        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Advanced AI-powered detection system that identifies suspicious and fake social media profiles with 95% accuracy.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            onClick={onGetStarted}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            Start Free Scan <ArrowRight className="w-4 h-4" />
          </button>
          <button className="px-8 py-3 border border-gray-500 hover:border-white rounded-lg font-semibold transition">
            Watch Demo
          </button>
        </div>

        <div className="flex gap-8 justify-center pt-8 text-gray-300 text-sm">
          <div>✓ 95% Accuracy</div>
          <div>✓ 50+ Detection Rules</div>
          <div>✓ Instant Results</div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
