// App.js
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect, useState, useRef } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Blockform from "./pages/Blockform";
import Floorpage from "./pages/Floorpage";
import Roomform from "./pages/Roomform";
import UpdateRoom from "./pages/ModifyRoom.jsx";
import Login from "./pages/loginform";
import ProtectedRoute from "./pages/ProtectedRoute";
import Register from "./pages/Register";
import RegisterProtect from "./pages/RegisterProtect.js";
import AdminDashboard from "./pages/dashboard/Dashboard";
import ProtectedDash from "./pages/dashboard/ProtectedDash";
import RoomsOverview from "./pages/RoomsOverview.jsx";
import Footer from "./pages/dashboard/Footer.jsx";
import Team from "./pages/dashboard/Team.jsx";
import TimetableMonday from "./pages/FloorTimetableOverview.jsx";
import FindFaculty from "./pages/FindFaculty.jsx";
import Roomspage from "./pages/Roomspage.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import SuperAdminNoticePage from "./pages/SuperAdminNoticePage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import AboutPage from "./pages/AboutPage";


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem("token"));
  const navigate = useNavigate();

  const footerRef = useRef(null);
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    const updateFooterHeight = () => {
      if (footerRef.current) {
        setFooterHeight(footerRef.current.offsetHeight);
      }
    };

    updateFooterHeight();  // Initial call
    window.addEventListener('resize', updateFooterHeight);

    return () => {
      window.removeEventListener('resize', updateFooterHeight);
    };
  }, []);

  useEffect(() => {
    const shortcutKeys = (e) => {
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        navigate("/");
      }
    };

    window.addEventListener("keydown", shortcutKeys);
    return () => {
      window.removeEventListener("keydown", shortcutKeys);
    };
  }, [navigate]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100" style={{ overflowX: 'hidden' }}>
      {/* Add padding bottom equal to footer height */}
      <div style={{ paddingBottom: `${footerHeight}px` }}>
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/jamesBond" element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/team" element={<Team />} />

          {isAuthenticated ? (
            <>
            
              <Route path="/" element={<ProtectedRoute><Homepage footerHeight={footerHeight}/></ProtectedRoute>} />
              <Route path="/aitam" element={<ProtectedRoute><Blockform /></ProtectedRoute>} />
              <Route path="/aitam/:blockname" element={<ProtectedRoute><Floorpage /></ProtectedRoute>} />
              <Route path="/aitam/:blockId/:floorname" element={<ProtectedRoute><Roomform /></ProtectedRoute>} />
              <Route path="/aitam/:blockname/:floorId/rooms" element={<ProtectedRoute><Roomspage /></ProtectedRoute>} />
              <Route path="/aitam/:blockid/:floorname/modify/:roomname" element={<ProtectedRoute><UpdateRoom /></ProtectedRoute>} />
              <Route path="/register" element={<RegisterProtect><Register /></RegisterProtect>} />
              <Route path="/dashboard" element={<ProtectedDash role="super_admin"><AdminDashboard /></ProtectedDash>} />
              <Route path="/roomsOverview" element={<ProtectedRoute><RoomsOverview /></ProtectedRoute>} />
              <Route path="/:blockname/showtimetable" element={<ProtectedRoute><TimetableMonday /></ProtectedRoute>} />
              
              <Route path="/findFaculty" element={<ProtectedRoute><FindFaculty /></ProtectedRoute>} />
              <Route path="globalNotice" element={<ProtectedRoute><SuperAdminNoticePage /></ProtectedRoute>}/>
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
    
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </div>
      <Footer ref={footerRef} />
    </div>
  );
};

export default App;