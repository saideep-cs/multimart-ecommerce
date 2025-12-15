/**
 * Personalization Utility for Contentstack Variants
 * 
 * This utility determines which variant to fetch based on user context,
 * preferences, behavior, and other personalization criteria.
 */

/**
 * Get user context from various sources
 * @returns {Object} User context object
 */
export const getUserContext = () => {
  // Get stored user preferences from localStorage
  const storedPreferences = localStorage.getItem('userPreferences');
  const preferences = storedPreferences ? JSON.parse(storedPreferences) : {};

  // Get user location (if available)
  const userLocation = getUserLocation();

  // Get device type
  const deviceType = getDeviceType();

  // Get user segment/audience (could be from analytics, user profile, etc.)
  const userSegment = getUserSegment();

  return {
    preferences,
    location: userLocation,
    deviceType,
    segment: userSegment,
    // Add more context as needed:
    // - userRole: 'premium' | 'regular' | 'guest'
    // - purchaseHistory: [...]
    // - browsingBehavior: {...}
    // - timeOfDay: new Date().getHours()
    // - dayOfWeek: new Date().getDay()
  };
};

/**
 * Get user location (country/region)
 * @returns {Object} Location object
 */
const getUserLocation = () => {
  // Option 1: Get from browser timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Option 2: Get from geolocation API (requires user permission)
  // You can use a service like ipapi.co, ip-api.com, or similar
  
  // Option 3: Get from localStorage if previously stored
  const storedLocation = localStorage.getItem('userLocation');
  if (storedLocation) {
    return JSON.parse(storedLocation);
  }

  // Default fallback
  return {
    country: 'US', // Default country
    region: 'North America',
    timezone: timezone,
  };
};

/**
 * Get device type
 * @returns {string} Device type
 */
const getDeviceType = () => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * Get user segment/audience
 * @returns {string} User segment
 */
const getUserSegment = () => {
  // Option 1: From localStorage (set after login/analytics)
  const storedSegment = localStorage.getItem('userSegment');
  if (storedSegment) return storedSegment;

  // Option 2: Determine from behavior/preferences
  const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
  
  // Example: Premium users, first-time visitors, returning customers, etc.
  if (preferences.isPremium) return 'premium';
  if (preferences.isFirstVisit) return 'new_visitor';
  if (preferences.visitCount > 5) return 'returning_customer';
  
  return 'default';
};

/**
 * Variant mapping configuration
 * Maps user context to variant UIDs/aliases
 * 
 * You can configure this based on your Contentstack Personalize setup
 */
const VARIANT_MAPPING = {
  // Location-based variants
  location: {
    'US': 'cse78b5c8bd3795d02', // US variant (your existing variant)
    'UK': 'variant_uk_uid',      // UK variant - replace with actual UID
    'IN': 'variant_india_uid',   // India variant - replace with actual UID
    // Add more countries as needed
  },
  
  // Device-based variants
  device: {
    'mobile': 'variant_mobile_uid',
    'tablet': 'variant_tablet_uid',
    'desktop': 'variant_desktop_uid',
  },
  
  // Segment-based variants
  segment: {
    'premium': 'variant_premium_uid',
    'new_visitor': 'variant_new_visitor_uid',
    'returning_customer': 'variant_returning_uid',
    'default': null, // Use base entry
  },
  
  // Preference-based variants
  preferences: {
    'theme_dark': 'variant_dark_uid',
    'language_es': 'variant_spanish_uid',
    'language_fr': 'variant_french_uid',
  },
};

/**
 * Determine which variant to use based on user context
 * 
 * Priority order:
 * 1. User preferences (highest priority)
 * 2. User segment
 * 3. Location
 * 4. Device type
 * 5. Default (base entry)
 * 
 * @param {Object} userContext - User context object
 * @param {string} contentTypeUid - Content type UID (optional, for content-specific logic)
 * @param {string} entryUid - Entry UID (optional, for entry-specific logic)
 * @returns {string|null} Variant UID/alias or null for base entry
 */
