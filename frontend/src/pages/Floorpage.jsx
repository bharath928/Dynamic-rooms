import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
// import "./FloorPage.css";

const Floorpage = () => {
  const { state } = useLocation();
  const { block } = state; // Extract block data
  const [floorData, setFloorData] = useState([]);
  const [floorName, setFloorName] = useState("");
  const [err, setErr] = useState("");

  const handleAddFloor = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/block/floor/${block.id}`, {
        // block_id:    block.id, // Associate with block ID
        floor_name: floorName,
      });
      setFloorData((prev) => [...prev, response.data]);
      setFloorName(""); // Reset input
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className="floor-container">
      <h1>Floor Page for Block: {block.block_name}</h1>
      {err && <p className="error">Error: {err}</p>}

      <div className="floor-input">
        <input
          type="text"
          value={floorName}
          onChange={(e) => setFloorName(e.target.value)}
          placeholder="Enter floor name"
        />
        <button onClick={handleAddFloor}>Add Floor</button>
      </div>

      <div className="floor-list">
        <h2>Floors:</h2>
        {floorData.length ? (
          floorData.map((floor, index) => (
            <p key={index}>{floor.floor_name}</p>
          ))
        ) : (
          <p>No floors added yet.</p>
        )}
      </div>
    </div>
  );
};

export default Floorpage;
