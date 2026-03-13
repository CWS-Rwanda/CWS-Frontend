import React, { useState } from 'react';
import './CuppingScoreForm.css';

const CuppingScoreForm = ({ lotId, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        lotId: lotId || '',
        cuppingDate: new Date().toISOString().split('T')[0],
        cupperName: '',
        fragranceAroma: 8,
        flavor: 8,
        aftertaste: 8,
        acidity: 8,
        body: 8,
        uniformity: 10,
        cleanliness: 10,
        sweetness: 10,
        overall: 8,
        defects: 0,
        notes: '',
        dryingMethod: 'raised_beds',
        dryingDays: '',
        moistureContent: '',
        turningFrequency: '30-60_min'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // SCA Cupping Criteria (max points)
    const criteria = {
        fragranceAroma: { max: 10, name: 'Fragrance/Aroma', weight: 0.10 },
        flavor: { max: 10, name: 'Flavor', weight: 0.10 },
        aftertaste: { max: 10, name: 'Aftertaste', weight: 0.10 },
        acidity: { max: 10, name: 'Acidity', weight: 0.10 },
        body: { max: 10, name: 'Body', weight: 0.10 },
        uniformity: { max: 10, name: 'Uniformity', weight: 0.10 },
        cleanliness: { max: 10, name: 'Cleanliness/Cup', weight: 0.10 },
        sweetness: { max: 10, name: 'Sweetness', weight: 0.10 },
        overall: { max: 10, name: 'Overall', weight: 0.10 },
        defects: { max: 0, name: 'Defects', weight: 0 } // Deduction only
    };

    const calculateTotalScore = () => {
        const total = Object.keys(criteria).reduce((sum, key) => {
            if (key === 'defects') {
                return sum - (parseFloat(formData[key]) || 0) * 2; // 2 points per defect
            }
            return sum + (parseFloat(formData[key]) || 0);
        }, 0);
        return Math.max(0, Math.min(100, total));
    };

    const getQualityLevel = (score) => {
        if (score >= 89) return { level: 'Competition Level', color: '#10b981', textColor: '#065f46' };
        if (score >= 86) return { level: 'Excellent', color: '#3b82f6', textColor: '#1e3a8a' };
        if (score >= 83) return { level: 'Good Specialty', color: '#8b5cf6', textColor: '#4c1d95' };
        if (score >= 80) return { level: 'Commercial Specialty', color: '#f59e0b', textColor: '#78350f' };
        return { level: 'Below Specialty', color: '#ef4444', textColor: '#7f1d1d' };
    };

    const totalScore = calculateTotalScore();
    const qualityLevel = getQualityLevel(totalScore);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const cuppingData = {
                ...formData,
                totalScore,
                qualityLevel: qualityLevel.level,
                scoringCriteria: criteria
            };

            await onSubmit(cuppingData);
        } catch (error) {
            console.error('Error submitting cupping score:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="cupping-score-form">
            <form onSubmit={handleSubmit}>
                {/* Header Information */}
                <div className="form-section">
                    <h3>Cupping Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Lot ID</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.lotId}
                                onChange={(e) => handleInputChange('lotId', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cupping Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.cuppingDate}
                                onChange={(e) => handleInputChange('cuppingDate', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cupper Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.cupperName}
                                onChange={(e) => handleInputChange('cupperName', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* SCA Cupping Scores */}
                <div className="form-section">
                    <h3>SCA Cupping Scores</h3>
                    <div className="scoring-grid">
                        {Object.entries(criteria).map(([key, criterion]) => (
                            <div key={key} className="score-input-group">
                                <label className="score-label">
                                    {criterion.name}
                                    {key !== 'defects' && <span className="max-score">/ {criterion.max}</span>}
                                    {key === 'defects' && <span className="defect-note">(2 pts each)</span>}
                                </label>
                                <input
                                    type="number"
                                    className="score-input"
                                    min={key === 'defects' ? '0' : '0'}
                                    max={key === 'defects' ? '10' : criterion.max}
                                    step="0.25"
                                    value={formData[key]}
                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                    required
                                />
                                <div className="score-bar">
                                    <div 
                                        className="score-fill" 
                                        style={{ 
                                            width: `${key === 'defects' ? 0 : (formData[key] / criterion.max) * 100}%`,
                                            backgroundColor: key === 'defects' ? '#ef4444' : '#3b82f6'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Drying Management */}
                <div className="form-section">
                    <h3>Drying Management</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Drying Method</label>
                            <select
                                className="form-select"
                                value={formData.dryingMethod}
                                onChange={(e) => handleInputChange('dryingMethod', e.target.value)}
                            >
                                <option value="raised_beds">Raised Drying Beds</option>
                                <option value="patio">Patio</option>
                                <option value="mechanical">Mechanical Dryer</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Drying Duration (days)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.dryingDays}
                                onChange={(e) => handleInputChange('dryingDays', e.target.value)}
                                placeholder="12-20 days recommended"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Moisture Content (%)</label>
                            <input
                                type="number"
                                className="form-input"
                                step="0.1"
                                value={formData.moistureContent}
                                onChange={(e) => handleInputChange('moistureContent', e.target.value)}
                                placeholder="10.5-11.5% target"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Turning Frequency</label>
                            <select
                                className="form-select"
                                value={formData.turningFrequency}
                                onChange={(e) => handleInputChange('turningFrequency', e.target.value)}
                            >
                                <option value="30-60_min">Every 30-60 minutes</option>
                                <option value="1-2_hours">Every 1-2 hours</option>
                                <option value="2-4_hours">Every 2-4 hours</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="form-section">
                    <h3>Tasting Notes & Observations</h3>
                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea
                            className="form-textarea"
                            rows="4"
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            placeholder="Describe fragrance, flavor notes, acidity characteristics, body, aftertaste, and any observations..."
                        ></textarea>
                    </div>
                </div>

                {/* Score Summary */}
                <div className="score-summary" style={{ backgroundColor: qualityLevel.color }}>
                    <div className="score-display">
                        <div className="total-score">{totalScore.toFixed(2)}</div>
                        <div className="quality-level" style={{ color: qualityLevel.textColor }}>
                            {qualityLevel.level}
                        </div>
                    </div>
                    <div className="score-breakdown">
                        {Object.entries(criteria).map(([key, criterion]) => {
                            const value = parseFloat(formData[key]) || 0;
                            const displayValue = key === 'defects' ? `-${value * 2}` : `+${value}`;
                            return (
                                <div key={key} className="breakdown-item">
                                    <span className="criterion-name">{criterion.name}:</span>
                                    <span className="criterion-value">{displayValue}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Cupping Score'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CuppingScoreForm;
