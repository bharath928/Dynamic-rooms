
// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "./loginform.css";
// // const jwt= require("jwt-decode");

// const Login = ({ setIsAuthenticated }) => {
//   const [userId, setUserId] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [isAdmin, setIsAdmin] = useState(false); // Toggle between Student & Admin
//   const navigate = useNavigate();
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = isAdmin ? { userId, password } : { userId }; // Admin requires password, student does not
//       const res = await axios.post("http://localhost:5000/auth/login", payload);

//       if(isAdmin && res  ){
//         const userCollection = await axios.get(`http://localhost:5000/auth/userDetails/${userId}`)
      
//       }

//       sessionStorage.setItem("token", JSON.stringify(res.data.token));
      
       
//       setIsAuthenticated(true);

//       navigate("/", { replace: true });
//     } catch (err) {
//       setError("Admin not found..");
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-box">
//         <h2>{isAdmin ? "Admin Login" : "Student Login"}</h2>
//         {error && <p className="error-message">{error}</p>}
        
//         <form onSubmit={handleSubmit}>
//           <input
//             type="text"
//             placeholder="User ID"
//             value={userId}
//             onChange={(e) => setUserId(e.target.value)}
//             required
//           />
          
//           {isAdmin && (
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           )}

//           <button type="submit" className="login-button">Login</button>
//         </form>

//         <p className="toggle-login" onClick={() => {
//           setIsAdmin(!isAdmin);
          
//         }}>
//           {isAdmin ? "Login as Student" : "Login as Admin"}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;





import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Paper, Switch, FormControlLabel, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const LoginContainer = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: "400px",
  padding: theme.spacing(4),
  margin: "auto",
  marginTop: theme.spacing(10),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxShadow: theme.shadows[3],
}));

const Login = ({ setIsAuthenticated }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <LoginContainer elevation={3}>
      <Typography variant="h5" gutterBottom>
        {isAdmin ? "Admin Login" : "Student Login"}
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <TextField
          label="User ID"
          variant="outlined"
          fullWidth
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          margin="normal"
        />
        
        {isAdmin && (
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            margin="normal"
          />
        )}

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </form>

      <FormControlLabel
        control={<Switch checked={isAdmin} onChange={() => setIsAdmin(!isAdmin)} />}
        label={isAdmin ? "Login as Student" : "Login as Admin"}
        sx={{ mt: 2 }}
      />
    </LoginContainer>
  );
};

export default Login;
