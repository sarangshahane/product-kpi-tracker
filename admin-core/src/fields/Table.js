import React from 'react';

const Table = ({ 
  headers, 
  data, 
  className = '',
  emptyMessage = 'No data available'
}) => {
  const classes = `pkt-table ${className}`;
  
  if (!data || data.length === 0) {
    return (
      <div className="pkt-text-center pkt-py-6 pkt-text-gray-500">
        {emptyMessage}
      </div>
    );
  }
  
  return (
    <div className="pkt-overflow-x-auto">
      <table className={classes}>
        <thead className="pkt-table-header">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="pkt-table-header-cell">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="pkt-table-body">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="pkt-table-row">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="pkt-table-cell">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
