import React from 'react';

const Card = ({ children, className = '', onClick = null }) => {
  const classes = `pkt-bg-white pkt-rounded-lg pkt-shadow pkt-p-4 ${className}`;
  
  if (onClick) {
    return (
      <div className={`${classes} pkt-cursor-pointer pkt-hover:shadow-md pkt-transition-shadow`} onClick={onClick}>
        {children}
      </div>
    );
  }
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default Card;
