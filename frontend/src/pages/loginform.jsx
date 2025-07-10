import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import AOS from "aos";
import "bootstrap-icons/font/bootstrap-icons.css";
import "aos/dist/aos.css";
import "./loginform.css"; // ✅ Import the CSS

const Login = ({ setIsAuthenticated }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError("");
      }, 2000);
    }
  }, [error]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = isAdmin ? { userId, password } : { userId };
      const res = await axios.post("http://localhost:5000/auth/login", payload);

      if (isAdmin && res) {
        await axios.get(`http://localhost:5000/auth/userDetails/${userId}`);
      }

      sessionStorage.setItem("token", JSON.stringify(res.data.token));
      setIsAuthenticated(true);
      navigate("/", { replace: true });
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Enter valid RollNo");
      } else {
        setError("Server error, please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    
   <>
  {/* Marquee Banner at Top */}
  <div className="top-marquee text-white text-center py-2">
    <marquee behavior="scroll" direction="left" scrollamount="6">
      🚀 Welcome to AITAM Digital Room Management Portal — Smart, Fast, and Reliable!
    </marquee>
  </div>

  {/* Login Page Wrapper */}
  <div className="login-page-wrapper">
    <div 
      className="bg-white p-4 rounded shadow-lg text-center"
      data-aos="flip-up"
      data-aos-duration="1000"
      data-aos-delay="500"
      style={{ maxWidth: "400px", width: "100%" }}
    >
      {/* Logo */}
      <div className="mb-3">
        <img
          src="/logo2.webp"
          alt="AITAM Logo"
          className="img-fluid"
        />
      </div>

      <h2 className="mb-3 text-dark">{isAdmin ? "Admin Login" : "Student Login"}</h2>
      {error && <p className="text-danger small">{error}</p>}

      {/* Login Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-3 input-group">
          <span className="input-group-text"><i className="bi bi-person"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {isAdmin && (
          <div className="mb-3 input-group position-relative">
            <span className="input-group-text"><i className="bi bi-lock"></i></span>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <span
              className="input-group-text"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: loading ? "not-allowed" : "pointer" }}
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
            </span>
          </div>
        )}

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              &nbsp;Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>

      {/* Toggle Admin/Student */}
      <p
        className="mt-3 text-primary"
        style={{ cursor: loading ? "not-allowed" : "pointer" }}
        onClick={() => !loading && setIsAdmin(!isAdmin)}
      >
        {isAdmin ? "Login as Student" : "Login as Admin"}
      </p>
    </div>
  </div>
</>


  );
};

export default Login;
