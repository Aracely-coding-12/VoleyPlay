import { useState } from "react";
import LogoutModal from "../components/LogoutModal.jsx";
import Icon from "../components/Icon.jsx";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/contexts.js";

function Topbar() {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const [menu, setMenu] = useState(false);
  const [cerrarSesion, setCerrarSesion] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-buscador">
        <Icon name="search" size={18} />
        <input type="search" placeholder="Buscar en esta sección…" aria-label="Buscar" value={params.get("q") || ""} onChange={event => {
          const next = new URLSearchParams(params);
          if (event.target.value) next.set("q", event.target.value); else next.delete("q");
          setParams(next, { replace: true });
        }} />
      </div>

      <div className="topbar-usuario">
        <button
          type="button"
          className="topbar-usuario-btn"
          onClick={() => setMenu(!menu)}
          aria-expanded={menu}
        >
          <span className="topbar-usuario-icono"><Icon name="user" size={18} /></span>
          <span>{user?.username || "Administrador"}</span>
          <Icon name="chevron" size={16} />
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
              <Icon name="logout" size={18} /> Cerrar sesión
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
