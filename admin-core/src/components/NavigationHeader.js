import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const NavigationHeader = () => {
  // State for theme toggle
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  
  // Effect to apply theme class to body
  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add('pkt-dark');
    } else {
      document.body.classList.remove('pkt-dark');
    }
  }, [isDarkTheme]);
  
  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };
  
  return (
    <header className="pkt-sticky pkt-top-8 pkt-z-50 pkt-bg-white pkt-shadow pkt-px-4 pkt-py-3 pkt-mb-6 pkt-border-b pkt-border-gray-200">
      <div className="pkt-container pkt-mx-auto">
        <div className="pkt-flex pkt-md:flex-row pkt-justify-between pkt-items-center">
          {/* Left Section - Logo and Navigation */}
          <div className="pkt-flex pkt-md:flex-row pkt-justify-between pkt-items-center pkt-gap-4">
            {/* Logo and Plugin Name */}
            <div className="pkt-flex pkt-md:flex-row pkt-items-center">
              <div className="pkt-mr-2">
                <svg className="pkt-w-8 pkt-h-8 pkt-text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="pkt-text-xl pkt-font-bold pkt-text-gray-800">Product's KPI Tracker</h1>
            </div>
            
            {/* Navigation Links */}
            <nav className="pkt-flex pkt-space-x-1 pkt-md:space-x-4">
              <NavLink 
                to="/" 
                end
                className={({ isActive }) => 
                  isActive 
                    ? "pkt-px-3 pkt-py-2 pkt-rounded-md pkt-text-sm pkt-font-medium pkt-bg-blue-100 pkt-text-blue-700" 
                    : "pkt-px-3 pkt-py-2 pkt-rounded-md pkt-text-sm pkt-font-medium pkt-text-gray-700 hover:pkt-bg-gray-100"
                }
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/reports" 
                className={({ isActive }) => 
                  isActive 
                    ? "pkt-px-3 pkt-py-2 pkt-rounded-md pkt-text-sm pkt-font-medium pkt-bg-blue-100 pkt-text-blue-700" 
                    : "pkt-px-3 pkt-py-2 pkt-rounded-md pkt-text-sm pkt-font-medium pkt-text-gray-700 hover:pkt-bg-gray-100"
                }
              >
                Reports
              </NavLink>
              <NavLink 
                to="/formulas" 
                className={({ isActive }) => 
                  isActive 
                    ? "pkt-px-3 pkt-py-2 pkt-rounded-md pkt-text-sm pkt-font-medium pkt-bg-blue-100 pkt-text-blue-700" 
                    : "pkt-px-3 pkt-py-2 pkt-rounded-md pkt-text-sm pkt-font-medium pkt-text-gray-700 hover:pkt-bg-gray-100"
                }
              >
                Formulas
              </NavLink>
              <NavLink 
                to="/settings" 
                className={({ isActive }) => 
                  isActive 
                    ? "pkt-px-3 pkt-py-2 pkt-rounded-md pkt-text-sm pkt-font-medium pkt-bg-blue-100 pkt-text-blue-700" 
                    : "pkt-px-3 pkt-py-2 pkt-rounded-md pkt-text-sm pkt-font-medium pkt-text-gray-700 hover:pkt-bg-gray-100"
                }
              >
                Settings
              </NavLink>
            </nav>
          </div>
          
          {/* Right Section - External Links and Theme Toggle */}
          <div className="pkt-flex pkt-items-center pkt-space-x-4">
            <a 
              href="https://example.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="pkt-text-sm pkt-text-gray-700 hover:pkt-text-blue-600"
            >
              Website
            </a>
            <a 
              href="https://example.com/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="pkt-text-sm pkt-text-gray-700 hover:pkt-text-blue-600"
            >
              Documentation
            </a>
            <a 
              href="https://example.com/support" 
              target="_blank" 
              rel="noopener noreferrer"
              className="pkt-text-sm pkt-text-gray-700 hover:pkt-text-blue-600"
            >
              Support
            </a>
            
            {/* Theme Toggle Switch */}
            <button 
              onClick={toggleTheme}
              className="pkt-flex pkt-items-center pkt-justify-center pkt-w-10 pkt-h-6 pkt-rounded-full pkt-bg-gray-200 focus:pkt-outline-none focus:pkt-ring-2 focus:pkt-ring-blue-500"
              aria-label={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
            >
              <span 
                className={`
                  pkt-w-5 pkt-h-5 pkt-rounded-full pkt-transform pkt-transition-transform pkt-duration-200 
                  ${isDarkTheme ? 'pkt-translate-x-4 pkt-bg-blue-600' : 'pkt-translate-x-0 pkt-bg-white pkt-shadow-md'}
                `}
              >
                {isDarkTheme ? (
                  <svg className="pkt-w-4 pkt-h-4 pkt-text-white pkt-mx-auto pkt-my-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="pkt-w-4 pkt-h-4 pkt-text-yellow-500 pkt-mx-auto pkt-my-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationHeader;
