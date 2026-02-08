import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../../services/api';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I am your professional banking AI assistant. I support text, voice, and image inputs. How can I help you today?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputMode, setInputMode] = useState('text'); // 'text', 'voice', 'image'
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // automatically roll to the bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // voice recording function
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });   
      //media recorder API
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        handleVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      addErrorMessage('Cannot access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 处理语音输入
  const handleVoiceInput = async (audioBlob) => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('message', inputMessage);
    formData.append('user_id', localStorage.getItem('user_id') || 'guest');
    formData.append('generate_audio', 'true'); // 请求语音回复

    setIsLoading(true);

    try {
      // 使用api.js的统一配置
      const response = await aiAPI.chatVoice(
        audioBlob, 
        inputMessage, 
        localStorage.getItem('user_id') || 'guest', 
        true
      );

      const data = response.data;
      
      if (data.success) {
        const userMessage = {
          role: 'user',
          content: data.transcribed_text || '[Voice message]',
          timestamp: new Date().toLocaleTimeString(),
          isVoice: true
        };
        setMessages(prev => [...prev, userMessage]);

  
        const assistantMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toLocaleTimeString(),
          sources: data.sources || []
        };
        setMessages(prev => [...prev, assistantMessage]);


        if (data.audio_response) {
          const audioBase64 = data.audio_response;
          const binaryString = atob(audioBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);
          
          // 自动播放语音回复
          const audio = new Audio(audioUrl);
          audio.play();
        }
      }
    } catch (error) {
      console.error('Voice chat error:', error);
      addErrorMessage('Failed to process voice message');
    } finally {
      setIsLoading(false);
    }
  };


  const handleImageInput = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('message', inputMessage);
    formData.append('user_id', localStorage.getItem('user_id') || 'guest');

    setIsLoading(true);

    try {
      const response = await aiAPI.chatImage(
        selectedImage, 
        inputMessage, 
        localStorage.getItem('user_id') || 'guest'
      );

      const data = response.data;
      
      if (data.success) {
        // 添加用户图像消息
        const userMessage = {
          role: 'user',
          content: inputMessage || '[Image analysis requested]',
          timestamp: new Date().toLocaleTimeString(),
          image: imagePreview,
          imageAnalysis: data.image_analysis
        };
        setMessages(prev => [...prev, userMessage]);

        // 添加AI回复
        const assistantMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toLocaleTimeString(),
          sources: data.sources || []
        };
        setMessages(prev => [...prev, assistantMessage]);

        // 清空图像
        setSelectedImage(null);
        setImagePreview(null);
        setInputMessage('');
      }
    } catch (error) {
      console.error('Image chat error:', error);
      addErrorMessage('Failed to process image');
    } finally {
      setIsLoading(false);
    }
  };

  // send text message
  const sendTextMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    if (inputMode === 'image' && selectedImage) {
      await handleImageInput();
      return;
    }

    // 使用api.js的aiAPI.chat方法
    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 使用api.js的统一API调用
      const response = await aiAPI.chat({ 
        message: inputMessage.trim(),
        user_id: localStorage.getItem('user_id') || 'guest'
      });

      const data = response.data;
      
      const assistantMessage = {
        role: 'assistant',
        content: data.success ? data.response : 'Sorry, I encountered an error.',
        timestamp: new Date().toLocaleTimeString(),
        sources: data.sources || []
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Text chat error:', error);
      addErrorMessage('Failed to connect to AI service');
    } finally {
      setIsLoading(false);
    }
  };

  // 辅助函数：添加错误消息
  const addErrorMessage = (message) => {
    const errorMessage = {
      role: 'assistant',
      content: message,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, errorMessage]);
  };

  // 快捷问题点击处理
  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setInputMode('text');
  };

  // 图像选择处理
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB限制
        alert('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setInputMode('image');
    }
  };

  // 清除已选图像
  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setInputMode('text');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 播放语音回复
  const playAudioResponse = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  // 发送消息的统一入口
  const handleSendMessage = (e) => {
    e?.preventDefault();
    
    switch (inputMode) {
      case 'voice':
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
        break;
      case 'image':
        if (selectedImage) {
          handleImageInput();
        }
        break;
      default:
        sendTextMessage(e);
    }
  };

  // 获取发送按钮文本
  const getSendButtonText = () => {
    if (isLoading) return 'Processing...';
    if (inputMode === 'voice') {
      return isRecording ? '🎤 Stop & Send' : '🎤 Start Recording';
    }
    if (inputMode === 'image' && selectedImage) {
      return '📸 Send Image';
    }
    return 'Send';
  };

  // 渲染消息内容
  const renderMessageContent = (msg) => {
    return (
      <div className="message-content">
        <p>{msg.content}</p>
        
        {/* speech message */}
        {msg.isVoice && (
          <div className="voice-indicator">
            <span className="voice-icon">🎤</span>
            <span className="voice-text">Voice message</span>
          </div>
        )}
        
        {/* image overview */}
        {msg.image && (
          <div className="message-image">
            <img src={msg.image} alt="Uploaded" style={{ maxWidth: '200px', borderRadius: '8px' }} />
            {msg.imageAnalysis && (
              <div className="image-analysis">
                <p className="analysis-title">🖼️ Image Analysis:</p>
                <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '8px' }}>
                  {JSON.stringify(msg.imageAnalysis, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
        
        {/* knowledge base sources */}
        {msg.sources && msg.sources.length > 0 && (
          <div className="message-sources">
            <p className="source-title">📚 Reference Sources:</p>
            <ul>
              {msg.sources.map((source, i) => (
                <li key={i}>
                  <span className="source-relevance">Relevance: {source.relevance}</span>
                  <span className="source-content">{source.content}</span>
                  <span className="source-type">({source.type})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chatbot-wrapper">
      <div className="chatbot-container">
        <div className="chatbot-header">
          <div className="header-content">
            <h2>🤖 Professional Banking AI Assistant</h2>
            <p>24/7 Intelligent Financial Consultation | Supports Text, Voice & Image</p>
          </div>
          <div className="header-badges">
            <span className="badge badge-voice">🎤 Voice</span>
            <span className="badge badge-image">📸 Image</span>
            <span className="badge badge-text">💬 Text</span>
          </div>
        </div>

        {/* set input mode */}
        <div className="input-mode-selector">
          <button 
            className={`mode-btn ${inputMode === 'text' ? 'active' : ''}`}
            onClick={() => setInputMode('text')}
            disabled={isLoading}
          >
            <span className="mode-icon">✏️</span>
            <span className="mode-text">Text</span>
          </button>
          <button 
            className={`mode-btn ${inputMode === 'voice' ? 'active' : ''}`}
            onClick={() => setInputMode('voice')}
            disabled={isLoading}
          >
            <span className="mode-icon">🎤</span>
            <span className="mode-text">Voice</span>
          </button>
          <button 
            className={`mode-btn ${inputMode === 'image' ? 'active' : ''}`}
            onClick={() => {
              setInputMode('image');
              fileInputRef.current?.click();
            }}
            disabled={isLoading}
          >
            <span className="mode-icon">📸</span>
            <span className="mode-text">Image</span>
          </button>
        </div>

        {/* chat container */}
        <div className="chat-messages" ref={chatContainerRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-body">
                {renderMessageContent(msg)}
                <div className="message-timestamp">{msg.timestamp}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant loading">
              <div className="message-avatar">🤖</div>
              <div className="message-body">
                <p>
                  {inputMode === 'voice' ? 'Processing voice...' : 
                   inputMode === 'image' ? 'Analyzing image...' : 'Thinking...'}
                </p>
                <div className="loading-dots">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 图像预览区域 */}
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" style={{ maxWidth: '150px' }} />
            <button onClick={clearImage} className="clear-image-btn">
              <span>✕</span>
              <span>Remove</span>
            </button>
          </div>
        )}

        {/* 快捷问题区域 */}
        <div className="quick-questions">
          <p className="quick-title">💡 Common Questions:</p>
          <div className="quick-buttons">
            <button 
              onClick={() => handleQuickQuestion('What is the current deposit interest rate?')}
              disabled={isLoading}
            >
              💰 Deposit Interest Rate
            </button>
            <button 
              onClick={() => handleQuickQuestion('How to apply for a credit card?')}
              disabled={isLoading}
            >
              💳 Credit Card Application
            </button>
            <button 
              onClick={() => handleQuickQuestion('Can you analyze this check image?')}
              disabled={isLoading}
            >
              📄 Check Analysis
            </button>
            <button 
              onClick={() => handleQuickQuestion('What are investment options for beginners?')}
              disabled={isLoading}
            >
              📈 Investment Advice
            </button>
          </div>
        </div>

        {/* 输入区域 */}
        <form id="chat-form" onSubmit={handleSendMessage} className="chat-input-form">
          {/* 隐藏的文件输入 */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*,.jpg,.jpeg,.png,.gif"
            onChange={handleImageSelect}
          />
          
          {/* 文本输入（语音模式时显示录音提示） */}
          {inputMode === 'voice' && isRecording ? (
            <div className="recording-indicator">
              <div className="recording-dot"></div>
              <span>Recording... Click button to stop</span>
            </div>
          ) : (
            <input
              type="text"
              className="chat-input"
              placeholder={
                inputMode === 'voice' ? 'Add optional text with your voice message...' :
                inputMode === 'image' ? 'Add description for the image...' :
                'Type your question here...'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading || (inputMode === 'voice' && isRecording)}
            />
          )}
          
          <button 
            type="submit" 
            className="send-button"
            disabled={
              isLoading || 
              (inputMode === 'text' && !inputMessage.trim()) ||
              (inputMode === 'image' && !selectedImage)
            }
          >
            <span className="send-icon">{inputMode === 'voice' ? '🎤' : inputMode === 'image' ? '📸' : '📤'}</span>
            <span className="send-text">{getSendButtonText()}</span>
          </button>
        </form>

        {/* 语音播放控制 */}
        {audioUrl && (
          <div className="audio-controls">
            <button onClick={playAudioResponse} className="play-audio-btn">
              <span>🔊</span>
              <span>Play AI Voice Response</span>
            </button>
          </div>
        )}

        {/* 底部提示 */}
        <div className="chat-footer">
          <p>⚠️ Disclaimer: AI responses are for reference only. Consult bank staff for formal business.</p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
