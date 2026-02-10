import axios from 'axios';

// Create axios instance with base URL from environment variables
const api = axios.create({
  // Prefer same-origin (works with Vite proxy in dev + single-domain deploy in prod)
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
          if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Let React Router handle navigation
      window.dispatchEvent(new Event('unauthorized'));
    }

      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  registerAdmin: (userData) => api.post('/auth/registerAdmin', userData),
  getProfile: () => api.get('/auth/me'),
};

// Farmers API
export const farmersAPI = {
  getAll: () => api.get('/farmers'),
  getById: (id) => api.get(`/farmers/${id}`),
  create: (data) => api.post('/farmers', data),
  update: (id, data) => api.patch(`/farmers/${id}`, data),
  delete: (id) => api.delete(`/farmers/${id}`),
};

// Lots API
export const lotsAPI = {
  getAll: () => api.get('/lots'),
  getById: (id) => api.get(`/lots/${id}`),
  create: (data) => api.post('/lots', data),
  update: (id, data) => api.put(`/lots/${id}`, data),
};

// Deliveries API
export const deliveriesAPI = {
  getAll: () => api.get('/deliveries'),
  getById: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post('/deliveries', data),
  update: (id, data) => api.put(`/deliveries/${id}`, data),
};

// Seasons API
export const seasonsAPI = {
  getAll: () => api.get('/seasons'),
  getById: (id) => api.get(`/seasons/${id}`),
  create: (data) => api.post('/seasons', data),
  update: (id, data) => api.put(`/seasons/${id}`, data),
  deactivate: (id) => api.patch(`/seasons/${id}/deactivate`),
};

// Assets API
export const assetsAPI = {
  getAll: () => api.get('/assets'),
  getById: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
};

// Expenses API
export const expensesAPI = {
  getAll: () => api.get('/expenses'),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.patch(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// Revenues API
export const revenuesAPI = {
  getAll: () => api.get('/revenues'),
  getById: (id) => api.get(`/revenues/${id}`),
  create: (data) => api.post('/revenues', data),
  update: (id, data) => api.patch(`/revenues/${id}`, data),
  delete: (id) => api.delete(`/revenues/${id}`),
};

// Payments API
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.patch(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
};

// Processing API
export const processingAPI = {
  getAll: () => api.get('/processes'),
  getById: (id) => api.get(`/processes/${id}`),
  create: (data) => api.post('/processes', data),
  update: (id, data) => api.patch(`/processes/${id}`, data),
  delete: (id) => api.delete(`/processes/${id}`),
};

// Storage API
export const storageAPI = {
  getAll: () => api.get('/storage'),
  getById: (id) => api.get(`/storage/${id}`),
  create: (data) => api.post('/storage', data),
  update: (id, data) => api.patch(`/storage/${id}`, data),
  delete: (id) => api.delete(`/storage/${id}`),
};

// Financing API
export const financingAPI = {
  getAll: () => api.get('/finances'),
  getById: (id) => api.get(`/finances/${id}`),
  create: (data) => api.post('/finances', data),
  update: (id, data) => api.put(`/finances/${id}`, data),
  deactivate: (id) => api.patch(`/finances/${id}/deactivate`),
};

// Repayments API
export const repaymentsAPI = {
  getAll: (loanId) => api.get('/repayments', { params: { loan_id: loanId } }),
  getById: (id) => api.get(`/repayments/${id}`),
  create: (data) => api.post('/repayments', data),
};

// Loans Details API
export const loansDetailsAPI = {
  getAll: () => api.get('/loansDetails'),
  getById: (id) => api.get(`/loansDetails/${id}`),
  create: (data) => api.post('/loansDetails', data),
  update: (id, data) => api.put(`/loansDetails/${id}`, data),
};

// Compliance Logs API
export const complianceLogsAPI = {
  getByLot: (lotId) => api.get(`/complianceLogs/lot/${lotId}`),
  create: (data) => api.post('/complianceLogs', data),
};

// Workers API
export const workersAPI = {
  getAll: () => api.get('/worker'),
  getById: (id) => api.get(`/worker/${id}`),
  create: (data) => api.post('/worker', data),
  update: (id, data) => api.put(`/worker/${id}`, data),
  deactivate: (id) => api.patch(`/worker/${id}/deactivate`),
};

// Labor Logs API
export const laborLogsAPI = {
  getAll: () => api.get('/laborLogs'),
  getByWorker: (workerId) => api.get(`/laborLogs/worker/${workerId}`),
  create: (data) => api.post('/laborLogs', data),
};

// Admin Users API
export const adminUsersAPI = {
  getAll: () => api.get('/adminUsers/users'),
  getById: (id) => api.get(`/adminUsers/users/${id}`),
  update: (id, data) => api.put(`/adminUsers/users/${id}`, data),
  delete: (id) => api.delete(`/adminUsers/users/${id}`),
};

// Revolving Credit Account API
export const revolvingCreditAccountAPI = {
  getAll: () => api.get('/revolvingCreditAccount'),
  getById: (id) => api.get(`/revolvingCreditAccount/${id}`),
  create: (data) => api.post('/revolvingCreditAccount', data),
};

// Revolving Credit Transactions API
export const revolvingCreditTransactionsAPI = {
  draw: (data) => api.post('/revolvingCreditTransactions/draw', data),
  repay: (data) => api.post('/revolvingCreditTransactions/repay', data),
};

// Finance Summaries API
export const financeSummariesAPI = {
  getIncomeStatement: (params) => api.get('/financeSummaries/income-statement', { params }),
  getBalanceSheet: (params) => api.get('/financeSummaries/balance-sheet', { params }),
  getCashFlow: (params) => api.get('/financeSummaries/cash-flow', { params }),
};

// Audit Logs API
export const auditLogsAPI = {
  getAll: (params) => api.get('/audit-logs', { params }),
  getById: (id) => api.get(`/audit-logs/${id}`),
  getStats: () => api.get('/audit-logs/stats'),
};

export default api;
