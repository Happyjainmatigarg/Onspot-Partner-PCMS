'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, X, ShoppingCart, User, Smartphone, Calendar, FileText } from 'lucide-react';

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
                setService(data.service || data);
            }
        } catch (err) {
            console.error('Error fetching service details:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (status) => {
        try {
            const token = localStorage.getItem('adminToken');
            await fetch(`/api/admin/services/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            fetchServiceDetails();
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

    if (!service) {
        return (
            <div className="text-center p-12">
                <p className="text-gray-500">Service not found</p>
                <button onClick={() => router.back()} className="btn-secondary mt-4">Go Back</button>
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
                    <h1 className="text-2xl font-bold text-gray-900">Service Details</h1>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span>ID: {service.serviceId || service._id}</span>
                        <span>•</span>
                        <span className="badge bg-purple-100 text-purple-700">{service.serviceType}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {service.status === 'PENDING' && (
                        <>
                            <button
                                onClick={() => updateStatus('ACTIVE')}
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
                    <span className={`badge px-3 py-1 ${service.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                            service.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                        }`}>
                        {service.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Service Info */}
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary-500" />
                        Plan Information
                    </h2>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                        <div>
                            <label className="text-xs text-gray-400 uppercase">Service Type</label>
                            <p className="font-medium">{service.serviceType}</p>
                            <p className="text-xs text-gray-500">{
                                service.serviceType === 'ESS' ? 'Extended Security Service' :
                                    service.serviceType === 'EPS' ? 'Extended Protection Service' : 'Complete Device Care'
                            }</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase">Plan Cost</label>
                            <p className="font-bold text-lg">₹{service.serviceCost?.toLocaleString()}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase">Duration</label>
                            <p className="font-medium">{service.planDuration || 12} Months</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase">Commission</label>
                            <p className="font-medium text-emerald-600">₹{service.commissionAmount?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Device Info */}
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-primary-500" />
                        Device Details
                    </h2>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                        <div>
                            <label className="text-xs text-gray-400 uppercase">Brand</label>
                            <p className="font-medium">{service.deviceBrand}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase">Model</label>
                            <p className="font-medium">{service.deviceModel}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase">IMEI / Serial</label>
                            <p className="font-mono">{service.imeiNumber || service.serialNumber}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase">Purchase Date</label>
                            <p className="font-medium">{new Date(service.devicePurchaseDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 lg:col-span-2">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-500" />
                        Customer & Partner Info
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium mb-2 text-gray-700">Customer</h3>
                            <div className="space-y-1">
                                <p className="font-medium">{service.customerName}</p>
                                <p className="text-sm text-gray-500">{service.customerEmail}</p>
                                <p className="text-sm text-gray-500">{service.customerMobile}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium mb-2 text-gray-700">Partner (Seller)</h3>
                            <div className="space-y-1">
                                <p className="font-medium">{service.partnerName || 'Unknown Partner'}</p>
                                <p className="text-sm text-gray-500">ID: {service.partnerId}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
