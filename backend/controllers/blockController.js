const block = require("../models/blockmodel")

const createBlock = async (req,res)=>{
    try{
        const blockData = new block(req.body)//instance created
        const result = await blockData.save()//insert into the db..

        res.status(201).json(result)
    }catch(err){
        // console.log(err)
        res.status(400).json({"msg":"error occured"})
    }
}


const getBlockDetails = async (req,res)=>{
    try{
        const result = await block.find();
        res.status(200).json(result)
    }
    catch(err){
        console.error(err)
        res.status(400).json({"msg":"something went wrong..."})
    }
}


const getBlockDetailsbyId = async (req,res)=>{
    const {id }= req.params;
    try{
        const result = await block.findById(id);
        if(!result) {
            console.log("result not found..")
        }
        res.status(200).json(result)
    }
    catch(err){
        console.error(err)
        res.status(400).json({"msg":"something went wrong..."})
    }
}

const deleteBlock = async (req,res)=>{
    const {id }= req.params;
    try{
        const result = await block.findByIdAndDelete(id);
        res.status(200).json(result)
    }
    catch(err){
        console.error(err)
        res.status(400).json({"msg":"something went wrong..."})
    }
}


//Floor Details...

const updateBlockDetailsbyId = async(req,res)=>{
    const { id } = req.params; // Block ID from the route parameter
  const { floor_name } = req.body; // Floor name from the request body

  if (!floor_name) {
    return res.status(400).json({ msg: "Floor name is required" });
  }

  try {
    // Find the block by ID and add the new floor to the `floors` array
    const updatedBlock = await block.findByIdAndUpdate(
      id,
      { $push: { floors: { floor_name } } }, // Add the new floor object
      { new: true } // Return the updated block after the operation
    );

    if (!updatedBlock) {
      return res.status(404).json({ msg: "Block not found" });
    }

    res.status(200).json(updatedBlock);
  } catch (error) {
    console.error("Error adding floor:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
}

//Rooms Details...
const updateRoomDetailsById = async(req,res)=>{
    try{
        const {blockid,floorid} = req.params;
       const { room_id,room_name,room_type,room_capacity } = req.body;

    const blockDetails = block.findById(blockid);

    if(!blockDetails)
        return res.status(400).end("something went wronfg")

    // const floorDetails = blockDetails.floors.findById(floorid)
    
    // if(!floorDetails)
    //     return res.status(400).end("something went wronfg")

    const updatedBlock = await blockDetails.floors.findByIdAndUpdate(
        floorid,
        { $push: { rooms: { room_id,room_name,room_type,room_capacity } } }, // Add the new floor object
        { new: true } // Return the updated block after the operation
      );

    if(!updatedBlock)
        return res.status(400).end("something went wronfg")
    }catch(err){
        console.log(err)
    }

}

module.exports = {createBlock,getBlockDetails,getBlockDetailsbyId,deleteBlock,updateBlockDetailsbyId,updateRoomDetailsById};