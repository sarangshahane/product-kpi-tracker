/**
 * API utility functions for Product KPI Tracker
 */

const API_NAMESPACE = 'product-kpi-tracker/v1';

/**
 * Make a GET request to the WordPress REST API
 * 
 * @param {string} endpoint - The API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise} - The API response
 */
export const get = async (endpoint, params = {}) => {
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const url = `/wp-json/${API_NAMESPACE}/${endpoint}${queryString ? `?${queryString}` : ''}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.pktAdminData?.nonce || ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Make a POST request to the WordPress REST API
 * 
 * @param {string} endpoint - The API endpoint
 * @param {Object} data - The data to send
 * @returns {Promise} - The API response
 */
export const post = async (endpoint, data = {}) => {
  const url = `/wp-json/${API_NAMESPACE}/${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.pktAdminData?.nonce || ''
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Make a PUT request to the WordPress REST API
 * 
 * @param {string} endpoint - The API endpoint
 * @param {Object} data - The data to send
 * @returns {Promise} - The API response
 */
export const put = async (endpoint, data = {}) => {
  const url = `/wp-json/${API_NAMESPACE}/${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.pktAdminData?.nonce || ''
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Make a DELETE request to the WordPress REST API
 * 
 * @param {string} endpoint - The API endpoint
 * @returns {Promise} - The API response
 */
export const del = async (endpoint) => {
  const url = `/wp-json/${API_NAMESPACE}/${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.pktAdminData?.nonce || ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
