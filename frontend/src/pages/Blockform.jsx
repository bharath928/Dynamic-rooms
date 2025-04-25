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
    <div className="add-block-wrapper d-flex justify-content-center align-items-center min-vh-100">
      <div className="add-block-card p-4 rounded shadow bg-white" style={{ width: "100%", maxWidth: "500px" }}>
        
        {/* Header with Title and Back Button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="add-block-title m-0 text-primary">Add Block</h2>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/")}
          >
            ← Back
          </button>
        </div>

        {err && <p className="add-block-error text-danger">Error: {err}</p>}
        <form onSubmit={handleSubmit}>
          <div className="add-block-input-group mb-3">
            <label className="form-label">
              Block Name:
              <input
                type="text"
                className="form-control mt-1"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                required
              />
            </label>
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
