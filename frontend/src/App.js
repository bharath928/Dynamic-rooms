// import React from 'react'
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Homepage from './pages/Homepage'
// import Blockform from './pages/Blockform'
// import Floorpage from './pages/Floorpage';
// import Roomform from './pages/Roomform';
// import ModifyRoom from './pages/ModifyRoom';
// import loginform from './pages/loginform';

// const App = () => {
//   return (
//     <div>
//       <loginform/>
//         <Routes>
//           {/* <Route path="/" element={<loginform/>}/> */}
//           <Route path="/" element={<Homepage />} />
//           <Route path="/add-block" element={<Blockform />} />
//           <Route path="/get-data/:blockname" element={<Floorpage />} />
//           <Route path="/get-data/:blockId/:floorname" element={<Roomform/>}/>
//           <Route path="/get-data/:blockid/:floorname/modify/:roomname" element={<ModifyRoom/>}/>
//         </Routes>
//     </div>
//   )
// }

// export default App

import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Blockform from "./pages/Blockform";
import Floorpage from "./pages/Floorpage";
import Roomform from "./pages/Roomform";
import ModifyRoom from "./pages/ModifyRoom";
import Login from "./pages/loginform";
import ProtectedRoute from "./pages/ProtectedRoute";
import Register from "./pages/Register";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem("token"));

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setIsAuthenticated(!!token); //  Persist authentication after refresh
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
      {isAuthenticated ? (
        <>
          <Route path="/" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
          <Route path="/add-block" element={<ProtectedRoute><Blockform /></ProtectedRoute>} />
          <Route path="/get-data/:blockname" element={<ProtectedRoute><Floorpage /></ProtectedRoute>} />
          <Route path="/get-data/:blockId/:floorname" element={<ProtectedRoute><Roomform /></ProtectedRoute>} />
          <Route path="/get-data/:blockid/:floorname/modify/:roomname" element={<ProtectedRoute><ModifyRoom /></ProtectedRoute>} />
          <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
};

export default App;
