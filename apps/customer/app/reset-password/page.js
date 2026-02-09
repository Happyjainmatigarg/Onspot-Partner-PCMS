'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Check, Eye, EyeOff, Key } from 'lucide-react';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [customerId, setCustomerId] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const id = searchParams.get('customerId');
        if (id) setCustomerId(id);
    }, [searchParams]);

    const [passwordStrength, setPasswordStrength] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false
    });

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
            const res = await fetch('/api/customers/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId, otp, newPassword: password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to reset password');
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
                    <h2 className="text-2xl font-bold text-primary-600 mb-2">Password Reset Successful!</h2>
                    <p className="text-slate-600">You can now login with your new password.</p>
                    <p className="text-sm text-slate-500 mt-2">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="OnSpot" className="h-16 w-auto mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-primary-600 mb-2">Reset Your Password</h1>
                    <p className="text-slate-600">
                        Enter the verification code and create a new password.
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
                        <label className="label">Verification Code (OTP)</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit code"
                                className="input-field pl-10 text-center text-2xl tracking-widest font-mono"
                                maxLength={6}
                                required
                            />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                            Check your mobile or email for the verification code
                        </p>
                    </div>

                    <div>
                        <label className="label">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
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
                        <label className="label">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
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
                            { key: 'hasSpecial', label: 'One special character' }
                        ].map(({ key, label }) => (
                            <div key={key} className="flex items-center gap-2">
                                {passwordStrength[key] ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
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
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Didn't receive the code?{' '}
                    <a href="/forgot-password" className="text-primary-600 font-medium hover:underline">
                        Resend code
                    </a>
                </p>
            </div>
        </div>
    );
}
