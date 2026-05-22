import apiClient from './apiClient';

export const walletService = {
  get: () => apiClient.get('/wallet'),
  deposit: ({ amount, description }) => apiClient.post('/wallet/deposit', { amount, description }),
  withdraw: ({ amount, description }) => apiClient.post('/wallet/withdraw', { amount, description }),
};
