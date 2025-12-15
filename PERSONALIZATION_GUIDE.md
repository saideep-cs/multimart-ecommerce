# Contentstack Personalization & Variants Guide

This guide explains how to use variants and personalization in your Contentstack-powered application.

## Overview

Contentstack doesn't automatically fetch variant entries - you must explicitly specify which variant to retrieve. This personalization system provides an **automatic variant selection** mechanism based on user context, making it easy to implement personalized content.

## How It Works

1. **User Context Collection**: The system automatically collects user context (location, device, preferences, segment)
2. **Variant Determination**: Based on the context, it determines which variant to fetch
3. **Automatic Fetching**: The `fetchHomePage()` function automatically uses the determined variant

## Quick Start

### Basic Usage (Automatic Personalization)

The `fetchHomePage()` function now automatically determines and fetches the appropriate variant:

```javascript
// Automatically determines variant based on user context
const homeData = await fetchHomePage();
```

### Manual Variant Selection

You can also explicitly specify a variant:

```javascript
// Fetch specific variant
const homeData = await fetchHomePage('cse78b5c8bd3795d02');
```

## Personalization Strategies

### 1. Location-Based Personalization

Different content for different countries/regions:

```javascript
// In utils/personalization.js - VARIANT_MAPPING
location: {
  'US': 'cse78b5c8bd3795d02',  // US variant
  'UK': 'variant_uk_uid',       // UK variant
  'IN': 'variant_india_uid',    // India variant
}
```

### 2. Device-Based Personalization

Different content for mobile, tablet, desktop:

```javascript
device: {
  'mobile': 'variant_mobile_uid',
  'tablet': 'variant_tablet_uid',
  'desktop': 'variant_desktop_uid',
}
```

### 3. User Segment Personalization

Different content for different user segments:

```javascript
segment: {
  'premium': 'variant_premium_uid',
  'new_visitor': 'variant_new_visitor_uid',
  'returning_customer': 'variant_returning_uid',
}
```

### 4. A/B Testing

Randomly assign variants for testing:

```javascript
import { selectABTestVariant } from '../utils/personalization';

// Equal distribution
const variant = selectABTestVariant(['variant_a_uid', 'variant_b_uid']);

// Weighted distribution (70% variant A, 30% variant B)
const variant = selectABTestVariant(
  ['variant_a_uid', 'variant_b_uid'],
  { 'variant_a_uid': 0.7, 'variant_b_uid': 0.3 }
);
```

## Using the React Hook

For more control in React components:

```javascript
import { usePersonalization } from '../hooks/usePersonalization';

function MyComponent() {
  const {
    userContext,
    getVariant,
    updatePreferences,
    setPreferredVariant,
  } = usePersonalization();

  // Get variant for specific content
  const variant = getVariant('home', 'blt9ec9296d3422565d');

  // Update user preferences
  const handleThemeChange = (theme) => {
    updatePreferences({ theme });
  };

  // Set preferred variant
  const handleVariantSelect = (variantUid) => {
    setPreferredVariant(variantUid);
  };

  return (
    <div>
      <p>User Location: {userContext?.location?.country}</p>
      <p>Device: {userContext?.deviceType}</p>
      <p>Segment: {userContext?.segment}</p>
      <p>Selected Variant: {variant || 'Base Entry'}</p>
    </div>
  );
}
```

## Configuration

### Setting Up Variant Mapping

Edit `src/utils/personalization.js` and update the `VARIANT_MAPPING` object with your variant UIDs:

```javascript
const VARIANT_MAPPING = {
  location: {
    'US': 'your_us_variant_uid',
    'UK': 'your_uk_variant_uid',
    // Add more countries
  },
  device: {
    'mobile': 'your_mobile_variant_uid',
    // Add more device types
  },
  segment: {
    'premium': 'your_premium_variant_uid',
    // Add more segments
  },
  preferences: {
    'theme_dark': 'your_dark_theme_variant_uid',
    // Add more preferences
  },
};
```

### Priority Order

Variants are determined in this priority order:

