import React, { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';
import { complianceLogsAPI } from '../../services/api';

const LotApproval = () => {
    const { lots, setLots } = useData();
    const [scoresByLot, setScoresByLot] = useState({});
    const [isLoadingScores, setIsLoadingScores] = useState(false);

    useEffect(() => {
        const loadScores = async () => {
            if (!lots || lots.length === 0) {
                setScoresByLot({});
                return;
            }

            setIsLoadingScores(true);
            try {
                const results = await Promise.all(
                    lots.map(async (lot) => {
                        try {
                            const res = await complianceLogsAPI.getByLot(lot.id);
                            const logs = res?.data?.data || [];

                            const latestOfType = (type) => {
                                const filtered = logs.filter((l) => l.type === type);
                                if (filtered.length === 0) return null;
                                return filtered.sort(
                                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                                )[0];
                            };

                            const latestCPQI = latestOfType('CPQI');
                            const latestCPSI = latestOfType('CPSI');

                            return {
                                lotId: lot.id,
                                qualityScore: latestCPQI ? Number(latestCPQI.score || 0) : 0,
                                sustainabilityScore: latestCPSI ? Number(latestCPSI.score || 0) : 0,
                            };
                        } catch (e) {
                            console.error('Failed to load compliance logs for lot', lot.id, e);
                            return {
                                lotId: lot.id,
                                qualityScore: 0,
                                sustainabilityScore: 0,
                            };
                        }
                    })
                );

                const map = {};
                results.forEach((r) => {
                    if (!r) return;
                    map[r.lotId] = {
                        qualityScore: r.qualityScore,
                        sustainabilityScore: r.sustainabilityScore,
                    };
                });
                setScoresByLot(map);
            } finally {
                setIsLoadingScores(false);
            }
        };

        loadScores();
    }, [lots]);

    const getScores = (lotId) => {
        return scoresByLot[lotId] || { qualityScore: 0, sustainabilityScore: 0 };
    };

    const handleApproval = (lotId, approved) => {
        setLots(lots.map(lot =>
            lot.id === lotId ? { ...lot, approved } : lot
        ));
        alert(`Lot ${lotId} ${approved ? 'approved' : 'rejected'}`);
    };

    const pendingLots = lots.filter(l => !l.approved);
    const approvedLots = lots.filter(l => l.approved);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Lot Approval</h1>
                <p className="page-description">
                    Quality & sustainability gate for lot approval
                </p>
            </div>

            {isLoadingScores && (
                <div style={{ padding: '0.5rem 0', color: 'var(--color-gray-600)', fontSize: '0.875rem' }}>
                    Loading sustainability & quality scores from compliance logs...
                </div>
            )}

            {pendingLots.length > 0 && (
                <div className="content-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div className="card-header">
                        <h2 className="card-title">Pending Approval</h2>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Lot ID</th>
                                    <th>Processing Method</th>
                                    <th>Grade</th>
                                    <th>Weight (kg)</th>
                                    <th>Quality Score (CPQI)</th>
                                    <th>Sustainability Score (CPSI)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingLots.map(lot => {
                                    const { qualityScore, sustainabilityScore } = getScores(lot.id);
                                    return (
                                    <tr key={lot.id}>
                                        <td><strong>{lot.id}</strong></td>
                                        <td>{lot.processingMethod}</td>
                                        <td>Grade {lot.grade}</td>
                                        <td>{lot.totalWeight}</td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    qualityScore >= 85
                                                        ? 'badge-success'
                                                        : qualityScore > 0
                                                        ? 'badge-warning'
                                                        : 'badge-neutral'
                                                }`}
                                            >
                                                {qualityScore.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    sustainabilityScore >= 85
                                                        ? 'badge-success'
                                                        : sustainabilityScore > 0
                                                        ? 'badge-warning'
                                                        : 'badge-neutral'
                                                }`}
                                            >
                                                {sustainabilityScore.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-group">
                                                <button
                                                    onClick={() => handleApproval(lot.id, true)}
                                                    className="btn btn-secondary"
                                                    style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    onClick={() => handleApproval(lot.id, false)}
                                                    className="btn btn-outline"
                                                    style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                                                >
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">Approved Lots</h2>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Lot ID</th>
                                <th>Processing Method</th>
                                <th>Grade</th>
                                <th>Weight (kg)</th>
                                <th>Quality Score (CPQI)</th>
                                <th>Sustainability Score (CPSI)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {approvedLots.map(lot => {
                                const { qualityScore, sustainabilityScore } = getScores(lot.id);
                                return (
                                <tr key={lot.id}>
                                    <td><strong>{lot.id}</strong></td>
                                    <td>{lot.processingMethod}</td>
                                    <td>Grade {lot.grade}</td>
                                    <td>{lot.totalWeight}</td>
                                    <td>{qualityScore.toFixed(1)}%</td>
                                    <td>{sustainabilityScore.toFixed(1)}%</td>
                                    <td>
                                        <span className="badge badge-success">✓ Approved</span>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LotApproval;
