"""
AI Web3 Bank - Flask Backend Application
结合人工智能与区块链技术的智能银行系统
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv 

# 加载环境变量
load_dotenv()

# 初始化 Flask 应用
app = Flask(__name__)
CORS(app)

# 配置
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')

# 初始化扩展
jwt = JWTManager(app)

# 导入各个模块
try:
    from ai_service import AIAssistant
    from web3_service import Web3Manager
    print("✅ AI 和 Web3 服务加载成功")
except ImportError as e:
    print(f"⚠️  模块导入警告: {e}")

# ============ 基础路由 ============
@app.route('/')
def home():
    """API 主页"""
    return jsonify({
        "message": "欢迎使用 AI Web3 银行系统",
        "version": "1.0.0",
        "features": [
            "AI 财务助手",
            "区块链钱包",
            "智能合约交易",
            "实时市场数据",
            "安全认证系统"
        ],
        "endpoints": {
            "home": "/",
            "health": "/health",
            "api_docs": "/api/docs",
            "ai_chat": "/api/ai/chat",
            "wallet_info": "/api/web3/wallet",
            "market_data": "/api/market/data"
        }
    })

@app.route('/health')
def health_check():
    """健康检查"""
    return jsonify({
        "status": "healthy",
        "service": "AI Web3 Bank API",
        "timestamp": "2024-01-15T10:30:00Z"
    })

# ============ AI 相关路由 ============
@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """AI 聊天机器人"""
    try:
        data = request.json
        message = data.get('message', '')
        user_id = data.get('user_id', 'anonymous')
        
        # 这里调用 AI 服务
        # ai_response = ai_assistant.chat(message, user_id)
        
        return jsonify({
            "success": True,
            "query": message,
            "response": f"AI回复: 已收到您的查询 '{message}'。用户ID: {user_id}",
            "type": "text",
            "timestamp": "2024-01-15T10:30:00Z"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400

@app.route('/api/ai/financial-advice', methods=['POST'])
def financial_advice():
    """获取个性化财务建议"""
    data = request.json
    income = data.get('income', 0)
    expenses = data.get('expenses', 0)
    goals = data.get('goals', [])
    
    # AI 分析逻辑
    advice = {
        "budget_recommendation": f"建议储蓄率: {int((income - expenses) / income * 100)}%",
        "investment_suggestions": ["指数基金", "数字货币", "债券"],
        "risk_level": "中等",
        "generated_by": "AI Financial Advisor"
    }
    
    return jsonify({
        "success": True,
        "advice": advice,
        "disclaimer": "AI生成建议，投资有风险"
    })

# ============ Web3 相关路由 ============
@app.route('/api/web3/wallet/create', methods=['POST'])
def create_wallet():
    """创建区块链钱包"""
    # 这里集成 Web3 服务
    wallet_address = "0x" + os.urandom(20).hex()
    
    return jsonify({
        "success": True,
        "wallet": {
            "address": wallet_address,
            "type": "Ethereum",
            "balance": "0 ETH",
            "created_at": "2024-01-15T10:30:00Z"
        },
        "warning": "请妥善保存私钥！"
    })

@app.route('/api/web3/transaction', methods=['POST'])
def make_transaction():
    """执行区块链交易"""
    data = request.json
    
    return jsonify({
        "success": True,
        "transaction": {
            "hash": "0x" + os.urandom(32).hex(),
            "from": data.get('from'),
            "to": data.get('to'),
            "amount": data.get('amount'),
            "currency": data.get('currency', 'ETH'),
            "status": "pending",
            "gas_used": "21000"
        }
    })

# ============ 银行功能路由 ============
@app.route('/api/bank/accounts', methods=['GET'])
def get_accounts():
    """获取用户账户列表"""
    accounts = [
        {
            "id": "acc_001",
            "type": "checking",
            "balance": 5000.00,
            "currency": "USD"
        },
        {
            "id": "acc_002",
            "type": "savings",
            "balance": 15000.00,
            "currency": "USD"
        },
        {
            "id": "wallet_001",
            "type": "crypto",
            "balance": 1.5,
            "currency": "ETH"
        }
    ]
    
    return jsonify({
        "success": True,
        "accounts": accounts,
        "total_balance": {
            "fiat": 20000.00,
            "crypto": 1.5
        }
    })

@app.route('/api/market/data', methods=['GET'])
def market_data():
    """获取金融市场数据"""
    return jsonify({
        "crypto": {
            "BTC": {"price": 45000, "change": 2.5},
            "ETH": {"price": 2500, "change": 1.8},
            "USDT": {"price": 1.0, "change": 0.0}
        },
        "stocks": {
            "AAPL": {"price": 185.30, "change": 0.8},
            "GOOGL": {"price": 142.50, "change": 1.2}
        },
        "updated_at": "2024-01-15T10:30:00Z",
        "source": "AI Market Analyzer"
    })

# ============ 错误处理 ============
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Resource not found",
        "message": str(error)
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error",
        "message": str(error)
    }), 500

# ============ 主程序入口 ============
if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 AI Web3 银行系统启动")
    print("="*50)
    print("📡 服务器: http://0.0.0.0:5000")
    print("🏠 主页: http://localhost:5000/")
    print("🩺 健康检查: http://localhost:5000/health")
    print("💬 AI 聊天: POST http://localhost:5000/api/ai/chat")
    print("💰 钱包创建: POST http://localhost:5000/api/web3/wallet/create")
    print("📊 市场数据: GET http://localhost:5000/api/market/data")
    print("="*50 + "\n")
    
    # 启动 Flask 服务器
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )