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

const modifyBlock = async(req,res)=>{
    try{
        const {id} = req.params;
    const {new_block} = req.body;
    console.log(new_block)

    const data = await block.findById(id);
    console.log(data.block_name)
    if(!data) return res.status(400).json({"msg":"block not found"})

    data.block_name = new_block
    await data.save()
    res.status(200).json(data);
    }catch(err){
        res.status(500).json({"err":err.message})
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


const deleteFloor = async(req,res)=>{
    try{
        const {blockId,floorId} = req.params;
        const updatedBlock = await block.findOneAndUpdate(
            { _id: blockId },
            { $pull: { floors: { _id:floorId } } },
            { new: true }
          );
          if(!updatedBlock)
                res.status(404).end("error check this out")
          res.status(200).json(updatedBlock)
          
    }catch(err){
        res.status(500).end(err.message)
    }
}


//Rooms Details...
// const addroomDetails = async(req,res)=>{
//     try{
//         const {blockid,floorid} = req.params;
//         const { room_id,room_name,room_type,room_capacity,} = req.body;

//         const blockDetails = await block.findById(blockid);

//         if(!blockDetails)
//             return res.status(400).end("something went wronfg")
        
//         const floorDetails = blockDetails.floors.id(floorid)
//         floorDetails.rooms.push({
//             room_id:room_id,
//             room_name:room_name,
//             room_type:room_type,
//             room_capacity:room_capacity,
            
//         })

//         const updatedBlock = await blockDetails.save();

//         if(!updatedBlock){
//             alert("something went wrong")
//             console.log(err)
//         }
//         res.status(200).json(updatedBlock)
//     }catch(err){
//         console.log(err)
//     }
// }


const addroomDetails = async (req, res) => {
    try {
        const { blockid, floorid } = req.params;
        const { room_id, room_name, room_type, room_capacity, occupied } = req.body; // ✅ Include occupied field

        const blockDetails = await block.findById(blockid);
        if (!blockDetails)
            return res.status(400).json({ message: "Block not found" });

        const floorDetails = blockDetails.floors.id(floorid);
        if (!floorDetails)
            return res.status(400).json({ message: "Floor not found" });

        floorDetails.rooms.push({
            room_id,
            room_name,
            room_type,
            room_capacity,
            occupied, 
        });

        const updatedBlock = await blockDetails.save();
        res.status(200).json(updatedBlock);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};



// const updateRoomDetails = async (req, res) => {
//     try {
//         const { blockid, floorid, roomid } = req.params; // Corrected .params()
//         const { room_id, room_name, room_type, room_capacity } = req.body;
    
//         // Find the block by its blockid
//         const Block = await block.findById(blockid);
//         if (!Block) {
//             return res.status(404).json({ message: 'Block not found' });
//         }
    
//         // Find the floor by floorid
//         const floor = Block.floors.find(f => f._id.toString() === floorid);
//         if (!floor) {
//             return res.status(404).json({ message: 'Floor not found' });
//         }
    
//         // Find the room by roomid
//         const room = floor.rooms.find(r => r._id.toString() === roomid);
//         if (!room) {
//             return res.status(404).json({ message: 'Room not found' });
//         }
    
//         // Update room details
//         room.room_id = room_id || room.room_id; // Only update if a new value is provided
//         room.room_name = room_name || room.room_name;
//         room.room_type = room_type || room.room_type;
//         room.room_capacity = room_capacity || room.room_capacity;
    
//         // Save the updated block document
//         await Block.save();
    
//         // Return the updated room details as a response
//         res.status(200).json(room);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: 'Server error', error: err.message });
//     }
// }

const updateRoomDetails = async (req, res) => {
    try {
        const { blockid, floorid, roomid } = req.params;
        const { room_id, room_name, room_type, room_capacity, occupied } = req.body; // ✅ Include occupied field

        const Block = await block.findById(blockid);
        if (!Block) {
            return res.status(404).json({ message: 'Block not found' });
        }

        const floor = Block.floors.find(f => f._id.toString() === floorid);
        if (!floor) {
            return res.status(404).json({ message: 'Floor not found' });
        }

        const room = floor.rooms.find(r => r._id.toString() === roomid);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // ✅ Update room details, including occupancy status
        room.room_id = room_id || room.room_id;
        room.room_name = room_name || room.room_name;
        room.room_type = room_type || room.room_type;
        room.room_capacity = room_capacity || room.room_capacity;
        room.occupied = occupied !== undefined ? occupied : room.occupied; 
        room.lastModifiedDate = new Date()

        await Block.save();
        res.status(200).json(room);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


const deleteRoom = async (req, res) => {
    try {
        const { blockId, floorId, roomId } = req.params;

        const updatedBlock = await block.findOneAndUpdate(
            { _id: blockId, "floors._id": floorId }, 
            { $pull: { "floors.$.rooms": { _id: roomId } } }, 
            { new: true }
        );

        if (!updatedBlock) {
            return res.status(404).json({ message: "Block or Floor not found" });
        }
        res.status(200).json({ message: "Room deleted successfully", updatedBlock });
    } catch (err) {
        res.status(500).json({ message: "Error deleting room", error: err.message });
    }
}

// const userRegister=  async (req, res) => {
//     try {
//       const { userId, password, role } = req.body;
//       const newUser = new User({ userId, password, role });
//       await newUser.save();
//       res.status(201).json({ message: "User registered successfully", user: newUser });
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
// }

//Dashboard for displaying the room based on the status...
const blockStatus = async(req,res)=>{
    try{
        const {name,status} = req.params
        const response = await block.findOne({"block_name":name})
        if(!response)
            return res.status(404).json("block not found...")

        const roomData = response.floors.flatMap(f=>f.rooms || [])
        //If user want all Rooms in the block...
        if(status==0)
            return res.status(200).json(roomData)

        const statusValue = (status==1)
        const statusData = roomData.filter(f=>f.occupied===statusValue)
        if(!statusData)
            return res.status(404).json("rooms not found")
        res.status(200).json(statusData)
    
    }catch(e){
        console.log(e.message)
        res.status(500).json({"msg":e.message})
    }
}


module.exports = {createBlock,getBlockDetails,getBlockDetailsbyId,deleteBlock,updateBlockDetailsbyId,addroomDetails,updateRoomDetails,deleteFloor,deleteRoom,modifyBlock,blockStatus}