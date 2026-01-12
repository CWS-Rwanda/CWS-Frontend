import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { generateId } from '../../utils/dummyData';

const QualityChecks = () => {
    const { lots, qualityChecks, setQualityChecks } = useData();
    const [formData, setFormData] = useState({
        lotId: '',
        fermentationDuration: '',
        moisture: '',
        defects: '',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simple CPQI calculation
        const score = Math.max(0, 100 - (parseInt(formData.defects) * 5));

        const newCheck = {
            id: generateId('QC'),
            lotId: formData.lotId,
            date: new Date().toISOString().split('T')[0],
            fermentationDuration: parseInt(formData.fermentationDuration),
            moisture: parseFloat(formData.moisture),
            defects: parseInt(formData.defects),
            cpqiScore: score,
            compliant: score >= 80,
            notes: formData.notes,
        };

        setQualityChecks([...qualityChecks, newCheck]);
        alert(`Quality check recorded. CPQI Score: ${score}%`);
        setFormData({ lotId: '', fermentationDuration: '', moisture: '', defects: '', notes: '' });
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

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Lot ID</label>
                        <select
                            className="form-select"
                            value={formData.lotId}
                            onChange={(e) => setFormData({ ...formData, lotId: e.target.value })}
                            required
                        >
                            <option value="">-- Select Lot --</option>
                            {lots.map(lot => (
                                <option key={lot.id} value={lot.id}>
                                    {lot.id} - {lot.status}
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

                    <button type="submit" className="btn btn-primary">
                        Submit Quality Check
                    </button>
                </form>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Quality Check History</h2>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Lot ID</th>
                                <th>Fermentation (hrs)</th>
                                <th>Moisture (%)</th>
                                <th>Defects</th>
                                <th>CPQI Score</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {qualityChecks.slice().reverse().map(check => (
                                <tr key={check.id}>
                                    <td>{check.date}</td>
                                    <td><strong>{check.lotId}</strong></td>
                                    <td>{check.fermentationDuration}</td>
                                    <td>{check.moisture}%</td>
                                    <td>{check.defects}</td>
                                    <td><strong>{check.cpqiScore}%</strong></td>
                                    <td>
                                        <span className={`badge ${check.compliant ? 'badge-success' : 'badge-error'}`}>
                                            {check.compliant ? 'Compliant' : 'Non-compliant'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default QualityChecks;
