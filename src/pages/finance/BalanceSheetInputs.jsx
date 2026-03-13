import React, { useState, useEffect } from 'react';
import { excelFinanceAPI } from '../../services/api';

const BalanceSheetInputs = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [excelFileExists, setExcelFileExists] = useState(null);
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [excelData, setExcelData] = useState(null);

    const currentYear = new Date().getFullYear();

    const sections = [
        { id: 'currentAssets', label: 'Current Assets' },
        { id: 'fixedAssets', label: 'Fixed Assets' },
        { id: 'currentLiabilities', label: 'Current Liabilities' },
        { id: 'longTermLiabilities', label: 'Long-Term Liabilities' },
        { id: 'equity', label: "Stockholders' Equity" }
    ];

    const [formData, setFormData] = useState({
        section: 'currentAssets',
        label: '',
        value: '',
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
            const res = await excelFinanceAPI.getBalanceSheet(currentYear);
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

            await excelFinanceAPI.addBalanceSheetEntry(currentYear, {
                section: formData.section,
                label: formData.label,
                value: parseFloat(formData.value) || 0,
            });

            await loadExcelData();
            alert('Balance sheet entry recorded successfully!');
            setFormData(prev => ({ ...prev, label: '', value: '' }));
        } catch (err) {
            console.error('Error recording entry:', err);
            setError(err.message || 'Failed to record entry.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTableSection = (sectionId, sectionLabel, dataArray, total) => {
        if (!dataArray || dataArray.length === 0) return null;

        return (
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-slate-700)' }}>{sectionLabel}</h3>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: '70%' }}>Label</th>
                                <th>Value (RWF)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataArray.map((entry, idx) => (
                                <tr key={idx}>
                                    <td><strong>{entry.label}</strong></td>
                                    <td>RWF {entry.value?.toLocaleString()}</td>
                                </tr>
                            ))}
                            <tr style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold' }}>
                                <td>TOTAL {sectionLabel.toUpperCase()}</td>
                                <td><strong>RWF {total?.toLocaleString()}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Balance Sheet Inputs</h1>
                <p className="page-description">Add manual line items to the Balance Sheet (Balance Sheet Sheet)</p>
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
                    ✅ Excel file active for {currentYear} — records will be saved to the Balance Sheet.
                </div>
            )}

            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Record Line Item</h2>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)', margin: '0 var(--spacing-md)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label required">Balance Sheet Section</label>
                            <select
                                className="form-select"
                                value={formData.section}
                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                required
                                disabled={isSubmitting || !excelFileExists}
                            >
                                {sections.map(s => (
                                    <option key={s.id} value={s.id}>{s.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label required">Label / Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                placeholder="e.g. Various Debtors, Bank RWF, Stock"
                                required
                                disabled={isSubmitting || !excelFileExists}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label required">Value (RWF)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                step="0.01"
                                required
                                disabled={isSubmitting || !excelFileExists}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isSubmitting || !excelFileExists}>
                        {isSubmitting ? 'Recording...' : 'Record to Balance Sheet (Excel)'}
                    </button>
                </form>
            </div>

            {excelFileExists && excelData && (
                <div className="content-card">
                    <div className="card-header">
                        <h2 className="card-title">Balance Sheet Details</h2>
                        <button onClick={loadExcelData} className="btn btn-outline">🔄 Refresh</button>
                    </div>

                    <div style={{ padding: 'var(--spacing-md)' }}>
                        {renderTableSection('currentAssets', 'Current Assets', excelData.currentAssets, excelData.totalCurrentAssets)}
                        {renderTableSection('fixedAssets', 'Fixed Assets', excelData.fixedAssets, excelData.netFixedAssets)}
                        
                        <div style={{ backgroundColor: 'var(--color-slate-100)', padding: 'var(--spacing-sm) var(--spacing-md)', marginBottom: 'var(--spacing-lg)', borderRadius: '4px' }}>
                            <h3 style={{ margin: 0, display: 'flex', justifyContent: 'space-between' }}>
                                <span>TOTAL ASSETS:</span>
                                <span>RWF {(excelData.totalAssets || 0).toLocaleString()}</span>
                            </h3>
                        </div>

                        {renderTableSection('currentLiabilities', 'Current Liabilities', excelData.currentLiabilities, excelData.totalCurrentLiabilities)}
                        {renderTableSection('longTermLiabilities', 'Long-Term Liabilities', excelData.longTermLiabilities, excelData.totalLongTermLiabilities)}
                        {renderTableSection('equity', "Stockholders' Equity", excelData.equity, excelData.totalEquity)}

                        <div style={{ backgroundColor: 'var(--color-slate-100)', padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: '4px' }}>
                            <h3 style={{ margin: 0, display: 'flex', justifyContent: 'space-between' }}>
                                <span>TOTAL LIAB. AND EQUITY:</span>
                                <span>RWF {(excelData.totalLiabilitiesAndEquity || 0).toLocaleString()}</span>
                            </h3>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BalanceSheetInputs;
