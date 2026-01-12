import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

const PricingConfig = () => {
    const { seasons } = useData();
    const [unitPrice, setUnitPrice] = useState(350);
    const [priceHistory] = useState([
        { season: '2024A', price: 320, effectiveDate: '2024-03-01' },
        { season: '2024B', price: 340, effectiveDate: '2024-09-01' },
        { season: '2025A', price: 350, effectiveDate: '2025-03-01' },
    ]);

    const handleUpdatePrice = (e) => {
        e.preventDefault();
        alert(`Price updated to RWF ${unitPrice} per kg`);
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Pricing Configuration</h1>
                <p className="page-description">Manage cherry purchase prices</p>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Current Price</h2>
                </div>

                <form onSubmit={handleUpdatePrice}>
                    <div className="form-group">
                        <label className="form-label required">Unit Price (RWF/kg)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={unitPrice}
                            onChange={(e) => setUnitPrice(e.target.value)}
                            style={{ maxWidth: '300px' }}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Update Price
                    </button>
                </form>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Price History</h2>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Season</th>
                                <th>Price (RWF/kg)</th>
                                <th>Effective Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {priceHistory.map((item, index) => (
                                <tr key={index}>
                                    <td><strong>{item.season}</strong></td>
                                    <td><strong>RWF {item.price}</strong></td>
                                    <td>{item.effectiveDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PricingConfig;
