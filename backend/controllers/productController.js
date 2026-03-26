import Product from '../models/Product.js';
import { successResponse, errorResponse, validateFields } from '../utils/helpers.js';

// @desc    Get all products with search and filter
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const { search, category, farmerId, sort = '-createdAt' } = req.query;

        let query = {};

        // Search by name or description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by farmer
        if (farmerId) {
            query.farmerId = farmerId;
        }

        const products = await Product.find(query).sort(sort);

        successResponse(res, 200, products, 'Products fetched successfully');
    } catch (error) {
        errorResponse(res, 500, 'Failed to fetch products', error.message);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return errorResponse(res, 404, 'Product not found');
        }

        successResponse(res, 200, product, 'Product fetched successfully');
    } catch (error) {
        errorResponse(res, 500, 'Failed to fetch product', error.message);
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Farmer only)
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, quantity, farmerId } = req.body;

        // Handle image uploads
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            // With Cloudinary storage, req.files contains file objects with 'path' being the Cloudinary URL
            imageUrls = req.files.map(file => file.path);
        }

        // Validate required fields
        const missing = validateFields(req.body, ['name', 'description', 'price', 'category', 'stock', 'quantity']);
        if (missing) {
            return errorResponse(res, 400, 'Missing required fields', missing);
        }

        // Use authenticated user's ID
        // Priority: 1. req.user.clerkId (from DB), 2. req.user.id (from Auth middleware), 3. req.body.farmerId (fallback)
        const farmerIdToUse = req.user?.clerkId || req.user?.id || farmerId || 'unknown-farmer';

        const product = await Product.create({
            farmerId: farmerIdToUse,
            name,
            description,
            price,
            category,
            stock,
            quantity,
            images: imageUrls,
        });

        successResponse(res, 201, product, 'Product created successfully');
    } catch (error) {
        errorResponse(res, 500, 'Failed to create product', error.message);
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Farmer only - own products)
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return errorResponse(res, 404, 'Product not found');
        }

        // TEMPORARY: Skip ownership check since we don't have req.user
        // TODO: Implement proper authentication and ownership verification
        // if (product.farmerId !== req.user.clerkId) {
        //     return errorResponse(res, 403, 'You can only update your own products');
        // }

        const { name, description, price, category, stock, quantity } = req.body;

        if (name) product.name = name;
        if (description) product.description = description;
        if (price !== undefined) product.price = price;
        if (category) product.category = category;
        if (stock !== undefined) product.stock = stock;
        if (quantity) product.quantity = quantity;

        // Handle new images if uploaded
        if (req.files && req.files.length > 0) {
            // Using Cloudinary, file.path contains the secure URL
            const newImages = req.files.map(file => file.path);

            // Allow appending or replacing? For now, we'll append to existing images
            // If user wants to delete, that needs a separate mechanism or UI logic
            product.images = [...product.images, ...newImages];
        }

        await product.save();

        successResponse(res, 200, product, 'Product updated successfully');
    } catch (error) {
        errorResponse(res, 500, 'Failed to update product', error.message);
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Farmer only - own products)
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return errorResponse(res, 404, 'Product not found');
        }

        // TEMPORARY: Skip ownership check since we don't have req.user
        // TODO: Implement proper authentication and ownership verification
        // if (product.farmerId !== req.user.clerkId) {
        //     return errorResponse(res, 403, 'You can only delete your own products');
        // }

        await product.deleteOne();

        successResponse(res, 200, null, 'Product deleted successfully');
    } catch (error) {
        errorResponse(res, 500, 'Failed to delete product', error.message);
    }
};

// @desc    Get farmer's products
// @route   GET /api/products/farmer/:farmerId
// @access  Public
export const getFarmerProducts = async (req, res) => {
    try {
        const products = await Product.find({ farmerId: req.params.farmerId });

        successResponse(res, 200, products, 'Farmer products fetched successfully');
    } catch (error) {
        errorResponse(res, 500, 'Failed to fetch farmer products', error.message);
    }
};
