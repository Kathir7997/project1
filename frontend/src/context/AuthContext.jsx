import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ClerkProvider, useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { setClerkTokenGetter } from '../services/tokenManager';
import { userAPI } from '../services/endpoints';

const AuthContext = createContext(null);

const AuthStateAdapter = ({ children }) => {
    const { user: clerkUser, isLoaded, isSignedIn } = useUser();
    const { signOut, getToken } = useClerkAuth();
    const [appUser, setAppUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const lastSyncedUserId = useRef(null);

    const mapClerkUserToAppUser = (clerkSourceUser, role) => {
        const fullName = `${clerkSourceUser.firstName || ''} ${clerkSourceUser.lastName || ''}`.trim();
        const email = clerkSourceUser.primaryEmailAddress?.emailAddress || clerkSourceUser.emailAddresses?.[0]?.emailAddress || '';

        return {
            id: clerkSourceUser.id,
            clerkId: clerkSourceUser.id,
            name: fullName || email || 'User',
            fullName: fullName || email || 'User',
            email,
            imageUrl: clerkSourceUser.imageUrl,
            firstName: clerkSourceUser.firstName,
            lastName: clerkSourceUser.lastName,
            role: role || 'Consumer',
            publicMetadata: {
                ...(clerkSourceUser.publicMetadata || {}),
                role: role || clerkSourceUser.publicMetadata?.role || 'Consumer',
            },
            unsafeMetadata: {
                ...(clerkSourceUser.unsafeMetadata || {}),
                role: role || clerkSourceUser.unsafeMetadata?.role || 'Consumer',
            },
            primaryEmailAddress: {
                emailAddress: email,
            },
        };
    };

    // Set the token getter function for the API module
    useEffect(() => {
        if (isSignedIn && getToken) {
            console.log('[AuthContext] Setting Clerk token getter');
            setClerkTokenGetter(getToken);
        }
    }, [isSignedIn, getToken]);

    useEffect(() => {
        if (isLoaded) {
            if (isSignedIn && clerkUser) {
                // Map Clerk user to app user structure including metadata role
                console.log("Clerk User Metadata:", clerkUser.publicMetadata);
                const role = clerkUser.publicMetadata?.role || clerkUser.unsafeMetadata?.role;
                console.log("Mapped Role:", role);

                const mappedUser = mapClerkUserToAppUser(clerkUser, role);

                setAppUser(mappedUser);

                if (lastSyncedUserId.current !== clerkUser.id) {
                    lastSyncedUserId.current = clerkUser.id;
                    userAPI.syncUser({
                        clerkId: clerkUser.id,
                        email: mappedUser.email,
                        name: mappedUser.name,
                        role: role || 'Consumer',
                    })
                        .then((response) => {
                            const syncedUser = response?.data?.data;
                            if (syncedUser) {
                                setAppUser((currentUser) => ({
                                    ...currentUser,
                                    id: syncedUser.clerkId || currentUser.id,
                                    clerkId: syncedUser.clerkId || currentUser.clerkId,
                                    email: syncedUser.email || currentUser.email,
                                    name: syncedUser.name || currentUser.name,
                                    fullName: syncedUser.name || currentUser.fullName,
                                    firstName: syncedUser.name?.split(' ')[0] || currentUser.firstName,
                                    lastName: syncedUser.name?.split(' ').slice(1).join(' ') || currentUser.lastName,
                                    role: syncedUser.role || currentUser.role,
                                    publicMetadata: {
                                        ...(currentUser.publicMetadata || {}),
                                        role: syncedUser.role || currentUser.role,
                                    },
                                    unsafeMetadata: {
                                        ...(currentUser.unsafeMetadata || {}),
                                        role: syncedUser.role || currentUser.role,
                                    },
                                    primaryEmailAddress: {
                                        emailAddress: syncedUser.email || currentUser.email,
                                    },
                                }));
                            }
                        })
                        .catch((error) => {
                            console.error('[AuthContext] Failed to sync Clerk user to MongoDB:', error);
                        });
                }
            } else {
                setAppUser(null);
                lastSyncedUserId.current = null;
            }
            setLoading(false);
        }
    }, [isLoaded, isSignedIn, clerkUser]);

    // Match existing AuthContext interface
    const contextValue = {
        user: appUser,
        isAuthenticated: !!appUser,
        loading,
        login: () => { }, // Handled by Clerk components
        logout: () => signOut(),
        updateUser: async (updates) => {
            if (clerkUser && updates.role) {
                try {
                    await clerkUser.update({
                        unsafeMetadata: {
                            role: updates.role
                        }
                    });
                    await userAPI.syncUser({
                        clerkId: clerkUser.id,
                        email: clerkUser.primaryEmailAddress?.emailAddress,
                        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
                        role: updates.role,
                    });
                    setAppUser((currentUser) => currentUser ? ({
                        ...currentUser,
                        role: updates.role,
                        publicMetadata: {
                            ...(currentUser.publicMetadata || {}),
                            role: updates.role,
                        },
                        unsafeMetadata: {
                            ...(currentUser.unsafeMetadata || {}),
                            role: updates.role,
                        },
                    }) : currentUser);
                    // The useEffect will trigger and update local state
                } catch (error) {
                    console.error("Failed to update role:", error);
                }
            }
        }
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const AuthProvider = ({ children }) => {
    const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

    if (!PUBLISHABLE_KEY) {
        return <div className="flex justify-center items-center h-screen text-red-600">Missing Clerk Publishable Key in .env</div>;
    }

    return (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <AuthStateAdapter>
                {children}
            </AuthStateAdapter>
        </ClerkProvider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
