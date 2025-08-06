import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const SuperAdminNoticePage = () => {
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGlobalNotices();
  }, []);

  // ✅ Fetch all global notices
  const fetchGlobalNotices = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/globalNotice/getAll");
      setNotices(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch notices");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add a global notice
  const handleAddNotice = async () => {
    if (!newNotice.trim()) {
      return toast.warning("Notice cannot be empty");
    }

    try {
      await axios.post("http://localhost:5000/globalNotice/create", {
        message: newNotice,
        postedBy: "super_admin", // Always pass super_admin
      });
      toast.success("✅ Global notice added");
      setNewNotice("");
      fetchGlobalNotices();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to add notice");
    }
  };

  // ✅ Delete a global notice
  const handleDeleteNotice = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this notice?");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5000/globalNotice/delete/${id}`, {
        data: { postedBy: "super_admin" }, // Always pass super_admin
      });
      toast.success("🗑️ Notice deleted");
      fetchGlobalNotices();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete notice");
    }
  };

  return (
    <div className="container mt-4">
      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="text-primary"> Global Notices</h4>
        <Button variant="secondary" onClick={() => navigate("/")}>
          ⬅️ Back to Home
        </Button>
      </div>

      {/* Add Notice Input */}
      <div className="d-flex mb-3">
        <Form.Control
          type="text"
          placeholder="Enter global notice"
          value={newNotice}
          onChange={(e) => setNewNotice(e.target.value)}
          className="me-2"
        />
        <Button variant="success" onClick={handleAddNotice}>
          Add
        </Button>
      </div>

      {/* Notices List */}
      {loading ? (
        <p>Loading notices...</p>
      ) : notices.length === 0 ? (
        <p className="text-muted">No global notices available.</p>
      ) : (
        <ul className="list-group">
        {notices.map((notice) => (
            <li
            key={notice._id}
            className="list-group-item d-flex justify-content-between align-items-center"
            style={{ flexWrap: "wrap" }}
            >
            {/* Notice message and date */}
            <div
                style={{
                flex: "1 1 70%",              
                whiteSpace: "pre-wrap",       
                wordBreak: "break-word",      
                overflowWrap: "break-word",   
                }}
            >
                <strong>{notice.message}</strong>
                <div>
                <small className="text-muted">{new Date(notice.createdAt).toLocaleString()}</small>
                </div>
            </div>

            {/* Delete button */}
            <Button
                variant="outline-danger"
                size="sm"
                className="ms-2 mt-2 mt-md-0"
                style={{ flexShrink: 0 }}        // ✅ Prevents button from shrinking
                onClick={() => handleDeleteNotice(notice._id)}
            >
                🗑️ Delete
            </Button>
            </li>
        ))}
        </ul>

      )}
    </div>
  );
};

export default SuperAdminNoticePage;
