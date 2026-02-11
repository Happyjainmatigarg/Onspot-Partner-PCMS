'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    Shield, LayoutDashboard, Users, ShoppingCart, Coins, FileText, Settings, LogOut, Menu, X,
    Bell, Clock, BarChart3, Building2, Package, Wallet, UserCog, ChevronDown, ChevronRight
} from 'lucide-react';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [admin, setAdmin] = useState(null);
    const [erpExpanded, setErpExpanded] = useState(false);

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
        localStorage.removeItem('adminData'); // Also remove adminData
        router.push('/login');
    };

    const navItems = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/dashboard/pending-approvals', icon: Clock, label: 'Pending Approvals' },
        { href: '/dashboard/partners', icon: Users, label: 'Partners' },
        { href: '/dashboard/customers', icon: Users, label: 'Customers' },
        { href: '/dashboard/services', icon: ShoppingCart, label: 'Services' },
        { href: '/dashboard/commissions', icon: Coins, label: 'Commissions' },
        { href: '/dashboard/reports', icon: BarChart3, label: 'Reports' },
        { href: '/dashboard/audit-logs', icon: FileText, label: 'Audit Logs' },
        { href: '/dashboard/settings', icon: Settings, label: 'Settings' }
    ];

    const erpItems = [
        { href: '/dashboard/erp', icon: Building2, label: 'ERP Dashboard' },
        { href: '/dashboard/erp/employees', icon: UserCog, label: 'Employees' },
        { href: '/dashboard/erp/resources', icon: Package, label: 'Resources' },
        { href: '/dashboard/erp/inventory', icon: ShoppingCart, label: 'Inventory' },
        { href: '/dashboard/erp/finance', icon: Wallet, label: 'Finance' }
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
        <div className="min-h-screen bg-slate-50">
            {/* Mobile Header */}
            <div className="lg:hidden gradient-primary p-4 flex items-center justify-between">
                <img src="/logo.png" alt="OnSpot Admin" className="h-10 w-auto bg-white/90 p-1 rounded" />
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            <div className="flex">
                {/* Sidebar - matching partner portal exactly */}
                <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50
          w-64 gradient-primary transition-transform duration-300 flex flex-col
        `}>
                    {/* Logo */}
                    <div className="p-4 border-b border-white/10">
                        <img src="/logo.png" alt="OnSpot Admin Portal" className="h-14 w-auto bg-white p-1 rounded" />
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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

                        {/* ERP/ERM Section */}
                        <div className="pt-3 mt-3 border-t border-white/10">
                            <button
                                onClick={() => setErpExpanded(!erpExpanded)}
                                className="w-full sidebar-link flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <Building2 className="w-5 h-5" />
                                    <span className="text-sm font-medium">ERP / ERM</span>
                                </div>
                                {erpExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            {erpExpanded && (
                                <div className="ml-4 mt-1 space-y-1">
                                    {erpItems.map(item => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={pathname === item.href ? 'sidebar-link-active' : 'sidebar-link'}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            <span className="text-xs font-medium">{item.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Admin Info */}
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="font-bold text-white">{admin.name?.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{admin.name}</p>
                                <span className={`badge text-xs ${getRoleBadge(admin.role)}`}>
                                    {admin.role}
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
                            <p className="text-sm text-slate-500">Company Info</p>
                            <p className="text-sm font-medium text-slate-700">Ccommerce Ecosystem Pvt. Ltd. | GST: 06AABCC1234A1Z5</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`badge ${getRoleBadge(admin.role)}`}>
                                {admin.role} Admin
                            </span>
                            <div className="text-right">
                                <p className="font-medium text-slate-800">{admin.name}</p>
                                <p className="text-xs text-slate-500">{admin.email}</p>
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
