// frontend/vite-project/src/components/DraggableVideoCall.jsx
import { useState, useRef, useEffect } from 'react';
import './DraggableVideoCall.css';

const DraggableVideoCall = ({ socket, roomId, userName, joined }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const videoRef = useRef(null);
  const dragRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('.video-controls')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Keep within window bounds
    const maxX = window.innerWidth - 320;
    const maxY = window.innerHeight - 240;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const toggleCamera = () => {
    setHasVideo(!hasVideo);
  };

  return (
    <div 
      className={`draggable-video-call ${isMinimized ? 'minimized' : ''}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
    >
      <div 
        className="video-header"
        onMouseDown={handleMouseDown}
      >
        <div className="video-title">
          <span className="video-icon">📹</span>
          <span>Video Call</span>
        </div>
        <div className="video-controls">
          <button 
            className="video-control-btn"
            onClick={toggleCamera}
            title="Toggle Camera"
          >
            {hasVideo ? '📷' : '🎥'}
          </button>
          <button 
            className="video-control-btn"
            onClick={toggleMinimize}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? '□' : '−'}
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="video-content">
          {hasVideo ? (
            <video 
              ref={videoRef}
              autoPlay
              muted
              className="video-stream"
            />
          ) : (
            <div className="video-placeholder">
              <div className="placeholder-icon">🎥</div>
              <p>Camera is off</p>
              <button onClick={toggleCamera} className="turn-on-btn">
                Turn On Camera
              </button>
            </div>
          )}
          <div className="video-actions">
            <button className="action-btn mic-btn" title="Microphone">
              🎤
            </button>
            <button className="action-btn cam-btn" onClick={toggleCamera} title="Camera">
              {hasVideo ? '📷' : '🎥'}
            </button>
            <button className="action-btn end-btn" title="End Call">
              📞
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggableVideoCall;