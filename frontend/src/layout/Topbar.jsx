import { useState } from "react";
import LogoutModal from "../components/LogoutModal.jsx";

function Topbar() {
  const [menu, setMenu] = useState(false);
  const [cerrarSesion, setCerrarSesion] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-buscador">
        <span className="topbar-buscador-icono">🔍</span>
        <input type="text" placeholder="Buscar..." aria-label="Buscar" />
      </div>

      <div className="topbar-usuario">
        <button
          type="button"
          className="topbar-usuario-btn"
          onClick={() => setMenu(!menu)}
          aria-expanded={menu}
        >
          <span className="topbar-usuario-icono">👤</span>
          <span>Administrador</span>
          <span className="topbar-usuario-flecha">▾</span>
        </button>

        {menu && (
          <div className="topbar-menu">
            <button
              type="button"
              className="topbar-menu-item"
              onClick={() => {
                setMenu(false);
                setCerrarSesion(true);
              }}
            >
              🚪 Cerrar sesión
            </button>
          </div>
        )}
      </div>

      <LogoutModal
        abierto={cerrarSesion}
        onCancelar={() => setCerrarSesion(false)}
        onConfirmar={() => {
          setCerrarSesion(false);
          setMenu(false);
        }}
      />
    </header>
  );
}

export default Topbar;
