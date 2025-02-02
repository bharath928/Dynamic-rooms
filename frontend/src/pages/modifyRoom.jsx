import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate,useLocation} from "react-router-dom";

const ModifyRoom = () => {
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("");
  const [roomCapacity, setRoomCapacity] = useState(null);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const {state} = useLocation();
  // const {floorid:floorId,blockid:blockId} = state;
  const [floor,setfloorId] = useState(state.floor)
  const [Block,setblockId] = useState(state.Block)
  const [Room,setRoom]= useState(state.Room)

  useEffect(()=>{
    setRoomId(Room.room_id)
    setRoomName(Room.room_name)
    setRoomType(Room.room_type)
    setRoomCapacity(Room.room_capacity)
  },[])

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/block/floors/room/${Block._id}/${floor._id}/${Room._id}`, {
        room_id: roomId,
        room_name: roomName,
        room_type: roomType,
        room_capacity: roomCapacity,
      });
      // setRoomName("");
      // setRoomType("");
      // setRoomCapacity(null);
      // refreshBlockData(); // Refresh block data after adding room
      // onClose(); // Close the form
      alert("Form modified successfully..")
      navigate(`/get-data/${Block.block_name}`,{state:{block:Block}})
    } catch (error) {
      setErr("Failed to add room");
      console.error(error);
    }
  };

  return (
    <div className="room-form">
      <h2>Update Room to Floor</h2>
      {err && <p className="error">Error: {err}</p>}
      <form>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter room Id"
          required
        />
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name"
          required
        />
        <input
          type="text"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          placeholder="Enter room type"
          required
        />
        <input
          type="number"
          value={roomCapacity}
          onChange={(e) => setRoomCapacity(Number(e.target.value))}
          placeholder="Enter room capacity"
          required
        />
        <button onClick={handleAddRoom}>Add Room</button>
        {/* <button type="button" onClick={onClose}>
          Cancel
        </button> */}
      </form>
    </div>
  );
};

export default ModifyRoom;

