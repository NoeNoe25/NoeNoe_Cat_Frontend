import React from 'react';

const InputArea = ({
  inputValue,
  onInputChange,
  onSendMessage,
  onToggleRecording,
  isRecording,
  isVoskConnected,
  hasAudioPermission
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSendMessage();
    }
  };

  const getMicButtonColor = () => {
    if (!isVoskConnected || !hasAudioPermission) return '#ccc';
    return isRecording ? '#ff4444' : '#3cba54';
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: 'white',
      borderTop: '1px solid #ddd'
    }}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        style={{
          flexGrow: 1,
          padding: '10px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          marginRight: '10px'
        }}
      />
      
      <button
        onClick={onSendMessage}
        style={{
          padding: '10px 20px',
          backgroundColor: '#1f73b7',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
          border: 'none',
          borderRadius: '4px',
          marginRight: '10px'
        }}
      >
        Send
      </button>

      <button
        onClick={onToggleRecording}
        disabled={!isVoskConnected || !hasAudioPermission}
        style={{
          padding: '10px 16px',
          backgroundColor: getMicButtonColor(),
          color: 'white',
          fontSize: '16px',
          border: 'none',
          borderRadius: '4px',
          cursor: (isVoskConnected && hasAudioPermission) ? 'pointer' : 'not-allowed'
        }}
        title={!isVoskConnected ? "Vosk server not connected" : !hasAudioPermission ? "Microphone permission denied" : ""}
      >
        {isRecording ? '⏹ Stop' : '🎤 Start'}
      </button>
    </div>
  );
};

export default InputArea;