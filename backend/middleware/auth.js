import { clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

// Sync indexes on middleware load - removes orphaned indices and ensures correct ones exist
try {
    User.syncIndexes();
    console.log('[AUTH] Starting index synchronization...');
} catch (err) {
    console.error('[AUTH] Error during index sync:', err.message);
}

// Verify Clerk token and attach user to request
export const authenticateUser = async (req, res, next) => {
    try {
        // 1. Check for Clerk Bearer Token
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];

            try {
                // Verify token using Clerk with large clock tolerance
                const client = await clerkClient.verifyToken(token, {
                    clockTolerance: 300 // Allow up to 5 minutes of clock skew
                });

                // Get user details from Clerk
                const clerkUser = await clerkClient.users.getUser(client.sub);

                // Extract role from metadata
                const role = clerkUser.publicMetadata?.role || clerkUser.unsafeMetadata?.role;
                const email = clerkUser.emailAddresses[0]?.emailAddress;
                const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();

                // Check if user exists in MongoDB by clerkId
                let user = await User.findOne({ clerkId: client.sub }).select('-createdAt -updatedAt');

                // If user doesn't exist, create them
                if (!user) {
                    try {
                        // Double-check to avoid race conditions
                        const existingUser = await User.findOne({
                            $or: [
                                { clerkId: client.sub },
                                { email: email }
                            ]
                        });

                        if (existingUser) {
                            console.log(`[AUTH] User already exists: ${existingUser.email}`);
                            user = existingUser;
                        } else {
                            // Create new user
                            user = await User.create({
                                clerkId: client.sub,
                                name: name || 'User',
                                email: email || `user-${client.sub}@clerk.local`,
                                role: (role && role.toLowerCase() === 'farmer') ? 'Farmer' : 'Consumer'
                            });
                            console.log(`[AUTH] ✓ Created new user in MongoDB: ${user.email} (${user.role})`);
                        }
                    } catch (dbError) {
                        console.error('[AUTH] Error creating user:', {
                            message: dbError.message,
                            code: dbError.code,
                            keyPattern: dbError.keyPattern
                        });

                        // Handle duplicate key error gracefully
                        if (dbError.code === 11000) {
                            // Duplicate key error - try to find existing user
                            const duplicateKey = Object.keys(dbError.keyPattern || {})[0];
                            console.log(`[AUTH] Duplicate key detected: ${duplicateKey}`);

                            let existingUser = null;
                            if (duplicateKey === 'clerkId') {
                                existingUser = await User.findOne({ clerkId: client.sub });
                            } else if (duplicateKey === 'email') {
                                existingUser = await User.findOne({ email: email });
                            }

                            if (existingUser) {
                                console.log(`[AUTH] ✓ Found existing user: ${existingUser.email}`);
                                user = existingUser;
                            } else {
                                console.error('[AUTH] Could not resolve duplicate key error');
                                return res.status(500).json({ 
                                    message: 'User creation failed',
                                    error: 'Database conflict'
                                });
                            }
                        } else {
                            console.error('[AUTH] Database error:', dbError.message);
                            return res.status(500).json({ 
                                message: 'Database error',
                                error: dbError.message 
                            });
                        }
                    }
                }

                // Ensure user has all required properties
                if (!user.clerkId) {
                    user.clerkId = client.sub;
                    await user.save().catch(err => console.error('[AUTH] Error updating user:', err));
                }

                // Attach user info to request
                req.user = user;
                console.log(`[AUTH] ✓ Authenticated via Clerk: ${user.email} (${user.role})`);
                return next();
            } catch (clerkError) {
                console.error('[AUTH] Clerk token verification error:', clerkError.message);
                // Fall through to check custom headers
            }
        }

        // 2. Fallback: Check for custom headers from localStorage (Development/Testing)
        const customUserId = req.headers['x-user-id'];
        if (customUserId) {
            console.log(`[AUTH] Attempting custom auth with x-user-id: ${customUserId}`);
            
            // Find user by clerkId or _id
            let user = await User.findOne({ clerkId: customUserId }).select('-createdAt -updatedAt');

            // If checking by _id is needed:
            if (!user && customUserId.length === 24) { // Basic ObjectId check
                user = await User.findById(customUserId).select('-createdAt -updatedAt');
            }

            if (user) {
                // Ensure user has all required properties
                if (!user.clerkId) {
                    user.clerkId = user._id.toString();
                }
                
                req.user = user;
                console.log(`[AUTH] ✓ Authenticated via custom headers: ${user.email} (${user.role})`);
                return next();
            }
        }

        // If neither method works
        console.error('[AUTH] ❌ Authentication failed - no valid token or headers provided');
        return res.status(401).json({ message: 'No authentication token provided' });

    } catch (error) {
        console.error('[AUTH] ❌ Authentication error:', error.message);
        res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
};

// Middleware to check if user is a Farmer
export const requireFarmer = (req, res, next) => {
    if (req.user && req.user.role && req.user.role.toLowerCase() === 'farmer') {
        next();
    } else {
        console.error('[AUTH] ❌ Farmer role required but user has role:', req.user?.role);
        res.status(403).json({ message: 'Access denied. Farmer role required.' });
    }
};

// Middleware to check if user is a Consumer
export const requireConsumer = (req, res, next) => {
    if (req.user && req.user.role && req.user.role.toLowerCase() === 'consumer') {
        next();
    } else {
        console.error('[AUTH] ❌ Consumer role required but user has role:', req.user?.role);
        res.status(403).json({ message: 'Access denied. Consumer role required.' });
    }
};
