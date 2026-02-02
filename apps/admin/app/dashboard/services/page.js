'use client';
import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Eye } from 'lucide-react';

export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/services', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let data;
            try {
                data = await res.json();
            } catch {
                data = [];
            }
            setServices(Array.isArray(data) ? data : data.services || []);
        } catch (err) {
            console.error('Error fetching services:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'ACTIVE': 'bg-emerald-100 text-emerald-700',
            'PENDING': 'bg-amber-100 text-amber-700',
            'EXPIRED': 'bg-red-100 text-red-700',
            'CANCELLED': 'bg-gray-100 text-gray-700'
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const getServiceBadge = (type) => {
        const styles = {
            'ESS': 'bg-blue-100 text-blue-700',
            'EPS': 'bg-purple-100 text-purple-700',
            'CDC': 'bg-amber-100 text-amber-700'
        };
        return styles[type] || 'bg-gray-100 text-gray-700';
    };

    const filteredServices = services.filter(s => {
        if (filter !== 'all' && s.status !== filter) return false;
        if (search && !s.customerId?.toLowerCase().includes(search.toLowerCase()) &&
            !s.customerName?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Services</h1>
                    <p className="text-gray-500">View and manage all service plans</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Total Services</p>
                    <p className="text-2xl font-bold">{services.length}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-600">ESS Plans</p>
                    <p className="text-2xl font-bold text-blue-700">{services.filter(s => s.serviceType === 'ESS').length}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-purple-600">EPS Plans</p>
                    <p className="text-2xl font-bold text-purple-700">{services.filter(s => s.serviceType === 'EPS').length}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-sm text-amber-600">CDC Plans</p>
                    <p className="text-2xl font-bold text-amber-700">{services.filter(s => s.serviceType === 'CDC').length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by customer ID or name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field pl-10"
                            />
                        </div>
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="input-field w-auto"
                    >
                        <option value="all">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING">Pending</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Service ID</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Device</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Value</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No services found
                                    </td>
                                </tr>
                            ) : (
                                filteredServices.map((service) => (
                                    <tr key={service._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-sm">{service.serviceId || service._id}</td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium">{service.customerName}</p>
                                                <p className="text-xs text-gray-500">{service.customerId}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${getServiceBadge(service.serviceType)}`}>
                                                {service.serviceType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm">{service.deviceBrand} {service.deviceModel}</p>
                                        </td>
                                        <td className="px-6 py-4 font-medium">₹{service.serviceCharge?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${getStatusBadge(service.status)}`}>
                                                {service.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                                                <Eye className="w-4 h-4" />
                                            </button>
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
