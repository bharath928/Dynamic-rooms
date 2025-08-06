const express = require("express");
const { registerUser, loginUser, userCollection,adminDetails,deleteadmin } = require("../controllers/authController");
// const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/userDetails/:userid",userCollection)

//Super admin dashboard...
router.get("/details",adminDetails)

//delete admin

router.delete("/delete/:adminid",deleteadmin)

module.exports = router;



