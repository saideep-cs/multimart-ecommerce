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
  
  // Parse existing query parameters from the endpoint URL
  const urlParts = url.split('?');
  const baseUrl = urlParts[0];
  const existingQuery = urlParts[1] || '';
  
  // Build query parameters - merge with existing ones
  // Use URLSearchParams to properly handle encoding
  const queryParams = new URLSearchParams(existingQuery);
  
  // Add branch parameter if configured
  if (config.branch) {
    // Only add if not already present
    if (!queryParams.has('branch')) {
      queryParams.append('branch', config.branch);
    }
  }
  
  // Build the final URL with query parameters
  const fullUrl = queryParams.toString() 
    ? `${baseUrl}?${queryParams.toString()}` 
    : baseUrl;
  
  // Log the request URL for debugging (without sensitive tokens)
  console.log(`🌐 API Request URL: ${baseUrl}${queryParams.toString() ? '?' + queryParams.toString().substring(0, 200) + '...' : ''}`);

  const headers = {
    'api_key': config.apiKey,
    'authorization': `${config.managementToken}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  console.log(`📤 Making API request to: ${baseUrl}`);
  console.log(`📤 Request method: ${options.method || 'GET'}`);
  console.log(`📤 Headers:`, Object.keys(headers).filter(k => k !== 'authorization' && k !== 'api_key'));

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  console.log(`📥 Response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    let errorData = {};
    try {
      const text = await response.text();
      console.error(`❌ Error response body:`, text);
      errorData = JSON.parse(text);
    } catch (e) {
      console.error(`❌ Could not parse error response:`, e);
    }
    
    const errorMessage = errorData.error_message || 
      errorData.error || 
      errorData.message ||
      `Contentstack API error: ${response.status} ${response.statusText}`;
    
    console.error(`❌ API Error:`, errorMessage);
    console.error(`❌ Full error data:`, errorData);
    
    throw new Error(errorMessage);
  }

  const responseData = await response.json();
  console.log(`✅ API request successful`);
  
  return responseData;
};

const contentstackClient = {
  managementApiRequest,
  getConfig,
};

export default contentstackClient;
export { getConfig };