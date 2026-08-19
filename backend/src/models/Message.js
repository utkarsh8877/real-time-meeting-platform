const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    meetingId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

messageSchema.index({ meetingId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
