const mongoose = require('mongoose');

// Period Schema
const PeriodSchema = new mongoose.Schema({
  periodNumber: { type: Number, required: true },   // 1, 2, 3...
  startTime: { type: String, required: true },      // e.g., "09:15 AM"
  endTime: { type: String, required: true },        // e.g., "10:10 AM"
  subject: { type: String, required: true },        // e.g., "DAA"
  faculty: { type: String, required: true }         // e.g., "Prabhakar Sir"
});

// Day Schema
const DaySchema = new mongoose.Schema({
  dayName: { type: String, required: true },        // Monday, Tuesday, etc.
  periods: [PeriodSchema]                           // Array of periods for that day
});

// Timetable Schema (for one room)
const RoomTimetableSchema = new mongoose.Schema({
  className: { type: String, required: true },       // Room101, Room102, etc.
  isPaused:{type:Boolean,default:false},
  timetableData: [DaySchema]                        // Weekly timetable for the room
});

// Block Schema (contains multiple rooms with timetables)
const BlockSchema = new mongoose.Schema({
  blockName: { type: String, required: true },      // Block-A, Block-B, etc.
  rooms: [RoomTimetableSchema]                      // List of rooms with individual timetables
}, { timestamps: true });

module.exports = mongoose.model('BlockTimetable', BlockSchema);