import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
// import "./FloorPage.css";

const Floorpage = () => {
  const { state } = useLocation();
  // let { block } = state; // Extract block data
const [block, setBlock] = useState(state.block);

  // const [floorData, setFloorData] = useState([]);
  const [floorName, setFloorName] = useState("");
  const [err, setErr] = useState("");


const fetchBlockData = async () => {
    try {
    const responsive = await axios.get(`http://localhost:5000/block/get-data/${block._id}`);
      setBlock(responsive.data); // Update floors with data from the database
    } catch (error) {
      setErr("Failed to fetch updated block data");
      console.error(error);
    }
  };

  const handleAddFloor = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(`http://localhost:5000/block/floor/${block._id}`, {
        // block_id:    block.id, // Associate with block ID
        floor_name: floorName,
      });
      // setFloorData((prev) => [...prev, response.data]);
      setFloorName(""); // Reset input
      // console.log(block.floors.length)
      fetchBlockData()
      // console.log(Block)
    } catch (error) {
      setErr(error.message);
      console.log(error)
    }
  };

  return (
    <div className="floor-form">
      <h1>Floor Page for Block: {block.block_name}</h1>
      {err && <p className="error">Error: {err}</p>}

      <div className="floor-input">
        <form action="">
          <input
            type="text"
            value={floorName}
            onChange={(e) => setFloorName(e.target.value)}
            placeholder="Enter floor name"
          />
          <button onClick={handleAddFloor}>Add Floor</button>
        </form>
      </div>

      <div className="floor-details">
        {block.floors.map((e,index)=>(
          <div className="floor-text" key={index}>
            <h1>FloorName:{e.floor_name}</h1>
          </div>
        ))}
      </div>
    </div> 
  );
};

export default Floorpage;
