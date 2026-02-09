'use client';
import { useState, useEffect } from 'react';
import { Coins, Search, TrendingUp, Download, Check, Calendar, Filter, Users } from 'lucide-react';
import Link from 'next/link';

export default function CommissionsPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('unpaid');
    const [partnerFilter, setPartnerFilter] = useState('');
    const [selected, setSelected] = useState([]);
    const [groupBy, setGroupBy] = useState('service');  // 'service' or 'partner'

    // Mark as paid modal
    const [showPayModal, setShowPayModal] = useState(false);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentRef, setPaymentRef] = useState('');
    const [paymentMode, setPaymentMode] = useState('BANK_TRANSFER');
    const [paymentNotes, setPaymentNotes] = useState('');

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
            setServices(Array.isArray(data) ? data : data.commissions || []);
        } catch (err) {
            console.error('Error fetching commissions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaid = async () => {
        if (!paymentRef || !paymentDate) {
            alert('Please enter payment reference and date');
            return;
        }

        if (selected.length === 0) {
            alert('Please select commissions to mark as paid');
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/commissions/mark-paid', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    serviceIds: selected,
                    paymentDate,
                    ref: paymentRef,
                    mode: paymentMode,
                    notes: paymentNotes
                })
            });

            if (res.ok) {
                alert('Commissions marked as paid successfully!');
                setSelected([]);
                setShowPayModal(false);
                fetchCommissions();
            } else {
                throw new Error('Failed to mark as paid');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const toggleSelect = (serviceId) => {
        setSelected(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const toggleSelectAll = () => {
        if (selected.length === filteredServices.length) {
            setSelected([]);
        } else {
            setSelected(filteredServices.map(s => s.serviceId));
        }
    };

    const getStatusBadge = (paid) => {
        return paid
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-amber-100 text-amber-700';
    };

    const filteredServices = services.filter(s => {
        if (filter === 'paid' && !s.commissionPaid) return false;
        if (filter === 'unpaid' && s.commissionPaid) return false;
        if (partnerFilter && !s.partnerId?.toLowerCase().includes(partnerFilter.toLowerCase())) return false;
        return true;
    });

    const totalUnpaid = services
        .filter(s => !s.commissionPaid)
        .reduce((sum, s) => sum + (s.commissionAfterGST || 0), 0);

    const totalPaid = services
        .filter(s => s.commissionPaid)
        .reduce((sum, s) => sum + (s.commissionAfterGST || 0), 0);

    const selectedTotal = selected
        .map(id => services.find(s => s.serviceId === id))
        .reduce((sum, s) => sum + (s?.commissionAfterGST || 0), 0);

    // Group by partner
    const groupedByPartner = filteredServices.reduce((acc, service) => {
        const partnerId = service.partnerId || 'Unknown';
        if (!acc[partnerId]) {
            acc[partnerId] = {
                services: [],
                total: 0,
                unpaidTotal: 0,
                count: 0
            };
        }
        acc[partnerId].services.push(service);
        acc[partnerId].total += service.commissionAfterGST || 0;
        acc[partnerId].count += 1;
        if (!service.commissionPaid) {
            acc[partnerId].unpaidTotal += service.commissionAfterGST || 0;
        }
        return acc;
    }, {});

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
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Coins className="w-7 h-7 text-amber-500" />
                        Commission Management
                    </h1>
                    <p className="text-gray-500">Track and manage partner commission payments</p>
                </div>
                <button className="btn-secondary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export to Excel
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Total Services</p>
                    <p className="text-2xl font-bold">{services.length}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-sm text-amber-600">Unpaid Commissions</p>
                    <p className="text-2xl font-bold text-amber-700">₹{totalUnpaid.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-amber-600 mt-1">{services.filter(s => !s.commissionPaid).length} services</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-sm text-emerald-600">Paid Commissions</p>
                    <p className="text-2xl font-bold text-emerald-700">₹{totalPaid.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-emerald-600 mt-1">{services.filter(s => s.commissionPaid).length} services</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-600">Total Commission</p>
                    <p className="text-2xl font-bold text-blue-700">₹{(totalUnpaid + totalPaid).toLocaleString('en-IN')}</p>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-4">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="input-field w-auto"
                        >
                            <option value="all">All</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                        </select>

                        <select
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                            className="input-field w-auto"
                        >
                            <option value="service">Group by Service</option>
                            <option value="partner">Group by Partner</option>
                        </select>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by partner ID..."
                                value={partnerFilter}
                                onChange={(e) => setPartnerFilter(e.target.value)}
                                className="input-field pl-10 w-64"
                            />
                        </div>
                    </div>

                    {selected.length > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                                {selected.length} selected • ₹{selectedTotal.toLocaleString('en-IN')}
                            </span>
                            <button
                                onClick={() => setShowPayModal(true)}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Mark as Paid
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Table or Grouped View */}
            {groupBy === 'service' ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selected.length === filteredServices.filter(s => !s.commissionPaid).length}
                                            onChange={toggleSelectAll}
                                            className="rounded"
                                        />
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Service ID</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Partner</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Service</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Cost</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Commission</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredServices.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                            No commissions found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredServices.map((service) => (
                                        <tr key={service._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                {!service.commissionPaid && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.includes(service.serviceId)}
                                                        onChange={() => toggleSelect(service.serviceId)}
                                                        className="rounded"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm">{service.serviceId}</td>
                                            <td className="px-6 py-4 text-sm">{service.partnerId}</td>
                                            <td className="px-6 py-4 text-sm">{service.customerId}</td>
                                            <td className="px-6 py-4">
                                                <span className="badge bg-blue-100 text-blue-700">
                                                    {service.serviceType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium">₹{(service.serviceCost || 0).toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-emerald-600">₹{(service.commissionAfterGST || 0).toLocaleString('en-IN')}</p>
                                                    <p className="text-xs text-gray-500">{service.commissionPercentage}%</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${getStatusBadge(service.commissionPaid)}`}>
                                                    {service.commissionPaid ? 'Paid' : 'Unpaid'}
                                                </span>
                                                {service.commissionPaid && service.commissionPaidDate && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(service.commissionPaidDate).toLocaleDateString('en-IN')}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(service.activatedAt || service.createdAt).toLocaleDateString('en-IN')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(groupedByPartner).map(([partnerId, data]) => (
                        <div key={partnerId} className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Partner: {partnerId}</h3>
                                        <p className="text-sm text-gray-500">{data.count} services • Total: ₹{data.total.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                {data.unpaidTotal > 0 && (
                                    <div className="text-right">
                                        <p className="text-sm text-amber-600">Unpaid</p>
                                        <p className="font-bold text-amber-700">₹{data.unpaidTotal.toLocaleString('en-IN')}</p>
                                    </div>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {data.services.map((service) => (
                                            <tr key={service._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-3 font-mono text-sm">{service.serviceId}</td>
                                                <td className="px-6 py-3 text-sm">{service.customerId}</td>
                                                <td className="px-6 py-3">
                                                    <span className="badge bg-blue-100 text-blue-700">{service.serviceType}</span>
                                                </td>
                                                <td className="px-6 py-3 font-bold text-emerald-600">
                                                    ₹{(service.commissionAfterGST || 0).toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`badge ${getStatusBadge(service.commissionPaid)}`}>
                                                        {service.commissionPaid ? 'Paid' : 'Unpaid'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Payment Modal */}
            {showPayModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Mark Commissions as Paid</h3>

                        <div className="mb-4 p-4 bg-amber-50 rounded-lg">
                            <p className="text-sm text-amber-800">
                                <strong>{selected.length}</strong> commission(s) selected
                            </p>
                            <p className="text-xl font-bold text-amber-900 mt-1">
                                Total: ₹{selectedTotal.toLocaleString('en-IN')}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                                <input
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference *</label>
                                <input
                                    type="text"
                                    value={paymentRef}
                                    onChange={(e) => setPaymentRef(e.target.value)}
                                    placeholder="UTR/Transaction ID"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                                <select
                                    value={paymentMode}
                                    onChange={(e) => setPaymentMode(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                    <option value="UPI">UPI</option>
                                    <option value="CHEQUE">Cheque</option>
                                    <option value="CASH">Cash</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={paymentNotes}
                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                    className="input-field"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowPayModal(false)}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMarkAsPaid}
                                className="btn-primary flex-1"
                            >
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
