import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

const FarmerRegistry = () => {
    const { farmers, deliveries } = useData();
    const [search, setSearch] = useState('');
    const [selectedFarmer, setSelectedFarmer] = useState(null);

    const filteredFarmers = farmers.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.id.toLowerCase().includes(search.toLowerCase())
    );

    const getFarmerDeliveries = (farmerId) => {
        return deliveries.filter(d => d.farmerId === farmerId);
    };

    const getFarmerTotals = (farmerId) => {
        const farmerDeliveries = getFarmerDeliveries(farmerId);
        return {
            totalDeliveries: farmerDeliveries.length,
            totalWeight: farmerDeliveries.reduce((sum, d) => sum + d.weight, 0),
            totalAmount: farmerDeliveries.reduce((sum, d) => sum + d.totalAmount, 0),
        };
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Farmer Registry</h1>
                <p className="page-description">Complete farmer database and history</p>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-md)' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Search by name or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="content-card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Farmer ID</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Location</th>
                                <th>Farm Type</th>
                                <th>Total Deliveries</th>
                                <th>Total Weight (kg)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFarmers.map(farmer => {
                                const totals = getFarmerTotals(farmer.id);
                                return (
                                    <tr key={farmer.id}>
                                        <td><strong>{farmer.id}</strong></td>
                                        <td><strong>{farmer.name}</strong></td>
                                        <td>{farmer.phone}</td>
                                        <td>{farmer.sector}, {farmer.cell}</td>
                                        <td>
                                            <span className={`badge ${farmer.farmType === 'nucleus' ? 'badge-info' : 'badge-success'}`}>
                                                {farmer.farmType}
                                            </span>
                                        </td>
                                        <td>{totals.totalDeliveries}</td>
                                        <td>{totals.totalWeight.toLocaleString()}</td>
                                        <td>
                                            <button
                                                onClick={() => setSelectedFarmer(farmer)}
                                                className="btn btn-outline"
                                                style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedFarmer && (
                <div className="content-card" style={{ marginTop: 'var(--spacing-xl)' }}>
                    <div className="card-header">
                        <h2 className="card-title">Farmer Details: {selectedFarmer.name}</h2>
                        <button onClick={() => setSelectedFarmer(null)} className="btn btn-outline">
                            Close
                        </button>
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <p><strong>Farmer ID:</strong> {selectedFarmer.id}</p>
                        <p><strong>Phone:</strong> {selectedFarmer.phone}</p>
                        <p><strong>Location:</strong> {selectedFarmer.sector}, {selectedFarmer.cell}, {selectedFarmer.village}</p>
                        <p><strong>Farm Type:</strong> {selectedFarmer.farmType}</p>
                        <p><strong>Registered Date:</strong> {selectedFarmer.registeredDate}</p>
                    </div>

                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Delivery History</h3>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Weight (kg)</th>
                                    <th>Amount (RWF)</th>
                                    <th>Lot ID</th>
                                    <th>Payment Status</th>
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
                                            <span className={`badge ${delivery.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                                {delivery.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmerRegistry;
