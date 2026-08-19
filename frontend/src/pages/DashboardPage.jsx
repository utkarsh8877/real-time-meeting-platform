import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import Navbar from "../components/Navbar";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatDate } from "../utils/formatters";

const DashboardPage = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [joinMeetingId, setJoinMeetingId] = useState("");
  const [createdMeeting, setCreatedMeeting] = useState(null);
  const [pastMeetings, setPastMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchMeetingHistory();
  }, []);

  const fetchMeetingHistory = async () => {
    try {
      const res = await API.get("/meetings/user/history");
      setPastMeetings(res.data.meetings || []);
    } catch (err) {
      console.error("Failed to load meeting history:", err.message);
    } finally {
      setLoadingMeetings(false);
    }
  };

  const handleCreateMeeting = async () => {
    setError("");
    setCreating(true);
    try {
      const res = await API.post("/meetings");
      setCreatedMeeting(res.data.meeting);
      fetchMeetingHistory();
    } catch (err) {
      setError(err.message || "Failed to create meeting.");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinMeeting = async (e) => {
    e?.preventDefault();
    const idToJoin = (joinMeetingId || "").trim().toUpperCase();

    if (!idToJoin) {
      setError("Please enter a valid Meeting ID.");
      return;
    }

    setError("");
    setJoining(true);
    try {
      const res = await API.post(`/meetings/${idToJoin}/join`);
      navigate(`/meeting/${res.data.meeting.meetingId}`);
    } catch (err) {
      setError(err.message || "Failed to join meeting. Please verify the ID.");
    } finally {
      setJoining(false);
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome, {currentUser?.name}!</h1>
          <p>Create a meeting or join an active session instantly.</p>
        </div>

        <ErrorMessage message={error} onDismiss={() => setError("")} />

        {/* Modal-like card when a new meeting is created */}
        {createdMeeting && (
          <div className="card meeting-created-banner">
            <div className="created-banner-header">
              <span className="success-icon">🎉</span>
              <div>
                <h3>Meeting Created Successfully!</h3>
                <p>Share this Meeting ID with participants so they can join:</p>
              </div>
            </div>
            <div className="created-id-box">
              <span className="meeting-id-display">{createdMeeting.meetingId}</span>
              <button
                onClick={() => handleCopyId(createdMeeting.meetingId)}
                className="btn btn-secondary"
              >
                {copied ? "✓ Copied!" : "Copy ID"}
              </button>
            </div>
            <div className="created-banner-actions">
              <button
                onClick={() => navigate(`/meeting/${createdMeeting.meetingId}`)}
                className="btn btn-primary"
              >
                Join Meeting Now →
              </button>
              <button
                onClick={() => setCreatedMeeting(null)}
                className="btn btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="dashboard-grid">
          {/* Create Meeting Card */}
          <div className="card action-card">
            <div className="card-icon-wrapper primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3>Create a New Meeting</h3>
            <p>Start an instant meeting and invite others by sharing your unique meeting code.</p>
            <button
              onClick={handleCreateMeeting}
              className="btn btn-primary btn-block"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Meeting"}
            </button>
          </div>

          {/* Join Meeting Card */}
          <div className="card action-card">
            <div className="card-icon-wrapper secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3>Join with Meeting ID</h3>
            <p>Enter the code shared with you to join an active meeting room.</p>
            <form onSubmit={handleJoinMeeting} className="join-form">
              <input
                type="text"
                placeholder="e.g. ABC123"
                value={joinMeetingId}
                onChange={(e) => setJoinMeetingId(e.target.value.toUpperCase())}
                maxLength={10}
                className="join-input"
              />
              <button
                type="submit"
                className="btn btn-secondary btn-block"
                disabled={joining || !joinMeetingId.trim()}
              >
                {joining ? "Joining..." : "Join Meeting"}
              </button>
            </form>
          </div>
        </div>

        {/* Recent Meetings Section */}
        <div className="recent-meetings-section">
          <h2>Your Recent Meetings</h2>
          {loadingMeetings ? (
            <LoadingSpinner message="Loading your meetings..." />
          ) : pastMeetings.length === 0 ? (
            <div className="empty-meetings card">
              <p>You have not participated in any meetings yet.</p>
            </div>
          ) : (
            <div className="meetings-list-grid">
              {pastMeetings.map((m) => {
                const isHost = m.host?._id === currentUser?._id;
                const isActive = m.status === "active";

                return (
                  <div key={m._id} className="card meeting-item-card">
                    <div className="meeting-item-header">
                      <span className="meeting-code">{m.meetingId}</span>
                      <span className={`badge ${isActive ? "badge-active" : "badge-ended"}`}>
                        {isActive ? "Active" : "Ended"}
                      </span>
                    </div>
                    <div className="meeting-item-details">
                      <p>
                        <strong>Host:</strong> {m.host?.name || "Unknown"}{" "}
                        {isHost && <span className="badge badge-self">You</span>}
                      </p>
                      <p>
                        <strong>Created:</strong> {formatDate(m.createdAt)}
                      </p>
                    </div>
                    {isActive ? (
                      <button
                        onClick={() => navigate(`/meeting/${m.meetingId}`)}
                        className="btn btn-outline btn-sm btn-block"
                      >
                        Enter Meeting Room
                      </button>
                    ) : (
                      <span className="meeting-ended-label">Meeting concluded</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
