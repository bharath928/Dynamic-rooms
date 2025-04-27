import React, { useEffect, useState, useRef } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


const Homepage = () => {
  const [block, setBlock] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
 
  const [access, setAccess] = useState("");
  const [dept, setDept] = useState("");
  const [isRefresh, setIsRefresh] = useState(false);


  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [editingBlockId, setEditingBlockId] = useState(null);
const [newBlockName, setNewBlockName] = useState("");




  // Shortcut keys
  useEffect(() => {
    const shortcutKeys = (e) => {
      if (e.altKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        navigate("/login");
      }
      if (e.ctrlKey && e.key === "r") {
        e.preventDefault();
        navigate("/register");
      }
    };


    window.addEventListener("keydown", shortcutKeys);
    return () => {
      window.removeEventListener("keydown", shortcutKeys);
    };
  }, []);


  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      navigate("/");
    };


    const token = sessionStorage.getItem("token");
    const decode = jwtDecode(token);
    setAccess(decode.role);
    setDept(decode.dept);
   
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
  }, [isRefresh]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };


    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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


  const modifyBlock = async (e) => {
    try {
      const block_name = prompt("Enter new block name");
      if (!block_name) {
        toast.warn("Block name cannot be empty!");
        return;
      }
      await axios.put(`http://localhost:5000/block/update-data/${e._id}`, {
        "new_block": block_name
      });
      toast.success(`Block modified successfully to ${block_name}`);
      setIsRefresh(!isRefresh);
    } catch (err) {
      console.log(err.message);
      toast.error(`Error: ${err.message}`);
    }
  };


  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);


    const allRooms = block.flatMap(block =>
      block.floors.flatMap(floor =>
        floor.rooms.map(room => ({
          ...room,
          block_name: block.block_name
        }))
      )
    );


    if (term === "") {
      setFilteredRooms(allRooms);
    } else {
      setFilteredRooms(allRooms.filter(room =>
        room.room_name.toLowerCase().includes(term) ||
        room.room_type.toLowerCase().includes(term)
      ));
    }
  };


  const deleteBlock = async (e) => {
    try {
      if (window.confirm(`Are you sure you want to delete ${e.block_name}?`)) {
        await axios.delete(`http://localhost:5000/block/delete-data/${e._id}`);
        toast.success(`${e.block_name} has been deleted successfully`);
       
        const details = await axios.get("http://localhost:5000/block/get-data");
        setBlock(details.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while deleting the block.");
    }
  };


  const handleSignOut = () => {
    sessionStorage.clear();
    toast.success("Signed out successfully!");
    navigate("/login");
  };


  const handleRegisterUser = () => {
    navigate("/register");
  };


  const dashboardHandler = () => {
    navigate("/dashboard");
  };


  const roomsOverview = () => {
    navigate("/roomsOverview");
  };


  return (
    <>
      {/* Header/Navbar - Fixed */}
      <div
        style={{
          backgroundColor: '#1a237e',
          padding: '10px 0',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1000
        }}
      >
        <div className="container-fluid d-flex align-items-center justify-content-between" style={{ display: 'flex', alignItems: 'center' }}>
          {/* Combined Single Div with Logo, Title, and Search + Hamburger Menu */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Left: Logo */}
            <div style={{ flex: '0 1 auto' }}>
              <img
                src="logo2.jpg"
                alt="Logo"
                style={{
                  height: '80px', // Reduced size for smaller screens
                  width: 'auto',
                  marginLeft: '15px',
                  borderRadius: '10px'
                }}
              />
            </div>
 
            {/* Center: Dynamic Rooms Title */}
            <h3 className="m-0 text-center" style={{ color: 'white', flex: '1' }}>
              Dynamic Rooms
            </h3>
 
            {/* Right: Search Bar */}
            <div className="d-flex align-items-center" style={{ flex: '0 1 auto', marginRight: '1cm' }}>
              <input
                type="search"
                className="form-control me-2"
                placeholder="Search..."
                onChange={(e) => handleSearch(e)}
                style={{ backgroundColor: '#eee' }}
              />
            </div>
 
            {/* Right: Hamburger Menu */}
            <div className="position-relative" ref={menuRef}>
              <button className="btn btn-outline-light" onClick={() => setShowMenu(!showMenu)}>
                ☰
              </button>
              {/* Dropdown Menu */}
                {showMenu && (
                  <ul className="dropdown-menu show position-absolute end-0 mt-2">
                    {access === 'super_admin' && (
                      <li>
                        <button className="dropdown-item text-primary" onClick={() => navigate('/aitam')}>
                          Add Block
                        </button>
                      </li>
                    )}
                    {access !== 'student' && (
                      <li>
                        <button className="dropdown-item text-success" onClick={handleRegisterUser}>
                          Register
                        </button>
                      </li>
                    )}
                    {access === 'super_admin' && (
                      <li>
                        <button className="dropdown-item text-primary" onClick={dashboardHandler}>
                          Dashboard
                        </button>
                      </li>
                    )}
                    <li>
                      <button className="dropdown-item text-warning" onClick={roomsOverview}>
                        Rooms Overview
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleSignOut}>
                        Sign Out
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
 
       
      </div>
 
      {/* 🧠 Push Main Content Down so it's not hidden under Navbar */}
      <div style={{ marginTop: '130px' }}>
        {/* Room Details Section (Shown when Searching) */}
        {searchTerm !== '' && (
          <div
            className="room-overlay"
            style={{
              position: 'fixed',
              top: '130px', // Same as marginTop
              left: 0,
              width: '100vw',
              height: 'calc(100vh - 130px)', // Full height minus navbar
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              zIndex: 999,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'flex-start'
            }}
          >
            {filteredRooms.length ? (
              filteredRooms.map((room, index) => (
                <div
                  className="room-card card p-2 shadow-sm m-2 d-flex flex-column align-items-center"
                  key={index}
                  style={{ width: '220px' }}
                >
                  <h5 className="text-primary">{room.block_name.toUpperCase()}</h5>
                  <h6>{room.room_name.toUpperCase()}</h6>
                  <p className="small">Type: {room.room_type}</p>
                  <p className="small">Capacity: {room.room_capacity}</p>
                  <p className={room.occupied ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                    {room.occupied ? 'Occupied' : 'Available'}
                  </p>
                </div>
              ))
            ) : (
              <h3 className="text-center text-muted">NO Matching Rooms...</h3>
            )}
          </div>
        )}
 
        {/* 🧹 You can continue your normal content here below */}
      </div>
 
      {/* Main Block List */}
      {!block.length ? (
        <h1 className="text-center text-muted mt-4">No data found...</h1>
      ) : (
        <div className={`row g-2 ${searchTerm !== '' ? 'blur-content' : ''}`}>
          {block.map((e, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-3">
              <div className="card shadow-sm border-0 p-2">
                <div
                  className="card-content text-center"
                  onClick={() => navigate(`/aitam/${e.block_name}`, { state: { block: e } })}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="img bg-light mb-1 rounded" style={{ height: '80px' }}></div>
                  <h5 className="text-primary">{e.block_name.toUpperCase()}</h5>
                  <p className="small text-muted">No of Floors: {e.floors.length}</p>
                </div>
 
                {(access === 'super_admin' || e.block_name.toLowerCase() === dept) && (
                  <div className="d-flex justify-content-between card-button">
                    <button className="btn btn-primary btn-sm" onClick={() => modifyBlock(e)}>
                      Modify
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteBlock(e)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );


}
export default Homepage;