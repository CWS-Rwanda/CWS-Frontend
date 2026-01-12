import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { generateId } from '../../utils/dummyData';

const RevenueManagement = () => {
    const { lots, revenue, setRevenue } = useData();
    const [formData, setFormData] = useState({
        lotId: '',
        quantity: '',
        pricePerKg: '8500',
        buyer: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const lot = lots.find(l => l.id === formData.lotId);

        const newRevenue = {
            id: generateId('REV'),
            date: new Date().toISOString().split('T')[0],
            lotId: formData.lotId,
            grade: lot?.grade || 'A',
            quantity: parseFloat(formData.quantity),
            pricePerKg: parseFloat(formData.pricePerKg),
            totalRevenue: parseFloat(formData.quantity) * parseFloat(formData.pricePerKg),
            buyer: formData.buyer,
        };

        setRevenue([...revenue, newRevenue]);
        alert('Revenue recorded successfully!');
        setFormData({ lotId: '', quantity: '', pricePerKg: '8500', buyer: '' });
    };

    const totalRevenue = revenue.reduce((sum, r) => sum + r.totalRevenue, 0);

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

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Select Lot</label>
                        <select
                            className="form-select"
                            value={formData.lotId}
                            onChange={(e) => setFormData({ ...formData, lotId: e.target.value })}
                            required
                        >
                            <option value="">-- Select Lot --</option>
                            {lots.filter(l => l.approved).map(lot => (
                                <option key={lot.id} value={lot.id}>
                                    {lot.id} - Grade {lot.grade} ({lot.totalWeight} kg)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Quantity Sold (kg)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            step="0.1"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Price per Kg (RWF)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.pricePerKg}
                            onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                            required
                        />
                    </div>

                    {formData.quantity && formData.pricePerKg && (
                        <div className="form-group">
                            <label className="form-label">Total Revenue</label>
                            <input
                                type="text"
                                className="form-input"
                                value={`RWF ${(parseFloat(formData.quantity) * parseFloat(formData.pricePerKg)).toLocaleString()}`}
                                disabled
                                style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold', fontSize: '1.125rem' }}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label required">Buyer</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.buyer}
                            onChange={(e) => setFormData({ ...formData, buyer: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Record Sale
                    </button>
                </form>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Sales History</h2>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Lot ID</th>
                                <th>Grade</th>
                                <th>Quantity (kg)</th>
                                <th>Price/kg</th>
                                <th>Total Revenue</th>
                                <th>Buyer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {revenue.slice().reverse().map(sale => (
                                <tr key={sale.id}>
                                    <td>{sale.date}</td>
                                    <td><strong>{sale.lotId}</strong></td>
                                    <td>
                                        <span className="badge badge-success">Grade {sale.grade}</span>
                                    </td>
                                    <td>{sale.quantity}</td>
                                    <td>RWF {sale.pricePerKg.toLocaleString()}</td>
                                    <td><strong>RWF {sale.totalRevenue.toLocaleString()}</strong></td>
                                    <td>{sale.buyer}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RevenueManagement;
