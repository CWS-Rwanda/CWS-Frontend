import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import Modal from '../../components/common/Modal';
import './SeasonManagement.css';

// Mock season data matching the design
const mockSeasons = [
    { id: 'S001', name: '2024A', startDate: '2025-04-15', endDate: '2025-04-15', status: 'closed', revenue: 4200000 },
    { id: 'S002', name: '2025B', startDate: '2025-04-15', endDate: '2025-04-15', status: 'closed', revenue: 6100000 },
    { id: 'S003', name: '2023A', startDate: '2025-04-15', endDate: '2025-04-15', status: 'closed', revenue: 5300000 },
    { id: 'S004', name: '2023B', startDate: '2025-04-15', endDate: '2025-04-15', status: 'closed', revenue: 7800000 },
    { id: 'S005', name: '2024A', startDate: '2025-04-15', endDate: '2025-04-15', status: 'closed', revenue: 8500000 },
    { id: 'S006', name: '2024B', startDate: '2025-04-15', endDate: '2025-04-15', status: 'closed', revenue: 10200000 },
    { id: 'S007', name: '2025A', startDate: '2025-04-15', endDate: '2025-04-15', status: 'closed', revenue: 1530000 },
    { id: 'S008', name: '2025B', startDate: '2025-04-15', endDate: '2025-04-15', status: 'closed', revenue: 6900000 },
    { id: 'S009', name: '2026A', startDate: '2025-04-15', endDate: '2025-04-15', status: 'active', revenue: 0 },
    { id: 'S010', name: '2026B', startDate: '2025-04-15', endDate: '2025-04-15', status: 'closed', revenue: 0 },
    { id: 'S011', name: '2027B', startDate: '2025-04-15', endDate: '2025-04-15', status: 'closed', revenue: 0 },
];

