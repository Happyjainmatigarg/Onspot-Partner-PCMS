'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Shield, ArrowRight, Copy } from 'lucide-react';
import { useState } from 'react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const partnerId = searchParams.get('partnerId') || 'ONSPOT-XX-XX-XXXX-X-XXXXX';
    const [copied, setCopied] = useState(false);

    const copyId = () => {
        navigator.clipboard.writeText(partnerId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="card text-center">
                    {/* Success Icon */}
                    <div className="w-20 h-20 gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>

                    <h1 className="font-display text-2xl font-bold text-primary-600 mb-2">
                        Registration Successful!
                    </h1>
                    <p className="text-slate-600 mb-6">
                        Welcome to the OnSpot™ Partner Network
                    </p>

                    {/* Partner ID */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-slate-500 mb-2">Your Partner ID</p>
                        <div className="flex items-center justify-center gap-2">
                            <code className="text-lg font-mono font-bold text-primary-600">{partnerId}</code>
                            <button
                                onClick={copyId}
                                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                                title="Copy ID"
                            >
                                <Copy className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>
                        {copied && <p className="text-xs text-emerald-600 mt-1">Copied!</p>}
                    </div>

                    {/* Next Steps */}
                    <div className="bg-gold-50 border border-gold-200 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-display font-bold text-gold-800 mb-2">What's Next?</h3>
                        <ul className="text-sm text-gold-700 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-gold-500 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                                Check your email for login instructions
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-gold-500 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                                Set your password on first login
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 bg-gold-500 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                                Share your Partner ID with customers
                            </li>
                        </ul>
                    </div>

                    {/* CTA */}
                    <Link href="/login" className="btn-primary w-full flex items-center justify-center gap-2">
                        Go to Login <ArrowRight className="w-5 h-5" />
                    </Link>

                    <Link href="/" className="btn-secondary w-full flex items-center justify-center gap-2 mt-3">
                        ← Back to Home
                    </Link>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400">
                        <Shield className="w-5 h-5" />
                        <span className="text-sm">Ccommerce Ecosystem Pvt. Ltd.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
