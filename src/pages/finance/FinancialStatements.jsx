import React from 'react';
import { useData } from '../../context/DataContext';

const FinancialStatements = () => {
    const { deliveries, revenue, expenses, laborCosts } = useData();

    const totalCherryCost = deliveries.reduce((sum, d) => sum + d.totalAmount, 0);
    const totalRevenue = revenue.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalLabor = laborCosts.reduce((sum, l) => sum + l.totalCost, 0);
    const grossProfit = totalRevenue - totalCherryCost;
    const netProfit = totalRevenue - totalCherryCost - totalExpenses - totalLabor;

    const handleDownload = (type) => {
        alert(`Downloading ${type}...`);
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Financial Statements</h1>
                <p className="page-description">View and download financial reports</p>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Income Statement</h2>
                    <button onClick={() => handleDownload('Income Statement')} className="btn btn-primary">
                        📄 Download PDF
                    </button>
                </div>

                <table className="table">
                    <tbody>
                        <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                            <td>Revenue</td>
                            <td className="text-right">RWF {totalRevenue.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Cherry Purchases (COGS)</td>
                            <td className="text-right">RWF {totalCherryCost.toLocaleString()}</td>
                        </tr>
                        <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                            <td>Gross Profit</td>
                            <td className="text-right">RWF {grossProfit.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Labor Costs</td>
                            <td className="text-right">RWF {totalLabor.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Operating Expenses</td>
                            <td className="text-right">RWF {totalExpenses.toLocaleString()}</td>
                        </tr>
                        <tr style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold', fontSize: '1.125rem' }}>
                            <td>Net Profit / (Loss)</td>
                            <td className="text-right" style={{ color: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                RWF {netProfit.toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Balance Sheet</h2>
                    <button onClick={() => handleDownload('Balance Sheet')} className="btn btn-primary">
                        📄 Download PDF
                    </button>
                </div>

                <table className="table">
                    <tbody>
                        <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                            <td>ASSETS</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Fixed Assets</td>
                            <td className="text-right">RWF 38,875,000</td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Cash</td>
                            <td className="text-right">RWF 5,000,000</td>
                        </tr>
                        <tr style={{ fontWeight: 'bold', backgroundColor: 'var(--color-gray-100)' }}>
                            <td>Total Assets</td>
                            <td className="text-right">RWF 43,875,000</td>
                        </tr>
                        <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                            <td>EQUITY</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Owner's Equity</td>
                            <td className="text-right">RWF 43,875,000</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Cash Flow Statement</h2>
                    <button onClick={() => handleDownload('Cash Flow Statement')} className="btn btn-primary">
                        📄 Download PDF
                    </button>
                </div>

                <table className="table">
                    <tbody>
                        <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                            <td>Operating Activities</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Cash from Sales</td>
                            <td className="text-right">RWF {totalRevenue.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Cash for Cherry Purchases</td>
                            <td className="text-right">(RWF {totalCherryCost.toLocaleString()})</td>
                        </tr>
                        <tr>
                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Cash for Operating Expenses</td>
                            <td className="text-right">(RWF {(totalExpenses + totalLabor).toLocaleString()})</td>
                        </tr>
                        <tr style={{ fontWeight: 'bold', backgroundColor: 'var(--color-gray-100)' }}>
                            <td>Net Cash from Operating Activities</td>
                            <td className="text-right" style={{ color: netProfit >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                RWF {netProfit.toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinancialStatements;
