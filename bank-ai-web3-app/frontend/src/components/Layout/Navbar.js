import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button 
          onClick={toggleSidebar}
          className="sidebar-toggle"
          aria-label="Toggle sidebar"
        >
          <i className="fas fa-bars"></i>
        </button>
        <h3 className="navbar-brand">
          <i className="fas fa-university"></i> SecureTrust Bank
        </h3>
      </div>
      
      <div className="navbar-right">
        {user && (
          <>
            <div className="user-info">
              <i className="fas fa-user-circle"></i>
              <span className="username">{user.username}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="logout-button"
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;