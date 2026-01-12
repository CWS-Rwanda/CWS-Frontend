import React from 'react';
import { useData } from '../../context/DataContext';

const LotApproval = () => {
    const { lots, setLots } = useData();

    const handleApproval = (lotId, approved) => {
        setLots(lots.map(lot =>
            lot.id === lotId ? { ...lot, approved } : lot
        ));
        alert(`Lot ${lotId} ${approved ? 'approved' : 'rejected'}`);
    };

    const pendingLots = lots.filter(l => !l.approved);
    const approvedLots = lots.filter(l => l.approved);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Lot Approval</h1>
                <p className="page-description">Quality gate for lot approval</p>
            </div>

            {pendingLots.length > 0 && (
                <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div className="card-header">
                        <h2 className="card-title">Pending Approval</h2>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Lot ID</th>
                                    <th>Processing Method</th>
                                    <th>Grade</th>
                                    <th>Weight (kg)</th>
                                    <th>Quality Score</th>
                                    <th>Sustainability Score</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingLots.map(lot => (
                                    <tr key={lot.id}>
                                        <td><strong>{lot.id}</strong></td>
                                        <td>{lot.processingMethod}</td>
                                        <td>Grade {lot.grade}</td>
                                        <td>{lot.totalWeight}</td>
                                        <td>
                                            <span className={`badge ${lot.qualityScore >= 85 ? 'badge-success' : 'badge-warning'}`}>
                                                {lot.qualityScore}%
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${lot.sustainabilityScore >= 85 ? 'badge-success' : 'badge-warning'}`}>
                                                {lot.sustainabilityScore}%
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-group">
                                                <button
                                                    onClick={() => handleApproval(lot.id, true)}
                                                    className="btn btn-secondary"
                                                    style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    onClick={() => handleApproval(lot.id, false)}
                                                    className="btn btn-outline"
                                                    style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                                                >
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Approved Lots</h2>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Lot ID</th>
                                <th>Processing Method</th>
                                <th>Grade</th>
                                <th>Weight (kg)</th>
                                <th>Quality Score</th>
                                <th>Sustainability Score</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {approvedLots.map(lot => (
                                <tr key={lot.id}>
                                    <td><strong>{lot.id}</strong></td>
                                    <td>{lot.processingMethod}</td>
                                    <td>Grade {lot.grade}</td>
                                    <td>{lot.totalWeight}</td>
                                    <td>{lot.qualityScore}%</td>
                                    <td>{lot.sustainabilityScore}%</td>
                                    <td>
                                        <span className="badge badge-success">✓ Approved</span>
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

export default LotApproval;
