import React, { useState } from 'react';

// This is a simplified version. In a real implementation, you would use a library like react-datepicker
const DateRangePicker = ({ startDate, endDate, onChange }) => {
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };
  
  const handleStartDateChange = (e) => {
    const newStartDate = new Date(e.target.value);
    onChange({
      startDate: newStartDate,
      endDate
    });
  };
  
  const handleEndDateChange = (e) => {
    const newEndDate = new Date(e.target.value);
    onChange({
      startDate,
      endDate: newEndDate
    });
  };
  
  return (
    <div className="flex space-x-2">
      <input
        type="date"
        className="pkt-input"
        value={formatDate(startDate)}
        onChange={handleStartDateChange}
      />
      <span className="flex items-center">to</span>
      <input
        type="date"
        className="pkt-input"
        value={formatDate(endDate)}
        onChange={handleEndDateChange}
      />
    </div>
  );
};

export default DateRangePicker;
