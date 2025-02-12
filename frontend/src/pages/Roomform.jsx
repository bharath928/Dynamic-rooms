import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const Roomform = () => {
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("");
  const [roomCapacity, setRoomCapacity] = useState(null);
  const [roomOccupied, setRoomOccupied] = useState(false); 
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const { state } = useLocation();
  const [floor, setFloorId] = useState(state.floor);
  const [Block, setBlockId] = useState(state.Block);

  useEffect(() => {
    setRoomId(floor.floor_name);
  }, [floor.floor_name]);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/block/floors/room/${Block._id}/${floor._id}`,
        {
          room_id: roomId,
          room_name: roomName,
          room_type: roomType,
          room_capacity: roomCapacity,
          occupied: roomOccupied, 
        }
      );

      setRoomName("");
      setRoomType("");
      setRoomCapacity(null);
      setRoomOccupied(false);

      alert("Room successfully added.");
      navigate(`/get-data/${Block.block_name}`, { state: { block: Block } });
    } catch (error) {
      setErr("Failed to add room");
      console.error(error);
    }
  };

  const handleCheckboxChange = () => {
    setRoomOccupied((prevState) => !prevState); 
  };

  return (
    <div className="room-form">
      <h2>Add Room to Floor</h2>
      {err && <p className="error">Error: {err}</p>}
      <form onSubmit={handleAddRoom}>
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
        <label>
          <input
            type="checkbox"
            checked={roomOccupied} 
            onChange={handleCheckboxChange}
          />
          {/* Mark as Occupied */}
        </label>
        <button onClick={handleAddRoom}>Add Room</button>
      </form>
    </div>
  );
};

export default Roomform;





