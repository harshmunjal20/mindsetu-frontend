
import React from 'react';

interface IconProps {
  className?: string;
}

interface MindsetuLogoIconProps extends IconProps {
  primaryColorClass?: string;
  secondaryColorClass?: string;
  tertiaryColorClass?: string;
}

export const MindsetuLogoIcon: React.FC<MindsetuLogoIconProps> = ({ 
  className = "w-8 h-8",
  primaryColorClass = "text-emerald-500 dark:text-emerald-400", 
  secondaryColorClass = "text-emerald-600 dark:text-emerald-500",
  tertiaryColorClass = "text-slate-400 dark:text-slate-500"
}) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M50 70C50 70 40 60 40 50C40 40 50 30 50 30C50 30 60 40 60 50C60 60 50 70 50 70Z" className={`fill-current ${primaryColorClass}`} />
    <path d="M50 30C50 30 45 40 40 50M50 30C50 30 55 40 60 50" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className={`stroke-current ${secondaryColorClass}`} />
    <path d="M30 75C30 75 40 80 50 80C60 80 70 75 70 75" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className={`stroke-current ${tertiaryColorClass}`} />
    <path d="M25 80C25 80 37.5 85 50 85C62.5 85 75 80 75 80" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className={`stroke-current ${tertiaryColorClass} opacity-70`} />
  </svg>
);


export const SunIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

export const HomeIcon: React.FC<IconProps> = ({ className = "w-5 h-5 mr-2" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

export const DashboardIcon: React.FC<IconProps> = ({ className = "w-5 h-5 mr-2" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 14.25V21m16.5-6.75V21" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 10.5h16.5M3.75 14.25h16.5" />
 </svg>
);

export const JournalIcon: React.FC<IconProps> = ({ className = "w-5 h-5 mr-2" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);


export const AcademicCapIcon: React.FC<IconProps> = ({ className = "w-5 h-5 mr-2" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
  </svg>
);

export const ClipboardDocumentListIcon: React.FC<IconProps> = ({ className = "w-5 h-5 mr-2" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.172O15.75 4.007A48.668 48.668 0 0012 3.75c-2.632 0-5.14.602-7.403 1.523O3.024 3.884 3 6.108V16.5A2.25 2.25 0 005.25 18.75h3.75M10.5 18.75h.008v.008h-.008V18.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 18.75h.008v.008h-.008V18.75zM10.5 18.75c0 .003.002.005.005.007h3.74c.003-.002.005-.004.005-.007L10.5 18.75z" />
  </svg>
);

export const ChatIcon: React.FC<IconProps> = ({ className = "w-5 h-5 mr-2" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-3.86 8.25-8.625 8.25S3.75 16.556 3.75 12 7.61 3.75 12.375 3.75 21 7.444 21 12z" />
  </svg>
);

export const SendIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

export const AlertTriangleIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);
export { AlertTriangleIcon as ExclamationTriangleIcon };

export const ArrowRightIcon: React.FC<IconProps> = ({ className = "w-5 h-5 ml-2" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);


export const LoginIcon: React.FC<IconProps> = ({ className = "w-5 h-5 mr-2" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m12 0V9.75M15.75 9H9.75m6 0v6" />
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ className = "w-5 h-5 mr-2" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

export const SubscriptionIcon: React.FC<IconProps> = ({ className = "w-5 h-5 mr-2" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h5.25m0 0H12m0 0H9.75M12 9.75V12m0-2.25V6.75M15 9.75V12m0-2.25V6.75m-3 0V6.75m0 0H9.75M12 15V12m0 3V12m0 0H9.75M12 12H9.75m2.25 0V9.75m0 0H9.75M12 9.75V12m2.25-1.5V6.75M15 6.75V9.75m0 0V12m0 0V15m0 0V18M9.75 18V15m0 0V12m0 0V9.75m0 0V6.75m0 0H12m0 0H15" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const UserAddIcon: React.FC<IconProps> = ({ className = "w-5 h-5 mr-2" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.5 21h-1c-2.134 0-4.057-.732-5.585-1.995z" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

export const PencilSquareIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931" />
  </svg>
);

export const LightBulbIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a3 3 0 00-3-3m3 3a3 3 0 003-3m-3 3V11.25m2.25 4.5A3.375 3.375 0 0112 15a3.375 3.375 0 01-3.375-2.25M12 18.75a3.375 3.375 0 003.375-2.25H8.625a3.375 3.375 0 003.375 2.25z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75a3 3 0 013-3m0 0a3 3 0 013 3m-3-3V6.75m0 0a3 3 0 016 0v1.5M9 12.75V6.75m0 0a3 3 0 00-6 0v1.5m6 0v3.75" />
  </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-1.54M15 15.75a3 3 0 01-6 0m6 0a3 3 0 00-6 0m6 0v-3.375c0-.621-.503-1.125-1.125-1.125H10.875c-.621 0-1.125.504-1.125 1.125V15.75m0 0v2.25m0-2.25H5.625c-.621 0-1.125.504-1.125 1.125v2.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V19.5A2.25 2.25 0 0018 17.25V15.75" />
  </svg>
);

export const CalendarDaysIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008z" />
  </svg>
);

export const PlusCircleIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => ( // Solid version
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.06-1.06L11.25 12.19l-1.72-1.72a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l3.75-3.75z" clipRule="evenodd" />
  </svg>
);

export const PaperAirplaneIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const BellIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

export const CheckBadgeIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => ( // Solid version
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M8.603 3.799A4.5 4.5 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.5 4.5 0 013.498 1.307 4.5 4.5 0 01.153 6.023A4.5 4.5 0 0118.25 15c0 1.142-.396 2.206-1.057 3.03a4.5 4.5 0 01-3.203 1.47A4.5 4.5 0 0112 21.75a4.5 4.5 0 01-3.397-1.549 4.5 4.5 0 01-3.498-1.306 4.5 4.5 0 01-.153-6.023A4.5 4.5 0 015.75 15c0-1.142.396-2.206 1.057-3.03a4.5 4.5 0 013.203-1.47zm0 0a2.25 2.25 0 00-1.79 1.019c-.43.781-.738 1.634-.974 2.522a2.25 2.25 0 00.61 2.138c.276.26.64.387 1.003.429 1.008.123 2.035.33 3.05.624a2.25 2.25 0 002.01-.406c.45-.398.726-.975.71-1.591a2.25 2.25 0 00-.367-1.008c-.02-.03-.038-.062-.058-.094a2.25 2.25 0 00-.893-1.114A2.25 2.25 0 0012 6.75a2.25 2.25 0 00-1.79-1.018z" clipRule="evenodd" />
    <path d="M12.75 16.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
    <path fillRule="evenodd" d="M12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75z" clipRule="evenodd" />
    <path d="M14.25 12a.75.75 0 10-1.5 0 .75.75 0 001.5 0z" />
  </svg>
);


export const IconMap: Record<string, React.FC<IconProps>> = {
  HomeIcon,
  DashboardIcon,
  JournalIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ChatIcon,
  SubscriptionIcon,
  LoginIcon, 
  LogoutIcon,
  UserAddIcon,
  SunIcon,
  MoonIcon,
  LightBulbIcon,
  UsersIcon,
  CalendarDaysIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  ClockIcon,
  BellIcon,
  AlertTriangleIcon,
  ExclamationTriangleIcon: AlertTriangleIcon, // Fixed: Explicitly map to AlertTriangleIcon
  CheckBadgeIcon,
  TrashIcon,
  PencilSquareIcon,
  SendIcon,
  ArrowRightIcon
  // Add other icons here if they are to be accessed by string key
};
