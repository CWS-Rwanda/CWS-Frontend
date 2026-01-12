import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import Modal from '../../components/common/Modal';
import './UserManagement.css';

// Mock user data matching the design
const mockUsers = [
    { id: 1, name: 'Elise', email: 'Estel.Lueilwitz@gmail.com', role: 'admin', status: 'active', revenue: null },
    { id: 2, name: 'Kara', email: 'Lia17@hotmail.com', role: 'admin', status: 'active', revenue: null },
    { id: 3, name: 'Georgianna', email: 'Mikel40@hotmail.com', role: 'admin', status: 'active', revenue: null },
    { id: 4, name: 'Louie', email: 'Adelbert.Becker40@hotmail.com', role: 'receptionist', status: 'active', revenue: null },
    { id: 5, name: 'Dora', email: 'Lewis.Bergstrom@gmail.com', role: 'operator', status: 'active', revenue: null },
    { id: 6, name: 'Ray', email: 'Sandy42@hotmail.com', role: 'finance', status: 'inactive', revenue: null },
    { id: 7, name: 'Omer', email: 'Ottilie.Howe71@hotmail.com', role: 'receptionist', status: 'active', revenue: null },
    { id: 8, name: 'Anastasia', email: 'Vaughn5@hotmail.com', role: 'operator', status: 'active', revenue: null },
    { id: 9, name: 'Janae', email: 'Petra.Yundt@hotmail.com', role: 'finance', status: 'inactive', revenue: null },
    { id: 10, name: 'Santina', email: 'Virginie_Hodkiewicz56@yahoo.com', role: 'operator', status: 'inactive', revenue: null },
];

const UserManagement = () => {
    const { users, setUsers } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'receptionist',
        status: 'active'
    });
    const [updateFormData, setUpdateFormData] = useState({
        name: '',
        email: '',
        role: 'receptionist',
        status: 'active'
    });

    // Use mock users for display, but keep the actual users state for adding new ones
    const displayUsers = useMemo(() => {
        let filtered = [...mockUsers, ...users];
        
        if (filterRole !== 'all') {
            filtered = filtered.filter(u => u.role === filterRole);
        }
        
        if (filterStatus !== 'all') {
            filtered = filtered.filter(u => u.status === filterStatus);
        }
        
        return filtered;
    }, [users, filterRole, filterStatus]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newUser = {
            id: users.length + mockUsers.length + 1,
            ...formData
        };
        setUsers([...users, newUser]);
        setIsModalOpen(false);
        setFormData({ name: '', email: '', role: 'receptionist', status: 'active' });
    };

    const handleUpdateClick = (user) => {
        setEditingUser(user);
        setUpdateFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        });
        setIsUpdateModalOpen(true);
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            const updatedUsers = users.map(u => 
                u.id === editingUser.id ? { ...u, ...updateFormData } : u
            );
            setUsers(updatedUsers);
        }
        setIsUpdateModalOpen(false);
        setEditingUser(null);
    };

    const getRoleDisplay = (role) => {
        const roleMap = {
            admin: 'Admin',
            receptionist: 'Receptionist',
            operator: 'Operator',
            finance: 'Financial',
            sustainability: 'Sustainability'
        };
        return roleMap[role] || role;
    };

    return (
        <div className="user-management">
            <div className="page-header">
                <h1 className="page-title">User management</h1>
                <p className="page-description">Manage users and their access roles</p>
            </div>

            <div className="content-card">
                <div className="card-header-section">
                    <h2 className="section-title">All users</h2>
                    <button onClick={() => setIsModalOpen(true)} className="btn-add-user">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add user
                    </button>
                </div>

                <div className="filters-section">
                    <div className="filter-group">
                        <label className="filter-label">Filter by Role:</label>
                        <select
                            className="filter-select"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="receptionist">Receptionist</option>
                            <option value="operator">Operator</option>
                            <option value="finance">Financial</option>
                            <option value="sustainability">Sustainability</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Filter by Status:</label>
                        <select
                            className="filter-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Names</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayUsers.map(user => (
                                <tr key={user.id}>
                                    <td><strong>{user.name}</strong></td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge ${user.role === 'admin' ? 'badge-role-admin' : 'badge-role-other'}`}>
                                            {getRoleDisplay(user.role)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${user.status === 'active' ? 'badge-status-active' : 'badge-status-inactive'}`}>
                                            {user.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-update"
                                            onClick={() => handleUpdateClick(user)}
                                        >
                                            Update
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New User">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Role</label>
                        <select
                            className="form-select"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            required
                        >
                            <option value="receptionist">Receptionist</option>
                            <option value="operator">Operator</option>
                            <option value="sustainability">Sustainability</option>
                            <option value="finance">Finance</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Status</label>
                        <select
                            className="form-select"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            required
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary">Create User</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} title="Update User">
                <form onSubmit={handleUpdateSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={updateFormData.name}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={updateFormData.email}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Role</label>
                        <select
                            className="form-select"
                            value={updateFormData.role}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, role: e.target.value })}
                            required
                        >
                            <option value="receptionist">Receptionist</option>
                            <option value="operator">Operator</option>
                            <option value="sustainability">Sustainability</option>
                            <option value="finance">Finance</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Status</label>
                        <select
                            className="form-select"
                            value={updateFormData.status}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, status: e.target.value })}
                            required
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary">Update User</button>
                        <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="btn btn-outline">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagement;
