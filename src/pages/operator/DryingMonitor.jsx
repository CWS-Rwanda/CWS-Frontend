import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { processingAPI } from '../../services/api';

const DryingMonitor = () => {
    const { lots } = useData();
    const { user } = useAuth();

    const [selectedLot, setSelectedLot] = useState('');
    const [moisture, setMoisture] = useState('');
    const [turned, setTurned] = useState(false);
    const [covered, setCovered] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!selectedLot) {
            setError('Please select a lot.');
            return;
        }
        if (!moisture) {
            setError('Please enter a moisture reading.');
            return;
        }
        if (!user?.id) {
            setError('User information is missing. Please log in again.');
            return;
        }

        setIsSubmitting(true);
        try {
            const notes = `Moisture: ${moisture}%. Coffees turned: ${turned ? 'YES' : 'NO'}. Tables covered: ${
                covered ? 'YES' : 'NO'
            }.`;

            await processingAPI.create({
                lot_id: selectedLot,
                stage: 'DRYING TABLES',
                start_time: new Date().toISOString(),
                notes,
                operator_id: user.id,
            });

            alert('Drying monitoring entry recorded successfully.');
            setMoisture('');
            setTurned(false);
            setCovered(false);
            setSelectedLot('');
        } catch (err) {
            console.error('Error saving drying monitor entry:', err);
            setError(err.message || 'Failed to save drying monitor entry. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Drying Monitor</h1>
                <p className="page-description">Track moisture readings and daily checks on drying tables</p>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">New Drying Monitor Entry</h2>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Select Lot / Drying Table</label>
                        <select
                            className="form-select"
                            value={selectedLot}
                            onChange={(e) => setSelectedLot(e.target.value)}
                            disabled={isSubmitting}
                            required
                        >
                            <option value="">-- Select Lot --</option>
                            {lots.map((lot) => (
                                <option key={lot.id} value={lot.id}>
                                    {lot.lotName || lot.id} • {lot.processingMethod} • Grade {lot.grade || 'N/A'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Morning Moisture Reading (%)</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="e.g. 11.8"
                            value={moisture}
                            onChange={(e) => setMoisture(e.target.value)}
                            step="0.1"
                            min="0"
                            max="100"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Daily Checklists</label>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                className={`btn ${turned ? 'btn-secondary' : 'btn-outline'}`}
                                onClick={() => setTurned((prev) => !prev)}
                                style={{ fontSize: '0.85rem' }}
                            >
                                Coffees turned: {turned ? 'Yes' : 'No'}
                            </button>
                            <button
                                type="button"
                                className={`btn ${covered ? 'btn-secondary' : 'btn-outline'}`}
                                onClick={() => setCovered((prev) => !prev)}
                                style={{ fontSize: '0.85rem' }}
                            >
                                Tables covered (rain / night): {covered ? 'Yes' : 'No'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Drying Log'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DryingMonitor;

