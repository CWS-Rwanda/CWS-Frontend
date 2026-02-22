import React, { useState, useEffect } from 'react';
import { financingAPI, loansDetailsAPI } from '../../services/api';
import Modal from '../../components/common/Modal';

const LoanManagement = () => {
    const [financingSources, setFinancingSources] = useState([]);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [error, setError] = useState(null);
    
    const [formData, setFormData] = useState({
        financing_source_id: '',
        principal_amount: '',
        interest_rate: '',
        term_months: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [sourcesRes, loansRes] = await Promise.all([
                financingAPI.getAll(),
                loansDetailsAPI.getAll(),
            ]);
            
            if (sourcesRes.data?.success) {
                setFinancingSources(sourcesRes.data.data || []);
            }
            if (loansRes.data?.success) {
                setLoans(loansRes.data.data || []);
            }
        } catch (error) {
            console.error('Error loading loan data:', error);
            setError('Failed to load loan data. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const generateRepaymentSchedule = (principal, interestRate, termMonths) => {
        const monthlyRate = interestRate / 100 / 12;
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                              (Math.pow(1 + monthlyRate, termMonths) - 1);
        
        const schedule = [];
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() + 1); // First payment next month
        
        for (let i = 0; i < termMonths; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(startDate.getMonth() + i);
            schedule.push({
                due_date: dueDate.toISOString().split('T')[0],
                amount: parseFloat(monthlyPayment.toFixed(2))
            });
        }
        
        return schedule;
    };

    const handleCreateLoan = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.financing_source_id || !formData.principal_amount || 
            !formData.interest_rate || !formData.term_months) {
            setError('Please fill in all required fields.');
            return;
        }

        const principal = parseFloat(formData.principal_amount);
        const interestRate = parseFloat(formData.interest_rate);
        const termMonths = parseInt(formData.term_months);

        if (principal <= 0 || interestRate <= 0 || termMonths <= 0) {
            setError('All values must be positive numbers.');
            return;
        }

        setIsSubmitting(true);
        try {
            const repaymentSchedule = generateRepaymentSchedule(principal, interestRate, termMonths);

            const response = await loansDetailsAPI.create({
                financing_source_id: formData.financing_source_id,
                principal_amount: principal,
                interest_rate: interestRate,
                term_months: termMonths,
                repayment_schedule: repaymentSchedule,
            });

            if (response.data?.success) {
                alert('Loan created successfully!');
                setShowCreateModal(false);
                setFormData({
                    financing_source_id: '',
                    principal_amount: '',
                    interest_rate: '',
                    term_months: '',
                });
                await loadData();
            } else {
                setError(response.data?.message || 'Failed to create loan.');
            }
        } catch (error) {
            console.error('Error creating loan:', error);
            setError(error.response?.data?.message || error.message || 'Failed to create loan. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFinancingSourceName = (sourceId) => {
        const source = financingSources.find(s => s.id === sourceId);
        return source ? `${source.type} - ${source.description || 'No description'}` : 'Unknown Source';
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="loading-spinner"></div>
                <p>Loading loan data...</p>
            </div>
        );
    }

    return (
        <div className="loan-management">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Loan Management</h1>
                    <p className="page-description">Create and manage term loans from financing sources</p>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    + Create New Loan
                </button>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    {error}
                </div>
            )}

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Active Loans</h2>
                </div>

                {loans.length === 0 ? (
                    <div className="alert alert-info" style={{ margin: 'var(--spacing-md)' }}>
                        No loans found. Create your first loan using the button above.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Financing Source</th>
                                    <th>Principal Amount</th>
                                    <th>Interest Rate</th>
                                    <th>Term (Months)</th>
                                    <th>Total Payable</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loans.map((loan) => (
                                    <tr key={loan.id}>
                                        <td>
                                            <strong>{getFinancingSourceName(loan.financing_source_id)}</strong>
                                        </td>
                                        <td>{parseFloat(loan.principal_amount || 0).toLocaleString()} RWF</td>
                                        <td>{parseFloat(loan.interest_rate || 0).toFixed(2)}%</td>
                                        <td>{loan.term_months}</td>
                                        <td>
                                            <strong>{parseFloat(loan.total_payable || 0).toLocaleString()} RWF</strong>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                loan.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'
                                            }`}>
                                                {loan.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td>{loan.created_at?.split('T')[0] || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Loan Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setError(null);
                    setFormData({
                        financing_source_id: '',
                        principal_amount: '',
                        interest_rate: '',
                        term_months: '',
                    });
                }}
                title="Create New Loan"
            >
                <form onSubmit={handleCreateLoan}>
                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label required">Financing Source</label>
                        <select
                            className="form-select"
                            value={formData.financing_source_id}
                            onChange={(e) => setFormData({ ...formData, financing_source_id: e.target.value })}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">-- Select Financing Source --</option>
                            {financingSources
                                .filter(source => source.is_active !== false)
                                .map((source) => (
                                <option key={source.id} value={source.id}>
                                    {source.type} - {source.description || 'No description'} 
                                    ({parseFloat(source.amount || 0).toLocaleString()} RWF)
                                </option>
                            ))}
                        </select>
                        {financingSources.length === 0 && (
                            <small style={{ color: 'var(--color-gray-600)', display: 'block', marginTop: '0.5rem' }}>
                                No financing sources available. Please create a financing source first.
                            </small>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Principal Amount (RWF)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.principal_amount}
                            onChange={(e) => setFormData({ ...formData, principal_amount: e.target.value })}
                            placeholder="e.g. 5000000"
                            min="1"
                            step="0.01"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Interest Rate (%)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.interest_rate}
                            onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                            placeholder="e.g. 12.5"
                            min="0.01"
                            max="100"
                            step="0.01"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Term (Months)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.term_months}
                            onChange={(e) => setFormData({ ...formData, term_months: e.target.value })}
                            placeholder="e.g. 12"
                            min="1"
                            step="1"
                            required
                            disabled={isSubmitting}
                        />
                        <small style={{ color: 'var(--color-gray-600)', display: 'block', marginTop: '0.5rem' }}>
                            Repayment schedule will be generated automatically (monthly installments).
                        </small>
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => {
                                setShowCreateModal(false);
                                setError(null);
                                setFormData({
                                    financing_source_id: '',
                                    principal_amount: '',
                                    interest_rate: '',
                                    term_months: '',
                                });
                            }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Loan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default LoanManagement;
