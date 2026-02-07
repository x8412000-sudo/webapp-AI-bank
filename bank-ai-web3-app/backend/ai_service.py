import openai
import json
from typing import Dict, List, Any
import pandas as pd
from sklearn.ensemble import IsolationForest
import numpy as np
from datetime import datetime, timedelta
import requests
from config import Config

class AIService:
    def __init__(self):
        self.openai_api_key = Config.OPENAI_API_KEY
        self.model = Config.AI_MODEL
        openai.api_key = self.openai_api_key
        
    def generate_chat_response(self, messages: List[Dict], user_context: Dict = None) -> Dict:
        """Generate AI chatbot response"""
        try:
            system_prompt = """You are a helpful banking assistant for Digital Trust Bank. 
            You can help users with:
            1. Account balance inquiries
            2. Transaction explanations
            3. Financial advice
            4. Fraud detection questions
            5. Investment recommendations
            6. Crypto wallet queries
            
            Be concise, accurate, and helpful. If you're unsure, say so.
            
            User context: {context}""".format(context=json.dumps(user_context) if user_context else "No context")
            
            chat_messages = [{"role": "system", "content": system_prompt}]
            chat_messages.extend(messages)
            
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=chat_messages,
                temperature=0.7,
                max_tokens=500
            )
            
            return {
                'response': response.choices[0].message.content,
                'tokens_used': response.usage.total_tokens,
                'model': self.model
            }
            
        except Exception as e:
            return {
                'response': f"I'm having trouble connecting to the AI service. Error: {str(e)}",
                'error': str(e)
            }
    
    def categorize_transaction(self, description: str, amount: float) -> str:
        """Categorize transaction using AI"""
        prompt = f"""Categorize this banking transaction:
        Description: {description}
        Amount: ${amount}
        
        Categories: groceries, dining, transportation, shopping, entertainment, bills, healthcare, education, transfer, salary, investment, crypto, other.
        
        Return only the category name."""
        
        try:
            response = openai.Completion.create(
                model="text-davinci-003",
                prompt=prompt,
                max_tokens=10,
                temperature=0
            )
            return response.choices[0].text.strip().lower()
        except:
            return "other"
    
    def detect_fraud(self, transaction_data: Dict, user_history: List[Dict]) -> Dict:
        """Detect potential fraud using AI and ML"""
        try:
            # Extract features for ML model
            features = self._extract_fraud_features(transaction_data, user_history)
            
            # Rule-based detection
            fraud_score = 0
            alerts = []
            
            # Check for unusual amount
            avg_amount = np.mean([t['amount'] for t in user_history[-10:]]) if user_history else 0
            if avg_amount > 0 and transaction_data['amount'] > avg_amount * 5:
                fraud_score += 30
                alerts.append("Unusually large transaction amount")
            
            # Check for unusual time
            current_hour = datetime.now().hour
            if current_hour < 6 or current_hour > 22:
                fraud_score += 10
                alerts.append("Transaction at unusual hour")
            
            # Check for new recipient
            if transaction_data.get('to_account_number'):
                recent_recipients = [t.get('to_account_number') for t in user_history[-20:] if t.get('to_account_number')]
                if transaction_data['to_account_number'] not in recent_recipients:
                    fraud_score += 20
                    alerts.append("First time transacting with this recipient")
            
            # Use Isolation Forest for anomaly detection
            if len(user_history) >= 10:
                X = self._prepare_features_for_ml(user_history, features)
                clf = IsolationForest(contamination=0.1, random_state=42)
                clf.fit(X)
                anomaly_score = clf.decision_function([features])[0]
                if anomaly_score < -0.1:
                    fraud_score += 40
                    alerts.append("Transaction pattern anomaly detected")
            
            # AI-powered description analysis
            description = transaction_data.get('description', '')
            if description:
                fraud_check_prompt = f"""Analyze this transaction description for fraud risk: "{description}"
                Is it suspicious? Respond with 'YES', 'NO', or 'POSSIBLE'."""
                
                try:
                    response = openai.Completion.create(
                        model="text-davinci-003",
                        prompt=fraud_check_prompt,
                        max_tokens=10,
                        temperature=0
                    )
                    result = response.choices[0].text.strip().upper()
                    if result == 'YES':
                        fraud_score += 50
                        alerts.append("AI flagged description as suspicious")
                    elif result == 'POSSIBLE':
                        fraud_score += 25
                        alerts.append("AI flagged description as potentially suspicious")
                except:
                    pass
            
            return {
                'fraud_score': min(100, fraud_score),
                'is_fraudulent': fraud_score > 70,
                'alerts': alerts,
                'recommendation': 'Review transaction' if fraud_score > 50 else 'Approve'
            }
            
        except Exception as e:
            return {
                'fraud_score': 0,
                'is_fraudulent': False,
                'alerts': [f"Error in fraud detection: {str(e)}"],
                'recommendation': 'Review'
            }
    
    def _extract_fraud_features(self, transaction: Dict, history: List[Dict]) -> List[float]:
        """Extract features for fraud detection"""
        features = []
        
        # Transaction amount
        features.append(transaction['amount'])
        
        # Time features
        now = datetime.now()
        features.append(now.hour)
        features.append(now.weekday())
        
        # Historical features
        if history:
            amounts = [t['amount'] for t in history[-10:]]
            features.append(np.mean(amounts) if amounts else 0)
            features.append(np.std(amounts) if len(amounts) > 1 else 0)
        else:
            features.extend([0, 0])
        
        return features
    
    def _prepare_features_for_ml(self, history: List[Dict], current_features: List[float]) -> np.ndarray:
        """Prepare features for ML model"""
        X = []
        for i in range(len(history)):
            features = self._extract_fraud_features(history[i], history[max(0, i-10):i])
            X.append(features)
        X.append(current_features)
        return np.array(X)
    
    def generate_investment_advice(self, user_profile: Dict, market_data: Dict) -> Dict:
        """Generate personalized investment advice"""
        prompt = f"""Provide investment advice for this user profile:
        
        User Age: {user_profile.get('age', 'Not specified')}
        Risk Tolerance: {user_profile.get('risk_tolerance', 'medium')}
        Investment Goal: {user_profile.get('investment_goal', 'growth')}
        Time Horizon: {user_profile.get('time_horizon', '5 years')}
        Current Portfolio: {user_profile.get('portfolio', 'Not specified')}
        
        Market Conditions:
        - Stock Market: {market_data.get('stock_trend', 'stable')}
        - Crypto Market: {market_data.get('crypto_trend', 'volatile')}
        - Interest Rates: {market_data.get('interest_rate', 'stable')}
        
        Provide specific advice including:
        1. Recommended asset allocation
        2. Specific stocks/crypto to consider
        3. Risk management strategies
        4. Timeline for rebalancing"""
        
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a certified financial advisor."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=600
            )
            
            return {
                'advice': response.choices[0].message.content,
                'generated_at': datetime.now().isoformat(),
                'model': self.model
            }
        except Exception as e:
            return {
                'advice': f"Unable to generate investment advice at this time. Error: {str(e)}",
                'error': str(e)
            }
    
    def analyze_spending_patterns(self, transactions: List[Dict]) -> Dict:
        """Analyze spending patterns and provide insights"""
        if not transactions:
            return {"insights": "No transaction data available"}
        
        df = pd.DataFrame(transactions)
        
        # Basic analysis
        total_spent = df[df['amount'] < 0]['amount'].sum() * -1
        avg_monthly = total_spent / 3  # Assuming 3 months of data
        
        # Category analysis
        if 'category' in df.columns:
            category_totals = df.groupby('category')['amount'].apply(lambda x: (x[x < 0].sum() * -1)).to_dict()
        else:
            category_totals = {}
        
        insights = f"""
        Spending Analysis:
        - Total spent (last 3 months): ${total_spent:,.2f}
        - Average monthly spending: ${avg_monthly:,.2f}
        - Top spending categories: {', '.join(sorted(category_totals.items(), key=lambda x: x[1], reverse=True)[:3])}
        
        Recommendations:
        1. Consider setting a budget for top spending categories
        2. Review recurring subscriptions
        3. Look for opportunities to save"""
        
        return {
            'insights': insights,
            'total_spent': total_spent,
            'avg_monthly': avg_monthly,
            'category_breakdown': category_totals
        }

# Initialize singleton instance
ai_service = AIService()