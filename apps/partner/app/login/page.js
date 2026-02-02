'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [partnerId, setPartnerId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [needsPassword, setNeedsPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [partnerName, setPartnerName] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/partners/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ partnerId, password })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.error === 'PASSWORD_NOT_SET') {
                    setNeedsPassword(true);
                    setPartnerName(data.partnerName);
                    setLoading(false);
                    return;
                }
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('partner', JSON.stringify(data.partner));
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/partners/set-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ partnerId, password: newPassword })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            localStorage.setItem('token', data.token);
            localStorage.setItem('partner', JSON.stringify(data.partner));
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Image */}
            <div
                className="hidden lg:flex lg:w-1/2 relative"
                style={{
                    backgroundImage: `linear-gradient(135deg, rgba(11, 37, 69, 0.95) 0%, rgba(11, 37, 69, 0.8) 100%), url(https://images.unsplash.com/photo-1646310997905-14eb66d1e04a?w=1200)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            >
                <div className="absolute inset-0 flex flex-col justify-center px-12 text-white">
                    <div className="mb-8">
                        <img src="/logo.png" alt="Ccommerce Ecosystem" className="h-20 w-auto bg-white p-2 rounded-lg" />
                    </div>
                    <h1 className="font-display text-4xl font-bold mb-4">Welcome Back</h1>
                    <p className="text-lg text-primary-200 max-w-md">
                        Access your partner dashboard, track services, and manage your OnSpot™ business.
                    </p>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md">
                    <div className="lg:hidden mb-8 text-center">
                        <img src="/logo.png" alt="Ccommerce Ecosystem" className="h-16 w-auto mx-auto" />
                    </div>

                    <div className="bg-white rounded-2xl shadow-soft p-8">
                        <div className="text-center mb-8">
                            <h2 className="font-display text-2xl font-bold text-primary-600 mb-2">
                                {needsPassword ? 'Create Password' : 'Partner Login'}
                            </h2>
                            <p className="text-slate-600">
                                {needsPassword ? 'Set up your account password' : 'Sign in to your account'}
                            </p>
                        </div>

                        {needsPassword && partnerName && (
                            <div className="bg-gold-50 border border-gold-200 text-gold-800 px-4 py-3 rounded-lg mb-6">
                                Welcome, <strong>{partnerName}</strong>! Please create your password to continue.
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        {!needsPassword ? (
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="label">Partner ID</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={partnerId}
                                            onChange={(e) => setPartnerId(e.target.value.toUpperCase())}
                                            placeholder="ONSPOT-DD-MM-YYYY-X-XXXXX"
                                            className="input-field pl-10 font-mono text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="input-field pl-10 pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Signing in...' : <>Sign In <ArrowRight className="w-5 h-5" /></>}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSetPassword} className="space-y-5">
                                <div>
                                    <label className="label">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Min 8 characters"
                                            className="input-field pl-10 pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm your password"
                                            className="input-field pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-gold w-full flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Creating...' : <>Create Password <ArrowRight className="w-5 h-5" /></>}
                                </button>
                            </form>
                        )}

                        <p className="mt-6 text-center text-sm text-slate-600">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-primary-600 font-medium hover:underline">
                                Register as Partner
                            </Link>
                        </p>
                    </div>

                    <p className="mt-8 text-center text-xs text-slate-500">
                        Ccommerce Ecosystem Pvt. Ltd. | OnSpot™
                    </p>
                </div>
            </div>
        </div>
    );
}
