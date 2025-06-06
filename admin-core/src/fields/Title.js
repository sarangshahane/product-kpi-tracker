import React from 'react';

const Title = ({ 
  text, 
  level = 'h2', 
  className = ''
}) => {
  const classes = `pkt-font-bold ${className}`;
  
  const sizeClasses = {
    h1: 'pkt-text-3xl pkt-mb-6',
    h2: 'pkt-text-2xl pkt-mb-4',
    h3: 'pkt-text-xl pkt-mb-3',
    h4: 'pkt-text-lg pkt-mb-2',
    h5: 'pkt-text-base pkt-mb-2',
    h6: 'pkt-text-sm pkt-mb-2'
  };
  
  const combinedClasses = `${classes} ${sizeClasses[level]}`;
  
  switch (level) {
    case 'h1':
      return <h1 className={combinedClasses}>{text}</h1>;
    case 'h3':
      return <h3 className={combinedClasses}>{text}</h3>;
    case 'h4':
      return <h4 className={combinedClasses}>{text}</h4>;
    case 'h5':
      return <h5 className={combinedClasses}>{text}</h5>;
    case 'h6':
      return <h6 className={combinedClasses}>{text}</h6>;
    case 'h2':
    default:
      return <h2 className={combinedClasses}>{text}</h2>;
  }
};

export default Title;
