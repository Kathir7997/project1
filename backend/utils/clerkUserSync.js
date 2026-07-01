import User from '../models/User.js';

const normalizeRole = (role) => {
    return role && role.toLowerCase() === 'farmer' ? 'Farmer' : 'Consumer';
};

const buildUserPayload = ({ clerkId, email, name, role }) => {
    return {
        clerkId,
        email: email || `user-${clerkId}@clerk.local`,
        name: name || 'User',
        role: normalizeRole(role),
    };
};

export const upsertClerkUser = async ({ clerkId, email, name, role }) => {
    const payload = buildUserPayload({ clerkId, email, name, role });

    let user = await User.findOne({ clerkId: payload.clerkId });

    if (!user && payload.email) {
        user = await User.findOne({ email: payload.email });
    }

    if (user) {
        user.set(payload);
        await user.save();
        return user;
    }

    return User.create(payload);
};

export const normalizeClerkRole = normalizeRole;