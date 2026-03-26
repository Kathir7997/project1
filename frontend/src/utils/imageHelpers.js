// Placeholder image URLs for products without images
const PLACEHOLDER_IMAGES = {
    Vegetables: 'https://placehold.co/400x400/10b981/ffffff?text=Vegetables',
    Fruits: 'https://placehold.co/400x400/f59e0b/ffffff?text=Fruits',
    Grains: 'https://placehold.co/400x400/92400e/ffffff?text=Grains',
    Dairy: 'https://placehold.co/400x400/3b82f6/ffffff?text=Dairy',
    Organic: 'https://placehold.co/400x400/059669/ffffff?text=Organic',
    Seeds: 'https://placehold.co/400x400/a855f7/ffffff?text=Seeds',
    Tools: 'https://placehold.co/400x400/6b7280/ffffff?text=Tools',
    Other: 'https://placehold.co/400x400/9ca3af/ffffff?text=Product'
};

/**
 * Get product image URL with fallback to placeholder
 * @param {Object} product - Product object
 * @returns {string} Image URL
 */
export const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
        return product.images[0];
    }
    return PLACEHOLDER_IMAGES[product.category] || PLACEHOLDER_IMAGES.Other;
};

/**
 * Get all product images with placeholders
 * @param {Object} product - Product object
 * @returns {Array} Array of image URLs
 */
export const getProductImages = (product) => {
    if (product.images && product.images.length > 0) {
        return product.images;
    }
    return [getProductImage(product)];
};

export default {
    getProductImage,
    getProductImages,
    PLACEHOLDER_IMAGES
};
