# backend/voice_service.py
import os
import base64
import tempfile
import io
from typing import Optional, Tuple
from dotenv import load_dotenv
import subprocess
import json

load_dotenv()

class VoiceService:
    def __init__(self):
        self._init_speech_recognition()
        self._init_text_to_speech()
        print("✅ 免费语音服务初始化完成")
    
    def _init_speech_recognition(self):
        """初始化免费语音识别"""
        try:
            # 方案1: 使用免费的Web Speech API模拟（通过浏览器）
            # 方案2: 使用本地Whisper模型（需要安装）
            self.whisper_available = False
            
            # 检查是否安装了Whisper
            try:
                import whisper
                # 下载小模型（首次运行会下载）
                # tiny, base, small
                self.whisper_model = whisper.load_model("base")
                self.whisper_available = True
                print("✅ Whisper语音识别已启用（本地模型）")
            except ImportError:
                print("⚠️  Whisper未安装，使用浏览器端语音识别")
                self.whisper_available = False
            
        except Exception as e:
            print(f"❌ 语音识别初始化失败: {e}")
            self.whisper_available = False
    
    def _init_text_to_speech(self):
        """初始化免费文本转语音"""
        try:
            # 方案1: 使用gTTS（Google免费版，有速率限制但可用）
            from gtts import gTTS
            self.gtts = gTTS
            print("✅ gTTS免费TTS已启用")
            
            # 方案2: 本地TTS备选（需要安装额外的包）
            self.local_tts_available = False
            try:
                # 尝试导入本地TTS库
                import pyttsx3
                self.pyttsx3 = pyttsx3
                self.local_tts_available = True
                print("✅ 本地TTS备用方案已准备")
            except ImportError:
                print("⚠️  本地TTS未安装，仅使用gTTS")
                
        except Exception as e:
            print(f"❌ TTS初始化失败: {e}")
            self.gtts = None
    
    def transcribe_audio(self, audio_data: bytes, language: str = 'en-US', audio_format: str = 'wav') -> Optional[str]:

    
    # 验证音频数据
        if not audio_data or len(audio_data) == 0:
            print("❌ 音频数据为空")
            return "音频数据为空，请重新录制"
        
        if len(audio_data) < 100:
            print(f"❌ 音频数据太小: {len(audio_data)} bytes")
            return "音频录制太短，请至少录制1秒"
        
        print(f"✅ 接收到音频数据: {len(audio_data)} bytes")
        
        # 方案1: 使用本地Whisper模型
        if self.whisper_available:
            try:
                # 保存音频为临时文件
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                    tmp_file.write(audio_data)
                    tmp_file_path = tmp_file.name
                
                print(f"✅ 音频已保存到临时文件: {tmp_file_path}")
                
                # 使用Whisper转录
                import whisper
                whisper_lang = "en" if language.startswith("en") else "zh"
                print(f"🎯 Whisper使用语言: {whisper_lang}")

                result = self.whisper_model.transcribe(
                    tmp_file_path, 
                    language=whisper_lang,
                    fp16=False  # 禁用FP16，避免CPU警告
                )
                text = result["text"].strip()
                
                print(f"✅ Whisper识别结果: {text}")
                
                # 清理临时文件
                os.unlink(tmp_file_path)
                
                if not text:
                    return "未能识别到有效语音"
                
                return text
                
            except Exception as e:
                print(f"❌ Whisper转录失败: {e}")
                # 清理临时文件
                if 'tmp_file_path' in locals():
                    try:
                        os.unlink(tmp_file_path)
                    except:
                        pass
                # 降级到方案2
        
        # 方案2: 使用开源语音识别库SpeechRecognition（调用Google免费API）
        try:
            import speech_recognition as sr
            
            recognizer = sr.Recognizer()
            
            # 将字节数据保存为临时文件
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                tmp_file.write(audio_data)
                tmp_file_path = tmp_file.name
            
            # 识别音频
            with sr.AudioFile(tmp_file_path) as source:
                audio = recognizer.record(source)
                # 使用Google Web Speech API（免费但有速率限制）
                text = recognizer.recognize_google(audio, language=language)
            
            os.unlink(tmp_file_path)
            return text
            
        except sr.UnknownValueError:
            print("❌ 无法识别语音内容")
            return "语音无法识别，请重试"
        except sr.RequestError as e:
            print(f"❌ 语音识别服务错误: {e}")
            return "语音服务暂时不可用"
        except Exception as e:
            print(f"❌ 语音识别错误: {e}")
            return None
    
    def text_to_speech(self, text: str, language: str = 'en') -> Optional[bytes]:
        """将文本转换为语音 - 免费版本"""
        if not self.gtts:
            return None
        
        try:
            # 方案1: 使用gTTS（Google免费版）
            # gTTS有速率限制，但小型应用够用
            tts = self.gtts(text=text, lang=language, slow=False)
            
            # 保存到临时文件
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False, delete_on_close=False) as tmp_file:
                tmp_file_path = tmp_file.name
                tts.save(tmp_file_path)
            
            # 读取文件内容
            with open(tmp_file_path, 'rb') as f:
                audio_bytes = f.read()
            
            # 清理临时文件
            os.unlink(tmp_file_path)
            
            return audio_bytes
            
        except Exception as e:
            print(f"❌ gTTS生成失败: {e}")
            
            # 方案2: 使用本地TTS备用方案
            if hasattr(self, 'local_tts_available') and self.local_tts_available:
                try:
                    engine = self.pyttsx3.init()
                    
                    # 保存到临时文件
                    with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False, delete_on_close=False) as tmp_file:
                        tmp_file_path = tmp_file.name
                    
                    engine.save_to_file(text, tmp_file_path)
                    engine.runAndWait()
                    
                    with open(tmp_file_path, 'rb') as f:
                        audio_bytes = f.read()
                    
                    os.unlink(tmp_file_path)
                    return audio_bytes
                    
                except Exception as tts_error:
                    print(f"❌ 本地TTS也失败: {tts_error}")
            
            return None
    
    def get_supported_languages(self) -> list:
        """获取支持的语言列表"""
        return [
            {"code": "zh-CN", "name": "简体中文"},
            {"code": "en-US", "name": "English (US)"},
            {"code": "zh-TW", "name": "繁體中文"},
            {"code": "ja-JP", "name": "日本語"},
            {"code": "ko-KR", "name": "한국어"},
            {"code": "fr-FR", "name": "Français"},
            {"code": "es-ES", "name": "Español"}
        ]
    
    def audio_to_text_browser(self, audio_blob_url: str) -> Optional[str]:
        """浏览器端语音识别（前端调用）"""
        # 这个方法实际上由前端JavaScript调用浏览器的Web Speech API
        # 这里只是占位，实际识别在前端完成
        return None