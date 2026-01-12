import React from 'react';
import { useData } from '../../context/DataContext';

const AdminDashboard = () => {
    const { deliveries, lots, revenue, expenses, laborCosts, seasons } = useData();

    const currentSeason = seasons.find(s => s.status === 'active');

    // Calculate KPIs
    const totalCherries = deliveries.reduce((sum, d) => sum + d.weight, 0);
    const totalCherryCost = deliveries.reduce((sum, d) => sum + d.totalAmount, 0);
    const totalRevenue = revenue.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalLabor = laborCosts.reduce((sum, l) => sum + l.totalCost, 0);
    const totalCost = totalCherryCost + totalExpenses + totalLabor;
    const profitLoss = totalRevenue - totalCost;
    const activeLots = lots.filter(l => l.status !== 'dispatched').length;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-description">Overview of Coffee Washing Station operations</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card" style={{ borderLeftColor: 'var(--color-primary)' }}>
                    <div className="stat-label">Total Cherries Received</div>
                    <div className="stat-value">{totalCherries.toLocaleString()} kg</div>
                </div>

                <div className="stat-card" style={{ borderLeftColor: 'var(--color-secondary)' }}>
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value">RWF {totalRevenue.toLocaleString()}</div>
                </div>

                <div className="stat-card" style={{ borderLeftColor: profitLoss >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                    <div className="stat-label">Profit / Loss</div>
                    <div className="stat-value" style={{ color: profitLoss >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                        RWF {profitLoss.toLocaleString()}
                    </div>
                </div>

                <div className="stat-card" style={{ borderLeftColor: 'var(--color-accent)' }}>
                    <div className="stat-label">Active Lots</div>
                    <div className="stat-value">{activeLots}</div>
                </div>

                <div className="stat-card" style={{ borderLeftColor: 'var(--color-info)' }}>
                    <div className="stat-label">Cherry Cost</div>
                    <div className="stat-value">RWF {totalCherryCost.toLocaleString()}</div>
                </div>

                <div className="stat-card" style={{ borderLeftColor: 'var(--color-warning)' }}>
                    <div className="stat-label">Operating Costs</div>
                    <div className="stat-value">RWF {(totalExpenses + totalLabor).toLocaleString()}</div>
                </div>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Recent Lots</h2>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Lot ID</th>
                                <th>Created</th>
                                <th>Processing Method</th>
                                <th>Grade</th>
                                <th>Status</th>
                                <th>Weight (kg)</th>
                                <th>Quality Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lots.slice(0, 5).map(lot => (
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
