
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { formatDistanceToNow } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import "./FloorPage.css";
import { Modal, Button, Form, Card, Row, Col, Container } from "react-bootstrap";
import * as XLSX from "xlsx";


const Loader = ({ text = "Loading...", centered = true }) => {
  return (
    <div className={`d-flex ${centered ? "justify-content-center" : ""} align-items-center my-3`}>
      <div className="spinner-border text-primary me-2" role="status" />
      <span className="fs-5">{text}</span>
    </div>
  );
};




const Floorpage = () => {
  const navigate = useNavigate();
  const { blockname } = useParams();
  const [block, setBlock] = useState(() => {
  try {
    const savedBlock = localStorage.getItem("block");
    return savedBlock ? JSON.parse(savedBlock) : null;
  } catch (err) {
    console.error("Invalid JSON in localStorage for 'block':", err);
    localStorage.removeItem("block"); // Optional: clear corrupted value
    return null;
  }
});


  // const [block, setBlock] = useState(() => JSON.parse(localStorage.getItem("block")) || null);
  const [floorid, setFloorid] = useState(null);
  const [floorName, setFloorName] = useState("");
  const [roomdata, setRoomData] = useState([]);
  const [roomSearch, setRoomSearch] = useState("");
  const [dept, setdept] = useState("");
  const [err, setErr] = useState("");
  const [access, setaccess] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRoomType, setFilterRoomType] = useState("all");
  const [loading,setLoading] = useState(false)
  const [timetables, setTimetables] = useState([]);
   const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [expandedRoom, setExpandedRoom] = useState(null);


const toggleFlip = (index) => {
  setFlippedCards((prev) => ({
    ...prev,
    [index]: !prev[index],
  }));
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


    const fetchBlockData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:5000/block/get-data-name/${blockname}`);
        setBlock(response.data);
        localStorage.setItem("block", JSON.stringify(response.data));
      } catch (error) {
        setErr("Failed to fetch updated block data");
        console.error(error);
      }finally{
        setLoading(false)
      }
    };


    if (blockname) fetchBlockData();
 
    fetchTimetables()
 
 
    const interval = setInterval(() => {
    if (roomdata.length > 0) fetchTimetables();
  }, 60000);


  return () => clearInterval(interval);


  }, [blockname,roomdata]);


  //make the timetable array into a object of {className,timetableData}
  const timetableMap = React.useMemo(
  () =>
    Object.fromEntries(
      timetables.map(t => [t.className, t.timetableData]) // { "XYZ": […], "2 CSE C": […] }
    ),
  [timetables]
);


  useEffect(()=>{
    const updateOccupancy = async () => {
    for (const room of roomdata) {
      const timetable = timetableMap[room.room_name];
 
      if (!timetable) continue;
      const now = new Date();
      let hour = now.getHours();
      const minute = now.getMinutes();
      hour = hour % 12;
      hour = hour ? hour : 12;
      const periodinfo = getCurrentPeriod(timetable, hour, minute);
      // console.log(periodinfo)
     
      const shouldBeOccupied = periodinfo.status === "Ongoing";
      if (room.occupied !== shouldBeOccupied) {
        try {
          await fetch(`http://localhost:5000/block/floors/room/${block._id}/${floorid._id}/${room._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ occupied: shouldBeOccupied }),
          });
          // console.log(`Updated occupancy for ${room.room_name}`);
        } catch (error) {
          console.error(`Failed to update room ${room.room_name}:`, error);
        }
      }
    }
  };




  updateOccupancy();
  },[timetables])


//Taking the floorDetails from the sessionStorage....


useEffect(() => {
  const savedFloor = sessionStorage.getItem("selectedFloor");


  if (savedFloor) {
    try {
      const parsedFloor = JSON.parse(savedFloor);
      setFloorid(parsedFloor);
      setRoomData(parsedFloor.rooms);
    } catch (error) {
      console.error("Invalid JSON in sessionStorage for 'selectedFloor'", error);
      sessionStorage.removeItem("selectedFloor");
setFloorid(null);
      setRoomData([]);
    }
  }
}, []);








//Update the floorDetails in sessionStorage also....


useEffect(() => {
  if (!floorid) return;


  const updated = { ...floorid, rooms: roomdata };
  sessionStorage.setItem("selectedFloor", JSON.stringify(updated));
}, [roomdata, floorid]);




