const express = require("express")
const router = express.Router()
const blockController = require("../controllers/blockController")

//Block Routes.....
router.post("/add-data",blockController.createBlock)
// router.post("/floor/:id",blockController.createBlock)

router.get("/get-data",blockController.getBlockDetails)
router.get("/get-data/:id",blockController.getBlockDetailsbyId)
router.put("/update-data/:id",blockController.modifyBlock)
router.delete("/delete-data/:id",blockController.deleteBlock)

//Floors Routes...
router.post("/floor/:id",blockController.updateBlockDetailsbyId)
router.delete("/:blockId/floor/:floorId",blockController.deleteFloor)

//Room Routes..
router.post("/floors/room/:blockid/:floorid",blockController.addroomDetails)
router.put("/floors/room/:blockid/:floorid/:roomid",blockController.updateRoomDetails)

router.delete("/:blockId/floor/:floorId/room/:roomId", blockController.deleteRoom);

//authentication routes..
// router.post("/register",blockController.userRegister);

//Block Dashboard for displaying the room details based on the status..
router.get("/dashboard/:name/:status",blockController.blockStatus)

module.exports = router