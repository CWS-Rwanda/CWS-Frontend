import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { processingAPI, lotsAPI } from '../../services/api';

const ProcessingLogs = () => {
    const { lots, fetchLots, loading } = useData();
    const { user } = useAuth();
    const [selectedLot, setSelectedLot] = useState('');
    const [stage, setStage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const stages = ['received', 'pulped', 'fermented', 'washed', 'dried', 'stored'];

    const handleAddLog = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (!selectedLot || !stage) {
                setError('Please select both lot and stage');
                setIsSubmitting(false);
                return;
            }

            const startTime = new Date().toISOString();

            // Create processing log
            await processingAPI.create({
                lot_id: selectedLot,
                stage: stage.toUpperCase(),
                start_time: startTime,
                operator_id: user?.id
            });

            // Update lot status
            await lotsAPI.update(selectedLot, {
                status: stage === 'stored' ? 'COMPLETED' : 'IN_PROCESS'
            });

            alert(`Processing log added: ${selectedLot} - ${stage}`);
            setSelectedLot('');
            setStage('');
            await fetchLots();
        } catch (err) {
            console.error('Error creating processing log:', err);
            setError(err.message || 'Failed to add processing log. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Processing Logs</h1>
                <p className="page-description">Record processing stage transitions</p>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Add Processing Log</h2>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleAddLog}>
                    <div className="form-group">
                        <label className="form-label required">Select Lot</label>
                        <select
                            className="form-select"
                            value={selectedLot}
                            onChange={(e) => setSelectedLot(e.target.value)}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">-- Select Lot --</option>
                            {lots.filter(l => l.status !== 'COMPLETED' && l.status !== 'completed').map(lot => (
                                <option key={lot.id} value={lot.id}>
                                    {lot.lotName || lot.id} - Current: {lot.status}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Processing Stage</label>
                        <select
                            className="form-select"
                            value={stage}
                            onChange={(e) => setStage(e.target.value)}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">-- Select Stage --</option>
                            {stages.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add Log Entry'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProcessingLogs;
