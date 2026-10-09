import { useEffect, useState } from "react";
import {
  obtenerClientes,
  guardarCliente,
  actualizarCliente,
  eliminarCliente,
} from "../service/ClienteService.jsx";
import "../styles/Admin.css";

const vacio = {
  nombre: "",
  apellido: "",
  dni: "",
  telefono: "",
  email: "",
};

function ClientePage() {
  const [clientes, setClientes] = useState([]);
  const [formulario, setFormulario] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [aviso, setAviso] = useState("");
  const [esError, setEsError] = useState(false);

  function cargar() {
    obtenerClientes()
      .then(setClientes)
      .catch((error) => console.error("Error:", error));
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
      if (editandoId) {
        await actualizarCliente(editandoId, formulario);
        setAviso("Cliente actualizado correctamente.");
      } else {
        await guardarCliente(formulario);
        setAviso("Cliente guardado correctamente.");
      }
      setEsError(false);
      limpiar();
      cargar();
    } catch (error) {
      console.error("Error:", error);
      setAviso("No se pudo guardar el cliente.");
      setEsError(true);
    }
  }

  function editar(cliente) {
    setFormulario({
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      dni: cliente.dni || "",
      telefono: cliente.telefono || "",
      email: cliente.email || "",
    });
    setEditandoId(cliente.id);
    setAviso("");
  }

  async function borrar(id) {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    try {
      await eliminarCliente(id);
      cargar();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div>
      <div className="pagina-encabezado">
        <div>
          <h1>Clientes</h1>
          <p>Gestiona los datos de tus clientes.</p>
        </div>
        <button type="button" className="btn-crear" onClick={limpiar}>
          + Crear cliente
        </button>
      </div>

      <div className="tabla-caja">
        <div className="tabla-cabecera">
          <h3>Lista de clientes</h3>
        </div>
        <table className="tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 && (
              <tr>
                <td colSpan="7" className="tabla-vacio">
                  No hay clientes registrados.
                </td>
              </tr>
            )}
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.nombre}</td>
                <td>{cliente.apellido}</td>
                <td>{cliente.dni}</td>
                <td>{cliente.telefono}</td>
                <td>{cliente.email}</td>
                <td>
                  <div className="acciones">
                    <button
                      type="button"
                      className="btn-accion editar"
                      onClick={() => editar(cliente)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="btn-accion eliminar"
                      onClick={() => borrar(cliente.id)}
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
        <h3>{editandoId ? "Editar cliente" : "Registrar cliente"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="campo">
              <label>Nombre</label>
              <input
                name="nombre"
                value={formulario.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="campo">
              <label>Apellido</label>
              <input
                name="apellido"
                value={formulario.apellido}
                onChange={handleChange}
                required
              />
            </div>
            <div className="campo">
              <label>DNI</label>
              <input name="dni" value={formulario.dni} onChange={handleChange} />
            </div>
            <div className="campo">
              <label>Teléfono</label>
              <input
                name="telefono"
                value={formulario.telefono}
                onChange={handleChange}
              />
            </div>
            <div className="campo">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formulario.email}
                onChange={handleChange}
              />
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

export default ClientePage;
