import { useEffect, useState } from "react";
import { obtenerCanchas } from "../service/CanchaService.jsx";
import { obtenerClientes } from "../service/ClienteService.jsx";
import { obtenerHorarios } from "../service/HorarioServise.jsx";
import { obtenerReservas } from "../service/ReservaServise.jsx";
import "../styles/Admin.css";

function nombreDe(lista, id) {
  const encontrado = lista.find((item) => item.id === id);
  return encontrado ? encontrado.nombre : `#${id}`;
}

function estadoClase(estado) {
  if (!estado) return "azul";
  const valor = String(estado).toLowerCase();
  if (valor.includes("confirm")) return "confirmada";
  if (valor.includes("pendiente")) return "pendiente";
  if (valor.includes("cancel")) return "cancelada";
  if (valor.includes("dispon")) return "disponible";
  if (valor.includes("reserv")) return "reservada";
  return "azul";
}

function HorariosReservasPage() {
  const [canchas, setCanchas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    obtenerCanchas().then(setCanchas).catch(console.error);
    obtenerClientes().then(setClientes).catch(console.error);
    obtenerHorarios().then(setHorarios).catch(console.error);
    obtenerReservas().then(setReservas).catch(console.error);
  }, []);

  function estadoCelda(idHorario, idCancha) {
    const ocupada = reservas.some(
      (r) => r.idHorario === idHorario && r.idCancha === idCancha
    );
    return ocupada ? "Reservada" : "Disponible";
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const reservasDeHoy = reservas.filter((r) => r.fechaReserva === hoy);

  return (
    <div>
      <div className="pagina-encabezado">
        <div>
          <h1>Horarios y reservas</h1>
          <p>Consulta y gestiona los horarios de las canchas.</p>
        </div>
      </div>

      <div className="tabla-caja">
        <div className="tabla-cabecera">
          <h3>Horarios de las canchas</h3>
        </div>
        <table className="tabla">
          <thead>
            <tr>
              <th>Hora</th>
              {canchas.map((cancha) => (
                <th key={cancha.id}>{cancha.nombre}</th>
              ))}
              {canchas.length === 0 && <th>Canchas</th>}
            </tr>
          </thead>
          <tbody>
            {horarios.length === 0 && (
              <tr>
                <td colSpan={canchas.length + 1} className="tabla-vacio">
                  No hay horarios registrados.
                </td>
              </tr>
            )}
            {horarios.map((horario) => (
              <tr key={horario.id}>
                <td>{horario.horaInicio} - {horario.horaFin}</td>
                {canchas.map((cancha) => {
                  const texto = estadoCelda(horario.id, cancha.id);
                  return (
                    <td key={cancha.id}>
                      <span className={`badge ${texto.toLowerCase()}`}>
                        {texto}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tabla-caja">
        <div className="tabla-cabecera">
          <h3>Reservas del día</h3>
        </div>
        <table className="tabla">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Hora</th>
              <th>Cancha</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {reservasDeHoy.length === 0 && (
              <tr>
                <td colSpan="5" className="tabla-vacio">
                  No hay reservas para hoy.
                </td>
              </tr>
            )}
            {reservasDeHoy.map((reserva) => {
              const horario = horarios.find((h) => h.id === reserva.idHorario);
              return (
                <tr key={reserva.id}>
                  <td>{nombreDe(clientes, reserva.idCliente)}</td>
                  <td>
                    {horario
                      ? `${horario.horaInicio} - ${horario.horaFin}`
                      : `#${reserva.idHorario}`}
                  </td>
                  <td>{nombreDe(canchas, reserva.idCancha)}</td>
                  <td>S/ {reserva.total}</td>
                  <td>
                    <span className={`badge ${estadoClase(reserva.estado)}`}>
                      {reserva.estado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HorariosReservasPage;
