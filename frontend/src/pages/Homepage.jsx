import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import {jwtDecode} from "jwt-decode";
const Homepage = () => {
  const [block, setBlock] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  const [access,setaccess] = useState("");
  const [dept,setdept] = useState("");
  const [isrefresh,setisrefresh] = useState(false)

  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      navigate("/"); 
     
    };
   
    const token=sessionStorage.getItem("token");
    const decode=jwtDecode(token);

      setaccess(decode.role);
      setdept(decode.dept);
     
    const fetchDetails = async () => {
      try {
        const details = await axios.get("http://localhost:5000/block/get-data");
        setBlock(details.data);
        const allRooms = details.data.flatMap(block => 
          block.floors.flatMap(floor => floor.rooms)
        );
        
        setFilteredRooms(allRooms);
        
      } catch (err) {
        setErr(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();

    window.history.pushState(null, null, window.location.href);
  window.addEventListener("popstate", handleBackButton);

  return () => {
    window.removeEventListener("popstate", handleBackButton);
  };
  }, [isrefresh]);

  if (loading) {
    return (
      <div className="loading-con">
        <div className="loading"></div>
      </div>
    );
  }

  if (err) {
    return <div className="error">Error occurred: {err}</div>;
  }

  const modifyBlock = async(e)=>{
    try{
      const block_name = prompt("Enter new block name");
    const response = await axios.put(`http://localhost:5000/block/update-data/${e._id}`,{
      "new_block":block_name
    })
    alert(`Block modified succesfully to ${block_name}`)
    setisrefresh(!isrefresh);
    }catch(err){
      console.log(err.message)
      alert(err.message)
    }
  }

  
  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const allRooms = block.flatMap(block => 
      block.floors.flatMap(floor => floor.rooms)
    );
    
    setFilteredRooms(allRooms);

    if (term !== "") {
      setFilteredRooms(filteredRooms.filter(room =>
        room.room_name.toLowerCase().includes(term) ||
        room.room_type.toLowerCase().includes(term)));
    }

    // console.log(filteredRooms);
  };

  const deleteBlock = async (e) => {
    try {
      const isConfirmed = window.confirm(`Are you sure you want to delete ${e.block_name}?`);
      
      if (!isConfirmed) {
        return; 
      }
      
      const response = await axios.delete(`http://localhost:5000/block/delete-data/${e._id}`);
      alert(`${e.block_name} has been deleted successfully`);
      
      const details = await axios.get("http://localhost:5000/block/get-data");
      setBlock(details.data);
    } catch (err) {
      alert("Something went wrong while deleting the block.");
    }
  };
  
  const handleSignOut = () => {
    sessionStorage.clear();  
    // sessionStorage.removeItem("role");   
    // window.location.href = "/login";   
    navigate("/login"); 
  };
  
  const handleRegisterUser=()=>{
    navigate("/register");
  }
  
  const dashboardHandler=()=>{
    navigate("/dashboard");
  }
  return (
    <div className="container">
      <button
      // {access=="student"}
        className={`${access!="super_admin"?"grant-access":"add-block-button"}`}
        onClick={() => navigate("/add-block")}
      >
        Add Block
      </button> 
    <input type='search' onChange={(e)=>handleSearch(e)}/>
      <button
        // className='register-user'
        className={`${access=="student"?"grant-access":"register-user"}`}
        onClick={()=>handleRegisterUser()}
      >
        Register
      </button>

      <button
        // className='signout-button'
        className="signout-button"
        onClick={()=>handleSignOut()}
      >
        signout
      </button>
    <button className='dashboard' onClick={dashboardHandler}>DashBoard</button>
      <h1>Home Page</h1>

      <div className="room-container">
        {filteredRooms.length && searchTerm!==""? (
          filteredRooms.map((room, index) => (
            <div className="room-card" key={index}>
              <h4>{room.room_name.toUpperCase()}</h4>
              <p>Type: {room.room_type}</p>
              <p>Capacity: {room.room_capacity}</p>
              <p>{room.occupied ? "Occupied" : "Available"}</p>
            </div>
          ))
          
        ) : (
          <h3>{searchTerm==""?"":"NO Matching Rooms..."}</h3>
        )}
      </div>

      {!block.length ? (
        <h1>No data found...</h1>
      ) : (
        <div className="card-container">
          {block.map((e, index) => (
            <div className="card" key={index}>
                <div
                className='card-content'
                onClick={() => navigate(`/get-data/${e.block_name}`, { state: { block: e } })}
              >
                <div className="img"></div>
                <h4>{e.block_name.toUpperCase()}</h4>
                <p>No of Floors: {e.floors.length}</p>
                {/* <input type="button" value="Delete" onClick={() => deleteBlock(e)}/> */}
              </div>

                <div className={`${((access !== "super_admin") && (access === "student" || dept.toLowerCase() !== e.block_name.toLowerCase())) ? "grant-access" : "card-button"}`}>
                  <input type="button" value="Modify" onClick={() => modifyBlock(e)} />
                  <input type="button" value="Delete" onClick={() => deleteBlock(e)} />
                  </div>

            </div>
            
          ))}
        </div>
      )}
    </div>
  );
};

