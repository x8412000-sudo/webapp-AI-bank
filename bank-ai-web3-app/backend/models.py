from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20))
    password_hash = db.Column(db.String(200), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    accounts = db.relationship('BankAccount', backref='user', lazy=True, cascade='all, delete-orphan')
    crypto_wallets = db.relationship('CryptoWallet', backref='user', lazy=True, cascade='all, delete-orphan')
    ai_interactions = db.relationship('AIInteraction', backref='user', lazy=True)
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'isVerified': self.is_verified,
            'createdAt': self.created_at.isoformat()
        }

class BankAccount(db.Model):
    __tablename__ = 'bank_accounts'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    account_type = db.Column(db.String(20), nullable=False, default='checking')  # checking, savings, investment
    account_name = db.Column(db.String(100))
    balance = db.Column(db.Float, default=0.0, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    interest_rate = db.Column(db.Float, default=0.0)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    transactions = db.relationship('Transaction', backref='account', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'accountNumber': self.account_number,
            'accountType': self.account_type,
            'accountName': self.account_name,
            'balance': self.balance,
            'currency': self.currency,
            'interestRate': self.interest_rate,
            'userId': self.user_id,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat()
        }

class CryptoWallet(db.Model):
    __tablename__ = 'crypto_wallets'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    wallet_address = db.Column(db.String(100), unique=True, nullable=False)
    wallet_type = db.Column(db.String(20), default='ethereum')  # ethereum, bitcoin, etc.
    private_key_encrypted = db.Column(db.Text)  # Encrypted in production
    public_key = db.Column(db.Text)
    balance_eth = db.Column(db.Float, default=0.0)
    balance_usdt = db.Column(db.Float, default=0.0)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    crypto_transactions = db.relationship('CryptoTransaction', backref='wallet', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'walletAddress': self.wallet_address,
            'walletType': self.wallet_type,
            'balanceEth': self.balance_eth,
            'balanceUsdt': self.balance_usdt,
            'userId': self.user_id,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat()
        }

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    transaction_type = db.Column(db.String(20), nullable=False)  # deposit, withdrawal, transfer, payment
    category = db.Column(db.String(50))  # AI-categorized
    description = db.Column(db.String(500))
    status = db.Column(db.String(20), default='completed')  # pending, completed, failed
    from_account_id = db.Column(db.String(36), db.ForeignKey('bank_accounts.id'))
    to_account_id = db.Column(db.String(36), db.ForeignKey('bank_accounts.id'))
    to_account_number = db.Column(db.String(20))
    to_account_name = db.Column(db.String(100))
    metadata = db.Column(db.JSON)  # Additional data
    fraud_score = db.Column(db.Float)  # AI fraud detection score
    is_fraudulent = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'transactionId': self.transaction_id,
            'amount': self.amount,
            'currency': self.currency,
            'transactionType': self.transaction_type,
            'category': self.category,
            'description': self.description,
            'status': self.status,
            'fromAccountId': self.from_account_id,
            'toAccountId': self.to_account_id,
            'toAccountNumber': self.to_account_number,
            'toAccountName': self.to_account_name,
            'fraudScore': self.fraud_score,
            'isFraudulent': self.is_fraudulent,
            'createdAt': self.created_at.isoformat()
        }

class CryptoTransaction(db.Model):
    __tablename__ = 'crypto_transactions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tx_hash = db.Column(db.String(100), unique=True, nullable=False)
    from_address = db.Column(db.String(100))
    to_address = db.Column(db.String(100))
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default='ETH')
    gas_used = db.Column(db.Float)
    gas_price = db.Column(db.Float)
    block_number = db.Column(db.Integer)
    status = db.Column(db.String(20), default='pending')
    wallet_id = db.Column(db.String(36), db.ForeignKey('crypto_wallets.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'txHash': self.tx_hash,
            'fromAddress': self.from_address,
            'toAddress': self.to_address,
            'amount': self.amount,
            'currency': self.currency,
            'gasUsed': self.gas_used,
            'gasPrice': self.gas_price,
            'blockNumber': self.block_number,
            'status': self.status,
            'walletId': self.wallet_id,
            'createdAt': self.created_at.isoformat()
        }

class AIInteraction(db.Model):
    __tablename__ = 'ai_interactions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    interaction_type = db.Column(db.String(50))  # chat, advice, fraud_detection
    prompt = db.Column(db.Text)
    response = db.Column(db.Text)
    model_used = db.Column(db.String(50))
    tokens_used = db.Column(db.Integer)
    cost = db.Column(db.Float)
    feedback = db.Column(db.Integer)  # 1-5 rating
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'interactionType': self.interaction_type,
            'prompt': self.prompt,
            'response': self.response,
            'modelUsed': self.model_used,
            'tokensUsed': self.tokens_used,
            'cost': self.cost,
            'feedback': self.feedback,
            'createdAt': self.created_at.isoformat()
        }

class ChatSession(db.Model):
    __tablename__ = 'chat_sessions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    session_id = db.Column(db.String(50), unique=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    ended_at = db.Column(db.DateTime)
    
    messages = db.relationship('ChatMessage', backref='session', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'sessionId': self.session_id,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat(),
            'endedAt': self.ended_at.isoformat() if self.ended_at else None
        }

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = db.Column(db.String(36), db.ForeignKey('chat_sessions.id'), nullable=False)
    message_type = db.Column(db.String(10))  # user, ai, system
    content = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'sessionId': self.session_id,
            'messageType': self.message_type,
            'content': self.content,
            'timestamp': self.timestamp.isoformat()
        }