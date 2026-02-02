'use client';
import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Eye, Download } from 'lucide-react';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/audit-logs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let data;
            try {
                data = await res.json();
            } catch {
                data = [];
            }
            setLogs(Array.isArray(data) ? data : data.logs || []);
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
            'DELETE': 'bg-red-100 text-red-700',
            'LOGIN': 'bg-purple-100 text-purple-700',
            'APPROVE': 'bg-emerald-100 text-emerald-700',
            'REJECT': 'bg-red-100 text-red-700'
        };
        return styles[action] || 'bg-gray-100 text-gray-700';
    };

    const filteredLogs = logs.filter(l => {
        if (filter !== 'all' && l.action !== filter) return false;
        return true;
    });

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
                    <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-gray-500">Track all system activities and changes</p>
                </div>
                <button className="btn-secondary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Logs
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="input-field w-auto"
                    >
                        <option value="all">All Actions</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                        <option value="LOGIN">Login</option>
                        <option value="APPROVE">Approve</option>
                        <option value="REJECT">Reject</option>
                    </select>
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {filteredLogs.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No audit logs found</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredLogs.map((log) => (
                            <div key={log._id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-lg ${getActionBadge(log.action)}`}>
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {log.description || `${log.action} action performed`}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                By: {log.performedBy || 'System'} • Target: {log.targetType} {log.targetId}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`badge ${getActionBadge(log.action)}`}>
                                            {log.action}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
