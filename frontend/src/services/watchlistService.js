import apiClient from './apiClient';

export const watchlistService = {
  getAll: () => apiClient.get('/watchlist'),
  add: (stockSymbol) => apiClient.post('/watchlist', { stockSymbol }),
  remove: (stockSymbol) => apiClient.delete(`/watchlist/${encodeURIComponent(stockSymbol)}`),
};
