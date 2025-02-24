
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./loginform.css";

const Login = ({ setIsAuthenticated }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Toggle between Student & Admin
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = isAdmin ? { userId, password } : { userId }; // Admin requires password, student does not
      const res = await axios.post("http://localhost:5000/auth/login", payload);

      sessionStorage.setItem("token", res.data.token);
      // sessionStorage.setItem("role", res.data.role);
      sessionStorage.setItem("role",isAdmin?"admin":"student");
      setIsAuthenticated(true);

      navigate("/", { replace: true });
    } catch (err) {
      setError("Invalid Credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isAdmin ? "Admin Login" : "Student Login"}</h2>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          
          {isAdmin && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          <button type="submit" className="login-button">Login</button>
        </form>

        {/* Toggle between Admin and Student login */}
        <p className="toggle-login" onClick={() => {
          setIsAdmin(!isAdmin);
          
        }}>
          {isAdmin ? "Login as Student" : "Login as Admin"}
        </p>
      </div>
    </div>
  );
};

export default Login;



