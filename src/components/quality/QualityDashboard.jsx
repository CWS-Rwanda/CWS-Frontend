import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import './QualityDashboard.css';

const QualityDashboard = () => {
    const { lots, qualityChecks } = useData();
    const [selectedLot, setSelectedLot] = useState('');
    const [cuppingScores, setCuppingScores] = useState([]);
    const [timeRange, setTimeRange] = useState('all');

    // Mock cupping scores data - in real app, this would come from API
    const mockCuppingScores = [
        {
            id: 'CUP001',
            lotId: 'LOT001',
            lotName: 'LOT001 - Washed A',
            date: '2025-04-20',
            cupperName: 'Jean Mugabo',
            totalScore: 86.5,
            qualityLevel: 'Excellent',
            scores: {
                fragranceAroma: 8.5,
                flavor: 8.75,
                aftertaste: 8.5,
                acidity: 8.75,
                body: 8.25,
                uniformity: 10,
                cleanliness: 10,
                sweetness: 9.5,
                overall: 8.5,
                defects: 0
            },
            moistureContent: 11.2,
            dryingDays: 15,
            notes: 'Bright acidity, citrus notes, clean finish'
        },
        {
            id: 'CUP002',
            lotId: 'LOT002',
            lotName: 'LOT002 - Washed A',
            date: '2025-04-22',
            cupperName: 'Marie Uwase',
            totalScore: 89.0,
            qualityLevel: 'Competition Level',
            scores: {
                fragranceAroma: 9.0,
                flavor: 9.25,
                aftertaste: 9.0,
                acidity: 9.0,
                body: 8.75,
                uniformity: 10,
                cleanliness: 10,
                sweetness: 10,
                overall: 9.0,
                defects: 0
            },
            moistureContent: 10.8,
            dryingDays: 18,
            notes: 'Complex floral notes, excellent balance'
        },
        {
            id: 'CUP003',
            lotId: 'LOT003',
            lotName: 'LOT003 - Honey A',
            date: '2025-04-24',
            cupperName: 'Jean Mugabo',
            totalScore: 82.5,
            qualityLevel: 'Good Specialty',
            scores: {
                fragranceAroma: 8.0,
                flavor: 8.25,
                aftertaste: 8.0,
                acidity: 7.75,
                body: 8.5,
                uniformity: 10,
                cleanliness: 10,
                sweetness: 9.0,
                overall: 8.0,
                defects: 0
            },
            moistureContent: 11.8,
            dryingDays: 14,
            notes: 'Sweet, fruity profile with good body'
        }
    ];

    useEffect(() => {
        setCuppingScores(mockCuppingScores);
    }, []);

    const getQualityStats = () => {
        const scores = cuppingScores.map(score => score.totalScore);
        if (scores.length === 0) return null;

        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const highest = Math.max(...scores);
        const lowest = Math.min(...scores);

        const qualityDistribution = {
            competition: cuppingScores.filter(s => s.totalScore >= 89).length,
            excellent: cuppingScores.filter(s => s.totalScore >= 86 && s.totalScore < 89).length,
            good: cuppingScores.filter(s => s.totalScore >= 83 && s.totalScore < 86).length,
            commercial: cuppingScores.filter(s => s.totalScore >= 80 && s.totalScore < 83).length,
            below: cuppingScores.filter(s => s.totalScore < 80).length
        };

        return { average, highest, lowest, qualityDistribution, totalSamples: scores.length };
    };

    const getQualityColor = (score) => {
        if (score >= 89) return '#10b981';
        if (score >= 86) return '#3b82f6';
        if (score >= 83) return '#8b5cf6';
        if (score >= 80) return '#f59e0b';
        return '#ef4444';
    };

    const getQualityLevel = (score) => {
        if (score >= 89) return 'Competition';
        if (score >= 86) return 'Excellent';
        if (score >= 83) return 'Good';
        if (score >= 80) return 'Commercial';
        return 'Below Specialty';
    };

    const stats = getQualityStats();

    const filteredScores = selectedLot 
        ? cuppingScores.filter(score => score.lotId === selectedLot)
        : cuppingScores;

    return (
        <div className="quality-dashboard">
            <div className="dashboard-header">
                <h1>Quality Score Dashboard</h1>
                <p>Track and analyze coffee quality through SCA cupping scores</p>
            </div>

            {/* Summary Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.average.toFixed(1)}</div>
                        <div className="stat-label">Average Score</div>
                        <div className="stat-indicator" style={{ backgroundColor: getQualityColor(stats.average) }}></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.highest.toFixed(1)}</div>
                        <div className="stat-label">Highest Score</div>
                        <div className="stat-indicator" style={{ backgroundColor: getQualityColor(stats.highest) }}></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.lowest.toFixed(1)}</div>
                        <div className="stat-label">Lowest Score</div>
                        <div className="stat-indicator" style={{ backgroundColor: getQualityColor(stats.lowest) }}></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.totalSamples}</div>
                        <div className="stat-label">Total Samples</div>
                        <div className="stat-indicator" style={{ backgroundColor: '#6b7280' }}></div>
                    </div>
                </div>
            )}

            {/* Quality Distribution Chart */}
            {stats && (
                <div className="chart-card">
                    <h3>Quality Distribution</h3>
                    <div className="distribution-chart">
                        {Object.entries(stats.qualityDistribution).map(([level, count]) => {
                            const percentage = stats.totalSamples > 0 ? (count / stats.totalSamples) * 100 : 0;
                            const colors = {
                                competition: '#10b981',
                                excellent: '#3b82f6',
                                good: '#8b5cf6',
                                commercial: '#f59e0b',
                                below: '#ef4444'
                            };
                            
                            return (
                                <div key={level} className="distribution-item">
                                    <div className="distribution-bar">
                                        <div 
                                            className="distribution-fill" 
                                            style={{ 
                                                width: `${percentage}%`,
                                                backgroundColor: colors[level]
                                            }}
                                        ></div>
                                    </div>
                                    <div className="distribution-label">
                                        <span className="label-text">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                                        <span className="label-count">{count} ({percentage.toFixed(0)}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-group">
                    <label>Filter by Lot:</label>
                    <select 
                        value={selectedLot} 
                        onChange={(e) => setSelectedLot(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Lots</option>
                        {lots && lots.map(lot => (
                            <option key={lot.id} value={lot.id}>
                                {lot.lotName || lot.id}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Cupping Scores Table */}
            <div className="scores-table-card">
                <h3>Cupping Scores {selectedLot && `(Lot: ${selectedLot})`}</h3>
                <div className="table-container">
                    <table className="scores-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Lot</th>
                                <th>Cupper</th>
                                <th>Total Score</th>
                                <th>Quality Level</th>
                                <th>Moisture %</th>
                                <th>Drying Days</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredScores.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="no-data">No cupping scores found</td>
                                </tr>
                            ) : (
                                filteredScores.map(score => (
                                    <tr key={score.id}>
                                        <td>{score.date}</td>
                                        <td className="lot-cell">
                                            <div className="lot-info">
                                                <strong>{score.lotName}</strong>
                                            </div>
                                        </td>
                                        <td>{score.cupperName}</td>
                                        <td className="score-cell">
                                            <div 
                                                className="score-badge" 
                                                style={{ backgroundColor: getQualityColor(score.totalScore) }}
                                            >
                                                {score.totalScore.toFixed(1)}
                                            </div>
                                        </td>
                                        <td>
                                            <span 
                                                className="quality-badge"
                                                style={{ backgroundColor: getQualityColor(score.totalScore) }}
                                            >
                                                {getQualityLevel(score.totalScore)}
                                            </span>
                                        </td>
                                        <td>{score.moistureContent}%</td>
                                        <td>{score.dryingDays}</td>
                                        <td className="notes-cell">
                                            <div className="notes-text">{score.notes}</div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed Score Breakdown */}
            {filteredScores.length > 0 && (
                <div className="detailed-scores-card">
                    <h3>Detailed Score Breakdown</h3>
                    <div className="scores-grid">
                        {filteredScores.map(score => (
                            <div key={score.id} className="score-detail-card">
                                <div className="score-detail-header">
                                    <h4>{score.lotName}</h4>
                                    <div 
                                        className="total-score-circle"
                                        style={{ backgroundColor: getQualityColor(score.totalScore) }}
                                    >
                                        {score.totalScore.toFixed(1)}
                                    </div>
                                </div>
                                <div className="criteria-scores">
                                    {Object.entries(score.scores).map(([criterion, value]) => {
                                        const criterionNames = {
                                            fragranceAroma: 'Fragrance/Aroma',
                                            flavor: 'Flavor',
                                            aftertaste: 'Aftertaste',
                                            acidity: 'Acidity',
                                            body: 'Body',
                                            uniformity: 'Uniformity',
                                            cleanliness: 'Cleanliness',
                                            sweetness: 'Sweetness',
                                            overall: 'Overall',
                                            defects: 'Defects'
                                        };
                                        
                                        return (
                                            <div key={criterion} className="criterion-score">
                                                <span className="criterion-name">{criterionNames[criterion]}</span>
                                                <div className="score-bar">
                                                    <div 
                                                        className="score-fill"
                                                        style={{ 
                                                            width: `${criterion === 'defects' ? 0 : (value / 10) * 100}%`,
                                                            backgroundColor: criterion === 'defects' ? '#ef4444' : getQualityColor(value * 10)
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="criterion-value">
                                                    {criterion === 'defects' ? `-${value * 2}` : value}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QualityDashboard;
