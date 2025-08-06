import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Button, Form, Card, Row, Col, Container } from "react-bootstrap";

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
      localStorage.removeItem("block");
      return null;
    }
  });

  const [floorid, setFloorid] = useState(null);
  const [floorName, setFloorName] = useState("");
  const [roomdata, setRoomData] = useState([]);
  const [dept, setdept] = useState("");
  const [err, setErr] = useState("");
  const [access, setaccess] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [loading, setLoading] = useState(false);

  // Notices
  const [notices, setNotices] = useState([]);
    const [blockNotices, setBlockNotices] = useState([]);
const [globalNotices, setGlobalNotices] = useState([]);
  const [newNotice, setNewNotice] = useState("");
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        setLoading(true);
        const decode = jwtDecode(token);
        setaccess(decode.role);
        setdept(decode.dept);
      } catch (error) {
        console.error("Invalid token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    const fetchBlockData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://dr-backend-32ec.onrender.com/block/get-data-name/${blockname}`
        );
        setBlock(response.data);
        localStorage.setItem("block", JSON.stringify(response.data));
      } catch (error) {
        setErr("Failed to fetch updated block data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (blockname) fetchBlockData();
  }, [blockname, roomdata]);

useEffect(() => {
  const fetchNotices = async () => {
    try {
      setLoadingNotices(true);

      const blockPromise = axios
        .get(`http://localhost:5000/noticeBoard/getAllNotice/${blockname}`)
        .then((res) => res.data)
        .catch((err) => {
          if (err.response && err.response.status === 404) return [];
          throw err;
        });

      const globalPromise = axios
        .get("http://localhost:5000/globalNotice/getAll")
        .then((res) => res.data)
        .catch(() => []);

      const [blockRes, globalRes] = await Promise.all([blockPromise, globalPromise]);

      setBlockNotices(blockRes);
      setGlobalNotices(globalRes);
    } catch (err) {
      console.error("Failed to fetch notices:", err);
    } finally {
      setLoadingNotices(false);
    }
  };

  fetchNotices();
}, [blockname,notices]);

