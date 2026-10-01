import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CanchaPage from './pages/CanchaPage';
import PagoPage from './pages/PagoPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<CanchaPage />} />
        <Route path="/canchas" element={<CanchaPage />} />
        <Route path="/pagos" element={<PagoPage/>} />
      </Routes>
    </Router>
  );
}

export default App;