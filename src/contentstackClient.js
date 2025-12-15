/**
 * Contentstack Management API Configuration
 * Uses Management API endpoints with fetch instead of SDK
 */

const MANAGEMENT_API_BASE_URL = 'https://api.contentstack.io/v3';

// Get configuration from environment variables
const getConfig = () => ({
  apiKey: process.env.REACT_APP_CONTENTSTACK_API_KEY,
  managementToken: process.env.REACT_APP_CONTENTSTACK_MANAGEMENT_TOKEN || process.env.REACT_APP_CONTENTSTACK_DELIVERY_TOKEN,
  environment: process.env.REACT_APP_CONTENTSTACK_ENVIRONMENT,
  branch: process.env.REACT_APP_CONTENTSTACK_BRANCH,
});

/**
 * Make a request to Contentstack Management API
 * @param {string} endpoint - API endpoint (e.g., '/content_types/product/entries')
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Object>} Response data
 */
export const managementApiRequest = async (endpoint, options = {}) => {
  const config = getConfig();
  
  if (!config.apiKey || !config.managementToken) {
    throw new Error('Contentstack API Key and Management Token are required');
  }

  const url = `${MANAGEMENT_API_BASE_URL}${endpoint}`;
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (config.environment) {
    // queryParams.append('environment', config.environment);
  }
  if (config.branch) {
    queryParams.append('branch', config.branch);
  }
  
  const fullUrl = queryParams.toString() 
    ? `${url}?${queryParams.toString()}` 
    : url;

  const headers = {
    'api_key': config.apiKey,
    'authorization': `${config.managementToken}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error_message || 
      errorData.error || 
      `Contentstack API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
};

const contentstackClient = {
  managementApiRequest,
  getConfig,
};

export default contentstackClient;