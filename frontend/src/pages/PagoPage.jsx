import { useEffect, useState } from "react";
import {
  obtenerPagos,
  guardarPago,
  actualizarPago,
  eliminarPago,
} from "../service/PagoServise.jsx";
import { obtenerReservas } from "../service/ReservaServise.jsx";
import { obtenerClientes } from "../service/ClienteService.jsx";
import "../styles/Admin.css";

const vacio = {
  idReserva: "",
  fechaPago: new Date().toISOString().slice(0, 10),
  monto: "",
  metodoPago: "Efectivo",
  estado: "Pagado",
};

function estadoClase(estado) {
  if (!estado) return "azul";
  const valor = String(estado).toLowerCase();
  if (valor.includes("pagad")) return "pagado";
  if (valor.includes("pendiente")) return "pendiente";
  if (valor.includes("cancel")) return "cancelada";
  return "azul";
}

function PagoPage() {
  const [pagos, setPagos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [formulario, setFormulario] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [aviso, setAviso] = useState("");
  const [esError, setEsError] = useState(false);

  function cargar() {
    obtenerPagos().then(setPagos).catch(console.error);
    obtenerReservas().then(setReservas).catch(console.error);
    obtenerClientes().then(setClientes).catch(console.error);
  }

  useEffect(cargar, []);

  function handleChange(e) {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  }

  function limpiar() {
    setFormulario(vacio);
    setEditandoId(null);
    setAviso("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const datos = {
        ...formulario,
        idReserva: Number(formulario.idReserva),
        monto: Number(formulario.monto),
      };
      if (editandoId) {
        await actualizarPago(editandoId, datos);
        setAviso("Pago actualizado correctamente.");
      } else {
        await guardarPago(datos);
        setAviso("Pago registrado correctamente.");
      }
      setEsError(false);
      limpiar();
      cargar();
    } catch (error) {
      console.error("Error:", error);
      setAviso("No se pudo guardar el pago.");
      setEsError(true);
    }
  }

  function editar(pago) {
    setFormulario({
      idReserva: pago.idReserva ?? "",
      fechaPago: pago.fechaPago || vacio.fechaPago,
      monto: pago.monto ?? "",
      metodoPago: pago.metodoPago || "Efectivo",
      estado: pago.estado || "Pagado",
    });
    setEditandoId(pago.id);
    setAviso("");
  }

  async function borrar(id) {
    if (!window.confirm("¿Eliminar este pago?")) return;
    try {
      await eliminarPago(id);
      cargar();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function clienteDe(reservaId) {
    const reserva = reservas.find((r) => r.id === Number(reservaId));
    if (!reserva) return "—";
    const cliente = clientes.find((c) => c.id === reserva.idCliente);
    return cliente ? cliente.nombre : `#${reserva.idCliente}`;
  }

  return (
    <div>
      <div className="pagina-encabezado">
        <div>
          <h1>Pagos</h1>
          <p>Consulta los pagos de las reservas.</p>
        </div>
        <button type="button" className="btn-crear" onClick={limpiar}>
          + Registrar pago
        </button>
      </div>

      <div className="tabla-caja">
        <div className="tabla-cabecera">
          <h3>Listado de pagos</h3>
        </div>
        <table className="tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Reserva</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Método</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagos.length === 0 && (
              <tr>
                <td colSpan="8" className="tabla-vacio">
                  No hay pagos registrados.
                </td>
              </tr>
            )}
            {pagos.map((pago) => (
              <tr key={pago.id}>
                <td>{pago.id}</td>
                <td>{clienteDe(pago.idReserva)}</td>
                <td>{pago.idReserva}</td>
                <td>S/ {pago.monto}</td>
                <td>{pago.fechaPago}</td>
                <td>{pago.metodoPago}</td>
                <td>
                  <span className={`badge ${estadoClase(pago.estado)}`}>
                    {pago.estado}
                  </span>
                </td>
                <td>
                  <div className="acciones">
                    <button
                      type="button"
                      className="btn-accion editar"
                      onClick={() => editar(pago)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="btn-accion eliminar"
                      onClick={() => borrar(pago.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel-formulario">
        <h3>{editandoId ? "Editar pago" : "Registrar pago"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="campo">
              <label>Reserva</label>
              <select
                name="idReserva"
                value={formulario.idReserva}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar reserva</option>
                {reservas.map((reserva) => (
                  <option key={reserva.id} value={reserva.id}>
                    Reserva #{reserva.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label>Monto</label>
              <input
                name="monto"
                type="number"
                step="0.01"
                value={formulario.monto}
                onChange={handleChange}
                required
              />
            </div>
            <div className="campo">
              <label>Fecha</label>
              <input
                name="fechaPago"
                type="date"
                value={formulario.fechaPago}
                onChange={handleChange}
                required
              />
            </div>
            <div className="campo">
              <label>Método de pago</label>
              <select
                name="metodoPago"
                value={formulario.metodoPago}
                onChange={handleChange}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Yape">Yape</option>
                <option value="Plin">Plin</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>
            <div className="campo">
              <label>Estado</label>
              <select
                name="estado"
                value={formulario.estado}
                onChange={handleChange}
              >
                <option value="Pagado">Pagado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div className="form-botones">
              <button type="submit" className="btn-guardar">
                💾 Guardar
              </button>
              <button type="button" className="btn-actualizar" onClick={limpiar}>
                🔄 Limpiar
              </button>
            </div>
          </div>
          {aviso && (
            <p className={`form-aviso ${esError ? "error" : "ok"}`}>{aviso}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default PagoPage;
