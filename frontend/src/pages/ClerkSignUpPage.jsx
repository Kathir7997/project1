import React, { useState } from 'react';
import { SignUp } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTractor, FaShoppingCart } from 'react-icons/fa';
import farmingBg from '../assets/farming-bg.png';

const ClerkSignUpPage = () => {
    const { isAuthenticated, user } = useAuth();
    const [role, setRole] = useState(null);

    // If user is already authenticated, redirect to appropriate dashboard
    if (isAuthenticated && user) {
        if (user.role === 'Farmer') {
            return <Navigate to="/farmer/dashboard" replace />;
        } else {
            return <Navigate to="/consumer/home" replace />;
        }
    }

    const selectRole = (selectedRole) => {
        setRole(selectedRole);
    };

    if (!role) {
        return (
            <div
                className="min-h-screen bg-cover bg-center bg-fixed relative flex items-center justify-center"
                style={{ backgroundImage: `url(${farmingBg})` }}
            >
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="relative z-10 bg-white/20 backdrop-blur-md p-8 rounded-3xl border border-white/30 shadow-2xl max-w-md w-full text-center">
                    <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-lg">Create your account</h2>
                    <p className="text-white/90 mb-8 text-lg">Select your role to get started</p>

                    <div className="space-y-4">
                        <button
                            onClick={() => selectRole('Farmer')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg flex items-center justify-center gap-3"
                        >
                            <FaTractor className="text-2xl" />
                            I am a Farmer
                        </button>
                        <button
                            onClick={() => selectRole('Consumer')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg flex items-center justify-center gap-3"
                        >
                            <FaShoppingCart className="text-2xl" />
                            I am a Consumer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-fixed relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
            style={{ backgroundImage: `url(${farmingBg})` }}
        >
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative z-10 max-w-md w-full space-y-8 flex justify-center">
                <SignUp
                    signInUrl="/sign-in"
                    forceRedirectUrl={role === 'Farmer' ? '/farmer/dashboard' : '/consumer/home'}
                    initialValues={{
                        publicMetadata: {
                            role: role
                        }
                    }}
                    unsafeMetadata={{
                        role: role
                    }}
                    appearance={{
                        layout: {
                            socialButtonsPlacement: 'bottom',
                            socialButtonsVariant: 'iconButton',
                            termsPageUrl: 'https://clerk.com/terms'
                        },
                        variables: {
                            colorText: 'white',
                            colorPrimary: '#16a34a', // green-600
                            colorBackground: 'transparent',
                            colorInputBackground: 'rgba(255, 255, 255, 0.1)',
                            colorInputText: 'white',
                            colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
                        },
                        elements: {
                            card: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl',
                            headerTitle: 'text-white drop-shadow-md',
                            headerSubtitle: 'text-white/80',
                            socialButtonsBlockButton: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
                            socialButtonsBlockButtonText: 'text-white',
                            dividerLine: 'bg-white/20',
                            dividerText: 'text-white/60',
                            formFieldLabel: 'text-white',
                            formFieldInput: 'bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-green-400 focus:ring-green-400/50',
                            footerActionText: 'text-white/80',
                            footerActionLink: 'text-green-300 hover:text-green-200 font-bold',
                            formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-white shadow-lg border-none',
                            identityPreviewText: 'text-white',
                            identityPreviewEditButtonIcon: 'text-white/80',
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default ClerkSignUpPage;
