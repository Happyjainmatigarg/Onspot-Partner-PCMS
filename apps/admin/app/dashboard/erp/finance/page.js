'use client';
import { useState, useEffect } from 'react';
import { Wallet, Plus, Search, Edit2, X, Check, IndianRupee, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

const getToken = () => localStorage.getItem('adminToken');
const API = '/api/admin/erp/transactions';
const headers = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const TYPES = ['INCOME', 'EXPENSE', 'TRANSFER', 'REFUND', 'COMMISSION_PAYOUT', 'SALARY', 'TAX_PAYMENT'];
const CATEGORIES = [
    'SERVICE_REVENUE', 'COMMISSION_EXPENSE', 'SALARY_EXPENSE', 'RENT', 'UTILITIES',
    'MARKETING', 'TRAVEL', 'OFFICE_SUPPLIES', 'SOFTWARE', 'INSURANCE', 'LEGAL',
    'TAX', 'GST_COLLECTED', 'GST_PAID', 'PARTNER_PAYOUT', 'REFUND', 'MISCELLANEOUS'
];
const PAYMENT_METHODS = ['BANK_TRANSFER', 'UPI', 'CHEQUE', 'CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'NEFT', 'RTGS', 'IMPS'];

const emptyForm = {
    type: 'INCOME', category: 'SERVICE_REVENUE', amount: 0, description: '',
    paymentMethod: 'BANK_TRANSFER', referenceNumber: '', transactionDate: new Date().toISOString().slice(0, 10),
    gstDetails: { gstApplicable: false, gstRate: 18, gstAmount: 0 }, notes: ''
};

export default function FinancePage() {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ type: '', category: '', search: '', dateFrom: '', dateTo: '' });
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ ...emptyForm });
    const [editing, setEditing] = useState(null);

    const fetchTransactions = async () => {
        try {
            const params = new URLSearchParams();
            Object.entries(filter).forEach(([k, v]) => { if (v) params.set(k, v); });
            const res = await fetch(`${API}?${params}`, { headers: headers() });
            const data = await res.json();
            setTransactions(data.transactions || []);
            setSummary(data.summary || {});
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTransactions(); }, []);

    const handleSave = async () => {
        try {
            // Auto-calculate GST amount
            if (form.gstDetails.gstApplicable) {
                form.gstDetails.gstAmount = Math.round(form.amount * (form.gstDetails.gstRate / 100) * 100) / 100;
            }
            const method = editing ? 'PUT' : 'POST';
            const url = editing ? `${API}/${editing}` : API;
            const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(form) });
            if (res.ok) { setShowModal(false); setEditing(null); setForm({ ...emptyForm }); fetchTransactions(); }
            else { const d = await res.json(); alert(d.error || 'Failed'); }
        } catch (err) { alert('Error saving transaction'); }
    };

    const openEdit = (tx) => {
        setForm({
            type: tx.type, category: tx.category, amount: tx.amount,
            description: tx.description, paymentMethod: tx.paymentMethod || 'BANK_TRANSFER',
            referenceNumber: tx.referenceNumber || '', transactionDate: tx.transactionDate?.slice(0, 10),
            gstDetails: tx.gstDetails || { gstApplicable: false, gstRate: 18, gstAmount: 0 },
            notes: tx.notes || ''
        });
        setEditing(tx.transactionId);
        setShowModal(true);
    };

    const TypeBadge = ({ type }) => {
        const colors = {
            INCOME: 'bg-emerald-100 text-emerald-700', EXPENSE: 'bg-red-100 text-red-700',
            TRANSFER: 'bg-blue-100 text-blue-700', REFUND: 'bg-amber-100 text-amber-700',
            COMMISSION_PAYOUT: 'bg-purple-100 text-purple-700', SALARY: 'bg-indigo-100 text-indigo-700',
            TAX_PAYMENT: 'bg-orange-100 text-orange-700'
        };
        return <span className={`badge ${colors[type] || 'bg-gray-100 text-gray-700'}`}>{type?.replace(/_/g, ' ')}</span>;
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Financial Transactions</h1>
                    <p className="text-gray-500">Income, expenses, GST tracking, and ledger management</p>
                </div>
                <button onClick={() => { setForm({ ...emptyForm }); setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Transaction
                </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-emerald-500" /><p className="text-sm text-emerald-600">Income</p></div>
                    <p className="text-xl font-bold text-emerald-700">₹{(summary.totalIncome || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="flex items-center gap-2 mb-1"><TrendingDown className="w-4 h-4 text-red-500" /><p className="text-sm text-red-600">Expenses</p></div>
                    <p className="text-xl font-bold text-red-700">₹{(summary.totalExpenses || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className={`${(summary.netProfit || 0) >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'} rounded-xl p-4 border`}>
                    <div className="flex items-center gap-2 mb-1"><IndianRupee className="w-4 h-4" /><p className="text-sm">Net Profit</p></div>
                    <p className={`text-xl font-bold ${(summary.netProfit || 0) >= 0 ? 'text-blue-700' : 'text-red-700'}`}>₹{(summary.netProfit || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <p className="text-sm text-amber-600">GST Collected</p>
                    <p className="text-xl font-bold text-amber-700">₹{(summary.totalGSTCollected || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-600">Transactions</p>
                    <p className="text-xl font-bold text-gray-800">{summary.transactionCount || 0}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search transactions..." value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} onKeyDown={e => e.key === 'Enter' && fetchTransactions()} className="input-field pl-10" />
                </div>
                <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })} className="input-field w-auto">
                    <option value="">All Types</option>
                    {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
                <input type="date" value={filter.dateFrom} onChange={e => setFilter({ ...filter, dateFrom: e.target.value })} className="input-field w-auto" />
                <input type="date" value={filter.dateTo} onChange={e => setFilter({ ...filter, dateTo: e.target.value })} className="input-field w-auto" />
                <button onClick={fetchTransactions} className="btn-secondary">Search</button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Transaction</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Method</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {transactions.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No transactions found</td></tr>
                            ) : transactions.map(tx => (
                                <tr key={tx.transactionId} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-sm">{tx.description}</p>
                                        <p className="text-xs text-gray-400">{tx.transactionId}{tx.referenceNumber ? ` • ${tx.referenceNumber}` : ''}</p>
                                    </td>
                                    <td className="px-4 py-3"><TypeBadge type={tx.type} /></td>
                                    <td className="px-4 py-3 text-xs text-gray-600">{tx.category?.replace(/_/g, ' ')}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-sm font-bold ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {tx.type === 'INCOME' ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN')}
                                        </span>
                                        {tx.gstDetails?.gstAmount > 0 && (
                                            <p className="text-xs text-gray-400">GST: ₹{tx.gstDetails.gstAmount.toLocaleString('en-IN')}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-600">{tx.paymentMethod?.replace(/_/g, ' ')}</td>
                                    <td className="px-4 py-3 text-xs text-gray-600">{tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString('en-IN') : 'N/A'}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => openEdit(tx)} className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">{editing ? 'Edit Transaction' : 'Add Transaction'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Type *</label>
                                <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Category *</label>
                                <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Amount (₹) *</label>
                                <input type="number" className="input-field" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Payment Method</label>
                                <select className="input-field" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Date *</label>
                                <input type="date" className="input-field" value={form.transactionDate} onChange={e => setForm({ ...form, transactionDate: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Reference #</label>
                                <input className="input-field" value={form.referenceNumber} onChange={e => setForm({ ...form, referenceNumber: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-500 font-medium">Description *</label>
                                <input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={form.gstDetails.gstApplicable} onChange={e => setForm({ ...form, gstDetails: { ...form.gstDetails, gstApplicable: e.target.checked } })} className="rounded" />
                                    GST Applicable (18%)
                                </label>
                                {form.gstDetails.gstApplicable && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        GST Amount: ₹{Math.round(form.amount * 0.18 * 100 / 100).toLocaleString('en-IN')}
                                    </p>
                                )}
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-500 font-medium">Notes</label>
                                <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                <Check className="w-4 h-4" /> {editing ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
