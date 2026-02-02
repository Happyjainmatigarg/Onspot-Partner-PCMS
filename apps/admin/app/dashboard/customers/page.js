'use client';
import { useState, useEffect } from 'react';
import { Users, Search, Filter, Eye, Check, X } from 'lucide-react';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/customers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let data;
            try {
                data = await res.json();
            } catch {
                data = [];
            }
            setCustomers(Array.isArray(data) ? data : data.customers || []);
        } catch (err) {
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (customerId, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await fetch(`/api/admin/customers/${customerId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            fetchCustomers();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'ACTIVE': 'bg-emerald-100 text-emerald-700',
            'PENDING': 'bg-amber-100 text-amber-700',
            'SUSPENDED': 'bg-red-100 text-red-700',
            'INACTIVE': 'bg-gray-100 text-gray-700'
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const filteredCustomers = customers.filter(c => {
        if (filter !== 'all' && c.status !== filter) return false;
        if (search && !c.customerId?.toLowerCase().includes(search.toLowerCase()) &&
            !c.name?.toLowerCase().includes(search.toLowerCase()) &&
            !c.phone?.includes(search)) return false;
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
                    <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                    <p className="text-gray-500">Manage customer registrations and services</p>
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
                                placeholder="Search by ID, name, or phone..."
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
                        <option value="PENDING">Pending</option>
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold">{customers.length}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-sm text-amber-600">Pending</p>
                    <p className="text-2xl font-bold text-amber-700">{customers.filter(c => c.status === 'PENDING').length}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-sm text-emerald-600">Active</p>
                    <p className="text-2xl font-bold text-emerald-700">{customers.filter(c => c.status === 'ACTIVE').length}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                    <p className="text-sm text-red-600">Suspended</p>
                    <p className="text-2xl font-bold text-red-700">{customers.filter(c => c.status === 'SUSPENDED').length}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Customer ID</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Service</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Partner</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No customers found
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-sm">{customer.customerId}</td>
                                        <td className="px-6 py-4">{customer.name}</td>
                                        <td className="px-6 py-4">{customer.phone}</td>
                                        <td className="px-6 py-4">
                                            <span className="badge bg-primary-100 text-primary-700">
                                                {customer.serviceType || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{customer.partnerId || 'Direct'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${getStatusBadge(customer.status)}`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {customer.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(customer._id, 'ACTIVE')}
                                                            className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200"
                                                            title="Approve"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(customer._id, 'SUSPENDED')}
                                                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                            title="Suspend"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200" title="View">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
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
