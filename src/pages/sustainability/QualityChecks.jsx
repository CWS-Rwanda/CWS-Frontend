import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { complianceLogsAPI } from '../../services/api';
import CuppingScoreForm from '../../components/quality/CuppingScoreForm';
import './QualityChecks.css';

const QualityChecks = () => {
    const { lots, loading } = useData();
    const [qualityChecks, setQualityChecks] = useState([]);
    const [selectedLot, setSelectedLot] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showCuppingForm, setShowCuppingForm] = useState(false);
    const [activeTab, setActiveTab] = useState('cpqi');
    
    // Debug logging
    useEffect(() => {
        console.log('QualityChecks - lots:', lots);
        console.log('QualityChecks - loading:', loading);
    }, [lots, loading]);
    const [formData, setFormData] = useState({
        lot_id: '',
        fermentationDuration: '',
        moisture: '',
        defects: '',
        notes: '',
    });

    // Load compliance logs for selected lot
    useEffect(() => {
        if (selectedLot) {
            loadComplianceLogs(selectedLot);
        } else {
            setQualityChecks([]);
        }
    }, [selectedLot]);

    const loadComplianceLogs = async (lotId) => {
        try {
            const response = await complianceLogsAPI.getByLot(lotId);
            // Filter for CPQI type
            const cpqiLogs = response.data.data.filter(log => log.type === 'CPQI');
            setQualityChecks(cpqiLogs);
        } catch (error) {
            console.error('Error loading compliance logs:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (!formData.lot_id) {
                setError('Please select a lot');
                setIsSubmitting(false);
                return;
            }

            // Simple CPQI calculation
            const score = Math.max(0, 100 - (parseInt(formData.defects) * 5));
            const compliant = score >= 80;

            await complianceLogsAPI.create({
                lot_id: formData.lot_id,
                type: 'CPQI',
                score: score,
                status: compliant ? 'COMPLIANT' : 'NON_COMPLIANT',
                notes: `Fermentation: ${formData.fermentationDuration}hrs, Moisture: ${formData.moisture}%, Defects: ${formData.defects}. ${formData.notes || ''}`
            });

            alert(`Quality check recorded. CPQI Score: ${score}%`);
            setFormData({ lot_id: '', fermentationDuration: '', moisture: '', defects: '', notes: '' });
            await loadComplianceLogs(formData.lot_id);
        } catch (err) {
            console.error('Error creating quality check:', err);
            setError(err.message || 'Failed to record quality check. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCuppingSubmit = async (cuppingData) => {
        try {
            // In real app, this would save to API
            console.log('Saving cupping score:', cuppingData);
            alert('Cupping score saved successfully!');
            setShowCuppingForm(false);
        } catch (error) {
            console.error('Error saving cupping score:', error);
            alert('Failed to save cupping score. Please try again.');
        }
    };

    return (
        <div className="quality-checks">
            <div className="page-header">
                <h1 className="page-title">Quality Management</h1>
                <p className="page-description">Track coffee quality through CPQI checks and SCA cupping scores</p>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button 
                    className={`tab-btn ${activeTab === 'cpqi' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cpqi')}
                >
                    CPQI Checks
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'cupping' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cupping')}
                >
                    SCA Cupping
                </button>
            </div>

            {loading?.lots ? (
                <div className="page-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading lots...</p>
                </div>
            ) : (
                <div>
                    {activeTab === 'cpqi' && (
                        <>
                            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                                <div className="card-header">
                                    <h2 className="card-title">New CPQI Quality Check</h2>
                                    <div className="card-actions">
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={() => setShowCuppingForm(true)}
                                        >
                                            Switch to SCA Cupping →
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="form-label required">Select Lot</label>
                                        <select
                                            className="form-select"
                                            value={selectedLot}
                                            onChange={(e) => {
                                                setFormData({ ...formData, lot_id: e.target.value });
                                                setSelectedLot(e.target.value);
                                            }}
                                            required
                                            disabled={isSubmitting}
                                        >
                                            <option value="">-- Select Lot --</option>
                                            {lots && lots.length > 0 ? (
                                                lots.map(lot => (
                                                    <option key={lot.id} value={lot.id}>
                                                        {lot.lotName || lot.id} - {lot.processingMethod} ({lot.status})
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>No lots available</option>
                                            )}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label required">Fermentation Duration (hours)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.fermentationDuration}
                                            onChange={(e) => setFormData({ ...formData, fermentationDuration: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label required">Moisture (%)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.moisture}
                                            onChange={(e) => setFormData({ ...formData, moisture: e.target.value })}
                                            step="0.1"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label required">Defects Count</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.defects}
                                            onChange={(e) => setFormData({ ...formData, defects: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Notes</label>
                                        <textarea
                                            className="form-textarea"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                        {isSubmitting ? 'Submitting...' : 'Submit CPQI Check'}
                                    </button>
                                </form>
                            </div>

                            <div className="content-card">
                                <div className="card-header">
                                    <h2 className="card-title">CPQI Check History {selectedLot && `(Lot: ${lots.find(l => l.id === selectedLot)?.lotName || selectedLot})`}</h2>
                                </div>

                                {!selectedLot ? (
                                    <div style={{ padding: '2rem', textAlign: 'center' }}>Select a lot above to view quality check history</div>
                                ) : loading.qualityChecks ? (
                                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading quality checks...</div>
                                ) : qualityChecks.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center' }}>No quality checks found for this lot.</div>
                                ) : (
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Lot ID</th>
                                                    <th>CPQI Score</th>
                                                    <th>Status</th>
                                                    <th>Notes</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {qualityChecks.map(check => (
                                                    <tr key={check.id}>
                                                        <td>{check.created_at?.split('T')[0] || 'N/A'}</td>
                                                        <td><strong>{check.lot_id}</strong></td>
                                                        <td><strong>{parseFloat(check.score || 0).toFixed(1)}%</strong></td>
                                                        <td>
                                                            <span className={`badge ${check.status === 'COMPLIANT' ? 'badge-success' : 'badge-error'}`}>
                                                                {check.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{check.notes || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'cupping' && (
                        <div className="cupping-section">
                            {!showCuppingForm ? (
                                <div className="content-card">
                                    <div className="card-header">
                                        <h2 className="card-title">SCA Cupping Evaluation</h2>
                                        <div className="card-actions">
                                            <button 
                                                className="btn btn-secondary"
                                                onClick={() => setActiveTab('cpqi')}
                                            >
                                                ← Back to CPQI
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="cupping-intro">
                                        <h3>🏆 Professional Coffee Cupping</h3>
                                        <p>
                                            The Specialty Coffee Association (SCA) cupping protocol provides a comprehensive 
                                            evaluation of coffee quality using 10 criteria, with scores ranging from 0-100 points.
                                        </p>
                                        
                                        <div className="quality-levels-preview">
                                            <div className="level-item competition">
                                                <span className="score">89+</span>
                                                <span className="label">Competition</span>
                                            </div>
                                            <div className="level-item excellent">
                                                <span className="score">86-88</span>
                                                <span className="label">Excellent</span>
                                            </div>
                                            <div className="level-item good">
                                                <span className="score">83-85</span>
                                                <span className="label">Good</span>
                                            </div>
                                            <div className="level-item commercial">
                                                <span className="score">80-82</span>
                                                <span className="label">Commercial</span>
                                            </div>
                                        </div>

                                        <div className="criteria-preview">
                                            <h4>Evaluation Criteria:</h4>
                                            <div className="criteria-list">
                                                <span>Fragrance/Aroma</span>
                                                <span>Flavor</span>
                                                <span>Aftertaste</span>
                                                <span>Acidity</span>
                                                <span>Body</span>
                                                <span>Uniformity</span>
                                                <span>Cleanliness</span>
                                                <span>Sweetness</span>
                                                <span>Overall</span>
                                                <span>Defects (deductions)</span>
                                            </div>
                                        </div>

                                        <div className="actions">
                                            <button 
                                                className="btn btn-primary btn-lg"
                                                onClick={() => setShowCuppingForm(true)}
                                            >
                                                Start Cupping Evaluation
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="cupping-form-container">
                                    <div className="form-header">
                                        <button 
                                            className="back-btn"
                                            onClick={() => setShowCuppingForm(false)}
                                        >
                                            ← Back to Overview
                                        </button>
                                        <h2>New SCA Cupping Evaluation</h2>
                                    </div>
                                    <CuppingScoreForm 
                                        lotId={selectedLot}
                                        onSubmit={handleCuppingSubmit}
                                        onCancel={() => setShowCuppingForm(false)}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QualityChecks;
