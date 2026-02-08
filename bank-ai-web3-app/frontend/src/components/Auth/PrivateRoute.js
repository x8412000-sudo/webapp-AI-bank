import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // 调试日志
  console.log('PrivateRoute 检查：', { user, loading });

  // 加载中状态
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录，重定向到登录页
  if (!user) {
    console.log('PrivateRoute: 未登录，重定向到登录页');
    return <Navigate to="/login" replace />;
  }

  // 已登录，渲染子组件
  console.log('PrivateRoute: 已登录，渲染子组件');
  return children;
}

export default PrivateRoute;