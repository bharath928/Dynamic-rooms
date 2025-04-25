import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const RegisterProtect = ({ children }) => {
  const token = sessionStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const data = jwtDecode(token);
    return data.role === "student" ?  <Navigate to="/" replace />:children ;
  } catch (error) {
    console.error("Invalid token:", error);
    return <Navigate to="/login" replace />;
  }
};

export default RegisterProtect