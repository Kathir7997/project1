import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        clerkId: {
            type: String,
            required: [true, 'Clerk ID is required'],
            unique: true,
            sparse: true, // Allows null values and only enforces uniqueness on non-null values
            trim: true,
        },
        role: {
            type: String,
            enum: ['Farmer', 'Consumer'],
            required: [true, 'Role is required'],
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            sparse: true, // Allows null values and only enforces uniqueness on non-null values
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'], // Basic email validation
        },
    },
    { timestamps: true }
);

// Delete the old index and create a new one on server startup
userSchema.post('syncIndexes', () => {
    console.log('[User Model] Indexes synced successfully');
});

const User = mongoose.model('User', userSchema);

// Sync indexes when model loads
if (mongoose.connection.readyState > 0) {
    User.syncIndexes().catch(err => {
        console.error('[User Model] Error syncing indexes:', err.message);
    });
}

export default User;
