import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Modal from '../../components/common/Modal';

const SeasonManagement = () => {
    const { seasons, setSeasons } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const newSeason = {
            id: `S${String(seasons.length + 1).padStart(3, '0')}`,
            ...formData,
            status: 'inactive',
            totalCherries: 0,
            totalRevenue: 0
        };
        setSeasons([...seasons, newSeason]);
        setIsModalOpen(false);
        setFormData({ name: '', startDate: '', endDate: '' });
    };

    const toggleSeasonStatus = (seasonId) => {
        setSeasons(seasons.map(s => ({
            ...s,
            status: s.id === seasonId ? (s.status === 'active' ? 'closed' : 'active') : s.status === 'active' ? 'closed' : s.status
        })));
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Season Management</h1>
                <p className="page-description">Manage coffee harvesting seasons</p>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <h2 className="card-title">All Seasons</h2>
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                        + Create Season
                    </button>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Season ID</th>
                                <th>Name</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                                <th>Total Cherries (kg)</th>
                                <th>Total Revenue</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {seasons.map(season => (
                                <tr key={season.id}>
                                    <td><strong>{season.id}</strong></td>
                                    <td><strong>{season.name}</strong></td>
                                    <td>{season.startDate}</td>
                                    <td>{season.endDate}</td>
                                    <td>
                                        <span className={`badge ${season.status === 'active' ? 'badge-success' :
                                                season.status === 'closed' ? 'badge-error' :
                                                    'badge-warning'
                                            }`}>
                                            {season.status}
                                        </span>
                                    </td>
                                    <td>{season.totalCherries.toLocaleString()}</td>
                                    <td>RWF {season.totalRevenue.toLocaleString()}</td>
                                    <td>
                                        {season.status !== 'active' && (
                                            <button
                                                onClick={() => toggleSeasonStatus(season.id)}
                                                className="btn btn-secondary"
                                                style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                                            >
                                                Activate
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Season">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Season Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., 2025B"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Start Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">End Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="actions-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                        <button type="submit" className="btn btn-primary">Create Season</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SeasonManagement;
