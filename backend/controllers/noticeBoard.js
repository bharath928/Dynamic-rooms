const noticeBoard = require("../models/noticeBoard");
const createNotice = async (req, res) => {
  try {
    const { blockName } = req.params;
    const { message, postedBy } = req.body; // ✅ include postedBy

    const response = await noticeBoard.updateOne(
      { blockName },
      {
        $push: {
          notices: {
            $each: [{ message, postedBy: postedBy || "System" }],
            $position: 0, // latest notice first
          },
        },
      },
      { upsert: true }
    );

    if (!response.acknowledged)
      return res.status(404).json("Failed to create notice");

    return res.status(200).json(response);
  } catch (err) {
    res.status(500).json(err.message);
  }
};


const getAllNotices = async (req, res) => {
    try {
        const { blockName } = req.params;
        const response = await noticeBoard.findOne({ blockName });

        if (!response) {
            return res.status(404).json("No notices found for this block");
        }

        return res.status(200).json(response.notices);
    } catch (err) {
        return res.status(500).json(err.message);
    }
};

const deleteNotice = async(req,res)=>{
    try{
        const {blockName,id} = req.params

        const response = await noticeBoard.updateOne(
            {blockName},
            {$pull:{notices:{"_id":id}}} 
        )

        if(!response.modifiedCount)
        {
         return res.status(404).json("Notice is not found or already deleted..");
        }

        return res.status(200).json(response);
    }catch(err){
        res.status(500).json(err.message)
    }
}

module.exports = {createNotice,getAllNotices,deleteNotice}