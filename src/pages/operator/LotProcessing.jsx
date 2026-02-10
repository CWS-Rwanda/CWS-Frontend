import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { processingAPI, lotsAPI } from '../../services/api';
import Modal from '../../components/common/Modal';

const LotProcessing = () => {
    const { lots, loading, seasons, fetchLots } = useData();
    const [processingLogs, setProcessingLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        lot_name: '',
        season_id: '',
        process_type: 'WASHED',
        grade: '',
    });

    // Load processing logs for all lots
    useEffect(() => {
        loadProcessingLogs();
    }, []);

    const loadProcessingLogs = async () => {
        setLogsLoading(true);
        try {
            const response = await processingAPI.getAll();
            setProcessingLogs(response.data.data || []);
        } catch (error) {
            console.error('Error loading processing logs:', error);
        } finally {
            setLogsLoading(false);
        }
    };

    const handleCreateLot = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await lotsAPI.create(formData);
            setIsCreateModalOpen(false);
            setFormData({ lot_name: '', season_id: '', process_type: 'WASHED', grade: '' });
            await fetchLots(); // Refresh lots list
        } catch (err) {
            console.error('Error creating lot:', err);
            setError(err.message || 'Failed to create lot. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Build timeline for each lot from processing logs
    const getLotTimeline = (lotId) => {
        return processingLogs
            .filter(log => log.lot_id === lotId)
            .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
            .map(log => ({
                stage: log.stage,
                date: log.start_time?.split('T')[0] || '',
                time: log.start_time ? new Date(log.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '',
                operator: log.operator?.name || 'Operator'
            }));
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'received': 'badge-warning',
            'pulped': 'badge-info',
            'fermented': 'badge-info',
            'washed': 'badge-info',
            'dried': 'badge-success',
            'stored': 'badge-success',
        };
        return statusMap[status] || 'badge-info';
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Lot Processing</h1>
                    <p className="page-description">Track coffee processing stages</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
                    + Create Lot
                </button>
            </div>

            {loading.lots || logsLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading lots and processing logs...</div>
            ) : lots.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p style={{ marginBottom: 'var(--spacing-lg)' }}>No lots found. Create your first lot to get started.</p>
                    <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
                        + Create Your First Lot
                    </button>
                </div>
            ) : (
                lots.map(lot => {
                    const timeline = getLotTimeline(lot.id);
                    return (
                        <div key={lot.id} className="content-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <div className="card-header">
                                <div>
                                    <h2 className="card-title">{lot.lotName || lot.id}</h2>
                                    <p style={{ margin: 0, color: 'var(--color-gray-600)', fontSize: '0.875rem' }}>
                                        {lot.processingMethod} - Grade {lot.grade || 'N/A'} - Status: {lot.status}
                                    </p>
                                </div>
                                <span className={`badge ${getStatusBadgeClass(lot.status)}`} style={{ fontSize: '0.875rem' }}>
                                    Current: {lot.status}
                                </span>
                            </div>

                            {timeline.length === 0 ? (
                                <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--color-gray-600)' }}>
                                    No processing logs yet. Add logs in Processing Logs page.
                                </div>
                            ) : (
                                <div className="timeline">
                                    {timeline.map((stage, index) => (
                                        <div key={index} className="timeline-item">
                                            <div className="timeline-marker"></div>
                                            <div className="timeline-content">
                                                <div className="timeline-header">
                                                    <strong>{stage.stage}</strong>
                                                    <span className="timeline-date">{stage.date} {stage.time}</span>
                                                </div>
                                                <p className="timeline-operator">Operator: {stage.operator}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
            
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Lot">
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                )}
                <form onSubmit={handleCreateLot}>
                    <div className="form-group">
                        <label className="form-label required">Lot Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.lot_name}
                            onChange={(e) => setFormData({ ...formData, lot_name: e.target.value })}
                            placeholder="e.g., LOT-001"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Season</label>
                        <select
                            className="form-select"
                            value={formData.season_id}
                            onChange={(e) => setFormData({ ...formData, season_id: e.target.value })}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">-- Select Season --</option>
                            {seasons?.filter(s => s.active === true).map(season => (
                                <option key={season.id} value={season.id}>
                                    {season.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Process Type</label>
                        <select
                            className="form-select"
                            value={formData.process_type}
                            onChange={(e) => setFormData({ ...formData, process_type: e.target.value })}
                            required
                            disabled={isSubmitting}
                        >
                            <option value="WASHED">Washed</option>
                            <option value="HONEY">Honey</option>
                            <option value="NATURAL">Natural</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Grade (Optional)</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.grade}
                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                            placeholder="e.g., A, AA, Premium"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Lot'}
                        </button>
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-outline" disabled={isSubmitting}>
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <style>{`
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--spacing-xl);
        }

        .page-header > div {
            flex: 1;
        }

        .timeline {
          position: relative;
          padding-left: var(--spacing-xl);
          margin-top: var(--spacing-lg);
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--color-gray-300);
        }

        .timeline-item {
          position: relative;
          margin-bottom: var(--spacing-lg);
        }

        .timeline-marker {
          position: absolute;
          left: -28px;
          top: 4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--color-secondary);
          border: 3px solid var(--color-white);
          box-shadow: 0 0 0 2px var(--color-secondary);
        }

        .timeline-content {
          padding-left: var(--spacing-md);
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--spacing-xs);
        }

        .timeline-date {
          color: var(--color-gray-600);
          font-size: 0.875rem;
        }

        .timeline-operator {
          color: var(--color-gray-600);
          font-size: 0.875rem;
          margin: 0;
        }
      `}</style>
        </div>
    );
};

export default LotProcessing;
