import Web3 from 'web3';
import { web3API } from './api';

class Web3Service {
  constructor() {
    this.web3 = null;
    this.account = null;
    this.contract = null;
    this.provider = process.env.REACT_APP_WEB3_PROVIDER;
    this.contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    this.initWeb3();
  }

  async initWeb3() {
    try {
      // Check if MetaMask is installed
      if (window.ethereum) {
        this.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        
        // Get accounts
        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];
        
        // Load contract if address is available
        if (this.contractAddress) {
          await this.loadContract();
        }
        
        return true;
      } else {
        console.warn('MetaMask not detected. Using read-only mode.');
        this.web3 = new Web3(this.provider);
        return false;
      }
    } catch (error) {
      console.error('Error initializing Web3:', error);
      this.web3 = new Web3(this.provider);
      return false;
    }
  }

  async loadContract() {
    try {
      // In production, load ABI from your backend or IPFS
      const contractABI = []; // Add your contract ABI here
      
      if (contractABI.length > 0) {
        this.contract = new this.web3.eth.Contract(contractABI, this.contractAddress);
      }
    } catch (error) {
      console.error('Error loading contract:', error);
    }
  }

  async getBalance(address) {
    try {
      const response = await web3API.getWallet();
      return response.data.live_balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      return { eth_balance: 0, token_balance: 0 };
    }
  }

  async createWallet() {
    try {
      const response = await web3API.createWallet();
      return response.data;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  async transferETH(toAddress, amount) {
    try {
      const response = await web3API.transferETH(toAddress, amount);
      return response.data;
    } catch (error) {
      console.error('Error transferring ETH:', error);
      throw error;
    }
  }

  async transferToken(toAddress, amount, tokenSymbol = 'USDT') {
    try {
      const response = await web3API.transferToken(toAddress, amount, tokenSymbol);
      return response.data;
    } catch (error) {
      console.error('Error transferring token:', error);
      throw error;
    }
  }

  async getCryptoPrices() {
    try {
      const response = await web3API.getCryptoPrices();
      return response.data.prices;
    } catch (error) {
      console.error('Error getting crypto prices:', error);
      // Return mock data for development
      return {
        bitcoin: { usd: 45000, usd_24h_change: 2.5 },
        ethereum: { usd: 3000, usd_24h_change: 1.8 },
        tether: { usd: 1.0, usd_24h_change: 0.0 }
      };
    }
  }

  async getGasPrice() {
    try {
      const response = await web3API.getGasPrice();
      return response.data;
    } catch (error) {
      console.error('Error getting gas price:', error);
      return {
        gas_price_gwei: 30.5,
        gas_price_eth: 0.0000000305
      };
    }
  }

  async estimateTransfer(amount) {
    try {
      const response = await web3API.estimateTransfer(amount);
      return response.data.estimation;
    } catch (error) {
      console.error('Error estimating transfer:', error);
      throw error;
    }
  }

  async getTransactionHistory() {
    try {
      const response = await web3API.getCryptoTransactions();
      return response.data;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return { database_transactions: [], blockchain_transactions: [] };
    }
  }

  // Utility functions
  formatETH(wei) {
    if (!this.web3) return '0';
    return this.web3.utils.fromWei(wei, 'ether');
  }

  formatGwei(wei) {
    if (!this.web3) return '0';
    return this.web3.utils.fromWei(wei, 'gwei');
  }

  toWei(eth) {
    if (!this.web3) return '0';
    return this.web3.utils.toWei(eth.toString(), 'ether');
  }

  shortenAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  isValidAddress(address) {
    if (!this.web3) return false;
    return this.web3.utils.isAddress(address);
  }

  // Connect to MetaMask
  async connectMetaMask() {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to connect.');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await this.web3.eth.getAccounts();
      this.account = accounts[0];
      
      return {
        success: true,
        account: this.account,
        shortened: this.shortenAddress(this.account)
      };
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get network info
  async getNetworkInfo() {
    try {
      if (!this.web3) return null;
      
      const networkId = await this.web3.eth.net.getId();
      const networkName = this.getNetworkName(networkId);
      
      return {
        id: networkId,
        name: networkName,
        isMainnet: networkId === 1,
        isTestnet: networkId === 5 || networkId === 11155111 // Goerli or Sepolia
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return null;
    }
  }

  getNetworkName(networkId) {
    const networks = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
      80001: 'Mumbai Testnet'
    };
    return networks[networkId] || `Unknown Network (${networkId})`;
  }
}

export default new Web3Service();