// frontend/vite-project/src/components/RightPanel.jsx
import { useState, useRef, useEffect } from 'react';
import Chatbot from './Chatbot';
import './RightPanel.css';

const RightPanel = ({ 
  chatMessages, 
  chatInput, 
  onChatInputChange, 
  onSendChatMessage,
  geminiApiKey,
  userName,
  isClosed,
  onToggleClose
}) => {
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current && activeTab === 'chat') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendChatMessage(e);
    }
  };

  // If closed, only show the reopen button
  if (isClosed) {
    return (
      <div className="right-panel-closed">
        <button 
          className="reopen-button"
          onClick={onToggleClose}
          title="Open chat panel"
        >
          <span className="reopen-icon">💬</span>
          <span className="reopen-text">Chat</span>
          {chatMessages.length > 0 && (
            <span className="reopen-badge">{chatMessages.length}</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="right-panel-container">
      {/* Panel Header with Close Button */}
      <div className="panel-header">
        <div className="panel-header-tabs">
          <button
            className={`modern-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <span className="tab-icon">💬</span>
            <span className="tab-label">Chat</span>
            {chatMessages.length > 0 && activeTab !== 'chat' && (
              <span className="notification-badge">{chatMessages.length}</span>
            )}
          </button>
          <button
            className={`modern-tab ${activeTab === 'chatbot' ? 'active' : ''}`}
            onClick={() => setActiveTab('chatbot')}
          >
            <span className="tab-icon">🤖</span>
            <span className="tab-label">AI Assistant</span>
          </button>
        </div>
        <button 
          className="close-button"
          onClick={onToggleClose}
          title="Close panel"
        >
          <span className="close-icon">✕</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="modern-tab-content">
        {activeTab === 'chat' ? (
          <div className="chat-section">
            {/* Chat Messages Area */}
            <div className="chat-messages-area" ref={chatContainerRef}>
              {chatMessages.length === 0 ? (
                <div className="empty-chat-state">
                  <div className="empty-chat-icon">💬</div>
                  <h3>No messages yet</h3>
                  <p>Start a conversation with your team!</p>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`chat-bubble ${msg.userName === userName ? 'own-message' : 'other-message'}`}
                    >
                      <div className="chat-bubble-header">
                        <span className="chat-user-name">
                          {msg.userName === userName ? 'You' : msg.userName?.slice(0, 12)}
                        </span>
                        <span className="chat-time">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="chat-bubble-content">
                        {msg.message}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Input Area */}
            <div className="chat-input-area">
              <div className="chat-input-wrapper">
                <textarea
                  className="chat-input-field"
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={(e) => onChatInputChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="1"
                  style={{ overflowY: 'auto' }}
                />
                <button 
                  className="chat-send-button"
                  onClick={onSendChatMessage}
                  disabled={!chatInput.trim()}
                  aria-label="Send message"
                >
                  <span>📤</span>
                  <span className="send-text">Send</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="chatbot-section">
            <Chatbot apiKey={geminiApiKey} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
