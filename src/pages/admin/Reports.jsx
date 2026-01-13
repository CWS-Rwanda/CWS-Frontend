import React from 'react';
import { useData } from '../../context/DataContext';
import './Reports.css';

const Reports = () => {
    const { seasons } = useData();
    const currentSeason = seasons.find(s => s.status === 'active') || { name: '2025A' };

    // Mock reports data matching the design
    const reports = [
        {
            id: 1,
            title: `Income Statement - ${currentSeason.name}`,
            type: 'Income Statement',
            uploadedBy: 'Furaha Divin',
            timeAgo: '2 days ago',
            accent: 'brown',
            iconBg: 'brown',
            iconColor: 'brown'
        },
        {
            id: 2,
            title: `Expense Report - ${currentSeason.name}`,
            type: 'Expense Report',
            uploadedBy: 'Nshuti Angelo',
            timeAgo: '5 days ago',
            accent: 'purple',
            iconBg: 'purple',
            iconColor: 'purple'
        },
        {
            id: 3,
            title: `Cash Flow Statement - ${currentSeason.name}`,
            type: 'Cash Flow Statement',
            uploadedBy: 'Nshuti Christian',
            timeAgo: '12 days ago',
            accent: 'orange', // #F59E0B
            iconBg: 'orange',
            iconColor: 'orange'
        },
        {
            id: 4,
            title: `Operational Budget - 2026A`,
            type: 'Budget',
            uploadedBy: 'Keza Marie',
            timeAgo: '2 weeks ago',
            accent: 'green',
            iconBg: 'green',
            iconColor: 'green'
        },
        {
            id: 5,
            title: `Audit Log Summary - Q1`,
            type: 'Audit',
            uploadedBy: 'System Admin',
            timeAgo: '3 weeks ago',
            accent: 'blue',
            iconBg: 'blue',
            iconColor: 'blue'
        },
        {
            id: 6,
            title: `Sustainability Impact Report`,
            type: 'Sustainability',
            uploadedBy: 'Gasana Jean',
            timeAgo: '1 month ago',
            accent: 'teal',
            iconBg: 'teal',
            iconColor: 'teal'
        }
    ];

    const handleDownload = (reportTitle) => {
        alert(`Downloading ${reportTitle}...`);
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
                                    onClick={() => handleDownload(report.title)}
                                >
                                    Download PDF
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
