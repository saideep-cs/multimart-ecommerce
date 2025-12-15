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
    const response = await managementApiRequest('/content_types/product/entries');
    
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
    const response = await managementApiRequest(`/content_types/product/entries/${productId}`);
    
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
 * Fetch products by category
 * @param {string} category - Product category
 * @returns {Promise<Array>} Array of product entries
 */
export const fetchProductsByCategory = async (category) => {
  try {
    // Fetch all products and filter by category (Management API query format may vary)
    // Try fetching with query parameter first
    let entries = [];
    
    try {
      // Try query format: ?query={"category":"value"}
      const query = JSON.stringify({ category: category });
      const response = await managementApiRequest(
        `/content_types/product/entries?query=${encodeURIComponent(query)}`
      );
      entries = response.entries || [];
    } catch (queryError) {
      // If query fails, fetch all and filter client-side
      console.warn('Query parameter not supported, fetching all and filtering:', queryError);
    }
    
    // If no results, try product_category field or fetch all and filter
    if (entries.length === 0) {
      try {
        const query2 = JSON.stringify({ product_category: category });
        const response2 = await managementApiRequest(
          `/content_types/product/entries?query=${encodeURIComponent(query2)}`
        );
        entries = response2.entries || [];
      } catch (queryError2) {
        // Fallback: fetch all and filter client-side
        const allProducts = await fetchProducts();
        entries = allProducts.filter(
          p => p.category === category || p.category === category.toLowerCase()
        );
        return entries;
      }
    }
    
    return entries.map((entry) => transformProductEntry(entry));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    // Fallback: fetch all and filter
    try {
      const allProducts = await fetchProducts();
      return allProducts.filter(
        p => p.category === category || p.category === category.toLowerCase()
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
 * Fetch referenced entries by UIDs
 * @param {string} contentTypeUid - Content type UID
 * @param {Array<string>} uids - Array of entry UIDs
 * @returns {Promise<Array>} Array of entries
 */
const fetchReferencedEntries = async (contentTypeUid, uids) => {
  if (!uids || uids.length === 0) return [];
  
  try {
    // Fetch entries by UIDs - try query format first
    let entries = [];
    
    try {
      // Try query format: ?query={"uid":{"$in":["uid1","uid2"]}}
      const query = JSON.stringify({
        uid: { $in: uids },
      });
      
      const response = await managementApiRequest(
        `/content_types/${contentTypeUid}/entries?query=${encodeURIComponent(query)}`
      );
      entries = response.entries || [];
    } catch (queryError) {
      // If query format doesn't work, fetch all entries and filter by UIDs
      console.warn(`Query format not supported for ${contentTypeUid}, fetching all and filtering:`, queryError);
      const response = await managementApiRequest(`/content_types/${contentTypeUid}/entries`);
      const allEntries = response.entries || [];
      entries = allEntries.filter(entry => uids.includes(entry.uid));
    }
    
    return entries;
  } catch (error) {
    console.error(`Error fetching referenced ${contentTypeUid} entries:`, error);
    return [];
  }
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
    const response = await managementApiRequest(`/content_types/home/entries/${homeEntryUid}`);
    
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
 * Search products by name/description
 * @param {string} searchTerm - Search keyword
 * @returns {Promise<Array>} Array of matching products
 */
export const searchProducts = async (searchTerm) => {
  try {
    // Try Management API search using query parameter
    let entries = [];
    
    try {
      // Try query format with regex search
      const query = JSON.stringify({
        $or: [
          { product_name: { $regex: searchTerm, $options: 'i' } },
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { short_description: { $regex: searchTerm, $options: 'i' } },
        ],
      });
      
      const response = await managementApiRequest(
        `/content_types/product/entries?query=${encodeURIComponent(query)}`
      );
      entries = response.entries || [];
    } catch (queryError) {
      // Fallback: fetch all products and filter client-side
      console.warn('Query search not supported, fetching all and filtering:', queryError);
      const allProducts = await fetchProducts();
      const searchLower = searchTerm.toLowerCase();
      entries = allProducts.filter(product => {
        const name = (product.productName || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();
        const shortDesc = (product.shortDesc || '').toLowerCase();
        return name.includes(searchLower) || desc.includes(searchLower) || shortDesc.includes(searchLower);
      });
      return entries;
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
