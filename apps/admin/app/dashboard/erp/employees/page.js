'use client';
import { useState, useEffect } from 'react';
import { UserCog, Plus, Search, Edit2, Trash2, Eye, X, Check } from 'lucide-react';

const getToken = () => localStorage.getItem('adminToken');
const API = '/api/admin/erp/employees';
const headers = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const DEPARTMENTS = ['MANAGEMENT', 'OPERATIONS', 'ACCOUNTS', 'SALES', 'SUPPORT', 'TECHNICAL', 'HR', 'MARKETING'];
const ROLES = ['DIRECTOR', 'MANAGER', 'TEAM_LEAD', 'SENIOR', 'JUNIOR', 'INTERN'];

const emptyForm = {
    firstName: '', lastName: '', email: '', mobile: '', department: 'OPERATIONS',
    designation: '', role: 'JUNIOR', dateOfJoining: '', salary: { basic: 0, hra: 0, allowances: 0, deductions: 0 }
};

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ department: '', status: '', search: '' });
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ ...emptyForm });
    const [editing, setEditing] = useState(null);
    const [viewEmployee, setViewEmployee] = useState(null);

    const fetchEmployees = async () => {
        try {
            const params = new URLSearchParams();
            if (filter.department) params.set('department', filter.department);
            if (filter.status) params.set('status', filter.status);
            if (filter.search) params.set('search', filter.search);
            const res = await fetch(`${API}?${params}`, { headers: headers() });
            const data = await res.json();
            setEmployees(data.employees || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const handleSave = async () => {
        try {
            const method = editing ? 'PUT' : 'POST';
            const url = editing ? `${API}/${editing}` : API;
            const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(form) });
            if (res.ok) {
                setShowModal(false);
                setEditing(null);
                setForm({ ...emptyForm });
                fetchEmployees();
            } else {
                const d = await res.json();
                alert(d.error || 'Failed to save');
            }
        } catch (err) {
            alert('Error saving employee');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Terminate this employee?')) return;
        await fetch(`${API}/${id}`, { method: 'DELETE', headers: headers(), body: JSON.stringify({ reason: 'Admin terminated' }) });
        fetchEmployees();
    };

    const openEdit = (emp) => {
        setForm({
            firstName: emp.firstName, lastName: emp.lastName, email: emp.email,
            mobile: emp.mobile, department: emp.department, designation: emp.designation,
            role: emp.role, dateOfJoining: emp.dateOfJoining?.slice(0, 10),
            salary: emp.salary || { basic: 0, hra: 0, allowances: 0, deductions: 0 }
        });
        setEditing(emp.employeeId);
        setShowModal(true);
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            ACTIVE: 'bg-emerald-100 text-emerald-700', ON_LEAVE: 'bg-amber-100 text-amber-700',
            SUSPENDED: 'bg-gray-100 text-gray-700', TERMINATED: 'bg-red-100 text-red-700',
            RESIGNED: 'bg-blue-100 text-blue-700'
        };
        return <span className={`badge ${colors[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
                    <p className="text-gray-500">Manage employees, roles, and departments</p>
                </div>
                <button onClick={() => { setForm({ ...emptyForm }); setEditing(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Employee
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search employees..." value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} onKeyDown={e => e.key === 'Enter' && fetchEmployees()} className="input-field pl-10" />
                </div>
                <select value={filter.department} onChange={e => { setFilter({ ...filter, department: e.target.value }); }} className="input-field w-auto">
                    <option value="">All Departments</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} className="input-field w-auto">
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="TERMINATED">Terminated</option>
                </select>
                <button onClick={fetchEmployees} className="btn-secondary">Search</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{employees.length}</p></div>
                <div className="bg-emerald-50 rounded-xl p-4"><p className="text-sm text-emerald-600">Active</p><p className="text-2xl font-bold text-emerald-700">{employees.filter(e => e.status === 'ACTIVE').length}</p></div>
                <div className="bg-amber-50 rounded-xl p-4"><p className="text-sm text-amber-600">On Leave</p><p className="text-2xl font-bold text-amber-700">{employees.filter(e => e.status === 'ON_LEAVE').length}</p></div>
                <div className="bg-blue-50 rounded-xl p-4"><p className="text-sm text-blue-600">Monthly Salary</p><p className="text-xl font-bold text-blue-700">₹{employees.reduce((s, e) => s + (e.salary?.netSalary || 0), 0).toLocaleString('en-IN')}</p></div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Salary</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {employees.length === 0 ? (
                                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No employees found</td></tr>
                            ) : employees.map(emp => (
                                <tr key={emp.employeeId} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-sm">{emp.firstName} {emp.lastName}</p>
                                        <p className="text-xs text-gray-400">{emp.employeeId} • {emp.email}</p>
                                    </td>
                                    <td className="px-4 py-3"><span className="badge bg-blue-100 text-blue-700 text-xs">{emp.department}</span></td>
                                    <td className="px-4 py-3 text-sm">{emp.designation || emp.role}</td>
                                    <td className="px-4 py-3 text-sm font-medium">₹{(emp.salary?.netSalary || 0).toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-3"><StatusBadge status={emp.status} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setViewEmployee(emp)} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200" title="View"><Eye className="w-4 h-4" /></button>
                                            <button onClick={() => openEdit(emp)} className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                            {emp.status !== 'TERMINATED' && (
                                                <button onClick={() => handleDelete(emp.employeeId)} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Terminate"><Trash2 className="w-4 h-4" /></button>
                                            )}
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
                            <h2 className="text-lg font-bold">{editing ? 'Edit Employee' : 'Add Employee'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 font-medium">First Name *</label>
                                <input className="input-field" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Last Name *</label>
                                <input className="input-field" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Email *</label>
                                <input type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Mobile *</label>
                                <input className="input-field" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Department *</label>
                                <select className="input-field" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Designation *</label>
                                <input className="input-field" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Role</label>
                                <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium">Joining Date *</label>
                                <input type="date" className="input-field" value={form.dateOfJoining} onChange={e => setForm({ ...form, dateOfJoining: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Salary Details</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500">Basic (₹)</label>
                                    <input type="number" className="input-field" value={form.salary.basic} onChange={e => setForm({ ...form, salary: { ...form.salary, basic: Number(e.target.value) } })} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">HRA (₹)</label>
                                    <input type="number" className="input-field" value={form.salary.hra} onChange={e => setForm({ ...form, salary: { ...form.salary, hra: Number(e.target.value) } })} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Allowances (₹)</label>
                                    <input type="number" className="input-field" value={form.salary.allowances} onChange={e => setForm({ ...form, salary: { ...form.salary, allowances: Number(e.target.value) } })} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Deductions (₹)</label>
                                    <input type="number" className="input-field" value={form.salary.deductions} onChange={e => setForm({ ...form, salary: { ...form.salary, deductions: Number(e.target.value) } })} />
                                </div>
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

            {/* View Modal */}
            {viewEmployee && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">{viewEmployee.firstName} {viewEmployee.lastName}</h2>
                            <button onClick={() => setViewEmployee(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><p className="text-gray-500">Employee ID</p><p className="font-mono font-medium">{viewEmployee.employeeId}</p></div>
                            <div><p className="text-gray-500">Status</p><StatusBadge status={viewEmployee.status} /></div>
                            <div><p className="text-gray-500">Email</p><p>{viewEmployee.email}</p></div>
                            <div><p className="text-gray-500">Mobile</p><p>{viewEmployee.mobile}</p></div>
                            <div><p className="text-gray-500">Department</p><p className="font-medium">{viewEmployee.department}</p></div>
                            <div><p className="text-gray-500">Designation</p><p>{viewEmployee.designation}</p></div>
                            <div><p className="text-gray-500">Role</p><p>{viewEmployee.role}</p></div>
                            <div><p className="text-gray-500">Joining Date</p><p>{viewEmployee.dateOfJoining ? new Date(viewEmployee.dateOfJoining).toLocaleDateString('en-IN') : 'N/A'}</p></div>
                            <div><p className="text-gray-500">Net Salary</p><p className="font-bold text-emerald-600">₹{(viewEmployee.salary?.netSalary || 0).toLocaleString('en-IN')}</p></div>
                            <div><p className="text-gray-500">Leave Balance</p><p>{viewEmployee.attendance?.leaveBalance || 0} days</p></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
