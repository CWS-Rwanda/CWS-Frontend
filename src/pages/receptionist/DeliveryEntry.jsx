import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { deliveriesAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import DeliveryReceipt from '../../components/receipts/DeliveryReceipt';

const DeliveryEntry = () => {
    const { farmers, lots, seasons, fetchDeliveries } = useData();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        farmerId: '',
        weight: '',
        lotId: '',
    });
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastDelivery, setLastDelivery] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const currentSeason = seasons.find(s => s.active === true || s.status === 'ACTIVE' || s.status === 'active');
    const unitPrice = 350; // From pricing config - TODO: Get from pricing config API


        const handleDownloadPDF = () => {
        const input = receiptRef.current;
        
        html2canvas(input, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: true,
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a5'); // A5 size for receipt
            const imgWidth = 148; // A5 width in mm
            const pageHeight = 210; // A5 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`delivery-receipt-${delivery.id}.pdf`);
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const farmer = farmers.find(f => f.id === formData.farmerId);
            if (!farmer) {
                setError('Please select a valid farmer');
                setIsSubmitting(false);
                return;
            }

            if (!currentSeason) {
                setError('No active season found. Please create or activate a season first.');
                setIsSubmitting(false);
                return;
            }

            const weight = parseFloat(formData.weight);
            if (!weight || weight <= 0) {
                setError('Please enter a valid weight');
                setIsSubmitting(false);
                return;
            }

            const totalAmount = weight * unitPrice;
            const deliveryDate = new Date().toISOString();

            // Create delivery via API
            const response = await deliveriesAPI.create({
                farmer_id: formData.farmerId,
                season_id: currentSeason.id,
                lot_id: formData.lotId || null,
                delivery_date: deliveryDate,
                weight_kg: weight,
                quality_score: 85, // Default quality score - can be updated later
                unit_price: unitPrice,
                total_amount: totalAmount,
                paid: 'PENDING'
            });

            const deliveryData = response.data.data;
            
            // Transform for receipt display
            const transformedDelivery = {
                id: deliveryData.id,
                farmerId: deliveryData.farmer_id,
                farmerName: farmer.name,
                date: deliveryDate.split('T')[0],
                time: new Date(deliveryDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                weight,
                unitPrice,
                totalAmount,
                lotId: deliveryData.lot_id,
                paymentStatus: deliveryData.paid?.toLowerCase() || 'pending',
                qualityScore: deliveryData.quality_score || 85,
                operatorName: user?.name || 'Reception Staff',
                season: currentSeason.name || currentSeason.lot_name || '2025A',
            };

            setLastDelivery(transformedDelivery);
            setShowReceipt(true);
            setFormData({ farmerId: '', weight: '', lotId: '' });
            
            // Refresh deliveries list
            await fetchDeliveries();
        } catch (err) {
            console.error('Error creating delivery:', err);
            setError(err.message || 'Failed to create delivery. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Delivery Entry</h1>
                <p className="page-description">Record farmer cherry deliveries</p>
            </div>

            <div className="content-card">
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Select Farmer</label>
                        <select
                            className="form-select"
                            value={formData.farmerId}
                            onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                            required
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
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
                        <label className="form-label">Assign to Lot (Optional)</label>
                        <select
                            className="form-select"
                            value={formData.lotId}
                            onChange={(e) => setFormData({ ...formData, lotId: e.target.value })}
                            disabled={isSubmitting}
                        >
                            <option value="">-- Select Lot (Optional) --</option>
                            {lots.filter(l => l.status !== 'completed' && l.status !== 'COMPLETED').map(lot => (
                                <option key={lot.id} value={lot.id}>
                                    {lot.lotName || lot.id} - {lot.processingMethod} ({lot.status})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Recording...' : 'Record Delivery'}
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
