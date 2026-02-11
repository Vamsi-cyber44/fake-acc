import React, { FC } from 'react';
import { Check } from 'lucide-react';

const Pricing: FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      features: ['10 scans per day', 'Basic detection', '24h result storage']
    },
    {
      name: 'Pro',
      price: '$9.99',
      features: ['Unlimited scans', 'Advanced rules', '90d result storage', 'API access', 'Priority support'],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: ['Everything in Pro', 'Custom rules', 'Dedicated support', 'SLA guarantee']
    }
  ];

  return (
    <section id="pricing" className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Simple Pricing</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`p-8 rounded-lg border transition ${
                plan.highlighted
                  ? 'border-red-500 bg-white shadow-lg scale-105'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold text-red-600 mb-6">{plan.price}/mo</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  plan.highlighted
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
