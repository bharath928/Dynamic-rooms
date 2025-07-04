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
        <div className="container mt-4">
  {/* Header Row with Back Button */}
  <div className="d-flex justify-content-between align-items-center mb-3">
    <h3 className="mb-0 text-center flex-grow-1">Rooms Overview</h3>
    <button
      className="btn btn-outline-secondary btn-sm ms-auto"
      onClick={() => window.history.back()}
    >
      <i className="bi bi-arrow-left"></i> Back
    </button>
  </div>

  {/* Filters */}
  <div className="row mb-3">
    <div className="col-md-6">
      <select
        className="form-select form-select-sm w-75 mx-auto"
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
    <div className="col-md-6">
      <select
        className="form-select form-select-sm w-75 mx-auto"
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
      <div key={index} className="col-lg-3 col-md-4 col-sm-6 mb-3">
        <div
          className="card shadow-sm"
          style={{ fontSize: "0.9rem", padding: "10px" }}
        >
          <div className="card-body p-3">
            <p className="card-text">
              Last Modified:{" "}
              {formatDistanceToNow(new Date(room.lastModifiedDate), {
                addSuffix: true,
              })}
            </p>
            <h6 className="card-title mb-1">{room.room_name}</h6>
            <p className="card-text mb-1">
              <strong>ID:</strong> {room.room_id}
            </p>
            <p className="card-text mb-1">
              <strong>Type:</strong> {room.room_type}
            </p>
            <p className="card-text mb-1">
              <strong>Capacity:</strong> {room.room_capacity}
            </p>
            <p
              className={`badge ${
                room.occupied ? "bg-danger" : "bg-success"
              }`}
            >
              {room.occupied ? "Occupied" : "Empty"}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

    );
};

export default RoomsOverview;
