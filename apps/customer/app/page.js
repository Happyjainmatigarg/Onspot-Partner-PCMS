'use client';
import Link from 'next/link';
import { Shield, CheckCircle, ArrowRight, Smartphone, Laptop, Monitor, Headphones } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold gradient-text">OnSpot™</h1>
                            <p className="text-xs text-gray-500">Device Protection Services</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/login" className="btn-secondary text-sm py-2 px-4">
                            Customer Login
                        </Link>
                        <Link href="/register" className="btn-primary text-sm py-2 px-4">
                            Register Device
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary-500 to-accent-500 text-white py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                Protect Your Device Today
                            </h2>
                            <p className="text-xl text-white/90 mb-8">
                                Comprehensive protection plans for smartphones, laptops, and tablets.
                                Quick registration through authorized partners.
                            </p>
                            <Link href="/register" className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-all shadow-xl">
                                Register Your Device <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="hidden md:grid grid-cols-2 gap-4">
                            {[
                                { icon: Smartphone, label: 'Smartphones' },
                                { icon: Laptop, label: 'Laptops' },
                                { icon: Monitor, label: 'Tablets' },
                                { icon: Headphones, label: 'Accessories' }
                            ].map((item, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                                    <item.icon className="w-10 h-10 mx-auto mb-3" />
                                    <p className="font-medium">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Service Plans */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h3 className="text-3xl font-bold text-center mb-4">Protection Plans</h3>
                    <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                        Choose the protection level that fits your needs. All plans include 1-year coverage.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'ESS',
                                title: 'Extended Service Support',
                                percentage: '8%',
                                features: ['1-year coverage', 'Basic repairs', 'Phone support'],
                                color: 'blue'
                            },
                            {
                                name: 'EPS',
                                title: 'Extended Protection',
                                percentage: '15%',
                                features: ['1-year coverage', 'Extended repairs', 'Priority support', 'Parts coverage'],
                                color: 'purple',
                                popular: true
                            },
                            {
                                name: 'CDC',
                                title: 'Comprehensive Device Care',
                                percentage: '20%',
                                features: ['1-year coverage', 'Full repairs', '24/7 support', 'Accidental damage', 'Replacement option'],
                                color: 'amber'
                            }
                        ].map((plan, i) => (
                            <div key={i} className={`card relative ${plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''}`}>
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        MOST POPULAR
                                    </div>
                                )}
                                <div className={`w-14 h-14 rounded-xl bg-${plan.color}-100 flex items-center justify-center mb-4`}>
                                    <Shield className={`w-7 h-7 text-${plan.color}-600`} />
                                </div>
                                <h4 className="text-2xl font-bold mb-1">{plan.name}</h4>
                                <p className="text-gray-500 text-sm mb-4">{plan.title}</p>
                                <p className="text-3xl font-bold mb-4">{plan.percentage} <span className="text-sm text-gray-500 font-normal">of device value</span></p>
                                <ul className="space-y-2 mb-6">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={`/register?service=${plan.name}`} className="btn-primary w-full text-center">
                                    Select Plan
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { step: 1, title: 'Enter Partner ID', desc: 'Get a Partner ID from your retailer' },
                            { step: 2, title: 'Register Device', desc: 'Enter device and personal details' },
                            { step: 3, title: 'Choose Plan', desc: 'Select ESS, EPS, or CDC' },
                            { step: 4, title: 'Get Protected', desc: 'Service activates after approval' }
                        ].map((item) => (
                            <div key={item.step} className="bg-white rounded-xl p-6 shadow-md text-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4">
                                    {item.step}
                                </div>
                                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                                <p className="text-gray-600 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="w-8 h-8 text-primary-400" />
                            <span className="text-xl font-bold">OnSpot™</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            &copy; {new Date().getFullYear()} Ccommerce Ecosystem Pvt. Ltd.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
