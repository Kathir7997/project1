// Token Manager - Manages Clerk token retrieval globally
// This allows the API module to access the Clerk token without being in a React context

let clerkGetToken = null;

export const setClerkTokenGetter = (getToken) => {
    console.log('[TokenManager] Clerk token getter set');
    clerkGetToken = getToken;
};

export const getClerkToken = async () => {
    try {
        if (clerkGetToken) {
            const token = await clerkGetToken();
            console.log('[TokenManager] Clerk token retrieved successfully');
            return token;
        }
        return null;
    } catch (error) {
        console.error('[TokenManager] Error getting Clerk token:', error.message);
        return null;
    }
};
