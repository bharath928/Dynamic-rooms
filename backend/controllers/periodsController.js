

const xlsx = require('xlsx');
const Timetable = require('../models/timetable');

// Helper: Process sheet into day-wise format

const convertExcelTimeToHHMM = (excelTime) => {
  if (typeof excelTime === "number") {
    const totalMinutes = Math.round(excelTime * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
  if (typeof excelTime === "string") {
    // Assume it's already in HH:MM format
    return excelTime.trim();
  }
  return "00:00"; // Fallback
};
const processTimetableData = (sheetData, className) => {
  const requiredFields = ['Day', 'PeriodNumber', 'StartTime', 'EndTime', 'Subject', 'Faculty'];
  const days = {};

  sheetData.forEach((row, index) => {
    const missingFields = requiredFields.filter(field => !row[field]);

    if (missingFields.length > 0) {
      // console.warn(`Skipping row ${index + 1} due to missing fields: ${missingFields.join(', ')}`, row);
      return;
    }

    // const dayName = row.Day.trim();

    const dayName = (row.Day || '').trim();  // ✅ Safely handles undefined Day

    if (!days[dayName]) {
      days[dayName] = [];
    }

    days[dayName].push({
      periodNumber: Number(row.PeriodNumber),
      startTime: convertExcelTimeToHHMM(row.StartTime),
      endTime: convertExcelTimeToHHMM(row.EndTime),
      subject: row.Subject,
      faculty: row.Faculty,
    });
  });

  const timetableData = Object.entries(days).map(([dayName, periods]) => ({
    dayName,
    periods,
  }));

  return { className, timetableData };
};

// Controller: Upload Excel → Save to DB
const uploadTimetableFromExcel = async (req, res) => {
  try {
    const { className } = req.body;
    const file = req.file;

    // Class name is required
    if (!className || className.trim() === '') {
      return res.status(400).json({ message: 'Class name is required.' });
    }

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    if (!sheetData || sheetData.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty or improperly formatted.' });
    }

    const structuredData = processTimetableData(sheetData, className);

    const existing = await Timetable.findOne({ className });
    if (existing) {
      return res.status(400).json({ message: `Timetable already exists for ${className}.` });
    }

    const newTimetable = new Timetable(structuredData);
    await newTimetable.save();

    res.status(201).json({ message: 'Timetable uploaded successfully!' });

  } catch (err) {
    console.error("Error while uploading timetable:", err);
    res.status(500).json({ message: 'Server Error while uploading timetable.' });
  }
};


const getAvailableTimetableRooms = async (req, res) => {
  try {
    const timetables = await Timetable.find({}, 'className');
    const roomNames = timetables.map(t => t.className); 
    res.json(roomNames); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};



const getTimetableByClass = async (req, res) => {
  try {
    const { className } = req.params;
    const timetable = await Timetable.findOne({ className });
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found.' });
    }
    res.json(timetable);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteTimetable =async (req, res) => {
  try {
    console.log("delted");
    const { className } = req.params;
    const deleted = await Timetable.deleteOne({ className });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({ message: "Timetable not found for this class." });
    }

    res.status(200).json({ message: "Timetable deleted successfully." });
  } catch (error) {
    console.error("Error deleting timetable:", error);
    res.status(500).json({ message: "Server error while deleting timetable." });
  }
};

module.exports = { uploadTimetableFromExcel,getTimetableByClass,deleteTimetable,getAvailableTimetableRooms };
