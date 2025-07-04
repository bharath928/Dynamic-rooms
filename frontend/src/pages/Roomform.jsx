
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
// import './Roomform.css'

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
      navigate(`/aitam/${Block.block_name}`, { state: { block: Block } });
    } catch (error) {
      setErr("Failed to add room");
      console.error(error);
    }
  };

  const handleCheckboxChange = () => {
    setRoomOccupied((prevState) => !prevState); 
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
    <h2 className="add-room-title">Add Room to Floor</h2>
    {err && <p className="add-room-error">Error: {err}</p>}
    <form className="add-room-form" onSubmit={handleAddRoom}>
      <input
        type="text"
        className="room-input"
        value={roomId+"-"}
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
          checked={roomOccupied}
          onChange={handleCheckboxChange}
        />
        Mark as Occupied
      </label>
      <button type="submit" className="room-submit-btn">Add Room</button>
    </form>
  </div>
</div>

  );
};

export default Roomform;
