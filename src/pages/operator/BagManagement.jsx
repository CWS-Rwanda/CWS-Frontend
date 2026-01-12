import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { generateId } from '../../utils/dummyData';
import Modal from '../../components/common/Modal';

const BagManagement = () => {
    const { lots, bags, setBags } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        lotId: '',
        weight: '',
        moisture: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const newBag = {
            id: generateId('BAG'),
            lotId: formData.lotId,
            weight: parseFloat(formData.weight),
            moisture: parseFloat(formData.moisture),
            storedDate: new Date().toISOString().split('T')[0],
            dispatched: false,
        };

        setBags([...bags, newBag]);
        setIsModalOpen(false);
        setFormData({ lotId: '', weight: '', moisture: '' });
    };

    const handleDispatch = (bagId) => {
        setBags(bags.map(b => b.id === bagId ? { ...b, dispatched: true } : b));
    };

    const availableBags = bags.filter(b => !b.dispatched).sort((a, b) =>
        new Date(a.storedDate) - new Date(b.storedDate)
    );

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

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Bag ID</th>
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
                                        <strong>{bag.id}</strong>
                                        {index === 0 && <span className="badge badge-success" style={{ marginLeft: '0.5rem' }}>Next to dispatch</span>}
                                    </td>
                                    <td>{bag.lotId}</td>
                                    <td>{bag.weight}</td>
                                    <td>{bag.moisture}%</td>
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
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Bag">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Lot ID</label>
                        <select
                            className="form-select"
                            value={formData.lotId}
                            onChange={(e) => setFormData({ ...formData, lotId: e.target.value })}
                            required
                        >
                            <option value="">-- Select Lot --</option>
                            {lots.filter(l => l.status === 'dried' || l.status === 'stored').map(lot => (
                                <option key={lot.id} value={lot.id}>
                                    {lot.id}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Bag Weight (kg)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            step="0.1"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Moisture (%)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.moisture}
                            onChange={(e) => setFormData({ ...formData, moisture: e.target.value })}
                            step="0.1"
                            required
                        />
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary">Create Bag</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default BagManagement;
