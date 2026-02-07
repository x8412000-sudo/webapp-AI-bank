import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar({ isOpen }) {
  if (!isOpen) return null;

  const menuItems = [
    { path: '/', icon: '📊', label: '仪表板' },
    { path: '/accounts', icon: '💰', label: '账户' },
    { path: '/transfer', icon: '↔️', label: '转账' },
    { path: '/transactions', icon: '📋', label: '交易记录' },
    { path: '/ai/chat', icon: '🤖', label: 'AI助手' },
    { path: '/ai/advice', icon: '💡', label: '投资建议' },
    { path: '/web3/wallet', icon: '🔗', label: '数字货币钱包' },
    { path: '/support/chat', icon: '💬', label: '在线客服' },
    { path: '/support/faq', icon: '❓', label: '常见问题' },
  ];

  return (
    <div style={{
      width: '250px',
      background: '#34495e',
      color: 'white',
      height: 'calc(100vh - 70px)',
      position: 'fixed',
      left: 0,
      top: '70px',
      padding: '20px 0'
    }}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {menuItems.map((item, index) => (
          <li key={index} style={{ marginBottom: '5px' }}>
            <Link
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 20px',
                color: 'white',
                textDecoration: 'none',
                fontSize: '16px'
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;