import { useCallback, useEffect, useRef, useState } from "react";
import { PanelContext } from "./contexts.js";
import { request } from "../service/api.js";
const empty = { canchas: [], clientes: [], horarios: [], reservas: [], pagos: [] };
async function loadData() {
  const [canchas, clientes, horarios, reservas, pagos] = await Promise.all(
    ["cancha", "cliente", "horario", "reserva", "pago"].map(name => request(`/${name}`)));
  return { canchas, clientes, horarios, reservas, pagos };
}

export default function PanelProvider({ children }) {
  const [data, setData] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mounted = useRef(false);
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++sequence.current;
    if (mounted.current) { setLoading(true); setError(""); }
    try {
      const result = await loadData();
      if (mounted.current && current === sequence.current) setData(result);
    } catch (failure) {
      if (mounted.current && current === sequence.current) setError(failure.message);
    } finally {
      if (mounted.current && current === sequence.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    const current = ++sequence.current;
    loadData().then(result => { if (mounted.current && current === sequence.current) setData(result); })
      .catch(failure => { if (mounted.current && current === sequence.current) setError(failure.message); })
      .finally(() => { if (mounted.current && current === sequence.current) setLoading(false); });
    return () => { mounted.current = false; };
  }, []);
  return <PanelContext.Provider value={{ ...data, loading, error, refresh }}>{children}</PanelContext.Provider>;
}
