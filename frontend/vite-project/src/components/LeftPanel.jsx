// frontend/vite-project/src/components/LeftPanel.jsx
import FileExplorer from './FileExplorer';

const LeftPanel = ({ 
  roomId, userName, users, typing,
  files, activeFile, onFileCreate, onFileDelete, 
  onFileRename, onFileSwitch,
  filename, pendingFilename, onFilenameChange, 
  onSaveFilename, language, onLanguageChange,
  showAllLanguages, onToggleLanguages, onLeaveRoom,
  undoRedoState, onUndo, onRedo, isUndoing, isRedoing,
  onCreateCheckpoint, isCreatingCheckpoint, onShowVersionHistory,
  onToggleTheme, theme,
  copyRoomId  // ← CRITICAL: This must be here!
}) => {
  const popularLanguages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'cpp', name: 'C++' },
    { id: 'c', name: 'C' },
    { id: 'html', name: 'HTML' },
    { id: 'css', name: 'CSS' },
  ];

  return (
    <div className="sidebar">
      {/* Theme Toggle */}
      <button onClick={onToggleTheme} className="theme-toggle-btn">
        {theme === "light" ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
      
      {/* Room Info */}
      <div className="room-info">
        <h2>Code Room: {roomId}</h2>
        <button className="copy-room-id-btn" onClick={copyRoomId}>
          <span className="copy-icon">📋</span>
          <span className="copy-text">Copy ID</span>
        </button>
      </div>
      
      {/* Users List */}
      <h3>Users in Room: <span style={{ fontWeight: "bold", color: "#2563eb" }}>{users.length}</span></h3>
      <ul className="users-list">
        {users.map((user, index) => (
          <li key={index}>
            <span className="user-dot">●</span> {user.slice(0, 12)}
          </li>
        ))}
      </ul>
      <p className="typing-indicator">{typing}</p>

      {/* File Explorer */}
      <div className="file-explorer-section">
        <h3>Files</h3>
        <FileExplorer
          files={files}
          activeFile={activeFile}
          onFileCreate={onFileCreate}
          onFileDelete={onFileDelete}
          onFileRename={onFileRename}
          onFileSwitch={onFileSwitch}
          userName={userName}
        />
      </div>

      {/* File Settings */}
      <div className="file-controls">
        <h3>Current File Settings</h3>
        <div className="filename-input-group">
          <label htmlFor="filename">Filename:</label>
          <input
            id="filename"
            type="text"
            className="filename-input"
            value={pendingFilename || filename}
            onChange={onFilenameChange}
            placeholder="e.g., main.js"
          />
          <button onClick={onSaveFilename} className="save-filename-btn">
            Rename
          </button>
        </div>

        <div className="language-selector-group">
          <label htmlFor="language">Language:</label>
          <select id="language" className="language-selector" value={language} onChange={onLanguageChange}>
            {popularLanguages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leave Room Button */}
      <button className="leave-button" onClick={onLeaveRoom}>
        Leave Room
      </button>

      {/* Version Controls */}
      <div className="version-controls">
        <h3>Version History</h3>
        <div className="version-buttons">
          <button
            className={`version-btn undo-btn ${!undoRedoState.canUndo || isUndoing ? "disabled" : ""}`}
            onClick={onUndo}
            disabled={!undoRedoState.canUndo || isUndoing}
          >
            {isUndoing ? "Undoing..." : "Undo"}
          </button>
          <button
            className={`version-btn redo-btn ${!undoRedoState.canRedo || isRedoing ? "disabled" : ""}`}
            onClick={onRedo}
            disabled={!undoRedoState.canRedo || isRedoing}
          >
            {isRedoing ? "Redoing..." : "Redo"}
          </button>
        </div>
        <div className="version-info">
          <span className="version-count">
            {undoRedoState.currentVersionIndex + 1} / {undoRedoState.totalVersions}
          </span>
        </div>
        <button className="version-btn history-btn" onClick={onShowVersionHistory}>
          History
        </button>
        <button
          className={`version-btn checkpoint-btn ${isCreatingCheckpoint ? "loading" : ""}`}
          onClick={onCreateCheckpoint}
          disabled={isCreatingCheckpoint}
        >
          {isCreatingCheckpoint ? "Creating..." : "Checkpoint"}
        </button>
      </div>
    </div>
  );
};

export default LeftPanel;