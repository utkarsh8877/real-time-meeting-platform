import React from "react";

const ErrorMessage = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="alert alert-error">
      <div className="alert-content">
        <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="alert-dismiss" aria-label="Dismiss">
          &times;
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
