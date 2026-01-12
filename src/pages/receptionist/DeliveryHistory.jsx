import React from 'react';
import { useData } from '../../context/DataContext';

const DeliveryHistory = () => {
    const { deliveries, setDeliveries } = useData();

    const togglePaymentStatus = (deliveryId) => {
        setDeliveries(deliveries.map(d =>
            d.id === deliveryId
                ? { ...d, paymentStatus: d.paymentStatus === 'paid' ? 'pending' : 'paid' }
                : d
        ));
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Delivery History</h1>
                <p className="page-description">View all recorded deliveries</p>
            </div>

            <div className="content-card">
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
                            {deliveries.slice().reverse().map(delivery => (
                                <tr key={delivery.id}>
                                    <td><strong>{delivery.id}</strong></td>
                                    <td>{delivery.date}</td>
                                    <td>{delivery.time}</td>
                                    <td>{delivery.farmerName}</td>
                                    <td>{delivery.weight}</td>
                                    <td>RWF {delivery.unitPrice}</td>
                                    <td><strong>RWF {delivery.totalAmount.toLocaleString()}</strong></td>
                                    <td>{delivery.lotId}</td>
                                    <td>
                                        <span className={`badge ${delivery.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                            {delivery.paymentStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => togglePaymentStatus(delivery.id)}
                                            className="btn btn-outline"
                                            style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                                        >
                                            {delivery.paymentStatus === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DeliveryHistory;
