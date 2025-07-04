import React, { useEffect, useState } from "react";
import axios from "axios";
import './ModifyRoom.css';
import { useNavigate, useLocation } from "react-router-dom";

const ModifyRoom = () => {
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("");
  const [roomCapacity, setRoomCapacity] = useState(null);
  const [isOccupied, setIsOccupied] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  
    
  const { state } = useLocation();
  const [floor, setFloorId] = useState(state.floor);
  const [Block, setBlockId] = useState(state.Block);
  const [Room, setRoom] = useState(state.Room);

  useEffect(() => {
    setRoomId(Room.room_id);
    setRoomName(Room.room_name);
    setRoomType(Room.room_type);
    setRoomCapacity(Room.room_capacity);
    setIsOccupied(Room.occupied); 
  }, []);

  // const handleModifyRoom = async (e) => {
  //   e.preventDefault();
  //   try {
  //     await axios.put(
  //       `http://localhost:5000/block/floors/room/${Block._id}/${floor._id}/${Room._id}`,
  //       {
  //         room_id: roomId,
  //         room_name: roomName,
  //         room_type: roomType,
  //         room_capacity: roomCapacity,
  //         occupied: isOccupied, 
  //       }
  //     );

  //     alert("Room modified successfully.");
  //     navigate(`/aitam/${Block.block_name}`, {
  //        state: { block: Block, },

  //        });
  //   } catch (error) {
  //     setErr("Failed to modify room");
  //     console.error(error);
  //   }
  // };

  const handleModifyRoom = async (e) => {
  e.preventDefault();
  try {
    // 1. Prepare updated room
    const updatedRoom = {
      room_id: roomId,
      room_name: roomName,
      room_type: roomType,
      room_capacity: roomCapacity,
      occupied: isOccupied,
      lastModifiedDate:new Date(),
      _id: Room._id, // include _id to match original room
    };

    // 2. Send to server
    await axios.put(
      `http://localhost:5000/block/floors/room/${Block._id}/${floor._id}/${Room._id}`,
      {
          room_id: roomId,
          room_name: roomName,
          room_type: roomType,
          room_capacity: roomCapacity,
          occupied: isOccupied, 
        }
    );

    // ✅ 3. Update the room in the floor's room array (in the same index)
    const updatedRooms = [...floor.rooms];
    const index = updatedRooms.findIndex((r) => r._id === Room._id);
    if (index !== -1) {
      updatedRooms[index] = updatedRoom;
    }

    const updatedFloor = {
      ...floor,
      rooms: updatedRooms,
    };

    // ✅ 4. Save updated floor to sessionStorage
    sessionStorage.setItem("selectedFloor", JSON.stringify(updatedFloor));

    // ✅ 5. Navigate back and pass updated block (optional)
    alert("Room modified successfully.");
    navigate(`/aitam/${Block.block_name}`, {
      state: { block: Block },
    });
  } catch (error) {
    setErr(error.message);
    console.error(error);
  }
};


  const backhandler = () => {
    navigate(`/aitam/${Block.block_name}`, {
      state: { block: Block, from: "modify-room" }, 
      replace: true,
    });
  };
  return (
    <div className="add-room-wrapper">
  <button className="back-btn" onClick={backhandler}>Back</button>

  <div className="add-room-card">
    <h2 className="add-room-title">Update Room</h2>
    {err && <p className="add-room-error">Error: {err}</p>}
    <form className="add-room-form">
      <input
        type="text"
        className="room-input"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter room Id"
        required
      />
      <input
        type="text"
        className="room-input"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Enter room name"
        required
      />
      <input
        type="text"
        className="room-input"
        value={roomType}
        onChange={(e) => setRoomType(e.target.value)}
        placeholder="Enter room type"
        required
      />
      <input
        type="number"
        className="room-input"
        value={roomCapacity}
        onChange={(e) => setRoomCapacity(Number(e.target.value))}
        placeholder="Enter room capacity"
        required
      />
      <label className="room-checkbox-label">
        <input
          type="checkbox"
          className="room-checkbox"
          checked={isOccupied}
          onChange={() => setIsOccupied(!isOccupied)}
        />
        Occupied
      </label>
      <button className="room-submit-btn" onClick={handleModifyRoom}>
        Modify Room
      </button>
    </form>
  </div>
</div>

);
};

export default ModifyRoom;