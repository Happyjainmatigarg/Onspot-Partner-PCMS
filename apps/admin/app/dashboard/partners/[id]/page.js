'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, X, Shield, Mail, Phone, MapPin, Building, FileText, Download } from 'lucide-react';
import Link from 'next/link';

export default function PartnerDetailPage({ params }) {
    const router = useRouter();
    const { id } = params;
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPartnerDetails();
    }, [id]);

    const fetchPartnerDetails = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`/api/admin/partners/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPartner(data.partner || data);
            }
        } catch (err) {
            console.error('Error fetching partner details:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await fetch(`/api/admin/partners/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            fetchPartnerDetails();
        } catch (err) {
            console.error('Error updating status:', err);
        }
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
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{partner.applicantName}</h1>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span>ID: {partner.partnerId}</span>
                        <span>•</span>
                        <span className="badge bg-blue-100 text-blue-700">{partner.partnerType}</span>
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
                    <span className={`badge px-3 py-1 ${partner.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                            partner.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                        }`}>
                        {partner.status}
                    </span>
                </div>
            </div>

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
                                <div className="overflow-hidden">
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

                    {/* Documents */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Documents</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm font-medium">Partner Agreement</span>
                                </div>
                                <Download className="w-4 h-4 text-gray-400" />
                            </div>
                            {/* Add other documents like PAN/GST proofs if available */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
