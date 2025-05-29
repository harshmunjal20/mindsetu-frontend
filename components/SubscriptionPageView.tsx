
import React from 'react';
import { SUBSCRIPTION_TIERS, APP_NAME } from '../constants';
import { SubscriptionTier } from '../types';
import { CheckCircleIcon } from '../components/icons';

const SubscriptionCard: React.FC<{ tier: SubscriptionTier }> = ({ tier }) => {
  const cardBg = tier.highlight 
    ? 'bg-gradient-to-br from-brand-primary to-indigo-700 dark:from-brand-primary-dark dark:to-indigo-800 shadow-2xl ring-2 ring-brand-accent dark:ring-brand-accent-light' 
    : 'bg-white dark:bg-base-200-dark shadow-xl';
  const textColor = tier.highlight ? 'text-white' : 'text-brand-primary dark:text-brand-primary-light';
  const subTextColor = tier.highlight ? 'text-indigo-200 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400';
  const priceColor = tier.highlight ? 'text-brand-accent-light' : 'text-brand-secondary dark:text-brand-accent';
  const featureTextColor = tier.highlight ? 'text-indigo-100 dark:text-indigo-200' : 'text-slate-600 dark:text-slate-300';
  
  const buttonClasses = tier.highlight 
    ? 'bg-white text-brand-primary hover:bg-slate-100 dark:bg-brand-accent-light dark:text-brand-primary-dark dark:hover:bg-brand-accent' 
    : 'bg-brand-secondary hover:bg-brand-secondary-dark text-white dark:bg-brand-accent dark:hover:bg-brand-accent-dark';

  return (
    <div className={`p-8 rounded-2xl border ${tier.highlight ? 'border-transparent' : 'dark:border-brand-primary-dark/30 border-slate-200'} ${cardBg} transform hover:scale-105 transition-transform duration-300 flex flex-col`}>
      <div className="text-center">
        <h3 className={`text-3xl font-bold mb-2 ${textColor}`}>{tier.name}</h3>
        <p className={`text-sm mb-4 ${subTextColor}`}>{tier.students}</p>
        <p className={`text-2xl font-bold my-4 ${priceColor}`}>{tier.price}</p>
        {tier.name === "Starter" && <p className={`text-xs mb-6 ${subTextColor}`}>Ideal for getting started.</p>}
        {tier.name === "Pro" && <p className={`text-xs mb-6 ${subTextColor}`}>Most popular for growing institutions.</p>}
        {tier.name === "Enterprise" && <p className={`text-xs mb-6 ${subTextColor}`}>For large scale, custom needs.</p>}
      </div>
      
      <ul className="space-y-2 my-6 flex-grow">
        {tier.features.map((feature, index) => (
          <li key={index} className={`flex items-start text-sm ${featureTextColor}`}>
            <CheckCircleIcon className={`w-5 h-5 mr-2 mt-0.5 flex-shrink-0 ${tier.highlight ? 'text-brand-accent-light' : 'text-brand-secondary dark:text-brand-accent'}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <button 
        className={`w-full font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out ${buttonClasses} mt-auto`}
        onClick={() => alert(`Contact sales for the ${tier.name} plan.`)}
      >
        Choose Plan
      </button>
    </div>
  );
};

export const SubscriptionPageView: React.FC = () => {
  return (
    <div className="py-12">
      <div className="text-center mb-16 px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-brand-primary dark:text-brand-primary-light mb-4">
          Our Subscription Plans
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Choose the perfect plan for your institution to support student mental wellness with {APP_NAME}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {SUBSCRIPTION_TIERS.map(tier => (
          <SubscriptionCard key={tier.name} tier={tier} />
        ))}
      </div>
      
       <div className="mt-16 text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl max-w-3xl mx-auto border dark:border-slate-700">
        <h4 className="text-xl font-semibold text-brand-primary dark:text-brand-primary-light mb-2">Need a Custom Solution or Have Questions?</h4>
        <p className="text-slate-700 dark:text-slate-300">
          All plans are typically billed annually. For specific requirements, volume discounts, or a detailed quote based on your institution's size, please contact our sales team.
        </p>
        <button 
            className="mt-4 bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
            onClick={() => alert('Contacting sales... (Please implement actual contact method)')}
        >
            Contact Sales
        </button>
      </div>
    </div>
  );
};
