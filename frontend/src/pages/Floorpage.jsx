
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./FloorPage.css";
import { useNavigate } from "react-router-dom";

const Floorpage = () => {
  const { state } = useLocation();
  // const [block, setBlock] = useState(state?.block || null);
  const [block, setBlock] = useState(() => {
    return state?.block || JSON.parse(localStorage.getItem("block")) || null;
  });
  
  const [floorid,setfloorid] = useState(null);//floor details from the database....
  const [floorName, setFloorName] = useState("");//DATA from the form...
  const [roomdata, setRoomData] = useState([]);
  const [err, setErr] = useState("");
  const navigate = useNavigate()

  // block?localStorage.setItem("block",JSON.stringify(block)):setBlock(JSON.parse(localStorage.getItem("block")))

  // useEffect(()=>{
  //     block?localStorage.setItem("block",JSON.stringify(block)):setBlock(JSON.parse(localStorage.getItem("block")))
  // },[])
  // useEffect(() => {
  //   if (!block) {
  //     const storedBlock = localStorage.getItem("block");
  //     if (storedBlock) {
  //       setBlock(JSON.parse(storedBlock));
  //     }
  //   }
  // }, []);
  

  // Fetch the data from the database
  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/block/get-data/${block._id}`
        );
        setBlock(response.data); // Update block with data from the database
        localStorage.setItem("block",JSON.stringify(block))
      } catch (error) {
        setErr("Failed to fetch updated block data");
        console.error(error);
      }
    };
    fetchBlockData();
  }, []);

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
  
  const deleteFloor = async()=>{
    try{
      window.confirm("Do you want to delete")
      await axios.delete(`http://localhost:5000/block/${block._id}/floor/${floorid._id}`)
      const updatedData = await axios.get(`http://localhost:5000/block/get-data/${block._id}`)
      if(!updatedData){
        alert("Failed to delete the floor")
      }

      localStorage.setItem("block",JSON.stringify(updatedData.data))
      alert("floor has been deleted")
      navigate(`/get-data/${updatedData.data.block_name}`,{state:{block:updatedData.data}})
      // console.log(updatedData.data)
    }catch(e){
      alert("something went wrong....")
    }
  }

  // const deleteFloor = async () => {
  //   if (!window.confirm("Do you want to delete this floor?")) return;
  
  //   try {
  //     await axios.delete(`http://localhost:5000/block/${block._id}/floor/${floorid._id}`);
  
  //     // Fetch updated block data BEFORE navigating
  //     const response = await axios.get(`http://localhost:5000/block/get-data/${block._id}`);
  //     if (!response.data) {
  //       alert("Failed to update block data after deletion.");
  //       return;
  //     }
      
  //     console.log(response.data)
  //     setBlock(response.data);
  //     localStorage.setItem("block", JSON.stringify(response.data));
  
  //     alert("Floor has been deleted");
  
  //     // Navigate only if block exists
  //     navigate(`/get-data/${block.block_name}`, { state: { block: response.data } });
  
  //   } catch (e) {
  //     alert("Something went wrong...");
  //     console.error(e);
  //   }
  // };
  

  const displayRoom = (floor) => {
    setRoomData(floor.rooms)
    setfloorid(floor)
  };


  const addRooms = ()=>{
    navigate(`/get-data/${block.block_name}/${floorid.floor_name}`,{state:{floor:floorid,Block:block}});
  }

  const modifyRoom = (room)=>{
    // console.log(room._id)
    navigate(`/get-data/${block.block_name}/${floorid.floor_name}/modify/${room.room_name}`,{state:{Block:block,floor:floorid,Room:room}})
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
        {floorid && <button class="deleteButton" onClick={deleteFloor}>Delete</button>}
        </form>
      </div>

      {/* Displaying the floor details */}
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

        
      {floorid &&
        (
          <div>
            <button onClick={addRooms}>Add Room to {floorid.floor_name.toUpperCase()}</button>
            <h2>Rooms:</h2>
            {roomdata.length > 0 ? (
              <div className="room-details">
                  {roomdata.map((room, index) => (
                    <div key={index} className="room">
                      <p>{room.room_id}</p>
                      <h3>{room.room_name}</h3>
                      <p>{room.room_type}</p>
                      <p>{room.room_capacity}</p>
                      <button onClick={(e)=>{
                        e.stopPropagation();
                        modifyRoom(room);
                      }}>Modify</button>
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
        )
      }

      {/* Room Details Section */}
      
    </div>
  );
};

export default Floorpage;
