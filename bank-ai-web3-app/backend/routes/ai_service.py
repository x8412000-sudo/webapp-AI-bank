# backend/services/ai_service.py
import os
import json
from typing import Optional
from dotenv import load_dotenv
from voice_service import VoiceService
from image_service import ImageService

env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

class AIService:


    def __init__(self):
        self.voice_service = VoiceService()
        self.image_service = ImageService()
        self.ai_provider = os.getenv('AI_PROVIDER', 'mock')
        self.mock_responses = os.getenv('MOCK_AI_RESPONSES', 'False').lower() == 'true'
        self.gemini_api_key = os.getenv('GEMINI_API_KEY', '')
        self.openai_api_key = os.getenv('OPENAI_API_KEY', '')
        self.gemini_model = os.getenv('GEMINI_MODEL', 'gemini-pro')
        self.openai_model = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')

        print(f"✅ AI 服务初始化完成")
        print(f"   AI 提供商: {self.ai_provider}")
        print(f"   模拟响应: {self.mock_responses}")

        # 初始化 AI 客户端
        self._init_ai_client()
        
    def _init_ai_client(self):
        """初始化 AI 客户端"""
        if self.mock_responses:
            print("   📌 使用模拟响应模式")
            return

        if self.ai_provider == 'gemini' and self.gemini_api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_api_key)
                self.gemini_client = genai.GenerativeModel(self.gemini_model)
                print("   ✅ Gemini 客户端初始化成功")
            except ImportError:
                print("   ❌ Gemini 库未安装，回退到模拟响应")
                self.mock_responses = True
            except Exception as e:
                print(f"   ❌ Gemini 初始化失败: {e}，回退到模拟响应")
                self.mock_responses = True

        elif self.ai_provider == 'openai' and self.openai_api_key:
            try:
                import openai
                self.openai_client = openai.OpenAI(api_key=self.openai_api_key)
                print("   ✅ OpenAI 客户端初始化成功")
            except ImportError:
                print("   ❌ OpenAI 库未安装，回退到模拟响应")
                self.mock_responses = True
            except Exception as e:
                print(f"   ❌ OpenAI 初始化失败: {e}，回退到模拟响应")
                self.mock_responses = True
        else:
            print("   ⚠️  未配置 AI API KEY，使用模拟响应")
            self.mock_responses = True

    def chat(self, message: str, user_id: str = 'guest') -> str:
        """
        AI 文本聊天

        Args:
            message: 用户消息
            user_id: 用户ID

        Returns:
            AI 响应
        """
        try:
            # 使用模拟响应
            if self.mock_responses:
                return self._get_mock_response(message)

            # 使用真实的 AI 服务
            if self.ai_provider == 'gemini':
                return self._chat_with_gemini(message)

            elif self.ai_provider == 'openai':
                return self._chat_with_openai(message)

            else:
                return self._get_mock_response(message)

        except Exception as e:
            print(f"❌ AI 聊天异常：{str(e)}")
            return "抱歉，AI 服务暂时不可用，请稍后再试。"

    def _get_mock_response(self, message: str) -> str:
        """获取模拟响应"""
        responses = {
            "default": f"您好！我是您的 AI 银行助手。您的问题是：{message}。我可以帮您解答关于银行业务、理财投资、贷款等方面的问题。",
            "存款": "当前活期存款利率为 0.3%，定期存款利率根据期限不同而有所差异：1年期 1.5%，2年期 2.1%，3年期 2.75%。",
            "贷款": "我们提供多种贷款产品：个人消费贷款利率 4.35% 起，住房贷款利率 3.85% 起，经营贷款利率 3.65% 起。",
            "投资": "对于新手投资者，建议从低风险产品开始，如货币基金、定期存款等。逐步了解后再尝试债券基金、指数基金等。",
            "信用卡": "申请信用卡需要年满 18 周岁，有稳定的收入来源，良好的信用记录。您可以在线申请或到柜台办理。",
            "转账": "单笔转账限额为 5 万元，日累计限额为 20 万元。如需提高限额，请到柜台办理。",
            "余额": "请登录网银或手机银行查看您的账户余额。",
            "你好": "您好！有什么我可以帮您的吗？",
            "hello": "Hello! How can I help you today?",
            "汇率": "当前美元兑人民币汇率为 7.24，欧元兑人民币汇率为 7.89。汇率实时波动，请以实际交易为准。",
        }

        # 简单的关键词匹配
        for keyword, response in responses.items():
            if keyword != "default" and keyword in message:
                return response

        return responses["default"]

    def _chat_with_gemini(self, message: str) -> str:
        """使用 Gemini 进行聊天"""
        try:
            response = self.gemini_client.generate_content(message)
            return response.text
        except Exception as e:
            print(f"❌ Gemini 调用失败：{e}")
            return self._get_mock_response(message)

    def _chat_with_openai(self, message: str) -> str:
        """使用 OpenAI 进行聊天"""
        try:
            response = self.openai_client.chat.completions.create(
                model=self.openai_model,
                messages=[
                    {"role": "system", "content": "你是一个专业的银行 AI 助手。"},
                    {"role": "user", "content": message}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"❌ OpenAI 调用失败：{e}")
            return self._get_mock_response(message)

    def chat_voice(self, audio_data: bytes, user_id: str = 'guest', generate_audio: bool = False) -> dict:
        """
        处理语音聊天请求
        
        Args:
            audio_data: 音频字节数据（bytes类型）
            user_id: 用户ID
            generate_audio: 是否生成音频响应
        """
        try:
            voice_service = VoiceService()
            
            # ✅ 强制英文识别
            transcribed_text = voice_service.transcribe_audio(audio_data, language='en-US')
            
            if not transcribed_text:
                return {
                    'transcribed_text': '',
                    'response': 'Unable to recognize speech. Please try again.',
                    'audio_response': None
                }
            
            # ✅ 强制英文回复
            english_system_prompt = "You are a professional banking AI assistant. Please respond in English."
            
            if self.ai_provider == 'gemini' and hasattr(self, 'gemini_client'):
                # ✅ 正确传递参数：只传递 message，不传递 system_prompt
                # 因为 _chat_with_gemini 只接受2个参数
                ai_response = self._chat_with_gemini(transcribed_text)
            elif self.ai_provider == 'openai' and hasattr(self, 'openai_client'):
                # ✅ 正确传递参数：只传递 message，不传递 system_prompt
                ai_response = self._chat_with_openai(transcribed_text)
            else:
                # 使用模拟响应 - 英文版本
                english_responses = {
                    "default": f"Hello! I am your AI banking assistant. Your question is: {transcribed_text}. I can help you with banking services, investments, loans, and more.",
                    "deposit": "Current savings interest rate is 0.3%. Fixed deposit rates vary by term: 1-year 1.5%, 2-year 2.1%, 3-year 2.75%.",
                    "loan": "We offer various loan products: personal loans from 4.35%, mortgage loans from 3.85%, business loans from 3.65%.",
                    "investment": "For beginner investors, start with low-risk products like money market funds and fixed deposits.",
                    "credit": "To apply for a credit card, you must be at least 18 with stable income and good credit history.",
                    "card": "To apply for a credit card, you must be at least 18 with stable income and good credit history.",
                    "transfer": "Single transfer limit is 50,000, daily limit is 200,000.",
                    "balance": "Please log in to online banking or mobile banking to check your account balance.",
                    "hello": "Hello! How can I help you today?",
                    "hi": "Hi there! How can I assist you today?",
                    "rate": "Current USD/CNY rate is 7.24, EUR/CNY rate is 7.89.",
                    "interest": "Current savings interest rate is 0.3%.",
                }
                
                # 简单的关键词匹配（英文）
                message_lower = transcribed_text.lower()
                ai_response = english_responses["default"]
                for keyword, response in english_responses.items():
                    if keyword != "default" and keyword in message_lower:
                        ai_response = response
                        break
            
            audio_response = None
            if generate_audio:
                # ✅ 强制英文语音
                audio_response = voice_service.text_to_speech(ai_response, language='en')
            
            return {
                'transcribed_text': transcribed_text,
                'response': ai_response,
                'audio_response': audio_response
            }
        except Exception as e:
            print(f"❌ 语音聊天处理失败: {e}")
            import traceback
            traceback.print_exc()
            return {
                'transcribed_text': '',
                'response': f'Processing error: {str(e)}',
                'audio_response': None
            }


    def chat_image(self, image_file, message: str, user_id: str = 'guest') -> dict:
        """
        AI 图像分析

        Args:
            image_file: 图像文件
            message: 可选文本消息
            user_id: 用户ID

        Returns:
            包含图像分析和 AI 响应的字典
        """
        try:
            analysis = "这是一张银行相关的图像（模拟分析）"
            ai_response = self.chat(f"图像分析：{analysis}。{message}", user_id)

            return {
                "analysis": analysis,
                "response": ai_response
            }

        except Exception as e:
            print(f"❌ AI 图像分析异常：{str(e)}")
            return {
                "analysis": "",
                "response": "抱歉，图像分析服务暂时不可用"
            }

    def get_investment_advice(self, account_id: str) -> str:
        """
        获取投资建议

        Args:
            account_id: 账户ID

        Returns:
            投资建议
        """
        try:
            advice = f"""
基于您的账户 {account_id} 的数据，我为您提供以下投资建议：

1. **风险评估**：建议您先进行风险承受能力评估，以便选择合适的投资产品。

2. **资产配置**：
   - 保守型：定期存款 40%，货币基金 40%，国债 20%
   - 平衡型：定期存款 20%，货币基金 30%，债券基金 30%，股票基金 20%
   - 进取型：债券基金 20%，股票基金 60%，其他投资 20%

3. **投资期限**：建议根据您的资金使用计划选择投资期限，短期资金选择流动性好的产品，长期资金可以选择收益较高的产品。

4. **分散投资**：不要把所有资金投入单一产品，要分散投资降低风险。

5. **定期调整**：建议每季度评估投资组合，根据市场变化和个人情况进行调整。

如需更详细的投资建议，请联系我们的理财顾问。
            """

            return advice.strip()

        except Exception as e:
            print(f"❌ 投资建议异常：{str(e)}")
            return "抱歉，投资建议服务暂时不可用"

    def analyze_spending(self, account_id: str) -> str:
        """
        支出分析

        Args:
            account_id: 账户ID

        Returns:
            支出分析报告
        """
        try:
            analysis = f"""
账户 {account_id} 的支出分析报告：

1. **支出概况**：
   - 本月总支出：¥5,234.50
   - 较上月增长：+12.3%

2. **支出分类**：
   - 餐饮消费：¥1,250.00 (23.9%)
   - 交通出行：¥856.50 (16.4%)
   - 购物消费：¥2,100.00 (40.1%)
   - 生活缴费：¥528.00 (10.1%)
   - 其他支出：¥500.00 (9.5%)

3. **趋势分析**：
   - 购物消费增长明显，建议关注非必要支出
   - 餐饮消费占比合理，可以适当控制
   - 交通支出稳定，建议继续使用公共交通

4. **优化建议**：
   - 制定每月预算，控制购物支出
   - 减少外卖频率，多自己做饭
   - 使用公共交通或拼车降低交通成本

如需更详细的分析，请联系您的理财顾问。
            """

            return analysis.strip()

        except Exception as e:
            print(f"❌ 支出分析异常：{str(e)}")
            return "抱歉，支出分析服务暂时不可用"


# 创建全局实例
ai_banker = AIService()