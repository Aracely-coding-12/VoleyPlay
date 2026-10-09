import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import CanchaPage from "./pages/CanchaPage.jsx";
import ClientePage from "./pages/ClientePage.jsx";
import HorariosReservasPage from "./pages/HorariosReservasPage.jsx";
import PagoPage from "./pages/PagoPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/panel" replace />} />

        <Route path="/panel" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="canchas" element={<CanchaPage />} />
          <Route path="clientes" element={<ClientePage />} />
          <Route path="horarios" element={<HorariosReservasPage />} />
          <Route path="pagos" element={<PagoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
