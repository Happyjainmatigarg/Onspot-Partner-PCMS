'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, User, Mail, Phone, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [customerId, setCustomerId] = useState('');
    const [contactMethod, setContactMethod] = useState('mobile'); // 'mobile' or 'email'
    const [contactValue, setContactValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/customers/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId,
                    contactMethod,
                    [contactMethod]: contactValue
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send reset code');
            }

            setOtpSent(true);
            // Redirect to reset-password page with parameters
            setTimeout(() => {
                router.push(`/reset-password?customerId=${customerId}&method=${contactMethod}`);
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="OnSpot" className="h-16 w-auto mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-primary-600 mb-2">Forgot Password?</h1>
                    <p className="text-slate-600">
                        No worries! We'll send you a reset code to verify your identity.
                    </p>
                </div>

                {otpSent ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-green-800 mb-2">Reset Code Sent!</h3>
                        <p className="text-green-700 text-sm">
                            We've sent a verification code to your {contactMethod}.
                            Redirecting to password reset page...
                        </p>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="label">Customer ID</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={customerId}
                                        onChange={(e) => setCustomerId(e.target.value.toUpperCase())}
                                        placeholder="CUST-XXXXXXXXXX-XXXX"
                                        className="input-field pl-10 font-mono text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Verification Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setContactMethod('mobile')}
                                        className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 transition ${contactMethod === 'mobile'
                                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                : 'border-slate-200 hover:border-primary-300'
                                            }`}
                                    >
                                        <Phone className="w-5 h-5" />
                                        <span className="font-medium">Mobile</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setContactMethod('email')}
                                        className={`p-3 border-2 rounded-lg flex items-center justify-center gap-2 transition ${contactMethod === 'email'
                                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                : 'border-slate-200 hover:border-primary-300'
                                            }`}
                                    >
                                        <Mail className="w-5 h-5" />
                                        <span className="font-medium">Email</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="label">
                                    {contactMethod === 'mobile' ? 'Mobile Number' : 'Email Address'}
                                </label>
                                <div className="relative">
                                    {contactMethod === 'mobile' ? (
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    ) : (
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    )}
                                    <input
                                        type={contactMethod === 'mobile' ? 'tel' : 'email'}
                                        value={contactValue}
                                        onChange={(e) => setContactValue(e.target.value)}
                                        placeholder={contactMethod === 'mobile' ? '9876543210' : 'your@email.com'}
                                        className="input-field pl-10"
                                        required
                                    />
                                </div>
                                <p className="mt-2 text-xs text-slate-500">
                                    We'll send a verification code to this {contactMethod}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {loading ? 'Sending Code...' : (
                                    <>
                                        Send Reset Code
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center space-y-2">
                            <p className="text-sm text-slate-600">
                                Remember your password?{' '}
                                <a href="/login" className="text-primary-600 font-medium hover:underline">
                                    Login here
                                </a>
                            </p>
                            <p className="text-sm text-slate-600">
                                Don't have an account?{' '}
                                <a href="/register" className="text-primary-600 font-medium hover:underline">
                                    Register now
                                </a>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
