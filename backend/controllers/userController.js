import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { normalizeClerkRole, upsertClerkUser } from '../utils/clerkUserSync.js';

// @desc    Sync user from Clerk
// @route   POST /api/users/sync
// @access  Public
export const syncUser = async (req, res) => {
    try {
        const { clerkId, email, name, role } = req.body;

        if (!clerkId || !email || !name || !role) {
            return errorResponse(res, 400, 'Missing required fields');
        }

        const user = await upsertClerkUser({ clerkId, email, name, role });

        if (user) {
            // Update Clerk metadata so frontend can see the role in future sessions
            try {
                await clerkClient.users.updateUserMetadata(clerkId, {
                    publicMetadata: {
                        role: normalizeClerkRole(role)
                    }
                });
                console.log(`Updated Clerk metadata for user ${clerkId} with role ${role}`);
            } catch (clerkError) {
                console.error('Failed to update Clerk metadata:', clerkError);
                // Don't fail the request if just metadata update fails, but log it
            }
        }

        successResponse(res, 200, user, 'User synced successfully');
    } catch (error) {
        errorResponse(res, 500, 'Failed to sync user', error.message);
    }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getCurrentUserProfile = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return errorResponse(res, 401, 'User not authenticated');
        }

        successResponse(res, 200, user, 'User profile fetched successfully');
    } catch (error) {
        errorResponse(res, 500, 'Failed to fetch user profile', error.message);
    }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateCurrentUserProfile = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return errorResponse(res, 401, 'User not authenticated');
        }

        const { name } = req.body;

        if (name) {
            user.name = name;
            await user.save();
        }

        successResponse(res, 200, user, 'User profile updated successfully');
    } catch (error) {
        errorResponse(res, 500, 'Failed to update user profile', error.message);
    }
};

// @desc    Get user profile
// @route   GET /api/users/:clerkId
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.params.clerkId });

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        successResponse(res, 200, user, 'User profile fetched successfully');
    } catch (error) {
        errorResponse(res, 500, 'Failed to fetch user profile', error.message);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/:clerkId
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ clerkId: req.params.clerkId });

        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        // Only allow updating name (role and email managed by Clerk)
        const { name } = req.body;

        if (name) user.name = name;

        await user.save();

        successResponse(res, 200, user, 'User profile updated successfully');
    } catch (error) {
        errorResponse(res, 500, 'Failed to update user profile', error.message);
    }
};
