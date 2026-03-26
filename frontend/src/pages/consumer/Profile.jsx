import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Profile = () => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col min-h-screen">
            <Header role="Consumer" />

            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

                <div className="max-w-2xl">
                    <div className="card">
                        <div className="flex items-center mb-6">
                            <img
                                src={user?.imageUrl || 'https://via.placeholder.com/100'}
                                alt={user?.fullName || 'User'}
                                className="w-20 h-20 rounded-full mr-4"
                            />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{user?.fullName || 'User'}</h2>
                                <p className="text-gray-600">{user?.primaryEmailAddress?.emailAddress || ''}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={user?.fullName || ''}
                                    readOnly
                                    className="input-field bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={user?.primaryEmailAddress?.emailAddress || ''}
                                    readOnly
                                    className="input-field bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <input
                                    type="text"
                                    value={user?.publicMetadata?.role || 'Consumer'}
                                    readOnly
                                    className="input-field bg-gray-50"
                                />
                            </div>

                            <div className="pt-4">
                                <p className="text-sm text-gray-600">
                                    Profile management is handled by Clerk. To update your profile information,
                                    click the user button in the header.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
