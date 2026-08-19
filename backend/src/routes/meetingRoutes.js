const express = require("express");
const router = express.Router();
const {
  createMeeting,
  getMeeting,
  joinMeeting,
  leaveMeeting,
  endMeeting,
  getUserMeetings
} = require("../controllers/meetingController");
const { getMeetingMessages } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", createMeeting);
router.get("/user/history", getUserMeetings);
router.get("/:meetingId", getMeeting);
router.post("/:meetingId/join", joinMeeting);
router.post("/:meetingId/leave", leaveMeeting);
router.post("/:meetingId/end", endMeeting);
router.get("/:meetingId/messages", getMeetingMessages);

module.exports = router;
