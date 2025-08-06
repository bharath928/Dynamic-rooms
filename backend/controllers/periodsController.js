
const xlsx = require('xlsx');
const Timetable = require('../models/blocktimetable');


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


const processTimetableData = (sheetData) => {
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

   return Object.entries(days).map(([dayName, periods]) => ({
    dayName,
    periods,
  }));

  // return {  timetableData };
};


const uploadTimetableFromExcel = async (req, res) => {
  try {
    const { blockName, className } = req.body;
    const file = req.file;

    if (!blockName || !className) {
      return res.status(400).json({ message: 'blockName and className are required.' });
    }

    if (!file) {
      return res.status(400).json({ message: 'No Excel file uploaded.' });
    }

    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const sheetData = xlsx.utils.sheet_to_json(sheet, { defval: '-' });

    if (!sheetData || sheetData.length === 0) {
      return res.status(400).json({ message: 'Excel sheet is empty or improperly formatted.' });
    }

    // Process the timetable data
    const timetableData = processTimetableData(sheetData);
    
    // 🧱 Find or create block
    const block = await Timetable.findOne({ blockName });

    if (!block) {
      await Timetable.create({
        blockName,
        rooms: [{ className, timetableData }]
      });
      return res.status(201).json({ message: 'Block and room timetable created successfully.' });
    }

    // 🔁 Update or insert room within block
    const existingRoomIndex = block.rooms.findIndex(r => r.className === className);

    if (existingRoomIndex !== -1) {
      block.rooms[existingRoomIndex].timetableData = timetableData;
    } else {
      block.rooms.push({ className,timetableData });
    }

    await block.save();
    res.status(200).json({ message: 'Room timetable uploaded successfully.' });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: 'Server Error while uploading timetable.' });
  }
};



const getTimetables = async (req, res) => {
  try {
    const {blockName} = req.params;
    const response = await Timetable.findOne({ blockName });

    if (!response) {
      return res.status(404).json({ message: "Block not found." });
    }

    res.status(200).json(response.rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const pauseActivity = async(req,res)=>{
  try{
    const { blockName, className } = req.params;
    const {isPaused} = req.body

    const response =await Timetable.updateOne(
      {blockName,"rooms.className":className},
      {$set:{"rooms.$.isPaused":isPaused}}
    )

    if (response.modifiedCount === 0) {
      return res.status(404).json({ message: "Room not found or already set" });
    }

    res.status(200).json({ message: `Timetable ${isPaused ? 'paused' : 'resumed'} successfully` });
  }catch(err){
    res.status(500).json({ msg: err.message });
  }
}

const deleteTimetable = async (req, res) => {
  try {
    const { blockName, className } = req.params;

    const result = await Timetable.updateOne(
      { blockName },
      { $pull: { rooms: { className } } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ msg: "Block not founding" });
    }

    if (result.modifiedCount === 0) {
      return res.status(400).json({ msg: "Class not found in block" });
    }

    res.status(200).json({ msg: "ClassRoom is deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find();
    res.status(200).json(timetables);
  } catch (error) {
    console.error('Error fetching timetables:', error.message);
    res.status(500).json({ message: 'Server error while fetching timetables' });
  }
};

const deleteblockTimetable = async(req,res)=>{
  try{
    const {blockName} = req.params
    const response = await Timetable.deleteOne({blockName})
    if(!res) 
      return res.status(400).json({ message: 'check the user details..' });

    return res.status(200).json(response);
  }catch(err){
    res.status(500).json({ message: err.message });
  }
}

module.exports = { uploadTimetableFromExcel,getTimetables,pauseActivity,deleteTimetable,getAllTimetables,deleteblockTimetable};