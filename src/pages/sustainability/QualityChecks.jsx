import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { complianceLogsAPI } from '../../services/api';

const QualityChecks = () => {
    const { lots, loading } = useData();
    const [qualityChecks, setQualityChecks] = useState([]);
    const [selectedLot, setSelectedLot] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
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

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Quality Checks (CPQI)</h1>
                <p className="page-description">Daily quality assurance</p>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">New Quality Check</h2>
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
                            value={formData.lot_id}
                            onChange={(e) => {
                                setFormData({ ...formData, lot_id: e.target.value });
                                setSelectedLot(e.target.value);
                            }}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">-- Select Lot --</option>
                            {lots.map(lot => (
                                <option key={lot.id} value={lot.id}>
                                    {lot.lotName || lot.id} - {lot.processingMethod} ({lot.status})
                                </option>
                            ))}
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
                        {isSubmitting ? 'Submitting...' : 'Submit Quality Check'}
                    </button>
                </form>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Quality Check History {selectedLot && `(Lot: ${lots.find(l => l.id === selectedLot)?.lotName || selectedLot})`}</h2>
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
        </div>
    );
};

export default QualityChecks;
