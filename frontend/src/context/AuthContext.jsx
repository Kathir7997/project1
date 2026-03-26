import React, { createContext, useContext, useEffect, useState } from 'react';
import { ClerkProvider, useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

const AuthContext = createContext(null);

const AuthStateAdapter = ({ children }) => {
    const { user: clerkUser, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerkAuth();
    const [appUser, setAppUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoaded) {
            if (isSignedIn && clerkUser) {
                // Map Clerk user to app user structure including metadata role
                console.log("Clerk User Metadata:", clerkUser.publicMetadata);
                const role = clerkUser.publicMetadata?.role || clerkUser.unsafeMetadata?.role;
                console.log("Mapped Role:", role);

                setAppUser({
                    id: clerkUser.id,
                    email: clerkUser.primaryEmailAddress?.emailAddress,
                    firstName: clerkUser.firstName,
                    lastName: clerkUser.lastName,
                    imageUrl: clerkUser.imageUrl,
                    role: role,
                    clerkId: clerkUser.id
                });
            } else {
                setAppUser(null);
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
