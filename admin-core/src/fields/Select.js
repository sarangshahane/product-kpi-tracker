import React from 'react';

const Select = ({ 
  options, 
  value, 
  onChange, 
  className = '',
  disabled = false
}) => {
  const classes = `pkt-input ${className}`;
  
  return (
    <select
      value={value}
      onChange={onChange}
      className={classes}
      disabled={disabled}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
