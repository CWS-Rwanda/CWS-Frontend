import React, { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';
import { processingAPI } from '../../services/api';

const DryingLogs = () => {
    const { lots } = useData();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedLot, setSelectedLot] = useState('');
    const [expandedNotes, setExpandedNotes] = useState(new Set());

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await processingAPI.getAll();
                const allLogs = res?.data?.data || [];
                const drying = allLogs.filter((log) => log.stage === 'DRYING TABLES');
                setLogs(drying);
            } catch (err) {
                console.error('Error loading drying logs:', err);
                setError(err.message || 'Failed to load drying logs.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const lotById = (id) => lots.find((l) => l.id === id);

    const toggleNoteExpansion = (logId) => {
        const newExpanded = new Set(expandedNotes);
        if (newExpanded.has(logId)) {
            newExpanded.delete(logId);
        } else {
            newExpanded.add(logId);
        }
        setExpandedNotes(newExpanded);
    };

    const formatNotes = (notes) => {
        if (!notes) return '-';
        return notes.split('.').filter(sentence => sentence.trim()).join('. ');
    };

    const visibleLogs = selectedLot ? logs.filter((l) => l.lot_id === selectedLot) : logs;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Drying Monitor Records</h1>
                <p className="page-description">History of drying table checks recorded by operators</p>
            </div>

            <div className="content-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="card-header">
                    <h2 className="card-title">Filters</h2>
                </div>
                <div className="form-group" style={{ maxWidth: 320 }}>
                    <label className="form-label">Filter by Lot</label>
                    <select
                        className="form-select"
                        value={selectedLot}
                        onChange={(e) => setSelectedLot(e.target.value)}
                    >
                        <option value="">All lots</option>
                        {lots.map((lot) => (
                            <option key={lot.id} value={lot.id}>
                                {lot.lotName || lot.id} • {lot.processingMethod}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Drying Logs</h2>
                </div>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading drying logs...</div>
                ) : error ? (
                    <div className="alert alert-error" style={{ margin: 'var(--spacing-md)' }}>
                        {error}
                    </div>
                ) : visibleLogs.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>No drying logs found.</div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Lot</th>
                                    <th>Stage</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleLogs.map((log) => {
                                    const lot = lotById(log.lot_id);
                                    const date = log.start_time?.split('T')[0] || '';
                                    const time = log.start_time
                                        ? new Date(log.start_time).toLocaleTimeString('en-GB', {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                          })
                                        : '';
                                    return (
                                        <tr key={log.id}>
                                            <td>{date}</td>
                                            <td>{time}</td>
                                            <td>
                                                <strong>{lot?.lotName || lot?.id || log.lot_id}</strong>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-600)' }}>
                                                    {lot?.processingMethod} • Grade {lot?.grade || 'N/A'}
                                                </div>
                                            </td>
                                            <td>{log.stage}</td>
                                            <td>
                                                <div style={{ maxWidth: 400 }}>
                                                    <div 
                                                        style={{ 
                                                            cursor: 'pointer',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            backgroundColor: expandedNotes.has(log.id) ? '#f0f9ff' : 'transparent',
                                                            border: expandedNotes.has(log.id) ? '1px solid #0ea5e9' : '1px solid transparent',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onClick={() => toggleNoteExpansion(log.id)}
                                                        title={expandedNotes.has(log.id) ? 'Click to collapse' : 'Click to expand'}
                                                    >
                                                        <div style={{ 
                                                            whiteSpace: expandedNotes.has(log.id) ? 'normal' : 'nowrap',
                                                            overflow: expandedNotes.has(log.id) ? 'visible' : 'hidden',
                                                            textOverflow: expandedNotes.has(log.id) ? 'clip' : 'ellipsis',
                                                            fontSize: '0.85rem',
                                                            lineHeight: '1.4'
                                                        }}>
                                                            {formatNotes(log.notes)}
                                                        </div>
                                                        {log.notes && log.notes.length > 50 && (
                                                            <div style={{ 
                                                                fontSize: '0.75rem', 
                                                                color: '#0ea5e9',
                                                                marginTop: '2px',
                                                                fontWeight: '500'
                                                            }}>
                                                                {expandedNotes.has(log.id) ? '▲ Show less' : '▼ Show more'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
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

export default DryingLogs;

