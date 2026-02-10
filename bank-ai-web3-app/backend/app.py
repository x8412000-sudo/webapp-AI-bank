from flask import Flask, request, jsonify, g
from flask_cors import CORS
import datetime
import jwt
import os
import sys
from functools import wraps
import random
from dotenv import load_dotenv


load_dotenv()

#initialize
app = Flask(__name__)


app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-2025-finance-app')

app.config['JWT_EXPIRE_HOURS'] = int(os.getenv('JWT_EXPIRE_HOURS', 24))

default_origins = 'http://localhost:3000,https://ideal-computing-machine-wrqwvjg4xw64f96j4-3000.app.github.dev'
CORS_ORIGINS = os.getenv('CORS_ORIGINS', default_origins).split(',')
CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS]

#CORS
CORS(app,
     origins=CORS_ORIGINS,
     supports_credentials=True,
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'])


try:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)
    

    from routes.auth_routes import auth_bp
    from routes.ai_routes import ai_bp
    
  
    app.register_blueprint(auth_bp)
    app.register_blueprint(ai_bp)
    
    print("✅ 成功导入并注册蓝图路由")
    print(f"   - 认证路由: /api/auth/*")
    print(f"   - AI路由: /api/ai/*")
    
except ImportError as e:
    print(f"⚠️ 蓝图导入失败: {e}")
    print("将使用 app.py 中的内置路由")
    
    # mock DB
    users = {
        1: {
            "id": 1,
            "username": "demo",
            "password": "demo123", 
            "email": "demo@example.com",
            "full_name": "Demo User",
            "role": "user",
            "balance": 20000.00
        }
    }
    

    accounts = [
        {"id": 1, "userId": 1, "accountNumber": "6226000011112222", "type": "储蓄卡", "balance": 20000.00},
        {"id": 2, "userId": 1, "accountNumber": "6226000033334444", "type": "理财账户", "balance": 50000.00}
    ]
    

    transactions = [
        {"id": 1, "description": "工资收入", "amount": 4500.00, "type": "income", "date": "2026-01-15", "accountId": 1},
        {"id": 2, "description": "房租支出", "amount": -1200.00, "type": "expense", "date": "2026-01-10", "accountId": 1},
        {"id": 3, "description": "餐饮消费", "amount": -350.00, "type": "expense", "date": "2026-01-08", "accountId": 1},
        {"id": 4, "description": "股票收益", "amount": 850.00, "type": "income", "date": "2026-01-05", "accountId": 2}
    ]
    

    def token_required(f):
        """JWT Token"""
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
        
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
    
            if not token:
                return jsonify({"success": False, "error": "Token缺失"}), 401
    
            try:
           
                payload = jwt.decode(
                    token,
                    app.config['SECRET_KEY'],
                    algorithms=["HS256"]
                )
                current_user = next((u for u in users.values() if u["id"] == payload["user_id"]), None)
                if not current_user:
                    return jsonify({"success": False, "error": "Token无效：用户不存在"}), 401
            except jwt.ExpiredSignatureError:
                return jsonify({"success": False, "error": "Token已过期"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"success": False, "error": "Token无效"}), 401
    
      
            g.current_user = current_user
            return f(*args, **kwargs)
        return decorated
    
  
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "OK",
            "service": "Finance App Backend",
            "timestamp": datetime.datetime.now().isoformat(),
            "frontend_allowed": CORS_ORIGINS
        })
    
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        try:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
    
            if not username or not password:
                return jsonify({"success": False, "error": "用户名/密码不能为空"}), 400
    
            current_user = next((u for u in users.values() if u["username"] == username and u["password"] == password), None)
            if not current_user:
                return jsonify({"success": False, "error": "用户名或密码错误"}), 401
    
            # JWT Token
            token = jwt.encode({
                "user_id": current_user["id"],
                "username": current_user["username"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=app.config['JWT_EXPIRE_HOURS'])
            }, app.config['SECRET_KEY'], algorithm="HS256")
    
    
            return jsonify({
                "success": True,
                "token": token,
                "user": {
                    "id": current_user["id"],
                    "username": current_user["username"],
                    "email": current_user["email"],
                    "full_name": current_user["full_name"],
                    "role": current_user["role"]
                }
            })
        except Exception as e:
            return jsonify({"success": False, "error": f"登录失败：{str(e)}"}), 500
    

    @app.route('/api/auth/register', methods=['POST'])
    def register():
        try:
            data = request.get_json()
            
        
            username = data.get('username') or data.get('user_name')
            password = data.get('password')
            email = data.get('email')
            
            # full_name、first_name+last_name
            full_name = data.get('full_name')
            if not full_name:
                first_name = data.get('first_name', '')
                last_name = data.get('last_name', '')
                full_name = f"{first_name} {last_name}".strip()
    
            if not username or not password or not email:
                return jsonify({"success": False, "error": "用户名/密码/邮箱不能为空"}), 400
    

            if any(u["username"] == username for u in users.values()):
                return jsonify({"success": False, "error": "用户名已存在"}), 409
    

            new_user_id = max(users.keys()) + 1
            new_user = {
                "id": new_user_id,
                "username": username,
                "password": password,  # 生产环境需加密
                "email": email,
                "full_name": full_name or username,
                "role": "user",
                "balance": 0.00
            }
            users[new_user_id] = new_user
    

            new_account = {
                "id": len(accounts) + 1,
                "userId": new_user_id,
                "accountNumber": f"62260000{random.randint(100000, 999999)}",
                "type": "储蓄卡",
                "balance": 0.00
            }
            accounts.append(new_account)
    

            token = jwt.encode({
                "user_id": new_user_id,
                "username": username,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=app.config['JWT_EXPIRE_HOURS'])
            }, app.config['SECRET_KEY'], algorithm="HS256")
    
            return jsonify({
                "success": True,
                "msg": "注册成功",
                "token": token,
                "user": new_user
            }), 201
        except Exception as e:
            print(f"注册接口异常：{str(e)}")  # 调试日志
            return jsonify({"success": False, "error": f"注册失败：{str(e)}"}), 500


if __name__ == '__main__':
    print(f"🚀 Starting Finance App Backend...")
    print(f"📡 API Base URL: http://0.0.0.0:5000")
    print(f"🔐 CORS Origins: {CORS_ORIGINS}")
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
