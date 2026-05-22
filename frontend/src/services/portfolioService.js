import apiClient from './apiClient';

export const portfolioService = {
  getMine: () => apiClient.get('/portfolio/me'),
  getByEmail: (email) => apiClient.get(`/portfolio/${encodeURIComponent(email)}`),
};
