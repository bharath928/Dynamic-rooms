const express = require("express")
const router = express.Router()
const noticeBoard = require("../controllers/noticeBoard")

router.post("/createNotice/:blockName",noticeBoard.createNotice)
router.get("/getAllNotice/:blockName",noticeBoard.getAllNotices)
router.patch("/deleteNotice/:blockName/:id",noticeBoard.deleteNotice)

module.exports = router