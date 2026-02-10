import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { storageAPI } from '../../services/api';
import Modal from '../../components/common/Modal';

const BagManagement = () => {
    const { lots, bags, fetchStorageBags, loading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        lot_id: '',
        bag_code: '',
        weight_kg: '',
        moisture: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (!formData.bag_code) {
                setError('Bag code is required');
                setIsSubmitting(false);
                return;
            }

            await storageAPI.create({
                lot_id: formData.lot_id,
                bag_code: formData.bag_code,
                weight_kg: parseFloat(formData.weight_kg),
                moisture: formData.moisture ? parseFloat(formData.moisture) : null,
                stored_at: new Date().toISOString(),
                dispatched: false
            });

            setIsModalOpen(false);
            setFormData({ lot_id: '', bag_code: '', weight_kg: '', moisture: '' });
            await fetchStorageBags();
        } catch (err) {
            console.error('Error creating storage bag:', err);
            setError(err.message || 'Failed to create storage bag. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDispatch = async (bagId) => {
        try {
            await storageAPI.update(bagId, { dispatched: true });
            await fetchStorageBags();
        } catch (err) {
            console.error('Error updating bag:', err);
            alert(err.message || 'Failed to mark bag as dispatched.');
        }
    };

    // Transform bags for display
    const transformBag = (bag) => ({
        id: bag.id,
        bagId: bag.bag_code || bag.id,
        lotId: bag.lot_id,
        weight: parseFloat(bag.weight_kg || 0),
        moisture: bag.moisture ? parseFloat(bag.moisture) : null,
        storedDate: bag.stored_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        dispatched: bag.dispatched || false,
    });

    const availableBags = bags
        .map(transformBag)
        .filter(b => !b.dispatched)
        .sort((a, b) => new Date(a.storedDate) - new Date(b.storedDate));

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Bag Management</h1>
                <p className="page-description">Storage tracking and FIFO dispatch</p>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Available Bags (FIFO Order)</h2>
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                        + Add New Bag
                    </button>
                </div>

                {loading.bags ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading bags...</div>
                ) : availableBags.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No available bags. All bags have been dispatched.</div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Bag Code</th>
                                    <th>Lot ID</th>
                                    <th>Weight (kg)</th>
                                    <th>Moisture (%)</th>
                                    <th>Stored Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {availableBags.map((bag, index) => (
                                    <tr key={bag.id} style={index === 0 ? { backgroundColor: 'rgba(76, 175, 80, 0.1)' } : {}}>
                                        <td>
                                            <strong>{bag.bagId}</strong>
                                            {index === 0 && <span className="badge badge-success" style={{ marginLeft: '0.5rem' }}>Next to dispatch</span>}
                                        </td>
                                        <td>{bag.lotId}</td>
                                        <td>{bag.weight.toFixed(2)}</td>
                                        <td>{bag.moisture !== null ? `${bag.moisture.toFixed(1)}%` : 'N/A'}</td>
                                        <td>{bag.storedDate}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDispatch(bag.id)}
                                                className="btn btn-accent"
                                                style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                                            >
                                                Mark Dispatched
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Bag">
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Lot</label>
                        <select
                            className="form-select"
                            value={formData.lot_id}
                            onChange={(e) => setFormData({ ...formData, lot_id: e.target.value })}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">-- Select Lot --</option>
                            {lots.filter(l => l.status === 'COMPLETED' || l.status === 'completed' || l.status === 'IN_PROCESS' || l.status === 'in process').map(lot => (
                                <option key={lot.id} value={lot.id}>
                                    {lot.lotName || lot.id} - {lot.processingMethod}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Bag Code</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.bag_code}
                            onChange={(e) => setFormData({ ...formData, bag_code: e.target.value })}
                            placeholder="e.g., BAG-001"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Bag Weight (kg)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.weight_kg}
                            onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                            step="0.1"
                            min="0"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Moisture (%)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.moisture}
                            onChange={(e) => setFormData({ ...formData, moisture: e.target.value })}
                            step="0.1"
                            min="0"
                            max="100"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Bag'}
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

export default BagManagement;
