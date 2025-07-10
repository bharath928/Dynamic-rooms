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
  {/* Header */}
  <div className="d-flex justify-content-between align-items-center mb-4">
    <h2 className="fw-bold text-primary">Admin Dashboard</h2>
    <Button variant="outline-primary" onClick={() => navigate("/")}>
      ← Back to Home
    </Button>
  </div>

  {/* Loading / Error / No Admins */}
  {loading ? (
    <div className="d-flex justify-content-center mt-5">
      <Spinner animation="border" variant="primary" />
    </div>
  ) : error ? (
    <Alert variant="danger">{error}</Alert>
  ) : admins.length === 0 ? (
    <Alert variant="info">No admins found.</Alert>
  ) : (
    // Admin List Card
    <div className="p-4 rounded-4 shadow-sm bg-white">
      {/* Header Row */}
      <Row className="fw-semibold bg-primary text-white py-3 rounded-3 mb-3 text-center">
        <Col xs={4} className="fs-6">Admin ID</Col>
        <Col xs={4} className="fs-6">Department</Col>
        <Col xs={4} className="fs-6">Actions</Col>
      </Row>

      {/* Admin Rows */}
      {admins.map((admin, index) => (
        <Row
          key={admin._id}
          className={`align-items-center text-center py-3 px-2 rounded-3 mb-2 ${
            index % 2 === 0 ? "bg-light" : "bg-body"
          }`}
          style={{
            border: "1px solid #dee2e6",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Col xs={4} className="text-dark">{admin.userId}</Col>
          <Col xs={4} className="text-muted">{admin.dept}</Col>
          <Col xs={4}>
            <Button
              variant="outline-danger"
              size="sm"
              className="px-3"
              onClick={() => deleteAdmin(admin._id)}
            >
              <FaTrash className="me-2" />
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
