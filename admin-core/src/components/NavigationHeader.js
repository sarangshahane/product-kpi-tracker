import React from 'react';
import { NavLink } from 'react-router-dom';

const NavigationHeader = () => {
  return (
    <div className="pkt-header">
      <h1 className="pkt-text-2xl pkt-font-bold pkt-mb-4">Product KPI Tracker</h1>
      <nav className="pkt-nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            isActive ? "pkt-nav-item-active" : "pkt-nav-item"
          }
          end
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/reports" 
          className={({ isActive }) => 
            isActive ? "pkt-nav-item-active" : "pkt-nav-item"
          }
        >
          Reports
        </NavLink>
        <NavLink 
          to="/formulas" 
          className={({ isActive }) => 
            isActive ? "pkt-nav-item-active" : "pkt-nav-item"
          }
        >
          Formulas
        </NavLink>
        <NavLink 
          to="/settings" 
          className={({ isActive }) => 
            isActive ? "pkt-nav-item-active" : "pkt-nav-item"
          }
        >
          Settings
        </NavLink>
      </nav>
    </div>
  );
};

export default NavigationHeader;
