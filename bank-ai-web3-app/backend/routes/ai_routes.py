from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
from datetime import datetime
from ..models import db, User, AIInteraction, ChatSession, ChatMessage
from ..ai_service import ai_service
import uuid

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/api/ai/chat', methods=['POST'])
@jwt_required()
def chat():
    """AI Chatbot endpoint"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('message'):
            return jsonify({'error': 'Message is required'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get or create chat session
        session = ChatSession.query.filter_by(
            user_id=user_id,
            is_active=True
        ).first()
        
        if not session:
            session = ChatSession(
                user_id=user_id,
                session_id=str(uuid.uuid4())[:8],
                is_active=True
            )
            db.session.add(session)
            db.session.commit()
        
        # Save user message
        user_message = ChatMessage(
            session_id=session.id,
            message_type='user',
            content=data['message']
        )
        db.session.add(user_message)
        
        # Get chat history
        history = ChatMessage.query.filter_by(
            session_id=session.id
        ).order_by(ChatMessage.timestamp.desc()).limit(10).all()
        history = list(reversed(history))
        
        # Prepare messages for AI
        messages = []
        for msg in history:
            role = 'user' if msg.message_type == 'user' else 'assistant'
            messages.append({'role': role, 'content': msg.content})
        
        # Add current message
        messages.append({'role': 'user', 'content': data['message']})
        
        # Get user context for AI
        accounts = user.accounts[:3]
        recent_transactions = []
        for account in accounts:
            transactions = account.transactions[:5]
            recent_transactions.extend([t.to_dict() for t in transactions])
        
        user_context = {
            'user': user.to_dict(),
            'accounts': [acc.to_dict() for acc in accounts],
            'recent_transactions': recent_transactions[-5:],
            'total_balance': sum(acc.balance for acc in accounts)
        }
        
        # Get AI response
        ai_response = ai_service.generate_chat_response(messages, user_context)
        
        # Save AI response
        ai_message = ChatMessage(
            session_id=session.id,
            message_type='ai',
            content=ai_response['response']
        )
        db.session.add(ai_message)
        
        # Save interaction log
        interaction = AIInteraction(
            user_id=user_id,
            interaction_type='chat',
            prompt=data['message'],
            response=ai_response['response'],
            model_used=ai_response.get('model', 'unknown'),
            tokens_used=ai_response.get('tokens_used', 0),
            cost=0.0  # Would calculate based on token usage
        )
        db.session.add(interaction)
        
        db.session.commit()
        
        return jsonify({
            'message': ai_response['response'],
            'session_id': session.session_id,
            'interaction_id': interaction.id,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/api/ai/advice', methods=['GET'])
@jwt_required()
def get_investment_advice():
    """Get personalized investment advice"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user profile data (would come from a user profile table in production)
        user_profile = {
            'age': request.args.get('age', 35),
            'risk_tolerance': request.args.get('risk_tolerance', 'medium'),
            'investment_goal': request.args.get('goal', 'growth'),
            'time_horizon': request.args.get('horizon', '5 years'),
            'portfolio': request.args.get('portfolio', 'mixed')
        }
        
        # Get market data (simplified)
        market_data = {
            'stock_trend': 'bullish',
            'crypto_trend': 'volatile',
            'interest_rate': 'stable'
        }
        
        # Generate advice
        advice = ai_service.generate_investment_advice(user_profile, market_data)
        
        # Log interaction
        interaction = AIInteraction(
            user_id=user_id,
            interaction_type='investment_advice',
            prompt=json.dumps(user_profile),
            response=advice.get('advice', ''),
            model_used=advice.get('model', 'unknown'),
            tokens_used=0
        )
        db.session.add(interaction)
        db.session.commit()
        
        return jsonify({
            'advice': advice.get('advice'),
            'generated_at': advice.get('generated_at'),
            'profile_used': user_profile
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/api/ai/analyze-spending', methods=['GET'])
@jwt_required()
def analyze_spending():
    """Analyze spending patterns"""
    try:
        user_id = get_jwt_identity()
        
        # Get user's transactions from last 3 months
        from datetime import datetime, timedelta
        three_months_ago = datetime.utcnow() - timedelta(days=90)
        
        transactions = []
        user = User.query.get(user_id)
        if user:
            for account in user.accounts:
                account_transactions = account.transactions
                for tx in account_transactions:
                    if tx.created_at >= three_months_ago:
                        transactions.append(tx.to_dict())
        
        # Analyze spending
        analysis = ai_service.analyze_spending_patterns(transactions)
        
        return jsonify(analysis), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/api/ai/categorize', methods=['POST'])
@jwt_required()
def categorize_transactions():
    """Categorize transactions using AI"""
    try:
        data = request.get_json()
        
        if not data or not isinstance(data.get('transactions'), list):
            return jsonify({'error': 'Transactions list is required'}), 400
        
        categorized = []
        for tx in data['transactions']:
            description = tx.get('description', '')
            amount = tx.get('amount', 0)
            
            category = ai_service.categorize_transaction(description, amount)
            
            categorized.append({
                **tx,
                'ai_category': category,
                'original_description': description
            })
        
        return jsonify({
            'categorized_transactions': categorized,
            'total_count': len(categorized)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/api/ai/detect-fraud', methods=['POST'])
@jwt_required()
def detect_fraud():
    """Detect potential fraud in transactions"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Transaction data is required'}), 400
        
        # Get user's transaction history
        user = User.query.get(user_id)
        history = []
        if user:
            for account in user.accounts:
                for tx in account.transactions[:50]:  # Last 50 transactions
                    history.append(tx.to_dict())
        
        # Detect fraud
        fraud_result = ai_service.detect_fraud(data, history)
        
        # Log detection
        interaction = AIInteraction(
            user_id=user_id,
            interaction_type='fraud_detection',
            prompt=json.dumps(data),
            response=json.dumps(fraud_result),
            model_used='isolation_forest+gpt'
        )
        db.session.add(interaction)
        db.session.commit()
        
        return jsonify(fraud_result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/api/ai/sessions', methods=['GET'])
@jwt_required()
def get_chat_sessions():
    """Get user's chat sessions"""
    try:
        user_id = get_jwt_identity()
        
        sessions = ChatSession.query.filter_by(
            user_id=user_id
        ).order_by(ChatSession.created_at.desc()).limit(20).all()
        
        return jsonify({
            'sessions': [session.to_dict() for session in sessions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/api/ai/session/<session_id>/messages', methods=['GET'])
@jwt_required()
def get_chat_messages(session_id):
    """Get messages for a specific chat session"""
    try:
        user_id = get_jwt_identity()
        
        # Verify session belongs to user
        session = ChatSession.query.filter_by(
            id=session_id,
            user_id=user_id
        ).first()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        messages = ChatMessage.query.filter_by(
            session_id=session_id
        ).order_by(ChatMessage.timestamp.asc()).all()
        
        return jsonify({
            'session': session.to_dict(),
            'messages': [msg.to_dict() for msg in messages]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/api/ai/feedback', methods=['POST'])
@jwt_required()
def submit_feedback():
    """Submit feedback for AI interaction"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('interaction_id') or not data.get('rating'):
            return jsonify({'error': 'Interaction ID and rating are required'}), 400
        
        interaction = AIInteraction.query.filter_by(
            id=data['interaction_id'],
            user_id=user_id
        ).first()
        
        if not interaction:
            return jsonify({'error': 'Interaction not found'}), 404
        
        interaction.feedback = int(data['rating'])
        
        if data.get('comment'):
            # Store comment in metadata or separate field
            pass
        
        db.session.commit()
        
        return jsonify({
            'message': 'Feedback submitted successfully',
            'interaction_id': interaction.id,
            'rating': interaction.feedback
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500