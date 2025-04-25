import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedDash = ({role, children }) => {
  const token = sessionStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const data = jwtDecode(token);
    return data.role === role ? children : <Navigate to="/" replace />;
  } catch (error) {
    console.error("Invalid token:", error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedDash;