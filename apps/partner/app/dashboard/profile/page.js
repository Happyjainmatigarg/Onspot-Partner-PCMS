'use client';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, CreditCard, Lock, FileText, Download } from 'lucide-react';

export default function ProfilePage() {
    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details'); // details, security

    // Password change state
    const [passData, setPassData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passMessage, setPassMessage] = useState({ type: '', text: '' });
    const [passLoading, setPassLoading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/partners/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPartner(data.partner);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPassMessage({ type: '', text: '' });

        if (passData.newPassword !== passData.confirmPassword) {
            setPassMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setPassLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/partners/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passData.currentPassword,
                    newPassword: passData.newPassword
                })
            });

            const data = await res.json();
            if (res.ok) {
                setPassMessage({ type: 'success', text: 'Password updated successfully' });
                setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setPassMessage({ type: 'error', text: data.error || 'Failed to update password' });
            }
        } catch (error) {
            setPassMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setPassLoading(false);
        }
    };

    const handleDownloadAgreement = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/partners/agreement', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Partner_Agreement_${partner.partnerId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to download agreement');
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Error downloading agreement');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!partner) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* ID Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-800 h-24"></div>
                        <div className="px-6 pb-6 relative">
                            <div className="w-20 h-20 bg-white rounded-full p-1 absolute -top-10 left-6 shadow-sm">
                                <div className="w-full h-full bg-gold-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {partner.applicantName?.charAt(0)}
                                </div>
                            </div>
                            <div className="pt-12">
                                <h2 className="text-xl font-bold text-gray-900">{partner.applicantName}</h2>
                                <p className="text-gray-500 text-sm">{partner.partnerId}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="badge badge-info">{partner.partnerType} Partner</span>
                                    <span className={`badge ${partner.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                                        {partner.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="border-t">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`w-full text-left px-6 py-3 text-sm font-medium border-l-4 hover:bg-gray-50 transition-colors ${activeTab === 'details' ? 'border-primary-600 text-primary-700 bg-primary-50' : 'border-transparent text-gray-600'
                                    }`}
                            >
                                Personal & Business Details
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full text-left px-6 py-3 text-sm font-medium border-l-4 hover:bg-gray-50 transition-colors ${activeTab === 'security' ? 'border-primary-600 text-primary-700 bg-primary-50' : 'border-transparent text-gray-600'
                                    }`}
                            >
                                Security & Password
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            Agreements
                        </h3>
                        <div
                            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                            onClick={handleDownloadAgreement}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-50 rounded flex items-center justify-center text-red-500">
                                    ID
                                </div>
                                <span className="text-sm font-medium">Partner Agreement</span>
                            </div>
                            <Download className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Details Tab */}
                <div className="lg:col-span-2">
                    {activeTab === 'details' ? (
                        <div className="space-y-6">
                            {/* Contact Info */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary-500" /> Contact Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase">Email Address</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{partner.email}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase">Mobile Number</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium">{partner.mobile}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Business Info */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                                    <Building className="w-5 h-5 text-primary-500" /> Business Details
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase">Trade Name</label>
                                        <p className="font-medium mt-1">{partner.tradeName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase">GST Number</label>
                                        <p className="font-mono mt-1">{partner.gstNumber}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase">PAN Number</label>
                                        <p className="font-mono mt-1">{partner.panNumber}</p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t">
                                    <label className="text-xs text-gray-400 uppercase flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4" /> Billing Address
                                    </label>
                                    <p className="text-sm font-medium text-gray-600">
                                        {partner.billingAddress?.street}
                                    </p>
                                    <p className="text-sm font-medium text-gray-600">
                                        {partner.billingAddress?.city}, {partner.billingAddress?.state} - {partner.billingAddress?.pinCode}
                                    </p>
                                </div>
                            </div>

                            {/* Bank Info */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-primary-500" /> Bank Account
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase">Bank Name</label>
                                        <p className="font-medium mt-1">{partner.bankName}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase">Branch</label>
                                        <p className="font-medium mt-1">{partner.bankBranch}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase">Account Number</label>
                                        <p className="font-mono mt-1">•••• •••• {partner.accountNumber?.slice(-4)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 uppercase">IFSC Code</label>
                                        <p className="font-mono mt-1">{partner.ifscCode}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Security Tab */
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-primary-500" /> Change Password
                            </h3>

                            {passMessage.text && (
                                <div className={`p-3 rounded-lg mb-4 text-sm ${passMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    {passMessage.text}
                                </div>
                            )}

                            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="input-field"
                                        value={passData.currentPassword}
                                        onChange={e => setPassData({ ...passData, currentPassword: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="input-field"
                                        value={passData.newPassword}
                                        onChange={e => setPassData({ ...passData, newPassword: e.target.value })}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Min 8 chars, mixed case, number & special char</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="input-field"
                                        value={passData.confirmPassword}
                                        onChange={e => setPassData({ ...passData, confirmPassword: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={passLoading}
                                    className="btn-primary w-full"
                                >
                                    {passLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
