import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { revenuesAPI } from '../../services/api';

const RevenueManagement = () => {
    const { lots, revenue, seasons, fetchRevenues, loading } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        lot_id: '',
        quantity_kg: '',
        price_per_kg: '8500',
        sale_type: 'LOCAL',
        sale_date: new Date().toISOString().split('T')[0],
    });

    const currentSeason = seasons.find(s => s.active === true || s.status === 'ACTIVE' || s.status === 'active');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const lot = lots.find(l => l.id === formData.lot_id);
            if (!lot) {
                setError('Please select a valid lot');
                setIsSubmitting(false);
                return;
            }

            const quantity = parseFloat(formData.quantity_kg);
            const pricePerKg = parseFloat(formData.price_per_kg);
            const totalAmount = quantity * pricePerKg;

            await revenuesAPI.create({
                lot_id: formData.lot_id,
                season_id: currentSeason?.id || null,
                sale_type: formData.sale_type,
                quantity_kg: quantity,
                price_per_kg: pricePerKg,
                total_amount: totalAmount,
                sale_date: formData.sale_date
            });

            alert('Revenue recorded successfully! Lot marked as COMPLETED.');
            setFormData({ lot_id: '', quantity_kg: '', price_per_kg: '8500', sale_type: 'LOCAL', sale_date: new Date().toISOString().split('T')[0] });
            await fetchRevenues();
        } catch (err) {
            console.error('Error creating revenue:', err);
            setError(err.message || 'Failed to record revenue. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Transform revenue for display
    const transformRevenue = (rev) => ({
        id: rev.id,
        date: rev.sale_date || rev.date,
        lotId: rev.lot_id,
        grade: rev.grade || '',
        quantity: parseFloat(rev.quantity_kg || 0),
        pricePerKg: parseFloat(rev.price_per_kg || 0),
        totalRevenue: parseFloat(rev.total_amount || 0),
        saleType: rev.sale_type || 'LOCAL',
    });

    const totalRevenue = revenue.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Revenue Management</h1>
                <p className="page-description">Track sales and revenue</p>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="stat-card">
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value">RWF {totalRevenue.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Number of Sales</div>
                    <div className="stat-value">{revenue.length}</div>
                </div>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Record Sale</h2>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Select Lot</label>
                        <select
                            className="form-select"
                            value={formData.lot_id}
                            onChange={(e) => setFormData({ ...formData, lot_id: e.target.value })}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">-- Select Lot --</option>
                            {lots.filter(l => l.status === 'completed' || l.status === 'in process' || l.status === 'created').map(lot => (
                                <option key={lot.id} value={lot.id}>
                                    {lot.lotName || lot.id} - Grade {lot.grade || 'N/A'} ({lot.processingMethod})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Sale Type</label>
                        <select
                            className="form-select"
                            value={formData.sale_type}
                            onChange={(e) => setFormData({ ...formData, sale_type: e.target.value })}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="LOCAL">Local</option>
                            <option value="EXPORT">Export</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Sale Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.sale_date}
                            onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Quantity Sold (kg)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.quantity_kg}
                            onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                            step="0.1"
                            min="0"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Price per Kg (RWF)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.price_per_kg}
                            onChange={(e) => setFormData({ ...formData, price_per_kg: e.target.value })}
                            step="0.01"
                            min="0"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {formData.quantity_kg && formData.price_per_kg && (
                        <div className="form-group">
                            <label className="form-label">Total Revenue</label>
                            <input
                                type="text"
                                className="form-input"
                                value={`RWF ${(parseFloat(formData.quantity_kg) * parseFloat(formData.price_per_kg)).toLocaleString()}`}
                                disabled
                                style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold', fontSize: '1.125rem' }}
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Recording...' : 'Record Sale'}
                    </button>
                </form>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Sales History</h2>
                </div>

                {loading.revenue ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading sales history...</div>
                ) : revenue.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No sales recorded yet.</div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Lot ID</th>
                                    <th>Grade</th>
                                    <th>Sale Type</th>
                                    <th>Quantity (kg)</th>
                                    <th>Price/kg</th>
                                    <th>Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenue.slice().reverse().map(sale => {
                                    const transformed = transformRevenue(sale);
                                    return (
                                        <tr key={transformed.id}>
                                            <td>{transformed.date}</td>
                                            <td><strong>{transformed.lotId}</strong></td>
                                            <td>
                                                <span className="badge badge-success">Grade {transformed.grade}</span>
                                            </td>
                                            <td>
                                                <span className="badge badge-info">{transformed.saleType}</span>
                                            </td>
                                            <td>{transformed.quantity.toFixed(2)}</td>
                                            <td>RWF {transformed.pricePerKg.toLocaleString()}</td>
                                            <td><strong>RWF {transformed.totalRevenue.toLocaleString()}</strong></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenueManagement;
