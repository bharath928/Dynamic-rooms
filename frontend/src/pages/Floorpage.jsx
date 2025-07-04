import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { formatDistanceToNow } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

// useEffect(() => {
//   const savedFloor = sessionStorage.getItem("selectedFloor");

//   if (savedFloor) {
//     try {
//       const parsedFloor = JSON.parse(savedFloor);

//       // ✅ Find the latest matching floor in the updated block data
//       const updatedFloor = block?.floors?.find(
//         (floor) => floor.floor_name === parsedFloor.floor_name
//       );

//       if (updatedFloor) {
//         // ✅ Update sessionStorage and state with fresh data
//         const updatedSelectedFloor = {
//           ...updatedFloor,
//           rooms: updatedFloor.rooms, // Or get fresh room data separately if needed
//         };

//         sessionStorage.setItem("selectedFloor", JSON.stringify(updatedSelectedFloor));
//         // window.location.reload();
//         setFloorid(updatedSelectedFloor);
//         setRoomData(updatedSelectedFloor.rooms);
//       } else {
//         // Fallback to old parsedFloor if no matching floor in block data
//         setFloorid(parsedFloor);
//         setRoomData(parsedFloor.rooms);
//       }
//     } catch (error) {
//       console.error("Invalid JSON in sessionStorage for 'selectedFloor'", error);
//       sessionStorage.removeItem("selectedFloor");
//       setFloorid(null);
//       setRoomData([]);
//     }
//   }
// }, []);


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
      const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      setPreviewData(parsedData);
    };
  }

// const getCurrentPeriod = (timetable, testHour = null, testMin = null) => {
//   try{
//     if (!timetable || !Array.isArray(timetable)) {
//     return { status: "Invalid timetable" }; 
//   }
//   const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//   const now = new Date();

//   if (testHour !== null && testMin !== null) {
//     now.setHours(testHour);
//     now.setMinutes(testMin);
//   }

//   const today = days[now.getDay()];
//   if (today === "Sunday") return { status: "Sunday is Holiday" };

//   const currentHour = now.getHours();
//   const currentMin = now.getMinutes();
//   const currentTime = currentHour * 60 + currentMin;
//   if (currentTime > 16 * 60 + 20) return { status: "No Classes" };
//   const todayData = timetable.find(day => day.dayName === today);
//   if (!todayData || !todayData.periods?.length) return { status: "No Classes" };
//   const parseTime = (timeStr) => {
//   const [time, modifier] = timeStr.trim().split(" ");
//   let [hours, minutes] = time.split(":").map(Number);

//   if (modifier === "PM" && hours !== 12) hours += 12;
//   if (modifier === "AM" && hours === 12) hours = 0;

//   return hours * 60 + minutes;
// };

//   const currentPeriod = todayData.periods.find(period => {
//     const start = parseTime(period.startTime);
//     const end = parseTime(period.endTime);
//     return currentTime >= start && currentTime <= end;
//   });


//   if (currentPeriod) {
//     return {
//       status: "Ongoing",
//       info: (
//         <>
//           <div><strong>Period:</strong> {currentPeriod.periodNumber}</div>
//           <div><strong>Faculty:</strong> {currentPeriod.faculty}</div>
//           <div><strong>Time:</strong> {currentPeriod.startTime} - {currentPeriod.endTime}</div>
//           <div><strong>Subject:</strong> {currentPeriod.subject}</div>
//         </>
//       )
//     };
//   }
  

//   return { status: "Free Period" };

