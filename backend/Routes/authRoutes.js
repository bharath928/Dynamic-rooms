const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);


router.post("/admin-task", authMiddleware(["admin", "super_admin"]), (req, res) => {
    res.json({ message: "Admin task executed successfully" });
  });
  
  router.get("/view", authMiddleware(["user", "admin", "super_admin"]), (req, res) => {
    res.json({ message: "Viewing allowed" });
  });

module.exports = router;
