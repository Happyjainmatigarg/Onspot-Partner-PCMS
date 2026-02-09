'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Check, X, Eye, EyeOff } from 'lucide-react';

export default function SetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [customerId, setCustomerId] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Password strength indicators
    const [passwordStrength, setPasswordStrength] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false
    });

    useEffect(() => {
        const id = searchParams.get('customerId');
        const name = searchParams.get('name');
        if (id) setCustomerId(id);
        if (name) setCustomerName(decodeURIComponent(name));
    }, [searchParams]);

    useEffect(() => {
        setPasswordStrength({
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        });
    }, [password]);

    const isPasswordValid = Object.values(passwordStrength).every(v => v);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isPasswordValid) {
            setError('Password does not meet all requirements');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/customers/set-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to set password');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-primary-600 mb-2">Password Set Successfully!</h2>
                    <p className="text-slate-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="OnSpot" className="h-16 w-auto mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-primary-600 mb-2">Set Your Password</h1>
                    <p className="text-slate-600">
                        Welcome, {customerName}! <br />
                        Please create a secure password for your account.
                    </p>
                </div>

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
                            disabled
                            className="input-field bg-slate-100 font-mono text-sm"
                        />
                    </div>

                    <div>
                        <label className="label">Create Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter a strong password"
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
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter your password"
                                className="input-field pl-10"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Strength Indicators */}
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium text-slate-700 mb-3">Password Requirements:</p>
                        {[
                            { key: 'minLength', label: 'At least 8 characters' },
                            { key: 'hasUppercase', label: 'One uppercase letter' },
                            { key: 'hasLowercase', label: 'One lowercase letter' },
                            { key: 'hasNumber', label: 'One number' },
                            { key: 'hasSpecial', label: 'One special character (!@#$%...)' }
                        ].map(({ key, label }) => (
                            <div key={key} className="flex items-center gap-2">
                                {passwordStrength[key] ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <X className="w-4 h-4 text-slate-300" />
                                )}
                                <span className={`text-sm ${passwordStrength[key] ? 'text-green-700' : 'text-slate-500'}`}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !isPasswordValid}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Setting Password...' : 'Set Password & Continue'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Already have a password?{' '}
                    <a href="/login" className="text-primary-600 font-medium hover:underline">
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
}
