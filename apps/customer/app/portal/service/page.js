'use client';
import { useState, useEffect } from 'react';
import { Shield, Smartphone, Box, Calendar, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function ServicePage() {
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/customers/services', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setServices(data.services || []);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Coverage</h1>
                <p className="text-slate-500">View details of your protection plans and covered devices</p>
            </div>

            {services.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                    <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No Services Found</h3>
                    <p className="text-slate-500 mt-1">You don't have any active protection plans yet.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {services.map((service) => (
                        <div key={service.serviceId} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            {/* Service Header */}
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{service.serviceType} Protection Plan</h3>
                                        <p className="text-xs text-slate-500 font-mono">ID: {service.serviceId}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${service.status === 'ACTIVE'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : service.status === 'PENDING'
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                    {service.status}
                                </span>
                            </div>

                            {/* Service Content */}
                            <div className="p-6 grid md:grid-cols-2 gap-8">
                                {/* Plan Details */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-slate-400" /> Plan Details
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b border-slate-50">
                                            <span className="text-sm text-slate-500">Cost</span>
                                            <span className="text-sm font-medium text-slate-900">₹{service.serviceCost?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-slate-50">
                                            <span className="text-sm text-slate-500">Coverage Start</span>
                                            <span className="text-sm font-medium text-slate-900">
                                                {new Date(service.serviceStartDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-slate-50">
                                            <span className="text-sm text-slate-500">Coverage End</span>
                                            <span className="text-sm font-medium text-slate-900">
                                                {new Date(service.serviceEndDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-slate-50">
                                            <span className="text-sm text-slate-500">Purchase Date</span>
                                            <span className="text-sm font-medium text-slate-900">
                                                {new Date(service.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Device Details */}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-slate-400" /> Device Information
                                    </h4>
                                    {service.product ? (
                                        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                                                    <Box className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{service.product.model}</p>
                                                    <p className="text-xs text-slate-500">{service.product.brand} • {service.product.category}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                <div>
                                                    <span className="text-xs text-slate-400 block">Invoice No</span>
                                                    <span className="text-sm font-mono text-slate-700">{service.product.invoiceNumber}</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-slate-400 block">Invoice Date</span>
                                                    <span className="text-sm text-slate-700">
                                                        {new Date(service.product.purchaseDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-slate-400 block">Product ID</span>
                                                    <span className="text-sm font-mono text-slate-700">{service.product.productId}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-amber-50 rounded-lg p-4 text-amber-800 text-sm flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            <p>Device details are currently unavailable. Please contact support if this persists.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
                                <button className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Download Certificate
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
