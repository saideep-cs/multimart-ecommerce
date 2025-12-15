import { managementApiRequest } from '../contentstackClient';

/**
 * Transform a referenced entry to product format
 */
const transformProductEntry = (entry) => {
  if (!entry) return null;
  return {
    id: entry.uid || entry.id,
    productName: entry.product_name || entry.title || entry.name,
    imgUrl: entry.product_image?.url || entry.image?.url || entry.imgUrl,
    category: entry.category || entry.product_category,
    price: entry.price || 0,
    discount: entry.discount || 0,
    shortDesc: entry.short_description || entry.description || entry.shortDesc,
    description: entry.full_description || entry.description,
    reviews: entry.reviews || [],
    avgRating: entry.average_rating || entry.avgRating || 0,
  };
};

/**
 * Transform a referenced entry to banner format
 */
const transformBannerEntry = (entry) => {
  if (!entry) return null;
  return {
    id: entry.uid || entry.id,
    title: entry.title || entry.banner_title,
    desc: entry.description || entry.banner_description || entry.desc,
    cover: entry.banner_image?.url || entry.image?.url || entry.cover,
  };
};

/**
 * Transform a referenced entry to service format
 */
const transformServiceEntry = (entry) => {
  if (!entry) return null;
  return {
    id: entry.uid || entry.id,
    icon: entry.icon_name || entry.icon,
    title: entry.title || entry.service_title,
    subtitle: entry.subtitle || entry.description,
    bg: entry.background_color || entry.bg || '#fdefe6',
  };
};

/**
 * Fetch all products from Contentstack Management API
 * @returns {Promise<Array>} Array of product entries
 */
