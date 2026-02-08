import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import '../../App.css';

function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!credentials.username.trim()) {
      newErrors.username = 'Username cannot be empty';
    }
    if (!credentials.password) {
      newErrors.password = 'Password cannot be empty';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      const loginData = {
        username: credentials.username,
        password: credentials.password
      };
      console.log('Login request data:', loginData);
      await login(loginData);
      console.log('Login successful, preparing to redirect...');
      toast.success('Login successful!');
      
      setTimeout(() => {
        navigate('/');
        console.log('Redirected to home page');
      }, 100);
    } catch (error) {
      console.error('Login component error:', error);
      toast.error(error.message);
      if (error.message.includes('Username or password incorrect')) {
        setCredentials(prev => ({ ...prev, password: '' }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>🏦 SecureTrust Bank</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Enter your username"
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="register-link">
          Don't have an account?{' '}
          <Link to="/register">Register Now</Link>
        </div>

        <button
          className="demo-button"
          onClick={() => {
            setCredentials({ username: 'demo', password: 'demo123' });
            setErrors({});
            toast.info('Demo account filled: username demo, password demo123');
          }}
          disabled={loading}
        >
          Use Demo Account
        </button>
      </div>
    </div>
  );
}

export default Login;