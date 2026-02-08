import axios from 'axios';
import { toast } from 'react-toastify';

// 统一API基础路径，通过环境变量配置，兜底为本地开发地址
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 创建axios实例，统一配置请求头和基础路径
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 超时配置，避免请求挂起
});

// 请求拦截器：添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 调试：打印最终请求地址
    console.log('最终请求地址：', config.baseURL + config.url);
    return config;
  },
  (error) => {
    toast.error('Request initialization failed');
    return Promise.reject(error);
  }
);

// 响应拦截器：统一错误处理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('无法连接到服务器，请检查：1.后端是否启动 2.请求地址是否是外网转发地址');
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    switch (status) {
      case 401:
        if (window.location.pathname !== '/login') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          toast.error('登录过期，请重新登录');
          window.location.href = '/login';
        }
        break;
      case 403:
        toast.error('无权限执行此操作');
        break;
      case 404:
        toast.error(data?.error || '接口不存在');
        break;
      case 500:
        toast.error('服务器内部错误');
        break;
      default:
        toast.error(data?.error || `请求失败：${status}`);
    }
    return Promise.reject(error);
  }
);

// 认证API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  validateToken: () => api.get('/api/validate-token'),
  logout: () => api.post('/api/auth/logout')
};
// -------------------------- 账户API --------------------------
export const accountAPI = {
  // 获取所有账户
  getAccounts: () => 
    api.get('/api/accounts'),
  // 获取单个账户
  getAccount: (accountId) => {
    if (!accountId) throw new Error('accountId is required');
    return api.get(`/api/account/${accountId}`);
  },
  // 创建账户
  createAccount: (accountData) => {
    if (!accountData?.userId) throw new Error('userId is required for create account');
    return api.post('/api/accounts', accountData);
  },
  // 获取账户交易
  getAccountTransactions: (accountId, limit = 50) => {
    if (!accountId) throw new Error('accountId is required');
    return api.get(`/api/transactions`, {
      params: { accountId, limit }
    });
  }
};

// -------------------------- 交易API --------------------------
export const transactionAPI = {
  // 转账
  transfer: (transferData) => {
    const { fromAccountId, toAccountId, amount } = transferData;
    if (!fromAccountId || !toAccountId || !amount) {
      throw new Error('fromAccountId, toAccountId and amount are required for transfer');
    }
    return api.post('/api/transfers', transferData);
  },
  // 获取交易列表（支持分页）
  getTransactions: (limit = 50, offset = 0) => 
    api.get('/api/transactions', { params: { limit, offset } }),
  // 存款
  deposit: (depositData) => {
    if (!depositData?.accountId || !depositData?.amount) {
      throw new Error('accountId and amount are required for deposit');
    }
    return api.post('/api/transactions/deposit', depositData);
  },
  // 取款
  withdraw: (withdrawData) => {
    if (!withdrawData?.accountId || !withdrawData?.amount) {
      throw new Error('accountId and amount are required for withdraw');
    }
    return api.post('/api/transactions/withdraw', withdrawData);
  }
};

// -------------------------- AI API --------------------------
export const aiAPI = {
  // AI聊天（修复版）
  chatbot: (message) => aiAPI.chat(message),
  chat: (message) => {
    if (!message?.message) throw new Error('message.message is required');
    return api.post('/api/ai/chat', {
      message: message.message,
      user_id: message.user_id || 'guest'
    });
  },
  
  // AI语音聊天
  chatVoice: (audioFile, message, userId, generateAudio) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    if (message) formData.append('message', message);
    formData.append('user_id', userId || 'guest');
    formData.append('generate_audio', generateAudio ? 'true' : 'false');
    
    return api.post('/api/ai/chat/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // AI图像分析
  chatImage: (imageFile, message, userId) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (message) formData.append('message', message);
    formData.append('user_id', userId || 'guest');
    
    return api.post('/api/ai/chat/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // 获取投资建议
  getInvestmentAdvice: (params) => {
    if (!params?.accountId) throw new Error('accountId is required for investment advice');
    return api.get('/api/ai/advice', { params });
  },
  
  // 支出分析
  analyzeSpending: (accountId) => {
    if (!accountId) throw new Error('accountId is required for spending analysis');
    return api.get('/api/ai/analyze-spending', { params: { accountId } });
  },
  // 交易分类
  categorizeTransactions: (transactions) => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw new Error('transactions must be a non-empty array');
    }
    return api.post('/api/ai/categorize', { transactions });
  },
  // 获取聊天会话
  getChatSessions: () => 
    api.get('/api/chatbot/sessions'),
  // 获取会话消息
  getChatMessages: (sessionId) => {
    if (!sessionId) throw new Error('sessionId is required');
    return api.get(`/api/chatbot/session/${sessionId}/messages`);
  },
  // 提交反馈
  submitFeedback: (interactionId, rating, comment) => {
    if (!interactionId || rating === undefined) {
      throw new Error('interactionId and rating are required for feedback');
    }
    return api.post('/api/chatbot/feedback', { 
      interaction_id: interactionId, 
      rating, 
      comment: comment || '' 
    });
  }
};

// -------------------------- 仪表盘API --------------------------
export const dashboardAPI = {
  // 获取仪表盘核心数据
  getDashboardData: (accountId) => {
    return api.get('/api/dashboard', {
      params: { accountId: accountId || 'all' }
    });
  },
  // 获取账户概览
  getAccountOverview: () => 
    api.get('/api/dashboard/accounts'),
  // 获取最近交易
  getRecentTransactions: (limit = 10) => 
    api.get('/api/dashboard/transactions', { params: { limit } }),
  // 获取支出汇总
  getSpendingSummary: (timeRange = 'month') => 
    api.get('/api/dashboard/spending-summary', { params: { timeRange } })
};

export default api;