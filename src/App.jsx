import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from './services/geminiService';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;
    
    setError(null);
    setMessages(prevMessages => [...prevMessages, { text: trimmedMessage, sender: 'user' }]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const response = await sendMessageToGemini(trimmedMessage);
      setMessages(prevMessages => [...prevMessages, { text: response, sender: 'bot' }]);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setMessages(prevMessages => [...prevMessages, { 
        text: `Error: ${error.message}`, 
        sender: 'bot',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <h1>Chat Buddy</h1>
        </div>
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender} ${message.isError ? 'error' : ''}`}>
              {message.text}
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form className="chat-input-container" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="message-input"
            autoComplete="off"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!inputMessage.trim() || isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;

