import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private (Consumer)
export const getCart = async (req, res) => {
    try {
        if (!req.user) {
            return errorResponse(res, 401, 'User not authenticated');
        }

        const userId = req.user.clerkId || req.user._id;
        if (!userId) {
            return errorResponse(res, 401, 'User ID not found');
        }

        let cart = await Cart.findOne({ consumerId: userId }).populate('items.productId');

        if (!cart) {
            cart = await Cart.create({ consumerId: userId, items: [] });
        }

        successResponse(res, 200, cart, 'Cart fetched successfully');
    } catch (error) {
        console.error('Get cart error:', error);
        errorResponse(res, 500, 'Failed to fetch cart', error.message);
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private (Consumer)
export const addToCart = async (req, res) => {
    try {
        if (!req.user) {
            return errorResponse(res, 401, 'User not authenticated');
        }

        const userId = req.user.clerkId || req.user._id;
        if (!userId) {
            return errorResponse(res, 401, 'User ID not found');
        }

        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return errorResponse(res, 400, 'Product ID is required');
        }

        if (quantity < 1) {
            return errorResponse(res, 400, 'Quantity must be at least 1');
        }

        const product = await Product.findById(productId);
        if (!product) {
            return errorResponse(res, 404, 'Product not found');
        }

        if (product.stock < quantity) {
            return errorResponse(res, 400, `Insufficient stock. Only ${product.stock} available.`);
        }

        let cart = await Cart.findOne({ consumerId: userId });

        if (!cart) {
            cart = await Cart.create({
                consumerId: userId,
                items: [{ productId, farmerId: product.farmerId, quantity }],
            });
        } else {
            const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

            if (itemIndex > -1) {
                // Item exists, update quantity
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Add new item
                cart.items.push({ productId, farmerId: product.farmerId, quantity });
            }
            await cart.save();
        }

        const populatedCart = await Cart.findById(cart._id).populate('items.productId');
        successResponse(res, 200, populatedCart, 'Item added to cart successfully');
    } catch (error) {
        console.error('Add to cart error:', error);
        errorResponse(res, 500, 'Failed to add item to cart', error.message);
    }
};

// @desc    Update item quantity
// @route   PUT /api/cart/:productId
// @access  Private (Consumer)
export const updateCartItem = async (req, res) => {
    try {
        if (!req.user) {
            return errorResponse(res, 401, 'User not authenticated');
        }

        const userId = req.user.clerkId || req.user._id;
        if (!userId) {
            return errorResponse(res, 401, 'User ID not found');
        }

        const { productId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            return errorResponse(res, 400, 'Quantity must be at least 1');
        }

        const cart = await Cart.findOne({ consumerId: userId });
        if (!cart) {
            return errorResponse(res, 404, 'Cart not found');
        }

        const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

        if (itemIndex > -1) {
            const product = await Product.findById(productId);
            if (product && product.stock < quantity) {
                return errorResponse(res, 400, `Insufficient stock. Only ${product.stock} available.`);
            }
            cart.items[itemIndex].quantity = quantity;
            await cart.save();

            const populatedCart = await Cart.findById(cart._id).populate('items.productId');
            successResponse(res, 200, populatedCart, 'Cart updated successfully');
        } else {
            errorResponse(res, 404, 'Item not found in cart');
        }
    } catch (error) {
        console.error('Update cart error:', error);
        errorResponse(res, 500, 'Failed to update cart', error.message);
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private (Consumer)
export const removeFromCart = async (req, res) => {
    try {
        if (!req.user) {
            return errorResponse(res, 401, 'User not authenticated');
        }

        const userId = req.user.clerkId || req.user._id;
        if (!userId) {
            return errorResponse(res, 401, 'User ID not found');
        }

        const { productId } = req.params;

        const cart = await Cart.findOne({ consumerId: userId });
        if (!cart) {
            return errorResponse(res, 404, 'Cart not found');
        }

        cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
        await cart.save();

        const populatedCart = await Cart.findById(cart._id).populate('items.productId');
        successResponse(res, 200, populatedCart, 'Item removed from cart successfully');
    } catch (error) {
        console.error('Remove from cart error:', error);
        errorResponse(res, 500, 'Failed to remove item', error.message);
    }
};

// @desc    Merge local cart with backend cart on login
// @route   POST /api/cart/merge
// @access  Private (Consumer)
export const mergeCart = async (req, res) => {
    try {
        if (!req.user) {
            return errorResponse(res, 401, 'User not authenticated');
        }

        const userId = req.user.clerkId || req.user._id;
        if (!userId) {
            return errorResponse(res, 401, 'User ID not found');
        }

        const { localItems } = req.body; // Array of { productId, quantity }

        if (!Array.isArray(localItems) || localItems.length === 0) {
            // Nothing to merge, just return current cart
            return getCart(req, res);
        }

        let cart = await Cart.findOne({ consumerId: userId });
        if (!cart) {
            cart = await Cart.create({ consumerId: userId, items: [] });
        }

        for (const localItem of localItems) {
            const product = await Product.findById(localItem._id || localItem.productId); // Handle both formats
            if (!product) continue;

            const itemIndex = cart.items.findIndex((item) => item.productId.toString() === product._id.toString());

            if (itemIndex > -1) {
                // If item exists, we can choose to overwrite or add. Adding is safer.
                // Or we can take the max. Let's add for now, but respect stock.
                let newQty = cart.items[itemIndex].quantity + localItem.quantity;
                if (newQty > product.stock) newQty = product.stock;
                cart.items[itemIndex].quantity = newQty;
            } else {
                cart.items.push({
                    productId: product._id,
                    farmerId: product.farmerId,
                    quantity: Math.min(localItem.quantity, product.stock),
                });
            }
        }

        await cart.save();
        const populatedCart = await Cart.findById(cart._id).populate('items.productId');
        successResponse(res, 200, populatedCart, 'Cart merged successfully');

    } catch (error) {
        console.error('Merge cart error:', error);
        errorResponse(res, 500, 'Failed to merge cart', error.message);
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private (Consumer)
export const clearCart = async (req, res) => {
    try {
        if (!req.user) {
            return errorResponse(res, 401, 'User not authenticated');
        }

        const userId = req.user.clerkId || req.user._id;
        if (!userId) {
            return errorResponse(res, 401, 'User ID not found');
        }

        await Cart.findOneAndDelete({ consumerId: userId });
        successResponse(res, 200, { consumerId: userId, items: [] }, 'Cart cleared successfully');
    } catch (error) {
        console.error('Clear cart error:', error);
        errorResponse(res, 500, 'Failed to clear cart', error.message);
    }
};
