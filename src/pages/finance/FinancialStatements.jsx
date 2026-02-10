import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { financeSummariesAPI } from '../../services/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const FinancialStatements = () => {
    const { deliveries, expenses, laborCosts, seasons, loading } = useData();
    const [incomeStatement, setIncomeStatement] = useState(null);
    const [balanceSheet, setBalanceSheet] = useState(null);
    const [cashFlow, setCashFlow] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Refs for PDF generation
    const incomeStatementRef = useRef(null);
    const balanceSheetRef = useRef(null);
    const cashFlowRef = useRef(null);

    const currentSeason = seasons.find(s => s.active === true || s.status === 'ACTIVE' || s.status === 'active');

    useEffect(() => {
        if (currentSeason) {
            loadFinancialStatements();
        }
    }, [currentSeason]);

    const loadFinancialStatements = async () => {
        if (!currentSeason) return;
        
        setIsLoading(true);
        try {
            // Load income statement
            const incomeRes = await financeSummariesAPI.getIncomeStatement({ season_id: currentSeason.id });
            setIncomeStatement(incomeRes.data.data);

            // Load balance sheet
            const balanceRes = await financeSummariesAPI.getBalanceSheet({ date: new Date().toISOString().split('T')[0] });
            setBalanceSheet(balanceRes.data.data);

            // Load cash flow
            const cashFlowRes = await financeSummariesAPI.getCashFlow({ season_id: currentSeason.id });
            setCashFlow(cashFlowRes.data.data);
        } catch (error) {
            console.error('Error loading financial statements:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Use API data if available, otherwise calculate from local data
    const totalCherryCost = deliveries.reduce((sum, d) => sum + parseFloat(d.totalAmount || 0), 0);
    const totalRevenue = incomeStatement?.totalRevenue || 0;
    const totalExpenses = incomeStatement?.totalExpenses || expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalLabor = laborCosts.reduce((sum, l) => sum + parseFloat(l.total_amount || l.totalCost || 0), 0);
    const grossProfit = totalRevenue - totalCherryCost;
    const netProfit = incomeStatement?.netIncome || (totalRevenue - totalCherryCost - totalExpenses - totalLabor);

    const handleDownload = async (type) => {
        setIsDownloading(true);
        
        let elementRef;
        let filename;
        
        switch(type) {
            case 'Income Statement':
                elementRef = incomeStatementRef.current;
                filename = `income-statement-${new Date().toISOString().split('T')[0]}.pdf`;
                break;
            case 'Balance Sheet':
                elementRef = balanceSheetRef.current;
                filename = `balance-sheet-${new Date().toISOString().split('T')[0]}.pdf`;
                break;
            case 'Cash Flow Statement':
                elementRef = cashFlowRef.current;
                filename = `cash-flow-statement-${new Date().toISOString().split('T')[0]}.pdf`;
                break;
            default:
                setIsDownloading(false);
                return;
        }
        
        if (!elementRef) {
            alert('Unable to generate PDF. Please try again.');
            setIsDownloading(false);
            return;
        }
        
        try {
            // Create a temporary header element
            const headerDiv = document.createElement('div');
            headerDiv.style.padding = '20px';
            headerDiv.style.textAlign = 'center';
            headerDiv.style.backgroundColor = 'white';
            headerDiv.innerHTML = `
                <h1 style="margin: 0; color: #333; font-size: 24px; font-weight: bold;">${type}</h1>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
                ${currentSeason ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Season: ${currentSeason.name || 'Current Season'}</p>` : ''}
                <hr style="margin: 20px 0; border: none; border-top: 2px solid #333;">
            `;
            
            // Clone the original content and prepend header
            const clonedElement = elementRef.cloneNode(true);
            clonedElement.insertBefore(headerDiv, clonedElement.firstChild);
            
            // Temporarily add the cloned element to the DOM for rendering
            clonedElement.style.position = 'absolute';
            clonedElement.style.left = '-9999px';
            clonedElement.style.backgroundColor = 'white';
            document.body.appendChild(clonedElement);
            
            const canvas = await html2canvas(clonedElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            
            // Remove the temporary element
            document.body.removeChild(clonedElement);
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            
            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // Add additional pages if content is longer than one page
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            // Save the PDF
            pdf.save(filename);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Financial Statements</h1>
                <p className="page-description">View and download financial reports</p>
            </div>

            {!currentSeason && (
                <div className="alert alert-warning" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    No active season found. Please create or activate a season to view financial statements.
                </div>
            )}

            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Income Statement</h2>
                    <button onClick={() => handleDownload('Income Statement')} className="btn btn-primary" disabled={!currentSeason || isDownloading}>
                        📄 {isDownloading ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>

                <div ref={incomeStatementRef} style={{ padding: '1rem', backgroundColor: 'white' }}>
                    {isLoading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading financial data...</div>
                    ) : (
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
                )}
                </div>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Balance Sheet</h2>
                    <button onClick={() => handleDownload('Balance Sheet')} className="btn btn-primary" disabled={!currentSeason || isDownloading}>
                        📄 {isDownloading ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>

                <div ref={balanceSheetRef} style={{ padding: '1rem', backgroundColor: 'white' }}>
                    {isLoading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading balance sheet...</div>
                    ) : (
                        <table className="table">
                        <tbody>
                            <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                                <td>ASSETS</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Fixed Assets</td>
                                <td className="text-right">RWF {balanceSheet?.totalAssets?.toLocaleString() || '0'}</td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Cash</td>
                                <td className="text-right">RWF {cashFlow?.netCashFlow ? (cashFlow.netCashFlow > 0 ? cashFlow.netCashFlow.toLocaleString() : '0') : '0'}</td>
                            </tr>
                            <tr style={{ fontWeight: 'bold', backgroundColor: 'var(--color-gray-100)' }}>
                                <td>Total Assets</td>
                                <td className="text-right">RWF {balanceSheet?.totalAssets?.toLocaleString() || '0'}</td>
                            </tr>
                            <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                                <td>EQUITY</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Owner's Equity</td>
                                <td className="text-right">RWF {balanceSheet?.equity?.toLocaleString() || '0'}</td>
                            </tr>
                        </tbody>
                    </table>
                )}
                </div>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Cash Flow Statement</h2>
                    <button onClick={() => handleDownload('Cash Flow Statement')} className="btn btn-primary" disabled={!currentSeason || isDownloading}>
                        📄 {isDownloading ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>

                <div ref={cashFlowRef} style={{ padding: '1rem', backgroundColor: 'white' }}>
                    {isLoading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading cash flow statement...</div>
                    ) : (
                        <table className="table">
                        <tbody>
                            <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                                <td>Operating Activities</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Cash from Sales</td>
                                <td className="text-right">RWF {cashFlow?.cashInflows?.toLocaleString() || totalRevenue.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Cash for Cherry Purchases</td>
                                <td className="text-right">(RWF {totalCherryCost.toLocaleString()})</td>
                            </tr>
                            <tr>
                                <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Cash for Operating Expenses</td>
                                <td className="text-right">(RWF {cashFlow?.cashOutflows?.toLocaleString() || (totalExpenses + totalLabor).toLocaleString()})</td>
                            </tr>
                            <tr style={{ fontWeight: 'bold', backgroundColor: 'var(--color-gray-100)' }}>
                                <td>Net Cash from Operating Activities</td>
                                <td className="text-right" style={{ color: (cashFlow?.netCashFlow || netProfit) >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                    RWF {(cashFlow?.netCashFlow || netProfit).toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}
                </div>
            </div>
        </div>
    );
};

export default FinancialStatements;
