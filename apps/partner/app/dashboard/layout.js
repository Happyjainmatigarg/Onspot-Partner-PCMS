'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    Shield, LayoutDashboard, ShoppingCart, Coins, Users, User, LogOut, Menu, X
} from 'lucide-react';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [partner, setPartner] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedPartner = localStorage.getItem('partner');
        if (!token || !storedPartner) {
            router.push('/login');
            return;
        }
        setPartner(JSON.parse(storedPartner));
    }, [router]);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('partner');
        router.push('/login');
    };

    const navItems = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/dashboard/sales', icon: ShoppingCart, label: 'Sales' },
        { href: '/dashboard/commissions', icon: Coins, label: 'Commissions' },
        { href: '/dashboard/customers', icon: Users, label: 'Customers' },
        { href: '/dashboard/profile', icon: User, label: 'Profile' }
    ];

    const getTierBadge = (tier) => {
        const styles = {
            'PLATINUM': 'bg-slate-200 text-slate-700',
            'GOLD': 'bg-gold-100 text-gold-700',
            'SILVER': 'bg-slate-100 text-slate-600'
        };
        return styles[tier] || 'bg-slate-100 text-slate-600';
    };

    if (!partner) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile Header */}
            <div className="lg:hidden gradient-primary p-4 flex items-center justify-between">
                <img src="/logo.png" alt="Ccommerce Ecosystem" className="h-10 w-auto bg-white/90 p-1 rounded" />
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50
          w-64 gradient-primary transition-transform duration-300 flex flex-col
        `}>
                    {/* Logo */}
                    <div className="p-4 border-b border-white/10">
                        <img src="/logo.png" alt="Ccommerce Ecosystem" className="h-14 w-auto bg-white p-1 rounded" />
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={pathname === item.href ? 'sidebar-link-active' : 'sidebar-link'}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Partner Info */}
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
                                <span className="font-bold text-white">{partner.applicantName?.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{partner.applicantName}</p>
                                <span className={`badge text-xs ${getTierBadge(partner.partnerType)}`}>
                                    {partner.partnerType}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Overlay */}
                {sidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 min-h-screen">
                    {/* Header */}
                    <header className="hidden lg:flex bg-white border-b border-slate-100 px-6 py-4 items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Partner ID</p>
                            <p className="font-mono text-sm font-medium text-primary-600">{partner.partnerId}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`badge ${getTierBadge(partner.partnerType)}`}>
                                {partner.partnerType} Partner
                            </span>
                            <div className="text-right">
                                <p className="font-medium text-slate-800">{partner.applicantName}</p>
                                <p className="text-xs text-slate-500">{partner.email}</p>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
