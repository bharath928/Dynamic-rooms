import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Blockform from "./pages/Blockform";
import Floorpage from "./pages/Floorpage";
import Roomform from "./pages/Roomform";
import UpdateRoom from "./pages/ModifyRoom.jsx"
import Login from "./pages/loginform";
import ProtectedRoute from "./pages/ProtectedRoute";
import Register from "./pages/Register";
import RegisterProtect from "./pages/RegisterProtect.js";
import AdminDashboard from "./pages/dashboard/Dashboard";
import ProtectedDash from "./pages/dashboard/ProtectedDash";
import RoomsOverview from "./pages/RoomsOverview.jsx";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem("token"));
  const navigate = useNavigate()

  useEffect(()=>{
    const shortcutKeys = (e)=>{
        if(e.ctrlKey && e.key=="b"){
            e.preventDefault()
            navigate("/")
        }
    }

    window.addEventListener("keydown",shortcutKeys);
    return(()=>{
        window.removeEventListener("keydown",shortcutKeys)
    })
},[])

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setIsAuthenticated(!!token); 
  }, []);

  return (
    <>
      <Routes>
      <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
      {isAuthenticated ? (
        <>
          <Route path="/" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
          <Route path="/aitam" element={<ProtectedRoute><Blockform /></ProtectedRoute>} />
          <Route path="/aitam/:blockname" element={<ProtectedRoute><Floorpage /></ProtectedRoute>} />
          <Route path="/aitam/:blockId/:floorname" element={<ProtectedRoute><Roomform /></ProtectedRoute>} />
          <Route path="/aitam/:blockid/:floorname/modify/:roomname" element={<ProtectedRoute><UpdateRoom /></ProtectedRoute>} />
          <Route path="/register" element={<RegisterProtect><Register /></RegisterProtect>} />
          <Route path="/dashboard" element={<ProtectedDash role="super_admin"><AdminDashboard /></ProtectedDash>} />
          <Route path="/roomsOverview" element={<ProtectedRoute><RoomsOverview/></ProtectedRoute>}/>
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
    </>
  );

};

export default App;