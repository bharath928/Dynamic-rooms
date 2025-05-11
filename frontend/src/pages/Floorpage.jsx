import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { formatDistanceToNow } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx"; 
import { Modal, Button, Form, Card, Row, Col, Container } from "react-bootstrap";


const Floorpage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();


  const [block, setBlock] = useState(() => state?.block || JSON.parse(localStorage.getItem("block")) || null);
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
  const [timetables, setTimetables] = useState({});
  const [periodInfo, setPeriodInfo] = useState(null);


  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);



  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const decode = jwtDecode(token);
    setaccess(decode.role);
    setdept(decode.dept);


    const fetchBlockData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/block/get-data/${block._id}`);
        setBlock(response.data);
        localStorage.setItem("block", JSON.stringify(response.data));
      } catch (error) {
        setErr("Failed to fetch updated block data");
        console.error(error);
      }
    };
    if (block) fetchBlockData();

    if (roomdata.length > 0) fetchTimetables();
  
       const interval = setInterval(() => {
    fetchTimetables();
  }, 10000); 

  return () => clearInterval(interval);
   
  }, [block?._id,roomdata]);

  const fetchTimetables = async () => {
      const results = {};
  
      for (const room of roomdata) {
        try {
          const res = await fetch(`http://localhost:5000/periods/${room.room_name}`);
          if (res.ok) {
            const data = await res.json();
            results[room.room_name] = data.timetableData;
          }
        } catch (err) {
          console.error(`Failed to fetch timetable for ${room.room_name}`);
        }
      }
  
      setTimetables(results);


    };

  const handleFileUpload = (e) => {
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
  };
const getCurrentPeriod = (timetable, testHour = null, testMin = null) => {
  if (!timetable || !Array.isArray(timetable)) {
    return { status: "Invalid timetable" }; 
  }

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

  const todayData = timetable.find(day => day.dayName === today);
  if (!todayData || !todayData.periods?.length) return { status: "No Classes" };

  const currentPeriod = todayData.periods.find(period => {
    const [startH, startM] = period.startTime.trim().split(":").map(Number);
    const [endH, endM] = period.endTime.trim().split(":").map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
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
};
  const handleUpload = async (room) => {

    if (!selectedFile || !room) {
      alert("Please provide class name and upload a file.");
      return;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('className', room);

    try {
      const res = await fetch('http://localhost:5000/periods/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      alert(data.message);

    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    }
  };

  const deleteTimetableByClass = async (className) => {
  const confirmed = window.confirm(`Are you sure you want to delete the timetable for ${className}?`);
  if (!confirmed) return;

  try {
    await axios.delete(`http://localhost:5000/periods/class/${className}`);
    alert("Timetable deleted successfully!");
    fetchTimetables()
  } catch (err) {
    console.error("Failed to delete timetable:", err);
    alert("Error deleting timetable");
  }
};

  

  const handleAddFloor = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/block/floor/${block._id}`, { floor_name: floorName });
      setFloorName("");
      const response = await axios.get(`http://localhost:5000/block/get-data/${block._id}`);
      setBlock(response.data);
    } catch (error) {
      alert("please... enter the floor name")
    }
  };


  const confirmDeleteFloor = () => {
    setDialogType("floor");
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
      if (dialogType === "floor") {
        await axios.delete(`http://localhost:5000/block/${block._id}/floor/${floorid._id}`);
        setFloorid(null);
      } else if (dialogType === "room") {
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
    setRoomData(floor.rooms);
    setFloorid(floor);
  };


  const backToFloors = () => {
    setFloorid(null);
    setRoomData([]);
    setRoomSearch("");
  };


  const addRooms = () => {
    navigate(`/aitam/${block.block_name}/${floorid.floor_name}`, { state: { floor: floorid, Block: block } });
  };


  const modifyRoom = (room) => {
    toast.info(`Redirecting to modify room: ${room.room_name}`);
    navigate(`/aitam/${block.block_name}/${floorid.floor_name}/modify/${room.room_name}`, {
      state: { Block: block, floor: floorid, Room: room },
    });
  };


  const backtohome = () => navigate(`/`);


  const canEdit = (access === "super_admin") || (access !== "student" && dept.toLowerCase() === block.block_name.toLowerCase());


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
          <Button variant="danger" onClick={backtohome} size="lg">Back</Button>
        </Col>
      </Row>


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
      )}


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
            <Col xs="auto">
              <Form.Select value={filterRoomType} onChange={(e) => setFilterRoomType(e.target.value)} size="lg">
                <option value="all">All</option>
                <option value="classroom">Classroom</option>
                <option value="lab">Lab</option>
                <option value="seminarhall">Seminar Hall</option>
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
        const timetable = timetables[room.room_name];
       
        const now = new Date();
let hour = now.getHours();
const minute = now.getMinutes();
hour = hour % 12;
hour = hour ? hour : 12; 
const periodinfo = getCurrentPeriod(timetable, hour, minute);

        return (
          <Col key={index}>
           

            <Card className="bg-light" style={{ fontSize: "0.85rem", padding: "0.5rem" }}>
              <Card.Body>
                <Card.Title >{room.room_name}</Card.Title>
                
                {timetable ? (
                  <>
                     {periodinfo.status === "Ongoing" ? (
                        <div>{periodinfo.info}</div>
                      ) : (
                        <p>{ periodinfo.status}</p>
                      )}



{canEdit && (
                <Card.Footer className="d-flex justify-content-between p-1">
                  <Button variant="danger" onClick={() => deleteTimetableByClass(room.room_name)}>
  remove Timetable
</Button>
 
                  <Button size="sm" variant="danger" onClick={() => confirmDeleteRoom(room)}>Delete Room</Button>
                </Card.Footer>
              )}
                  
                  </>
                ) : (
                  <>
                    <Card.Text>ID: {room.room_id}</Card.Text>
                    <Card.Text>Type: {room.room_type}</Card.Text>
                    <Card.Text>Capacity: {room.room_capacity}</Card.Text>
                    <Card.Text className="fw-bold">
                      Status: {room.occupied ? "Occupied" : "Empty"}
                    </Card.Text>

                    <Card.Text>
                      Last Modified: {formatDistanceToNow(new Date(room.lastModifiedDate), { addSuffix: true })}
                    </Card.Text>
                   
                   

                    {canEdit && (
                       <>
                       <input type="file" onChange={handleFileUpload} />
                       <button onClick={() => handleUpload(room.room_name)}>Upload</button>
                       <Card.Footer className="d-flex justify-content-between p-1">
                         <Button size="sm" variant="info" onClick={() => modifyRoom(room)}>Modify</Button>
                         <Button size="sm" variant="danger" onClick={() => confirmDeleteRoom(room)}>Delete</Button>
                       </Card.Footer>
                     </>
              )}

                  </>
                )}
              </Card.Body>
              
            </Card>
          </Col>
        );
      })}
  </Row>
) : (
  <p className="text-center mt-4">No rooms available.</p>
)}


        </>
      )}
    </Container>
  );
};

export default Floorpage;

