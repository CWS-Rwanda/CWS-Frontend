import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { expensesAPI } from '../../services/api';
import Modal from '../../components/common/Modal';

const ExpenseManagement = () => {
    const { expenses, seasons, fetchExpenses, loading } = useData();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        category: 'UTILITIES',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
    });

    // Map frontend categories to backend ENUM values
    const categories = [
        { label: 'Transport', value: 'TRANSPORT' },
        { label: 'Labor', value: 'LABOR' },
        { label: 'Equipment Maintenance', value: 'EQUIPMENT_MAINTENANCE' },
        { label: 'Raw Materials', value: 'RAW_MATERIALS' },
        { label: 'Administration', value: 'ADMINISTRATION' },
        { label: 'Utilities', value: 'UTILITIES' },
        { label: 'Other', value: 'OTHER' }
    ];

    const currentSeason = seasons.find(s => s.active === true || s.status === 'ACTIVE' || s.status === 'active');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (!currentSeason) {
                setError('No active season found. Please create or activate a season first.');
                setIsSubmitting(false);
                return;
            }

            await expensesAPI.create({
                season_id: currentSeason.id,
                category: formData.category,
                description: formData.description,
                amount: parseFloat(formData.amount),
                expense_date: formData.expense_date
            });

            setIsModalOpen(false);
            setFormData({ category: 'UTILITIES', description: '', amount: '', expense_date: new Date().toISOString().split('T')[0] });
            await fetchExpenses();
        } catch (err) {
            console.error('Error creating expense:', err);
            setError(err.message || 'Failed to create expense. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    
    // Transform expense for display
    const transformExpense = (expense) => ({
        id: expense.id,
        date: expense.expense_date || expense.date,
        category: expense.category,
        description: expense.description || '',
        amount: parseFloat(expense.amount || 0),
    });

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Expense Management</h1>
                <p className="page-description">Track operating expenses</p>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="stat-card">
                    <div className="stat-label">Total Expenses</div>
                    <div className="stat-value">RWF {totalExpenses.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Number of Expenses</div>
                    <div className="stat-value">{expenses.length}</div>
                </div>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">All Expenses</h2>
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" disabled={!currentSeason}>
                        + Add Expense
                    </button>
                </div>

                {loading.expenses ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading expenses...</div>
                ) : expenses.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No expenses found.</div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.slice().reverse().map(expense => {
                                    const transformed = transformExpense(expense);
                                    return (
                                        <tr key={transformed.id}>
                                            <td>{transformed.date}</td>
                                            <td>
                                                <span className="badge badge-info">{transformed.category.replace('_', ' ')}</span>
                                            </td>
                                            <td>{transformed.description}</td>
                                            <td><strong>RWF {transformed.amount.toLocaleString()}</strong></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense">
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Category</label>
                        <select
                            className="form-select"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                            disabled={isSubmitting}
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.expense_date}
                            onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Description</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Amount (RWF)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Expense'}
                        </button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" disabled={isSubmitting}>
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ExpenseManagement;
