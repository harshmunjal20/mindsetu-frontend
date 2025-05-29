
import React, { useState } from 'react';
import { EMERGENCY_CONTACTS } from '../constants';
import { AlertTriangleIcon } from './icons';

export const EmergencySOSButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white font-bold p-4 rounded-full shadow-xl transition-transform duration-150 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 z-50"
        aria-label="Emergency SOS"
      >
        <AlertTriangleIcon className="w-6 h-6" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-lg w-full transform transition-all border border-brand-primary-light/20 dark:border-brand-primary-dark/20">
            <div className="flex items-center mb-4">
              <AlertTriangleIcon className="w-8 h-8 text-red-500 mr-3" />
              <h2 className="text-2xl font-bold text-red-500 dark:text-red-400">Emergency Support</h2>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-1">
              If you are in distress or need immediate support, please reach out. You are not alone.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Consider contacting one of the following resources or a trusted person:
            </p>
            
            <ul className="space-y-3 mb-6">
              {EMERGENCY_CONTACTS.map(contact => (
                <li key={contact.name} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                  <strong className="block text-brand-primary dark:text-brand-primary-light">{contact.name}:</strong>
                  <a href={contact.number.toLowerCase().startsWith('text') ? `sms:${contact.number.split('to')[1].trim()}` :`tel:${contact.number.replace(/\D/g,'')}`} className="text-brand-secondary hover:underline dark:text-brand-accent dark:hover:text-brand-accent-light">
                    {contact.number}
                  </a>
                </li>
              ))}
            </ul>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                In an immediate life-threatening situation, please call your local emergency number (e.g., 911 or 112).
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};