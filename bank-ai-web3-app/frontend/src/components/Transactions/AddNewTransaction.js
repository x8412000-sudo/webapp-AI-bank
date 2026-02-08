import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../App.css';

const AddNewTransaction = () => {
  const navigate = useNavigate();
  
  // 表单状态管理
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense', // 默认支出
    date: new Date().toISOString().split('T')[0],
    category: ''
  });
  
  // 表单验证状态
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 分类选项
  const categories = [
    'Food & Dining',
    'Rent & Utilities', 
    'Salary',
    'Investments',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Education',
    'Other'
  ];

  // 输入框变更处理
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 清除对应字段的验证错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors = {};
    
    // 验证描述
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // 验证金额
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    // 验证分类
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 模拟接口调用
  const addTransactionAPI = async (transactionData) => {
    // 模拟接口延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      data: {
        id: Date.now().toString(),
        ...transactionData,
        date: transactionData.date || new Date().toISOString().split('T')[0],
        status: 'Success'
      },
      message: "Transaction added successfully"
    };
  };

  // 表单提交处理
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 先验证表单
    const isValid = validateForm();
    if (!isValid) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // 处理金额符号（支出为负，收入为正）
      const processedAmount = formData.type === 'expense' 
        ? -Math.abs(parseFloat(formData.amount)) 
        : Math.abs(parseFloat(formData.amount));

      // 准备交易数据
      const transactionData = {
        ...formData,
        amount: processedAmount,
        from: formData.type === 'income' ? 'External Source' : 'Personal Account',
        to: formData.type === 'income' ? 'Personal Account' : 'External Payee',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // 调用添加交易接口
      const response = await addTransactionAPI(transactionData);

      if (response.success) {
        // 保存到 localStorage
        const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        existingTransactions.unshift(response.data);
        localStorage.setItem('transactions', JSON.stringify(existingTransactions));
        
        toast.success('Transaction added successfully!');
        
        // 重置表单
        setFormData({
          description: '',
          amount: '',
          type: 'expense',
          date: new Date().toISOString().split('T')[0],
          category: ''
        });
        
        // 2秒后跳转到交易列表页
        setTimeout(() => {
          navigate('/transactions');
        }, 2000);
      } else {
        toast.error('Failed to add transaction');
      }
    } catch (error) {
      toast.error('An error occurred while adding the transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-transaction">
      <div className="transaction-header">
        <h1 className="page-title">
          <i className="fas fa-plus-circle"></i> Add New Transaction
        </h1>
        <p className="page-subtitle">Record your income and expenses</p>
      </div>

      <div className="action-buttons">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/transactions')}
          disabled={isSubmitting}
        >
          <i className="fas fa-arrow-left"></i> Back to Transactions
        </button>
      </div>

      <form onSubmit={handleSubmit} className="transaction-form">
        {/* 交易描述 */}
        <div className="form-group">
          <label className="form-label">
            Description <span className="required">*</span>
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g. Grocery Shopping, Salary Deposit, Netflix Subscription"
            className={`form-input ${errors.description ? 'input-error' : ''}`}
            disabled={isSubmitting}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        {/* 交易金额 */}
        <div className="form-group">
          <label className="form-label">
            Amount (USD) <span className="required">*</span>
          </label>
          <div className="amount-container">
            <span className="currency-symbol">$</span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className={`amount-input ${errors.amount ? 'input-error' : ''}`}
              disabled={isSubmitting}
            />
          </div>
          {errors.amount && <span className="error-text">{errors.amount}</span>}
          <small className="form-hint">Enter amount as positive number only</small>
        </div>

        {/* 交易类型（收入/支出） */}
        <div className="form-group">
          <label className="form-label">
            Transaction Type <span className="required">*</span>
          </label>
          <div className="radio-group">
            <label className={`radio-label ${formData.type === 'income' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="type"
                value="income"
                checked={formData.type === 'income'}
                onChange={handleChange}
                className="radio-input"
                disabled={isSubmitting}
              />
              <div className="radio-custom">
                <i className="fas fa-arrow-down"></i>
              </div>
              <span className="radio-text">Income</span>
              <p className="radio-description">Money coming in (salary, refunds, etc.)</p>
            </label>
            <label className={`radio-label ${formData.type === 'expense' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="type"
                value="expense"
                checked={formData.type === 'expense'}
                onChange={handleChange}
                className="radio-input"
                disabled={isSubmitting}
              />
              <div className="radio-custom">
                <i className="fas fa-arrow-up"></i>
              </div>
              <span className="radio-text">Expense</span>
              <p className="radio-description">Money going out (bills, shopping, etc.)</p>
            </label>
          </div>
        </div>

        {/* 交易分类 */}
        <div className="form-group">
          <label className="form-label">
            Category <span className="required">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`form-select ${errors.category ? 'input-error' : ''}`}
            disabled={isSubmitting}
          >
            <option value="">Select a category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <span className="error-text">{errors.category}</span>}
        </div>

        {/* 交易日期 */}
        <div className="form-group">
          <label className="form-label">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-input"
            disabled={isSubmitting}
          />
        </div>

        {/* 提交按钮 */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/transactions')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Adding...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i> Add Transaction
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewTransaction;