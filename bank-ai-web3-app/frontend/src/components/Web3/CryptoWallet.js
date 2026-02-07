import React, { useState, useEffect } from 'react';
import Web3Service from '../../services/web3Service';
import { web3API } from '../../services/api';
import { toast } from 'react-toastify';

const CryptoWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState({ eth: 0, usdt: 0 });
  const [loading, setLoading] = useState(true);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferForm, setTransferForm] = useState({
    toAddress: '',
    amount: '',
    currency: 'ETH'
  });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      
      // Get wallet info from backend
      const walletResponse = await web3API.getWallet();
      if (walletResponse.data.has_wallet) {
        setWallet(walletResponse.data.wallet);
        setBalance(walletResponse.data.live_balance);
      }

      // Get transactions
      const txResponse = await web3API.getCryptoTransactions();
      setTransactions(txResponse.data.database_transactions.slice(0, 10));
      
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async () => {
    try {
      setLoading(true);
      const response = await web3API.createWallet();
      setWallet(response.data.wallet);
      toast.success('Wallet created successfully!');
      loadWalletData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferForm.toAddress || !transferForm.amount) {
      toast.error('Please fill all fields');
      return;
    }

    if (parseFloat(transferForm.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    try {
      setTransferLoading(true);
      
      let response;
      if (transferForm.currency === 'ETH') {
        response = await web3API.transferETH(
          transferForm.toAddress,
          parseFloat(transferForm.amount)
        );
      } else {
        response = await web3API.transferToken(
          transferForm.toAddress,
          parseFloat(transferForm.amount),
          transferForm.currency
        );
      }

      if (response.data.message.includes('initiated')) {
        toast.success('Transfer initiated!');
        setTransferForm({ toAddress: '', amount: '', currency: 'ETH' });
        // Reload wallet data
        setTimeout(loadWalletData, 3000);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Transfer failed');
    } finally {
      setTransferLoading(false);
    }
  };

  const connectMetaMask = async () => {
    const result = await Web3Service.connectMetaMask();
    if (result.success) {
      toast.success(`Connected to ${result.shortened}`);
    } else {
      toast.error(result.error);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="crypto-wallet">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>
          <i className="fab fa-ethereum me-2"></i>
          Crypto Wallet
        </h3>
        <div>
          <button
            className="btn btn-outline-primary me-2"
            onClick={connectMetaMask}
          >
            <i className="fab fa-metamask me-1"></i>
            Connect MetaMask
          </button>
          {!wallet && (
            <button className="btn btn-primary" onClick={createWallet}>
              <i className="fas fa-plus me-1"></i>
              Create Wallet
            </button>
          )}
        </div>
      </div>

      {wallet ? (
        <>
          {/* Wallet Info */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card bg-dark text-white">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fas fa-wallet me-2"></i>
                    Wallet Address
                  </h5>
                  <p className="card-text font-monospace">{wallet.walletAddress}</p>
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(wallet.walletAddress);
                      toast.success('Address copied to clipboard');
                    }}
                  >
                    <i className="fas fa-copy me-1"></i>
                    Copy Address
                  </button>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="fas fa-coins me-2"></i>
                    Total Balance
                  </h5>
                  <h2 className="display-4">
                    ${(balance.eth_balance * 1800 + balance.token_balance).toFixed(2)}
                  </h2>
                  <div className="d-flex justify-content-between">
                    <div>
                      <small>ETH</small>
                      <div>{balance.eth_balance?.toFixed(4) || '0.0000'}</div>
                    </div>
                    <div>
                      <small>USDT</small>
                      <div>{balance.token_balance?.toFixed(2) || '0.00'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Form */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-exchange-alt me-2"></i>
                Transfer Crypto
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">To Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="0x..."
                    value={transferForm.toAddress}
                    onChange={(e) => setTransferForm({...transferForm, toAddress: e.target.value})}
                  />
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">Currency</label>
                  <select
                    className="form-select"
                    value={transferForm.currency}
                    onChange={(e) => setTransferForm({...transferForm, currency: e.target.value})}
                  >
                    <option value="ETH">ETH</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">Amount</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0.00"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                      step="0.0001"
                    />
                    <span className="input-group-text">{transferForm.currency}</span>
                  </div>
                </div>
              </div>
              
              <button
                className="btn btn-primary mt-3"
                onClick={handleTransfer}
                disabled={transferLoading}
              >
                {transferLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  'Transfer'
                )}
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-history me-2"></i>
                Recent Transactions
              </h5>
            </div>
            <div className="card-body">
              {transactions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Hash</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx.id}>
                          <td className="font-monospace small">
                            {tx.txHash ? formatAddress(tx.txHash) : 'N/A'}
                          </td>
                          <td>
                            <span className={`badge bg-${tx.currency === 'ETH' ? 'primary' : 'success'}`}>
                              {tx.currency}
                            </span>
                          </td>
                          <td>{tx.amount} {tx.currency}</td>
                          <td>
                            <span className={`badge bg-${tx.status === 'completed' ? 'success' : 'warning'}`}>
                              {tx.status}
                            </span>
                          </td>
                          <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No transactions yet</p>
              )}
            </div>
          </div>
        </>
      ) : (
        /* No Wallet State */
        <div className="text-center py-5">
          <div className="card">
            <div className="card-body py-5">
              <i className="fas fa-wallet fa-4x text-muted mb-4"></i>
              <h4 className="mb-3">No Crypto Wallet</h4>
              <p className="text-muted mb-4">
                Create a secure crypto wallet to start using Web3 features
              </p>
              <button className="btn btn-primary btn-lg" onClick={createWallet}>
                <i className="fas fa-plus me-2"></i>
                Create Your Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoWallet;