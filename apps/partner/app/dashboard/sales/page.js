'use client';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, ArrowUpRight, IndianRupee } from 'lucide-react';

export default function SalesPage() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/partners/sales', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSales(data.sales || []);
            }
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = sales.filter(sale =>
        sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.serviceId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
                    <p className="text-gray-500">Track and manage your service sales</p>
                </div>
                <div className="bg-white p-2 rounded-lg border flex items-center gap-2 w-full sm:w-auto">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search sales..."
                        className="outline-none text-sm w-full sm:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Service ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Model</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">My Commission</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No sales found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                filteredSales.map((sale) => (
                                    <tr key={sale.serviceId || sale._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-sm text-primary-600">
                                            {sale.serviceId || 'N/A'}
                                            <div className="text-xs text-gray-400">{sale.serviceType}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{sale.deviceModel}</div>
                                            <div className="text-xs text-gray-500">{sale.deviceBrand}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{sale.customerName}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(sale.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            ₹{(sale.serviceCost || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                                <IndianRupee className="w-3 h-3" />
                                                {(sale.commissionAfterGST || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${sale.status === 'ACTIVE' ? 'badge-success' :
                                                    sale.status === 'PENDING' ? 'badge-warning' :
                                                        'badge-danger'
                                                }`}>
                                                {sale.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
