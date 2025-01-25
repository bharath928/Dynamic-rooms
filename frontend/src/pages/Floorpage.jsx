
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./FloorPage.css";
import { useNavigate } from "react-router-dom";

const Floorpage = () => {
  const { state } = useLocation();
  const [block, setBlock] = useState(state.block);
  const [floorid,setfloorid] = useState("");//floor details from the database....

  const [floorName, setFloorName] = useState("");//DATA from the form...
  const [roomdata, setRoomData] = useState([]);
  const [err, setErr] = useState("");
  const navigate = useNavigate()

  // Fetch the data from the database
  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/block/get-data/${block._id}`
        );
        setBlock(response.data); // Update block with data from the database
      } catch (error) {
        setErr("Failed to fetch updated block data");
        console.error(error);
      }
    };
    fetchBlockData();
  }, [block._id]);

  const handleAddFloor = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/block/floor/${block._id}`, {
        floor_name: floorName,
      });
      setFloorName(""); // Reset input
      const response = await axios.get(
        `http://localhost:5000/block/get-data/${block._id}`
      );
      setBlock(response.data);
    } catch (error) {
      setErr(error.message);
      console.error(error);
    }
  };

  const displayRoom = (floor) => {
    // console.log(floor.rooms)
    setRoomData(floor.rooms)
    setfloorid(floor)
  };

  const addRooms = ()=>{
    navigate(`/get-data/${block.block_name}/${floorid.floor_name}, {state:{floorid:${floorid._id}},blockid:${block._id}}`);
  }

  return (
    <div className="floor-form">
      <h1>Floor Page for Block: {block.block_name}</h1>
      {err && <p className="error">Error: {err}</p>}

      {/* Add Floors to the Block */}
      <div className="floor-input">
        <form>
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
        {block.floors.map((floor, index) => (
          <div
            className="floor-text"
            key={index}
            onClick={() => {
              displayRoom(floor);
            }}
          >
            <h1>{floor.floor_name}</h1>
            <p>{floor.rooms.length} Rooms</p>
          </div>
        ))}
      </div>


      {setfloorid &&
        <button onClick={addRooms}>Add Room</button>
      }

      {/* Room Details Section */}
      {roomdata.length > 0 ? (
        <div className="room-details">
          <h2>Rooms:</h2>
            {roomdata.map((room, index) => (
              <div key={index} className="room">
                <p>ID: {room.room_id}</p>
                <h3>Room Name:{room.room_name}</h3>
                <p>Type: {room.room_type}</p>
                <p>Capacity: {room.room_capacity}</p>
              </div>
            ))}
        </div>
      ) : (
        <div>
          <p className="no-rooms-message">No rooms available for this floor.</p>          
          {/* <button>Add Room</button> */}
        </div>
      )}
    </div>
  );
};

export default Floorpage;
