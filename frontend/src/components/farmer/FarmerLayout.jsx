import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import Sidebar from './Sidebar';

const FarmerLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Mobile Close Button */}
                    <div className="md:hidden absolute top-4 right-4 z-50">
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Sidebar Content */}
                    <Sidebar />
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 min-w-0 flex flex-col">
                {/* Mobile Header */}
                <div className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        >
                            <FaBars className="text-xl" />
                        </button>
                        <span className="font-bold text-gray-800 text-lg">Agricart Farmer</span>
                    </div>
                </div>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default FarmerLayout;
