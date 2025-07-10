

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // For buffer uploads

const { uploadTimetableFromExcel,getTimetables,deleteTimetable,getAllTimetables } = require('../controllers/periodsController');

router.post('/upload', upload.single('file'), uploadTimetableFromExcel);
router.get("/blockTimetables/:blockName",getTimetables)
router.get("/fetchBlocksTimetables",getAllTimetables);
router.patch("/delete/:blockName/:className",deleteTimetable)


module.exports = router;


