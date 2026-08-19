import React from "react";
import { formatTime } from "../utils/formatters";

const ChatMessage = ({ message, isSelf }) => {
  const senderName = message.sender?.name || "Participant";
  const initial = senderName.charAt(0).toUpperCase();
  const time = formatTime(message.timestamp || message.createdAt);

  return (
    <div className={`chat-message ${isSelf ? "chat-message-self" : "chat-message-other"}`}>
      {!isSelf && (
        <div className="message-avatar" title={senderName}>
          {initial}
        </div>
      )}
      <div className="message-bubble-wrapper">
        {!isSelf && <div className="message-sender-name">{senderName}</div>}
        <div className="message-bubble">
          <p className="message-text">{message.message}</p>
          <span className="message-time">{time}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
