import React, { useState } from 'react';

/**
 * TabPanel Component
 * 
 * Creates an accessible vertical tab panel with content area
 * 
 * @param {Object} props Component props
 * @param {Array} props.tabs Array of tab objects with id, title, and content
 * @param {string} props.className Additional CSS classes
 * @returns {JSX.Element} The TabPanel component
 */
const TabPanel = ({ tabs, className = '' }) => {
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

    // Handle tab click
    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e, tabId) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setActiveTab(tabId);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
            const nextIndex = (currentIndex + 1) % tabs.length;
            setActiveTab(tabs[nextIndex].id);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
            const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            setActiveTab(tabs[prevIndex].id);
        }
    };

    return (
        <div className={`pkt-flex pkt-flex-col md:pkt-flex-row pkt-gap-6 ${className}`}>
            {/* Tab list */}
            <div 
                className="pkt-flex pkt-flex-row md:pkt-flex-col pkt-gap-2 pkt-min-w-[200px] pkt-overflow-x-auto md:pkt-overflow-x-visible"
                role="tablist"
                aria-orientation="vertical"
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        id={`tab-${tab.id}`}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`tabpanel-${tab.id}`}
                        className={`pkt-px-4 pkt-py-3 pkt-text-left pkt-rounded-md pkt-transition-colors pkt-focus:pkt-outline-none pkt-focus:pkt-ring-2 pkt-focus:pkt-ring-blue-500 ${
                            activeTab === tab.id
                                ? 'pkt-bg-blue-600 pkt-text-white'
                                : 'pkt-bg-gray-100 pkt-text-gray-700 hover:pkt-bg-gray-200'
                        }`}
                        onClick={() => handleTabClick(tab.id)}
                        onKeyDown={(e) => handleKeyDown(e, tab.id)}
                        tabIndex={activeTab === tab.id ? 0 : -1}
                    >
                        {tab.title}
                    </button>
                ))}
            </div>

            {/* Tab panels */}
            <div className="pkt-flex-1">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        id={`tabpanel-${tab.id}`}
                        role="tabpanel"
                        aria-labelledby={`tab-${tab.id}`}
                        className={activeTab === tab.id ? 'pkt-block' : 'pkt-hidden'}
                    >
                        {tab.content}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TabPanel;
