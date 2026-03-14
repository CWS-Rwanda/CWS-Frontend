import React, { useState, useEffect } from 'react';
import { excelFinanceAPI } from '../../services/api';

const LaborCosts = () => {
    const { fetchExcelFinanceData } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [excelFileExists, setExcelFileExists] = useState(null);
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [excelData, setExcelData] = useState(null);

    const currentYear = new Date().getFullYear();

    const [formData, setFormData] = useState({
        position: '',
        count: '1',
        per_month: '',
        num_months: '1',
    });

    useEffect(() => {
        checkExcelFile();
    }, []);

    const checkExcelFile = async () => {
        try {
            const res = await excelFinanceAPI.checkFile(currentYear);
            setExcelFileExists(res.data.data.exists);
            if (res.data.data.exists) loadExcelData();
        } catch (err) {
            console.error('Error checking Excel file:', err);
            setExcelFileExists(false);
        }
    };

    const loadExcelData = async () => {
        try {
            const res = await excelFinanceAPI.getStaff(currentYear);
            setExcelData(res.data.data);
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
            setError('Failed to create financial file.');
        } finally {
            setIsCreatingFile(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (!excelFileExists) {
                throw new Error("Financial Excel file must be created first.");
            }

            await excelFinanceAPI.addStaffEntry(currentYear, {
                position: formData.position,
                count: parseFloat(formData.count) || 0,
                per_month: parseFloat(formData.per_month) || 0,
                num_months: parseFloat(formData.num_months) || 0,
            });

            await fetchExcelFinanceData(currentYear);
            await loadExcelData();
            alert('Staff entry recorded successfully!');
            setFormData({
                position: '', count: '1', per_month: '', num_months: '1'
            });
        } catch (err) {
            console.error('Error recording staff entry:', err);
            setError(err.message || 'Failed to record staff entry.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const excelTotal = excelData?.total || 0;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Staff & Casual Workers</h1>
                <p className="page-description">Manage salary and wages data (Staff Sheet)</p>
            </div>

            {excelFileExists === false && (
                <div className="alert alert-warning" style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <strong>⚠️ No financial statement file found for {currentYear}.</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Create the Excel file to record staff data.</p>
                    </div>
                    <button onClick={handleCreateFile} className="btn btn-primary" disabled={isCreatingFile} style={{ whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                        {isCreatingFile ? 'Creating...' : `📄 Create Financial File for ${currentYear}`}
                    </button>
                </div>
            )}

            {excelFileExists === true && (
                <div className="alert alert-success" style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.9rem' }}>
                    ✅ Excel file active for {currentYear} — records will be saved to the Staff sheet.
                </div>
            )}

            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="stat-card">
                    <div className="stat-label">Total Labor Costs (RWF)</div>
                    <div className="stat-value">RWF {excelTotal.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Recorded Staff Groups</div>
                    <div className="stat-value">{(excelData?.entries?.length) || 0}</div>
                </div>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Record Staff Cost</h2>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)', margin: '0 var(--spacing-md)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-md)' }}>
                    <div className="form-group">
                        <label className="form-label required">Position</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            placeholder="e.g. Washers, Reception, Manager"
                            required
                            disabled={isSubmitting || !excelFileExists}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label required"># (Count)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.count}
                                onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                                step="0.1"
                                min="0"
                                required
                                disabled={isSubmitting || !excelFileExists}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label required">Per Month (RWF)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.per_month}
                                onChange={(e) => setFormData({ ...formData, per_month: e.target.value })}
                                step="0.01"
                                min="0"
                                required
                                disabled={isSubmitting || !excelFileExists}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label required"># of Months</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.num_months}
                                onChange={(e) => setFormData({ ...formData, num_months: e.target.value })}
                                step="0.1"
                                min="0"
                                required
                                disabled={isSubmitting || !excelFileExists}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Total (RWF)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={`RWF ${(parseFloat(formData.count || 0) * parseFloat(formData.per_month || 0) * parseFloat(formData.num_months || 0)).toLocaleString()}`}
                                disabled
                                style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold' }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isSubmitting || !excelFileExists}>
                        {isSubmitting ? 'Recording...' : 'Record Staff Cost to Excel'}
                    </button>
                </form>
            </div>

            {excelFileExists && (
                <div className="content-card">
                    <div className="card-header">
                        <h2 className="card-title">Staff Sheet Entries</h2>
                        <button onClick={loadExcelData} className="btn btn-outline">🔄 Refresh</button>
                    </div>

                    {!excelData || excelData.entries?.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>No staff entries in Excel file yet.</div>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Position</th>
                                        <th># Count</th>
                                        <th>Per Month (RWF)</th>
                                        <th># of Months</th>
                                        <th>Total (RWF)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {excelData.entries.map((entry, idx) => (
                                        <tr key={idx}>
                                            <td><strong>{entry.position}</strong></td>
                                            <td>{entry.count}</td>
                                            <td>RWF {entry.per_month?.toLocaleString()}</td>
                                            <td>{entry.num_months}</td>
                                            <td><strong>RWF {entry.total?.toLocaleString()}</strong></td>
                                        </tr>
                                    ))}
                                    <tr style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold' }}>
                                        <td colSpan="4">TOTAL</td>
                                        <td><strong>RWF {excelTotal.toLocaleString()}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LaborCosts;
