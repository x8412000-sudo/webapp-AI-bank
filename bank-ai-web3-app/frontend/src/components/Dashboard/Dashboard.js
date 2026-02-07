import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [stats, setStats] = useState({
    totalBalance: 12500.00,
    monthlyIncome: 4500.00,
    monthlyExpenses: 2800.00,
    investments: 7500.00
  });

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, description: '工资收入', amount: 4500.00, type: 'income', date: '2024-01-15' },
    { id: 2, description: '房租支付', amount: -1200.00, type: 'expense', date: '2024-01-10' },
    { id: 3, description: '餐饮消费', amount: -350.00, type: 'expense', date: '2024-01-08' },
    { id: 4, description: '股票收益', amount: 850.00, type: 'income', date: '2024-01-05' },
  ]);

  const quickActions = [
    { icon: '💰', label: '快速转账', path: '/transfer', color: '#4299e1' },
    { icon: '🤖', label: 'AI咨询', path: '/ai/chat', color: '#38a169' },
    { icon: '🔗', label: '数字货币', path: '/web3/wallet', color: '#d69e2e' },
    { icon: '📈', label: '投资建议', path: '/ai/advice', color: '#9f7aea' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '30px', color: '#2d3748' }}>🏦 仪表板</h1>
      
      {/* 欢迎信息 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '25px',
        borderRadius: '10px',
        marginBottom: '30px'
      }}>
        <h2>欢迎回来！</h2>
        <p>查看您的财务概览和管理账户</p>
      </div>

      {/* 快速操作 */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#4a5568' }}>🚀 快速操作</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '20px'
        }}>
          {quickActions.map((action, index) => (
            <Link 
              key={index}
              to={action.path}
              style={{
                background: action.color,
                color: 'white',
                padding: '20px',
                borderRadius: '8px',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ fontSize: '30px' }}>{action.icon}</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 统计数据 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { title: '总余额', value: `$${stats.totalBalance.toLocaleString()}`, icon: '💰', color: '#4299e1' },
          { title: '月收入', value: `$${stats.monthlyIncome.toLocaleString()}`, icon: '📥', color: '#38a169' },
          { title: '月支出', value: `$${stats.monthlyExpenses.toLocaleString()}`, icon: '📤', color: '#e53e3e' },
          { title: '总投资', value: `$${stats.investments.toLocaleString()}`, icon: '📈', color: '#d69e2e' },
        ].map((stat, index) => (
          <div 
            key={index}
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              borderLeft: `4px solid ${stat.color}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#718096', marginBottom: '5px' }}>{stat.title}</p>
                <h3 style={{ fontSize: '24px', color: '#2d3748' }}>{stat.value}</h3>
              </div>
              <span style={{ fontSize: '30px' }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 近期交易 */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#2d3748' }}>📋 近期交易</h3>
          <Link to="/transactions" style={{ color: '#4299e1', textDecoration: 'none' }}>
            查看全部 →
          </Link>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#718096' }}>描述</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#718096' }}>金额</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#718096' }}>日期</th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#718096' }}>类型</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(transaction => (
                <tr key={transaction.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>{transaction.description}</td>
                  <td style={{ 
                    padding: '12px',
                    color: transaction.amount >= 0 ? '#38a169' : '#e53e3e',
                    fontWeight: 'bold'
                  }}>
                    {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', color: '#718096' }}>{transaction.date}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: transaction.type === 'income' ? '#c6f6d5' : '#fed7d7',
                      color: transaction.type === 'income' ? '#22543d' : '#742a2a',
                      fontSize: '14px'
                    }}>
                      {transaction.type === 'income' ? '收入' : '支出'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI 提示 */}
      <div style={{
        background: 'linear-gradient(135deg, #68d391 0%, #38a169 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginTop: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '30px' }}>🤖</span>
          <div>
            <h4 style={{ marginBottom: '5px' }}>AI 财务助手建议</h4>
            <p>根据您的消费模式，建议将月收入的 20% 用于储蓄，10% 用于投资。</p>
          </div>
          <Link 
            to="/ai/advice"
            style={{
              marginLeft: 'auto',
              background: 'white',
              color: '#38a169',
              padding: '8px 16px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            获取个性化建议
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;