//   }catch(e){
//     console.error(e.message)
//   }finally{
//     // setLoading(false);
//   }
// };


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
        <>
          <div><strong>Period:</strong> {currentPeriod.periodNumber}</div>
          <div><strong>Faculty:</strong> {currentPeriod.faculty}</div>
          <div><strong>Time:</strong> {currentPeriod.startTime} - {currentPeriod.endTime}</div>
          <div><strong>Subject:</strong> {currentPeriod.subject}</div>
        </>
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

      <Card className="mb-4 bg-light shadow-lg" style={{ fontSize: "1.2rem" }}>
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
                      size="lg"
                    />
                  </Col>
                  <Col xs="auto">
                    <Button variant="primary" onClick={handleAddFloor} size="lg">Add Floor</Button>
                  </Col>
                </Row>
              )}
    
              <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {block?.floors?.map((floor, index) => (
                  <Col key={index}>
                    <Card
                      className="text-center bg-info-subtle shadow-lg"
                      style={{ cursor: "pointer", fontSize: "0.9rem", padding: "0.5rem" }}
                      onClick={() => displayRoom(floor)}
                    >
                      <Card.Body>
                        <Card.Title className="fs-6">{floor.floor_name}</Card.Title>
                        <Card.Text className="fs-6">{floor.rooms.length} Rooms</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          ))}

      {floorid && (
        <>
                <Row className="justify-content-center mb-3">
                  <Col xs="auto">
                    <Form.Control
                      type="text"
                      placeholder="Search Room"
                      value={roomSearch}
                      onChange={(e) => setRoomSearch(e.target.value)}
                      size="lg"
                      style={{ width: "300px" }}
                    />
                  </Col>
                </Row>

                <Row className="mb-3 align-items-center">
                  <Col>
                    <h5 className="fw-bold">Rooms in Floor: {floorid.floor_name}</h5>
                  </Col>
                  <Col xs="auto">
                    {canEdit && (
                      <>
                        <Button variant="primary" className="me-2" size="lg" onClick={addRooms}>Add Room</Button>
                        <Button variant="danger" size="lg" onClick={confirmDeleteFloor}>Delete Floor</Button>
                      </>
                    )}
                    <Button variant="outline-secondary" className="ms-2" size="lg" onClick={backToFloors}>Back to Floors</Button>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col xs="auto">
                    <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} size="lg">
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
              (filterRoomType === "all" || room.room_type.toLowerCase().replace(/\s+/g, '') === filterRoomType.replace(/\s+/g, '')) &&
              room.room_name.toLowerCase().includes(roomSearch.toLowerCase())
            )
            .map((room, index) => {
              const timetable = timetableMap[room.room_name] ?? null;
              let periodinfo = null;
              if(timetable) //  runs only when a timetable exists
              {
                const now = new Date();
                let hour = now.getHours();
                const minute = now.getMinutes();
                // hour = hour % 12;
                // hour = hour ? hour : 12;
                periodinfo = getCurrentPeriod(timetable, hour, minute);
              }

              const cardColor = room.occupied ? "#f8d7da" : "#d4edda"; 

              return (
                <Col key={index}>
                  <Card
                    className="h-100 shadow-sm border-0"
                    style={{ backgroundColor: cardColor, fontSize: "0.85rem", padding: "0.5rem", minHeight: "280px" }}
                  >
                    <Card.Body className="d-flex flex-column justify-content-between">
                      <div>
                        <Card.Title className="fw-bold text-center text-dark mb-3">{room.room_name}</Card.Title>

                        {timetable ? (
                          <>
                            {periodinfo.status === "Ongoing" ? (
                              <Card.Text className="text-success text-center fw-semibold">{periodinfo.info}</Card.Text>
                            ) : (
                              <Card.Text className="text-muted text-center">{periodinfo.status}</Card.Text>
                            )}
                          </>
                        ) : (
                          <>
                            <Card.Text><strong>ID:</strong> {room.room_id}</Card.Text>
                            <Card.Text><strong>Type:</strong> {room.room_type}</Card.Text>
                            <Card.Text><strong>Capacity:</strong> {room.room_capacity}</Card.Text>
                            <Card.Text><strong>Status:</strong> {room.occupied ? "Occupied" : "Empty"}</Card.Text>
                            <Card.Text>
                              <strong>Last Modified:</strong>{" "}
                              {formatDistanceToNow(new Date(room.lastModifiedDate), { addSuffix: true })}
                            </Card.Text>
                          </>
                        )}
                      </div>

                      {canEdit && (
                        <div className="mt-2">
                          {!timetable && (
                            <>
                              <input type="file" onChange={handleFileUpload} className="form-control mb-2" />
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
          
        )}
  </Container>
  );
};

export default Floorpage;
