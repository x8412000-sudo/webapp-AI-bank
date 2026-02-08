import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api'; 

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储的登录状态
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (credentials, config = {}) => {
  setLoading(true);
    try {
      console.log('AuthContext 调用登录：', credentials);
      const response = await authAPI.login(credentials, config);
      const data = response.data;

      console.log('AuthContext 收到响应：', data); // 添加这个日志

      if (!data.success) {
        throw new Error(data.error || '登录失败');
      }

      // 保存到 localStorage
      localStorage.setItem('access_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // 更新状态
      setUser(data.user);
      console.log('AuthContext 状态已更新，user:', data.user); // 添加这个日志
      
      return data;
    } catch (error) {
      console.error('AuthContext 登录错误：', error);
      const errorMsg = !error.response 
        ? '无法连接到服务器，请检查后端是否启动！' 
        : error.response.data.error || error.message;
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };


   const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authAPI.register(userData);
      const data = response.data;
      if (!data.success) {
        throw new Error(data.msg || 'Register failed');
      }
      return data;
    } catch (error) {
      throw new Error(error.message || 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}