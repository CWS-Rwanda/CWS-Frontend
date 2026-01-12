import React from 'react';
import { useData } from '../../context/DataContext';

const Reports = () => {
    const { deliveries, lots, revenue, expenses, laborCosts, seasons } = useData();

    const currentSeason = seasons.find(s => s.status === 'active');

    // Calculate financial data
    const totalCherryCost = deliveries.reduce((sum, d) => sum + d.totalAmount, 0);
    const totalRevenue = revenue.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalLabor = laborCosts.reduce((sum, l) => sum + l.totalCost, 0);
    const totalCosts = totalCherryCost + totalExpenses + totalLabor;
    const netProfit = totalRevenue - totalCosts;

    // Assets
    const totalAssetValue = 38875000; // Simplified

    const handleDownload = (reportType) => {
        alert(`Downloading ${reportType}...`);
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Financial Reports</h1>
                <p className="page-description">Generate and download financial statements</p>
            </div>

            {/* Income Statement */}
            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Income Statement - {currentSeason?.name}</h2>
                    <button onClick={() => handleDownload('Income Statement')} className="btn btn-primary">
                        📄 Download PDF
                    </button>
                </div>

                <table className="table">
                    <tbody>
                        <tr style={{ backgroundColor: 'var(--color-gray-50)' }}>
                            <td><strong>Revenue</strong></td>
                            <td className="text-right"><strong>RWF {totalRevenue.toLocaleString()}</strong></td>
                        </tr>
                        <tr style={{ backgroundColor: 'var(--color-gray-50)' }}>
                            <td><strong>Cost of Goods Sold</strong></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Cherry Purchases</td>
                            <td className="text-right">RWF {totalCherryCost.toLocaleString()}</td>
                        </tr>
                        <tr style={{ backgroundColor: 'var(--color-gray-50)' }}>
                            <td><strong>Gross Profit</strong></td>
                            <td className="text-right"><strong>RWF {(totalRevenue - totalCherryCost).toLocaleString()}</strong></td>
                        </tr>
                        <tr style={{ backgroundColor: 'var(--color-gray-50)' }}>
                            <td><strong>Operating Expenses</strong></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Labor Costs</td>
                            <td className="text-right">RWF {totalLabor.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Other Operating Expenses</td>
                            <td className="text-right">RWF {totalExpenses.toLocaleString()}</td>
                        </tr>
                        <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                            <td><strong>Net Profit / (Loss)</strong></td>
                            <td className="text-right" style={{ color: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                <strong>RWF {netProfit.toLocaleString()}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Balance Sheet */}
            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Balance Sheet - {currentSeason?.name}</h2>
                    <button onClick={() => handleDownload('Balance Sheet')} className="btn btn-primary">
                        📄 Download PDF
                    </button>
                </div>

                <table className="table">
                    <tbody>
                        <tr style={{ backgroundColor: 'var(--color-gray-50)' }}>
                            <td><strong>ASSETS</strong></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Fixed Assets</td>
                            <td className="text-right">RWF {totalAssetValue.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Cash</td>
                            <td className="text-right">RWF 5,000,000</td>
                        </tr>
                        <tr style={{ fontWeight: 'bold', backgroundColor: 'var(--color-gray-100)' }}>
                            <td>Total Assets</td>
                            <td className="text-right">RWF {(totalAssetValue + 5000000).toLocaleString()}</td>
                        </tr>
                        <tr style={{ backgroundColor: 'var(--color-gray-50)' }}>
                            <td><strong>LIABILITIES & EQUITY</strong></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Equity</td>
                            <td className="text-right">RWF {(totalAssetValue + 5000000).toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Cash Flow */}
            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Cash Flow Statement - {currentSeason?.name}</h2>
                    <button onClick={() => handleDownload('Cash Flow Statement')} className="btn btn-primary">
                        📄 Download PDF
                    </button>
                </div>

                <table className="table">
                    <tbody>
                        <tr style={{ backgroundColor: 'var(--color-gray-50)' }}>
                            <td><strong>Operating Activities</strong></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Net Profit</td>
                            <td className="text-right">RWF {netProfit.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Cash from Revenue</td>
                            <td className="text-right">RWF {totalRevenue.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Cash for Cherries</td>
                            <td className="text-right">(RWF {totalCherryCost.toLocaleString()})</td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Cash for Operating Expenses</td>
                            <td className="text-right">(RWF {(totalExpenses + totalLabor).toLocaleString()})</td>
                        </tr>
                        <tr style={{ fontWeight: 'bold', backgroundColor: 'var(--color-gray-100)' }}>
                            <td>Net Cash from Operating Activities</td>
                            <td className="text-right">RWF {netProfit.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;
