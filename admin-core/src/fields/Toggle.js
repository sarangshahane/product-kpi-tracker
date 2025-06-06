import React from 'react';

const Toggle = ({ 
  checked, 
  onChange, 
  disabled = false
}) => {
  return (
    <label className="inline-flex relative items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <div className={`
        w-11 h-6 bg-gray-200 rounded-full peer 
        peer-focus:ring-4 peer-focus:ring-blue-300 
        peer-checked:after:translate-x-full peer-checked:after:border-white 
        after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
        after:bg-white after:border-gray-300 after:border after:rounded-full 
        after:h-5 after:w-5 after:transition-all 
        peer-checked:bg-blue-600
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}></div>
    </label>
  );
};

export default Toggle;
