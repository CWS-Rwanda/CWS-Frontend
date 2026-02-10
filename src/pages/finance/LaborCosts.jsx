import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { laborLogsAPI, workersAPI } from '../../services/api';

const LaborCosts = () => {
    const { laborCosts, fetchLaborLogs, loading } = useData();
    const [workers, setWorkers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        worker_id: '',
        work_date: new Date().toISOString().split('T')[0],
        hours: '',
        rate: '2500',
        task: '',
    });

    // Load workers on mount
    useEffect(() => {
        loadWorkers();
    }, []);

    const loadWorkers = async () => {
        try {
            const response = await workersAPI.getAll();
            setWorkers(response.data.data.filter(w => w.active !== false));
        } catch (error) {
            console.error('Error loading workers:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (!formData.worker_id) {
                setError('Please select a worker');
                setIsSubmitting(false);
                return;
            }

            const hours = parseFloat(formData.hours);
            const rate = parseFloat(formData.rate);
            const totalAmount = hours * rate;

            await laborLogsAPI.create({
                worker_id: formData.worker_id,
                work_date: formData.work_date,
                total_amount: totalAmount
            });

            alert(`Labor log recorded. Total: RWF ${totalAmount.toLocaleString()}`);
            setFormData({ worker_id: '', work_date: new Date().toISOString().split('T')[0], hours: '', rate: '2500', task: '' });
            await fetchLaborLogs();
        } catch (err) {
            console.error('Error creating labor log:', err);
            setError(err.message || 'Failed to record labor. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Transform labor logs for display
    const transformLaborLog = (log, worker) => ({
        id: log.id,
        date: log.work_date || log.date,
        workerName: worker?.name || 'Unknown',
        workerType: worker?.worker_type?.toLowerCase() || 'N/A',
        hours: 0, // Not stored in backend
        rate: 0, // Not stored in backend
        totalCost: parseFloat(log.total_amount || 0),
        task: formData.task || 'N/A', // Not stored in backend
    });

    const totalLabor = laborCosts.reduce((sum, l) => sum + parseFloat(l.total_amount || 0), 0);

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

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label required">Select Worker</label>
                            <select
                                className="form-select"
                                value={formData.worker_id}
                                onChange={(e) => setFormData({ ...formData, worker_id: e.target.value })}
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">-- Select Worker --</option>
                                {workers.map(worker => (
                                    <option key={worker.id} value={worker.id}>
                                        {worker.name} ({worker.worker_type})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label required">Work Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.work_date}
                                onChange={(e) => setFormData({ ...formData, work_date: e.target.value })}
                                required
                                disabled={isSubmitting}
                            />
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
                            <label className="form-label">Task Description (Optional)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.task}
                                onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                                disabled={isSubmitting}
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

                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Recording...' : 'Record Labor'}
                    </button>
                </form>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Labor Records</h2>
                </div>

                {loading.laborCosts ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading labor records...</div>
                ) : laborCosts.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No labor records found.</div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Worker ID</th>
                                    <th>Total Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {laborCosts.slice().reverse().map(labor => {
                                    const worker = workers.find(w => w.id === labor.worker_id);
                                    return (
                                        <tr key={labor.id}>
                                            <td>{labor.work_date || labor.date}</td>
                                            <td><strong>{worker?.name || labor.worker_id}</strong></td>
                                            <td><strong>RWF {parseFloat(labor.total_amount || 0).toLocaleString()}</strong></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LaborCosts;
