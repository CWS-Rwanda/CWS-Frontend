import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { auditLogsAPI } from '../../services/api';
import './AuditLogs.css';

const AuditLogs = () => {
    const { auditLogs, fetchAuditLogs, loading } = useData();
    const [filterUser, setFilterUser] = useState('All');
    const [filterAction, setFilterAction] = useState('All');
    const [filterEntity, setFilterEntity] = useState('All');
    const [localLoading, setLocalLoading] = useState(false);

    // Fetch audit logs on component mount
    useEffect(() => {
        fetchAuditLogs();
    }, []);

    // Get unique values for filters
    const uniqueUsers = [...new Set(auditLogs.map(log => log.role))].filter(Boolean);
    const uniqueActions = [...new Set(auditLogs.map(log => log.action))].filter(Boolean);
    const uniqueEntities = [...new Set(auditLogs.map(log => log.entity))].filter(Boolean);

    // Filter logic
    const filteredLogs = auditLogs.filter(log => {
        const matchUser = filterUser === 'All' || log.role === filterUser;
        const matchAction = filterAction === 'All' || log.action === filterAction;
        const matchEntity = filterEntity === 'All' || log.entity === filterEntity;
        return matchUser && matchAction && matchEntity;
    });

    const handleFilterChange = () => {
        const params = {};
        if (filterUser !== 'All') params.user = filterUser;
        if (filterAction !== 'All') params.action = filterAction;
        if (filterEntity !== 'All') params.table_name = filterEntity;
        
        setLocalLoading(true);
        fetchAuditLogs(params).finally(() => setLocalLoading(false));
    };

    const handleRefresh = () => {
        setLocalLoading(true);
        fetchAuditLogs().finally(() => setLocalLoading(false));
    };

    return (
        <div className="audit-logs">
            <div className="page-header">
                <h1 className="page-title">Audit Logs</h1>
                <p className="page-description">See all activities carried out on the platform and the person who did them. Security over all things</p>
            </div>

            <div className="audit-filters-card">
                <div className="filter-item">
                    <span className="filter-label">All users:</span>
                    <select
                        className="filter-select"
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                    >
                        <option value="All">All Users</option>
                        {uniqueUsers.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-item">
                    <span className="filter-label">Action:</span>
                    <select
                        className="filter-select"
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                    >
                        <option value="All">All Actions</option>
                        {uniqueActions.map(action => (
                            <option key={action} value={action}>{action}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-item">
                    <span className="filter-label">Entity:</span>
                    <select
                        className="filter-select"
                        value={filterEntity}
                        onChange={(e) => setFilterEntity(e.target.value)}
                    >
                        <option value="All">All Entities</option>
                        {uniqueEntities.map(entity => (
                            <option key={entity} value={entity}>{entity}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-item">
                    <button 
                        className="btn btn-primary" 
                        onClick={handleFilterChange}
                        disabled={localLoading || loading.auditLogs}
                    >
                        {localLoading || loading.auditLogs ? 'Filtering...' : 'Apply Filters'}
                    </button>
                    <button 
                        className="btn btn-secondary" 
                        onClick={handleRefresh}
                        disabled={localLoading || loading.auditLogs}
                        style={{ marginLeft: '8px' }}
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div className="audit-content">
                <div className="audit-table-card">
                    <div className="table-container">
                        {loading.auditLogs || localLoading ? (
                            <div style={{ textAlign: 'center', padding: '32px' }}>
                                Loading audit logs...
                            </div>
                        ) : (
                            <table className="audit-table">
                                <thead>
                                    <tr>
                                        <th>NAME</th>
                                        <th>DATE</th>
                                        <th>TIME</th>
                                        <th>ROLE</th>
                                        <th>ENTITY</th>
                                        <th>ENTITY ID</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.length > 0 ? (
                                        filteredLogs.map(log => (
                                            <tr key={log.id}>
                                                <td className="cell-name">{log.name}</td>
                                                <td>{log.date}</td>
                                                <td>{log.time}</td>
                                                <td>
                                                    <span className={`badge-role badge-role-${log.role?.toLowerCase()}`}>
                                                        {log.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge-entity badge-entity-${log.entity?.toLowerCase()}`}>
                                                        {log.entity}
                                                    </span>
                                                </td>
                                                <td><strong>{log.entityId || 'N/A'}</strong></td>
                                                <td>
                                                    <span className={`badge-action badge-action-${log.action?.toLowerCase()}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>
                                                No audit logs found matching filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
