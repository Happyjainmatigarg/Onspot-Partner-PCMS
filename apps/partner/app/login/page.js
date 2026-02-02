'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, ArrowRight, Lock, Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [partnerId, setPartnerId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [needsPassword, setNeedsPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [partnerName, setPartnerName] = useState('');
    const [passwordSet, setPasswordSet] = useState(false);

    // Alphanumeric validation (at least 1 letter and 1 number)
    const isAlphanumeric = (str) => {
        const hasLetter = /[a-zA-Z]/.test(str);
        const hasNumber = /[0-9]/.test(str);
        return hasLetter && hasNumber;
    };

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

            // Handle non-JSON responses
            let data;
            try {
                data = await res.json();
            } catch (jsonError) {
                throw new Error('Server error. Please check if the backend is running.');
            }

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

        // Validation checks
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!isAlphanumeric(newPassword)) {
            setError('Password must contain at least one letter and one number (alphanumeric)');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/partners/set-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ partnerId, password: newPassword })
            });

            // Handle non-JSON responses
            let data;
            try {
                data = await res.json();
            } catch (jsonError) {
                throw new Error('Server error. Please check if the backend is running.');
            }

            if (!res.ok) throw new Error(data.error);

            // Show success and redirect to login
            setPasswordSet(true);
            setNeedsPassword(false);
            setNewPassword('');
            setConfirmPassword('');
            setPassword('');

            // Auto redirect after 3 seconds
            setTimeout(() => {
                setPasswordSet(false);
            }, 5000);

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
                        <Link href="/" className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
                            ← Back to Home
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-soft p-8">
                        {/* Success Message after Password Set */}
                        {passwordSet && (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                                </div>
                                <h2 className="font-display text-2xl font-bold text-emerald-600 mb-2">
                                    Password Created Successfully!
                                </h2>
                                <p className="text-slate-600 mb-6">
                                    Your password has been saved. You can now login with your credentials.
                                </p>
                                <p className="text-sm text-slate-500 mb-4">
                                    Partner ID: <span className="font-mono font-medium">{partnerId}</span>
                                </p>
                                <button
                                    onClick={() => setPasswordSet(false)}
                                    className="btn-primary"
                                >
                                    Proceed to Login
                                </button>
                            </div>
                        )}

                        {!passwordSet && (
                            <>
                                <div className="text-center mb-8">
                                    <h2 className="font-display text-2xl font-bold text-primary-600 mb-2">
                                        {needsPassword ? 'Create Your Password' : 'Partner Login'}
                                    </h2>
                                    <p className="text-slate-600">
                                        {needsPassword ? 'First time login - set up your password' : 'Sign in to your account'}
                                    </p>
                                </div>

                                {needsPassword && partnerName && (
                                    <div className="bg-gold-50 border border-gold-200 text-gold-800 px-4 py-3 rounded-lg mb-6">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium">Welcome, {partnerName}!</p>
                                                <p className="text-sm mt-1">This is a one-time setup. Create a secure password to continue.</p>
                                            </div>
                                        </div>
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
                                        {/* Password Requirements */}
                                        <div className="bg-slate-50 rounded-lg p-4 text-sm">
                                            <p className="font-medium text-slate-700 mb-2">Password Requirements:</p>
                                            <ul className="space-y-1 text-slate-600">
                                                <li className={`flex items-center gap-2 ${newPassword.length >= 8 ? 'text-emerald-600' : ''}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                                    At least 8 characters
                                                </li>
                                                <li className={`flex items-center gap-2 ${isAlphanumeric(newPassword) ? 'text-emerald-600' : ''}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isAlphanumeric(newPassword) ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                                    Must be alphanumeric (letters + numbers)
                                                </li>
                                                <li className={`flex items-center gap-2 ${newPassword && confirmPassword && newPassword === confirmPassword ? 'text-emerald-600' : ''}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${newPassword && confirmPassword && newPassword === confirmPassword ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                                    Passwords must match
                                                </li>
                                            </ul>
                                        </div>

                                        <div>
                                            <label className="label">Enter Your Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Create a strong password"
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
                                            <label className="label">Verify Your Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Re-enter your password"
                                                    className="input-field pl-10 pr-12"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn-gold w-full flex items-center justify-center gap-2"
                                        >
                                            {loading ? 'Creating...' : <>Submit <ArrowRight className="w-5 h-5" /></>}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNeedsPassword(false);
                                                setNewPassword('');
                                                setConfirmPassword('');
                                            }}
                                            className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
                                        >
                                            ← Back to Login
                                        </button>
                                    </form>
                                )}

                                {!needsPassword && (
                                    <p className="mt-6 text-center text-sm text-slate-600">
                                        Don't have an account?{' '}
                                        <Link href="/register" className="text-primary-600 font-medium hover:underline">
                                            Register as Partner
                                        </Link>
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    <p className="mt-8 text-center text-xs text-slate-500">
                        Ccommerce Ecosystem Pvt. Ltd. | OnSpot™
                    </p>
                </div>
            </div>
        </div>
    );
}