export default Homepage;








// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import { 
//   Button, 
//   TextField, 
//   Card, 
//   CardContent, 
//   Typography, 
//   Container, 
//   Grid, 
//   Box 
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import "./Homepage.css"; 

// const Homepage = () => {
//   const [block, setBlock] = useState([]);
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const navigate = useNavigate();
//   const [access, setAccess] = useState("");

//   useEffect(() => {
//     const token = sessionStorage.getItem("token");
//     if (token) {
//       const decode = jwtDecode(token);
//       setAccess(decode.role);
//     }

//     const fetchDetails = async () => {
//       try {
//         const details = await axios.get("http://localhost:5000/block/get-data");
//         setBlock(details.data);
//       } catch (err) {
//         setErr(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDetails();
//   }, []);

//   if (loading) return <div className="loading">Loading...</div>;
//   if (err) return <div className="error">Error: {err}</div>;

//   const handleDelete = async (blockName) => {
//     const confirmDelete = window.confirm(`Are you sure you want to delete ${blockName}?`);
//     if (!confirmDelete) return;

//     try {
//       await axios.delete(`http://localhost:5000/block/delete/${blockName}`);
//       setBlock(block.filter(b => b.block_name !== blockName));
//       alert(`${blockName} deleted successfully!`);
//     } catch (error) {
//       alert("Error deleting block: " + error.message);
//     }
//   };

//   const handleSearch = (event) => {
//     setSearchTerm(event.target.value.toLowerCase());
//   };

//   const filteredBlocks = block.filter(b => 
//     b.block_name.toLowerCase().includes(searchTerm)
//   );

//   return (
//     <Container maxWidth="lg" className="homepage-container">
//       <Box className="header-actions">
//         {access === "super_admin" && (
//           <Button variant="contained" color="primary" onClick={() => navigate("/add-block")}>
//             Add Block
//           </Button>
//         )}
//         <TextField 
//           variant="outlined"
//           label="Search Rooms"
//           onChange={handleSearch}
//           className="search-bar"
//         />
//         <Button 
//           variant="contained"
//           color="error"
//           onClick={() => {
//             sessionStorage.clear();
//             navigate("/login");
//           }}
//         >
//           Sign Out
//         </Button>
//         <Button variant="contained" color="success" onClick={() => navigate("/dashboard")}>
//           Dashboard
//         </Button>
//       </Box>

//       <Typography variant="h3" className="page-title">Home Page</Typography>

//       <Grid 
//         container 
//         spacing={3} 
//         justifyContent="center" 
//         className={`card-container ${searchTerm ? "search-active" : ""}`}
//       >
//         {filteredBlocks.length > 0 ? (
//           filteredBlocks.map((e, index) => (
//             <Grid 
//               item 
//               xs={12} sm={6} md={4} 
//               key={index} 
//               className="block-card highlighted"
//             >
//               <Card>
//                 <CardContent onClick={() => navigate(`/get-data/${e.block_name}`, { state: { block: e } })}>
//                   <Typography variant="h5">{e.block_name.toUpperCase()}</Typography>
//                   <Typography>No of Floors: {e.floors.length}</Typography>
//                 </CardContent>
//                 {(access === "super_admin" || access === "admin") && (
//                   <Box className="card-actions">
//                     <Button 
//                       variant="contained" 
//                       color="warning" 
//                       startIcon={<EditIcon />} 
//                       onClick={() => navigate(`/modify-block/${e.block_name}`)}
//                     >
//                       Modify
//                     </Button>
//                     <Button 
//                       variant="contained" 
//                       color="error" 
//                       startIcon={<DeleteIcon />} 
//                       onClick={() => handleDelete(e.block_name)}
//                     >
//                       Delete
//                     </Button>
//                   </Box>
//                 )}
//               </Card>
//             </Grid>
//           ))
//         ) : (
//           <Typography variant="h6" className="no-results">No results found</Typography>
//         )}
//       </Grid>
//     </Container>
//   );
// };

// export default Homepage;
