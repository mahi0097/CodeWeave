// frontend/vite-project/src/components/ResizableLayout.jsx
import React, { useState, useRef, useEffect } from 'react';
import './ResizableLayout.css';

const ResizableLayout = ({ 
  sidebar, 
  editor, 
  rightPanel,
  isRightPanelClosed, // Add this prop
  onChatDetach,
  onChatMinimize,
  isChatDetached,
  isChatMinimized,
  chatMessages,
  chatInput,
  setChatInput,
  sendChatMessage,
  socket,
  roomId,
  userName,
  chatPosition = { x: 100, y: 100 }
}) => {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingRightPanel, setIsResizingRightPanel] = useState(false);
  const [isDraggingChat, setIsDraggingChat] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [floatingChatPosition, setFloatingChatPosition] = useState(chatPosition);
  const [isFloating, setIsFloating] = useState(false);
  const [detachedChatWindow, setDetachedChatWindow] = useState(null);

  const containerRef = useRef(null);
  const sidebarResizeRef = useRef(null);
  const rightPanelResizeRef = useRef(null);
  const floatingChatRef = useRef(null);

  // Sidebar resize functionality
  const handleSidebarMouseDown = (e) => {
    setIsResizingSidebar(true);
    e.preventDefault();
  };

  // Right panel resize functionality
  const handleRightPanelMouseDown = (e) => {
    if (!isFloating && !isRightPanelClosed) { // Don't allow resize when closed
      setIsResizingRightPanel(true);
      e.preventDefault();
    }
  };

  // Chat drag functionality
  const handleChatDragStart = (e) => {
    if (isFloating) {
      setIsDraggingChat(true);
      const rect = floatingChatRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingSidebar) {
        const newWidth = Math.max(200, Math.min(400, e.clientX));
        setSidebarWidth(newWidth);
      }
      
      if (isResizingRightPanel && !isFloating && !isRightPanelClosed) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = Math.max(250, Math.min(500, containerRect.right - e.clientX));
        setRightPanelWidth(newWidth);
      }

      if (isDraggingChat && isFloating) {
        setFloatingChatPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingRightPanel(false);
      setIsDraggingChat(false);
    };

    if (isResizingSidebar || isResizingRightPanel || isDraggingChat) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizingSidebar, isResizingRightPanel, isDraggingChat, dragOffset, isFloating, isRightPanelClosed]);

  // Update detached chat window when messages change
  useEffect(() => {
    if (detachedChatWindow && !detachedChatWindow.closed) {
      renderChatInNewWindow(detachedChatWindow);
    }
  }, [chatMessages, chatInput]);

  // Cleanup detached window on unmount
  useEffect(() => {
    return () => {
      if (detachedChatWindow && !detachedChatWindow.closed) {
        detachedChatWindow.close();
      }
    };
  }, [detachedChatWindow]);

  const toggleChatMinimize = () => {
    onChatMinimize(!isChatMinimized);
  };

  const detachChat = () => {
    onChatDetach(!isChatDetached);
  };

  const attachChat = () => {
    onChatDetach(false);
  };

  const openChatInNewWindow = () => {
    const newWindow = window.open(
      '',
      'ChatWindow',
      'width=450,height=600,scrollbars=yes,resizable=yes,status=no,location=no,toolbar=no,menubar=no'
    );

    if (newWindow) {
      setDetachedChatWindow(newWindow);
      
      newWindow.addEventListener('beforeunload', () => {
        setDetachedChatWindow(null);
      });
      
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
            font-family: system-ui, -apple-system, sans-serif;
          }
          
          body {
            background-color: #161719;
            color: #fff;
            height: 100vh;
            display: flex;
            flex-direction: column;
          }
          
          .detached-chat-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            padding: 1rem;
          }
          
          .detached-chat-header {
            background-color: #6725d9;
            color: white;
            padding: 1rem;
            margin: -1rem -1rem 1rem -1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .detached-chat-title {
            font-weight: 600;
            font-size: 1.1rem;
          }
          
          .detached-close-btn {
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 3px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .detached-close-btn:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
          
          .detached-chat-messages {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 1rem;
            padding: 0.5rem;
            background-color: #191a1b;
            border-radius: 8px;
            border: 1px solid #333;
          }
          
          .detached-chat-message {
            margin-bottom: 0.5rem;
            padding: 0.5rem;
            background: #2c3e50;
            border-radius: 4px;
            word-break: break-word;
          }
          
          .detached-chat-user {
            font-weight: bold;
            color: #7ed6df;
            margin-right: 0.5rem;
          }
          
          .detached-chat-input-form {
            display: flex;
            gap: 0.5rem;
          }
          
          .detached-chat-input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid #333;
            border-radius: 4px;
            background-color: #191a1b;
            color: white;
            font-size: 0.9rem;
          }
          
          .detached-chat-input:focus {
            outline: none;
            border-color: #6725d9;
          }
          
          .detached-chat-send-btn {
            background-color: #6725d9;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background-color 0.3s ease;
          }
          
          .detached-chat-send-btn:hover {
            background-color: #793be4;
          }
          
          .detached-chat-empty {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 2rem;
          }
        </style>
      `;

      renderChatInNewWindow(newWindow);
    }
  };

  const renderChatInNewWindow = (targetWindow) => {
    if (!targetWindow || targetWindow.closed) return;
    
    targetWindow.document.body.innerHTML = `
      <div class="detached-chat-container">
        <div class="detached-chat-header">
          <div class="detached-chat-title">💬 Chat - Room: ${roomId}</div>
          <button class="detached-close-btn" onclick="window.close()">✕</button>
        </div>
        
        <div class="detached-chat-messages" id="detached-messages">
          ${chatMessages.length === 0 
            ? '<div class="detached-chat-empty">No messages yet. Start the conversation!</div>'
            : chatMessages.map(msg => `
                <div class="detached-chat-message">
                  <span class="detached-chat-user">${msg.userName ? msg.userName.slice(0, 8) : 'User'}:</span>
                  ${msg.message || ''}
                </div>
              `).join('')
          }
        </div>
        
        <form class="detached-chat-input-form" id="detached-chat-form">
          <input 
            class="detached-chat-input" 
            type="text" 
            placeholder="Type a message..." 
            maxlength="200"
            id="detached-input"
          />
          <button type="submit" class="detached-chat-send-btn">Send</button>
        </form>
      </div>
    `;

    const form = targetWindow.document.getElementById('detached-chat-form');
    const input = targetWindow.document.getElementById('detached-input');
    
    if (input) {
      input.value = chatInput || "";
      input.addEventListener('input', (e) => {
        setChatInput(e.target.value);
      });
      input.focus();
    }
    
    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (message) {
          setChatInput(message);
          const syntheticEvent = {
            preventDefault: () => {},
            target: { value: message }
          };
          sendChatMessage(syntheticEvent);
          input.value = '';
          setChatInput('');
        }
      });

      input.addEventListener('input', (e) => {
        setChatInput(e.target.value);
      });

      input.focus();
    }

    const messagesContainer = targetWindow.document.getElementById('detached-messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  const openChatInNewTab = () => {
    const chatWindow = window.open('', '_blank', 'width=400,height=600');
    if (chatWindow) {
      chatWindow.document.write(`
        <html>
          <head>
            <title>Chat - Collaborative Code Editor</title>
            <style>
              body { margin: 0; font-family: system-ui, sans-serif; background: #191a1b; color: white; }
              .chat-container { height: 100vh; padding: 1rem; box-sizing: border-box; }
            </style>
          </head>
          <body>
            <div class="chat-container">
              <h3>Chat moved to new tab</h3>
              <p>The chat functionality will be available here.</p>
            </div>
          </body>
        </html>
      `);
    }
  };

  return (
    <div className="resizable-layout" ref={containerRef}>
      {/* Sidebar */}
      <div 
        className="resizable-sidebar" 
        style={{ width: `${sidebarWidth}px` }}
      >
        {sidebar}
      </div>

      {/* Sidebar resize handle */}
      <div
        className="resize-handle sidebar-resize"
        ref={sidebarResizeRef}
        onMouseDown={handleSidebarMouseDown}
      />

      {/* Editor area */}
      <div className="resizable-editor">
        {editor}
      </div>

      {/* Right Panel resize handle - only show when panel is not closed */}
      {rightPanel && !isChatDetached && !isRightPanelClosed && (
        <div
          className="resize-handle rightpanel-resize"
          ref={rightPanelResizeRef}
          onMouseDown={handleRightPanelMouseDown}
        />
      )}
      
      {/* Right Panel */}
      {rightPanel && !isChatDetached && (
        <div 
          className={`resizable-rightpanel ${isRightPanelClosed ? 'closed' : ''}`}
          style={{ width: isRightPanelClosed ? '60px' : `${rightPanelWidth}px` }}
        >
          {rightPanel}
        </div>
      )}

      {/* Floating chat panel */}
      {isFloating && (
        <div
          className="floating-chat"
          ref={floatingChatRef}
          style={{
            left: `${floatingChatPosition.x}px`,
            top: `${floatingChatPosition.y}px`,
            width: `${rightPanelWidth}px`
          }}
        >
          <div 
            className="floating-chat-header"
            onMouseDown={handleChatDragStart}
          >
            <span>💬 Chat (Floating)</span>
            <div className="floating-chat-controls">
              <button 
                className="chat-control-btn attach"
                onClick={attachChat}
                title="Attach Chat Back"
              >
                📎
              </button>
              <button 
                className="chat-control-btn new-tab"
                onClick={openChatInNewTab}
                title="Open in New Tab"
              >
                📄
              </button>
            </div>
          </div>
          <div className="floating-chat-content">
            {rightPanel}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResizableLayout;