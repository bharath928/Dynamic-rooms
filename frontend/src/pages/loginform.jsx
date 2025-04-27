import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import AOS from "aos";
import "bootstrap-icons/font/bootstrap-icons.css";
import "aos/dist/aos.css";


const Login = ({ setIsAuthenticated }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false); // <-- New loading state
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
    setLoading(true); // <-- Start loading when submit clicked
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
      setLoading(false); // <-- Stop loading after response
    }
  };


  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="bg-white p-4 rounded shadow-lg text-center"
        data-aos="flip-up"
        data-aos-duration="1000"
        data-aos-delay="500"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        {/* Heading */}
        <h2 className="mb-3 text-dark">{isAdmin ? "Admin Login" : "Student Login"}</h2>


        {/* Error Message */}
        {error && <p className="text-danger small">{error}</p>}


        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              disabled={loading} // <-- Disable input during loading
            />
          </div>


          {/* Password Field (Only for Admin) */}
          {isAdmin && (
            <div className="mb-3 position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading} // <-- Disable during loading
              />
              <i
                className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} position-absolute`}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  color: "#6c757d",
                  pointerEvents: loading ? "none" : "auto", // <-- Disable toggle if loading
                }}
              />
            </div>
          )}


          {/* Login Button */}
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


        {/* Toggle Login Type */}
        <p
          className="mt-3 text-primary"
          style={{ cursor: loading ? "not-allowed" : "pointer" }}
          onClick={() => !loading && setIsAdmin(!isAdmin)} // <-- Prevent toggle while loading
        >
          {isAdmin ? "Login as Student" : "Login as Admin"}
        </p>
      </div>
    </div>
  );
};


export default Login;


