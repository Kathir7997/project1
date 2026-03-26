import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/sign-in" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate dashboard if logged in but wrong role
        if (user.role === 'Farmer') {
            return <Navigate to="/farmer/dashboard" replace />;
        } else if (user.role === 'Consumer') {
            return <Navigate to="/consumer/home" replace />;
        } else {
            return <Navigate to="/sign-up" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
