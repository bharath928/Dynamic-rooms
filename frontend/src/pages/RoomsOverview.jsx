import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { formatDistanceToNow } from 'date-fns';

const Loader = ({ text = "Loading...", centered = true }) => {
  return (
    <div className={`d-flex ${centered ? "justify-content-center" : ""} align-items-center my-3`}>
      <div className="spinner-border text-primary me-2" role="status" />
      <span className="fs-5">{text}</span>
    </div>
  );
};

const RoomsOverview = () => {
  const [block, setBlock] = useState([]);
  const [branch, setBranch] = useState("");
  const [status, setStatus] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false); // 🔹 Loader state


  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axios.get("https://dr-backend-32ec.onrender.com/block/get-data");
        setBlock(response.data);
      } catch (e) {
        console.log(e.message);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (branch) getRoomDetails();
  }, [branch, status]);

  const getRoomDetails = async () => {
    try {
      setLoading(true); // Start loader
      const response = await axios.get(`https://dr-backend-32ec.onrender.com/block/dashboard/${branch}/${status}`);
      setRooms(response.data);
      setLoading(false); // Stop loader
    } catch (e) {
      console.log(e.message);
      setLoading(false); // Stop loader even on error
    }
  };

  return (
    <>
      {/* Fixed Navbar-style Header */}
      <div
        className="container-fluid px-0 position-fixed top-0 w-100"
        style={{
          background: 'linear-gradient(90deg, #266bd2ff 0%, #467dc1ff 100%)',
          borderBottom: '3px solid #0047ab',
          zIndex: 1050,
        }}
      >
        <div className="container py-3">
          <div className="row align-items-center justify-content-between">
            <div className="col-12 col-md-auto text-center text-md-start mb-2 mb-md-0">
              <h4 className="text-white fw-bold m-0">🏠 Rooms Overview</h4>
            </div>
            <div className="col-12 col-md-auto text-center text-md-end">
              <button
                className="btn btn-outline-light btn-sm fw-semibold"
                onClick={() => window.history.back()}
                style={{
                  borderWidth: '2px',
                  padding: '0.4rem 0.75rem',
                  transition: '0.3s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 8px #ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                ⬅ Back
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="row justify-content-center mt-3">
            <div className="col-sm-6 col-md-4 mb-2">
              <select
                className="form-select shadow-sm rounded-pill"
                onChange={(e) => setBranch(e.target.value)}
              >
                <option value="">Select Branch</option>
                {block.map((e, index) => (
                  <option key={index} value={e.block_name}>
                    {e.block_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-sm-6 col-md-4 mb-2">
              <select
                className="form-select shadow-sm rounded-pill"
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="0">All</option>
                <option value="1">Occupied</option>
                <option value="2">Unoccupied</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5" style={{ marginTop: '230px' }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
            <Loader />
          </div>
        ) : (
          <div className="row">
            {rooms.map((room, index) => (
              <div key={index} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div
                  className="card h-100 border-0 shadow rounded-4"
                  style={{
                    backgroundColor: room.occupied ? "#ffe5e5" : "#e6fff5",
                    fontSize: "0.9rem",
                  }}
                >
                  <div className="card-body">
                    <p className="text-muted small mb-2">
                      Last Modified:{" "}
                      {formatDistanceToNow(new Date(room.lastModifiedDate), {
                        addSuffix: true,
                      })}
                    </p>
                    <h6 className="card-title text-dark fw-semibold mb-2">
                      {room.room_name}
                    </h6>
                    <p className="mb-1"><strong>ID:</strong> {room.room_id}</p>
                    <p className="mb-1"><strong>Type:</strong> {room.room_type}</p>
                    <p className="mb-1"><strong>Capacity:</strong> {room.room_capacity}</p>
                    <span
                      className={`badge px-3 py-2 ${room.occupied ? "bg-danger" : "bg-success"}`}
                    >
                      {room.occupied ? "Occupied" : "Empty"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default RoomsOverview;
