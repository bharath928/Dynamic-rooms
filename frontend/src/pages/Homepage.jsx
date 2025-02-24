import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

const Homepage = () => {
  const [block, setBlock] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [access,setaccess]=useState("");
  const [isrefresh,setisrefresh] = useState(false)


  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      navigate("/"); 
     
    };
    setaccess(sessionStorage.getItem("role"));

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
    sessionStorage.removeItem("token");  
    sessionStorage.removeItem("role");   
    // window.location.href = "/login";   
    navigate("/login"); 
  };
  
  const handleRegisterUser=()=>{
    navigate("/register");
  }
  
  return (
    <div className="container">
      <button
      // {access=="student"}
        className={`${access=="student"?"grant-access":"add-block-button"}`}
        onClick={() => navigate("/add-block")}
      >
        Add Block
      </button> 

      <button
        // className='register-user'
        className={`${access=="student"?"grant-access":"register-user"}`}

        onClick={()=>handleRegisterUser()}
      >
        Register
      </button>

      <button
        // className='signout-button'
        className={`${access=="student"?"grant-access":"signout-button"}`}
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

              <div className={`${access=="student"?"grant-access":"card-button"}`}>
                <input type="button" value="Modify" onClick={()=>modifyBlock(e)}/>
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
