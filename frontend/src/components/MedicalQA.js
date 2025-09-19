import React, { useState } from 'react';
import './MedicalQA.css'; // You can reuse your CSS file

const ChatBot = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const exampleMessages = [
    "Hello! How are you?",
    "Can you tell me a joke?",
    "What's the weather like today?",
    "Give me some tips to improve my productivity.",
    "Who won the last football World Cup?"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsLoading(true);
    
    // Add user message to chat
    setMessages(prev => [...prev, { sender: 'user', text: message }]);
    
    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      const data = await response.json();
      
      // Add bot response to chat
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      
    } catch (error) {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Sorry, something went wrong.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  const handleExampleClick = (example) => {
    setMessage(example);
  };

  return (
    <div className="chatbot-container">
      <h3>ChatBot</h3>
      <p className="description">Talk to the bot in English!</p>
      
      <div className="chat-container">
        <div className="messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>Start the conversation here:</p>
              <div className="example-messages">
                <p>Example messages:</p>
                <ul>
                  {exampleMessages.map((msg, index) => (
                    <li key={index} onClick={() => handleExampleClick(msg)}>
                      {msg}
                    </li>
                  ))}
                </ul>
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
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !message.trim()}>
            {isLoading ? 'Processing...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
