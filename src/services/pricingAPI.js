import api from './api';

export const pricingAPI = {
    // Get current active pricing
    getCurrent: () => api.get('/pricing/current'),
    
    // Get pricing history
    getHistory: (params = {}) => api.get('/pricing', { params }),
    
    // Create new pricing
    create: (data) => api.post('/pricing', data),
    
    // Update pricing
    update: (id, data) => api.put(`/pricing/${id}`, data)
};
