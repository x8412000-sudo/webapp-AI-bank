import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../App.css'; // 导入全局CSS

function Dashboard() {
  const [stats, setStats] = useState({
    totalBalance: 12500.00,
    monthlyIncome: 4500.00,
    monthlyExpenses: 2800.00,
    investments: 7500.00
  });

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, description: 'Salary Income', amount: 4500.00, type: 'income', date: '2026-01-15' },
    { id: 2, description: 'Rent Payment', amount: -1200.00, type: 'expense', date: '2026-01-10' },
    { id: 3, description: 'Food & Dining', amount: -350.00, type: 'expense', date: '2026-01-08' },
    { id: 4, description: 'Stock Earnings', amount: 850.00, type: 'income', date: '2026-01-05' },
  ]);

  const quickActions = [
    { icon: '💰', label: 'Quick Transfer', path: '/transfer' },
    { icon: '🤖', label: 'AI Consultation', path: '/ai/chat' },
    { icon: '📈', label: 'Financial Health', path: '/financial-health' },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">🏦 Dashboard</h1>
      
      {/* Welcome Message */}
      <div className="welcome-message">
        <h2>Welcome Back!</h2>
        <p>View your financial overview and manage your account</p>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h3 className="section-title">🚀 Quick Actions</h3>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <Link 
              key={index}
              to={action.path}
              className="action-card"
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        {[
          { title: 'Total Balance', value: `$${stats.totalBalance.toLocaleString()}`, icon: '💰', colorClass: 'stat-blue' },
          { title: 'Monthly Income', value: `$${stats.monthlyIncome.toLocaleString()}`, icon: '📥', colorClass: 'stat-light-blue' },
          { title: 'Monthly Expenses', value: `$${stats.monthlyExpenses.toLocaleString()}`, icon: '📤', colorClass: 'stat-pale-blue' },
          { title: 'Total Investments', value: `$${stats.investments.toLocaleString()}`, icon: '📈', colorClass: 'stat-dark-blue' },
        ].map((stat, index) => (
          <div 
            key={index}
            className={`stat-card ${stat.colorClass}`}
          >
            <div className="stat-content">
              <div>
                <p className="stat-title">{stat.title}</p>
                <h3 className="stat-value">{stat.value}</h3>
              </div>
              <span className="stat-icon">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction Section */}
      <div className="transaction-section">
        {/* Transaction Header & Actions */}
        <div className="transaction-header">
          <h3 className="transaction-title">📋 Transaction History</h3>
          <div className="transaction-actions">
            <Link to="/add" className="btn-add-transaction">
              + Add Transaction
            </Link>
            <Link to="/transactions" className="btn-view-all">
              View All
            </Link>
          </div>
        </div>

        {/* Monthly Transaction Overview */}
        <div className="monthly-summary">
          <div>
            <h4>📊 Monthly Transaction Summary</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <p className="summary-label">Total Income</p>
                <p className="summary-value income">+${stats.monthlyIncome.toFixed(2)}</p>
              </div>
              <div className="summary-item">
                <p className="summary-label">Total Expenses</p>
                <p className="summary-value expense">-${stats.monthlyExpenses.toFixed(2)}</p>
              </div>
              <div className="summary-item">
                <p className="summary-label">Net Gain</p>
                <p className="summary-value net">+${(stats.monthlyIncome - stats.monthlyExpenses).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions Preview */}
        <div>
          <h4 className="recent-title">🔍 Recent Transactions</h4>
          
          {recentTransactions.length === 0 ? (
            // Empty State
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No transactions yet</p>
              <Link to="/add" className="empty-link">
                Add your first transaction now
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th className="table-header">Description</th>
                    <th className="table-header amount-header">Amount</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.slice(0, 4).map(transaction => (
                    <tr key={transaction.id} className="table-row">
                      <td className="description-cell">{transaction.description}</td>
                      <td className={`amount-cell ${transaction.amount >= 0 ? 'income' : 'expense'}`}>
                        {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </td>
                      <td className="date-cell">{formatDate(transaction.date)}</td>
                      <td>
                        <span className={`type-badge ${transaction.type}`}>
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* View All Button (Bottom) */}
          <div className="view-all-container">
            <Link to="/transactions" className="view-all-link">
              View all transactions →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;