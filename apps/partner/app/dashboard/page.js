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

            {/* Recent Sales & Chart */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-2 dashboard-card">
                    <h2 className="font-display text-lg font-bold text-primary-600 mb-6">Monthly Sales Trend</h2>

                    {data.monthlySales?.length > 0 ? (
                        <div className="h-64 flex items-end justify-between gap-2 sm:gap-4">
                            {(() => {
                                const maxSales = Math.max(...data.monthlySales.map(d => d.sales), 100); // Avoid div by 0
                                return data.monthlySales.map((item, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                        <div className="relative w-full flex justify-center items-end h-full">
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                                                ₹{item.sales.toLocaleString()} ({item.count} sales)
                                            </div>

                                            {/* Bar */}
                                            <div
                                                className="w-full max-w-[40px] bg-primary-500 rounded-t-sm hover:bg-primary-600 transition-all relative"
                                                style={{ height: `${(item.sales / maxSales) * 100}%`, minHeight: '4px' }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-slate-500 font-medium">{item.month}</span>
                                    </div>
                                ));
                            })()}
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg">
                            <p>No sales data available yet</p>
                        </div>
                    )}
                </div>

                {/* Recent Sales List (Compact) */}
                <div className="dashboard-card overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display text-lg font-bold text-primary-600">Recent Sales</h2>
                        <span className="text-xs font-medium text-slate-500">{data.recentSales?.length || 0} recent</span>
                    </div>

                    {data.recentSales?.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-8">
                            <ShoppingCart className="w-10 h-10 mb-2 text-slate-300" />
                            <p className="text-sm">No sales yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-y-auto pr-1 flex-1 -mx-4 px-4">
                            <div className="space-y-3">
                                {data.recentSales?.map((sale, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div>
                                            <p className="font-medium text-slate-800 text-sm truncate max-w-[120px]">{sale.customerName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-mono text-slate-400">{sale.serviceType}</span>
                                                <span className={`w-1.5 h-1.5 rounded-full ${sale.status === 'ACTIVE' ? 'bg-emerald-500' :
                                                        sale.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'
                                                    }`}></span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary-600 text-sm">₹{sale.serviceCost?.toLocaleString()}</p>
                                            <p className="text-[10px] text-emerald-600 font-medium">+₹{sale.commissionAfterGST?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
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
