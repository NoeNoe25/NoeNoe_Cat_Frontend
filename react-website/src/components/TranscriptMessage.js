import React from 'react';
import ChatMessage from './ChatMessage.js';

const TranscriptMessage = ({ finalTranscript, partialTranscript }) => {
  const displayText = finalTranscript 
    ? `${finalTranscript} ${partialTranscript}`.trim()
    : partialTranscript;

  if (!displayText) return null;

  return (
    <ChatMessage sender="transcript" message={displayText} />
  );
};

export default TranscriptMessage;