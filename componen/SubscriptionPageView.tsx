
import React from 'react';
import { SUBSCRIPTION_TIERS, APP_NAME } from '../constants';
import { SubscriptionTier } from '../types';
import { CheckCircleIcon } from './icons'; // Using centralized icon

const SubscriptionCard: React.FC<{ tier: SubscriptionTier }> = ({ tier }) => {
  const cardBg = tier.highlight ? 'bg-brand-primary dark:bg-brand-primary-dark shadow-2xl' : 'bg-white dark:bg-base-200-dark shadow-xl';
  const textColor = tier.highlight ? 'text-white' : 'text-brand-primary dark:text-brand-primary-light';
  const featureTextColor = tier.highlight ? 'text-indigo-100 dark:text-indigo-200' : 'text-slate-600 dark:text-slate-300';
  const buttonClasses = tier.highlight 
    ? 'bg-white text-brand-primary hover:bg-slate-100' 
    : 'bg-brand-secondary hover:bg-brand-secondary-dark text-white';

  return (
    <div className={`p-8 rounded-2xl border ${tier.highlight ? 'border-transparent' : 'dark:border-brand-primary-dark/30 border-slate-200'} ${cardBg} transform hover:scale-105 transition-transform duration-300 flex flex-col`}>
      <h3 className={`text-3xl font-bold mb-2 ${textColor}`}>{tier.name}</h3>
      <p className={`text-sm mb-6 ${tier.highlight ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>{tier.students}</p>
      
      <ul className="space-y-3 mb-8 flex-grow">
        {tier.features.map((feature, index) => (
          <li key={index} className={`flex items-start ${featureTextColor}`}>
            <CheckCircleIcon className={`w-5 h-5 mr-2 mt-0.5 ${tier.highlight ? 'text-brand-accent-light' : 'text-brand-secondary'}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <button 
        className={`w-full font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out ${buttonClasses}`}
        onClick={() => alert(`Proceeding with ${tier.name} plan... (Integration needed)`)}
      >
        Choose Plan
      </button>
    </div>
  );
};

export const SubscriptionPageView: React.FC = () => {
  return (
    <div className="py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-brand-primary dark:text-brand-primary-light mb-4">
          Our Subscription Plans
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Choose the perfect plan for your institution to support student mental wellness with {APP_NAME}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {SUBSCRIPTION_TIERS.map(tier => (
          <SubscriptionCard key={tier.name} tier={tier} />
        ))}
      </div>

      <div className="mt-16 text-center p-6 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-3xl mx-auto">
        <h4 className="text-xl font-semibold text-brand-primary dark:text-brand-primary-light mb-2">Custom Pricing Note:</h4>
        <p className="text-slate-700 dark:text-slate-300">
          All plans are based on an annual subscription. There will be an additional subscription-based payment calculated per student added to your institution's plan. Please contact us for a detailed quote.
        </p>
      </div>
    </div>
  );
};
