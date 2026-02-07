import React from 'react';

function Footer() {
  return (
    <footer style={{
      background: '#2c3e50',
      color: 'white',
      textAlign: 'center',
      padding: '20px',
      marginTop: 'auto'
    }}>
      <p>© 2024 AI Web3 Bank - 结合人工智能与区块链技术的智能银行系统</p>
      <p style={{ fontSize: '14px', marginTop: '5px', opacity: 0.8 }}>
        这是一个教学演示项目，所有数据均为模拟数据
      </p>
    </footer>
  );
}

export default Footer;