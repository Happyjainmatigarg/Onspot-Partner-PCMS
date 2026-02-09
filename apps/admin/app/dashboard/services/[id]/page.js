'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, User, Calendar, IndianRupee, Check, FileText, Activity } from 'lucide-react';
import Link from 'next/link';

export default function ServiceDetailPage({ params }) {
    const router = useRouter();
    const { id } = params;
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServiceDetails();
    }, [id]);

    const fetchServiceDetails = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`/api/admin/services/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setService(data);
            }
        } catch (err) {
            console.error('Error fetching service details:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'ACTIVE': 'bg-emerald-100 text-emerald-700',
            'PENDING': 'bg-amber-100 text-amber-700',
            'EXPIRED': 'bg-red-100 text-red-700',
            'CANCELLED': 'bg-gray-100 text-gray-700'
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

    if (!service) {
        return (
            <div className="text-center p-12">
                <p className="text-gray-500">Service not found</p>
                <Link href="/dashboard/services" className="btn-secondary mt-4 inline-block">
                    Back to Services
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
                        <h1 className="text-2xl font-bold text-gray-900">Service Details</h1>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                            <span className="font-mono">{service.serviceId}</span>
                            <span>•</span>
                            <span>Created {new Date(service.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <span className={`badge px-3 py-1.5 ${getStatusColor(service.status)}`}>
                    {service.status}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Service Details */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-primary-500" />
                            Service Information
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs text-gray-400 uppercase">Service Type</label>
                                <p className="font-medium text-lg badge bg-blue-100 text-blue-700 mt-1 inline-block">
                                    {service.serviceType}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase">Service Cost</label>
                                <p className="font-bold text-xl text-emerald-600 mt-1">
                                    ₹{(service.serviceCost || 0).toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase">Service Period</label>
                                <p className="font-medium">{service.servicePeriod || 'N/A'}</p>
                            </div>
                            {service.activatedAt && (
                                <div>
                                    <label className="text-xs text-gray-400 uppercase">Activated On</label>
                                    <p className="font-medium">{new Date(service.activatedAt).toLocaleDateString('en-IN')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary-500" />
                            Customer Information
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs text-gray-400 uppercase">Customer ID</label>
                                <p className="font-mono text-sm">{service.customerId}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase">Name</label>
                                <p className="font-medium">{service.customerName || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase">Mobile</label>
                                <p className="font-medium">{service.customerMobile || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase">Email</label>
                                <p className="font-medium text-sm">{service.customerEmail || 'N/A'}</p>
                            </div>
                        </div>
                        <Link
                            href={`/dashboard/customers/${service.customerId}`}
                            className="btn-secondary mt-4 inline-flex items-center gap-2"
                        >
                            View Customer Details →
                        </Link>
                    </div>

                    {/* Partner Info */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary-500" />
                            Partner Information
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs text-gray-400 uppercase">Partner ID</label>
                                <p className="font-mono text-sm">{service.partnerId}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 uppercase">Partner Type</label>
                                <p className="badge bg-purple-100 text-purple-700">{service.partnerType || 'N/A'}</p>
                            </div>
                        </div>
                        <Link
                            href={`/dashboard/partners/${service.partnerId}`}
                            className="btn-secondary mt-4 inline-flex items-center gap-2"
                        >
                            View Partner Details →
                        </Link>
                    </div>

                    {/* Device Info */}
                    {service.productBrand && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary-500" />
                                Device Information
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-gray-400 uppercase">Brand</label>
                                    <p className="font-medium">{service.productBrand}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase">Model</label>
                                    <p className="font-medium">{service.productModel || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase">Serial/IMEI</label>
                                    <p className="font-mono text-sm">{service.productSerial || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 uppercase">Purchase Value</label>
                                    <p className="font-bold text-emerald-600">
                                        ₹{(service.productValue || 0).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Commission Details */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <IndianRupee className="w-5 h-5 text-amber-500" />
                            Commission
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Rate</span>
                                <span className="font-medium">{service.commissionPercentage}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Before GST</span>
                                <span className="font-medium">₹{(service.commissionBeforeGST || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">GST (18%)</span>
                                <span className="text-red-600">-₹{(service.gstAmount || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <hr />
                            <div className="flex justify-between">
                                <span className="font-medium">After GST</span>
                                <span className="font-bold text-emerald-600">
                                    ₹{(service.commissionAfterGST || 0).toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Payment Status</span>
                                    {service.commissionPaid ? (
                                        <span className="badge bg-emerald-100 text-emerald-700">Paid</span>
                                    ) : (
                                        <span className="badge bg-amber-100 text-amber-700">Unpaid</span>
                                    )}
                                </div>
                                {service.commissionPaidDate && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Paid on {new Date(service.commissionPaidDate).toLocaleDateString('en-IN')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Timeline</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-blue-50 rounded text-blue-600">
                                    <Calendar className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Created</p>
                                    <p className="text-sm font-medium">{new Date(service.createdAt).toLocaleDateString('en-IN')}</p>
                                </div>
                            </div>
                            {service.activatedAt && (
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-emerald-50 rounded text-emerald-600">
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Activated</p>
                                        <p className="text-sm font-medium">{new Date(service.activatedAt).toLocaleDateString('en-IN')}</p>
                                    </div>
                                </div>
                            )}
                            {service.expiryDate && (
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-purple-50 rounded text-purple-600">
                                        <Calendar className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Expires</p>
                                        <p className="text-sm font-medium">{new Date(service.expiryDate).toLocaleDateString('en-IN')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Documents */}
                    {service.invoiceNumber && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Documents</h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium">Sales Invoice</p>
                                        <p className="text-xs text-gray-500">{service.invoiceNumber}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
