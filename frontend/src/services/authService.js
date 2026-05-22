import apiClient from './apiClient';

export const authService = {
  login: (payload) => apiClient.post('/auth/login', payload),
  googleLogin: (credential) => apiClient.post('/auth/google', { credential }),
  googleConfig: () => apiClient.get('/auth/google-config'),
  register: (payload) => apiClient.post('/auth/register', payload),
  me: () => apiClient.get('/auth/me'),
};
