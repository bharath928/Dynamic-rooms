import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './loginform.css';

const Login = ({ setIsAuthenticated }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/auth/login", { userId, password });

      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("role", res.data.role);
      setIsAuthenticated(true); 

      navigate("/", { replace: true }); 
    } catch (err) {
      setError("Invalid Credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        {error && <p>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
