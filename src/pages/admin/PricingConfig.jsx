import React, { useState } from 'react';
import './PricingConfig.css';
import priceImage from '../../assets/price-image.png';

const PricingConfig = () => {
    const [unitPrice, setUnitPrice] = useState(350);

    // Mock data for the chart and table matching the design
    const priceHistory = [
        { season: '2024A', price: 320, created: '2025-04-15' },
        { season: '2025B', price: 350, created: '2025-04-15' },
        { season: '2026A', price: 410, created: '2025-04-15' },
        { season: '2025B', price: 415, created: '2025-04-15' },
        { season: '2026B', price: 450, created: '2025-04-15' },
    ];

    const chartData = [
        { label: '2024A', value: 320, x: 0, y: 320 },
        { label: '2025B', value: 410, x: 33, y: 410 },
        { label: '2026A', value: 410, x: 66, y: 410 },
        { label: '2026B', value: 450, x: 100, y: 450 },
    ];

    const handleUpdatePrice = (e) => {
        e.preventDefault();
        alert(`Price updated to RWF ${unitPrice} per kg`);
    };

    return (
        <div className="pricing-config">
            <div className="page-header">
                <h1 className="page-title">Pricing Configuration</h1>
                <p className="page-description">See history of coffee price per season and update price in current season</p>
            </div>

            <div className="pricing-layout">
                {/* Row 1: Cards */}
                <div className="pricing-cards-row">
                    {/* Current Price and Input */}
                    <div className="pricing-card">
                        <h3>Current Price</h3>
                        <form onSubmit={handleUpdatePrice}>
                            <label className="unit-label">Unit Price RWF/Kg</label>
                            <div className="price-input-container">
                                <input
                                    type="number"
                                    className="price-input"
                                    value={unitPrice}
                                    onChange={(e) => setUnitPrice(e.target.value)}
                                    placeholder="350"
                                />
                            </div>
                            <button type="submit" className="btn-update-price">
                                Update
                            </button>
                        </form>
                    </div>

                    {/* Chart Card */}
                    <div className="pricing-card">
                        <h4 className="chart-title">Change of Price Per Season</h4>
                        <div className="chart-container">
                            {/* SVG Line Chart */}
                            <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="none">
                                {/* Grid Lines */}
                                <line x1="0" y1="50" x2="300" y2="50" stroke="#f3f4f6" strokeWidth="1" />
                                <line x1="0" y1="100" x2="300" y2="100" stroke="#f3f4f6" strokeWidth="1" />
                                <line x1="0" y1="150" x2="300" y2="150" stroke="#f3f4f6" strokeWidth="1" />

                                {/* Line Path - Approximated based on data */}
                                <path
                                    d="M 10 93 L 100 63 L 190 63 L 290 50"
                                    fill="none"
                                    stroke="#8B5CF6"
                                    strokeWidth="2"
                                />

                                {/* Dots */}
                                <circle cx="10" cy="93" r="3" fill="#8B5CF6" />
                                <circle cx="100" cy="63" r="3" fill="#8B5CF6" />
                                <circle cx="190" cy="63" r="3" fill="#8B5CF6" />
                                <circle cx="290" cy="50" r="3" fill="#8B5CF6" />
                            </svg>

                            {/* Labels - absolutely positioned over SVG */}
                            <div className="chart-y-axis">
                                <span>600</span>
                                <span>400</span>
                                <span>200</span>
                                <span>0</span>
                            </div>
                            <div className="chart-x-axis">
                                <span>2024A</span>
                                <span>2025B</span>
                                <span>2026A</span>
                                <span>2026B</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: History and Image */}
                <div className="pricing-bottom-row">
                    {/* Price History Table */}
                    <div className="history-section">
                        <h3 className="section-title">Price History</h3>
                        <table className="price-history-table">
                            <thead>
                                <tr>
                                    <th className="col-season">SEASON</th>
                                    <th>PRICE (RWF/KG)</th>
                                    <th className="col-created">CREATED</th>
                                </tr>
                            </thead>
                            <tbody>
                                {priceHistory.map((item, index) => (
                                    <tr key={index}>
                                        <td className="col-season">{item.season}</td>
                                        <td>{item.price}</td>
                                        <td className="col-created">{item.created}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pricing-visuals">
                        <img src={priceImage} alt="Pricing Illustration" className="pricing-illustration" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingConfig;
