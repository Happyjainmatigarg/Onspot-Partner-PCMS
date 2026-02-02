'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingCart, IndianRupee, Clock } from 'lucide-react';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        totalSales: 0,
        totalCustomers: 0,
        totalCommission: 0,
        pendingCommission: 0,
        recentSales: []
    });

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('/api/partners/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            if (res.ok) {
                setData(json);
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: 'Total Sales',
            value: data.totalSales,
            icon: ShoppingCart,
            color: 'primary'
        },
        {
            label: 'Total Customers',
            value: data.totalCustomers,
            icon: Users,
            color: 'gold'
        },
        {
            label: 'Total Commission',
            value: `₹${(data.totalCommission || 0).toLocaleString('en-IN')}`,
            icon: IndianRupee,
            color: 'emerald'
        },
        {
            label: 'Pending Commission',
            value: `₹${(data.pendingCommission || 0).toLocaleString('en-IN')}`,
            icon: Clock,
            color: 'amber'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="font-display text-2xl font-bold text-primary-600">Dashboard</h1>
                <p className="text-slate-500">Welcome back! Here's your performance overview.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <div key={i} className="dashboard-card">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-slate-500">{card.label}</span>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color === 'primary' ? 'bg-primary-100' :
                                    card.color === 'gold' ? 'bg-gold-100' :
                                        card.color === 'emerald' ? 'bg-emerald-100' :
                                            'bg-amber-100'
                                }`}>
                                <card.icon className={`w-5 h-5 ${card.color === 'primary' ? 'text-primary-600' :
                                        card.color === 'gold' ? 'text-gold-600' :
                                            card.color === 'emerald' ? 'text-emerald-600' :
                                                'text-amber-600'
                                    }`} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-primary-600">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Sales */}
            <div className="dashboard-card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg font-bold text-primary-600">Recent Sales</h2>
                    <span className="badge badge-info">{data.recentSales?.length || 0} sales</span>
                </div>

                {data.recentSales?.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                        <p>No sales yet. Start by registering your first customer!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="table-header">
                                <tr>
                                    <th className="px-4 py-3 text-left">Customer</th>
                                    <th className="px-4 py-3 text-left">Service</th>
                                    <th className="px-4 py-3 text-left">Amount</th>
                                    <th className="px-4 py-3 text-left">Commission</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentSales?.map((sale, i) => (
                                    <tr key={i} className="table-row">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-800">{sale.customerName}</p>
                                            <p className="text-xs text-slate-500 font-mono">{sale.customerId}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="badge badge-info">{sale.serviceType}</span>
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            ₹{(sale.serviceCost || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-emerald-600 font-medium">
                                                ₹{(sale.commission || 0).toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`badge ${sale.status === 'ACTIVE' ? 'badge-success' :
                                                    sale.status === 'PENDING' ? 'badge-warning' :
                                                        'badge-danger'
                                                }`}>
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-500">
                                            {new Date(sale.date).toLocaleDateString('en-IN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="dashboard-card bg-gold-50 border-gold-200">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-gold-800 mb-1">View Only Dashboard</h3>
                        <p className="text-sm text-gold-700">
                            This dashboard provides a read-only view of your sales and commissions.
                            Customer registrations are done through the Customer App using your Partner ID.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
