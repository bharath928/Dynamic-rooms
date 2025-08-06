
const mongoose = require('mongoose');

// Single notice schema
const NoticeSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// NoticeBoard schema with block-specific grouping
const NoticeBoardSchema = new mongoose.Schema({
  blockName: {
    type: String,
    required: true, // e.g., "Block A" or "global"
    unique: true    // Optional: to prevent duplicate blocks
  },
  notices: {
    type: [NoticeSchema],
    default: []
  }
});

module.exports = mongoose.model('NoticeBoard', NoticeBoardSchema);
