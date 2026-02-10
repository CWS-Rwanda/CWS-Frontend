// src/components/lots/AddLotForm.jsx
import React, { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';
import Modal from '../common/Modal';
import './AddLotForm.css';
import { lotsAPI } from '../../services/api';

const AddLotForm = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        lot_name: '',
        process_type: 'WASHED', // Default to WASHED as per backend
        status: 'CREATED', // Default status
        season_id: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { fetchLots, seasons } = useData();

    const activeSeasons = seasons.filter(season => season.active === true);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Ensure season_id is a number
            const dataToSend = {
                ...formData,
                season_id: formData.season_id,
            };
            console.log("Data to send: ",dataToSend);
            await lotsAPI.create(dataToSend);
            await fetchLots();
            onSuccess('Lot created successfully!');
            onClose();
        } catch (err) {
            console.error('Error creating lot:', err);
            setError(err.response?.data?.message || 'Failed to create lot. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Lot">
            <form onSubmit={handleSubmit} className="add-lot-form">
                {error && <div className="alert alert-danger">{error}</div>}
                
                <div className="form-group">
                    <label>Lot Name *</label>
                    <input
                        type="text"
                        name="lot_name"
                        value={formData.lot_name}
                        onChange={handleChange}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Process Type *</label>
                        <select
                            name="process_type"
                            value={formData.process_type}
                            onChange={handleChange}
                            required
                            className="form-control"
                        >
                            <option value="WASHED">Washed</option>
                            <option value="NATURAL">Natural</option>
                            <option value="HONEY">Honey</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Status *</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                            className="form-control"
                        >
                            <option value="CREATED">Created</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Season</label>
                    <select
                        name="season_id"
                        value={formData.season_id}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="">Select a season</option>
                        {seasons.map(season => (
                            <option key={season.id} value={season.id}>
                                {season.name} ({season?.start_date?.split('T')[0]} - {season.end_date ? season.end_date.split('T')[0] : 'Ongoing'})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="form-control"
                        rows="3"
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Lot'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddLotForm;