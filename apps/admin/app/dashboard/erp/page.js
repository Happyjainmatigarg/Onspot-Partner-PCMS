'use client';
import { useState, useEffect } from 'react';
import { Building2, Users, Package, ShoppingCart, Wallet, TrendingUp, IndianRupee, AlertTriangle } from 'lucide-react';

export default function ERPDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const res = await fetch('/api/admin/erp/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error('ERP Dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

    const e = data?.employees || {};
    const r = data?.resources || {};
    const inv = data?.inventory || {};
    const fin = data?.finance || {};

    const StatCard = ({ label, value, icon: Icon, color = 'blue', sub }) => (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{label}</span>
                <div className={`w-9 h-9 rounded-lg bg-${color}-100 flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 text-${color}-600`} />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">ERP / ERM Dashboard</h1>
                <p className="text-gray-500">Enterprise Resource & Employee Management Overview</p>
            </div>

            {/* Top-level Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Employees" value={e.total || 0} icon={Users} color="blue" sub={`${e.active || 0} active, ${e.onLeave || 0} on leave`} />
                <StatCard label="Total Resources" value={r.total || 0} icon={Package} color="purple" sub={`${r.available || 0} available`} />
                <StatCard label="Inventory Items" value={inv.totalItems || 0} icon={ShoppingCart} color="orange" sub={`${inv.lowStock || 0} low stock`} />
                <StatCard label="Net Profit" value={`₹${(fin.netProfit || 0).toLocaleString('en-IN')}`} icon={IndianRupee} color="emerald" />
            </div>

            {/* Finance Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Income" value={`₹${(fin.totalIncome || 0).toLocaleString('en-IN')}`} icon={TrendingUp} color="green" />
                <StatCard label="Total Expenses" value={`₹${(fin.totalExpenses || 0).toLocaleString('en-IN')}`} icon={Wallet} color="red" />
                <StatCard label="Monthly Salary" value={`₹${(e.totalMonthlySalary || 0).toLocaleString('en-IN')}`} icon={Users} color="indigo" />
                <StatCard label="Asset Value" value={`₹${(r.totalValue || 0).toLocaleString('en-IN')}`} icon={Package} color="teal" />
            </div>

            {/* Department & Alerts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employees by Department */}
                <div className="bg-white rounded-xl p-5 shadow-sm border">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" /> Employees by Department
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(e.byDepartment || {}).map(([dept, count]) => (
                            <div key={dept} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                                <span className="text-sm text-gray-600">{dept}</span>
                                <span className="text-sm font-bold text-gray-800 bg-blue-50 px-2 py-0.5 rounded">{count}</span>
                            </div>
                        ))}
                        {Object.keys(e.byDepartment || {}).length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No employees yet</p>
                        )}
                    </div>
                </div>

                {/* Alerts */}
                <div className="bg-white rounded-xl p-5 shadow-sm border">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Alerts & Notifications
                    </h3>
                    <div className="space-y-3">
                        {(inv.lowStock || 0) > 0 && (
                            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800">Low Stock Alert</p>
                                    <p className="text-xs text-amber-600">{inv.lowStock} items need restocking</p>
                                </div>
                            </div>
                        )}
                        {(inv.outOfStock || 0) > 0 && (
                            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-800">Out of Stock</p>
                                    <p className="text-xs text-red-600">{inv.outOfStock} items out of stock</p>
                                </div>
                            </div>
                        )}
                        {(r.underMaintenance || 0) > 0 && (
                            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                <Package className="w-4 h-4 text-blue-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Under Maintenance</p>
                                    <p className="text-xs text-blue-600">{r.underMaintenance} resources in maintenance</p>
                                </div>
                            </div>
                        )}
                        {(inv.lowStock || 0) === 0 && (inv.outOfStock || 0) === 0 && (r.underMaintenance || 0) === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">All systems normal ✓</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
