import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const useSocket = (meetingId, user) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [socketError, setSocketError] = useState(null);

  useEffect(() => {
    if (!meetingId || !user?._id) return;

    // Create single socket instance
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setSocketError(null);

      // Emit joinRoom event
      socket.emit("joinRoom", {
        meetingId,
        userId: user._id,
        userName: user.name
      });
    });

    // Listen for room participant initial list
    socket.on("roomParticipants", (participantList) => {
      setParticipants(participantList);
    });

    // Listen for new user joining
    socket.on("userJoined", (data) => {
      if (data.participants) {
        setParticipants(data.participants);
      }
    });

    // Listen for user leaving
    socket.on("userLeft", (data) => {
      if (data.participants) {
        setParticipants(data.participants);
      }
    });

    // Listen for new real-time messages
    socket.on("receiveMessage", (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    // Listen for meeting ended event
    socket.on("meetingEnded", () => {
      setMeetingEnded(true);
    });

    // Listen for socket errors
    socket.on("error", (err) => {
      setSocketError(err.message || "Real-time communication error");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Clean up event listeners and disconnect on unmount
    return () => {
      if (socket) {
        socket.emit("leaveRoom", {
          meetingId,
          userId: user._id,
          userName: user.name
        });
        socket.off("connect");
        socket.off("roomParticipants");
        socket.off("userJoined");
        socket.off("userLeft");
        socket.off("receiveMessage");
        socket.off("meetingEnded");
        socket.off("error");
        socket.off("disconnect");
        socket.disconnect();
      }
    };
  }, [meetingId, user?._id, user?.name]);

  const sendMessage = useCallback(
    (text) => {
      if (socketRef.current && text?.trim()) {
        socketRef.current.emit("sendMessage", {
          meetingId,
          senderId: user._id,
          senderName: user.name,
          message: text.trim()
        });
      }
    },
    [meetingId, user?._id, user?.name]
  );

  const endMeeting = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit("endMeeting", { meetingId });
    }
  }, [meetingId]);

  return {
    isConnected,
    participants,
    messages,
    setMessages,
    sendMessage,
    endMeeting,
    meetingEnded,
    socketError
  };
};
