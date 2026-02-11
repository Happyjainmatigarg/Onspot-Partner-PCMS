'use client';
import { useState, useEffect } from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function PortalDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/customers/portal', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error('Data fetch error:', error);
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

    if (!data) return null;

    const { customer, stats, services } = data;
    const hasActiveService = stats.activeServices > 0;
    const mainService = services[0]; // Assuming primary service is first for now

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-display font-bold text-slate-900">
                Welcome back, {customer.customerName.split(' ')[0]}
            </h1>

            {/* Status Card */}
            <div className={`
                rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6
                ${hasActiveService
                    ? 'bg-gradient-to-br from-primary-600 to-primary-800 text-white'
                    : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800'
                }
            `}>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        {hasActiveService ? (
                            <div className="bg-emerald-500/20 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-emerald-500/30">
                                <CheckCircle className="w-3.5 h-3.5" /> Protected
                            </div>
                        ) : (
                            <div className="bg-amber-500/20 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-amber-500/30">
                                <AlertTriangle className="w-3.5 h-3.5" /> No Active Protection
                            </div>
                        )}
                    </div>
                    <h2 className={`text-2xl sm:text-3xl font-display font-bold ${hasActiveService ? 'text-white' : 'text-slate-900'}`}>
                        {hasActiveService ? 'Your Device is Safe' : 'Your Device is at Risk'}
                    </h2>
                    <p className={`max-w-md ${hasActiveService ? 'text-primary-100' : 'text-slate-600'}`}>
                        {hasActiveService
                            ? `Covered under ${mainService?.serviceType} plan until ${new Date(stats.validUntil).toLocaleDateString()}.`
                            : 'You currently have no active protection plans. Contact your partner to activate service.'
                        }
                    </p>
                </div>

                {hasActiveService ? (
                    <Shield className="w-24 h-24 text-white/10 hidden sm:block" />
                ) : (
                    <Shield className="w-24 h-24 text-slate-300 hidden sm:block" />
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Registered Devices</p>
                        <p className="text-xl font-bold text-slate-900">{services.length}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Days Remaining</p>
                        <p className="text-xl font-bold text-slate-900">
                            {stats.validUntil ? Math.max(0, Math.ceil((new Date(stats.validUntil) - new Date()) / (1000 * 60 * 60 * 24))) : 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Services */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Your Services</h3>
                    <Link href="/portal/service" className="text-sm text-primary-600 font-medium hover:underline">
                        View All
                    </Link>
                </div>
                <div className="divide-y divide-slate-100">
                    {services.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No services found.
                        </div>
                    ) : (
                        services.slice(0, 3).map(service => (
                            <div key={service.serviceId} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-900">{service.serviceType} Plan</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${service.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                                    service.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {service.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 font-mono mt-0.5">{service.serviceId}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-900">
                                        Till {new Date(service.serviceEndDate).toLocaleDateString()}
                                    </p>
                                    <Link href={`/portal/service`} className="text-xs text-primary-600 hover:text-primary-700">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
