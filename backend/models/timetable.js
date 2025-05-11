const mongoose = require('mongoose');

const PeriodSchema = new mongoose.Schema({
  periodNumber: { type: Number, required: true }, // 1, 2, 3, 4...
  startTime: { type: String, required: true },    // Example: "09:15 AM"
  endTime: { type: String, required: true },      // Example: "10:10 AM"
  subject: { type: String, required: true },      // Example: "DAA"
  faculty: { type: String, required: true }       // Example: "Prabhakar Sir"
});

const DaySchema = new mongoose.Schema({
  dayName: { type: String, required: true },     // Monday, Tuesday, etc.
  periods: [PeriodSchema]                        // List of periods for that day
});

const timetable = new mongoose.Schema({
  className: { type: String, required: true },   // CSE-A, CSE-B, ECE-A etc. (comes from frontend selection)
  timetableData: [DaySchema],                        // Full week timetable
}, { timestamps: true });                         // Automatically add createdAt, updatedAt

module.exports = mongoose.model('timetable', timetable);
