# backend/routes/ai_routes.py
from flask import Blueprint, request, jsonify
import time
import base64
from .ai_service import AIService

ai_banker = AIService()

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

@ai_bp.route('/chat', methods=['POST'])
def chat():

    import traceback  
    
    try:
        data = request.get_json()
        print(f"📥 收到请求数据: {data}")  # 添加日志
        
        if not data or 'message' not in data:
            return jsonify({
                "success": False,
                "error": "请提供 message 参数"
            }), 400
        
        message = data.get('message', '')
        user_id = data.get('user_id', 'guest')
        print(f"📝 消息内容: {message}, 用户ID: {user_id}")  # 添加日志
        
        # 调用 AI 服务
        response = ai_banker.chat(message, user_id)
        print(f"🤖 AI 响应: {response}")  # 添加日志
        
        return jsonify({
            "success": True,
            "response": response
        })
        
    except Exception as e:
        print(f"❌ AI 聊天接口异常：{str(e)}")  # 已有
        print(f"❌ 错误堆栈：\n{traceback.format_exc()}")  # 添加完整堆栈
        return jsonify({
            "success": False,
            "error": f"AI 服务异常：{str(e)}"
        }), 500

@ai_bp.route('/system/info', methods=['GET'])
def system_info():
    """获取AI系统信息"""
    info = ai_banker.get_system_info()
    return jsonify({
        "success": True,
        "system": {
            "name": "Professional Banking AI",
            "version": "1.0.0",
            "rag_system": "ChromaDB + Custom Knowledge Base",
            "ai_provider": info["provider"],
            "knowledge_base": {
                "documents": info["knowledge_base_count"],
                "status": "active"
            }
        }
    })

