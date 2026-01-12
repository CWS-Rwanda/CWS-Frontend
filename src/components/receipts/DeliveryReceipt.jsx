import React from 'react';
import './DeliveryReceipt.css';

const DeliveryReceipt = ({ delivery }) => {
    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        alert('Receipt download functionality - would generate PDF in production');
    };

    return (
        <div className="receipt-container">
            <div className="receipt-header">
                <div className="receipt-logo">☕</div>
                <h2>Coffee Washing Station</h2>
                <p>Delivery Receipt</p>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-body">
                <div className="receipt-row">
                    <span className="receipt-label">Delivery ID:</span>
                    <span className="receipt-value"><strong>{delivery.id}</strong></span>
                </div>

                <div className="receipt-row">
                    <span className="receipt-label">Farmer Name:</span>
                    <span className="receipt-value"><strong>{delivery.farmerName}</strong></span>
                </div>

                <div className="receipt-row">
                    <span className="receipt-label">Farmer ID:</span>
                    <span className="receipt-value">{delivery.farmerId}</span>
                </div>

                <div className="receipt-row">
                    <span className="receipt-label">Date & Time:</span>
                    <span className="receipt-value">{delivery.date} {delivery.time}</span>
                </div>

                <div className="receipt-divider"></div>

                <div className="receipt-row">
                    <span className="receipt-label">Weight:</span>
                    <span className="receipt-value"><strong>{delivery.weight} kg</strong></span>
                </div>

                <div className="receipt-row">
                    <span className="receipt-label">Unit Price:</span>
                    <span className="receipt-value">RWF {delivery.unitPrice}/kg</span>
                </div>

                <div className="receipt-row receipt-total">
                    <span className="receipt-label">Total Amount:</span>
                    <span className="receipt-value"><strong>RWF {delivery.totalAmount.toLocaleString()}</strong></span>
                </div>

                <div className="receipt-divider"></div>

                <div className="receipt-row">
                    <span className="receipt-label">Payment Status:</span>
                    <span className={`receipt-value ${delivery.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}`}>
                        <strong>{delivery.paymentStatus.toUpperCase()}</strong>
                    </span>
                </div>

                <div className="receipt-row">
                    <span className="receipt-label">Lot ID:</span>
                    <span className="receipt-value">{delivery.lotId}</span>
                </div>

                <div className="receipt-row">
                    <span className="receipt-label">Quality Score:</span>
                    <span className="receipt-value">{delivery.qualityScore}%</span>
                </div>

                <div className="receipt-row">
                    <span className="receipt-label">Operator:</span>
                    <span className="receipt-value">{delivery.operatorName}</span>
                </div>

                <div className="receipt-row">
                    <span className="receipt-label">Season:</span>
                    <span className="receipt-value">{delivery.season}</span>
                </div>
            </div>

            <div className="receipt-footer">
                <p>Thank you for your delivery!</p>
                <p className="receipt-note">Please keep this receipt for your records</p>
            </div>

            <div className="receipt-actions">
                <button onClick={handlePrint} className="btn btn-primary">
                    🖨️ Print Receipt
                </button>
                <button onClick={handleDownload} className="btn btn-secondary">
                    📄 Download PDF
                </button>
            </div>
        </div>
    );
};

export default DeliveryReceipt;
