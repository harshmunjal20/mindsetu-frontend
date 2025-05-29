
import { Mood, UserType, SubscriptionTier } from './types';

export const APP_NAME = "Mindsetu";
export const APP_TAGLINE = "Bridge to Your Mind Wellness";
export const THEME_KEY = 'mindsetu-theme';

export const MOOD_OPTIONS: Mood[] = [
  Mood.Happy,
  Mood.Excited,
  Mood.Grateful,
  Mood.Calm,
  Mood.Neutral,
  Mood.Anxious,
  Mood.Stressed,
  Mood.Sad,
];

// For classifying student attitude from journal entries
export const POSITIVE_MOODS: Mood[] = [Mood.Happy, Mood.Excited, Mood.Grateful, Mood.Calm];
export const NEGATIVE_MOODS: Mood[] = [Mood.Sad, Mood.Anxious, Mood.Stressed];
// Neutral mood (Mood.Neutral) can be handled separately or grouped as needed.


export const MOOD_EMOJI_MAP: Record<Mood, string> = {
  [Mood.Happy]: '😊',
  [Mood.Sad]: '😢',
  [Mood.Anxious]: '😟',
  [Mood.Calm]: '😌',
  [Mood.Neutral]: '😐',
  [Mood.Excited]: '🤩',
  [Mood.Stressed]: '😫',
  [Mood.Grateful]: '🙏',
};

export const GEMINI_CHAT_MODEL = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';

export const EMERGENCY_CONTACTS = [
  { name: "National Suicide Prevention Lifeline", number: "988" },
  { name: "Crisis Text Line", number: "Text HOME to 741741" },
  { name: "University Counseling (Example)", number: "XXX-XXX-XXXX (Update this)" }
];

export const NAV_LINKS_LOGGED_IN = [
  { name: 'Home', path: '/', icon: 'HomeIcon' },
  { name: 'Dashboard', path: '/dashboard', icon: 'DashboardIcon' },
  { name: 'Journal', path: '/journal', icon: 'JournalIcon' }, 
  { name: 'Academics', path: '/academics', icon: 'AcademicCapIcon' },
  { name: 'Assignments', path: '/assignments', icon: 'ClipboardDocumentListIcon' },
  { name: 'Chatbot', path: '/chatbot', icon: 'ChatIcon' },
  { name: 'Subscription', path: '/subscription', icon: 'SubscriptionIcon' },
];

export const NAV_LINKS_LOGGED_OUT = [
  { name: 'Home', path: '/', icon: 'HomeIcon' },
  { name: 'Subscription', path: '/subscription', icon: 'SubscriptionIcon' }, 
];

export const USER_TYPES: UserType[] = [ // Updated: Only Student and Admin available for signup
  UserType.Student,
  UserType.Admin, 
];

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    name: "Starter",
    students: "Up to 200 students",
    features: ["Chatbot Access", "Basic Dashboard", "Mood Tracking", "Journaling"],
  },
  {
    name: "Pro",
    students: "Up to 1000 students",
    features: ["All Starter Features", "Academic & Assignment Analysis", "AI-Powered Journal Reflections", "AI-Powered Alerts", "Advanced Analytics", "Priority Support"],
    highlight: true,
  },
  {
    name: "Enterprise",
    students: "Unlimited Users",
    features: ["All Pro Features", "Custom Integrations", "Dedicated Account Manager", "Premium Quality Support"],
  }
];
