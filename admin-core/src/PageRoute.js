import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import components
import NavigationHeader from '@Components/NavigationHeader';
import { Dashboard, Reports, Formulas, Settings } from '@Pages';

// Import styles
import '@Admin/common/main.css';

function PageRoute() {
    // Extract just the path portion from the URL, or use an empty string
    const getBasename = () => {
        if (!window.pktAdminData?.adminUrl) return '';
        
        try {
            // Create a URL object to parse the URL
            const url = new URL(window.pktAdminData.adminUrl);
            
            // Get just the pathname portion (without query parameters)
            return url.pathname;
        } catch (e) {
            console.error('Error parsing adminUrl:', e);
            return '';
        }
    };

    const basename = getBasename();

    return(
        <Router basename={basename}>
            <div className="pkt-admin-wrapper">
                <NavigationHeader />
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/formulas" element={<Formulas />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </div>
        </Router>
    )
}

export default PageRoute;
