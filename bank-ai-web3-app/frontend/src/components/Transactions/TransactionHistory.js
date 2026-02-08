import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../App.css';

const TransactionHistory = () => {
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // 加载交易记录
  useEffect(() => {
    try {
      const loadTransactions = () => {
        setLoading(true);
        setTimeout(() => {
          const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
          setTransactions(savedTransactions);
          setFilteredTransactions(savedTransactions);
          setLoading(false);
        }, 500);
      };
      loadTransactions();
    } catch (error) {
      toast.error('Failed to load transaction history');
      setLoading(false);
    }
  }, []);

  // 搜索过滤
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTransactions(transactions);
      return;
    }
    const filtered = transactions.filter(transaction => {
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.from?.toLowerCase().includes(searchLower) ||
        transaction.to?.toLowerCase().includes(searchLower) ||
        transaction.description?.toLowerCase().includes(searchLower) ||
        transaction.amount?.toString().includes(searchLower) ||
        transaction.date?.includes(searchLower) ||
        transaction.status?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);

  // 删除单条记录
  const handleDelete = (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const updatedTransactions = transactions.filter(tx => tx.id !== transactionId);
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedTransactions);
      toast.success('Transaction deleted successfully');
    }
  };

  // 清空所有记录
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all transactions?')) {
      localStorage.removeItem('transactions');
      setTransactions([]);
      setFilteredTransactions([]);
      toast.success('All transactions cleared');
    }
  };

  // 格式化金额
  const formatAmount = (amount) => {
    const formatted = Math.abs(parseFloat(amount)).toFixed(2);
    return amount >= 0 ? `+$${formatted}` : `-$${formatted}`;
  };

  // 获取状态样式
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'status-success';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-default';
    }
  };

  // 获取交易类型样式
  const getAmountClass = (amount) => {
    return amount >= 0 ? 'amount-income' : 'amount-expense';
  };

  return (
    <div className="transaction-history">
      <div className="transaction-header">
        <h1 className="page-title">
          <i className="fas fa-history"></i> Transaction History
        </h1>
        <p className="page-subtitle">View and manage all your financial transactions</p>
      </div>

      {/* 操作按钮 */}
      <div className="action-buttons">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/')}
        >
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>
        <div className="action-group">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/transfer')}
          >
            <i className="fas fa-exchange-alt"></i> New Transfer
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/add')}
          >
            <i className="fas fa-plus"></i> Add Transaction
          </button>
          {transactions.length > 0 && (
            <button
              className="btn btn-error"
              onClick={handleClearAll}
            >
              <i className="fas fa-trash"></i> Clear All
            </button>
          )}
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="search-section">
        <div className="search-container">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search transactions (description, amount, date...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* 交易列表 */}
      <div className="transactions-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-receipt"></i>
            </div>
            <h3>No transactions found</h3>
            <p>Your transaction history will appear here after your first transaction</p>
            <div className="empty-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/transfer')}
              >
                <i className="fas fa-exchange-alt"></i> Make a Transfer
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/add')}
              >
                <i className="fas fa-plus"></i> Add Transaction
              </button>
            </div>
          </div>
        ) : (
          <div className="transactions-list">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>From/To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr key={transaction.id} className={index % 2 === 0 ? 'even-row' : ''}>
                    <td className="date-cell">
                      <div className="transaction-date">{transaction.date}</div>
                      <div className="transaction-time">{transaction.time}</div>
                    </td>
                    <td className="description-cell">
                      <div className="transaction-description">{transaction.description}</div>
                      {transaction.category && (
                        <span className="transaction-category">{transaction.category}</span>
                      )}
                    </td>
                    <td className={`amount-cell ${getAmountClass(transaction.amount)}`}>
                      {formatAmount(transaction.amount)}
                    </td>
                    <td className="account-cell">
                      <div className="from-account">
                        <span className="account-label">From:</span>
                        <span className="account-number">{transaction.from}</span>
                      </div>
                      <div className="to-account">
                        <span className="account-label">To:</span>
                        <span className="account-number">{transaction.to}</span>
                      </div>
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${getStatusClass(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(transaction.id)}
                        title="Delete transaction"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      {filteredTransactions.length > 0 && (
        <div className="transactions-summary">
          <div className="summary-item">
            <span className="summary-label">Total Transactions:</span>
            <span className="summary-value">{filteredTransactions.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Income:</span>
            <span className="summary-value income">
              ${filteredTransactions
                .filter(t => t.amount > 0)
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Expenses:</span>
            <span className="summary-value expense">
              ${Math.abs(filteredTransactions
                .filter(t => t.amount < 0)
                .reduce((sum, t) => sum + t.amount, 0))
                .toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;