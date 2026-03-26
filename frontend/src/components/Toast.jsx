import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <FaCheckCircle className="text-green-500" />,
        error: <FaExclamationCircle className="text-red-500" />,
        info: <FaInfoCircle className="text-blue-500" />,
    };

    const bgColors = {
        success: 'bg-green-50 border-green-500',
        error: 'bg-red-50 border-red-500',
        info: 'bg-blue-50 border-blue-500',
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
        >
            <div className={`${bgColors[type]} border-l-4 p-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px]`}>
                {icons[type]}
                <p className="flex-1 text-gray-800">{message}</p>
                <button onClick={() => setIsVisible(false)} className="text-gray-600 hover:text-gray-800">
                    <FaTimes />
                </button>
            </div>
        </div>
    );
};

// Toast container to manage multiple toasts
export const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    // Expose global function to show toast
    useEffect(() => {
        window.showToast = (message, type = 'info', duration = 3000) => {
            const id = Date.now();
            setToasts((prev) => [...prev, { id, message, type, duration }]);
        };
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

export default Toast;
