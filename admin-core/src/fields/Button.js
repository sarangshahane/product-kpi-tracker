import React from 'react';

const Button = ({ 
  text, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  isLoading = false,
  type = 'button'
}) => {
  const baseClasses = 'pkt-px-4 pkt-py-2 pkt-rounded pkt-transition-colors pkt-focus:outline-none pkt-focus:ring-2 pkt-focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'pkt-bg-blue-600 pkt-text-white pkt-hover:bg-blue-700 pkt-focus:ring-blue-500',
    secondary: 'pkt-bg-gray-200 pkt-text-gray-800 pkt-hover:bg-gray-300 pkt-focus:ring-gray-500',
    danger: 'pkt-bg-red-600 pkt-text-white pkt-hover:bg-red-700 pkt-focus:ring-red-500',
    success: 'pkt-bg-green-600 pkt-text-white pkt-hover:bg-green-700 pkt-focus:ring-green-500',
  };
  
  const disabledClasses = 'pkt-opacity-50 pkt-cursor-not-allowed';
  
  const classes = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${disabled || isLoading ? disabledClasses : ''}
    ${className}
  `;
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <span className="pkt-flex pkt-items-center">
          <svg className="pkt-animate-spin -pkt-ml-1 pkt-mr-2 pkt-h-4 pkt-w-4 pkt-text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="pkt-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="pkt-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : text}
    </button>
  );
};

export default Button;
