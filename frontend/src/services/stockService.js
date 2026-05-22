import apiClient from './apiClient';

export const stockService = {
  getAll: () => apiClient.get('/stocks'),
  getLive: () => apiClient.get('/stocks/live'),
  getLiveBySymbol: (symbol) => apiClient.get(`/stocks/live/${encodeURIComponent(symbol)}`),
  getNews: (symbol) => apiClient.get(`/user/stocks/${encodeURIComponent(symbol)}/news`),
  search: (query) => apiClient.get('/stocks/search', { params: { query } }),
  addSamples: () => apiClient.post('/stocks/add-sample'),
};
