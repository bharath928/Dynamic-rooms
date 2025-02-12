import React, { useEffect, useState } from "react";
import axios from "axios";
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

  const handleModifyRoom = async (e) => {
    e.preventDefault();
    try {
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

      alert("Room modified successfully.");
      navigate(`/get-data/${Block.block_name}`, { state: { block: Block } });
    } catch (error) {
      setErr("Failed to modify room");
      console.error(error);
    }
  };

  return (
    <div className="room-form">
      <h2>Update Room</h2>
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
          <input
            type="checkbox"
            checked={isOccupied}
            onChange={() => setIsOccupied(!isOccupied)}
          />
          Occupied
        

        <button onClick={handleModifyRoom}>Modify Room</button>
      </form>
    </div>
  );
};

export default ModifyRoom;
