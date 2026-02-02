'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users, ShoppingCart, IndianRupee, Clock, TrendingUp,
    CheckCircle, XCircle, Eye
} from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({});
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        try {
            const [summaryRes, pendingRes, activitiesRes] = await Promise.all([
                fetch('/api/admin/dashboard/summary', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/dashboard/pending-approvals', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/dashboard/recent-activities', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const [summaryData, pendingData, activitiesData] = await Promise.all([
                summaryRes.json(),
                pendingRes.json(),
                activitiesRes.json()
            ]);

            setSummary(summaryData);
            setPendingApprovals(pendingData.pendingApprovals || []);
            setActivities(activitiesData.activities || []);
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Partners', value: summary.totalPartners || 0, icon: Users, color: 'blue' },
        { label: 'Total Customers', value: summary.totalCustomers || 0, icon: Users, color: 'green' },
        { label: 'Pending Approvals', value: summary.pendingApprovals || 0, icon: Clock, color: 'yellow', highlight: true },
        { label: 'Active Services', value: summary.activeServices || 0, icon: ShoppingCart, color: 'purple' },
        { label: 'Total Revenue', value: `₹${(summary.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'emerald' },
        { label: 'This Month Revenue', value: `₹${(summary.thisMonthRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'teal' },
        { label: 'This Month Services', value: summary.thisMonthServices || 0, icon: ShoppingCart, color: 'indigo' },
        { label: 'Commission Payable', value: `₹${(summary.commissionPayable || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'orange' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500">Overview of OnSpot™ ecosystem</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <div key={i} className={`card ${card.highlight && card.value > 0 ? 'ring-2 ring-yellow-400' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">{card.label}</span>
                            <div className={`w-8 h-8 rounded-lg bg-${card.color}-100 flex items-center justify-center`}>
                                <card.icon className={`w-4 h-4 text-${card.color}-600`} />
                            </div>
                        </div>
                        <p className="text-xl font-bold text-gray-800">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Pending Approvals */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Pending Approvals</h2>
                    <span className="badge badge-warning">{pendingApprovals.length} pending</span>
                </div>

                {pendingApprovals.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                        <p>All caught up! No pending approvals.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left text-sm text-gray-500">
                                    <th className="pb-3">Customer</th>
                                    <th className="pb-3">Partner</th>
                                    <th className="pb-3">Device</th>
                                    <th className="pb-3">Service</th>
                                    <th className="pb-3">Cost</th>
                                    <th className="pb-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingApprovals.slice(0, 5).map((item) => (
                                    <tr key={item.customerId} className="border-b last:border-0">
                                        <td className="py-3">
                                            <p className="font-medium">{item.customerName}</p>
                                            <p className="text-xs text-gray-500">{item.customerId}</p>
                                        </td>
                                        <td className="py-3 text-sm">
                                            {item.partner?.applicantName || 'N/A'}
                                        </td>
                                        <td className="py-3 text-sm">
                                            {item.product?.productType || 'N/A'}
                                        </td>
                                        <td className="py-3">
                                            <span className="badge badge-info">{item.service?.serviceType}</span>
                                        </td>
                                        <td className="py-3 font-medium">
                                            ₹{(item.service?.serviceCost || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td className="py-3">
                                            <button
                                                onClick={() => router.push(`/dashboard/customers/${item.customerId}`)}
                                                className="btn-primary text-xs py-1 px-2 flex items-center gap-1"
                                            >
                                                <Eye className="w-3 h-3" /> Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            <div className="card">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                    {activities.slice(0, 10).map((activity, i) => (
                        <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.action === 'CREATE' ? 'bg-green-100 text-green-600' :
                                    activity.action === 'LOGIN' ? 'bg-blue-100 text-blue-600' :
                                        activity.action === 'APPROVE' ? 'bg-emerald-100 text-emerald-600' :
                                            activity.action === 'REJECT' ? 'bg-red-100 text-red-600' :
                                                'bg-gray-100 text-gray-600'
                                }`}>
                                <span className="text-xs font-bold">{activity.action?.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm">
                                    <span className="font-medium">{activity.action}</span>
                                    {' '}
                                    <span className="text-gray-500">{activity.entity}</span>
                                    {' '}
                                    <span className="font-mono text-xs text-gray-400">{activity.entityId}</span>
                                </p>
                                <p className="text-xs text-gray-500">
                                    {activity.performedBy} • {new Date(activity.timestamp).toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
