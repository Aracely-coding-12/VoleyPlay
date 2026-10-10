import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import LogoutModal from "../components/LogoutModal.jsx";
import Icon from "../components/Icon.jsx";

const items = [
  { to: "/panel", texto: "Inicio", icono: "home" },
  { to: "/panel/clientes", texto: "Clientes", icono: "users" },
  { to: "/panel/canchas", texto: "Canchas", icono: "court" },
  { to: "/panel/horarios", texto: "Horarios y reservas", icono: "calendar" },
  { to: "/panel/pagos", texto: "Pagos", icono: "card" },
];

function Sidebar() {
  const [cerrarSesion, setCerrarSesion] = useState(false);
  const navigate = useNavigate();

  function confirmarSalida() {
    setCerrarSesion(false);
    navigate("/");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icono"><Icon name="ball" size={24} /></span>
        <span className="sidebar-logo-texto">
          Vóley<strong>Play</strong>
        </span>
      </div>

      <div className="sidebar-seccion">ADMINISTRACIÓN</div>
      <nav className="sidebar-nav" aria-label="Navegación principal">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/panel"}
            title={item.texto}
            aria-label={item.texto}
            className={({ isActive }) =>
              isActive ? "sidebar-link activo" : "sidebar-link"
            }
          >
            <span className="sidebar-link-icono"><Icon name={item.icono} /></span>
            <span className="sidebar-link-texto">{item.texto}</span>
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="sidebar-link sidebar-salir"
        onClick={() => setCerrarSesion(true)}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
      >
        <span className="sidebar-link-icono"><Icon name="logout" /></span>
        <span className="sidebar-link-texto">Cerrar sesión</span>
      </button>

      <div className="sidebar-pie">VóleyPlay · Panel de gestión</div>

      <LogoutModal
        abierto={cerrarSesion}
        onCancelar={() => setCerrarSesion(false)}
        onConfirmar={confirmarSalida}
      />
    </aside>
  );
}

export default Sidebar;
