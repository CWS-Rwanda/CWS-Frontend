import React, { useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { deliveriesAPI } from '../../services/api';

const DeliveryHistory = () => {
    const { deliveries, fetchDeliveries, loading } = useData();

    useEffect(() => {
        console.log("Deliveries: ",deliveries);
    }, [deliveries]);

    const togglePaymentStatus = async (deliveryId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'paid' || currentStatus === 'PAID' ? 'PENDING' : 'PAID';
            await deliveriesAPI.update(deliveryId, { paid: newStatus });
            await fetchDeliveries();
        } catch (error) {
            console.error('Error updating payment status:', error);
            alert(error.message || 'Failed to update payment status. Please try again.');
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Delivery History</h1>
                <p className="page-description">View all recorded deliveries</p>
            </div>

            <div className="content-card">
                {loading.deliveries ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading delivery history...</div>
                ) : deliveries.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No deliveries found.</div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Delivery ID</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Farmer</th>
                                    <th>Weight (kg)</th>
                                    <th>Unit Price</th>
                                    <th>Total Amount</th>
                                    <th>Lot ID</th>
                                    <th>Payment Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveries.slice().reverse().map(delivery => {
                                    const isPaid = delivery.paymentStatus === 'paid' || delivery.paymentStatus === 'PAID';
                                    return (
                                        <tr key={delivery.id}>
                                            <td><strong>{delivery.id}</strong></td>
                                            <td>{delivery.date}</td>
                                            <td>{delivery.time}</td>
                                            <td>{delivery.farmerName || 'N/A'}</td>
                                            <td>{delivery.weight.toFixed(2)}</td>
                                            <td>RWF {delivery.unitPrice.toLocaleString()}</td>
                                            <td><strong>RWF {delivery.totalAmount.toLocaleString()}</strong></td>
                                            <td>{delivery.lotId || 'N/A'}</td>
                                            <td>
                                                <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`}>
                                                    {delivery.paymentStatus}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => togglePaymentStatus(delivery.id, delivery.paymentStatus)}
                                                    className="btn btn-outline"
                                                    style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                                                >
                                                    {isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                                                </button>
                                            </td>
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

export default DeliveryHistory;
