import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { seasonsAPI, revenuesAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import './SeasonManagement.css';

const SeasonManagement = () => {
    const { seasons, revenue, fetchSeasons, fetchRevenues, loading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [editingSeason, setEditingSeason] = useState(null);
    const [hoveredBar, setHoveredBar] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        active: true
    });
    const [updateFormData, setUpdateFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        active: false
    });

    // Load revenues on mount to calculate season revenue
    useEffect(() => {
        if (revenue.length === 0) {
            fetchRevenues();
        }
    }, []);

    // Transform backend season to frontend format
    const transformSeason = (season) => {
        // Calculate revenue for this season
        const seasonRevenue = revenue
            .filter(r => r.season_id === season.id)
            .reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);

        return {
            id: season.id,
            name: season.name,
            startDate: season.start_date ? new Date(season.start_date).toLocaleDateString() : 'Not set',
            endDate: season.end_date ? new Date(season.end_date).toLocaleDateString() : 'Not set',
            status: season.active ? 'active' : 'closed',
            active: season.active,
            revenue: seasonRevenue
        };
    };

    // Transform seasons with revenue calculations
    const displaySeasons = useMemo(() => {
        return seasons.map(transformSeason);
    }, [seasons, revenue]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // Validate dates
            if (new Date(formData.start_date) > new Date(formData.end_date)) {
                setError('End date must be after start date');
                setIsSubmitting(false);
                return;
            }

            await seasonsAPI.create({
                name: formData.name,
                start_date: formData.start_date,
                end_date: formData.end_date,
                active: formData.active
            });

            setIsModalOpen(false);
            setFormData({ name: '', start_date: '', end_date: '', active: true });
            await fetchSeasons();
        } catch (err) {
            console.error('Error creating season:', err);
            setError(err.message || 'Failed to create season. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateClick = (season) => {
        // Find the original season from backend format
        const originalSeason = seasons.find(s => s.id === season.id);
        if (!originalSeason) return;

        setEditingSeason(originalSeason);
        setUpdateFormData({
            name: originalSeason.name,
            start_date: originalSeason.start_date,
            end_date: originalSeason.end_date,
            active: originalSeason.active
        });
        setIsUpdateModalOpen(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!editingSeason) return;

        setError(null);
        setIsSubmitting(true);

        try {
            // Validate dates
            if (new Date(updateFormData.start_date) > new Date(updateFormData.end_date)) {
                setError('End date must be after start date');
                setIsSubmitting(false);
                return;
            }

            await seasonsAPI.update(editingSeason.id, {
                name: updateFormData.name,
                start_date: updateFormData.start_date,
                end_date: updateFormData.end_date,
                active: updateFormData.active
            });

            setIsUpdateModalOpen(false);
            setEditingSeason(null);
            await fetchSeasons();
        } catch (err) {
            console.error('Error updating season:', err);
            setError(err.message || 'Failed to update season. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeactivate = async (seasonId) => {
        if (!window.confirm('Are you sure you want to deactivate this season?')) {
            return;
        }

        try {
            await seasonsAPI.deactivate(seasonId);
            await fetchSeasons();
        } catch (err) {
            console.error('Error deactivating season:', err);
            alert(err.message || 'Failed to deactivate season. Please try again.');
        }
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
                    <button onClick={() => setIsModalOpen(true)} className="btn-add-season" disabled={isSubmitting}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Season
                    </button>
                </div>

                {loading.seasons ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading seasons...</div>
                ) : displaySeasons.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No seasons found. Create your first season to get started.</div>
                ) : (
                    <div className="table-container">
                        <table className="seasons-table">
                            <thead>
                                <tr>
                                    <th>SEASON NAME</th>
                                    <th>START DATE</th>
                                    <th>END DATE</th>
                                    <th>STATUS</th>
                                    <th>REVENUE</th>
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
                                        <td>RWF {season.revenue.toLocaleString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button 
                                                    className="btn-update"
                                                    onClick={() => handleUpdateClick(season)}
                                                    disabled={isSubmitting}
                                                >
                                                    Update
                                                </button>
                                                {season.active && (
                                                    <button 
                                                        className="btn btn-outline"
                                                        onClick={() => handleDeactivate(season.id)}
                                                        disabled={isSubmitting}
                                                        style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Season">
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}
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
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Start Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">End Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Active Status</label>
                        <select
                            className="form-select"
                            value={formData.active ? 'true' : 'false'}
                            onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                            disabled={isSubmitting}
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                        <small style={{ color: 'var(--color-gray-600)', fontSize: '0.875rem' }}>
                            Only one season should be active at a time
                        </small>
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Season'}
                        </button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" disabled={isSubmitting}>
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} title="Update Season">
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleUpdateSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Season Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={updateFormData.name}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, name: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Start Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={updateFormData.start_date}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, start_date: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">End Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={updateFormData.end_date}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, end_date: e.target.value })}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Active Status</label>
                        <select
                            className="form-select"
                            value={updateFormData.active ? 'true' : 'false'}
                            onChange={(e) => setUpdateFormData({ ...updateFormData, active: e.target.value === 'true' })}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                        <small style={{ color: 'var(--color-gray-600)', fontSize: '0.875rem' }}>
                            Only one season should be active at a time
                        </small>
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Update Season'}
                        </button>
                        <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="btn btn-outline" disabled={isSubmitting}>
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SeasonManagement;
