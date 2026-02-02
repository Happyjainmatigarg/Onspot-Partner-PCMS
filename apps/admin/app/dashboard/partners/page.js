'use client';
import { useState, useEffect } from 'react';
import { Users, Search, Filter, CheckCircle, Clock, XCircle, Eye, Check, X } from 'lucide-react';

export default function PartnersPage() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/partners', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let data;
            try {
                data = await res.json();
            } catch {
                data = [];
            }
            setPartners(Array.isArray(data) ? data : data.partners || []);
        } catch (err) {
            console.error('Error fetching partners:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (partnerId, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await fetch(`/api/admin/partners/${partnerId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            fetchPartners();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'APPROVED': 'bg-emerald-100 text-emerald-700',
            'PENDING': 'bg-amber-100 text-amber-700',
            'REJECTED': 'bg-red-100 text-red-700',
            'SUSPENDED': 'bg-gray-100 text-gray-700'
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const filteredPartners = partners.filter(p => {
        if (filter !== 'all' && p.status !== filter) return false;
        if (search && !p.partnerId?.toLowerCase().includes(search.toLowerCase()) &&
            !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
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
                    <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
                    <p className="text-gray-500">Manage partner registrations and approvals</p>
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
                                placeholder="Search by ID or name..."
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
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold">{partners.length}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-sm text-amber-600">Pending</p>
                    <p className="text-2xl font-bold text-amber-700">{partners.filter(p => p.status === 'PENDING').length}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-sm text-emerald-600">Approved</p>
                    <p className="text-2xl font-bold text-emerald-700">{partners.filter(p => p.status === 'APPROVED').length}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                    <p className="text-sm text-red-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-700">{partners.filter(p => p.status === 'REJECTED').length}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Partner ID</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Phone</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Tier</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredPartners.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No partners found
                                    </td>
                                </tr>
                            ) : (
                                filteredPartners.map((partner) => (
                                    <tr key={partner._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-sm">{partner.partnerId}</td>
                                        <td className="px-6 py-4">{partner.name}</td>
                                        <td className="px-6 py-4">{partner.phone}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium">{partner.tier}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${getStatusBadge(partner.status)}`}>
                                                {partner.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {partner.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(partner._id, 'APPROVED')}
                                                            className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200"
                                                            title="Approve"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(partner._id, 'REJECTED')}
                                                            className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                            title="Reject"
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
