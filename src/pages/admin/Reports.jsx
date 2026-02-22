import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { financeSummariesAPI, auditLogsAPI } from '../../services/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './Reports.css';

const Reports = () => {
    const { seasons, expenses, loading } = useData();
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentSeason, setCurrentSeason] = useState(null);
    const [incomeData, setIncomeData] = useState(null);
    const [cashFlowData, setCashFlowData] = useState(null);
    const [auditStats, setAuditStats] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);

    useEffect(() => {
        const activeSeason = seasons.find(s => s.active === true || s.status === 'ACTIVE' || s.status === 'active');
        setCurrentSeason(activeSeason || seasons[0] || null);
        console.log('Reports - seasons:', seasons);
        console.log('Reports - activeSeason:', activeSeason);
    }, [seasons]);

    useEffect(() => {
        if (currentSeason) {
            console.log('Reports - currentSeason set, loading data:', currentSeason);
            loadReportData();
        } else {
            console.log('Reports - no currentSeason available');
            setReportsLoading(false);
        }
    }, [currentSeason]);

    const loadReportData = async () => {
        if (!currentSeason) return;
        
        console.log('Reports - loadReportData starting for season:', currentSeason.id);
        setReportsLoading(true);
        try {
            // Load income statement data
            try {
                const incomeRes = await financeSummariesAPI.getIncomeStatement({ season_id: currentSeason.id });
                console.log('Reports - income statement response:', incomeRes);
                console.log('Reports - income statement data structure:', incomeRes.data);
                console.log('Reports - income statement success check:', incomeRes.data?.success);
                if (incomeRes.data?.success) {
                    setIncomeData(incomeRes.data.data);
                    console.log('Reports - income data set:', incomeRes.data.data);
                } else {
                    console.warn('Reports - income statement not successful:', incomeRes.data);
                    // Try to set data anyway if response exists
                    if (incomeRes.data) {
                        setIncomeData(incomeRes.data);
                        console.log('Reports - income data set from direct response:', incomeRes.data);
                    }
                }
            } catch (incomeError) {
                console.error('Reports - income statement error:', incomeError);
            }

            // Load cash flow data
            try {
                const cashFlowRes = await financeSummariesAPI.getCashFlow({ season_id: currentSeason.id });
                console.log('Reports - cash flow response:', cashFlowRes);
                console.log('Reports - cash flow data structure:', cashFlowRes.data);
                console.log('Reports - cash flow success check:', cashFlowRes.data?.success);
                if (cashFlowRes.data?.success) {
                    setCashFlowData(cashFlowRes.data.data);
                    console.log('Reports - cash flow data set:', cashFlowRes.data.data);
                } else {
                    console.warn('Reports - cash flow not successful:', cashFlowRes.data);
                    // Try to set data anyway if response exists
                    if (cashFlowRes.data) {
                        setCashFlowData(cashFlowRes.data);
                        console.log('Reports - cash flow data set from direct response:', cashFlowRes.data);
                    }
                }
            } catch (cashFlowError) {
                console.error('Reports - cash flow error:', cashFlowError);
            }

            // Load audit log stats
            try {
                const auditStatsRes = await auditLogsAPI.getStats();
                console.log('Reports - audit stats response:', auditStatsRes);
                console.log('Reports - audit stats data structure:', auditStatsRes.data);
                console.log('Reports - audit stats success check:', auditStatsRes.data?.success);
                if (auditStatsRes.data?.success) {
                    setAuditStats(auditStatsRes.data.data);
                    console.log('Reports - audit stats data set:', auditStatsRes.data.data);
                } else {
                    console.warn('Reports - audit stats not successful:', auditStatsRes.data);
                    // Try to set data anyway if response exists
                    if (auditStatsRes.data) {
                        setAuditStats(auditStatsRes.data);
                        console.log('Reports - audit stats data set from direct response:', auditStatsRes.data);
                    }
                }
            } catch (auditStatsError) {
                console.error('Reports - audit stats error:', auditStatsError);
            }

            // Load recent audit logs
            try {
                const auditLogsRes = await auditLogsAPI.getAll({ limit: 100 });
                console.log('Reports - audit logs response:', auditLogsRes);
                console.log('Reports - audit logs data structure:', auditLogsRes.data);
                console.log('Reports - audit logs success check:', auditLogsRes.data?.success);
                if (auditLogsRes.data?.success) {
                    setAuditLogs(auditLogsRes.data.data || []);
                    console.log('Reports - audit logs data set:', auditLogsRes.data.data);
                } else {
                    console.warn('Reports - audit logs not successful:', auditLogsRes.data);
                    // Try to set data anyway if response exists
                    if (auditLogsRes.data) {
                        setAuditLogs(auditLogsRes.data.data || auditLogsRes.data || []);
                        console.log('Reports - audit logs data set from direct response:', auditLogsRes.data.data || auditLogsRes.data);
                    }
                }
            } catch (auditLogsError) {
                console.error('Reports - audit logs error:', auditLogsError);
            }
        } catch (error) {
            console.error('Reports - general error loading report data:', error);
        } finally {
            console.log('Reports - loadReportData completed, setting loading to false');
            setReportsLoading(false);
        }
    };

    // Reports that can be integrated with backend
    const reports = [
        {
            id: 1,
            title: currentSeason ? `Income Statement - ${currentSeason.name}` : 'Income Statement',
            type: 'income-statement',
            accent: 'brown',
            iconBg: 'brown',
            iconColor: 'brown'
        },
        {
            id: 2,
            title: currentSeason ? `Expense Report - ${currentSeason.name}` : 'Expense Report',
            type: 'expense-report',
            accent: 'purple',
            iconBg: 'purple',
            iconColor: 'purple'
        },
        {
            id: 3,
            title: currentSeason ? `Cash Flow Statement - ${currentSeason.name}` : 'Cash Flow Statement',
            type: 'cash-flow',
            accent: 'orange',
            iconBg: 'orange',
            iconColor: 'orange'
        },
        {
            id: 4,
            title: `Audit Log Summary`,
            type: 'audit-log',
            accent: 'blue',
            iconBg: 'blue',
            iconColor: 'blue'
        }
    ];

    const generateReportContent = (reportType) => {
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = `
            width: 800px;
            padding: 40px;
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            line-height: 1.4;
            color: #333;
            background: white;
            margin: 0 auto;
        `;

        let content = '';

        switch (reportType) {
            case 'income-statement':
                content = generateIncomeStatementContent();
                break;
            case 'expense-report':
                content = generateExpenseReportContent();
                break;
            case 'cash-flow':
                content = generateCashFlowContent();
                break;
            case 'audit-log':
                content = generateAuditLogContent();
                break;
            default:
                content = '<p>Report not available</p>';
        }

        tempDiv.innerHTML = content;
        return tempDiv;
    };

    const generateIncomeStatementContent = () => {
        if (!incomeData) {
            return '<p>Loading income statement data...</p>';
        }

        const totalRevenue = incomeData.totalRevenue || 0;
        const totalExpenses = incomeData.totalExpenses || 0;
        const netIncome = incomeData.netIncome || 0;

        return `
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; color: #2c3e50; font-size: 28px; font-weight: bold;">Income Statement</h1>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 16px;">${currentSeason ? `Season: ${currentSeason.name}` : 'All Seasons'}</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="border-bottom: 2px solid #e0e0e0; margin: 30px 0;"></div>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                    <td style="padding: 12px 8px; border-bottom: 1px solid #ddd;">Revenue</td>
                    <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF ${totalRevenue.toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 8px; padding-left: 30px; border-bottom: 1px solid #ddd;">Sales Revenue</td>
                    <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF ${totalRevenue.toLocaleString()}</td>
                </tr>
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                    <td style="padding: 12px 8px; border-bottom: 1px solid #ddd;">Gross Profit</td>
                    <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF ${totalRevenue.toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 8px; padding-left: 30px; border-bottom: 1px solid #ddd;">Operating Expenses</td>
                    <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF ${totalExpenses.toLocaleString()}</td>
                </tr>
                <tr style="background-color: #e9ecef; font-weight: bold; font-size: 16px;">
                    <td style="padding: 15px 8px; color: ${netIncome >= 0 ? '#28a745' : '#dc3545'};">Net Profit / (Loss)</td>
                    <td style="padding: 15px 8px; text-align: right; color: ${netIncome >= 0 ? '#28a745' : '#dc3545'};">RWF ${netIncome.toLocaleString()}</td>
                </tr>
            </table>
        `;
    };

    const generateExpenseReportContent = () => {
        const seasonExpenses = currentSeason ? expenses.filter(e => e.season_id === currentSeason.id) : expenses;
        
        // Group expenses by category
        const expensesByCategory = {};
        seasonExpenses.forEach(expense => {
            const category = expense.category || 'Uncategorized';
            if (!expensesByCategory[category]) {
                expensesByCategory[category] = {
                    category: category,
                    total: 0,
                    count: 0,
                    items: []
                };
            }
            expensesByCategory[category].total += parseFloat(expense.amount || 0);
            expensesByCategory[category].count++;
            expensesByCategory[category].items.push(expense);
        });

        const totalExpenses = Object.values(expensesByCategory).reduce((sum, cat) => sum + cat.total, 0);

        let tableRows = '';
        Object.values(expensesByCategory).forEach(category => {
            tableRows += `
                <tr>
                    <td style="padding: 10px 8px; border-bottom: 1px solid #ddd;">${category.category}</td>
                    <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #ddd;">${category.count}</td>
                    <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF ${category.total.toLocaleString()}</td>
                    <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF ${category.count > 0 ? (category.total / category.count).toLocaleString() : 0}</td>
                </tr>
            `;
        });

        return `
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; color: #2c3e50; font-size: 28px; font-weight: bold;">Expense Report</h1>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 16px;">${currentSeason ? `Season: ${currentSeason.name}` : 'All Seasons'}</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="border-bottom: 2px solid #e0e0e0; margin: 30px 0;"></div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin-bottom: 10px;">Summary</h3>
                <p><strong>Total Expenses:</strong> RWF ${totalExpenses.toLocaleString()}</p>
                <p><strong>Categories:</strong> ${Object.keys(expensesByCategory).length}</p>
                <p><strong>Total Transactions:</strong> ${seasonExpenses.length}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f8f9fa; font-weight: bold;">
                        <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd;">Category</th>
                        <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Count</th>
                        <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Total Amount</th>
                        <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Average</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows || '<tr><td colspan="4" style="padding: 20px; text-align: center;">No expenses found</td></tr>'}
                    <tr style="background-color: #e9ecef; font-weight: bold; font-size: 16px;">
                        <td style="padding: 15px 8px;">Total</td>
                        <td style="padding: 15px 8px; text-align: right;">${seasonExpenses.length}</td>
                        <td style="padding: 15px 8px; text-align: right;">RWF ${totalExpenses.toLocaleString()}</td>
                        <td style="padding: 15px 8px; text-align: right;">RWF ${seasonExpenses.length > 0 ? (totalExpenses / seasonExpenses.length).toLocaleString() : 0}</td>
                    </tr>
                </tbody>
            </table>
        `;
    };

    const generateCashFlowContent = () => {
        if (!cashFlowData) {
            return '<p>Loading cash flow data...</p>';
        }

        const cashInflows = cashFlowData.cashInflows || 0;
        const cashOutflows = cashFlowData.cashOutflows || 0;
        const netCashFlow = cashFlowData.netCashFlow || 0;

        return `
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; color: #2c3e50; font-size: 28px; font-weight: bold;">Cash Flow Statement</h1>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 16px;">${currentSeason ? `Season: ${currentSeason.name}` : 'All Seasons'}</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="border-bottom: 2px solid #e0e0e0; margin: 30px 0;"></div>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                    <td style="padding: 12px 8px; border-bottom: 1px solid #ddd;">Operating Activities</td>
                    <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #ddd;"></td>
                </tr>
                <tr>
                    <td style="padding: 12px 8px; padding-left: 30px; border-bottom: 1px solid #ddd;">Cash from Sales</td>
                    <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF ${cashInflows.toLocaleString()}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 8px; padding-left: 30px; border-bottom: 1px solid #ddd;">Cash for Operations</td>
                    <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #ddd;">(RWF ${cashOutflows.toLocaleString()})</td>
                </tr>
                <tr style="background-color: #e9ecef; font-weight: bold; font-size: 16px;">
                    <td style="padding: 15px 8px; color: ${netCashFlow >= 0 ? '#28a745' : '#dc3545'};">Net Cash from Operating Activities</td>
                    <td style="padding: 15px 8px; text-align: right; color: ${netCashFlow >= 0 ? '#28a745' : '#dc3545'};">RWF ${netCashFlow.toLocaleString()}</td>
                </tr>
            </table>
        `;
    };

    const generateAuditLogContent = () => {
        if (!auditStats && auditLogs.length === 0) {
            return '<p>Loading audit log data...</p>';
        }

        // Count actions by type
        const actionCounts = {};
        auditLogs.forEach(log => {
            const action = log.action || 'UNKNOWN';
            actionCounts[action] = (actionCounts[action] || 0) + 1;
        });

        const totalActivities = auditLogs.length;
        const uniqueUsers = new Set(auditLogs.map(log => log.name || log.user?.name).filter(Boolean)).size;

        let actionRows = '';
        Object.entries(actionCounts)
            .sort((a, b) => b[1] - a[1])
            .forEach(([action, count]) => {
                const percentage = totalActivities > 0 ? ((count / totalActivities) * 100).toFixed(1) : 0;
                actionRows += `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${action}</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${count}</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${percentage}%</td>
                    </tr>
                `;
            });

        return `
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; color: #2c3e50; font-size: 28px; font-weight: bold;">Audit Log Summary</h1>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 16px;">System Activity Report</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="border-bottom: 2px solid #e0e0e0; margin: 30px 0;"></div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin-bottom: 10px;">Activity Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Activities:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${totalActivities}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Active Users:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${uniqueUsers}</td>
                    </tr>
                </table>
            </div>
            
            <h3 style="color: #2c3e50; margin-bottom: 10px;">Activities by Type</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f8f9fa; font-weight: bold;">
                        <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #ddd;">Activity Type</th>
                        <th style="padding: 10px 8px; text-align: right; border-bottom: 2px solid #ddd;">Count</th>
                        <th style="padding: 10px 8px; text-align: right; border-bottom: 2px solid #ddd;">Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${actionRows || '<tr><td colspan="3" style="padding: 20px; text-align: center;">No audit logs found</td></tr>'}
                </tbody>
            </table>
        `;
    };

    const handleDownload = async (reportTitle, reportType) => {
        if (isGenerating) return;
        
        setIsGenerating(true);
        
        try {
            const reportContent = generateReportContent(reportType);
            
            // Temporarily add to DOM for rendering
            reportContent.style.position = 'absolute';
            reportContent.style.left = '-9999px';
            document.body.appendChild(reportContent);
            
            const canvas = await html2canvas(reportContent, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: 800,
                height: reportContent.scrollHeight
            });
            
            // Remove temporary element
            document.body.removeChild(reportContent);
            
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
            const filename = `${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(filename);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Debug loading states
    useEffect(() => {
        console.log('Reports - loading states debug:', {
            loading: loading,
            reportsLoading: reportsLoading,
            shouldShowLoading: loading || reportsLoading
        });
    }, [loading, reportsLoading]);

    if (reportsLoading) {
        console.log('Reports - showing loading spinner because:', { loading, reportsLoading });
        return (
            <div className="page-loading">
                <div className="loading-spinner"></div>
                <p>Loading reports...</p>
            </div>
        );
    }

    return (
        <div className="reports-page">
            <div className="page-header">
                <h1 className="page-title">Financial Reports</h1>
                <p className="page-description">Generate and download financial statements and system reports</p>
            </div>

            {!currentSeason && (
                <div className="alert alert-warning" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    No active season selected. Reports will show data from all seasons.
                </div>
            )}

            <div className="reports-grid">
                {reports.map((report) => (
                    <div key={report.id} className={`report-card card-accent-${report.accent}`}>
                        <div className="report-main-content">
                            <div className="report-content-wrapper">
                                <div className={`report-icon-wrapper icon-bg-${report.iconBg}`}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </div>
                                <div className="report-details">
                                    <h3 className={`report-title text-${report.accent === 'brown' ? 'brown-dark' : report.accent}`}>
                                        {report.title}
                                    </h3>
                                    <div className="report-meta">
                                        Generated from backend data
                                    </div>
                                </div>
                            </div>

                            <div className="report-actions">
                                <button
                                    className={`btn-download-pdf btn-outline-${report.accent}`}
                                    onClick={() => handleDownload(report.title, report.type)}
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? 'Generating...' : 'Download PDF'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reports;
