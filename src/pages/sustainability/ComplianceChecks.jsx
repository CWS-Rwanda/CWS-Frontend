import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { complianceLogsAPI } from '../../services/api';

const ComplianceChecks = () => {
    const { lots, loading } = useData();
    const [complianceChecks, setComplianceChecks] = useState([]);
    const [selectedLot, setSelectedLot] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        lot_id: '',
        ppeUsage: 'compliant',
        wastewaterManagement: 'compliant',
        laborStandards: 'compliant',
        notes: '',
    });

    // Load compliance logs for selected lot
    useEffect(() => {
        if (selectedLot) {
            loadComplianceLogs(selectedLot);
        } else {
            setComplianceChecks([]);
        }
    }, [selectedLot]);

    const loadComplianceLogs = async (lotId) => {
        try {
            const response = await complianceLogsAPI.getByLot(lotId);
            // Filter for CPSI type
            const cpsiLogs = response.data.data.filter(log => log.type === 'CPSI');
            setComplianceChecks(cpsiLogs);
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

            // Calculate CPSI score
            const scores = {
                compliant: 100,
                'needs-improvement': 50,
                'non-compliant': 0,
            };

            const avgScore = Math.round(
                (scores[formData.ppeUsage] +
                    scores[formData.wastewaterManagement] +
                    scores[formData.laborStandards]) / 3
            );

            const status = avgScore >= 80 ? 'COMPLIANT' : avgScore >= 50 ? 'NEEDS_IMPROVEMENT' : 'NON_COMPLIANT';

            await complianceLogsAPI.create({
                lot_id: formData.lot_id,
                type: 'CPSI',
                score: avgScore,
                status: status,
                notes: `PPE: ${formData.ppeUsage}, Wastewater: ${formData.wastewaterManagement}, Labor: ${formData.laborStandards}. ${formData.notes || ''}`
            });

            alert(`Sustainability check recorded. CPSI Score: ${avgScore}%`);
            setFormData({ lot_id: '', ppeUsage: 'compliant', wastewaterManagement: 'compliant', laborStandards: 'compliant', notes: '' });
            await loadComplianceLogs(formData.lot_id);
        } catch (err) {
            console.error('Error creating compliance check:', err);
            setError(err.message || 'Failed to record compliance check. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Compliance Checks (CPSI)</h1>
                <p className="page-description">Social & environmental compliance monitoring</p>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">New Compliance Check</h2>
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
                        <label className="form-label required">PPE Usage</label>

                        <select
                            className="form-select"
                            value={formData.ppeUsage}
                            onChange={(e) => setFormData({ ...formData, ppeUsage: e.target.value })}
                            required
                        >
                            <option value="compliant">Compliant</option>
                            <option value="needs-improvement">Needs Improvement</option>
                            <option value="non-compliant">Non-compliant</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Wastewater Management</label>
                        <select
                            className="form-select"
                            value={formData.wastewaterManagement}
                            onChange={(e) => setFormData({ ...formData, wastewaterManagement: e.target.value })}
                            required
                        >
                            <option value="compliant">Compliant</option>
                            <option value="needs-improvement">Needs Improvement</option>
                            <option value="non-compliant">Non-compliant</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Labor Standards</label>
                        <select
                            className="form-select"
                            value={formData.laborStandards}
                            onChange={(e) => setFormData({ ...formData, laborStandards: e.target.value })}
                            required
                        >
                            <option value="compliant">Compliant</option>
                            <option value="needs-improvement">Needs Improvement</option>
                            <option value="non-compliant">Non-compliant</option>
                        </select>
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
                        {isSubmitting ? 'Submitting...' : 'Submit Compliance Check'}
                    </button>
                </form>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Compliance Check History {selectedLot && `(Lot: ${lots.find(l => l.id === selectedLot)?.lotName || selectedLot})`}</h2>
                </div>

                {!selectedLot ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Select a lot above to view compliance check history</div>
                ) : loading.sustainabilityChecks ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading compliance checks...</div>
                ) : complianceChecks.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No compliance checks found for this lot.</div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Lot ID</th>
                                    <th>CPSI Score</th>
                                    <th>Status</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complianceChecks.map(check => (
                                    <tr key={check.id}>
                                        <td>{check.created_at?.split('T')[0] || 'N/A'}</td>
                                        <td><strong>{check.lot_id}</strong></td>
                                        <td><strong>{parseFloat(check.score || 0).toFixed(1)}%</strong></td>
                                        <td>
                                            <span className={`badge ${
                                                check.status === 'COMPLIANT' ? 'badge-success' :
                                                check.status === 'NEEDS_IMPROVEMENT' ? 'badge-warning' :
                                                'badge-error'
                                            }`}>
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

export default ComplianceChecks;
