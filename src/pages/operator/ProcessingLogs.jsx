import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

const ProcessingLogs = () => {
    const { lots, setLots } = useData();
    const [selectedLot, setSelectedLot] = useState('');
    const [stage, setStage] = useState('');

    const stages = ['received', 'pulped', 'fermented', 'washed', 'dried', 'stored'];

    const handleAddLog = (e) => {
        e.preventDefault();

        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        setLots(lots.map(lot => {
            if (lot.id === selectedLot) {
                return {
                    ...lot,
                    status: stage,
                    timeline: [
                        ...lot.timeline,
                        { stage, date, time, operator: 'Processing Operator' }
                    ]
                };
            }
            return lot;
        }));

        alert(`Processing log added: ${selectedLot} - ${stage}`);
        setSelectedLot('');
        setStage('');
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

                <form onSubmit={handleAddLog}>
                    <div className="form-group">
                        <label className="form-label required">Select Lot</label>
                        <select
                            className="form-select"
                            value={selectedLot}
                            onChange={(e) => setSelectedLot(e.target.value)}
                            required
                        >
                            <option value="">-- Select Lot --</option>
                            {lots.filter(l => l.status !== 'dispatched').map(lot => (
                                <option key={lot.id} value={lot.id}>
                                    {lot.id} - Current: {lot.status}
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
                        >
                            <option value="">-- Select Stage --</option>
                            {stages.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Add Log Entry
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProcessingLogs;
