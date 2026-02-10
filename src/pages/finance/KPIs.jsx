import React from 'react';
import { useData } from '../../context/DataContext';

const KPIs = () => {
    const { deliveries, revenue, expenses, laborCosts } = useData();

    const totalCherryCost = deliveries.reduce((sum, d) => sum + parseFloat(d.total_amount || d.totalAmount || 0), 0);
    const totalCherries = deliveries.reduce((sum, d) => sum + parseFloat(d.weight_kg || d.weight || 0), 0);
    const totalRevenue = revenue.reduce((sum, r) => sum + parseFloat(r.total_amount || r.totalRevenue || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalLabor = laborCosts.reduce((sum, l) => sum + parseFloat(l.total_amount || l.totalCost || 0), 0);
    const totalCosts = totalCherryCost + totalExpenses + totalLabor;
    const netProfit = totalRevenue - totalCosts;

    const costPerKg = totalCherries > 0 ? (totalCosts / totalCherries).toFixed(2) : 0;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">KPIs & Alerts</h1>
                <p className="page-description">Financial performance indicators</p>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="stat-card" style={{ borderLeftColor: 'var(--color-primary)' }}>
                    <div className="stat-label">Cost per Kg</div>
                    <div className="stat-value">RWF {costPerKg}</div>
                </div>

                <div className="stat-card" style={{ borderLeftColor: profitMargin >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                    <div className="stat-label">Profit Margin</div>
                    <div className="stat-value" style={{ color: profitMargin >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                        {profitMargin}%
                    </div>
                </div>

                <div className="stat-card" style={{ borderLeftColor: 'var(--color-info)' }}>
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value">RWF {totalRevenue.toLocaleString()}</div>
                </div>

                <div className="stat-card" style={{ borderLeftColor: 'var(--color-warning)' }}>
                    <div className="stat-label">Total Costs</div>
                    <div className="stat-value">RWF {totalCosts.toLocaleString()}</div>
                </div>

                <div className="stat-card" style={{ borderLeftColor: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                    <div className="stat-label">Net Profit/Loss</div>
                    <div className="stat-value" style={{ color: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                        RWF {netProfit.toLocaleString()}
                    </div>
                </div>

                <div className="stat-card" style={{ borderLeftColor: 'var(--color-secondary)' }}>
                    <div className="stat-label">Cash Sufficiency</div>
                    <div className="stat-value text-success">Adequate</div>
                </div>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Cost Breakdown</h2>
                </div>

                <div style={{ padding: 'var(--spacing-lg)' }}>
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                            <span>Cherry Purchases</span>
                            <strong>RWF {totalCherryCost.toLocaleString()} ({((totalCherryCost / totalCosts) * 100).toFixed(1)}%)</strong>
                        </div>
                        <div style={{ height: '12px', background: 'var(--color-gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--color-primary)', width: `${(totalCherryCost / totalCosts) * 100}%` }}></div>
                        </div>
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                            <span>Labor Costs</span>
                            <strong>RWF {totalLabor.toLocaleString()} ({((totalLabor / totalCosts) * 100).toFixed(1)}%)</strong>
                        </div>
                        <div style={{ height: '12px', background: 'var(--color-gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--color-secondary)', width: `${(totalLabor / totalCosts) * 100}%` }}></div>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                            <span>Operating Expenses</span>
                            <strong>RWF {totalExpenses.toLocaleString()} ({((totalExpenses / totalCosts) * 100).toFixed(1)}%)</strong>
                        </div>
                        <div style={{ height: '12px', background: 'var(--color-gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--color-accent)', width: `${(totalExpenses / totalCosts) * 100}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Alerts</h2>
                </div>

                <div style={{ padding: 'var(--spacing-lg)' }}>
                    {netProfit < 0 && (
                        <div style={{ padding: 'var(--spacing-md)', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--color-error)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                            <strong style={{ color: 'var(--color-error)' }}>⚠️ Loss Alert</strong>
                            <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-gray-700)' }}>
                                Current operations showing a loss. Review pricing and cost structure.
                            </p>
                        </div>
                    )}

                    {profitMargin >= 0 && profitMargin < 10 && (
                        <div style={{ padding: 'var(--spacing-md)', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid var(--color-warning)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                            <strong style={{ color: 'var(--color-warning)' }}>📊 Low Margin Warning</strong>
                            <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-gray-700)' }}>
                                Profit margin below 10%. Consider cost optimization.
                            </p>
                        </div>
                    )}

                    {netProfit > 0 && profitMargin >= 10 && (
                        <div style={{ padding: 'var(--spacing-md)', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--color-success)', borderRadius: 'var(--radius-md)' }}>
                            <strong style={{ color: 'var(--color-success)' }}>✅ Healthy Performance</strong>
                            <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-gray-700)' }}>
                                Operations are profitable with good margin. Keep up the excellent work!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KPIs;
