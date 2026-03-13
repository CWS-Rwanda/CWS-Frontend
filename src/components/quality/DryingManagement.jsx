import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import './DryingManagement.css';

const DryingManagement = () => {
    const { lots } = useData();
    const [dryingRecords, setDryingRecords] = useState([]);
    const [selectedLot, setSelectedLot] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        lotId: '',
        startDate: new Date().toISOString().split('T')[0],
        startTime: new Date().toTimeString().slice(0, 5),
        dryingMethod: 'raised_beds',
        initialMoisture: '',
        targetMoisture: '11.0',
        estimatedDays: '15',
        currentMoisture: '',
        turningFrequency: '30-60_min',
        weatherConditions: 'sunny',
        notes: ''
    });

    // Mock drying records - in real app, this would come from API
    const mockDryingRecords = [
        {
            id: 'DRY001',
            lotId: 'LOT001',
            lotName: 'LOT001 - Washed A',
            startDate: '2025-04-18',
            startTime: '08:00',
            dryingMethod: 'raised_beds',
            initialMoisture: 45.2,
            targetMoisture: 11.0,
            currentMoisture: 12.1,
            estimatedDays: 15,
            actualDays: 14,
            turningFrequency: '30-60_min',
            status: 'drying',
            weatherConditions: 'sunny',
            lastTurned: '2025-05-01 14:30',
            notes: 'Good drying progress, turning regularly',
            dailyReadings: [
                { date: '2025-04-18', moisture: 45.2, weather: 'sunny', turned: true },
                { date: '2025-04-19', moisture: 38.5, weather: 'partly_cloudy', turned: true },
                { date: '2025-04-20', moisture: 32.1, weather: 'sunny', turned: true },
                { date: '2025-04-21', moisture: 26.8, weather: 'cloudy', turned: true },
                { date: '2025-04-22', moisture: 21.5, weather: 'sunny', turned: true },
                { date: '2025-04-23', moisture: 17.2, weather: 'sunny', turned: true },
                { date: '2025-04-24', moisture: 14.1, weather: 'partly_cloudy', turned: true },
                { date: '2025-04-25', moisture: 12.8, weather: 'cloudy', turned: true },
                { date: '2025-04-26', moisture: 12.1, weather: 'sunny', turned: true }
            ]
        },
        {
            id: 'DRY002',
            lotId: 'LOT002',
            lotName: 'LOT002 - Washed A',
            startDate: '2025-04-20',
            startTime: '09:30',
            dryingMethod: 'raised_beds',
            initialMoisture: 46.8,
            targetMoisture: 11.0,
            currentMoisture: 15.3,
            estimatedDays: 16,
            actualDays: null,
            turningFrequency: '30-60_min',
            status: 'drying',
            weatherConditions: 'partly_cloudy',
            lastTurned: '2025-05-01 15:00',
            notes: 'Slow drying due to cloudy weather',
            dailyReadings: [
                { date: '2025-04-20', moisture: 46.8, weather: 'partly_cloudy', turned: true },
                { date: '2025-04-21', moisture: 40.2, weather: 'cloudy', turned: true },
                { date: '2025-04-22', moisture: 34.5, weather: 'rainy', turned: true },
                { date: '2025-04-23', moisture: 29.8, weather: 'cloudy', turned: true },
                { date: '2025-04-24', moisture: 24.1, weather: 'partly_cloudy', turned: true },
                { date: '2025-04-25', moisture: 19.8, weather: 'sunny', turned: true },
                { date: '2025-04-26', moisture: 16.5, weather: 'sunny', turned: true },
                { date: '2025-04-27', moisture: 15.3, weather: 'partly_cloudy', turned: true }
            ]
        }
    ];

    useEffect(() => {
        setDryingRecords(mockDryingRecords);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#10b981';
            case 'drying': return '#3b82f6';
            case 'paused': return '#f59e0b';
            case 'attention': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getDryingProgress = (record) => {
        const totalReduction = record.initialMoisture - record.targetMoisture;
        const currentReduction = record.initialMoisture - record.currentMoisture;
        return Math.min(100, (currentReduction / totalReduction) * 100);
    };

    const getWeatherIcon = (weather) => {
        const icons = {
            sunny: '☀️',
            partly_cloudy: '⛅',
            cloudy: '☁️',
            rainy: '🌧️'
        };
        return icons[weather] || '☀️';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In real app, this would save to API
        const newRecord = {
            id: `DRY${Date.now()}`,
            ...formData,
            lotName: lots.find(l => l.id === formData.lotId)?.lotName || formData.lotId,
            initialMoisture: parseFloat(formData.initialMoisture),
            targetMoisture: parseFloat(formData.targetMoisture),
            currentMoisture: parseFloat(formData.initialMoisture),
            estimatedDays: parseInt(formData.estimatedDays),
            status: 'drying',
            actualDays: null,
            lastTurned: `${formData.startDate} ${formData.startTime}`,
            dailyReadings: [
                {
                    date: formData.startDate,
                    moisture: parseFloat(formData.initialMoisture),
                    weather: formData.weatherConditions,
                    turned: true
                }
            ]
        };
        
        setDryingRecords([...dryingRecords, newRecord]);
        setShowForm(false);
        setFormData({
            lotId: '',
            startDate: new Date().toISOString().split('T')[0],
            startTime: new Date().toTimeString().slice(0, 5),
            dryingMethod: 'raised_beds',
            initialMoisture: '',
            targetMoisture: '11.0',
            estimatedDays: '15',
            currentMoisture: '',
            turningFrequency: '30-60_min',
            weatherConditions: 'sunny',
            notes: ''
        });
    };

    const filteredRecords = selectedLot 
        ? dryingRecords.filter(record => record.lotId === selectedLot)
        : dryingRecords;

    return (
        <div className="drying-management">
            <div className="page-header">
                <h1>Drying Management</h1>
                <p>Monitor and manage coffee drying process for optimal quality</p>
            </div>

            {/* Best Practices Card */}
            <div className="best-practices-card">
                <h3>🌟 Drying Best Practices</h3>
                <div className="practices-grid">
                    <div className="practice-item">
                        <span className="practice-icon">✅</span>
                        <div>
                            <strong>Use raised drying beds</strong>
                            <p>Improves airflow and prevents ground moisture</p>
                        </div>
                    </div>
                    <div className="practice-item">
                        <span className="practice-icon">🔄</span>
                        <div>
                            <strong>Turn coffee every 30-60 minutes</strong>
                            <p>Ensures even drying and prevents fermentation</p>
                        </div>
                    </div>
                    <div className="practice-item">
                        <span className="practice-icon">🌧️</span>
                        <div>
                            <strong>Protect from rain</strong>
                            <p>Cover or move beds during rainfall</p>
                        </div>
                    </div>
                    <div className="practice-item">
                        <span className="practice-icon">☀️</span>
                        <div>
                            <strong>Use shade during strong sun</strong>
                            <p>Prevents case hardening and uneven drying</p>
                        </div>
                    </div>
                    <div className="practice-item">
                        <span className="practice-icon">⏱️</span>
                        <div>
                            <strong>Dry slowly for 12-20 days</strong>
                            <p>Rapid drying can cause defects and flavor loss</p>
                        </div>
                    </div>
                    <div className="practice-item">
                        <span className="practice-icon">💧</span>
                        <div>
                            <strong>Target moisture: 10.5-11.5%</strong>
                            <p>Optimal range for storage and shipping</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="controls-section">
                <div className="filters">
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
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowForm(true)}
                >
                    + Start New Drying Batch
                </button>
            </div>

            {/* Drying Records */}
            <div className="drying-records">
                {filteredRecords.length === 0 ? (
                    <div className="no-records">
                        <div className="no-records-icon">🌾</div>
                        <h3>No drying records found</h3>
                        <p>Start a new drying batch to begin tracking</p>
                    </div>
                ) : (
                    <div className="records-grid">
                        {filteredRecords.map(record => {
                            const progress = getDryingProgress(record);
                            const daysElapsed = Math.floor((new Date() - new Date(record.startDate)) / (1000 * 60 * 60 * 24));
                            
                            return (
                                <div key={record.id} className="drying-record-card">
                                    <div className="record-header">
                                        <div className="record-info">
                                            <h4>{record.lotName}</h4>
                                            <p>Started: {record.startDate} at {record.startTime}</p>
                                        </div>
                                        <div className="record-status">
                                            <div 
                                                className="status-indicator"
                                                style={{ backgroundColor: getStatusColor(record.status) }}
                                            ></div>
                                            <span className="status-text">{record.status}</span>
                                        </div>
                                    </div>

                                    <div className="progress-section">
                                        <div className="progress-info">
                                            <div className="moisture-info">
                                                <span className="moisture-current">{record.currentMoisture}%</span>
                                                <span className="moisture-target">→ {record.targetMoisture}%</span>
                                            </div>
                                            <div className="days-info">
                                                Day {daysElapsed} of ~{record.estimatedDays}
                                            </div>
                                        </div>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="progress-percentage">{progress.toFixed(1)}%</div>
                                    </div>

                                    <div className="record-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Method:</span>
                                            <span className="detail-value">{record.dryingMethod.replace('_', ' ')}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Turning:</span>
                                            <span className="detail-value">{record.turningFrequency.replace('_', '-')}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Weather:</span>
                                            <span className="detail-value">
                                                {getWeatherIcon(record.weatherConditions)} {record.weatherConditions.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Last turned:</span>
                                            <span className="detail-value">{record.lastTurned}</span>
                                        </div>
                                    </div>

                                    {record.notes && (
                                        <div className="record-notes">
                                            <strong>Notes:</strong> {record.notes}
                                        </div>
                                    )}

                                    <div className="record-actions">
                                        <button className="btn btn-secondary btn-sm">
                                            📊 View Details
                                        </button>
                                        <button className="btn btn-primary btn-sm">
                                            ✏️ Update Reading
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* New Drying Batch Form Modal */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Start New Drying Batch</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowForm(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Lot *</label>
                                    <select
                                        className="form-select"
                                        value={formData.lotId}
                                        onChange={(e) => setFormData({...formData, lotId: e.target.value})}
                                        required
                                    >
                                        <option value="">Select a lot</option>
                                        {lots && lots.map(lot => (
                                            <option key={lot.id} value={lot.id}>
                                                {lot.lotName || lot.id}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Start Date *</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Start Time *</label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Drying Method *</label>
                                    <select
                                        className="form-select"
                                        value={formData.dryingMethod}
                                        onChange={(e) => setFormData({...formData, dryingMethod: e.target.value})}
                                        required
                                    >
                                        <option value="raised_beds">Raised Beds</option>
                                        <option value="patio">Patio</option>
                                        <option value="mechanical">Mechanical Dryer</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Initial Moisture % *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        step="0.1"
                                        value={formData.initialMoisture}
                                        onChange={(e) => setFormData({...formData, initialMoisture: e.target.value})}
                                        placeholder="45-50%"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Target Moisture % *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        step="0.1"
                                        value={formData.targetMoisture}
                                        onChange={(e) => setFormData({...formData, targetMoisture: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Estimated Days *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.estimatedDays}
                                        onChange={(e) => setFormData({...formData, estimatedDays: e.target.value})}
                                        min="12"
                                        max="25"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Turning Frequency *</label>
                                    <select
                                        className="form-select"
                                        value={formData.turningFrequency}
                                        onChange={(e) => setFormData({...formData, turningFrequency: e.target.value})}
                                        required
                                    >
                                        <option value="30-60_min">Every 30-60 minutes</option>
                                        <option value="1-2_hours">Every 1-2 hours</option>
                                        <option value="2-4_hours">Every 2-4 hours</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Weather Conditions</label>
                                    <select
                                        className="form-select"
                                        value={formData.weatherConditions}
                                        onChange={(e) => setFormData({...formData, weatherConditions: e.target.value})}
                                    >
                                        <option value="sunny">Sunny ☀️</option>
                                        <option value="partly_cloudy">Partly Cloudy ⛅</option>
                                        <option value="cloudy">Cloudy ☁️</option>
                                        <option value="rainy">Rainy 🌧️</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <textarea
                                    className="form-textarea"
                                    rows="3"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    placeholder="Any initial observations or special instructions..."
                                ></textarea>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Start Drying Batch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DryingManagement;
