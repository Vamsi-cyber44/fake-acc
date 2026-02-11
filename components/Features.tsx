import React, { FC } from 'react';
import { CheckCircle, TrendingUp, Bot, Lock, Zap, AlertTriangle } from 'lucide-react';

const Features: FC = () => {
  const features = [
    {
      icon: Bot,
      title: 'AI Detection',
      description: 'Machine learning-powered analysis of account patterns and behavior'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analysis',
      description: 'Instant scanning and results within seconds'
    },
    {
      icon: Lock,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with zero data storage'
    },
    {
      icon: Zap,
      title: 'Multiple Platforms',
      description: 'Support for Instagram, Twitter, TikTok, and more'
    },
    {
      icon: AlertTriangle,
      title: 'Risk Scoring',
      description: 'Detailed risk assessment with specific indicators'
    },
    {
      icon: CheckCircle,
      title: 'High Accuracy',
      description: '95% detection accuracy with minimal false positives'
    }
  ];

  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Powerful Features</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
                <Icon className="w-10 h-10 text-red-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
