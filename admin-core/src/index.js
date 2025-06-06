import React from 'react';
import { createRoot } from 'react-dom/client';

/* Main Component */
import PageRoute from './PageRoute';

const container = document.getElementById('product-kpi-tracker--wrapper');
const root = createRoot(container); // Added compatibility for React 18.

const App = () => <PageRoute />;

root.render(<App />);
