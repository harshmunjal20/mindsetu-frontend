
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddStudentFormData, CurrentUser, UserType } from '../types';
import { UserAddIcon } from './icons';
import { teacherAddStudent } from '../services/authService'; // Updated service call

interface AddStudentViewProps {
  currentUser: CurrentUser; // Teacher or SuperAdmin performing the action
}

export const AddStudentView: React.FC<AddStudentViewProps> = ({ currentUser }) => {
  const [formData, setFormData] = useState<AddStudentFormData>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    if (!formData.firstName || !formData.lastName || !formData.email) {
      setMessage({ type: 'error', text: 'All fields (First Name, Last Name, Email) are required.' });
      setIsLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      setIsLoading(false);
      return;
    }

    const response = await teacherAddStudent(currentUser, formData); // Updated service call
    setIsLoading(false);

    if (response.success && response.data) {
      const successText = response.message || `Student ${formData.firstName} ${formData.lastName} (${formData.email}) pre-registered successfully! They can now complete their signup.`;
      setMessage({ type: 'success', text: successText });
      setFormData({ firstName: '', lastName: '', email: '' }); // Clear form
    } else {
      setMessage({ type: 'error', text: response.error || "Failed to pre-register student." });
    }
  };
  
  const actorRoleDisplay = currentUser.userType === UserType.SuperAdmin ? "Super Admin" : "Teacher";

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-base-200-dark p-8 rounded-2xl shadow-xl border dark:border-brand-primary-dark/20">
      <div className="flex items-center mb-6">
        <UserAddIcon className="w-8 h-8 mr-3 text-brand-primary dark:text-brand-primary-light" />
        <h1 className="text-3xl font-bold text-brand-primary dark:text-brand-primary-light">Pre-register New Student</h1>
      </div>
      <p className="mb-6 text-slate-600 dark:text-slate-300">
        As a {actorRoleDisplay} for {currentUser.instituteName}, enter the student's details to pre-register them. They will then need to complete the signup process using their email and your institute name to set their password and activate their account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-base-content-light dark:text-base-content-dark mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary-light focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
              placeholder="Jane"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-base-content-light dark:text-base-content-dark mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary-light focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
              placeholder="Smith"
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-base-content-light dark:text-base-content-dark mb-1">
            Student Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-primary-light focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
            placeholder="jane.smith@example.edu"
          />
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center py-3 px-6 bg-brand-primary hover:bg-brand-primary-dark focus:ring-brand-primary-light text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-base-200-dark transition-all duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
          >
             {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <UserAddIcon className="w-5 h-5 mr-2" />
                  Pre-register Student
                </>
              )}
          </button>
        </div>
      </form>
    </div>
  );
};
