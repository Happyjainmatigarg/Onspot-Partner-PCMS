'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, ArrowRight, Shield } from 'lucide-react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const customerId = searchParams.get('customerId') || 'CUST-XXXXXXXXXX-XXXX';
    const serviceId = searchParams.get('serviceId') || 'SRV-XXXXXXXX';

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="card text-center">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-12 h-12 text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Registration Submitted!</h1>
                    <p className="text-gray-600 mb-6">Your registration is pending admin approval</p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Customer ID:</span>
                            <span className="font-mono font-medium">{customerId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Service ID:</span>
                            <span className="font-mono font-medium">{serviceId}</span>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-semibold text-yellow-800 mb-2">What happens next?</h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Our team will verify your registration</li>
                            <li>• Payment will be processed</li>
                            <li>• You'll receive an email with login details</li>
                            <li>• Set your password and access your portal</li>
                        </ul>
                    </div>

                    <Link href="/login" className="btn-primary w-full flex items-center justify-center gap-2">
                        Go to Login <ArrowRight className="w-5 h-5" />
                    </Link>

                    <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-500">
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
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
