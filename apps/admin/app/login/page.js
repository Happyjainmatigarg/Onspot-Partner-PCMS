'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Eye, EyeOff, Lock, ArrowRight, Mail } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            // Handle non-JSON responses (like HTML error pages)
            let data;
            try {
                data = await res.json();
            } catch (jsonError) {
                throw new Error('Server error. Please check if the backend is running.');
            }

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('admin', JSON.stringify(data.admin));
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Image (Partner theme) */}
            <div
                className="hidden lg:flex lg:w-1/2 relative"
                style={{
                    backgroundImage: `linear-gradient(135deg, rgba(11, 37, 69, 0.95) 0%, rgba(11, 37, 69, 0.8) 100%), url(https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            >
                <div className="absolute inset-0 flex flex-col justify-center px-12 text-white">
                    <div className="mb-8">
                        <img src="/logo.png" alt="Ccommerce Ecosystem" className="h-20 w-auto bg-white p-2 rounded-lg" />
                    </div>
                    <h1 className="font-display text-4xl font-bold mb-4">Admin Dashboard</h1>
                    <p className="text-lg text-primary-200 max-w-md">
                        Manage partners, customers, and system settings for the OnSpot™ ecosystem.
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
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="font-display text-2xl font-bold text-primary-600 mb-2">
                                Administrator Login
                            </h2>
                            <p className="text-slate-600">
                                Sign in to access the admin dashboard
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="label">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@onspot.one"
                                        className="input-field pl-10"
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

                        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-500">Default credentials:</p>
                            <p className="font-mono text-sm text-slate-600">admin@onspot.one / Admin@123</p>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-xs text-slate-500">
                        Ccommerce Ecosystem Pvt. Ltd. | OnSpot™
                    </p>
                </div>
            </div>
        </div>
    );
}
