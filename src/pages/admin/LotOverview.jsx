import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import './LotOverview.css';
import lotCoffeeImage from '../../assets/Lot-Coffee.png';

const LotOverview = () => {
    const { lots } = useData();
    // Use real data where available, otherwise mock for the design structure
    const totalLots = 128; // From design
    const avgQualityScore = "87%"; // From design

    // Mock chart data for "Lot Status Overview"
    const lotStatusData = [
        { label: 'COMPLETED', value: 3, width: '30%' },
        { label: 'IN PROCESS', value: 6, width: '60%' },
        { label: 'CREATED', value: 3, width: '30%' },
    ];

    // Design matches: Lot ID, Created, Process Type, Grade, Status, Weight, Quality Score
    // Using filtered lots or all lots based on requirements. Design shows "All Lots" title.

    return (
        <div className="lot-overview">
            <div className="page-header">
                <h1 className="page-title">Lot Overview</h1>
                <p className="page-description">Global production monitoring of everything received from farmers</p>
            </div>

            <div className="lot-top-grid">
                <div className="lot-stat-card">
                    <div className="lot-stat-indicator indicator-brown"></div>
                    <div className="lot-stat-content">
                        <span className="lot-stat-label">Total Lots</span>
                        <h3 className="lot-stat-value text-brown">{totalLots}</h3>
                    </div>
                </div>
                <div className="lot-stat-card">
                    <div className="lot-stat-indicator indicator-green"></div>
                    <div className="lot-stat-content">
                        <span className="lot-stat-label">Average Quality Score</span>
                        <h3 className="lot-stat-value text-green">{avgQualityScore}</h3>
                    </div>
                </div>
            </div>

            <div className="lot-chart-section">
                <div className="lot-chart-card">
                    <h4 className="lot-chart-title">Lot Status Overview</h4>
                    <div className="lot-chart-container">
                        {lotStatusData.map((item, index) => (
                            <div key={index} className="lot-bar-row">
                                <span className="lot-bar-label">{item.label}</span>
                                <div className="lot-bar-wrapper">
                                    <div
                                        className="lot-bar"
                                        style={{ width: item.width }}
                                    >
                                        {item.value}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lot-illustration">
                    <img src={lotCoffeeImage} alt="Coffee Bean Character" className="lot-bean-image" />
                </div>
            </div>

            <div className="lot-list-card">
                <h2 className="lot-section-title">All Lots</h2>
                <div className="table-container">
                    <table className="lot-table">
                        <thead>
                            <tr>
                                <th>LOT ID</th>
                                <th>CREATED</th>
                                <th>PROCESS TYPE</th>
                                <th>GRADE</th>
                                <th>STATUS</th>
                                <th>WEIGHT (KG)</th>
                                <th>QUALITY SCORE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lots.map(lot => (
                                <tr key={lot.id}>
                                    <td><strong>{lot.id}</strong></td>
                                    <td>{lot.createdDate}</td>
                                    <td>
                                        <span className={`badge-pill ${lot.processingMethod === 'Washed' ? 'badge-washed' : 'badge-honey'
                                            }`}>
                                            {lot.processingMethod}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge-pill badge-grade-a">Grade {lot.grade}</span>
                                    </td>
                                    <td>
                                        <span className={`badge-pill ${lot.status === 'stored' ? 'badge-complete' : // Assuming stored/complete similar
                                            lot.status === 'created' ? 'badge-created' :
                                                'badge-progress'
                                            }`}>
                                            {lot.status === 'stored' ? 'Complete' :
                                                lot.status === 'created' ? 'Created' :
                                                    'Progress'}
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

export default LotOverview;