export const determineVariant = (userContext = null, contentTypeUid = null, entryUid = null) => {
  // Get user context if not provided
  if (!userContext) {
    userContext = getUserContext();
  }

  // Priority 1: Check user preferences
  if (userContext.preferences) {
    // Check for theme preference
    if (userContext.preferences.theme === 'dark' && VARIANT_MAPPING.preferences.theme_dark) {
      return VARIANT_MAPPING.preferences.theme_dark;
    }
    
    // Check for language preference
    if (userContext.preferences.language) {
      const langVariant = VARIANT_MAPPING.preferences[`language_${userContext.preferences.language}`];
      if (langVariant) return langVariant;
    }
    
    // Check for explicit variant preference
    if (userContext.preferences.variant) {
      return userContext.preferences.variant;
    }
  }

  // Priority 2: Check user segment
  if (userContext.segment && VARIANT_MAPPING.segment[userContext.segment]) {
    return VARIANT_MAPPING.segment[userContext.segment];
  }

  // Priority 3: Check location
  if (userContext.location && userContext.location.country) {
    const countryVariant = VARIANT_MAPPING.location[userContext.location.country];
    if (countryVariant) return countryVariant;
  }

  // Priority 4: Check device type
  if (userContext.deviceType && VARIANT_MAPPING.device[userContext.deviceType]) {
    return VARIANT_MAPPING.device[userContext.deviceType];
  }

  // Default: Return null to fetch base entry
  return null;
};

/**
 * A/B Testing: Randomly assign variant for testing
 * 
 * @param {Array<string>} variantUids - Array of variant UIDs to test
 * @param {Object} weights - Optional weights for each variant [0-1]
 * @returns {string|null} Selected variant UID
 */
export const selectABTestVariant = (variantUids = [], weights = {}) => {
  if (!variantUids || variantUids.length === 0) return null;

  // Get or create A/B test assignment from localStorage
  const testKey = `ab_test_${variantUids.join('_')}`;
  const storedAssignment = localStorage.getItem(testKey);
  
  if (storedAssignment) {
    // Return previously assigned variant (consistent experience)
    return storedAssignment;
  }

  // Assign variant based on weights or equal distribution
  let selectedVariant;
  if (Object.keys(weights).length > 0) {
    // Weighted random selection
    const random = Math.random();
    let cumulative = 0;
    for (const variant of variantUids) {
      cumulative += weights[variant] || (1 / variantUids.length);
      if (random <= cumulative) {
        selectedVariant = variant;
        break;
      }
    }
  } else {
    // Equal distribution
    const randomIndex = Math.floor(Math.random() * variantUids.length);
    selectedVariant = variantUids[randomIndex];
  }

  // Store assignment for consistency
  localStorage.setItem(testKey, selectedVariant);
  
  return selectedVariant;
};

/**
 * Set user preference for variant
 * @param {string} variantUid - Variant UID to prefer
 */
export const setVariantPreference = (variantUid) => {
  const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
  preferences.variant = variantUid;
  localStorage.setItem('userPreferences', JSON.stringify(preferences));
};

/**
 * Clear variant preference (use automatic selection)
 */
export const clearVariantPreference = () => {
  const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
  delete preferences.variant;
  localStorage.setItem('userPreferences', JSON.stringify(preferences));
};

/**
 * Integration with Contentstack Personalize Edge API
 * (If you're using Contentstack Personalize)
 * 
 * @param {string} experienceId - Experience ID from Contentstack Personalize
 * @param {Object} userContext - User context
 * @returns {Promise<string|null>} Active variant UID
 */
export const getPersonalizeVariant = async (experienceId, userContext = null) => {
  if (!userContext) {
    userContext = getUserContext();
  }

  try {
    // Example: Call Contentstack Personalize Edge API
    // Replace with your actual Personalize API endpoint
    const response = await fetch(
      `https://api.contentstack.io/v3/personalize/experiences/${experienceId}/variants`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your API key/token here
        },
        body: JSON.stringify({
          user_id: userContext.userId || 'anonymous',
          context: userContext,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.variant_uid || null;
    }
  } catch (error) {
    console.error('Error fetching Personalize variant:', error);
  }

  return null;
};

