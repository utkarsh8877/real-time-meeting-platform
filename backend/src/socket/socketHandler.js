const Message = require("../models/Message");
const Meeting = require("../models/Meeting");

const socketHandler = (io) => {
  const activeRooms = new Map();

  io.on("connection", (socket) => {
    socket.on("joinRoom", async (data) => {
      try {
        const { meetingId: rawId, userId, userName } = data || {};
        if (!rawId || !userId || !userName) return;

        const meetingId = rawId.toUpperCase().trim();
        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting || meeting.status !== "active") {
          socket.emit("error", { message: "Meeting is not active or does not exist." });
          return;
        }

        socket.join(meetingId);
        socket.meetingId = meetingId;
        socket.userId = userId;
        socket.userName = userName;

        if (!activeRooms.has(meetingId)) {
          activeRooms.set(meetingId, new Map());
        }

        const roomMap = activeRooms.get(meetingId);
        roomMap.set(socket.id, { userId, userName, socketId: socket.id });

        const uniqueParticipants = Array.from(
          new Map(
            Array.from(roomMap.values()).map((item) => [item.userId, item])
          ).values()
        );

        socket.emit("roomParticipants", uniqueParticipants);
        socket.to(meetingId).emit("userJoined", {
          userId,
          userName,
          socketId: socket.id,
          participants: uniqueParticipants
        });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("sendMessage", async (data) => {
      try {
        const { meetingId: rawId, senderId, senderName, message } = data || {};
        if (!rawId || !senderId || !message || !message.trim()) return;

        const meetingId = rawId.toUpperCase().trim();
        const savedMessage = await Message.create({
          meetingId,
          sender: senderId,
          message: message.trim(),
          timestamp: new Date()
        });

        const payload = {
          _id: savedMessage._id,
          meetingId,
          sender: { _id: senderId, name: senderName || "Participant" },
          message: savedMessage.message,
          timestamp: savedMessage.timestamp,
          createdAt: savedMessage.createdAt
        };

        io.to(meetingId).emit("receiveMessage", payload);
      } catch (err) {
        socket.emit("error", { message: "Failed to send message." });
      }
    });

    socket.on("leaveRoom", ({ meetingId: rawId, userId, userName } = {}) => {
      const meetingId = rawId ? rawId.toUpperCase().trim() : socket.meetingId;
      handleLeave(socket, meetingId, userId, userName);
    });

    socket.on("endMeeting", ({ meetingId: rawId } = {}) => {
      const meetingId = rawId ? rawId.toUpperCase().trim() : socket.meetingId;
      if (meetingId) {
        io.to(meetingId).emit("meetingEnded", { meetingId });
        activeRooms.delete(meetingId);
      }
    });

    socket.on("disconnect", () => {
      if (socket.meetingId) {
        handleLeave(socket, socket.meetingId, socket.userId, socket.userName);
      }
    });

    function handleLeave(sock, meetingId, userId, userName) {
      if (!meetingId) return;
      sock.leave(meetingId);

      if (activeRooms.has(meetingId)) {
        const roomMap = activeRooms.get(meetingId);
        roomMap.delete(sock.id);

        const uniqueParticipants = Array.from(
          new Map(
            Array.from(roomMap.values()).map((item) => [item.userId, item])
          ).values()
        );

        if (roomMap.size === 0) {
          activeRooms.delete(meetingId);
        }

        io.to(meetingId).emit("userLeft", {
          userId: userId || sock.userId,
          userName: userName || sock.userName,
          socketId: sock.id,
          participants: uniqueParticipants
        });
      }
    }
  });
};

module.exports = socketHandler;
