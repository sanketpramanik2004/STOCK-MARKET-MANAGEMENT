import apiClient from './apiClient';

export const transactionService = {
  getMine: () => apiClient.get('/transactions/me'),
  getByEmail: (email) => apiClient.get(`/transactions/${encodeURIComponent(email)}`),
};
