import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "bootstrap/dist/css/bootstrap.min.css";
import AOS from "aos";
import "aos/dist/aos.css";
// import "./Register.css"
 

const Register = () => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [crole, setcrole] = useState("");
    const [role, setRole] = useState("");
    const [dept, setDept] = useState("");
    const [message, setMessage] = useState("");
    const [blockNames, setBlockNames] = useState([]);
    const [loading, setLoading] = useState(false)
    
    const navigate = useNavigate();


    useEffect(() => {
        const fetch = async () => {
            try {
                const details = await axios.get("http://localhost:5000/block/get-data");
                setBlockNames(details.data);
            } catch (err) {
                alert(err.message);
            }
            const token = sessionStorage.getItem("token");
            if (token) {
                const decode = jwtDecode(token);
                setRole(decode.role);
                setDept(decode.dept);
            }
        };
        fetch();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        setLoading(true)
        try {
            const response = await fetch("http://localhost:5000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ userId, password, dept ,crole})
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("User registered successfully!");
                setTimeout(() => navigate("/"), 1000);
            } else {
                setMessage(`Error: ${data.message}`);
            }

            setTimeout(() => {
              setMessage("")
            }, 2000);

        } catch (error) {
            setMessage(error.response.data.message || "something went wrong..");
            // console.error("Error:", error);
        }finally{
          setLoading(false)
        }
    };

    return (
        <div className="register-wrapper d-flex justify-content-center align-items-center vh-100">
  <div className="register-card shadow-lg p-4" style={{ width: "400px" }}>
    <h2 className="register-title mb-4 text-center">Register User</h2>

    {message && <div className="register-message alert alert-info text-center">{message}</div>}

    <form onSubmit={handleRegister}>
      <div className="register-input mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
      </div>

      <div className="register-input mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="register-input mb-3">
        <select
          className="form-select"
          onChange={(e) => setDept(e.target.value)}
        >
          {role === "super_admin" ? (
            <>
              <option value="">Select your department</option>
              {blockNames.map((e, index) => (
                <option key={index} value={e.block_name.toLowerCase()}>
                  {e.block_name.toUpperCase()}
                </option>
              ))}
            </>
          ) : (
            <option value={dept}>{dept.toUpperCase()}</option>
          )}
        </select>
      </div>

      <div className="register-input mb-3">
        <select
          className="form-select"
          onChange={(e) => setcrole(e.target.value) }
        >
            <>
              <option value="">Select the role</option>
              <option value="admin">ADMIN</option>
              <option value="cr">CR</option>
            </>
        </select>
      </div>

      {/* <p className="register-note text-center text-muted">Register for new Admin</p> */}

      <div className="d-flex justify-content-between gap-2">
        <button type="submit" className="btn btn-primary flex-grow-1" disabled={loading}>
          {loading ? "Registering...":"Register"}
        </button>
        <button
          type="button"
          className="btn btn-danger flex-grow-1"
          onClick={() => navigate("/")}
        >
          Back
        </button>
      </div>
    </form>
  </div>
</div>

    );
};

export default Register;