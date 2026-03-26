import React from 'react';

const LoadingSpinner = ({ size = 'medium', fullScreen = false }) => {
    const sizeClasses = {
        small: 'h-6 w-6',
        medium: 'h-12 w-12',
        large: 'h-16 w-16',
    };

    const spinner = (
        <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`}></div>
    );

    if (fullScreen) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                {spinner}
            </div>
        );
    }

    return <div className="flex justify-center">{spinner}</div>;
};

export default LoadingSpinner;
