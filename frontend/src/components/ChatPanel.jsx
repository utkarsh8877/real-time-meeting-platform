import React, { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

const ChatPanel = ({ messages = [], onSendMessage, currentUserId }) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>Live Meeting Chat</h3>
        <span className="chat-live-indicator">
          <span className="pulse-dot"></span> Live
        </span>
      </div>

      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet.</p>
            <span>Say hello to start the conversation!</span>
          </div>
        ) : (
          messages.map((msg, index) => {
            const senderId = msg.sender?._id || msg.sender;
            const isSelf = senderId === currentUserId;
            return (
              <ChatMessage
                key={msg._id || index}
                message={msg}
                isSelf={isSelf}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
          maxLength={1000}
        />
        <button
          type="submit"
          className="btn btn-primary chat-send-btn"
          disabled={!inputText.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