const fetchTimetables = async()=>{
  try{
    const {data} = await axios.get(`http://localhost:5000/periods/blockTimetables/${blockname}`)
    // console.log(data)
    setTimetables(data)
  }catch(err){
    console.log(err.message)
  }
}




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


  if (currentTime > 16 * 60 + 10) return { status: "No Classes" };


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
    return currentTime >= start && currentTime <= end;
  });




if (currentPeriod) {
  return {
    status: "Ongoing",
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


  const handleUpload = async (room) => {
    // console.log("name");
    if (!selectedFile || !room) {
      toast.warn("Please provide class name and upload a file.");
      return;
    }
   
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('className', room);
    formData.append('blockName', blockname);


    try {
      const res = await axios.post('http://localhost:5000/periods/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });


      const data = await res.data;


      fetchTimetables();//update the timetables after uploading new timetable...


      alert(data.message);


    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Upload failed!");
    }
  };
 


  const deleteTimetableByClass = async (className) => {
  const confirmed = window.confirm(`Are you sure you want to delete the timetable for ${className}?`);
  if (!confirmed) return;


  try {
    await axios.patch(`http://localhost:5000/periods/delete/${blockname}/${className}`);
    alert("Timetable deleted successfully!");
    fetchTimetables()
  } catch (err) {
    console.error("Failed to delete timetable:", err);
    alert("Error deleting timetable");
  }
};




  const handleAddFloor = async (e) => {
    e.preventDefault();
    if (!floorName.trim()) {
      alert("Please enter the floor name");
      return;
    }
    try {
      await axios.post(`http://localhost:5000/block/floor/${block?._id}`, { floor_name: floorName });
      setFloorName("");
      const response = await axios.get(`http://localhost:5000/block/get-data/${block?._id}`);
      setBlock(response.data);
    } catch (error) {
      alert("Failed to add floor");
    }
  };


  const confirmDeleteFloor = () => {
    setDialogType("floor");
    sessionStorage.removeItem("selectedFloor")
    setShowDialog(true);
  };


  const confirmDeleteRoom = (room) => {
    setSelectedRoom(room);
    setDialogType("room");
    setShowDialog(true);
  };


  const handleConfirmDelete = async () => {
    setShowDialog(false);
    try {
      if (!block || !floorid) return;


      if (dialogType === "floor") {
        await axios.delete(`http://localhost:5000/block/${block._id}/floor/${floorid._id}`);
        setFloorid(null);
      } else if (dialogType === "room" && selectedRoom) {
        await axios.delete(`http://localhost:5000/block/${block._id}/floor/${floorid._id}/room/${selectedRoom._id}`);
      }


      const updatedData = await axios.get(`http://localhost:5000/block/get-data/${block._id}`);
      localStorage.setItem("block", JSON.stringify(updatedData.data));
      setBlock(updatedData.data);
      setRoomData(updatedData.data.floors.find((f) => f._id === floorid?._id)?.rooms || []);


      toast.success(dialogType === "floor" ? "Floor deleted" : `Room '${selectedRoom.room_name}' deleted`);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };


  const displayRoom = (floor) => {
    sessionStorage.setItem("selectedFloor", JSON.stringify(floor));
    setRoomData(floor.rooms);
    setFloorid(floor);    
  };


  const backToFloors = () => {
    sessionStorage.removeItem("selectedFloor");
    setFloorid(null);
    setRoomData([]);
    setRoomSearch("");


  };


  const addRooms = () => {
    if (block)
      navigate(`/aitam/${block.block_name}/${floorid.floor_name}`, {
        state: { floor: floorid, Block: block },
      });
  };


  const modifyRoom = (room) => {
    toast.info(`Redirecting to modify room: ${room.room_name}`);
    navigate(`/aitam/${block.block_name}/${floorid.floor_name}/modify/${room.room_name}`, {
      state: { Block: block, floor: floorid, Room: room },
    });
  };


  const backtohome = () => {
    navigate(`/`)
    sessionStorage.removeItem("selectedFloor")
  };


  const handleCardClick = (index) => setExpandedRoom(index);
  const closeModal = () => setExpandedRoom(null);


  const canEdit = (access === "super_admin") || (access !== "student" && dept.toLowerCase() === block?.block_name?.toLowerCase());


  return (
    <Container fluid className="p-4 fs-6">
      <ToastContainer />
      <Modal show={showDialog} onHide={() => setShowDialog(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete - {dialogType === "floor" ? `Floor: "${floorid?.floor_name || ''}"` : `Room: "${selectedRoom?.room_name || ''}"`}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>


      {/* <Card className="mb-4 bg-light shadow-lg" style={{ fontSize: "1.2rem" }}>
        <Card.Body>
          <Card.Title className="text-center text-primary fw-bold fs-4">
            Floor Page for Block: <span style={{ color: "#333" }}>{block?.block_name}</span>
          </Card.Title>
          {err && <p className="text-danger text-center">{err}</p>}
        </Card.Body>
      </Card>


      <Row className="justify-content-end mb-3">
        <Col xs="auto">
          <Button variant="success" onClick={()=>{navigate(`/${blockname}/showtimetable`)}} size="lg">show Timetable</Button>
        </Col>
        <Col xs="auto">
          <Button variant="danger" onClick={backtohome} size="lg">Back to Home</Button>
        </Col>
      </Row>


      {loading ? (<Loader/>) :
          (!floorid && (
            <>
              {canEdit && (
                <Row className="justify-content-center mb-4">
                  <Col xs="auto">
                    <Form.Control
                      type="text"
                      placeholder="Enter floor name"
                      value={floorName}
                      onChange={(e) => setFloorName(e.target.value)}
                    />
                  </Col>
                  <Col xs="auto">
                    <Button variant="primary" onClick={handleAddFloor}>Add Floor</Button>
                  </Col>
                </Row>
              )}

              <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {block?.floors?.map((floor, index) => (
                  <Col key={index}>
                    <Card
                      className="text-center border-0 shadow rounded-4 bg-primary-subtle h-100"
                      style={{ cursor: "pointer" }}
                      onClick={() => displayRoom(floor)}
                    >
                      <Card.Body>
                        <Card.Title className="fs-6 text-primary fw-bold">{floor.floor_name}</Card.Title>
                        <Card.Text className="text-muted">{floor.rooms.length} Rooms</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
        ))
      } */}

    <Card className="mb-4 border-0 bg-white shadow-sm rounded-4 p-3">
        <Card.Body>
          <Card.Title className="text-center text-primary fw-bold fs-4">
            Floor Page for Block: <span className="text-dark">{block?.block_name}</span>
          </Card.Title>
          {err && <p className="text-danger text-center">{err}</p>}

          <Row className="justify-content-end mb-3">
            <Col xs="auto">
              <Button variant="success" onClick={() => navigate(`/${blockname}/showtimetable`)}>
                Show Timetable
              </Button>
            </Col>
            <Col xs="auto">
              <Button variant="outline-danger" onClick={backtohome}>Back to Home</Button>
            </Col>
          </Row>

          {loading ? <Loader/>:
            (
              <>
                {!floorid && (
                <>
                  {canEdit && (
                    <Row className="justify-content-center mb-4">
                      <Col xs="auto">
                        <Form.Control
                          type="text"
                          placeholder="Enter floor name"
                          value={floorName}
                          onChange={(e) => setFloorName(e.target.value)}
                        />
                      </Col>
                      <Col xs="auto">
                        <Button variant="primary" onClick={handleAddFloor}>Add Floor</Button>
                      </Col>
                    </Row>
                  )}

                  <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {block?.floors?.map((floor, index) => (
                      <Col key={index}>
                        <Card
                          className="text-center border-0 shadow rounded-4 bg-primary-subtle h-100"
                          style={{ cursor: "pointer" }}
                          onClick={() => displayRoom(floor)}
                        >
                          <Card.Body>
                            <Card.Title className="fs-6 text-primary fw-bold">{floor.floor_name}</Card.Title>
                            <Card.Text className="text-muted">{floor.rooms.length} Rooms</Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </>
                )}
              </>
            )
          }
        </Card.Body>
      </Card>



      {floorid && (
        <>
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


          <Row className="mb-3 align-items-center">
            <Col>
              <h5 className="fw-bold">🏢 Rooms in Floor: {floorid.floor_name}</h5>
            </Col>
            <Col xs="auto">
              {canEdit && (
                <>
                  <Button className="me-2" size="lg" onClick={addRooms}>➕ Add Room</Button>
                  <Button variant="danger" size="lg" onClick={confirmDeleteFloor}>🗑️ Delete Floor</Button>
                </>
              )}
              <Button variant="outline-secondary" className="ms-2" size="lg" onClick={backToFloors}>
                🔙 Back to Floors
              </Button>
            </Col>
          </Row>


          <Row className="mb-3">
            <Col xs="auto">
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} size="lg" className="shadow-sm">
                <option value="all">All</option>
                <option value="occupied">Occupied</option>
                <option value="empty">Empty</option>
              </Form.Select>
            </Col>
          </Row>


          {roomdata.length > 0 ? (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {roomdata
                .filter(room =>
                  (filterStatus === "all" ||
                    (filterStatus === "occupied" && room.occupied) ||
                    (filterStatus === "empty" && !room.occupied)) &&
                  (filterRoomType === "all" ||
                    room.room_type.toLowerCase().replace(/\s+/g, '') ===
                    filterRoomType.replace(/\s+/g, '')) &&
                  room.room_name.toLowerCase().includes(roomSearch.toLowerCase())
                )
                .map((room, index) => {
                  const timetable = timetableMap[room.room_name] ?? null;
                  const now = new Date();
                  const hour = now.getHours();
                  const minute = now.getMinutes();
                  const periodinfo = timetable ? getCurrentPeriod(timetable, hour, minute) : null;


                  return (
                    <Col key={index}>
                      <Card
                        className="shadow-sm h-100 border-0"
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
                                className={`bi ${room.occupied ? "bi-lock-fill" : "bi-unlock"}`}
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
                            <small className="text-muted text-truncate">ID: {room.room_id}</small>
                          </div>
                        </Card.Body>
                      </Card>


                      {/* Modal for room details */}
                      <Modal show={expandedRoom === index} onHide={closeModal} centered>
                        <Modal.Header closeButton>
                          <Modal.Title>{room.room_name}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          {timetable ? (
                            <p className="text-center">
                              {periodinfo.status === "Ongoing" ? (
                                <span className="text-success fw-bold">{periodinfo.info}</span>
                              ) : (
                                <span className="text-muted">{periodinfo.status}</span>
                              )}
                            </p>
                          ) : (
                            <>
                              <p><strong>ID:</strong> {room.room_id}</p>
                              <p><strong>Type:</strong> {room.room_type}</p>
                              <p><strong>Capacity:</strong> {room.room_capacity}</p>
                              <p><strong>Status:</strong> {room.occupied ? "Occupied" : "Empty"}</p>
                              <p><strong>Last Modified:</strong> {formatDistanceToNow(new Date(room.lastModifiedDate), { addSuffix: true })}</p>
                            </>
                          )}


                          {canEdit && (
                            <div className="mt-3">
                              {!timetable && (
                                <>
                                  <input type="file" onChange={handleFileUpload} className="form-control mb-2" />
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleUpload(room.room_name)}
                                    className="mb-2 w-100"
                                  >
                                    Upload Timetable
                                  </Button>
                                </>
                              )}


                              {!timetable ? (
                                <div className="d-flex justify-content-between">
                                  <Button size="sm" variant="info" onClick={() => modifyRoom(room)}>Modify</Button>
                                  <Button size="sm" variant="danger" onClick={() => confirmDeleteRoom(room)}>Delete</Button>
                                </div>
                              ) : (
                                <div className="d-flex justify-content-between">
                                  <Button size="sm" variant="danger" onClick={() => deleteTimetableByClass(room.room_name)}>Remove Timetable</Button>
                                  <Button size="sm" variant="danger" onClick={() => confirmDeleteRoom(room)}>Delete Room</Button>
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
            <p className="text-center mt-4">No rooms found.</p>
          )}
        </>
      )}


     
      {/* `{floorid && (
        <>
          <Row className="justify-content-center mb-3">
            <Col xs="auto">
              <Form.Control
                type="text"
                placeholder="🔍 Search Room"
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                size="lg"
                className="rounded-pill px-4 shadow-sm"
                style={{ width: "300px" }}
              />
            </Col>
          </Row>


          <Row className="mb-3 align-items-center">
            <Col>
              <h5 className="fw-bold">🏢 Rooms in Floor: {floorid.floor_name}</h5>
            </Col>
            <Col xs="auto">
              {canEdit && (
                <>
                  <Button
                    variant="primary"
                    className="me-2 shadow-sm"
                    size="lg"
                    onClick={addRooms}
                  >
                    ➕ Add Room
                  </Button>
                  <Button
                    variant="danger"
                    className="shadow-sm"
                    size="lg"
                    onClick={confirmDeleteFloor}
                  >
                    🗑️ Delete Floor
                  </Button>
                </>
              )}
              <Button
                variant="outline-secondary"
                className="ms-2 shadow-sm"
                size="lg"
                onClick={backToFloors}
              >
                🔙 Back to Floors
              </Button>
            </Col>
          </Row>


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


          {roomdata.length > 0 ? (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {roomdata
                .filter(room =>
                  (filterStatus === "all" ||
                    (filterStatus === "occupied" && room.occupied) ||
                    (filterStatus === "empty" && !room.occupied)) &&
                  (filterRoomType === "all" ||
                    room.room_type.toLowerCase().replace(/\s+/g, '') ===
                    filterRoomType.replace(/\s+/g, '')) &&
                  room.room_name.toLowerCase().includes(roomSearch.toLowerCase())
                )
                .map((room, index) => {
                  const timetable = timetableMap[room.room_name] ?? null;
                  let periodinfo = null;


                  if (timetable) {
                    const now = new Date();
                    const hour = now.getHours();
                    const minute = now.getMinutes();
                    periodinfo = getCurrentPeriod(timetable, hour, minute);
                  }


                  const isExpanded = expandedRoom === index;
                  const cardOpacity = expandedRoom !== null && expandedRoom !== index ? 0.4 : 1;


                  return (
                    <Col key={index}>
                      <Card
                        className="shadow-sm border-0 rounded"
                        style={{
                          backgroundColor: room.occupied ? "#f8d7da" : "#d4edda",
                          opacity: cardOpacity,
                          transition: "all 0.3s ease-in-out",
                          cursor: "pointer",
                          padding: "0.75rem",
                        }}
                        onClick={() => setExpandedRoom(isExpanded ? null : index)}
                      >
                        <Card.Body className="p-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold mb-1">{room.room_name}</h6>
                            <i
                              className={`bi ${room.occupied ? "bi-lock-fill" : "bi-unlock"}`}
                              style={{
                                fontSize: "1.2rem",
                                color: room.occupied ? "red" : "green",
                              }}
                            ></i>
                          </div>
                          <small className="text-muted">ID: {room.room_id}</small>


                          {isExpanded && (
                            <div className="mt-2" style={{ fontSize: "0.85rem" }}>
                              {timetable ? (
                                <>
                                  {periodinfo.status === "Ongoing" ? (
                                    <Card.Text className="text-success text-center fw-semibold">
                                      {periodinfo.info}
                                    </Card.Text>
                                  ) : (
                                    <Card.Text className="text-muted text-center">
                                      {periodinfo.status}
                                    </Card.Text>
                                  )}
                                </>
                              ) : (
                                <>
                                  <Card.Text><strong>Type:</strong> {room.room_type}</Card.Text>
                                  <Card.Text><strong>Capacity:</strong> {room.room_capacity}</Card.Text>
                                  <Card.Text><strong>Status:</strong> {room.occupied ? "Occupied" : "Empty"}</Card.Text>
                                  <Card.Text>
                                    <strong>Last Modified:</strong>{" "}
                                    {formatDistanceToNow(new Date(room.lastModifiedDate), { addSuffix: true })}
                                  </Card.Text>
                                </>
                              )}


                              {canEdit && (
                                <div className="mt-2">
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
                                      >
                                        Upload
                                      </Button>
                                    </>
                                  )}


                                  <Card.Footer className="d-flex justify-content-between p-1 bg-transparent border-0">
                                    {!timetable ? (
                                      <>
                                        <Button size="sm" variant="info" onClick={() => modifyRoom(room)}>
                                          Modify
                                        </Button>
                                        <Button size="sm" variant="danger" onClick={() => confirmDeleteRoom(room)}>
                                          Delete
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button size="sm" variant="danger" onClick={() => deleteTimetableByClass(room.room_name)}>
                                          Remove Timetable
                                        </Button>
                                        <Button size="sm" variant="danger" onClick={() => confirmDeleteRoom(room)}>
                                          Delete Room
                                        </Button>
                                      </>
                                    )}
                                  </Card.Footer>
                                </div>
                              )}
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
            </Row>
          ) : (
            <p className="text-center mt-4">No rooms found.</p>
          )}
        </>
      )}` */}
    </Container>
  );
};


export default Floorpage;





