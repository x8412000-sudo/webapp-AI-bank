import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: '#2c3e50',
      color: 'white',
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button 
          onClick={toggleSidebar}
          style={{
            background: 'none',
            border: '1px solid white',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ☰
        </button>
        <h3 style={{ margin: 0 }}>🏦 AI Web3 Bank</h3>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {user && (
          <>
            <span>欢迎, {user.username}</span>
            <button 
              onClick={handleLogout}
              style={{
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              退出
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;