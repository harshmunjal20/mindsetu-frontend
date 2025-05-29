
import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Theme, CurrentUser, UserType } from '../types';
import { APP_NAME, NAV_LINKS_LOGGED_IN, NAV_LINKS_LOGGED_OUT } from '../constants';
import { SunIcon, MoonIcon, MindsetuLogoIcon, IconMap, LoginIcon, LogoutIcon } from './icons';

interface NavbarProps {
  theme: Theme;
  toggleTheme: () => void;
  currentUser: CurrentUser | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme, currentUser, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isLoggedIn = !!currentUser;

  const currentNavLinks = useMemo(() => {
    if (!isLoggedIn || !currentUser) {
      return NAV_LINKS_LOGGED_OUT;
    }
    let links = [...NAV_LINKS_LOGGED_IN]; // Create a copy to filter

    // Hide Journal for Teacher and SuperAdmin
    if (currentUser.userType === UserType.Teacher || currentUser.userType === UserType.SuperAdmin) {
      links = links.filter(link => link.name !== 'Journal');
    }

    // Hide Subscription for all logged-in users for now (can be role-specific later)
    links = links.filter(link => link.name !== 'Subscription');
    
    // "Add Student" and "Add Teacher" are not direct nav links but accessed from dashboard

    return links;
  }, [isLoggedIn, currentUser]);


  const navBgColor = theme === 'dark' ? 'bg-base-200-dark border-b border-brand-primary-dark/30' : 'bg-white border-b border-slate-200';
  const logoTextColor = theme === 'dark' ? 'text-brand-primary-light' : 'text-brand-primary';
  const linkTextColor = theme === 'dark' ? 'text-base-content-dark hover:text-brand-accent-light' : 'text-base-content-light hover:text-brand-primary';
  const activeLinkBgColor = theme === 'dark' ? 'bg-brand-primary text-white' : 'bg-brand-primary-light text-brand-primary-dark';
  const activeLinkTextColor = theme === 'dark' ? 'text-white' : 'text-brand-primary-dark';
  const userTextColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  
  const userRoleDisplay = currentUser?.userType === UserType.SuperAdmin ? "Super Admin" : currentUser?.userType;

  return (
    <nav className={`sticky top-0 z-50 shadow-md ${navBgColor}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center group">
              <MindsetuLogoIcon
                className="h-8 w-auto group-hover:opacity-80 transition-opacity"
                primaryColorClass={theme === 'dark' ? 'text-brand-accent' : 'text-brand-secondary'}
                secondaryColorClass={theme === 'dark' ? 'text-brand-accent-dark' : 'text-brand-secondary-dark'}
                tertiaryColorClass={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}
              />
              <span className={`ml-2 text-xl font-semibold ${logoTextColor} group-hover:opacity-80 transition-opacity`}>{APP_NAME}</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center">
            <div className="ml-10 flex items-baseline space-x-1">
              {currentNavLinks.map((link) => {
                const Icon = IconMap[link.icon];
                const isActive = location.pathname === link.path || (link.path === "/dashboard" && location.pathname.startsWith("/dashboard"));
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150
                      ${isActive
                        ? `${activeLinkBgColor} ${activeLinkTextColor}`
                        : `${linkTextColor} hover:bg-brand-primary/10 dark:hover:bg-brand-primary-light/10`
                      }`}
                  >
                    {Icon && <Icon className={`w-4 h-4 mr-1.5 ${isActive ? activeLinkTextColor : (theme === 'dark' ? 'text-slate-400 group-hover:text-brand-accent-light' : 'text-slate-500 group-hover:text-brand-primary')}`} />}
                    {link.name}
                  </Link>
                );
              })}
            </div>
            <div className="ml-4 flex items-center">
              {!isLoggedIn ? (
                <Link
                  to="/login"
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${linkTextColor} hover:bg-brand-primary/10 dark:hover:bg-brand-primary-light/10 border border-brand-secondary dark:border-brand-accent hover:bg-brand-secondary/20 dark:hover:bg-brand-accent/20`}
                >
                  <LoginIcon className={`w-4 h-4 mr-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                  Login
                </Link>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${userTextColor}`}>
                    Hello, {currentUser.firstName}! ({userRoleDisplay})
                  </span>
                  <button
                    onClick={onLogout}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${linkTextColor} hover:bg-brand-primary/10 dark:hover:bg-brand-primary-light/10 border border-brand-secondary dark:border-brand-accent hover:bg-brand-secondary/20 dark:hover:bg-brand-accent/20`}
                  >
                    <LogoutIcon className={`w-4 h-4 mr-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2
              ${theme === 'dark' ? 'text-yellow-400 hover:bg-slate-700 focus:ring-yellow-500 focus:ring-offset-base-200-dark' : 'text-slate-600 hover:bg-slate-200 focus:ring-brand-primary focus:ring-offset-white'}`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
            <div className="md:hidden ml-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset
                  ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700 focus:ring-brand-accent' : 'text-slate-500 hover:bg-slate-200 focus:ring-brand-primary'}`}
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 z-40 p-2 transition transform origin-top-right" id="mobile-menu">
          <div className={`rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 ${theme === 'dark' ? 'bg-base-200-dark divide-slate-700' : 'bg-white divide-slate-200'}`}>
            <div className="pt-2 pb-3 space-y-1 px-2">
              {currentNavLinks.map((link) => {
                 const Icon = IconMap[link.icon];
                 const isActive = location.pathname === link.path;
                return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-150
                  ${isActive
                    ? `${activeLinkBgColor} ${activeLinkTextColor}`
                    : `${linkTextColor} hover:bg-brand-primary/10 dark:hover:bg-brand-primary-light/10`
                  }`}
                >
                   {Icon && <Icon className={`w-5 h-5 mr-2 ${isActive ? activeLinkTextColor : (theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}`} />}
                  {link.name}
                </Link>
              );
              })}
               {!isLoggedIn ? (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ${linkTextColor} hover:bg-brand-primary/10 dark:hover:bg-brand-primary-light/10 mt-2 pt-3 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}
                >
                  <LoginIcon className={`w-5 h-5 mr-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                  Login
                </Link>
              ) : (
                <>
                  <div className={`px-3 py-2 text-base font-medium ${userTextColor} mt-2 pt-3 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                    Hello, {currentUser.firstName}! ({userRoleDisplay})
                  </div>
                  <button
                    onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ${linkTextColor} hover:bg-brand-primary/10 dark:hover:bg-brand-primary-light/10`}
                  >
                    <LogoutIcon className={`w-5 h-5 mr-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
