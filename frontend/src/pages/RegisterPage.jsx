import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/contexts.js";
import { request } from "../service/api.js";
import Icon from "../components/Icon.jsx";

export default function RegisterPage() {
  const { user, checking }=useAuth();
  const [configuration,setConfiguration]=useState(null);
  const [form,setForm]=useState({username:"",password:"",confirm:"",invitationCode:""});
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);
  const pending=useRef(false);
  const navigate=useNavigate();
  useEffect(()=>{
    let active=true;
    request("/auth/registration").then(value=>{if(active)setConfiguration(value);})
      .catch(error=>{if(active)setNotice(error.message);});
    return ()=>{active=false;};
  },[]);
  if(checking)return <main className="login-page"><p role="status">Comprobando sesión…</p></main>;
  if(user)return <Navigate to="/panel" replace/>;
  function change(event){setForm({...form,[event.target.name]:event.target.value});}
  async function submit(event){
    event.preventDefault(); if(pending.current || !configuration?.enabled)return;
    if(form.password!==form.confirm){setNotice("Las contraseñas no coinciden.");return;}
    if(new TextEncoder().encode(form.password).length>72){setNotice("La contraseña supera el máximo de 72 bytes.");return;}
    pending.current=true;setBusy(true);setNotice("");
    try{
      await request("/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:form.username.trim(),password:form.password,invitationCode:form.invitationCode})});
      navigate("/login",{replace:true,state:{registered:true,username:form.username.trim().toLowerCase()}});
    }catch(error){setNotice(error.message);}
    finally{pending.current=false;setBusy(false);}
  }
  return <main className="login-page"><section className="login-card">
    <div className="sidebar-logo"><span className="sidebar-logo-icono"><Icon name="ball" size={24}/></span><span className="sidebar-logo-texto">Vóley<strong>Play</strong></span></div>
    <h1>Crear cuenta</h1><p>Regístrate para iniciar sesión en VóleyPlay.</p>
    {!configuration && !notice && <p role="status">Comprobando disponibilidad del registro…</p>}
    {configuration && !configuration.enabled && <p role="status">El registro aún no está habilitado. Contacta al administrador.</p>}
    <form onSubmit={submit}><fieldset disabled={busy || !configuration?.enabled}>
      <div className="campo"><label htmlFor="register-username">Usuario</label><input id="register-username" name="username" value={form.username} onChange={change} autoComplete="username" pattern="[A-Za-z0-9][A-Za-z0-9._-]{2,39}" minLength={3} maxLength={40} required/><small>De 3 a 40 caracteres, sin espacios.</small></div>
      <div className="campo"><label htmlFor="register-password">Contraseña</label><input id="register-password" name="password" type="password" value={form.password} onChange={change} autoComplete="new-password" minLength={12} maxLength={72} required/><small>Al menos 12 caracteres.</small></div>
      <div className="campo"><label htmlFor="register-confirm">Confirmar contraseña</label><input id="register-confirm" name="confirm" type="password" value={form.confirm} onChange={change} autoComplete="new-password" minLength={12} maxLength={72} required/></div>
      {configuration?.invitationRequired && <div className="campo"><label htmlFor="register-invitation">Código de invitación</label><input id="register-invitation" name="invitationCode" type="password" value={form.invitationCode} onChange={change} autoComplete="off" required/><small>Solicítalo al administrador del panel.</small></div>}
      <button className="btn-guardar" type="submit">{busy?"Creando cuenta…":"Crear cuenta"}<Icon name="arrow" size={18}/></button>
    </fieldset></form>
    {notice && <p role="alert" className="form-aviso error">{notice}</p>}
    <p className="auth-switch">¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link></p>
  </section></main>;
}
