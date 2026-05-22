import apiClient from './apiClient';

export const tradingService = {
  buy: (payload) => apiClient.post('/trading/buy', payload),
  sell: (payload) => apiClient.post('/trading/sell', payload),
};
