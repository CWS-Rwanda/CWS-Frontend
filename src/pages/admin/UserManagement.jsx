import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { adminUsersAPI, authAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import './UserManagement.css';

const UserManagement = () => {
    const { loading } = useData();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [filterRole, setFilterRole] = useState('all');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'RECEPTIONIST'
    });
    const [updateFormData, setUpdateFormData] = useState({
        name: '',
        email: '',
        role: 'RECEPTIONIST'
    });

    // Fetch users on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await adminUsersAPI.getAll();
            console.log('Users API response:', response);
            
            // Handle different response structures
            const usersData = response?.data?.data || response?.data || [];
            
            if (!Array.isArray(usersData)) {
                console.error('Users data is not an array:', usersData);
                setError('Invalid users data format');
                setUsers([]);
                return;
            }
            
            const transformed = usersData.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role?.toLowerCase() || 'receptionist',
                status: 'active' // Users don't have status field in backend, assume active
            }));
            
            console.log('Transformed users:', transformed);
            setUsers(transformed);
        } catch (error) {
            console.error('Error fetching users:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load users';
            setError(errorMessage);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter users
    const displayUsers = useMemo(() => {
        let filtered = [...users];
        
        console.log('Filtering users:', { totalUsers: users.length, filterRole, users });
        
        if (filterRole !== 'all') {
            filtered = filtered.filter(u => {
                const matches = u.role === filterRole;
                console.log(`User ${u.name} (${u.role}) matches filter (${filterRole}):`, matches);
                return matches;
            });
        }
        
        console.log('Filtered users:', filtered.length);
        return filtered;
    }, [users, filterRole]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // Map frontend role to backend ENUM
            const roleMap = {
                'receptionist': 'RECEPTIONIST',
                'operator': 'OPERATOR',
                'finance': 'FINANCIAL',
                'admin': 'ADMIN'
            };

            await authAPI.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: roleMap[formData.role] || 'RECEPTIONIST'
            });

            setIsModalOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'RECEPTIONIST' });
            await fetchUsers();
        } catch (err) {
            console.error('Error creating user:', err);
            setError(err.message || 'Failed to create user. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateClick = (user) => {
        setEditingUser(user);
        // Map role back to uppercase for backend
        const roleMap = {
            'receptionist': 'RECEPTIONIST',
            'operator': 'OPERATOR',
            'finance': 'FINANCIAL',
            'admin': 'ADMIN'
        };
        setUpdateFormData({
            name: user.name,
            email: user.email,
            role: roleMap[user.role] || 'RECEPTIONIST'
        });
        setIsUpdateModalOpen(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!editingUser) return;

        setError(null);
        setIsSubmitting(true);

        try {
            await adminUsersAPI.update(editingUser.id, {
                name: updateFormData.name,
                email: updateFormData.email,
                role: updateFormData.role
            });

            setIsUpdateModalOpen(false);
            setEditingUser(null);
            await fetchUsers();
        } catch (err) {
            console.error('Error updating user:', err);
            setError(err.message || 'Failed to update user. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (user) => {
        setDeletingUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingUser) return;

        setIsSubmitting(true);
        try {
            await adminUsersAPI.delete(deletingUser.id);
            setIsDeleteModalOpen(false);
            setDeletingUser(null);
            await fetchUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(err.message || 'Failed to delete user. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRoleDisplay = (role) => {
        const roleMap = {
            admin: 'Admin',
            receptionist: 'Receptionist',
            operator: 'Operator',
            finance: 'Financial',
            financial: 'Financial',
            sustainability: 'Sustainability'
        };
        return roleMap[role?.toLowerCase()] || role;
    };

    const getRoleValue = (role) => {
        const roleMap = {
            'RECEPTIONIST': 'receptionist',
            'OPERATOR': 'operator',
            'FINANCIAL': 'finance',
            'ADMIN': 'admin'
        };
        return roleMap[role] || role?.toLowerCase() || 'receptionist';
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

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}

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
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</div>
                ) : error ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-error)' }}>
                        Error: {error}
                        <br />
                        <button onClick={fetchUsers} className="btn btn-outline" style={{ marginTop: '1rem' }}>
                            Retry
                        </button>
                    </div>
                ) : displayUsers.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        No users found.
                        {users.length === 0 && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                                (Total users: {users.length})
                            </div>
                        )}
                    </div>
                ) : (
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
                                            <span className="badge badge-status-active">
                                                Active
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button 
                                                    className="btn-update"
                                                    onClick={() => handleUpdateClick(user)}
                                                    disabled={isSubmitting}
                                                >
                                                    Update
                                                </button>
                                                <button 
                                                    className="btn btn-outline"
                                                    onClick={() => handleDeleteClick(user)}
                                                    disabled={isSubmitting}
                                                    style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', color: 'var(--color-error)' }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New User">
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            disabled={isSubmitting}
                            minLength={6}
                        />
                        <small style={{ color: 'var(--color-gray-600)', fontSize: '0.875rem' }}>
                            Minimum 6 characters
                        </small>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Role</label>
                        <select
                            className="form-select"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="RECEPTIONIST">Receptionist</option>
                            <option value="OPERATOR">Operator</option>
                            <option value="FINANCIAL">Finance</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create User'}
                        </button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" disabled={isSubmitting}>
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} title="Update User">
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleUpdateSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={updateFormData.name}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, name: e.target.value })}
                            required
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Role</label>
                        <select
                            className="form-select"
                            value={updateFormData.role}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, role: e.target.value })}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="RECEPTIONIST">Receptionist</option>
                            <option value="OPERATOR">Operator</option>
                            <option value="FINANCIAL">Finance</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Update User'}
                        </button>
                        <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="btn btn-outline" disabled={isSubmitting}>
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete User">
                {deletingUser && (
                    <div>
                        <p>Are you sure you want to delete user <strong>{deletingUser.name}</strong> ({deletingUser.email})?</p>
                        <p style={{ color: 'var(--color-error)', marginTop: 'var(--spacing-md)' }}>
                            This action cannot be undone.
                        </p>
                        <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                            <button onClick={handleDeleteConfirm} className="btn btn-primary" disabled={isSubmitting} style={{ backgroundColor: 'var(--color-error)' }}>
                                {isSubmitting ? 'Deleting...' : 'Delete User'}
                            </button>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="btn btn-outline" disabled={isSubmitting}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserManagement;