export const fetchProducts = async () => {
  try {
    const response = await managementApiRequest(
      '/content_types/product/entries'
    );
    
    // Management API returns: { entries: [...], count: number }
    const entries = response.entries || [];
    
    // Transform Contentstack entries to match your current product structure
    return entries.map((entry) => transformProductEntry(entry));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetch a single product by ID/UID
 * @param {string} productId - Product UID or ID
 * @returns {Promise<Object>} Product entry
 */
export const fetchProductById = async (productId) => {
  try {
    const response = await managementApiRequest(
      `/content_types/product/entries/${productId}`
    );
    
    // Management API returns: { entry: {...} }
    const entry = response.entry || response;
    
    if (!entry) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    
    return transformProductEntry(entry);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};

/**
 * Fetch products by category using search API
 * @param {string} category - Product category
 * @returns {Promise<Array>} Array of product entries
 */
export const fetchProductsByCategory = async (category) => {
  try {
    // Try searching with category field first
    let queryObject = { category: category };
    let result = await searchEntries('product', queryObject);
    let entries = result.entries || [];
    
    // If no results, try product_category field
    if (entries.length === 0) {
      queryObject = { product_category: category };
      result = await searchEntries('product', queryObject);
      entries = result.entries || [];
    }
    
    // If still no results, try case-insensitive search with $regex
    if (entries.length === 0) {
      queryObject = {
        $or: [
          { category: { $regex: category, $options: 'i' } },
          { product_category: { $regex: category, $options: 'i' } },
        ],
      };
      result = await searchEntries('product', queryObject);
      entries = result.entries || [];
    }
    
    // If still no results, fallback to fetch all and filter client-side
    if (entries.length === 0) {
      console.warn('No products found with search API, falling back to fetch all and filter');
      const allProducts = await fetchProducts();
      entries = allProducts.filter(
        p => p.category === category || 
             p.category === category.toLowerCase() ||
             p.category?.toLowerCase() === category.toLowerCase()
      );
      return entries;
    }
    
    return entries.map((entry) => transformProductEntry(entry));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    // Final fallback: fetch all and filter
    try {
      const allProducts = await fetchProducts();
      return allProducts.filter(
        p => p.category === category || 
             p.category === category.toLowerCase() ||
             p.category?.toLowerCase() === category.toLowerCase()
      );
    } catch (fallbackError) {
      throw error;
    }
  }
};

/**
 * Fetch banner/slider data from Contentstack Management API
 * @returns {Promise<Array>} Array of banner entries
 */
export const fetchBanners = async () => {
  try {
    const response = await managementApiRequest('/content_types/banner/entries');
    
    const entries = response.entries || [];
    
    return entries.map((entry) => transformBannerEntry(entry));
  } catch (error) {
    console.error('Error fetching banners:', error);
    throw error;
  }
};

/**
 * Fetch service data (Free Shipping, Safe Payment, etc.)
 * @returns {Promise<Array>} Array of service entries
 */
export const fetchServices = async () => {
  try {
    const response = await managementApiRequest('/content_types/service/entries');
    
    const entries = response.entries || [];
    
    return entries.map((entry) => transformServiceEntry(entry));
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

/**
 * Fetch footer content from Contentstack Management API
 * @returns {Promise<Object>} Footer content object
 */
export const fetchFooterContent = async () => {
  try {
    const response = await managementApiRequest('/content_types/footer/entries');
    
    const entries = response.entries || [];
    const entry = entries[0] || null;
    
    if (!entry) {
      return null;
    }
    
    // Handle array fields - they might be JSON strings or arrays
    let aboutUs = [];
    if (entry.about_us) {
      aboutUs = Array.isArray(entry.about_us) ? entry.about_us : 
                (typeof entry.about_us === 'string' ? JSON.parse(entry.about_us) : []);
    } else if (entry.aboutUs) {
      aboutUs = Array.isArray(entry.aboutUs) ? entry.aboutUs : 
                (typeof entry.aboutUs === 'string' ? JSON.parse(entry.aboutUs) : []);
    }
    
    let customerCare = [];
    if (entry.customer_care) {
      customerCare = Array.isArray(entry.customer_care) ? entry.customer_care : 
                     (typeof entry.customer_care === 'string' ? JSON.parse(entry.customer_care) : []);
    } else if (entry.customerCare) {
      customerCare = Array.isArray(entry.customerCare) ? entry.customerCare : 
                     (typeof entry.customerCare === 'string' ? JSON.parse(entry.customerCare) : []);
    }
    
    return {
      logo: entry.logo || 'Multimart',
      description: entry.description || entry.footer_description,
      aboutUs: aboutUs,
      customerCare: customerCare,
      contactInfo: {
        address: entry.address || entry.contact_address,
        email: entry.email || entry.contact_email,
        phone: entry.phone || entry.contact_phone,
      },
    };
  } catch (error) {
    console.error('Error fetching footer content:', error);
    throw error;
  }
};

/**
 * Search and fetch multiple entries using Contentstack search/query API
 * This function uses the Contentstack Management API's query parameter to search for entries
 * @param {string} contentTypeUid - Content type UID (e.g., 'product', 'banner', 'service')
 * @param {Object} queryObject - Query object with search criteria (e.g., { uid: { $in: ['uid1', 'uid2'] } })
 * @param {Object} options - Additional options
 * @param {number} options.skip - Number of entries to skip (for pagination)
 * @param {number} options.limit - Maximum number of entries to return (default: 100, max: 1000)
 * @param {string} options.sort - Sort field (e.g., 'created_at' or '-created_at' for descending)
 * @param {boolean} options.includeCount - Whether to include total count in response
 * @returns {Promise<Object>} Response object with entries array and optional count
 */
export const searchEntries = async (contentTypeUid, queryObject = {}, options = {}) => {
  try {
    const {
      skip = 0,
      limit = 100,
      sort = null,
      includeCount = false,
    } = options;

    // Build the base endpoint without query parameters
    const baseEndpoint = `/content_types/${contentTypeUid}/entries`;
    
    // Build query parameters using URLSearchParams for proper encoding
    const queryParams = new URLSearchParams();
    
    // Add query object if provided - this is the main search criteria
    // Contentstack expects the query as a JSON string in the query parameter
    if (queryObject && Object.keys(queryObject).length > 0) {
      const queryString = JSON.stringify(queryObject);
      queryParams.append('query', queryString);
    }
    
    // Add pagination parameters
    if (skip > 0) {
      queryParams.append('skip', skip.toString());
    }
    // Limit should be between 1 and 1000 for Contentstack API
    const validLimit = Math.max(1, Math.min(limit, 1000));
    if (validLimit > 0) {
      queryParams.append('limit', validLimit.toString());
    }
    
    // Add sort parameter (use '-' prefix for descending order)
    if (sort) {
      queryParams.append('sort', sort);
    }
    
    // Add include_count parameter to get total count of matching entries
    if (includeCount) {
      queryParams.append('include_count', 'true');
    }

    // Build the endpoint with query string
    // URLSearchParams.toString() automatically handles encoding
    const queryString = queryParams.toString();
    const endpoint = queryString ? `${baseEndpoint}?${queryString}` : baseEndpoint;
    
    console.log(`🔍 Searching ${contentTypeUid} entries using query parameters`);
    console.log(`📋 Query Object:`, JSON.stringify(queryObject, null, 2));
    console.log(`📋 Options:`, { skip, limit: validLimit, sort, includeCount });
    console.log(`📋 Full Endpoint:`, endpoint);
    
    const response = await managementApiRequest(endpoint);
    
    // Return entries and count if available
    const result = {
      entries: response.entries || [],
      count: response.count || (response.entries ? response.entries.length : 0),
      total: response.count || (response.entries ? response.entries.length : 0),
    };
    
    console.log(`✅ Query returned ${result.entries.length} entries (total matching: ${result.total})`);
    
    return result;
  } catch (error) {
    console.error(`❌ Error searching ${contentTypeUid} entries:`, error);
    console.error(`❌ Error details:`, error.message);
    throw error;
  }
};

/**
 * Fetch multiple entries from different content types in parallel using search API
 * @param {Object} requests - Object mapping content type UIDs to arrays of entry UIDs
 *   Example: { product: ['uid1', 'uid2'], banner: ['uid3'] }
 * @returns {Promise<Object>} Object mapping content type UIDs to arrays of entries
 *   Example: { product: [...], banner: [...] }
 */
export const fetchMultipleEntriesByContentType = async (requests) => {
  if (!requests || Object.keys(requests).length === 0) {
    return {};
  }
  
  try {
    // Create promises for all content types
    const promises = Object.entries(requests).map(async ([contentTypeUid, uids]) => {
      if (!uids || uids.length === 0) {
        return [contentTypeUid, []];
      }
      const entries = await fetchEntriesByUids(contentTypeUid, uids);
      return [contentTypeUid, entries];
    });
    
    // Execute all requests in parallel
    const results = await Promise.all(promises);
    
    // Convert array of [contentType, entries] pairs back to object
    const resultObject = {};
    results.forEach(([contentTypeUid, entries]) => {
      resultObject[contentTypeUid] = entries;
    });
    
    console.log(`✅ Fetched entries from ${Object.keys(resultObject).length} content types using search API`);
    
    return resultObject;
  } catch (error) {
    console.error('❌ Error fetching multiple entries by content type:', error);
    throw error;
  }
};

/**
 * Fetch multiple entries by UIDs using Contentstack search API
 * This function uses the search API with $in query to efficiently fetch multiple entries
 * @param {string} contentTypeUid - Content type UID (e.g., 'product', 'banner', 'service')
 * @param {Array<string>} uids - Array of entry UIDs to fetch
 * @returns {Promise<Array>} Array of entries matching the provided UIDs
 */
export const fetchEntriesByUids = async (contentTypeUid, uids) => {
  if (!uids || uids.length === 0) return [];
  
  // Remove duplicates and filter out invalid UIDs
  const uniqueUids = [...new Set(uids)].filter(uid => uid && typeof uid === 'string' && uid.trim().length > 0);
  
  if (uniqueUids.length === 0) return [];
  
  try {
    // Use search API with $in query to fetch multiple entries efficiently
    const queryObject = {
      uid: { $in: uniqueUids },
    };
    
    console.log(`🔍 Fetching ${uniqueUids.length} ${contentTypeUid} entries using search API:`, uniqueUids);
    
    const result = await searchEntries(contentTypeUid, queryObject, {
      limit: uniqueUids.length,
      includeCount: true,
    });
    
    const entries = result.entries || [];
    console.log(`✅ Successfully fetched ${entries.length} of ${uniqueUids.length} ${contentTypeUid} entries using search API`);
    
    // If we didn't get all entries, log a warning
    if (entries.length < uniqueUids.length) {
      const fetchedUids = new Set(entries.map(e => e.uid));
      const missingUids = uniqueUids.filter(uid => !fetchedUids.has(uid));
      console.warn(`⚠️ Missing ${missingUids.length} entries:`, missingUids);
    }
    
    return entries;
  } catch (error) {
    console.error(`❌ Error fetching ${contentTypeUid} entries using search API:`, error);
    // Fallback: fetch all entries and filter by UIDs (less efficient but more reliable)
    try {
      console.warn(`⚠️ Falling back to fetch all and filter for ${contentTypeUid}`);
      const response = await managementApiRequest(
        `/content_types/${contentTypeUid}/entries`
      );
      const allEntries = response.entries || [];
      const uidSet = new Set(uniqueUids);
      const filteredEntries = allEntries.filter(entry => uidSet.has(entry.uid));
      console.log(`✅ Fallback: Found ${filteredEntries.length} of ${uniqueUids.length} entries`);
      return filteredEntries;
    } catch (fallbackError) {
      console.error(`❌ Fallback also failed for ${contentTypeUid}:`, fallbackError);
      return [];
    }
  }
};

/**
 * Fetch referenced entries by UIDs using search API
 * @param {string} contentTypeUid - Content type UID
 * @param {Array<string>} uids - Array of entry UIDs
 * @returns {Promise<Array>} Array of entries
 */
const fetchReferencedEntries = async (contentTypeUid, uids) => {
  // Use the new fetchEntriesByUids function which properly uses search API
  return await fetchEntriesByUids(contentTypeUid, uids);
};

/**
 * Fetch Home page entry with all referenced content
 * 
 * @returns {Promise<Object>} Home page data with all sections
 */
export const fetchHomePage = async () => {
  try {
    // Fetch home entry by UID
    const homeEntryUid = 'bltbfc67d1a1215b35c';
    console.log(`📄 Fetching home entry ${homeEntryUid}`);
    const response = await managementApiRequest(
      `/content_types/home/entries/${homeEntryUid}`
    );
    
    const entry = response.entry || response;
    
    if (!entry) {
      throw new Error('Home page entry not found');
    }
    
    // Parse page_sections modular blocks
    // Structure: [{slider: {banner: [...]}}, {service: {services: [...]}}, ...]
    const pageSections = entry.page_sections || [];
    
    const homeData = {
      title: entry.title,
      sections: {
        slider: [],
        services: [],
        discountProducts: [],
        newArrivals: [],
        bestSales: [],
        footer: null,
      },
    };
    
    // Collect all referenced UIDs to fetch in parallel
    const bannerUids = [];
    const serviceUids = [];
    const productUids = [];
    
    // Process each section block
    pageSections.forEach((blockItem) => {
      const blockType = Object.keys(blockItem)[0];
      const block = blockItem[blockType];
      
      if (!block) return;
      
      switch (blockType) {
        case 'slider':
          if (block.banner && Array.isArray(block.banner)) {
            block.banner.forEach(ref => {
              if (ref.uid) bannerUids.push(ref.uid);
            });
          }
          break;
          
        case 'service':
          if (block.services && Array.isArray(block.services)) {
            block.services.forEach(ref => {
              if (ref.uid) serviceUids.push(ref.uid);
            });
          }
          break;
          
        case 'discount':
          if (block.products && Array.isArray(block.products)) {
            block.products.forEach(ref => {
              if (ref.uid) productUids.push(ref.uid);
            });
          }
          break;
          
        case 'new_arrivals':
          if (block.product && Array.isArray(block.product)) {
            block.product.forEach(ref => {
              if (ref.uid) productUids.push(ref.uid);
            });
          }
          break;
          
        case 'best_sales':
          if (block.product && Array.isArray(block.product)) {
            block.product.forEach(ref => {
              if (ref.uid) productUids.push(ref.uid);
            });
          }
          break;
          
        default:
          // Unknown block type - skip
          break;
      }
    });
    
    // Fetch all referenced entries in parallel
    const [banners, services, products] = await Promise.all([
      fetchReferencedEntries('banner', bannerUids),
      fetchReferencedEntries('service', serviceUids),
      fetchReferencedEntries('product', productUids),
    ]);
    
    // Create maps for quick lookup
    const bannerMap = new Map(banners.map(b => [b.uid, b]));
    const serviceMap = new Map(services.map(s => [s.uid, s]));
    const productMap = new Map(products.map(p => [p.uid, p]));
    
    // Process sections again with fetched data
    pageSections.forEach((blockItem) => {
      const blockType = Object.keys(blockItem)[0];
      const block = blockItem[blockType];
      
      if (!block) return;
      
      switch (blockType) {
        case 'slider':
          if (block.banner && Array.isArray(block.banner)) {
            const banners = block.banner
              .map(ref => {
                const fullEntry = bannerMap.get(ref.uid);
                return fullEntry ? transformBannerEntry(fullEntry) : null;
              })
              .filter(Boolean);
            
            if (banners.length > 0) {
              homeData.sections.slider = banners;
            }
          }
          break;
          
        case 'service':
          if (block.services && Array.isArray(block.services)) {
            const services = block.services
              .map(ref => {
                const fullEntry = serviceMap.get(ref.uid);
                return fullEntry ? transformServiceEntry(fullEntry) : null;
              })
              .filter(Boolean);
            
            if (services.length > 0) {
              homeData.sections.services = services;
            }
          }
          break;
          
        case 'discount':
          if (block.products && Array.isArray(block.products)) {
            const products = block.products
              .map(ref => {
                const fullEntry = productMap.get(ref.uid);
                return fullEntry ? transformProductEntry(fullEntry) : null;
              })
              .filter(Boolean);
            
            if (products.length > 0) {
              homeData.sections.discountProducts = products;
            }
          }
          break;
          
        case 'new_arrivals':
          if (block.product && Array.isArray(block.product)) {
            const products = block.product
              .map(ref => {
                const fullEntry = productMap.get(ref.uid);
                return fullEntry ? transformProductEntry(fullEntry) : null;
              })
              .filter(Boolean);
            
            if (products.length > 0) {
              homeData.sections.newArrivals = products;
            }
          }
          break;
          
        case 'best_sales':
          if (block.product && Array.isArray(block.product)) {
            const products = block.product
              .map(ref => {
                const fullEntry = productMap.get(ref.uid);
                return fullEntry ? transformProductEntry(fullEntry) : null;
              })
              .filter(Boolean);
            
            if (products.length > 0) {
              homeData.sections.bestSales = products;
            }
          }
          break;
          
        default:
          console.warn('Unknown block type in home page:', blockType, blockItem);
          break;
      }
    });
    
    return homeData;
  } catch (error) {
    console.error('Error fetching home page:', error);
    throw error;
  }
};

/**
 * Search products by name/description using search API
 * @param {string} searchTerm - Search keyword
 * @returns {Promise<Array>} Array of matching products
 */
export const searchProducts = async (searchTerm) => {
  try {
    // Build query object with regex search across multiple fields
    const queryObject = {
      $or: [
        { product_name: { $regex: searchTerm, $options: 'i' } },
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { short_description: { $regex: searchTerm, $options: 'i' } },
        { full_description: { $regex: searchTerm, $options: 'i' } },
      ],
    };
    
    const result = await searchEntries('product', queryObject);
    const entries = result.entries || [];
    
    // If no results from search API, fallback to client-side filtering
    if (entries.length === 0) {
      console.warn('No products found with search API, falling back to fetch all and filter');
      const allProducts = await fetchProducts();
      const searchLower = searchTerm.toLowerCase();
      return allProducts.filter(product => {
        const name = (product.productName || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();
        const shortDesc = (product.shortDesc || '').toLowerCase();
        return name.includes(searchLower) || desc.includes(searchLower) || shortDesc.includes(searchLower);
      });
    }
    
    return entries.map((entry) => transformProductEntry(entry));
  } catch (error) {
    console.error('Error searching products:', error);
    // Final fallback: fetch all and filter
    try {
      const allProducts = await fetchProducts();
      const searchLower = searchTerm.toLowerCase();
      return allProducts.filter(product => {
        const name = (product.productName || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();
        const shortDesc = (product.shortDesc || '').toLowerCase();
        return name.includes(searchLower) || desc.includes(searchLower) || shortDesc.includes(searchLower);
      });
    } catch (fallbackError) {
      throw error;
    }
  }
};
