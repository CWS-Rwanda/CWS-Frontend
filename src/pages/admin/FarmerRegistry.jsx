import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Modal from '../../components/common/Modal';
import AddFarmerForm from '../../components/farmers/AddFarmerForm';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './FarmerRegistry.css';

const FarmerRegistry = () => {
    const { farmers, deliveries, loading, refreshData } = useData();
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Calculate from real data
    const totalFarmers = farmers.length;
    const activeFarmers = farmers.filter(f => f.active !== false).length;
    
    // Calculate delivery increase (simplified - compare current season vs previous)
    const currentSeasonDeliveries = deliveries.filter(d => d.season).length;
    const deliveryIncrease = currentSeasonDeliveries > 0 ? "7%" : "0%"; // TODO: Calculate properly from previous season

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
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedFarmer(null);
    };

    const handleAddFarmerSuccess = (message) => {
        toast.success(message);
    };

    return (
        <div className="farmer-registry">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Farmer Registry</h1>
                    <p className="page-description">Complete farmer details</p>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    + Add New Farmer
                </button>
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
                {loading.farmers ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading farmers...</div>
                ) : farmers.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No farmers found. Please add farmers first.</div>
                ) : (
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
                                            <td>{farmer.phone || 'N/A'}</td>
                                            <td>{farmer.sector || 'N/A'}</td>
                                            <td>{totals.totalDeliveries}</td>
                                            <td>{totals.totalWeight.toFixed(2)}</td>
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
                )}
            </div>

            <AddFarmerForm 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddFarmerSuccess}
            />
            
            {selectedFarmer && (
                <Modal isOpen={isViewModalOpen} onClose={handleCloseViewModal} title="Farmer Details">
                    <div className="farmer-details">
                        <div className="detail-row">
                            <span className="detail-label">Name:</span>
                            <span className="detail-value">{selectedFarmer.name}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Phone:</span>
                            <span className="detail-value">{selectedFarmer.phone || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Location:</span>
                            <span className="detail-value">
                                {[selectedFarmer.sector, selectedFarmer.district, selectedFarmer.province]
                                    .filter(Boolean)
                                    .join(', ') || 'N/A'}
                            </span>
                        </div>
                        {selectedFarmer.idNumber && (
                            <div className="detail-row">
                                <span className="detail-label">ID/Passport:</span>
                                <span className="detail-value">{selectedFarmer.idNumber}</span>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default FarmerRegistry;
