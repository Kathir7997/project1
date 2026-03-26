import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesChart = ({ orders }) => {
    // Process orders to get sales by month
    const salesByMonth = {};

    orders.forEach((order) => {
        const date = new Date(order.createdAt);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

        if (!salesByMonth[monthYear]) {
            salesByMonth[monthYear] = 0;
        }

        // Sum up only this farmer's products
        const farmerTotal = order.products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        salesByMonth[monthYear] += farmerTotal;
    });

    const data = Object.entries(salesByMonth).map(([month, revenue]) => ({
        month,
        revenue,
    }));

    if (data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No sales data available yet</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#16a34a" name="Revenue (₹)" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default SalesChart;
