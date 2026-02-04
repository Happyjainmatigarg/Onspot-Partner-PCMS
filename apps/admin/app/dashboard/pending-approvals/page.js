'use client';
import { useState, useEffect } from 'react';
import { Clock, Search, Check, X, Eye, Users, ShoppingCart, FileText } from 'lucide-react';
import Link from 'next/link';

export default function PendingApprovalsPage() {
    const [pendingPartners, setPendingPartners] = useState([]);
    const [pendingServices, setPendingServices] = useState([]);
    const [pendingCustomers, setPendingCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('partners');

    useEffect(() => {
        fetchPendingItems();
    }, []);

    const fetchPendingItems = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch pending partners
            const partnersRes = await fetch('/api/admin/partners', { headers });
            const partnersData = await partnersRes.json().catch(() => []);
            const allPartners = Array.isArray(partnersData) ? partnersData : partnersData.partners || [];
            setPendingPartners(allPartners.filter(p => p.status === 'PENDING'));

            // Fetch pending services
            const servicesRes = await fetch('/api/admin/services', { headers });
            const servicesData = await servicesRes.json().catch(() => []);
            const allServices = Array.isArray(servicesData) ? servicesData : servicesData.services || [];
            setPendingServices(allServices.filter(s => s.status === 'PENDING'));

            // Fetch pending customers
            const customersRes = await fetch('/api/admin/customers', { headers });
            const customersData = await customersRes.json().catch(() => []);
            const allCustomers = Array.isArray(customersData) ? customersData : customersData.customers || [];
            setPendingCustomers(allCustomers.filter(c => c.status === 'PENDING'));

        } catch (err) {
            console.error('Error fetching pending items:', err);
        } finally {
            setLoading(false);
        }
    };

    const updatePartnerStatus = async (partnerId, status) => {
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
            fetchPendingItems();
        } catch (err) {
            console.error('Error updating partner status:', err);
        }
    };

    const updateServiceStatus = async (serviceId, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await fetch(`/api/admin/services/${serviceId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            fetchPendingItems();
        } catch (err) {
            console.error('Error updating service status:', err);
        }
    };

    const updateCustomerStatus = async (customerId, status) => {
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
            fetchPendingItems();
        } catch (err) {
            console.error('Error updating customer status:', err);
        }
    };

    const totalPending = pendingPartners.length + pendingServices.length + pendingCustomers.length;

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
                        <Clock className="w-7 h-7 text-amber-500" />
                        Pending Approvals
                    </h1>
                    <p className="text-gray-500">Review and approve pending registrations and services</p>
                </div>
                <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-bold text-lg">
                    {totalPending} Pending
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div
                    onClick={() => setActiveTab('partners')}
                    className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${activeTab === 'partners' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white hover:border-amber-300'}`}
                >
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-amber-500" />
                        <div>
                            <p className="text-sm text-gray-500">Partners</p>
                            <p className="text-2xl font-bold text-amber-700">{pendingPartners.length}</p>
                        </div>
                    </div>
                </div>
                <div
                    onClick={() => setActiveTab('services')}
                    className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${activeTab === 'services' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white hover:border-amber-300'}`}
                >
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-amber-500" />
                        <div>
                            <p className="text-sm text-gray-500">Services</p>
                            <p className="text-2xl font-bold text-amber-700">{pendingServices.length}</p>
                        </div>
                    </div>
                </div>
                <div
                    onClick={() => setActiveTab('customers')}
                    className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${activeTab === 'customers' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white hover:border-amber-300'}`}
                >
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-amber-500" />
                        <div>
                            <p className="text-sm text-gray-500">Customers</p>
                            <p className="text-2xl font-bold text-amber-700">{pendingCustomers.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Partners Table */}
            {activeTab === 'partners' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b bg-gray-50">
                        <h2 className="font-semibold text-gray-800">Pending Partner Registrations</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Partner ID</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Tier</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Registered</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {pendingPartners.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No pending partner approvals
                                        </td>
                                    </tr>
                                ) : (
                                    pendingPartners.map((partner) => (
                                        <tr key={partner._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-mono text-sm">{partner.partnerId}</td>
                                            <td className="px-6 py-4">{partner.applicantName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{partner.email}</td>
                                            <td className="px-6 py-4">
                                                <span className="badge bg-blue-100 text-blue-700">{partner.partnerType}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(partner.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updatePartnerStatus(partner._id, 'APPROVED')}
                                                        className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200"
                                                        title="Approve"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => updatePartnerStatus(partner._id, 'REJECTED')}
                                                        className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                        title="Reject"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <Link href={`/dashboard/partners/${partner._id}`} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200" title="View">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pending Services Table */}
            {activeTab === 'services' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b bg-gray-50">
                        <h2 className="font-semibold text-gray-800">Pending Service Approvals</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Service ID</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Partner</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Created</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {pendingServices.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No pending service approvals
                                        </td>
                                    </tr>
                                ) : (
                                    pendingServices.map((service) => (
                                        <tr key={service._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-mono text-sm">{service.serviceId || service._id}</td>
                                            <td className="px-6 py-4">{service.customerName || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm">{service.partnerId}</td>
                                            <td className="px-6 py-4 font-medium">₹{service.serviceCost?.toLocaleString() || 0}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(service.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateServiceStatus(service._id, 'APPROVED')}
                                                        className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200"
                                                        title="Approve"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateServiceStatus(service._id, 'REJECTED')}
                                                        className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                        title="Reject"
                                                    >
                                                        <X className="w-4 h-4" />
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
            )}

            {/* Pending Customers Table */}
            {activeTab === 'customers' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b bg-gray-50">
                        <h2 className="font-semibold text-gray-800">Pending Customer Registrations</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Customer ID</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Mobile</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Registered</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {pendingCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No pending customer approvals
                                        </td>
                                    </tr>
                                ) : (
                                    pendingCustomers.map((customer) => (
                                        <tr key={customer._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-mono text-sm">{customer.customerId || customer._id}</td>
                                            <td className="px-6 py-4">{customer.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{customer.email}</td>
                                            <td className="px-6 py-4">{customer.mobile}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(customer.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateCustomerStatus(customer._id, 'APPROVED')}
                                                        className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200"
                                                        title="Approve"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateCustomerStatus(customer._id, 'REJECTED')}
                                                        className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                        title="Reject"
                                                    >
                                                        <X className="w-4 h-4" />
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
            )}
        </div>
    );
}
