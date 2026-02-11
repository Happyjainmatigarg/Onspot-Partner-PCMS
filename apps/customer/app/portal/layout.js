'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Shield,
    User,
    LogOut,
    Menu,
    X,
    ChevronRight
} from 'lucide-react';

export default function PortalLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        // Check auth
        const token = localStorage.getItem('token');
        const customerStr = localStorage.getItem('customer');

        if (!token || !customerStr) {
            router.push('/login');
            return;
        }

        try {
            setCustomer(JSON.parse(customerStr));
        } catch (e) {
            localStorage.removeItem('token');
            localStorage.removeItem('customer');
            router.push('/login');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('customer');
        router.push('/login');
    };

    if (!customer) return null;

    const navItems = [
        { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/portal/service', label: 'My Coverage', icon: Shield },
        { href: '/portal/profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-white z-30
                transform transition-transform duration-200 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-white p-1.5 rounded-lg">
                            <img src="/logo.png" alt="OnSpot" className="h-8 w-auto" />
                        </div>
                        <div>
                            <h1 className="font-display font-bold text-lg leading-tight">OnSpot™</h1>
                            <p className="text-xs text-slate-400">Customer Portal</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-200' : ''}`} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-primary-200" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-900">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold">
                            {customer.customerName?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{customer.customerName}</p>
                            <p className="text-xs text-slate-500 truncate">{customer.customerId}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b sticky top-0 z-10 px-4 py-3 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
