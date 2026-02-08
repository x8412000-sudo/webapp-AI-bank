import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../App.css'; // 引入共用样式

const Transfer = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // 初始化账户数据
  useEffect(() => {
    const userAccounts = [
      { id: 'acc001', name: 'Savings Account', balance: 5000.00, number: '****1234' },
      { id: 'acc002', name: 'Checking Account', balance: 1500.00, number: '****5678' },
      { id: 'acc003', name: 'Investment Account', balance: 10000.00, number: '****9012' }
    ];
    
    setAccounts(userAccounts);
    setFormData(prev => ({ ...prev, fromAccount: userAccounts[0].id }));
  }, []);
  
  // 处理输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // 验证表单
  const validateForm = () => {
    if (!formData.fromAccount) {
      toast.error('Please select a sending account');
      return false;
    }
    
    if (!formData.toAccount.trim()) {
      toast.error('Please enter the recipient account number');
      return false;
    }
    
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }
    
    // 验证金额格式
    if (amount > 10000) {
      toast.error('Single transaction limit is $10,000');
      return false;
    }
    
    const selectedAccount = accounts.find(acc => acc.id === formData.fromAccount);
    if (amount > selectedAccount.balance) {
      toast.error('Insufficient balance');
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter a transfer description');
      return false;
    }
    
    return true;
  };
  
  // 预览转账
  const handlePreview = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setShowConfirm(true);
    }
  };
  
  // 确认转账
  const handleConfirm = async () => {
    setLoading(true);
    
    setTimeout(() => {
      const selectedAccount = accounts.find(acc => acc.id === formData.fromAccount);
      
      const transaction = {
        id: 'tx_' + Date.now(),
        from: selectedAccount?.number,
        to: formData.toAccount,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Success',
        type: 'transfer'
      };
      
      // 保存到 localStorage
      const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      existingTransactions.unshift(transaction);
      localStorage.setItem('transactions', JSON.stringify(existingTransactions));
      
      // 更新账户余额（模拟）
      const updatedAccounts = accounts.map(acc => {
        if (acc.id === formData.fromAccount) {
          return {
            ...acc,
            balance: acc.balance - parseFloat(formData.amount)
          };
        }
        return acc;
      });
      setAccounts(updatedAccounts);
      
      setLoading(false);
      setShowConfirm(false);
      
      toast.success(`Transfer successful! $${formData.amount} sent.`);
      
      // 重置表单
      setFormData({
        fromAccount: formData.fromAccount,
        toAccount: '',
        amount: '',
        description: ''
      });
      
      // 2秒后跳转到交易记录页
      setTimeout(() => navigate('/transactions'), 2000);
    }, 1000);
  };
  
  // 获取选中账户余额
  const getSelectedBalance = () => {
    const account = accounts.find(acc => acc.id === formData.fromAccount);
    return account ? account.balance : 0;
  };
  
  // 快捷金额设置
  const handleQuickAmount = (amount) => {
    setFormData(prev => ({ ...prev, amount: amount.toString() }));
  };
  
  // 取消转账
  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="transfer-container">
      <div className="transfer-header">
        <h1 className="page-title">💰 Transfer Funds</h1>
        <p className="page-subtitle">Secure and instant money transfer</p>
      </div>
      
      <form onSubmit={handlePreview} className="transfer-form">
        {/* 转出账户 */}
        <div className="form-group">
          <label className="form-label">
            From Account <span className="required">*</span>
          </label>
          <select
            name="fromAccount"
            value={formData.fromAccount}
            onChange={handleChange}
            className="form-select"
            disabled={loading}
          >
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.number}) - ${account.balance.toLocaleString()}
              </option>
            ))}
          </select>
          {formData.fromAccount && (
            <div className="balance-info">
              Available Balance: <strong>${getSelectedBalance().toLocaleString()}</strong>
            </div>
          )}
        </div>
        
        {/* 收款账户 */}
        <div className="form-group">
          <label className="form-label">
            To Account <span className="required">*</span>
          </label>
          <input
            type="text"
            name="toAccount"
            value={formData.toAccount}
            onChange={handleChange}
            placeholder="Enter recipient account number (e.g., ****7890)"
            className="form-input"
            disabled={loading}
          />
          <small className="form-hint">Account number should be 10-16 digits</small>
        </div>
        
        {/* 转账金额 */}
        <div className="form-group">
          <label className="form-label">
            Transfer Amount (USD) <span className="required">*</span>
          </label>
          <div className="amount-container">
            <span className="currency-symbol">$</span>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="amount-input"
              disabled={loading}
            />
          </div>
          
          {/* 快捷金额按钮 */}
          <div className="quick-amounts">
            {[100, 500, 1000, 5000].map(amount => (
              <button
                key={amount}
                type="button"
                onClick={() => handleQuickAmount(amount)}
                className="quick-amount-btn"
                disabled={loading}
              >
                ${amount.toLocaleString()}
              </button>
            ))}
          </div>
          <small className="form-hint">Single transaction limit: $10,000</small>
        </div>
        
        {/* 转账说明 */}
        <div className="form-group">
          <label className="form-label">
            Transfer Description <span className="required">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter purpose of transfer (e.g., Rent payment, Loan repayment)"
            className="form-textarea"
            rows="3"
            disabled={loading}
          />
        </div>
        
        {/* 操作按钮 */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Preview Transfer'}
          </button>
        </div>
      </form>
      
      {/* 确认对话框 */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">Confirm Transfer</h3>
            
            <div className="confirm-details">
              <div className="detail-row">
                <span className="detail-label">From Account:</span>
                <strong className="detail-value">
                  {accounts.find(acc => acc.id === formData.fromAccount)?.name}
                </strong>
              </div>
              <div className="detail-row">
                <span className="detail-label">To Account:</span>
                <strong className="detail-value">{formData.toAccount}</strong>
              </div>
              <div className="detail-row">
                <span className="detail-label">Amount:</span>
                <strong className="detail-amount">${formData.amount}</strong>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{formData.description}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Fee:</span>
                <span className="detail-value fee">$0.00 (Free Transfer)</span>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 转账提示 */}
      <div className="transfer-tips">
        <h4 className="tips-title">
          <i className="fas fa-lightbulb"></i> Transfer Tips
        </h4>
        <ul className="tips-list">
          <li className="tips-item">
            <i className="fas fa-clock"></i>
            <span>Processing Time: <strong>Instant</strong> for internal transfers</span>
          </li>
          <li className="tips-item">
            <i className="fas fa-dollar-sign"></i>
            <span>Transfer Fee: <strong>$0.00</strong> (No fees for internal transfers)</span>
          </li>
          <li className="tips-item">
            <i className="fas fa-chart-line"></i>
            <span>Single Transaction Limit: <strong>$10,000</strong></span>
          </li>
          <li className="tips-item">
            <i className="fas fa-calendar-day"></i>
            <span>Daily Transfer Limit: <strong>$50,000</strong></span>
          </li>
          <li className="tips-item">
            <i className="fas fa-shield-alt"></i>
            <span>Security: All transfers are <strong>256-bit encrypted</strong></span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Transfer;