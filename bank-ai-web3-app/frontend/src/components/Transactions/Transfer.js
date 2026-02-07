import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { transactionAPI, aiAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Transfer = () => {
  const { accounts, updateAccountBalance } = useAuth();
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [fraudCheck, setFraudCheck] = useState(null);
  const [showFraudAlert, setShowFraudAlert] = useState(false);

  const watchAmount = watch('amount');
  const watchFromAccount = watch('fromAccountId');
  const watchToAccount = watch('toAccountNumber');

  useEffect(() => {
    // Check for fraud when amount changes
    if (watchAmount > 1000) {
      checkForFraud();
    }
  }, [watchAmount]);

  const checkForFraud = async () => {
    if (!watchFromAccount || !watchToAccount || !watchAmount) return;

    try {
      const transactionData = {
        fromAccountId: watchFromAccount,
        toAccountNumber: watchToAccount,
        amount: parseFloat(watchAmount),
        description: 'Transfer check'
      };

      const response = await aiAPI.detectFraud(transactionData);
      setFraudCheck(response.data);
      
      if (response.data.fraud_score > 50) {
        setShowFraudAlert(true);
      }
    } catch (error) {
      console.error('Fraud check error:', error);
    }
  };

  const onSubmit = async (data) => {
    if (fraudCheck?.is_fraudulent) {
      toast.error('Transaction flagged as potentially fraudulent. Please contact support.');
      return;
    }

    try {
      setLoading(true);
      
      const transferData = {
        fromAccountId: data.fromAccountId,
        toAccountNumber: data.toAccountNumber,
        amount: parseFloat(data.amount),
        description: data.description || 'Transfer'
      };

      const response = await transactionAPI.transfer(transferData);
      
      if (response.data.message === 'Transfer successful') {
        toast.success('Transfer completed successfully!');
        
        // Update account balance in context
        const fromAccount = accounts.find(acc => acc.id === data.fromAccountId);
        if (fromAccount) {
          updateAccountBalance(fromAccount.id, response.data.newBalance);
        }
        
        reset();
        setFraudCheck(null);
        setShowFraudAlert(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const getAccountBalance = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.balance : 0;
  };

  return (
    <div className="transfer-container">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">
            <i className="fas fa-exchange-alt me-2"></i>
            Make a Transfer
          </h4>
        </div>
        
        <div className="card-body">
          {/* Fraud Alert */}
          {showFraudAlert && fraudCheck && (
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              <h5 className="alert-heading">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Potential Fraud Detected
              </h5>
              <p>Fraud Score: {fraudCheck.fraud_score}/100</p>
              <ul className="mb-0">
                {fraudCheck.alerts.map((alert, index) => (
                  <li key={index}>{alert}</li>
                ))}
              </ul>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowFraudAlert(false)}
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* From Account */}
            <div className="mb-3">
              <label className="form-label">From Account</label>
              <select
                className={`form-select ${errors.fromAccountId ? 'is-invalid' : ''}`}
                {...register('fromAccountId', { required: 'Please select an account' })}
              >
                <option value="">Select Account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.accountName} - {account.accountNumber} (${account.balance.toFixed(2)})
                  </option>
                ))}
              </select>
              {errors.fromAccountId && (
                <div className="invalid-feedback">{errors.fromAccountId.message}</div>
              )}
              {watchFromAccount && (
                <div className="form-text">
                  Available balance: ${getAccountBalance(watchFromAccount).toFixed(2)}
                </div>
              )}
            </div>

            {/* To Account */}
            <div className="mb-3">
              <label className="form-label">To Account Number</label>
              <input
                type="text"
                className={`form-control ${errors.toAccountNumber ? 'is-invalid' : ''}`}
                {...register('toAccountNumber', {
                  required: 'Account number is required',
                  pattern: {
                    value: /^[A-Z0-9]{8,20}$/,
                    message: 'Invalid account number format'
                  }
                })}
                placeholder="Enter recipient account number"
              />
              {errors.toAccountNumber && (
                <div className="invalid-feedback">{errors.toAccountNumber.message}</div>
              )}
            </div>

            {/* Amount */}
            <div className="mb-3">
              <label className="form-label">Amount</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                  {...register('amount', {
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than 0' },
                    max: {
                      value: watchFromAccount ? getAccountBalance(watchFromAccount) : 1000000,
                      message: 'Amount exceeds available balance'
                    }
                  })}
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <div className="invalid-feedback">{errors.amount.message}</div>
              )}
              {fraudCheck && watchAmount > 1000 && (
                <div className={`mt-2 small ${fraudCheck.fraud_score > 70 ? 'text-danger' : fraudCheck.fraud_score > 50 ? 'text-warning' : 'text-success'}`}>
                  <i className="fas fa-shield-alt me-1"></i>
                  Fraud Detection: {fraudCheck.fraud_score}/100
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label">Description (Optional)</label>
              <input
                type="text"
                className="form-control"
                {...register('description')}
                placeholder="What's this transfer for?"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </>
              ) : (
                'Transfer Funds'
              )}
            </button>

            {/* AI Categorization Note */}
            <div className="mt-3 text-center text-muted small">
              <i className="fas fa-robot me-1"></i>
              This transaction will be automatically categorized by AI
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Transfer;