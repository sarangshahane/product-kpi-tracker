import React from 'react';

const Input = ({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder = '', 
  className = '',
  disabled = false,
  min,
  max,
  step
}) => {
  const classes = `pkt-input ${className}`;
  
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={classes}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
    />
  );
};

export default Input;
