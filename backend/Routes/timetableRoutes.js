// const express = require("express");
// const {uploadTimetable} = require("../controllers/periodsController");
// const router = express.Router();

// router.post("/upload",uploadTimetable);

// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const { uploadTimetableFromExcel } = require('../controllers/periodsController');

// // multer config to upload file into memory
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// // Route to upload timetable
// router.post('/upload', upload.single('file'), uploadTimetableFromExcel);

// module.exports = router;


const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // For buffer uploads

const { uploadTimetableFromExcel,getTimetableByClass, deleteTimetable,getAvailableTimetableRooms } = require('../controllers/periodsController');

router.post('/upload', upload.single('file'), uploadTimetableFromExcel);
router.get("/available-timetables", getAvailableTimetableRooms);
router.get('/:className', getTimetableByClass);
router.delete('/class/:className',deleteTimetable);

module.exports = router;
