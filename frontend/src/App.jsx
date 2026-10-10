import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./context/AuthProvider.jsx";
import AdminLayout from "./layout/AdminLayout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import CanchaPage from "./pages/CanchaPage.jsx";
import ClientePage from "./pages/ClientePage.jsx";
import HorariosReservasPage from "./pages/HorariosReservasPage.jsx";
import PagoPage from "./pages/PagoPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import "./styles/Admin.css";
export default function App() {
  return <AuthProvider><BrowserRouter><Routes>
    <Route path="/" element={<Navigate to="/panel" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/registro" element={<RegisterPage />} />
    <Route path="/panel" element={<AdminLayout />}>
      <Route index element={<DashboardPage />} />
      <Route path="canchas" element={<CanchaPage />} />
      <Route path="clientes" element={<ClientePage />} />
      <Route path="horarios" element={<HorariosReservasPage />} />
      <Route path="pagos" element={<PagoPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/panel" replace />} />
  </Routes></BrowserRouter></AuthProvider>;
}
