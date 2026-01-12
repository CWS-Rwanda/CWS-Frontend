import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Modal from '../../components/common/Modal';
import './FarmerRegistry.css';

const FarmerRegistry = () => {
    const { farmers, deliveries } = useData();
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock calculations or static values from design, but using real data where possible
    const totalFarmers = 300; // Static from design
    const deliveryIncrease = "7%"; // Static from design

    const getFarmerDeliveries = (farmerId) => {
        return deliveries.filter(d => d.farmerId === farmerId);
    };

    const getFarmerTotals = (farmerId) => {
        const farmerDeliveries = getFarmerDeliveries(farmerId);
        return {
            totalDeliveries: farmerDeliveries.length,
            totalWeight: farmerDeliveries.reduce((sum, d) => sum + d.weight, 0),
        };
    };

    const handleViewDetails = (farmer) => {
        setSelectedFarmer(farmer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFarmer(null);
    };

    return (
        <div className="farmer-registry">
            <div className="page-header">
                <h1 className="page-title">Farmer Registry</h1>
                <p className="page-description">Complete farmer details</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-indicator indicator-brown"></div>
                    <div className="stat-content">
                        <span className="stat-label">Total Farmers</span>
                        <h3 className="stat-value text-brown">{totalFarmers}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-indicator indicator-green"></div>
                    <div className="stat-content">
                        <span className="stat-label">Delivery increase this season</span>
                        <h3 className="stat-value text-green">{deliveryIncrease}</h3>
                    </div>
                </div>
            </div>

            <div className="content-card">
                <h2 className="section-title">All Farmers</h2>
                <div className="table-container">
                    <table className="farmers-table">
                        <thead>
                            <tr>
                                <th>NAME</th>
                                <th>PHONE NUMBER</th>
                                <th>LOCATION</th>
                                <th>TOTAL DELIVERIES</th>
                                <th>TOTAL WEIGHT (KG)</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {farmers.map(farmer => {
                                const totals = getFarmerTotals(farmer.id);
                                return (
                                    <tr key={farmer.id}>
                                        <td className="farmer-name">{farmer.name}</td>
                                        <td>{farmer.phone}</td>
                                        <td>{farmer.sector || 'N/A'}</td>
                                        <td>{totals.totalDeliveries}</td>
                                        <td>{totals.totalWeight}</td>
                                        <td>
                                            <button
                                                className="btn-view-details"
                                                onClick={() => handleViewDetails(farmer)}
                                            >
                                                View details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedFarmer ? `Farmer Details: ${selectedFarmer.name}` : 'Details'}
                size="large"
            >
                {selectedFarmer && (
                    <div className="farmer-details-modal">
                        <div className="details-grid">
                            <div className="detail-item">
                                <label>Farmer ID</label>
                                <p>{selectedFarmer.id}</p>
                            </div>
                            <div className="detail-item">
                                <label>Phone</label>
                                <p>{selectedFarmer.phone}</p>
                            </div>
                            <div className="detail-item">
                                <label>Location</label>
                                <p>{selectedFarmer.sector}, {selectedFarmer.cell}, {selectedFarmer.village}</p>
                            </div>
                            <div className="detail-item">
                                <label>Farm Type</label>
                                <p className="capitalize">{selectedFarmer.farmType}</p>
                            </div>
                            <div className="detail-item">
                                <label>Registered Date</label>
                                <p>{selectedFarmer.registeredDate}</p>
                            </div>
                        </div>

                        <h3 className="modal-section-title">Delivery History</h3>
                        <div className="table-container">
                            <table className="farmers-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Weight (kg)</th>
                                        <th>Amount (RWF)</th>
                                        <th>Lot ID</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFarmerDeliveries(selectedFarmer.id).map(delivery => (
                                        <tr key={delivery.id}>
                                            <td>{delivery.date}</td>
                                            <td>{delivery.weight}</td>
                                            <td>RWF {delivery.totalAmount.toLocaleString()}</td>
                                            <td>{delivery.lotId}</td>
                                            <td>
                                                <span className={`status-badge ${delivery.paymentStatus}`}>
                                                    {delivery.paymentStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {getFarmerDeliveries(selectedFarmer.id).length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                                No deliveries found for this farmer.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default FarmerRegistry;
