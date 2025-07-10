import React, { useEffect, useState, useRef } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Homepage = ({footerHeight}) => {
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
    {/* Fixed Header */}
    <div style={{
      background: 'linear-gradient(90deg,#0066cc,#003366)',
      padding: '12px 0',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
    }}>
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between flex-wrap w-100">

          {/* Logo */}
          <div>
            <img
              src="logo2.webp"
              alt="Logo"
              style={{
                height: '55px',
                width: 'auto',
                marginLeft: '10px',
                borderRadius: '10px',
                boxShadow: '0 1px 6px rgba(255,255,255,0.1)'
              }}
            />
          </div>

          {/* Title */}
          <h3 className="m-0 text-white text-center flex-grow-1"
            style={{
              fontSize: 'clamp(1.4rem, 2vw, 2rem)',
              fontWeight: '600',
              letterSpacing: '0.5px',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}
          >
            AITAM Digital Room Management Portal
          </h3>

          {/* Right Controls (Search + Hamburger) */}
          <div className="d-flex align-items-center justify-content-between w-100 mt-2 mt-md-0 flex-wrap"
     style={{ maxWidth: '100%', gap: '10px' }}
>
  {/* Search */}
  <div style={{ flex: '1' }}>
    <input
      type="search"
      className="form-control"
      placeholder="Search Rooms..!"
      onChange={(e) => handleSearch(e)}
      style={{
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '6px',
        fontSize: '0.95rem',
        width: '100%'
      }}
    />
  </div>

  {/* Hamburger */}
  <div className="position-relative" ref={menuRef} style={{ marginLeft: 'auto' }}>
    <button className="btn btn-outline-light"
      onClick={() => setShowMenu(!showMenu)}
      style={{
        borderRadius: '6px',
        padding: '6px 12px',
        fontWeight: 'bold',
        backgroundColor: '#0056b3',
        color: 'white',
        border: 'none'
      }}
    >
      ☰
    </button>
    {showMenu && (
                <ul className="dropdown-menu show position-absolute end-0 mt-2"
                  style={{
                    minWidth: '180px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                  }}
                >
                  {access === 'super_admin' && (
                    <li><button className="dropdown-item text-primary" onClick={() => navigate('/aitam')}>Add Block</button></li>
                  )}
                  {access !== 'student' && (
                    <li><button className="dropdown-item text-success" onClick={handleRegisterUser}>Register</button></li>
                  )}
                  {access === 'super_admin' && (
                    <li><button className="dropdown-item text-primary" onClick={dashboardHandler}>Dashboard</button></li>
                  )}
                  <li><button className="dropdown-item text-warning" onClick={roomsOverview}>Rooms Overview</button></li>
                  <li><button className="dropdown-item text-success" onClick={() => navigate('/findFaculty')}>Find Faculty</button></li>
                  <li><button className="dropdown-item text-danger" onClick={handleSignOut}>Sign Out</button></li>
                </ul>
              )}
  </div>
</div>

        </div>
      </div>
    </div>


    {/* Main Content with Padding */}
    <div style={{ paddingTop: '150px', paddingInline: '12px' }}>
      {/* Search Results */}
        {searchTerm !== '' && (
    <div
      className="room-overlay"
      style={{
        position: 'fixed',
        top: '130px',
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 130px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        zIndex: 999,
        overflowY: 'auto',
        paddingTop: '50px',         // ⬅ Top padding for header space
    paddingBottom: '100px', 
        // paddingBottom: `${footerHeight}px`,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      {filteredRooms.length ? (
        filteredRooms.map((room, index) => {
          // Guard clause to skip invalid room data
          if (!room || !room.block_name || !room.room_name) return null;

          return (
            <div
              className="room-card card p-2 shadow-sm m-2 d-flex flex-column align-items-center"
              key={index}
              style={{ width: '100%', maxWidth: '220px', flex: '1 1 auto' }}
            >
              <h5 className="text-primary">
                {(room.block_name || '').toUpperCase()}
              </h5>
             <h6 style={{ textAlign: 'center' }}>
                {(room.room_name || '').toUpperCase()}
              </h6>
              <p className="small">Type: {room.room_type || 'N/A'}</p>
              <p className="small">Capacity: {room.room_capacity || 'N/A'}</p>
              <p
                className={
                  room.occupied ? 'text-danger fw-bold' : 'text-success fw-bold'
                }
              >
                {room.occupied ? 'Occupied' : 'Available'}
              </p>
            </div>
          );
        })
      ) : (
        <h3 className="text-center text-muted">NO Matching Rooms...</h3>
      )}
    </div>
      )}

      {/* Main Block Cards */}
      {!block.length ? (
        <h1 className="text-center text-muted mt-4">No data found...</h1>
      ) : (
        <div className={`row g-2 ${searchTerm !== '' ? 'blur-content' : ''}`}
          // style={{ marginTop: '28px' }}
          style={{ paddingTop: '30px', paddingBottom: '30px' }}
        >
          {block.map((e, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-3">
              <div
                className="card block-card shadow-sm p-3"
                onClick={() => navigate(`/aitam/${e.block_name}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-content text-center">
                  <div className="img bg-light mb-3 rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: "80px", height: "80px" }}>
                    <i className="bi bi-building fs-3 text-secondary"></i>
                  </div>
                  <h5 className="text-uppercase text-dark fw-bold mb-1">{e.block_name}</h5>
                  <p className="small text-muted">No of Floors: {e.floors.length}</p>
                </div>

                {(access === 'super_admin' || e.block_name.toLowerCase() === dept) && (
                  <div className="d-flex justify-content-between mt-3">
                    <button
                      className="btn btn-outline-primary btn-sm w-100 me-2"
                      onClick={(ev) => { ev.stopPropagation(); modifyBlock(e); }}
                    >
                      Modify
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm w-100"
                      onClick={(ev) => { ev.stopPropagation(); deleteBlock(e); }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </>
);

}
export default Homepage;
