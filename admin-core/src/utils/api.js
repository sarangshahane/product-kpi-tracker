/**
 * API utility functions for Product KPI Tracker
 */

/**
 * Fetch dashboard data from the REST API
 * 
 * @param {string} period Time period (daily, weekly, monthly)
 * @param {boolean} compare Whether to include comparison data
 * @param {Object} dateRange Optional date range object with startDate and endDate
 * @returns {Promise<Object>} Dashboard data
 */
export const fetchDashboardData = async (period = 'monthly', compare = false, dateRange = null) => {
    try {
        // For development/testing purposes, return mock data
        // This prevents the 404 error while the actual API endpoint is not accessible
        return getMockDashboardData(period, compare);
        
        /* Uncomment this when the API endpoint is properly set up
        let url = `${window.pktAdminData.restUrl}/dashboard?period=${period}&compare=${compare}`;
        
        // Add date range parameters if provided
        if (dateRange && dateRange.startDate && dateRange.endDate) {
            url += `&start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`;
        }
        
        const response = await fetch(
            url,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': window.pktAdminData.nonce,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
        */
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Return mock data as fallback in case of error
        return getMockDashboardData(period, compare);
    }
};

/**
 * Generate mock dashboard data for development/testing
 * 
 * @param {string} period Time period
 * @param {boolean} compare Whether to include comparison data
 * @returns {Object} Mock dashboard data
 */
const getMockDashboardData = (period, compare) => {
    // Generate mock trend data based on period
    const generateTrendData = (isPrevious = false) => {
        const labels = [];
        const today = new Date();
        
        // Generate labels based on period
        switch (period) {
            case 'daily':
                for (let i = 13; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(today.getDate() - i - (isPrevious ? 14 : 0));
                    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                }
                break;
            case 'weekly':
                for (let i = 11; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(today.getDate() - (i * 7) - (isPrevious ? 84 : 0));
                    labels.push(`Week ${12 - i}`);
                }
                break;
            case 'monthly':
            default:
                for (let i = 11; i >= 0; i--) {
                    const date = new Date();
                    date.setMonth(today.getMonth() - i - (isPrevious ? 12 : 0));
                    labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
                }
                break;
        }
        
        // Generate random values for each metric
        const generateValues = (base, min, max, count) => {
            const values = [];
            let value = base;
            
            for (let i = 0; i < count; i++) {
                const change = Math.random() * (max - min) + min;
                value = Math.max(0, value + change);
                values.push(Number(value.toFixed(2)));
            }
            
            return values;
        };
        
        // Adjustment factor for previous period
        const factor = isPrevious ? 0.9 : 1;
        
        return {
            netRevenue: {
                labels,
                values: generateValues(10000 * factor, -1500, 2000, labels.length)
            },
            aov: {
                labels,
                values: generateValues(85 * factor, -10, 15, labels.length)
            },
            churnRate: {
                labels,
                values: generateValues(3 * (isPrevious ? 1.1 : 1), -0.5, 1, labels.length)
            },
            refundRate: {
                labels,
                values: generateValues(1.8 * (isPrevious ? 1.1 : 1), -0.3, 0.7, labels.length)
            }
        };
    };
    
    // Create mock data object
    const data = {
        stats: {
            netRevenue: 125750.50,
            mrr: 15250.75,
            arps: 49.99,
            aov: 85.25,
            churnRate: 3.2,
            refundRate: 1.8,
            abandonmentRate: 68.5,
        },
        trends: generateTrendData()
    };
    
    // Add previous period data if comparison is enabled
    if (compare) {
        data.previous = {
            stats: {
                netRevenue: 118250.25,
                mrr: 14750.50,
                arps: 47.50,
                aov: 82.75,
                churnRate: 3.5,
                refundRate: 2.1,
                abandonmentRate: 71.2,
            },
            trends: generateTrendData(true)
        };
    }
    
    return data;
};

/**
 * Fetch reports data from the REST API
 * 
 * @param {string} reportType Type of report
 * @param {string} startDate Start date
 * @param {string} endDate End date
 * @returns {Promise<Object>} Report data
 */
export const fetchReportsData = async (reportType, startDate, endDate) => {
    try {
        // For development/testing purposes, return mock data
        return getMockReportsData(reportType, startDate, endDate);
        
        /* Uncomment this when the API endpoint is properly set up
        const response = await fetch(
            `${window.pktAdminData.restUrl}/reports?type=${reportType}&start_date=${startDate}&end_date=${endDate}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': window.pktAdminData.nonce,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
        */
    } catch (error) {
        console.error('Error fetching reports data:', error);
        // Return mock data as fallback
        return getMockReportsData(reportType, startDate, endDate);
    }
};

/**
 * Generate mock reports data for development/testing
 * 
 * @param {string} reportType Type of report
 * @param {string} startDate Start date
 * @param {string} endDate End date
 * @returns {Object} Mock reports data
 */
const getMockReportsData = (reportType, startDate, endDate) => {
    switch (reportType) {
        case 'sales':
            return [
                {
                    date: '2025-05-01',
                    revenue: 1250,
                    orders: 15,
                    avgOrderValue: 83.33,
                },
                {
                    date: '2025-05-02',
                    revenue: 980,
                    orders: 12,
                    avgOrderValue: 81.67,
                },
                {
                    date: '2025-05-03',
                    revenue: 1450,
                    orders: 18,
                    avgOrderValue: 80.56,
                },
                {
                    date: '2025-05-04',
                    revenue: 1100,
                    orders: 13,
                    avgOrderValue: 84.62,
                },
            ];
        
        case 'products':
            return [
                {
                    product: 'Product A',
                    units: 45,
                    revenue: 2250,
                    profit: 675,
                },
                {
                    product: 'Product B',
                    units: 32,
                    revenue: 1600,
                    profit: 480,
                },
                {
                    product: 'Product C',
                    units: 28,
                    revenue: 1400,
                    profit: 420,
                },
                {
                    product: 'Product D',
                    units: 22,
                    revenue: 1100,
                    profit: 330,
                },
            ];
            
        default:
            return [];
    }
};
