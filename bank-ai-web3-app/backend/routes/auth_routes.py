# backend/routes/auth_routes.py
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import jwt
import hashlib

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


USERS = {
    'demo': {
        'id': 1,
        'username': 'demo',
        'password_hash': hashlib.sha256('demo123'.encode()).hexdigest(),
        'email': 'demo@example.com',
        'full_name': 'Demo User',
        'role': 'user',
        'created_at': '2024-01-01T00:00:00Z'
    }
}

def generate_token(user_id, username):
    """生成 JWT token"""
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    # 注意：生产环境必须更换密钥！
    return jwt.encode(payload, 'your-secret-key-change-in-production', algorithm='HS256')

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({
                "success": False,
                "error": "请输入用户名和密码"
            }), 400
        
        username = data['username']
        password = data['password']
        
        # 检查用户是否存在
        if username not in USERS:
            return jsonify({
                "success": False,
                "error": "用户名或密码错误"
            }), 401
        
        user = USERS[username]
        
        # 验证密码（前端传明文，后端加密对比，这一步是对的）
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        if password_hash != user['password_hash']:
            return jsonify({
                "success": False,
                "error": "用户名或密码错误"
            }), 401
        
        # 生成 token
        token = generate_token(user['id'], username)
        
        return jsonify({
            "success": True,
            "message": "登录成功",
            "token": token,
            "user": {
                "id": user['id'],
                "username": user['username'],
                "email": user['email'],
                "full_name": user['full_name'],
                "role": user['role']
            }
        })
        
    except Exception as e:
        # 调试时打印异常详情，方便定位问题
        print(f"登录接口异常：{str(e)}")
        return jsonify({
            "success": False,
            "error": f"服务器内部错误：{str(e)}"
        }), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # 🔧 修复：兼容前端传递的参数
        # 前端可能传递：username 或 user_name
        username = data.get('username') or data.get('user_name')
        password = data.get('password')
        email = data.get('email')
        
        # 🔧 修复：兼容 full_name、first_name+last_name
        full_name = data.get('full_name')
        if not full_name:
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            full_name = f"{first_name} {last_name}".strip()
        
        # 验证必填字段
        if not username or not password or not email:
            return jsonify({
                "success": False,
                "error": "用户名、密码和邮箱为必填项"
            }), 400
        
        # 检查用户是否已存在
        if username in USERS:
            return jsonify({
                "success": False,
                "error": "用户名已存在"
            }), 400
        
        # 创建新用户
        user_id = len(USERS) + 1
        USERS[username] = {
            'id': user_id,
            'username': username,
            'password_hash': hashlib.sha256(password.encode()).hexdigest(),
            'email': email,
            'full_name': full_name or username,
            'role': 'user',
            'created_at': datetime.utcnow().isoformat() + 'Z'
        }
        
        # 生成 token
        token = generate_token(user_id, username)
        
        return jsonify({
            "success": True,
            "message": "注册成功",
            "token": token,
            "user": {
                "id": user_id,
                "username": username,
                "email": email,
                "full_name": full_name or username,
                "role": 'user'
            }
        })
        
    except Exception as e:
        print(f"注册接口异常：{str(e)}")
        return jsonify({
            "success": False,
            "error": f"服务器内部错误：{str(e)}"
        }), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """获取当前用户信息"""
    # 简单实现，实际应该验证 token
    return jsonify({
        "success": True,
        "user": {
            "id": 1,
            "username": "demo",
            "email": "demo@example.com",
            "full_name": "Demo User",
            "role": "user"
        }
    })

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """用户登出"""
    return jsonify({
        "success": True,
        "message": "登出成功"
    })
