import React, { useState } from "react";

const MeetingHeader = ({ meetingId, isHost, onLeave, onEnd }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="meeting-header">
      <div className="meeting-header-info">
        <div className="meeting-id-badge">
          <span className="label">Meeting ID:</span>
          <span className="id-text">{meetingId}</span>
          <button
            onClick={handleCopy}
            className="btn-copy"
            title="Copy Meeting ID"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <div className="status-indicator">
          <span className="pulse-dot active"></span> Active Session
        </div>
      </div>

      <div className="meeting-header-actions">
        <button onClick={onLeave} className="btn btn-outline-danger">
          Leave Meeting
        </button>
        {isHost && (
          <button onClick={onEnd} className="btn btn-danger">
            End Meeting
          </button>
        )}
      </div>
    </div>
  );
};

export default MeetingHeader;
