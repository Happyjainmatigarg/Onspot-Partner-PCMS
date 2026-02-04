'use client';
import { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, MapPin } from 'lucide-react';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/partners/customers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCustomers(data.customers || []);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.mobile?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Customers</h1>
                    <p className="text-gray-500">View and manage your registered customers</p>
                </div>
                <div className="bg-white p-2 rounded-lg border flex items-center gap-2 w-full sm:w-auto">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        className="outline-none text-sm w-full sm:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No customers found</p>
                    </div>
                ) : (
                    filteredCustomers.map((customer) => (
                        <div key={customer._id} className="bg-white rounded-xl shadow-sm p-6 border hover:border-primary-200 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                                    {customer.customerName?.charAt(0)}
                                </div>
                                <span className={`badge ${customer.status === 'ACTIVE' || customer.status === 'APPROVED' ? 'badge-success' : 'badge-warning'
                                    }`}>
                                    {customer.status}
                                </span>
                            </div>

                            <h3 className="font-bold text-lg text-gray-900 mb-1">{customer.customerName}</h3>
                            <p className="text-xs text-gray-500 mb-4">ID: {customer.customerId}</p>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    {customer.mobile}
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="truncate">{customer.email}</span>
                                </div>
                                {customer.address && (
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="truncate">{customer.address.city}, {customer.address.state}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t text-xs text-gray-400">
                                Registered on {new Date(customer.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