const handleDeleteNotice = async (id) => {
  try {
    const confirmed = window.confirm(
      `Are you sure you want to delete this Notice for ${blockname} Block?`
    );
    if (!confirmed) return;

    await axios.patch(
      `http://localhost:5000/noticeBoard/deleteNotice/${blockname}/${id}`
    );

    toast.success("Notice deleted successfully");
    setBlockNotices((prev) => prev.filter((notice) => notice._id !== id));
  } catch (err) {
    toast.error("Failed to delete notice");
    console.error(err);
  }
};

  const handleAddNotice = async () => {
    if (!newNotice.trim()) return toast.error("Notice cannot be empty");

    try {
      await axios.post(
        `http://localhost:5000/noticeBoard/createNotice/${blockname}`,
        {
          message: newNotice,
          postedBy: access,
        }
      );
      setNewNotice("");
      toast.success("Notice added successfully");

      const res = await axios.get(
        `http://localhost:5000/noticeBoard/getAllNotice/${blockname}`
      );
      setNotices(res.data);
    } catch (err) {
      toast.error("Failed to add notice");
      console.error(err);
    }
  };

  const handleAddFloor = async (e) => {
    e.preventDefault();
    if (!floorName.trim()) {
      alert("Please enter the floor name");
      return;
    }
    try {
      await axios.post(
        `https://dr-backend-32ec.onrender.com/block/floor/${block?._id}`,
        { floor_name: floorName }
      );
      setFloorName("");
      const response = await axios.get(
        `https://dr-backend-32ec.onrender.com/block/get-data/${block?._id}`
      );
      setBlock(response.data);
    } catch (error) {
      alert("Failed to add floor");
    }
  };

  const handleConfirmDelete = async () => {
    setShowDialog(false);
    try {
      if (!block || !floorid) return;

      if (dialogType === "floor") {
        await axios.delete(
          `https://dr-backend-32ec.onrender.com/block/${block._id}/floor/${floorid._id}`
        );
        setFloorid(null);
      } else if (dialogType === "room" && selectedRoom) {
        await axios.delete(
          `https://dr-backend-32ec.onrender.com/block/${block._id}/floor/${floorid._id}/room/${selectedRoom._id}`
        );
      }

      const updatedData = await axios.get(
        `https://dr-backend-32ec.onrender.com/block/get-data/${block._id}`
      );
      localStorage.setItem("block", JSON.stringify(updatedData.data));
      setBlock(updatedData.data);
      setRoomData(
        updatedData.data.floors.find((f) => f._id === floorid?._id)?.rooms || []
      );

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

  const backtohome = () => {
    navigate(`/`);
    sessionStorage.removeItem("selectedFloor");
  };

  const canEdit =
    access === "super_admin" ||
    (access !== "student" &&
      dept.toLowerCase() === block?.block_name?.toLowerCase());

  const handleFloorClick = (floor) => {
    navigate(`/aitam/${blockname}/${floor._id}/rooms`);
  };

  return (
  <Container fluid className="p-4 fs-6">
    <ToastContainer />

    {/* Delete Floor/Room Modal */}
    <Modal show={showDialog} onHide={() => setShowDialog(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete -{" "}
        {dialogType === "floor"
          ? `Floor: "${floorid?.floor_name || ""}"`
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

    {/* Notices Modal */}
    <Modal
      show={showNoticeModal}
      onHide={() => setShowNoticeModal(false)}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>📢 Notices for {blockname} Block</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(access === "super_admin" ||
          (access !== "student" &&
            dept?.toLowerCase() === blockname?.toLowerCase())) && (
          <div className="d-flex mb-3">
            <Form.Control
              type="text"
              placeholder="Enter new notice"
              value={newNotice}
              onChange={(e) => setNewNotice(e.target.value)}
              className="me-2"
            />
            <Button variant="success" onClick={handleAddNotice}>
              Add Notice
            </Button>
          </div>
        )}

        {loadingNotices ? (
          <Loader text="Loading Notices..." />
        ) : (
          <>
            {globalNotices.length > 0 && (
              <>
                <h6 className="text-primary">Global Notices</h6>
                <ul className="list-group mb-3">
                  {globalNotices.map((notice) => (
                    <li
                      key={notice._id}
                      className="list-group-item d-flex justify-content-between align-items-start flex-wrap"
                    >
                      <div
                        style={{
                          flex: "1 1 auto",
                          minWidth: 0,
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                          overflowWrap: "break-word",
                        }}
                      >
                        <b>{notice.message}</b>
                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                          {new Date(notice.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {blockNotices.length > 0 && (
              <>
                <h6 className="text-success">Block Notices</h6>
                <ul className="list-group">
                  {blockNotices.map((notice) => (
                    <li
                      key={notice._id}
                      className="list-group-item d-flex justify-content-between align-items-start flex-wrap"
                    >
                      <div
                        style={{
                          flex: "1 1 auto",
                          minWidth: 0,
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                          overflowWrap: "break-word",
                        }}
                      >
                        <b>{notice.message}</b>
                        <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                          {new Date(notice.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {(access === "super_admin" ||
                        (access !== "student" &&
                          dept?.toLowerCase() === blockname?.toLowerCase())) && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="ms-2 mt-2 mt-md-0"
                          onClick={() => handleDeleteNotice(notice._id)}
                        >
                          Delete
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {globalNotices.length === 0 && blockNotices.length === 0 && (
              <p className="text-muted">No notices available.</p>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowNoticeModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Sticky Header */}
    <div
      className="container-fluid px-0 sticky-top shadow-sm"
      style={{
        zIndex: 1050,
        background: "linear-gradient(90deg, #3767cfff 0%, #2575fc 100%)",
        borderBottom: "3px solid #0047ab",
        color: "white",
      }}
    >
      <div className="container px-3 py-3">
        <Row className="align-items-center justify-content-between">
          <Col
            xs={12}
            md="auto"
            className="mb-2 mb-md-0 text-center text-md-start"
          >
            <h5 className="m-0 fw-bold">
              Floors in <span className="text-light">{block?.block_name} Block</span>
            </h5>
            {err && <p className="text-warning mt-2">{err}</p>}
          </Col>

          <Col xs={12} md="auto" className="text-center text-md-end">
            {access !== "student" && (
              <Button
                variant="light"
                className="me-2 fw-semibold"
                onClick={() => navigate(`/${blockname}/showtimetable`)}
              >
                Show Timetable
              </Button>
            )}
            <Button
              variant="outline-light"
              className="fw-semibold me-2"
              onClick={() => setShowNoticeModal(true)}
            >
              Notices
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-bell-fill ms-1"
                viewBox="0 0 16 16"
              >
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901" />
              </svg>
            </Button>
            <Button
              variant="outline-light"
              className="fw-semibold"
              onClick={backtohome}
            >
              Back to Home
            </Button>
          </Col>
        </Row>
      </div>
    </div>

    {/* Content Section (no hardcoded margin) */}
    <div className="mt-4">
      {loading ? (
        <Loader />
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
  </Container>
);

};

export default Floorpage;
