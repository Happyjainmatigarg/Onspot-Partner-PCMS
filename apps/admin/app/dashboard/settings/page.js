'use client';
import { useState, useEffect } from 'react';
import { Settings, Save, Shield, Mail, Bell, Database, Lock } from 'lucide-react';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        companyName: 'Ccommerce Ecosystem Pvt. Ltd.',
        gstNumber: '06AABCC1234A1Z5',
        supportEmail: 'support@onspot.one',
        supportPhone: '1800-XXX-XXXX',
        emailNotifications: true,
        smsNotifications: true,
        autoApprovePartners: false,
        commissionRate: {
            ESS: 25,
            EPS: 25,
            CDC: 25
        },
        tdsRate: 5,
        gstRate: 18
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            // In production, this would call an API
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage('Settings saved successfully!');
        } catch (err) {
            setMessage('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500">Manage system configuration</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {message}
                </div>
            )}

            <div className="space-y-6">
                {/* Company Information */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-primary-600" />
                        <h2 className="text-lg font-semibold">Company Information</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Company Name</label>
                            <input
                                type="text"
                                value={settings.companyName}
                                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="label">GST Number</label>
                            <input
                                type="text"
                                value={settings.gstNumber}
                                onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="label">Support Email</label>
                            <input
                                type="email"
                                value={settings.supportEmail}
                                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="label">Support Phone</label>
                            <input
                                type="text"
                                value={settings.supportPhone}
                                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                {/* Commission Rates */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Database className="w-5 h-5 text-primary-600" />
                        <h2 className="text-lg font-semibold">Commission & Tax Rates</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="label">ESS Commission (%)</label>
                            <input
                                type="number"
                                value={settings.commissionRate.ESS}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    commissionRate: { ...settings.commissionRate, ESS: Number(e.target.value) }
                                })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="label">EPS Commission (%)</label>
                            <input
                                type="number"
                                value={settings.commissionRate.EPS}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    commissionRate: { ...settings.commissionRate, EPS: Number(e.target.value) }
                                })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="label">CDC Commission (%)</label>
                            <input
                                type="number"
                                value={settings.commissionRate.CDC}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    commissionRate: { ...settings.commissionRate, CDC: Number(e.target.value) }
                                })}
                                className="input-field"
                            />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">TDS Rate (%)</label>
                            <input
                                type="number"
                                value={settings.tdsRate}
                                onChange={(e) => setSettings({ ...settings, tdsRate: Number(e.target.value) })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="label">GST Rate (%)</label>
                            <input
                                type="number"
                                value={settings.gstRate}
                                onChange={(e) => setSettings({ ...settings, gstRate: Number(e.target.value) })}
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-primary-600" />
                        <h2 className="text-lg font-semibold">Notifications</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span>Email Notifications</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={settings.smsNotifications}
                                onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span>SMS Notifications</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={settings.autoApprovePartners}
                                onChange={(e) => setSettings({ ...settings, autoApprovePartners: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span>Auto-approve Partners (not recommended)</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
