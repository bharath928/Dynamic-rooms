// controllers/globalNoticeController.js
const GlobalNotice = require("../models/GlobalNotice");

const createGlobalNotice = async (req, res) => {
  try {
    const { message, postedBy } = req.body;

    if (postedBy !== "super_admin") {
      return res.status(403).json("Only Super Admin can post global notices");
    }

    const newNotice = await GlobalNotice.create({ message, postedBy });
    res.status(201).json(newNotice);
  } catch (err) {
    res.status(500).json(err.message);
  }
};


const getGlobalNotices = async (req, res) => {
  try {
    const notices = await GlobalNotice.find().sort({ createdAt: -1 });
    res.status(200).json(notices);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const deleteGlobalNotice = async (req, res) => {
  try {
    const { postedBy } = req.body;
    const { id } = req.params;

    if (postedBy !== "super_admin") {
      return res.status(403).json("Only Super Admin can delete global notices");
    }

    await GlobalNotice.findByIdAndDelete(id);
    res.status(200).json("Notice deleted successfully");
  } catch (err) {
    res.status(500).json(err.message);
  }
};


module.exports = {createGlobalNotice,getGlobalNotices,deleteGlobalNotice}
