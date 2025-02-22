import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LastVisitedRoute = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const lastPath = localStorage.getItem("lastPath");
    if (lastPath && lastPath !== "/login") {
      navigate(lastPath); // ✅ Redirect to last visited page
      localStorage.removeItem("lastPath"); // ✅ Clear after redirect
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lastPath", location.pathname); // ✅ Save current page before refresh
  }, [location.pathname]);

  return children;
};

export default LastVisitedRoute;
