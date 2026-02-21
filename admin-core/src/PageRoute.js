import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Import components
import NavigationHeader from '@Components/NavigationHeader';
import { Dashboard, Reports, Formulas, Settings } from '@Pages';

// Import styles
import '@Admin/common/main.css';

function PageRoute() {
    return(
        <Router>
            <div className="pkt-flex pkt-flex-col pkt-min-h-screen">
                <NavigationHeader />
                <div className="pkt-container pkt-mx-auto pkt-px-4 pkt-py-6">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/formulas" element={<Formulas />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </div>
            </div>
        </Router>
    )
}

export default PageRoute;
