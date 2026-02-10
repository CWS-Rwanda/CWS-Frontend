import React, { useState } from 'react';
import { farmersAPI } from '../../services/api';
import { useData } from '../../context/DataContext';
import Modal from '../common/Modal';
import './AddFarmerForm.css';

const AddFarmerForm = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    sector: '',
    district: '',
    province: '',
    idNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const { fetchFarmers } = useData(); // Changed from refreshData to fetchFarmers

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
        // Format phone number to Rwanda format if it exists
        let formattedPhone = formData.phone;
        if (formData.phone) {
            // Remove any non-digit characters
            const digits = formData.phone.replace(/\D/g, '');
            // If it starts with 0, replace with +250
            if (digits.startsWith('0')) {
                formattedPhone = `+250${digits.substring(1)}`;
            } 
            // If it starts with 250, add the +
            else if (digits.startsWith('250')) {
                formattedPhone = `+${digits}`;
            }
            // If it's already in +250 format, leave as is
            else if (digits.startsWith('+250')) {
                formattedPhone = digits;
            }
            // Otherwise, assume it's a local number and add +250
            else {
                formattedPhone = `+250${digits}`;
            }
        }

        const formDataToSend = {
            name: formData.name,
            phone_number: formattedPhone || null,  // Will be null if no phone provided
            location: formData.sector ? {
                cell: formData.sector,
                sector: formData.sector,
                district: formData.district,
                province: formData.province
            } : null,
            active: true
        };

        const response = await farmersAPI.create(formDataToSend);
        await fetchFarmers();
        onSuccess('Farmer added successfully!');
        onClose();
    } catch (err) {
        console.error('Error adding farmer:', err);
        setError(err.response?.data?.message || 'Failed to add farmer. Please try again.');
    } finally {
        setIsSubmitting(false);
    }
};

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Farmer">
      <form onSubmit={handleSubmit} className="add-farmer-form">
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., 0781234567 or +250781234567"
          />
          <small className="text-muted">Enter a Rwanda phone number (e.g., 0781234567 or +250781234567)</small>
      </div>

        <div className="form-row">
          <div className="form-group">
            <label>Sector *</label>
            <input
              type="text"
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>District</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Province</label>
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>ID/Passport Number</label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              className="form-control"
            />
          </div>
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
            {isSubmitting ? 'Adding...' : 'Add Farmer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddFarmerForm;
