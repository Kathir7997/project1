import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaBox, FaClipboardList, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/sign-in');
        } catch (error) {
            console.error('Logout error:', error);
            // Still navigate even if logout fails
            navigate('/sign-in');
        }
    };

    const navItems = [
        { path: '/farmer/dashboard', icon: FaHome, label: 'Overview' },
        { path: '/farmer/products', icon: FaBox, label: 'Products' },
        { path: '/farmer/orders', icon: FaClipboardList, label: 'Orders' },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 mb-6">
                <Link to="/" className="flex items-center gap-3">
                    <span className="text-3xl">🌾</span>
                    <h2 className="text-2xl font-bold text-primary-700">Agricart</h2>
                </Link>
                <div className="text-xs text-gray-400 mt-1 pl-10 uppercase tracking-widest">Farmer Central</div>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                            ? 'bg-primary-50 text-primary-700 font-bold shadow-sm'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <item.icon
                            className={`text-xl transition-colors ${isActive(item.path) ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'
                                }`}
                        />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all font-medium"
                    title="Sign out"
                >
                    <FaSignOutAlt className="text-lg" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
