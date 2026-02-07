import React, { useState, useEffect, useRef } from 'react';
import AIService from '../../services/aiService';
import { toast } from 'react-toastify';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions] = useState([
    "What's my account balance?",
    "Help me transfer money",
    "Give me investment advice",
    "Analyze my spending",
    "Check for fraud alerts"
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load initial greeting
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: "Hello! I'm your AI banking assistant. How can I help you today?",
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await AIService.chat(input);
      
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: response.message,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chatbot-container">
      <div className="card">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">
              <i className="fas fa-robot me-2"></i>
              AI Banking Assistant
            </h5>
            <small className="opacity-75">Powered by GPT-4</small>
          </div>
          <span className="badge bg-light text-dark">
            <i className="fas fa-bolt me-1"></i>
            Real-time
          </span>
        </div>

        {/* Chat Messages */}
        <div className="card-body chat-body">
          <div className="messages-container">
            {messages.map(message => (
              <div
                key={message.id}
                className={`message ${message.type === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-content">
                  <div className="message-header">
                    {message.type === 'ai' ? (
                      <span className="message-sender text-primary">
                        <i className="fas fa-robot me-1"></i>
                        AI Assistant
                      </span>
                    ) : (
                      <span className="message-sender text-success">
                        <i className="fas fa-user me-1"></i>
                        You
                      </span>
                    )}
                    <span className="message-time text-muted ms-2">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <div className="message-text">{message.content}</div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="message ai-message">
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender text-primary">
                      <i className="fas fa-robot me-1"></i>
                      AI Assistant
                    </span>
                  </div>
                  <div className="message-text">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="card-footer border-0 bg-light">
          <div className="suggestions mb-3">
            <small className="text-muted mb-2 d-block">Quick questions:</small>
            <div className="d-flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={loading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="input-group">
            <textarea
              className="form-control"
              placeholder="Type your question here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              rows="2"
              style={{ resize: 'none' }}
            />
            <button
              className="btn btn-primary"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </div>
          
          <small className="text-muted mt-2 d-block">
            <i className="fas fa-info-circle me-1"></i>
            I can help with balances, transfers, advice, fraud detection, and more
          </small>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;