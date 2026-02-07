import React from 'react';
import { Link } from 'react-router-dom';

function Register() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          📝 注册账户
        </h2>
        
        <div style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          <p>注册功能正在开发中...</p>
          <p>当前版本请使用演示账号登录</p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link 
            to="/login" 
            style={{
              display: 'inline-block',
              padding: '12px 30px',
              background: '#4299e1',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          >
            返回登录
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;