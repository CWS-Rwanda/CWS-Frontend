import React, { useState, useEffect } from 'react';
import { financingAPI } from '../../services/api';
import Modal from '../../components/common/Modal';

const FinancingSourceManagement = () => {
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSource, setSelectedSource] = useState(null);
    const [error, setError] = useState(null);
    
    const [formData, setFormData] = useState({
        type: 'TERM_LOAN',
        amount: '',
        start_date: '',
        description: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await financingAPI.getAll();
            if (response.data?.success) {
                setSources(response.data.data || []);
            }
        } catch (error) {
            console.error('Error loading financing sources:', error);
            setError('Failed to load financing sources. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.type || !formData.amount || !formData.start_date) {
            setError('Please fill in all required fields.');
            return;
        }

        const amount = parseFloat(formData.amount);
        if (amount <= 0) {
            setError('Amount must be a positive number.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await financingAPI.create({
                type: formData.type,
                amount: amount,
                start_date: formData.start_date,
                description: formData.description || null,
            });

            if (response.data?.success) {
                alert('Financing source created successfully!');
                setShowCreateModal(false);
                setFormData({
                    type: 'TERM_LOAN',
                    amount: '',
                    start_date: '',
                    description: '',
                });
                await loadData();
            } else {
                setError(response.data?.message || 'Failed to create financing source.');
            }
        } catch (error) {
            console.error('Error creating financing source:', error);
            setError(error.response?.data?.message || error.message || 'Failed to create financing source. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.type || !formData.amount || !formData.start_date) {
            setError('Please fill in all required fields.');
            return;
        }

        const amount = parseFloat(formData.amount);
        if (amount <= 0) {
            setError('Amount must be a positive number.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await financingAPI.update(selectedSource.id, {
                type: formData.type,
                amount: amount,
                start_date: formData.start_date,
                description: formData.description || null,
            });

            if (response.data?.success) {
                alert('Financing source updated successfully!');
                setShowEditModal(false);
                setSelectedSource(null);
                setFormData({
                    type: 'TERM_LOAN',
                    amount: '',
                    start_date: '',
                    description: '',
                });
                await loadData();
            } else {
                setError(response.data?.message || 'Failed to update financing source.');
            }
        } catch (error) {
            console.error('Error updating financing source:', error);
            setError(error.response?.data?.message || error.message || 'Failed to update financing source. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeactivate = async (sourceId) => {
        if (!confirm('Are you sure you want to deactivate this financing source? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await financingAPI.deactivate(sourceId);
            if (response.data?.success) {
                alert('Financing source deactivated successfully!');
                await loadData();
            } else {
                alert('Failed to deactivate financing source.');
            }
        } catch (error) {
            console.error('Error deactivating financing source:', error);
            alert(error.response?.data?.message || 'Failed to deactivate financing source. Please try again.');
        }
    };

    const openEditModal = (source) => {
        setSelectedSource(source);
        setFormData({
            type: source.type,
            amount: source.amount?.toString() || '',
            start_date: source.start_date || '',
            description: source.description || '',
        });
        setShowEditModal(true);
    };

    const closeModals = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedSource(null);
        setError(null);
        setFormData({
            type: 'TERM_LOAN',
            amount: '',
            start_date: '',
            description: '',
        });
    };

    const getTypeLabel = (type) => {
        const labels = {
            'OWN_FUNDS': 'Own Funds',
            'GRANT': 'Grant',
            'TERM_LOAN': 'Term Loan',
            'REVOLVING_CREDIT': 'Revolving Credit',
        };
        return labels[type] || type;
    };

    const getTotalLoans = (source) => {
        return source.loans?.length || 0;
    };

    const getTotalLoanAmount = (source) => {
        if (!source.loans || source.loans.length === 0) return 0;
        return source.loans.reduce((sum, loan) => sum + parseFloat(loan.total_payable || 0), 0);
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="loading-spinner"></div>
                <p>Loading financing sources...</p>
            </div>
        );
    }

    return (
        <div className="financing-source-management">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Financing Source Management</h1>
                    <p className="page-description">Manage financing sources for loans and credit lines</p>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    + Create Financing Source
                </button>
            </div>

            {error && !showCreateModal && !showEditModal && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    {error}
                </div>
            )}

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Financing Sources</h2>
                </div>

                {sources.length === 0 ? (
                    <div className="alert alert-info" style={{ margin: 'var(--spacing-md)' }}>
                        No financing sources found. Create your first financing source using the button above.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Start Date</th>
                                    <th>Description</th>
                                    <th>Active Loans</th>
                                    <th>Total Loan Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sources.map((source) => (
                                    <tr key={source.id}>
                                        <td>
                                            <strong>{getTypeLabel(source.type)}</strong>
                                        </td>
                                        <td>{parseFloat(source.amount || 0).toLocaleString()} RWF</td>
                                        <td>{source.start_date || 'N/A'}</td>
                                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {source.description || '-'}
                                        </td>
                                        <td>{getTotalLoans(source)}</td>
                                        <td>{getTotalLoanAmount(source).toLocaleString()} RWF</td>
                                        <td>
                                            <span className={`badge ${
                                                source.is_active !== false ? 'badge-success' : 'badge-neutral'
                                            }`}>
                                                {source.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-group">
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => openEditModal(source)}
                                                    disabled={source.is_active === false}
                                                >
                                                    Edit
                                                </button>
                                                {source.is_active !== false && (
                                                    <button
                                                        className="btn btn-outline btn-sm"
                                                        onClick={() => handleDeactivate(source.id)}
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

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={closeModals}
                title="Create Financing Source"
            >
                <form onSubmit={handleCreate}>
                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label required">Type</label>
                        <select
                            className="form-select"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="OWN_FUNDS">Own Funds</option>
                            <option value="GRANT">Grant</option>
                            <option value="TERM_LOAN">Term Loan</option>
                            <option value="REVOLVING_CREDIT">Revolving Credit</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Amount (RWF)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="e.g. 10000000"
                            min="1"
                            step="0.01"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Start Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Optional description or notes"
                            rows="3"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={closeModals}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={closeModals}
                title="Edit Financing Source"
            >
                <form onSubmit={handleUpdate}>
                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label required">Type</label>
                        <select
                            className="form-select"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="OWN_FUNDS">Own Funds</option>
                            <option value="GRANT">Grant</option>
                            <option value="TERM_LOAN">Term Loan</option>
                            <option value="REVOLVING_CREDIT">Revolving Credit</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Amount (RWF)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="e.g. 10000000"
                            min="1"
                            step="0.01"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Start Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Optional description or notes"
                            rows="3"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={closeModals}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default FinancingSourceManagement;
