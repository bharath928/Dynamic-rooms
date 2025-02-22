import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

const Homepage = () => {
  const [block, setBlock] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // useEffect(()=>{
  //   const shortcutKeys = async(event)=>{
  //       if(event.ctrlKey && event.altKey &&event.key==="a"){
  //         navigate("/add-block");
  //       }  

  //       window.addEventListener('keydown',shortcutKeys);
  //       return()=>{
  //         window.removeEventListener('keydown',shortcutKeys)
  //       }
  //   }
  // },[])

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await axios.get("http://localhost:5000/block/get-data");
        setBlock(details.data);
      } catch (err) {
        setErr(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, []);

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

  const deleteBlock = async (e) => {
    try {
      // Display a confirmation dialog
      const isConfirmed = window.confirm(`Are you sure you want to delete ${e.block_name}?`);
  
      if (!isConfirmed) {
        return; // Exit the function if the user cancels
      }
  
      // Proceed with the deletion
      const response = await axios.delete(`http://localhost:5000/block/delete-data/${e._id}`);
      alert(`${e.block_name} has been deleted successfully`);

      // Fetch the updated list of blocks
      const details = await axios.get("http://localhost:5000/block/get-data");
      setBlock(details.data);
    } catch (err) {
      alert("Something went wrong while deleting the block.");
    }
  };
  
  const handleSignOut = () => {
    sessionStorage.removeItem("token");  // Remove token
    sessionStorage.removeItem("role");   // Remove role (if stored)
    window.location.href = "/login";   // Redirect to login page
  };
  
  const handleRegisterUser=()=>{
    navigate("/register");
  }
  
  return (
    <div className="container">
      <button
        className="add-block-button"
        onClick={() => navigate("/add-block")}
      >
        Add Block
      </button> 

      <button
        className='register-user'
        onClick={()=>handleRegisterUser()}
      >
        Register
      </button>
      <button
        className='signout-button'
        onClick={()=>handleSignOut()}
      >
        signout
      </button>
      <h1>Home Page</h1>
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

              <div className='card-button'>
                <input type="button" value="Delete" onClick={()=>{deleteBlock(e)}}/>
              </div>
            </div>
            
          ))}
        </div>
      )}
    </div>
  );
};

export default Homepage;
