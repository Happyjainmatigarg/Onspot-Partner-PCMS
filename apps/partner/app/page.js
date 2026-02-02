'use client';
import Link from 'next/link';
import { Shield, Users, CheckCircle, ArrowRight, Star, MapPin, Clock, Phone, Award, Wallet } from 'lucide-react';

const LOGO_URL = "/logo.png";

export default function Home() {
    const features = [
        {
            icon: Shield,
            title: "Post-OEM Service Support",
            description: "Service-backed repair support after manufacturer warranty expires. Not insurance - real service commitment."
        },
        {
            icon: MapPin,
            title: "Pan-India Network",
            description: "500+ authorized service centres across Tier-1, Tier-2, and Tier-3 cities with 1000+ cities covered."
        },
        {
            icon: Clock,
            title: "SLA-Driven Service",
            description: "24-hour response time and 14-day resolution targets. Transparent, reliable service delivery."
        }
    ];

    const services = [
        {
            title: "Extended Service Support (ESS)",
            tagline: "OEM-like protection after your warranty ends",
            description: "Post-OEM functional repair support similar to manufacturer warranty conditions. Covers electrical and mechanical failures.",
            rate: "8%",
            category: "Category 1",
            devices: "Mobile, Laptop",
            features: ["Electrical failure repairs", "Mechanical & functional breakdowns", "OEM-equivalent spare parts", "Labour & service costs covered"]
        },
        {
            title: "Enhanced Protection Service (EPS)",
            tagline: "Higher protection for higher repair risk",
            description: "Expanded component coverage and higher service limits. Suitable for stronger post-warranty protection.",
            rate: "15%",
            category: "Category 2",
            devices: "TV, Washing Machine, Dishwasher",
            features: ["Everything in ESS, plus:", "Higher repair value coverage", "Multiple claims within annual limits", "Wider component eligibility"]
        },
        {
            title: "Comprehensive Device Care (CDC)",
            tagline: "Maximum peace of mind after warranty",
            description: "Highest-tier plan with maximum repair coverage, priority servicing, and broadest component eligibility.",
            rate: "20%",
            category: "Category 3",
            devices: "Refrigerator, AC",
            features: ["Everything in ESS + EPS, plus:", "Priority service handling", "Higher BER tolerance", "Maximum liability up to invoice value"]
        }
    ];

    const stats = [
        { value: "500+", label: "Service Centres" },
        { value: "1000+", label: "Cities Covered" },
        { value: "50K+", label: "Devices Protected" },
        { value: "95%", label: "Customer Satisfaction" }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-4">
                            <img src="/logo.png" alt="Ccommerce Ecosystem" className="h-14 w-auto" />
                        </div>
                        <div className="flex items-center gap-4">
                            <a href="tel:+919588576099" className="hidden sm:flex items-center gap-2 text-primary-600 hover:text-primary-700">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm font-medium">+91-9588576099</span>
                            </a>
                            <Link href="/login" className="btn-secondary text-sm py-2 px-4">
                                Login
                            </Link>
                            <Link href="/register" className="btn-primary text-sm py-2 px-4">
                                Become Partner
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `url(https://images.unsplash.com/photo-1646310997905-14eb66d1e04a?w=1920)`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                    }}
                />
                <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="animate-slide-up">
                            <div className="inline-flex items-center gap-2 bg-gold-100 text-gold-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                                <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                                Trusted by 50,000+ Customers Across India
                            </div>
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-600 tracking-tight mb-6">
                                Post-OEM Service Support.<br />
                                <span className="text-gradient-gold">Real Repairs. Real Support.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
                                Professional Electronics Repair & Service Support Across India. Service-backed repair support after your manufacturer warranty expires. Transparent, SLA-driven service delivery with Pan-India coverage across 1000+ cities.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/register" className="btn-gold inline-flex items-center justify-center gap-2 text-lg py-4 px-8">
                                    Explore Service Plans
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link href="/register" className="btn-secondary inline-flex items-center justify-center gap-2 py-4 px-8">
                                    Partner With Us
                                </Link>
                            </div>
                            <div className="mt-8 flex items-center gap-4 text-sm text-slate-600">
                                <a href="tel:+919588576099" className="flex items-center gap-2 hover:text-primary-600">
                                    <Phone className="w-4 h-4" />
                                    Call: +91-9588576099
                                </a>
                                <span>|</span>
                                <span>500+ Service Centres</span>
                                <span>|</span>
                                <span>1000+ Cities</span>
                            </div>
                        </div>
                        <div className="hidden lg:block animate-fade-in">
                            <img
                                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600"
                                alt="Expert Technician Repairing Electronic Device"
                                className="rounded-2xl shadow-floating"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 gradient-primary">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                                <p className="text-primary-200 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-4">
                            Why Choose OnSpot™
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Post-OEM service support backed by operational excellence and complete transparency
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center mb-6">
                                    <feature.icon className="w-7 h-7 text-primary-600" />
                                </div>
                                <h3 className="font-display text-xl font-semibold text-primary-600 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20 bg-slate-50" id="services">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-4">
                            OnSpot™ Service Plans
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Comprehensive post-OEM service options designed for every device and requirement
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className="dashboard-card animate-slide-up relative overflow-hidden"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="absolute top-0 right-0 bg-gold-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                                    {service.rate}/year
                                </div>
                                <div className="h-2 gradient-primary rounded-full mb-6" />
                                <h3 className="font-display text-xl font-semibold text-primary-600 mb-2">{service.title}</h3>
                                <p className="text-gold-600 text-sm font-medium mb-3">{service.tagline}</p>
                                <p className="text-slate-600 text-sm mb-4">{service.description}</p>
                                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                                    <p className="text-xs text-slate-500">{service.category} • {service.devices}</p>
                                </div>
                                <ul className="space-y-2">
                                    {service.features.map((feat, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register" className="mt-6 block">
                                    <button className="btn-secondary w-full">Learn More</button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Table */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-4">
                            Transparent Pricing
                        </h2>
                        <p className="text-lg text-slate-600">
                            Annual Service Fee = Product Invoice Value × Category Percentage
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full bg-white rounded-xl shadow-soft overflow-hidden">
                            <thead>
                                <tr className="gradient-primary text-white">
                                    <th className="text-left py-4 px-6">Category</th>
                                    <th className="text-left py-4 px-6">Devices</th>
                                    <th className="text-left py-4 px-6">Annual Charge</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-100">
                                    <td className="py-4 px-6 font-medium">Category 1 (Low Risk)</td>
                                    <td className="py-4 px-6">Mobile Phones, Laptops</td>
                                    <td className="py-4 px-6 text-gold-600 font-bold">8% of Invoice Value</td>
                                </tr>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <td className="py-4 px-6 font-medium">Category 2 (Medium Risk)</td>
                                    <td className="py-4 px-6">LCD/LED/Smart TVs, Washing Machines, Dishwashers</td>
                                    <td className="py-4 px-6 text-gold-600 font-bold">15% of Invoice Value</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 font-medium">Category 3 (High Risk)</td>
                                    <td className="py-4 px-6">Refrigerators, Air Conditioners</td>
                                    <td className="py-4 px-6 text-gold-600 font-bold">20% of Invoice Value</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Partner Tier Section */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-4">
                            Partner Tiers & Targets
                        </h2>
                        <p className="text-lg text-slate-600">
                            Choose a tier that matches your business capacity and growth goals
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { tier: 'Silver', target: '₹50,000', activations: '10', commission: '20%', description: 'Entry level for new businesses', highlight: false },
                            { tier: 'Gold', target: '₹2,00,000', activations: '40', commission: '25%', description: 'For growing businesses', highlight: true },
                            { tier: 'Platinum', target: '₹5,00,000', activations: '100', commission: '30%', description: 'Premium high-volume partners', highlight: false }
                        ].map((plan, i) => (
                            <div key={i} className={`feature-card relative ${plan.highlight ? 'ring-2 ring-gold-500 scale-105' : ''}`}>
                                {plan.highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                                        RECOMMENDED
                                    </div>
                                )}
                                <div className={`w-14 h-14 rounded-xl ${plan.highlight ? 'gradient-gold' : plan.tier === 'Platinum' ? 'gradient-primary' : 'bg-slate-200'} flex items-center justify-center mb-4`}>
                                    <Award className="w-7 h-7 text-white" />
                                </div>
                                <h4 className="font-display text-2xl font-bold text-primary-600 mb-2">{plan.tier}</h4>
                                <p className="text-sm text-slate-500 mb-4">{plan.description}</p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                        <span className="text-slate-600">Commission</span>
                                        <span className="font-bold text-gold-600">{plan.commission}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                        <span className="text-slate-600">Monthly Target</span>
                                        <span className="font-bold text-primary-600">{plan.target}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                        <span className="text-slate-600">Min. Activations</span>
                                        <span className="font-bold text-primary-600">{plan.activations}/month</span>
                                    </div>
                                </div>

                                <Link href="/register" className="btn-secondary w-full text-center block">
                                    Get Started
                                </Link>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-sm text-slate-500 mt-6">
                        *TDS @ 5% deducted at source | 18% GST applicable on all commissions
                    </p>
                </div>
            </section>

            {/* Partner CTA Section */}
            <section className="py-20 gradient-primary">
                <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
                        Become an OnSpot™ Channel Partner
                    </h2>
                    <p className="text-lg text-primary-200 mb-4 max-w-2xl mx-auto">
                        Post-warranty monetization opportunity with simple percentage-based pricing
                    </p>
                    <ul className="flex flex-wrap justify-center gap-6 text-primary-100 mb-8">
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-gold-400" />
                            Flexible Partner Tiers
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-gold-400" />
                            No IRDAI Dependency
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-gold-400" />
                            Pan-India Network
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-gold-400" />
                            Recurring Revenue
                        </li>
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register" className="btn-gold inline-flex items-center justify-center gap-2 text-lg py-4 px-8">
                            Become a Partner Now
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/login" className="inline-flex items-center justify-center gap-2 py-4 px-8 border border-white/30 text-white hover:bg-white/10 rounded-lg font-medium transition-all">
                            Partner Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-12">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
                    {/* Company Info Row */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10 pb-8 border-b border-slate-800">
                        <img src="/logo.png" alt="Ccommerce Ecosystem" className="h-14 w-auto bg-white p-2 rounded-lg flex-shrink-0" />
                        <div className="text-center md:text-left">
                            <p className="text-sm text-slate-400 font-semibold mb-1">Ccommerce Ecosystem Pvt. Ltd.</p>
                            <p className="text-sm text-slate-500">A legacy of IT professionals and technology experts serving society with passion since 2000.</p>
                            <p className="text-sm text-slate-500">India-focused post-sales service & device lifecycle management.</p>
                        </div>
                    </div>

                    {/* 3 Columns Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h4 className="font-semibold text-white mb-4">Service Plans</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/register" className="hover:text-white">Extended Service Support (ESS)</Link></li>
                                <li><Link href="/register" className="hover:text-white">Enhanced Protection Service (EPS)</Link></li>
                                <li><Link href="/register" className="hover:text-white">Comprehensive Device Care (CDC)</Link></li>
                                <li><a href="https://www.onspot.one" target="_blank" rel="noopener noreferrer" className="hover:text-white">Visit OnSpot.one</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Legal & Policies</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/policies/privacy" className="hover:text-white">Privacy Policy</Link></li>
                                <li><Link href="/policies/terms" className="hover:text-white">Terms & Conditions</Link></li>
                                <li><Link href="/policies/refund" className="hover:text-white">Refund & Cancellation</Link></li>
                                <li><Link href="/policies/cookies" className="hover:text-white">Cookie Policy</Link></li>
                                <li><Link href="/policies/disclaimer" className="hover:text-white">Disclaimer</Link></li>
                                <li><Link href="/policies/grievance" className="hover:text-white">Grievance Redressal</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Contact</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="mailto:info@onspot.one" className="hover:text-white">info@onspot.one</a></li>
                                <li><a href="tel:+919588576099" className="hover:text-white">+91-9588576099</a></li>
                                <li>Registered: Jind, Haryana</li>
                                <li>Corporate: Noida, UP</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                            <p className="text-sm text-slate-500">
                                © {new Date().getFullYear()} Ccommerce Ecosystem Pvt. Ltd. All rights reserved.
                            </p>
                            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                <Link href="/policies/privacy" className="hover:text-white">Privacy</Link>
                                <span>|</span>
                                <Link href="/policies/terms" className="hover:text-white">Terms</Link>
                                <span>|</span>
                                <Link href="/policies/refund" className="hover:text-white">Refunds</Link>
                                <span>|</span>
                                <Link href="/policies/grievance" className="hover:text-white">Grievance</Link>
                            </div>
                        </div>
                        <p className="text-xs text-slate-600 text-center">
                            OnSpot™ is a registered trademark of Ccommerce Ecosystem Pvt. Ltd. OnSpot™ service plans are not insurance products and do not replace manufacturer warranties or insurance policies. Coverage is strictly limited to service and repair support as defined in the applicable Service Level Agreements (SLAs).
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
