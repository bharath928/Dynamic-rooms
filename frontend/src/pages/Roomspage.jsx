import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { formatDistanceToNow } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Button, Form, Card, Row, Col, Container } from "react-bootstrap";
import * as XLSX from "xlsx";
import { useLocation } from "react-router-dom";

const Loader = ({ text = "Loading...", centered = true }) => {
  return (
    <div className={`d-flex ${centered ? "justify-content-center" : ""} align-items-center my-3`}>
      <div className="spinner-border text-primary me-2" role="status" />
      <span className="fs-5">{text}</span>
    </div>
  );
};

const Roomspage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { blockname,floorId } = useParams();

// const [floorid, setFloorid] = useState(null);
const [roomdata, setRoomData] = useState([]);
const [floorName,setFloorName] = useState("");
const [roomSearch, setRoomSearch] = useState("");
const [timetables, setTimetables] = useState([]);
// const [currentTimetable,setcurrentTimetable] = useState({})
const [selectedFile, setSelectedFile] = useState(null);
const [previewData, setPreviewData] = useState([]);
// const [flippedCards, setFlippedCards] = useState({});
const [expandedRoom, setExpandedRoom] = useState(null);
const [dept, setdept] = useState("");
const [err, setErr] = useState("");
const [access, setaccess] = useState("");
const [showDialog, setShowDialog] = useState(false);
const [dialogType, setDialogType] = useState("");
const [selectedRoom, setSelectedRoom] = useState(null);
const [filterStatus, setFilterStatus] = useState("all");
const [filterRoomType, setFilterRoomType] = useState("all");
const [uploadLoading,setuploadLoading] = useState(false);  
const [loading,setLoading] = useState(false)
const [pauseLoading,setpauseLoading] = useState(false)
const [blockId,setBlockId] = useState("")
const [initialLoading, setInitialLoading] = useState(true);
const [highlightedCard, setHighlightedCard] = useState(null);

const highlightedRoomId = location.state?.highlightedRoomId;

useEffect(() => {
  if (highlightedRoomId && roomdata.length > 0) {
    setHighlightedCard(highlightedRoomId);

    const element = document.getElementById(`room-${highlightedRoomId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const timer = setTimeout(() => {
      setHighlightedCard(null);
      navigate(location.pathname, { replace: true });
    }, 130);

    return () => clearTimeout(timer);
  }
}, [highlightedRoomId, roomdata, navigate, location.pathname]);


const fetchFloorData = async () => {
    try {
      if (initialLoading) 
        setInitialLoading(true); 
      const response = await axios.get(`http://localhost:5000/block/${blockname}/floor/get-data/${floorId}`);
      // setRoomData(response.data.rooms);
      const sortedData = [...response.data.rooms].sort((a, b) =>
          a.room_id.localeCompare(b.room_id)
        );
      setRoomData(sortedData);
      setFloorName(response.data.floor_name);
      // localStorage.setItem("floor", JSON.stringify(response.data));
    } catch (error) {
      setErr("Failed to fetch floor data");
      console.error(error);
    } finally {
      if (initialLoading) {
      setInitialLoading(false); // Mark that first fetch is done
    }
    }
  };

  const fetchTimetables = async()=>{
  try{
    const {data} = await axios.get(`http://localhost:5000/periods/blockTimetables/${blockname}`)
    setTimetables(data)
    // updateOccupancy();
  }catch(err){
    console.log(err.message)
  }
}

const fetchBlockId = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/block/get-data-name/${blockname}`);
    // console.log("Block ID:", res.data.blockId);
    setBlockId(res.data._id);
  } catch (err) {
    console.error(err);
  }
};


useEffect(() => {
  const token = sessionStorage.getItem("token");
    if (token) {
      try {
        setLoading(true)
        const decode = jwtDecode(token);
        setaccess(decode.role);
        setdept(decode.dept);
      } catch (error) {
        console.error("Invalid token");
        navigate("/login");
      }finally{
        setLoading(false)
      }
    }
  
  fetchFloorData();
  fetchTimetables();
  fetchBlockId();



  const interval = setInterval(() => {
    // if (roomdata.length > 0) 
      fetchTimetables();
  }, 30000);


  return () => clearInterval(interval);


}, [blockname,floorId]);

const timetableMap = React.useMemo(
  () =>
    Object.fromEntries(
      timetables.map(t => [t.className.trim().toLowerCase(), t.timetableData]) // { "XYZ": […], "2 CSE C": […] }
    ),
  [timetables]
);

const pausingData = React.useMemo(
  () =>
    Object.fromEntries(
      timetables.map(t => [t.className, t.isPaused]) // { "XYZ": […], "2 CSE C": […] }
    ),
  [timetables]
  );

useEffect(() => {
  const updateOccupancy = async () => {
    for (const room of roomdata) {
      const timetable = timetableMap[room.room_name.trim().toLowerCase()];
      if (!timetable || pausingData[room.room_name]) continue;

      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();

      const periodinfo = getCurrentPeriod(timetable, hour, minute);
      const shouldBeOccupied = (periodinfo.status === "Ongoing" && periodinfo.faculty !== "-");

      if (room.occupied !== shouldBeOccupied) {
        try {
          await fetch(`http://localhost:5000/block/floors/room/${blockId}/${floorId}/${room._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ occupied: shouldBeOccupied }),
          });
        } catch (error) {
          console.error(`Failed to update room ${room.room_name}:`, error);
        }
      }
    }
    fetchFloorData();
  };

  updateOccupancy();
  const interval = setInterval(updateOccupancy, 30000);

  return () => clearInterval(interval);
}, [timetables, roomdata, blockId, floorId, timetableMap]);


