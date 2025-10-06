import React from 'react';

const ChatMessage = ({ message, sender, isStreaming = false, children }) => {
  const getMessageStyles = () => {
    const baseStyles = {
      marginBottom: '15px',
      padding: '8px',
      borderRadius: '6px'
    };

    switch (sender) {
      case 'user':
        return {
          ...baseStyles,
          backgroundColor: '#e6f0ff',
          textAlign: 'right',
          borderLeft: '4px solid #1f73b7'
        };
      case 'gemini':
        return {
          ...baseStyles,
          backgroundColor: '#ffffff',
          borderRight: '4px solid #3cba54'
        };
      case 'transcript':
        return {
          ...baseStyles,
          backgroundColor: '#fff3e6',
          borderLeft: '4px solid #f39c12',
          fontStyle: 'italic'
        };
      default:
        return baseStyles;
    }
  };

  const getSenderLabel = () => {
    switch (sender) {
      case 'user': return 'You';
      case 'gemini': return 'Gemini';
      case 'transcript': return 'Voice';
      default: return sender;
    }
  };

  return (
    <div style={getMessageStyles()} className="message">
      <b>{getSenderLabel()}:</b> {isStreaming ? children : message}
    </div>
  );
};

export default ChatMessage;