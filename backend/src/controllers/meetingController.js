const Meeting = require("../models/Meeting");
const generateMeetingId = require("../utils/generateMeetingId");

const createMeeting = async (req, res, next) => {
  try {
    let meetingId;
    let isUnique = false;

    while (!isUnique) {
      meetingId = generateMeetingId();
      const existing = await Meeting.findOne({ meetingId });
      if (!existing) isUnique = true;
    }

    const meeting = await Meeting.create({
      meetingId,
      host: req.user._id,
      participants: [req.user._id],
      status: "active"
    });

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate("host", "name email")
      .populate("participants", "name email");

    res.status(201).json({
      success: true,
      message: "Meeting created successfully.",
      meeting: populatedMeeting
    });
  } catch (error) {
    next(error);
  }
};

const getMeeting = async (req, res, next) => {
  try {
    const meetingId = req.params.meetingId.toUpperCase().trim();
    const meeting = await Meeting.findOne({ meetingId })
      .populate("host", "name email")
      .populate("participants", "name email");

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: `Meeting "${meetingId}" not found.`
      });
    }

    res.status(200).json({
      success: true,
      meeting
    });
  } catch (error) {
    next(error);
  }
};

const joinMeeting = async (req, res, next) => {
  try {
    const meetingId = req.params.meetingId.toUpperCase().trim();
    const meeting = await Meeting.findOne({ meetingId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: `Meeting "${meetingId}" not found.`
      });
    }

    if (meeting.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This meeting has ended."
      });
    }

    const alreadyJoined = meeting.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!alreadyJoined) {
      meeting.participants.push(req.user._id);
      await meeting.save();
    }

    const updated = await Meeting.findById(meeting._id)
      .populate("host", "name email")
      .populate("participants", "name email");

    res.status(200).json({
      success: true,
      message: "Joined meeting successfully.",
      meeting: updated
    });
  } catch (error) {
    next(error);
  }
};

const leaveMeeting = async (req, res, next) => {
  try {
    const meetingId = req.params.meetingId.toUpperCase().trim();
    const meeting = await Meeting.findOne({ meetingId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: `Meeting "${meetingId}" not found.`
      });
    }

    meeting.participants = meeting.participants.filter(
      (p) => p.toString() !== req.user._id.toString()
    );
    await meeting.save();

    const updated = await Meeting.findById(meeting._id)
      .populate("host", "name email")
      .populate("participants", "name email");

    res.status(200).json({
      success: true,
      message: "Left meeting.",
      meeting: updated
    });
  } catch (error) {
    next(error);
  }
};

const endMeeting = async (req, res, next) => {
  try {
    const meetingId = req.params.meetingId.toUpperCase().trim();
    const meeting = await Meeting.findOne({ meetingId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: `Meeting "${meetingId}" not found.`
      });
    }

    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the meeting host can end this meeting."
      });
    }

    meeting.status = "ended";
    await meeting.save();

    const updated = await Meeting.findById(meeting._id)
      .populate("host", "name email")
      .populate("participants", "name email");

    res.status(200).json({
      success: true,
      message: "Meeting ended.",
      meeting: updated
    });
  } catch (error) {
    next(error);
  }
};

const getUserMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ host: req.user._id }, { participants: req.user._id }]
    })
      .populate("host", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: meetings.length,
      meetings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMeeting,
  getMeeting,
  joinMeeting,
  leaveMeeting,
  endMeeting,
  getUserMeetings
};
