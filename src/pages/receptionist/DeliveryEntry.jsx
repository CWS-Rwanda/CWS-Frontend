import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { generateId } from '../../utils/dummyData';
import Modal from '../../components/common/Modal';
import DeliveryReceipt from '../../components/receipts/DeliveryReceipt';

const DeliveryEntry = () => {
    const { farmers, deliveries, setDeliveries, lots, setLots, seasons } = useData();
    const [formData, setFormData] = useState({
        farmerId: '',
        weight: '',
        lotId: '',
    });
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastDelivery, setLastDelivery] = useState(null);

    const currentSeason = seasons.find(s => s.status === 'active');
    const unitPrice = 350; // From pricing config

    const handleSubmit = (e) => {
        e.preventDefault();

        const farmer = farmers.find(f => f.id === formData.farmerId);
        const weight = parseFloat(formData.weight);
        const totalAmount = weight * unitPrice;

        const newDelivery = {
            id: generateId('D'),
            farmerId: farmer.id,
            farmerName: farmer.name,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            weight,
            unitPrice,
            totalAmount,
            lotId: formData.lotId,
            paymentStatus: 'pending',
            qualityScore: 85,
            operatorName: 'Reception Staff',
            season: currentSeason?.name || '2025A',
        };

        setDeliveries([...deliveries, newDelivery]);
        setLastDelivery(newDelivery);
        setShowReceipt(true);
        setFormData({ farmerId: '', weight: '', lotId: '' });
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Delivery Entry</h1>
                <p className="page-description">Record farmer cherry deliveries</p>
            </div>

            <div className="content-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Select Farmer</label>
                        <select
                            className="form-select"
                            value={formData.farmerId}
                            onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                            required
                        >
                            <option value="">-- Select Farmer --</option>
                            {farmers.map(farmer => (
                                <option key={farmer.id} value={farmer.id}>
                                    {farmer.id} - {farmer.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Weight (kg)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            step="0.1"
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Unit Price (RWF/kg)</label>
                        <input
                            type="text"
                            className="form-input"
                            value={unitPrice}
                            disabled
                            style={{ backgroundColor: 'var(--color-gray-100)' }}
                        />
                    </div>

                    {formData.weight && (
                        <div className="form-group">
                            <label className="form-label">Total Amount</label>
                            <input
                                type="text"
                                className="form-input"
                                value={`RWF ${(parseFloat(formData.weight) * unitPrice).toLocaleString()}`}
                                disabled
                                style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold', fontSize: '1.125rem' }}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label required">Assign to Lot</label>
                        <select
                            className="form-select"
                            value={formData.lotId}
                            onChange={(e) => setFormData({ ...formData, lotId: e.target.value })}
                            required
                        >
                            <option value="">-- Select Lot --</option>
                            {lots.filter(l => l.status !== 'stored' && l.status !== 'dispatched').map(lot => (
                                <option key={lot.id} value={lot.id}>
                                    {lot.id} - {lot.processingMethod} ({lot.status})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Record Delivery
                    </button>
                </form>
            </div>

            {showReceipt && lastDelivery && (
                <Modal isOpen={showReceipt} onClose={() => setShowReceipt(false)} title="Delivery Receipt" size="medium">
                    <DeliveryReceipt delivery={lastDelivery} />
                </Modal>
            )}
        </div>
    );
};

export default DeliveryEntry;
