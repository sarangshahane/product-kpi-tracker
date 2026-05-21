import { render } from '@wordpress/element';
import Dashboard from './pages/Dashboard';
import { KPIProvider } from './contexts/KPIContext';

document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('pkt-dashboard');
  if (el) {
    render(
      <KPIProvider>
        <Dashboard />
      </KPIProvider>,
      el
    );
  }
});
