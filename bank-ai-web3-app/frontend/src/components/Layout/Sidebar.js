import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../App.css';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  
  const menuItems = [
    { path: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/accounts', icon: 'fas fa-wallet', label: 'Accounts' },
    { path: '/transfer', icon: 'fas fa-exchange-alt', label: 'Transfer' },
    { path: '/transactions', icon: 'fas fa-history', label: 'Transactions' },
    { path: '/ai/chat', icon: 'fas fa-robot', label: 'AI Assistant' },
    { path: '/financial-health', icon: 'fas fa-heartbeat', label: 'Financial Health' },
    { path: '/settings', icon: 'fas fa-cog', label: 'Settings' },
  ];

  return (
    <>
      {/* 侧边栏遮罩层 (移动端) */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="sidebar-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <ul className="sidebar-menu">
          {menuItems.map((item, index) => (
            <li key={index} className="menu-item">
              <Link
                to={item.path}
                className={`menu-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <i className={item.icon}></i>
                <span className="menu-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="sidebar-footer">
          <p className="bank-info">
            <i className="fas fa-shield-alt"></i>
            <span>Bank-grade Security</span>
          </p>
          <p className="support">
            <i className="fas fa-headset"></i>
            <span>24/7 Support</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Sidebar;