import React from 'react';
import { useData } from '../../context/DataContext';

const AssetManagement = () => {
    const { assets } = useData();

    const totalAssetValue = assets.reduce((sum, a) => sum + a.currentValue, 0);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Asset Management</h1>
                <p className="page-description">Track assets and depreciation</p>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="stat-card">
                    <div className="stat-label">Total Asset Value</div>
                    <div className="stat-value">RWF {totalAssetValue.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Number of Assets</div>
                    <div className="stat-value">{assets.length}</div>
                </div>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">All Assets</h2>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Asset Name</th>
                                <th>Category</th>
                                <th>Purchase Date</th>
                                <th>Purchase Value</th>
                                <th>Depreciation Period</th>
                                <th>Current Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.map(asset => (
                                <tr key={asset.id}>
                                    <td><strong>{asset.name}</strong></td>
                                    <td>
                                        <span className="badge badge-info">{asset.category}</span>
                                    </td>
                                    <td>{asset.purchaseDate}</td>
                                    <td>RWF {asset.purchaseValue.toLocaleString()}</td>
                                    <td>{asset.depreciationYears} years</td>
                                    <td><strong>RWF {asset.currentValue.toLocaleString()}</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AssetManagement;
