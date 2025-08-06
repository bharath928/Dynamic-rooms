// routes/globalNotice.js
const express = require("express");
const router = express.Router();
const noticeBoard = require("../controllers/globalNotice")

router.post("/create",  noticeBoard.createGlobalNotice);
router.get("/getAll", noticeBoard.getGlobalNotices);
router.delete("/delete/:id", noticeBoard.deleteGlobalNotice);

module.exports = router;
