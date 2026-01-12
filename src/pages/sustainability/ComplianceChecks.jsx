import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { generateId } from '../../utils/dummyData';

const ComplianceChecks = () => {
    const { sustainabilityChecks, setSustainabilityChecks } = useData();
    const [formData, setFormData] = useState({
        ppeUsage: 'compliant',
        wastewaterManagement: 'compliant',
        laborStandards: 'compliant',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

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

        const newCheck = {
            id: generateId('SC'),
            date: new Date().toISOString().split('T')[0],
            ppeUsage: formData.ppeUsage,
            wastewaterManagement: formData.wastewaterManagement,
            laborStandards: formData.laborStandards,
            cpsiScore: avgScore,
            correctiveActions: [],
            notes: formData.notes,
        };

        setSustainabilityChecks([...sustainabilityChecks, newCheck]);
        alert(`Sustainability check recorded. CPSI Score: ${avgScore}%`);
        setFormData({ ppeUsage: 'compliant', wastewaterManagement: 'compliant', laborStandards: 'compliant', notes: '' });
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

                <form onSubmit={handleSubmit}>
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

                    <button type="submit" className="btn btn-primary">
                        Submit Compliance Check
                    </button>
                </form>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Compliance Check History</h2>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>PPE Usage</th>
                                <th>Wastewater</th>
                                <th>Labor Standards</th>
                                <th>CPSI Score</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sustainabilityChecks.slice().reverse().map(check => (
                                <tr key={check.id}>
                                    <td>{check.date}</td>
                                    <td>
                                        <span className={`badge ${check.ppeUsage === 'compliant' ? 'badge-success' :
                                                check.ppeUsage === 'needs-improvement' ? 'badge-warning' :
                                                    'badge-error'
                                            }`}>
                                            {check.ppeUsage}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${check.wastewaterManagement === 'compliant' ? 'badge-success' :
                                                check.wastewaterManagement === 'needs-improvement' ? 'badge-warning' :
                                                    'badge-error'
                                            }`}>
                                            {check.wastewaterManagement}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${check.laborStandards === 'compliant' ? 'badge-success' :
                                                check.laborStandards === 'needs-improvement' ? 'badge-warning' :
                                                    'badge-error'
                                            }`}>
                                            {check.laborStandards}
                                        </span>
                                    </td>
                                    <td><strong>{check.cpsiScore}%</strong></td>
                                    <td>{check.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComplianceChecks;
