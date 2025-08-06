// models/globalNotice.js
const mongoose = require("mongoose");

const globalNoticeSchema = new mongoose.Schema({
  message: { type: String, required: true },
  postedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("globalNotice", globalNoticeSchema);
