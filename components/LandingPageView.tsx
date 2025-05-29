
import React from 'react';
import { APP_NAME, APP_TAGLINE } from '../constants';
import { MindsetuLogoIcon, ArrowRightIcon, LoginIcon as GetStartedIcon, ChatIcon, JournalIcon, AcademicCapIcon, ClipboardDocumentListIcon } from './icons';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => (
  <div className="flex flex-col items-center p-6 bg-white dark:bg-base-200-dark rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border dark:border-brand-primary-dark/20 transform hover:-translate-y-1">
    <div className="mb-5 p-3 rounded-full bg-brand-secondary/10 dark:bg-brand-accent/10 text-brand-secondary dark:text-brand-accent">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-brand-primary dark:text-brand-primary-light mb-2 text-center">{title}</h3>
    <p className="text-sm text-base-content-light/80 dark:text-base-content-dark/80 text-center">{description}</p>
  </div>
);

interface LandingPageViewProps {
  onLoginRedirect: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onLoginRedirect }) => {
  const JournalFeatureIcon = () => <JournalIcon className="w-8 h-8" />;
  const AcademicFeatureIcon = () => <AcademicCapIcon className="w-8 h-8" />;
  const AssignmentFeatureIcon = () => <ClipboardDocumentListIcon className="w-8 h-8" />;
  const ChatFeatureIcon = () => <ChatIcon className="w-8 h-8" />;

  return (
    <div className="space-y-16 md:space-y-24 py-8 md:py-12">
      {/* Hero Section */}
      <section className="text-center">
        <MindsetuLogoIcon 
            className="w-24 h-24 mx-auto mb-6"
            primaryColorClass="text-brand-secondary"
            secondaryColorClass="text-brand-secondary-dark"
            tertiaryColorClass="text-slate-400 dark:text-slate-500"
        />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-primary dark:text-brand-primary-light mb-6">
          Welcome to {APP_NAME}
        </h1>
        <p className="text-lg md:text-xl text-base-content-light/90 dark:text-base-content-dark/90 mb-10 max-w-3xl mx-auto">
          {APP_TAGLINE}. An AI-powered mental health early warning system for students.
          Log your mood, analyze academic patterns & submission behaviors, and chat with an AI companion.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button
            onClick={onLoginRedirect} 
            className="w-full sm:w-auto flex items-center justify-center bg-brand-primary hover:bg-brand-primary-dark text-white font-semibold py-3.5 px-10 rounded-xl shadow-lg hover:shadow-brand-primary/40 transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:ring-offset-2 dark:focus:ring-offset-base-100-dark"
          >
            <GetStartedIcon className="w-5 h-5 mr-2.5" />
            Login or Sign Up
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl md:text-4xl font-semibold text-brand-primary dark:text-brand-primary-light mb-12 text-center">
          How {APP_NAME} Supports You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          <FeatureCard 
            title="Mood Journaling" 
            description="Log your daily mood and reflect on your feelings with optional AI insights." 
            icon={<JournalFeatureIcon />} 
          />
          <FeatureCard 
            title="Academic Insights" 
            description="Analyze academic performance patterns to identify trends and areas for focus." 
            icon={<AcademicFeatureIcon />} 
          />
          <FeatureCard 
            title="Submission Tracking" 
            description="Monitor assignment submission behaviors for early detection of potential challenges." 
            icon={<AssignmentFeatureIcon />} 
          />
          <FeatureCard 
            title="AI Chat Companion" 
            description="Talk to an empathetic AI chatbot, available 24/7 to listen and offer support." 
            icon={<ChatFeatureIcon />} 
          />
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="text-center p-8 md:p-12 bg-gradient-to-r from-brand-primary to-brand-secondary dark:from-brand-primary-dark dark:to-brand-secondary-dark rounded-2xl shadow-xl">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Prioritize Student Well-being?</h2>
        <p className="text-lg md:text-xl text-indigo-100 dark:text-indigo-200 mb-8">
          Implement Mindsetu today and take a proactive step towards supporting student mental health and academic success.
        </p>
        <button
          onClick={onLoginRedirect} 
          className="bg-white text-brand-primary hover:bg-slate-100 font-semibold py-3.5 px-12 rounded-xl shadow-md hover:shadow-lg transition duration-150 ease-in-out transform hover:scale-105"
        >
          Get Started Now
        </button>
      </section>
    </div>
  );
};