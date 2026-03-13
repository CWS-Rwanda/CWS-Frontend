import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { financeSummariesAPI, excelFinanceAPI } from '../../services/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const FinancialStatements = () => {
    const { deliveries, expenses, laborCosts, seasons, loading } = useData();
    const [incomeStatement, setIncomeStatement] = useState(null);
    const [balanceSheet, setBalanceSheet] = useState(null);
    const [cashFlow, setCashFlow] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [activeSource, setActiveSource] = useState('excel'); // 'excel' or 'database'

    // Excel state
    const [excelFileExists, setExcelFileExists] = useState(null);
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [excelAllData, setExcelAllData] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState([]);

    // Refs for PDF generation
    const incomeStatementRef = useRef(null);
    const balanceSheetRef = useRef(null);
    const cashFlowRef = useRef(null);

    const currentSeason = seasons.find(s => s.active === true || s.status === 'ACTIVE' || s.status === 'active');

    useEffect(() => {
        checkExcelFile();
        if (currentSeason) loadFinancialStatements();
    }, [currentSeason]);

    useEffect(() => {
        if (activeSource === 'excel') loadExcelData();
    }, [selectedYear]);

    const checkExcelFile = async () => {
        try {
            const res = await excelFinanceAPI.checkFile(selectedYear);
            setExcelFileExists(res.data.data.exists);
            setAvailableYears(res.data.data.availableYears || []);
            if (res.data.data.exists) loadExcelData();
        } catch (err) {
            setExcelFileExists(false);
        }
    };

    const loadExcelData = async () => {
        try {
            const res = await excelFinanceAPI.getAll(selectedYear);
            setExcelAllData(res.data.data);
        } catch (err) {
            console.error('Error loading Excel data:', err);
        }
    };

    const handleCreateFile = async () => {
        setIsCreatingFile(true);
        try {
            await excelFinanceAPI.createFile(selectedYear);
            setExcelFileExists(true);
            await loadExcelData();
            await checkExcelFile();
        } catch (err) {
            console.error('Error creating file:', err);
        } finally {
            setIsCreatingFile(false);
        }
    };

    const loadFinancialStatements = async () => {
        if (!currentSeason) return;
        setIsLoading(true);
        try {
            const incomeRes = await financeSummariesAPI.getIncomeStatement({ season_id: currentSeason.id });
            setIncomeStatement(incomeRes.data.data);
            const balanceRes = await financeSummariesAPI.getBalanceSheet({ date: new Date().toISOString().split('T')[0] });
            setBalanceSheet(balanceRes.data.data);
            const cashFlowRes = await financeSummariesAPI.getCashFlow({ season_id: currentSeason.id });
            setCashFlow(cashFlowRes.data.data);
        } catch (error) {
            console.error('Error loading financial statements:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Database-based calculations
    const totalCherryCost = deliveries.reduce((sum, d) => sum + parseFloat(d.totalAmount || 0), 0);
    const totalRevenue = incomeStatement?.totalRevenue || 0;
    const totalExpenses = incomeStatement?.totalExpenses || expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const totalLabor = laborCosts.reduce((sum, l) => sum + parseFloat(l.total_amount || l.totalCost || 0), 0);
    const grossProfit = totalRevenue - totalCherryCost;
    const netProfit = incomeStatement?.netIncome || (totalRevenue - totalCherryCost - totalExpenses - totalLabor);

    const handleDownload = async (type) => {
        setIsDownloading(true);
        let elementRef, filename;

        switch (type) {
            case 'Income Statement':
                elementRef = incomeStatementRef.current;
                filename = `income-statement-${selectedYear}.pdf`;
                break;
            case 'Balance Sheet':
                elementRef = balanceSheetRef.current;
                filename = `balance-sheet-${selectedYear}.pdf`;
                break;
            case 'Cash Flow Statement':
                elementRef = cashFlowRef.current;
                filename = `cash-flow-statement-${selectedYear}.pdf`;
                break;
            default:
                setIsDownloading(false);
                return;
        }

        if (!elementRef) { setIsDownloading(false); return; }

        try {
            const headerDiv = document.createElement('div');
            headerDiv.style.padding = '20px';
            headerDiv.style.textAlign = 'center';
            headerDiv.style.backgroundColor = 'white';
            headerDiv.innerHTML = `
                <h1 style="margin: 0; color: #333; font-size: 24px; font-weight: bold;">${type}</h1>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Year ${selectedYear}</p>
                <hr style="margin: 20px 0; border: none; border-top: 2px solid #333;">
            `;

            const clonedElement = elementRef.cloneNode(true);
            clonedElement.insertBefore(headerDiv, clonedElement.firstChild);
            clonedElement.style.position = 'absolute';
            clonedElement.style.left = '-9999px';
            clonedElement.style.backgroundColor = 'white';
            document.body.appendChild(clonedElement);

            const canvas = await html2canvas(clonedElement, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
            document.body.removeChild(clonedElement);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(filename);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF.');
        } finally {
            setIsDownloading(false);
        }
    };

    const excelIncome = excelAllData?.incomeStatement;
    const excelBalance = excelAllData?.balanceSheet;
    const excelSelling = excelAllData?.selling;
    const excelDirectCosts = excelAllData?.directCosts;
    const excelStaff = excelAllData?.staff;
    const excelAdminCosts = excelAllData?.adminCosts;
    const excelMaintBags = excelAllData?.maintBags;

    // Generate year options
    const yearOptions = [];
    const curYear = new Date().getFullYear();
    for (let y = curYear + 1; y >= curYear - 5; y--) yearOptions.push(y);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Financial Statements</h1>
                <p className="page-description">View and download financial reports from Database or Excel files</p>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0' }}>
                    <button
                        onClick={() => setActiveSource('excel')}
                        className={`btn ${activeSource === 'excel' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ borderRadius: '8px 0 0 8px' }}
                    >
                        📊 Excel Data
                    </button>
                    <button
                        onClick={() => setActiveSource('database')}
                        className={`btn ${activeSource === 'database' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ borderRadius: '0 8px 8px 0' }}
                    >
                        🗄️ Database Data
                    </button>
                </div>

                {activeSource === 'excel' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Year:</label>
                        <select
                            className="form-select"
                            value={selectedYear}
                            onChange={(e) => { setSelectedYear(parseInt(e.target.value)); checkExcelFile(); }}
                            style={{ width: 'auto' }}
                        >
                            {yearOptions.map(y => (
                                <option key={y} value={y}>
                                    {y} {availableYears.includes(y) ? '✅' : ''}
                                </option>
                            ))}
                        </select>
                        <button onClick={loadExcelData} className="btn btn-outline btn-sm">🔄</button>
                    </div>
                )}
            </div>

            {/* Excel File Status */}
            {activeSource === 'excel' && excelFileExists === false && (
                <div className="alert alert-warning" style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <strong>⚠️ No financial statement file found for {selectedYear}.</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Create the file to view Excel-based financial statements.</p>
                    </div>
                    <button onClick={handleCreateFile} className="btn btn-primary" disabled={isCreatingFile} style={{ whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                        {isCreatingFile ? 'Creating...' : `📄 Create Financial File for ${selectedYear}`}
                    </button>
                </div>
            )}

            {!currentSeason && activeSource === 'database' && (
                <div className="alert alert-warning" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    No active season found. Please create or activate a season to view database financial statements.
                </div>
            )}

            {/* ==================== INCOME STATEMENT ==================== */}
            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Income Statement {activeSource === 'excel' ? `(${selectedYear})` : ''}</h2>
                    <button onClick={() => handleDownload('Income Statement')} className="btn btn-primary" disabled={isDownloading}>
                        📄 {isDownloading ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>

                <div ref={incomeStatementRef} style={{ padding: '1rem', backgroundColor: 'white' }}>
                    {isLoading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                    ) : activeSource === 'excel' ? (
                        excelIncome ? (
                            <table className="table">
                                <tbody>
                                    <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                                        <td>SALES</td>
                                        <td></td>
                                    </tr>
                                    {excelIncome.sales?.map((s, i) => (
                                        <tr key={i}>
                                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>{s.description}</td>
                                            <td className="text-right">RWF {(s.amount || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                                        <td>TOTAL SALES</td>
                                        <td className="text-right">RWF {(excelIncome.totalSales || 0).toLocaleString()}</td>
                                    </tr>
                                    <tr style={{ fontWeight: 'bold' }}><td>EXPENSES</td><td></td></tr>
                                    <tr><td style={{ fontStyle: 'italic' }}>Direct Costs</td><td></td></tr>
                                    {excelIncome.directCosts?.map((c, i) => (
                                        <tr key={i}>
                                            <td style={{ paddingLeft: 'var(--spacing-xl)' }}>{c.description}</td>
                                            <td className="text-right">RWF {(c.amount || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    <tr style={{ fontWeight: 'bold' }}>
                                        <td>Total Direct Costs</td>
                                        <td className="text-right">RWF {(excelIncome.totalDirectCosts || 0).toLocaleString()}</td>
                                    </tr>
                                    <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                                        <td>Gross Profit</td>
                                        <td className="text-right">RWF {(excelIncome.grossProfit || 0).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Administrative Costs</td>
                                        <td className="text-right">RWF {(excelIncome.administrativeCosts || 0).toLocaleString()}</td>
                                    </tr>
                                    <tr style={{ fontWeight: 'bold' }}>
                                        <td>TOTAL OPERATIONAL EXPENSES</td>
                                        <td className="text-right">RWF {(excelIncome.totalOperationalExpenses || 0).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Amortization</td>
                                        <td className="text-right">RWF {(excelIncome.amortization || 0).toLocaleString()}</td>
                                    </tr>
                                    <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                                        <td>Profit before INTEREST & TAXES</td>
                                        <td className="text-right">RWF {(excelIncome.profitBeforeTaxes || 0).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Local Tax</td>
                                        <td className="text-right">RWF {(excelIncome.localTax || 0).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Income Tax (28%)</td>
                                        <td className="text-right">RWF {(excelIncome.incomeTax || 0).toLocaleString()}</td>
                                    </tr>
                                    <tr style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold', fontSize: '1.125rem' }}>
                                        <td>Profit after TAXES</td>
                                        <td className="text-right" style={{ color: (excelIncome.profitAfterTaxes || 0) >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                            RWF {(excelIncome.profitAfterTaxes || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>No Excel data available for {selectedYear}.</div>
                        )
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

            {/* ==================== BALANCE SHEET ==================== */}
            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Balance Sheet {activeSource === 'excel' ? `(${selectedYear})` : ''}</h2>
                    <button onClick={() => handleDownload('Balance Sheet')} className="btn btn-primary" disabled={isDownloading}>
                        📄 {isDownloading ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>

                <div ref={balanceSheetRef} style={{ padding: '1rem', backgroundColor: 'white' }}>
                    {isLoading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                    ) : activeSource === 'excel' && excelBalance ? (
                        <table className="table">
                            <tbody>
                                <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                                    <td>CURRENT ASSETS</td><td></td>
                                </tr>
                                {excelBalance.currentAssets?.map((a, i) => (
                                    <tr key={i}>
                                        <td style={{ paddingLeft: 'var(--spacing-xl)' }}>{a.label}</td>
                                        <td className="text-right">RWF {(a.value || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr style={{ fontWeight: 'bold' }}>
                                    <td>Total Current Assets</td>
                                    <td className="text-right">RWF {(excelBalance.totalCurrentAssets || 0).toLocaleString()}</td>
                                </tr>
                                <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                                    <td>FIXED ASSETS</td><td></td>
                                </tr>
                                {excelBalance.fixedAssets?.map((a, i) => (
                                    <tr key={i}>
                                        <td style={{ paddingLeft: 'var(--spacing-xl)' }}>{a.label}</td>
                                        <td className="text-right">RWF {(a.value || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr style={{ fontWeight: 'bold' }}>
                                    <td>Net Fixed Assets</td>
                                    <td className="text-right">RWF {(excelBalance.netFixedAssets || 0).toLocaleString()}</td>
                                </tr>
                                <tr style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    <td>TOTAL ASSETS</td>
                                    <td className="text-right">RWF {(excelBalance.totalAssets || 0).toLocaleString()}</td>
                                </tr>

                                <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                                    <td>CURRENT LIABILITIES</td><td></td>
                                </tr>
                                {excelBalance.currentLiabilities?.map((l, i) => (
                                    <tr key={i}>
                                        <td style={{ paddingLeft: 'var(--spacing-xl)' }}>{l.label}</td>
                                        <td className="text-right">RWF {(l.value || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr style={{ fontWeight: 'bold' }}>
                                    <td>Total Current Liabilities</td>
                                    <td className="text-right">RWF {(excelBalance.totalCurrentLiabilities || 0).toLocaleString()}</td>
                                </tr>

                                <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                                    <td>LONG-TERM LIABILITIES</td><td></td>
                                </tr>
                                {excelBalance.longTermLiabilities?.map((l, i) => (
                                    <tr key={i}>
                                        <td style={{ paddingLeft: 'var(--spacing-xl)' }}>{l.label}</td>
                                        <td className="text-right">RWF {(l.value || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr style={{ fontWeight: 'bold' }}>
                                    <td>Total Long-Term Liabilities</td>
                                    <td className="text-right">RWF {(excelBalance.totalLongTermLiabilities || 0).toLocaleString()}</td>
                                </tr>

                                <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                                    <td>STOCKHOLDERS' EQUITY</td><td></td>
                                </tr>
                                {excelBalance.equity?.map((e, i) => (
                                    <tr key={i}>
                                        <td style={{ paddingLeft: 'var(--spacing-xl)' }}>{e.label}</td>
                                        <td className="text-right">RWF {(e.value || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr style={{ fontWeight: 'bold' }}>
                                    <td>Total Stockholders' Equity</td>
                                    <td className="text-right">RWF {(excelBalance.totalEquity || 0).toLocaleString()}</td>
                                </tr>
                                <tr style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    <td>TOTAL LIABILITIES & EQUITY</td>
                                    <td className="text-right">RWF {(excelBalance.totalLiabilitiesAndEquity || 0).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    ) : activeSource === 'database' ? (
                        <table className="table">
                            <tbody>
                                <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                                    <td>ASSETS</td><td></td>
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
                                    <td>EQUITY</td><td></td>
                                </tr>
                                <tr>
                                    <td style={{ paddingLeft: 'var(--spacing-xl)' }}>Owner's Equity</td>
                                    <td className="text-right">RWF {balanceSheet?.equity?.toLocaleString() || '0'}</td>
                                </tr>
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>No data available.</div>
                    )}
                </div>
            </div>

            {/* ==================== CASH FLOW / EXTRA DETAILS ==================== */}
            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">
                        {activeSource === 'excel' ? `Detailed Breakdown (${selectedYear})` : 'Cash Flow Statement'}
                    </h2>
                    {activeSource === 'database' && (
                        <button onClick={() => handleDownload('Cash Flow Statement')} className="btn btn-primary" disabled={isDownloading}>
                            📄 {isDownloading ? 'Generating...' : 'Download PDF'}
                        </button>
                    )}
                </div>

                <div ref={cashFlowRef} style={{ padding: '1rem', backgroundColor: 'white' }}>
                    {activeSource === 'excel' && excelAllData ? (
                        <div>
                            {/* Selling Details */}
                            {excelSelling?.entries?.length > 0 && (
                                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>📈 Selling</h3>
                                    <table className="table">
                                        <thead>
                                            <tr><th>Item</th><th>Qty (kg)</th><th>U.P (RWF)</th><th>T.P (RWF)</th></tr>
                                        </thead>
                                        <tbody>
                                            {excelSelling.entries.map((e, i) => (
                                                <tr key={i}>
                                                    <td>{e.item}</td>
                                                    <td>{e.quantity_kg?.toLocaleString()}</td>
                                                    <td>{e.unit_price?.toLocaleString()}</td>
                                                    <td><strong>RWF {e.total_price?.toLocaleString()}</strong></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Direct Costs */}
                            {excelDirectCosts?.entries?.length > 0 && (
                                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>💰 Direct & Administrative Costs</h3>
                                    <table className="table">
                                        <thead>
                                            <tr><th>Description</th><th>Quantity</th><th>Amount</th><th>Total</th></tr>
                                        </thead>
                                        <tbody>
                                            {excelDirectCosts.entries.map((e, i) => (
                                                <tr key={i}>
                                                    <td>{e.description}</td>
                                                    <td>{e.quantity || '-'}</td>
                                                    <td>{e.amount ? `RWF ${e.amount.toLocaleString()}` : '-'}</td>
                                                    <td><strong>RWF {(e.total || 0).toLocaleString()}</strong></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Staff */}
                            {excelStaff?.entries?.length > 0 && (
                                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>👥 Staff & Salaries</h3>
                                    <table className="table">
                                        <thead>
                                            <tr><th>Position</th><th>#</th><th>Per Month</th><th># Months</th><th>Total</th></tr>
                                        </thead>
                                        <tbody>
                                            {excelStaff.entries.map((e, i) => (
                                                <tr key={i}>
                                                    <td>{e.position}</td>
                                                    <td>{e.count}</td>
                                                    <td>RWF {(e.per_month || 0).toLocaleString()}</td>
                                                    <td>{e.num_months}</td>
                                                    <td><strong>RWF {(e.total || 0).toLocaleString()}</strong></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Maintenance & Bags */}
                            {excelMaintBags?.entries?.length > 0 && (
                                <div>
                                    <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>🔧 Maintenance & Bags</h3>
                                    <table className="table">
                                        <thead>
                                            <tr><th>Item</th><th># Units</th><th>Unit Cost</th><th>Total</th></tr>
                                        </thead>
                                        <tbody>
                                            {excelMaintBags.entries.map((e, i) => (
                                                <tr key={i}>
                                                    <td>{e.item}</td>
                                                    <td>{e.units}</td>
                                                    <td>RWF {(e.unit_cost || 0).toLocaleString()}</td>
                                                    <td><strong>RWF {(e.total || 0).toLocaleString()}</strong></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : activeSource === 'database' ? (
                        <table className="table">
                            <tbody>
                                <tr style={{ backgroundColor: 'var(--color-gray-50)', fontWeight: 'bold' }}>
                                    <td>Operating Activities</td><td></td>
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
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>No data available.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancialStatements;
