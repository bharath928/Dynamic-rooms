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
    const [showPassword, setShowPassword] = useState(false);
    
    
    const navigate = useNavigate();


    useEffect(() => {
        const fetch = async () => {
            try {
                const details = await axios.get("https://dr-backend-32ec.onrender.com/block/get-data");
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
            const response = await fetch("https://dr-backend-32ec.onrender.com/auth/register", {
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
            <>
  {/* Custom Fixed Header */}
  <div
  className="container-fluid px-0 position-fixed top-0 start-0 w-100 shadow-sm"
  style={{
    zIndex: 1050,
    background: 'linear-gradient(90deg, #3767cfff 0%, #2575fc 100%)',
    borderBottom: '3px solid #0047ab',
    color: 'white',
    height: '60px' // Ensure consistent height for vertical centering
  }}
>
  <div className="d-flex justify-content-center align-items-center h-100">
    <h5 className="mb-0">Register User</h5>
  </div>
</div>


  {/* Register Form Wrapper */}
  <div
    className="register-wrapper d-flex justify-content-center align-items-center vh-100 bg-light"
    style={{ paddingTop: "80px" }} // To avoid overlap from fixed header
  >
    <div className="register-card shadow-lg p-4 bg-white rounded" style={{ width: "400px" }}>
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

        <div className="register-input mb-3 position-relative">
  <input
    type={showPassword ? "text" : "password"}
    className="form-control pe-5"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />
  <span
    className="position-absolute"
    onClick={() => setShowPassword(!showPassword)}
    style={{
      top: "50%",
      right: "15px",
      transform: "translateY(-50%)",
      cursor: "pointer",
      color: "#888",
    }}
  >
    <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
  </span>
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
            onChange={(e) => setcrole(e.target.value)}
          >
            <>
              <option value="">Select the role</option>
              <option value="admin">ADMIN</option>
            </>
          </select>
        </div>

        <div className="d-flex justify-content-between gap-2">
          <button type="submit" className="btn btn-primary flex-grow-1" disabled={loading}>
            {loading ? "Registering..." : "Register"}
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
</>


    );
};

export default Register;