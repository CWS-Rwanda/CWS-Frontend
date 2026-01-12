import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

const AuditLogs = () => {
    const { auditLogs } = useData();
    const [filterUser, setFilterUser] = useState('all');
    const [filterAction, setFilterAction] = useState('all');

    const filteredLogs = auditLogs.filter(log => {
        if (filterUser !== 'all' && log.user !== filterUser) return false;
        if (filterAction !== 'all' && log.action !== filterAction) return false;
        return true;
    });

    const uniqueUsers = [...new Set(auditLogs.map(log => log.user))];

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Audit Logs</h1>
                <p className="page-description">System activity and change history</p>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-md)' }}>
                <div className="flex items-center gap-lg">
                    <div className="flex items-center gap-sm">
                        <label className="form-label" style={{ marginBottom: 0 }}>User:</label>
                        <select
                            className="form-select"
                            value={filterUser}
                            onChange={(e) => setFilterUser(e.target.value)}
                            style={{ maxWidth: '200px' }}
                        >
                            <option value="all">All Users</option>
                            {uniqueUsers.map(user => (
                                <option key={user} value={user}>{user}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-sm">
                        <label className="form-label" style={{ marginBottom: 0 }}>Action:</label>
                        <select
                            className="form-select"
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            style={{ maxWidth: '150px' }}
                        >
                            <option value="all">All Actions</option>
                            <option value="create">Create</option>
                            <option value="update">Update</option>
                            <option value="delete">Delete</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="content-card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Entity</th>
                                <th>Entity ID</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.id}>
                                    <td>{log.timestamp}</td>
                                    <td><strong>{log.user}</strong></td>
                                    <td>
                                        <span className={`badge ${log.action === 'create' ? 'badge-success' :
                                                log.action === 'update' ? 'badge-info' :
                                                    'badge-error'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td>{log.entity}</td>
                                    <td><code>{log.entityId}</code></td>
                                    <td>{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
