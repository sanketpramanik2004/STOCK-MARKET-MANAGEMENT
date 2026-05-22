import apiClient from './apiClient';

export const marketService = {
  getAnalysis: () => apiClient.get('/market/analysis'),
};
