import { useState, useEffect, useCallback } from 'react';
import {
  getUserContext,
  determineVariant,
  setVariantPreference,
  clearVariantPreference,
  selectABTestVariant,
} from '../utils/personalization';

/**
 * React Hook for Contentstack Personalization
 * 
 * Provides easy access to personalization features:
 * - User context
 * - Variant determination
 * - Preference management
 * - A/B testing
 * 
 * @returns {Object} Personalization hook object
 */
export const usePersonalization = () => {
  const [userContext, setUserContext] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user context on mount
  useEffect(() => {
    const context = getUserContext();
    setUserContext(context);
    setIsLoading(false);
  }, []);

  /**
   * Get variant for a specific content type/entry
   * @param {string} contentTypeUid - Content type UID
   * @param {string} entryUid - Entry UID
   * @returns {string|null} Variant UID or null
   */
  const getVariant = useCallback((contentTypeUid, entryUid = null) => {
    if (!userContext) return null;
    return determineVariant(userContext, contentTypeUid, entryUid);
  }, [userContext]);

  /**
   * Update user preferences
   * @param {Object} preferences - Preferences object
   */
  const updatePreferences = useCallback((preferences) => {
    const currentPreferences = JSON.parse(
      localStorage.getItem('userPreferences') || '{}'
    );
    const updatedPreferences = { ...currentPreferences, ...preferences };
    localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
    
    // Update context
    const newContext = getUserContext();
    setUserContext(newContext);
  }, []);

  /**
   * Set preferred variant
   * @param {string} variantUid - Variant UID
   */
  const setPreferredVariant = useCallback((variantUid) => {
    setVariantPreference(variantUid);
    const newContext = getUserContext();
    setUserContext(newContext);
  }, []);

  /**
   * Clear variant preference
   */
  const clearPreferredVariant = useCallback(() => {
    clearVariantPreference();
    const newContext = getUserContext();
    setUserContext(newContext);
  }, []);

  /**
   * Select A/B test variant
   * @param {Array<string>} variantUids - Array of variant UIDs
   * @param {Object} weights - Optional weights
   * @returns {string|null} Selected variant
   */
  const selectABVariant = useCallback((variantUids, weights = {}) => {
    return selectABTestVariant(variantUids, weights);
  }, []);

  /**
   * Refresh user context
   */
  const refreshContext = useCallback(() => {
    const context = getUserContext();
    setUserContext(context);
  }, []);

  return {
    userContext,
    isLoading,
    getVariant,
    updatePreferences,
    setPreferredVariant,
    clearPreferredVariant,
    selectABVariant,
    refreshContext,
  };
};

