import React, { useState, useEffect } from 'react';
import { excelFinanceAPI, storageAPI } from '../../services/api';
import { useData } from '../../context/DataContext';

const RevenueManagement = () => {
    const { lots, bags, fetchStorageBags, fetchLots, fetchExcelFinanceData } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [excelFileExists, setExcelFileExists] = useState(null);
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [excelData, setExcelData] = useState(null);

    const currentYear = new Date().getFullYear();

    const [formData, setFormData] = useState({
        bag_id: '',
        unit_price: '',
    });

    const [selectedBag, setSelectedBag] = useState(null);

    useEffect(() => {
        checkExcelFile();
        fetchStorageBags();
        fetchLots();
    }, []);

    useEffect(() => {
        if (formData.bag_id) {
            const bag = bags.find(b => b.id === formData.bag_id);
            setSelectedBag(bag);
        } else {
            setSelectedBag(null);
        }
    }, [formData.bag_id, bags]);

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
            const res = await excelFinanceAPI.getSelling(currentYear);
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
            if (!selectedBag) throw new Error("Please select a bag.");
            
            const quantity = parseFloat(selectedBag.weight_kg);
            const pricePerKg = parseFloat(formData.unit_price);
            const totalPrice = quantity * pricePerKg;

            if (!excelFileExists) {
                throw new Error("Financial Excel file must be created first.");
            }

            // 1. Record to Excel
            const lotName = lots.find(l => l.id === selectedBag.lot_id)?.lotName || 'Unknown Lot';
            await excelFinanceAPI.addSelling(currentYear, {
                item: `Bag: ${selectedBag.bag_code || selectedBag.id} (Lot: ${lotName})`,
                quantity_kg: quantity,
                unit_price: pricePerKg,
            });

            // 2. Mark bag as dispatched/sold
            await storageAPI.update(selectedBag.id, { dispatched: true });

            // 3. Refresh data
            await fetchExcelFinanceData(currentYear);
            await fetchStorageBags();

            alert('Sale recorded successfully to Excel and bag marked as dispatched!');
            setFormData({
                bag_id: '', unit_price: ''
            });
        } catch (err) {
            console.error('Error recording sale:', err);
            setError(err.message || 'Failed to record sale.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const excelTotal = excelData?.total || 0;
    const availableBags = bags.filter(b => !b.dispatched);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Sales / Revenue</h1>
                <p className="page-description">Record coffee sales based on available bags</p>
            </div>

            {excelFileExists === false && (
                <div className="alert alert-warning" style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <strong>⚠️ No financial statement file found for {currentYear}.</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Create the Excel file to record sales data.</p>
                    </div>
                    <button onClick={handleCreateFile} className="btn btn-primary" disabled={isCreatingFile} style={{ whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                        {isCreatingFile ? 'Creating...' : `📄 Create Financial File for ${currentYear}`}
                    </button>
                </div>
            )}

            {excelFileExists === true && (
                <div className="alert alert-success" style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.9rem' }}>
                    ✅ Excel file active for {currentYear} — sales will be saved to the Selling sheet.
                </div>
            )}

            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="stat-card">
                    <div className="stat-label">Total Sales (RWF)</div>
                    <div className="stat-value">RWF {excelTotal.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Recorded Sales Entries</div>
                    <div className="stat-value">{(excelData?.entries?.length) || 0}</div>
                </div>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Record New Sale</h2>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)', margin: '0 var(--spacing-md)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-md)' }}>
                    <div className="form-group">
                        <label className="form-label required">Select Available Bag</label>
                        <select
                            className="form-select"
                            value={formData.bag_id}
                            onChange={(e) => setFormData({ ...formData, bag_id: e.target.value })}
                            required
                            disabled={isSubmitting || !excelFileExists}
                        >
                            <option value="">-- Select Bag --</option>
                            {availableBags.map(bag => {
                                const lot = lots.find(l => l.id === bag.lot_id);
                                return (
                                    <option key={bag.id} value={bag.id}>
                                        {bag.bag_code || bag.id} - {bag.weight_kg}kg (Lot: {lot?.lotName || 'N/A'})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label required">Unit Price (RWF/kg)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.unit_price}
                                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                                step="0.01"
                                min="0"
                                placeholder="e.g. 5000"
                                required
                                disabled={isSubmitting || !excelFileExists}
                            />
                        </div>

                        {selectedBag && formData.unit_price && (
                            <div className="form-group">
                                <label className="form-label">Total Sale Price (RWF)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={`RWF ${(parseFloat(selectedBag.weight_kg) * parseFloat(formData.unit_price)).toLocaleString()}`}
                                    disabled
                                    style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold', fontSize: '1.125rem' }}
                                />
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isSubmitting || !excelFileExists || !formData.bag_id}>
                        {isSubmitting ? 'Recording...' : 'Record Sale to Excel'}
                    </button>
                </form>
            </div>

            {excelFileExists && (
                <div className="content-card">
                    <div className="card-header">
                        <h2 className="card-title">Selling Sheet Entries</h2>
                        <button onClick={loadExcelData} className="btn btn-outline">🔄 Refresh</button>
                    </div>

                    {!excelData || excelData.entries?.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>No selling entries in Excel file yet.</div>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Qty (kg)</th>
                                        <th>U.P (RWF)</th>
                                        <th>T.P (RWF)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {excelData.entries.map((entry, idx) => (
                                        <tr key={idx}>
                                            <td><strong>{entry.item}</strong></td>
                                            <td>{entry.quantity_kg?.toLocaleString()}</td>
                                            <td>RWF {entry.unit_price?.toLocaleString()}</td>
                                            <td><strong>RWF {entry.total_price?.toLocaleString()}</strong></td>
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

export default RevenueManagement;
