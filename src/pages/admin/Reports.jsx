import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { financeSummariesAPI, auditLogsAPI } from '../../services/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './Reports.css';

const Reports = () => {
    const { seasons, deliveries, expenses, laborCosts, farmers, loading } = useData();
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentSeason, setCurrentSeason] = useState(null);

    useEffect(() => {
        const activeSeason = seasons.find(s => s.active === true || s.status === 'ACTIVE' || s.status === 'active');
        setCurrentSeason(activeSeason || seasons[0] || null);
    }, [seasons]);

    // Reports data with dynamic titles
    const reports = [
        {
            id: 1,
            title: currentSeason ? `Income Statement - ${currentSeason.name}` : 'Income Statement',
            type: 'income-statement',
            uploadedBy: 'Furaha Divin',
            timeAgo: '2 days ago',
            accent: 'brown',
            iconBg: 'brown',
            iconColor: 'brown'
        },
        {
            id: 2,
            title: currentSeason ? `Expense Report - ${currentSeason.name}` : 'Expense Report',
            type: 'expense-report',
            uploadedBy: 'Nshuti Angelo',
            timeAgo: '5 days ago',
            accent: 'purple',
            iconBg: 'purple',
            iconColor: 'purple'
        },
        {
            id: 3,
            title: currentSeason ? `Cash Flow Statement - ${currentSeason.name}` : 'Cash Flow Statement',
            type: 'cash-flow',
            uploadedBy: 'Nshuti Christian',
            timeAgo: '12 days ago',
            accent: 'orange',
            iconBg: 'orange',
            iconColor: 'orange'
        },
        {
            id: 4,
            title: `Operational Budget - 2026A`,
            type: 'budget',
            uploadedBy: 'Keza Marie',
            timeAgo: '2 weeks ago',
            accent: 'green',
            iconBg: 'green',
            iconColor: 'green'
        },
        {
            id: 5,
            title: `Audit Log Summary - Q1`,
            type: 'audit-log',
            uploadedBy: 'System Admin',
            timeAgo: '3 weeks ago',
            accent: 'blue',
            iconBg: 'blue',
            iconColor: 'blue'
        },
        {
            id: 6,
            title: `Sustainability Impact Report`,
            type: 'sustainability',
            uploadedBy: 'Gasana Jean',
            timeAgo: '1 month ago',
            accent: 'teal',
            iconBg: 'teal',
            iconColor: 'teal'
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
            case 'budget':
                content = generateBudgetContent();
                break;
            case 'audit-log':
                content = generateAuditLogContent();
                break;
            case 'sustainability':
                content = generateSustainabilityContent();
                break;
            default:
                content = '<p>Report not available</p>';
        }

        tempDiv.innerHTML = content;
        return tempDiv;
    };

    const generateIncomeStatementContent = () => {
        const seasonDeliveries = currentSeason ? deliveries.filter(d => d.season_id === currentSeason.id) : deliveries;
        const seasonExpenses = currentSeason ? expenses.filter(e => e.season_id === currentSeason.id) : expenses;
        const seasonLabor = currentSeason ? laborCosts.filter(l => l.season_id === currentSeason.id) : laborCosts;

        const totalRevenue = seasonDeliveries.reduce((sum, d) => sum + parseFloat(d.totalAmount || 0), 0);
        const totalExpenses = seasonExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        const totalLabor = seasonLabor.reduce((sum, l) => sum + parseFloat(l.total_amount || l.totalCost || 0), 0);
        const netIncome = totalRevenue - totalExpenses - totalLabor;

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
                    <td style="padding: 12px 8px; padding-left: 30px; border-bottom: 1px solid #ddd;">Cherry Purchases</td>
                    <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF ${totalRevenue.toLocaleString()}</td>
                </tr>
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                    <td style="padding: 12px 8px; border-bottom: 1px solid #ddd;">Gross Profit</td>
                    <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF 0</td>
                </tr>
                <tr>
                    <td style="padding: 12px 8px; padding-left: 30px; border-bottom: 1px solid #ddd;">Labor Costs</td>
                    <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF ${totalLabor.toLocaleString()}</td>
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
            if (!expensesByCategory[expense.category]) {
                expensesByCategory[expense.category] = {
                    category: expense.category,
                    total: 0,
                    count: 0,
                    items: []
                };
            }
            expensesByCategory[expense.category].total += parseFloat(expense.amount || 0);
            expensesByCategory[expense.category].count++;
            expensesByCategory[expense.category].items.push(expense);
        });

        const totalExpenses = Object.values(expensesByCategory).reduce((sum, cat) => sum + cat.total, 0);

        let tableRows = '';
        Object.values(expensesByCategory).forEach(category => {
            tableRows += `
                <tr>
                    <td style="padding: 10px 8px; border-bottom: 1px solid #ddd;">${category.category}</td>
                    <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #ddd;">${category.count}</td>
                    <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF ${category.total.toLocaleString()}</td>
                    <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF ${(category.total / category.count).toLocaleString()}</td>
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
                    ${tableRows}
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
        const seasonDeliveries = currentSeason ? deliveries.filter(d => d.season_id === currentSeason.id) : deliveries;
        const seasonExpenses = currentSeason ? expenses.filter(e => e.season_id === currentSeason.id) : expenses;
        const seasonLabor = currentSeason ? laborCosts.filter(l => l.season_id === currentSeason.id) : laborCosts;

        const cashInflows = seasonDeliveries.reduce((sum, d) => sum + parseFloat(d.totalAmount || 0), 0);
        const cashOutflows = seasonExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) + 
                              seasonLabor.reduce((sum, l) => sum + parseFloat(l.total_amount || l.totalCost || 0), 0);
        const netCashFlow = cashInflows - cashOutflows;

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

    const generateBudgetContent = () => {
        return `
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; color: #2c3e50; font-size: 28px; font-weight: bold;">Operational Budget</h1>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 16px;">2026A Season</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="border-bottom: 2px solid #e0e0e0; margin: 30px 0;"></div>
            
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f8f9fa; font-weight: bold;">
                        <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd;">Category</th>
                        <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Budgeted</th>
                        <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Actual</th>
                        <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Variance</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 10px 8px; border-bottom: 1px solid #ddd;">Cherry Purchases</td>
                        <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF 50,000,000</td>
                        <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF 45,000,000</td>
                        <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #ddd; color: #28a745;">RWF 5,000,000</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 8px; border-bottom: 1px solid #ddd;">Labor Costs</td>
                        <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF 15,000,000</td>
                        <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF 16,500,000</td>
                        <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #ddd; color: #dc3545;">(RWF 1,500,000)</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 8px; border-bottom: 1px solid #ddd;">Operating Expenses</td>
                        <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF 10,000,000</td>
                        <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #ddd;">RWF 9,200,000</td>
                        <td style="padding: 10px 8px; text-align: right; border-bottom: 1px solid #ddd; color: #28a745;">RWF 800,000</td>
                    </tr>
                    <tr style="background-color: #e9ecef; font-weight: bold; font-size: 16px;">
                        <td style="padding: 15px 8px;">Total</td>
                        <td style="padding: 15px 8px; text-align: right;">RWF 75,000,000</td>
                        <td style="padding: 15px 8px; text-align: right;">RWF 70,700,000</td>
                        <td style="padding: 15px 8px; text-align: right; color: #28a745;">RWF 4,300,000</td>
                    </tr>
                </tbody>
            </table>
        `;
    };

    const generateAuditLogContent = () => {
        return `
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; color: #2c3e50; font-size: 28px; font-weight: bold;">Audit Log Summary</h1>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 16px;">Q1 2026</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="border-bottom: 2px solid #e0e0e0; margin: 30px 0;"></div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin-bottom: 10px;">Activity Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Activities:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">1,247</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>User Actions:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">892</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>System Actions:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">355</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Active Users:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">12</td>
                    </tr>
                </table>
            </div>
            
            <h3 style="color: #2c3e50; margin-bottom: 10px;">Top Activities by Type</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f8f9fa; font-weight: bold;">
                        <th style="padding: 10px 8px; text-align: left; border-bottom: 2px solid #ddd;">Activity Type</th>
                        <th style="padding: 10px 8px; text-align: right; border-bottom: 2px solid #ddd;">Count</th>
                        <th style="padding: 10px 8px; text-align: right; border-bottom: 2px solid #ddd;">Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">CREATE</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">423</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">33.9%</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">UPDATE</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">356</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">28.5%</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">DELETE</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">113</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">9.1%</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">LOGIN</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">355</td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">28.5%</td>
                    </tr>
                </tbody>
            </table>
        `;
    };

    const generateSustainabilityContent = () => {
        return `
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; color: #2c3e50; font-size: 28px; font-weight: bold;">Sustainability Impact Report</h1>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 16px;">2025-2026 Season</p>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="border-bottom: 2px solid #e0e0e0; margin: 30px 0;"></div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin-bottom: 10px;">Environmental Impact</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Coffee Processed:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">125,000 kg</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Water Usage:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">375,000 liters</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Water Efficiency:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">3.0 L/kg</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Carbon Footprint:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">2.1 kg CO2e/kg</td>
                    </tr>
                </table>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin-bottom: 10px;">Social Impact</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Farmers Supported:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">247</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Average Price Premium:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">15% above market</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Labor Hours Created:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">18,500</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Training Programs:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">12 sessions</td>
                    </tr>
                </table>
            </div>
            
            <div>
                <h3 style="color: #2c3e50; margin-bottom: 10px;">Quality Metrics</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Average Quality Score:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">85.2%</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Premium Grade Output:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">67%</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Certification Status:</strong></td>
                        <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Fair Trade, Organic</td>
                    </tr>
                </table>
            </div>
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

    return (
        <div className="reports-page">
            <div className="page-header">
                <h1 className="page-title">Financial Reports</h1>
                <p className="page-description">Generate and download financial statements of your Coffee Washing Station</p>
            </div>

            <div className="reports-grid">
                {reports.map((report) => (
                    <div key={report.id} className={`report-card card-accent-${report.accent}`}>
                        <div className="report-main-content">
                            <div className="report-content-wrapper">
                                <div className={`report-icon-wrapper icon-bg-${report.iconBg}`}>
                                    {/* Simple Document Icon */}
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
                                        Uploaded by: {report.uploadedBy}
                                    </div>
                                </div>
                            </div>

                            <div className="report-actions">
                                <span className="report-time">Time: {report.timeAgo}</span>
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
