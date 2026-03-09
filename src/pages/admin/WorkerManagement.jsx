import React, { useState, useEffect } from 'react';
import { workersAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import './WorkerManagement.css';

const WorkerManagement = () => {
    const [workers, setWorkers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);
    const [deactivatingWorker, setDeactivatingWorker] = useState(null);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        worker_type: 'CASUAL'
    });
    const [updateFormData, setUpdateFormData] = useState({
        name: '',
        worker_type: 'CASUAL'
    });

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await workersAPI.getAll();
            const workersData = response?.data?.data || response?.data || [];
            if (!Array.isArray(workersData)) {
                setError('Invalid workers data format');
                setWorkers([]);
                return;
            }
            setWorkers(workersData);
        } catch (err) {
            setError(err.message || 'Failed to fetch workers.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await workersAPI.create(formData);
            setIsModalOpen(false);
            setFormData({ name: '', worker_type: 'CASUAL' });
            await fetchWorkers();
        } catch (err) {
            setError(err.message || 'Failed to create worker.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateClick = (worker) => {
        setEditingWorker(worker);
        setUpdateFormData({
            name: worker.name,
            worker_type: worker.worker_type || 'CASUAL'
        });
        setIsUpdateModalOpen(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!editingWorker) return;
        setError(null);
        setIsSubmitting(true);
        try {
            await workersAPI.update(editingWorker.id, updateFormData);
            setIsUpdateModalOpen(false);
            setEditingWorker(null);
            await fetchWorkers();
        } catch (err) {
            setError(err.message || 'Failed to update worker.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeactivateClick = (worker) => {
        setDeactivatingWorker(worker);
        setIsDeactivateModalOpen(true);
    };

    const handleDeactivateConfirm = async () => {
        if (!deactivatingWorker) return;
        setIsSubmitting(true);
        try {
            await workersAPI.deactivate(deactivatingWorker.id);
            setIsDeactivateModalOpen(false);
            setDeactivatingWorker(null);
            await fetchWorkers();
        } catch (err) {
            alert(err.message || 'Failed to deactivate worker.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="worker-management">
            <div className="page-header">
                <h1 className="page-title">Worker Management</h1>
                <p className="page-description">Manage station workers and their types</p>
            </div>

            <div className="content-card">
                <div className="card-header-section">
                    <h2 className="section-title">All Workers</h2>
                    <button onClick={() => setIsModalOpen(true)} className="btn-add-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Worker
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading workers...</div>
                ) : workers.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No workers found.</div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workers.map(worker => (
                                    <tr key={worker.id}>
                                        <td><strong>{worker.name}</strong></td>
                                        <td>
                                            <span className="badge badge-type">
                                                {worker.worker_type}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${worker.active ? 'badge-status-active' : 'badge-status-inactive'}`}>
                                                {worker.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn-update"
                                                    onClick={() => handleUpdateClick(worker)}
                                                    disabled={isSubmitting}
                                                >
                                                    Update
                                                </button>
                                                {worker.active !== false && (
                                                    <button
                                                        className="btn btn-outline"
                                                        onClick={() => handleDeactivateClick(worker)}
                                                        disabled={isSubmitting}
                                                        style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', color: 'var(--color-error)' }}
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Worker">
                {error && <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>{error}</div>}
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
                        <label className="form-label required">Worker Type</label>
                        <select
                            className="form-select"
                            value={formData.worker_type}
                            onChange={(e) => setFormData({ ...formData, worker_type: e.target.value })}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="PERMANENT">Permanent</option>
                            <option value="SEASONAL">Seasonal</option>
                            <option value="CASUAL">Casual</option>
                        </select>
                    </div>
                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Worker'}
                        </button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" disabled={isSubmitting}>
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} title="Update Worker">
                {error && <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>{error}</div>}
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
                        <label className="form-label required">Worker Type</label>
                        <select
                            className="form-select"
                            value={updateFormData.worker_type}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, worker_type: e.target.value })}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="PERMANENT">Permanent</option>
                            <option value="SEASONAL">Seasonal</option>
                            <option value="CASUAL">Casual</option>
                        </select>
                    </div>
                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Update Worker'}
                        </button>
                        <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="btn btn-outline" disabled={isSubmitting}>
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isDeactivateModalOpen} onClose={() => setIsDeactivateModalOpen(false)} title="Deactivate Worker">
                {deactivatingWorker && (
                    <div>
                        <p>Are you sure you want to deactivate worker <strong>{deactivatingWorker.name}</strong>?</p>
                        <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                            <button onClick={handleDeactivateConfirm} className="btn btn-primary" disabled={isSubmitting} style={{ backgroundColor: 'var(--color-error)' }}>
                                {isSubmitting ? 'Deactivating...' : 'Deactivate Worker'}
                            </button>
                            <button onClick={() => setIsDeactivateModalOpen(false)} className="btn btn-outline" disabled={isSubmitting}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default WorkerManagement;
