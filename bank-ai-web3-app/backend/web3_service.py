from web3 import Web3
from web3.middleware import geth_poa_middleware
import json
import os
from typing import Dict, Optional
from config import Config
import requests
from datetime import datetime

class Web3Service:
    def __init__(self):
        self.web3 = Web3(Web3.HTTPProvider(Config.WEB3_PROVIDER))
        
        # Add middleware for PoA networks
        self.web3.middleware_onion.inject(geth_poa_middleware, layer=0)
        
        # Load contract ABI
        self.contract_address = Config.CONTRACT_ADDRESS
        self.contract_abi = self._load_contract_abi()
        
        if self.contract_address and self.contract_abi:
            self.contract = self.web3.eth.contract(
                address=self.contract_address,
                abi=self.contract_abi
            )
        else:
            self.contract = None
    
    def _load_contract_abi(self) -> Optional[list]:
        """Load contract ABI from file or environment"""
        try:
            # Try to load from environment first
            abi_json = os.environ.get('CONTRACT_ABI')
            if abi_json:
                return json.loads(abi_json)
            
            # Fallback to file
            abi_path = os.path.join(os.path.dirname(__file__), 'smart_contracts', 'TokenBank.json')
            if os.path.exists(abi_path):
                with open(abi_path, 'r') as f:
                    return json.load(f)['abi']
        except:
            pass
        return None
    
    def create_wallet(self) -> Dict:
        """Create a new Ethereum wallet"""
        try:
            account = self.web3.eth.account.create()
            
            return {
                'address': account.address,
                'private_key': account.key.hex(),
                'public_key': '',  # In production, derive from private key
                'status': 'active'
            }
        except Exception as e:
            return {
                'error': f"Failed to create wallet: {str(e)}",
                'status': 'failed'
            }
    
    def get_balance(self, address: str) -> Dict:
        """Get ETH and token balance for an address"""
        try:
            # Get ETH balance
            eth_balance_wei = self.web3.eth.get_balance(address)
            eth_balance = self.web3.from_wei(eth_balance_wei, 'ether')
            
            # Get token balance if contract is available
            token_balance = 0
            if self.contract:
                try:
                    token_balance = self.contract.functions.balanceOf(address).call()
                    token_balance = self.web3.from_wei(token_balance, 'ether')
                except:
                    pass
            
            return {
                'eth_balance': float(eth_balance),
                'token_balance': float(token_balance),
                'address': address,
                'block_number': self.web3.eth.block_number
            }
        except Exception as e:
            return {
                'error': f"Failed to get balance: {str(e)}",
                'eth_balance': 0,
                'token_balance': 0
            }
    
    def transfer_eth(self, from_address: str, private_key: str, 
                    to_address: str, amount: float) -> Dict:
        """Transfer ETH between wallets"""
        try:
            # Convert amount to wei
            amount_wei = self.web3.to_wei(amount, 'ether')
            
            # Get nonce
            nonce = self.web3.eth.get_transaction_count(from_address)
            
            # Get gas price
            gas_price = self.web3.eth.gas_price
            
            # Build transaction
            tx = {
                'nonce': nonce,
                'to': to_address,
                'value': amount_wei,
                'gas': 21000,
                'gasPrice': gas_price,
                'chainId': self.web3.eth.chain_id
            }
            
            # Estimate gas
            try:
                tx['gas'] = self.web3.eth.estimate_gas(tx)
            except:
                pass
            
            # Sign transaction
            signed_tx = self.web3.eth.account.sign_transaction(tx, private_key)
            
            # Send transaction
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.raw_transaction)
            
            # Wait for receipt
            receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                'tx_hash': tx_hash.hex(),
                'status': receipt.status,
                'block_number': receipt.blockNumber,
                'gas_used': receipt.gasUsed,
                'transaction_fee': float(self.web3.from_wei(receipt.gasUsed * gas_price, 'ether')),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'error': f"Transfer failed: {str(e)}",
                'status': 'failed'
            }
    
    def transfer_tokens(self, from_address: str, private_key: str,
                       to_address: str, amount: float) -> Dict:
        """Transfer custom tokens"""
        try:
            if not self.contract:
                return {'error': 'Contract not initialized', 'status': 'failed'}
            
            # Convert amount to wei (assuming 18 decimals)
            amount_wei = self.web3.to_wei(amount, 'ether')
            
            # Build transaction
            tx = self.contract.functions.transfer(
                to_address,
                amount_wei
            ).build_transaction({
                'from': from_address,
                'nonce': self.web3.eth.get_transaction_count(from_address),
                'gas': 100000,
                'gasPrice': self.web3.eth.gas_price
            })
            
            # Sign and send
            signed_tx = self.web3.eth.account.sign_transaction(tx, private_key)
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.raw_transaction)
            
            # Wait for receipt
            receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                'tx_hash': tx_hash.hex(),
                'status': receipt.status,
                'block_number': receipt.blockNumber,
                'gas_used': receipt.gasUsed
            }
        except Exception as e:
            return {
                'error': f"Token transfer failed: {str(e)}",
                'status': 'failed'
            }
    
    def get_transaction_history(self, address: str, limit: int = 50) -> list:
        """Get transaction history for an address"""
        try:
            # This is a simplified version
            # In production, use Etherscan API or similar
            transactions = []
            
            # Get latest block
            latest_block = self.web3.eth.block_number
            
            # Scan recent blocks (simplified - in reality use indexer)
            for i in range(max(0, latest_block - 1000), latest_block + 1):
                block = self.web3.eth.get_block(i, full_transactions=True)
                for tx in block.transactions:
                    if tx['from'] == address or tx.get('to') == address:
                        transactions.append({
                            'hash': tx.hash.hex(),
                            'from': tx['from'],
                            'to': tx.get('to', ''),
                            'value': float(self.web3.from_wei(tx['value'], 'ether')),
                            'block_number': i,
                            'timestamp': datetime.fromtimestamp(block.timestamp).isoformat()
                        })
                
                if len(transactions) >= limit:
                    break
            
            return transactions[:limit]
        except Exception as e:
            print(f"Error getting transaction history: {e}")
            return []
    
    def get_crypto_prices(self) -> Dict:
        """Get current cryptocurrency prices"""
        try:
            # Using CoinGecko API
            response = requests.get(
                'https://api.coingecko.com/api/v3/simple/price',
                params={
                    'ids': 'bitcoin,ethereum,tether',
                    'vs_currencies': 'usd',
                    'include_24hr_change': 'true'
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'bitcoin': data.get('bitcoin', {}),
                    'ethereum': data.get('ethereum', {}),
                    'tether': data.get('tether', {})
                }
            else:
                return {}
        except:
            # Fallback prices
            return {
                'bitcoin': {'usd': 45000, 'usd_24h_change': 2.5},
                'ethereum': {'usd': 3000, 'usd_24h_change': 1.8},
                'tether': {'usd': 1.0, 'usd_24h_change': 0.0}
            }

# Initialize singleton instance
web3_service = Web3Service()