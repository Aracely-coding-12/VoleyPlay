import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import LogoutModal from "../components/LogoutModal.jsx";

const items = [
  { to: "/panel", texto: "Inicio", icono: "🏠" },
  { to: "/panel/clientes", texto: "Clientes", icono: "👥" },
  { to: "/panel/canchas", texto: "Canchas", icono: "🏐" },
  { to: "/panel/horarios", texto: "Horarios y reservas", icono: "📅" },
  { to: "/panel/pagos", texto: "Pagos", icono: "💳" },
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
        <span className="sidebar-logo-icono">🏐</span>
        <span className="sidebar-logo-texto">
          VÓLEY <strong>PLAY</strong>
        </span>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/panel"}
            className={({ isActive }) =>
              isActive ? "sidebar-link activo" : "sidebar-link"
            }
          >
            <span className="sidebar-link-icono">{item.icono}</span>
            <span className="sidebar-link-texto">{item.texto}</span>
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="sidebar-link sidebar-salir"
        onClick={() => setCerrarSesion(true)}
      >
        <span className="sidebar-link-icono">🚪</span>
        <span className="sidebar-link-texto">Cerrar sesión</span>
      </button>

      <div className="sidebar-deco" aria-hidden="true">
        🌴🏖️🌴
      </div>

      <LogoutModal
        abierto={cerrarSesion}
        onCancelar={() => setCerrarSesion(false)}
        onConfirmar={confirmarSalida}
      />
    </aside>
  );
}

export default Sidebar;
