import React, { useState, useEffect } from 'react';
import { excelFinanceAPI } from '../../services/api';

const AssetManagement = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [excelFileExists, setExcelFileExists] = useState(null);
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [excelData, setExcelData] = useState(null);

    const currentYear = new Date().getFullYear();

    const [formData, setFormData] = useState({
        asset: '',
        acquisition_value: '',
        net_value_prev: '',
        depreciation_rate: '',
        prior_cumulated: '',
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
            const res = await excelFinanceAPI.getAmortization(currentYear);
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

            await excelFinanceAPI.addAmortEntry(currentYear, {
                asset: formData.asset,
                acquisition_value: parseFloat(formData.acquisition_value) || 0,
                net_value_prev: parseFloat(formData.net_value_prev) || 0,
                depreciation_rate: parseFloat(formData.depreciation_rate) / 100 || 0, // Convert percentage to decimal
                prior_cumulated: parseFloat(formData.prior_cumulated) || 0,
            });

            await loadExcelData();
            alert('Amortization entry recorded successfully!');
            setFormData({
                asset: '', acquisition_value: '', net_value_prev: '', depreciation_rate: '', prior_cumulated: ''
            });
        } catch (err) {
            console.error('Error recording entry:', err);
            setError(err.message || 'Failed to record entry.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const excelTotal = excelData?.total || {};

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Asset Amortization</h1>
                <p className="page-description">Manage asset depreciation (Amort Sheet)</p>
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
                    ✅ Excel file active for {currentYear} — records will be saved to the Amortization sheet.
                </div>
            )}

            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="stat-card">
                    <div className="stat-label">Total Annual Amortization (RWF)</div>
                    <div className="stat-value">RWF {(excelTotal.annual_amortization || 0).toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Net Asset Value {currentYear} (RWF)</div>
                    <div className="stat-value">RWF {(excelTotal.net_value_current || 0).toLocaleString()}</div>
                </div>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Record Asset Amortization</h2>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)', margin: '0 var(--spacing-md)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-md)' }}>
                    <div className="form-group">
                        <label className="form-label required">Asset Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.asset}
                            onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                            placeholder="e.g. Processing Equipment, Vehicle"
                            required
                            disabled={isSubmitting || !excelFileExists}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label required">Acquisition Value (RWF)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.acquisition_value}
                                onChange={(e) => setFormData({ ...formData, acquisition_value: e.target.value })}
                                step="0.01"
                                min="0"
                                required
                                disabled={isSubmitting || !excelFileExists}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label required">Net value {currentYear - 1} (RWF)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.net_value_prev}
                                onChange={(e) => setFormData({ ...formData, net_value_prev: e.target.value })}
                                step="0.01"
                                min="0"
                                required
                                disabled={isSubmitting || !excelFileExists}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label required">Depreciation Rate (%)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.depreciation_rate}
                                onChange={(e) => setFormData({ ...formData, depreciation_rate: e.target.value })}
                                step="0.01"
                                min="0"
                                max="100"
                                placeholder="e.g. 20 for 20%"
                                required
                                disabled={isSubmitting || !excelFileExists}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label required">Prior Cumulated Amortization (RWF)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.prior_cumulated}
                                onChange={(e) => setFormData({ ...formData, prior_cumulated: e.target.value })}
                                step="0.01"
                                min="0"
                                required
                                disabled={isSubmitting || !excelFileExists}
                            />
                        </div>
                    </div>

                    {/* Preview Calculations */}
                    {formData.acquisition_value && formData.depreciation_rate && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Annual Amortization (Calculated)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={`RWF ${(parseFloat(formData.acquisition_value) * (parseFloat(formData.depreciation_rate) / 100)).toLocaleString()}`}
                                    disabled
                                    style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold' }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Cumulated {currentYear} (Calculated)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={`RWF ${((parseFloat(formData.prior_cumulated) || 0) + (parseFloat(formData.acquisition_value) * (parseFloat(formData.depreciation_rate) / 100))).toLocaleString()}`}
                                    disabled
                                    style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold' }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Net Value {currentYear} (Calculated)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={`RWF ${(parseFloat(formData.acquisition_value) - ((parseFloat(formData.prior_cumulated) || 0) + (parseFloat(formData.acquisition_value) * (parseFloat(formData.depreciation_rate) / 100)))).toLocaleString()}`}
                                    disabled
                                    style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold' }}
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={isSubmitting || !excelFileExists} style={{ marginTop: 'var(--spacing-md)' }}>
                        {isSubmitting ? 'Recording...' : 'Record Amortization to Excel'}
                    </button>
                </form>
            </div>

            {excelFileExists && (
                <div className="content-card">
                    <div className="card-header">
                        <h2 className="card-title">Amortization Sheet Entries</h2>
                        <button onClick={loadExcelData} className="btn btn-outline">🔄 Refresh</button>
                    </div>

                    {!excelData || excelData.entries?.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>No amortization entries in Excel file yet.</div>
                    ) : (
                        <div className="table-container" style={{ overflowX: 'auto' }}>
                            <table className="table" style={{ whiteSpace: 'nowrap' }}>
                                <thead>
                                    <tr>
                                        <th>Fixed Assets</th>
                                        <th>Acquisition Value</th>
                                        <th>Net Value {currentYear - 1}</th>
                                        <th>Depr. Rate</th>
                                        <th>Prior Cumulated</th>
                                        <th>Amort. Annual</th>
                                        <th>Cumulated {currentYear}</th>
                                        <th>Net Value {currentYear}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {excelData.entries.map((entry, idx) => (
                                        <tr key={idx}>
                                            <td><strong>{entry.asset}</strong></td>
                                            <td>RWF {entry.acquisition_value?.toLocaleString()}</td>
                                            <td>RWF {entry.net_value_prev?.toLocaleString()}</td>
                                            <td>{(entry.depreciation_rate * 100)?.toLocaleString()}%</td>
                                            <td>RWF {entry.prior_cumulated?.toLocaleString()}</td>
                                            <td>RWF {entry.annual_amortization?.toLocaleString()}</td>
                                            <td>RWF {entry.cumulated_current?.toLocaleString()}</td>
                                            <td><strong>RWF {entry.net_value_current?.toLocaleString()}</strong></td>
                                        </tr>
                                    ))}
                                    <tr style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold' }}>
                                        <td colSpan="1">TOTAL</td>
                                        <td>RWF {(excelTotal.acquisition_value || 0).toLocaleString()}</td>
                                        <td>RWF {(excelTotal.net_value_prev || 0).toLocaleString()}</td>
                                        <td></td>
                                        <td>RWF {(excelTotal.prior_cumulated || 0).toLocaleString()}</td>
                                        <td>RWF {(excelTotal.annual_amortization || 0).toLocaleString()}</td>
                                        <td>RWF {(excelTotal.cumulated_current || 0).toLocaleString()}</td>
                                        <td><strong>RWF {(excelTotal.net_value_current || 0).toLocaleString()}</strong></td>
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

export default AssetManagement;
