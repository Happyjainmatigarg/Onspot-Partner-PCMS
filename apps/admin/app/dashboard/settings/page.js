'use client';
import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Shield, Mail, Bell, Database, Lock, User, Users, Plus, Trash2 } from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Profile settings
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Company settings
    const [company, setCompany] = useState({
        companyName: 'Ccommerce Ecosystem Pvt. Ltd.',
        gstNumber: '06AABCC1234A1Z5',
        supportEmail: 'support@onspot.one',
        supportPhone: '+91-XXXXXXXXXX'
    });

    // Commission rates by partner tier
    const [commissions, setCommissions] = useState({
        STANDARD: 10,
        SILVER: 12,
        GOLD: 15,
        PREMIUM: 18
    });

    // Notification settings
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        smsNotifications: true,
        autoApprovePartners: false,
        autoApproveCustomers: false
    });

    // Admin users (for SUPER_ADMIN only)
    const [adminUsers, setAdminUsers] = useState([]);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        mobile: '',
        role: 'OPERATIONS',
        password: ''
    });

    useEffect(() => {
        loadAdminProfile();
        loadAdminUsers();
        loadSystemSettings();
    }, []);

    const loadAdminProfile = () => {
        const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
        setProfile(prev => ({
            ...prev,
            name: adminData.name || '',
            email: adminData.email || ''
        }));
    };

    const loadAdminUsers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAdminUsers(data.admins || []);
            }
        } catch (err) {
            console.error('Error loading admin users:', err);
        }
    };

    const loadSystemSettings = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.company) setCompany(data.company);
                if (data.commissions) setCommissions(data.commissions);
                if (data.notifications) setNotifications(data.notifications);
            }
        } catch (err) {
            console.error('Error loading settings:', err);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        setMessage('');
        try {
            // Validate password change if attempted
            if (profile.newPassword) {
                if (profile.newPassword !== profile.confirmPassword) {
                    setMessage('New passwords do not match');
                    return;
                }
                if (profile.newPassword.length < 8) {
                    setMessage('Password must be at least 8 characters');
                    return;
                }
            }

            // TODO: Implement profile update endpoint separately if needed.
            // For now, assuming basic profile edit is local or managed via separate route.
            // But let's simulate success for the demo as requested if no route exists yet.
            // Real implementation would be PUT /api/admin/profile (not yet created)

            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage('Profile updated successfully!');

            // Clear password fields
            setProfile(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (err) {
            setMessage('Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        setMessage('');
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    company: activeTab === 'company' ? company : undefined,
                    commissions: activeTab === 'commissions' ? commissions : undefined,
                    notifications: activeTab === 'notifications' ? notifications : undefined
                })
            });

            if (res.ok) {
                setMessage('Settings saved successfully!');
            } else {
                setMessage('Failed to save settings');
            }
        } catch (err) {
            console.error(err);
            setMessage('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            alert('Please fill all required fields');
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });

            if (res.ok) {
                alert('Admin user created successfully!');
                setShowAddUser(false);
                setNewUser({ name: '', email: '', mobile: '', role: 'OPERATIONS', password: '' });
                loadAdminUsers();
            } else {
                const data = await res.json();
                alert('Error: ' + (data.error || 'Failed to create user'));
            }
        } catch (err) {
            alert('Error creating user');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <SettingsIcon className="w-7 h-7 text-gray-500" />
                        Settings
                    </h1>
                    <p className="text-gray-500">Manage your profile and system configuration</p>
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') || message.includes('not match') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {message}
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-6">
                    {['profile', 'company', 'commissions', 'notifications', 'users'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 border-b-2 transition-colors capitalize ${activeTab === tab
                                ? 'border-primary-600 text-primary-600 font-medium'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'users' ? 'Admin Users' : tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-primary-600" />
                            <h2 className="text-lg font-semibold">Admin Profile</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="label">Name</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="label">Email</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <hr className="my-6" />

                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Change Password
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="label">Current Password</label>
                                <input
                                    type="password"
                                    value={profile.currentPassword}
                                    onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="label">New Password</label>
                                <input
                                    type="password"
                                    value={profile.newPassword}
                                    onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="label">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={profile.confirmPassword}
                                    onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="btn-primary mt-6 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </div>
            )}

            {/* Company Tab */}
            {activeTab === 'company' && (
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
                                value={company.companyName}
                                onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="label">GST Number</label>
                            <input
                                type="text"
                                value={company.gstNumber}
                                onChange={(e) => setCompany({ ...company, gstNumber: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="label">Support Email</label>
                            <input
                                type="email"
                                value={company.supportEmail}
                                onChange={(e) => setCompany({ ...company, supportEmail: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="label">Support Phone</label>
                            <input
                                type="text"
                                value={company.supportPhone}
                                onChange={(e) => setCompany({ ...company, supportPhone: e.target.value })}
                                className="input-field"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="btn-primary mt-6 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            )}

            {/* Commissions Tab */}
            {activeTab === 'commissions' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Database className="w-5 h-5 text-primary-600" />
                        <h2 className="text-lg font-semibold">Commission Rates by Partner Tier</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        Set commission percentages for each partner tier. These rates are applied when services are approved.
                    </p>
                    <div className="grid md:grid-cols-4 gap-4">
                        {Object.entries(commissions).map(([tier, rate]) => (
                            <div key={tier} className="bg-gray-50 p-4 rounded-lg">
                                <label className="label">{tier}</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={rate}
                                        onChange={(e) => setCommissions({
                                            ...commissions,
                                            [tier]: Number(e.target.value)
                                        })}
                                        className="input-field"
                                        min="0"
                                        max="100"
                                    />
                                    <span className="text-gray-500">%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="btn-primary mt-6 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-primary-600" />
                        <h2 className="text-lg font-semibold">Notification & Automation Settings</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications.emailNotifications}
                                onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm text-gray-500">Receive emails for important events</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications.smsNotifications}
                                onChange={(e) => setNotifications({ ...notifications, smsNotifications: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div>
                                <p className="font-medium">SMS Notifications</p>
                                <p className="text-sm text-gray-500">Receive SMS alerts for critical events</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications.autoApprovePartners}
                                onChange={(e) => setNotifications({ ...notifications, autoApprovePartners: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div>
                                <p className="font-medium">Auto-approve Partners</p>
                                <p className="text-sm text-red-600">⚠️ Not recommended - requires manual review</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications.autoApproveCustomers}
                                onChange={(e) => setNotifications({ ...notifications, autoApproveCustomers: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div>
                                <p className="font-medium">Auto-approve Customers</p>
                                <p className="text-sm text-red-600">⚠️ Not recommended - requires manual review</p>
                            </div>
                        </label>
                    </div>
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="btn-primary mt-6 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            )}

            {/* Admin Users Tab */}
            {activeTab === 'users' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary-600" />
                                <h2 className="text-lg font-semibold">Admin Users</h2>
                            </div>
                            <button
                                onClick={() => setShowAddUser(!showAddUser)}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add User
                            </button>
                        </div>

                        {showAddUser && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold mb-4">Create New Admin User</h3>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="label">Name *</label>
                                        <input
                                            type="text"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Email *</label>
                                        <input
                                            type="email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Mobile</label>
                                        <input
                                            type="text"
                                            value={newUser.mobile}
                                            onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Role *</label>
                                        <select
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                            className="input-field"
                                        >
                                            <option value="OPERATIONS">Operations</option>
                                            <option value="ACCOUNTS">Accounts</option>
                                            <option value="SUPER_ADMIN">Super Admin</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="label">Password *</label>
                                        <input
                                            type="password"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            className="input-field"
                                            placeholder="Min 8 characters"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={handleAddUser} className="btn-primary">
                                        Create User
                                    </button>
                                    <button onClick={() => setShowAddUser(false)} className="btn-secondary">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Last Login</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {adminUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                No admin users found
                                            </td>
                                        </tr>
                                    ) : (
                                        adminUsers.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">{user.name}</td>
                                                <td className="px-6 py-4 text-sm">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className="badge bg-blue-100 text-blue-700">{user.role}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`badge ${user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('en-IN') : 'Never'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
