'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    Shield, LayoutDashboard, Users, ShoppingCart, Coins, FileText, Settings, LogOut, Menu, X,
    Bell
} from 'lucide-react';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('admin');
        if (!stored) {
            router.push('/login');
            return;
        }
        setAdmin(JSON.parse(stored));
    }, [router]);

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        router.push('/login');
    };

    const navItems = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/dashboard/partners', icon: Users, label: 'Partners' },
        { href: '/dashboard/customers', icon: Users, label: 'Customers' },
        { href: '/dashboard/services', icon: ShoppingCart, label: 'Services' },
        { href: '/dashboard/commissions', icon: Coins, label: 'Commissions' },
        { href: '/dashboard/audit-logs', icon: FileText, label: 'Audit Logs' },
        { href: '/dashboard/settings', icon: Settings, label: 'Settings' }
    ];

    const getRoleBadge = (role) => {
        const styles = {
            'SUPER_ADMIN': 'bg-red-100 text-red-800',
            'ACCOUNTS': 'bg-blue-100 text-blue-800',
            'OPERATIONS': 'bg-green-100 text-green-800'
        };
        return styles[role] || 'bg-gray-100 text-gray-800';
    };

    if (!admin) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-primary-500" />
                    <span className="font-bold text-gray-800">OnSpot Admin</span>
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gray-900 text-white transition-transform duration-300 flex flex-col
        `}>
                    <div className="p-6 border-b border-gray-800">
                        <div className="flex items-center gap-3">
                            <Shield className="w-8 h-8 text-primary-400" />
                            <div>
                                <h1 className="font-bold">OnSpot™ Admin</h1>
                                <p className="text-xs text-gray-400">Dashboard</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${pathname === item.href
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-800">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium">{admin.name?.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{admin.name}</p>
                                <span className={`badge text-xs ${getRoleBadge(admin.role)}`}>{admin.role}</span>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-all"
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
                    {/* Top Bar */}
                    <header className="hidden lg:flex bg-white border-b px-6 py-4 items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Ccommerce Ecosystem Pvt. Ltd. | GST: 06AABCC1234A1Z5
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                                <Bell className="w-5 h-5 text-gray-500" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </button>
                            <div className="text-right">
                                <p className="font-medium text-gray-800">{admin.name}</p>
                                <p className="text-xs text-gray-500">{admin.email}</p>
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
