import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import API from "../services/api";
import Navbar from "../components/Navbar";
import MeetingHeader from "../components/MeetingHeader";
import ParticipantList from "../components/ParticipantList";
import ChatPanel from "../components/ChatPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const MeetingRoomPage = () => {
  const { meetingId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    participants,
    messages,
    setMessages,
    sendMessage,
    endMeeting: triggerSocketEndMeeting,
    meetingEnded,
    socketError
  } = useSocket(meetingId, currentUser);

  // 1. Fetch meeting metadata and previous chat history from MongoDB
  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        setLoading(true);
        // Fetch meeting info
        const meetingRes = await API.get(`/meetings/${meetingId}`);
        setMeeting(meetingRes.data.meeting);

        // Fetch previous persistent messages from MongoDB
        const messagesRes = await API.get(`/meetings/${meetingId}/messages?limit=100`);
        setMessages(messagesRes.data.messages || []);
      } catch (err) {
        setError(err.message || "Failed to load meeting room.");
      } finally {
        setLoading(false);
      }
    };

    if (meetingId) {
      fetchMeetingData();
    }
  }, [meetingId, setMessages]);

  // 2. Handle meeting ended event
  useEffect(() => {
    if (meetingEnded) {
      alert("The host has ended this meeting. You will be redirected to the dashboard.");
      navigate("/dashboard");
    }
  }, [meetingEnded, navigate]);

  const handleLeaveMeeting = async () => {
    try {
      await API.post(`/meetings/${meetingId}/leave`);
    } catch (err) {
      console.error("Error leaving meeting:", err.message);
    } finally {
      navigate("/dashboard");
    }
  };

  const handleEndMeeting = async () => {
    if (window.confirm("Are you sure you want to end this meeting for all participants?")) {
      try {
        await API.post(`/meetings/${meetingId}/end`);
        triggerSocketEndMeeting();
        navigate("/dashboard");
      } catch (err) {
        setError(err.message || "Failed to end meeting.");
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Joining meeting room..." />;
  }

  if (error) {
    return (
      <div className="room-error-container">
        <Navbar />
        <div className="card room-error-card">
          <h2>Unable to Join Meeting</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/dashboard")} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isHost = meeting?.host?._id === currentUser?._id;

  return (
    <div className="meeting-room-layout">
      <Navbar />

      <main className="meeting-room-container">
        <MeetingHeader
          meetingId={meeting?.meetingId || meetingId}
          isHost={isHost}
          onLeave={handleLeaveMeeting}
          onEnd={handleEndMeeting}
        />

        <ErrorMessage
          message={socketError}
          onDismiss={() => {}}
        />

        <div className="meeting-room-grid">
          {/* Left: Participant list */}
          <aside className="room-sidebar">
            <ParticipantList
              participants={participants}
              hostId={meeting?.host?._id}
              currentUserId={currentUser?._id}
            />
          </aside>

          {/* Right: Live Chat panel */}
          <section className="room-main-chat">
            <ChatPanel
              messages={messages}
              onSendMessage={sendMessage}
              currentUserId={currentUser?._id}
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default MeetingRoomPage;
