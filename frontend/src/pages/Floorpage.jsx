import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { formatDistanceToNow } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  }, [block?._id]);


  const handleAddFloor = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/block/floor/${block._id}`, { floor_name: floorName });
      setFloorName("");
      const response = await axios.get(`http://localhost:5000/block/get-data/${block._id}`);
      setBlock(response.data);
    } catch (error) {
      // setErr(error.message);
      // console.error(error);
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

          {/* Are you sure you want to delete - {dialogType === "floor" ? ` Floor : "${floorid.floor_name}"` : `room : "${selectedRoom?.room_name}"?`} */}
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
            {/* <Col xs="auto">
              <Button variant="primary" size="lg">Search</Button>
            </Col> */}
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
                .map((room, index) => (
                  <Col key={index}>
                    <Card className={`bg-${room.occupied ? "danger-subtle" : "success-subtle"}`} style={{ fontSize: "0.85rem", padding: "0.5rem" }}>
                      <Card.Body>
                        <Card.Title className="fs-6">{room.room_name}</Card.Title>
                        <Card.Text>ID: {room.room_id}</Card.Text>
                        <Card.Text>Type: {room.room_type}</Card.Text>
                        <Card.Text>Capacity: {room.room_capacity}</Card.Text>
                        <Card.Text className="fw-bold">
                          Status: {room.occupied ? "Occupied" : "Empty"}
                        </Card.Text>
                        <Card.Text>
                          Last Modified: {formatDistanceToNow(new Date(room.lastModifiedDate), { addSuffix: true })}
                        </Card.Text>
                      </Card.Body>
                      {canEdit && (
                        <Card.Footer className="d-flex justify-content-between p-1">
                          <Button size="sm" variant="info" onClick={() => modifyRoom(room)}>Modify</Button>
                          <Button size="sm" variant="danger" onClick={() => confirmDeleteRoom(room)}>Delete</Button>
                        </Card.Footer>
                      )}
                    </Card>
                  </Col>
                ))}
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

