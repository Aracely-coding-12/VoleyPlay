import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import { useAuth } from "../context/contexts.js";
export default function LogoutModal({ abierto, onCancelar, onConfirmar }) {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef(null);
  useEffect(() => {
    if (!abierto) return;
    const previous = document.activeElement;
    dialog.current?.querySelector("button")?.focus();
    return () => previous?.focus();
  }, [abierto]);
  if (!abierto) return null;
  async function confirm() {
    if (busy) return;
    setBusy(true); setError("");
    try { await signOut(); onConfirmar(); }
    catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  function keydown(event) {
    if (event.key === "Escape" && !busy) onCancelar();
    if (event.key === "Tab") {
      const buttons = [...dialog.current.querySelectorAll("button:not(:disabled)")];
      if (!buttons.length) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === buttons.at(-1)) { event.preventDefault(); buttons[0].focus(); }
    }
  }
  return <div className="modal-fondo"><div ref={dialog} className="modal-caja" role="dialog" aria-modal="true" aria-labelledby="logout-title" onKeyDown={keydown}>
    <span className="modal-icono"><Icon name="logout" size={26} /></span><h3 id="logout-title">Cerrar sesión</h3><p>¿Deseas salir del sistema?</p>
    {error && <p className="form-aviso error" role="alert">{error}</p>}
    <div className="modal-botones"><button type="button" className="btn-cancelar" disabled={busy} onClick={onCancelar}>Cancelar</button>
    <button type="button" className="btn-confirmar" disabled={busy} onClick={confirm}>{busy ? "Saliendo…" : "Cerrar sesión"}</button></div>
  </div></div>;
}