const confirmDeleteRoom = (room) => {
    setSelectedRoom(room);
    setDialogType("room");
    setShowDialog(true);
  };

function handleFileUpload(e) {
    const file = e.target.files[0];
    setSelectedFile(file);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: "-" });
      setPreviewData(parsedData);
    };
  }

   const handleUpload = async (room) => {
        if (!selectedFile || !room) {
          toast.warn("Please provide class name and upload a file.");
          return;
        } 
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('className', room);
        formData.append('blockName', blockname);
        try {
          setuploadLoading(true)
          const res = await axios.post('http://localhost:5000/periods/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          const data = await res.data;
          fetchTimetables();//update the timetables after uploading new timetable...
          alert(data.message);
        } catch (err) {
          setuploadLoading(false)
          alert("Upload failed!");
      }finally{
        setuploadLoading(false)
      }
    };

  const getCurrentPeriod = (timetable, testHour = null, testMin = null) => {
    try{
      // setLoading(true);
      if (!timetable || !Array.isArray(timetable)) {
      return { status: "Invalid timetable" };
    }
    // console.log("thursday")
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();


    if (testHour !== null && testMin !== null) {
      now.setHours(testHour);
      now.setMinutes(testMin);
    }


    // const today = "Tuesday";
    const today = days[now.getDay()];
    if (today === "Sunday") return { status: "Sunday is Holiday" };


    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTime = currentHour * 60 + currentMin;


    if (currentTime > (16 * 60 + 10) || currentTime < (9*60+15) ) return { status: "NoClasses" };


    const todayData = timetable.find(day => day.dayName === today);
    if (!todayData || !todayData.periods?.length) return { status: "No Classes" };


    const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.trim().split(" ");
    let [hours, minutes] = time.split(":").map(Number);


    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;


    return hours * 60 + minutes;
  };


    const currentPeriod = todayData.periods.find(period => {
      const start = parseTime(period.startTime);
      const end = parseTime(period.endTime);
      return currentTime >= start && currentTime < end;
    });
    
  if (currentPeriod) {
    return {
      status: "Ongoing",
      faculty:currentPeriod.faculty,
      info: (
        <div className="text-start text-dark px-3 py-2">
          <div className="mb-2">
            <strong>Period:</strong> <span className="text-muted">{currentPeriod.periodNumber}</span>
          </div>
          
          <div className="mb-2">
          <div className="mb-2">
            <strong>Subject:</strong> <span className="text-muted">{currentPeriod.subject}</span>
          </div>
            <strong>Time:</strong>{" "}
            <span className="text-muted">
              {currentPeriod.startTime} - {currentPeriod.endTime}
            </span>
          </div>
          <div className="mb-2">
            <strong>Faculty:</strong> <span className="text-muted">{currentPeriod.faculty}</span>
          </div>
        </div>
      )
    };
  }
    return { status: "Free Period" };


    }catch(e){
      console.error(e.message)
    }finally{
      // setLoading(false);
    }
  };



  const deleteTimetableByClass = async (className) => {
  const confirmed = window.confirm(`Are you sure you want to delete the timetable for ${className}?`);
  if (!confirmed) return;


  try {
    await axios.patch(`https://dr-backend-32ec.onrender.com/periods/delete/${blockname}/${className}`);
    alert("Timetable deleted successfully!");
    fetchTimetables()
  } catch (err) {
    console.error("Failed to delete timetable:", err);
    alert("Error deleting timetable");
  }
};

  const backToFloors = () => {
    setRoomData([]);
    setRoomSearch("");
    navigate(`/aitam/${blockname}`);
  };

  
    const addRooms = () => {
      if (blockname)
        navigate(`/aitam/${blockname}/${floorName}`, {
          state: { floor: floorId, Block: blockId ,BlockName : blockname,floorname : floorName},
        });
    };
  
  
    const modifyRoom = (room) => {
      toast.info(`Redirecting to modify room: ${room.room_name}`);
      navigate(`/aitam/${blockname}/${floorName}/modify/${room.room_name}`, {
        state: { Block: blockname, floor: floorId, Room: room, BlockId : blockId },
      });
    };
  
  
    const backtohome = () => {
      navigate(`/`)
      sessionStorage.removeItem("selectedFloor")
    };
  

    const handleConfirmDelete = async () => {
      setShowDialog(false);
      try {
        if (!blockname || !floorId) return;
          if (dialogType === "room" && selectedRoom) {
          await axios.delete(`http://localhost:5000/block/${blockId}/floor/${floorId}/room/${selectedRoom._id}`);
        }

        const updatedFloor = await axios.get(`http://localhost:5000/block/${blockname}/floor/get-data/${floorId}`);
        setRoomData(updatedFloor.data.rooms);

        toast.success(
          dialogType === "floor" 
            ? "Floor deleted" 
            : `Room '${selectedRoom.room_name}' deleted`
        );
      } catch (error) {
        toast.error("Something went wrong");
        console.error(error);
      }
    };

  const confirmDeleteFloor = async () => {
    const isConfirmed = window.confirm("Are you sure you want to delete this floor?");

  if (!isConfirmed) return; 

  try {
    if (!blockname || !floorId) return;

    // ✅ Delete the floor
    await axios.delete(`http://localhost:5000/block/${blockId}/floor/${floorId}`);

    toast.success("Floor deleted successfully!");

    // ✅ Navigate back to floor listing page
    setTimeout(() => {
       navigate(`/aitam/${blockname}`, {
      state: { block: blockname },
      replace: true,
    });
    }, 1500);
    
  } catch (error) {
    toast.error("Failed to delete floor.");
    console.error(error);
  }
};


