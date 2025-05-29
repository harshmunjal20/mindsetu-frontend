
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserType, SignupFormData } from '../types';
import { APP_NAME, USER_TYPES } from '../constants';
import { MindsetuLogoIcon } from './icons';
import { signupUser } from '../services/authService';

export const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: UserType.Student, // Default to Student
    instituteName: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !formData.instituteName) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }
     if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    const response = await signupUser(formData);
    setIsLoading(false);

    if (response.success && response.data) {
      let defaultSuccessMsg = 'Account created successfully! Redirecting to login...';
      if (formData.userType === UserType.SuperAdmin) defaultSuccessMsg = 'SuperAdmin account registered! Redirecting to login...';
      else if (formData.userType === UserType.Teacher) defaultSuccessMsg = 'Teacher account activated! Redirecting to login...';
      else if (formData.userType === UserType.Student) defaultSuccessMsg = 'Student account activated! Redirecting to login...';

      setSuccessMessage(response.message || defaultSuccessMsg);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } else {
      setError(response.error || 'Signup failed. Please try again.');
    }
  };

  let pageTitle = 'Sign Up';
  let pageDescription = `Join ${APP_NAME} today.`;
  let buttonText = 'Sign Up';

  if (formData.userType === UserType.SuperAdmin) {
    pageTitle = 'Register Your Institute (SuperAdmin)';
    pageDescription = `Establish your institute on ${APP_NAME} by registering as a SuperAdmin.`;
    buttonText = 'Register Institute & SuperAdmin';
  } else if (formData.userType === UserType.Teacher) {
    pageTitle = 'Complete Teacher Registration';
    pageDescription = `Activate your Teacher account for ${APP_NAME}. You must be pre-registered by your institute's SuperAdmin.`;
    buttonText = 'Activate Teacher Account';
  } else if (formData.userType === UserType.Student) {
    pageTitle = 'Complete Student Registration';
    pageDescription = `Activate your Student account for ${APP_NAME}. You must be pre-registered by a Teacher at your institute.`;
    buttonText = 'Activate Student Account';
  }


  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center bg-gradient-to-br from-base-100-light via-slate-50 to-base-100-light dark:from-base-100-dark dark:via-slate-900 dark:to-base-100-dark px-4 py-12">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white dark:bg-base-200-dark rounded-2xl shadow-2xl border dark:border-brand-primary-dark/20">
        <div className="text-center">
          <MindsetuLogoIcon
            className="w-20 h-20 mx-auto mb-4"
            primaryColorClass="text-brand-primary"
            secondaryColorClass="text-brand-primary-dark"
            tertiaryColorClass="text-brand-secondary"
          />
          <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-primary-light">
            {pageTitle}
          </h1>
          <p className="mt-2 text-base-content-light/80 dark:text-base-content-dark/80">
            {pageDescription}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-base-content-light dark:text-base-content-dark mb-1">
              I am signing up as a:
            </label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary-light focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
            >
              {USER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === UserType.SuperAdmin ? 'Super Admin' : type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-base-content-light dark:text-base-content-dark mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary-light focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                placeholder="John"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-base-content-light dark:text-base-content-dark mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary-light focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                placeholder="Doe"
              />
            </div>
          </div>

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
              value={formData.email}
              onChange={handleChange}
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
              value={formData.instituteName}
              onChange={handleChange}
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
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary-light focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
              placeholder="•••••••• (min. 6 characters)"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-base-content-light dark:text-base-content-dark mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary-light focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded-md text-center">{error}</p>
          )}
          {successMessage && (
            <p className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-2 rounded-md text-center">{successMessage}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 bg-brand-secondary hover:bg-brand-secondary-dark focus:ring-brand-accent text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-150 ease-in-out transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (buttonText)}
            </button>
          </div>
        </form>
        <div className="text-sm text-center mt-4 text-base-content-light/70 dark:text-base-content-dark/70">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-primary hover:text-brand-primary-dark dark:text-brand-primary-light dark:hover:text-brand-accent-light">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};
