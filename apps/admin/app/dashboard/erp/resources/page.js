'use client';
import { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit2, UserPlus, X, Check, Wrench } from 'lucide-react';

const getToken = () => localStorage.getItem('adminToken');
const API = '/api/admin/erp/resources';
const headers = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const CATEGORIES = ['EQUIPMENT', 'VEHICLE', 'TOOL', 'SOFTWARE', 'FURNITURE', 'IT_ASSET', 'OTHER'];
const CONDITIONS = ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED', 'DISPOSED'];

const emptyForm = {
    name: '', category: 'EQUIPMENT', description: '', serialNumber: '',
    purchaseDate: '', purchaseValue: 0, currentValue: 0,
    location: { office: '', floor: '', room: '' }, condition: 'NEW'
};

export default function ResourcesPage() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: '', status: '', search: '' });
    const [showModal, setShowModal] = useState(false);
    const [showAssign, setShowAssign] = useState(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [editing, setEditing] = useState(null);
    const [assignTo, setAssignTo] = useState('');

    const fetchResources = async () => {
        try {
            const params = new URLSearchParams();
            if (filter.category) params.set('category', filter.category);
            if (filter.status) params.set('status', filter.status);
            if (filter.search) params.set('search', filter.search);
            const res = await fetch(`${API}?${params}`, { headers: headers() });
            const data = await res.json();
            setResources(data.resources || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchResources(); }, []);

    const handleSave = async () => {
        try {
            const method = editing ? 'PUT' : 'POST';
            const url = editing ? `${API}/${editing}` : API;
            const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(form) });
            if (res.ok) { setShowModal(false); setEditing(null); setForm({ ...emptyForm }); fetchResources(); }
            else { const d = await res.json(); alert(d.error || 'Failed'); }
        } catch (err) { alert('Error saving resource'); }
    };

    const handleAssign = async () => {
        try {
            const res = await fetch(`${API}/${showAssign}/assign`, {
                method: 'POST', headers: headers(), body: JSON.stringify({ employeeId: assignTo || null })
            });
            if (res.ok) { setShowAssign(null); setAssignTo(''); fetchResources(); }
        } catch (err) { alert('Error assigning resource'); }
    };

    const openEdit = (r) => {
        setForm({
            name: r.name, category: r.category, description: r.description || '',
            serialNumber: r.serialNumber || '', purchaseDate: r.purchaseDate?.slice(0, 10) || '',
            purchaseValue: r.purchaseValue || 0, currentValue: r.currentValue || 0,
            location: r.location || {}, condition: r.condition || 'NEW'
        });
        setEditing(r.resourceId);
        setShowModal(true);
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            AVAILABLE: 'bg-emerald-100 text-emerald-700', ASSIGNED: 'bg-blue-100 text-blue-700',
            UNDER_MAINTENANCE: 'bg-amber-100 text-amber-700', RETIRED: 'bg-gray-100 text-gray-700',
            DISPOSED: 'bg-red-100 text-red-700'
        };
        return <span className={`badge ${colors[status] || 'bg-gray-100 text-gray-700'}`}>{status?.replace(/_/g, ' ')}</span>;
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Resource Management</h1>
                    <p className="text-gray-500">Track company assets, equipment, and assignments</p>
                </div>
                <button onClick={() => { setForm({ ...emptyForm }); setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Resource
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{resources.length}</p></div>
                <div className="bg-emerald-50 rounded-xl p-4"><p className="text-sm text-emerald-600">Available</p><p className="text-2xl font-bold text-emerald-700">{resources.filter(r => r.status === 'AVAILABLE').length}</p></div>
                <div className="bg-blue-50 rounded-xl p-4"><p className="text-sm text-blue-600">Assigned</p><p className="text-2xl font-bold text-blue-700">{resources.filter(r => r.status === 'ASSIGNED').length}</p></div>
                <div className="bg-amber-50 rounded-xl p-4"><p className="text-sm text-amber-600">Maintenance</p><p className="text-2xl font-bold text-amber-700">{resources.filter(r => r.status === 'UNDER_MAINTENANCE').length}</p></div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search resources..." value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} onKeyDown={e => e.key === 'Enter' && fetchResources()} className="input-field pl-10" />
                </div>
                <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })} className="input-field w-auto">
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                </select>
                <button onClick={fetchResources} className="btn-secondary">Search</button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Resource</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Condition</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Value</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {resources.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No resources found</td></tr>
                            ) : resources.map(r => (
                                <tr key={r.resourceId} className="hover:bg-gray-50">
                                    <td className="px-4 py-3"><p className="font-medium text-sm">{r.name}</p><p className="text-xs text-gray-400">{r.resourceId}{r.serialNumber ? ` • ${r.serialNumber}` : ''}</p></td>
                                    <td className="px-4 py-3"><span className="badge bg-purple-100 text-purple-700 text-xs">{r.category?.replace(/_/g, ' ')}</span></td>
                                    <td className="px-4 py-3 text-sm">{r.condition}</td>
                                    <td className="px-4 py-3 text-sm font-medium">₹{(r.currentValue || r.purchaseValue || 0).toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-3 text-sm">{r.assignedTo || '—'}</td>
                                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setShowAssign(r.resourceId)} className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200" title="Assign"><UserPlus className="w-4 h-4" /></button>
                                            <button onClick={() => openEdit(r)} className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="Edit"><Edit2 className="w-4 h-4" /></button>
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
                            <h2 className="text-lg font-bold">{editing ? 'Edit Resource' : 'Add Resource'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2"><label className="text-xs text-gray-500 font-medium">Name *</label><input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                            <div><label className="text-xs text-gray-500 font-medium">Category *</label><select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}</select></div>
                            <div><label className="text-xs text-gray-500 font-medium">Condition</label><select className="input-field" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>{CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                            <div><label className="text-xs text-gray-500 font-medium">Serial Number</label><input className="input-field" value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} /></div>
                            <div><label className="text-xs text-gray-500 font-medium">Purchase Date</label><input type="date" className="input-field" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} /></div>
                            <div><label className="text-xs text-gray-500 font-medium">Purchase Value (₹)</label><input type="number" className="input-field" value={form.purchaseValue} onChange={e => setForm({ ...form, purchaseValue: Number(e.target.value) })} /></div>
                            <div><label className="text-xs text-gray-500 font-medium">Current Value (₹)</label><input type="number" className="input-field" value={form.currentValue} onChange={e => setForm({ ...form, currentValue: Number(e.target.value) })} /></div>
                            <div className="col-span-2"><label className="text-xs text-gray-500 font-medium">Description</label><textarea className="input-field" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2"><Check className="w-4 h-4" /> {editing ? 'Update' : 'Create'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {showAssign && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Assign Resource</h2>
                            <button onClick={() => setShowAssign(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-medium">Employee ID</label>
                            <input className="input-field" placeholder="EMP-XXXXXX (leave empty to unassign)" value={assignTo} onChange={e => setAssignTo(e.target.value)} />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowAssign(null)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleAssign} className="btn-primary flex-1">Assign</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
