import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import "./Blockform.css";

const Blockform = () => {
  const [blockName, setBlockName] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://dr-backend-32ec.onrender.com/block/add-data", {
        block_name: blockName,
      });
      navigate("/");
    } catch (err) {
      setErr(err.message);
    }
  };

  return (
  <>
 <div
  className="container-fluid px-0 position-fixed top-0 start-0 w-100 shadow-sm"
  style={{
    zIndex: 1050,
    background: 'linear-gradient(90deg, #3767cfff 0%, #2575fc 100%)',
    borderBottom: '3px solid #0047ab',
    color: 'white',
    height: '60px',
  }}
>
  <div className="d-flex justify-content-center align-items-center h-100 position-relative">
    <h5 className="mb-0 text-center">Add a New Block to AITAM</h5>

    {/* Back Button */}
    <button
      className="btn btn-sm btn-outline-light position-absolute"
      style={{ top: "50%", right: "20px", transform: "translateY(-50%)" }}
      onClick={() => navigate("/")} // <-- Adjust route as needed
    >
      ← Back
    </button>
  </div>
</div>


  {/* Page Wrapper */}
  <div
    className="add-block-wrapper d-flex justify-content-center align-items-center min-vh-100 position-relative"
    style={{ paddingTop: '80px' }} // to offset the fixed header
  >
    
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
            placeholder="Enter the Block Name"
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
</>


  );
};

export default Blockform;
