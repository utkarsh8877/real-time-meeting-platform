const Message = require("../models/Message");
const Meeting = require("../models/Meeting");

const getMeetingMessages = async (req, res, next) => {
  try {
    const meetingId = req.params.meetingId.toUpperCase().trim();
    const meeting = await Meeting.findOne({ meetingId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: `Meeting "${meetingId}" not found.`
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const total = await Message.countDocuments({ meetingId });
    const messages = await Message.find({ meetingId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "name email");

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      messages
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMeetingMessages
};
