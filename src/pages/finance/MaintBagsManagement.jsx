import React, { useState, useEffect } from 'react';
import { excelFinanceAPI } from '../../services/api';

const MaintBagsManagement = () => {
    const { fetchExcelFinanceData } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [excelFileExists, setExcelFileExists] = useState(null);
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [excelData, setExcelData] = useState(null);

    const currentYear = new Date().getFullYear();

    const [formData, setFormData] = useState({
        item: '',
        units: '',
        unit_cost: '',
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
            const res = await excelFinanceAPI.getMaintBags(currentYear);
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

            await excelFinanceAPI.addMaintBagsEntry(currentYear, {
                item: formData.item,
                units: parseFloat(formData.units) || 0,
                unit_cost: parseFloat(formData.unit_cost) || 0,
            });

            await fetchExcelFinanceData(currentYear);
            await loadExcelData();
            alert('Maintenance/Bags entry recorded successfully!');
            setFormData({
                item: '', units: '', unit_cost: ''
            });
        } catch (err) {
            console.error('Error recording entry:', err);
            setError(err.message || 'Failed to record entry.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const excelTotal = excelData?.total || 0;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Maintenance & Bags</h1>
                <p className="page-description">Manage material and maintenance costs (Maint & Bags Sheet)</p>
            </div>

            {excelFileExists === false && (
                <div className="alert alert-warning" style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <strong>⚠️ No financial statement file found for {currentYear}.</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Create the Excel file to record data.</p>
                    </div>
                    <button onClick={handleCreateFile} className="btn btn-primary" disabled={isCreatingFile} style={{ whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                        {isCreatingFile ? 'Creating...' : `📄 Create Financial File for ${currentYear}`}
                    </button>
                </div>
            )}

            {excelFileExists === true && (
                <div className="alert alert-success" style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.9rem' }}>
                    ✅ Excel file active for {currentYear} — records will be saved to the Maint & Bags sheet.
                </div>
            )}

            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="stat-card">
                    <div className="stat-label">Total Maintenance & Bags (RWF)</div>
                    <div className="stat-value">RWF {excelTotal.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Recorded Entries</div>
                    <div className="stat-value">{(excelData?.entries?.length) || 0}</div>
                </div>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Record Cost</h2>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)', margin: '0 var(--spacing-md)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-md)' }}>
                    <div className="form-group">
                        <label className="form-label required">Item</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.item}
                            onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                            placeholder="e.g. Bags required per KGs sold, Factory Repairs"
                            required
                            disabled={isSubmitting || !excelFileExists}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label required"># Units</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.units}
                                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                                step="0.1"
                                min="0"
                                required
                                disabled={isSubmitting || !excelFileExists}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label required">Unit Cost (RWF)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.unit_cost}
                                onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                                step="0.01"
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
                                value={`RWF ${(parseFloat(formData.units || 0) * parseFloat(formData.unit_cost || 0)).toLocaleString()}`}
                                disabled
                                style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold' }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isSubmitting || !excelFileExists}>
                        {isSubmitting ? 'Recording...' : 'Record to Excel'}
                    </button>
                </form>
            </div>

            {excelFileExists && (
                <div className="content-card">
                    <div className="card-header">
                        <h2 className="card-title">Maintenance & Bags Sheet Entries</h2>
                        <button onClick={loadExcelData} className="btn btn-outline">🔄 Refresh</button>
                    </div>

                    {!excelData || excelData.entries?.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>No entries in Excel file yet.</div>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th># Units</th>
                                        <th>Unit Cost (RWF)</th>
                                        <th>Total (RWF)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {excelData.entries.map((entry, idx) => (
                                        <tr key={idx}>
                                            <td><strong>{entry.item}</strong></td>
                                            <td>{entry.units?.toLocaleString()}</td>
                                            <td>RWF {entry.unit_cost?.toLocaleString()}</td>
                                            <td><strong>RWF {entry.total?.toLocaleString()}</strong></td>
                                        </tr>
                                    ))}
                                    <tr style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold' }}>
                                        <td colSpan="3">TOTAL</td>
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

export default MaintBagsManagement;
