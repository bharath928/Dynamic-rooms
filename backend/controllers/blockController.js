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
const addroomDetails = async(req,res)=>{
    try{
        const {blockid,floorid} = req.params;
        const { room_id,room_name,room_type,room_capacity } = req.body;

        const blockDetails = await block.findById(blockid);

        if(!blockDetails)
            return res.status(400).end("something went wronfg")
        
        const floorDetails = blockDetails.floors.id(floorid)
        floorDetails.rooms.push({
            room_id:room_id,
            room_name:room_name,
            room_type:room_type,
            room_capacity:room_capacity,
        })

        const updatedBlock = await blockDetails.save();

        if(!updatedBlock){
            alert("something went wrong")
            console.log(err)
        }
        res.status(200).json(updatedBlock)
    }catch(err){
        console.log(err)
    }
}

// const updateRoomDetails = async(req,res)=>{
//     try{
//         const {blockid,floorid,roomid} = req.params;
//         const {updatedRoomData } = req.body;

//         const updatedRoom = await block.findByIdAndUpdate(
//             {
//                 _id:blockid,
//                 "floors._id":floorid,
//                 "floors.rooms._id":roomid,
//             },
//             {
//                 $set: {
//                 "floors.$.rooms.$[room]": updatedRoomData, // Update only the matched room
//                 },
//             },
//             {
//                 new: true,
//                 arrayFilters: [
//                 // { "floors._id": floorid }, // Filter the floor
//                 { "room._id": roomid }, // Filter the specific room
//                 ],
//             }
//         )

//         if (!updatedRoom) return res.status(404).json({ message: "Room not found" });
//             res.json(updatedRoom);
//         } catch (error) {
//           res.status(500).json({ error: error.message });
//         }
// }

const updateRoomDetails = async (req, res) => {
    try {
        const { blockid, floorid, roomid } = req.params; // Corrected .params()
        const { room_id, room_name, room_type, room_capacity } = req.body;
    
        // Find the block by its blockid
        const Block = await block.findById(blockid);
        if (!Block) {
            return res.status(404).json({ message: 'Block not found' });
        }
    
        // Find the floor by floorid
        const floor = Block.floors.find(f => f._id.toString() === floorid);
        if (!floor) {
            return res.status(404).json({ message: 'Floor not found' });
        }
    
        // Find the room by roomid
        const room = floor.rooms.find(r => r._id.toString() === roomid);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
    
        // Update room details
        room.room_id = room_id || room.room_id; // Only update if a new value is provided
        room.room_name = room_name || room.room_name;
        room.room_type = room_type || room.room_type;
        room.room_capacity = room_capacity || room.room_capacity;
    
        // Save the updated block document
        await Block.save();
    
        // Return the updated room details as a response
        res.status(200).json(room);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
}

module.exports = {createBlock,getBlockDetails,getBlockDetailsbyId,deleteBlock,updateBlockDetailsbyId,addroomDetails,updateRoomDetails}