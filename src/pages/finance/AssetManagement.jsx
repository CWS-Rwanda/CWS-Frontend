import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { assetsAPI } from '../../services/api';
import Modal from '../../components/common/Modal';

const AssetManagement = () => {
    const { assets, fetchAssets, loading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'EQUIPMENT',
        purchase_value: '',
        purchase_date: new Date().toISOString().split('T')[0],
        lifespan_years: '',
    });

    // Calculate current value based on depreciation
    const calculateCurrentValue = (asset) => {
        const purchaseValue = parseFloat(asset.purchase_value || 0);
        
        // If no purchase date, assume it was purchased recently (no depreciation yet)
        if (!asset.purchase_date) {
            return purchaseValue;
        }
        
        const purchaseDate = new Date(asset.purchase_date);
        const lifespanYears = asset.lifespan_years || 1;
        const currentDate = new Date();
        
        // Calculate years since purchase
        const yearsSincePurchase = (currentDate - purchaseDate) / (1000 * 60 * 60 * 24 * 365);
        
        // If purchase date is in the future, assume no depreciation yet
        if (yearsSincePurchase < 0) {
            return purchaseValue;
        }
        
        // Calculate depreciation rate (capped at 100%)
        const depreciationRate = Math.min(yearsSincePurchase / lifespanYears, 1);
        
        // Apply depreciation
        return purchaseValue * (1 - depreciationRate);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await assetsAPI.create({
                name: formData.name,
                category: formData.category,
                purchase_value: parseFloat(formData.purchase_value),
                purchase_date: formData.purchase_date,
                lifespan_years: parseInt(formData.lifespan_years)
            });

            setIsModalOpen(false);
            setFormData({ name: '', category: 'EQUIPMENT', purchase_value: '', purchase_date: new Date().toISOString().split('T')[0], lifespan_years: '' });
            await fetchAssets();
        } catch (err) {
            console.error('Error creating asset:', err);
            setError(err.message || 'Failed to create asset. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalAssetValue = assets.reduce((sum, a) => sum + calculateCurrentValue(a), 0);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Asset Management</h1>
                <p className="page-description">Track assets and depreciation</p>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="stat-card">
                    <div className="stat-label">Total Asset Value</div>
                    <div className="stat-value">RWF {totalAssetValue.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Number of Assets</div>
                    <div className="stat-value">{assets.length}</div>
                </div>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">All Assets</h2>
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                        + Add Asset
                    </button>
                </div>

                {loading.assets ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading assets...</div>
                ) : assets.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No assets found. Add your first asset to get started.</div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Asset Name</th>
                                    <th>Category</th>
                                    <th>Purchase Date</th>
                                    <th>Purchase Value</th>
                                    <th>Lifespan (years)</th>
                                    <th>Current Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assets.map(asset => {
                                    const currentValue = calculateCurrentValue(asset);
                                    return (
                                        <tr key={asset.id}>
                                            <td><strong>{asset.name}</strong></td>
                                            <td>
                                                <span className="badge badge-info">{asset.category}</span>
                                            </td>
                                            <td>{asset.purchase_date || asset.purchaseDate}</td>
                                            <td>RWF {parseFloat(asset.purchase_value || 0).toLocaleString()}</td>
                                            <td>{asset.lifespan_years || asset.depreciationYears} years</td>
                                            <td><strong>RWF {currentValue.toFixed(0).toLocaleString()}</strong></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Asset">
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Asset Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Category</label>
                        <select
                            className="form-select"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="EQUIPMENT">Equipment</option>
                            <option value="CONSTRUCTION">Construction</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Purchase Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.purchase_date}
                            onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Purchase Value (RWF)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.purchase_value}
                            onChange={(e) => setFormData({ ...formData, purchase_value: e.target.value })}
                            step="0.01"
                            min="0"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Lifespan (years)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.lifespan_years}
                            onChange={(e) => setFormData({ ...formData, lifespan_years: e.target.value })}
                            min="1"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Asset'}
                        </button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" disabled={isSubmitting}>
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AssetManagement;
