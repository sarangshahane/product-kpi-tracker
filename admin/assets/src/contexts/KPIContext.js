import React, { createContext, useContext, useEffect, useState } from 'react';
import apiFetch from '@wordpress/api-fetch';

const KPIContext = createContext(null);

export const KPIProvider = ({ children }) => {
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    apiFetch({ path: '/product-kpi-tracker/v1/kpis' }).then(setKpis);
  }, []);

  return (
    <KPIContext.Provider value={kpis}>{children}</KPIContext.Provider>
  );
};

export const useKPI = () => useContext(KPIContext);

export default KPIContext;
