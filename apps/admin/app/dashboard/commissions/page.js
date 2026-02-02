'use client';
import { useState, useEffect } from 'react';
import { Coins, Search, TrendingUp, Download } from 'lucide-react';

export default function CommissionsPage() {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchCommissions();
    }, []);

    const fetchCommissions = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/commissions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let data;
            try {
                data = await res.json();
            } catch {
                data = [];
            }
            setCommissions(Array.isArray(data) ? data : data.commissions || []);
        } catch (err) {
            console.error('Error fetching commissions:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'PENDING': 'bg-amber-100 text-amber-700',
            'PROCESSING': 'bg-blue-100 text-blue-700',
            'PAID': 'bg-emerald-100 text-emerald-700',
            'FAILED': 'bg-red-100 text-red-700'
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const totalPending = commissions.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalPaid = commissions.filter(c => c.status === 'PAID').reduce((sum, c) => sum + (c.amount || 0), 0);

    const filteredCommissions = commissions.filter(c => {
        if (filter !== 'all' && c.status !== filter) return false;
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
                    <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
                    <p className="text-gray-500">Track and manage partner commissions</p>
                </div>
                <button className="btn-secondary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Report
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Total Commissions</p>
                    <p className="text-2xl font-bold">{commissions.length}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-sm text-amber-600">Pending Amount</p>
                    <p className="text-2xl font-bold text-amber-700">₹{totalPending.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-sm text-emerald-600">Total Paid</p>
                    <p className="text-2xl font-bold text-emerald-700">₹{totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-600">This Month</p>
                    <p className="text-2xl font-bold text-blue-700">₹{(totalPending + totalPaid).toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="input-field w-auto"
                    >
                        <option value="all">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="PAID">Paid</option>
                        <option value="FAILED">Failed</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Partner</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Service</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Commission</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">TDS (5%)</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Net Amount</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredCommissions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No commissions found
                                    </td>
                                </tr>
                            ) : (
                                filteredCommissions.map((commission) => (
                                    <tr key={commission._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{commission.partnerName}</p>
                                            <p className="text-xs text-gray-500">{commission.partnerId}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="badge bg-primary-100 text-primary-700">
                                                {commission.serviceType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">₹{commission.grossAmount?.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-red-600">-₹{commission.tds?.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-bold text-emerald-600">₹{commission.netAmount?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${getStatusBadge(commission.status)}`}>
                                                {commission.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(commission.createdAt).toLocaleDateString()}
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
