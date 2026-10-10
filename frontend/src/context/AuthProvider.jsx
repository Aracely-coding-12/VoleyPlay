import { useEffect, useState } from "react";
import { AuthContext } from "./contexts.js";
import { request, login, logout } from "../service/api.js";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    request("/auth/me").then(result => { if (active) setUser(result); })
      .catch(failure => { if (active) setError(failure.message); })
      .finally(() => { if (active) setChecking(false); });
    const expire = () => { setUser(null); setError("Tu sesión expiró. Vuelve a iniciar sesión."); };
    window.addEventListener("session-expired", expire);
    return () => { active = false; window.removeEventListener("session-expired", expire); };
  }, []);
  async function signIn(username, password) {
    await login(username, password);
    setUser(await request("/auth/me")); setError("");
  }
  async function signOut() { await logout(); setUser(null); setError(""); }
  return <AuthContext.Provider value={{ user, checking, error, signIn, signOut }}>{children}</AuthContext.Provider>;
}
