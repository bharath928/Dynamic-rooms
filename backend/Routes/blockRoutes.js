const express = require("express")
const router = express.Router()
const blockController = require("../controllers/blockController")

//Block Routes.....
router.post("/add-data",blockController.createBlock)
// router.post("/floor/:id",blockController.createBlock)

router.get("/get-data",blockController.getBlockDetails)
router.get("/get-data/:id",blockController.getBlockDetailsbyId)
router.delete("/delete-data/:id",blockController.deleteBlock)

//Floors Routes...
router.post("/floor/:id",blockController.updateBlockDetailsbyId)

//Room Routes..
router.post("/floors/room/:blockid/:floorid",blockController.updateRoomDetailsById)

module.exports = router