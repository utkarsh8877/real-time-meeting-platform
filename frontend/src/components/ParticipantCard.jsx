import React from "react";

const ParticipantCard = ({ participant, isHost, isCurrentUser }) => {
  const name = participant?.name || participant?.userName || "Participant";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={`participant-card ${isCurrentUser ? "is-self" : ""}`}>
      <div className="participant-avatar">
        {initial}
        <span className="online-badge" title="Online"></span>
      </div>
      <div className="participant-info">
        <div className="participant-name-row">
          <span className="participant-name">{name}</span>
          {isCurrentUser && <span className="badge badge-self">You</span>}
        </div>
        <div className="participant-role-row">
          {isHost ? (
            <span className="badge badge-host">Host</span>
          ) : (
            <span className="badge badge-participant">Participant</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantCard;
