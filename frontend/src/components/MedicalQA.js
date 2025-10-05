import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import './MedicalQA.css';

const ChatBot = ({ user }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const exampleMessages = [
    "Hello! How are you?",
    "Can you tell me a joke?",
    "What's the weather like today?",
    "Tell me about yourself",
    "What can you help me with?"
  ];

  // Load chat history when component mounts
  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.token) return;
      
      try {
        const response = await fetch('http://localhost:5000/history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const formattedMessages = data.history.flatMap(conv => [
            { sender: 'user', text: conv.user_message },
            { sender: 'bot', text: conv.assistant_reply }
          ]);
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    const currentMessage = message;
    setMessages(prev => [...prev, { sender: 'user', text: currentMessage }]);
    setMessage('');

    try {
      const freshToken = await auth.currentUser.getIdToken(true);
      
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshToken}`,
        },
        body: JSON.stringify({ message: currentMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Sorry, something went wrong. Please try again.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setMessage(example);
  };

  const clearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all chat history?')) return;
    
    try {
      const response = await fetch('http://localhost:5000/clear-history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        setMessages([]);
        alert('Chat history cleared!');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('Failed to clear history');
    }
  };

  if (loadingHistory) {
    return <div className="loading">Loading chat history...</div>;
  }

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <h3>English Practice Chat</h3>
        <button onClick={clearHistory} className="clear-btn">
          Clear History
        </button>
      </div>
      <p className="description">Practice English with AI! All your conversations are saved.</p>
      
      <div className="chat-container">
        <div className="messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>Start practicing English! Type a message or try one of these:</p>
              <div className="example-messages">
                {exampleMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className="example-message"
                    onClick={() => handleExampleClick(msg)}
                  >
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <div className="message-content">
                  {msg.text}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message bot">
              <div className="message-content loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="message-form">
          <div className="input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message in English..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !message.trim()}>
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;