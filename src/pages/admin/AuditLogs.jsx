import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import './AuditLogs.css';

const AuditLogs = () => {
    const { auditLogs } = useData();
    // Using mock data to match the design visualization exactly if needed, 
    // or adapting real data to match design columns: Name, Date, Role, Entity, Entity ID, Details, Action.

    // Mock data based on design image for visualization alignment
    const mockLogs = [
        { id: 1, name: 'Furaha', date: '2025-04-15', role: 'Admin', entity: 'Lot', entityId: 'LOT001', details: '223', action: 'Update' },
        { id: 2, name: 'Divin', date: '2025-04-15', role: 'Receptionist', entity: 'Delivery', entityId: 'DC002', details: '798', action: 'Create' },
        { id: 3, name: 'Rukundo', date: '2025-04-15', role: 'Operator', entity: 'Users', entityId: '001-89', details: '300', action: 'Update' },
        { id: 4, name: 'Angelo', date: '2025-04-15', role: 'Finance', entity: 'Lot', entityId: 'LOT003', details: '100', action: 'Create' },
        { id: 5, name: 'Nshuti', date: '2025-04-15', role: 'Worker', entity: 'Users', entityId: '003-089', details: '560', action: 'Update' },
    ];

    const [filterUser, setFilterUser] = useState('All');
    const [filterAction, setFilterAction] = useState('All');

    // Filter logic
    const filteredLogs = mockLogs.filter(log => {
        const matchUser = filterUser === 'All' || log.role === filterUser;
        const matchAction = filterAction === 'All' || log.action === filterAction;
        return matchUser && matchAction;
    });

    return (
        <div className="audit-logs">
            <div className="page-header">
                <h1 className="page-title">Audit Logs</h1>
                <p className="page-description">See all activities carried out on the platform and the person who did them . Security over all things</p>
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
                        <option value="Admin">Admin</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Operator">Operator</option>
                        <option value="Finance">Finance</option>
                        <option value="Worker">Worker</option>
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
                        <option value="Update">Update</option>
                        <option value="Create">Create</option>
                        <option value="Delete">Delete</option>
                    </select>
                </div>
            </div>

            <div className="audit-content">
                <div className="audit-table-card">
                    <div className="table-container">
                        <table className="audit-table">
                            <thead>
                                <tr>
                                    <th>NAME</th>
                                    <th>DATE</th>
                                    <th>ROLE</th>
                                    <th>ENTITY</th>
                                    <th>ENTITY ID</th>
                                    <th>DETAILS</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map(log => (
                                        <tr key={log.id}>
                                            <td className="cell-name">{log.name}</td>
                                            <td>{log.date}</td>
                                            <td>
                                                <span className={`badge-role badge-role-${log.role.toLowerCase()}`}>
                                                    {log.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge-entity badge-entity-${log.entity.toLowerCase()}`}>
                                                    {log.entity}
                                                </span>
                                            </td>
                                            <td><strong>{log.entityId}</strong></td>
                                            <td>{log.details}</td>
                                            <td>
                                                <span className={`badge-action badge-action-${log.action.toLowerCase()}`}>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
