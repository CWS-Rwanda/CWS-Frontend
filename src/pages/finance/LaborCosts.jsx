import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { generateId } from '../../utils/dummyData';

const LaborCosts = () => {
    const { laborCosts, setLaborCosts } = useData();
    const [formData, setFormData] = useState({
        workerName: '',
        workerType: 'seasonal',
        hours: '',
        rate: '2500',
        task: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const newLabor = {
            id: generateId('LAB'),
            date: new Date().toISOString().split('T')[0],
            workerName: formData.workerName,
            workerType: formData.workerType,
            hours: parseFloat(formData.hours),
            rate: parseFloat(formData.rate),
            totalCost: parseFloat(formData.hours) * parseFloat(formData.rate),
            task: formData.task,
        };

        setLaborCosts([...laborCosts, newLabor]);
        setFormData({ workerName: '', workerType: 'seasonal', hours: '', rate: '2500', task: '' });
    };

    const totalLabor = laborCosts.reduce((sum, l) => sum + l.totalCost, 0);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Labor Cost Management</h1>
                <p className="page-description">Track worker attendance and wages</p>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="stat-card">
                    <div className="stat-label">Total Labor Costs</div>
                    <div className="stat-value">RWF {totalLabor.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Records</div>
                    <div className="stat-value">{laborCosts.length}</div>
                </div>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="card-header">
                    <h2 className="card-title">Record Labor</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label required">Worker Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.workerName}
                                onChange={(e) => setFormData({ ...formData, workerName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label required">Worker Type</label>
                            <select
                                className="form-select"
                                value={formData.workerType}
                                onChange={(e) => setFormData({ ...formData, workerType: e.target.value })}
                                required
                            >
                                <option value="seasonal">Seasonal</option>
                                <option value="permanent">Permanent</option>
                                <option value="casual">Casual</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label required">Hours Worked</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.hours}
                                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                step="0.5"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label required">Rate (RWF/hour)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.rate}
                                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label required">Task</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.task}
                                onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                                required
                            />
                        </div>

                        {formData.hours && formData.rate && (
                            <div className="form-group">
                                <label className="form-label">Total Cost</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={`RWF ${(parseFloat(formData.hours) * parseFloat(formData.rate)).toLocaleString()}`}
                                    disabled
                                    style={{ backgroundColor: 'var(--color-gray-100)', fontWeight: 'bold' }}
                                />
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Record Labor
                    </button>
                </form>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Labor Records</h2>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Worker Name</th>
                                <th>Type</th>
                                <th>Hours</th>
                                <th>Rate</th>
                                <th>Total Cost</th>
                                <th>Task</th>
                            </tr>
                        </thead>
                        <tbody>
                            {laborCosts.slice().reverse().map(labor => (
                                <tr key={labor.id}>
                                    <td>{labor.date}</td>
                                    <td><strong>{labor.workerName}</strong></td>
                                    <td>
                                        <span className="badge badge-info">{labor.workerType}</span>
                                    </td>
                                    <td>{labor.hours}</td>
                                    <td>RWF {labor.rate}</td>
                                    <td><strong>RWF {labor.totalCost.toLocaleString()}</strong></td>
                                    <td>{labor.task}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LaborCosts;
