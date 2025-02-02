import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from './pages/Homepage'
import Blockform from './pages/Blockform'
import Floorpage from './pages/Floorpage';
import Roomform from './pages/Roomform';
import ModifyRoom from './pages/ModifyRoom';

const App = () => {
  return (
    <div>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/add-block" element={<Blockform />} />
          <Route path="/get-data/:blockname" element={<Floorpage />} />
          <Route path="/get-data/:blockId/:floorname" element={<Roomform/>}/>
          <Route path="/get-data/:blockid/:floorname/modify/:roomname" element={<ModifyRoom/>}/>
        </Routes>
    </div>
  )
}

export default App
