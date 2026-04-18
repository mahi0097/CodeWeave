// frontend/vite-project/src/components/Chatbot.jsx
import { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const DEFAULT_GEMINI_MODEL = 'models/gemini-flash-latest';

const normalizeGeminiModel = (value) => {
  if (!value) return DEFAULT_GEMINI_MODEL;

  const trimmed = value.trim();

  // Accept a full REST URL, a REST path with suffix, or a plain model id.
  if (trimmed.startsWith('https://')) {
    const match = trimmed.match(/\/v1beta\/(models\/[^:?]+)(?::generateContent)?/);
    if (match?.[1]) return match[1];
  }

  const withoutSuffix = trimmed.replace(/:generateContent$/, '');
  return withoutSuffix.startsWith('models/')
    ? withoutSuffix
    : `models/${withoutSuffix}`;
};

const Chatbot = ({ apiKey }) => {
  const geminiModel = normalizeGeminiModel(import.meta.env.VITE_GEMINI_MODEL);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    if (!apiKey) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Gemini API key is missing. Add VITE_GEMINI_API_KEY in your frontend .env file and restart Vite.',
        timestamp: new Date(),
        isError: true
      }]);
      return;
    }
    
    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${geminiModel}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: input }],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || `Gemini request failed with status ${response.status}`
        );
      }

      const text =
        data?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text)
          .filter(Boolean)
          .join('\n') || 'No response received from Gemini.';

      const botMessage = { 
        role: 'assistant', 
        content: text,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Sorry, I encountered an error while contacting Gemini.';

      if (error?.message?.includes('429') || error?.message?.toLowerCase().includes('quota')) {
        errorMessage = 'Your Gemini API key is valid, but the project has no available quota right now. Check billing, free-tier limits, or try again later.';
      } else if (error?.message?.includes('404') || error?.message?.toLowerCase().includes('not found')) {
        errorMessage = `The configured Gemini model (${geminiModel}) is not available for this API/project.`;
      } else if (error?.message?.toLowerCase().includes('api key not valid')) {
        errorMessage = 'The Gemini API key is invalid. Verify the key value and make sure the Gemini API is enabled.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage,
        timestamp: new Date(),
        isError: true
      }]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-wrapper">
      <div className="chatbot-messages-area">
        {messages.length === 0 && (
          <div className="chatbot-welcome">
            <div className="welcome-icon">🤖</div>
            <h3>AI Coding Assistant</h3>
            <p>Ask me anything about coding!</p>
            <div className="suggestion-chips">
              <button onClick={() => setInput("How do I debug JavaScript code?")}>
                🔍 Debug code
              </button>
              <button onClick={() => setInput("Explain this code to me")}>
                📖 Explain code
              </button>
              <button onClick={() => setInput("Best practices for React")}>
                ⚛️ React best practices
              </button>
              <button onClick={() => setInput("Write a Python function")}>
                🐍 Python function
              </button>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`chatbot-message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content-wrapper">
              <div className="message-header">
                <strong>{msg.role === 'user' ? 'You' : 'AI Assistant'}</strong>
                <span className="message-time">
                  {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={`message-content ${msg.isError ? 'error' : ''}`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="chatbot-message assistant loading">
            <div className="message-avatar">🤖</div>
            <div className="message-content-wrapper">
              <div className="message-header">
                <strong>AI Assistant</strong>
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chatbot-input-area">
        <div className="chatbot-input-wrapper">
          <textarea
            className="chatbot-input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about coding..."
            rows="1"
            disabled={loading}
          />
          <button 
            className="chatbot-send-btn" 
            onClick={sendMessage} 
            disabled={loading || !input.trim()}
          >
            {loading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
