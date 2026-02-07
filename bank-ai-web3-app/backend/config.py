import os
from datetime import timedelta

class Config:
    # Basic Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-change-in-production'
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///bank_ai_web3.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-me'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # AI Configuration
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
    AI_MODEL = 'gpt-3.5-turbo'
    
    # Web3 Configuration
    WEB3_PROVIDER = os.environ.get('WEB3_PROVIDER', 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY')
    CONTRACT_ADDRESS = os.environ.get('CONTRACT_ADDRESS', '')
    PRIVATE_KEY = os.environ.get('PRIVATE_KEY', '')
    
    # Binance API for crypto prices
    BINANCE_API_KEY = os.environ.get('BINANCE_API_KEY', '')
    BINANCE_SECRET_KEY = os.environ.get('BINANCE_SECRET_KEY', '')
    
    # Feature Flags
    ENABLE_AI_FEATURES = True
    ENABLE_WEB3_FEATURES = True