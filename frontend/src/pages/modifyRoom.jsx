import React, { useEffect, useState } from "react";
import axios from "axios";
import './ModifyRoom.css';
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ModifyRoom = () => {
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("");
  const [isOccupied, setIsOccupied] = useState(false);
  const [err, setErr] = useState("");

  const navigate = useNavigate();
  const { state } = useLocation();

  const blockName = state.Block;
  const floorId = state.floor;
  const blockId = state.BlockId;
  const room = state.Room;

  useEffect(() => {
    if (room) {
      setRoomId(room.room_id);
      setRoomName(room.room_name);
      setRoomType(room.room_type);
      setRoomCapacity(room.room_capacity);
      setIsOccupied(room.occupied);
    }
  }, [room]);

  const handleModifyRoom = async (e) => {
    e.preventDefault();
    try {
      const updatedRoom = {
        room_id: roomId,
        room_name: roomName,
        room_type: roomType,
        room_capacity: Number(roomCapacity),
        occupied: isOccupied,
        lastModifiedDate: new Date(),
        _id: room._id,
      };

      await axios.put(
        `http://localhost:5000/block/floors/room/${blockId}/${floorId}/${room._id}`,
        updatedRoom
      );

      toast.success("Room modified successfully!");

      setTimeout(() => {
        navigate(`/aitam/${blockName}/${floorId}/rooms`, {
        state: { Block: blockName },
      });
    }, 1500);
    } catch (error) {
      setErr(error.message);
      console.error(error);
      toast.error("Failed to modify room.");
    }
  };

  const handleBack = () => {
    navigate(`/aitam/${blockName}/${floorId}/rooms`, {
      state: { Block: blockName },
      replace: true,
    });
  };

  return (
    <div className="add-room-wrapper">
      <ToastContainer />
      <button className="back-btn" onClick={handleBack}>Back</button>

      <div className="add-room-card">
        <h2 className="add-room-title">Update Room</h2>
        {err && <p className="add-room-error">Error: {err}</p>}

        <form className="add-room-form" onSubmit={handleModifyRoom}>
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
            onChange={(e) => setRoomCapacity(e.target.value)}
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
          <button className="room-submit-btn" type="submit">
            Modify Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModifyRoom;
