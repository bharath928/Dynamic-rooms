import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from './pages/Homepage'
import Blockform from './pages/Blockform'
import Floorpage from './pages/Floorpage';

const App = () => {
  return (
    <div>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/add-block" element={<Blockform />} />
          <Route path="/get-data/:blockId" element={<Floorpage />} />
        </Routes>
    </div>
  )
}

export default App
