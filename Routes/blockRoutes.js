const express = require("express")
const router = express.Router()
const blockController = require("../controllers/blockController")

router.post("/add-data",blockController.createBlock)
router.get("/get-data",blockController.getBlockDetails)
router.get("/get-data/:id",blockController.getBlockDetailsbyId)
router.delete("/delete-data/:id",blockController.deleteBlock)

module.exports = router