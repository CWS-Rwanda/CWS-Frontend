import React, { useState, useEffect } from 'react';
import './PricingConfig.css';
import { pricingAPI } from '../../services/pricingAPI';
import priceImage from '../../assets/price-image.png';

const PricingConfig = () => {
    const [currentPricing, setCurrentPricing] = useState(null);
    const [priceHistory, setPriceHistory] = useState([]);
    const [newPrice, setNewPrice] = useState('');
    const [newSeason, setNewSeason] = useState('');
    const [effectiveDate, setEffectiveDate] = useState('');
    const [loading, setLoading] = useState(false);

    // Load current pricing and history
    useEffect(() => {
        const loadPricingData = async () => {
            try {
                // Load current pricing
                const currentRes = await pricingAPI.getCurrent();
                if (currentRes.data.success) {
                    setCurrentPricing(currentRes.data.data);
                    setNewPrice(currentRes.data.data.unit_price.toString());
                    
                    // Auto-set season if available
                    if (currentRes.data.data.season_name) {
                        setNewSeason(currentRes.data.data.season_name);
                    }
                }

                // Load pricing history
                const historyRes = await pricingAPI.getHistory();
                if (historyRes.data.success) {
                    setPriceHistory(historyRes.data.data);
                }
            } catch (error) {
                console.error('Error loading pricing data:', error);
            }
        };

        loadPricingData();
    }, []);

    const handleUpdatePrice = async (e) => {
        e.preventDefault();

        if (!newPrice || !newSeason) {
            alert('Please enter both price and season name');
            return;
        }

        setLoading(true);
        try {
            await pricingAPI.create({
                season_name: newSeason,
                unit_price: parseFloat(newPrice),
                effective_date: effectiveDate || new Date().toISOString().split('T')[0]
            });

            // Refresh data
            const currentRes = await pricingAPI.getCurrent();
            if (currentRes.data.success) {
                setCurrentPricing(currentRes.data.data);
            }

            const historyRes = await pricingAPI.getHistory();
            if (historyRes.data.success) {
                setPriceHistory(historyRes.data.data);
            }

            // Reset form
            setNewPrice('');
            setNewSeason('');
            setEffectiveDate('');

            alert(`Price updated to RWF ${newPrice} per kg for season ${newSeason}`);
        } catch (error) {
            console.error('Error updating price:', error);
            alert('Failed to update price');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    return (
        <div className="pricing-config">
            <div className="page-header">
                <h1 className="page-title">Pricing Configuration</h1>
                <p className="page-description">Manage coffee pricing by season and update current season prices</p>
            </div>

            <div className="pricing-layout">
                {/* Row 1: Cards */}
                <div className="pricing-cards-row">
                    {/* Current Price and Input */}
                    <div className="pricing-card">
                        <h3>Current Price</h3>
                        <form onSubmit={handleUpdatePrice}>
                            <label className="unit-label">Season Name</label>
                            <div className="price-input-container">
                                <input
                                    type="text"
                                    className="price-input"
                                    value={newSeason}
                                    onChange={(e) => setNewSeason(e.target.value)}
                                    placeholder={currentPricing?.season_name || "e.g., 2025A"}
                                />
                            </div>
                            <label className="unit-label">Unit Price RWF/Kg</label>
                            <div className="price-input-container">
                                <input
                                    type="number"
                                    className="price-input"
                                    value={newPrice}
                                    onChange={(e) => setNewPrice(e.target.value)}
                                    placeholder={currentPricing?.unit_price || "350"}
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
