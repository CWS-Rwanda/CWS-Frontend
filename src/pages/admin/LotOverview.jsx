import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

const LotOverview = () => {
    const { lots, deliveries } = useData();
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedLot, setSelectedLot] = useState(null);

    const filteredLots = statusFilter === 'all'
        ? lots
        : lots.filter(lot => lot.status === statusFilter);

    const getLotDeliveries = (lotId) => {
        return deliveries.filter(d => d.lotId === lotId);
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Lot Overview</h1>
                <p className="page-description">Global production monitoring</p>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-md)' }}>
                <div className="flex items-center gap-md">
                    <label className="form-label" style={{ marginBottom: 0 }}>Filter by Status:</label>
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ maxWidth: '200px' }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="received">Received</option>
                        <option value="pulped">Pulped</option>
                        <option value="fermented">Fermented</option>
                        <option value="washed">Washed</option>
                        <option value="dried">Dried</option>
                        <option value="stored">Stored</option>
                    </select>
                </div>
            </div>

            <div className="content-card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Lot ID</th>
                                <th>Created Date</th>
                                <th>Processing Method</th>
                                <th>Grade</th>
                                <th>Status</th>
                                <th>Weight (kg)</th>
                                <th>Quality Score</th>
                                <th>Approved</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLots.map(lot => (
                                <tr key={lot.id}>
                                    <td><strong>{lot.id}</strong></td>
                                    <td>{lot.createdDate}</td>
                                    <td>
                                        <span className="badge badge-info">{lot.processingMethod}</span>
                                    </td>
                                    <td><span className="badge badge-success">Grade {lot.grade}</span></td>
                                    <td>
                                        <span className={`badge ${lot.status === 'stored' ? 'badge-success' :
                                                lot.status === 'dried' ? 'badge-info' :
                                                    'badge-warning'
                                            }`}>
                                            {lot.status}
                                        </span>
                                    </td>
                                    <td>{lot.totalWeight}</td>
                                    <td>{lot.qualityScore}%</td>
                                    <td>
                                        {lot.approved ? (
                                            <span className="badge badge-success">✓ Yes</span>
                                        ) : (
                                            <span className="badge badge-warning">Pending</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => setSelectedLot(lot)}
                                            className="btn btn-outline"
                                            style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedLot && (
                <div className="content-card" style={{ marginTop: 'var(--spacing-xl)' }}>
                    <div className="card-header">
                        <h2 className="card-title">Lot Details: {selectedLot.id}</h2>
                        <button onClick={() => setSelectedLot(null)} className="btn btn-outline">
                            Close
                        </button>
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-label">Total Weight</div>
                                <div className="stat-value">{selectedLot.totalWeight} kg</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Quality Score</div>
                                <div className="stat-value">{selectedLot.qualityScore}%</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Sustainability Score</div>
                                <div className="stat-value">{selectedLot.sustainabilityScore}%</div>
                            </div>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Processing Timeline</h3>
                    <div className="table-container" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Stage</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Operator</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedLot.timeline.map((stage, index) => (
                                    <tr key={index}>
                                        <td><strong>{stage.stage}</strong></td>
                                        <td>{stage.date}</td>
                                        <td>{stage.time}</td>
                                        <td>{stage.operator}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Deliveries Included</h3>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Delivery ID</th>
                                    <th>Farmer</th>
                                    <th>Date</th>
                                    <th>Weight (kg)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getLotDeliveries(selectedLot.id).map(delivery => (
                                    <tr key={delivery.id}>
                                        <td>{delivery.id}</td>
                                        <td>{delivery.farmerName}</td>
                                        <td>{delivery.date}</td>
                                        <td>{delivery.weight}</td>
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

export default LotOverview;
