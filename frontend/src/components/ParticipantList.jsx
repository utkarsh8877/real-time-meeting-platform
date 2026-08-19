import React from "react";
import ParticipantCard from "./ParticipantCard";

const ParticipantList = ({ participants = [], hostId, currentUserId }) => {
  return (
    <div className="participant-list-container">
      <div className="participant-list-header">
        <h3>Participants</h3>
        <span className="participant-count-badge">{participants.length}</span>
      </div>
      <div className="participant-list">
        {participants.map((p, index) => {
          const participantId = p._id || p.userId;
          const isHost = participantId === hostId;
          const isCurrentUser = participantId === currentUserId;

          return (
            <ParticipantCard
              key={participantId || index}
              participant={p}
              isHost={isHost}
              isCurrentUser={isCurrentUser}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ParticipantList;
