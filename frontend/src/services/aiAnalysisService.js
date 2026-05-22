import apiClient from './apiClient';

export const aiAnalysisService = {
  analyzeStock: (symbol) => apiClient.post(`/ai/stocks/${encodeURIComponent(symbol)}/analysis`),
  analyzePortfolio: () => apiClient.post('/ai/portfolio/analysis'),
};