@ai_bp.route('/knowledge/add', methods=['POST'])
def add_knowledge():
    """添加新知识"""
    try:
        data = request.json
        
        if not data or 'content' not in data:
            return jsonify({
                "success": False,
                "error": "缺少 content 参数"
            }), 400
        
        content = data.get('content')
        metadata = data.get('metadata', {})
        
        result = ai_banker.add_knowledge(content, metadata)
        
        return jsonify({
            "success": True,
            "message": "知识添加成功",
            "knowledge_added": content[:100] + "..." if len(content) > 100 else content
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@ai_bp.route('/search', methods=['POST'])
def search_knowledge():
    """直接搜索知识库"""
    try:
        data = request.json
        
        if not data or 'query' not in data:
            return jsonify({
                "success": False,
                "error": "缺少 query 参数"
            }), 400
        
        query = data.get('query')
        n_results = data.get('n_results', 3)
        
        # 直接检索
        results = ai_banker.retriever.retrieve(query, n_results)
        
        return jsonify({
            "success": True,
            "query": query,
            "results": results
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# 在现有基础上添加这些新的路由

@ai_bp.route('/chat/voice', methods=['POST'])
def chat_voice():
    """AI 语音聊天接口"""
    print("=" * 60)
    print("🎤 收到语音聊天请求")
    print("=" * 60)
    
    try:
        # 打印请求信息
        print(f"📋 请求方法: {request.method}")
        print(f"📋 请求类型: {request.content_type}")
        print(f"📋 表单数据: {list(request.form.keys())}")
        print(f"📋 文件列表: {list(request.files.keys())}")
        
        # 检查是否有文件上传
        if 'audio' not in request.files:
            print(f"❌ 没有找到 audio 文件")
            return jsonify({
                "success": False,
                "error": "请上传音频文件"
            }), 400
        
        audio_file = request.files['audio']
        print(f"📁 文件名: {audio_file.filename}")
        print(f"📁 文件类型: {audio_file.content_type}")
        
        # 读取文件内容
        audio_data = audio_file.read()
        print(f"📁 文件大小: {len(audio_data)} bytes")
        
        # 验证音频数据
        if len(audio_data) == 0:
            print("❌ 音频数据为空")
            return jsonify({
                "success": False,
                "error": "音频数据为空，请重新录制"
            }), 400
        
        # 获取其他参数
        user_id = request.form.get('user_id', 'guest')
        generate_audio = request.form.get('generate_audio', 'false') == 'true'
        
        print(f"📝 语音参数:")
        print(f" - user_id: {user_id}")
        print(f" - generate_audio: {generate_audio}")
        
        # ✅ 关键修改：传递 audio_data 而不是 audio_file
        print("🔄 调用 AI 服务进行语音识别...")
        result = ai_banker.chat_voice(audio_data, user_id, generate_audio)
        
        print(f"🤖 语音识别结果: {result.get('transcribed_text', '')}")
        print(f"🤖 AI 回复: {result.get('response', '')[:100]}...")
        print(f"🤖 音频响应: {'有' if result.get('audio_response') else '无'}")
        
        audio_response = result.get('audio_response', None)
        if audio_response is not None and isinstance(audio_response, bytes):
            audio_response = base64.b64encode(audio_response).decode('utf-8')

        return jsonify({
            "success": True,
            "transcribed_text": result.get('transcribed_text', ''),
            "response": result.get('response', ''),
            "audio_response": audio_response
        })

        
    except Exception as e:
        print(f"❌ AI 语音接口异常：{str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"AI 语音服务异常：{str(e)}"
        }), 500


@ai_bp.route('/chat/image', methods=['POST'])
def chat_image():
    """AI 图像分析接口"""
    print("=" * 60)
    print("🖼️  收到图像分析请求")
    print("=" * 60)
    
    try:
        # 打印请求信息
        print(f"📋 请求方法: {request.method}")
        print(f"📋 请求类型: {request.content_type}")
        print(f"📋 表单数据: {list(request.form.keys())}")
        print(f"📋 文件列表: {list(request.files.keys())}")
        
        # 检查是否有文件上传
        if 'image' not in request.files:
            print(f"❌ 没有找到 image 文件")
            print(f"❌ 可用文件: {list(request.files.keys())}")
            return jsonify({
                "success": False,
                "error": "请上传图像文件"
            }), 400
        
        image_file = request.files['image']
        print(f"📁 文件名: {image_file.filename}")
        print(f"📁 文件类型: {image_file.content_type}")
        
        # 读取文件内容
        image_data = image_file.read()
        print(f"📁 文件大小: {len(image_data)} bytes")
        
        # 获取其他参数
        message = request.form.get('message', '')
        user_id = request.form.get('user_id', 'guest')

        print(f"📝 图像参数:")
        print(f"   - message: {message}")
        print(f"   - user_id: {user_id}")

        # 调用 AI 图像服务
        print("🔄 调用 AI 服务...")
        result = ai_banker.chat_image(image_file, message, user_id)
        print(f"🤖 图像响应: {result}")

        return jsonify({
            "success": True,
            "image_analysis": result.get('analysis', ''),
            "response": result.get('response', '')
        })

    except Exception as e:
        print(f"❌ AI 图像接口异常：{str(e)}")
        print(f"❌ 错误堆栈：\n{traceback.format_exc()}")
        return jsonify({
            "success": False,
            "error": f"AI 图像服务异常：{str(e)}"
        }), 500

@ai_bp.route('/advice', methods=['GET'])
def get_investment_advice():
    """获取投资建议"""
    try:
        account_id = request.args.get('accountId')

        if not account_id:
            return jsonify({
                "success": False,
                "error": "请提供 accountId 参数"
            }), 400

        # 调用 AI 服务获取投资建议
        advice = ai_banker.get_investment_advice(account_id)

        return jsonify({
            "success": True,
            "advice": advice
        })

    except Exception as e:
        print(f"❌ 投资建议接口异常：{str(e)}")
        print(f"❌ 错误堆栈：\n{traceback.format_exc()}")
        return jsonify({
            "success": False,
            "error": f"服务异常：{str(e)}"
        }), 500

@ai_bp.route('/analyze-spending', methods=['GET'])
def analyze_spending():
    """支出分析"""
    try:
        account_id = request.args.get('accountId')

        if not account_id:
            return jsonify({
                "success": False,
                "error": "请提供 accountId 参数"
            }), 400

        # 调用 AI 服务进行支出分析
        analysis = ai_banker.analyze_spending(account_id)

        return jsonify({
            "success": True,
            "analysis": analysis
        })

    except Exception as e:
        print(f"❌ 支出分析接口异常：{str(e)}")
        print(f"❌ 错误堆栈：\n{traceback.format_exc()}")
        return jsonify({
            "success": False,
            "error": f"服务异常：{str(e)}"
        }), 500

@ai_bp.route('/ocr/extract', methods=['POST'])
def ocr_extract():
    """OCR文本提取接口"""
    try:
        if 'image' not in request.files:
            return jsonify({
                "success": False,
                "error": "请上传图像文件"
            }), 400
        
        image_file = request.files['image']
        image_data = image_file.read()
        
        # 使用图像服务提取文本
        if ai_banker.image_enabled:
            image = Image.open(io.BytesIO(image_data))
            text = ai_banker.image_service._extract_text(image)
            
            return jsonify({
                "success": True,
                "text": text,
                "text_length": len(text),
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            })
        else:
            return jsonify({
                "success": False,
                "error": "图像服务未启用"
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@ai_bp.route('/voice/languages', methods=['GET'])
def get_supported_languages():
    """获取支持的语音语言"""
    if ai_banker.voice_enabled:
        languages = ai_banker.voice_service.get_supported_languages()
        return jsonify({
            "success": True,
            "languages": languages
        })
    else:
        return jsonify({
            "success": False,
            "error": "语音服务未启用"
        }), 500

@ai_bp.route('/validate/id-card', methods=['POST'])
def validate_id_card():
    """验证身份证图片"""
    try:
        if 'image' not in request.files:
            return jsonify({
                "success": False,
                "error": "请上传身份证图片"
            }), 400
        
        image_file = request.files['image']
        image_data = image_file.read()
        
        if ai_banker.image_enabled:
            result = ai_banker.image_service.validate_id_card(image_data)
            return jsonify({
                "success": True,
                "validation_result": result,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            })
        else:
            return jsonify({
                "success": False,
                "error": "图像服务未启用"
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@ai_bp.route('/system/capabilities', methods=['GET'])
def system_capabilities():
    """获取系统能力信息"""
    info = ai_banker.get_system_info()
    
    capabilities = {
        "text_chat": True,
        "voice_chat": ai_banker.voice_enabled,
        "image_chat": ai_banker.image_enabled,
        "ocr_extraction": ai_banker.image_enabled,
        "financial_document_analysis": ai_banker.image_enabled,
        "id_card_validation": ai_banker.image_enabled,
        "multilingual_support": ai_banker.voice_enabled,
        "knowledge_base": True,
        "real_time_response": True
    }
    
    return jsonify({
        "success": True,
        "capabilities": capabilities,
        "system_info": info
    })