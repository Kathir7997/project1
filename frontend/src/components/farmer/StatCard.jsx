import React from 'react';

const StatCard = ({ icon: Icon, label, value, color }) => {
    // Check if color is a tailwind class string (e.g. "bg-blue-50 text-blue-600") 
    // or a legacy color name (e.g. "primary", "green")

    let colorClasses = "";
    if (color.includes(" ")) {
        colorClasses = color;
    } else {
        // Legacy mapping for backward compatibility during migration
        const colorMap = {
            primary: "bg-primary-50 text-primary-600",
            green: "bg-green-50 text-green-600",
            earth: "bg-earth-50 text-earth-600",
            red: "bg-red-50 text-red-600",
        };
        colorClasses = colorMap[color] || "bg-gray-50 text-gray-600";
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
                    <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colorClasses}`}>
                    <Icon />
                </div>
            </div>
        </div>
    );
};

export default StatCard;
