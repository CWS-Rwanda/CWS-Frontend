import React, { useState, useEffect } from 'react';
import { excelFinanceAPI } from '../../services/api';

const ExpenseManagement = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [excelFileExists, setExcelFileExists] = useState(null);
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    
    // Data State
    const [directCosts, setDirectCosts] = useState(null);
    const [adminCosts, setAdminCosts] = useState(null);
    const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'admin'

    const currentYear = new Date().getFullYear();

    // Form States
    const [directFormData, setDirectFormData] = useState({
        description: '',
        quantity: '',
        amount: '',
        comment: '',
    });

    const [adminFormData, setAdminFormData] = useState({
        description: '',
        amount: '',
        unit: 'Month',
        num_people: '1',
    });

    // Check if Excel file exists on mount
    useEffect(() => {
        checkExcelFile();
    }, []);

    const checkExcelFile = async () => {
        try {
            const res = await excelFinanceAPI.checkFile(currentYear);
            setExcelFileExists(res.data.data.exists);
            if (res.data.data.exists) {
                loadExcelData();
            }
        } catch (err) {
            console.error('Error checking Excel file:', err);
            setExcelFileExists(false);
        }
    };

    const loadExcelData = async () => {
        try {
            const [directRes, adminRes] = await Promise.all([
                excelFinanceAPI.getDirectCosts(currentYear),
                excelFinanceAPI.getAdminCosts(currentYear)
            ]);
            setDirectCosts(directRes.data.data);
            setAdminCosts(adminRes.data.data);
        } catch (err) {
            console.error('Error loading Excel data:', err);
        }
    };

    const handleCreateFile = async () => {
        setIsCreatingFile(true);
        try {
            await excelFinanceAPI.createFile(currentYear);
            setExcelFileExists(true);
            await loadExcelData();
        } catch (err) {
            console.error('Error creating file:', err);
            setError('Failed to create financial file. Please try again.');
        } finally {
            setIsCreatingFile(false);
        }
    };

    const handleDirectSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (!excelFileExists) throw new Error("Financial Excel file must be created first.");

            const quantity = parseFloat(directFormData.quantity) || 0;
            const amount = parseFloat(directFormData.amount) || 0;
            const total = quantity && amount ? quantity * amount : amount;

            await excelFinanceAPI.addDirectCost(currentYear, {
                description: directFormData.description,
                quantity: quantity,
                amount: amount,
                total: total,
                comment: directFormData.comment,
            });

            await fetchExcelFinanceData(currentYear);
            await loadExcelData();
            alert('Direct Cost recorded successfully!');
            setDirectFormData({ description: '', quantity: '', amount: '', comment: '' });
        } catch (err) {
            console.error('Error creating direct cost:', err);
            setError(err.message || 'Failed to create direct cost.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (!excelFileExists) throw new Error("Financial Excel file must be created first.");

            const amount = parseFloat(adminFormData.amount) || 0;
            const numPeople = parseFloat(adminFormData.num_people) || 1;

            await excelFinanceAPI.addAdminCost(currentYear, {
                description: adminFormData.description,
                amount: amount,
                unit: adminFormData.unit,
                num_people: numPeople,
            });

            await loadExcelData();
            alert('Admin Cost recorded successfully!');
            setAdminFormData({ description: '', amount: '', unit: 'Month', num_people: '1' });
        } catch (err) {
            console.error('Error creating admin cost:', err);
            setError(err.message || 'Failed to create admin cost.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const directTotal = directCosts?.total || 0;
    const adminTotal = adminCosts?.total || 0; // The total calculation in the backend might be based on monthly values

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Direct & Administrative Costs</h1>
                <p className="page-description">Record costs directly matching the Excel templates</p>
            </div>

            {excelFileExists === false && (
                <div className="alert alert-warning" style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <strong>⚠️ No financial statement file found for {currentYear}.</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>You need to create the Excel file before cost data can be saved to it.</p>
                    </div>
                    <button onClick={handleCreateFile} className="btn btn-primary" disabled={isCreatingFile} style={{ whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                        {isCreatingFile ? 'Creating...' : `📄 Create Financial File for ${currentYear}`}
                    </button>
                </div>
            )}

            {excelFileExists === true && (
                <div className="alert alert-success" style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.9rem' }}>
                    ✅ Excel file active for {currentYear}
                </div>
            )}

            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="stat-card">
                    <div className="stat-label">Total Direct Costs (Excel)</div>
                    <div className="stat-value">RWF {directTotal.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Administrative Costs (Excel)</div>
                    <div className="stat-value">RWF {adminTotal.toLocaleString()}</div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0', marginBottom: 'var(--spacing-lg)' }}>
                <button
                    onClick={() => setActiveTab('direct')}
                    className={`btn ${activeTab === 'direct' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderRadius: '8px 0 0 8px' }}
                >
                    Direct Costs
                </button>
                <button
                    onClick={() => setActiveTab('admin')}
                    className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderRadius: '0 8px 8px 0' }}
                >
                    Administrative Costs
                </button>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                    {error}
                </div>
            )}

            {/* DIRECT COSTS TAB */}
            {activeTab === 'direct' && (
                <div className="costs-section">
                    <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <div className="card-header">
                            <h2 className="card-title">Record Direct Cost</h2>
                        </div>
                        <form onSubmit={handleDirectSubmit} style={{ padding: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label className="form-label required">Description</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={directFormData.description}
                                    onChange={(e) => setDirectFormData({ ...directFormData, description: e.target.value })}
                                    placeholder="e.g. Cherry Purchases, Transport Cherries, Electricity"
                                    required
                                    disabled={isSubmitting || !excelFileExists}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <div className="form-group">
                                    <label className="form-label">Quantity</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={directFormData.quantity}
                                        onChange={(e) => setDirectFormData({ ...directFormData, quantity: e.target.value })}
                                        placeholder="e.g. 137600"
                                        step="0.01"
                                        disabled={isSubmitting || !excelFileExists}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Unit Amount / Amount (RWF)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={directFormData.amount}
                                        onChange={(e) => setDirectFormData({ ...directFormData, amount: e.target.value })}
                                        placeholder="e.g. 850"
                                        step="0.01"
                                        required
                                        disabled={isSubmitting || !excelFileExists}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Total (RWF)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={directFormData.quantity && directFormData.amount ? `RWF ${(parseFloat(directFormData.quantity) * parseFloat(directFormData.amount)).toLocaleString()}` : directFormData.amount ? `RWF ${parseFloat(directFormData.amount).toLocaleString()}` : ''}
                                    disabled
                                    style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold' }}
                                />
                                <small style={{ color: 'var(--color-gray-500)' }}>Auto-calculated (Quantity × Amount) or defaults to Amount</small>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Comment</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={directFormData.comment}
                                    onChange={(e) => setDirectFormData({ ...directFormData, comment: e.target.value })}
                                    disabled={isSubmitting || !excelFileExists}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !excelFileExists}>
                                {isSubmitting ? 'Recording...' : 'Record Direct Cost'}
                            </button>
                        </form>
                    </div>

                    <div className="content-card">
                        <div className="card-header">
                            <h2 className="card-title">Direct Costs Sheet (Excel)</h2>
                            <button onClick={loadExcelData} className="btn btn-outline">🔄 Refresh</button>
                        </div>
                        {!directCosts || directCosts.entries?.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>No entries yet.</div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th>Quantity</th>
                                            <th>Amount (RWF)</th>
                                            <th>Total (RWF)</th>
                                            <th>Comment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {directCosts.entries.map((entry, idx) => (
                                            <tr key={idx}>
                                                <td><strong>{entry.description}</strong></td>
                                                <td>{entry.quantity || '-'}</td>
                                                <td>{entry.amount ? `RWF ${entry.amount.toLocaleString()}` : '-'}</td>
                                                <td><strong>RWF {(entry.total || 0).toLocaleString()}</strong></td>
                                                <td>{entry.comment || '-'}</td>
                                            </tr>
                                        ))}
                                        <tr style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold' }}>
                                            <td colSpan="3">TOTAL</td>
                                            <td><strong>RWF {directTotal.toLocaleString()}</strong></td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ADMIN COSTS TAB */}
            {activeTab === 'admin' && (
                <div className="costs-section">
                    <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <div className="card-header">
                            <h2 className="card-title">Record Administrative Cost</h2>
                        </div>
                        <form onSubmit={handleAdminSubmit} style={{ padding: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label className="form-label required">Description</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={adminFormData.description}
                                    onChange={(e) => setAdminFormData({ ...adminFormData, description: e.target.value })}
                                    placeholder="e.g. Office Rent, Director Transport, Legal fees"
                                    required
                                    disabled={isSubmitting || !excelFileExists}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <div className="form-group">
                                    <label className="form-label required">Amount (RWF)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={adminFormData.amount}
                                        onChange={(e) => setAdminFormData({ ...adminFormData, amount: e.target.value })}
                                        step="0.01"
                                        required
                                        disabled={isSubmitting || !excelFileExists}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Unit</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={adminFormData.unit}
                                        onChange={(e) => setAdminFormData({ ...adminFormData, unit: e.target.value })}
                                        placeholder="e.g. Month, Year, Trip"
                                        required
                                        disabled={isSubmitting || !excelFileExists}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label required"># of People</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={adminFormData.num_people}
                                        onChange={(e) => setAdminFormData({ ...adminFormData, num_people: e.target.value })}
                                        step="0.01"
                                        required
                                        disabled={isSubmitting || !excelFileExists}
                                    />
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !excelFileExists}>
                                {isSubmitting ? 'Recording...' : 'Record Admin Cost'}
                            </button>
                        </form>
                    </div>

                    <div className="content-card">
                        <div className="card-header">
                            <h2 className="card-title">Admin Costs Sheet (Excel)</h2>
                            <button onClick={loadExcelData} className="btn btn-outline">🔄 Refresh</button>
                        </div>
                        {!adminCosts || adminCosts.entries?.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>No entries yet.</div>
                        ) : (
                            <div className="table-container" style={{ overflowX: 'auto' }}>
                                <table className="table" style={{ whiteSpace: 'nowrap' }}>
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th>Amount (RWF)</th>
                                            <th>Unit</th>
                                            <th># People</th>
                                            <th>Jan-Dec Values</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adminCosts.entries.map((entry, idx) => {
                                            const hasMonthlyValues = entry.monthly && entry.monthly.some(v => v > 0);
                                            const totalMonthly = hasMonthlyValues ? entry.monthly.reduce((s,v)=>s+v, 0) : null;
                                            
                                            return (
                                                <tr key={idx}>
                                                    <td><strong>{entry.description}</strong></td>
                                                    <td>RWF {entry.amount?.toLocaleString()}</td>
                                                    <td>{entry.unit || '-'}</td>
                                                    <td>{entry.num_people}</td>
                                                    <td>{hasMonthlyValues ? `Total: RWF ${totalMonthly.toLocaleString()}` : '-'}</td>
                                                </tr>
                                            );
                                        })}
                                        <tr style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold' }}>
                                            <td colSpan="4">TOTAL ADMINISTRATIVE COSTS</td>
                                            <td><strong>RWF {adminTotal.toLocaleString()}</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseManagement;
