import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          toast.error('You do not have permission to perform this action.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(error.response.data?.error || 'An error occurred.');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/api/login', { email, password }),
  
  register: (userData) => 
    api.post('/api/register', userData),
  
  validateToken: () => 
    api.get('/api/validate-token'),
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }
};

// Account API
export const accountAPI = {
  getAccounts: () => 
    api.get('/api/accounts'),
  
  getAccount: (accountId) => 
    api.get(`/api/account/${accountId}`),
  
  createAccount: (accountData) => 
    api.post('/api/create-account', accountData),
  
  getAccountTransactions: (accountId, limit = 50) => 
    api.get(`/api/account/${accountId}/transactions?limit=${limit}`)
};

// Transaction API
export const transactionAPI = {
  transfer: (transferData) => 
    api.post('/api/transfer', transferData),
  
  getTransactions: (limit = 50, offset = 0) => 
    api.get(`/api/transactions?limit=${limit}&offset=${offset}`),
  
  deposit: (depositData) => 
    api.post('/api/deposit', depositData),
  
  withdraw: (withdrawData) => 
    api.post('/api/withdraw', withdrawData)
};

// AI API
export const aiAPI = {
  chat: (message) => 
    api.post('/api/ai/chat', { message }),
  
  getInvestmentAdvice: (params) => 
    api.get('/api/ai/advice', { params }),
  
  analyzeSpending: () => 
    api.get('/api/ai/analyze-spending'),
  
  categorizeTransactions: (transactions) => 
    api.post('/api/ai/categorize', { transactions }),
  
  detectFraud: (transaction) => 
    api.post('/api/ai/detect-fraud', transaction),
  
  getChatSessions: () => 
    api.get('/api/ai/sessions'),
  
  getChatMessages: (sessionId) => 
    api.get(`/api/ai/session/${sessionId}/messages`),
  
  submitFeedback: (interactionId, rating, comment) => 
    api.post('/api/ai/feedback', { interaction_id: interactionId, rating, comment })
};

// Web3 API
export const web3API = {
  createWallet: () => 
    api.post('/api/web3/create-wallet'),
  
  getWallet: () => 
    api.get('/api/web3/wallet'),
  
  transferETH: (toAddress, amount) => 
    api.post('/api/web3/transfer/eth', { to_address: toAddress, amount }),
  
  transferToken: (toAddress, amount, tokenSymbol) => 
    api.post('/api/web3/transfer/token', { 
      to_address: toAddress, 
      amount, 
      token_symbol: tokenSymbol 
    }),
  
  getCryptoTransactions: () => 
    api.get('/api/web3/transactions'),
  
  getCryptoPrices: () => 
    api.get('/api/web3/prices'),
  
  getGasPrice: () => 
    api.get('/api/web3/gas-price'),
  
  getContractInfo: () => 
    api.get('/api/web3/contract-info'),
  
  estimateTransfer: (amount) => 
    api.post('/api/web3/estimate-transfer', { amount })
};

// Support API
export const supportAPI = {
  getFAQ: () => 
    api.get('/api/support/faq'),
  
  submitTicket: (ticketData) => 
    api.post('/api/support/ticket', ticketData),
  
  getTickets: () => 
    api.get('/api/support/tickets')
};

export default api;