'use client';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PoliciesLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 md:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-3">
                            <img src="/logo.png" alt="Ccommerce Ecosystem" className="h-10 w-auto" />
                        </Link>
                        <Link href="/" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-4 md:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-soft p-6 md:p-10">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-8">
                <div className="max-w-5xl mx-auto px-4 md:px-8 text-center text-sm">
                    <p>© {new Date().getFullYear()} Ccommerce Ecosystem Pvt. Ltd. All rights reserved.</p>
                    <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
                        <Link href="/policies/privacy" className="hover:text-white">Privacy</Link>
                        <span>|</span>
                        <Link href="/policies/terms" className="hover:text-white">Terms</Link>
                        <span>|</span>
                        <Link href="/policies/refund" className="hover:text-white">Refunds</Link>
                        <span>|</span>
                        <Link href="/policies/grievance" className="hover:text-white">Grievance</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