//pause or Resume timetable..
const handlePauseToggle = async (roomName,pauseStatus) => {
    const newState = !pauseStatus;
    try {
      setpauseLoading(true)
      await axios.patch(`http://localhost:5000/periods/pauseActivity/${blockname}/${roomName}`, {
        isPaused: newState,
      });
      
      setTimetables(prev =>
      prev.map(t =>
        t.className === roomName ? { ...t, isPaused: newState } : t
      )
    );
    // console.log(pausingData[roomName])

      setpauseLoading(false)
    } catch (err) {
      console.error("Pause/Resume failed:", err);
    }finally{
      setpauseLoading(false)
    }
  };

    const handleCardClick = (index) => setExpandedRoom(index);
    const closeModal = () => setExpandedRoom(null);
  
  
    const canEdit = (access === "super_admin") || (access !== "student" && dept.toLowerCase() === blockname?.toLowerCase());
  
return (
  <Container fluid className="p-4 fs-6">
    <ToastContainer />
    {/* Delete Modal */}
    <Modal show={showDialog} onHide={() => setShowDialog(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete -{" "}
        {dialogType === "floor"
          ? `Floor: "${floorId?.floor_name || ""}"`
          : `Room: "${selectedRoom?.room_name || ""}"`}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDialog(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirmDelete}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>

    <>
      {/* Header */}
      <div
        className="container-fluid px-0 position-fixed top-0 start-0 w-100 shadow-sm"
        style={{
          zIndex: 1050,
          background: "linear-gradient(90deg, #3767cfff 0%, #2575fc 100%)",
          borderBottom: "3px solid #0047ab",
          color: "white",
        }}
      >
        <div className="container px-3 py-3">
          <Row className="align-items-center justify-content-between">
            {/* Title */}
            <Col xs={12} md="auto" className="mb-2 mb-md-0 text-center text-md-start">
              <h5 className="m-0 fw-bold">
                Rooms in <span className="text-light">{blockname} Block</span>
              </h5>
              {err && <p className="text-warning mt-2">{err}</p>}
            </Col>

            {/* Buttons */}
            <Col xs={12} md="auto" className="text-center text-md-end">
              {access !== "student" && (
                <>
                  <Button
                    variant="light"
                    className="me-2 fw-semibold"
                    onClick={() => navigate(`/${blockname}/showtimetable`)}
                  >
                    Show Timetable
                  </Button>
                </>
              )}
              <Button variant="outline-light" className="fw-semibold" onClick={backtohome}>
                Back to Home
              </Button>
            </Col>
          </Row>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginTop: "100px" }}>
        {floorId && (
          <>
            {/* Search Bar */}
            <Row className="justify-content-center mb-3">
              <Col xs="auto">
                <Form.Control
                  type="text"
                  placeholder="🔍 Search Room"
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  size="lg"
                  className="rounded-pill shadow-sm px-4"
                  style={{ width: "300px" }}
                />
              </Col>
            </Row>

            {/* Header Buttons */}
            <Row className="mb-3 align-items-center">
              <Col>
                <h5 className="fw-bold">🏢 Rooms in Floor: {floorName}</h5>
              </Col>
              <Col xs="auto">
                {canEdit && (
                  <>
                    <Button className="me-2" size="lg" onClick={addRooms}>
                      ➕ Add Room
                    </Button>
                    <Button variant="danger" size="lg" onClick={confirmDeleteFloor}>
                      🗑️ Delete Floor
                    </Button>
                  </>
                )}
                <Button
                  variant="outline-secondary"
                  className="ms-2"
                  size="lg"
                  onClick={backToFloors}
                >
                  🔙 Back to Floors
                </Button>
              </Col>
            </Row>

            {/* Filter */}
            <Row className="mb-3">
              <Col xs="auto">
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  size="lg"
                  className="shadow-sm"
                >
                  <option value="all">All</option>
                  <option value="occupied">Occupied</option>
                  <option value="empty">Empty</option>
                </Form.Select>
              </Col>
            </Row>

            {/* Filtered Rooms */}
            {initialLoading ? (
              <Loader />
            ) : (
              (() => {
                const filteredRooms = roomdata.filter(
                  (room) =>
                    (filterStatus === "all" ||
                      (filterStatus === "occupied" && room.occupied) ||
                      (filterStatus === "empty" && !room.occupied)) &&
                    (filterRoomType === "all" ||
                      room.room_type.toLowerCase().replace(/\s+/g, "") ===
                        filterRoomType.replace(/\s+/g, "")) &&
                    room.room_name.toLowerCase().includes(roomSearch.toLowerCase())
                );

                return filteredRooms.length > 0 ? (
                  <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {filteredRooms.map((room, index) => {
                      const timetable =
                        timetableMap[room.room_name.trim().toLowerCase()] ?? null;
                      const now = new Date();
                      const hour = now.getHours();
                      const minute = now.getMinutes();
                      const periodinfo = timetable
                        ? getCurrentPeriod(timetable, hour, minute)
                        : null;

                      return (
                        <Col key={index}>
                          {/* <Card
                            id={`${room.room_name.replace(/\s+/g, "-")}-${room.room_id}`}
                            className="shadow-sm h-100 border-0"
                            style={{
                              backgroundColor: room.occupied ? "#f8d7da" : "#d4edda",
                              cursor: "pointer",
                            }}
                            onClick={() => handleCardClick(index)}
                          > */}
              <Card
  id={`room-${room.room_id}`}
  className={`shadow-sm h-100 border-0 
    ${highlightedCard === room.room_id ? "border border-primary shadow-lg bg-warning bg-opacity-50" : ""}`}
  style={{
    backgroundColor: room.occupied ? "#f8d7da" : "#d4edda",
    cursor: "pointer",
  }}
  onClick={() => handleCardClick(index)}
>



                            <Card.Body className="d-flex flex-column justify-content-center text-center">
                              <div>
                                <div className="d-flex justify-content-center align-items-center mb-2">
                                  <i
                                    className={`bi ${
                                      room.occupied ? "bi-lock-fill" : "bi-unlock"
                                    }`}
                                    style={{
                                      fontSize: "1.2rem",
                                      color: room.occupied ? "red" : "green",
                                      marginRight: "0.5rem",
                                    }}
                                  ></i>
                                  <strong className="text-truncate" style={{ maxWidth: "150px" }}>
                                    {room.room_name}
                                  </strong>
                                </div>
                                <small className="text-muted text-truncate">
                                  ID: {room.room_id}
                                </small>
                              </div>
                            </Card.Body>
                          </Card>

                          {/* Room Modal */}
                          <Modal show={expandedRoom === index} onHide={closeModal} centered>
                            <Modal.Header closeButton>
                              <Modal.Title>{room.room_name}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              {timetable && typeof pausingData[room.room_name] === "boolean" && (
                                <div className="text-center mb-3">
                                  <Button
                                    size="sm"
                                    variant={
                                      pausingData[room.room_name] ? "success" : "warning"
                                    }
                                    onClick={() =>
                                      handlePauseToggle(
                                        room.room_name,
                                        pausingData[room.room_name]
                                      )
                                    }
                                    disabled={pauseLoading}
                                  >
                                    {pauseLoading ? (
                                      <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                      ></span>
                                    ) : pausingData[room.room_name] ? (
                                      "Resume"
                                    ) : (
                                      "Pause"
                                    )}
                                  </Button>
                                </div>
                              )}

                              {/* Content */}
                              {timetable &&
                              pausingData[room.room_name] === false &&
                              periodinfo?.status !== "NoClass" ? (
                                <p className="text-center">
                                  {periodinfo.status === "Ongoing" ? (
                                    <span className="text-success fw-bold">{periodinfo.info}</span>
                                  ) : (
                                    <span className="text-muted">{periodinfo.status}</span>
                                  )}
                                </p>
                              ) : (
                                <>
                                  <p>
                                    <strong>ID:</strong> {room.room_id}
                                  </p>
                                  <p>
                                    <strong>Type:</strong> {room.room_type}
                                  </p>
                                  <p>
                                    <strong>Capacity:</strong> {room.room_capacity}
                                  </p>
                                  <p>
                                    <strong>Status:</strong>{" "}
                                    {room.occupied ? "Occupied" : "Empty"}
                                  </p>
                                  <p>
                                    <strong>Last Modified:</strong>{" "}
                                    {formatDistanceToNow(new Date(room.lastModifiedDate), {
                                      addSuffix: true,
                                    })}
                                  </p>
                                </>
                              )}

                              {/* File Upload and Buttons */}
                              {canEdit && (
                                <div className="mt-3">
                                  {!timetable && (
                                    <>
                                      <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="form-control mb-2"
                                      />
                                      <Button
                                        size="sm"
                                        variant="success"
                                        onClick={() => handleUpload(room.room_name)}
                                        className="mb-2 w-100"
                                        disabled={uploadLoading}
                                      >
                                        {uploadLoading ? (
                                          <>
                                            <span
                                              className="spinner-border spinner-border-sm"
                                              role="status"
                                              aria-hidden="true"
                                            ></span>
                                            &nbsp;Uploading...
                                          </>
                                        ) : (
                                          "Upload Timetable"
                                        )}
                                      </Button>
                                    </>
                                  )}

                                  {!timetable || pausingData[room.room_name] === true ? (
                                    <div className="d-flex justify-content-between">
                                      <Button
                                        size="sm"
                                        variant="info"
                                        onClick={() => modifyRoom(room)}
                                      >
                                        Modify
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => confirmDeleteRoom(room)}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="d-flex justify-content-between">
                                      <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() =>
                                          deleteTimetableByClass(room.room_name)
                                        }
                                      >
                                        Remove Timetable
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => confirmDeleteRoom(room)}
                                      >
                                        Delete Room
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Modal.Body>
                          </Modal>
                        </Col>
                      );
                    })}
                  </Row>
                ) : (
                  <p className="text-center mt-4 fw-bold">No rooms found.</p>
                );
              })()
            )}
          </>
        )}
      </div>
    </>
  </Container>
);

  // return (

  //   <Container fluid className="p-4 fs-6">
  //         <ToastContainer />
  //         <Modal show={showDialog} onHide={() => setShowDialog(false)}>
  //           <Modal.Header closeButton>
  //             <Modal.Title>Confirm Delete</Modal.Title>
  //           </Modal.Header>
  //           <Modal.Body>
  //             Are you sure you want to delete - {dialogType === "floor" ? `Floor: "${floorId?.floor_name || ''}"` : `Room: "${selectedRoom?.room_name || ''}"`}
  //           </Modal.Body>
  //           <Modal.Footer>
  //             <Button variant="secondary" onClick={() => setShowDialog(false)}>Cancel</Button>
  //             <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
  //           </Modal.Footer>
  //         </Modal>
    
  //   <>

  //     <div
  //       className="container-fluid px-0 position-fixed top-0 start-0 w-100 shadow-sm"
  //       style={{
  //         zIndex: 1050,
  //         background: 'linear-gradient(90deg, #3767cfff 0%, #2575fc 100%)',
  //         borderBottom: '3px solid #0047ab',
  //         color: 'white',
  //       }}
  //     >
  //       <div className="container px-3 py-3">
  //         <Row className="align-items-center justify-content-between">
  //           {/* Title */}
  //           <Col xs={12} md="auto" className="mb-2 mb-md-0 text-center text-md-start">
  //             <h5 className="m-0 fw-bold">
  //               Rooms in  <span className="text-light">{blockname} Block</span>
  //             </h5>
  //             {err && <p className="text-warning mt-2">{err}</p>}
  //           </Col>

  //           {/* Buttons */}
  //           <Col xs={12} md="auto" className="text-center text-md-end">
  //             {(access!="student") &&
  //               <>
  //                 <Button
  //                   variant="light"
  //                   className="me-2 fw-semibold"
  //                   onClick={() => navigate(`/${blockname}/showtimetable`)}
  //                 >
  //                 Show Timetable
  //                 </Button>
  //               </>
  //             }
  //             <Button variant="outline-light" className="fw-semibold" onClick={backtohome}>
  //               Back to Home
  //             </Button>
  //           </Col>
  //         </Row>
  //       </div>
  //     </div>

  //    <div style={{ marginTop: '100px' }}>
  //     {floorId && (
  //       <>
  //         <Row className="justify-content-center mb-3">
  //           <Col xs="auto">
  //             <Form.Control
  //               type="text"
  //               placeholder="🔍 Search Room"
  //               value={roomSearch}
  //               onChange={(e) => setRoomSearch(e.target.value)}
  //               size="lg"
  //               className="rounded-pill shadow-sm px-4"
  //               style={{ width: "300px" }}
  //             />
  //           </Col>
  //         </Row>


  //         <Row className="mb-3 align-items-center">
  //           <Col>
  //             <h5 className="fw-bold">🏢 Rooms in Floor: {floorName}</h5>
  //           </Col>
  //           <Col xs="auto">
  //             {canEdit && (
  //               <>
  //                 <Button className="me-2" size="lg" onClick={addRooms}>➕ Add Room</Button>
  //                 <Button variant="danger" size="lg" onClick={confirmDeleteFloor}>🗑️ Delete Floor</Button>
  //               </>
  //             )}
  //             <Button variant="outline-secondary" className="ms-2" size="lg" onClick={backToFloors}>
  //               🔙 Back to Floors
  //             </Button>
  //           </Col>
  //         </Row>


  //         <Row className="mb-3">
  //           <Col xs="auto">
  //             <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} size="lg" className="shadow-sm">
  //               <option value="all">All</option>
  //               <option value="occupied">Occupied</option>
  //               <option value="empty">Empty</option>
  //             </Form.Select>
  //           </Col>
  //         </Row>


  //         {initialLoading ?(
  //           <Loader />
  //         ):(
  //         roomdata.length > 0 ? (
  //           <Row xs={1} sm={2} md={3} lg={4} className="g-4">
  //             {roomdata
  //               .filter(room =>
  //                 (filterStatus === "all" ||
  //                   (filterStatus === "occupied" && room.occupied) ||
  //                   (filterStatus === "empty" && !room.occupied)) &&
  //                 (filterRoomType === "all" ||
  //                   room.room_type.toLowerCase().replace(/\s+/g, '') ===
  //                   filterRoomType.replace(/\s+/g, '')) &&
  //                 room.room_name.toLowerCase().includes(roomSearch.toLowerCase())
  //               )
  //               .map((room, index) => {
  //                 const timetable = timetableMap[room.room_name.trim().toLowerCase()] ?? null;
  //                 const now = new Date();
  //                 const hour = now.getHours();
  //                 const minute = now.getMinutes();
  //                 const periodinfo = timetable ? getCurrentPeriod(timetable, hour, minute) : null;


  //                 return (
  //                   <Col key={index}>
  //                     <Card
  //                       className="shadow-sm h-100 border-0"
  //                       style={{
  //                         backgroundColor: room.occupied ? "#f8d7da" : "#d4edda",
  //                         cursor: "pointer",
  //                       }}
  //                       onClick={() => handleCardClick(index)}
  //                     >
  //                       <Card.Body className="d-flex flex-column justify-content-center text-center">
  //                         <div>
  //                           <div className="d-flex justify-content-center align-items-center mb-2">
  //                             <i
  //                               className={`bi ${room.occupied ? "bi-lock-fill" : "bi-unlock"}`}
  //                               style={{
  //                                 fontSize: "1.2rem",
  //                                 color: room.occupied ? "red" : "green",
  //                                 marginRight: "0.5rem",
  //                               }}
  //                             ></i>
  //                             <strong className="text-truncate" style={{ maxWidth: "150px" }}>
  //                               {room.room_name}
  //                             </strong>
  //                           </div>
  //                           <small className="text-muted text-truncate">ID: {room.room_id}</small>
  //                         </div>
  //                       </Card.Body>
  //                     </Card>


                      
  //                     <Modal show={expandedRoom === index} onHide={closeModal} centered>
  //                       <Modal.Header closeButton>
  //                         <Modal.Title>{room.room_name}</Modal.Title>
  //                       </Modal.Header>
  //                       <Modal.Body>
  //                         {/* Pause/Resume Button */}
  //                         {timetable && typeof pausingData[room.room_name] === "boolean" && (
  //                           <div className="text-center mb-3">
  //                             <Button
  //                               size="sm"
  //                               variant={pausingData[room.room_name] ? "success" : "warning"}
  //                               onClick={() => handlePauseToggle(room.room_name, pausingData[room.room_name])}
  //                               disabled={pauseLoading}
  //                             >
  //                               {pauseLoading ? (
  //                                 <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
  //                               ) : (
  //                                 pausingData[room.room_name] ? "Resume" : "Pause"
  //                               )}
  //                             </Button>
  //                           </div>
  //                         )}

  //                         {/* Content based on pause status */}
  //                         {timetable && pausingData[room.room_name] === false && periodinfo?.status !== "NoClass" ? (
  //                           <p className="text-center">
  //                             {periodinfo.status === "Ongoing" ? (
  //                               <span className="text-success fw-bold">{periodinfo.info}</span>
  //                             ) : (
  //                               <span className="text-muted">{periodinfo.status}</span>
  //                             )}
  //                           </p>
  //                         ) : (
  //                           <>
  //                             <p><strong>ID:</strong> {room.room_id}</p>
  //                             <p><strong>Type:</strong> {room.room_type}</p>
  //                             <p><strong>Capacity:</strong> {room.room_capacity}</p>
  //                             <p><strong>Status:</strong> {room.occupied ? "Occupied" : "Empty"}</p>
  //                             <p><strong>Last Modified:</strong> {formatDistanceToNow(new Date(room.lastModifiedDate), { addSuffix: true })}</p>
  //                           </>
  //                         )}

  //                         {/* File Upload and Modify/Delete Buttons */}
  //                         {canEdit && (
  //                           <div className="mt-3">
  //                             {(!timetable) && ( 
  //                               <>
  //                                 <input type="file" onChange={handleFileUpload} className="form-control mb-2" />
  //                                 <Button
  //                                   size="sm"
  //                                   variant="success"
  //                                   onClick={() => handleUpload(room.room_name)}
  //                                   className="mb-2 w-100"
  //                                   disabled={uploadLoading}
  //                                 >
  //                                   {uploadLoading ? (
  //                                     <>
  //                                       <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
  //                                       &nbsp;Uploading...
  //                                     </>
  //                                   ) : (
  //                                     "Upload Timetable"
  //                                   )}
  //                                 </Button>
  //                               </>
  //                             )}

  //                             {(!timetable || pausingData[room.room_name] == true)? (
  //                               <div className="d-flex justify-content-between">
  //                                 <Button size="sm" variant="info" onClick={() => modifyRoom(room)}>Modify</Button>
  //                                 <Button size="sm" variant="danger" onClick={() => confirmDeleteRoom(room)}>Delete</Button>
  //                               </div>
  //                             ) : (
  //                               <div className="d-flex justify-content-between">
  //                                 <Button size="sm" variant="danger" onClick={() => deleteTimetableByClass(room.room_name)}>Remove Timetable</Button>
  //                                 <Button size="sm" variant="danger" onClick={() => confirmDeleteRoom(room)}>Delete Room</Button>
  //                               </div>
  //                             )}
  //                           </div>
  //                         )}
  //                       </Modal.Body>
  //                     </Modal>
  //                   </Col>
  //                 );
  //               })}
  //           </Row>
          
  //         ) : (
  //           <p className="text-center mt-4">No rooms found.</p>
  //         )
  //         )}
  //       </>
  //     )}
  //     </div>
  //   </>

  // </Container>
  // )
}

export default Roomspage