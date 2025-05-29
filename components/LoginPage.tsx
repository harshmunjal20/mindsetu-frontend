
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import { UserType, CurrentUser } from '../types';
import { APP_NAME, USER_TYPES } from '../constants';
import { MindsetuLogoIcon, LoginIcon as LoginActionIcon } from './icons';
import { loginUser } from '../services/authService'; // Import loginUser

interface LoginPageProps {
  onLoginSuccess: (user: CurrentUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [instituteName, setInstituteName] = useState(''); // Added state for institute name
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  // const navigate = useNavigate(); // Already imported

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password || !instituteName) { // Added instituteName check
      setError('Please fill in all fields, including Institute Name.');
      setIsLoading(false);
      return;
    }

    const response = await loginUser(email, password, instituteName); // Pass instituteName
    setIsLoading(false);

    if (response.success && response.data) {
      onLoginSuccess(response.data);
    } else {
      setError(response.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center bg-gradient-to-br from-base-100-light via-slate-50 to-base-100-light dark:from-base-100-dark dark:via-slate-900 dark:to-base-100-dark px-4 py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-base-200-dark rounded-2xl shadow-2xl border dark:border-brand-primary-dark/20">
        <div className="text-center">
          <MindsetuLogoIcon 
            className="w-20 h-20 mx-auto mb-4"
            primaryColorClass="text-brand-primary"
            secondaryColorClass="text-brand-primary-dark"
            tertiaryColorClass="text-brand-secondary"
          />
          <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-primary-light">
            Login to {APP_NAME}
          </h1>
          <p className="mt-2 text-base-content-light/80 dark:text-base-content-dark/80">
            Access your mental wellness dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-base-content-light dark:text-base-content-dark mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary-light focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="instituteName" className="block text-sm font-medium text-base-content-light dark:text-base-content-dark mb-1">
              Institute Name
            </label>
            <input
              id="instituteName"
              name="instituteName"
              type="text"
              autoComplete="organization"
              required
              value={instituteName}
              onChange={(e) => setInstituteName(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary-light focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
              placeholder="Your Institute Name"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-base-content-light dark:text-base-content-dark mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary-light focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded-md text-center">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 bg-brand-primary hover:bg-brand-primary-dark focus:ring-brand-primary-light text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-150 ease-in-out transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <LoginActionIcon className="w-5 h-5 mr-2" />
                  Login
                </>
              )}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <a href="#" className="font-medium text-brand-secondary hover:text-brand-secondary-dark dark:text-brand-accent dark:hover:text-brand-accent-light">
            Forgot your password?
          </a>
        </div>
         <div className="text-sm text-center mt-4 text-base-content-light/70 dark:text-base-content-dark/70">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-medium text-brand-secondary hover:text-brand-secondary-dark dark:text-brand-accent dark:hover:text-brand-accent-light">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};