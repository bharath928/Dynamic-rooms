

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // For buffer uploads

const { uploadTimetableFromExcel,getTimetables,deleteTimetable,getAllTimetables,deleteblockTimetable} = require('../controllers/periodsController');

router.post('/upload', upload.single('file'), uploadTimetableFromExcel);
router.get("/blockTimetables/:blockName",getTimetables);
// router.get("/fetchBlocksTimetables",getAllTimetables);
router.patch("/delete/:blockName/:className",deleteTimetable)
router.delete("/delete/:blockName",deleteblockTimetable)

module.exports = router;


