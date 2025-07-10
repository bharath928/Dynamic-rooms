import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { formatDistanceToNow } from 'date-fns';

const RoomsOverview = () => {
    const [block, setBlock] = useState([]);
    const [branch, setBranch] = useState("");
    const [status, setStatus] = useState(0);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const response = await axios.get("http://localhost:5000/block/get-data");
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
            const response = await axios.get(`http://localhost:5000/block/dashboard/${branch}/${status}`);
            setRooms(response.data);
        } catch (e) {
            console.log(e.message);
        }
    };

    return (
        <div className="container py-4">
  {/* Header Row with Back Button */}
  <div className="position-relative text-center mb-4">
    <h3 className="fw-bold text-primary">Rooms Overview</h3>
    <button
      className="btn btn-outline-primary btn-sm position-absolute top-0 end-0"
      onClick={() => window.history.back()}
    >
      <i className="bi bi-arrow-left"></i> Back
    </button>
  </div>

  {/* Filters */}
  <div className="row justify-content-center mb-4">
    <div className="col-md-4 mb-2">
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
    <div className="col-md-4 mb-2">
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

  {/* Room Cards */}
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
            <h6 className="card-title text-dark fw-semibold mb-2">{room.room_name}</h6>
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
</div>


    );
};

export default RoomsOverview;
