import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Import the CSS file

const AdminDashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/details");
       
        setAdmins(response.data);
        console.log(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching admins");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  // Delete admin function
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

  if (loading) return <div>Loading admins...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div className="admin-dashboard">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate("/")}>Back to Home</button>

      <h1>Admin Dashboard</h1>

      {admins.length === 0 ? (
        <p>No admins found.</p>
      ) : (
        <div className="admin-cards-container">
          {admins.map((admin) => (
            <div key={admin._id} className="admin-card">
              <h3>Admin Id: {admin.userId}</h3>
              <h3>Department: {admin.dept}</h3>
              <button onClick={() => deleteAdmin(admin._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
