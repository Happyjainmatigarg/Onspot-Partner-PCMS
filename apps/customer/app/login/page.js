'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [customerId, setCustomerId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/customers/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId, password })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.error === 'UNDER_REVIEW') {
                    setError('Your registration is still under review. Please wait for approval.');
                    setLoading(false);
                    return;
                }
                if (data.error === 'PASSWORD_NOT_SET') {
                    router.push(`/set-password?customerId=${customerId}&name=${encodeURIComponent(data.customerName)}`);
                    return;
                }
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('customer', JSON.stringify(data.customer));
            router.push('/portal');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Shield className="w-10 h-10 text-primary-500" />
                        <span className="text-2xl font-bold gradient-text">OnSpot™</span>
                    </div>
                    <p className="text-gray-600">Customer Portal Login</p>
                </div>

                <div className="card">
                    <h2 className="text-xl font-bold mb-6">Sign In</h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label">Customer ID</label>
                            <input
                                type="text"
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value.toUpperCase())}
                                placeholder="CUST-XXXXXXXXXX-XXXX"
                                className="input-field font-mono"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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

                    <div className="mt-6 pt-6 border-t text-center">
                        <p className="text-gray-600">
                            Need protection? <Link href="/register" className="text-primary-600 font-semibold hover:underline">Register your device</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
