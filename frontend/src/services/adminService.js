import apiClient from './apiClient';

export const adminService = {
  getUsers: () => apiClient.get('/admin/users'),
  getTransactions: () => apiClient.get('/admin/transactions'),
  getStocks: () => apiClient.get('/admin/stocks'),
  addStock: (payload) => apiClient.post('/admin/stocks', payload),
  seedThirtyStocks: () => apiClient.post('/admin/stocks/seed-30'),
  updateStock: (id, payload) => apiClient.put(`/admin/stocks/${id}`, payload),
  updateStockPrice: (id, price) => apiClient.patch(`/admin/stocks/${id}/price`, { price }),
  deleteStock: (id) => apiClient.delete(`/admin/stocks/${id}`),
};
