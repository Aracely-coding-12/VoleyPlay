import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/contexts.js";
import Icon from "../components/Icon.jsx";

export default function LoginPage() {
  const { user, checking, signIn, error } = useAuth();
  const location = useLocation();
  const [username, setUsername] = useState(location.state?.username || "");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  if (checking) return <div className="login-page"><p role="status">Comprobando sesión…</p></div>;
  if (user) return <Navigate to="/panel" replace />;
  async function submit(event) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setNotice("");
    try { await signIn(username.trim(), password); setPassword(""); navigate("/panel", { replace: true }); }
    catch (failure) { setNotice(failure.message); }
    finally { setBusy(false); }
  }
  return <main className="login-page"><section className="login-card">
    <div className="sidebar-logo"><span className="sidebar-logo-icono"><Icon name="ball" size={24} /></span><span className="sidebar-logo-texto">Vóley<strong>Play</strong></span></div>
    <h1>Iniciar sesión</h1><p>Accede al panel de administración.</p>
    {location.state?.registered && <p role="status" className="operation-notice ok">Cuenta creada. Ya puedes iniciar sesión.</p>}
    <form onSubmit={submit}><fieldset disabled={busy}>
      <div className="campo"><label htmlFor="username">Usuario</label><input id="username" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required /></div>
      <div className="campo"><label htmlFor="password">Contraseña</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
      <button className="btn-guardar" type="submit">{busy ? "Ingresando…" : "Entrar al panel"}<Icon name="arrow" size={18} /></button>
    </fieldset></form>{(notice || error) && <p role="alert" className="form-aviso error">{notice || error}</p>}
    <p className="auth-switch">¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link></p>
  </section></main>;
}