const SeasonManagement = () => {
    const { seasons, setSeasons } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [editingSeason, setEditingSeason] = useState(null);
    const [hoveredBar, setHoveredBar] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: ''
    });
    const [updateFormData, setUpdateFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        status: 'inactive'
    });

    // Combine mock and actual seasons
    const displaySeasons = useMemo(() => {
        return [...mockSeasons, ...seasons];
    }, [seasons]);

    // Prepare chart data
    const chartData = useMemo(() => {
        return displaySeasons
            .filter(s => s.revenue > 0)
            .sort((a, b) => {
                // Sort by season name (year + letter)
                const aYear = parseInt(a.name.substring(0, 4));
                const bYear = parseInt(b.name.substring(0, 4));
                if (aYear !== bYear) return aYear - bYear;
                return a.name.localeCompare(b.name);
            });
    }, [displaySeasons]);

    const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);
    // Figma dimensions: 1036x511, proportional scaling
    const chartWidth = 1036;
    const chartHeight = 511;
    const barWidth = 80;
    const spacing = 40;

    const handleSubmit = (e) => {
        e.preventDefault();
        const newSeason = {
            id: `S${String(seasons.length + mockSeasons.length + 1).padStart(3, '0')}`,
            ...formData,
            status: 'inactive',
            revenue: 0
        };
        setSeasons([...seasons, newSeason]);
        setIsModalOpen(false);
        setFormData({ name: '', startDate: '', endDate: '' });
    };

    const handleUpdateClick = (season) => {
        setEditingSeason(season);
        setUpdateFormData({
            name: season.name,
            startDate: season.startDate,
            endDate: season.endDate,
            status: season.status
        });
        setIsUpdateModalOpen(true);
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        if (editingSeason) {
            const updatedSeasons = seasons.map(s => 
                s.id === editingSeason.id ? { ...s, ...updateFormData } : s
            );
            setSeasons(updatedSeasons);
        }
        setIsUpdateModalOpen(false);
        setEditingSeason(null);
    };

    const getStatusColor = (status) => {
        return status === 'active' ? '#10B981' : '#EF4444';
    };

    const getBarColor = (index) => {
        const colors = ['#9B59B6', '#FF6B6B', '#3498DB', '#FF9800', '#3498DB', '#10B981', '#9B59B6', '#3498DB'];
        return colors[index % colors.length];
    };

    return (
        <div className="season-management">
            <div className="page-header">
                <h1 className="page-title">Season Management</h1>
                <p className="page-description">Manage coffee harvesting season</p>
            </div>

            <div className="chart-card">
                <h3 className="chart-title">Revenue Per Season</h3>
                <div className="bar-chart-container">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 60}`} className="bar-chart" preserveAspectRatio="xMidYMid meet">
                        {/* Y-axis label */}
                        <text x="20" y={chartHeight / 2} fontSize="12" fill="#666" transform={`rotate(-90, 20, ${chartHeight / 2})`} textAnchor="middle">
                            Revenue/RWF
                        </text>

                        {/* Y-axis values */}
                        {[0, 2, 4, 6, 8, 10, 12].map((val) => {
                            const y = chartHeight - (val / 12) * chartHeight;
                            return (
                                <g key={val}>
                                    <line x1="50" y1={y} x2={chartWidth - 20} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
                                    <text x="45" y={y + 4} fontSize="10" fill="#666" textAnchor="end">
                                        {val}M
                                    </text>
                                </g>
                            );
                        })}

                        {/* Bars */}
                        {chartData.map((season, index) => {
                            const barHeight = (season.revenue / maxRevenue) * chartHeight;
                            const x = 60 + index * (barWidth + spacing);
                            const y = chartHeight - barHeight;
                            const color = getBarColor(index);

                            return (
                                <g key={season.id}>
                                    <rect
                                        x={x}
                                        y={y}
                                        width={barWidth}
                                        height={barHeight}
                                        fill={color}
                                        rx="4"
                                        style={{ cursor: 'pointer' }}
                                        onMouseEnter={(e) => {
                                            const container = e.currentTarget.closest('.bar-chart-container');
                                            const containerRect = container.getBoundingClientRect();
                                            const svgRect = e.currentTarget.closest('svg').getBoundingClientRect();
                                            const scaleX = containerRect.width / chartWidth;
                                            const scaleY = containerRect.height / (chartHeight + 60);
                                            setHoveredBar({
                                                name: season.name,
                                                revenue: season.revenue
                                            });
                                            setTooltipPosition({
                                                x: (x + barWidth / 2) * scaleX,
                                                y: y * scaleY - 10
                                            });
                                        }}
                                        onMouseLeave={() => setHoveredBar(null)}
                                    />
                                    <text
                                        x={x + barWidth / 2}
                                        y={y - 5}
                                        fontSize="10"
                                        fill="#666"
                                        textAnchor="middle"
                                    >
                                        {(season.revenue / 1000000).toFixed(1)}M
                                    </text>
                                    <text
                                        x={x + barWidth / 2}
                                        y={chartHeight + 20}
                                        fontSize="10"
                                        fill="#666"
                                        textAnchor="middle"
                                    >
                                        {season.name}
                                    </text>
                                </g>
                            );
                        })}

                        {/* X-axis label */}
                        <text x={chartWidth / 2} y={chartHeight + 50} fontSize="12" fill="#666" textAnchor="middle">
                            Seasons
                        </text>
                    </svg>
                    {hoveredBar && (
                        <div
                            className="chart-tooltip"
                            style={{
                                left: `${tooltipPosition.x}px`,
                                top: `${tooltipPosition.y}px`,
                            }}
                        >
                            <div className="tooltip-content">
                                <div className="tooltip-label">{hoveredBar.name}</div>
                                <div className="tooltip-value">{hoveredBar.revenue.toLocaleString()} RWF</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="content-card">
                <div className="card-header-section">
                    <h2 className="section-title">All Seasons</h2>
                    <button onClick={() => setIsModalOpen(true)} className="btn-add-season">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Season
                    </button>
                </div>

                <div className="table-container">
                    <table className="seasons-table">
                        <thead>
                            <tr>
                                <th>SEASON NAME</th>
                                <th>START DATE</th>
                                <th>END DATE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displaySeasons.map(season => (
                                <tr key={season.id}>
                                    <td>
                                        <span className="season-name-link">{season.name}</span>
                                    </td>
                                    <td>{season.startDate}</td>
                                    <td>{season.endDate}</td>
                                    <td>
                                        <span
                                            className={`badge ${season.status === 'active' ? 'badge-status-active' : 'badge-status-closed'}`}
                                        >
                                            {season.status === 'active' ? 'Active' : 'Closed'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-update"
                                            onClick={() => handleUpdateClick(season)}
                                        >
                                            Update
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Season">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Season Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., 2025B"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Start Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">End Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary">Create Season</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} title="Update Season">
                <form onSubmit={handleUpdateSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Season Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={updateFormData.name}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Start Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={updateFormData.startDate}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, startDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">End Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={updateFormData.endDate}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, endDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Status</label>
                        <select
                            className="form-select"
                            value={updateFormData.status}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, status: e.target.value })}
                            required
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary">Update Season</button>
                        <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="btn btn-outline">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SeasonManagement;
