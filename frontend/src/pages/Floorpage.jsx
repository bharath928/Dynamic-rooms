import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./FloorPage.css";

const Floorpage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Getting block data from state or localStorage
  const [block, setBlock] = useState(() => {
    return state?.block || JSON.parse(localStorage.getItem("block")) || null;
  });

  const [floorid, setFloorid] = useState(null);
  const [floorName, setFloorName] = useState(""); 
  const [roomdata, setRoomData] = useState([]); 
  const [dept,setdept]=useState("");
  const [err, setErr] = useState(""); 
  const [access,setaccess]=useState("");

  useEffect(() => {
    setaccess(JSON.parse(sessionStorage.getItem("role")));
    setdept(JSON.parse(sessionStorage.getItem("dept")));
    const fetchBlockData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/block/get-data/${block._id}`);
        setBlock(response.data);
        localStorage.setItem("block", JSON.stringify(response.data));
      } catch (error) {
        setErr("Failed to fetch updated block data");
        console.error(error);
      }
    };
    if (block) fetchBlockData();
  }, [block?._id]);

  const handleAddFloor = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/block/floor/${block._id}`, { floor_name: floorName });
      setFloorName(""); 
      const response = await axios.get(`http://localhost:5000/block/get-data/${block._id}`);
      setBlock(response.data);
    } catch (error) {
      setErr(error.message);
      console.error(error);
    }
  };

  const deleteFloor = async () => {
    if (!window.confirm("Do you want to delete this floor?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/block/${block._id}/floor/${floorid._id}`);
      const updatedData = await axios.get(`http://localhost:5000/block/get-data/${block._id}`);
      
      if (!updatedData.data) {
        alert("Failed to delete the floor");
        return;
      }

      localStorage.setItem("block", JSON.stringify(updatedData.data));
      alert("Floor has been deleted");
      navigate(`/get-data/${updatedData.data.block_name}`, { state: { block: updatedData.data } });
    } catch (error) {
      alert("Something went wrong...");
      console.error(error);
    }
  };

  const displayRoom = (floor) => {
    setRoomData(floor.rooms);
    setFloorid(floor);
  };

  const addRooms = () => {
    navigate(`/get-data/${block.block_name}/${floorid.floor_name}`, { state: { floor: floorid, Block: block } });
  };

  const modifyRoom = (room) => {
    navigate(`/get-data/${block.block_name}/${floorid.floor_name}/modify/${room.room_name}`, { state: { Block: block, floor: floorid, Room: room } });
  };

  const deleteRoom = async (room) => {
    if (!room || !floorid || !block) {
      alert("Missing data to delete the room.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the room: ${room.room_name}?`)) return;

    try {
      await axios.delete(`http://localhost:5000/block/${block._id}/floor/${floorid._id}/room/${room._id}`);
      const updatedData = await axios.get(`http://localhost:5000/block/get-data/${block._id}`);

      if (!updatedData.data) {
        alert("Failed to delete the room.");
        return;
      }

      localStorage.setItem("block", JSON.stringify(updatedData.data));
      setBlock(updatedData.data);
      setRoomData(updatedData.data.floors.find((f) => f._id === floorid._id)?.rooms || []);
      
      alert(`Room '${room.room_name}' has been deleted.`);
    } catch (error) {
      alert("Something went wrong");
      console.error(error);
    }
  };

  const backtohome = () => {
    navigate(`/`);
  };

  return (
    <div className="floor-form">
      <h1>Floor Page for Block: {block?.block_name}</h1>
      {err && <p className="error">Error: {err}</p>}
      <button className="back_btn" onClick={backtohome}>Back</button>

      <div className={`${((access !== "super_admin") && (access === "student" || dept.toLowerCase() !== block.block_name.toLowerCase())) ? "grant-access" : "floor-input"}`}
>
        <form>
          <input
            type="text"
            value={floorName}
            onChange={(e) => setFloorName(e.target.value)}
            placeholder="Enter floor name"
          />
          <button onClick={handleAddFloor}>Add Floor</button>
          {floorid && <button className="deleteButton" onClick={deleteFloor}>Delete</button>}
        </form>
      </div>

      <div className="floor-details">
        {block?.floors?.map((floor, index) => (
          <div
            className="floor-text"
            key={index}
            onClick={() => displayRoom(floor)}
          >
            <h1>{floor.floor_name}</h1>
            <p>{floor.rooms.length} Rooms</p>
          </div>
        ))}
      </div>

      {floorid && (
        <div>
          <button className={`${((access !== "super_admin") && (access === "student" || dept.toLowerCase() !== block.block_name.toLowerCase())) ? "grant-access" : ""}`}
          onClick={addRooms}>Add Room to {floorid.floor_name.toUpperCase()}</button>

          <h2>Rooms:</h2>
          {roomdata.length > 0 ? (
            <div className="room-details">
              {roomdata.map((room, index) => {
                return (
                  <div key={index} className={`room ${room.occupied ? "occupied-room" : ""}`} >
                    <p>{room.room_id}</p>
                    <h3>{room.room_name}</h3>
                    <p>{room.room_type}</p>
                    <p>{room.room_capacity}</p>
                    <p>{room.occupied ? "Occupied" : "Empty"}</p>
                    <button className={`${((access !== "super_admin") && (access === "student" || dept.toLowerCase() !== block.block_name.toLowerCase())) ? "grant-access" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      modifyRoom(room);
                    }}>Modify</button>
                    <button  className={`${((access !== "super_admin") && (access === "student" || dept.toLowerCase() !== block.block_name.toLowerCase())) ? "grant-access" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRoom(room);
                    }}>Delete</button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <p className="no-rooms-message">No rooms available for this floor.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Floorpage;




