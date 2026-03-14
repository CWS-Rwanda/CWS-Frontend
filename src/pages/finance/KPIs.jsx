import React from 'react';
import { useData } from '../../context/DataContext';
import { excelFinanceAPI } from '../../services/api';

const KPIs = () => {
    const { deliveries, revenue, expenses, laborCosts, excelFinanceData, loading } = useData();
    const loadingExcel = loading.excelFinance;
    const excelData = excelFinanceData;

    const currentYear = new Date().getFullYear();
    
    // Fallback/Database-only values
    const dbCherryCost = deliveries.reduce((sum, d) => sum + parseFloat(d.total_amount || d.totalAmount || 0), 0);
    const dbCherriesWeight = deliveries.reduce((sum, d) => sum + parseFloat(d.weight_kg || d.weight || 0), 0);
    const dbRevenue = revenue.reduce((sum, r) => sum + parseFloat(r.total_amount || r.totalRevenue || 0), 0);
    const dbExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const dbLabor = laborCosts.reduce((sum, l) => sum + parseFloat(l.total_amount || l.totalCost || 0), 0);

    // Prefer Excel values if available, otherwise use DB
    const totalRevenue = excelData ? excelData.totalSales : dbRevenue;
    const totalCherryCost = excelData ? (excelData.directCosts?.find(c => c.description === 'Cherry Purchases')?.amount || 0) : dbCherryCost;
    const totalLabor = excelData ? (excelData.directCosts?.find(c => c.description === 'Labour at CWS')?.amount || 0) : dbLabor;
    const totalExpenses = excelData ? excelData.administrativeCosts : dbExpenses;
    
    // Sum of all costs
    const totalCosts = excelData ? excelData.totalOperationalExpenses : (totalCherryCost + totalExpenses + totalLabor);
    const netProfit = excelData ? excelData.profitAfterTaxes : (totalRevenue - totalCosts);

    const totalCherries = dbCherriesWeight; // Deliveries are currently most accurate in DB
    const costPerKg = totalCherries > 0 ? (totalCosts / totalCherries).toFixed(2) : 0;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">KPIs & Alerts</h1>
                    <p className="page-description">Financial performance indicators from {excelData ? `Excel File (${currentYear})` : 'Database'}</p>
                </div>
                {loadingExcel && <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-500)' }}>Syncing with Excel...</span>}
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="stat-card" style={{ borderLeftColor: 'var(--color-primary)' }}>
                    <div className="stat-label">Cost per Kg (Cherries)</div>
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
                    <div className="stat-label">Total Operational Costs</div>
                    <div className="stat-value">RWF {totalCosts.toLocaleString()}</div>
                </div>

                <div className="stat-card" style={{ borderLeftColor: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                    <div className="stat-label">Net Profit/Loss (A.T)</div>
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
                    <h2 className="card-title">Cost Breakdown (Financial Statement)</h2>
                </div>

                <div style={{ padding: 'var(--spacing-lg)' }}>
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                            <span>Cherry Purchases</span>
                            <strong>RWF {totalCherryCost.toLocaleString()} ({totalCosts > 0 ? ((totalCherryCost / totalCosts) * 100).toFixed(1) : 0}%)</strong>
                        </div>
                        <div style={{ height: '12px', background: 'var(--color-gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--color-primary)', width: `${totalCosts > 0 ? (totalCherryCost / totalCosts) * 100 : 0}%` }}></div>
                        </div>
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                            <span>Labor Costs</span>
                            <strong>RWF {totalLabor.toLocaleString()} ({totalCosts > 0 ? ((totalLabor / totalCosts) * 100).toFixed(1) : 0}%)</strong>
                        </div>
                        <div style={{ height: '12px', background: 'var(--color-gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--color-secondary)', width: `${totalCosts > 0 ? (totalLabor / totalCosts) * 100 : 0}%` }}></div>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                            <span>Administrative/Operating Expenses</span>
                            <strong>RWF {totalExpenses.toLocaleString()} ({totalCosts > 0 ? ((totalExpenses / totalCosts) * 100).toFixed(1) : 0}%)</strong>
                        </div>
                        <div style={{ height: '12px', background: 'var(--color-gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--color-accent)', width: `${totalCosts > 0 ? (totalExpenses / totalCosts) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Financial Alerts</h2>
                </div>

                <div style={{ padding: 'var(--spacing-lg)' }}>
                    {netProfit < 0 && (
                        <div style={{ padding: 'var(--spacing-md)', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--color-error)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                            <strong style={{ color: 'var(--color-error)' }}>⚠️ Loss Alert</strong>
                            <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-gray-700)' }}>
                                Current operations showing a net loss for {currentYear}. Review pricing and cost structure in the financial portal.
                            </p>
                        </div>
                    )}

                    {profitMargin >= 0 && profitMargin < 10 && (
                        <div style={{ padding: 'var(--spacing-md)', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid var(--color-warning)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                            <strong style={{ color: 'var(--color-warning)' }}>📊 Low Margin Warning</strong>
                            <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-gray-700)' }}>
                                Profit margin below 10%. Consider cost optimization in Administrative or Direct costs.
                            </p>
                        </div>
                    )}

                    {netProfit > 0 && profitMargin >= 10 && (
                        <div style={{ padding: 'var(--spacing-md)', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--color-success)', borderRadius: 'var(--radius-md)' }}>
                            <strong style={{ color: 'var(--color-success)' }}>✅ Healthy Performance</strong>
                            <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-gray-700)' }}>
                                Operations are profitable with healthy {profitMargin}% margin.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KPIs;
