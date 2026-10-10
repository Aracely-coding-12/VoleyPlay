import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import PanelProvider from "../context/PanelProvider.jsx";
import { useAuth, usePanel } from "../context/contexts.js";
function PanelContent() {
  const { loading, error, refresh } = usePanel();
  return <>{loading && <p className="operation-notice" role="status">Actualizando datos…</p>}
    {error ? <div className="operation-notice error" role="alert">{error} <button className="btn-actualizar" onClick={refresh}>Reintentar</button></div> : <Outlet />}</>;
}
export default function AdminLayout() {
  const { user, checking } = useAuth();
  if (checking) return <div className="login-page"><p role="status">Comprobando sesión…</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <PanelProvider><div className="admin-layout"><Sidebar /><div className="admin-main"><Topbar /><main className="admin-content"><PanelContent /></main></div></div></PanelProvider>;
}
