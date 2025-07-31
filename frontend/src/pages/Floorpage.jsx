
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
  const [uploadLoading,setuploadLoading] = useState(false)
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
        const response = await axios.get(`https://dr-backend-32ec.onrender.com/block/get-data-name/${blockname}`);
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
      // hour = hour % 12;
      // hour = hour ? hour : 12;
      const periodinfo = getCurrentPeriod(timetable, hour, minute);
      // console.log(periodinfo)
      const shouldBeOccupied = (periodinfo.status === "Ongoing" && periodinfo.faculty!="-");
     
      // const shouldBeOccupied = periodinfo.status === "Ongoing";
      if (room.occupied !== shouldBeOccupied) {
        try {
          await fetch(`https://dr-backend-32ec.onrender.com/block/floors/room/${block._id}/${floorid._id}/${room._id}`, {
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
    const {data} = await axios.get(`https://dr-backend-32ec.onrender.com/periods/blockTimetables/${blockname}`)
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


  if (currentTime > (16 * 60 + 10) || currentTime < (9*60+15) ) return { status: "NoClass" };


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
          const res = await axios.post('https://dr-backend-32ec.onrender.com/periods/upload', formData, {
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




  const handleAddFloor = async (e) => {
    e.preventDefault();
    if (!floorName.trim()) {
      alert("Please enter the floor name");
      return;
    }
    try {
      await axios.post(`https://dr-backend-32ec.onrender.com/block/floor/${block?._id}`, { floor_name: floorName });
      setFloorName("");
      const response = await axios.get(`https://dr-backend-32ec.onrender.com/block/get-data/${block?._id}`);
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
        await axios.delete(`https://dr-backend-32ec.onrender.com/block/${block._id}/floor/${floorid._id}`);
        setFloorid(null);
      } else if (dialogType === "room" && selectedRoom) {
        await axios.delete(`https://dr-backend-32ec.onrender.com/block/${block._id}/floor/${floorid._id}/room/${selectedRoom._id}`);
      }


      const updatedData = await axios.get(`https://dr-backend-32ec.onrender.com/block/get-data/${block._id}`);
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

  const handleFloorClick = (floor) => {
    navigate(`/aitam/${blockname}/${floor._id}/rooms`);
  };


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

      
        <>
              {/* Fixed Top Navbar-like Header */}
              <div
                className="container-fluid px-0 position-fixed top-0 start-0 w-100 shadow-sm"
                style={{
                  zIndex: 1050,
                  background: 'linear-gradient(90deg, #3767cfff 0%, #2575fc 100%)',
                  borderBottom: '3px solid #0047ab',
                  color: 'white',
                }}
              >
                <div className="container px-3 py-3">
                  <Row className="align-items-center justify-content-between">
                    {/* Title */}
                    <Col xs={12} md="auto" className="mb-2 mb-md-0 text-center text-md-start">
                      <h5 className="m-0 fw-bold">
                        Floor Page for Block: <span className="text-light">{block?.block_name}</span>
                      </h5>
                      {err && <p className="text-warning mt-2">{err}</p>}
                    </Col>

                    {/* Buttons */}
                    <Col xs={12} md="auto" className="text-center text-md-end">
                      {(access!="student") &&
                        <>
                          <Button
                            variant="light"
                            className="me-2 fw-semibold"
                            onClick={() => navigate(`/${blockname}/showtimetable`)}
                          >
                          Show Timetable
                          </Button>
                        </>
                      }
                      <Button variant="outline-light" className="fw-semibold" onClick={backtohome}>
                        Back to Home
                      </Button>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* Content Section with top spacing */}
              <div style={{ marginTop: '100px' }}>
                {loading ? (
                  <Loader /> // Show loader when loading is true
                ) : (
                  !floorid && (
                    <>
                      {canEdit && (
                        <Row className="justify-content-center my-4">
                          <Col xs="auto">
                            <Form.Control
                              type="text"
                              placeholder="Enter floor name"
                              value={floorName}
                              onChange={(e) => setFloorName(e.target.value)}
                            />
                          </Col>
                          <Col xs="auto">
                            <Button variant="primary" onClick={handleAddFloor}>
                              Add Floor
                            </Button>
                          </Col>
                        </Row>
                      )}

                      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {block?.floors?.map((floor, index) => (
                <Col key={index}>
                  <Card
                    className="text-center border-0 shadow rounded-4 bg-primary-subtle h-100"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleFloorClick(floor)}
                  >
                    <Card.Body>
                      <Card.Title className="fs-6 text-primary fw-bold">
                        {floor.floor_name}
                      </Card.Title>
                      <Card.Text className="text-muted">
                        {floor.rooms.length} Rooms
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
                    </>
                  )
                )}
              </div>

       </>

    </Container>
  );
};


export default Floorpage;





