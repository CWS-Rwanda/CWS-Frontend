import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { deliveries, lots, revenue, expenses, laborCosts } = useData();
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [hoveredPie, setHoveredPie] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [pieTooltipPosition, setPieTooltipPosition] = useState({ x: 0, y: 0 });

    // Calculate KPIs
    const totalRevenue = useMemo(() => {
        return revenue.reduce((sum, r) => sum + r.totalRevenue, 0);
    }, [revenue]);

    const totalExpenses = useMemo(() => {
        return expenses.reduce((sum, e) => sum + e.amount, 0);
    }, [expenses]);

    const totalLabor = useMemo(() => {
        return laborCosts.reduce((sum, l) => sum + l.totalCost, 0);
    }, [laborCosts]);

    const profitLoss = totalRevenue - totalExpenses - totalLabor;

    // Delivery pie chart data
    const deliveryData = useMemo(() => {
        const processTypes = lots.reduce((acc, lot) => {
            const type = lot.processingMethod || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        const total = Object.values(processTypes).reduce((sum, val) => sum + val, 0);
        return Object.entries(processTypes).map(([type, count]) => ({
            type,
            count,
            percentage: (count / total) * 100,
        }));
    }, [lots]);

    // Sales Analytics data (last 10 days)
    const salesData = useMemo(() => {
        const last10Days = [];
        const today = new Date();
        for (let i = 9; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Get revenue for this date
            const dayRevenue = revenue
                .filter(r => r.date === dateStr)
                .reduce((sum, r) => sum + r.totalRevenue, 0);
            
            last10Days.push({
                date: dateStr,
                revenue: dayRevenue || Math.floor(Math.random() * 200000) + 50000,
            });
        }
        return last10Days;
    }, [revenue]);

    const maxRevenue = Math.max(...salesData.map(d => d.revenue), 1);

    return (
        <div className="admin-dashboard">
            <div className="dashboard-kpis">
                <div className="kpi-card revenue-card">
                    <div className="kpi-bar revenue-bar"></div>
                    <div className="kpi-content">
                        <div className="kpi-label">Revenue</div>
                        <div className="kpi-value">{totalRevenue.toLocaleString()} RWF</div>
            </div>
                </div>

                <div className="kpi-card profit-card">
                    <div className="kpi-bar profit-bar"></div>
                    <div className="kpi-content">
                        <div className="kpi-label">Profit/ Loss</div>
                        <div className="kpi-value profit-value">
                            {profitLoss >= 0 ? '+' : ''}{profitLoss.toLocaleString()} RWF
                        </div>
                    </div>
                </div>
                </div>

            <div className="dashboard-charts">
                <div className="chart-card">
                    <h3 className="chart-title">Delivery</h3>
                    <div className="pie-chart-container">
                        <svg viewBox="0 0 200 200" className="pie-chart">
                            {(() => {
                                let currentAngle = -90;
                                return deliveryData.map((item, index) => {
                                    const colors = ['#FF6B6B', '#9B59B6', '#3498DB'];
                                    const color = colors[index % colors.length];
                                    const angle = (item.percentage / 100) * 360;
                                    const largeArc = angle > 180 ? 1 : 0;
                                    
                                    const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
                                    const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
                                    const x2 = 100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                                    const y2 = 100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
                                    
                                    const pathData = [
                                        `M 100 100`,
                                        `L ${x1} ${y1}`,
                                        `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
                                        `Z`,
                                    ].join(' ');
                                    
                                    const segmentAngle = currentAngle + angle / 2;
                                    currentAngle += angle;
                                    
                                    return (
                                        <g key={item.type}>
                                            <path
                                                d={pathData}
                                                fill={color}
                                                stroke="white"
                                                strokeWidth="2"
                                                style={{ cursor: 'pointer' }}
                                                onMouseEnter={(e) => {
                                                    const container = e.currentTarget.closest('.pie-chart-container');
                                                    const containerRect = container.getBoundingClientRect();
                                                    const tooltipAngle = segmentAngle * Math.PI / 180;
                                                    const radius = 70;
                                                    const tooltipX = 100 + radius * Math.cos(tooltipAngle);
                                                    const tooltipY = 100 + radius * Math.sin(tooltipAngle);
                                                    setHoveredPie({
                                                        type: item.type,
                                                        count: item.count,
                                                        percentage: item.percentage
                                                    });
                                                    setPieTooltipPosition({
                                                        x: (tooltipX / 200) * containerRect.width,
                                                        y: (tooltipY / 200) * containerRect.height
                                                    });
                                                }}
                                                onMouseLeave={() => setHoveredPie(null)}
                                            />
                                            <text
                                                x={100 + 50 * Math.cos((segmentAngle * Math.PI) / 180)}
                                                y={100 + 50 * Math.sin((segmentAngle * Math.PI) / 180)}
                                                textAnchor="middle"
                                                fontSize="12"
                                                fill="white"
                                                fontWeight="600"
                                            >
                                                {item.type.toUpperCase()}
                                            </text>
                                        </g>
                                    );
                                });
                            })()}
                        </svg>
                        {hoveredPie && (
                            <div
                                className="chart-tooltip pie-tooltip"
                                style={{
                                    left: `${pieTooltipPosition.x}px`,
                                    top: `${pieTooltipPosition.y}px`,
                                }}
                            >
                                <div className="tooltip-content">
                                    <div className="tooltip-label">{hoveredPie.type}</div>
                                    <div className="tooltip-value">Count: {hoveredPie.count}</div>
                                    <div className="tooltip-value">{hoveredPie.percentage.toFixed(1)}%</div>
                                </div>
                            </div>
                        )}
                        <div className="pie-legend">
                            {deliveryData.map((item, index) => {
                                const colors = ['#FF6B6B', '#9B59B6', '#3498DB'];
                                return (
                                    <div key={item.type} className="legend-item">
                                        <div
                                            className="legend-color"
                                            style={{ backgroundColor: colors[index % colors.length] }}
                                        ></div>
                                        <span className="legend-label">{item.type}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="chart-card">
                    <h3 className="chart-title">Sales Analytics</h3>
                    <div className="line-chart-container">
                        <svg viewBox="0 0 600 200" className="line-chart" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0" />
                                </linearGradient>
                                <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#3498DB" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#3498DB" stopOpacity="0" />
                                </linearGradient>
                                <linearGradient id="lineGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#9B59B6" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#9B59B6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            
                            {/* Y-axis labels */}
                            {[0, 50, 100, 150, 200].map((val) => (
                                <text
                                    key={val}
                                    x="10"
                                    y={190 - (val / 200) * 160}
                                    fontSize="10"
                                    fill="#666"
                                >
                                    {val}
                                </text>
                            ))}
                            
                            {/* X-axis labels */}
                            {salesData.map((item, index) => (
                                <text
                                    key={index}
                                    x={50 + (index * 55)}
                                    y="195"
                                    fontSize="9"
                                    fill="#666"
                                    textAnchor="middle"
                                >
                                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </text>
                            ))}
                            
                            {/* Generate 3 lines with different trends */}
                            {[
                                { color: '#FF6B6B', gradient: 'lineGradient1', offset: 0 },
                                { color: '#3498DB', gradient: 'lineGradient2', offset: 0.3 },
                                { color: '#9B59B6', gradient: 'lineGradient3', offset: 0.6 },
                            ].map((line, lineIndex) => {
                                const points = salesData.map((item, index) => {
                                    const x = 50 + (index * 55);
                                    const baseY = 190 - (item.revenue / maxRevenue) * 160;
                                    const y = baseY + (lineIndex * 20) - (line.offset * 40) + Math.sin(index) * 10;
                                    return { x, y, revenue: item.revenue, date: item.date };
                                });
                                
                                const pathData = points
                                    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
                                    .join(' ');
                                
                                const areaPath = `${pathData} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`;
                                
                                return (
                                    <g key={lineIndex}>
                                        <path
                                            d={areaPath}
                                            fill={`url(#${line.gradient})`}
                                        />
                                        <path
                                            d={pathData}
                                            fill="none"
                                            stroke={line.color}
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        {points.map((point, pointIndex) => (
                                            <g key={pointIndex}>
                                                <circle
                                                    cx={point.x}
                                                    cy={point.y}
                                                    r="6"
                                                    fill={line.color}
                                                    style={{ cursor: 'pointer' }}
                                                    onMouseEnter={(e) => {
                                                        const container = e.currentTarget.closest('.line-chart-container');
                                                        const containerRect = container.getBoundingClientRect();
                                                        const svg = e.currentTarget.closest('svg');
                                                        const svgRect = svg.getBoundingClientRect();
                                                        const svgViewBox = svg.viewBox.baseVal;
                                                        const scaleX = svgRect.width / svgViewBox.width;
                                                        const scaleY = svgRect.height / svgViewBox.height;
                                                        const offsetX = svgRect.left - containerRect.left;
                                                        const offsetY = svgRect.top - containerRect.top;
                                                        setHoveredPoint({
                                                            revenue: point.revenue,
                                                            date: point.date
                                                        });
                                                        let x = offsetX + (point.x * scaleX);
                                                        let y = offsetY + (point.y * scaleY);
                                                        x = Math.max(10, Math.min(containerRect.width - 10, x));
                                                        y = Math.max(40, Math.min(containerRect.height - 10, y));
                                                        setTooltipPosition({
                                                            x,
                                                            y
                                                        });
                                                    }}
                                                    onMouseLeave={() => setHoveredPoint(null)}
                                                />
                                                <circle
                                                    cx={point.x}
                                                    cy={point.y}
                                                    r="4"
                                                    fill="white"
                                                    style={{ pointerEvents: 'none' }}
                                                />
                                            </g>
                                        ))}
                                    </g>
                                );
                            })}
                        </svg>
                        <div className="chart-axes">
                            <div className="y-axis-label">Sales/RWF</div>
                            <div className="x-axis-label">Month</div>
                        </div>
                        {hoveredPoint && (
                            <div
                                className="chart-tooltip"
                                style={{
                                    left: `${tooltipPosition.x}px`,
                                    top: `${tooltipPosition.y}px`,
                                }}
                            >
                                <div className="tooltip-content">
                                    <div className="tooltip-date">{new Date(hoveredPoint.date).toLocaleDateString()}</div>
                                    <div className="tooltip-value">{hoveredPoint.revenue.toLocaleString()} RWF</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="dashboard-table">
                <h3 className="table-title">Recent Lots</h3>
                <div className="table-container">
                    <table className="lots-table">
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
                            {lots.slice(0, 5).map((lot) => {
                                const getStatusColor = (status) => {
                                    if (status === 'Complete' || status === 'complete') return 'status-complete';
                                    if (status === 'Progress' || status === 'progress') return 'status-progress';
                                    return 'status-created';
                                };
                                
                                const getProcessColor = (type) => {
                                    if (type === 'Washed') return 'process-washed';
                                    if (type === 'Honey') return 'process-honey';
                                    return 'process-natural';
                                };
                                
                                return (
                                <tr key={lot.id}>
                                    <td><strong>{lot.id}</strong></td>
                                    <td>{lot.createdDate}</td>
                                    <td>
                                            <span className={`badge ${getProcessColor(lot.processingMethod)}`}>
                                                {lot.processingMethod}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge-grade">Grade {lot.grade}</span>
                                    </td>
                                    <td>
                                            <span className={`badge ${getStatusColor(lot.status)}`}>
                                            {lot.status}
                                        </span>
                                    </td>
                                    <td>{lot.totalWeight}</td>
                                    <td>{lot.qualityScore}%</td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
