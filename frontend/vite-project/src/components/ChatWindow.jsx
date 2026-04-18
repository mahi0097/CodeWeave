import React, { useEffect, useRef } from 'react';
import './ChatWindow.css';

const ChatWindow = ({ 
  chatMessages, 
  chatInput, 
  setChatInput, 
  sendChatMessage, 
  onClose 
}) => {
  const windowRef = useRef(null);

  useEffect(() => {
    // Open new window for detached chat with larger size
    const newWindow = window.open(
      '',
      'ChatWindow',
      'width=500,height=600,scrollbars=yes,resizable=yes,status=no,location=no,toolbar=no,menubar=no'
    );

    if (newWindow) {
      windowRef.current = newWindow;
      
      // Set up the detached window content
      newWindow.document.title = 'Collaborative Code Editor - Chat';
      newWindow.document.head.innerHTML = `
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chat Window</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Outfit', sans-serif;
          }
          
          body {
            background-color: #161719;
            color: #fff;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          
          .detached-chat-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            padding: 1rem;
            gap: 1rem;
          }
          
          .detached-chat-header {
            background: linear-gradient(135deg, #2563eb, #1e40af);
            color: white;
            padding: 1rem 1.5rem;
            margin: -1rem -1rem 0 -1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 12px 12px 0 0;
          }
          
          .detached-chat-title {
            font-weight: 600;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .detached-close-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .detached-close-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.05);
          }
          
          .detached-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
            background-color: #1e1e1e;
            border-radius: 12px;
            border: 1px solid #333;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .detached-chat-messages::-webkit-scrollbar {
            width: 6px;
          }
          
          .detached-chat-messages::-webkit-scrollbar-track {
            background: #2a2a2a;
            border-radius: 3px;
          }
          
          .detached-chat-messages::-webkit-scrollbar-thumb {
            background: #4a4a4e;
            border-radius: 3px;
          }
          
          .detached-chat-message {
            padding: 10px 14px;
            background: #2c3e50;
            border-radius: 12px;
            word-break: break-word;
            animation: fadeIn 0.3s ease;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .detached-chat-user {
            font-weight: bold;
            color: #60a5fa;
            margin-right: 8px;
          }
          
          .detached-chat-input-form {
            display: flex;
            gap: 12px;
            padding: 1rem;
            background-color: #1e1e1e;
            border-radius: 12px;
            border: 1px solid #333;
          }
          
          .detached-chat-input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #333;
            border-radius: 24px;
            background-color: #2a2a2a;
            color: white;
            font-size: 14px;
            transition: all 0.2s ease;
            outline: none;
          }
          
          .detached-chat-input:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
          }
          
          .detached-chat-input::placeholder {
            color: #888;
          }
          
          .detached-chat-send-btn {
            background: linear-gradient(135deg, #2563eb, #1e40af);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 24px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
          }
          
          .detached-chat-send-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          }
          
          .detached-chat-empty {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          
          .empty-icon {
            font-size: 48px;
            opacity: 0.5;
          }
        </style>
      `;

      // Handle window close
      newWindow.addEventListener('beforeunload', () => {
        onClose();
      });

      // Initial render
      renderChatContent(newWindow);
    }

    return () => {
      if (windowRef.current && !windowRef.current.closed) {
        windowRef.current.close();
      }
    };
  }, []);

  const renderChatContent = (targetWindow) => {
    if (!targetWindow || targetWindow.closed) return;

    targetWindow.document.body.innerHTML = `
      <div class="detached-chat-container">
        <div class="detached-chat-header">
          <div class="detached-chat-title">
            <span>💬</span>
            <span>Team Chat</span>
          </div>
          <button class="detached-close-btn" onclick="window.close()">✕</button>
        </div>
        
        <div class="detached-chat-messages" id="detached-messages">
          ${chatMessages.length === 0 
            ? `<div class="detached-chat-empty">
                <div class="empty-icon">💬</div>
                <div>No messages yet</div>
                <div style="font-size: 12px;">Start a conversation with your team!</div>
               </div>`
            : chatMessages.map(msg => `
                <div class="detached-chat-message">
                  <span class="detached-chat-user">${msg.userName?.slice(0, 12) || 'User'}:</span>
                  <span>${msg.message || ''}</span>
                </div>
              `).join('')
          }
        </div>
        
        <form class="detached-chat-input-form" id="detached-chat-form">
          <input 
            class="detached-chat-input" 
            type="text" 
            placeholder="Type your message..." 
            maxlength="500"
            id="detached-input"
            autocomplete="off"
          />
          <button type="submit" class="detached-chat-send-btn">
            <span>📤</span> Send
          </button>
        </form>
      </div>
    `;

    // Add event listeners
    const form = targetWindow.document.getElementById('detached-chat-form');
    const input = targetWindow.document.getElementById('detached-input');
    
    if (input) {
      input.value = chatInput || "";
      input.focus();
      
      // Add input event listener
      input.addEventListener('input', (e) => {
        setChatInput(e.target.value);
      });
      
      // Add keypress event for Enter key
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (input.value.trim()) {
            const submitEvent = new Event('submit');
            form.dispatchEvent(submitEvent);
          }
        }
      });
    }
    
    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (message) {
          // Create a synthetic event for sendChatMessage
          const syntheticEvent = {
            preventDefault: () => {},
            target: { value: message }
          };
          sendChatMessage(syntheticEvent);
          input.value = '';
          setChatInput('');
          input.focus();
        }
      });
    }

    // Auto-scroll to bottom
    const messagesContainer = targetWindow.document.getElementById('detached-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  // Re-render when messages change
  useEffect(() => {
    if (windowRef.current && !windowRef.current.closed) {
      renderChatContent(windowRef.current);
    }
  }, [chatMessages, chatInput]);

  // This component doesn't render anything in the main window
  return null;
};

export default ChatWindow;