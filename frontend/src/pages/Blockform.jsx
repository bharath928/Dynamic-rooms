import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Blockform.css";

const Blockform = () => {
  const [blockName, setBlockName] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/block/add-data", {
        block_name: blockName,
      });
      navigate("/");
    } catch (err) {
      setErr(err.message);
    }
  };

  return (
   <div className="add-block-wrapper d-flex justify-content-center align-items-center min-vh-100 position-relative">
  
  {/* Back Button at top-right */}
  <button
    className="btn btn-outline-primary position-absolute"
    style={{ top: "20px", right: "20px", zIndex: 10 }}
    onClick={() => navigate("/")}
  >
    ← Back
  </button>

  
  <div
    className="add-block-card p-4 rounded shadow bg-white"
    style={{ width: "100%", maxWidth: "500px" }}
  >
    
    <h2 className="text-center text-primary mb-4">Add Block</h2>

    {/* Error */}
    {err && <p className="add-block-error text-danger">Error: {err}</p>}

    {/* Form */}
    <form onSubmit={handleSubmit}>
      <div className="add-block-input-group mb-4 d-flex align-items-center justify-content-between">
        <label className="form-label m-0 me-3" style={{ minWidth: "120px" }}>
          Block Name:
        </label>
        <input
          type="text"
          placeholder='Enter the Block Name'
          className="form-control"
          value={blockName}
          onChange={(e) => setBlockName(e.target.value)}
          required
          style={{ flex: 1 }}
        />
      </div>

      <button type="submit" className="add-block-btn btn btn-primary w-100">
        Add Block
      </button>
    </form>
  </div>
</div>


  );
};

export default Blockform;
