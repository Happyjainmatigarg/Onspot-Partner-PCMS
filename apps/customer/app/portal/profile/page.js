'use client';
import { useState, useEffect } from 'react';
import { User, Lock, Mail, Phone, MapPin, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    // Password Change State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [passLoading, setPassLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const customerStr = localStorage.getItem('customer');
        if (customerStr) {
            setCustomer(JSON.parse(customerStr));
            setLoading(false);
        }
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setPassLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/customers/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Password updated successfully' });
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update password' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setPassLoading(false);
        }
    };

    if (loading) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
                <p className="text-slate-500">Manage your account and security preferences</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-900 h-24 relative">
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                                <div className="w-20 h-20 bg-primary-600 rounded-full border-4 border-white flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                                    {customer.customerName?.charAt(0)}
                                </div>
                            </div>
                        </div>
                        <div className="pt-12 pb-6 px-4 text-center">
                            <h2 className="font-bold text-lg text-slate-900">{customer.customerName}</h2>
                            <p className="text-xs font-mono text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded mt-1">
                                {customer.customerId}
                            </p>
                        </div>
                        <div className="border-t border-slate-100 divide-y divide-slate-100">
                            <div className="p-4 flex items-center gap-3">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600 break-all">{customer.email}</span>
                            </div>
                            <div className="p-4 flex items-center gap-3">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">{customer.mobile}</span>
                            </div>
                            {customer.address && (
                                <div className="p-4 flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                                    <span className="text-sm text-slate-600">
                                        {customer.address.street}, {customer.address.city}, {customer.address.state} - {customer.address.pinCode}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Password Change Form */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                            <Lock className="w-5 h-5 text-primary-600" />
                            <h3 className="font-bold text-slate-900">Change Password</h3>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                <p className="text-sm font-medium">{message.text}</p>
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    className="input-field"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="input-field"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="input-field"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={passLoading}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {passLoading ? 'Updating...' : <> <Save className="w-4 h-4" /> Update Password </>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
