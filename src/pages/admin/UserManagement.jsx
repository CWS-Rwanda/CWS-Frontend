import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Modal from '../../components/common/Modal';

const UserManagement = () => {
    const { users, setUsers } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'receptionist',
        status: 'active'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const newUser = {
            id: users.length + 1,
            ...formData
        };
        setUsers([...users, newUser]);
        setIsModalOpen(false);
        setFormData({ name: '', email: '', role: 'receptionist', status: 'active' });
    };

    const toggleUserStatus = (userId) => {
        setUsers(users.map(u =>
            u.id === userId
                ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
                : u
        ));
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">User Management</h1>
                <p className="page-description">Manage system users and their access roles</p>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">All Users</h2>
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                        + Add User
                    </button>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td><strong>{user.name}</strong></td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className="badge badge-info">{user.role}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => toggleUserStatus(user.id)}
                                            className="btn btn-outline"
                                            style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                                        >
                                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
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

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary">Create User</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagement;
