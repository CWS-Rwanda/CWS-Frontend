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

    // Split & Merge state
    const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedLotForSplit, setSelectedLotForSplit] = useState(null);
    const [selectedLotsForMerge, setSelectedLotsForMerge] = useState([]);
    const [lotHistory, setLotHistory] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [splitData, setSplitData] = useState({
        children: [
            { lot_name: '', process_type: 'WASHED', grade: '', weight_kg: 0 },
            { lot_name: '', process_type: 'WASHED', grade: '', weight_kg: 0 }
        ]
    });

    const [mergeData, setMergeData] = useState({
        merged_lot_name: '',
        process_type: 'WASHED',
        grade: ''
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

    const handleSplitLot = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await lotsAPI.split(selectedLotForSplit.id, splitData);
            setIsSplitModalOpen(false);
            setSplitData({
                children: [
                    { lot_name: '', process_type: 'WASHED', grade: '', weight_kg: 0 },
                    { lot_name: '', process_type: 'WASHED', grade: '', weight_kg: 0 }
                ]
            });
            await fetchLots();
        } catch (err) {
            setError(err.message || 'Failed to split lot.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMergeLots = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const payload = {
                ...mergeData,
                parent_lot_ids: selectedLotsForMerge
            };
            await lotsAPI.merge(payload);
            setIsMergeModalOpen(false);
            setSelectedLotsForMerge([]);
            setMergeData({ merged_lot_name: '', process_type: 'WASHED', grade: '' });
            await fetchLots();
        } catch (err) {
            setError(err.message || 'Failed to merge lots.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const viewHistory = async (lotId) => {
        setIsHistoryModalOpen(true);
        setHistoryLoading(true);
        try {
            const response = await lotsAPI.getHistory(lotId);
            setLotHistory(response.data.data);
        } catch (err) {
            console.error('Error loading lot history:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const toggleLotForMerge = (lotId) => {
        if (selectedLotsForMerge.includes(lotId)) {
            setSelectedLotsForMerge(prev => prev.filter(id => id !== lotId));
        } else {
            setSelectedLotsForMerge(prev => [...prev, lotId]);
        }
    };

    const addSplitChild = () => {
        setSplitData({
            ...splitData,
            children: [...splitData.children, { lot_name: '', process_type: 'WASHED', grade: '', weight_kg: 0 }]
        });
    };

    const removeSplitChild = (index) => {
        const newChildren = [...splitData.children];
        newChildren.splice(index, 1);
        setSplitData({ ...splitData, children: newChildren });
    };

    const updateSplitChild = (index, field, value) => {
        const newChildren = [...splitData.children];
        newChildren[index] = { ...newChildren[index], [field]: field === 'weight_kg' ? parseFloat(value) : value };
        setSplitData({ ...splitData, children: newChildren });
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
        const s = status?.toLowerCase() || '';
        if (s.includes('split')) return 'badge-secondary';
        if (s.includes('merged')) return 'badge-secondary';
        if (s.includes('completed') || s.includes('stored') || s.includes('dried')) return 'badge-success';
        if (s.includes('received') || s.includes('created')) return 'badge-warning';
        return 'badge-info';
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Lot Processing</h1>
                    <p className="page-description">Track coffee processing stages, splits, and merges</p>
                </div>
                <div className="header-actions">
                    {selectedLotsForMerge.length >= 2 && (
                        <button onClick={() => setIsMergeModalOpen(true)} className="btn btn-secondary" style={{ marginRight: 'var(--spacing-md)' }}>
                            Merge Selected ({selectedLotsForMerge.length})
                        </button>
                    )}
                    <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
                        + Create Lot
                    </button>
                </div>
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
                        <div key={lot.id} className={`content-card ${selectedLotsForMerge.includes(lot.id) ? 'selected-card' : ''}`} style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {['created', 'in process'].includes(lot.status) && (
                                        <input 
                                            type="checkbox" 
                                            checked={selectedLotsForMerge.includes(lot.id)}
                                            onChange={() => toggleLotForMerge(lot.id)}
                                            style={{ marginRight: 'var(--spacing-md)' }}
                                        />
                                    )}
                                    <div>
                                        <h2 className="card-title">{lot.lotName || lot.id}</h2>
                                        <p style={{ margin: 0, color: 'var(--color-gray-600)', fontSize: '0.875rem' }}>
                                            {lot.processingMethod} - Grade {lot.grade || 'N/A'} - {lot.weight}kg - Status: {lot.status}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                    <span className={`badge ${getStatusBadgeClass(lot.status)}`} style={{ fontSize: '0.875rem' }}>
                                        {lot.status}
                                    </span>
                                    <button onClick={() => viewHistory(lot.id)} className="btn btn-sm btn-outline">History</button>
                                    {['created', 'in process'].includes(lot.status) && (
                                        <button 
                                            onClick={() => {
                                                setSelectedLotForSplit(lot);
                                                setIsSplitModalOpen(true);
                                            }} 
                                            className="btn btn-sm btn-outline"
                                        >
                                            Split
                                        </button>
                                    )}
                                </div>
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
            
            {/* Create New Lot Modal */}
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

            {/* Split Lot Modal */}
            <Modal isOpen={isSplitModalOpen} onClose={() => setIsSplitModalOpen(false)} title={`Split Lot: ${selectedLotForSplit?.lotName}`}>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSplitLot}>
                    <p style={{ marginBottom: 'var(--spacing-md)' }}>Parent Weight: <strong>{selectedLotForSplit?.weight}kg</strong></p>
                    
                    {splitData.children.map((child, index) => (
                        <div key={index} className="split-child-row" style={{ padding: 'var(--spacing-md)', background: 'var(--color-gray-50)', borderRadius: '8px', marginBottom: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                                <strong>Sub-lot {index + 1}</strong>
                                {splitData.children.length > 2 && (
                                    <button type="button" onClick={() => removeSplitChild(index)} className="btn-text" style={{ color: 'var(--color-error)' }}>Remove</button>
                                )}
                            </div>
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        value={child.lot_name} 
                                        onChange={(e) => updateSplitChild(index, 'lot_name', e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Weight (kg)</label>
                                    <input 
                                        type="number" 
                                        className="form-input" 
                                        value={child.weight_kg} 
                                        onChange={(e) => updateSplitChild(index, 'weight_kg', e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Method</label>
                                    <select className="form-select" value={child.process_type} onChange={(e) => updateSplitChild(index, 'process_type', e.target.value)}>
                                        <option value="WASHED">Washed</option>
                                        <option value="HONEY">Honey</option>
                                        <option value="NATURAL">Natural</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Grade</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        value={child.grade} 
                                        onChange={(e) => updateSplitChild(index, 'grade', e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <button type="button" onClick={addSplitChild} className="btn btn-outline" style={{ width: '100%', marginBottom: 'var(--spacing-lg)' }}>
                        + Add Another Sub-lot
                    </button>

                    <div className="actions-group">
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Splitting...' : 'Confirm Split'}
                        </button>
                        <button type="button" onClick={() => setIsSplitModalOpen(false)} className="btn btn-outline">Cancel</button>
                    </div>
                </form>
            </Modal>

            {/* Merge Lots Modal */}
            <Modal isOpen={isMergeModalOpen} onClose={() => setIsMergeModalOpen(false)} title="Merge Selected Lots">
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleMergeLots}>
                    <p style={{ marginBottom: 'var(--spacing-md)' }}>Merging {selectedLotsForMerge.length} lots. Combined weight will be calculated automatically.</p>
                    
                    <div className="form-group">
                        <label className="form-label">New Merged Lot Name</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={mergeData.merged_lot_name} 
                            onChange={(e) => setMergeData({ ...mergeData, merged_lot_name: e.target.value })} 
                            required 
                        />
                    </div>
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label">Process Type</label>
                            <select className="form-select" value={mergeData.process_type} onChange={(e) => setMergeData({ ...mergeData, process_type: e.target.value })}>
                                <option value="WASHED">Washed</option>
                                <option value="HONEY">Honey</option>
                                <option value="NATURAL">Natural</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Grade</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={mergeData.grade} 
                                onChange={(e) => setMergeData({ ...mergeData, grade: e.target.value })} 
                            />
                        </div>
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Merging...' : 'Confirm Merge'}
                        </button>
                        <button type="button" onClick={() => setIsMergeModalOpen(false)} className="btn btn-outline">Cancel</button>
                    </div>
                </form>
            </Modal>

            {/* History Modal */}
            <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="Lot Processing History">
                {historyLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading history...</div>
                ) : lotHistory ? (
                    <div className="history-view">
                        <section style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)' }}>Current Lot</h3>
                            <div className="history-card current">
                                <strong>{lotHistory.current.lot_name}</strong>
                                <span>{lotHistory.current.display_weight || lotHistory.current.weight_kg}kg | {lotHistory.current.status}</span>
                            </div>
                        </section>

                        {lotHistory.parents.length > 0 && (
                            <section style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)' }}>Source (Parents)</h3>
                                {lotHistory.parents.map((p, i) => (
                                    <div key={i} className="history-card parent">
                                        <div>
                                            <strong>{p.parentLot?.lot_name}</strong>
                                            <span style={{ marginLeft: 'var(--spacing-sm)', color: 'var(--color-gray-600)' }}>Transferred {p.weight_transferred}kg (from {p.parentLot?.display_weight || p.parentLot?.weight_kg}kg batch | {p.action})</span>
                                        </div>
                                    </div>
                                ))}
                            </section>
                        )}

                        {lotHistory.children.length > 0 && (
                            <section>
                                <h3 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)' }}>Destination (Children)</h3>
                                {lotHistory.children.map((c, i) => (
                                    <div key={i} className="history-card child">
                                        <div>
                                            <strong>{c.childLot?.lot_name}</strong>
                                            <span style={{ marginLeft: 'var(--spacing-sm)', color: 'var(--color-gray-600)' }}>Received {c.weight_transferred}kg (new weight: {c.childLot?.display_weight || c.childLot?.weight_kg}kg | {c.action})</span>
                                        </div>
                                    </div>
                                ))}
                            </section>
                        )}
                    </div>
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No history found.</div>
                )}
            </Modal>

            <style>{`
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--spacing-xl);
        }

        .header-actions {
            display: flex;
            gap: var(--spacing-md);
        }

        .selected-card {
            border: 2px solid var(--color-primary) !important;
            background: var(--color-primary-light, #f0f7ff) !important;
        }

        .history-card {
            padding: var(--spacing-md);
            border-radius: 8px;
            background: var(--color-gray-50);
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-sm);
            border-left: 4px solid var(--color-gray-300);
        }

        .history-card.current {
            border-left-color: var(--color-primary);
            background: var(--color-white);
            border: 1px solid var(--color-primary);
        }

        .history-card.parent {
            border-left-color: var(--color-warning);
        }

        .history-card.child {
            border-left-color: var(--color-success);
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
