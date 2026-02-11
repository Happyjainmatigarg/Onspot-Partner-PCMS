'use client';
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, ShoppingCart, MapPin, Download, Calendar, IndianRupee, Coins } from 'lucide-react';

const API = (path) => `/api/admin/reports/${path}`;
const getToken = () => localStorage.getItem('adminToken');
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

export default function ReportsPage() {
    const [activeReport, setActiveReport] = useState('monthly-trend');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const reports = [
        { id: 'monthly-trend', label: 'Monthly Trend', icon: TrendingUp },
        { id: 'partner-performance', label: 'Partner Performance', icon: Users },
        { id: 'customer-registration', label: 'Customer Registration', icon: Users },
        { id: 'service-activation', label: 'Service Activation', icon: ShoppingCart },
        { id: 'commission', label: 'Commission Analysis', icon: Coins },
        { id: 'revenue', label: 'Revenue Breakdown', icon: IndianRupee },
        { id: 'product-category', label: 'Product Categories', icon: ShoppingCart },
        { id: 'city-distribution', label: 'City Distribution', icon: MapPin }
    ];

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateFrom) params.set('dateFrom', dateFrom);
            if (dateTo) params.set('dateTo', dateTo);
            const res = await fetch(`${API(activeReport)}?${params}`, { headers: authHeaders() });
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error('Report fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReport(); }, [activeReport]);

    const exportReport = async () => {
        try {
            await fetch('/api/admin/reports/export', {
                method: 'POST',
                headers: { ...authHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportType: activeReport, format: 'json', filters: { dateFrom, dateTo } })
            });
            // Download as JSON
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${activeReport}-${new Date().toISOString().slice(0, 10)}.json`;
            a.click(); URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export error:', err);
        }
    };

    const renderBarChart = (dataObj, label = 'Count') => {
        if (!dataObj || Object.keys(dataObj).length === 0) return <p className="text-gray-500 text-sm">No data available</p>;
        const max = Math.max(...Object.values(dataObj), 1);
        return (
            <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium mb-3">{label}</p>
                {Object.entries(dataObj).sort((a, b) => b[1] - a[1]).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-28 truncate text-right">{key}</span>
                        <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                style={{ width: `${Math.max((val / max) * 100, 8)}%` }}
                            >
                                <span className="text-xs font-bold text-white">{typeof val === 'number' && val > 999 ? `₹${val.toLocaleString('en-IN')}` : val}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const StatCard = ({ label, value, icon: Icon, color = 'blue' }) => (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{label}</span>
                <div className={`w-9 h-9 rounded-lg bg-${color}-100 flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 text-${color}-600`} />
                </div>
            </div>
            <p className="text-xl font-bold text-gray-800">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
        </div>
    );

    const renderReport = () => {
        if (!data) return null;
        switch (activeReport) {
            case 'monthly-trend':
                const trend = data.trend || {};
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {Object.entries(trend).map(([month, stats]) => (
                                <div key={month} className="bg-white rounded-xl p-4 shadow-sm border">
                                    <p className="text-xs text-gray-500 font-medium mb-3">{month}</p>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="text-blue-600 font-bold">{stats.partners}</span> <span className="text-gray-400">partners</span></p>
                                        <p><span className="text-green-600 font-bold">{stats.customers}</span> <span className="text-gray-400">customers</span></p>
                                        <p><span className="text-purple-600 font-bold">{stats.services}</span> <span className="text-gray-400">services</span></p>
                                        <p className="text-xs font-medium text-emerald-600">₹{stats.revenue?.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {renderBarChart(
                            Object.fromEntries(Object.entries(trend).map(([k, v]) => [k, v.revenue])),
                            'Revenue by Month'
                        )}
                    </div>
                );
            case 'partner-performance':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard label="Total Partners" value={data.total || 0} icon={Users} />
                            <StatCard label="Total Revenue" value={`₹${(data.report?.reduce((s, r) => s + r.totalRevenue, 0) || 0).toLocaleString('en-IN')}`} icon={IndianRupee} color="emerald" />
                        </div>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Partner</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tier</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Customers</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Services</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Commission</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {(data.report || []).slice(0, 20).map(r => (
                                        <tr key={r.partnerId} className="hover:bg-gray-50">
                                            <td className="px-4 py-3"><p className="font-medium text-sm">{r.applicantName}</p><p className="text-xs text-gray-400">{r.partnerId}</p></td>
                                            <td className="px-4 py-3"><span className="badge bg-blue-100 text-blue-700">{r.partnerType}</span></td>
                                            <td className="px-4 py-3 text-sm">{r.totalCustomers}</td>
                                            <td className="px-4 py-3 text-sm">{r.totalServices}</td>
                                            <td className="px-4 py-3 text-sm font-medium">₹{r.totalRevenue?.toLocaleString('en-IN')}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-emerald-600">₹{r.totalCommission?.toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'customer-registration':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard label="Total Customers" value={data.total || 0} icon={Users} />
                            {Object.entries(data.byStatus || {}).map(([status, count]) => (
                                <StatCard key={status} label={status} value={count} icon={Users} color={status === 'APPROVED' ? 'emerald' : status === 'PENDING' ? 'amber' : 'red'} />
                            ))}
                        </div>
                        {renderBarChart(data.byMonth, 'Registrations by Month')}
                    </div>
                );
            case 'service-activation':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard label="Active Services" value={data.total || 0} icon={ShoppingCart} color="purple" />
                            <StatCard label="Total Revenue" value={`₹${(data.totalRevenue || 0).toLocaleString('en-IN')}`} icon={IndianRupee} color="emerald" />
                        </div>
                        {renderBarChart(data.byType, 'By Service Type')}
                        {renderBarChart(data.byMonth, 'By Month')}
                    </div>
                );
            case 'commission':
                return (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <StatCard label="Total Commission" value={`₹${(data.totalCommission || 0).toLocaleString('en-IN')}`} icon={Coins} color="emerald" />
                        <StatCard label="Total GST" value={`₹${(data.totalGST || 0).toLocaleString('en-IN')}`} icon={IndianRupee} color="orange" />
                        <StatCard label="Paid" value={`₹${(data.totalPaid || 0).toLocaleString('en-IN')}`} icon={Coins} color="green" />
                        <StatCard label="Unpaid" value={`₹${(data.totalUnpaid || 0).toLocaleString('en-IN')}`} icon={Coins} color="red" />
                        <StatCard label="Paid Count" value={data.paidCount || 0} icon={ShoppingCart} color="blue" />
                        <StatCard label="Unpaid Count" value={data.unpaidCount || 0} icon={ShoppingCart} color="amber" />
                    </div>
                );
            case 'revenue':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <StatCard label="Total Revenue" value={`₹${(data.totalRevenue || 0).toLocaleString('en-IN')}`} icon={IndianRupee} color="emerald" />
                            <StatCard label="Total Services" value={data.serviceCount || 0} icon={ShoppingCart} color="purple" />
                        </div>
                        {renderBarChart(data.byServiceType, 'Revenue by Service Type')}
                        {renderBarChart(data.byMonth, 'Revenue by Month')}
                    </div>
                );
            case 'product-category':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <StatCard label="Total Products" value={data.total || 0} icon={ShoppingCart} color="purple" />
                            <StatCard label="Avg Value" value={`₹${(data.averageValue || 0).toLocaleString('en-IN')}`} icon={IndianRupee} color="blue" />
                        </div>
                        {renderBarChart(data.byType, 'By Product Type')}
                        {renderBarChart(data.byBrand, 'By Brand')}
                    </div>
                );
            case 'city-distribution':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl p-5 shadow-sm border">
                                <h3 className="text-sm font-bold text-gray-700 mb-4">Partners by City</h3>
                                {renderBarChart(data.partnersByCity, 'Partners')}
                            </div>
                            <div className="bg-white rounded-xl p-5 shadow-sm border">
                                <h3 className="text-sm font-bold text-gray-700 mb-4">Customers by City</h3>
                                {renderBarChart(data.customersByCity, 'Customers')}
                            </div>
                        </div>
                    </div>
                );
            default:
                return <p className="text-gray-500">Select a report type</p>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
                    <p className="text-gray-500">Comprehensive business insights</p>
                </div>
                <button onClick={exportReport} className="btn-primary flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export
                </button>
            </div>

            {/* Report Type Tabs */}
            <div className="bg-white rounded-xl shadow-sm p-2 flex flex-wrap gap-1">
                {reports.map(r => (
                    <button
                        key={r.id}
                        onClick={() => setActiveReport(r.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeReport === r.id
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <r.icon className="w-4 h-4" />
                        <span className="hidden md:inline">{r.label}</span>
                    </button>
                ))}
            </div>

            {/* Date Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="text-xs text-gray-500 font-medium">From</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field" />
                </div>
                <div>
                    <label className="text-xs text-gray-500 font-medium">To</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field" />
                </div>
                <button onClick={fetchReport} className="btn-secondary flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Apply Filter
                </button>
            </div>

            {/* Report Content */}
            <div className="min-h-[300px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : renderReport()}
            </div>
        </div>
    );
}
