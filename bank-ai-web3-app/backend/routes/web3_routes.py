from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid
from ..models import db, User, CryptoWallet, CryptoTransaction
from ..web3_service import web3_service
import json

web3_bp = Blueprint('web3', __name__)

@web3_bp.route('/api/web3/create-wallet', methods=['POST'])
@jwt_required()
def create_wallet():
    """Create a new crypto wallet for user"""
    try:
        user_id = get_jwt_identity()
        
        # Check if user already has a wallet
        existing_wallet = CryptoWallet.query.filter_by(
            user_id=user_id,
            is_active=True
        ).first()
        
        if existing_wallet:
            return jsonify({
                'message': 'User already has a wallet',
                'wallet': existing_wallet.to_dict()
            }), 200
        
        # Create new wallet
        wallet_data = web3_service.create_wallet()
        
        if wallet_data.get('error'):
            return jsonify({'error': wallet_data['error']}), 500
        
        # Save to database
        wallet = CryptoWallet(
            wallet_address=wallet_data['address'],
            wallet_type='ethereum',
            private_key_encrypted=wallet_data['private_key'],  # In production, encrypt this!
            public_key=wallet_data.get('public_key', ''),
            user_id=user_id,
            is_active=True
        )
        
        db.session.add(wallet)
        db.session.commit()
        
        # Remove private key from response
        wallet_dict = wallet.to_dict()
        
        return jsonify({
            'message': 'Wallet created successfully',
            'wallet': wallet_dict,
            'warning': 'Private key is encrypted and stored securely'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@web3_bp.route('/api/web3/wallet', methods=['GET'])
@jwt_required()
def get_wallet():
    """Get user's crypto wallet"""
    try:
        user_id = get_jwt_identity()
        
        wallet = CryptoWallet.query.filter_by(
            user_id=user_id,
            is_active=True
        ).first()
        
        if not wallet:
            return jsonify({
                'message': 'No wallet found',
                'has_wallet': False
            }), 200
        
        # Get current balance from blockchain
        balance_data = web3_service.get_balance(wallet.wallet_address)
        
        # Update local balance
        if not balance_data.get('error'):
            wallet.balance_eth = balance_data.get('eth_balance', 0)
            wallet.balance_usdt = balance_data.get('token_balance', 0)
            db.session.commit()
        
        wallet_dict = wallet.to_dict()
        # Remove sensitive data
        wallet_dict.pop('private_key_encrypted', None)
        
        return jsonify({
            'wallet': wallet_dict,
            'live_balance': balance_data,
            'has_wallet': True
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@web3_bp.route('/api/web3/transfer/eth', methods=['POST'])
@jwt_required()
def transfer_eth():
    """Transfer ETH from user's wallet"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['to_address', 'amount']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Get user's wallet
        wallet = CryptoWallet.query.filter_by(
            user_id=user_id,
            is_active=True
        ).first()
        
        if not wallet:
            return jsonify({'error': 'No wallet found'}), 404
        
        amount = float(data['amount'])
        
        if amount <= 0:
            return jsonify({'error': 'Amount must be greater than 0'}), 400
        
        # Check balance
        balance_data = web3_service.get_balance(wallet.wallet_address)
        if balance_data.get('eth_balance', 0) < amount:
            return jsonify({'error': 'Insufficient ETH balance'}), 400
        
        # Execute transfer
        transfer_result = web3_service.transfer_eth(
            from_address=wallet.wallet_address,
            private_key=wallet.private_key_encrypted,  # In production, decrypt first
            to_address=data['to_address'],
            amount=amount
        )
        
        if transfer_result.get('error'):
            return jsonify({'error': transfer_result['error']}), 500
        
        # Record transaction
        crypto_tx = CryptoTransaction(
            tx_hash=transfer_result['tx_hash'],
            from_address=wallet.wallet_address,
            to_address=data['to_address'],
            amount=amount,
            currency='ETH',
            gas_used=transfer_result.get('gas_used'),
            gas_price=transfer_result.get('gas_price'),
            block_number=transfer_result.get('block_number'),
            status='completed' if transfer_result['status'] == 1 else 'failed',
            wallet_id=wallet.id
        )
        
        db.session.add(crypto_tx)
        
        # Update wallet balance
        wallet.balance_eth -= amount
        db.session.commit()
        
        return jsonify({
            'message': 'ETH transfer initiated',
            'transaction': crypto_tx.to_dict(),
            'transfer_details': transfer_result
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@web3_bp.route('/api/web3/transfer/token', methods=['POST'])
@jwt_required()
def transfer_token():
    """Transfer custom tokens"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['to_address', 'amount', 'token_symbol']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Get user's wallet
        wallet = CryptoWallet.query.filter_by(
            user_id=user_id,
            is_active=True
        ).first()
        
        if not wallet:
            return jsonify({'error': 'No wallet found'}), 404
        
        amount = float(data['amount'])
        
        if amount <= 0:
            return jsonify({'error': 'Amount must be greater than 0'}), 400
        
        # Execute token transfer
        transfer_result = web3_service.transfer_tokens(
            from_address=wallet.wallet_address,
            private_key=wallet.private_key_encrypted,
            to_address=data['to_address'],
            amount=amount
        )
        
        if transfer_result.get('error'):
            return jsonify({'error': transfer_result['error']}), 500
        
        # Record transaction
        crypto_tx = CryptoTransaction(
            tx_hash=transfer_result['tx_hash'],
            from_address=wallet.wallet_address,
            to_address=data['to_address'],
            amount=amount,
            currency=data['token_symbol'],
            gas_used=transfer_result.get('gas_used'),
            block_number=transfer_result.get('block_number'),
            status='completed' if transfer_result['status'] == 1 else 'failed',
            wallet_id=wallet.id
        )
        
        db.session.add(crypto_tx)
        
        # Update wallet balance for USDT
        if data['token_symbol'].upper() == 'USDT':
            wallet.balance_usdt -= amount
        
        db.session.commit()
        
        return jsonify({
            'message': f"{data['token_symbol']} transfer initiated",
            'transaction': crypto_tx.to_dict(),
            'transfer_details': transfer_result
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@web3_bp.route('/api/web3/transactions', methods=['GET'])
@jwt_required()
def get_crypto_transactions():
    """Get user's crypto transactions"""
    try:
        user_id = get_jwt_identity()
        
        wallet = CryptoWallet.query.filter_by(
            user_id=user_id,
            is_active=True
        ).first()
        
        if not wallet:
            return jsonify({'transactions': []}), 200
        
        # Get transactions from database
        db_transactions = CryptoTransaction.query.filter_by(
            wallet_id=wallet.id
        ).order_by(CryptoTransaction.created_at.desc()).limit(50).all()
        
        # Get transactions from blockchain
        blockchain_txs = web3_service.get_transaction_history(
            wallet.wallet_address,
            limit=20
        )
        
        return jsonify({
            'database_transactions': [tx.to_dict() for tx in db_transactions],
            'blockchain_transactions': blockchain_txs,
            'wallet_address': wallet.wallet_address
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@web3_bp.route('/api/web3/prices', methods=['GET'])
def get_crypto_prices():
    """Get current cryptocurrency prices"""
    try:
        prices = web3_service.get_crypto_prices()
        
        return jsonify({
            'prices': prices,
            'timestamp': datetime.now().isoformat(),
            'source': 'CoinGecko API'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@web3_bp.route('/api/web3/gas-price', methods=['GET'])
def get_gas_price():
    """Get current gas price"""
    try:
        gas_price = web3_service.web3.eth.gas_price
        gas_price_gwei = web3_service.web3.from_wei(gas_price, 'gwei')
        
        return jsonify({
            'gas_price_wei': str(gas_price),
            'gas_price_gwei': float(gas_price_gwei),
            'gas_price_eth': float(web3_service.web3.from_wei(gas_price, 'ether')),
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@web3_bp.route('/api/web3/contract-info', methods=['GET'])
def get_contract_info():
    """Get smart contract information"""
    try:
        if not web3_service.contract:
            return jsonify({'error': 'Contract not configured'}), 404
        
        contract_info = {
            'address': web3_service.contract_address,
            'network': 'Ethereum Sepolia Testnet',
            'abi_available': bool(web3_service.contract_abi),
            'total_supply': None,
            'symbol': None,
            'name': None
        }
        
        try:
            contract_info['total_supply'] = str(web3_service.contract.functions.totalSupply().call())
            contract_info['symbol'] = web3_service.contract.functions.symbol().call()
            contract_info['name'] = web3_service.contract.functions.name().call()
        except:
            pass
        
        return jsonify(contract_info), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@web3_bp.route('/api/web3/estimate-transfer', methods=['POST'])
@jwt_required()
def estimate_transfer():
    """Estimate transfer cost"""
    try:
        data = request.get_json()
        
        if not data or not data.get('amount'):
            return jsonify({'error': 'Amount is required'}), 400
        
        # Get gas price
        gas_price = web3_service.web3.eth.gas_price
        gas_price_eth = float(web3_service.web3.from_wei(gas_price, 'ether'))
        
        # Estimate gas for ETH transfer (standard 21000)
        gas_eth = 21000
        eth_cost = gas_eth * gas_price_eth
        
        # Estimate gas for token transfer (approx 65000)
        gas_token = 65000
        token_cost = gas_token * gas_price_eth
        
        amount = float(data['amount'])
        
        return jsonify({
            'estimation': {
                'eth_transfer': {
                    'gas_units': gas_eth,
                    'gas_price_eth': gas_price_eth,
                    'total_cost_eth': eth_cost,
                    'total_cost_usd': eth_cost * 1800,  # Approx ETH price
                    'total_amount': amount + eth_cost
                },
                'token_transfer': {
                    'gas_units': gas_token,
                    'gas_price_eth': gas_price_eth,
                    'total_cost_eth': token_cost,
                    'total_cost_usd': token_cost * 1800,
                    'total_amount': amount
                }
            },
            'current_gas_price_gwei': float(web3_service.web3.from_wei(gas_price, 'gwei'))
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500