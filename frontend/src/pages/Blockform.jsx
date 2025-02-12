import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Blockform.css";

const Blockform = () => {
  const [blockName, setBlockName] = useState("");
  // const [noOfFloors, setNoOfFloors] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/block/add-data", {
        block_name: blockName,
        // no_of_floor: noOfFloors,
      });
      navigate("/"); 
    } catch (err) {
      setErr(err.message);
    }
  };

  return (
    <div className="form-container">
      <h1>Add Block</h1>
      {err && <p className="error">Error: {err}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Block Name:
          <input
            type="text"
            value={blockName}
            onChange={(e) => setBlockName(e.target.value)}
            required
          />
        </label>
        {/* <label>
          Number of Floors:
          <input
            type="number"
            value={noOfFloors}
            onChange={(e) => setNoOfFloors(e.target.value)}
            required
          />
        </label> */}
        <button type="submit">Add Block</button>
      </form>
    </div>
  );
};

export default Blockform;
