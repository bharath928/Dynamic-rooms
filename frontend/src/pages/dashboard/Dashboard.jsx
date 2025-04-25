import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";

const AdminDashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/details");
        setAdmins(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching admins");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const deleteAdmin = async (adminid) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this admin?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/auth/delete/${adminid}`);
      alert("Admin deleted successfully!");
      setAdmins(admins.filter((admin) => admin._id !== adminid));
    } catch (err) {
      alert("Error deleting admin: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">Admin Dashboard</h2>
        <Button variant="outline-secondary" onClick={() => navigate("/")}>← Back to Home</Button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center mt-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : admins.length === 0 ? (
        <Alert variant="info">No admins found.</Alert>
      ) : (
        <div className="p-3 rounded shadow bg-light">
          <Row className="fw-bold bg-primary text-white py-2 rounded mb-2 text-center">
            <Col xs={4} className="fs-5">Admin ID</Col>
            <Col xs={4} className="fs-5">Department</Col>
            <Col xs={4} className="fs-5">Actions</Col>
          </Row>

          {admins.map((admin, index) => (
            <Row
              key={admin._id}
              className={`align-items-center py-3 px-2 text-center ${index % 2 === 0 ? 'bg-white' : 'bg-light'}`}
              style={{ borderBottom: "1px solid #dee2e6" }}
            >
              <Col xs={4}>{admin.userId}</Col>
              <Col xs={4}>{admin.dept}</Col>
              <Col xs={4}>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => deleteAdmin(admin._id)}
              >
                <FaTrash className="me-1" />
                Delete
              </Button>
              </Col>
            </Row>
          ))}
        </div>
      )}
    </Container>
  );
};

export default AdminDashboard;
