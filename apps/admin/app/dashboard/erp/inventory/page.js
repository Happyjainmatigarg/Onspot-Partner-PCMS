'use client';
import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Search, Edit2, ArrowDownUp, X, Check, AlertTriangle } from 'lucide-react';

const getToken = () => localStorage.getItem('adminToken');
const API = '/api/admin/erp/inventory';
const headers = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const CATEGORIES = ['SPARE_PARTS', 'TOOLS', 'PACKAGING', 'OFFICE_SUPPLIES', 'ELECTRONICS', 'RAW_MATERIAL', 'FINISHED_GOODS', 'OTHER'];
const UNITS = ['PCS', 'KG', 'LTR', 'MTR', 'BOX', 'SET', 'PAIR'];

const emptyForm = {
    name: '', sku: '', category: 'SPARE_PARTS', description: '',
    unit: 'PCS', quantity: 0, reorderLevel: 10, unitCost: 0,
    sellingPrice: 0, supplier: { name: '', contact: '' }
};

export default function InventoryPage() {
    const [items, setItems] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: '', status: '', search: '' });
    const [showModal, setShowModal] = useState(false);
    const [showMovement, setShowMovement] = useState(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [editing, setEditing] = useState(null);
    const [movement, setMovement] = useState({ type: 'IN', quantity: 0, reference: '', notes: '' });

    const fetchItems = async () => {
        try {
            const params = new URLSearchParams();
            if (filter.category) params.set('category', filter.category);
            if (filter.status) params.set('status', filter.status);
            if (filter.search) params.set('search', filter.search);
            const res = await fetch(`${API}?${params}`, { headers: headers() });
            const data = await res.json();
            setItems(data.items || []);
            setSummary(data.summary || {});
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    const handleSave = async () => {
        try {
            const method = editing ? 'PUT' : 'POST';
            const url = editing ? `${API}/${editing}` : API;
            const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(form) });
            if (res.ok) {
                setShowModal(false); setEditing(null); setForm({ ...emptyForm }); fetchItems();
            } else {
                const d = await res.json(); alert(d.error || 'Failed to save');
            }
        } catch (err) { alert('Error saving item'); }
    };

    const handleMovement = async () => {
        try {
            const res = await fetch(`${API}/${showMovement}/movement`, {
                method: 'POST', headers: headers(), body: JSON.stringify(movement)
            });
            if (res.ok) {
                setShowMovement(null); setMovement({ type: 'IN', quantity: 0, reference: '', notes: '' }); fetchItems();
            } else {
                const d = await res.json(); alert(d.error || 'Failed');
            }
        } catch (err) { alert('Error recording movement'); }
    };

    const openEdit = (item) => {
        setForm({
            name: item.name, sku: item.sku, category: item.category, description: item.description,
            unit: item.unit, quantity: item.quantity, reorderLevel: item.reorderLevel,
            unitCost: item.unitCost, sellingPrice: item.sellingPrice, supplier: item.supplier || {}
        });
        setEditing(item.itemId);
        setShowModal(true);
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            IN_STOCK: 'bg-emerald-100 text-emerald-700', LOW_STOCK: 'bg-amber-100 text-amber-700',
            OUT_OF_STOCK: 'bg-red-100 text-red-700', DISCONTINUED: 'bg-gray-100 text-gray-700'
        };
        return <span className={`badge ${colors[status] || 'bg-gray-100 text-gray-700'}`}>{status?.replace(/_/g, ' ')}</span>;
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
                    <p className="text-gray-500">Track stock levels, movements, and suppliers</p>
                </div>
                <button onClick={() => { setForm({ ...emptyForm }); setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Item
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-sm text-gray-500">Total Items</p><p className="text-2xl font-bold">{summary.totalItems || 0}</p></div>
                <div className="bg-emerald-50 rounded-xl p-4"><p className="text-sm text-emerald-600">Total Value</p><p className="text-xl font-bold text-emerald-700">₹{(summary.totalValue || 0).toLocaleString('en-IN')}</p></div>
                <div className="bg-amber-50 rounded-xl p-4 flex items-center gap-3">
                    {(summary.lowStock || 0) > 0 && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    <div><p className="text-sm text-amber-600">Low Stock</p><p className="text-2xl font-bold text-amber-700">{summary.lowStock || 0}</p></div>
                </div>
                <div className="bg-red-50 rounded-xl p-4"><p className="text-sm text-red-600">Out of Stock</p><p className="text-2xl font-bold text-red-700">{summary.outOfStock || 0}</p></div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search items..." value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} onKeyDown={e => e.key === 'Enter' && fetchItems()} className="input-field pl-10" />
                </div>
                <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })} className="input-field w-auto">
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                </select>
                <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} className="input-field w-auto">
                    <option value="">All Status</option>
                    <option value="IN_STOCK">In Stock</option>
                    <option value="LOW_STOCK">Low Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
                <button onClick={fetchItems} className="btn-secondary">Search</button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Item</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Qty</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total Value</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {items.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No items found</td></tr>
                            ) : items.map(item => (
                                <tr key={item.itemId} className="hover:bg-gray-50">
                                    <td className="px-4 py-3"><p className="font-medium text-sm">{item.name}</p><p className="text-xs text-gray-400">{item.itemId}{item.sku ? ` • ${item.sku}` : ''}</p></td>
                                    <td className="px-4 py-3"><span className="badge bg-purple-100 text-purple-700 text-xs">{item.category?.replace(/_/g, ' ')}</span></td>
                                    <td className="px-4 py-3 text-sm font-medium">{item.quantity} {item.unit}</td>
                                    <td className="px-4 py-3 text-sm">₹{(item.unitCost || 0).toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-3 text-sm font-medium">₹{(item.totalValue || 0).toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setShowMovement(item.itemId)} className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200" title="Stock Movement"><ArrowDownUp className="w-4 h-4" /></button>
                                            <button onClick={() => openEdit(item)} className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                        </div>
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
                            <h2 className="text-lg font-bold">{editing ? 'Edit Item' : 'Add Inventory Item'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2"><label className="text-xs text-gray-500 font-medium">Name *</label><input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                            <div><label className="text-xs text-gray-500 font-medium">SKU</label><input className="input-field" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
                            <div><label className="text-xs text-gray-500 font-medium">Category *</label><select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}</select></div>
                            <div><label className="text-xs text-gray-500 font-medium">Unit</label><select className="input-field" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
                            <div><label className="text-xs text-gray-500 font-medium">Quantity *</label><input type="number" className="input-field" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
                            <div><label className="text-xs text-gray-500 font-medium">Reorder Level</label><input type="number" className="input-field" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: Number(e.target.value) })} /></div>
                            <div><label className="text-xs text-gray-500 font-medium">Unit Cost (₹) *</label><input type="number" className="input-field" value={form.unitCost} onChange={e => setForm({ ...form, unitCost: Number(e.target.value) })} /></div>
                            <div><label className="text-xs text-gray-500 font-medium">Selling Price (₹)</label><input type="number" className="input-field" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: Number(e.target.value) })} /></div>
                            <div><label className="text-xs text-gray-500 font-medium">Supplier Name</label><input className="input-field" value={form.supplier?.name || ''} onChange={e => setForm({ ...form, supplier: { ...form.supplier, name: e.target.value } })} /></div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2"><Check className="w-4 h-4" /> {editing ? 'Update' : 'Create'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock Movement Modal */}
            {showMovement && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Stock Movement</h2>
                            <button onClick={() => setShowMovement(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Movement Type *</label>
                                <select className="input-field" value={movement.type} onChange={e => setMovement({ ...movement, type: e.target.value })}>
                                    <option value="IN">Stock In</option>
                                    <option value="OUT">Stock Out</option>
                                    <option value="RETURN">Return</option>
                                    <option value="ADJUSTMENT">Adjustment</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Quantity *</label>
                                <input type="number" className="input-field" value={movement.quantity} onChange={e => setMovement({ ...movement, quantity: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Reference</label>
                                <input className="input-field" placeholder="PO#, Invoice#..." value={movement.reference} onChange={e => setMovement({ ...movement, reference: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Notes</label>
                                <textarea className="input-field" rows={2} value={movement.notes} onChange={e => setMovement({ ...movement, notes: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowMovement(null)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleMovement} className="btn-primary flex-1">Record Movement</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
