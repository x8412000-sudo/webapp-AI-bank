export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
  JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', code: 'CNY' }
};

export const ACCOUNT_TYPES = {
  CHECKING: { value: 'checking', label: 'Checking Account', icon: 'fa-wallet' },
  SAVINGS: { value: 'savings', label: 'Savings Account', icon: 'fa-piggy-bank' },
  INVESTMENT: { value: 'investment', label: 'Investment Account', icon: 'fa-chart-line' },
  CRYPTO: { value: 'crypto', label: 'Crypto Wallet', icon: 'fa-bitcoin-sign' }
};

export const TRANSACTION_TYPES = {
  DEPOSIT: { value: 'deposit', label: 'Deposit', color: 'success', icon: 'fa-arrow-down' },
  WITHDRAWAL: { value: 'withdrawal', label: 'Withdrawal', color: 'danger', icon: 'fa-arrow-up' },
  TRANSFER: { value: 'transfer', label: 'Transfer', color: 'primary', icon: 'fa-exchange-alt' },
  PAYMENT: { value: 'payment', label: 'Payment', color: 'warning', icon: 'fa-credit-card' }
};

export const TRANSACTION_CATEGORIES = [
  { value: 'groceries', label: 'Groceries', icon: 'fa-shopping-cart', color: '#4CAF50' },
  { value: 'dining', label: 'Dining', icon: 'fa-utensils', color: '#FF9800' },
  { value: 'transportation', label: 'Transportation', icon: 'fa-car', color: '#2196F3' },
  { value: 'shopping', label: 'Shopping', icon: 'fa-shopping-bag', color: '#E91E63' },
  { value: 'entertainment', label: 'Entertainment', icon: 'fa-film', color: '#9C27B0' },
  { value: 'bills', label: 'Bills', icon: 'fa-file-invoice-dollar', color: '#FF5722' },
  { value: 'healthcare', label: 'Healthcare', icon: 'fa-heartbeat', color: '#F44336' },
  { value: 'education', label: 'Education', icon: 'fa-graduation-cap', color: '#3F51B5' },
  { value: 'salary', label: 'Salary', icon: 'fa-money-check-alt', color: '#00BCD4' },
  { value: 'investment', label: 'Investment', icon: 'fa-chart-line', color: '#009688' },
  { value: 'crypto', label: 'Crypto', icon: 'fa-bitcoin', color: '#FFC107' },
  { value: 'other', label: 'Other', icon: 'fa-ellipsis-h', color: '#9E9E9E' }
];

export const RISK_LEVELS = [
  { value: 'low', label: 'Low Risk', description: 'Conservative, steady growth', color: 'success' },
  { value: 'medium', label: 'Medium Risk', description: 'Balanced growth and risk', color: 'warning' },
  { value: 'high', label: 'High Risk', description: 'Aggressive growth potential', color: 'danger' }
];

export const INVESTMENT_GOALS = [
  { value: 'retirement', label: 'Retirement', timeframe: '15+ years' },
  { value: 'education', label: 'Education Fund', timeframe: '5-10 years' },
  { value: 'house', label: 'Buy a House', timeframe: '3-7 years' },
  { value: 'growth', label: 'Wealth Growth', timeframe: '5+ years' },
  { value: 'income', label: 'Passive Income', timeframe: '1+ years' }
];

export const CRYPTO_CURRENCIES = [
  { symbol: 'BTC', name: 'Bitcoin', icon: 'fa-bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'fa-ethereum' },
  { symbol: 'USDT', name: 'Tether', icon: 'fa-dollar-sign' },
  { symbol: 'BNB', name: 'Binance Coin', icon: 'fa-coins' },
  { symbol: 'XRP', name: 'Ripple', icon: 'fa-bolt' },
  { symbol: 'ADA', name: 'Cardano', icon: 'fa-leaf' }
];

export const NETWORKS = {
  1: { name: 'Ethereum Mainnet', testnet: false },
  5: { name: 'Goerli Testnet', testnet: true },
  11155111: { name: 'Sepolia Testnet', testnet: true },
  137: { name: 'Polygon Mainnet', testnet: false },
  80001: { name: 'Mumbai Testnet', testnet: true }
};

export const GAS_SPEEDS = {
  slow: { label: 'Slow', description: '~10-30 min', multiplier: 0.9 },
  standard: { label: 'Standard', description: '~3-5 min', multiplier: 1 },
  fast: { label: 'Fast', description: '~1-2 min', multiplier: 1.1 },
  urgent: { label: 'Urgent', description: '<1 min', multiplier: 1.25 }
};

export const AI_FEATURES = [
  { id: 'chatbot', name: 'AI Assistant', description: '24/7 banking support', icon: 'fa-robot' },
  { id: 'advice', name: 'Investment Advice', description: 'Personalized recommendations', icon: 'fa-chart-line' },
  { id: 'fraud', name: 'Fraud Detection', description: 'Real-time security monitoring', icon: 'fa-shield-alt' },
  { id: 'analysis', name: 'Spending Analysis', description: 'Smart categorization', icon: 'fa-chart-pie' },
  { id: 'budget', name: 'Budget Planning', description: 'AI-powered budgeting', icon: 'fa-coins' }
];

export const WEB3_FEATURES = [
  { id: 'wallet', name: 'Crypto Wallet', description: 'Multi-currency support', icon: 'fa-wallet' },
  { id: 'transfer', name: 'Crypto Transfer', description: 'Fast blockchain transfers', icon: 'fa-exchange-alt' },
  { id: 'staking', name: 'Token Staking', description: 'Earn interest on crypto', icon: 'fa-money-bill-trend-up' },
  { id: 'nft', name: 'NFT Marketplace', description: 'Digital asset trading', icon: 'fa-images' },
  { id: 'defi', name: 'DeFi Integration', description: 'Decentralized finance', icon: 'fa-university' }
];

// Color theme
export const THEME_COLORS = {
  primary: '#4f46e5',
  secondary: '#7c3aed',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  dark: '#1f2937',
  light: '#f9fafb'
};

// Formatting helpers
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateString, format = 'medium') => {
  const date = new Date(dateString);
  const options = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' }
  };
  
  return date.toLocaleDateString('en-US', options[format] || options.medium);
};

export const formatCrypto = (amount, decimals = 6) => {
  return parseFloat(amount).toFixed(decimals);
};

export const generateAccountNumber = () => {
  return `DTB${Math.floor(100000000 + Math.random() * 900000000)}`;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return re.test(password);
};

export default {
  API_BASE_URL,
  CURRENCIES,
  ACCOUNT_TYPES,
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
  RISK_LEVELS,
  INVESTMENT_GOALS,
  CRYPTO_CURRENCIES,
  NETWORKS,
  GAS_SPEEDS,
  AI_FEATURES,
  WEB3_FEATURES,
  THEME_COLORS,
  formatCurrency,
  formatDate,
  formatCrypto,
  generateAccountNumber,
  validateEmail,
  validatePassword
};