1. **User Preferences** (highest priority)
   - Explicit variant selection
   - Theme preferences
   - Language preferences

2. **User Segment**
   - Premium users
   - New visitors
   - Returning customers

3. **Location**
   - Country-based variants

4. **Device Type**
   - Mobile/Tablet/Desktop variants

5. **Default** (lowest priority)
   - Base entry (no variant)

## Advanced: Contentstack Personalize Integration

If you're using Contentstack Personalize, you can integrate with the Edge API:

```javascript
import { getPersonalizeVariant } from '../utils/personalization';

// Get variant from Contentstack Personalize
const variant = await getPersonalizeVariant('experience_id', userContext);
const homeData = await fetchHomePage(variant);
```

Update the `getPersonalizeVariant` function in `utils/personalization.js` with your Personalize API credentials.

## Examples

### Example 1: Location-Based Homepage

```javascript
// Automatically shows US variant for US users, UK variant for UK users
const homeData = await fetchHomePage();
```

### Example 2: User Preference Override

```javascript
import { setVariantPreference } from '../utils/personalization';

// User selects "Dark Theme"
setVariantPreference('variant_dark_uid');

// Next fetch will use dark theme variant
const homeData = await fetchHomePage();
```

### Example 3: A/B Testing Homepage

```javascript
import { selectABTestVariant } from '../utils/personalization';

// 50/50 split between two variants
const variant = selectABTestVariant([
  'variant_control_uid',
  'variant_test_uid'
]);

const homeData = await fetchHomePage(variant);
```

### Example 4: Premium User Experience

```javascript
// Set user as premium (could be from login/auth)
localStorage.setItem('userSegment', 'premium');

// Automatically fetches premium variant
const homeData = await fetchHomePage();
```

## User Context

The system automatically collects:

- **Location**: Country, region, timezone
- **Device**: Mobile, tablet, desktop
- **Segment**: User segment (premium, new_visitor, etc.)
- **Preferences**: Stored in localStorage

You can extend this by modifying `getUserContext()` in `utils/personalization.js`.

## Best Practices

1. **Fallback to Base Entry**: Always have a base entry (no variant) as fallback
2. **Consistent Experience**: A/B test assignments are stored in localStorage for consistency
3. **Performance**: Variant determination is fast (no API calls, uses localStorage)
4. **Privacy**: All data is stored locally, no external tracking by default
5. **Testing**: Use explicit variant UIDs during development/testing

## Troubleshooting

### Variant Not Being Applied

1. Check that the variant UID exists in Contentstack
2. Verify the variant is published in your environment
3. Check browser console for variant selection logs
4. Verify VARIANT_MAPPING configuration

### Base Entry Always Returned

- Check user context is being collected correctly
- Verify variant mapping matches your user context
- Check priority order - higher priority rules may override

### Inconsistent Variants

- A/B test assignments are stored in localStorage
- Clear localStorage to reset: `localStorage.clear()`
- Check for multiple variant determination calls

## Next Steps

1. **Configure Variants**: Update `VARIANT_MAPPING` with your variant UIDs
2. **Create Variants**: Create variants in Contentstack for different audiences
3. **Test**: Test different user contexts to verify variant selection
4. **Monitor**: Add analytics to track variant performance
5. **Optimize**: Adjust priority and mapping based on results

## API Reference

### `fetchHomePage(variantUid?, userContext?)`

Fetches home page with automatic variant selection.

- `variantUid` (optional): Explicit variant UID
- `userContext` (optional): User context object
- Returns: Promise with home page data

### `determineVariant(userContext, contentTypeUid?, entryUid?)`

Determines which variant to use based on context.

- `userContext`: User context object
- `contentTypeUid` (optional): Content type UID
- `entryUid` (optional): Entry UID
- Returns: Variant UID or null

### `getUserContext()`

Collects user context from various sources.

- Returns: User context object

### `selectABTestVariant(variantUids, weights?)`

Selects variant for A/B testing.

- `variantUids`: Array of variant UIDs
- `weights` (optional): Weight object
- Returns: Selected variant UID

