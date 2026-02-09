'use client';
import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Eye, Download, Calendar, User, Activity } from 'lucide-react';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState('all');
    const [entityFilter, setEntityFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchLogs();
    }, [actionFilter, entityFilter, dateFrom, dateTo, page]);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const params = new URLSearchParams();
            if (actionFilter !== 'all') params.append('action', actionFilter);
            if (entityFilter !== 'all') params.append('entity', entityFilter);
            if (searchTerm) params.append('search', searchTerm);
            if (dateFrom) params.append('dateFrom', dateFrom);
            if (dateTo) params.append('dateTo', dateTo);
            params.append('page', page);

            const res = await fetch(`/api/admin/audit-logs?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let data;
            try {
                data = await res.json();
            } catch {
                data = { logs: [], total: 0 };
            }
            setLogs(Array.isArray(data) ? data : data.logs || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action) => {
        const styles = {
            'CREATE': 'bg-emerald-100 text-emerald-700',
            'UPDATE': 'bg-blue-100 text-blue-700',
            'UPDATE_STATUS': 'bg-blue-100 text-blue-700',
            'DELETE': 'bg-red-100 text-red-700',
            'LOGIN': 'bg-purple-100 text-purple-700',
            'APPROVE': 'bg-emerald-100 text-emerald-700',
            'REJECT': 'bg-red-100 text-red-700',
            'EMAIL_RESEND': 'bg-yellow-100 text-yellow-700'
        };
        return styles[action] || 'bg-gray-100 text-gray-700';
    };

    const getEntityIcon = (entity) => {
        const icons = {
            'PARTNER': User,
            'CUSTOMER': User,
            'SERVICE': Activity,
            'ADMIN': FileText,
        };
        return icons[entity] || FileText;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-7 h-7 text-blue-500" />
                        Audit Logs
                    </h1>
                    <p className="text-gray-500">Complete audit trail of all system activities</p>
                </div>
                <button className="btn-secondary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Logs
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Total Logs</p>
                    <p className="text-2xl font-bold">{total}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-purple-600">Logins Today</p>
                    <p className="text-2xl font-bold text-purple-700">
                        {logs.filter(l => l.action === 'LOGIN' &&
                            new Date(l.timestamp).toDateString() === new Date().toDateString()
                        ).length}
                    </p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-sm text-emerald-600">Approvals Today</p>
                    <p className="text-2xl font-bold text-emerald-700">
                        {logs.filter(l => l.action === 'APPROVE' &&
                            new Date(l.timestamp).toDateString() === new Date().toDateString()
                        ).length}
                    </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-600">Updates Today</p>
                    <p className="text-2xl font-bold text-blue-700">
                        {logs.filter(l => (l.action === 'UPDATE' || l.action === 'UPDATE_STATUS') &&
                            new Date(l.timestamp).toDateString() === new Date().toDateString()
                        ).length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                        className="input-field"
                    >
                        <option value="all">All Actions</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="UPDATE_STATUS">Update Status</option>
                        <option value="DELETE">Delete</option>
                        <option value="LOGIN">Login</option>
                        <option value="APPROVE">Approve</option>
                        <option value="REJECT">Reject</option>
                    </select>

                    <select
                        value={entityFilter}
                        onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                        className="input-field"
                    >
                        <option value="all">All Entities</option>
                        <option value="PARTNER">Partners</option>
                        <option value="CUSTOMER">Customers</option>
                        <option value="SERVICE">Services</option>
                        <option value="ADMIN">Admin Users</option>
                    </select>

                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                            className="input-field pl-10"
                            placeholder="From Date"
                        />
                    </div>

                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                            className="input-field pl-10"
                            placeholder="To Date"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchLogs()}
                            className="input-field pl-10"
                            placeholder="Search by entity ID or details..."
                        />
                    </div>
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {logs.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No audit logs found</p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y">
                            {logs.map((log) => {
                                const EntityIcon = getEntityIcon(log.entity);
                                return (
                                    <div key={log._id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className={`p-2 rounded-lg ${getActionBadge(log.action)}`}>
                                                    <EntityIcon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`badge ${getActionBadge(log.action)}`}>
                                                            {log.action}
                                                        </span>
                                                        <span className="badge bg-gray-100 text-gray-700">
                                                            {log.entity}
                                                        </span>
                                                        {log.entityId && (
                                                            <span className="font-mono text-xs text-gray-500">
                                                                {log.entityId}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-900">
                                                        {log.details || `${log.action} action performed on ${log.entity}`}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                        <User className="w-3 h-3" />
                                                        <span>{log.performedBy || 'System'}</span>
                                                        {log.performedByRole && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="text-blue-600">{log.performedByRole}</span>
                                                            </>
                                                        )}
                                                        {log.ipAddress && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="font-mono">{log.ipAddress}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="text-xs text-gray-500">
                                                    {new Date(log.timestamp).toLocaleDateString('en-IN')}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(log.timestamp).toLocaleTimeString('en-IN')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {total > 50 && (
                            <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, total)} of {total} logs
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="btn-secondary text-sm disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page * 50 >= total}
                                        className="btn-secondary text-sm disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
