// frontend/src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// ============ 登录组件 ============
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('please input username and password');
      return;
    }

    setIsLoading(true);
    
    // 模拟 API 调用
    setTimeout(() => {
      if (username === 'demo' && password === 'demo123') {
        localStorage.setItem('access_token', 'demo_token');
        localStorage.setItem('user', JSON.stringify({
          username: username,
          email: 'demo@ai-bank.com',
          joinDate: '2024-01-01'
        }));
        toast.success('successful');
        window.location.href = '/';
      } else {
        toast.error('username or password is incorrect');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🏦 AI Web3 Bank</h1>
          <p className="auth-subtitle">intellegent bank management system</p>
        </div>
        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>username</label>
            <input
              type="text"
              placeholder="please input username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>password</label>
            <input
              type="password"
              placeholder="please input password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-btn primary-btn"
            disabled={isLoading}
          >
            {isLoading ? 'logging...' : '登录'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            no account?{' '}
            <Link to="/register" className="auth-link">
              to register 
            </Link>
          </p>
          
          <button
            onClick={() => {
              setUsername('demo');
              setPassword('demo123');
              toast.info('已填充演示账号，点击登录即可');
            }}
            className="demo-btn"
          >
            使用演示账号
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ 注册组件 ============
const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'username can not be blank';
    } else if (formData.username.length < 3) {
      newErrors.username = 'at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'email can not be blank';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'email has wrong format';
    }
    
    if (!formData.password) {
      newErrors.password = 'password can not be blank';
    } else if (formData.password.length < 6) {
      newErrors.password = 'at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'passwords are inconsistent';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'please accept service terms';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 清除当前字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('please check if fillings are correct');
      return;
    }
    
    setIsLoading(true);
    
    // 模拟注册 API 调用
    setTimeout(() => {
      // 模拟成功注册
      const newUser = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        joinDate: new Date().toISOString().split('T')[0],
        accounts: [
          { type: 'checking', balance: 1000.00, currency: 'USD' },
          { type: 'savings', balance: 5000.00, currency: 'USD' }
        ]
      };
      
      localStorage.setItem('access_token', 'new_user_token');
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success('Register is successful！Welcome to AI Web3 Bank 🎉');
      setIsLoading(false);
      
      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }, 1500);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>📝 create account</h1>
          <p className="auth-subtitle">have experiences with AI + Web3</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {/* 用户名 */}
          <div className="form-group">
            <label>username *</label>
            <input
              type="text"
              name="username"
              placeholder="please enter username"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          {/* 邮箱 */}
          <div className="form-group">
            <label>email *</label>
            <input
              type="email"
              name="email"
              placeholder="please enter email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* 手机号 */}
          <div className="form-group">
            <label>mobile</label>
            <input
              type="tel"
              name="phone"
              placeholder="please enter mobile number"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {/* 密码 */}
          <div className="form-group">
            <label>password *</label>
            <input
              type="password"
              name="password"
              placeholder="please enter password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* 确认密码 */}
          <div className="form-group">
            <label>confirm password *</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="please enter password again"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          {/* terms agreement */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span>I have read and accepted</span>
              <a href="#terms" className="terms-link">service terms</a>
              <span>和</span>
              <a href="#privacy" className="terms-link">privacy policies</a>
            </label>
            {errors.agreeTerms && <span className="error-text">{errors.agreeTerms}</span>}
          </div>

          <button 
            type="submit" 
            className="auth-btn primary-btn"
            disabled={isLoading}
          >
            {isLoading ? 'registering...' : 'register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            already have an account？{' '}
            <Link to="/login" className="auth-link">
              log in
            </Link>
          </p>
          
          <div className="welcome-bonus">
            <div className="bonus-icon">🎁</div>
            <div className="bonus-content">
              <strong>bonus for new users</strong>
              <p> $100  + AI financial analysis report</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ 其他组件保持不变 ============
const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <div className="dashboard-container">
      <h1>🏦 welcome back，{user.username || 'user'}！</h1>
      <p className="welcome-message">This is your AI Web3 bank panel</p>
      
      <div className="stats-grid">
        <div className="stat-card primary">
          <h3>💳 account overview</h3>
          <p className="stat-value">$12,500.00</p>
          <p className="stat-label">total balance</p>
        </div>
        <div className="stat-card success">
          <h3>📈 investment account</h3>
          <p className="stat-value">$7,500.00</p>
          <p className="stat-label">investment balance</p>
        </div>
        <div className="stat-card warning">
          <h3>🔗 cryptocurrency</h3>
          <p className="stat-value">1.5 ETH</p>
          <p className="stat-label">≈ $3,750.00</p>
        </div>
      </div>

      <div className="quick-actions">
        <h2>🚀 quick actions</h2>
        <div className="action-buttons">
          <button
            onClick={() => toast.info('AI assistant is being developed')}
            className="action-btn ai-btn"
          >
            <span className="btn-icon">🤖</span>
            AI assistant
          </button>
          <button
            onClick={() => window.location.href = '/transfer'}
            className="action-btn transfer-btn"
          >
            <span className="btn-icon">💰</span>
            quick transfer
          </button>
          <button
            onClick={() => toast.info('Web3 wallet is being connected...')}
            className="action-btn wallet-btn"
          >
            <span className="btn-icon">🔗</span>
            crptocurrency wallet
          </button>
        </div>
      </div>
    </div>
  );
};

const Transfer = () => {
  return (
    <div className="page-container">
      <h1>💰 transfer</h1>
      <p>transfer is being developed...</p>
      <button
        onClick={() => window.location.href = '/'}
        className="back-btn"
      >
        return home
      </button>
    </div>
  );
};

const Chatbot = () => {
  return (
    <div className="page-container">
      <h1>🤖 AI assistant</h1>
      <p>AI chat bot is being developed...</p>
    </div>
  );
};

const CryptoWallet = () => {
  return (
    <div className="page-container">
      <h1>🔗 cryptowallet</h1>
      <p>Web3 wallet is still being developed...</p>
    </div>
  );
};

// 私有路由包装器
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" />;
};

// 主 App 组件
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    toast.success('already successfully logged out');
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="app-container">
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          theme="colored"
        />
        
        {/* 导航栏 */}
        <nav className="navbar">
          <div className="nav-left">
            <h3 className="nav-logo">🏦 AI Web3 Bank</h3>
          </div>
          <div className="nav-right">
            {isLoggedIn ? (
              <>
                <span className="welcome-text">
                  welcome，{JSON.parse(localStorage.getItem('user') || '{}').username || '用户'}
                </span>
                <button
                  onClick={handleLogout}
                  className="logout-btn"
                >
                  exit 
                </button>
              </>
            ) : (
              <Link to="/login" className="login-link">
                login / register
              </Link>
            )}
          </div>
        </nav>

        {/* 路由 */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/transfer" element={
            <PrivateRoute>
              <Transfer />
            </PrivateRoute>
          } />
          
          <Route path="/ai/chat" element={
            <PrivateRoute>
              <Chatbot />
            </PrivateRoute>
          } />
          
          <Route path="/web3/wallet" element={
            <PrivateRoute>
              <CryptoWallet />
            </PrivateRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* 页脚 */}
        <footer className="footer">
          <div className="footer-content">
            <p>© 2026 AI Web3 Bank - intelligent bank system</p>
            <div className="footer-links">
              <a href="#terms">service terms</a>
              <a href="#privacy">privacy policy</a>
              <a href="#contact">contact us</a>
              <a href="#help">help</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;