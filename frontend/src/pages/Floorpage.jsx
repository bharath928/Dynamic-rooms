// import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import axios from "axios";
// import "./FloorPage.css";

// const Floorpage = () => {
//   const { state } = useLocation();
//   // let { block } = state; // Extract block data
// const [block, setBlock] = useState(state.block);

//   // const [floorData, setFloorData] = useState([]);
//   const [floorName, setFloorName] = useState("");
//   const [roomdata,setroomdata] = useState()
//   const [err, setErr] = useState("");

//   //Fectch the data from the database...
//   useEffect(()=>{
//     const fetchBlockData = async () => {
//       try {
//       const responsive = await axios.get(`http://localhost:5000/block/get-data/${block._id}`);
//         setBlock(responsive.data); // Update floors with data from the database
//       } catch (error) {
//         setErr("Failed to fetch updated block data");
//         console.error(error);
//       }
//       fetchBlockData()
//     };
//   },[])

//   const handleAddFloor = async (e) => {
//     e.preventDefault()
//     try {
//       const response = await axios.post(`http://localhost:5000/block/floor/${block._id}`, {
//         // block_id:    block.id, // Associate with block ID
//         floor_name: floorName,
//       });
//       setFloorName(""); // Reset input
      
//       const responsive = await axios.get(`http://localhost:5000/block/get-data/${block._id}`);
//       setBlock(responsive.data);
//     } catch (error) {
//       setErr(error.message);
//       console.log(error)
//     }
//   };

//   const displayRoom = (e)=>{
//       setroomdata(e);
//       console.log(roomdata)
//   }

//   return (
//     <div className="floor-form">
//       <h1>Floor Page for Block: {block.block_name}</h1>
//       {err && <p className="error">Error: {err}</p>}

//       {/* Add Floors to the Block */}
//         <div className="floor-input">
//           <form action="">
//             <input
//               type="text"
//               value={floorName}
//               onChange={(e) => setFloorName(e.target.value)}
//               placeholder="Enter floor name"
//             />
//             <button onClick={handleAddFloor}>Add Floor</button>
//           </form>
//         </div>

//         <div className="floor-details">
//           {block.floors.map((e,index)=>(
//             <div className="floor-text" key={index} onClick={()=>{displayRoom(e)}}>
//               <h1>{e.floor_name}</h1>
//               <p>{e.rooms.length}</p>
//             </div>
//           ))}
//         </div>

//         <div className="room-details">

//         </div>
        
//     </div> 
//   );
// };

// export default Floorpage;

// // import React, { useState } from "react";

// // const FloorDetails = ({ block }) => {
// //   const [selectedFloor, setSelectedFloor] = useState(null); // Track the selected floor

// //   const handleFloorClick = (floorId) => {
// //     setSelectedFloor((prev) => (prev === floorId ? null : floorId)); // Toggle selection
// //   };

// //   return (
// //     <div className="floor-details">
// //       {/* Floors displayed in a row */}
// //       <div className="floors-row">
// //         {block.floors.map((floor, index) => (
// //           <div
// //             key={index}
// //             className={`floor-text ${selectedFloor === floor._id ? "active" : ""}`}
// //             onClick={() => handleFloorClick(floor._id)}
// //           >
// //             <h1>{floor.floor_name}</h1>
// //           </div>
// //         ))}
// //       </div>

// //       {/* Display rooms of the selected floor */}
// //       {block.floors.map((floor) => (
// //         <div
// //           key={floor._id}
// //           className={`rooms-container ${selectedFloor === floor._id ? "visible" : "hidden"}`}
// //         >
// //           {floor.rooms.map((room, index) => (
// //             <div key={index} className="room">
// //               <p>{room.room_name}</p>
// //             </div>
// //           ))}
// //         </div>
// //       ))}
// //     </div>
// //   );
// // };

// // export default FloorDetails;


import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./FloorPage.css";

const Floorpage = () => {
  const { state } = useLocation();
  const [block, setBlock] = useState(state.block);
  const [floorName, setFloorName] = useState("");
  const [roomdata, setRoomData] = useState(null);
  const [err, setErr] = useState("");

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
    // console.log(floor)
    setRoomData(floor.rooms);
  };

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

      {/* Room Details Section */}
      {roomdata && roomdata.length > 0 ? (
        <div className="room-details">
          <h2>Rooms:</h2>
          <div className="rooms-container">
            {roomdata.map((room, index) => (
              <div key={index} className="room">
                <h3>{room.room_name}</h3>
                <p>Type: {room.room_type}</p>
                <p>Capacity: {room.room_capacity}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="no-rooms-message">No rooms available for this floor.</p>
      )}

    </div>
  );
};

export default Floorpage;
