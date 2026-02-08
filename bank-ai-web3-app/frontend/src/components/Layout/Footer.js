import React from 'react';
import '../../App.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>SecureTrust Bank</h4>
          <p>AI-Powered Financial Services</p>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Customer Support: 1-800-BANK-AI</p>
          <p>Email: support@securetrust.com</p>
        </div>
        
        <div className="footer-section">
          <h4>Legal</h4>
          <a href="/privacy" className="footer-link">Privacy Policy</a>
          <a href="/terms" className="footer-link">Terms of Service</a>
          <a href="/security" className="footer-link">Security</a>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>
          © {currentYear} SecureTrust Bank - All Rights Reserved
        </p>
        <p className="disclaimer">
          This is a demonstration project. All data is simulated for educational purposes.
        </p>
      </div>
    </footer>
  );
}

export default Footer;