import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { generateId } from '../../utils/dummyData';
import Modal from '../../components/common/Modal';

const ExpenseManagement = () => {
    const { expenses, setExpenses } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        category: 'Energy & Utilities',
        description: '',
        amount: '',
    });

    const categories = [
        'Energy & Utilities',
        'Maintenance',
        'Consumables',
        'Administration',
        'Environmental',
        'Other'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        const newExpense = {
            id: generateId('EXP'),
            date: new Date().toISOString().split('T')[0],
            category: formData.category,
            description: formData.description,
            amount: parseFloat(formData.amount),
            season: '2025A',
            receipt: null,
        };

        setExpenses([...expenses, newExpense]);
        setIsModalOpen(false);
        setFormData({ category: 'Energy & Utilities', description: '', amount: '' });
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

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
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                        + Add Expense
                    </button>
                </div>

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
                            {expenses.slice().reverse().map(expense => (
                                <tr key={expense.id}>
                                    <td>{expense.date}</td>
                                    <td>
                                        <span className="badge badge-info">{expense.category}</span>
                                    </td>
                                    <td>{expense.description}</td>
                                    <td><strong>RWF {expense.amount.toLocaleString()}</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Category</label>
                        <select
                            className="form-select"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
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
                        <button type="submit" className="btn btn-primary">Add Expense</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ExpenseManagement;
