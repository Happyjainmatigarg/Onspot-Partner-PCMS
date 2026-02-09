'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Check, X, Shield, Mail, Phone, MapPin, Building,
    FileText, Download, Users, ShoppingCart, IndianRupee, TrendingUp,
    Calendar, Eye
} from 'lucide-react';
import Link from 'next/link';

export default function PartnerDetailPage({ params }) {
    const router = useRouter();
    const { id } = params;
    const [partner, setPartner] = useState(null);
    const [stats, setStats] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchPartnerDetails();
        fetchPartnerCustomers();
    }, [id]);

    const fetchPartnerDetails = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`/api/admin/partners/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPartner(data.partner);
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Error fetching partner details:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPartnerCustomers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`/api/admin/customers?partner=${id}&limit=10`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCustomers(data.customers || []);
            }
        } catch (err) {
            console.error('Error fetching customers:', err);
        }
    };

    const updateStatus = async (status) => {
        const reason = status === 'REJECTED' ? prompt('Enter rejection reason:') : null;
        if (status === 'REJECTED' && !reason) return;

        try {
            const token = localStorage.getItem('adminToken');
            await fetch(`/api/admin/partners/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status, reason })
            });
            fetchPartnerDetails();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'APPROVED': 'bg-emerald-100 text-emerald-700',
            'ACTIVE': 'bg-emerald-100 text-emerald-700',
            'PENDING': 'bg-amber-100 text-amber-700',
            'REJECTED': 'bg-red-100 text-red-700',
            'SUSPENDED': 'bg-gray-100 text-gray-700'
        };
        return colors[status] || colors.PENDING;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!partner) {
        return (
            <div className="text-center p-12">
                <p className="text-gray-500">Partner not found</p>
                <Link href="/dashboard/partners" className="btn-secondary mt-4 inline-block">
                    Back to Partners
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{partner.applicantName}</h1>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                            <span className="font-mono">{partner.partnerId}</span>
                            <span>•</span>
                            <span className="badge bg-blue-100 text-blue-700">{partner.partnerType}</span>
                            <span>•</span>
                            <span>Joined {new Date(partner.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {partner.status === 'PENDING' && (
                        <>
                            <button
                                onClick={() => updateStatus('APPROVED')}
                                className="btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Check className="w-4 h-4" /> Approve
                            </button>
                            <button
                                onClick={() => updateStatus('REJECTED')}
                                className="btn-white border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <X className="w-4 h-4" /> Reject
                            </button>
                        </>
                    )}
                    {partner.status === 'APPROVED' && (
                        <button
                            onClick={() => updateStatus('SUSPENDED')}
                            className="btn-white border-amber-200 text-amber-600 hover:bg-amber-50"
                        >
                            Suspend
                        </button>
                    )}
                    <span className={`badge px-3 py-1.5 ${getStatusColor(partner.status)}`}>
                        {partner.status}
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Total Customers</span>
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Total Services</span>
                            <ShoppingCart className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalServices || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Total Revenue</span>
                            <TrendingUp className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Pending Commission</span>
                            <IndianRupee className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">₹{(stats.pendingCommission || 0).toLocaleString('en-IN')}</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-3 border-b-2 transition-colors ${activeTab === 'overview'
                                ? 'border-primary-600 text-primary-600 font-medium'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`pb-3 border-b-2 transition-colors ${activeTab === 'customers'
                                ? 'border-primary-600 text-primary-600 font-medium'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Customers ({stats?.totalCustomers || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`pb-3 border-b-2 transition-colors ${activeTab === 'documents'
                                ? 'border-primary-600 text-primary-600 font-medium'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Documents
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Details */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary-500" />
                                Business Information
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-gray-400 uppercase">Applicant Name</label>
                                    <p className="font-medium">{partner.applicantName}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase">Trade Name</label>
                                    <p className="font-medium">{partner.tradeName || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase">GST Number</label>
                                    <p className="font-mono">{partner.gstNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase">PAN Number</label>
                                    <p className="font-mono">{partner.panNumber || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Addresses */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary-500" />
                                Addresses
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-medium mb-2 text-gray-700">Billing Address</h3>
                                    <p className="text-sm text-gray-600">{partner.billingAddress?.street}</p>
                                    <p className="text-sm text-gray-600">
                                        {partner.billingAddress?.city}, {partner.billingAddress?.state} - {partner.billingAddress?.pinCode}
                                    </p>
                                </div>
                                {partner.shippingAddress && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-medium mb-2 text-gray-700">Shipping Address</h3>
                                        <p className="text-sm text-gray-600">{partner.shippingAddress?.street}</p>
                                        <p className="text-sm text-gray-600">
                                            {partner.shippingAddress?.city}, {partner.shippingAddress?.state} - {partner.shippingAddress?.pinCode}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bank Details */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Building className="w-5 h-5 text-primary-500" />
                                Bank Details
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-gray-400 uppercase">Bank Name</label>
                                    <p className="font-medium">{partner.bankName || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase">Branch</label>
                                    <p className="font-medium">{partner.bankBranch || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase">Account Number</label>
                                    <p className="font-mono">{partner.accountNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase">IFSC Code</label>
                                    <p className="font-mono">{partner.ifscCode || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Contact Info */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Contact Info</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden flex-1">
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-sm font-medium truncate" title={partner.email}>{partner.email}</p>
                                        {partner.emailVerified && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Verified</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Mobile</p>
                                        <p className="text-sm font-medium">{partner.mobile}</p>
                                        {partner.mobileVerified && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Verified</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Registration Timeline */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Timeline</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-blue-50 rounded text-blue-600">
                                        <Calendar className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Registered</p>
                                        <p className="text-sm font-medium">{new Date(partner.createdAt).toLocaleDateString('en-IN')}</p>
                                    </div>
                                </div>
                                {partner.approvedAt && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-emerald-50 rounded text-emerald-600">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Approved</p>
                                            <p className="text-sm font-medium">{new Date(partner.approvedAt).toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </div>
                                )}
                                {partner.lastLoginAt && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-purple-50 rounded text-purple-600">
                                            <Shield className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Last Login</p>
                                            <p className="text-sm font-medium">{new Date(partner.lastLoginAt).toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'customers' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Customer ID</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Mobile</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Registered</th>
                                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No customers registered by this partner yet
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => (
                                        <tr key={customer._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-mono text-sm">{customer.customerId}</td>
                                            <td className="px-6 py-4">{customer.customerName || customer.name}</td>
                                            <td className="px-6 py-4 text-sm">{customer.mobile}</td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${getStatusColor(customer.status)}`}>
                                                    {customer.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(customer.createdAt).toLocaleDateString('en-IN')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/dashboard/customers/${customer.customerId || customer._id}`}
                                                    className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 inline-flex"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {customers.length > 0 && (
                        <div className="px-6 py-4 border-t bg-gray-50">
                            <Link
                                href={`/dashboard/customers?partner=${id}`}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                View all customers →
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'documents' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Documents</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium">Partner Agreement</p>
                                    <p className="text-xs text-gray-500">PDF Document</p>
                                </div>
                            </div>
                            <Download className="w-4 h-4 text-gray-400" />
                        </div>
                        {partner.gstDocument && (
                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium">GST Certificate</p>
                                        <p className="text-xs text-gray-500">Uploaded Document</p>
                                    </div>
                                </div>
                                <Download className="w-4 h-4 text-gray-400" />
                            </div>
                        )}
                        {partner.panDocument && (
                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium">PAN Card</p>
                                        <p className="text-xs text-gray-500">Uploaded Document</p>
                                    </div>
                                </div>
                                <Download className="w-4 h-4 text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
