'use client';
import { useState, useEffect } from 'react';
import { Coins, Download, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function CommissionsPage() {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        paid: 0
    });

    useEffect(() => {
        fetchCommissions();
    }, []);

    const fetchCommissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/partners/commissions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const list = data.commissions || [];
                setCommissions(list);

                // Calculate stats
                const total = list.reduce((sum, item) => sum + (item.commissionAfterGST || 0), 0);
                // Assuming status 'ACTIVE' means ready for payout, 'PAID' would be a future status
                const pending = list.filter(item => item.commissionStatus === 'PENDING').reduce((sum, item) => sum + (item.commissionAfterGST || 0), 0);
                const paid = list.filter(item => item.commissionStatus === 'PAID').reduce((sum, item) => sum + (item.commissionAfterGST || 0), 0);

                setStats({ total, pending, paid });
            }
        } catch (error) {
            console.error('Error fetching commissions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
                    <p className="text-gray-500">Track your earnings and payouts</p>
                </div>
                <button className="btn-secondary flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Total Earnings</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-700">₹{stats.total.toLocaleString()}</p>
                    <p className="text-xs text-emerald-600 mt-1">Net after GST deduction</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Pending Payout</span>
                    </div>
                    <p className="text-3xl font-bold text-amber-700">₹{stats.pending.toLocaleString()}</p>
                    <p className="text-xs text-amber-600 mt-1">Processing within 15 days</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Total Paid</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">₹{stats.paid.toLocaleString()}</p>
                    <p className="text-xs text-blue-600 mt-1">Deposited to bank</p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h3 className="font-semibold text-gray-800">Earnings History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Service ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">GST Deduction</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Net Earnings</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {commissions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No commission records found
                                    </td>
                                </tr>
                            ) : (
                                commissions.map((item) => (
                                    <tr key={item.serviceId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono text-sm">{item.serviceId}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            ₹{item.commissionBeforeGST?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-red-500">
                                            -₹{item.gstAmount?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-emerald-600">
                                            ₹{item.commissionAfterGST?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${item.commissionStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {item.commissionStatus || 'PENDING'}
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
